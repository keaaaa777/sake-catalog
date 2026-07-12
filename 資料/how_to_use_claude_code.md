# Claude Code での自動実行ガイド

## 🎯 Claude Code とは？

Claude Code（Claude in Desktop / Terminal）は、Claude がターミナル、ファイル操作、ブラウザを直接操作できるツールです。

複雑な開発作業を「プロンプト1つ」で自動化できます。

---

## 🚀 使い方（3ステップ）

### **Step 1: Claude Code を開く**

#### **Mac / Linux:**
```bash
# ターミナルで
Claude Code
```

または VS Code から：
- コマンドパレット: `Cmd + Shift + P`
- 「Claude Code」を検索
- 起動

#### **Windows:**
```bash
# PowerShell で
Claude Code
```

---

### **Step 2: 大きなプロンプトをコピー・ペースト**

1. **このファイルを開く：**
   `/mnt/user-data/outputs/claude_code_auto_setup_prompt.md`

2. **すべてをコピー** （Cmd/Ctrl + A → Cmd/Ctrl + C）

3. **Claude Code のチャットウィンドウに貼り付け** （Cmd/Ctrl + V）

4. **送信** （Enter キー）

---

### **Step 3: 実行を監視**

Claude Code が自動的に以下を実行します：

```
✅ Step 1: プロジェクトディレクトリ初期化
   └─ sake-catalog フォルダ作成、移動

✅ Step 2: Next.js プロジェクト初期化
   └─ create-next-app で基本構造生成

✅ Step 3: パッケージインストール
   └─ npm install zustand react-query ...

✅ Step 4: フォルダ構造作成
   └─ components/, lib/, public/ など作成

✅ Step 5: lib ファイル作成
   ├─ lib/types.ts （型定義）
   └─ lib/db.ts （データベース関数）

✅ Step 6: app/page.tsx 置き換え
   └─ UIコンポーネント全体

✅ Step 7: app/layout.tsx 更新
   └─ メタデータ設定

✅ Step 8: .env.local 作成
   └─ 環境変数テンプレート

✅ Step 9: .gitignore 確認
   └─ 必要な項目追加

✅ Step 10: ローカルテスト
   └─ npm run dev で http://localhost:3000 起動

✅ Step 11: Git 初期化
   └─ git init, commit

✅ Step 12: GitHub 準備確認
   └─ git remote -v で確認
```

---

## 💡 プロンプト貼り付けのコツ

### ✅ 推奨される方法

**1. テキストエディタを使う**
- VS Code, Sublime Text など開く
- 上記の `claude_code_auto_setup_prompt.md` ファイルをドラッグ&ドロップ
- すべてコピー
- Claude Code チャットに貼り付け

**2. 分割して貼り付け**
- もし「長すぎる」とエラーが出たら：
- 上記ファイルを 2-3 部に分割
- 「まず Step 1-5 を実行してください」と指示
- その後「Step 6-12 を実行」と指示

---

## 🆘 もし失敗したら

### エラー: 「node: コマンドが見つかりません」

```bash
# Node.js をインストール
https://nodejs.org/ からダウンロード

# インストール確認
node --version
npm --version
```

### エラー: 「npx: コマンドが見つかりません」

```bash
# npm を更新
npm install -g npm@latest

# 再度試す
npx create-next-app@latest ...
```

### エラー: ポート 3000 が使用中

```bash
# 別のポートで起動
npm run dev -- -p 3001

# または既存プロセスを終了
# Mac/Linux: lsof -i :3000 | grep node | awk '{print $2}' | xargs kill
# Windows: netstat -ano | findstr :3000
```

---

## ⚡ 実行時間の目安

```
Step 1-2:   2 分  (フォルダ作成、Next.js 初期化)
Step 3:     3 分  (npm install)
Step 4:     1 分  (フォルダ作成)
Step 5:     2 分  (ファイル作成)
Step 6-9:   2 分  (ファイル置き換え、設定)
Step 10:    1 分  (npm run dev)
Step 11-12: 2 分  (Git 初期化)

合計: 約 15-20 分
```

**初回は npm install が時間かかります。** 待機してください。

---

## ✅ 実行完了の確認方法

### 1. ターミナル出力を確認

```
✅ すべてのステップが "✓" または "OK" で終了している
```

### 2. ファイルが正しく配置されているか

ローカルの `sake-catalog/` フォルダを確認：

```
sake-catalog/
├── app/
│   ├── page.tsx ✅ （編集済み）
│   ├── layout.tsx ✅ （確認済み）
│   ├── api/
│   ├── globals.css
│   └── ...
├── lib/
│   ├── types.ts ✅ （作成済み）
│   └── db.ts ✅ （作成済み）
├── components/
├── public/
├── .env.local ✅ （作成済み）
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
└── ...
```

### 3. ブラウザで http://localhost:3000 を開く

- 🍶 日本酒図鑑 のロゴが表示される
- 「地図から探す」ボタンが見える
- 「好みから探す」ボタンが見える
- 「診断で見つける」ボタンが見える

### 4. ボタンをクリックして動作確認

- 🎯 「地図から探す」→ 地方が表示される
- 🎯 「好みから探す」→ 日本酒一覧が表示される
- 🎯 「診断で見つける」→ クイズが表示される
- 🎯 ハートボタンをクリック→ お気に入りが増える

---

## 🔄 完了後の手動ステップ

Claude Code での自動化が終わったら、**以下はユーザーが手動で実行：**

### **GitHub に push**

```bash
cd ~/sake-catalog

# GitHub で新規リポジトリ作成（名前：sake-catalog）
# その後、以下を実行：

git remote add origin https://github.com/YOUR-USERNAME/sake-catalog.git
git branch -M main
git push -u origin main
```

### **Vercel にデプロイ**

1. https://vercel.com/sign-up （GitHub でログイン）
2. 「Add New」→「Project」
3. GitHub から `sake-catalog` を選択
4. 「Deploy」をクリック
5. URL を確認 (例: `https://sake-catalog-abc.vercel.app`)

---

## 📊 実行後のフォルダ構造

```
~/sake-catalog/
├── app/
│   ├── page.tsx (🍶 ホーム画面)
│   ├── api/ (API エンドポイント用)
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── types.ts (型定義)
│   └── db.ts (サンプルデータ)
├── components/ (将来のコンポーネント)
├── public/
│   └── images/ (将来の画像)
├── node_modules/ (依存パッケージ)
├── .next/ (ビルド出力)
├── .env.local (環境変数)
├── .gitignore (Git 無視設定)
├── package.json
├── tsconfig.json
├── next.config.js
├── README.md
└── .git/ (Git リポジトリ)
```

---

## 🎯 このプロジェクトでできること

実行完了後、ローカルで以下が可能：

```typescript
// 1. 地方から都道府県を選んで日本酒を検索
// 2. 辛口・甘口などで絞り込み
// 3. お気に入り機能
// 4. クイズで自分の好みを診断
// 5. （後で）Supabase と連携してリアルなDB化
// 6. （後で）アフィリエイトリンク追加
// 7. （後で）Vercel で公開
```

---

## 📞 問題が発生した場合

### ⚠️ よくある問題

**問題 1: npm install でハング**
```bash
# キャッシュクリア
npm cache clean --force

# 再度実行
npm install
```

**問題 2: create-next-app で選択肢が表示される**
```
Claude Code が自動で "No" / "Yes" を選択するはずですが、
手動で選択する場合：
✔ ESLint? › Yes
✔ TypeScript? › Yes
✔ Tailwind? › Yes
✔ App Router? › Yes
✔ Create example? › No
```

**問題 3: npm run dev で失敗**
```bash
# .next フォルダを削除してリトライ
rm -rf .next
npm run dev
```

---

## ✨ 実行のコツ

1. **インターネット接続が安定している環境で実行**
   - npm install が長時間かかる場合がある

2. **ターミナルをずっと開いたままにする**
   - ブラウザテストも同じターミナルで実行

3. **エラーが出てもあきらめない**
   - ほとんどのエラーは再実行で解決

4. **Ctrl + C でサーバーを停止**
   - npm run dev を停止するときは Ctrl + C

---

## 🚀 最後に

このプロンプトで以下が自動化されます：

```
❌ 手動での入力: 0個
✅ 自動実行: すべてのセットアップ
⏱️ 実行時間: 15-20分

結果: 完全に動作する Next.js アプリが完成！
```

**貼り付けて実行するだけで完了です！** 🎉

---

わかりましたか？以下のコマンドで Claude Code を開いて、
`claude_code_auto_setup_prompt.md` の内容をすべて貼り付けてください：

```bash
Claude Code
```

質問があれば、実行前に聞いてください！
