import fs from 'fs'
import path from 'path'

// data/cache/sake-offers.json (scripts/match-mall-candidates.js が生成) を読み込み、
// 銘柄ごとの楽天市場オファー(価格の安い順、最大3件)を返す。
// キャッシュファイルが無い場合(未実行/未承認)は空配列を返し、呼び出し側は
// 既存の単一リンクボタンにフォールバックする。
export interface SakeOffer {
  shopName: string | null
  itemName: string
  itemPrice: number | null
  affiliateUrl: string
  imageUrl: string | null
  reviewAverage: number | null
  reviewCount: number | null
  availability: number | null
}

interface OffersCacheFile {
  fetchedAt: string
  offers: Record<string, SakeOffer[]>
}

let cache: OffersCacheFile | null | undefined

function loadCache(): OffersCacheFile | null {
  if (cache !== undefined) return cache
  const file = path.join(process.cwd(), 'data', 'cache', 'sake-offers.json')
  if (!fs.existsSync(file)) {
    cache = null
    return cache
  }
  cache = JSON.parse(fs.readFileSync(file, 'utf-8')) as OffersCacheFile
  return cache
}

export function getOffersForSake(slug: string): SakeOffer[] {
  const data = loadCache()
  if (!data) return []
  return (data.offers[slug] || []).filter((o) => o.availability !== 0)
}

export function getOffersFetchedAt(): string | null {
  return loadCache()?.fetchedAt ?? null
}
