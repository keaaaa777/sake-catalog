import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllEnGuideArticles, getEnGuideArticleBySlug } from '@/lib/i18n/en-content'

export const revalidate = 86400

export function generateStaticParams() {
  return getAllEnGuideArticles().map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getEnGuideArticleBySlug(params.slug)
  if (!article) return {}
  return {
    title: `${article.title} | Shizuku Sake Select`,
    description: article.description,
    alternates: {
      canonical: `/en/guide/${params.slug}`,
      languages: { 'ja-JP': `/guide/${params.slug}`, 'en-US': `/en/guide/${params.slug}` },
    },
  }
}

export default function EnGuideArticlePage({ params }: { params: { slug: string } }) {
  const article = getEnGuideArticleBySlug(params.slug)
  if (!article) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <Link href="/en/guide">Guide</Link>
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
        <Link href="/en/guide" className="content-back-link">More guide articles</Link>
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
