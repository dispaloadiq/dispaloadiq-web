// Deno Edge Function — DAT Authority API proxy
// Deploy: supabase functions deploy search-dat

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function getDatToken(clientId: string, clientSecret: string): Promise<string> {
  const resp = await fetch('https://identity.dat.com/access/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!resp.ok) {
    throw new Error(`DAT OAuth failed: ${resp.status}`)
  }
  const data = await resp.json()
  return data.access_token as string
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const clientId     = Deno.env.get('DAT_CLIENT_ID')
  const clientSecret = Deno.env.get('DAT_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ loads: [], error: 'DAT_CLIENT_ID / DAT_CLIENT_SECRET not configured' }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body  = await req.json()
    const token = await getDatToken(clientId, clientSecret)

    const resp = await fetch('https://freight.api.dat.com/load/v2/loads', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('DAT API error:', resp.status, errText)
      return new Response(
        JSON.stringify({ loads: [], error: `DAT API error: ${resp.status}` }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const data = await resp.json()
    // Map to our normalized Load shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loads = (data.matchedLoads ?? data.loads ?? []).map((l: any) => ({
      id:            l.loadId ?? l.id ?? String(Math.random()),
      from:          l.origin?.city ?? '',
      fromState:     l.origin?.stateProv ?? '',
      to:            l.destination?.city ?? '',
      toState:       l.destination?.stateProv ?? '',
      miles:         l.loadedMiles ?? l.miles ?? 0,
      rate:          l.rate?.rateUsd ? l.rate.rateUsd / Math.max(l.loadedMiles ?? 1, 1) : 0,
      payout:        l.rate?.rateUsd ?? 0,
      type:          l.equipmentType ?? 'Dry Van',
      weight:        l.weight ? `${Number(l.weight).toLocaleString()} lbs` : '—',
      pickup:        l.earliestAvailability ?? '',
      deliveryDate:  l.latestArrival ?? '',
      broker:        l.posterInfo?.companyName ?? 'DAT',
      brokerRating:  4.2,
      brokerCredit:  'A' as const,
      brokerPayDays: l.creditDays ?? 30,
      aiScore:       Math.round(Math.min(((l.rate?.rateUsd ?? 0) / Math.max(l.loadedMiles ?? 1, 1)) * 40, 100)),
      dho:           l.dhMiles ?? 0,
      status:        'Available' as const,
      age:           l.postingAge ?? 'Unknown',
      ref:           l.loadId ?? '',
      commodity:     l.commodity ?? 'General Freight',
      rateHistory:   [],
      source:        'dat' as const,
    }))

    return new Response(
      JSON.stringify({ loads }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('search-dat error:', err)
    return new Response(
      JSON.stringify({ loads: [], error: String(err) }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
