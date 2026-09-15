'use client'

import { useCallback, useEffect, useState } from 'react'
import { FAVORITES_CHANGED_EVENT, getFavoriteSlugs, setFavoriteSlugs } from '@/lib/favorites'
import { trackFavoriteAdd, trackFavoriteRemove } from '@/lib/gtag'

export function useFavorites() {
  const [favoriteSlugs, setState] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setState(getFavoriteSlugs())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(FAVORITES_CHANGED_EVENT, sync)
    }
  }, [])

  const toggleFavorite = useCallback((slug: string) => {
    const current = getFavoriteSlugs()
    const isRemoving = current.includes(slug)
    setState(setFavoriteSlugs(isRemoving ? current.filter((item) => item !== slug) : [...current, slug]))
    if (isRemoving) {
      trackFavoriteRemove({ sake_slug: slug })
    } else {
      trackFavoriteAdd({ sake_slug: slug })
    }
  }, [])

  const clearFavorites = useCallback(() => setState(setFavoriteSlugs([])), [])

  return {
    favoriteSlugs,
    isFavorite: useCallback((slug: string) => favoriteSlugs.includes(slug), [favoriteSlugs]),
    toggleFavorite,
    clearFavorites,
  }
}
