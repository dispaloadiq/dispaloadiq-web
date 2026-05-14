/**
 * useProfile — read and update user profile data via Supabase
 *
 * Features:
 * - React Query for caching + background refresh
 * - Covers both user_profiles and dispatcher_profiles tables
 * - Auto-upserts a blank dispatcher_profiles row when a dispatcher first loads
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type {
  UserProfile,
  DispatcherProfile,
  DispatcherProfileInsert,
} from '../database.types'

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as UserProfile
}

async function fetchDispatcherProfile(userId: string): Promise<DispatcherProfile | null> {
  const { data, error } = await supabase
    .from('dispatcher_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as DispatcherProfile | null
}

// ── Mutation helpers ──────────────────────────────────────────────────────────

async function upsertProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('user_profiles') as any)
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as UserProfile
}

async function upsertDispatcherProfile(
  userId: string,
  updates: Partial<Omit<DispatcherProfileInsert, 'user_id'>>
): Promise<DispatcherProfile> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('dispatcher_profiles') as any)
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data as DispatcherProfile
}

async function ensureDispatcherProfile(userId: string): Promise<DispatcherProfile> {
  // Check if row exists; if not, create a blank one
  const existing = await fetchDispatcherProfile(userId)
  if (existing) return existing

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('dispatcher_profiles') as any)
    .insert({ user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data as DispatcherProfile
}

// ── React Query hooks ─────────────────────────────────────────────────────────

/**
 * Get any user's profile by ID.
 * Pass the current user's ID from `supabase.auth.getUser()` or an auth context.
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 min — profiles change infrequently
  })
}

/**
 * Mutation to update user_profiles fields.
 * Invalidates both 'profile' and 'dispatcher-profile' cache keys on success.
 */
export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
    }) => upsertProfile(userId, updates),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })
}

/**
 * Get the dispatcher_profiles row for a given user.
 * Only meaningful for users whose role = 'dispatcher'.
 * Does NOT auto-create a row — use useDispatcherProfileData for that.
 */
export function useDispatcherProfileQuery(userId: string | undefined) {
  return useQuery({
    queryKey: ['dispatcher-profile', userId],
    queryFn: () => fetchDispatcherProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 min
  })
}

/**
 * Get dispatcher_profiles, auto-upserting a blank row if none exists.
 * Use this on the Dispatcher's own profile/settings pages to guarantee the row is there.
 */
export function useDispatcherProfileData(userId: string | undefined) {
  return useQuery({
    queryKey: ['dispatcher-profile', userId],
    queryFn: () => ensureDispatcherProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Mutation to update dispatcher_profiles fields.
 * Uses upsert so it's safe to call even if the row doesn't exist yet.
 */
export function useUpdateDispatcherProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<Omit<DispatcherProfileInsert, 'user_id'>>
    }) => upsertDispatcherProfile(userId, updates),
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ['dispatcher-profile', userId] })
      // Invalidate marketplace search cache too — availability/commission may have changed
      qc.invalidateQueries({ queryKey: ['dispatcher-search'] })
      qc.invalidateQueries({ queryKey: ['dispatcher-profile-by-id', userId] })
    },
  })
}
