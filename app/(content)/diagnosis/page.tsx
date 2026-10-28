import type { Metadata } from 'next'
import Link from 'next/link'
import DiagnosisClient from './DiagnosisClient'
import { DIAGNOSIS_TYPES } from '@/lib/diagnosisTypes'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: '日本酒診断|5つの質問でわかる、あなた好みの日本酒タイプ(無料・1分)|雫 SAKE SELECT',
  description:
    '香り・温度帯・料理・甘辛・飲むシーンの5問に答えるだけの無料の日本酒診断。薫酒・爽酒・醇酒・熟酒の4つの味わいと飲むシーンから、あなた好みの8タイプと相性の良い銘柄が分かります。登録不要。',
  alternates: { canonical: '/diagnosis', languages: { 'ja-JP': '/diagnosis', 'en-US': '/en/diagnosis' } },
}

// 診断ロジック(DiagnosisClient)に沿った説明だけを書く。ロジックを変えたらここも見直す。
const DIAGNOSIS_FAQS = [
  {
    question: '日本酒診断は無料ですか?登録は必要ですか?',
    answer: '無料で、会員登録やメールアドレスの入力も不要です。5つの質問に答えると、すぐに結果ページが表示されます。',
  },
  {
    question: 'どんな質問に答えるのですか?',
    answer:
      '香りの好み、好きな温度帯、一緒に食べたい料理、甘口・辛口の好み、今日の気分(誰かと飲むか、ひとりで飲むか)の5問です。それぞれ4つの選択肢から選びます。',
  },
  {
    question: '診断結果はどうやって決まるのですか?',
    answer:
      '最初の4問の回答から、薫酒・爽酒・醇酒・熟酒のうち最も多く選ばれた味わいを、最後の1問から飲むシーン(みんなで/ひとりで)を判定し、その組み合わせで8タイプのいずれかになります。',
  },
  {
    question: '診断結果は保存されますか?',
    answer:
      '結果はお使いのブラウザ内にだけ保存され、サーバーには送信されません。次にこのページを開くと前回の結果を表示し、もう一度診断することもできます。',
  },
  {
    question: '診断のあとは何ができますか?',
    answer:
      '結果ページで、タイプの解説とおすすめの銘柄を紹介しています。気になった銘柄は詳細ページで味わいや購入先を確認したり、お気に入りに追加して比較したりできます。',
  },
]

export default function DiagnosisPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: DIAGNOSIS_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <BreadcrumbJsonLd items={[{ name: 'トップ', path: '/' }, { name: '日本酒診断' }]} />

      <DiagnosisClient />

      <div className="mx-auto mt-12 max-w-2xl">
        <section className="content-card">
          <div className="panel-header">
            <h2 className="panel-header__title">日本酒診断でわかること</h2>
            <span className="panel-header__sub">ABOUT</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--mist)' }}>
            日本酒は、香りと味わいの特徴から「薫酒」「爽酒」「醇酒」「熟酒」の4つに分けて考えると、好みを整理しやすくなります。
            この診断では、香り・温度帯・料理・甘辛の好みからあなたに近い味わいを、飲むシーンから楽しみ方を判定し、
            8つのタイプのどれに当てはまるかをお伝えします。銘柄名に詳しくなくても、普段の好みだけで答えられます。
          </p>
        </section>

        <section className="content-card mt-8">
          <div className="panel-header">
            <h2 className="panel-header__title">4つの味わいタイプ</h2>
            <span className="panel-header__sub">FLAVOR TYPES</span>
          </div>
          <div className="flex flex-col gap-3">
            {FLAVOR_TYPE_IDS.map((id) => {
              const flavor = FLAVOR_TYPES[id]
              return (
                <Link key={id} href={`/type/${id}`} className="content-mini-card">
                  <div>
                    <div className="content-mini-card__name">
                      {flavor.label}({flavor.kana})
                    </div>
                    <div className="content-mini-card__meta" style={{ color: 'var(--mist)' }}>
                      {flavor.desc}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="content-card mt-8">
          <div className="panel-header">
            <h2 className="panel-header__title">診断結果の8タイプ</h2>
            <span className="panel-header__sub">{DIAGNOSIS_TYPES.length} TYPES</span>
          </div>
          <div className="flex flex-col gap-3">
            {DIAGNOSIS_TYPES.map((type) => (
              <Link key={type.id} href={`/diagnosis/result/${type.id}`} className="content-mini-card">
                <div>
                  <div className="content-mini-card__name">
                    {type.name}
                    <span className="ml-2 text-xs" style={{ color: 'var(--mist)' }}>
                      {FLAVOR_TYPES[type.flavorType].label}・{type.occasion === 'social' ? 'みんなで' : 'ひとりで'}
                    </span>
                  </div>
                  <div className="content-mini-card__meta" style={{ color: 'var(--mist)' }}>
                    {type.catch}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="content-card mt-8">
          <div className="panel-header">
            <h2 className="panel-header__title">よくある質問</h2>
            <span className="panel-header__sub">FAQ</span>
          </div>
          <div className="flex flex-col gap-2">
            {DIAGNOSIS_FAQS.map((faq) => (
              <details key={faq.question} className="content-mini-card">
                <summary style={{ cursor: 'pointer', color: 'var(--paper-white)', fontWeight: 500 }}>
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm" style={{ color: 'var(--mist)' }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/guide" className="content-back-link">日本酒ガイドを読む →</Link>
          <Link href="/ranking" className="content-back-link">注目の日本酒を見る →</Link>
        </div>
      </div>
    </>
  )
}
