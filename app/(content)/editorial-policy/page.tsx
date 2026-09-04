import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '編集方針・情報の確認方法|雫 SAKE SELECT',
  description: '雫 SAKE SELECTの情報源、味わい分類、注目セレクション、広告との関係、訂正方針を説明します。',
  alternates: { canonical: '/editorial-policy' },
}

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link><span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>編集方針</span>
      </nav>

      <header className="mb-10">
        <p className="content-eyebrow mb-2">EDITORIAL POLICY</p>
        <h1 className="content-title text-3xl md:text-4xl">編集方針・情報の確認方法</h1>
        <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--mist)' }}>
          掲載情報がどのように整理され、どこまで確認されているかを明らかにするための方針です。
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <div className="panel-header"><h2 className="panel-header__title">情報源の優先順位</h2><span className="panel-header__sub">SOURCES</span></div>
          <p>銘柄の仕様や酒蔵情報は、酒蔵公式の商品ページ・公式サイトを優先し、公的資料、公式発表、正規流通事業者の情報を補助的に参照します。</p>
          <p>確認できない項目は推測で補わず、資料間で内容が異なる場合は確認中として扱います。価格・在庫・商品仕様は変更されるため、購入時には販売元の最新表示をご確認ください。</p>
        </section>

        <section className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <div className="panel-header"><h2 className="panel-header__title">味わいとおすすめ</h2><span className="panel-header__sub">TASTE &amp; PAIRING</span></div>
          <p>甘辛・淡麗濃醇・香味タイプ・料理との相性・おすすめ温度には、商品仕様や公開情報をもとに当サイトが整理した編集上の分類を含みます。感じ方には個人差があり、品質を保証する評価ではありません。</p>
          <p>類似銘柄は、甘辛、淡麗濃醇、甘み、香り、旨みなど、サイト内に登録された味わい指標の近さから表示しています。</p>
        </section>

        <section id="selection" className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)', scrollMarginTop: 96 }}>
          <div className="panel-header"><h2 className="panel-header__title">注目セレクション</h2><span className="panel-header__sub">SELECTION</span></div>
          <p>注目セレクションはランキングではありません。説明文、商品仕様、飲み方、料理との相性、購入先などの掲載情報が比較的充実した銘柄を基礎に、4つの香味タイプが均等になるよう選び、産地の重複を抑えて表示しています。</p>
          <p>売上、購入数、アフィリエイト報酬額は選定順位に使用していません。掲載データの追加・修正により内容は変わることがあります。</p>
        </section>

        <section className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <div className="panel-header"><h2 className="panel-header__title">広告との関係</h2><span className="panel-header__sub">INDEPENDENCE</span></div>
          <p>本サイトはアフィリエイト広告を利用していますが、紹介料の有無や金額を理由に味わい評価や掲載順位を変更しません。広告の仕組みは<Link href="/disclosure" className="underline" style={{ color: 'var(--gold-foil)' }}>広告掲載ポリシー</Link>で説明しています。</p>
        </section>

        <section className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <div className="panel-header"><h2 className="panel-header__title">自動処理と人による確認</h2><span className="panel-header__sub">PROCESS</span></div>
          <p>データの整形、候補抽出、類似度計算などにプログラムや自動処理を使用します。自動処理の結果だけを公式情報として扱わず、重要な事実情報と出典は順次確認します。</p>
          <p>専門家による監修が行われた場合は、対象ページに監修者と範囲を個別に表示します。表示がないページは専門家監修済みを意味しません。</p>
        </section>

        <section className="content-card space-y-4 text-base leading-relaxed" style={{ color: 'var(--paper-white)' }}>
          <div className="panel-header"><h2 className="panel-header__title">訂正と更新</h2><span className="panel-header__sub">CORRECTIONS</span></div>
          <p>誤り、終売、ラベル変更、権利上の問題が確認された場合は、根拠を確認したうえで修正または掲載停止を行います。</p>
          <Link href="/corrections" className="inline-block hover:underline" style={{ color: 'var(--gold-foil)' }}>訂正・掲載情報の連絡方法を見る →</Link>
        </section>
      </div>
    </div>
  )
}
