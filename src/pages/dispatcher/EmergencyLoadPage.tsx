import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Driver = {
  id: string
  name: string
  initials: string
  city: string
  state: string
  status: 'Available' | 'Pending offer'
  hos: number // hours of service remaining
  loadId: string
  color: string
}

type Load = {
  id: string
  origin: string
  originState: string
  destination: string
  destinationState: string
  miles: number
  deadheadMiles: number
  equipment: string
  weight: number
  pickupTime: string
  deliveryTime: string
  grossRate: number
  deadheadCostPerMile: number
  source: 'DAT' | '123LB' | 'DispaLoadIQ' | 'Truckstop'
  broker: string
}

type SortKey = 'netRpm' | 'grossRate' | 'distance' | 'pickupTime'
type MaxDH = '50' | '100' | '150' | 'any'
type EquipFilter = 'Dry Van' | 'Reefer' | 'Flatbed' | 'Any'

// ── Mock data ─────────────────────────────────────────────────────────────────
const DRIVERS: Driver[] = [
  { id: 'd1', name: 'Mike R.',    initials: 'MR', city: 'Houston',     state: 'TX', status: 'Available',     hos: 8,  loadId: 'CG-4421', color: '#F97316' },
  { id: 'd2', name: 'Sergiy K.',  initials: 'SK', city: 'Atlanta',     state: 'GA', status: 'Available',     hos: 6,  loadId: 'CG-4418', color: '#0EA5E9' },
  { id: 'd3', name: 'Tom B.',     initials: 'TB', city: 'Dallas',      state: 'TX', status: 'Available',     hos: 11, loadId: 'CG-4400', color: '#F59E0B' },
  { id: 'd4', name: 'Anna P.',    initials: 'AP', city: 'Sacramento',  state: 'CA', status: 'Available',     hos: 9,  loadId: 'CG-4415', color: '#8B5CF6' },
  { id: 'd5', name: 'James P.',   initials: 'JP', city: 'Nashville',   state: 'TN', status: 'Pending offer', hos: 7,  loadId: 'CG-4374', color: '#10B981' },
]

const LOADS: Load[] = [
  { id: 'L-001', origin: 'Houston', originState: 'TX', destination: 'Dallas',    destinationState: 'TX', miles: 239,  deadheadMiles: 0,  equipment: 'Dry Van', weight: 38000, pickupTime: 'Today 3:00 PM',    deliveryTime: 'Tomorrow 6:00 AM',  grossRate: 680,  deadheadCostPerMile: 1.20, source: 'DAT',         broker: 'Echo Global' },
  { id: 'L-002', origin: 'Houston', originState: 'TX', destination: 'Atlanta',   destinationState: 'GA', miles: 791,  deadheadMiles: 0,  equipment: 'Dry Van', weight: 42000, pickupTime: 'Today 4:00 PM',    deliveryTime: 'Tomorrow 10:00 AM', grossRate: 2250, deadheadCostPerMile: 1.20, source: '123LB',       broker: 'Coyote' },
  { id: 'L-003', origin: 'Houston', originState: 'TX', destination: 'Chicago',   destinationState: 'IL', miles: 1092, deadheadMiles: 0,  equipment: 'Dry Van', weight: 44000, pickupTime: 'Today 2:00 PM',    deliveryTime: 'Tomorrow 8:00 PM',  grossRate: 2950, deadheadCostPerMile: 1.20, source: 'DAT',         broker: 'CH Robinson' },
  { id: 'L-004', origin: 'Houston', originState: 'TX', destination: 'Denver',    destinationState: 'CO', miles: 1019, deadheadMiles: 0,  equipment: 'Dry Van', weight: 40000, pickupTime: 'Today 5:00 PM',    deliveryTime: 'Tomorrow 2:00 PM',  grossRate: 2400, deadheadCostPerMile: 1.20, source: 'Truckstop',   broker: 'TQL' },
  { id: 'L-005', origin: 'Houston', originState: 'TX', destination: 'Phoenix',   destinationState: 'AZ', miles: 1173, deadheadMiles: 15, equipment: 'Dry Van', weight: 43500, pickupTime: 'Today 6:00 PM',    deliveryTime: 'Tomorrow 4:00 PM',  grossRate: 2700, deadheadCostPerMile: 1.20, source: 'DAT',         broker: 'Arrive Logistics' },
  { id: 'L-006', origin: 'Houston', originState: 'TX', destination: 'Memphis',   destinationState: 'TN', miles: 561,  deadheadMiles: 0,  equipment: 'Dry Van', weight: 38000, pickupTime: 'Today 3:30 PM',    deliveryTime: 'Tomorrow 7:00 AM',  grossRate: 1150, deadheadCostPerMile: 1.20, source: '123LB',       broker: 'XPO' },
  { id: 'L-007', origin: 'Houston', originState: 'TX', destination: 'Nashville', destinationState: 'TN', miles: 670,  deadheadMiles: 0,  equipment: 'Dry Van', weight: 41000, pickupTime: 'Today 4:30 PM',    deliveryTime: 'Tomorrow 9:00 AM',  grossRate: 1320, deadheadCostPerMile: 1.20, source: 'DispaLoadIQ', broker: 'Landstar' },
  { id: 'L-008', origin: 'Houston', originState: 'TX', destination: 'Laredo',    destinationState: 'TX', miles: 333,  deadheadMiles: 22, equipment: 'Dry Van', weight: 36000, pickupTime: 'Today 2:30 PM',    deliveryTime: 'Today 10:00 PM',    grossRate: 620,  deadheadCostPerMile: 1.20, source: 'Truckstop',   broker: 'MoLo' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function calcNetRpm(load: Load): number {
  const deadheadCost = load.deadheadMiles * load.deadheadCostPerMile
  const net = load.grossRate - deadheadCost
  return parseFloat((net / load.miles).toFixed(2))
}

function calcNetRate(load: Load): number {
  return load.grossRate - load.deadheadMiles * load.deadheadCostPerMile
}

function rpmColor(rpm: number): string {
  if (rpm >= 2.5) return '#22C55E'
  if (rpm >= 2.0) return '#D97706'
  return '#DC2626'
}

function rpmBg(rpm: number): string {
  if (rpm >= 2.5) return '#F0FFF4'
  if (rpm >= 2.0) return '#FFFBEB'
  return '#FEF2F2'
}

function sourceBadgeColor(source: Load['source']): { bg: string; color: string } {
  switch (source) {
    case 'DAT':         return { bg: '#EFF6FF', color: '#2563EB' }
    case '123LB':       return { bg: '#F5F3FF', color: '#7C3AED' }
    case 'DispaLoadIQ': return { bg: '#FFF7ED', color: '#EA580C' }
    case 'Truckstop':   return { bg: '#F0FDF4', color: '#16A34A' }
  }
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmergencyLoadPage() {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('d1')
  const [timerSeconds, setTimerSeconds] = useState(23)
  const [minRpm, setMinRpm] = useState(2.00)
  const [maxDH, setMaxDH] = useState<MaxDH>('50')
  const [equipFilter, setEquipFilter] = useState<EquipFilter>('Any')
  const [sortBy, setSortBy] = useState<SortKey>('netRpm')
  const [bookingLoadId, setBookingLoadId] = useState<string | null>(null)
  const [bookedLoadIds, setBookedLoadIds] = useState<Set<string>>(new Set())
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const driver = DRIVERS.find(d => d.id === selectedDriverId) ?? DRIVERS[0]

  // Tick timer
  useEffect(() => {
    const interval = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  // Filter + sort
  const filteredLoads = LOADS
    .filter(l => {
      const rpm = calcNetRpm(l)
      if (rpm < minRpm) return false
      if (maxDH !== 'any' && l.deadheadMiles > parseInt(maxDH)) return false
      if (equipFilter !== 'Any' && l.equipment !== equipFilter) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'netRpm':     return calcNetRpm(b) - calcNetRpm(a)
        case 'grossRate':  return b.grossRate - a.grossRate
        case 'distance':   return b.miles - a.miles
        case 'pickupTime': return a.pickupTime.localeCompare(b.pickupTime)
      }
    })

  const bestRpm = filteredLoads.length > 0
    ? Math.max(...filteredLoads.map(l => calcNetRpm(l)))
    : 0

  function handleBook(loadId: string) {
    const load = LOADS.find(l => l.id === loadId)!
    setBookedLoadIds(prev => new Set([...prev, loadId]))
    setBookingLoadId(null)
    setToastMsg(`Load booked! Sending RC to ${driver.name.split(' ')[0]}. ${load.origin} → ${load.destination}`)
  }

  const bookingLoad = bookingLoadId ? LOADS.find(l => l.id === bookingLoadId) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 72 }}>

      {/* ── Alert Banner ───────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 40%, #C2410C 100%)',
        borderRadius: 14,
        padding: '18px 24px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        boxShadow: '0 4px 24px #DC262666',
        flexWrap: 'wrap',
      }}>
        {/* Left: title + driver info */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🚨</span>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Driver Empty — Find Load Now
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{driver.name}</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>·</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>{driver.loadId}</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>·</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{driver.city}, {driver.state}</span>
            <span style={{
              fontSize: 11, fontWeight: 800, background: '#FEF08A', color: '#78350F',
              padding: '3px 10px', borderRadius: 20,
            }}>
              Available NOW
            </span>
            {driver.hos <= 4 && (
              <span style={{
                fontSize: 11, fontWeight: 800, background: '#FCD34D', color: '#92400E',
                padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ⚠️ Low HOS: {driver.hos}h
              </span>
            )}
            <span style={{ fontSize: 13, opacity: 0.85 }}>{driver.hos}h HOS remaining</span>
          </div>
        </div>

        {/* Right: change driver + timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <select
            value={selectedDriverId}
            onChange={e => setSelectedDriverId(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8,
              padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              outline: 'none',
            }}
          >
            {DRIVERS.map(d => (
              <option key={d.id} value={d.id} style={{ color: '#1A2535', background: '#fff' }}>
                {d.name} — {d.city}, {d.state}
              </option>
            ))}
          </select>

          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 10,
            padding: '10px 18px', textAlign: 'center', minWidth: 90,
          }}>
            <div style={{ fontSize: 10, opacity: 0.75, fontWeight: 700, marginBottom: 2 }}>WAITING</div>
            <div style={{
              fontSize: 26, fontWeight: 900, fontFamily: 'monospace',
              color: timerSeconds > 600 ? '#FCA5A5' : '#FEF08A',
            }}>
              {formatTimer(timerSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 1: Driver Cards ────────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 10 }}>Step 1 — Select Empty Driver</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {DRIVERS.map(d => {
            const isSelected = d.id === selectedDriverId
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDriverId(d.id)}
                style={{
                  flex: '1 1 150px', minWidth: 140,
                  background: isSelected ? d.color + '18' : 'var(--c-surface)',
                  border: isSelected ? `2px solid ${d.color}` : '2px solid var(--c-border)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 0 0 3px ${d.color}33` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: d.color + '22', border: `2px solid ${d.color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: d.color, flexShrink: 0,
                  }}>
                    {d.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>{d.name}</div>
                    <div style={{ fontSize: 10, color: '#718096' }}>{d.city}, {d.state}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                    background: d.status === 'Available' ? '#F0FFF4' : '#FFFBEB',
                    color: d.status === 'Available' ? '#16A34A' : '#D97706',
                  }}>
                    {d.status === 'Available' ? '🟢' : '🟡'} {d.status}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: d.hos <= 4 ? '#D97706' : '#4A5568',
                  }}>
                    {d.hos <= 4 ? '⚠️ ' : ''}{d.hos}h HOS
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Filters Bar ────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Min RPM */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', whiteSpace: 'nowrap' }}>
              Min RPM:
            </label>
            <input
              type="range" min="1.50" max="3.00" step="0.10"
              value={minRpm}
              onChange={e => setMinRpm(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#DC2626' }}
            />
            <span style={{
              fontSize: 12, fontWeight: 800, minWidth: 40, textAlign: 'center',
              color: rpmColor(minRpm),
            }}>
              ${minRpm.toFixed(2)}
            </span>
          </div>

          {/* Max Deadhead */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>Max DH:</span>
            {(['50', '100', '150', 'any'] as MaxDH[]).map(v => (
              <button
                key={v}
                onClick={() => setMaxDH(v)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1.5px solid',
                  borderColor: maxDH === v ? '#DC2626' : 'var(--c-border)',
                  background: maxDH === v ? '#FEF2F2' : 'var(--c-surface)',
                  color: maxDH === v ? '#DC2626' : '#718096',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {v === 'any' ? 'Any' : `${v}mi`}
              </button>
            ))}
          </div>

          {/* Equipment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>Equipment:</span>
            {(['Any', 'Dry Van', 'Reefer', 'Flatbed'] as EquipFilter[]).map(v => (
              <button
                key={v}
                onClick={() => setEquipFilter(v)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1.5px solid',
                  borderColor: equipFilter === v ? '#F97316' : 'var(--c-border)',
                  background: equipFilter === v ? '#FFF7ED' : 'var(--c-surface)',
                  color: equipFilter === v ? '#EA580C' : '#718096',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Sort by */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>Sort by:</span>
            {([
              { key: 'netRpm',    label: 'Net RPM ▼' },
              { key: 'grossRate', label: 'Gross Rate' },
              { key: 'distance',  label: 'Distance' },
              { key: 'pickupTime', label: 'Pickup Time' },
            ] as { key: SortKey; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: '1.5px solid',
                  borderColor: sortBy === s.key ? '#8B5CF6' : 'var(--c-border)',
                  background: sortBy === s.key ? '#F5F3FF' : 'var(--c-surface)',
                  color: sortBy === s.key ? '#7C3AED' : '#718096',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ── Step 2: Load Results ────────────────────────────────────────────────── */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 12 }}>
          Step 2 — Load Results
          <span style={{ fontSize: 12, fontWeight: 400, color: '#718096', marginLeft: 8 }}>
            {filteredLoads.length} loads found near {driver.city}, {driver.state}
          </span>
        </h3>

        {filteredLoads.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: '#A0AEC0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>😔</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>No loads match your filters</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try lowering the Min RPM or increasing Max Deadhead</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredLoads.map((load, idx) => {
              const rpm = calcNetRpm(load)
              const netRate = calcNetRate(load)
              const dhCost = load.deadheadMiles * load.deadheadCostPerMile
              const isBooked = bookedLoadIds.has(load.id)
              const srcBadge = sourceBadgeColor(load.source)

              return (
                <div
                  key={load.id}
                  style={{
                    display: 'flex',
                    background: isBooked ? '#F0FFF4' : 'var(--c-surface)',
                    border: `1.5px solid ${isBooked ? '#86EFAC' : 'var(--c-border)'}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: idx === 0 && !isBooked ? '0 0 0 2px #22C55E33, 0 2px 12px #22C55E18' : 'none',
                  }}
                >
                  {/* Rank strip */}
                  <div style={{
                    width: 5, flexShrink: 0,
                    background: idx === 0 ? '#22C55E' : idx === 1 ? '#4ADE80' : idx <= 3 ? '#D97706' : '#E2E8F0',
                  }} />

                  <div style={{ flex: 1, padding: '14px 16px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>

                    {/* Left: route + details */}
                    <div style={{ flex: 2, minWidth: 220 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        {idx === 0 && !isBooked && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, background: '#DCFCE7', color: '#16A34A',
                            padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase',
                          }}>
                            Best Pick
                          </span>
                        )}
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                          background: srcBadge.bg, color: srcBadge.color,
                        }}>
                          {load.source}
                        </span>
                        {isBooked && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, background: '#DCFCE7', color: '#16A34A',
                            padding: '2px 7px', borderRadius: 6,
                          }}>
                            ✅ Booked
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2535', marginBottom: 4 }}>
                        {load.origin}, {load.originState} → {load.destination}, {load.destinationState}
                      </div>

                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#718096' }}>
                          📏 {load.miles.toLocaleString()} mi
                        </span>
                        {load.deadheadMiles > 0 && (
                          <span style={{ fontSize: 11, color: '#D97706', fontWeight: 700 }}>
                            DH: {load.deadheadMiles} mi
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#718096' }}>
                          🚛 {load.equipment}
                        </span>
                        <span style={{ fontSize: 11, color: '#718096' }}>
                          ⚖️ {load.weight.toLocaleString()} lbs
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#4A5568' }}>
                          📦 {load.pickupTime}
                        </span>
                        <span style={{ fontSize: 11, color: '#718096' }}>
                          🏁 {load.deliveryTime}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>
                        Broker: {load.broker}
                      </div>
                    </div>

                    {/* Right: financials */}
                    <div style={{
                      flex: '0 0 auto', minWidth: 160, textAlign: 'right',
                      padding: '10px 14px',
                      background: rpmBg(rpm),
                      borderRadius: 10,
                      border: `1px solid ${rpmColor(rpm)}33`,
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#1A2535', lineHeight: 1 }}>
                        {fmt(load.grossRate)}
                      </div>
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 4 }}>Gross Rate</div>

                      {dhCost > 0 && (
                        <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700 }}>
                          − {fmt(dhCost)} DH ({load.deadheadMiles}mi @ $1.20)
                        </div>
                      )}

                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535', marginTop: 2 }}>
                        Net: {fmt(netRate)}
                      </div>

                      <div style={{
                        marginTop: 6, padding: '4px 10px', borderRadius: 8,
                        background: rpmColor(rpm) + '18', display: 'inline-block',
                      }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: rpmColor(rpm) }}>
                          ${rpm.toFixed(2)}
                        </span>
                        <span style={{ fontSize: 10, color: rpmColor(rpm), marginLeft: 3 }}>Net RPM</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130,
                    }}>
                      <a
                        href={`tel:+18005550000`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          background: '#EFF6FF', color: '#2563EB',
                          border: '1.5px solid #BFDBFE', textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        📞 Call Broker
                      </a>
                      <button
                        disabled={isBooked}
                        onClick={() => setBookingLoadId(load.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          background: isBooked ? '#DCFCE7' : '#22C55E',
                          color: isBooked ? '#16A34A' : '#fff',
                          border: 'none', cursor: isBooked ? 'default' : 'pointer',
                          opacity: isBooked ? 0.8 : 1,
                        }}
                      >
                        {isBooked ? '✅ Booked' : '✅ Book Load'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Sticky Bar ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(26, 37, 53, 0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        zIndex: 100,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            Comparing{' '}
            <strong style={{ color: '#fff' }}>{filteredLoads.length} loads</strong>
          </span>
          {filteredLoads.length > 0 && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Best Net RPM:{' '}
                <strong style={{ color: '#22C55E', fontSize: 15 }}>
                  ${bestRpm.toFixed(2)}
                </strong>
              </span>
            </>
          )}
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <strong style={{ color: driver.hos <= 4 ? '#FCD34D' : '#fff' }}>
              {driver.hos}h HOS
            </strong>{' '}
            remaining for {driver.name}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
          <span style={{ fontSize: 13, color: '#FCA5A5', fontFamily: 'monospace', fontWeight: 700 }}>
            ⏱ {formatTimer(timerSeconds)} waiting
          </span>
        </div>

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 2px 12px #DC262666',
          }}
        >
          📤 Send to Driver
        </button>
      </div>

      {/* ── Booking Confirmation Modal ──────────────────────────────────────────── */}
      {bookingLoad && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 16,
          }}
          onClick={() => setBookingLoadId(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 18, padding: '28px 32px',
              maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 22, marginBottom: 6, textAlign: 'center' }}>📋</div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: '#1A2535', textAlign: 'center', marginBottom: 4 }}>
              Confirm Load Booking
            </h2>
            <p style={{ fontSize: 12, color: '#718096', textAlign: 'center', marginBottom: 20 }}>
              Review the details before booking
            </p>

            <div style={{
              background: '#F7FAFC', borderRadius: 12, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20,
              border: '1px solid #E2E8F0',
            }}>
              {[
                { label: 'Route',       value: `${bookingLoad.origin}, ${bookingLoad.originState} → ${bookingLoad.destination}, ${bookingLoad.destinationState}` },
                { label: 'Distance',    value: `${bookingLoad.miles.toLocaleString()} mi` },
                { label: 'Equipment',   value: bookingLoad.equipment },
                { label: 'Pickup',      value: bookingLoad.pickupTime },
                { label: 'Delivery',    value: bookingLoad.deliveryTime },
                { label: 'Broker',      value: bookingLoad.broker },
                { label: 'Gross Rate',  value: fmt(bookingLoad.grossRate) },
                { label: 'Net Rate',    value: fmt(calcNetRate(bookingLoad)) },
                { label: 'Net RPM',     value: `$${calcNetRpm(bookingLoad).toFixed(2)}` },
                { label: 'Driver',      value: `${driver.name} — ${driver.city}, ${driver.state}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#718096' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2535', textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setBookingLoadId(null)}
                style={{
                  flex: 1, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: '#F7FAFC', border: '1.5px solid #E2E8F0', color: '#718096', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBook(bookingLoad.id)}
                style={{
                  flex: 2, padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  boxShadow: '0 2px 10px #22C55E44',
                }}
              >
                ✅ Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ───────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)',
          background: '#14532D', color: '#fff',
          padding: '12px 22px', borderRadius: 12,
          fontSize: 13, fontWeight: 700,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 8,
          zIndex: 300, whiteSpace: 'nowrap',
          animation: 'slideUp 0.2s ease',
        }}>
          ✅ {toastMsg}
        </div>
      )}
    </div>
  )
}
