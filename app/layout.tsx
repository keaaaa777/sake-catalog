import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { Shippori_Mincho_B1, Cormorant_Garamond, Zen_Kaku_Gothic_New } from 'next/font/google'
import './globals.css'
import { GA_MEASUREMENT_ID } from '@/lib/gtag'

// 実際にCSSで使われているウェイトのみを読み込む(未使用ウェイトはフォント
// 転送量とレンダリングブロックするCSSサイズを直接増やすため)。
// - Shippori Mincho B1: 500(見出し類)・600(価格表示)。400は地の文が
//   継承する既定値(300非対応のため)に最も近い実在ウェイトとして残す。
// - Cormorant Garamond: 400(ロゴ英字)・300(パンくず等が継承する既定値)。
// - Zen Kaku Gothic New: 300(本文既定)・700(ボタン・強調テキスト)。
const shippori = Shippori_Mincho_B1({
  subsets: ['latin'],
  preload: false,
  weight: ['400', '500', '600'],
  variable: '--font-display',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  preload: false,
  weight: ['300', '400'],
  variable: '--font-latin',
})

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  preload: false,
  weight: ['300', '700'],
  variable: '--font-body',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog-japan.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '雫 SAKE SELECT — 清らかな一滴と、出会う。',
  description: '1分の診断であなたに合う日本酒が見つかる。味わい・産地・料理から探せて、そのまま購入できる日本酒カタログ。',
  alternates: { canonical: '/', languages: { 'ja-JP': '/', 'en-US': '/en' } },
  verification: {
    google: 'F1PheMcBMVIMYu08RJviSNg_zYty6FZLb-zaeWVwKQs',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: '雫 SAKE SELECT',
        url: SITE_URL,
        inLanguage: ['ja-JP', 'en-US'],
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: '雫 SAKE SELECT編集部',
        url: SITE_URL,
        description:
          '全国の日本酒を産地・味わい・飲むシーン・合わせる料理から探せる日本酒カタログ「雫 SAKE SELECT」の編集部。酒蔵公式サイトなどの出典と確認日を記録して掲載情報を管理しています。',
        publishingPrinciples: `${SITE_URL}/editorial-policy`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/apple-icon`,
          width: 180,
          height: 180,
        },
      },
    ],
  }

  return (
    <html lang="ja">
      <body className={`${shippori.variable} ${cormorant.variable} ${zenKaku.variable} font-body bg-[#030914]`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
