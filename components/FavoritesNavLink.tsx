'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/useFavorites'

export default function FavoritesNavLink() {
  const { favoriteSlugs } = useFavorites()
  return (
    <Link href="/favorites" aria-label={`お気に入り ${favoriteSlugs.length}件`} className="inline-flex items-center gap-1.5">
      <Heart className={`h-3.5 w-3.5 ${favoriteSlugs.length > 0 ? 'fill-current' : ''}`} aria-hidden="true" />
      <span>お気に入り{favoriteSlugs.length > 0 ? ` (${favoriteSlugs.length})` : ''}</span>
    </Link>
  )
}
