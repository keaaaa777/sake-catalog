// lib/diagnosisTypes.ts の日本語コンテンツを英語UI用に対訳したもの。
// 事実生成を伴わない固定UI文言のため、翻訳データ生成パイプライン(Codex)とは
// 別にここで直接管理する。IDはlib/diagnosisTypes.tsと1:1で対応させること。
export const DIAGNOSIS_TYPE_EN: Record<string, { name: string; catch: string; description: string }> = {
  'kaori-social': {
    name: 'The Floral Toaster',
    catch: 'You light up any gathering with fragrant, showy sake.',
    description:
      'You suit fruity, aromatic "kaori" style sake. At parties and special occasions, you pick a glass that keeps the conversation flowing.',
  },
  'kaori-solo': {
    name: 'The Quiet Bloom',
    catch: 'A fragrant glass that keeps you gentle company on a quiet night.',
    description:
      'You enjoy light, aromatic "kaori" style sake slowly, on your own. A perfect companion for reading or music.',
  },
  'sou-social': {
    name: 'The Crystal Toaster',
    catch: 'Crisp and clean — a cool glass built for a toast.',
    description:
      'You suit clean, crisp "sou" style sake. At lively dinners and toasts, it never competes with the food.',
  },
  'sou-solo': {
    name: 'The Quiet Refresh',
    catch: 'A clear-headed treat for your own quiet time.',
    description:
      'You like light, refreshing "sou" style sake to reset your mind. Well chilled, sipped slowly, on your own.',
  },
  'jun-social': {
    name: 'The Umami Host',
    catch: 'Rich and savoury — the reliable one who keeps the party going.',
    description:
      'You suit rice-forward, umami-rich "jun" style sake. At a lively table, the glasses keep pace with the food.',
  },
  'jun-solo': {
    name: 'The Cozy Nightcap',
    catch: 'A savoury glass that settles in with you at the end of the day.',
    description:
      'You enjoy rich "jun" style sake slowly at home. Warmed gently, it fills a quiet evening.',
  },
  'juku-social': {
    name: 'The Aged Nightfall',
    catch: 'A deep, concentrated aroma for a grown-up, special evening.',
    description:
      'You suit complex, concentrated "juku" style sake. A long, lingering glass to close out an anniversary or special gathering.',
  },
  'juku-solo': {
    name: 'The Solo Romantic',
    catch: 'A deep, lingering finish, savoured quietly on your own.',
    description:
      'You like to take your time with concentrated, aged-style "juku" sake aromas. Good company for a night of reading or reflection.',
  },
}

export interface EnQuizQuestion {
  label: string
  options: { label: string; vote: { flavor: 'kaori' | 'sou' | 'jun' | 'juku' } | { occasion: 'social' | 'solo' } }[]
}

export const EN_QUESTIONS: EnQuizQuestion[] = [
  {
    label: 'What kind of aroma do you prefer?',
    options: [
      { label: 'Fruity and floral, light on the palate', vote: { flavor: 'kaori' } },
      { label: 'Clean and crisp, with a sharp finish', vote: { flavor: 'sou' } },
      { label: 'Rich rice flavor and body', vote: { flavor: 'jun' } },
      { label: 'Complex, concentrated, aged aromas', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: 'What temperature do you like to drink at?',
    options: [
      { label: 'Well chilled', vote: { flavor: 'kaori' } },
      { label: 'Chilled or room temperature', vote: { flavor: 'sou' } },
      { label: 'Room temperature or gently warmed', vote: { flavor: 'jun' } },
      { label: 'Warmed, slowly savoured', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: 'What would you like to eat alongside it?',
    options: [
      { label: 'Delicate dishes like sashimi or carpaccio', vote: { flavor: 'kaori' } },
      { label: 'Light dishes like yakitori or fried food', vote: { flavor: 'sou' } },
      { label: 'Heartier dishes like meat or simmered food', vote: { flavor: 'jun' } },
      { label: 'Rich snacks like cheese or dried fruit', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: 'Sweet or dry — which do you prefer?',
    options: [
      { label: 'Gently sweet', vote: { flavor: 'jun' } },
      { label: 'Slightly sweet, well balanced', vote: { flavor: 'kaori' } },
      { label: 'Slightly dry and clean', vote: { flavor: 'sou' } },
      { label: 'Sharp and distinctly dry', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: "What's the mood tonight?",
    options: [
      { label: 'Toasting with someone, party mood', vote: { occasion: 'social' } },
      { label: 'A conversation with someone close', vote: { occasion: 'social' } },
      { label: 'Quiet time, just for me', vote: { occasion: 'solo' } },
      { label: 'Winding down at the end of the day', vote: { occasion: 'solo' } },
    ],
  },
]
