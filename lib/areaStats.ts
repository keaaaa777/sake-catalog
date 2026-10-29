import { getAllSakes, getAllBreweries, getSakesByPrefecture } from '@/lib/data'
import { REGIONS, PREFECTURE_SLUGS } from '@/lib/types'
import type { Brewery, FlavorType, Sake } from '@/lib/types'
import { CLASSIFICATION_SLUGS, CLASSIFICATIONS } from '@/lib/classification'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'
import { isIndexableSake } from '@/lib/indexability'
import type { RankingItem } from '@/lib/siteStats'

// 都道府県ページの「データで見る」用の集計。掲載データから算出できることだけを扱い、
// 地域の酒造りの特徴などデータにない事柄は文章化しない。

/** 平均値を表示するのに必要な最小サンプル数 */
export const MIN_SAMPLE = 5

export interface SpecAverage {
  value: number | null
  sampleSize: number
}

type SpecKey = 'polishing' | 'smv' | 'abv'

function average(sakes: Sake[], key: SpecKey): SpecAverage {
  const values = sakes.map((s) => s.specs[key]).filter((v): v is number => typeof v === 'number')
  return {
    value: values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null,
    sampleSize: values.length,
  }
}

function specAverages(sakes: Sake[]): Record<SpecKey, SpecAverage> {
  return { polishing: average(sakes, 'polishing'), smv: average(sakes, 'smv'), abv: average(sakes, 'abv') }
}

/** 「株式会社」などの法人格を除いた酒蔵名 */
export function shortBreweryName(name: string): string {
  return name.replace(/(株式会社|合名会社|合資会社|有限会社|合同会社)/g, '').trim() || name
}

export interface BreweryEntry {
  brewery: Brewery
  sakeCount: number
}

export interface PrefectureProfile {
  prefecture: string
  sakeCount: number
  breweryCount: number
  breweries: BreweryEntry[]
  averages: Record<SpecKey, SpecAverage>
  nationalAverages: Record<SpecKey, SpecAverage>
  flavorBreakdown: (RankingItem & { color: string; id: FlavorType })[]
  classificationBreakdown: RankingItem[]
  neighbors: { prefecture: string; slug: string }[]
}

export function getPrefectureProfile(prefecture: string): PrefectureProfile {
  const sakes = getSakesByPrefecture(prefecture)
  // sake.breweryId は酒蔵の slug を指す(getBreweryForSake と同じ)
  const sakeCountByBrewery = new Map<string, number>()
  for (const s of sakes) {
    if (s.breweryId) sakeCountByBrewery.set(s.breweryId, (sakeCountByBrewery.get(s.breweryId) ?? 0) + 1)
  }
  const breweries = getAllBreweries()
    .filter((b) => b.prefecture === prefecture)
    .map((brewery) => ({ brewery, sakeCount: sakeCountByBrewery.get(brewery.slug) ?? 0 }))
    .sort((a, b) => b.sakeCount - a.sakeCount || a.brewery.name.localeCompare(b.brewery.name, 'ja'))

  const flavorCounts = new Map<FlavorType, number>()
  for (const s of sakes) flavorCounts.set(s.flavorType, (flavorCounts.get(s.flavorType) ?? 0) + 1)
  const flavorBreakdown = FLAVOR_TYPE_IDS.map((id) => ({
    id,
    label: `${FLAVOR_TYPES[id].label}(${FLAVOR_TYPES[id].kana})`,
    value: flavorCounts.get(id) ?? 0,
    href: `/type/${id}`,
    color: FLAVOR_TYPES[id].gradient[0],
  })).filter((f) => f.value > 0)

  const classCounts = new Map<string, number>()
  for (const s of sakes) {
    const slug = CLASSIFICATION_SLUGS[s.classification]
    if (slug) classCounts.set(slug, (classCounts.get(slug) ?? 0) + 1)
  }
  const classificationBreakdown = [...classCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug, value]) => ({ label: CLASSIFICATIONS[slug]?.label ?? slug, value, href: `/classification/${slug}` }))

  const region = Object.entries(REGIONS).find(([, prefs]) => (prefs as string[]).includes(prefecture))
  const neighbors = (region ? (region[1] as string[]) : [])
    .filter((p) => p !== prefecture && PREFECTURE_SLUGS[p] && getSakesByPrefecture(p).some(isIndexableSake))
    .map((p) => ({ prefecture: p, slug: PREFECTURE_SLUGS[p] }))

  return {
    prefecture,
    sakeCount: sakes.length,
    breweryCount: breweries.length,
    breweries,
    averages: specAverages(sakes),
    nationalAverages: specAverages(getAllSakes()),
    flavorBreakdown,
    classificationBreakdown,
    neighbors,
  }
}

/** 掲載データの傾向を説明する導入文。サンプルが少ない項目には触れない。 */
export function describePrefectureProfile(p: PrefectureProfile): string {
  if (p.sakeCount === 0) return ''
  const sentences = [
    `雫 SAKE SELECTでは、${p.prefecture}の酒蔵${p.breweryCount}蔵が醸す日本酒${p.sakeCount}銘柄を掲載しています。`,
  ]

  if (p.sakeCount >= MIN_SAMPLE) {
    const [topFlavor] = [...p.flavorBreakdown].sort((a, b) => b.value - a.value)
    const [topClass] = p.classificationBreakdown
    const parts: string[] = []
    if (topFlavor) {
      parts.push(`味わいタイプでは「${FLAVOR_TYPES[topFlavor.id].label}」が${Math.round((topFlavor.value / p.sakeCount) * 100)}%と最も多く`)
    }
    if (topClass) parts.push(`特定名称では${topClass.label}が${topClass.value}銘柄で中心です`)
    if (parts.length > 0) sentences.push(`掲載銘柄を見ると、${parts.join('、')}。`)
  }

  const smv = p.averages.smv
  const national = p.nationalAverages.smv
  if (smv.value !== null && national.value !== null && smv.sampleSize >= MIN_SAMPLE) {
    const diff = smv.value - national.value
    const tendency = diff >= 1 ? 'やや辛口寄り' : diff <= -1 ? 'やや甘口寄り' : '全体と同程度'
    sentences.push(
      `日本酒度の平均は${formatSigned(smv.value)}(掲載銘柄全体の平均は${formatSigned(national.value)})で、数値の上では${tendency}の傾向です。`
    )
  }

  return sentences.join('')
}

export function formatSigned(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}`
}
