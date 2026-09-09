'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { PAIRING_CATEGORIES } from '@/lib/pairing'
import type { FlavorType, HomeSakeSummary } from '@/lib/types'
import FavoriteButton from '@/components/FavoriteButton'

const PAGE_SIZE = 30
const SELECT_CLASS = 'w-full rounded-lg border border-gold/25 bg-[#030914]/80 px-3 py-2.5 text-sm text-washi focus:border-gold focus:outline-none'
type SortId = 'recommended' | 'name' | 'dry' | 'sweet' | 'light' | 'rich'

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('ja-JP')
}

export default function SearchClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sakes, setSakes] = useState<HomeSakeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [flavor, setFlavor] = useState(() => searchParams.get('flavor') || '')
  const [prefecture, setPrefecture] = useState(() => searchParams.get('pref') || '')
  const [classification, setClassification] = useState(() => searchParams.get('class') || '')
  const [taste, setTaste] = useState(() => searchParams.get('taste') || '')
  const [price, setPrice] = useState(() => searchParams.get('price') || '')
  const [temperature, setTemperature] = useState(() => searchParams.get('temp') || '')
  const [pairing, setPairing] = useState(() => searchParams.get('pairing') || '')
  const [sort, setSort] = useState<SortId>(() => (searchParams.get('sort') as SortId) || 'recommended')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadSakes = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const response = await fetch('/api/sakes/search-index')
      if (!response.ok) throw new Error(`Failed to load sake index: ${response.status}`)
      setSakes(await response.json() as HomeSakeSummary[])
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSakes()
  }, [])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (flavor) params.set('flavor', flavor)
      if (prefecture) params.set('pref', prefecture)
      if (classification) params.set('class', classification)
      if (taste) params.set('taste', taste)
      if (price) params.set('price', price)
      if (temperature) params.set('temp', temperature)
      if (pairing) params.set('pairing', pairing)
      if (sort !== 'recommended') params.set('sort', sort)
      router.replace(params.size > 0 ? `${pathname}?${params}` : pathname, { scroll: false })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [classification, flavor, pairing, pathname, prefecture, price, query, router, sort, taste, temperature])

  const prefectures = useMemo(
    () => [...new Set(sakes.map((sake) => sake.prefecture))].sort((a, b) => a.localeCompare(b, 'ja')),
    [sakes]
  )
  const classifications = useMemo(
    () => [...new Set(sakes.map((sake) => sake.classification))].sort((a, b) => a.localeCompare(b, 'ja')),
    [sakes]
  )

  const filtered = useMemo(() => {
    const normalizedQuery = normalize(query.trim())
    const results = sakes.filter((sake) => {
      if (normalizedQuery && !sake.searchText.includes(normalizedQuery)) return false
      if (flavor && sake.flavorType !== flavor) return false
      if (prefecture && sake.prefecture !== prefecture) return false
      if (classification && sake.classification !== classification) return false
      if (taste === 'dry' && sake.sweetDry < 2) return false
      if (taste === 'balanced' && Math.abs(sake.sweetDry) > 1) return false
      if (taste === 'sweet' && sake.sweetDry > -2) return false
      if (price && sake.priceRange !== Number(price)) return false
      if (temperature === 'cold' && !sake.servingTemp.some((item) => /雪冷え|花冷え|涼冷え/.test(item))) return false
      if (temperature === 'room' && !sake.servingTemp.includes('常温')) return false
      if (temperature === 'warm' && !sake.servingTemp.some((item) => item.includes('燗'))) return false
      if (pairing && !sake.pairings.includes(pairing)) return false
      return true
    })
    return results.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ja')
      if (sort === 'dry') return b.sweetDry - a.sweetDry
      if (sort === 'sweet') return a.sweetDry - b.sweetDry
      if (sort === 'light') return a.lightRich - b.lightRich
      if (sort === 'rich') return b.lightRich - a.lightRich
      return 0
    })
  }, [classification, flavor, pairing, prefecture, price, query, sakes, sort, taste, temperature])

  const visible = filtered.slice(0, visibleCount)
  const hasFilters = Boolean(query || flavor || prefecture || classification || taste || price || temperature || pairing || sort !== 'recommended')
  const resetFilters = () => {
    setQuery('')
    setFlavor('')
    setPrefecture('')
    setClassification('')
    setTaste('')
    setPrice('')
    setTemperature('')
    setPairing('')
    setSort('recommended')
  }

  return (
    <section className="content-card">
      <div className="panel-header">
        <h2 className="panel-header__title">銘柄一覧</h2>
        <span className="panel-header__sub">{loading ? 'LOADING' : `${filtered.length} / ${sakes.length} SAKE`}</span>
      </div>

      <div className="mb-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-washi/70">キーワード</span>
          <input type="search" placeholder="銘柄名、酒蔵、都道府県、使用米、料理など" value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-lg border border-gold/30 bg-[#030914]/80 px-4 py-3 text-sm text-washi placeholder-washi/30 focus:border-gold focus:outline-none" />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FilterSelect label="香味タイプ" value={flavor} onChange={setFlavor}>
            <option value="">すべて</option>
            {(Object.entries(FLAVOR_TYPES) as [FlavorType, typeof FLAVOR_TYPES[FlavorType]][]).map(([id, item]) => <option key={id} value={id}>{item.label}（{item.kana}）</option>)}
          </FilterSelect>
          <FilterSelect label="都道府県" value={prefecture} onChange={setPrefecture}>
            <option value="">全国</option>
            {prefectures.map((item) => <option key={item} value={item}>{item}</option>)}
          </FilterSelect>
          <FilterSelect label="特定名称" value={classification} onChange={setClassification}>
            <option value="">すべて</option>
            {classifications.map((item) => <option key={item} value={item}>{item}</option>)}
          </FilterSelect>
          <FilterSelect label="甘辛" value={taste} onChange={setTaste}>
            <option value="">すべて</option><option value="dry">辛口</option><option value="balanced">中間</option><option value="sweet">甘口</option>
          </FilterSelect>
          <FilterSelect label="価格帯" value={price} onChange={setPrice}>
            <option value="">すべて</option><option value="1">¥</option><option value="2">¥¥</option><option value="3">¥¥¥</option><option value="4">¥¥¥¥</option>
          </FilterSelect>
          <FilterSelect label="飲用温度" value={temperature} onChange={setTemperature}>
            <option value="">すべて</option><option value="cold">冷酒</option><option value="room">常温</option><option value="warm">燗酒</option>
          </FilterSelect>
          <FilterSelect label="合う料理" value={pairing} onChange={setPairing}>
            <option value="">すべて</option>
            {Object.entries(PAIRING_CATEGORIES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
          </FilterSelect>
          <FilterSelect label="並べ替え" value={sort} onChange={(value) => setSort(value as SortId)}>
            <option value="recommended">おすすめ順</option><option value="name">名前順</option><option value="dry">辛口順</option><option value="sweet">甘口順</option><option value="light">軽快順</option><option value="rich">濃醇順</option>
          </FilterSelect>
        </div>
        {hasFilters && <button type="button" onClick={resetFilters} className="text-sm text-gold hover:underline">検索条件をすべて解除</button>}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-washi/50" role="status">銘柄データを読み込んでいます...</div>
      ) : loadError ? (
        <div className="py-12 text-center text-sm text-washi/60"><p>銘柄データを読み込めませんでした</p><button type="button" onClick={() => void loadSakes()} className="mt-3 text-gold hover:underline">再読み込み</button></div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-washi/50"><p>条件に合う銘柄がありません</p><button type="button" onClick={resetFilters} className="mt-3 text-gold hover:underline">条件を解除する</button></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visible.map((sake) => (
              <div key={sake.id} className="relative">
                <Link href={`/sake/${sake.slug}`} className="content-mini-card pr-14">
                  <span className="h-10 w-10 shrink-0 rounded-lg border border-gold/20 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(sake.backgroundImageUrl)})` }} aria-hidden="true" />
                  <div className="min-w-0"><div className="content-mini-card__name">{sake.name}</div><div className="content-mini-card__meta">{sake.prefecture} / {sake.classification} / {FLAVOR_TYPES[sake.flavorType].label}</div></div>
                </Link>
                <span className="absolute right-3 top-1/2 -translate-y-1/2"><FavoriteButton slug={sake.slug} name={sake.name} compact /></span>
              </div>
            ))}
          </div>
          <div className="mt-7 text-center">
            <p className="mb-3 text-xs text-washi/50">{visible.length}件を表示中（全{filtered.length}件）</p>
            {visible.length < filtered.length && <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-full border border-gold/40 px-7 py-2.5 text-sm text-gold transition hover:bg-gold/10">次の30件を表示</button>}
          </div>
        </>
      )}
    </section>
  )
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-washi/60">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={SELECT_CLASS}>{children}</select>
    </label>
  )
}
