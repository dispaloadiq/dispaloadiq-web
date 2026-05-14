import { useState, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'submit' | 'active' | 'history' | 'howto'

type AdvanceStatus = 'Reviewing' | 'Funded' | 'Collecting from Broker' | 'Complete'
type HistoryStatus = 'Collected' | 'Partial' | 'Dispute'

interface ActiveAdvance {
  id: string
  loadId: string
  broker: string
  loadAmount: number
  advanceAmount: number
  fee: number
  status: AdvanceStatus
  daysSinceFunded: number
  collectionPct: number
}

interface HistoryRecord {
  date: string
  loadId: string
  advanceAmount: number
  fee: number
  broker: string
  status: HistoryStatus
  daysToCollect: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const ACTIVE_ADVANCES: ActiveAdvance[] = [
  {
    id: 'a1',
    loadId: 'EG-920441',
    broker: 'Echo Global',
    loadAmount: 2400,
    advanceAmount: 2160,
    fee: 72,
    status: 'Funded',
    daysSinceFunded: 3,
    collectionPct: 0,
  },
  {
    id: 'a2',
    loadId: 'TQ-554832',
    broker: 'TQL',
    loadAmount: 3800,
    advanceAmount: 3420,
    fee: 114,
    status: 'Collecting from Broker',
    daysSinceFunded: 18,
    collectionPct: 60,
  },
  {
    id: 'a3',
    loadId: 'CY-773201',
    broker: 'Coyote',
    loadAmount: 2900,
    advanceAmount: 2610,
    fee: 87,
    status: 'Reviewing',
    daysSinceFunded: 0,
    collectionPct: 0,
  },
  {
    id: 'a4',
    loadId: 'XP-112034',
    broker: 'XPO Logistics',
    loadAmount: 4200,
    advanceAmount: 3780,
    fee: 126,
    status: 'Collecting from Broker',
    daysSinceFunded: 27,
    collectionPct: 85,
  },
]

const HISTORY_RECORDS: HistoryRecord[] = [
  { date: 'Apr 15', loadId: 'CH-990231', advanceAmount: 1980, fee: 66,  broker: 'CH Robinson',   status: 'Collected', daysToCollect: 34 },
  { date: 'Apr 08', loadId: 'EG-901100', advanceAmount: 1620, fee: 54,  broker: 'Echo Global',   status: 'Collected', daysToCollect: 28 },
  { date: 'Mar 29', loadId: 'TQ-443211', advanceAmount: 2700, fee: 90,  broker: 'TQL',           status: 'Collected', daysToCollect: 31 },
  { date: 'Mar 21', loadId: 'CY-881002', advanceAmount: 1800, fee: 60,  broker: 'Coyote',        status: 'Partial',   daysToCollect: 45 },
  { date: 'Mar 14', loadId: 'XP-007234', advanceAmount: 3510, fee: 117, broker: 'XPO Logistics', status: 'Collected', daysToCollect: 29 },
  { date: 'Mar 05', loadId: 'EG-800023', advanceAmount: 2160, fee: 72,  broker: 'Echo Global',   status: 'Collected', daysToCollect: 22 },
  { date: 'Feb 27', loadId: 'TQ-321980', advanceAmount: 2430, fee: 81,  broker: 'TQL',           status: 'Dispute',   daysToCollect: 0  },
  { date: 'Feb 18', loadId: 'AL-556610', advanceAmount: 1620, fee: 54,  broker: 'Arrive Logistics', status: 'Collected', daysToCollect: 38 },
  { date: 'Feb 09', loadId: 'CY-663421', advanceAmount: 3060, fee: 102, broker: 'Coyote',        status: 'Collected', daysToCollect: 26 },
  { date: 'Jan 31', loadId: 'XP-098712', advanceAmount: 2610, fee: 87,  broker: 'XPO Logistics', status: 'Collected', daysToCollect: 33 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function statusColor(status: AdvanceStatus): string {
  switch (status) {
    case 'Reviewing':            return '#f59e0b'
    case 'Funded':               return '#10b981'
    case 'Collecting from Broker': return '#3b82f6'
    case 'Complete':             return '#6b7280'
    default:                     return '#6b7280'
  }
}

function historyStatusColor(status: HistoryStatus): string {
  switch (status) {
    case 'Collected': return '#10b981'
    case 'Partial':   return '#f59e0b'
    case 'Dispute':   return '#ef4444'
    default:          return '#6b7280'
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SubmitClaimTab() {
  const [dragOver, setDragOver] = useState(false)
  const [uploadedBOL, setUploadedBOL] = useState(false)
  const [uploadedRC, setUploadedRC] = useState(false)
  const [loadAmount, setLoadAmount] = useState(2400)
  const [brokerName, setBrokerName] = useState('Echo Global')
  const [deliveryDate, setDeliveryDate] = useState('2026-05-12')
  const [submitted, setSubmitted] = useState(false)
  const bolRef = useRef<HTMLInputElement>(null)
  const rcRef = useRef<HTMLInputElement>(null)

  const advanceAmount = Math.round(loadAmount * 0.9)
  const fee = Math.round(loadAmount * 0.03)
  const youReceive = advanceAmount - fee
  const remaining = Math.round(loadAmount * 0.1)

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
        <h2 style={{ color: 'var(--c-dark)', marginBottom: 8, fontSize: 22, fontWeight: 700 }}>
          Quick Pay Request Submitted!
        </h2>
        <p style={{ color: '#6b7280', marginBottom: 8 }}>
          Load <strong>#EG-920441</strong> — <strong>{fmt(advanceAmount)}</strong> advance is being reviewed.
        </p>
        <p style={{ color: '#6b7280', marginBottom: 32 }}>
          You'll receive <strong style={{ color: '#10b981' }}>{fmt(youReceive)}</strong> in your account within 24 hours.
        </p>
        <div className="card" style={{ display: 'inline-flex', gap: 32, padding: '20px 40px', textAlign: 'left' }}>
          {[
            { label: 'Submitted', time: 'Now', done: true },
            { label: 'Under Review', time: '~15 min', done: false },
            { label: 'Funds Deposited', time: 'Within 24h', done: false },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step.done ? '#10b981' : 'var(--c-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step.done ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14,
              }}>
                {step.done ? '✓' : i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--c-dark)' }}>{step.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{step.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <button className="btn btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Upload zone */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>
            Upload Documents
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* BOL Upload */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); setUploadedBOL(true) }}
              onClick={() => bolRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--c-accent)' : uploadedBOL ? '#10b981' : 'var(--c-border)'}`,
                borderRadius: 10,
                padding: '28px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: uploadedBOL ? 'rgba(16,185,129,0.05)' : dragOver ? 'rgba(99,102,241,0.04)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <input ref={bolRef} type="file" style={{ display: 'none' }} onChange={() => setUploadedBOL(true)} />
              <div style={{ fontSize: 28, marginBottom: 8 }}>{uploadedBOL ? '✅' : '📄'}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--c-dark)', marginBottom: 4 }}>
                {uploadedBOL ? 'BOL Uploaded' : 'Bill of Lading (BOL)'}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                {uploadedBOL ? 'Click to replace' : 'Drag & drop or click'}
              </div>
            </div>
            {/* RC Upload */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); setUploadedRC(true) }}
              onClick={() => rcRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--c-accent)' : uploadedRC ? '#10b981' : 'var(--c-border)'}`,
                borderRadius: 10,
                padding: '28px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                background: uploadedRC ? 'rgba(16,185,129,0.05)' : dragOver ? 'rgba(99,102,241,0.04)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <input ref={rcRef} type="file" style={{ display: 'none' }} onChange={() => setUploadedRC(true)} />
              <div style={{ fontSize: 28, marginBottom: 8 }}>{uploadedRC ? '✅' : '📋'}</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--c-dark)', marginBottom: 4 }}>
                {uploadedRC ? 'Rate Con Uploaded' : 'Rate Confirmation (RC)'}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>
                {uploadedRC ? 'Click to replace' : 'Drag & drop or click'}
              </div>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>
            Load Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Load ID
              </label>
              <input
                type="text"
                defaultValue="EG-920441"
                readOnly
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 8, fontSize: 14,
                  border: '1.5px solid var(--c-border)', background: 'rgba(0,0,0,0.02)',
                  color: '#6b7280', fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Broker Name
              </label>
              <select
                value={brokerName}
                onChange={e => setBrokerName(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 8, fontSize: 14,
                  border: '1.5px solid var(--c-border)', background: 'var(--c-surface)',
                  color: 'var(--c-dark)', appearance: 'auto',
                }}
              >
                {['Echo Global', 'TQL', 'Coyote', 'XPO Logistics', 'CH Robinson', 'Arrive Logistics'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Load Amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  value={loadAmount}
                  onChange={e => setLoadAmount(Number(e.target.value))}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 12px 9px 26px', borderRadius: 8, fontSize: 14,
                    border: '1.5px solid var(--c-border)', background: 'var(--c-surface)',
                    color: 'var(--c-dark)',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 8, fontSize: 14,
                  border: '1.5px solid var(--c-border)', background: 'var(--c-surface)',
                  color: 'var(--c-dark)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Eligibility checklist */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>
            Eligibility Check
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: `Broker (${brokerName}) has Trust Score 60+`, ok: true },
              { label: 'Load delivery confirmed by driver', ok: true },
              { label: 'BOL document uploaded', ok: uploadedBOL },
              { label: 'Rate Confirmation uploaded', ok: uploadedRC },
              { label: 'Account in good standing', ok: true },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: item.ok ? '#10b981' : 'var(--c-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: item.ok ? '#fff' : '#9ca3af', fontWeight: 700,
                }}>
                  {item.ok ? '✓' : '○'}
                </div>
                <span style={{ fontSize: 14, color: item.ok ? 'var(--c-dark)' : '#9ca3af' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Processing timeline */}
        <div className="card" style={{ padding: 20, background: 'rgba(99,102,241,0.04)', border: '1.5px solid rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5', marginBottom: 10 }}>Processing Timeline</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'nowrap', overflowX: 'auto' }}>
            {[
              { icon: '📤', label: 'Submit', sub: 'Now' },
              { icon: '🔍', label: 'Review', sub: '~15 min' },
              { icon: '💰', label: 'Deposit', sub: 'Within 24h' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{step.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-dark)' }}>{step.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{step.sub}</div>
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: 2, background: 'rgba(99,102,241,0.25)', margin: '0 4px', marginBottom: 12 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column — calculator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>
            Advance Calculator
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
            {/* Load amount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Load Amount</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-dark)' }}>{fmt(loadAmount)}</span>
            </div>
            {/* Advance */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>90% Advance</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{fmt(advanceAmount)}</span>
            </div>
            {/* Fee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>Platform Fee (3%)</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>-{fmt(fee)}</span>
            </div>
          </div>

          {/* You receive today */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: 12, padding: '20px 18px', marginBottom: 16, textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              You Receive TODAY
            </div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{fmt(youReceive)}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 }}>deposited within 24 hours</div>
          </div>

          {/* Remaining */}
          <div style={{
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Platform Collects from Broker</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>{fmt(loadAmount)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>Remaining 10% to you</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>{fmt(remaining)}</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setSubmitted(true)}
            style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, borderRadius: 10 }}
          >
            ⚡ Request Quick Pay
          </button>

          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
            By requesting Quick Pay you authorize DispaLoadIQ to collect the full invoice amount from the broker on your behalf.
          </p>
        </div>
      </div>
    </div>
  )
}

function ActiveAdvancesTab() {
  const total = ACTIVE_ADVANCES.reduce((sum, a) => sum + a.advanceAmount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Advanced', value: fmt(total), color: '#4f46e5' },
          { label: 'Active Advances', value: ACTIVE_ADVANCES.length.toString(), color: '#10b981' },
          { label: 'Collecting Now', value: ACTIVE_ADVANCES.filter(a => a.status === 'Collecting from Broker').length.toString(), color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Advance cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {ACTIVE_ADVANCES.map(adv => (
          <div key={adv.id} className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--c-dark)' }}>#{adv.loadId}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: statusColor(adv.status) + '18',
                    color: statusColor(adv.status),
                  }}>{adv.status}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{adv.broker}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{fmt(adv.advanceAmount)}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>advanced of {fmt(adv.loadAmount)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: adv.status === 'Collecting from Broker' ? 14 : 0, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Fee: </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-dark)' }}>{fmt(adv.fee)}</span>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Net to you: </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{fmt(adv.advanceAmount - adv.fee)}</span>
              </div>
              {adv.daysSinceFunded > 0 && (
                <div>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Days since funded: </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-dark)' }}>{adv.daysSinceFunded}d</span>
                </div>
              )}
            </div>

            {adv.status === 'Collecting from Broker' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Collection progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{adv.collectionPct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--c-border)' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${adv.collectionPct}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryTab() {
  const totalAdvanced = HISTORY_RECORDS.reduce((s, r) => s + r.advanceAmount, 0)
  const totalFees = HISTORY_RECORDS.reduce((s, r) => s + r.fee, 0)
  const collected = HISTORY_RECORDS.filter(r => r.status === 'Collected')
  const avgDays = collected.length
    ? Math.round(collected.reduce((s, r) => s + r.daysToCollect, 0) / collected.length)
    : 0
  const savedVsWaiting = Math.round(totalAdvanced * 0.92) // hypothetical time value

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Advanced (YTD)', value: fmt(totalAdvanced), color: '#4f46e5' },
          { label: 'Total Fees Paid', value: fmt(totalFees), color: '#ef4444' },
          { label: 'Avg Collection Time', value: `${avgDays} days`, color: '#f59e0b' },
          { label: 'vs. Waiting 45 Days', value: `+${fmt(savedVsWaiting)} earlier`, color: '#10b981' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>Transaction History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {['Date', 'Load ID', 'Broker', 'Advance', 'Fee', 'Status', 'Days to Collect'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
                    letterSpacing: '0.05em', whiteSpace: 'nowrap',
                    borderBottom: '1px solid var(--c-border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HISTORY_RECORDS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--c-dark)' }}>#{r.loadId}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--c-dark)', whiteSpace: 'nowrap' }}>{r.broker}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>{fmt(r.advanceAmount)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#ef4444', whiteSpace: 'nowrap' }}>{fmt(r.fee)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: historyStatusColor(r.status) + '18',
                      color: historyStatusColor(r.status),
                      whiteSpace: 'nowrap',
                    }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--c-dark)', whiteSpace: 'nowrap' }}>
                    {r.daysToCollect > 0 ? `${r.daysToCollect}d` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function HowItWorksTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const steps = [
    { icon: '🚚', title: 'Deliver the Load', desc: 'Driver completes delivery and confirms via the app. Delivery timestamp is recorded automatically.' },
    { icon: '📤', title: 'Upload BOL + RC', desc: 'Submit your Bill of Lading and Rate Confirmation documents through Quick Pay. Takes under 2 minutes.' },
    { icon: '⚡', title: 'Receive 90% in 24h', desc: 'After a quick 15-minute review, we advance 90% of the load amount minus a 3% fee directly to your bank.' },
    { icon: '🔄', title: 'We Collect from Broker', desc: 'DispaLoadIQ handles all collection from the broker — you never chase payments again. Average collection: 31 days.' },
    { icon: '💵', title: 'Remaining 10% Sent to You', desc: 'Once we collect from the broker, the remaining 10% (less the 3% fee already deducted) is transferred to you.' },
  ]

  const faqs = [
    {
      q: "What if the broker doesn't pay?",
      a: "DispaLoadIQ absorbs the collection risk. We only offer Quick Pay on loads with brokers that have a Trust Score of 60 or higher. If a broker fails to pay, our legal and collections team pursues the debt — you keep your advance.",
    },
    {
      q: "Which brokers are eligible for Quick Pay?",
      a: "Any broker with a Trust Score of 60+ in our system is eligible. This includes Echo Global, TQL, Coyote, XPO Logistics, CH Robinson, Arrive Logistics, and most major licensed freight brokers. We add new brokers weekly.",
    },
    {
      q: "What is the Quick Pay fee?",
      a: "The fee is a flat 3% of the total load amount, deducted from your advance. On a $2,400 load that's $72 — significantly cheaper than traditional factoring companies that charge 3–5% plus monthly minimums and contracts.",
    },
    {
      q: "How fast is the deposit?",
      a: "We target 24 hours from submission. Most advances are reviewed in under 15 minutes and funded same-day via ACH transfer. Expedited wire transfer is available for an additional $15 flat fee.",
    },
    {
      q: "Is there a limit on how many loads I can Quick Pay?",
      a: "There is a soft limit of $25,000 in outstanding advances per account. Premium plan users get a $50,000 limit. Limits reset as advances are collected from brokers.",
    },
  ]

  const comparison = [
    { feature: 'Advance rate', qp: '90%', traditional: '85–93%', wait: '100%' },
    { feature: 'Fee', qp: '3% flat', traditional: '3–5% + fees', wait: '0%' },
    { feature: 'Time to money', qp: '24 hours', traditional: '1–3 days', wait: '30–60 days' },
    { feature: 'Contract required', qp: 'No', traditional: 'Yes (monthly min)', wait: 'N/A' },
    { feature: 'Credit check', qp: 'No', traditional: 'Yes', wait: 'N/A' },
    { feature: 'Minimum volume', qp: 'None', traditional: 'Often required', wait: 'N/A' },
    { feature: 'Collection handled by', qp: 'DispaLoadIQ', traditional: 'Factoring company', wait: 'You' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Step-by-step visual */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700, color: 'var(--c-dark)' }}>
          How Quick Pay Works
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', left: 22, top: 48, width: 2,
                  height: 'calc(100% - 12px)', background: 'var(--c-border)',
                  zIndex: 0,
                }} />
              )}
              {/* Step icon */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, zIndex: 1, boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}>
                {step.icon}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 28 : 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)', marginBottom: 4 }}>
                  Step {i + 1}: {step.title}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--c-border)' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>
            Quick Pay vs. Alternatives
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--c-border)' }}>
                  Feature
                </th>
                {[
                  { label: '⚡ Quick Pay', color: '#4f46e5', bg: 'rgba(99,102,241,0.06)' },
                  { label: '🏦 Traditional Factoring', color: '#6b7280', bg: 'transparent' },
                  { label: '⏳ Wait 30–60 Days', color: '#6b7280', bg: 'transparent' },
                ].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 20px', textAlign: 'center', fontSize: 12,
                    fontWeight: 700, color: h.color, textTransform: 'uppercase',
                    letterSpacing: '0.04em', background: h.bg,
                    borderBottom: '1px solid var(--c-border)',
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < comparison.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'var(--c-dark)' }}>{row.feature}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#4f46e5', fontWeight: 600, textAlign: 'center', background: 'rgba(99,102,241,0.03)' }}>{row.qp}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#6b7280', textAlign: 'center' }}>{row.traditional}</td>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#6b7280', textAlign: 'center' }}>{row.wait}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>
          Frequently Asked Questions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 0', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 12, textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-dark)', lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{
                  fontSize: 18, color: '#6b7280', flexShrink: 0,
                  transform: openFaq === i ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s',
                }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{
                  paddingBottom: 16, fontSize: 13, color: '#6b7280',
                  lineHeight: 1.7, paddingRight: 32,
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string }[] = [
  { id: 'submit',  label: '⚡ Submit Claim' },
  { id: 'active',  label: '📋 Active Advances' },
  { id: 'history', label: '📊 History' },
  { id: 'howto',   label: '❓ How It Works' },
]

export default function QuickPayPage() {
  const [activeTab, setActiveTab] = useState<TabId>('submit')

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              }}>⚡</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--c-dark)' }}>Quick Pay</h1>
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Instant factoring — get paid in 24 hours, not 60 days</p>
              </div>
            </div>
          </div>
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.2)',
            borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#065f46' }}>Advances Available</span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Up to $25,000</span>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        background: 'var(--c-surface)', borderRadius: 12, padding: 4,
        border: '1px solid var(--c-border)', width: 'fit-content',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? 'var(--c-dark)' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'submit'  && <SubmitClaimTab />}
      {activeTab === 'active'  && <ActiveAdvancesTab />}
      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'howto'   && <HowItWorksTab />}
    </div>
  )
}
