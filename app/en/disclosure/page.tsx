import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Advertising Disclosure | Shizuku Sake Select',
  description: 'How Shizuku Sake Select uses affiliate advertising.',
  alternates: { canonical: '/en/disclosure', languages: { 'ja-JP': '/disclosure', 'en-US': '/en/disclosure' } },
}

export default function EnDisclosurePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">DISCLOSURE</p>
        <h1 className="content-title text-3xl md:text-4xl">Advertising Disclosure</h1>
      </header>

      <section className="content-card space-y-5 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
        <p>
          Shizuku Sake Select participates in the Rakuten Affiliate Program.
        </p>
        <p>
          When you purchase a product through a purchase link on a sake page, we may earn a
          referral fee from the program operator. This has no effect on how products are
          selected, described, or ranked.
        </p>
        <p>
          Prices and stock availability change over time. Please confirm the latest information
          on the retailer&apos;s site before purchasing.
        </p>
        <p>
          Most purchase links lead to Rakuten Ichiba (Japan), where many shops ship within
          Japan only. If you are ordering from outside Japan, please confirm international
          shipping availability with the shop first.
        </p>
      </section>

      <div className="mt-8">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
