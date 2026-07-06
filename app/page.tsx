'use client'

import { useState, useMemo, useEffect } from 'react'
import { MapPin, Filter, Zap, Heart, ChevronRight } from 'lucide-react'
import { REGIONS, Sake } from '@/lib/types'
import { getSakeList } from '@/lib/db'
import { REGION_COLORS } from '@/lib/mapData'
import JapanMap from '@/components/JapanMap'

const PAGE_BG = 'min-h-screen bg-gradient-to-b from-[#1c1712] to-[#0d0b09] px-6 py-10 text-washi animate-fade-in'
const CARD = 'bg-washi rounded-2xl shadow-xl shadow-black/40 border border-gold/20'
const BACK_BTN = 'mb-6 inline-flex items-center gap-2 text-sm text-washi/60 transition hover:text-gold'
const STEP_BADGE = 'inline-flex items-center justify-center rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold tracking-wide text-sumi'

export default function Home() {
  const [step, setStep] = useState('home')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [favorites, setFavorites] = useState<number[]>([])
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})

  const [allSakes, setAllSakes] = useState<Sake[]>([])
  const [sakesLoading, setSakesLoading] = useState(true)
  const [sakesError, setSakesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getSakeList()
      .then(data => {
        if (!cancelled) setAllSakes(data)
      })
      .catch(err => {
        if (!cancelled) setSakesError(err instanceof Error ? err.message : '日本酒データの取得に失敗しました')
      })
      .finally(() => {
        if (!cancelled) setSakesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredSakes = useMemo(() => {
    let result: Sake[] = selectedPrefecture
      ? allSakes.filter(sake => sake.prefecture === selectedPrefecture)
      : allSakes

    if (filterType !== 'all') {
      result = result.filter(sake => {
        if (filterType === 'sweet') return sake.dry_sweet_index > 3
        if (filterType === 'dry') return sake.dry_sweet_index < -2
        if (filterType === 'balanced') return sake.dry_sweet_index >= -2 && sake.dry_sweet_index <= 3
        return true
      })
    }

    return result
  }, [selectedPrefecture, filterType, allSakes])

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const goHome = () => {
    setStep('home')
    setSelectedRegion(null)
    setSelectedPrefecture(null)
    setFilterType('all')
  }

  // ホーム画面
  if (step === 'home') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-sumi">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover opacity-70"
            autoPlay
            muted
            loop
            playsInline
            poster="/videos/hero-poster.jpg"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-sumi/50 via-sumi/70 to-sumi" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20 animate-fade-in">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs tracking-[0.35em] text-gold">JAPANESE SAKE COLLECTION</p>
            <h1 className="font-serif text-5xl font-bold tracking-wide text-washi sm:text-6xl">
              日本酒図鑑
            </h1>
            <div className="mx-auto mt-5 h-px w-16 bg-gold/60" />
            <p className="mt-5 text-sm tracking-wide text-washi/70">全国の銘酒と、静かに向き合う。</p>
          </div>

          <div className="w-full max-w-md space-y-3">
            <button
              onClick={() => setStep('region')}
              className="group w-full rounded-xl border border-gold/25 bg-white/5 p-5 text-left backdrop-blur-md transition hover:border-gold/60 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-washi">地図から探す</div>
                  <div className="text-sm text-washi/60">地方 → 都道府県を選んで検索</div>
                </div>
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-sumi">
                  <MapPin size={20} />
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedPrefecture(null)
                setStep('list')
              }}
              className="group w-full rounded-xl border border-gold/25 bg-white/5 p-5 text-left backdrop-blur-md transition hover:border-gold/60 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-washi">好みから探す</div>
                  <div className="text-sm text-washi/60">甘口・辛口など好みで絞り込み</div>
                </div>
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-sumi">
                  <Filter size={20} />
                </span>
              </div>
            </button>

            <button
              onClick={() => setStep('quiz')}
              className="group w-full rounded-xl border border-gold/25 bg-white/5 p-5 text-left backdrop-blur-md transition hover:border-gold/60 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-washi">診断で見つける</div>
                  <div className="text-sm text-washi/60">質問に答えてぴったりの酒を発見</div>
                </div>
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-sumi">
                  <Zap size={20} />
                </span>
              </div>
            </button>

            {favorites.length > 0 && (
              <button
                onClick={() => setStep('favorites')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-kurenai/50 bg-kurenai/10 p-3 font-bold text-washi backdrop-blur-md transition hover:bg-kurenai/20"
              >
                <Heart size={16} fill="currentColor" className="text-kurenai" />
                お気に入り ({favorites.length})
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 地方選択 → 都道府県選択（地図付き）
  if (step === 'region') {
    return (
      <div className={PAGE_BG}>
        <div className="max-w-6xl mx-auto">
          <button onClick={goHome} className={BACK_BTN}>
            ← 戻る
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-80 flex-shrink-0 space-y-4">
              <div className={`${CARD} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={STEP_BADGE}>STEP 1</span>
                  <span className="text-sm font-bold text-sumi">地方を選択してください</span>
                </div>
                <div className="space-y-2">
                  {Object.keys(REGIONS).map(region => (
                    <button
                      key={region}
                      onClick={() => {
                        setSelectedRegion(region)
                        setSelectedPrefecture(null)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition text-left ${
                        selectedRegion === region
                          ? 'border-gold bg-gold/10'
                          : 'border-sumi/10 hover:border-gold/40 hover:bg-gold/5'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: REGION_COLORS[region] }}
                        />
                        <span className="font-bold text-sumi">{region}地方</span>
                      </span>
                      <ChevronRight size={18} className="text-gold/50" />
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${CARD} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={STEP_BADGE}>STEP 2</span>
                  <span className="text-sm font-bold text-sumi">都道府県を選択してください</span>
                </div>
                <div className="h-80">
                  {!selectedRegion ? (
                    <div className="h-full flex items-center justify-center text-center text-sm text-sumi/40 bg-sumi/5 rounded-lg p-4">
                      先に地方を選択してください
                    </div>
                  ) : (
                    <div className="space-y-2 h-full overflow-y-auto">
                      {REGIONS[selectedRegion as keyof typeof REGIONS]?.map(pref => (
                        <button
                          key={pref}
                          onClick={() => {
                            setSelectedPrefecture(pref)
                            setStep('list')
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-sumi/10 hover:border-gold/40 hover:bg-gold/5 transition text-left"
                        >
                          <span className="font-bold text-sumi">{pref}</span>
                          <ChevronRight size={18} className="text-gold/50" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`flex-1 ${CARD} p-4 min-h-[500px]`}>
              <JapanMap
                selectedRegion={selectedRegion}
                selectedPrefecture={selectedPrefecture}
                onSelectRegion={region => {
                  setSelectedRegion(region)
                  setSelectedPrefecture(null)
                }}
                onSelectPrefecture={pref => {
                  setSelectedPrefecture(pref)
                  setStep('list')
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 日本酒リスト
  if (step === 'list') {
    return (
      <div className={PAGE_BG}>
        <div className="max-w-2xl mx-auto">
          <button onClick={goHome} className={BACK_BTN}>
            ← 戻る
          </button>

          <h2 className="font-serif text-3xl font-bold text-washi mb-4">
            {selectedPrefecture ? `${selectedPrefecture}の日本酒` : '日本酒一覧'}
          </h2>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'sweet', 'dry', 'balanced'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition border ${
                  filterType === type
                    ? 'bg-kurenai border-kurenai text-washi'
                    : 'bg-washi border-gold/25 text-sumi/70 hover:border-gold/50'
                }`}
              >
                {type === 'all' && 'すべて'}
                {type === 'sweet' && '甘口'}
                {type === 'dry' && '辛口'}
                {type === 'balanced' && 'バランス型'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredSakes.map(sake => (
              <div
                key={sake.id}
                className={`${CARD} p-4 transition hover:border-gold/50`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{sake.image_url || '🍶'}</div>
                    <div>
                      <div className="font-bold text-sumi">{sake.name}</div>
                      <div className="text-sm text-sumi/50">{sake.type}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(sake.id)}
                    className={`p-2 rounded-full transition ${
                      favorites.includes(sake.id)
                        ? 'bg-kurenai/10 text-kurenai'
                        : 'bg-sumi/5 text-sumi/30 hover:text-kurenai'
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(sake.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 bg-gold/15 text-gold-dark rounded text-xs font-bold">
                    {sake.dry_sweet_index < -2
                      ? '辛口'
                      : sake.dry_sweet_index > 3
                      ? '甘口'
                      : 'バランス型'}
                  </span>
                  <span className="px-2 py-1 bg-sumi/5 text-sumi/60 border border-sumi/10 rounded text-xs">
                    {sake.alcohol_percentage}%
                  </span>
                </div>

                <p className="text-sumi/70 text-sm mb-3">{sake.description}</p>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-sumi text-washi rounded hover:bg-sumi-light transition text-sm">
                    詳しく見る
                  </button>
                  {sake.affiliate_amazon_link && (
                    <a
                      href={sake.affiliate_amazon_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 border border-gold text-gold-dark rounded hover:bg-gold hover:text-sumi transition text-sm text-center"
                    >
                      購入
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {sakesError && (
            <div className="text-center py-8">
              <p className="text-kurenai">データの取得に失敗しました: {sakesError}</p>
            </div>
          )}

          {!sakesError && sakesLoading && (
            <div className="text-center py-8">
              <p className="text-washi/50">読み込み中...</p>
            </div>
          )}

          {!sakesError && !sakesLoading && filteredSakes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-washi/50">該当する日本酒が見つかりません</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 診断画面
  if (step === 'quiz') {
    const questions = [
      {
        key: 'taste',
        label: '基本的な好み',
        options: [
          { value: 'dry', label: '辛口が好き' },
          { value: 'balanced', label: 'バランス型が好き' },
          { value: 'sweet', label: '甘口が好き' }
        ]
      },
      {
        key: 'intensity',
        label: 'アルコール度数',
        options: [
          { value: 'light', label: 'ライト（13%以下）' },
          { value: 'medium', label: 'スタンダード（13-15%）' },
          { value: 'strong', label: 'ストロング（15%以上）' }
        ]
      },
      {
        key: 'aroma',
        label: '香りの好み',
        options: [
          { value: 'fruity', label: 'フルーティー' },
          { value: 'floral', label: '華やか' },
          { value: 'subtle', label: '上品・淡い' }
        ]
      },
      {
        key: 'occasion',
        label: 'よく飲む場面',
        options: [
          { value: 'meal', label: 'ご飯と一緒に' },
          { value: 'chat', label: 'おしゃべりしながら' },
          { value: 'alone', label: 'ゆっくり一人で' }
        ]
      }
    ]

    return (
      <div className={PAGE_BG}>
        <div className="max-w-2xl mx-auto">
          <button onClick={goHome} className={BACK_BTN}>
            ← 戻る
          </button>

          <h2 className="font-serif text-3xl font-bold text-washi mb-6">あなたの好みを診断</h2>

          <div className="space-y-6">
            {questions.map(question => (
              <div key={question.key} className={`${CARD} p-4`}>
                <h3 className="font-bold text-sumi mb-3">{question.label}</h3>
                <div className="space-y-2">
                  {question.options.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gold/5"
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={option.value}
                        checked={quizAnswers[question.key] === option.value}
                        onChange={(e) =>
                          setQuizAnswers({
                            ...quizAnswers,
                            [question.key]: e.target.value
                          })
                        }
                        className="w-4 h-4 accent-gold"
                      />
                      <span className="text-sumi/80">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setStep('recommend')}
              disabled={Object.keys(quizAnswers).length < 4}
              className="w-full p-4 bg-gradient-to-r from-gold-light to-gold text-sumi rounded-lg font-bold hover:brightness-110 disabled:opacity-30 disabled:grayscale transition"
            >
              おすすめを見る
            </button>
          </div>
        </div>
      </div>
    )
  }

  // おすすめ結果
  if (step === 'recommend') {
    return (
      <div className={PAGE_BG}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep('quiz')} className={BACK_BTN}>
            ← 戻る
          </button>

          <div className={`mb-8 p-6 ${CARD}`}>
            <h2 className="font-serif text-2xl font-bold text-sumi mb-2">
              {quizAnswers.taste === 'sweet' && '甘口好きさん向け'}
              {quizAnswers.taste === 'dry' && '辛口好きさん向け'}
              {quizAnswers.taste === 'balanced' && 'バランス型好きさん向け'}
            </h2>
            <p className="text-sumi/60">あなたの好みに合わせたおすすめの日本酒です</p>
          </div>

          <div className="space-y-4">
            {[
              { name: '陸奥八仙', region: '青森県', taste: '辛口', desc: 'あなたの好みにぴったり' },
              { name: '月桂冠', region: '京都府', taste: '中口', desc: 'バランスの良さが特徴' },
              { name: '播州一献', region: '兵庫県', taste: '中辛口', desc: 'コクと深さがある' }
            ].map((sake, idx) => (
              <div key={idx} className={`p-4 ${CARD} border-l-4 border-l-gold`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">🍶</div>
                  <div>
                    <div className="font-bold text-sumi">{sake.name}</div>
                    <div className="text-sm text-sumi/50">{sake.region}</div>
                  </div>
                </div>
                <div className="text-sm text-sumi/70">{sake.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={goHome}
            className="w-full mt-6 p-4 bg-transparent text-washi rounded-lg font-bold hover:bg-white/5 transition border border-gold/30"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  // お気に入り
  if (step === 'favorites') {
    const favoriteSakes = allSakes.filter(sake => favorites.includes(sake.id))
    return (
      <div className={PAGE_BG}>
        <div className="max-w-2xl mx-auto">
          <button onClick={goHome} className={BACK_BTN}>
            ← 戻る
          </button>

          <h2 className="font-serif text-3xl font-bold text-washi mb-6 flex items-center gap-2">
            <Heart size={26} className="text-kurenai" fill="currentColor" />
            お気に入り
          </h2>

          <div className="space-y-4">
            {favoriteSakes.map(sake => (
              <div key={sake.id} className={`p-4 ${CARD} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{sake.image_url || '🍶'}</div>
                  <div>
                    <div className="font-bold text-sumi">{sake.name}</div>
                    <div className="text-sm text-sumi/50">{sake.prefecture}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(sake.id)}
                  className="p-2 rounded-full bg-kurenai/10 text-kurenai"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>

          {favoriteSakes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-washi/50">お気に入りはまだありません</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
