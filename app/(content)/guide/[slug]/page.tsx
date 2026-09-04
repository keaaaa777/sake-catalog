import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GUIDE_SLUGS, getGuideArticleBySlug } from '@/lib/guides'
import { getEnGuideArticleBySlug } from '@/lib/i18n/en-content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog.vercel.app'

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
  const author = article.author ?? '雫 SAKE SELECT編集部'
  const updatedAt = article.updatedAt ?? article.publishedAt

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: updatedAt,
    author: { '@type': 'Organization', name: author },
    publisher: { '@type': 'Organization', name: '雫 SAKE SELECT' },
    mainEntityOfPage: `${SITE_URL}/guide/${article.slug}`,
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
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--mist)' }}>
          <div className="flex gap-2"><dt>執筆</dt><dd style={{ color: 'var(--paper-white)' }}>{author}</dd></div>
          <div className="flex gap-2"><dt>公開</dt><dd>{article.publishedAt}</dd></div>
          <div className="flex gap-2"><dt>更新</dt><dd>{updatedAt}</dd></div>
          {article.reviewedBy && <div className="flex gap-2"><dt>確認</dt><dd>{article.reviewedBy}</dd></div>}
        </dl>
      </header>

      <section className="content-card">
        <div className="guide-prose" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
      </section>

      <section className="content-card mt-8 text-sm leading-relaxed" style={{ color: 'var(--mist)' }}>
        <div className="panel-header">
          <h2 className="panel-header__title">記事の情報源と方針</h2>
          <span className="panel-header__sub">SOURCES</span>
        </div>
        {article.references && article.references.length > 0 ? (
          <ul className="space-y-2">
            {article.references.map((reference) => (
              <li key={reference.url}>
                <a href={reference.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
                  {reference.title} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>この記事は参考資料の表示を順次整備しています。内容にお気づきの点がある場合は訂正窓口からお知らせください。</p>
        )}
        <p className="mt-4">
          <Link href="/editorial-policy" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>編集方針</Link>
          <span> ・ </span>
          <Link href="/corrections" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>訂正・削除の連絡</Link>
        </p>
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
