# Cloudflare移行: Next.js・Reactアップグレード影響調査と検証計画

- 調査日: 2026-11-17 (JST)
- 検証更新日: 2026-11-19 (JST)
- 対象調査ブランチ: `cloudflare-migration`
- 実装・検証ブランチ: `cloudflare-next15-opennext-validation`（隔離）
- 状態: Next.js 15 + React 19 + OpenNextの隔離検証はCIビルドまで成功。アプリ機能全体の受入確認とCloudflareホスト上のpreview、本番移行は未実施。
- 本番: Vercel運用中。変更しない。

## 1. 結論

**安全な次段階の候補は Next.js 15.5.29 + React/React DOM 19.3.1 + OpenNext Cloudflare 1.20.17** とする。検証用ブランチで依存更新、Next.js非同期API変換、通常build、OpenNext build、ローカルWorker smoke testまで通過した。

これは `cloudflare-migration` や `main` への統合、Cloudflareへの公開、本番切替の承認を意味しない。検証ブランチの変更をレビューし、残っている機能確認を終えた後に次段階を判断する。

理由:
1. 既存アプリはNext.js App Routerで、Next.js 15ではReact 19が前提となる。
2. OpenNext Cloudflareを使うと既存Nextアプリ構造を保ってWorkers向けbuildへ変換できる。今回、実際にOpenNext buildとローカルWorker起動を確認できた。
3. Next.js 15を先に安定させることで、16の追加変更を同時に抱えず移行差分を限定できる。
4. vinextはbetaの別実装であり、初回移行ではadapter差とNext互換差を重ねない。

## 2. 現状と問題点

### 依存関係

| 項目 | `cloudflare-migration` 基準 | 検証ブランチ |
|---|---|---|
| Next.js | 14.2.35 | 15.5.29 |
| React / React DOM | 18系（lock上18.3.1） | 19.3.1 |
| eslint-config-next | 14.2.5 | 15.5.29 |
| @types/react / @types/react-dom | 18系 | 19.3.0 |
| @opennextjs/cloudflare | 未導入 | 1.20.17 |
| Wrangler | 未導入 | 4.165.0 |
| Supabase JS | 2.x | 既存rangeを維持 |
| Node.js | CI基準22 | CI 22 |

検証ブランチでは通常のpeer dependency解決を使い、`--force`や`--legacy-peer-deps`は使っていない。Vercel本番と元の`cloudflare-migration`ブランチは変更していない。

### 検証結果

CI run [44510052275](https://github.com/keaaaa777/sake-catalog/actions/runs/44510052275) は成功。

- `npm ci`、データ/SEO検証、Lint、TypeScript: 成功
- Next.js build: 成功。静的ページ **2,585件** を生成
- OpenNext Cloudflare build: 成功
- ローカルWrangler Worker smoke test: トップページHTTP 200、検索インデックスAPIがJSON配列 **997件**
- 検証済みコード: `cloudflare-next15-opennext-validation` ブランチ、commit `36d966bb346cc187d63a4c92688f5949700d4f94`

これらはframework/buildと2つのrouteの最小動作確認であり、機能全体の受入試験ではない。

### アプリ機能への影響・残りの確認

| 機能 | 実装・影響と次の確認 |
|---|---|
| 静的ページ2,585件 | Next buildで件数を再確認済み。全URLのHTTP status/HTMLとOpenNextのroute mappingは未確認 |
| 日本酒検索 | `app/(content)/search/SearchClient.tsx`。検索APIは997件を返した。実ブラウザで絞込み、並替、30件表示、URL query復元を確認 |
| 検索インデックスAPI | ローカルWorkerからJSON arrayを確認。Cache-Control、shape、文字種/正規化、失敗応答は未確認 |
| 楽天等転送API | `app/api/out/[slug]/[mall]/route.ts`。非同期params変換を含む。previewで外部購入先へ転送しないこと、302/Location/no-store、未知値を確認 |
| クリック記録 | `lib/affiliateLog.ts`。Supabase未設定/成功/失敗でも転送応答を壊さないこと、RLSを確認 |
| Sitemap/robots | `app/sitemap.ts`、`app/robots.ts`。preview hostやproduction canonical漏れがないか確認 |
| Metadata/構造化データ | 代表ページのcanonical、alternate、JSON-LD、OG/Twitterを比較 |
| 動的ルート | 主要routeのparamsはcodemod済み。未知slug、not-found、metadata/OG画像を確認 |
| 画像 | ローカルWorkerで代表的な楽天画像、CSS背景、OG imageを確認。Next image optimizer有無も評価 |
| 環境変数/外部連携 | buildではpreview URLを使った。Cloudflare binding/secretは未登録。Supabase、楽天、GA4をpreview用に分離する |
| Vercel依存 | Vercel Analytics/production判定を確認し、previewでも本番動作にならないことを確認 |

## 3. Cloudflare方式比較

| 方法 | サポート・互換性 | 難易度・保守性 | 既存機能への影響 |
|---|---|---|---|
| **Next 15.5 + React 19 + OpenNext** | OpenNext adapter経路。今回buildとローカルWorker起動成功 | 中。Next APIを保ち、Workers固有差を検証 | 2,585件SSGと検索index routeはbuild/smoke確認。全route/API受入は残る |
| Next 15 + React 19 + vinext | ViteでNext API互換を実装するbeta | 高。OpenNextとは異なる実行/互換性を追う | 長いtailの挙動を別途比較する必要 |
| Next 16 + React 19 + OpenNext | 将来候補。16固有の変更も加わる | 15安定後に評価するのが保守的 | 追加のlint、routing、cache等の回帰範囲が増える |
| Next 16 + React 19 + vinext | beta adapterと新しいNext APIの両方を検証 | 非常に高 | 初回移行の切り分けが難しい |
| Static export + Cloudflare Pages + 別Worker API | 静的配信の公式経路 | 中〜高。API分離が必要 | 転送、検索API、クリック記録を別実装にする |
| Next 14をOpenNextで維持 | 現行公式support対象外/EOLのため不採用 | 高・保守困難 | 互換を強制する方法は採用しない |

## 4. 更新対象・変更内容

検証branchで実施した変更:

- `next` 14.2.35 → 15.5.29
- `react` / `react-dom` 18系 → 19.3.1
- `eslint-config-next` → 15.5.29
- `@types/react` / `@types/react-dom` → 19.3.0
- `@opennextjs/cloudflare` 1.20.17、Wrangler 4.165.0を追加
- Next.js async request API codemodを適用し、関連するparams利用を非同期化
- OpenNext設定、Wrangler設定、local preview/typegen scriptsを追加
- Next.js 14専用patch `patches/next+14.2.35.patch`を削除。Next 15のclean installと競合するため
- Supabase、楽天、GA等のアプリ依存rangeは今回一括更新していない

主なレビュー対象: `package.json`、`package-lock.json`、`next.config.mjs`、`tsconfig.json`、`open-next.config.ts`、`wrangler.jsonc`、各App Router page/route内の`params`利用、`patches/`。

## 5. 推奨する検証・移行手順

### Phase 1: branch reviewと機能回帰

1. 検証branchの差分を`cloudflare-migration`と比較してレビュー。
2. 日本酒検索を実ブラウザで確認（検索語、かな、都道府県、味、価格、温度、料理、sort、ページング、URL復元）。
3. 検索APIの件数、schema、cache header、エラー時挙動を確認。
4. affiliate preview保護を先に確認し、Rakuten実転送が起きないことを確かめる。
5. 転送APIの302/Location/no-store、未知slug/mall/offerを検査。
6. Supabase設定なし/テスト設定あり/接続失敗それぞれでクリック記録とredirectを確認。production keyを使わない。
7. sitemap/robots/canonical/metadata/JSON-LD/OG、代表的な動的routeと全2,585 URLを確認。
8. 画像、スマホ主要画面、GA4/Vercel Analytics挙動を確認。
9. Clean CIを再実行し、依存auditの差分を移行と分けて判断。

### Phase 2: 非本番Cloudflare preview（別判断）

1. preview用のCloudflare Workerを作る。production branch、DNS、custom domainは指定しない。
2. Cloudflare側に必要なpreview secrets/bindingsだけを登録し、GitHubには保存しない。
3. 固有`workers.dev` URL上でsmoke/regression test。
4. Free plan上限とWorker/assetサイズ、実際のrequest/CPUを照合。
5. 問題時はpreview Workerだけ削除/停止。Vercelを維持。

### Phase 3: 本番切替（別途計画・別承認）

ドメイン、ASP審査、広告、canonical/Search Console、Analytics、cache、rollbackを整理してから実施。本番公開、DNS切替、Vercel変更は今回含めない。

## 6. ビルド・確認方法

検証branchのCIは以下を実行済み:

```sh
npm ci
npm run quality
npm run build
npx opennextjs-cloudflare build
npx wrangler dev --local --ip 127.0.0.1 --port 8787
```

静的件数をログの`Generating static pages (2585/2585)`で検査。ローカルWorkerはトップページと検索index APIでsmoke test。ユーザーシークレットはCIへ渡していない。

## 7. ロールバック

- 現状、変更は専用の検証branchに隔離。失敗時はbranchを直前成功SHAに戻すか、検証branchを破棄する。
- `cloudflare-migration`、`main`、Vercel本番はそのまま維持。
- 将来previewで問題が出たらpreview Workerだけ停止。
- 将来の本番移行では旧Vercel deploymentを残し、DNS/routeの戻し方を別計画にする。
- DB schema/data変更を含めず、Cloudflare secretsやSupabase service-role keyをGitHubに置かない。

## 8. 未解決事項

1. Affiliate redirect/analytics loggingの成功・失敗・未設定を確認する。
2. 全検索操作を実ブラウザで確認する。
3. 全2,585 URL、sitemap、metadata/JSON-LD、OG/画像を回帰確認する。
4. Cloudflare preview用secrets/bindingsを決め、Freeプラン上限を実構成と照合する。
5. ASPのドメイン追加/再審査条件、広告表示と法的表示を確認する。
6. `@vercel/analytics`とproduction判定のCloudflare preview上の挙動を確定する。

## 9. 公式根拠

- Next 15 upgrade: https://nextjs.org/docs/app/guides/upgrading/version-15
- Next 16 upgrade: https://nextjs.org/docs/app/guides/upgrading/version-16
- React 19 upgrade: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Next support policy: https://nextjs.org/support-policy
- OpenNext Cloudflare matrix: https://opennext.js.org/cloudflare
- OpenNext Cloudflare adapter: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- Cloudflare Next.js/vinext guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- vinext repository: https://github.com/cloudflare/vinext
- Pages static Next export: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/

## 10. 作業履歴

| 日付 | 内容 | 結果 |
|---|---|---|
| 2026-11-17 | `cloudflare-migration`の依存、環境変数、主要route/検索/metadataをread-only調査 | Next 14.2.35、React 18系、2,585ページ基準を確認 |
| 2026-11-17 | Next 15/16、React 19、OpenNext、vinext、Pages static exportを比較 | Next 15 + React 19 + OpenNextを先行検証案として推奨 |
| 2026-11-17 | 調査計画を作成 | docsのみ。実装は未実施 |
| 2026-11-19 | `cloudflare-next15-opennext-validation`を作成し候補更新を実施 | 調査ブランチとmain/Vercelは変更なし |
| 2026-11-19 | quality、2,585ページNext build、OpenNext build、Wrangler local smoke testを実行 | CI成功。home 200、search index 997件 |
| 2026-11-19 | 検証済み差分を隔離branchにcommit | `36d966bb346cc187d63a4c92688f5949700d4f94`。Cloudflareへのdeployなし |
