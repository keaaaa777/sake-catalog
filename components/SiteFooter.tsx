import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-gold/15 bg-[#030914] px-6 py-10 text-xs text-washi/50">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/about" className="hover:text-gold">サイトについて</Link>
          <Link href="/disclosure" className="hover:text-gold">広告掲載ポリシー</Link>
          <Link href="/privacy" className="hover:text-gold">プライバシーポリシー</Link>
        </nav>
        <p className="text-kurenai/80">20歳未満の飲酒は法律で禁じられています。</p>
        <p>本サイトはアフィリエイト広告を利用しています。</p>
        <p className="text-washi/30">&copy; {new Date().getFullYear()} 雫 SAKE SELECT</p>
      </div>
    </footer>
  )
}
