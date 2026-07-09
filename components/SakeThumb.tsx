import { Sake } from '@/lib/types'
import { FLAVOR_TYPES } from '@/lib/flavor'

export default function SakeThumb({ sake, size = 40 }: { sake: Sake; size?: number }) {
  const flavor = FLAVOR_TYPES[sake.flavorType]

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(150deg, ${flavor.gradient[0]}, ${flavor.gradient[1]})`,
        fontSize: size * 0.52,
        border: '1px solid var(--line-gold)',
        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
      }}
      role="img"
      aria-label={sake.classification}
    >
      {sake.imageUrl || '🍶'}
    </span>
  )
}
