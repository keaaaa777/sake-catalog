import Link from 'next/link'
import type { RankingItem } from '@/lib/siteStats'

export default function StatBarList({
  items,
  color = 'var(--gold-foil)',
  unit = '銘柄',
}: {
  items: (RankingItem & { color?: string })[]
  color?: string
  unit?: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const pct = Math.max((item.value / max) * 100, 2)
        const content = (
          <>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span style={{ color: 'var(--paper-white)' }}>{item.label}</span>
              <span className="shrink-0" style={{ color: 'var(--mist)' }}>{item.value}{unit}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5">
              <div
                className="h-2 rounded-full"
                style={{ width: `${pct}%`, background: item.color ?? color }}
              />
            </div>
          </>
        )

        return item.href ? (
          <Link key={item.label} href={item.href} className="block transition-opacity hover:opacity-80">
            {content}
          </Link>
        ) : (
          <div key={item.label}>{content}</div>
        )
      })}
    </div>
  )
}
