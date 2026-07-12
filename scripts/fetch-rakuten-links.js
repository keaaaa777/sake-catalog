// data/sakes.json の各銘柄について、楽天商品検索APIで通常の購入リンク候補を取得する。
// 「{銘柄名} {特定名称} 720ml」で検索し、結果は data/rakuten-candidates.json に
// 銘柄ごと最大5候補で保存する(この段階では自動採用しない。
// 採用判定は scripts/match-mall-candidates.js で行う)。
//
// 前提: .env.local に RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_AFFILIATE_ID が
// 設定されていること。未設定のため現時点では実行できない(雛型)。
//
// 使い方: node -r dotenv/config scripts/fetch-rakuten-links.js
const fs = require('fs')
const path = require('path')
const { searchRakutenItems, sleep } = require('./lib/rakuten-search')

const DATA_DIR = path.join(__dirname, '..', 'data')
const OUTPUT_FILE = path.join(DATA_DIR, 'rakuten-candidates.json')

async function main() {
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const results = {}

  for (const sake of sakes) {
    const keyword = `${sake.name} ${sake.classification} 720ml`
    try {
      results[sake.slug] = {
        sakeId: sake.id,
        name: sake.name,
        keyword,
        candidates: await searchRakutenItems(keyword, { hits: 5 }),
      }
      console.log(`[ok] ${sake.name} -> ${results[sake.slug].candidates.length}件`)
    } catch (err) {
      results[sake.slug] = { sakeId: sake.id, name: sake.name, keyword, candidates: [], error: String(err) }
      console.error(`[error] ${sake.name}: ${err}`)
    }
    // レート制限対策: 1リクエストごとに1秒スリープ
    await sleep(1000)
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2) + '\n')
  console.log(`書き出し完了: ${OUTPUT_FILE}`)
}

main()
