import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type TruckStatus = 'On Route' | 'Available' | 'Maintenance' | 'Out of Service' | 'Idle'

interface Truck {
  id: string
  unit: string
  make: string
  model: string
  year: number
  plate: string
  vin: string
  status: TruckStatus
  driver: string
  driverId: string
  mileage: number
  fuelPct: number
  mpg: number
  currentLoad?: string
  currentLocation: string
  lastService: string
  nextService: number    // miles to next service
  dotExpiry: string
  insuranceExpiry: string
  // financials
  revenueMonth: number
  operatingCostMonth: number
  loadsMonth: number
  milesMonth: number
  // history: 6-month revenue
  revHistory: number[]
}

interface MaintenanceAlert {
  id: string
  truckUnit: string
  type: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  due: string
}

interface ServiceRecord {
  date: string
  type: string
  cost: number
  shop: string
  notes: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const TRUCKS: Truck[] = [
  {
    id: 't1', unit: 'Unit 01', make: 'Peterbilt', model: '579', year: 2022, plate: 'IL-MTR-2291',
    vin: '1XPWD49X9JD460001', status: 'On Route', driver: 'Mike Rodriguez', driverId: 'd1',
    mileage: 187430, fuelPct: 62, mpg: 6.8, currentLoad: 'LD-4821', currentLocation: 'Springfield, MO',
    lastService: 'Apr 1, 2025', nextService: 12570, dotExpiry: 'Dec 2025', insuranceExpiry: 'Jan 2026',
    revenueMonth: 21400, operatingCostMonth: 14200, loadsMonth: 8, milesMonth: 7840,
    revHistory: [18200, 19800, 21000, 17600, 20400, 21400],
  },
  {
    id: 't2', unit: 'Unit 02', make: 'Kenworth', model: 'T680', year: 2021, plate: 'IL-KW-8843',
    vin: '1XKWD49X5JJ460002', status: 'On Route', driver: 'Anna Perez', driverId: 'd2',
    mileage: 143200, fuelPct: 78, mpg: 7.1, currentLoad: 'LD-4819', currentLocation: 'Fort Lauderdale, FL',
    lastService: 'Mar 15, 2025', nextService: 6800, dotExpiry: 'Sep 2025', insuranceExpiry: 'Jan 2026',
    revenueMonth: 14800, operatingCostMonth: 10600, loadsMonth: 5, milesMonth: 4920,
    revHistory: [12400, 14100, 13800, 15200, 14600, 14800],
  },
  {
    id: 't3', unit: 'Unit 03', make: 'Freightliner', model: 'Cascadia', year: 2023, plate: 'IL-FLC-5511',
    vin: '3AKJGLD57JSFP0003', status: 'Available', driver: 'James Carter', driverId: 'd3',
    mileage: 94100, fuelPct: 91, mpg: 7.4, currentLocation: 'Chicago, IL',
    lastService: 'Apr 20, 2025', nextService: 30900, dotExpiry: 'Mar 2026', insuranceExpiry: 'Jan 2026',
    revenueMonth: 18200, operatingCostMonth: 11800, loadsMonth: 11, milesMonth: 8640,
    revHistory: [15600, 17200, 16800, 19100, 17900, 18200],
  },
  {
    id: 't4', unit: 'Unit 04', make: 'International', model: 'LT', year: 2020, plate: 'IL-INT-7723',
    vin: '1HTMKASR7JH440004', status: 'Maintenance', driver: 'Unassigned', driverId: '',
    mileage: 224800, fuelPct: 30, mpg: 6.2, currentLocation: 'Chicago, IL (Shop)',
    lastService: 'May 5, 2025', nextService: 0, dotExpiry: 'Jun 2025', insuranceExpiry: 'Jan 2026',
    revenueMonth: 0, operatingCostMonth: 2800, loadsMonth: 0, milesMonth: 0,
    revHistory: [11200, 9800, 12400, 10600, 3200, 0],
  },
  {
    id: 't5', unit: 'Unit 05', make: 'Volvo', model: 'VNL 860', year: 2022, plate: 'IL-VLV-3344',
    vin: '4V4NC9EH0JN440005', status: 'Idle', driver: 'Tony Marshall', driverId: 'd5',
    mileage: 161500, fuelPct: 55, mpg: 6.5, currentLocation: 'Nashville, TN',
    lastService: 'Feb 10, 2025', nextService: 3500, dotExpiry: 'Aug 2025', insuranceExpiry: 'Jan 2026',
    revenueMonth: 3200, operatingCostMonth: 4100, loadsMonth: 1, milesMonth: 1280,
    revHistory: [14800, 15200, 13900, 11400, 6800, 3200],
  },
]

const ALERTS: MaintenanceAlert[] = [
  { id: 'a1', truckUnit: 'Unit 04', type: 'Engine',  severity: 'critical', message: 'Engine oil leak detected — truck in shop', due: 'Now' },
  { id: 'a2', truckUnit: 'Unit 02', type: 'Service', severity: 'warning',  message: 'Oil change due in 6,800 miles (est. 2 weeks)', due: 'May 25' },
  { id: 'a3', truckUnit: 'Unit 04', type: 'DOT',     severity: 'critical', message: 'DOT annual inspection expires Jun 2025', due: 'Jun 1' },
  { id: 'a4', truckUnit: 'Unit 05', type: 'Tires',   severity: 'warning',  message: 'Front steer tires worn — recommend replacement', due: 'Jun 15' },
  { id: 'a5', truckUnit: 'Unit 05', type: 'DOT',     severity: 'warning',  message: 'DOT inspection expires Aug 2025', due: 'Aug 1' },
  { id: 'a6', truckUnit: 'Unit 03', type: 'ELD',     severity: 'info',     message: 'ELD firmware update available', due: 'Anytime' },
]

const SERVICE_HISTORY: Record<string, ServiceRecord[]> = {
  't1': [
    { date: 'Apr 1, 2025',  type: 'Oil Change',         cost: 340,  shop: 'Speedco Chicago',      notes: 'Full synthetic 10W-30' },
    { date: 'Jan 12, 2025', type: 'Tire Rotation',      cost: 180,  shop: 'Love\'s Truck Stop',    notes: '4 drives, 2 steers' },
    { date: 'Oct 8, 2024',  type: 'Annual DOT Insp.',   cost: 220,  shop: 'J&R Truck Service',     notes: 'Passed, all items OK' },
  ],
  't2': [
    { date: 'Mar 15, 2025', type: 'Oil Change',         cost: 340,  shop: 'Pilot Flying J',        notes: 'Full synthetic' },
    { date: 'Nov 20, 2024', type: 'Air Dryer Replace',  cost: 890,  shop: 'Kenworth Chicago',      notes: 'Warranty covered partial' },
  ],
  't3': [
    { date: 'Apr 20, 2025', type: 'Oil Change + Filter',cost: 380,  shop: 'Speedco Chicago',      notes: 'Included coolant top-off' },
    { date: 'Feb 1, 2025',  type: 'DPF Cleaning',       cost: 650,  shop: 'Freightliner Dealer',   notes: 'Regen cycle complete' },
  ],
  't4': [
    { date: 'May 5, 2025',  type: 'Engine Oil Leak',    cost: 2800, shop: 'International Chicago', notes: 'Estimated $2,800–$4,200 total' },
    { date: 'Feb 28, 2025', type: 'Brake Job',          cost: 1240, shop: 'J&R Truck Service',     notes: 'All four brakes replaced' },
  ],
  't5': [
    { date: 'Feb 10, 2025', type: 'Oil Change',         cost: 340,  shop: 'Pilot Flying J',        notes: 'Standard service' },
    { date: 'Dec 5, 2024',  type: 'Turbo Inspection',   cost: 480,  shop: 'Volvo Dealer Nashville', notes: 'No defects found' },
  ],
}

const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TruckStatus, { cls: string; color: string; bg: string }> = {
  'On Route':      { cls: 'badge-primary', color: '#4BAED4', bg: '#EBF8FF' },
  'Available':     { cls: 'badge-success', color: '#38C770', bg: '#F0FFF4' },
  'Maintenance':   { cls: 'badge-danger',  color: '#EF4444', bg: '#FFF5F5' },
  'Out of Service':{ cls: 'badge-danger',  color: '#EF4444', bg: '#FFF5F5' },
  'Idle':          { cls: 'badge-warning', color: '#F59E0B', bg: '#FFFBEB' },
}

function StatusBadge({ status }: { status: TruckStatus }) {
  return <span className={`badge ${STATUS_CONFIG[status].cls}`}>● {status}</span>
}

function FuelBar({ pct }: { pct: number }) {
  const color = pct > 50 ? '#38C770' : pct > 25 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-wrap" style={{ flex: 1, height: 7 }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 32 }}>{pct}%</span>
    </div>
  )
}

// SVG sparkline for revenue history
function RevSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80, h = 28, pad = 4
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  const lastY = parseFloat(points.split(' ').pop()!.split(',')[1])
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={parseFloat(points.split(' ').pop()!.split(',')[0])} cy={lastY} r={3} fill={color} />
    </svg>
  )
}

// Utilization ring (SVG donut)
function UtilRing({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 22, cx = 28, cy = 28
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={56} height={56}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F4F8" strokeWidth={6} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={11} fontWeight={800} fill={color}>{pct}%</text>
      </svg>
      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// Revenue bar chart for detail panel
function RevBarChart({ data, months }: { data: number[]; months: string[] }) {
  const max = Math.max(...data) || 1
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
      {data.map((v, i) => {
        const isLast = i === data.length - 1
        const pct = (v / max) * 100
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: '100%', height: 48, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%', background: isLast ? '#4BAED4' : '#E2E8F0',
                borderRadius: '3px 3px 0 0', height: `${pct}%`,
                minHeight: v > 0 ? 4 : 0,
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#A0AEC0' }}>{months[i]}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Add Truck Modal ───────────────────────────────────────────────────────────
function AddTruckModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ unit: '', make: 'Peterbilt', model: '', year: '2024', plate: '', vin: '', driver: '' })
  const MAKES = ['Peterbilt', 'Kenworth', 'Freightliner', 'International', 'Volvo', 'Mack', 'Western Star']
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ width: 520, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>🚛 Add New Truck</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Unit #', key: 'unit', placeholder: 'Unit 06' },
            { label: 'Year', key: 'year', placeholder: '2024' },
            { label: 'Model', key: 'model', placeholder: '579 / T680 / Cascadia' },
            { label: 'License Plate', key: 'plate', placeholder: 'IL-XXX-0000' },
            { label: 'VIN', key: 'vin', placeholder: '1XPWD49X...' },
            { label: 'Assign Driver', key: 'driver', placeholder: 'Driver name' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input className="input" placeholder={f.placeholder}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Make</label>
            <select className="input" value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))}>
              {MAKES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={!form.unit || !form.plate} onClick={onClose}>✓ Add Truck</button>
        </div>
      </div>
    </div>
  )
}

// ── Truck Detail Panel ────────────────────────────────────────────────────────
function TruckDetailPanel({ truck, onClose }: { truck: Truck; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'financials' | 'maintenance'>('overview')
  const profit = truck.revenueMonth - truck.operatingCostMonth
  const margin = truck.revenueMonth > 0 ? Math.round((profit / truck.revenueMonth) * 100) : 0
  const utilPct = truck.milesMonth > 0 ? Math.min(100, Math.round((truck.milesMonth / 11000) * 100)) : 0
  const history = SERVICE_HISTORY[truck.id] || []
  const svcAlerts = ALERTS.filter(a => a.truckUnit === truck.unit)
  const sc = STATUS_CONFIG[truck.status]

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', alignSelf: 'flex-start' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>🚛</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 20, color: '#fff' }}>{truck.unit}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>
                  {truck.year} {truck.make} {truck.model} · {truck.plate}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 2 }}><StatusBadge status={truck.status} /></div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={onClose}>✕</button>
        </div>

        {/* Mini rings row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,.08)', borderRadius: 12 }}>
          <UtilRing pct={utilPct}   color="#4BAED4"  label="Utiliz." />
          <UtilRing pct={Math.max(0, margin)} color={margin > 0 ? '#38C770' : '#EF4444'} label="Margin" />
          <UtilRing pct={truck.fuelPct}   color={truck.fuelPct > 50 ? '#38C770' : truck.fuelPct > 25 ? '#F59E0B' : '#EF4444'} label="Fuel" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Next Service</div>
            <div style={{
              fontSize: 14, fontWeight: 800,
              color: truck.nextService === 0 ? '#EF4444' : truck.nextService < 5000 ? '#F59E0B' : '#38C770',
            }}>
              {truck.nextService > 0 ? `${truck.nextService.toLocaleString()} mi` : '⚠️ Overdue'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>MPG: {truck.mpg}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F0F4F8' }}>
        {([
          ['overview',    '📋 Info'],
          ['financials',  '💰 P&L'],
          ['maintenance', '🔧 Service'],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '10px 4px', fontWeight: 700, fontSize: 11,
            border: 'none', cursor: 'pointer',
            background: tab === k ? '#EBF8FF' : '#fff',
            color: tab === k ? '#4BAED4' : '#718096',
            borderBottom: tab === k ? '2px solid #4BAED4' : '2px solid transparent',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 18, maxHeight: 420, overflowY: 'auto' }}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Driver */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: sc.bg, borderRadius: 10, border: `1px solid ${sc.color}30`,
            }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: sc.color }}>
                {truck.driver !== 'Unassigned' ? truck.driver.charAt(0) : '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{truck.driver}</div>
                {truck.currentLoad && <div style={{ fontSize: 11, color: '#4BAED4' }}>Load: {truck.currentLoad}</div>}
              </div>
            </div>

            {/* Info rows */}
            {[
              { label: 'Current Location', value: `📍 ${truck.currentLocation}` },
              { label: 'VIN',              value: truck.vin },
              { label: 'Total Mileage',    value: truck.mileage.toLocaleString() + ' mi' },
              { label: 'Last Service',     value: truck.lastService },
              { label: 'DOT Expiry',       value: truck.dotExpiry, warn: truck.dotExpiry.includes('Jun 2025') || truck.dotExpiry.includes('Aug 2025') },
              { label: 'Insurance Exp.',   value: truck.insuranceExpiry },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F7FAFC' }}>
                <span style={{ fontSize: 12, color: '#A0AEC0' }}>{row.label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: (row as any).warn ? '#EF4444' : '#2D3748',
                }}>{row.value}</span>
              </div>
            ))}

            {/* Alerts for this truck */}
            {svcAlerts.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#A0AEC0', textTransform: 'uppercase', marginBottom: 6 }}>Alerts</div>
                {svcAlerts.map(a => (
                  <div key={a.id} style={{
                    padding: '8px 12px', borderRadius: 8, marginBottom: 6,
                    background: a.severity === 'critical' ? '#FFF5F5' : a.severity === 'warning' ? '#FFFBEB' : '#F0F9FF',
                    border: `1px solid ${a.severity === 'critical' ? '#FED7D7' : a.severity === 'warning' ? '#FDE68A' : '#BAE6FD'}`,
                    fontSize: 12,
                  }}>
                    <span style={{ fontWeight: 700, color: a.severity === 'critical' ? '#C53030' : a.severity === 'warning' ? '#92400E' : '#0369A1' }}>
                      {a.type}:
                    </span>
                    <span style={{ color: '#718096', marginLeft: 4 }}>{a.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Financials ── */}
        {tab === 'financials' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* P&L summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Revenue',    value: `$${truck.revenueMonth.toLocaleString()}`,      color: '#38C770' },
                { label: 'Op. Costs',  value: `$${truck.operatingCostMonth.toLocaleString()}`, color: '#EF4444' },
                { label: 'Net Profit', value: `$${profit.toLocaleString()}`,                   color: profit > 0 ? '#4BAED4' : '#EF4444' },
                { label: 'Margin',     value: `${margin}%`,                                    color: margin > 20 ? '#38C770' : margin > 0 ? '#F59E0B' : '#EF4444' },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Loads + miles */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '10px', background: '#F7FAFC', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>{truck.loadsMonth}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Loads This Month</div>
              </div>
              <div style={{ flex: 1, padding: '10px', background: '#F7FAFC', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>{truck.milesMonth.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Miles This Month</div>
              </div>
            </div>

            {/* Revenue chart */}
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', marginBottom: 8 }}>6-MONTH REVENUE</div>
              <RevBarChart data={truck.revHistory} months={MONTHS} />
            </div>

            {/* Cost breakdown estimate */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#A0AEC0', textTransform: 'uppercase', marginBottom: 8 }}>Est. Cost Breakdown</div>
              {[
                { label: 'Fuel',         pct: 42, color: '#F59E0B' },
                { label: 'Driver Pay',   pct: 28, color: '#4BAED4' },
                { label: 'Maintenance',  pct: 12, color: '#EF4444' },
                { label: 'Insurance',    pct: 10, color: '#8B5CF6' },
                { label: 'Other',        pct: 8,  color: '#A0AEC0' },
              ].map(c => (
                <div key={c.label} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginBottom: 3 }}>
                    <span>{c.label}</span><span style={{ fontWeight: 700 }}>{c.pct}%</span>
                  </div>
                  <div className="progress-wrap" style={{ height: 5 }}>
                    <div className="progress-bar" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Maintenance ── */}
        {tab === 'maintenance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: '#F0F9FF', borderRadius: 10, border: '1px solid #BAE6FD' }}>
              <div style={{ fontSize: 11, color: '#0369A1', fontWeight: 700 }}>NEXT SERVICE DUE</div>
              <div style={{
                fontSize: 18, fontWeight: 900, marginTop: 2,
                color: truck.nextService === 0 ? '#EF4444' : truck.nextService < 5000 ? '#F59E0B' : '#38C770',
              }}>
                {truck.nextService > 0 ? `In ${truck.nextService.toLocaleString()} miles` : '⚠️ Overdue — schedule now'}
              </div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>Last service: {truck.lastService}</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: '#A0AEC0', textTransform: 'uppercase' }}>Service History</div>
            {history.map((rec, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#F7FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{rec.type}</div>
                  <div style={{ fontWeight: 800, color: '#EF4444', fontSize: 13 }}>-${rec.cost.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 11, color: '#718096' }}>{rec.date} · {rec.shop}</div>
                {rec.notes && <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3, fontStyle: 'italic' }}>{rec.notes}</div>}
              </div>
            ))}
            {history.length === 0 && <div style={{ fontSize: 13, color: '#A0AEC0', textAlign: 'center', padding: '20px 0' }}>No service records yet</div>}

            <button className="btn btn-secondary" style={{ width: '100%' }}>+ Log Service Record</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn btn-primary" style={{ flex: 1, fontSize: 12 }}>📍 Track Live</button>
          <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12 }}>✏️ Edit Truck</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FleetPage() {
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<TruckStatus | 'All'>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode]         = useState<'grid' | 'table'>('grid')
  const [sortBy, setSortBy]             = useState<'unit' | 'revenue' | 'utilization'>('unit')

  const selected = TRUCKS.find(t => t.id === selectedId)

  const filtered = TRUCKS
    .filter(t => filterStatus === 'All' || t.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'revenue')     return b.revenueMonth - a.revenueMonth
      if (sortBy === 'utilization') return b.milesMonth - a.milesMonth
      return a.unit.localeCompare(b.unit)
    })

  const onRoute    = TRUCKS.filter(t => t.status === 'On Route').length
  const available  = TRUCKS.filter(t => t.status === 'Available').length
  const inMaint    = TRUCKS.filter(t => t.status === 'Maintenance').length
  const critAlerts = ALERTS.filter(a => a.severity === 'critical').length
  const totalRev   = TRUCKS.reduce((s, t) => s + t.revenueMonth, 0)
  const totalCost  = TRUCKS.reduce((s, t) => s + t.operatingCostMonth, 0)
  const fleetMargin = Math.round(((totalRev - totalCost) / (totalRev || 1)) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Fleet',     value: String(TRUCKS.length),           change: `${onRoute} on route`,        up: true,  color: '#4BAED4', icon: '🚛' },
          { label: 'Available Now',   value: String(available),                change: 'Ready for dispatch',         up: true,  color: '#38C770', icon: '✅' },
          { label: 'Fleet Revenue',   value: `$${totalRev.toLocaleString()}`,  change: `${fleetMargin}% margin`,     up: true,  color: '#8B5CF6', icon: '💰' },
          { label: 'Critical Alerts', value: String(critAlerts),               change: `${inMaint} in maintenance`,  up: false, color: '#EF4444', icon: '⚠️' },
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

      {/* Critical Alert Banner */}
      {critAlerts > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #EF4444', background: '#FFF5F5', padding: '14px 18px' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#C53030', marginBottom: 10 }}>
            🚨 {critAlerts} Critical Alert{critAlerts > 1 ? 's' : ''} — Action Required
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ALERTS.filter(a => a.severity === 'critical').map(alert => (
              <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                <strong style={{ color: '#2D3748', minWidth: 60 }}>{alert.truckUnit}</strong>
                <span style={{ color: '#718096', flex: 1 }}>{alert.message}</span>
                <span style={{ color: '#EF4444', fontWeight: 700, flexShrink: 0 }}>Due: {alert.due}</span>
                <button className="btn btn-ghost btn-sm">Fix →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['All', 'On Route', 'Available', 'Maintenance', 'Idle'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${filterStatus === s ? '#4BAED4' : '#E2E8F0'}`,
              background: filterStatus === s ? '#EBF8FF' : 'transparent',
              color: filterStatus === s ? '#4BAED4' : '#718096', cursor: 'pointer',
            }}>{s} {s === 'All' ? `(${TRUCKS.length})` : `(${TRUCKS.filter(t => t.status === s).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            style={{ padding: '6px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            <option value="unit">Sort: Unit</option>
            <option value="revenue">Sort: Revenue</option>
            <option value="utilization">Sort: Utilization</option>
          </select>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 8, padding: 2 }}>
            {(['grid', 'table'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: viewMode === v ? '#fff' : 'transparent',
                color: viewMode === v ? '#4BAED4' : '#718096',
              }}>{v === 'grid' ? '⊞ Grid' : '☰ Table'}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add Truck</button>
        </div>
      </div>

      {/* Content + Detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>

        <div>
          {/* ── Grid View ── */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.map(truck => {
                const profit = truck.revenueMonth - truck.operatingCostMonth
                const margin = truck.revenueMonth > 0 ? Math.round((profit / truck.revenueMonth) * 100) : 0
                return (
                  <div
                    key={truck.id}
                    onClick={() => setSelectedId(selectedId === truck.id ? null : truck.id)}
                    style={{
                      border: `2px solid ${selectedId === truck.id ? '#4BAED4' : '#E2E8F0'}`,
                      borderRadius: 16, padding: '18px 20px', cursor: 'pointer',
                      background: selectedId === truck.id ? '#EBF8FF' : '#fff',
                      transition: 'all .2s',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 16, color: '#1A2535' }}>{truck.unit}</div>
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
                          {truck.year} {truck.make} {truck.model} · {truck.plate}
                        </div>
                      </div>
                      <StatusBadge status={truck.status} />
                    </div>

                    {/* Driver row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {truck.driver !== 'Unassigned' ? truck.driver.charAt(0) : '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{truck.driver}</div>
                        {truck.currentLoad && <div style={{ fontSize: 11, color: '#4BAED4' }}>📦 {truck.currentLoad}</div>}
                      </div>
                    </div>

                    {/* Location */}
                    <div style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>📍 {truck.currentLocation}</div>

                    {/* Fuel */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 3 }}>⛽ Fuel</div>
                      <FuelBar pct={truck.fuelPct} />
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 10, borderTop: '1px solid #F0F4F8' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#38C770' }}>
                          {truck.revenueMonth > 0 ? `$${(truck.revenueMonth / 1000).toFixed(1)}K` : '—'}
                        </div>
                        <div style={{ fontSize: 10, color: '#A0AEC0' }}>Revenue</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: margin >= 20 ? '#4BAED4' : margin > 0 ? '#F59E0B' : '#EF4444' }}>
                          {truck.revenueMonth > 0 ? `${margin}%` : '—'}
                        </div>
                        <div style={{ fontSize: 10, color: '#A0AEC0' }}>Margin</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: 14, fontWeight: 800,
                          color: truck.nextService === 0 ? '#EF4444' : truck.nextService < 5000 ? '#F59E0B' : '#38C770',
                        }}>
                          {truck.nextService > 0 ? `${(truck.nextService / 1000).toFixed(1)}K` : '⚠️'}
                        </div>
                        <div style={{ fontSize: 10, color: '#A0AEC0' }}>Next Svc</div>
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <RevSparkline data={truck.revHistory} color={profit >= 0 ? '#38C770' : '#EF4444'} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Table View ── */}
          {viewMode === 'table' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Truck</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Fuel</th>
                    <th>Revenue</th>
                    <th>Margin</th>
                    <th>Next Svc</th>
                    <th>DOT Exp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(truck => {
                    const profit = truck.revenueMonth - truck.operatingCostMonth
                    const margin = truck.revenueMonth > 0 ? Math.round((profit / truck.revenueMonth) * 100) : 0
                    return (
                      <tr key={truck.id} onClick={() => setSelectedId(selectedId === truck.id ? null : truck.id)}
                        style={{ cursor: 'pointer', background: selectedId === truck.id ? '#EBF8FF' : undefined }}>
                        <td style={{ fontWeight: 800, color: '#4BAED4' }}>{truck.unit}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{truck.make} {truck.model}</div>
                          <div style={{ fontSize: 11, color: '#A0AEC0' }}>{truck.year} · {truck.plate}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                              {truck.driver !== 'Unassigned' ? truck.driver.charAt(0) : '?'}
                            </div>
                            <span style={{ fontSize: 13 }}>{truck.driver}</span>
                          </div>
                        </td>
                        <td><StatusBadge status={truck.status} /></td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{truck.currentLocation}</td>
                        <td style={{ width: 90 }}><FuelBar pct={truck.fuelPct} /></td>
                        <td style={{ fontWeight: 700, color: '#38C770' }}>
                          {truck.revenueMonth > 0 ? `$${truck.revenueMonth.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ fontWeight: 700, color: margin >= 20 ? '#38C770' : margin > 0 ? '#F59E0B' : '#EF4444' }}>
                          {truck.revenueMonth > 0 ? `${margin}%` : '—'}
                        </td>
                        <td style={{
                          fontWeight: 700,
                          color: truck.nextService === 0 ? '#EF4444' : truck.nextService < 5000 ? '#F59E0B' : '#38C770',
                        }}>
                          {truck.nextService > 0 ? `${truck.nextService.toLocaleString()} mi` : '⚠️ Due'}
                        </td>
                        <td style={{
                          fontSize: 12, fontWeight: 700,
                          color: truck.dotExpiry.includes('Jun 2025') || truck.dotExpiry.includes('Aug 2025') ? '#EF4444' : '#2D3748',
                        }}>{truck.dotExpiry}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Fleet Performance Summary */}
          <div className="card" style={{ marginTop: 20 }}>
            <h3 className="section-title" style={{ marginBottom: 14 }}>📊 Fleet Performance — May 2025</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Unit</th>
                    <th>Driver</th>
                    <th>Loads</th>
                    <th>Miles</th>
                    <th>Revenue</th>
                    <th>Op. Cost</th>
                    <th>Profit</th>
                    <th>Margin</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {TRUCKS.map(truck => {
                    const profit = truck.revenueMonth - truck.operatingCostMonth
                    const margin = truck.revenueMonth > 0 ? Math.round((profit / truck.revenueMonth) * 100) : 0
                    return (
                      <tr key={truck.id}>
                        <td style={{ fontWeight: 800, color: '#4BAED4' }}>{truck.unit}</td>
                        <td style={{ fontSize: 13 }}>{truck.driver}</td>
                        <td style={{ fontWeight: 600 }}>{truck.loadsMonth}</td>
                        <td style={{ fontWeight: 600 }}>{truck.milesMonth.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: '#38C770' }}>
                          {truck.revenueMonth > 0 ? `$${truck.revenueMonth.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ color: '#EF4444' }}>${truck.operatingCostMonth.toLocaleString()}</td>
                        <td style={{ fontWeight: 800, color: profit > 0 ? '#4BAED4' : '#EF4444' }}>
                          {profit > 0 ? '+' : ''}${profit.toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 700, color: margin >= 20 ? '#38C770' : margin > 0 ? '#F59E0B' : '#EF4444' }}>
                          {truck.revenueMonth > 0 ? `${margin}%` : '—'}
                        </td>
                        <td>
                          <RevSparkline data={truck.revHistory} color={profit >= 0 ? '#38C770' : '#EF4444'} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#F7FAFC', fontWeight: 800 }}>
                    <td colSpan={4} style={{ paddingLeft: 16 }}>Fleet Total</td>
                    <td style={{ color: '#38C770' }}>${totalRev.toLocaleString()}</td>
                    <td style={{ color: '#EF4444' }}>${totalCost.toLocaleString()}</td>
                    <td style={{ color: '#4BAED4', fontSize: 15 }}>+${(totalRev - totalCost).toLocaleString()}</td>
                    <td style={{ color: fleetMargin >= 20 ? '#38C770' : '#F59E0B' }}>{fleetMargin}%</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="card" style={{ marginTop: 4 }}>
            <h3 className="section-title" style={{ marginBottom: 14 }}>🔧 Maintenance & Compliance Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ALERTS.map(alert => (
                <div key={alert.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: alert.severity === 'critical' ? '#FFF5F5' : alert.severity === 'warning' ? '#FFFBEB' : '#F0F9FF',
                  borderRadius: 10,
                  border: `1px solid ${alert.severity === 'critical' ? '#FED7D7' : alert.severity === 'warning' ? '#FDE68A' : '#BAE6FD'}`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: alert.severity === 'critical' ? '#EF4444' : alert.severity === 'warning' ? '#F59E0B' : '#4BAED4' }} />
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#2D3748', minWidth: 65 }}>{alert.truckUnit}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                    background: alert.severity === 'critical' ? '#FED7D7' : alert.severity === 'warning' ? '#FDE68A' : '#BAE6FD',
                    color: alert.severity === 'critical' ? '#C53030' : alert.severity === 'warning' ? '#92400E' : '#0369A1',
                  }}>{alert.type}</span>
                  <span style={{ fontSize: 13, color: '#718096', flex: 1 }}>{alert.message}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                    color: alert.severity === 'critical' ? '#EF4444' : '#F59E0B',
                  }}>Due: {alert.due}</span>
                  <button className="btn btn-ghost btn-sm">✓ Done</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <TruckDetailPanel truck={selected} onClose={() => setSelectedId(null)} />
        )}
      </div>

      {showAddModal && <AddTruckModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
