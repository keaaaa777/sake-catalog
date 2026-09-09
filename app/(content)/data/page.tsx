import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getOverviewStats,
  getPrefectureRanking,
  getClassificationBreakdown,
  getFlavorTypeBreakdown,
} from '@/lib/siteStats'
import StatBarList from '@/components/StatBarList'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'データで見る日本酒|掲載銘柄の産地・特定名称・香味の傾向|雫 SAKE SELECT',
  description: '掲載している日本酒997銘柄のデータから、産地別の銘柄数、特定名称の内訳、香味タイプの傾向などを集計して紹介します。',
  alternates: { canonical: '/data' },
}

export default function DataPage() {
  const overview = getOverviewStats()
  const prefectureRanking = getPrefectureRanking(10)
  const classificationBreakdown = getClassificationBreakdown()
  const flavorBreakdown = getFlavorTypeBreakdown()

  return (
    <div className="mx-auto max-w-3xl">
      <BreadcrumbJsonLd items={[{ name: 'トップ', path: '/' }, { name: 'データで見る日本酒' }]} />
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>データで見る日本酒</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">SAKE DATA</p>
        <h1 className="content-title text-3xl md:text-4xl">データで見る日本酒</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'var(--mist)' }}>
          掲載している{overview.sakeCount}銘柄のデータを集計し、産地・特定名称・香味タイプの傾向をまとめました。
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">掲載データの概要</h2>
            <span className="panel-header__sub">OVERVIEW</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">掲載銘柄数</div>
              <div className="content-stat-tile__value">{overview.sakeCount}</div>
            </div>
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">掲載蔵元数</div>
              <div className="content-stat-tile__value">{overview.breweryCount}</div>
            </div>
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">掲載都道府県数</div>
              <div className="content-stat-tile__value">{overview.prefectureCount}<span className="text-sm">/47</span></div>
            </div>
            <div className="content-stat-tile">
              <div className="content-stat-tile__label">平均アルコール度数</div>
              <div className="content-stat-tile__value">{overview.avgAbv.toFixed(1)}<span className="text-sm">%</span></div>
            </div>
          </div>
          <p className="mt-4 text-xs" style={{ color: 'var(--mist)' }}>
            平均アルコール度数は、数値を掲載している{overview.avgAbvSampleSize}銘柄をもとに算出しています。
            平均精米歩合は{overview.avgPolishing.toFixed(0)}%({overview.avgPolishingSampleSize}銘柄で算出)です。
          </p>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">都道府県別 掲載銘柄数トップ10</h2>
            <span className="panel-header__sub">BY PREFECTURE</span>
          </div>
          <StatBarList items={prefectureRanking} />
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">特定名称の内訳</h2>
            <span className="panel-header__sub">BY CLASSIFICATION</span>
          </div>
          <StatBarList items={classificationBreakdown} />
          <Link href="/classification" className="mt-4 inline-block text-sm hover:underline" style={{ color: 'var(--gold-foil)' }}>
            特定名称から探す →
          </Link>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">香味4タイプの内訳</h2>
            <span className="panel-header__sub">BY FLAVOR TYPE</span>
          </div>
          <StatBarList items={flavorBreakdown} />
          <Link href="/type" className="mt-4 inline-block text-sm hover:underline" style={{ color: 'var(--gold-foil)' }}>
            好みから探す →
          </Link>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
