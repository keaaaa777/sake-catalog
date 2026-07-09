export const PAIRING_CATEGORIES: Record<string, { label: string }> = {
  sashimi: { label: '刺身・寿司' },
  yakitori: { label: '焼き鳥・肉料理' },
  fried: { label: '揚げ物' },
  cheese: { label: 'チーズ・おつまみ' },
  other: { label: 'その他の料理' },
}

export const PAIRING_CATEGORY_IDS = Object.keys(PAIRING_CATEGORIES)
