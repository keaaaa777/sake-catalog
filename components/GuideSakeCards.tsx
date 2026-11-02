import Image from 'next/image'
import Link from 'next/link'
import { getSakeBySlug } from '@/lib/data'
import type { GuideSakeCardItem } from '@/lib/guides'
import { getOfferImageUrl, getOffersForSake, getOffersFetchedAt } from '@/lib/offers'
import SakeThumb from '@/components/SakeThumb'
import GuideOfferButton from '@/components/GuideOfferButton'

// ガイド記事の本文中に、紹介した銘柄を写真・価格・購入ボタン付きで並べる。
// 本文(bodyHtml)の <!--sake-cards …--> の位置に差し込まれる(書き方は lib/guides.ts の parseGuideBody)。
export default function GuideSakeCards({ items: cardItems, production }: { items: GuideSakeCardItem[]; production: boolean }) {
  const items = cardItems.map(({ slug, note }) => {
    const sake = getSakeBySlug(slug)
    if (!sake) throw new Error(`ガイドの銘柄カードに存在しない銘柄があります: ${slug}`)
    const offers = getOffersForSake(slug)
    const offerIndex = offers.findIndex((o) => o.itemPrice != null)
    const offer = offerIndex >= 0 ? offers[offerIndex] : undefined
    const imageUrl = offer?.imageUrl ?? getOfferImageUrl(slug)
    return { sake, note, offer, offerIndex: offer ? offerIndex : undefined, imageUrl }
  })
  if (items.length === 0) return null

  const fetchedAt = getOffersFetchedAt()
  const fetchedAtLabel = fetchedAt ? new Date(fetchedAt).toLocaleDateString('ja-JP') : null
  const hasPrice = items.some((item) => item.offer)

  return (
    <div className="guide-sake-cards">
      <div className="guide-sake-cards__grid">
        {items.map(({ sake, note, offer, offerIndex, imageUrl }) => {
          const specs = [
            sake.specs.abv != null ? `${sake.specs.abv}度` : null,
            sake.specs.polishing != null ? `精米歩合${sake.specs.polishing}%` : null,
          ].filter(Boolean)
          return (
            <div key={sake.slug} className="guide-sake-card">
              <Link href={`/sake/${sake.slug}`} className="guide-sake-card__thumb" aria-label={`${sake.name}の詳細`}>
                {imageUrl ? (
                  <Image src={imageUrl} alt={sake.name} width={96} height={96} unoptimized />
                ) : (
                  <SakeThumb sake={sake} size={96} />
                )}
              </Link>
              <div className="guide-sake-card__body">
                <p className="guide-sake-card__meta">
                  {sake.prefecture}・{sake.classification}
                </p>
                <Link href={`/sake/${sake.slug}`} className="guide-sake-card__name">
                  {sake.name}
                </Link>
                {note && <p className="guide-sake-card__note">{note}</p>}
                {specs.length > 0 && <p className="guide-sake-card__specs">{specs.join(' / ')}</p>}
                {offer?.itemPrice != null && (
                  <p className="guide-sake-card__price">
                    ¥{offer.itemPrice.toLocaleString()}
                    <span>(税込)〜</span>
                  </p>
                )}
                <div className="guide-sake-card__actions">
                  <GuideOfferButton
                    sakeId={sake.id}
                    slug={sake.slug}
                    offerIndex={offerIndex}
                    production={production}
                    label={offer ? '楽天で見る' : '楽天で探す'}
                  />
                  <Link href={`/sake/${sake.slug}`} className="guide-sake-card__detail">
                    詳しく見る
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {hasPrice && (
        <p className="guide-sake-cards__note">
          {fetchedAtLabel ? `価格は${fetchedAtLabel}時点の楽天市場の情報です。` : '価格は楽天市場の情報です。'}
          最新の価格は販売店のページでご確認ください。
          {!production && ' (プレビュー環境のため購入リンクは無効です)'}
        </p>
      )}
    </div>
  )
}
