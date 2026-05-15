/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Fallback to hardcoded values so auth works even if env vars aren't baked in at build time
// The anon key is safe to expose — it's a public client key with Row Level Security
const SUPABASE_URL = 'https://skkiwqlnaxqethbhkclw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2l3cWxuYXhxZXRoYmhrY2x3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDQ1MDQsImV4cCI6MjA5NDIyMDUwNH0.PT9N8o9AXgAUD4k1vad1cW_lc3ZGIUcp-gvyGbxTMQI'

const supabaseUrl  = (import.meta.env.VITE_SUPABASE_URL  || SUPABASE_URL) as string
const supabaseKey  = (import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY) as string

const isDemoMode = false

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
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
