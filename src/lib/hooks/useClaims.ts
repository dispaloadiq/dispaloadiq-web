import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { Claim, ClaimMessage } from '../database.types'

// ── Fetch ──────────────────────────────────────────────────────────────────────
async function fetchClaims(userId: string): Promise<Claim[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('claimant_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

async function fetchClaimMessages(claimId: string): Promise<ClaimMessage[]> {
  const { data, error } = await supabase
    .from('claim_messages')
    .select('*')
    .eq('claim_id', claimId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ── Mutations ─────────────────────────────────────────────────────────────────
async function createClaim(payload: Omit<Claim, 'id' | 'created_at' | 'updated_at'>): Promise<Claim> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('claims') as any)
    .insert(payload).select().single()
  if (error) throw error
  return data as Claim
}

async function updateClaim(id: string, updates: Partial<Claim>): Promise<Claim> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('claims') as any)
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Claim
}

async function addClaimMessage(payload: Omit<ClaimMessage, 'id' | 'created_at'>): Promise<ClaimMessage> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('claim_messages') as any)
    .insert(payload).select().single()
  if (error) throw error
  return data as ClaimMessage
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useClaims(userId: string | undefined) {
  return useQuery({
    queryKey: ['claims', userId],
    queryFn: () => fetchClaims(userId!),
    enabled: !!userId,
  })
}

export function useClaimMessages(claimId: string | undefined) {
  return useQuery({
    queryKey: ['claim-messages', claimId],
    queryFn: () => fetchClaimMessages(claimId!),
    enabled: !!claimId,
  })
}

export function useCreateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createClaim,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  })
}

export function useUpdateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Claim> }) =>
      updateClaim(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['claims'] }),
  })
}

export function useAddClaimMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addClaimMessage,
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ['claim-messages', vars.claim_id] }),
  })
}
