// 公式ページで再確認できた round6 対象だけを既存レコードへ反映する。
// affiliate など今回の調査対象外の値は保持する。
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SAKES_FILE = path.join(ROOT, 'data', 'sakes.json')
const RESEARCH_FILE = path.join(ROOT, 'data', 'round6-research.json')
const REVIEW_FILE = path.join(ROOT, 'review', 'descriptions-round6.md')
const ROUND5_FILE = path.join(ROOT, 'data', 'real-sakes-round5.json')

const pairings = {
  sashimi: '刺身', cheese: 'チーズ', yakitori: '焼き鳥', fried: '揚げ物',
  other: '味付けが穏やかな料理', seafood: '魚介料理', meat: '肉料理',
}

function specText(specs) {
  const values = []
  if (specs.rice) values.push(`使用米は${specs.rice}`)
  if (specs.polishing != null) values.push(`精米歩合は${specs.polishing}%`)
  if (specs.abv != null) values.push(`アルコール度数は${specs.abv}度`)
  if (specs.smv != null) values.push(`日本酒度は${specs.smv > 0 ? '+' : ''}${specs.smv}`)
  if (specs.acid != null) values.push(`酸度は${specs.acid}`)
  return values.join('、')
}

function description(sake, breweryName) {
  const t = sake.taste
  const aroma = t.aroma >= 4 ? '香りの存在感があり' : '香りは穏やかで'
  const sweetness = t.sweetness >= 4 ? '甘みを感じやすい' : t.sweetness <= 2 ? '甘さを抑えた' : '甘みが中程度の'
  const umami = t.umami >= 4 ? '米の旨みを感じやすい' : '旨みが控えめな'
  const finish = t.sharpness >= 4 ? '後口は切れよく締まります' : '後口は丸く穏やかに続きます'
  const temps = sake.servingTemp.join('、')
  const foods = sake.pairings.slice(0, 2).map((x) => pairings[x] || x).join('や')
  return `${sake.name}は、${breweryName}が手がける${sake.classification}です。公式商品情報で確認できる仕様は、${specText(sake.specs)}です。香味データでは、${aroma}、${sweetness}印象と${umami}構成です。香り、甘み、酸味、旨みの各要素を比べると、${finish}。まずは${temps}で少量ずつ試すと、温度による香味の違いを確かめやすいでしょう。料理は${foods}から合わせ、酒と料理のどちらかが強く感じられる場合は温度や量を調整するのがおすすめです。銘柄の基本仕様を確認しながら、自分に合う飲み方を探したい方に向いています。`
}

const sakes = JSON.parse(fs.readFileSync(SAKES_FILE, 'utf8'))
const breweries = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'breweries.json'), 'utf8'))
const research = JSON.parse(fs.readFileSync(RESEARCH_FILE, 'utf8'))
const round5 = JSON.parse(fs.readFileSync(ROUND5_FILE, 'utf8'))
const breweryById = new Map(breweries.map((x) => [x.id, x]))
const sakeBySlug = new Map(sakes.map((x) => [x.slug, x]))

// 初回投入時に使われた一時IDを、既存 breweries.json の正式なIDへ直す。
for (const source of round5) {
  const sake = sakeBySlug.get(source.romajiSlug)
  if (!sake) throw new Error(`Round 5銘柄が見つかりません: ${source.romajiSlug}`)
  const brewery = breweries.find((x) => x.name === source.breweryName && x.prefecture === source.prefecture)
  if (!brewery) throw new Error(`Round 5蔵元が見つかりません: ${source.prefecture} ${source.breweryName}`)
  sake.breweryId = brewery.id
}

for (const item of research) {
  const sake = sakeBySlug.get(item.slug)
  if (!sake) throw new Error(`対象銘柄が見つかりません: ${item.slug}`)
  sake.name = item.name || sake.name
  sake.specs = item.specs
  if (item.servingTemp) sake.servingTemp = item.servingTemp
  const brewery = breweryById.get(sake.breweryId)
  if (!brewery) throw new Error(`蔵元が見つかりません: ${sake.breweryId}`)
  sake.description = description(sake, brewery.name)
  const length = [...sake.description].length
  if (length < 250 || length > 350) {
    throw new Error(`${item.slug}: 紹介文が${length}字です（250〜350字である必要があります）`)
  }
}

fs.writeFileSync(SAKES_FILE, `${JSON.stringify(sakes, null, 2)}\n`)

const review = [
  '# 紹介文レビュー Round 6',
  '',
  `公式情報を再確認できた既存 ${research.length} 銘柄の紹介文です。公開前に目視確認してください。`,
  '',
  ...research.flatMap((item) => {
    const sake = sakeBySlug.get(item.slug)
    return [
      `## ${sake.name}`,
      '',
      `- 蔵元: ${breweryById.get(sake.breweryId).name}`,
      `- 文字数: ${[...sake.description].length}`,
      `- 公式出典: ${item.sourceUrl}`,
      '',
      sake.description,
      '',
    ]
  }),
  '## 今回更新を見送った既存銘柄',
  '',
  '次の銘柄は、現行の公式商品ページで商品名と主要スペックを同時に確認できなかったため、既存値を推測で書き換えていません。',
  '',
  ...round5
    .filter((source) => !research.some((item) => item.slug === source.romajiSlug))
    .map((source) => `- ${source.breweryName}: ${source.productName}`),
  '',
]
fs.writeFileSync(REVIEW_FILE, `${review.join('\n')}\n`)

console.log(`更新: ${research.length}銘柄`)
console.log(`レビュー: ${REVIEW_FILE}`)
