// 都道府県別の穴埋めテンプレートがそのまま複数の蔵元に使われている説明文を、
// 各蔵元に紐づく実際の掲載銘柄(既に出典確認済みのデータ)に基づいて書き分ける。
// 新規のWeb調査は行わず、自社データのみで重複コンテンツを解消する。
const fs = require('fs')
const path = require('path')

const BREWERIES_PATH = path.join(__dirname, '..', 'data', 'breweries.json')
const SAKES_PATH = path.join(__dirname, '..', 'data', 'sakes.json')

const breweries = JSON.parse(fs.readFileSync(BREWERIES_PATH, 'utf-8'))
const sakes = JSON.parse(fs.readFileSync(SAKES_PATH, 'utf-8'))

const sakesByBrewery = new Map()
for (const s of sakes) {
  if (!s.breweryId) continue
  if (!sakesByBrewery.has(s.breweryId)) sakesByBrewery.set(s.breweryId, [])
  sakesByBrewery.get(s.breweryId).push(s)
}

function specCount(sake) {
  return Object.values(sake.specs || {}).filter((v) => v !== null && v !== undefined && v !== '').length
}

function pickRepresentativeSake(list) {
  return [...list].sort((a, b) => {
    const scoreDiff = specCount(b) - specCount(a)
    if (scoreDiff !== 0) return scoreDiff
    return (b.description?.length || 0) - (a.description?.length || 0)
  })[0]
}

// 重複グループ(同一description文を持つ蔵元が2件以上)を検出
const groups = new Map()
for (const b of breweries) {
  const key = b.description.trim()
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(b)
}
const duplicateGroups = [...groups.entries()].filter(([, list]) => list.length > 1)

const today = new Date().toISOString().slice(0, 10)
let updated = 0

for (const [, list] of duplicateGroups) {
  for (const brewery of list) {
    const linked = sakesByBrewery.get(brewery.slug) || []
    if (linked.length === 0) continue // 掲載銘柄がない場合はテンプレート文のまま残す

    const top = pickRepresentativeSake(linked)
    const newDescription =
      linked.length === 1
        ? `${brewery.prefecture}の蔵元「${brewery.name}」。当サイトでは「${top.name}」(${top.classification})を掲載している。`
        : `${brewery.prefecture}の蔵元「${brewery.name}」。当サイトでは「${top.name}」(${top.classification})をはじめ、${linked.length}銘柄を掲載している。`

    brewery.description = newDescription
    brewery.lastReviewedAt = today
    updated += 1
  }
}

fs.writeFileSync(BREWERIES_PATH, JSON.stringify(breweries, null, 2) + '\n', 'utf-8')
console.log(`updated ${updated} brewery description(s) across ${duplicateGroups.length} duplicate group(s)`)
