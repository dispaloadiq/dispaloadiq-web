import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { Trip } from '../database.types'

async function fetchTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .or(`driver_id.eq.${userId},dispatcher_id.eq.${userId},company_id.eq.${userId}`)
    .order('pickup_date', { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

async function createTrip(payload: Omit<Trip, 'id' | 'net_profit' | 'created_at' | 'updated_at'>): Promise<Trip> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('trips') as any)
    .insert(payload).select().single()
  if (error) throw error
  return data as Trip
}

async function updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('trips') as any)
    .update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Trip
}

export function useTrips(userId: string | undefined) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['trips', userId],
    queryFn: () => fetchTrips(userId!),
    enabled: !!userId,
  })

  // Realtime: live location / status updates
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`trips-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        () => qc.invalidateQueries({ queryKey: ['trips', userId] })
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, qc])

  return query
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useUpdateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Trip> }) =>
      updateTrip(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}
