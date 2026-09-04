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
const warnings = []

const sakes = readJson('data/sakes.json')
const breweries = readJson('data/breweries.json')
const sakesEn = readJson('data/sakes-en.json')
const guidesEn = readJson('data/guides-en.json')
const guidesTs = readText('lib/guides.ts')

const sakeSlugs = new Set(sakes.map((s) => s.slug))
const brewerySlugs = new Set(breweries.map((b) => b.slug))
const enSakeSlugs = new Set(Object.keys(sakesEn))

function findDuplicates(items, getKey, label) {
  const seen = new Set()
  for (const item of items) {
    const key = getKey(item)
    if (seen.has(key)) errors.push(`[duplicate] ${label} "${key}" が重複しています`)
    seen.add(key)
  }
}

function isHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function isOlderThan(value, days) {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) || Date.now() - timestamp > days * 24 * 60 * 60 * 1000
}

findDuplicates(sakes, (s) => s.id, 'sake id')
findDuplicates(sakes, (s) => s.slug, 'sake slug')
findDuplicates(breweries, (b) => b.id, 'brewery id')
findDuplicates(breweries, (b) => b.slug, 'brewery slug')

// 1. breweryId の参照整合性 (sakes.json の breweryId は breweries.json の slug を参照する)
for (const sake of sakes) {
  if (!brewerySlugs.has(sake.breweryId)) {
    errors.push(`[breweryId] data/sakes.json の "${sake.slug}" (id: ${sake.id}) が存在しない breweryId "${sake.breweryId}" を参照しています`)
  }

  if (sake.verificationStatus === 'verified' && (!Array.isArray(sake.sources) || sake.sources.length === 0)) {
    errors.push(`[source] "${sake.slug}" は verified ですが、sources がありません`)
  }
  for (const source of sake.sources || []) {
    if (!source.title || !isHttpUrl(source.url)) {
      errors.push(`[source] "${sake.slug}" に無効な出典があります`)
    }
  }
  if (sake.imageRightsStatus === 'approved' && (!sake.imageUrl || sake.imageUrl === '🍶')) {
    errors.push(`[image] "${sake.slug}" は画像利用承認済みですが、有効な imageUrl がありません`)
  }
  if (sake.imageSourceUrl && !isHttpUrl(sake.imageSourceUrl)) {
    errors.push(`[image] "${sake.slug}" の imageSourceUrl が無効です`)
  }
}

for (const brewery of breweries) {
  if (brewery.verificationStatus === 'verified' && (!Array.isArray(brewery.sources) || brewery.sources.length === 0)) {
    errors.push(`[source] 酒蔵 "${brewery.slug}" は verified ですが、sources がありません`)
  }
  if (brewery.websiteUrl && !isHttpUrl(brewery.websiteUrl)) {
    errors.push(`[url] 酒蔵 "${brewery.slug}" の websiteUrl が無効です`)
  }
  for (const source of brewery.sources || []) {
    if (!source.title || !isHttpUrl(source.url)) {
      errors.push(`[source] 酒蔵 "${brewery.slug}" に無効な出典があります`)
    }
  }
}

const missingSakeSources = sakes.filter((s) => !Array.isArray(s.sources) || s.sources.length === 0).length
const missingSakeReviewDates = sakes.filter((s) => !s.lastReviewedAt).length
const staleSakeReviewDates = sakes.filter((s) => isOlderThan(s.lastReviewedAt, 365)).length
const placeholderImages = sakes.filter((s) => !s.imageUrl || s.imageUrl === '🍶').length
const missingBrewerySources = breweries.filter((b) => !Array.isArray(b.sources) || b.sources.length === 0).length
const missingBreweryUrls = breweries.filter((b) => !b.websiteUrl).length
const staleBreweryReviewDates = breweries.filter((b) => isOlderThan(b.lastReviewedAt, 365)).length
const sakeNameCounts = sakes.reduce((counts, sake) => counts.set(sake.name, (counts.get(sake.name) || 0) + 1), new Map())
const duplicateSakeNames = [...sakeNameCounts.values()].filter((count) => count > 1).length
const referencedBrewerySlugs = new Set(sakes.map((s) => s.breweryId).filter(Boolean))
const orphanedBreweries = breweries.filter((b) => !referencedBrewerySlugs.has(b.slug)).length

if (missingSakeSources) warnings.push(`銘柄の出典未登録: ${missingSakeSources}/${sakes.length}`)
if (missingSakeReviewDates) warnings.push(`銘柄の最終確認日未登録: ${missingSakeReviewDates}/${sakes.length}`)
if (staleSakeReviewDates) warnings.push(`銘柄の最終確認日が1年以上前または不正: ${staleSakeReviewDates}/${sakes.length}`)
if (placeholderImages) warnings.push(`銘柄の画像未整備: ${placeholderImages}/${sakes.length}`)
if (missingBrewerySources) warnings.push(`酒蔵の出典未登録: ${missingBrewerySources}/${breweries.length}`)
if (missingBreweryUrls) warnings.push(`酒蔵の公式URL未登録: ${missingBreweryUrls}/${breweries.length}`)
if (staleBreweryReviewDates) warnings.push(`酒蔵の最終確認日が1年以上前または不正: ${staleBreweryReviewDates}/${breweries.length}`)
if (duplicateSakeNames) warnings.push(`同名銘柄（容量・年度違いを含む可能性）: ${duplicateSakeNames}組`)
if (orphanedBreweries) warnings.push(`銘柄から参照されていない酒蔵: ${orphanedBreweries}/${breweries.length}`)

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
  if (warnings.length > 0) {
    console.log('\n情報整備の進捗（警告扱い・ビルドは停止しません）:')
    warnings.forEach((warning) => console.log(`  - ${warning}`))
  }
}
