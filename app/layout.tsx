import type { Metadata } from 'next'
import Script from 'next/script'
import { Shippori_Mincho_B1, Cormorant_Garamond, Zen_Kaku_Gothic_New } from 'next/font/google'
import './globals.css'
import SiteFooter from '@/components/SiteFooter'
import AgeGate from '@/components/AgeGate'
import { GA_MEASUREMENT_ID } from '@/lib/gtag'

const shippori = Shippori_Mincho_B1({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-latin',
})

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: '雫 SAKE SELECT — 清らかな一滴と、出会う。',
  description: '1分の診断であなたに合う日本酒が見つかる。味わい・産地・料理から探せて、そのまま購入できる日本酒カタログ。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${shippori.variable} ${cormorant.variable} ${zenKaku.variable} font-body bg-[#030914]`}>
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
        <SiteFooter />
        <AgeGate />
      </body>
    </html>
  )
}
