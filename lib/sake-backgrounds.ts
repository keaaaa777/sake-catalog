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
  orchard: {
    url: '/images/sake-backgrounds/pear-apple-aroma.webp',
    alt: '和梨と青りんごから香りが立つイメージ',
    theme: '果実香',
  },
  citrus: {
    url: '/images/sake-backgrounds/fresh-yuzu-citrus.webp',
    alt: '柚子と清涼な水しぶきのイメージ',
    theme: '柑橘・酸味',
  },
  cedar: {
    url: '/images/sake-backgrounds/misty-cedar-forest.webp',
    alt: '霧に包まれた杉林のイメージ',
    theme: '杉・木香',
  },
  warm: {
    url: '/images/sake-backgrounds/warm-sake-hearth.webp',
    alt: '炭火のそばで温まる酒器のイメージ',
    theme: '燗酒',
  },
  autumn: {
    url: '/images/sake-backgrounds/autumn-maple-water.webp',
    alt: '深い秋色の紅葉と静かな水面のイメージ',
    theme: '秋・ひやおろし',
  },
  moon: {
    url: '/images/sake-backgrounds/crescent-moon-lake.webp',
    alt: '三日月が映る静かな湖のイメージ',
    theme: '調和・静けさ',
  },
  volcanic: {
    url: '/images/sake-backgrounds/volcanic-mineral-earth.webp',
    alt: '火山と黒い大地に立ち込める霧のイメージ',
    theme: '火山・大地',
  },
  kyoto: {
    url: '/images/sake-backgrounds/kyoto-bamboo-temple.webp',
    alt: '京都の竹林と古寺を思わせる夜景のイメージ',
    theme: '京都',
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
  if (sake.prefecture === '京都府') return BACKGROUNDS.kyoto

  const description = sake.description || ''
  if (/柚子|柑橘|レモン|グレープフルーツ|オレンジ/.test(description)) return BACKGROUNDS.citrus
  if (/りんご|リンゴ|林檎|梨|メロン|桃|バナナ|マスカット|葡萄|ぶどう/.test(description)) return BACKGROUNDS.orchard
  if (/杉|木香|樽香|木桶/.test(description)) return BACKGROUNDS.cedar
  if (/ひやおろし|秋上がり|秋あがり|秋限定/.test(description)) return BACKGROUNDS.autumn
  if (sake.servingTemp.some((temperature) => /燗|ぬる燗|熱燗/.test(temperature))) return BACKGROUNDS.warm
  if (sake.prefecture === '鹿児島県' || /火山|火山灰|シラス台地/.test(description)) return BACKGROUNDS.volcanic
  if (/名水|清流|湧水|伏流水|雪解け水/.test(description)) return BACKGROUNDS.water
  if (/海|沿岸|魚介/.test(description)) return BACKGROUNDS.coast
  if (/雪|寒造り|寒冷/.test(description) || (SNOW_COUNTRY.has(sake.prefecture) && sake.flavorType === 'sou')) {
    return BACKGROUNDS.snow
  }

  if (sake.flavorType === 'kaori') return BACKGROUNDS.floral
  if (sake.flavorType === 'jun') return BACKGROUNDS.rice
  if (sake.flavorType === 'juku') return BACKGROUNDS.aged
  if (sake.taste.sharpness >= 4) return BACKGROUNDS.sharp
  if (Math.abs(sake.sweetDry) <= 1 && Math.abs(sake.lightRich) <= 1) return BACKGROUNDS.moon
  return BACKGROUNDS.water
}

export const SAKE_BACKGROUNDS = BACKGROUNDS
