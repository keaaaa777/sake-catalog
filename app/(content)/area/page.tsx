import type { Metadata } from 'next'
import Link from 'next/link'
import { REGIONS, PREFECTURE_SLUGS } from '@/lib/types'
import { getSakesByPrefecture } from '@/lib/data'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '地図から探す|都道府県別の日本酒一覧|雫 SAKE SELECT',
  description: '全国47都道府県の日本酒を地方・都道府県ごとに探せます。地域ごとの個性豊かな銘柄をたどってみてください。',
}

export default function AreaIndexPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>地図から探す</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">REGIONAL SAKE</p>
        <h1 className="content-title text-3xl md:text-4xl">地図から探す</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          全国の銘酒を、地方・都道府県ごとにたどれます。土地の水や気候が育む個性を探してみてください。
        </p>
      </header>

      {Object.entries(REGIONS).map(([region, prefectures]) => (
        <section key={region} className="content-card mb-6">
          <div className="panel-header">
            <h2 className="panel-header__title">{region}地方</h2>
            <span className="panel-header__sub">{prefectures.length} PREFECTURES</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {prefectures.map((pref) => {
              const count = getSakesByPrefecture(pref).length
              return (
                <Link key={pref} href={`/area/${PREFECTURE_SLUGS[pref]}`} className="content-mini-card">
                  <div>
                    <div className="content-mini-card__name">{pref}</div>
                    <div className="content-mini-card__meta">{count}銘柄</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
