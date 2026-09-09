import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSakes, getAllBreweries } from '@/lib/data'
import CompareClient from './CompareClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '日本酒を比較する|銘柄を並べて味わい・価格をチェック|雫 SAKE SELECT',
  description: '気になる日本酒を2〜3本選んで、味わい・スペック・購入先を並べて比較できます。',
  // 選択した銘柄によってURLのクエリが変わるため、正規URLは固定して重複コンテンツを避ける。
  alternates: { canonical: '/compare' },
}

export default function ComparePage({ searchParams }: { searchParams: { slugs?: string } }) {
  const sakes = getAllSakes()
  const breweryMap = Object.fromEntries(
    getAllBreweries().map((b) => [b.slug, { name: b.name, slug: b.slug }])
  )
  const validSlugs = new Set(sakes.map((s) => s.slug))
  const initialSlugs = (searchParams.slugs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => validSlugs.has(s))
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>比較する</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">COMPARE</p>
        <h1 className="content-title text-3xl md:text-4xl">日本酒を比較する</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          気になる銘柄を2〜3本選ぶと、味わい・スペック・購入先を並べて確認できます。
        </p>
      </header>

      <CompareClient sakes={sakes} breweryMap={breweryMap} initialSlugs={initialSlugs} />

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
