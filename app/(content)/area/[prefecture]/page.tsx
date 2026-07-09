import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByPrefecture } from '@/lib/data'
import { PREFECTURE_SLUGS } from '@/lib/types'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

const SLUG_TO_PREFECTURE: Record<string, string> = Object.fromEntries(
  Object.entries(PREFECTURE_SLUGS).map(([pref, slug]) => [slug, pref])
)

export function generateStaticParams() {
  return Object.values(PREFECTURE_SLUGS).map((slug) => ({ prefecture: slug }))
}

export function generateMetadata({ params }: { params: { prefecture: string } }): Metadata {
  const pref = SLUG_TO_PREFECTURE[params.prefecture]
  if (!pref) return {}
  return {
    title: `${pref}の日本酒一覧|雫 SAKE SELECT`,
    description: `${pref}の蔵元が醸す日本酒を一覧で紹介。味わいや購入先から自分に合う一杯を探せます。`,
  }
}

export default function AreaPage({ params }: { params: { prefecture: string } }) {
  const pref = SLUG_TO_PREFECTURE[params.prefecture]
  if (!pref) notFound()

  const sakes = getSakesByPrefecture(pref)

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{pref}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">AREA</p>
        <h1 className="content-title text-3xl md:text-4xl">{pref}の日本酒</h1>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title" style={{ fontSize: '18px' }}>銘柄一覧</h2>
          <span className="panel-header__sub">{sakes.length} SAKE</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>現在この地域の銘柄は準備中です。</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sakes.map((s) => (
              <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                <SakeThumb sake={s} size={40} />
                <div>
                  <div className="content-mini-card__name">{s.name}</div>
                  <div className="content-mini-card__meta">{s.classification}</div>
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
