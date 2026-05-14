import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type FilterTab = 'all' | 'active' | 'history' | 'hot'

type Lane = {
  id: number
  from: string
  to: string
  fromCode: string
  toCode: string
  datAvg: number
  yourRate: number
  vsPct: number          // signed %
  trend: string
  trendDir: 'up' | 'down' | 'flat'
  volume: 'High' | 'Medium' | 'Low'
  action: string
  actionType: 'find' | 'negotiate' | 'avoid'
  miles: number
  truckstopAvg: number
  tqlSpread: string
  openingAsk: number
  walkAway: number
  bestTime: string
  trend4w: number[]
  weeklyChangePct: number
}

type Alert = {
  id: number
  lane: string
  threshold: number
  current: number
  status: 'close' | 'near' | 'watch'
}

// ── Data ─────────────────────────────────────────────────────────────────────
const LANES: Lane[] = [
  {
    id: 1, from: 'Chicago', to: 'Dallas', fromCode: 'CHI', toCode: 'DAL',
    datAvg: 2.44, yourRate: 2.32, vsPct: -5.0,
    trend: '↑ Up 8% wk', trendDir: 'up', volume: 'High', action: 'Find Load', actionType: 'find',
    miles: 1201, truckstopAvg: 2.41, tqlSpread: '12–18%', openingAsk: 2.65, walkAway: 2.40,
    bestTime: 'Tue–Thu 9–11 AM', trend4w: [2.27, 2.31, 2.38, 2.44], weeklyChangePct: 8,
  },
  {
    id: 2, from: 'Dallas', to: 'Chicago', fromCode: 'DAL', toCode: 'CHI',
    datAvg: 2.91, yourRate: 3.09, vsPct: 6.2,
    trend: '↑ Up 12%', trendDir: 'up', volume: 'High', action: 'Find Load', actionType: 'find',
    miles: 1201, truckstopAvg: 2.88, tqlSpread: '10–15%', openingAsk: 3.20, walkAway: 2.85,
    bestTime: 'Mon–Wed 8–10 AM', trend4w: [2.60, 2.72, 2.85, 2.91], weeklyChangePct: 12,
  },
  {
    id: 3, from: 'Miami', to: 'Atlanta', fromCode: 'MIA', toCode: 'ATL',
    datAvg: 2.38, yourRate: 2.45, vsPct: 2.9,
    trend: '→ Stable', trendDir: 'flat', volume: 'Medium', action: 'Find Load', actionType: 'find',
    miles: 800, truckstopAvg: 2.36, tqlSpread: '12–16%', openingAsk: 2.55, walkAway: 2.30,
    bestTime: 'Mon–Fri 10 AM–12 PM', trend4w: [2.34, 2.36, 2.38, 2.38], weeklyChangePct: 0,
  },
  {
    id: 4, from: 'Los Angeles', to: 'Sacramento', fromCode: 'LAX', toCode: 'SAC',
    datAvg: 2.55, yourRate: 2.89, vsPct: 13.3,
    trend: '↑ Hot', trendDir: 'up', volume: 'Low', action: 'Find Load', actionType: 'find',
    miles: 380, truckstopAvg: 2.52, tqlSpread: '15–20%', openingAsk: 2.95, walkAway: 2.55,
    bestTime: 'Tue–Thu 9 AM–12 PM', trend4w: [2.30, 2.40, 2.50, 2.55], weeklyChangePct: 14,
  },
  {
    id: 5, from: 'Atlanta', to: 'Indianapolis', fromCode: 'ATL', toCode: 'IND',
    datAvg: 2.61, yourRate: 2.92, vsPct: 11.9,
    trend: '↑ Up', trendDir: 'up', volume: 'Medium', action: 'Find Load', actionType: 'find',
    miles: 730, truckstopAvg: 2.58, tqlSpread: '12–17%', openingAsk: 3.00, walkAway: 2.58,
    bestTime: 'Mon–Wed 8–10 AM', trend4w: [2.45, 2.51, 2.57, 2.61], weeklyChangePct: 9,
  },
  {
    id: 6, from: 'Houston', to: 'Phoenix', fromCode: 'HOU', toCode: 'PHX',
    datAvg: 2.49, yourRate: 2.71, vsPct: 8.8,
    trend: '↑ Up 5%', trendDir: 'up', volume: 'Medium', action: 'Find Load', actionType: 'find',
    miles: 1157, truckstopAvg: 2.47, tqlSpread: '11–16%', openingAsk: 2.80, walkAway: 2.45,
    bestTime: 'Tue–Thu 10 AM–1 PM', trend4w: [2.35, 2.40, 2.45, 2.49], weeklyChangePct: 5,
  },
  {
    id: 7, from: 'Chicago', to: 'Atlanta', fromCode: 'CHI', toCode: 'ATL',
    datAvg: 2.22, yourRate: 2.15, vsPct: -3.1,
    trend: '↓ Down', trendDir: 'down', volume: 'High', action: 'Negotiate', actionType: 'negotiate',
    miles: 720, truckstopAvg: 2.20, tqlSpread: '10–14%', openingAsk: 2.30, walkAway: 2.15,
    bestTime: 'Mon–Tue 9–11 AM', trend4w: [2.30, 2.28, 2.25, 2.22], weeklyChangePct: -5,
  },
  {
    id: 8, from: 'Dallas', to: 'Los Angeles', fromCode: 'DAL', toCode: 'LAX',
    datAvg: 2.87, yourRate: 2.65, vsPct: -7.7,
    trend: '↑ Rising', trendDir: 'up', volume: 'Low', action: 'Avoid?', actionType: 'avoid',
    miles: 1430, truckstopAvg: 2.84, tqlSpread: '12–18%', openingAsk: 2.95, walkAway: 2.70,
    bestTime: 'Wed–Fri 8–11 AM', trend4w: [2.65, 2.72, 2.80, 2.87], weeklyChangePct: 8,
  },
  {
    id: 9, from: 'Atlanta', to: 'Charlotte', fromCode: 'ATL', toCode: 'CLT',
    datAvg: 2.18, yourRate: 2.45, vsPct: 12.4,
    trend: '→ Stable', trendDir: 'flat', volume: 'High', action: 'Find Load', actionType: 'find',
    miles: 249, truckstopAvg: 2.16, tqlSpread: '12–16%', openingAsk: 2.50, walkAway: 2.15,
    bestTime: 'Mon–Thu 9–11 AM', trend4w: [2.16, 2.17, 2.18, 2.18], weeklyChangePct: 1,
  },
  {
    id: 10, from: 'Nashville', to: 'Chicago', fromCode: 'BNA', toCode: 'CHI',
    datAvg: 2.31, yourRate: 2.28, vsPct: -1.3,
    trend: '→', trendDir: 'flat', volume: 'Medium', action: 'Find Load', actionType: 'find',
    miles: 480, truckstopAvg: 2.29, tqlSpread: '11–15%', openingAsk: 2.40, walkAway: 2.25,
    bestTime: 'Tue–Thu 9 AM–12 PM', trend4w: [2.29, 2.30, 2.31, 2.31], weeklyChangePct: 0,
  },
  {
    id: 11, from: 'Phoenix', to: 'Dallas', fromCode: 'PHX', toCode: 'DAL',
    datAvg: 2.11, yourRate: 1.95, vsPct: -7.6,
    trend: '↓ Down', trendDir: 'down', volume: 'Low', action: 'Avoid', actionType: 'avoid',
    miles: 1070, truckstopAvg: 2.09, tqlSpread: '10–14%', openingAsk: 2.20, walkAway: 2.05,
    bestTime: 'N/A — weak lane', trend4w: [2.22, 2.18, 2.14, 2.11], weeklyChangePct: -8,
  },
  {
    id: 12, from: 'Kansas City', to: 'Atlanta', fromCode: 'MCI', toCode: 'ATL',
    datAvg: 2.44, yourRate: 2.55, vsPct: 4.5,
    trend: '↑', trendDir: 'up', volume: 'Medium', action: 'Find Load', actionType: 'find',
    miles: 860, truckstopAvg: 2.42, tqlSpread: '12–16%', openingAsk: 2.60, walkAway: 2.40,
    bestTime: 'Mon–Wed 8–11 AM', trend4w: [2.35, 2.38, 2.41, 2.44], weeklyChangePct: 4,
  },
  {
    id: 13, from: 'Seattle', to: 'Los Angeles', fromCode: 'SEA', toCode: 'LAX',
    datAvg: 2.68, yourRate: 2.80, vsPct: 4.5,
    trend: '↑', trendDir: 'up', volume: 'Low', action: 'Find Load', actionType: 'find',
    miles: 1140, truckstopAvg: 2.65, tqlSpread: '13–18%', openingAsk: 2.90, walkAway: 2.65,
    bestTime: 'Mon–Thu 9–11 AM', trend4w: [2.55, 2.59, 2.64, 2.68], weeklyChangePct: 5,
  },
  {
    id: 14, from: 'Denver', to: 'Dallas', fromCode: 'DEN', toCode: 'DAL',
    datAvg: 2.29, yourRate: 2.22, vsPct: -3.1,
    trend: '→', trendDir: 'flat', volume: 'Low', action: 'Find Load', actionType: 'find',
    miles: 930, truckstopAvg: 2.27, tqlSpread: '11–15%', openingAsk: 2.38, walkAway: 2.22,
    bestTime: 'Tue–Thu 10 AM–1 PM', trend4w: [2.30, 2.30, 2.29, 2.29], weeklyChangePct: -1,
  },
  {
    id: 15, from: 'Memphis', to: 'Chicago', fromCode: 'MEM', toCode: 'CHI',
    datAvg: 2.19, yourRate: 2.35, vsPct: 7.3,
    trend: '↑', trendDir: 'up', volume: 'High', action: 'Find Load', actionType: 'find',
    miles: 536, truckstopAvg: 2.17, tqlSpread: '12–17%', openingAsk: 2.45, walkAway: 2.15,
    bestTime: 'Mon–Wed 9–11 AM', trend4w: [2.08, 2.11, 2.15, 2.19], weeklyChangePct: 6,
  },
]

const EXISTING_ALERTS: Alert[] = [
  { id: 1, lane: 'CHI→DAL', threshold: 2.50, current: 2.44, status: 'close' },
  { id: 2, lane: 'DAL→CHI', threshold: 3.00, current: 2.91, status: 'near' },
  { id: 3, lane: 'ATL→IND', threshold: 2.70, current: 2.61, status: 'watch' },
]

const LANE_OPTIONS = LANES.map(l => `${l.fromCode}→${l.toCode}`)

// ── Helpers ───────────────────────────────────────────────────────────────────
function vsColor(pct: number): string {
  if (pct >= 3) return '#16A34A'
  if (pct <= -3) return '#DC2626'
  return '#D97706'
}

function vsBg(pct: number): string {
  if (pct >= 3) return '#F0FFF4'
  if (pct <= -3) return '#FEF2F2'
  return '#FFFBEB'
}

function vsLabel(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  const icon = pct >= 3 ? ' 🟢' : pct <= -3 ? ' 🔴' : ' 🟡'
  if (pct >= 13) return `${sign}${pct.toFixed(1)}%🟢🔥`
  return `${sign}${pct.toFixed(1)}%${icon}`
}

function actionStyle(type: Lane['actionType']): { color: string; bg: string; border: string } {
  if (type === 'find')      return { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }
  if (type === 'negotiate') return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' }
  return                           { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' }
}

function volumeBadge(vol: Lane['volume']): string {
  if (vol === 'High')   return '#10B981'
  if (vol === 'Medium') return '#D97706'
  return '#94A3B8'
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function TrendMiniChart({ values }: { values: number[] }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 0.01
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
      {values.map((v, i) => {
        const h = Math.max(((v - min) / range) * 28 + 8, 8)
        const isLast = i === values.length - 1
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
              width: 28, height: h,
              background: isLast ? '#4BAED4' : '#CBD5E1',
              borderRadius: '4px 4px 0 0',
              border: isLast ? '1px solid #0EA5E9' : '1px solid #E2E8F0',
            }} />
            <span style={{ fontSize: 9, color: '#94A3B8' }}>${v.toFixed(2)}</span>
          </div>
        )
      })}
    </div>
  )
}

function CoachPanel({ lane }: { lane: Lane | null }) {
  if (!lane) {
    // Default: top 3 hot opportunities
    const hotLanes = [...LANES].sort((a, b) => b.vsPct - a.vsPct).slice(0, 3)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          padding: '10px 14px', background: 'linear-gradient(135deg, #1E3A5F, #1A2535)',
          borderRadius: 10, marginBottom: 4,
        }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 0.5 }}>RATE COACH</div>
          <div style={{ fontSize: 14, color: '#fff', fontWeight: 800, marginTop: 2 }}>🔥 Hot Opportunities</div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Hover a lane for full analysis</div>
        </div>
        {hotLanes.map(l => (
          <div key={l.id} style={{
            padding: '12px 14px', background: '#F0FFF4',
            border: '1px solid #86EFAC', borderRadius: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>
                  {l.fromCode} → {l.toCode}
                </div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>{l.from} → {l.to}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#16A34A' }}>+{l.vsPct.toFixed(1)}%</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>vs DAT</div>
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>DAT Avg</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>${l.datAvg.toFixed(2)}/mi</div>
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>Your Rate</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#16A34A' }}>${l.yourRate.toFixed(2)}/mi</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const totalPay = (lane.openingAsk * lane.miles).toFixed(0)
  const isAbove = lane.vsPct >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        background: 'linear-gradient(135deg, #1E3A5F, #1A2535)',
        borderRadius: 10,
      }}>
        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: 0.5 }}>RATE ANALYSIS</div>
        <div style={{ fontSize: 15, color: '#fff', fontWeight: 900, marginTop: 2 }}>
          {lane.fromCode} → {lane.toCode}
        </div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>
          {lane.from} → {lane.to} · {lane.miles.toLocaleString()} mi
        </div>
      </div>

      {/* Rate breakdown */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
        {[
          { label: 'DAT Average (7d)', value: `$${lane.datAvg.toFixed(2)}/mi`, color: '#1A2535' },
          { label: 'Truckstop Avg', value: `$${lane.truckstopAvg.toFixed(2)}/mi`, color: '#1A2535' },
          { label: 'Your Last Rate', value: `$${lane.yourRate.toFixed(2)}/mi`, color: isAbove ? '#16A34A' : '#DC2626', bold: true, note: isAbove ? `↑ ${lane.vsPct.toFixed(1)}% above market` : `← ${Math.abs(lane.vsPct).toFixed(1)}% below market` },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <span style={{ fontSize: 11, color: '#64748B' }}>{r.label}</span>
              {r.note && <div style={{ fontSize: 9, color: isAbove ? '#16A34A' : '#DC2626', fontWeight: 700 }}>{r.note}</div>}
            </div>
            <span style={{ fontSize: 12, fontWeight: r.bold ? 800 : 600, color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      <div style={{
        padding: '10px 12px', borderRadius: 10,
        background: isAbove ? '#F0FFF4' : '#FEF2F2',
        border: `1px solid ${isAbove ? '#86EFAC' : '#FECACA'}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: isAbove ? '#16A34A' : '#DC2626' }}>
          {isAbove ? '🟢 ABOVE MARKET — KEEP IT UP' : '🔴 LEAVING MONEY ON THE TABLE'}
        </div>
      </div>

      {/* Tips */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1A2535', marginBottom: 8 }}>💡 Negotiation Tips</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            lane.weeklyChangePct !== 0 ? `Market moved ${lane.weeklyChangePct > 0 ? 'UP' : 'DOWN'} ${Math.abs(lane.weeklyChangePct)}% this week — ${lane.weeklyChangePct > 0 ? 'leverage this' : 'push back on low offers'}` : 'Market is stable — hold your rate',
            `TQL typical spread: ${lane.tqlSpread} above DAT`,
            `Opening ask: $${lane.openingAsk.toFixed(2)}/mi ($${parseInt(totalPay).toLocaleString()} for ${lane.miles.toLocaleString()} mi)`,
            `Walk-away: $${lane.walkAway.toFixed(2)}/mi (protect margin)`,
            `Best time to call: ${lane.bestTime}`,
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, color: '#475569', lineHeight: 1.4 }}>
              <span style={{ color: '#4BAED4', fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4-week trend */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#1A2535', marginBottom: 4 }}>📅 Rate Trend (4 weeks)</div>
        <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 8 }}>
          ${lane.trend4w[0].toFixed(2)} → ${lane.trend4w[1].toFixed(2)} → ${lane.trend4w[2].toFixed(2)} → ${lane.trend4w[3].toFixed(2)}&nbsp;
          {lane.trendDir === 'up' ? '(↑ trending up)' : lane.trendDir === 'down' ? '(↓ trending down)' : '(→ stable)'}
        </div>
        <TrendMiniChart values={lane.trend4w} />
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketRateIntelPage() {
  const [hoveredLane, setHoveredLane] = useState<number | null>(null)
  const [filterTab,   setFilterTab]   = useState<FilterTab>('all')
  const [alertLane,   setAlertLane]   = useState<string>('CHI→DAL')
  const [alertRate,   setAlertRate]   = useState<string>('2.50')
  const [alerts,      setAlerts]      = useState<Alert[]>(EXISTING_ALERTS)

  const hoveredData = hoveredLane !== null ? LANES.find(l => l.id === hoveredLane) ?? null : null

  const filteredLanes = LANES.filter(l => {
    if (filterTab === 'all')     return true
    if (filterTab === 'active')  return l.volume === 'High'
    if (filterTab === 'history') return l.actionType === 'find'
    if (filterTab === 'hot')     return l.vsPct >= 8
    return true
  })

  function addAlert() {
    const rate = parseFloat(alertRate)
    if (isNaN(rate) || !alertLane) return
    const lane = LANES.find(l => `${l.fromCode}→${l.toCode}` === alertLane)
    const current = lane?.datAvg ?? rate
    const diff = (rate - current) / rate
    const status: Alert['status'] = diff < 0.03 ? 'close' : diff < 0.07 ? 'near' : 'watch'
    setAlerts(prev => [...prev, {
      id: Date.now(), lane: alertLane, threshold: rate, current, status,
    }])
  }

  const alertStatusMeta = {
    close: { label: '🟡 Almost there', color: '#D97706', bg: '#FFFBEB' },
    near:  { label: '🟡 Close',        color: '#D97706', bg: '#FFFBEB' },
    watch: { label: '✓ Watching',      color: '#22C55E', bg: '#F0FFF4' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1A2535', margin: 0, letterSpacing: -0.5 }}>
          Market Rate Intelligence
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
          Know the market before you negotiate. Every lane, every week.
        </p>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { icon: '📊', label: 'Your Avg RPM This Week', value: '$2.41/mi', sub: 'all lanes', color: '#4BAED4' },
          { icon: '🌐', label: 'Market Avg (DAT)',         value: '$2.38/mi', sub: '7-day avg',   color: '#8B5CF6' },
          { icon: '📈', label: 'You vs Market',            value: '+1.3%',    sub: '🟢 Above',    color: '#16A34A' },
          { icon: '🏆', label: 'Best Lane This Week',      value: '$3.09/mi', sub: 'DAL→CHI',     color: '#F97316' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 10, color: s.color, fontWeight: 700, background: s.color + '18', padding: '2px 6px', borderRadius: 5 }}>
                {s.sub}
              </span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main content: table + coach panel ──────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

        {/* Table area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0' }}>
              {([
                { key: 'all',     label: 'All Lanes' },
                { key: 'active',  label: 'Active Lanes' },
                { key: 'history', label: 'Your History' },
                { key: 'hot',     label: '🔥 Hot Lanes' },
              ] as { key: FilterTab; label: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  style={{
                    flex: 1, padding: '11px 8px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                    color: filterTab === tab.key ? '#4BAED4' : '#718096',
                    borderBottom: filterTab === tab.key ? '2px solid #4BAED4' : '2px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lane table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 680 }}>
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th style={{ textAlign: 'right' }}>DAT Avg</th>
                    <th style={{ textAlign: 'right' }}>Your Rate</th>
                    <th style={{ textAlign: 'center' }}>vs Market</th>
                    <th>Trend</th>
                    <th>Volume</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLanes.map(lane => {
                    const isHovered = hoveredLane === lane.id
                    const aStyle = actionStyle(lane.actionType)
                    const vc = vsColor(lane.vsPct)
                    const vb = vsBg(lane.vsPct)
                    return (
                      <tr
                        key={lane.id}
                        onMouseEnter={() => setHoveredLane(lane.id)}
                        onMouseLeave={() => setHoveredLane(null)}
                        style={{
                          cursor: 'default',
                          background: isHovered ? '#F0F9FF' : undefined,
                          transition: 'background 0.15s',
                        }}
                      >
                        <td>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1A2535' }}>
                            {lane.fromCode} → {lane.toCode}
                          </div>
                          <div style={{ fontSize: 10, color: '#94A3B8' }}>
                            {lane.from} → {lane.to} · {lane.miles.toLocaleString()} mi
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#4BAED4' }}>
                          ${lane.datAvg.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A2535' }}>
                          ${lane.yourRate.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                            background: vb, color: vc, whiteSpace: 'nowrap',
                          }}>
                            {vsLabel(lane.vsPct)}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 11, color:
                              lane.trendDir === 'up' ? '#16A34A' :
                              lane.trendDir === 'down' ? '#DC2626' : '#64748B',
                            fontWeight: 600,
                          }}>
                            {lane.trend}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                            background: volumeBadge(lane.volume) + '18',
                            color: volumeBadge(lane.volume),
                          }}>
                            {lane.volume}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button style={{
                            fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 7,
                            background: aStyle.bg, color: aStyle.color,
                            border: `1px solid ${aStyle.border}`, cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}>
                            {lane.action}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coach panel (320px) */}
        <div style={{ flexShrink: 0, width: 320 }}>
          <div className="card" style={{ padding: 14 }}>
            <CoachPanel lane={hoveredData} />
          </div>
        </div>
      </div>

      {/* ── Rate Alert Setup ─────────────────────────────────────────────────── */}
      <div className="card">
        <h2 className="section-title" style={{ marginBottom: 16 }}>🔔 Rate Alert Setup</h2>

        {/* Alert form */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Alert me when</span>
          <select
            value={alertLane}
            onChange={e => setAlertLane(e.target.value)}
            style={{
              border: '2px solid #CBD5E1', borderRadius: 8, padding: '7px 10px',
              fontSize: 12, fontWeight: 700, color: '#1A2535', outline: 'none',
              background: '#fff', cursor: 'pointer',
            }}
          >
            {LANE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>rate goes above</span>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>$</span>
            <input
              type="number" step="0.01" min="1.50" max="5.00"
              value={alertRate}
              onChange={e => setAlertRate(e.target.value)}
              placeholder="2.50"
              style={{
                border: '2px solid #CBD5E1', borderRadius: 8,
                padding: '7px 10px 7px 20px', fontSize: 12, fontWeight: 700,
                color: '#1A2535', outline: 'none', width: 90,
              }}
            />
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#94A3B8' }}>/mi</span>
          </div>
          <button
            onClick={addAlert}
            className="btn btn-primary btn-sm"
            style={{ background: '#4BAED4', borderColor: '#4BAED4', fontWeight: 800 }}
          >
            + Add Alert
          </button>
        </div>

        {/* Existing alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map(alert => {
            const meta = alertStatusMeta[alert.status]
            const pct = ((alert.current / alert.threshold) * 100).toFixed(0)
            return (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: meta.bg,
                border: `1px solid ${meta.color}33`, borderRadius: 10,
              }}>
                <div style={{ flex: '0 0 80px', fontSize: 13, fontWeight: 800, color: '#1A2535' }}>
                  {alert.lane}
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  Alert at <span style={{ fontWeight: 700, color: '#1A2535' }}>${alert.threshold.toFixed(2)}/mi</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748B' }}>
                  Current: <span style={{ fontWeight: 700, color: '#4BAED4' }}>${alert.current.toFixed(2)}</span>
                </div>
                {/* Progress bar */}
                <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(parseInt(pct), 100)}%`, height: '100%',
                    background: meta.color, borderRadius: 3,
                    transition: 'width 0.4s',
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, flexShrink: 0 }}>
                  {meta.label}
                </span>
                <button
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#94A3B8', fontSize: 14, padding: '0 4px', lineHeight: 1,
                  }}
                  title="Remove alert"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
