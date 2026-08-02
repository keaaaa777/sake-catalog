// data/*.json と lib/guides.ts の内部リンク・参照整合性をチェックするスクリプト。
// 過去に「breweryId不整合」「ガイド記事からのリンク切れ」が繰り返し発生しているため、
// npm run build 前やコミット前に手動で流して事故を早期発見する用途。
// 問題が見つかった場合は非ゼロの終了コードで一覧を出力する。
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const readJson = (relPath) => JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf-8'))
const readText = (relPath) => fs.readFileSync(path.join(root, relPath), 'utf-8')

const errors = []

const sakes = readJson('data/sakes.json')
const breweries = readJson('data/breweries.json')
const sakesEn = readJson('data/sakes-en.json')
const guidesEn = readJson('data/guides-en.json')
const guidesTs = readText('lib/guides.ts')

const sakeSlugs = new Set(sakes.map((s) => s.slug))
const brewerySlugs = new Set(breweries.map((b) => b.slug))
const enSakeSlugs = new Set(Object.keys(sakesEn))

// 1. breweryId の参照整合性 (sakes.json の breweryId は breweries.json の slug を参照する)
for (const sake of sakes) {
  if (!brewerySlugs.has(sake.breweryId)) {
    errors.push(`[breweryId] data/sakes.json の "${sake.slug}" (id: ${sake.id}) が存在しない breweryId "${sake.breweryId}" を参照しています`)
  }
}

// 2. 記事本文中の内部リンクが実在データを指しているか
function checkLinks(sourceLabel, html, { checkSakeJa = false, checkSakeEn = false, checkBrewery = false } = {}) {
  const hrefPattern = /href="([^"]+)"/g
  let match
  while ((match = hrefPattern.exec(html)) !== null) {
    const href = match[1]

    if (checkSakeJa) {
      const m = href.match(/^\/sake\/([^/"?#]+)$/)
      if (m && !sakeSlugs.has(m[1])) {
        errors.push(`[link] ${sourceLabel}: /sake/${m[1]} は data/sakes.json に存在しません`)
      }
    }
    if (checkSakeEn) {
      const m = href.match(/^\/en\/sake\/([^/"?#]+)$/)
      if (m && !enSakeSlugs.has(m[1])) {
        errors.push(`[link] ${sourceLabel}: /en/sake/${m[1]} は data/sakes-en.json に英訳が存在しません`)
      }
    }
    if (checkBrewery) {
      const m = href.match(/^\/brewery\/([^/"?#]+)$/)
      if (m && !brewerySlugs.has(m[1])) {
        errors.push(`[link] ${sourceLabel}: /brewery/${m[1]} は data/breweries.json に存在しません`)
      }
    }
  }
}

checkLinks('lib/guides.ts (日本語ガイド)', guidesTs, { checkSakeJa: true, checkBrewery: true })

for (const article of guidesEn) {
  checkLinks(`data/guides-en.json (${article.slug})`, article.bodyHtml, {
    checkSakeEn: true,
    checkBrewery: true,
  })
}

if (errors.length > 0) {
  console.error(`\n✗ データ整合性チェックで ${errors.length} 件の問題が見つかりました:\n`)
  errors.forEach((e) => console.error(`  - ${e}`))
  console.error('')
  process.exit(1)
} else {
  console.log('✓ データ整合性チェック: 問題は見つかりませんでした')
}
