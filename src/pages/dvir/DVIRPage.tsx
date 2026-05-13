import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────

type DefectSeverity = 'none' | 'minor' | 'major' | 'critical'
type InspectionType = 'pre-trip' | 'post-trip'
type InspectionStatus = 'passed' | 'defects-noted' | 'out-of-service'
type RepairStatus = 'pending' | 'in-progress' | 'repaired' | 'deferred'

interface ChecklistItem {
  id: string
  category: string
  item: string
  severity: DefectSeverity
  notes: string
  photos: number
}

interface DVIRRecord {
  id: string
  type: InspectionType
  date: string
  time: string
  truckId: string
  truckUnit: string
  driverName: string
  odometer: number
  status: InspectionStatus
  items: ChecklistItem[]
  defectCount: number
  criticalCount: number
  driverSignature: boolean
  mechanicSignature?: boolean
  notes: string
  trailerNumber?: string
}

interface PendingRepair {
  id: string
  dvir: string
  truckId: string
  date: string
  item: string
  category: string
  severity: DefectSeverity
  status: RepairStatus
  assignedTo?: string
  estimatedCost?: number
  notes: string
  photos: number
}

// ── Checklist Data ─────────────────────────────────────────────────────────────

const CHECKLIST_CATEGORIES = [
  {
    category: 'Brakes & Steering',
    icon: '🛑',
    items: [
      { id: 'b1', item: 'Service brakes (including trailer brake connections)' },
      { id: 'b2', item: 'Parking/emergency brake' },
      { id: 'b3', item: 'Steering mechanism (play, pull, binding)' },
      { id: 'b4', item: 'Brake lines and hoses (air leaks, wear)' },
    ]
  },
  {
    category: 'Tires & Wheels',
    icon: '⚫',
    items: [
      { id: 't1', item: 'Tire condition (tread depth, cuts, bulges)' },
      { id: 't2', item: 'Tire inflation (all axles including spare)' },
      { id: 't3', item: 'Wheel lug nuts (missing, loose, cracked)' },
      { id: 't4', item: 'Wheel seals and bearings (leaks, heat)' },
    ]
  },
  {
    category: 'Lights & Electrical',
    icon: '💡',
    items: [
      { id: 'l1', item: 'Headlights (high and low beam)' },
      { id: 'l2', item: 'Turn signals and hazard lights (all 4 corners)' },
      { id: 'l3', item: 'Brake lights (verify with helper or reflection)' },
      { id: 'l4', item: 'Clearance, marker, and identification lights' },
      { id: 'l5', item: 'Reflectors and reflective tape condition' },
    ]
  },
  {
    category: 'Engine & Fluids',
    icon: '🔧',
    items: [
      { id: 'e1', item: 'Engine oil level and leaks (check cap and dipstick)' },
      { id: 'e2', item: 'Coolant level and hoses (check overflow tank)' },
      { id: 'e3', item: 'Belts and hoses condition (cracks, wear, tension)' },
      { id: 'e4', item: 'Air filter and intake system' },
    ]
  },
  {
    category: 'Cab & Body',
    icon: '🚛',
    items: [
      { id: 'c1', item: 'Windshield (cracks, chips in driver view area)' },
      { id: 'c2', item: 'Mirrors (adjustment, cracks, mounting)' },
      { id: 'c3', item: 'Wipers and washers (blades, fluid, operation)' },
      { id: 'c4', item: 'Horn and warning devices' },
      { id: 'c5', item: 'Seat belts and seats (operation, tears, mounting)' },
      { id: 'c6', item: 'Emergency equipment (triangles, fire extinguisher, first aid)' },
    ]
  },
  {
    category: 'Coupling & Trailer',
    icon: '🔗',
    items: [
      { id: 'k1', item: 'Fifth wheel / kingpin coupling (locked, seated, no play)' },
      { id: 'k2', item: 'Trailer body, doors, and securing devices' },
      { id: 'k3', item: 'Glad hands and air lines (sealed, no leaks)' },
    ]
  },
]

// ── Mock Data ─────────────────────────────────────────────────────────────────

const INSPECTION_HISTORY: DVIRRecord[] = [
  {
    id: 'DVIR-0881', type: 'pre-trip', date: 'May 13, 2024', time: '06:14 AM',
    truckId: 'TRK-001', truckUnit: 'Peterbilt 389 #4412', driverName: 'Marcus Johnson',
    odometer: 284_420, status: 'passed', defectCount: 0, criticalCount: 0,
    driverSignature: true, notes: 'All systems checked and operational', trailerNumber: 'TRL-2281',
    items: []
  },
  {
    id: 'DVIR-0880', type: 'post-trip', date: 'May 12, 2024', time: '08:47 PM',
    truckId: 'TRK-001', truckUnit: 'Peterbilt 389 #4412', driverName: 'Marcus Johnson',
    odometer: 284_112, status: 'defects-noted', defectCount: 2, criticalCount: 0,
    driverSignature: true, mechanicSignature: false,
    notes: 'Minor defects noted — low beam headlight and tire wear on left front',
    trailerNumber: 'TRL-2281', items: []
  },
  {
    id: 'DVIR-0879', type: 'pre-trip', date: 'May 12, 2024', time: '05:58 AM',
    truckId: 'TRK-001', truckUnit: 'Peterbilt 389 #4412', driverName: 'Marcus Johnson',
    odometer: 283_890, status: 'passed', defectCount: 0, criticalCount: 0,
    driverSignature: true, notes: '', trailerNumber: 'TRL-2191', items: []
  },
  {
    id: 'DVIR-0878', type: 'post-trip', date: 'May 11, 2024', time: '07:22 PM',
    truckId: 'TRK-002', truckUnit: 'Kenworth T680 #2891', driverName: 'Darnell Williams',
    odometer: 198_774, status: 'out-of-service', defectCount: 4, criticalCount: 1,
    driverSignature: true, mechanicSignature: false,
    notes: 'CRITICAL: Right front brake chamber leaking. Truck placed OOS. Mechanic notified.',
    trailerNumber: 'TRL-3301', items: []
  },
  {
    id: 'DVIR-0877', type: 'pre-trip', date: 'May 11, 2024', time: '06:01 AM',
    truckId: 'TRK-002', truckUnit: 'Kenworth T680 #2891', driverName: 'Darnell Williams',
    odometer: 198_112, status: 'defects-noted', defectCount: 1, criticalCount: 0,
    driverSignature: true, notes: 'Left turn signal intermittent', trailerNumber: 'TRL-3301', items: []
  },
  {
    id: 'DVIR-0876', type: 'post-trip', date: 'May 10, 2024', time: '09:15 PM',
    truckId: 'TRK-003', truckUnit: 'Freightliner Cascadia #7734', driverName: 'Carlos Reyes',
    odometer: 412_009, status: 'passed', defectCount: 0, criticalCount: 0,
    driverSignature: true, notes: 'Clean inspection', trailerNumber: 'TRL-1104', items: []
  },
  {
    id: 'DVIR-0875', type: 'pre-trip', date: 'May 10, 2024', time: '05:45 AM',
    truckId: 'TRK-003', truckUnit: 'Freightliner Cascadia #7734', driverName: 'Carlos Reyes',
    odometer: 411_690, status: 'passed', defectCount: 0, criticalCount: 0,
    driverSignature: true, notes: '', trailerNumber: 'TRL-1104', items: []
  },
  {
    id: 'DVIR-0874', type: 'post-trip', date: 'May 9, 2024', time: '06:44 PM',
    truckId: 'TRK-001', truckUnit: 'Peterbilt 389 #4412', driverName: 'Marcus Johnson',
    odometer: 283_210, status: 'defects-noted', defectCount: 1, criticalCount: 0,
    driverSignature: true, notes: 'Windshield small chip — not in driver sightline',
    trailerNumber: 'TRL-2281', items: []
  },
  {
    id: 'DVIR-0873', type: 'pre-trip', date: 'May 9, 2024', time: '06:02 AM',
    truckId: 'TRK-001', truckUnit: 'Peterbilt 389 #4412', driverName: 'Marcus Johnson',
    odometer: 283_010, status: 'passed', defectCount: 0, criticalCount: 0,
    driverSignature: true, notes: '', trailerNumber: 'TRL-2191', items: []
  },
  {
    id: 'DVIR-0872', type: 'post-trip', date: 'May 8, 2024', time: '08:11 PM',
    truckId: 'TRK-002', truckUnit: 'Kenworth T680 #2891', driverName: 'Darnell Williams',
    odometer: 197_540, status: 'passed', defectCount: 0, criticalCount: 0,
    driverSignature: true, notes: '', trailerNumber: 'TRL-3301', items: []
  },
]

const INITIAL_REPAIRS: PendingRepair[] = [
  {
    id: 'REP-041', dvir: 'DVIR-0880', truckId: 'TRK-001', date: 'May 12',
    item: 'Low beam headlight (left side)', category: 'Lights & Electrical', severity: 'minor',
    status: 'pending', assignedTo: 'Shop Bay 2', estimatedCost: 85,
    notes: 'Bulb replacement needed', photos: 1
  },
  {
    id: 'REP-042', dvir: 'DVIR-0880', truckId: 'TRK-001', date: 'May 12',
    item: 'Tire wear — left front steer tire', category: 'Tires & Wheels', severity: 'major',
    status: 'in-progress', assignedTo: 'Tire Shop', estimatedCost: 650,
    notes: '< 4/32" tread depth on inside edge — cupped wear', photos: 3
  },
  {
    id: 'REP-043', dvir: 'DVIR-0878', truckId: 'TRK-002', date: 'May 11',
    item: 'Right front brake chamber leak', category: 'Brakes & Steering', severity: 'critical',
    status: 'in-progress', assignedTo: 'Fleet Mechanic — Rodriguez', estimatedCost: 420,
    notes: 'OOS condition. Brake chamber diaphragm failure. Parts ordered.', photos: 4
  },
  {
    id: 'REP-044', dvir: 'DVIR-0877', truckId: 'TRK-002', date: 'May 11',
    item: 'Left turn signal intermittent', category: 'Lights & Electrical', severity: 'minor',
    status: 'pending', assignedTo: undefined, estimatedCost: 45,
    notes: 'Loose connector at turn signal socket', photos: 0
  },
  {
    id: 'REP-045', dvir: 'DVIR-0874', truckId: 'TRK-001', date: 'May 9',
    item: 'Windshield chip (outside sightline)', category: 'Cab & Body', severity: 'minor',
    status: 'deferred', assignedTo: undefined, estimatedCost: 120,
    notes: 'Not in driver sightline — monitor. Repair at next PM service.', photos: 2
  },
]

const COMPLETED_REPAIRS: PendingRepair[] = [
  {
    id: 'REP-038', dvir: 'DVIR-0869', truckId: 'TRK-003', date: 'May 6',
    item: 'Coolant hose — upper radiator', category: 'Engine & Fluids', severity: 'major',
    status: 'repaired', assignedTo: 'Fleet Mechanic — Rodriguez', estimatedCost: 280,
    notes: 'Hose replaced. System pressure tested OK.', photos: 2
  },
  {
    id: 'REP-039', dvir: 'DVIR-0871', truckId: 'TRK-002', date: 'May 7',
    item: 'Trailer glad hand seal (rear)', category: 'Coupling & Trailer', severity: 'minor',
    status: 'repaired', assignedTo: 'Shop Bay 1', estimatedCost: 35,
    notes: 'Seal replaced. Air system re-tested.', photos: 1
  },
  {
    id: 'REP-040', dvir: 'DVIR-0870', truckId: 'TRK-001', date: 'May 7',
    item: 'Rear marker light (passenger side)', category: 'Lights & Electrical', severity: 'minor',
    status: 'repaired', assignedTo: 'Shop Bay 2', estimatedCost: 55,
    notes: 'Bulb and socket replaced.', photos: 0
  },
]

// ── Helper functions ──────────────────────────────────────────────────────────

function buildInitialItems(): ChecklistItem[] {
  const items: ChecklistItem[] = []
  for (const cat of CHECKLIST_CATEGORIES) {
    for (const it of cat.items) {
      items.push({ id: it.id, category: cat.category, item: it.item, severity: 'none', notes: '', photos: 0 })
    }
  }
  return items
}

function severityBg(s: DefectSeverity): string {
  if (s === 'minor') return '#FFFBF0'
  if (s === 'major') return '#FFF5F0'
  if (s === 'critical') return '#FFF0F0'
  return '#fff'
}

function severityBorder(s: DefectSeverity): string {
  if (s === 'minor') return '3px solid #F6AD55'
  if (s === 'major') return '3px solid #EF6C00'
  if (s === 'critical') return '3px solid #EF4444'
  return '3px solid transparent'
}

function severityColor(s: DefectSeverity): string {
  if (s === 'minor') return '#D97706'
  if (s === 'major') return '#EA580C'
  if (s === 'critical') return '#DC2626'
  return '#22C55E'
}

function severityLabel(s: DefectSeverity): string {
  if (s === 'minor') return '⚠️ Minor'
  if (s === 'major') return '🔴 Major'
  if (s === 'critical') return '⛔ Critical'
  return '✅ OK'
}

function statusBadgeStyle(status: InspectionStatus): React.CSSProperties {
  if (status === 'passed') return { background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC' }
  if (status === 'defects-noted') return { background: '#FEF9C3', color: '#CA8A04', border: '1px solid #FDE047' }
  return { background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }
}

function statusLabel(status: InspectionStatus): string {
  if (status === 'passed') return '✅ Passed'
  if (status === 'defects-noted') return '⚠️ Defects Noted'
  return '🔴 Out of Service'
}

function repairStatusStyle(s: RepairStatus): React.CSSProperties {
  if (s === 'pending') return { background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' }
  if (s === 'in-progress') return { background: '#DBEAFE', color: '#2563EB', border: '1px solid #93C5FD' }
  if (s === 'repaired') return { background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC' }
  return { background: '#F8FAFC', color: '#94A3B8', border: '1px solid #E2E8F0' }
}

function repairStatusLabel(s: RepairStatus): string {
  if (s === 'pending') return 'Pending'
  if (s === 'in-progress') return 'In Progress'
  if (s === 'repaired') return '✓ Repaired'
  return 'Deferred'
}

function severityBadgeStyle(s: DefectSeverity): React.CSSProperties {
  if (s === 'critical') return { background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }
  if (s === 'major') return { background: '#FFEDD5', color: '#EA580C', border: '1px solid #FDBA74' }
  if (s === 'minor') return { background: '#FEF9C3', color: '#CA8A04', border: '1px solid #FDE047' }
  return { background: '#DCFCE7', color: '#16A34A', border: '1px solid #86EFAC' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SeverityBtnProps {
  value: DefectSeverity
  current: DefectSeverity
  onClick: () => void
}

function SeverityBtn({ value, current, onClick }: SeverityBtnProps) {
  const active = value === current
  const labels: Record<DefectSeverity, string> = {
    none: '✅ OK',
    minor: '⚠️ Minor',
    major: '🔴 Major',
    critical: '⛔ Critical',
  }
  const colors: Record<DefectSeverity, string> = {
    none: '#22C55E',
    minor: '#D97706',
    major: '#EA580C',
    critical: '#DC2626',
  }
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        border: active ? `2px solid ${colors[value]}` : '1.5px solid #E2E8F0',
        background: active ? (value === 'none' ? '#DCFCE7' : value === 'minor' ? '#FEF9C3' : value === 'major' ? '#FFEDD5' : '#FEE2E2') : '#fff',
        color: active ? colors[value] : '#64748B',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {labels[value]}
    </button>
  )
}

interface ToastProps {
  message: string
}

function Toast({ message }: ToastProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#1A2535', color: '#fff', padding: '10px 20px', borderRadius: 10,
      fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

// ── KPI Strip ─────────────────────────────────────────────────────────────────

function KpiStrip() {
  const kpis = [
    { label: 'Inspections This Month', value: '18', icon: '📋', accent: '#4BAED4' },
    { label: 'Defects Found', value: '8', icon: '⚠️', accent: '#D97706' },
    { label: 'Out-of-Service Events', value: '1', icon: '🔴', accent: '#DC2626' },
    { label: 'Repairs Pending', value: '5', icon: '🔧', accent: '#EA580C' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {kpis.map(k => (
        <div key={k.label} style={{
          background: '#fff', borderRadius: 12, padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: `${k.accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
          }}>{k.icon}</div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.accent, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{k.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Tab 1: New Inspection ─────────────────────────────────────────────────────

interface NewInspectionTabProps {
  role: UserRole
}

function NewInspectionTab({ role }: NewInspectionTabProps) {
  const driverName = role === 'owner-op' ? 'Marcus Johnson' : 'Fleet Driver'
  const [inspType, setInspType] = useState<InspectionType>('pre-trip')
  const [truckId, setTruckId] = useState('TRK-001')
  const [trailer, setTrailer] = useState('TRL-2281')
  const [odometer, setOdometer] = useState('284420')
  const [items, setItems] = useState<ChecklistItem[]>(buildInitialItems)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [signed, setSigned] = useState(false)
  const [certified, setCertified] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState('')

  const trucks = [
    { id: 'TRK-001', label: 'TRK-001 — Peterbilt 389 #4412' },
    { id: 'TRK-002', label: 'TRK-002 — Kenworth T680 #2891' },
    { id: 'TRK-003', label: 'TRK-003 — Freightliner Cascadia #7734' },
  ]

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const allChecked = items.every(i => i.severity !== 'none')
  const defects = items.filter(i => i.severity !== 'none')
  const minorCount = items.filter(i => i.severity === 'minor').length
  const majorCount = items.filter(i => i.severity === 'major').length
  const criticalCount = items.filter(i => i.severity === 'critical').length
  const totalDefects = minorCount + majorCount + criticalCount

  const computedStatus: InspectionStatus = criticalCount > 0
    ? 'out-of-service'
    : totalDefects > 0
      ? 'defects-noted'
      : 'passed'

  const canSubmit = allChecked && signed && certified

  function setSeverity(id: string, severity: DefectSeverity) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, severity } : i))
  }

  function setNotes(id: string, notes: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i))
  }

  function addPhoto(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, photos: i.photos + 1 } : i))
    setToast('📷 Photo attached successfully')
    setTimeout(() => setToast(''), 2500)
  }

  function setAllOk(category: string) {
    setItems(prev => prev.map(i => i.category === category ? { ...i, severity: 'none' as DefectSeverity } : i))
  }

  function toggleCollapse(cat: string) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    setSubmitted(true)
    setToast('✅ Inspection submitted successfully — DVIR-0882 created')
    setTimeout(() => setToast(''), 4000)
  }

  function handleSaveDraft() {
    setToast('💾 Draft saved — DVIR-0882 (Draft)')
    setTimeout(() => setToast(''), 2500)
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 20 }}>
        <div style={{ fontSize: 72 }}>✅</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2535' }}>Inspection Submitted</div>
        <div style={{ fontSize: 15, color: '#64748B' }}>DVIR-0882 has been recorded and filed per 49 CFR Part 396.11</div>
        <button
          onClick={() => { setSubmitted(false); setItems(buildInitialItems()); setSigned(false); setCertified(false) }}
          style={{
            padding: '12px 28px', background: 'var(--c-primary)', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Start New Inspection
        </button>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {toast && <Toast message={toast} />}

      {/* Header form */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', marginBottom: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2535', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          📋 Inspection Details
        </div>

        {/* Type toggle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inspection Type</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['pre-trip', 'post-trip'] as InspectionType[]).map(t => (
              <button
                key={t}
                onClick={() => setInspType(t)}
                style={{
                  padding: '10px 20px', borderRadius: 20, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  border: '2px solid',
                  borderColor: inspType === t ? 'var(--c-primary)' : '#E2E8F0',
                  background: inspType === t ? '#EBF7FD' : '#fff',
                  color: inspType === t ? 'var(--c-primary)' : '#64748B',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'pre-trip' ? '🌅 Pre-Trip' : '🌆 Post-Trip'}
              </button>
            ))}
          </div>
        </div>

        {/* Grid form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Truck Unit</label>
            <select
              value={truckId}
              onChange={e => setTruckId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1A2535', background: '#fff' }}
            >
              {trucks.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trailer Number</label>
            <input
              value={trailer}
              onChange={e => setTrailer(e.target.value)}
              placeholder="TRL-XXXX"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1A2535', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Odometer (miles)</label>
            <input
              type="number"
              value={odometer}
              onChange={e => setOdometer(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1A2535', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
            <div style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#64748B', background: '#F8FAFC' }}>{dateStr}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</label>
            <div style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#64748B', background: '#F8FAFC' }}>{timeStr}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Driver Name</label>
            <div style={{ padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#64748B', background: '#F8FAFC' }}>{driverName}</div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2535', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          🔍 Vehicle Inspection Checklist
          <span style={{ fontSize: 12, fontWeight: 400, color: '#64748B' }}>— 49 CFR Part 396.11</span>
        </div>

        {CHECKLIST_CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat.category)
          const catDefects = catItems.filter(i => i.severity !== 'none')
          const isCollapsed = collapsed[cat.category]

          return (
            <div key={cat.category} style={{
              background: '#fff', borderRadius: 12, marginBottom: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}>
              {/* Category header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                  cursor: 'pointer', background: isCollapsed ? '#F8FAFC' : '#fff',
                  borderBottom: isCollapsed ? 'none' : '1px solid #F0F4F8',
                }}
                onClick={() => toggleCollapse(cat.category)}
              >
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2535' }}>{cat.category}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 8 }}>{cat.items.length} items</span>
                </div>
                {catDefects.length > 0 && (
                  <span style={{
                    background: catDefects.some(i => i.severity === 'critical') ? '#FEE2E2' : '#FFEDD5',
                    color: catDefects.some(i => i.severity === 'critical') ? '#DC2626' : '#EA580C',
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  }}>
                    {catDefects.length} defect{catDefects.length > 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); setAllOk(cat.category) }}
                  style={{
                    padding: '5px 12px', background: '#DCFCE7', color: '#16A34A',
                    border: '1px solid #86EFAC', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  All OK
                </button>
                <span style={{ fontSize: 16, color: '#94A3B8', marginLeft: 4 }}>{isCollapsed ? '▶' : '▼'}</span>
              </div>

              {/* Items */}
              {!isCollapsed && catItems.map((ci, idx) => {
                const defective = ci.severity !== 'none'
                return (
                  <div
                    key={ci.id}
                    style={{
                      padding: '14px 20px',
                      background: defective ? severityBg(ci.severity) : idx % 2 === 0 ? '#fff' : '#FAFBFC',
                      borderLeft: defective ? severityBorder(ci.severity) : '3px solid transparent',
                      borderBottom: idx < catItems.length - 1 ? '1px solid #F0F4F8' : 'none',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, fontSize: 14, color: '#1A2535', paddingTop: 4, lineHeight: 1.4 }}>{ci.item}</div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(['none', 'minor', 'major', 'critical'] as DefectSeverity[]).map(s => (
                          <SeverityBtn
                            key={s}
                            value={s}
                            current={ci.severity}
                            onClick={() => setSeverity(ci.id, s)}
                          />
                        ))}
                      </div>
                    </div>

                    {defective && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <input
                          value={ci.notes}
                          onChange={e => setNotes(ci.id, e.target.value)}
                          placeholder="Describe the defect..."
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: 8,
                            border: `1.5px solid ${severityColor(ci.severity)}40`,
                            fontSize: 13, color: '#1A2535',
                            background: '#fff',
                          }}
                        />
                        <button
                          onClick={() => addPhoto(ci.id)}
                          style={{
                            padding: '8px 14px', borderRadius: 8, background: '#F1F5F9',
                            border: '1.5px solid #CBD5E1', color: '#475569', fontSize: 13,
                            cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                          }}
                        >
                          📷 Add Photo
                          {ci.photos > 0 && (
                            <span style={{
                              background: 'var(--c-primary)', color: '#fff', borderRadius: '50%',
                              width: 18, height: 18, fontSize: 11, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {ci.photos}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Signature section */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', marginBottom: 20,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2535', marginBottom: 18 }}>✍️ Driver Signature</div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Signature pad */}
          <div>
            <div
              onClick={() => setSigned(!signed)}
              style={{
                width: 300, height: 100, borderRadius: 10,
                border: signed ? '2px solid #22C55E' : '2px dashed #CBD5E1',
                background: signed ? '#F0FFF4' : '#F8FAFC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {signed ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginTop: 4 }}>Signed ✓</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{driverName}</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                  <div style={{ fontSize: 24 }}>✍️</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Click to sign</div>
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>
              Driver: {driverName} · {trucks.find(t => t.id === truckId)?.label}
            </div>
          </div>

          {/* Certification */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{
              background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, color: '#0369A1', lineHeight: 1.6 }}>
                <strong>Federal Regulation Notice:</strong> Per 49 CFR Part 396.11, every driver
                operating a commercial motor vehicle must prepare a written report at the completion
                of each day's work covering the condition of each vehicle operated. Defects must be
                reported to the motor carrier.
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={certified}
                onChange={e => setCertified(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--c-primary)', flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                I certify this inspection was conducted in accordance with <strong>49 CFR Part 396.11</strong>.
                The above is a true and accurate report of the condition of this vehicle.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button
          onClick={handleSaveDraft}
          style={{
            padding: '12px 28px', background: '#F1F5F9', color: '#475569',
            border: '1.5px solid #CBD5E1', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          💾 Save Draft
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            padding: '12px 32px', background: canSubmit ? 'var(--c-primary)' : '#CBD5E1',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'background 0.15s',
          }}
        >
          Submit Inspection
        </button>
      </div>

      {/* Sticky summary bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 240, right: 0,
        background: '#1A2535', color: '#fff', padding: '14px 32px',
        display: 'flex', alignItems: 'center', gap: 24, zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Items checked: </span>
          <span style={{ fontWeight: 700 }}>{items.filter(i => i.severity !== 'none').length + (items.length - defects.length)}/{items.length}</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Defects: </span>
          <span style={{ fontWeight: 700, color: totalDefects > 0 ? '#FBBF24' : '#4ADE80' }}>
            {totalDefects}
            {totalDefects > 0 && ` (${majorCount > 0 ? `${majorCount} major` : ''}${majorCount > 0 && minorCount > 0 ? ', ' : ''}${minorCount > 0 ? `${minorCount} minor` : ''}${criticalCount > 0 ? `${criticalCount > 0 && (majorCount > 0 || minorCount > 0) ? ', ' : ''}${criticalCount} critical` : ''})`}
          </span>
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ fontSize: 13 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Status: </span>
          <span style={{ fontWeight: 700, color: computedStatus === 'passed' ? '#4ADE80' : computedStatus === 'defects-noted' ? '#FBBF24' : '#F87171' }}>
            {computedStatus === 'passed' ? '✅ Passed' : computedStatus === 'defects-noted' ? '⚠️ Defects Noted' : '🔴 Out of Service'}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        {!allChecked && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Mark all 24 items to enable submit</div>}
        {!signed && allChecked && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Driver signature required</div>}
        {signed && !certified && allChecked && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Check certification box to submit</div>}
      </div>
    </div>
  )
}

// ── Tab 2: History ─────────────────────────────────────────────────────────────

function HistoryTab() {
  const [truckFilter, setTruckFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = INSPECTION_HISTORY.filter(r => {
    if (truckFilter !== 'all' && r.truckId !== truckFilter) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (statusFilter === 'passed' && r.status !== 'passed') return false
    if (statusFilter === 'defects' && r.status !== 'defects-noted') return false
    if (statusFilter === 'oos' && r.status !== 'out-of-service') return false
    return true
  })

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '14px 20px', marginBottom: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0',
        display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginRight: 4 }}>Truck:</span>
          {['all', 'TRK-001', 'TRK-002', 'TRK-003'].map(f => (
            <button
              key={f}
              onClick={() => setTruckFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: truckFilter === f ? 'var(--c-primary)' : '#E2E8F0',
                background: truckFilter === f ? '#EBF7FD' : '#fff',
                color: truckFilter === f ? 'var(--c-primary)' : '#64748B',
              }}
            >
              {f === 'all' ? 'All Trucks' : f}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginRight: 4 }}>Type:</span>
          {[['all', 'All'], ['pre-trip', 'Pre-Trip'], ['post-trip', 'Post-Trip']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTypeFilter(v)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: typeFilter === v ? 'var(--c-primary)' : '#E2E8F0',
                background: typeFilter === v ? '#EBF7FD' : '#fff',
                color: typeFilter === v ? 'var(--c-primary)' : '#64748B',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginRight: 4 }}>Status:</span>
          {[['all', 'All'], ['passed', 'Passed'], ['defects', 'Defects'], ['oos', 'OOS']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid',
                borderColor: statusFilter === v ? 'var(--c-primary)' : '#E2E8F0',
                background: statusFilter === v ? '#EBF7FD' : '#fff',
                color: statusFilter === v ? 'var(--c-primary)' : '#64748B',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(record => (
          <div key={record.id} style={{
            background: '#fff', borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}>
            {/* Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' }}>
              <div style={{ minWidth: 100 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2535' }}>{record.date}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{record.time}</div>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: record.type === 'pre-trip' ? '#DBEAFE' : '#EDE9FE',
                color: record.type === 'pre-trip' ? '#1D4ED8' : '#7C3AED',
              }}>
                {record.type === 'pre-trip' ? '🌅 PRE-TRIP' : '🌆 POST-TRIP'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2535' }}>{record.truckUnit}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Driver: {record.driverName}</div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                ...statusBadgeStyle(record.status),
              }}>
                {statusLabel(record.status)}
              </span>
              {record.defectCount > 0 && (
                <span style={{ fontSize: 13, fontWeight: 700, color: record.criticalCount > 0 ? '#DC2626' : '#D97706' }}>
                  {record.defectCount} defect{record.defectCount > 1 ? 's' : ''}
                  {record.criticalCount > 0 && ` (${record.criticalCount} critical)`}
                </span>
              )}
              <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>#{record.id}</span>
              <button
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                style={{
                  padding: '7px 14px', background: 'var(--c-primary)', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {expandedId === record.id ? 'Close' : 'View Report'}
              </button>
            </div>

            {/* Expanded detail */}
            {expandedId === record.id && (
              <div style={{ borderTop: '1px solid #F0F4F8', padding: '20px 24px', background: '#F8FAFC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Truck Unit</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2535' }}>{record.truckUnit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Trailer</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2535' }}>{record.trailerNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Odometer</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2535' }}>{record.odometer.toLocaleString()} mi</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Driver Signature</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: record.driverSignature ? '#16A34A' : '#DC2626' }}>
                      {record.driverSignature ? '✅ Signed' : '❌ Missing'}
                    </div>
                  </div>
                </div>

                {record.notes && (
                  <div style={{
                    background: record.status === 'out-of-service' ? '#FEF2F2' : record.status === 'defects-noted' ? '#FFFBEB' : '#F0FFF4',
                    border: `1px solid ${record.status === 'out-of-service' ? '#FECACA' : record.status === 'defects-noted' ? '#FDE68A' : '#BBF7D0'}`,
                    borderRadius: 8, padding: 12, marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Inspector Notes</div>
                    <div style={{ fontSize: 13, color: '#374151' }}>{record.notes}</div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Mechanic Signature:
                    <span style={{ fontWeight: 700, color: record.mechanicSignature ? '#16A34A' : record.mechanicSignature === false ? '#DC2626' : '#94A3B8', marginLeft: 6 }}>
                      {record.mechanicSignature ? '✅ Signed' : record.mechanicSignature === false ? '⏳ Pending' : 'N/A'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button style={{
                    padding: '7px 16px', background: '#F1F5F9', color: '#475569',
                    border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    🖨️ Print Report
                  </button>
                  <button style={{
                    padding: '7px 16px', background: '#F1F5F9', color: '#475569',
                    border: '1.5px solid #CBD5E1', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 15 }}>
            No inspection records match the selected filters.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab 3: Pending Repairs ────────────────────────────────────────────────────

function PendingRepairsTab() {
  const [repairs, setRepairs] = useState<PendingRepair[]>(INITIAL_REPAIRS)
  const [showCompleted, setShowCompleted] = useState(false)
  const [toast, setToast] = useState('')

  const activeRepairs = repairs.filter(r => r.status !== 'repaired')
  const totalCost = activeRepairs.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0)
  const criticalCount = activeRepairs.filter(r => r.severity === 'critical').length

  function markRepaired(id: string) {
    setRepairs(prev => prev.map(r => r.id === id ? { ...r, status: 'repaired' as RepairStatus } : r))
    setToast('✅ Repair marked as completed')
    setTimeout(() => setToast(''), 2500)
  }

  const badgePill: React.CSSProperties = {
    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block',
  }

  return (
    <div>
      {toast && <Toast message={toast} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Table */}
        <div>
          <div style={{
            background: '#fff', borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F4F8', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A2535' }}>🔧 Active Repairs</span>
              <span style={{
                background: '#FFEDD5', color: '#EA580C', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              }}>
                {activeRepairs.length} open
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    {['ID', 'Truck', 'Item', 'Category', 'Severity', 'Status', 'Assigned To', 'Est. Cost', 'Photos', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {repairs.filter(r => r.status !== 'repaired').map((rep, idx) => (
                    <tr key={rep.id} style={{ borderBottom: '1px solid #F0F4F8', background: idx % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '12px 12px', fontWeight: 700, color: '#4BAED4', whiteSpace: 'nowrap' }}>{rep.id}</td>
                      <td style={{ padding: '12px 12px', fontWeight: 600, color: '#1A2535', whiteSpace: 'nowrap' }}>{rep.truckId}</td>
                      <td style={{ padding: '12px 12px', color: '#374151', maxWidth: 200 }}>
                        <div style={{ fontWeight: 600 }}>{rep.item}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{rep.dvir} · {rep.date}</div>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>{rep.category}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ ...badgePill, ...severityBadgeStyle(rep.severity) }}>
                          {rep.severity === 'critical' ? '⛔ Critical' : rep.severity === 'major' ? '🔴 Major' : '⚠️ Minor'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ ...badgePill, ...repairStatusStyle(rep.status) }}>
                          {repairStatusLabel(rep.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#374151', fontSize: 12 }}>
                        {rep.assignedTo || <span style={{ color: '#CBD5E1' }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '12px 12px', fontWeight: 700, color: '#1A2535', whiteSpace: 'nowrap' }}>
                        {rep.estimatedCost ? `$${rep.estimatedCost}` : '—'}
                      </td>
                      <td style={{ padding: '12px 12px', color: '#64748B' }}>
                        {rep.photos > 0 ? `📷 ${rep.photos}` : '—'}
                      </td>
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                          {(rep.status === 'pending' || rep.status === 'in-progress') && (
                            <button
                              onClick={() => markRepaired(rep.id)}
                              style={{
                                padding: '5px 10px', background: '#DCFCE7', color: '#16A34A',
                                border: '1px solid #86EFAC', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              }}
                            >
                              Mark Repaired
                            </button>
                          )}
                          <button style={{
                            padding: '5px 10px', background: '#F1F5F9', color: '#475569',
                            border: '1px solid #CBD5E1', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>
                            View DVIR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {repairs.filter(r => r.status !== 'repaired').length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                        ✅ All repairs completed — no open items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Completed repairs toggle */}
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 10,
                fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer',
              }}
            >
              {showCompleted ? '▼' : '▶'} Recently Completed Repairs
              <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                {COMPLETED_REPAIRS.length}
              </span>
            </button>

            {showCompleted && (
              <div style={{
                marginTop: 10, background: '#fff', borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', overflow: 'hidden',
              }}>
                {COMPLETED_REPAIRS.map((rep, idx) => (
                  <div key={rep.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    borderBottom: idx < COMPLETED_REPAIRS.length - 1 ? '1px solid #F0F4F8' : 'none',
                    background: idx % 2 === 0 ? '#fff' : '#FAFBFC',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    }}>✅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2535' }}>{rep.item}</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{rep.truckId} · {rep.category} · {rep.date}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{rep.assignedTo}</div>
                    <span style={{ fontWeight: 700, color: '#16A34A', fontSize: 13 }}>
                      ${rep.estimatedCost} — Repaired
                    </span>
                    <span style={{ ...badgePill, ...severityBadgeStyle(rep.severity) }}>
                      {rep.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary card */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0',
          position: 'sticky', top: 20,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2535', marginBottom: 18 }}>📊 Repair Summary</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Total Cost Pending</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#EA580C' }}>${totalCost.toLocaleString()}</div>
            </div>

            {criticalCount > 0 && (
              <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
                <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>🚨 Critical Alert</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626' }}>{criticalCount} Critical Item{criticalCount > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>Immediate attention required</div>
              </div>
            )}

            <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Avg Days to Repair</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2535' }}>2.4 days</div>
            </div>

            <div style={{ padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
              <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Trucks OOS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#DC2626' }}>1</div>
              <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>TRK-002 — Kenworth T680</div>
            </div>

            <div style={{ padding: 14, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>By Severity</div>
              {(['critical', 'major', 'minor'] as DefectSeverity[]).map(sev => {
                const count = activeRepairs.filter(r => r.severity === sev).length
                return (
                  <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ ...badgePill, ...severityBadgeStyle(sev), fontSize: 11 }}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </span>
                    <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: sev === 'critical' ? '#DC2626' : sev === 'major' ? '#EA580C' : '#D97706',
                        width: activeRepairs.length > 0 ? `${(count / activeRepairs.length) * 100}%` : '0%',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', minWidth: 16 }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main DVIRPage ──────────────────────────────────────────────────────────────

export default function DVIRPage({ role }: { role: UserRole }) {
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'repairs'>(
    role === 'owner-op' || role === 'company' ? 'new' : 'history'
  )

  const tabs: { id: 'new' | 'history' | 'repairs'; label: string; icon: string }[] = [
    { id: 'new', label: 'New Inspection', icon: '📋' },
    { id: 'history', label: 'History', icon: '📂' },
    { id: 'repairs', label: 'Pending Repairs', icon: '🔧' },
  ]

  return (
    <div style={{ padding: 28, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: 'var(--c-divider)', minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-dark)', margin: 0, marginBottom: 6 }}>
              🔍 DVIR — Driver Vehicle Inspection Reports
            </h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Pre-trip &amp; post-trip vehicle inspection logs · 49 CFR Part 396.11 compliance
            </p>
          </div>
          <div style={{
            background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 18 }}>⚖️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Federal Compliance Required</div>
              <div style={{ fontSize: 11, color: '#A16207' }}>Records must be kept 3 months minimum</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <KpiStrip />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20,
        background: '#fff', borderRadius: 12, padding: 6,
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0',
        width: 'fit-content',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              border: 'none',
              background: activeTab === tab.id ? 'var(--c-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#64748B',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'new' && <NewInspectionTab role={role} />}
      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'repairs' && <PendingRepairsTab />}
    </div>
  )
}
