import Link from 'next/link'

export default function EnSiteHeader() {
  return (
    <header className="site-header">
      <Link href="/en" className="brand">
        <span className="brand__logo" aria-hidden="true">雫</span>
        <span className="brand__name">SAKE SELECT</span>
      </Link>
      <nav className="site-header__nav" aria-label="Site navigation">
        <Link href="/en/sake">Browse Sake</Link>
        <Link href="/en/guide">Guide</Link>
        <Link href="/" lang="ja">日本語</Link>
      </nav>
    </header>
  )
}
