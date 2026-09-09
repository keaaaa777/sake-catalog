'use client'

import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/useFavorites'

export default function FavoriteButton({ slug, name, compact = false }: { slug: string; name: string; compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(slug)
  const label = active ? `${name}をお気に入りから削除` : `${name}をお気に入りに追加`

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={() => toggleFavorite(slug)}
      className={compact
        ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-[#07101d]/90 text-gold transition hover:border-gold hover:bg-gold/10'
        : 'inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm text-gold transition hover:bg-gold/10'}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} aria-hidden="true" />
      {!compact && <span>{active ? 'お気に入り済み' : 'お気に入りに追加'}</span>}
    </button>
  )
}
