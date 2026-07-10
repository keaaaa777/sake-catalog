import { FlavorType } from '@/lib/types'

export type Occasion = 'social' | 'solo'

export interface DiagnosisType {
  id: string
  flavorType: FlavorType
  occasion: Occasion
  name: string
  catch: string
  description: string
}

export const DIAGNOSIS_TYPES: DiagnosisType[] = [
  {
    id: 'kaori-social',
    flavorType: 'kaori',
    occasion: 'social',
    name: '乾杯フローラル型',
    catch: '華やかな香りで場を彩る、乾杯上手なあなたに。',
    description:
      'フルーティーで華やかな香りの薫酒が似合うタイプ。人との集まりや特別な席で、グラス越しに会話も弾む一杯を選びます。',
  },
  {
    id: 'kaori-solo',
    flavorType: 'kaori',
    occasion: 'solo',
    name: 'おこもりフルーティ型',
    catch: '静かな夜に、そっと寄り添う華やかな一杯。',
    description:
      '軽やかで華やかな香りの薫酒を、ひとりの時間でじっくり楽しみたいタイプ。読書や音楽のお供にぴったりです。',
  },
  {
    id: 'sou-social',
    flavorType: 'sou',
    occasion: 'social',
    name: '乾杯クリスタル型',
    catch: 'キレ味さわやか、乾杯にぴったりのクールな一杯。',
    description:
      'すっきりとしたキレのある爽酒が似合うタイプ。大勢での食事や乾杯シーンで、料理の邪魔をせず場を引き立てます。',
  },
  {
    id: 'sou-solo',
    flavorType: 'sou',
    occasion: 'solo',
    name: 'しずけさ爽快型',
    catch: '澄んだ気持ちで味わう、ひとり時間のご褒美に。',
    description:
      'すっきりと軽やかな爽酒で、ひとりの時間を整えたいタイプ。よく冷やして静かに味わう一杯がよく似合います。',
  },
  {
    id: 'jun-social',
    flavorType: 'jun',
    occasion: 'social',
    name: '宴会コク旨型',
    catch: 'コクと旨みで場を盛り上げる、頼れる存在。',
    description:
      '米の旨みをしっかり感じる醇酒が似合うタイプ。にぎやかな食事の席で、料理と一緒に杯が進みます。',
  },
  {
    id: 'jun-solo',
    flavorType: 'jun',
    occasion: 'solo',
    name: '晩酌まったり型',
    catch: '一日の終わりに、ゆったり寄り添う旨口の一杯。',
    description:
      'コクのある醇酒で、ひとりの晩酌をじっくり楽しみたいタイプ。ぬる燗にして、静かな時間を満たします。',
  },
  {
    id: 'juku-social',
    flavorType: 'juku',
    occasion: 'social',
    name: '特別な夜の熟成型',
    catch: '濃密な香りで、特別な夜を演出する大人の一杯。',
    description:
      '複雑で濃厚な熟酒が似合うタイプ。記念日や特別な集まりの締めくくりに、余韻の長い一杯を選びます。',
  },
  {
    id: 'juku-solo',
    flavorType: 'juku',
    occasion: 'solo',
    name: 'ロマンチスト熟成型',
    catch: 'ひとり静かに味わう、深く長い余韻。',
    description:
      '熟成感のある濃密な香りを、ひとりでじっくり味わいたいタイプ。読書や物思いにふける夜のお供にどうぞ。',
  },
]

export function getDiagnosisType(id: string): DiagnosisType | undefined {
  return DIAGNOSIS_TYPES.find((t) => t.id === id)
}

export const DIAGNOSIS_TYPE_IDS = DIAGNOSIS_TYPES.map((t) => t.id)
