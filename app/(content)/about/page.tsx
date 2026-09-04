import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'サイトについて|雫 SAKE SELECT',
  description: '雫 SAKE SELECTの運営方針と運営者情報について。',
  alternates: { canonical: '/about', languages: { 'ja-JP': '/about', 'en-US': '/en/about' } },
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">ABOUT</p>
        <h1 className="content-title text-3xl md:text-4xl">サイトについて</h1>
      </header>

      <section className="content-card space-y-5 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
        <p>
          「雫 SAKE SELECT」は、味わい・産地・料理との相性から自分に合う日本酒を見つけ、
          そのまま購入先へ進める日本酒カタログサイトです。
        </p>
        <p>
          地図から探す、好みから探す、銘柄から探す、診断から探すの4つの導線を用意し、
          日本酒に詳しくない方でも直感的に一杯を選べることを目指しています。
        </p>
        <p>
          掲載している銘柄情報は、酒蔵の公式情報や公的資料などを優先して確認し、
          サイト独自の味わい分類とあわせて整理しています。確認できない情報を推測で補わず、
          出典と最終確認日を順次整備しています。
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/editorial-policy" className="content-pill">編集方針</Link>
        <Link href="/corrections" className="content-pill">訂正・掲載情報</Link>
        <Link href="/disclosure" className="content-pill">広告掲載ポリシー</Link>
        <Link href="/privacy" className="content-pill">プライバシーポリシー</Link>
      </div>
      <div className="mt-8">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
