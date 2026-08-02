import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllEnGuideArticles } from '@/lib/i18n/en-content'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Sake Guide | Shizuku Sake Select',
  description: 'Beginner-friendly articles about Japanese sake: how to read labels, classifications, serving temperature, and more.',
  alternates: { canonical: '/en/guide' },
}

export default function EnGuideListPage() {
  const articles = getAllEnGuideArticles()

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>Guide</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">GUIDE</p>
        <h1 className="content-title text-3xl md:text-4xl">Sake Guide</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          Everything you need to get started with Japanese sake.
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">Articles</h2>
          <span className="panel-header__sub">{articles.length} ARTICLES</span>
        </div>
        {articles.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>
            English guide articles are being translated. Please check back soon, or read the{' '}
            <Link href="/guide" lang="ja" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
              Japanese guide
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map((a) => (
              <Link key={a.slug} href={`/en/guide/${a.slug}`} className="content-mini-card">
                <div>
                  <div className="content-mini-card__name">{a.title}</div>
                  <div className="content-mini-card__meta" style={{ color: 'var(--mist)' }}>{a.description}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
