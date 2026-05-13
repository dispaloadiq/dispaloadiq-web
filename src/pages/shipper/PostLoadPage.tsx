import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4
type RateType = 'flat' | 'per_mile'

interface Stop {
  id: string
  city: string
  state: string
  zip: string
  date: string
  type: 'pickup' | 'delivery' | 'stop'
  notes: string
}

interface LoadForm {
  stops: Stop[]
  pickupFlex: boolean
  // Cargo
  commodity: string
  weight: string
  length: string
  truckType: string
  pieces: string
  pallets: string
  freightClass: string
  temperature: string
  hazmat: boolean
  stackable: boolean
  teamRequired: boolean
  notes: string
  // Budget
  budget: string
  negotiable: boolean
  payTerms: string
  rateType: RateType
  preferredCarriers: string[]
  requireVerified: boolean
}

interface CarrierOffer {
  id: string
  name: string
  type: string
  rating: number
  reviews: number
  rate: number
  eta: string
  loads: number
  verified: boolean
  badge?: string
  insurance: string
  homeBase: string
  onTimeRate: number
  counterOffer?: number
}

interface LoadTemplate {
  id: string
  name: string
  origin: string
  dest: string
  commodity: string
  truckType: string
}

interface LaneInsight {
  lane: string
  avgRate: number
  minRate: number
  maxRate: number
  trend: 'up' | 'down' | 'stable'
  weeklyPosts: number
}

interface RecentPost {
  id: string
  origin: string
  dest: string
  date: string
  status: 'delivered' | 'active' | 'pending'
  rate: number
  carrier: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TRUCK_TYPES = [
  { value: 'dry_van',   label: '🚛 Dry Van',      desc: 'Standard enclosed trailer' },
  { value: 'reefer',    label: '❄️ Reefer',         desc: 'Temperature controlled' },
  { value: 'flatbed',   label: '📦 Flatbed',        desc: 'Open deck, oversized' },
  { value: 'step_deck', label: '🔩 Step Deck',      desc: 'Lower deck for tall freight' },
  { value: 'ltl',       label: '📫 LTL',            desc: 'Less than truckload' },
  { value: 'power',     label: '⚡ Power Only',     desc: 'Drop & hook / power only' },
  { value: 'lowboy',    label: '🏗️ Lowboy',         desc: 'Heavy machinery, oversized' },
  { value: 'tanker',    label: '🛢️ Tanker',         desc: 'Liquid bulk freight' },
  { value: 'rgn',       label: '⛟ RGN',            desc: 'Removable gooseneck' },
]

const PAY_TERMS = ['Quick Pay (1–2 days)', 'Net 15', 'Net 30', 'Net 45', 'Factoring OK']
const FREIGHT_CLASSES = ['50','55','60','65','70','77.5','85','92.5','100','110','125','150','175','200','250','300','400','500']
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const MOCK_OFFERS: CarrierOffer[] = [
  { id: 'c1', name: 'Mike Rodriguez',     type: 'Dry Van', rating: 4.9, reviews: 142, rate: 2150, eta: 'On Time', loads: 142, verified: true,  badge: '⭐ Top Rated',  insurance: '$1M', homeBase: 'Chicago, IL', onTimeRate: 98 },
  { id: 'c2', name: 'Eagle Freight LLC',  type: 'Dry Van', rating: 4.7, reviews: 88,  rate: 1980, eta: '+1h',     loads: 87,  verified: true,  badge: '💰 Best Price', insurance: '$1M', homeBase: 'Detroit, MI',  onTimeRate: 94 },
  { id: 'c3', name: 'Anna Perez',         type: 'Dry Van', rating: 4.8, reviews: 64,  rate: 2200, eta: 'On Time', loads: 63,  verified: true,  badge: '⚡ Fast Reply',  insurance: '$1M', homeBase: 'Gary, IN',    onTimeRate: 97 },
  { id: 'c4', name: 'JS Transport Inc',   type: 'Dry Van', rating: 4.5, reviews: 211, rate: 2050, eta: 'On Time', loads: 210, verified: false, badge: undefined,       insurance: '$750K', homeBase: 'St. Louis, MO', onTimeRate: 91 },
  { id: 'c5', name: 'Heartland Carriers', type: 'Dry Van', rating: 4.6, reviews: 55,  rate: 2100, eta: '+2h',     loads: 55,  verified: true,  badge: undefined,       insurance: '$1M', homeBase: 'Kansas City, MO', onTimeRate: 93 },
  { id: 'c6', name: 'Lone Star Trucking', type: 'Dry Van', rating: 4.4, reviews: 178, rate: 1950, eta: '+3h',     loads: 178, verified: true,  badge: undefined,       insurance: '$1M', homeBase: 'Dallas, TX',  onTimeRate: 90 },
  { id: 'c7', name: 'Blue Ridge Express', type: 'Dry Van', rating: 4.7, reviews: 34,  rate: 2250, eta: 'On Time', loads: 34,  verified: true,  badge: '🆕 New',        insurance: '$1M', homeBase: 'Nashville, TN', onTimeRate: 96 },
  { id: 'c8', name: 'Tri-State Haulers',  type: 'Dry Van', rating: 4.3, reviews: 97,  rate: 1920, eta: '+4h',     loads: 97,  verified: false, badge: undefined,       insurance: '$750K', homeBase: 'Memphis, TN', onTimeRate: 88 },
]

const LANE_INSIGHTS: LaneInsight[] = [
  { lane: 'Chicago → Dallas',    avgRate: 2280, minRate: 1900, maxRate: 2600, trend: 'up',     weeklyPosts: 142 },
  { lane: 'Chicago → Houston',   avgRate: 2450, minRate: 2100, maxRate: 2900, trend: 'stable', weeklyPosts: 88 },
  { lane: 'Chicago → Atlanta',   avgRate: 2100, minRate: 1800, maxRate: 2400, trend: 'down',   weeklyPosts: 67 },
  { lane: 'Chicago → Miami',     avgRate: 2890, minRate: 2500, maxRate: 3300, trend: 'up',     weeklyPosts: 54 },
]

const LOAD_TEMPLATES: LoadTemplate[] = [
  { id: 't1', name: '🚛 Weekly CHI→DAL', origin: 'Chicago, IL', dest: 'Dallas, TX',     commodity: 'Auto Parts',       truckType: 'dry_van' },
  { id: 't2', name: '❄️ Produce Run',    origin: 'Fresno, CA',  dest: 'Denver, CO',     commodity: 'Fresh Produce',    truckType: 'reefer'  },
  { id: 't3', name: '🏗️ Steel Coils',   origin: 'Gary, IN',    dest: 'Birmingham, AL', commodity: 'Steel Coils',      truckType: 'flatbed' },
]

const RECENT_POSTS: RecentPost[] = [
  { id: 'LP-5521', origin: 'Chicago, IL', dest: 'Dallas, TX',   date: 'May 8',  status: 'delivered', rate: 2180, carrier: 'Mike Rodriguez'    },
  { id: 'LP-5518', origin: 'Chicago, IL', dest: 'Houston, TX',  date: 'May 5',  status: 'delivered', rate: 2450, carrier: 'Eagle Freight LLC'  },
  { id: 'LP-5514', origin: 'Chicago, IL', dest: 'Atlanta, GA',  date: 'Apr 30', status: 'delivered', rate: 2050, carrier: 'Heartland Carriers'  },
  { id: 'LP-5510', origin: 'Detroit, MI', dest: 'Dallas, TX',   date: 'Apr 25', status: 'delivered', rate: 1980, carrier: 'JS Transport Inc'    },
  { id: 'LP-5507', origin: 'Chicago, IL', dest: 'Miami, FL',    date: 'Apr 20', status: 'delivered', rate: 2890, carrier: 'Anna Perez'          },
]

const MARKET_HISTORY = [
  { week: 'Apr W1', rate: 2120 },
  { week: 'Apr W2', rate: 2180 },
  { week: 'Apr W3', rate: 2090 },
  { week: 'Apr W4', rate: 2210 },
  { week: 'May W1', rate: 2280 },
  { week: 'May W2', rate: 2350 },
]

// ── Components ────────────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: '📍 Route', icon: '📍' },
    { n: 2, label: '📦 Cargo', icon: '📦' },
    { n: 3, label: '💰 Budget', icon: '💰' },
    { n: 4, label: '✅ Review', icon: '✅' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
      {steps.map((s, i) => {
        const done = current > s.n
        const active = current === s.n
        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: done ? '#38C770' : active ? '#4BAED4' : '#E2E8F0',
                color: done || active ? '#fff' : '#A0AEC0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: done ? 16 : 14,
                boxShadow: active ? '0 0 0 4px rgba(75,174,212,.2)' : 'none',
                transition: 'all .3s',
              }}>
                {done ? '✓' : s.n}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#4BAED4' : '#A0AEC0', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 6px', marginBottom: 18,
                background: done ? '#38C770' : '#E2E8F0',
                transition: 'background .3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
        {hint && <span style={{ fontWeight: 400, color: '#A0AEC0', marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function MarketRateChart({ budget, avg, min, max }: {
  budget: number; avg: number; min: number; max: number
}) {
  const chartMax = Math.max(max * 1.1, budget * 1.1)
  const h = 80
  const w = 340
  const toX = (v: number) => (v / chartMax) * (w - 40) + 20
  const bars = [
    { label: 'Min', value: min, color: '#A0AEC0' },
    { label: 'Avg', value: avg, color: '#4BAED4' },
    { label: 'Max', value: max, color: '#8B5CF6' },
    { label: 'Yours', value: budget, color: budget >= avg ? '#38C770' : '#F59E0B' },
  ]
  const barH = 14
  const gap = 18
  return (
    <svg viewBox={`0 0 ${w} ${bars.length * (barH + gap) + 20}`} style={{ width: '100%', maxWidth: w }}>
      {bars.map((bar, i) => {
        const y = 10 + i * (barH + gap)
        const bw = toX(bar.value) - 20
        return (
          <g key={bar.label}>
            <text x={20} y={y + barH - 2} fontSize={10} fill="#A0AEC0" fontWeight={600}>{bar.label}</text>
            <rect x={60} y={y} width={Math.max(bw - 40, 4)} height={barH} rx={4} fill={bar.color} opacity={.85} />
            <text x={60 + Math.max(bw - 40, 4) + 6} y={y + barH - 2} fontSize={10} fill={bar.color} fontWeight={700}>
              ${bar.value.toLocaleString()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function TrendChart() {
  const w = 300
  const h = 60
  const pad = 16
  const vals = MARKET_HISTORY.map(d => d.rate)
  const minV = Math.min(...vals) - 100
  const maxV = Math.max(...vals) + 100
  const toX = (i: number) => pad + (i / (vals.length - 1)) * (w - pad * 2)
  const toY = (v: number) => h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2)
  const pts = vals.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const polyPts = `${toX(0)},${h} ` + pts + ` ${toX(vals.length - 1)},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4BAED4" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4BAED4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#trendGrad)" />
      <polyline points={pts} fill="none" stroke="#4BAED4" strokeWidth={2} strokeLinejoin="round" />
      {vals.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3} fill="#4BAED4" />
      ))}
      {MARKET_HISTORY.map((d, i) => (
        <text key={i} x={toX(i)} y={h - 2} textAnchor="middle" fontSize={8} fill="#A0AEC0">{d.week.split(' ')[1]}</text>
      ))}
    </svg>
  )
}

function CounterOfferModal({
  offer, budget, onClose, onAccept
}: {
  offer: CarrierOffer; budget: number;
  onClose: () => void; onAccept: (amount: number) => void
}) {
  const [counter, setCounter] = useState(String(budget))
  const diff = parseInt(counter || '0') - offer.rate
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="card" style={{ width: 420, gap: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A2535' }}>
            💬 Counter Offer to {offer.name}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ background: '#F7FAFC', borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>THEIR OFFER</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1A2535' }}>${offer.rate.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>YOUR BUDGET</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#4BAED4' }}>${budget.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>DIFFERENCE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: offer.rate > budget ? '#EF4444' : '#38C770' }}>
              {offer.rate > budget ? '+' : ''}{(offer.rate - budget).toLocaleString()}
            </div>
          </div>
        </div>

        <Field label="Your Counter Offer ($)" required>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', fontSize: 16 }}>$</span>
            <input className="input" style={{ paddingLeft: 28, fontSize: 20, fontWeight: 700 }}
              type="number" value={counter}
              onChange={e => setCounter(e.target.value)} />
          </div>
          {counter && (
            <div style={{ fontSize: 12, color: diff >= 0 ? '#38C770' : '#EF4444', fontWeight: 600, marginTop: 3 }}>
              {diff >= 0 ? `+$${diff.toLocaleString()} above their ask` : `$${Math.abs(diff).toLocaleString()} below their ask`}
            </div>
          )}
        </Field>

        <Field label="Message (optional)">
          <textarea className="input" rows={2} placeholder="e.g. Best I can do, quick pay guaranteed..." />
        </Field>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onAccept(parseInt(counter || '0'))}>
            Send Counter ↗
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PostLoadPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [step, setStep] = useState<Step>(1)
  const [submitted, setSubmitted] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null)
  const [counterTarget, setCounterTarget] = useState<CarrierOffer | null>(null)
  const [offerFilter, setOfferFilter] = useState<'all' | 'verified' | 'best_price' | 'fastest'>('all')
  const [bookedSuccess, setBookedSuccess] = useState(false)

  const [form, setForm] = useState<LoadForm>({
    stops: [
      { id: 's1', city: '', state: 'IL', zip: '', date: '', type: 'pickup', notes: '' },
      { id: 's2', city: '', state: 'TX', zip: '', date: '', type: 'delivery', notes: '' },
    ],
    pickupFlex: false,
    commodity: '', weight: '', length: '53', truckType: 'dry_van',
    pieces: '1', pallets: '', freightClass: '70', temperature: '',
    hazmat: false, stackable: true, teamRequired: false, notes: '',
    budget: '', negotiable: true, payTerms: 'Quick Pay (1–2 days)', rateType: 'flat',
    preferredCarriers: [], requireVerified: false,
  })

  function setField(field: keyof LoadForm, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function updateStop(id: string, field: keyof Stop, value: string) {
    setForm(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.id === id ? { ...s, [field]: value } : s),
    }))
  }

  function addStop() {
    const newStop: Stop = {
      id: 's' + Date.now(), city: '', state: 'IL', zip: '', date: '',
      type: 'stop', notes: '',
    }
    setForm(prev => ({
      ...prev,
      stops: [
        ...prev.stops.slice(0, -1),
        newStop,
        prev.stops[prev.stops.length - 1],
      ],
    }))
  }

  function removeStop(id: string) {
    setForm(prev => ({ ...prev, stops: prev.stops.filter(s => s.id !== id) }))
  }

  function applyTemplate(tpl: LoadTemplate) {
    const [oCity, oState] = tpl.origin.split(', ')
    const [dCity, dState] = tpl.dest.split(', ')
    setForm(prev => ({
      ...prev,
      commodity: tpl.commodity,
      truckType: tpl.truckType,
      stops: [
        { ...prev.stops[0], city: oCity, state: oState },
        { ...prev.stops[prev.stops.length - 1], city: dCity, state: dState },
      ],
    }))
  }

  const origin = form.stops[0]
  const dest = form.stops[form.stops.length - 1]

  const stepValid: Record<Step, boolean> = {
    1: !!(origin.city && dest.city && origin.date),
    2: !!(form.commodity && form.weight && form.truckType),
    3: !!(form.budget),
    4: true,
  }

  const filteredOffers = MOCK_OFFERS.filter(o => {
    if (offerFilter === 'verified') return o.verified
    if (offerFilter === 'best_price') return o.rate <= 2050
    if (offerFilter === 'fastest') return o.eta === 'On Time'
    return true
  })

  const budgetNum = parseFloat(form.budget) || 0

  // ── Booked Success ─────────────────────────────────────────────────────────
  if (bookedSuccess && selectedCarrier) {
    const carrier = MOCK_OFFERS.find(o => o.id === selectedCarrier)!
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A2535 0%, #276749 100%)',
          borderRadius: 20, padding: '28px 32px', color: '#fff', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Load Booked!</div>
          <div style={{ opacity: .85, fontSize: 15 }}>
            {origin.city}, {origin.state} → {dest.city}, {dest.state}
          </div>
          <div style={{ opacity: .75, fontSize: 13, marginTop: 4 }}>
            Carrier: <strong>{carrier.name}</strong> · ${carrier.rate.toLocaleString()}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,.15)', padding: '5px 14px', borderRadius: 99, fontSize: 13 }}>
              📨 BOL will be sent to your email
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setBookedSuccess(false); setStep(1) }}>
            + Post Another Load
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('shipments')}>
            📋 View Shipments →
          </button>
        </div>
      </div>
    )
  }

  // ── Submitted / Offers view ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {counterTarget && (
          <CounterOfferModal
            offer={counterTarget}
            budget={budgetNum}
            onClose={() => setCounterTarget(null)}
            onAccept={() => { setCounterTarget(null) }}
          />
        )}

        {/* Success banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)',
          borderRadius: 20, padding: '20px 28px', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>✅ Load Posted Successfully</div>
            <div style={{ opacity: .85, fontSize: 13 }}>
              {origin.city}, {origin.state} → {dest.city}, {dest.state} &nbsp;·&nbsp;
              {TRUCK_TYPES.find(t => t.value === form.truckType)?.label} &nbsp;·&nbsp; {form.weight ? `${parseInt(form.weight).toLocaleString()} lbs` : '—'}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 99, fontSize: 12 }}>
                📨 {MOCK_OFFERS.length} carriers notified
              </span>
              <span style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 99, fontSize: 12 }}>
                📦 Budget: ${budgetNum.toLocaleString()}
              </span>
              <span style={{ background: 'rgba(255,255,255,.15)', padding: '3px 12px', borderRadius: 99, fontSize: 12 }}>
                🕐 Pickup: {origin.date}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
            onClick={() => { setSubmitted(false); setStep(4) }}>
            ✏️ Edit
          </button>
        </div>

        {/* Offer filter + list */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A2535' }}>
                Carrier Offers ({filteredOffers.length})
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#718096' }}>Select a carrier to book</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([['all', 'All'], ['verified', '✓ Verified'], ['best_price', '💰 Best Price'], ['fastest', '⚡ Fastest']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setOfferFilter(val)}
                  className={`btn btn-sm ${offerFilter === val ? 'btn-primary' : 'btn-ghost'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredOffers.map(offer => (
              <div key={offer.id}
                onClick={() => setSelectedCarrier(offer.id)}
                style={{
                  border: `2px solid ${selectedCarrier === offer.id ? '#4BAED4' : '#E2E8F0'}`,
                  borderRadius: 14, padding: '14px 18px', cursor: 'pointer',
                  background: selectedCarrier === offer.id ? '#EBF8FF' : '#fff',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all .2s',
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                    {offer.name.charAt(0)}
                  </div>
                  {offer.verified && (
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 15, height: 15, borderRadius: '50%',
                      background: '#38C770', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: '#fff', fontWeight: 800,
                    }}>✓</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#1A2535' }}>{offer.name}</span>
                    {offer.badge && <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>{offer.badge}</span>}
                    {!offer.verified && <span style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 600 }}>Unverified</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>
                    ★ {offer.rating} ({offer.reviews} reviews) · {offer.onTimeRate}% on-time · {offer.homeBase}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, color: '#4BAED4', background: '#EBF8FF', padding: '2px 7px', borderRadius: 99 }}>
                      {offer.loads} loads
                    </span>
                    <span style={{ fontSize: 10, color: '#718096', background: '#F7FAFC', padding: '2px 7px', borderRadius: 99 }}>
                      🛡️ {offer.insurance}
                    </span>
                    <span style={{ fontSize: 10, color: offer.eta === 'On Time' ? '#38C770' : '#F59E0B', background: '#F7FAFC', padding: '2px 7px', borderRadius: 99 }}>
                      ETA: {offer.eta}
                    </span>
                  </div>
                </div>

                {/* Rate */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: offer.rate <= budgetNum ? '#38C770' : '#1A2535' }}>
                    ${offer.rate.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>
                    {offer.rate > budgetNum
                      ? <span style={{ color: '#EF4444' }}>+${(offer.rate - budgetNum).toLocaleString()} over budget</span>
                      : <span style={{ color: '#38C770' }}>Within budget</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button className={`btn btn-sm ${selectedCarrier === offer.id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={e => { e.stopPropagation(); setSelectedCarrier(offer.id) }}>
                    {selectedCarrier === offer.id ? '✓ Selected' : 'Select'}
                  </button>
                  {form.negotiable && (
                    <button className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); setCounterTarget(offer) }}>
                      💬 Counter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setStep(1) }}>
              ← Edit Load
            </button>
            <button className="btn btn-primary"
              disabled={!selectedCarrier}
              onClick={() => setBookedSuccess(true)}
              style={{ minWidth: 160 }}>
              🤝 Book Carrier →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main wizard ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* Left: wizard */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Header + templates */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>➕ Post New Load</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
                Fill in details and get carrier offers in minutes
              </p>
            </div>
          </div>

          {/* Templates */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#A0AEC0', alignSelf: 'center', fontWeight: 600 }}>Quick fill:</span>
            {LOAD_TEMPLATES.map(tpl => (
              <button key={tpl.id} className="btn btn-ghost btn-sm"
                onClick={() => applyTemplate(tpl)}
                style={{ fontSize: 11 }}>
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <StepBar current={step} />

        <div className="card">

          {/* ── STEP 1: Route ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A2535' }}>📍 Route & Stops</h3>

              {form.stops.map((stop, idx) => {
                const isFirst = idx === 0
                const isLast = idx === form.stops.length - 1
                const typeColor = isFirst ? '#38C770' : isLast ? '#EF4444' : '#F59E0B'
                const typeLabel = isFirst ? '🟢 PICKUP' : isLast ? '🔴 DELIVERY' : `🟡 STOP ${idx}`
                return (
                  <div key={stop.id} style={{
                    background: '#F7FAFC', borderRadius: 14, padding: '16px 18px',
                    border: `1px solid ${typeColor}30`,
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: typeColor, fontSize: 12 }}>{typeLabel}</span>
                      {!isFirst && !isLast && (
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: '#EF4444' }}
                          onClick={() => removeStop(stop.id)}>✕ Remove</button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                      <Field label="City" required={isFirst || isLast}>
                        <input className="input" placeholder="e.g. Chicago"
                          value={stop.city} onChange={e => updateStop(stop.id, 'city', e.target.value)} />
                      </Field>
                      <Field label="State">
                        <select className="input" value={stop.state} onChange={e => updateStop(stop.id, 'state', e.target.value)}>
                          {US_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </Field>
                      <Field label="ZIP">
                        <input className="input" placeholder="60601"
                          value={stop.zip} onChange={e => updateStop(stop.id, 'zip', e.target.value)} />
                      </Field>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                      <Field label={isFirst ? 'Pickup Date' : 'Delivery Date'} required={isFirst}>
                        <input className="input" type="date"
                          value={stop.date} onChange={e => updateStop(stop.id, 'date', e.target.value)} />
                      </Field>
                      <Field label="Notes">
                        <input className="input" placeholder="e.g. Dock hours, appointment..."
                          value={stop.notes} onChange={e => updateStop(stop.id, 'notes', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                )
              })}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button className="btn btn-secondary btn-sm" onClick={addStop}>
                  ➕ Add Stop
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4A5568' }}>
                  <input type="checkbox" checked={form.pickupFlex}
                    onChange={e => setField('pickupFlex', e.target.checked)} />
                  Flexible pickup window (±1 day)
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 2: Cargo ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A2535' }}>📦 Cargo Details</h3>

              <Field label="Equipment Type" required>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {TRUCK_TYPES.map(t => (
                    <div key={t.value} onClick={() => setField('truckType', t.value)}
                      style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${form.truckType === t.value ? '#4BAED4' : '#E2E8F0'}`,
                        background: form.truckType === t.value ? '#EBF8FF' : '#fff',
                        transition: 'all .15s',
                      }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 1 }}>{t.desc}</div>
                    </div>
                  ))}
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Field label="Commodity" required>
                  <input className="input" placeholder="e.g. Auto Parts"
                    value={form.commodity} onChange={e => setField('commodity', e.target.value)} />
                </Field>
                <Field label="Weight (lbs)" required>
                  <input className="input" type="number" placeholder="42000"
                    value={form.weight} onChange={e => setField('weight', e.target.value)} />
                </Field>
                <Field label="Trailer Length (ft)">
                  <select className="input" value={form.length} onChange={e => setField('length', e.target.value)}>
                    {['28','32','40','45','48','53'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Field label="Pieces">
                  <input className="input" type="number" placeholder="1"
                    value={form.pieces} onChange={e => setField('pieces', e.target.value)} />
                </Field>
                <Field label="Pallets">
                  <input className="input" type="number" placeholder="e.g. 20"
                    value={form.pallets} onChange={e => setField('pallets', e.target.value)} />
                </Field>
                <Field label="Freight Class" hint="(NMFC)">
                  <select className="input" value={form.freightClass} onChange={e => setField('freightClass', e.target.value)}>
                    {FREIGHT_CLASSES.map(fc => <option key={fc}>{fc}</option>)}
                  </select>
                </Field>
              </div>

              {form.truckType === 'reefer' && (
                <Field label="Required Temperature (°F)">
                  <input className="input" placeholder="e.g. 34" value={form.temperature}
                    onChange={e => setField('temperature', e.target.value)} />
                </Field>
              )}

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { field: 'hazmat', label: '⚠️ Hazmat', checked: form.hazmat },
                  { field: 'stackable', label: '📦 Stackable', checked: form.stackable },
                  { field: 'teamRequired', label: '👥 Team Required', checked: form.teamRequired },
                ].map(opt => (
                  <label key={opt.field}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4A5568' }}>
                    <input type="checkbox" checked={opt.checked}
                      onChange={e => setField(opt.field as keyof LoadForm, e.target.checked)} />
                    {opt.label}
                  </label>
                ))}
              </div>

              <Field label="Special Instructions / Notes">
                <textarea className="input" rows={3}
                  placeholder="e.g. Liftgate required, appointment needed, dock hours 7am–4pm..."
                  value={form.notes} onChange={e => setField('notes', e.target.value)} />
              </Field>
            </div>
          )}

          {/* ── STEP 3: Budget ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A2535' }}>💰 Budget & Payment</h3>

              {/* Rate type toggle */}
              <Field label="Rate Type">
                <div style={{ display: 'flex', gap: 0, background: '#F0F4F8', borderRadius: 10, padding: 3, width: 'fit-content' }}>
                  {([['flat', 'Flat Rate ($)'], ['per_mile', 'Per Mile ($/mi)']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setField('rateType', val)}
                      style={{
                        padding: '7px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13,
                        border: 'none', cursor: 'pointer',
                        background: form.rateType === val ? '#fff' : 'transparent',
                        color: form.rateType === val ? '#4BAED4' : '#718096',
                        boxShadow: form.rateType === val ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Field label={form.rateType === 'flat' ? 'Your Budget ($)' : 'Rate per Mile ($/mi)'} required>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0', fontSize: 16 }}>$</span>
                    <input className="input" style={{ paddingLeft: 28 }} type="number"
                      placeholder={form.rateType === 'flat' ? '2200' : '2.25'}
                      value={form.budget} onChange={e => setField('budget', e.target.value)} />
                  </div>
                </Field>
                <Field label="Payment Terms">
                  <select className="input" value={form.payTerms} onChange={e => setField('payTerms', e.target.value)}>
                    {PAY_TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4A5568' }}>
                  <input type="checkbox" checked={form.negotiable}
                    onChange={e => setField('negotiable', e.target.checked)} />
                  Rate is negotiable (carriers can counter-offer)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4A5568' }}>
                  <input type="checkbox" checked={form.requireVerified}
                    onChange={e => setField('requireVerified', e.target.checked)} />
                  Require verified carriers only
                </label>
              </div>

              {/* Market rate chart */}
              {origin.city && dest.city && (
                <div style={{ background: '#F7FAFC', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 10 }}>
                    📊 Market Rate: {origin.city}, {origin.state} → {dest.city}, {dest.state}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 8, fontWeight: 600 }}>RATE COMPARISON</div>
                      <MarketRateChart
                        budget={budgetNum || 2000}
                        avg={LANE_INSIGHTS[0].avgRate}
                        min={LANE_INSIGHTS[0].minRate}
                        max={LANE_INSIGHTS[0].maxRate}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 8, fontWeight: 600 }}>6-WEEK TREND</div>
                      <TrendChart />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: '#A0AEC0' }}>Apr W1</span>
                        <span style={{ fontSize: 10, color: '#A0AEC0' }}>May W2</span>
                      </div>
                    </div>
                  </div>
                  {budgetNum > 0 && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px',
                      background: budgetNum >= LANE_INSIGHTS[0].avgRate ? '#F0FDF4' : '#FFFBEB',
                      borderRadius: 10, fontSize: 13,
                      color: budgetNum >= LANE_INSIGHTS[0].avgRate ? '#166534' : '#92400E',
                      border: `1px solid ${budgetNum >= LANE_INSIGHTS[0].avgRate ? '#BBF7D0' : '#FDE68A'}`,
                    }}>
                      {budgetNum >= LANE_INSIGHTS[0].avgRate
                        ? `✅ Your budget ($${budgetNum.toLocaleString()}) is at or above market avg ($${LANE_INSIGHTS[0].avgRate.toLocaleString()}) — expect fast offers`
                        : `⚠️ Your budget ($${budgetNum.toLocaleString()}) is below market avg ($${LANE_INSIGHTS[0].avgRate.toLocaleString()}) — may reduce offer quality`}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Review ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A2535' }}>✅ Review & Post</h3>

              <div style={{
                background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)',
                borderRadius: 16, padding: '20px 24px', color: '#fff',
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>
                  {origin.city || '—'}, {origin.state} → {dest.city || '—'}, {dest.state}
                  {form.stops.length > 2 && <span style={{ fontSize: 12, opacity: .7, marginLeft: 8 }}>+ {form.stops.length - 2} stop(s)</span>}
                </div>
                <div style={{ fontSize: 13, opacity: .85 }}>
                  {TRUCK_TYPES.find(t => t.value === form.truckType)?.label} &nbsp;·&nbsp;
                  {form.commodity || '—'} &nbsp;·&nbsp;
                  {form.weight ? `${parseInt(form.weight).toLocaleString()} lbs` : '—'}
                  {form.hazmat && <span style={{ marginLeft: 8 }}>⚠️ Hazmat</span>}
                  {form.teamRequired && <span style={{ marginLeft: 8 }}>👥 Team</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Pickup', value: origin.date || '—' },
                  { label: 'Delivery', value: dest.date || 'Flexible' },
                  { label: 'Budget', value: form.budget ? `$${parseInt(form.budget).toLocaleString()}` : '—' },
                  { label: 'Payment', value: form.payTerms },
                  { label: 'Freight Class', value: form.freightClass },
                  { label: 'Pallets', value: form.pallets || '—' },
                ].map(row => (
                  <div key={row.label} style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>{row.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2D3748' }}>{row.value}</div>
                  </div>
                ))}
              </div>

              {form.notes && (
                <div style={{ padding: '12px 16px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 700, marginBottom: 3 }}>NOTES</div>
                  <div style={{ fontSize: 13, color: '#78350F' }}>{form.notes}</div>
                </div>
              )}

              <div style={{
                padding: '14px 18px', background: '#EBF8FF', borderRadius: 12,
                border: '1px solid #BAE6FD', fontSize: 13, color: '#0369A1',
              }}>
                🚀 Your load will be posted to <strong>500+ verified carriers</strong> on the DispaLoadIQ network.
                You'll receive offers within minutes.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            {step > 1 ? (
              <button className="btn btn-secondary" onClick={() => setStep(s => (s - 1) as Step)}>
                ← Back
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => onNavigate('shipments')}>
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button className="btn btn-primary"
                disabled={!stepValid[step]}
                onClick={() => setStep(s => (s + 1) as Step)}>
                Continue →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ minWidth: 160 }}
                onClick={() => setSubmitted(true)}>
                🚀 Post Load Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Lane insights */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 12 }}>📊 Lane Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {LANE_INSIGHTS.map(lane => (
              <div key={lane.lane} style={{ borderBottom: '1px solid #F0F4F8', paddingBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{lane.lane}</span>
                  <span style={{ fontSize: 11, color: lane.trend === 'up' ? '#38C770' : lane.trend === 'down' ? '#EF4444' : '#A0AEC0' }}>
                    {lane.trend === 'up' ? '↑' : lane.trend === 'down' ? '↓' : '→'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#4BAED4' }}>${lane.avgRate.toLocaleString()}<span style={{ fontWeight: 400, fontSize: 10, color: '#A0AEC0' }}> avg</span></div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>${lane.minRate.toLocaleString()} – ${lane.maxRate.toLocaleString()} · {lane.weeklyPosts} posts/wk</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent posts */}
        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 12 }}>🕐 Your Recent Posts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RECENT_POSTS.map(post => (
              <div key={post.id} style={{ borderBottom: '1px solid #F0F4F8', paddingBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4BAED4' }}>#{post.id}</span>
                  <span style={{ fontSize: 10, color: '#A0AEC0' }}>{post.date}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2D3748' }}>
                  {post.origin.split(',')[0]} → {post.dest.split(',')[0]}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: '#718096' }}>{post.carrier}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#38C770' }}>${post.rate.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{ padding: '14px 16px', background: '#FFFBEB', borderRadius: 14, border: '1px solid #FDE68A' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E', marginBottom: 8 }}>💡 Posting Tips</div>
          <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
            • Quick Pay gets 2–3× more offers<br />
            • Verified-only filters improve reliability<br />
            • Rate ≥ market avg fills faster<br />
            • Add notes to reduce back-and-forth
          </div>
        </div>
      </div>
    </div>
  )
}
