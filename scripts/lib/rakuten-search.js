// 楽天商品検索API(Ichiba Item Search)の共通呼び出しロジック。
// fetch-rakuten-links.js / fetch-furusato-links.js から共有して使う。
//
// 注意: 楽天APIは2026年にエンドポイントが app.rakuten.co.jp から
// openapi.rakuten.co.jp 系へ移行済み。実行前に下記URL・パラメータが
// 最新仕様と一致しているか公式ドキュメント(https://webservice.rakuten.co.jp/documentation/ichiba-item-search)
// を確認すること。
const ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function searchRakutenItems(keyword, { hits = 5 } = {}) {
  const appId = process.env.RAKUTEN_APP_ID
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID
  if (!appId) throw new Error('RAKUTEN_APP_ID が .env.local に設定されていません')
  if (!affiliateId || affiliateId === 'your-id-here') {
    throw new Error('RAKUTEN_AFFILIATE_ID が未設定、またはプレースホルダーのままです')
  }

  const url = new URL(ENDPOINT)
  url.searchParams.set('applicationId', appId)
  url.searchParams.set('affiliateId', affiliateId)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', String(hits))
  url.searchParams.set('formatVersion', '2')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`楽天API呼び出し失敗: ${res.status} ${res.statusText} (keyword: ${keyword})`)
  }
  const body = await res.json()

  return (body.items || []).map((item) => ({
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    affiliateUrl: item.affiliateUrl,
    itemUrl: item.itemUrl,
    mediumImageUrls: item.mediumImageUrls,
    shopName: item.shopName,
  }))
}

module.exports = { searchRakutenItems, sleep }
