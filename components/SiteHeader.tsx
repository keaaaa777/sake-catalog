import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand__logo" aria-hidden="true">雫</span>
        <span className="brand__name">SAKE SELECT</span>
      </Link>
      <nav className="site-header__nav" aria-label="サイト内ナビゲーション">
        <Link href="/diagnosis">1分診断</Link>
        <Link href="/search">銘柄から探す</Link>
        <Link href="/ranking">注目セレクション</Link>
        <Link href="/guide">ガイド</Link>
        <Link href="/en" lang="en">EN</Link>
      </nav>
    </header>
  )
}
