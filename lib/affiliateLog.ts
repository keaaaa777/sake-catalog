import { createClient, SupabaseClient } from '@supabase/supabase-js'

interface ClickLogEntry {
  sakeId: string
  sakeSlug: string
  mall: string
  sourceFlow: string
}

let client: SupabaseClient | null | undefined

// 環境変数が無い場合はログ記録をスキップするだけにし、
// リダイレクト自体(購入導線)を絶対に壊さないようにする。
function getClient(): SupabaseClient | null {
  if (client !== undefined) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = url && key ? createClient(url, key) : null
  return client
}

export async function logAffiliateClick(entry: ClickLogEntry): Promise<void> {
  console.log('[affiliate_click]', JSON.stringify(entry))

  const supabase = getClient()
  if (!supabase) return

  try {
    const { error } = await supabase.from('affiliate_clicks').insert({
      sake_id: entry.sakeId,
      sake_slug: entry.sakeSlug,
      mall: entry.mall,
      source_flow: entry.sourceFlow,
    })
    if (error) console.error('[affiliate_click] insert failed:', error.message)
  } catch (err) {
    console.error('[affiliate_click] unexpected error:', err)
  }
}
