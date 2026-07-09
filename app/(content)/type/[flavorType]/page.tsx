import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByFlavorType } from '@/lib/data'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'
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
    title: `${flavor.label}(${flavor.eng})タイプの日本酒一覧|雫 SAKE SELECT`,
    description: `${flavor.desc} ${flavor.label}タイプの日本酒を一覧で紹介します。`,
  }
}

export default function TypePage({ params }: { params: { flavorType: string } }) {
  const flavorType = params.flavorType as FlavorType
  const flavor = FLAVOR_TYPES[flavorType]
  if (!flavor) notFound()

  const sakes = getSakesByFlavorType(flavorType)

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{flavor.label}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">{flavor.eng}</p>
        <h1 className="content-title text-3xl md:text-4xl">
          {flavor.label} <span className="text-lg" style={{ color: 'var(--mist)' }}>({flavor.kana})</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'var(--mist)' }}>{flavor.desc}</p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">銘柄一覧</h2>
          <span className="panel-header__sub">{sakes.length} SAKE</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>現在このタイプの銘柄は準備中です。</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sakes.map((s) => (
              <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                <SakeThumb sake={s} size={40} />
                <div>
                  <div className="content-mini-card__name">{s.name}</div>
                  <div className="content-mini-card__meta">{s.prefecture} / {s.classification}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
