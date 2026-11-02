'use client'

import { trackAffiliateClick, trackAffiliateClickAttempt } from '@/lib/gtag'

interface GuideOfferButtonProps {
  sakeId: string
  slug: string
  // 楽天オファーの配列index。未指定なら銘柄の楽天リンク(またはモール内検索)へ
  offerIndex?: number
  production: boolean
  label: string
}

const SOURCE_FLOW = 'guidecard'

export default function GuideOfferButton({ sakeId, slug, offerIndex, production, label }: GuideOfferButtonProps) {
  const query = offerIndex != null ? `offer=${offerIndex}&source=${SOURCE_FLOW}` : `source=${SOURCE_FLOW}`

  return (
    <a
      href={production ? `/api/out/${slug}/rakuten?${query}` : '#'}
      target={production ? '_blank' : undefined}
      rel="sponsored nofollow noopener"
      onClick={(e) => {
        const event = { sake_id: sakeId, mall: 'rakuten', source_flow: SOURCE_FLOW }
        if (!production) {
          e.preventDefault()
          trackAffiliateClickAttempt({ ...event, environment: 'nonproduction' })
          return
        }
        trackAffiliateClick(event)
      }}
      className="content-mall-btn guide-sake-card__btn"
    >
      {label}
    </a>
  )
}
