import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakeBySlug, getBreweryForSake } from '@/lib/data'
import { getAllEnSakeSlugs, getEnSakeContent } from '@/lib/i18n/en-content'
import { classificationEn } from '@/lib/i18n/classification'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { buildAffiliateLinks } from '@/lib/affiliate'
import { getOffersForSake, getOffersFetchedAt } from '@/lib/offers'
import { isProductionDomain } from '@/lib/is-production-domain'
import PurchaseButtons from '@/components/PurchaseButtons'
import ProductOfferCard from '@/components/ProductOfferCard'

export const revalidate = 86400

export function generateStaticParams() {
  return getAllEnSakeSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const sake = getSakeBySlug(params.slug)
  const en = getEnSakeContent(params.slug)
  if (!sake || !en) return {}

  const flavor = FLAVOR_TYPES[sake.flavorType]
  const description = `${sake.prefecture} ${classificationEn(sake.classification)} sake "${sake.name}". ${flavor.eng} style — tasting notes and where to buy.`.slice(0, 155)

  return {
    title: `${sake.name} | Tasting Notes & Where to Buy | Shizuku Sake Select`,
    description,
    alternates: {
      canonical: `/en/sake/${params.slug}`,
      languages: { 'ja-JP': `/sake/${params.slug}`, 'en-US': `/en/sake/${params.slug}` },
    },
    openGraph: { title: sake.name, description, type: 'website' },
  }
}

export default function EnSakeDetailPage({ params }: { params: { slug: string } }) {
  const sake = getSakeBySlug(params.slug)
  const en = getEnSakeContent(params.slug)
  if (!sake || !en) notFound()

  const brewery = getBreweryForSake(sake)
  const flavor = FLAVOR_TYPES[sake.flavorType]
  const mallLinks = buildAffiliateLinks(sake)
  const offers = getOffersForSake(sake.slug)
  const offersFetchedAt = getOffersFetchedAt()
  const production = isProductionDomain()
  const buttonMallLinks = offers.length > 0 ? mallLinks.filter((m) => m.mall !== 'rakuten') : mallLinks

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <Link href="/en/sake">Browse Sake</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{sake.name}</span>
      </nav>

      <header className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="content-pill content-pill--gold">{classificationEn(sake.classification)}</span>
          <span className="content-pill">{flavor.eng}</span>
        </div>
        <h1 className="content-title text-3xl md:text-4xl">{sake.name}</h1>
        <p className="mt-3 text-base" style={{ color: 'var(--mist)', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
          {sake.prefecture}
          {brewery && (
            <>
              {' '}/{' '}
              <Link href={`/en/sake`} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
                {brewery.name}
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">Tasting Notes</h2>
            <span className="panel-header__sub">ABOUT THIS SAKE</span>
          </div>
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--paper-white)', borderLeft: '2px solid var(--line-gold)', paddingLeft: '16px' }}
          >
            {en.descriptionEn}
          </p>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">Spec</h2>
            <span className="panel-header__sub">SPECIFICATION</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 min-[420px]:grid-cols-2 sm:grid-cols-3">
            {sake.specs.polishing != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>Rice polishing ratio</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.polishing}%</dd></div>
            )}
            {sake.specs.rice && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>Rice variety</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.rice}</dd></div>
            )}
            {sake.specs.abv != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>ABV</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.abv}%</dd></div>
            )}
            {sake.specs.smv != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>Sake Meter Value (SMV)</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.smv}</dd></div>
            )}
            {sake.specs.acid != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>Acidity</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.acid}</dd></div>
            )}
          </dl>
        </section>

        <section className="content-card" style={{ borderColor: 'rgba(201, 176, 106, 0.4)' }}>
          <div className="panel-header">
            <h2 className="panel-header__title">Where to Buy</h2>
            <span className="panel-header__sub">WHERE TO BUY</span>
          </div>
          <p className="mb-2 text-sm" style={{ color: 'var(--mist)' }}>This site contains affiliate advertising.</p>
          <p className="mb-4 text-sm" style={{ color: 'var(--mist)' }}>
            Purchase links go to Rakuten Ichiba (Japan). Most shops ship within Japan only —
            please confirm international shipping availability with the shop before ordering
            from outside Japan.
          </p>
          <ProductOfferCard sakeId={sake.id} slug={sake.slug} offers={offers} fetchedAt={offersFetchedAt} production={production} locale="en" />
          <PurchaseButtons sakeId={sake.id} slug={sake.slug} mallLinks={buttonMallLinks} sourceFlow="detail-en" locale="en" />
        </section>

        {brewery && (
          <section className="content-card">
            <div className="panel-header">
              <h2 className="panel-header__title">About the Brewery</h2>
              <span className="panel-header__sub">THE BREWERY</span>
            </div>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--paper-white)' }}>{brewery.name} — {brewery.prefecture}</p>
          </section>
        )}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href={`/sake/${sake.slug}`} lang="ja" className="content-back-link">日本語で見る (View in Japanese)</Link>
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
