import fs from 'fs'
import path from 'path'

// Codexが生成する data/sakes-en.json / data/guides-en.json を読み込む。
// 翻訳がまだ無い銘柄・記事も多いため、ファイル自体が存在しない/該当キーが無い
// 場合は空データとして扱い、呼び出し側は英語ページを生成しないフォールバックにする。

export interface EnSakeContent {
  descriptionEn: string
}

export interface EnGuideArticle {
  slug: string
  title: string
  description: string
  bodyHtml: string
}

let sakesCache: Record<string, EnSakeContent> | null | undefined
let guidesCache: EnGuideArticle[] | null | undefined

export function getEnSakeContent(slug: string): EnSakeContent | undefined {
  if (sakesCache === undefined) {
    const file = path.join(process.cwd(), 'data', 'sakes-en.json')
    sakesCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
  }
  return sakesCache?.[slug]
}

export function getAllEnSakeSlugs(): string[] {
  if (sakesCache === undefined) {
    const file = path.join(process.cwd(), 'data', 'sakes-en.json')
    sakesCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
  }
  return Object.keys(sakesCache || {})
}

function loadGuides(): EnGuideArticle[] {
  if (guidesCache === undefined) {
    const file = path.join(process.cwd(), 'data', 'guides-en.json')
    guidesCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : []
  }
  return guidesCache || []
}

export function getAllEnGuideArticles(): EnGuideArticle[] {
  return loadGuides()
}

export function getEnGuideArticleBySlug(slug: string): EnGuideArticle | undefined {
  return loadGuides().find((a) => a.slug === slug)
}
