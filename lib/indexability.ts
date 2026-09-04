import type { Brewery, Sake } from '@/lib/types'

export interface IndexabilityResult {
  indexable: boolean
  reasons: string[]
}

function presentSpecCount(sake: Sake): number {
  return Object.values(sake.specs).filter(
    (value) => value !== null && value !== undefined && value !== ''
  ).length
}

export function getSakeIndexability(sake: Sake): IndexabilityResult {
  const reasons: string[] = []

  if (sake.isRealData === false) reasons.push('not-real-data')
  if (sake.description.trim().length < 60) reasons.push('short-description')
  if (presentSpecCount(sake) < 2) reasons.push('insufficient-specs')
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
  linkedSakeCount: number
): IndexabilityResult {
  const reasons: string[] = []

  if (brewery.isRealData === false) reasons.push('not-real-data')
  if (brewery.description.trim().length < 30) reasons.push('short-description')
  if (linkedSakeCount === 0) reasons.push('no-linked-sake')

  return { indexable: reasons.length === 0, reasons }
}

export function isIndexableBrewery(brewery: Brewery, linkedSakeCount: number): boolean {
  return getBreweryIndexability(brewery, linkedSakeCount).indexable
}
