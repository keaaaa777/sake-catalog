import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDE_ARTICLES } from '@/lib/guides'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '日本酒ガイド|雫 SAKE SELECT',
  description: '日本酒度の読み方、特定名称の違い、保存方法など、日本酒をもっと楽しむための読み物記事をまとめました。',
}

export default function GuideListPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>日本酒ガイド</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">GUIDE</p>
        <h1 className="content-title text-3xl md:text-4xl">日本酒ガイド</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          日本酒をもっと楽しむための基礎知識をまとめた読み物です。
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">記事一覧</h2>
          <span className="panel-header__sub">{GUIDE_ARTICLES.length} ARTICLES</span>
        </div>
        <div className="flex flex-col gap-3">
          {GUIDE_ARTICLES.map((a) => (
            <Link key={a.slug} href={`/guide/${a.slug}`} className="content-mini-card">
              <div>
                <div className="content-mini-card__name">{a.title}</div>
                <div className="content-mini-card__meta" style={{ color: 'var(--mist)' }}>{a.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
