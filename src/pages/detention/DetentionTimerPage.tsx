import { useState, useEffect, useRef } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────

type TimerState = 'idle' | 'grace' | 'billing' | 'stopped'
type TimerPhase = 'pickup' | 'delivery'
type RightTab = 'history' | 'pending' | 'settings'
type DetentionStatus = 'paid' | 'pending' | 'disputed' | 'waived'

interface DetentionEvent {
  id: string
  loadId: string
  broker: string
  location: string
  type: 'pickup' | 'delivery'
  date: string
  started: string
  totalTime: string
  gracePeriod: string
  billableTime: string
  amount: number
  status: DetentionStatus
  invoiceNumber: string
  notes: string
}

interface MockLoad {
  id: string
  broker: string
  route: string
  eventType: 'Pickup' | 'Delivery'
  date: string
}

interface PendingInvoice {
  id: string
  loadId: string
  broker: string
  amount: number
  daysOverdue: number
  invoiceNumber: string
  dueDate: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const GRACE_PERIOD_DEFAULT = 7200 // 2 hours in seconds
const RATE_DEFAULT = 75 // dollars per hour

const MOCK_LOADS: MockLoad[] = [
  { id: 'LOAD-9841', broker: 'Echo Global', route: 'Chicago → Dallas', eventType: 'Pickup', date: 'May 14' },
  { id: 'LOAD-9788', broker: 'TQL', route: 'Atlanta → Miami', eventType: 'Delivery', date: 'May 15' },
  { id: 'LOAD-0023', broker: 'CH Robinson', route: 'Denver → Phoenix', eventType: 'Pickup', date: 'May 16' },
]

const DETENTION_HISTORY: DetentionEvent[] = [
  {
    id: 'det-001',
    loadId: 'LOAD-9721',
    broker: 'Echo Global',
    location: 'Chicago, IL',
    type: 'pickup',
    date: 'May 10, 2024',
    started: '08:15 AM',
    totalTime: '4h 15m',
    gracePeriod: '2h 00m',
    billableTime: '2h 15m',
    amount: 168.75,
    status: 'paid',
    invoiceNumber: 'DET-2024-0046',
    notes: 'Dock congestion, waited for loading crew',
  },
  {
    id: 'det-002',
    loadId: 'LOAD-9655',
    broker: 'TQL',
    location: 'Atlanta, GA',
    type: 'delivery',
    date: 'May 8, 2024',
    started: '02:30 PM',
    totalTime: '3h 45m',
    gracePeriod: '2h 00m',
    billableTime: '1h 45m',
    amount: 131.25,
    status: 'paid',
    invoiceNumber: 'DET-2024-0045',
    notes: 'Receiver short staffed',
  },
  {
    id: 'det-003',
    loadId: 'LOAD-9580',
    broker: 'CH Robinson',
    location: 'Dallas, TX',
    type: 'pickup',
    date: 'May 6, 2024',
    started: '10:00 AM',
    totalTime: '6h 30m',
    gracePeriod: '2h 00m',
    billableTime: '4h 30m',
    amount: 337.50,
    status: 'disputed',
    invoiceNumber: 'DET-2024-0044',
    notes: 'Shipper claims dock closure due to safety inspection',
  },
  {
    id: 'det-004',
    loadId: 'LOAD-9512',
    broker: 'Coyote',
    location: 'Memphis, TN',
    type: 'delivery',
    date: 'May 4, 2024',
    started: '09:45 AM',
    totalTime: '2h 50m',
    gracePeriod: '2h 00m',
    billableTime: '0h 50m',
    amount: 62.50,
    status: 'pending',
    invoiceNumber: 'DET-2024-0043',
    notes: 'Minor overage past grace period',
  },
  {
    id: 'det-005',
    loadId: 'LOAD-9488',
    broker: 'XPO Logistics',
    location: 'Houston, TX',
    type: 'pickup',
    date: 'May 2, 2024',
    started: '07:30 AM',
    totalTime: '1h 45m',
    gracePeriod: '2h 00m',
    billableTime: '0h 00m',
    amount: 0,
    status: 'waived',
    invoiceNumber: 'N/A',
    notes: 'Within grace period — no charge',
  },
  {
    id: 'det-006',
    loadId: 'LOAD-9401',
    broker: 'Echo Global',
    location: 'Phoenix, AZ',
    type: 'delivery',
    date: 'Apr 29, 2024',
    started: '11:15 AM',
    totalTime: '3h 00m',
    gracePeriod: '2h 00m',
    billableTime: '1h 00m',
    amount: 75.00,
    status: 'paid',
    invoiceNumber: 'DET-2024-0042',
    notes: 'Delayed unloading',
  },
  {
    id: 'det-007',
    loadId: 'LOAD-9340',
    broker: 'TQL',
    location: 'Nashville, TN',
    type: 'pickup',
    date: 'Apr 27, 2024',
    started: '06:00 AM',
    totalTime: '5h 10m',
    gracePeriod: '2h 00m',
    billableTime: '3h 10m',
    amount: 237.50,
    status: 'pending',
    invoiceNumber: 'DET-2024-0041',
    notes: 'Paperwork issues delayed loading',
  },
  {
    id: 'det-008',
    loadId: 'LOAD-9270',
    broker: 'Arrive Logistics',
    location: 'Charlotte, NC',
    type: 'delivery',
    date: 'Apr 25, 2024',
    started: '03:00 PM',
    totalTime: '4h 00m',
    gracePeriod: '2h 00m',
    billableTime: '2h 00m',
    amount: 150.00,
    status: 'paid',
    invoiceNumber: 'DET-2024-0040',
    notes: 'Receiving dock occupied',
  },
]

const PENDING_INVOICES: PendingInvoice[] = [
  {
    id: 'pi-001',
    loadId: 'LOAD-9340',
    broker: 'TQL',
    amount: 237.50,
    daysOverdue: 12,
    invoiceNumber: 'DET-2024-0041',
    dueDate: 'Apr 30, 2024',
  },
  {
    id: 'pi-002',
    loadId: 'LOAD-9512',
    broker: 'Coyote',
    amount: 62.50,
    daysOverdue: 5,
    invoiceNumber: 'DET-2024-0043',
    dueDate: 'May 7, 2024',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function padTwo(n: number): string {
  return String(n).padStart(2, '0')
}

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${padTwo(h)}:${padTwo(m)}:${padTwo(s)}`
}

function formatHM(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${padTwo(m)}m`
}

function calcCharge(billableSeconds: number, rate: number): number {
  return (billableSeconds / 3600) * rate
}

function fmtUSD(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Sub-components ────────────────────────────────────────────────────────────

// KPI Card
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: 'var(--c-dark, #1A2535)',
      border: '1px solid rgba(75,174,212,0.18)',
      borderRadius: 12,
      padding: '18px 22px',
      flex: 1,
      minWidth: 180,
    }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent ?? 'var(--c-primary, #4BAED4)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// Status Badge
function StatusBadge({ status }: { status: DetentionStatus }) {
  const map: Record<DetentionStatus, { bg: string; color: string; label: string }> = {
    paid:     { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: 'Paid' },
    pending:  { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'Pending' },
    disputed: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', label: 'Disputed' },
    waived:   { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', label: 'Waived' },
  }
  const s = map[status]
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 20,
      border: `1px solid ${s.color}40`,
      whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

// Timer Status Banner
function TimerStatusBanner({ timerState, phase }: { timerState: TimerState; phase: TimerPhase | null }) {
  if (timerState === 'idle') {
    return (
      <div style={{
        background: 'rgba(148,163,184,0.12)',
        border: '1px solid rgba(148,163,184,0.3)',
        borderRadius: 8,
        padding: '10px 16px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>IDLE — SELECT LOAD AND START TIMER</div>
    )
  }
  if (timerState === 'grace') {
    const label = phase === 'pickup' ? 'WAITING AT PICKUP' : 'WAITING AT DELIVERY'
    return (
      <div style={{
        background: 'rgba(251,191,36,0.12)',
        border: '1px solid rgba(251,191,36,0.4)',
        borderRadius: 8,
        padding: '10px 16px',
        textAlign: 'center',
        color: '#fbbf24',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>{label} · GRACE PERIOD ACTIVE</div>
    )
  }
  if (timerState === 'billing') {
    const label = phase === 'pickup' ? 'WAITING AT PICKUP' : 'WAITING AT DELIVERY'
    return (
      <div style={{
        background: 'rgba(248,113,113,0.12)',
        border: '1px solid rgba(248,113,113,0.4)',
        borderRadius: 8,
        padding: '10px 16px',
        textAlign: 'center',
        color: '#f87171',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>⚠ {label} · BILLING ACTIVE</div>
    )
  }
  return (
    <div style={{
      background: 'rgba(75,174,212,0.1)',
      border: '1px solid rgba(75,174,212,0.3)',
      borderRadius: 8,
      padding: '10px 16px',
      textAlign: 'center',
      color: 'var(--c-primary, #4BAED4)',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 1,
      textTransform: 'uppercase',
    }}>TIMER STOPPED</div>
  )
}

// Invoice Preview
function InvoicePreview({
  load,
  phase,
  elapsed,
  graceSeconds,
  rate,
  notes,
  onClose,
}: {
  load: MockLoad | null
  phase: TimerPhase | null
  elapsed: number
  graceSeconds: number
  rate: number
  notes: string
  onClose: () => void
}) {
  const billable = Math.max(0, elapsed - graceSeconds)
  const charge = calcCharge(billable, rate)
  const invoiceNum = 'DET-2024-0047'

  const now = new Date()
  const arrivalTime = new Date(now.getTime() - elapsed * 1000)
  const detentionStart = new Date(arrivalTime.getTime() + graceSeconds * 1000)

  function fmtTime(d: Date): string {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  function fmtDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.7)',
      borderRadius: 16,
      padding: '32px 24px',
      marginBottom: 24,
      border: '2px solid rgba(75,174,212,0.4)',
    }}>
      {/* Invoice header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-primary, #4BAED4)', marginBottom: 2 }}>
            DispaLoadIQ Detention Invoice
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Invoice #{invoiceNum}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Date: {fmtDate(now)}</div>
        </div>
        <div style={{
          background: charge > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(148,163,184,0.12)',
          border: `1px solid ${charge > 0 ? '#f87171' : '#94a3b8'}40`,
          borderRadius: 8,
          padding: '8px 16px',
          textAlign: 'right',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Due</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: charge > 0 ? '#f87171' : '#94a3b8' }}>{fmtUSD(charge)}</div>
        </div>
      </div>

      {/* FROM / TO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>From</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>John Driver</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Owner-Operator</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>MC #1234567</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>To (Broker)</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{load?.broker ?? 'N/A'}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Load #{load?.id ?? 'N/A'}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{load?.route ?? ''}</div>
        </div>
      </div>

      {/* Load info row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Load #</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{load?.id ?? 'N/A'}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', flex: 2, minWidth: 180 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Route</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginTop: 4 }}>{load?.route ?? 'N/A'}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Type</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginTop: 4, textTransform: 'capitalize' }}>{phase ?? 'N/A'}</div>
        </div>
      </div>

      {/* Detention breakdown table */}
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
        <div style={{ background: 'rgba(75,174,212,0.12)', padding: '10px 16px', fontWeight: 600, fontSize: 12, color: 'var(--c-primary, #4BAED4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Detention Breakdown
        </div>
        {[
          { label: 'Arrival Time', value: fmtTime(arrivalTime) },
          { label: 'Free Time (Grace Period)', value: formatHM(graceSeconds) },
          { label: 'Detention Billing Start', value: charge > 0 ? fmtTime(detentionStart) : 'N/A — within grace' },
          { label: 'Total Time at Facility', value: formatHM(elapsed) },
          { label: 'Billable Detention Time', value: billable > 0 ? formatHM(billable) : '0m (within grace)' },
          { label: 'Rate', value: `${fmtUSD(rate)}/hr` },
        ].map((row, i) => (
          <div key={row.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{row.label}</span>
            <span style={{ color: 'white', fontWeight: 500, fontSize: 13 }}>{row.value}</span>
          </div>
        ))}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'rgba(75,174,212,0.1)',
          borderTop: '2px solid rgba(75,174,212,0.3)',
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>TOTAL DUE</span>
          <span style={{ color: charge > 0 ? '#f87171' : '#94a3b8', fontWeight: 800, fontSize: 18 }}>{fmtUSD(charge)}</span>
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Notes</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>{notes}</div>
        </div>
      )}

      {/* GPS / timestamp note */}
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 20, lineHeight: 1.6 }}>
        GPS Timestamp: {arrivalTime.toISOString()} · Auto-generated by DispaLoadIQ · {invoiceNum}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button style={{
          background: 'var(--c-primary, #4BAED4)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '10px 18px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Download PDF
        </button>
        <button style={{
          background: 'rgba(75,174,212,0.15)',
          color: 'var(--c-primary, #4BAED4)',
          border: '1px solid rgba(75,174,212,0.4)',
          borderRadius: 8,
          padding: '10px 18px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Email to Broker
        </button>
        <button style={{
          background: 'rgba(74,222,128,0.12)',
          color: '#4ade80',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 8,
          padding: '10px 18px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Mark as Sent
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(248,113,113,0.12)',
            color: '#f87171',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DetentionTimerPage({ role }: { role: UserRole }) {
  // ── Timer state ────────────────────────────────────────────────────────────
  const [selectedLoadIdx, setSelectedLoadIdx] = useState<number>(0)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [activePhase, setActivePhase] = useState<TimerPhase | null>(null)
  const [elapsed, setElapsed] = useState<number>(0)
  const [timerNotes, setTimerNotes] = useState<string>('')
  const [showInvoice, setShowInvoice] = useState<boolean>(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Settings state ─────────────────────────────────────────────────────────
  const [graceMinutes, setGraceMinutes] = useState<number>(120)
  const [ratePerHour, setRatePerHour] = useState<number>(RATE_DEFAULT)
  const [minBillableHours, setMinBillableHours] = useState<string>('1')
  const [autoNotify, setAutoNotify] = useState<boolean>(true)
  const [includeLoadNum, setIncludeLoadNum] = useState<boolean>(true)
  const [includeBroker, setIncludeBroker] = useState<boolean>(true)
  const [includeGPS, setIncludeGPS] = useState<boolean>(true)
  const [includePhotos, setIncludePhotos] = useState<boolean>(false)
  const [emailTemplate, setEmailTemplate] = useState<string>(
    `Dear [Broker Name],\n\nThis is to notify you that our driver has been detained at [Location] for [Detention Time], which exceeds the 2-hour grace period outlined in the rate confirmation.\n\nDetention charges have been incurred at a rate of $75.00/hr.\n\nLoad #: [Load ID]\nArrival Time: [Arrival Time]\nBilling Start: [Detention Start]\nTotal Billable Time: [Billable Time]\nAmount Due: [Amount]\n\nPlease remit payment or contact us to discuss.\n\nThank you,\n[Driver/Company Name]`
  )

  // ── Right panel state ──────────────────────────────────────────────────────
  const [rightTab, setRightTab] = useState<RightTab>('history')
  const [selectedEvent, setSelectedEvent] = useState<DetentionEvent | null>(null)

  // ── Derived values ─────────────────────────────────────────────────────────
  const graceSeconds = graceMinutes * 60
  const billableSeconds = Math.max(0, elapsed - graceSeconds)
  const charge = calcCharge(billableSeconds, ratePerHour)
  const graceRemaining = Math.max(0, graceSeconds - elapsed)
  const selectedLoad = MOCK_LOADS[selectedLoadIdx]

  // ── Timer effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerState === 'grace' || timerState === 'billing') {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1
          return next
        })
      }, 1000)
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerState])

  // Transition from grace to billing when grace expires
  useEffect(() => {
    if (timerState === 'grace' && elapsed >= graceSeconds) {
      setTimerState('billing')
    }
  }, [elapsed, graceSeconds, timerState])

  // ── Timer controls ─────────────────────────────────────────────────────────
  function startTimer(phase: TimerPhase) {
    setActivePhase(phase)
    setElapsed(0)
    setShowInvoice(false)
    setTimerState('grace')
  }

  function stopTimer() {
    setTimerState('stopped')
  }

  function resetTimer() {
    setTimerState('idle')
    setActivePhase(null)
    setElapsed(0)
    setShowInvoice(false)
    setTimerNotes('')
  }

  const isRunning = timerState === 'grace' || timerState === 'billing'
  const pickupActive = isRunning && activePhase === 'pickup'
  const deliveryActive = isRunning && activePhase === 'delivery'

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1826',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px',
    }}>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', margin: 0 }}>
          Detention Timer
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '4px 0 0' }}>
          Track wait time at pickup &amp; delivery — bill brokers automatically when grace period expires
          {role && <span style={{ marginLeft: 8, background: 'rgba(75,174,212,0.12)', color: 'var(--c-primary, #4BAED4)', fontSize: 11, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(75,174,212,0.3)', textTransform: 'capitalize' }}>{role}</span>}
        </p>
      </div>

      {/* ── Section 1: KPI Row ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <KpiCard label="Total Detained This Month" value="14h 20m" sub="Across 6 loads" />
        <KpiCard label="Total Billed" value="$1,075" sub="This month" accent="#4ade80" />
        <KpiCard label="Pending Collection" value="$225" sub="2 invoices open" accent="#fbbf24" />
        <KpiCard label="Avg Wait Time" value="3h 12m" sub="+27m above national avg" accent="#f87171" />
      </div>

      {/* ── Sections 2 + 3: Main layout ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Section 2: Active Timer (left ~60%) ─────────────────────────── */}
        <div style={{ flex: '1 1 560px', minWidth: 320 }}>

          {/* Load selector */}
          <div style={{
            background: 'var(--c-dark, #1A2535)',
            border: '1px solid rgba(75,174,212,0.18)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 16,
          }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
              Active Load
            </label>
            <select
              value={selectedLoadIdx}
              onChange={e => {
                setSelectedLoadIdx(Number(e.target.value))
                if (!isRunning) resetTimer()
              }}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(75,174,212,0.25)',
                borderRadius: 8,
                color: 'white',
                padding: '10px 14px',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {MOCK_LOADS.map((load, i) => (
                <option key={load.id} value={i} style={{ background: '#1A2535' }}>
                  {load.id} · {load.broker} · {load.route} · {load.eventType} @ {load.date}
                </option>
              ))}
            </select>
          </div>

          {/* Active timer card */}
          <div style={{
            background: 'var(--c-dark, #1A2535)',
            border: '1px solid rgba(75,174,212,0.18)',
            borderRadius: 16,
            padding: '28px 24px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Active Detention Timer</div>
              {timerState !== 'idle' && (
                <button
                  onClick={resetTimer}
                  style={{
                    background: 'rgba(148,163,184,0.1)',
                    color: '#94a3b8',
                    border: '1px solid rgba(148,163,184,0.25)',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Status banner */}
            <div style={{ marginBottom: 20 }}>
              <TimerStatusBanner timerState={timerState} phase={activePhase} />
            </div>

            {/* Big clock display */}
            <div style={{
              textAlign: 'center',
              marginBottom: 20,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              padding: '24px 16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontSize: 64,
                fontWeight: 800,
                fontFamily: 'monospace',
                color: timerState === 'billing' ? '#f87171' : timerState === 'grace' ? '#fbbf24' : timerState === 'stopped' ? '#94a3b8' : 'rgba(255,255,255,0.2)',
                letterSpacing: 4,
                lineHeight: 1,
                textShadow: timerState === 'billing' ? '0 0 30px rgba(248,113,113,0.4)' : timerState === 'grace' ? '0 0 30px rgba(251,191,36,0.3)' : 'none',
              }}>
                {formatClock(elapsed)}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Total Elapsed
              </div>
            </div>

            {/* Grace period indicator */}
            <div style={{
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 20,
              background: timerState === 'billing'
                ? 'rgba(248,113,113,0.1)'
                : timerState === 'grace'
                  ? 'rgba(251,191,36,0.1)'
                  : 'rgba(255,255,255,0.04)',
              border: timerState === 'billing'
                ? '1px solid rgba(248,113,113,0.3)'
                : timerState === 'grace'
                  ? '1px solid rgba(251,191,36,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Grace Period Countdown
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 700,
                  color: timerState === 'billing' ? '#f87171' : timerState === 'grace' ? '#fbbf24' : 'rgba(255,255,255,0.25)',
                }}>
                  {formatClock(graceRemaining)}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%',
                  borderRadius: 4,
                  background: timerState === 'billing' ? '#f87171' : '#fbbf24',
                  width: `${Math.min(100, (elapsed / graceSeconds) * 100)}%`,
                  transition: 'width 0.5s linear',
                }} />
              </div>
              <div style={{ fontSize: 12 }}>
                {timerState === 'idle' && (
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>Start a timer to activate grace period tracking</span>
                )}
                {timerState === 'grace' && (
                  <span style={{ color: '#fbbf24' }}>Grace Period Active — billing not yet started</span>
                )}
                {timerState === 'billing' && (
                  <span style={{ color: '#f87171' }}>⚠ Billing Active — {fmtUSD(charge)} accumulated</span>
                )}
                {timerState === 'stopped' && (
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Timer stopped</span>
                )}
              </div>
            </div>

            {/* Accumulated charge (when billing) */}
            {(timerState === 'billing' || timerState === 'stopped') && billableSeconds > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Accumulated Charge</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {formatHM(billableSeconds)} billable @ {fmtUSD(ratePerHour)}/hr
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171' }}>{fmtUSD(charge)}</div>
              </div>
            )}

            {/* Phase control buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {/* Pickup button */}
              <button
                onClick={() => pickupActive ? stopTimer() : startTimer('pickup')}
                disabled={deliveryActive}
                style={{
                  padding: '14px 10px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: deliveryActive ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background: pickupActive
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : deliveryActive
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: deliveryActive ? 'rgba(255,255,255,0.2)' : 'white',
                  boxShadow: pickupActive ? '0 4px 15px rgba(239,68,68,0.4)' : !deliveryActive ? '0 4px 15px rgba(34,197,94,0.3)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{pickupActive ? '⏹' : '▶'}</span>
                <span>{pickupActive ? 'Stop Pickup' : 'Start Pickup Timer'}</span>
              </button>

              {/* Delivery button */}
              <button
                onClick={() => deliveryActive ? stopTimer() : startTimer('delivery')}
                disabled={pickupActive}
                style={{
                  padding: '14px 10px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: pickupActive ? 'not-allowed' : 'pointer',
                  border: 'none',
                  background: deliveryActive
                    ? 'linear-gradient(135deg, #f97316, #ea580c)'
                    : pickupActive
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: pickupActive ? 'rgba(255,255,255,0.2)' : 'white',
                  boxShadow: deliveryActive ? '0 4px 15px rgba(249,115,22,0.4)' : !pickupActive ? '0 4px 15px rgba(59,130,246,0.3)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{deliveryActive ? '⏹' : '▶'}</span>
                <span>{deliveryActive ? 'Stop Delivery' : 'Start Delivery Timer'}</span>
              </button>
            </div>

            {/* Notes field */}
            <textarea
              value={timerNotes}
              onChange={e => setTimerNotes(e.target.value)}
              placeholder="Note reason for delay..."
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: 'white',
                padding: '10px 12px',
                fontSize: 13,
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />

            {/* Generate Invoice button */}
            {timerState === 'stopped' && billableSeconds > 0 && (
              <button
                onClick={() => setShowInvoice(true)}
                style={{
                  marginTop: 14,
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--c-primary, #4BAED4), #3b9ac0)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(75,174,212,0.4)',
                  letterSpacing: 0.5,
                }}
              >
                Generate Invoice — {fmtUSD(charge)}
              </button>
            )}
          </div>

          {/* Invoice Preview */}
          {showInvoice && (
            <InvoicePreview
              load={selectedLoad}
              phase={activePhase}
              elapsed={elapsed}
              graceSeconds={graceSeconds}
              rate={ratePerHour}
              notes={timerNotes}
              onClose={() => setShowInvoice(false)}
            />
          )}

          {/* Quick Stats */}
          <div style={{
            background: 'var(--c-dark, #1A2535)',
            border: '1px solid rgba(75,174,212,0.18)',
            borderRadius: 12,
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Quick Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'National Avg Detention', value: '2h 45m', note: 'Industry benchmark', color: '#94a3b8' },
                { label: 'Your Avg Detention', value: '3h 12m', note: '+27m above national avg', color: '#f87171' },
                { label: 'Detentions This Week', value: '3', note: 'Mon – Sun', color: 'var(--c-primary, #4BAED4)' },
                { label: 'Billable Events', value: '2 / 3', note: '1 was within grace period', color: '#fbbf24' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, marginBottom: 2 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{stat.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 3: Right panel (History / Pending / Settings) ────────── */}
        <div style={{ flex: '1 1 360px', minWidth: 300 }}>
          <div style={{
            background: 'var(--c-dark, #1A2535)',
            border: '1px solid rgba(75,174,212,0.18)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Tab bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {(['history', 'pending', 'settings'] as RightTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  style={{
                    flex: 1,
                    padding: '14px 8px',
                    background: rightTab === tab ? 'rgba(75,174,212,0.12)' : 'transparent',
                    border: 'none',
                    borderBottom: rightTab === tab ? '2px solid var(--c-primary, #4BAED4)' : '2px solid transparent',
                    color: rightTab === tab ? 'var(--c-primary, #4BAED4)' : 'rgba(255,255,255,0.4)',
                    fontSize: 13,
                    fontWeight: rightTab === tab ? 700 : 400,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    letterSpacing: 0.3,
                    transition: 'all 0.15s',
                  }}
                >
                  {tab}
                  {tab === 'pending' && (
                    <span style={{
                      marginLeft: 6,
                      background: '#fbbf24',
                      color: '#1a2535',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: 10,
                    }}>2</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── History tab ─────────────────────────────────────────────── */}
            {rightTab === 'history' && (
              <div>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {DETENTION_HISTORY.length} events · Click a row for details
                  </div>
                </div>

                {/* History list */}
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  {DETENTION_HISTORY.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        background: selectedEvent?.id === ev.id ? 'rgba(75,174,212,0.08)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (selectedEvent?.id !== ev.id) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
                      onMouseLeave={e => { if (selectedEvent?.id !== ev.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{ev.loadId}</span>
                            <span style={{
                              fontSize: 10,
                              background: ev.type === 'pickup' ? 'rgba(75,174,212,0.15)' : 'rgba(168,85,247,0.15)',
                              color: ev.type === 'pickup' ? 'var(--c-primary, #4BAED4)' : '#a855f7',
                              padding: '1px 6px',
                              borderRadius: 10,
                              border: `1px solid ${ev.type === 'pickup' ? 'rgba(75,174,212,0.3)' : 'rgba(168,85,247,0.3)'}`,
                              textTransform: 'capitalize',
                            }}>
                              {ev.type}
                            </span>
                          </div>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{ev.broker} · {ev.date}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 4 }}>
                          <StatusBadge status={ev.status} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: ev.amount > 0 ? '#4ade80' : '#94a3b8' }}>
                            {ev.amount > 0 ? fmtUSD(ev.amount) : 'Waived'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        <span>Total: {ev.totalTime}</span>
                        <span>Billable: {ev.billableTime}</span>
                        <span>{ev.location}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected event detail */}
                {selectedEvent && (
                  <div style={{
                    borderTop: '1px solid rgba(75,174,212,0.2)',
                    background: 'rgba(75,174,212,0.05)',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
                        {selectedEvent.loadId} — {selectedEvent.broker}
                      </div>
                      <StatusBadge status={selectedEvent.status} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      {[
                        { label: 'Date', value: selectedEvent.date },
                        { label: 'Started', value: selectedEvent.started },
                        { label: 'Location', value: selectedEvent.location },
                        { label: 'Type', value: selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1) },
                        { label: 'Total Time', value: selectedEvent.totalTime },
                        { label: 'Grace Period', value: selectedEvent.gracePeriod },
                        { label: 'Billable Time', value: selectedEvent.billableTime },
                        { label: 'Amount', value: selectedEvent.amount > 0 ? fmtUSD(selectedEvent.amount) : 'Waived' },
                        { label: 'Invoice #', value: selectedEvent.invoiceNumber },
                      ].map(row => (
                        <div key={row.label}>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{row.label}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginTop: 2 }}>{row.value}</div>
                        </div>
                      ))}
                    </div>
                    {selectedEvent.notes && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Notes</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{selectedEvent.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Pending tab ─────────────────────────────────────────────── */}
            {rightTab === 'pending' && (
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.5 }}>
                  2 unpaid invoices · Total outstanding:{' '}
                  <strong style={{ color: '#fbbf24' }}>{fmtUSD(PENDING_INVOICES.reduce((s, i) => s + i.amount, 0))}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
                  {PENDING_INVOICES.map(inv => (
                    <div key={inv.id} style={{
                      background: 'rgba(251,191,36,0.06)',
                      border: '1px solid rgba(251,191,36,0.2)',
                      borderRadius: 10,
                      padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{inv.invoiceNumber}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                            {inv.broker} · {inv.loadId}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{fmtUSD(inv.amount)}</div>
                          <div style={{ fontSize: 11, color: '#f87171', marginTop: 2 }}>
                            {inv.daysOverdue} days overdue
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Due: {inv.dueDate}</span>
                        <button style={{
                          background: 'var(--c-primary, #4BAED4)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          padding: '7px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(75,174,212,0.3)',
                        }}>
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary note */}
                <div style={{
                  marginTop: 20,
                  background: 'rgba(75,174,212,0.06)',
                  border: '1px solid rgba(75,174,212,0.15)',
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.6,
                }}>
                  Pro tip: Sending reminders within 7 days of the due date increases collection rates by 40%.
                  Consider enabling auto-notify in Settings.
                </div>
              </div>
            )}

            {/* ── Settings tab ─────────────────────────────────────────────── */}
            {rightTab === 'settings' && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: 18 }}>

                {/* Grace period */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                    Grace Period
                  </label>
                  <select
                    value={graceMinutes}
                    onChange={e => setGraceMinutes(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(75,174,212,0.25)',
                      borderRadius: 8,
                      color: 'white',
                      padding: '9px 12px',
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value={60} style={{ background: '#1A2535' }}>1 hour</option>
                    <option value={90} style={{ background: '#1A2535' }}>1.5 hours</option>
                    <option value={120} style={{ background: '#1A2535' }}>2 hours</option>
                    <option value={150} style={{ background: '#1A2535' }}>2.5 hours</option>
                    <option value={180} style={{ background: '#1A2535' }}>3 hours</option>
                  </select>
                </div>

                {/* Rate per hour */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                    Rate Per Hour
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>$</span>
                    <input
                      type="number"
                      value={ratePerHour}
                      onChange={e => setRatePerHour(Math.max(0, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(75,174,212,0.25)',
                        borderRadius: 8,
                        color: 'white',
                        padding: '9px 12px 9px 28px',
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Minimum billable */}
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                    Minimum Billable Time
                  </label>
                  <select
                    value={minBillableHours}
                    onChange={e => setMinBillableHours(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(75,174,212,0.25)',
                      borderRadius: 8,
                      color: 'white',
                      padding: '9px 12px',
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="0.5" style={{ background: '#1A2535' }}>30 minutes</option>
                    <option value="1" style={{ background: '#1A2535' }}>1 hour</option>
                    <option value="1.5" style={{ background: '#1A2535' }}>1.5 hours</option>
                    <option value="2" style={{ background: '#1A2535' }}>2 hours</option>
                  </select>
                </div>

                {/* Auto-notify broker toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>Auto-Notify Broker</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Send email when billing starts</div>
                  </div>
                  <div
                    onClick={() => setAutoNotify(v => !v)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: autoNotify ? 'var(--c-primary, #4BAED4)' : 'rgba(255,255,255,0.1)',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'white',
                      top: 3,
                      left: autoNotify ? 23 : 3,
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </div>

                {/* Include in invoice checkboxes */}
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                    Include in Invoice
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                    {[
                      { label: 'Load #', value: includeLoadNum, set: setIncludeLoadNum },
                      { label: 'Broker Name', value: includeBroker, set: setIncludeBroker },
                      { label: 'GPS Timestamp', value: includeGPS, set: setIncludeGPS },
                      { label: 'Photos', value: includePhotos, set: setIncludePhotos },
                    ].map(item => (
                      <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <div
                          onClick={() => item.set((v: boolean) => !v)}
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `2px solid ${item.value ? 'var(--c-primary, #4BAED4)' : 'rgba(255,255,255,0.2)'}`,
                            background: item.value ? 'var(--c-primary, #4BAED4)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'all 0.15s',
                            cursor: 'pointer',
                          }}
                        >
                          {item.value && <span style={{ color: 'white', fontSize: 10, lineHeight: 1 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Email template */}
                <div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                    Broker Email Template
                  </div>
                  <textarea
                    value={emailTemplate}
                    onChange={e => setEmailTemplate(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(75,174,212,0.2)',
                      borderRadius: 8,
                      color: 'rgba(255,255,255,0.75)',
                      padding: '10px 12px',
                      fontSize: 12,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      lineHeight: 1.6,
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, lineHeight: 1.5 }}>
                    Use placeholders: [Broker Name] [Load ID] [Detention Time] [Amount] [Location] [Arrival Time] [Detention Start] [Billable Time]
                  </div>
                </div>

                {/* Save button */}
                <button style={{
                  background: 'var(--c-primary, #4BAED4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '11px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(75,174,212,0.3)',
                  marginTop: 4,
                }}>
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
