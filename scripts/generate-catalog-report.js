// data/sakes.json / data/breweries.json の現状を都道府県別・分類別に集計し、
// 資料/catalog_status.md としてMarkdownで書き出すレポート生成スクリプト。
// データを追加・変更するたびに再実行して最新化する想定。
//
// 使い方: node scripts/generate-catalog-report.js
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const OUT_FILE = path.join(__dirname, '..', '資料', 'catalog_status.md')

const PREFECTURE_ORDER = [
  '北海道', '青森県', '岩手県', '秋田県', '山形県', '宮城県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

function main() {
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const breweries = require(path.join(DATA_DIR, 'breweries.json'))

  const breweryById = new Map(breweries.map((b) => [b.slug, b]))
  const sakesByBreweryId = new Map()
  for (const s of sakes) {
    if (!sakesByBreweryId.has(s.breweryId)) sakesByBreweryId.set(s.breweryId, [])
    sakesByBreweryId.get(s.breweryId).push(s)
  }

  // 分類別の集計
  const byClassification = new Map()
  for (const s of sakes) {
    byClassification.set(s.classification, (byClassification.get(s.classification) || 0) + 1)
  }
  const classificationRows = Array.from(byClassification.entries()).sort((a, b) => b[1] - a[1])

  // 都道府県別の集計
  const prefStats = new Map()
  for (const pref of PREFECTURE_ORDER) prefStats.set(pref, { breweries: 0, sakes: 0 })
  for (const b of breweries) {
    if (!prefStats.has(b.prefecture)) prefStats.set(b.prefecture, { breweries: 0, sakes: 0 })
    prefStats.get(b.prefecture).breweries += 1
  }
  for (const s of sakes) {
    if (!prefStats.has(s.prefecture)) prefStats.set(s.prefecture, { breweries: 0, sakes: 0 })
    prefStats.get(s.prefecture).sakes += 1
  }

  const affiliateCount = sakes.filter((s) => s.affiliate && s.affiliate[0] && s.affiliate[0].rakuten).length

  const lines = []
  lines.push('# 日本酒図鑑 掲載状況')
  lines.push('')
  lines.push(`> このファイルは \`scripts/generate-catalog-report.js\` により自動生成されます。`)
  lines.push(`> データを追加・変更した際は再実行して最新化してください。`)
  lines.push(`>`)
  lines.push(`> 生成日時: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## サマリー')
  lines.push('')
  lines.push(`- 掲載銘柄数: **${sakes.length}件**`)
  lines.push(`- 掲載蔵元数: **${breweries.length}件**`)
  lines.push(`- 楽天アフィリエイトリンク付与済み: ${affiliateCount}件 (${((affiliateCount / sakes.length) * 100).toFixed(1)}%)`)
  lines.push(`- 対応都道府県数: ${Array.from(prefStats.values()).filter((v) => v.breweries > 0).length} / 47`)
  lines.push('')

  lines.push('## 特定名称(分類)別 銘柄数')
  lines.push('')
  lines.push('| 分類 | 銘柄数 |')
  lines.push('|---|---|')
  for (const [cls, count] of classificationRows) {
    lines.push(`| ${cls} | ${count} |`)
  }
  lines.push('')

  lines.push('## 都道府県別 内訳')
  lines.push('')
  lines.push('| 都道府県 | 蔵元数 | 銘柄数 |')
  lines.push('|---|---|---|')
  let totalBreweries = 0
  let totalSakes = 0
  for (const pref of PREFECTURE_ORDER) {
    const stat = prefStats.get(pref) || { breweries: 0, sakes: 0 }
    totalBreweries += stat.breweries
    totalSakes += stat.sakes
    lines.push(`| ${pref} | ${stat.breweries} | ${stat.sakes} |`)
  }
  lines.push(`| **合計** | **${totalBreweries}** | **${totalSakes}** |`)
  lines.push('')

  lines.push('## 蔵元別 掲載銘柄一覧(都道府県順)')
  lines.push('')
  for (const pref of PREFECTURE_ORDER) {
    const prefBreweries = breweries
      .filter((b) => b.prefecture === pref)
      .sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    if (prefBreweries.length === 0) continue

    lines.push(`### ${pref}`)
    lines.push('')
    for (const b of prefBreweries) {
      const bSakes = (sakesByBreweryId.get(b.slug) || []).sort((a, c) => a.name.localeCompare(c.name, 'ja'))
      lines.push(`- **${b.name}**`)
      if (bSakes.length === 0) {
        lines.push(`  - (掲載銘柄なし)`)
      } else {
        for (const s of bSakes) {
          lines.push(`  - ${s.name}(${s.classification})`)
        }
      }
    }
    lines.push('')
  }

  fs.writeFileSync(OUT_FILE, lines.join('\n') + '\n')
  console.log(`書き出し完了: ${OUT_FILE}`)
  console.log(`銘柄数: ${sakes.length} / 蔵元数: ${breweries.length}`)
}

main()
