import type { Metadata } from 'next'
import { Shippori_Mincho_B1, Cormorant_Garamond, Zen_Kaku_Gothic_New } from 'next/font/google'
import './globals.css'

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
  description: '画像を使わず、澄んだ水面と滴る音のデジタル表現が織りなす和の日本酒サーチポータル。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${shippori.variable} ${cormorant.variable} ${zenKaku.variable} font-body bg-[#030914]`}>
        {children}
      </body>
    </html>
  )
}
