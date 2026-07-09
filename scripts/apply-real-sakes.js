// data/<input>.json (研究結果+オリジナル紹介文) を、
// 既存の data/sakes.json 内の該当プレースホルダー行(同一都道府県・同一蔵)に
// 上書き適用するスクリプト。複数ラウンドで使い回せるよう入力ファイル名を指定可能。
//
// 使い方: node scripts/apply-real-sakes.js [入力ファイル名(data/配下、省略時 real-sakes-input.json)]
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const inputFile = process.argv[2] || 'real-sakes-input.json'
const breweries = require(path.join(DATA_DIR, 'breweries.json'))
const sakes = require(path.join(DATA_DIR, 'sakes.json'))
const realInput = require(path.join(DATA_DIR, inputFile))

const PREF_ROMAJI = {
  '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '秋田県': 'akita',
  '山形県': 'yamagata', '宮城県': 'miyagi', '福島県': 'fukushima', '茨城県': 'ibaraki',
  '栃木県': 'tochigi', '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba',
  '東京都': 'tokyo', '神奈川県': 'kanagawa', '新潟県': 'niigata', '富山県': 'toyama',
  '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano',
  '岐阜県': 'gifu', '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie',
  '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
  '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane',
  '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi', '徳島県': 'tokushima',
  '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka',
  '佐賀県': 'saga', '長崎県': 'nagasaki', '熊本県': 'kumamoto', '大分県': 'oita',
  '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa',
}

// 実在の特定名称 → 香味4分類のおおまかな対応
const CLASSIFICATION_TO_FLAVOR = {
  '純米大吟醸': 'kaori',
  '大吟醸': 'kaori',
  '純米吟醸': 'kaori',
  '吟醸': 'kaori',
  '純米': 'jun',
  '本醸造': 'sou',
  '普通酒': 'sou',
}

const SERVING_TEMP_BY_FLAVOR = {
  kaori: ['雪冷え', '花冷え'],
  sou: ['涼冷え', '常温'],
  jun: ['常温', 'ぬる燗'],
  juku: ['ぬる燗', '熱燗'],
}

const SCENES_BY_FLAVOR = {
  kaori: ['special', 'gift'],
  sou: ['daily', 'beginner'],
  jun: ['daily', 'special'],
  juku: ['special', 'gift'],
}

const PAIRINGS_BY_FLAVOR = {
  kaori: ['sashimi', 'cheese'],
  sou: ['sashimi', 'fried'],
  jun: ['yakitori', 'other'],
  juku: ['cheese', 'other'],
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function slugify(prefecture, productName, index) {
  // ローマ字化は手作業(real-sakes-input.json 側で romajiSlug を指定)する前提。
  // 指定が無い場合のフォールバックとして prefecture-real-連番 を使う。
  return `${PREF_ROMAJI[prefecture] || 'unknown'}-real-${String(index + 1).padStart(2, '0')}`
}

function main() {
  const breweryBySlug = new Map(breweries.map((b) => [b.slug, b]))
  const breweryByNamePref = new Map(breweries.map((b) => [`${b.prefecture}::${b.name}`, b]))

  let replacedCount = 0
  const notFound = []

  realInput.forEach((entry, index) => {
    const brewery = breweryByNamePref.get(`${entry.prefecture}::${entry.breweryName}`)
    if (!brewery) {
      notFound.push({ reason: 'brewery not found', entry: entry.breweryName, prefecture: entry.prefecture })
      return
    }

    // 同一都道府県・同一蔵のプレースホルダー行を1件だけ選んで上書きする
    const target = sakes.find((s) => s.prefecture === entry.prefecture && s.breweryId === brewery.slug)
    if (!target) {
      notFound.push({ reason: 'no placeholder sake found for brewery', entry: entry.breweryName, prefecture: entry.prefecture })
      return
    }

    const flavorType = CLASSIFICATION_TO_FLAVOR[entry.classification] || 'jun'
    const polishing = entry.polishingRatio ?? null
    const abv = entry.abv ?? null
    const smv = entry.smv ?? null
    const acid = entry.acidity ?? null

    const aroma = polishing != null ? clamp(Math.round(6 - polishing / 20), 2, 5) : (flavorType === 'kaori' ? 4 : 2)
    const sweetDry = smv != null ? clamp(Math.round(smv / 2), -3, 3) : 0
    const umami = flavorType === 'jun' || flavorType === 'juku' ? 4 : 2
    const sweetness = clamp(3 - sweetDry, 1, 5)
    const acidityScore = acid != null ? clamp(Math.round(acid * 2), 1, 5) : 3
    const sharpness = clamp(6 - sweetness, 1, 5)
    const lightRich = flavorType === 'kaori' || flavorType === 'sou' ? -1 : 1

    target.slug = entry.romajiSlug || slugify(entry.prefecture, entry.productName, index)
    target.name = entry.productName
    target.nameKana = entry.productNameKana || ''
    target.classification = entry.classification
    target.flavorType = flavorType
    target.taste = { sweetness, acidity: acidityScore, umami, aroma, sharpness }
    target.sweetDry = sweetDry
    target.lightRich = lightRich
    target.specs = {
      polishing: polishing ?? undefined,
      rice: entry.riceVariety ?? undefined,
      abv: abv ?? undefined,
      smv: smv ?? undefined,
      acid: acid ?? undefined,
    }
    target.servingTemp = SERVING_TEMP_BY_FLAVOR[flavorType]
    target.pairings = PAIRINGS_BY_FLAVOR[flavorType]
    target.scenes = SCENES_BY_FLAVOR[flavorType]
    target.priceRange = entry.priceRange ?? 3
    target.description = entry.description
    target.isRealData = true

    replacedCount += 1
  })

  fs.writeFileSync(
    path.join(DATA_DIR, 'sakes.json'),
    JSON.stringify(sakes, null, 2) + '\n'
  )

  console.log(`[${inputFile}] replaced ${replacedCount} / ${realInput.length} entries with real data`)
  if (notFound.length) {
    console.log('NOT FOUND:', JSON.stringify(notFound, null, 2))
  }
}

main()
