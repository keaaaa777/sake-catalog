import { Sake } from '@/lib/types'

export interface MallLink {
  mall: 'rakuten' | 'amazon' | 'yahoo' | 'furusato'
  label: string
  url: string
  isDirect: boolean
}

// 個別商品への直リンクが無い銘柄は、
// 「銘柄名」でのモール内検索結果ページへフォールバックする(指示書 §6-1)。
export function buildAffiliateLinks(sake: Sake): MallLink[] {
  const direct = sake.affiliate[0] || {}
  const q = encodeURIComponent(sake.name)

  const links: MallLink[] = [
    {
      mall: 'rakuten',
      label: '楽天市場',
      url: direct.rakuten || `https://search.rakuten.co.jp/search/mall/${q}/`,
      isDirect: Boolean(direct.rakuten),
    },
    {
      mall: 'amazon',
      label: 'Amazon',
      url: direct.amazon || `https://www.amazon.co.jp/s?k=${q}`,
      isDirect: Boolean(direct.amazon),
    },
    {
      mall: 'yahoo',
      label: 'Yahoo!ショッピング',
      url: direct.yahoo || `https://shopping.yahoo.co.jp/search?p=${q}`,
      isDirect: Boolean(direct.yahoo),
    },
  ]

  if (direct.furusato) {
    links.push({
      mall: 'furusato',
      label: 'ふるさと納税でもらう',
      url: direct.furusato,
      isDirect: true,
    })
  }

  return links
}
