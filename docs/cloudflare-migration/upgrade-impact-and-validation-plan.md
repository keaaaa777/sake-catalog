# Cloudflare移行: Next.js・Reactアップグレード影響調査と検証計画

- 調査日: 2026-11-17 (JST)
- 対象: keaaaa777/sake-catalog の cloudflare-migration ブランチ
- 状態: 調査・計画のみ。Next.js/React更新、アプリ本体編集、デプロイは未実施。
- 本番: Vercel運用中。変更しない。

## 1. 結論

**推奨する段階移行先は Next.js 15.5.x（OpenNext Cloudflareが許容する最新のセキュリティ修正済みpatch）+ React/React DOM 19 + OpenNext Cloudflare** とする。検証開始時にOpenNextが指定する最低Next.js patchとReactの安全なpatchを確認し、lockfileに固定する。

理由:
1. 既存アプリはNext.js App Routerで、Next.js 15ではReact 19が前提となる。
2. OpenNext Cloudflareの現行サポートはNext.js 15の最新minorと16。Next.js 14はEOLかつ非サポート。
3. OpenNextはNext.jsのbuild成果物をCloudflare Workers向けに変換するため、Next APIを再実装するvinextより既存アプリとの互換性を優先できる。
4. まずNext.js 15で検証すれば、Next.js 16の追加変更を同時に抱えず差分を限定できる。
5. vinextはReact/React DOM/react-server-dom-webpack 19.3.1以上、Vite 8系をpeer dependencyとして要求するbetaの別実装。Next.js 14/React 18との組合せは採用しない。

これは実装承認ではない。メジャー更新は別の隔離ブランチで承認後に行う。

## 2. 現状と問題点

### 依存関係

| 項目 | 現在の宣言・確認値 |
|---|---|
| Next.js | package.json固定 14.2.35 |
| React / React DOM | package.json ^18。直近CIのlock解決は18.3.1 |
| eslint-config-next | 14.2.5。Next.js本体より古いため更新時に揃える |
| @types/react / @types/react-dom | ^18 |
| TypeScript | ^5 |
| Supabase JS | ^2.45.4。現行CIのNode 22でquality/build成功。直近インストール時の最新解決版はNode >=22を要求 |
| @vercel/analytics | ^2.0.1。Cloudflareで計測が継続するか検証し、GA4等との二重計測を避ける |
| lucide-react | ^0.400.0 |
| zustand | ^4.5.4 |
| Tailwind CSS | ^3.4.1 |
| Wrangler / OpenNext | 未導入 |
| vinext | アプリ依存には未導入。CIの互換チェックは成功 |

直近のNext.js 14通常ビルドはNode 22で成功し、静的ページ2,585件を生成。データ/SEO/Lint/TypeScript品質チェックも成功。ただしCloudflare向けbuildは未成功であり、Next.js build成功はWorkers互換性を保証しない。

### アプリ機能への影響

| 機能 | 実装・影響と確認事項 |
|---|---|
| 静的ページ2,585件 | App Router各所にgenerateStaticParams、revalidate=86400等。Next 15で同数生成できるか、OpenNext変換後のroute manifest、Workerサイズを確認。全個別URLのHTTP statusを検査 |
| 日本酒検索 | app/(content)/search/SearchClient.tsx。useSearchParams、URL query同期、クライアント側絞り込み。初回ロード、絞込み、並び替え、30件表示、URL復元を確認 |
| 検索インデックスAPI | app/api/sakes/search-index/route.ts。銘柄データをJSONにして24h再検証。件数・JSON shape・日本語正規化・Cache-Controlを確認 |
| 楽天等転送API | app/api/out/[slug]/[mall]/route.ts。force-dynamic、302、previewでは購入先への実転送を防止。Next 15の非同期params対応、未知slug/mall/offer、Location、no-storeを確認 |
| クリック記録 | lib/affiliateLog.tsがSupabase anon keyでinsert。未設定/失敗でもredirectを壊さない。Workers env/RLS/通信失敗時も302を確認。Service Role keyは使わない |
| Sitemap/robots | app/sitemap.ts、app/robots.ts。NEXT_PUBLIC_SITE_URL、SITEMAP_PHASE、contact emailで出力が変わる。preview URLをcanonicalに誤使用しない |
| Metadata/構造化データ | Metadata、canonical、alternate、Organization/Article/Breadcrumb JSON-LD、next/og。主要routeのhead、hreflang、JSON-LD、OG imageを比較 |
| 動的ルート | 銘柄、蔵、都道府県、guide、pairing、scene、type、classification、diagnosis result等。generateMetadata/paramsを含む各routeでNext 15のPromise params対応を調査。Next 16で同期互換は撤去 |
| 画像 | next.config.mjsに楽天thumbnail remotePatterns。確認済みProductOfferCardのnext/imageはunoptimized、SakeThumbはCSS background。画像最適化サーバーへの依存を全件確認。OG PNGもpreview検査 |
| 環境変数/外部連携 | .env.example: Supabase、楽天、GA4、site URL/contact、SITEMAP_PHASE。NEXT_PUBLIC値はbuild時、private値はWorkers secretsに分離。楽天データ収集API鍵はサイトruntimeに不要 |
| Vercel依存 | @vercel/analyticsとVercel環境名を想定したproduction判定がある。Vercel本番を残してCloudflare previewも安全に判定し、previewではアフィリエイト転送を無効にする |
| データ/asset量 | 2,585ページと銘柄データを生成。build時間、Worker gzipサイズ、assets、Free plan制限を測定 |

### 破壊的変更の要点

**Next.js 14 → 15**
- App RouterはReact/React DOM 19が最低要件。
- params、searchParams、cookies、headers、draftMode等のDynamic APIが非同期化。移行期間の同期互換を前提にせずawaitへ変更。
- fetch、GET Route Handler、Client Router Cacheの既定キャッシュ挙動が変更。revalidateとCache-Controlを回帰確認。
- generateMetadata、route context、OG/icon/apple-iconを含めparams使用箇所を調査。

**Next.js 15 → 16**
- 同期Request API互換が撤去。
- Turbopackがdev/buildで既定化。既存 scripts にwebpack指定はないが、pluginがwebpack設定を注入していないか確認。
- next lint CLI廃止。現在lint scriptの next lint をESLint CLIへ移行。
- middleware規約のproxy移行/非推奨化。対象ファイルを再検索。
- next/imageのlocal query設定、minimumCacheTTL既定変更を確認。
- Node.js最低20.9。CI/Workers buildは22を推奨。

**React 18 → 19**
- 新JSX transformが必要。
- function componentのdefaultProps/propTypes、element.ref、useRef()の初期値などAPI/型の変更を調査。
- @types/reactと@types/react-domも19系へ揃える。
- React internals依存を検索し、codemod後に型/ビルド/browser動作を確認。
- React 18継続はNext 15 Pages Routerのケースがあるが、今回のApp Routerでは回避策にしない。

## 3. Cloudflare方式比較

| 方法 | 現行公式サポート | 互換性/既存機能 | 難易度・保守 | コスト/評価 |
|---|---|---|---|---|
| **Next 15.5.x + React 19 + OpenNext** | Next 15最新minorをサポート | Next build成果物変換。App Router、SSG/SSR、Route Handlers、ISR等を広くサポート。既存Nextに近い | 中。Next APIを維持しadapter差を検証 | Free範囲で開始可。**推奨** |
| Next 15.5.x + React 19.3.1+ + vinext | Next API互換を標榜するがbeta/活発開発 | Next outputを使わずViteでNext APIを再実装。long-tail差あり。React 18不可 | 高。upstream変更追跡負担 | Free範囲可。OpenNext後の比較候補 |
| **Next 16.x + React 19 + OpenNext** | Next 16全minor/patchをサポート。adapterが指定するsecurity floor必須 | 長期候補だが15→16追加変更と既存移行が重なる | 高。supportは良いが追加修正多い | Free範囲可。15安定化後に評価 |
| Next 16.x + React 19.3.1+ + vinext | Workers向け経路だがvinextはbeta | Next 16 API差とvinext差を両方検証 | 非常に高 | Free範囲可。初回移行に不向き |
| OpenNext + Next 14.2.35 | 現行OpenNextではNext 14非サポート/EOL | 旧リリース対応資料は現行supportではない | 高/低保守 | 不採用 |
| Next static export + Cloudflare Pages | 静的export向け公式方法 | 2,585 HTMLは候補だが動的転送API、検索API、クリックログは別Worker等へ移設。画像最適化にも制約 | 中〜高 | 静的配信は低コスト。API分離を望む場合の代替 |
| @cloudflare/next-on-pages | 現行案内はWorkers/OpenNext/vinextが中心。Edge runtime限定 | 現行Node/API機能が合わない可能性 | 高/低保守 | 不採用 |

## 4. 更新するパッケージ

| パッケージ | 必要な対応 |
|---|---|
| next | 14.2.35からOpenNextのpeer範囲内かつセキュリティ修正済みNext 15.5.xへ固定 |
| react / react-dom | 18からNext 15 App Routerと整合するReact 19 patchへ |
| eslint-config-next | 14.2.5からNext本体と同じ15.5.xへ |
| @types/react / @types/react-dom | 18から19へ。型エラー修正 |
| @opennextjs/cloudflare | 新規追加。peer範囲と既知issueを固定versionで確認 |
| wrangler | 新規devDependency。ローカルWorkers preview/型生成/将来deploy用 |
| TypeScript / @types/node | 現状majorを維持可能か検査。Node runtimeを22へ |
| @vercel/analytics | Cloudflareで継続可能か確認し、必要ならCloudflare Web Analytics/GA4へ別途置換 |
| Supabase/Rakuten/GA等 | 一括upgradeしない。peer/engine/Workers互換性が必要なものだけ変更 |

## 5. 検証計画と順序

検証ブランチ案: cloudflare-next15-opennext-validation。親は作業時点のcloudflare-migration。mainおよびVercel本番に接続/変更せず、Cloudflare production branchにも設定しない。cloudflare-migrationは調査記録と現行基準として残す。以下はバージョン変更の承認後に開始する。

### Phase 0: 基準値
1. branch SHA、Node/npm、lockfile、quality/buildを記録。
2. 2,585 route一覧、検索API JSON、sitemap件数、重要ページのmetadata/HTMLを保存。
3. production secretsをlog/artifactへ出さない。

### Phase 1: Next 15更新
1. branch/worktreeに隔離。
2. Next 15.5.x、React/DOM 19、type packages、eslint-config-nextを整合させる。OpenNext peer range/security floorを確認しlock。
3. Next codemod適用後、params/searchParams等の非同期APIを更新。
4. Vercel/Cloudflare preview production判定を分離。previewでは楽天実転送を無効維持。
5. peer dependency無視なしでnpm ci成功を確認。

### Phase 2: build
- npm ci
- npm run quality
- npm run build (preview用NEXT_PUBLIC_SITE_URL、SITEMAP_PHASE=1)
- opennextjs-cloudflare build
- 公開せずローカル wrangler/OpenNext preview
- 2,585 routes、Worker gzip size、assets size、manifest、build時間を記録
- npm audit差分を調査。一括upgradeはしない

### Phase 3: 回帰確認
1. 2,585ページ生成数とroute patternsのstatus/HTML。
2. 検索: index fetch、かな/文字/都道府県/味/価格/温度/料理、sort、30件表示、URL query復元。
3. search-index API: response件数/shape/正規化/headers/error。
4. affiliate route: slug/mall/offer/sourceの正常・異常、302 Location/no-store、preview転送停止。
5. Supabase設定ありのinsert、未設定/失敗時もredirect継続、RLS確認。
6. sitemap/robots/llms.txt host、canonical、production URL漏れ。
7. metadata、hreflang、JSON-LD、OG/Twitter、OG画像。
8. 日本語/英語の動的routes、未知slug/not-found。
9. 楽天画像、unoptimized next/image、CSS画像、OG image。
10. 診断/favorites/localStorage、GA4/Vercel Analytics、スマホ主要画面。

### Phase 4: 非本番Cloudflare確認 (別承認)
1. 無料枠内のnon-production Worker previewを用意。production branch/custom domain/DNSに触らない。
2. SecretはCloudflare側で登録。GitHubへ保存しない。楽天データ取得用API鍵をruntimeへ渡さない。
3. 固有workers.dev preview URLでsmoke testのみ。
4. Free planの最新request/CPU/Worker gzip/assets/build/log limitsを公式表と実使用量で照合。
5. affiliate domain approval、GA4/Search Console、広告表示/法的表示を確認。

### Phase 5: 本番切替 (別承認)
DNS、domain ownership、ASP承認、canonical/robots、Analytics、cache/rollbackを確認してから切替案を作成。今回の範囲外。

## 6. ロールバック

- 更新はCloudflare専用検証branchだけ。失敗時は検証branchを直前成功SHAへ戻す/破棄。cloudflare-migration、main、Vercelは維持。
- Cloudflare preview失敗時はpreview停止のみでVercelへ影響なし。
- 将来の本番切替時も旧Vercel deploymentを残し、DNS/routeを戻せる計画を別途作る。
- DB schema/data変更を伴う場合はbackward-compatible migrationを別に設計。
- credentials、Supabase service role、Cloudflare API tokenをGitHubに置かない。

## 7. 未解決事項

1. @vercel/analyticsの導入箇所とCloudflare送信挙動を全コードで確認し、Vercel専用なら置換案を決める。
2. params/searchParams全利用を更新branchで検索。全App Router page/route/metadata/OG/icon/apple iconが対象。
3. next/image全利用を検索。確認済みProductOfferCardは楽天画像でunoptimized。
4. CI dependency auditにmoderate/high/criticalが出た履歴あり。移行差分と分けて修正判断。
5. Free planの最新上限値はpreview直前に確認。
6. ASPにドメイン追加・再審査の要否を確認。

## 8. 公式根拠

- Next 15 upgrade: https://nextjs.org/docs/app/guides/upgrading/version-15
- Next 16 upgrade: https://nextjs.org/docs/app/guides/upgrading/version-16
- React 19 upgrade: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Next support policy: https://nextjs.org/support-policy
- OpenNext Cloudflare matrix: https://opennext.js.org/cloudflare
- OpenNext Cloudflare adapter: https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- Cloudflare Next.js/vinext guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- vinext repository: https://github.com/cloudflare/vinext
- Pages static Next export: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/

## 9. 作業履歴

| 日付 | 内容 | 結果 |
|---|---|---|
| 2026-11-17 | cloudflare-migrationのpackage.json/lock/env/Next config/主要route・検索・metadataをread-only調査 | Next 14.2.35、React 18系、App Router、2,585ページ基準を確認 |
| 2026-11-17 | Next 15/16、React 19、OpenNext、vinext、Pages static exportの公式情報比較 | Next 15 + React 19 + OpenNextを先行検証候補として推奨 |
| 2026-11-17 | 本文書作成 | docsのみ。依存、アプリ、本番、main、デプロイ変更なし |
