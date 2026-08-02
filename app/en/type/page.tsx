import type { Metadata } from 'next'
import Link from 'next/link'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'
import { FLAVOR_DESC_EN } from '@/lib/i18n/categories-en'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Browse by Flavor Type | Shizuku Sake Select',
  description: 'Explore Japanese sake by four flavor profiles: fragrant, light & fresh, rich, and aged.',
  alternates: { canonical: '/en/type', languages: { 'ja-JP': '/type', 'en-US': '/en/type' } },
}

export default function EnTypeIndexPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>Browse by Flavor</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">FLAVOUR PROFILE</p>
        <h1 className="content-title text-3xl md:text-4xl">Browse by Flavor</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          Japanese sake is often grouped into four broad flavor styles. Pick the one that matches your mood.
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">Four Flavor Types</h2>
          <span className="panel-header__sub">4 TYPES</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FLAVOR_TYPE_IDS.map((id) => {
            const flavor = FLAVOR_TYPES[id]
            return (
              <Link key={id} href={`/en/type/${id}`} className="content-mini-card items-start">
                <div>
                  <div className="content-mini-card__name">{flavor.eng}</div>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--mist)' }}>{FLAVOR_DESC_EN[id]}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-12">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
