'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlavorType } from '@/lib/types'
import { Occasion } from '@/lib/diagnosisTypes'

type FlavorVote = { flavor: FlavorType } | { occasion: Occasion }

interface Question {
  label: string
  options: { label: string; vote: FlavorVote }[]
}

const QUESTIONS: Question[] = [
  {
    label: '香りの好みは?',
    options: [
      { label: 'フルーティーで華やか、軽やかな飲み口', vote: { flavor: 'kaori' } },
      { label: 'すっきり爽やかでキレがある', vote: { flavor: 'sou' } },
      { label: '米の旨みやコクを感じる', vote: { flavor: 'jun' } },
      { label: '複雑で熟成感のある濃厚な香り', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: '好きな温度帯は?',
    options: [
      { label: 'よく冷やして(雪冷え・花冷え)', vote: { flavor: 'kaori' } },
      { label: '冷やして、または常温(涼冷え)', vote: { flavor: 'sou' } },
      { label: '常温、またはぬる燗', vote: { flavor: 'jun' } },
      { label: 'ぬる燗・熱燗でじっくり', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: '一緒に食べたい料理は?',
    options: [
      { label: '刺身やカルパッチョなど繊細な一皿', vote: { flavor: 'kaori' } },
      { label: '焼き鳥や揚げ物などさっぱり系', vote: { flavor: 'sou' } },
      { label: '肉料理や煮物などしっかり系', vote: { flavor: 'jun' } },
      { label: 'チーズやドライフルーツなど濃厚なおつまみ', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: '甘口と辛口、どちらが好み?',
    options: [
      { label: '優しく口に広がる甘口', vote: { flavor: 'jun' } },
      { label: 'やや甘口でバランス重視', vote: { flavor: 'kaori' } },
      { label: 'やや辛口ですっきり', vote: { flavor: 'sou' } },
      { label: 'キリッと冴え渡る辛口', vote: { flavor: 'juku' } },
    ],
  },
  {
    label: '今日はどんな気分?',
    options: [
      { label: '誰かと乾杯・パーティー気分', vote: { occasion: 'social' } },
      { label: '大切な人との語らいの場に', vote: { occasion: 'social' } },
      { label: '一人で静かに味わいたい', vote: { occasion: 'solo' } },
      { label: '一日の終わりにリラックス', vote: { occasion: 'solo' } },
    ],
  },
]

export default function DiagnosisPage() {
  const router = useRouter()
  const [qIndex, setQIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [flavorScores, setFlavorScores] = useState<Record<FlavorType, number>>({
    kaori: 0,
    sou: 0,
    jun: 0,
    juku: 0,
  })
  const [occasionScores, setOccasionScores] = useState<Record<Occasion, number>>({
    social: 0,
    solo: 0,
  })

  const handleSelect = (vote: FlavorVote) => {
    const nextFlavorScores = { ...flavorScores }
    const nextOccasionScores = { ...occasionScores }

    if ('flavor' in vote) {
      nextFlavorScores[vote.flavor] += 1
      setFlavorScores(nextFlavorScores)
    } else {
      nextOccasionScores[vote.occasion] += 1
      setOccasionScores(nextOccasionScores)
    }

    if (window.SakeAudio) window.SakeAudio.playDrip(0.4)

    setAnimating(true)
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex((prev) => prev + 1)
        setAnimating(false)
      } else {
        const topFlavor = (Object.entries(nextFlavorScores) as [FlavorType, number][]).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
        const topOccasion = (Object.entries(nextOccasionScores) as [Occasion, number][]).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
        router.push(`/diagnosis/result/${topFlavor}-${topOccasion}`)
      }
    }, 300)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10 text-center">
        <p className="content-eyebrow mb-2">DIAGNOSIS</p>
        <h1 className="content-title text-3xl md:text-4xl">1分診断</h1>
        <p className="mt-4 text-base" style={{ color: 'var(--mist)' }}>
          いくつかの質問に答えるだけで、あなたにぴったりの日本酒タイプが見つかります。
        </p>
      </header>

      <section className="content-card">
        <div className="diag-container w-full">
          <div
            className={`diag-q-area w-full transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="mb-2 text-center">
              <span className="text-sm uppercase tracking-[0.3em] text-gold">
                QUESTION {qIndex + 1} / {QUESTIONS.length}
              </span>
            </div>
            <p className="diag-q-text text-washi text-lg md:text-xl font-display mb-8">
              {QUESTIONS[qIndex].label}
            </p>
            <div className="diag-options flex flex-col items-center gap-3">
              {QUESTIONS[qIndex].options.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  className="diag-option w-full max-w-md border border-white/10 hover:border-gold hover:text-gold rounded-full py-3 px-6 text-base transition-all bg-[#030914]/40"
                  onClick={() => handleSelect(opt.vote)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
