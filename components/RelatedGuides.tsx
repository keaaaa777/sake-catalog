import Link from 'next/link'
import type { GuideArticle } from '@/lib/guides'

export default function RelatedGuides({ guides }: { guides: GuideArticle[] }) {
  if (guides.length === 0) return null

  return (
    <section className="content-card">
      <div className="panel-header">
        <h2 className="panel-header__title">関連ガイド記事</h2>
        <span className="panel-header__sub">RELATED GUIDE</span>
      </div>
      <div className="flex flex-col gap-3">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guide/${g.slug}`} className="content-mini-card">
            <div>
              <div className="content-mini-card__name">{g.title}</div>
              <div className="content-mini-card__meta">{g.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
