import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByClassificationSlug } from '@/lib/data'
import { CLASSIFICATIONS, CLASSIFICATION_SLUG_IDS } from '@/lib/classification'
import { getGuidesLinkingTo } from '@/lib/guides'
import SakeFavoriteCard from '@/components/SakeFavoriteCard'
import RelatedGuides from '@/components/RelatedGuides'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { isIndexableSake } from '@/lib/indexability'

export const revalidate = 86400

export function generateStaticParams() {
  return CLASSIFICATION_SLUG_IDS.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const classification = CLASSIFICATIONS[params.slug]
  if (!classification) return {}
  const indexable = getSakesByClassificationSlug(params.slug).some(isIndexableSake)
  return {
    title: `${classification.label}の日本酒一覧|雫 SAKE SELECT`,
    description: `${classification.desc} ${classification.label}に該当する日本酒を一覧で紹介します。`,
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: { canonical: `/classification/${params.slug}` },
  }
}

export default function ClassificationPage({ params }: { params: { slug: string } }) {
  const classification = CLASSIFICATIONS[params.slug]
  if (!classification) notFound()

  const sakes = getSakesByClassificationSlug(params.slug)
  const relatedGuides = getGuidesLinkingTo(`/classification/${params.slug}`)

  return (
    <div className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd
        items={[
          { name: 'トップ', path: '/' },
          { name: '特定名称から探す', path: '/classification' },
          { name: classification.label },
        ]}
      />
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <Link href="/classification">特定名称から探す</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{classification.label}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">{classification.eng}</p>
        <h1 className="content-title text-3xl md:text-4xl">{classification.label}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'var(--mist)' }}>{classification.desc}</p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">銘柄一覧</h2>
          <span className="panel-header__sub">{sakes.length} SAKE</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>現在この分類の銘柄は準備中です。</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sakes.map((s) => (
              <SakeFavoriteCard key={s.id} sake={s} meta={s.prefecture} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <RelatedGuides guides={relatedGuides} />
      </div>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
