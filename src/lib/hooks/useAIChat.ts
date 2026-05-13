/**
 * useAIChat — sends messages to Claude via Supabase Edge Function
 * The API key is kept server-side in the Edge Function; never exposed to client.
 */

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../supabase'

export interface ChatMessage {
  id:      string
  role:    'user' | 'assistant'
  content: string
  ts:      number
}

interface SendParams {
  messages: { role: 'user' | 'assistant'; content: string }[]
  userRole?: string
  context?:  string
}

async function callAI(params: SendParams): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: params,
  })

  if (error) throw error
  if (data?.error) throw new Error(data.error)

  return data.reply as string
}

export function useAIChat(userRole?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your DispaLoadIQ AI assistant. I can help you with:\n\n• Finding loads and understanding rates\n• FMCSA regulations and compliance\n• Route planning and fuel optimization\n• Invoicing, IFTA, and documents\n• Dispatch strategies and broker relationships\n\nWhat can I help you with today?`,
      ts: Date.now(),
    },
  ])

  const mutation = useMutation({
    mutationFn: callAI,
    onSuccess: (reply) => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: reply, ts: Date.now() },
      ])
    },
    onError: (err: Error) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
          ts: Date.now(),
        },
      ])
    },
  })

  const send = (text: string, context?: string) => {
    if (!text.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      ts: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])

    // Build conversation history (exclude welcome message for API)
    const history = [...messages, userMsg]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    mutation.mutate({ messages: history, userRole, context })
  }

  const clear = () => setMessages(prev => [prev[0]]) // keep welcome

  return {
    messages,
    send,
    clear,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
