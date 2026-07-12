// fetch-rakuten-links.js / fetch-furusato-links.js が出力した候補ファイルを読み込み、
// 「対象銘柄そのもの(単品)」か「セット商品・別スペック・関連品」かを機械的に一次判定する。
// 確信が持てるもの(単品・容量表記あり・除外ワードなし)だけ affiliate.{mall} に自動採用し、
// それ以外はすべて review/{mall}-review-list.md に出力して人間(またはClaude Codeとの
// 対話セッション)の目視確認に回す。自信のない自動採用はしない(指示書 §2-3準拠)。
//
// 使い方:
//   node scripts/match-mall-candidates.js rakuten   # data/rakuten-candidates.json → affiliate.rakuten
//   node scripts/match-mall-candidates.js furusato  # data/furusato-candidates.json → affiliate.furusato
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const REVIEW_DIR = path.join(__dirname, '..', 'review')

const REJECT_KEYWORDS = ['セット', '飲み比べ', 'グラス', 'ペア', '福袋', 'おつまみ', '酒器', 'ギフト券']
const CAPACITY_PATTERN = /(720\s*ml|1800\s*ml|一升|四合)/i

function judge(sakeName, candidate) {
  if (!candidate || !candidate.itemName) return 'reject'
  const name = candidate.itemName
  if (REJECT_KEYWORDS.some((kw) => name.includes(kw))) return 'reject'
  if (!name.includes(sakeName)) return 'needs_review'
  if (!CAPACITY_PATTERN.test(name)) return 'needs_review'
  return 'adopt'
}

function main() {
  const mall = process.argv[2]
  if (!['rakuten', 'furusato'].includes(mall)) {
    console.error('使い方: node scripts/match-mall-candidates.js <rakuten|furusato>')
    process.exit(1)
  }

  const candidatesFile = path.join(DATA_DIR, `${mall}-candidates.json`)
  if (!fs.existsSync(candidatesFile)) {
    console.error(`候補ファイルが見つかりません: ${candidatesFile}`)
    console.error(`先に fetch-${mall === 'rakuten' ? 'rakuten' : 'furusato'}-links.js を実行してください。`)
    process.exit(1)
  }

  const candidates = require(candidatesFile)
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const sakeBySlug = new Map(sakes.map((s) => [s.slug, s]))

  let adoptedCount = 0
  const needsReview = []

  for (const [slug, entry] of Object.entries(candidates)) {
    const sake = sakeBySlug.get(slug)
    if (!sake) continue

    const judged = (entry.candidates || []).map((c) => ({ ...c, verdict: judge(entry.name, c) }))
    const adopted = judged.find((c) => c.verdict === 'adopt')

    if (adopted) {
      sake.affiliate[0] = sake.affiliate[0] || {}
      sake.affiliate[0][mall] = adopted.affiliateUrl
      adoptedCount += 1
    } else {
      const reviewCandidates = judged.filter((c) => c.verdict !== 'reject')
      if (reviewCandidates.length > 0) {
        needsReview.push({ name: entry.name, slug, candidates: reviewCandidates })
      }
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, 'sakes.json'), JSON.stringify(sakes, null, 2) + '\n')

  if (!fs.existsSync(REVIEW_DIR)) fs.mkdirSync(REVIEW_DIR, { recursive: true })
  let md = `# ${mall} リンク候補 要確認リスト\n\n自動採用の確信が持てなかった銘柄です。候補を確認し、適切なURLを affiliate.${mall} に手動で設定してください。\n\n`
  for (const item of needsReview) {
    md += `## ${item.name} (${item.slug})\n\n`
    for (const c of item.candidates) {
      md += `- ${c.itemName} — ${c.itemPrice ?? '価格不明'}円 — ${c.shopName ?? ''}\n  ${c.affiliateUrl ?? c.itemUrl ?? ''}\n`
    }
    md += '\n'
  }
  fs.writeFileSync(path.join(REVIEW_DIR, `${mall}-review-list.md`), md)

  console.log(`自動採用: ${adoptedCount}件`)
  console.log(`要確認: ${needsReview.length}件 -> review/${mall}-review-list.md`)
}

main()
