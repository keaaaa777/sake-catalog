'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Sake } from '@/lib/types'

interface DiagnosisPanelProps {
  allSakes: Sake[]
  onReset: () => void
}

const QUESTIONS = [
  {
    key: 'taste',
    label: '今宵、求める味わいは？',
    options: [
      { value: 'dry', label: 'キリッと冴え渡る 辛口' },
      { value: 'balanced', label: '調和のとれた味わい バランス型' },
      { value: 'sweet', label: '優しく口に広がる 甘口' }
    ]
  },
  {
    key: 'intensity',
    label: 'お好みのアルコール感は？',
    options: [
      { value: 'light', label: '軽やかに楽しむ（13.5度以下）' },
      { value: 'medium', label: '心地よく浸る（14〜15.5度）' },
      { value: 'strong', label: '深く酔いしれる（16度以上）' }
    ]
  },
  {
    key: 'aroma',
    label: '香り立ちのイメージは？',
    options: [
      { value: 'fruity', label: '果実を思わせる 華やかさ' },
      { value: 'floral', label: 'おだやかで上品な香り' },
      { value: 'subtle', label: '食事を引き立てる 控えめな香り' }
    ]
  },
  {
    key: 'occasion',
    label: 'どのようなシチュエーションで？',
    options: [
      { value: 'meal', label: '美味しい料理のお供に（食中酒）' },
      { value: 'chat', label: '大切な人との語らいの場に' },
      { value: 'alone', label: '一人の静かな夜、自分と向き合う' }
    ]
  }
]

export default function DiagnosisPanel({ allSakes, onReset }: DiagnosisPanelProps) {
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleSelectOption = (value: string) => {
    const key = QUESTIONS[qIndex].key
    setAnswers(prev => ({ ...prev, [key]: value }))

    if (window.SakeAudio) {
      window.SakeAudio.playDrip(0.4) // 音を鳴らす
    }

    setAnimating(true)
    setTimeout(() => {
      if (qIndex < QUESTIONS.length - 1) {
        setQIndex(prev => prev + 1)
        setAnimating(false)
      } else {
        setShowResult(true)
        setAnimating(false)
      }
    }, 300)
  }

  // 診断結果に基づくおすすめ日本酒の抽出ロジック
  const recommendations = useMemo(() => {
    if (!showResult || allSakes.length === 0) return []

    // 各日本酒にマッチ度スコアを割り振る
    const scored = allSakes.map(sake => {
      let score = 0

      // 1. 甘辛スコア (最大 3点)
      if (answers.taste === 'dry' && sake.sweetDry <= -2) score += 3
      else if (answers.taste === 'sweet' && sake.sweetDry >= 2) score += 3
      else if (answers.taste === 'balanced' && sake.sweetDry > -2 && sake.sweetDry < 2) score += 3

      // 2. アルコール度数スコア (最大 2点)
      const alc = sake.specs.abv ?? 15
      if (answers.intensity === 'light' && alc <= 13.5) score += 2
      else if (answers.intensity === 'strong' && alc >= 16) score += 2
      else if (answers.intensity === 'medium' && alc > 13.5 && alc < 16) score += 2

      // 3. 香りスコア (最大 2点)
      if ((answers.aroma === 'fruity' || answers.aroma === 'floral') && sake.flavorType === 'kaori') score += 2
      else if (answers.aroma === 'subtle' && (sake.flavorType === 'sou' || sake.flavorType === 'jun')) score += 2

      // 4. シチュエーション（説明文からのマッチング） (最大 1点)
      const desc = sake.description || ''
      if (answers.occasion === 'meal' && (desc.includes('食中酒') || desc.includes('料理') || desc.includes('合わせ'))) score += 1
      else if (answers.occasion === 'chat' && (desc.includes('華やか') || desc.includes('会話') || desc.includes('パーティー'))) score += 1
      else if (answers.occasion === 'alone' && (desc.includes('静か') || desc.includes('じっくり') || desc.includes('コク') || desc.includes('熟成'))) score += 1

      return { sake, score }
    })

    // スコアの高い順に並び替え、上位3件を抽出
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sake)
  }, [showResult, answers, allSakes])

  const handleReset = () => {
    setQIndex(0)
    setAnswers({})
    setShowResult(false)
    onReset()
  }

  return (
    <div className="diag-container w-full">
      {!showResult ? (
        <div 
          className={`diag-q-area w-full transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
          id="diag-question"
        >
          <div className="text-center mb-2">
            <span className="text-[10px] tracking-[0.3em] text-gold uppercase">QUESTION {qIndex + 1} / 4</span>
          </div>
          <p className="diag-q-text text-washi text-lg md:text-xl font-display mb-8">
            {QUESTIONS[qIndex].label}
          </p>
          <div className="diag-options flex flex-col items-center gap-3">
            {QUESTIONS[qIndex].options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className="diag-option w-full max-w-md border border-white/10 hover:border-gold hover:text-gold rounded-full py-3 px-6 text-sm transition-all bg-[#030914]/40"
                onClick={() => handleSelectOption(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="diag-result-area is-active w-full">
          <p className="diag-result__eyebrow text-xs uppercase tracking-[0.2em] text-gold mb-2">
            DIAGNOSIS RESULT
          </p>
          <h4 className="diag-result__title text-2xl font-display text-gold mb-2">
            あなたに寄り添う、おすすめの三銘柄
          </h4>
          <p className="diag-result__desc text-xs text-washi/60 max-w-md mx-auto mb-8 leading-relaxed">
            ご回答いただいたお好みに基づき、データベースからマッチ率の高い日本酒を選定いたしました。
          </p>

          <div className="space-y-3 max-w-md mx-auto mb-8 text-left">
            {recommendations.map((sake) => (
              <Link
                key={sake.id}
                href={`/sake/${sake.slug}`}
                className="p-3 border border-gold/15 bg-[#030914]/60 rounded-xl flex items-center justify-between hover:border-gold transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-white/5 p-2 rounded-lg border border-white/5">🍶</div>
                  <div>
                    <div className="font-display text-sm font-bold text-washi">{sake.name}</div>
                    <div className="text-[10px] text-gold/80">{sake.prefecture} / {sake.classification}</div>
                  </div>
                </div>
                <span className="text-xs text-gold/60 font-latin">詳細 →</span>
              </Link>
            ))}
          </div>

          <button 
            type="button" 
            className="diag-reset-btn text-xs border border-white/10 hover:border-white hover:text-white rounded-full py-2 px-6 transition-all"
            onClick={handleReset}
          >
            もう一度診断する
          </button>
        </div>
      )}
    </div>
  )
}
