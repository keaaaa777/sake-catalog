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

// 「720ml×6本」「2本セット」「ケース販売」などの複数本の商品。価格が1本の値段と誤解されるうえ、
// Product構造化データの price も実際の1本の価格と食い違うため、オファーとしては扱わない。
// 「×1本」や「1ケース(12本)まで同梱可」のような1本売りの商品は対象外。
const MULTI_PACK = /[×xX✕*]\s*([2-9]|\d{2,})\s*本|([2-9]|\d{2,})\s*本\s*(セット|組|入)|ケース販売|[×xX✕*]\s*\d*\s*ケース/

export function isMultiPackOffer(offer: SakeOffer): boolean {
  return MULTI_PACK.test(offer.itemName)
}

// 価格比較・構造化データ・/api/out の転送先はすべてこの一覧(とその index)を使う
export function getOffersForSake(slug: string): SakeOffer[] {
  const data = loadCache()
  if (!data) return []
  return (data.offers[slug] || []).filter((o) => o.availability !== 0 && !isMultiPackOffer(o))
}

// 銘柄の商品写真。複数本セットの商品でも写っているのは同じ銘柄なので、写真には使ってよい
export function getOfferImageUrl(slug: string): string | null {
  const data = loadCache()
  if (!data) return null
  return (data.offers[slug] || []).find((o) => o.imageUrl)?.imageUrl ?? null
}

export function getOffersFetchedAt(): string | null {
  return loadCache()?.fetchedAt ?? null
}
