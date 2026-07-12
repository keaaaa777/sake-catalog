import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSakes } from '@/lib/data'
import SearchClient from './SearchClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '銘柄から探す|日本酒を名前・蔵元から検索|雫 SAKE SELECT',
  description: '格付けや醸造元の名前から、日本酒の銘柄を直接検索できます。',
}

export default function SearchIndexPage() {
  const sakes = getAllSakes()

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>銘柄から探す</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">FAMOUS BRANDS</p>
        <h1 className="content-title text-3xl md:text-4xl">銘柄から探す</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          格付け、醸造元の名前から日本酒を直接探せます。
        </p>
      </header>

      <SearchClient sakes={sakes} />

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
