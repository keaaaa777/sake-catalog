// 楽天アフィリエイトは申請時に登録した本番ドメイン(sake-catalog.vercel.app、
// または将来のカスタムドメイン)でのみ実リンクを掲載できる。Vercelの
// preview環境(*-git-branch....vercel.app 等の一時URL)で誤って実リンクを
// 出さないよう、アフィリエイトリンク表示コンポーネント全般でこの判定を使う。
export function isProductionDomain(): boolean {
  return process.env.VERCEL_ENV === 'production'
}
