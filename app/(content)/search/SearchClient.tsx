'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sake } from '@/lib/types'
import SakeThumb from '@/components/SakeThumb'

export default function SearchClient({ sakes }: { sakes: Sake[] }) {
  const [query, setQuery] = useState('')

  const filtered = query
    ? sakes.filter(
        (s) =>
          s.name.includes(query) ||
          s.prefecture.includes(query) ||
          s.classification.includes(query) ||
          (s.description && s.description.includes(query))
      )
    : sakes

  return (
    <section className="content-card">
      <div className="panel-header">
        <h2 className="panel-header__title">銘柄一覧</h2>
        <span className="panel-header__sub">{filtered.length} / {sakes.length} SAKE</span>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="銘柄名、都道府県、特徴などで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#030914]/80 border border-gold/30 rounded-lg px-4 py-2.5 text-sm text-washi placeholder-washi/30 focus:outline-none focus:border-gold"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-6 text-sm" style={{ color: 'var(--mist)' }}>該当する銘柄がありません</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
              <SakeThumb sake={s} size={40} />
              <div>
                <div className="content-mini-card__name">{s.name}</div>
                <div className="content-mini-card__meta">{s.prefecture} / {s.classification}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
