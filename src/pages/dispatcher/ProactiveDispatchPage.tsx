import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type DriverStatus = 'idle' | 'delivering_soon' | 'offer_pending' | 'in_transit'

type ReturnLoad = {
  id: string
  route: string
  miles: number
  rate: number
  rpm: number
  broker: string
  pickup: string
  badge?: string
}

type Driver = {
  id: string
  name: string
  initials: string
  status: DriverStatus
  color: string
  equipment?: string
  route: string
  eta: string
  etaMinutes: number
  progressPct?: number
  detail: string
  loads: ReturnLoad[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function fmtCountdown(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ── Static data ───────────────────────────────────────────────────────────────
const DRIVERS: Driver[] = [
  {
    id: 'tom',
    name: 'Tom B.',
    initials: 'TB',
    status: 'idle',
    color: '#DC2626',
    equipment: 'Flatbed 48ft',
    route: 'Houston, TX',
    eta: 'IDLE NOW',
    etaMinutes: 0,
    detail: 'Empty in Houston, TX since 06:00 AM (4h 12m ago)',
    loads: [
      { id: 'l1', route: 'Houston → Phoenix',      miles: 1017, rate: 2750, rpm: 2.71, broker: 'TQL',    pickup: 'Today 2PM' },
      { id: 'l2', route: 'Houston → Dallas',        miles: 238,  rate: 580,  rpm: 2.44, broker: 'Coyote', pickup: 'Today 4PM' },
      { id: 'l3', route: 'Houston → San Antonio',   miles: 197,  rate: 440,  rpm: 2.23, broker: 'Echo',   pickup: 'Today 3PM' },
    ],
  },
  {
    id: 'anna',
    name: 'Anna P.',
    initials: 'AP',
    status: 'delivering_soon',
    color: '#D97706',
    route: 'LA → Sacramento',
    eta: 'in 1h 45m',
    etaMinutes: 105,
    progressPct: 81,
    detail: 'Anna P. delivers Sacramento, CA at 12:15 PM (in 1h 45m)',
    loads: [
      { id: 'l4', route: 'Sacramento → Las Vegas', miles: 565, rate: 1550, rpm: 2.74, broker: 'FedEx Freight', pickup: 'Tomorrow 7AM' },
      { id: 'l5', route: 'Sacramento → Portland',  miles: 581, rate: 1480, rpm: 2.55, broker: 'CH Robinson',   pickup: 'Tomorrow 6AM' },
      { id: 'l6', route: 'Sacramento → Phoenix',   miles: 780, rate: 1890, rpm: 2.42, broker: 'TQL',           pickup: 'Tomorrow 8AM' },
    ],
  },
  {
    id: 'james',
    name: 'James P.',
    initials: 'JP',
    status: 'offer_pending',
    color: '#F97316',
    route: 'ATL → IND',
    eta: 'Offer expires',
    etaMinutes: 44,
    detail: 'ATL → IND · $2,100 · $2.92/mi · Worldwide',
    loads: [],
  },
  {
    id: 'sergiy',
    name: 'Sergiy K.',
    initials: 'SK',
    status: 'in_transit',
    color: '#16A34A',
    route: 'Miami → Atlanta',
    eta: 'ETA 6h 10m',
    etaMinutes: 370,
    progressPct: 48,
    detail: 'Miami → Atlanta · 48% · ETA 6h 10m',
    loads: [
      { id: 'l7', route: 'Atlanta → Charlotte', miles: 249, rate: 1100, rpm: 2.45, broker: 'TQL',    pickup: 'After 3PM' },
      { id: 'l8', route: 'Atlanta → Nashville', miles: 282, rate: 1490, rpm: 2.25, broker: 'Coyote', pickup: 'After 3PM' },
    ],
  },
  {
    id: 'mike',
    name: 'Mike R.',
    initials: 'MR',
    status: 'in_transit',
    color: '#16A34A',
    route: 'Chicago → Dallas',
    eta: 'ETA 4h 20m',
    etaMinutes: 260,
    progressPct: 64,
    detail: 'Chicago → Dallas · 64% · ETA 4h 20m',
    loads: [
      { id: 'l9',  route: 'Dallas → Chicago',     miles: 921, rate: 2850, rpm: 3.09, broker: 'TQL',    pickup: 'After 4PM', badge: 'Best' },
      { id: 'l10', route: 'Dallas → Kansas City',  miles: 484, rate: 1400, rpm: 2.89, broker: 'Echo',   pickup: 'After 4PM' },
    ],
  },
]

const STATUS_META: Record<DriverStatus, { label: string; icon: string; borderColor: string; bgColor: string }> = {
  idle:           { label: 'IDLE',            icon: '🔴', borderColor: '#DC2626', bgColor: '#FEF2F2' },
  delivering_soon:{ label: 'DELIVERING SOON', icon: '🟡', borderColor: '#D97706', bgColor: '#FFFBEB' },
  offer_pending:  { label: 'OFFER PENDING',   icon: '🟠', borderColor: '#F97316', bgColor: '#FFF7ED' },
  in_transit:     { label: 'IN TRANSIT',      icon: '🟢', borderColor: '#16A34A', bgColor: '#F0FFF4' },
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, color, label }: { pct: number; color: string; label?: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: 8, background: 'var(--c-border)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
        {/* Truck icon */}
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          fontSize: 10, lineHeight: 1,
        }}>🚛</div>
      </div>
    </div>
  )
}

// ── Load Mini Card ────────────────────────────────────────────────────────────
function LoadCard({ load, selected, onSelect }: {
  load: ReturnLoad
  selected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <div
      onClick={() => onSelect(load.id)}
      style={{
        flexShrink: 0,
        width: 220,
        padding: '10px 12px',
        borderRadius: 10,
        border: `2px solid ${selected ? '#4BAED4' : 'var(--c-border)'}`,
        background: selected ? '#EFF9FF' : 'var(--c-surface)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.15s',
      }}
    >
      {load.badge && (
        <div style={{
          position: 'absolute', top: -8, right: 8,
          background: '#16A34A', color: '#fff',
          fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
        }}>
          {load.badge}
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: 12, color: '#1A2535', marginBottom: 4 }}>{load.route}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#4BAED4' }}>{fmt(load.rate)}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6' }}>${load.rpm.toFixed(2)}/mi</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-text-muted)' }}>
        <span>{load.miles.toLocaleString()} mi</span>
        <span>{load.broker}</span>
      </div>
      <div style={{ fontSize: 10, color: '#D97706', fontWeight: 600, marginTop: 3 }}>Pickup: {load.pickup}</div>
    </div>
  )
}

// ── Driver Card — IDLE ────────────────────────────────────────────────────────
function IdleDriverCard({ driver, selectedLoad, onSelectLoad }: {
  driver: Driver
  selectedLoad: string | null
  onSelectLoad: (id: string) => void
}) {
  const meta = STATUS_META[driver.status]
  return (
    <div className="card" style={{
      border: `2px solid ${meta.borderColor}`,
      background: meta.bgColor,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: driver.color + '22', border: `2px solid ${driver.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: driver.color,
        }}>
          {driver.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{driver.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
              background: driver.color + '22', color: driver.color,
            }}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{driver.equipment} · {driver.route}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Idle time cost</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#DC2626' }}>-$357</div>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>$85/h × 4.2h</div>
        </div>
      </div>

      {/* Detail */}
      <div style={{
        padding: '8px 12px', borderRadius: 8,
        background: '#FEE2E2', border: '1px solid #FECACA',
        fontSize: 12, color: '#991B1B', fontWeight: 600, marginBottom: 12,
      }}>
        {driver.detail}
      </div>

      {/* Losses ticker */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
        padding: '6px 12px', background: '#DC262611', borderRadius: 8,
        fontSize: 12, color: '#DC2626', fontWeight: 700,
      }}>
        <span>📉</span>
        <span>Losses ticker: $85/h × 4.2h = <strong>$357 lost</strong></span>
      </div>

      {/* Pre-loaded loads */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8 }}>
          PRE-LOADED BACKHAUL OPTIONS
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {driver.loads.map(l => (
            <LoadCard key={l.id} load={l} selected={selectedLoad === l.id} onSelect={onSelectLoad} />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ background: '#DC2626', fontSize: 12 }}>
          🚨 Book Houston→Phoenix
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>
          📞 Call Tom
        </button>
      </div>
    </div>
  )
}

// ── Driver Card — DELIVERING SOON ─────────────────────────────────────────────
function DeliveringSoonCard({ driver, selectedLoad, onSelectLoad }: {
  driver: Driver
  selectedLoad: string | null
  onSelectLoad: (id: string) => void
}) {
  const meta = STATUS_META[driver.status]
  return (
    <div className="card" style={{ border: `2px solid ${meta.borderColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: driver.color + '22', border: `2px solid ${driver.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: driver.color,
        }}>
          {driver.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{driver.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
              background: driver.color + '22', color: driver.color,
            }}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{driver.route}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Delivers</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#D97706' }}>12:15 PM</div>
          <div style={{ fontSize: 11, color: '#D97706' }}>{driver.eta}</div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar pct={driver.progressPct ?? 0} color={driver.color} label="LA ──────────── Sacramento" />

      {/* Warning */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 12,
        padding: '8px 12px', background: '#FEF9C3', border: '1px solid #FDE68A',
        borderRadius: 8, fontSize: 12, color: '#92400E', fontWeight: 600,
      }}>
        ⚡ Start looking for backhaul NOW — best loads taken fast
      </div>

      {/* Pre-loaded loads */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 8 }}>
          SACRAMENTO RETURN LOADS
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {driver.loads.map(l => (
            <LoadCard key={l.id} load={l} selected={selectedLoad === l.id} onSelect={onSelectLoad} />
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginBottom: 12 }}>
        ⏱ Time to secure: ~45 min before best load is taken
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ background: '#D97706', fontSize: 12 }}>
          🔍 Find More Loads
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 12 }}>
          ⚡ Pre-Book Best
        </button>
      </div>
    </div>
  )
}

// ── Driver Card — OFFER PENDING ───────────────────────────────────────────────
function OfferPendingCard({ driver, countdown }: { driver: Driver; countdown: number }) {
  const meta = STATUS_META[driver.status]
  const isPulse = countdown < 300 // pulse faster when < 5 min

  return (
    <div className="card" style={{
      border: `2px solid ${meta.borderColor}`,
      background: meta.bgColor,
      animation: isPulse ? 'pulse-border 1s infinite' : undefined,
    }}>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: driver.color + '22', border: `2px solid ${driver.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: driver.color,
        }}>
          {driver.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{driver.name}</span>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
              background: driver.color + '22', color: driver.color,
            }}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>{driver.route}</div>
        </div>

        {/* Countdown */}
        <div style={{
          textAlign: 'center', padding: '8px 16px', borderRadius: 10,
          background: '#DC262611', border: '2px solid #DC2626',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#DC2626', marginBottom: 2 }}>OFFER EXPIRES</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
            {fmtCountdown(countdown)}
          </div>
        </div>
      </div>

      {/* Offer details */}
      <div style={{
        padding: '12px 14px', borderRadius: 10,
        background: 'var(--c-surface)', border: '1px solid var(--c-border)',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535', marginBottom: 6 }}>
          ATL → IND · <span style={{ color: '#4BAED4' }}>$2,100</span> · Worldwide
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#4A5568' }}>
            Rate: <strong style={{ color: '#8B5CF6' }}>$2.92/mi</strong>
          </div>
          <div style={{ fontSize: 12 }}>
            vs guarantee <strong>$2.40</strong> →{' '}
            <span style={{ color: '#16A34A', fontWeight: 800 }}>+$0.52 ABOVE ✅</span>
          </div>
        </div>
        <div style={{
          marginTop: 8, fontSize: 12, padding: '5px 10px',
          background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 7,
          color: '#9A3412', fontWeight: 700,
        }}>
          🔥 DAT market: $2.61/mi — this offer is 11.9% ABOVE market
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ background: '#16A34A', flex: 1, fontSize: 13 }}>
          ✅ BOOK NOW
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 13, color: '#DC2626', borderColor: '#DC2626' }}>
          ❌ Decline
        </button>
      </div>
    </div>
  )
}

// ── Driver Card — IN TRANSIT (compact) ────────────────────────────────────────
function InTransitCard({ driver, selectedLoad, onSelectLoad }: {
  driver: Driver
  selectedLoad: string | null
  onSelectLoad: (id: string) => void
}) {
  const meta = STATUS_META[driver.status]
  const ismike = driver.id === 'mike'

  return (
    <div className="card" style={{ border: `1.5px solid ${meta.borderColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: driver.color + '22', border: `2px solid ${driver.color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: driver.color,
        }}>
          {driver.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1A2535' }}>{driver.name}</span>
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 6,
              background: driver.color + '22', color: driver.color,
            }}>
              {meta.icon} {meta.label}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#4A5568', marginTop: 1 }}>{driver.detail}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--c-text-muted)' }}>
          {driver.eta}
        </div>
      </div>

      <ProgressBar pct={driver.progressPct ?? 0} color={driver.color} />

      <div style={{
        fontSize: 11, color: '#4A5568', fontWeight: 600, marginTop: 8, marginBottom: 10,
        padding: '5px 10px', background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 7,
      }}>
        {ismike ? '💡 Broker TQL already suggested 2 return loads' : '📅 Secure backhaul after 3PM today'}
      </div>

      {/* Compact loads */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {driver.loads.map(l => (
          <div
            key={l.id}
            onClick={() => onSelectLoad(l.id)}
            style={{
              flex: 1, minWidth: 160,
              padding: '8px 10px', borderRadius: 8,
              border: `1.5px solid ${selectedLoad === l.id ? '#4BAED4' : 'var(--c-border)'}`,
              background: selectedLoad === l.id ? '#EFF9FF' : 'var(--c-surface)',
              cursor: 'pointer', position: 'relative',
            }}
          >
            {l.badge && (
              <div style={{
                position: 'absolute', top: -7, right: 6,
                background: '#16A34A', color: '#fff',
                fontSize: 8, fontWeight: 800, padding: '1px 6px', borderRadius: 5,
              }}>
                {l.badge}
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2535', marginBottom: 3 }}>{l.route}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#4BAED4' }}>{fmt(l.rate)}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#8B5CF6' }}>${l.rpm.toFixed(2)}/mi</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {ismike ? (
          <>
            <button className="btn btn-primary" style={{ background: '#16A34A', fontSize: 11 }}>
              Book Dallas→Chicago
            </button>
            <button className="btn btn-ghost" style={{ fontSize: 11 }}>View More</button>
          </>
        ) : (
          <button className="btn btn-ghost" style={{ fontSize: 11 }}>View Loads</button>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProactiveDispatchPage() {
  const [selectedLoad, setSelectedLoad] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())
  const [offerCountdown, setOfferCountdown] = useState(44 * 60 + 12) // 44:12

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Offer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setOfferCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSelectLoad = (id: string) => {
    setSelectedLoad(prev => (prev === id ? null : id))
  }

  const urgentCount = DRIVERS.filter(
    d => d.status === 'delivering_soon' || d.status === 'idle'
  ).length

  const tom    = DRIVERS.find(d => d.id === 'tom')!
  const anna   = DRIVERS.find(d => d.id === 'anna')!
  const james  = DRIVERS.find(d => d.id === 'james')!
  const sergiy = DRIVERS.find(d => d.id === 'sergiy')!
  const mike   = DRIVERS.find(d => d.id === 'mike')!

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1A2535', margin: 0, letterSpacing: '-0.5px' }}>
            ⏰ Proactive Dispatch
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: '4px 0 0' }}>
            Plan tomorrow's loads today. Never scramble for a backhaul again.
          </p>
        </div>
        <div style={{
          textAlign: 'right', padding: '10px 16px',
          background: 'var(--c-surface)', border: '1px solid var(--c-border)',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: 2 }}>CURRENT TIME</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#4BAED4', fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(now)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── Alert Banner ─────────────────────────────────────────────────────── */}
      {urgentCount > 0 && (
        <div style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, #FEF9C3, #FEF3C7)',
          border: '2px solid #F59E0B',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#92400E' }}>
              2 drivers delivering within 2 hours — backhaul loads pre-loaded below
            </div>
            <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>
              Tom B. is already idle · Anna P. delivers in 1h 45m — act now to avoid revenue loss
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontWeight: 900, fontSize: 22, color: '#DC2626' }}>
            -{fmt(357)}
          </div>
        </div>
      )}

      {/* ── Driver Timeline ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="section-title" style={{ marginBottom: 14 }}>Driver Timeline</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Card 1 — Tom (IDLE) */}
          <IdleDriverCard driver={tom} selectedLoad={selectedLoad} onSelectLoad={handleSelectLoad} />

          {/* Card 2 — Anna (DELIVERING SOON) */}
          <DeliveringSoonCard driver={anna} selectedLoad={selectedLoad} onSelectLoad={handleSelectLoad} />

          {/* Card 3 — James (OFFER PENDING) */}
          <OfferPendingCard driver={james} countdown={offerCountdown} />

          {/* Card 4 — Sergiy (IN TRANSIT, 6h) */}
          <InTransitCard driver={sergiy} selectedLoad={selectedLoad} onSelectLoad={handleSelectLoad} />

          {/* Card 5 — Mike (IN TRANSIT, 4h) */}
          <InTransitCard driver={mike} selectedLoad={selectedLoad} onSelectLoad={handleSelectLoad} />

        </div>
      </div>

      {/* ── Planning Summary ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Left: Timeline */}
        <div className="card">
          <h2 className="section-title" style={{ marginBottom: 16 }}>Today's Load Securing Timeline</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '✅', time: '06:00',       label: "Book Tom's Houston backhaul", sub: '4h overdue',         color: '#DC2626', done: false, urgent: true  },
              { icon: '⏰', time: '10:30 → NOW', label: "Secure Anna's Sacramento return", sub: 'Act immediately',  color: '#D97706', done: false, urgent: true  },
              { icon: '⏰', time: '11:00',        label: "Confirm James's ATL→IND offer", sub: `${fmtCountdown(offerCountdown)} remaining`, color: '#F97316', done: false, urgent: true },
              { icon: '📅', time: '15:00',        label: "Find Sergiy's Atlanta backhaul", sub: 'Plan ahead',       color: '#16A34A', done: false, urgent: false },
              { icon: '📅', time: '16:00',        label: "Find Mike's Dallas return", sub: 'Plan ahead',            color: '#16A34A', done: false, urgent: false },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                background: item.urgent ? item.color + '0D' : '#F7FAFC',
                border: `1px solid ${item.urgent ? item.color + '44' : 'var(--c-border)'}`,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: item.color, fontVariantNumeric: 'tabular-nums' }}>
                      {item.time}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginTop: 2 }}>{item.sub}</div>
                </div>
                {item.urgent && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
                    background: item.color, color: '#fff', flexShrink: 0,
                  }}>
                    URGENT
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Revenue at Risk */}
        <div className="card" style={{
          background: 'linear-gradient(145deg, #FFF5F5, #FFF)',
          border: '2px solid #FECACA',
        }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Revenue at Risk</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Tom B. idle',     value: '-$357',    sub: 'already lost',          color: '#DC2626' },
              { label: 'James offer',     value: '$2,100',   sub: `expires ${fmtCountdown(offerCountdown)}`, color: '#F97316' },
            ].map(r => (
              <div key={r.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 10,
                background: '#fff', border: `1.5px solid ${r.color}33`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{r.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{r.sub}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: r.color }}>{r.value}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#FECACA', margin: '4px 0 16px' }} />

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 10,
              background: '#FEF2F2', border: '2px solid #DC2626',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>Total at risk today</div>
                <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>Act immediately</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#DC2626' }}>$2,457</div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 10,
              background: '#F0FFF4', border: '2px solid #16A34A',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>Potential if all secured</div>
                <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>Gross revenue today</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#16A34A' }}>+$8,680</div>
            </div>
          </div>

          <div style={{
            marginTop: 14, padding: '8px 12px', borderRadius: 8,
            background: '#EFF9FF', border: '1px solid #BAE6FD',
            fontSize: 11, color: '#0C4A6E', textAlign: 'center', fontWeight: 600,
          }}>
            💡 Secure all loads before noon to maximize today's revenue
          </div>
        </div>
      </div>
    </div>
  )
}
