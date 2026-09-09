'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, Scale, Trash2 } from 'lucide-react'
import type { HomeSakeSummary } from '@/lib/types'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { useFavorites } from '@/lib/useFavorites'

const MAX_COMPARE = 3

export default function FavoritesClient() {
  const { favoriteSlugs, toggleFavorite, clearFavorites } = useFavorites()
  const [sakes, setSakes] = useState<HomeSakeSummary[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    fetch('/api/sakes/search-index')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load sake index')
        return response.json() as Promise<HomeSakeSummary[]>
      })
      .then(setSakes)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => setSelected((current) => current.filter((slug) => favoriteSlugs.includes(slug))), [favoriteSlugs])

  const favorites = useMemo(() => {
    const bySlug = new Map(sakes.map((sake) => [sake.slug, sake]))
    return favoriteSlugs.map((slug) => bySlug.get(slug)).filter((sake): sake is HomeSakeSummary => Boolean(sake))
  }, [favoriteSlugs, sakes])

  const toggleCompare = (slug: string) => setSelected((current) =>
    current.includes(slug) ? current.filter((item) => item !== slug) : current.length < MAX_COMPARE ? [...current, slug] : current
  )

  if (loading) return <div className="content-card py-12 text-center text-sm text-washi/50" role="status">お気に入りを読み込んでいます…</div>

  if (loadError) return <div className="content-card py-12 text-center text-sm text-washi/60">お気に入りを読み込めませんでした。時間をおいて再度お試しください。</div>

  if (favorites.length === 0) return (
    <section className="content-card py-14 text-center">
      <Heart className="mx-auto mb-4 h-8 w-8 text-gold/60" aria-hidden="true" />
      <h2 className="text-lg text-washi">お気に入りはまだありません</h2>
      <p className="mt-2 text-sm text-washi/55">銘柄ページや検索結果のハートから保存できます。</p>
      <Link href="/search" className="mt-6 inline-block rounded-full border border-gold/40 px-6 py-2.5 text-sm text-gold hover:bg-gold/10">日本酒を探す</Link>
    </section>
  )

  return (
    <section className="content-card">
      <div className="panel-header">
        <h2 className="panel-header__title">保存した銘柄</h2>
        <span className="panel-header__sub">{favorites.length} SAKE</span>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-washi/60">比較する銘柄を選択（{selected.length} / {MAX_COMPARE}）</p>
        <button type="button" onClick={clearFavorites} className="inline-flex items-center gap-1.5 text-washi/50 hover:text-washi"><Trash2 className="h-3.5 w-3.5" />すべて削除</button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {favorites.map((sake) => {
          const checked = selected.includes(sake.slug)
          const disabled = !checked && selected.length >= MAX_COMPARE
          return (
            <article key={sake.slug} className="relative rounded-xl border border-gold/20 bg-[#07101d]/75 p-3 pr-12">
              <Link href={`/sake/${sake.slug}`} className="flex items-center gap-3">
                <span className="h-12 w-12 shrink-0 rounded-lg border border-gold/20 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(sake.backgroundImageUrl)})` }} aria-hidden="true" />
                <span className="min-w-0"><span className="block text-washi">{sake.name}</span><span className="block truncate text-xs text-washi/50">{sake.prefecture} / {sake.classification} / {FLAVOR_TYPES[sake.flavorType].label}</span></span>
              </Link>
              <button type="button" onClick={() => toggleFavorite(sake.slug)} className="absolute right-3 top-3 text-gold" aria-label={`${sake.name}をお気に入りから削除`}><Heart className="h-5 w-5 fill-current" /></button>
              <label className={`mt-3 flex items-center gap-2 border-t border-gold/10 pt-3 text-xs ${disabled ? 'cursor-not-allowed text-washi/25' : 'cursor-pointer text-washi/65'}`}>
                <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleCompare(sake.slug)} className="accent-[#c9a45c]" />比較に追加
              </label>
            </article>
          )
        })}
      </div>
      <div className="sticky bottom-4 mt-6 text-center">
        <Link href={selected.length >= 2 ? `/compare?slugs=${selected.join(',')}` : '#'} aria-disabled={selected.length < 2} className={`inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm shadow-lg ${selected.length >= 2 ? 'bg-gold text-[#07101d]' : 'pointer-events-none bg-washi/10 text-washi/35'}`}><Scale className="h-4 w-4" />選んだ{selected.length}本を比較する</Link>
      </div>
    </section>
  )
}
