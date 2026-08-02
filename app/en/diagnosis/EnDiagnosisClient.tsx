'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FlavorType } from '@/lib/types'
import { Occasion } from '@/lib/diagnosisTypes'
import { EN_QUESTIONS } from '@/lib/i18n/diagnosis-en'

type FlavorVote = { flavor: FlavorType } | { occasion: Occasion }

export default function EnDiagnosisClient() {
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
      if (qIndex < EN_QUESTIONS.length - 1) {
        setQIndex((prev) => prev + 1)
        setAnimating(false)
      } else {
        const topFlavor = (Object.entries(nextFlavorScores) as [FlavorType, number][]).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
        const topOccasion = (Object.entries(nextOccasionScores) as [Occasion, number][]).sort(
          (a, b) => b[1] - a[1]
        )[0][0]
        router.push(`/en/diagnosis/result/${topFlavor}-${topOccasion}`)
      }
    }, 300)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-10 text-center">
        <p className="content-eyebrow mb-2">DIAGNOSIS</p>
        <h1 className="content-title text-3xl md:text-4xl">One-Minute Sake Quiz</h1>
        <p className="mt-4 text-base" style={{ color: 'var(--mist)' }}>
          Answer a few quick questions to find the sake style that suits you.
        </p>
      </header>

      <section className="content-card">
        <div className="diag-container w-full">
          <div
            className={`diag-q-area w-full transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="mb-2 text-center">
              <span className="text-sm uppercase tracking-[0.3em] text-gold">
                QUESTION {qIndex + 1} / {EN_QUESTIONS.length}
              </span>
            </div>
            <p className="diag-q-text text-washi text-lg md:text-xl font-display mb-8">
              {EN_QUESTIONS[qIndex].label}
            </p>
            <div className="diag-options flex flex-col items-center gap-3">
              {EN_QUESTIONS[qIndex].options.map((opt) => (
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
