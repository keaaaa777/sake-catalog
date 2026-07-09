import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByPairing } from '@/lib/data'
import { PAIRING_CATEGORIES, PAIRING_CATEGORY_IDS } from '@/lib/pairing'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export function generateStaticParams() {
  return PAIRING_CATEGORY_IDS.map((category) => ({ category }))
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const category = PAIRING_CATEGORIES[params.category]
  if (!category) return {}
  return {
    title: `${category.label}に合う日本酒|雫 SAKE SELECT`,
    description: `${category.label}と好相性の日本酒を一覧で紹介。今夜の料理に合う一杯を探せます。`,
  }
}

export default function PairingPage({ params }: { params: { category: string } }) {
  const category = PAIRING_CATEGORIES[params.category]
  if (!category) notFound()

  const sakes = getSakesByPairing(params.category)

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{category.label}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">FOOD PAIRING</p>
        <h1 className="content-title text-3xl md:text-4xl">{category.label}に合う日本酒</h1>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title" style={{ fontSize: '18px' }}>銘柄一覧</h2>
          <span className="panel-header__sub">{sakes.length} SAKE</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>現在この料理に合う銘柄は準備中です。</p>
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
