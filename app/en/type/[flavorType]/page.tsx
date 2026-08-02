import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByFlavorType } from '@/lib/data'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'
import { FLAVOR_DESC_EN } from '@/lib/i18n/categories-en'
import { getAllEnSakeSlugs } from '@/lib/i18n/en-content'
import { FlavorType } from '@/lib/types'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export function generateStaticParams() {
  return FLAVOR_TYPE_IDS.map((flavorType) => ({ flavorType }))
}

export function generateMetadata({ params }: { params: { flavorType: string } }): Metadata {
  const flavor = FLAVOR_TYPES[params.flavorType as FlavorType]
  if (!flavor) return {}
  return {
    title: `${flavor.eng} Sake | Shizuku Sake Select`,
    description: FLAVOR_DESC_EN[params.flavorType as FlavorType],
    alternates: {
      canonical: `/en/type/${params.flavorType}`,
      languages: { 'ja-JP': `/type/${params.flavorType}`, 'en-US': `/en/type/${params.flavorType}` },
    },
  }
}

export default function EnTypePage({ params }: { params: { flavorType: string } }) {
  const flavorType = params.flavorType as FlavorType
  const flavor = FLAVOR_TYPES[flavorType]
  if (!flavor) notFound()

  const enSlugs = new Set(getAllEnSakeSlugs())
  const sakes = getSakesByFlavorType(flavorType).filter((s) => enSlugs.has(s.slug))

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <Link href="/en/type">Browse by Flavor</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{flavor.eng}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">{flavor.eng}</p>
        <h1 className="content-title text-3xl md:text-4xl">{flavor.eng} Sake</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'var(--mist)' }}>{FLAVOR_DESC_EN[flavorType]}</p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">Sake list</h2>
          <span className="panel-header__sub">{sakes.length} BOTTLES</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>
            No English pages for this style yet. Browse the{' '}
            <Link href={`/type/${flavorType}`} lang="ja" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
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
