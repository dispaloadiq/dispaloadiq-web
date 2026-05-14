import { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'performance' | 'history' | 'benchmarks'

interface MonthlyRPM {
  month: string
  actual: number
  promised: number
}

interface KPICard {
  label: string
  value: string
  target: string
  passing: boolean
  icon: string
}

interface ActivityItem {
  id: string
  timestamp: string
  type: 'booked' | 'status' | 'negotiated' | 'document' | 'issue'
  text: string
  loadRef: string
}

interface LoadRecord {
  id: string
  origin: string
  destination: string
  broker: string
  gross: number
  miles: number
  rpm: number
  dispFee: number
  netToOO: number
  status: 'Delivered' | 'In Transit' | 'Upcoming' | 'Cancelled'
  date: string
}

interface BenchmarkAxis {
  label: string
  yours: number      // 0–100 normalized
  avg: number
  top10: number
  specialist: number
  yourRaw: string
  avgRaw: string
  top10Raw: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DISPATCHER = {
  name: 'Marcus Rivera',
  initials: 'MR',
  trustScore: 92,
  activeSince: 'Jan 2025',
  badge: 'Certified Dispatcher',
  country: '🇺🇸',
  avgRPM: 2.83,
  promisedRPM: 2.80,
  onTimePickup: 96.4,
  responseTimeMin: 18,
  commissionYTD: 4_820,
  overallStatus: 'on-track' as 'on-track' | 'below-target',
}

const MONTHLY_RPM: MonthlyRPM[] = [
  { month: 'Jan', actual: 2.91, promised: 2.80 },
  { month: 'Feb', actual: 2.88, promised: 2.80 },
  { month: 'Mar', actual: 2.74, promised: 2.80 },
  { month: 'Apr', actual: 2.79, promised: 2.80 },
  { month: 'May', actual: 2.83, promised: 2.80 },
]

const KPIS: KPICard[] = [
  { label: 'Loads Booked / week', value: '4.2 avg', target: 'Target: 4.0', passing: true, icon: '📦' },
  { label: 'Downtime Days / mo', value: '1.8 days', target: 'Target: <3 days', passing: true, icon: '⏱️' },
  { label: 'Response Time', value: '18 min avg', target: 'Target: <30 min', passing: true, icon: '💬' },
  { label: 'Status Updates', value: '97% on-time', target: 'Target: >90%', passing: true, icon: '📍' },
  { label: 'Broker Issues / mo', value: '0.3 avg', target: 'Target: <1', passing: true, icon: '⚠️' },
  { label: 'Commission Efficiency', value: '91.5% to you', target: 'Target: >90%', passing: true, icon: '💰' },
]

const ACTIVITY: ActivityItem[] = [
  { id: '1', timestamp: 'May 13 · 9:41 AM', type: 'booked', text: 'Booked load DL-2025-0847 @ $2.92/mile', loadRef: 'DL-2025-0847' },
  { id: '2', timestamp: 'May 13 · 8:15 AM', type: 'status', text: 'Updated status: DL-2025-0821 — At Delivery', loadRef: 'DL-2025-0821' },
  { id: '3', timestamp: 'May 12 · 4:03 PM', type: 'negotiated', text: 'Negotiated rate up $150 with Echo Global Logistics', loadRef: 'DL-2025-0839' },
  { id: '4', timestamp: 'May 12 · 2:30 PM', type: 'booked', text: 'Booked load DL-2025-0839 @ $3.05/mile (Chicago→Dallas)', loadRef: 'DL-2025-0839' },
  { id: '5', timestamp: 'May 12 · 11:00 AM', type: 'document', text: 'BOL uploaded for DL-2025-0821', loadRef: 'DL-2025-0821' },
  { id: '6', timestamp: 'May 11 · 5:20 PM', type: 'status', text: 'Updated status: DL-2025-0833 — Delivered', loadRef: 'DL-2025-0833' },
  { id: '7', timestamp: 'May 11 · 2:45 PM', type: 'negotiated', text: 'Rate confirmed with Coyote Logistics @ $2.78/mile', loadRef: 'DL-2025-0833' },
  { id: '8', timestamp: 'May 10 · 9:00 AM', type: 'booked', text: 'Booked load DL-2025-0829 @ $2.95/mile (Atlanta→Memphis)', loadRef: 'DL-2025-0829' },
  { id: '9', timestamp: 'May 9 · 3:15 PM', type: 'status', text: 'Updated status: DL-2025-0812 — Picked Up', loadRef: 'DL-2025-0812' },
  { id: '10', timestamp: 'May 9 · 1:00 PM', type: 'issue', text: 'Resolved detention dispute — $175 recovered from broker', loadRef: 'DL-2025-0812' },
]

const LOADS: LoadRecord[] = [
  { id: 'DL-2025-0847', origin: 'Chicago, IL', destination: 'Houston, TX', broker: 'Echo Global', gross: 3240, miles: 1110, rpm: 2.92, dispFee: 162, netToOO: 3078, status: 'In Transit', date: 'May 13' },
  { id: 'DL-2025-0839', origin: 'Chicago, IL', destination: 'Dallas, TX', broker: 'Echo Global', gross: 3355, miles: 1100, rpm: 3.05, dispFee: 168, netToOO: 3187, status: 'In Transit', date: 'May 12' },
  { id: 'DL-2025-0833', origin: 'Memphis, TN', destination: 'Chicago, IL', broker: 'Coyote Logistics', gross: 2086, miles: 751, rpm: 2.78, dispFee: 104, netToOO: 1982, status: 'Delivered', date: 'May 11' },
  { id: 'DL-2025-0829', origin: 'Atlanta, GA', destination: 'Memphis, TN', broker: 'Transplace', gross: 1150, miles: 389, rpm: 2.95, dispFee: 58, netToOO: 1092, status: 'Delivered', date: 'May 10' },
  { id: 'DL-2025-0821', origin: 'Dallas, TX', destination: 'Atlanta, GA', broker: 'XPO Logistics', gross: 2600, miles: 781, rpm: 3.33, dispFee: 130, netToOO: 2470, status: 'Delivered', date: 'May 9' },
  { id: 'DL-2025-0812', origin: 'Nashville, TN', destination: 'Chicago, IL', broker: 'Convoy', gross: 1568, miles: 474, rpm: 3.31, dispFee: 78, netToOO: 1490, status: 'Delivered', date: 'May 8' },
  { id: 'DL-2025-0804', origin: 'Chicago, IL', destination: 'Indianapolis, IN', broker: 'Total Quality Logistics', gross: 680, miles: 181, rpm: 3.76, dispFee: 34, netToOO: 646, status: 'Delivered', date: 'May 7' },
  { id: 'DL-2025-0798', origin: 'Detroit, MI', destination: 'Nashville, TN', broker: 'Coyote Logistics', gross: 1850, miles: 531, rpm: 3.49, dispFee: 93, netToOO: 1757, status: 'Delivered', date: 'May 6' },
  { id: 'DL-2025-0791', origin: 'Louisville, KY', destination: 'Dallas, TX', broker: 'Echo Global', gross: 2420, miles: 963, rpm: 2.51, dispFee: 121, netToOO: 2299, status: 'Delivered', date: 'May 5' },
  { id: 'DL-2025-0785', origin: 'Dallas, TX', destination: 'Denver, CO', broker: 'Transplace', gross: 2580, miles: 921, rpm: 2.80, dispFee: 129, netToOO: 2451, status: 'Delivered', date: 'May 4' },
  { id: 'DL-2025-0779', origin: 'Denver, CO', destination: 'Phoenix, AZ', broker: 'XPO Logistics', gross: 2020, miles: 600, rpm: 3.37, dispFee: 101, netToOO: 1919, status: 'Delivered', date: 'May 3' },
  { id: 'DL-2025-0771', origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', broker: 'Convoy', gross: 1140, miles: 370, rpm: 3.08, dispFee: 57, netToOO: 1083, status: 'Delivered', date: 'May 2' },
  { id: 'DL-2025-0765', origin: 'Los Angeles, CA', destination: 'Las Vegas, NV', broker: 'Echo Global', gross: 820, miles: 270, rpm: 3.04, dispFee: 41, netToOO: 779, status: 'Delivered', date: 'May 1' },
  { id: 'DL-2025-0758', origin: 'Chicago, IL', destination: 'Atlanta, GA', broker: 'Total Quality Logistics', gross: 2960, miles: 720, rpm: 4.11, dispFee: 148, netToOO: 2812, status: 'Delivered', date: 'Apr 30' },
  { id: 'DL-2025-0751', origin: 'Atlanta, GA', destination: 'Miami, FL', broker: 'Coyote Logistics', gross: 1780, miles: 663, rpm: 2.68, dispFee: 89, netToOO: 1691, status: 'Delivered', date: 'Apr 29' },
  { id: 'DL-2025-0744', origin: 'Miami, FL', destination: 'Jacksonville, FL', broker: 'Convoy', gross: 840, miles: 340, rpm: 2.47, dispFee: 42, netToOO: 798, status: 'Delivered', date: 'Apr 28' },
  { id: 'DL-2025-0737', origin: 'Chicago, IL', destination: 'Kansas City, MO', broker: 'Transplace', gross: 1260, miles: 511, rpm: 2.47, dispFee: 63, netToOO: 1197, status: 'Delivered', date: 'Apr 27' },
  { id: 'DL-2025-0730', origin: 'Kansas City, MO', destination: 'Dallas, TX', broker: 'XPO Logistics', gross: 1680, miles: 490, rpm: 3.43, dispFee: 84, netToOO: 1596, status: 'Delivered', date: 'Apr 26' },
  { id: 'DL-2025-0722', origin: 'Dallas, TX', destination: 'Houston, TX', broker: 'Echo Global', gross: 680, miles: 240, rpm: 2.83, dispFee: 34, netToOO: 646, status: 'Delivered', date: 'Apr 25' },
  { id: 'DL-2025-0715', origin: 'Houston, TX', destination: 'Memphis, TN', broker: 'Total Quality Logistics', gross: 2050, miles: 585, rpm: 3.50, dispFee: 103, netToOO: 1947, status: 'Delivered', date: 'Apr 24' },
]

const BENCHMARKS: BenchmarkAxis[] = [
  { label: 'Avg RPM', yours: 80, avg: 52, top10: 95, specialist: 72, yourRaw: '$2.83', avgRaw: '$2.61', top10Raw: '$3.10' },
  { label: 'On-Time %', yours: 92, avg: 71, top10: 98, specialist: 89, yourRaw: '96.4%', avgRaw: '84.2%', top10Raw: '99.1%' },
  { label: 'Response Time', yours: 75, avg: 55, top10: 90, specialist: 70, yourRaw: '18 min', avgRaw: '31 min', top10Raw: '9 min' },
  { label: 'Broker Issues', yours: 88, avg: 60, top10: 96, specialist: 82, yourRaw: '0.3/mo', avgRaw: '0.9/mo', top10Raw: '0.1/mo' },
  { label: 'Load Updates', yours: 85, avg: 63, top10: 97, specialist: 80, yourRaw: '97%', avgRaw: '79%', top10Raw: '99%' },
  { label: 'Commission Eff.', yours: 78, avg: 65, top10: 92, specialist: 75, yourRaw: '91.5%', avgRaw: '88.0%', top10Raw: '94.2%' },
]

// ─── Colour helpers ───────────────────────────────────────────────────────────

function rpmBarColor(actual: number, promised: number): string {
  const diff = actual - promised
  if (diff >= 0) return '#22c55e'       // green — at or above
  if (Math.abs(diff) / promised <= 0.05) return '#f59e0b' // amber — within 5%
  return '#ef4444'                       // red — below
}

function fmtUSD(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtK(n: number): string {
  return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + n
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrustRing({ score }: { score: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={36} cy={36} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle
        cx={36} cy={36} r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      <text
        x={36} y={40}
        textAnchor="middle"
        style={{ transform: 'rotate(90deg) translate(0px, -72px)', fontSize: 14, fontWeight: 700, fill: color }}
      >
        {score}
      </text>
    </svg>
  )
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  const map: Record<ActivityItem['type'], string> = {
    booked: '📦',
    status: '📍',
    negotiated: '💬',
    document: '📄',
    issue: '⚠️',
  }
  return <span style={{ fontSize: 16 }}>{map[type]}</span>
}

// ─── Tab: Performance ─────────────────────────────────────────────────────────

function PerformanceTab() {
  const maxRPM = 3.20
  const minRPM = 2.60
  const range = maxRPM - minRPM

  // Normalize a value to % height in the chart
  function pct(v: number) {
    return ((v - minRPM) / range) * 100
  }

  const promisedPct = pct(MONTHLY_RPM[0].promised)

  return (
    <div>
      {/* ── Section A: RPM Tracker ── */}
      <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 6 }}>RPM Tracker — Jan–May 2025</div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, marginTop: 0 }}>
          Promised RPM <span style={{ color: '#6b7280', fontWeight: 600 }}>$2.80</span> shown as dashed line.
          Green = above target · Amber = within 5% · Red = below target.
        </p>

        {/* Chart area */}
        <div style={{ position: 'relative', height: 220, display: 'flex', gap: 0, alignItems: 'flex-end', paddingBottom: 32, paddingLeft: 48, paddingRight: 8 }}>

          {/* Y-axis labels */}
          {[3.20, 3.00, 2.80, 2.60].map(v => (
            <div
              key={v}
              style={{
                position: 'absolute',
                left: 0,
                bottom: 32 + pct(v) * (220 - 32) / 100,
                fontSize: 11,
                color: '#9ca3af',
                width: 44,
                textAlign: 'right',
                transform: 'translateY(50%)',
              }}
            >
              ${v.toFixed(2)}
            </div>
          ))}

          {/* Gridlines */}
          {[3.20, 3.00, 2.80, 2.60].map(v => (
            <div
              key={v}
              style={{
                position: 'absolute',
                left: 48,
                right: 8,
                bottom: 32 + pct(v) * (220 - 32) / 100,
                borderTop: v === 2.80 ? '2px dashed #6b7280' : '1px solid #f3f4f6',
                zIndex: v === 2.80 ? 2 : 1,
              }}
            />
          ))}

          {/* Promised RPM label */}
          <div style={{
            position: 'absolute',
            left: 52,
            bottom: 32 + pct(2.80) * (220 - 32) / 100 + 4,
            fontSize: 11,
            color: '#6b7280',
            fontWeight: 600,
            zIndex: 3,
          }}>
            Promised $2.80
          </div>

          {/* Bars */}
          {MONTHLY_RPM.map(m => {
            const barHeightPct = ((m.actual - minRPM) / range) * 100
            const barColor = rpmBarColor(m.actual, m.promised)
            return (
              <div
                key={m.month}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  paddingBottom: 0,
                  position: 'relative',
                  zIndex: 3,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: barColor, marginBottom: 4 }}>
                  ${m.actual.toFixed(2)}
                </div>
                <div
                  style={{
                    width: '60%',
                    height: `${barHeightPct}%`,
                    background: barColor,
                    borderRadius: '4px 4px 0 0',
                    opacity: 0.85,
                    transition: 'height 0.4s ease',
                  }}
                />
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, fontWeight: 500 }}>
                  {m.month}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          padding: '10px 16px',
          fontSize: 13,
          color: '#166534',
          fontWeight: 500,
          marginTop: 12,
        }}>
          Avg actual: <strong>$2.83/mile</strong> vs promised <strong>$2.80/mile</strong> — +1.1% above target ✓
        </div>
      </div>

      {/* ── Section B: KPI Cards ── */}
      <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Key Performance Indicators</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {KPIS.map(k => (
            <div
              key={k.label}
              style={{
                background: k.passing ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${k.passing ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 10,
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{k.icon}</span>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{k.label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: k.passing ? '#166534' : '#991b1b', marginBottom: 4 }}>
                {k.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{k.target}</span>
                <span style={{ fontSize: 12, color: k.passing ? '#22c55e' : '#ef4444' }}>
                  {k.passing ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section C: Activity Timeline ── */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Recent Activity</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ACTIVITY.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: 16,
                paddingBottom: idx < ACTIVITY.length - 1 ? 16 : 0,
                marginBottom: idx < ACTIVITY.length - 1 ? 16 : 0,
                borderBottom: idx < ACTIVITY.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              {/* Icon column */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: item.type === 'booked' ? '#dbeafe'
                  : item.type === 'negotiated' ? '#dcfce7'
                  : item.type === 'issue' ? '#fef9c3'
                  : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ActivityIcon type={item.type} />
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, lineHeight: 1.4 }}>
                  {item.text}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{item.timestamp}</span>
                  <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>{item.loadRef}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Load History ────────────────────────────────────────────────────────

function LoadHistoryTab() {
  const [filter, setFilter] = useState<string>('All')

  const statuses = ['All', 'Delivered', 'In Transit', 'Upcoming', 'Cancelled']

  const filtered = useMemo(
    () => filter === 'All' ? LOADS : LOADS.filter(l => l.status === filter),
    [filter]
  )

  const totals = useMemo(() => ({
    gross: filtered.reduce((s, l) => s + l.gross, 0),
    fees: filtered.reduce((s, l) => s + l.dispFee, 0),
    net: filtered.reduce((s, l) => s + l.netToOO, 0),
  }), [filtered])

  const statusColor: Record<string, string> = {
    Delivered: '#22c55e',
    'In Transit': '#3b82f6',
    Upcoming: '#f59e0b',
    Cancelled: '#ef4444',
  }
  const statusBg: Record<string, string> = {
    Delivered: '#f0fdf4',
    'In Transit': '#eff6ff',
    Upcoming: '#fffbeb',
    Cancelled: '#fef2f2',
  }

  return (
    <div>
      {/* Filter + Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {statuses.map(s => (
            <button
              key={s}
              className={filter === s ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
              onClick={() => setFilter(s)}
              style={{ fontSize: 12 }}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span>⬇</span> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Load ID', 'Route', 'Broker', 'Gross', 'RPM', 'Disp. Fee', 'Net to You', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, idx) => (
                <tr
                  key={l.id}
                  style={{
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: idx % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#3b82f6', whiteSpace: 'nowrap' }}>{l.id}</td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#374151' }}>{l.origin}</span>
                    <span style={{ color: '#9ca3af', margin: '0 6px' }}>→</span>
                    <span style={{ color: '#374151' }}>{l.destination}</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>{l.broker}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{fmtUSD(l.gross)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: l.rpm >= 2.80 ? '#22c55e' : '#ef4444' }}>
                    ${l.rpm.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>{fmtUSD(l.dispFee)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#166534' }}>{fmtUSD(l.netToOO)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      color: statusColor[l.status] ?? '#374151',
                      background: statusBg[l.status] ?? '#f3f4f6',
                    }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary row */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Gross ({filtered.length} loads)
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{fmtUSD(totals.gross)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Dispatcher Fees
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#6b7280' }}>{fmtUSD(totals.fees)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              Total Net to You
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#166534' }}>{fmtUSD(totals.net)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Benchmarks ─────────────────────────────────────────────────────────

function BenchmarksTab() {
  const [compareMode, setCompareMode] = useState<'avg' | 'top10' | 'specialist'>('avg')

  const compareLabel: Record<typeof compareMode, string> = {
    avg: 'Platform Average',
    top10: 'Top 10%',
    specialist: 'Lane Specialists',
  }

  const compareColor: Record<typeof compareMode, string> = {
    avg: '#6b7280',
    top10: '#8b5cf6',
    specialist: '#f59e0b',
  }

  return (
    <div>
      {/* Summary banner */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20, background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f', marginBottom: 6 }}>
              Your dispatcher is in the <span style={{ color: '#3b82f6' }}>top 23%</span> on the platform
            </div>
            <div style={{ fontSize: 13, color: '#4b5563' }}>
              Based on 6 performance dimensions across 1,240 active dispatchers
            </div>
          </div>
          <div style={{
            background: '#3b82f6',
            color: '#fff',
            borderRadius: 12,
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: 14,
          }}>
            Score: 83 / 100
          </div>
        </div>
      </div>

      {/* Compare toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Compare against:</span>
        {(['avg', 'top10', 'specialist'] as const).map(m => (
          <button
            key={m}
            className={compareMode === m ? 'btn btn-primary btn-sm' : 'btn btn-sm'}
            onClick={() => setCompareMode(m)}
            style={{ fontSize: 12 }}
          >
            {compareLabel[m]}
          </button>
        ))}
      </div>

      {/* Benchmark bars */}
      <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 20 }}>Performance Comparison</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {BENCHMARKS.map(b => {
            const compVal = compareMode === 'avg' ? b.avg : compareMode === 'top10' ? b.top10 : b.specialist
            const compRaw = compareMode === 'avg' ? b.avgRaw : compareMode === 'top10' ? b.top10Raw : b.avgRaw
            const ahead = b.yours > compVal
            return (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{b.label}</span>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>You: {b.yourRaw}</span>
                    <span style={{ color: compareColor[compareMode] }}>{compareLabel[compareMode]}: {compRaw}</span>
                  </div>
                </div>
                {/* Your bar */}
                <div style={{ position: 'relative', height: 10, background: '#f3f4f6', borderRadius: 5, marginBottom: 6 }}>
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${b.yours}%`,
                    background: '#3b82f6',
                    borderRadius: 5,
                    transition: 'width 0.5s ease',
                  }} />
                  <span style={{
                    position: 'absolute',
                    left: `${b.yours}%`,
                    top: -16,
                    fontSize: 10,
                    color: '#3b82f6',
                    fontWeight: 600,
                    transform: 'translateX(-50%)',
                  }}>You</span>
                </div>
                {/* Compare bar */}
                <div style={{ position: 'relative', height: 10, background: '#f3f4f6', borderRadius: 5 }}>
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${compVal}%`,
                    background: compareColor[compareMode],
                    borderRadius: 5,
                    opacity: 0.6,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                {/* Verdict */}
                <div style={{ marginTop: 6, fontSize: 11, color: ahead ? '#166534' : '#991b1b', fontWeight: 500 }}>
                  {ahead
                    ? `▲ ${b.yours - compVal}pts above ${compareLabel[compareMode]}`
                    : `▼ ${compVal - b.yours}pts below ${compareLabel[compareMode]}`}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Areas to improve */}
      <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
        <div className="section-title" style={{ marginBottom: 14 }}>Areas to Improve</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { area: 'Avg RPM', tip: 'Ask dispatcher to target $2.90+ on Midwest→South lanes. Market rate currently supports it.', delta: '+$0.07/mile', potential: '$1,200/mo' },
            { area: 'Commission Efficiency', tip: 'Current 91.5% net retention is good, but top dispatchers average 94%+ by avoiding flat fees on shorter hauls.', delta: '+2.5%', potential: '$380/mo' },
          ].map(a => (
            <div
              key={a.area}
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: '#92400e', fontSize: 13 }}>{a.area}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>{a.potential}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>est. upside</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>{a.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Find different dispatcher CTA */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Not satisfied with the results?</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Browse 500+ verified dispatchers on the platform</div>
        </div>
        <button
          className="btn btn-sm"
          onClick={() => window.location.hash = '#find-dispatcher'}
          style={{ whiteSpace: 'nowrap', color: '#3b82f6', border: '1px solid #3b82f6', fontWeight: 600 }}
        >
          Find a Different Dispatcher →
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DispatcherScorecardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('performance')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'performance', label: 'Performance' },
    { key: 'history', label: 'Load History' },
    { key: 'benchmarks', label: 'Benchmarks' },
  ]

  const statusColor = DISPATCHER.overallStatus === 'on-track' ? '#22c55e' : '#f59e0b'
  const statusBg = DISPATCHER.overallStatus === 'on-track' ? '#f0fdf4' : '#fffbeb'
  const statusBorder = DISPATCHER.overallStatus === 'on-track' ? '#bbf7d0' : '#fde68a'
  const statusLabel = DISPATCHER.overallStatus === 'on-track' ? 'On Track ✓' : 'Below Target !'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

      {/* ── Page Header ── */}
      <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Avatar + Info */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flex: '1 1 auto' }}>
            {/* Avatar circle */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {DISPATCHER.initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
                  {DISPATCHER.name}
                </h1>
                <span style={{ fontSize: 18 }}>{DISPATCHER.country}</span>
                <span style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}>
                  ✔ {DISPATCHER.badge}
                </span>
                <span style={{
                  background: statusBg,
                  color: statusColor,
                  border: `1px solid ${statusBorder}`,
                  borderRadius: 20,
                  padding: '3px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {statusLabel}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                Active since {DISPATCHER.activeSince} · Your dispatcher
              </div>
            </div>
          </div>

          {/* Trust Score ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <TrustRing score={DISPATCHER.trustScore} />
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Trust Score</div>
          </div>
        </div>

        {/* Quick metric chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24 }}>
          {[
            { label: 'Avg RPM (actual)', value: `$${DISPATCHER.avgRPM.toFixed(2)}/mi`, sub: `vs promised $${DISPATCHER.promisedRPM.toFixed(2)}`, color: '#22c55e' },
            { label: 'On-Time Pickup', value: `${DISPATCHER.onTimePickup}%`, sub: 'last 90 days', color: '#3b82f6' },
            { label: 'Avg Response Time', value: `${DISPATCHER.responseTimeMin} min`, sub: 'target <30 min', color: '#8b5cf6' },
            { label: 'Commission Paid YTD', value: fmtK(DISPATCHER.commissionYTD), sub: '5% of gross', color: '#f59e0b' },
          ].map(m => (
            <div
              key={m.label}
              style={{
                background: '#f9fafb',
                border: '1px solid #f3f4f6',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: '#f3f4f6', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 22px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === t.key ? 700 : 500,
              fontSize: 14,
              background: activeTab === t.key ? '#fff' : 'transparent',
              color: activeTab === t.key ? '#111827' : '#6b7280',
              boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'performance' && <PerformanceTab />}
      {activeTab === 'history' && <LoadHistoryTab />}
      {activeTab === 'benchmarks' && <BenchmarksTab />}
    </div>
  )
}
