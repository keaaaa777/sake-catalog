// 診断結果をブラウザのlocalStorageに保存し、再訪時に「前回の結果」を案内するための小さなヘルパー。
// サーバーには送信されず、個人を特定する情報も持たない。
const STORAGE_KEY = 'shizuku:lastDiagnosisResult'

export interface SavedDiagnosisResult {
  typeId: string
  savedAt: string
}

export function saveDiagnosisResult(typeId: string): void {
  try {
    const value: SavedDiagnosisResult = { typeId, savedAt: new Date().toISOString() }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // localStorageが使えない環境(プライベートモード等)では何もしない
  }
}

export function loadDiagnosisResult(): SavedDiagnosisResult | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.typeId === 'string') return parsed as SavedDiagnosisResult
    return null
  } catch {
    return null
  }
}
