import { supabase } from '@/lib/supabaseClient'
import { Sake } from '@/lib/types'

export async function getSakeList(prefecture?: string): Promise<Sake[]> {
  let query = supabase.from('sakes').select('*')

  if (prefecture) {
    query = query.eq('prefecture', prefecture)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function searchSake(filters: {
  prefecture?: string
  drySweet?: 'dry' | 'balanced' | 'sweet'
}): Promise<Sake[]> {
  let query = supabase.from('sakes').select('*')

  if (filters.prefecture) {
    query = query.eq('prefecture', filters.prefecture)
  }

  if (filters.drySweet === 'dry') {
    query = query.lt('dry_sweet_index', -2)
  } else if (filters.drySweet === 'sweet') {
    query = query.gt('dry_sweet_index', 3)
  } else if (filters.drySweet === 'balanced') {
    query = query.gte('dry_sweet_index', -2).lte('dry_sweet_index', 3)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
