import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '広告掲載ポリシー(アフィリエイト表記)|雫 SAKE SELECT',
  description: '雫 SAKE SELECTにおけるアフィリエイト広告の利用状況について説明します。',
}

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">DISCLOSURE</p>
        <h1 className="content-title text-3xl md:text-4xl">広告掲載ポリシー</h1>
      </header>

      <section className="content-card space-y-5 text-sm leading-relaxed" style={{ color: 'var(--paper-white)' }}>
        <p>
          本サイト「雫 SAKE SELECT」は、Amazonアソシエイト・楽天アフィリエイト・
          バリューコマース・A8.netをはじめとするアフィリエイトプログラムに参加しています。
        </p>
        <p>
          銘柄詳細ページの購入リンクを経由して商品が購入された場合、本サイトが各プログラムの
          運営会社から紹介料を受け取ることがあります。紹介料の有無や金額は、掲載内容の評価や
          紹介順位に影響を与えません。
        </p>
        <p>
          価格・在庫状況などの情報は変動する場合があります。購入の際は、必ず各販売サイト上で
          最新の情報をご確認ください。
        </p>
        <p>
          本ポリシーは景品表示法におけるステルスマーケティング規制への対応として掲載しています。
        </p>
      </section>

      <div className="mt-8">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
