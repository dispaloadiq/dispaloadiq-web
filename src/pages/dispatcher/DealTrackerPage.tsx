import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type DealStage =
  | 'offer'
  | 'negotiation'
  | 'booked'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'invoiced'
  | 'paid'

type Deal = {
  id: string
  clientName: string
  clientInit: string
  clientColor: string
  route: string
  rate: number
  broker: string
  stage: DealStage
  daysInStage: number
  loadId: string
  notes: string
}

// ── Stage metadata ─────────────────────────────────────────────────────────────
const STAGE_META: Record<DealStage, { label: string; icon: string; color: string; bg: string; next: DealStage | null }> = {
  offer:       { label: 'Offer',       icon: '🔍', color: '#3B82F6', bg: '#EFF6FF', next: 'negotiation' },
  negotiation: { label: 'Negotiation', icon: '🤝', color: '#F59E0B', bg: '#FFFBEB', next: 'booked' },
  booked:      { label: 'Booked',      icon: '📋', color: '#06B6D4', bg: '#ECFEFF', next: 'dispatched' },
  dispatched:  { label: 'Dispatched',  icon: '🚛', color: '#8B5CF6', bg: '#F5F3FF', next: 'in_transit' },
  in_transit:  { label: 'In Transit',  icon: '🔄', color: '#F97316', bg: '#FFF7ED', next: 'delivered' },
  delivered:   { label: 'Delivered',   icon: '✅', color: '#22C55E', bg: '#F0FFF4', next: 'invoiced' },
  invoiced:    { label: 'Invoiced',    icon: '💵', color: '#A855F7', bg: '#FAF5FF', next: 'paid' },
  paid:        { label: 'Paid',        icon: '💰', color: '#10B981', bg: '#ECFDF5', next: null },
}

const STAGE_ORDER: DealStage[] = [
  'offer', 'negotiation', 'booked', 'dispatched', 'in_transit', 'delivered', 'invoiced', 'paid',
]

// ── Mock data ─────────────────────────────────────────────────────────────────
const INITIAL_DEALS: Deal[] = [
  {
    id: 'DL-1001', clientName: 'James Park',       clientInit: 'JP', clientColor: '#10B981',
    route: 'Atlanta → Nashville', rate: 980,   broker: 'TQL',          stage: 'offer',
    daysInStage: 0, loadId: 'CG-5510', notes: 'Sent offer, waiting for reply',
  },
  {
    id: 'DL-1002', clientName: 'Tom Bradley',       clientInit: 'TB', clientColor: '#F59E0B',
    route: 'Houston → Phoenix',   rate: 3_100, broker: 'CH Robinson',  stage: 'negotiation',
    daysInStage: 1, loadId: 'CG-5498', notes: 'Broker countered at $2,950',
  },
  {
    id: 'DL-1003', clientName: 'Anna Perez',         clientInit: 'AP', clientColor: '#8B5CF6',
    route: 'LA → Sacramento',     rate: 1_200, broker: 'Landstar',     stage: 'booked',
    daysInStage: 1, loadId: 'CG-5491', notes: 'Confirmed, driver assigned',
  },
  {
    id: 'DL-1004', clientName: 'Sergiy Kovalchuk',   clientInit: 'SK', clientColor: '#0EA5E9',
    route: 'Miami → Atlanta',     rate: 1_650, broker: 'Coyote Logistics', stage: 'dispatched',
    daysInStage: 2, loadId: 'CG-5483', notes: 'Picked up 6am, on schedule',
  },
  {
    id: 'DL-1005', clientName: 'Mike Rodriguez',     clientInit: 'MR', clientColor: '#F97316',
    route: 'Chicago → Dallas',    rate: 2_840, broker: 'Echo Global',  stage: 'in_transit',
    daysInStage: 3, loadId: 'CG-5470', notes: 'ETA Dallas tomorrow 2pm',
  },
  {
    id: 'DL-1006', clientName: 'Mike Rodriguez',     clientInit: 'MR', clientColor: '#F97316',
    route: 'Dallas → Memphis',    rate: 1_800, broker: 'Echo Global',  stage: 'delivered',
    daysInStage: 1, loadId: 'CG-5455', notes: 'POD received, ready to invoice',
  },
  {
    id: 'DL-1007', clientName: 'Sergiy Kovalchuk',   clientInit: 'SK', clientColor: '#0EA5E9',
    route: 'Charlotte → DC',      rate: 1_450, broker: 'Uber Freight', stage: 'invoiced',
    daysInStage: 2, loadId: 'CG-5440', notes: 'Invoice #INV-4821 sent May 11',
  },
  {
    id: 'DL-1008', clientName: 'Anna Perez',         clientInit: 'AP', clientColor: '#8B5CF6',
    route: 'Vegas → Denver',      rate: 2_200, broker: 'XPO',          stage: 'paid',
    daysInStage: 0, loadId: 'CG-5421', notes: 'Commission $176 received',
  },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  const meta = STAGE_META[deal.stage]
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: `1.5px solid ${meta.color}33`,
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 14px ${meta.color}30`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
    >
      {/* Client row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: deal.clientColor + '22', border: `1.5px solid ${deal.clientColor}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 800, color: deal.clientColor,
        }}>
          {deal.clientInit}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {deal.clientName.split(' ')[0]} {deal.clientName.split(' ')[1]?.[0]}.
          </div>
          <div style={{ fontSize: 10, color: '#A0AEC0' }}>{deal.loadId}</div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#22C55E', whiteSpace: 'nowrap' }}>
          {fmt(deal.rate)}
        </div>
      </div>

      {/* Route */}
      <div style={{ fontSize: 11, color: '#4A5568', marginBottom: 6, fontWeight: 600 }}>
        📍 {deal.route}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#718096', background: '#F7FAFC', padding: '2px 8px', borderRadius: 5, border: '1px solid #E2E8F0' }}>
          {deal.broker}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: deal.daysInStage > 3 ? '#DC2626' : deal.daysInStage > 1 ? '#D97706' : '#A0AEC0',
        }}>
          {deal.daysInStage === 0 ? 'Today' : `${deal.daysInStage}d in stage`}
        </span>
      </div>
    </div>
  )
}

// ── Deal Modal ─────────────────────────────────────────────────────────────────
function DealModal({ deal, onClose, onMoveNext, onClose: _onClose }: {
  deal: Deal
  onClose: () => void
  onMoveNext: (id: string) => void
}) {
  const meta = STAGE_META[deal.stage]
  const nextMeta = deal.stage !== 'paid' ? STAGE_META[STAGE_ORDER[STAGE_ORDER.indexOf(deal.stage) + 1]] : null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18, padding: 28, width: 460, maxWidth: '95vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: deal.clientColor + '22', border: `2px solid ${deal.clientColor}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: deal.clientColor,
              }}>
                {deal.clientInit}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{deal.clientName}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>{deal.loadId}</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            border: 'none', background: '#F7FAFC', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#718096',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>

        {/* Stage badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: meta.bg, color: meta.color, fontWeight: 700, fontSize: 12,
          padding: '5px 12px', borderRadius: 8, marginBottom: 18,
          border: `1px solid ${meta.color}33`,
        }}>
          {meta.icon} {meta.label}
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Route',      value: deal.route },
            { label: 'Rate',       value: fmt(deal.rate) },
            { label: 'Broker',     value: deal.broker },
            { label: 'Days in Stage', value: deal.daysInStage === 0 ? 'Today' : `${deal.daysInStage} day${deal.daysInStage !== 1 ? 's' : ''}` },
          ].map(d => (
            <div key={d.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{d.value}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {deal.notes && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
            padding: '10px 14px', marginBottom: 18,
          }}>
            <div style={{ fontSize: 10, color: '#B45309', fontWeight: 700, marginBottom: 3 }}>NOTE</div>
            <div style={{ fontSize: 12, color: '#92400E' }}>{deal.notes}</div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {nextMeta && (
            <button
              onClick={() => { onMoveNext(deal.id); onClose() }}
              style={{
                flex: 1, padding: '11px 16px', border: 'none', borderRadius: 10, cursor: 'pointer',
                background: meta.color, color: '#fff', fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              Move to {nextMeta.icon} {nextMeta.label}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '11px 16px', border: '1.5px solid #E2E8F0', borderRadius: 10, cursor: 'pointer',
              background: '#F7FAFC', color: '#4A5568', fontSize: 13, fontWeight: 600,
            }}
          >
            Add Note
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '11px 16px', border: '1.5px solid #FCA5A5', borderRadius: 10, cursor: 'pointer',
              background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600,
            }}
          >
            Close Deal
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DealTrackerPage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const activeDeals      = deals.filter(d => d.stage !== 'paid' && d.stage !== 'delivered').length
  const totalPipeline    = deals.filter(d => d.stage !== 'paid').reduce((s, d) => s + d.rate, 0)
  const avgDaysInStage   = deals.length ? (deals.reduce((s, d) => s + d.daysInStage, 0) / deals.length) : 0
  const paidCount        = deals.filter(d => d.stage === 'paid').length
  const conversionRate   = deals.length ? Math.round((paidCount / deals.length) * 100) : 0

  const handleMoveNext = (id: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id !== id) return d
      const idx = STAGE_ORDER.indexOf(d.stage)
      if (idx === STAGE_ORDER.length - 1) return d
      return { ...d, stage: STAGE_ORDER[idx + 1], daysInStage: 0 }
    }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { icon: '📊', label: 'Active Deals',     value: activeDeals.toString(),           sub: 'in pipeline',       color: '#3B82F6' },
          { icon: '💼', label: 'Total Pipeline',    value: fmt(totalPipeline),               sub: 'open loads $',      color: '#8B5CF6' },
          { icon: '⏱️', label: 'Avg Deal Age',      value: `${avgDaysInStage.toFixed(1)}d`,  sub: 'days per stage',    color: '#F97316' },
          { icon: '🎯', label: 'Conversion Rate',   value: `${conversionRate}%`,             sub: 'offer → paid',      color: '#22C55E' },
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

      {/* ── Kanban Board ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#1A2535' }}>
            Deal Pipeline
          </h2>
          <div style={{ fontSize: 12, color: '#A0AEC0' }}>
            {deals.length} total deals · click a card for details
          </div>
        </div>

        {/* Scrollable board */}
        <div style={{
          overflowX: 'auto',
          padding: '16px 16px 20px',
          display: 'flex',
          gap: 14,
          minHeight: 360,
        }}>
          {STAGE_ORDER.map(stage => {
            const meta      = STAGE_META[stage]
            const stageDeals = deals.filter(d => d.stage === stage)
            return (
              <div
                key={stage}
                style={{
                  flex: '0 0 220px',
                  background: '#F7FAFC',
                  borderRadius: 14,
                  border: `1.5px solid ${meta.color}33`,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Column header */}
                <div style={{
                  padding: '10px 14px',
                  background: meta.color + '14',
                  borderBottom: `2px solid ${meta.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{meta.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: meta.color }}>{meta.label}</span>
                  </div>
                  <div style={{
                    minWidth: 22, height: 22, borderRadius: 11,
                    background: stageDeals.length > 0 ? meta.color : '#E2E8F0',
                    color: stageDeals.length > 0 ? '#fff' : '#A0AEC0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  }}>
                    {stageDeals.length}
                  </div>
                </div>

                {/* Cards */}
                <div style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
                  {stageDeals.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '24px 12px',
                      color: '#CBD5E0', fontSize: 11, fontStyle: 'italic',
                    }}>
                      No deals
                    </div>
                  ) : (
                    stageDeals.map(deal => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onClick={() => setSelectedDeal(deal)}
                      />
                    ))
                  )}
                </div>

                {/* Column total (if any deals) */}
                {stageDeals.length > 0 && (
                  <div style={{
                    padding: '8px 14px', borderTop: `1px solid ${meta.color}22`,
                    background: meta.color + '08',
                    fontSize: 11, fontWeight: 700, color: meta.color, textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    {fmt(stageDeals.reduce((s, d) => s + d.rate, 0))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Deal Modal ───────────────────────────────────────────────────────── */}
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onMoveNext={handleMoveNext}
        />
      )}
    </div>
  )
}
