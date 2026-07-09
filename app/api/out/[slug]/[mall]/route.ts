import { NextRequest, NextResponse } from 'next/server'
import { getSakeBySlug } from '@/lib/data'
import { buildAffiliateLinks } from '@/lib/affiliate'
import { logAffiliateClick } from '@/lib/affiliateLog'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; mall: string } }
) {
  const sake = getSakeBySlug(params.slug)
  const link = sake && buildAffiliateLinks(sake).find((m) => m.mall === params.mall)

  // 銘柄またはモールが不正な場合は外部への転送をせずトップへ戻す
  if (!sake || !link) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  }

  const sourceFlow = request.nextUrl.searchParams.get('source') || 'unknown'

  await logAffiliateClick({
    sakeId: sake.id,
    sakeSlug: sake.slug,
    mall: params.mall,
    sourceFlow,
  })

  return NextResponse.redirect(link.url, {
    status: 302,
    headers: { 'Cache-Control': 'no-store' },
  })
}
