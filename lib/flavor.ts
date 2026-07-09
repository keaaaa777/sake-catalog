import { FlavorType } from '@/lib/types'

export const FLAVOR_TYPES: Record<FlavorType, { label: string; kana: string; eng: string; desc: string; gradient: [string, string] }> = {
  kaori: {
    label: '薫酒',
    kana: 'くんしゅ',
    eng: 'Fragrant & Light',
    desc: 'フルーティーで華やかな香りと、軽快な飲み口。大吟醸や吟醸酒がこのタイプに属します。',
    gradient: ['#e8d9a0', '#9c7a2e'],
  },
  sou: {
    label: '爽酒',
    kana: 'そうしゅ',
    eng: 'Light & Fresh',
    desc: 'すっきりとした香り、軽やかでシャープなキレ味。冷やすと最も良さが引き立ちます。',
    gradient: ['#8fc1d9', '#2c5f7a'],
  },
  jun: {
    label: '醇酒',
    kana: 'じゅんしゅ',
    eng: 'Rich & Savoury',
    desc: '米本来の深いコク、ふくよかな旨みと酸味。純米酒の多くがこれに該当します。',
    gradient: ['#d9a86c', '#7a4a2c'],
  },
  juku: {
    label: '熟酒',
    kana: 'じゅくしゅ',
    eng: 'Aged & Heavy',
    desc: 'ドライフルーツやスパイスのような複雑で濃厚な香りと、とろりとした深い味わい。',
    gradient: ['#c98a94', '#6b2a38'],
  },
}

export const FLAVOR_TYPE_IDS: FlavorType[] = ['kaori', 'sou', 'jun', 'juku']
