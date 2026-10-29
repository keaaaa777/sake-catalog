import Link from 'next/link'
import { REGIONS, PREFECTURE_SLUGS } from '@/lib/types'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'
import { SCENES, SCENE_IDS } from '@/lib/scenes'
import { PAIRING_CATEGORIES, PAIRING_CATEGORY_IDS } from '@/lib/pairing'
import { CLASSIFICATIONS, CLASSIFICATION_SLUG_IDS } from '@/lib/classification'
import { GUIDE_ARTICLES } from '@/lib/guides'
import { getOverviewStats } from '@/lib/siteStats'
import {
  getSakesByPrefecture,
  getSakesByScene,
  getSakesByPairing,
  getSakesByClassificationSlug,
} from '@/lib/data'
import { isIndexableSake } from '@/lib/indexability'
import type { Sake } from '@/lib/types'

// トップの没入型ヒーローの下に置く索引。サーバーで描画し、各一覧ページへの
// クロール可能な内部リンクを提供する。掲載条件はサイトマップと同じ(インデックス可能な銘柄を含むこと)。
const hasIndexable = (sakes: Sake[]) => sakes.some(isIndexableSake)

export default function HomeSakeIndex() {
  const stats = getOverviewStats()
  const regions = Object.entries(REGIONS)
    .map(([region, prefs]) => ({
      region,
      prefs: prefs.filter((pref) => PREFECTURE_SLUGS[pref] && hasIndexable(getSakesByPrefecture(pref))),
    }))
    .filter((r) => r.prefs.length > 0)
  const scenes = SCENE_IDS.filter((id) => hasIndexable(getSakesByScene(id)))
  const pairings = PAIRING_CATEGORY_IDS.filter((id) => hasIndexable(getSakesByPairing(id)))
  const classifications = CLASSIFICATION_SLUG_IDS.filter((id) => hasIndexable(getSakesByClassificationSlug(id)))
  const latestGuides = [...GUIDE_ARTICLES]
    .sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt))
    .slice(0, 6)

  return (
    <section id="sake-index" className="sake-index" aria-labelledby="sake-index-title">
      <div className="sake-index__inner">
        <header className="sake-index__intro">
          <p className="sake-index__eyebrow">SAKE INDEX</p>
          <h2 id="sake-index-title" className="sake-index__title">産地と味わいから、日本酒をひもとく</h2>
          <p className="sake-index__lead">
            雫 SAKE SELECTは、全国{stats.prefectureCount}都道府県・{stats.breweryCount}の酒蔵から
            {stats.sakeCount}銘柄の日本酒を、産地・味わい・飲むシーン・合わせる料理で探せるカタログです。
            気になる入口から、あなたの一杯を見つけてください。
          </p>
        </header>

        <div className="sake-index__block">
          <div className="sake-index__head">
            <h3 className="sake-index__heading">地域から探す</h3>
            <Link href="/area" className="sake-index__more">都道府県一覧 →</Link>
          </div>
          <div className="sake-index__regions">
            {regions.map(({ region, prefs }) => (
              <div key={region} className="sake-index__region">
                <span className="sake-index__region-name">{region}</span>
                <div className="sake-index__chips">
                  {prefs.map((pref) => (
                    <Link key={pref} href={`/area/${PREFECTURE_SLUGS[pref]}`} className="sake-index__chip">
                      {pref}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sake-index__block">
          <div className="sake-index__head">
            <h3 className="sake-index__heading">味わいから探す</h3>
            <Link href="/type" className="sake-index__more">4つの味わいとは →</Link>
          </div>
          <div className="sake-index__cards">
            {FLAVOR_TYPE_IDS.map((id) => {
              const flavor = FLAVOR_TYPES[id]
              return (
                <Link key={id} href={`/type/${id}`} className="sake-index__card">
                  <span className="sake-index__card-title">
                    {flavor.label}
                    <span className="sake-index__card-eng">{flavor.eng}</span>
                  </span>
                  <span className="sake-index__card-desc">{flavor.desc}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="sake-index__grid">
          {scenes.length > 0 && (
            <div className="sake-index__block">
              <div className="sake-index__head">
                <h3 className="sake-index__heading">シーンから探す</h3>
              </div>
              <div className="sake-index__chips">
                {scenes.map((id) => (
                  <Link key={id} href={`/scene/${id}`} className="sake-index__chip">{SCENES[id].label}</Link>
                ))}
              </div>
            </div>
          )}
          {pairings.length > 0 && (
            <div className="sake-index__block">
              <div className="sake-index__head">
                <h3 className="sake-index__heading">料理から探す</h3>
              </div>
              <div className="sake-index__chips">
                {pairings.map((id) => (
                  <Link key={id} href={`/pairing/${id}`} className="sake-index__chip">{PAIRING_CATEGORIES[id].label}</Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {classifications.length > 0 && (
          <div className="sake-index__block">
            <div className="sake-index__head">
              <h3 className="sake-index__heading">特定名称から探す</h3>
              <Link href="/classification" className="sake-index__more">分類の違い →</Link>
            </div>
            <div className="sake-index__chips">
              {classifications.map((id) => (
                <Link key={id} href={`/classification/${id}`} className="sake-index__chip">
                  {CLASSIFICATIONS[id].label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="sake-index__block">
          <div className="sake-index__head">
            <h3 className="sake-index__heading">日本酒の読みもの</h3>
            <Link href="/guide" className="sake-index__more">ガイド一覧 →</Link>
          </div>
          <ul className="sake-index__guides">
            {latestGuides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guide/${guide.slug}`} className="sake-index__guide">
                  <span className="sake-index__guide-title">{guide.title}</span>
                  <span className="sake-index__guide-desc">{guide.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="sake-index__cta">
          <Link href="/diagnosis" className="content-mall-btn">1分でわかる日本酒診断を受ける</Link>
          <Link href="/ranking" className="content-back-link">注目の日本酒を見る →</Link>
        </div>
      </div>
    </section>
  )
}
