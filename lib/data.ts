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

function informationScore(sake: Sake): number {
  const specCount = Object.values(sake.specs).filter((value) => value != null && value !== '').length
  const hasUsableImage = Boolean(sake.imageUrl && sake.imageUrl !== '🍶')
  const hasPurchaseLink = sake.affiliate.some((links) => Object.values(links).some(Boolean))

  return (
    specCount * 2
    + Math.min(sake.description.length / 50, 4)
    + Math.min(sake.servingTemp.length, 3)
    + Math.min(sake.pairings.length, 3)
    + (hasPurchaseLink ? 2 : 0)
    + (hasUsableImage ? 2 : 0)
    + (sake.isRealData ? 1 : 0)
  )
}

// 順位ではなく、情報の充実度を基礎に、4つの香味タイプと産地の偏りを
// 抑えて比較しやすい銘柄を選ぶ。売上・報酬額は選定に使用しない。
export function getFeaturedSakes(limit = 24): Sake[] {
  const flavorOrder: FlavorType[] = ['kaori', 'sou', 'jun', 'juku']
  const candidates = [...allSakes].sort(
    (a, b) => informationScore(b) - informationScore(a) || a.name.localeCompare(b.name, 'ja')
  )
  const selected: Sake[] = []
  const selectedIds = new Set<string>()
  const usedPrefectures = new Set<string>()

  while (selected.length < Math.min(limit, candidates.length)) {
    const flavorType = flavorOrder[selected.length % flavorOrder.length]
    const sameFlavor = candidates.filter((sake) => sake.flavorType === flavorType && !selectedIds.has(sake.id))
    const next = sameFlavor.find((sake) => !usedPrefectures.has(sake.prefecture)) ?? sameFlavor[0]
      ?? candidates.find((sake) => !selectedIds.has(sake.id))

    if (!next) break
    selected.push(next)
    selectedIds.add(next.id)
    usedPrefectures.add(next.prefecture)
  }

  return selected
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
