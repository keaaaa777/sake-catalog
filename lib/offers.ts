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

// 価格が通常の1本(720ml前後)の値段と誤解される商品は、オファーとして扱わない。
// Product構造化データの price も実際の価格と食い違ってしまう。
// - 複数本: 「720ml×6本」「2本セット」「2本詰合せ」「ケース販売」
//   (「×1本」や「1ケース(12本)まで同梱可」のような1本売りは対象外)
// - ふるさと納税: 表示額は価格ではなく寄附額
// - 小容量を含む: 「180ml / 300ml / 720ml」のように、価格が小瓶のものになっている
const MULTI_PACK = /詰合|詰め合|\d\s*本詰|[×xX✕*]\s*([2-9]|\d{2,})\s*本|([2-9]|\d{2,})\s*本\s*(セット|組|入)|ケース販売|[×xX✕*]\s*\d*\s*ケース/
const FURUSATO = /ふるさと納税|返礼品|寄附/
const SMALL_BOTTLE = /(^|[^\d])(180|200|300|500)\s*ml/i

export function isExcludedOffer(offer: SakeOffer): boolean {
  return [MULTI_PACK, FURUSATO, SMALL_BOTTLE].some((pattern) => pattern.test(offer.itemName))
}

// 価格比較・構造化データ・/api/out の転送先はすべてこの一覧(とその index)を使う
export function getOffersForSake(slug: string): SakeOffer[] {
  const data = loadCache()
  if (!data) return []
  return (data.offers[slug] || []).filter((o) => o.availability !== 0 && !isExcludedOffer(o))
}

// 銘柄の商品写真。除外した商品でも写っているのは同じ銘柄なので、写真には使ってよい
export function getOfferImageUrl(slug: string): string | null {
  const data = loadCache()
  if (!data) return null
  return (data.offers[slug] || []).find((o) => o.imageUrl)?.imageUrl ?? null
}

export function getOffersFetchedAt(): string | null {
  return loadCache()?.fetchedAt ?? null
}
