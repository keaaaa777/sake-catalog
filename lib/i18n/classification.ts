// data/sakes.json の classification(特定名称、日本語)は固定的な語彙のため、
// 銘柄ごとの翻訳(Codex担当)とは別に、ここで一括の英語ラベルを持つ。
const CLASSIFICATION_EN: Record<string, string> = {
  '純米大吟醸': 'Junmai Daiginjo',
  '大吟醸': 'Daiginjo',
  '純米吟醸': 'Junmai Ginjo',
  '吟醸': 'Ginjo',
  '純米': 'Junmai',
  '純米酒': 'Junmai',
  '特別純米': 'Tokubetsu Junmai',
  '特別純米酒': 'Tokubetsu Junmai',
  '本醸造': 'Honjozo',
  '特別本醸造': 'Tokubetsu Honjozo',
  '普通酒': 'Futsushu (Table Sake)',
  '純米古酒': 'Aged Junmai (Koshu)',
  '山廃純米': 'Yamahai Junmai',
  '生酛純米': 'Kimoto Junmai',
  '生もと純米': 'Kimoto Junmai',
}

export function classificationEn(classification: string): string {
  return CLASSIFICATION_EN[classification] || classification
}
