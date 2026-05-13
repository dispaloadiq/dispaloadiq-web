import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportType =
  | 'revenue'       | 'ifta'         | 'payroll'
  | 'maintenance'   | 'fleet'        | 'loads'
  | 'expenses'      | 'driver-perf'
  | 'broker-payments' | 'tax-summary'

interface ReportDef {
  id: ReportType
  icon: string
  title: string
  desc: string
  category: 'financial' | 'operations' | 'compliance'
  color: string
}

interface ScheduledReport {
  id: string
  reportId: ReportType
  frequency: 'weekly' | 'monthly' | 'quarterly'
  nextRun: string
  email: string
  enabled: boolean
}

const REPORT_DEFS: ReportDef[] = [
  { id:'revenue',          icon:'💰', title:'Revenue Summary',       desc:'Total revenue, RPM, load count by period',             category:'financial',  color:'#38C770' },
  { id:'ifta',             icon:'🗺️', title:'IFTA Quarterly',        desc:'Fuel tax by state, net balance, filing-ready PDF',     category:'compliance', color:'#4BAED4' },
  { id:'payroll',          icon:'💼', title:'Payroll & Settlements',  desc:'Driver earnings, deductions, net pay by period',       category:'financial',  color:'#8B5CF6' },
  { id:'maintenance',      icon:'🔧', title:'Maintenance Report',     desc:'Service costs, overdue items, cost per truck',         category:'operations', color:'#F59E0B' },
  { id:'fleet',            icon:'🚛', title:'Fleet Status Report',    desc:'Truck utilization, mileage, revenue per unit',         category:'operations', color:'#4BAED4' },
  { id:'loads',            icon:'📦', title:'Load History',           desc:'All loads with broker, rate, miles, status',           category:'operations', color:'#718096' },
  { id:'expenses',         icon:'💸', title:'Expense Report',         desc:'Fuel, maintenance, insurance by category',             category:'financial',  color:'#E53E3E' },
  { id:'driver-perf',      icon:'👤', title:'Driver Performance',     desc:'On-time rate, miles, revenue, safety score',           category:'operations', color:'#38C770' },
  { id:'broker-payments',  icon:'🤝', title:'Broker Payment Report',  desc:'Payment history, days-to-pay, disputes, aging',        category:'financial',  color:'#A78BFA' },
  { id:'tax-summary',      icon:'🧾', title:'Tax Summary',            desc:'Annual income, deductions, estimated tax liability',   category:'compliance', color:'#F97316' },
]

type Period = 'this-week' | 'this-month' | 'last-month' | 'q1' | 'q2' | 'ytd' | 'custom'
const PERIODS: { key: Period; label: string }[] = [
  { key:'this-week',  label:'This Week'    },
  { key:'this-month', label:'This Month'   },
  { key:'last-month', label:'Last Month'   },
  { key:'q1',         label:'Q1 2025'      },
  { key:'q2',         label:'Q2 2025'      },
  { key:'ytd',        label:'Year to Date' },
  { key:'custom',     label:'Custom Range' },
]

// ─── Mock data ─────────────────────────────────────────────────────────────────
const REVENUE_DATA = {
  summary: { total: 62480, loads: 28, rpm: 2.31, miles: 27050, netProfit: 38940, margin: 62 },
  byMonth: [
    { month:'Jan', revenue:14200, expenses:8800, net:5400 },
    { month:'Feb', revenue:15400, expenses:9600, net:5800 },
    { month:'Mar', revenue:18200, expenses:10100,net:8100 },
    { month:'Apr', revenue:14680, expenses:8200, net:6480 },
  ],
  byBroker: [
    { broker:'CH Robinson',      revenue:14200, loads:6, rpm:2.48, payDays:21 },
    { broker:'Echo Global',      revenue:12100, loads:5, rpm:2.38, payDays:18 },
    { broker:'Coyote Logistics', revenue:10800, loads:5, rpm:2.22, payDays:28 },
    { broker:'TQL',              revenue:9200,  loads:4, rpm:2.15, payDays:32 },
    { broker:'XPO Logistics',    revenue:8400,  loads:4, rpm:2.31, payDays:30 },
    { broker:'Arrive Logistics', revenue:7780,  loads:4, rpm:2.09, payDays:24 },
  ],
}

const IFTA_DATA = [
  { state:'IL', miles:620,  gallons:85,  taxPaid:38.67, taxOwed:35.97, balance:2.70  },
  { state:'TN', miles:480,  gallons:66,  taxPaid:18.08, taxOwed:20.26, balance:-2.18 },
  { state:'TX', miles:850,  gallons:117, taxPaid:23.40, taxOwed:26.15, balance:-2.75 },
  { state:'FL', miles:330,  gallons:45,  taxPaid: 8.55, taxOwed: 9.61, balance:-1.06 },
  { state:'GA', miles:290,  gallons:40,  taxPaid:12.76, taxOwed:14.44, balance:-1.68 },
  { state:'AZ', miles:600,  gallons:82,  taxPaid:21.32, taxOwed:24.24, balance:-2.92 },
]

const PAYROLL_DATA = [
  { driver:'James Carter',    loads:8, miles:6420, gross:4120, deductions:412, net:3708 },
  { driver:'Mike Rodriguez',  loads:7, miles:5880, gross:3820, deductions:382, net:3438 },
  { driver:'Anna Perez',      loads:6, miles:4910, gross:3270, deductions:327, net:2943 },
  { driver:'Tony Marshall',   loads:5, miles:4130, gross:2740, deductions:274, net:2466 },
]

const FLEET_DATA = [
  { unit:'Unit 01', truck:'Freightliner Cascadia', miles:6420, loads:8, revenue:14200, util:87, status:'Active'  },
  { unit:'Unit 02', truck:'Peterbilt 389',         miles:5880, loads:7, revenue:12800, util:79, status:'Active'  },
  { unit:'Unit 03', truck:'Kenworth T680',         miles:4910, loads:6, revenue:10400, util:68, status:'Active'  },
  { unit:'Unit 04', truck:'Volvo VNL',             miles:4130, loads:5, revenue: 9200, util:54, status:'Repair'  },
  { unit:'Unit 05', truck:'Mack Anthem',           miles:2100, loads:2, revenue: 4800, util:31, status:'Active'  },
]

const EXPENSE_DATA = {
  categories: [
    { cat:'Fuel',        amount:4120, pct:38 },
    { cat:'Driver Pay',  amount:3140, pct:29 },
    { cat:'Insurance',   amount:1620, pct:15 },
    { cat:'Maintenance', amount: 890, pct: 8 },
    { cat:'Tolls',       amount: 420, pct: 4 },
    { cat:'Software',    amount: 240, pct: 2 },
    { cat:'Other',       amount: 430, pct: 4 },
  ],
  total: 10860,
}

const DRIVER_PERF_DATA = [
  { driver:'James Carter',   miles:6420, loads:8, onTime:100, rpm:2.21, safety:98, rating:4.9 },
  { driver:'Mike Rodriguez', miles:5880, loads:7, onTime:86,  rpm:2.18, safety:91, rating:4.7 },
  { driver:'Anna Perez',     miles:4910, loads:6, onTime:100, rpm:2.12, safety:96, rating:4.8 },
  { driver:'Tony Marshall',  miles:4130, loads:5, onTime:80,  rpm:2.23, safety:84, rating:4.6 },
]

const MAINTENANCE_DATA = [
  { unit:'Unit 01', type:'Oil Change',       date:'Apr 15', cost:180, mech:"Jim's Auto", next:'Jul 15', status:'Done',    miles:6420, notes:'15W-40 Rotella'    },
  { unit:'Unit 02', type:'Tire Rotation',    date:'Apr 12', cost:240, mech:'TruckPro',   next:'Jul 12', status:'Done',    miles:5880, notes:'All 18 tires'       },
  { unit:'Unit 03', type:'Brake Inspection', date:'Apr 10', cost:320, mech:'Mike\'s',    next:'Oct 10', status:'Done',    miles:4910, notes:'Front pads replaced' },
  { unit:'Unit 04', type:'Engine Overhaul',  date:'Apr 8',  cost:3200, mech:'Dealer',    next:'—',      status:'In-Shop', miles:4130, notes:'Injector failure'    },
  { unit:'Unit 05', type:'AC Recharge',      date:'Mar 28', cost:180, mech:"Jim's Auto", next:'—',     status:'Done',    miles:2100, notes:'R-134a, 2lbs'        },
  { unit:'Unit 01', type:'Coolant Flush',    date:'Mar 15', cost:95,  mech:'TruckPro',   next:'Sep 15', status:'Done',    miles:5900, notes:'Green coolant'       },
  { unit:'Unit 02', type:'DOT Inspection',   date:'Feb 28', cost:120, mech:'Certified',  next:'Feb 28', status:'Overdue', miles:5200, notes:'Cert expires soon'   },
]

const LOADS_DATA = [
  { id:'EG-920441', date:'May 5',  from:'Chicago, IL', to:'Dallas, TX',     miles:850,  rate:1854, broker:'Echo Global',   driver:'James Carter',   status:'Delivered', rpm:2.18 },
  { id:'CL-773201', date:'May 3',  from:'Atlanta, GA', to:'Miami, FL',      miles:662,  rate:1622, broker:'Coyote',        driver:'Mike Rodriguez', status:'Delivered', rpm:2.45 },
  { id:'TQ-554832', date:'May 2',  from:'Houston, TX', to:'Phoenix, AZ',    miles:1201, rate:2786, broker:'TQL',           driver:'Anna Perez',     status:'In Transit',rpm:2.32 },
  { id:'XP-211098', date:'Apr 30', from:'LA, CA',      to:'Seattle, WA',    miles:1140, rate:3090, broker:'XPO Logistics', driver:'James Carter',   status:'Delivered', rpm:2.71 },
  { id:'CH-388120', date:'Apr 28', from:'Denver, CO',  to:'Chicago, IL',    miles:920,  rate:2140, broker:'CH Robinson',   driver:'Tony Marshall',  status:'Delivered', rpm:2.33 },
  { id:'AR-199022', date:'Apr 25', from:'Nashville, TN',to:'Charlotte, NC', miles:410,  rate:960,  broker:'Arrive',        driver:'Anna Perez',     status:'Delivered', rpm:2.34 },
  { id:'EG-910022', date:'Apr 22', from:'Chicago, IL', to:'Atlanta, GA',    miles:716,  rate:1748, broker:'Echo Global',   driver:'Mike Rodriguez', status:'Delivered', rpm:2.44 },
  { id:'CL-741188', date:'Apr 18', from:'Dallas, TX',  to:'Denver, CO',     miles:1020, rate:2240, broker:'Coyote',        driver:'James Carter',   status:'Delivered', rpm:2.20 },
]

const BROKER_PAYMENTS_DATA = [
  { broker:'Echo Global',      invoice:'EG-920441', amount:1854,  issued:'Apr 30', paid:'May 11', days:11, status:'Paid',    method:'ACH' },
  { broker:'Coyote Logistics', invoice:'CL-773201', amount:1622,  issued:'May 1',  paid:'May 8',  days:7,  status:'Paid',    method:'QuickPay' },
  { broker:'CH Robinson',      invoice:'CH-388120', amount:2140,  issued:'Apr 28', paid:null,     days:14, status:'Pending', method:'ACH' },
  { broker:'TQL',              invoice:'TQ-554832', amount:2786,  issued:'May 2',  paid:null,     days:10, status:'Pending', method:'Wire' },
  { broker:'XPO Logistics',    invoice:'XP-211098', amount:3090,  issued:'Apr 30', paid:'May 9',  days:9,  status:'Paid',    method:'ACH' },
  { broker:'Arrive Logistics', invoice:'AR-199022', amount:960,   issued:'Apr 25', paid:'May 2',  days:7,  status:'Paid',    method:'QuickPay' },
  { broker:'Coyote Logistics', invoice:'CL-741188', amount:2240,  issued:'Apr 18', paid:null,     days:24, status:'Overdue', method:'ACH' },
]

const TAX_SUMMARY_DATA = {
  year: 2025,
  grossRevenue:  312480,
  deductions: [
    { cat:'Fuel Expenses',      amount: 58240 },
    { cat:'Driver Wages',       amount: 92100 },
    { cat:'Insurance',          amount: 19800 },
    { cat:'Depreciation',       amount: 28400 },
    { cat:'Maintenance/Repair', amount: 14200 },
    { cat:'Tolls & Fees',       amount:  5640 },
    { cat:'Software/Services',  amount:  3120 },
    { cat:'Office/Admin',       amount:  2400 },
  ],
  estimatedTaxRate: 21,
  ytdPayments: 12400,
  ifta: { totalOwed: 380.42, ytdPaid: 298.60 },
  schedule: [
    { quarter: 'Q1', dueDate: 'Apr 15, 2025', amount: 4200, status: 'Paid'    },
    { quarter: 'Q2', dueDate: 'Jun 16, 2025', amount: 4800, status: 'Due'     },
    { quarter: 'Q3', dueDate: 'Sep 15, 2025', amount: 5200, status: 'Upcoming'},
    { quarter: 'Q4', dueDate: 'Jan 15, 2026', amount: 4900, status: 'Upcoming'},
  ],
}

const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id:'SR-001', reportId:'revenue',    frequency:'monthly',   nextRun:'Jun 1, 2025',  email:'admin@myfleet.com',  enabled:true  },
  { id:'SR-002', reportId:'payroll',    frequency:'weekly',    nextRun:'May 19, 2025', email:'hr@myfleet.com',     enabled:true  },
  { id:'SR-003', reportId:'ifta',       frequency:'quarterly', nextRun:'Jul 1, 2025',  email:'tax@myfleet.com',    enabled:true  },
  { id:'SR-004', reportId:'fleet',      frequency:'monthly',   nextRun:'Jun 1, 2025',  email:'ops@myfleet.com',    enabled:false },
]

// ─── Sub-report Components ────────────────────────────────────────────────────

function RevenueReport({ data, maxBar }: { data: typeof REVENUE_DATA; maxBar: number }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Total Revenue',  value:`$${data.summary.total.toLocaleString()}`,          color:'#38C770' },
          { label:'Net Profit',     value:`$${data.summary.netProfit.toLocaleString()}`,       color:'#4BAED4' },
          { label:'Profit Margin',  value:`${data.summary.margin}%`,                          color:'#8B5CF6' },
          { label:'Total Loads',    value: data.summary.loads.toString(),                     color:'#F59E0B' },
          { label:'Total Miles',    value: data.summary.miles.toLocaleString(),               color:'#718096' },
          { label:'Avg RPM',        value:`$${data.summary.rpm}`,                             color:'#38C770' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="section-title">Monthly Revenue vs Expenses</h3>
        <div style={{ display:'flex', gap:12, alignItems:'flex-end', height:140 }}>
          {data.byMonth.map(m => (
            <div key={m.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#38C770' }}>${(m.revenue/1000).toFixed(1)}k</div>
              <div style={{ width:'100%', display:'flex', gap:3, alignItems:'flex-end', height:100 }}>
                <div style={{ flex:1, borderRadius:'4px 4px 0 0', height:`${(m.revenue/maxBar)*100}%`, background:'#38C770', minHeight:4 }} />
                <div style={{ flex:1, borderRadius:'4px 4px 0 0', height:`${(m.expenses/maxBar)*100}%`, background:'#E53E3E', minHeight:4 }} />
              </div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>{m.month}</div>
            </div>
          ))}
          <div style={{ display:'flex', gap:12, alignItems:'center', marginLeft:'auto', alignSelf:'flex-end', paddingBottom:20 }}>
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              <div style={{ width:10, height:10, borderRadius:2, background:'#38C770' }} />
              <span style={{ fontSize:11, color:'#718096' }}>Revenue</span>
            </div>
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              <div style={{ width:10, height:10, borderRadius:2, background:'#E53E3E' }} />
              <span style={{ fontSize:11, color:'#718096' }}>Expenses</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Revenue by Broker</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Broker</th><th>Revenue</th><th>Loads</th><th>Avg RPM</th><th>Avg Pay Days</th><th>Share</th></tr>
            </thead>
            <tbody>
              {data.byBroker.map(b => (
                <tr key={b.broker}>
                  <td style={{ fontWeight:600 }}>{b.broker}</td>
                  <td style={{ fontWeight:700, color:'#38C770' }}>${b.revenue.toLocaleString()}</td>
                  <td>{b.loads}</td>
                  <td style={{ color:'#4BAED4', fontWeight:600 }}>${b.rpm.toFixed(2)}</td>
                  <td>
                    <span style={{ fontWeight:700, color: b.payDays <= 21 ? '#38C770' : b.payDays <= 30 ? '#F59E0B' : '#E53E3E' }}>
                      {b.payDays}d
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:6, width:80, overflow:'hidden' }}>
                        <div style={{ width:`${(b.revenue/data.summary.total)*100}%`, height:'100%', borderRadius:99, background:'#4BAED4' }} />
                      </div>
                      <span style={{ fontSize:12, color:'#718096' }}>{Math.round((b.revenue/data.summary.total)*100)}%</span>
                    </div>
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

function IftaReport({ data }: { data: typeof IFTA_DATA }) {
  const net = data.reduce((s,r) => s+r.balance, 0)
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'States Filed',   value: data.length.toString(),                                   color:'#4BAED4' },
          { label:'Total Tax Paid', value:`$${data.reduce((s,r)=>s+r.taxPaid,0).toFixed(2)}`,        color:'#38C770' },
          { label:'Net Balance',    value:`${net>=0?'+':''}$${Math.abs(net).toFixed(2)}`,             color: net>=0?'#38C770':'#E53E3E' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 className="section-title" style={{ margin:0 }}>State-by-State IFTA Breakdown</h3>
          {net < 0 && (
            <span style={{ fontSize:12, fontWeight:700, color:'#E53E3E', background:'#FFF5F5', padding:'4px 10px', borderRadius:8 }}>
              ⚠️ Amount Owed: ${Math.abs(net).toFixed(2)}
            </span>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>State</th><th>Miles</th><th>Gallons</th><th>Tax Paid</th><th>Tax Owed</th><th>Balance</th></tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.state}>
                  <td style={{ fontWeight:800, color:'#4BAED4' }}>{r.state}</td>
                  <td>{r.miles.toLocaleString()}</td>
                  <td>{r.gallons}</td>
                  <td style={{ color:'#38C770', fontWeight:600 }}>${r.taxPaid.toFixed(2)}</td>
                  <td style={{ color:'#E53E3E', fontWeight:600 }}>${r.taxOwed.toFixed(2)}</td>
                  <td>
                    <span style={{ fontWeight:800, fontSize:13, padding:'3px 10px', borderRadius:99,
                      background:r.balance>=0?'#F0FFF4':'#FFF5F5', color:r.balance>=0?'#276749':'#C53030' }}>
                      {r.balance>=0?'+':''}${r.balance.toFixed(2)}
                    </span>
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

function PayrollReport({ data }: { data: typeof PAYROLL_DATA }) {
  const totals = data.reduce((s,d) => ({
    loads:s.loads+d.loads, miles:s.miles+d.miles,
    gross:s.gross+d.gross, deductions:s.deductions+d.deductions, net:s.net+d.net,
  }), { loads:0, miles:0, gross:0, deductions:0, net:0 })
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Gross Pay',  value:`$${totals.gross.toLocaleString()}`,        color:'#38C770' },
          { label:'Total Deductions', value:`$${totals.deductions.toLocaleString()}`,   color:'#E53E3E' },
          { label:'Total Net Pay',    value:`$${totals.net.toLocaleString()}`,           color:'#4BAED4' },
          { label:'Drivers Paid',     value: data.length.toString(),                    color:'#8B5CF6' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="section-title">Driver Settlements</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Driver</th><th>Loads</th><th>Miles</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th></tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.driver}>
                  <td style={{ fontWeight:700 }}>{d.driver}</td>
                  <td>{d.loads}</td>
                  <td style={{ color:'#718096' }}>{d.miles.toLocaleString()}</td>
                  <td style={{ color:'#38C770', fontWeight:700 }}>${d.gross.toLocaleString()}</td>
                  <td style={{ color:'#E53E3E' }}>-${d.deductions.toLocaleString()}</td>
                  <td style={{ fontWeight:800, color:'#4BAED4', fontSize:14 }}>${d.net.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background:'#F4F6F9', fontWeight:800 }}>
                <td>TOTAL</td>
                <td>{totals.loads}</td>
                <td>{totals.miles.toLocaleString()}</td>
                <td style={{ color:'#38C770' }}>${totals.gross.toLocaleString()}</td>
                <td style={{ color:'#E53E3E' }}>-${totals.deductions.toLocaleString()}</td>
                <td style={{ color:'#4BAED4' }}>${totals.net.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

function FleetReport({ data }: { data: typeof FLEET_DATA }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Active Trucks',     value: data.filter(t=>t.status==='Active').length.toString(), color:'#38C770' },
          { label:'Total Fleet Miles', value: data.reduce((s,t)=>s+t.miles,0).toLocaleString(),     color:'#4BAED4' },
          { label:'Avg Utilization',   value:`${Math.round(data.reduce((s,t)=>s+t.util,0)/data.length)}%`, color:'#8B5CF6' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="section-title">Fleet Utilization</h3>
        {data.map(t => (
          <div key={t.unit} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div>
                <span style={{ fontWeight:700, fontSize:13 }}>{t.unit}</span>
                <span style={{ fontSize:12, color:'#718096', marginLeft:8 }}>{t.truck}</span>
                {t.status === 'Repair' && (
                  <span style={{ marginLeft:8, fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:6, background:'#FFF5F5', color:'#E53E3E' }}>In Repair</span>
                )}
              </div>
              <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#718096' }}>{t.miles.toLocaleString()} mi</span>
                <span style={{ fontSize:12, fontWeight:700, color:'#38C770' }}>${t.revenue.toLocaleString()}</span>
                <span style={{ fontWeight:800, color: t.util>=70?'#38C770':t.util>=50?'#F59E0B':'#E53E3E' }}>{t.util}%</span>
              </div>
            </div>
            <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden' }}>
              <div style={{ width:`${t.util}%`, height:'100%', borderRadius:99, background: t.util>=70?'#38C770':t.util>=50?'#F59E0B':'#E53E3E' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExpenseReport({ data }: { data: typeof EXPENSE_DATA }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'Total Expenses',   value:`$${data.total.toLocaleString()}`, color:'#E53E3E' },
          { label:'Largest Category', value:'Fuel (38%)',                       color:'#F59E0B' },
          { label:'Expense/Load',     value:`$${Math.round(data.total/28)}`,   color:'#718096' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="section-title">Expenses by Category</h3>
        {data.categories.map((c,i) => {
          const colors = ['#E53E3E','#4BAED4','#8B5CF6','#F59E0B','#38C770','#718096','#FC8181']
          return (
            <div key={c.cat} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontWeight:600, fontSize:13 }}>{c.cat}</span>
                <span style={{ fontWeight:700, color:colors[i] }}>${c.amount.toLocaleString()} <span style={{ color:'#A0AEC0', fontWeight:400 }}>({c.pct}%)</span></span>
              </div>
              <div style={{ background:'#E2E8F0', borderRadius:99, height:10, overflow:'hidden' }}>
                <div style={{ width:`${c.pct}%`, height:'100%', borderRadius:99, background:colors[i] }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DriverPerfReport({ data }: { data: typeof DRIVER_PERF_DATA }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div className="card">
        <h3 className="section-title">Driver Performance Summary</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Driver</th><th>Loads</th><th>Miles</th><th>On-Time %</th><th>RPM</th><th>Safety Score</th><th>Rating</th></tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.driver}>
                  <td style={{ fontWeight:700 }}>{d.driver}</td>
                  <td>{d.loads}</td>
                  <td style={{ color:'#718096' }}>{d.miles.toLocaleString()}</td>
                  <td><span style={{ fontWeight:700, color: d.onTime===100?'#38C770':d.onTime>=85?'#F59E0B':'#E53E3E' }}>{d.onTime}%</span></td>
                  <td style={{ color:'#4BAED4', fontWeight:600 }}>${d.rpm.toFixed(2)}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:6, width:60, overflow:'hidden' }}>
                        <div style={{ width:`${d.safety}%`, height:'100%', borderRadius:99, background: d.safety>=95?'#38C770':d.safety>=85?'#F59E0B':'#E53E3E' }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700 }}>{d.safety}</span>
                    </div>
                  </td>
                  <td style={{ color:'#F59E0B', fontWeight:700 }}>★ {d.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MaintenanceReport() {
  const [unitFilter, setUnitFilter] = useState<string>('All')
  const units = ['All', ...Array.from(new Set(MAINTENANCE_DATA.map(r => r.unit)))]
  const filtered = unitFilter === 'All' ? MAINTENANCE_DATA : MAINTENANCE_DATA.filter(r => r.unit === unitFilter)
  const totalCost = MAINTENANCE_DATA.reduce((s,r) => s + r.cost, 0)
  const overdue = MAINTENANCE_DATA.filter(r => r.status === 'Overdue').length
  const inShop  = MAINTENANCE_DATA.filter(r => r.status === 'In-Shop').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Maintenance Cost', value:`$${totalCost.toLocaleString()}`, color:'#F59E0B' },
          { label:'Records This Period',     value: MAINTENANCE_DATA.length.toString(),             color:'#4BAED4' },
          { label:'Units In-Shop',           value: inShop.toString(),              color:'#E53E3E' },
          { label:'Overdue Items',           value: overdue.toString(),             color: overdue > 0 ? '#E53E3E' : '#38C770' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 className="section-title" style={{ margin:0 }}>🔧 Service Records</h3>
          <div style={{ display:'flex', gap:6 }}>
            {units.map(u => (
              <button key={u} onClick={() => setUnitFilter(u)}
                style={{ padding:'4px 10px', borderRadius:6, border:'1.5px solid', fontSize:11, fontWeight:600, cursor:'pointer',
                  borderColor: unitFilter === u ? '#4BAED4' : '#E2E8F0',
                  background: unitFilter === u ? '#EBF8FF' : '#fff',
                  color: unitFilter === u ? '#2C7A9A' : '#718096',
                }}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Unit</th><th>Service Type</th><th>Date</th><th>Cost</th><th>Mechanic</th><th>Miles</th><th>Next Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((r,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700, color:'#4BAED4' }}>{r.unit}</td>
                  <td style={{ fontWeight:600 }}>{r.type}</td>
                  <td style={{ color:'#718096' }}>{r.date}</td>
                  <td style={{ fontWeight:700, color:'#F59E0B' }}>${r.cost.toLocaleString()}</td>
                  <td style={{ color:'#718096', fontSize:12 }}>{r.mech}</td>
                  <td style={{ color:'#A0AEC0' }}>{r.miles.toLocaleString()}</td>
                  <td style={{ color:'#718096' }}>{r.next}</td>
                  <td>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6,
                      background: r.status==='Done'?'#F0FFF4': r.status==='Overdue'?'#FFF5F5':'#FEF3C7',
                      color: r.status==='Done'?'#276749': r.status==='Overdue'?'#C53030':'#92400E',
                    }}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {overdue > 0 && (
          <div style={{ marginTop:12, padding:'10px 14px', background:'#FFF5F5', borderRadius:8, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16 }}>⚠️</span>
            <span style={{ fontSize:13, color:'#C53030', fontWeight:600 }}>{overdue} overdue service item(s) require attention</span>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadHistoryReport() {
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const statuses = ['All', 'Delivered', 'In Transit']
  const filtered = statusFilter === 'All' ? LOADS_DATA : LOADS_DATA.filter(l => l.status === statusFilter)
  const totalRev  = LOADS_DATA.reduce((s,l) => s + l.rate, 0)
  const avgRpm    = (LOADS_DATA.reduce((s,l) => s + l.rpm, 0) / LOADS_DATA.length).toFixed(2)
  const delivered = LOADS_DATA.filter(l => l.status === 'Delivered').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Loads',    value: LOADS_DATA.length.toString(),     color:'#4BAED4' },
          { label:'Total Revenue',  value:`$${totalRev.toLocaleString()}`,   color:'#38C770' },
          { label:'Avg RPM',        value:`$${avgRpm}`,                      color:'#8B5CF6' },
          { label:'Delivered',      value:`${delivered}/${LOADS_DATA.length}`, color:'#F59E0B' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 className="section-title" style={{ margin:0 }}>📦 Load History</h3>
          <div style={{ display:'flex', gap:6 }}>
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding:'4px 10px', borderRadius:6, border:'1.5px solid', fontSize:11, fontWeight:600, cursor:'pointer',
                  borderColor: statusFilter === s ? '#4BAED4' : '#E2E8F0',
                  background: statusFilter === s ? '#EBF8FF' : '#fff',
                  color: statusFilter === s ? '#2C7A9A' : '#718096',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Load ID</th><th>Date</th><th>Origin → Dest</th><th>Miles</th><th>Rate</th><th>RPM</th><th>Broker</th><th>Driver</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((l,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700, color:'#4BAED4', fontFamily:'monospace', fontSize:12 }}>{l.id}</td>
                  <td style={{ color:'#718096', fontSize:12 }}>{l.date}</td>
                  <td style={{ fontWeight:600, fontSize:12 }}>{l.from} → {l.to}</td>
                  <td style={{ color:'#718096' }}>{l.miles.toLocaleString()}</td>
                  <td style={{ fontWeight:700, color:'#38C770' }}>${l.rate.toLocaleString()}</td>
                  <td style={{ fontWeight:700, color:'#8B5CF6' }}>${l.rpm.toFixed(2)}</td>
                  <td style={{ fontSize:12 }}>{l.broker}</td>
                  <td style={{ fontSize:12 }}>{l.driver}</td>
                  <td>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6,
                      background: l.status==='Delivered'?'#F0FFF4':'#EBF8FF',
                      color: l.status==='Delivered'?'#276749':'#2C7A9A',
                    }}>{l.status}</span>
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

function BrokerPaymentsReport() {
  const totalPaid    = BROKER_PAYMENTS_DATA.filter(r => r.status === 'Paid').reduce((s,r) => s + r.amount, 0)
  const totalPending = BROKER_PAYMENTS_DATA.filter(r => r.status === 'Pending').reduce((s,r) => s + r.amount, 0)
  const overdueCnt   = BROKER_PAYMENTS_DATA.filter(r => r.status === 'Overdue').length
  const avgDays      = Math.round(BROKER_PAYMENTS_DATA.filter(r => r.status === 'Paid').reduce((s,r) => s + r.days, 0) / BROKER_PAYMENTS_DATA.filter(r => r.status === 'Paid').length)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Paid',        value:`$${totalPaid.toLocaleString()}`,    color:'#38C770' },
          { label:'Pending Payment',   value:`$${totalPending.toLocaleString()}`, color:'#F59E0B' },
          { label:'Overdue Invoices',  value: overdueCnt.toString(),              color: overdueCnt > 0 ? '#E53E3E' : '#38C770' },
          { label:'Avg Days to Pay',   value:`${avgDays}d`,                       color:'#4BAED4' },
        ].map(s => (
          <div key={s.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="section-title" style={{ marginBottom:14 }}>🤝 Broker Payment History</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Broker</th><th>Invoice</th><th>Amount</th><th>Issued</th><th>Paid</th><th>Days</th><th>Method</th><th>Status</th></tr>
            </thead>
            <tbody>
              {BROKER_PAYMENTS_DATA.map((r,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700 }}>{r.broker}</td>
                  <td style={{ fontFamily:'monospace', fontSize:12, color:'#718096' }}>{r.invoice}</td>
                  <td style={{ fontWeight:700, color:'#38C770' }}>${r.amount.toLocaleString()}</td>
                  <td style={{ color:'#718096', fontSize:12 }}>{r.issued}</td>
                  <td style={{ color:'#718096', fontSize:12 }}>{r.paid ?? '—'}</td>
                  <td>
                    <span style={{ fontWeight:700, color: r.days <= 14 ? '#38C770' : r.days <= 28 ? '#F59E0B' : '#E53E3E' }}>
                      {r.days}d
                    </span>
                  </td>
                  <td style={{ fontSize:12 }}>{r.method}</td>
                  <td>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6,
                      background: r.status==='Paid'?'#F0FFF4': r.status==='Pending'?'#EBF8FF':'#FFF5F5',
                      color: r.status==='Paid'?'#276749': r.status==='Pending'?'#2C7A9A':'#C53030',
                    }}>{r.status}</span>
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

function TaxSummaryReport() {
  const d = TAX_SUMMARY_DATA
  const totalDeductions = d.deductions.reduce((s,x) => s + x.amount, 0)
  const taxableIncome   = d.grossRevenue - totalDeductions
  const estimatedTax    = Math.round(taxableIncome * d.estimatedTaxRate / 100)
  const balanceDue      = estimatedTax - d.ytdPayments

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ background:'linear-gradient(135deg,#1A2535,#2D3748)', borderRadius:14, padding:'20px 24px', color:'#fff' }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:4 }}>Tax Year {d.year} — Estimated Summary</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:12 }}>
          {[
            { label:'Gross Revenue',   value:`$${d.grossRevenue.toLocaleString()}`,  color:'#4BAED4' },
            { label:'Total Deductions',value:`$${totalDeductions.toLocaleString()}`, color:'#38C770' },
            { label:'Taxable Income',  value:`$${taxableIncome.toLocaleString()}`,   color:'#F59E0B' },
            { label:'Est. Tax (21%)',  value:`$${estimatedTax.toLocaleString()}`,    color:'#EF4444' },
            { label:'YTD Payments',    value:`$${d.ytdPayments.toLocaleString()}`,   color:'#A78BFA' },
            { label:'Balance Due',     value:`$${balanceDue.toLocaleString()}`,      color: balanceDue > 0 ? '#EF4444' : '#38C770' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:900, color:s.color, marginTop:2 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div className="card">
          <h3 className="section-title" style={{ marginBottom:12 }}>Deductions Breakdown</h3>
          {d.deductions.map((x,i) => {
            const colors = ['#EF4444','#4BAED4','#8B5CF6','#F59E0B','#38C770','#718096','#A78BFA','#FC8181']
            const pct = Math.round((x.amount / d.grossRevenue) * 100)
            return (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>{x.cat}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:colors[i] }}>${x.amount.toLocaleString()} ({pct}%)</span>
                </div>
                <div style={{ background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:colors[i] }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="card">
          <h3 className="section-title" style={{ marginBottom:12 }}>📅 Quarterly Payment Schedule</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {d.schedule.map(q => (
              <div key={q.quarter} style={{
                padding:'12px 14px', borderRadius:10,
                background: q.status==='Paid'?'#F0FFF4': q.status==='Due'?'#FFF5F5':'#F7FAFC',
                border:`1.5px solid ${q.status==='Paid'?'#C6F6D5': q.status==='Due'?'#FEB2B2':'#E2E8F0'}`,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{q.quarter} Estimated Tax</div>
                    <div style={{ fontSize:11, color:'#718096', marginTop:2 }}>Due {q.dueDate}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16, fontWeight:900, color: q.status==='Paid'?'#276749': q.status==='Due'?'#C53030':'#718096' }}>${q.amount.toLocaleString()}</div>
                    <div style={{ fontSize:10, fontWeight:700, marginTop:2,
                      color: q.status==='Paid'?'#276749': q.status==='Due'?'#C53030':'#A0AEC0' }}>
                      {q.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, padding:'10px 14px', background:'#EBF8FF', borderRadius:8 }}>
            <div style={{ fontSize:12, color:'#2C7A9A' }}>⚠️ Consult a tax professional. These are estimates only.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Scheduled Reports Modal ──────────────────────────────────────────────────

function ScheduledReportsModal({ onClose }: { onClose: () => void }) {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(SCHEDULED_REPORTS)

  function toggleEnabled(id: string) {
    setSchedules(p => p.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const freqBadge = (f: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      weekly: { bg:'#EBF8FF', color:'#2C7A9A' },
      monthly: { bg:'#F0FFF4', color:'#276749' },
      quarterly: { bg:'#FAF5FF', color:'#553C9A' },
    }
    return map[f] ?? { bg:'#F4F6F9', color:'#718096' }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:560, maxWidth:'95vw', boxShadow:'0 16px 48px rgba(0,0,0,.2)', maxHeight:'80vh', overflow:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:18 }}>📅 Scheduled Reports</div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#718096' }}>✕</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
          {schedules.map(s => {
            const def = REPORT_DEFS.find(r => r.id === s.reportId)
            const fb = freqBadge(s.frequency)
            return (
              <div key={s.id} style={{ padding:'14px 16px', borderRadius:12, background:'#F7FAFC', border:'1.5px solid #E2E8F0', display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:22 }}>{def?.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{def?.title}</div>
                  <div style={{ fontSize:12, color:'#718096', marginTop:2 }}>
                    Next: {s.nextRun} · To: {s.email}
                  </div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:99, background:fb.bg, color:fb.color }}>
                  {s.frequency}
                </span>
                <button
                  onClick={() => toggleEnabled(s.id)}
                  style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid', fontSize:12, fontWeight:700, cursor:'pointer',
                    borderColor: s.enabled ? '#38C770' : '#E2E8F0',
                    background: s.enabled ? '#F0FFF4' : '#fff',
                    color: s.enabled ? '#276749' : '#718096',
                  }}
                >{s.enabled ? '✓ Active' : 'Paused'}</button>
              </div>
            )
          })}
        </div>

        <div style={{ padding:'14px 16px', borderRadius:12, border:'2px dashed #E2E8F0', textAlign:'center', cursor:'pointer', color:'#718096', fontSize:13, fontWeight:600 }}>
          + Add Scheduled Report
        </div>

        <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:'#4BAED4', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Email Export Modal ───────────────────────────────────────────────────────

function EmailExportModal({ reportTitle, onClose }: { reportTitle: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [fmt, setFmt] = useState<'pdf' | 'excel'>('pdf')
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!email) return
    setSent(true)
    setTimeout(() => { onClose() }, 2000)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width:400, maxWidth:'95vw', boxShadow:'0 16px 48px rgba(0,0,0,.2)' }}>
        <div style={{ fontWeight:800, fontSize:17, marginBottom:6 }}>📧 Email Report</div>
        <div style={{ fontSize:12, color:'#A0AEC0', marginBottom:20 }}>{reportTitle}</div>

        {sent ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <div style={{ fontSize:48, marginBottom:10 }}>✅</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#276749' }}>Report sent to {email}</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#718096', display:'block', marginBottom:4 }}>Recipient Email</label>
              <input
                value={email} onChange={e => setEmail(e.target.value)} type="email"
                placeholder="you@company.com"
                style={{ width:'100%', border:'1.5px solid #E2E8F0', borderRadius:8, padding:'9px 12px', fontSize:13, boxSizing:'border-box' }}
              />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'#718096', display:'block', marginBottom:8 }}>Format</label>
              <div style={{ display:'flex', gap:8 }}>
                {(['pdf','excel'] as const).map(f => (
                  <button key={f} onClick={() => setFmt(f)} style={{
                    flex:1, padding:'8px 0', borderRadius:8, border:'1.5px solid',
                    borderColor: fmt===f ? '#4BAED4' : '#E2E8F0',
                    background: fmt===f ? '#EBF8FF' : '#fff',
                    color: fmt===f ? '#2C7A9A' : '#718096',
                    fontWeight:700, fontSize:13, cursor:'pointer',
                  }}>
                    {f === 'pdf' ? '📄 PDF' : '📊 Excel'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:8, border:'1.5px solid #E2E8F0', background:'#fff', fontSize:13, cursor:'pointer' }}>Cancel</button>
              <button onClick={handleSend} style={{ padding:'9px 18px', borderRadius:8, border:'none', background:'#4BAED4', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Send Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [selected,        setSelected]        = useState<ReportType | null>(null)
  const [period,          setPeriod]          = useState<Period>('this-month')
  const [catFilter,       setCatFilter]       = useState<'all' | 'financial' | 'operations' | 'compliance'>('all')
  const [generated,       setGenerated]       = useState(false)
  const [generating,      setGenerating]      = useState(false)
  const [progress,        setProgress]        = useState(0)
  const [showScheduled,   setShowScheduled]   = useState(false)
  const [showEmailExport, setShowEmailExport] = useState(false)

  const visibleDefs = catFilter === 'all'
    ? REPORT_DEFS
    : REPORT_DEFS.filter(r => r.category === catFilter)

  function handleGenerate() {
    setGenerating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95 }
        return p + Math.round(Math.random() * 18 + 8)
      })
    }, 120)
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => { setGenerating(false); setGenerated(true) }, 200)
    }, 900)
  }

  const selectedDef = REPORT_DEFS.find(r => r.id === selected)
  const maxBar = Math.max(...REVENUE_DATA.byMonth.map(m => m.revenue))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'#1A2535', margin:0 }}>📊 Reports Center</h2>
          <div style={{ fontSize:13, color:'#A0AEC0', marginTop:2 }}>Generate, preview, and export business reports</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowScheduled(true)}>📅 Schedule Reports</button>
          {generated && selected && (
            <button className="btn btn-secondary btn-sm" onClick={() => setShowEmailExport(true)}>📧 Email Report</button>
          )}
        </div>
      </div>

      {/* Period selector */}
      <div className="card" style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:12, fontWeight:600, color:'#718096' }}>Period:</span>
          {PERIODS.map(p => (
            <button key={p.key} className={`btn btn-sm ${period===p.key?'btn-primary':'btn-ghost'}`}
              onClick={() => { setPeriod(p.key); setGenerated(false) }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>

        {/* Left: Report picker */}
        <div style={{ width:320, flexShrink:0, display:'flex', flexDirection:'column', gap:10 }}>

          {/* Category filter */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {(['all','financial','operations','compliance'] as const).map(c => (
              <button key={c} className={`btn btn-sm ${catFilter===c?'btn-primary':'btn-ghost'}`}
                onClick={() => setCatFilter(c)}>
                {c==='all'?'All':c.charAt(0).toUpperCase()+c.slice(1)}
              </button>
            ))}
          </div>

          {/* Report cards */}
          {visibleDefs.map(r => (
            <div key={r.id}
              className="card"
              style={{
                padding:'12px 14px', cursor:'pointer',
                borderLeft:`4px solid ${selected===r.id ? r.color : '#E2E8F0'}`,
                boxShadow: selected===r.id ? `0 0 0 2px ${r.color}22, 0 4px 16px rgba(0,0,0,.06)` : undefined,
                background: selected===r.id ? '#FAFBFF' : '#fff',
              }}
              onClick={() => { setSelected(r.id); setGenerated(false) }}
            >
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:22 }}>{r.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginBottom:2 }}>{r.title}</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', lineHeight:1.4 }}>{r.desc}</div>
                  <span style={{
                    display:'inline-block', marginTop:5,
                    fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                    background: r.category==='financial'?'#F0FFF4':r.category==='compliance'?'#EBF8FF':'#F4F6F9',
                    color:      r.category==='financial'?'#276749':r.category==='compliance'?'#2C7A9A':'#4A5568',
                  }}>
                    {r.category}
                  </span>
                </div>
                {selected===r.id && <span style={{ color:r.color, fontSize:18 }}>●</span>}
              </div>
            </div>
          ))}

          {/* Scheduled reports summary */}
          <div className="card" style={{ padding:'12px 14px', cursor:'pointer' }} onClick={() => setShowScheduled(true)}>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:20 }}>📅</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#2D3748' }}>Scheduled Reports</div>
                <div style={{ fontSize:11, color:'#A0AEC0' }}>
                  {SCHEDULED_REPORTS.filter(r => r.enabled).length} active schedules
                </div>
              </div>
              <span style={{ fontSize:12, color:'#4BAED4', fontWeight:700 }}>Manage →</span>
            </div>
          </div>
        </div>

        {/* Right: Preview panel */}
        <div style={{ flex:1, minWidth:0 }}>
          {!selected && (
            <div className="card" style={{ textAlign:'center', padding:'80px 40px', color:'#A0AEC0' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>📊</div>
              <div style={{ fontSize:17, fontWeight:700, color:'#2D3748', marginBottom:8 }}>Select a report to preview</div>
              <div style={{ fontSize:13 }}>Choose from the list on the left to generate a report</div>
              <div style={{ marginTop:24, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                {REPORT_DEFS.slice(0,4).map(r => (
                  <button key={r.id} onClick={() => setSelected(r.id)}
                    style={{ padding:'8px 14px', borderRadius:10, border:`1.5px solid ${r.color}33`, background:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, color: r.color }}>
                    {r.icon} {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Report header */}
              <div className="card" style={{ padding:'16px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ fontSize:17, fontWeight:800, color:'#1A2535' }}>
                      {selectedDef?.icon} {selectedDef?.title}
                    </div>
                    <div style={{ fontSize:12, color:'#A0AEC0', marginTop:2 }}>
                      {PERIODS.find(p=>p.key===period)?.label} · Generated {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button
                      className={`btn btn-sm ${generating ? 'btn-ghost' : 'btn-primary'}`}
                      onClick={handleGenerate}
                      disabled={generating}
                    >
                      {generating ? '⏳ Generating...' : generated ? '🔄 Regenerate' : '⚡ Generate Report'}
                    </button>
                    {generated && (
                      <>
                        <button className="btn btn-secondary btn-sm">📄 Export PDF</button>
                        <button className="btn btn-ghost btn-sm">📊 Export Excel</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowEmailExport(true)}>📧 Email</button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Report content */}
              {!generated && !generating && (
                <div className="card" style={{ textAlign:'center', padding:'60px 40px', color:'#A0AEC0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>⚡</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'#4A5568', marginBottom:6 }}>Ready to generate</div>
                  <div style={{ fontSize:13 }}>Click "Generate Report" to preview your data</div>
                </div>
              )}

              {generating && (
                <div className="card" style={{ textAlign:'center', padding:'60px 40px' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
                  <div style={{ fontSize:15, fontWeight:600, color:'#4A5568', marginBottom:4 }}>Compiling report data...</div>
                  <div style={{ fontSize:13, color:'#A0AEC0', marginBottom:16 }}>Fetching records for {PERIODS.find(p=>p.key===period)?.label}</div>
                  <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden', maxWidth:340, margin:'0 auto' }}>
                    <div style={{
                      width:`${Math.min(progress, 100)}%`, height:'100%', borderRadius:99,
                      background:'linear-gradient(90deg,#4BAED4,#38C770)',
                      transition:'width .15s ease',
                    }} />
                  </div>
                  <div style={{ fontSize:12, color:'#A0AEC0', marginTop:8 }}>{Math.min(progress, 100)}%</div>
                </div>
              )}

              {generated && selected === 'revenue'          && <RevenueReport data={REVENUE_DATA} maxBar={maxBar} />}
              {generated && selected === 'ifta'             && <IftaReport data={IFTA_DATA} />}
              {generated && selected === 'payroll'          && <PayrollReport data={PAYROLL_DATA} />}
              {generated && selected === 'fleet'            && <FleetReport data={FLEET_DATA} />}
              {generated && selected === 'expenses'         && <ExpenseReport data={EXPENSE_DATA} />}
              {generated && selected === 'driver-perf'      && <DriverPerfReport data={DRIVER_PERF_DATA} />}
              {generated && selected === 'maintenance'      && <MaintenanceReport />}
              {generated && selected === 'loads'            && <LoadHistoryReport />}
              {generated && selected === 'broker-payments'  && <BrokerPaymentsReport />}
              {generated && selected === 'tax-summary'      && <TaxSummaryReport />}
            </div>
          )}
        </div>
      </div>

      {showScheduled   && <ScheduledReportsModal onClose={() => setShowScheduled(false)} />}
      {showEmailExport && selectedDef && (
        <EmailExportModal reportTitle={selectedDef.title} onClose={() => setShowEmailExport(false)} />
      )}
    </div>
  )
}
