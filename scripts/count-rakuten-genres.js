// 楽天市場に出品されている酒類の商品数を、商品検索APIの検索ヒット数(count)で
// キーワードごとに概算する調査用スクリプト。将来的に日本酒以外のジャンル
// (焼酎・ビール・ワイン・ウイスキー等)を扱うサイトを作る際の市場規模把握用。
//
// 注意: キーワード検索のヒット件数であり、正式なジャンル別カタログ件数ではない
// (表記ゆれ・関連商品混入等で実際のジャンル件数とはズレる)。あくまで規模感の
// 参考値として扱うこと。
//
// 使い方: node scripts/count-rakuten-genres.js
const path = require('path')
const fs = require('fs')

const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(envFile)
  } else {
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match || process.env[match[1]] !== undefined) continue
      process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
}

const ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701'
const REGISTERED_SITE_URL = process.env.RAKUTEN_REGISTERED_SITE_URL || 'https://sake-catalog.vercel.app/'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function searchCount(keyword) {
  const appId = process.env.RAKUTEN_APP_ID
  const accessKey = process.env.RAKUTEN_ACCESS_KEY
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID
  const isMissing = (value) => !value || /^(your-|.*placeholder|x{3,})/i.test(value)
  if (isMissing(appId)) throw new Error('RAKUTEN_APP_ID が .env.local に設定されていません')
  if (isMissing(accessKey)) throw new Error('RAKUTEN_ACCESS_KEY が .env.local に設定されていません')
  if (isMissing(affiliateId)) throw new Error('RAKUTEN_AFFILIATE_ID が未設定、またはプレースホルダーのままです')

  const url = new URL(ENDPOINT)
  url.searchParams.set('applicationId', appId)
  url.searchParams.set('accessKey', accessKey)
  url.searchParams.set('affiliateId', affiliateId)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', '1')
  url.searchParams.set('formatVersion', '2')

  const res = await fetch(url.toString(), {
    headers: {
      Referer: REGISTERED_SITE_URL,
      Origin: REGISTERED_SITE_URL.replace(/\/$/, ''),
    },
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText} ${errBody}`)
  }
  const body = await res.json()
  return body.count
}

// 「◯◯ -プレゼント -グラス -セット」のように明らかな非酒類ノイズを除外する
// フィルタは行っていない(概算値のため)。数字は目安として使うこと。
const KEYWORDS = [
  { label: '日本酒', keyword: '日本酒' },
  { label: '焼酎', keyword: '焼酎' },
  { label: 'ビール', keyword: 'ビール' },
  { label: '発泡酒', keyword: '発泡酒' },
  { label: 'ワイン', keyword: 'ワイン' },
  { label: 'ウイスキー', keyword: 'ウイスキー' },
  { label: '梅酒', keyword: '梅酒' },
  { label: 'クラフトジン', keyword: 'クラフトジン' },
  { label: 'ラム酒', keyword: 'ラム酒' },
  { label: 'サワー・チューハイ', keyword: 'チューハイ' },
]

async function main() {
  console.log('=== 楽天市場 キーワード検索ヒット件数(概算) ===\n')
  const results = []
  for (const k of KEYWORDS) {
    try {
      const count = await searchCount(k.keyword)
      results.push({ ...k, count })
      console.log(`${k.label}: ${count.toLocaleString()}件`)
    } catch (err) {
      results.push({ ...k, count: null, error: err.message })
      console.error(`${k.label}: 取得失敗 (${err.message})`)
    }
    await sleep(1000)
  }

  const outFile = path.join(__dirname, '..', 'data', 'cache', 'rakuten-genre-counts.json')
  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(outFile, JSON.stringify({ fetchedAt: new Date().toISOString(), results }, null, 2) + '\n')
  console.log(`\n書き出し完了: ${outFile}`)
}

main()
