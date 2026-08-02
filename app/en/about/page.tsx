import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | Shizuku Sake Select',
  description: 'About Shizuku Sake Select, an English-language guide to Japanese sake.',
  alternates: { canonical: '/en/about', languages: { 'ja-JP': '/about', 'en-US': '/en/about' } },
}

export default function EnAboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">ABOUT</p>
        <h1 className="content-title text-3xl md:text-4xl">About Shizuku Sake Select</h1>
      </header>

      <section className="content-card space-y-5 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
        <p>
          Shizuku Sake Select is a Japanese sake catalog that helps you find a bottle you&apos;ll
          love based on flavor, region, and food pairing, then takes you straight to a place
          to buy it.
        </p>
        <p>
          Our English section is a work in progress. We are gradually adding English tasting
          notes for well-known, internationally available brands, alongside the full Japanese
          catalog of over 190 sake.
        </p>
        <p>
          Sake information is compiled from official specifications and public sources. While
          we aim for accuracy, please check with the brewery or retailer for the latest details.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/en/disclosure" className="content-pill">Advertising Disclosure</Link>
        <Link href="/en/privacy" className="content-pill">Privacy Policy</Link>
      </div>
      <div className="mt-8">
        <Link href="/en" className="content-back-link">← Back to home</Link>
      </div>
    </div>
  )
}
