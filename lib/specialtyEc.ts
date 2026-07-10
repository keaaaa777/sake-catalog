// A8.net等のASP経由で提携する日本酒専門EC・サブスクサービス(KURAND・saketakuなど)。
// 実際の提携リンクが確定するまでは空配列にしておき、診断結果ページ等では
// 中身がある場合のみセクションを表示する。
export interface SpecialtyEcLink {
  name: string
  url: string
  description: string
}

export const SPECIALTY_EC_LINKS: SpecialtyEcLink[] = []
