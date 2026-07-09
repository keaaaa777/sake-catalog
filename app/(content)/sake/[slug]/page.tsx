import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllSakes, getSakeBySlug, getBreweryForSake, getSimilarSakes } from '@/lib/data'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { PAIRING_CATEGORIES } from '@/lib/pairing'
import { PREFECTURE_SLUGS } from '@/lib/types'
import { buildAffiliateLinks } from '@/lib/affiliate'
import SakeThumb from '@/components/SakeThumb'
import PurchaseButtons from '@/components/PurchaseButtons'

export const revalidate = 86400

export function generateStaticParams() {
  return getAllSakes().map((sake) => ({ slug: sake.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const sake = getSakeBySlug(params.slug)
  if (!sake) return {}

  const flavor = FLAVOR_TYPES[sake.flavorType]
  const description = `${sake.prefecture}の${sake.classification}「${sake.name}」。${flavor.label}(${flavor.eng})タイプの味わいと購入先を紹介。`.slice(0, 120)

  return {
    title: `【${sake.name}】の味わい・スペック・購入先|雫 SAKE SELECT`,
    description,
    openGraph: {
      title: sake.name,
      description,
      type: 'website',
    },
  }
}

const SWEET_DRY_LABELS = ['大甘', '甘口', 'やや甘口', '中間', 'やや辛口', '辛口', '大辛口']
const LIGHT_RICH_LABELS = ['淡麗', 'やや淡麗', '中間', 'やや濃醇', '濃醇']

function scaleLabel(labels: string[], value: number, min: number, max: number) {
  const idx = Math.round(((value - min) / (max - min)) * (labels.length - 1))
  return labels[Math.max(0, Math.min(labels.length - 1, idx))]
}

export default function SakeDetailPage({ params }: { params: { slug: string } }) {
  const sake = getSakeBySlug(params.slug)
  if (!sake) notFound()

  const brewery = getBreweryForSake(sake)
  const flavor = FLAVOR_TYPES[sake.flavorType]
  const similar = getSimilarSakes(sake)
  const mallLinks = buildAffiliateLinks(sake)
  const prefSlug = PREFECTURE_SLUGS[sake.prefecture]

  const tasteAxes: { key: keyof typeof sake.taste; label: string }[] = [
    { key: 'sweetness', label: '甘み' },
    { key: 'acidity', label: '酸味' },
    { key: 'umami', label: '旨み' },
    { key: 'aroma', label: '香り' },
    { key: 'sharpness', label: 'キレ' },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: sake.name,
        description: sake.description,
        brand: brewery ? { '@type': 'Brand', name: brewery.name } : undefined,
        category: sake.classification,
        offers: mallLinks.map((m) => ({
          '@type': 'Offer',
          url: m.url,
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: m.label },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'トップ', item: '/' },
          { '@type': 'ListItem', position: 2, name: sake.prefecture, item: prefSlug ? `/area/${prefSlug}` : undefined },
          { '@type': 'ListItem', position: 3, name: sake.name },
        ],
      },
    ],
  }

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        {prefSlug ? (
          <Link href={`/area/${prefSlug}`}>{sake.prefecture}</Link>
        ) : (
          <span>{sake.prefecture}</span>
        )}
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{sake.name}</span>
      </nav>

      {/* 1. 基本情報 */}
      <header className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-8">
        <div
          className="content-visual mx-auto w-40 sm:mx-0 sm:w-full"
          style={{ background: `linear-gradient(150deg, ${flavor.gradient[0]}, ${flavor.gradient[1]})` }}
        >
          <span className="content-visual__shine" aria-hidden="true" />
          <span className="content-visual__emoji" role="img" aria-label={sake.classification}>
            {sake.imageUrl || '🍶'}
          </span>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="content-pill content-pill--gold">{sake.classification}</span>
            <span className="content-pill">{flavor.label}({flavor.kana})</span>
          </div>
          <h1 className="content-title text-3xl md:text-4xl">{sake.name}</h1>
          <p className="mt-3 text-base" style={{ color: 'var(--mist)', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
            {sake.prefecture}
            {brewery && (
              <>
                {' '}/{' '}
                <Link href={`/brewery/${brewery.slug}`} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
                  {brewery.name}
                </Link>
              </>
            )}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {/* 2. 味わいビジュアル */}
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">味わいの特徴</h2>
            <span className="panel-header__sub">FLAVOR PROFILE</span>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">甘辛</div>
              <div className="content-stat-tile__value">{scaleLabel(SWEET_DRY_LABELS, sake.sweetDry, -3, 3)}</div>
            </div>
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">淡麗濃醇</div>
              <div className="content-stat-tile__value">{scaleLabel(LIGHT_RICH_LABELS, sake.lightRich, -3, 3)}</div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-base" style={{ color: 'var(--mist)' }}>香味レーダー(5段階)</p>
            <div className="space-y-3">
              {tasteAxes.map((axis) => (
                <div key={axis.key} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-base" style={{ color: 'var(--mist)' }}>{axis.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${(sake.taste[axis.key] / 5) * 100}%`, background: 'var(--gold-foil)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. スペック表 */}
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">スペック</h2>
            <span className="panel-header__sub">SPECIFICATION</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            {sake.specs.polishing != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>精米歩合</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.polishing}%</dd></div>
            )}
            {sake.specs.rice && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>使用米</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.rice}</dd></div>
            )}
            {sake.specs.yeast && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>酵母</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.yeast}</dd></div>
            )}
            {sake.specs.abv != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>アルコール度</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.abv}%</dd></div>
            )}
            {sake.specs.smv != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>日本酒度</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.smv}</dd></div>
            )}
            {sake.specs.acid != null && (
              <div><dt className="text-base" style={{ color: 'var(--mist)' }}>酸度</dt><dd className="mt-1 text-xl font-semibold" style={{ color: 'var(--paper-white)' }}>{sake.specs.acid}</dd></div>
            )}
          </dl>
        </section>

        {/* 4. おすすめの飲み方 & 5. ペアリング */}
        {(sake.servingTemp.length > 0 || sake.pairings.length > 0) && (
          <section className="content-card">
            {sake.servingTemp.length > 0 && (
              <div className="mb-6">
                <div className="panel-header">
                  <h2 className="panel-header__title">おすすめの飲み方</h2>
                  <span className="panel-header__sub">SERVING TEMPERATURE</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sake.servingTemp.map((t) => (
                    <span key={t} className="content-pill content-pill--gold">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {sake.pairings.length > 0 && (
              <div>
                <div className="panel-header">
                  <h2 className="panel-header__title">合う料理</h2>
                  <span className="panel-header__sub">FOOD PAIRING</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sake.pairings.map((p) => (
                    <Link key={p} href={`/pairing/${p}`} className="content-pill">
                      {PAIRING_CATEGORIES[p]?.label ?? p}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 6. 紹介文 */}
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">紹介</h2>
            <span className="panel-header__sub">ABOUT THIS SAKE</span>
          </div>
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'var(--paper-white)', borderLeft: '2px solid var(--line-gold)', paddingLeft: '16px' }}
          >
            {sake.description}
          </p>
        </section>

        {/* 7. 購入セクション */}
        <section className="content-card" style={{ borderColor: 'rgba(201, 176, 106, 0.4)' }}>
          <div className="panel-header">
            <h2 className="panel-header__title">この日本酒を購入する</h2>
            <span className="panel-header__sub">WHERE TO BUY</span>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--mist)' }}>※本サイトはアフィリエイト広告を利用しています</p>
          <PurchaseButtons sakeId={sake.id} slug={sake.slug} mallLinks={mallLinks} sourceFlow="detail" />
        </section>

        {/* 8. 類似銘柄 */}
        {similar.length > 0 && (
          <section className="content-card">
            <div className="panel-header">
              <h2 className="panel-header__title">この銘柄が好きなら</h2>
              <span className="panel-header__sub">SIMILAR SAKE</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {similar.map((s) => (
                <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                  <SakeThumb sake={s} size={40} />
                  <div>
                    <div className="content-mini-card__name">{s.name}</div>
                    <div className="content-mini-card__meta">{s.prefecture} / {s.classification}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 9. 酒蔵情報 */}
        {brewery && (
          <section className="content-card">
            <div className="panel-header">
              <h2 className="panel-header__title">酒蔵について</h2>
              <span className="panel-header__sub">THE BREWERY</span>
            </div>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--paper-white)' }}>
              {brewery.description}
            </p>
            <Link href={`/brewery/${brewery.slug}`} className="mt-3 inline-block text-base hover:underline" style={{ color: 'var(--gold-foil)' }}>
              {brewery.name}の詳細を見る →
            </Link>
          </section>
        )}
      </div>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
