import { Sake } from '@/lib/types'
import { FLAVOR_TYPES } from '@/lib/flavor'
import { getSakeBackground } from '@/lib/sake-backgrounds'

export default function SakeThumb({ sake, size = 40 }: { sake: Sake; size?: number }) {
  const flavor = FLAVOR_TYPES[sake.flavorType]
  const background = getSakeBackground(sake)

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(150deg, ${flavor.gradient[0]}, ${flavor.gradient[1]})`,
        fontSize: size * 0.52,
        border: '1px solid var(--line-gold)',
        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
      }}
      aria-hidden="true"
    >
      <span
        className="sake-thumb__image"
        style={{ backgroundImage: `url(${JSON.stringify(background.url)})` }}
      />
      <span className="sake-thumb__veil" />
    </span>
  )
}
