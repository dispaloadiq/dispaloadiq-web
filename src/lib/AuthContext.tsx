import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { UserProfile } from './database.types'

interface AuthState {
  session:  Session | null
  user:     User    | null
  profile:  UserProfile | null
  loading:  boolean
}

interface AuthContextValue extends AuthState {
  signUp:  (email: string, password: string, role: UserProfile['role'], fullName: string) => Promise<{ error: Error | null }>
  signIn:  (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user:    null,
    profile: null,
    loading: true,
  })

  async function fetchProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) { console.error('fetchProfile:', error); return null }
    return data
  }

  async function refreshProfile() {
    if (!state.user) return
    const profile = await fetchProfile(state.user.id)
    setState(s => ({ ...s, profile }))
  }

  useEffect(() => {
    // 1. Get initial session (with timeout fallback)
    const timeout = setTimeout(() => {
      setState(s => s.loading ? { ...s, loading: false } : s)
    }, 5000)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timeout)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({ session, user: session.user, profile, loading: false })
      } else {
        setState({ session: null, user: null, profile: null, loading: false })
      }
    }).catch(() => {
      clearTimeout(timeout)
      setState({ session: null, user: null, profile: null, loading: false })
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({ session, user: session.user, profile, loading: false })
        } else {
          setState({ session: null, user: null, profile: null, loading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(
    email: string,
    password: string,
    role: UserProfile['role'],
    fullName: string
  ): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
      },
    })
    return { error: error as Error | null }
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
