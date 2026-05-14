import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type PayoutStatus = 'received' | 'pending' | 'overdue'

type PayoutRecord = {
  id: string
  clientId: string
  clientName: string
  loadId: string
  route: string
  miles: number
  grossRate: number      // total broker payout for the load
  commissionPct: number
  commission: number
  brokerName: string
  loadDate: string
  invoiceDate: string
  dueDate: string
  paidDate: string | null
  status: PayoutStatus
  notes: string
}

type MonthData = {
  month: string
  commission: number
  gross: number
  loads: number
  clients: number
  paid: number
  pending: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const PAYOUTS: PayoutRecord[] = [
  { id: 'PO-2441', clientId: 'c1', clientName: 'Mike Rodriguez', loadId: 'CG-4421', route: 'Chicago → Dallas',        miles: 1_201, grossRate: 2_786, commissionPct: 8, commission: 223, brokerName: 'TQL',        loadDate: 'May 12', invoiceDate: 'May 12', dueDate: 'May 19', paidDate: null, status: 'pending', notes: '' },
  { id: 'PO-2440', clientId: 'c4', clientName: 'Anna Perez',     loadId: 'CG-4415', route: 'LA → Sacramento',          miles: 380,  grossRate: 1_100, commissionPct: 8, commission: 88,  brokerName: 'Echo',       loadDate: 'May 12', invoiceDate: 'May 12', dueDate: 'May 19', paidDate: null, status: 'pending', notes: '' },
  { id: 'PO-2438', clientId: 'c2', clientName: 'Sergiy Kovalchuk', loadId: 'CG-4418', route: 'Miami → Atlanta',       miles: 800,  grossRate: 1_960, commissionPct: 8, commission: 157, brokerName: 'Coyote',     loadDate: 'May 11', invoiceDate: 'May 11', dueDate: 'May 18', paidDate: null, status: 'pending', notes: '' },
  { id: 'PO-2435', clientId: 'c1', clientName: 'Mike Rodriguez', loadId: 'CG-4409', route: 'Chicago → Memphis',       miles: 536,  grossRate: 1_340, commissionPct: 8, commission: 107, brokerName: 'TQL',        loadDate: 'May 9',  invoiceDate: 'May 9',  dueDate: 'May 16', paidDate: null, status: 'overdue', notes: 'Follow up with Mike' },
  { id: 'PO-2430', clientId: 'c4', clientName: 'Anna Perez',     loadId: 'CG-4402', route: 'LA → Las Vegas',          miles: 280,  grossRate: 840,   commissionPct: 8, commission: 67,  brokerName: 'Echo',       loadDate: 'May 7',  invoiceDate: 'May 7',  dueDate: 'May 14', paidDate: 'May 14', status: 'received', notes: '' },
  { id: 'PO-2428', clientId: 'c3', clientName: 'Tom Bradley',    loadId: 'CG-4400', route: 'Houston → Austin',        miles: 162,  grossRate: 486,   commissionPct: 8, commission: 39,  brokerName: 'Loadsmith',  loadDate: 'May 6',  invoiceDate: 'May 6',  dueDate: 'May 13', paidDate: 'May 13', status: 'received', notes: '' },
  { id: 'PO-2420', clientId: 'c2', clientName: 'Sergiy Kovalchuk', loadId: 'CG-4388', route: 'Miami → Boston',        miles: 1_490, grossRate: 3_725, commissionPct: 8, commission: 298, brokerName: 'Coyote',    loadDate: 'May 3',  invoiceDate: 'May 3',  dueDate: 'May 10', paidDate: 'May 10', status: 'received', notes: '' },
  { id: 'PO-2415', clientId: 'c1', clientName: 'Mike Rodriguez', loadId: 'CG-4381', route: 'Chicago → Nashville',     miles: 480,  grossRate: 1_200, commissionPct: 8, commission: 96,  brokerName: 'TQL',        loadDate: 'May 2',  invoiceDate: 'May 2',  dueDate: 'May 9',  paidDate: 'May 9', status: 'received', notes: '' },
  { id: 'PO-2410', clientId: 'c5', clientName: 'James Park',     loadId: 'CG-4374', route: 'Atlanta → Charlotte',     miles: 249,  grossRate: 622,   commissionPct: 8, commission: 50,  brokerName: 'Worldwide',  loadDate: 'May 1',  invoiceDate: 'May 1',  dueDate: 'May 8',  paidDate: 'May 8', status: 'received', notes: '' },
  { id: 'PO-2408', clientId: 'c3', clientName: 'Tom Bradley',    loadId: 'CG-4370', route: 'Houston → Phoenix',       miles: 1_157, grossRate: 2_892, commissionPct: 8, commission: 231, brokerName: 'Echo Global', loadDate: 'Apr 29', invoiceDate: 'Apr 29', dueDate: 'May 6',  paidDate: 'May 6', status: 'received', notes: '' },
]

const MONTH_DATA: MonthData[] = [
  { month: 'Jan', commission: 2_840, gross: 35_500, loads: 12, clients: 4, paid: 2_840, pending: 0 },
  { month: 'Feb', commission: 3_200, gross: 40_000, loads: 14, clients: 4, paid: 3_200, pending: 0 },
  { month: 'Mar', commission: 3_760, gross: 47_000, loads: 16, clients: 5, paid: 3_760, pending: 0 },
  { month: 'Apr', commission: 4_120, gross: 51_500, loads: 18, clients: 5, paid: 4_120, pending: 0 },
  { month: 'May', commission: 1_356, gross: 16_950, loads:  6, clients: 5, paid: 889,   pending: 467 },
]

const CLIENT_SUMMARY = [
  { id: 'c1', name: 'Mike Rodriguez',   init: 'MR', loads: 8,  gross: 28_400, commission: 2_272, avgRpm: 2.31, color: '#F97316' },
  { id: 'c2', name: 'Sergiy Kovalchuk', init: 'SK', loads: 7,  gross: 24_600, commission: 1_968, avgRpm: 2.42, color: '#0EA5E9' },
  { id: 'c3', name: 'Tom Bradley',      init: 'TB', loads: 5,  gross: 18_200, commission: 1_456, avgRpm: 2.28, color: '#F59E0B' },
  { id: 'c4', name: 'Anna Perez',       init: 'AP', loads: 6,  gross: 20_100, commission: 1_608, avgRpm: 2.71, color: '#8B5CF6' },
  { id: 'c5', name: 'James Park',       init: 'JP', loads: 3,  gross: 12_400, commission: 992,   avgRpm: 2.55, color: '#10B981' },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const STATUS_META: Record<PayoutStatus, { label: string; color: string; bg: string; icon: string }> = {
  received: { label: 'Received', color: '#22C55E', bg: '#F0FFF4', icon: '✅' },
  pending:  { label: 'Pending',  color: '#D97706', bg: '#FFFBEB', icon: '⏳' },
  overdue:  { label: 'Overdue',  color: '#DC2626', bg: '#FEF2F2', icon: '🔴' },
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PayoutTrackerPage() {
  const [activeTab,  setActiveTab]  = useState<'payouts' | 'clients' | 'monthly'>('payouts')
  const [filterStat, setFilterStat] = useState<PayoutStatus | 'all'>('all')
  const [calcGross,  setCalcGross]  = useState(3000)
  const [calcPct,    setCalcPct]    = useState(8)

  const totalCommission = PAYOUTS.reduce((s, p) => s + p.commission, 0)
  const totalGross      = PAYOUTS.reduce((s, p) => s + p.grossRate, 0)
  const totalPending    = PAYOUTS.filter(p => p.status !== 'received').reduce((s, p) => s + p.commission, 0)
  const totalReceived   = PAYOUTS.filter(p => p.status === 'received').reduce((s, p) => s + p.commission, 0)
  const overdueCount    = PAYOUTS.filter(p => p.status === 'overdue').length

  const filteredPayouts = filterStat === 'all' ? PAYOUTS : PAYOUTS.filter(p => p.status === filterStat)

  const maxComm   = Math.max(...MONTH_DATA.map(m => m.commission), 1)
  const calcComm  = Math.round(calcGross * (calcPct / 100))
  const taxEst    = Math.round(calcComm * 0.25)
  const takehome  = calcComm - taxEst

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── KPI Strip ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          { icon: '💰', label: 'Total Commission',  value: fmt(totalCommission), sub: 'May + prior',        color: '#8B5CF6' },
          { icon: '✅', label: 'Received',           value: fmt(totalReceived),   sub: 'cleared',            color: '#22C55E' },
          { icon: '⏳', label: 'Pending',            value: fmt(totalPending),    sub: 'awaiting payment',   color: '#D97706' },
          { icon: '🔴', label: 'Overdue',            value: `${overdueCount} invoices`, sub: 'need follow-up', color: '#DC2626' },
          { icon: '📊', label: 'Gross Handled',      value: fmt(totalGross),      sub: 'broker freight $',   color: '#4BAED4' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 10, color: s.color, fontWeight: 700, background: s.color + '18', padding: '2px 6px', borderRadius: 5 }}>{s.sub}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          {[
            { key: 'payouts',  label: `💸 All Payouts (${PAYOUTS.length})` },
            { key: 'clients',  label: `🚛 By Client` },
            { key: 'monthly',  label: `📊 Monthly Trend` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                flex: 1, padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                color: activeTab === tab.key ? '#8B5CF6' : '#718096',
                borderBottom: activeTab === tab.key ? '2px solid #8B5CF6' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 18 }}>

          {/* ── PAYOUTS TAB ───────────────────────────────────────────────── */}
          {activeTab === 'payouts' && (
            <>
              {/* Filter row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(['all', 'pending', 'overdue', 'received'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStat(s)}
                    className={filterStat === s ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                    style={filterStat === s ? { background: '#8B5CF6' } : {}}
                  >
                    {s === 'all' ? 'All' : STATUS_META[s].icon + ' ' + STATUS_META[s].label}
                    {' '}
                    ({s === 'all' ? PAYOUTS.length : PAYOUTS.filter(p => p.status === s).length})
                  </button>
                ))}
              </div>

              {/* Payout table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 820 }}>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Client</th>
                      <th>Load / Route</th>
                      <th>Broker</th>
                      <th style={{ textAlign: 'right' }}>Gross $</th>
                      <th style={{ textAlign: 'right' }}>Commission</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.map(p => {
                      const m = STATUS_META[p.status]
                      return (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700, color: '#4BAED4' }}>{p.id}</td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 12 }}>{p.clientName.split(' ')[0]}</div>
                            <div style={{ fontSize: 10, color: '#A0AEC0' }}>{p.loadId}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12, color: '#2D3748' }}>{p.route}</div>
                            <div style={{ fontSize: 10, color: '#A0AEC0' }}>{p.miles.toLocaleString()} mi</div>
                          </td>
                          <td style={{ fontSize: 12 }}>{p.brokerName}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#4BAED4' }}>{fmt(p.grossRate)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#8B5CF6' }}>{fmt(p.commission)}</td>
                          <td>
                            <div style={{ fontSize: 12, color: p.status === 'overdue' ? '#DC2626' : '#4A5568', fontWeight: p.status === 'overdue' ? 700 : 400 }}>
                              {p.dueDate}
                            </div>
                            {p.paidDate && <div style={{ fontSize: 10, color: '#22C55E' }}>Paid {p.paidDate}</div>}
                          </td>
                          <td>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                              background: m.bg, color: m.color,
                            }}>
                              {m.icon} {m.label}
                            </span>
                            {p.notes && <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 2 }}>{p.notes}</div>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CLIENTS TAB ───────────────────────────────────────────────── */}
          {activeTab === 'clients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CLIENT_SUMMARY.map(c => {
                const share = (c.commission / totalCommission) * 100
                return (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', background: '#F7FAFC', borderRadius: 12,
                    border: '1px solid #E2E8F0',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: c.color + '22', border: `2px solid ${c.color}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: c.color,
                    }}>
                      {c.init}
                    </div>

                    {/* Name + loads */}
                    <div style={{ flex: '0 0 160px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{c.loads} loads · ${c.avgRpm.toFixed(2)} avg RPM</div>
                    </div>

                    {/* Progress bar (share of total commission) */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: '#A0AEC0' }}>Share of commission</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{share.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${share}%`, height: '100%', background: c.color, borderRadius: 4 }} />
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ textAlign: 'right', minWidth: 90 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#8B5CF6' }}>{fmt(c.commission)}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>commission</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 90 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#4BAED4' }}>{fmt(c.gross)}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>gross handled</div>
                    </div>
                  </div>
                )
              })}

              {/* Totals row */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 24, padding: '12px 16px',
                background: '#F0F4FF', borderRadius: 12, border: '1px solid #C7D2FE',
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#8B5CF6' }}>{fmt(CLIENT_SUMMARY.reduce((s, c) => s + c.commission, 0))}</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>Total commission</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#4BAED4' }}>{fmt(CLIENT_SUMMARY.reduce((s, c) => s + c.gross, 0))}</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>Total gross</div>
                </div>
              </div>
            </div>
          )}

          {/* ── MONTHLY TREND TAB ─────────────────────────────────────────── */}
          {activeTab === 'monthly' && (
            <div style={{ display: 'flex', gap: 24 }}>
              {/* Bar chart */}
              <div style={{ flex: 1 }}>
                <h3 className="section-title" style={{ marginBottom: 16 }}>Commission by Month</h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 180 }}>
                  {MONTH_DATA.map(m => {
                    const h   = Math.max((m.commission / maxComm) * 150, 6)
                    const ph  = Math.max((m.paid / maxComm) * 150, 3)
                    const isNow = m.month === 'May'
                    return (
                      <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isNow ? '#8B5CF6' : '#718096' }}>{fmt(m.commission)}</div>
                        <div style={{ width: '100%', height: h, borderRadius: '5px 5px 0 0', position: 'relative', overflow: 'hidden', background: isNow ? '#C4B5FD' : '#E2E8F0' }}>
                          {/* Paid portion */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ph, background: isNow ? '#8B5CF6' : '#A0AEC0', borderRadius: '5px 5px 0 0' }} />
                        </div>
                        <div style={{ fontSize: 12, color: isNow ? '#8B5CF6' : '#718096', fontWeight: isNow ? 800 : 400 }}>{m.month}</div>
                        <div style={{ fontSize: 9, color: '#A0AEC0' }}>{m.loads} loads</div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#8B5CF6' }} />
                    <span style={{ fontSize: 10, color: '#718096' }}>Paid/Confirmed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: '#C4B5FD' }} />
                    <span style={{ fontSize: 10, color: '#718096' }}>Pending / Not yet collected</span>
                  </div>
                </div>

                {/* Monthly summary table */}
                <table className="data-table" style={{ marginTop: 20 }}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th style={{ textAlign: 'right' }}>Commission</th>
                      <th style={{ textAlign: 'right' }}>Paid</th>
                      <th style={{ textAlign: 'right' }}>Pending</th>
                      <th style={{ textAlign: 'right' }}>Loads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTH_DATA.map(m => (
                      <tr key={m.month} style={m.month === 'May' ? { fontWeight: 700 } : {}}>
                        <td style={{ fontWeight: 700 }}>{m.month}</td>
                        <td style={{ textAlign: 'right', color: '#8B5CF6', fontWeight: 700 }}>{fmt(m.commission)}</td>
                        <td style={{ textAlign: 'right', color: '#22C55E' }}>{fmt(m.paid)}</td>
                        <td style={{ textAlign: 'right', color: m.pending > 0 ? '#D97706' : '#A0AEC0' }}>{m.pending > 0 ? fmt(m.pending) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{m.loads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Commission calculator */}
              <div style={{ flexShrink: 0, width: 280 }}>
                <div className="card" style={{ background: 'linear-gradient(145deg, #F5F3FF, #EDE9FE)', border: '1px solid #C4B5FD' }}>
                  <h3 className="section-title" style={{ marginBottom: 14 }}>Commission Calculator</h3>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 6 }}>
                      Gross Load Rate ($)
                    </label>
                    <input
                      type="number" min="500" max="20000" step="100"
                      value={calcGross}
                      onChange={e => setCalcGross(parseInt(e.target.value) || calcGross)}
                      style={{
                        width: '100%', border: '2px solid #C4B5FD', borderRadius: 8,
                        padding: '8px 12px', fontSize: 16, fontWeight: 700, color: '#7C3AED',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <input type="range" min="500" max="10000" step="100" value={calcGross}
                      onChange={e => setCalcGross(parseInt(e.target.value))}
                      style={{ width: '100%', marginTop: 6, accentColor: '#8B5CF6' }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 6 }}>
                      Commission % ({calcPct}%)
                    </label>
                    <input type="range" min="5" max="15" step="0.5" value={calcPct}
                      onChange={e => setCalcPct(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#8B5CF6' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#A0AEC0' }}>
                      <span>5%</span><span>10%</span><span>15%</span>
                    </div>
                  </div>

                  {/* Results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Your Commission', value: fmt(calcComm), color: '#8B5CF6', big: true },
                      { label: 'Est. Tax (25%)',  value: `- ${fmt(taxEst)}`, color: '#E53E3E', big: false },
                      { label: 'Take-Home',        value: fmt(takehome),  color: '#22C55E', big: true  },
                    ].map(r => (
                      <div key={r.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: '#fff', borderRadius: 10,
                        border: `1.5px solid ${r.color}33`,
                      }}>
                        <span style={{ fontSize: 11, color: '#718096' }}>{r.label}</span>
                        <span style={{ fontSize: r.big ? 17 : 14, fontWeight: 800, color: r.color }}>{r.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 12, fontSize: 10, color: '#A0AEC0', textAlign: 'center' }}>
                    Tax estimate is approximate. Consult your CPA for accurate filing.
                  </div>
                </div>

                {/* YTD summary */}
                <div className="card" style={{ marginTop: 14, padding: '14px 16px' }}>
                  <h3 className="section-title" style={{ marginBottom: 10 }}>Year-to-Date</h3>
                  {[
                    { label: 'Total Commission', value: fmt(MONTH_DATA.reduce((s, m) => s + m.commission, 0)), color: '#8B5CF6' },
                    { label: 'Total Loads',       value: MONTH_DATA.reduce((s, m) => s + m.loads, 0).toString(), color: '#4BAED4' },
                    { label: 'Avg per Month',     value: fmt(Math.round(MONTH_DATA.reduce((s, m) => s + m.commission, 0) / MONTH_DATA.length)), color: '#F97316' },
                    { label: 'Best Month',        value: 'Apr — $4,120', color: '#22C55E' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0F4F8' }}>
                      <span style={{ fontSize: 11, color: '#718096' }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
