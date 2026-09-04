// 楽天市場で「アフィリエイトリンクを張れる日本酒商品」を横断検索し、
// サイトへ順次追加していくための候補一覧(テーブル)を作る調査用スクリプト。
//
// 出力はあくまで「候補の生データ」。銘柄ページとして掲載するには、
// 味わいプロファイル・紹介文・都道府県/蔵元の紐付け等の追加キュレーションが
// 別途必要(既存の scripts/add-real-sakes.js などのパイプラインを参照)。
//
// 使い方: node scripts/build-sake-candidates.js
const fs = require('fs')
const path = require('path')
const { searchRakutenItems, sleep } = require('./lib/rakuten-search')

const DATA_DIR = path.join(__dirname, '..', 'data')
const CACHE_DIR = path.join(DATA_DIR, 'cache')
const OUT_JSON = path.join(CACHE_DIR, 'sake-affiliate-candidates.json')
const OUT_CSV = path.join(CACHE_DIR, 'sake-affiliate-candidates.csv')

// これまでに検索済みのキーワード(履歴・重複クエリを避けるための記録)。
// 新しく母数を増やす際は PENDING_KEYWORDS に追記し、実行後にこちらへ移すこと。
const SEARCHED_KEYWORDS = [
  '日本酒', '地酒', '清酒',
  '純米大吟醸', '大吟醸', '純米吟醸', '吟醸', '純米酒', '本醸造',
  '特別純米', '特別本醸造', '生酒', '原酒', 'にごり酒', 'スパークリング日本酒',
  '古酒', '低アルコール日本酒',
  '辛口 日本酒', '甘口 日本酒', '新酒', 'ひやおろし',
  '山廃 日本酒', '生酛 日本酒', '無濾過 日本酒',
  // 主要産地(都道府県 + 日本酒)
  '新潟 日本酒', '兵庫 日本酒', '京都 日本酒', '秋田 日本酒', '山形 日本酒',
  '福島 日本酒', '広島 日本酒', '高知 日本酒', '福岡 日本酒', '長野 日本酒',
  '石川 日本酒', '富山 日本酒', '岩手 日本酒', '山口 日本酒', '愛知 日本酒',
  // 有名銘柄名
  '獺祭', '八海山', '久保田', '十四代', '而今', '花陽浴', '新政', '飛露喜',
  '鍋島', '出羽桜', '醸し人九平次', '黒龍', '雪の茅舎', '大七', '賀茂鶴',
  '王祿', '磯自慢', '田酒', '東洋美人',
  // 酒米品種
  '山田錦 日本酒', '五百万石 日本酒', '雄町 日本酒', '美山錦 日本酒', '愛山 日本酒',
  // 残り32都道府県
  '北海道 日本酒', '青森 日本酒', '宮城 日本酒', '茨城 日本酒', '栃木 日本酒',
  '群馬 日本酒', '埼玉 日本酒', '千葉 日本酒', '東京 日本酒', '神奈川 日本酒',
  '福井 日本酒', '山梨 日本酒', '岐阜 日本酒', '静岡 日本酒', '三重 日本酒',
  '滋賀 日本酒', '大阪 日本酒', '奈良 日本酒', '和歌山 日本酒', '鳥取 日本酒',
  '島根 日本酒', '岡山 日本酒', '徳島 日本酒', '香川 日本酒', '愛媛 日本酒',
  '佐賀 日本酒', '長崎 日本酒', '熊本 日本酒', '大分 日本酒', '宮崎 日本酒',
  '鹿児島 日本酒', '沖縄 日本酒',
  // 有名銘柄名(追加分)
  '剣菱', '白鶴', '月桂冠', '大関', '浦霞', '一ノ蔵', '男山', '高清水',
  '楯野川', '上喜元', '満寿泉', '立山', '天狗舞', '菊姫', '手取川', '常きげん',
  '真澄', '伯楽星', '墨廼江', '日高見', '上善如水', '越乃寒梅', '〆張鶴', '雪中梅',
  '鶴齢', '早瀬浦', '花垣', '開運', '喜久醉', '鳳凰美田', '会津娘', '千代の光',
  '龍力', '奥播磨', '陸奥八仙', '豊盃', '東一', '貴',
  // 温度帯・度数
  '燗酒', '熱燗 日本酒', 'ぬる燗 日本酒', '冷酒 日本酒', '食中酒 日本酒',
  '高アルコール 日本酒', '微発泡 日本酒',
  // 有名銘柄名(追加分・中堅どころ)
  '松の司', '荷札酒', '篠峯', '田中六五', '秋鹿', '神亀', '若戎', '竹泉',
  '想天坊', '十旭日', '富久長', '白老', '会津中将', '巻機', '義俠', '醴泉',
  '白岳仙', '東北泉', '加賀鳶', '常山',
  // 酒米品種(追加分)
  '出羽燦々 日本酒', 'ひとごこち 日本酒', '越淡麗 日本酒',
  // 有名銘柄名(追加分・中堅どころ 第3弾)
  '臥龍梅', '澤屋まつもと', '鯉川', '一白水成', 'ロ万', '十九', '田友', '群馬泉',
  '房の露', '龍勢', '鶴の友', '麒麟山', '雪の松島', '山和', '六歌仙', '阿櫻',
  '刈穂', '春霞', '天寿', '秀鳳', '三千櫻', '波瀬正吉', '三芳菊', '亀の翁',
  '五橋', '東鶴', '花の香', '通潤', 'れいざん', '加茂錦',
  // 有名銘柄名(追加分・中堅どころ 第4弾)
  '磐城壽', '会津宮泉', '大信州', '天青', '白隠正宗', '蒼空', '花巴', '誉池月',
  '天遊琳', '竹の露', '千代緑', '一乃谷', '神圧', '陸奥男山', '田舎誉', '雅山流',
  '山形正宗', '上壱', '悦凱陣', '一夜雫', '姿', '宗玄', '田村農園',
  // 有名銘柄名(追加分・中堅どころ 第5弾)
  '白瀑', '山本 日本酒', '富翁', '神聖', '富久錦', '神結', '生酛のどぶ', '忠愛',
  '雪彦山', '越の白鳥', '伏見男山', '貴仙寿', '開華', '若竹屋', '出羽の冨士',
  '白露垂珠', '十六島', '隠岐誉', '屋守',
  // 有名銘柄名(追加分・中堅どころ 第6弾・大量投入)
  '北秋田', '白湧水', '谷泉', '竹葉', '満月 日本酒', '幻の瀧', '帆波', '苗場山',
  '高千代', '鮎正宗', '弥右衛門', '会津西郷', '榮川', '奈良萬', '曙 日本酒', '宝寿',
  '一歩己', '天明', '玄葉本店', '一生青春', '千代の松', '白牡丹', '賀茂輝', '白鴻',
  '千福', '天寶一', '山陽鶴', '鷹木', '遊穂', '曙陽', '三笑楽', '佐久乃花', '太平山',
  'まんさくの花', 'やまユ', '花邑', '米鶴', '樽平', '蔵王 日本酒', '東光 日本酒', '香梅',
  '白木久',
  // 有名銘柄名(追加分・中堅どころ 第7弾)
  'ゆきの美人', '天の戸', '亀の海', '男女川', '一人娘', '郷乃誉', '副将軍', '鴻乃湖',
  '桂月', '土佐鶴', '文佳人', '無手無冠', '中土佐', '八重垣', '篁', '智恵美人',
  '若波', '越乃景虎', '謙信', '峰乃白梅', '金鵄盃', '朝日山', '天神囃子', '越の華',
  '越後鶴亀', '雪男山', '大洋盛', '越乃親不知', '福正宗', '安芸虎', '亀の尾',
  // 有名銘柄名(追加分・中堅どころ 第8弾)
  '飛良泉', '真珠 日本酒', '喜多屋', '筑紫の誉', '庭のうぐいす', '寒北斗', '出羽鶴',
  '刀 日本酒', 'くどき上手', '鶴の江', '会津司', '写楽', '会津太陽', '国権',
  '仙禽', '仙介', '楢の露', '越銘醸', '雪小町', '龍神丸',
  // 有名銘柄名(追加分・中堅どころ 第9弾)
  '梅の宿', 'みむろ杉', '奥丹波', '奥丹後', '丹沢山', '曽我鶴', '半蔵', '聚楽第',
  '豊祝', '英美稲', '花陽浴 純米吟醸', '達磨正宗 純米', '睡龍 純米', '鷹勇',
  '白鷹', '寶劔', '雨後の月 大吟醸', '賀茂金秀', '亀の勢', '御幸鶴', '賀儀屋',
  '雨後の月 純米吟醸', '西條鶴', '千代乃春', '龍勢 特別純米', '銘石の郷', '春鹿 大吟醸',
  // 有名銘柄名(追加分・中堅どころ 第10弾)
  '福小町', '雪の秀峰', '鳥海山', '爛漫', '宮寒梅', '真鶴 日本酒', '乾坤一', '勝山 日本酒',
  '浦霞 禅', '日の丸醸造', '福禄寿', '喜久水', '天の紅', '天賦', '伝心', '南部関',
  '七福神 日本酒', '菱正宗', '桃川', '田酒 特別純米', '安東水軍', '陸奥男山 純米大吟醸',
  '如空', '龍泉', '安倍取水', '呉春',
]

// 次に母数を増やす際はここに新しいキーワードを追記する
// (実行後は SEARCHED_KEYWORDS 側へ移し、重複クエリを避けること)。
const PENDING_KEYWORDS = []

// 実行時に問い合わせるキーワード。母数をさらに増やす際は PENDING_KEYWORDS を
// 更新し、消化したキーワードは SEARCHED_KEYWORDS へ移す運用とする。
const KEYWORDS = PENDING_KEYWORDS
const SORTS = ['standard', '-reviewCount', '-reviewAverage']
const PAGES = [1, 2]
const HITS_PER_CALL = 30

const VOLUME_HINT = /(\d{2,4}\s*m?l|一升|四合|300ml|720ml|1800ml)/i

// セット/飲み比べ/ふるさと納税等は除外せず、タグを付けて残す
// (該当銘柄単体としてではなく、関連おすすめ等の別導線での紹介に使える)
const SET_HINT = /飲み比べ|飲みくらべ|セット|詰め合わせ|ふるさと納税|福袋|ギフトセット|飲み較べ/

// 「本醸造」等は調味料(本醸造しょうゆ等)にも一致するため、明らかに酒類でない
// 商品名だけは除外する。日本酒/清酒を明示している場合は誤検知として救済する。
const NON_SAKE_HINT = /醤油|味噌|みりん|めんつゆ|ポン酢|食用酢|だし醤油/
const SAKE_CONFIRM_HINT = /日本酒|清酒|地酒|純米|吟醸|醸造酒|酒蔵/

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  const sakes = require(path.join(DATA_DIR, 'sakes.json'))
  const existingNames = sakes.map((s) => s.name)

  const byItemUrl = new Map()

  // 前回までの収集結果があれば読み込み、母数を維持したまま追加分だけ取得する
  if (fs.existsSync(OUT_JSON)) {
    const prev = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'))
    for (const c of prev.candidates || []) {
      byItemUrl.set(c.itemUrl, {
        itemName: c.itemName,
        shopName: c.shopName,
        itemPrice: c.itemPrice,
        reviewCount: c.reviewCount,
        reviewAverage: c.reviewAverage,
        mediumImageUrls: c.imageUrl ? [{ imageUrl: c.imageUrl }] : [],
        itemUrl: c.itemUrl,
        affiliateUrl: c.affiliateUrl,
        matchedKeywords: c.matchedKeywords ? c.matchedKeywords.split('|') : [],
      })
    }
    console.log(`前回結果を読み込み: ${byItemUrl.size}件から継続\n`)
  }

  const totalQueries = KEYWORDS.length * SORTS.length * PAGES.length
  let queryIndex = 0

  for (const keyword of KEYWORDS) {
    for (const sort of SORTS) {
      for (const page of PAGES) {
        queryIndex++
        try {
          const items = await searchRakutenItems(keyword, { hits: HITS_PER_CALL, sort, page })
          for (const item of items) {
            const existing = byItemUrl.get(item.itemUrl)
            if (existing) {
              if (!existing.matchedKeywords.includes(keyword)) existing.matchedKeywords.push(keyword)
            } else {
              byItemUrl.set(item.itemUrl, { ...item, matchedKeywords: [keyword] })
            }
          }
          console.log(
            `[ok] (${queryIndex}/${totalQueries}) ${keyword} / sort=${sort} / page=${page} -> ${items.length}件 (累計候補 ${byItemUrl.size}件)`
          )
        } catch (err) {
          console.error(`[error] (${queryIndex}/${totalQueries}) ${keyword} / sort=${sort} / page=${page}: ${err.message}`)
        }
        await sleep(1000)
      }
    }
  }

  const filtered = Array.from(byItemUrl.values()).filter(
    (item) => !NON_SAKE_HINT.test(item.itemName) || SAKE_CONFIRM_HINT.test(item.itemName)
  )

  const candidates = filtered.map((item) => {
    const alreadyOnSite = existingNames.some(
      (name) => item.itemName.includes(name) || name.includes(item.itemName)
    )
    return {
      itemName: item.itemName,
      shopName: item.shopName,
      itemPrice: item.itemPrice,
      reviewCount: item.reviewCount,
      reviewAverage: item.reviewAverage,
      hasVolumeHint: VOLUME_HINT.test(item.itemName),
      isSetOrGift: SET_HINT.test(item.itemName),
      alreadyOnSite,
      matchedKeywords: item.matchedKeywords.join('|'),
      imageUrl: (item.mediumImageUrls && item.mediumImageUrls[0] && item.mediumImageUrls[0].imageUrl) || '',
      itemUrl: item.itemUrl,
      affiliateUrl: item.affiliateUrl,
    }
  })

  // 未掲載のものを優先表示できるよう並べ替え(セット/ギフトも除外はせず含めたまま)
  candidates.sort((a, b) => {
    if (a.alreadyOnSite !== b.alreadyOnSite) return a.alreadyOnSite ? 1 : -1
    if (a.isSetOrGift !== b.isSetOrGift) return a.isSetOrGift ? 1 : -1
    return (b.reviewCount || 0) - (a.reviewCount || 0)
  })

  fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify({ fetchedAt: new Date().toISOString(), count: candidates.length, candidates }, null, 2) + '\n'
  )

  const header = [
    'itemName', 'shopName', 'itemPrice', 'reviewCount', 'reviewAverage',
    'hasVolumeHint', 'isSetOrGift', 'alreadyOnSite', 'matchedKeywords', 'imageUrl', 'itemUrl', 'affiliateUrl',
  ]
  const rows = [header.join(',')]
  for (const c of candidates) {
    rows.push(header.map((key) => csvEscape(c[key])).join(','))
  }
  fs.writeFileSync(OUT_CSV, rows.join('\n') + '\n')

  const newCount = candidates.filter((c) => !c.alreadyOnSite).length
  const setCount = candidates.filter((c) => c.isSetOrGift).length
  const singleCount = candidates.filter((c) => !c.isSetOrGift && !c.alreadyOnSite).length
  console.log(`\n候補総数: ${candidates.length}件`)
  console.log(`  うち未掲載と思われるもの: ${newCount}件`)
  console.log(`  うちセット/ギフト系(タグのみ・除外なし): ${setCount}件`)
  console.log(`  うち未掲載かつ単品らしきもの: ${singleCount}件`)
  console.log(`書き出し完了: ${OUT_JSON}`)
  console.log(`書き出し完了: ${OUT_CSV}`)
}

main()
