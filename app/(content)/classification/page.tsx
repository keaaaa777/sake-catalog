import type { Metadata } from 'next'
import Link from 'next/link'
import { getSakesByClassificationSlug } from '@/lib/data'
import { CLASSIFICATIONS, CLASSIFICATION_SLUG_IDS } from '@/lib/classification'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '特定名称から探す|純米・吟醸・大吟醸で選ぶ日本酒|雫 SAKE SELECT',
  description: '純米大吟醸・純米吟醸・純米・本醸造など、特定名称(精米歩合・原料による分類)から日本酒を探せます。',
  alternates: { canonical: '/classification' },
}

export default function ClassificationIndexPage() {
  const counted = CLASSIFICATION_SLUG_IDS
    .map((slug) => ({ slug, info: CLASSIFICATIONS[slug], count: getSakesByClassificationSlug(slug).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd items={[{ name: 'トップ', path: '/' }, { name: '特定名称から探す' }]} />
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>特定名称から探す</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">CLASSIFICATION</p>
        <h1 className="content-title text-3xl md:text-4xl">特定名称から探す</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          原料や精米歩合による分類(特定名称)から、好みの日本酒を探せます。
        </p>
        <Link href="/guide/junmai-ginjo-daiginjo-guide" className="mt-4 inline-block text-sm hover:underline" style={{ color: 'var(--gold-foil)' }}>
          特定名称の違いをやさしく解説したガイドを見る →
        </Link>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">分類一覧</h2>
          <span className="panel-header__sub">{counted.length} TYPES</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {counted.map(({ slug, info, count }) => (
            <Link key={slug} href={`/classification/${slug}`} className="content-mini-card items-start">
              <div>
                <div className="content-mini-card__name">{info.label}</div>
                <div className="content-mini-card__meta mb-1">{info.eng} / {count}銘柄</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--mist)' }}>{info.desc}</p>
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
