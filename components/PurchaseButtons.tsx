'use client'

import { MallLink } from '@/lib/affiliate'
import { trackAffiliateClick } from '@/lib/gtag'

interface PurchaseButtonsProps {
  sakeId: string
  slug: string
  mallLinks: MallLink[]
  sourceFlow?: string
}

export default function PurchaseButtons({ sakeId, slug, mallLinks, sourceFlow = 'detail' }: PurchaseButtonsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {mallLinks.map((m) => (
        <a
          key={m.mall}
          href={`/api/out/${slug}/${m.mall}?source=${sourceFlow}`}
          target="_blank"
          rel="sponsored nofollow noopener"
          onClick={() => trackAffiliateClick({ sake_id: sakeId, mall: m.mall, source_flow: sourceFlow })}
          className={`content-mall-btn ${m.mall === 'furusato' ? 'content-mall-btn--furusato' : ''}`}
        >
          {m.label}で見る
        </a>
      ))}
    </div>
  )
}
