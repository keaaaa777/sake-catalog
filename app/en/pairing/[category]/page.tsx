import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByPairing } from '@/lib/data'
import { PAIRING_CATEGORIES, PAIRING_CATEGORY_IDS } from '@/lib/pairing'
import { PAIRING_LABEL_EN } from '@/lib/i18n/categories-en'
import { getAllEnSakeSlugs } from '@/lib/i18n/en-content'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export function generateStaticParams() {
  return PAIRING_CATEGORY_IDS.map((category) => ({ category }))
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const label = PAIRING_LABEL_EN[params.category]
  if (!label) return {}
  return {
    title: `Sake to Pair with ${label} | Shizuku Sake Select`,
    description: `Japanese sake that pairs well with ${label.toLowerCase()}.`,
    alternates: {
      canonical: `/en/pairing/${params.category}`,
      languages: { 'ja-JP': `/pairing/${params.category}`, 'en-US': `/en/pairing/${params.category}` },
    },
  }
}

export default function EnPairingPage({ params }: { params: { category: string } }) {
  const category = PAIRING_CATEGORIES[params.category]
  const label = PAIRING_LABEL_EN[params.category]
  if (!category || !label) notFound()

  const enSlugs = new Set(getAllEnSakeSlugs())
  const sakes = getSakesByPairing(params.category).filter((s) => enSlugs.has(s.slug))

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{label}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">FOOD PAIRING</p>
        <h1 className="content-title text-3xl md:text-4xl">Sake to Pair with {label}</h1>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">Sake list</h2>
          <span className="panel-header__sub">{sakes.length} BOTTLES</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>
            No English pages for this pairing yet. Browse the{' '}
            <Link href={`/pairing/${params.category}`} lang="ja" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
              Japanese version
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
      </section>

      <div className="mt-12">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
