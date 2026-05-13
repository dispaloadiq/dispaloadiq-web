import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Shared UI ─────────────────────────────────────────────────────────────────

function TrendArrow({ trend }: { trend: string }) {
  if (trend === 'up')   return <span style={{ color: '#38C770', fontWeight: 700 }}>↑</span>
  if (trend === 'down') return <span style={{ color: '#EF4444', fontWeight: 700 }}>↓</span>
  return <span style={{ color: '#A0AEC0' }}>→</span>
}

function PeriodSelector({ period, setPeriod }: { period: string; setPeriod: (p: any) => void }) {
  return (
    <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 10, padding: 3 }}>
      {(['3mo', '6mo', '12mo'] as const).map(p => (
        <button key={p} onClick={() => setPeriod(p)} style={{
          padding: '6px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13,
          border: 'none', cursor: 'pointer',
          background: period === p ? '#fff' : 'transparent',
          color: period === p ? '#4BAED4' : '#718096',
          boxShadow: period === p ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
        }}>{p}</button>
      ))}
    </div>
  )
}

function HorizontalBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ flex: 1, height: 6, background: '#F0F4F8', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${Math.round((value / max) * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
    </div>
  )
}

function KpiCards({ stats }: { stats: { label: string; value: string; change: string; up: boolean; color: string; icon: string }[] }) {
  return (
    <div className="stats-grid">
      {stats.map(st => (
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
  )
}

// ── SVG Area Chart ────────────────────────────────────────────────────────────

function SvgAreaChart({ data, labels, color = '#4BAED4', height = 170, unit = '' }: {
  data: number[]
  labels: string[]
  color?: string
  height?: number
  unit?: string
}) {
  const W = 480
  const H = height - 30
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pad = 12
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - ((v - min) / (max - min || 1)) * (H - pad * 2) - pad
    return { x, y, v }
  })
  const linePoints = pts.map(p => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${pts[0].x},${H} ${linePoints} ${pts[pts.length - 1].x},${H}`
  const gradId = `area-grad-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke={color} strokeWidth="2" />
          <text x={p.x} y={H + 20} textAnchor="middle" fontSize="10" fill="#A0AEC0" fontWeight="600">
            {labels[i]}
          </text>
          {i === pts.length - 1 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill={color} fontWeight="800">
              {unit}{p.v >= 1000 ? `$${(p.v / 1000).toFixed(0)}k` : p.v}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80
  const H = 32
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / (max - min || 1)) * (H - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const area = `0,${H} ${pts.split(' ').join(' ')} ${W},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 32 }}>
      <polygon points={area} fill={color} fillOpacity="0.15" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── CSS Bar Chart ─────────────────────────────────────────────────────────────

function BarChart({ data, color = '#4BAED4', labels }: {
  data: number[]
  color?: string
  labels: string[]
}) {
  const max = Math.max(...data)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 150, padding: '0 8px' }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 3 }}>
              {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : v}
            </div>
            <div style={{
              width: '100%',
              height: Math.round((v / max) * 130),
              background: `linear-gradient(180deg, ${color}, ${color}CC)`,
              borderRadius: '4px 4px 0 0',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '6px 8px 0' }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#718096', fontWeight: 600 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

function DualBarChart({ data }: { data: { month: string; a: number; b: number; partial?: boolean }[] }) {
  const max = Math.max(...data.map(d => d.a))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160, padding: '0 8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 3 }}>${(d.a / 1000).toFixed(0)}k</div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', width: '100%' }}>
              <div style={{ flex: 1, height: Math.round((d.a / max) * 140), background: d.partial ? 'repeating-linear-gradient(45deg,#4BAED4,#4BAED4 4px,#EBF8FF 4px,#EBF8FF 8px)' : 'linear-gradient(180deg,#4BAED4,#2D7A9A)', borderRadius: '4px 4px 0 0' }} />
              <div style={{ flex: 1, height: Math.round((d.b / max) * 140), background: '#EF444466', borderRadius: '4px 4px 0 0' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '6px 8px 0' }}>
        {data.map(d => (
          <div key={d.month} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#718096', fontWeight: 600 }}>{d.month}{d.partial ? '*' : ''}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'center', fontSize: 11 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#4BAED4' }} /> Revenue
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#EF4444', opacity: .5 }} /> Expenses
        </span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPANY Analytics (12 months)
// ══════════════════════════════════════════════════════════════════════════════

const CO_MONTHLY = [
  { month: 'Jun', a: 44100, b: 28700, loads: 35, fuel: 9200 },
  { month: 'Jul', a: 47200, b: 30100, loads: 38, fuel: 9800 },
  { month: 'Aug', a: 51800, b: 33400, loads: 44, fuel: 10800 },
  { month: 'Sep', a: 49600, b: 32100, loads: 41, fuel: 10200 },
  { month: 'Oct', a: 53400, b: 34200, loads: 45, fuel: 11100 },
  { month: 'Nov', a: 55100, b: 35800, loads: 47, fuel: 11600 },
  { month: 'Dec', a: 48200, b: 31400, loads: 38, fuel: 10100 },
  { month: 'Jan', a: 52100, b: 33800, loads: 42, fuel: 10900 },
  { month: 'Feb', a: 46800, b: 30200, loads: 37, fuel:  9600 },
  { month: 'Mar', a: 58400, b: 36100, loads: 48, fuel: 12200 },
  { month: 'Apr', a: 61200, b: 38500, loads: 51, fuel: 12900 },
  { month: 'May', a: 43800, b: 27100, loads: 34, fuel:  9000, partial: true },
]

const CO_LANES = [
  { lane: 'Chicago → Dallas',    loads: 28, avgRate: '$2,180', avgRpm: '$2.45', revenue: '$61,040', trend: 'up'   },
  { lane: 'Chicago → Atlanta',   loads: 19, avgRate: '$1,920', avgRpm: '$2.38', revenue: '$36,480', trend: 'up'   },
  { lane: 'LA → Phoenix',        loads: 22, avgRate: '$880',   avgRpm: '$2.39', revenue: '$19,360', trend: 'flat' },
  { lane: 'Miami → Atlanta',     loads: 14, avgRate: '$1,540', avgRpm: '$2.33', revenue: '$21,560', trend: 'up'   },
  { lane: 'Nashville → Chicago', loads: 11, avgRate: '$1,380', avgRpm: '$2.21', revenue: '$15,180', trend: 'down' },
]

const CO_DRIVERS = [
  { name: 'James Carter',   unit: 'Unit 03', loads: 11, revenue: '$18,200', rpm: '$2.61', onTime: 94, rank: 1 },
  { name: 'Mike Rodriguez', unit: 'Unit 01', loads: 8,  revenue: '$14,800', rpm: '$2.45', onTime: 98, rank: 2 },
  { name: 'Anna Perez',     unit: 'Unit 02', loads: 5,  revenue: '$7,450',  rpm: '$2.38', onTime: 97, rank: 3 },
  { name: 'Tony Marshall',  unit: 'Unit 05', loads: 1,  revenue: '$3,200',  rpm: '$2.21', onTime: 88, rank: 4 },
]

const CO_EXPENSES = [
  { label: 'Fuel',         value: 34, amount: '$14,892', color: '#EF4444' },
  { label: 'Driver Pay',   value: 28, amount: '$12,264', color: '#4BAED4' },
  { label: 'Maintenance',  value: 12, amount: '$5,256',  color: '#F59E0B' },
  { label: 'Insurance',    value: 10, amount: '$4,380',  color: '#8B5CF6' },
  { label: 'Permits/Fees', value: 8,  amount: '$3,504',  color: '#38C770' },
  { label: 'Other',        value: 8,  amount: '$3,504',  color: '#A0AEC0' },
]

const CO_BROKERS = [
  { name: 'CH Robinson',      loads: 22, revenue: 44800, color: '#4BAED4' },
  { name: 'Echo Global',      loads: 18, revenue: 36200, color: '#38C770' },
  { name: 'Coyote Logistics', loads: 15, revenue: 28600, color: '#8B5CF6' },
  { name: 'XPO Logistics',    loads: 12, revenue: 21400, color: '#F59E0B' },
  { name: 'TQL',              loads: 10, revenue: 19800, color: '#E53E3E' },
]

function CompanyAnalytics({ period }: { period: string }) {
  const [subTab, setSubTab] = useState<'overview' | 'trends' | 'drivers'>('overview')
  const sliceMap = { '3mo': 3, '6mo': 6, '12mo': 12 }
  const take = sliceMap[period as keyof typeof sliceMap] ?? 6
  const data = CO_MONTHLY.slice(-take)

  const totalRev  = data.reduce((s, d) => s + d.a, 0)
  const totalExp  = data.reduce((s, d) => s + d.b, 0)
  const totalLoad = data.reduce((s, d) => s + d.loads, 0)
  const totalFuel = data.reduce((s, d) => s + d.fuel, 0)
  const net       = totalRev - totalExp
  const margin    = Math.round((net / totalRev) * 100)
  const cur = CO_MONTHLY[CO_MONTHLY.length - 1]
  const prv = CO_MONTHLY[CO_MONTHLY.length - 2]
  const revChg = Math.round(((cur.a - prv.a) / prv.a) * 100)
  const totalBrokerRev = CO_BROKERS.reduce((s, b) => s + b.revenue, 0)

  return (
    <>
      <KpiCards stats={[
        { label: 'Total Revenue',  value: `$${(totalRev/1000).toFixed(1)}k`,  change: `${revChg >= 0 ? '+' : ''}${revChg}% vs prev`, up: revChg >= 0, color: '#4BAED4', icon: '💰' },
        { label: 'Net Profit',     value: `$${(net/1000).toFixed(1)}k`,        change: `${margin}% margin`,      up: true,  color: '#38C770', icon: '📈' },
        { label: 'Fuel Cost',      value: `$${(totalFuel/1000).toFixed(1)}k`,  change: `${Math.round((totalFuel/totalExp)*100)}% of expenses`, up: false, color: '#EF4444', icon: '⛽' },
        { label: 'Total Loads',    value: String(totalLoad),                   change: `Avg ${Math.round(totalLoad / data.length)}/mo`, up: true, color: '#8B5CF6', icon: '📦' },
      ]} />

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F0F4F8', marginBottom: 4 }}>
        {(['overview', 'trends', 'drivers'] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            border: 'none', background: 'none',
            borderBottom: subTab === t ? '2.5px solid #4BAED4' : '2.5px solid transparent',
            color: subTab === t ? '#4BAED4' : '#718096',
          }}>
            {t === 'overview' ? '📊 Overview' : t === 'trends' ? '📈 Trends' : '👤 Drivers'}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 4 }}>Revenue vs Expenses</h3>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#A0AEC0' }}>Monthly breakdown — {period}</p>
              <DualBarChart data={data} />
            </div>
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 4 }}>Expense Breakdown</h3>
              <p style={{ margin: '0 0 14px', fontSize: 12, color: '#A0AEC0' }}>Total: ${(totalExp/1000).toFixed(1)}k</p>
              <div style={{ height: 28, display: 'flex', borderRadius: 8, overflow: 'hidden', gap: 1, marginBottom: 14 }}>
                {CO_EXPENSES.map(e => (
                  <div key={e.label} style={{ flex: e.value, background: e.color }} title={`${e.label}: ${e.value}%`} />
                ))}
              </div>
              {CO_EXPENSES.map(e => (
                <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: '#2D3748' }}>{e.label}</span>
                  <span style={{ fontSize: 13, color: '#718096' }}>{e.value}%</span>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>{e.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lane Performance */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Lane Performance</h3>
              <span style={{ fontSize: 12, color: '#A0AEC0' }}>Last {period}</span>
            </div>
            <table className="data-table">
              <thead><tr>
                <th>Lane</th><th>Loads</th><th>Avg Rate</th><th>Avg RPM</th><th>Total Revenue</th><th>Share</th><th>Trend</th>
              </tr></thead>
              <tbody>
                {CO_LANES.map((lane, i) => {
                  const total = CO_LANES.reduce((s, l) => s + parseFloat(l.revenue.replace(/[$,]/g, '')), 0)
                  const share = Math.round((parseFloat(lane.revenue.replace(/[$,]/g, '')) / total) * 100)
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>📍 {lane.lane}</td>
                      <td style={{ fontWeight: 600 }}>{lane.loads}</td>
                      <td style={{ fontWeight: 700, color: '#38C770' }}>{lane.avgRate}</td>
                      <td style={{ fontWeight: 700, color: '#8B5CF6' }}>{lane.avgRpm}</td>
                      <td style={{ fontWeight: 700 }}>{lane.revenue}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-wrap" style={{ width: 80, height: 6 }}>
                            <div className="progress-bar" style={{ width: `${share}%`, background: '#4BAED4' }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#718096' }}>{share}%</span>
                        </div>
                      </td>
                      <td><TrendArrow trend={lane.trend} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Broker breakdown */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16 }}>🤝 Revenue by Broker</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {CO_BROKERS.map(b => {
                const pct = Math.round((b.revenue / totalBrokerRev) * 100)
                return (
                  <div key={b.name} style={{ background: '#F7FAFC', borderRadius: 12, padding: '14px 16px', borderTop: `3px solid ${b.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', marginBottom: 8 }}>{b.name}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: b.color }}>${(b.revenue/1000).toFixed(0)}k</div>
                    <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{b.loads} loads · {pct}% share</div>
                    <div style={{ marginTop: 8, height: 4, background: '#E2E8F0', borderRadius: 3 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: b.color, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {subTab === 'trends' && (
        <>
          {/* Revenue trend SVG area chart */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 4 }}>📈 Revenue Trend ({period})</h3>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly gross revenue — area chart</p>
            <SvgAreaChart
              data={data.map(d => d.a)}
              labels={data.map(d => d.month + (d.partial ? '*' : ''))}
              color="#4BAED4"
              height={200}
            />
          </div>

          {/* Fuel cost trend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h3 className="section-title" style={{ margin: 0 }}>⛽ Fuel Cost Trend</h3>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#EF4444' }}>${(totalFuel/1000).toFixed(1)}k</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>total this period</div>
                </div>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly fuel spend</p>
              <SvgAreaChart
                data={data.map(d => d.fuel)}
                labels={data.map(d => d.month)}
                color="#EF4444"
                height={160}
              />
            </div>

            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 4 }}>💹 Net Profit Trend</h3>
              <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly net profit (revenue − expenses)</p>
              <SvgAreaChart
                data={data.map(d => d.a - d.b)}
                labels={data.map(d => d.month)}
                color="#38C770"
                height={160}
              />
            </div>
          </div>

          {/* Load volume trend */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 4 }}>📦 Load Volume Trend</h3>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Loads completed per month</p>
            <BarChart
              data={data.map(d => d.loads)}
              labels={data.map(d => d.month + (d.partial ? '*' : ''))}
              color="#8B5CF6"
            />
          </div>
        </>
      )}

      {subTab === 'drivers' && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>🏆 Driver Performance Rankings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {CO_DRIVERS.map(d => (
              <div key={d.name} style={{
                padding: '16px 18px', borderRadius: 14,
                background: d.rank === 1 ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : d.rank === 2 ? 'linear-gradient(135deg,#F0F4F8,#E2E8F0)' : d.rank === 3 ? 'linear-gradient(135deg,#FEF3C7 50%,#fff)' : '#F7FAFC',
                border: `1.5px solid ${d.rank === 1 ? '#F59E0B' : '#E2E8F0'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{d.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{d.unit}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22 }}>{d.rank === 1 ? '🥇' : d.rank === 2 ? '🥈' : d.rank === 3 ? '🥉' : `#${d.rank}`}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { label: 'Revenue', value: d.revenue, color: '#38C770' },
                    { label: 'RPM', value: d.rpm, color: '#8B5CF6' },
                    { label: 'Loads', value: String(d.loads), color: '#4BAED4' },
                    { label: 'On-Time', value: `${d.onTime}%`, color: d.onTime >= 95 ? '#38C770' : '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '6px 8px', background: 'rgba(255,255,255,.6)', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// OWNER-OP Analytics
// ══════════════════════════════════════════════════════════════════════════════

const OO_MONTHLY = [
  { month: 'Jun', gross: 8800, expenses: 4200, loads: 7, miles: 4800, fuel: 1620 },
  { month: 'Jul', gross: 9400, expenses: 4600, loads: 8, miles: 5200, fuel: 1750 },
  { month: 'Aug', gross: 10200, expenses: 5100, loads: 9, miles: 5600, fuel: 1900 },
  { month: 'Sep', gross: 9600, expenses: 4800, loads: 8, miles: 5100, fuel: 1720 },
  { month: 'Oct', gross: 10800, expenses: 5300, loads: 9, miles: 5900, fuel: 1980 },
  { month: 'Nov', gross: 11200, expenses: 5600, loads: 10, miles: 6200, fuel: 2060 },
  { month: 'Dec', gross: 9800, expenses: 4900, loads: 8, miles: 5400, fuel: 1800 },
  { month: 'Jan', gross: 10400, expenses: 5100, loads: 9, miles: 5700, fuel: 1900 },
  { month: 'Feb', gross: 9200, expenses: 4500, loads: 7, miles: 5000, fuel: 1650 },
  { month: 'Mar', gross: 11600, expenses: 5800, loads: 10, miles: 6400, fuel: 2120 },
  { month: 'Apr', gross: 12200, expenses: 6100, loads: 11, miles: 6800, fuel: 2240 },
  { month: 'May', gross: 8600, expenses: 4200, loads: 7, miles: 4600, fuel: 1580, partial: true },
]

const OO_LANES = [
  { lane: 'Chicago → Dallas',   rpm: '$2.58', loads: 8,  avgRate: '$2,180', trend: 'up'   },
  { lane: 'Chicago → Atlanta',  rpm: '$2.44', loads: 6,  avgRate: '$1,920', trend: 'up'   },
  { lane: 'Dallas → Phoenix',   rpm: '$2.31', loads: 5,  avgRate: '$2,040', trend: 'flat' },
  { lane: 'Nashville → Miami',  rpm: '$2.19', loads: 4,  avgRate: '$1,740', trend: 'down' },
]

const OO_EXPENSES_SPLIT = [
  { label: 'Fuel',         pct: 36, color: '#EF4444' },
  { label: 'Truck Payment',pct: 22, color: '#4BAED4' },
  { label: 'Insurance',    pct: 16, color: '#8B5CF6' },
  { label: 'Maintenance',  pct: 13, color: '#F59E0B' },
  { label: 'Dispatch Fee', pct:  8, color: '#38C770' },
  { label: 'Other',        pct:  5, color: '#A0AEC0' },
]

function OwnerOpAnalytics({ period }: { period: string }) {
  const sliceMap = { '3mo': 3, '6mo': 6, '12mo': 12 }
  const take = sliceMap[period as keyof typeof sliceMap] ?? 6
  const data = OO_MONTHLY.slice(-take)

  const totalGross = data.reduce((s, d) => s + d.gross, 0)
  const totalExp   = data.reduce((s, d) => s + d.expenses, 0)
  const totalLoads = data.reduce((s, d) => s + d.loads, 0)
  const totalMiles = data.reduce((s, d) => s + d.miles, 0)
  const totalFuel  = data.reduce((s, d) => s + d.fuel, 0)
  const net        = totalGross - totalExp
  const margin     = Math.round((net / totalGross) * 100)
  const rpm        = (totalGross / totalMiles).toFixed(2)
  const cur = OO_MONTHLY[OO_MONTHLY.length - 1]
  const prv = OO_MONTHLY[OO_MONTHLY.length - 2]
  const chg = Math.round(((cur.gross - prv.gross) / prv.gross) * 100)

  return (
    <>
      <KpiCards stats={[
        { label: 'Gross Revenue',  value: `$${(totalGross/1000).toFixed(1)}k`, change: `${chg >= 0 ? '+' : ''}${chg}% vs prev`, up: chg >= 0, color: '#4BAED4', icon: '💰' },
        { label: 'Net Take-Home',  value: `$${(net/1000).toFixed(1)}k`,        change: `${margin}% margin`,   up: true,  color: '#38C770', icon: '🏠' },
        { label: 'Total Miles',    value: totalMiles.toLocaleString(),          change: `${Math.round(totalMiles/totalLoads).toLocaleString()} avg/load`, up: true, color: '#8B5CF6', icon: '🛣️' },
        { label: 'Avg RPM',        value: `$${rpm}`,                            change: 'Market avg $2.18',    up: parseFloat(rpm) > 2.18, color: '#F59E0B', icon: '📊' },
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Gross vs Net area chart */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 4 }}>📈 Gross Revenue Trend</h3>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly gross earnings — {period}</p>
          <SvgAreaChart
            data={data.map(d => d.gross)}
            labels={data.map(d => d.month + (d.partial ? '*' : ''))}
            color="#4BAED4"
            height={180}
          />
        </div>

        {/* Expense split */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 4 }}>💸 Expense Split</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#A0AEC0' }}>Total: ${(totalExp/1000).toFixed(1)}k</p>
          <div style={{ height: 24, display: 'flex', borderRadius: 8, overflow: 'hidden', gap: 1, marginBottom: 14 }}>
            {OO_EXPENSES_SPLIT.map(e => (
              <div key={e.label} style={{ flex: e.pct, background: e.color }} title={`${e.label}: ${e.pct}%`} />
            ))}
          </div>
          {OO_EXPENSES_SPLIT.map(e => (
            <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: '#2D3748' }}>{e.label}</span>
              <span style={{ fontSize: 13, color: '#718096' }}>{e.pct}%</span>
              <span style={{ fontSize: 13, fontWeight: 700, minWidth: 56, textAlign: 'right' }}>
                ${Math.round(totalExp * e.pct / 100).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fuel cost trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <h3 className="section-title" style={{ margin: 0 }}>⛽ Fuel Cost Trend</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#EF4444' }}>${(totalFuel/1000).toFixed(1)}k</div>
              <div style={{ fontSize: 11, color: '#A0AEC0' }}>total fuel this period</div>
            </div>
          </div>
          <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly fuel spend</p>
          <SvgAreaChart data={data.map(d => d.fuel)} labels={data.map(d => d.month)} color="#EF4444" height={150} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <h3 className="section-title" style={{ margin: 0 }}>🛣️ Miles per Month</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#8B5CF6' }}>{totalMiles.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#A0AEC0' }}>total miles</div>
            </div>
          </div>
          <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly mileage</p>
          <SvgAreaChart data={data.map(d => d.miles)} labels={data.map(d => d.month)} color="#8B5CF6" height={150} />
        </div>
      </div>

      {/* Top lanes */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 16 }}>🗺️ Top Lanes by RPM</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {OO_LANES.map((lane, i) => (
            <div key={i} style={{
              padding: '16px 18px', borderRadius: 14,
              background: i === 0 ? 'linear-gradient(135deg,#EBF8FF,#BEE3F8)' : '#F7FAFC',
              border: `1.5px solid ${i === 0 ? '#4BAED4' : '#E2E8F0'}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', marginBottom: 8 }}>📍 {lane.lane}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>RPM</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#4BAED4' }}>{lane.rpm}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>Avg Rate</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#38C770' }}>{lane.avgRate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>Loads</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#8B5CF6' }}>{lane.loads}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ height: 4, flex: 1, background: '#E2E8F0', borderRadius: 2, marginRight: 8 }}>
                  <div style={{ width: `${(lane.loads / OO_LANES[0].loads) * 100}%`, height: '100%', background: '#4BAED4', borderRadius: 2 }} />
                </div>
                <TrendArrow trend={lane.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial health snapshot */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#1A2535,#2D3748)', color: '#fff' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#fff' }}>💡 Financial Health Snapshot</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Gross', value: `$${(totalGross/1000).toFixed(1)}k`, color: '#4BAED4' },
            { label: 'Total Expenses', value: `$${(totalExp/1000).toFixed(1)}k`, color: '#EF4444' },
            { label: 'Net Profit', value: `$${(net/1000).toFixed(1)}k`, color: '#38C770' },
            { label: 'Margin', value: `${margin}%`, color: '#F59E0B' },
            { label: 'Cost/Mile', value: `$${(totalExp/totalMiles).toFixed(2)}`, color: '#8B5CF6' },
            { label: 'Rev/Load', value: `$${Math.round(totalGross/totalLoads).toLocaleString()}`, color: '#A78BFA' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DISPATCHER Analytics (12 months)
// ══════════════════════════════════════════════════════════════════════════════

const DI_MONTHLY = [
  { month: 'Jun', commission: 3820, loads: 31, clients: 5 },
  { month: 'Jul', commission: 4140, loads: 34, clients: 6 },
  { month: 'Aug', commission: 4580, loads: 38, clients: 6 },
  { month: 'Sep', commission: 4320, loads: 35, clients: 7 },
  { month: 'Oct', commission: 4960, loads: 41, clients: 7 },
  { month: 'Nov', commission: 5240, loads: 44, clients: 8 },
  { month: 'Dec', commission: 4820, loads: 38, clients: 6 },
  { month: 'Jan', commission: 5210, loads: 42, clients: 7 },
  { month: 'Feb', commission: 4680, loads: 37, clients: 7 },
  { month: 'Mar', commission: 5840, loads: 48, clients: 8 },
  { month: 'Apr', commission: 6120, loads: 51, clients: 9 },
  { month: 'May', commission: 4380, loads: 34, clients: 9, partial: true },
]

const DI_CLIENTS = [
  { name: 'Alex Johnson',    loads: 18, revenue: '$39,600', commission: '$3,960', onTime: 96, trend: 'up',   status: 'active' },
  { name: 'Maria Gonzalez',  loads: 14, revenue: '$30,800', commission: '$3,080', onTime: 94, trend: 'up',   status: 'active' },
  { name: 'Chris Thompson',  loads: 10, revenue: '$22,000', commission: '$2,200', onTime: 91, trend: 'flat', status: 'active' },
  { name: 'Sam Wilson',      loads: 6,  revenue: '$13,200', commission: '$1,320', onTime: 88, trend: 'down', status: 'inactive' },
  { name: 'Linda Park',      loads: 3,  revenue: '$6,600',  commission: '$660',   onTime: 100, trend: 'up', status: 'active' },
]

const DI_LANES = [
  { lane: 'Midwest → Southeast', loads: 22, avgComm: '$220', trend: 'up'   },
  { lane: 'Texas → West Coast',  loads: 16, avgComm: '$195', trend: 'up'   },
  { lane: 'Northeast → South',   loads: 11, avgComm: '$178', trend: 'flat' },
  { lane: 'Plains → Pacific',    loads: 8,  avgComm: '$241', trend: 'down' },
]

function DispatcherAnalytics({ period }: { period: string }) {
  const sliceMap = { '3mo': 3, '6mo': 6, '12mo': 12 }
  const take = sliceMap[period as keyof typeof sliceMap] ?? 6
  const data = DI_MONTHLY.slice(-take)

  const totalComm  = data.reduce((s, d) => s + d.commission, 0)
  const totalLoads = data.reduce((s, d) => s + d.loads, 0)
  const maxClients = Math.max(...data.map(d => d.clients))
  const curComm    = DI_MONTHLY[DI_MONTHLY.length - 1].commission
  const prvComm    = DI_MONTHLY[DI_MONTHLY.length - 2].commission
  const commChg    = Math.round(((curComm - prvComm) / prvComm) * 100)
  const avgConversion = 68

  return (
    <>
      <KpiCards stats={[
        { label: 'Total Commission', value: `$${(totalComm/1000).toFixed(1)}k`, change: `${commChg >= 0 ? '+' : ''}${commChg}% vs prev`, up: commChg >= 0, color: '#4BAED4', icon: '💰' },
        { label: 'Loads Dispatched', value: String(totalLoads),                  change: `Avg ${Math.round(totalLoads/data.length)}/mo`, up: true, color: '#38C770', icon: '📦' },
        { label: 'Active Clients',   value: String(maxClients),                  change: '+2 this month', up: true, color: '#8B5CF6', icon: '🚛' },
        { label: 'Conversion Rate',  value: `${avgConversion}%`,                 change: '+3% vs last month', up: true, color: '#F59E0B', icon: '🎯' },
      ]} />

      {/* Commission area chart */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 4 }}>📈 Commission Earnings Trend</h3>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly net commission — {period}</p>
        <SvgAreaChart
          data={data.map(d => d.commission)}
          labels={data.map(d => d.month + (d.partial ? '*' : ''))}
          color="#4BAED4"
          height={190}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 4 }}>📦 Loads Dispatched</h3>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#A0AEC0' }}>Monthly load count</p>
          <BarChart
            data={data.map(d => d.loads)}
            labels={data.map(d => d.month + (d.partial ? '*' : ''))}
            color="#38C770"
          />
        </div>

        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 4 }}>Loads by Client</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#A0AEC0' }}>This period</p>
          {DI_CLIENTS.map((c, i) => {
            const maxL = Math.max(...DI_CLIENTS.map(x => x.loads))
            const colors = ['#4BAED4', '#38C770', '#8B5CF6', '#F59E0B', '#EF4444']
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: colors[i] + '30', color: colors[i] }}>{c.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{c.name.split(' ')[0]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors[i] }}>{c.loads} loads</span>
                  </div>
                  <HorizontalBar value={c.loads} max={maxL} color={colors[i]} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Client performance table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>Client Performance</h3>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>Last {period}</span>
        </div>
        <table className="data-table">
          <thead><tr>
            <th>Driver / Client</th><th>Loads</th><th>Gross Revenue</th><th>Your Commission</th><th>On-Time %</th><th>Trend</th><th>Status</th>
          </tr></thead>
          <tbody>
            {DI_CLIENTS.map((c, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{c.name.charAt(0)}</div>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>{c.loads}</td>
                <td style={{ fontWeight: 700, color: '#2D3748' }}>{c.revenue}</td>
                <td style={{ fontWeight: 800, color: '#38C770' }}>{c.commission}</td>
                <td>
                  <span style={{ fontWeight: 700, color: c.onTime >= 95 ? '#38C770' : c.onTime >= 90 ? '#F59E0B' : '#EF4444' }}>
                    {c.onTime}%
                  </span>
                </td>
                <td><TrendArrow trend={c.trend} /></td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                    background: c.status === 'active' ? '#38C77015' : '#EF444415',
                    color: c.status === 'active' ? '#38C770' : '#EF4444' }}>
                    {c.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top lanes */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 16 }}>🗺️ Top Lanes by Commission</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {DI_LANES.map((lane, i) => (
            <div key={i} style={{ padding: '16px 18px', borderRadius: 14, background: '#F7FAFC', border: '1.5px solid #E2E8F0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', marginBottom: 6 }}>📍 {lane.lane}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>Loads</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#4BAED4' }}>{lane.loads}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>Avg Commission</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#38C770' }}>{lane.avgComm}</div>
                </div>
                <TrendArrow trend={lane.trend} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SHIPPER Analytics (12 months)
// ══════════════════════════════════════════════════════════════════════════════

const SH_MONTHLY = [
  { month: 'Jun', spend: 22800, shipments: 18 },
  { month: 'Jul', spend: 25400, shipments: 21 },
  { month: 'Aug', spend: 29200, shipments: 24 },
  { month: 'Sep', spend: 27600, shipments: 22 },
  { month: 'Oct', spend: 31100, shipments: 26 },
  { month: 'Nov', spend: 33400, shipments: 28 },
  { month: 'Dec', spend: 28400, shipments: 22 },
  { month: 'Jan', spend: 31200, shipments: 26 },
  { month: 'Feb', spend: 26800, shipments: 21 },
  { month: 'Mar', spend: 34600, shipments: 29 },
  { month: 'Apr', spend: 38100, shipments: 33 },
  { month: 'May', spend: 21400, shipments: 17, partial: true },
]

const SH_CARRIERS = [
  { name: 'FastLane Logistics',   loads: 18, onTime: 97, rating: 4.9, spend: '$38,600', avgRate: '$2,145', trend: 'up'   },
  { name: 'Star Transport Co.',   loads: 12, onTime: 92, rating: 4.6, spend: '$24,000', avgRate: '$2,000', trend: 'flat' },
  { name: 'Pacific Freight Inc.', loads: 8,  onTime: 88, rating: 4.3, spend: '$17,600', avgRate: '$2,200', trend: 'down' },
  { name: 'MidWest Haulers',      loads: 6,  onTime: 100, rating: 5.0, spend: '$11,400', avgRate: '$1,900', trend: 'up'  },
]

const SH_LANES = [
  { lane: 'Chicago → Dallas',    shipments: 14, avgCost: '$2,180', spend: '$30,520', onTime: 95, trend: 'up'   },
  { lane: 'LA → Phoenix',        shipments: 11, avgCost: '$880',   spend: '$9,680',  onTime: 91, trend: 'flat' },
  { lane: 'Atlanta → Miami',     shipments: 9,  avgCost: '$1,240', spend: '$11,160', onTime: 89, trend: 'up'   },
  { lane: 'Dallas → Houston',    shipments: 7,  avgCost: '$620',   spend: '$4,340',  onTime: 100, trend: 'up'  },
]

function ShipperAnalytics({ period }: { period: string }) {
  const sliceMap = { '3mo': 3, '6mo': 6, '12mo': 12 }
  const take = sliceMap[period as keyof typeof sliceMap] ?? 6
  const data = SH_MONTHLY.slice(-take)

  const totalSpend     = data.reduce((s, d) => s + d.spend, 0)
  const totalShipments = data.reduce((s, d) => s + d.shipments, 0)
  const avgOnTime      = Math.round(SH_CARRIERS.reduce((s, c) => s + c.onTime, 0) / SH_CARRIERS.length)
  const cur = SH_MONTHLY[SH_MONTHLY.length - 1]
  const prv = SH_MONTHLY[SH_MONTHLY.length - 2]
  const spendChg = Math.round(((cur.spend - prv.spend) / prv.spend) * 100)

  return (
    <>
      <KpiCards stats={[
        { label: 'Total Spend',      value: `$${(totalSpend/1000).toFixed(1)}k`, change: `${spendChg >= 0 ? '+' : ''}${spendChg}% vs prev`, up: spendChg < 0, color: '#4BAED4', icon: '💳' },
        { label: 'Shipments',        value: String(totalShipments),               change: `Avg ${Math.round(totalShipments/data.length)}/mo`, up: true, color: '#38C770', icon: '📦' },
        { label: 'On-Time Delivery', value: `${avgOnTime}%`,                      change: '+2% vs last month', up: true, color: '#8B5CF6', icon: '⏱️' },
        { label: 'Avg Cost/Load',    value: `$${(totalSpend/totalShipments).toFixed(0)}`, change: 'Market avg $2,100', up: false, color: '#F59E0B', icon: '📊' },
      ]} />

      {/* Spend trend SVG chart */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 4 }}>💳 Shipping Spend Trend</h3>
        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#A0AEC0' }}>Monthly freight costs — {period}</p>
        <SvgAreaChart
          data={data.map(d => d.spend)}
          labels={data.map(d => d.month + (d.partial ? '*' : ''))}
          color="#4BAED4"
          height={190}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 16 }}>Carrier Performance Report</h3>
          <table className="data-table">
            <thead><tr>
              <th>Carrier</th><th>Loads</th><th>Spend</th><th>Avg Rate</th><th>On-Time</th><th>Rating</th><th>Trend</th>
            </tr></thead>
            <tbody>
              {SH_CARRIERS.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>🚛 {c.name}</td>
                  <td>{c.loads}</td>
                  <td style={{ fontWeight: 700 }}>{c.spend}</td>
                  <td style={{ fontWeight: 700, color: '#4BAED4' }}>{c.avgRate}</td>
                  <td><span style={{ fontWeight: 700, color: c.onTime >= 95 ? '#38C770' : c.onTime >= 90 ? '#F59E0B' : '#EF4444' }}>{c.onTime}%</span></td>
                  <td><span style={{ fontWeight: 700, color: '#F59E0B' }}>★ {c.rating}</span></td>
                  <td><TrendArrow trend={c.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 4 }}>Delivery Performance</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#A0AEC0' }}>On-time rate by carrier</p>
          {SH_CARRIERS.map((c, i) => {
            const colors = ['#38C770', '#4BAED4', '#F59E0B', '#8B5CF6']
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: c.onTime >= 95 ? '#38C770' : c.onTime >= 90 ? '#F59E0B' : '#EF4444' }}>{c.onTime}%</span>
                </div>
                <HorizontalBar value={c.onTime} max={100} color={colors[i]} />
              </div>
            )
          })}
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#F7FAFC', borderRadius: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#718096' }}>Fleet avg</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#38C770' }}>{avgOnTime}% on-time</span>
          </div>
        </div>
      </div>

      {/* Lane spend */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 16 }}>🗺️ Spend by Lane</h3>
        <table className="data-table">
          <thead><tr>
            <th>Lane</th><th>Shipments</th><th>Total Spend</th><th>Avg Cost</th><th>On-Time %</th><th>Trend</th>
          </tr></thead>
          <tbody>
            {SH_LANES.map((l, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>📍 {l.lane}</td>
                <td>{l.shipments}</td>
                <td style={{ fontWeight: 700 }}>{l.spend}</td>
                <td style={{ fontWeight: 700, color: '#4BAED4' }}>{l.avgCost}</td>
                <td><span style={{ fontWeight: 700, color: l.onTime >= 95 ? '#38C770' : l.onTime >= 90 ? '#F59E0B' : '#EF4444' }}>{l.onTime}%</span></td>
                <td><TrendArrow trend={l.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// REVENUE FORECAST Tab (company + owner-op)
// ══════════════════════════════════════════════════════════════════════════════

type ForecastScenario = 'bear' | 'base' | 'bull'

const FORECAST_SCENARIOS: Record<ForecastScenario, {
  label: string
  icon: string
  revMultiplier: number
  expMultiplier: number
  description: string[]
}> = {
  bear: {
    label: 'Bear',
    icon: '🐻',
    revMultiplier: 0.85,
    expMultiplier: 1.20,
    description: [
      'Revenue down 15% — spot market softening',
      'Fuel costs up 20% — diesel spike scenario',
      '1 truck down for major repair (est. 3 weeks)',
      'Driver turnover adds ~$8k replacement cost',
    ],
  },
  base: {
    label: 'Base',
    icon: '📊',
    revMultiplier: 1.0,
    expMultiplier: 1.0,
    description: [
      'Current AI forecast — 87% historical accuracy',
      'Fuel costs follow EIA projection (+3¢/gal)',
      'All trucks operational, standard utilization',
      'New shipper contract starts June 2026',
    ],
  },
  bull: {
    label: 'Bull',
    icon: '🚀',
    revMultiplier: 1.20,
    expMultiplier: 0.97,
    description: [
      'Revenue up 20% — two new shipper contracts',
      'Fuel hedged at current rates through Q3',
      'Fleet at 95%+ utilization, all trucks running',
      'Driver retention bonus pays off — zero turnover',
    ],
  },
}

const FORECAST_DRIVERS = [
  { driver: 'Seasonal demand (summer)', impact: '+8.2%', positive: true, confidence: 'High',   confPct: 92, detail: 'Historical Q3 growth pattern — consistent 3 yrs' },
  { driver: 'Fuel cost trend',          impact: '-2.1%', positive: false, confidence: 'Medium', confPct: 68, detail: 'EIA forecast: +3¢/gal diesel expected by Aug' },
  { driver: 'Fleet expansion (+2 trucks)', impact: '+6.4%', positive: true, confidence: 'High', confPct: 95, detail: 'Confirmed Q2 additions, units operational' },
  { driver: 'Driver retention improvement', impact: '+1.8%', positive: true, confidence: 'Medium', confPct: 71, detail: 'Reduced turnover cost vs prior year' },
  { driver: 'Rate market softening',    impact: '-3.0%', positive: false, confidence: 'Low',    confPct: 44, detail: 'DAT spot rate index declining past 6 weeks' },
  { driver: 'New shipper contract',     impact: '+4.5%', positive: true, confidence: 'High',   confPct: 98, detail: 'Signed May 2026, starts June — $42k/mo' },
]

const FORECAST_ALERTS = [
  {
    icon: '📈',
    color: '#38C770',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    title: 'Q3 historically your strongest quarter',
    body: 'Your last 3 years show consistent +8–12% revenue lift in Jul–Sep driven by retail and construction freight. Position capacity now.',
  },
  {
    icon: '⚠️',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: 'Diesel prices rising — review fuel surcharge',
    body: 'EIA projects diesel averaging $4.18/gal by July. A 3¢ increase costs ~$2,400/month at your current mileage. Consider FSC adjustment.',
  },
  {
    icon: '✅',
    color: '#4BAED4',
    bg: '#EFF9FF',
    border: '#BAE6FD',
    title: 'New shipper contract adds ~$42k/month starting June',
    body: 'The contract signed May 2026 contributes $42,000/month in guaranteed revenue starting June 1. This is already baked into the base forecast.',
  },
  {
    icon: '💡',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    title: 'Driver #4 renewal coming up — prioritize retention',
    body: 'James Carter (Unit 03) is your highest-revenue driver at $18.2k/mo. His contract renews in 6 weeks. Retention bonus ROI estimated at 4:1.',
  },
]

// Combined Actual + Forecast SVG Chart
function ForecastAreaChart({ scenario }: { scenario: ForecastScenario }) {
  const mult = FORECAST_SCENARIOS[scenario].revMultiplier
  const expMult = FORECAST_SCENARIOS[scenario].expMultiplier

  // Jan–Jun actual, Jul–Sep forecast
  const revActual  = [310, 298, 342, 356, 371, 382]
  const expActual  = [198, 192, 210, 215, 218, 224]
  const revForecast = [398, 421, 447].map(v => Math.round(v * mult))
  const expForecast = [228, 231, 235].map(v => Math.round(v * expMult))

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const allRev = [...revActual, ...revForecast]
  const allExp = [...expActual, ...expForecast]

  const W = 600
  const H = 220
  const padL = 40
  const padR = 16
  const padT = 16
  const padB = 32
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const allVals = [...allRev, ...allExp]
  const maxV = Math.max(...allVals)
  const minV = Math.min(...allVals) * 0.85

  const xOf = (i: number) => padL + (i / (labels.length - 1)) * chartW
  const yOf = (v: number) => padT + chartH - ((v - minV) / (maxV - minV)) * chartH

  // Build polyline points
  const revPts   = allRev.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')
  const expPts   = allExp.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')

  // Actual area (0..5)
  const revActualPts  = revActual.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')
  const expActualPts  = expActual.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')
  const revActualArea = `${xOf(0)},${yOf(minV)} ${revActualPts} ${xOf(5)},${yOf(minV)}`
  const expActualArea = `${xOf(0)},${yOf(minV)} ${expActualPts} ${xOf(5)},${yOf(minV)}`

  // Forecast area (5..8)
  const revForecastPts  = revForecast.map((v, i) => `${xOf(i + 6)},${yOf(v)}`).join(' ')
  const expForecastPts  = expForecast.map((v, i) => `${xOf(i + 6)},${yOf(v)}`).join(' ')
  const revForecastArea = `${xOf(5)},${yOf(minV)} ${xOf(5)},${yOf(allRev[5])} ${revForecastPts} ${xOf(8)},${yOf(minV)}`
  const expForecastArea = `${xOf(5)},${yOf(minV)} ${xOf(5)},${yOf(allExp[5])} ${expForecastPts} ${xOf(8)},${yOf(minV)}`

  // Confidence band (±10%) for revenue forecast
  const bandTopPts = revForecast.map((v, i) => `${xOf(i + 6)},${yOf(v * 1.1)}`).join(' ')
  const bandBotPts = revForecast.map((v, i) => `${xOf(i + 6)},${yOf(v * 0.9)}`).join(' ').split(' ').reverse().join(' ')
  const bandStart  = `${xOf(5)},${yOf(allRev[5] * 1.05)}`
  const bandEnd    = `${xOf(5)},${yOf(allRev[5] * 0.95)}`
  const confBand   = `${bandStart} ${bandTopPts} ${bandBotPts} ${bandEnd}`

  // Vertical divider x
  const divX = xOf(5.5)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 240 }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="fcRevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4BAED4" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#4BAED4" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="fcExpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="fcRevFcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4BAED4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4BAED4" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="fcExpFcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Forecast background zone */}
      <rect x={xOf(5.5)} y={padT - 4} width={xOf(8) - xOf(5.5) + padR} height={chartH + 8} fill="#F0F4F8" opacity="0.6" rx="4" />

      {/* Confidence band */}
      <polygon points={confBand} fill="#4BAED4" fillOpacity="0.10" />

      {/* Actual areas */}
      <polygon points={revActualArea} fill="url(#fcRevGrad)" />
      <polygon points={expActualArea} fill="url(#fcExpGrad)" />

      {/* Forecast areas */}
      <polygon points={revForecastArea} fill="url(#fcRevFcGrad)" />
      <polygon points={expForecastArea} fill="url(#fcExpFcGrad)" />

      {/* Revenue line — actual solid */}
      <polyline
        points={revActual.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')}
        fill="none" stroke="#4BAED4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Revenue line — forecast dashed */}
      <polyline
        points={[`${xOf(5)},${yOf(allRev[5])}`, ...revForecast.map((v, i) => `${xOf(i + 6)},${yOf(v)}`)].join(' ')}
        fill="none" stroke="#4BAED4" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Expense line — actual solid */}
      <polyline
        points={expActual.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ')}
        fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Expense line — forecast dashed */}
      <polyline
        points={[`${xOf(5)},${yOf(allExp[5])}`, ...expForecast.map((v, i) => `${xOf(i + 6)},${yOf(v)}`)].join(' ')}
        fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Vertical divider */}
      <line x1={divX} y1={padT} x2={divX} y2={padT + chartH} stroke="#A0AEC0" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={divX + 4} y={padT + 14} fontSize="9" fill="#A0AEC0" fontWeight="700">TODAY</text>

      {/* FORECAST watermark */}
      <text x={(divX + xOf(8)) / 2} y={padT + chartH / 2 + 6} textAnchor="middle" fontSize="13" fill="#A0AEC0" fontWeight="900" opacity="0.35" letterSpacing="3">FORECAST</text>

      {/* Dots — actual */}
      {revActual.map((v, i) => (
        <circle key={`ra${i}`} cx={xOf(i)} cy={yOf(v)} r={3.5} fill="#fff" stroke="#4BAED4" strokeWidth="2" />
      ))}
      {expActual.map((v, i) => (
        <circle key={`ea${i}`} cx={xOf(i)} cy={yOf(v)} r={3} fill="#fff" stroke="#EF4444" strokeWidth="1.5" />
      ))}

      {/* Dots — forecast hollow */}
      {revForecast.map((v, i) => (
        <circle key={`rf${i}`} cx={xOf(i + 6)} cy={yOf(v)} r={3.5} fill="#EFF9FF" stroke="#4BAED4" strokeWidth="2" strokeDasharray="3 2" />
      ))}
      {expForecast.map((v, i) => (
        <circle key={`ef${i}`} cx={xOf(i + 6)} cy={yOf(v)} r={3} fill="#FFF5F5" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
      ))}

      {/* X-axis labels */}
      {labels.map((lbl, i) => (
        <text key={lbl} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="10" fill={i >= 6 ? '#4BAED4' : '#718096'} fontWeight={i >= 6 ? '700' : '600'}>
          {lbl}
        </text>
      ))}

      {/* Y-axis labels (right side) */}
      {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
        <text key={i} x={padL - 4} y={yOf(v) + 4} textAnchor="end" fontSize="9" fill="#A0AEC0">
          ${(v).toFixed(0)}k
        </text>
      ))}

      {/* Legend */}
      <rect x={padL} y={padT + 2} width={10} height={10} rx="2" fill="#4BAED4" />
      <text x={padL + 14} y={padT + 11} fontSize="10" fill="#2D3748" fontWeight="600">Revenue</text>
      <rect x={padL + 74} y={padT + 2} width={10} height={10} rx="2" fill="#EF4444" opacity="0.7" />
      <text x={padL + 88} y={padT + 11} fontSize="10" fill="#2D3748" fontWeight="600">Expenses</text>
      <line x1={padL + 158} y1={padT + 7} x2={padL + 176} y2={padT + 7} stroke="#A0AEC0" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={padL + 180} y={padT + 11} fontSize="10" fill="#718096">= Forecast</text>
      <rect x={padL + 248} y={padT + 2} width={10} height={10} rx="2" fill="#4BAED4" opacity="0.25" />
      <text x={padL + 262} y={padT + 11} fontSize="10" fill="#718096">Confidence band ±10%</text>
    </svg>
  )
}

function RevenueForecastTab({ role }: { role: UserRole }) {
  const [scenario, setScenario] = useState<ForecastScenario>('base')
  const sc = FORECAST_SCENARIOS[scenario]

  // Base KPI numbers
  const baseKpis = {
    revenue: 485200,
    expenses: 298400,
    profit: 186800,
    accuracy: 87,
  }
  const projRev  = Math.round(baseKpis.revenue  * sc.revMultiplier)
  const projExp  = Math.round(baseKpis.expenses * sc.expMultiplier)
  const projProfit = projRev - projExp
  const profitPct = Math.round((projProfit / projRev) * 100)

  // Monthly breakdown (Jul / Aug / Sep)
  const baseMonthly = [
    { month: 'July 2026',      rev: 398000, exp: 228000, loads: 52, avgRate: 7654, conf: 91 },
    { month: 'August 2026',    rev: 421000, exp: 231000, loads: 55, avgRate: 7655, conf: 87 },
    { month: 'September 2026', rev: 447000, exp: 235000, loads: 58, avgRate: 7707, conf: 82 },
  ]

  const scenarioMonthly = baseMonthly.map(m => ({
    ...m,
    rev:  Math.round(m.rev  * sc.revMultiplier),
    exp:  Math.round(m.exp  * sc.expMultiplier),
    net:  Math.round((m.rev * sc.revMultiplier) - (m.exp * sc.expMultiplier)),
    loads: Math.round(m.loads * sc.revMultiplier),
  }))

  const confColor = (c: number) => c >= 85 ? '#38C770' : c >= 70 ? '#F59E0B' : '#EF4444'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── AI Header ─────────────────────────────────────────────────── */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#EFF9FF 0%,#F5F3FF 100%)', border: '1.5px solid #BAE6FD' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#1A2535' }}>🤖 AI-Powered Revenue Forecast</h3>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                background: 'linear-gradient(90deg,#4BAED4,#8B5CF6)', color: '#fff', letterSpacing: '0.5px',
              }}>✨ AI-Powered</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#4A5568', maxWidth: 560 }}>
              Based on your 12-month performance history, seasonality patterns, and current market trends.
              Model trained on your actual lane data, fuel costs, and driver metrics.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>LAST UPDATED</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>May 12, 2026</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>CONFIDENCE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#4BAED4' }}>87%</div>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', border: '3px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              🔮
            </div>
          </div>
        </div>
      </div>

      {/* ── 3-Month Forecast KPI Cards ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Projected Revenue',  value: `$${(projRev/1000).toFixed(0)}k`,    change: scenario === 'base' ? '+12% vs current qtr' : scenario === 'bull' ? '+26% vs current qtr' : '-5% vs current qtr',    up: scenario !== 'bear', color: '#4BAED4', icon: '💰' },
          { label: 'Projected Expenses', value: `$${(projExp/1000).toFixed(0)}k`,    change: scenario === 'base' ? '-3% optimized' : scenario === 'bull' ? '-5% optimized' : '+15% cost pressure',                  up: scenario !== 'bear', color: '#EF4444', icon: '📉' },
          { label: 'Projected Net Profit',value: `$${(projProfit/1000).toFixed(0)}k`, change: `${profitPct}% margin — ${scenario === 'base' ? '+18%' : scenario === 'bull' ? '+38%' : '-22%'} vs last qtr`, up: scenario !== 'bear', color: '#38C770', icon: '📈' },
          { label: 'Forecast Accuracy',  value: '87%',                               change: 'Based on 6mo back-testing',                                                                                             up: true, color: '#8B5CF6', icon: '🎯' },
        ].map(st => (
          <div key={st.label} style={{ padding: '16px 18px', borderRadius: 14, background: '#fff', border: '1.5px solid #F0F4F8', borderTop: `3px solid ${st.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{st.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: st.up ? '#38C77015' : '#EF444415', color: st.up ? '#38C770' : '#EF4444' }}>
                {st.change}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1A2535', marginBottom: 2 }}>{st.value}</div>
            <div style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── Combined Actual + Forecast Chart ─────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Revenue & Expense Forecast Chart</h3>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#A0AEC0' }}>
              6 months actual (Jan–Jun) + 3 months forecast (Jul–Sep) — {FORECAST_SCENARIOS[scenario].icon} {FORECAST_SCENARIOS[scenario].label} scenario
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['bear', 'base', 'bull'] as ForecastScenario[]).map(s => (
              <button key={s} onClick={() => setScenario(s)} style={{
                padding: '5px 12px', borderRadius: 8, fontWeight: 700, fontSize: 12,
                border: `1.5px solid ${scenario === s ? '#4BAED4' : '#E2E8F0'}`,
                background: scenario === s ? '#EFF9FF' : '#fff',
                color: scenario === s ? '#4BAED4' : '#718096',
                cursor: 'pointer',
              }}>
                {FORECAST_SCENARIOS[s].icon} {FORECAST_SCENARIOS[s].label}
              </button>
            ))}
          </div>
        </div>
        <ForecastAreaChart scenario={scenario} />
      </div>

      {/* ── Forecast Drivers Table ────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 4 }}>🧠 Forecast Drivers</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#A0AEC0' }}>Key factors influencing the 3-month projection</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Revenue Impact</th>
              <th>Confidence</th>
              <th>Confidence Level</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {FORECAST_DRIVERS.map((d, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: '#1A2535' }}>{d.driver}</td>
                <td>
                  <span style={{
                    fontSize: 13, fontWeight: 800, padding: '3px 10px', borderRadius: 99,
                    background: d.positive ? '#38C77018' : '#EF444418',
                    color: d.positive ? '#38C770' : '#EF4444',
                  }}>
                    {d.impact}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: d.confidence === 'High' ? '#38C77015' : d.confidence === 'Medium' ? '#F59E0B15' : '#EF444415',
                    color: d.confidence === 'High' ? '#38C770' : d.confidence === 'Medium' ? '#F59E0B' : '#EF4444',
                  }}>
                    {d.confidence}
                  </span>
                </td>
                <td style={{ minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: '#F0F4F8', borderRadius: 3 }}>
                      <div style={{
                        width: `${d.confPct}%`, height: '100%', borderRadius: 3,
                        background: d.confPct >= 85 ? '#38C770' : d.confPct >= 60 ? '#F59E0B' : '#EF4444',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#718096', minWidth: 28 }}>{d.confPct}%</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: '#718096' }}>{d.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Scenario Modeling ─────────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 4 }}>🎲 Scenario Modeling — What-If Analysis</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#A0AEC0' }}>Switch scenarios to model different market conditions</p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {(['bear', 'base', 'bull'] as ForecastScenario[]).map(s => {
            const active = scenario === s
            const colors: Record<ForecastScenario, string> = { bear: '#EF4444', base: '#4BAED4', bull: '#38C770' }
            return (
              <button key={s} onClick={() => setScenario(s)} style={{
                flex: 1, padding: '14px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${active ? colors[s] : '#E2E8F0'}`,
                background: active ? `${colors[s]}12` : '#FAFAFA',
                transition: 'all 0.18s',
              }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{FORECAST_SCENARIOS[s].icon}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: active ? colors[s] : '#718096' }}>
                  {FORECAST_SCENARIOS[s].label}
                </div>
                <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>
                  {s === 'bear' ? 'Rev −15%, Fuel +20%' : s === 'base' ? 'Current projection' : 'Rev +20%, 2 contracts'}
                </div>
              </button>
            )
          })}
        </div>

        {/* Scenario assumptions */}
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: scenario === 'bear' ? '#FFF5F5' : scenario === 'bull' ? '#F0FDF4' : '#EFF9FF',
          border: `1.5px solid ${scenario === 'bear' ? '#FCA5A5' : scenario === 'bull' ? '#86EFAC' : '#BAE6FD'}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535', marginBottom: 8 }}>
            {FORECAST_SCENARIOS[scenario].icon} {FORECAST_SCENARIOS[scenario].label} Scenario Assumptions
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {FORECAST_SCENARIOS[scenario].description.map((line, i) => (
              <li key={i} style={{ fontSize: 13, color: '#4A5568' }}>{line}</li>
            ))}
          </ul>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: '#718096' }}>3-Month Revenue: </span>
              <span style={{ fontWeight: 900, color: '#1A2535' }}>${(projRev / 1000).toFixed(0)}k</span>
            </div>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: '#718096' }}>Net Profit: </span>
              <span style={{ fontWeight: 900, color: projProfit > 150000 ? '#38C770' : '#EF4444' }}>${(projProfit / 1000).toFixed(0)}k</span>
            </div>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: '#718096' }}>Margin: </span>
              <span style={{ fontWeight: 900, color: '#4BAED4' }}>{profitPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Monthly Breakdown Table ───────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 4 }}>📅 Monthly Breakdown — Next 3 Months</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#A0AEC0' }}>
          {FORECAST_SCENARIOS[scenario].icon} {FORECAST_SCENARIOS[scenario].label} scenario projections
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Rev Forecast</th>
              <th>Exp Forecast</th>
              <th>Net Profit</th>
              <th>Est. Loads</th>
              <th>Avg Rate/Load</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {scenarioMonthly.map((m, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: '#1A2535' }}>{m.month}</td>
                <td style={{ fontWeight: 800, color: '#4BAED4' }}>${(m.rev / 1000).toFixed(0)}k</td>
                <td style={{ fontWeight: 700, color: '#EF4444' }}>${(m.exp / 1000).toFixed(0)}k</td>
                <td style={{ fontWeight: 800, color: m.net > 0 ? '#38C770' : '#EF4444' }}>${(m.net / 1000).toFixed(0)}k</td>
                <td style={{ fontWeight: 600 }}>{m.loads}</td>
                <td style={{ fontWeight: 700, color: '#8B5CF6' }}>${Math.round(m.rev / m.loads).toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 52, height: 6, background: '#F0F4F8', borderRadius: 3 }}>
                      <div style={{ width: `${m.conf}%`, height: '100%', borderRadius: 3, background: confColor(m.conf) }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: confColor(m.conf) }}>{m.conf}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 11, color: '#A0AEC0', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#38C770' }} /> High confidence ≥85%
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} /> Medium 70–84%
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> Low &lt;70%
          </span>
        </div>
      </div>

      {/* ── AI Insights & Alerts ──────────────────────────────────────── */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 4 }}>💬 AI Insights & Recommendations</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#A0AEC0' }}>Actionable recommendations based on your forecast data</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FORECAST_ALERTS.map((alert, i) => (
            <div key={i} style={{
              padding: '14px 18px', borderRadius: 12,
              background: alert.bg, border: `1.5px solid ${alert.border}`,
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{alert.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: alert.color, marginBottom: 4 }}>{alert.title}</div>
                <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.5 }}>{alert.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <div style={{ padding: '10px 16px', borderRadius: 10, background: '#F7FAFC', border: '1px solid #E2E8F0' }}>
        <p style={{ margin: 0, fontSize: 11, color: '#A0AEC0', lineHeight: 1.6 }}>
          <strong style={{ color: '#718096' }}>Forecast Disclaimer:</strong> Projections are generated using historical performance data,
          seasonal indices, and third-party market signals (EIA, DAT). Actual results may vary.
          Forecast accuracy of 87% is based on 6-month back-testing against verified actuals.
          Model last retrained May 12, 2026.
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Export
// ══════════════════════════════════════════════════════════════════════════════

interface Props { role?: UserRole }

export default function AnalyticsPage({ role = 'company' }: Props) {
  const [period, setPeriod] = useState<'3mo' | '6mo' | '12mo'>('6mo')
  const [mainTab, setMainTab] = useState<'analytics' | 'forecast'>('analytics')

  const showForecast = role === 'company' || role === 'owner-op'

  const titles: Record<string, string> = {
    company:    '📊 Analytics',
    dispatcher: '📊 My Analytics',
    shipper:    '📊 Shipping Reports',
    'owner-op': '📊 My Performance',
  }

  const subtitles: Record<string, string> = {
    company:    'Fleet & business performance overview',
    dispatcher: 'Commission earnings & client metrics',
    shipper:    'Shipping spend & carrier performance',
    'owner-op': 'Earnings, miles & route efficiency',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>{titles[role]}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>{subtitles[role]}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {mainTab === 'analytics' && <PeriodSelector period={period} setPeriod={setPeriod} />}
          <button className="btn btn-secondary btn-sm">📤 Export</button>
        </div>
      </div>

      {/* Main tab switcher (Analytics | Forecast) */}
      {showForecast && (
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #F0F4F8' }}>
          <button onClick={() => setMainTab('analytics')} style={{
            padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            border: 'none', background: 'none',
            borderBottom: mainTab === 'analytics' ? '2.5px solid #4BAED4' : '2.5px solid transparent',
            color: mainTab === 'analytics' ? '#4BAED4' : '#718096',
          }}>
            📊 Analytics
          </button>
          <button onClick={() => setMainTab('forecast')} style={{
            padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            border: 'none', background: 'none',
            borderBottom: mainTab === 'forecast' ? '2.5px solid #4BAED4' : '2.5px solid transparent',
            color: mainTab === 'forecast' ? '#4BAED4' : '#718096',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🔮 Revenue Forecast
            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: 'linear-gradient(90deg,#4BAED4,#8B5CF6)', color: '#fff' }}>AI</span>
          </button>
        </div>
      )}

      {/* Tab content */}
      {(!showForecast || mainTab === 'analytics') && (
        <>
          {role === 'company'    && <CompanyAnalytics    period={period} />}
          {role === 'dispatcher' && <DispatcherAnalytics period={period} />}
          {role === 'shipper'    && <ShipperAnalytics    period={period} />}
          {role === 'owner-op'   && <OwnerOpAnalytics    period={period} />}
        </>
      )}
      {showForecast && mainTab === 'forecast' && <RevenueForecastTab role={role} />}
    </div>
  )
}
