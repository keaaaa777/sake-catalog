'use client'

import { useEffect, useRef, useState } from 'react'
import { REGIONS } from '@/lib/types'
import { PREFECTURE_BY_CODE, REGION_COLORS, REGION_LABEL_OFFSET, REGION_SLUGS } from '@/lib/mapData'

const PREFECTURE_TO_REGION: Record<string, string> = Object.entries(REGIONS).reduce(
  (acc, [region, prefs]) => {
    prefs.forEach(pref => (acc[pref] = region))
    return acc
  },
  {} as Record<string, string>
)

interface JapanMapProps {
  selectedRegion: string | null
  selectedPrefecture: string | null
  onSelectRegion: (region: string) => void
  onSelectPrefecture: (prefecture: string) => void
}

export default function JapanMap({
  selectedRegion,
  selectedPrefecture,
  onSelectRegion,
  onSelectPrefecture,
}: JapanMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null)

  useEffect(() => {
    fetch('/images/japan-map.svg')
      .then(res => res.text())
      .then(setSvgMarkup)
  }, [])

  // 都道府県の塗り分け・クリック挙動の設定
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const groups = Array.from(svg.querySelectorAll<SVGGElement>('.prefecture'))

    groups.forEach(g => {
      const code = Number(g.getAttribute('data-code'))
      const prefName = PREFECTURE_BY_CODE[code]
      const region = PREFECTURE_TO_REGION[prefName]
      if (!region) return

      g.style.cursor = 'pointer'
      g.style.transition = 'fill 0.15s ease, stroke-width 0.15s ease'

      const isSelectedPref = selectedPrefecture === prefName
      const isSelectedRegion = selectedRegion === region

      if (isSelectedPref) {
        g.style.fill = REGION_COLORS[region]
        g.style.stroke = '#333333'
        g.style.strokeWidth = '2'
      } else if (!selectedRegion) {
        g.style.fill = REGION_COLORS[region]
        g.style.stroke = '#ffffff'
        g.style.strokeWidth = '1'
      } else if (isSelectedRegion) {
        g.style.fill = REGION_COLORS[region]
        g.style.stroke = '#ffffff'
        g.style.strokeWidth = '1'
        g.style.opacity = '0.55'
      } else {
        g.style.fill = '#e5e7eb'
        g.style.stroke = '#ffffff'
        g.style.strokeWidth = '1'
        g.style.opacity = '1'
      }

      if (!isSelectedPref) g.style.opacity = selectedRegion && !isSelectedRegion ? '1' : selectedRegion ? '0.55' : '1'

      const handleClick = () => {
        if (!selectedRegion || selectedRegion !== region) {
          onSelectRegion(region)
        } else {
          onSelectPrefecture(prefName)
        }
      }
      const handleEnter = () => {
        if (!isSelectedPref) g.style.opacity = '1'
      }
      const handleLeave = () => {
        if (!isSelectedPref) g.style.opacity = selectedRegion && !isSelectedRegion ? '0.55' : '1'
      }

      g.addEventListener('click', handleClick)
      g.addEventListener('mouseenter', handleEnter)
      g.addEventListener('mouseleave', handleLeave)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(g as any).__handlers = { handleClick, handleEnter, handleLeave }
    })

    return () => {
      groups.forEach(g => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlers = (g as any).__handlers
        if (!handlers) return
        g.removeEventListener('click', handlers.handleClick)
        g.removeEventListener('mouseenter', handlers.handleEnter)
        g.removeEventListener('mouseleave', handlers.handleLeave)
      })
    }
  }, [svgMarkup, selectedRegion, selectedPrefecture, onSelectRegion, onSelectPrefecture])

  // 地方名のコールアウトラベルを描画
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    svg.querySelectorAll('.region-callout').forEach(el => el.remove())

    const regionsToShow = selectedRegion ? [selectedRegion] : Object.keys(REGIONS)

    regionsToShow.forEach(region => {
      const slug = REGION_SLUGS[region]
      const members = Array.from(svg.querySelectorAll<SVGGElement>(`.${slug}`))
      if (members.length === 0) return

      const pt = svg.createSVGPoint()
      let sumX = 0
      let sumY = 0
      let count = 0

      members.forEach(el => {
        try {
          const bbox = el.getBBox()
          const ctm = el.getCTM()
          if (!ctm) return
          pt.x = bbox.x + bbox.width / 2
          pt.y = bbox.y + bbox.height / 2
          const transformed = pt.matrixTransform(ctm)
          sumX += transformed.x
          sumY += transformed.y
          count++
        } catch {
          // getBBox / getCTM can fail before layout is ready; skip silently
        }
      })

      if (count === 0) return
      const cx = sumX / count
      const cy = sumY / count
      const offset = REGION_LABEL_OFFSET[region] || { dx: 0, dy: 0 }
      const lx = cx + offset.dx
      const ly = cy + offset.dy

      const ns = 'http://www.w3.org/2000/svg'
      const g = document.createElementNS(ns, 'g')
      g.setAttribute('class', 'region-callout')
      g.style.pointerEvents = 'none'

      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', String(cx))
      line.setAttribute('y1', String(cy))
      line.setAttribute('x2', String(lx))
      line.setAttribute('y2', String(ly))
      line.setAttribute('stroke', REGION_COLORS[region])
      line.setAttribute('stroke-width', '1.5')
      g.appendChild(line)

      const dot = document.createElementNS(ns, 'circle')
      dot.setAttribute('cx', String(cx))
      dot.setAttribute('cy', String(cy))
      dot.setAttribute('r', '3')
      dot.setAttribute('fill', REGION_COLORS[region])
      g.appendChild(dot)

      const label = `${region}地方`
      const textWidth = label.length * 15 + 20
      const boxX = lx - textWidth / 2
      const boxY = ly - 14

      const rect = document.createElementNS(ns, 'rect')
      rect.setAttribute('x', String(boxX))
      rect.setAttribute('y', String(boxY))
      rect.setAttribute('width', String(textWidth))
      rect.setAttribute('height', '28')
      rect.setAttribute('rx', '6')
      rect.setAttribute('fill', '#ffffff')
      rect.setAttribute('stroke', REGION_COLORS[region])
      rect.setAttribute('stroke-width', '1.5')
      g.appendChild(rect)

      const text = document.createElementNS(ns, 'text')
      text.setAttribute('x', String(lx))
      text.setAttribute('y', String(ly + 5))
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('font-size', '15')
      text.setAttribute('font-weight', 'bold')
      text.setAttribute('fill', REGION_COLORS[region])
      text.textContent = label
      g.appendChild(text)

      svg.appendChild(g)
    })
  }, [svgMarkup, selectedRegion])

  if (!svgMarkup) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-gray-400">地図を読み込み中...</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  )
}
