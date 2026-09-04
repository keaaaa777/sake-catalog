import type { Metadata } from 'next'
import Link from 'next/link'
import { getFeaturedSakes } from '@/lib/data'
import { FLAVOR_TYPES } from '@/lib/flavor'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '注目の日本酒セレクション|雫 SAKE SELECT',
  description: '掲載情報の充実度を基礎に、地域と味わいの偏りを抑えて選んだ日本酒24本を紹介します。順位ではありません。',
  alternates: { canonical: '/ranking' },
}

export default function RankingPage() {
  const featured = getFeaturedSakes(24)

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>注目セレクション</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">FEATURED SELECTION</p>
        <h1 className="content-title text-3xl md:text-4xl">注目の日本酒セレクション</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--mist)' }}>
          掲載情報の充実度を基礎に、薫・爽・醇・熟の4タイプと産地の偏りを抑えて、
          比較しやすい24本を紹介しています。売上・購入数・広告報酬による順位ではありません。
        </p>
        <Link href="/editorial-policy#selection" className="mt-4 inline-block text-sm hover:underline" style={{ color: 'var(--gold-foil)' }}>
          選定方法を詳しく見る →
        </Link>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">セレクション一覧</h2>
          <span className="panel-header__sub">{featured.length} SELECTIONS</span>
        </div>
        <div className="flex flex-col gap-3">
          {featured.map((s) => {
            const flavor = FLAVOR_TYPES[s.flavorType]
            return (
              <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                <SakeThumb sake={s} size={44} />
                <div className="min-w-0">
                  <div className="content-mini-card__name">{s.name}</div>
                  <div className="content-mini-card__meta">
                    {s.prefecture} / {s.classification} / {flavor.label}
                  </div>
                  <div className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--mist)' }}>
                    {s.specs.rice ? `${s.specs.rice}を使用。` : ''}{s.servingTemp.length > 0 ? `${s.servingTemp.slice(0, 2).join('・')}で楽しめる一本。` : `${flavor.label}タイプの一本。`}
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
