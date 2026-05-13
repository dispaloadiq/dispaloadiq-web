import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus   = 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending'
type DocCategory = 'Company' | 'Driver' | 'Truck'

interface ComplianceDoc {
  id: string
  name: string
  category: DocCategory
  status: DocStatus
  expiry: string
  daysLeft: number
  owner: string
  fileAttached: boolean
  notes?: string
}

interface Inspection {
  id: string
  date: string
  type: 'Level 1' | 'Level 2' | 'Level 3' | 'Annual'
  truck: string
  driver: string
  location: string
  result: 'Pass' | 'Fail' | 'Pass with OOS'
  violations: number
  score: number
  notes?: string
}

interface DrugTest {
  id: string
  driver: string
  date: string
  type: 'Pre-Employment' | 'Random' | 'Post-Accident' | 'Reasonable Suspicion' | 'Return-to-Duty'
  result: 'Negative' | 'Positive' | 'Pending' | 'Refused'
  lab: string
  mro: string
}

interface HosViolation {
  id: string
  driver: string
  truck: string
  date: string
  type: string
  rule: string
  severity: 'Critical' | 'Major' | 'Minor'
  fine?: number
  status: 'Open' | 'Resolved' | 'Contested'
  description: string
}

interface DriverScorecard {
  driver: string
  truck: string
  docScore: number      // 0-100 doc compliance
  hosScore: number      // 0-100 HOS compliance
  drugScore: number     // 0-100 drug test up-to-date
  inspScore: number     // 0-100 clean inspections
  overall: number
  violations: number
  lastDrugTest: string
  trend: 'up' | 'down' | 'stable'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DOCS: ComplianceDoc[] = [
  // Company
  { id:'d01', name:'USDOT Number',           category:'Company', status:'Valid',         expiry:'N/A',        daysLeft:999, owner:'Company',        fileAttached:true  },
  { id:'d02', name:'MC/FF/MX Authority',     category:'Company', status:'Valid',         expiry:'N/A',        daysLeft:999, owner:'Company',        fileAttached:true  },
  { id:'d03', name:'BOC-3 Filing',           category:'Company', status:'Valid',         expiry:'N/A',        daysLeft:999, owner:'Company',        fileAttached:true  },
  { id:'d04', name:'UCR Registration',       category:'Company', status:'Valid',         expiry:'Dec 31 2025',daysLeft:233, owner:'Company',        fileAttached:true  },
  { id:'d05', name:'MCS-150 Biennial',       category:'Company', status:'Valid',         expiry:'Mar 2026',   daysLeft:310, owner:'Company',        fileAttached:true  },
  { id:'d06', name:'IRP Registration',       category:'Company', status:'Expiring Soon', expiry:'Jun 30 2025',daysLeft:49,  owner:'Company',        fileAttached:true,  notes:'Renewal in process' },
  { id:'d07', name:'IFTA License',           category:'Company', status:'Valid',         expiry:'Dec 31 2025',daysLeft:233, owner:'Company',        fileAttached:true  },
  // Drivers
  { id:'d08', name:"CDL — James Carter",     category:'Driver',  status:'Valid',         expiry:'Aug 2027',   daysLeft:820, owner:'James Carter',   fileAttached:true  },
  { id:'d09', name:"CDL — Mike Rodriguez",   category:'Driver',  status:'Valid',         expiry:'Jun 2026',   daysLeft:419, owner:'Mike Rodriguez',  fileAttached:true  },
  { id:'d10', name:"CDL — Anna Perez",       category:'Driver',  status:'Valid',         expiry:'Nov 2026',   daysLeft:567, owner:'Anna Perez',      fileAttached:true  },
  { id:'d11', name:"CDL — Tony Marshall",    category:'Driver',  status:'Expiring Soon', expiry:'Jun 20 2025',daysLeft:39,  owner:'Tony Marshall',   fileAttached:true,  notes:'Renewal scheduled Jun 15' },
  { id:'d12', name:"CDL — Sara Kim",         category:'Driver',  status:'Valid',         expiry:'Apr 2027',   daysLeft:693, owner:'Sara Kim',        fileAttached:true  },
  { id:'d13', name:"Med Cert — Tony Marshall",category:'Driver', status:'Expired',       expiry:'Apr 30 2025',daysLeft:-12, owner:'Tony Marshall',   fileAttached:false, notes:'URGENT: must not drive' },
  { id:'d14', name:"Med Cert — Mike Rodriguez",category:'Driver',status:'Valid',         expiry:'Sep 2025',   daysLeft:142, owner:'Mike Rodriguez',  fileAttached:true  },
  { id:'d15', name:"MVR — Annual Review",    category:'Driver',  status:'Pending',       expiry:'N/A',        daysLeft:0,   owner:'All Drivers',     fileAttached:false, notes:'Annual pull due this month' },
  // Trucks
  { id:'d16', name:"Registration — Unit 01", category:'Truck',   status:'Valid',         expiry:'Dec 2025',   daysLeft:233, owner:'Unit 01',         fileAttached:true  },
  { id:'d17', name:"Registration — Unit 02", category:'Truck',   status:'Valid',         expiry:'Dec 2025',   daysLeft:233, owner:'Unit 02',         fileAttached:true  },
  { id:'d18', name:"Registration — Unit 03", category:'Truck',   status:'Valid',         expiry:'Dec 2025',   daysLeft:233, owner:'Unit 03',         fileAttached:true  },
  { id:'d19', name:"Annual Inspection — Unit 04", category:'Truck', status:'Expiring Soon', expiry:'Jun 15 2025', daysLeft:34, owner:'Unit 04',     fileAttached:true  },
  { id:'d20', name:"Annual Inspection — Unit 05", category:'Truck', status:'Valid',      expiry:'Nov 2025',   daysLeft:183, owner:'Unit 05',         fileAttached:true  },
]

const INSPECTIONS: Inspection[] = [
  { id:'INS-001', date:'May 8',  type:'Level 2', truck:'Unit 03', driver:'Anna Perez',     location:'Weigh station, I-95 FL',  result:'Pass',          violations:0, score:100 },
  { id:'INS-002', date:'Apr 22', type:'Level 1', truck:'Unit 01', driver:'James Carter',   location:'Port of Entry, NM',       result:'Pass',          violations:0, score:100 },
  { id:'INS-003', date:'Apr 11', type:'Level 1', truck:'Unit 04', driver:'Tony Marshall',  location:'Scale, I-70 KS',          result:'Pass with OOS', violations:2, score:78, notes:'Tire tread & marker lamp' },
  { id:'INS-004', date:'Mar 30', type:'Level 3', truck:'Unit 02', driver:'Mike Rodriguez', location:'Scale, TX-20',            result:'Pass',          violations:0, score:100 },
  { id:'INS-005', date:'Mar 18', type:'Annual',  truck:'Unit 05', driver:'Sara Kim',       location:'Fleet shop, Chicago',     result:'Pass',          violations:0, score:100 },
  { id:'INS-006', date:'Feb 14', type:'Level 2', truck:'Unit 04', driver:'Tony Marshall',  location:'Weigh station, CO',       result:'Fail',          violations:3, score:62, notes:'Brake adjustment, log violation, broken seal' },
]

const DRUG_TESTS: DrugTest[] = [
  { id:'DT-001', driver:'James Carter',   date:'May 1',  type:'Random',           result:'Negative', lab:'Quest Diagnostics', mro:'Dr. R. Johnson' },
  { id:'DT-002', driver:'Anna Perez',     date:'Apr 20', type:'Random',           result:'Negative', lab:'LabCorp',            mro:'Dr. S. Patel' },
  { id:'DT-003', driver:'Mike Rodriguez', date:'Apr 15', type:'Post-Accident',    result:'Negative', lab:'Quest Diagnostics', mro:'Dr. R. Johnson' },
  { id:'DT-004', driver:'Tony Marshall',  date:'Apr 10', type:'Reasonable Suspicion', result:'Pending', lab:'Quest Diagnostics', mro:'Dr. R. Johnson' },
  { id:'DT-005', driver:'Sara Kim',       date:'Mar 28', type:'Random',           result:'Negative', lab:'LabCorp',            mro:'Dr. S. Patel' },
  { id:'DT-006', driver:'Tony Marshall',  date:'Jan 12', type:'Pre-Employment',   result:'Negative', lab:'Quest Diagnostics', mro:'Dr. R. Johnson' },
]

const HOS_VIOLATIONS: HosViolation[] = [
  { id:'HOS-001', driver:'Tony Marshall',  truck:'Unit 04', date:'Apr 18', type:'11-Hour Limit',      rule:'49 CFR 395.3(a)(3)', severity:'Critical', fine:1100, status:'Resolved',  description:'Drove 12.4 hours exceeding the 11-hour limit. 30-min break not taken at 8-hr mark.' },
  { id:'HOS-002', driver:'Mike Rodriguez', truck:'Unit 02', date:'Apr 12', type:'30-Minute Break',    rule:'49 CFR 395.3(a)(3)(ii)', severity:'Minor', fine:0, status:'Resolved', description:'Drove 8.5 consecutive hours without required 30-minute off-duty break.' },
  { id:'HOS-003', driver:'Tony Marshall',  truck:'Unit 04', date:'Mar 22', type:'False Log Entry',    rule:'49 CFR 395.8', severity:'Critical', fine:2750, status:'Contested',  description:'ELD recorded driving during claimed off-duty period. Discrepancy of 47 minutes.' },
  { id:'HOS-004', driver:'Sara Kim',       truck:'Unit 05', date:'Mar 10', type:'14-Hour Window',     rule:'49 CFR 395.3(a)(2)', severity:'Major', fine:550, status:'Resolved',  description:'Driver exceeded 14-hour on-duty window before taking required 10-hour off-duty period.' },
  { id:'HOS-005', driver:'Mike Rodriguez', truck:'Unit 02', date:'Feb 28', type:'70-Hour/8-Day Limit',rule:'49 CFR 395.3(b)(2)', severity:'Major', fine:825, status:'Resolved',  description:'Accumulated 71.5 hours in 8-day cycle exceeding regulatory limit by 1.5 hours.' },
]

const DRIVER_SCORECARDS: DriverScorecard[] = [
  { driver:'James Carter',   truck:'Unit 01', docScore:100, hosScore:100, drugScore:100, inspScore:100, overall:100, violations:0, lastDrugTest:'May 1',  trend:'stable' },
  { driver:'Mike Rodriguez', truck:'Unit 02', docScore:95,  hosScore:78,  drugScore:100, inspScore:100, overall:93,  violations:2, lastDrugTest:'Apr 20', trend:'down'   },
  { driver:'Anna Perez',     truck:'Unit 03', docScore:100, hosScore:100, drugScore:100, inspScore:100, overall:100, violations:0, lastDrugTest:'Apr 15', trend:'stable' },
  { driver:'Tony Marshall',  truck:'Unit 04', docScore:60,  hosScore:55,  drugScore:70,  inspScore:62,  overall:62,  violations:5, lastDrugTest:'Apr 10', trend:'down'   },
  { driver:'Sara Kim',       truck:'Unit 05', docScore:100, hosScore:88,  drugScore:100, inspScore:100, overall:97,  violations:1, lastDrugTest:'Mar 28', trend:'up'     },
]

const SMS_SCORES = [
  { cat:'Unsafe Driving',          score:28, threshold:65, trend:'stable' },
  { cat:'HOS Compliance',          score:45, threshold:65, trend:'up'     },
  { cat:'Driver Fitness',          score:18, threshold:80, trend:'stable' },
  { cat:'Controlled Substances',   score:5,  threshold:50, trend:'stable' },
  { cat:'Vehicle Maintenance',     score:38, threshold:80, trend:'up'     },
  { cat:'Hazmat Compliance',       score:0,  threshold:80, trend:'stable' },
  { cat:'Crash Indicator',         score:22, threshold:65, trend:'down'   },
]

const DRUG_SCHEDULE = [
  { quarter:'Q1', planned:2, completed:2, status:'done' },
  { quarter:'Q2', planned:2, completed:1, status:'in-progress' },
  { quarter:'Q3', planned:2, completed:0, status:'upcoming' },
  { quarter:'Q4', planned:2, completed:0, status:'upcoming' },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompliancePage() {
  const [tab,          setTab]          = useState<'overview' | 'docs' | 'inspections' | 'drug' | 'hos' | 'scorecards'>('overview')
  const [catFilter,    setCatFilter]    = useState<'All' | DocCategory>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | DocStatus>('All')
  const [selectedDoc,  setSelectedDoc]  = useState<ComplianceDoc | null>(null)
  const [selectedInsp, setSelectedInsp] = useState<Inspection | null>(null)
  const [showAddDoc,   setShowAddDoc]   = useState(false)

  const expiredCount     = DOCS.filter(d => d.status === 'Expired').length
  const expiringSoonCount = DOCS.filter(d => d.status === 'Expiring Soon').length
  const pendingDrugCount = DRUG_TESTS.filter(d => d.result === 'Pending').length
  const openHosCount     = HOS_VIOLATIONS.filter(v => v.status === 'Open').length
  const urgentCount      = expiredCount + openHosCount + pendingDrugCount

  const filteredDocs = DOCS.filter(d => {
    if (catFilter    !== 'All' && d.category !== catFilter)    return false
    if (statusFilter !== 'All' && d.status   !== statusFilter) return false
    return true
  })

  const hosTotal = HOS_VIOLATIONS.reduce((s,v) => s + (v.fine ?? 0), 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:0 }}>
        <button className={`tab-btn ${tab==='overview'?'active':''}`}    onClick={()=>setTab('overview')}>🛡️ Overview</button>
        <button className={`tab-btn ${tab==='docs'?'active':''}`}        onClick={()=>setTab('docs')}>
          📄 Documents
          {(expiredCount+expiringSoonCount) > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{expiredCount+expiringSoonCount}</span>}
        </button>
        <button className={`tab-btn ${tab==='inspections'?'active':''}`} onClick={()=>setTab('inspections')}>🔍 Inspections</button>
        <button className={`tab-btn ${tab==='drug'?'active':''}`}        onClick={()=>setTab('drug')}>
          💊 Drug Testing
          {pendingDrugCount > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{pendingDrugCount}</span>}
        </button>
        <button className={`tab-btn ${tab==='hos'?'active':''}`}         onClick={()=>setTab('hos')}>
          ⏱️ HOS
          {openHosCount > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{openHosCount}</span>}
        </button>
        <button className={`tab-btn ${tab==='scorecards'?'active':''}`}  onClick={()=>setTab('scorecards')}>📊 Scorecards</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Expired Docs',     value:`${expiredCount}`,                             color: expiredCount>0?'#E53E3E':'#38C770',      icon:'📄' },
          { label:'Expiring Soon',    value:`${expiringSoonCount}`,                        color: expiringSoonCount>0?'#F59E0B':'#38C770',  icon:'⏰' },
          { label:'HOS Violations YTD',value:`$${hosTotal.toLocaleString()}`,              color:'#E53E3E',                                  icon:'⏱️' },
          { label:'Urgent Actions',   value: urgentCount > 0 ? `${urgentCount} items` : '✓ All Clear', color: urgentCount>0?'#E53E3E':'#38C770', icon:'🚨' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Alerts */}
          {urgentCount > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {DOCS.filter(d => d.status === 'Expired').map(d => (
                <div key={d.id} style={{ background:'#FFF5F5', border:'1px solid #FC8181', borderRadius:10,
                  padding:'12px 16px', display:'flex', gap:12, alignItems:'center' }}>
                  <span style={{ fontSize:20 }}>🚨</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#C53030', fontSize:13 }}>EXPIRED: {d.name}</div>
                    <div style={{ fontSize:12, color:'#E53E3E', marginTop:2 }}>
                      {d.notes ?? `Expired ${d.expiry} — ${d.owner}`}
                    </div>
                  </div>
                  <button className="btn btn-sm" style={{ background:'#E53E3E', color:'#fff', border:'none' }}
                    onClick={()=>{ setTab('docs'); setSelectedDoc(d) }}>Fix Now →</button>
                </div>
              ))}
              {DOCS.filter(d => d.status === 'Expiring Soon').map(d => (
                <div key={d.id} style={{ background:'#FFFBF0', border:'1px solid #F6AD55', borderRadius:10,
                  padding:'12px 16px', display:'flex', gap:12, alignItems:'center' }}>
                  <span style={{ fontSize:20 }}>⚠️</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#744210', fontSize:13 }}>Expiring in {d.daysLeft} days: {d.name}</div>
                    <div style={{ fontSize:12, color:'#C05621', marginTop:2 }}>{d.owner} · Due {d.expiry}</div>
                  </div>
                  <button className="btn btn-sm" style={{ background:'#F59E0B', color:'#fff', border:'none' }}
                    onClick={()=>setTab('docs')}>Renew →</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            {/* Doc status by category */}
            <div className="card">
              <h3 className="section-title">Document Status by Category</h3>
              {(['Company','Driver','Truck'] as DocCategory[]).map(cat => {
                const catDocs = DOCS.filter(d => d.category === cat)
                const valid   = catDocs.filter(d => d.status === 'Valid').length
                const total   = catDocs.length
                const pct     = Math.round((valid/total)*100)
                const expired = catDocs.filter(d => d.status==='Expired').length
                const expiring = catDocs.filter(d => d.status==='Expiring Soon').length
                return (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:13 }}>{cat} Documents</span>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        {expired > 0 && <span style={{ fontSize:11, fontWeight:700, color:'#E53E3E' }}>{expired} expired</span>}
                        {expiring > 0 && <span style={{ fontSize:11, fontWeight:700, color:'#F59E0B' }}>{expiring} expiring</span>}
                        <span style={{ fontWeight:700, fontSize:13, color: pct===100?'#38C770':'#F59E0B' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ background:'#E2E8F0', borderRadius:99, height:10, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', borderRadius:99,
                        background: pct===100?'#38C770':'#F59E0B', transition:'width .4s' }} />
                    </div>
                    <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>{valid}/{total} valid</div>
                  </div>
                )
              })}
            </div>

            {/* FMCSA SMS Scores */}
            <div className="card">
              <h3 className="section-title">FMCSA SMS BASICs</h3>
              <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:12 }}>
                Lower = better. Alert if above threshold.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {SMS_SCORES.map(s => {
                  const isAlert = s.score >= s.threshold * 0.7
                  const clr = isAlert ? '#E53E3E' : s.score >= s.threshold * 0.4 ? '#F59E0B' : '#38C770'
                  return (
                    <div key={s.cat}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontSize:12, fontWeight:600 }}>{s.cat}</span>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <span style={{ fontSize:10, color:'#A0AEC0' }}>Alert: {s.threshold}%</span>
                          <span style={{ fontWeight:700, fontSize:13, color:clr }}>{s.score}%</span>
                          <span style={{ fontSize:11 }}>{s.trend==='up'?'📈':s.trend==='down'?'📉':'➡️'}</span>
                        </div>
                      </div>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden' }}>
                        <div style={{ width:`${s.score}%`, height:'100%', borderRadius:99, background:clr }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent inspections + upcoming renewals */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h3 className="section-title" style={{ margin:0 }}>Recent Inspections</h3>
                <button className="btn btn-ghost btn-sm" onClick={()=>setTab('inspections')}>View All →</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {INSPECTIONS.slice(0,4).map(ins => (
                  <InspectionRow key={ins.id} inspection={ins} compact />
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="section-title">Upcoming Renewals</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {DOCS.filter(d => d.daysLeft > 0 && d.daysLeft < 180).sort((a,b)=>a.daysLeft-b.daysLeft).slice(0,5).map(d => (
                  <div key={d.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'8px 12px', background:'#F4F6F9', borderRadius:8 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:12 }}>{d.name}</div>
                      <div style={{ fontSize:11, color:'#A0AEC0' }}>{d.owner}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:700, fontSize:12,
                        color: d.daysLeft < 45 ? '#E53E3E' : d.daysLeft < 90 ? '#F59E0B' : '#A0AEC0' }}>
                        {d.daysLeft}d
                      </div>
                      <div style={{ fontSize:10, color:'#A0AEC0' }}>{d.expiry}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENTS TAB ── */}
      {tab === 'docs' && (
        <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div className="card" style={{ padding:'12px 16px', marginBottom:14 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                {(['All','Company','Driver','Truck'] as const).map(c => (
                  <button key={c} className={`btn btn-sm ${catFilter===c?'btn-primary':'btn-ghost'}`}
                    onClick={()=>setCatFilter(c)}>{c}</button>
                ))}
                <div style={{ width:1, height:20, background:'var(--c-divider)', margin:'0 4px' }} />
                {(['All','Valid','Expiring Soon','Expired','Pending'] as const).map(s => (
                  <button key={s} className={`btn btn-sm ${statusFilter===s?'btn-primary':'btn-ghost'}`}
                    onClick={()=>setStatusFilter(s)}>{s}</button>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }}
                  onClick={()=>setShowAddDoc(true)}>+ Add Doc</button>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filteredDocs.map(doc => (
                <DocRow
                  key={doc.id}
                  doc={doc}
                  selected={selectedDoc?.id===doc.id}
                  onClick={()=>setSelectedDoc(selectedDoc?.id===doc.id ? null : doc)}
                />
              ))}
              {filteredDocs.length === 0 && (
                <div style={{ textAlign:'center', padding:60, color:'#A0AEC0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
                  <div style={{ fontWeight:600 }}>No documents match filters</div>
                </div>
              )}
            </div>
          </div>

          {selectedDoc && (
            <div style={{ width:340, flexShrink:0 }}>
              <DocDetailPanel doc={selectedDoc} onClose={()=>setSelectedDoc(null)} />
            </div>
          )}
        </div>
      )}

      {/* ── INSPECTIONS TAB ── */}
      {tab === 'inspections' && (
        <div style={{ display:'flex', gap:18, alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            {/* Summary KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
              {[
                { label:'Total Inspections', value:`${INSPECTIONS.length}`, color:'#4BAED4' },
                { label:'Clean Passes',       value:`${INSPECTIONS.filter(i=>i.result==='Pass').length}`, color:'#38C770' },
                { label:'OOS Violations',     value:`${INSPECTIONS.filter(i=>i.result!=='Pass').reduce((s,i)=>s+i.violations,0)}`, color:'#E53E3E' },
                { label:'Avg Score',          value:`${Math.round(INSPECTIONS.reduce((s,i)=>s+i.score,0)/INSPECTIONS.length)}/100`, color:'#F59E0B' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ padding:'12px 14px', borderTopColor:s.color }}>
                  <div style={{ fontWeight:900, fontSize:18, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#718096', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {INSPECTIONS.map(ins => (
                <InspectionRow
                  key={ins.id}
                  inspection={ins}
                  selected={selectedInsp?.id===ins.id}
                  onClick={()=>setSelectedInsp(selectedInsp?.id===ins.id ? null : ins)}
                />
              ))}
            </div>
          </div>

          {selectedInsp && (
            <div style={{ width:340, flexShrink:0 }}>
              <InspectionDetailPanel inspection={selectedInsp} onClose={()=>setSelectedInsp(null)} />
            </div>
          )}
        </div>
      )}

      {/* ── DRUG TESTING TAB ── */}
      {tab === 'drug' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {pendingDrugCount > 0 && (
            <div style={{ background:'#FFFBF0', border:'1px solid #F6AD55', borderRadius:10,
              padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:20 }}>⏳</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'#744210', fontSize:13 }}>
                  {pendingDrugCount} test result{pendingDrugCount>1?'s':''} pending MRO review
                </div>
                <div style={{ fontSize:12, color:'#C05621', marginTop:2 }}>
                  {DRUG_TESTS.filter(d=>d.result==='Pending').map(d=>d.driver).join(', ')}
                </div>
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, alignItems:'flex-start' }}>
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h3 className="section-title" style={{ margin:0 }}>Test History</h3>
                <button className="btn btn-primary btn-sm">+ Log Test</button>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#F4F6F9' }}>
                    {['Driver','Date','Type','Result','Lab','MRO'].map(h => (
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'#718096' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DRUG_TESTS.map(t => {
                    const resultCfg = {
                      Negative: { bg:'#F0FFF4', color:'#276749' },
                      Positive: { bg:'#FFF5F5', color:'#C53030' },
                      Pending:  { bg:'#FFFBF0', color:'#744210' },
                      Refused:  { bg:'#FFF5F5', color:'#C53030' },
                    }
                    const rc = resultCfg[t.result]
                    return (
                      <tr key={t.id} style={{ borderBottom:'1px solid var(--c-divider)' }}>
                        <td style={{ padding:'10px 12px', fontWeight:600, fontSize:13 }}>{t.driver}</td>
                        <td style={{ padding:'10px 12px', fontSize:12, color:'#718096' }}>{t.date}</td>
                        <td style={{ padding:'10px 12px', fontSize:12 }}>{t.type}</td>
                        <td style={{ padding:'10px 12px' }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                            background:rc.bg, color:rc.color }}>{t.result}</span>
                        </td>
                        <td style={{ padding:'10px 12px', fontSize:12, color:'#718096' }}>{t.lab}</td>
                        <td style={{ padding:'10px 12px', fontSize:12, color:'#718096' }}>{t.mro}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="section-title">Random Testing Schedule</h3>
              <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:12 }}>8 required per year (4 drivers)</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {DRUG_SCHEDULE.map(q => {
                  const pct = q.planned ? (q.completed/q.planned)*100 : 0
                  const clr = q.status==='done'?'#38C770':q.status==='in-progress'?'#F59E0B':'#E2E8F0'
                  return (
                    <div key={q.quarter}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:12 }}>{q.quarter} 2025</span>
                        <span style={{ fontSize:12, color:'#718096' }}>{q.completed}/{q.planned} completed</span>
                      </div>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:clr }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ marginTop:16, padding:'10px 12px', background:'#EBF8FF', borderRadius:8 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#2B6CB0', marginBottom:4 }}>Consortium Info</div>
                <div style={{ fontSize:11, color:'#4A5568', lineHeight:1.6 }}>
                  Required rate: 50% annually<br/>
                  Program: FMCSA Drug & Alcohol<br/>
                  Next random draw: Jun 15, 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HOS VIOLATIONS TAB ── */}
      {tab === 'hos' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { label:'Total Violations YTD',  value:`${HOS_VIOLATIONS.length}`,                  color:'#E53E3E' },
              { label:'Total Fines YTD',        value:`$${hosTotal.toLocaleString()}`,              color:'#E53E3E' },
              { label:'Critical Violations',    value:`${HOS_VIOLATIONS.filter(v=>v.severity==='Critical').length}`, color:'#E53E3E' },
              { label:'Open/Contested',         value:`${HOS_VIOLATIONS.filter(v=>v.status!=='Resolved').length}`, color:'#F59E0B' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
                <div style={{ fontWeight:900, fontSize:22, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#718096', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {HOS_VIOLATIONS.map(v => {
              const sevClr = v.severity==='Critical'?'#E53E3E':v.severity==='Major'?'#F59E0B':'#38C770'
              const statusCfg = {
                Open:      { bg:'#FFF5F5', color:'#C53030' },
                Resolved:  { bg:'#F0FFF4', color:'#276749' },
                Contested: { bg:'#FAF5FF', color:'#553C9A' },
              }
              const sc = statusCfg[v.status]
              return (
                <div key={v.id} className="card" style={{ borderLeft:`4px solid ${sevClr}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontWeight:700, fontSize:13 }}>{v.type}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          background: v.severity==='Critical'?'#FFF5F5':v.severity==='Major'?'#FFFBF0':'#F0FFF4',
                          color:sevClr }}>{v.severity}</span>
                      </div>
                      <div style={{ fontSize:11, color:'#A0AEC0', marginTop:3 }}>
                        {v.driver} · {v.truck} · {v.date} · {v.rule}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      {v.fine ? <span style={{ fontWeight:700, color:'#E53E3E', fontSize:13 }}>${v.fine.toLocaleString()}</span> : null}
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:99,
                        background:sc.bg, color:sc.color }}>{v.status}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'#4A5568', lineHeight:1.6 }}>{v.description}</div>
                  {v.status !== 'Resolved' && (
                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <button className="btn btn-ghost btn-sm">📎 Attach Docs</button>
                      {v.status === 'Open' && <button className="btn btn-primary btn-sm">Mark Resolved</button>}
                      {v.status === 'Contested' && <button className="btn btn-sm" style={{ background:'#F59E0B', color:'#fff', border:'none' }}>Update Contest</button>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="card">
            <h3 className="section-title">HOS Rules Quick Reference</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                { rule:'11-Hour Limit',    desc:'Max 11 hours driving after 10 consecutive hours off-duty' },
                { rule:'14-Hour Window',   desc:'No driving after 14th consecutive hour on-duty' },
                { rule:'30-Min Break',     desc:'Must take 30-min break before 8 hours of consecutive driving' },
                { rule:'10-Hour Off Duty', desc:'10 consecutive hours off-duty required between shifts' },
                { rule:'70/8 Limit',       desc:'Max 70 hours on-duty over any 8-consecutive-day period' },
                { rule:'34-Hour Restart',  desc:'34 consecutive hours off-duty resets the 70-hour clock' },
              ].map(r => (
                <div key={r.rule} style={{ background:'#F4F6F9', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontWeight:700, fontSize:12, color:'#2D3748', marginBottom:4 }}>⏱️ {r.rule}</div>
                  <div style={{ fontSize:11, color:'#718096', lineHeight:1.5 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SCORECARDS TAB ── */}
      {tab === 'scorecards' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[...DRIVER_SCORECARDS].sort((a,b) => b.overall - a.overall).map(d => {
              const clr = d.overall >= 90 ? '#38C770' : d.overall >= 75 ? '#F59E0B' : '#E53E3E'
              const lbl = d.overall >= 90 ? 'Excellent' : d.overall >= 75 ? 'Good' : 'Needs Work'
              return (
                <div key={d.driver} className="card" style={{ borderTop:`3px solid ${clr}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700 }}>
                      {d.driver.charAt(0)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{d.driver}</div>
                      <div style={{ fontSize:11, color:'#A0AEC0' }}>{d.truck}</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28, fontWeight:900, color:clr, lineHeight:1 }}>{d.overall}</div>
                      <div style={{ fontSize:10, color:clr, fontWeight:600 }}>{lbl}</div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                    {[
                      { label:'Documents',   value:d.docScore,  suffix:'%' },
                      { label:'HOS',         value:d.hosScore,  suffix:'%' },
                      { label:'Drug Testing',value:d.drugScore, suffix:'%' },
                      { label:'Inspections', value:d.inspScore, suffix:'%' },
                    ].map(m => {
                      const mc = m.value >= 90 ? '#276749' : m.value >= 75 ? '#744210' : '#C53030'
                      return (
                        <div key={m.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                          <div style={{ fontSize:10, color:'#A0AEC0' }}>{m.label}</div>
                          <div style={{ fontWeight:700, fontSize:14, color:mc, marginTop:1 }}>
                            {m.value}{m.suffix}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ background:'#E2E8F0', borderRadius:99, height:8, flex:1, overflow:'hidden' }}>
                      <div style={{ width:`${d.overall}%`, height:'100%', borderRadius:99, background:clr }} />
                    </div>
                    <span style={{ fontSize:12 }}>{d.trend==='up'?'📈':d.trend==='down'?'📉':'➡️'}</span>
                  </div>

                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, fontSize:11, color:'#A0AEC0' }}>
                    <span>{d.violations} violations YTD</span>
                    <span>Drug: {d.lastDrugTest}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddDoc && <AddDocModal onClose={()=>setShowAddDoc(false)} />}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DocRow({ doc: d, selected, onClick }:
  { doc:ComplianceDoc; selected?:boolean; onClick:()=>void }) {
  const cfg = {
    Valid:          { color:'#276749', bg:'#F0FFF4', border:'#9AE6B4' },
    'Expiring Soon':{ color:'#744210', bg:'#FFFBF0', border:'#F6AD55' },
    Expired:        { color:'#C53030', bg:'#FFF5F5', border:'#FC8181' },
    Pending:        { color:'#2B6CB0', bg:'#EBF8FF', border:'#90CDF4' },
  }
  const c = cfg[d.status]
  const catClr: Record<DocCategory,string> = { Company:'#9B59B6', Driver:'#4BAED4', Truck:'#38C770' }
  return (
    <div className="card" style={{
      padding:'11px 16px', cursor:'pointer',
      borderLeft:`4px solid ${c.border}`,
      boxShadow: selected ? `0 0 0 2px ${c.border}44` : undefined,
    }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
              background: catClr[d.category]+'22', color:catClr[d.category] }}>{d.category}</span>
            <span style={{ fontWeight:700, fontSize:13 }}>{d.name}</span>
          </div>
          <div style={{ fontSize:11, color:'#A0AEC0', marginTop:3 }}>
            {d.owner} · Expires: {d.expiry}
            {d.daysLeft > 0 && d.daysLeft < 999 && ` · ${d.daysLeft}d remaining`}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {!d.fileAttached && <span style={{ fontSize:11, color:'#F59E0B' }}>📎 No file</span>}
          <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99,
            background:c.bg, color:c.color }}>{d.status}</span>
        </div>
      </div>
      {d.notes && (
        <div style={{ fontSize:11, color:'#744210', marginTop:5, background:'#FFFBF0',
          padding:'4px 8px', borderRadius:4 }}>{d.notes}</div>
      )}
    </div>
  )
}

function DocDetailPanel({ doc: d, onClose }: { doc:ComplianceDoc; onClose:()=>void }) {
  const cfg = {
    Valid:          { color:'#38C770', gradient:'linear-gradient(135deg,#276749,#38A169)' },
    'Expiring Soon':{ color:'#F59E0B', gradient:'linear-gradient(135deg,#744210,#C05621)' },
    Expired:        { color:'#E53E3E', gradient:'linear-gradient(135deg,#C53030,#9B2C2C)' },
    Pending:        { color:'#4BAED4', gradient:'linear-gradient(135deg,#1A2535,#2D7A9A)' },
  }
  const c = cfg[d.status]
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{ background:c.gradient, padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>{d.id}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginTop:4 }}>📄 {d.name}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>{d.category} · {d.owner}</div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { label:'Status',    value:d.status  },
            { label:'Category',  value:d.category },
            { label:'Expires',   value:d.expiry  },
            { label:'Days Left', value: d.daysLeft > 0 && d.daysLeft < 999 ? `${d.daysLeft} days` : d.daysLeft < 0 ? 'OVERDUE' : 'N/A' },
          ].map(r => (
            <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
              <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
              <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1 }}>{r.value}</div>
            </div>
          ))}
        </div>
        {d.notes && (
          <div style={{ background:'#FFFBF0', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#744210' }}>
            📝 {d.notes}
          </div>
        )}
        <div style={{ borderTop:'1px solid var(--c-divider)', paddingTop:12 }}>
          <div style={{ fontWeight:600, fontSize:12, color:'#718096', marginBottom:8 }}>Document File</div>
          {d.fileAttached ? (
            <div style={{ background:'#F0FFF4', borderRadius:8, padding:'10px', textAlign:'center' }}>
              <div style={{ fontSize:22 }}>📎</div>
              <div style={{ fontSize:12, color:'#276749', fontWeight:600, marginTop:4 }}>File attached</div>
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <button className="btn btn-ghost btn-sm btn-full" style={{ fontSize:11 }}>👁️ View</button>
                <button className="btn btn-ghost btn-sm btn-full" style={{ fontSize:11 }}>🔄 Replace</button>
              </div>
            </div>
          ) : (
            <div style={{ border:'2px dashed #CBD5E0', borderRadius:8, padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:22 }}>📎</div>
              <div style={{ fontSize:12, color:'#A0AEC0', marginTop:4 }}>No file attached</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop:8 }}>Upload Document</button>
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm btn-full">✏️ Edit</button>
          {d.status !== 'Valid' && <button className="btn btn-primary btn-sm btn-full">🔄 Renew</button>}
        </div>
      </div>
    </div>
  )
}

function InspectionRow({ inspection: ins, selected, onClick, compact }:
  { inspection:Inspection; selected?:boolean; onClick?:()=>void; compact?:boolean }) {
  const resultCfg = {
    'Pass':          { bg:'#F0FFF4', color:'#276749', border:'#38C770' },
    'Fail':          { bg:'#FFF5F5', color:'#C53030', border:'#E53E3E' },
    'Pass with OOS': { bg:'#FFFBF0', color:'#744210', border:'#F59E0B' },
  }
  const rc = resultCfg[ins.result]
  return (
    <div className="card" style={{
      padding: compact ? '8px 12px' : '12px 16px',
      cursor: onClick ? 'pointer' : 'default',
      borderLeft:`4px solid ${rc.border}`,
      boxShadow: selected ? `0 0 0 2px ${rc.border}44` : undefined,
    }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:compact?12:13 }}>
            {ins.type} — {ins.truck}
          </div>
          <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>
            {ins.date} · {ins.driver} · {ins.location}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {ins.violations > 0 && (
            <span style={{ fontSize:11, color:'#E53E3E', fontWeight:700 }}>{ins.violations} viol.</span>
          )}
          <span style={{ fontWeight:900, fontSize:13, color: ins.score>=90?'#276749':'#C53030' }}>
            {ins.score}/100
          </span>
          <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
            background:rc.bg, color:rc.color }}>{ins.result}</span>
        </div>
      </div>
    </div>
  )
}

function InspectionDetailPanel({ inspection: ins, onClose }: { inspection:Inspection; onClose:()=>void }) {
  const rc = ins.result === 'Pass' ? 'linear-gradient(135deg,#276749,#38A169)' :
    ins.result === 'Fail' ? 'linear-gradient(135deg,#C53030,#9B2C2C)' :
    'linear-gradient(135deg,#744210,#C05621)'
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{ background:rc, padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>{ins.id}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:'#fff', marginTop:4 }}>🔍 {ins.type}</div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>{ins.date} · {ins.location}</div>
      </div>
      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { label:'Result',     value:ins.result  },
            { label:'Score',      value:`${ins.score}/100` },
            { label:'Driver',     value:ins.driver  },
            { label:'Truck',      value:ins.truck   },
            { label:'Violations', value:`${ins.violations}` },
            { label:'Date',       value:ins.date    },
          ].map(r => (
            <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
              <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
              <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1 }}>{r.value}</div>
            </div>
          ))}
        </div>
        {ins.notes && (
          <div style={{ background:'#FFFBF0', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#744210' }}>
            📝 {ins.notes}
          </div>
        )}
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-sm btn-full">📎 Attach Report</button>
          <button className="btn btn-primary btn-sm btn-full">Contest Result</button>
        </div>
      </div>
    </div>
  )
}

function AddDocModal({ onClose }: { onClose:()=>void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:520 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📄 Add Compliance Document</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, paddingBottom:8 }}>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Document Name</label>
            <input className="input" type="text" placeholder="e.g., Annual Inspection — Unit 03" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Category</label>
            <select className="input select">
              <option>Company</option><option>Driver</option><option>Truck</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Owner / Assigned To</label>
            <input className="input" type="text" placeholder="Unit 03 or Driver Name" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Expiry Date</label>
            <input className="input" type="date" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Status</label>
            <select className="input select">
              <option>Valid</option><option>Expiring Soon</option><option>Expired</option><option>Pending</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Upload Document</label>
            <input className="input" type="file" accept=".pdf,.jpg,.png" />
          </div>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Notes</label>
            <input className="input" type="text" placeholder="Optional notes..." />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:12 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={onClose}>Save Document</button>
        </div>
      </div>
    </div>
  )
}
