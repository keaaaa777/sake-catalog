# 日本酒図鑑 - 開発スタートガイド

## 🎯 目標: 2-3週間でMVPをローンチ

---

## 📋 事前準備

### アカウント・サービス登録（1日目）
```
必須:
□ GitHub アカウント (コード管理)
□ Vercel アカウント (無料ホスティング)
□ Supabase アカウント (PostgreSQL, 無料枠あり)
□ Amazon アソシエイト (アフィリエイト)
□ Google Analytics 4
□ Google Adsense (将来)

オプション:
□ Stripe (決済用、後期)
□ Cloudinary (画像管理)
□ SendGrid (メール)
```

---

## 🚀 Step 1: プロジェクト初期化 (1時間)

### 1-1. ローカル環境セットアップ

```bash
# Node.js v18+ がインストール済みか確認
node --version
npm --version

# Next.js プロジェクト作成
npx create-next-app@latest sake-catalog --typescript --tailwind
cd sake-catalog

# 必要なパッケージ追加
npm install zustand react-query lucide-react mapbox-gl
npm install -D @types/mapbox-gl
```

### 1-2. 基本フォルダ構造

```
sake-catalog/
├── app/
│   ├── page.tsx (ホーム)
│   ├── api/
│   │   ├── sake/
│   │   │   ├── route.ts (GET 日本酒一覧)
│   │   │   └── [id]/route.ts (GET 詳細)
│   │   ├── search/
│   │   │   └── route.ts (POST 検索)
│   │   └── quiz/
│   │       └── route.ts (POST 診断結果)
│   ├── catalog/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── layout.tsx
├── components/
│   ├── SakeCard.tsx
│   ├── RegionMap.tsx
│   ├── QuizForm.tsx
│   ├── Navbar.tsx
│   └── Layout.tsx
├── lib/
│   ├── db.ts (Database接続)
│   ├── types.ts (TypeScript型定義)
│   └── affiliate.ts (アフィリエイトリンク管理)
├── public/
│   └── images/
└── .env.local
```

---

## 🗄️ Step 2: Database セットアップ (2時間)

### 2-1. Supabase でプロジェクト作成

```
1. https://supabase.com へアクセス
2. "New Project" をクリック
3. Project name: "sake-catalog"
4. Region: "Tokyo" (または最も近い地域)
5. Password 設定
6. Create new project (待機 5-10分)
```

### 2-2. データベーススキーマ作成

Supabase の SQL エディタで実行:

```sql
-- テーブル 1: 蔵元
CREATE TABLE breweries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prefecture VARCHAR(100) NOT NULL,
  founded_year INT,
  description TEXT,
  website_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テーブル 2: 日本酒
CREATE TABLE sake (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brewery_id INT REFERENCES breweries(id),
  prefecture VARCHAR(100) NOT NULL,
  type VARCHAR(50), -- 純米, 吟醸, etc
  
  -- 味わい
  dry_sweet_index FLOAT, -- -10(辛) ~ +10(甘)
  acidity FLOAT,
  alcohol_percentage FLOAT,
  
  description TEXT,
  tasting_notes TEXT,
  food_pairing TEXT[],
  image_url VARCHAR(500),
  
  -- アフィリエイト
  affiliate_amazon_link VARCHAR(500),
  affiliate_rakuten_link VARCHAR(500),
  
  -- メタデータ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テーブル 3: ユーザープロフィール（将来用）
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  favorite_sake_ids INT[],
  quiz_results JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テーブル 4: アクセスログ（分析用）
CREATE TABLE analytics_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  event_type VARCHAR(50), -- 'sake_viewed', 'affiliate_clicked', etc
  sake_id INT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス（パフォーマンス）
CREATE INDEX idx_sake_prefecture ON sake(prefecture);
CREATE INDEX idx_sake_type ON sake(type);
CREATE INDEX idx_sake_dry_sweet ON sake(dry_sweet_index);
CREATE INDEX idx_brewery_prefecture ON breweries(prefecture);
```

### 2-3. 環境変数設定

`.env.local` ファイル作成:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Analytics
NEXT_PUBLIC_GA_ID=G-xxxxxxxxxx

# Affiliate
AMAZON_AFFILIATE_ID=your-id
RAKUTEN_AFFILIATE_ID=your-id
```

---

## 📦 Step 3: 基本ライブラリコード (2時間)

### 3-1. Database 接続ラッパー (`lib/db.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// サーバー側用（より権限あり）
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 日本酒取得
export async function getSakeList(prefecture?: string) {
  let query = supabase.from('sake').select('*')
  
  if (prefecture) {
    query = query.eq('prefecture', prefecture)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// 検索
export async function searchSake(filters: {
  prefecture?: string
  type?: string
  drySweet?: 'dry' | 'balanced' | 'sweet'
}) {
  let query = supabase.from('sake').select('*')
  
  if (filters.prefecture) {
    query = query.eq('prefecture', filters.prefecture)
  }
  
  if (filters.type) {
    query = query.eq('type', filters.type)
  }
  
  // ドライスウィート検索
  if (filters.drySweet === 'dry') {
    query = query.lt('dry_sweet_index', -3)
  } else if (filters.drySweet === 'sweet') {
    query = query.gt('dry_sweet_index', 3)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}
```

### 3-2. 型定義 (`lib/types.ts`)

```typescript
export interface Sake {
  id: number
  name: string
  brewery_id: number
  prefecture: string
  type: 'pure_rice' | 'ginjo' | 'daiginjo' | 'honjozo'
  dry_sweet_index: number
  acidity: number
  alcohol_percentage: number
  description: string
  tasting_notes: string
  food_pairing: string[]
  image_url: string
  affiliate_amazon_link?: string
  affiliate_rakuten_link?: string
  created_at: string
}

export interface Brewery {
  id: number
  name: string
  prefecture: string
  founded_year: number
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
```

### 3-3. アフィリエイト管理 (`lib/affiliate.ts`)

```typescript
export function generateAffiliateLink(
  sakeId: number,
  originalLink: string,
  source: 'amazon' | 'rakuten' = 'amazon'
): string {
  const affiliateId = 
    source === 'amazon' 
      ? process.env.AMAZON_AFFILIATE_ID 
      : process.env.RAKUTEN_AFFILIATE_ID

  // URLに追跡パラメータ追加
  const trackingUrl = new URL(originalLink)
  trackingUrl.searchParams.set('aid', affiliateId!)
  trackingUrl.searchParams.set('source', 'sake-catalog')
  trackingUrl.searchParams.set('sake_id', sakeId.toString())
  
  return trackingUrl.toString()
}

export function trackAffiliateClick(sakeId: number, affiliate: 'amazon' | 'rakuten') {
  // Google Analytics に送信
  if (typeof window !== 'undefined') {
    gtag.event('affiliate_click', {
      sake_id: sakeId,
      affiliate_source: affiliate
    })
  }
}
```

---

## 🎨 Step 4: フロント実装 (4時間)

### 4-1. ホームページ (`app/page.tsx`)

```typescript
import Link from 'next/link'
import { MapPin, Filter, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">🍶</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            日本酒図鑑
          </h1>
          <p className="text-lg text-gray-600">
            全国の名酒を発見しよう
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/catalog">
            <button className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-800">
                    地図から探す
                  </div>
                  <div className="text-sm text-gray-600">
                    地方 → 都道府県を選んで検索
                  </div>
                </div>
                <MapPin className="text-red-500" size={24} />
              </div>
            </button>
          </Link>

          <Link href="/search">
            <button className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-800">
                    好みから探す
                  </div>
                  <div className="text-sm text-gray-600">
                    甘口・辛口など好みで絞り込み
                  </div>
                </div>
                <Filter className="text-orange-500" size={24} />
              </div>
            </button>
          </Link>

          <Link href="/quiz">
            <button className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xl font-bold text-gray-800">
                    診断で見つける
                  </div>
                  <div className="text-sm text-gray-600">
                    質問に答えてぴったりの酒を発見
                  </div>
                </div>
                <Zap className="text-blue-500" size={24} />
              </div>
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### 4-2. 日本酒一覧ページ (`app/catalog/page.tsx`)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getSakeList } from '@/lib/db'
import { Sake } from '@/lib/types'
import SakeCard from '@/components/SakeCard'

const prefectures = [
  '北海道', '青森県', '岩手県', '秋田県', '山形県', '宮城県',
  '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県',
  '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県',
  '山梨県', '長野県', '岐阜県', '愛知県', '三重県', '滋賀県',
  '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県',
  '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県',
  '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県',
  '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

export default function Catalog() {
  const [sake, setSake] = useState<Sake[]>([])
  const [selectedPref, setSelectedPref] = useState<string>('北海道')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSake = async () => {
      setLoading(true)
      try {
        const data = await getSakeList(selectedPref)
        setSake(data || [])
      } catch (error) {
        console.error('Error fetching sake:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSake()
  }, [selectedPref])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">日本酒図鑑</h1>

        {/* 都道府県選択 */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            都道府県を選択
          </label>
          <select
            value={selectedPref}
            onChange={(e) => setSelectedPref(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            {prefectures.map(pref => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>

        {/* 日本酒カード */}
        {loading ? (
          <div className="text-center py-8">
            <p>読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sake.map(s => (
              <SakeCard key={s.id} sake={s} />
            ))}
          </div>
        )}

        {!loading && sake.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              この都道府県の日本酒はまだ登録されていません
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 4-3. SakeCard コンポーネント (`components/SakeCard.tsx`)

```typescript
import { Sake } from '@/lib/types'
import { Heart } from 'lucide-react'
import Link from 'next/link'

interface Props {
  sake: Sake
}

export default function SakeCard({ sake }: Props) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{sake.name}</h3>
          <p className="text-sm text-gray-600">{sake.type}</p>
        </div>
        <button className="p-2 hover:bg-red-100 rounded-full transition">
          <Heart size={20} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
            {sake.dry_sweet_index < -3 ? '辛口' 
             : sake.dry_sweet_index > 3 ? '甘口' 
             : 'バランス型'}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            アルコール度数: {sake.alcohol_percentage}%
          </span>
        </div>
        <p className="text-gray-700 text-sm">{sake.description}</p>
      </div>

      <div className="flex gap-2">
        <Link href={`/catalog/${sake.id}`}>
          <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            詳しく見る
          </button>
        </Link>
        {sake.affiliate_amazon_link && (
          <a
            href={sake.affiliate_amazon_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition text-center"
          >
            購入
          </a>
        )}
      </div>
    </div>
  )
}
```

---

## 📝 Step 5: API エンドポイント作成 (2時間)

### 5-1. 日本酒取得 API (`app/api/sake/route.ts`)

```typescript
import { getSakeList } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prefecture = searchParams.get('prefecture')

  try {
    const data = await getSakeList(prefecture || undefined)
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch sake' },
      { status: 500 }
    )
  }
}
```

### 5-2. 検索 API (`app/api/search/route.ts`)

```typescript
import { searchSake } from '@/lib/db'
import { QuizAnswers } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prefecture, type, drySweet } = body

    const results = await searchSake({
      prefecture,
      type,
      drySweet
    })

    return Response.json(results)
  } catch (error) {
    return Response.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
```

---

## 🚀 Step 6: デプロイ (1時間)

### 6-1. Vercel にデプロイ

```bash
# GitHub にプッシュ
git add .
git commit -m "Initial sake-catalog setup"
git push origin main

# Vercel CLI インストール
npm i -g vercel

# Vercel にログイン＆デプロイ
vercel login
vercel
```

### 6-2. 環境変数の設定

Vercel のダッシュボード → Settings → Environment Variables で以下を追加:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- AMAZON_AFFILIATE_ID
- RAKUTEN_AFFILIATE_ID

---

## 📊 Step 7: 初期データ投入 (3-4時間)

### 7-1. Supabase CSV インポート

Supabase UI から "sake" テーブル → "Insert" で、以下フォーマットの CSV をインポート:

```csv
name,brewery_id,prefecture,type,dry_sweet_index,acidity,alcohol_percentage,description,image_url,affiliate_amazon_link
合同酒精 鍍高譚,1,北海道,pure_rice,−5,1.2,15.0,爽やかな香りと辛口,https://...,https://amazon.jp/...
陸奥八仙,2,青森県,ginjo,−3,0.8,16.0,透明感のある辛口,https://...,https://amazon.jp/...
```

### 7-2. 蔵元データも同時投入

```csv
name,prefecture,founded_year,description,website_url,image_url
合同酒精,北海道,1950,北海道を代表する大手蔵元,https://...,https://...
```

---

## 📈 Step 8: 分析・マネタイズ設定 (2時間)

### 8-1. Google Analytics 4 設定

```bash
# .env.local に ID を追加
NEXT_PUBLIC_GA_ID=G-xxxxxxxxxx
```

`app/layout.tsx` に追加:

```typescript
import Script from 'next/script'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 8-2. Amazon アソシエイト登録

1. https://affiliate.amazon.co.jp
2. 本人確認・振込口座登録
3. トラッキングID 取得
4. `.env.local` に設定

---

## ✅ チェックリスト: MVP ローンチ前

- [ ] ローカルで動作確認
- [ ] 日本酒 100-200 種のデータ投入完了
- [ ] アフィリエイトリンク正常に機能
- [ ] Google Analytics 動作確認
- [ ] モバイル対応確認
- [ ] 環境変数すべて設定済み
- [ ] GitHub にコード保存
- [ ] Vercel デプロイ成功
- [ ] SSL 証明書有効
- [ ] ドメイン取得 (sake-catalog.jp など)

---

## 🎉 ローンチ後の最初の100日間

### Week 1-2
- [ ] SNS でローンチ発表 (Twitter, Instagram)
- [ ] 複数の日本酒ブログにリンク依頼
- [ ] 蔵元へのアウトリーチ開始 (10社程度)

### Week 3-4
- [ ] ユーザーフィードバック収集
- [ ] 基本的なバグ修正
- [ ] UI/UX 改善

### Week 5-8
- [ ] 1000+ PV / 月を目指す
- [ ]蔵元スポンサーシップ 1-2 社獲得
- [ ] 初期アフィリエイト収入測定

### Week 9-12
- [ ] ユーザーレビュー機能 追加検討
- [ ] 季節限定商品ページ作成
- [ ] SNS 告知ペース増加

---

## 💡 短期的な改善アイデア

- [ ] 日本酒200→500種に増加
- [ ] 画像品質向上 (蔵元へ高解像度画像リクエスト)
- [ ] モバイルアプリ化 (React Native)
- [ ] SNS シェア機能追加
- [ ] ユーザー登録 (Google OAuth)
- [ ] メール購読機能 (週間レコメンド)

---

このロードマップで 2-3 週間で実用的な MVP をローンチ可能です！
