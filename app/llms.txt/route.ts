import { GUIDE_ARTICLES } from '@/lib/guides'
import { getOverviewStats } from '@/lib/siteStats'
import { FLAVOR_TYPES, FLAVOR_TYPE_IDS } from '@/lib/flavor'

// AIアシスタント向けのサイト概要(llms.txt)。ガイド記事や掲載数はデータから生成し、
// 記事を追加しても内容が古くならないようにする。
export const dynamic = 'force-static'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sake-catalog-japan.vercel.app'

export function GET() {
  const stats = getOverviewStats()
  const guides = [...GUIDE_ARTICLES].sort((a, b) =>
    (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt)
  )

  const lines = [
    '# 雫 SAKE SELECT',
    '',
    `> 全国${stats.prefectureCount}都道府県・${stats.breweryCount}の酒蔵から${stats.sakeCount}銘柄の日本酒を掲載し、産地・味わい・飲むシーン・合わせる料理から好みの一本を探せる日本酒カタログ。銘柄情報は酒蔵公式サイトなどの出典と確認日を記録して管理しています。`,
    '',
    '日本語で運営しています。英語版は /en 以下にあります。本サイトは楽天アフィリエイトプログラムを利用しています。20歳未満の飲酒は法律で禁じられています。',
    '',
    '## 探す',
    '',
    `- [1分でわかる日本酒診断](${SITE_URL}/diagnosis): 5つの質問から、薫酒・爽酒・醇酒・熟酒の味わいと飲むシーンを組み合わせた8タイプのどれに当たるかを判定し、おすすめの銘柄を紹介`,
    `- [地域から探す](${SITE_URL}/area): 都道府県別の日本酒一覧。各県の掲載銘柄の傾向(味わいタイプ・特定名称・平均日本酒度)と酒蔵の一覧`,
    ...FLAVOR_TYPE_IDS.map(
      (id) => `- [${FLAVOR_TYPES[id].label}(${FLAVOR_TYPES[id].kana})の日本酒](${SITE_URL}/type/${id}): ${FLAVOR_TYPES[id].desc}`
    ),
    `- [特定名称から探す](${SITE_URL}/classification): 純米大吟醸・純米・本醸造など特定名称別の一覧`,
    `- [注目の日本酒](${SITE_URL}/ranking): 編集部が選んだ注目銘柄`,
    `- [データで見る日本酒](${SITE_URL}/data): 掲載銘柄の都道府県別・特定名称別・味わいタイプ別の集計`,
    '',
    '## 日本酒ガイド',
    '',
    ...guides.map((g) => `- [${g.title}](${SITE_URL}/guide/${g.slug}): ${g.description}`),
    '',
    '## 運営情報',
    '',
    `- [サイトについて](${SITE_URL}/about)`,
    `- [編集方針](${SITE_URL}/editorial-policy): 情報の出典・確認方法`,
    `- [広告掲載ポリシー](${SITE_URL}/disclosure)`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
