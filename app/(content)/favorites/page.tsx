import type { Metadata } from 'next'
import Link from 'next/link'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import FavoritesClient from './FavoritesClient'

export const metadata: Metadata = {
  title: 'お気に入りの日本酒 | 雫 SAKE SELECT',
  description: '保存した日本酒を一覧で確認し、気になる銘柄を比較できます。',
  robots: { index: false, follow: true },
}

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <BreadcrumbJsonLd items={[{ name: 'トップ', path: '/' }, { name: 'お気に入り' }]} />
      <nav className="content-breadcrumb"><Link href="/">トップ</Link><span>/</span><span style={{ color: 'var(--paper-white)' }}>お気に入り</span></nav>
      <header className="mb-8">
        <p className="content-eyebrow mb-2">FAVORITES</p>
        <h1 className="content-title text-3xl md:text-4xl">お気に入りの日本酒</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>気になる銘柄を保存して、最大3本まで並べて比較できます。</p>
      </header>
      <FavoritesClient />
    </div>
  )
}
