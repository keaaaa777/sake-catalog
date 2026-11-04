// data/sakes.json の各銘柄について、楽天商品検索APIで通常の購入リンク候補を取得する。
// 「{銘柄名} {特定名称} 720ml」で検索し、結果は data/cache/rakuten-candidates.json に
// 銘柄ごと最大10候補で保存する(この段階では自動採用しない。
// 採用判定は scripts/match-mall-candidates.js で行う)。
//
// 前提: .env.local に RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_AFFILIATE_ID が
// 設定されていること。
//
// 使い方: node scripts/fetch-rakuten-links.js
const fs = require('fs')
const path = require('path')
const { searchRakutenItems, sleep } = require('./lib/rakuten-search')

const DATA_DIR = path.join(__dirname, '..', 'data')
const CACHE_DIR = path.join(DATA_DIR, 'cache')
const OUTPUT_FILE = path.join(CACHE_DIR, 'rakuten-candidates.json')

async function main() {
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const results = {}
  const fetchedAt = new Date().toISOString()

  for (const sake of sakes) {
    const keyword = `${sake.name} ${sake.classification} 720ml`
    try {
      results[sake.slug] = {
        sakeId: sake.id,
        name: sake.name,
        keyword,
        candidates: await searchRakutenItems(keyword, { hits: 10 }),
      }
      console.log(`[ok] ${sake.name} -> ${results[sake.slug].candidates.length}件`)
    } catch (err) {
      results[sake.slug] = { sakeId: sake.id, name: sake.name, keyword, candidates: [], error: String(err) }
      console.error(`[error] ${sake.name}: ${err}`)
    }
    // レート制限対策: 1リクエストごとに1秒スリープ
    await sleep(1000)
  }

  // 大半が失敗した結果を保存すると、価格は古いまま取得日時だけが新しくなる。
  // ここで止めてワークフローを失敗扱いにする(既存のデータは変更しない)
  const entries = Object.values(results)
  const failed = entries.filter((entry) => entry.error)
  if (failed.length > entries.length / 2) {
    console.error(`取得失敗が多いため中止します: ${failed.length}/${entries.length}件 (例: ${failed[0].error})`)
    process.exit(1)
  }

  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ fetchedAt, results }, null, 2) + '\n')
  console.log(`書き出し完了: ${OUTPUT_FILE}`)
}

main()
