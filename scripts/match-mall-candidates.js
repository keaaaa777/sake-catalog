// fetch-rakuten-links.js / fetch-furusato-links.js が data/cache/ に出力した候補ファイルを
// 読み込み、「対象銘柄そのもの(単品)」か「セット商品・別スペック・関連品」かを機械的に
// 一次判定する。確信が持てるもの(単品・容量表記あり・除外ワードなし・在庫あり)だけ
// 自動採用し、それ以外はすべて review/{mall}-review.md に出力して人間の目視確認に回す
// (自信のない自動採用はしない。指示書 §1-2 準拠)。
//
// 採用結果:
//   - rakuten: data/cache/sake-offers.json に、銘柄ごと価格の安い順で最大3店舗を保存
//              (比較表示用。§1-4)。さらに data/sakes.json の affiliate[0].rakuten に
//              最安値のURLを反映する(既存のボタン導線・構造化データ用)。
//   - furusato: data/sakes.json の affiliate[0].furusato に最安値のURLを反映する
//              (返礼品は比較表示ではなく単一リンクのため)。
//
// 使い方:
//   node scripts/match-mall-candidates.js rakuten   # data/cache/rakuten-candidates.json
//   node scripts/match-mall-candidates.js furusato  # data/cache/furusato-candidates.json
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const CACHE_DIR = path.join(DATA_DIR, 'cache')
const REVIEW_DIR = path.join(__dirname, '..', 'review')

const REJECT_KEYWORDS = ['セット', '飲み比べ', 'グラス', 'ペア', '福袋', 'おつまみ', '酒器', 'ギフト券', '福箱']
const CAPACITY_PATTERN = /(720\s*ml|1800\s*ml|一升|四合)/i

function judge(sakeName, candidate) {
  if (!candidate || !candidate.itemName) return 'reject'
  const name = candidate.itemName
  if (REJECT_KEYWORDS.some((kw) => name.includes(kw))) return 'reject'
  if (!name.includes(sakeName)) return 'needs_review'
  if (!CAPACITY_PATTERN.test(name)) return 'needs_review'
  if (candidate.availability === 0) return 'needs_review'
  return 'adopt'
}

function main() {
  const mall = process.argv[2]
  if (!['rakuten', 'furusato'].includes(mall)) {
    console.error('使い方: node scripts/match-mall-candidates.js <rakuten|furusato>')
    process.exit(1)
  }

  const candidatesFile = path.join(CACHE_DIR, `${mall}-candidates.json`)
  if (!fs.existsSync(candidatesFile)) {
    console.error(`候補ファイルが見つかりません: ${candidatesFile}`)
    console.error(`先に fetch-${mall === 'rakuten' ? 'rakuten' : 'furusato'}-links.js を実行してください。`)
    process.exit(1)
  }

  const cacheFile = require(candidatesFile)
  const candidates = cacheFile.results || cacheFile // 旧フォーマット(ラップ無し)にも対応
  const fetchedAt = cacheFile.fetchedAt || new Date().toISOString()
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const sakeBySlug = new Map(sakes.map((s) => [s.slug, s]))

  let adoptedCount = 0
  const needsReview = []
  const offersBySlug = {}

  for (const [slug, entry] of Object.entries(candidates)) {
    const sake = sakeBySlug.get(slug)
    if (!sake) continue

    const judged = (entry.candidates || []).map((c) => ({ ...c, verdict: judge(entry.name, c) }))
    const adopted = judged
      .filter((c) => c.verdict === 'adopt')
      .sort((a, b) => (a.itemPrice ?? Infinity) - (b.itemPrice ?? Infinity))

    if (adopted.length > 0) {
      const cheapest = adopted[0]
      sake.affiliate[0] = sake.affiliate[0] || {}
      sake.affiliate[0][mall] = cheapest.affiliateUrl

      if (mall === 'rakuten') {
        offersBySlug[slug] = adopted.slice(0, 3).map((c) => ({
          shopName: c.shopName ?? null,
          itemName: c.itemName,
          itemPrice: c.itemPrice ?? null,
          affiliateUrl: c.affiliateUrl,
          imageUrl: c.mediumImageUrls?.[0] ?? null,
          reviewAverage: c.reviewAverage ?? null,
          reviewCount: c.reviewCount ?? null,
          availability: c.availability ?? null,
        }))
      }
      adoptedCount += 1
    } else {
      const reviewCandidates = judged.filter((c) => c.verdict !== 'reject')
      if (reviewCandidates.length > 0) {
        needsReview.push({ name: entry.name, slug, candidates: reviewCandidates })
      }
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, 'sakes.json'), JSON.stringify(sakes, null, 2) + '\n')

  if (mall === 'rakuten') {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(CACHE_DIR, 'sake-offers.json'),
      JSON.stringify({ fetchedAt, offers: offersBySlug }, null, 2) + '\n'
    )
  }

  if (!fs.existsSync(REVIEW_DIR)) fs.mkdirSync(REVIEW_DIR, { recursive: true })
  let md = `# ${mall} リンク候補 要確認リスト\n\n自動採用の確信が持てなかった銘柄です。候補を確認し、適切なURLを affiliate.${mall} (rakutenの場合はdata/cache/sake-offers.jsonも)に手動で反映してください。\n\n`
  for (const item of needsReview) {
    md += `## ${item.name} (${item.slug})\n\n`
    for (const c of item.candidates) {
      md += `- [${c.verdict}] ${c.itemName} — ${c.itemPrice ?? '価格不明'}円 — ${c.shopName ?? ''}\n  ${c.affiliateUrl ?? c.itemUrl ?? ''}\n`
    }
    md += '\n'
  }
  fs.writeFileSync(path.join(REVIEW_DIR, `${mall}-review.md`), md)

  console.log(`自動採用: ${adoptedCount}件`)
  console.log(`要確認: ${needsReview.length}件 -> review/${mall}-review.md`)
}

main()
