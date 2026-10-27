# 新ホストのサイトマップ公開手順

公開先: `https://sake-catalog-japan.vercel.app`

## 初期公開

`SITEMAP_PHASE=1` を使い、厳格な基準で選ばれる銘柄・酒蔵の詳細ページは保留しつつ、ホーム、診断、ランキング、ガイド、条件に合うカテゴリーページなど、Phase 1 の対象URLをサイトマップに掲載します。以前のサイトマップ実績は153件で、この規模はGoogleの上限（1ファイル50,000 URL）を大きく下回るため、10件に切り詰める必要はありません。

Search Consoleの「URL検査」で多数のURLを個別に登録せず、`/sitemap.xml` を送信します。個別のインデックス登録リクエストは、修正・公開した重要ページの確認に限ります。

## 公開後の確認

- `https://sake-catalog-japan.vercel.app/robots.txt` が `/sitemap.xml` を案内し、サイト全体を誤ってブロックしていないことを確認します。
- `https://sake-catalog-japan.vercel.app/sitemap.xml` を開き、全URLが新ホストで、404・noindex・別URLをcanonicalに指定したページが含まれていないことを確認します。
- サイトマップ送信後、Search Console のページ登録レポートとクロール状況を見ます。サイトマップは発見の手がかりであり、クロールや登録を保証するものではありません。
- 詳細ページのソース・内容・重複性・内部リンクを確認した後、必要であれば `SITEMAP_PHASE=2` に進めます。URL数を10、20、30と機械的に増やす必要はありません。

## Vercel Production 環境変数

- `NEXT_PUBLIC_SITE_URL=https://sake-catalog-japan.vercel.app`
- `SITEMAP_PHASE=1`

`NEXT_PUBLIC_SITE_URL` は canonical、構造化データ、サイトマップ、robots.txt のURL生成に使います。Vercelで値を変更した場合はProductionへ反映して再デプロイします。