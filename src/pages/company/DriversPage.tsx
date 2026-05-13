import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type DriverStatus = 'Driving' | 'On Duty' | 'Off Duty' | 'Sleeper' | 'Inactive'
type SortKey = 'name' | 'revenue' | 'rating' | 'ontime'

interface Driver {
  id: string
  name: string
  phone: string
  email: string
  status: DriverStatus
  assignedUnit: string
  currentLoad?: string
  currentLocation: string
  hosAvailable: number    // hours
  hosDriving: number      // hours driven today
  hosLimit: number        // max hours (11)
  hosCycle: number        // 70h / 8-day running total
  // CDL
  cdlNumber: string
  cdlClass: 'A' | 'B'
  cdlExpiry: string
  cdlEndorsements: string[]
  medCardExpiry: string
  hireDate: string
  // performance
  totalMiles: number
  loadsMonth: number
  loadsTotal: number
  rating: number
  violations: number
  onTimeRate: number
  revenue: number
  // safety score (0–100)
  safetyScore: number
  accidents: number
  inspections: number
  inspectionsPassed: number
  // weekly HOS: 7 days of [drive, onDuty] hours
  weeklyHOS: { day: string; drive: number; onDuty: number }[]
  // 6-mo revenue history
  revHistory: number[]
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const DRIVERS: Driver[] = [
  {
    id: 'dr1', name: 'Mike Rodriguez', phone: '(312) 555-0182', email: 'mike@rffreight.com',
    status: 'Driving', assignedUnit: 'Unit 01', currentLoad: 'LD-4821', currentLocation: 'Springfield, MO',
    hosAvailable: 6.5, hosDriving: 4.5, hosLimit: 11, hosCycle: 52.5,
    cdlNumber: 'IL-CDL-441829', cdlClass: 'A', cdlExpiry: 'Jan 2027', cdlEndorsements: ['Hazmat', 'Doubles'],
    medCardExpiry: 'Jun 2026', hireDate: 'Mar 2022',
    totalMiles: 187430, loadsMonth: 8, loadsTotal: 341, rating: 4.9, violations: 0, onTimeRate: 98,
    revenue: 21400, safetyScore: 97, accidents: 0, inspections: 14, inspectionsPassed: 14,
    weeklyHOS: [
      { day: 'Mon', drive: 9.5, onDuty: 10.5 },
      { day: 'Tue', drive: 10.0, onDuty: 11.0 },
      { day: 'Wed', drive: 8.0, onDuty: 9.5 },
      { day: 'Thu', drive: 11.0, onDuty: 12.0 },
      { day: 'Fri', drive: 7.5, onDuty: 8.5 },
      { day: 'Sat', drive: 4.5, onDuty: 5.5 },
      { day: 'Sun', drive: 0,   onDuty: 0   },
    ],
    revHistory: [18200, 19800, 21000, 17600, 20400, 21400],
  },
  {
    id: 'dr2', name: 'Anna Perez', phone: '(305) 555-0291', email: 'anna@aptransport.com',
    status: 'On Duty', assignedUnit: 'Unit 02', currentLoad: 'LD-4819', currentLocation: 'Fort Lauderdale, FL',
    hosAvailable: 9.0, hosDriving: 2.0, hosLimit: 11, hosCycle: 38.0,
    cdlNumber: 'FL-CDL-882041', cdlClass: 'A', cdlExpiry: 'Mar 2026', cdlEndorsements: ['Reefer'],
    medCardExpiry: 'Sep 2025', hireDate: 'Sep 2023',
    totalMiles: 143200, loadsMonth: 5, loadsTotal: 178, rating: 4.8, violations: 0, onTimeRate: 97,
    revenue: 14800, safetyScore: 94, accidents: 0, inspections: 9, inspectionsPassed: 9,
    weeklyHOS: [
      { day: 'Mon', drive: 8.0, onDuty: 9.0 },
      { day: 'Tue', drive: 9.5, onDuty: 10.5 },
      { day: 'Wed', drive: 7.0, onDuty: 8.0 },
      { day: 'Thu', drive: 8.5, onDuty: 9.5 },
      { day: 'Fri', drive: 2.0, onDuty: 3.0 },
      { day: 'Sat', drive: 0,   onDuty: 0   },
      { day: 'Sun', drive: 0,   onDuty: 0   },
    ],
    revHistory: [12400, 14100, 13800, 15200, 14600, 14800],
  },
  {
    id: 'dr3', name: 'James Carter', phone: '(213) 555-0374', email: 'j.carter@carterlogistics.net',
    status: 'Off Duty', assignedUnit: 'Unit 03', currentLocation: 'Chicago, IL',
    hosAvailable: 11.0, hosDriving: 0, hosLimit: 11, hosCycle: 45.0,
    cdlNumber: 'CA-CDL-119384', cdlClass: 'A', cdlExpiry: 'Nov 2025', cdlEndorsements: [],
    medCardExpiry: 'Dec 2025', hireDate: 'Nov 2021',
    totalMiles: 94100, loadsMonth: 11, loadsTotal: 422, rating: 4.7, violations: 1, onTimeRate: 94,
    revenue: 18200, safetyScore: 84, accidents: 0, inspections: 18, inspectionsPassed: 17,
    weeklyHOS: [
      { day: 'Mon', drive: 10.5, onDuty: 11.5 },
      { day: 'Tue', drive: 11.0, onDuty: 12.0 },
      { day: 'Wed', drive: 9.0, onDuty: 10.0 },
      { day: 'Thu', drive: 10.0, onDuty: 11.0 },
      { day: 'Fri', drive: 11.0, onDuty: 12.0 },
      { day: 'Sat', drive: 4.5, onDuty: 5.5 },
      { day: 'Sun', drive: 0,   onDuty: 0   },
    ],
    revHistory: [15600, 17200, 16800, 19100, 17900, 18200],
  },
  {
    id: 'dr4', name: 'Tony Marshall', phone: '(615) 555-0619', email: 'tony@marshalltrucking.com',
    status: 'Sleeper', assignedUnit: 'Unit 05', currentLocation: 'Nashville, TN',
    hosAvailable: 2.5, hosDriving: 8.5, hosLimit: 11, hosCycle: 62.0,
    cdlNumber: 'TN-CDL-773821', cdlClass: 'A', cdlExpiry: 'Aug 2026', cdlEndorsements: [],
    medCardExpiry: 'Mar 2026', hireDate: 'Jul 2021',
    totalMiles: 161500, loadsMonth: 1, loadsTotal: 284, rating: 4.5, violations: 2, onTimeRate: 88,
    revenue: 3200, safetyScore: 71, accidents: 1, inspections: 12, inspectionsPassed: 10,
    weeklyHOS: [
      { day: 'Mon', drive: 8.0, onDuty: 9.0 },
      { day: 'Tue', drive: 10.5, onDuty: 11.5 },
      { day: 'Wed', drive: 6.0, onDuty: 7.0 },
      { day: 'Thu', drive: 11.0, onDuty: 12.0 },
      { day: 'Fri', drive: 8.5, onDuty: 9.5 },
      { day: 'Sat', drive: 8.5, onDuty: 9.5 },
      { day: 'Sun', drive: 9.5, onDuty: 10.5 },
    ],
    revHistory: [14800, 15200, 13900, 11400, 6800, 3200],
  },
]

const MONTHS_SHORT = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<DriverStatus, { cls: string; color: string; bg: string }> = {
  Driving:    { cls: 'badge-primary', color: '#4BAED4', bg: '#EBF8FF' },
  'On Duty':  { cls: 'badge-success', color: '#38C770', bg: '#F0FFF4' },
  'Off Duty': { cls: 'badge-warning', color: '#F59E0B', bg: '#FFFBEB' },
  Sleeper:    { cls: '',              color: '#A0AEC0', bg: '#F7FAFC' },
  Inactive:   { cls: 'badge-danger',  color: '#EF4444', bg: '#FFF5F5' },
}

function StatusBadge({ status }: { status: DriverStatus }) {
  const { cls, color } = STATUS_MAP[status]
  return (
    <span className={`badge ${cls}`} style={!cls ? { background: '#F0F4F8', color: '#718096' } : {}}>
      ● {status}
    </span>
  )
}

function HOSBar({ driven, available, limit }: { driven: number; available: number; limit: number }) {
  const pct = (driven / limit) * 100
  const color = available > 4 ? '#38C770' : available > 1 ? '#F59E0B' : '#EF4444'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginBottom: 4 }}>
        <span>{driven}h driven</span>
        <span style={{ color, fontWeight: 700 }}>{available}h left</span>
      </div>
      <div className="progress-wrap" style={{ height: 6 }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function ExpiryBadge({ date }: { date: string }) {
  if (date === '—') return <span style={{ color: '#A0AEC0' }}>—</span>
  const parts = date.split(' ')
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[0])
  const year = parseInt(parts[1])
  const diffDays = Math.ceil((new Date(year, month).getTime() - Date.now()) / 86400000)
  const color = diffDays < 90 ? '#EF4444' : diffDays < 180 ? '#F59E0B' : '#38C770'
  const icon = diffDays < 90 ? '⚠️ ' : diffDays < 180 ? '⚡ ' : '✅ '
  return <span style={{ fontWeight: 700, color }}>{icon}{date}</span>
}

// Safety score donut
function SafetyRing({ score }: { score: number }) {
  const color = score >= 90 ? '#38C770' : score >= 75 ? '#F59E0B' : '#EF4444'
  const r = 28, cx = 34, cy = 34, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={68} height={68}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F4F8" strokeWidth={7} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 4}  textAnchor="middle" fontSize={14} fontWeight={900} fill={color}>{score}</text>
        <text x={cx} y={cy + 9}  textAnchor="middle" fontSize={9}  fill="#A0AEC0">/100</text>
      </svg>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 2 }}>
        {score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Attention'}
      </div>
    </div>
  )
}

// Weekly HOS bar chart
function HOSWeekChart({ data }: { data: Driver['weeklyHOS'] }) {
  const maxH = 12
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* On-duty bar (light) behind drive (dark) */}
            <div style={{ width: '100%', height: 52, position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
              {/* On-duty bg */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${(d.onDuty / maxH) * 100}%`,
                background: '#BAE6FD', borderRadius: '3px 3px 0 0',
                minHeight: d.onDuty > 0 ? 3 : 0,
              }} />
              {/* Drive time */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${(d.drive / maxH) * 100}%`,
                background: d.drive >= 10 ? '#EF4444' : d.drive >= 8 ? '#F59E0B' : '#4BAED4',
                borderRadius: '3px 3px 0 0',
                minHeight: d.drive > 0 ? 3 : 0,
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#A0AEC0' }}>{d.day}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#718096' }}>
          <div style={{ width: 10, height: 8, background: '#4BAED4', borderRadius: 2 }} /> Drive
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#718096' }}>
          <div style={{ width: 10, height: 8, background: '#BAE6FD', borderRadius: 2 }} /> On Duty
        </div>
      </div>
    </div>
  )
}

// Revenue mini sparkline
function RevSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const w = 70, h = 24, pad = 3
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const lastPt = pts.split(' ').pop()!.split(',')
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(lastPt[0])} cy={parseFloat(lastPt[1])} r={2.5} fill={color} />
    </svg>
  )
}

// Rev bar chart for detail
function RevBarChart({ data, months }: { data: number[]; months: string[] }) {
  const max = Math.max(...data) || 1
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 56 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: '100%', height: 44, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%', background: i === data.length - 1 ? '#4BAED4' : '#E2E8F0',
              borderRadius: '3px 3px 0 0', height: `${(v / max) * 100}%`, minHeight: v > 0 ? 4 : 0,
            }} />
          </div>
          <div style={{ fontSize: 9, color: '#A0AEC0' }}>{months[i]}</div>
        </div>
      ))}
    </div>
  )
}

// ── Add Driver Modal ──────────────────────────────────────────────────────────
function AddDriverModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', cdl: '', unit: '', hireDate: '' })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ width: 500, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>👤 Add New Driver</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Full Name *', key: 'name', placeholder: 'First Last' },
            { label: 'Phone', key: 'phone', placeholder: '(555) 000-0000' },
            { label: 'Email', key: 'email', placeholder: 'driver@email.com' },
            { label: 'CDL Number', key: 'cdl', placeholder: 'IL-CDL-XXXXXX' },
            { label: 'Assign Unit', key: 'unit', placeholder: 'Unit 04' },
            { label: 'Start Date', key: 'hireDate', placeholder: 'May 2025' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input className="input" placeholder={f.placeholder}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!form.name} onClick={onClose}>✓ Add Driver</button>
        </div>
      </div>
    </div>
  )
}

// ── Driver Detail Panel ───────────────────────────────────────────────────────
function DriverDetailPanel({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'compliance' | 'performance' | 'hos'>('overview')
  const cycleUsedPct = Math.round((driver.hosCycle / 70) * 100)
  const inspPassRate = driver.inspections > 0 ? Math.round((driver.inspectionsPassed / driver.inspections) * 100) : 100
  const sc = STATUS_MAP[driver.status]

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'flex-start' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: sc.color + '30', border: `2.5px solid ${sc.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
            }}>{driver.name.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#fff' }}>{driver.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
                {driver.assignedUnit} · CDL-{driver.cdlClass} · Since {driver.hireDate}
              </div>
              <div style={{ marginTop: 6 }}><StatusBadge status={driver.status} /></div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={onClose}>✕</button>
        </div>

        {/* Safety score + cycle bar */}
        <div style={{ marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,.08)', borderRadius: 12 }}>
          <SafetyRing score={driver.safetyScore} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>70-HR CYCLE ({driver.hosCycle}h used)</div>
            <div className="progress-wrap" style={{ height: 8, background: 'rgba(255,255,255,.15)' }}>
              <div className="progress-bar" style={{
                width: `${cycleUsedPct}%`,
                background: cycleUsedPct > 85 ? '#EF4444' : cycleUsedPct > 70 ? '#F59E0B' : '#4BAED4',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>
              <span>{driver.hosCycle}h used</span><span>{70 - driver.hosCycle}h remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F0F4F8' }}>
        {([
          ['overview',    '📊 Info'],
          ['compliance',  '📋 Docs'],
          ['performance', '📈 Perf'],
          ['hos',         '⏱️ HOS'],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '9px 4px', fontWeight: 700, fontSize: 10,
            border: 'none', cursor: 'pointer',
            background: tab === k ? '#EBF8FF' : '#fff',
            color: tab === k ? '#4BAED4' : '#718096',
            borderBottom: tab === k ? '2px solid #4BAED4' : '2px solid transparent',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 18, maxHeight: 460, overflowY: 'auto' }}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Current activity */}
            {driver.currentLoad && (
              <div style={{ padding: '10px 14px', background: '#EBF8FF', borderRadius: 10, border: '1px solid #BAE6FD' }}>
                <div style={{ fontSize: 10, color: '#0369A1', fontWeight: 700 }}>ACTIVE LOAD</div>
                <div style={{ fontWeight: 800, color: '#0C4A6E', fontSize: 14 }}>{driver.currentLoad}</div>
                <div style={{ fontSize: 12, color: '#4BAED4', marginTop: 1 }}>📍 {driver.currentLocation}</div>
              </div>
            )}

            {/* Today's HOS */}
            <div style={{ padding: '10px 14px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', marginBottom: 6 }}>TODAY'S HOS</div>
              <HOSBar driven={driver.hosDriving} available={driver.hosAvailable} limit={driver.hosLimit} />
            </div>

            {/* Info */}
            {[
              { label: 'Phone',       value: driver.phone },
              { label: 'Email',       value: driver.email },
              { label: 'Hire Date',   value: driver.hireDate },
              { label: 'Total Miles', value: driver.totalMiles.toLocaleString() + ' mi' },
              { label: 'Total Loads', value: driver.loadsTotal.toLocaleString() },
              { label: 'Violations',  value: String(driver.violations), color: driver.violations > 0 ? '#EF4444' : '#38C770' },
              { label: 'Accidents',   value: String(driver.accidents),  color: driver.accidents > 0 ? '#EF4444' : '#38C770' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F7FAFC' }}>
                <span style={{ fontSize: 12, color: '#A0AEC0' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: (row as any).color ?? '#2D3748' }}>{row.value}</span>
              </div>
            ))}

            {/* CDL Endorsements */}
            {driver.cdlEndorsements.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 5 }}>CDL Endorsements</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {driver.cdlEndorsements.map(e => (
                    <span key={e} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#EBF8FF', color: '#4BAED4' }}>{e}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Compliance ── */}
        {tab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Safety score detail */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <SafetyRing score={driver.safetyScore} />
            </div>

            {/* Compliance items */}
            {[
              { label: 'CDL Number',       value: driver.cdlNumber,     expiry: false },
              { label: 'CDL Class',         value: `Class ${driver.cdlClass}`, expiry: false },
              { label: 'CDL Expiry',        value: driver.cdlExpiry,    expiry: true },
              { label: 'Medical Card Exp',  value: driver.medCardExpiry, expiry: true },
            ].map(row => (
              <div key={row.label} style={{ padding: '10px 14px', background: '#F7FAFC', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#A0AEC0' }}>{row.label}</div>
                <div>
                  {row.expiry
                    ? <ExpiryBadge date={row.value} />
                    : <span style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{row.value}</span>
                  }
                </div>
              </div>
            ))}

            {/* Inspections */}
            <div style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#A0AEC0' }}>DOT Inspections</div>
                <div style={{ fontWeight: 700, color: inspPassRate >= 90 ? '#38C770' : '#F59E0B', fontSize: 13 }}>
                  {driver.inspectionsPassed}/{driver.inspections} passed ({inspPassRate}%)
                </div>
              </div>
              <div className="progress-wrap" style={{ height: 6 }}>
                <div className="progress-bar" style={{
                  width: `${inspPassRate}%`,
                  background: inspPassRate >= 90 ? '#38C770' : '#F59E0B',
                }} />
              </div>
            </div>

            {/* Violations / Accidents */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{
                padding: '12px', borderRadius: 10, textAlign: 'center',
                background: driver.violations === 0 ? '#F0FFF4' : '#FFF5F5',
                border: `1px solid ${driver.violations === 0 ? '#BBF7D0' : '#FED7D7'}`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: driver.violations === 0 ? '#38C770' : '#EF4444' }}>{driver.violations}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Violations</div>
              </div>
              <div style={{
                padding: '12px', borderRadius: 10, textAlign: 'center',
                background: driver.accidents === 0 ? '#F0FFF4' : '#FFF5F5',
                border: `1px solid ${driver.accidents === 0 ? '#BBF7D0' : '#FED7D7'}`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: driver.accidents === 0 ? '#38C770' : '#EF4444' }}>{driver.accidents}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Accidents</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Performance ── */}
        {tab === 'performance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* KPIs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '📦', label: 'Loads This Mo',    value: String(driver.loadsMonth) },
                { icon: '💰', label: 'Revenue This Mo',  value: `$${driver.revenue.toLocaleString()}` },
                { icon: '🛣️', label: 'Total Miles',      value: driver.totalMiles.toLocaleString() },
                { icon: '⏱️', label: 'On-Time Rate',     value: `${driver.onTimeRate}%` },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#1A2535' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div style={{ padding: '12px 14px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>⭐</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#92400E' }}>{driver.rating}/5.0</div>
                <div style={{ fontSize: 12, color: '#B45309' }}>Driver Rating — {driver.loadsTotal} loads completed</div>
              </div>
            </div>

            {/* Revenue chart */}
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', marginBottom: 8 }}>6-MONTH EARNINGS</div>
              <RevBarChart data={driver.revHistory} months={MONTHS_SHORT} />
            </div>

            {/* On-time bar */}
            <div style={{ padding: '10px 14px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#718096' }}>On-Time Delivery</span>
                <span style={{ fontWeight: 700, color: driver.onTimeRate >= 95 ? '#38C770' : driver.onTimeRate >= 85 ? '#F59E0B' : '#EF4444' }}>
                  {driver.onTimeRate}%
                </span>
              </div>
              <div className="progress-wrap" style={{ height: 7 }}>
                <div className="progress-bar" style={{
                  width: `${driver.onTimeRate}%`,
                  background: driver.onTimeRate >= 95 ? '#38C770' : driver.onTimeRate >= 85 ? '#F59E0B' : '#EF4444',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* ── HOS Weekly ── */}
        {tab === 'hos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Today */}
            <div style={{ padding: '12px 14px', background: '#F0F9FF', borderRadius: 10, border: '1px solid #BAE6FD' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', marginBottom: 6 }}>TODAY</div>
              <HOSBar driven={driver.hosDriving} available={driver.hosAvailable} limit={driver.hosLimit} />
              <div style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>
                Status: <strong>{driver.status}</strong>
              </div>
            </div>

            {/* 70-hr cycle */}
            <div style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#718096', fontWeight: 700 }}>70-hr / 8-Day Cycle</span>
                <span style={{ fontWeight: 800, color: cycleUsedPct > 85 ? '#EF4444' : '#2D3748' }}>
                  {driver.hosCycle}h / 70h
                </span>
              </div>
              <div className="progress-wrap" style={{ height: 8 }}>
                <div className="progress-bar" style={{
                  width: `${cycleUsedPct}%`,
                  background: cycleUsedPct > 85 ? '#EF4444' : cycleUsedPct > 70 ? '#F59E0B' : '#4BAED4',
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 5 }}>
                {70 - driver.hosCycle}h available this cycle
              </div>
            </div>

            {/* Weekly chart */}
            <div style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', marginBottom: 8 }}>WEEKLY HOURS (hrs)</div>
              <HOSWeekChart data={driver.weeklyHOS} />
            </div>

            {/* Daily breakdown table */}
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Day', 'Drive', 'On Duty', 'Status'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', fontSize: 11, color: '#A0AEC0', textAlign: 'left', borderBottom: '1px solid #F0F4F8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {driver.weeklyHOS.map((d, i) => {
                  const driveColor = d.drive >= 10 ? '#EF4444' : d.drive >= 8 ? '#F59E0B' : '#2D3748'
                  return (
                    <tr key={i} style={{ background: i === 5 ? '#F0F9FF' : undefined }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700 }}>{d.day}</td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, color: driveColor }}>{d.drive}h</td>
                      <td style={{ padding: '6px 8px', color: '#718096' }}>{d.onDuty}h</td>
                      <td style={{ padding: '6px 8px' }}>
                        {d.drive === 0
                          ? <span style={{ color: '#A0AEC0', fontSize: 11 }}>Off/Rest</span>
                          : d.drive >= 10
                            ? <span style={{ color: '#EF4444', fontSize: 11, fontWeight: 700 }}>⚠️ Near limit</span>
                            : <span style={{ color: '#38C770', fontSize: 11 }}>✓ OK</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn-primary" style={{ flex: 1, fontSize: 12 }}>💬 Message</button>
          <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12 }}>📞 Call</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DriversPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<DriverStatus | 'All'>('All')
  const [showAdd, setShowAdd]           = useState(false)
  const [sortBy, setSortBy]             = useState<SortKey>('name')

  const selected = DRIVERS.find(d => d.id === selectedId)

  const filtered = DRIVERS
    .filter(d => filterStatus === 'All' || d.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.revenue - a.revenue
      if (sortBy === 'rating')  return b.rating - a.rating
      if (sortBy === 'ontime')  return b.onTimeRate - a.onTimeRate
      return a.name.localeCompare(b.name)
    })

  const driving   = DRIVERS.filter(d => d.status === 'Driving').length
  const onDuty    = DRIVERS.filter(d => ['Driving','On Duty'].includes(d.status)).length
  const avgRating = (DRIVERS.filter(d => d.rating > 0).reduce((s, d) => s + d.rating, 0) / DRIVERS.filter(d => d.rating > 0).length).toFixed(1)
  const expiring  = DRIVERS.filter(d => {
    return [d.cdlExpiry, d.medCardExpiry].some(date => {
      if (date === '—') return false
      const parts = date.split(' ')
      const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[0])
      return new Date(parseInt(parts[1]), m).getTime() - Date.now() < 180 * 86400000
    })
  }).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Active Drivers',  value: String(DRIVERS.filter(d => d.status !== 'Inactive').length), change: `${driving} driving`, up: true,  color: '#4BAED4', icon: '👤' },
          { label: 'On Duty Now',     value: String(onDuty),   change: 'Including driving',  up: true,  color: '#38C770', icon: '🟢' },
          { label: 'Avg Safety Score',value: `${Math.round(DRIVERS.filter(d => d.status !== 'Inactive').reduce((s, d) => s + d.safetyScore, 0) / DRIVERS.filter(d => d.status !== 'Inactive').length)}`, change: 'Fleet safety', up: true, color: '#8B5CF6', icon: '🛡️' },
          { label: 'Docs Expiring',   value: String(expiring), change: 'Within 6 months',   up: false, color: '#F59E0B', icon: '📋' },
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

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', 'Driving', 'On Duty', 'Off Duty', 'Sleeper'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${filterStatus === s ? '#4BAED4' : '#E2E8F0'}`,
              background: filterStatus === s ? '#EBF8FF' : 'transparent',
              color: filterStatus === s ? '#4BAED4' : '#718096', cursor: 'pointer',
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}
            style={{ padding: '6px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            <option value="name">Sort: Name</option>
            <option value="revenue">Sort: Revenue</option>
            <option value="rating">Sort: Rating</option>
            <option value="ontime">Sort: On-Time</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Driver</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        <div>
          {/* Driver Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(driver => {
              const safetyColor = driver.safetyScore >= 90 ? '#38C770' : driver.safetyScore >= 75 ? '#F59E0B' : '#EF4444'
              const cycleUsedPct = Math.round((driver.hosCycle / 70) * 100)
              return (
                <div
                  key={driver.id}
                  onClick={() => setSelectedId(selectedId === driver.id ? null : driver.id)}
                  style={{
                    border: `2px solid ${selectedId === driver.id ? '#4BAED4' : '#E2E8F0'}`,
                    borderRadius: 16, padding: '18px 20px', cursor: 'pointer',
                    background: selectedId === driver.id ? '#EBF8FF' : '#fff',
                    opacity: driver.status === 'Inactive' ? 0.55 : 1,
                    transition: 'all .2s',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: STATUS_MAP[driver.status].color + '20',
                        border: `2px solid ${STATUS_MAP[driver.status].color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 17, fontWeight: 800, color: STATUS_MAP[driver.status].color,
                      }}>{driver.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535' }}>{driver.name}</div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{driver.assignedUnit} · CDL-{driver.cdlClass}</div>
                      </div>
                    </div>
                    <StatusBadge status={driver.status} />
                  </div>

                  {/* Location */}
                  {driver.currentLocation !== '—' && (
                    <div style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>
                      📍 {driver.currentLocation}
                      {driver.currentLoad && <span style={{ color: '#4BAED4', marginLeft: 6 }}>· {driver.currentLoad}</span>}
                    </div>
                  )}

                  {/* HOS today */}
                  {driver.status !== 'Inactive' && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 3 }}>HOS Today</div>
                      <HOSBar driven={driver.hosDriving} available={driver.hosAvailable} limit={driver.hosLimit} />
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, paddingTop: 10, borderTop: '1px solid #F0F4F8' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#2D3748' }}>{driver.loadsMonth}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>Loads</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#38C770' }}>
                        {driver.revenue > 0 ? `$${(driver.revenue / 1000).toFixed(1)}K` : '—'}
                      </div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>Rev</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B' }}>
                        {driver.rating > 0 ? `★${driver.rating}` : '—'}
                      </div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>Rating</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: safetyColor }}>{driver.safetyScore}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>Safety</div>
                    </div>
                  </div>

                  {/* Cycle bar + sparkline footer */}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 2 }}>70H CYCLE</div>
                      <div className="progress-wrap" style={{ height: 4 }}>
                        <div className="progress-bar" style={{
                          width: `${cycleUsedPct}%`,
                          background: cycleUsedPct > 85 ? '#EF4444' : cycleUsedPct > 70 ? '#F59E0B' : '#4BAED4',
                        }} />
                      </div>
                    </div>
                    <RevSparkline data={driver.revHistory} color="#4BAED4" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Driver Leaderboard */}
          <div className="card" style={{ marginTop: 20, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F4F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>🏆 Driver Leaderboard — May 2025</h3>
              <span style={{ fontSize: 12, color: '#A0AEC0' }}>Avg rating: ★{avgRating}</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Driver</th>
                  <th>Unit</th>
                  <th>Loads</th>
                  <th>Revenue</th>
                  <th>On-Time</th>
                  <th>Rating</th>
                  <th>Safety</th>
                  <th>HOS Cycle</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {[...DRIVERS]
                  .filter(d => d.status !== 'Inactive')
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((d, i) => {
                    const safetyColor = d.safetyScore >= 90 ? '#38C770' : d.safetyScore >= 75 ? '#F59E0B' : '#EF4444'
                    const cycleUsedPct = Math.round((d.hosCycle / 70) * 100)
                    const medals = ['🥇', '🥈', '🥉']
                    return (
                      <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}>
                        <td style={{ fontWeight: 800, fontSize: 16 }}>{medals[i] ?? i + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{d.name.charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{d.name}</div>
                              <div style={{ fontSize: 11, color: '#A0AEC0' }}>Since {d.hireDate}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#4BAED4', fontWeight: 700 }}>{d.assignedUnit}</td>
                        <td style={{ fontWeight: 600 }}>{d.loadsMonth}</td>
                        <td style={{ fontWeight: 700, color: '#38C770' }}>${d.revenue.toLocaleString()}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: d.onTimeRate >= 95 ? '#38C770' : d.onTimeRate >= 85 ? '#F59E0B' : '#EF4444' }}>
                            {d.onTimeRate}%
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#F59E0B' }}>{d.rating > 0 ? `★ ${d.rating}` : '—'}</td>
                        <td>
                          <span style={{ fontWeight: 800, color: safetyColor, fontSize: 13 }}>{d.safetyScore}</span>
                        </td>
                        <td style={{ width: 120 }}>
                          <div className="progress-wrap" style={{ height: 6 }}>
                            <div className="progress-bar" style={{
                              width: `${cycleUsedPct}%`,
                              background: cycleUsedPct > 85 ? '#EF4444' : cycleUsedPct > 70 ? '#F59E0B' : '#4BAED4',
                            }} />
                          </div>
                          <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{d.hosCycle}h / 70h</div>
                        </td>
                        <td><RevSparkline data={d.revHistory} color="#4BAED4" /></td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <DriverDetailPanel driver={selected} onClose={() => setSelectedId(null)} />
        )}
      </div>

      {showAdd && <AddDriverModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
