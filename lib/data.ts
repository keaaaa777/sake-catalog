import sakesJson from '@/data/sakes.json'
import breweriesJson from '@/data/breweries.json'
import { Sake, Brewery, FlavorType } from '@/lib/types'

export const allSakes = sakesJson as Sake[]
export const allBreweries = breweriesJson as Brewery[]

export function getAllSakes(): Sake[] {
  return allSakes
}

export function getSakeBySlug(slug: string): Sake | undefined {
  return allSakes.find((s) => s.slug === slug)
}

export function getAllBreweries(): Brewery[] {
  return allBreweries
}

export function getBreweryBySlug(slug: string): Brewery | undefined {
  return allBreweries.find((b) => b.slug === slug)
}

export function getBreweryForSake(sake: Sake): Brewery | undefined {
  return sake.breweryId ? getBreweryBySlug(sake.breweryId) : undefined
}

export function getSakesByBrewery(breweryId: string): Sake[] {
  return allSakes.filter((s) => s.breweryId === breweryId)
}

export function getSakesByPrefecture(prefecture: string): Sake[] {
  return allSakes.filter((s) => s.prefecture === prefecture)
}

export function getSakesByFlavorType(flavorType: FlavorType): Sake[] {
  return allSakes.filter((s) => s.flavorType === flavorType)
}

export function getSakesByPairing(category: string): Sake[] {
  return allSakes.filter((s) => s.pairings.includes(category))
}

export function getSakesByScene(scene: string): Sake[] {
  return allSakes.filter((s) => s.scenes.includes(scene))
}

// 実クリックデータの蓄積前段として、実データ化済みの銘柄を都道府県順で
// 「注目の日本酒」として掲載する(実際のクリック・購入数に基づくランキングではない)。
export function getFeaturedSakes(limit?: number): Sake[] {
  const sorted = [...allSakes].sort((a, b) => b.priceRange - a.priceRange || a.prefecture.localeCompare(b.prefecture, 'ja'))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getSimilarSakes(sake: Sake, limit = 4): Sake[] {
  return allSakes
    .filter((s) => s.id !== sake.id)
    .map((s) => {
      const dist = Math.hypot(
        s.sweetDry - sake.sweetDry,
        s.lightRich - sake.lightRich,
        s.taste.sweetness - sake.taste.sweetness,
        s.taste.aroma - sake.taste.aroma,
        s.taste.umami - sake.taste.umami
      )
      return { s, dist }
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((x) => x.s)
}
