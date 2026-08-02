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

// 2026-08-02取得分の review/*.md を目視確認した結果。
// 候補順は再検索で変わるため、取得時刻が一致する場合にだけ適用する。
const REVIEWED_FETCHED_AT = {
  rakuten: '2026-08-02T07:32:39.362Z',
  furusato: '2026-08-02T07:37:03.644Z',
}
const REVIEWED_SELECTIONS = {
  rakuten: {
    'tenzan-junmai-daiginjo': 0,
    'hizenkuragokoro-junmai-ginjo': 0,
    'hououbiden-junmai-ginjo-gohyakumangoku': 0,
    'zaku-miyabinotomo-nakadori-junmai-daiginjo': 0,
    'tochigi-daina-chokarakuchi-junmai': 0,
  },
  furusato: {
    'nanbubijin-tokubetsu-junmai': 0,
    'shinkame-junmai': 1,
    'tengumai-yamahai-junmai': 0,
    'shichiken-junmai-daiginjo-kinunoaji': 0,
    'gekkeikan-horin-junmai-daiginjo': 0,
    'bijofu-junmai-ginjo-cel66': 0,
    'hananoka-oka-junmai-daiginjo': 0,
    'fukutsukasa-junmai': 0,
    'urakasumi-zen-junmai-ginjo': 0,
    'kirinzan-dentou-karakuchi': 0,
    'kuninocho-daiginjo': 0,
    'iyo-kagiya-junmai-ginjo': 0,
    'yamagata-dewazakura-karesansui-10y': 0,
    'miyagi-urakasumi-honjozo-karakuchi': 0,
    'niigata-shimeharitsuru-tsuki-honjozo': 0,
    'miyagi-hitakami-chokarakuchi-junmai': 1,
    'yamaguchi-taka-nojun-karakuchi-junmai80': 0,
    'shizuoka-shosetsu-honjozo': 1,
    'yamagata-hatsumago-densho-kimoto-honjozo': 0,
    'dewazakura-oka-ginjo': 0,
    'masumi-karakuchi-kiippon': 0,
    'akishika-junmai-ginjo-utagaki': 2,
    'fukuju-junmai-ginjo': 0,
    'rihaku-wandering-poet': 0,
    'tenzan-junmai-daiginjo': 2,
    'hizenkuragokoro-junmai-ginjo': 1,
    'fukutsuru-junmai-ginjo': 7,
    'nishinoseki-junmai-daiginjo-hannari': 1,
    'sentoku-junmai': 0,
    'takaragawa-junmai-daiginjo': 0,
    'hyogo-hakutsuru-maru': 2,
  },
}

function judge(sakeName, candidate) {
  if (!candidate || !candidate.itemName) return 'reject'
  const name = candidate.itemName
  // 商品名では「総乃寒菊」が「寒菊」と略記される。後続の商品名まで
  // 一致する場合だけ同一銘柄とみなす。
  const sakeNameVariants = [sakeName, sakeName.replace(/^総乃/, '')]
  const isKankikuIdentity = sakeName === '総乃寒菊 純米大吟醸 Identity 総の舞50'
    && ['寒菊', '純米大吟醸', 'Identity', '総の舞50'].every((token) => name.includes(token))
  if (REJECT_KEYWORDS.some((kw) => name.includes(kw))) return 'reject'
  if (!isKankikuIdentity && !sakeNameVariants.some((variant) => name.includes(variant))) return 'needs_review'
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
  const noCandidates = []
  const offersBySlug = {}
  const existingOffers = mall === 'rakuten' && fs.existsSync(path.join(CACHE_DIR, 'sake-offers.json'))
    ? require(path.join(CACHE_DIR, 'sake-offers.json')).offers || {}
    : {}

  for (const [slug, entry] of Object.entries(candidates)) {
    const sake = sakeBySlug.get(slug)
    if (!sake) continue

    const judged = (entry.candidates || []).map((c) => ({ ...c, verdict: judge(entry.name, c) }))
    let adopted = judged
      .filter((c) => c.verdict === 'adopt')
      .sort((a, b) => (a.itemPrice ?? Infinity) - (b.itemPrice ?? Infinity))

    const reviewedIndex = fetchedAt === REVIEWED_FETCHED_AT[mall]
      ? REVIEWED_SELECTIONS[mall]?.[slug]
      : undefined
    if (reviewedIndex !== undefined) {
      const reviewedCandidate = (entry.candidates || [])[reviewedIndex]
      if (!reviewedCandidate?.affiliateUrl) {
        throw new Error(`手動確認済み候補が見つかりません: ${mall}:${slug}:${reviewedIndex}`)
      }
      adopted = [{ ...reviewedCandidate, verdict: 'adopt' }]
    }

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
      // 手動確認済みのリンクと価格比較データは、再実行時に消さない。
      // 既存実装は自動採用できない全候補を再度 needs_review に戻していた。
      if (mall === 'rakuten' && sake.affiliate?.[0]?.rakuten && existingOffers[slug]) {
        offersBySlug[slug] = existingOffers[slug]
      }

      // セット商品等の reject 候補も最終目視の対象に残し、
      // 候補があるのにレビューから消えることを防ぐ。
      const reviewCandidates = judged
      if (!sake.affiliate?.[0]?.[mall] && reviewCandidates.length > 0) {
        needsReview.push({ name: entry.name, slug, candidates: reviewCandidates })
      } else if (!sake.affiliate?.[0]?.[mall] && (entry.candidates || []).length === 0) {
        noCandidates.push({ name: entry.name, slug })
      }
    }
  }

  fs.writeFileSync(path.join(DATA_DIR, 'sakes.json'), JSON.stringify(sakes, null, 2) + '\n')

  fs.writeFileSync(
    path.join(CACHE_DIR, `${mall}-not-found.json`),
    JSON.stringify({
      sourceFetchedAt: fetchedAt,
      count: noCandidates.length,
      sakes: noCandidates.map(({ name, slug }) => {
        const sake = sakeBySlug.get(slug)
        return { id: sake.id, slug, name, classification: sake.classification }
      }),
    }, null, 2) + '\n'
  )

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
  md += `## API候補ゼロ (${noCandidates.length}銘柄)\n\n`
  md += `2026-08-02の再検索でも候補が1件も返らなかった銘柄です。楽天非掲載の可能性がありますが、検索語が厳密すぎる可能性もあります。\n\n`
  for (const item of noCandidates) md += `- ${item.name} (${item.slug})\n`
  md += '\n'
  fs.writeFileSync(path.join(REVIEW_DIR, `${mall}-review.md`), md)

  console.log(`自動採用: ${adoptedCount}件`)
  console.log(`要確認: ${needsReview.length}件 -> review/${mall}-review.md`)
  console.log(`API候補ゼロ: ${noCandidates.length}件 -> review/${mall}-review.md`)
}

main()
