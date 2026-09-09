export const FAVORITES_STORAGE_KEY = 'sake-select:favorite-slugs'
export const FAVORITES_CHANGED_EVENT = 'sake-select:favorites-changed'
export const MAX_FAVORITES = 50

function sanitizeFavoriteSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0))]
    .slice(0, MAX_FAVORITES)
}

export function getFavoriteSlugs(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return sanitizeFavoriteSlugs(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]'))
  } catch {
    return []
  }
}

export function setFavoriteSlugs(slugs: string[]): string[] {
  const next = sanitizeFavoriteSlugs(slugs)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED_EVENT, { detail: next }))
  }
  return next
}
