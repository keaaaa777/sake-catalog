// 甘辛・淡麗濃醇のスコア(-3〜3)を、人が読みやすいラベルに変換する。
// 銘柄詳細ページと比較ページの両方で使う共通ロジック。
export const SWEET_DRY_LABELS = ['大甘', '甘口', 'やや甘口', '中間', 'やや辛口', '辛口', '大辛口']
export const LIGHT_RICH_LABELS = ['淡麗', 'やや淡麗', '中間', 'やや濃醇', '濃醇']

export function scaleLabel(labels: string[], value: number, min: number, max: number): string {
  const idx = Math.round(((value - min) / (max - min)) * (labels.length - 1))
  return labels[Math.max(0, Math.min(labels.length - 1, idx))]
}
