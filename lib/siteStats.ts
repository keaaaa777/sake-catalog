import { getAllSakes, getAllBreweries } from '@/lib/data'
import { PREFECTURE_SLUGS } from '@/lib/types'
import { CLASSIFICATION_SLUGS, CLASSIFICATIONS } from '@/lib/classification'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'

export interface RankingItem {
  label: string
  value: number
  href?: string
}

// 概要数値。specsは欠損があるため、平均値は値が入っている銘柄のみで算出する。
export function getOverviewStats() {
  const sakes = getAllSakes()
  const breweries = getAllBreweries()
  const prefectures = new Set(sakes.map((s) => s.prefecture))

  const abvValues = sakes.map((s) => s.specs.abv).filter((v): v is number => v != null)
  const polishingValues = sakes.map((s) => s.specs.polishing).filter((v): v is number => v != null)
  const avg = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

  return {
    sakeCount: sakes.length,
    breweryCount: breweries.length,
    prefectureCount: prefectures.size,
    avgAbv: avg(abvValues),
    avgAbvSampleSize: abvValues.length,
    avgPolishing: avg(polishingValues),
    avgPolishingSampleSize: polishingValues.length,
  }
}

export function getPrefectureRanking(limit = 10): RankingItem[] {
  const sakes = getAllSakes()
  const counts = new Map<string, number>()
  for (const s of sakes) counts.set(s.prefecture, (counts.get(s.prefecture) ?? 0) + 1)

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([prefecture, count]) => ({
      label: prefecture,
      value: count,
      href: PREFECTURE_SLUGS[prefecture] ? `/area/${PREFECTURE_SLUGS[prefecture]}` : undefined,
    }))
}

// data/sakes.jsonのclassificationは表記ゆれがあるため、/classificationページと
// 同じCLASSIFICATION_SLUGSマッピングで束ねてから集計する。
export function getClassificationBreakdown(): RankingItem[] {
  const sakes = getAllSakes()
  const counts = new Map<string, number>()
  for (const s of sakes) {
    const slug = CLASSIFICATION_SLUGS[s.classification]
    if (!slug) continue
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => ({
      label: CLASSIFICATIONS[slug]?.label ?? slug,
      value: count,
      href: `/classification/${slug}`,
    }))
}

export function getFlavorTypeBreakdown(): (RankingItem & { color: string })[] {
  const sakes = getAllSakes()
  const counts = new Map<string, number>()
  for (const s of sakes) counts.set(s.flavorType, (counts.get(s.flavorType) ?? 0) + 1)

  return FLAVOR_TYPE_IDS.map((id) => ({
    label: `${FLAVOR_TYPES[id].label}(${FLAVOR_TYPES[id].kana})`,
    value: counts.get(id) ?? 0,
    href: `/type/${id}`,
    color: FLAVOR_TYPES[id].gradient[0],
  }))
}
