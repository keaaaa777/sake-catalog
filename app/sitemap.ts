import type { MetadataRoute } from 'next'
import {
  getAllSakes,
  getAllBreweries,
  getSakesByFlavorType,
  getSakesByPairing,
  getSakesByPrefecture,
  getSakesByScene,
  getSakesByClassificationSlug,
} from '@/lib/data'
import { PREFECTURE_SLUGS } from '@/lib/types'
import { FLAVOR_TYPE_IDS } from '@/lib/flavor'
import { PAIRING_CATEGORY_IDS } from '@/lib/pairing'
import { DIAGNOSIS_TYPE_IDS } from '@/lib/diagnosisTypes'
import { SCENE_IDS } from '@/lib/scenes'
import { CLASSIFICATION_SLUG_IDS } from '@/lib/classification'
import { GUIDE_SLUGS, getGuideArticleBySlug } from '@/lib/guides'
import { getAllEnSakeSlugs, getAllEnGuideArticles } from '@/lib/i18n/en-content'
import { isIndexableBrewery, isIndexableSake } from '@/lib/indexability'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog.vercel.app'
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL
const TRUST_PAGES_UPDATED_AT = '2026-09-04'

export default function sitemap(): MetadataRoute.Sitemap {
  const indexableSakes = getAllSakes().filter(isIndexableSake)
  const hasIndexableSakes = (sakes: typeof indexableSakes) => sakes.some(isIndexableSake)
  const indexableEnSlugs = new Set(
    getAllEnSakeSlugs().filter((slug) => indexableSakes.some((sake) => sake.slug === slug))
  )
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/diagnosis`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/ranking`, lastModified: TRUST_PAGES_UPDATED_AT, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/guide`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: TRUST_PAGES_UPDATED_AT, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/editorial-policy`, lastModified: TRUST_PAGES_UPDATED_AT, changeFrequency: 'yearly', priority: 0.4 },
    ...(CONTACT_EMAIL ? [{ url: `${SITE_URL}/corrections`, lastModified: TRUST_PAGES_UPDATED_AT, changeFrequency: 'yearly' as const, priority: 0.3 }] : []),
    { url: `${SITE_URL}/disclosure`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const scenePages: MetadataRoute.Sitemap = SCENE_IDS.filter((scene) =>
    hasIndexableSakes(getSakesByScene(scene))
  ).map((scene) => ({
    url: `${SITE_URL}/scene/${scene}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const guidePages: MetadataRoute.Sitemap = GUIDE_SLUGS.map((slug) => {
    const article = getGuideArticleBySlug(slug)
    return {
      url: `${SITE_URL}/guide/${slug}`,
      lastModified: article?.updatedAt ?? article?.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }
  })

  const diagnosisResultPages: MetadataRoute.Sitemap = DIAGNOSIS_TYPE_IDS.map((typeId) => ({
    url: `${SITE_URL}/diagnosis/result/${typeId}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const sakePages: MetadataRoute.Sitemap = indexableSakes.map((s) => ({
    url: `${SITE_URL}/sake/${s.slug}`,
    lastModified: s.lastReviewedAt,
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  const brewerySakeCounts = new Map<string, number>()
  for (const sake of getAllSakes()) {
    if (sake.breweryId) {
      brewerySakeCounts.set(sake.breweryId, (brewerySakeCounts.get(sake.breweryId) ?? 0) + 1)
    }
  }
  const breweryPages: MetadataRoute.Sitemap = getAllBreweries()
    .filter((b) => isIndexableBrewery(b, brewerySakeCounts.get(b.slug) ?? 0))
    .map((b) => ({
      url: `${SITE_URL}/brewery/${b.slug}`,
      lastModified: b.lastReviewedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  const areaPages: MetadataRoute.Sitemap = Object.entries(PREFECTURE_SLUGS)
    .filter(([prefecture]) => hasIndexableSakes(getSakesByPrefecture(prefecture)))
    .map(([, slug]) => ({
      url: `${SITE_URL}/area/${slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const typePages: MetadataRoute.Sitemap = FLAVOR_TYPE_IDS.filter((flavorType) =>
    hasIndexableSakes(getSakesByFlavorType(flavorType))
  ).map((flavorType) => ({
    url: `${SITE_URL}/type/${flavorType}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const pairingPages: MetadataRoute.Sitemap = PAIRING_CATEGORY_IDS.filter((category) =>
    hasIndexableSakes(getSakesByPairing(category))
  ).map((category) => ({
    url: `${SITE_URL}/pairing/${category}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const classificationPages: MetadataRoute.Sitemap = CLASSIFICATION_SLUG_IDS.filter((slug) =>
    hasIndexableSakes(getSakesByClassificationSlug(slug))
  ).map((slug) => ({
    url: `${SITE_URL}/classification/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const enStaticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/en`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/en/sake`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/en/guide`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/en/type`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/en/diagnosis`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/en/about`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/en/disclosure`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/en/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const enTypePages: MetadataRoute.Sitemap = FLAVOR_TYPE_IDS.filter((flavorType) =>
    getSakesByFlavorType(flavorType).some((sake) => indexableEnSlugs.has(sake.slug))
  ).map((flavorType) => ({
    url: `${SITE_URL}/en/type/${flavorType}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const enPairingPages: MetadataRoute.Sitemap = PAIRING_CATEGORY_IDS.filter((category) =>
    getSakesByPairing(category).some((sake) => indexableEnSlugs.has(sake.slug))
  ).map((category) => ({
    url: `${SITE_URL}/en/pairing/${category}`,
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  const enScenePages: MetadataRoute.Sitemap = SCENE_IDS.filter((scene) =>
    getSakesByScene(scene).some((sake) => indexableEnSlugs.has(sake.slug))
  ).map((scene) => ({
    url: `${SITE_URL}/en/scene/${scene}`,
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  const enSakePages: MetadataRoute.Sitemap = [...indexableEnSlugs].map((slug) => ({
    url: `${SITE_URL}/en/sake/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const enGuidePages: MetadataRoute.Sitemap = getAllEnGuideArticles().map((a) => ({
    url: `${SITE_URL}/en/guide/${a.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const enDiagnosisResultPages: MetadataRoute.Sitemap = DIAGNOSIS_TYPE_IDS.map((typeId) => ({
    url: `${SITE_URL}/en/diagnosis/result/${typeId}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [
    ...staticPages,
    { url: `${SITE_URL}/area`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/type`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/classification`, changeFrequency: 'weekly', priority: 0.6 },
    ...diagnosisResultPages,
    ...sakePages,
    ...breweryPages,
    ...areaPages,
    ...typePages,
    ...pairingPages,
    ...classificationPages,
    ...scenePages,
    ...guidePages,
    ...enStaticPages,
    ...enSakePages,
    ...enGuidePages,
    ...enTypePages,
    ...enPairingPages,
    ...enScenePages,
    ...enDiagnosisResultPages,
  ]
}
