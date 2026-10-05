import type { Brewery, Sake } from '@/lib/types'

export interface IndexabilityResult {
  indexable: boolean
  reasons: string[]
}

/**
 * サイトマップ/インデックスの公開段階(環境変数 SITEMAP_PHASE)。
 * 1: 主要ハブのみ / 2: + 蔵元・日本酒(厳格基準) / 3: + 薄めのページ(基準を緩和)
 */
export const SITEMAP_PHASE: 1 | 2 | 3 = (() => {
  const n = Number(process.env.SITEMAP_PHASE)
  return n === 2 || n === 3 ? n : 1
})()

const LOOSE = SITEMAP_PHASE === 3

function presentSpecCount(sake: Sake): number {
  return Object.values(sake.specs).filter(
    (value) => value !== null && value !== undefined && value !== ''
  ).length
}

export function getSakeIndexability(sake: Sake): IndexabilityResult {
  const reasons: string[] = []

  if (sake.isRealData === false) reasons.push('not-real-data')
  if (sake.description.trim().length < (LOOSE ? 60 : 100)) reasons.push('short-description')
  if (presentSpecCount(sake) < (LOOSE ? 2 : 3)) reasons.push('insufficient-specs')
  if (!LOOSE && (!sake.sources || sake.sources.length === 0)) reasons.push('missing-sources')
  if (sake.servingTemp.length === 0) reasons.push('missing-serving-temperature')
  if (sake.pairings.length === 0) reasons.push('missing-pairings')
  if (!sake.breweryId) reasons.push('missing-brewery')

  return { indexable: reasons.length === 0, reasons }
}

export function isIndexableSake(sake: Sake): boolean {
  return getSakeIndexability(sake).indexable
}

export function getBreweryIndexability(
  brewery: Brewery,
  linkedIndexableSakeCount: number
): IndexabilityResult {
  const reasons: string[] = []

  if (brewery.isRealData === false) reasons.push('not-real-data')
  if (brewery.description.trim().length < 30) reasons.push('short-description')
  if (linkedIndexableSakeCount === 0) reasons.push('no-linked-sake')
  if (!LOOSE && (!brewery.sources || brewery.sources.length === 0)) reasons.push('missing-sources')

  return { indexable: reasons.length === 0, reasons }
}

export function isIndexableBrewery(brewery: Brewery, linkedIndexableSakeCount: number): boolean {
  return getBreweryIndexability(brewery, linkedIndexableSakeCount).indexable
}
