// 特定名称(精米歩合・原料による分類)ごとにブラウズページを作るためのマッピング。
// data/sakes.json の classification は表記ゆれ(「純米酒」「純米」等)があるため、
// 同じ特定名称は同じslugにまとめる。
export const CLASSIFICATION_SLUGS: Record<string, string> = {
  '純米大吟醸': 'junmai-daiginjo',
  '大吟醸': 'daiginjo',
  '純米吟醸': 'junmai-ginjo',
  '吟醸': 'ginjo',
  '特別純米': 'tokubetsu-junmai',
  '特別純米酒': 'tokubetsu-junmai',
  '純米': 'junmai',
  '純米酒': 'junmai',
  '山廃純米': 'junmai',
  '生酛純米': 'junmai',
  '生もと純米': 'junmai',
  '純米古酒': 'junmai',
  '特別本醸造': 'tokubetsu-honjozo',
  '本醸造': 'honjozo',
  '普通酒': 'futsushu',
}

export interface ClassificationInfo {
  label: string
  eng: string
  desc: string
}

export const CLASSIFICATIONS: Record<string, ClassificationInfo> = {
  'junmai-daiginjo': {
    label: '純米大吟醸',
    eng: 'Junmai Daiginjo',
    desc: '米・米麹・水のみで造られ、精米歩合50%以下まで磨いた酒。香り高く雑味の少ない、特定名称の中で最も贅沢な区分です。',
  },
  daiginjo: {
    label: '大吟醸',
    eng: 'Daiginjo',
    desc: '精米歩合50%以下まで磨き、少量の醸造アルコールを加えた酒。華やかな吟醸香と軽やかな飲み口が特徴です。',
  },
  'junmai-ginjo': {
    label: '純米吟醸',
    eng: 'Junmai Ginjo',
    desc: '米・米麹・水のみで、精米歩合60%以下まで磨いた酒。米の旨みと吟醸香のバランスが取れたタイプです。',
  },
  ginjo: {
    label: '吟醸',
    eng: 'Ginjo',
    desc: '精米歩合60%以下まで磨き、醸造アルコールを加えた酒。すっきりとした香りと軽快な後味が楽しめます。',
  },
  'tokubetsu-junmai': {
    label: '特別純米',
    eng: 'Tokubetsu Junmai',
    desc: '純米酒のうち、精米歩合60%以下または特別な製法で造られた酒。米の旨みをしっかり感じられます。',
  },
  junmai: {
    label: '純米',
    eng: 'Junmai',
    desc: '米・米麹・水のみで造られる、精米歩合の規定がない酒。米本来のコクと旨みを楽しめるタイプです。',
  },
  'tokubetsu-honjozo': {
    label: '特別本醸造',
    eng: 'Tokubetsu Honjozo',
    desc: '本醸造酒のうち、精米歩合60%以下または特別な製法で造られた酒。すっきりとした中にも深みがあります。',
  },
  honjozo: {
    label: '本醸造',
    eng: 'Honjozo',
    desc: '精米歩合70%以下の米に、少量の醸造アルコールを加えた酒。軽快ですっきりとした飲み口が特徴です。',
  },
  futsushu: {
    label: '普通酒',
    eng: 'Futsushu',
    desc: '特定名称の規定にとらわれない、日常的に楽しまれている酒。手頃な価格帯のものが多いのが特徴です。',
  },
}

export const CLASSIFICATION_SLUG_IDS = Object.keys(CLASSIFICATIONS)

export function getClassificationSlug(classification: string): string | undefined {
  return CLASSIFICATION_SLUGS[classification]
}
