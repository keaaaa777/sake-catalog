// 読込用の生データ（プレースホルダ）を、指示書 §9 のデータ設計に沿った
// data/sakes.json / data/breweries.json に変換するビルドスクリプト。
// 実データ投入時はこのスクリプトを実データ用に書き換えるか、直接 data/*.json を編集する。
const fs = require('fs')
const path = require('path')

const rawSakes = require('../読込用/sakes.json')
const rawBreweries = require('../読込用/breweries.json')

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

const CLASSIFICATION_BY_TYPE = {
  daiginjo: '大吟醸',
  ginjo: '吟醸',
  junmai_ginjo: '純米吟醸',
  pure_rice: '純米',
  honjozo: '本醸造',
  nigori: 'にごり酒',
  sparkling: 'スパークリング',
}

const POLISHING_BY_TYPE = {
  daiginjo: 40, ginjo: 55, junmai_ginjo: 55, pure_rice: 65,
  honjozo: 65, nigori: 70, sparkling: 60,
}

const PRICE_RANGE_BY_TYPE = {
  daiginjo: 4, ginjo: 3, junmai_ginjo: 3, pure_rice: 2,
  honjozo: 1, nigori: 2, sparkling: 3,
}

const SCENES_BY_FLAVOR = {
  kaori: ['special', 'gift'],
  sou: ['daily', 'beginner'],
  jun: ['daily', 'special'],
  juku: ['special', 'gift'],
}

const SERVING_TEMP_BY_FLAVOR = {
  kaori: ['雪冷え', '花冷え'],
  sou: ['涼冷え', '常温'],
  jun: ['常温', 'ぬる燗'],
  juku: ['ぬる燗', '熱燗'],
}

const PAIRING_MAP = {
  '刺身': 'sashimi', '白身魚': 'sashimi', 'カルパッチョ': 'sashimi', '寿司': 'sashimi',
  '焼き鳥': 'yakitori', '豚しゃぶ': 'yakitori',
  '唐揚げ': 'fried', '揚げ物': 'fried',
  'チーズ': 'cheese', '生ハム': 'cheese', 'ナッツ': 'cheese', 'フルーツ': 'cheese',
  '煮物': 'other', '枝豆': 'other', '豆腐料理': 'other', '和え物': 'other',
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function prefRomaji(pref) {
  return PREF_ROMAJI[pref] || 'unknown'
}

function deriveFlavorType(s) {
  if (s.type === 'daiginjo' || s.type === 'ginjo') return 'kaori'
  if (s.type === 'sparkling') return 'sou'
  if (s.type === 'nigori') return 'juku'
  if (s.type === 'honjozo') return s.acidity >= 1.5 ? 'juku' : 'sou'
  return s.dry_sweet_index <= -1 ? 'sou' : 'jun'
}

function buildBreweries() {
  return rawBreweries.map((b) => ({
    id: String(b.id),
    slug: `${prefRomaji(b.prefecture)}-brewery-${String(b.id).padStart(3, '0')}`,
    name: b.name,
    prefecture: b.prefecture,
    foundedYear: b.founded_year ?? undefined,
    description: b.description,
    websiteUrl: b.website_url ?? undefined,
    imageUrl: b.image_url ?? undefined,
  }))
}

function buildSakes(breweryBySourceId) {
  return rawSakes.map((s) => {
    const flavorType = deriveFlavorType(s)
    const sweetness = clamp(Math.round(3 + s.dry_sweet_index / 3), 1, 5)
    const acidityScore = clamp(Math.round((s.acidity ?? 1) * 2), 1, 5)
    const aroma = s.type === 'daiginjo' ? 5 : s.type === 'ginjo' || s.type === 'junmai_ginjo' ? 4 : 2
    const umami = s.type === 'pure_rice' || s.type === 'honjozo' || s.type === 'nigori' ? 4 : 2
    const sharpness = clamp(6 - sweetness, 1, 5)
    const sweetDry = clamp(Math.round(s.dry_sweet_index / 1.7), -3, 3)
    const lightRich = s.type === 'ginjo' || s.type === 'daiginjo' || s.type === 'sparkling'
      ? clamp(-1 - Math.round(acidityScore / 2), -3, 0)
      : clamp(1 + Math.round(acidityScore / 2), 0, 3)

    const brewery = breweryBySourceId.get(s.brewery_id)
    const pairings = Array.from(new Set((s.food_pairing || []).map((f) => PAIRING_MAP[f] || 'other')))

    return {
      id: String(s.id),
      slug: `${prefRomaji(s.prefecture)}-${s.type.replace(/_/g, '-')}-${String(s.id).padStart(3, '0')}`,
      name: s.name,
      nameKana: '',
      breweryId: brewery ? brewery.slug : undefined,
      prefecture: s.prefecture,
      classification: CLASSIFICATION_BY_TYPE[s.type] || '普通酒',
      flavorType,
      taste: { sweetness, acidity: acidityScore, umami, aroma, sharpness },
      sweetDry,
      lightRich,
      specs: {
        polishing: POLISHING_BY_TYPE[s.type],
        abv: s.alcohol_percentage,
        smv: s.dry_sweet_index,
        acid: s.acidity,
      },
      servingTemp: SERVING_TEMP_BY_FLAVOR[flavorType],
      pairings,
      scenes: SCENES_BY_FLAVOR[flavorType],
      priceRange: PRICE_RANGE_BY_TYPE[s.type] || 2,
      description: [s.description, s.tasting_notes].filter(Boolean).join(' '),
      imageUrl: s.image_url,
      affiliate: [],
    }
  })
}

function main() {
  const breweries = buildBreweries()
  const breweryBySourceId = new Map(rawBreweries.map((b, i) => [b.id, breweries[i]]))
  const sakes = buildSakes(breweryBySourceId)

  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'breweries.json'),
    JSON.stringify(breweries, null, 2) + '\n'
  )
  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'sakes.json'),
    JSON.stringify(sakes, null, 2) + '\n'
  )
  console.log(`generated ${breweries.length} breweries, ${sakes.length} sakes`)
}

main()
