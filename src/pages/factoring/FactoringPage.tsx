import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type FactorStatus = 'funded' | 'pending' | 'submitted' | 'rejected' | 'chargeback'
type CompanyStatus = 'connected' | 'available' | 'pending_setup'

interface FactoringCompany {
  id: string
  name: string
  logo: string
  advanceRate: number
  fee: number
  fundingSpeed: string
  minInvoice: number
  creditCheck: boolean
  recourse: boolean
  status: CompanyStatus
  monthlyVolume?: number
  avgFundingDays?: number
  rating: number
  features: string[]
}

interface FactoredInvoice {
  id: string
  loadRef: string
  broker: string
  invoiceAmount: number
  advanceAmount: number
  feeAmount: number
  netAmount: number
  submittedDate: string
  fundedDate?: string
  status: FactorStatus
  factoringCompany: string
  advancePct: number
  daysToFund?: number
  route: string
  agingDays?: number
  brokerCredit?: 'A+' | 'A' | 'B+' | 'B' | 'C'
}

interface FuelAdvance {
  id: string
  driver: string
  amount: number
  loadRef: string
  date: string
  status: 'active' | 'deducted' | 'overdue'
  dueDate: string
}

interface BrokerCredit {
  name: string
  credit: 'A+' | 'A' | 'B+' | 'B' | 'C'
  payDays: number
  lastCheck: string
  totalInvoiced: number
  openBalance: number
  riskFlag: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const COMPANIES: FactoringCompany[] = [
  {
    id: 'fc1', name: 'RTS Financial', logo: '🏦',
    advanceRate: 97, fee: 2.5, fundingSpeed: 'Same day',
    minInvoice: 100, creditCheck: false, recourse: false,
    status: 'connected', monthlyVolume: 24_600, avgFundingDays: 0, rating: 4.8,
    features: ['Same-day ACH', 'Fuel advances', 'Free credit checks', 'No hidden fees'],
  },
  {
    id: 'fc2', name: 'OTR Capital', logo: '💳',
    advanceRate: 96, fee: 3.0, fundingSpeed: '1–2 business days',
    minInvoice: 250, creditCheck: true, recourse: false,
    status: 'available', rating: 4.6,
    features: ['Non-recourse', 'Fuel card', 'Mobile app', 'Broker credit checks'],
  },
  {
    id: 'fc3', name: 'Triumph Business Capital', logo: '🏛️',
    advanceRate: 95, fee: 2.0, fundingSpeed: '24 hours',
    minInvoice: 500, creditCheck: true, recourse: true,
    status: 'available', rating: 4.7,
    features: ['Low fee (2%)', 'Fleet discounts', 'QuickPay network', 'API integration'],
  },
  {
    id: 'fc4', name: 'Apex Capital Corp', logo: '⚡',
    advanceRate: 98, fee: 3.5, fundingSpeed: 'Same day',
    minInvoice: 0, creditCheck: false, recourse: false,
    status: 'available', rating: 4.5,
    features: ['98% advance rate', 'Fuel advances', '24/7 support', 'New authority welcome'],
  },
  {
    id: 'fc5', name: 'Riviera Finance', logo: '🌊',
    advanceRate: 96, fee: 2.8, fundingSpeed: '24 hours',
    minInvoice: 300, creditCheck: true, recourse: false,
    status: 'available', rating: 4.4,
    features: ['Non-recourse', 'Online portal', 'Dedicated account manager', 'Spot factoring'],
  },
]

const INVOICES: FactoredInvoice[] = [
  {
    id: 'FI-0046', loadRef: 'TRP-20048', broker: 'Echo Global Logistics',
    invoiceAmount: 2_180, advanceAmount: 2_115, feeAmount: 55, netAmount: 2_115,
    submittedDate: 'May 12, 2026', fundedDate: 'May 12, 2026',
    status: 'funded', factoringCompany: 'RTS Financial', advancePct: 97, daysToFund: 0,
    route: 'Chicago → Dallas', brokerCredit: 'A+',
  },
  {
    id: 'FI-0045', loadRef: 'TRP-20047', broker: 'Coyote Logistics',
    invoiceAmount: 1_690, advanceAmount: 1_639, feeAmount: 42, netAmount: 1_639,
    submittedDate: 'May 11, 2026', fundedDate: 'May 11, 2026',
    status: 'funded', factoringCompany: 'RTS Financial', advancePct: 97, daysToFund: 0,
    route: 'Atlanta → Miami', brokerCredit: 'A',
  },
  {
    id: 'FI-0044', loadRef: 'TRP-20046', broker: 'TQL',
    invoiceAmount: 1_420, advanceAmount: 1_377, feeAmount: 36, netAmount: 1_377,
    submittedDate: 'May 10, 2026', status: 'pending', factoringCompany: 'RTS Financial',
    advancePct: 97, route: 'Memphis → Nashville', brokerCredit: 'A', agingDays: 2,
  },
  {
    id: 'FI-0043', loadRef: 'TRP-20045', broker: 'XPO Logistics',
    invoiceAmount: 2_786, advanceAmount: 2_702, feeAmount: 70, netAmount: 2_702,
    submittedDate: 'May 8, 2026', fundedDate: 'May 8, 2026',
    status: 'funded', factoringCompany: 'RTS Financial', advancePct: 97, daysToFund: 0,
    route: 'Houston → Phoenix', brokerCredit: 'A+',
  },
  {
    id: 'FI-0042', loadRef: 'TRP-20044', broker: 'Arrive Logistics',
    invoiceAmount: 796, advanceAmount: 772, feeAmount: 20, netAmount: 772,
    submittedDate: 'May 6, 2026', fundedDate: 'May 6, 2026',
    status: 'funded', factoringCompany: 'RTS Financial', advancePct: 97, daysToFund: 0,
    route: 'Nashville → Charlotte', brokerCredit: 'B+',
  },
  {
    id: 'FI-0041', loadRef: 'TRP-20043', broker: 'Transplace',
    invoiceAmount: 1_514, advanceAmount: 1_469, feeAmount: 38, netAmount: 1_469,
    submittedDate: 'May 4, 2026', status: 'submitted', factoringCompany: 'RTS Financial',
    advancePct: 97, route: 'Portland → San Francisco', brokerCredit: 'B', agingDays: 8,
  },
  {
    id: 'FI-0040', loadRef: 'TRP-20042', broker: 'Freight Quote',
    invoiceAmount: 1_140, advanceAmount: 0, feeAmount: 0, netAmount: 0,
    submittedDate: 'Apr 28, 2026', status: 'rejected', factoringCompany: 'RTS Financial',
    advancePct: 0, route: 'Denver → Salt Lake City', brokerCredit: 'C', agingDays: 14,
  },
  {
    id: 'FI-0039', loadRef: 'TRP-20041', broker: 'Worldwide Express',
    invoiceAmount: 890, advanceAmount: 863, feeAmount: 22, netAmount: 863,
    submittedDate: 'Apr 25, 2026', fundedDate: 'Apr 25, 2026',
    status: 'funded', factoringCompany: 'RTS Financial', advancePct: 97, daysToFund: 0,
    route: 'Dallas → San Antonio', brokerCredit: 'A',
  },
  {
    id: 'FI-0038', loadRef: 'TRP-20040', broker: 'C.H. Robinson',
    invoiceAmount: 3_210, advanceAmount: 3_114, feeAmount: 80, netAmount: 3_114,
    submittedDate: 'Apr 22, 2026', fundedDate: 'Apr 22, 2026',
    status: 'funded', factoringCompany: 'RTS Financial', advancePct: 97, daysToFund: 0,
    route: 'Chicago → New York', brokerCredit: 'A+',
  },
  {
    id: 'FI-0037', loadRef: 'TRP-20039', broker: 'MoLo Solutions',
    invoiceAmount: 1_875, advanceAmount: 0, feeAmount: 50, netAmount: -50,
    submittedDate: 'Apr 18, 2026', status: 'chargeback', factoringCompany: 'RTS Financial',
    advancePct: 0, route: 'Los Angeles → Las Vegas', brokerCredit: 'B', agingDays: 24,
  },
]

const FUEL_ADVANCES: FuelAdvance[] = [
  { id: 'FA-012', driver: 'Mike Rodriguez', amount: 500, loadRef: 'TRP-20048', date: 'May 12', status: 'active',   dueDate: 'May 16' },
  { id: 'FA-011', driver: 'Anna Perez',     amount: 300, loadRef: 'TRP-20046', date: 'May 10', status: 'deducted', dueDate: 'May 14' },
  { id: 'FA-010', driver: 'James Carter',   amount: 600, loadRef: 'TRP-20044', date: 'May 6',  status: 'deducted', dueDate: 'May 10' },
  { id: 'FA-009', driver: 'Mike Rodriguez', amount: 400, loadRef: 'TRP-20040', date: 'Apr 22', status: 'deducted', dueDate: 'Apr 26' },
  { id: 'FA-008', driver: 'Anna Perez',     amount: 350, loadRef: 'TRP-20039', date: 'Apr 18', status: 'overdue',  dueDate: 'Apr 22' },
]

const BROKER_CREDITS: BrokerCredit[] = [
  { name: 'C.H. Robinson',       credit: 'A+', payDays: 28, lastCheck: 'May 12', totalInvoiced: 14_230, openBalance: 0,     riskFlag: false },
  { name: 'Echo Global Logistics', credit: 'A+', payDays: 22, lastCheck: 'May 12', totalInvoiced: 8_940,  openBalance: 2_180, riskFlag: false },
  { name: 'Coyote Logistics',    credit: 'A',  payDays: 30, lastCheck: 'May 11', totalInvoiced: 6_670,  openBalance: 0,     riskFlag: false },
  { name: 'TQL',                 credit: 'A',  payDays: 29, lastCheck: 'May 10', totalInvoiced: 4_210,  openBalance: 1_420, riskFlag: false },
  { name: 'Transplace',          credit: 'B',  payDays: 44, lastCheck: 'May 4',  totalInvoiced: 3_890,  openBalance: 1_514, riskFlag: true  },
  { name: 'Freight Quote',       credit: 'C',  payDays: 60, lastCheck: 'Apr 28', totalInvoiced: 1_140,  openBalance: 1_140, riskFlag: true  },
]

const MONTHLY_FEES = [
  { month: 'Dec', funded: 14200, fees: 355 },
  { month: 'Jan', funded: 16800, fees: 420 },
  { month: 'Feb', funded: 15400, fees: 385 },
  { month: 'Mar', funded: 18600, fees: 465 },
  { month: 'Apr', funded: 22100, fees: 553 },
  { month: 'May', funded: 9340,  fees: 234 },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONF: Record<FactorStatus, { label: string; color: string; bg: string; border: string }> = {
  funded:     { label: '✅ Funded',     color: '#276749', bg: '#F0FFF4', border: '#C6F6D5' },
  pending:    { label: '⏳ Pending',    color: '#B7791F', bg: '#FEFCBF', border: '#FAF089' },
  submitted:  { label: '📤 Submitted',  color: '#2C7A9A', bg: '#EBF8FF', border: '#BEE3F8' },
  rejected:   { label: '❌ Rejected',   color: '#9B2C2C', bg: '#FFF5F5', border: '#FED7D7' },
  chargeback: { label: '⚠️ Chargeback', color: '#744210', bg: '#FFFAF0', border: '#FEEBC8' },
}

const CREDIT_COLOR: Record<string, string> = {
  'A+': '#38C770', 'A': '#4BAED4', 'B+': '#8B5CF6', 'B': '#F59E0B', 'C': '#EF4444',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Fee Trend Chart ───────────────────────────────────────────────────────────
function FeeTrendChart() {
  const w = 400
  const h = 90
  const pad = { l: 40, r: 16, t: 12, b: 24 }
  const iw = w - pad.l - pad.r
  const ih = h - pad.t - pad.b
  const maxFunded = Math.max(...MONTHLY_FEES.map(d => d.funded))
  const toX = (i: number) => pad.l + (i / (MONTHLY_FEES.length - 1)) * iw
  const toY = (v: number) => pad.t + ih - (v / maxFunded) * ih
  const pts = MONTHLY_FEES.map((d, i) => `${toX(i)},${toY(d.funded)}`).join(' ')
  const polyPts = `${toX(0)},${pad.t + ih} ${pts} ${toX(MONTHLY_FEES.length - 1)},${pad.t + ih}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4BAED4" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4BAED4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={polyPts} fill="url(#feeGrad)" />
      <polyline points={pts} fill="none" stroke="#4BAED4" strokeWidth={2.5} strokeLinejoin="round" />
      {MONTHLY_FEES.map((d, i) => (
        <g key={d.month}>
          <circle cx={toX(i)} cy={toY(d.funded)} r={3.5} fill="#4BAED4" />
          <text x={toX(i)} y={h - 4} textAnchor="middle" fontSize={9} fill="#A0AEC0">{d.month}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Invoice Detail Panel ──────────────────────────────────────────────────────
function InvoiceDetailPanel({ inv, onClose }: { inv: FactoredInvoice; onClose: () => void }) {
  const sc = STATUS_CONF[inv.status]
  const credit = inv.brokerCredit
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="card" style={{ width: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: '#1A2535' }}>Invoice {inv.id}</h3>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>{inv.loadRef} · {inv.route}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #1A2535, #2D7A9A)',
          borderRadius: 14, padding: '18px 20px', color: '#fff',
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>INVOICE</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{fmt(inv.invoiceAmount)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>ADVANCE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#38C770' }}>{fmt(inv.advanceAmount)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>FEE</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FC8181' }}>-{fmt(inv.feeAmount)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Broker', value: inv.broker },
            { label: 'Status', value: <span style={{ fontWeight: 700, color: sc.color }}>{sc.label}</span> },
            { label: 'Submitted', value: inv.submittedDate },
            { label: 'Funded', value: inv.fundedDate ?? 'Pending' },
            { label: 'Factoring Co.', value: inv.factoringCompany },
            { label: 'Advance Rate', value: `${inv.advancePct}%` },
          ].map(row => (
            <div key={row.label} style={{ padding: '10px 12px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{row.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{row.value}</div>
            </div>
          ))}
        </div>

        {credit && (
          <div style={{ padding: '10px 14px', background: CREDIT_COLOR[credit] + '10', borderRadius: 10, border: `1px solid ${CREDIT_COLOR[credit]}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: CREDIT_COLOR[credit] }}>Credit: {credit}</span>
            <span style={{ fontSize: 12, color: '#718096' }}>Broker credit rating from factoring company</span>
          </div>
        )}

        {inv.agingDays && inv.agingDays > 7 && (
          <div style={{ padding: '10px 14px', background: '#FFF5F5', borderRadius: 10, border: '1px solid #FED7D7', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>⚠️</span>
            <span style={{ fontSize: 12, color: '#C53030' }}>Invoice aging: {inv.agingDays} days. Contact broker if payment is delayed.</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary">📤 Download PDF</button>
        </div>
      </div>
    </div>
  )
}

// ── Submit Modal ──────────────────────────────────────────────────────────────
function SubmitModal({ onClose, companyName }: { onClose: () => void; companyName: string }) {
  const [invoiceNum, setInvoiceNum]   = useState('')
  const [amount, setAmount]           = useState('')
  const [broker, setBroker]           = useState('')
  const [loadRef, setLoadRef]         = useState('')
  const [submitted, setSubmitted]     = useState(false)

  if (submitted) {
    const advance = Math.round(parseFloat(amount || '0') * 0.97)
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: 440, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2535', marginBottom: 6 }}>Invoice Submitted!</div>
          <div style={{ fontSize: 13, color: '#718096', marginBottom: 18 }}>
            {companyName} will review and fund within same business day
          </div>
          <div style={{ background: '#F0FFF4', borderRadius: 12, padding: '14px 20px', marginBottom: 18 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#38C770' }}>{fmt(advance)}</div>
            <div style={{ fontSize: 12, color: '#276749' }}>Expected advance (97% of {fmt(parseFloat(amount || '0'))})</div>
          </div>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: 480, maxWidth: '95vw', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17 }}>📤 Submit Invoice</h3>
            <div style={{ fontSize: 12, color: '#718096' }}>via {companyName}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {[
          { label: 'Invoice Number', val: invoiceNum, set: setInvoiceNum, ph: 'INV-1043' },
          { label: 'Load Reference', val: loadRef,    set: setLoadRef,    ph: 'TRP-20049' },
          { label: 'Broker / Debtor', val: broker,    set: setBroker,     ph: 'Echo Global Logistics' },
          { label: 'Invoice Amount ($)', val: amount,  set: setAmount,    ph: '2,500' },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>{f.label}</label>
            <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              className="input" style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        ))}
        {amount && parseFloat(amount) > 0 && (
          <div style={{ background: '#EBF8FF', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: '#718096' }}>Expected Advance (97%)</span>
              <span style={{ fontWeight: 800, color: '#2C7A9A' }}>{fmt(Math.round(parseFloat(amount) * 0.97))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#A0AEC0' }}>Factoring Fee (2.5%)</span>
              <span style={{ color: '#E53E3E' }}>-{fmt(Math.round(parseFloat(amount) * 0.025))}</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => { if (invoiceNum && amount && broker) setSubmitted(true) }}
            className="btn btn-primary">Submit for Funding →</button>
        </div>
      </div>
    </div>
  )
}

// ── Invoice table ─────────────────────────────────────────────────────────────
function InvoiceTable({ invoices, onSelect }: { invoices: FactoredInvoice[]; onSelect: (inv: FactoredInvoice) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Route / Broker</th>
            <th>Invoice Amt</th>
            <th>Advance</th>
            <th>Fee</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => {
            const sc = STATUS_CONF[inv.status]
            return (
              <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(inv)}>
                <td>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#4BAED4' }}>{inv.id}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{inv.loadRef}</div>
                </td>
                <td>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{inv.route}</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{inv.broker}</div>
                </td>
                <td style={{ fontWeight: 700 }}>{fmt(inv.invoiceAmount)}</td>
                <td style={{ fontWeight: 800, color: '#38C770' }}>
                  {inv.advanceAmount > 0 ? fmt(inv.advanceAmount) : '—'}
                </td>
                <td style={{ color: '#E53E3E', fontSize: 12 }}>
                  {inv.feeAmount > 0 ? `-${fmt(inv.feeAmount)}` : '—'}
                </td>
                <td style={{ fontSize: 12, color: '#718096' }}>
                  {inv.submittedDate}
                  {inv.daysToFund === 0 && <div style={{ fontSize: 10, color: '#38C770', fontWeight: 700 }}>Same day ⚡</div>}
                  {inv.agingDays && inv.agingDays > 7 && (
                    <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>⚠️ {inv.agingDays}d aging</div>
                  )}
                </td>
                <td>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                  }}>{sc.label}</span>
                </td>
                <td>
                  {inv.brokerCredit && (
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                      background: CREDIT_COLOR[inv.brokerCredit] + '20',
                      color: CREDIT_COLOR[inv.brokerCredit],
                    }}>{inv.brokerCredit}</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Quick Calculator ──────────────────────────────────────────────────────────
function QuickCalc({ company }: { company: FactoringCompany }) {
  const [amount, setAmount] = useState('2500')
  const n = parseFloat(amount) || 0
  const advance = Math.round(n * company.advanceRate / 100)
  const fee     = Math.round(n * company.fee / 100)
  const net     = advance - fee
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 6 }}>Invoice Amount ($)</label>
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
        className="input" style={{ width: '100%', boxSizing: 'border-box', fontSize: 15, fontWeight: 700, marginBottom: 14 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Invoice Amount',              value: fmt(n),         color: '#2D3748', bold: true  },
          { label: `Advance (${company.advanceRate}%)`, value: fmt(advance),  color: '#38C770', bold: true  },
          { label: `Fee (${company.fee}%)`,       value: `-${fmt(fee)}`, color: '#E53E3E', bold: false },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0F4F8' }}>
            <span style={{ fontSize: 12, color: '#718096' }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: r.bold ? 800 : 600, color: r.color }}>{r.value}</span>
          </div>
        ))}
        <div style={{ background: '#F0FFF4', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
          <div style={{ fontSize: 11, color: '#276749', marginBottom: 2 }}>You receive today</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#38C770' }}>{fmt(net)}</div>
          <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{company.fundingSpeed} · ACH transfer</div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FactoringPage() {
  const [activeTab, setActiveTab]     = useState<'dashboard' | 'invoices' | 'advances' | 'brokers' | 'companies'>('dashboard')
  const [filterStatus, setFilterStatus] = useState<FactorStatus | 'all'>('all')
  const [showSubmit, setShowSubmit]   = useState(false)
  const [selectedInv, setSelectedInv] = useState<FactoredInvoice | null>(null)

  const connected = COMPANIES.find(c => c.status === 'connected')!
  const fundedInvs = INVOICES.filter(i => i.status === 'funded')
  const fundedThisMonth = fundedInvs.reduce((s, i) => s + i.advanceAmount, 0)
  const feesThisMonth   = fundedInvs.reduce((s, i) => s + i.feeAmount, 0)
  const pendingCount    = INVOICES.filter(i => i.status === 'pending' || i.status === 'submitted').length
  const pendingAmount   = INVOICES.filter(i => i.status === 'pending' || i.status === 'submitted').reduce((s, i) => s + i.invoiceAmount, 0)
  const totalInvoiced   = INVOICES.reduce((s, i) => s + i.invoiceAmount, 0)
  const agingCount      = INVOICES.filter(i => i.agingDays && i.agingDays > 7).length
  const activeAdvances  = FUEL_ADVANCES.filter(a => a.status === 'active')
  const activeAdvTotal  = activeAdvances.reduce((s, a) => s + a.amount, 0)

  const filtered = INVOICES.filter(i => filterStatus === 'all' || i.status === filterStatus)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Tabs */}
      <div className="tabs">
        {([
          ['dashboard', '📊 Overview'],
          ['invoices',  '📄 Invoices'],
          ['advances',  '⛽ Fuel Advances'],
          ['brokers',   '🔍 Broker Credit'],
          ['companies', '🏦 Companies'],
        ] as const).map(([id, label]) => (
          <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {activeTab === 'dashboard' && (
        <>
          {/* Aging alert */}
          {agingCount > 0 && (
            <div style={{
              background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 12,
              padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: '#C53030', fontSize: 13 }}>
                  {agingCount} invoice(s) aging over 7 days
                </div>
                <div style={{ fontSize: 12, color: '#E53E3E' }}>
                  Review aging invoices and contact brokers to avoid delays.
                </div>
              </div>
              <button className="btn btn-sm" style={{ background: '#E53E3E', color: '#fff', border: 'none', marginLeft: 'auto' }}
                onClick={() => setActiveTab('invoices')}>
                Review →
              </button>
            </div>
          )}

          {/* KPIs */}
          <div className="stats-grid">
            {[
              { label: 'Funded This Month',   value: fmt(fundedThisMonth), change: `${fundedInvs.length} invoices`,       up: true,  color: '#38C770', icon: '💰' },
              { label: 'Pending Funding',      value: fmt(pendingAmount),   change: `${pendingCount} in queue`,              up: false, color: '#ECC94B', icon: '⏳' },
              { label: 'Factoring Fees',       value: fmt(feesThisMonth),   change: `${((feesThisMonth/totalInvoiced)*100).toFixed(1)}% avg`, up: false, color: '#E53E3E', icon: '💸' },
              { label: 'Active Fuel Advances', value: fmt(activeAdvTotal),  change: `${activeAdvances.length} outstanding`, up: false, color: '#F59E0B', icon: '⛽' },
            ].map(k => (
              <div key={k.label} className="stat-card" style={{ borderTopColor: k.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{k.icon}</span>
                  <span className={`stat-change ${k.up ? 'up' : 'down'}`}>{k.change}</span>
                </div>
                <div className="stat-value">{k.value}</div>
                <div className="stat-label">{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Connected company */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 28 }}>{connected.logo}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{connected.name}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#F0FFF4', color: '#276749', border: '1px solid #C6F6D5' }}>
                      ● Connected
                    </span>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowSubmit(true)}>
                  📤 Submit Invoice
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Advance',  value: `${connected.advanceRate}%`, color: '#38C770' },
                  { label: 'Fee',      value: `${connected.fee}%`,         color: '#E53E3E' },
                  { label: 'Speed',    value: connected.fundingSpeed,      color: '#4BAED4' },
                  { label: 'Type',     value: connected.recourse ? 'Recourse' : 'Non-Rec.', color: '#8B5CF6' },
                ].map(t => (
                  <div key={t.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: t.color }}>{t.value}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{t.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {connected.features.map(f => (
                  <span key={f} style={{ fontSize: 11, padding: '3px 9px', background: '#EBF8FF', borderRadius: 8, color: '#2C7A9A', fontWeight: 600 }}>
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Monthly trend */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 4 }}>📈 Monthly Funded Volume</div>
              <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 12 }}>Last 6 months</div>
              <FeeTrendChart />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Peak Month</div>
                  <div style={{ fontWeight: 800, color: '#38C770' }}>Apr · {fmt(22100)}</div>
                </div>
                <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Total Fees Paid</div>
                  <div style={{ fontWeight: 800, color: '#E53E3E' }}>
                    {fmt(MONTHLY_FEES.reduce((s, d) => s + d.fees, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick calc + recent */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 14 }}>🧮 Quick Pay Calculator</h3>
              <QuickCalc company={connected} />
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 className="section-title" style={{ margin: 0 }}>Recent Invoices</h3>
                <button onClick={() => setActiveTab('invoices')}
                  style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  All →
                </button>
              </div>
              <InvoiceTable invoices={INVOICES.slice(0, 5)} onSelect={setSelectedInv} />
            </div>
          </div>
        </>
      )}

      {/* ════════ INVOICES ════════ */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'funded', 'pending', 'submitted', 'rejected', 'chargeback'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: filterStatus === s ? '#4BAED4' : '#E2E8F0',
                  background: filterStatus === s ? '#EBF8FF' : '#fff',
                  color: filterStatus === s ? '#2C7A9A' : '#718096',
                }}>
                  {s === 'all'
                    ? `All (${INVOICES.length})`
                    : `${STATUS_CONF[s]?.label ?? s} (${INVOICES.filter(i => i.status === s).length})`}
                </button>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSubmit(true)}>
              📤 Submit Invoice
            </button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <InvoiceTable invoices={filtered} onSelect={setSelectedInv} />
          </div>
        </div>
      )}

      {/* ════════ FUEL ADVANCES ════════ */}
      {activeTab === 'advances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A2535' }}>⛽ Fuel Advances</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
                Advances issued to drivers, deducted from factored invoices
              </p>
            </div>
            <button className="btn btn-primary btn-sm">+ Issue Advance</button>
          </div>

          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'Active Advances', value: fmt(FUEL_ADVANCES.filter(a => a.status === 'active').reduce((s, a) => s + a.amount, 0)), color: '#F59E0B', count: FUEL_ADVANCES.filter(a => a.status === 'active').length },
              { label: 'Deducted (MTD)',  value: fmt(FUEL_ADVANCES.filter(a => a.status === 'deducted').reduce((s, a) => s + a.amount, 0)), color: '#38C770', count: FUEL_ADVANCES.filter(a => a.status === 'deducted').length },
              { label: 'Overdue',         value: fmt(FUEL_ADVANCES.filter(a => a.status === 'overdue').reduce((s, a) => s + a.amount, 0)),  color: '#EF4444', count: FUEL_ADVANCES.filter(a => a.status === 'overdue').length },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>{s.count} advances</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Advance ID</th>
                    <th>Driver</th>
                    <th>Amount</th>
                    <th>Load Ref</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {FUEL_ADVANCES.map(adv => {
                    const statusMap = {
                      active:   { label: '🟡 Active',   color: '#B7791F', bg: '#FEFCBF', border: '#FAF089' },
                      deducted: { label: '✅ Deducted',  color: '#276749', bg: '#F0FFF4', border: '#C6F6D5' },
                      overdue:  { label: '🔴 Overdue',  color: '#9B2C2C', bg: '#FFF5F5', border: '#FED7D7' },
                    }
                    const s = statusMap[adv.status]
                    return (
                      <tr key={adv.id}>
                        <td style={{ fontWeight: 700, color: '#4BAED4', fontSize: 12 }}>{adv.id}</td>
                        <td style={{ fontWeight: 600 }}>{adv.driver}</td>
                        <td style={{ fontWeight: 800, color: '#38C770' }}>{fmt(adv.amount)}</td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{adv.loadRef}</td>
                        <td style={{ fontSize: 12, color: '#718096' }}>{adv.date}</td>
                        <td style={{ fontSize: 12, color: adv.status === 'overdue' ? '#EF4444' : '#718096', fontWeight: adv.status === 'overdue' ? 700 : 400 }}>
                          {adv.dueDate}
                        </td>
                        <td>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════ BROKER CREDIT ════════ */}
      {activeTab === 'brokers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A2535' }}>🔍 Broker Credit Checks</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
              Credit ratings run through RTS Financial. Refreshed with each new invoice.
            </p>
          </div>

          {BROKER_CREDITS.filter(b => b.riskFlag).length > 0 && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <span style={{ fontSize: 13, color: '#C53030', fontWeight: 600 }}>
                {BROKER_CREDITS.filter(b => b.riskFlag).length} broker(s) flagged for slow payment or credit risk
              </span>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Broker</th>
                    <th>Credit</th>
                    <th>Avg Pay Days</th>
                    <th>Total Invoiced</th>
                    <th>Open Balance</th>
                    <th>Last Checked</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {BROKER_CREDITS.map(b => (
                    <tr key={b.name}>
                      <td style={{ fontWeight: 700 }}>{b.name}</td>
                      <td>
                        <span style={{
                          fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 99,
                          background: CREDIT_COLOR[b.credit] + '20', color: CREDIT_COLOR[b.credit],
                        }}>{b.credit}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: b.payDays > 45 ? '#EF4444' : '#2D3748' }}>
                        {b.payDays} days
                      </td>
                      <td style={{ fontWeight: 700 }}>{fmt(b.totalInvoiced)}</td>
                      <td style={{ fontWeight: 700, color: b.openBalance > 0 ? '#F59E0B' : '#38C770' }}>
                        {b.openBalance > 0 ? fmt(b.openBalance) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#718096' }}>{b.lastCheck}</td>
                      <td>
                        {b.riskFlag
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: '#FFF5F5', padding: '2px 8px', borderRadius: 8, border: '1px solid #FED7D7' }}>⚠️ Risk</span>
                          : <span style={{ fontSize: 11, fontWeight: 700, color: '#38C770', background: '#F0FFF4', padding: '2px 8px', borderRadius: 8, border: '1px solid #C6F6D5' }}>✓ Clear</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════ COMPANIES ════════ */}
      {activeTab === 'companies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, color: '#718096' }}>
            Compare factoring companies. You can connect with multiple.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {COMPANIES.map(c => (
              <div key={c.id} className="card" style={{ borderTop: `3px solid ${c.status === 'connected' ? '#38C770' : '#E2E8F0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 26 }}>{c.logo}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>★ {c.rating} · {c.recourse ? 'Recourse' : 'Non-Recourse'}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                    background: c.status === 'connected' ? '#F0FFF4' : '#F7FAFC',
                    color: c.status === 'connected' ? '#276749' : '#718096',
                    border: `1px solid ${c.status === 'connected' ? '#C6F6D5' : '#E2E8F0'}`,
                  }}>
                    {c.status === 'connected' ? '● Connected' : c.status === 'pending_setup' ? '⏳ Pending' : 'Available'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Advance', value: `${c.advanceRate}%`, color: '#38C770' },
                    { label: 'Fee',     value: `${c.fee}%`,         color: '#E53E3E' },
                    { label: 'Speed',   value: c.fundingSpeed,      color: '#4BAED4' },
                  ].map(t => (
                    <div key={t.label} style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: t.color }}>{t.value}</div>
                      <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 1 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
                  {c.features.map(f => (
                    <div key={f} style={{ fontSize: 11, color: '#4A5568' }}>
                      <span style={{ color: '#38C770', marginRight: 5 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                {c.status === 'connected' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowSubmit(true)} className="btn btn-primary" style={{ flex: 1, fontSize: 12 }}>
                      📤 Submit Invoice
                    </button>
                    <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12 }}>⚙️ Settings</button>
                  </div>
                ) : (
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: 12 }}>
                    + Connect {c.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showSubmit && connected && (
        <SubmitModal onClose={() => setShowSubmit(false)} companyName={connected.name} />
      )}
      {selectedInv && (
        <InvoiceDetailPanel inv={selectedInv} onClose={() => setSelectedInv(null)} />
      )}
    </div>
  )
}
