import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBreweries, getBreweryBySlug, getSakesByBrewery } from '@/lib/data'
import { PREFECTURE_SLUGS } from '@/lib/types'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export function generateStaticParams() {
  return getAllBreweries().map((b) => ({ slug: b.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const brewery = getBreweryBySlug(params.slug)
  if (!brewery) return {}
  return {
    title: `${brewery.name}(${brewery.prefecture})の酒蔵情報|雫 SAKE SELECT`,
    description: brewery.description.slice(0, 120),
  }
}

export default function BreweryDetailPage({ params }: { params: { slug: string } }) {
  const brewery = getBreweryBySlug(params.slug)
  if (!brewery) notFound()

  const sakes = getSakesByBrewery(brewery.slug)
  const prefSlug = PREFECTURE_SLUGS[brewery.prefecture]

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        {prefSlug ? (
          <Link href={`/area/${prefSlug}`}>{brewery.prefecture}</Link>
        ) : (
          <span>{brewery.prefecture}</span>
        )}
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{brewery.name}</span>
      </nav>

      <header className="mb-10">
        <p className="content-eyebrow mb-2">
          {brewery.prefecture}{brewery.foundedYear ? ` / 創業${brewery.foundedYear}年` : ''}
        </p>
        <h1 className="content-title text-3xl md:text-4xl">{brewery.name}</h1>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title" style={{ fontSize: '20px' }}>蔵について</h2>
            <span className="panel-header__sub">THE BREWERY</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--paper-white)' }}>{brewery.description}</p>
          {brewery.websiteUrl && (
            <a
              href={brewery.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs hover:underline"
              style={{ color: 'var(--gold-foil)' }}
            >
              公式サイトを見る →
            </a>
          )}
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title" style={{ fontSize: '20px' }}>この蔵の銘柄</h2>
            <span className="panel-header__sub">{sakes.length} SAKE</span>
          </div>
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
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
