import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDE_ARTICLES } from '@/lib/guides'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const revalidate = 86400

export const metadata: Metadata = {
  title: '日本酒ガイド|雫 SAKE SELECT',
  description: '日本酒度の読み方、特定名称の違い、保存方法など、日本酒をもっと楽しむための読み物記事をまとめました。',
  alternates: { canonical: '/guide' },
}

const GUIDE_FAQS = [
  {
    question: '日本酒度とは何ですか?',
    answer:
      '日本酒に溶けている糖分の量を、水を基準(0)に数値化したものです。プラスが大きいほど辛口、マイナスが大きいほど甘口の目安になりますが、酸度など他の要素でも印象は変わります。',
    href: '/guide/nihonshu-do-guide',
  },
  {
    question: '純米・吟醸・大吟醸はどう違うのですか?',
    answer:
      '原料(米・米麹・水のみか、醸造アルコールを加えるか)と、米をどれだけ磨いたか(精米歩合)によって決まる分類です。精米歩合が低いほど華やかな香りが生まれやすくなります。',
    href: '/guide/junmai-ginjo-daiginjo-guide',
  },
  {
    question: '日本酒はどうやって保存すればいいですか?',
    answer:
      '紫外線と高温に弱いため、冷暗所または冷蔵庫で立てて保存するのが基本です。開栓後は酸化が進むため、2週間〜1ヶ月程度を目安に飲み切るのがおすすめです。',
    href: '/guide/sake-storage-guide',
  },
  {
    question: '生酛・山廃とはどんな製法ですか?',
    answer:
      'どちらも乳酸菌の働きで乳酸を生じさせる「生酛系酒母」の製法です。蒸米をすり合わせる「山卸し」を行うのが生酛、省いたものが山廃で、酸や旨みを感じやすい銘柄が多い傾向があります。',
    href: '/guide/kimoto-yamahai-guide',
  },
  {
    question: '日本酒に賞味期限はありますか?',
    answer:
      'アルコール度数が高く腐敗しにくいため、法律上の賞味期限表示義務はなく「製造年月」が記載されます。未開栓なら半年〜1年、開栓後は2週間〜1ヶ月程度を目安に飲み切るのが良いとされています。',
    href: '/guide/sake-shelf-life',
  },
]

export default function GuideListPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GUIDE_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <BreadcrumbJsonLd items={[{ name: 'トップ', path: '/' }, { name: '日本酒ガイド' }]} />
      <nav className="content-breadcrumb">
        <Link href="/">トップ</Link>
        <span>/</span>
        <span style={{ color: 'var(--paper-white)' }}>日本酒ガイド</span>
      </nav>

      <header className="mb-8">
        <p className="content-eyebrow mb-2">GUIDE</p>
        <h1 className="content-title text-3xl md:text-4xl">日本酒ガイド</h1>
        <p className="mt-4 max-w-xl text-base" style={{ color: 'var(--mist)' }}>
          日本酒をもっと楽しむための基礎知識をまとめた読み物です。
        </p>
      </header>

      <section className="content-card">
        <div className="panel-header">
          <h2 className="panel-header__title">記事一覧</h2>
          <span className="panel-header__sub">{GUIDE_ARTICLES.length} ARTICLES</span>
        </div>
        <div className="flex flex-col gap-3">
          {GUIDE_ARTICLES.map((a) => (
            <Link key={a.slug} href={`/guide/${a.slug}`} className="content-mini-card">
              <div>
                <div className="content-mini-card__name">{a.title}</div>
                <div className="content-mini-card__meta" style={{ color: 'var(--mist)' }}>{a.description}</div>
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
          {GUIDE_FAQS.map((faq) => (
            <details key={faq.question} className="content-mini-card">
              <summary style={{ cursor: 'pointer', color: 'var(--paper-white)', fontWeight: 500 }}>
                {faq.question}
              </summary>
              <p className="mt-2 text-sm" style={{ color: 'var(--mist)' }}>
                {faq.answer}{' '}
                <Link href={faq.href} className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
                  詳しく見る ↗
                </Link>
              </p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Link href="/" className="content-back-link">← トップへ戻る</Link>
      </div>
    </div>
  )
}
