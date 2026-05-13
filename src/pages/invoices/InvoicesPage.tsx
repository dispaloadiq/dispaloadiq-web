import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────
type InvStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'partial'

interface InvoiceLine {
  desc: string
  qty: number
  rate: number
  total: number
}

interface Invoice {
  id: string
  loadId: string
  billTo: string
  billToEmail: string
  issueDate: string
  dueDate: string
  amount: number
  paid: number
  status: InvStatus
  daysOverdue?: number
  lines: InvoiceLine[]
  notes?: string
  paymentMethod?: string
  paidDate?: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const INVOICES: Invoice[] = [
  {
    id: 'INV-2847', loadId: 'LD-2847', billTo: 'Midwest Freight Co.', billToEmail: 'ap@midwestfreight.com',
    issueDate: 'Apr 20, 2025', dueDate: 'May 5, 2025', amount: 1854, paid: 0, status: 'sent',
    lines: [
      { desc: 'Freight Service — Chicago, IL → Dallas, TX', qty: 1, rate: 1854, total: 1854 },
    ],
    notes: 'Rate Confirmation #RC-8472. BOL signed and attached.',
  },
  {
    id: 'INV-2831', loadId: 'LD-2831', billTo: 'Star Logistics LLC', billToEmail: 'billing@starlogistics.com',
    issueDate: 'Apr 14, 2025', dueDate: 'Apr 30, 2025', amount: 2210, paid: 2210, status: 'paid',
    paidDate: 'Apr 28, 2025', paymentMethod: 'ACH Transfer',
    lines: [
      { desc: 'Freight Service — Atlanta, GA → Miami, FL', qty: 1, rate: 2210, total: 2210 },
    ],
  },
  {
    id: 'INV-2819', loadId: 'LD-2819', billTo: 'Pacific Supply Co.', billToEmail: 'finance@pacificsupply.com',
    issueDate: 'Mar 28, 2025', dueDate: 'Apr 14, 2025', amount: 3120, paid: 1500, status: 'partial', daysOverdue: 21,
    lines: [
      { desc: 'Freight Service — Houston, TX → Phoenix, AZ', qty: 1, rate: 2786, total: 2786 },
      { desc: 'Detention (4 hrs @ $75/hr)',                  qty: 4, rate: 75,   total: 300  },
      { desc: 'Fuel Surcharge',                               qty: 1, rate: 34,   total: 34   },
    ],
    notes: 'Partial payment $1,500 received Apr 10. Balance of $1,620 outstanding.',
  },
  {
    id: 'INV-2804', loadId: 'LD-2804', billTo: 'Omega Distribution', billToEmail: 'accounts@omegadist.com',
    issueDate: 'Mar 10, 2025', dueDate: 'Mar 26, 2025', amount: 1640, paid: 0, status: 'overdue', daysOverdue: 46,
    lines: [
      { desc: 'Freight Service — Nashville, TN → Charlotte, NC', qty: 1, rate: 1640, total: 1640 },
    ],
  },
  {
    id: 'INV-2798', loadId: 'LD-2798', billTo: 'Sunrise Foods Inc.', billToEmail: 'ap@sunrisefoods.com',
    issueDate: 'Mar 2, 2025', dueDate: 'Mar 18, 2025', amount: 2450, paid: 2450, status: 'paid',
    paidDate: 'Mar 17, 2025', paymentMethod: 'Check',
    lines: [
      { desc: 'Reefer Freight — Chicago, IL → Denver, CO', qty: 1, rate: 2350, total: 2350 },
      { desc: 'Temperature Monitoring Fee',                 qty: 1, rate: 100,  total: 100  },
    ],
  },
  {
    id: 'INV-2792', loadId: 'LD-2792', billTo: 'BlueSky Transport', billToEmail: 'billing@bluesky.com',
    issueDate: 'Feb 20, 2025', dueDate: 'Mar 8, 2025', amount: 1290, paid: 1290, status: 'paid',
    paidDate: 'Mar 5, 2025', paymentMethod: 'ACH Transfer',
    lines: [
      { desc: 'Freight Service — Denver, CO → Salt Lake City, UT', qty: 1, rate: 1290, total: 1290 },
    ],
  },
  {
    id: 'INV-2781', loadId: 'LD-2781', billTo: 'Echo Global Logistics', billToEmail: 'ap@echoglobal.com',
    issueDate: 'Feb 8, 2025', dueDate: 'Feb 24, 2025', amount: 1890, paid: 0, status: 'overdue', daysOverdue: 75,
    lines: [
      { desc: 'Freight Service — Phoenix, AZ → Las Vegas, NV', qty: 1, rate: 1750, total: 1750 },
      { desc: 'Driver Detention (2 hrs)',                        qty: 2, rate: 70,   total: 140  },
    ],
    notes: '2nd reminder sent Mar 1. No response received.',
  },
]

// Monthly totals — last 6 months
const MONTHLY = [
  { month: 'Dec', total: 8200,  paid: 8200,  outstanding: 0    },
  { month: 'Jan', total: 9400,  paid: 9400,  outstanding: 0    },
  { month: 'Feb', total: 10800, paid: 8940,  outstanding: 1860 },
  { month: 'Mar', total: 11200, paid: 7040,  outstanding: 4160 },
  { month: 'Apr', total: 9860,  paid: 4060,  outstanding: 5800 },
  { month: 'May', total: 1854,  paid: 0,     outstanding: 1854 },
]

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<InvStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:   { label: 'Draft',   color: '#718096', bg: '#F7FAFC', border: '#CBD5E0' },
  sent:    { label: 'Sent',    color: '#4BAED4', bg: '#EBF8FF', border: '#90CDF4' },
  paid:    { label: 'Paid',    color: '#38C770', bg: '#F0FFF4', border: '#9AE6B4' },
  overdue: { label: 'Overdue', color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5' },
  partial: { label: 'Partial', color: '#F59E0B', bg: '#FFFBEB', border: '#FCD34D' },
}

function StatusBadge({ status }: { status: InvStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  )
}

const fmt = (n: number) => `$${n.toLocaleString()}`

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
function RevenueChart({ data }: { data: typeof MONTHLY }) {
  const max = Math.max(...data.map(d => d.total)) || 1
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              {/* Total */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${(d.total / max) * 100}%`,
                background: isLast ? '#BEE3F8' : '#E2E8F0',
                borderRadius: '3px 3px 0 0', minHeight: d.total > 0 ? 4 : 0,
              }} />
              {/* Paid portion */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${(d.paid / max) * 100}%`,
                background: isLast ? '#4BAED4' : '#38C770',
                borderRadius: '3px 3px 0 0', minHeight: d.paid > 0 ? 3 : 0,
              }} />
            </div>
            <div style={{ fontSize: 9, color: '#A0AEC0' }}>{d.month}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Aging Report Panel ────────────────────────────────────────────────────────
function AgingReport({ invoices }: { invoices: Invoice[] }) {
  const buckets = [
    { label: 'Current (0-30d)', days: [0, 30],  color: '#38C770', bg: '#F0FFF4', items: [] as Invoice[] },
    { label: '31–60 Days',      days: [31, 60],  color: '#F59E0B', bg: '#FFFBEB', items: [] as Invoice[] },
    { label: '61–90 Days',      days: [61, 90],  color: '#EF4444', bg: '#FFF5F5', items: [] as Invoice[] },
    { label: '90+ Days',        days: [91, 9999], color: '#7B2D8B', bg: '#FDF4FF', items: [] as Invoice[] },
  ]

  const outstanding = invoices.filter(i => i.status !== 'paid' && i.status !== 'draft')
  outstanding.forEach(inv => {
    const days = inv.daysOverdue ?? (inv.status === 'sent' ? 5 : 0)
    const bucket = buckets.find(b => days >= b.days[0] && days <= b.days[1])
    if (bucket) bucket.items.push(inv)
  })

  const totalOuts = outstanding.reduce((s, i) => s + (i.amount - i.paid), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {buckets.map(b => {
          const total = b.items.reduce((s, i) => s + (i.amount - i.paid), 0)
          const pct = totalOuts > 0 ? Math.round((total / totalOuts) * 100) : 0
          return (
            <div key={b.label} style={{ padding: '14px', borderRadius: 12, background: b.bg, border: `1.5px solid ${b.color}30` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: b.color, marginBottom: 4 }}>{b.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: b.color }}>{fmt(total)}</div>
              <div style={{ fontSize: 11, color: b.color + '99', marginTop: 2 }}>{b.items.length} invoice{b.items.length !== 1 ? 's' : ''} · {pct}% of AR</div>
            </div>
          )
        })}
      </div>

      {/* Aging bar */}
      {totalOuts > 0 && (
        <div>
          <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', gap: 1 }}>
            {buckets.map(b => {
              const total = b.items.reduce((s, i) => s + (i.amount - i.paid), 0)
              const pct = (total / totalOuts) * 100
              return pct > 0 ? (
                <div key={b.label} style={{ width: `${pct}%`, background: b.color, transition: 'width .3s' }} />
              ) : null
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            {buckets.filter(b => b.items.length > 0).map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#718096' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail by bucket */}
      {buckets.filter(b => b.items.length > 0).map(b => (
        <div key={b.label}>
          <div style={{ fontSize: 12, fontWeight: 800, color: b.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />
            {b.label} — {fmt(b.items.reduce((s, i) => s + (i.amount - i.paid), 0))}
          </div>
          {b.items.map(inv => (
            <div key={inv.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: b.bg, borderRadius: 10,
              border: `1px solid ${b.color}20`, marginBottom: 6,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{inv.billTo}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>{inv.id} · Due: {inv.dueDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: b.color, fontSize: 14 }}>{fmt(inv.amount - inv.paid)}</div>
                {inv.daysOverdue && <div style={{ fontSize: 10, color: b.color }}>{inv.daysOverdue}d overdue</div>}
              </div>
              <button className="btn btn-secondary btn-sm">📧 Remind</button>
            </div>
          ))}
        </div>
      ))}

      {totalOuts === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#38C770', fontSize: 14, fontWeight: 700 }}>
          ✅ All invoices collected — no outstanding balances
        </div>
      )}
    </div>
  )
}

// ── Invoice Preview Panel ─────────────────────────────────────────────────────
function InvoicePreview({ inv, onClose, onMarkPaid }: { inv: Invoice; onClose: () => void; onMarkPaid: (id: string) => void }) {
  const [showPayModal, setShowPayModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const balance = inv.amount - inv.paid

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content', position: 'sticky', top: 20 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)', padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{inv.id}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>Load #{inv.loadId}</div>
              <div style={{ marginTop: 8 }}><StatusBadge status={inv.status} /></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>AMOUNT DUE</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: balance > 0 ? '#FC8181' : '#68D391' }}>
                {balance > 0 ? fmt(balance) : 'PAID'}
              </div>
              {inv.daysOverdue && inv.daysOverdue > 0 && (
                <div style={{ fontSize: 11, color: '#FC8181', marginTop: 2 }}>⚠️ {inv.daysOverdue} days overdue</div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px', maxHeight: 540, overflowY: 'auto' }}>
          {/* Bill To / Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '10px 12px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 700, marginBottom: 3 }}>BILL TO</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{inv.billTo}</div>
              <div style={{ fontSize: 11, color: '#718096' }}>{inv.billToEmail}</div>
            </div>
            <div style={{ padding: '10px 12px', background: '#F7FAFC', borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 700, marginBottom: 3 }}>DATES</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Issued: {inv.issueDate}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: inv.status === 'overdue' ? '#EF4444' : '#2D3748' }}>
                Due: {inv.dueDate}
              </div>
              {inv.paidDate && (
                <div style={{ fontSize: 12, color: '#38C770', fontWeight: 600 }}>Paid: {inv.paidDate}</div>
              )}
            </div>
          </div>

          {/* Line items */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                {['Description', 'Qty', 'Rate', 'Total'].map((h, i) => (
                  <th key={h} style={{ padding: '6px 6px', fontSize: 10, color: '#A0AEC0', fontWeight: 700, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((line, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0F4F8' }}>
                  <td style={{ padding: '8px 6px', fontSize: 12, color: '#2D3748' }}>{line.desc}</td>
                  <td style={{ padding: '8px 6px', fontSize: 12, textAlign: 'right', color: '#718096' }}>{line.qty}</td>
                  <td style={{ padding: '8px 6px', fontSize: 12, textAlign: 'right', color: '#718096' }}>{fmt(line.rate)}</td>
                  <td style={{ padding: '8px 6px', fontSize: 13, textAlign: 'right', fontWeight: 700 }}>{fmt(line.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ borderTop: '2px solid #E2E8F0', padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: '#718096' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{fmt(inv.amount)}</span>
            </div>
            {inv.paid > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#38C770' }}>Payments Received</span>
                <span style={{ fontWeight: 700, color: '#38C770' }}>- {fmt(inv.paid)}</span>
              </div>
            )}
            {inv.paymentMethod && (
              <div style={{ fontSize: 11, color: '#A0AEC0', textAlign: 'right' }}>via {inv.paymentMethod}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
              <span style={{ fontWeight: 800 }}>Balance Due</span>
              <span style={{ fontWeight: 900, color: balance > 0 ? (inv.status === 'overdue' ? '#EF4444' : '#4BAED4') : '#38C770' }}>
                {balance > 0 ? fmt(balance) : '✅ PAID IN FULL'}
              </span>
            </div>
          </div>

          {inv.notes && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#FFFBEB', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
              📝 {inv.notes}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inv.status !== 'paid' && (
              <button
                onClick={() => setShowPayModal(true)}
                style={{ padding: '10px', borderRadius: 10, background: '#38C770', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                💳 Record Payment
              </button>
            )}
            <button
              onClick={() => setShowSendModal(true)}
              style={{ padding: '10px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              📧 {inv.status === 'overdue' ? 'Send Reminder' : 'Send Invoice'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>📥 Download PDF</button>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>🖨️ Print</button>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 440, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>💳 Record Payment</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Amount Received', placeholder: fmt(balance), type: 'text' },
                { label: 'Payment Date',    placeholder: 'May 12, 2025', type: 'text' },
                { label: 'Reference / Check #', placeholder: 'ACH-8472 or Check #1042', type: 'text' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input className="input" placeholder={f.placeholder} type={f.type} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Payment Method</label>
                <select className="input">
                  {['ACH Transfer', 'Check', 'Wire Transfer', 'Credit Card', 'Factoring', 'Cash'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPayModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { onMarkPaid(inv.id); setShowPayModal(false); onClose() }}>
                ✓ Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {showSendModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 520, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📧 {inv.status === 'overdue' ? 'Send Reminder' : 'Send Invoice'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSendModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>To</label>
                <input className="input" defaultValue={inv.billToEmail} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Subject</label>
                <input className="input" defaultValue={inv.status === 'overdue'
                  ? `Payment Reminder: ${inv.id} — ${fmt(balance)} overdue`
                  : `Invoice ${inv.id} from DispaLoadIQ — ${fmt(inv.amount)}`}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Message Preview</label>
                <div style={{ padding: '12px 14px', background: '#F7FAFC', borderRadius: 10, fontSize: 12, color: '#718096', lineHeight: 1.7, border: '1.5px solid #E2E8F0' }}>
                  Dear {inv.billTo} team,<br /><br />
                  {inv.status === 'overdue'
                    ? `This is a payment reminder for ${inv.id} amounting to ${fmt(balance)}, which was due on ${inv.dueDate}. We kindly request immediate payment.`
                    : `Please find attached invoice ${inv.id} for freight services rendered. Total amount: ${fmt(inv.amount)}. Payment is due by ${inv.dueDate}.`
                  }<br /><br />
                  <strong>Payment methods:</strong> ACH, Check, or Wire Transfer.<br /><br />
                  Thank you for your business!
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#EBF8FF', borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>📎</span>
                <span style={{ fontSize: 12, color: '#4BAED4', fontWeight: 600 }}>{inv.id}.pdf will be attached automatically</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSendModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowSendModal(false)}>
                📧 Send {inv.status === 'overdue' ? 'Reminder' : 'Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Create Invoice Modal ──────────────────────────────────────────────────────
function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const LOADS = [
    'LD-2862 — Chicago, IL → Dallas, TX ($1,854)',
    'LD-2863 — Atlanta, GA → Miami, FL ($2,210)',
    'LD-2864 — Denver, CO → Salt Lake City ($1,290)',
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📄 Create Invoice</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
          {['Load Info', 'Line Items', 'Review'].map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13,
                  background: step > i + 1 ? '#38C770' : step === i + 1 ? '#4BAED4' : '#E2E8F0',
                  color: step >= i + 1 ? '#fff' : '#A0AEC0',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, color: step === i + 1 ? '#4BAED4' : '#A0AEC0', fontWeight: step === i + 1 ? 700 : 400 }}>{s}</div>
              </div>
              {i < 2 && <div style={{ width: 40, height: 2, background: step > i + 1 ? '#38C770' : '#E2E8F0', flexShrink: 0, marginBottom: 20 }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>Select Completed Load</label>
              <select className="input">
                {LOADS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Bill To *', placeholder: 'Midwest Freight Co.' },
                { label: 'Email',     placeholder: 'ap@company.com' },
                { label: 'Issue Date',placeholder: 'May 12, 2025' },
                { label: 'Due Date',  placeholder: 'May 28, 2025 (Net-16)' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input className="input" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7FAFC' }}>
                  {['Description', 'Qty', 'Rate ($)', 'Total'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#718096' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Freight Service', 'Fuel Surcharge', 'Detention (2 hrs)'].map((desc, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 4px' }}>
                      <input defaultValue={desc} className="input" style={{ fontSize: 12 }} />
                    </td>
                    <td style={{ padding: '6px 4px', width: 60 }}>
                      <input defaultValue="1" className="input" style={{ fontSize: 12, textAlign: 'center' }} />
                    </td>
                    <td style={{ padding: '6px 4px', width: 90 }}>
                      <input defaultValue={i === 0 ? '1854' : i === 1 ? '34' : '150'} className="input" style={{ fontSize: 12 }} />
                    </td>
                    <td style={{ padding: '6px 10px', fontWeight: 700, fontSize: 13 }}>
                      {i === 0 ? '$1,854' : i === 1 ? '$34' : '$300'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>+ Add Line Item</button>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', background: '#F7FAFC', borderRadius: 10 }}>
              <div>
                <span style={{ fontSize: 13, color: '#718096' }}>Total: </span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#4BAED4' }}>$2,188</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Invoice Ready!</div>
            <div style={{ fontSize: 14, color: '#718096', marginBottom: 24 }}>
              INV-2862 for $2,188 · Bill to Midwest Freight Co. · Due May 28
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={onClose} className="btn btn-primary">📧 Send Now</button>
              <button onClick={onClose} className="btn btn-secondary">Save as Draft</button>
            </div>
          </div>
        )}

        {step < 3 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setStep(s => s + 1)}>
              {step === 2 ? 'Review Invoice →' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
interface Props { role?: UserRole }

export default function InvoicesPage({ role = 'owner-op' }: Props) {
  const [tab, setTab] = useState<'all' | 'pending' | 'overdue' | 'aging'>('all')
  const [statusFilter, setStatus] = useState<'all' | InvStatus>('all')
  const [selected, setSelected]   = useState<Invoice | null>(null)
  const [showCreate, setCreate]   = useState(false)
  const [search, setSearch]       = useState('')
  const [invoices, setInvoices]   = useState<Invoice[]>(INVOICES)

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0)
  const totalPaid     = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending  = invoices.filter(i => ['sent', 'partial'].includes(i.status)).reduce((s, i) => s + (i.amount - i.paid), 0)
  const totalOverdue  = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const overdueCount  = invoices.filter(i => i.status === 'overdue').length
  const collectionRate = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0

  function markPaid(id: string) {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' as InvStatus, paid: i.amount, paidDate: 'May 12, 2025', paymentMethod: 'ACH Transfer' } : i))
  }

  const getFiltered = () => {
    let list = invoices
    if (tab === 'pending')  list = invoices.filter(i => ['sent', 'partial'].includes(i.status))
    if (tab === 'overdue')  list = invoices.filter(i => i.status === 'overdue')
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter)
    if (search) list = list.filter(i =>
      i.billTo.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }

  const filtered = getFiltered()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>📄 Invoices & A/R</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Track, send and collect your freight invoices
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {overdueCount > 0 && (
            <button className="btn btn-secondary" style={{ color: '#EF4444', borderColor: '#FECACA' }}>
              📧 Send {overdueCount} Reminder{overdueCount > 1 ? 's' : ''}
            </button>
          )}
          <button onClick={() => setCreate(true)} className="btn btn-primary">+ Create Invoice</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="stats-grid">
        {[
          { label: 'Total Invoiced',    value: `$${(totalInvoiced/1000).toFixed(1)}K`, change: `${invoices.length} invoices`,       up: true,  color: '#4BAED4', icon: '📊' },
          { label: 'Collected',         value: `$${(totalPaid/1000).toFixed(1)}K`,     change: `${collectionRate}% collection rate`, up: true,  color: '#38C770', icon: '✅' },
          { label: 'Pending',           value: `$${(totalPending/1000).toFixed(1)}K`,  change: 'Awaiting payment',                   up: false, color: '#F59E0B', icon: '⏳' },
          { label: 'Overdue',           value: `$${(totalOverdue/1000).toFixed(1)}K`,  change: `${overdueCount} invoices`,           up: false, color: '#EF4444', icon: '🔴' },
        ].map(st => (
          <div key={st.label} className="stat-card" style={{ borderTopColor: st.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>{st.icon}</span>
              <span className={`stat-change ${st.up ? 'up' : 'down'}`}>{st.change}</span>
            </div>
            <div className="stat-value">{st.value}</div>
            <div className="stat-label">{st.label}</div>
          </div>
        ))}
      </div>

      {/* Charts + Overdue alert row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Monthly Revenue Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>Monthly Invoicing</div>
              <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 1 }}>6-month trend</div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['#38C770','Collected'],['#BEE3F8','Invoiced']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#718096' }}>
                  <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />{label}
                </div>
              ))}
            </div>
          </div>
          <RevenueChart data={MONTHLY} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ fontSize: 12, color: '#A0AEC0' }}>6-mo invoiced: <strong style={{ color: '#1A2535' }}>${MONTHLY.reduce((s,m)=>s+m.total,0).toLocaleString()}</strong></div>
            <div style={{ fontSize: 12, color: '#A0AEC0' }}>Collected: <strong style={{ color: '#38C770' }}>${MONTHLY.reduce((s,m)=>s+m.paid,0).toLocaleString()}</strong></div>
          </div>
        </div>

        {/* A/R Summary */}
        <div className="card">
          <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 14 }}>A/R Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Collected',  value: totalPaid,    color: '#38C770', pct: totalInvoiced > 0 ? Math.round(totalPaid/totalInvoiced*100) : 0 },
              { label: 'Pending',    value: totalPending,  color: '#4BAED4', pct: totalInvoiced > 0 ? Math.round(totalPending/totalInvoiced*100) : 0 },
              { label: 'Overdue',    value: totalOverdue,  color: '#EF4444', pct: totalInvoiced > 0 ? Math.round(totalOverdue/totalInvoiced*100) : 0 },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#718096' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color }}>{fmt(row.value)}</span>
                </div>
                <div className="progress-wrap" style={{ height: 7 }}>
                  <div className="progress-bar" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', background: '#F0FFF4', borderRadius: 10, border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#276749', fontWeight: 700 }}>Collection Rate</span>
            <span style={{ fontWeight: 900, color: collectionRate >= 90 ? '#38C770' : '#F59E0B', fontSize: 16 }}>{collectionRate}%</span>
          </div>
        </div>
      </div>

      {/* Overdue alert */}
      {totalOverdue > 0 && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔴</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#EF4444', fontSize: 14 }}>{fmt(totalOverdue)} in overdue invoices</strong>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
              {overdueCount} client{overdueCount > 1 ? 's' : ''} with past-due balance
              {invoices.find(i => i.status === 'overdue' && (i.daysOverdue ?? 0) > 60) && ' — some 60+ days past due'}
            </div>
          </div>
          <button className="btn btn-danger" style={{ padding: '9px 18px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Send All Reminders
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 12, padding: 4, width: 'fit-content', gap: 2 }}>
        {([
          ['all',     '📋 All Invoices'],
          ['pending', '⏳ Pending'],
          ['overdue', '🔴 Overdue'],
          ['aging',   '📊 Aging Report'],
        ] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13,
            background: tab === k ? '#fff' : 'transparent',
            color: tab === k ? '#4BAED4' : '#718096',
            boxShadow: tab === k ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {/* ── AGING REPORT TAB ── */}
      {tab === 'aging' && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>📊 Accounts Receivable Aging Report</h3>
          <AgingReport invoices={invoices} />
        </div>
      )}

      {/* ── INVOICE LIST TABS ── */}
      {tab !== 'aging' && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Filters row */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #F0F4F8', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍  Search by client or ID..."
                style={{ padding: '7px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 12, width: 220 }}
              />
              {tab === 'all' && (
                <div style={{ display: 'flex', gap: 5 }}>
                  {(['all', 'draft', 'sent', 'paid', 'overdue', 'partial'] as const).map(s => (
                    <button key={s} onClick={() => setStatus(s)} style={{
                      padding: '5px 12px', borderRadius: 99, border: '1.5px solid', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      borderColor: statusFilter === s ? '#4BAED4' : '#E2E8F0',
                      background: statusFilter === s ? '#EBF8FF' : '#fff',
                      color: statusFilter === s ? '#4BAED4' : '#718096',
                    }}>
                      {s === 'all' ? 'All' : STATUS_CFG[s].label}
                    </button>
                  ))}
                </div>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#A0AEC0' }}>{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Issued</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  const balance = inv.amount - inv.paid
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelected(selected?.id === inv.id ? null : inv)}
                      style={{ cursor: 'pointer', background: selected?.id === inv.id ? '#EBF8FF' : undefined }}
                    >
                      <td style={{ fontWeight: 800, color: '#4BAED4' }}>{inv.id}</td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{inv.billTo}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{inv.billToEmail}</div>
                      </td>
                      <td style={{ color: '#718096', fontSize: 12 }}>{inv.issueDate}</td>
                      <td style={{ fontSize: 12, fontWeight: 600, color: inv.status === 'overdue' ? '#EF4444' : '#2D3748' }}>
                        {inv.dueDate}
                        {inv.daysOverdue && inv.daysOverdue > 0 && (
                          <div style={{ fontSize: 10, color: '#EF4444' }}>{inv.daysOverdue}d late</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: 14 }}>{fmt(inv.amount)}</td>
                      <td style={{ fontWeight: 700, color: balance > 0 ? (inv.status === 'overdue' ? '#EF4444' : '#F59E0B') : '#38C770' }}>
                        {balance > 0 ? fmt(balance) : '✅ Paid'}
                      </td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td>
                        <button className="btn btn-ghost btn-sm">View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#A0AEC0', fontSize: 14 }}>
                No invoices match your filter
              </div>
            )}
          </div>

          {selected && (
            <InvoicePreview
              inv={selected}
              onClose={() => setSelected(null)}
              onMarkPaid={(id) => markPaid(id)}
            />
          )}
        </div>
      )}

      {showCreate && <CreateInvoiceModal onClose={() => setCreate(false)} />}
    </div>
  )
}
