import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type LoadStatus = 'unassigned' | 'assigned' | 'in-transit' | 'delivered' | 'issue'
type Priority   = 'hot' | 'normal' | 'low'
type ViewMode   = 'board' | 'list' | 'timeline'

interface DispatchLoad {
  id: string
  ref: string
  from: string; fromState: string
  to: string;   toState: string
  miles: number
  payout: number
  rpm: number
  pickup: string
  delivery: string
  broker: string
  brokerRating: number
  type: string
  weight: string
  status: LoadStatus
  priority: Priority
  driver: string | null
  truck: string | null
  driverPhone?: string
  progress?: number
  note?: string
  tags?: string[]
  eta?: string
  checkIns?: { time:string; location:string; note?:string }[]
  documents?: string[]
}

interface Driver {
  id: string
  name: string
  truck: string
  status: 'available' | 'on-load' | 'off-duty'
  currentLoad?: string
  phone: string
  rating: number
  hosRemaining: number    // hours available
  homeBased: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DRIVERS: Driver[] = [
  { id:'d1', name:'James Carter',    truck:'Unit 01 — Freightliner',  status:'available',  phone:'(555) 201-4411', rating:4.9, hosRemaining:11,  homeBased:'Chicago, IL' },
  { id:'d2', name:'Mike Rodriguez',  truck:'Unit 02 — Peterbilt 389', status:'on-load',    currentLoad:'L-003',  phone:'(555) 307-8822', rating:4.7, hosRemaining:7.5, homeBased:'Dallas, TX' },
  { id:'d3', name:'Anna Perez',      truck:'Unit 03 — Kenworth T680', status:'available',  phone:'(555) 419-6633', rating:4.8, hosRemaining:10,  homeBased:'Atlanta, GA' },
  { id:'d4', name:'Tony Marshall',   truck:'Unit 04 — Volvo VNL',     status:'off-duty',   phone:'(555) 522-9944', rating:4.6, hosRemaining:0,   homeBased:'Denver, CO' },
  { id:'d5', name:'Sara Kim',        truck:'Unit 05 — Mack Anthem',   status:'available',  phone:'(555) 634-1155', rating:4.5, hosRemaining:9,   homeBased:'Los Angeles, CA' },
]

const INIT_LOADS: DispatchLoad[] = [
  { id:'L-001', ref:'EG-920441', from:'Chicago',    fromState:'IL', to:'Dallas',      toState:'TX', miles:850,  payout:1854, rpm:2.18, pickup:'May 12', delivery:'May 13', broker:'Echo Global',       brokerRating:4.6, type:'Dry Van',  weight:'42,000 lbs', status:'unassigned', priority:'hot',    driver:null,           truck:null,                   tags:['HAZ-MAT'],  documents:[] },
  { id:'L-002', ref:'CL-773201', from:'Atlanta',    fromState:'GA', to:'Miami',       toState:'FL', miles:662,  payout:1622, rpm:2.45, pickup:'May 12', delivery:'May 13', broker:'Coyote Logistics',  brokerRating:4.8, type:'Reefer',   weight:'38,500 lbs', status:'assigned',   priority:'normal', driver:'James Carter',  truck:'Unit 01 — Freightliner', documents:['BOL'], eta:'May 13 14:00' },
  { id:'L-003', ref:'TQ-554832', from:'Houston',    fromState:'TX', to:'Phoenix',     toState:'AZ', miles:1201, payout:2786, rpm:2.32, pickup:'May 11', delivery:'May 13', broker:'TQL',               brokerRating:4.4, type:'Flatbed',  weight:'44,000 lbs', status:'in-transit', priority:'normal', driver:'Mike Rodriguez', truck:'Unit 02 — Peterbilt 389', progress:58, driverPhone:'(555) 307-8822', eta:'May 13 09:00', checkIns:[ { time:'May 11 08:00', location:'Houston, TX',    note:'Loaded and departed' }, { time:'May 11 18:30', location:'San Antonio, TX', note:'Fuel stop, all good' }, { time:'May 12 09:00', location:'El Paso, TX',     note:'Border check passed' }, ], documents:['BOL','Rate Con'] },
  { id:'L-004', ref:'XP-211098', from:'Los Angeles',fromState:'CA', to:'Seattle',     toState:'WA', miles:1140, payout:3090, rpm:2.71, pickup:'May 14', delivery:'May 16', broker:'XPO Logistics',     brokerRating:4.7, type:'Reefer',   weight:'40,000 lbs', status:'unassigned', priority:'normal', driver:null,           truck:null,                   tags:['TEAM'],     documents:[] },
  { id:'L-005', ref:'AL-887723', from:'Nashville',  fromState:'TN', to:'Charlotte',   toState:'NC', miles:408,  payout:796,  rpm:1.95, pickup:'May 13', delivery:'May 13', broker:'Arrive Logistics',  brokerRating:4.5, type:'Dry Van',  weight:'35,000 lbs', status:'in-transit', priority:'low',    driver:'Anna Perez',   truck:'Unit 03 — Kenworth T680', progress:82, driverPhone:'(555) 419-6633', eta:'May 13 16:00', checkIns:[ { time:'May 13 08:00', location:'Nashville, TN', note:'Loaded' }, { time:'May 13 13:00', location:'Knoxville, TN', note:'On schedule' }, ], documents:['BOL'] },
  { id:'L-006', ref:'WE-334561', from:'Denver',     fromState:'CO', to:'Salt Lake City',toState:'UT', miles:525, payout:1103, rpm:2.10, pickup:'May 11', delivery:'May 12', broker:'Worldwide Express', brokerRating:4.3, type:'Dry Van',  weight:'39,000 lbs', status:'issue',      priority:'hot',    driver:'Tony Marshall',truck:'Unit 04 — Volvo VNL',     note:'Driver reported tire blowout I-70, awaiting roadside assistance ETA 2hrs', documents:['BOL'] },
  { id:'L-007', ref:'CH-990012', from:'Miami',      fromState:'FL', to:'New York',     toState:'NY', miles:1281, payout:3267, rpm:2.55, pickup:'May 10', delivery:'May 12', broker:'CH Robinson',       brokerRating:4.9, type:'Hotshot',  weight:'9,800 lbs',  status:'delivered',  priority:'normal', driver:'Sara Kim',     truck:'Unit 05 — Mack Anthem',  documents:['BOL','POD'] },
  { id:'L-008', ref:'TP-667214', from:'Portland',   fromState:'OR', to:'San Francisco',toState:'CA', miles:636,  payout:1514, rpm:2.38, pickup:'May 10', delivery:'May 11', broker:'Transplace',        brokerRating:4.6, type:'Flatbed',  weight:'41,500 lbs', status:'delivered',  priority:'normal', driver:'James Carter', truck:'Unit 01 — Freightliner',  documents:['BOL','POD'] },
  { id:'L-009', ref:'OD-441109', from:'Kansas City',fromState:'MO', to:'Memphis',     toState:'TN', miles:451,  payout:922,  rpm:2.04, pickup:'May 14', delivery:'May 14', broker:'Odyssey Logistics',  brokerRating:4.2, type:'Dry Van',  weight:'36,000 lbs', status:'unassigned', priority:'low',    driver:null,           truck:null,                   documents:[] },
  { id:'L-010', ref:'RX-774211', from:'Denver',     fromState:'CO', to:'Chicago',     toState:'IL', miles:920,  payout:2116, rpm:2.30, pickup:'May 15', delivery:'May 17', broker:'Redwood Logistics',  brokerRating:4.5, type:'Reefer',   weight:'43,000 lbs', status:'unassigned', priority:'normal', driver:null,           truck:null,                   tags:['TEMP-CONTROL'], documents:[] },
  { id:'L-011', ref:'FW-228890', from:'Boston',     fromState:'MA', to:'Atlanta',     toState:'GA', miles:1103, payout:2539, rpm:2.30, pickup:'May 13', delivery:'May 15', broker:'FreightWise',        brokerRating:4.6, type:'Dry Van',  weight:'40,000 lbs', status:'assigned',   priority:'normal', driver:'Sara Kim',     truck:'Unit 05 — Mack Anthem',  documents:['Rate Con'], eta:'May 15 10:00' },
]

const COLUMNS: { key: LoadStatus; label: string; icon: string; color: string }[] = [
  { key:'unassigned', label:'Unassigned',  icon:'📋', color:'#718096' },
  { key:'assigned',   label:'Assigned',    icon:'👤', color:'#4BAED4' },
  { key:'in-transit', label:'In Transit',  icon:'🚛', color:'#8B5CF6' },
  { key:'delivered',  label:'Delivered',   icon:'✅', color:'#38C770' },
  { key:'issue',      label:'Issues',      icon:'⚠️', color:'#E53E3E' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function DispatchBoardPage() {
  const [loads,        setLoads]        = useState<DispatchLoad[]>(INIT_LOADS)
  const [assignLoad,   setAssignLoad]   = useState<DispatchLoad | null>(null)
  const [detailLoad,   setDetailLoad]   = useState<DispatchLoad | null>(null)
  const [filterPri,    setFilterPri]    = useState<'all' | Priority>('all')
  const [filterType,   setFilterType]   = useState('All Types')
  const [view,         setView]         = useState<ViewMode>('board')
  const [showDrivers,  setShowDrivers]  = useState(false)
  const [showAddLoad,  setShowAddLoad]  = useState(false)

  const filtered = loads.filter(l => {
    if (filterPri  !== 'all'       && l.priority !== filterPri)   return false
    if (filterType !== 'All Types' && l.type     !== filterType)  return false
    return true
  })

  const totalRevenue   = loads.reduce((s,l) => s + l.payout, 0)
  const inTransitCount = loads.filter(l => l.status === 'in-transit').length
  const issueCount     = loads.filter(l => l.status === 'issue').length
  const availDrivers   = DRIVERS.filter(d => d.status === 'available').length
  const unassigned     = loads.filter(l => l.status === 'unassigned').length

  function assignDriver(loadId: string, driver: Driver) {
    setLoads(prev => prev.map(l =>
      l.id === loadId
        ? { ...l, driver:driver.name, truck:driver.truck, status:'assigned' as LoadStatus }
        : l
    ))
    setAssignLoad(null)
  }

  function markDelivered(loadId: string) {
    setLoads(prev => prev.map(l =>
      l.id === loadId ? { ...l, status:'delivered' as LoadStatus } : l
    ))
    setDetailLoad(null)
  }

  function startTransit(loadId: string) {
    setLoads(prev => prev.map(l =>
      l.id === loadId ? { ...l, status:'in-transit' as LoadStatus, progress:3 } : l
    ))
    setDetailLoad(null)
  }

  function resolveIssue(loadId: string) {
    setLoads(prev => prev.map(l =>
      l.id === loadId ? { ...l, status:'in-transit' as LoadStatus, note:undefined } : l
    ))
    setDetailLoad(null)
  }

  const TYPES = ['All Types', ...Array.from(new Set(loads.map(l => l.type)))]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* KPI Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
        {[
          { label:'Total Revenue',     value:`$${totalRevenue.toLocaleString()}`,     color:'#38C770', icon:'💰' },
          { label:'In Transit',        value:`${inTransitCount} loads`,               color:'#8B5CF6', icon:'🚛' },
          { label:'Unassigned',        value: unassigned > 0 ? `${unassigned} loads` : '0 loads', color: unassigned>0?'#F59E0B':'#38C770', icon:'📋' },
          { label:'Available Drivers', value:`${availDrivers} / ${DRIVERS.length}`,  color:'#4BAED4', icon:'👤' },
          { label:'Issues',            value: issueCount ? `${issueCount} active` : 'None ✅', color: issueCount?'#E53E3E':'#38C770', icon:'⚠️' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor:s.color, padding:'12px 14px' }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color, fontSize:17 }}>{s.value}</div>
            <div className="stat-label" style={{ fontSize:11 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card" style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {/* View toggle */}
          <div style={{ display:'flex', gap:4 }}>
            {([['board','📋 Board'],['list','📄 List'],['timeline','⏱️ Timeline']] as [ViewMode,string][]).map(([v,label]) => (
              <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`}
                onClick={()=>setView(v)}>{label}</button>
            ))}
          </div>
          <div style={{ width:1, height:24, background:'#E2E8F0' }} />
          {(['all','hot','normal','low'] as const).map(p => (
            <button key={p} className={`btn btn-sm ${filterPri===p?'btn-primary':'btn-ghost'}`}
              onClick={()=>setFilterPri(p)}>
              {p==='hot'?'🔥 Hot':p==='normal'?'⬜ Normal':p==='low'?'🟢 Low':'All'}
            </button>
          ))}
          <div style={{ width:1, height:24, background:'#E2E8F0' }} />
          <select className="input select" style={{ width:140, fontSize:13, padding:'5px 8px', height:32 }}
            value={filterType} onChange={e=>setFilterType(e.target.value)}>
            {TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button className={`btn btn-sm ${showDrivers?'btn-primary':'btn-ghost'}`}
              onClick={()=>setShowDrivers(!showDrivers)}>
              👤 Drivers {showDrivers?'▲':'▼'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowAddLoad(true)}>
              + Add Load
            </button>
          </div>
        </div>
      </div>

      {/* Issue Alert */}
      {issueCount > 0 && (
        <div style={{ background:'#FFF5F5', border:'1px solid #FC8181', borderRadius:10,
          padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#C53030', fontSize:14 }}>
              {issueCount} load{issueCount>1?'s':''} need immediate attention
            </div>
            <div style={{ fontSize:12, color:'#E53E3E', marginTop:2 }}>
              {loads.filter(l=>l.status==='issue').map(l=>`${l.ref}: ${l.note?.slice(0,60)}...`).join(' | ')}
            </div>
          </div>
          <button className="btn btn-sm" style={{ background:'#E53E3E', color:'#fff', border:'none' }}
            onClick={()=>{ const i = loads.find(l=>l.status==='issue'); if(i) setDetailLoad(i) }}>
            Resolve →
          </button>
        </div>
      )}

      {/* Driver panel (collapsible) */}
      {showDrivers && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom:12 }}>Driver Status</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
            {DRIVERS.map(d => {
              const statusCfg = {
                available: { bg:'#F0FFF4', color:'#276749', label:'Available',  border:'#9AE6B4' },
                'on-load':  { bg:'#EBF8FF', color:'#2B6CB0', label:'On Load',   border:'#90CDF4' },
                'off-duty': { bg:'#F4F6F9', color:'#718096', label:'Off Duty',  border:'#E2E8F0' },
              }
              const sc = statusCfg[d.status]
              return (
                <div key={d.id} style={{ border:`1px solid ${sc.border}`, background:sc.bg, borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700, flexShrink:0 }}>
                      {d.name.charAt(0)}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.name}</div>
                      <div style={{ fontSize:10, color:'#A0AEC0' }}>{d.truck.split(' — ')[0]}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                    background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{sc.label}</span>
                  <div style={{ marginTop:8, fontSize:11, color:'#718096' }}>
                    <div>⭐ {d.rating} · {d.hosRemaining}h HOS</div>
                    {d.currentLoad && <div style={{ marginTop:2 }}>📦 {d.currentLoad}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── BOARD VIEW ── */}
      {view === 'board' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, alignItems:'start' }}>
          {COLUMNS.map(col => {
            const colLoads = filtered.filter(l => l.status === col.key)
            const colRevenue = colLoads.reduce((s,l) => s+l.payout, 0)
            return (
              <div key={col.key} style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                  borderRadius:10, background:'#F4F6F9', borderTop:`3px solid ${col.color}` }}>
                  <span style={{ fontSize:16 }}>{col.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#2D3748' }}>{col.label}</div>
                    {colRevenue > 0 && <div style={{ fontSize:10, color:'#A0AEC0' }}>${colRevenue.toLocaleString()}</div>}
                  </div>
                  <span style={{ background:col.color, color:'#fff', borderRadius:99,
                    fontSize:11, fontWeight:700, padding:'2px 8px', minWidth:20, textAlign:'center' }}>
                    {colLoads.length}
                  </span>
                </div>
                {colLoads.length === 0 && (
                  <div style={{ textAlign:'center', padding:'24px 8px', color:'#CBD5E0', fontSize:13 }}>
                    No loads
                  </div>
                )}
                {colLoads.map(load => (
                  <BoardCard key={load.id} load={load} colColor={col.color}
                    onAssign={() => setAssignLoad(load)}
                    onDetail={() => setDetailLoad(load)} />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref</th><th>Route</th><th>Type</th><th>RPM</th><th>Payout</th>
                  <th>Pickup</th><th>Driver</th><th>Priority</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight:700, color:'#4BAED4', fontSize:12 }}>#{l.ref}</td>
                    <td style={{ fontWeight:600, fontSize:12 }}>{l.from}, {l.fromState} → {l.to}, {l.toState}</td>
                    <td style={{ color:'#718096', fontSize:12 }}>{l.type}</td>
                    <td style={{ fontWeight:700, color:'#4BAED4', fontSize:12 }}>${l.rpm.toFixed(2)}</td>
                    <td style={{ fontWeight:700, color:'#38C770', fontSize:12 }}>${l.payout.toLocaleString()}</td>
                    <td style={{ color:'#718096', fontSize:12 }}>{l.pickup}</td>
                    <td style={{ fontSize:12 }}>
                      {l.driver ? <span style={{ fontWeight:600 }}>{l.driver.split(' ')[0]}</span>
                        : <span style={{ color:'#A0AEC0', fontStyle:'italic' }}>Unassigned</span>}
                    </td>
                    <td>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                        background: l.priority==='hot'?'#FFF5F5':l.priority==='normal'?'#EBF8FF':'#F0FFF4',
                        color: l.priority==='hot'?'#C53030':l.priority==='normal'?'#2B6CB0':'#276749' }}>
                        {l.priority==='hot'?'🔥 Hot':l.priority==='normal'?'Normal':'Low'}
                      </span>
                    </td>
                    <td><StatusPill status={l.status} /></td>
                    <td>
                      {l.status === 'unassigned'
                        ? <button className="btn btn-primary btn-sm" style={{ fontSize:11 }} onClick={()=>setAssignLoad(l)}>Assign →</button>
                        : <button className="btn btn-ghost btn-sm"   style={{ fontSize:11 }} onClick={()=>setDetailLoad(l)}>Details</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TIMELINE VIEW ── */}
      {view === 'timeline' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
          {/* Today's schedule */}
          <div className="card">
            <h3 className="section-title">Today — May 12</h3>
            <TimelineColumn loads={filtered.filter(l => l.pickup === 'May 12' || l.status === 'in-transit')}
              onDetail={setDetailLoad} />
          </div>
          {/* Upcoming */}
          <div className="card">
            <h3 className="section-title">Upcoming (May 13–17)</h3>
            <TimelineColumn loads={filtered.filter(l => l.pickup > 'May 12' && l.status !== 'delivered')}
              onDetail={setDetailLoad} />
          </div>
        </div>
      )}

      {/* ── Assign Driver Modal ── */}
      {assignLoad && (
        <div className="modal-overlay" onClick={()=>setAssignLoad(null)}>
          <div className="modal" style={{ width:540 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">👤 Assign Driver — #{assignLoad.ref}</h3>
              <button className="modal-close" onClick={()=>setAssignLoad(null)}>✕</button>
            </div>
            <div style={{ padding:'0 0 16px' }}>
              <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:14, color:'#fff' }}>
                  {assignLoad.from}, {assignLoad.fromState} → {assignLoad.to}, {assignLoad.toState}
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>
                  {assignLoad.miles.toLocaleString()} mi · {assignLoad.type} · Pickup {assignLoad.pickup}
                  &nbsp;·&nbsp;<strong style={{ color:'#38C770' }}>${assignLoad.payout.toLocaleString()}</strong>
                  &nbsp;·&nbsp;<strong style={{ color:'#4BAED4' }}>${assignLoad.rpm.toFixed(2)}/mi</strong>
                </div>
              </div>

              <div style={{ fontSize:13, fontWeight:600, color:'#718096', marginBottom:10 }}>
                Driver Availability
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {DRIVERS.map(d => {
                  const isAvail = d.status === 'available'
                  return (
                    <div key={d.id} style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'12px 14px', borderRadius:10,
                      border:`2px solid ${isAvail?'#E2E8F0':'#F4F6F9'}`,
                      opacity: isAvail ? 1 : 0.5,
                      cursor: isAvail ? 'pointer' : 'not-allowed',
                      background: isAvail ? '#fff' : '#F4F6F9',
                      transition:'border-color .2s',
                    }} onClick={() => isAvail && assignDriver(assignLoad.id, d)}>
                      <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontSize:13, fontWeight:700, flexShrink:0 }}>
                        {d.name.charAt(0)}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:13 }}>{d.name}</div>
                        <div style={{ fontSize:11, color:'#718096' }}>{d.truck}</div>
                        <div style={{ fontSize:11, color:'#A0AEC0' }}>📍 {d.homeBased}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:12, color:'#F59E0B', marginBottom:4 }}>★ {d.rating}</div>
                        <div style={{ fontSize:11, color:'#4BAED4', marginBottom:4 }}>⏰ {d.hosRemaining}h HOS</div>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                          background: isAvail?'#C6F6D5':d.status==='on-load'?'#BEE3F8':'#E2E8F0',
                          color:      isAvail?'#276749':d.status==='on-load'?'#2C5282':'#718096' }}>
                          {isAvail ? '✓ Available' : d.status==='on-load' ? `On ${d.currentLoad}` : 'Off Duty'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Load Detail Modal ── */}
      {detailLoad && (
        <LoadDetailModal
          load={detailLoad}
          onClose={()=>setDetailLoad(null)}
          onMarkDelivered={markDelivered}
          onStartTransit={startTransit}
          onResolveIssue={resolveIssue}
          onAssign={()=>{ setAssignLoad(detailLoad); setDetailLoad(null) }}
        />
      )}

      {/* Add Load Modal */}
      {showAddLoad && <AddLoadModal onClose={()=>setShowAddLoad(false)} />}
    </div>
  )
}

// ─── Board Card ───────────────────────────────────────────────────────────────
function BoardCard({ load: l, colColor, onAssign, onDetail }:
  { load:DispatchLoad; colColor:string; onAssign:()=>void; onDetail:()=>void }) {
  return (
    <div className="card" style={{
      padding:'12px 14px', cursor:'pointer',
      borderLeft:`3px solid ${colColor}`,
      background: l.priority==='hot' ? '#FFFBF0' : '#fff',
    }} onClick={onDetail}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div>
          <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap' }}>
            {l.priority==='hot' && <span className="badge badge-error">🔥 HOT</span>}
            {l.tags?.map(t => (
              <span key={t} style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:3,
                background:'#EBF8FF', color:'#2B6CB0' }}>{t}</span>
            ))}
            <span style={{ fontSize:10, color:'#A0AEC0' }}>#{l.ref}</span>
          </div>
          <div style={{ fontWeight:800, fontSize:13, color:'#2D3748', lineHeight:1.3 }}>
            {l.from}, {l.fromState}
          </div>
          <div style={{ fontSize:11, color:'#A0AEC0' }}>→ {l.to}, {l.toState}</div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontWeight:800, color:'#38C770', fontSize:13 }}>${l.payout.toLocaleString()}</div>
          <div style={{ fontSize:10, color:'#4BAED4', fontWeight:600 }}>${l.rpm.toFixed(2)}/mi</div>
          <div style={{ fontSize:10, color:'#A0AEC0' }}>{l.miles.toLocaleString()} mi</div>
        </div>
      </div>

      {l.driver ? (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
          <div className="avatar" style={{ width:22, height:22, fontSize:10, background:'#4BAED4', color:'#fff', fontWeight:700 }}>
            {l.driver.charAt(0)}
          </div>
          <span style={{ fontSize:12, fontWeight:600, color:'#4A5568' }}>{l.driver}</span>
          {l.eta && <span style={{ fontSize:10, color:'#A0AEC0', marginLeft:'auto' }}>ETA {l.eta?.split(' ')[1]}</span>}
        </div>
      ) : (
        <div style={{ fontSize:11, color:'#A0AEC0', fontStyle:'italic', marginBottom:8 }}>No driver assigned</div>
      )}

      {l.status === 'in-transit' && l.progress !== undefined && (
        <div style={{ marginBottom:8 }}>
          <div style={{ background:'#E2E8F0', borderRadius:99, height:5, overflow:'hidden' }}>
            <div style={{ width:`${l.progress}%`, height:'100%', borderRadius:99, background:'#8B5CF6' }} />
          </div>
          <div style={{ fontSize:10, color:'#8B5CF6', textAlign:'right', marginTop:2 }}>{l.progress}%</div>
        </div>
      )}

      {l.status === 'issue' && l.note && (
        <div style={{ fontSize:10, color:'#E53E3E', background:'#FFF5F5', borderRadius:6,
          padding:'4px 8px', marginBottom:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          ⚠️ {l.note}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <span style={{ fontSize:10, color:'#A0AEC0' }}>{l.type} · {l.pickup}</span>
        </div>
        {l.status === 'unassigned'
          ? <button className="btn btn-primary btn-sm" style={{ fontSize:10, padding:'3px 8px' }}
              onClick={e=>{ e.stopPropagation(); onAssign() }}>Assign →</button>
          : <StatusPill status={l.status} />
        }
      </div>
    </div>
  )
}

// ─── Timeline Column ──────────────────────────────────────────────────────────
function TimelineColumn({ loads, onDetail }: { loads:DispatchLoad[]; onDetail:(l:DispatchLoad)=>void }) {
  if (loads.length === 0) {
    return <div style={{ textAlign:'center', padding:40, color:'#A0AEC0', fontSize:13 }}>No loads for this period</div>
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {loads.map((l, idx) => {
        const colColor = l.status==='in-transit'?'#8B5CF6':l.status==='assigned'?'#4BAED4':l.status==='issue'?'#E53E3E':'#718096'
        return (
          <div key={l.id} style={{ display:'flex', gap:12, paddingBottom: idx<loads.length-1?16:0, cursor:'pointer' }}
            onClick={()=>onDetail(l)}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
              <div style={{ width:12, height:12, borderRadius:6, background:colColor, marginTop:4 }} />
              {idx < loads.length-1 && <div style={{ width:2, flex:1, background:'#E2E8F0', marginTop:4 }} />}
            </div>
            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#2D3748' }}>
                    {l.from}, {l.fromState} → {l.to}, {l.toState}
                  </div>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>
                    #{l.ref} · {l.type} · Pickup {l.pickup}
                  </div>
                  {l.driver && <div style={{ fontSize:11, color:'#4BAED4', marginTop:2 }}>👤 {l.driver}</div>}
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontWeight:700, color:'#38C770', fontSize:13 }}>${l.payout.toLocaleString()}</div>
                  <StatusPill status={l.status} />
                </div>
              </div>
              {l.status === 'in-transit' && l.progress !== undefined && (
                <div style={{ marginTop:6 }}>
                  <div style={{ background:'#E2E8F0', borderRadius:99, height:5, overflow:'hidden' }}>
                    <div style={{ width:`${l.progress}%`, height:'100%', borderRadius:99, background:'#8B5CF6' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Load Detail Modal ────────────────────────────────────────────────────────
function LoadDetailModal({ load: l, onClose, onMarkDelivered, onStartTransit, onResolveIssue, onAssign }:
  { load:DispatchLoad; onClose:()=>void; onMarkDelivered:(id:string)=>void;
    onStartTransit:(id:string)=>void; onResolveIssue:(id:string)=>void; onAssign:()=>void }) {
  const [subTab, setSubTab] = useState<'info'|'driver'|'checkins'|'docs'>('info')
  const gradBg = l.status==='issue' ? 'linear-gradient(135deg,#C53030,#9B2C2C)'
    : l.status==='delivered' ? 'linear-gradient(135deg,#276749,#38A169)'
    : 'linear-gradient(135deg,#1A2535,#2D7A9A)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:500 }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:gradBg, padding:'18px 20px', borderRadius:'12px 12px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <span style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>#{l.ref} · {l.broker}</span>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ fontSize:18, fontWeight:900, color:'#fff', marginTop:4 }}>
            {l.from}, {l.fromState} → {l.to}, {l.toState}
          </div>
          <div style={{ display:'flex', gap:16, marginTop:10 }}>
            {[
              { label:'Miles',   v:`${l.miles.toLocaleString()} mi` },
              { label:'Payout',  v:`$${l.payout.toLocaleString()}` },
              { label:'RPM',     v:`$${l.rpm.toFixed(2)}/mi` },
              { label:'Pickup',  v:l.pickup },
              { label:'Delivery',v:l.delivery },
            ].map(r => (
              <div key={r.label}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>{r.label}</div>
                <div style={{ fontWeight:700, fontSize:12, color:'#fff' }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--c-divider)' }}>
          {(['info','driver','checkins','docs'] as const).map(t => (
            <button key={t} onClick={()=>setSubTab(t)}
              style={{ flex:1, padding:'10px 4px', fontSize:11, fontWeight:600, background:'none', border:'none',
                cursor:'pointer', color:subTab===t?'#4BAED4':'#A0AEC0',
                borderBottom:`2px solid ${subTab===t?'#4BAED4':'transparent'}` }}>
              {t==='info'?'📋 Info':t==='driver'?'👤 Driver':t==='checkins'?'📍 Check-ins':'📎 Docs'}
            </button>
          ))}
        </div>

        <div style={{ padding:'16px 20px', maxHeight:380, overflowY:'auto' }}>
          {subTab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Equipment',  value:l.type },
                  { label:'Weight',     value:l.weight },
                  { label:'Broker',     value:`${l.broker} ★${l.brokerRating}` },
                  { label:'Status',     value:l.status.replace('-',' ') },
                  ...(l.eta ? [{ label:'ETA', value:l.eta }] : []),
                  ...(l.tags?.length ? [{ label:'Tags', value:l.tags.join(', ') }] : []),
                ].map(r => (
                  <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
                    <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1, textTransform:'capitalize' }}>{r.value}</div>
                  </div>
                ))}
              </div>
              {l.status === 'in-transit' && l.progress !== undefined && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:12 }}>Trip Progress</span>
                    <span style={{ fontWeight:700, color:'#8B5CF6' }}>{l.progress}%</span>
                  </div>
                  <div style={{ background:'#E2E8F0', borderRadius:99, height:10, overflow:'hidden' }}>
                    <div style={{ width:`${l.progress}%`, height:'100%', borderRadius:99, background:'linear-gradient(90deg,#8B5CF6,#6D28D9)' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:11, color:'#A0AEC0' }}>
                    <span>{l.from}</span><span>{l.to}</span>
                  </div>
                </div>
              )}
              {l.status === 'issue' && l.note && (
                <div style={{ background:'#FFF5F5', border:'1px solid #FC8181', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ fontWeight:700, color:'#C53030', fontSize:13, marginBottom:4 }}>⚠️ Issue Report</div>
                  <div style={{ fontSize:13, color:'#E53E3E' }}>{l.note}</div>
                </div>
              )}
            </div>
          )}

          {subTab === 'driver' && (
            <div>
              {l.driver ? (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, background:'#F4F6F9', borderRadius:10, padding:'14px' }}>
                    <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700 }}>
                      {l.driver.charAt(0)}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700 }}>{l.driver}</div>
                      <div style={{ fontSize:12, color:'#718096' }}>{l.truck}</div>
                      {l.driverPhone && <div style={{ fontSize:11, color:'#A0AEC0' }}>{l.driverPhone}</div>}
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm">📞</button>
                      <button className="btn btn-ghost btn-sm">💬</button>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={onAssign}>🔄 Reassign Driver</button>
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:30 }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>👤</div>
                  <div style={{ fontWeight:600, color:'#A0AEC0', marginBottom:12 }}>No driver assigned yet</div>
                  <button className="btn btn-primary btn-sm" onClick={()=>{ onClose(); }}>Assign Driver →</button>
                </div>
              )}
            </div>
          )}

          {subTab === 'checkins' && (
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {(l.checkIns ?? []).length === 0 && (
                <div style={{ textAlign:'center', padding:30, color:'#A0AEC0' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📍</div>
                  <div>No check-ins yet</div>
                </div>
              )}
              {(l.checkIns ?? []).map((c, idx) => (
                <div key={idx} style={{ display:'flex', gap:12, paddingBottom: idx<(l.checkIns?.length??0)-1?14:0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                    <div style={{ width:10, height:10, borderRadius:5,
                      background: idx===0?'#4BAED4':'#CBD5E0', marginTop:3 }} />
                    {idx < (l.checkIns?.length??0)-1 && <div style={{ width:2, flex:1, background:'#E2E8F0', marginTop:4 }} />}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#2D3748' }}>📍 {c.location}</div>
                    <div style={{ fontSize:11, color:'#A0AEC0', marginTop:1 }}>{c.time}</div>
                    {c.note && <div style={{ fontSize:11, color:'#718096', marginTop:3 }}>{c.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {subTab === 'docs' && (
            <div>
              {(l.documents ?? []).length === 0 ? (
                <div style={{ textAlign:'center', padding:30, color:'#A0AEC0' }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📎</div>
                  <div>No documents attached</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {(l.documents ?? []).map(d => (
                    <div key={d} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                      padding:'10px 14px', background:'#F4F6F9', borderRadius:8 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span>📄</span>
                        <span style={{ fontWeight:600, fontSize:13 }}>{d}</span>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }}>👁️ View</button>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }}>⬇️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-ghost btn-sm" style={{ marginTop:12, width:'100%' }}>📎 Upload Document</button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding:'12px 20px 20px', display:'flex', gap:8, borderTop:'1px solid var(--c-divider)' }}>
          {l.status === 'in-transit' && (
            <button className="btn btn-primary btn-full btn-sm" onClick={()=>onMarkDelivered(l.id)}>✅ Mark Delivered</button>
          )}
          {l.status === 'issue' && (
            <button className="btn btn-full btn-sm" style={{ background:'#E53E3E', color:'#fff', border:'none' }}
              onClick={()=>onResolveIssue(l.id)}>🔧 Resolve Issue</button>
          )}
          {l.status === 'assigned' && (
            <button className="btn btn-primary btn-full btn-sm" onClick={()=>onStartTransit(l.id)}>🚛 Start Transit</button>
          )}
          {l.status === 'unassigned' && (
            <button className="btn btn-primary btn-full btn-sm" onClick={onAssign}>👤 Assign Driver</button>
          )}
          <button className="btn btn-ghost btn-full btn-sm">📋 Print Rate Con</button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Load Modal ───────────────────────────────────────────────────────────
function AddLoadModal({ onClose }: { onClose:()=>void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:560 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📦 Add New Load</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, paddingBottom:8 }}>
          {[
            { label:'Origin City',      ph:'Chicago' },
            { label:'Origin State',     ph:'IL' },
            { label:'Destination City', ph:'Dallas' },
            { label:'Destination State',ph:'TX' },
            { label:'Miles',            ph:'850' },
            { label:'Payout ($)',       ph:'1850' },
            { label:'Pickup Date',      ph:'May 14' },
            { label:'Delivery Date',    ph:'May 15' },
            { label:'Broker',           ph:'Echo Global' },
            { label:'Reference #',      ph:'EG-001234' },
          ].map(f => (
            <div key={f.label} className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">{f.label}</label>
              <input className="input" type="text" placeholder={f.ph} />
            </div>
          ))}
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Equipment Type</label>
            <select className="input select">
              {['Dry Van','Reefer','Flatbed','Hotshot','Box Truck'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Priority</label>
            <select className="input select">
              <option>Normal</option><option>Hot</option><option>Low</option>
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:12 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={onClose}>Add Load</button>
        </div>
      </div>
    </div>
  )
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: LoadStatus }) {
  const cfg: Record<LoadStatus, { label:string; bg:string; color:string }> = {
    unassigned:   { label:'Unassigned', bg:'#EDF2F7', color:'#718096' },
    assigned:     { label:'Assigned',   bg:'#EBF8FF', color:'#2C5282' },
    'in-transit': { label:'In Transit', bg:'#FAF5FF', color:'#553C9A' },
    delivered:    { label:'Delivered',  bg:'#F0FFF4', color:'#276749' },
    issue:        { label:'Issue',      bg:'#FFF5F5', color:'#C53030' },
  }
  const c = cfg[status]
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:c.bg, color:c.color }}>
      {c.label}
    </span>
  )
}
