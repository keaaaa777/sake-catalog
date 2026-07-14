'use client'

import Image from 'next/image'
import { SakeOffer } from '@/lib/offers'
import { trackAffiliateClick } from '@/lib/gtag'

interface ProductOfferCardProps {
  sakeId: string
  slug: string
  offers: SakeOffer[]
  fetchedAt: string | null
  // VERCEL_ENV は NEXT_PUBLIC_ 接頭辞が無いサーバー専用の環境変数のため、
  // クライアントコンポーネント内で直接 process.env.VERCEL_ENV を読むと
  // ブラウザ側では常に undefined になり判定が壊れる。呼び出し元の
  // サーバーコンポーネント(page.tsx)で isProductionDomain() を評価し、
  // 結果をpropとして渡すこと。
  production: boolean
}

const STALE_DAYS = 30

function formatFetchedAt(fetchedAt: string | null) {
  if (!fetchedAt) return null
  const date = new Date(fetchedAt)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('ja-JP')
}

function isStale(fetchedAt: string | null) {
  if (!fetchedAt) return false
  const date = new Date(fetchedAt)
  if (Number.isNaN(date.getTime())) return false
  return (Date.now() - date.getTime()) / 86_400_000 > STALE_DAYS
}

export default function ProductOfferCard({ sakeId, slug, offers, fetchedAt, production }: ProductOfferCardProps) {
  const fetchedAtLabel = formatFetchedAt(fetchedAt)

  if (offers.length === 0) return null

  return (
    <div className="content-offer-list">
      {offers.map((offer, idx) => (
        <div key={idx} className="content-offer-card">
          {offer.imageUrl && (
            <div className="content-offer-card__thumb">
              <Image src={offer.imageUrl} alt={offer.itemName} width={72} height={72} unoptimized />
            </div>
          )}
          <div className="content-offer-card__body">
            <div className="content-offer-card__head">
              {idx === 0 && <span className="content-offer-card__badge">最安値</span>}
              {offer.itemPrice != null && (
                <span className="content-offer-card__price">¥{offer.itemPrice.toLocaleString()}(税込)</span>
              )}
            </div>
            <p className="content-offer-card__name">{offer.itemName}</p>
            {offer.shopName && <p className="content-offer-card__shop">{offer.shopName}</p>}
            {offer.reviewCount != null && offer.reviewCount > 0 && offer.reviewAverage != null && (
              <p className="content-offer-card__review">
                ★{offer.reviewAverage.toFixed(1)} {offer.reviewCount}件
              </p>
            )}
            <a
              href={production ? `/api/out/${slug}/rakuten?offer=${idx}&source=offercard` : '#'}
              target={production ? '_blank' : undefined}
              rel="sponsored nofollow noopener"
              onClick={(e) => {
                if (!production) {
                  e.preventDefault()
                  return
                }
                trackAffiliateClick({ sake_id: sakeId, mall: 'rakuten', source_flow: 'offercard' })
              }}
              className="content-mall-btn content-offer-card__btn"
            >
              このお店で見る
            </a>
          </div>
        </div>
      ))}

      <p className="content-offer-note">
        {fetchedAtLabel ? `${fetchedAtLabel}時点の価格・在庫情報です。` : '価格取得日時は不明です。'}
        {isStale(fetchedAt) && ' 価格が変動している場合があります。'}
      </p>
      {!production && (
        <p className="content-offer-note">プレビュー環境のため購入リンクは無効化されています。</p>
      )}
    </div>
  )
}
