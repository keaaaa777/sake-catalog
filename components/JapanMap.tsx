'use client'

import { useEffect, useRef, useState } from 'react'
import { REGIONS } from '@/lib/types'
import { PREFECTURE_BY_CODE, REGION_ANCHOR, REGION_COLORS, REGION_LABEL_OFFSET } from '@/lib/mapData'

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
  const prevSelectionRef = useRef<{ region: string | null; prefecture: string | null }>({
    region: null,
    prefecture: null,
  })

  useEffect(() => {
    fetch('/images/japan-map.svg')
      .then(res => res.text())
      .then(setSvgMarkup)
  }, [])

  // アニメーション用のスタイル・キーフレームをSVGに一度だけ挿入
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg || svg.querySelector('style[data-map-anim]')) return

    const ns = 'http://www.w3.org/2000/svg'
    const style = document.createElementNS(ns, 'style')
    style.setAttribute('data-map-anim', 'true')
    style.textContent = `
      .prefecture { transform-box: fill-box; transform-origin: center; }
      @keyframes pref-select-pulse {
        0% { transform: scale(1); }
        45% { transform: scale(1.06); }
        100% { transform: scale(1); }
      }
      .pref-select-pulse { animation: pref-select-pulse 0.35s ease-out; }
      @keyframes callout-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    svg.insertBefore(style, svg.firstChild)
  }, [svgMarkup])

  // 都道府県の塗り分け・クリック挙動の設定
  useEffect(() => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const prevSelection = prevSelectionRef.current
    const groups = Array.from(svg.querySelectorAll<SVGGElement>('.prefecture'))

    groups.forEach((g, index) => {
      const code = Number(g.getAttribute('data-code'))
      const prefName = PREFECTURE_BY_CODE[code]
      const region = PREFECTURE_TO_REGION[prefName]
      if (!region) return

      g.style.cursor = 'pointer'
      g.style.transition = 'fill 0.15s ease, stroke-width 0.15s ease, opacity 0.2s ease'

      const isSelectedPref = selectedPrefecture === prefName
      const isSelectedRegion = selectedRegion === region
      // ホバー解除時に戻すべき「通常時」の不透明度
      const restingOpacity = selectedRegion && isSelectedRegion ? '0.55' : '1'

      if (isSelectedPref) {
        g.style.fill = REGION_COLORS[region]
        g.style.stroke = '#333333'
        g.style.strokeWidth = '2'
        g.style.opacity = '1'
      } else if (!selectedRegion) {
        g.style.fill = REGION_COLORS[region]
        g.style.stroke = '#ffffff'
        g.style.strokeWidth = '1'
        g.style.opacity = restingOpacity
      } else if (isSelectedRegion) {
        g.style.fill = REGION_COLORS[region]
        g.style.stroke = '#ffffff'
        g.style.strokeWidth = '1'
        g.style.opacity = restingOpacity
      } else {
        g.style.fill = '#e5e7eb'
        g.style.stroke = '#ffffff'
        g.style.strokeWidth = '1'
        g.style.opacity = restingOpacity
      }

      // 選択が変わった瞬間だけパルスアニメーションを再生
      const justSelectedPref = isSelectedPref && prevSelection.prefecture !== prefName
      const justEnteredRegion =
        isSelectedRegion && prevSelection.region !== region && !selectedPrefecture

      if (justSelectedPref || justEnteredRegion) {
        g.classList.remove('pref-select-pulse')
        g.style.animationDelay = justEnteredRegion ? `${index * 25}ms` : '0ms'
        void g.getBoundingClientRect() // reflow to allow re-triggering the animation
        g.classList.add('pref-select-pulse')
        const handleAnimEnd = () => {
          g.classList.remove('pref-select-pulse')
          g.removeEventListener('animationend', handleAnimEnd)
        }
        g.addEventListener('animationend', handleAnimEnd)
      }

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
        if (!isSelectedPref) g.style.opacity = restingOpacity
      }

      g.addEventListener('click', handleClick)
      g.addEventListener('mouseenter', handleEnter)
      g.addEventListener('mouseleave', handleLeave)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(g as any).__handlers = { handleClick, handleEnter, handleLeave }
    })

    prevSelectionRef.current = { region: selectedRegion, prefecture: selectedPrefecture }

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

    regionsToShow.forEach((region, index) => {
      const anchor = REGION_ANCHOR[region]
      if (!anchor) return

      const cx = anchor.x
      const cy = anchor.y
      const offset = REGION_LABEL_OFFSET[region] || { dx: 0, dy: 0 }
      const lx = cx + offset.dx
      const ly = cy + offset.dy

      const ns = 'http://www.w3.org/2000/svg'
      const g = document.createElementNS(ns, 'g')
      g.setAttribute('class', 'region-callout')
      g.style.pointerEvents = 'none'
      g.style.animation = `callout-in 0.35s ease-out ${index * 0.05}s both`

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
