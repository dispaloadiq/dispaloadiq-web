import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type CustomerStatus = 'active' | 'vip' | 'inactive' | 'prospect' | 'churned'
type PricingTier    = 'spot' | 'contract' | 'dedicated' | 'preferred'
type DealStage      = 'lead' | 'contacted' | 'proposal' | 'negotiating' | 'won' | 'lost'

interface ShipmentRecord {
  id: string
  origin: string
  destination: string
  date: string
  revenue: number
  status: 'delivered' | 'in_transit' | 'cancelled'
  driver: string
}

interface CustomerContact {
  name: string
  title: string
  phone: string
  email: string
  primary: boolean
}

interface ActivityRecord {
  id: number
  date: string
  type: 'call' | 'email' | 'meeting' | 'note'
  summary: string
  outcome?: string
}

interface Customer {
  id: string
  company: string
  industry: string
  status: CustomerStatus
  pricingTier: PricingTier
  dealStage: DealStage
  dealValue: number
  creditLimit: number
  currentBalance: number
  avgDaysToPayment: number
  onTimePaymentPct: number
  totalShipments: number
  totalRevenue: number
  ytdRevenue: number
  contacts: CustomerContact[]
  shipments: ShipmentRecord[]
  activity: ActivityRecord[]
  notes: string
  address: string
  website: string
  addedDate: string
  lastShipment: string
  preferredEquipment: string[]
  tags: string[]
  monthlyRevenue: number[]   // last 6 months
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CUSTOMERS: Customer[] = [
  {
    id: 'CUS-001',
    company: 'Amazon Distribution Center',
    industry: 'E-Commerce / Retail',
    status: 'vip',
    pricingTier: 'dedicated',
    dealStage: 'won',
    dealValue: 480000,
    creditLimit: 150_000,
    currentBalance: 42_800,
    avgDaysToPayment: 15,
    onTimePaymentPct: 99,
    totalShipments: 218,
    totalRevenue: 487_600,
    ytdRevenue: 132_400,
    address: '1200 Distribution Pkwy, Chicago, IL 60601',
    website: 'amazon.com',
    addedDate: '2022-08-15',
    lastShipment: '2026-05-09',
    preferredEquipment: ["Dry Van 53'", 'Reefer'],
    tags: ['high-volume', 'dedicated', 'priority'],
    monthlyRevenue: [19200, 22400, 21800, 24100, 23600, 21300],
    contacts: [
      { name: 'Sarah Mitchell', title: 'Transportation Manager', phone: '(312) 555-1100', email: 's.mitchell@amazon.com', primary: true },
      { name: 'Doug Chen',      title: 'Logistics Coordinator',  phone: '(312) 555-1101', email: 'd.chen@amazon.com',     primary: false },
    ],
    activity: [
      { id: 1, date: '2026-05-08', type: 'call', summary: 'Weekly check-in call with Sarah', outcome: 'Confirmed Q2 volume; discussed rate review in July' },
      { id: 2, date: '2026-05-02', type: 'email', summary: 'Sent Q2 performance report', outcome: 'Positive feedback, 99.2% OTD last 30 days' },
      { id: 3, date: '2026-04-20', type: 'meeting', summary: 'QBR in Chicago office', outcome: 'Extended dedicated contract through Dec 2026' },
    ],
    notes: 'Largest customer. Requires EDI integration. Pickup window strictly 2 hours, otherwise $150 penalty. Always confirm ETA 2 hours in advance.',
    shipments: [
      { id: 'SHP-2240', origin: 'Chicago, IL', destination: 'Columbus, OH',   date: '2026-05-09', revenue: 1850, status: 'delivered', driver: 'Marcus J.' },
      { id: 'SHP-2238', origin: 'Chicago, IL', destination: 'Indianapolis',   date: '2026-05-07', revenue: 1420, status: 'delivered', driver: 'Elena V.'  },
      { id: 'SHP-2235', origin: 'Chicago, IL', destination: 'Detroit, MI',    date: '2026-05-05', revenue: 1680, status: 'delivered', driver: 'Tom B.'    },
      { id: 'SHP-2231', origin: 'Chicago, IL', destination: 'Cincinnati, OH', date: '2026-05-02', revenue: 1540, status: 'delivered', driver: 'Marcus J.' },
      { id: 'SHP-2220', origin: 'Chicago, IL', destination: 'Louisville, KY', date: '2026-04-28', revenue: 1380, status: 'delivered', driver: 'Elena V.'  },
    ],
  },
  {
    id: 'CUS-002',
    company: 'Target Stores Inc.',
    industry: 'Retail',
    status: 'active',
    pricingTier: 'contract',
    dealStage: 'won',
    dealValue: 220000,
    creditLimit: 80_000,
    currentBalance: 18_200,
    avgDaysToPayment: 22,
    onTimePaymentPct: 94,
    totalShipments: 104,
    totalRevenue: 224_800,
    ytdRevenue: 68_100,
    address: '1000 Nicollet Mall, Minneapolis, MN 55403',
    website: 'target.com',
    addedDate: '2023-02-10',
    lastShipment: '2026-05-06',
    preferredEquipment: ["Dry Van 53'"],
    tags: ['contract', 'midwest', 'retail'],
    monthlyRevenue: [10200, 11400, 12800, 11900, 12100, 9700],
    contacts: [
      { name: 'James Kowalski', title: 'Supply Chain Director', phone: '(612) 555-0240', email: 'j.kowalski@target.com', primary: true },
      { name: 'Priya Sharma',   title: 'Freight Coordinator',   phone: '(612) 555-0241', email: 'p.sharma@target.com',   primary: false },
    ],
    activity: [
      { id: 1, date: '2026-05-06', type: 'call', summary: 'Post-delivery check-in', outcome: 'Satisfied, confirmed upcoming May volume' },
      { id: 2, date: '2026-04-15', type: 'email', summary: 'Contract renewal proposal sent', outcome: 'Under review — follow up June 1' },
    ],
    notes: 'Stable Q2-Q3 2026 contract. Primary lanes: Minneapolis → Chicago, Minneapolis → Dallas. Rates locked through Sept 2026.',
    shipments: [
      { id: 'SHP-2237', origin: 'Minneapolis, MN', destination: 'Chicago, IL', date: '2026-05-06', revenue: 1920, status: 'delivered', driver: 'Tom B.'    },
      { id: 'SHP-2230', origin: 'Minneapolis, MN', destination: 'Dallas, TX',  date: '2026-05-01', revenue: 3100, status: 'delivered', driver: 'Marcus J.' },
      { id: 'SHP-2224', origin: 'Minneapolis, MN', destination: 'Chicago, IL', date: '2026-04-25', revenue: 1880, status: 'delivered', driver: 'Elena V.'  },
    ],
  },
  {
    id: 'CUS-003',
    company: 'PepsiCo Distribution',
    industry: 'Food & Beverage',
    status: 'active',
    pricingTier: 'preferred',
    dealStage: 'won',
    dealValue: 160000,
    creditLimit: 60_000,
    currentBalance: 9_400,
    avgDaysToPayment: 30,
    onTimePaymentPct: 91,
    totalShipments: 67,
    totalRevenue: 158_900,
    ytdRevenue: 44_200,
    address: '700 Anderson Hill Rd, Purchase, NY 10577',
    website: 'pepsico.com',
    addedDate: '2023-09-01',
    lastShipment: '2026-05-04',
    preferredEquipment: ['Reefer', "Dry Van 53'"],
    tags: ['reefer', 'food-grade', 'preferred'],
    monthlyRevenue: [6800, 7200, 7900, 8400, 7600, 6300],
    contacts: [
      { name: 'Diana Ross', title: 'Fleet Manager', phone: '(914) 555-0380', email: 'd.ross@pepsico.com', primary: true },
    ],
    activity: [
      { id: 1, date: '2026-05-04', type: 'call', summary: 'Confirmed reefer temp requirements for summer', outcome: 'Temp: 34-38°F; increase in summer volume expected' },
    ],
    notes: 'Reefer loads. Requires food-grade cleanliness certificate for each trip. Temp: 34-38°F. Good rates in summer.',
    shipments: [
      { id: 'SHP-2234', origin: 'Chicago, IL', destination: 'Kansas City, MO', date: '2026-05-04', revenue: 2100, status: 'delivered', driver: 'Elena V.' },
      { id: 'SHP-2226', origin: 'Chicago, IL', destination: 'St. Louis, MO',   date: '2026-04-26', revenue: 1480, status: 'delivered', driver: 'Tom B.'   },
    ],
  },
  {
    id: 'CUS-004',
    company: 'Home Depot Supply Chain',
    industry: 'Home Improvement',
    status: 'prospect',
    pricingTier: 'spot',
    dealStage: 'proposal',
    dealValue: 95000,
    creditLimit: 0,
    currentBalance: 0,
    avgDaysToPayment: 0,
    onTimePaymentPct: 0,
    totalShipments: 0,
    totalRevenue: 0,
    ytdRevenue: 0,
    address: '2455 Paces Ferry Rd, Atlanta, GA 30339',
    website: 'homedepot.com',
    addedDate: '2026-04-18',
    lastShipment: '—',
    preferredEquipment: ['Flatbed', "Dry Van 53'"],
    tags: ['flatbed', 'prospect', 'high-potential'],
    monthlyRevenue: [0, 0, 0, 0, 0, 0],
    contacts: [
      { name: 'Kevin Park', title: 'Procurement Manager', phone: '(770) 555-0490', email: 'k.park@homedepot.com', primary: true },
    ],
    activity: [
      { id: 1, date: '2026-05-01', type: 'email', summary: 'Sent pricing proposal for Q3 flatbed lanes', outcome: 'Kevin requested 3-day delivery SLA — revising proposal' },
      { id: 2, date: '2026-04-18', type: 'meeting', summary: 'Intro call via Kevin Morris (Echo)', outcome: 'Good fit; they need Atlanta → Midwest flatbeds. RFP deadline June 1' },
    ],
    notes: 'Met through Kevin Morris (Echo). Need flatbed lanes from Atlanta to Midwest. RFP for Q3 2026 — submit pricing by 01.06.2026.',
    shipments: [],
  },
  {
    id: 'CUS-005',
    company: 'Walmart Logistics',
    industry: 'Retail / Grocery',
    status: 'inactive',
    pricingTier: 'spot',
    dealStage: 'lost',
    dealValue: 40000,
    creditLimit: 40_000,
    currentBalance: 0,
    avgDaysToPayment: 45,
    onTimePaymentPct: 72,
    totalShipments: 23,
    totalRevenue: 38_700,
    ytdRevenue: 0,
    address: '702 SW 8th St, Bentonville, AR 72716',
    website: 'walmart.com',
    addedDate: '2023-05-20',
    lastShipment: '2025-11-14',
    preferredEquipment: ["Dry Van 53'"],
    tags: ['slow-pay', 'inactive'],
    monthlyRevenue: [4800, 3200, 2100, 0, 0, 0],
    contacts: [
      { name: 'Bob Stevens', title: 'Carrier Relations', phone: '(479) 555-0572', email: 'b.stevens@walmart.com', primary: true },
    ],
    activity: [
      { id: 1, date: '2026-02-10', type: 'call', summary: 'Attempted re-engagement call', outcome: 'No interest currently; check back Q4 2026' },
    ],
    notes: 'Last shipment November 2025. Slow payment 45+ days. Consider only if no other options.',
    shipments: [
      { id: 'SHP-2080', origin: 'Bentonville, AR', destination: 'Chicago, IL', date: '2025-11-14', revenue: 2200, status: 'delivered', driver: 'Tom B.' },
    ],
  },
  {
    id: 'CUS-006',
    company: 'FedEx Custom Critical',
    industry: 'Logistics / Freight',
    status: 'active',
    pricingTier: 'contract',
    dealStage: 'won',
    dealValue: 130000,
    creditLimit: 50_000,
    currentBalance: 11_600,
    avgDaysToPayment: 18,
    onTimePaymentPct: 97,
    totalShipments: 48,
    totalRevenue: 112_400,
    ytdRevenue: 38_800,
    address: '1000 FedEx Drive, Coraopolis, PA 15108',
    website: 'fedex.com',
    addedDate: '2024-01-20',
    lastShipment: '2026-05-08',
    preferredEquipment: ['Sprinter Van', 'Dry Van 53\''],
    tags: ['time-critical', 'high-value', 'recurring'],
    monthlyRevenue: [5800, 6200, 7100, 7400, 6900, 5400],
    contacts: [
      { name: 'Rachel Torres',  title: 'Carrier Manager',     phone: '(412) 555-0610', email: 'r.torres@fedex.com',    primary: true },
      { name: 'Mark Stevenson', title: 'Operations Planner',  phone: '(412) 555-0611', email: 'm.stevenson@fedex.com', primary: false },
    ],
    activity: [
      { id: 1, date: '2026-05-08', type: 'call', summary: 'Monthly performance review', outcome: '97.3% OTD — Rachel praised team reliability' },
      { id: 2, date: '2026-04-30', type: 'email', summary: 'Confirmed May dedicated slots', outcome: '3 lanes confirmed: PHL, ORD, DFW' },
    ],
    notes: 'Time-critical freight — strict pickup and delivery windows. Always available on call for emergency routes. High per-mile rates.',
    shipments: [
      { id: 'SHP-2239', origin: 'Philadelphia, PA', destination: 'Chicago, IL',  date: '2026-05-08', revenue: 2450, status: 'delivered', driver: 'Marcus J.' },
      { id: 'SHP-2232', origin: 'Chicago, IL',      destination: 'Dallas, TX',   date: '2026-05-03', revenue: 2800, status: 'delivered', driver: 'Elena V.'  },
      { id: 'SHP-2225', origin: 'Dallas, TX',       destination: 'Atlanta, GA',  date: '2026-04-26', revenue: 1960, status: 'delivered', driver: 'Tom B.'    },
    ],
  },
  {
    id: 'CUS-007',
    company: 'AutoZone Distribution',
    industry: 'Auto Parts',
    status: 'prospect',
    pricingTier: 'spot',
    dealStage: 'contacted',
    dealValue: 75000,
    creditLimit: 0,
    currentBalance: 0,
    avgDaysToPayment: 0,
    onTimePaymentPct: 0,
    totalShipments: 2,
    totalRevenue: 3_800,
    ytdRevenue: 3_800,
    address: '123 S. Front St, Memphis, TN 38103',
    website: 'autozone.com',
    addedDate: '2026-03-15',
    lastShipment: '2026-04-12',
    preferredEquipment: ['Dry Van 53\''],
    tags: ['auto', 'prospect', 'memphis'],
    monthlyRevenue: [0, 0, 0, 0, 1800, 2000],
    contacts: [
      { name: 'Tony Ramirez', title: 'Fleet Coordinator', phone: '(901) 555-0720', email: 't.ramirez@autozone.com', primary: true },
    ],
    activity: [
      { id: 1, date: '2026-05-05', type: 'call', summary: 'Follow-up on trial shipments', outcome: 'Happy with performance; asking for lane rates proposal' },
      { id: 2, date: '2026-03-15', type: 'meeting', summary: 'Initial intro via industry event', outcome: 'Mutual interest — 2 trial loads approved' },
    ],
    notes: '2 trial loads completed successfully. Looking to build a lane contract for Memphis → Chicago corridor. High volume potential if contract wins.',
    shipments: [
      { id: 'SHP-2228', origin: 'Memphis, TN', destination: 'Chicago, IL', date: '2026-04-12', revenue: 2000, status: 'delivered', driver: 'Marcus J.' },
      { id: 'SHP-2215', origin: 'Memphis, TN', destination: 'St. Louis, MO', date: '2026-03-28', revenue: 1800, status: 'delivered', driver: 'Tom B.' },
    ],
  },
  {
    id: 'CUS-008',
    company: 'Sysco Foods Midwest',
    industry: 'Food Distribution',
    status: 'active',
    pricingTier: 'preferred',
    dealStage: 'won',
    dealValue: 200000,
    creditLimit: 70_000,
    currentBalance: 14_200,
    avgDaysToPayment: 28,
    onTimePaymentPct: 88,
    totalShipments: 54,
    totalRevenue: 141_600,
    ytdRevenue: 51_200,
    address: '1390 Enclave Pkwy, Houston, TX 77077',
    website: 'sysco.com',
    addedDate: '2023-11-08',
    lastShipment: '2026-05-07',
    preferredEquipment: ['Reefer', 'Dry Van 53\''],
    tags: ['food-grade', 'reefer', 'temperature-controlled'],
    monthlyRevenue: [7800, 8400, 9100, 9600, 8800, 7500],
    contacts: [
      { name: 'Amanda Wu',    title: 'Transportation Director', phone: '(713) 555-0810', email: 'a.wu@sysco.com',    primary: true },
      { name: 'Ray Johnson',  title: 'Route Planner',          phone: '(713) 555-0811', email: 'r.johnson@sysco.com', primary: false },
    ],
    activity: [
      { id: 1, date: '2026-05-07', type: 'call', summary: 'Temperature compliance discussion', outcome: 'All good — asked for pre-trip temp logs on reefer loads' },
      { id: 2, date: '2026-04-22', type: 'email', summary: 'Sent May volume forecast', outcome: 'Confirmed +15% volume increase in May-June' },
    ],
    notes: 'Temperature-controlled freight is priority. Must document pre-trip reefer logs. Growing volume — upsell opportunity for second dedicated truck.',
    shipments: [
      { id: 'SHP-2236', origin: 'Houston, TX',      destination: 'Dallas, TX',       date: '2026-05-07', revenue: 1120, status: 'delivered', driver: 'Elena V.'  },
      { id: 'SHP-2233', origin: 'Houston, TX',      destination: 'San Antonio, TX',  date: '2026-05-03', revenue: 890,  status: 'delivered', driver: 'Tom B.'    },
      { id: 'SHP-2227', origin: 'Dallas, TX',       destination: 'Oklahoma City, OK', date: '2026-04-27', revenue: 1380, status: 'delivered', driver: 'Marcus J.' },
    ],
  },
]

// ── Pipeline stages config ────────────────────────────────────────────────────
const STAGE_CONF: Record<DealStage, { label: string; color: string; bg: string }> = {
  lead:        { label: '💡 Lead',         color: '#718096', bg: '#F7FAFC' },
  contacted:   { label: '📞 Contacted',    color: '#2C7A7B', bg: '#E6FFFA' },
  proposal:    { label: '📄 Proposal',     color: '#2C7A9A', bg: '#EBF8FF' },
  negotiating: { label: '🤝 Negotiating',  color: '#B7791F', bg: '#FEFCBF' },
  won:         { label: '✅ Won',          color: '#276749', bg: '#F0FFF4' },
  lost:        { label: '❌ Lost',         color: '#9B2C2C', bg: '#FFF5F5' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONF: Record<CustomerStatus, { label: string; color: string; bg: string }> = {
  vip:      { label: '⭐ VIP',      color: '#B7791F', bg: '#FEFCBF' },
  active:   { label: '✅ Active',   color: '#276749', bg: '#F0FFF4' },
  prospect: { label: '🔍 Prospect', color: '#2C7A7B', bg: '#E6FFFA' },
  inactive: { label: '💤 Inactive', color: '#718096', bg: '#F7FAFC' },
  churned:  { label: '❌ Churned',  color: '#9B2C2C', bg: '#FFF5F5' },
}

const TIER_CONF: Record<PricingTier, { label: string; color: string }> = {
  dedicated: { label: '🔒 Dedicated', color: '#553C9A' },
  preferred: { label: '⭐ Preferred',  color: '#B7791F' },
  contract:  { label: '📃 Contract',  color: '#2C7A9A' },
  spot:      { label: '📦 Spot',      color: '#718096' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function utilizationColor(pct: number) {
  if (pct > 85) return '#E53E3E'
  if (pct > 60) return '#ECC94B'
  return '#48BB78'
}

// ── Mini Revenue Chart ────────────────────────────────────────────────────────
function RevenueTrend({ data, color = '#4BAED4' }: { data: number[]; color?: string }) {
  if (!data.length || data.every(v => v === 0)) {
    return <div style={{ fontSize: 11, color: '#A0AEC0', padding: '8px 0' }}>No revenue data yet</div>
  }
  const max  = Math.max(...data, 1)
  const w    = 200
  const h    = 48
  const pts  = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 6)}`).join(' ')
  const area = `${pts} ${w},${h} 0,${h}`
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${color.replace('#','')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * w}
            cy={h - (v / max) * (h - 6)}
            r="3" fill={color} stroke="#fff" strokeWidth="1.5"
          />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {months.map((m, i) => (
          <div key={i} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 9, color: '#A0AEC0' }}>{m}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#718096' }}>${(data[i] / 1000).toFixed(1)}k</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pipeline Kanban ────────────────────────────────────────────────────────────
function PipelineView({ customers }: { customers: Customer[] }) {
  const stages: DealStage[] = ['lead', 'contacted', 'proposal', 'negotiating', 'won', 'lost']
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 900 }}>
        {stages.map(stage => {
          const stageCustomers = customers.filter(c => c.dealStage === stage)
          const stageValue     = stageCustomers.reduce((s, c) => s + c.dealValue, 0)
          const sc             = STAGE_CONF[stage]
          return (
            <div key={stage} style={{ flex: 1, minWidth: 140 }}>
              <div style={{ background: sc.bg, border: `1.5px solid ${sc.color}30`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{sc.label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#718096' }}>{stageCustomers.length} accounts</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc.color }}>{stageValue > 0 ? fmt(stageValue) : '—'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageCustomers.map(c => (
                  <div key={c.id} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535', marginBottom: 4 }}>{c.company}</div>
                    <div style={{ fontSize: 11, color: '#718096' }}>{c.industry}</div>
                    {c.dealValue > 0 && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#38C770', marginTop: 4 }}>{fmt(c.dealValue)}</div>
                    )}
                    {c.contacts[0] && (
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 3 }}>{c.contacts[0].name}</div>
                    )}
                  </div>
                ))}
                {stageCustomers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px 8px', color: '#CBD5E0', fontSize: 11, border: '1.5px dashed #E2E8F0', borderRadius: 10 }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Add Customer Modal ────────────────────────────────────────────────────────
interface AddCustomerModalProps { onClose: () => void; onSave: (c: Customer) => void }
function AddCustomerModal({ onClose, onSave }: AddCustomerModalProps) {
  const [form, setForm] = useState({ company: '', industry: '', address: '', contactName: '', contactTitle: '', phone: '', email: '', notes: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  function handleSave() {
    if (!form.company) return
    const c: Customer = {
      id: `CUS-${String(Math.floor(Math.random() * 900) + 100)}`,
      company: form.company, industry: form.industry,
      status: 'prospect', pricingTier: 'spot',
      dealStage: 'lead', dealValue: 0,
      creditLimit: 0, currentBalance: 0,
      avgDaysToPayment: 0, onTimePaymentPct: 0,
      totalShipments: 0, totalRevenue: 0, ytdRevenue: 0,
      address: form.address, website: '',
      addedDate: new Date().toISOString().split('T')[0], lastShipment: '—',
      preferredEquipment: [], tags: ['new'],
      notes: form.notes, activity: [],
      monthlyRevenue: [0, 0, 0, 0, 0, 0],
      contacts: form.contactName ? [{ name: form.contactName, title: form.contactTitle, phone: form.phone, email: form.email, primary: true }] : [],
      shipments: [],
    }
    onSave(c)
    onClose()
  }

  const fields: [keyof typeof form, string, boolean][] = [
    ['company',      'Company Name *', false],
    ['industry',     'Industry',       false],
    ['address',      'Address',        false],
    ['contactName',  'Primary Contact',false],
    ['contactTitle', 'Title / Role',   false],
    ['phone',        'Phone',          false],
    ['email',        'Email',          true ],
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 500, maxWidth: '95vw', boxShadow: '0 16px 48px rgba(0,0,0,.2)' }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>➕ Add Customer</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {fields.map(([k, lbl, full]) => (
            <div key={k} style={{ gridColumn: full ? '1/-1' : undefined }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>{lbl}</label>
              <input value={form[k]} onChange={set(k)}
                style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }}
                placeholder={lbl.replace(' *', '')} />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3}
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="First impressions, referral source, potential volume..." />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Save Customer</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMERS)
  const [selected, setSelected]   = useState<Customer>(CUSTOMERS[0])
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'shipments' | 'contacts' | 'activity' | 'notes'>('overview')
  const [pageView, setPageView]   = useState<'list' | 'pipeline'>('list')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = customers.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    if (search && !c.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalRev    = customers.reduce((s, c) => s + c.totalRevenue, 0)
  const ytdRev      = customers.reduce((s, c) => s + c.ytdRevenue, 0)
  const activeCount = customers.filter(c => c.status === 'active' || c.status === 'vip').length
  const totalShips  = customers.reduce((s, c) => s + c.totalShipments, 0)
  const pipeline    = customers.filter(c => c.dealStage !== 'won' && c.dealStage !== 'lost').reduce((s, c) => s + c.dealValue, 0)

  const utilPct = selected.creditLimit > 0
    ? Math.round((selected.currentBalance / selected.creditLimit) * 100)
    : 0

  function handleAddCustomer(c: Customer) {
    setCustomers(p => [...p, c])
    setSelected(c)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { icon: '🏢', label: 'Total Customers',  value: customers.length,    sub: `${activeCount} active/VIP`,  color: '#059669' },
          { icon: '💰', label: 'All-Time Revenue', value: fmt(totalRev),        sub: `${fmt(ytdRev)} YTD 2026`,   color: '#4BAED4' },
          { icon: '🚚', label: 'Total Shipments',  value: totalShips,           sub: 'completed',                 color: '#8B5CF6' },
          { icon: '🔍', label: 'Prospects',        value: customers.filter(c => c.status === 'prospect').length,
                                                    sub: 'pipeline opportunities',                                color: '#D97706' },
          { icon: '📊', label: 'Pipeline Value',   value: fmt(pipeline),        sub: 'active deals',             color: '#2C7A9A' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: '#718096' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', background: '#F7FAFC', borderRadius: 10, padding: 4, border: '1.5px solid #E2E8F0', gap: 2 }}>
          {(['list', 'pipeline'] as const).map(v => (
            <button key={v} onClick={() => setPageView(v)} style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: pageView === v ? '#fff' : 'transparent',
              color: pageView === v ? '#2D3748' : '#718096',
              boxShadow: pageView === v ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            }}>
              {v === 'list' ? '☰ List' : '📋 Pipeline'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddModal(true)}
          style={{ padding: '8px 18px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Add Customer
        </button>
      </div>

      {/* Pipeline view */}
      {pageView === 'pipeline' && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>📋 Sales Pipeline</h3>
          <PipelineView customers={customers} />
        </div>
      )}

      {/* List + Detail view */}
      {pageView === 'list' && (
        <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

          {/* ── Left List ── */}
          <div style={{ width: 300, flexShrink: 0, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #F0F4F8', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="🔍  Search customers..."
                  style={{ flex: 1, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 10px', fontSize: 12 }} />
                <button onClick={() => setShowAddModal(true)}
                  style={{ padding: '7px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {(['all', 'vip', 'active', 'prospect', 'inactive', 'churned'] as const).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: '3px 8px', borderRadius: 20, border: '1.5px solid',
                    borderColor: filterStatus === s ? '#059669' : '#E2E8F0',
                    background: filterStatus === s ? '#F0FFF4' : '#fff',
                    color: filterStatus === s ? '#276749' : '#718096',
                    fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  }}>{s === 'all' ? 'All' : STATUS_CONF[s].label}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map(c => {
                const sc = STATUS_CONF[c.status]
                const tc = TIER_CONF[c.pricingTier]
                return (
                  <div key={c.id} onClick={() => { setSelected(c); setActiveTab('overview') }}
                    style={{
                      padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #F0F4F8',
                      background: selected.id === c.id ? '#F0FFF4' : 'transparent',
                      borderLeft: selected.id === c.id ? '3px solid #059669' : '3px solid transparent',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', flex: 1, marginRight: 6 }}>{c.company}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 4 }}>{c.industry}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: tc.color, fontWeight: 600 }}>{tc.label}</span>
                      {c.totalRevenue > 0 && (
                        <span style={{ fontSize: 11, color: '#A0AEC0' }}>{fmt(c.totalRevenue)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No customers found</div>
              )}
            </div>
          </div>

          {/* ── Right Detail ── */}
          <div style={{ flex: 1, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Detail header */}
            <div style={{ padding: '18px 22px', borderBottom: '1.5px solid #F0F4F8' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#F0FFF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏢</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2535' }}>{selected.company}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>{selected.industry} · {selected.address}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: STATUS_CONF[selected.status].bg, color: STATUS_CONF[selected.status].color }}>
                      {STATUS_CONF[selected.status].label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: '#F7FAFC', color: TIER_CONF[selected.pricingTier].color, border: '1px solid #E2E8F0' }}>
                      {TIER_CONF[selected.pricingTier].label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: STAGE_CONF[selected.dealStage].bg, color: STAGE_CONF[selected.dealStage].color, border: '1px solid #E2E8F0' }}>
                      {STAGE_CONF[selected.dealStage].label}
                    </span>
                    {selected.preferredEquipment.map(e => (
                      <span key={e} style={{ fontSize: 10, padding: '2px 7px', background: '#EBF8FF', borderRadius: 8, color: '#2C7A9A', border: '1px solid #BEE3F8' }}>{e}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  {[
                    { label: 'Total Revenue', value: fmt(selected.totalRevenue), color: '#059669' },
                    { label: 'YTD 2026',      value: fmt(selected.ytdRevenue),   color: '#4BAED4' },
                    { label: 'Shipments',     value: selected.totalShipments,    color: '#8B5CF6' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', background: '#F7FAFC', borderRadius: 10, padding: '8px 14px' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {selected.creditLimit > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 12, color: '#718096', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    Credit: {fmt(selected.currentBalance)} / {fmt(selected.creditLimit)}
                  </div>
                  <div style={{ flex: 1, height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${utilPct}%`, height: '100%', background: utilizationColor(utilPct), borderRadius: 4, transition: 'width .4s' }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: utilizationColor(utilPct), whiteSpace: 'nowrap' }}>{utilPct}% used</div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1.5px solid #E2E8F0', padding: '0 22px' }}>
              {(['overview', 'shipments', 'contacts', 'activity', 'notes'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '10px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  border: 'none', background: 'none',
                  borderBottom: activeTab === t ? '2.5px solid #059669' : '2.5px solid transparent',
                  color: activeTab === t ? '#059669' : '#718096',
                }}>
                  {t === 'overview'   ? '📊 Overview'
                   : t === 'shipments' ? `🚚 Shipments (${selected.shipments.length})`
                   : t === 'contacts'  ? `👤 Contacts (${selected.contacts.length})`
                   : t === 'activity'  ? `📞 Activity (${selected.activity.length})`
                   : '📝 Notes'}
                </button>
              ))}
            </div>

            {/* Tab body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Avg Payment Days',    value: selected.avgDaysToPayment > 0 ? `${selected.avgDaysToPayment}d` : '—', icon: '📅' },
                      { label: 'On-Time Payment',     value: selected.onTimePaymentPct > 0 ? `${selected.onTimePaymentPct}%` : '—',  icon: '✅' },
                      { label: 'Total Shipments',     value: selected.totalShipments || '—',                                          icon: '🚚' },
                      { label: 'Last Shipment',       value: selected.lastShipment,                                                   icon: '📆' },
                      { label: 'Customer Since',      value: selected.addedDate,                                                      icon: '🗓️' },
                      { label: 'Deal Value',          value: selected.dealValue > 0 ? fmt(selected.dealValue) : '—',                  icon: '💼' },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ fontSize: 20 }}>{m.icon}</div>
                        <div>
                          <div style={{ fontSize: 11, color: '#A0AEC0' }}>{m.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{m.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Revenue trend chart */}
                  <div style={{ background: '#F7FAFC', borderRadius: 12, padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748', marginBottom: 12 }}>📈 Revenue Trend (6 months)</div>
                    <RevenueTrend data={selected.monthlyRevenue} color="#059669" />
                  </div>

                  {/* Tags + status management */}
                  {selected.tags.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 8 }}>Tags</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {selected.tags.map(t => (
                          <span key={t} style={{ fontSize: 11, padding: '3px 9px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8, color: '#718096' }}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status + tier */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#2D3748' }}>🏷️ Status</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['vip', 'active', 'prospect', 'inactive', 'churned'] as const).map(s => (
                          <button key={s} onClick={() => {
                            const u = { ...selected, status: s }
                            setCustomers(p => p.map(c => c.id === selected.id ? u : c))
                            setSelected(u)
                          }} style={{
                            padding: '5px 10px', borderRadius: 8, border: '1.5px solid',
                            borderColor: selected.status === s ? STATUS_CONF[s].color : '#E2E8F0',
                            background: selected.status === s ? STATUS_CONF[s].bg : '#fff',
                            color: selected.status === s ? STATUS_CONF[s].color : '#718096',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>{STATUS_CONF[s].label}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, color: '#2D3748' }}>💲 Pricing Tier</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['dedicated', 'preferred', 'contract', 'spot'] as const).map(t => (
                          <button key={t} onClick={() => {
                            const u = { ...selected, pricingTier: t }
                            setCustomers(p => p.map(c => c.id === selected.id ? u : c))
                            setSelected(u)
                          }} style={{
                            padding: '5px 10px', borderRadius: 8, border: '1.5px solid',
                            borderColor: selected.pricingTier === t ? '#2C7A9A' : '#E2E8F0',
                            background: selected.pricingTier === t ? '#EBF8FF' : '#fff',
                            color: selected.pricingTier === t ? '#2C7A9A' : '#718096',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>{TIER_CONF[t].label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SHIPMENTS ── */}
              {activeTab === 'shipments' && (
                <div>
                  {selected.shipments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#A0AEC0' }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🚚</div>
                      <div style={{ fontSize: 14 }}>No shipment history yet</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selected.shipments.map(s => {
                        const sc = s.status === 'delivered'
                          ? { label: '✅ Delivered', color: '#276749', bg: '#F0FFF4' }
                          : s.status === 'in_transit'
                          ? { label: '🚛 In Transit', color: '#2C7A9A', bg: '#EBF8FF' }
                          : { label: '❌ Cancelled', color: '#9B2C2C', bg: '#FFF5F5' }
                        return (
                          <div key={s.id} style={{ background: '#F7FAFC', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: '#A0AEC0', minWidth: 72 }}>{s.id}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{s.origin} → {s.destination}</div>
                              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{s.date} · Driver: {s.driver}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#2D3748' }}>{fmt(s.revenue)}</div>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: sc.bg, color: sc.color }}>{sc.label}</span>
                            </div>
                          </div>
                        )
                      })}
                      <div style={{ background: '#F0FFF4', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#276749' }}>Total Revenue</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>{fmt(selected.shipments.reduce((s, r) => s + r.revenue, 0))}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── CONTACTS ── */}
              {activeTab === 'contacts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selected.contacts.map((c, i) => (
                    <div key={i} style={{ background: '#F7FAFC', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#4BAED4', flexShrink: 0 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A2535' }}>{c.name}</span>
                          {c.primary && <span style={{ fontSize: 10, background: '#EBF8FF', color: '#2C7A9A', padding: '2px 7px', borderRadius: 8, fontWeight: 700 }}>Primary</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{c.title}</div>
                        <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                          <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: '#059669', textDecoration: 'none', fontWeight: 600 }}>📞 {c.phone}</a>
                          <a href={`mailto:${c.email}`} style={{ fontSize: 12, color: '#4BAED4', textDecoration: 'none', fontWeight: 600 }}>✉️ {c.email}</a>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm">📞 Call</button>
                        <button className="btn btn-ghost btn-sm">✉️ Email</button>
                      </div>
                    </div>
                  ))}
                  {selected.contacts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 32, color: '#A0AEC0' }}>No contacts added yet</div>
                  )}
                </div>
              )}

              {/* ── ACTIVITY ── */}
              {activeTab === 'activity' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#2D3748' }}>Activity Log</h4>
                    <button className="btn btn-ghost btn-sm">+ Log Activity</button>
                  </div>
                  {selected.activity.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 32, color: '#A0AEC0' }}>No activity recorded yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selected.activity.map(a => {
                        const typeConf: Record<ActivityRecord['type'], { icon: string; color: string }> = {
                          call:    { icon: '📞', color: '#2C7A9A' },
                          email:   { icon: '✉️', color: '#8B5CF6' },
                          meeting: { icon: '🤝', color: '#D97706' },
                          note:    { icon: '📝', color: '#718096' },
                        }
                        const tc = typeConf[a.type]
                        return (
                          <div key={a.id} style={{ background: '#F7FAFC', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: tc.color + '20', border: `2px solid ${tc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                              {tc.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{a.summary}</span>
                                <span style={{ fontSize: 11, color: '#A0AEC0' }}>{a.date}</span>
                              </div>
                              {a.outcome && (
                                <div style={{ fontSize: 12, color: '#718096', background: '#fff', padding: '6px 10px', borderRadius: 8, borderLeft: `3px solid ${tc.color}` }}>
                                  {a.outcome}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── NOTES ── */}
              {activeTab === 'notes' && (
                <CustomerNoteEditor
                  key={selected.id}
                  initialNote={selected.notes}
                  onSave={note => {
                    const u = { ...selected, notes: note }
                    setCustomers(p => p.map(c => c.id === selected.id ? u : c))
                    setSelected(u)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} onSave={handleAddCustomer} />}
    </div>
  )
}

function CustomerNoteEditor({ initialNote, onSave }: { initialNote: string; onSave: (n: string) => void }) {
  const [note, setNote] = useState(initialNote)
  const [saved, setSaved] = useState(false)
  return (
    <div>
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={9}
        style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', fontSize: 13, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
        placeholder="Add notes about this customer — special requirements, payment behavior, contacts, pricing history..." />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button onClick={() => { onSave(note); setSaved(true); setTimeout(() => setSaved(false), 2000) }}
          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: saved ? '#48BB78' : '#059669', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {saved ? '✓ Saved!' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}
