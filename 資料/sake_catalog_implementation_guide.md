# 日本酒図鑑 - 本格実装ガイド

## 📋 プロジェクト概要

**目標**: 日本全国の日本酒を発見・比較できるプラットフォーム
**ユーザー**: 日本酒初心者～愛好家
**マネタイズ**: アフィリエイト + 企業広告 + 予約機能

---

## 🏗️ 推奨技術スタック

### フロントエンド
```
- Next.js 14+ (SSR + SSG対応)
- React 18+
- TailwindCSS + Shadcn/ui
- Zustand (状態管理)
- React Query (データ取得)
- Mapbox GL JS (インタラクティブ地図)
```

### バックエンド
```
- Node.js + Express または Next.js API Routes
- PostgreSQL (メインデータベース)
- Redis (キャッシング)
- Elasticsearch (全文検索)
```

### インフラ
```
- Vercel (フロントエンド + API)
- AWS RDS (PostgreSQL)
- AWS S3 (画像保管)
- CloudFront (CDN)
- Google Analytics 4
```

---

## 📊 データ構造とスキーマ

### 1. 日本酒マスターテーブル
```sql
CREATE TABLE sake (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brewery VARCHAR(255),
  prefecture VARCHAR(100),
  type VARCHAR(50), -- 純米, 吟醸, 大吟醸など
  
  -- 味わいプロファイル
  dry_sweet_index FLOAT, -- -10(辛口) ~ +10(甘口)
  acidity FLOAT,         -- 0~3
  amino_acid FLOAT,      -- アミノ酸度
  aftertaste VARCHAR(200),
  
  alcohol_percentage FLOAT,
  rice_variety VARCHAR(100),
  polishing_ratio FLOAT,
  
  -- メディア
  image_url VARCHAR(500),
  tasting_notes TEXT,
  food_pairing TEXT[],
  
  -- 受賞歴
  awards TEXT[],
  award_years INT[],
  
  -- 在庫情報
  current_availability BOOLEAN,
  recommended_food_matches TEXT[],
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE brewery (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prefecture VARCHAR(100),
  founded_year INT,
  description TEXT,
  website_url VARCHAR(500),
  phone VARCHAR(20),
  established_since TEXT,
  production_volume INT, -- 年間生産量
  image_url VARCHAR(500),
  brewery_tour_available BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE tasting_profile (
  id SERIAL PRIMARY KEY,
  sake_id INT REFERENCES sake(id),
  flavor_notes TEXT[], -- フルーティー, 華やか, 上品など
  temperature_serving VARCHAR(50), -- 冷酒, 常温, ぬる燗など
  suggested_food TEXT[],
  user_rating_avg FLOAT,
  review_count INT
);

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  quiz_results JSONB, -- 診断結果
  favorite_sakes INT[],
  favorite_breweries INT[],
  preferred_tastes JSONB, -- {dry_sweet: 0, acidity: 1, ...}
  taste_history JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE recommendation_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  quiz_answers JSONB,
  recommended_sakes INT[],
  clicked_sake_id INT,
  affiliate_link_clicked BOOLEAN,
  created_at TIMESTAMP
);

-- パフォーマンス用インデックス
CREATE INDEX idx_sake_prefecture ON sake(prefecture);
CREATE INDEX idx_sake_type ON sake(type);
CREATE INDEX idx_sake_dry_sweet ON sake(dry_sweet_index);
CREATE INDEX idx_brewery_prefecture ON brewery(prefecture);
CREATE FULLTEXT INDEX idx_sake_name ON sake(name);
```

---

## 🗺️ 機能実装ロードマップ

### Phase 1: MVP (1-2ヶ月)
- [ ] 基本的な日本酒検索機能
- [ ] 都道府県別フィルタリング
- [ ] 簡易味わい診断 (3-5問)
- [ ] アフィリエイトリンク統合
- [ ] 基本的な日本酒200種類のデータベース

### Phase 2: コア機能の充実 (2-3ヶ月)
- [ ] インタラクティブ地図実装
- [ ] 詳細な味わいプロフィール表示
- [ ] 高度な推奨アルゴリズム
- [ ] ユーザー登録機能 (Google OAuth)
- [ ] お気に入り機能
- [ ] 日本酒1000種類以上に拡大

### Phase 3: コミュニティ機能 (3-4ヶ月)
- [ ] ユーザーレビュー・評価機能
- [ ] テイスティングノート機能
- [ ] ユーザー間のフォロー機能
- [ ] ランキング機能 (人気, 新着, 季節限定)

### Phase 4: モネタイズ強化 (4ヶ月以降)
- [ ] 企業バナー広告スペース
- [ ] スポンサード蔵元ページ
- [ ] プレミアム会員機能
- [ ] イベント情報・購入リンク

---

## 💰 マネタイズ戦略

### 1. アフィリエイト (初期段階)
```
対象: 大手酒類販売サイト
- Amazon.jp 美酒商品 (報酬率 3-5%)
- 楽天市場 日本酒カテゴリ (報酬率 2-4%)
- Yahoo!ショッピング (報酬率 2%)
- 蔵元オンラインショップ (カスタム取決め)
- 酒類専門サイト (日本酒.com, etc)

月間目標: 月50-100万PVで約20-30万円/月
実装方法:
- 各商品に "詳しく見る" ボタン
- アフィリエイト管理(Impact等)で一元化
- リンク追跡とコンバージョン測定
```

### 2. 蔵元スポンサーシップ (中期段階)
```
パターン:
- 蔵元の専用ページ作成 (月額 5-20万円)
- フロント画面でのブランド表示
- 季節限定商品の特別展示

対象: 中堅蔵元 (年売上5-50億円)
目標: 10蔵元 × 月10万円 = 月100万円

実装:
- CMS で蔵元情報を管理
- バナー広告枠の定期ローテーション
- 蔵元データの優先表示オプション
```

### 3. ディスプレイ広告 (成長段階)
```
Google Adsense / Googleプログラマティック広告
- サイドバー: 300x250 (中)
- 記事間: 728x90 (横)
- モバイル: 300x600 (大)

月間100万PVで: 約5-10万円/月 (CPC型)
実装: Google Ad Manager
```

### 4. 企業広告バナー (成長段階)
```
対象: 大手酒類企業 / 飲食企業
- メガバナー (728x280)
- トップページスペック広告
- 月額: 50-150万円

獲得方法:
1. メディアキット作成
2. 営業資料を用意
3. Google Form で広告主向けお問い合わせ
4. Wix 等で簡単な広告メディアページを作成
```

### 5. プレミアム会員機能 (将来)
```
月額 500-1000円
機能:
- 月2-3回のレコメンド配信
- エクスポート機能 (PDF)
- プロフェッショナル向けテイスティングガイド
- 限定セール情報

目標: 1000人 × 500円 = 月50万円
```

### 6. データライセンス (高段階)
```
対象: 飲食企業 / 小売り / メディア
- 日本酒データベースのAPI化
- カスタムレコメンドAPI
- 月額 10-30万円

実装: REST API + Stripe決済
```

---

## 📈 収益予測 (年間推移)

```
Month 1-3 (MVP)
- PV: 1-5万/月
- 収入: アフィリエイト 1-3万円
- 支出: 開発 0円(自作), サーバー 3000円/月

Month 4-6 (成長期)
- PV: 20-50万/月
- 収入: 
  * アフィリエイト 10-15万円
  * 蔵元スポンサー 0-20万円
  * Adsense 2-5万円
- 支出: サーバー 3-5万円, CMSツール 3000円

Month 7-12 (拡大期)
- PV: 100-300万/月
- 収入:
  * アフィリエイト 30-50万円
  * 蔵元スポンサー 50-80万円
  * 企業広告 50-150万円
  * Adsense 10-20万円
- 支出: 運営 10-15万円, マーケティング 20-50万円

Year 2+
- PV: 500万+/月
- 予想月収: 300-500万円
- 支出: 運営チーム, マーケティング 100万円+
```

---

## 🔄 推奨アルゴリズム

### 1. コンテンツベースフィルタリング
```
ユーザーの好みベクトル:
V_user = {
  dry_sweet: ユーザーのスコア,
  acidity: スコア,
  amino_acid: スコア,
  flavor_profile: [フルーティー, 華やか, ...]
}

日本酒のベクトル:
V_sake = {
  dry_sweet_index: 値,
  acidity: 値,
  amino_acid: 値,
  flavor_notes: [...]
}

スコア = コサイン類似度(V_user, V_sake)
```

### 2. 協調フィルタリング (後期)
```
- 同じ蔵元を好む人たちが好むお酒
- 同じ味わいプロフィールの人の履歴
- UserID ベースの推奨行列
```

### 3. トレンド × パーソナル
```
新商品スコア = (人気度 × 0.3) + (パーソナル適合度 × 0.7)
```

---

## 🎯 データ収集・管理戦略

### 初期データ (200-500種類)
```
ソース:
1. 日本酒造組合中央会 (公式DB)
2. 国税庁 統計情報
3. 醸造学会資料
4. 蔵元公式サイト

取得方法:
- Web スクレイピング (許可取得後)
- API統合 (蔵元データベース)
- 手動入力 (クラウドワーク)
```

### 継続更新体制
```
月次更新:
- 新商品追加 (10-30種)
- 季節限定商品の入れ替え
- 在庫情報の更新

四半期更新:
- テイスティングノートの追加
- 受賞歴の更新
- 蔵元情報の更新
```

### ユーザージェネレーテッドコンテンツ
```
- レビュー・テイスティングノート
- 写真アップロード
- 食事ペアリング提案
- ユーザースコアリング
```

---

## 🔐 初期段階での注意点

### 1. 知的財産権
- [ ] 蔵元の許可取得 (ロゴ, 商品画像)
- [ ] テイスティング説明文の著作権確認
- [ ] 利用規約に画像使用についての記載

### 2. 規制対応
- [ ] 酒税法への準拠確認
- [ ] 未成年飲酒防止対策
  - 年齢確認ゲート (簡易)
  - 利用規約での注釈
- [ ] 広告表示に関する法律対応

### 3. アフィリエイト開示
```
各購入リンクの近くに「アフィリエイトリンク」と表記
Google AdSense なら自動的に対応
```

---

## 🚀 初期段階での最小限の実装

### Week 1-2: 基本構築
```
- Next.js プロジェクト作成
- PostgreSQL セットアップ
- 基本的なDB設計実装
```

### Week 3-4: データ入力 & API開発
```
- 日本酒200種のデータ入力
- REST API 構築
- 検索機能の実装
```

### Week 5-6: UI実装
```
- フロント画面実装
- レスポンシブ対応
- パフォーマンス最適化
```

### Week 7-8: 統合 & デプロイ
```
- アフィリエイト統合
- Google Analytics 設定
- Vercel へのデプロイ
```

---

## 📊 KPI & 成長指標

### 月次で追跡
```
- セッション数 / PV
- 新規ユーザー数
- アクティブユーザー (DAU/MAU)
- 平均セッション時間
- アフィリエイトクリック数
- クリック→購入率 (コンバージョン)
- 売上 (収益)
```

### ツール
```
- Google Analytics 4 (無料)
- Google Search Console (無料)
- Hotjar (ユーザー行動分析)
- Stripe Dashboard (決済解析)
```

---

## 💡 差別化ポイント

1. **UI/UX**
   - 直感的な地図操作
   - ビジュアル重視のデザイン
   - モバイル最適化

2. **アルゴリズム**
   - 高度な味わい診断
   - パーソナライズされたレコメンド
   - 自分の "好みの可視化"

3. **コンテンツ**
   - 蔵元の背景ストーリー
   - 季節・シーンごとの推奨
   - プロのテイスティング情報

4. **コミュニティ**
   - ユーザーレビュー
   - ユーザー生成のペアリング情報
   - オンライン試飲イベント (将来)

---

## 🤝 初期段階での蔵元連携

### アプローチ:
```
1. 地元の小〜中蔵元から開始
   - 連絡しやすい
   - 掲載による恩恵を感じやすい
   
2. 具体的な提案:
   - "あなたの蔵元を全国の日本酒ファンに紹介します"
   - 無料掲載 (初期段階)
   - 対談記事のオファー
   - 購入リンク経由の売上透明性
   
3. 成功事例作成:
   - 5-10蔵元の成功事例を作る
   - データ示す (PV, クリック数, 売上)
   - その後、大蔵元へのアプローチに使用
```

---

## 📝 まとめ

このプロジェクトは:
- **技術的**: Next.js + React + PostgreSQL で実現可能
- **ビジネス的**: 複数のマネタイズパスで継続成長が可能
- **スケーラビリティ**: PV増加に対応可能なアーキテクチャ

**開始のポイント**:
1. まずMVP (上記の React プロトタイプを改良)
2. 基本的なデータ (200-300種) でローンチ
3. アフィリエイトで初期収益確保
4. ユーザーフィードバックで機能拡張
