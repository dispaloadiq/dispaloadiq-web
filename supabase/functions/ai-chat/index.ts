/**
 * DispaLoadIQ — AI Chat Edge Function
 * Proxies Claude API calls securely from the Supabase backend.
 * Deployed as: supabase functions deploy ai-chat
 *
 * Security: ANTHROPIC_API_KEY stays server-side only.
 * RLS: only authenticated users can call this function.
 */

import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0'

const anthropic = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
})

// System prompt — context about DispaLoadIQ for the AI
const SYSTEM_PROMPT = `You are an AI assistant built into DispaLoadIQ, an AI-powered trucking operations platform. You help truckers, dispatchers, fleet owners, and shippers with:

- Load board: finding loads, understanding rates, bidding strategies
- FMCSA regulations: HOS rules, MC/DOT compliance, driver qualifications
- Route planning: optimizing routes, fuel stops, rest stops
- Freight rates: market rates by lane, RPM calculations, rate negotiation
- Documents: BOL, POD, rate confirmations, contracts
- Business operations: invoicing, IFTA filing, fuel optimization
- Dispatching: load matching, carrier vetting, broker relationships
- Claims: cargo damage claims, insurance procedures

Be concise, practical, and specific. Use trucking industry terminology. When discussing rates, always mention current market context. If you don't have real-time data, say so clearly and provide general guidance.

You have access to the user's context through the conversation. Always be helpful, accurate, and professional.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: Message[]
  userRole?: string
  context?: string   // optional: current page context (e.g. "viewing load LD-123")
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify JWT (Supabase auth)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body: RequestBody = await req.json()
    const { messages, userRole, context } = body

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build system context
    let systemPrompt = SYSTEM_PROMPT
    if (userRole) systemPrompt += `\n\nThe user's role is: ${userRole}.`
    if (context)  systemPrompt += `\n\nCurrent context: ${context}`

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',   // fast + cheap for chat
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    })

    const reply = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    return new Response(JSON.stringify({ reply, usage: response.usage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('ai-chat error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
