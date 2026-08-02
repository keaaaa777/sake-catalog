import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sake Quiz | Shizuku Sake Select',
  description: 'Find your sake flavor type. The interactive quiz is currently available in Japanese only; an English version is planned.',
  alternates: { canonical: '/en/diagnosis', languages: { 'ja-JP': '/diagnosis', 'en-US': '/en/diagnosis' } },
}

export default function EnDiagnosisPage() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">DIAGNOSIS</p>
        <h1 className="content-title text-3xl md:text-4xl">Find Your Sake Type</h1>
      </header>

      <section className="content-card">
        <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          Our one-minute quiz is currently available in Japanese only. An English version is
          planned. In the meantime, you can browse sake directly by flavor type below, or try
          the Japanese quiz — the questions are simple multiple-choice and easy to follow even
          without reading Japanese.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/en/type" className="content-mall-btn">Browse by Flavor Type</Link>
          <Link href="/diagnosis" lang="ja" className="content-mall-btn">Try the Japanese Quiz →</Link>
        </div>
      </section>

      <div className="mt-12">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
