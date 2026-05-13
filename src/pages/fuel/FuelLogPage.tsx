import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type CardType = 'EFS' | 'Comdata' | 'FleetOne' | 'Cash' | 'WEX'

interface FuelEntry {
  id: string
  date: string
  location: string
  state: string
  truck: string
  driver: string
  gallons: number
  pricePerGal: number
  total: number
  odometer: number
  cardType: CardType
  receiptAttached: boolean
  mpg?: number
  notes?: string
}

interface FuelAdvance {
  id: string
  driver: string
  truck: string
  date: string
  requested: number
  approved: number
  used: number
  status: 'pending' | 'approved' | 'settled' | 'declined'
  load: string
  notes?: string
}

interface TruckMpgRecord {
  truck: string
  driver: string
  mpgHistory: number[]
  avgMpg: number
  trend: 'up' | 'down' | 'stable'
  totalMiles: number
  totalGallons: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ENTRIES: FuelEntry[] = [
  { id:'F-001', date:'May 10', location:"Pilot Flying J, Memphis TN",     state:'TN', truck:'Unit 01', driver:'James Carter',   gallons:142, pricePerGal:3.82, total:542.44, odometer:498210, cardType:'EFS',      receiptAttached:true,  mpg:6.8 },
  { id:'F-002', date:'May 9',  location:"Love's Travel Stop, Dallas TX",  state:'TX', truck:'Unit 02', driver:'Mike Rodriguez', gallons:135, pricePerGal:3.71, total:500.85, odometer:312480, cardType:'Comdata',  receiptAttached:true,  mpg:6.5 },
  { id:'F-003', date:'May 8',  location:"TA Petro, Atlanta GA",           state:'GA', truck:'Unit 03', driver:'Anna Perez',     gallons:128, pricePerGal:3.94, total:504.32, odometer:227630, cardType:'FleetOne', receiptAttached:false, mpg:7.1 },
  { id:'F-004', date:'May 7',  location:"Pilot, Kansas City MO",          state:'MO', truck:'Unit 04', driver:'Tony Marshall',  gallons:151, pricePerGal:3.78, total:570.78, odometer:189450, cardType:'EFS',      receiptAttached:true,  mpg:6.2 },
  { id:'F-005', date:'May 6',  location:"Flying J, Sacramento CA",        state:'CA', truck:'Unit 05', driver:'Sara Kim',       gallons:119, pricePerGal:4.52, total:537.88, odometer:445120, cardType:'WEX',      receiptAttached:true,  mpg:7.3 },
  { id:'F-006', date:'May 5',  location:"Love's, Oklahoma City OK",       state:'OK', truck:'Unit 01', driver:'James Carter',   gallons:138, pricePerGal:3.61, total:498.18, odometer:497243, cardType:'EFS',      receiptAttached:true,  mpg:6.9 },
  { id:'F-007', date:'May 4',  location:"Pilot Flying J, Denver CO",      state:'CO', truck:'Unit 02', driver:'Mike Rodriguez', gallons:144, pricePerGal:3.89, total:560.16, odometer:311532, cardType:'Comdata',  receiptAttached:false, mpg:6.4 },
  { id:'F-008', date:'May 3',  location:"TA, Phoenix AZ",                 state:'AZ', truck:'Unit 03', driver:'Anna Perez',     gallons:126, pricePerGal:4.11, total:517.86, odometer:226720, cardType:'Cash',     receiptAttached:false, mpg:7.0 },
  { id:'F-009', date:'May 2',  location:"Petro, St. Louis MO",            state:'MO', truck:'Unit 04', driver:'Tony Marshall',  gallons:147, pricePerGal:3.74, total:549.78, odometer:188300, cardType:'EFS',      receiptAttached:true,  mpg:6.1 },
  { id:'F-010', date:'May 1',  location:"Flying J, Las Vegas NV",         state:'NV', truck:'Unit 05', driver:'Sara Kim',       gallons:122, pricePerGal:4.23, total:515.46, odometer:444200, cardType:'WEX',      receiptAttached:true,  mpg:7.2 },
  { id:'F-011', date:'Apr 29', location:"Pilot, Chicago IL",              state:'IL', truck:'Unit 01', driver:'James Carter',   gallons:136, pricePerGal:3.91, total:531.76, odometer:496380, cardType:'EFS',      receiptAttached:true,  mpg:6.7 },
  { id:'F-012', date:'Apr 28', location:"Love's, Albuquerque NM",         state:'NM', truck:'Unit 02', driver:'Mike Rodriguez', gallons:140, pricePerGal:3.68, total:515.20, odometer:310600, cardType:'Comdata',  receiptAttached:true,  mpg:6.6 },
]

const STATE_TAX: Record<string, number> = {
  TN:0.2190, TX:0.2000, GA:0.3190, MO:0.1950, CA:0.6950, OK:0.1900,
  CO:0.2050, AZ:0.1800, NV:0.2700, IL:0.4610, NM:0.2100, FL:0.3430,
}

const IFTA_DATA = [
  { state:'TX', miles:3420, gallons:524, taxRate:0.200, taxOwed:104.80 },
  { state:'OK', miles:1280, gallons:138, taxRate:0.190, taxOwed:26.22  },
  { state:'NM', miles:890,  gallons:140, taxRate:0.210, taxOwed:29.40  },
  { state:'AZ', miles:1650, gallons:252, taxRate:0.180, taxOwed:45.36  },
  { state:'CA', miles:2100, gallons:241, taxRate:0.695, taxOwed:167.50 },
  { state:'NV', miles:980,  gallons:122, taxRate:0.270, taxOwed:32.94  },
  { state:'CO', miles:1560, gallons:288, taxRate:0.205, taxOwed:59.04  },
  { state:'MO', miles:2240, gallons:298, taxRate:0.195, taxOwed:58.11  },
  { state:'IL', miles:1820, gallons:272, taxRate:0.461, taxOwed:125.39 },
]

const MONTHLY_SPEND = [
  { month:'Dec', spend:9820  },
  { month:'Jan', spend:10450 },
  { month:'Feb', spend:9180  },
  { month:'Mar', spend:11200 },
  { month:'Apr', spend:10880 },
  { month:'May', spend:5640  },
]

const TRUCK_MPG: TruckMpgRecord[] = [
  { truck:'Unit 01', driver:'James Carter',   mpgHistory:[6.5,6.8,6.9,6.7,6.9,6.8], avgMpg:6.77, trend:'stable', totalMiles:12480, totalGallons:1843 },
  { truck:'Unit 02', driver:'Mike Rodriguez', mpgHistory:[6.8,6.5,6.4,6.5,6.6,6.5], avgMpg:6.55, trend:'down',   totalMiles:11220, totalGallons:1712 },
  { truck:'Unit 03', driver:'Anna Perez',     mpgHistory:[6.8,7.0,7.0,7.1,7.0,7.1], avgMpg:7.00, trend:'up',     totalMiles:13440, totalGallons:1920 },
  { truck:'Unit 04', driver:'Tony Marshall',  mpgHistory:[6.4,6.2,6.1,6.3,6.1,6.2], avgMpg:6.22, trend:'down',   totalMiles:9840,  totalGallons:1581 },
  { truck:'Unit 05', driver:'Sara Kim',       mpgHistory:[7.1,7.2,7.2,7.3,7.2,7.3], avgMpg:7.22, trend:'up',     totalMiles:14580, totalGallons:2019 },
]

const ADVANCES: FuelAdvance[] = [
  { id:'ADV-001', driver:'James Carter',   truck:'Unit 01', date:'May 10', requested:400, approved:400, used:380, status:'settled',  load:'LD-2241', notes:'Memphis to Chicago run' },
  { id:'ADV-002', driver:'Mike Rodriguez', truck:'Unit 02', date:'May 9',  requested:500, approved:450, used:420, status:'settled',  load:'LD-2238' },
  { id:'ADV-003', driver:'Anna Perez',     truck:'Unit 03', date:'May 8',  requested:350, approved:350, used:0,   status:'approved', load:'LD-2249', notes:'Atlanta haul' },
  { id:'ADV-004', driver:'Tony Marshall',  truck:'Unit 04', date:'May 7',  requested:600, approved:0,   used:0,   status:'pending',  load:'LD-2251' },
  { id:'ADV-005', driver:'Sara Kim',       truck:'Unit 05', date:'May 6',  requested:450, approved:450, used:450, status:'settled',  load:'LD-2235' },
  { id:'ADV-006', driver:'Mike Rodriguez', truck:'Unit 02', date:'May 4',  requested:300, approved:0,   used:0,   status:'declined', load:'LD-2228', notes:'Rejected — credit limit' },
]

const CHEAPEST_STATES = [
  { state:'OK', avg:3.61, rank:1 },
  { state:'TX', avg:3.71, rank:2 },
  { state:'NM', avg:3.68, rank:3 },
  { state:'MO', avg:3.74, rank:4 },
  { state:'CO', avg:3.89, rank:5 },
  { state:'IL', avg:3.91, rank:6 },
  { state:'AZ', avg:4.11, rank:7 },
  { state:'NV', avg:4.23, rank:8 },
  { state:'CA', avg:4.52, rank:9 },
]

const CARD_BREAKDOWN: { type: CardType; count: number; total: number; color: string }[] = [
  { type:'EFS',      count:5, total:2643.14, color:'#4BAED4' },
  { type:'Comdata',  count:3, total:1576.21, color:'#38C770' },
  { type:'WEX',      count:2, total:1053.34, color:'#9B59B6' },
  { type:'FleetOne', count:1, total:504.32,  color:'#F59E0B' },
  { type:'Cash',     count:1, total:517.86,  color:'#E53E3E' },
]

const QUARTERS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025']

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FuelLogPage() {
  const [tab,           setTab]           = useState<'log' | 'stats' | 'ifta' | 'advances'>('log')
  const [selectedEntry, setSelectedEntry] = useState<FuelEntry | null>(null)
  const [truckFilter,   setTruckFilter]   = useState<string>('all')
  const [stateFilter,   setStateFilter]   = useState<string>('all')
  const [cardFilter,    setCardFilter]    = useState<string>('all')
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [selectedQ,     setSelectedQ]     = useState('Q2 2025')
  const [selectedAdv,   setSelectedAdv]   = useState<FuelAdvance | null>(null)
  const [showAdvModal,  setShowAdvModal]  = useState(false)

  const filtered = ENTRIES.filter(e => {
    if (truckFilter !== 'all' && e.truck    !== truckFilter) return false
    if (stateFilter !== 'all' && e.state    !== stateFilter) return false
    if (cardFilter  !== 'all' && e.cardType !== cardFilter)  return false
    return true
  })

  const totalGallons = ENTRIES.reduce((s,e) => s + e.gallons, 0)
  const totalSpend   = ENTRIES.reduce((s,e) => s + e.total, 0)
  const avgPrice     = totalSpend / totalGallons
  const fleetAvgMpg  = TRUCK_MPG.reduce((s,t) => s + t.avgMpg, 0) / TRUCK_MPG.length
  const pendingAdv   = ADVANCES.filter(a => a.status === 'pending').length
  const missingRcpts = ENTRIES.filter(e => !e.receiptAttached).length

  const trucks = ['all', ...Array.from(new Set(ENTRIES.map(e => e.truck)))]
  const states = ['all', ...Array.from(new Set(ENTRIES.map(e => e.state))).sort()]
  const cards  = ['all', 'EFS', 'Comdata', 'FleetOne', 'Cash', 'WEX']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:0 }}>
        <button className={`tab-btn ${tab==='log'?'active':''}`}      onClick={()=>setTab('log')}>⛽ Fuel Log</button>
        <button className={`tab-btn ${tab==='stats'?'active':''}`}    onClick={()=>setTab('stats')}>📊 Analytics</button>
        <button className={`tab-btn ${tab==='ifta'?'active':''}`}     onClick={()=>setTab('ifta')}>📋 IFTA Report</button>
        <button className={`tab-btn ${tab==='advances'?'active':''}`} onClick={()=>setTab('advances')}>
          💳 Advances
          {pendingAdv > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{pendingAdv}</span>}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total Spend (MTD)',   value:`$${totalSpend.toLocaleString('en-US',{maximumFractionDigits:0})}`, color:'#E53E3E', icon:'💸' },
          { label:'Avg $/Gallon',        value:`$${avgPrice.toFixed(2)}`,                                           color:'#F59E0B', icon:'⛽' },
          { label:'Fleet Avg MPG',       value:`${fleetAvgMpg.toFixed(1)} mpg`,                                    color:'#38C770', icon:'🚛' },
          { label:'Missing Receipts',    value: missingRcpts > 0 ? `${missingRcpts} entries` : 'All attached',     color: missingRcpts>0?'#F59E0B':'#38C770', icon:'📎' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
            </div>
            <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Missing receipts alert */}
      {missingRcpts > 0 && tab === 'log' && (
        <div style={{ background:'#FFFBF0', border:'1px solid #F6AD55', borderRadius:10,
          padding:'10px 16px', display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:18 }}>📎</span>
          <div style={{ flex:1, fontSize:13, color:'#744210' }}>
            <strong>{missingRcpts} fuel entries</strong> are missing receipt attachments — required for IFTA audit compliance.
          </div>
          <button className="btn btn-sm" style={{ background:'#F59E0B', color:'#fff', border:'none', flexShrink:0 }}>
            Attach Now
          </button>
        </div>
      )}

      {/* ── FUEL LOG TAB ── */}
      {tab === 'log' && (
        <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="card" style={{ padding:'12px 16px', marginBottom:14 }}>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                <select className="input select" style={{ padding:'5px 10px', fontSize:12, height:32 }}
                  value={truckFilter} onChange={e=>setTruckFilter(e.target.value)}>
                  {trucks.map(t => <option key={t} value={t}>{t==='all'?'All Trucks':t}</option>)}
                </select>
                <select className="input select" style={{ padding:'5px 10px', fontSize:12, height:32 }}
                  value={stateFilter} onChange={e=>setStateFilter(e.target.value)}>
                  {states.map(s => <option key={s} value={s}>{s==='all'?'All States':s}</option>)}
                </select>
                <select className="input select" style={{ padding:'5px 10px', fontSize:12, height:32 }}
                  value={cardFilter} onChange={e=>setCardFilter(e.target.value)}>
                  {cards.map(c => <option key={c} value={c}>{c==='all'?'All Cards':c}</option>)}
                </select>
                <span style={{ fontSize:12, color:'#A0AEC0', marginLeft:4 }}>{filtered.length} entries</span>
                <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }}
                  onClick={()=>setShowAddModal(true)}>
                  + Log Fuel
                </button>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map(e => (
                <FuelEntryRow
                  key={e.id}
                  entry={e}
                  selected={selectedEntry?.id === e.id}
                  onClick={()=>setSelectedEntry(selectedEntry?.id===e.id ? null : e)}
                />
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:60, color:'#A0AEC0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>⛽</div>
                  <div style={{ fontWeight:600 }}>No entries match filters</div>
                </div>
              )}
            </div>
          </div>

          {selectedEntry && (
            <div style={{ width:360, flexShrink:0 }}>
              <FuelEntryDetail entry={selectedEntry} onClose={()=>setSelectedEntry(null)} />
            </div>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'stats' && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

          <div className="card">
            <h3 className="section-title">Monthly Fuel Spend</h3>
            <MonthlyCostChart data={MONTHLY_SPEND} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div className="card">
              <h3 className="section-title">Fuel Efficiency by Truck</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[...TRUCK_MPG].sort((a,b) => b.avgMpg - a.avgMpg).map(t => {
                  const pct = ((t.avgMpg - 5.5) / (8.0 - 5.5)) * 100
                  const clr = t.avgMpg >= 7.0 ? '#38C770' : t.avgMpg >= 6.5 ? '#F59E0B' : '#E53E3E'
                  return (
                    <div key={t.truck}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <div>
                          <span style={{ fontWeight:700, fontSize:12 }}>{t.truck}</span>
                          <span style={{ fontSize:11, color:'#A0AEC0', marginLeft:8 }}>{t.driver}</span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontWeight:900, fontSize:14, color:clr }}>{t.avgMpg.toFixed(1)}</span>
                          <span style={{ fontSize:11, color:'#A0AEC0' }}>mpg</span>
                          <span style={{ fontSize:12 }}>{t.trend==='up'?'📈':t.trend==='down'?'📉':'➡️'}</span>
                        </div>
                      </div>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden' }}>
                        <div style={{ width:`${Math.max(0,Math.min(100,pct))}%`, height:'100%', borderRadius:99, background:clr, transition:'width .4s' }} />
                      </div>
                      <MpgSparkline data={t.mpgHistory} color={clr} />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Spend by Card Type</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {CARD_BREAKDOWN.map(c => {
                  const pct = (c.total / totalSpend) * 100
                  return (
                    <div key={c.type}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:c.color }} />
                          <span style={{ fontWeight:700, fontSize:12 }}>{c.type}</span>
                          <span style={{ fontSize:11, color:'#A0AEC0' }}>{c.count} fill{c.count>1?'s':''}</span>
                        </div>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <span style={{ fontSize:11, color:'#A0AEC0' }}>{pct.toFixed(0)}%</span>
                          <span style={{ fontWeight:700, fontSize:13 }}>${c.total.toLocaleString('en-US',{maximumFractionDigits:0})}</span>
                        </div>
                      </div>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:c.color }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ borderTop:'1px solid var(--c-divider)', paddingTop:10, marginTop:4,
                  display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'#718096', fontWeight:600 }}>Total MTD</span>
                  <span style={{ fontWeight:900, color:'#2D3748' }}>${totalSpend.toLocaleString('en-US',{maximumFractionDigits:0})}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div className="card">
              <h3 className="section-title">Fuel Price by State</h3>
              <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:12 }}>Avg $/gallon at your stops this month</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {CHEAPEST_STATES.map((s, idx) => {
                  const pct = ((s.avg - 3.5) / (5.0 - 3.5)) * 100
                  const clr = idx === 0 ? '#38C770' : idx <= 2 ? '#4BAED4' : idx <= 5 ? '#F59E0B' : '#E53E3E'
                  return (
                    <div key={s.state} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:24, height:24, borderRadius:6,
                        background: idx===0?'#38C770':'#F4F6F9',
                        color: idx===0?'#fff':'#718096',
                        fontSize:11, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {s.rank}
                      </div>
                      <div style={{ width:28, fontWeight:700, fontSize:12, color:'#2D3748' }}>{s.state}</div>
                      <div style={{ flex:1, background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:clr }} />
                      </div>
                      <div style={{ fontWeight:700, fontSize:13, width:44, textAlign:'right', color:clr }}>${s.avg.toFixed(2)}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop:14, padding:'10px 12px', background:'#F0FFF4', borderRadius:8,
                display:'flex', gap:10, alignItems:'center' }}>
                <span>💡</span>
                <div style={{ fontSize:12, color:'#276749' }}>
                  <strong>Tip:</strong> Route through OK + TX when possible — save ~$0.91/gal vs. CA runs.
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">Cost Per Mile — Fleet</h3>
              <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:12 }}>Cents per mile, 6-month trend</div>
              <CpmTrendChart />
              <div style={{ marginTop:16 }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:'#718096', marginBottom:8 }}>By Truck</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {TRUCK_MPG.map(t => {
                    const cpm = (avgPrice / t.avgMpg * 100).toFixed(1)
                    const clrT = parseFloat(cpm) <= 55 ? '#38C770' : parseFloat(cpm) <= 62 ? '#F59E0B' : '#E53E3E'
                    return (
                      <div key={t.truck} style={{ display:'flex', justifyContent:'space-between',
                        padding:'6px 10px', background:'#F4F6F9', borderRadius:6, fontSize:12 }}>
                        <span style={{ fontWeight:600 }}>{t.truck}</span>
                        <span style={{ color:'#A0AEC0', fontSize:11 }}>{t.driver}</span>
                        <span style={{ fontWeight:700, color:clrT }}>{cpm}¢/mi</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── IFTA TAB ── */}
      {tab === 'ifta' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
            <div className="card" style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 className="section-title" style={{ margin:0 }}>IFTA Report — {selectedQ}</h3>
                <div style={{ display:'flex', gap:6 }}>
                  {QUARTERS.map(q => (
                    <button key={q} className={`btn btn-sm ${selectedQ===q?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setSelectedQ(q)}>{q}</button>
                  ))}
                </div>
              </div>

              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#F4F6F9' }}>
                    {['State','Miles Driven','Fuel Used (gal)','Tax Rate','Tax Owed'].map(h => (
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11,
                        fontWeight:700, color:'#718096', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {IFTA_DATA.map(row => (
                    <tr key={row.state} style={{ borderBottom:'1px solid var(--c-divider)' }}>
                      <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:6, height:6, borderRadius:3, background:'#4BAED4' }} />
                          {row.state}
                        </div>
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:13 }}>{row.miles.toLocaleString()}</td>
                      <td style={{ padding:'10px 12px', fontSize:13 }}>{row.gallons.toLocaleString()}</td>
                      <td style={{ padding:'10px 12px', fontSize:13 }}>${row.taxRate.toFixed(3)}</td>
                      <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13,
                        color: row.taxOwed > 100 ? '#E53E3E' : '#2D3748' }}>
                        ${row.taxOwed.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background:'#1A2535' }}>
                    <td colSpan={4} style={{ padding:'10px 12px', fontWeight:700, color:'#A0AEC0', fontSize:13 }}>
                      Total IFTA Liability
                    </td>
                    <td style={{ padding:'10px 12px', fontWeight:900, color:'#F59E0B', fontSize:14 }}>
                      ${IFTA_DATA.reduce((s,r) => s+r.taxOwed, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div style={{ display:'flex', gap:10, marginTop:16 }}>
                <button className="btn btn-primary btn-sm">📥 Download PDF</button>
                <button className="btn btn-ghost btn-sm">📊 Export CSV</button>
                <button className="btn btn-ghost btn-sm">✉️ Email to CPA</button>
              </div>
            </div>

            <div style={{ width:280, flexShrink:0 }}>
              <IftaDeadlineCalendar selectedQ={selectedQ} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              { label:'Total Miles Reported', value:`${IFTA_DATA.reduce((s,r)=>s+r.miles,0).toLocaleString()} mi`, color:'#4BAED4' },
              { label:'Total Fuel Purchased', value:`${IFTA_DATA.reduce((s,r)=>s+r.gallons,0).toLocaleString()} gal`, color:'#38C770' },
              { label:'Total Tax Due',         value:`$${IFTA_DATA.reduce((s,r)=>s+r.taxOwed,0).toFixed(2)}`, color:'#E53E3E' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
                <div className="stat-value" style={{ color:s.color, fontSize:22 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADVANCES TAB ── */}
      {tab === 'advances' && (
        <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 className="section-title" style={{ margin:0 }}>Fuel Advance Tracker</h3>
              <button className="btn btn-primary btn-sm" onClick={()=>setShowAdvModal(true)}>+ Request Advance</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
              {[
                { label:'Total Issued MTD',  value:`$${ADVANCES.filter(a=>a.status!=='declined').reduce((s,a)=>s+a.approved,0).toLocaleString()}`, color:'#4BAED4' },
                { label:'Total Used',         value:`$${ADVANCES.reduce((s,a)=>s+a.used,0).toLocaleString()}`,                                      color:'#38C770' },
                { label:'Outstanding',        value:`$${ADVANCES.filter(a=>a.status==='approved').reduce((s,a)=>s+a.approved-a.used,0).toLocaleString()}`, color:'#F59E0B' },
                { label:'Pending Approval',   value:`${pendingAdv}`,                                                                                 color:'#E53E3E' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ padding:'12px 14px', borderTopColor:s.color }}>
                  <div style={{ fontWeight:900, fontSize:18, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#718096', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {ADVANCES.map(adv => (
                <AdvanceRow
                  key={adv.id}
                  advance={adv}
                  selected={selectedAdv?.id===adv.id}
                  onClick={()=>setSelectedAdv(selectedAdv?.id===adv.id ? null : adv)}
                />
              ))}
            </div>
          </div>

          {selectedAdv && (
            <div style={{ width:320, flexShrink:0 }}>
              <AdvanceDetailPanel advance={selectedAdv} onClose={()=>setSelectedAdv(null)} />
            </div>
          )}
        </div>
      )}

      {showAddModal && <AddFuelModal   onClose={()=>setShowAddModal(false)} />}
      {showAdvModal && <AddAdvanceModal onClose={()=>setShowAdvModal(false)} />}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FuelEntryRow({ entry: e, selected, onClick }:
  { entry:FuelEntry; selected?:boolean; onClick:()=>void }) {
  return (
    <div className="card" style={{
      padding:'12px 16px', cursor:'pointer',
      borderLeft:`4px solid ${e.receiptAttached?'#38C770':'#F59E0B'}`,
      boxShadow: selected ? '0 0 0 2px #4BAED433, 0 4px 12px rgba(0,0,0,.06)' : undefined,
    }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:'#2D3748' }}>{e.location}</div>
          <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>
            {e.date} · {e.truck} · {e.driver} · {e.state}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontWeight:900, fontSize:15, color:'#E53E3E' }}>${e.total.toFixed(2)}</div>
          <div style={{ fontSize:11, color:'#A0AEC0' }}>{e.gallons} gal @ ${e.pricePerGal}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99,
          background:'#EBF8FF', color:'#2B6CB0', fontWeight:600 }}>{e.cardType}</span>
        {e.mpg && (
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99,
            background: e.mpg>=7.0?'#F0FFF4':'#FFFBF0',
            color: e.mpg>=7.0?'#276749':'#744210', fontWeight:600 }}>
            {e.mpg} mpg
          </span>
        )}
        {!e.receiptAttached && (
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99,
            background:'#FFFBF0', color:'#744210', fontWeight:600 }}>⚠️ No receipt</span>
        )}
        <span style={{ fontSize:11, color:'#A0AEC0', marginLeft:'auto' }}>
          {e.odometer.toLocaleString()} mi
        </span>
      </div>
    </div>
  )
}

function FuelEntryDetail({ entry: e, onClose }: { entry:FuelEntry; onClose:()=>void }) {
  const [subTab, setSubTab] = useState<'info'|'receipt'>('info')
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>{e.id}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginTop:4 }}>⛽ {e.location}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>{e.date} · {e.state} · {e.truck}</div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--c-divider)' }}>
        {(['info','receipt'] as const).map(t => (
          <button key={t} onClick={()=>setSubTab(t)}
            style={{ flex:1, padding:'10px', fontSize:12, fontWeight:600, background:'none', border:'none',
              cursor:'pointer', color:subTab===t?'#4BAED4':'#A0AEC0',
              borderBottom:`2px solid ${subTab===t?'#4BAED4':'transparent'}` }}>
            {t==='info'?'📋 Details':'📎 Receipt'}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        {subTab === 'info' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Driver',       value:e.driver },
                { label:'Truck',        value:e.truck  },
                { label:'Gallons',      value:`${e.gallons} gal` },
                { label:'Price/Gal',    value:`$${e.pricePerGal}` },
                { label:'Total',        value:`$${e.total.toFixed(2)}` },
                { label:'State Tax',    value:`$${(STATE_TAX[e.state] ?? 0).toFixed(3)}/gal` },
                { label:'Odometer',     value:`${e.odometer.toLocaleString()} mi` },
                { label:'Card',         value:e.cardType },
                ...(e.mpg ? [{ label:'MPG this fill', value:`${e.mpg} mpg` }] : []),
              ].map(r => (
                <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1 }}>{r.value}</div>
                </div>
              ))}
            </div>
            {e.notes && (
              <div style={{ background:'#FFFBF0', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#744210' }}>
                📝 {e.notes}
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost btn-sm btn-full">✏️ Edit</button>
              <button className="btn btn-primary btn-sm btn-full">🗺️ View Map</button>
            </div>
          </>
        )}
        {subTab === 'receipt' && <ReceiptPanel attached={e.receiptAttached} />}
      </div>
    </div>
  )
}

function ReceiptPanel({ attached }: { attached:boolean }) {
  const [dragging, setDragging] = useState(false)
  if (attached) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ background:'#F0FFF4', border:'1px solid #9AE6B4', borderRadius:10,
          padding:'16px', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🧾</div>
          <div style={{ fontWeight:700, color:'#276749', fontSize:13 }}>Receipt Attached</div>
          <div style={{ fontSize:11, color:'#38A169', marginTop:4 }}>fuel_receipt.pdf</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm btn-full">👁️ View</button>
          <button className="btn btn-ghost btn-sm btn-full">🔄 Replace</button>
        </div>
      </div>
    )
  }
  return (
    <div
      onDragOver={ev=>{ ev.preventDefault(); setDragging(true) }}
      onDragLeave={()=>setDragging(false)}
      onDrop={ev=>{ ev.preventDefault(); setDragging(false) }}
      style={{ border:`2px dashed ${dragging?'#4BAED4':'#CBD5E0'}`, borderRadius:10,
        padding:'30px 20px', textAlign:'center', transition:'border-color .2s',
        background: dragging ? '#EBF8FF' : 'transparent', cursor:'pointer' }}>
      <div style={{ fontSize:36, marginBottom:8 }}>📎</div>
      <div style={{ fontWeight:700, color:'#4A5568', fontSize:13 }}>Drop receipt here</div>
      <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>or click to browse files</div>
      <div style={{ fontSize:10, color:'#CBD5E0', marginTop:8 }}>PDF, JPG, PNG accepted</div>
      <button className="btn btn-primary btn-sm" style={{ marginTop:12 }}>Choose File</button>
    </div>
  )
}

function AdvanceRow({ advance: a, selected, onClick }:
  { advance:FuelAdvance; selected?:boolean; onClick:()=>void }) {
  const cfg = {
    pending:  { bg:'#FFFBF0', color:'#744210', label:'Pending',  border:'#F59E0B' },
    approved: { bg:'#EBF8FF', color:'#2B6CB0', label:'Approved', border:'#4BAED4' },
    settled:  { bg:'#F0FFF4', color:'#276749', label:'Settled',  border:'#38C770' },
    declined: { bg:'#FFF5F5', color:'#C53030', label:'Declined', border:'#E53E3E' },
  }
  const s = cfg[a.status]
  return (
    <div className="card" style={{
      padding:'12px 16px', cursor:'pointer',
      borderLeft:`4px solid ${s.border}`,
      boxShadow: selected ? `0 0 0 2px ${s.border}33` : undefined,
    }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:13 }}>{a.driver}</div>
          <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>{a.truck} · {a.load} · {a.date}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontWeight:900, fontSize:15, color:'#2D3748' }}>${a.approved || a.requested}</div>
          <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
            background:s.bg, color:s.color }}>{s.label}</span>
        </div>
      </div>
      {(a.status === 'approved' || a.status === 'settled') && (
        <div style={{ marginTop:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#A0AEC0', marginBottom:4 }}>
            <span>Used: ${a.used}</span>
            <span>Remaining: ${a.approved - a.used}</span>
          </div>
          <div style={{ background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden' }}>
            <div style={{ width:`${a.approved ? (a.used/a.approved)*100 : 0}%`,
              height:'100%', borderRadius:99, background:'#4BAED4' }} />
          </div>
        </div>
      )}
    </div>
  )
}

function AdvanceDetailPanel({ advance: a, onClose }: { advance:FuelAdvance; onClose:()=>void }) {
  const cfg = {
    pending:  { color:'#F59E0B', label:'Pending Approval' },
    approved: { color:'#4BAED4', label:'Approved'         },
    settled:  { color:'#38C770', label:'Settled'          },
    declined: { color:'#E53E3E', label:'Declined'         },
  }
  const s = cfg[a.status]
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{ background:`linear-gradient(135deg,${s.color}dd,${s.color}88)`, padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>{a.id}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.7)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginTop:4 }}>💳 {a.driver}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.7)', marginTop:2 }}>{s.label} · {a.date}</div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { label:'Requested', value:`$${a.requested}` },
            { label:'Approved',  value: a.approved ? `$${a.approved}` : '—' },
            { label:'Used',      value:`$${a.used}` },
            { label:'Balance',   value:`$${a.approved - a.used}` },
            { label:'Truck',     value:a.truck },
            { label:'Load #',    value:a.load  },
          ].map(r => (
            <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
              <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
              <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1 }}>{r.value}</div>
            </div>
          ))}
        </div>
        {a.notes && (
          <div style={{ background:'#FFFBF0', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#744210' }}>📝 {a.notes}</div>
        )}
        {a.status === 'pending' && (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-sm btn-full" style={{ background:'#38C770', color:'#fff', border:'none' }}>✅ Approve</button>
            <button className="btn btn-sm btn-full" style={{ background:'#E53E3E', color:'#fff', border:'none' }}>✕ Decline</button>
          </div>
        )}
        {a.status === 'approved' && (
          <button className="btn btn-primary btn-sm btn-full">Mark Settled</button>
        )}
      </div>
    </div>
  )
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function MonthlyCostChart({ data }: { data: { month:string; spend:number }[] }) {
  const max = Math.max(...data.map(d => d.spend))
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:110, paddingTop:8 }}>
      {data.map((d, i) => {
        const pct = (d.spend / max) * 100
        const isCurrent = i === data.length - 1
        return (
          <div key={d.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ fontSize:10, color: isCurrent?'#4BAED4':'#A0AEC0', fontWeight:isCurrent?700:400 }}>
              ${(d.spend/1000).toFixed(1)}k
            </div>
            <div style={{ width:'100%', height:70, display:'flex', alignItems:'flex-end' }}>
              <div style={{ width:'100%', height:`${pct}%`,
                background: isCurrent?'linear-gradient(180deg,#4BAED4,#2D7A9A)':'#E2E8F0',
                borderRadius:'4px 4px 0 0', transition:'height .4s' }} />
            </div>
            <div style={{ fontSize:10, color:'#A0AEC0' }}>{d.month}</div>
          </div>
        )
      })}
    </div>
  )
}

function MpgSparkline({ data, color }: { data:number[]; color:string }) {
  const min = Math.min(...data) - 0.3
  const max = Math.max(...data) + 0.3
  const w = 100, h = 24
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*(w-4)+2
    const y = h - ((v-min)/(max-min))*(h-4)-2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height:24 }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.6" />
    </svg>
  )
}

function CpmTrendChart() {
  const data = [
    { month:'Dec', cpm:57.2 },
    { month:'Jan', cpm:58.1 },
    { month:'Feb', cpm:55.8 },
    { month:'Mar', cpm:59.4 },
    { month:'Apr', cpm:57.9 },
    { month:'May', cpm:56.1 },
  ]
  const minV = 53, maxV = 62
  const w = 260, h = 60
  const pts = data.map((d,i) => {
    const x = (i/(data.length-1))*(w-16)+8
    const y = h - ((d.cpm-minV)/(maxV-minV))*(h-8)-4
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h+20}`} style={{ width:'100%' }}>
      <defs>
        <linearGradient id="cpmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4BAED4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4BAED4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#cpmGrad)" points={`8,${h} ${pts} ${w-8},${h}`} />
      <polyline fill="none" stroke="#4BAED4" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {data.map((d,i) => {
        const x = (i/(data.length-1))*(w-16)+8
        const y = h - ((d.cpm-minV)/(maxV-minV))*(h-8)-4
        return (
          <g key={d.month}>
            <circle cx={x} cy={y} r="3" fill={i===data.length-1?'#4BAED4':'#fff'}
              stroke="#4BAED4" strokeWidth="2" />
            <text x={x} y={h+14} textAnchor="middle" fontSize="9" fill="#A0AEC0">{d.month}</text>
          </g>
        )
      })}
    </svg>
  )
}

function IftaDeadlineCalendar({ selectedQ }: { selectedQ:string }) {
  const deadlines = [
    { q:'Q1 2025', due:'Apr 30, 2025', status:'filed',    note:'Filed on time' },
    { q:'Q2 2025', due:'Jul 31, 2025', status:'upcoming', note:'47 days remaining' },
    { q:'Q3 2025', due:'Oct 31, 2025', status:'future',   note:'Q3 not started' },
    { q:'Q4 2025', due:'Jan 31, 2026', status:'future',   note:'Q4 not started' },
  ]
  return (
    <div className="card">
      <h3 className="section-title">IFTA Deadlines</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {deadlines.map(d => {
          const isSelected = d.q === selectedQ
          const cfgMap = {
            filed:    { bg:'#F0FFF4', color:'#276749', icon:'✅', border:'#9AE6B4' },
            upcoming: { bg:'#FFFBF0', color:'#744210', icon:'⚠️', border:'#F6AD55' },
            future:   { bg:'#F4F6F9', color:'#A0AEC0', icon:'📅', border:'#E2E8F0' },
          }
          const c = cfgMap[d.status as keyof typeof cfgMap]
          return (
            <div key={d.q} style={{
              background: isSelected ? c.bg : 'transparent',
              border:`1px solid ${isSelected?c.border:'var(--c-divider)'}`,
              borderRadius:8, padding:'10px 12px',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span>{c.icon}</span>
                  <span style={{ fontWeight:700, fontSize:12 }}>{d.q}</span>
                </div>
                {isSelected && <span style={{ fontSize:10, fontWeight:700, color:'#4BAED4' }}>Selected</span>}
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:'#2D3748', marginTop:4 }}>Due {d.due}</div>
              <div style={{ fontSize:11, color:c.color, marginTop:2 }}>{d.note}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function AddFuelModal({ onClose }: { onClose:()=>void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:540 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⛽ Log Fuel Purchase</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, paddingBottom:8 }}>
          {[
            { label:'Date',          type:'date',   ph:'' },
            { label:'Location',      type:'text',   ph:'Pilot Flying J, Memphis TN' },
            { label:'State',         type:'text',   ph:'TN' },
            { label:'Odometer (mi)', type:'number', ph:'498000' },
            { label:'Gallons',       type:'number', ph:'140' },
            { label:'Price / Gal',   type:'number', ph:'3.82' },
          ].map(f => (
            <div key={f.label} className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">{f.label}</label>
              <input className="input" type={f.type} placeholder={f.ph} />
            </div>
          ))}
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Truck</label>
            <select className="input select">
              {['Unit 01','Unit 02','Unit 03','Unit 04','Unit 05'].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Card Type</label>
            <select className="input select">
              {['EFS','Comdata','FleetOne','WEX','Cash'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Receipt</label>
            <input className="input" type="file" accept=".pdf,.jpg,.png" />
          </div>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Notes</label>
            <input className="input" type="text" placeholder="Optional notes..." />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:12 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={onClose}>Save Entry</button>
        </div>
      </div>
    </div>
  )
}

function AddAdvanceModal({ onClose }: { onClose:()=>void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:480 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">💳 Request Fuel Advance</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, paddingBottom:8 }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Driver</label>
            <select className="input select">
              {['James Carter','Mike Rodriguez','Anna Perez','Tony Marshall','Sara Kim'].map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Load #</label>
            <input className="input" type="text" placeholder="LD-2260" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Amount Requested ($)</label>
            <input className="input" type="number" placeholder="400" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Date Needed</label>
            <input className="input" type="date" />
          </div>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Notes</label>
            <textarea className="input" rows={2} placeholder="Reason for advance..." style={{ resize:'vertical' }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:12 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={onClose}>Submit Request</button>
        </div>
      </div>
    </div>
  )
}
