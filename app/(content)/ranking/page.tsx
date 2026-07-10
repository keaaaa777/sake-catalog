import type { Metadata } from 'next'
import Link from 'next/link'
import { getFeaturedSakes } from '@/lib/data'
import { FLAVOR_TYPES } from '@/lib/flavor'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '注目の日本酒ランキング|雫 SAKE SELECT',
  description: '全国の蔵元を代表する銘柄の中から、編集部が厳選した注目の日本酒を紹介します。',
}

export default function RankingPage() {
  const featured = getFeaturedSakes()

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>注目の日本酒</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">RANKING</p>
        <h1 className="content-title text-3xl md:text-4xl">注目の日本酒</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          各都道府県の蔵元を代表する銘柄の中から、編集部が厳選して紹介しています。
          ※実際の購入・アクセス数に基づくランキングではありません。
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">セレクション一覧</h2>
          <span className="panel-header__sub">{featured.length} SAKE</span>
        </div>
        <div className="flex flex-col gap-3">
          {featured.map((s, i) => {
            const flavor = FLAVOR_TYPES[s.flavorType]
            return (
              <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                <span
                  className="shrink-0 text-center font-display text-lg font-bold"
                  style={{ width: 32, color: 'var(--gold-foil)' }}
                >
                  {i + 1}
                </span>
                <SakeThumb sake={s} size={44} />
                <div>
                  <div className="content-mini-card__name">{s.name}</div>
                  <div className="content-mini-card__meta">
                    {s.prefecture} / {s.classification} / {flavor.label}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
