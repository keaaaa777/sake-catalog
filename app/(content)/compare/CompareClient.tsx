'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sake, PREFECTURE_SLUGS } from '@/lib/types'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { PAIRING_CATEGORIES } from '@/lib/pairing'
import { getClassificationSlug } from '@/lib/classification'
import { buildAffiliateLinks } from '@/lib/affiliate'
import { SWEET_DRY_LABELS, LIGHT_RICH_LABELS, scaleLabel } from '@/lib/tasteScale'
import SakeThumb from '@/components/SakeThumb'

interface BrewerySummary {
  name: string
  slug: string
}

const MAX_COMPARE = 3

export default function CompareClient({
  sakes,
  breweryMap,
  initialSlugs,
}: {
  sakes: Sake[]
  breweryMap: Record<string, BrewerySummary>
  initialSlugs: string[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs)

  useEffect(() => {
    const next = selectedSlugs.length > 0 ? `/compare?slugs=${selectedSlugs.join(',')}` : '/compare'
    router.replace(next, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlugs])

  const addSake = (slug: string) => {
    setSelectedSlugs((prev) => (prev.includes(slug) || prev.length >= MAX_COMPARE ? prev : [...prev, slug]))
    setQuery('')
  }

  const removeSake = (slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug))
  }

  const filtered = query
    ? sakes
        .filter((s) => !selectedSlugs.includes(s.slug))
        .filter(
          (s) =>
            s.name.includes(query) ||
            s.prefecture.includes(query) ||
            s.classification.includes(query)
        )
        .slice(0, 8)
    : []

  const selectedSakes = selectedSlugs
    .map((slug) => sakes.find((s) => s.slug === slug))
    .filter((s): s is Sake => Boolean(s))

  const rows: { label: string; render: (s: Sake) => React.ReactNode }[] = [
    {
      label: '都道府県',
      render: (s) => {
        const prefSlug = PREFECTURE_SLUGS[s.prefecture]
        return prefSlug ? <Link href={`/area/${prefSlug}`} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>{s.prefecture}</Link> : s.prefecture
      },
    },
    {
      label: '蔵元',
      render: (s) => {
        const brewery = s.breweryId ? breweryMap[s.breweryId] : undefined
        return brewery ? (
          <Link href={`/brewery/${brewery.slug}`} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>{brewery.name}</Link>
        ) : '—'
      },
    },
    {
      label: '特定名称',
      render: (s) => {
        const slug = getClassificationSlug(s.classification)
        return slug ? (
          <Link href={`/classification/${slug}`} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>{s.classification}</Link>
        ) : s.classification
      },
    },
    {
      label: '香味タイプ',
      render: (s) => {
        const flavor = FLAVOR_TYPES[s.flavorType]
        return <Link href={`/type/${s.flavorType}`} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>{flavor.label}({flavor.kana})</Link>
      },
    },
    { label: '甘辛', render: (s) => scaleLabel(SWEET_DRY_LABELS, s.sweetDry, -3, 3) },
    { label: '淡麗濃醇', render: (s) => scaleLabel(LIGHT_RICH_LABELS, s.lightRich, -3, 3) },
    { label: '精米歩合', render: (s) => (s.specs.polishing != null ? `${s.specs.polishing}%` : '—') },
    { label: '使用米', render: (s) => s.specs.rice || '—' },
    { label: 'アルコール度', render: (s) => (s.specs.abv != null ? `${s.specs.abv}%` : '—') },
    { label: '日本酒度', render: (s) => (s.specs.smv != null ? String(s.specs.smv) : '—') },
    { label: '酸度', render: (s) => (s.specs.acid != null ? String(s.specs.acid) : '—') },
    { label: 'おすすめ温度帯', render: (s) => (s.servingTemp.length > 0 ? s.servingTemp.join('、') : '—') },
    {
      label: '合う料理',
      render: (s) =>
        s.pairings.length > 0
          ? s.pairings.map((p) => PAIRING_CATEGORIES[p]?.label ?? p).join('、')
          : '—',
    },
    {
      label: '購入先',
      render: (s) => {
        const rakuten = buildAffiliateLinks(s).find((m) => m.mall === 'rakuten')
        return rakuten ? (
          <a href={rakuten.url} target="_blank" rel="sponsored nofollow noopener" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
            楽天市場で見る →
          </a>
        ) : '—'
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">銘柄を選ぶ</h2>
          <span className="panel-header__sub">{selectedSakes.length} / {MAX_COMPARE}</span>
        </div>

        {selectedSakes.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedSakes.map((s) => (
              <span
                key={s.id}
                className="content-pill content-pill--gold inline-flex items-center gap-2"
              >
                {s.name}
                <button
                  type="button"
                  aria-label={`${s.name}を比較から外す`}
                  onClick={() => removeSake(s.slug)}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {selectedSakes.length < MAX_COMPARE ? (
          <div className="relative">
            <input
              type="text"
              placeholder="銘柄名、都道府県、特定名称で検索して追加..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#030914]/80 border border-gold/30 rounded-lg px-4 py-2.5 text-sm text-washi placeholder-washi/30 focus:outline-none focus:border-gold"
            />
            {filtered.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {filtered.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addSake(s.slug)}
                    className="content-mini-card text-left w-full"
                  >
                    <SakeThumb sake={s} size={36} />
                    <div>
                      <div className="content-mini-card__name">{s.name}</div>
                      <div className="content-mini-card__meta">{s.prefecture} / {s.classification}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--mist)' }}>
            比較できるのは最大{MAX_COMPARE}本までです。外してから別の銘柄を追加できます。
          </p>
        )}
      </section>

      {selectedSakes.length < 2 ? (
        <p className="text-center text-sm" style={{ color: 'var(--mist)' }}>
          あと{2 - selectedSakes.length}本選ぶと比較表が表示されます。
        </p>
      ) : (
        <section className="content-card overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-28 shrink-0 border-b border-white/10 pb-3 text-left align-bottom" style={{ color: 'var(--mist)' }} />
                {selectedSakes.map((s) => (
                  <th key={s.id} className="border-b border-white/10 px-3 pb-3 text-left align-bottom">
                    <Link href={`/sake/${s.slug}`} className="flex flex-col items-start gap-2 hover:underline" style={{ color: 'var(--paper-white)' }}>
                      <SakeThumb sake={s} size={40} />
                      <span className="font-display text-base leading-snug">{s.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th
                    className="whitespace-nowrap border-b border-white/5 py-3 pr-3 text-left align-top text-xs font-normal"
                    style={{ color: 'var(--mist)' }}
                  >
                    {row.label}
                  </th>
                  {selectedSakes.map((s) => (
                    <td key={s.id} className="border-b border-white/5 px-3 py-3 align-top" style={{ color: 'var(--paper-white)' }}>
                      {row.render(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
