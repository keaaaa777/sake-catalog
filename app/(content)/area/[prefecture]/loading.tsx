import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 py-32 text-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--gold-foil)' }} aria-hidden="true" />
      <p className="text-sm tracking-[0.2em]" style={{ color: 'var(--mist)' }}>
        読み込み中...
      </p>
    </div>
  )
}
