import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type IncidentType   = 'accident' | 'citation' | 'near-miss' | 'inspection' | 'theft' | 'weather'
type IncidentStatus = 'open' | 'under-review' | 'closed' | 'disputed'
type Severity       = 'critical' | 'major' | 'minor'

interface Incident {
  id: string
  date: string
  type: IncidentType
  driver: string
  truck: string
  location: string
  description: string
  severity: Severity
  status: IncidentStatus
  cost?: number
  reportedBy: string
  documents: string[]
  timeline: { time:string; event:string; author:string }[]
}

interface DriverSafety {
  id: string
  name: string
  truck: string
  score: number
  incidents: number
  citations: number
  inspections: number
  hoursCompliance: number
  lastIncident: string | null
  trend: 'up' | 'down' | 'stable'
  scoreHistory: number[]
  atFault: number
}

interface InsurancePolicy {
  id: string
  type: string
  carrier: string
  policyNum: string
  coverage: string
  premium: number
  deductible: number
  expiry: string
  status: 'active' | 'expiring-soon' | 'expired'
  contact: string
}

interface TrainingRecord {
  id: string
  driver: string
  course: string
  completedDate: string
  expiryDate: string
  status: 'current' | 'expiring' | 'expired'
  required: boolean
  provider: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INCIDENTS: Incident[] = [
  {
    id:'INC-001', date:'Apr 18', type:'accident', driver:'Tony Marshall', truck:'Unit 04',
    location:'I-70, Salina, KS', severity:'major', status:'under-review', cost:4200,
    reportedBy:'Tony Marshall',
    description:'Side-swipe collision with passenger vehicle during lane change. Minor damage to trailer right side panel. No injuries reported. Other party\'s insurance contacted.',
    documents:['Police Report', 'Photos'],
    timeline:[
      { time:'Apr 18 14:22', event:'Incident occurred — driver called dispatch', author:'Tony Marshall' },
      { time:'Apr 18 14:45', event:'Police report filed, case # KS-2025-4821', author:'KS Highway Patrol' },
      { time:'Apr 18 16:00', event:'Photos uploaded to claim portal', author:'Dispatch' },
      { time:'Apr 19 09:00', event:'Insurance claim opened — claim # PC-88441', author:'Progressive Commercial' },
    ],
  },
  {
    id:'INC-002', date:'Apr 15', type:'citation', driver:'Mike Rodriguez', truck:'Unit 02',
    location:'TX-20, El Paso, TX', severity:'minor', status:'closed', cost:350,
    reportedBy:'TX DOT',
    description:'Speeding citation — 78 mph in 65 mph zone. DOT officer issued $350 fine.',
    documents:['Citation Copy'],
    timeline:[
      { time:'Apr 15 11:15', event:'Citation issued by TX DOT Officer #4412', author:'TX DOT' },
      { time:'Apr 15 13:00', event:'Dispatch notified, driver counseled', author:'Dispatch' },
      { time:'Apr 16 10:00', event:'Fine paid online. Case closed.', author:'Dispatch' },
    ],
  },
  {
    id:'INC-003', date:'Apr 10', type:'inspection', driver:'Anna Perez', truck:'Unit 03',
    location:'Weigh station, I-95 FL', severity:'minor', status:'closed', cost:0,
    reportedBy:'FL DOT',
    description:'Level 2 roadside inspection. All items passed. Clean inspection record.',
    documents:['Inspection Report'],
    timeline:[
      { time:'Apr 10 08:45', event:'Level 2 inspection started at FL weigh station', author:'FL DOT' },
      { time:'Apr 10 09:30', event:'All checks passed. No violations found.', author:'FL DOT Officer #2210' },
    ],
  },
  {
    id:'INC-004', date:'Apr 7', type:'near-miss', driver:'James Carter', truck:'Unit 01',
    location:'I-90, Chicago, IL', severity:'minor', status:'closed', cost:0,
    reportedBy:'James Carter',
    description:'Deer on highway required emergency brake application. No collision. Driver reported via app.',
    documents:[],
    timeline:[
      { time:'Apr 7 22:10', event:'Emergency brake applied — deer on I-90', author:'James Carter' },
      { time:'Apr 7 22:12', event:'Report submitted via driver app', author:'James Carter' },
      { time:'Apr 8 08:00', event:'Reviewed by safety manager, no further action', author:'Safety Mgr' },
    ],
  },
  {
    id:'INC-005', date:'Mar 28', type:'accident', driver:'Sara Kim', truck:'Unit 05',
    location:'I-5, Sacramento, CA', severity:'major', status:'open', cost:2800,
    reportedBy:'Sara Kim',
    description:'Rear-end collision at truck stop. Low-speed impact. Bumper damage only. Other party filed insurance claim.',
    documents:['Photos', 'Driver Statement'],
    timeline:[
      { time:'Mar 28 07:40', event:'Low-speed rear collision at truck stop', author:'Sara Kim' },
      { time:'Mar 28 08:00', event:'Photos taken, driver statement submitted', author:'Sara Kim' },
      { time:'Mar 28 10:00', event:'3rd party filed insurance claim', author:'Progressive Commercial' },
      { time:'Apr 2 14:00',  event:'Adjuster assigned — pending inspection', author:'Progressive Commercial' },
    ],
  },
  {
    id:'INC-006', date:'Mar 15', type:'citation', driver:'Tony Marshall', truck:'Unit 04',
    location:'US-50, Pueblo, CO', severity:'critical', status:'closed', cost:1100,
    reportedBy:'CO DOT',
    description:'Hours of Service violation — 30-minute break not taken. $1,100 federal fine.',
    documents:['Citation Copy', 'ELD Report'],
    timeline:[
      { time:'Mar 15 16:30', event:'HOS violation flagged by DOT officer', author:'CO DOT' },
      { time:'Mar 15 17:00', event:'$1,100 fine issued, ELD data pulled', author:'CO DOT Officer #3304' },
      { time:'Mar 17 09:00', event:'Driver counseling completed, fine paid', author:'Safety Mgr' },
    ],
  },
  {
    id:'INC-007', date:'Mar 5', type:'theft', driver:'Mike Rodriguez', truck:'Unit 02',
    location:'Rest area, I-10 AZ', severity:'major', status:'closed', cost:1500,
    reportedBy:'Mike Rodriguez',
    description:'Cargo theft at rest area. 3 pallets of electronics missing from trailer. Police report filed.',
    documents:['Police Report', 'Cargo Manifest', 'Security Footage'],
    timeline:[
      { time:'Mar 5 02:00', event:'Theft discovered upon waking at rest area', author:'Mike Rodriguez' },
      { time:'Mar 5 02:15', event:'AZ DPS called, report filed', author:'Mike Rodriguez' },
      { time:'Mar 5 10:00', event:'Cargo insurance claim filed — claim # GW-9912', author:'Dispatch' },
      { time:'Mar 10 14:00', event:'Claim approved, $1,500 payout after deductible', author:'Great West' },
    ],
  },
]

const DRIVER_SAFETY: DriverSafety[] = [
  { id:'d1', name:'James Carter',   truck:'Unit 01', score:98, incidents:1, citations:0, inspections:3, hoursCompliance:100, lastIncident:null,    trend:'stable', scoreHistory:[95,96,97,96,98,98], atFault:0 },
  { id:'d2', name:'Mike Rodriguez', truck:'Unit 02', score:87, incidents:2, citations:1, inspections:2, hoursCompliance:94,  lastIncident:'Apr 15', trend:'down',   scoreHistory:[92,91,90,89,88,87], atFault:1 },
  { id:'d3', name:'Anna Perez',     truck:'Unit 03', score:94, incidents:0, citations:0, inspections:1, hoursCompliance:100, lastIncident:null,    trend:'up',     scoreHistory:[90,91,92,92,93,94], atFault:0 },
  { id:'d4', name:'Tony Marshall',  truck:'Unit 04', score:71, incidents:3, citations:2, inspections:2, hoursCompliance:82,  lastIncident:'Apr 18', trend:'down',   scoreHistory:[80,79,77,75,73,71], atFault:2 },
  { id:'d5', name:'Sara Kim',       truck:'Unit 05', score:83, incidents:1, citations:0, inspections:1, hoursCompliance:97,  lastIncident:'Mar 28', trend:'stable', scoreHistory:[82,83,84,83,84,83], atFault:0 },
]

const POLICIES: InsurancePolicy[] = [
  { id:'p1', type:'Primary Liability',     carrier:'Progressive Commercial', policyNum:'PC-8812-4421', coverage:'$1,000,000', deductible:5000,  premium:8400,  expiry:'Dec 31, 2025', status:'active',        contact:'1-800-776-4737' },
  { id:'p2', type:'Cargo Insurance',       carrier:'Great West Casualty',    policyNum:'GW-3301-8877', coverage:'$100,000',   deductible:2500,  premium:3200,  expiry:'Jul 15, 2025', status:'expiring-soon', contact:'1-800-228-8040' },
  { id:'p3', type:'Physical Damage',       carrier:'National Indemnity',     policyNum:'NI-7745-2290', coverage:'ACV',        deductible:1000,  premium:5600,  expiry:'Dec 31, 2025', status:'active',        contact:'1-402-536-3000' },
  { id:'p4', type:'Bobtail / NTL',         carrier:'Protective Insurance',   policyNum:'PI-4421-5566', coverage:'$1,000,000', deductible:500,   premium:1800,  expiry:'Dec 31, 2025', status:'active',        contact:'1-800-264-7660' },
  { id:'p5', type:'Occupational Accident', carrier:'Zurich Insurance',       policyNum:'ZU-9910-3341', coverage:'$500,000',   deductible:0,     premium:2100,  expiry:'Mar 31, 2025', status:'expired',       contact:'1-800-987-3373' },
]

const TRAINING: TrainingRecord[] = [
  { id:'t1', driver:'James Carter',   course:'Smith System Driving',      completedDate:'Jan 15 2025', expiryDate:'Jan 15 2027', status:'current',  required:true,  provider:'Smith System' },
  { id:'t2', driver:'James Carter',   course:'Hazmat Awareness',          completedDate:'Mar 1 2025',  expiryDate:'Mar 1 2028',  status:'current',  required:true,  provider:'J.J. Keller' },
  { id:'t3', driver:'Mike Rodriguez', course:'Smith System Driving',      completedDate:'Feb 10 2023', expiryDate:'Feb 10 2025', status:'expired',  required:true,  provider:'Smith System' },
  { id:'t4', driver:'Mike Rodriguez', course:'Cargo Securement',          completedDate:'Apr 5 2024',  expiryDate:'Apr 5 2026',  status:'current',  required:true,  provider:'FMCSA Online' },
  { id:'t5', driver:'Anna Perez',     course:'Defensive Driving',         completedDate:'Nov 20 2024', expiryDate:'Nov 20 2027', status:'current',  required:true,  provider:'NSC' },
  { id:'t6', driver:'Tony Marshall',  course:'Smith System Driving',      completedDate:'Jun 1 2024',  expiryDate:'Jun 1 2026',  status:'current',  required:true,  provider:'Smith System' },
  { id:'t7', driver:'Tony Marshall',  course:'HOS & ELD Training',        completedDate:'Aug 15 2022', expiryDate:'Aug 15 2024', status:'expired',  required:true,  provider:'J.J. Keller' },
  { id:'t8', driver:'Sara Kim',       course:'Defensive Driving',         completedDate:'Dec 10 2024', expiryDate:'Dec 10 2027', status:'current',  required:true,  provider:'NSC' },
  { id:'t9', driver:'Sara Kim',       course:'Load Securement Advanced',  completedDate:'Apr 20 2025', expiryDate:'Apr 20 2028', status:'current',  required:false, provider:'Fleet Safety Inst.' },
]

const MONTHLY_COSTS = [
  { month:'Dec', cost:1200 },
  { month:'Jan', cost:0    },
  { month:'Feb', cost:350  },
  { month:'Mar', cost:2600 },
  { month:'Apr', cost:4550 },
  { month:'May', cost:0    },
]

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SafetyPage() {
  const [tab,           setTab]          = useState<'overview' | 'incidents' | 'scores' | 'insurance' | 'training'>('overview')
  const [selectedInc,   setSelectedInc]  = useState<Incident | null>(null)
  const [typeFilter,    setTypeFilter]   = useState<'all' | IncidentType>('all')
  const [statusFilter,  setStatusFilter] = useState<'all' | IncidentStatus>('all')
  const [showAddModal,  setShowAddModal] = useState(false)

  const openCount    = INCIDENTS.filter(i => i.status==='open' || i.status==='under-review').length
  const totalCost    = INCIDENTS.reduce((s,i) => s + (i.cost ?? 0), 0)
  const avgScore     = Math.round(DRIVER_SAFETY.reduce((s,d) => s+d.score, 0) / DRIVER_SAFETY.length)
  const expiringSoon = POLICIES.filter(p => p.status==='expiring-soon' || p.status==='expired').length
  const expiredTraining = TRAINING.filter(t => t.status==='expired' && t.required).length

  const filteredInc = INCIDENTS.filter(i => {
    if (typeFilter   !== 'all' && i.type   !== typeFilter)   return false
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    return true
  })

  const urgentCount = openCount + expiringSoon + expiredTraining

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:0 }}>
        <button className={`tab-btn ${tab==='overview'?'active':''}`}  onClick={()=>setTab('overview')}>🛡️ Overview</button>
        <button className={`tab-btn ${tab==='incidents'?'active':''}`} onClick={()=>setTab('incidents')}>
          ⚠️ Incidents
          {openCount > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{openCount}</span>}
        </button>
        <button className={`tab-btn ${tab==='scores'?'active':''}`}    onClick={()=>setTab('scores')}>📊 Safety Scores</button>
        <button className={`tab-btn ${tab==='insurance'?'active':''}`} onClick={()=>setTab('insurance')}>
          📋 Insurance
          {expiringSoon > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{expiringSoon}</span>}
        </button>
        <button className={`tab-btn ${tab==='training'?'active':''}`}  onClick={()=>setTab('training')}>
          🎓 Training
          {expiredTraining > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{expiredTraining}</span>}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Fleet Safety Score', value:`${avgScore}/100`,                  color: avgScore>=90?'#38C770':avgScore>=75?'#F59E0B':'#E53E3E', icon:'🛡️' },
          { label:'Open Incidents',     value:`${openCount}`,                     color: openCount>0?'#E53E3E':'#38C770', icon:'⚠️' },
          { label:'YTD Incident Cost',  value:`$${totalCost.toLocaleString()}`,   color:'#E53E3E', icon:'💸' },
          { label:'Urgent Actions',     value: urgentCount>0?`${urgentCount} items`:'✓ All Clear', color: urgentCount>0?'#E53E3E':'#38C770', icon:'🚨' },
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
              {INCIDENTS.filter(i=>i.status==='open'||i.status==='under-review').map(i => (
                <div key={i.id} style={{ background:'#FFF5F5', border:'1px solid #FC8181', borderRadius:10,
                  padding:'12px 16px', display:'flex', gap:12, alignItems:'center' }}>
                  <span style={{ fontSize:20 }}>{typeIcon(i.type)}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#C53030', fontSize:13 }}>{i.id}: {i.type.charAt(0).toUpperCase()+i.type.slice(1)} — {i.driver}</div>
                    <div style={{ fontSize:12, color:'#E53E3E', marginTop:2 }}>{i.status.replace('-',' ')} · {i.date} · {i.location}</div>
                  </div>
                  <button className="btn btn-sm" style={{ background:'#E53E3E', color:'#fff', border:'none' }}
                    onClick={()=>{ setSelectedInc(i); setTab('incidents') }}>Review →</button>
                </div>
              ))}
              {POLICIES.filter(p=>p.status!=='active').map(p => (
                <div key={p.id} style={{ background:'#FFFBF0', border:'1px solid #F6AD55', borderRadius:10,
                  padding:'12px 16px', display:'flex', gap:12, alignItems:'center' }}>
                  <span style={{ fontSize:20 }}>📋</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#744210', fontSize:13 }}>{p.type} {p.status==='expired'?'EXPIRED':'expiring soon'}</div>
                    <div style={{ fontSize:12, color:'#C05621', marginTop:2 }}>{p.carrier} · {p.expiry}</div>
                  </div>
                  <button className="btn btn-sm" style={{ background:'#F59E0B', color:'#fff', border:'none' }}
                    onClick={()=>setTab('insurance')}>Renew →</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            {/* Driver scores */}
            <div className="card">
              <h3 className="section-title">Driver Safety Scores</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[...DRIVER_SAFETY].sort((a,b)=>b.score-a.score).map(d => {
                  const scoreColor = d.score>=90?'#38C770':d.score>=75?'#F59E0B':'#E53E3E'
                  return (
                    <div key={d.id} style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700, flexShrink:0 }}>
                        {d.name.charAt(0)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontWeight:700, fontSize:13 }}>{d.name}</span>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ fontSize:11, color:'#A0AEC0' }}>{d.truck}</span>
                            <span style={{ fontWeight:900, fontSize:15, color:scoreColor }}>{d.score}</span>
                            <span style={{ fontSize:12 }}>{d.trend==='up'?'📈':d.trend==='down'?'📉':'➡️'}</span>
                          </div>
                        </div>
                        <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden' }}>
                          <div style={{ width:`${d.score}%`, height:'100%', borderRadius:99, background:scoreColor, transition:'width .4s' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Incident cost trend */}
            <div className="card">
              <h3 className="section-title">Monthly Incident Cost</h3>
              <IncidentCostChart data={MONTHLY_COSTS} />
              <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
                <h4 style={{ fontSize:12, fontWeight:700, color:'#718096', margin:0 }}>Cost by Type</h4>
                {[
                  { type:'Accidents', cost:7000, color:'#E53E3E' },
                  { type:'Citations', cost:1450, color:'#F59E0B' },
                  { type:'Theft',     cost:1500, color:'#9B59B6' },
                ].map(c => {
                  const pct = (c.cost / totalCost) * 100
                  return (
                    <div key={c.type}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                        <span style={{ fontWeight:600 }}>{c.type}</span>
                        <span style={{ color:c.color, fontWeight:700 }}>${c.cost.toLocaleString()}</span>
                      </div>
                      <div style={{ background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:c.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent incidents */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h3 className="section-title" style={{ margin:0 }}>Recent Incidents</h3>
              <button className="btn btn-ghost btn-sm" onClick={()=>setTab('incidents')}>View All →</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {INCIDENTS.slice(0,4).map(inc => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  onClick={()=>{ setSelectedInc(inc); setTab('incidents') }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INCIDENTS TAB ── */}
      {tab === 'incidents' && (
        <div style={{ display:'flex', gap:20, alignItems:'flex-start' }}>
          <div style={{ flex:1 }}>
            <div className="card" style={{ padding:'12px 16px', marginBottom:14 }}>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#718096', fontWeight:600 }}>Type:</span>
                {(['all','accident','citation','inspection','near-miss','theft','weather'] as const).map(t => (
                  <button key={t} className={`btn btn-sm ${typeFilter===t?'btn-primary':'btn-ghost'}`}
                    onClick={()=>setTypeFilter(t)}>
                    {t==='all'?'All':t.charAt(0).toUpperCase()+t.slice(1).replace('-',' ')}
                  </button>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginLeft:'auto' }}
                  onClick={()=>setShowAddModal(true)}>+ Report Incident</button>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginTop:8 }}>
                <span style={{ fontSize:12, color:'#718096', fontWeight:600 }}>Status:</span>
                {(['all','open','under-review','closed','disputed'] as const).map(s => (
                  <button key={s} className={`btn btn-sm ${statusFilter===s?'btn-primary':'btn-ghost'}`}
                    onClick={()=>setStatusFilter(s)}>
                    {s==='all'?'All':s.charAt(0).toUpperCase()+s.slice(1).replace('-',' ')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filteredInc.map(inc => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  selected={selectedInc?.id===inc.id}
                  onClick={()=>setSelectedInc(selectedInc?.id===inc.id ? null : inc)}
                />
              ))}
              {filteredInc.length === 0 && (
                <div style={{ textAlign:'center', padding:60, color:'#A0AEC0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                  <div style={{ fontWeight:600 }}>No incidents found</div>
                </div>
              )}
            </div>
          </div>

          {selectedInc && (
            <div style={{ width:380, flexShrink:0 }}>
              <IncidentDetailPanel incident={selectedInc} onClose={()=>setSelectedInc(null)} />
            </div>
          )}
        </div>
      )}

      {/* ── SAFETY SCORES TAB ── */}
      {tab === 'scores' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[...DRIVER_SAFETY].sort((a,b)=>b.score-a.score).map(d => {
              const clr = d.score>=90?'#38C770':d.score>=75?'#F59E0B':'#E53E3E'
              const lbl = d.score>=90?'Excellent':d.score>=75?'Good':'Needs Work'
              return (
                <div key={d.id} className="card" style={{ borderTop:`3px solid ${clr}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700 }}>
                      {d.name.charAt(0)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{d.name}</div>
                      <div style={{ fontSize:11, color:'#A0AEC0' }}>{d.truck}</div>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:28, fontWeight:900, color:clr, lineHeight:1 }}>{d.score}</div>
                      <div style={{ fontSize:10, color:clr, fontWeight:600 }}>{lbl}</div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                    {[
                      { label:'Incidents',      value:d.incidents,               good:d.incidents===0 },
                      { label:'At-Fault',       value:d.atFault,                 good:d.atFault===0   },
                      { label:'Citations',      value:d.citations,               good:d.citations===0 },
                      { label:'HOS Compliance', value:`${d.hoursCompliance}%`,   good:d.hoursCompliance>=95 },
                    ].map(m => (
                      <div key={m.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color:'#A0AEC0' }}>{m.label}</div>
                        <div style={{ fontWeight:700, fontSize:13, color: m.good ? '#276749' : '#C53030', marginTop:1 }}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Score sparkline */}
                  <div style={{ marginBottom:8 }}>
                    <div style={{ fontSize:10, color:'#A0AEC0', marginBottom:4 }}>6-month trend</div>
                    <ScoreSparkline data={d.scoreHistory} color={clr} />
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ background:'#E2E8F0', borderRadius:99, height:8, flex:1, overflow:'hidden' }}>
                      <div style={{ width:`${d.score}%`, height:'100%', borderRadius:99, background:clr }} />
                    </div>
                    <span style={{ fontSize:12 }}>{d.trend==='up'?'📈':d.trend==='down'?'📉':'➡️'}</span>
                  </div>

                  {d.lastIncident && (
                    <div style={{ fontSize:11, color:'#A0AEC0', marginTop:8 }}>
                      Last incident: {d.lastIncident}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Fleet safety benchmarks */}
          <div className="card">
            <h3 className="section-title">Fleet Safety Benchmarks</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                { label:'Avg Safety Score',         value:`${avgScore}/100`,   target:'> 85',  good: avgScore >= 85 },
                { label:'Incidents per 100k mi',    value:'1.8',               target:'< 2.0', good:true },
                { label:'Citation Rate',            value:'0.4/driver',        target:'< 0.5', good:true },
                { label:'Fleet HOS Compliance',     value:`${Math.round(DRIVER_SAFETY.reduce((s,d)=>s+d.hoursCompliance,0)/DRIVER_SAFETY.length)}%`, target:'> 95%', good:false },
              ].map(b => (
                <div key={b.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:6 }}>{b.label}</div>
                  <div style={{ fontSize:20, fontWeight:900, color: b.good?'#38C770':'#F59E0B' }}>{b.value}</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>Target: {b.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INSURANCE TAB ── */}
      {tab === 'insurance' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {POLICIES.filter(p=>p.status!=='active').length > 0 && (
            <div style={{ background:'#FFFBF0', border:'1px solid #F6AD55', borderRadius:10,
              padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:20 }}>⚠️</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'#744210', fontSize:13 }}>
                  Action required: {POLICIES.filter(p=>p.status!=='active').length} policies need attention
                </div>
                <div style={{ fontSize:12, color:'#C05621', marginTop:2 }}>
                  {POLICIES.filter(p=>p.status!=='active').map(p=>p.type).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Total premium summary */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {[
              { label:'Annual Premium Total', value:`$${POLICIES.reduce((s,p)=>s+p.premium,0).toLocaleString()}/yr`, color:'#4BAED4' },
              { label:'Active Policies',      value:`${POLICIES.filter(p=>p.status==='active').length}`,             color:'#38C770' },
              { label:'Policies Needing Action', value:`${expiringSoon}`,                                            color: expiringSoon>0?'#E53E3E':'#38C770' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
                <div className="stat-value" style={{ color:s.color, fontSize:22 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {POLICIES.map(p => {
              const statusColor = p.status==='active'?'#38C770':p.status==='expiring-soon'?'#F59E0B':'#E53E3E'
              const statusLabel = p.status==='active'?'Active':p.status==='expiring-soon'?'Expiring Soon':'Expired'
              return (
                <div key={p.id} className="card" style={{ borderLeft:`4px solid ${statusColor}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#2D3748' }}>{p.type}</div>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99,
                      background: p.status==='active'?'#F0FFF4':p.status==='expiring-soon'?'#FFFBF0':'#FFF5F5',
                      color: statusColor }}>{statusLabel}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      { label:'Carrier',     value:p.carrier     },
                      { label:'Policy #',    value:p.policyNum   },
                      { label:'Coverage',    value:p.coverage    },
                      { label:'Deductible',  value:`$${p.deductible.toLocaleString()}` },
                      { label:'Premium',     value:`$${p.premium.toLocaleString()}/yr` },
                      { label:'Expires',     value:p.expiry      },
                    ].map(r => (
                      <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                        <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
                        <div style={{ fontWeight:600, fontSize:12, color:'#2D3748', marginTop:1 }}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12, display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'#A0AEC0', flex:1 }}>📞 {p.contact}</span>
                    {p.status !== 'active' && (
                      <button className="btn btn-primary btn-sm"
                        style={{ background: p.status==='expired'?'#E53E3E':undefined }}>
                        {p.status==='expired' ? '⚠️ Renew Now' : '📅 Schedule Renewal'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TRAINING TAB ── */}
      {tab === 'training' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {expiredTraining > 0 && (
            <div style={{ background:'#FFF5F5', border:'1px solid #FC8181', borderRadius:10,
              padding:'12px 16px', display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:20 }}>🎓</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:'#C53030', fontSize:13 }}>
                  {expiredTraining} required training course{expiredTraining>1?'s':''} expired
                </div>
                <div style={{ fontSize:12, color:'#E53E3E', marginTop:2 }}>
                  {TRAINING.filter(t=>t.status==='expired'&&t.required).map(t=>`${t.driver} — ${t.course}`).join('; ')}
                </div>
              </div>
              <button className="btn btn-sm" style={{ background:'#E53E3E', color:'#fff', border:'none' }}>
                Schedule Training
              </button>
            </div>
          )}

          {/* Per-driver training summary */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {DRIVER_SAFETY.map(d => {
              const driverTraining = TRAINING.filter(t => t.driver === d.name)
              const current  = driverTraining.filter(t => t.status==='current').length
              const expired2 = driverTraining.filter(t => t.status==='expired').length
              const total    = driverTraining.length
              const pct = total ? Math.round((current/total)*100) : 100
              const clr = pct===100?'#38C770':pct>=75?'#F59E0B':'#E53E3E'
              return (
                <div key={d.id} className="card" style={{ borderTop:`3px solid ${clr}` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700, flexShrink:0 }}>
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{d.name}</div>
                      <div style={{ fontSize:11, color:'#A0AEC0' }}>{d.truck}</div>
                    </div>
                    <div style={{ marginLeft:'auto', fontSize:18, fontWeight:900, color:clr }}>{pct}%</div>
                  </div>
                  <div style={{ background:'#E2E8F0', borderRadius:99, height:8, overflow:'hidden', marginBottom:8 }}>
                    <div style={{ width:`${pct}%`, height:'100%', borderRadius:99, background:clr }} />
                  </div>
                  <div style={{ fontSize:11, color:'#718096' }}>
                    {current} current · {expired2} expired · {total} total
                  </div>
                </div>
              )
            })}
          </div>

          {/* Training records table */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 className="section-title" style={{ margin:0 }}>Training Records</h3>
              <button className="btn btn-primary btn-sm">+ Log Training</button>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F4F6F9' }}>
                  {['Driver','Course','Completed','Expires','Provider','Status','Required'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'#718096' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRAINING.map(t => {
                  const sc = {
                    current:  { bg:'#F0FFF4', color:'#276749' },
                    expiring: { bg:'#FFFBF0', color:'#744210' },
                    expired:  { bg:'#FFF5F5', color:'#C53030' },
                  }[t.status]
                  return (
                    <tr key={t.id} style={{ borderBottom:'1px solid var(--c-divider)' }}>
                      <td style={{ padding:'10px 12px', fontWeight:600, fontSize:13 }}>{t.driver}</td>
                      <td style={{ padding:'10px 12px', fontSize:12 }}>{t.course}</td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#718096' }}>{t.completedDate}</td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#718096' }}>{t.expiryDate}</td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#718096' }}>{t.provider}</td>
                      <td style={{ padding:'10px 12px' }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          background:sc.bg, color:sc.color }}>
                          {t.status.charAt(0).toUpperCase()+t.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding:'10px 12px' }}>
                        <span style={{ fontSize:12, color: t.required?'#E53E3E':'#A0AEC0', fontWeight:t.required?700:400 }}>
                          {t.required ? '✓ Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && <AddIncidentModal onClose={()=>setShowAddModal(false)} />}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function typeIcon(type: IncidentType) {
  return type==='accident'?'🚨':type==='citation'?'🚔':type==='inspection'?'🔍':type==='theft'?'🔓':type==='weather'?'🌩️':'⚠️'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IncidentRow({ incident: i, selected, onClick }:
  { incident:Incident; selected?:boolean; onClick:()=>void }) {
  const sevColor = i.severity==='critical'?'#E53E3E':i.severity==='major'?'#F59E0B':'#38C770'
  return (
    <div className="card" style={{
      padding:'12px 16px', cursor:'pointer',
      borderLeft:`4px solid ${sevColor}`,
      boxShadow: selected ? `0 0 0 2px ${sevColor}33, 0 4px 12px rgba(0,0,0,.06)` : undefined,
    }} onClick={onClick}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:18 }}>{typeIcon(i.type)}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:'#2D3748' }}>
              {i.type.charAt(0).toUpperCase()+i.type.slice(1).replace('-',' ')} — {i.driver}
            </div>
            <div style={{ fontSize:11, color:'#A0AEC0' }}>{i.date} · {i.location} · {i.truck}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          {i.cost ? <span style={{ fontSize:12, fontWeight:700, color:'#E53E3E' }}>${i.cost.toLocaleString()}</span> : null}
          <StatusBadge status={i.status} />
        </div>
      </div>
      <div style={{ fontSize:12, color:'#718096', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {i.description}
      </div>
      {i.documents.length > 0 && (
        <div style={{ display:'flex', gap:6, marginTop:6 }}>
          {i.documents.map(d => (
            <span key={d} style={{ fontSize:10, padding:'2px 6px', borderRadius:4,
              background:'#EBF8FF', color:'#2B6CB0' }}>📎 {d}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function IncidentDetailPanel({ incident: i, onClose }: { incident:Incident; onClose:()=>void }) {
  const [subTab, setSubTab] = useState<'info'|'timeline'>('info')
  const gradBg = i.severity==='critical'?'linear-gradient(135deg,#C53030,#9B2C2C)':
    i.severity==='major'?'linear-gradient(135deg,#C05621,#9C4221)':
    'linear-gradient(135deg,#1A2535,#2D7A9A)'
  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{ background:gradBg, padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>{i.id}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize:16, fontWeight:800, color:'#fff', marginTop:4 }}>
          {typeIcon(i.type)} {i.type.charAt(0).toUpperCase()+i.type.slice(1).replace('-',' ')}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>
          {i.date} · {i.location}
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--c-divider)' }}>
        {(['info','timeline'] as const).map(t => (
          <button key={t} onClick={()=>setSubTab(t)}
            style={{ flex:1, padding:'10px', fontSize:12, fontWeight:600, background:'none', border:'none',
              cursor:'pointer', color:subTab===t?'#4BAED4':'#A0AEC0',
              borderBottom:`2px solid ${subTab===t?'#4BAED4':'transparent'}` }}>
            {t==='info'?'📋 Details':'⏱️ Timeline'}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
        {subTab === 'info' && (
          <>
            <div style={{ fontSize:13, color:'#4A5568', lineHeight:1.6 }}>{i.description}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Driver',     value:i.driver },
                { label:'Truck',      value:i.truck  },
                { label:'Severity',   value:i.severity },
                { label:'Status',     value:i.status.replace('-',' ') },
                ...(i.cost ? [{ label:'Est. Cost', value:`$${i.cost.toLocaleString()}` }] : []),
                { label:'Reported By', value:i.reportedBy },
              ].map(r => (
                <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1, textTransform:'capitalize' }}>
                    {r.value}
                  </div>
                </div>
              ))}
            </div>
            {i.documents.length > 0 && (
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'#718096', marginBottom:6 }}>Attached Documents</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {i.documents.map(d => (
                    <span key={d} style={{ fontSize:11, padding:'4px 10px', borderRadius:6,
                      background:'#EBF8FF', color:'#2B6CB0', cursor:'pointer', fontWeight:600 }}>
                      📎 {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <StatusBadge status={i.status} />
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary btn-full btn-sm">Update Status</button>
              <button className="btn btn-ghost btn-full btn-sm">📎 Attach Docs</button>
            </div>
          </>
        )}
        {subTab === 'timeline' && (
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {i.timeline.map((event, idx) => (
              <div key={idx} style={{ display:'flex', gap:12, paddingBottom: idx < i.timeline.length-1 ? 16 : 0 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:5,
                    background: idx===0?'#4BAED4':'#CBD5E0', marginTop:3, flexShrink:0 }} />
                  {idx < i.timeline.length-1 && (
                    <div style={{ width:2, flex:1, background:'#E2E8F0', marginTop:4 }} />
                  )}
                </div>
                <div style={{ paddingBottom:4 }}>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:2 }}>{event.time}</div>
                  <div style={{ fontSize:13, color:'#2D3748', lineHeight:1.5 }}>{event.event}</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>— {event.author}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const cfg = {
    'open':         { label:'Open',          bg:'#FFF5F5', color:'#C53030' },
    'under-review': { label:'Under Review',  bg:'#FFFBF0', color:'#744210' },
    'closed':       { label:'Closed',        bg:'#F0FFF4', color:'#276749' },
    'disputed':     { label:'Disputed',      bg:'#FAF5FF', color:'#553C9A' },
  }
  const c = cfg[status]
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:c.bg, color:c.color }}>
      {c.label}
    </span>
  )
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function IncidentCostChart({ data }: { data: { month:string; cost:number }[] }) {
  const max = Math.max(...data.map(d => d.cost), 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:90 }}>
      {data.map((d, i) => {
        const pct = (d.cost / max) * 100
        const isCurrent = i === data.length - 1
        return (
          <div key={d.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            {d.cost > 0 && (
              <div style={{ fontSize:9, color: isCurrent?'#E53E3E':'#A0AEC0', fontWeight:isCurrent?700:400 }}>
                ${(d.cost/1000).toFixed(1)}k
              </div>
            )}
            <div style={{ width:'100%', height:60, display:'flex', alignItems:'flex-end' }}>
              <div style={{ width:'100%', height:`${Math.max(pct,4)}%`,
                background: d.cost===0 ? '#F4F6F9' : isCurrent?'#E53E3E':'linear-gradient(180deg,#FC8181,#E53E3E)',
                borderRadius:'4px 4px 0 0', transition:'height .4s', opacity: d.cost===0?0.4:1 }} />
            </div>
            <div style={{ fontSize:9, color:'#A0AEC0' }}>{d.month}</div>
          </div>
        )
      })}
    </div>
  )
}

function ScoreSparkline({ data, color }: { data:number[]; color:string }) {
  const minV = Math.min(...data) - 3
  const maxV = Math.max(...data) + 3
  const w = 120, h = 30
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1))*(w-4)+2
    const y = h - ((v-minV)/(maxV-minV))*(h-4)-2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height:30 }}>
      <polyline fill="none" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.7" />
      {data.map((v,i) => {
        const x = (i/(data.length-1))*(w-4)+2
        const y = h - ((v-minV)/(maxV-minV))*(h-4)-2
        return i===data.length-1 ? (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        ) : null
      })}
    </svg>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function AddIncidentModal({ onClose }: { onClose:()=>void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:580 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⚠️ Report New Incident</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, paddingBottom:8 }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Date</label>
            <input className="input" type="date" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Location</label>
            <input className="input" type="text" placeholder="City, State" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Incident Type</label>
            <select className="input select">
              {['Accident','Citation','Inspection','Near-Miss','Theft','Weather'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Severity</label>
            <select className="input select">
              <option>Minor</option><option>Major</option><option>Critical</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Driver</label>
            <select className="input select">
              {['James Carter','Mike Rodriguez','Anna Perez','Tony Marshall','Sara Kim'].map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Truck Unit</label>
            <select className="input select">
              {['Unit 01','Unit 02','Unit 03','Unit 04','Unit 05'].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
            <label className="form-label">Description</label>
            <textarea className="input" rows={3} placeholder="Describe what happened..." style={{ resize:'vertical' }} />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Estimated Cost ($)</label>
            <input className="input" type="number" placeholder="0" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Attach Document</label>
            <input className="input" type="file" accept=".pdf,.jpg,.png" />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:12 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={onClose}>Submit Report</button>
        </div>
      </div>
    </div>
  )
}
