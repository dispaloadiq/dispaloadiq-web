// Deno Edge Function — Truckstop ITS API proxy
// Deploy: supabase functions deploy search-truckstop

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function getTruckstopToken(clientId: string, clientSecret: string): Promise<string> {
  const resp = await fetch('https://api.truckstop.com/api/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!resp.ok) {
    throw new Error(`Truckstop OAuth failed: ${resp.status}`)
  }
  const data = await resp.json()
  return data.access_token as string
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const clientId     = Deno.env.get('TRUCKSTOP_CLIENT_ID')
  const clientSecret = Deno.env.get('TRUCKSTOP_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ loads: [], error: 'TRUCKSTOP_CLIENT_ID / TRUCKSTOP_CLIENT_SECRET not configured' }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body  = await req.json()
    const token = await getTruckstopToken(clientId, clientSecret)

    const resp = await fetch('https://api.truckstop.com/api/v2/loads/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('Truckstop API error:', resp.status, errText)
      return new Response(
        JSON.stringify({ loads: [], error: `Truckstop API error: ${resp.status}` }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const data = await resp.json()
    // Map to our normalized Load shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loads = (data.loads ?? data.results ?? []).map((l: any) => ({
      id:            l.loadId ?? l.id ?? String(Math.random()),
      from:          l.origin?.city ?? l.originCity ?? '',
      fromState:     l.origin?.state ?? l.originState ?? '',
      to:            l.destination?.city ?? l.destinationCity ?? '',
      toState:       l.destination?.state ?? l.destinationState ?? '',
      miles:         l.miles ?? l.loadedMiles ?? 0,
      rate:          l.ratePerMile ?? (l.totalRate && l.miles ? l.totalRate / l.miles : 0),
      payout:        l.totalRate ?? l.payout ?? 0,
      type:          l.equipmentType ?? 'Dry Van',
      weight:        l.weight ? `${Number(l.weight).toLocaleString()} lbs` : '—',
      pickup:        l.pickupDate ?? l.availableDate ?? '',
      deliveryDate:  l.deliveryDate ?? '',
      broker:        l.company?.name ?? l.broker ?? 'Truckstop',
      brokerRating:  l.brokerRating ?? 4.1,
      brokerCredit:  'A' as const,
      brokerPayDays: l.paymentTerms ?? 30,
      aiScore:       Math.round(Math.min((l.ratePerMile ?? 2.0) * 40, 100)),
      dho:           l.deadheadMiles ?? 0,
      status:        'Available' as const,
      age:           l.postAge ?? 'Unknown',
      ref:           l.loadId ?? l.referenceNumber ?? '',
      commodity:     l.commodity ?? 'General Freight',
      rateHistory:   [],
      source:        'truckstop' as const,
    }))

    return new Response(
      JSON.stringify({ loads }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('search-truckstop error:', err)
    return new Response(
      JSON.stringify({ loads: [], error: String(err) }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
