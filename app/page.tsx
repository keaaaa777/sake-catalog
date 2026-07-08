'use client'

import { useState, useMemo, useEffect } from 'react'
import { Heart, ChevronRight } from 'lucide-react'
import { REGIONS, Sake } from '@/lib/types'
import { getSakeList } from '@/lib/db'
import { REGION_COLORS } from '@/lib/mapData'
import JapanMap from '@/components/JapanMap'
import WaterBackground from '@/components/WaterBackground'
import DiagnosisPanel from '@/components/DiagnosisPanel'

export default function Home() {
  const [step, setStep] = useState('home')
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const [selectedTasteGroup, setSelectedTasteGroup] = useState<string | null>(null) // 'kunshu' | 'soshu' | 'junshu' | 'jukushu' | null
  const [selectedSakeId, setSelectedSakeId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [favorites, setFavorites] = useState<number[]>([])

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

  // スクロール制御およびパネルオープン状態の body 反映
  useEffect(() => {
    const isFixed = ['home', 'region', 'quiz'].includes(step) || !!activePanel
    document.body.classList.toggle('fixed-screen', isFixed)
    document.body.classList.toggle('panel-opened', !!activePanel)
  }, [step, activePanel])

  // 水面トランジションを伴う遷移関数
  const changeStepWithTransition = (newStep: string, targetPanel: string | null = null) => {
    setIsTransitioning(true)
    
    // 水が押し寄せるトランジションのピーク時にステート更新
    setTimeout(() => {
      setStep(newStep)
      setActivePanel(targetPanel)
      
      // 戻るボタンやトップへの遷移時はフィルターリセット
      if (newStep === 'home' && !targetPanel) {
        setSelectedRegion(null)
        setSelectedPrefecture(null)
        setSelectedTasteGroup(null)
        setSelectedSakeId(null)
        setSearchQuery('')
        setFilterType('all')
      }
    }, 600)

    // トランジション解除
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1100)
  }

  // フィルター処理
  const filteredSakes = useMemo(() => {
    let result = allSakes

    if (selectedPrefecture) {
      result = result.filter(sake => sake.prefecture === selectedPrefecture)
    }

    if (selectedTasteGroup) {
      result = result.filter(sake => {
        if (selectedTasteGroup === 'kunshu') return sake.type === 'daiginjo' || sake.type === 'ginjo'
        if (selectedTasteGroup === 'soshu') return sake.dry_sweet_index < -2
        if (selectedTasteGroup === 'junshu') return sake.type === 'pure_rice'
        if (selectedTasteGroup === 'jukushu') return sake.type === 'honjozo' || (sake.dry_sweet_index >= -2 && sake.dry_sweet_index <= 3)
        return true
      })
    }

    if (selectedSakeId) {
      result = result.filter(sake => sake.id === selectedSakeId)
    }

    if (filterType !== 'all') {
      result = result.filter(sake => {
        if (filterType === 'sweet') return sake.dry_sweet_index > 3
        if (filterType === 'dry') return sake.dry_sweet_index < -2
        if (filterType === 'balanced') return sake.dry_sweet_index >= -2 && sake.dry_sweet_index <= 3
        return true
      })
    }

    return result
  }, [selectedPrefecture, selectedTasteGroup, selectedSakeId, filterType, allSakes])

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  // ホバー時の波紋トリガー
  const handleBtnHover = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!window.SakeWater) return
    const canvas = document.getElementById('water-canvas')
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const btnRect = e.currentTarget.getBoundingClientRect()
    const cx = btnRect.left + btnRect.width / 2 - rect.left
    const cy = btnRect.top + btnRect.height / 2 - rect.top
    window.SakeWater.triggerRipple(cx, cy, 0.6)
  }

  // ホバー時の水滴音
  const playHoverDrip = () => {
    if (window.SakeAudio) {
      window.SakeAudio.playDrip(0.7) // やや高めの金属的なきらめき
    }
  }

  return (
    <>
      {/* 水面および音響背景 */}
      <WaterBackground />

      {/* 水面トランジション演出用 */}
      <div id="overlay-transition" className={isTransitioning ? 'is-active' : ''} aria-hidden="true" />

      {/* ヘッダー */}
      <header className="site-header">
        <div className="brand" onClick={() => changeStepWithTransition('home', null)} style={{ cursor: 'pointer' }}>
          <span className="brand__logo" aria-hidden="true">雫</span>
          <span className="brand__name">SAKE SELECT</span>
        </div>
        <div className="flex items-center gap-4">
          {favorites.length > 0 && (
            <button
              onClick={() => changeStepWithTransition('favorites', null)}
              className="hub-back-btn flex items-center gap-2"
            >
              ♥ お気に入り ({favorites.length})
            </button>
          )}
        </div>
      </header>

      {/* メインステージ */}
      <main className="stage">
        {/* 縦書きヒーローセクション（和・静寂） */}
        <section className="hero-vertical">
          <p className="hero-vertical__eyebrow">清麗なる、一滴との対話</p>
          <h1 className="hero-vertical__title">
            清らかな水が、<br />
            銘酒を醸す。
          </h1>
          <p className="hero-vertical__lead">
            日本酒の味わいは、その土地の澄んだ水、磨き抜かれた米、<br />
            そして連綿と受け継がれる伝統の技から紡ぎ出されます。<br />
            水面に指先を触れるように、あなたに合う一杯を探してみてください。
          </p>
        </section>

        {/* 「どうやって探すか」の選択エリア */}
        <section className="search-selector">
          <h2 className="search-selector__title">酒の探し方を選ぶ</h2>

          <button
            type="button"
            className="option-btn"
            onPointerEnter={(e) => { handleBtnHover(e); playHoverDrip(); }}
            onClick={() => changeStepWithTransition('region', 'panel-map')}
          >
            <div className="option-btn__content">
              <div className="option-btn__meta">
                <span className="option-btn__label">地図から探す</span>
                <span className="option-btn__sub">全国の銘酒、地域ごとの個性をたどる</span>
              </div>
              <span className="option-btn__arrow" aria-hidden="true">→</span>
            </div>
          </button>

          <button
            type="button"
            className="option-btn"
            onPointerEnter={(e) => { handleBtnHover(e); playHoverDrip(); }}
            onClick={() => changeStepWithTransition('home', 'panel-taste')}
          >
            <div className="option-btn__content">
              <div className="option-btn__meta">
                <span className="option-btn__label">好みから探す</span>
                <span className="option-btn__sub">薫・爽・醇・熟、味わいのチャートから</span>
              </div>
              <span className="option-btn__arrow" aria-hidden="true">→</span>
            </div>
          </button>

          <button
            type="button"
            className="option-btn"
            onPointerEnter={(e) => { handleBtnHover(e); playHoverDrip(); }}
            onClick={() => changeStepWithTransition('home', 'panel-brand')}
          >
            <div className="option-btn__content">
              <div className="option-btn__meta">
                <span className="option-btn__label">銘柄から探す</span>
                <span className="option-btn__sub">格付け、醸造元の名前から直接探す</span>
              </div>
              <span className="option-btn__arrow" aria-hidden="true">→</span>
            </div>
          </button>

          <button
            type="button"
            className="option-btn"
            onPointerEnter={(e) => { handleBtnHover(e); playHoverDrip(); }}
            onClick={() => changeStepWithTransition('quiz', 'panel-diagnosis')}
          >
            <div className="option-btn__content">
              <div className="option-btn__meta">
                <span className="option-btn__label">診断から探す</span>
                <span className="option-btn__sub">今日の気分と料理から最適の一杯を診断</span>
              </div>
              <span className="option-btn__arrow" aria-hidden="true">→</span>
            </div>
          </button>
        </section>
      </main>

      {/* 各検索パネルコンテナ */}
      <div id="panels-container" className={activePanel ? 'is-active' : ''} role="dialog" aria-modal="true">
        {/* 1. 地図から探す (移植された JapanMap を表示) */}
        {activePanel === 'panel-map' && (
          <div className="sake-panel sake-panel--map is-active" style={{ maxWidth: '1100px', width: '95vw' }}>
            <div className="panel-header shrink-0">
              <h3 className="panel-header__title">地図から探す</h3>
              <span className="panel-header__sub">REGIONAL SAKE</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 text-left flex-1 lg:min-h-0">
              <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4 lg:h-full lg:min-h-0">
                <div className="bg-[#030914]/60 p-3 rounded-xl border border-gold/20 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
                  <div className="flex items-center gap-2 mb-2.5 shrink-0">
                    <span className="inline-flex items-center justify-center rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold tracking-wide text-sumi">STEP 1</span>
                    <span className="text-sm font-bold text-washi">地方を選択してください</span>
                  </div>
                  <div className="space-y-1.5 max-h-[180px] lg:max-h-none lg:flex-1 lg:min-h-0 overflow-y-auto pr-1">
                    {Object.keys(REGIONS).map((region) => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegion(region)
                          setSelectedPrefecture(null)
                          if (window.SakeAudio) window.SakeAudio.playDrip(0.5)
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg border transition text-left text-xs ${
                          selectedRegion === region
                            ? 'border-gold bg-gold/10 text-gold font-bold'
                            : 'border-white/10 hover:border-gold/40 hover:bg-gold/5 text-washi/80'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: REGION_COLORS[region as keyof typeof REGION_COLORS] }}
                          />
                          <span>{region}地方</span>
                        </span>
                        <ChevronRight size={14} className="text-gold/50" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#030914]/60 p-3 rounded-xl border border-gold/20 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
                  <div className="flex items-center gap-2 mb-2.5 shrink-0">
                    <span className="inline-flex items-center justify-center rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold tracking-wide text-sumi">STEP 2</span>
                    <span className="text-sm font-bold text-washi">都道府県を選択</span>
                  </div>
                  <div className="h-44 lg:h-auto lg:flex-1 lg:min-h-0">
                    {!selectedRegion ? (
                      <div className="h-full flex items-center justify-center text-center text-xs text-washi/40 bg-white/5 rounded-lg p-4">
                        先に地方を選択してください
                      </div>
                    ) : (
                      <div className="space-y-1.5 h-full overflow-y-auto pr-1">
                        {REGIONS[selectedRegion as keyof typeof REGIONS]?.map((pref) => (
                          <button
                            key={pref}
                            onClick={() => {
                              setSelectedPrefecture(pref)
                              changeStepWithTransition('list', null)
                            }}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg border border-white/5 hover:border-gold/40 hover:bg-gold/5 transition text-left text-xs text-washi"
                          >
                            <span>{pref}</span>
                            <ChevronRight size={14} className="text-gold/50" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-[#030914]/40 p-4 rounded-xl border border-gold/25 min-h-[350px] lg:min-h-0 lg:h-full">
                <JapanMap
                  selectedRegion={selectedRegion}
                  selectedPrefecture={selectedPrefecture}
                  onSelectRegion={(region) => {
                    setSelectedRegion(region)
                    setSelectedPrefecture(null)
                    if (window.SakeAudio) window.SakeAudio.playDrip(0.6)
                  }}
                  onSelectPrefecture={(pref) => {
                    setSelectedPrefecture(pref)
                    changeStepWithTransition('list', null)
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. 好みから探す */}
        {activePanel === 'panel-taste' && (
          <div className="sake-panel is-active">
            <div className="panel-header">
              <h3 className="panel-header__title">好みから探す</h3>
              <span className="panel-header__sub">FLAVOUR PROFILE</span>
            </div>
            <div className="taste-chart">
              <div
                className="taste-card text-left"
                onPointerEnter={playHoverDrip}
                onClick={() => {
                  setSelectedTasteGroup('kunshu')
                  changeStepWithTransition('list', null)
                }}
              >
                <div className="taste-card__header">
                  <h4 className="taste-card__title">薫酒 (くんしゅ)</h4>
                  <span className="taste-card__eng">Fragrant & Light</span>
                </div>
                <p className="taste-card__desc">フルーティーで華やかな香りと、軽快な飲み口。大吟醸や吟醸酒がこのタイプに属します。乾杯や、フルーツを使ったオードブルと合わせて。</p>
              </div>

              <div
                className="taste-card text-left"
                onPointerEnter={playHoverDrip}
                onClick={() => {
                  setSelectedTasteGroup('soshu')
                  changeStepWithTransition('list', null)
                }}
              >
                <div className="taste-card__header">
                  <h4 className="taste-card__title">爽酒 (そうしゅ)</h4>
                  <span className="taste-card__eng">Light & Fresh</span>
                </div>
                <p className="taste-card__desc">すっきりとした香り、軽やかでシャープなキレ味。本醸造や生酒など、冷やすと最も良さが引き立ち、様々なお料理に万成に合います。</p>
              </div>

              <div
                className="taste-card text-left"
                onPointerEnter={playHoverDrip}
                onClick={() => {
                  setSelectedTasteGroup('junshu')
                  changeStepWithTransition('list', null)
                }}
              >
                <div className="taste-card__header">
                  <h4 className="taste-card__title">醇酒 (じゅんしゅ)</h4>
                  <span className="taste-card__eng">Rich & Savoury</span>
                </div>
                <p className="taste-card__desc">米本来の深いコク、ふくよかな旨みと酸味。純米酒の多くがこれに該当し、ぬる燗にするとさらに旨みが膨らみます。お肉や濃いめのお料理に。</p>
              </div>

              <div
                className="taste-card text-left"
                onPointerEnter={playHoverDrip}
                onClick={() => {
                  setSelectedTasteGroup('jukushu')
                  changeStepWithTransition('list', null)
                }}
              >
                <div className="taste-card__header">
                  <h4 className="taste-card__title">熟酒 (じゅくしゅ)</h4>
                  <span className="taste-card__eng">Aged & Heavy</span>
                </div>
                <p className="taste-card__desc">ドライフルーツやスパイスのような複雑で濃厚な香りと、とろりとした深い味わい。古酒や長期熟成酒。食後酒として、チーズやドライフルーツと。</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. 銘柄から探す */}
        {activePanel === 'panel-brand' && (
          <div className="sake-panel is-active">
            <div className="panel-header">
              <h3 className="panel-header__title">銘柄から探す</h3>
              <span className="panel-header__sub">FAMOUS BRANDS</span>
            </div>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="銘柄名、都道府県、特徴などで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030914]/80 border border-gold/30 rounded-lg px-4 py-2.5 text-sm text-washi placeholder-washi/30 focus:outline-none focus:border-gold"
              />
            </div>

            <div className="brand-list max-h-[350px] overflow-y-auto pr-2">
              {sakesLoading ? (
                <div className="text-center py-6 text-sm text-washi/50">読み込み中...</div>
              ) : sakesError ? (
                <div className="text-center py-6 text-sm text-kurenai">{sakesError}</div>
              ) : allSakes.filter(sake => 
                sake.name.includes(searchQuery) || 
                sake.prefecture.includes(searchQuery) ||
                (sake.description && sake.description.includes(searchQuery))
              ).length === 0 ? (
                <div className="text-center py-6 text-sm text-washi/40">該当する銘柄がありません</div>
              ) : (
                allSakes.filter(sake => 
                  sake.name.includes(searchQuery) || 
                  sake.prefecture.includes(searchQuery) ||
                  (sake.description && sake.description.includes(searchQuery))
                ).map((sake) => (
                  <div
                    key={sake.id}
                    className="brand-row"
                    onClick={() => {
                      setSelectedSakeId(sake.id)
                      changeStepWithTransition('list', null)
                    }}
                  >
                    <div className="brand-row__main">
                      <span className="brand-row__name text-washi">{sake.name}</span>
                      <span className="brand-row__type text-washi/50">
                        {sake.type === 'daiginjo' && '純米大吟醸'}
                        {sake.type === 'ginjo' && '吟醸酒'}
                        {sake.type === 'pure_rice' && '純米酒'}
                        {sake.type === 'honjozo' && '本醸造'}
                      </span>
                    </div>
                    <span className="brand-row__area">{sake.prefecture}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. 診断から探す */}
        {activePanel === 'panel-diagnosis' && (
          <div className="sake-panel is-active">
            <div className="panel-header">
              <h3 className="panel-header__title">診断から探す</h3>
              <span className="panel-header__sub">DIAGNOSIS</span>
            </div>
            
            <DiagnosisPanel
              allSakes={allSakes}
              onSelectSake={(sakeId) => {
                setSelectedSakeId(sakeId)
                changeStepWithTransition('list', null)
              }}
              onReset={() => {
                if (window.SakeAudio) window.SakeAudio.playDrip(0.5)
              }}
            />
          </div>
        )}
      </div>

      {/* 閉じる（戻る）ボタン */}
      <button
        type="button"
        id="back-btn"
        className={activePanel ? 'is-active' : ''}
        onClick={() => changeStepWithTransition('home', null)}
        aria-label="詳細パネルを閉じる"
      >
        ← 閉じる
      </button>

      {/* 5. 日本酒一覧表示 */}
      {step === 'list' && (
        <div className="relative z-10 min-h-screen px-6 py-28 max-w-2xl mx-auto animate-fade-in text-left">
          <button
            onClick={() => changeStepWithTransition('home', null)}
            className="mb-8 inline-flex items-center gap-2 text-sm text-washi/60 transition hover:text-gold"
          >
            ← トップへ戻る
          </button>

          <h2 className="font-display text-3xl font-bold text-gold mb-6 border-b border-gold/20 pb-4">
            {selectedPrefecture ? `${selectedPrefecture}の日本酒` : 
             selectedTasteGroup ? (
               selectedTasteGroup === 'kunshu' ? '薫酒 (大吟醸・吟醸系)' :
               selectedTasteGroup === 'soshu' ? '爽酒 (すっきり辛口系)' :
               selectedTasteGroup === 'junshu' ? '醇酒 (芳醇純米系)' :
               '熟酒 (本醸造・熟成系)'
             ) : '日本酒一覧'}
          </h2>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'すべて' },
              { id: 'sweet', label: '甘口' },
              { id: 'dry', label: '辛口' },
              { id: 'balanced', label: 'バランス型' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setFilterType(type.id)
                  if (window.SakeAudio) window.SakeAudio.playDrip(0.5)
                }}
                className={`px-5 py-1.5 rounded-full text-xs transition border whitespace-nowrap ${
                  filterType === type.id
                    ? 'bg-[#c9b06a] border-[#c9b06a] text-[#030914] font-bold'
                    : 'bg-white/5 border-white/10 text-washi/80 hover:border-gold/40'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {sakesLoading ? (
              <div className="text-center py-12 text-washi/50">読み込み中...</div>
            ) : sakesError ? (
              <div className="text-center py-12 text-kurenai">{sakesError}</div>
            ) : filteredSakes.length === 0 ? (
              <div className="text-center py-12 text-washi/50">該当する日本酒が見つかりません</div>
            ) : (
              filteredSakes.map((sake) => (
                <div
                  key={sake.id}
                  className="bg-[#0a172c]/50 backdrop-blur-md rounded-xl p-6 border border-gold/15 shadow-2xl transition duration-300 hover:border-gold/40"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl bg-white/5 p-3 rounded-lg border border-white/5">🍶</div>
                      <div>
                        <div className="font-display text-xl font-bold text-washi">{sake.name}</div>
                        <div className="text-xs text-gold/80 mt-1">
                          {sake.prefecture} / {sake.type === 'daiginjo' ? '純米大吟醸' :
                                               sake.type === 'ginjo' ? '吟醸酒' :
                                               sake.type === 'pure_rice' ? '純米酒' : '本醸造'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(sake.id)}
                      className={`p-2.5 rounded-full transition ${
                        favorites.includes(sake.id)
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-white/5 text-washi/30 hover:text-red-400 border border-white/5'
                      }`}
                      aria-label="お気に入り"
                    >
                      <Heart
                        size={18}
                        fill={favorites.includes(sake.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-2.5 py-0.5 bg-gold/10 text-gold border border-gold/15 rounded text-[11px] font-medium">
                      {sake.dry_sweet_index < -2 ? '辛口' :
                       sake.dry_sweet_index > 3 ? '甘口' : 'バランス型'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-white/5 text-washi/60 border border-white/10 rounded text-[11px]">
                      アルコール分: {sake.alcohol_percentage}%
                    </span>
                  </div>

                  <p className="text-washi/70 text-sm leading-relaxed mb-6 border-l-2 border-gold/30 pl-3">{sake.description}</p>

                  <div className="flex gap-3">
                    {sake.affiliate_amazon_link && (
                      <a
                        href={sake.affiliate_amazon_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-4 rounded border border-gold text-gold text-xs text-center font-bold tracking-wider hover:bg-gold hover:text-[#030914] transition duration-300"
                      >
                        Amazon で見る
                      </a>
                    )}
                    {sake.affiliate_rakuten_link && (
                      <a
                        href={sake.affiliate_rakuten_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-4 rounded border border-gold/50 text-washi text-xs text-center tracking-wider hover:bg-gold/10 transition duration-300"
                      >
                        楽天市場 で見る
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. お気に入り表示 */}
      {step === 'favorites' && (
        <div className="relative z-10 min-h-screen px-6 py-28 max-w-2xl mx-auto animate-fade-in text-left">
          <button
            onClick={() => changeStepWithTransition('home', null)}
            className="mb-8 inline-flex items-center gap-2 text-sm text-washi/60 transition hover:text-gold"
          >
            ← トップへ戻る
          </button>

          <h2 className="font-display text-3xl font-bold text-gold mb-6 border-b border-gold/20 pb-4 flex items-center gap-2">
            <Heart size={26} className="text-red-400" fill="currentColor" />
            お気に入り銘柄
          </h2>

          <div className="space-y-4">
            {allSakes.filter(sake => favorites.includes(sake.id)).length === 0 ? (
              <div className="text-center py-12 text-washi/40">お気に入りはまだありません</div>
            ) : (
              allSakes.filter(sake => favorites.includes(sake.id)).map(sake => (
                <div
                  key={sake.id}
                  className="bg-[#0a172c]/40 backdrop-blur-md rounded-xl p-4 border border-gold/15 flex items-center justify-between transition hover:border-gold/30"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      setSelectedSakeId(sake.id)
                      changeStepWithTransition('list', null)
                    }}
                  >
                    <div className="text-2xl">🍶</div>
                    <div>
                      <div className="font-display text-sm font-bold text-washi">{sake.name}</div>
                      <div className="text-[11px] text-gold/80">{sake.prefecture}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(sake.id)}
                    className="p-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 transition hover:bg-red-500/20"
                    aria-label="お気に入り解除"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
