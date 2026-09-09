import { getAllBreweries, getAllSakes } from '@/lib/data'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { getSakeBackground } from '@/lib/sake-backgrounds'
import type { HomeSakeSummary } from '@/lib/types'

export const revalidate = 86400

function normalizeSearchText(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('ja-JP')
}

export function GET() {
  const breweryNames = new Map(getAllBreweries().map((brewery) => [brewery.slug, brewery.name]))
  const sakes: HomeSakeSummary[] = getAllSakes().map((sake) => ({
    id: sake.id,
    slug: sake.slug,
    name: sake.name,
    prefecture: sake.prefecture,
    classification: sake.classification,
    backgroundImageUrl: getSakeBackground(sake).url,
    flavorType: sake.flavorType,
    sweetDry: sake.sweetDry,
    lightRich: sake.lightRich,
    priceRange: sake.priceRange,
    servingTemp: sake.servingTemp,
    pairings: sake.pairings,
    searchText: normalizeSearchText([
      sake.name,
      sake.nameKana,
      sake.prefecture,
      sake.classification,
      sake.breweryId ? breweryNames.get(sake.breweryId) : undefined,
      FLAVOR_TYPES[sake.flavorType].label,
      FLAVOR_TYPES[sake.flavorType].kana,
      sake.specs.rice,
      ...sake.pairings,
    ].filter(Boolean).join(' ')),
  }))

  return Response.json(sakes, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
