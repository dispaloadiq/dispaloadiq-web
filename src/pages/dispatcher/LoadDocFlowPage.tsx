import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────
type DocStatus = 'complete' | 'pending' | 'overdue' | 'none'
type LoadStatus = 'in-transit' | 'delivering-soon' | 'delivered' | 'invoiced' | 'paid' | 'offer-pending'
type FilterKey = 'all' | 'missing-rc' | 'missing-bol' | 'missing-pod' | 'invoice-due' | 'paid'

type DocStep = {
  label: string
  status: DocStatus
  detail: string
}

type LoadRecord = {
  id: string
  driver: string
  route: string
  amount: number
  broker: string
  loadStatus: LoadStatus
  rc: DocStep
  bol: DocStep
  pod: DocStep
  invoice: DocStep
  badge?: 'action-needed' | 'invoice-overdue'
  paidNote?: string
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const LOADS: LoadRecord[] = [
  {
    id: 'CG-4421', driver: 'Mike R.', route: 'CHI → DAL', amount: 2_786, broker: 'TQL', loadStatus: 'in-transit',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed 7:00 AM' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'pending',  detail: 'Pending delivery' },
    invoice: { label: 'Invoice', status: 'pending',  detail: 'Pending POD' },
  },
  {
    id: 'CG-4418', driver: 'Sergiy K.', route: 'MIA → ATL', amount: 1_960, broker: 'Coyote', loadStatus: 'in-transit',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'pending',  detail: 'Pending delivery' },
    invoice: { label: 'Invoice', status: 'pending',  detail: 'Pending POD' },
  },
  {
    id: 'CG-4415', driver: 'Anna P.', route: 'LAX → SAC', amount: 1_100, broker: 'Echo', loadStatus: 'delivering-soon',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'overdue',  detail: 'NEEDED IN 1H' },
    invoice: { label: 'Invoice', status: 'pending',  detail: 'Pending POD' },
    badge: 'action-needed',
  },
  {
    id: 'CG-4414', driver: 'Mike R.', route: 'NYC → CHI', amount: 3_100, broker: 'CH Robinson', loadStatus: 'delivered',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'complete', detail: 'Uploaded' },
    invoice: { label: 'Invoice', status: 'overdue',  detail: 'NOT SENT (2 days overdue)' },
    badge: 'invoice-overdue',
  },
  {
    id: 'CG-4412', driver: 'Tom B.', route: 'DAL → PHX', amount: 2_400, broker: 'TQL', loadStatus: 'invoiced',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'complete', detail: 'Uploaded' },
    invoice: { label: 'Invoice', status: 'complete', detail: 'Sent · Pending payment' },
  },
  {
    id: 'CG-4410', driver: 'Sergiy K.', route: 'ATL → NYC', amount: 2_800, broker: 'Coyote', loadStatus: 'paid',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'complete', detail: 'Uploaded' },
    invoice: { label: 'Invoice', status: 'complete', detail: 'Paid' },
    paidNote: 'Paid $2,576 (after 8% commission)',
  },
  {
    id: 'CG-4409', driver: 'Anna P.', route: 'PHX → LAX', amount: 1_600, broker: 'Echo', loadStatus: 'paid',
    rc:      { label: 'RC',      status: 'complete', detail: 'Signed' },
    bol:     { label: 'BOL',     status: 'complete', detail: 'Uploaded' },
    pod:     { label: 'POD',     status: 'complete', detail: 'Uploaded' },
    invoice: { label: 'Invoice', status: 'complete', detail: 'Sent · $1,472 · PAID' },
  },
  {
    id: 'CG-4407', driver: 'James P.', route: 'ATL → IND', amount: 2_100, broker: 'Worldwide', loadStatus: 'offer-pending',
    rc:      { label: 'RC',      status: 'pending',  detail: 'Awaiting signature' },
    bol:     { label: 'BOL',     status: 'none',     detail: '—' },
    pod:     { label: 'POD',     status: 'none',     detail: '—' },
    invoice: { label: 'Invoice', status: 'none',     detail: '—' },
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const DOC_COLORS: Record<DocStatus, { bg: string; text: string; border: string; icon: string }> = {
  complete: { bg: '#F0FFF4', text: '#16A34A', border: '#22C55E', icon: '✅' },
  pending:  { bg: '#FFFBEB', text: '#D97706', border: '#F59E0B', icon: '⏳' },
  overdue:  { bg: '#FEF2F2', text: '#DC2626', border: '#EF4444', icon: '🔴' },
  none:     { bg: '#F7FAFC', text: '#A0AEC0', border: '#CBD5E0', icon: '❌' },
}

const LOAD_STATUS_META: Record<LoadStatus, { label: string; color: string; bg: string }> = {
  'in-transit':      { label: 'In Transit',      color: '#2563EB', bg: '#EFF6FF' },
  'delivering-soon': { label: 'Delivering Soon',  color: '#7C3AED', bg: '#F5F3FF' },
  'delivered':       { label: 'Delivered',        color: '#D97706', bg: '#FFFBEB' },
  'invoiced':        { label: 'Invoiced',         color: '#0891B2', bg: '#ECFEFF' },
  'paid':            { label: 'PAID ✅',           color: '#16A34A', bg: '#F0FFF4' },
  'offer-pending':   { label: 'Offer Pending',    color: '#718096', bg: '#F7FAFC' },
}

function matchesFilter(load: LoadRecord, filter: FilterKey): boolean {
  if (filter === 'all') return true
  if (filter === 'missing-rc')    return load.rc.status !== 'complete'
  if (filter === 'missing-bol')   return load.bol.status !== 'complete'
  if (filter === 'missing-pod')   return load.pod.status !== 'complete'
  if (filter === 'invoice-due')   return load.invoice.status === 'overdue' || (load.pod.status === 'complete' && load.invoice.status !== 'complete')
  if (filter === 'paid')          return load.loadStatus === 'paid'
  return true
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function DocPill({ step }: { step: DocStep }) {
  const c = DOC_COLORS[step.status]
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '8px 12px', borderRadius: 10, background: c.bg,
      border: `1.5px solid ${c.border}`, minWidth: 88, flex: 1,
    }}>
      <span style={{ fontSize: 16 }}>{c.icon}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color: c.text }}>{step.label}</span>
      <span style={{ fontSize: 9, color: c.text, textAlign: 'center', lineHeight: 1.3 }}>{step.detail}</span>
    </div>
  )
}

function Arrow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', color: '#CBD5E0', fontSize: 18, flexShrink: 0, paddingBottom: 6 }}>
      →
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LoadDocFlowPage() {
  const [expandedLoad, setExpandedLoad] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')

  const filteredLoads = LOADS.filter(l => matchesFilter(l, filter))

  const FILTER_PILLS: { key: FilterKey; label: string }[] = [
    { key: 'all',          label: 'All' },
    { key: 'missing-rc',   label: 'Missing RC' },
    { key: 'missing-bol',  label: 'Missing BOL' },
    { key: 'missing-pod',  label: 'Missing POD' },
    { key: 'invoice-due',  label: 'Invoice Due' },
    { key: 'paid',         label: 'Paid' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1A2535', margin: 0 }}>
          Load Document Flow 📄
        </h1>
        <p style={{ fontSize: 13, color: '#718096', margin: '4px 0 0' }}>
          Track every document for every load — RC, BOL, POD, Invoice
        </p>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { icon: '🚛', label: 'Loads This Month', value: '23',              sub: 'active loads',       color: '#4BAED4' },
          { icon: '✅', label: 'Docs Complete',     value: '18 (78%)',        sub: 'fully documented',   color: '#22C55E' },
          { icon: '📄', label: 'Invoices Pending',  value: '3 — $6,240',     sub: 'awaiting payment',   color: '#D97706' },
          { icon: '⚡', label: 'Avg Invoice-to-Pay', value: '4.2 days',      sub: 'avg collection time', color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{
                fontSize: 10, color: s.color, fontWeight: 700,
                background: s.color + '18', padding: '2px 6px', borderRadius: 5,
              }}>{s.sub}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Content + Sidebar ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* ── Load List ──────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTER_PILLS.map(pill => (
              <button
                key={pill.key}
                onClick={() => setFilter(pill.key)}
                className={filter === pill.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                style={filter === pill.key ? { background: '#4BAED4', borderColor: '#4BAED4' } : {}}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Load cards */}
          {filteredLoads.map(load => {
            const isExpanded = expandedLoad === load.id
            const statusMeta = LOAD_STATUS_META[load.loadStatus]
            const isHighlighted = load.loadStatus === 'delivering-soon'

            return (
              <div
                key={load.id}
                className="card"
                style={{
                  padding: 0, overflow: 'hidden',
                  border: isHighlighted
                    ? '2px solid #7C3AED'
                    : load.badge === 'invoice-overdue'
                      ? '2px solid #EF4444'
                      : '1px solid #E2E8F0',
                  boxShadow: isHighlighted ? '0 0 0 3px #7C3AED18' : undefined,
                }}
              >
                {/* Card header — clickable to expand */}
                <div
                  onClick={() => setExpandedLoad(isExpanded ? null : load.id)}
                  style={{
                    padding: '14px 18px', cursor: 'pointer',
                    background: isHighlighted ? 'linear-gradient(90deg, #F5F3FF, #fff)' : '#fff',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {/* Load ID */}
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#1A2535', minWidth: 80 }}>
                      {load.id}
                    </span>

                    {/* Driver */}
                    <span style={{ fontSize: 12, color: '#4A5568', fontWeight: 600 }}>
                      {load.driver}
                    </span>

                    {/* Route */}
                    <span style={{
                      fontSize: 12, color: '#4BAED4', fontWeight: 700,
                      background: '#EFF6FF', padding: '2px 8px', borderRadius: 6,
                    }}>
                      {load.route}
                    </span>

                    {/* Amount */}
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>
                      {fmt(load.amount)}
                    </span>

                    {/* Broker */}
                    <span style={{ fontSize: 11, color: '#718096' }}>{load.broker}</span>

                    <div style={{ flex: 1 }} />

                    {/* Badge */}
                    {load.badge === 'action-needed' && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 8,
                        background: '#F5F3FF', color: '#7C3AED', border: '1.5px solid #7C3AED',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        ⚡ Action Needed
                      </span>
                    )}
                    {load.badge === 'invoice-overdue' && (
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 8,
                        background: '#FEF2F2', color: '#DC2626', border: '1.5px solid #EF4444',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>
                        🔴 Invoice Overdue
                      </span>
                    )}

                    {/* Load status badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
                      background: statusMeta.bg, color: statusMeta.color,
                    }}>
                      {statusMeta.label}
                    </span>

                    {/* Expand chevron */}
                    <span style={{ fontSize: 12, color: '#A0AEC0', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ▼
                    </span>
                  </div>

                  {/* Pipeline bar */}
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
                    <DocPill step={load.rc} />
                    <Arrow />
                    <DocPill step={load.bol} />
                    <Arrow />
                    <DocPill step={load.pod} />
                    <Arrow />
                    <DocPill step={load.invoice} />
                  </div>

                  {/* Paid note */}
                  {load.paidNote && (
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: '#16A34A',
                      background: '#F0FFF4', padding: '6px 12px', borderRadius: 8,
                      border: '1px solid #22C55E',
                    }}>
                      💰 {load.paidNote}
                    </div>
                  )}

                  {/* Action buttons */}
                  <ActionButtons load={load} />
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div style={{
                    padding: '16px 18px',
                    borderTop: '1px solid #E2E8F0',
                    background: '#F7FAFC',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {[load.rc, load.bol, load.pod, load.invoice].map(step => {
                        const c = DOC_COLORS[step.status]
                        return (
                          <div key={step.label} style={{
                            background: '#fff', borderRadius: 10, padding: '12px 14px',
                            border: `1.5px solid ${c.border}`,
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: c.text, marginBottom: 6 }}>
                              {c.icon} {step.label}
                            </div>
                            <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 4 }}>{step.detail}</div>
                            <div style={{ fontSize: 10, color: '#A0AEC0' }}>
                              {step.status === 'complete'
                                ? 'Document on file'
                                : step.status === 'none'
                                  ? 'Not started'
                                  : 'Awaiting action'}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Broker contact + notes */}
                    <div style={{ display: 'flex', gap: 14 }}>
                      <div style={{
                        flex: 1, background: '#fff', borderRadius: 10, padding: '12px 14px',
                        border: '1px solid #E2E8F0',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Broker Contact</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{load.broker}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>dispatch@{load.broker.toLowerCase().replace(/\s/g, '')}.com</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>(800) 555-0000</div>
                      </div>
                      <div style={{
                        flex: 2, background: '#fff', borderRadius: 10, padding: '12px 14px',
                        border: '1px solid #E2E8F0',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Notes</div>
                        <textarea
                          placeholder="Add notes for this load..."
                          rows={2}
                          style={{
                            width: '100%', border: '1px solid #E2E8F0', borderRadius: 8,
                            padding: '8px 10px', fontSize: 12, color: '#4A5568',
                            resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredLoads.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 20px', color: '#A0AEC0',
              background: '#F7FAFC', borderRadius: 12, border: '1px dashed #CBD5E0',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No loads match this filter</div>
            </div>
          )}
        </div>

        {/* ── Right Sidebar ──────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, width: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Outstanding Actions */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <h3 className="section-title" style={{ marginBottom: 12 }}>Outstanding Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🔴', loadId: 'CG-4415', action: 'Upload POD', note: 'delivery in 1h', urgent: true },
                { icon: '🔴', loadId: 'CG-4414', action: 'Send invoice to CH Robinson', note: '$3,100 · 2 days late', urgent: true },
                { icon: '🟡', loadId: 'CG-4421', action: 'POD pending delivery', note: '', urgent: false },
                { icon: '🟡', loadId: 'CG-4418', action: 'POD pending delivery', note: '', urgent: false },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '9px 12px', borderRadius: 10,
                  background: item.urgent ? '#FEF2F2' : '#FFFBEB',
                  border: `1px solid ${item.urgent ? '#FCA5A5' : '#FCD34D'}`,
                }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: item.urgent ? '#DC2626' : '#D97706' }}>
                        {item.loadId}
                      </span>
                      <div style={{ fontSize: 11, color: '#4A5568', marginTop: 1 }}>{item.action}</div>
                      {item.note && (
                        <div style={{ fontSize: 10, color: '#718096' }}>{item.note}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="card" style={{ padding: '16px 18px' }}>
            <h3 className="section-title" style={{ marginBottom: 12 }}>Invoice Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Invoices sent, unpaid', value: '$6,476', color: '#D97706' },
                { label: 'Drafts ready to send',  value: '$4,886', color: '#0891B2' },
                { label: 'Paid this month',        value: '$41,200', color: '#16A34A' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #F0F4F8',
                }}>
                  <span style={{ fontSize: 11, color: '#718096' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Big CTA button */}
            <button style={{
              marginTop: 14, width: '100%', padding: '12px 0',
              background: 'linear-gradient(135deg, #4BAED4, #2563EB)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 8px #2563EB33',
              letterSpacing: '0.2px',
            }}>
              📄 Generate All Pending Invoices
            </button>
          </div>

          {/* Pipeline legend */}
          <div className="card" style={{ padding: '14px 18px' }}>
            <h3 className="section-title" style={{ marginBottom: 10 }}>Pipeline Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(Object.entries(DOC_COLORS) as [DocStatus, typeof DOC_COLORS[DocStatus]][]).map(([status, c]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                    textTransform: 'capitalize',
                  }}>
                    {status === 'none' ? 'Not Started' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Action Buttons ─────────────────────────────────────────────────────────────
function ActionButtons({ load }: { load: LoadRecord }) {
  const buttons: { label: string; color: string; bg: string; border: string }[] = []

  if (load.rc.status === 'pending' || load.rc.status === 'overdue') {
    buttons.push({ label: '✍️ Sign RC', color: '#7C3AED', bg: '#F5F3FF', border: '#7C3AED' })
  }
  if (load.pod.status === 'overdue') {
    buttons.push({ label: '📷 Upload POD', color: '#DC2626', bg: '#FEF2F2', border: '#EF4444' })
  } else if (load.pod.status === 'pending' && load.loadStatus === 'delivered') {
    buttons.push({ label: '📷 Upload POD', color: '#D97706', bg: '#FFFBEB', border: '#F59E0B' })
  }
  if (load.invoice.status === 'overdue') {
    buttons.push({ label: '📄 Generate Invoice', color: '#DC2626', bg: '#FEF2F2', border: '#EF4444' })
  } else if (load.invoice.status === 'pending' && load.pod.status === 'complete') {
    buttons.push({ label: '📄 Generate Invoice', color: '#0891B2', bg: '#ECFEFF', border: '#0891B2' })
  }
  if (load.loadStatus === 'invoiced') {
    buttons.push({ label: '💰 Mark Paid', color: '#16A34A', bg: '#F0FFF4', border: '#22C55E' })
  }

  if (buttons.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {buttons.map(btn => (
        <button
          key={btn.label}
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: 11, fontWeight: 700, padding: '5px 12px',
            borderRadius: 8, border: `1.5px solid ${btn.border}`,
            background: btn.bg, color: btn.color, cursor: 'pointer',
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
