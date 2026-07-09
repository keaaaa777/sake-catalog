import Link from 'next/link'

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand__logo" aria-hidden="true">雫</span>
        <span className="brand__name">SAKE SELECT</span>
      </Link>
    </header>
  )
}
