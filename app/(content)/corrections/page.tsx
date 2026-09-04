import type { Metadata } from 'next'
import Link from 'next/link'

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL

export const metadata: Metadata = {
  title: '掲載情報の訂正・削除について|雫 SAKE SELECT',
  description: '銘柄・酒蔵情報の訂正、終売やラベル変更、画像その他の権利に関するご連絡方法を案内します。',
  alternates: { canonical: '/corrections' },
  ...(!CONTACT_EMAIL ? { robots: { index: false, follow: true } } : {}),
}

export default function CorrectionsPage() {
  const subject = encodeURIComponent('雫 SAKE SELECT 掲載情報について')

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link><span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>訂正・掲載情報</span>
      </nav>

      <header className="mb-10">
        <p className="content-eyebrow mb-2">CORRECTIONS</p>
        <h1 className="content-title text-3xl md:text-4xl">掲載情報の訂正・削除について</h1>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card space-y-5 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <p>銘柄・酒蔵情報の誤り、終売、ラベル変更、画像の権利、掲載停止などのご連絡を受け付けています。酒蔵、販売事業者、撮影者、その他の権利者からのご連絡を優先して確認します。</p>
          <div>
            <h2 className="mb-3 text-xl font-semibold">ご連絡時に必要な情報</h2>
            <ul className="list-disc space-y-2 pl-6" style={{ color: 'var(--mist)' }}>
              <li>対象ページのURL</li>
              <li>銘柄名または酒蔵名</li>
              <li>訂正・削除を希望する箇所</li>
              <li>正しい内容を確認できる公式URLまたは資料</li>
              <li>画像の場合は、権利者であることを確認できる情報</li>
            </ul>
          </div>
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}?subject=${subject}`} className="content-back-link inline-block">
              メールで連絡する
            </a>
          ) : (
            <p className="rounded-lg border border-gold/20 bg-black/10 p-4 text-sm" style={{ color: 'var(--mist)' }}>
              現在、訂正受付窓口を準備しています。公開連絡先の設定後、このページからご連絡いただけます。
            </p>
          )}
        </section>

        <section className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <div className="panel-header"><h2 className="panel-header__title">確認と対応</h2><span className="panel-header__sub">PROCESS</span></div>
          <p>ご連絡内容と根拠を確認し、必要に応じて修正、注記、画像差し替え、掲載停止を行います。第三者に関する情報は、なりすまし防止のため追加確認をお願いする場合があります。</p>
          <p>サイトの情報管理方針については<Link href="/editorial-policy" className="underline" style={{ color: 'var(--gold-foil)' }}>編集方針</Link>をご確認ください。</p>
        </section>
      </div>
    </div>
  )
}
