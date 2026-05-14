import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type LoadStage = 'searching' | 'negotiating' | 'booked' | 'in_transit' | 'delivered' | 'invoiced'
type TruckStatus = 'loaded' | 'empty_soon' | 'empty' | 'home_time'
type ActionPriority = 'urgent' | 'today' | 'upcoming'

interface Client {
  id: string
  name: string
  flag: string
  truckType: string
  truckId: string
  status: TruckStatus
  location: string
  emptyAt?: string          // "Today 3pm" / "Tomorrow 9am"
  currentLoad?: string      // load ID
  ytdRevenue: number
  ytdCommission: number
  avgRpm: number
  phone: string
  preferredLanes: string[]
}

interface Load {
  id: string
  clientId: string
  clientName: string
  stage: LoadStage
  origin: string
  originState: string
  destination: string
  destState: string
  miles: number
  rate: number
  rpm: number
  brokerName: string
  brokerTrust: number       // 0–100
  pickupDate: string
  deliveryDate: string
  cargo: string
  lastUpdated: string
  updatedMinsAgo: number
  notes?: string
  flagged?: boolean
  nextAction?: string
}

interface ActionItem {
  id: string
  priority: ActionPriority
  icon: string
  title: string
  subtitle: string
  loadId?: string
  clientId?: string
  action: string
  dueIn: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: 'c1', name: 'Elena Vasquez', flag: '🇺🇸',
    truckType: '53\' Dry Van', truckId: 'IL-4821',
    status: 'empty_soon', location: 'Nashville, TN', emptyAt: 'Today 4:00pm',
    currentLoad: 'DL-0841',
    ytdRevenue: 48200, ytdCommission: 3856, avgRpm: 2.87, phone: '+1-312-555-0182',
    preferredLanes: ['Midwest → Southeast', 'Chicago → Atlanta'],
  },
  {
    id: 'c2', name: 'Marcus Johnson', flag: '🇺🇸',
    truckType: 'Reefer 48\'', truckId: 'TX-9203',
    status: 'empty', location: 'Dallas, TX', emptyAt: 'Now',
    ytdRevenue: 61400, ytdCommission: 4912, avgRpm: 2.94, phone: '+1-214-555-0371',
    preferredLanes: ['Texas → California', 'Dallas → LA'],
  },
  {
    id: 'c3', name: 'Robert Torres', flag: '🇺🇸',
    truckType: '53\' Dry Van', truckId: 'OH-1174',
    status: 'loaded', location: 'Cleveland, OH → Charlotte, NC',
    currentLoad: 'DL-0829',
    ytdRevenue: 39100, ytdCommission: 3128, avgRpm: 2.71, phone: '+1-216-555-0044',
    preferredLanes: ['Midwest → East Coast'],
  },
  {
    id: 'c4', name: 'Sandra Kim', flag: '🇰🇷',
    truckType: 'Flatbed 48\'', truckId: 'CA-5592',
    status: 'empty_soon', location: 'Phoenix, AZ', emptyAt: 'Tomorrow 9:00am',
    currentLoad: 'DL-0835',
    ytdRevenue: 52700, ytdCommission: 4216, avgRpm: 2.91, phone: '+1-602-555-0219',
    preferredLanes: ['Southwest Lanes', 'CA → AZ → TX'],
  },
  {
    id: 'c5', name: 'James Walker', flag: '🇺🇸',
    truckType: '53\' Dry Van', truckId: 'FL-7730',
    status: 'home_time', location: 'Orlando, FL (Home)',
    ytdRevenue: 28400, ytdCommission: 2272, avgRpm: 2.68, phone: '+1-407-555-0158',
    preferredLanes: ['Southeast lanes'],
  },
]

const LOADS: Load[] = [
  {
    id: 'DL-0847', clientId: 'c2', clientName: 'Marcus Johnson',
    stage: 'searching',
    origin: 'Dallas', originState: 'TX', destination: 'Los Angeles', destState: 'CA',
    miles: 1432, rate: 0, rpm: 0,
    brokerName: '', brokerTrust: 0,
    pickupDate: 'May 14', deliveryDate: 'May 16',
    cargo: 'Refrigerated Food',
    lastUpdated: 'Just now', updatedMinsAgo: 2,
    nextAction: 'Find load for empty truck — urgent',
  },
  {
    id: 'DL-0845', clientId: 'c1', clientName: 'Elena Vasquez',
    stage: 'negotiating',
    origin: 'Nashville', originState: 'TN', destination: 'Atlanta', destState: 'GA',
    miles: 248, rate: 620, rpm: 2.50,
    brokerName: 'Echo Global', brokerTrust: 94,
    pickupDate: 'May 14', deliveryDate: 'May 14',
    cargo: 'Auto Parts',
    lastUpdated: '12 min ago', updatedMinsAgo: 12,
    flagged: true,
    nextAction: 'Rate is below target — counter with $720',
  },
  {
    id: 'DL-0841', clientId: 'c1', clientName: 'Elena Vasquez',
    stage: 'in_transit',
    origin: 'Chicago', originState: 'IL', destination: 'Nashville', destState: 'TN',
    miles: 476, rate: 1380, rpm: 2.90,
    brokerName: 'TQL', brokerTrust: 91,
    pickupDate: 'May 12', deliveryDate: 'May 13',
    cargo: 'Electronics',
    lastUpdated: '3h 22m ago', updatedMinsAgo: 202,
    flagged: true,
    nextAction: 'No status update for 3h 22m — check with driver',
  },
  {
    id: 'DL-0835', clientId: 'c4', clientName: 'Sandra Kim',
    stage: 'in_transit',
    origin: 'Los Angeles', originState: 'CA', destination: 'Phoenix', destState: 'AZ',
    miles: 372, rate: 1080, rpm: 2.90,
    brokerName: 'Coyote', brokerTrust: 88,
    pickupDate: 'May 13', deliveryDate: 'May 13',
    cargo: 'Construction Materials',
    lastUpdated: '47 min ago', updatedMinsAgo: 47,
    nextAction: 'ETA Phoenix 4:30pm — prepare delivery confirmation',
  },
  {
    id: 'DL-0829', clientId: 'c3', clientName: 'Robert Torres',
    stage: 'in_transit',
    origin: 'Cleveland', originState: 'OH', destination: 'Charlotte', destState: 'NC',
    miles: 534, rate: 1440, rpm: 2.70,
    brokerName: 'XPO Logistics', brokerTrust: 85,
    pickupDate: 'May 13', deliveryDate: 'May 14',
    cargo: 'Clothing',
    lastUpdated: '1h 10m ago', updatedMinsAgo: 70,
    nextAction: 'On track — delivery tomorrow morning',
  },
  {
    id: 'DL-0820', clientId: 'c4', clientName: 'Sandra Kim',
    stage: 'delivered',
    origin: 'Phoenix', originState: 'AZ', destination: 'Denver', destState: 'CO',
    miles: 601, rate: 1680, rpm: 2.80,
    brokerName: 'Echo Global', brokerTrust: 94,
    pickupDate: 'May 11', deliveryDate: 'May 12',
    cargo: 'Medical Supplies',
    lastUpdated: 'May 12', updatedMinsAgo: 1440,
    nextAction: 'Upload POD to create invoice',
  },
  {
    id: 'DL-0814', clientId: 'c3', clientName: 'Robert Torres',
    stage: 'invoiced',
    origin: 'Columbus', originState: 'OH', destination: 'NYC', destState: 'NY',
    miles: 560, rate: 1680, rpm: 3.00,
    brokerName: 'TQL', brokerTrust: 91,
    pickupDate: 'May 8', deliveryDate: 'May 9',
    cargo: 'Auto Parts',
    lastUpdated: 'May 10', updatedMinsAgo: 4320,
    nextAction: 'Invoice sent May 10 — payment due May 24 (Net 14)',
  },
]

const ACTIONS: ActionItem[] = [
  {
    id: 'a1', priority: 'urgent', icon: '🚨',
    title: 'Marcus truck empty NOW',
    subtitle: 'Dallas, TX — find load for tomorrow AM pickup',
    clientId: 'c2', action: 'Find Load', dueIn: 'Now',
  },
  {
    id: 'a2', priority: 'urgent', icon: '⚠️',
    title: 'DL-0841 no update 3h 22m',
    subtitle: 'Elena — Chicago→Nashville. Driver last seen I-65mm 240',
    loadId: 'DL-0841', action: 'Check Status', dueIn: '38min',
  },
  {
    id: 'a3', priority: 'today', icon: '💬',
    title: 'Counter Echo Global on DL-0845',
    subtitle: 'They offered $2.50/mile. Your target $2.90. Counter $720.',
    loadId: 'DL-0845', action: 'Negotiate', dueIn: '1h',
  },
  {
    id: 'a4', priority: 'today', icon: '📄',
    title: 'Upload POD for DL-0820',
    subtitle: 'Sandra Kim — Phoenix→Denver. Delivered yesterday.',
    loadId: 'DL-0820', action: 'Upload POD', dueIn: 'Today',
  },
  {
    id: 'a5', priority: 'today', icon: '📡',
    title: 'Sandra ETA Phoenix 4:30pm',
    subtitle: 'Confirm delivery with broker upon arrival',
    loadId: 'DL-0835', action: 'Prepare', dueIn: '4:30pm',
  },
  {
    id: 'a6', priority: 'upcoming', icon: '🔍',
    title: 'Pre-book for Elena — empty tomorrow',
    subtitle: 'Nashville, TN → anywhere Southeast. Reefer or Dry Van.',
    clientId: 'c1', action: 'Search Loads', dueIn: 'Tomorrow',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const STAGE_META: Record<LoadStage, { label: string; color: string; bg: string; step: number }> = {
  searching:   { label: 'Searching',   color: '#718096', bg: '#EDF2F7', step: 1 },
  negotiating: { label: 'Negotiating', color: '#B45309', bg: '#FEF3C7', step: 2 },
  booked:      { label: 'Booked',      color: '#1D4ED8', bg: '#EFF6FF', step: 3 },
  in_transit:  { label: 'In Transit',  color: '#059669', bg: '#ECFDF5', step: 4 },
  delivered:   { label: 'Delivered',   color: '#7C3AED', bg: '#F5F3FF', step: 5 },
  invoiced:    { label: 'Invoiced',    color: '#374151', bg: '#F9FAFB', step: 6 },
}

const STATUS_META: Record<TruckStatus, { label: string; color: string; bg: string; dot: string }> = {
  loaded:     { label: 'Loaded',      color: '#059669', bg: '#ECFDF5', dot: '#10B981' },
  empty_soon: { label: 'Empty soon',  color: '#B45309', bg: '#FFFBEB', dot: '#F59E0B' },
  empty:      { label: 'Empty NOW',   color: '#DC2626', bg: '#FEF2F2', dot: '#EF4444' },
  home_time:  { label: 'Home Time',   color: '#6B7280', bg: '#F9FAFB', dot: '#9CA3AF' },
}

const PRIORITY_META: Record<ActionPriority, { color: string; bg: string; border: string }> = {
  urgent:   { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  today:    { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  upcoming: { color: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
}

const STAGES: LoadStage[] = ['searching','negotiating','booked','in_transit','delivered','invoiced']

// ── Sub-components ────────────────────────────────────────────────────────────

function TruckStatusDot({ status }: { status: TruckStatus }) {
  const m = STATUS_META[status]
  const pulse = status === 'empty'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 20, background: m.bg, fontSize: 11, fontWeight: 600, color: m.color }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: m.dot, display: 'inline-block',
        boxShadow: pulse ? `0 0 0 3px ${m.dot}40` : 'none',
      }} />
      {m.label}
    </span>
  )
}

function ClientCard({ client, loads, selected, onClick }: {
  client: Client
  loads: Load[]
  selected: boolean
  onClick: () => void
}) {
  const sm = STATUS_META[client.status]
  const activeLoad = loads.find(l => l.clientId === client.id && (l.stage === 'in_transit' || l.stage === 'booked'))
  const needsAttention = loads.some(l => l.clientId === client.id && l.flagged)

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? '#EFF6FF' : '#fff',
        border: `1px solid ${selected ? '#3B82F6' : needsAttention ? '#FCA5A5' : '#E5E7EB'}`,
        borderLeft: `3px solid ${selected ? '#3B82F6' : sm.dot}`,
        borderRadius: 10,
        padding: '12px 14px',
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            {client.flag} {client.name}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
            {client.truckType} · {client.truckId}
          </div>
        </div>
        <TruckStatusDot status={client.status} />
      </div>

      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
        📍 {client.location}
        {client.emptyAt && <span style={{ color: client.status === 'empty' ? '#DC2626' : '#B45309', fontWeight: 600 }}> · Empty {client.emptyAt}</span>}
      </div>

      {activeLoad && (
        <div style={{ background: '#F0FDF4', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: '#065F46', marginBottom: 6 }}>
          🚛 {activeLoad.id}: {activeLoad.origin} → {activeLoad.destination} · ${activeLoad.rpm.toFixed(2)}/mi
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
        <span>Avg RPM: <span style={{ color: '#059669', fontWeight: 600 }}>${client.avgRpm.toFixed(2)}</span></span>
        <span>Commission YTD: <span style={{ color: '#374151', fontWeight: 600 }}>${client.ytdCommission.toLocaleString()}</span></span>
      </div>

      {needsAttention && (
        <div style={{ marginTop: 6, fontSize: 10, color: '#DC2626', fontWeight: 600 }}>⚠️ Needs attention</div>
      )}
    </div>
  )
}

function LoadCard({ load, expanded, onToggle, onStageChange, onShowToast }: {
  load: Load
  expanded: boolean
  onToggle: () => void
  onStageChange: (id: string, stage: LoadStage) => void
  onShowToast: (msg: string) => void
}) {
  const sm = STAGE_META[load.stage]
  const overdue = load.updatedMinsAgo > 240 && load.stage === 'in_transit'
  const [note, setNote] = useState('')

  const nextStage = STAGES[STAGES.indexOf(load.stage) + 1] as LoadStage | undefined

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${overdue ? '#FECACA' : load.flagged ? '#FDE68A' : '#E5E7EB'}`,
      borderLeft: `3px solid ${overdue ? '#EF4444' : sm.color}`,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'box-shadow .15s',
    }}>
      {/* Card header — always visible */}
      <div
        onClick={onToggle}
        style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
      >
        {/* Stage badge */}
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: sm.bg, color: sm.color, flexShrink: 0, marginTop: 2, whiteSpace: 'nowrap' }}>
          {sm.step}/6 {sm.label}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              {load.id} · {load.origin}, {load.originState} → {load.destination}, {load.destState}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: load.rpm >= 2.8 ? '#059669' : '#B45309', flexShrink: 0, marginLeft: 8 }}>
              {load.rate > 0 ? `$${load.rate.toLocaleString()} · ${load.rpm.toFixed(2)}/mi` : 'Rate TBD'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6B7280', marginTop: 3, flexWrap: 'wrap' }}>
            <span>👤 {load.clientName}</span>
            <span>📦 {load.cargo}</span>
            <span>{load.miles} mi</span>
            {load.brokerName && (
              <span style={{ color: load.brokerTrust >= 80 ? '#059669' : '#B45309' }}>
                🤝 {load.brokerName} ({load.brokerTrust}/100)
              </span>
            )}
            <span style={{ color: overdue ? '#DC2626' : '#9CA3AF' }}>
              {overdue ? `⚠️ ${load.lastUpdated}` : `Updated ${load.lastUpdated}`}
            </span>
          </div>
          {load.nextAction && !expanded && (
            <div style={{ marginTop: 5, fontSize: 11, color: overdue ? '#DC2626' : '#B45309', fontWeight: 500 }}>
              → {load.nextAction}
            </div>
          )}
        </div>
        <span style={{ color: '#9CA3AF', fontSize: 16, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded panel — the inline workflow */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F3F4F6', padding: '14px 16px', background: '#FAFAFA' }}>

          {/* 6-step progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16, overflowX: 'auto' }}>
            {STAGES.map((stage, i) => {
              const meta = STAGE_META[stage]
              const done = STAGES.indexOf(load.stage) > i
              const current = load.stage === stage
              return (
                <div key={stage} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div
                    onClick={() => { if (done || current) return; onStageChange(load.id, stage) }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      cursor: done || current ? 'default' : 'pointer',
                    }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: done ? '#10B981' : current ? meta.color : '#E5E7EB',
                      color: done || current ? '#fff' : '#9CA3AF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      boxShadow: current ? `0 0 0 3px ${meta.color}30` : 'none',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 9, color: current ? meta.color : done ? '#059669' : '#9CA3AF', fontWeight: current ? 700 : 400, textAlign: 'center', maxWidth: 52 }}>
                      {meta.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ width: 24, height: 2, background: done ? '#10B981' : '#E5E7EB', margin: '0 2px', marginBottom: 18 }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Pickup', value: load.pickupDate },
              { label: 'Delivery', value: load.deliveryDate },
              { label: 'Miles', value: `${load.miles.toLocaleString()} mi` },
              { label: 'Rate', value: load.rate > 0 ? `$${load.rate.toLocaleString()}` : 'Negotiating...' },
              { label: 'RPM', value: load.rate > 0 ? `$${load.rpm.toFixed(2)}/mi` : '—', highlight: load.rpm >= 2.8 },
              { label: 'Broker Trust', value: load.brokerTrust > 0 ? `${load.brokerTrust}/100` : 'Verify first', highlight: load.brokerTrust >= 80 },
            ].map(d => (
              <div key={d.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 7, padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: (d as any).highlight ? '#059669' : '#111827' }}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Status update box */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Quick Status Update</div>
            <textarea
              rows={2}
              placeholder="Add a note (ETA, issues, detention, driver update)..."
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                onClick={() => { setNote(''); onShowToast('✅ Status updated — owner-op notified') }}>
                Send Update to Owner-Op
              </button>
              {nextStage && (
                <button className="btn btn-sm" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 600 }}
                  onClick={() => { onStageChange(load.id, nextStage); onShowToast(`📦 Load moved to ${STAGE_META[nextStage].label}`) }}>
                  → Move to {STAGE_META[nextStage].label}
                </button>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => onShowToast('📞 Dialing broker...')}>📞 Call Broker</button>
            <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => onShowToast('📲 Message sent to driver')}>📲 Text Driver</button>
            <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => onShowToast('📄 Opening RC...')}>📄 View RC</button>
            <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => onShowToast('⚡ Quick Pay available after delivery')}>⚡ Quick Pay</button>
            {load.stage === 'delivered' && (
              <button className="btn btn-sm" style={{ fontSize: 11, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #C4B5FD', fontWeight: 600 }} onClick={() => onShowToast('📤 Invoice created and sent to broker')}>
                📤 Create Invoice
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ActionCard({ item, onShowToast }: { item: ActionItem; onShowToast: (m: string) => void }) {
  const pm = PRIORITY_META[item.priority]
  return (
    <div style={{
      background: '#fff', border: `1px solid ${pm.border}`,
      borderLeft: `3px solid ${pm.color}`,
      borderRadius: 8, padding: '10px 12px', marginBottom: 7,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{item.title}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: pm.color, background: pm.bg, padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>
          {item.dueIn}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8, marginLeft: 23 }}>{item.subtitle}</div>
      <button
        className="btn btn-sm"
        style={{ fontSize: 11, background: pm.bg, color: pm.color, border: `1px solid ${pm.border}`, fontWeight: 600, marginLeft: 23 }}
        onClick={() => onShowToast(`${item.icon} ${item.action} — opening...`)}>
        {item.action} →
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DispatcherWorkspacePage() {
  const [selectedClient, setSelectedClient] = useState<string | null>('c2')
  const [expandedLoad, setExpandedLoad]     = useState<string | null>('DL-0841')
  const [stageFilter, setStageFilter]       = useState<LoadStage | 'all'>('all')
  const [loads, setLoads]                   = useState<Load[]>(LOADS)
  const [toast, setToast]                   = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleStageChange = (loadId: string, newStage: LoadStage) => {
    setLoads(prev => prev.map(l => l.id === loadId ? { ...l, stage: newStage, updatedMinsAgo: 0, lastUpdated: 'Just now', flagged: false } : l))
  }

  const visibleLoads = loads.filter(l => {
    if (selectedClient && l.clientId !== selectedClient) {
      if (stageFilter === 'all') return true
      return l.stage === stageFilter
    }
    if (stageFilter !== 'all') return l.stage === stageFilter
    return true
  })

  const clientLoads = selectedClient
    ? loads.filter(l => l.clientId === selectedClient)
    : loads

  const urgentCount = ACTIONS.filter(a => a.priority === 'urgent').length
  const todayRevenue = loads.filter(l => l.stage === 'in_transit' || l.stage === 'booked')
    .reduce((s, l) => s + l.rate, 0)
  const emptyTrucks = CLIENTS.filter(c => c.status === 'empty' || c.status === 'empty_soon').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', gap: 0 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#111827', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'fadeIn .2s ease' }}>
          {toast}
        </div>
      )}

      {/* ── Morning Briefing Bar ── */}
      <div style={{ background: 'linear-gradient(90deg, #1E3A5F 0%, #1D4ED8 100%)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>☀️ May 13, 2025 — Today's Workspace</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          {[
            { label: 'Active loads', value: loads.filter(l => l.stage === 'in_transit' || l.stage === 'booked').length.toString(), color: '#86EFAC' },
            { label: 'Revenue in motion', value: `$${todayRevenue.toLocaleString()}`, color: '#FCD34D' },
            { label: 'Empty trucks', value: emptyTrucks.toString(), color: emptyTrucks > 0 ? '#FCA5A5' : '#86EFAC' },
            { label: 'Urgent actions', value: urgentCount.toString(), color: urgentCount > 0 ? '#FCA5A5' : '#86EFAC' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Auto-refreshes every 60s</div>
      </div>

      {/* ── Three-column workspace ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', gap: 0, flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT: Client Cards ── */}
        <div style={{ background: '#F9FAFB', borderRight: '1px solid #E5E7EB', overflowY: 'auto', padding: '12px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: .5, marginBottom: 10, padding: '0 4px' }}>
            MY CLIENTS · {CLIENTS.length}
          </div>
          {CLIENTS.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              loads={loads}
              selected={selectedClient === client.id}
              onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
            />
          ))}
          <button
            className="btn btn-sm"
            style={{ width: '100%', marginTop: 4, fontSize: 12, background: '#EFF6FF', color: '#1D4ED8', border: '1px dashed #BFDBFE' }}
            onClick={() => showToast('+ Add new client')}>
            + Add Client
          </button>
        </div>

        {/* ── CENTER: Load Pipeline ── */}
        <div style={{ overflowY: 'auto', padding: '12px 14px' }}>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginRight: 4 }}>
              {selectedClient ? `${CLIENTS.find(c => c.id === selectedClient)?.name}'s Loads` : 'All Loads'}
            </div>
            {(['all', ...STAGES] as (LoadStage | 'all')[]).map(s => {
              const count = loads.filter(l => s === 'all' ? true : l.stage === s).length
              return (
                <button key={s}
                  onClick={() => setStageFilter(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11,
                    fontWeight: stageFilter === s ? 700 : 400,
                    background: stageFilter === s ? '#1D4ED8' : '#F3F4F6',
                    color: stageFilter === s ? '#fff' : '#6B7280',
                  }}>
                  {s === 'all' ? 'All' : STAGE_META[s as LoadStage].label} ({count})
                </button>
              )
            })}
            <button className="btn btn-sm" style={{ marginLeft: 'auto', background: '#059669', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700 }}
              onClick={() => showToast('🔍 Opening Load Board...')}>
              + Find New Load
            </button>
          </div>

          {/* Load cards */}
          {visibleLoads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', marginBottom: 6 }}>No loads in this stage</div>
              <button className="btn btn-primary btn-sm" onClick={() => showToast('Opening Load Board...')}>
                Find a Load →
              </button>
            </div>
          ) : (
            visibleLoads.map(load => (
              <LoadCard
                key={load.id}
                load={load}
                expanded={expandedLoad === load.id}
                onToggle={() => setExpandedLoad(expandedLoad === load.id ? null : load.id)}
                onStageChange={handleStageChange}
                onShowToast={showToast}
              />
            ))
          )}
        </div>

        {/* ── RIGHT: Action Queue ── */}
        <div style={{ background: '#F9FAFB', borderLeft: '1px solid #E5E7EB', overflowY: 'auto', padding: '12px 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: .5, marginBottom: 10, padding: '0 4px' }}>
            ACTION QUEUE · {ACTIONS.length}
          </div>

          {urgentCount > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 10px', marginBottom: 10, fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
              🚨 {urgentCount} urgent — act now
            </div>
          )}

          {(['urgent', 'today', 'upcoming'] as ActionPriority[]).map(priority => {
            const items = ACTIONS.filter(a => a.priority === priority)
            if (items.length === 0) return null
            return (
              <div key={priority} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_META[priority].color, letterSpacing: .5, marginBottom: 6, padding: '0 4px', textTransform: 'uppercase' }}>
                  {priority} ({items.length})
                </div>
                {items.map(item => <ActionCard key={item.id} item={item} onShowToast={showToast} />)}
              </div>
            )
          })}

          {/* Daily summary */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>📈 Today's Numbers</div>
            {[
              { label: 'Loads active', value: loads.filter(l => l.stage === 'in_transit').length.toString() },
              { label: 'Revenue in motion', value: `$${todayRevenue.toLocaleString()}` },
              { label: 'Est. commission today', value: `$${Math.round(todayRevenue * 0.08).toLocaleString()}` },
              { label: 'Avg RPM today', value: loads.filter(l => l.rpm > 0).length > 0 ? `$${(loads.filter(l => l.rpm > 0).reduce((s, l) => s + l.rpm, 0) / loads.filter(l => l.rpm > 0).length).toFixed(2)}/mi` : '—' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #F9FAFB' }}>
                <span style={{ color: '#6B7280' }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
