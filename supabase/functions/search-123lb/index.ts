// Deno Edge Function — 123Loadboard proxy
// Deploy: supabase functions deploy search-123lb

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const apiKey = Deno.env.get('LB123_API_KEY')
  if (!apiKey) {
    return new Response(
      JSON.stringify({ loads: [], error: 'LB123_API_KEY not configured' }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()

    const resp = await fetch('https://api.123loadboard.com/v3/loads/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error('123LB API error:', resp.status, errText)
      return new Response(
        JSON.stringify({ loads: [], error: `123LB API error: ${resp.status}` }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }

    const data = await resp.json()
    // Map to our normalized Load shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loads = (data.loads ?? data.results ?? []).map((l: any) => ({
      id:            l.id ?? l.loadId ?? String(Math.random()),
      from:          l.originCity ?? l.origin?.city ?? '',
      fromState:     l.originState ?? l.origin?.state ?? '',
      to:            l.destinationCity ?? l.destination?.city ?? '',
      toState:       l.destinationState ?? l.destination?.state ?? '',
      miles:         l.miles ?? l.mileage ?? 0,
      rate:          l.ratePerMile ?? l.rate ?? 0,
      payout:        l.totalPay ?? l.payout ?? 0,
      type:          l.equipmentType ?? l.truckType ?? 'Dry Van',
      weight:        l.weight ? `${Number(l.weight).toLocaleString()} lbs` : '—',
      pickup:        l.pickupDate ?? l.shipDate ?? '',
      deliveryDate:  l.deliveryDate ?? '',
      broker:        l.companyName ?? l.broker ?? '123Loadboard',
      brokerRating:  l.brokerRating ?? 4.0,
      brokerCredit:  l.creditScore ?? 'A',
      brokerPayDays: l.payDays ?? 30,
      aiScore:       Math.round((l.ratePerMile ?? 2.0) * 40),
      dho:           l.deadheadMiles ?? 0,
      status:        'Available' as const,
      age:           l.age ?? 'Unknown',
      ref:           l.referenceNumber ?? l.id ?? '',
      commodity:     l.commodity ?? 'General Freight',
      rateHistory:   [],
      source:        '123lb' as const,
    }))

    return new Response(
      JSON.stringify({ loads }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('search-123lb error:', err)
    return new Response(
      JSON.stringify({ loads: [], error: String(err) }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }
})
