import Link from 'next/link'
import type { ContentSource, VerificationStatus } from '@/lib/types'

const STATUS_LABELS: Record<VerificationStatus, string> = {
  verified: '公式情報で確認済み',
  supported: '複数資料で確認',
  conflicting: '資料間の差異を確認中',
  unverified: '出典確認中',
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

export default function SourceInfo({
  sources = [],
  status = 'unverified',
  lastReviewedAt,
}: {
  sources?: ContentSource[]
  status?: VerificationStatus
  lastReviewedAt?: string
}) {
  const reviewed = formatDate(lastReviewedAt)

  return (
    <section className="content-card">
      <div className="panel-header">
        <h2 className="panel-header__title">掲載情報について</h2>
        <span className="panel-header__sub">SOURCES &amp; REVIEW</span>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt style={{ color: 'var(--mist)' }}>確認状態</dt>
          <dd className="mt-1" style={{ color: 'var(--paper-white)' }}>{STATUS_LABELS[status]}</dd>
        </div>
        <div>
          <dt style={{ color: 'var(--mist)' }}>最終確認日</dt>
          <dd className="mt-1" style={{ color: 'var(--paper-white)' }}>{reviewed ?? '順次確認中'}</dd>
        </div>
      </dl>

      {sources.length > 0 ? (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--paper-white)' }}>参照した情報</h3>
          <ul className="space-y-2 text-sm">
            {sources.map((source) => (
              <li key={`${source.url}-${source.title}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>
                  {source.title} ↗
                </a>
                {formatDate(source.checkedAt) && <span style={{ color: 'var(--mist)' }}>（{formatDate(source.checkedAt)}確認）</span>}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--mist)' }}>
          このページは出典表示を順次整備しています。商品仕様や流通状況は変更されるため、購入時は酒蔵・販売元の最新情報もご確認ください。
        </p>
      )}

      <p className="mt-4 text-sm">
        <Link href="/editorial-policy" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>情報の確認方法</Link>
        <span style={{ color: 'var(--mist)' }}> ・ </span>
        <Link href="/corrections" className="hover:underline" style={{ color: 'var(--gold-foil)' }}>訂正・削除の連絡</Link>
      </p>
    </section>
  )
}
