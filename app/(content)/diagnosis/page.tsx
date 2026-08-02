import type { Metadata } from 'next'
import DiagnosisClient from './DiagnosisClient'

export const metadata: Metadata = {
  title: '1分診断|あなたに合う日本酒タイプが見つかる|雫 SAKE SELECT',
  description: '香り・温度帯・料理・甘辛の好みなど5つの質問に答えるだけで、あなたにぴったりの日本酒タイプと購入先が分かる無料診断です。',
  alternates: { canonical: '/diagnosis' },
}

export default function DiagnosisPage() {
  return <DiagnosisClient />
}
