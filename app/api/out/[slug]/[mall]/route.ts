import { NextRequest, NextResponse } from 'next/server'
import { getSakeBySlug } from '@/lib/data'
import { buildAffiliateLinks } from '@/lib/affiliate'
import { logAffiliateClick } from '@/lib/affiliateLog'
import { getOffersForSake } from '@/lib/offers'
import { isProductionDomain } from '@/lib/is-production-domain'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; mall: string } }
) {
  const sake = getSakeBySlug(params.slug)
  if (!sake) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  }

  // 商品紹介カード(楽天の複数店舗比較)からは ?offer=<配列index> で
  // data/cache/sake-offers.json の該当店舗を指定する。未指定時は
  // 従来通り affiliate[0] の単一リンク(またはモール内検索へのフォールバック)を使う。
  const offerParam = request.nextUrl.searchParams.get('offer')
  let targetUrl: string | undefined

  if (params.mall === 'rakuten' && offerParam !== null) {
    const idx = Number(offerParam)
    targetUrl = getOffersForSake(params.slug)[idx]?.affiliateUrl
  } else {
    targetUrl = buildAffiliateLinks(sake).find((m) => m.mall === params.mall)?.url
  }

  // 銘柄・モール・オファー指定が不正な場合は外部への転送をせずトップへ戻す
  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  }

  // 楽天アフィリエイトは申請時に登録した本番ドメインでのみ掲載が認められているため、
  // preview環境(本番以外のVercelデプロイ)では実リンクへ転送しない
  if (!isProductionDomain()) {
    return NextResponse.redirect(new URL(`/sake/${params.slug}`, request.url), { status: 302 })
  }

  const sourceFlow = request.nextUrl.searchParams.get('source') || 'unknown'

  await logAffiliateClick({
    sakeId: sake.id,
    sakeSlug: sake.slug,
    mall: params.mall,
    sourceFlow,
  })

  return NextResponse.redirect(targetUrl, {
    status: 302,
    headers: { 'Cache-Control': 'no-store' },
  })
}
