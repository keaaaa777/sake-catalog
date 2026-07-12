// data/sakes.json の各銘柄について、楽天ふるさと納税の返礼品リンク候補を取得する。
// fetch-rakuten-links.js と同じ楽天商品検索APIを、
// 「{銘柄名} ふるさと納税」で検索するように拡張したもの。
// 楽天ふるさと納税の返礼品も通常の楽天市場商品として同APIで検索できるため、
// 既存のアフィリエイトIDのまま利用できる(指示書 §2-1参照)。
//
// 結果は data/furusato-candidates.json に銘柄ごと最大5候補で保存する
// (自動採用はしない。採用判定は scripts/match-mall-candidates.js で行う)。
//
// 前提: .env.local に RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_AFFILIATE_ID が
// 設定されていること。未設定のため現時点では実行できない(雛型)。
//
// 使い方: node -r dotenv/config scripts/fetch-furusato-links.js
const fs = require('fs')
const path = require('path')
const { searchRakutenItems, sleep } = require('./lib/rakuten-search')

const DATA_DIR = path.join(__dirname, '..', 'data')
const OUTPUT_FILE = path.join(DATA_DIR, 'furusato-candidates.json')

async function main() {
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const results = {}

  for (const sake of sakes) {
    const keyword = `${sake.name} ふるさと納税`
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
  console.log('返礼品が見つからなかった銘柄は furusato 未対応として scripts/match-mall-candidates.js 側でスキップされます。')
}

main()
