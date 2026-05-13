import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface BookedLoad {
  id: string
  ref: string
  from: string
  to: string
  miles: number
  payout: number
  rpm: number
  date: string
  status: 'delivered' | 'in-transit' | 'upcoming' | 'cancelled'
  broker: string
  commodity: string
  weight: number
}

interface WeekStat {
  week: string
  rpm: number
  loads: number
  revenue: number
}

interface Review {
  author: string
  avgRpm: number
  months: number
  text: string
  date: string
  rating: number
  categories: { label: string; score: number }[]
}

interface CommMessage {
  id: number
  from: 'me' | 'them'
  text: string
  time: string
}

interface LanePref {
  from: string
  to: string
  minRpm: number
  priority: 'high' | 'medium' | 'low'
}

interface DisputeRecord {
  id: string
  date: string
  load: string
  issue: string
  status: 'open' | 'resolved' | 'dismissed'
  outcome?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CONTRACT = {
  dispatcher: {
    id: '1',
    name: 'Alex Petrov',
    avatar: '👨‍💼',
    location: 'Chicago, IL',
    rating: 4.98,
    reviewCount: 312,
    phone: '+1 (312) 555-0194',
    email: 'alex.petrov@dispatchpro.com',
    responseTime: '< 5 min',
    pricing: { model: 'percent' as const, value: 5, label: '5% of gross' },
    rpmGuarantee: 2.45,
    trust: { platformVerified: true, dotVerified: true },
    specialties: ['Dry Van', 'Reefer', 'Power Only'],
    activeClients: 14,
    yearsExperience: 9,
  },
  startDate: 'Mar 1, 2025',
  type: 'standard' as 'trial' | 'standard',
  status: 'active' as 'active' | 'pending' | 'ended',
  noticeDays: 14,
  monthlyMinimum: 5,
}

const LOADS: BookedLoad[] = [
  { id: '1',  ref: 'EG-920441', from: 'Chicago, IL',   to: 'Dallas, TX',      miles: 850,  payout: 1854, rpm: 2.18, date: 'May 12', status: 'in-transit', broker: 'Echo Global',       commodity: 'Auto Parts',     weight: 42000 },
  { id: '2',  ref: 'CL-773201', from: 'Atlanta, GA',   to: 'Miami, FL',       miles: 662,  payout: 1622, rpm: 2.45, date: 'May 13', status: 'upcoming',   broker: 'Coyote Logistics',  commodity: 'Electronics',    weight: 28000 },
  { id: '3',  ref: 'TQ-554832', from: 'Houston, TX',   to: 'Phoenix, AZ',     miles: 1201, payout: 2786, rpm: 2.32, date: 'May 11', status: 'in-transit', broker: 'TQL',               commodity: 'Steel Coils',    weight: 44000 },
  { id: '4',  ref: 'AL-887723', from: 'Nashville, TN', to: 'Charlotte, NC',   miles: 408,  payout: 796,  rpm: 1.95, date: 'May 8',  status: 'delivered',  broker: 'Arrive Logistics',  commodity: 'Furniture',      weight: 18000 },
  { id: '5',  ref: 'CH-990012', from: 'Miami, FL',     to: 'New York, NY',    miles: 1281, payout: 3267, rpm: 2.55, date: 'May 6',  status: 'delivered',  broker: 'CH Robinson',       commodity: 'Produce',        weight: 38000 },
  { id: '6',  ref: 'WE-334561', from: 'Memphis, TN',   to: 'Nashville, TN',   miles: 212,  payout: 508,  rpm: 2.40, date: 'May 3',  status: 'delivered',  broker: 'Worldwide Express', commodity: 'Dry Goods',      weight: 22000 },
  { id: '7',  ref: 'XP-211098', from: 'Denver, CO',    to: 'Kansas City, MO', miles: 601,  payout: 1502, rpm: 2.50, date: 'Apr 28', status: 'delivered',  broker: 'XPO Logistics',     commodity: 'Packaged Goods', weight: 33000 },
  { id: '8',  ref: 'RT-445521', from: 'Chicago, IL',   to: 'Houston, TX',     miles: 1092, payout: 2620, rpm: 2.40, date: 'Apr 22', status: 'delivered',  broker: 'RXO',               commodity: 'Auto Parts',     weight: 40000 },
  { id: '9',  ref: 'MO-667732', from: 'Los Angeles, CA', to: 'Phoenix, AZ',   miles: 372,  payout: 930,  rpm: 2.50, date: 'Apr 18', status: 'delivered',  broker: 'MoLo Solutions',    commodity: 'Consumer Goods', weight: 25000 },
  { id: '10', ref: 'EC-881203', from: 'Chicago, IL',   to: 'Atlanta, GA',     miles: 716,  payout: 1789, rpm: 2.50, date: 'Apr 14', status: 'delivered',  broker: 'Echo Global',       commodity: 'Electronics',    weight: 31000 },
  { id: '11', ref: 'TR-229944', from: 'Dallas, TX',    to: 'El Paso, TX',     miles: 622,  payout: 1244, rpm: 2.00, date: 'Apr 10', status: 'delivered',  broker: 'Transplace',        commodity: 'Industrial',     weight: 36000 },
  { id: '12', ref: 'RB-114409', from: 'St. Louis, MO', to: 'Memphis, TN',     miles: 284,  payout: 682,  rpm: 2.40, date: 'Apr 7',  status: 'delivered',  broker: 'Redwood Logistics', commodity: 'Food Grade',     weight: 19000 },
]

const WEEKLY: WeekStat[] = [
  { week: 'Mar 24', rpm: 2.61, loads: 5, revenue: 9240  },
  { week: 'Mar 31', rpm: 2.58, loads: 4, revenue: 8120  },
  { week: 'Apr 7',  rpm: 2.64, loads: 6, revenue: 11340 },
  { week: 'Apr 14', rpm: 2.69, loads: 5, revenue: 10880 },
  { week: 'Apr 21', rpm: 2.48, loads: 5, revenue: 9860  },
  { week: 'Apr 28', rpm: 2.61, loads: 4, revenue: 8840  },
  { week: 'May 5',  rpm: 2.43, loads: 3, revenue: 6262  },
]

const REVIEWS: Review[] = [
  {
    author: 'Sergiy K.', avgRpm: 2.74, months: 14, date: 'Apr 2025', rating: 5,
    text: 'Alex найшов мені в неділю вантаж $3,400 коли всі мовчали. 14 місяців — жодного тижня нижче $2,600 RPM. Рекомендую всім.',
    categories: [{ label: 'Communication', score: 100 }, { label: 'RPM Results', score: 98 }, { label: 'Responsiveness', score: 100 }, { label: 'Reliability', score: 97 }],
  },
  {
    author: 'Mike R.', avgRpm: 2.71, months: 8, date: 'Mar 2025', rating: 5,
    text: "Best dispatcher I've had in 9 years. Responds at any hour. Zero dead miles in 8 months. Negotiated $0.40+ above DAT average consistently.",
    categories: [{ label: 'Communication', score: 99 }, { label: 'RPM Results', score: 97 }, { label: 'Responsiveness', score: 100 }, { label: 'Reliability', score: 98 }],
  },
  {
    author: 'James C.', avgRpm: 2.68, months: 6, date: 'Feb 2025', rating: 5,
    text: 'Alex turned my slow months around. March was my best month ever — $18k gross. He keeps me loaded even in tough market conditions.',
    categories: [{ label: 'Communication', score: 98 }, { label: 'RPM Results', score: 96 }, { label: 'Responsiveness', score: 99 }, { label: 'Reliability', score: 95 }],
  },
  {
    author: 'Elena V.', avgRpm: 2.62, months: 4, date: 'Jan 2025', rating: 5,
    text: 'Quick pay, no games, always reachable. Switched from a 6% dispatcher and never looked back. The 5% rate is worth every cent.',
    categories: [{ label: 'Communication', score: 97 }, { label: 'RPM Results', score: 94 }, { label: 'Responsiveness', score: 100 }, { label: 'Reliability', score: 96 }],
  },
]

const COMM_MESSAGES: CommMessage[] = [
  { id: 1, from: 'them', text: 'Found you a great load Chicago→Dallas $1,854 pickup tomorrow morning. Want me to book it?', time: '2 min ago' },
  { id: 2, from: 'me',   text: 'Yes, go ahead. Also check for something Thursday out of Dallas.', time: '1 min ago' },
  { id: 3, from: 'them', text: "Perfect. Booked EG-920441 with Echo Global. I'll look for Thursday loads now.", time: 'Just now' },
]

const LANE_PREFS: LanePref[] = [
  { from: 'Chicago, IL', to: 'Dallas, TX',    minRpm: 2.20, priority: 'high'   },
  { from: 'Chicago, IL', to: 'Houston, TX',   minRpm: 2.30, priority: 'high'   },
  { from: 'Chicago, IL', to: 'Atlanta, GA',   minRpm: 2.15, priority: 'medium' },
  { from: 'Miami, FL',   to: 'New York, NY',  minRpm: 2.40, priority: 'medium' },
  { from: 'Denver, CO',  to: 'Kansas City, MO', minRpm: 2.20, priority: 'low' },
]

const DISPUTES: DisputeRecord[] = [
  { id: 'D-003', date: 'Apr 2025', load: 'TQ-554832', issue: 'RPM below guaranteed minimum for week of Apr 7', status: 'open' },
  { id: 'D-002', date: 'Feb 2025', load: 'RT-445521', issue: 'Late check-in notification caused detention fees', status: 'resolved', outcome: 'Dispatcher absorbed $150 fee' },
  { id: 'D-001', date: 'Jan 2025', load: 'XP-211098', issue: 'Broker changed pickup time without notice', status: 'dismissed', outcome: 'Outside dispatcher control' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function RpmSparkline({ data }: { data: WeekStat[] }) {
  const w = 220
  const h = 48
  const pad = 8
  const vals = data.map(d => d.rpm)
  const minV = Math.min(...vals) - 0.1
  const maxV = Math.max(...vals) + 0.1
  const toX = (i: number) => pad + (i / (vals.length - 1)) * (w - pad * 2)
  const toY = (v: number) => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2)
  const pts = vals.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const polyPts = `${toX(0)},${h} ${pts} ${toX(vals.length - 1)},${h}`
  const latest = vals[vals.length - 1]
  const prev   = vals[vals.length - 2]
  const up     = latest >= prev
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="rpmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? '#38C770' : '#EF4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={up ? '#38C770' : '#EF4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#rpmGrad)" />
      <polyline points={pts} fill="none" stroke={up ? '#38C770' : '#EF4444'} strokeWidth={2} strokeLinejoin="round" />
      {vals.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={2.5} fill={up ? '#38C770' : '#EF4444'} />
      ))}
    </svg>
  )
}

function RevenueBarChart({ data }: { data: WeekStat[] }) {
  const maxRev = Math.max(...data.map(d => d.revenue))
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
      {data.map(w => {
        const pct = Math.round((w.revenue / maxRev) * 100)
        return (
          <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4BAED4' }}>${(w.revenue / 1000).toFixed(1)}k</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 90 }}>
              <div style={{
                borderRadius: '4px 4px 0 0',
                height: `${Math.max(pct, 8)}%`,
                background: 'linear-gradient(180deg,#4BAED4,#2C7A9A)',
                minHeight: 6,
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#A0AEC0', textAlign: 'center', lineHeight: 1.2 }}>{w.week}</div>
          </div>
        )
      })}
    </div>
  )
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: size }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyDispatcherPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [tab, setTab]              = useState<'overview' | 'loads' | 'financials' | 'reviews' | 'preferences'>('overview')
  const [showEnd, setShowEnd]      = useState(false)
  const [showReview, setShowReview]= useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showDispute, setShowDispute] = useState(false)
  const [msgText, setMsgText]      = useState('')
  const [commMessages, setCommMessages] = useState<CommMessage[]>(COMM_MESSAGES)
  const [loadFilter, setLoadFilter]= useState<'all' | 'delivered' | 'in-transit' | 'upcoming'>('all')
  const [reviewStars, setReviewStars] = useState<Record<string, number>>({})
  const [noDispatcher] = useState(false)

  const d = CONTRACT.dispatcher
  const deliveredLoads = LOADS.filter(l => l.status === 'delivered')
  const activeLoads    = LOADS.filter(l => l.status === 'in-transit' || l.status === 'upcoming')
  const totalRevenue   = LOADS.filter(l => l.status !== 'upcoming').reduce((s, l) => s + l.payout, 0)
  const totalMiles     = LOADS.filter(l => l.status !== 'upcoming').reduce((s, l) => s + l.miles, 0)
  const avgRpm         = totalMiles > 0 ? totalRevenue / totalMiles : 0
  const dispFee        = Math.round(totalRevenue * (d.pricing.value / 100))
  const rpmVsGuarantee = avgRpm - d.rpmGuarantee
  const thisMonthRev   = deliveredLoads.reduce((s, l) => s + l.payout, 0)
  const fuelEstimate   = Math.round(totalMiles * 0.44)
  const netProfit      = Math.round(thisMonthRev - dispFee - fuelEstimate)

  const filteredLoads = LOADS.filter(l => loadFilter === 'all' || l.status === loadFilter)

  function sendMessage() {
    if (!msgText.trim()) return
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setCommMessages(prev => [...prev, { id: Date.now(), from: 'me', text: msgText, time: now }])
    setMsgText('')
  }

  if (noDispatcher) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>🧭</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2535' }}>No Dispatcher Hired Yet</div>
        <div style={{ fontSize: 14, color: '#718096', maxWidth: 420, lineHeight: 1.6 }}>
          Find a verified dispatcher on our marketplace and start earning more per mile. Most owner-ops see $0.20–$0.40 RPM improvement within 30 days.
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => onNavigate('marketplace')}>
          🧭 Find a Dispatcher →
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Dispatcher hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D7A9A)', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
              {d.avatar}
            </div>
            <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#38C770', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800, border: '2px solid #1A2535' }}>✓</div>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 900, fontSize: 20, color: '#fff' }}>{d.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#38C770', color: '#fff' }}>● Active Contract</span>
              {d.trust.platformVerified && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)' }}>🏆 Verified</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginBottom: 10 }}>
              📍 {d.location} · ⚡ {d.responseTime} · {d.yearsExperience} yrs exp · Since {CONTRACT.startDate}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { v: `★ ${d.rating.toFixed(2)}`, l: `${d.reviewCount} reviews` },
                { v: d.pricing.label,            l: 'Your Rate' },
                { v: `$${d.rpmGuarantee.toFixed(2)}+`, l: 'RPM Guaranteed' },
                { v: `${d.activeClients}`,        l: 'Active Clients' },
              ].map(s => (
                <div key={s.l}>
                  <span style={{ fontWeight: 800, color: '#38C770', fontSize: 14 }}>{s.v}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginLeft: 5 }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setShowMessage(true)}
              style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              💬 Message
            </button>
            <button style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              📞 Call
            </button>
            <button onClick={() => setShowEnd(true)}
              style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 12 }}>
              End Contract
            </button>
          </div>
        </div>
      </div>

      {/* ── RPM Alert ── */}
      {rpmVsGuarantee >= 0 ? (
        <div style={{ background: '#F0FFF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: '#276749', fontSize: 13 }}>
              {d.name.split(' ')[0]} is delivering above the guaranteed RPM this month
            </div>
            <div style={{ fontSize: 12, color: '#4A5568', marginTop: 2 }}>
              Avg <strong>${avgRpm.toFixed(2)}/mi</strong> vs ${d.rpmGuarantee.toFixed(2)} guaranteed — <strong style={{ color: '#38C770' }}>+${rpmVsGuarantee.toFixed(2)}/mi above promise</strong>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#C53030', fontSize: 13 }}>RPM is below the guaranteed minimum</div>
            <div style={{ fontSize: 12, color: '#E53E3E', marginTop: 2 }}>
              Avg ${avgRpm.toFixed(2)}/mi vs ${d.rpmGuarantee.toFixed(2)} guaranteed — ${Math.abs(rpmVsGuarantee).toFixed(2)}/mi shortfall
            </div>
          </div>
          <button onClick={() => setShowDispute(true)}
            style={{ background: '#E53E3E', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
            🚩 Dispute
          </button>
        </div>
      )}

      {/* ── KPI strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { label: 'Revenue (MTD)',     value: `$${thisMonthRev.toLocaleString()}`,           color: '#38C770', icon: '💰', sub: `${deliveredLoads.length} delivered` },
          { label: 'Avg RPM',          value: `$${avgRpm.toFixed(2)}/mi`,                    color: rpmVsGuarantee >= 0 ? '#38C770' : '#E53E3E', icon: '📈', sub: `Guaranteed: $${d.rpmGuarantee.toFixed(2)}` },
          { label: 'Active Loads',     value: `${activeLoads.length}`,                        color: '#4BAED4', icon: '🚛', sub: 'In transit + upcoming' },
          { label: 'Dispatcher Fee',   value: `$${dispFee.toLocaleString()}`,                 color: '#F59E0B', icon: '💼', sub: `${d.pricing.value}% of gross` },
          { label: 'Est. Net Profit',  value: `$${netProfit.toLocaleString()}`,               color: '#8B5CF6', icon: '🏦', sub: 'After fee + fuel est.' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ color: s.color, fontSize: 17 }}>{s.value}</div>
            <div className="stat-label" style={{ fontSize: 11 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {([
          ['overview',     '📊 Performance'],
          ['loads',        '📦 Loads'],
          ['financials',   '💰 Financials'],
          ['reviews',      '⭐ Reviews'],
          ['preferences',  '⚙️ Preferences'],
        ] as const).map(([id, label]) => (
          <button key={id} className={`tab-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* RPM Gauge */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="section-title" style={{ margin: 0 }}>RPM vs Guarantee</h3>
                <span style={{ fontSize: 12, color: '#A0AEC0' }}>May 2026</span>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: rpmVsGuarantee >= 0 ? '#38C770' : '#E53E3E', lineHeight: 1 }}>
                  ${avgRpm.toFixed(2)}
                </div>
                <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>avg RPM this month</div>
                <div style={{ background: '#E2E8F0', borderRadius: 99, height: 10, width: '90%', margin: '12px auto 4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min((avgRpm / 3.0) * 100, 100)}%`, height: '100%',
                    borderRadius: 99,
                    background: rpmVsGuarantee >= 0 ? 'linear-gradient(90deg,#38C770,#2FA85A)' : 'linear-gradient(90deg,#E53E3E,#C53030)',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>
                  Min: <strong style={{ color: '#4BAED4' }}>${d.rpmGuarantee.toFixed(2)}</strong> · Target: <strong>$3.00</strong>
                </div>
              </div>
              <RpmSparkline data={WEEKLY} />
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: '#38C770' }} />
                  <span style={{ fontSize: 11, color: '#718096' }}>Above guarantee</span>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: '#EF4444' }} />
                  <span style={{ fontSize: 11, color: '#718096' }}>Below guarantee</span>
                </div>
              </div>
            </div>

            {/* Score cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Response Score',    value: 99,  color: '#8B5CF6', sub: 'Avg reply < 5 min' },
                { label: 'On-Time Rate',      value: 97,  color: '#38C770', sub: 'vs platform avg 91%' },
                { label: 'No Dead Miles',     value: 96,  color: '#4BAED4', sub: 'Backhaul efficiency' },
                { label: 'Broker Relations',  value: 98,  color: '#F59E0B', sub: '14 active brokers' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', width: 52, flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 9, color: '#A0AEC0' }}>/ 100</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ background: '#E2E8F0', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${s.value}%`, height: '100%', borderRadius: 99, background: s.color }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties + Market comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 12 }}>Dispatcher Specialties</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {d.specialties.map(s => (
                  <span key={s} style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, background: '#EBF8FF', color: '#2C7A9A', border: '1px solid #BEE3F8' }}>
                    {s}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.7 }}>
                <div>📋 Contract type: <strong>Standard</strong> · Notice: <strong>{CONTRACT.noticeDays} days</strong></div>
                <div>📅 Member since: <strong>{CONTRACT.startDate}</strong></div>
                <div>🔁 Monthly minimum: <strong>{CONTRACT.monthlyMinimum} loads</strong></div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 12 }}>vs Platform Benchmarks</h3>
              {[
                { label: 'Your avg RPM',     yours: avgRpm.toFixed(2),  platform: '2.21', unit: '$/mi', up: true },
                { label: 'On-time rate',     yours: '97%',              platform: '91%',  unit: '',     up: true },
                { label: 'Response time',    yours: '< 5 min',          platform: '42 min', unit: '',   up: true },
                { label: 'Dispatcher fee',   yours: `${d.pricing.value}%`, platform: '6.2%', unit: '',  up: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F0F4F8', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#718096' }}>{row.label}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#A0AEC0' }}>Avg: {row.platform}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: row.up ? '#38C770' : '#E53E3E' }}>
                      {row.up ? '↑' : '↓'} {row.yours}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowReview(true)}>
              ⭐ Leave Review
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onNavigate('marketplace')}>
              🔍 Browse Other Dispatchers
            </button>
          </div>
        </div>
      )}

      {/* ════════ LOADS ════════ */}
      {tab === 'loads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'in-transit', 'upcoming', 'delivered'] as const).map(f => (
                <button key={f} onClick={() => setLoadFilter(f)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                    borderColor: loadFilter === f ? '#4BAED4' : '#E2E8F0',
                    background: loadFilter === f ? '#EBF8FF' : '#fff',
                    color: loadFilter === f ? '#2C7A9A' : '#718096',
                  }}>
                  {f === 'all'
                    ? `All (${LOADS.length})`
                    : f === 'in-transit' ? `🚛 In Transit (${LOADS.filter(l => l.status === 'in-transit').length})`
                    : f === 'upcoming'   ? `📅 Upcoming (${LOADS.filter(l => l.status === 'upcoming').length})`
                    : `✅ Delivered (${deliveredLoads.length})`}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowMessage(true)}>
              + Request Load
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Route</th>
                    <th>Commodity</th>
                    <th>Miles</th>
                    <th>RPM</th>
                    <th>Payout</th>
                    <th>Broker</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoads.map(l => {
                    const statusMap = {
                      delivered:  { label: '✅ Delivered',  color: '#276749', bg: '#F0FFF4' },
                      'in-transit': { label: '🚛 In Transit', color: '#553C9A', bg: '#FAF5FF' },
                      upcoming:   { label: '📅 Upcoming',   color: '#2C5282', bg: '#EBF8FF' },
                      cancelled:  { label: '❌ Cancelled',  color: '#9B2C2C', bg: '#FFF5F5' },
                    }
                    const s = statusMap[l.status]
                    return (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 700, color: '#4BAED4', fontSize: 12 }}>#{l.ref}</td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{l.from.split(',')[0]}</div>
                          <div style={{ fontSize: 11, color: '#A0AEC0' }}>→ {l.to.split(',')[0]}</div>
                        </td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{l.commodity}</td>
                        <td style={{ color: '#718096', fontSize: 13 }}>{l.miles.toLocaleString()}</td>
                        <td>
                          <span style={{ fontWeight: 800, color: l.rpm >= d.rpmGuarantee ? '#38C770' : '#E53E3E', fontSize: 13 }}>
                            ${l.rpm.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#38C770' }}>${l.payout.toLocaleString()}</td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{l.broker}</td>
                        <td style={{ fontSize: 12, color: '#A0AEC0' }}>{l.date}</td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════ FINANCIALS ════════ */}
      {tab === 'financials' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Breakdown */}
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 14 }}>This Month Breakdown</h3>
              {[
                { label: 'Gross Revenue',                                          value: `$${thisMonthRev.toLocaleString()}`,                  color: '#38C770', bold: true  },
                { label: `Dispatcher Fee (${d.pricing.value}%)`,                   value: `-$${dispFee.toLocaleString()}`,                      color: '#E53E3E', bold: false },
                { label: 'Fuel Estimate (est. $0.44/mi)',                          value: `~-$${fuelEstimate.toLocaleString()}`,                color: '#F59E0B', bold: false },
                { label: 'Net Profit (est.)',                                      value: `~$${netProfit.toLocaleString()}`,                    color: '#4BAED4', bold: true  },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: 13, color: '#718096', fontWeight: r.bold ? 700 : 400 }}>{r.label}</span>
                  <span style={{ fontWeight: r.bold ? 900 : 600, color: r.color, fontSize: 14 }}>{r.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, background: '#F0FFF4', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#276749', marginBottom: 2 }}>Net Profit per Mile (est.)</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#38C770' }}>
                  ${(netProfit / totalMiles).toFixed(2)}/mi
                </div>
              </div>
            </div>

            {/* Weekly chart */}
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 14 }}>Weekly Revenue</h3>
              <RevenueBarChart data={WEEKLY} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 2 }}>Best Week</div>
                  <div style={{ fontWeight: 800, color: '#38C770' }}>Apr 7 · $11,340</div>
                </div>
                <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 2 }}>Total Miles</div>
                  <div style={{ fontWeight: 800, color: '#4BAED4' }}>{totalMiles.toLocaleString()} mi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee due card */}
          <div className="card" style={{ background: '#FFFBF0', border: '1px solid #F6AD55' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#744210', fontSize: 15 }}>
                  Dispatcher Fee Due: <strong>${dispFee.toLocaleString()}</strong>
                </div>
                <div style={{ fontSize: 12, color: '#C05621', marginTop: 2 }}>
                  {d.pricing.value}% of ${thisMonthRev.toLocaleString()} gross · Due Jun 1, 2026
                </div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ background: '#F59E0B', border: 'none' }}>
                💳 Pay Now
              </button>
            </div>
          </div>

          {/* Dispute history */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Dispute History</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDispute(true)}>+ New Dispute</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DISPUTES.map(dis => {
                const statusMap = {
                  open:      { label: '🔴 Open',     color: '#C53030', bg: '#FFF5F5' },
                  resolved:  { label: '✅ Resolved',  color: '#276749', bg: '#F0FFF4' },
                  dismissed: { label: '⚫ Dismissed', color: '#718096', bg: '#F7FAFC' },
                }
                const s = statusMap[dis.status]
                return (
                  <div key={dis.id} style={{ background: '#F7FAFC', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4BAED4' }}>{dis.id}</span>
                        <span style={{ fontSize: 11, color: '#A0AEC0' }}>Load: {dis.load} · {dis.date}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#2D3748', fontWeight: 600 }}>{dis.issue}</div>
                      {dis.outcome && (
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>Outcome: {dis.outcome}</div>
                      )}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 8, background: s.bg, color: s.color, flexShrink: 0 }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════ REVIEWS ════════ */}
      {tab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <div className="card" style={{ flex: '0 0 200px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>{d.rating.toFixed(2)}</div>
              <StarRating rating={d.rating} size={22} />
              <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 6 }}>{d.reviewCount} platform reviews</div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, fontSize: 12 }}
                onClick={() => setShowReview(true)}>
                ⭐ Write Review
              </button>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 240 }}>
              <h3 className="section-title" style={{ marginBottom: 12 }}>Category Scores</h3>
              {[
                { label: 'Communication',  val: 99 },
                { label: 'RPM Results',    val: 97 },
                { label: 'Responsiveness', val: 100 },
                { label: 'Reliability',    val: 96 },
                { label: 'Rate Negotiation', val: 98 },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#718096' }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{r.val}/100</span>
                  </div>
                  <div style={{ background: '#E2E8F0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${r.val}%`, height: '100%', borderRadius: 99, background: r.val >= 98 ? '#38C770' : '#4BAED4' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          {REVIEWS.map((r, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: 15 }}>{r.author.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>{r.author}</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0' }}>{r.months} months · Avg ${r.avgRpm.toFixed(2)} RPM</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StarRating rating={r.rating} size={16} />
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{r.date}</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, margin: '0 0 10px' }}>{r.text}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {r.categories.map(c => (
                  <span key={c.label} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: '#F0F4F8', color: '#718096', fontWeight: 600 }}>
                    {c.label}: {c.score}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 8 }}>✓ Platform verified · Actual client</div>
            </div>
          ))}
        </div>
      )}

      {/* ════════ PREFERENCES ════════ */}
      {tab === 'preferences' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Lane preferences */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="section-title" style={{ margin: 0 }}>Preferred Lanes</h3>
                <button className="btn btn-secondary btn-sm">+ Add Lane</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {LANE_PREFS.map((lane, i) => {
                  const pcolor = { high: '#38C770', medium: '#4BAED4', low: '#A0AEC0' }[lane.priority]
                  return (
                    <div key={i} style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>
                          {lane.from.split(',')[0]} → {lane.to.split(',')[0]}
                        </div>
                        <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>
                          Min RPM: <strong style={{ color: '#4BAED4' }}>${lane.minRpm.toFixed(2)}</strong>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: pcolor + '18', color: pcolor, textTransform: 'capitalize' }}>
                        {lane.priority}
                      </span>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>Edit</button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Load preferences */}
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 14 }}>Load Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Minimum RPM',            value: '$2.15', editable: true },
                  { label: 'Maximum Miles per Load',  value: '1,500 mi', editable: true },
                  { label: 'Preferred Truck Type',    value: 'Dry Van', editable: true },
                  { label: 'Home Base',               value: 'Chicago, IL', editable: true },
                  { label: 'Home Time',               value: 'Every 7 days', editable: true },
                  { label: 'Avoid States',            value: 'NY, NJ', editable: true },
                ].map(p => (
                  <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F0F4F8' }}>
                    <span style={{ fontSize: 13, color: '#718096' }}>{p.label}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{p.value}</span>
                      {p.editable && <button className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 14 }}>Notification Preferences</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[
                { label: 'New load offer',      checked: true  },
                { label: 'Below RPM guarantee', checked: true  },
                { label: 'Load booked',         checked: true  },
                { label: 'Weekly summary',      checked: true  },
                { label: 'Broker rate changes', checked: false },
                { label: 'Market rate alerts',  checked: false },
              ].map(n => (
                <label key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#4A5568', padding: '8px 12px', background: '#F7FAFC', borderRadius: 10 }}>
                  <input type="checkbox" defaultChecked={n.checked} />
                  {n.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Modals ─── */}

      {/* End Contract */}
      {showEnd && (
        <div className="modal-overlay" onClick={() => setShowEnd(false)}>
          <div className="modal" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">End Contract with {d.name.split(' ')[0]}?</h3>
              <button className="modal-close" onClick={() => setShowEnd(false)}>✕</button>
            </div>
            <div style={{ background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#C53030', fontSize: 13, marginBottom: 4 }}>
                Notice Period: {CONTRACT.noticeDays} days
              </div>
              <div style={{ fontSize: 12, color: '#E53E3E' }}>
                {d.name.split(' ')[0]} will continue dispatching until the notice period ends on {new Date(Date.now() + CONTRACT.noticeDays * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <select className="input select">
                <option>Moving to a different dispatcher</option>
                <option>No longer trucking</option>
                <option>Unsatisfied with performance</option>
                <option>Found a company job</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="input" rows={3} style={{ resize: 'vertical' }} placeholder="Optional message to dispatcher..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowEnd(false)}>Keep Contract</button>
              <button className="btn btn-full" style={{ background: '#E53E3E', color: '#fff', border: 'none' }} onClick={() => setShowEnd(false)}>
                Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Review */}
      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="modal" style={{ width: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⭐ Review {d.name}</h3>
              <button className="modal-close" onClick={() => setShowReview(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Overall Rating', 'Communication', 'RPM Results', 'Responsiveness', 'Reliability'].map(cat => (
                <div key={cat} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{cat}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setReviewStars(prev => ({ ...prev, [cat]: n }))}
                        style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: n <= (reviewStars[cat] ?? 5) ? '#F59E0B' : '#E2E8F0' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Review</label>
                <textarea className="input" rows={4} placeholder="Share your experience — other owner-operators will read this..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Avg RPM with this dispatcher ($/mi)</label>
                <input className="input" type="number" step="0.01" placeholder="e.g. 2.68" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 14 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowReview(false)}>Cancel</button>
              <button className="btn btn-primary btn-full" onClick={() => setShowReview(false)}>Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && (
        <div className="modal-overlay" onClick={() => setShowDispute(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🚩 File a Dispute</h3>
              <button className="modal-close" onClick={() => setShowDispute(false)}>✕</button>
            </div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#92400E' }}>
              Disputes are reviewed by DispaLoadIQ's mediation team within 3 business days.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Related Load Ref (if applicable)', ph: 'e.g. EG-920441' },
                { label: 'Issue Category', isSelect: true, opts: ['RPM below guarantee', 'Late response', 'Missed load', 'Billing dispute', 'Communication issue', 'Other'] },
                { label: 'Date of Incident', ph: '', type: 'date' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  {f.isSelect
                    ? <select className="input select">{f.opts?.map(o => <option key={o}>{o}</option>)}</select>
                    : <input className="input" type={f.type ?? 'text'} placeholder={f.ph} />}
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Description</label>
                <textarea className="input" rows={4} placeholder="Describe the issue in detail..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, paddingTop: 14 }}>
              <button className="btn btn-ghost btn-full" onClick={() => setShowDispute(false)}>Cancel</button>
              <button className="btn btn-full" style={{ background: '#E53E3E', color: '#fff', border: 'none' }}
                onClick={() => setShowDispute(false)}>
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessage && (
        <div className="modal-overlay" onClick={() => setShowMessage(false)}>
          <div className="modal" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💬 Chat with {d.name.split(' ')[0]}</h3>
              <button className="modal-close" onClick={() => setShowMessage(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, maxHeight: 280, overflowY: 'auto' }}>
              {commMessages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '78%', padding: '10px 14px', borderRadius: 12,
                    background: m.from === 'me' ? '#4BAED4' : '#F4F6F9',
                    color: m.from === 'me' ? '#fff' : '#2D3748',
                  }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                    <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" style={{ flex: 1 }} placeholder="Type a message..."
                value={msgText} onChange={e => setMsgText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage() }} />
              <button className="btn btn-primary" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
