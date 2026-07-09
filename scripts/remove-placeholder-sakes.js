// isRealData !== true の仮データ(プレースホルダー銘柄)を data/sakes.json から削除する。
// 実データ投入が完了したプレフェクチャ/蔵のみが残る。
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const sakes = require(path.join(DATA_DIR, 'sakes.json'))

const before = sakes.length
const real = sakes.filter((s) => s.isRealData === true)
const removed = before - real.length

fs.writeFileSync(
  path.join(DATA_DIR, 'sakes.json'),
  JSON.stringify(real, null, 2) + '\n'
)

console.log(`removed ${removed} placeholder entries, kept ${real.length} real entries (was ${before} total)`)
