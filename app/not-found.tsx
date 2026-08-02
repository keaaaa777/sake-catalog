import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center" style={{ background: '#030914' }}>
      <span
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: 56,
          height: 56,
          border: '1px solid #c8a24a',
          color: '#c8a24a',
          borderRadius: 8,
          fontSize: 24,
        }}
        aria-hidden="true"
      >
        雫
      </span>
      <div>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: '#f7f2e7' }}>
          ページが見つかりません
        </h1>
        <p style={{ color: 'rgba(247,242,231,0.6)' }}>Page not found</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="content-back-link">← 雫 SAKE SELECT トップへ</Link>
        <Link href="/en" lang="en" className="content-back-link">← Shizuku Sake Select Home</Link>
      </div>
    </div>
  )
}
