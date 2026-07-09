// data/real-breweries-input.json (実蔵の紹介文) を data/breweries.json に上書き適用する。
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const breweries = require(path.join(DATA_DIR, 'breweries.json'))
const descriptions = require(path.join(DATA_DIR, 'real-breweries-input.json'))

let updated = 0
breweries.forEach((b) => {
  if (descriptions[b.name]) {
    b.description = descriptions[b.name]
    b.isRealData = true
    updated += 1
  }
})

fs.writeFileSync(
  path.join(DATA_DIR, 'breweries.json'),
  JSON.stringify(breweries, null, 2) + '\n'
)

console.log(`updated ${updated} / ${Object.keys(descriptions).length} brewery descriptions`)
