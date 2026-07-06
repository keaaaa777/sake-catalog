'use client'

import { useState, useMemo, useEffect } from 'react'
import { MapPin, Filter, Zap, Heart, ChevronRight } from 'lucide-react'
import { REGIONS, Sake } from '@/lib/types'
import { getSakeList } from '@/lib/db'
import { REGION_COLORS } from '@/lib/mapData'
import JapanMap from '@/components/JapanMap'

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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-7xl mb-4">🍶</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">日本酒図鑑</h1>
            <p className="text-lg text-gray-600">全国の名酒を発見しよう</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep('region')}
              className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-800">地図から探す</div>
                  <div className="text-sm text-gray-600">地方 → 都道府県を選んで検索</div>
                </div>
                <MapPin className="text-red-500" size={24} />
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedPrefecture(null)
                setStep('list')
              }}
              className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-orange-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-800">好みから探す</div>
                  <div className="text-sm text-gray-600">甘口・辛口など好みで絞り込み</div>
                </div>
                <Filter className="text-orange-500" size={24} />
              </div>
            </button>

            <button
              onClick={() => setStep('quiz')}
              className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-800">診断で見つける</div>
                  <div className="text-sm text-gray-600">質問に答えてぴったりの酒を発見</div>
                </div>
                <Zap className="text-blue-500" size={24} />
              </div>
            </button>

            {favorites.length > 0 && (
              <button
                onClick={() => setStep('favorites')}
                className="w-full p-4 bg-red-100 rounded-lg text-red-700 font-bold hover:bg-red-200 transition"
              >
                ❤️ お気に入り ({favorites.length})
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={goHome}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-80 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                    STEP 1
                  </span>
                  <span className="text-sm font-bold text-gray-700">地方を選択してください</span>
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
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: REGION_COLORS[region] }}
                        />
                        <span className="font-bold text-gray-800">{region}地方</span>
                      </span>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                    STEP 2
                  </span>
                  <span className="text-sm font-bold text-gray-700">都道府県を選択してください</span>
                </div>
                <div className="h-80">
                  {!selectedRegion ? (
                    <div className="h-full flex items-center justify-center text-center text-sm text-gray-400 bg-gray-50 rounded-lg p-4">
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
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-red-50 transition text-left"
                        >
                          <span className="font-bold text-gray-800">{pref}</span>
                          <ChevronRight size={18} className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow p-4 min-h-[500px]">
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goHome}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {selectedPrefecture ? `${selectedPrefecture}の日本酒` : '日本酒一覧'}
          </h2>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'sweet', 'dry', 'balanced'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  filterType === type
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
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
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{sake.image_url || '🍶'}</div>
                    <div>
                      <div className="font-bold text-gray-800">{sake.name}</div>
                      <div className="text-sm text-gray-600">{sake.type}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(sake.id)}
                    className={`p-2 rounded-full transition ${
                      favorites.includes(sake.id)
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(sake.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    {sake.dry_sweet_index < -2
                      ? '辛口'
                      : sake.dry_sweet_index > 3
                      ? '甘口'
                      : 'バランス型'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {sake.alcohol_percentage}%
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-3">{sake.description}</p>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">
                    詳しく見る
                  </button>
                  {sake.affiliate_amazon_link && (
                    <a
                      href={sake.affiliate_amazon_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition text-sm text-center"
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
              <p className="text-red-600">データの取得に失敗しました: {sakesError}</p>
            </div>
          )}

          {!sakesError && sakesLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">読み込み中...</p>
            </div>
          )}

          {!sakesError && !sakesLoading && filteredSakes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">該当する日本酒が見つかりません</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goHome}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6">あなたの好みを診断</h2>

          <div className="space-y-6">
            {questions.map(question => (
              <div key={question.key} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold text-gray-800 mb-3">{question.label}</h3>
                <div className="space-y-2">
                  {question.options.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100"
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
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setStep('recommend')}
              disabled={Object.keys(quizAnswers).length < 4}
              className="w-full p-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:bg-gray-300 transition"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('quiz')}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {quizAnswers.taste === 'sweet' && '甘口好きさん向け'}
              {quizAnswers.taste === 'dry' && '辛口好きさん向け'}
              {quizAnswers.taste === 'balanced' && 'バランス型好きさん向け'}
            </h2>
            <p className="text-gray-600">あなたの好みに合わせたおすすめの日本酒です</p>
          </div>

          <div className="space-y-4">
            {[
              { name: '陸奥八仙', region: '青森県', taste: '辛口', desc: 'あなたの好みにぴったり' },
              { name: '月桂冠', region: '京都府', taste: '中口', desc: 'バランスの良さが特徴' },
              { name: '播州一献', region: '兵庫県', taste: '中辛口', desc: 'コクと深さがある' }
            ].map((sake, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg shadow border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">🍶</div>
                  <div>
                    <div className="font-bold text-gray-800">{sake.name}</div>
                    <div className="text-sm text-gray-600">{sake.region}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">{sake.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={goHome}
            className="w-full mt-6 p-4 bg-white text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition border border-gray-300"
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={goHome}
            className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            ← 戻る
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-6">❤️ お気に入り</h2>

          <div className="space-y-4">
            {favoriteSakes.map(sake => (
              <div key={sake.id} className="p-4 bg-white rounded-lg shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{sake.image_url || '🍶'}</div>
                  <div>
                    <div className="font-bold text-gray-800">{sake.name}</div>
                    <div className="text-sm text-gray-600">{sake.prefecture}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(sake.id)}
                  className="p-2 rounded-full bg-red-100 text-red-500"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>

          {favoriteSakes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">お気に入りはまだありません</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
