import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[PrismaX] Supabase env vars missing — running in local-only mode.')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseReady = !!supabase

/**
 * Upload a profile image to the `avatars` storage bucket.
 * Returns the public URL, a local object URL (fallback), or null.
 */
export async function uploadAvatar(file, contributorId) {
  if (!supabase) {
    // Offline fallback: return a blob URL so the UI still works
    return URL.createObjectURL(file)
  }

  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${contributorId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) {
    console.error('[Supabase] Upload error:', error)
    return URL.createObjectURL(file)
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Insert a new contributor row.
 */
export async function insertContributor(payload) {
  if (!supabase) return { data: payload, error: null, offline: true }
  return supabase.from('contributors').insert([payload]).select().single()
}

/**
 * Fetch all community contributors (non-seed) ordered by join_date ascending.
 */
export async function fetchContributors() {
  if (!supabase) return { data: [], error: null }
  return supabase
    .from('contributors')
    .select('*')
    .order('join_date', { ascending: true })
}
