/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl  = (import.meta.env.VITE_SUPABASE_URL  ?? '') as string
const supabaseKey  = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '') as string

// In demo mode (no .env), we create a no-op client that won't throw at import time.
// Real operations will fail gracefully and the app falls back to mock data.
const isDemoMode = !supabaseUrl || !supabaseKey

export const supabase = createClient<Database>(
  isDemoMode ? 'https://placeholder.supabase.co' : supabaseUrl,
  isDemoMode ? 'placeholder-key' : supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
)

export default supabase
