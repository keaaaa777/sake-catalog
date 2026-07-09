import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー|雫 SAKE SELECT',
  description: '雫 SAKE SELECTにおける個人情報・アクセス解析データの取り扱いについて。',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10">
        <p className="content-eyebrow mb-2">PRIVACY</p>
        <h1 className="content-title text-3xl md:text-4xl">プライバシーポリシー</h1>
      </header>

      <div className="flex flex-col gap-6">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">アクセス解析ツールについて</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            本サイトでは、Google Analytics(GA4)およびVercel Analyticsを利用して
            アクセス状況を解析しています。これらのツールはCookie等を利用してデータを収集しますが、
            個人を特定する情報は含まれません。収集されたデータは各サービス提供者のプライバシーポリシーに
            基づき管理されます。
          </p>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">アフィリエイト広告について</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            購入リンクの経由状況を計測するため、クリックログ(アクセス日時・参照元導線等)を
            サーバー側で記録する場合があります。詳細は
            <Link href="/disclosure" className="mx-1 hover:underline" style={{ color: 'var(--gold-foil)' }}>広告掲載ポリシー</Link>
            をご確認ください。
          </p>
        </section>

        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">お問い合わせ</h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
            本ポリシーに関するお問い合わせは、サイト運営者までご連絡ください。
          </p>
        </section>
      </div>

      <div className="mt-8">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
