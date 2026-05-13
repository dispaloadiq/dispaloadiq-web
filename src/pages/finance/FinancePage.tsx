import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Shared helpers ────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
function fmtK(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : fmt(n)
}

// ── Shared data ───────────────────────────────────────────────────────────────
const MONTHS_6  = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
const MONTHS_12 = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

// ── Owner-Op data ─────────────────────────────────────────────────────────────
const OO_REVENUE  = [14200, 16800, 15400, 18200, 19600, 21400]
const OO_EXPENSES = [8100,  9200,  8800,  9600,  10200, 11100]
const OO_NET      = OO_REVENUE.map((r, i) => r - OO_EXPENSES[i])

const OO_REVENUE_YTD  = [18200, 16900, 17800, 19600, 18400, 19200, 20100, 18800, 17400, 19800, 19600, 21400]
const OO_EXPENSES_YTD = [9600,  9100,  9400,  10200, 9800,  10100, 10600, 9900,  9400,  10400, 10200, 11100]
const OO_NET_YTD      = OO_REVENUE_YTD.map((r, i) => r - OO_EXPENSES_YTD[i])

const OO_BUDGET_REVENUE  = [20000, 20000, 20000, 20000, 20000, 20000]
const OO_BUDGET_EXPENSES = [10000, 10000, 10000, 10000, 10000, 10000]

const OO_TRANSACTIONS = [
  { id: '1',  type: 'income',  desc: 'Load #EG-920441 — Chicago→Dallas',       amount: 1854,  date: 'Apr 20', cat: 'Load Revenue', broker: 'Echo Global'   },
  { id: '2',  type: 'expense', desc: 'Diesel — TA Travel Center Memphis',       amount: -312,  date: 'Apr 19', cat: 'Fuel',         broker: ''              },
  { id: '3',  type: 'income',  desc: 'Load #CL-773201 — Atlanta→Miami',         amount: 1622,  date: 'Apr 18', cat: 'Load Revenue', broker: 'Coyote'        },
  { id: '4',  type: 'expense', desc: 'Truck Insurance — Progressive',           amount: -890,  date: 'Apr 15', cat: 'Insurance',    broker: ''              },
  { id: '5',  type: 'expense', desc: 'Diesel — Pilot Flying J Nashville',       amount: -287,  date: 'Apr 14', cat: 'Fuel',         broker: ''              },
  { id: '6',  type: 'income',  desc: 'Load #TQ-554832 — Houston→Phoenix',       amount: 2786,  date: 'Apr 13', cat: 'Load Revenue', broker: 'TQL'           },
  { id: '7',  type: 'expense', desc: 'Truck Wash + Maintenance',                amount: -145,  date: 'Apr 12', cat: 'Maintenance',  broker: ''              },
  { id: '8',  type: 'expense', desc: 'Tolls — I-90 Illinois',                   amount: -68,   date: 'Apr 11', cat: 'Tolls',        broker: ''              },
  { id: '9',  type: 'income',  desc: 'Load #AL-887723 — Nashville→Charlotte',   amount: 796,   date: 'Apr 10', cat: 'Load Revenue', broker: 'Arrive'        },
  { id: '10', type: 'expense', desc: 'ELD Subscription — KeepTruckin',          amount: -45,   date: 'Apr 1',  cat: 'Software',     broker: ''              },
  { id: '11', type: 'income',  desc: 'Load #XP-112034 — Dallas→Albuquerque',    amount: 1540,  date: 'Apr 8',  cat: 'Load Revenue', broker: 'XPO Logistics' },
  { id: '12', type: 'expense', desc: 'Diesel — Love\'s Travel Stop Amarillo',   amount: -298,  date: 'Apr 7',  cat: 'Fuel',         broker: ''              },
  { id: '13', type: 'income',  desc: 'Load #CH-990231 — Memphis→Birmingham',    amount: 920,   date: 'Apr 6',  cat: 'Load Revenue', broker: 'CH Robinson'   },
  { id: '14', type: 'expense', desc: 'Truck Repair — Freightliner Service',     amount: -620,  date: 'Apr 5',  cat: 'Maintenance',  broker: ''              },
  { id: '15', type: 'expense', desc: 'Dispatcher Fee — Alex Petrov (8%)',       amount: -556,  date: 'Apr 4',  cat: 'Dispatcher',   broker: ''              },
  { id: '16', type: 'income',  desc: 'Load #EG-902110 — Chicago→Indianapolis',  amount: 680,   date: 'Apr 3',  cat: 'Load Revenue', broker: 'Echo Global'   },
  { id: '17', type: 'expense', desc: 'Tire Replacement — Les Schwab',           amount: -890,  date: 'Apr 2',  cat: 'Maintenance',  broker: ''              },
  { id: '18', type: 'income',  desc: 'Lumper Reimbursement — TQL',              amount: 150,   date: 'Apr 2',  cat: 'Reimbursement',broker: 'TQL'           },
  { id: '19', type: 'expense', desc: 'Scale Ticket — Weigh Station TX',         amount: -12,   date: 'Apr 1',  cat: 'Tolls',        broker: ''              },
  { id: '20', type: 'expense', desc: 'Truck Loan Payment — Chase',              amount: -1850, date: 'Apr 1',  cat: 'Loan',         broker: ''              },
]

const OO_EXPENSE_CATS = [
  { cat: 'Fuel',        amount: 4820, pct: 43, color: '#E53E3E' },
  { cat: 'Insurance',   amount: 2670, pct: 24, color: '#ECC94B' },
  { cat: 'Maintenance', amount: 1780, pct: 16, color: '#4BAED4' },
  { cat: 'Tolls',       amount: 890,  pct: 8,  color: '#8B5CF6' },
  { cat: 'Software',    amount: 540,  pct: 5,  color: '#38C770' },
  { cat: 'Other',       amount: 445,  pct: 4,  color: '#A0AEC0' },
]

const IFTA_STATES = [
  { state: 'IL', miles: 620, gallons: 85,  taxPaid: 102, taxOwed: 94,  balance: 8   },
  { state: 'TN', miles: 480, gallons: 66,  taxPaid: 73,  taxOwed: 62,  balance: 11  },
  { state: 'TX', miles: 850, gallons: 117, taxPaid: 129, taxOwed: 107, balance: 22  },
  { state: 'FL', miles: 330, gallons: 45,  taxPaid: 52,  taxOwed: 41,  balance: 11  },
  { state: 'GA', miles: 290, gallons: 40,  taxPaid: 44,  taxOwed: 35,  balance: 9   },
  { state: 'AZ', miles: 600, gallons: 82,  taxPaid: 78,  taxOwed: 82,  balance: -4  },
  { state: 'OH', miles: 410, gallons: 56,  taxPaid: 62,  taxOwed: 58,  balance: 4   },
  { state: 'KY', miles: 280, gallons: 38,  taxPaid: 40,  taxOwed: 36,  balance: 4   },
]

const OO_INVOICES = [
  { id: 'INV-1042', broker: 'Echo Global',      amount: 1854, issued: 'Apr 20', due: 'May 20', status: 'paid',    daysLeft: 0   },
  { id: 'INV-1041', broker: 'Coyote Logistics', amount: 1622, issued: 'Apr 18', due: 'May 18', status: 'pending', daysLeft: 28  },
  { id: 'INV-1040', broker: 'TQL',              amount: 2786, issued: 'Apr 13', due: 'May 13', status: 'pending', daysLeft: 23  },
  { id: 'INV-1039', broker: 'Arrive Logistics', amount: 796,  issued: 'Apr 10', due: 'May 10', status: 'overdue', daysLeft: -2  },
  { id: 'INV-1038', broker: 'XPO Logistics',    amount: 1540, issued: 'Apr 8',  due: 'May 8',  status: 'pending', daysLeft: 18  },
  { id: 'INV-1037', broker: 'CH Robinson',      amount: 920,  issued: 'Apr 6',  due: 'May 6',  status: 'pending', daysLeft: 16  },
]

const OO_TRIP_PNL = [
  { id: 'TRP-20041', route: 'Chicago → Dallas',     gross: 1854, fuel: 312, dispatcher: 148, tolls: 68,  other: 45,  net: 1281, rpm: 2.18, netRpm: 1.51 },
  { id: 'TRP-20043', route: 'Atlanta → Miami',      gross: 1690, fuel: 198, dispatcher: 135, tolls: 22,  other: 30,  net: 1305, rpm: 2.45, netRpm: 1.89 },
  { id: 'TRP-20042', route: 'Houston → Phoenix',    gross: 2786, fuel: 487, dispatcher: 223, tolls: 112, other: 55,  net: 1909, rpm: 2.32, netRpm: 1.59 },
  { id: 'TRP-20040', route: 'Nashville → Charlotte', gross: 796, fuel: 108, dispatcher: 64,  tolls: 18,  other: 20,  net: 586,  rpm: 1.88, netRpm: 1.38 },
  { id: 'TRP-20039', route: 'Dallas → Albuquerque', gross: 1540, fuel: 268, dispatcher: 123, tolls: 42,  other: 35,  net: 1072, rpm: 2.21, netRpm: 1.54 },
  { id: 'TRP-20038', route: 'Memphis → Birmingham', gross: 920,  fuel: 142, dispatcher: 74,  tolls: 24,  other: 18,  net: 662,  rpm: 2.08, netRpm: 1.50 },
  { id: 'TRP-20037', route: 'Chicago → Indianapolis',gross: 680, fuel: 94,  dispatcher: 54,  tolls: 14,  other: 12,  net: 506,  rpm: 1.96, netRpm: 1.46 },
]

// ── Dispatcher data ───────────────────────────────────────────────────────────
const DISP_COMMISSION_BY_CLIENT = [
  { name: 'Mike Rodriguez',   grossHandled: 28_400, rate: 8, commission: 2_272, loads: 8,  avgRpm: 2.18, trend: [220, 280, 310, 260, 290, 272] },
  { name: 'Sergiy Kovalchuk', grossHandled: 24_600, rate: 8, commission: 1_968, loads: 7,  avgRpm: 2.45, trend: [200, 240, 280, 300, 260, 282] },
  { name: 'Anna Perez',       grossHandled: 20_100, rate: 8, commission: 1_608, loads: 6,  avgRpm: 2.22, trend: [180, 200, 240, 220, 250, 268] },
  { name: 'Tom Bradley',      grossHandled: 18_200, rate: 8, commission: 1_456, loads: 5,  avgRpm: 2.31, trend: [160, 180, 200, 220, 240, 210] },
  { name: 'Linda Kim',        grossHandled: 15_800, rate: 8, commission: 1_264, loads: 4,  avgRpm: 2.38, trend: [140, 160, 180, 200, 220, 192] },
]
const DISP_MONTHS_COMM = [3_200, 3_800, 4_100, 3_600, 4_400, 8_568]
const maxDispComm = Math.max(...DISP_MONTHS_COMM)

// ── Company data ──────────────────────────────────────────────────────────────
const CO_REVENUE  = [52000, 58000, 55000, 64000, 68000, 74400]
const CO_EXPENSES = [38000, 42000, 40000, 46000, 49000, 52000]
const CO_NET      = CO_REVENUE.map((r, i) => r - CO_EXPENSES[i])

const CO_BUDGET_REVENUE  = [60000, 60000, 60000, 60000, 65000, 65000]
const CO_BUDGET_EXPENSES = [44000, 44000, 44000, 44000, 46000, 46000]

const CO_TRUCK_PNL = [
  { plate: 'IL 4829-XR', driver: 'Mike R.',    grossRev: 18_400, fuel: 4_200, maint: 800,   driver_pay: 5_520, insurance: 1_100, other: 420, netPnl: 6_360, miles: 8_440, rpm: 2.18 },
  { plate: 'FL 7731-KA', driver: 'Sergiy K.',  grossRev: 21_200, fuel: 4_800, maint: 600,   driver_pay: 6_360, insurance: 1_100, other: 380, netPnl: 7_960, miles: 8_650, rpm: 2.45 },
  { plate: 'TX 2201-BB', driver: 'Tom B.',     grossRev: 14_600, fuel: 3_400, maint: 1_200, driver_pay: 4_380, insurance: 1_100, other: 290, netPnl: 4_230, miles: 6_310, rpm: 2.31 },
  { plate: 'CA 8812-PP', driver: 'Anna P.',    grossRev: 16_800, fuel: 3_900, maint: 500,   driver_pay: 5_040, insurance: 1_100, other: 310, netPnl: 5_950, miles: 7_567, rpm: 2.22 },
  { plate: 'TN 3344-RQ', driver: 'Carlos V.',  grossRev: 19_600, fuel: 4_500, maint: 700,   driver_pay: 5_880, insurance: 1_100, other: 360, netPnl: 7_060, miles: 8_980, rpm: 2.18 },
]

const CO_EXPENSE_CATS = [
  { cat: 'Driver Pay',   amount: 27_180, pct: 41, color: '#4BAED4' },
  { cat: 'Fuel',         amount: 20_800, pct: 31, color: '#E53E3E' },
  { cat: 'Insurance',    amount: 5_500,  pct: 8,  color: '#ECC94B' },
  { cat: 'Maintenance',  amount: 3_800,  pct: 6,  color: '#8B5CF6' },
  { cat: 'Other',        amount: 9_120,  pct: 14, color: '#A0AEC0' },
]

// ── Shipper data ──────────────────────────────────────────────────────────────
const SH_SPEND    = [4100, 5200, 3800, 6400, 7200, 8420]
const SH_INVOICES = [
  { id: 'SHP-INV-041', carrier: 'Mike Rodriguez',   amount: 1854, due: 'May 10', status: 'pending', shipment: 'Chicago → Dallas'  },
  { id: 'SHP-INV-040', carrier: 'Sergiy Kovalchuk', amount: 1240, due: 'May 5',  status: 'paid',    shipment: 'Miami → Atlanta'   },
  { id: 'SHP-INV-039', carrier: 'Anna Perez',        amount: 890,  due: 'Apr 30', status: 'overdue', shipment: 'LA → Phoenix'      },
  { id: 'SHP-INV-038', carrier: 'Tom Bradley',       amount: 1780, due: 'May 15', status: 'pending', shipment: 'Dallas → Denver'   },
]
const SH_CARRIER_SPEND = [
  { name: 'Mike Rodriguez',   spend: 14_820, loads: 8,  avgCost: 1_853, color: '#4BAED4' },
  { name: 'Sergiy K.',        spend: 8_680,  loads: 5,  avgCost: 1_736, color: '#8B5CF6' },
  { name: 'Anna Perez',       spend: 5_340,  loads: 4,  avgCost: 1_335, color: '#38C770' },
  { name: 'Others',           spend: 3_200,  loads: 3,  avgCost: 1_067, color: '#A0AEC0' },
]

// ── Cash flow data (owner-op) ─────────────────────────────────────────────────
const CF_OPERATING  = [11200, 13400, 12800, 14800, 16000, 17600]
const CF_INVESTING  = [-800,  -1200, -400,  -600,  -2000, -1800]
const CF_FINANCING  = [-1850, -1850, -1850, -1850, -1850, -1850]
const CF_NET        = CF_OPERATING.map((o, i) => o + CF_INVESTING[i] + CF_FINANCING[i])

// ── Invoice status helpers ────────────────────────────────────────────────────
const INV_STATUS: Record<string, { label: string; color: string; bg: string; borderColor: string }> = {
  paid:    { label: '✅ Paid',    color: '#276749', bg: '#F0FFF4', borderColor: '#38C770' },
  pending: { label: '⏳ Pending', color: '#B7791F', bg: '#FEFCBF', borderColor: '#ECC94B' },
  overdue: { label: '🔴 Overdue', color: '#9B2C2C', bg: '#FFF5F5', borderColor: '#E53E3E' },
}

// ── Sub-components ────────────────────────────────────────────────────────────
function BarChart({ labels, data1, data2, color1, color2, label1, label2, netData, budgetData }: {
  labels: string[]; data1: number[]; data2: number[]; color1: string; color2: string;
  label1: string; label2: string; netData: number[]; budgetData?: number[]
}) {
  const maxVal = Math.max(...data1, ...data2, ...(budgetData ?? []), 1)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
        {labels.map((m, i) => (
          <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 130 }}>
              <div style={{ flex: 1, background: color1, height: `${(data1[i] / maxVal) * 130}px`, borderRadius: '4px 4px 0 0', transition: 'height .3s' }} />
              <div style={{ flex: 1, background: color2, height: `${(data2[i] / maxVal) * 130}px`, borderRadius: '4px 4px 0 0', opacity: .75, transition: 'height .3s' }} />
              {budgetData && <div style={{ flex: 1, background: 'transparent', border: `2px dashed #94A3B8`, height: `${(budgetData[i] / maxVal) * 130}px`, borderRadius: '4px 4px 0 0' }} />}
            </div>
            <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>{m}</div>
            <div style={{ fontSize: 10, color: '#38C770', fontWeight: 700 }}>+{fmtK(netData[i])}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}><div style={{ width: 10, height: 10, background: color1, borderRadius: 2 }} /><span style={{ fontSize: 11, color: '#718096' }}>{label1}</span></div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}><div style={{ width: 10, height: 10, background: color2, borderRadius: 2, opacity: .75 }} /><span style={{ fontSize: 11, color: '#718096' }}>{label2}</span></div>
        {budgetData && <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}><div style={{ width: 10, height: 10, border: '2px dashed #94A3B8', borderRadius: 2 }} /><span style={{ fontSize: 11, color: '#718096' }}>Budget</span></div>}
      </div>
    </div>
  )
}

function LineSparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const W = 120, H = height
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InvoiceCards({ invoices, isCarrier }: {
  invoices: { id: string; amount: number; issued?: string; due: string; status: string; daysLeft?: number; broker?: string; carrier?: string; shipment?: string }[];
  isCarrier: boolean
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
      {invoices.map(inv => {
        const sc = INV_STATUS[inv.status]
        const party = isCarrier ? inv.carrier : inv.broker
        return (
          <div key={inv.id} className="card" style={{ borderTop: `4px solid ${sc.borderColor}`, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{inv.id}</div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{party}</div>
                {inv.shipment && <div style={{ fontSize: 10, color: '#A0AEC0' }}>{inv.shipment}</div>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: sc.bg, color: sc.color }}>{sc.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#2D3748', marginBottom: 10 }}>{fmt(inv.amount)}</div>
            {[
              inv.issued ? { label: 'Issued', value: inv.issued } : null,
              { label: 'Due', value: inv.due },
              inv.daysLeft !== undefined ? { label: 'Status', value: inv.status === 'paid' ? 'Paid ✓' : (inv.daysLeft ?? 0) > 0 ? `${inv.daysLeft} days left` : `${Math.abs(inv.daysLeft ?? 0)} days overdue` } : null,
            ].filter(Boolean).map(r => r && (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0F4F8', fontSize: 12 }}>
                <span style={{ color: '#718096' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>📄 View</button>
              {inv.status !== 'paid' && <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>💬 Follow Up</button>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Budget vs Actual Component ────────────────────────────────────────────────
function BudgetVsActual({ actualRevenue, actualExpenses, budgetRevenue, budgetExpenses, months }: {
  actualRevenue: number[]; actualExpenses: number[]; budgetRevenue: number[]; budgetExpenses: number[]; months: string[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Monthly budget cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {months.map((m, i) => {
          const revVar = actualRevenue[i] - budgetRevenue[i]
          const expVar = actualExpenses[i] - budgetExpenses[i]
          const netActual = actualRevenue[i] - actualExpenses[i]
          const netBudget = budgetRevenue[i] - budgetExpenses[i]
          const netVar = netActual - netBudget
          return (
            <div key={m} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', background: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 10 }}>{m}</div>
              {[
                { label: 'Revenue',  actual: actualRevenue[i],  budget: budgetRevenue[i],  variance: revVar },
                { label: 'Expenses', actual: actualExpenses[i], budget: budgetExpenses[i], variance: -expVar },
                { label: 'Net',      actual: netActual,         budget: netBudget,         variance: netVar },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginBottom: 2 }}>
                    <span>{row.label}</span>
                    <span style={{ fontWeight: 700, color: row.variance >= 0 ? '#38C770' : '#EF4444' }}>
                      {row.variance >= 0 ? '+' : ''}{fmtK(row.variance)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((row.actual / Math.max(row.budget, row.actual)) * 100, 100)}%`, height: '100%', background: row.variance >= 0 ? '#38C770' : '#EF4444', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 1 }}>{fmtK(row.actual)} vs {fmtK(row.budget)}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      <div style={{ background: 'linear-gradient(135deg, #1A2535 0%, #2D4A6B 100%)', borderRadius: 14, padding: '18px 24px', color: '#fff' }}>
        <div style={{ fontSize: 12, opacity: .6, marginBottom: 12 }}>6-MONTH BUDGET PERFORMANCE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Revenue', actual: actualRevenue.reduce((s, v) => s + v, 0), budget: budgetRevenue.reduce((s, v) => s + v, 0) },
            { label: 'Total Expenses', actual: actualExpenses.reduce((s, v) => s + v, 0), budget: budgetExpenses.reduce((s, v) => s + v, 0) },
            { label: 'Net Profit', actual: actualRevenue.reduce((s, v) => s + v, 0) - actualExpenses.reduce((s, v) => s + v, 0), budget: budgetRevenue.reduce((s, v) => s + v, 0) - budgetExpenses.reduce((s, v) => s + v, 0) },
            { label: 'Budget Attainment', actual: Math.round((actualRevenue.reduce((s, v) => s + v, 0) / budgetRevenue.reduce((s, v) => s + v, 0)) * 100), budget: 100, isPercent: true },
          ].map(item => {
            const good = item.actual >= item.budget
            return (
              <div key={item.label}>
                <div style={{ fontSize: (item as any).isPercent ? 22 : 18, fontWeight: 900, color: good ? '#38C770' : '#EF4444' }}>
                  {(item as any).isPercent ? `${item.actual}%` : fmtK(item.actual)}
                </div>
                <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{item.label}</div>
                <div style={{ fontSize: 10, opacity: .5, marginTop: 2 }}>Budget: {(item as any).isPercent ? `${item.budget}%` : fmtK(item.budget)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Cash Flow Component ───────────────────────────────────────────────────────
function CashFlowStatement({ months }: { months: string[] }) {
  const maxCF = Math.max(...CF_NET.map(Math.abs))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Monthly CF bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {months.map((m, i) => {
          const netColor = CF_NET[i] >= 0 ? '#38C770' : '#EF4444'
          return (
            <div key={m} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 14px', background: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 10 }}>{m}</div>
              {[
                { label: 'Operating', value: CF_OPERATING[i], color: '#4BAED4' },
                { label: 'Investing', value: CF_INVESTING[i], color: '#8B5CF6' },
                { label: 'Financing', value: CF_FINANCING[i], color: '#ECC94B' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                  <span style={{ color: '#718096' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.value >= 0 ? '#38C770' : '#718096' }}>
                    {row.value >= 0 ? '+' : ''}{fmt(row.value)}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>Net CF</span>
                <span style={{ fontWeight: 900, color: netColor }}>{CF_NET[i] >= 0 ? '+' : ''}{fmt(CF_NET[i])}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* CF trend chart */}
      <div className="card">
        <h3 className="section-title" style={{ marginBottom: 12 }}>Net Cash Flow Trend — 6 Months</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {CF_NET.map((v, i) => {
                const pct = (v / maxCF) * 70
                const isNeg = v < 0
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: isNeg ? '#EF4444' : '#38C770', marginBottom: 2 }}>
                      {v >= 0 ? '+' : ''}{fmtK(v)}
                    </div>
                    <div style={{ width: '100%', height: Math.abs(pct), background: isNeg ? '#EF4444' : '#38C770', borderRadius: '4px 4px 0 0', opacity: .8 }} />
                    <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 3 }}>{months[i]}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ width: 180 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 8 }}>6-Month Summary</div>
            {[
              { label: 'Total Operating', value: CF_OPERATING.reduce((s, v) => s + v, 0), color: '#4BAED4' },
              { label: 'Total Investing',  value: CF_INVESTING.reduce((s, v) => s + v, 0),  color: '#8B5CF6' },
              { label: 'Total Financing',  value: CF_FINANCING.reduce((s, v) => s + v, 0),  color: '#ECC94B' },
              { label: 'Net Cash Flow',    value: CF_NET.reduce((s, v) => s + v, 0),        color: '#38C770', bold: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0F4F8', fontSize: 12 }}>
                <span style={{ color: '#718096' }}>{item.label}</span>
                <span style={{ fontWeight: (item as any).bold ? 800 : 600, color: item.value >= 0 ? item.color : '#EF4444' }}>
                  {item.value >= 0 ? '+' : ''}{fmt(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface Props { role: UserRole }

export default function FinancePage({ role }: Props) {
  const [tab, setTab] = useState('overview')
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [txSearch, setTxSearch] = useState('')

  const TABS: Record<UserRole, { id: string; label: string }[]> = {
    'owner-op': [
      { id: 'overview',     label: '📊 Overview'    },
      { id: 'trip-pnl',     label: '🚚 Trip P&L'    },
      { id: 'transactions', label: '💳 Transactions' },
      { id: 'budget',       label: '🎯 Budget'       },
      { id: 'cashflow',     label: '💧 Cash Flow'    },
      { id: 'ifta',         label: '🗺️ IFTA'         },
      { id: 'invoices',     label: '📄 Invoices'     },
    ],
    dispatcher: [
      { id: 'overview',     label: '📊 Overview'    },
      { id: 'commissions',  label: '💰 Commissions' },
      { id: 'invoices',     label: '📄 Invoices'    },
    ],
    company: [
      { id: 'overview',     label: '📊 Overview'    },
      { id: 'fleet-pnl',   label: '🚛 Fleet P&L'   },
      { id: 'transactions', label: '💳 Transactions' },
      { id: 'budget',       label: '🎯 Budget'       },
      { id: 'ifta',         label: '🗺️ IFTA'         },
      { id: 'invoices',     label: '📄 Invoices'     },
    ],
    shipper: [
      { id: 'overview',    label: '📊 Spend'     },
      { id: 'invoices',    label: '💳 Invoices'  },
    ],
  }

  const tabs = TABS[role]

  const ooTotalRev  = OO_TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const ooTotalExp  = Math.abs(OO_TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
  const ooNet       = ooTotalRev - ooTotalExp
  const ooMargin    = Math.round((ooNet / ooTotalRev) * 100)
  const iftaBalance = IFTA_STATES.reduce((s, r) => s + r.balance, 0)

  const ooYtdRev = OO_REVENUE_YTD.reduce((s, v) => s + v, 0)
  const ooYtdExp = OO_EXPENSES_YTD.reduce((s, v) => s + v, 0)
  const ooYtdNet = ooYtdRev - ooYtdExp
  const ooTaxEstimate = Math.round(ooYtdNet * 0.25)

  const dispTotalComm  = DISP_COMMISSION_BY_CLIENT.reduce((s, c) => s + c.commission, 0)
  const dispTotalGross = DISP_COMMISSION_BY_CLIENT.reduce((s, c) => s + c.grossHandled, 0)

  const coTotalRev = CO_REVENUE[CO_REVENUE.length - 1]
  const coTotalExp = CO_EXPENSES[CO_EXPENSES.length - 1]
  const coNetPnl   = CO_TRUCK_PNL.reduce((s, t) => s + t.netPnl, 0)

  const shTotalSpend = SH_SPEND[SH_SPEND.length - 1]
  const shPending    = SH_INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
  const shOverdue    = SH_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  const filteredTransactions = OO_TRANSACTIONS.filter(t =>
    (txFilter === 'all' || t.type === txFilter) &&
    (txSearch === '' || t.desc.toLowerCase().includes(txSearch.toLowerCase()) || t.cat.toLowerCase().includes(txSearch.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ════════════════ OVERVIEW ════════════════ */}
      {tab === 'overview' && (
        <>
          {/* ── owner-op ── */}
          {role === 'owner-op' && (
            <>
              <div className="stats-grid">
                {[
                  { label: 'April Revenue',  value: fmt(ooTotalRev), change: '+18% vs March', up: true,  color: '#38C770', icon: '💰' },
                  { label: 'April Expenses', value: fmt(ooTotalExp), change: '+8% vs March',  up: false, color: '#E53E3E', icon: '💸' },
                  { label: 'Net Profit',     value: fmt(ooNet),      change: `${ooMargin}% margin`, up: true, color: '#4BAED4', icon: '📈' },
                  { label: 'Avg RPM',        value: '$2.31/mi',      change: '+$0.08 vs goal', up: true, color: '#8B5CF6', icon: '🛣️' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 24 }}>{s.icon}</span><span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span></div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* YTD + Tax estimate row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div className="card">
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>YTD SUMMARY (12 Months)</div>
                  {[
                    { label: 'Revenue', value: fmt(ooYtdRev), color: '#38C770' },
                    { label: 'Expenses', value: fmt(ooYtdExp), color: '#E53E3E' },
                    { label: 'Net Profit', value: fmt(ooYtdNet), color: '#4BAED4' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0F4F8', fontSize: 13 }}>
                      <span style={{ color: '#718096' }}>{item.label}</span>
                      <span style={{ fontWeight: 800, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12 }}>
                    <LineSparkline data={OO_NET_YTD} color="#4BAED4" />
                    <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 4 }}>Monthly net — last 12 months</div>
                  </div>
                </div>
                <div className="card" style={{ background: '#FFF9F0', border: '1px solid #FEEBC8' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#975A16', marginBottom: 10 }}>🧾 TAX ESTIMATE — 2026</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#975A16', marginBottom: 8 }}>{fmt(ooTaxEstimate)}</div>
                  <div style={{ fontSize: 12, color: '#A0AEC0', lineHeight: 1.5 }}>
                    Estimated quarterly tax (25% of net profit)<br />
                    Based on YTD net: {fmt(ooYtdNet)}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                      { label: 'Q1 (Apr 15)', paid: true  },
                      { label: 'Q2 (Jun 15)', paid: false },
                      { label: 'Q3 (Sep 15)', paid: false },
                      { label: 'Q4 (Jan 15)', paid: false },
                    ].map(q => (
                      <div key={q.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: '#718096' }}>{q.label}</span>
                        <span style={{ fontWeight: 700, color: q.paid ? '#38C770' : '#975A16' }}>{q.paid ? '✅ Paid' : '⏳ Due'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title" style={{ marginBottom: 12 }}>Expense Breakdown</h3>
                  {OO_EXPENSE_CATS.map(e => (
                    <div key={e.cat} style={{ marginBottom: 9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{e.cat}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{fmt(e.amount)}</span>
                      </div>
                      <div className="progress-wrap"><div className="progress-bar" style={{ width: `${e.pct}%`, background: e.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="section-title">Revenue vs Expenses — 6 Months (with Budget)</h3>
                <BarChart labels={MONTHS_6} data1={OO_REVENUE} data2={OO_EXPENSES} color1="#4BAED4" color2="#E53E3E" label1="Revenue" label2="Expenses" netData={OO_NET} budgetData={OO_BUDGET_REVENUE} />
              </div>
            </>
          )}

          {/* ── dispatcher ── */}
          {role === 'dispatcher' && (
            <>
              <div className="stats-grid">
                {[
                  { label: 'April Commission', value: fmt(dispTotalComm),  change: '+22% vs March', up: true, color: '#8B5CF6', icon: '💰' },
                  { label: 'Gross Handled',    value: fmt(dispTotalGross), change: 'This month',    up: true, color: '#4BAED4', icon: '📊' },
                  { label: 'Avg Comm Rate',    value: '8%',                change: 'of gross',      up: true, color: '#38C770', icon: '📈' },
                  { label: 'Active Clients',   value: String(DISP_COMMISSION_BY_CLIENT.length), change: 'All active', up: true, color: '#D97706', icon: '🚛' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 24 }}>{s.icon}</span><span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span></div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div className="card">
                  <h3 className="section-title">Monthly Commission — 6 Months</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginTop: 16 }}>
                    {MONTHS_6.map((m, i) => {
                      const h = Math.max((DISP_MONTHS_COMM[i] / maxDispComm) * 130, 4)
                      const isLast = i === MONTHS_6.length - 1
                      return (
                        <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ fontSize: 9, color: '#8B5CF6', fontWeight: 700 }}>{fmtK(DISP_MONTHS_COMM[i])}</div>
                          <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: isLast ? '#8B5CF6' : 'rgba(139,92,246,.4)', transition: 'height .3s' }} />
                          <div style={{ fontSize: 11, color: isLast ? '#8B5CF6' : '#A0AEC0', fontWeight: isLast ? 700 : 400 }}>{m}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Commission by Client</h3>
                  {DISP_COMMISSION_BY_CLIENT.map(c => (
                    <div key={c.name} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name.split(' ')[0]}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6' }}>{fmt(c.commission)}</span>
                      </div>
                      <div className="progress-wrap"><div className="progress-bar" style={{ width: `${(c.commission / dispTotalComm) * 100}%`, background: '#8B5CF6' }} /></div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>{fmt(c.grossHandled)} gross · {c.loads} loads</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── company ── */}
          {role === 'company' && (
            <>
              <div className="stats-grid">
                {[
                  { label: 'April Revenue',  value: fmt(coTotalRev), change: '+18% vs March', up: true,  color: '#38C770', icon: '💰' },
                  { label: 'April Expenses', value: fmt(coTotalExp), change: '+14% vs March', up: false, color: '#E53E3E', icon: '💸' },
                  { label: 'Fleet Net P&L',  value: fmt(coNetPnl),   change: 'All trucks combined', up: true, color: '#4BAED4', icon: '🚛' },
                  { label: 'Fleet Avg RPM',  value: '$2.39/mi',      change: '+$0.08 vs target', up: true, color: '#8B5CF6', icon: '📈' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 24 }}>{s.icon}</span><span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span></div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div className="card">
                  <h3 className="section-title">Fleet Revenue vs Expenses — 6 Months (with Budget)</h3>
                  <BarChart labels={MONTHS_6} data1={CO_REVENUE} data2={CO_EXPENSES} color1="#059669" color2="#E53E3E" label1="Revenue" label2="Expenses" netData={CO_NET} budgetData={CO_BUDGET_REVENUE} />
                </div>
                <div className="card">
                  <h3 className="section-title">Operating Cost Breakdown</h3>
                  {CO_EXPENSE_CATS.map(e => (
                    <div key={e.cat} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{e.cat}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: e.color }}>{fmt(e.amount)}</span>
                      </div>
                      <div className="progress-wrap"><div className="progress-bar" style={{ width: `${e.pct}%`, background: e.color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── shipper ── */}
          {role === 'shipper' && (
            <>
              <div className="stats-grid">
                {[
                  { label: 'April Spend',      value: fmt(shTotalSpend), change: '-12% vs March',  up: true,  color: '#D97706', icon: '💳' },
                  { label: 'Pending Invoices', value: fmt(shPending),    change: `${SH_INVOICES.filter(i => i.status === 'pending').length} invoices`, up: false, color: '#ECC94B', icon: '⏳' },
                  { label: 'Overdue',          value: fmt(shOverdue),    change: 'Needs attention', up: false, color: '#E53E3E', icon: '🔴' },
                  { label: 'Avg Cost/Mile',    value: '$2.24/mi',        change: 'Market: $2.31',   up: true,  color: '#38C770', icon: '📈' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 24 }}>{s.icon}</span><span className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</span></div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <div className="card">
                  <h3 className="section-title">Monthly Freight Spend — 6 Months</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginTop: 16 }}>
                    {MONTHS_6.map((m, i) => {
                      const maxS = Math.max(...SH_SPEND)
                      const h = Math.max((SH_SPEND[i] / maxS) * 130, 4)
                      const isLast = i === MONTHS_6.length - 1
                      return (
                        <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div style={{ fontSize: 9, color: '#D97706', fontWeight: 700 }}>{fmtK(SH_SPEND[i])}</div>
                          <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: isLast ? '#D97706' : 'rgba(217,119,6,.4)', transition: 'height .3s' }} />
                          <div style={{ fontSize: 11, color: isLast ? '#D97706' : '#A0AEC0' }}>{m}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="card">
                  <h3 className="section-title">Spend by Carrier</h3>
                  {SH_CARRIER_SPEND.map(c => (
                    <div key={c.name} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{c.name.split(' ')[0]}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{fmt(c.spend)}</span>
                      </div>
                      <div className="progress-wrap"><div className="progress-bar" style={{ width: `${(c.spend / SH_CARRIER_SPEND.reduce((s, x) => s + x.spend, 0)) * 100}%`, background: c.color }} /></div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>{c.loads} loads · avg {fmt(c.avgCost)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ════════════════ TRIP P&L ════════════════ */}
      {tab === 'trip-pnl' && role === 'owner-op' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>P&L by Trip — April 2026</h3>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Trip</th><th>Route</th><th>Gross</th><th>Fuel</th><th>Dispatcher</th><th>Tolls</th><th>Other</th><th>Net Profit</th><th>Gross RPM</th><th>Net RPM</th></tr>
              </thead>
              <tbody>
                {OO_TRIP_PNL.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 700 }}>{t.id}</td>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{t.route}</td>
                    <td style={{ fontWeight: 700, color: '#38C770' }}>{fmt(t.gross)}</td>
                    <td style={{ color: '#E53E3E' }}>-{fmt(t.fuel)}</td>
                    <td style={{ color: '#8B5CF6' }}>-{fmt(t.dispatcher)}</td>
                    <td style={{ color: '#718096' }}>-{fmt(t.tolls)}</td>
                    <td style={{ color: '#718096' }}>-{fmt(t.other)}</td>
                    <td style={{ fontWeight: 800, fontSize: 15, color: '#4BAED4' }}>{fmt(t.net)}</td>
                    <td style={{ color: '#38C770', fontWeight: 600 }}>${t.rpm.toFixed(2)}</td>
                    <td style={{ color: t.netRpm >= 1.6 ? '#48BB78' : '#ECC94B', fontWeight: 700 }}>${t.netRpm.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#F7FAFC', fontWeight: 800 }}>
                  <td colSpan={2} style={{ fontWeight: 800 }}>TOTAL</td>
                  <td style={{ color: '#38C770' }}>{fmt(OO_TRIP_PNL.reduce((s, t) => s + t.gross, 0))}</td>
                  <td style={{ color: '#E53E3E' }}>-{fmt(OO_TRIP_PNL.reduce((s, t) => s + t.fuel, 0))}</td>
                  <td style={{ color: '#8B5CF6' }}>-{fmt(OO_TRIP_PNL.reduce((s, t) => s + t.dispatcher, 0))}</td>
                  <td style={{ color: '#718096' }}>-{fmt(OO_TRIP_PNL.reduce((s, t) => s + t.tolls, 0))}</td>
                  <td style={{ color: '#718096' }}>-{fmt(OO_TRIP_PNL.reduce((s, t) => s + t.other, 0))}</td>
                  <td style={{ color: '#4BAED4', fontSize: 15 }}>{fmt(OO_TRIP_PNL.reduce((s, t) => s + t.net, 0))}</td>
                  <td /><td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ COMMISSIONS ════════════════ */}
      {tab === 'commissions' && role === 'dispatcher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {DISP_COMMISSION_BY_CLIENT.map(c => {
              const maxTrend = Math.max(...c.trend)
              return (
                <div key={c.name} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>{c.loads} loads · ${c.avgRpm.toFixed(2)}/mi avg</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#8B5CF6' }}>{fmt(c.commission)}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>{c.rate}% of gross</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#718096', marginBottom: 4 }}>
                      <span>Gross handled</span>
                      <span style={{ fontWeight: 700 }}>{fmt(c.grossHandled)}</span>
                    </div>
                    <div className="progress-wrap"><div className="progress-bar" style={{ width: `${(c.commission / dispTotalComm) * 100}%`, background: '#8B5CF6' }} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 32 }}>
                    {c.trend.map((v, i) => (
                      <div key={i} style={{ flex: 1, height: `${(v / maxTrend) * 30}px`, background: i === c.trend.length - 1 ? '#8B5CF6' : 'rgba(139,92,246,.3)', borderRadius: '2px 2px 0 0' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 3 }}>Daily commission trend</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════════════ FLEET P&L ════════════════ */}
      {tab === 'fleet-pnl' && role === 'company' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Fleet P&L — April 2026</h3>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Truck</th><th>Driver</th><th>Gross Rev</th><th>Fuel</th><th>Maint</th><th>Driver Pay</th><th>Insurance</th><th>Other</th><th>Net P&L</th><th>RPM</th></tr>
              </thead>
              <tbody>
                {CO_TRUCK_PNL.map(t => (
                  <tr key={t.plate}>
                    <td style={{ fontWeight: 700 }}>{t.plate}</td>
                    <td style={{ fontSize: 13, color: '#718096' }}>{t.driver}</td>
                    <td style={{ fontWeight: 700, color: '#38C770' }}>{fmt(t.grossRev)}</td>
                    <td style={{ color: '#E53E3E' }}>-{fmt(t.fuel)}</td>
                    <td style={{ color: '#ECC94B' }}>-{fmt(t.maint)}</td>
                    <td style={{ color: '#4BAED4' }}>-{fmt(t.driver_pay)}</td>
                    <td style={{ color: '#718096' }}>-{fmt(t.insurance)}</td>
                    <td style={{ color: '#A0AEC0' }}>-{fmt(t.other)}</td>
                    <td style={{ fontWeight: 800, fontSize: 15, color: t.netPnl > 6000 ? '#48BB78' : '#ECC94B' }}>{fmt(t.netPnl)}</td>
                    <td style={{ fontWeight: 600, color: '#4BAED4' }}>${t.rpm.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#F7FAFC', fontWeight: 800 }}>
                  <td colSpan={2}>TOTAL</td>
                  <td style={{ color: '#38C770' }}>{fmt(CO_TRUCK_PNL.reduce((s, t) => s + t.grossRev, 0))}</td>
                  <td style={{ color: '#E53E3E' }}>-{fmt(CO_TRUCK_PNL.reduce((s, t) => s + t.fuel, 0))}</td>
                  <td style={{ color: '#ECC94B' }}>-{fmt(CO_TRUCK_PNL.reduce((s, t) => s + t.maint, 0))}</td>
                  <td style={{ color: '#4BAED4' }}>-{fmt(CO_TRUCK_PNL.reduce((s, t) => s + t.driver_pay, 0))}</td>
                  <td style={{ color: '#718096' }}>-{fmt(CO_TRUCK_PNL.reduce((s, t) => s + t.insurance, 0))}</td>
                  <td style={{ color: '#A0AEC0' }}>-{fmt(CO_TRUCK_PNL.reduce((s, t) => s + t.other, 0))}</td>
                  <td style={{ color: '#4BAED4', fontSize: 15 }}>{fmt(coNetPnl)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ TRANSACTIONS ════════════════ */}
      {tab === 'transactions' && (role === 'owner-op' || role === 'company') && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Transactions — April 2026 ({filteredTransactions.length})</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input className="input" placeholder="🔍 Search..." value={txSearch} onChange={e => setTxSearch(e.target.value)} style={{ width: 160, fontSize: 12 }} />
              {(['all', 'income', 'expense'] as const).map(f => (
                <button key={f} className={`chip ${txFilter === f ? 'active' : ''}`} onClick={() => setTxFilter(f)}>
                  {f === 'all' ? 'All' : f === 'income' ? '📥 Income' : '📤 Expenses'}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm">Export CSV</button>
            </div>
          </div>
          <div style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
            {[
              { label: 'Total In', value: fmt(filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)), color: '#38C770' },
              { label: 'Total Out', value: fmt(Math.abs(filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))), color: '#E53E3E' },
              { label: 'Net', value: fmt(filteredTransactions.reduce((s, t) => s + t.amount, 0)), color: '#4BAED4' },
            ].map(item => (
              <div key={item.label} style={{ padding: '8px 14px', background: '#F7FAFC', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: '#718096', marginRight: 6 }}>{item.label}:</span>
                <strong style={{ color: item.color }}>{item.value}</strong>
              </div>
            ))}
          </div>
          <table>
            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td style={{ color: '#718096', whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td><div style={{ fontWeight: 600 }}>{t.desc}</div>{t.broker && <div style={{ fontSize: 11, color: '#A0AEC0' }}>{t.broker}</div>}</td>
                  <td><span className="badge badge-primary" style={{ fontSize: 11 }}>{t.cat}</span></td>
                  <td style={{ fontWeight: 800, fontSize: 15, color: t.type === 'income' ? '#38C770' : '#E53E3E', whiteSpace: 'nowrap' }}>
                    {t.type === 'income' ? '+' : ''}{fmt(Math.abs(t.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════ BUDGET ════════════════ */}
      {tab === 'budget' && (role === 'owner-op' || role === 'company') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A2535' }}>🎯 Budget vs Actual</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Compare planned vs actual performance for the last 6 months</p>
            </div>
            <button className="btn btn-ghost btn-sm">📤 Export</button>
          </div>
          {role === 'owner-op'
            ? <BudgetVsActual actualRevenue={OO_REVENUE} actualExpenses={OO_EXPENSES} budgetRevenue={OO_BUDGET_REVENUE} budgetExpenses={OO_BUDGET_EXPENSES} months={MONTHS_6} />
            : <BudgetVsActual actualRevenue={CO_REVENUE} actualExpenses={CO_EXPENSES} budgetRevenue={CO_BUDGET_REVENUE} budgetExpenses={CO_BUDGET_EXPENSES} months={MONTHS_6} />
          }
        </div>
      )}

      {/* ════════════════ CASH FLOW ════════════════ */}
      {tab === 'cashflow' && role === 'owner-op' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A2535' }}>💧 Cash Flow Statement</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Operating, investing, and financing cash flows — last 6 months</p>
          </div>
          <CashFlowStatement months={MONTHS_6} />
        </div>
      )}

      {/* ════════════════ IFTA ════════════════ */}
      {tab === 'ifta' && (role === 'owner-op' || role === 'company') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { label: 'Total Miles', value: `${IFTA_STATES.reduce((s, r) => s + r.miles, 0).toLocaleString()} mi`, color: '#4BAED4' },
              { label: 'Total Fuel',  value: `${IFTA_STATES.reduce((s, r) => s + r.gallons, 0)} gal`, color: '#ECC94B' },
              { label: 'Q2 Balance',  value: iftaBalance >= 0 ? `+$${iftaBalance} refund` : `-$${Math.abs(iftaBalance)} owed`, color: iftaBalance >= 0 ? '#38C770' : '#E53E3E' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Q2 2026 IFTA — by State</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="badge badge-warning">Due: Jun 30</span>
                <button className="btn btn-primary btn-sm">📄 Generate Report</button>
                <button className="btn btn-ghost btn-sm">Export</button>
              </div>
            </div>
            <table>
              <thead><tr><th>State</th><th>Miles</th><th>Gallons</th><th>Tax Paid</th><th>Tax Owed</th><th>Balance</th></tr></thead>
              <tbody>
                {IFTA_STATES.map(r => (
                  <tr key={r.state}>
                    <td style={{ fontWeight: 700 }}>{r.state}</td>
                    <td>{r.miles.toLocaleString()}</td>
                    <td>{r.gallons}</td>
                    <td>${r.taxPaid}</td>
                    <td>${r.taxOwed}</td>
                    <td style={{ fontWeight: 800, color: r.balance >= 0 ? '#38C770' : '#E53E3E' }}>
                      {r.balance >= 0 ? `+$${r.balance} refund` : `-$${Math.abs(r.balance)} owed`}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#F4F6F9', fontWeight: 700 }}>
                  <td>TOTAL</td>
                  <td>{IFTA_STATES.reduce((s, r) => s + r.miles, 0).toLocaleString()}</td>
                  <td>{IFTA_STATES.reduce((s, r) => s + r.gallons, 0)}</td>
                  <td>${IFTA_STATES.reduce((s, r) => s + r.taxPaid, 0)}</td>
                  <td>${IFTA_STATES.reduce((s, r) => s + r.taxOwed, 0)}</td>
                  <td style={{ color: iftaBalance >= 0 ? '#38C770' : '#E53E3E', fontWeight: 900 }}>
                    {iftaBalance >= 0 ? `+$${iftaBalance} refund` : `-$${Math.abs(iftaBalance)} owed`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ INVOICES ════════════════ */}
      {tab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['paid', 'pending', 'overdue'] as const).map(s => {
                const list = role === 'shipper' ? SH_INVOICES : OO_INVOICES
                const count = list.filter(i => i.status === s).length
                const total = list.filter(i => i.status === s).reduce((sum, i) => sum + i.amount, 0)
                const sc = INV_STATUS[s]
                return (
                  <div key={s} style={{ background: sc.bg, border: `1px solid ${sc.borderColor}`, borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: sc.color }}>{count}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{fmt(total)}</div>
                    <div style={{ fontSize: 10, color: sc.color }}>{s}</div>
                  </div>
                )
              })}
            </div>
            {role !== 'shipper' && <button className="btn btn-primary">+ Create Invoice</button>}
          </div>
          {role === 'shipper'
            ? <InvoiceCards invoices={SH_INVOICES.map(i => ({ ...i, issued: undefined, daysLeft: undefined }))} isCarrier={true} />
            : <InvoiceCards invoices={OO_INVOICES.map(i => ({ ...i, carrier: undefined }))} isCarrier={false} />
          }
        </div>
      )}
    </div>
  )
}
