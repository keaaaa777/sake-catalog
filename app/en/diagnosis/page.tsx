import type { Metadata } from 'next'
import EnDiagnosisClient from './EnDiagnosisClient'

export const metadata: Metadata = {
  title: 'One-Minute Sake Quiz | Shizuku Sake Select',
  description: 'Answer five quick questions to find the Japanese sake flavor type that suits you, with recommended bottles and purchase links.',
  alternates: { canonical: '/en/diagnosis', languages: { 'ja-JP': '/diagnosis', 'en-US': '/en/diagnosis' } },
}

export default function EnDiagnosisPage() {
  return <EnDiagnosisClient />
}
