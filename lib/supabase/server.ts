// Create a Supabase client suitable for server components and route handlers
import { createClient } from '@supabase/supabase-js'

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing Supabase env vars')
  }
  return createClient(url, anon, {
    auth: { persistSession: false },
  })
}
