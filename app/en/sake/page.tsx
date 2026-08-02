import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllEnSakeSlugs } from '@/lib/i18n/en-content'
import { getSakeBySlug } from '@/lib/data'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Browse Sake in English | Shizuku Sake Select',
  description: 'Japanese sake bottles with English tasting notes and purchase links.',
  alternates: { canonical: '/en/sake' },
}

export default function EnSakeIndexPage() {
  const sakes = getAllEnSakeSlugs()
    .map((slug) => getSakeBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>Browse Sake</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">BROWSE</p>
        <h1 className="content-title text-3xl md:text-4xl">Sake with English Notes</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          We are translating our catalog one bottle at a time. More sake will appear here
          as English tasting notes are completed.
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">Sake list</h2>
          <span className="panel-header__sub">{sakes.length} BOTTLES</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>No English pages are published yet. Please check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sakes.map((s) => (
              <Link key={s.id} href={`/en/sake/${s.slug}`} className="content-mini-card">
                <SakeThumb sake={s} size={40} />
                <div>
                  <div className="content-mini-card__name">{s.name}</div>
                  <div className="content-mini-card__meta">{s.prefecture}</div>
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
