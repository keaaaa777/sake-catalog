import type { Metadata } from 'next'
import Link from 'next/link'
import { getSakesByFlavorType } from '@/lib/data'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '好みから探す|香味4分類で選ぶ日本酒|雫 SAKE SELECT',
  description: '薫酒・爽酒・醇酒・熟酒の香味4分類から、自分の好みに合う日本酒を探せます。',
}

export default function TypeIndexPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>好みから探す</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">FLAVOUR PROFILE</p>
        <h1 className="content-title text-3xl md:text-4xl">好みから探す</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          薫・爽・醇・熟、4つの香味タイプから、今の気分に合う一杯を探せます。
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">香味4分類</h2>
          <span className="panel-header__sub">4 TYPES</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FLAVOR_TYPE_IDS.map((id) => {
            const flavor = FLAVOR_TYPES[id]
            const count = getSakesByFlavorType(id).length
            return (
              <Link key={id} href={`/type/${id}`} className="content-mini-card items-start">
                <div>
                  <div className="content-mini-card__name">
                    {flavor.label} <span className="text-xs" style={{ color: 'var(--mist)' }}>({flavor.kana})</span>
                  </div>
                  <div className="content-mini-card__meta mb-1">{flavor.eng} / {count}銘柄</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--mist)' }}>{flavor.desc}</p>
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
