// build-sake-candidates.js が集めた生データ(15,000件超)を、人手で判断しやすい
// 優先順位付きショートリストに変換する「精査フェーズ」用スクリプト。
//
// やること:
// 1. 商品名から銘柄名(ブランド)を推定(既存銘柄名の先頭語 + 有名銘柄リスト + 蔵元名)
// 2. 同一銘柄・同一容量帯とみなせるものを複数店舗ぶんまとめる(店舗横断の重複統合)
// 3. レビュー数・評価・単品/セット・銘柄推定できたか、で優先度スコアを付けて並べる
//
// 出力はあくまで「候補の絞り込み結果」。ここから実際に採用する銘柄を選び、
// data/real-sakes-input.json 形式を作って scripts/add-real-sakes.js で登録する、
// という流れは変わらない(蔵元・味わい・紹介文は別途キュレーションが必要)。
//
// 使い方: node scripts/curate-sake-candidates.js
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const CACHE_DIR = path.join(DATA_DIR, 'cache')
const IN_JSON = path.join(CACHE_DIR, 'sake-affiliate-candidates.json')
const OUT_JSON = path.join(CACHE_DIR, 'sake-shortlist.json')
const OUT_CSV = path.join(CACHE_DIR, 'sake-shortlist.csv')

const PREFECTURES_SHORT = [
  '北海道', '青森', '岩手', '秋田', '山形', '宮城', '福島', '茨城', '栃木', '群馬',
  '埼玉', '千葉', '東京', '神奈川', '新潟', '富山', '石川', '福井', '山梨', '長野',
  '岐阜', '静岡', '愛知', '三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山',
  '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡',
  '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄',
]

const FAMOUS_BRANDS = [
  '獺祭', '八海山', '久保田', '十四代', '而今', '花陽浴', '新政', '飛露喜',
  '鍋島', '出羽桜', '醸し人九平次', '黒龍', '雪の茅舎', '大七', '賀茂鶴',
  '王祿', '磯自慢', '田酒', '東洋美人',
  '剣菱', '白鶴', '月桂冠', '大関', '浦霞', '一ノ蔵', '男山', '高清水',
  '楯野川', '上喜元', '満寿泉', '立山', '天狗舞', '菊姫', '手取川', '常きげん',
  '真澄', '伯楽星', '墨廼江', '日高見', '上善如水', '越乃寒梅', '〆張鶴', '雪中梅',
  '鶴齢', '早瀬浦', '花垣', '開運', '喜久醉', '鳳凰美田', '会津娘', '千代の光',
  '龍力', '奥播磨', '陸奥八仙', '豊盃', '東一',
]

function stripCorpSuffix(name) {
  return name.replace(/(株式会社|有限会社|合名会社|合資会社)/g, '').trim()
}

function buildKnownBrands() {
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const breweries = require(path.join(DATA_DIR, 'breweries.json'))

  const brands = new Set(FAMOUS_BRANDS)
  for (const s of sakes) {
    const firstToken = s.name.split(/[\s　]/)[0]
    if (firstToken && firstToken.length >= 2) brands.add(firstToken)
  }
  for (const b of breweries) {
    const cleaned = stripCorpSuffix(b.name).replace(/酒造(株式会社)?$|醸造(元)?$|酒店$/g, '').trim()
    if (cleaned.length >= 2) brands.add(cleaned)
  }
  // 短すぎる/曖昧な語は誤検出の元になるので除外
  return Array.from(brands)
    .filter((b) => b.length >= 2 && !/^(お酒|日本酒|清酒|地酒)$/.test(b))
    .sort((a, b) => b.length - a.length) // 長い語から優先マッチ
}

function detectBrand(itemName, knownBrands) {
  for (const brand of knownBrands) {
    if (itemName.includes(brand)) return brand
  }
  return null
}

function detectPrefecture(itemName, matchedKeywords) {
  const fromKeyword = matchedKeywords.find((k) => PREFECTURES_SHORT.some((p) => k.startsWith(p)))
  if (fromKeyword) {
    return PREFECTURES_SHORT.find((p) => fromKeyword.startsWith(p))
  }
  return PREFECTURES_SHORT.find((p) => itemName.includes(p)) || null
}

function normalizeForGrouping(itemName, brand) {
  // 銘柄が分かればそれをグループキーに、分からなければ商品名の先頭30文字を使う
  if (brand) return `brand:${brand}`
  return `name:${itemName.slice(0, 30)}`
}

// 「開運」「立山」「黒龍」等の銘柄名は日本酒と無関係な商品名にも使われるため、
// 商品名自体に酒類を示す語が含まれるものだけを候補として残す。
const SAKE_RELEVANCE_HINT = /日本酒|清酒|純米|吟醸|本醸造|醸造酒|地酒|酒蔵|一升瓶|四合瓶|杜氏|蔵元|辛口|甘口|冷酒|燗酒|熱燗/

// 「日本酒」等が割材(炭酸水等)の用途表記として登場するだけの非酒類商品を除外
const CATEGORY_MISMATCH_HINT = /炭酸水|割材|天然水|ミネラルウォーター|グラス|酒器|猪口|徳利|ぐい呑み/

// 焼酎のみの商品が「田酒」等の短いブランド名と文字列的に偶然一致するケースを除外
// (例: 「濱田酒造」の "田酒" が誤って一致)。日本酒/清酒が明示されていれば救済する。
function isShochuOnlyFalsePositive(itemName) {
  return /焼酎/.test(itemName) && !/日本酒|清酒/.test(itemName)
}

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function main() {
  if (!fs.existsSync(IN_JSON)) {
    console.error(`${IN_JSON} が見つかりません。先に scripts/build-sake-candidates.js を実行してください。`)
    process.exit(1)
  }
  const input = JSON.parse(fs.readFileSync(IN_JSON, 'utf8'))
  const knownBrands = buildKnownBrands()
  console.log(`既知ブランド候補: ${knownBrands.length}件(既存銘柄+有名銘柄+蔵元名から生成)`)

  const groups = new Map()

  let droppedIrrelevant = 0
  for (const c of input.candidates) {
    if (c.alreadyOnSite) continue
    if (
      !SAKE_RELEVANCE_HINT.test(c.itemName) ||
      CATEGORY_MISMATCH_HINT.test(c.itemName) ||
      isShochuOnlyFalsePositive(c.itemName)
    ) {
      droppedIrrelevant++
      continue
    }
    const matchedKeywords = (c.matchedKeywords || '').split('|')
    const brand = detectBrand(c.itemName, knownBrands)
    const prefecture = detectPrefecture(c.itemName, matchedKeywords)
    const groupKey = normalizeForGrouping(c.itemName, brand)

    const entry = {
      ...c,
      detectedBrand: brand,
      detectedPrefecture: prefecture,
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { key: groupKey, items: [] })
    }
    groups.get(groupKey).items.push(entry)
  }

  const shortlist = Array.from(groups.values()).map((g) => {
    const items = g.items.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    const best = items[0]
    const shopNames = Array.from(new Set(items.map((i) => i.shopName)))
    const totalReviewCount = items.reduce((sum, i) => sum + (i.reviewCount || 0), 0)
    const avgPrice = Math.round(items.reduce((sum, i) => sum + (i.itemPrice || 0), 0) / items.length)

    // 優先度スコア: レビュー数(人気の代理指標) + 評価 + 単品ボーナス + ブランド判明ボーナス
    const score =
      Math.log10(totalReviewCount + 1) * 10 +
      (best.reviewAverage || 0) * 5 +
      (best.isSetOrGift ? 0 : 8) +
      (best.detectedBrand ? 6 : 0) +
      (best.hasVolumeHint ? 2 : 0)

    return {
      score: Math.round(score * 10) / 10,
      detectedBrand: best.detectedBrand || '',
      detectedPrefecture: best.detectedPrefecture || '',
      representativeItemName: best.itemName,
      shopCount: shopNames.length,
      shopNames: shopNames.slice(0, 3).join(' / '),
      totalReviewCount,
      bestReviewAverage: best.reviewAverage || 0,
      avgPrice,
      isSetOrGift: best.isSetOrGift,
      hasVolumeHint: best.hasVolumeHint,
      bestItemUrl: best.itemUrl,
      bestAffiliateUrl: best.affiliateUrl,
      bestImageUrl: best.imageUrl,
    }
  })

  shortlist.sort((a, b) => b.score - a.score)

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify({ generatedAt: new Date().toISOString(), count: shortlist.length, shortlist }, null, 2) + '\n'
  )

  const header = [
    'score', 'detectedBrand', 'detectedPrefecture', 'representativeItemName', 'shopCount', 'shopNames',
    'totalReviewCount', 'bestReviewAverage', 'avgPrice', 'isSetOrGift', 'hasVolumeHint',
    'bestItemUrl', 'bestAffiliateUrl', 'bestImageUrl',
  ]
  const rows = [header.join(',')]
  for (const s of shortlist) {
    rows.push(header.map((key) => csvEscape(s[key])).join(','))
  }
  fs.writeFileSync(OUT_CSV, rows.join('\n') + '\n')

  console.log(`酒類と無関係と判定して除外: ${droppedIrrelevant}件`)
  const brandDetected = shortlist.filter((s) => s.detectedBrand).length
  const singleBottle = shortlist.filter((s) => !s.isSetOrGift).length
  console.log(`\n統合後のグループ数(=候補銘柄数の目安): ${shortlist.length}件`)
  console.log(`  うちブランド名を推定できたもの: ${brandDetected}件`)
  console.log(`  うち単品(セット/ギフト以外): ${singleBottle}件`)
  console.log(`書き出し完了: ${OUT_JSON}`)
  console.log(`書き出し完了: ${OUT_CSV}`)
}

main()
