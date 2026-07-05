// サンプルデータ（後で Supabase に置き換え）
export const SAMPLE_SAKE_DATA: Record<string, any[]> = {
  '北海道': [
    {
      id: 1,
      name: '合同酒精 鍍高譚',
      prefecture: '北海道',
      type: 'pure_rice',
      dry_sweet_index: -5,
      acidity: 1.2,
      alcohol_percentage: 15.0,
      description: '爽やかな香りと心地よい辛口',
      tasting_notes: 'さらりとした口当たり',
      food_pairing: ['刺身', '揚げ物'],
      image_url: '🍶',
      affiliate_amazon_link: 'https://amazon.jp/'
    },
    {
      id: 2,
      name: '国士無双',
      prefecture: '北海道',
      type: 'ginjo',
      dry_sweet_index: -2,
      acidity: 1.0,
      alcohol_percentage: 16.0,
      description: 'バランスの取れた味わい',
      tasting_notes: 'フルーティーな香り',
      image_url: '🌾'
    }
  ],
  '青森県': [
    {
      id: 3,
      name: '陸奥八仙',
      prefecture: '青森県',
      type: 'ginjo',
      dry_sweet_index: -3,
      acidity: 0.8,
      alcohol_percentage: 16.0,
      description: '透明感のある辛口',
      image_url: '🍶'
    },
    {
      id: 4,
      name: '桃の里',
      prefecture: '青森県',
      type: 'honzozo',
      dry_sweet_index: 5,
      acidity: 1.5,
      alcohol_percentage: 15.5,
      description: '甘めで飲みやすい',
      image_url: '🍑'
    }
  ],
  '京都府': [
    {
      id: 5,
      name: '月桂冠',
      prefecture: '京都府',
      type: 'honzozo',
      dry_sweet_index: 2,
      acidity: 1.3,
      alcohol_percentage: 15.6,
      description: '伝統的な京都の味わい',
      image_url: '🍶'
    }
  ],
  '兵庫県': [
    {
      id: 6,
      name: '白鹿',
      prefecture: '兵庫県',
      type: 'honzozo',
      dry_sweet_index: -4,
      acidity: 1.1,
      alcohol_percentage: 15.5,
      description: '江戸時代から続く辛口',
      image_url: '🍶'
    }
  ]
}

export async function getSakeList(prefecture?: string) {
  // 後で Supabase に接続
  if (prefecture && SAMPLE_SAKE_DATA[prefecture]) {
    return SAMPLE_SAKE_DATA[prefecture]
  }
  return Object.values(SAMPLE_SAKE_DATA).flat()
}

export async function searchSake(filters: {
  prefecture?: string
  drySweet?: 'dry' | 'balanced' | 'sweet'
}) {
  let results = Object.values(SAMPLE_SAKE_DATA).flat()

  if (filters.prefecture) {
    results = results.filter(s => s.prefecture === filters.prefecture)
  }

  if (filters.drySweet === 'dry') {
    results = results.filter(s => s.dry_sweet_index < -2)
  } else if (filters.drySweet === 'sweet') {
    results = results.filter(s => s.dry_sweet_index > 3)
  } else if (filters.drySweet === 'balanced') {
    results = results.filter(s => s.dry_sweet_index >= -2 && s.dry_sweet_index <= 3)
  }

  return results
}
