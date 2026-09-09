import Link from 'next/link'
import type { Sake } from '@/lib/types'
import SakeThumb from '@/components/SakeThumb'
import FavoriteButton from '@/components/FavoriteButton'

export default function SakeFavoriteCard({ sake, meta, size = 40, children }: { sake: Sake; meta: string; size?: number; children?: React.ReactNode }) {
  return (
    <article className="relative">
      <Link href={`/sake/${sake.slug}`} className="content-mini-card pr-14">
        <SakeThumb sake={sake} size={size} />
        <div className="min-w-0">
          <div className="content-mini-card__name">{sake.name}</div>
          <div className="content-mini-card__meta">{meta}</div>
          {children}
        </div>
      </Link>
      <span className="absolute right-3 top-1/2 -translate-y-1/2"><FavoriteButton slug={sake.slug} name={sake.name} compact /></span>
    </article>
  )
}
