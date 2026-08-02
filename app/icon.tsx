import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030914',
          border: '2px solid #c8a24a',
          borderRadius: 6,
          color: '#c8a24a',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        雫
      </div>
    ),
    { ...size }
  )
}
