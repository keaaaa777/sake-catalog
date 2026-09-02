// count-rakuten-genres.js で出した「検索ヒット件数」は、店舗がアフィリエイト
// プログラムに参加しているかを問わない全件ヒット数。実際に報酬対象となる
// 商品がどれくらいの割合かをサンプル取得して確認する調査用スクリプト。
//
// 判定方法: 商品検索APIにaffiliateIdを渡した際、返ってくるaffiliateUrlが
// アフィリエイト計測ドメイン(hb.afl.rakuten.co.jp等)を含んでいれば
// アフィリエイト対象、通常のitem.rakuten.co.jp等のURLしか返らなければ
// 対象外(非参加店舗)とみなす。
//
// 使い方: node scripts/check-rakuten-affiliate-coverage.js
const { searchRakutenItems, sleep } = require('./lib/rakuten-search')

const KEYWORDS = ['日本酒', '焼酎', 'ビール', 'ワイン', 'ウイスキー']
const SAMPLE_SIZE = 30

function isAffiliateTracked(item) {
  if (!item.affiliateUrl) return false
  return /hb\.afl\.rakuten\.co\.jp|af\.moshimo|valuecommerce|rakuten\.co\.jp\/.*\/click/.test(item.affiliateUrl)
    || item.affiliateUrl !== item.itemUrl
}

async function main() {
  console.log('=== サンプル抽出によるアフィリエイト対象率の概算 ===\n')
  for (const keyword of KEYWORDS) {
    try {
      const items = await searchRakutenItems(keyword, { hits: SAMPLE_SIZE })
      const tracked = items.filter(isAffiliateTracked)
      const rate = items.length ? (tracked.length / items.length) * 100 : 0
      console.log(`${keyword}: サンプル${items.length}件中 アフィリエイトURL確認 ${tracked.length}件 (${rate.toFixed(0)}%)`)
      if (items[0]) {
        console.log(`  例: itemUrl=${items[0].itemUrl}`)
        console.log(`      affiliateUrl=${items[0].affiliateUrl}`)
      }
    } catch (err) {
      console.error(`${keyword}: 取得失敗 (${err.message})`)
    }
    await sleep(1000)
  }
}

main()
