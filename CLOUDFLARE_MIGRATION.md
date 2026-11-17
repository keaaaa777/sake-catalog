Cloudflare Workers migration preparation for sake-catalog

## 方針

- 作業対象は `cloudflare-migration` ブランチのみ。`main`、Vercel、本番ドメインの設定は変更しない。
- 公開前にWorkersのプレビューで検証する。現時点ではWorkerの作成・デプロイをしない。
- 対象はNext.js 14.2.35 / React 18 / App Router。Cloudflareの現行Next.js移行ガイドはWorkers上の実行基盤に `vinext` を推奨している。Next.js 14も対象だが、互換性チェックが必要。
- 静的データ主体のサイトだが、App RouterページとAPI Route Handlerがあるため、静的ファイルだけを配信する構成ではなくWorkers上でアプリを実行する。

## 次の実装手順

1. `cloudflare-migration` をチェックアウトし、`npm ci` を実行する。
2. `npx vinext check` を実行し、重大な非互換がないか確認する。重大な問題があれば移行を止めて個別対応する。
3. `vinext init` の前に、`revalidate` / `revalidatePath` / `revalidateTag` / `use cache`、Next Imageの利用箇所、Vercel固有機能をコード全体で確認する。キャッシュと画像最適化の選択はこの確認結果に合わせる。
4. 互換性が確認できた後、Cloudflare公式ガイドに従って `vinext init --platform=cloudflare --name=sake-catalog-preview ...` を実行する。CLIが `package.json` と `package-lock.json` を同期するため、依存関係を手で追記しない。
5. 生成された `cloudflare.config.ts`、`vite.config.ts`、`package.json`、`package-lock.json`、`tsconfig.json`、`.gitignore` の差分を確認する。
6. ビルドと主要ルートをローカルで検証する。問題があればCloudflareへ接続・デプロイする前に修正する。
7. Cloudflare Workers Buildsでは本番ブランチを `cloudflare-migration` に限定する。プレビュー環境のURLと本番URLを分ける。秘密値はCloudflareのSecretに登録し、GitHubには置かない。

## 環境変数の整理

| 変数 | 用途・扱い |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL。クライアント公開値。ビルド環境変数。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key。ブラウザーに出る公開キー。DBの安全性はRLSで担保する。ビルド環境変数。 |
| `SUPABASE_SERVICE_ROLE_KEY` | 高権限の秘密値。現在確認したアフィリエイトクリック記録コードはanon keyを使う。全コードで利用箇所を確認するまでCloudflareにも設定しない。 |
| `RAKUTEN_APP_ID` / `RAKUTEN_ACCESS_KEY` | `.env.example`上、楽天APIから候補データを取得するローカルスクリプト用。通常のWorker実行には不要。スクリプトをCIで動かす場合のみCIのSecretに設定する。 |
| `RAKUTEN_AFFILIATE_ID` | 楽天アフィリエイトリンク生成に使う値。利用するビルド/スクリプトを確認後、必要な実行環境に設定する。 |
| `NEXT_PUBLIC_GA_ID` | GA4測定ID。公開値。ビルド環境変数。 |
| `NEXT_PUBLIC_SITE_URL` | sitemap/robots/OGP用の絶対URL。プレビュー検証時はCloudflareのプレビューURL、本番移行時は別途本番URLにする。現在のVercel URLを流用しない。 |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 訂正依頼ページ等の表示用。任意の公開値。 |
| `SITEMAP_PHASE` | sitemapの掲載範囲。現在の既定値は `1`。 |

`NEXT_PUBLIC_*` はクライアント側へ埋め込まれるため、APIキー等の秘密情報を設定しない。

## 無料枠・運用上の注意

2026-11-17時点のCloudflare公式Workers資料では、Workers Freeは動的Workerリクエストが1日100,000件、1呼び出しあたりCPU 10msまで。静的アセット配信は無料・無制限。枠超過時は動的リクエストが制限され、サイトの一部または全部が応答できなくなる可能性がある。SSRが10msを超えるルートがないか、プレビューで計測してから判断する。

有料のWorkers Paid、従量課金サービス、Workers AI等はこの準備では有効化しない。CloudflareのFreeサービスは通常のWebサイト向けで、動画配信などの禁止用途には使わない。商用運用前にCloudflare Terms of Useおよび利用する個別サービスの条件を再確認する。

## 現在の状態

- Cloudflareアカウントにログイン済み。
- CloudflareのGitHub連携で `keaaaa777/sake-catalog` を確認済み。
- `cloudflare-migration` ブランチの存在を確認済み。
- Cloudflareの作成画面ではリポジトリ選択まで進んだが、Deployは実行していない。したがってWorkerは作成・公開されていない。
- このメモ追加以外のコード移行、ビルド検証、環境変数登録は未実施。
