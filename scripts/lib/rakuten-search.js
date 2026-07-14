// 楽天商品検索API(Ichiba Item Search)の共通呼び出しロジック。
// fetch-rakuten-links.js / fetch-furusato-links.js から共有して使う。
//
// 注意: 楽天APIは2026年にエンドポイントが app.rakuten.co.jp から
// openapi.rakuten.co.jp 系へ移行済み。実行前に下記URL・パラメータが
// 最新仕様と一致しているか公式ドキュメント(https://webservice.rakuten.co.jp/documentation/ichiba-item-search)
// を確認すること。
const ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701'

// 新エンドポイントは Origin/Referer ヘッダーから、楽天アフィリエイト管理画面に
// 登録した「掲載サイトURL」であることを検証する(未設定だと
// REQUEST_CONTEXT_BODY_HTTP_REFERRER_MISSING で403になる)。
// 必ず実際に登録した自サイトのURLを使うこと(他ドメインへのなりすましは
// 楽天の規約違反になるため行わない)。カスタムドメインに切り替えたら
// RAKUTEN_REGISTERED_SITE_URL を新ドメインに更新すること(README参照)。
const REGISTERED_SITE_URL = process.env.RAKUTEN_REGISTERED_SITE_URL || 'https://sake-catalog.vercel.app/'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function searchRakutenItems(keyword, { hits = 5 } = {}) {
  const appId = process.env.RAKUTEN_APP_ID
  const accessKey = process.env.RAKUTEN_ACCESS_KEY
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID
  if (!appId) throw new Error('RAKUTEN_APP_ID が .env.local に設定されていません')
  if (!accessKey) throw new Error('RAKUTEN_ACCESS_KEY が .env.local に設定されていません')
  if (!affiliateId || affiliateId === 'your-id-here') {
    throw new Error('RAKUTEN_AFFILIATE_ID が未設定、またはプレースホルダーのままです')
  }

  const url = new URL(ENDPOINT)
  url.searchParams.set('applicationId', appId)
  url.searchParams.set('accessKey', accessKey)
  url.searchParams.set('affiliateId', affiliateId)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', String(hits))
  url.searchParams.set('formatVersion', '2')

  const res = await fetch(url.toString(), {
    headers: {
      Referer: REGISTERED_SITE_URL,
      Origin: REGISTERED_SITE_URL.replace(/\/$/, ''),
    },
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`楽天API呼び出し失敗: ${res.status} ${res.statusText} (keyword: ${keyword}) ${errBody}`)
  }
  const body = await res.json()

  return (body.Items || []).map((item) => ({
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    affiliateUrl: item.affiliateUrl,
    itemUrl: item.itemUrl,
    mediumImageUrls: item.mediumImageUrls,
    shopName: item.shopName,
    reviewAverage: item.reviewAverage,
    reviewCount: item.reviewCount,
    availability: item.availability,
  }))
}

module.exports = { searchRakutenItems, sleep }
