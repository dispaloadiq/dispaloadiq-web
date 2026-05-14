import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type NegStatus = 'incoming' | 'countered' | 'accepted' | 'declined' | 'expired'

type Negotiation = {
  id: string
  loadId: string
  broker: string
  brokerContact: string
  origin: string
  dest: string
  miles: number
  equipment: string
  weight: string
  commodity: string
  pickupDate: string
  brokerOffer: number        // broker's original offer per mile
  myCounter: number | null   // dispatcher's counter
  finalRate: number | null   // agreed rate per mile
  totalRate: number          // gross $ at offered rate
  marketRate: number         // DAT/Truckstop market rate
  clientId: string
  clientName: string
  status: NegStatus
  expiresIn: string | null
  notes: string
  history: HistoryEntry[]
}

type HistoryEntry = { time: string; actor: 'Broker' | 'Me'; action: string; value: string; color: string }

// ── Mock data ─────────────────────────────────────────────────────────────────
const NEGOTIATIONS: Negotiation[] = [
  {
    id: 'N-001', loadId: 'TQL-8821', broker: 'TQL', brokerContact: 'Dave Morris',
    origin: 'Chicago, IL', dest: 'Dallas, TX', miles: 1_201, equipment: 'Dry Van',
    weight: '42,000 lbs', commodity: 'Consumer Goods', pickupDate: 'May 14, 07:00 AM',
    brokerOffer: 2.18, myCounter: 2.45, finalRate: null,
    totalRate: 2_618, marketRate: 2.39, clientId: 'c1', clientName: 'Mike Rodriguez',
    status: 'countered', expiresIn: '1h 20m', notes: 'Need to beat $2.30 guarantee',
    history: [
      { time: '09:15 AM', actor: 'Broker', action: 'Offered',    value: '$2.18/mi · $2,618 total', color: '#3182CE' },
      { time: '09:22 AM', actor: 'Me',     action: 'Countered',  value: '$2.45/mi · $2,942 total', color: '#8B5CF6' },
      { time: '09:45 AM', actor: 'Broker', action: 'Reviewing',  value: 'Waiting for approval...', color: '#A0AEC0' },
    ],
  },
  {
    id: 'N-002', loadId: 'COYOTE-3310', broker: 'Coyote', brokerContact: 'Sara Kim',
    origin: 'Miami, FL', dest: 'Charlotte, NC', miles: 760, equipment: 'Reefer',
    weight: '38,000 lbs', commodity: 'Fresh Produce', pickupDate: 'May 15, 06:00 AM',
    brokerOffer: 2.60, myCounter: null, finalRate: null,
    totalRate: 1_976, marketRate: 2.55, clientId: 'c2', clientName: 'Sergiy Kovalchuk',
    status: 'incoming', expiresIn: '45 min', notes: '',
    history: [
      { time: '10:02 AM', actor: 'Broker', action: 'Offered',    value: '$2.60/mi · $1,976 total', color: '#3182CE' },
    ],
  },
  {
    id: 'N-003', loadId: 'ECHO-5504', broker: 'Echo Global', brokerContact: 'Rick T.',
    origin: 'Houston, TX', dest: 'Phoenix, AZ', miles: 1_157, equipment: 'Flatbed',
    weight: '45,000 lbs', commodity: 'Steel Coils', pickupDate: 'May 14, 10:00 AM',
    brokerOffer: 2.35, myCounter: 2.65, finalRate: 2.55,
    totalRate: 2_720, marketRate: 2.58, clientId: 'c3', clientName: 'Tom Bradley',
    status: 'accepted', expiresIn: null, notes: 'Agreed on $2.55 — great deal',
    history: [
      { time: '08:00 AM', actor: 'Broker', action: 'Offered',    value: '$2.35/mi · $2,719 total', color: '#3182CE' },
      { time: '08:14 AM', actor: 'Me',     action: 'Countered',  value: '$2.65/mi · $3,066 total', color: '#8B5CF6' },
      { time: '08:30 AM', actor: 'Broker', action: 'Countered',  value: '$2.50/mi · $2,893 total', color: '#3182CE' },
      { time: '08:38 AM', actor: 'Me',     action: 'Countered',  value: '$2.58/mi · $2,985 total', color: '#8B5CF6' },
      { time: '08:52 AM', actor: 'Broker', action: 'Accepted',   value: '$2.55/mi · $2,952 total', color: '#22C55E' },
    ],
  },
  {
    id: 'N-004', loadId: 'WW-2201', broker: 'Worldwide Express', brokerContact: 'Mike P.',
    origin: 'Atlanta, GA', dest: 'Indianapolis, IN', miles: 720, equipment: 'Dry Van',
    weight: '36,000 lbs', commodity: 'Auto Parts', pickupDate: 'May 14, 02:00 PM',
    brokerOffer: 2.15, myCounter: 2.55, finalRate: null,
    totalRate: 1_548, marketRate: 2.42, clientId: 'c5', clientName: 'James Park',
    status: 'countered', expiresIn: '30 min', notes: 'Client needs min $2.40',
    history: [
      { time: '07:30 AM', actor: 'Broker', action: 'Offered',    value: '$2.15/mi · $1,548 total', color: '#3182CE' },
      { time: '07:44 AM', actor: 'Me',     action: 'Countered',  value: '$2.55/mi · $1,836 total', color: '#8B5CF6' },
    ],
  },
  {
    id: 'N-005', loadId: 'UF-9902', broker: 'Uber Freight', brokerContact: 'Auto',
    origin: 'Los Angeles, CA', dest: 'Seattle, WA', miles: 1_140, equipment: 'Dry Van',
    weight: '40,000 lbs', commodity: 'Tech Equipment', pickupDate: 'May 16, 08:00 AM',
    brokerOffer: 1.95, myCounter: 2.30, finalRate: null,
    totalRate: 2_223, marketRate: 2.28, clientId: 'c4', clientName: 'Anna Perez',
    status: 'declined', expiresIn: null, notes: 'Rate too low, declined',
    history: [
      { time: 'Yesterday', actor: 'Broker', action: 'Offered',  value: '$1.95/mi · $2,223 total', color: '#3182CE' },
      { time: 'Yesterday', actor: 'Me',     action: 'Countered', value: '$2.30/mi · $2,622 total', color: '#8B5CF6' },
      { time: 'Yesterday', actor: 'Broker', action: 'Declined',  value: 'No deal — rate not possible', color: '#E53E3E' },
    ],
  },
]

const STATUS_META: Record<NegStatus, { label: string; color: string; bg: string; icon: string }> = {
  incoming:  { label: 'Incoming',  color: '#3182CE', bg: '#EBF8FF', icon: '📥' },
  countered: { label: 'Countered', color: '#D97706', bg: '#FFFBEB', icon: '⚡' },
  accepted:  { label: 'Accepted',  color: '#22C55E', bg: '#F0FFF4', icon: '✅' },
  declined:  { label: 'Declined',  color: '#E53E3E', bg: '#FEF2F2', icon: '❌' },
  expired:   { label: 'Expired',   color: '#A0AEC0', bg: '#F7FAFC', icon: '⏰' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Counter Offer Modal ────────────────────────────────────────────────────────
function CounterModal({ neg, onClose, onSubmit }: {
  neg: Negotiation
  onClose: () => void
  onSubmit: (id: string, rate: number) => void
}) {
  const [rpm, setRpm] = useState(neg.myCounter ?? (neg.brokerOffer + 0.20))
  const totalAtRpm = Math.round(rpm * neg.miles)
  const diff       = rpm - neg.brokerOffer
  const vsMkt      = rpm - neg.marketRate

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: 480, maxWidth: '92vw',
        boxShadow: '0 20px 60px rgba(0,0,0,.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2535' }}>Counter Offer</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 3 }}>
              {neg.loadId} · {neg.origin.split(',')[0]} → {neg.dest.split(',')[0]} · {neg.miles.toLocaleString()} mi
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A0AEC0' }}>×</button>
        </div>

        {/* Rate comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: "Broker Offer",  value: `$${neg.brokerOffer.toFixed(2)}/mi`, sub: fmt(Math.round(neg.brokerOffer * neg.miles)), color: '#3182CE' },
            { label: "Market Rate",   value: `$${neg.marketRate.toFixed(2)}/mi`,  sub: 'DAT avg',                                    color: '#718096' },
            { label: "Your Counter",  value: `$${rpm.toFixed(2)}/mi`,             sub: fmt(totalAtRpm),                              color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '10px 8px', background: '#F7FAFC', borderRadius: 10, border: `1.5px solid ${s.color}22` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>{s.sub}</div>
              <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* RPM slider + input */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>Your Rate Per Mile</label>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6' }}>$</span>
              <input
                type="number" step="0.01" min="1.50" max="4.00"
                value={rpm.toFixed(2)}
                onChange={e => setRpm(parseFloat(e.target.value) || rpm)}
                style={{
                  width: 72, border: '2px solid #8B5CF6', borderRadius: 8,
                  padding: '5px 8px', fontSize: 16, fontWeight: 800,
                  color: '#8B5CF6', textAlign: 'center', outline: 'none',
                }}
              />
              <span style={{ fontSize: 12, color: '#A0AEC0' }}>/mi</span>
            </div>
          </div>
          <input
            type="range" min="1.50" max="4.00" step="0.01"
            value={rpm}
            onChange={e => setRpm(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#8B5CF6' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#A0AEC0', marginTop: 2 }}>
            <span>$1.50/mi (floor)</span>
            <span>$4.00/mi (ceiling)</span>
          </div>
        </div>

        {/* Delta callouts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          <div style={{ padding: '8px 12px', borderRadius: 10, background: diff > 0 ? '#F0FFF4' : '#FEF2F2', border: `1px solid ${diff > 0 ? '#22C55E44' : '#E53E3E44'}` }}>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>vs Broker Offer</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: diff > 0 ? '#22C55E' : '#E53E3E' }}>
              {diff > 0 ? '+' : ''}{diff.toFixed(2)}/mi  ({fmt(Math.round(diff * neg.miles))})
            </div>
          </div>
          <div style={{ padding: '8px 12px', borderRadius: 10, background: vsMkt > 0 ? '#FFFBEB' : '#EFF6FF', border: `1px solid ${vsMkt > 0 ? '#D9770644' : '#3182CE44'}` }}>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>vs Market Rate</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: vsMkt > 0 ? '#D97706' : '#3182CE' }}>
              {vsMkt > 0 ? '+' : ''}{vsMkt.toFixed(2)}/mi
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button
            onClick={() => onSubmit(neg.id, rpm)}
            className="btn btn-primary"
            style={{ flex: 2, background: '#8B5CF6', fontSize: 14, fontWeight: 700 }}
          >
            Send Counter: ${rpm.toFixed(2)}/mi ({fmt(totalAtRpm)})
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoadNegotiationPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>(NEGOTIATIONS)
  const [selectedId, setSelectedId]     = useState<string | null>('N-001')
  const [counterTarget, setCounterTarget] = useState<Negotiation | null>(null)
  const [filterStatus, setFilterStatus]   = useState<NegStatus | 'all'>('all')

  const selected = negotiations.find(n => n.id === selectedId)

  const filtered = negotiations.filter(n => filterStatus === 'all' || n.status === filterStatus)

  const incoming  = negotiations.filter(n => n.status === 'incoming').length
  const countered = negotiations.filter(n => n.status === 'countered').length
  const accepted  = negotiations.filter(n => n.status === 'accepted').length
  const totalWon  = negotiations.filter(n => n.status === 'accepted').reduce((s, n) => s + (n.finalRate ?? 0) * n.miles, 0)
  const avgDelta  = negotiations.filter(n => n.status === 'accepted').reduce((s, n) => s + ((n.finalRate ?? 0) - n.brokerOffer), 0) / Math.max(accepted, 1)

  function handleCounter(id: string, rate: number) {
    setNegotiations(prev => prev.map(n => n.id === id
      ? {
          ...n, myCounter: rate, status: 'countered' as NegStatus,
          history: [...n.history, {
            time: 'Just now', actor: 'Me' as const,
            action: 'Countered', value: `$${rate.toFixed(2)}/mi · ${fmt(Math.round(rate * n.miles))} total`,
            color: '#8B5CF6',
          }],
        }
      : n
    ))
    setCounterTarget(null)
  }

  function handleAccept(id: string) {
    setNegotiations(prev => prev.map(n => {
      if (n.id !== id) return n
      const rate = n.brokerOffer
      return {
        ...n, finalRate: rate, status: 'accepted' as NegStatus,
        history: [...n.history, {
          time: 'Just now', actor: 'Me' as const,
          action: 'Accepted', value: `$${rate.toFixed(2)}/mi — booking confirmed`,
          color: '#22C55E',
        }],
      }
    }))
  }

  function handleDecline(id: string) {
    setNegotiations(prev => prev.map(n => n.id !== id ? n : {
      ...n, status: 'declined' as NegStatus,
      history: [...n.history, { time: 'Just now', actor: 'Me' as const, action: 'Declined', value: 'Rate not acceptable', color: '#E53E3E' }],
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Counter modal */}
      {counterTarget && (
        <CounterModal
          neg={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSubmit={handleCounter}
        />
      )}

      {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          { icon: '📥', label: 'Incoming',        value: incoming,       sub: 'need response',       color: '#3182CE' },
          { icon: '⚡', label: 'Countered',        value: countered,      sub: 'awaiting broker',     color: '#D97706' },
          { icon: '✅', label: 'Accepted Today',   value: accepted,       sub: 'loads confirmed',     color: '#22C55E' },
          { icon: '💰', label: 'Revenue Won',      value: fmt(totalWon),  sub: 'from accepted loads', color: '#8B5CF6' },
          { icon: '📈', label: 'Avg Rate Gain',    value: `+$${avgDelta.toFixed(2)}/mi`, sub: 'vs initial offer', color: '#F97316' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 10, color: s.color, fontWeight: 700, background: s.color + '18', padding: '2px 6px', borderRadius: 5 }}>{s.sub}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, alignItems: 'start' }}>

        {/* LEFT — Negotiation list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0' }}>
            {(['all', 'incoming', 'countered', 'accepted', 'declined'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  flex: 1, padding: '9px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 10, fontWeight: 700,
                  color: filterStatus === s ? '#8B5CF6' : '#A0AEC0',
                  borderBottom: filterStatus === s ? '2px solid #8B5CF6' : '2px solid transparent',
                  textTransform: 'capitalize',
                }}
              >
                {s === 'all' ? `All (${negotiations.length})` : STATUS_META[s].icon + ' ' + s}
              </button>
            ))}
          </div>

          {/* Negotiation rows */}
          <div style={{ maxHeight: 640, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 28, color: '#A0AEC0' }}>
                <div style={{ fontSize: 28 }}>📭</div>
                <div style={{ marginTop: 6, fontSize: 13 }}>No negotiations</div>
              </div>
            ) : filtered.map(n => {
              const m = STATUS_META[n.status]
              const active = selectedId === n.id
              const deltaRpm = n.myCounter ? n.myCounter - n.brokerOffer : 0
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedId(n.id)}
                  style={{
                    padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #F0F4F8',
                    background: active ? '#F5F3FF' : '#fff',
                    borderLeft: active ? '3px solid #8B5CF6' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: m.bg, color: m.color }}>
                      {m.icon} {m.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#4BAED4' }}>{n.loadId}</span>
                    {n.expiresIn && (
                      <span style={{ fontSize: 9, color: '#E53E3E', fontWeight: 700, marginLeft: 'auto' }}>⏱ {n.expiresIn}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535', marginBottom: 3 }}>
                    {n.origin.split(',')[0]} → {n.dest.split(',')[0]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#718096' }}>{n.broker} · {n.miles.toLocaleString()} mi</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6' }}>${n.brokerOffer.toFixed(2)}/mi</div>
                      {deltaRpm > 0 && (
                        <div style={{ fontSize: 9, color: '#D97706' }}>Counter +${deltaRpm.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 4 }}>🚛 {n.clientName} · {n.equipment}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — Negotiation detail */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Header card */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>{selected.loadId}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                      background: STATUS_META[selected.status].bg, color: STATUS_META[selected.status].color,
                    }}>
                      {STATUS_META[selected.status].icon} {STATUS_META[selected.status].label}
                    </span>
                    {selected.expiresIn && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '3px 10px', borderRadius: 8 }}>
                        ⏱ Expires: {selected.expiresIn}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#4A5568' }}>
                    {selected.origin} → {selected.dest} · {selected.miles.toLocaleString()} mi · {selected.equipment}
                  </div>
                </div>
                {(selected.status === 'incoming' || selected.status === 'countered') && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#E53E3E' }}
                      onClick={() => handleDecline(selected.id)}
                    >
                      ❌ Decline
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#8B5CF6' }}
                      onClick={() => setCounterTarget(selected)}
                    >
                      ⚡ Counter
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ background: '#22C55E' }}
                      onClick={() => handleAccept(selected.id)}
                    >
                      ✅ Accept ${selected.brokerOffer.toFixed(2)}/mi
                    </button>
                  </div>
                )}
              </div>

              {/* Load details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Broker',      value: selected.broker },
                  { label: 'Contact',     value: selected.brokerContact },
                  { label: 'Pickup',      value: selected.pickupDate },
                  { label: 'Commodity',   value: selected.commodity },
                  { label: 'Weight',      value: selected.weight },
                  { label: 'Client',      value: selected.clientName },
                  { label: 'Equipment',   value: selected.equipment },
                  { label: 'Miles',       value: selected.miles.toLocaleString() + ' mi' },
                ].map(f => (
                  <div key={f.label} style={{ padding: '8px 10px', background: '#F7FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rate comparison card */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <h3 className="section-title" style={{ marginBottom: 14 }}>Rate Analysis</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  {
                    label: 'Broker Offer', rpm: selected.brokerOffer,
                    total: Math.round(selected.brokerOffer * selected.miles), color: '#3182CE',
                    sub: 'Initial offer',
                  },
                  {
                    label: 'Market Rate', rpm: selected.marketRate,
                    total: Math.round(selected.marketRate * selected.miles), color: '#718096',
                    sub: 'DAT/Truckstop avg',
                  },
                  {
                    label: 'My Counter', rpm: selected.myCounter ?? 0,
                    total: selected.myCounter ? Math.round(selected.myCounter * selected.miles) : 0,
                    color: '#8B5CF6',
                    sub: selected.myCounter ? 'Sent to broker' : '—',
                  },
                  {
                    label: 'Final / Agreed', rpm: selected.finalRate ?? 0,
                    total: selected.finalRate ? Math.round(selected.finalRate * selected.miles) : 0,
                    color: '#22C55E',
                    sub: selected.finalRate ? 'Confirmed' : 'Not yet agreed',
                  },
                ].map(r => (
                  <div key={r.label} style={{
                    textAlign: 'center', padding: '12px 10px', borderRadius: 10,
                    background: r.rpm > 0 ? r.color + '12' : '#F7FAFC',
                    border: `1.5px solid ${r.rpm > 0 ? r.color + '33' : '#E2E8F0'}`,
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: r.rpm > 0 ? r.color : '#CBD5E0' }}>
                      {r.rpm > 0 ? `$${r.rpm.toFixed(2)}` : '—'}
                    </div>
                    <div style={{ fontSize: 10, color: '#718096', margin: '2px 0' }}>/mi · {r.rpm > 0 ? fmt(r.total) : '—'}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: r.color + 'cc' }}>{r.sub}</div>
                    <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 2 }}>{r.label}</div>
                  </div>
                ))}
              </div>

              {/* RPM visual bar */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24 }}>
                  {[
                    { label: 'Broker', rpm: selected.brokerOffer, color: '#3182CE' },
                    { label: 'Market', rpm: selected.marketRate, color: '#718096' },
                    ...(selected.myCounter ? [{ label: 'Counter', rpm: selected.myCounter, color: '#8B5CF6' }] : []),
                    ...(selected.finalRate ? [{ label: 'Final', rpm: selected.finalRate, color: '#22C55E' }] : []),
                  ].map(bar => {
                    const max = 3.5
                    const w = (bar.rpm / max) * 100
                    return (
                      <div key={bar.label} style={{ flex: 1 }}>
                        <div style={{ fontSize: 8, color: '#A0AEC0', marginBottom: 2 }}>{bar.label}</div>
                        <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${w}%`, height: '100%', background: bar.color, borderRadius: 4 }} />
                        </div>
                        <div style={{ fontSize: 8, color: bar.color, fontWeight: 700, marginTop: 1 }}>${bar.rpm.toFixed(2)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Negotiation history */}
            <div className="card" style={{ padding: '16px 20px' }}>
              <h3 className="section-title" style={{ marginBottom: 14 }}>Negotiation Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {selected.history.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14, borderBottom: i < selected.history.length - 1 ? '1px solid #F0F4F8' : 'none' }}>
                    {/* Dot + line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
                      {i < selected.history.length - 1 && <div style={{ width: 2, flex: 1, background: '#E2E8F0', minHeight: 16 }} />}
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 5,
                          background: entry.color + '18', color: entry.color,
                        }}>
                          {entry.actor}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{entry.action}</span>
                        <span style={{ fontSize: 10, color: '#A0AEC0', marginLeft: 'auto' }}>{entry.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#4A5568' }}>{entry.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Notes */}
              {selected.notes && (
                <div style={{ marginTop: 8, padding: '10px 14px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FCD34D44' }}>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 2 }}>My Note</div>
                  <div style={{ fontSize: 12, color: '#4A5568' }}>{selected.notes}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, color: '#A0AEC0', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 40 }}>🤝</div>
            <div style={{ fontSize: 14, color: '#2D3748', fontWeight: 600 }}>Select a negotiation</div>
            <div style={{ fontSize: 12 }}>Click any item on the left</div>
          </div>
        )}
      </div>
    </div>
  )
}
