import { ImageResponse } from 'next/og'
import { getAllSakes, getSakeBySlug } from '@/lib/data'
import { FLAVOR_TYPES } from '@/lib/flavor'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return getAllSakes().map((sake) => ({ slug: sake.slug }))
}

export default function Image({ params }: { params: { slug: string } }) {
  const sake = getSakeBySlug(params.slug)
  const flavor = sake ? FLAVOR_TYPES[sake.flavorType] : undefined

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
          fontSize: 32,
          padding: 80,
        }}
      >
        <div style={{ fontSize: 20, color: '#c8a24a', letterSpacing: 4, marginBottom: 24 }}>
          雫 SAKE SELECT
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
          {sake?.name ?? '日本酒'}
        </div>
        {sake && (
          <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
            <div
              style={{
                border: '2px solid #c8a24a',
                borderRadius: 999,
                padding: '8px 24px',
                color: '#c8a24a',
                fontSize: 24,
              }}
            >
              {sake.classification}
            </div>
            {flavor && (
              <div
                style={{
                  border: '2px solid rgba(247,242,231,0.3)',
                  borderRadius: 999,
                  padding: '8px 24px',
                  fontSize: 24,
                }}
              >
                {flavor.label}
              </div>
            )}
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
