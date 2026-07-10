import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DIAGNOSIS_TYPE_IDS, getDiagnosisType } from '@/lib/diagnosisTypes'
import { getSakesByFlavorType } from '@/lib/data'
import { FLAVOR_TYPES } from '@/lib/flavor'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export function generateStaticParams() {
  return DIAGNOSIS_TYPE_IDS.map((typeId) => ({ typeId }))
}

export function generateMetadata({ params }: { params: { typeId: string } }): Metadata {
  const type = getDiagnosisType(params.typeId)
  if (!type) return {}

  const title = `あなたは「${type.name}」|雫 SAKE SELECT 1分診断`
  const description = type.catch

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default function DiagnosisResultPage({ params }: { params: { typeId: string } }) {
  const type = getDiagnosisType(params.typeId)
  if (!type) notFound()

  const flavor = FLAVOR_TYPES[type.flavorType]
  const recommendations = getSakesByFlavorType(type.flavorType).slice(0, 3)
  const shareUrl = `https://sake-catalog.vercel.app/diagnosis/result/${type.id}`
  const shareText = `診断結果は「${type.name}」でした!🍶 #雫SAKESELECT`
  const xShareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <Link href="/diagnosis">診断</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{type.name}</span>
      </nav>

      <header className="mb-10 text-center">
        <div
          className="content-visual mx-auto mb-6 w-40"
          style={{ background: `linear-gradient(150deg, ${flavor.gradient[0]}, ${flavor.gradient[1]})` }}
        >
          <span className="content-visual__shine" aria-hidden="true" />
          <span className="content-visual__emoji" role="img" aria-label={type.name}>
            🍶
          </span>
        </div>
        <p className="content-eyebrow mb-2">DIAGNOSIS RESULT</p>
        <h1 className="content-title text-3xl md:text-4xl">{type.name}</h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--paper-white)' }}>{type.catch}</p>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">あなたへの解説</h2>
            <span className="panel-header__sub">ABOUT YOUR TYPE</span>
          </div>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            {type.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="content-pill content-pill--gold">{flavor.label}({flavor.kana})</span>
            <Link href={`/type/${type.flavorType}`} className="content-pill">
              {flavor.label}タイプをもっと見る →
            </Link>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="content-card">
            <div className="panel-header">
              <h2 className="panel-header__title">あなたにおすすめの3本</h2>
              <span className="panel-header__sub">RECOMMENDED</span>
            </div>
            <div className="flex flex-col gap-3">
              {recommendations.map((s) => (
                <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                  <SakeThumb sake={s} size={44} />
                  <div>
                    <div className="content-mini-card__name">{s.name}</div>
                    <div className="content-mini-card__meta">{s.prefecture} / {s.classification}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="content-card" style={{ borderColor: 'rgba(201, 176, 106, 0.4)' }}>
          <div className="panel-header">
            <h2 className="panel-header__title">診断結果をシェアする</h2>
            <span className="panel-header__sub">SHARE</span>
          </div>
          <a
            href={xShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="content-mall-btn inline-block"
          >
            Xでシェアする
          </a>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/diagnosis" className="content-back-link">もう一度診断する</Link>
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
