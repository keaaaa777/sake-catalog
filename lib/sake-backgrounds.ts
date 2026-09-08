import { Sake } from '@/lib/types'

export interface SakeBackground {
  url: string
  alt: string
  theme: string
}

const BACKGROUNDS = {
  sharp: {
    url: '/images/sake-backgrounds/sharp-silver-glint.webp',
    alt: '静かな水面を走る銀色の光のイメージ',
    theme: 'キレ・辛口',
  },
  water: {
    url: '/images/sake-backgrounds/clear-mountain-spring.webp',
    alt: '深い山を流れる清らかな水のイメージ',
    theme: '清流・透明感',
  },
  floral: {
    url: '/images/sake-backgrounds/elegant-floral-aroma.webp',
    alt: '暗がりに咲く花と香りの余韻のイメージ',
    theme: '華やかな香り',
  },
  rice: {
    url: '/images/sake-backgrounds/golden-rice-field.webp',
    alt: '夕暮れの田に実る稲穂のイメージ',
    theme: '米の旨味',
  },
  aged: {
    url: '/images/sake-backgrounds/aged-brewery-cellar.webp',
    alt: '静かな酒蔵で時を重ねる木桶のイメージ',
    theme: '熟成・濃醇',
  },
  snow: {
    url: '/images/sake-backgrounds/snow-country-mountains.webp',
    alt: '雪に覆われた山々と冷気のイメージ',
    theme: '雪国・寒造り',
  },
  nara: {
    url: '/images/sake-backgrounds/nara-deer-temple.webp',
    alt: '奈良の鹿と古寺を思わせる静かな情景のイメージ',
    theme: '奈良',
  },
  coast: {
    url: '/images/sake-backgrounds/moonlit-japanese-coast.webp',
    alt: '月明かりに照らされた日本の海岸のイメージ',
    theme: '海・魚介',
  },
} satisfies Record<string, SakeBackground>

const SNOW_COUNTRY = new Set(['北海道', '青森県', '秋田県', '山形県', '新潟県', '富山県'])

/** 明示登録を最優先し、未登録商品には説明・産地・味わいから共通背景を割り当てる。 */
export function getSakeBackground(sake: Sake): SakeBackground {
  if (sake.backgroundImageUrl) {
    return {
      url: sake.backgroundImageUrl,
      alt: sake.backgroundImageAlt || `${sake.name}のイメージ画像`,
      theme: '個別登録',
    }
  }

  if (sake.prefecture === '奈良県') return BACKGROUNDS.nara

  const description = sake.description || ''
  if (/名水|清流|湧水|伏流水|雪解け水/.test(description)) return BACKGROUNDS.water
  if (/海|沿岸|魚介/.test(description)) return BACKGROUNDS.coast
  if (/雪|寒造り|寒冷/.test(description) || (SNOW_COUNTRY.has(sake.prefecture) && sake.flavorType === 'sou')) {
    return BACKGROUNDS.snow
  }

  if (sake.flavorType === 'kaori') return BACKGROUNDS.floral
  if (sake.flavorType === 'jun') return BACKGROUNDS.rice
  if (sake.flavorType === 'juku') return BACKGROUNDS.aged
  if (sake.taste.sharpness >= 4) return BACKGROUNDS.sharp
  return BACKGROUNDS.water
}

export const SAKE_BACKGROUNDS = BACKGROUNDS
