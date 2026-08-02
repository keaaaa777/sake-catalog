import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllEnSakeSlugs, getAllEnGuideArticles } from '@/lib/i18n/en-content'
import { getSakeBySlug } from '@/lib/data'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Shizuku Sake Select — Discover Japanese Sake',
  description:
    'An English-language guide to Japanese sake: browse by flavor, region and food pairing, and buy the bottles you like.',
  alternates: { canonical: '/en', languages: { 'ja-JP': '/', 'en-US': '/en' } },
}

export default function EnHomePage() {
  const sakes = getAllEnSakeSlugs()
    .map((slug) => getSakeBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 8)
  const guides = getAllEnGuideArticles().slice(0, 6)

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-10 text-center">
        <p className="content-eyebrow mb-2">SHIZUKU SAKE SELECT</p>
        <h1 className="content-title text-3xl md:text-4xl">Discover Japanese Sake</h1>
        <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: 'var(--mist)' }}>
          Browse authentic Japanese sake by flavor profile, region, and food pairing.
          Each bottle links straight to where you can buy it.
        </p>
      </header>

      <section className="content-card mb-6">
        <div className="panel-header">
          <h2 className="panel-header__title">Featured Sake</h2>
          <span className="panel-header__sub">FEATURED</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>
            English sake pages are being added. Check back soon, or{' '}
            <Link href="/" lang="ja" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
              browse the full Japanese catalog
            </Link>
            .
          </p>
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
        {sakes.length > 0 && (
          <div className="mt-4">
            <Link href="/en/sake" className="content-back-link">See all translated sake →</Link>
          </div>
        )}
      </section>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">Sake Guide</h2>
          <span className="panel-header__sub">GUIDE</span>
        </div>
        {guides.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>English guide articles are coming soon.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {guides.map((a) => (
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
    </div>
  )
}
