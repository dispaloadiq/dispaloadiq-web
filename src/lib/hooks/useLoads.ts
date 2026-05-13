/**
 * useLoads — real-time load board via Supabase
 *
 * Features:
 * - React Query for caching + background refresh
 * - Supabase Realtime subscription → new loads appear instantly
 * - Filters: equipment type, origin/dest state, date range
 * - Mutations: post load, bid on load, update status
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { Load, LoadInsert } from '../database.types'

export interface LoadFilters {
  equipmentType?: string
  originState?:   string
  destState?:     string
  pickupFrom?:    string   // ISO date
  pickupTo?:      string
  minRate?:       number
  maxRate?:       number
  hazmat?:        boolean
  search?:        string   // commodity, broker, city
}

// ── Fetch loads ───────────────────────────────────────────────────────────────
async function fetchLoads(filters: LoadFilters = {}): Promise<Load[]> {
  let q = supabase
    .from('loads')
    .select('*')
    .in('status', ['posted', 'bidding'])
    .order('created_at', { ascending: false })
    .limit(200)

  if (filters.equipmentType) q = q.eq('equipment_type', filters.equipmentType)
  if (filters.originState)   q = q.eq('origin_state',   filters.originState)
  if (filters.destState)     q = q.eq('destination_state', filters.destState)
  if (filters.pickupFrom)    q = q.gte('pickup_date',   filters.pickupFrom)
  if (filters.pickupTo)      q = q.lte('pickup_date',   filters.pickupTo)
  if (filters.minRate)       q = q.gte('rate',          filters.minRate)
  if (filters.maxRate)       q = q.lte('rate',          filters.maxRate)
  if (filters.hazmat != null) q = q.eq('hazmat',        filters.hazmat)
  if (filters.search) {
    const s = `%${filters.search}%`
    q = q.or(`commodity.ilike.${s},origin_city.ilike.${s},destination_city.ilike.${s},broker_name.ilike.${s}`)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

// ── Fetch my loads (shipper) ──────────────────────────────────────────────────
async function fetchMyLoads(shipperId: string): Promise<Load[]> {
  const { data, error } = await supabase
    .from('loads')
    .select('*')
    .eq('shipper_id', shipperId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// ── Post a load (shipper creates) ─────────────────────────────────────────────
async function postLoad(payload: LoadInsert): Promise<Load> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('loads') as any)
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Load
}

// ── Update load ───────────────────────────────────────────────────────────────
async function updateLoad(id: string, updates: Partial<LoadInsert>): Promise<Load> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('loads') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Load
}

// ── Place a bid ───────────────────────────────────────────────────────────────
async function placeBid(loadId: string, bidderId: string, amount: number, message?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('load_bids') as any)
    .upsert({ load_id: loadId, bidder_id: bidderId, amount, message, status: 'pending' })

  if (error) throw error
}

// ── React Query hooks ─────────────────────────────────────────────────────────

/** Load board — all available loads with optional filters */
export function useLoads(filters: LoadFilters = {}) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['loads', filters],
    queryFn: () => fetchLoads(filters),
    staleTime: 1000 * 15,   // 15s — loads change fast
  })

  // Supabase Realtime: auto-refresh when loads table changes
  useEffect(() => {
    const channel = supabase
      .channel('loads-board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loads' },
        () => {
          // Invalidate so React Query refetches
          qc.invalidateQueries({ queryKey: ['loads'] })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return query
}

/** My loads — loads posted by this shipper */
export function useMyLoads(shipperId: string | undefined) {
  return useQuery({
    queryKey: ['my-loads', shipperId],
    queryFn: () => fetchMyLoads(shipperId!),
    enabled: !!shipperId,
  })
}

/** Mutation: post a new load */
export function usePostLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: postLoad,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
      qc.invalidateQueries({ queryKey: ['my-loads'] })
    },
  })
}

/** Mutation: update load status / fields */
export function useUpdateLoad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LoadInsert> }) =>
      updateLoad(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}

/** Mutation: place a bid on a load */
export function usePlaceBid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ loadId, bidderId, amount, message }: {
      loadId: string; bidderId: string; amount: number; message?: string
    }) => placeBid(loadId, bidderId, amount, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loads'] })
    },
  })
}
