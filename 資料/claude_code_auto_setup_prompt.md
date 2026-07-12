# Claude Code 自動セットアップ - 日本酒図鑑プロジェクト

以下の指示に従って、日本酒図鑑の完全なNext.jsプロジェクトをセットアップしてください。
各ステップは順番に実行し、すべて完了したら報告してください。

---

## 🎯 最終目標
- Next.jsプロジェクト初期化完了
- 全ファイル配置完了
- ローカルで `npm run dev` で動作確認
- Gitリポジトリ初期化
- ユーザーが手動でGitHub pushできる状態にする

---

## ⚙️ 実行環境確認

まず以下を実行してください：
```bash
node --version
npm --version
git --version
```

Node.js v18以上、npm v9以上、gitがインストール済みであることを確認してください。

---

## 📋 実行手順

### **Step 1: プロジェクトディレクトリ初期化**

```bash
# 現在いるディレクトリを確認
pwd

# 作業用ディレクトリに移動（ユーザーのホームディレクトリ推奨）
cd ~

# sake-catalog フォルダを作成
mkdir -p sake-catalog
cd sake-catalog

# 確認
pwd
ls -la
```

---

### **Step 2: Next.js プロジェクト初期化**

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --no-git \
  --import-alias '@/*' \
  --app \
  --no-src-dir \
  --skip-install
```

実行後に質問が出たら自動で "No" を選択するため、以下で確認して修正してください。

---

### **Step 3: package.json 確認・パッケージインストール**

```bash
# package.json 内容確認
cat package.json

# 必要なパッケージをインストール
npm install zustand react-query lucide-react @supabase/supabase-js
```

---

### **Step 4: フォルダ構造作成**

```bash
# 必要なフォルダを一括作成
mkdir -p app/api/sake
mkdir -p app/api/search
mkdir -p components
mkdir -p lib
mkdir -p public/images

# 確認
tree -L 3 -I 'node_modules|.next'
```

（`tree` がない場合は `ls -R` で確認）

---

### **Step 5: lib フォルダ内のファイル作成**

**ファイル1: `lib/types.ts` を作成**

```typescript
export interface Sake {
  id: number
  name: string
  prefecture: string
  type: 'pure_rice' | 'ginjo' | 'daiginjo' | 'honjozo'
  dry_sweet_index: number
  acidity?: number
  alcohol_percentage: number
  description: string
  tasting_notes?: string
  food_pairing?: string[]
  image_url?: string
  affiliate_amazon_link?: string
  affiliate_rakuten_link?: string
  created_at?: string
}

export interface Brewery {
  id: number
  name: string
  prefecture: string
  founded_year?: number
  description: string
  website_url?: string
  image_url?: string
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

export const REGIONS = {
  '北海道': ['北海道'],
  '東北': ['青森県', '岩手県', '秋田県', '山形県', '宮城県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '愛知県', '三重県'],
  '関西': ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
}
```

**ファイル2: `lib/db.ts` を作成**

```typescript
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
```

---

### **Step 6: app/page.tsx を完全に置き換え**

```typescript
'use client'

import { useState, useMemo } from 'react'
import { MapPin, Filter, Zap, Heart, ChevronRight } from 'lucide-react'
import { REGIONS, PREFECTURES, Sake } from '@/lib/types'
import { getSakeList, searchSake, SAMPLE_SAKE_DATA } from '@/lib/db'

export default function Home() {
  const [step, setStep] = useState('home')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [favorites, setFavorites] = useState<number[]>([])
  const [quizAnswers, setQuizAnswers] = useState({})

  const filteredSakes = useMemo(() => {
    let result: Sake[] = []

    if (step === 'list' && selectedPrefecture) {
      result = SAMPLE_SAKE_DATA[selectedPrefecture] || []
    }

    if (filterType !== 'all') {
      result = result.filter(sake => {
        if (filterType === 'sweet') return sake.dry_sweet_index > 3
        if (filterType === 'dry') return sake.dry_sweet_index < -2
        if (filterType === 'balanced') return sake.dry_sweet_index >= -2 && sake.dry_sweet_index <= 3
        return true
      })
    }

    return result
  }, [step, selectedPrefecture, filterType])

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  // ホーム画面
  if (step === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-7xl mb-4">🍶</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">日本酒図鑑</h1>
            <p className="text-lg text-gray-600">全国の名酒を発見しよう</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep('region')}
              className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-800">地図から探す</div>
                  <div className="text-sm text-gray-600">地方 → 都道府県を選んで検索</div>
                </div>
                <MapPin className="text-red-500" size={24} />
              </div>
            </button>

            <button
              onClick={() => setStep('list')}
              className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-orange-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-800">好みから探す</div>
                  <div className="text-sm text-gray-600">甘口・辛口など好みで絞り込み</div>
                </div>
                <Filter className="text-orange-500" size={24} />
              </div>
            </button>

            <button
              onClick={() => setStep('quiz')}
              className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-800">診断で見つける</div>
                  <div className="text-sm text-gray-600">質問に答えてぴったりの酒を発見</div>
                </div>
                <Zap className="text-blue-500" size={24} />
              </div>
            </button>

            {favorites.length > 0 && (
              <button
                onClick={() => setStep('favorites')}
                className="w-full p-4 bg-red-100 rounded-lg text-red-700 font-bold hover:bg-red-200 transition"
              >
                ❤️ お気に入り ({favorites.length})
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 地方選択
  if (step === 'region') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('home')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6">地方を選択</h2>

          <div className="grid grid-cols-1 gap-3">
            {Object.keys(REGIONS).map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-orange-50 transition text-left"
              >
                <div className="font-bold text-gray-800">{region}</div>
                <div className="text-sm text-gray-600">
                  {REGIONS[region as keyof typeof REGIONS].join(' / ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 都道府県選択
  if (step === 'region' && selectedRegion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedRegion(null)}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6">{selectedRegion}から選択</h2>

          <div className="grid grid-cols-1 gap-3">
            {REGIONS[selectedRegion as keyof typeof REGIONS]?.map(pref => (
              <button
                key={pref}
                onClick={() => {
                  setSelectedPrefecture(pref)
                  setStep('list')
                }}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-red-50 transition text-left flex items-center justify-between"
              >
                <div className="font-bold text-gray-800">{pref}</div>
                <ChevronRight size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 日本酒リスト
  if (step === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('home')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {selectedPrefecture ? `${selectedPrefecture}の日本酒` : '日本酒一覧'}
          </h2>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'sweet', 'dry', 'balanced'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  filterType === type
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {type === 'all' && 'すべて'}
                {type === 'sweet' && '甘口'}
                {type === 'dry' && '辛口'}
                {type === 'balanced' && 'バランス型'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredSakes.map(sake => (
              <div
                key={sake.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{sake.image_url || '🍶'}</div>
                    <div>
                      <div className="font-bold text-gray-800">{sake.name}</div>
                      <div className="text-sm text-gray-600">{sake.type}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(sake.id)}
                    className={`p-2 rounded-full transition ${
                      favorites.includes(sake.id)
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(sake.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    {sake.dry_sweet_index < -2
                      ? '辛口'
                      : sake.dry_sweet_index > 3
                      ? '甘口'
                      : 'バランス型'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {sake.alcohol_percentage}%
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-3">{sake.description}</p>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">
                    詳しく見る
                  </button>
                  {sake.affiliate_amazon_link && (
                    <a
                      href={sake.affiliate_amazon_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition text-sm text-center"
                    >
                      購入
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredSakes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">該当する日本酒が見つかりません</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 診断画面
  if (step === 'quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('home')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6">あなたの好みを診断</h2>

          <div className="space-y-6">
            {[
              {
                key: 'taste',
                label: '基本的な好み',
                options: [
                  { value: 'dry', label: '辛口が好き' },
                  { value: 'balanced', label: 'バランス型が好き' },
                  { value: 'sweet', label: '甘口が好き' }
                ]
              },
              {
                key: 'intensity',
                label: 'アルコール度数',
                options: [
                  { value: 'light', label: 'ライト（13%以下）' },
                  { value: 'medium', label: 'スタンダード（13-15%）' },
                  { value: 'strong', label: 'ストロング（15%以上）' }
                ]
              },
              {
                key: 'aroma',
                label: '香りの好み',
                options: [
                  { value: 'fruity', label: 'フルーティー' },
                  { value: 'floral', label: '華やか' },
                  { value: 'subtle', label: '上品・淡い' }
                ]
              },
              {
                key: 'occasion',
                label: 'よく飲む場面',
                options: [
                  { value: 'meal', label: 'ご飯と一緒に' },
                  { value: 'chat', label: 'おしゃべりしながら' },
                  { value: 'alone', label: 'ゆっくり一人で' }
                ]
              }
            ].map(question => (
              <div key={question.key} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-gray-800 mb-3">{question.label}</h3>
                <div className="space-y-2">
                  {question.options.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100"
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={option.value}
                        checked={quizAnswers[question.key as keyof typeof quizAnswers] === option.value}
                        onChange={(e) =>
                          setQuizAnswers({
                            ...quizAnswers,
                            [question.key]: e.target.value
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setStep('recommend')}
              disabled={Object.keys(quizAnswers).length < 4}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300 transition"
            >
              おすすめを見る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // おすすめ結果
  if (step === 'recommend') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('quiz')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {quizAnswers['taste' as keyof typeof quizAnswers] === 'sweet' && '甘口好きさん向け'}
              {quizAnswers['taste' as keyof typeof quizAnswers] === 'dry' && '辛口好きさん向け'}
              {quizAnswers['taste' as keyof typeof quizAnswers] === 'balanced' && 'バランス型好きさん向け'}
            </h2>
            <p className="text-gray-600">あなたの好みに合わせたおすすめの日本酒です</p>
          </div>

          <div className="space-y-4">
            {[
              { name: '陸奥八仙', region: '青森県', taste: '辛口', desc: 'あなたの好みにぴったり' },
              { name: '月桂冠', region: '京都府', taste: '中口', desc: 'バランスの良さが特徴' },
              { name: '播州一献', region: '兵庫県', taste: '中辛口', desc: 'コクと深さがある' }
            ].map((sake, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg shadow border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">🍶</div>
                  <div>
                    <div className="font-bold text-gray-800">{sake.name}</div>
                    <div className="text-sm text-gray-600">{sake.region}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">{sake.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
```

---

### **Step 7: app/layout.tsx を更新**

既存ファイルを確認して、以下のようになっているか確認：

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '日本酒図鑑',
  description: '全国の名酒を発見できるプラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

### **Step 8: .env.local ファイル作成**

```env
# Supabase（後で設定）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
SUPABASE_SERVICE_ROLE_KEY=your-key-here

# アフィリエイト（後で設定）
AMAZON_AFFILIATE_ID=sake-catalog-22
RAKUTEN_AFFILIATE_ID=your-id-here

# Google Analytics（後で設定）
NEXT_PUBLIC_GA_ID=G-xxxxxxxxxx
```

---

### **Step 9: .gitignore 確認と追加**

既存の `.gitignore` に以下が含まれているか確認：

```
node_modules
.next
.env.local
.env.local.backup
dist
build
```

---

### **Step 10: ローカルで動作確認**

```bash
# 開発サーバー起動
npm run dev
```

**出力を確認：**
```
> next dev

  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

**ブラウザを開く：** http://localhost:3000

確認すべきこと：
- [ ] 🍶 日本酒図鑑のホーム画面が表示される
- [ ] 「地図から探す」ボタンをクリックして北海道を選択できる
- [ ] 「好みから探す」ボタンで日本酒一覧が表示される
- [ ] 各日本酒のハート（お気に入り）ボタンが動作する
- [ ] 「診断で見つける」ボタンでクイズが表示される

**動作確認後、Ctrl + C で サーバーを停止**

---

### **Step 11: Git リポジトリ初期化**

```bash
# Git リポジトリ初期化
git init

# すべてのファイルをステージ
git add .

# コミット
git commit -m "Initial commit: sake-catalog MVP setup"

# 確認
git log --oneline
git status
```

---

### **Step 12: GitHub push の準備確認**

```bash
# リモート設定がないことを確認
git remote -v

# 以下の出力が表示されれば OK（何も表示されない）
# その場合、ユーザーが手動で GitHub に push する
```

---

## ✅ 完了チェックリスト

実行終了時に以下を確認：

- [ ] npm install 完了
- [ ] `lib/types.ts` 作成済み
- [ ] `lib/db.ts` 作成済み
- [ ] `app/page.tsx` 置き換え完了
- [ ] `app/layout.tsx` 確認完了
- [ ] `.env.local` 作成済み
- [ ] `npm run dev` で http://localhost:3000 が動作
- [ ] ホーム画面が表示される
- [ ] 各ボタン（地図・検索・診断）が動作する
- [ ] Git リポジトリ初期化完了
- [ ] 最初のコミット完了

---

## 🚀 次のステップ（ユーザーが手動で実行）

すべて完了したら、ユーザーに以下を指示：

### **GitHub に push する手順**

1. GitHub で新しいリポジトリ作成：https://github.com/new
   - Repository name: `sake-catalog`
   - Description: `日本酒図鑑 - 全国の名酒を発見するプラットフォーム`
   - Public を選択
   - Create repository

2. ターミナルで実行：
```bash
git remote add origin https://github.com/YOUR-USERNAME/sake-catalog.git
git branch -M main
git push -u origin main
```

3. GitHub で確認：https://github.com/YOUR-USERNAME/sake-catalog

### **Vercel にデプロイする手順**

1. https://vercel.com/sign-up で GitHub を使ってログイン
2. ダッシュボードで「Add New」→「Project」
3. GitHub から `sake-catalog` を選択
4. 「Deploy」をクリック
5. URL を確認（例：`https://sake-catalog-abc.vercel.app`）

---

## 📝 実行完了レポート

以下を出力してください：

```
✅ プロジェクト初期化完了
├─ Node.js version: [出力]
├─ npm version: [出力]
├─ Next.js プロジェクト: sake-catalog/
├─ 作成ファイル数: [数]
├─ パッケージ: zustand, react-query, lucide-react, @supabase/supabase-js インストール完了
├─ ローカルサーバー: http://localhost:3000 で動作確認済み
├─ Git リポジトリ: 初期化完了
└─ 初回コミット: "Initial commit: sake-catalog MVP setup"

🚀 次のステップ:
  1. GitHub に新規リポジトリ作成
  2. git push で GitHub にプッシュ
  3. Vercel にデプロイ

📂 プロジェクトパス: [出力]
```

---

**以上で完了です！** Claude Code に貼り付けて実行してください。
