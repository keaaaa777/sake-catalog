const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const appRoot = path.join(root, 'app')
const scanRoots = ['app', 'components', 'lib'].map((dir) => path.join(root, dir))
const sakes = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sakes.json'), 'utf8'))
const breweries = JSON.parse(fs.readFileSync(path.join(root, 'data', 'breweries.json'), 'utf8'))
const sakesEn = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sakes-en.json'), 'utf8'))

const errors = []
const warnings = []

function walk(directory, predicate) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(fullPath, predicate))
    else if (predicate(fullPath)) files.push(fullPath)
  }
  return files
}

function routePatternFromPage(file) {
  let route = path.relative(appRoot, path.dirname(file)).replaceAll('\\', '/')
  route = route.split('/').filter((part) => !/^\(.+\)$/.test(part)).join('/')
  if (!route) return /^\/$/

  const escaped = route.split('/').map((part) => {
    if (/^\[\[\.\.\..+\]\]$/.test(part)) return '.*'
    if (/^\[\.\.\..+\]$/.test(part)) return '.+'
    if (/^\[.+\]$/.test(part)) return '[^/]+'
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }).join('/')
  return new RegExp(`^/${escaped}/?$`)
}

const pageFiles = walk(appRoot, (file) => path.basename(file) === 'page.tsx')
const routePatterns = pageFiles.map(routePatternFromPage)
const sourceFiles = scanRoots.flatMap((dir) => walk(dir, (file) => /\.(?:ts|tsx)$/.test(file)))

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const hrefPattern = /href=["'](\/[^"'${}]*)["']/g
  let match
  while ((match = hrefPattern.exec(source)) !== null) {
    const href = match[1].split(/[?#]/)[0] || '/'
    if (href.startsWith('/api/') || href.startsWith('/_next/')) continue
    if (!routePatterns.some((pattern) => pattern.test(href))) {
      errors.push(`[internal-link] ${path.relative(root, file)} -> ${match[1]}`)
    }
  }
}

const sakeSlugs = new Set(sakes.map((sake) => sake.slug))
for (const slug of Object.keys(sakesEn)) {
  if (!sakeSlugs.has(slug)) errors.push(`[translation] English sake has no Japanese source: ${slug}`)
}

function specCount(sake) {
  return Object.values(sake.specs || {}).filter(
    (value) => value !== null && value !== undefined && value !== ''
  ).length
}

function indexableSake(sake) {
  return sake.isRealData !== false
    && (sake.description || '').trim().length >= 60
    && specCount(sake) >= 2
    && Array.isArray(sake.servingTemp) && sake.servingTemp.length > 0
    && Array.isArray(sake.pairings) && sake.pairings.length > 0
    && Boolean(sake.breweryId)
}

const linkedSakeCounts = new Map()
for (const sake of sakes) {
  linkedSakeCounts.set(sake.breweryId, (linkedSakeCounts.get(sake.breweryId) || 0) + 1)
}
const indexableSakeCount = sakes.filter(indexableSake).length
const indexableBreweryCount = breweries.filter((brewery) =>
  brewery.isRealData !== false
  && (brewery.description || '').trim().length >= 30
  && (linkedSakeCounts.get(brewery.slug) || 0) > 0
).length

function reportDuplicates(items, key, label) {
  const counts = new Map()
  for (const item of items) counts.set(key(item), (counts.get(key(item)) || 0) + 1)
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1)
  if (duplicates.length > 0) {
    warnings.push(`${label}: ${duplicates.length} duplicate group(s)`)
  }
}

reportDuplicates(sakes, (sake) => sake.name.trim(), 'sake title candidates')
reportDuplicates(breweries, (brewery) => `${brewery.name.trim()}|${brewery.prefecture}`, 'brewery title candidates')
reportDuplicates(sakes, (sake) => sake.description.trim(), 'sake descriptions')
reportDuplicates(breweries, (brewery) => brewery.description.trim(), 'brewery descriptions')

const sitemapSource = fs.readFileSync(path.join(root, 'app', 'sitemap.ts'), 'utf8')
if (!sitemapSource.includes('.filter(isIndexableSake)')) {
  errors.push('[sitemap] sake pages are not filtered by the shared indexability rule')
}
if (!sitemapSource.includes('isIndexableBrewery')) {
  errors.push('[sitemap] brewery pages are not filtered by the shared indexability rule')
}

console.log(`SEO quality: indexable sake ${indexableSakeCount}/${sakes.length}`)
console.log(`SEO quality: indexable breweries ${indexableBreweryCount}/${breweries.length}`)

if (warnings.length > 0) {
  console.log('\nSEO warnings (do not stop the build):')
  warnings.forEach((warning) => console.log(`  - ${warning}`))
}

if (errors.length > 0) {
  console.error(`\nSEO quality check failed with ${errors.length} error(s):`)
  errors.forEach((error) => console.error(`  - ${error}`))
  process.exit(1)
}

console.log('\nSEO quality check passed')
