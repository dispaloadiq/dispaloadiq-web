import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ─── Data Model ────────────────────────────────────────────────────────────────
type LoadStatus = 'completed' | 'in_transit' | 'booked' | 'cancelled' | 'tonu'
type LoadType = 'Dry Van' | 'Reefer' | 'Flatbed' | 'Hotshot'

interface CalendarLoad {
  id: string
  startDate: string
  endDate: string
  from: string
  fromState: string
  to: string
  toState: string
  miles: number
  rate: number
  payout: number
  type: LoadType
  status: LoadStatus
  broker: string
  driverName?: string
  truckId?: string
  commodity: string
  notes?: string
}

// ─── Color Scheme ──────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<LoadType, { bg: string; border: string; text: string }> = {
  'Dry Van':  { bg: '#EBF8FF', border: '#4BAED4', text: '#1A6B8A' },
  'Reefer':   { bg: '#F0FFF4', border: '#38C770', text: '#1A6B40' },
  'Flatbed':  { bg: '#FFFAF0', border: '#F6AD55', text: '#7B4F1A' },
  'Hotshot':  { bg: '#FFF5F5', border: '#FC8181', text: '#7B1A1A' },
}

const STATUS_DOT: Record<LoadStatus, string> = {
  'completed':  '#38C770',
  'in_transit': '#4BAED4',
  'booked':     '#F6AD55',
  'cancelled':  '#A0AEC0',
  'tonu':       '#FC8181',
}

const STATUS_LABEL: Record<LoadStatus, string> = {
  'completed':  'Completed',
  'in_transit': 'In Transit',
  'booked':     'Booked',
  'cancelled':  'Cancelled',
  'tonu':       'TONU',
}

const TYPE_ICON: Record<LoadType, string> = {
  'Dry Van': '🚚',
  'Reefer':  '❄️',
  'Flatbed': '🏗️',
  'Hotshot': '⚡',
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_LOADS: CalendarLoad[] = [
  // April 2024 (last week) — for navigation testing
  {
    id: 'LOAD-A01', startDate: '2024-04-22', endDate: '2024-04-23',
    from: 'Indianapolis', fromState: 'IN', to: 'Chicago', toState: 'IL',
    miles: 183, rate: 2.40, payout: 439, type: 'Dry Van', status: 'completed',
    broker: 'TQL', commodity: 'Auto Parts',
  },
  {
    id: 'LOAD-A02', startDate: '2024-04-23', endDate: '2024-04-24',
    from: 'Chicago', fromState: 'IL', to: 'Detroit', toState: 'MI',
    miles: 280, rate: 2.55, payout: 714, type: 'Hotshot', status: 'completed',
    broker: 'Echo Global', commodity: 'Electronics',
  },
  {
    id: 'LOAD-A03', startDate: '2024-04-25', endDate: '2024-04-26',
    from: 'Detroit', fromState: 'MI', to: 'Columbus', toState: 'OH',
    miles: 170, rate: 2.30, payout: 391, type: 'Dry Van', status: 'completed',
    broker: 'CH Robinson', commodity: 'General Freight',
  },
  {
    id: 'LOAD-A04', startDate: '2024-04-26', endDate: '2024-04-27',
    from: 'Columbus', fromState: 'OH', to: 'Pittsburgh', toState: 'PA',
    miles: 185, rate: 2.45, payout: 453, type: 'Reefer', status: 'completed',
    broker: 'Coyote', commodity: 'Produce',
  },
  {
    id: 'LOAD-A05', startDate: '2024-04-29', endDate: '2024-04-30',
    from: 'Pittsburgh', fromState: 'PA', to: 'Cleveland', toState: 'OH',
    miles: 132, rate: 2.20, payout: 290, type: 'Flatbed', status: 'completed',
    broker: 'XPO', commodity: 'Steel Coils',
  },
  // May 2024
  {
    id: 'LOAD-001', startDate: '2024-05-01', endDate: '2024-05-02',
    from: 'Chicago', fromState: 'IL', to: 'Dallas', toState: 'TX',
    miles: 850, rate: 2.18, payout: 1853, type: 'Dry Van', status: 'completed',
    broker: 'Echo Global', commodity: 'General Freight',
    notes: 'No-touch freight. Lumper available at delivery.',
  },
  {
    id: 'LOAD-002', startDate: '2024-05-03', endDate: '2024-05-03',
    from: 'Dallas', fromState: 'TX', to: 'Houston', toState: 'TX',
    miles: 240, rate: 2.45, payout: 588, type: 'Hotshot', status: 'completed',
    broker: 'TQL', commodity: 'Machine Parts',
  },
  {
    id: 'LOAD-003', startDate: '2024-05-05', endDate: '2024-05-06',
    from: 'Houston', fromState: 'TX', to: 'Phoenix', toState: 'AZ',
    miles: 1200, rate: 2.32, payout: 2784, type: 'Flatbed', status: 'completed',
    broker: 'CH Robinson', commodity: 'Construction Material',
    notes: 'Tarp required. 2 stop delivery.',
  },
  {
    id: 'LOAD-004', startDate: '2024-05-08', endDate: '2024-05-09',
    from: 'Phoenix', fromState: 'AZ', to: 'Los Angeles', toState: 'CA',
    miles: 370, rate: 2.71, payout: 1003, type: 'Reefer', status: 'completed',
    broker: 'XPO', commodity: 'Fresh Produce',
    driverName: 'Mike Johnson', truckId: 'TRK-201',
  },
  {
    id: 'LOAD-005', startDate: '2024-05-09', endDate: '2024-05-10',
    from: 'Los Angeles', fromState: 'CA', to: 'Seattle', toState: 'WA',
    miles: 1140, rate: 2.71, payout: 3090, type: 'Reefer', status: 'completed',
    broker: 'Coyote', commodity: 'Frozen Foods',
    driverName: 'Mike Johnson', truckId: 'TRK-201',
  },
  {
    id: 'LOAD-006', startDate: '2024-05-13', endDate: '2024-05-14',
    from: 'Seattle', fromState: 'WA', to: 'Portland', toState: 'OR',
    miles: 175, rate: 2.38, payout: 417, type: 'Dry Van', status: 'completed',
    broker: 'Transplace', commodity: 'Electronics',
  },
  {
    id: 'LOAD-007', startDate: '2024-05-14', endDate: '2024-05-15',
    from: 'Portland', fromState: 'OR', to: 'San Francisco', toState: 'CA',
    miles: 636, rate: 2.38, payout: 1514, type: 'Flatbed', status: 'completed',
    broker: 'Transplace', commodity: 'Lumber',
  },
  {
    id: 'LOAD-008', startDate: '2024-05-15', endDate: '2024-05-15',
    from: 'San Francisco', fromState: 'CA', to: 'Los Angeles', toState: 'CA',
    miles: 382, rate: 2.55, payout: 975, type: 'Dry Van', status: 'completed',
    broker: 'FreightWise', commodity: 'Consumer Goods',
  },
  {
    id: 'LOAD-009', startDate: '2024-05-18', endDate: '2024-05-19',
    from: 'Los Angeles', fromState: 'CA', to: 'Denver', toState: 'CO',
    miles: 1020, rate: 2.30, payout: 2346, type: 'Dry Van', status: 'completed',
    broker: 'Redwood', commodity: 'Retail Merchandise',
  },
  {
    id: 'LOAD-010', startDate: '2024-05-19', endDate: '2024-05-20',
    from: 'Denver', fromState: 'CO', to: 'Kansas City', toState: 'MO',
    miles: 600, rate: 2.10, payout: 1260, type: 'Dry Van', status: 'in_transit',
    broker: 'Worldwide Express', commodity: 'Auto Parts',
    driverName: 'Sarah Chen', truckId: 'TRK-105',
  },
  {
    id: 'LOAD-011', startDate: '2024-05-20', endDate: '2024-05-21',
    from: 'Kansas City', fromState: 'MO', to: 'Nashville', toState: 'TN',
    miles: 550, rate: 2.04, payout: 1122, type: 'Dry Van', status: 'booked',
    broker: 'Odyssey Logistics', commodity: 'Food Grade',
  },
  {
    id: 'LOAD-012', startDate: '2024-05-21', endDate: '2024-05-22',
    from: 'Nashville', fromState: 'TN', to: 'Atlanta', toState: 'GA',
    miles: 250, rate: 2.45, payout: 613, type: 'Reefer', status: 'booked',
    broker: 'Echo Global', commodity: 'Dairy Products',
  },
  {
    id: 'LOAD-013', startDate: '2024-05-22', endDate: '2024-05-23',
    from: 'Atlanta', fromState: 'GA', to: 'Miami', toState: 'FL',
    miles: 662, rate: 2.45, payout: 1622, type: 'Reefer', status: 'booked',
    broker: 'Coyote', commodity: 'Seafood',
  },
  {
    id: 'TONU-001', startDate: '2024-05-23', endDate: '2024-05-23',
    from: 'Miami', fromState: 'FL', to: 'Charlotte', toState: 'NC',
    miles: 0, rate: 0, payout: 750, type: 'Dry Van', status: 'tonu',
    broker: 'CH Robinson', commodity: 'N/A',
    notes: 'Shipper cancelled at dock. TONU fee collected.',
  },
  {
    id: 'LOAD-014', startDate: '2024-05-27', endDate: '2024-05-28',
    from: 'Charlotte', fromState: 'NC', to: 'New York', toState: 'NY',
    miles: 630, rate: 2.55, payout: 1607, type: 'Dry Van', status: 'booked',
    broker: 'Arrive Logistics', commodity: 'Consumer Electronics',
  },
  {
    id: 'LOAD-015', startDate: '2024-05-28', endDate: '2024-05-29',
    from: 'New York', fromState: 'NY', to: 'Boston', toState: 'MA',
    miles: 215, rate: 2.80, payout: 602, type: 'Hotshot', status: 'booked',
    broker: 'FreightWise', commodity: 'Pharmaceuticals',
  },
  {
    id: 'LOAD-016', startDate: '2024-05-29', endDate: '2024-05-30',
    from: 'Boston', fromState: 'MA', to: 'Chicago', toState: 'IL',
    miles: 980, rate: 2.30, payout: 2254, type: 'Dry Van', status: 'booked',
    broker: 'TQL', commodity: 'Medical Supplies',
  },
  {
    id: 'LOAD-017', startDate: '2024-05-30', endDate: '2024-05-31',
    from: 'Chicago', fromState: 'IL', to: 'Dallas', toState: 'TX',
    miles: 850, rate: 2.18, payout: 1853, type: 'Dry Van', status: 'booked',
    broker: 'Echo Global', commodity: 'General Freight',
  },
]

// Maintenance day
const MAINTENANCE_DAY = '2024-05-16'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDateStr(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m: m - 1, d }
}

function datesOverlap(startDate: string, endDate: string, cellDate: string): boolean {
  return cellDate >= startDate && cellDate <= endDate
}

function isLoadStarting(load: CalendarLoad, cellDate: string): boolean {
  return load.startDate === cellDate
}

function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function fmt$(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtMiles(n: number): string {
  return n.toLocaleString('en-US') + ' mi'
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_NAMES_LONG  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// ─── Subcomponents ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '18px 20px',
      flex: 1,
      minWidth: 130,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      border: '1px solid #F0F4F8',
    }}>
      <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent ? '#E07A1F' : '#1A2535', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

interface LoadBlockProps {
  load: CalendarLoad
  isContinuation: boolean
  onClick: (load: CalendarLoad) => void
  compact?: boolean
}

function LoadBlock({ load, isContinuation, onClick, compact }: LoadBlockProps) {
  const colors = TYPE_COLORS[load.type]
  const dotColor = STATUS_DOT[load.status]

  if (isContinuation) {
    return (
      <div
        onClick={() => onClick(load)}
        style={{
          background: colors.bg,
          borderLeft: `3px solid ${colors.border}`,
          borderRadius: 3,
          height: 8,
          marginBottom: 2,
          cursor: 'pointer',
          opacity: 0.7,
        }}
      />
    )
  }

  return (
    <div
      onClick={() => onClick(load)}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${colors.border}`,
        borderRadius: 5,
        padding: compact ? '3px 5px' : '4px 6px',
        marginBottom: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}>
        <span style={{ fontSize: compact ? 9 : 10 }}>{TYPE_ICON[load.type]}</span>
        <span style={{ fontSize: compact ? 9 : 10, fontWeight: 700, color: colors.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {load.fromState} → {load.toState}
        </span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      </div>
      {!compact && (
        <div style={{ fontSize: 10, color: colors.text, fontWeight: 700 }}>
          {fmt$(load.payout)}
        </div>
      )}
    </div>
  )
}

// ─── AddLoadModal ──────────────────────────────────────────────────────────────
interface AddLoadModalProps {
  onClose: () => void
  onAdd: (load: CalendarLoad) => void
}

function AddLoadModal({ onClose, onAdd }: AddLoadModalProps) {
  const [form, setForm] = useState({
    from: '', fromState: '', to: '', toState: '',
    startDate: '', endDate: '',
    type: 'Dry Van' as LoadType,
    rate: '', miles: '',
    broker: '', commodity: '', notes: '',
  })

  const payout = useMemo(() => {
    const r = parseFloat(form.rate)
    const m = parseFloat(form.miles)
    if (isNaN(r) || isNaN(m)) return 0
    return Math.round(r * m)
  }, [form.rate, form.miles])

  function handleSubmit() {
    if (!form.from || !form.to || !form.startDate || !form.endDate) return
    const newLoad: CalendarLoad = {
      id: 'LOAD-' + Date.now(),
      startDate: form.startDate,
      endDate: form.endDate,
      from: form.from,
      fromState: form.fromState,
      to: form.to,
      toState: form.toState,
      miles: parseFloat(form.miles) || 0,
      rate: parseFloat(form.rate) || 0,
      payout,
      type: form.type,
      status: 'booked',
      broker: form.broker,
      commodity: form.commodity,
      notes: form.notes,
    }
    onAdd(newLoad)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
    padding: '9px 12px', fontSize: 13, color: '#1A2535',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#718096',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,37,53,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, width: 520,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2535' }}>Add Load to Calendar</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#A0AEC0', padding: 4 }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>From City</label>
            <input style={inputStyle} placeholder="Chicago" value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input style={inputStyle} placeholder="IL" value={form.fromState} onChange={e => setForm(p => ({ ...p, fromState: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>To City</label>
            <input style={inputStyle} placeholder="Dallas" value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input style={inputStyle} placeholder="TX" value={form.toState} onChange={e => setForm(p => ({ ...p, toState: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Pickup Date</label>
            <input type="date" style={inputStyle} value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Est. Delivery Date</label>
            <input type="date" style={inputStyle} value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Load Type</label>
            <select style={inputStyle} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as LoadType }))}>
              <option>Dry Van</option>
              <option>Reefer</option>
              <option>Flatbed</option>
              <option>Hotshot</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Rate ($/mile)</label>
            <input style={inputStyle} type="number" step="0.01" placeholder="2.45" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Miles</label>
            <input style={inputStyle} type="number" placeholder="850" value={form.miles} onChange={e => setForm(p => ({ ...p, miles: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Est. Payout</label>
            <div style={{
              padding: '10px 14px', background: '#EBF8FF', border: '1px solid #4BAED4',
              borderRadius: 8, fontSize: 18, fontWeight: 800, color: '#1A6B8A',
            }}>
              {payout > 0 ? fmt$(payout) : '—'}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Broker</label>
            <input style={inputStyle} placeholder="Echo Global, TQL, CH Robinson..." value={form.broker} onChange={e => setForm(p => ({ ...p, broker: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Commodity</label>
            <input style={inputStyle} placeholder="General Freight, Produce, Electronics..." value={form.commodity} onChange={e => setForm(p => ({ ...p, commodity: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 64 }}
              placeholder="No-touch freight, layover info, special instructions..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', border: '1px solid #E2E8F0', background: '#fff',
              borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#718096', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 2, padding: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4BAED4, #2D7A9A)',
              borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}
          >
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── LoadDetailPanel ────────────────────────────────────────────────────────────
interface LoadDetailPanelProps {
  load: CalendarLoad
  role: UserRole
  onClose: () => void
}

function LoadDetailPanel({ load, role, onClose }: LoadDetailPanelProps) {
  const [notes, setNotes] = useState(load.notes || '')
  const colors = TYPE_COLORS[load.type]
  const dotColor = STATUS_DOT[load.status]
  const estHours = Math.round(load.miles / 55)

  const rowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '8px 0', borderBottom: '1px solid #F0F4F8',
  }
  const labelCol: React.CSSProperties = { fontSize: 11, color: '#A0AEC0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }
  const valueCol: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#1A2535', textAlign: 'right' }

  function ActionButtons() {
    const btnBase: React.CSSProperties = {
      flex: 1, padding: '10px 8px', borderRadius: 9, fontSize: 12, fontWeight: 700,
      cursor: 'pointer', border: 'none', textAlign: 'center',
    }
    if (load.status === 'completed') return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnBase, background: '#EBF8FF', color: '#1A6B8A', border: '1px solid #4BAED4' }}>View Invoice</button>
        <button style={{ ...btnBase, background: '#F0FFF4', color: '#1A6B40', border: '1px solid #38C770' }}>Download BOL</button>
      </div>
    )
    if (load.status === 'in_transit') return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnBase, background: '#4BAED4', color: '#fff' }}>Track Live</button>
        <button style={{ ...btnBase, background: '#EBF8FF', color: '#1A6B8A', border: '1px solid #4BAED4' }}>Update Status</button>
      </div>
    )
    if (load.status === 'booked') return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnBase, background: '#38C770', color: '#fff' }}>Confirm</button>
        <button style={{ ...btnBase, background: '#FFF5F5', color: '#7B1A1A', border: '1px solid #FC8181' }}>Cancel Load</button>
      </div>
    )
    if (load.status === 'tonu') return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...btnBase, background: '#FFF5F5', color: '#7B1A1A', border: '1px solid #FC8181' }}>View TONU Invoice</button>
      </div>
    )
    return null
  }

  return (
    <div style={{
      width: 340, flexShrink: 0, background: '#fff', borderLeft: '1px solid #F0F4F8',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #F0F4F8', background: '#FAFBFC' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600, marginBottom: 4 }}>LOAD ID</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{load.id}</div>
          </div>
          <button onClick={onClose} style={{
            background: '#F0F4F8', border: 'none', borderRadius: '50%',
            width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#718096',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{
            background: colors.bg, border: `1px solid ${colors.border}`,
            color: colors.text, borderRadius: 6, padding: '3px 10px',
            fontSize: 11, fontWeight: 700,
          }}>
            {TYPE_ICON[load.type]} {load.type}
          </span>
          <span style={{
            background: dotColor + '22', border: `1px solid ${dotColor}`,
            color: dotColor, borderRadius: 6, padding: '3px 10px',
            fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: dotColor, marginRight: 5, verticalAlign: 'middle' }} />
            {STATUS_LABEL[load.status]}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        {/* Route card */}
        <div style={{
          background: '#F7FAFC', borderRadius: 12, padding: '16px',
          marginBottom: 16, border: '1px solid #E2E8F0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', marginBottom: 6 }}>
            📍 {load.from}, {load.fromState}
          </div>
          <div style={{ fontSize: 11, color: '#A0AEC0', paddingLeft: 16, marginBottom: 6 }}>
            ↓ &nbsp;{load.miles > 0 ? fmtMiles(load.miles) : 'TONU'} &nbsp;·&nbsp; {load.miles > 0 ? `~${estHours} hrs` : 'Cancelled'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>
            📍 {load.to}, {load.toState}
          </div>
        </div>

        {/* Details grid */}
        <div style={{ marginBottom: 16 }}>
          <div style={rowStyle}>
            <span style={labelCol}>Pickup</span>
            <span style={valueCol}>{load.startDate}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelCol}>Delivery</span>
            <span style={valueCol}>{load.endDate}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelCol}>Commodity</span>
            <span style={valueCol}>{load.commodity}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelCol}>Broker</span>
            <span style={valueCol}>{load.broker}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelCol}>Miles</span>
            <span style={valueCol}>{load.miles > 0 ? fmtMiles(load.miles) : '—'}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelCol}>Rate</span>
            <span style={valueCol}>{load.rate > 0 ? `$${load.rate.toFixed(2)}/mi` : 'TONU'}</span>
          </div>
          {role === 'company' && load.driverName && (
            <div style={rowStyle}>
              <span style={labelCol}>Driver</span>
              <span style={valueCol}>{load.driverName}</span>
            </div>
          )}
          {role === 'company' && load.truckId && (
            <div style={rowStyle}>
              <span style={labelCol}>Truck</span>
              <span style={valueCol}>{load.truckId}</span>
            </div>
          )}
        </div>

        {/* Revenue breakdown */}
        <div style={{
          background: '#F0FFF4', border: '1px solid #38C770',
          borderRadius: 12, padding: '14px 16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1A6B40', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Revenue Breakdown
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: '#4A5568' }}>Base freight</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A2535' }}>{fmt$(load.payout)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: '#4A5568' }}>Detention</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#A0AEC0' }}>$0</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: '#4A5568' }}>Fuel surcharge</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#A0AEC0' }}>$0</span>
          </div>
          <div style={{ borderTop: '1px solid #38C770', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A6B40' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1A6B40' }}>{fmt$(load.payout)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ marginBottom: 16 }}>
          <ActionButtons />
        </div>

        {/* Notes */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Notes
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add load notes..."
            style={{
              width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '9px 12px', fontSize: 12, color: '#4A5568',
              resize: 'vertical', minHeight: 72, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Monthly Summary Table ──────────────────────────────────────────────────────
interface WeekSummary {
  label: string
  loads: number
  miles: number
  revenue: number
  idleDays: number
  avgRpm: number
}

function MonthlySummaryTable({ summaries }: { summaries: WeekSummary[] }) {
  const total: WeekSummary = summaries.reduce(
    (acc, w) => ({
      label: 'TOTAL',
      loads: acc.loads + w.loads,
      miles: acc.miles + w.miles,
      revenue: acc.revenue + w.revenue,
      idleDays: acc.idleDays + w.idleDays,
      avgRpm: 0,
    }),
    { label: '', loads: 0, miles: 0, revenue: 0, idleDays: 0, avgRpm: 0 }
  )
  if (total.miles > 0) {
    total.avgRpm = summaries.reduce((sum, w) => sum + w.avgRpm * w.miles, 0) / total.miles
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: '#718096', textTransform: 'uppercase',
    letterSpacing: '0.05em', background: '#F7FAFC', borderBottom: '2px solid #E2E8F0',
  }
  const tdStyle: React.CSSProperties = {
    padding: '10px 14px', fontSize: 13, color: '#1A2535', borderBottom: '1px solid #F0F4F8',
  }
  const tdTotalStyle: React.CSSProperties = {
    ...tdStyle, fontWeight: 800, background: '#EBF8FF', borderTop: '2px solid #4BAED4',
  }

  return (
    <div style={{ marginTop: 32, background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2535' }}>Monthly Summary</div>
        <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>Weekly performance breakdown</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Week</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Loads</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Miles</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Idle Days</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Avg RPM</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((w, i) => (
              <tr key={i}>
                <td style={tdStyle}>{w.label}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{w.loads}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{w.miles.toLocaleString()}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#1A6B8A' }}>{fmt$(w.revenue)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: w.idleDays > 0 ? '#E07A1F' : '#38C770', fontWeight: 600 }}>{w.idleDays}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>${w.avgRpm.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td style={tdTotalStyle}>TOTAL</td>
              <td style={{ ...tdTotalStyle, textAlign: 'right' }}>{total.loads}</td>
              <td style={{ ...tdTotalStyle, textAlign: 'right' }}>{total.miles.toLocaleString()}</td>
              <td style={{ ...tdTotalStyle, textAlign: 'right', color: '#1A6B8A' }}>{fmt$(total.revenue)}</td>
              <td style={{ ...tdTotalStyle, textAlign: 'right', color: total.idleDays > 0 ? '#E07A1F' : '#38C770' }}>{total.idleDays}</td>
              <td style={{ ...tdTotalStyle, textAlign: 'right' }}>${total.avgRpm.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function LoadCalendarPage({ role }: { role: UserRole }) {
  const today = new Date('2024-05-13') // pinned for demo
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [navYear, setNavYear] = useState(2024)
  const [navMonth, setNavMonth] = useState(4) // 0-indexed: 4 = May
  const [navWeekStart, setNavWeekStart] = useState<Date>(() => {
    // Start at Monday of the week containing today
    const d = new Date(today)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d
  })
  const [selectedLoad, setSelectedLoad] = useState<CalendarLoad | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [extraLoads, setExtraLoads] = useState<CalendarLoad[]>([])

  const allLoads = useMemo(() => [...MOCK_LOADS, ...extraLoads], [extraLoads])

  // ─ Derived: loads in current view ─
  const viewLoads = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = toDateStr(navYear, navMonth, 1)
      const daysInM = getDaysInMonth(navYear, navMonth)
      const monthEnd = toDateStr(navYear, navMonth, daysInM)
      return allLoads.filter(l =>
        l.startDate <= monthEnd && l.endDate >= monthStart
      )
    } else {
      const weekEndDate = new Date(navWeekStart)
      weekEndDate.setDate(weekEndDate.getDate() + 6)
      const ws = navWeekStart.toISOString().split('T')[0]
      const we = weekEndDate.toISOString().split('T')[0]
      return allLoads.filter(l => l.startDate <= we && l.endDate >= ws)
    }
  }, [allLoads, viewMode, navYear, navMonth, navWeekStart])

  // ─ KPIs ─
  const kpis = useMemo(() => {
    const revenue = viewLoads
      .filter(l => l.status !== 'cancelled')
      .reduce((s, l) => s + l.payout, 0)

    const totalMiles = viewLoads
      .filter(l => l.status !== 'cancelled' && l.status !== 'tonu')
      .reduce((s, l) => s + l.miles, 0)

    // Loaded days: unique days that have at least one non-cancelled load
    const loadedDaysSet = new Set<string>()
    viewLoads
      .filter(l => l.status !== 'cancelled')
      .forEach(l => {
        const start = parseDateStr(l.startDate)
        const end = parseDateStr(l.endDate)
        const s = new Date(start.y, start.m, start.d)
        const e = new Date(end.y, end.m, end.d)
        for (const d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          loadedDaysSet.add(d.toISOString().split('T')[0])
        }
      })
    const loadedDays = loadedDaysSet.size

    // Idle working days
    let idleDays = 0
    if (viewMode === 'month') {
      const daysInM = getDaysInMonth(navYear, navMonth)
      for (let d = 1; d <= daysInM; d++) {
        const dateStr = toDateStr(navYear, navMonth, d)
        const date = new Date(navYear, navMonth, d)
        if (!isWeekend(date) && dateStr !== MAINTENANCE_DAY && !loadedDaysSet.has(dateStr)) {
          idleDays++
        }
      }
    }

    const weightedRpm = viewLoads
      .filter(l => l.miles > 0 && l.status !== 'cancelled')
      .reduce((acc, l) => acc + l.rate * l.miles, 0)
    const totalMilesForRpm = viewLoads
      .filter(l => l.miles > 0 && l.status !== 'cancelled')
      .reduce((s, l) => s + l.miles, 0)
    const avgRpm = totalMilesForRpm > 0 ? weightedRpm / totalMilesForRpm : 0

    return { revenue, loadedDays, idleDays, avgRpm, totalMiles }
  }, [viewLoads, viewMode, navYear, navMonth])

  // ─ Navigation ─
  function prevPeriod() {
    if (viewMode === 'month') {
      if (navMonth === 0) { setNavYear(y => y - 1); setNavMonth(11) }
      else setNavMonth(m => m - 1)
    } else {
      setNavWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd })
    }
  }
  function nextPeriod() {
    if (viewMode === 'month') {
      if (navMonth === 11) { setNavYear(y => y + 1); setNavMonth(0) }
      else setNavMonth(m => m + 1)
    } else {
      setNavWeekStart(d => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd })
    }
  }

  function periodLabel(): string {
    if (viewMode === 'month') return `${MONTH_NAMES[navMonth]} ${navYear}`
    const we = new Date(navWeekStart)
    we.setDate(we.getDate() + 6)
    return `${navWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${we.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  // ─ Monthly summary data ─
  const monthlySummaries = useMemo((): WeekSummary[] => {
    if (viewMode !== 'month') return []
    const daysInM = getDaysInMonth(navYear, navMonth)
    const weeks: WeekSummary[] = []

    // Build week buckets (Mon–Sun, but we do calendar rows)
    const firstDay = getFirstDayOfMonth(navYear, navMonth)
    // Pad to start of grid
    const gridDays: string[] = []
    for (let i = 0; i < daysInM; i++) {
      gridDays.push(toDateStr(navYear, navMonth, i + 1))
    }

    // Group by weeks (Sun–Sat)
    const monthLoads = allLoads.filter(l => {
      const mStart = toDateStr(navYear, navMonth, 1)
      const mEnd = toDateStr(navYear, navMonth, daysInM)
      return l.startDate <= mEnd && l.endDate >= mStart
    })

    // 7-day buckets starting from first of month
    let d = 1
    let weekIdx = 0
    while (d <= daysInM) {
      const weekEnd = Math.min(d + 6, daysInM)
      const wStartStr = toDateStr(navYear, navMonth, d)
      const wEndStr   = toDateStr(navYear, navMonth, weekEnd)

      const wLoads = monthLoads.filter(l =>
        l.startDate <= wEndStr && l.endDate >= wStartStr
      )

      const rev = wLoads.filter(l => l.status !== 'cancelled').reduce((s, l) => s + l.payout, 0)
      const mil = wLoads.filter(l => l.miles > 0 && l.status !== 'cancelled').reduce((s, l) => s + l.miles, 0)
      const milForRpm = wLoads.filter(l => l.miles > 0 && l.status !== 'cancelled').reduce((s, l) => s + l.miles, 0)
      const wRpm = milForRpm > 0
        ? wLoads.filter(l => l.miles > 0 && l.status !== 'cancelled').reduce((acc, l) => acc + l.rate * l.miles, 0) / milForRpm
        : 0

      // Count idle weekdays in this week
      const loadedDaysSet = new Set<string>()
      wLoads.filter(l => l.status !== 'cancelled').forEach(l => {
        const s2 = parseDateStr(l.startDate)
        const e2 = parseDateStr(l.endDate)
        const sD = new Date(s2.y, s2.m, s2.d)
        const eD = new Date(e2.y, e2.m, e2.d)
        for (const nd = new Date(sD); nd <= eD; nd.setDate(nd.getDate() + 1)) {
          loadedDaysSet.add(nd.toISOString().split('T')[0])
        }
      })
      let idl = 0
      for (let dd = d; dd <= weekEnd; dd++) {
        const ds = toDateStr(navYear, navMonth, dd)
        const dt = new Date(navYear, navMonth, dd)
        if (!isWeekend(dt) && ds !== MAINTENANCE_DAY && !loadedDaysSet.has(ds)) idl++
      }

      weeks.push({
        label: `${MONTH_NAMES[navMonth].slice(0, 3)} ${d}–${weekEnd}`,
        loads: wLoads.filter(l => l.status !== 'cancelled').length,
        miles: mil,
        revenue: rev,
        idleDays: idl,
        avgRpm: wRpm,
      })
      d += 7
      weekIdx++
    }
    return weeks
  }, [allLoads, viewMode, navYear, navMonth])

  // ─ Month grid cells ─
  function buildMonthGrid() {
    const daysInM = getDaysInMonth(navYear, navMonth)
    const firstDay = getFirstDayOfMonth(navYear, navMonth) // 0=Sun
    const cells: Array<{ dateStr: string | null; dayNum: number | null; isCurrentMonth: boolean }> = []

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
      cells.push({ dateStr: null, dayNum: null, isCurrentMonth: false })
    }
    // Actual days
    for (let d = 1; d <= daysInM; d++) {
      cells.push({ dateStr: toDateStr(navYear, navMonth, d), dayNum: d, isCurrentMonth: true })
    }
    // Trailing empty to fill last row
    while (cells.length % 7 !== 0) {
      cells.push({ dateStr: null, dayNum: null, isCurrentMonth: false })
    }
    return cells
  }

  const monthCells = useMemo(() => buildMonthGrid(), [navYear, navMonth])

  function getLoadsForDate(dateStr: string): { load: CalendarLoad; starting: boolean }[] {
    return allLoads
      .filter(l => datesOverlap(l.startDate, l.endDate, dateStr))
      .map(l => ({ load: l, starting: isLoadStarting(l, dateStr) }))
  }

  // ─ Week view revenue per day ─
  function getWeekDays(): Date[] {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(navWeekStart)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    return days
  }

  const weekRevenue = useMemo(() => {
    return viewLoads.filter(l => l.status !== 'cancelled' && l.status !== 'tonu').reduce((s, l) => s + l.payout, 0)
  }, [viewLoads])

  // ─────────────────────── RENDER ───────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', background: '#F8FAFC' }}>
      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2535', margin: 0, lineHeight: 1.2 }}>
              📅 Load Calendar
            </h1>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>
              Visual schedule · Revenue tracking · Idle day alerts
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 9, padding: 3, gap: 2 }}>
              {(['month', 'week'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  style={{
                    padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                    background: viewMode === v ? '#4BAED4' : 'transparent',
                    color: viewMode === v ? '#fff' : '#718096',
                    transition: 'all 0.15s',
                  }}
                >
                  {v === 'month' ? 'Month' : 'Week'}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 9, padding: '4px 6px' }}>
              <button onClick={prevPeriod} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4BAED4', fontSize: 16, padding: '3px 8px', borderRadius: 6 }}>‹</button>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A2535', padding: '0 8px', minWidth: 140, textAlign: 'center' }}>
                {periodLabel()}
              </span>
              <button onClick={nextPeriod} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4BAED4', fontSize: 16, padding: '3px 8px', borderRadius: 6 }}>›</button>
            </div>

            {/* Add Load */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '9px 18px', background: 'linear-gradient(135deg, #4BAED4, #2D7A9A)',
                border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              + Add Load
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <KpiCard label="Revenue" value={fmt$(kpis.revenue)} sub={viewMode === 'month' ? 'This month' : 'This week'} />
          <KpiCard label="Loaded Days" value={String(kpis.loadedDays)} sub="Days with loads" />
          <KpiCard label="Idle Days" value={String(kpis.idleDays)} sub="Working days lost" accent={kpis.idleDays > 0} />
          <KpiCard label="Avg RPM" value={`$${kpis.avgRpm.toFixed(2)}`} sub="Per mile" />
          <KpiCard label="Miles" value={kpis.totalMiles.toLocaleString()} sub="Loaded miles" />
        </div>

        {/* ─── MONTH VIEW ─────────────────────────────────────────── */}
        {viewMode === 'month' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F7FAFC', borderBottom: '2px solid #E2E8F0' }}>
              {DAY_NAMES_SHORT.map(d => (
                <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {monthCells.map((cell, idx) => {
                const isWeekRow = Math.floor(idx / 7)
                const isLastOfRow = (idx + 1) % 7 === 0

                if (!cell.dateStr || !cell.dayNum) {
                  return (
                    <div key={idx} style={{
                      minHeight: 110, background: '#FAFAFA',
                      borderRight: isLastOfRow ? 'none' : '1px solid #F0F4F8',
                      borderBottom: '1px solid #F0F4F8',
                    }} />
                  )
                }

                const dateStr = cell.dateStr
                const date = new Date(navYear, navMonth, cell.dayNum)
                const weekend = isWeekend(date)
                const isMaintenance = dateStr === MAINTENANCE_DAY
                const isToday = dateStr === today.toISOString().split('T')[0]
                const loadsHere = getLoadsForDate(dateStr)
                const hasLoad = loadsHere.length > 0
                const isIdle = !weekend && !isMaintenance && !hasLoad

                let bg = weekend ? '#FAFAFA' : '#fff'
                let borderLeft = 'none'
                let borderRight = isLastOfRow ? 'none' : '1px solid #F0F4F8'

                if (isMaintenance) { bg = '#F7F7F7'; borderLeft = '3px solid #A0AEC0' }
                else if (isIdle) { bg = '#FFF8F0'; borderLeft = '3px solid #F6AD55' }

                // Week revenue — show on last cell of each row
                const weekDays = monthCells.slice(isWeekRow * 7, isWeekRow * 7 + 7)
                const weekRevAmt = weekDays
                  .filter(c => c.dateStr)
                  .flatMap(c => {
                    if (!c.dateStr) return []
                    return allLoads.filter(l =>
                      datesOverlap(l.startDate, l.endDate, c.dateStr!) && l.status !== 'cancelled'
                    )
                  })
                  // de-dupe by load id
                  .filter((l, i, arr) => arr.findIndex(x => x.id === l.id) === i)
                  .reduce((s, l) => s + l.payout, 0)

                return (
                  <div
                    key={dateStr}
                    style={{
                      minHeight: 110, padding: '6px 7px', background: bg,
                      borderLeft, borderRight,
                      borderBottom: '1px solid #F0F4F8',
                      outline: isToday ? '2px solid #4BAED4' : 'none',
                      outlineOffset: -2,
                      position: 'relative',
                    }}
                  >
                    {/* Day number */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 12, fontWeight: isToday ? 800 : 500,
                        color: isToday ? '#fff' : weekend ? '#CBD5E0' : '#4A5568',
                        background: isToday ? '#4BAED4' : 'transparent',
                        borderRadius: '50%', width: 22, height: 22, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* Special labels */}
                    {isMaintenance && (
                      <div style={{ fontSize: 9, color: '#718096', marginBottom: 3, fontWeight: 600 }}>🔧 Maintenance</div>
                    )}
                    {isIdle && (
                      <div style={{ fontSize: 9, color: '#E07A1F', marginBottom: 3, fontWeight: 600 }}>Idle — no revenue</div>
                    )}

                    {/* Load blocks */}
                    {loadsHere.map(({ load, starting }) => (
                      <LoadBlock
                        key={load.id + dateStr}
                        load={load}
                        isContinuation={!starting}
                        onClick={setSelectedLoad}
                        compact
                      />
                    ))}

                    {/* Week revenue on last column */}
                    {isLastOfRow && weekRevAmt > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 4, right: 6,
                        fontSize: 9, color: '#718096', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        Wk: {fmt$(weekRevAmt)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── WEEK VIEW ──────────────────────────────────────────── */}
        {viewMode === 'week' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {/* Week total header */}
            <div style={{ padding: '12px 20px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#718096', fontWeight: 600 }}>
                Week of {periodLabel()}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A6B8A' }}>
                Total: {fmt$(weekRevenue)}
              </span>
            </div>

            {/* Day columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 480 }}>
              {getWeekDays().map((date, idx) => {
                const dateStr = date.toISOString().split('T')[0]
                const loadsHere = getLoadsForDate(dateStr)
                const dayRevenue = loadsHere
                  .filter(({ load }) => load.status !== 'cancelled' && isLoadStarting(load, dateStr))
                  .reduce((s, { load }) => s + load.payout, 0)
                const isWeekendDay = isWeekend(date)
                const isMaintenance = dateStr === MAINTENANCE_DAY
                const isToday = dateStr === today.toISOString().split('T')[0]
                const hasLoad = loadsHere.length > 0
                const isIdle = !isWeekendDay && !isMaintenance && !hasLoad

                return (
                  <div key={dateStr} style={{
                    borderRight: idx < 6 ? '1px solid #F0F4F8' : 'none',
                    background: isWeekendDay ? '#FAFAFA' : isMaintenance ? '#F7F7F7' : isIdle ? '#FFF8F0' : '#fff',
                    borderLeft: isMaintenance ? '3px solid #A0AEC0' : isIdle ? '3px solid #F6AD55' : 'none',
                    outline: isToday ? '2px inset #4BAED4' : 'none',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* Day header */}
                    <div style={{
                      padding: '12px 10px 8px', textAlign: 'center',
                      borderBottom: '1px solid #F0F4F8', background: isToday ? '#EBF8FF' : 'transparent',
                    }}>
                      <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {DAY_NAMES_LONG[date.getDay()].slice(0, 3)}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: isToday ? '#4BAED4' : '#1A2535', lineHeight: 1.2 }}>
                        {date.getDate()}
                      </div>
                      <div style={{ fontSize: 9, color: '#A0AEC0' }}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>

                    {/* Load cards */}
                    <div style={{ flex: 1, padding: '8px 6px' }}>
                      {isMaintenance && !hasLoad && (
                        <div style={{ fontSize: 10, color: '#718096', textAlign: 'center', padding: '8px 4px', fontWeight: 600 }}>
                          🔧 Maintenance Day
                        </div>
                      )}
                      {isIdle && (
                        <div style={{ fontSize: 10, color: '#E07A1F', textAlign: 'center', padding: '8px 4px', fontWeight: 600 }}>
                          Idle — no revenue
                        </div>
                      )}
                      {loadsHere.map(({ load, starting }) => {
                        const colors = TYPE_COLORS[load.type]
                        const dotColor = STATUS_DOT[load.status]
                        if (!starting) {
                          return (
                            <div key={load.id} onClick={() => setSelectedLoad(load)} style={{
                              background: colors.bg, borderLeft: `3px solid ${colors.border}`,
                              borderRadius: 6, padding: '4px 7px', marginBottom: 6, cursor: 'pointer',
                              opacity: 0.6,
                            }}>
                              <div style={{ fontSize: 9, color: colors.text, fontWeight: 600 }}>← continues</div>
                            </div>
                          )
                        }
                        return (
                          <div key={load.id} onClick={() => setSelectedLoad(load)} style={{
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            borderLeft: `3px solid ${colors.border}`, borderRadius: 8,
                            padding: '8px 10px', marginBottom: 8, cursor: 'pointer',
                            transition: 'box-shadow 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                          >
                            <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 3, fontWeight: 600 }}>{load.id}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, marginBottom: 3 }}>
                              {load.from}, {load.fromState}
                            </div>
                            <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 2 }}>→ {load.to}, {load.toState}</div>
                            <div style={{ fontSize: 10, color: '#718096', marginBottom: 4 }}>
                              {load.miles > 0 ? fmtMiles(load.miles) : 'TONU'} · {load.broker}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: colors.text }}>{fmt$(load.payout)}</span>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                background: dotColor + '22', color: dotColor, border: `1px solid ${dotColor}`,
                              }}>
                                {STATUS_LABEL[load.status]}
                              </span>
                            </div>
                            <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 4 }}>
                              Pickup ~08:00 · Del ~{load.endDate}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Day footer revenue */}
                    <div style={{
                      padding: '6px 8px', borderTop: '1px solid #F0F4F8', textAlign: 'center',
                      background: '#FAFBFC', fontSize: 10, fontWeight: 700,
                      color: dayRevenue > 0 ? '#1A6B8A' : isIdle ? '#E07A1F' : '#A0AEC0',
                    }}>
                      {dayRevenue > 0 ? fmt$(dayRevenue) : isIdle ? 'Idle' : isWeekendDay ? 'Weekend' : isMaintenance ? 'Maint.' : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Monthly Summary Table */}
        {viewMode === 'month' && monthlySummaries.length > 0 && (
          <MonthlySummaryTable summaries={monthlySummaries} />
        )}

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          {(Object.entries(TYPE_COLORS) as [LoadType, { bg: string; border: string; text: string }][]).map(([type, c]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, background: c.bg, border: `2px solid ${c.border}`, borderRadius: 3 }} />
              <span style={{ fontSize: 11, color: '#718096' }}>{TYPE_ICON[type as LoadType]} {type}</span>
            </div>
          ))}
          {(Object.entries(STATUS_DOT) as [LoadStatus, string][]).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: '#718096' }}>{STATUS_LABEL[status]}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, background: '#FFF8F0', borderLeft: '3px solid #F6AD55', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: '#718096' }}>Idle Day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 12, height: 12, background: '#F7F7F7', borderLeft: '3px solid #A0AEC0', borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: '#718096' }}>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedLoad && (
        <LoadDetailPanel
          load={selectedLoad}
          role={role}
          onClose={() => setSelectedLoad(null)}
        />
      )}

      {/* Add Load Modal */}
      {showAddModal && (
        <AddLoadModal
          onClose={() => setShowAddModal(false)}
          onAdd={load => setExtraLoads(prev => [...prev, load])}
        />
      )}
    </div>
  )
}
