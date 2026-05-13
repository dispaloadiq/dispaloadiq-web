import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ShipStatus = 'In Transit' | 'Delivered' | 'Picking Up' | 'Delayed' | 'Cancelled' | 'Pending'

interface ShipEvent {
  label: string
  location: string
  time: string
  done: boolean
  icon: string
}

interface Shipment {
  id: string
  from: string
  to: string
  carrier: string
  carrierType: string
  carrierRating: number
  broker: string
  status: ShipStatus
  pickupDate: string
  deliveryDate: string
  actualDelivery?: string
  commodity: string
  weight: string
  truckType: string
  rate: string
  fuelSurcharge?: string
  accessorials?: string
  progress: number
  currentLocation: string
  eta?: string
  onTime: boolean
  invoiceStatus: 'Paid' | 'Pending' | 'Overdue' | 'N/A'
  docs: number
  events: ShipEvent[]
  tags?: string[]
}

type MainTab = 'active' | 'all' | 'analytics'

// ── Mock Data ─────────────────────────────────────────────────────────────────
const SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-1041', from: 'Chicago, IL', to: 'Dallas, TX',
    carrier: 'Mike Rodriguez', carrierType: 'Owner-Op', carrierRating: 4.8,
    broker: 'Echo Global Logistics',
    status: 'In Transit', pickupDate: 'May 10', deliveryDate: 'May 11',
    commodity: 'Auto Parts', weight: '42,000 lbs', truckType: 'Dry Van',
    rate: '$2,180', fuelSurcharge: '$124', accessorials: '$0',
    progress: 68, currentLocation: 'Springfield, MO',
    eta: 'Today 4:45 PM', onTime: true, invoiceStatus: 'Pending', docs: 2,
    tags: ['Regular Carrier', 'On Time'],
    events: [
      { label: 'Picked up', location: 'Chicago, IL', time: 'May 10, 8:14 AM', done: true, icon: '📦' },
      { label: 'Departed origin', location: 'Chicago, IL', time: 'May 10, 8:30 AM', done: true, icon: '🚛' },
      { label: 'In transit', location: 'Springfield, MO', time: 'May 10, 3:22 PM', done: true, icon: '📍' },
      { label: 'Approaching destination', location: 'Tulsa, OK', time: 'Est. 12:00 PM', done: false, icon: '🎯' },
      { label: 'Delivered', location: 'Dallas, TX', time: 'Est. Today 4:45 PM', done: false, icon: '✅' },
    ],
  },
  {
    id: 'SHP-1040', from: 'Miami, FL', to: 'Atlanta, GA',
    carrier: 'Sergiy K.', carrierType: 'Owner-Op', carrierRating: 4.9,
    broker: 'Coyote Logistics',
    status: 'Delivered', pickupDate: 'May 8', deliveryDate: 'May 9',
    actualDelivery: 'May 9, 2:14 PM',
    commodity: 'Frozen Goods', weight: '38,500 lbs', truckType: 'Reefer',
    rate: '$1,240', fuelSurcharge: '$88', accessorials: '$75',
    progress: 100, currentLocation: 'Atlanta, GA',
    onTime: true, invoiceStatus: 'Paid', docs: 4,
    tags: ['Reefer', 'Verified'],
    events: [
      { label: 'Picked up', location: 'Miami, FL', time: 'May 8, 7:00 AM', done: true, icon: '📦' },
      { label: 'Checkpoint', location: 'Orlando, FL', time: 'May 8, 11:30 AM', done: true, icon: '📍' },
      { label: 'Checkpoint', location: 'Jacksonville, FL', time: 'May 8, 2:45 PM', done: true, icon: '📍' },
      { label: 'Checkpoint', location: 'Macon, GA', time: 'May 9, 9:00 AM', done: true, icon: '📍' },
      { label: 'Delivered', location: 'Atlanta, GA', time: 'May 9, 2:14 PM', done: true, icon: '✅' },
    ],
  },
  {
    id: 'SHP-1039', from: 'Los Angeles, CA', to: 'Phoenix, AZ',
    carrier: 'Anna Perez', carrierType: 'Owner-Op', carrierRating: 4.7,
    broker: 'TQL',
    status: 'Picking Up', pickupDate: 'May 10', deliveryDate: 'May 11',
    commodity: 'Electronics', weight: '12,000 lbs', truckType: 'Dry Van',
    rate: '$890', fuelSurcharge: '$52',
    progress: 15, currentLocation: 'Los Angeles, CA',
    eta: 'Today 6:00 PM', onTime: true, invoiceStatus: 'N/A', docs: 1,
    tags: ['Electronics', 'LTL-style'],
    events: [
      { label: 'Arrived at shipper', location: 'Los Angeles, CA', time: 'May 10, 5:30 PM', done: true, icon: '🏭' },
      { label: 'Loading',           location: 'Los Angeles, CA', time: 'In progress', done: false, icon: '📦' },
      { label: 'Departed',          location: 'Los Angeles, CA', time: 'Est. 6:30 PM', done: false, icon: '🚛' },
      { label: 'Delivered',         location: 'Phoenix, AZ',     time: 'Est. May 11 10:00 AM', done: false, icon: '✅' },
    ],
  },
  {
    id: 'SHP-1038', from: 'Houston, TX', to: 'Memphis, TN',
    carrier: 'Eagle Freight LLC', carrierType: 'Carrier', carrierRating: 4.5,
    broker: 'Uber Freight',
    status: 'Delivered', pickupDate: 'May 6', deliveryDate: 'May 7',
    actualDelivery: 'May 7, 10:30 AM',
    commodity: 'Industrial Equipment', weight: '44,000 lbs', truckType: 'Flatbed',
    rate: '$1,680', fuelSurcharge: '$116', accessorials: '$0',
    progress: 100, currentLocation: 'Memphis, TN',
    onTime: true, invoiceStatus: 'Paid', docs: 3,
    tags: ['Flatbed', 'Heavy'],
    events: [
      { label: 'Picked up',  location: 'Houston, TX',  time: 'May 6, 6:00 AM', done: true, icon: '📦' },
      { label: 'Checkpoint', location: 'Shreveport, LA', time: 'May 6, 1:00 PM', done: true, icon: '📍' },
      { label: 'Checkpoint', location: 'Jackson, MS',   time: 'May 6, 7:00 PM', done: true, icon: '📍' },
      { label: 'Delivered',  location: 'Memphis, TN',  time: 'May 7, 10:30 AM', done: true, icon: '✅' },
    ],
  },
  {
    id: 'SHP-1037', from: 'Seattle, WA', to: 'Denver, CO',
    carrier: 'JS Transport Inc', carrierType: 'Carrier', carrierRating: 3.9,
    broker: 'C.H. Robinson',
    status: 'Delayed', pickupDate: 'May 5', deliveryDate: 'May 7',
    commodity: 'Food Products', weight: '39,000 lbs', truckType: 'Reefer',
    rate: '$2,420', fuelSurcharge: '$175', accessorials: '$150',
    progress: 55, currentLocation: 'Salt Lake City, UT',
    eta: 'May 11 (2 days late)', onTime: false, invoiceStatus: 'Pending', docs: 2,
    tags: ['Delayed', 'Food Grade'],
    events: [
      { label: 'Picked up', location: 'Seattle, WA', time: 'May 5, 9:00 AM', done: true, icon: '📦' },
      { label: 'Checkpoint', location: 'Portland, OR', time: 'May 5, 1:00 PM', done: true, icon: '📍' },
      { label: 'Delayed — mechanical', location: 'Salt Lake City, UT', time: 'May 6, 3:00 PM', done: true, icon: '⚠️' },
      { label: 'Resumed transit', location: 'Salt Lake City, UT', time: 'May 8, 9:00 AM', done: false, icon: '🔄' },
      { label: 'Delivered', location: 'Denver, CO', time: 'Est. May 11', done: false, icon: '✅' },
    ],
  },
  {
    id: 'SHP-1036', from: 'New York, NY', to: 'Boston, MA',
    carrier: 'Metro Express', carrierType: 'Carrier', carrierRating: 4.6,
    broker: 'Direct',
    status: 'Delivered', pickupDate: 'May 4', deliveryDate: 'May 4',
    actualDelivery: 'May 4, 5:00 PM',
    commodity: 'Retail Goods', weight: '8,000 lbs', truckType: 'Dry Van',
    rate: '$650', fuelSurcharge: '$38',
    progress: 100, currentLocation: 'Boston, MA',
    onTime: true, invoiceStatus: 'Paid', docs: 3,
    tags: ['Short Haul', 'Direct'],
    events: [
      { label: 'Picked up', location: 'New York, NY', time: 'May 4, 8:00 AM', done: true, icon: '📦' },
      { label: 'Checkpoint', location: 'Hartford, CT', time: 'May 4, 11:30 AM', done: true, icon: '📍' },
      { label: 'Delivered', location: 'Boston, MA', time: 'May 4, 5:00 PM', done: true, icon: '✅' },
    ],
  },
  {
    id: 'SHP-1035', from: 'Chicago, IL', to: 'Nashville, TN',
    carrier: 'Pending Assignment', carrierType: '—', carrierRating: 0,
    broker: 'Self-Posted',
    status: 'Pending', pickupDate: 'May 13', deliveryDate: 'May 14',
    commodity: 'Machinery', weight: '35,000 lbs', truckType: 'Step Deck',
    rate: '$1,950', progress: 0, currentLocation: '—',
    onTime: true, invoiceStatus: 'N/A', docs: 0,
    tags: ['Step Deck', 'Pending'],
    events: [],
  },
  {
    id: 'SHP-1034', from: 'Dallas, TX', to: 'Phoenix, AZ',
    carrier: 'Lone Star Carriers', carrierType: 'Carrier', carrierRating: 4.7,
    broker: 'TQL',
    status: 'Delivered', pickupDate: 'May 3', deliveryDate: 'May 4',
    actualDelivery: 'May 4, 3:00 PM',
    commodity: 'Building Materials', weight: '41,500 lbs', truckType: 'Flatbed',
    rate: '$1,820', fuelSurcharge: '$130', accessorials: '$0',
    progress: 100, currentLocation: 'Phoenix, AZ',
    onTime: true, invoiceStatus: 'Paid', docs: 3,
    tags: ['Flatbed', 'Regular Lane'],
    events: [
      { label: 'Picked up', location: 'Dallas, TX', time: 'May 3, 7:00 AM', done: true, icon: '📦' },
      { label: 'Checkpoint', location: 'Midland, TX', time: 'May 3, 1:00 PM', done: true, icon: '📍' },
      { label: 'Checkpoint', location: 'El Paso, TX', time: 'May 3, 8:00 PM', done: true, icon: '📍' },
      { label: 'Delivered', location: 'Phoenix, AZ', time: 'May 4, 3:00 PM', done: true, icon: '✅' },
    ],
  },
]

// ── Monthly spend trend (mock) ────────────────────────────────────────────────
const MONTHLY_SPEND = [
  { month: 'Дек', spend: 28400 },
  { month: 'Янв', spend: 31200 },
  { month: 'Фев', spend: 26800 },
  { month: 'Мар', spend: 34500 },
  { month: 'Апр', spend: 38200 },
  { month: 'Май', spend: 12060 },
]

// ── SpendTrendChart ───────────────────────────────────────────────────────────
function SpendTrendChart() {
  const max = Math.max(...MONTHLY_SPEND.map(m => m.spend))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
        {MONTHLY_SPEND.map((m, i) => {
          const h = Math.round((m.spend / max) * 80)
          const isCurrent = i === MONTHLY_SPEND.length - 1
          return (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: isCurrent ? '#4BAED4' : '#A0AEC0' }}>
                ${(m.spend / 1000).toFixed(0)}k
              </div>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0', transition: 'height .3s',
                height: h, background: isCurrent
                  ? 'linear-gradient(180deg,#4BAED4,#2D7A9A)'
                  : 'linear-gradient(180deg,#CBD5E0,#A0AEC0)',
              }} />
              <div style={{ fontSize: 10, color: '#718096' }}>{m.month}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── CarrierPerformanceRow ─────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ fontSize: 12, color: '#ECC94B' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span style={{ color: '#718096', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  )
}

// ── Route SVG stub ────────────────────────────────────────────────────────────
function RouteMapStub({ from, to, progress }: { from: string; to: string; progress: number }) {
  const dotX = 40 + (progress / 100) * 220
  return (
    <div style={{ background: '#EBF8FF', borderRadius: 12, padding: 14, border: '1px solid #BAE6FD' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', marginBottom: 8 }}>📍 Route Overview</div>
      <svg width="100%" viewBox="0 0 300 60" style={{ display: 'block' }}>
        {/* Road */}
        <line x1="40" y1="30" x2="260" y2="30" stroke="#CBD5E0" strokeWidth="4" strokeLinecap="round"/>
        <line x1="40" y1="30" x2={Math.min(dotX, 260)} y2="30" stroke="#4BAED4" strokeWidth="4" strokeLinecap="round"/>
        {/* Origin */}
        <circle cx="40" cy="30" r="8" fill="#1A2535"/>
        <text x="40" y="52" textAnchor="middle" fontSize="9" fill="#1A2535" fontWeight="bold">{from.split(',')[0]}</text>
        {/* Destination */}
        <circle cx="260" cy="30" r="8" fill="#E2E8F0" stroke="#CBD5E0" strokeWidth="2"/>
        <text x="260" y="52" textAnchor="middle" fontSize="9" fill="#718096">{to.split(',')[0]}</text>
        {/* Truck icon */}
        <circle cx={dotX} cy="30" r="10" fill="#4BAED4" stroke="#fff" strokeWidth="2"/>
        <text x={dotX} y="34" textAnchor="middle" fontSize="10">🚛</text>
      </svg>
    </div>
  )
}

// ── Status & Invoice badges ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: ShipStatus }) {
  const map: Record<ShipStatus, string> = {
    'In Transit': 'badge-primary', 'Delivered': 'badge-success',
    'Picking Up': 'badge-warning', 'Delayed': 'badge-danger',
    'Cancelled': 'badge-danger',   'Pending': 'badge-warning',
  }
  return <span className={`badge ${map[status]}`}>● {status}</span>
}

function InvoiceBadge({ status }: { status: Shipment['invoiceStatus'] }) {
  if (status === 'N/A') return <span style={{ color: '#A0AEC0', fontSize: 12 }}>—</span>
  const cls = status === 'Paid' ? 'badge-success' : status === 'Overdue' ? 'badge-danger' : 'badge-warning'
  return <span className={`badge ${cls}`}>{status}</span>
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab({ shipments }: { shipments: Shipment[] }) {
  const totalSpend = shipments.reduce((s, sh) => s + parseFloat(sh.rate.replace(/[$,]/g, '')), 0)
  const delivered = shipments.filter(s => s.status === 'Delivered')
  const onTimeCount = shipments.filter(s => s.onTime).length
  const onTimeRate = Math.round((onTimeCount / shipments.length) * 100)

  // Carrier performance
  const carrierStats: Record<string, { loads: number; spend: number; rating: number; onTime: number }> = {}
  shipments.forEach(s => {
    if (s.carrier === 'Pending Assignment') return
    if (!carrierStats[s.carrier]) carrierStats[s.carrier] = { loads: 0, spend: 0, rating: s.carrierRating, onTime: 0 }
    carrierStats[s.carrier].loads++
    carrierStats[s.carrier].spend += parseFloat(s.rate.replace(/[$,]/g, ''))
    if (s.onTime) carrierStats[s.carrier].onTime++
  })
  const carriers = Object.entries(carrierStats).sort((a, b) => b[1].loads - a[1].loads)

  // Commodity breakdown
  const byType: Record<string, number> = {}
  shipments.forEach(s => { byType[s.truckType] = (byType[s.truckType] || 0) + 1 })
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const maxType = Math.max(...typeEntries.map(e => e[1]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Total Spend (Mo)', value: `$${(totalSpend/1000).toFixed(1)}k`, color: '#4BAED4', icon: '💳' },
          { label: 'On-Time Rate',     value: `${onTimeRate}%`,                     color: '#38C770', icon: '⏱️' },
          { label: 'Deliveries Done',  value: String(delivered.length),             color: '#8B5CF6', icon: '✅' },
          { label: 'Avg Carrier Rating', value: '4.6★', color: '#ECC94B', icon: '⭐' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${kpi.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{kpi.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1A2535' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: '#718096' }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Monthly spend trend */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 4 }}>Monthly Freight Spend</div>
          <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 16 }}>Last 6 months · YTD: $171K</div>
          <SpendTrendChart />
        </div>

        {/* Equipment type breakdown */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 14 }}>Shipments by Equipment</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {typeEntries.map(([type, cnt], i) => {
              const colors = ['#4BAED4', '#38C770', '#F59E0B', '#8B5CF6']
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{type}</span>
                    <span style={{ fontWeight: 700, color: colors[i % 4] }}>{cnt} loads</span>
                  </div>
                  <div className="progress-wrap" style={{ height: 8 }}>
                    <div className="progress-bar" style={{ width: `${(cnt / maxType) * 100}%`, background: colors[i % 4] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Carrier performance table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F4F8', fontWeight: 800, fontSize: 14, color: '#1A2535' }}>
          Carrier Performance
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Carrier</th>
              <th>Type</th>
              <th>Loads</th>
              <th>Total Spend</th>
              <th>On-Time</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {carriers.map(([name, stats]) => (
              <tr key={name}>
                <td style={{ fontWeight: 700 }}>{name}</td>
                <td style={{ color: '#718096', fontSize: 12 }}>{shipments.find(s => s.carrier === name)?.carrierType}</td>
                <td style={{ fontWeight: 700 }}>{stats.loads}</td>
                <td style={{ fontWeight: 700, color: '#38C770' }}>${stats.spend.toLocaleString()}</td>
                <td>
                  <span style={{ fontWeight: 700, color: stats.onTime === stats.loads ? '#38C770' : '#F59E0B' }}>
                    {Math.round((stats.onTime / stats.loads) * 100)}%
                  </span>
                </td>
                <td><StarRating rating={stats.rating} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function ShipmentDetail({ shipment, onClose, onNavigate }: {
  shipment: Shipment
  onClose: () => void
  onNavigate: (p: string) => void
}) {
  const [tab, setTab] = useState<'details' | 'tracking' | 'docs' | 'costs'>('details')
  const [podUploaded, setPodUploaded] = useState(false)
  const [rated, setRated] = useState(0)

  const statusColor = shipment.status === 'Delivered' ? '#38C770' :
    shipment.status === 'Delayed' ? '#EF4444' :
    shipment.status === 'In Transit' ? '#4BAED4' : '#F59E0B'

  const totalCharges = [
    { label: 'Base Rate', value: shipment.rate },
    { label: 'Fuel Surcharge', value: shipment.fuelSurcharge ?? '$0' },
    { label: 'Accessorials', value: shipment.accessorials ?? '$0' },
  ]
  const totalAmount = totalCharges.reduce((s, c) => s + parseFloat(c.value.replace(/[$,]/g, '') || '0'), 0)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Gradient header */}
      <div style={{
        background: `linear-gradient(135deg, #1A2535 0%, ${statusColor}44 100%)`,
        padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700, letterSpacing: 1 }}>SHIPMENT</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{shipment.id}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
            onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
          {shipment.from} → {shipment.to}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <StatusBadge status={shipment.status} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{shipment.truckType} · {shipment.weight}</span>
        </div>
        {/* Tags */}
        {shipment.tags && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {shipment.tags.map(tag => (
              <span key={tag} style={{
                padding: '2px 8px', borderRadius: 10, background: 'rgba(255,255,255,.15)',
                fontSize: 10, color: 'rgba(255,255,255,.85)', fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        )}
        {shipment.status !== 'Pending' && (
          <div>
            <div className="progress-wrap" style={{ height: 5, background: 'rgba(255,255,255,.2)' }}>
              <div className="progress-bar" style={{
                width: `${shipment.progress}%`,
                background: shipment.progress === 100 ? '#38C770' : '#fff',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 3 }}>
              <span>{shipment.pickupDate}</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{shipment.progress}%</span>
              <span>{shipment.deliveryDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F0F4F8' }}>
        {([['details', '📋'], ['tracking', '📡'], ['costs', '💰'], ['docs', '📄']] as const).map(([t, icon]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '9px 4px', fontWeight: 700, fontSize: 11,
            border: 'none', cursor: 'pointer',
            background: tab === t ? '#EBF8FF' : '#fff',
            color: tab === t ? '#4BAED4' : '#718096',
            borderBottom: tab === t ? '2px solid #4BAED4' : '2px solid transparent',
          }}>{icon} {t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div style={{ padding: 16, overflowY: 'auto', maxHeight: 480 }}>

        {/* DETAILS TAB */}
        {tab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Carrier',    value: shipment.carrier },
              { label: 'Type',       value: shipment.carrierType },
              { label: 'Broker',     value: shipment.broker },
              { label: 'Commodity',  value: shipment.commodity },
              { label: 'Weight',     value: shipment.weight },
              { label: 'Equipment',  value: shipment.truckType },
              { label: 'Rate',       value: shipment.rate, highlight: true },
              { label: 'Invoice',    value: <InvoiceBadge status={shipment.invoiceStatus} /> },
              { label: 'Pickup',     value: shipment.pickupDate },
              { label: 'Delivery',   value: shipment.actualDelivery ?? shipment.deliveryDate },
              { label: 'On Time',    value: shipment.onTime ? '✅ Yes' : '⚠️ Delayed' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px solid #F7FAFC',
              }}>
                <span style={{ fontSize: 12, color: '#A0AEC0', fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: (row as any).highlight ? '#38C770' : '#2D3748' }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Carrier rating */}
            {shipment.status === 'Delivered' && (
              <div style={{ marginTop: 8, padding: '12px 14px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>Rate this carrier</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRated(star)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 22, color: star <= (rated || shipment.carrierRating) ? '#ECC94B' : '#E2E8F0',
                    }}>★</button>
                  ))}
                  {rated > 0 && <span style={{ fontSize: 12, color: '#38C770', fontWeight: 700, alignSelf: 'center', marginLeft: 8 }}>✓ Saved</span>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 12 }}
                onClick={() => onNavigate('tracking')}>📡 Track Live</button>
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12 }}
                onClick={() => onNavigate('chat')}>💬 Contact</button>
            </div>
          </div>
        )}

        {/* TRACKING TAB */}
        {tab === 'tracking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Current location */}
            <div style={{ padding: '12px 14px', background: '#EBF8FF', borderRadius: 10, border: '1px solid #BAE6FD' }}>
              <div style={{ fontSize: 10, color: '#0369A1', fontWeight: 700, marginBottom: 2 }}>CURRENT LOCATION</div>
              <div style={{ fontWeight: 800, color: '#0C4A6E' }}>📍 {shipment.currentLocation}</div>
              {shipment.eta && <div style={{ fontSize: 12, color: '#0369A1', marginTop: 3 }}>ETA: {shipment.eta}</div>}
            </div>

            {/* Route map */}
            {shipment.status !== 'Pending' && (
              <RouteMapStub from={shipment.from} to={shipment.to} progress={shipment.progress} />
            )}

            {/* Timeline */}
            {shipment.events.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>EVENT TIMELINE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {shipment.events.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                      {/* Line */}
                      {i < shipment.events.length - 1 && (
                        <div style={{
                          position: 'absolute', left: 15, top: 32, width: 2, height: 'calc(100% - 4px)',
                          background: ev.done ? '#4BAED4' : '#E2E8F0',
                        }} />
                      )}
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: ev.done ? (ev.label.includes('Delayed') ? '#FEF2F2' : '#EBF8FF') : '#F7FAFC',
                        border: `2px solid ${ev.done ? (ev.label.includes('Delayed') ? '#EF4444' : '#4BAED4') : '#E2E8F0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, zIndex: 1,
                      }}>{ev.done ? ev.icon : '○'}</div>
                      <div style={{ paddingBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: ev.done ? '#2D3748' : '#A0AEC0' }}>{ev.label}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{ev.location}</div>
                        <div style={{ fontSize: 11, color: ev.done ? '#718096' : '#CBD5E0', fontWeight: 600 }}>{ev.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={() => onNavigate('tracking')}>
              📡 Open Full Tracking Map →
            </button>
          </div>
        )}

        {/* COSTS TAB */}
        {tab === 'costs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 4 }}>Charge Breakdown</div>
            {totalCharges.map(c => (
              <div key={c.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '10px 14px', background: '#F7FAFC', borderRadius: 10,
              }}>
                <span style={{ fontSize: 13, color: '#4A5568' }}>{c.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#2D3748' }}>{c.value}</span>
              </div>
            ))}
            <div style={{
              display: 'flex', justifyContent: 'space-between', padding: '12px 14px',
              background: '#1A2535', borderRadius: 10,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>Total Charges</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>${totalAmount.toLocaleString()}</span>
            </div>
            <div style={{ padding: '12px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 3 }}>INVOICE STATUS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <InvoiceBadge status={shipment.invoiceStatus} />
                {shipment.invoiceStatus === 'Pending' && (
                  <button style={{ padding: '6px 12px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Send Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOCS TAB */}
        {tab === 'docs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {shipment.docs === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#A0AEC0' }}>
                <div style={{ fontSize: 36 }}>📭</div>
                <div style={{ marginTop: 8 }}>No documents yet</div>
              </div>
            ) : (
              [
                { name: `BOL_${shipment.id}.pdf`, type: 'Bill of Lading', size: '118 KB', icon: '📋' },
                { name: `RateCon_${shipment.id}.pdf`, type: 'Rate Confirmation', size: '82 KB', icon: '📄' },
                { name: `POD_${shipment.id}.pdf`, type: 'Proof of Delivery', size: '204 KB', icon: '✅' },
                { name: `Invoice_${shipment.id}.pdf`, type: 'Invoice', size: '55 KB', icon: '💵' },
              ].slice(0, shipment.docs).map((doc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', background: '#F7FAFC', borderRadius: 10,
                  border: '1px solid #E2E8F0',
                }}>
                  <span style={{ fontSize: 20 }}>{doc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0' }}>{doc.type} · {doc.size}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">⬇️</button>
                </div>
              ))
            )}

            {/* POD upload */}
            {shipment.status === 'Delivered' && !podUploaded && (
              <div
                onClick={() => setPodUploaded(true)}
                style={{
                  border: '2px dashed #BEE3F8', borderRadius: 12, padding: '16px',
                  textAlign: 'center', cursor: 'pointer', background: '#F7FAFC',
                  transition: 'background .15s',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>📤</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4BAED4' }}>Upload POD</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Click or drag & drop</div>
              </div>
            )}
            {podUploaded && (
              <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', fontSize: 13, color: '#166534', fontWeight: 700 }}>
                ✅ POD uploaded successfully
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ShipmentsPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [selectedId, setSelectedId]    = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ShipStatus | 'All'>('All')
  const [search, setSearch]             = useState('')
  const [sortBy, setSortBy]             = useState<'date' | 'rate' | 'status'>('date')
  const [mainTab, setMainTab]           = useState<MainTab>('all')
  const [selected2, setSelected2]       = useState<Set<string>>(new Set())

  const selected = SHIPMENTS.find(s => s.id === selectedId)

  const activeShipments = SHIPMENTS.filter(s => ['In Transit', 'Picking Up', 'Delayed'].includes(s.status))

  const filtered = (mainTab === 'active' ? activeShipments : SHIPMENTS)
    .filter(s => {
      const matchStatus = filterStatus === 'All' || s.status === filterStatus
      const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.from.toLowerCase().includes(search.toLowerCase()) ||
        s.to.toLowerCase().includes(search.toLowerCase()) ||
        s.carrier.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'rate') return parseFloat(b.rate.replace(/[$,]/g, '')) - parseFloat(a.rate.replace(/[$,]/g, ''))
      return 0
    })

  const totalSpend = SHIPMENTS.reduce((s, sh) => s + parseFloat(sh.rate.replace(/[$,]/g, '')), 0)
  const delivered  = SHIPMENTS.filter(s => s.status === 'Delivered').length
  const onTimeRate = Math.round((SHIPMENTS.filter(s => s.onTime).length / SHIPMENTS.length) * 100)
  const active     = SHIPMENTS.filter(s => ['In Transit', 'Picking Up'].includes(s.status)).length

  function toggleSelect(id: string) {
    setSelected2(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Active Shipments', value: String(active),                       change: 'In transit / pickup',  up: true,  color: '#4BAED4', icon: '🚛' },
          { label: 'Total Spend (Mo)', value: `$${(totalSpend/1000).toFixed(1)}k`,  change: 'Across all carriers',  up: true,  color: '#38C770', icon: '💳' },
          { label: 'Delivered',        value: String(delivered),                    change: `${SHIPMENTS.length} total`,    up: true,  color: '#8B5CF6', icon: '✅' },
          { label: 'On-Time Rate',     value: `${onTimeRate}%`,                     change: 'Carrier performance',  up: true,  color: '#D97706', icon: '⏱️' },
        ].map(st => (
          <div key={st.label} className="stat-card" style={{ borderTopColor: st.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{st.icon}</span>
              <span className={`stat-change ${st.up ? 'up' : 'down'}`}>{st.change}</span>
            </div>
            <div className="stat-value">{st.value}</div>
            <div className="stat-label">{st.label}</div>
          </div>
        ))}
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 12, padding: 4, gap: 2, width: 'fit-content' }}>
        {([['active', '🚛 Active'], ['all', '📋 All Shipments'], ['analytics', '📊 Analytics']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setMainTab(key)} style={{
            padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: mainTab === key ? '#fff' : 'transparent',
            color: mainTab === key ? '#4BAED4' : '#718096',
            boxShadow: mainTab === key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* Analytics tab */}
      {mainTab === 'analytics' && <AnalyticsTab shipments={SHIPMENTS} />}

      {/* Active / All tabs */}
      {mainTab !== 'analytics' && (
        <>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" placeholder="🔍 Search shipments..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(['All', 'In Transit', 'Picking Up', 'Delivered', 'Delayed', 'Pending'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '5px 11px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  border: `1.5px solid ${filterStatus === s ? '#4BAED4' : '#E2E8F0'}`,
                  background: filterStatus === s ? '#EBF8FF' : 'transparent',
                  color: filterStatus === s ? '#4BAED4' : '#718096',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <select className="input" style={{ width: 130 }} value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                <option value="date">Date ↓</option>
                <option value="rate">Rate ↓</option>
                <option value="status">Status</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('post-load')}>
                ➕ Post Load
              </button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected2.size > 0 && (
            <div style={{
              background: '#1A2535', borderRadius: 12, padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{selected2.size} selected</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                {['⬇️ Export CSV', '📧 Email Carrier', '📄 Download Docs'].map(action => (
                  <button key={action} onClick={() => setSelected2(new Set())} style={{
                    padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.3)',
                    background: 'rgba(255,255,255,.1)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>{action}</button>
                ))}
                <button onClick={() => setSelected2(new Set())} style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 18,
                }}>✕</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" style={{ cursor: 'pointer' }}
                        checked={selected2.size === filtered.length && filtered.length > 0}
                        onChange={() => selected2.size === filtered.length
                          ? setSelected2(new Set())
                          : setSelected2(new Set(filtered.map(s => s.id)))}
                      />
                    </th>
                    <th>Shipment</th><th>Route</th><th>Carrier</th>
                    <th>Status</th><th>Progress</th><th>Rate</th><th>Invoice</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(sh => (
                    <tr key={sh.id}
                      style={{ cursor: 'pointer', background: selectedId === sh.id ? '#EBF8FF' : undefined }}
                      onClick={() => setSelectedId(selectedId === sh.id ? null : sh.id)}>
                      <td onClick={e => { e.stopPropagation(); toggleSelect(sh.id) }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} checked={selected2.has(sh.id)} readOnly />
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#4BAED4' }}>{sh.id}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{sh.pickupDate}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{sh.from.split(',')[0]} → {sh.to.split(',')[0]}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{sh.truckType} · {sh.weight}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="avatar" style={{ width: 24, height: 24, fontSize: 9 }}>{sh.carrier.charAt(0)}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{sh.carrier}</div>
                            <div style={{ fontSize: 10, color: '#A0AEC0' }}>{sh.broker}</div>
                          </div>
                        </div>
                      </td>
                      <td><StatusBadge status={sh.status} /></td>
                      <td style={{ width: 110 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div className="progress-wrap" style={{ flex: 1, height: 5 }}>
                            <div className="progress-bar" style={{
                              width: `${sh.progress}%`,
                              background: sh.progress === 100 ? '#38C770' : sh.status === 'Delayed' ? '#EF4444' : '#4BAED4',
                            }} />
                          </div>
                          <span style={{ fontSize: 10, color: '#718096' }}>{sh.progress}%</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 800, color: '#38C770' }}>{sh.rate}</td>
                      <td><InvoiceBadge status={sh.invoiceStatus} /></td>
                      <td>
                        <button className="btn btn-ghost btn-sm"
                          onClick={e => { e.stopPropagation(); setSelectedId(sh.id) }}>View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detail panel */}
            {selected && (
              <ShipmentDetail shipment={selected} onClose={() => setSelectedId(null)} onNavigate={onNavigate} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
