const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog.vercel.app'

interface Crumb {
  name: string
  /** 現在のページ(パンくずの末尾)には指定しない */
  path?: string
}

export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path ? `${SITE_URL}${item.path}` : undefined,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
