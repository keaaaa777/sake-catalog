import { Sake } from '@/lib/types'

export interface MallLink {
  mall: 'rakuten' | 'amazon' | 'yahoo' | 'furusato'
  label: string
  url: string
  isDirect: boolean
}

// 楽天のアフィリエイト収益が実際に発生するか検証する期間中は、
// 未提携で報酬が発生しない Amazon/Yahoo の導線は表示しない(一時的な方針)。
// ふるさと納税もアフィリエイト報酬とは無関係な直リンクだが、導線を楽天のみに
// 絞るため一時的に非表示にしている。
// 復活させる場合は amazon/yahoo の tag/PID 付与を実装してから戻すこと。
export function buildAffiliateLinks(sake: Sake): MallLink[] {
  const direct = sake.affiliate[0] || {}
  const q = encodeURIComponent(sake.name)

  return [
    {
      mall: 'rakuten',
      label: '楽天市場',
      url: direct.rakuten || `https://search.rakuten.co.jp/search/mall/${q}/`,
      isDirect: Boolean(direct.rakuten),
    },
  ]
}
