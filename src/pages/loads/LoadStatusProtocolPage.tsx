import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'active' | 'alerts' | 'rules'
type LoadStatus = 'Booked' | 'Dispatched' | 'At Pickup' | 'In Transit' | 'At Delivery' | 'Paid'
type AlertSeverity = 'warning' | 'critical'
type AlertResolution = 'resolved' | 'escalated' | 'pending'

interface ActiveLoad {
  id: string
  origin: string
  destination: string
  cargo: string
  broker: string
  currentStatus: LoadStatus
  dispatcher: string
  ownerOp: string
  lastUpdateMinutesAgo: number
  rate: number
}

interface AlertRecord {
  id: string
  loadId: string
  dispatcher: string
  trigger: string
  severity: AlertSeverity
  resolution: AlertResolution
  timestamp: string
  resolutionTime: string | null
}

interface UpdatePanelState {
  loadId: string
  selectedNextStatus: LoadStatus | ''
  notes: string
  sent: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STEPS: LoadStatus[] = [
  'Booked',
  'Dispatched',
  'At Pickup',
  'In Transit',
  'At Delivery',
  'Paid',
]

const PROTOCOL_RULES: {
  step: LoadStatus
  window: string
  action: string
  penalty: string
}[] = [
  {
    step: 'Booked',
    window: 'Within 30 min of booking',
    action: 'Confirm load with owner-op, send rate confirmation and pickup details.',
    penalty: 'Trust Score −2 pts. Owner-op gets automated alert with dispatcher contact.',
  },
  {
    step: 'Dispatched',
    window: 'Within 1 hour of dispatch',
    action: 'Confirm driver has BOL, lumper info, pickup appointment time, and broker contact.',
    penalty: 'Trust Score −3 pts. Owner-op notified. Load flagged for review.',
  },
  {
    step: 'At Pickup',
    window: 'Within 30 min of arrival at shipper',
    action: 'Confirm arrival, start detention timer if applicable, notify broker of on-time status.',
    penalty: 'Trust Score −3 pts. Detention clock may start without dispatcher awareness.',
  },
  {
    step: 'In Transit',
    window: 'Every 4 hours while moving',
    action: 'Send position update, ETA to delivery, flag any delays or issues immediately.',
    penalty: 'Trust Score −5 pts per missed window. Critical alert sent to owner-op.',
  },
  {
    step: 'At Delivery',
    window: 'Within 30 min of arrival at consignee',
    action: 'Confirm arrival, coordinate unloading, collect POD, report detention if applicable.',
    penalty: 'Trust Score −3 pts. Potential detention claim loss without documented arrival.',
  },
  {
    step: 'Paid',
    window: 'Within 24 hours of delivery confirmation',
    action: 'Submit POD to broker, send invoice, confirm payment timeline with owner-op.',
    penalty: 'Trust Score −2 pts. Owner-op loses visibility on payment status.',
  },
]

const MOCK_LOADS: ActiveLoad[] = [
  {
    id: 'DL-2025-4421',
    origin: 'Chicago',
    destination: 'Nashville',
    cargo: 'Refrigerated Food',
    broker: 'Echo Global Logistics',
    currentStatus: 'In Transit',
    dispatcher: 'Maria Santos',
    ownerOp: 'Dmitri Volkov',
    lastUpdateMinutesAgo: 310,
    rate: 2850,
  },
  {
    id: 'DL-2025-4398',
    origin: 'Dallas',
    destination: 'Atlanta',
    cargo: 'Auto Parts',
    broker: 'TQL Transport',
    currentStatus: 'At Pickup',
    dispatcher: 'James Okafor',
    ownerOp: 'Rosa Mendez',
    lastUpdateMinutesAgo: 18,
    rate: 1920,
  },
  {
    id: 'DL-2025-4377',
    origin: 'Los Angeles',
    destination: 'Phoenix',
    cargo: 'Electronics',
    broker: 'CH Robinson',
    currentStatus: 'Dispatched',
    dispatcher: 'Maria Santos',
    ownerOp: 'Hank Williams',
    lastUpdateMinutesAgo: 95,
    rate: 1450,
  },
  {
    id: 'DL-2025-4362',
    origin: 'Miami',
    destination: 'Charlotte',
    cargo: 'Medical Supplies',
    broker: 'Coyote Logistics',
    currentStatus: 'At Delivery',
    dispatcher: 'James Okafor',
    ownerOp: 'Svetlana Park',
    lastUpdateMinutesAgo: 22,
    rate: 2200,
  },
  {
    id: 'DL-2025-4341',
    origin: 'Seattle',
    destination: 'Denver',
    cargo: 'Furniture',
    broker: 'XPO Logistics',
    currentStatus: 'Booked',
    dispatcher: 'Priya Nair',
    ownerOp: 'Carlos Reyes',
    lastUpdateMinutesAgo: 8,
    rate: 3100,
  },
  {
    id: 'DL-2025-4318',
    origin: 'New York',
    destination: 'Boston',
    cargo: 'Clothing',
    broker: 'Landstar System',
    currentStatus: 'Paid',
    dispatcher: 'Priya Nair',
    ownerOp: 'Anna Fischer',
    lastUpdateMinutesAgo: 180,
    rate: 980,
  },
]

const MOCK_ALERTS: AlertRecord[] = [
  {
    id: 'ALT-001',
    loadId: 'DL-2025-4421',
    dispatcher: 'Maria Santos',
    trigger: 'No update for 4h 23min during In Transit',
    severity: 'critical',
    resolution: 'pending',
    timestamp: 'Today, 09:42 AM',
    resolutionTime: null,
  },
  {
    id: 'ALT-002',
    loadId: 'DL-2025-4290',
    dispatcher: 'James Okafor',
    trigger: 'No update for 2h 11min during At Pickup',
    severity: 'warning',
    resolution: 'resolved',
    timestamp: 'Today, 07:15 AM',
    resolutionTime: '34 min',
  },
  {
    id: 'ALT-003',
    loadId: 'DL-2025-4271',
    dispatcher: 'Maria Santos',
    trigger: 'No update for 5h 02min during In Transit',
    severity: 'critical',
    resolution: 'escalated',
    timestamp: 'Yesterday, 11:58 PM',
    resolutionTime: '2h 18min',
  },
  {
    id: 'ALT-004',
    loadId: 'DL-2025-4255',
    dispatcher: 'Priya Nair',
    trigger: 'Missed Dispatched confirmation window (1h 05min overdue)',
    severity: 'warning',
    resolution: 'resolved',
    timestamp: 'Yesterday, 03:20 PM',
    resolutionTime: '12 min',
  },
  {
    id: 'ALT-005',
    loadId: 'DL-2025-4244',
    dispatcher: 'James Okafor',
    trigger: 'No At Delivery update for 1h 10min after estimated arrival',
    severity: 'warning',
    resolution: 'resolved',
    timestamp: 'May 11, 2:47 PM',
    resolutionTime: '22 min',
  },
  {
    id: 'ALT-006',
    loadId: 'DL-2025-4198',
    dispatcher: 'Maria Santos',
    trigger: 'No update for 6h 44min during In Transit — driver unreachable',
    severity: 'critical',
    resolution: 'escalated',
    timestamp: 'May 10, 9:33 AM',
    resolutionTime: '4h 02min',
  },
  {
    id: 'ALT-007',
    loadId: 'DL-2025-4177',
    dispatcher: 'Priya Nair',
    trigger: 'POD not submitted within 24h of delivery',
    severity: 'warning',
    resolution: 'resolved',
    timestamp: 'May 9, 4:15 PM',
    resolutionTime: '1h 44min',
  },
  {
    id: 'ALT-008',
    loadId: 'DL-2025-4140',
    dispatcher: 'James Okafor',
    trigger: 'Booking confirmation not sent within 30 min',
    severity: 'warning',
    resolution: 'resolved',
    timestamp: 'May 8, 11:02 AM',
    resolutionTime: '8 min',
  },
]

// ── Helper functions ──────────────────────────────────────────────────────────

function getStatusIndex(status: LoadStatus): number {
  return STATUS_STEPS.indexOf(status)
}

function formatUpdateTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

function getUpdateColor(minutes: number): string {
  if (minutes < 120) return '#38A169'
  if (minutes < 240) return '#D69E2E'
  return '#E53E3E'
}

function getNextStatuses(current: LoadStatus): LoadStatus[] {
  const idx = getStatusIndex(current)
  return STATUS_STEPS.slice(idx + 1)
}

function isOverdue(status: LoadStatus, minutes: number): boolean {
  if (status === 'In Transit') return minutes > 240
  if (status === 'At Pickup' || status === 'At Delivery') return minutes > 30
  if (status === 'Dispatched') return minutes > 60
  if (status === 'Booked') return minutes > 30
  return false
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusPipeline({ currentStatus }: { currentStatus: LoadStatus }) {
  const currentIdx = getStatusIndex(currentStatus)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '12px 0' }}>
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isFuture = idx > currentIdx

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  background: isCompleted
                    ? '#38A169'
                    : isCurrent
                    ? '#3B82F6'
                    : '#4A5568',
                  color: '#fff',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(59,130,246,0.25)' : 'none',
                  animation: isCurrent ? 'pulse 2s infinite' : 'none',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {isCompleted ? '✓' : isFuture ? '' : '●'}
              </div>
              <div
                style={{
                  fontSize: 9,
                  marginTop: 4,
                  color: isCompleted ? '#38A169' : isCurrent ? '#3B82F6' : '#718096',
                  fontWeight: isCurrent ? 700 : 400,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  maxWidth: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {step}
              </div>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                style={{
                  height: 2,
                  flex: 0.8,
                  background: isCompleted ? '#38A169' : '#4A5568',
                  marginBottom: 18,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function UpdatePanel({
  load,
  panel,
  onChange,
  onSend,
}: {
  load: ActiveLoad
  panel: UpdatePanelState
  onChange: (patch: Partial<UpdatePanelState>) => void
  onSend: () => void
}) {
  const nextStatuses = getNextStatuses(load.currentStatus)

  return (
    <div
      style={{
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 10,
        padding: '16px 20px',
        marginTop: 8,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-dark)', marginBottom: 12 }}>
        Update Status for {load.id}
      </div>

      {panel.sent ? (
        <div
          style={{
            background: 'rgba(56,161,105,0.12)',
            border: '1px solid #38A169',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#38A169',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          ✓ Update sent to {load.ownerOp}. Trust Score +1 pt recorded.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Next Status
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {nextStatuses.length === 0 ? (
                <span style={{ fontSize: 13, color: '#718096' }}>Load is already at final status.</span>
              ) : (
                nextStatuses.map((s) => (
                  <label
                    key={s}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      background: panel.selectedNextStatus === s ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.6)',
                      border: `1px solid ${panel.selectedNextStatus === s ? '#3B82F6' : 'var(--c-border)'}`,
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 13,
                      fontWeight: panel.selectedNextStatus === s ? 600 : 400,
                      color: panel.selectedNextStatus === s ? '#3B82F6' : 'var(--c-dark)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name={`next-status-${load.id}`}
                      value={s}
                      checked={panel.selectedNextStatus === s}
                      onChange={() => onChange({ selectedNextStatus: s })}
                      style={{ accentColor: '#3B82F6' }}
                    />
                    {s}
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#718096', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Notes (ETA, detention, issues)
            </div>
            <textarea
              value={panel.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="e.g. Driver arrived at shipper at 14:30. Dock busy, estimating 1h loading time. ETA Nashville: 22:00."
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--c-border)',
                background: 'var(--c-surface)',
                color: 'var(--c-dark)',
                fontSize: 13,
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={onSend}
              disabled={!panel.selectedNextStatus && nextStatuses.length > 0}
              style={{ opacity: !panel.selectedNextStatus && nextStatuses.length > 0 ? 0.5 : 1 }}
            >
              Send Update to {load.ownerOp} →
            </button>
            <span style={{ fontSize: 12, color: '#718096' }}>
              Owner-op gets push notification + email instantly
            </span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Tab 1 – Active Loads ──────────────────────────────────────────────────────

function ActiveLoadsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [panels, setPanels] = useState<Record<string, UpdatePanelState>>({})

  const getPanel = (loadId: string): UpdatePanelState =>
    panels[loadId] ?? { loadId, selectedNextStatus: '', notes: '', sent: false }

  const updatePanel = (loadId: string, patch: Partial<UpdatePanelState>) => {
    setPanels((prev) => ({
      ...prev,
      [loadId]: { ...getPanel(loadId), ...patch },
    }))
  }

  const handleSend = (loadId: string) => {
    updatePanel(loadId, { sent: true })
  }

  const toggleExpand = (loadId: string) => {
    setExpandedId((prev) => (prev === loadId ? null : loadId))
  }

  const onTrackCount = MOCK_LOADS.filter(
    (l) => !isOverdue(l.currentStatus, l.lastUpdateMinutesAgo)
  ).length
  const needUpdateCount = MOCK_LOADS.filter(
    (l) => isOverdue(l.currentStatus, l.lastUpdateMinutesAgo) && l.currentStatus !== 'Paid'
  ).length

  return (
    <div>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
          borderRadius: 12,
          padding: '28px 32px',
          marginBottom: 24,
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          Load Status Protocol
        </div>
        <div style={{ fontSize: 14, color: '#A0AEC0', marginBottom: 24 }}>
          Every load. Every checkpoint. No dispatcher goes silent.
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Loads', value: MOCK_LOADS.length, color: '#3B82F6' },
            { label: 'On Track', value: onTrackCount, color: '#38A169' },
            { label: 'Need Update', value: needUpdateCount, color: '#D69E2E' },
            { label: 'Alerts Sent Today', value: 1, color: '#E53E3E' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '14px 22px',
                minWidth: 120,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#CBD5E0', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Load Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_LOADS.map((load) => {
          const overdue = isOverdue(load.currentStatus, load.lastUpdateMinutesAgo)
          const updateColor = getUpdateColor(load.lastUpdateMinutesAgo)
          const panel = getPanel(load.id)
          const isExpanded = expandedId === load.id

          return (
            <div
              key={load.id}
              className="card"
              style={{ padding: '20px 24px', borderRadius: 12, border: overdue ? '1px solid #E53E3E' : undefined }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--c-dark)' }}>{load.id}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'rgba(59,130,246,0.12)',
                        color: '#3B82F6',
                        borderRadius: 4,
                        padding: '2px 7px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {load.currentStatus}
                    </span>
                    {overdue && load.currentStatus !== 'Paid' && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#E53E3E',
                          color: '#fff',
                          borderRadius: 4,
                          padding: '2px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        ⚠ OVERDUE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-dark)', marginTop: 4 }}>
                    {load.origin} → {load.destination}
                    <span style={{ fontWeight: 400, color: '#718096', marginLeft: 8 }}>
                      · {load.cargo}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#38A169' }}>
                    ${load.rate.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{load.broker}</div>
                </div>
              </div>

              {/* Pipeline */}
              <StatusPipeline currentStatus={load.currentStatus} />

              {/* Meta row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#718096' }}>
                  <span>
                    <span style={{ fontWeight: 600 }}>Dispatcher:</span> {load.dispatcher}
                  </span>
                  <span>
                    <span style={{ fontWeight: 600 }}>Owner-Op:</span> {load.ownerOp}
                  </span>
                  <span style={{ color: updateColor, fontWeight: 600 }}>
                    Last update: {formatUpdateTime(load.lastUpdateMinutesAgo)}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => toggleExpand(load.id)}
                  style={{ fontSize: 12, padding: '6px 14px' }}
                >
                  {isExpanded ? 'Close ✕' : 'Update Status →'}
                </button>
              </div>

              {/* Inline Update Panel */}
              {isExpanded && (
                <UpdatePanel
                  load={load}
                  panel={panel}
                  onChange={(patch) => updatePanel(load.id, patch)}
                  onSend={() => handleSend(load.id)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Tab 2 – Alert History ─────────────────────────────────────────────────────

function AlertHistoryTab() {
  const severityColor = (s: AlertSeverity) => (s === 'critical' ? '#E53E3E' : '#D69E2E')
  const severityBg = (s: AlertSeverity) =>
    s === 'critical' ? 'rgba(229,62,62,0.1)' : 'rgba(214,158,46,0.1)'

  const resolutionColor = (r: AlertResolution) => {
    if (r === 'resolved') return '#38A169'
    if (r === 'escalated') return '#E53E3E'
    return '#D69E2E'
  }

  const resolvedAlerts = MOCK_ALERTS.filter((a) => a.resolution === 'resolved')
  const avgResolution = resolvedAlerts
    .map((a) => {
      const t = a.resolutionTime ?? '0 min'
      const match = t.match(/(\d+)h\s*(\d+)?min|(\d+)\s*min/)
      if (!match) return 0
      if (match[1]) return parseInt(match[1]) * 60 + parseInt(match[2] ?? '0')
      return parseInt(match[3] ?? '0')
    })
    .reduce((sum, val, _, arr) => sum + val / arr.length, 0)

  return (
    <div>
      {/* Summary stats */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Total Alerts This Month', value: '14', color: '#3B82F6' },
          { label: 'Avg Resolution Time', value: `${Math.round(avgResolution)} min`, color: '#38A169' },
          { label: 'Escalated', value: MOCK_ALERTS.filter((a) => a.resolution === 'escalated').length.toString(), color: '#E53E3E' },
          { label: 'Trust Score Impact', value: '−18 pts', color: '#D69E2E' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="card"
            style={{ padding: '16px 20px', borderRadius: 10, flex: '1 1 140px', borderLeft: `3px solid ${color}` }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <h3 className="section-title" style={{ marginBottom: 16 }}>
        Alert Timeline
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {MOCK_ALERTS.map((alert, idx) => (
          <div
            key={alert.id}
            style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}
          >
            {/* Timeline spine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: severityColor(alert.severity),
                  marginTop: 20,
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px ${severityBg(alert.severity)}`,
                }}
              />
              {idx < MOCK_ALERTS.length - 1 && (
                <div style={{ width: 2, flex: 1, background: 'var(--c-border)', minHeight: 16 }} />
              )}
            </div>

            {/* Alert card */}
            <div
              className="card"
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                marginBottom: 12,
                flex: 1,
                marginLeft: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-dark)' }}>
                      {alert.loadId}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: severityBg(alert.severity),
                        color: severityColor(alert.severity),
                        borderRadius: 4,
                        padding: '2px 7px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: resolutionColor(alert.resolution),
                        background: `${resolutionColor(alert.resolution)}18`,
                        borderRadius: 4,
                        padding: '2px 7px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {alert.resolution}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--c-dark)', marginBottom: 4 }}>
                    {alert.trigger}
                  </div>
                  <div style={{ fontSize: 12, color: '#718096' }}>
                    Dispatcher: <strong>{alert.dispatcher}</strong>
                    {alert.resolutionTime && (
                      <> · Resolved in <strong>{alert.resolutionTime}</strong></>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#718096', whiteSpace: 'nowrap' }}>
                  {alert.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab 3 – Protocol Rules ────────────────────────────────────────────────────

function ProtocolRulesTab() {
  return (
    <div>
      <h3 className="section-title" style={{ marginBottom: 6 }}>
        The 6 Mandatory Checkpoints
      </h3>
      <p style={{ fontSize: 14, color: '#718096', marginBottom: 24 }}>
        Every load on DispaLoadIQ must pass through all 6 checkpoints within defined time windows.
        Missing a window triggers an automatic alert to the owner-operator — no exceptions.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
        {PROTOCOL_RULES.map((rule, idx) => (
          <div
            key={rule.step}
            className="card"
            style={{ padding: '20px 24px', borderRadius: 12, borderLeft: '4px solid #3B82F6' }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Step number */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--c-dark)' }}>{rule.step}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(59,130,246,0.12)',
                      color: '#3B82F6',
                      borderRadius: 4,
                      padding: '2px 8px',
                    }}
                  >
                    {rule.window}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#38A169', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      What dispatcher must do
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--c-dark)', lineHeight: 1.5 }}>{rule.action}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#E53E3E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                      Penalty for violation
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--c-dark)', lineHeight: 1.5 }}>{rule.penalty}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why This Matters */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
          borderRadius: 12,
          padding: '28px 32px',
          color: '#fff',
          marginBottom: 28,
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#fff' }}>
          Why This Matters
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { stat: '$455M', label: 'Lost annually to freight fraud — silent dispatchers are the #1 warning sign', color: '#E53E3E' },
            { stat: '68%', label: 'Of owner-operators report being "ghosted" by a dispatcher at least once', color: '#D69E2E' },
            { stat: '4.2h', label: 'Average time an owner-op waits before realizing their dispatcher went silent', color: '#3B82F6' },
            { stat: '3×', label: 'Owner-ops with protocol-compliant dispatchers report 3× higher satisfaction', color: '#38A169' },
          ].map(({ stat, label, color }) => (
            <div
              key={stat}
              style={{
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '16px',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900, color }}>{stat}</div>
              <div style={{ fontSize: 12, color: '#CBD5E0', marginTop: 6, lineHeight: 1.4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: '#A0AEC0', lineHeight: 1.6 }}>
          The DispaLoadIQ Status Protocol was designed directly from feedback by owner-operators who lost money,
          missed detention pay, or had loads stolen because their dispatcher disappeared mid-transit.
          We built a system where silence is not an option — every missed window is logged, timestamped,
          and sent directly to the truck owner.
        </div>
      </div>

      {/* Trust Score Table */}
      <div className="card" style={{ padding: '24px', borderRadius: 12 }}>
        <h3 className="section-title" style={{ marginBottom: 16 }}>
          Trust Score Impact by Action
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'rgba(59,130,246,0.08)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}>
                Action
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}>
                Trust Score Change
              </th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--c-dark)', borderBottom: '1px solid var(--c-border)' }}>
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { action: 'On-time status update at every checkpoint', change: '+1 pt each', outcome: 'Owner-op notified, load marked compliant', positive: true },
              { action: 'Complete load with zero missed windows', change: '+5 pts', outcome: 'Bonus trust badge, repeat booking likelihood +40%', positive: true },
              { action: 'Miss a window — first offense', change: '−2 to −5 pts', outcome: 'Auto-alert sent, flagged in dispatcher history', positive: false },
              { action: 'Miss a window — repeat offense', change: '−8 pts', outcome: 'Owner-op receives escalation, manager alerted', positive: false },
              { action: 'Dispatcher unreachable > 4 hours', change: '−15 pts', outcome: 'Automatic contract review, suspension possible', positive: false },
              { action: 'Owner-op rates dispatcher 5★ post-load', change: '+3 pts', outcome: 'Featured in marketplace rankings', positive: true },
              { action: 'Proactive delay notification (before due)', change: '+2 pts', outcome: 'Trust boost — owner-op prefers proactive comms', positive: true },
            ].map((row) => (
              <tr
                key={row.action}
                style={{ borderBottom: '1px solid var(--c-border)' }}
              >
                <td style={{ padding: '10px 14px', color: 'var(--c-dark)' }}>{row.action}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: row.positive ? '#38A169' : '#E53E3E',
                      background: row.positive ? 'rgba(56,161,105,0.1)' : 'rgba(229,62,62,0.1)',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 12,
                    }}
                  >
                    {row.change}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#718096' }}>{row.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: 'active', label: 'Active Loads' },
  { id: 'alerts', label: 'Alert History' },
  { id: 'rules', label: 'Protocol Rules' },
]

export default function LoadStatusProtocolPage() {
  const [activeTab, setActiveTab] = useState<TabId>('active')

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Pulsing dot animation */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>

      {/* Tab Nav */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 10,
          padding: 4,
          marginBottom: 28,
          width: 'fit-content',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 22px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 14,
              background: activeTab === tab.id ? 'var(--c-accent, #3B82F6)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#718096',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
            {tab.id === 'active' && (
              <span
                style={{
                  marginLeft: 8,
                  background: activeTab === 'active' ? 'rgba(255,255,255,0.25)' : '#E53E3E',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                1
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'active' && <ActiveLoadsTab />}
      {activeTab === 'alerts' && <AlertHistoryTab />}
      {activeTab === 'rules' && <ProtocolRulesTab />}
    </div>
  )
}
