// 前回の検索で候補ゼロだった銘柄だけを、特定名称を外した短い検索語で再検索する。
// 通常の楽天商品は「{銘柄名} 720ml」、返礼品は検索結果を混在させないため
// 「{銘柄名} 720ml ふるさと納税」を使い、結果ゼロの場合のみ1800mlも試す。
//
// 使い方:
//   node scripts/retry-not-found-links.js rakuten
//   node scripts/retry-not-found-links.js furusato
const fs = require('fs')
const path = require('path')
const { searchRakutenItems, sleep } = require('./lib/rakuten-search')

const DATA_DIR = path.join(__dirname, '..', 'data')
const CACHE_DIR = path.join(DATA_DIR, 'cache')

async function main() {
  const mall = process.argv[2]
  if (!['rakuten', 'furusato'].includes(mall)) {
    console.error('使い方: node scripts/retry-not-found-links.js <rakuten|furusato>')
    process.exit(1)
  }

  const source = require(path.join(CACHE_DIR, `${mall}-not-found.json`))
  const results = {}
  const fetchedAt = new Date().toISOString()

  for (const sake of source.sakes) {
    const suffix = mall === 'furusato' ? ' ふるさと納税' : ''
    const keywords = [`${sake.name} 720ml${suffix}`, `${sake.name} 1800ml${suffix}`]
    let candidates = []
    let keyword = keywords[0]
    let error

    try {
      candidates = await searchRakutenItems(keyword, { hits: 10 })
      console.log(`[${mall}] ${sake.name} / ${keyword} -> ${candidates.length}件`)
      await sleep(1000)

      if (candidates.length === 0) {
        keyword = keywords[1]
        candidates = await searchRakutenItems(keyword, { hits: 10 })
        console.log(`[${mall}] ${sake.name} / ${keyword} -> ${candidates.length}件`)
        await sleep(1000)
      }
    } catch (err) {
      error = String(err)
      console.error(`[error] ${sake.name}: ${error}`)
    }

    results[sake.slug] = {
      sakeId: sake.id,
      name: sake.name,
      classification: sake.classification,
      keyword,
      candidates,
      ...(error ? { error } : {}),
    }
  }

  const output = path.join(CACHE_DIR, `${mall}-retry-candidates.json`)
  fs.writeFileSync(output, JSON.stringify({ fetchedAt, sourceCount: source.count, results }, null, 2) + '\n')
  console.log(`書き出し完了: ${output}`)
}

main()
