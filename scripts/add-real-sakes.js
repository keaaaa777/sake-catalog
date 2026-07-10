// data/<input>.json (研究結果+オリジナル紹介文) を、data/sakes.json へ
// 「新規追加」するスクリプト。仮データ削除後、置換対象のプレースホルダー行が
// 存在しないラウンド向け(apply-real-sakes.js は既存行の上書き用、こちらは新規追加用)。
//
// 使い方: node scripts/add-real-sakes.js <入力ファイル名(data/配下)>
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const inputFile = process.argv[2]
if (!inputFile) {
  console.error('使い方: node scripts/add-real-sakes.js <入力ファイル名>')
  process.exit(1)
}

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

function main() {
  const breweryByNamePref = new Map(breweries.map((b) => [`${b.prefecture}::${b.name}`, b]))
  let nextId = Math.max(...sakes.map((s) => Number(s.id) || 0)) + 1
  const notFound = []
  let addedCount = 0

  realInput.forEach((entry) => {
    const brewery = breweryByNamePref.get(`${entry.prefecture}::${entry.breweryName}`)
    if (!brewery) {
      notFound.push({ reason: 'brewery not found', entry: entry.breweryName, prefecture: entry.prefecture })
      return
    }

    if (sakes.some((s) => s.slug === (entry.romajiSlug || ''))) {
      notFound.push({ reason: 'slug already exists, skipped', entry: entry.romajiSlug })
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

    const slug = entry.romajiSlug || `${PREF_ROMAJI[entry.prefecture] || 'unknown'}-real-${nextId}`

    sakes.push({
      id: String(nextId),
      slug,
      name: entry.productName,
      nameKana: entry.productNameKana || '',
      breweryId: brewery.slug,
      prefecture: entry.prefecture,
      classification: entry.classification,
      flavorType,
      taste: { sweetness, acidity: acidityScore, umami, aroma, sharpness },
      sweetDry,
      lightRich,
      specs: {
        polishing: polishing ?? undefined,
        rice: entry.riceVariety ?? undefined,
        abv: abv ?? undefined,
        smv: smv ?? undefined,
        acid: acid ?? undefined,
      },
      servingTemp: SERVING_TEMP_BY_FLAVOR[flavorType],
      pairings: PAIRINGS_BY_FLAVOR[flavorType],
      scenes: SCENES_BY_FLAVOR[flavorType],
      priceRange: entry.priceRange ?? 3,
      description: entry.description,
      imageUrl: '🍶',
      affiliate: [],
      isRealData: true,
    })

    nextId += 1
    addedCount += 1
  })

  fs.writeFileSync(
    path.join(DATA_DIR, 'sakes.json'),
    JSON.stringify(sakes, null, 2) + '\n'
  )

  console.log(`[${inputFile}] added ${addedCount} / ${realInput.length} new entries`)
  if (notFound.length) {
    console.log('SKIPPED:', JSON.stringify(notFound, null, 2))
  }
}

main()
