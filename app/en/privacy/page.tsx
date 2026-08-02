import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Shizuku Sake Select',
  description: 'How Shizuku Sake Select handles personal data and analytics.',
  alternates: { canonical: '/en/privacy', languages: { 'ja-JP': '/privacy', 'en-US': '/en/privacy' } },
}

export default function EnPrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">PRIVACY</p>
        <h1 className="content-title text-3xl md:text-4xl">Privacy Policy</h1>
      </header>

      <div className="flex flex-col gap-6">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">Analytics</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            This site uses Google Analytics (GA4) and Vercel Analytics to understand traffic.
            These tools may use cookies to collect data, but the data does not identify you
            personally. Collected data is handled under each provider&apos;s own privacy policy.
          </p>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">Affiliate Advertising</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            To measure how purchase links perform, we may log click data (timestamp, referring
            page) on our server. See our
            <Link href="/en/disclosure" className="mx-1 hover:underline" style={{ color: 'var(--gold-foil)' }}>Advertising Disclosure</Link>
            for details.
          </p>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">Contact</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            For questions about this policy, please contact the site operator.
          </p>
        </section>
      </div>

      <div className="mt-8">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
