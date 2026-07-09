export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function trackAffiliateClick(params: { sake_id: string; mall: string; source_flow: string }) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'affiliate_click', params)
}
