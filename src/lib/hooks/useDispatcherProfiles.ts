/**
 * useDispatcherProfiles — dispatcher marketplace search and profiles
 *
 * Features:
 * - React Query for caching + background refresh
 * - Supabase Realtime subscription → marketplace updates when dispatcher changes availability
 * - Paginated search with rich filter set
 * - Full profile fetch (includes user_profiles join)
 * - Reviews fetch + submit mutation
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type {
  DispatcherProfileWithUser,
  DispatcherReview,
} from '../database.types'

// ── Filter interface ──────────────────────────────────────────────────────────

export interface DispatcherSearchFilters {
  specialties?: string[]          // ['Flatbed', 'Dry Van']
  states?: string[]               // active states
  minTrustScore?: number
  maxCommission?: number
  minRpm?: number
  availability?: 'available' | 'busy' | 'limited'
  verifiedOnly?: boolean
  search?: string                 // text search on bio, name
  page?: number                   // 0-indexed
  pageSize?: number               // default 20
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchDispatcherSearch(
  filters: DispatcherSearchFilters = {}
): Promise<{ items: DispatcherProfileWithUser[]; total: number }> {
  const pageSize = filters.pageSize ?? 20
  const page     = filters.page     ?? 0
  const from     = page * pageSize
  const to       = from + pageSize - 1

  let q = supabase
    .from('dispatcher_profiles')
    .select(
      '*, user_profiles(full_name, avatar_url, city, state, is_verified)',
      { count: 'exact' }
    )
    .order('trust_score', { ascending: false })
    .range(from, to)

  if (filters.availability) {
    q = q.eq('availability', filters.availability)
  }
  if (filters.minTrustScore != null) {
    q = q.gte('trust_score', filters.minTrustScore)
  }
  if (filters.maxCommission != null) {
    q = q.lte('commission_rate', filters.maxCommission)
  }
  if (filters.minRpm != null) {
    q = q.gte('min_rpm', filters.minRpm)
  }
  if (filters.verifiedOnly) {
    q = q.in('verification_status', ['verified', 'certified'])
  }
  // Array-overlap filters (Postgres &&)
  if (filters.specialties && filters.specialties.length > 0) {
    q = q.overlaps('specialties', filters.specialties)
  }
  if (filters.states && filters.states.length > 0) {
    q = q.overlaps('active_states', filters.states)
  }

  const { data, error, count } = await q

  if (error) throw error

  // Client-side text search on name/bio (Supabase free tier doesn't support FTS joins easily)
  let items = (data ?? []) as DispatcherProfileWithUser[]
  if (filters.search) {
    const term = filters.search.toLowerCase()
    items = items.filter(d => {
      const name = d.user_profiles?.full_name?.toLowerCase() ?? ''
      const bio  = d.bio?.toLowerCase() ?? ''
      return name.includes(term) || bio.includes(term)
    })
  }

  return { items, total: count ?? 0 }
}

async function fetchDispatcherProfileById(userId: string): Promise<DispatcherProfileWithUser> {
  const { data, error } = await supabase
    .from('dispatcher_profiles')
    .select('*, user_profiles(full_name, avatar_url, city, state, is_verified)')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data as DispatcherProfileWithUser
}

async function fetchDispatcherReviews(dispatcherId: string): Promise<DispatcherReview[]> {
  const { data, error } = await supabase
    .from('dispatcher_reviews')
    .select('*')
    .eq('dispatcher_id', dispatcherId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as DispatcherReview[]
}

async function submitReview(payload: {
  dispatcher_id: string
  reviewer_id: string
  relationship_id?: string
  rating: number
  text?: string
  loads_completed?: number
  avg_rpm_achieved?: number
}): Promise<DispatcherReview> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('dispatcher_reviews') as any)
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as DispatcherReview
}

// ── React Query hooks ─────────────────────────────────────────────────────────

/**
 * Paginated dispatcher marketplace search.
 * Includes Realtime subscription so availability changes appear immediately.
 */
export function useDispatcherSearch(filters: DispatcherSearchFilters = {}) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['dispatcher-search', filters],
    queryFn:  () => fetchDispatcherSearch(filters),
    staleTime: 1000 * 30,  // 30s — availability changes matter
  })

  // Realtime: invalidate search results when any dispatcher profile changes
  useEffect(() => {
    const channel = supabase
      .channel('dispatcher-profiles-marketplace')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dispatcher_profiles' },
        () => {
          qc.invalidateQueries({ queryKey: ['dispatcher-search'] })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return query
}

/**
 * Full dispatcher profile by user ID, with user_profiles join.
 * Used on individual profile pages.
 */
export function useDispatcherProfileById(userId: string | undefined) {
  return useQuery({
    queryKey: ['dispatcher-profile-by-id', userId],
    queryFn:  () => fetchDispatcherProfileById(userId!),
    enabled:  !!userId,
    staleTime: 1000 * 60, // 1 min
  })
}

/**
 * All reviews for a dispatcher, ordered newest first.
 */
export function useDispatcherReviews(dispatcherId: string | undefined) {
  return useQuery({
    queryKey: ['dispatcher-reviews', dispatcherId],
    queryFn:  () => fetchDispatcherReviews(dispatcherId!),
    enabled:  !!dispatcherId,
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

/**
 * Mutation: submit a review for a dispatcher.
 * RLS enforces one review per (dispatcher, reviewer) pair — the DB will reject duplicates.
 */
export function useSubmitReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: submitReview,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['dispatcher-reviews', variables.dispatcher_id] })
      qc.invalidateQueries({ queryKey: ['dispatcher-profile-by-id', variables.dispatcher_id] })
      // Trust score is recalculated by DB trigger, so invalidate search too
      qc.invalidateQueries({ queryKey: ['dispatcher-search'] })
    },
  })
}
