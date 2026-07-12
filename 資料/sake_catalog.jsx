import React, { useState, useMemo } from 'react';
import { ChevronRight, Heart, MapPin, Filter, Zap } from 'lucide-react';

export default function SakeCatalog() {
  // サンプルデータ
  const sakeData = {
    '北海道': [
      { id: 1, name: '合同酒精 鍛高譚', region: '北海道', taste: '辛口', sweetness: 2, type: '純米酒', image: '🍶', description: '爽やかな香りと辛口の後味', price: 2500, affiliate: 'https://example.com/sake1' },
      { id: 2, name: '国士無双', region: '北海道', taste: '中辛口', sweetness: 4, type: '吟醸酒', image: '🌾', description: 'バランスの取れた味わい', price: 3500, affiliate: 'https://example.com/sake2' }
    ],
    '青森県': [
      { id: 3, name: '陸奥八仙', region: '青森県', taste: '辛口', sweetness: 2, type: '純米吟醸', image: '🍶', description: '透明感のある辛口', price: 3000, affiliate: 'https://example.com/sake3' },
      { id: 4, name: '桃の里', region: '青森県', taste: '甘口', sweetness: 7, type: '本醸造', image: '🍑', description: '甘めで飲みやすい', price: 2000, affiliate: 'https://example.com/sake4' }
    ],
    '京都府': [
      { id: 5, name: '月桂冠', region: '京都府', taste: '中口', sweetness: 5, type: '特別本醸造', image: '🍶', description: '伝統的な京都の味わい', price: 2800, affiliate: 'https://example.com/sake5' },
      { id: 6, name: '招徳', region: '京都府', taste: '甘口', sweetness: 6, type: '吟醸酒', image: '🌸', description: '華やかな香りと甘さ', price: 3200, affiliate: 'https://example.com/sake6' }
    ],
    '兵庫県': [
      { id: 7, name: '白鹿', region: '兵庫県', taste: '辛口', sweetness: 2, type: '本醸造', image: '🍶', description: '江戸時代から続く辛口', price: 2200, affiliate: 'https://example.com/sake7' },
      { id: 8, name: '播州一献', region: '兵庫県', taste: '中辛口', sweetness: 3, type: '純米酒', image: '⚔️', description: '力強い味わい', price: 2900, affiliate: 'https://example.com/sake8' }
    ]
  };

  const regions = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '秋田県'],
    '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県'],
    '関西': ['京都府', '兵庫県', '大阪府', '奈良県', '滋賀県'],
    '中国': ['広島県', '岡山県', '山口県'],
    '四国': ['香川県', '徳島県'],
    '九州': ['福岡県', '佐賀県', '長崎県', '熊本県']
  };

  // State管理
  const [step, setStep] = useState('home'); // home, region, prefecture, list, detail, quiz, recommend
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, sweet, dry, balanced
  const [favorites, setFavorites] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});

  // フィルタリング処理
  const filteredSakes = useMemo(() => {
    let result = [];
    
    if (step === 'list' && selectedPrefecture) {
      result = sakeData[selectedPrefecture] || [];
    }
    
    if (filterType !== 'all') {
      result = result.filter(sake => {
        if (filterType === 'sweet') return sake.sweetness >= 6;
        if (filterType === 'dry') return sake.sweetness <= 3;
        if (filterType === 'balanced') return sake.sweetness > 3 && sake.sweetness < 6;
        return true;
      });
    }
    
    return result;
  }, [step, selectedPrefecture, filterType]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // ホーム画面
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🍶</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">日本酒図鑑</h1>
          <p className="text-lg text-gray-600">全国の名酒を発見しよう</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setStep('region')}
            className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-xl font-bold text-gray-800">地図から探す</div>
                <div className="text-sm text-gray-600">地方 → 都道府県を選んで検索</div>
              </div>
              <MapPin className="text-red-500" size={24} />
            </div>
          </button>

          <button
            onClick={() => setStep('filter')}
            className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-xl font-bold text-gray-800">好みから探す</div>
                <div className="text-sm text-gray-600">甘口・辛口など好みで絞り込み</div>
              </div>
              <Filter className="text-orange-500" size={24} />
            </div>
          </button>

          <button
            onClick={() => setStep('quiz')}
            className="w-full p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-xl font-bold text-gray-800">診断で見つける</div>
                <div className="text-sm text-gray-600">質問に答えてあなたにぴったりの酒を発見</div>
              </div>
              <Zap className="text-blue-500" size={24} />
            </div>
          </button>

          {favorites.length > 0 && (
            <button
              onClick={() => setStep('favorites')}
              className="w-full p-4 bg-red-100 rounded-lg text-red-700 font-bold"
            >
              ❤️ お気に入り ({favorites.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 地方選択画面
  const RegionPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setStep('home')}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← 戻る
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">地方を選択</h2>

        <div className="grid grid-cols-1 gap-3">
          {Object.keys(regions).map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-orange-50 transition text-left"
            >
              <div className="font-bold text-gray-800">{region}</div>
              <div className="text-sm text-gray-600">{regions[region].join(' / ')}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 都道府県選択画面
  const PrefecturePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedRegion(null)}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← 戻る
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">{selectedRegion}から選択</h2>

        <div className="grid grid-cols-1 gap-3">
          {regions[selectedRegion]?.map(pref => (
            <button
              key={pref}
              onClick={() => {
                setSelectedPrefecture(pref);
                setStep('list');
              }}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg hover:bg-red-50 transition text-left flex items-center justify-between"
            >
              <div className="font-bold text-gray-800">{pref}</div>
              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // 日本酒リスト画面
  const ListPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setStep('home')}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">{selectedPrefecture}の日本酒</h2>

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
              onClick={() => {
                setSelectedPrefecture(sake.region);
                setStep('detail');
              }}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{sake.image}</div>
                  <div>
                    <div className="font-bold text-gray-800">{sake.name}</div>
                    <div className="text-sm text-gray-600">{sake.type}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(sake.id);
                  }}
                  className={`p-2 rounded-full transition ${
                    favorites.includes(sake.id)
                      ? 'bg-red-100 text-red-500'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Heart size={20} fill={favorites.includes(sake.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex gap-4 text-sm mb-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">{sake.taste}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">甘さ: {sake.sweetness}/10</span>
              </div>
              <div className="text-gray-600 text-sm">{sake.description}</div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="text-lg font-bold text-red-500">¥{sake.price}</div>
                <a
                  href={sake.affiliate}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition"
                >
                  詳しく見る
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 診断画面
  const QuizPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setStep('home')}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">あなたの好みを診断</h2>

        <div className="space-y-6">
          {[
            { key: 'taste', label: '基本的な好み', options: [
              { value: 'dry', label: '辛口が好き' },
              { value: 'balanced', label: 'バランス型が好き' },
              { value: 'sweet', label: '甘口が好き' }
            ]},
            { key: 'intensity', label: 'アルコール度数', options: [
              { value: 'light', label: 'ライト（13%以下）' },
              { value: 'medium', label: 'スタンダード（13-15%）' },
              { value: 'strong', label: 'ストロング（15%以上）' }
            ]},
            { key: 'aroma', label: '香りの好み', options: [
              { value: 'fruity', label: 'フルーティー' },
              { value: 'floral', label: '華やか' },
              { value: 'subtle', label: '上品・淡い' }
            ]},
            { key: 'occasion', label: 'よく飲む場面', options: [
              { value: 'meal', label: 'ご飯と一緒に' },
              { value: 'chat', label: 'おしゃべりしながら' },
              { value: 'alone', label: 'ゆっくり一人で' }
            ]}
          ].map(question => (
            <div key={question.key} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-gray-800 mb-3">{question.label}</h3>
              <div className="space-y-2">
                {question.options.map(option => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-100">
                    <input
                      type="radio"
                      name={question.key}
                      value={option.value}
                      checked={quizAnswers[question.key] === option.value}
                      onChange={(e) => setQuizAnswers({...quizAnswers, [question.key]: e.target.value})}
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
  );

  // おすすめ画面
  const RecommendPage = () => {
    const recommendedSakes = filteredSakes.slice(0, 3);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setStep('quiz')}
            className="mb-6 text-gray-600 hover:text-gray-800"
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
        </div>
      </div>
    );
  };

  // ステップに応じた画面の表示
  return (
    <>
      {step === 'home' && <HomePage />}
      {step === 'region' && (selectedRegion ? <PrefecturePage /> : <RegionPage />)}
      {step === 'list' && <ListPage />}
      {step === 'quiz' && <QuizPage />}
      {step === 'recommend' && <RecommendPage />}
    </>
  );
}
