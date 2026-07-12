# 日本酒図鑑 - アフィリエイト＆マネタイズ戦略書

---

## 📊 マネタイズの全体像

### 複数の収益パス

```
年間収入目標イメージ:
┌─────────────────────────────────┐
│  月額平均 50-100万円 (年 600-1200万円)  │
├─────────────────────────────────┤
│ ① アフィリエイト      40-50万円/月│
│ ② 蔵元スポンサー      30-40万円/月│
│ ③ 企業広告バナー      20-30万円/月│
│ ④ Google Adsense      5-10万円/月│
│ ⑤ その他             5-10万円/月│
└─────────────────────────────────┘
```

---

## 🔗 ① アフィリエイト (最初の収入源)

### A. Amazon アソシエイト

#### 設定手順

```
1. https://affiliate.amazon.co.jp にアクセス
2. 「プログラムに参加」をクリック
3. 本人確認 (身分証明書提出)
4. 銀行口座登録
5. トラッキング ID 取得 (例: sake-catalog-22)

承認期間: 1-2週間
```

#### 実装方法

```typescript
// lib/affiliate.ts に追加
export function generateAmazonAffiliateLink(
  asin: string,
  trackingId: string = process.env.AMAZON_AFFILIATE_ID!
): string {
  const baseUrl = `https://www.amazon.co.jp/dp/${asin}`
  const affiliateUrl = new URL(baseUrl)
  affiliateUrl.searchParams.set('tag', trackingId)
  return affiliateUrl.toString()
}

// 例: /catalog/sake/123 ページで自動的にリンク生成
export async function getSakeWithAffiliateLinks(sakeId: number) {
  const sake = await getSakeById(sakeId)
  
  return {
    ...sake,
    affiliateLinks: {
      amazon: generateAmazonAffiliateLink(sake.amazon_asin),
      rakuten: generateRakutenAffiliateLink(sake.rakuten_id)
    }
  }
}
```

#### 報酬体系

```
カテゴリ: 飲食料品
報酬率: 2-3%
例: ¥3,000 の日本酒が売れた場合
    報酬 = ¥3,000 × 2.5% = ¥75

予想月収 (100万PV):
- 推定転換率: 0.5% (5,000クリック)
- クリック→購入率: 5% (250購入)
- 平均単価: ¥2,500
- 月額: 250 × ¥2,500 × 2.5% = ¥15,625
```

#### 最適化のコツ

```
✓ クリック率向上
- 「購入ボタン」は見やすい場所に配置
- 「Amazon で今すぐ購入」テキストを使用
- 複数の購入オプション表示

✓ 転換率向上
- レビュー・評判を充実させる
- ユーザーの信頼を構築
- 「これまでの購入者」スナップショット

✓ コンバージョン追跡
- Google Analytics でリンククリックを計測
- Amazon の管理画面で転換データ確認
```

---

### B. 楽天アフィリエイト

#### 設定手順

```
1. https://affiliate.rakuten.co.jp
2. ユーザー登録
3. 楽天ID確認
4. SID (サイトID) 取得

報酬の入金: 楽天キャッシュ
```

#### 実装例

```typescript
export function generateRakutenAffiliateLink(
  productId: string,
  siteId: string = process.env.RAKUTEN_AFFILIATE_ID!
): string {
  return `https://hb.afl.rakuten.co.jp/hgc/${siteId}/?pc=https://item.rakuten.co.jp/...`
}
```

#### 報酬体系

```
カテゴリ: 日本酒・焼酎
報酬率: 2-4%
アマゾンより若干高い傾向
```

---

### C. 蔵元オンラインショップ直接提携

#### アプローチ方法

```
メール例:

件名: 【連携のご提案】貴蔵の日本酒を全国のファンに紹介したいです

本文:
───────────────────
いつもお世話になっております。

日本酒情報メディア「日本酒図鑑」(月間 XX万PV) を運営している
〇〇と申します。

貴蔵の 「〇〇」を弊サイトで紹介させて頂きたく、
アフィリエイト提携についてお問い合わせさせていただきました。

【提案内容】
- 貴蔵の専用ページ作成
- 購入リンク経由の売上レポート提供
- SNS での定期宣伝

【現在の実績】
- 月間 XX万 PV
- 日本酒初心者～愛好家向けのコンテンツ

お気軽にお問い合わせください。

───────────────────
```

#### 直接提携のメリット

```
✓ 報酬率 5-15% (Amazonより高い)
✓ 蔵元との関係構築 (将来のスポンサーシップへ)
✓ 販売データの可視化 (蔵元側が欲しい情報)
✓ 専用割引コード設定可能

対象蔵元:
- 地元の小〜中規模蔵 (10-50億円/年売上)
- オンラインショップを持つ
- 新規顧客開拓に興味がある
```

---

## 🏢 ② 蔵元スポンサーシップ (中期)

### 収益モデル

```
月額広告枠: 5-20万円 / 蔵元
目標: 10蔵元の獲得 = 月 50-200万円
```

### スポンサーシップ内容

#### A. ブロンズ tier (月額 5万円)

```
内容:
- 蔵元の情報ページ (地図上の企業ページ)
- トップページのブランドロゴ掲載 (小)
- 月1回のニュースレター掲載

対象: 小規模蔵元 (年売上 5-10億円)
```

#### B. シルバー tier (月額 10万円)

```
内容:
- ブロンズ tier すべて +
- トップページのブランドロゴ (大)
- 月1回のフィーチャー記事
- Google 検索結果での優先表示

対象: 中規模蔵元 (年売上 10-30億円)
```

#### C. ゴールド tier (月額 20万円)

```
内容:
- シルバー tier すべて +
- 蔵元取材記事 (定期)
- 限定イベント枠
- API 経由での商品情報自動更新

対象: 大規模蔵元 (年売上 30億円以上)
```

### 営業アプローチ

#### ステップ 1: データ収集
```javascript
// 蔵元リスト作成
const targetBreweries = [
  {
    name: '〇〇酒造',
    prefecture: '京都府',
    website: 'https://...',
    estimatedRevenue: '20億円',
    contactEmail: 'info@...',
    tier: 'silver'
  },
  // ...
]
```

#### ステップ 2: メディアキット作成
```
以下を含む PDF を作成:
- サイト概要
- 月間 PV / UV
- ユーザーデモグラフィック
- 過去スポンサーの成果事例
- 価格表
```

#### ステップ 3: アウトリーチ
```
メール例:

件名: 【新サービス】日本酒図鑑でのスポンサー枠のご案内

本文:
───────────────────
貴社のご担当者様へ

いつもお世話になっております。

日本酒図鑑は月間 XX万ユーザーが利用する
日本酒発見プラットフォームです。

このたび、蔵元様向けのスポンサーシップ枠を
リリースいたしました。

【スポンサーメリット】
✓ 全国のファンに直接アピール
✓ 販売データを取得可能
✓ SNS での定期宣伝

【実績】
- 前スポンサー: 売上 120% 増加
- サイト内滞在時間: 平均 5分

メディアキット（添付）をご覧ください。

───────────────────
```

### 成功事例テンプレート

```
【スポンサー事例】
蔵元名: 〇〇酒造

実績:
- サイト内クリック: 月 XXX回
- 外部リンククリック: 月 XX回
- 推定追加売上: ¥XXX万

顧客の声:
「新規顧客が前月比 150% 増加した」
```

---

## 📺 ③ 企業広告バナー (成長段階)

### 広告スペース

#### A. トップページ
```
位置: ヘッダー直下 (728x90)
月額: 50万円
想定月間表示数: 200万インプレッション
```

#### B. サイドバー
```
位置: 右サイドバー (300x250)
月額: 30万円
想定月間表示数: 100万インプレッション
```

#### C. 記事中
```
位置: 記事内中盤 (728x280)
月額: 20万円
想定月間表示数: 80万インプレッション
```

### 広告スケジュール

```
1月-3月: 日本酒需要期
  → プレミアムスポット 150万円/月

4月-6月: 通常期
  → 100万円/月

7月-9月: 通常期
  → 100万円/月

10月-12月: 需要期
  → 150万円/月

年間: 1,200万円を想定
```

### 広告主ターゲット

```
大手酒造企業:
- キリン, アサヒ (輸入日本酒)
- メルシャン (日本酒も製造)
- 合同酒精 (鍍高譚)

飲食チェーン:
- 居酒屋チェーン
- 焼き鳥チェーン
- 日本料理レストラン

ECプラットフォーム:
- Winery.jp
- 日本酒.com
- 各マーケットプレイス

お酒関連:
- オンライン酒販サイト
- サブスク日本酒サービス
```

---

## 🔍 ④ Google Adsense (補助的)

### 設定

```
1. Google Adsense 登録
2. サイト審査 (1-2週間)
3. 広告コード挿入

報酬: PV ベース (CPC, CPM)
```

### 予想収入

```
日本酒サイト (美食系):
- RPM (1000PV あたり): 300-500円
- 月 100万 PV の場合: 30-50万円

実装時期:
- PV が 月 50万に達したら開始推奨
```

### 配置最適化

```
✓ 高CTR 配置:
  - ヘッダー下 (100%x90)
  - サイドバー上部 (300x250)
  - 記事内一番上

✗ 避けるべき配置:
  - 記事の邪魔になる位置
  - ユーザーが購入ボタンと間違える
```

---

## 📧 ⑤ メールリスト (将来)

### ニュースレター

```
サブスク型メール配信:
- 週 1 回: 新商品紹介
- 月 1 回: 特別セール情報

無料パート:
- 誰でも購読可能
- 新商品 3 選

プレミアムパート (月額 300円):
- 会員限定の早期セール情報
- 蔵元との対談

目標: 5,000 購読者 × 300円 = 月 150万円
```

---

## 💳 ⑥ Stripe & 予約機能

### 蔵元ツアー予約

```
機能:
- 蔵元訪問ツアーの予約・決済
- Stripe 統合

Stripe 手数料: 3.6% + 10円
貴社取り分: 30%

例: ¥10,000 ツアー
  手数料: ¥376
  貴社: ¥2,864
```

---

## 📊 収益ダッシュボード

### 実装例

```typescript
// components/RevenueDashboard.tsx
'use client'

import { useState, useEffect } from 'react'

interface Revenue {
  affiliate: number
  sponsorship: number
  adsense: number
  banner: number
  other: number
}

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<Revenue>({
    affiliate: 45000,
    sponsorship: 35000,
    adsense: 8000,
    banner: 0,
    other: 2000
  })

  const total = Object.values(revenue).reduce((a, b) => a + b, 0)

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">月間収益 (管理画面)</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(revenue).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">{key}</div>
            <div className="text-2xl font-bold">¥{value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-green-50 rounded border-2 border-green-500">
        <div className="text-lg text-gray-700">合計月収</div>
        <div className="text-4xl font-bold text-green-600">
          ¥{total.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 マネタイズ実行スケジュール

### Month 1-2: アフィリエイト基盤

```
✓ Amazon アソシエイト登録
✓ 楽天アフィリエイト登録
✓ 各商品ページにアフィリエイトリンク
✓ Google Analytics で転換追跡
```

### Month 3-4: 蔵元との直接提携

```
✓ 5 蔵元へのアウトリーチ開始
✓ 直接アフィリエイト 2-3 社獲得目標
✓ 報酬レポート作成
```

### Month 5-6: スポンサーシップ展開

```
✓ スポンサーシップ tier 作成
✓ メディアキット完成
✓ 営業 5-10 社へアプローチ
✓ 最初の 1-2 社獲得
```

### Month 7-12: 複合収益

```
✓ 企業広告バナー募集開始
✓ Google Adsense 申請 (PV 50万達成後)
✓ ニュースレター検討開始
```

---

## 💰 税務・法務チェックリスト

### 必須対応

```
□ 事業開始届 (税務署)
□ 個人事業主 vs 法人化の判断
  - 月収 50万円超えたら法人化推奨
□ 青色申告申請
□ アフィリエイト所得の申告
  - 雑所得 or 事業所得で計上
□ 消費税登録
  - 売上 1,000万円超えたら必須
```

### アフィリエイト開示

```
法律: 景品表示法

対応:
□ リンク周辺に「広告」「PR」と表記
□ 利用規約に「アフィリエイトリンク」の明記
□ Google Adsense も「広告」と記載
```

---

## 📈 KPI 監視

### 月次レポート

```
├─ クリック数
│  ├─ Affiliate clicks: XXX
│  ├─ Banner impressions: XXX万
│  └─ Click-through rate: X.X%
│
├─ 転換
│  ├─ Affiliate purchases: XX
│  ├─ Conversion rate: X.X%
│  └─ AOV (Average Order Value): ¥XXX
│
└─ 収益
   ├─ Affiliate revenue: ¥XXX万
   ├─ Sponsorship: ¥XXX万
   └─ Total revenue: ¥XXX万
```

---

## 🚀 成功の鍵

```
1. 信頼の構築
   - 高品質なコンテンツ
   - ユーザーレビュー

2. トラッキング
   - 何が売れたか常に把握
   - データドリブンな改善

3. 継続営業
   - 蔵元・企業への定期アウトリーチ
   - 「成果」を見せることが大事

4. 複合収益
   - 1つの収入源に依存しない
   - 複数の道をテスト

5. スケーリング
   - 最初は小さく始める
   - 実績が出たら拡大
```

---

このマネタイズ戦略で、**年内に月収 30-50万円、
翌年には月収 100万円超えも十分可能**です！
