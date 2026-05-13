import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ServiceStatus = 'overdue' | 'due-soon' | 'ok' | 'completed'
type MainTab = 'schedule' | 'history' | 'costs' | 'parts' | 'reminders'

interface ServiceItem {
  id: number
  truckId: number
  truckUnit: string
  type: string
  interval: string
  lastDone: string
  lastMiles: number
  nextDue: string
  nextMiles: number
  currentMiles: number
  status: ServiceStatus
  cost?: string
  vendor?: string
  notes?: string
  priority: 'high' | 'medium' | 'low'
}

interface ServiceRecord {
  id: number
  truckUnit: string
  type: string
  date: string
  miles: number
  cost: string
  vendor: string
  notes: string
}

interface Part {
  id: number
  name: string
  category: string
  sku: string
  qty: number
  minQty: number
  unitCost: string
  totalValue: string
  lastOrdered: string
  supplier: string
}

interface Reminder {
  id: number
  truckUnit: string
  type: string
  dueDate: string
  daysLeft: number
  priority: 'high' | 'medium' | 'low'
  notes?: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const TRUCKS = [
  { id: 1, unit: 'Unit 01', year: '2021', make: 'Freightliner', model: 'Cascadia', miles: 284_200, health: 82 },
  { id: 2, unit: 'Unit 02', year: '2019', make: 'Kenworth',     model: 'T680',     miles: 412_800, health: 61 },
  { id: 3, unit: 'Unit 03', year: '2022', make: 'Peterbilt',    model: '579',       miles: 198_400, health: 94 },
  { id: 4, unit: 'Unit 05', year: '2018', make: 'Volvo',        model: 'VNL 760',  miles: 524_100, health: 48 },
]

const SCHEDULE: ServiceItem[] = [
  { id: 1,  truckId: 1, truckUnit: 'Unit 01', type: 'Oil Change',           interval: '15,000 mi', lastDone: 'Mar 12, 2025', lastMiles: 275_000, nextDue: 'Jun 5, 2025',  nextMiles: 290_000, currentMiles: 284_200, status: 'due-soon', cost: '$180', vendor: "Love's Truck Stop",    priority: 'high' },
  { id: 2,  truckId: 1, truckUnit: 'Unit 01', type: 'DOT Inspection',       interval: 'Annual',    lastDone: 'Jan 8, 2025',  lastMiles: 265_000, nextDue: 'Jan 8, 2026',  nextMiles: 0,       currentMiles: 284_200, status: 'ok',       priority: 'low' },
  { id: 3,  truckId: 1, truckUnit: 'Unit 01', type: 'Brake Inspection',     interval: '50,000 mi', lastDone: 'Nov 1, 2024',  lastMiles: 248_000, nextDue: 'May 20, 2025', nextMiles: 298_000, currentMiles: 284_200, status: 'due-soon', priority: 'high' },
  { id: 4,  truckId: 2, truckUnit: 'Unit 02', type: 'Oil Change',           interval: '15,000 mi', lastDone: 'Feb 20, 2025', lastMiles: 402_000, nextDue: 'Apr 28, 2025', nextMiles: 417_000, currentMiles: 412_800, status: 'overdue',  cost: '$195', priority: 'high' },
  { id: 5,  truckId: 2, truckUnit: 'Unit 02', type: 'Tire Rotation',        interval: '30,000 mi', lastDone: 'Dec 14, 2024', lastMiles: 392_000, nextDue: 'May 15, 2025', nextMiles: 422_000, currentMiles: 412_800, status: 'due-soon', priority: 'medium' },
  { id: 6,  truckId: 2, truckUnit: 'Unit 02', type: 'Coolant Flush',        interval: '100,000 mi',lastDone: 'Oct 3, 2023',  lastMiles: 318_000, nextDue: 'Oct 3, 2025',  nextMiles: 418_000, currentMiles: 412_800, status: 'due-soon', priority: 'medium' },
  { id: 7,  truckId: 3, truckUnit: 'Unit 03', type: 'Oil Change',           interval: '15,000 mi', lastDone: 'Apr 1, 2025',  lastMiles: 192_000, nextDue: 'Jul 10, 2025', nextMiles: 207_000, currentMiles: 198_400, status: 'ok',       cost: '$195', priority: 'low' },
  { id: 8,  truckId: 3, truckUnit: 'Unit 03', type: 'Annual Inspection',    interval: 'Annual',    lastDone: 'Mar 15, 2025', lastMiles: 190_000, nextDue: 'Mar 15, 2026', nextMiles: 0,       currentMiles: 198_400, status: 'ok',  vendor: 'Flying J', priority: 'low' },
  { id: 9,  truckId: 4, truckUnit: 'Unit 05', type: 'Oil Change',           interval: '15,000 mi', lastDone: 'Jan 15, 2025', lastMiles: 513_000, nextDue: 'Mar 10, 2025', nextMiles: 528_000, currentMiles: 524_100, status: 'overdue',  cost: '$210', priority: 'high' },
  { id: 10, truckId: 4, truckUnit: 'Unit 05', type: 'Transmission Service', interval: '60,000 mi', lastDone: 'Sep 4, 2024',  lastMiles: 480_000, nextDue: 'Jun 20, 2025', nextMiles: 540_000, currentMiles: 524_100, status: 'due-soon', priority: 'medium' },
  { id: 11, truckId: 4, truckUnit: 'Unit 05', type: 'Tire Replacement',     interval: '100,000 mi',lastDone: 'May 10, 2024', lastMiles: 438_000, nextDue: 'May 10, 2026', nextMiles: 538_000, currentMiles: 524_100, status: 'due-soon', cost: '$2,400', notes: 'Steer + drives x6', priority: 'high' },
  { id: 12, truckId: 2, truckUnit: 'Unit 02', type: 'Air Filter',           interval: '30,000 mi', lastDone: 'Jan 10, 2025', lastMiles: 390_000, nextDue: 'May 28, 2025', nextMiles: 420_000, currentMiles: 412_800, status: 'due-soon', cost: '$85',  priority: 'medium' },
  { id: 13, truckId: 1, truckUnit: 'Unit 01', type: 'ELD Recalibration',    interval: 'Annual',    lastDone: 'Jun 1, 2024',  lastMiles: 255_000, nextDue: 'Jun 1, 2025',  nextMiles: 0,       currentMiles: 284_200, status: 'due-soon', cost: '$0', vendor: 'KeepTruckin',  priority: 'medium' },
  { id: 14, truckId: 4, truckUnit: 'Unit 05', type: 'DEF System Check',     interval: '25,000 mi', lastDone: 'Feb 5, 2025',  lastMiles: 505_000, nextDue: 'Apr 20, 2025', nextMiles: 530_000, currentMiles: 524_100, status: 'overdue',  priority: 'high' },
  { id: 15, truckId: 3, truckUnit: 'Unit 03', type: 'Tire Rotation',        interval: '30,000 mi', lastDone: 'Dec 20, 2024', lastMiles: 180_000, nextDue: 'Jul 5, 2025',  nextMiles: 210_000, currentMiles: 198_400, status: 'ok',       priority: 'low' },
]

const HISTORY: ServiceRecord[] = [
  { id: 1, truckUnit: 'Unit 01', type: 'Oil Change',         date: 'Mar 12, 2025', miles: 275_000, cost: '$180',   vendor: "Love's Truck Stop", notes: '15W-40 Rotella, filter replaced' },
  { id: 2, truckUnit: 'Unit 03', type: 'Annual Inspection',  date: 'Mar 15, 2025', miles: 190_000, cost: '$250',   vendor: 'Flying J',          notes: 'Passed — minor adjustment to lights' },
  { id: 3, truckUnit: 'Unit 01', type: 'DOT Inspection',     date: 'Jan 8, 2025',  miles: 265_000, cost: '$0',     vendor: 'Roadside DOT',      notes: 'Level II — no violations' },
  { id: 4, truckUnit: 'Unit 03', type: 'Oil Change',         date: 'Apr 1, 2025',  miles: 192_000, cost: '$195',   vendor: 'TA Truck Service',  notes: '' },
  { id: 5, truckUnit: 'Unit 02', type: 'Brake Inspection',   date: 'Dec 1, 2024',  miles: 388_000, cost: '$320',   vendor: 'Speedco',           notes: 'Replaced rear brake pads unit 2' },
  { id: 6, truckUnit: 'Unit 05', type: 'Engine Repair',      date: 'Nov 20, 2024', miles: 498_000, cost: '$3,200', vendor: 'Volvo Dealer',      notes: 'Injector #3 replaced' },
  { id: 7, truckUnit: 'Unit 02', type: 'Oil Change',         date: 'Feb 20, 2025', miles: 402_000, cost: '$195',   vendor: 'Petro Truck Stop',  notes: '' },
  { id: 8, truckUnit: 'Unit 05', type: 'Tire Rotation',      date: 'Mar 5, 2025',  miles: 518_000, cost: '$180',   vendor: 'Speedco',           notes: 'All 18 tires rotated' },
]

const PARTS: Part[] = [
  { id: 1, name: 'Oil Filter (Freightliner)',  category: 'Filters',    sku: 'FF-5612',  qty: 4,  minQty: 2, unitCost: '$18',  totalValue: '$72',  lastOrdered: 'Apr 1',  supplier: 'FleetPride' },
  { id: 2, name: 'Air Filter (Universal)',     category: 'Filters',    sku: 'AF-1842',  qty: 2,  minQty: 2, unitCost: '$45',  totalValue: '$90',  lastOrdered: 'Mar 10', supplier: 'FleetPride' },
  { id: 3, name: 'Brake Pad Set (Front)',      category: 'Brakes',     sku: 'BP-4490',  qty: 3,  minQty: 2, unitCost: '$128', totalValue: '$384', lastOrdered: 'Feb 20', supplier: 'Rush Truck' },
  { id: 4, name: 'Engine Oil 15W-40 (1gal)',   category: 'Fluids',     sku: 'EO-1540',  qty: 24, minQty: 10,unitCost: '$12',  totalValue: '$288', lastOrdered: 'Apr 15', supplier: 'O\'Reilly' },
  { id: 5, name: 'DEF Fluid (2.5gal)',         category: 'Fluids',     sku: 'DEF-25',   qty: 8,  minQty: 6, unitCost: '$10',  totalValue: '$80',  lastOrdered: 'Apr 20', supplier: 'TA Truck' },
  { id: 6, name: 'Coolant (1gal)',             category: 'Fluids',     sku: 'CL-001',   qty: 1,  minQty: 4, unitCost: '$22',  totalValue: '$22',  lastOrdered: 'Jan 5',  supplier: 'FleetPride' },
  { id: 7, name: 'Light Bulb Set (7-pin)',     category: 'Electrical', sku: 'LB-7PIN',  qty: 6,  minQty: 3, unitCost: '$8',   totalValue: '$48',  lastOrdered: 'Mar 1',  supplier: 'Amazon' },
  { id: 8, name: 'Fuel Filter',               category: 'Filters',    sku: 'FF-7820',  qty: 0,  minQty: 2, unitCost: '$35',  totalValue: '$0',   lastOrdered: 'Dec 10', supplier: 'FleetPride' },
]

const REMINDERS: Reminder[] = [
  { id: 1, truckUnit: 'Unit 02', type: 'Oil Change',          dueDate: 'Apr 28, 2025', daysLeft: -14, priority: 'high',   notes: 'OVERDUE — schedule ASAP' },
  { id: 2, truckUnit: 'Unit 05', type: 'Oil Change',          dueDate: 'Mar 10, 2025', daysLeft: -62, priority: 'high',   notes: 'Critical — engine damage risk' },
  { id: 3, truckUnit: 'Unit 05', type: 'DEF System Check',    dueDate: 'Apr 20, 2025', daysLeft: -22, priority: 'high',   notes: 'OVERDUE' },
  { id: 4, truckUnit: 'Unit 01', type: 'Oil Change',          dueDate: 'Jun 5, 2025',  daysLeft: 24,  priority: 'high',   notes: '5,800 miles to next service' },
  { id: 5, truckUnit: 'Unit 01', type: 'Brake Inspection',    dueDate: 'May 20, 2025', daysLeft: 8,   priority: 'high',   notes: '13,800 mi to next service' },
  { id: 6, truckUnit: 'Unit 02', type: 'Air Filter',          dueDate: 'May 28, 2025', daysLeft: 16,  priority: 'medium', notes: '' },
  { id: 7, truckUnit: 'Unit 01', type: 'ELD Recalibration',   dueDate: 'Jun 1, 2025',  daysLeft: 20,  priority: 'medium', notes: 'Schedule with KeepTruckin' },
  { id: 8, truckUnit: 'Unit 05', type: 'Transmission Service',dueDate: 'Jun 20, 2025', daysLeft: 39,  priority: 'medium', notes: '15,900 mi remaining' },
]

// ── Monthly cost data ─────────────────────────────────────────────────────────
const MONTHLY_COSTS = [
  { month: 'Ноя', cost: 1240 },
  { month: 'Дек', cost: 1820 },
  { month: 'Янв', cost: 550  },
  { month: 'Фев', cost: 715  },
  { month: 'Мар', cost: 625  },
  { month: 'Апр', cost: 3200 },
]

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ServiceStatus, { label: string; color: string; bg: string; icon: string }> = {
  overdue:    { label: 'Overdue',  color: '#EF4444', bg: '#FEF2F2', icon: '🔴' },
  'due-soon': { label: 'Due Soon', color: '#F59E0B', bg: '#FFFBEB', icon: '🟡' },
  ok:         { label: 'OK',       color: '#38C770', bg: '#F0FDF4', icon: '🟢' },
  completed:  { label: 'Done',     color: '#718096', bg: '#F7FAFC', icon: '✅' },
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: c.bg, color: c.color }}>
      {c.icon} {c.label}
    </span>
  )
}

// ── Truck Health Card ─────────────────────────────────────────────────────────
function TruckHealthCard({ truck, onClick, active }: {
  truck: typeof TRUCKS[0]
  onClick: () => void
  active: boolean
}) {
  const color = truck.health >= 80 ? '#38C770' : truck.health >= 60 ? '#F59E0B' : '#EF4444'
  const overdue = SCHEDULE.filter(s => s.truckUnit === truck.unit && s.status === 'overdue').length
  const dueSoon = SCHEDULE.filter(s => s.truckUnit === truck.unit && s.status === 'due-soon').length

  return (
    <div onClick={onClick} style={{
      background: active ? '#EBF8FF' : '#fff', borderRadius: 12, padding: '14px 16px',
      border: `1.5px solid ${active ? '#4BAED4' : '#E2E8F0'}`, cursor: 'pointer',
      transition: 'all .15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535' }}>{truck.unit}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>{truck.year} {truck.make} {truck.model}</div>
          <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{truck.miles.toLocaleString()} mi</div>
        </div>
        {/* Health ring */}
        <div style={{ position: 'relative', width: 44, height: 44 }}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#F0F4F8" strokeWidth="5" />
            <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="5"
              strokeDasharray={`${(truck.health / 100) * 113} 113`}
              strokeLinecap="round" transform="rotate(-90 22 22)" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color,
          }}>{truck.health}%</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {overdue > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#EF4444', padding: '2px 7px', borderRadius: 6 }}>
            🔴 {overdue} overdue
          </span>
        )}
        {dueSoon > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, background: '#FFFBEB', color: '#D97706', padding: '2px 7px', borderRadius: 6 }}>
            🟡 {dueSoon} due soon
          </span>
        )}
        {overdue === 0 && dueSoon === 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, background: '#F0FDF4', color: '#38C770', padding: '2px 7px', borderRadius: 6 }}>
            ✅ All good
          </span>
        )}
      </div>
    </div>
  )
}

// ── Monthly Cost Trend ────────────────────────────────────────────────────────
function MonthlyCostChart() {
  const max = Math.max(...MONTHLY_COSTS.map(m => m.cost))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {MONTHLY_COSTS.map((m, i) => {
        const h = Math.round((m.cost / max) * 64)
        const isCurrent = i === MONTHLY_COSTS.length - 1
        return (
          <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: isCurrent ? '#EF4444' : '#A0AEC0' }}>
              ${(m.cost / 1000).toFixed(1)}k
            </div>
            <div style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: Math.max(3, h),
              background: isCurrent
                ? 'linear-gradient(180deg,#EF4444,#FC8181)'
                : 'linear-gradient(180deg,#CBD5E0,#A0AEC0)',
            }} />
            <div style={{ fontSize: 9, color: '#718096' }}>{m.month}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Add Record Modal ──────────────────────────────────────────────────────────
function AddServiceModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ truck: 'Unit 01', type: '', date: '', miles: '', cost: '', vendor: '', notes: '' })
  const SERVICE_TYPES = ['Oil Change', 'Tire Rotation', 'Brake Inspection', 'DOT Inspection', 'Annual Inspection', 'Coolant Flush', 'Transmission Service', 'Tire Replacement', 'Air Filter', 'DEF System Check', 'ELD Recalibration', 'Engine Repair', 'Other']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 30, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>🔧 Add Service Record</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#A0AEC0' }}>✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Truck',         key: 'truck',  type: 'select', opts: TRUCKS.map(t => t.unit) },
            { label: 'Service Type',  key: 'type',   type: 'select', opts: SERVICE_TYPES },
            { label: 'Date',          key: 'date',   type: 'date' },
            { label: 'Mileage',       key: 'miles',  type: 'number', placeholder: '284200' },
            { label: 'Cost ($)',      key: 'cost',   type: 'text',   placeholder: '180' },
            { label: 'Vendor / Shop', key: 'vendor', type: 'text',   placeholder: "Love's Truck Stop" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, color: '#2D3748' }}>
                  {f.opts?.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, color: '#2D3748', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Parts replaced, observations..." rows={3}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#718096' }}>Cancel</button>
          <button onClick={onClose} style={{ flex: 2, padding: '11px', borderRadius: 9, border: 'none', background: '#4BAED4', cursor: 'pointer', fontWeight: 800, fontSize: 14, color: '#fff' }}>Save Record</button>
        </div>
      </div>
    </div>
  )
}

// ── Schedule Detail Panel ─────────────────────────────────────────────────────
function ScheduleDetailPanel({ item, allHistory, onLog, onClose }: {
  item: ServiceItem
  allHistory: ServiceRecord[]
  onLog: () => void
  onClose: () => void
}) {
  const itemHistory = allHistory.filter(h => h.truckUnit === item.truckUnit && h.type === item.type)
  const pct = item.nextMiles > 0
    ? Math.min(100, Math.round(((item.currentMiles - item.lastMiles) / (item.nextMiles - item.lastMiles)) * 100))
    : 0
  const cfg = STATUS_CFG[item.status]

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{
        background: `linear-gradient(135deg,#1A2535,${cfg.color}44)`,
        padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700, letterSpacing: 1 }}>SERVICE ITEM</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{item.type}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{item.truckUnit} · {item.interval}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '4px 10px', fontSize: 13 }}>✕</button>
        </div>
        <StatusBadge status={item.status} />
        {item.nextMiles > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="progress-wrap" style={{ height: 5, background: 'rgba(255,255,255,.2)' }}>
              <div className="progress-bar" style={{
                width: `${pct}%`,
                background: item.status === 'overdue' ? '#EF4444' : item.status === 'due-soon' ? '#F59E0B' : '#38C770',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 3 }}>
              <span>{item.lastMiles.toLocaleString()} mi</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{pct}%</span>
              <span>{item.nextMiles.toLocaleString()} mi</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px', overflowY: 'auto', maxHeight: 450 }}>
        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Truck',            value: item.truckUnit },
            { label: 'Interval',         value: item.interval },
            { label: 'Last Done',        value: item.lastDone },
            { label: 'Last Mileage',     value: item.lastMiles.toLocaleString() + ' mi' },
            { label: 'Next Due',         value: item.nextDue, bold: true },
            { label: 'Current Mileage',  value: item.currentMiles.toLocaleString() + ' mi' },
            ...(item.nextMiles > 0 ? [{ label: 'Miles Left', value: Math.max(0, item.nextMiles - item.currentMiles).toLocaleString() + ' mi', bold: true }] : []),
            ...(item.cost   ? [{ label: 'Est. Cost',   value: item.cost }]   : []),
            ...(item.vendor ? [{ label: 'Last Vendor', value: item.vendor }] : []),
            ...(item.notes  ? [{ label: 'Notes',       value: item.notes }]  : []),
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 7, borderBottom: '1px solid #F0F4F8' }}>
              <span style={{ fontSize: 12, color: '#718096' }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: (row as any).bold ? 800 : 600, color: '#2D3748', maxWidth: 180, textAlign: 'right' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Service history for this type */}
        {itemHistory.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 8 }}>SERVICE HISTORY</div>
            {itemHistory.map(h => (
              <div key={h.id} style={{
                padding: '8px 10px', background: '#F7FAFC', borderRadius: 8, marginBottom: 6,
                borderLeft: '3px solid #4BAED4',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#2D3748' }}>{h.date}</span>
                  <span style={{ fontWeight: 700, color: '#EF4444' }}>{h.cost}</span>
                </div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{h.miles.toLocaleString()} mi · {h.vendor}</div>
                {h.notes && <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{h.notes}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <button onClick={onLog} style={{ width: '100%', padding: '10px', borderRadius: 9, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            + Log Service Now
          </button>
          <button style={{ width: '100%', padding: '10px', borderRadius: 9, background: '#fff', color: '#718096', border: '1.5px solid #E2E8F0', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            🔔 Set Reminder
          </button>
          <button style={{ width: '100%', padding: '10px', borderRadius: 9, background: '#fff', color: '#718096', border: '1.5px solid #E2E8F0', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            📋 Print Work Order
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Parts Tab ─────────────────────────────────────────────────────────────────
function PartsTab() {
  const [search, setSearch] = useState('')
  const lowStock = PARTS.filter(p => p.qty <= p.minQty)
  const filtered = PARTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )
  const totalValue = PARTS.reduce((s, p) => s + parseFloat(p.totalValue.replace(/[$,]/g, '') || '0'), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total Parts',    value: String(PARTS.length), color: '#4BAED4', icon: '🔩' },
          { label: 'Low Stock Items', value: String(lowStock.length), color: lowStock.length > 0 ? '#EF4444' : '#38C770', icon: '⚠️' },
          { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, color: '#8B5CF6', icon: '💰' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#718096' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>
            🛒 {lowStock.length} part{lowStock.length > 1 ? 's' : ''} need to be reordered
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {lowStock.map(p => (
              <span key={p.id} style={{ fontSize: 11, background: '#fff', border: '1px solid #FECACA', borderRadius: 6, padding: '2px 8px', color: '#C53030', fontWeight: 600 }}>
                {p.name} ({p.qty}/{p.minQty})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <input className="input" placeholder="🔍 Search parts..."
        value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />

      {/* Parts table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Part Name</th><th>Category</th><th>SKU</th><th>Qty</th>
              <th>Min Qty</th><th>Unit Cost</th><th>Total Value</th><th>Supplier</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const isLow = p.qty <= p.minQty
              return (
                <tr key={p.id} style={{ background: p.qty === 0 ? '#FEF2F2' : isLow ? '#FFFBEB' : undefined }}>
                  <td style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</td>
                  <td style={{ fontSize: 12, color: '#718096' }}>{p.category}</td>
                  <td style={{ fontSize: 11, color: '#A0AEC0', fontFamily: 'monospace' }}>{p.sku}</td>
                  <td style={{ fontWeight: 800, color: p.qty === 0 ? '#EF4444' : isLow ? '#D97706' : '#38C770' }}>
                    {p.qty}
                  </td>
                  <td style={{ color: '#718096', fontSize: 12 }}>{p.minQty}</td>
                  <td style={{ fontWeight: 600 }}>{p.unitCost}</td>
                  <td style={{ fontWeight: 700, color: '#8B5CF6' }}>{p.totalValue}</td>
                  <td style={{ fontSize: 12, color: '#718096' }}>{p.supplier}</td>
                  <td>
                    {p.qty === 0 ? (
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#EF4444', padding: '2px 7px', borderRadius: 6 }}>Out of Stock</span>
                    ) : isLow ? (
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#FFFBEB', color: '#D97706', padding: '2px 7px', borderRadius: 6 }}>Low Stock</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#F0FDF4', color: '#38C770', padding: '2px 7px', borderRadius: 6 }}>OK</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Reminders Tab ─────────────────────────────────────────────────────────────
function RemindersTab({ onLog }: { onLog: () => void }) {
  const overdue  = REMINDERS.filter(r => r.daysLeft < 0)
  const upcoming = REMINDERS.filter(r => r.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft)

  function ReminderCard({ r }: { r: Reminder }) {
    const isOverdue = r.daysLeft < 0
    const bg = isOverdue ? '#FEF2F2' : r.daysLeft <= 14 ? '#FFFBEB' : '#F0FDF4'
    const border = isOverdue ? '#FECACA' : r.daysLeft <= 14 ? '#FDE68A' : '#BBF7D0'
    const color = isOverdue ? '#EF4444' : r.daysLeft <= 14 ? '#D97706' : '#38C770'
    const label = isOverdue ? `${Math.abs(r.daysLeft)} days OVERDUE` : r.daysLeft === 0 ? 'Due today' : `In ${r.daysLeft} days`

    return (
      <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{r.type}</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 1 }}>{r.truckUnit} · {r.dueDate}</div>
            {r.notes && <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>{r.notes}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color }}>{label}</div>
            <button onClick={onLog} style={{
              marginTop: 6, padding: '5px 10px', borderRadius: 7, border: `1px solid ${border}`,
              background: '#fff', color: color, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>Log Service</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {overdue.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#EF4444', marginBottom: 10 }}>
            🚨 OVERDUE ({overdue.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {overdue.map(r => <ReminderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#2D3748', marginBottom: 10 }}>
            📅 UPCOMING ({upcoming.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(r => <ReminderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
  const [tab, setTab]               = useState<MainTab>('schedule')
  const [truckFilter, setTruck]     = useState('All')
  const [statusFilter, setStatus]   = useState<'all' | ServiceStatus>('all')
  const [showModal, setShowModal]   = useState(false)
  const [selected, setSelected]     = useState<ServiceItem | null>(null)
  const [activeTruckId, setActiveTruckId] = useState<number | null>(null)

  const overdue   = SCHEDULE.filter(s => s.status === 'overdue').length
  const dueSoon   = SCHEDULE.filter(s => s.status === 'due-soon').length
  const ok        = SCHEDULE.filter(s => s.status === 'ok').length
  const totalCost = HISTORY.reduce((s, r) => s + parseFloat(r.cost.replace(/[$,]/g, '')), 0)
  const lowParts  = PARTS.filter(p => p.qty <= p.minQty).length

  const filtered = SCHEDULE.filter(s =>
    (truckFilter === 'All' || s.truckUnit === truckFilter) &&
    (statusFilter === 'all' || s.status === statusFilter) &&
    (activeTruckId === null || s.truckId === activeTruckId)
  ).sort((a, b) => {
    const order = { overdue: 0, 'due-soon': 1, ok: 2, completed: 3 }
    return order[a.status] - order[b.status]
  })

  const costByTruck = TRUCKS.map(t => {
    const total = HISTORY.filter(h => h.truckUnit === t.unit).reduce((s, r) => s + parseFloat(r.cost.replace(/[$,]/g, '')), 0)
    return { ...t, cost: total }
  })
  const maxCost = Math.max(...costByTruck.map(t => t.cost))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI Row */}
      <div className="stats-grid">
        {[
          { label: 'Overdue',         value: String(overdue),                       change: 'Immediate attention',       up: false, color: '#EF4444', icon: '🔴' },
          { label: 'Due Soon',        value: String(dueSoon),                       change: '≤30 days or 2,000 mi',      up: false, color: '#F59E0B', icon: '🟡' },
          { label: 'Up to Date',      value: String(ok),                            change: 'No action needed',          up: true,  color: '#38C770', icon: '✅' },
          { label: 'YTD Maint. Cost', value: `$${totalCost.toLocaleString()}`,      change: `${lowParts} parts low stock`, up: false, color: '#8B5CF6', icon: '💸' },
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

      {/* Truck Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {TRUCKS.map(t => (
          <TruckHealthCard key={t.id} truck={t}
            onClick={() => { setActiveTruckId(activeTruckId === t.id ? null : t.id); setSelected(null); setTruck('All') }}
            active={activeTruckId === t.id}
          />
        ))}
      </div>

      {/* Alert Banner */}
      {overdue > 0 && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#EF4444', fontSize: 13 }}>
              {overdue} overdue service{overdue > 1 ? 's' : ''} — schedule immediately
            </strong>
            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
              {SCHEDULE.filter(s => s.status === 'overdue').map(s => `${s.truckUnit}: ${s.type}`).join(' · ')}
            </div>
          </div>
          <button onClick={() => setStatus('overdue')} style={{ padding: '7px 14px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Filter Overdue
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 12, padding: 4, gap: 2, width: 'fit-content' }}>
        {([
          ['schedule',  '📅 Schedule'],
          ['reminders', '🔔 Reminders'],
          ['history',   '📋 History'],
          ['parts',     '🔩 Parts'],
          ['costs',     '💰 Costs'],
        ] as [MainTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
            background: tab === key ? '#fff' : 'transparent',
            color: tab === key ? '#4BAED4' : '#718096',
            boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>
            {label}
            {key === 'reminders' && overdue > 0 && (
              <span style={{ marginLeft: 4, background: '#EF4444', color: '#fff', borderRadius: 10, fontSize: 9, padding: '1px 5px', fontWeight: 800 }}>{overdue}</span>
            )}
            {key === 'parts' && lowParts > 0 && (
              <span style={{ marginLeft: 4, background: '#F59E0B', color: '#fff', borderRadius: 10, fontSize: 9, padding: '1px 5px', fontWeight: 800 }}>{lowParts}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F4F8', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={truckFilter} onChange={e => { setTruck(e.target.value); setActiveTruckId(null) }}
                style={{ padding: '7px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#2D3748' }}>
                <option value="All">All Trucks</option>
                {TRUCKS.map(t => <option key={t.id}>{t.unit}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['all', 'overdue', 'due-soon', 'ok'] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)} style={{
                    padding: '5px 12px', borderRadius: 99, border: '1.5px solid', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    borderColor: statusFilter === s ? '#4BAED4' : '#E2E8F0',
                    background: statusFilter === s ? '#EBF8FF' : '#fff',
                    color: statusFilter === s ? '#4BAED4' : '#718096',
                  }}>{s === 'all' ? 'All' : STATUS_CFG[s].label}</button>
                ))}
              </div>
              <button onClick={() => setShowModal(true)} style={{ marginLeft: 'auto', padding: '7px 14px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                + Log Service
              </button>
              <span style={{ fontSize: 11, color: '#A0AEC0' }}>{filtered.length} items</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Truck</th><th>Service Type</th><th>Priority</th><th>Interval</th>
                  <th>Last Done</th><th>Next Due</th><th>Miles Left</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const milesToGo = item.nextMiles > 0 ? item.nextMiles - item.currentMiles : null
                  return (
                    <tr key={item.id}
                      onClick={() => setSelected(selected?.id === item.id ? null : item)}
                      style={{ cursor: 'pointer', background: selected?.id === item.id ? '#EBF8FF' : undefined }}>
                      <td style={{ fontWeight: 700 }}>{item.truckUnit}</td>
                      <td style={{ fontWeight: 600 }}>{item.type}</td>
                      <td>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                          background: item.priority === 'high' ? '#FEF2F2' : item.priority === 'medium' ? '#FFFBEB' : '#F0FDF4',
                          color: item.priority === 'high' ? '#EF4444' : item.priority === 'medium' ? '#D97706' : '#38C770',
                        }}>{item.priority}</span>
                      </td>
                      <td style={{ color: '#718096', fontSize: 12 }}>{item.interval}</td>
                      <td style={{ color: '#718096', fontSize: 12 }}>{item.lastDone}</td>
                      <td style={{ fontWeight: 600, color: item.status === 'overdue' ? '#EF4444' : item.status === 'due-soon' ? '#F59E0B' : '#2D3748', fontSize: 13 }}>
                        {item.nextDue}
                      </td>
                      <td>
                        {milesToGo !== null ? (
                          <span style={{ fontWeight: 700, color: milesToGo < 0 ? '#EF4444' : milesToGo < 3000 ? '#F59E0B' : '#38C770', fontSize: 12 }}>
                            {milesToGo < 0 ? `${Math.abs(milesToGo).toLocaleString()} OVER` : `${milesToGo.toLocaleString()} mi`}
                          </span>
                        ) : <span style={{ color: '#A0AEC0' }}>—</span>}
                      </td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selected && (
            <ScheduleDetailPanel
              item={selected}
              allHistory={HISTORY}
              onLog={() => setShowModal(true)}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}

      {/* ── REMINDERS TAB ── */}
      {tab === 'reminders' && <RemindersTab onLog={() => setShowModal(true)} />}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F4F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Service History — All Trucks</h3>
            <button onClick={() => setShowModal(true)} style={{ padding: '6px 14px', background: '#EBF8FF', color: '#4BAED4', border: '1.5px solid #BEE3F8', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              + Add Record
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Truck</th><th>Service Type</th><th>Date</th><th>Mileage</th><th>Cost</th><th>Vendor</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {[...HISTORY].sort((a, b) => b.id - a.id).map(rec => (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 700 }}>{rec.truckUnit}</td>
                  <td style={{ fontWeight: 600 }}>{rec.type}</td>
                  <td style={{ color: '#718096', fontSize: 12 }}>{rec.date}</td>
                  <td>{rec.miles.toLocaleString()} mi</td>
                  <td style={{ fontWeight: 700, color: '#EF4444' }}>{rec.cost}</td>
                  <td style={{ color: '#718096', fontSize: 12 }}>{rec.vendor || '—'}</td>
                  <td style={{ fontSize: 12, color: '#A0AEC0', maxWidth: 180 }}>{rec.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PARTS TAB ── */}
      {tab === 'parts' && <PartsTab />}

      {/* ── COSTS TAB ── */}
      {tab === 'costs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Monthly trend */}
            <div className="card">
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 4 }}>Monthly Cost Trend</div>
              <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 14 }}>Last 6 months · YTD: ${totalCost.toLocaleString()}</div>
              <MonthlyCostChart />
            </div>
            {/* Cost by truck */}
            <div className="card">
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 14 }}>Cost by Truck (YTD)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {costByTruck.sort((a, b) => b.cost - a.cost).map(t => (
                  <div key={t.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ fontWeight: 700 }}>{t.unit} — {t.year} {t.make}</span>
                      <span style={{ fontWeight: 800, color: '#EF4444' }}>${t.cost.toLocaleString()}</span>
                    </div>
                    <div className="progress-wrap" style={{ height: 8 }}>
                      <div className="progress-bar" style={{ width: `${Math.round((t.cost / maxCost) * 100)}%`, background: 'linear-gradient(90deg,#EF4444,#F87171)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost by type */}
          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 14 }}>Cost by Service Type</div>
            {(() => {
              const byType: Record<string, number> = {}
              HISTORY.forEach(r => { byType[r.type] = (byType[r.type] || 0) + parseFloat(r.cost.replace(/[$,]/g, '')) })
              const entries = Object.entries(byType).sort((a, b) => b[1] - a[1])
              const maxV = Math.max(...entries.map(e => e[1]))
              const COLORS = ['#4BAED4', '#38C770', '#F59E0B', '#8B5CF6', '#EF4444', '#A0AEC0']
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {entries.map(([type, cost], i) => (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                        <span style={{ fontWeight: 600, color: '#2D3748' }}>{type}</span>
                        <span style={{ fontWeight: 800, color: COLORS[i % 6] }}>${cost.toLocaleString()}</span>
                      </div>
                      <div className="progress-wrap" style={{ height: 7 }}>
                        <div className="progress-bar" style={{ width: `${Math.round((cost / maxV) * 100)}%`, background: COLORS[i % 6] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Expense table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F4F8', fontWeight: 800, fontSize: 14 }}>All Expenses (YTD)</div>
            <table className="data-table">
              <thead><tr><th>Truck</th><th>Service</th><th>Date</th><th>Vendor</th><th>Cost</th></tr></thead>
              <tbody>
                {[...HISTORY].sort((a, b) => parseFloat(b.cost.replace(/[$,]/g, '')) - parseFloat(a.cost.replace(/[$,]/g, ''))).map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.truckUnit}</td>
                    <td>{r.type}</td>
                    <td style={{ color: '#718096', fontSize: 12 }}>{r.date}</td>
                    <td style={{ color: '#718096', fontSize: 12 }}>{r.vendor}</td>
                    <td style={{ fontWeight: 800, color: '#EF4444' }}>{r.cost}</td>
                  </tr>
                ))}
                <tr style={{ background: '#F7FAFC' }}>
                  <td colSpan={4} style={{ fontWeight: 700, textAlign: 'right', paddingRight: 16, color: '#718096' }}>Total YTD</td>
                  <td style={{ fontWeight: 900, color: '#EF4444', fontSize: 15 }}>${totalCost.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <AddServiceModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
