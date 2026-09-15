export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function trackEvent(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}

export function trackAffiliateClick(params: { sake_id: string; mall: string; source_flow: string }) {
  trackEvent('affiliate_click', params)
}

export function trackDiagnosisStart() {
  trackEvent('diagnosis_start', {})
}

export function trackDiagnosisComplete(params: { type_id: string }) {
  trackEvent('diagnosis_complete', params)
}

export function trackFavoriteAdd(params: { sake_slug: string }) {
  trackEvent('favorite_add', params)
}

export function trackFavoriteRemove(params: { sake_slug: string }) {
  trackEvent('favorite_remove', params)
}

export function trackCompareAdd(params: { sake_slug: string; compare_count: number }) {
  trackEvent('compare_add', params)
}

export function trackSearchSubmit(params: { query: string; result_count: number }) {
  trackEvent('search_submit', params)
}
