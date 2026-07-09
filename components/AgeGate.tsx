'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sake-catalog:age-verified'

export default function AgeGate() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  const handleAnswer = (isAdult: boolean) => {
    if (isAdult) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        // localStorage unavailable — allow proceeding without persisting
      }
      setVisible(false)
    } else {
      window.location.href = 'https://www.gov-online.go.jp/'
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="年齢確認"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030914]/95 px-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-gold/30 bg-[#0a172c] p-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-gold/70">AGE VERIFICATION</p>
        <h2 className="mb-6 font-display text-xl font-bold text-washi">
          あなたは20歳以上ですか?
        </h2>
        <p className="mb-6 text-xs leading-relaxed text-washi/60">
          本サイトはお酒に関する情報を掲載しています。20歳未満の飲酒は法律で禁じられています。
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            className="rounded-full border border-gold bg-gold px-6 py-2.5 text-sm font-bold text-[#030914] transition hover:bg-gold/90"
          >
            20歳以上です
          </button>
          <button
            type="button"
            onClick={() => handleAnswer(false)}
            className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-washi/60 transition hover:border-white/30"
          >
            20歳未満です
          </button>
        </div>
      </div>
    </div>
  )
}
