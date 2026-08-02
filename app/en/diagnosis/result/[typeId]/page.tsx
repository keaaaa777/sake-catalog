import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DIAGNOSIS_TYPE_IDS, getDiagnosisType } from '@/lib/diagnosisTypes'
import { DIAGNOSIS_TYPE_EN } from '@/lib/i18n/diagnosis-en'
import { getSakesByFlavorType } from '@/lib/data'
import { getAllEnSakeSlugs } from '@/lib/i18n/en-content'
import { FLAVOR_TYPES } from '@/lib/flavor'
import SakeThumb from '@/components/SakeThumb'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog.vercel.app'

export const revalidate = 86400

export function generateStaticParams() {
  return DIAGNOSIS_TYPE_IDS.map((typeId) => ({ typeId }))
}

export function generateMetadata({ params }: { params: { typeId: string } }): Metadata {
  const type = getDiagnosisType(params.typeId)
  const en = DIAGNOSIS_TYPE_EN[params.typeId]
  if (!type || !en) return {}

  const title = `You are "${en.name}" | Shizuku Sake Select Quiz`

  return {
    title,
    description: en.catch,
    alternates: {
      canonical: `/en/diagnosis/result/${params.typeId}`,
      languages: { 'ja-JP': `/diagnosis/result/${params.typeId}`, 'en-US': `/en/diagnosis/result/${params.typeId}` },
    },
    openGraph: { title, description: en.catch, type: 'website' },
  }
}

export default function EnDiagnosisResultPage({ params }: { params: { typeId: string } }) {
  const type = getDiagnosisType(params.typeId)
  const en = DIAGNOSIS_TYPE_EN[params.typeId]
  if (!type || !en) notFound()

  const flavor = FLAVOR_TYPES[type.flavorType]
  const enSlugs = new Set(getAllEnSakeSlugs())
  const recommendations = getSakesByFlavorType(type.flavorType).filter((s) => enSlugs.has(s.slug)).slice(0, 3)
  const shareUrl = `${SITE_URL}/en/diagnosis/result/${type.id}`
  const shareText = `My sake quiz result: "${en.name}"! 🍶 #ShizukuSakeSelect`
  const xShareHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="content-breadcrumb">
        <Link href="/en">Home</Link>
        <span>/</span>
        <Link href="/en/diagnosis">Quiz</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{en.name}</span>
      </nav>

      <header className="mb-10 text-center">
        <div
          className="content-visual mx-auto mb-6 w-40"
          style={{ background: `linear-gradient(150deg, ${flavor.gradient[0]}, ${flavor.gradient[1]})` }}
        >
          <span className="content-visual__shine" aria-hidden="true" />
          <span className="content-visual__emoji" role="img" aria-label={en.name}>
            🍶
          </span>
        </div>
        <p className="content-eyebrow mb-2">YOUR RESULT</p>
        <h1 className="content-title text-3xl md:text-4xl">{en.name}</h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--paper-white)' }}>{en.catch}</p>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">About Your Type</h2>
            <span className="panel-header__sub">ABOUT YOUR TYPE</span>
          </div>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            {en.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="content-pill content-pill--gold">{flavor.eng}</span>
            <Link href={`/en/type/${type.flavorType}`} className="content-pill">
              More {flavor.eng} sake →
            </Link>
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="content-card">
            <div className="panel-header">
              <h2 className="panel-header__title">Recommended for You</h2>
              <span className="panel-header__sub">RECOMMENDED</span>
            </div>
            <div className="flex flex-col gap-3">
              {recommendations.map((s) => (
                <Link key={s.id} href={`/en/sake/${s.slug}`} className="content-mini-card">
                  <SakeThumb sake={s} size={44} />
                  <div>
                    <div className="content-mini-card__name">{s.name}</div>
                    <div className="content-mini-card__meta">{s.prefecture}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="content-card" style={{ borderColor: 'rgba(201, 176, 106, 0.4)' }}>
          <div className="panel-header">
            <h2 className="panel-header__title">Share Your Result</h2>
            <span className="panel-header__sub">SHARE</span>
          </div>
          <a
            href={xShareHref}
            target="_blank"
            rel="noopener noreferrer"
            className="content-mall-btn inline-block"
          >
            Share on X
          </a>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/en/diagnosis" className="content-back-link">Take the quiz again</Link>
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
