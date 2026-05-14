import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type MonthKey = 'may' | 'apr' | 'mar'

type ClientRow = {
  client: string
  truck: string
  loads: number
  grossRevenue: number
  commissionPct: number
  commissionDollar: number
  avgRpm: number
  topLane: string
  status: 'active' | 'idle' | 'pending'
}

type BarMonth = {
  label: string
  value: number
}

type LaneRow = {
  lane: string
  trips: number
  totalRevenue: number
  avgRate: number
  avgRpm: number
}

type MonthDataset = {
  kpi: {
    revenue: number
    commission: number
    commissionPct: number
    activeClients: number
    loadsDispatched: number
    avgRpm: number
  }
  clients: ClientRow[]
  lanes: LaneRow[]
  forecastMonthly: number
  forecastPct: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const BAR_MONTHS: BarMonth[] = [
  { label: 'Dec', value: 820 },
  { label: 'Jan', value: 940 },
  { label: 'Feb', value: 1_050 },
  { label: 'Mar', value: 1_180 },
  { label: 'Apr', value: 1_100 },
  { label: 'May', value: 1_236 },
]

const DATASETS: Record<MonthKey, MonthDataset> = {
  may: {
    kpi: {
      revenue: 8_240,
      commission: 1_236,
      commissionPct: 15,
      activeClients: 5,
      loadsDispatched: 23,
      avgRpm: 2.18,
    },
    clients: [
      { client: 'Mike R.',   truck: 'CG-4421', loads: 8, grossRevenue: 22_400, commissionPct: 8,  commissionDollar: 1_792, avgRpm: 2.34, topLane: 'CHI→DAL', status: 'active'  },
      { client: 'Sergiy K.', truck: 'CG-4418', loads: 6, grossRevenue: 15_600, commissionPct: 10, commissionDollar: 1_560, avgRpm: 2.10, topLane: 'MIA→ATL', status: 'active'  },
      { client: 'Tom B.',    truck: 'CG-4422', loads: 3, grossRevenue: 8_100,  commissionPct: 8,  commissionDollar: 648,   avgRpm: 1.95, topLane: 'HOU→PHX', status: 'idle'    },
      { client: 'Anna P.',   truck: 'CG-4415', loads: 5, grossRevenue: 11_200, commissionPct: 8,  commissionDollar: 896,   avgRpm: 2.28, topLane: 'LAX→SAC', status: 'active'  },
      { client: 'James P.',  truck: 'CG-4419', loads: 1, grossRevenue: 2_200,  commissionPct: 10, commissionDollar: 220,   avgRpm: 2.20, topLane: 'ATL→NSH', status: 'pending' },
    ],
    lanes: [
      { lane: 'Chicago → Dallas',   trips: 8, totalRevenue: 22_400, avgRate: 2_800, avgRpm: 2.34 },
      { lane: 'Miami → Atlanta',    trips: 6, totalRevenue: 15_600, avgRate: 2_600, avgRpm: 2.10 },
      { lane: 'LA → Sacramento',    trips: 5, totalRevenue: 11_200, avgRate: 2_240, avgRpm: 2.28 },
      { lane: 'Houston → Phoenix',  trips: 3, totalRevenue: 8_100,  avgRate: 2_700, avgRpm: 1.95 },
      { lane: 'Atlanta → Nashville',trips: 1, totalRevenue: 2_200,  avgRate: 2_200, avgRpm: 2.20 },
    ],
    forecastMonthly: 1_420,
    forecastPct: 14.8,
  },
  apr: {
    kpi: {
      revenue: 7_340,
      commission: 1_100,
      commissionPct: 15,
      activeClients: 4,
      loadsDispatched: 19,
      avgRpm: 2.11,
    },
    clients: [
      { client: 'Mike R.',   truck: 'CG-4421', loads: 7, grossRevenue: 19_600, commissionPct: 8,  commissionDollar: 1_568, avgRpm: 2.28, topLane: 'CHI→DAL', status: 'active' },
      { client: 'Sergiy K.', truck: 'CG-4418', loads: 5, grossRevenue: 13_000, commissionPct: 10, commissionDollar: 1_300, avgRpm: 2.05, topLane: 'MIA→ATL', status: 'active' },
      { client: 'Tom B.',    truck: 'CG-4422', loads: 4, grossRevenue: 10_400, commissionPct: 8,  commissionDollar: 832,   avgRpm: 2.00, topLane: 'HOU→PHX', status: 'active' },
      { client: 'Anna P.',   truck: 'CG-4415', loads: 3, grossRevenue: 6_600,  commissionPct: 8,  commissionDollar: 528,   avgRpm: 2.18, topLane: 'LAX→SAC', status: 'active' },
      { client: 'James P.',  truck: 'CG-4419', loads: 0, grossRevenue: 0,      commissionPct: 10, commissionDollar: 0,     avgRpm: 0,    topLane: '—',       status: 'idle'   },
    ],
    lanes: [
      { lane: 'Chicago → Dallas',  trips: 7, totalRevenue: 19_600, avgRate: 2_800, avgRpm: 2.28 },
      { lane: 'Miami → Atlanta',   trips: 5, totalRevenue: 13_000, avgRate: 2_600, avgRpm: 2.05 },
      { lane: 'Houston → Phoenix', trips: 4, totalRevenue: 10_400, avgRate: 2_600, avgRpm: 2.00 },
      { lane: 'LA → Sacramento',   trips: 3, totalRevenue: 6_600,  avgRate: 2_200, avgRpm: 2.18 },
      { lane: 'MIA → BOS',         trips: 1, totalRevenue: 2_800,  avgRate: 2_800, avgRpm: 2.30 },
    ],
    forecastMonthly: 1_100,
    forecastPct: 4.8,
  },
  mar: {
    kpi: {
      revenue: 6_560,
      commission: 1_180,
      commissionPct: 18,
      activeClients: 4,
      loadsDispatched: 16,
      avgRpm: 2.05,
    },
    clients: [
      { client: 'Mike R.',   truck: 'CG-4421', loads: 6, grossRevenue: 16_800, commissionPct: 8,  commissionDollar: 1_344, avgRpm: 2.20, topLane: 'CHI→DAL', status: 'active' },
      { client: 'Sergiy K.', truck: 'CG-4418', loads: 4, grossRevenue: 10_400, commissionPct: 10, commissionDollar: 1_040, avgRpm: 2.08, topLane: 'MIA→ATL', status: 'active' },
      { client: 'Tom B.',    truck: 'CG-4422', loads: 4, grossRevenue: 9_800,  commissionPct: 8,  commissionDollar: 784,   avgRpm: 1.98, topLane: 'HOU→PHX', status: 'active' },
      { client: 'Anna P.',   truck: 'CG-4415', loads: 2, grossRevenue: 4_400,  commissionPct: 8,  commissionDollar: 352,   avgRpm: 2.10, topLane: 'LAX→SAC', status: 'active' },
      { client: 'James P.',  truck: 'CG-4419', loads: 0, grossRevenue: 0,      commissionPct: 10, commissionDollar: 0,     avgRpm: 0,    topLane: '—',       status: 'idle'   },
    ],
    lanes: [
      { lane: 'Chicago → Dallas',  trips: 6, totalRevenue: 16_800, avgRate: 2_800, avgRpm: 2.20 },
      { lane: 'Miami → Atlanta',   trips: 4, totalRevenue: 10_400, avgRate: 2_600, avgRpm: 2.08 },
      { lane: 'Houston → Phoenix', trips: 4, totalRevenue: 9_800,  avgRate: 2_450, avgRpm: 1.98 },
      { lane: 'LA → Sacramento',   trips: 2, totalRevenue: 4_400,  avgRate: 2_200, avgRpm: 2.10 },
      { lane: 'CHI → NSH',         trips: 1, totalRevenue: 2_100,  avgRate: 2_100, avgRpm: 2.05 },
    ],
    forecastMonthly: 1_180,
    forecastPct: 12.4,
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const STATUS_META: Record<ClientRow['status'], { label: string; color: string; bg: string; dot: string }> = {
  active:  { label: 'Active',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  dot: '🟢' },
  idle:    { label: 'Idle',    color: '#D97706', bg: 'rgba(217,119,6,0.12)',  dot: '🟡' },
  pending: { label: 'Pending', color: '#6366F1', bg: 'rgba(99,102,241,0.12)', dot: '🟡' },
}

const MONTH_TABS: { key: MonthKey; label: string }[] = [
  { key: 'may', label: 'May 2025' },
  { key: 'apr', label: 'Apr 2025' },
  { key: 'mar', label: 'Mar 2025' },
]

// ── Accent colour used throughout ─────────────────────────────────────────────
const ACCENT = '#4BAED4'
const ACCENT2 = '#8B5CF6'

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DispatcherPnLPage() {
  const [month, setMonth] = useState<MonthKey>('may')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [hoveredLane, setHoveredLane] = useState<number | null>(null)

  const data = DATASETS[month]
  const { kpi, clients, lanes, forecastMonthly, forecastPct } = data

  const maxBar = Math.max(...BAR_MONTHS.map(b => b.value))
  const maxLaneRev = Math.max(...lanes.map(l => l.totalRevenue))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--c-dark, #1A2535)' }}>
            P&amp;L Analytics
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--c-text-muted, #718096)' }}>
            Earnings breakdown · commission tracking · lane performance
          </p>
        </div>

        {/* Month selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--c-surface, #F7FAFC)', border: '1px solid var(--c-border, #E2E8F0)', borderRadius: 10, padding: 4 }}>
          {MONTH_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setMonth(tab.key)}
              style={{
                padding: '6px 14px', border: 'none', borderRadius: 7, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: month === tab.key ? ACCENT : 'transparent',
                color: month === tab.key ? '#fff' : 'var(--c-text-muted, #718096)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          {
            icon: '💵',
            label: 'This Month Revenue',
            value: fmt(kpi.revenue),
            sub: 'gross brokered',
            color: ACCENT,
          },
          {
            icon: '💰',
            label: 'Commission Earned',
            value: fmt(kpi.commission),
            sub: `${kpi.commissionPct}% blended`,
            color: ACCENT2,
          },
          {
            icon: '🤝',
            label: 'Active Clients',
            value: kpi.activeClients.toString(),
            sub: 'dispatching now',
            color: '#22C55E',
          },
          {
            icon: '📦',
            label: 'Loads Dispatched',
            value: kpi.loadsDispatched.toString(),
            sub: 'this month',
            color: '#F97316',
          },
          {
            icon: '🛣️',
            label: 'Avg RPM Fleet',
            value: `$${kpi.avgRpm.toFixed(2)}`,
            sub: 'per mile avg',
            color: '#10B981',
          },
        ].map(s => (
          <div
            key={s.label}
            className="stat-card"
            style={{ borderTopColor: s.color }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: s.color + '1A', color: s.color,
                padding: '2px 7px', borderRadius: 5,
              }}>
                {s.sub}
              </span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Section 1: Per-Client P&L Table ──────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--c-border, #E2E8F0)' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Per-Client P&amp;L</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 860 }}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Truck</th>
                <th style={{ textAlign: 'center' }}>Loads</th>
                <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                <th style={{ textAlign: 'center' }}>Comm %</th>
                <th style={{ textAlign: 'right' }}>Commission $</th>
                <th style={{ textAlign: 'right' }}>Avg RPM</th>
                <th style={{ textAlign: 'center' }}>Top Lane</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((row, i) => {
                const sm = STATUS_META[row.status]
                const isHovered = hoveredRow === i
                return (
                  <tr
                    key={row.client}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isHovered ? 'rgba(75,174,212,0.06)' : 'transparent',
                      transition: 'background 0.12s ease',
                      cursor: 'default',
                    }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--c-dark, #1A2535)', fontSize: 13 }}>
                      {row.client}
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: ACCENT,
                        background: ACCENT + '14', padding: '2px 8px', borderRadius: 5,
                      }}>
                        {row.truck}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.loads}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: ACCENT }}>
                      {row.grossRevenue > 0 ? fmt(row.grossRevenue) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: row.commissionPct >= 10 ? ACCENT2 : '#718096',
                      }}>
                        {row.commissionPct}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: ACCENT2 }}>
                      {row.commissionDollar > 0 ? fmt(row.commissionDollar) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {row.avgRpm > 0 ? (
                        <span style={{ color: row.avgRpm >= 2.2 ? '#22C55E' : row.avgRpm >= 2.0 ? '#D97706' : '#DC2626' }}>
                          ${row.avgRpm.toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#4A5568' }}>
                      {row.topLane}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                        background: sm.bg, color: sm.color,
                      }}>
                        {sm.dot} {sm.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Totals footer */}
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--c-border, #E2E8F0)', fontWeight: 800 }}>
                <td colSpan={2} style={{ color: '#4A5568', fontSize: 12 }}>Totals</td>
                <td style={{ textAlign: 'center', color: 'var(--c-dark, #1A2535)' }}>
                  {clients.reduce((s, c) => s + c.loads, 0)}
                </td>
                <td style={{ textAlign: 'right', color: ACCENT }}>
                  {fmt(clients.reduce((s, c) => s + c.grossRevenue, 0))}
                </td>
                <td />
                <td style={{ textAlign: 'right', color: ACCENT2 }}>
                  {fmt(clients.reduce((s, c) => s + c.commissionDollar, 0))}
                </td>
                <td style={{ textAlign: 'right', color: '#718096', fontWeight: 600 }}>
                  ${(clients.filter(c => c.avgRpm > 0).reduce((s, c) => s + c.avgRpm, 0) /
                    clients.filter(c => c.avgRpm > 0).length).toFixed(2)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Bottom grid: chart + lanes + forecast ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Section 2: Commission Trend Bar Chart ─────────────────────────── */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>Monthly Commission Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {BAR_MONTHS.map((b, i) => {
              const barH = Math.max((b.value / maxBar) * 130, 8)
              const isCurrent = b.label === (month === 'may' ? 'May' : month === 'apr' ? 'Apr' : 'Mar')
              return (
                <div
                  key={b.label}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                >
                  {/* Value label */}
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    color: isCurrent ? ACCENT : 'var(--c-text-muted, #718096)',
                  }}>
                    {fmt(b.value)}
                  </span>
                  {/* Bar */}
                  <div style={{
                    width: '100%', height: barH,
                    borderRadius: '5px 5px 0 0',
                    background: isCurrent
                      ? `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT}BB 100%)`
                      : 'var(--c-border, #E2E8F0)',
                    boxShadow: isCurrent ? `0 0 12px ${ACCENT}44` : 'none',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}>
                    {isCurrent && (
                      <div style={{
                        position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
                        width: 6, height: 6, borderRadius: '50%', background: '#fff',
                        border: `2px solid ${ACCENT}`,
                      }} />
                    )}
                  </div>
                  {/* Month label */}
                  <span style={{
                    fontSize: 11, fontWeight: isCurrent ? 800 : 500,
                    color: isCurrent ? ACCENT : 'var(--c-text-muted, #718096)',
                  }}>
                    {b.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Axis line */}
          <div style={{ height: 1, background: 'var(--c-border, #E2E8F0)', margin: '4px 0 12px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--c-text-muted, #718096)' }}>
            <span>6-month commission history</span>
            <span style={{ fontWeight: 700, color: ACCENT }}>
              Avg: {fmt(Math.round(BAR_MONTHS.reduce((s, b) => s + b.value, 0) / BAR_MONTHS.length))}/mo
            </span>
          </div>
        </div>

        {/* ── Section 3: Top Lanes + Section 4: Forecast stacked ───────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Top Lanes */}
          <div className="card" style={{ flex: 1 }}>
            <h3 className="section-title" style={{ marginBottom: 14 }}>Top Lanes by Revenue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lanes.map((lane, i) => {
                const barPct = (lane.totalRevenue / maxLaneRev) * 100
                const isHovered = hoveredLane === i
                return (
                  <div
                    key={lane.lane}
                    onMouseEnter={() => setHoveredLane(i)}
                    onMouseLeave={() => setHoveredLane(null)}
                    style={{
                      background: isHovered ? 'rgba(75,174,212,0.05)' : 'transparent',
                      borderRadius: 8, padding: '6px 4px',
                      transition: 'background 0.12s ease', cursor: 'default',
                    }}
                  >
                    {/* Lane name + rank */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          background: i === 0 ? '#F59E0B22' : 'var(--c-surface, #F7FAFC)',
                          border: `1.5px solid ${i === 0 ? '#F59E0B' : 'var(--c-border, #E2E8F0)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800,
                          color: i === 0 ? '#F59E0B' : 'var(--c-text-muted, #718096)',
                        }}>
                          {i + 1}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>
                          {lane.lane}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--c-text-muted, #718096)' }}>
                        <span>{lane.trips} trips</span>
                        <span style={{ fontWeight: 700, color: ACCENT }}>{fmt(lane.totalRevenue)}</span>
                      </div>
                    </div>

                    {/* Horizontal fill bar */}
                    <div style={{ height: 6, background: 'var(--c-border, #E2E8F0)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{
                        width: `${barPct}%`, height: '100%', borderRadius: 3,
                        background: i === 0
                          ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`
                          : ACCENT + '88',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>

                    {/* Sub-stats */}
                    <div style={{ display: 'flex', gap: 14, fontSize: 10, color: 'var(--c-text-muted, #718096)' }}>
                      <span>Avg Rate: <strong style={{ color: '#4A5568' }}>{fmt(lane.avgRate)}</strong></span>
                      <span>Avg RPM: <strong style={{ color: lane.avgRpm >= 2.2 ? '#22C55E' : '#D97706' }}>${lane.avgRpm.toFixed(2)}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 4: Commission Forecast */}
          <div className="card" style={{
            background: `linear-gradient(135deg, rgba(75,174,212,0.08) 0%, rgba(139,92,246,0.08) 100%)`,
            border: `1px solid ${ACCENT}44`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>📈</span>
              <h3 className="section-title" style={{ margin: 0 }}>Commission Forecast</h3>
            </div>

            {/* Main forecast */}
            <div style={{
              padding: '14px 16px', background: 'rgba(255,255,255,0.6)', borderRadius: 10,
              border: `1px solid ${ACCENT}33`, marginBottom: 10,
            }}>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted, #718096)', marginBottom: 4 }}>
                At current pace
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: ACCENT }}>
                  ~{fmt(forecastMonthly)}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: '#22C55E1A', color: '#22C55E',
                }}>
                  +{forecastPct}% vs last month
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted, #718096)', marginTop: 4 }}>
                projected commission for this month
              </div>
            </div>

            {/* Add client scenario */}
            <div style={{
              padding: '12px 14px', background: 'rgba(139,92,246,0.07)', borderRadius: 10,
              border: `1px solid ${ACCENT2}33`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT2, marginBottom: 2 }}>
                    Add 1 more client at avg rates
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--c-text-muted, #718096)' }}>
                    Based on current fleet avg ($2.18 RPM · 4.6 loads/mo)
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: ACCENT2 }}>+$312</div>
                  <div style={{ fontSize: 10, color: 'var(--c-text-muted, #718096)' }}>/month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
