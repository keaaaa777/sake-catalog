# 日本酒イメージ背景

生成したイメージ画像はこのフォルダーへ配置します。

## 登録済み背景

| ファイル | テーマ |
| --- | --- |
| `sharp-silver-glint.webp` | キレ・辛口 |
| `clear-mountain-spring.webp` | 清流・透明感 |
| `elegant-floral-aroma.webp` | 華やかな香り |
| `golden-rice-field.webp` | 米の旨味 |
| `aged-brewery-cellar.webp` | 熟成・濃醇 |
| `snow-country-mountains.webp` | 雪国・寒造り |
| `nara-deer-temple.webp` | 奈良 |
| `moonlit-japanese-coast.webp` | 海・魚介 |
| `pear-apple-aroma.webp` | 果実香 |
| `fresh-yuzu-citrus.webp` | 柑橘・酸味 |
| `misty-cedar-forest.webp` | 杉・木香 |
| `warm-sake-hearth.webp` | 燗酒 |
| `autumn-maple-water.webp` | 秋・ひやおろし |
| `crescent-moon-lake.webp` | 調和・静けさ |
| `volcanic-mineral-earth.webp` | 火山・大地 |
| `kyoto-bamboo-temple.webp` | 京都 |

共通背景の自動割り当ては `lib/sake-backgrounds.ts` で管理します。商品データに
`backgroundImageUrl` を指定すると、自動割り当てより優先されます。

推奨仕様:

- WebP または AVIF
- 横長 1600 x 900 px（中央付近に重要な要素を置かない）
- 1ファイル 300 KB程度まで
- ファイル名は半角英数字とハイフン（例: `sharp-silver-blade.webp`）
- 実在する商品ラベルや瓶を描かない

商品への登録例 (`data/sakes.json`):

```json
"backgroundImageUrl": "/images/sake-backgrounds/sharp-silver-blade.webp",
"backgroundImageAlt": "冷たい水面を走る銀色の光のイメージ"
```

`backgroundImageUrl` がない商品には、産地・説明文・飲用温度・味わいタイプから共通背景が自動で割り当てられます。
