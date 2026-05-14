import { useState } from 'react'
import BookLoadModal, { type BookableClient } from '../../components/BookLoadModal'

// ── Types ─────────────────────────────────────────────────────────────────────
type ClientStatus = 'Active' | 'Pending' | 'Inactive' | 'New'
type DetailTab = 'overview' | 'loads' | 'performance' | 'notes' | 'contact'

interface Client {
  id: string
  name: string
  company: string
  truckType: string
  truckCount: number
  status: ClientStatus
  since: string
  loadsThisMonth: number
  totalLoads: number
  revenue: string
  rpm: string
  rpmNum: number
  nextLoad?: string
  phone: string
  email: string
  lanes: string[]
  lastContact: string
  rpmHistory: number[]     // 6 months
  loadHistory: number[]    // 6 months load counts
  tags: string[]
  onTimeRate: number
  avgRate: string
  atRisk?: boolean
  churnScore: number       // 0-100, higher = more risk
  revenueHistory: number[] // 3 months actual + 3 months projected
}

interface LoadRecord {
  id: string
  from: string
  to: string
  date: string
  rate: string
  rpm: string
  status: 'Delivered' | 'In Transit' | 'Cancelled'
  broker: string
}

interface ClientNote {
  id: number
  text: string
  time: string
  author: string
}

interface FollowUp {
  id: number
  date: string        // ISO date string
  note: string
  done: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: 'c1', name: 'Mike Rodriguez', company: 'Rodriguez Freight',
    truckType: 'Dry Van', truckCount: 1, status: 'Active',
    since: 'Jan 2024', loadsThisMonth: 8, totalLoads: 62,
    revenue: '$14,240', rpm: '$2.45', rpmNum: 2.45, nextLoad: 'May 12 — Chicago → Dallas',
    phone: '(312) 555-0182', email: 'mike@rffreight.com',
    lanes: ['Chicago → Dallas', 'Chicago → Atlanta'],
    lastContact: '2 hours ago',
    rpmHistory: [2.28, 2.31, 2.38, 2.40, 2.42, 2.45],
    loadHistory: [5, 6, 7, 8, 7, 8],
    tags: ['VIP', 'Fast Pay', 'Dry Van'],
    onTimeRate: 96, avgRate: '$1,820', atRisk: false,
    churnScore: 8,
    revenueHistory: [12100, 13400, 14240, 14900, 15600, 16200],
  },
  {
    id: 'c2', name: 'Anna Perez', company: 'AP Transport',
    truckType: 'Dry Van', truckCount: 1, status: 'Active',
    since: 'Mar 2024', loadsThisMonth: 5, totalLoads: 28,
    revenue: '$7,450', rpm: '$2.38', rpmNum: 2.38, nextLoad: 'May 13 — Miami → Atlanta',
    phone: '(305) 555-0291', email: 'anna@aptransport.com',
    lanes: ['Miami → Atlanta', 'Miami → Jacksonville'],
    lastContact: 'Yesterday',
    rpmHistory: [2.19, 2.24, 2.28, 2.31, 2.35, 2.38],
    loadHistory: [3, 4, 4, 5, 5, 5],
    tags: ['Growing', 'Southeast', 'New'],
    onTimeRate: 100, avgRate: '$1,490', atRisk: false,
    churnScore: 15,
    revenueHistory: [5200, 6100, 7450, 7800, 8300, 8900],
  },
  {
    id: 'c3', name: 'James Carter', company: 'Carter Logistics',
    truckType: 'Flatbed', truckCount: 2, status: 'Active',
    since: 'Nov 2023', loadsThisMonth: 11, totalLoads: 94,
    revenue: '$21,800', rpm: '$2.61', rpmNum: 2.61, nextLoad: 'May 11 — LA → Phoenix',
    phone: '(213) 555-0374', email: 'j.carter@carterlogistics.net',
    lanes: ['LA → Phoenix', 'LA → Las Vegas', 'Phoenix → Denver'],
    lastContact: '3 days ago',
    rpmHistory: [2.44, 2.48, 2.52, 2.55, 2.59, 2.61],
    loadHistory: [7, 9, 10, 10, 11, 11],
    tags: ['VIP', 'Flatbed', 'West Coast', 'Long-Term'],
    onTimeRate: 94, avgRate: '$1,980', atRisk: false,
    churnScore: 12,
    revenueHistory: [18200, 19400, 21800, 22500, 23400, 24100],
  },
  {
    id: 'c4', name: 'Dmitro Kovalenko', company: 'Solo Operator',
    truckType: 'Reefer', truckCount: 1, status: 'Pending',
    since: 'May 2025', loadsThisMonth: 0, totalLoads: 0,
    revenue: '$0', rpm: '—', rpmNum: 0, nextLoad: undefined,
    phone: '(773) 555-0518', email: 'dm.kovalenko@gmail.com',
    lanes: ['Chicago → Dallas', 'Chicago → Houston'],
    lastContact: 'Today',
    rpmHistory: [0, 0, 0, 0, 0, 0],
    loadHistory: [0, 0, 0, 0, 0, 0],
    tags: ['New', 'Reefer', 'Onboarding'],
    onTimeRate: 0, avgRate: '—', atRisk: false,
    churnScore: 40,
    revenueHistory: [0, 0, 0, 1800, 3600, 5400],
  },
  {
    id: 'c5', name: 'Tony Marshall', company: 'Marshall Trucking LLC',
    truckType: 'Dry Van', truckCount: 3, status: 'Inactive',
    since: 'Jul 2023', loadsThisMonth: 0, totalLoads: 47,
    revenue: '$0', rpm: '$2.21', rpmNum: 2.21, nextLoad: undefined,
    phone: '(615) 555-0619', email: 'tony@marshalltrucking.com',
    lanes: ['Nashville → Chicago'],
    lastContact: '2 weeks ago',
    rpmHistory: [2.38, 2.34, 2.28, 2.25, 2.21, 0],
    loadHistory: [6, 5, 4, 2, 1, 0],
    tags: ['At Risk', 'Needs Follow-up', 'Dry Van'],
    onTimeRate: 88, avgRate: '$1,650', atRisk: true,
    churnScore: 88,
    revenueHistory: [9800, 7200, 4100, 1200, 0, 0],
  },
  {
    id: 'c6', name: 'Sarah Kim', company: 'Kim Express LLC',
    truckType: 'Reefer', truckCount: 1, status: 'Active',
    since: 'Feb 2025', loadsThisMonth: 6, totalLoads: 18,
    revenue: '$11,400', rpm: '$2.72', rpmNum: 2.72, nextLoad: 'May 12 — Houston → Memphis',
    phone: '(713) 555-0847', email: 'sarah@kimexpress.com',
    lanes: ['Houston → Memphis', 'Dallas → Chicago'],
    lastContact: '1 day ago',
    rpmHistory: [2.55, 2.60, 2.65, 2.68, 2.70, 2.72],
    loadHistory: [2, 3, 3, 4, 4, 6],
    tags: ['High RPM', 'Reefer', 'Food Grade', 'Growing'],
    onTimeRate: 100, avgRate: '$1,900', atRisk: false,
    churnScore: 5,
    revenueHistory: [6200, 8400, 11400, 12100, 13000, 14200],
  },
  {
    id: 'c7', name: 'Pavel Bondarenko', company: 'Bondar Transport',
    truckType: 'Dry Van', truckCount: 2, status: 'New',
    since: 'Apr 2025', loadsThisMonth: 2, totalLoads: 5,
    revenue: '$3,200', rpm: '$2.34', rpmNum: 2.34,
    phone: '(312) 555-0991', email: 'pavel@bondartransport.com',
    lanes: ['Chicago → St. Louis', 'Chicago → Indianapolis'],
    lastContact: '3 days ago',
    rpmHistory: [0, 0, 0, 0, 2.30, 2.34],
    loadHistory: [0, 0, 0, 0, 3, 2],
    tags: ['New', 'Dry Van', 'Midwest'],
    onTimeRate: 100, avgRate: '$1,600', atRisk: false,
    churnScore: 30,
    revenueHistory: [0, 0, 0, 3200, 4800, 6400],
  },
  {
    id: 'c8', name: 'Elena Vasquez', company: 'Vasquez Carriers',
    truckType: 'Flatbed', truckCount: 3, status: 'Active',
    since: 'Sep 2023', loadsThisMonth: 9, totalLoads: 78,
    revenue: '$18,600', rpm: '$2.57', rpmNum: 2.57, nextLoad: 'May 13 — Denver → Salt Lake',
    phone: '(720) 555-0334', email: 'elena@vasquezcarriers.com',
    lanes: ['Denver → Salt Lake', 'Denver → Dallas', 'Salt Lake → LA'],
    lastContact: '4 hours ago',
    rpmHistory: [2.42, 2.45, 2.49, 2.53, 2.55, 2.57],
    loadHistory: [6, 7, 8, 8, 9, 9],
    tags: ['Long-Term', 'Flatbed', 'Mountain West', 'VIP'],
    onTimeRate: 97, avgRate: '$2,060', atRisk: false,
    churnScore: 10,
    revenueHistory: [15800, 16900, 18600, 19200, 20100, 21000],
  },
  {
    id: 'c9', name: 'Omar Hassan', company: 'Hassan Transport Co',
    truckType: 'Dry Van', truckCount: 1, status: 'Active',
    since: 'Jun 2024', loadsThisMonth: 4, totalLoads: 31,
    revenue: '$6,800', rpm: '$2.41', rpmNum: 2.41, nextLoad: 'May 14 — Atlanta → Charlotte',
    phone: '(404) 555-0762', email: 'omar@hassantransport.com',
    lanes: ['Atlanta → Charlotte', 'Atlanta → Nashville'],
    lastContact: '2 days ago',
    rpmHistory: [2.30, 2.33, 2.36, 2.39, 2.40, 2.41],
    loadHistory: [3, 4, 4, 4, 4, 4],
    tags: ['Dry Van', 'Southeast', 'Reliable'],
    onTimeRate: 92, avgRate: '$1,700', atRisk: false,
    churnScore: 22,
    revenueHistory: [5400, 6100, 6800, 7200, 7600, 8100],
  },
  {
    id: 'c10', name: 'Natalie Brooks', company: 'Brooks Reefer LLC',
    truckType: 'Reefer', truckCount: 2, status: 'Active',
    since: 'Dec 2023', loadsThisMonth: 7, totalLoads: 52,
    revenue: '$13,300', rpm: '$2.68', rpmNum: 2.68, nextLoad: 'May 12 — Kansas City → Minneapolis',
    phone: '(816) 555-0445', email: 'natalie@brooksreefer.com',
    lanes: ['Kansas City → Minneapolis', 'Kansas City → Chicago', 'Minneapolis → Detroit'],
    lastContact: 'Yesterday',
    rpmHistory: [2.51, 2.55, 2.59, 2.62, 2.65, 2.68],
    loadHistory: [5, 5, 6, 6, 7, 7],
    tags: ['Reefer', 'Food Grade', 'Long-Term', 'High RPM'],
    onTimeRate: 98, avgRate: '$1,900', atRisk: false,
    churnScore: 7,
    revenueHistory: [10800, 11600, 13300, 14000, 14900, 15800],
  },
]

const LOAD_HISTORY_BY_CLIENT: Record<string, LoadRecord[]> = {
  c1: [
    { id: 'LD-4821', from: 'Chicago, IL', to: 'Dallas, TX',    date: 'May 10', rate: '$2,180', rpm: '$2.45', status: 'In Transit', broker: 'Echo Global' },
    { id: 'LD-4798', from: 'Chicago, IL', to: 'Atlanta, GA',   date: 'May 5',  rate: '$1,920', rpm: '$2.38', status: 'Delivered',  broker: 'TQL' },
    { id: 'LD-4772', from: 'Chicago, IL', to: 'Dallas, TX',    date: 'Apr 28', rate: '$2,240', rpm: '$2.51', status: 'Delivered',  broker: 'Coyote' },
    { id: 'LD-4741', from: 'St. Louis, MO', to: 'Memphis, TN', date: 'Apr 20', rate: '$980',   rpm: '$2.18', status: 'Delivered',  broker: 'Direct' },
    { id: 'LD-4700', from: 'Chicago, IL', to: 'Dallas, TX',    date: 'Apr 12', rate: '$2,100', rpm: '$2.40', status: 'Delivered',  broker: 'Echo Global' },
  ],
  c2: [
    { id: 'LD-4819', from: 'Miami, FL',   to: 'Atlanta, GA', date: 'May 10', rate: '$1,540', rpm: '$2.33', status: 'In Transit', broker: 'Coyote' },
    { id: 'LD-4791', from: 'Miami, FL',   to: 'Tampa, FL',   date: 'May 3',  rate: '$480',   rpm: '$2.10', status: 'Delivered',  broker: 'Direct' },
    { id: 'LD-4765', from: 'Atlanta, GA', to: 'Miami, FL',   date: 'Apr 25', rate: '$1,680', rpm: '$2.54', status: 'Delivered',  broker: 'TQL' },
  ],
  c3: [
    { id: 'LD-4815', from: 'LA, CA',      to: 'Phoenix, AZ',   date: 'May 10', rate: '$890',   rpm: '$2.39', status: 'Delivered',  broker: 'Uber Freight' },
    { id: 'LD-4800', from: 'Phoenix, AZ', to: 'Denver, CO',    date: 'May 6',  rate: '$1,340', rpm: '$2.62', status: 'Delivered',  broker: 'CH Robinson' },
    { id: 'LD-4780', from: 'LA, CA',      to: 'Las Vegas, NV', date: 'Apr 29', rate: '$620',   rpm: '$2.18', status: 'Delivered',  broker: 'Direct' },
    { id: 'LD-4755', from: 'Phoenix, AZ', to: 'San Diego, CA', date: 'Apr 22', rate: '$780',   rpm: '$2.44', status: 'Delivered',  broker: 'Coyote' },
  ],
  c6: [
    { id: 'LD-4820', from: 'Houston, TX', to: 'Memphis, TN',   date: 'May 12', rate: '$1,880', rpm: '$2.72', status: 'In Transit', broker: 'Coyote' },
    { id: 'LD-4805', from: 'Dallas, TX',  to: 'Chicago, IL',   date: 'May 4',  rate: '$2,240', rpm: '$2.68', status: 'Delivered',  broker: 'TQL' },
    { id: 'LD-4782', from: 'Houston, TX', to: 'Atlanta, GA',   date: 'Apr 28', rate: '$1,740', rpm: '$2.65', status: 'Delivered',  broker: 'Echo Global' },
  ],
  c8: [
    { id: 'LD-4817', from: 'Denver, CO',       to: 'Salt Lake City, UT', date: 'May 11', rate: '$1,240', rpm: '$2.57', status: 'In Transit', broker: 'CH Robinson' },
    { id: 'LD-4803', from: 'Salt Lake City, UT', to: 'LA, CA',           date: 'May 5',  rate: '$2,060', rpm: '$2.61', status: 'Delivered',  broker: 'Coyote' },
    { id: 'LD-4788', from: 'Denver, CO',       to: 'Dallas, TX',         date: 'Apr 27', rate: '$1,940', rpm: '$2.55', status: 'Delivered',  broker: 'Echo Global' },
  ],
  c10: [
    { id: 'LD-4822', from: 'Kansas City, MO', to: 'Minneapolis, MN', date: 'May 12', rate: '$1,900', rpm: '$2.68', status: 'In Transit', broker: 'TQL' },
    { id: 'LD-4808', from: 'Minneapolis, MN', to: 'Detroit, MI',     date: 'May 7',  rate: '$1,840', rpm: '$2.65', status: 'Delivered',  broker: 'Coyote' },
    { id: 'LD-4790', from: 'Kansas City, MO', to: 'Chicago, IL',     date: 'Apr 30', rate: '$1,760', rpm: '$2.62', status: 'Delivered',  broker: 'CH Robinson' },
  ],
}

const NOTES_BY_CLIENT: Record<string, ClientNote[]> = {
  c1: [
    { id: 1, text: 'Mike prefers loads posted Tuesday or Wednesday. Avoid Monday starts.', time: 'May 9, 10:14 AM', author: 'You' },
    { id: 2, text: 'Negotiated rate guarantee to $2.45 minimum. Confirmed verbal.', time: 'Apr 22, 3:00 PM', author: 'You' },
    { id: 3, text: 'Client requested longer lanes (700+ miles) for Q2.', time: 'Mar 15, 11:30 AM', author: 'You' },
  ],
  c3: [
    { id: 1, text: 'James operates 2 flatbeds — one dedicated to LA→PHX corridor.', time: 'Apr 10, 9:00 AM', author: 'You' },
    { id: 2, text: 'Prefers TQL for broker — has established relationship.', time: 'Mar 28, 2:30 PM', author: 'You' },
  ],
  c5: [
    { id: 1, text: 'Last contact 2 weeks ago. Went quiet after May 1st.', time: 'May 8, 4:00 PM', author: 'You' },
    { id: 2, text: 'Consider calling — might have found another dispatcher.', time: 'May 1, 9:00 AM', author: 'You' },
  ],
}

const FOLLOW_UPS_BY_CLIENT: Record<string, FollowUp[]> = {
  c5: [
    { id: 1, date: '2026-05-10', note: 'Call Tony to check availability — at risk of churning', done: false },
    { id: 2, date: '2026-05-05', note: 'Send rate sheet for June lanes', done: false },
  ],
  c1: [
    { id: 3, date: '2026-05-20', note: 'Discuss Q2 lane expansion to Denver corridor', done: false },
  ],
  c4: [
    { id: 4, date: '2026-05-14', note: 'Onboarding call — confirm insurance docs received', done: false },
  ],
}

// ── All unique tags for filter bar ────────────────────────────────────────────
const ALL_TAGS = ['VIP', 'At Risk', 'New', 'Long-Term', 'Reefer', 'Flatbed', 'Dry Van', 'High RPM', 'Growing', 'Fast Pay', 'Food Grade']

// ── Suggested meeting time slots ──────────────────────────────────────────────
const MEETING_SLOTS = [
  { day: 'Mon, May 13', time: '10:00 AM CDT', duration: '30 min' },
  { day: 'Tue, May 14', time: '2:00 PM CDT',  duration: '30 min' },
  { day: 'Wed, May 15', time: '11:30 AM CDT', duration: '45 min' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ClientStatus }) {
  const map: Record<ClientStatus, string> = {
    Active: 'badge-success', Pending: 'badge-warning', Inactive: 'badge-danger', New: 'badge-primary',
  }
  return <span className={`badge ${map[status]}`}>● {status}</span>
}

function churnColor(score: number): string {
  if (score <= 20) return '#48BB78'
  if (score <= 50) return '#F59E0B'
  return '#EF4444'
}

function churnLabel(score: number): string {
  if (score <= 20) return 'Low'
  if (score <= 50) return 'Medium'
  return 'High'
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date('2026-05-12')
}

// ── RPM Sparkline ─────────────────────────────────────────────────────────────
function RpmSparkline({ data, color = '#4BAED4' }: { data: number[]; color?: string }) {
  const nonZero = data.filter(v => v > 0)
  if (nonZero.length < 2) return <span style={{ fontSize: 10, color: '#A0AEC0' }}>—</span>
  const min = Math.min(...nonZero) - 0.05
  const max = Math.max(...nonZero) + 0.05
  const W = 70, H = 24
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = v === 0 ? H : H - ((v - min) / (max - min)) * H
    return `${x},${y}`
  }).join(' ')
  const isUp = nonZero[nonZero.length - 1] >= nonZero[0]
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline fill="none" stroke={isUp ? '#48BB78' : '#FC8181'} strokeWidth="1.5" points={pts} />
    </svg>
  )
}

// ── Load Volume Bars ──────────────────────────────────────────────────────────
function LoadVolBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            width: '100%', borderRadius: '3px 3px 0 0',
            height: Math.max(2, (v / max) * 36),
            background: i === data.length - 1 ? '#4BAED4' : '#CBD5E0',
          }} />
          <div style={{ fontSize: 8, color: '#A0AEC0' }}>{months[i]}</div>
        </div>
      ))}
    </div>
  )
}

// ── Revenue Forecast Chart (SVG area) ─────────────────────────────────────────
function RevenueForecastChart({ data }: { data: number[] }) {
  const W = 360, H = 90
  const labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr (proj)', 'May (proj)', 'Jun (proj)']
  // data[0..2] actual, data[3..5] projected (revenueHistory has 6 items: 3 actual + 3 projected)
  const all = data
  const maxV = Math.max(...all.filter(v => v > 0), 1)
  const minV = 0

  function xAt(i: number) { return (i / (all.length - 1)) * (W - 20) + 10 }
  function yAt(v: number) { return H - 10 - ((v - minV) / (maxV - minV)) * (H - 20) }

  // Build area path for actual (indices 0..2)
  const actualCount = 3
  const actualPts = all.slice(0, actualCount).map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')
  const actualArea = `M ${xAt(0)},${yAt(all[0])} ${all.slice(1, actualCount).map((v, i) => `L ${xAt(i + 1)},${yAt(v)}`).join(' ')} L ${xAt(actualCount - 1)},${H - 10} L ${xAt(0)},${H - 10} Z`

  // Build projected path (indices 2..5, connecting from last actual)
  const projPts = all.slice(actualCount - 1).map((v, i) => `${xAt(i + actualCount - 1)},${yAt(v)}`).join(' ')
  const projArea = `M ${xAt(actualCount - 1)},${yAt(all[actualCount - 1])} ${all.slice(actualCount).map((v, i) => `L ${xAt(i + actualCount)},${yAt(v)}`).join(' ')} L ${xAt(all.length - 1)},${H - 10} L ${xAt(actualCount - 1)},${H - 10} Z`

  return (
    <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>
        REVENUE FORECAST — NEXT 3 MONTHS
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => {
          const y = H - 10 - pct * (H - 20)
          const val = Math.round(maxV * pct)
          return (
            <g key={pct}>
              <line x1={10} y1={y} x2={W - 10} y2={y} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3,3" />
              <text x={8} y={y + 3} fontSize={7} fill="#A0AEC0" textAnchor="end">${(val / 1000).toFixed(0)}k</text>
            </g>
          )
        })}
        {/* Projected area */}
        <path d={projArea} fill="rgba(75,174,212,0.10)" />
        {/* Actual area */}
        <path d={actualArea} fill="rgba(75,174,212,0.22)" />
        {/* Actual line */}
        <polyline fill="none" stroke="#4BAED4" strokeWidth="2" points={actualPts} />
        {/* Projected line */}
        <polyline fill="none" stroke="#4BAED4" strokeWidth="2" strokeDasharray="5,3" points={projPts} />
        {/* Dots */}
        {all.map((v, i) => (
          v > 0 ? (
            <circle key={i} cx={xAt(i)} cy={yAt(v)} r={3}
              fill={i < actualCount ? '#4BAED4' : '#fff'}
              stroke="#4BAED4" strokeWidth={1.5}
            />
          ) : null
        ))}
        {/* X labels */}
        {all.map((_, i) => (
          <text key={i} x={xAt(i)} y={H + 2} fontSize={7} fill="#A0AEC0" textAnchor="middle">
            {labels[i] ?? ''}
          </text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 14, height: 3, background: '#4BAED4', borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: '#718096' }}>Actual</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 14, height: 3, background: '#4BAED4', borderRadius: 2, opacity: 0.5 }} />
          <span style={{ fontSize: 10, color: '#718096' }}>Projected</span>
        </div>
      </div>
    </div>
  )
}

// ── Add Client Modal ──────────────────────────────────────────────────────────
function AddClientModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', truckType: 'Dry Van', lane: '' })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ width: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>+ Add New Client</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>X</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Driver Name *', key: 'name', placeholder: 'First Last' },
              { label: 'Company', key: 'company', placeholder: 'Company LLC' },
              { label: 'Phone', key: 'phone', placeholder: '(555) 000-0000' },
              { label: 'Email', key: 'email', placeholder: 'driver@email.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input className="input" placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Truck Type</label>
              <select className="input" value={form.truckType} onChange={e => setForm(f => ({ ...f, truckType: e.target.value }))}>
                {['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Power Only'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Primary Lane</label>
              <input className="input" placeholder="Chicago → Dallas" value={form.lane}
                onChange={e => setForm(f => ({ ...f, lane: e.target.value }))} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!form.name.trim()} onClick={onClose}>Add Client</button>
        </div>
      </div>
    </div>
  )
}

// ── Performance Tab ───────────────────────────────────────────────────────────
function PerformanceTab({ client }: { client: Client }) {
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  const marketAvg = [2.28, 2.30, 2.31, 2.33, 2.34, 2.36]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Avg RPM',    value: client.rpm,               color: '#4BAED4' },
          { label: 'On-Time',    value: `${client.onTimeRate}%`,  color: client.onTimeRate >= 95 ? '#48BB78' : '#F59E0B' },
          { label: 'Avg Rate',   value: client.avgRate,           color: '#8B5CF6' },
        ].map(k => (
          <div key={k.label} style={{ padding: '10px 12px', background: '#F7FAFC', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#718096' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* RPM trend vs market */}
      <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>RPM TREND vs MARKET</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {client.rpmHistory.map((v, i) => {
            const mv = marketAvg[i]
            const maxV = Math.max(...client.rpmHistory.filter(x => x > 0), ...marketAvg) + 0.2
            const clientH = v > 0 ? Math.round((v / maxV) * 64) : 2
            const marketH = Math.round((mv / maxV) * 64)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%' }}>
                  <div style={{ flex: 1, borderRadius: '3px 3px 0 0', height: clientH, background: v > mv ? '#48BB78' : '#4BAED4' }} />
                  <div style={{ flex: 1, borderRadius: '3px 3px 0 0', height: marketH, background: '#CBD5E0' }} />
                </div>
                <div style={{ fontSize: 8, color: '#A0AEC0' }}>{months[i]}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#48BB78' }} />
            <span style={{ fontSize: 10, color: '#718096' }}>Client RPM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#CBD5E0' }} />
            <span style={{ fontSize: 10, color: '#718096' }}>Market avg</span>
          </div>
        </div>
      </div>

      {/* Load volume */}
      <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>LOAD VOLUME (6 MONTHS)</div>
        <LoadVolBars data={client.loadHistory} />
      </div>

      {/* Goals */}
      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 14, border: '1px solid #BBF7D0' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 8 }}>MAY GOALS</div>
        {[
          { label: 'RPM Target',    current: client.rpmNum, target: 2.55, unit: '/mi' },
          { label: 'Loads/Month',   current: client.loadsThisMonth, target: 10, unit: ' loads' },
        ].map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          return (
            <div key={g.label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#2D3748' }}>{g.label}</span>
                <span style={{ color: pct >= 100 ? '#48BB78' : '#718096' }}>
                  {g.current}{g.unit} / {g.target}{g.unit}
                </span>
              </div>
              <div className="progress-wrap" style={{ height: 7 }}>
                <div className="progress-bar" style={{
                  width: `${pct}%`, background: pct >= 100 ? '#48BB78' : pct >= 70 ? '#4BAED4' : '#F59E0B',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Notes Tab (with Follow-up Reminders) ──────────────────────────────────────
function NotesTab({ clientId }: { clientId: string }) {
  const initial = NOTES_BY_CLIENT[clientId] ?? []
  const [notes, setNotes] = useState<ClientNote[]>(initial)
  const [newNote, setNewNote] = useState('')

  const initialFollowUps = FOLLOW_UPS_BY_CLIENT[clientId] ?? []
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps)
  const [showFollowUpForm, setShowFollowUpForm] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpNote, setFollowUpNote] = useState('')

  function addNote() {
    if (!newNote.trim()) return
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setNotes(prev => [{ id: Date.now(), text: newNote.trim(), time: now, author: 'You' }, ...prev])
    setNewNote('')
  }

  function addFollowUp() {
    if (!followUpDate || !followUpNote.trim()) return
    setFollowUps(prev => [...prev, { id: Date.now(), date: followUpDate, note: followUpNote.trim(), done: false }])
    setFollowUpDate('')
    setFollowUpNote('')
    setShowFollowUpForm(false)
  }

  function toggleFollowUp(id: number) {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, done: !f.done } : f))
  }

  const overdueFollowUps = followUps.filter(f => !f.done && isOverdue(f.date))
  const upcomingFollowUps = followUps.filter(f => !f.done && !isOverdue(f.date))
  const doneFollowUps = followUps.filter(f => f.done)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Follow-up Reminders Section ─────────────────────────────────── */}
      <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#718096' }}>FOLLOW-UP REMINDERS</div>
          <button
            onClick={() => setShowFollowUpForm(v => !v)}
            style={{
              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              background: '#4BAED4', color: '#fff', border: 'none',
            }}
          >
            {showFollowUpForm ? 'Cancel' : '+ Schedule Follow-up'}
          </button>
        </div>

        {/* Schedule follow-up form */}
        {showFollowUpForm && (
          <div style={{ background: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, border: '1px solid #BEE3F8' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  className="input"
                  style={{ fontSize: 12 }}
                  value={followUpDate}
                  onChange={e => setFollowUpDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Note</label>
                <input
                  className="input"
                  style={{ fontSize: 12 }}
                  placeholder="What do you need to follow up on?"
                  value={followUpNote}
                  onChange={e => setFollowUpNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFollowUp()}
                />
              </div>
            </div>
            <button
              onClick={addFollowUp}
              disabled={!followUpDate || !followUpNote.trim()}
              className="btn btn-primary btn-sm"
            >
              Save Reminder
            </button>
          </div>
        )}

        {/* Overdue reminders */}
        {overdueFollowUps.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', marginBottom: 5, textTransform: 'uppercase' }}>
              Overdue ({overdueFollowUps.length})
            </div>
            {overdueFollowUps.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '8px 10px', background: '#FEF2F2', borderRadius: 8, marginBottom: 4,
                border: '1px solid #FECACA',
              }}>
                <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} style={{ marginTop: 2, cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#2D3748', fontWeight: 600 }}>{f.note}</div>
                  <div style={{ fontSize: 10, color: '#EF4444', marginTop: 2, fontWeight: 700 }}>
                    Overdue: {new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming reminders */}
        {upcomingFollowUps.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#718096', marginBottom: 5, textTransform: 'uppercase' }}>
              Upcoming ({upcomingFollowUps.length})
            </div>
            {upcomingFollowUps.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '8px 10px', background: '#EBF8FF', borderRadius: 8, marginBottom: 4,
                border: '1px solid #BEE3F8',
              }}>
                <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} style={{ marginTop: 2, cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#2D3748', fontWeight: 600 }}>{f.note}</div>
                  <div style={{ fontSize: 10, color: '#4BAED4', marginTop: 2 }}>
                    Due: {new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Done reminders */}
        {doneFollowUps.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#A0AEC0', marginBottom: 5, textTransform: 'uppercase' }}>
              Completed ({doneFollowUps.length})
            </div>
            {doneFollowUps.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '8px 10px', background: '#F7FAFC', borderRadius: 8, marginBottom: 4, opacity: 0.6,
              }}>
                <input type="checkbox" checked={f.done} onChange={() => toggleFollowUp(f.id)} style={{ marginTop: 2, cursor: 'pointer' }} />
                <div style={{ fontSize: 12, color: '#A0AEC0', textDecoration: 'line-through' }}>{f.note}</div>
              </div>
            ))}
          </div>
        )}

        {followUps.length === 0 && !showFollowUpForm && (
          <div style={{ textAlign: 'center', padding: '12px', color: '#A0AEC0', fontSize: 12 }}>
            No follow-up reminders — schedule one above
          </div>
        )}
      </div>

      {/* ── Notes Section ───────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 8 }}>CLIENT NOTES</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="input" style={{ flex: 1 }}
            placeholder="Add a note about this client..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
          />
          <button className="btn btn-primary btn-sm" onClick={addNote} disabled={!newNote.trim()}>+</button>
        </div>

        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#A0AEC0' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📝</div>
            <div>No notes yet — add the first one</div>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} style={{
              padding: '12px 14px', background: '#FFFBEB', borderRadius: 10,
              border: '1px solid #FDE68A', marginBottom: 8,
            }}>
              <div style={{ fontSize: 13, color: '#2D3748', lineHeight: 1.5 }}>{note.text}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 10, color: '#A0AEC0' }}>{note.author}</span>
                <span style={{ fontSize: 10, color: '#A0AEC0' }}>{note.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Meeting Scheduler Widget ──────────────────────────────────────────────────
function MeetingScheduler({ clientName }: { clientName: string }) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [booked, setBooked] = useState(false)

  function confirmBooking() {
    if (selectedSlot === null) return
    setBooked(true)
  }

  if (booked && selectedSlot !== null) {
    const slot = MEETING_SLOTS[selectedSlot]
    return (
      <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 14, border: '1px solid #BBF7D0', marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>MEETING SCHEDULED</div>
        <div style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>
          {slot.day} at {slot.time} ({slot.duration}) with {clientName}
        </div>
        <div style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>
          Calendar invite sent. Reminder set for 1 hour before.
        </div>
        <button
          onClick={() => { setBooked(false); setSelectedSlot(null) }}
          style={{ marginTop: 8, fontSize: 11, color: '#A0AEC0', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Cancel meeting
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14, marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>MEETING SCHEDULER</div>
      <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 10 }}>
        Suggested time slots for a call with {clientName}:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MEETING_SLOTS.map((slot, i) => (
          <div
            key={i}
            onClick={() => setSelectedSlot(i)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${selectedSlot === i ? '#4BAED4' : '#E2E8F0'}`,
              background: selectedSlot === i ? '#EBF8FF' : '#fff',
              transition: 'all .15s',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{slot.day}</div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{slot.time} · {slot.duration}</div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `2px solid ${selectedSlot === i ? '#4BAED4' : '#CBD5E0'}`,
              background: selectedSlot === i ? '#4BAED4' : 'transparent',
              flexShrink: 0,
            }} />
          </div>
        ))}
      </div>
      <button
        onClick={confirmBooking}
        disabled={selectedSlot === null}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 12 }}
      >
        Book Call
      </button>
    </div>
  )
}

// ── Bulk Actions Bar ──────────────────────────────────────────────────────────
function BulkActionsBar({ count, onClear }: { count: number; onClear: () => void }) {
  const [exported, setExported] = useState(false)
  const [messaged, setMessaged] = useState(false)
  const [tagged, setTagged] = useState(false)

  return (
    <div style={{
      background: '#1A2535', borderRadius: 12, padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
        {count} selected
      </span>
      <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        <button
          onClick={() => setMessaged(true)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: messaged ? '#48BB78' : '#4BAED4', color: '#fff', border: 'none',
          }}
        >
          {messaged ? 'Sent!' : 'Message All'}
        </button>
        <button
          onClick={() => setExported(true)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: exported ? '#48BB78' : '#2D7A9A', color: '#fff', border: 'none',
          }}
        >
          {exported ? 'Exported!' : 'Export Selected'}
        </button>
        <button
          onClick={() => setTagged(true)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: tagged ? '#48BB78' : '#8B5CF6', color: '#fff', border: 'none',
          }}
        >
          {tagged ? 'Tagged!' : 'Tag All'}
        </button>
      </div>
      <button
        onClick={onClear}
        style={{
          padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
        }}
      >
        Clear
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [selectedId, setSelectedId]       = useState<string | null>(null)
  const [filterStatus, setFilterStatus]   = useState<ClientStatus | 'All'>('All')
  const [filterTag, setFilterTag]         = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [showAddModal, setShowAddModal]   = useState(false)
  const [activeTab, setActiveTab]         = useState<DetailTab>('overview')
  const [sortBy, setSortBy]               = useState<'revenue' | 'rpm' | 'loads'>('revenue')
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [bookingClient, setBookingClient] = useState<BookableClient | null>(null)

  const selectedClient = CLIENTS.find(c => c.id === selectedId)

  const filtered = CLIENTS
    .filter(c => {
      const matchStatus = filterStatus === 'All' || c.status === filterStatus
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase())
      const matchTag = filterTag === null || c.tags.includes(filterTag)
      return matchStatus && matchSearch && matchTag
    })
    .sort((a, b) => {
      if (sortBy === 'rpm') return b.rpmNum - a.rpmNum
      if (sortBy === 'loads') return b.loadsThisMonth - a.loadsThisMonth
      return parseFloat(b.revenue.replace(/[$,]/g, '') || '0') - parseFloat(a.revenue.replace(/[$,]/g, '') || '0')
    })

  const activeCount     = CLIENTS.filter(c => c.status === 'Active').length
  const monthRevenue    = CLIENTS.reduce((s, c) => s + parseFloat(c.revenue.replace(/[$,]/g, '') || '0'), 0)
  const avgRpm          = (() => {
    const rpmClients = CLIENTS.filter(c => c.rpmNum > 0)
    return rpmClients.length ? rpmClients.reduce((s, c) => s + c.rpmNum, 0) / rpmClients.length : 0
  })()
  const totalLoadsMonth = CLIENTS.reduce((s, c) => s + c.loadsThisMonth, 0)
  const atRiskCount     = CLIENTS.filter(c => c.atRisk).length

  // Total follow-ups overdue across all clients
  const totalOverdueFollowUps = Object.values(FOLLOW_UPS_BY_CLIENT)
    .flat()
    .filter(f => !f.done && isOverdue(f.date)).length

  function toggleClientSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedClients(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function clearSelection() {
    setSelectedClients(new Set())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="stats-grid">
        {[
          { label: 'Active Clients',   value: String(activeCount),              change: `${CLIENTS.length} total`,   up: true,  color: '#4BAED4', icon: '🚛' },
          { label: 'Month Revenue',    value: `$${(monthRevenue/1000).toFixed(1)}k`, change: '+8% vs last mo',      up: true,  color: '#38C770', icon: '💰' },
          { label: 'Avg RPM',          value: `$${avgRpm.toFixed(2)}`,          change: 'Market avg $2.33',         up: true,  color: '#8B5CF6', icon: '📈' },
          { label: 'Loads This Month', value: String(totalLoadsMonth),          change: `${atRiskCount} at risk`,   up: atRiskCount === 0, color: '#D97706', icon: '📦' },
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

      {/* ── At-risk alert ─────────────────────────────────────────────────── */}
      {atRiskCount > 0 && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 700 }}>
            {atRiskCount} client{atRiskCount > 1 ? 's' : ''} at risk of churning — last contact &gt;2 weeks ago.
            {totalOverdueFollowUps > 0 && ` · ${totalOverdueFollowUps} overdue follow-up${totalOverdueFollowUps > 1 ? 's' : ''}.`}
          </span>
          <button
            onClick={() => { setFilterStatus('Inactive'); setSelectedId(null) }}
            style={{ marginLeft: 'auto', padding: '6px 14px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
          >
            Review
          </button>
        </div>
      )}

      {/* ── Bulk Actions Bar ──────────────────────────────────────────────── */}
      {selectedClients.size > 0 && (
        <BulkActionsBar count={selectedClients.size} onClear={clearSelection} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedClient ? '340px 1fr' : '1fr', gap: 20 }}>

        {/* ── Client List ───────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0F4F8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 className="section-title" style={{ margin: 0 }}>My Clients ({filtered.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add</button>
            </div>
            <input className="input" placeholder="🔍 Search clients..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8 }} />

            {/* Status filters */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
              {(['All', 'Active', 'New', 'Pending', 'Inactive'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: `1.5px solid ${filterStatus === s ? '#4BAED4' : '#E2E8F0'}`,
                  background: filterStatus === s ? '#EBF8FF' : 'transparent',
                  color: filterStatus === s ? '#4BAED4' : '#718096',
                }}>{s}</button>
              ))}
            </div>

            {/* Tag filter bar */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
              {filterTag !== null && (
                <button onClick={() => setFilterTag(null)} style={{
                  padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  border: '1.5px solid #EF4444', background: '#FEF2F2', color: '#EF4444',
                }}>✕ {filterTag}</button>
              )}
              {filterTag === null && ALL_TAGS.map(tag => (
                <button key={tag} onClick={() => setFilterTag(tag)} style={{
                  padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  border: '1.5px solid #E2E8F0', background: 'transparent', color: '#A0AEC0',
                }}>{tag}</button>
              ))}
            </div>

            <select className="input" style={{ width: '100%', fontSize: 12 }} value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}>
              <option value="revenue">Sort: Revenue ↓</option>
              <option value="rpm">Sort: RPM ↓</option>
              <option value="loads">Sort: Loads ↓</option>
            </select>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 620 }}>
            {filtered.map(client => (
              <div key={client.id} onClick={() => { setSelectedId(client.id); setActiveTab('overview') }} style={{
                padding: '12px 16px', cursor: 'pointer',
                background: selectedId === client.id ? '#EBF8FF' : client.atRisk ? '#FFF5F5' : 'transparent',
                borderLeft: `3px solid ${selectedId === client.id ? '#4BAED4' : client.atRisk ? '#EF4444' : 'transparent'}`,
                borderBottom: '1px solid #F0F4F8', transition: 'all .15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Checkbox */}
                  <div onClick={e => toggleClientSelect(client.id, e)} style={{ paddingTop: 2, flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      readOnly
                      checked={selectedClients.has(client.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="avatar" style={{ flexShrink: 0, width: 36, height: 36 }}>{client.name.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{client.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <StatusBadge status={client.status} />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>
                      {client.company} · {client.truckType}{client.truckCount > 1 ? ` x${client.truckCount}` : ''}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                        <span style={{ color: '#38C770', fontWeight: 700 }}>{client.revenue}</span>
                        <span style={{ color: '#A0AEC0' }}>{client.loadsThisMonth} loads</span>
                        <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{client.rpm}</span>
                      </div>
                      <RpmSparkline data={client.rpmHistory} />
                    </div>
                    {/* Tags row */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                      {client.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          padding: '2px 6px', borderRadius: 8,
                          background: tag === 'At Risk' ? '#FED7D7' : tag === 'VIP' ? '#FEFCBF' : tag === 'Long-Term' ? '#C6F6D5' : '#EBF8FF',
                          color: tag === 'At Risk' ? '#C53030' : tag === 'VIP' ? '#744210' : tag === 'Long-Term' ? '#276749' : '#2B6CB0',
                          fontSize: 9, fontWeight: 700,
                        }}>{tag}</span>
                      ))}
                      {/* Churn score indicator */}
                      <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: churnColor(client.churnScore) }}>
                        Risk: {client.churnScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Client Detail ─────────────────────────────────────────────── */}
        {selectedClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Header card */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)', color: '#fff', padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 800,
                  }}>{selectedClient.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 900, marginBottom: 2 }}>{selectedClient.name}</div>
                    <div style={{ opacity: .8, fontSize: 13 }}>
                      {selectedClient.company} · {selectedClient.truckType} · {selectedClient.truckCount} truck{selectedClient.truckCount > 1 ? 's' : ''}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge status={selectedClient.status} />
                      {/* Churn risk indicator in header */}
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        background: `${churnColor(selectedClient.churnScore)}30`,
                        color: churnColor(selectedClient.churnScore),
                        padding: '2px 8px', borderRadius: 6,
                        border: `1px solid ${churnColor(selectedClient.churnScore)}50`,
                      }}>
                        Churn Risk: {selectedClient.churnScore}/100 — {churnLabel(selectedClient.churnScore)}
                      </span>
                      {selectedClient.atRisk && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#EF444440', color: '#FCA5A5', padding: '2px 6px', borderRadius: 6 }}>⚠️ At Risk</span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}
                  onClick={() => setSelectedId(null)}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 16 }}>
                {[
                  { label: 'Since',       value: selectedClient.since },
                  { label: 'Total Loads', value: String(selectedClient.totalLoads) },
                  { label: 'Avg RPM',     value: selectedClient.rpm },
                  { label: 'Month Rev',   value: selectedClient.revenue },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 900 }}>{s.value}</div>
                    <div style={{ fontSize: 10, opacity: .7, marginTop: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {([
                ['overview',    '📊 Overview'],
                ['loads',       '📦 Loads'],
                ['performance', '📈 Performance'],
                ['notes',       '📝 Notes'],
                ['contact',     '📞 Contact'],
              ] as [DetailTab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '7px 14px', borderRadius: 10, fontWeight: 700, fontSize: 12,
                  border: 'none', cursor: 'pointer',
                  background: activeTab === t ? '#4BAED4' : '#F0F4F8',
                  color: activeTab === t ? '#fff' : '#718096',
                }}>{label}</button>
              ))}
            </div>

            {/* Tab content */}
            <div className="card">

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[
                      { label: 'Loads this month', value: String(selectedClient.loadsThisMonth) },
                      { label: 'Total loads',       value: String(selectedClient.totalLoads) },
                      { label: 'Last contact',      value: selectedClient.lastContact },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', padding: '10px 12px', background: '#F7FAFC', borderRadius: 10 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#1A2535' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {selectedClient.nextLoad && (
                    <div style={{ padding: '12px 14px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', marginBottom: 3 }}>NEXT LOAD</div>
                      <div style={{ fontWeight: 700, color: '#15803D' }}>🚛 {selectedClient.nextLoad}</div>
                    </div>
                  )}

                  {/* Revenue Forecast Chart */}
                  <RevenueForecastChart data={selectedClient.revenueHistory} />

                  {/* Churn Risk gauge */}
                  <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 8 }}>CHURN PREDICTION</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: '#2D3748' }}>Risk Score</span>
                          <span style={{ fontWeight: 700, color: churnColor(selectedClient.churnScore) }}>
                            {selectedClient.churnScore}/100 — {churnLabel(selectedClient.churnScore)}
                          </span>
                        </div>
                        <div style={{ height: 10, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${selectedClient.churnScore}%`,
                            background: churnColor(selectedClient.churnScore),
                            borderRadius: 99,
                            transition: 'width .4s',
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#A0AEC0', marginTop: 3 }}>
                          <span>Low Risk</span>
                          <span>High Risk</span>
                        </div>
                      </div>
                    </div>
                    {selectedClient.churnScore > 60 && (
                      <div style={{ marginTop: 8, fontSize: 11, color: '#EF4444', background: '#FEF2F2', padding: '6px 10px', borderRadius: 8 }}>
                        Action recommended: schedule a call or send a rate offer this week.
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748', marginBottom: 8 }}>Primary Lanes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedClient.lanes.map(lane => (
                        <span key={lane} style={{ padding: '5px 10px', background: '#EBF8FF', borderRadius: 99, fontSize: 11, fontWeight: 600, color: '#2D7A9A' }}>
                          📍 {lane}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => setBookingClient({
                        id: selectedClient.id,
                        name: selectedClient.name,
                        equipment: selectedClient.truckType,
                        rpmGuarantee: selectedClient.rpmNum,
                        commissionPct: 8,
                        preferredLanes: selectedClient.lanes.join(', '),
                      })}
                    >📦 Find Load</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>💬 Message</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>📊 Report</button>
                  </div>
                </div>
              )}

              {/* LOADS */}
              {activeTab === 'loads' && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 12 }}>
                    Load History ({(LOAD_HISTORY_BY_CLIENT[selectedClient.id] ?? []).length} loads)
                  </div>
                  {(LOAD_HISTORY_BY_CLIENT[selectedClient.id] ?? []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 28, color: '#A0AEC0' }}>
                      <div style={{ fontSize: 32 }}>📭</div>
                      <div style={{ marginTop: 6 }}>No loads yet</div>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr><th>Load ID</th><th>Route</th><th>Date</th><th>Rate</th><th>RPM</th><th>Broker</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {(LOAD_HISTORY_BY_CLIENT[selectedClient.id] ?? []).map(load => (
                          <tr key={load.id}>
                            <td style={{ fontWeight: 700, color: '#4BAED4' }}>{load.id}</td>
                            <td style={{ fontSize: 12 }}>{load.from.split(',')[0]} → {load.to.split(',')[0]}</td>
                            <td style={{ fontSize: 12, color: '#718096' }}>{load.date}</td>
                            <td style={{ fontWeight: 700, color: '#38C770' }}>{load.rate}</td>
                            <td style={{ color: '#8B5CF6', fontWeight: 600 }}>{load.rpm}</td>
                            <td style={{ fontSize: 12, color: '#718096' }}>{load.broker}</td>
                            <td>
                              <span className={`badge ${load.status === 'Delivered' ? 'badge-success' : load.status === 'In Transit' ? 'badge-primary' : 'badge-danger'}`}>
                                ● {load.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* PERFORMANCE */}
              {activeTab === 'performance' && <PerformanceTab client={selectedClient} />}

              {/* NOTES */}
              {activeTab === 'notes' && <NotesTab clientId={selectedClient.id} />}

              {/* CONTACT */}
              {activeTab === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>Contact Information</div>
                  {[
                    { icon: '📞', label: 'Phone',       value: selectedClient.phone },
                    { icon: '📧', label: 'Email',       value: selectedClient.email },
                    { icon: '🏢', label: 'Company',     value: selectedClient.company },
                    { icon: '🚛', label: 'Equipment',   value: `${selectedClient.truckType} · ${selectedClient.truckCount} truck${selectedClient.truckCount > 1 ? 's' : ''}` },
                    { icon: '📅', label: 'Client Since', value: selectedClient.since },
                    { icon: '🕐', label: 'Last Contact', value: selectedClient.lastContact },
                  ].map(row => (
                    <div key={row.label} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', background: '#F7FAFC', borderRadius: 10,
                    }}>
                      <span style={{ fontSize: 18 }}>{row.icon}</span>
                      <div>
                        <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 600 }}>{row.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748', marginTop: 1 }}>{row.value}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}>📞 Call</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>📧 Email</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>💬 Chat</button>
                  </div>

                  {/* Meeting Scheduler widget */}
                  <MeetingScheduler clientName={selectedClient.name} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}
      {bookingClient && (
        <BookLoadModal
          client={bookingClient}
          onClose={() => setBookingClient(null)}
          onBooked={(loadId, clientId) => {
            console.log(`Booked load ${loadId} for client ${clientId}`)
            setBookingClient(null)
          }}
        />
      )}
    </div>
  )
}
