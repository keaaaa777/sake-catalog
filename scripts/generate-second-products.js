// 収集済みの楽天商品候補から、既存蔵元の「2本目以降の商品」を大量に生成する
// 半自動スクリプト。レビュー数・人気度によるフィルタは行わない
// (「実在確認でき、実際にアフィリエイトリンクが張れる商品」であれば
// 売れ行きに関わらず対象に含める方針)。
//
// やること:
// 1. data/cache/sake-affiliate-candidates.json の全件(セット/ギフトも含む)を対象に、
//    既存蔵元名(breweries.json)が商品名に明記されているものだけを拾う
//    (蔵元名の裏取りができない商品は含めない = 正確性は担保する)
// 2. 商品名から特定名称(純米大吟醸〜普通酒)を正規表現で推定
// 3. 同一蔵元で「まだ登録されていない特定名称」の組み合わせのみを候補として残す
//    (蔵元+分類の重複は避け、バリエーションを広げる)
// 4. テンプレート文でdescriptionを生成し、real-sakes-input.json形式で出力
//
// 出力はそのまま登録せず、まず候補一覧をレビューできるようJSONに書き出す。
// 内容を確認のうえ、data/real-sakes-round*.json にリネーム/整理してから
// node scripts/add-real-sakes.js <ファイル名> で登録する想定。
//
// 使い方: node scripts/generate-second-products.js
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const CACHE_DIR = path.join(DATA_DIR, 'cache')
const OUT_FILE = path.join(CACHE_DIR, 'second-products-draft.json')

function stripCorp(n) {
  return n.replace(/(株式会社|有限会社|合名会社|合資会社)/g, '').trim()
}

const CLASSIFICATION_PATTERNS = [
  ['純米大吟醸', /純米大吟醸/],
  ['大吟醸', /大吟醸/],
  ['特別純米', /特別純米/],
  ['純米吟醸', /純米吟醸/],
  ['吟醸', /吟醸/],
  ['特別本醸造', /特別本醸造/],
  ['本醸造', /本醸造/],
  ['純米', /純米/],
  ['普通酒', /普通酒/],
]

function detectClassification(itemName) {
  for (const [label, re] of CLASSIFICATION_PATTERNS) {
    if (re.test(itemName)) return label
  }
  return null
}

const CLASSIFICATION_SLUG = {
  '純米大吟醸': 'junmai-daiginjo',
  '大吟醸': 'daiginjo',
  '特別純米': 'tokubetsu-junmai',
  '純米吟醸': 'junmai-ginjo',
  '吟醸': 'ginjo',
  '特別本醸造': 'tokubetsu-honjozo',
  '本醸造': 'honjozo',
  '純米': 'junmai',
  '普通酒': 'futsushu',
}

const CLASSIFICATION_DEFAULTS = {
  '純米大吟醸': { abv: 16.5, smv: 3, acidity: 1.3, polishing: 45 },
  '大吟醸': { abv: 16.5, smv: 4, acidity: 1.2, polishing: 45 },
  '特別純米': { abv: 15.5, smv: 3, acidity: 1.4, polishing: 58 },
  '純米吟醸': { abv: 15.5, smv: 3, acidity: 1.3, polishing: 55 },
  '吟醸': { abv: 15.5, smv: 4, acidity: 1.2, polishing: 55 },
  '特別本醸造': { abv: 15.5, smv: 4, acidity: 1.3, polishing: 58 },
  '本醸造': { abv: 15.5, smv: 4, acidity: 1.3, polishing: 65 },
  '純米': { abv: 15.5, smv: 3, acidity: 1.4, polishing: 65 },
  '普通酒': { abv: 15.5, smv: 3, acidity: 1.3, polishing: null },
}

function romajiSlugBase(breweryPrefRomaji, id) {
  return `${breweryPrefRomaji}-second-${id}`
}

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

// 酒粕・料理酒・ノンアルコール・菓子類など、清酒の「銘柄」として登録すべきでない
// 非飲用品/別カテゴリ商品を除外する
const NON_BEVERAGE_HINT = /酒粕|料理酒|ノンアルコール|甘酒|ケーキ|お菓子|カステラ|ゼリー|羊羹|クッキー|化粧品|コスメ|梅酒|果実酒|リキュール|貴醸酒/

function makeDescription(brandLabel, breweryName, prefecture, classification) {
  return `${prefecture}の${breweryName}が醸す「${brandLabel}」の${classification}。蔵の看板銘柄とはまた違う個性を持つ一本で、地元の食卓に寄り添う定番の味わいを目指して造られている。同じ蔵の他の銘柄と飲み比べることで、造り手の技の幅を感じられる一本。`
}

function main() {
  const candidatesFile = require(path.join(CACHE_DIR, 'sake-affiliate-candidates.json'))
  const breweries = require(path.join(DATA_DIR, 'breweries.json'))
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))

  const breweryList = breweries.map((b) => ({
    slug: b.slug,
    name: b.name,
    short: stripCorp(b.name),
    prefecture: b.prefecture,
  }))

  // 既に登録済みの (breweryId, classification) 組み合わせ
  const existingCombos = new Set(sakes.map((s) => `${s.breweryId}::${s.classification}`))

  // 蔵元ごとに「サイトに既に登録済みの商品名の先頭語」＝実在確認済みブランド名を集める。
  // 新しい候補の商品名にこのブランド名が含まれている場合のみ採用することで、
  // 「蔵元名だけ合っているが実際は別ブランドの商品」を弾く。
  const brandsByBrewery = new Map()
  for (const s of sakes) {
    const firstToken = s.name.split(/[\s　]/)[0]
    if (!firstToken || firstToken.length < 2) continue
    if (!brandsByBrewery.has(s.breweryId)) brandsByBrewery.set(s.breweryId, new Set())
    brandsByBrewery.get(s.breweryId).add(firstToken)
  }

  const drafts = new Map() // key: breweryId::classification -> draft
  let idCounter = 1

  let skippedNonBeverage = 0
  let skippedNoPrefConfirm = 0
  let skippedNoBrand = 0
  let skippedNoClassification = 0
  let skippedComboExists = 0
  let skippedComboDup = 0

  let skippedSetOrGift = 0

  for (const c of candidatesFile.candidates) {
    if (c.isSetOrGift) { skippedSetOrGift++; continue }
    if (NON_BEVERAGE_HINT.test(c.itemName)) { skippedNonBeverage++; continue }

    const matchedBrewery = breweryList.find(
      (b) => c.itemName.includes(b.short) || c.itemName.includes(b.name)
    )
    if (!matchedBrewery) continue

    // 蔵元名の部分一致による事故(例: 「寿酒造」が「天寿酒造」に誤マッチ)を防ぐため、
    // 蔵元の短縮名が短く衝突しやすい場合のみ、都道府県名の併記を必須にする
    if (matchedBrewery.short.length <= 3) {
      const prefShort = matchedBrewery.prefecture.replace(/[都道府県]$/, '')
      if (!c.itemName.includes(matchedBrewery.prefecture) && !c.itemName.includes(prefShort)) {
        skippedNoPrefConfirm++
        continue
      }
    }

    // その蔵元が既にサイトに持つブランド名が商品名にも含まれているか確認する
    // (無ければ「別ブランドかもしれない商品」として対象外にする)
    // ブランド名は商品名の先頭付近(実際の商品名として書かれている位置)にあるものだけ
    // 採用する。末尾のタグ的な言及や「〇〇も認める△△」のような比較文脈での
    // 登場(位置が離れている)は、実際の商品とは異なるブランドである可能性が高いため除外する
    const knownBrands = brandsByBrewery.get(matchedBrewery.slug)
    const brandGuess = knownBrands
      ? Array.from(knownBrands).find((b) => {
          const idx = c.itemName.indexOf(b)
          return idx !== -1 && idx <= 20
        })
      : null
    if (!brandGuess) { skippedNoBrand++; continue }

    const classification = detectClassification(c.itemName)
    if (!classification) { skippedNoClassification++; continue }

    const comboKey = `${matchedBrewery.slug}::${classification}`
    if (existingCombos.has(comboKey)) { skippedComboExists++; continue } // 既に同じ蔵元・同じ分類が登録済み
    if (drafts.has(comboKey)) { skippedComboDup++; continue } // 今回すでに同じ組み合わせを採用済み

    const defaults = CLASSIFICATION_DEFAULTS[classification]

    drafts.set(comboKey, {
      prefecture: matchedBrewery.prefecture,
      breweryName: matchedBrewery.name,
      productName: `${brandGuess} ${classification}`,
      romajiSlug: `${matchedBrewery.slug}-${CLASSIFICATION_SLUG[classification]}-2nd`,
      classification,
      riceVariety: null,
      polishingRatio: defaults.polishing,
      abv: defaults.abv,
      smv: defaults.smv,
      acidity: defaults.acidity,
      priceRange: 2,
      description: makeDescription(brandGuess, matchedBrewery.name, matchedBrewery.prefecture, classification),
      _sourceItemName: c.itemName,
      _affiliateUrl: c.affiliateUrl,
      _isSetOrGift: c.isSetOrGift,
      _reviewCount: c.reviewCount,
    })
  }

  const draftList = Array.from(drafts.values())
  fs.writeFileSync(OUT_FILE, JSON.stringify(draftList, null, 2) + '\n')
  console.log(`ドラフト生成: ${draftList.length}件`)
  console.log(`除外: 非飲用品 ${skippedNonBeverage}件 / 都道府県未確認 ${skippedNoPrefConfirm}件 / ブランド不明 ${skippedNoBrand}件 / 分類不明 ${skippedNoClassification}件 / 登録済み組み合わせ ${skippedComboExists}件 / 重複候補 ${skippedComboDup}件`)
  console.log(`書き出し完了: ${OUT_FILE}`)
}

main()
