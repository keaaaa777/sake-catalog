// Keep affiliate links disabled in previews and local builds. For Cloudflare,
// set SAKE_CATALOG_ENV=production both while building static pages and in the
// production Worker environment. Vercel continues to use VERCEL_ENV.
export function isProductionEnvironment(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.SAKE_CATALOG_ENV === 'production'
}
