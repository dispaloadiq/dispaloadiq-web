/**
 * useDispatcherRelationship — OO ↔ Dispatcher hiring relationship management
 *
 * Features:
 * - React Query for caching + background refresh
 * - Fetch active dispatcher for an OO
 * - Fetch all OO clients for a dispatcher
 * - Request (hire) a dispatcher — creates relationship + opens a conversation
 * - Update relationship status (pending → active, active → terminated, etc.)
 * - Relationship performance stats
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { DispatcherRelationship } from '../database.types'

// ── Exported interfaces ───────────────────────────────────────────────────────

export interface RelationshipWithDetails extends DispatcherRelationship {
  dispatcher?: {
    id:         string
    full_name:  string
    avatar_url: string | null
    city:       string | null
    state:      string | null
    phone:      string | null
  }
  dispatcher_profile?: {
    trust_score:       number
    availability:      string
    avg_rpm:           number
    on_time_rate:      number
    specialties:       string[]
    response_time_min: number
  }
  owner_op?: {
    id:              string
    full_name:       string
    avatar_url:      string | null
    city:            string | null
    state:           string | null
    phone:           string | null
    equipment_types: string[]
    mc_number:       string | null
  }
}

export interface RelationshipStats {
  total_loads:   number
  avg_rpm:       number
  on_time_rate?: number
  days_active:   number | null
  commission_rate: number
}

// ── Async fetch functions ─────────────────────────────────────────────────────

async function fetchMyDispatcher(ownerOpId: string): Promise<RelationshipWithDetails | null> {
  const { data, error } = await supabase
    .from('dispatcher_relationships')
    .select(`
      *,
      dispatcher:user_profiles!dispatcher_relationships_dispatcher_id_fkey(
        id, full_name, avatar_url, city, state, phone
      ),
      dispatcher_profile:dispatcher_profiles!dispatcher_relationships_dispatcher_id_fkey(
        trust_score, availability, avg_rpm, on_time_rate, specialties, response_time_min
      )
    `)
    .eq('owner_op_id', ownerOpId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw error
  return data as RelationshipWithDetails | null
}

async function fetchMyClients(dispatcherId: string): Promise<RelationshipWithDetails[]> {
  const { data, error } = await supabase
    .from('dispatcher_relationships')
    .select(`
      *,
      owner_op:user_profiles!dispatcher_relationships_owner_op_id_fkey(
        id, full_name, avatar_url, city, state, phone, equipment_types, mc_number
      )
    `)
    .eq('dispatcher_id', dispatcherId)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as RelationshipWithDetails[]
}

async function requestDispatcher(
  ownerOpId:      string,
  dispatcherId:   string,
  commissionRate: number,
  message?:       string
): Promise<DispatcherRelationship> {
  // Check if a relationship already exists (any status)
  const { data: existing, error: checkErr } = await supabase
    .from('dispatcher_relationships')
    .select('id, status')
    .eq('owner_op_id', ownerOpId)
    .eq('dispatcher_id', dispatcherId)
    .maybeSingle()

  if (checkErr) throw checkErr
  const existingRow = existing as { id: string; status: string } | null
  if (existingRow) {
    throw new Error(
      existingRow.status === 'terminated'
        ? 'Previous relationship was terminated. Please contact the dispatcher directly to reconnect.'
        : 'Already connected'
    )
  }

  // Create the relationship
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: relationship, error: insertErr } = await (supabase.from('dispatcher_relationships') as any)
    .insert({
      owner_op_id:       ownerOpId,
      dispatcher_id:     dispatcherId,
      status:            'pending',
      commission_rate:   commissionRate,
      total_loads:       0,
      avg_rpm:           0,
      started_at:        null,
      ended_at:          null,
      min_rpm_guarantee: null,
      contract_id:       null,
      notes:             null,
    })
    .select()
    .single()

  if (insertErr) throw insertErr

  // Open a conversation between the two users and send first message
  try {
    // Find or create conversation
    const { data: convCheck } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant_a.eq.${ownerOpId},participant_b.eq.${dispatcherId}),` +
        `and(participant_a.eq.${dispatcherId},participant_b.eq.${ownerOpId})`
      )
      .maybeSingle()

    let conversationId: string

    const convCheckRow = convCheck as { id: string } | null
    if (convCheckRow?.id) {
      conversationId = convCheckRow.id
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newConv, error: convErr } = await (supabase.from('conversations') as any)
        .insert({
          participant_a:   ownerOpId,
          participant_b:   dispatcherId,
          unread_a:        0,
          unread_b:        1,   // dispatcher has 1 unread (the intro message)
          last_message:    null,
          last_message_at: null,
        })
        .select('id')
        .single()

      if (convErr) throw convErr
      conversationId = newConv.id
    }

    // Send the intro message
    const introContent = message?.trim() ||
      `Hi! I'd like to work with you as my dispatcher. Commission rate: ${commissionRate}%.`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('messages') as any)
      .insert({
        conversation_id: conversationId,
        sender_id:       ownerOpId,
        content:         introContent,
        message_type:    'system',
        metadata:        { relationship_id: (relationship as DispatcherRelationship).id },
        read:            false,
      })
  } catch {
    // Conversation creation is best-effort — don't roll back the relationship
    console.warn('[useDispatcherRelationship] Could not create intro conversation:', arguments)
  }

  return relationship as DispatcherRelationship
}

async function updateRelationship(
  id:      string,
  updates: Partial<DispatcherRelationship>
): Promise<DispatcherRelationship> {
  const payload: Record<string, unknown> = { ...updates }

  // Auto-set timestamps on status transitions
  if (updates.status === 'active' && !updates.started_at) {
    payload.started_at = new Date().toISOString()
  }
  if (updates.status === 'terminated' && !updates.ended_at) {
    payload.ended_at = new Date().toISOString()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('dispatcher_relationships') as any)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as DispatcherRelationship
}

async function fetchRelationshipStats(relationshipId: string): Promise<RelationshipStats> {
  const { data, error } = await supabase
    .from('dispatcher_relationships')
    .select('total_loads, avg_rpm, commission_rate, started_at')
    .eq('id', relationshipId)
    .single()

  if (error) throw error

  const row = data as { total_loads: number; avg_rpm: number; commission_rate: number; started_at: string | null }

  const daysActive = row.started_at
    ? Math.floor(
        (Date.now() - new Date(row.started_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null

  return {
    total_loads:     row.total_loads,
    avg_rpm:         row.avg_rpm,
    commission_rate: row.commission_rate,
    days_active:     daysActive,
  }
}

// ── React Query hooks ─────────────────────────────────────────────────────────

/**
 * Get the active dispatcher relationship for this owner-operator.
 * Returns null if the OO has no active dispatcher.
 */
export function useMyDispatcher(ownerOpId: string | undefined) {
  return useQuery({
    queryKey: ['my-dispatcher', ownerOpId],
    queryFn:  () => fetchMyDispatcher(ownerOpId!),
    enabled:  !!ownerOpId,
    staleTime: 1000 * 60,   // 1 min — relationship status doesn't flip constantly
  })
}

/**
 * Get all OO clients (active + pending) for this dispatcher.
 */
export function useMyClients(dispatcherId: string | undefined) {
  return useQuery({
    queryKey: ['my-clients', dispatcherId],
    queryFn:  () => fetchMyClients(dispatcherId!),
    enabled:  !!dispatcherId,
    staleTime: 1000 * 60,
  })
}

/**
 * Mutation: OO sends a hire request to a dispatcher.
 * Creates a dispatcher_relationships row (status: 'pending') and opens a conversation.
 */
export function useRequestDispatcher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      ownerOpId,
      dispatcherId,
      commissionRate,
      message,
    }: {
      ownerOpId:      string
      dispatcherId:   string
      commissionRate: number
      message?:       string
    }) => requestDispatcher(ownerOpId, dispatcherId, commissionRate, message),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['my-dispatcher',   variables.ownerOpId] })
      qc.invalidateQueries({ queryKey: ['my-clients',      variables.dispatcherId] })
      qc.invalidateQueries({ queryKey: ['conversations',   variables.ownerOpId] })
    },
  })
}

/**
 * Mutation: update relationship status, commission, notes, etc.
 * Automatically sets started_at / ended_at on status transitions.
 */
export function useUpdateRelationship() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id:      string
      updates: Partial<DispatcherRelationship>
    }) => updateRelationship(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-dispatcher'] })
      qc.invalidateQueries({ queryKey: ['my-clients'] })
    },
  })
}

/**
 * Performance stats for a specific OO ↔ Dispatcher pairing.
 */
export function useRelationshipStats(relationshipId: string | undefined) {
  return useQuery({
    queryKey: ['relationship-stats', relationshipId],
    queryFn:  () => fetchRelationshipStats(relationshipId!),
    enabled:  !!relationshipId,
    staleTime: 1000 * 60 * 5,   // 5 min — aggregate stats don't need to be instant
  })
}
