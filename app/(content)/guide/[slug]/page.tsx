import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDE_SLUGS, getGuideArticleBySlug } from '@/lib/guides'
import { getEnGuideArticleBySlug } from '@/lib/i18n/en-content'

export const revalidate = 86400

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getGuideArticleBySlug(params.slug)
  if (!article) return {}
  const hasEn = Boolean(getEnGuideArticleBySlug(params.slug))

  return {
    title: `${article.title}|雫 SAKE SELECT`,
    description: article.description,
    alternates: {
      canonical: `/guide/${params.slug}`,
      ...(hasEn ? { languages: { 'ja-JP': `/guide/${params.slug}`, 'en-US': `/en/guide/${params.slug}` } } : {}),
    },
  }
}

export default function GuideArticlePage({ params }: { params: { slug: string } }) {
  const article = getGuideArticleBySlug(params.slug)
  if (!article) notFound()
  const hasEn = Boolean(getEnGuideArticleBySlug(params.slug))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
  }

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <Link href="/guide">日本酒ガイド</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{article.title}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">GUIDE</p>
        <h1 className="content-title text-3xl md:text-4xl">{article.title}</h1>
      </header>

      <section className="content-card">
        <div className="guide-prose" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        {hasEn && (
          <Link href={`/en/guide/${article.slug}`} lang="en" className="content-back-link">Read in English</Link>
        )}
        <Link href="/guide" className="content-back-link">他のガイド記事を見る</Link>
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
