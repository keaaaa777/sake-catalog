import Link from 'next/link'

export default function EnSiteFooter() {
  return (
    <footer className="relative z-10 border-t border-gold/15 bg-[#030914] px-6 py-10 text-sm text-washi/50">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/en/sake" className="hover:text-gold">Browse Sake</Link>
          <Link href="/en/guide" className="hover:text-gold">Guide</Link>
          <Link href="/en/about" className="hover:text-gold">About</Link>
          <Link href="/en/disclosure" className="hover:text-gold">Advertising Disclosure</Link>
          <Link href="/en/privacy" className="hover:text-gold">Privacy Policy</Link>
        </nav>
        <p className="text-kurenai/80">Drinking under the legal age (20 in Japan) is prohibited.</p>
        <p>This site contains affiliate advertising.</p>
        <p className="text-washi/30">&copy; {new Date().getFullYear()} 雫 SAKE SELECT</p>
      </div>
    </footer>
  )
}
