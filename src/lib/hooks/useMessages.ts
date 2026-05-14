/**
 * useMessages — real-time chat between two users via Supabase Realtime
 *
 * Features:
 * - React Query for caching + background refresh
 * - Supabase Realtime subscriptions → new messages appear instantly
 * - Conversations list with unread counts and other-participant info
 * - find-or-create conversation helper
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { Conversation, Message, MessageInsert } from '../database.types'

// ── Exported interfaces ───────────────────────────────────────────────────────

export interface ConversationWithParticipant {
  id: string
  otherParticipant: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  }
  last_message: string | null
  last_message_at: string | null
  unread_count: number   // the count for the current user
  created_at: string
}

// Raw shape returned by the joined select
interface ConversationRow extends Conversation {
  participant_a_profile: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  } | null
  participant_b_profile: {
    id: string
    full_name: string
    avatar_url: string | null
    role: string
  } | null
}

export interface MessageWithSender extends Message {
  sender: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

// ── Helper ────────────────────────────────────────────────────────────────────

/** Determine which participant is "me" and return the other one with the right unread count */
export function normalizeConversation(
  conv: ConversationRow,
  myId: string
): ConversationWithParticipant {
  const iAmA = conv.participant_a === myId

  const otherProfile = iAmA ? conv.participant_b_profile : conv.participant_a_profile
  const unread_count  = iAmA ? conv.unread_a : conv.unread_b

  return {
    id: conv.id,
    otherParticipant: {
      id:         otherProfile?.id        ?? (iAmA ? conv.participant_b : conv.participant_a),
      full_name:  otherProfile?.full_name ?? 'Unknown',
      avatar_url: otherProfile?.avatar_url ?? null,
      role:       otherProfile?.role       ?? 'owner-op',
    },
    last_message:    conv.last_message,
    last_message_at: conv.last_message_at,
    unread_count,
    created_at: conv.created_at,
  }
}

// ── Async fetch functions ─────────────────────────────────────────────────────

async function fetchConversations(userId: string): Promise<ConversationWithParticipant[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_a_profile:user_profiles!conversations_participant_a_fkey(id, full_name, avatar_url, role),
      participant_b_profile:user_profiles!conversations_participant_b_fkey(id, full_name, avatar_url, role)
    `)
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order('last_message_at', { ascending: false })

  if (error) throw error
  const rows = (data ?? []) as unknown as ConversationRow[]
  return rows.map(row => normalizeConversation(row, userId))
}

async function fetchMessages(conversationId: string): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, sender:user_profiles!messages_sender_id_fkey(id, full_name, avatar_url)`)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) throw error
  return (data ?? []) as unknown as MessageWithSender[]
}

async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: Message['message_type'] = 'text',
  metadata?: MessageInsert['metadata']
): Promise<Message> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('messages') as any)
    .insert({
      conversation_id: conversationId,
      sender_id:       senderId,
      content,
      message_type:    messageType,
      metadata:        metadata ?? null,
      read:            false,
    })
    .select()
    .single()

  if (error) throw error
  return data as Message
}

async function markRead(conversationId: string, userId: string): Promise<void> {
  // First figure out which participant slot the user occupies
  const { data: conv, error: fetchErr } = await supabase
    .from('conversations')
    .select('participant_a, participant_b')
    .eq('id', conversationId)
    .single()

  if (fetchErr) throw fetchErr

  const convRow = conv as { participant_a: string; participant_b: string } | null
  const isParticipantA = convRow?.participant_a === userId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('conversations') as any)
    .update(isParticipantA ? { unread_a: 0 } : { unread_b: 0 })
    .eq('id', conversationId)

  if (error) throw error
}

async function findOrCreateConversation(myId: string, otherId: string): Promise<Conversation> {
  // Check both participant orderings
  const { data: existing, error: searchErr } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant_a.eq.${myId},participant_b.eq.${otherId}),` +
      `and(participant_a.eq.${otherId},participant_b.eq.${myId})`
    )
    .maybeSingle()

  if (searchErr) throw searchErr

  if (existing) return existing as Conversation

  // Create a new conversation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: created, error: insertErr } = await (supabase.from('conversations') as any)
    .insert({
      participant_a:   myId,
      participant_b:   otherId,
      unread_a:        0,
      unread_b:        0,
      last_message:    null,
      last_message_at: null,
    })
    .select()
    .single()

  if (insertErr) throw insertErr
  return created as Conversation
}

// ── React Query hooks ─────────────────────────────────────────────────────────

/**
 * List all conversations for the current user, with other-participant info and
 * unread counts. Includes a Realtime subscription so unread badges update live.
 */
export function useConversations(userId: string | undefined) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['conversations', userId],
    queryFn:  () => fetchConversations(userId!),
    enabled:  !!userId,
    staleTime: 1000 * 30,
  })

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`conversations-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'conversations',
          // Supabase Realtime doesn't support OR filters in server-side filters,
          // so we subscribe to the whole table and filter on the client.
        },
        (payload) => {
          const row = payload.new as Conversation | undefined
          if (
            row?.participant_a === userId ||
            row?.participant_b === userId
          ) {
            qc.invalidateQueries({ queryKey: ['conversations', userId] })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, qc])

  return query
}

/**
 * Messages in a conversation, newest-last. Includes a Realtime subscription
 * so new messages appear instantly without polling.
 */
export function useMessages(conversationId: string | undefined) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn:  () => fetchMessages(conversationId!),
    enabled:  !!conversationId,
    staleTime: 1000 * 10,
  })

  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Invalidate so React Query refetches the full list (with sender join)
          qc.invalidateQueries({ queryKey: ['messages', conversationId] })
          // Also bump the conversation list so last_message / unread updates
          qc.invalidateQueries({ queryKey: ['conversations'] })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, qc])

  return query
}

/** Mutation: send a message into a conversation */
export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      senderId,
      content,
      messageType,
      metadata,
    }: {
      conversationId: string
      senderId:       string
      content:        string
      messageType?:   Message['message_type']
      metadata?:      MessageInsert['metadata']
    }) => sendMessage(conversationId, senderId, content, messageType, metadata),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

/** Mutation: mark all messages in a conversation as read for the current user */
export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string
      userId:         string
    }) => markRead(conversationId, userId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['conversations', variables.userId] })
    },
  })
}

/** Find an existing conversation between two users, or create one. */
export function useOrCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ myId, otherId }: { myId: string; otherId: string }) =>
      findOrCreateConversation(myId, otherId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['conversations', variables.myId] })
    },
  })
}
