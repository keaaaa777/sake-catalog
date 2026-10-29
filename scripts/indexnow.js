// IndexNow(Bing・Yandex など)へ更新したURLを通知する。
// 本番にデプロイした後に実行する。キーファイル public/<key>.txt が本番で読めることを確認してから送信する。
//
//   node scripts/indexnow.js /guide/atsukan-guide /area/niigata   … 指定したパスだけ通知
//   node scripts/indexnow.js --since 2026-10-29                   … サイトマップのうち lastmod がその日以降のURL
//   node scripts/indexnow.js --all                                … サイトマップの全URL
const fs = require('fs')
const path = require('path')

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog-japan.vercel.app').replace(/\/$/, '')
const ENDPOINT = 'https://api.indexnow.org/indexnow'

function findKey() {
  const publicDir = path.join(__dirname, '..', 'public')
  const file = fs.readdirSync(publicDir).find((name) => /^[0-9a-f]{32}\.txt$/.test(name))
  if (!file) throw new Error('public/ に IndexNow のキーファイル(<32桁の16進>.txt)がありません')
  const key = fs.readFileSync(path.join(publicDir, file), 'utf8').trim()
  if (`${key}.txt` !== file) throw new Error(`キーファイル ${file} の中身がファイル名と一致しません`)
  return key
}

async function sitemapEntries() {
  const xml = await (await fetch(`${SITE_URL}/sitemap.xml`)).text()
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
    loc: (block.match(/<loc>([^<]+)<\/loc>/) || [])[1],
    lastmod: (block.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1],
  }))
}

async function resolveUrls(args) {
  if (args[0] === '--all') return (await sitemapEntries()).map((e) => e.loc)
  if (args[0] === '--since') {
    const since = args[1]
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since || '')) throw new Error('--since には YYYY-MM-DD を指定してください')
    return (await sitemapEntries()).filter((e) => e.lastmod && e.lastmod.slice(0, 10) >= since).map((e) => e.loc)
  }
  return args.map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`))
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.log('使い方: node scripts/indexnow.js <パス...> | --since YYYY-MM-DD | --all')
    process.exit(1)
  }

  const key = findKey()
  const keyLocation = `${SITE_URL}/${key}.txt`
  const live = await fetch(keyLocation)
  if (!live.ok || (await live.text()).trim() !== key) {
    throw new Error(`本番でキーファイルを確認できません(${keyLocation})。デプロイ後に実行してください`)
  }

  const host = new URL(SITE_URL).host
  const urlList = [...new Set(await resolveUrls(args))].filter((u) => new URL(u).host === host)
  if (urlList.length === 0) {
    console.log('通知するURLがありません')
    return
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  })
  // 200: 受理 / 202: 受理(キー検証待ち) / 4xx: 失敗
  console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URL)`)
  if (res.status >= 400) {
    console.log(await res.text())
    process.exit(1)
  }
  urlList.forEach((u) => console.log(`  ${u}`))
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
