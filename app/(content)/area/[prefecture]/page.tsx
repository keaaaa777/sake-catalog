import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByPrefecture } from '@/lib/data'
import { PREFECTURE_SLUGS } from '@/lib/types'
import { getGuidesLinkingTo } from '@/lib/guides'
import SakeFavoriteCard from '@/components/SakeFavoriteCard'
import RelatedGuides from '@/components/RelatedGuides'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import StatBarList from '@/components/StatBarList'
import { isIndexableSake } from '@/lib/indexability'
import {
  MIN_SAMPLE,
  describePrefectureProfile,
  formatSigned,
  getPrefectureProfile,
  shortBreweryName,
  type SpecAverage,
} from '@/lib/areaStats'

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
  const indexable = getSakesByPrefecture(pref).some(isIndexableSake)
  const profile = getPrefectureProfile(pref)
  const featured = profile.breweries
    .filter((b) => b.sakeCount > 0)
    .slice(0, 2)
    .map((b) => shortBreweryName(b.brewery.name))
  return {
    title:
      profile.sakeCount > 0
        ? `${pref}の日本酒一覧|${profile.breweryCount}蔵・${profile.sakeCount}銘柄の味わいと特徴|雫 SAKE SELECT`
        : `${pref}の日本酒一覧|雫 SAKE SELECT`,
    description:
      profile.sakeCount > 0
        ? `${pref}の酒蔵${profile.breweryCount}蔵が醸す日本酒${profile.sakeCount}銘柄を掲載。${featured.length > 0 ? `${featured.join('、')}など、` : ''}味わいタイプや日本酒度の傾向、酒蔵の紹介から自分に合う一杯を探せます。`
        : `${pref}の蔵元が醸す日本酒を一覧で紹介。味わいや購入先から自分に合う一杯を探せます。`,
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: { canonical: `/area/${params.prefecture}` },
  }
}

function StatTile({ label, stat, unit, format }: { label: string; stat: SpecAverage; unit?: string; format: (v: number) => string }) {
  return (
    <div className="content-stat-tile">
      <div className="content-stat-tile__label">{label}</div>
      <div className="content-stat-tile__value">
        {stat.value !== null && stat.sampleSize >= MIN_SAMPLE ? (
          <>
            {format(stat.value)}
            {unit && <span className="text-sm">{unit}</span>}
          </>
        ) : (
          <span className="text-sm" style={{ color: 'var(--mist)' }}>データ不足</span>
        )}
      </div>
    </div>
  )
}

export default function AreaPage({ params }: { params: { prefecture: string } }) {
  const pref = SLUG_TO_PREFECTURE[params.prefecture]
  if (!pref) notFound()

  const sakes = getSakesByPrefecture(pref)
  const profile = getPrefectureProfile(pref)
  const lead = describePrefectureProfile(profile)
  const { averages, nationalAverages } = profile
  // 掲載銘柄が少ない県では平均値が偏るため、件数と内訳だけを見せる
  const showAverages = profile.sakeCount >= MIN_SAMPLE

  const relatedGuides = Array.from(
    new Map(
      sakes
        .flatMap((s) => getGuidesLinkingTo(`/sake/${s.slug}`))
        .map((g) => [g.slug, g])
    ).values()
  ).slice(0, 5)

  return (
    <div className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd
        items={[{ name: 'トップ', path: '/' }, { name: '地図から探す', path: '/area' }, { name: pref }]}
      />
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <Link href="/area">地図から探す</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{pref}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">AREA</p>
        <h1 className="content-title text-3xl md:text-4xl">{pref}の日本酒</h1>
        {lead && (
          <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--mist)' }}>
            {lead}
          </p>
        )}
      </header>

      {profile.sakeCount > 0 && (
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">データで見る{pref}の日本酒</h2>
            <span className="panel-header__sub">DATA</span>
          </div>
          <div className={`grid gap-3 ${showAverages ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">掲載銘柄 / 酒蔵</div>
              <div className="content-stat-tile__value">
                {profile.sakeCount}
                <span className="text-sm"> / {profile.breweryCount}蔵</span>
              </div>
            </div>
            {showAverages && (
              <>
                <StatTile label="平均精米歩合" stat={averages.polishing} unit="%" format={(v) => v.toFixed(0)} />
                <StatTile label="平均日本酒度" stat={averages.smv} format={formatSigned} />
                <StatTile label="平均アルコール度数" stat={averages.abv} unit="%" format={(v) => v.toFixed(1)} />
              </>
            )}
          </div>
          {showAverages && (
            <p className="mt-4 text-xs leading-relaxed" style={{ color: 'var(--mist)' }}>
              平均値は、数値を掲載している銘柄のみで算出しています(精米歩合{averages.polishing.sampleSize}銘柄・日本酒度
              {averages.smv.sampleSize}銘柄・度数{averages.abv.sampleSize}銘柄)。参考として、掲載銘柄全体の平均は精米歩合
              {nationalAverages.polishing.value?.toFixed(0)}%・日本酒度{nationalAverages.smv.value !== null ? formatSigned(nationalAverages.smv.value) : '-'}
              ・度数{nationalAverages.abv.value?.toFixed(1)}%です。数値は当サイトの掲載銘柄にもとづくもので、{pref}の日本酒全体の統計ではありません。
            </p>
          )}

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm tracking-widest" style={{ color: 'var(--gold-foil)' }}>味わいタイプの内訳</h3>
              <StatBarList items={profile.flavorBreakdown} />
            </div>
            {profile.classificationBreakdown.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm tracking-widest" style={{ color: 'var(--gold-foil)' }}>特定名称の内訳</h3>
                <StatBarList items={profile.classificationBreakdown.slice(0, 6)} />
              </div>
            )}
          </div>
        </section>
      )}

      {profile.breweries.length > 0 && (
        <section className="content-card mt-8">
          <div className="panel-header">
            <h2 className="panel-header__title">{pref}の酒蔵</h2>
            <span className="panel-header__sub">{profile.breweryCount} BREWERIES</span>
          </div>
          <div className="flex flex-col gap-3">
            {profile.breweries.map(({ brewery, sakeCount }) => (
              <Link key={brewery.id} href={`/brewery/${brewery.slug}`} className="content-mini-card">
                <div>
                  <div className="content-mini-card__name">
                    {brewery.name}
                    <span className="ml-2 text-xs" style={{ color: 'var(--mist)' }}>
                      {brewery.foundedYear ? `創業${brewery.foundedYear}年・` : ''}掲載{sakeCount}銘柄
                    </span>
                  </div>
                  <div className="content-mini-card__meta" style={{ color: 'var(--mist)' }}>
                    {brewery.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="content-card mt-8">
        <div className="panel-header">
          <h2 className="panel-header__title">{pref}の日本酒一覧</h2>
          <span className="panel-header__sub">{sakes.length} SAKE</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>現在この地域の銘柄は準備中です。</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sakes.map((s) => (
              <SakeFavoriteCard key={s.id} sake={s} meta={s.classification} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <RelatedGuides guides={relatedGuides} />
      </div>

      {profile.neighbors.length > 0 && (
        <section className="content-card mt-8">
          <div className="panel-header">
            <h2 className="panel-header__title">同じ地方の日本酒</h2>
            <span className="panel-header__sub">NEARBY</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.neighbors.map((n) => (
              <Link key={n.slug} href={`/area/${n.slug}`} className="content-pill">
                {n.prefecture}の日本酒
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link href="/area" className="content-back-link">← 地図から探す</Link>
      </div>
    </div>
  )
}
