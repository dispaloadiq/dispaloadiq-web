import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ReturnLoad = {
  id: string
  origin: string
  dest: string
  deadhead: number
  distance: number
  rate: number
  rpm: number
  broker: string
  source: 'DAT' | '123LB' | 'Truckstop'
  pickup: string
  delivery: string
  badge?: 'Best RPM' | 'Fastest Return' | 'Top Broker'
}

type RoundTripHistory = {
  id: string
  outbound: string
  return: string
  plannedGross: number
  actualGross: number | null
  date: string
  miles: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const RETURN_LOADS: ReturnLoad[] = [
  {
    id: 'rl-1', origin: 'Dallas, TX', dest: 'Chicago, IL',
    deadhead: 0, distance: 921, rate: 2_850, rpm: 3.09,
    broker: 'CH Robinson', source: 'DAT', pickup: 'Tomorrow 8AM', delivery: '+1 day',
    badge: 'Best RPM',
  },
  {
    id: 'rl-2', origin: 'Dallas, TX', dest: 'Kansas City, MO',
    deadhead: 0, distance: 484, rate: 1_400, rpm: 2.89,
    broker: 'Echo Global', source: '123LB', pickup: 'Tomorrow 10AM', delivery: 'Same day',
    badge: 'Fastest Return',
  },
  {
    id: 'rl-3', origin: 'Dallas, TX', dest: 'Indianapolis, IN',
    deadhead: 0, distance: 936, rate: 2_600, rpm: 2.78,
    broker: 'Coyote', source: 'DAT', pickup: 'Tomorrow 6AM', delivery: '+1 day',
    badge: 'Top Broker',
  },
  {
    id: 'rl-4', origin: 'Ft Worth, TX', dest: 'St Louis, MO',
    deadhead: 18, distance: 630, rate: 1_650, rpm: 2.62,
    broker: 'TQL', source: 'Truckstop', pickup: 'Tomorrow 12PM', delivery: '+1 day',
  },
  {
    id: 'rl-5', origin: 'Dallas, TX', dest: 'Memphis, TN',
    deadhead: 0, distance: 452, rate: 1_050, rpm: 2.32,
    broker: 'Arrive', source: '123LB', pickup: 'Tomorrow 2PM', delivery: 'Same day',
  },
  {
    id: 'rl-6', origin: 'Dallas, TX', dest: 'Nashville, TN',
    deadhead: 0, distance: 663, rate: 1_490, rpm: 2.25,
    broker: 'Landstar', source: 'DAT', pickup: 'Tomorrow 7AM', delivery: '+1 day',
  },
]

const HISTORY: RoundTripHistory[] = [
  { id: 'RT-0041', outbound: 'Chicago → Dallas',     return: 'Dallas → Chicago',       plannedGross: 5_800, actualGross: 5_650, date: 'May 8',  miles: 1_848 },
  { id: 'RT-0038', outbound: 'Chicago → Memphis',    return: 'Memphis → Chicago',      plannedGross: 3_100, actualGross: 3_100, date: 'May 3',  miles: 1_072 },
  { id: 'RT-0035', outbound: 'Chicago → Nashville',  return: 'Nashville → Kansas City', plannedGross: 3_400, actualGross: null,  date: 'Apr 28', miles: 1_400 },
  { id: 'RT-0030', outbound: 'Chicago → Atlanta',    return: 'Atlanta → Chicago',      plannedGross: 6_200, actualGross: 6_450, date: 'Apr 20', miles: 1_740 },
  { id: 'RT-0027', outbound: 'Chicago → Houston',    return: 'Houston → St Louis',     plannedGross: 5_100, actualGross: 4_950, date: 'Apr 14', miles: 1_960 },
]

const EQUIPMENT_OPTIONS = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker']
const HOMEBASE_OPTIONS  = ['Chicago, IL', 'Dallas, TX', 'Houston, TX', 'Atlanta, GA', 'Los Angeles, CA']
const DEADHEAD_OPTIONS  = ['25 mi', '50 mi', '75 mi', '100 mi', '150 mi']

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const FUEL_RATE = 0.50 // $/mi estimate

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  'Best RPM':       { bg: '#F0FFF4', color: '#16A34A' },
  'Fastest Return': { bg: '#EFF6FF', color: '#2563EB' },
  'Top Broker':     { bg: '#FFF7ED', color: '#D97706' },
}

const SOURCE_STYLE: Record<string, { bg: string; color: string }> = {
  DAT:       { bg: '#EDE9FE', color: '#7C3AED' },
  '123LB':   { bg: '#FEF2F2', color: '#DC2626' },
  Truckstop: { bg: '#F0F9FF', color: '#0369A1' },
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BackhaulFinderPage() {
  const [originCity,   setOriginCity]   = useState('Chicago, IL')
  const [destCity,     setDestCity]     = useState('Dallas, TX')
  const [outRate,      setOutRate]      = useState(2_950)
  const [outDistance,  setOutDistance]  = useState(924)
  const [equipment,    setEquipment]    = useState('Dry Van')
  const [pickup,       setPickup]       = useState('2026-05-14')
  const [homeBase,     setHomeBase]     = useState('Chicago, IL')
  const [maxDeadhead,  setMaxDeadhead]  = useState('50 mi')
  const [minRpm,       setMinRpm]       = useState('2.00')
  const [showResults,  setShowResults]  = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<number>(0)

  const outRpm       = outDistance > 0 ? outRate / outDistance : 0
  const fuelOut      = Math.round(outDistance * FUEL_RATE)
  const netOut       = outRate - fuelOut

  const retLoad      = RETURN_LOADS[selectedReturn]
  const fuelRet      = Math.round(retLoad.distance * FUEL_RATE)
  const netRet       = retLoad.rate - fuelRet
  const totalMiles   = outDistance + retLoad.distance
  const totalGross   = outRate + retLoad.rate
  const totalFuel    = fuelOut + fuelRet
  const totalNet     = netOut + netRet
  const totalRpm     = totalMiles > 0 ? (totalNet / totalMiles) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1A2535' }}>
            Smart Backhaul Finder ↩️
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Plan your round trip before you book. Find the best return load now.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#A0AEC0' }}>Live board connected</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
        </div>
      </div>

      {/* ── Step 1 — Route Input ───────────────────────────────────────────── */}
      <div className="card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>Step 1 — Outbound Load Details</h2>

        {/* Outbound row */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Outbound Load
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={originCity}
              onChange={e => setOriginCity(e.target.value)}
              placeholder="Origin City"
              style={inputStyle}
            />
            <span style={{ fontSize: 18, color: '#4BAED4', fontWeight: 700 }}>→</span>
            <input
              type="text"
              value={destCity}
              onChange={e => setDestCity(e.target.value)}
              placeholder="Destination City"
              style={inputStyle}
            />
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Distance (mi)</label>
              <input
                type="number"
                value={outDistance}
                onChange={e => setOutDistance(parseInt(e.target.value) || 0)}
                style={{ ...inputStyle, width: 100 }}
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Rate ($)</label>
              <input
                type="number"
                value={outRate}
                onChange={e => setOutRate(parseInt(e.target.value) || 0)}
                style={{ ...inputStyle, width: 100 }}
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Equipment</label>
              <select value={equipment} onChange={e => setEquipment(e.target.value)} style={selectStyle}>
                {EQUIPMENT_OPTIONS.map(eq => <option key={eq}>{eq}</option>)}
              </select>
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Pickup Date</label>
              <input
                type="date"
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                style={{ ...inputStyle, width: 140 }}
              />
            </div>
          </div>
          {/* Live RPM indicator */}
          {outDistance > 0 && (
            <div style={{ marginTop: 8, display: 'flex', gap: 20, fontSize: 12 }}>
              <span style={{ color: '#718096' }}>
                RPM: <strong style={{ color: outRpm >= 2.5 ? '#22C55E' : outRpm >= 2.0 ? '#D97706' : '#DC2626' }}>${outRpm.toFixed(2)}/mi</strong>
              </span>
              <span style={{ color: '#718096' }}>
                Fuel est: <strong style={{ color: '#DC2626' }}>-{fmt(fuelOut)}</strong>
              </span>
              <span style={{ color: '#718096' }}>
                Net: <strong style={{ color: '#4BAED4' }}>{fmt(netOut)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Return preferences row */}
        <div style={{ padding: '14px 16px', background: '#F7FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Return Preferences
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Return to (Home Base)</label>
              <select value={homeBase} onChange={e => setHomeBase(e.target.value)} style={selectStyle}>
                {HOMEBASE_OPTIONS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Max Deadhead from Dest</label>
              <select value={maxDeadhead} onChange={e => setMaxDeadhead(e.target.value)} style={selectStyle}>
                {DEADHEAD_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Min RPM ($)</label>
              <input
                type="number"
                value={minRpm}
                step="0.10"
                min="1.00"
                max="5.00"
                onChange={e => setMinRpm(e.target.value)}
                style={{ ...inputStyle, width: 90 }}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => setShowResults(true)}
            style={{
              padding: '11px 28px', background: '#4BAED4', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(75,174,212,0.35)',
            }}
          >
            Find Backhaul Loads
          </button>
          {showResults && (
            <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>
              6 loads found · sorted by RPM
            </span>
          )}
        </div>
      </div>

      {/* ── Step 2 — Results ───────────────────────────────────────────────── */}
      {showResults && (
        <>
          {/* Summary strip */}
          <div style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #1A2535 0%, #2D3F55 100%)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 13, color: '#A0AEC0' }}>Round trip:</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
              {originCity} → {destCity}
            </span>
            <span style={{ fontSize: 13, color: '#4BAED4', fontWeight: 700 }}>
              ({outDistance.toLocaleString()} mi, {fmt(outRate)}, ${outRpm.toFixed(2)}/mi)
            </span>
            <span style={{ fontSize: 18, color: '#4BAED4' }}>+</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
              {destCity} → {homeBase}
            </span>
            <span style={{ fontSize: 13, color: '#4BAED4', fontWeight: 700 }}>({retLoad.distance.toLocaleString()} mi)</span>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#A0AEC0' }}>Total round trip</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#22C55E' }}>
                {totalMiles.toLocaleString()} mi · {fmt(totalGross)}
              </div>
            </div>
          </div>

          {/* Return load cards */}
          <div>
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Step 2 — Best Return Loads
              <span style={{ marginLeft: 8, fontSize: 11, color: '#718096', fontWeight: 400 }}>
                Click a card to select and see combined analysis
              </span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {RETURN_LOADS.map((load, idx) => {
                const isSelected = selectedReturn === idx
                const badgeMeta = load.badge ? BADGE_STYLE[load.badge] : null
                const srcMeta   = SOURCE_STYLE[load.source]
                const loadFuel  = Math.round(load.distance * FUEL_RATE)
                const loadNet   = load.rate - loadFuel
                return (
                  <div
                    key={load.id}
                    onClick={() => setSelectedReturn(idx)}
                    style={{
                      padding: '14px 16px',
                      background: isSelected ? '#EFF6FF' : '#FAFAFA',
                      border: isSelected ? '2px solid #4BAED4' : '1.5px solid #E2E8F0',
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: isSelected ? '0 0 0 3px rgba(75,174,212,0.15)' : 'none',
                    }}
                  >
                    {/* Card header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>
                          {load.origin.split(',')[0]} → {load.dest.split(',')[0]}
                        </div>
                        <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                          via {load.broker}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {load.badge && badgeMeta && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            background: badgeMeta.bg, color: badgeMeta.color,
                          }}>
                            {load.badge === 'Best RPM' ? '⭐ ' : load.badge === 'Fastest Return' ? '⚡ ' : '🏆 '}
                            {load.badge}
                          </span>
                        )}
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: srcMeta.bg, color: srcMeta.color,
                        }}>
                          {load.source}
                        </span>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                      {[
                        { label: 'Deadhead', value: load.deadhead === 0 ? '0 mi' : `${load.deadhead} mi`, color: load.deadhead === 0 ? '#22C55E' : '#D97706' },
                        { label: 'Distance',  value: `${load.distance.toLocaleString()} mi`, color: '#4BAED4' },
                        { label: 'Rate',       value: fmt(load.rate), color: '#1A2535' },
                        { label: 'RPM',        value: `$${load.rpm.toFixed(2)}/mi`, color: load.rpm >= 2.8 ? '#22C55E' : load.rpm >= 2.4 ? '#D97706' : '#DC2626' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', padding: '6px 4px', background: '#fff', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 1 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Pickup/delivery + net */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 11, color: '#718096' }}>
                        Pickup: <strong>{load.pickup}</strong> · Delivery: <strong>{load.delivery}</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>{fmt(loadNet)} net</div>
                        <div style={{ fontSize: 9, color: '#A0AEC0' }}>after fuel est</div>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ marginTop: 8, padding: '5px 10px', background: '#4BAED4', borderRadius: 6, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Selected for analysis below</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Step 3 — Round Trip Comparison ──────────────────────────────── */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Step 3 — Round Trip Analysis
              <span style={{ marginLeft: 8, fontSize: 11, color: '#718096', fontWeight: 400 }}>
                {originCity.split(',')[0]} → {destCity.split(',')[0]} + {retLoad.origin.split(',')[0]} → {retLoad.dest.split(',')[0]}
              </span>
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ width: 140 }}></th>
                    <th style={{ textAlign: 'right' }}>Outbound</th>
                    <th style={{ textAlign: 'right' }}>Return</th>
                    <th style={{ textAlign: 'right', background: '#F0F9FF', color: '#0369A1' }}>Round Trip</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: 'Route',
                      out: `${originCity.split(',')[0]} → ${destCity.split(',')[0]}`,
                      ret: `${retLoad.origin.split(',')[0]} → ${retLoad.dest.split(',')[0]}`,
                      total: 'Combined',
                      isText: true,
                    },
                    {
                      label: 'Distance',
                      out: `${outDistance.toLocaleString()} mi`,
                      ret: `${retLoad.distance.toLocaleString()} mi`,
                      total: `${totalMiles.toLocaleString()} mi`,
                      isText: true,
                    },
                    {
                      label: 'Gross Rate',
                      out: fmt(outRate),
                      ret: fmt(retLoad.rate),
                      total: fmt(totalGross),
                      totalColor: '#4BAED4',
                    },
                    {
                      label: 'Fuel Est.',
                      out: `-${fmt(fuelOut)}`,
                      ret: `-${fmt(fuelRet)}`,
                      total: `-${fmt(totalFuel)}`,
                      totalColor: '#DC2626',
                    },
                    {
                      label: 'Net Revenue',
                      out: fmt(netOut),
                      ret: fmt(netRet),
                      total: fmt(totalNet),
                      totalColor: '#22C55E',
                      bold: true,
                    },
                    {
                      label: 'RPM (net)',
                      out: `$${outDistance > 0 ? (netOut / outDistance).toFixed(2) : '—'}/mi`,
                      ret: `$${retLoad.distance > 0 ? (netRet / retLoad.distance).toFixed(2) : '—'}/mi`,
                      total: `$${totalRpm.toFixed(2)}/mi`,
                      totalColor: totalRpm >= 2.5 ? '#22C55E' : totalRpm >= 2.0 ? '#D97706' : '#DC2626',
                      bold: true,
                    },
                    {
                      label: 'Deadhead',
                      out: '0 mi',
                      ret: `${retLoad.deadhead} mi`,
                      total: `${retLoad.deadhead} mi`,
                      isText: true,
                    },
                  ].map(row => (
                    <tr key={row.label} style={row.bold ? { fontWeight: 700 } : {}}>
                      <td style={{ color: '#718096', fontWeight: 600, fontSize: 12 }}>{row.label}</td>
                      <td style={{ textAlign: 'right', fontSize: 12 }}>{row.out}</td>
                      <td style={{ textAlign: 'right', fontSize: 12 }}>{row.ret}</td>
                      <td style={{
                        textAlign: 'right', background: '#F0F9FF',
                        fontSize: row.bold ? 14 : 12,
                        fontWeight: row.bold ? 800 : 600,
                        color: row.totalColor || '#1A2535',
                      }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={{
                padding: '11px 22px', background: '#22C55E', color: '#fff', border: 'none',
                borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
              }}>
                Book Both Loads
              </button>
              <button style={{
                padding: '11px 22px', background: '#F7FAFC', color: '#4A5568', border: '1.5px solid #E2E8F0',
                borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                Save Round Trip Plan
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#A0AEC0' }}>Viewing:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4BAED4' }}>
                  {retLoad.origin.split(',')[0]} → {retLoad.dest.split(',')[0]} ({fmt(retLoad.rate)})
                </span>
              </div>
            </div>
          </div>

          {/* ── Round Trip History ─────────────────────────────────────────── */}
          <div className="card">
            <h2 className="section-title" style={{ marginBottom: 14 }}>Round Trip History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Plan #</th>
                    <th>Outbound</th>
                    <th>Return</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Miles</th>
                    <th style={{ textAlign: 'right' }}>Planned Gross</th>
                    <th style={{ textAlign: 'right' }}>Actual Gross</th>
                    <th style={{ textAlign: 'right' }}>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map(h => {
                    const variance = h.actualGross != null ? h.actualGross - h.plannedGross : null
                    return (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 700, color: '#4BAED4' }}>{h.id}</td>
                        <td style={{ fontSize: 12 }}>{h.outbound}</td>
                        <td style={{ fontSize: 12 }}>{h.return}</td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{h.date}</td>
                        <td style={{ textAlign: 'right', fontSize: 12 }}>{h.miles.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#4BAED4' }}>{fmt(h.plannedGross)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: h.actualGross != null ? '#1A2535' : '#A0AEC0' }}>
                          {h.actualGross != null ? fmt(h.actualGross) : '— pending'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {variance != null ? (
                            <span style={{ color: variance >= 0 ? '#22C55E' : '#DC2626' }}>
                              {variance >= 0 ? '+' : ''}{fmt(variance)}
                            </span>
                          ) : (
                            <span style={{ color: '#A0AEC0' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  )
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  border: '1.5px solid #E2E8F0',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  color: '#1A2535',
  outline: 'none',
  background: '#fff',
  width: 180,
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  width: 'auto',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#A0AEC0',
  display: 'block',
  marginBottom: 4,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}
