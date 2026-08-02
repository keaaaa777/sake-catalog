import { ImageResponse } from 'next/og'
import { DIAGNOSIS_TYPE_IDS, getDiagnosisType } from '@/lib/diagnosisTypes'
import { DIAGNOSIS_TYPE_EN } from '@/lib/i18n/diagnosis-en'
import { FLAVOR_TYPES } from '@/lib/flavor'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return DIAGNOSIS_TYPE_IDS.map((typeId) => ({ typeId }))
}

export default function Image({ params }: { params: { typeId: string } }) {
  const type = getDiagnosisType(params.typeId)
  const en = type ? DIAGNOSIS_TYPE_EN[params.typeId] : undefined
  const flavor = type ? FLAVOR_TYPES[type.flavorType] : undefined

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#030914',
          color: '#f7f2e7',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 20, color: '#c8a24a', letterSpacing: 4, marginBottom: 20 }}>
          SHIZUKU SAKE SELECT — SAKE QUIZ
        </div>
        <div
          style={{
            display: 'flex',
            width: 160,
            height: 160,
            borderRadius: 32,
            background: flavor
              ? `linear-gradient(150deg, ${flavor.gradient[0]}, ${flavor.gradient[1]})`
              : '#c8a24a',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
            marginBottom: 28,
          }}
        >
          🍶
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
          {en?.name ?? 'Your Result'}
        </div>
        {en && (
          <div style={{ display: 'flex', fontSize: 26, color: 'rgba(247,242,231,0.75)', marginTop: 20, textAlign: 'center' }}>
            {en.catch}
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
