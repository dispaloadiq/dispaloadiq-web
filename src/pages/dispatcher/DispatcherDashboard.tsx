import { useState, useEffect } from 'react'
import BookLoadModal from '../../components/BookLoadModal'
import MapView, { type TruckMarker } from '../../components/MapView'

// ── Types ─────────────────────────────────────────────────────────────────────
type LoadStage = 'idle' | 'searching' | 'offer_pending' | 'booked' | 'in_transit' | 'delivered' | 'invoiced'
type Client = {
  id: string; name: string; init: string; phone: string
  truck: string; equipment: string; homeBase: string; preferredLanes: string
  status: LoadStage; load: string | null; from: string | null; to: string | null
  eta: string | null; progress: number; broker: string | null
  currentRate: number | null; currentMiles: number | null
  rpm: number; rpmGuarantee: number
  grossHandled: number; commission: number; commissionPct: number
  loadsThisMonth: number; rating: number; avgRpm: number
  nextAction: string | null; nextActionTime: string | null
  pickupTime: string | null; deliveryTime: string | null
}
type ScheduleEvent = { time: string; clientId: string; clientName: string; type: string; location: string; note: string; color: string }
type BrokerPipeline = { broker: string; contact: string; loads: number; avgRate: number; pending: number; lastContact: string; status: 'warm' | 'active' | 'cold' }
type ActionPriority = 'critical' | 'urgent' | 'normal'
type ActionItem = { id: string; priority: ActionPriority; icon: string; title: string; subtitle: string; clientId: string | null; action: string; actionLabel: string; timeLeft?: string }
type Insight = { id: string; icon: string; text: string; urgency: 'high' | 'medium' | 'low' }

// ── Color Semantic System ─────────────────────────────────────────────────────
const C = {
  red:    '#EF4444',
  orange: '#F97316',
  yellow: '#EAB308',
  green:  '#22C55E',
  purple: '#8B5CF6',
  slate:  '#64748B',
  blue:   '#4BAED4',
  dark:   '#0D1B2A',
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: 'c1', name: 'Mike Rodriguez', init: 'MR', phone: '(312) 555-0142',
    truck: 'Dry Van · 53ft · IL 4829-XR', equipment: 'Dry Van', homeBase: 'Chicago, IL',
    preferredLanes: 'Midwest → South', status: 'in_transit',
    load: 'CG-4421', from: 'Chicago, IL', to: 'Dallas, TX', eta: '4h 20m', progress: 64,
    broker: 'TQL', currentRate: 2_786, currentMiles: 1_201,
    rpm: 2.32, rpmGuarantee: 2.30, grossHandled: 28_400, commission: 2_272, commissionPct: 8,
    loadsThisMonth: 8, rating: 4.9, avgRpm: 2.31,
    nextAction: 'Confirm delivery window', nextActionTime: 'In 2h',
    pickupTime: '07:00 AM', deliveryTime: '11:30 PM',
  },
  {
    id: 'c2', name: 'Sergiy Kovalchuk', init: 'SK', phone: '(305) 555-0198',
    truck: 'Reefer · 48ft · FL 7731-KA', equipment: 'Reefer', homeBase: 'Miami, FL',
    preferredLanes: 'Southeast → Northeast', status: 'in_transit',
    load: 'CG-4418', from: 'Miami, FL', to: 'Atlanta, GA', eta: '6h 10m', progress: 48,
    broker: 'Coyote', currentRate: 1_960, currentMiles: 800,
    rpm: 2.45, rpmGuarantee: 2.35, grossHandled: 24_600, commission: 1_968, commissionPct: 8,
    loadsThisMonth: 7, rating: 4.8, avgRpm: 2.42,
    nextAction: 'Temp check required', nextActionTime: 'Now',
    pickupTime: '06:30 AM', deliveryTime: '03:00 PM',
  },
  {
    id: 'c3', name: 'Tom Bradley', init: 'TB', phone: '(713) 555-0077',
    truck: 'Flatbed · 48ft · TX 2201-BB', equipment: 'Flatbed', homeBase: 'Houston, TX',
    preferredLanes: 'TX → Southwest', status: 'idle',
    load: null, from: null, to: null, eta: null, progress: 0,
    broker: null, currentRate: null, currentMiles: null,
    rpm: 0, rpmGuarantee: 2.25, grossHandled: 18_200, commission: 1_456, commissionPct: 8,
    loadsThisMonth: 5, rating: 4.7, avgRpm: 2.28,
    nextAction: 'Find next load', nextActionTime: 'ASAP',
    pickupTime: null, deliveryTime: null,
  },
  {
    id: 'c4', name: 'Anna Perez', init: 'AP', phone: '(213) 555-0304',
    truck: 'Dry Van · 53ft · CA 8812-PP', equipment: 'Dry Van', homeBase: 'Los Angeles, CA',
    preferredLanes: 'West Coast', status: 'in_transit',
    load: 'CG-4415', from: 'Los Angeles, CA', to: 'Sacramento, CA', eta: '1h 45m', progress: 81,
    broker: 'Echo', currentRate: 1_100, currentMiles: 380,
    rpm: 2.89, rpmGuarantee: 2.20, grossHandled: 20_100, commission: 1_608, commissionPct: 8,
    loadsThisMonth: 6, rating: 4.95, avgRpm: 2.71,
    nextAction: 'Prepare ePOD for delivery', nextActionTime: 'In 45m',
    pickupTime: '09:00 AM', deliveryTime: '12:15 PM',
  },
  {
    id: 'c5', name: 'James Park', init: 'JP', phone: '(404) 555-0211',
    truck: 'Dry Van · 53ft · GA 3344-KP', equipment: 'Dry Van', homeBase: 'Atlanta, GA',
    preferredLanes: 'Southeast → Midwest', status: 'offer_pending',
    load: 'OFFER-88', from: 'Atlanta, GA', to: 'Indianapolis, IN', eta: null, progress: 0,
    broker: 'Worldwide', currentRate: 2_100, currentMiles: 720,
    rpm: 2.92, rpmGuarantee: 2.40, grossHandled: 12_400, commission: 992, commissionPct: 8,
    loadsThisMonth: 3, rating: 4.6, avgRpm: 2.55,
    nextAction: 'Confirm load offer — expires 45min', nextActionTime: '45 min',
    pickupTime: null, deliveryTime: null,
  },
]

const SCHEDULE_TODAY: ScheduleEvent[] = [
  { time: '06:30 AM', clientId: 'c2', clientName: 'Sergiy K.', type: 'Pickup',    location: 'Miami Cold Storage, FL',   note: 'Reefer temp: -5°F, 800mi to Atlanta',     color: '#0EA5E9' },
  { time: '07:00 AM', clientId: 'c1', clientName: 'Mike R.',   type: 'Pickup',    location: 'Chicago DC, IL',            note: 'Load CG-4421, confirm BOL',               color: '#F97316' },
  { time: '09:00 AM', clientId: 'c4', clientName: 'Anna P.',   type: 'Pickup',    location: 'LA Distribution Ctr',       note: 'Short haul to Sacramento',                color: '#A855F7' },
  { time: '11:30 AM', clientId: 'c2', clientName: 'Sergiy K.', type: 'Check-in', location: 'Jacksonville, FL rest',     note: '30 min HOS break required',               color: '#0EA5E9' },
  { time: '12:15 PM', clientId: 'c4', clientName: 'Anna P.',   type: 'Delivery',  location: 'Sacramento, CA',            note: 'Get ePOD signature, send invoice today',  color: '#22C55E' },
  { time: '02:00 PM', clientId: 'c3', clientName: 'Tom B.',    type: 'Available', location: 'Houston, TX area',          note: 'Truck idle — find next load',             color: '#EF4444' },
  { time: '03:00 PM', clientId: 'c2', clientName: 'Sergiy K.', type: 'Delivery',  location: 'Atlanta, GA',               note: 'Collect ePOD, temp log required',         color: '#22C55E' },
  { time: '11:30 PM', clientId: 'c1', clientName: 'Mike R.',   type: 'Delivery',  location: 'Dallas, TX',                note: 'Overnight delivery window 10PM–2AM',      color: '#22C55E' },
]

const BROKER_PIPELINE: BrokerPipeline[] = [
  { broker: 'TQL',          contact: 'Dave Morris', loads: 12, avgRate: 2_640, pending: 1, lastContact: '2h ago',  status: 'active' },
  { broker: 'Coyote',       contact: 'Sara Kim',    loads:  9, avgRate: 2_480, pending: 2, lastContact: '4h ago',  status: 'active' },
  { broker: 'Echo Global',  contact: 'Rick T.',     loads:  7, avgRate: 2_310, pending: 0, lastContact: '1d ago',  status: 'warm'   },
  { broker: 'Worldwide',    contact: 'Mike P.',     loads:  4, avgRate: 2_190, pending: 1, lastContact: '6h ago',  status: 'warm'   },
  { broker: 'Uber Freight', contact: 'Auto',        loads:  3, avgRate: 2_050, pending: 0, lastContact: '2d ago',  status: 'cold'   },
]

const WEEK_DATA = [
  { day: 'Mon', commission: 222, gross: 2_786, loads: 2 },
  { day: 'Tue', commission: 148, gross: 1_854, loads: 1 },
  { day: 'Wed', commission: 0,   gross: 0,     loads: 0 },
  { day: 'Thu', commission: 192, gross: 2_400, loads: 2 },
  { day: 'Fri', commission: 176, gross: 2_200, loads: 2 },
  { day: 'Sat', commission: 0,   gross: 0,     loads: 0 },
  { day: 'Sun', commission: 0,   gross: 0,     loads: 0 },
]

const ACTION_ITEMS: ActionItem[] = [
  { id: 'a1', priority: 'critical', icon: '🚨', title: 'Book NOW — 45 min', subtitle: 'James P. · ATL→IND · $2,100', clientId: 'c5', action: 'book', actionLabel: 'Book Now', timeLeft: '44:32' },
  { id: 'a2', priority: 'urgent',   icon: '🌡️', title: 'Reefer temp check', subtitle: 'Sergiy K. · CG-4418', clientId: 'c2', action: 'contact', actionLabel: 'Contact' },
  { id: 'a3', priority: 'urgent',   icon: '📋', title: 'ePOD ready', subtitle: 'Anna P. · delivery 45min', clientId: 'c4', action: 'epod', actionLabel: 'Open ePOD' },
  { id: 'a4', priority: 'normal',   icon: '💤', title: 'Truck idle — revenue not running', subtitle: 'Tom Bradley · Flatbed 48ft · Houston TX · Idle since 6:00 AM (4h)', clientId: 'c3', action: 'findload', actionLabel: 'Find Load' },
  { id: 'a5', priority: 'normal',   icon: '📥', title: '2 urgent hire requests pending',   subtitle: 'Marcus Johnson (2 trucks) + Elena Vasquez (1 Reefer) — respond today', clientId: null, action: 'hire', actionLabel: 'Review' },
]

const AI_INSIGHTS: Insight[] = [
  { id: 'i1', icon: '💡', text: 'Tom B. idle 4h → 3 Flatbed loads near Houston: best $2.71/mi (+$0.46 vs guarantee)',  urgency: 'high'   },
  { id: 'i2', icon: '🔮', text: 'Anna P. delivers in 45 min → 2 return loads ex-Sacramento: $2.65–$2.80/mi',           urgency: 'medium' },
  { id: 'i3', icon: '📈', text: 'TQL rates +8% this week on Midwest→South — leverage for Mike\'s next booking',        urgency: 'low'    },
  { id: 'i4', icon: '💰', text: 'Commission pace: $738/wk. Hit $6K goal by 5/31 if you add 2 more active trucks',      urgency: 'low'    },
]

const HIRE_REQUESTS = [
  { id: 'HR-01', name: 'Marcus Johnson', trucks: 2, equipment: 'Dry Van',  lanes: 'TX–CA',   rpmOffer: 2.65, time: '2 min ago',  urgent: true  },
  { id: 'HR-02', name: 'Elena Vasquez',  trucks: 1, equipment: 'Reefer',   lanes: 'Midwest', rpmOffer: 2.80, time: '8 min ago',  urgent: true  },
  { id: 'HR-03', name: 'David Kim',      trucks: 1, equipment: 'Dry Van',  lanes: 'SE',      rpmOffer: 2.55, time: '32 min ago', urgent: false },
]

const GOAL_MONTHLY = 6000

const FLEET_TRUCKS: TruckMarker[] = [
  { id: 'c1', lat: 37.208, lng: -93.293, label: 'MR', status: 'in_transit', info: 'Mike R. · CG-4421 · Chicago→Dallas · 64%' },
  { id: 'c2', lat: 30.332, lng: -81.656, label: 'SK', status: 'in_transit', info: 'Sergiy K. · CG-4418 · Miami→Atlanta · 48%' },
  { id: 'c3', lat: 29.760, lng: -95.369, label: 'TB', status: 'idle',       info: 'Tom B. · Idle in Houston, TX' },
  { id: 'c4', lat: 38.100, lng: -121.200,label: 'AP', status: 'in_transit', info: 'Anna P. · CG-4415 · LA→Sacramento · 81%' },
  { id: 'c5', lat: 33.749, lng: -84.388, label: 'JP', status: 'parked',     info: 'James P. · Offer pending · Atlanta, GA' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const STAGE_META: Record<LoadStage, { label: string; color: string; bg: string; step: number }> = {
  idle:          { label: 'Idle',          color: C.red,    bg: '#FEF2F2', step: 0 },
  searching:     { label: 'Searching',     color: C.yellow, bg: '#FEFCE8', step: 1 },
  offer_pending: { label: 'Offer Pending', color: C.orange, bg: '#FFF7ED', step: 2 },
  booked:        { label: 'Booked',        color: '#16A34A', bg: '#F0FDF4', step: 3 },
  in_transit:    { label: 'In Transit',    color: C.green,  bg: '#F0FDF4', step: 4 },
  delivered:     { label: 'Delivered',     color: C.purple, bg: '#F5F3FF', step: 5 },
  invoiced:      { label: 'Invoiced',      color: C.slate,  bg: '#F8FAFC', step: 6 },
}

const PIPELINE_STAGES: LoadStage[] = ['idle', 'searching', 'offer_pending', 'booked', 'in_transit', 'delivered', 'invoiced']

// ── KpiCard ───────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon, onClick }: {
  label: string; value: string | number; sub: string; color: string; icon: string; onClick?: () => void
}) {
  return (
    <div
      className="stat-card"
      style={{ borderTopColor: color, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700, background: color + '18', padding: '2px 7px', borderRadius: 6 }}>{sub}</span>
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

// ── PipelineFunnel ────────────────────────────────────────────────────────────
function PipelineFunnel({ clients }: { clients: Client[] }) {
  const counts: Record<LoadStage, number> = {
    idle: 0, searching: 0, offer_pending: 0, booked: 0, in_transit: 0, delivered: 0, invoiced: 0,
  }
  const gross: Record<LoadStage, number> = {
    idle: 0, searching: 0, offer_pending: 0, booked: 0, in_transit: 0, delivered: 0, invoiced: 0,
  }
  clients.forEach(c => {
    counts[c.status]++
    gross[c.status] += c.currentRate ?? 0
  })
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
      {PIPELINE_STAGES.map((stage, i) => {
        const m = STAGE_META[stage]
        const count = counts[stage]
        const g = gross[stage]
        return (
          <div key={stage} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              height: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: count > 0 ? m.bg : '#F7FAFC',
              border: `1.5px solid ${count > 0 ? m.color : '#E2E8F0'}`,
              borderRadius: i === 0 ? '8px 0 0 8px' : i === PIPELINE_STAGES.length - 1 ? '0 8px 8px 0' : 0,
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: count > 0 ? m.color : '#CBD5E0' }}>{count}</div>
              {g > 0 && <div style={{ fontSize: 8, color: m.color, fontWeight: 700, marginTop: 1 }}>${(g / 1000).toFixed(1)}k</div>}
            </div>
            <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 4, lineHeight: 1.2, fontWeight: count > 0 ? 700 : 400 }}>
              {m.label.split(' ').map((w, wi) => <div key={wi}>{w}</div>)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── RouteTimeline ─────────────────────────────────────────────────────────────
function RouteTimeline({ from, to, progress, color }: { from: string; to: string; progress: number; color: string }) {
  const fromCity = from.split(',')[0]
  const toCity   = to.split(',')[0]
  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative', height: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.blue, border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${C.blue}`, flexShrink: 0 }} />
        <div style={{ flex: 1, height: 3, background: '#E2E8F0', position: 'relative', overflow: 'visible' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${color}, #0EA5E9)` }} />
          <div style={{
            position: 'absolute', top: -8, left: `${Math.min(progress, 96)}%`,
            transform: 'translateX(-50%)', fontSize: 14, lineHeight: 1,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
          }}>🚛</div>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E2E8F0', border: '2px solid #fff', boxShadow: '0 0 0 1.5px #A0AEC0', flexShrink: 0 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#718096', fontWeight: 600 }}>{fromCity}</span>
        <span style={{ fontSize: 9, color: C.blue, fontWeight: 700 }}>{progress}% complete</span>
        <span style={{ fontSize: 9, color: '#718096' }}>{toCity}</span>
      </div>
    </div>
  )
}

// ── AlertBar ──────────────────────────────────────────────────────────────────
function AlertBar({ items, onAction }: {
  items: ActionItem[]
  onAction: (item: ActionItem) => void
}) {
  const [countdown, setCountdown] = useState('44:32')
  const alertItems = items.filter(i => i.priority === 'critical' || i.priority === 'urgent').slice(0, 3)

  // Tick the countdown for the first critical item
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        const [m, s] = prev.split(':').map(Number)
        if (m === 0 && s === 0) return '00:00'
        if (s === 0) return `${String(m - 1).padStart(2, '0')}:59`
        return `${String(m).padStart(2, '0')}:${String(s - 1).padStart(2, '0')}`
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (alertItems.length === 0) return null

  return (
    <div style={{
      background: C.dark,
      borderRadius: 10,
      padding: '10px 14px',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      {/* Pulsing indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: C.red,
          boxShadow: `0 0 0 4px ${C.red}40`,
          animation: 'pulse 1.5s infinite',
        }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: C.red, letterSpacing: 1 }}>ALERT</span>
      </div>

      <div style={{ width: 1, height: 28, background: '#ffffff15', flexShrink: 0 }} />

      {/* Alert pills */}
      <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        {alertItems.map(item => {
          const isCritical = item.priority === 'critical'
          const borderColor = isCritical ? C.red : C.orange
          const displayTime = isCritical && item.timeLeft ? countdown : item.timeLeft
          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px 6px 8px',
              background: borderColor + '12',
              border: `1px solid ${borderColor}40`,
              borderLeft: `3px solid ${borderColor}`,
              borderRadius: 7,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{item.title}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginLeft: 6 }}>{item.subtitle}</span>
              </div>
              {displayTime && (
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
                  background: isCritical ? C.red : C.orange,
                  color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                }}>
                  {displayTime}
                </span>
              )}
              <button
                onClick={() => onAction(item)}
                style={{
                  padding: '4px 10px', borderRadius: 5, border: 'none',
                  background: C.orange, color: '#fff',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                }}
              >
                {item.actionLabel}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── IdleClientCard ────────────────────────────────────────────────────────────
function IdleClientCard({ client, onNavigate, onFindLoad }: {
  client: Client
  onNavigate: (page: string) => void
  onFindLoad: (c: Client) => void
}) {
  return (
    <div style={{
      border: `2px solid ${C.red}`,
      borderRadius: 12,
      background: '#FEF2F2',
      boxShadow: `0 0 16px rgba(239,68,68,0.15)`,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: `${C.red}10`,
        borderBottom: `1px solid ${C.red}30`,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: C.red,
          boxShadow: `0 0 0 4px ${C.red}30`,
          animation: 'pulse 1.5s infinite',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: C.red, letterSpacing: 0.5 }}>IDLE — 4h 12m</span>
        <span style={{ fontSize: 10, color: '#DC2626', marginLeft: 'auto' }}>Потери: ~$85/ч</span>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: `${C.red}15`, border: `2px solid ${C.red}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: C.red,
            }}>
              {client.init}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2535' }}>{client.name}</div>
              <div style={{ fontSize: 11, color: '#718096' }}>{client.equipment} · {client.homeBase}</div>
              <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{client.truck}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: '#718096' }}>Гарантия</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.red }}>${client.rpmGuarantee.toFixed(2)}/mi</div>
          </div>
        </div>

        {/* Warning message */}
        <div style={{
          padding: '10px 14px',
          background: `${C.red}08`,
          borderRadius: 8,
          border: `1px dashed ${C.red}40`,
          marginBottom: 14,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <span style={{ fontSize: 22 }}>🚛</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Грузовик стоит — деньги не работают</div>
            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
              Потери: ~$85/ч · Гарантия: ${client.rpmGuarantee.toFixed(2)}/mi
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onFindLoad(client)}
            style={{
              flex: 1, padding: '10px 14px',
              background: C.red, color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            🚨 НАЙТИ ГРУЗ СЕЙЧАС
          </button>
          <button
            onClick={() => onNavigate('ai-match')}
            style={{
              flex: 1, padding: '10px 14px',
              background: '#fff', color: C.red,
              border: `1.5px solid ${C.red}`,
              borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            🤖 AI — 3 матча готово
          </button>
        </div>
      </div>
    </div>
  )
}

// ── OfferPendingCard ──────────────────────────────────────────────────────────
function OfferPendingCard({ client, onBook }: {
  client: Client
  onBook: (c: Client) => void
}) {
  const [countdown, setCountdown] = useState('44:32')

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        const [m, s] = prev.split(':').map(Number)
        if (m === 0 && s === 0) return '00:00'
        if (s === 0) return `${String(m - 1).padStart(2, '0')}:59`
        return `${String(m).padStart(2, '0')}:${String(s - 1).padStart(2, '0')}`
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      border: `2px solid ${C.orange}`,
      borderRadius: 12,
      background: '#FFF7ED',
      boxShadow: `0 0 16px rgba(249,115,22,0.15)`,
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: `${C.orange}12`,
        borderBottom: `1px solid ${C.orange}30`,
      }}>
        <span style={{ fontSize: 14 }}>⏰</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.orange }}>ОФФЕР ИСТЕКАЕТ</span>
        <div style={{
          marginLeft: 'auto',
          fontSize: 14, fontWeight: 900,
          color: '#fff', background: C.orange,
          padding: '2px 10px', borderRadius: 6,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {countdown}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: `${C.orange}15`, border: `2px solid ${C.orange}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: C.orange,
          }}>
            {client.init}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2535' }}>{client.name}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginTop: 2 }}>
              {client.from} → {client.to}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#718096' }}>Broker: {client.broker}</span>
              <span style={{ fontSize: 11, color: '#718096' }}>{client.currentMiles?.toLocaleString()} mi</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>{fmt(client.currentRate ?? 0)}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A' }}>${client.rpm.toFixed(2)}/mi</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#718096' }}>vs гарантия</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>+${(client.rpm - client.rpmGuarantee).toFixed(2)}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onBook(client)}
            style={{
              flex: 2, padding: '9px 14px',
              background: C.green, color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
            }}
          >
            ✅ Book Load
          </button>
          <button
            style={{
              flex: 1, padding: '9px 10px',
              background: '#fff', color: C.red,
              border: `1.5px solid ${C.red}`,
              borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ❌ Decline
          </button>
          <button
            style={{
              flex: 1, padding: '9px 10px',
              background: '#fff', color: C.blue,
              border: `1.5px solid ${C.blue}`,
              borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            💬 Message
          </button>
        </div>
      </div>
    </div>
  )
}

// ── TransitClientCard ─────────────────────────────────────────────────────────
function TransitClientCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      border: `1px solid ${C.green}40`,
      borderLeft: `3px solid ${C.green}`,
      borderRadius: 10,
      background: '#fff',
      overflow: 'hidden',
    }}>
      {/* Compact header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${C.green}15`, border: `1.5px solid ${C.green}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: C.green,
        }}>
          {client.init}
        </div>

        {/* Name */}
        <div style={{ flex: '0 0 130px', minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{client.name}</div>
          <div style={{ fontSize: 9, color: '#A0AEC0', whiteSpace: 'nowrap' }}>{client.equipment}</div>
        </div>

        {/* Status badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
          background: `${C.green}15`, color: C.green, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          🟢 In Transit
        </span>

        {/* ETA */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, whiteSpace: 'nowrap' }}>ETA: {client.eta}</div>
        </div>

        {/* Rate/miles */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 90 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2D3748' }}>{fmt(client.currentRate ?? 0)}</div>
          <div style={{ fontSize: 9, color: '#A0AEC0' }}>{client.broker} · {client.currentMiles?.toLocaleString()} mi · ${client.rpm.toFixed(2)}/mi</div>
        </div>

        {/* Expand */}
        <div style={{ color: '#A0AEC0', fontSize: 12, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Route progress bar */}
      {client.from && client.to && client.progress > 0 && (
        <RouteTimeline from={client.from} to={client.to} progress={client.progress} color={C.green} />
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: '1px solid #EDF2F7',
          padding: '12px 14px',
          background: '#F7FAFC',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}>
          {[
            { label: 'Phone',              value: client.phone },
            { label: 'Home Base',          value: client.homeBase },
            { label: 'Preferred Lanes',    value: client.preferredLanes },
            { label: 'Commission %',       value: `${client.commissionPct}%` },
            { label: 'Avg RPM (all-time)', value: `$${client.avgRpm.toFixed(2)}/mi` },
            { label: 'Gross This Month',   value: fmt(client.grossHandled) },
            { label: 'Rating',             value: `⭐ ${client.rating}` },
            { label: 'Pickup Time',        value: client.pickupTime ?? '—' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{f.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── SchedulePanel ─────────────────────────────────────────────────────────────
function SchedulePanel({ events }: { events: ScheduleEvent[] }) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', marginBottom: 12, letterSpacing: 0.3 }}>
        📅 TODAY'S SCHEDULE
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: i < events.length - 1 ? '1px solid #F0F4F8' : 'none' }}>
            {/* Time */}
            <div style={{ width: 58, flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568' }}>{ev.time}</div>
            </div>
            {/* Dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.color, border: '2px solid #fff', boxShadow: `0 0 0 2px ${ev.color}44`, flexShrink: 0 }} />
              {i < events.length - 1 && <div style={{ width: 2, flex: 1, background: '#E2E8F0', minHeight: 10, marginTop: 2 }} />}
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingBottom: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: ev.color + '18', color: ev.color }}>{ev.type}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1A2535' }}>{ev.clientName}</span>
              </div>
              <div style={{ fontSize: 11, color: '#4A5568' }}>{ev.location}</div>
              <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 1 }}>{ev.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AiInsightsPanel ───────────────────────────────────────────────────────────
function AiInsightsPanel({ insights }: { insights: Insight[] }) {
  const urgencyColor = { high: C.red, medium: C.orange, low: C.blue }
  const urgencyBg    = { high: '#FEF2F2', medium: '#FFF7ED', low: '#EFF6FF' }
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <span style={{ fontSize: 14 }}>🤖</span>
        <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', margin: 0, letterSpacing: 0.3 }}>AI INSIGHTS</h3>
        <span style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 500 }}>real-time</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {insights.map(ins => (
          <div key={ins.id} style={{
            padding: '8px 10px', borderRadius: 8,
            background: urgencyBg[ins.urgency],
            border: `1px solid ${urgencyColor[ins.urgency]}30`,
            borderLeft: `3px solid ${urgencyColor[ins.urgency]}`,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{ins.icon}</span>
            <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.45, fontWeight: 500 }}>{ins.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DispatcherDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {

  const [bookingClient, setBookingClient] = useState<Client | null>(null)
  const [clientStages, setClientStages]   = useState<Record<string, LoadStage>>(
    Object.fromEntries(CLIENTS.map(c => [c.id, c.status]))
  )

  const clients = CLIENTS.map(c => ({ ...c, status: clientStages[c.id] ?? c.status }))

  const totalCommission   = clients.reduce((s, c) => s + c.commission, 0)
  const totalGrossHandled = clients.reduce((s, c) => s + c.grossHandled, 0)
  const activeCount       = clients.filter(c => c.status === 'in_transit').length
  const weekCommission    = WEEK_DATA.reduce((s, d) => s + d.commission, 0)
  const pace              = weekCommission / 4
  const monthForecast     = weekCommission + pace * 15

  const handleFindLoad = (client: Client) => setBookingClient(client)
  const handleBook     = (client: Client) => setBookingClient(client)
  const handleBooked   = () => {
    if (!bookingClient) return
    setClientStages(s => ({ ...s, [bookingClient.id]: 'booked' }))
  }

  const handleActionClick = (item: ActionItem) => {
    if (item.action === 'book') {
      const c = clients.find(cl => cl.id === item.clientId)
      if (c) setBookingClient(c)
    } else if (item.action === 'findload') {
      const c = clients.find(cl => cl.id === item.clientId)
      if (c) setBookingClient(c)
    } else if (item.action === 'hire') {
      onNavigate('dispatcher-profile')
    } else if (item.action === 'epod') {
      onNavigate('epod')
    } else if (item.action === 'contact') {
      // contact action — no navigation needed
    }
  }

  // Partition clients by urgency
  const idleClients         = clients.filter(c => c.status === 'idle')
  const offerPendingClients = clients.filter(c => c.status === 'offer_pending')
  const transitClients      = clients.filter(c => c.status === 'in_transit')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Booking modal */}
      {bookingClient && (
        <BookLoadModal
          client={bookingClient}
          onClose={() => setBookingClient(null)}
          onBooked={handleBooked}
        />
      )}

      {/* ── ZONE 1: Sticky Alert Bar ────────────────────────────────────────── */}
      <AlertBar items={ACTION_ITEMS} onAction={handleActionClick} />

      {/* ── ZONE 2: KPI Strip ───────────────────────────────────────────────── */}
      <div className="stats-grid">
        <KpiCard
          label="Commission Today"  value={fmt(738)}
          sub="+22% vs last week"   color={C.purple} icon="💰"
          onClick={() => onNavigate('finance')}
        />
        <KpiCard
          label="Active Clients"    value={activeCount}
          sub={`${idleClients.length} idle · ${offerPendingClients.length} offer`}
          color={C.green} icon="🚛"
        />
        <KpiCard
          label="Gross (Week)"      value={fmt(WEEK_DATA.reduce((s, d) => s + d.gross, 0))}
          sub="This week"           color={C.blue} icon="📊"
        />
        <KpiCard
          label="Loads (Month)"     value={clients.reduce((s, c) => s + c.loadsThisMonth, 0)}
          sub={`${fmt(Math.round(monthForecast))} projected commission`}
          color={C.orange} icon="📦"
        />
        <KpiCard
          label="Avg RPM"           value={`$${(clients.filter(c => c.avgRpm > 0).reduce((s, c) => s + c.avgRpm, 0) / Math.max(clients.filter(c => c.avgRpm > 0).length, 1)).toFixed(2)}`}
          sub="All clients avg"     color="#16A34A" icon="📈"
          onClick={() => onNavigate('finance')}
        />
      </div>

      {/* ── ZONE 3: Two-column main content ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>

        {/* ── LEFT COLUMN: Client Status Board ────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Section header + pipeline funnel */}
          <div className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#1A2535' }}>
                MY CLIENTS ({clients.length})
              </h3>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('marketplace')}>+ Add Client</button>
            </div>
            <PipelineFunnel clients={clients} />
          </div>

          {/* ── State A: IDLE clients — large red cards ── */}
          {idleClients.map(client => (
            <IdleClientCard
              key={client.id}
              client={client}
              onNavigate={onNavigate}
              onFindLoad={handleFindLoad}
            />
          ))}

          {/* ── State B: OFFER_PENDING clients — orange countdown cards ── */}
          {offerPendingClients.map(client => (
            <OfferPendingCard
              key={client.id}
              client={client}
              onBook={handleBook}
            />
          ))}

          {/* ── State C: IN_TRANSIT clients — compact green cards ── */}
          {transitClients.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transitClients.map(client => (
                <TransitClientCard key={client.id} client={client} />
              ))}
            </div>
          )}

          {/* View full CRM link */}
          <button
            onClick={() => onNavigate('clients')}
            className="btn btn-ghost"
            style={{ fontSize: 12, alignSelf: 'flex-start' }}
          >
            View full client CRM →
          </button>
        </div>

        {/* ── RIGHT COLUMN: Operations panel ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 1. Today's Schedule */}
          <SchedulePanel events={SCHEDULE_TODAY} />

          {/* 2. Fleet Live Map */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>🗺️ FLEET LIVE MAP</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 10 }}>
                <span style={{ color: C.green, fontWeight: 600 }}>● Transit</span>
                <span style={{ color: C.red, fontWeight: 600 }}>● Idle</span>
                <span style={{ color: C.orange, fontWeight: 600 }}>● Pending</span>
              </div>
            </div>
            <MapView
              height={200}
              center={{ lat: 36.5, lng: -96.0 }}
              zoom={4}
              trucks={FLEET_TRUCKS}
              dark={false}
              compact={true}
            />
          </div>

          {/* 3. AI Insights */}
          <AiInsightsPanel insights={AI_INSIGHTS} />

          {/* Quick Actions */}
          <div className="card" style={{ padding: 14 }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, color: '#1A2535', marginBottom: 10, letterSpacing: 0.3 }}>QUICK ACTIONS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { icon: '📦', label: 'Load Board',     page: 'loads'          },
                { icon: '📋', label: 'Dispatch Board', page: 'dispatch-board' },
                { icon: '💰', label: 'Earnings',       page: 'finance'        },
                { icon: '📃', label: 'Contracts',      page: 'contracts'      },
                { icon: '📊', label: 'Market Rates',   page: 'rates'          },
                { icon: '🤖', label: 'AI Assistant',   page: 'ai'             },
                { icon: '🆘', label: 'Emergency Load', page: 'emergency-load' },
                { icon: '📥', label: `Hire Requests (${HIRE_REQUESTS.length})`, page: 'dispatcher-profile' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.page)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px',
                  borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F7FAFC',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#2D3748',
                }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Broker Pipeline summary */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', margin: 0 }}>🤝 BROKER PIPELINE</h3>
              <button onClick={() => onNavigate('broker-crm')} style={{ fontSize: 11, color: C.blue, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Full →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {BROKER_PIPELINE.map(b => {
                const statusColor = b.status === 'active' ? C.green : b.status === 'warm' ? C.orange : C.slate
                return (
                  <div key={b.broker} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', background: '#F7FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: statusColor + '15', border: `1.5px solid ${statusColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: statusColor,
                    }}>
                      {b.broker.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{b.broker}</div>
                      <div style={{ fontSize: 10, color: '#718096' }}>{b.contact} · {b.lastContact}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{fmt(b.avgRate)}</div>
                      <div style={{ fontSize: 9, color: '#A0AEC0' }}>{b.loads} loads</div>
                    </div>
                    {b.pending > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5, background: C.orange + '18', color: C.orange, flexShrink: 0 }}>
                        {b.pending} pending
                      </span>
                    )}
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                      background: statusColor + '15', color: statusColor, flexShrink: 0,
                    }}>
                      {b.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Monthly Goal progress */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', margin: 0 }}>🎯 MONTHLY GOAL</h3>
              <span style={{ fontSize: 11, color: '#718096' }}>19 days left</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 10, background: '#E2E8F0', borderRadius: 5, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%',
                width: `${Math.min((totalCommission / GOAL_MONTHLY) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${C.purple}, ${C.blue})`,
                borderRadius: 5,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.purple }}>{fmt(totalCommission)}</span>
              <span style={{ fontSize: 11, color: '#A0AEC0' }}>Goal: {fmt(GOAL_MONTHLY)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ textAlign: 'center', padding: '8px', background: '#F7FAFC', borderRadius: 7 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>{fmt(Math.max(GOAL_MONTHLY - totalCommission, 0))}</div>
                <div style={{ fontSize: 9, color: '#A0AEC0' }}>Remaining</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: '#F7FAFC', borderRadius: 7 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.blue }}>{fmt(Math.round((GOAL_MONTHLY - totalCommission) / 19))}/day</div>
                <div style={{ fontSize: 9, color: '#A0AEC0' }}>Daily Pace</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
