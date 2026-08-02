import { FlavorType } from '@/lib/types'

// 香味4分類・料理ペアリング・シーンは固定の少数カテゴリ(事実生成を伴わない
// UI文言)のため、Codexの翻訳パイプラインとは別にここで直接英語ラベルを持つ。
export const FLAVOR_DESC_EN: Record<FlavorType, string> = {
  kaori: 'Fruity, floral aromas with a light, delicate finish. Most daiginjo and ginjo sake fall into this style.',
  sou: 'Clean aromas with a crisp, light, refreshing finish. Best enjoyed well chilled.',
  jun: 'Deep umami and body from the rice itself, balanced with mild acidity. Many junmai sake fall into this style.',
  juku: 'Complex, concentrated aromas reminiscent of dried fruit or spice, with a thick, deep flavor. Often aged.',
}

export const PAIRING_LABEL_EN: Record<string, string> = {
  sashimi: 'Sashimi & Sushi',
  yakitori: 'Yakitori & Grilled Meat',
  fried: 'Fried Food',
  cheese: 'Cheese & Snacks',
  other: 'Other Dishes',
}

export const SCENE_LABEL_EN: Record<string, string> = {
  daily: 'Everyday Drinking',
  gift: 'Gifts',
  beginner: 'Beginner-Friendly',
  special: 'Special Occasions',
}
