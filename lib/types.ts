export type FlavorType = 'kaori' | 'sou' | 'jun' | 'juku'

export interface Sake {
  id: string
  slug: string
  name: string
  nameKana?: string
  breweryId?: string
  prefecture: string
  classification: string
  flavorType: FlavorType
  taste: {
    sweetness: number
    acidity: number
    umami: number
    aroma: number
    sharpness: number
  }
  sweetDry: number
  lightRich: number
  specs: {
    polishing?: number
    rice?: string
    yeast?: string
    abv?: number
    smv?: number
    acid?: number
  }
  servingTemp: string[]
  pairings: string[]
  scenes: string[]
  priceRange: number
  description: string
  imageUrl?: string
  affiliate: { rakuten?: string; amazon?: string; yahoo?: string; furusato?: string }[]
}

export interface Brewery {
  id: string
  slug: string
  name: string
  prefecture: string
  foundedYear?: number
  description: string
  websiteUrl?: string
  imageUrl?: string
}

export interface QuizAnswers {
  taste: 'dry' | 'balanced' | 'sweet'
  intensity: 'light' | 'medium' | 'strong'
  aroma: 'fruity' | 'floral' | 'subtle'
  occasion: 'meal' | 'chat' | 'alone'
}

export const PREFECTURES = [
  '北海道', '青森県', '岩手県', '秋田県', '山形県', '宮城県',
  '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県',
  '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県',
  '山梨県', '長野県', '岐阜県', '愛知県', '三重県', '滋賀県',
  '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県',
  '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県',
  '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県',
  '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

export const PREFECTURE_SLUGS: Record<string, string> = {
  '北海道': 'hokkaido', '青森県': 'aomori', '岩手県': 'iwate', '秋田県': 'akita',
  '山形県': 'yamagata', '宮城県': 'miyagi', '福島県': 'fukushima', '茨城県': 'ibaraki',
  '栃木県': 'tochigi', '群馬県': 'gunma', '埼玉県': 'saitama', '千葉県': 'chiba',
  '東京都': 'tokyo', '神奈川県': 'kanagawa', '新潟県': 'niigata', '富山県': 'toyama',
  '石川県': 'ishikawa', '福井県': 'fukui', '山梨県': 'yamanashi', '長野県': 'nagano',
  '岐阜県': 'gifu', '静岡県': 'shizuoka', '愛知県': 'aichi', '三重県': 'mie',
  '滋賀県': 'shiga', '京都府': 'kyoto', '大阪府': 'osaka', '兵庫県': 'hyogo',
  '奈良県': 'nara', '和歌山県': 'wakayama', '鳥取県': 'tottori', '島根県': 'shimane',
  '岡山県': 'okayama', '広島県': 'hiroshima', '山口県': 'yamaguchi', '徳島県': 'tokushima',
  '香川県': 'kagawa', '愛媛県': 'ehime', '高知県': 'kochi', '福岡県': 'fukuoka',
  '佐賀県': 'saga', '長崎県': 'nagasaki', '熊本県': 'kumamoto', '大分県': 'oita',
  '宮崎県': 'miyazaki', '鹿児島県': 'kagoshima', '沖縄県': 'okinawa',
}

export const REGIONS = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '秋田県', '山形県', '宮城県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県'],
  '関西': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}
