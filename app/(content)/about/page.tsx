import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'サイトについて|雫 SAKE SELECT',
  description: '雫 SAKE SELECTの運営方針と運営者情報について。',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">ABOUT</p>
        <h1 className="content-title text-3xl md:text-4xl">サイトについて</h1>
      </header>

      <section className="content-card space-y-5 text-sm leading-relaxed" style={{ color: 'var(--paper-white)' }}>
        <p>
          「雫 SAKE SELECT」は、味わい・産地・料理との相性から自分に合う日本酒を見つけ、
          そのまま購入先へ進める日本酒カタログサイトです。
        </p>
        <p>
          地図から探す、好みから探す、銘柄から探す、診断から探すの4つの導線を用意し、
          日本酒に詳しくない方でも直感的に一杯を選べることを目指しています。
        </p>
        <p>
          掲載している銘柄情報は公式スペックや資料をもとに独自にまとめたものです。
          内容の正確性には努めていますが、最新情報は各蔵元・販売店の公式情報をご確認ください。
        </p>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/disclosure" className="content-pill">広告掲載ポリシー</Link>
        <Link href="/privacy" className="content-pill">プライバシーポリシー</Link>
      </div>
      <div className="mt-8">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
