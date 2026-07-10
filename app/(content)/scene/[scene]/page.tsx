import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSakesByScene } from '@/lib/data'
import { SCENES, SCENE_IDS } from '@/lib/scenes'
import SakeThumb from '@/components/SakeThumb'

export const revalidate = 86400

export function generateStaticParams() {
  return SCENE_IDS.map((scene) => ({ scene }))
}

export function generateMetadata({ params }: { params: { scene: string } }): Metadata {
  const scene = SCENES[params.scene]
  if (!scene) return {}
  return {
    title: `${scene.label}に選びたい日本酒|雫 SAKE SELECT`,
    description: `${scene.label}のシーンにおすすめの日本酒を一覧で紹介。シーンに合わせた一杯を見つけられます。`,
  }
}

export default function ScenePage({ params }: { params: { scene: string } }) {
  const scene = SCENES[params.scene]
  if (!scene) notFound()

  const sakes = getSakesByScene(params.scene)

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>{scene.label}</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">SCENE</p>
        <h1 className="content-title text-3xl md:text-4xl">{scene.label}に選びたい日本酒</h1>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">銘柄一覧</h2>
          <span className="panel-header__sub">{sakes.length} SAKE</span>
        </div>
        {sakes.length === 0 ? (
          <p style={{ color: 'var(--mist)' }}>現在このシーンに合う銘柄は準備中です。</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sakes.map((s) => (
              <Link key={s.id} href={`/sake/${s.slug}`} className="content-mini-card">
                <SakeThumb sake={s} size={40} />
                <div>
                  <div className="content-mini-card__name">{s.name}</div>
                  <div className="content-mini-card__meta">{s.prefecture} / {s.classification}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
