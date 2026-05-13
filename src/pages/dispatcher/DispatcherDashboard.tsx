import { useState } from 'react'

// ── Mock data ─────────────────────────────────────────────────────────────────
const WEEK_COMMISSION = [
  { day: 'Mon', commission: 222, gross: 2_786 },
  { day: 'Tue', commission: 148, gross: 1_854 },
  { day: 'Wed', commission: 0,   gross: 0     },
  { day: 'Thu', commission: 192, gross: 2_400 },
  { day: 'Fri', commission: 176, gross: 2_200 },
  { day: 'Sat', commission: 0,   gross: 0     },
  { day: 'Sun', commission: 0,   gross: 0     },
]

const CLIENTS = [
  {
    id: '1', name: 'Mike Rodriguez',    init: 'M', truck: 'Dry Van · IL 4829-XR',
    status: 'active',      load: 'Chicago → Dallas',  eta: '4h 20m',
    rpm: 2.18, grossHandled: 28_400, commission: 2_272, rating: 4.9,
    loadsThisMonth: 8, rpmGuarantee: 2.30, progress: 64,
  },
  {
    id: '2', name: 'Sergiy Kovalchuk',  init: 'S', truck: 'Reefer · FL 7731-KA',
    status: 'active',      load: 'Miami → Atlanta',   eta: '6h 10m',
    rpm: 2.45, grossHandled: 24_600, commission: 1_968, rating: 4.8,
    loadsThisMonth: 7, rpmGuarantee: 2.35, progress: 48,
  },
  {
    id: '3', name: 'Tom Bradley',       init: 'T', truck: 'Flatbed · TX 2201-BB',
    status: 'idle',        load: null,                eta: null,
    rpm: 0, grossHandled: 18_200, commission: 1_456, rating: 4.7,
    loadsThisMonth: 5, rpmGuarantee: 2.25, progress: 0,
  },
  {
    id: '4', name: 'Anna Perez',        init: 'A', truck: 'Dry Van · CA 8812-PP',
    status: 'active',      load: 'LA → Sacramento',  eta: '1h 45m',
    rpm: 2.22, grossHandled: 20_100, commission: 1_608, rating: 4.95,
    loadsThisMonth: 6, rpmGuarantee: 2.20, progress: 81,
  },
]

const HIRE_REQUESTS = [
  { id: 'HR-01', name: 'Marcus Johnson', trucks: 2, equipment: 'Dry Van',  lanes: 'TX–CA',     rpmOffer: 2.65, time: '2 мин назад',  urgent: true  },
  { id: 'HR-02', name: 'Elena Vasquez',  trucks: 1, equipment: 'Reefer',   lanes: 'Midwest',   rpmOffer: 2.80, time: '8 мин назад',  urgent: true  },
  { id: 'HR-03', name: 'David Kim',      trucks: 1, equipment: 'Dry Van',  lanes: 'Southeast', rpmOffer: 2.55, time: '32 мин назад', urgent: false },
]

const PENDING_OFFERS = [
  { id: 'O1', client: 'Tom Bradley', from: 'Houston, TX', to: 'Phoenix, AZ',     broker: 'TQL',       rate: 2_786, miles: 1201, expires: '2ч 15мин', rpm: 2.32 },
  { id: 'O2', client: 'Tom Bradley', from: 'Dallas, TX',  to: 'Kansas City, MO', broker: 'Worldwide', rate: 1_120, miles: 490,  expires: '45мин',    rpm: 2.29 },
]

const weekGross      = WEEK_COMMISSION.reduce((s, d) => s + d.gross, 0)
const weekCommission = WEEK_COMMISSION.reduce((s, d) => s + d.commission, 0)
const maxComm        = Math.max(...WEEK_COMMISSION.map(d => d.commission), 1)

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DispatcherDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [dismissedOffers, setDismissedOffers] = useState<string[]>([])
  const [dismissedRequests, setDismissedRequests] = useState<string[]>([])

  const visibleOffers   = PENDING_OFFERS.filter(o => !dismissedOffers.includes(o.id))
  const visibleRequests = HIRE_REQUESTS.filter(r => !dismissedRequests.includes(r.id))

  const totalGrossHandled  = CLIENTS.reduce((s, c) => s + c.grossHandled, 0)
  const totalCommission    = CLIENTS.reduce((s, c) => s + c.commission, 0)
  const activeClients      = CLIENTS.filter(c => c.status === 'active').length
  const idleClients        = CLIENTS.filter(c => c.status === 'idle').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPI strip */}
      <div className="stats-grid">
        {[
          { label: 'Month Commission', value: fmt(totalCommission),              change: '+22% vs March',   up: true,  color: '#8B5CF6', icon: '💰' },
          { label: 'Gross Handled',    value: fmt(totalGrossHandled),            change: 'This month',      up: true,  color: '#4BAED4', icon: '📊' },
          { label: 'Loads Booked',     value: CLIENTS.reduce((s, c) => s + c.loadsThisMonth, 0), change: 'This month', up: true, color: '#38C770', icon: '📦' },
          { label: 'Clients',          value: `${activeClients}/${CLIENTS.length}`, change: `${idleClients} need load`, up: idleClients === 0, color: '#D97706', icon: '🚛' },
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

      {/* Urgent hire requests banner */}
      {visibleRequests.filter(r => r.urgent).length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #E53E3E', background: '#FFF5F5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#9B2C2C' }}>
              📥 {visibleRequests.filter(r => r.urgent).length} New Hire Requests — Respond Fast!
            </div>
            <button onClick={() => onNavigate('dispatcher-profile')} style={{ fontSize: 12, color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              All Requests →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleRequests.filter(r => r.urgent).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FED7D7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#E53E3E', flexShrink: 0 }}>
                  {r.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{r.trucks} truck{r.trucks > 1 ? 's' : ''} · {r.equipment} · {r.lanes} · RPM offer ${r.rpmOffer}</div>
                </div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>{r.time}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setDismissedRequests(d => [...d, r.id])} style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 11, cursor: 'pointer', color: '#718096' }}>Skip</button>
                  <button onClick={() => onNavigate('dispatcher-profile')} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: '#E53E3E', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Review →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending load offers */}
      {visibleOffers.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #ECC94B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontWeight: 800, fontSize: 14, margin: 0, color: '#B7791F' }}>⏰ Pending Load Offers — Action Required</h3>
            <span style={{ fontSize: 11, color: '#B7791F', fontWeight: 600 }}>{visibleOffers.length} expiring</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleOffers.map(offer => (
              <div key={offer.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid #F0F4F8' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 2 }}>For: {offer.client} · {offer.broker}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748' }}>{offer.from} → {offer.to}</div>
                  <div style={{ fontSize: 12, color: '#A0AEC0' }}>{offer.miles} mi · ${offer.rpm}/mi</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#4BAED4' }}>{fmt(offer.rate)}</div>
                  <div style={{ fontSize: 11, color: '#D97706', fontWeight: 700, marginBottom: 8 }}>⏱ {offer.expires}</div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={() => setDismissedOffers(d => [...d, offer.id])} className="btn btn-ghost btn-sm">✕ Skip</button>
                    <button className="btn btn-primary btn-sm">Book →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>

        {/* ── LEFT ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Client fleet board */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🚛 My Clients ({CLIENTS.length})</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('clients')}>Full View →</button>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('marketplace')}>+ Find Client</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CLIENTS.map(c => (
                <div key={c.id} style={{ background: '#F7FAFC', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: c.status === 'active' ? 10 : 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#4BAED4', flexShrink: 0 }}>
                      {c.init}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>{c.truck}</div>
                    </div>
                    {/* RPM vs guarantee */}
                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: c.rpm >= c.rpmGuarantee ? '#48BB78' : (c.rpm > 0 ? '#E53E3E' : '#A0AEC0') }}>
                        {c.rpm > 0 ? `$${c.rpm.toFixed(2)}` : '—'}
                      </div>
                      <div style={{ fontSize: 9, color: '#A0AEC0' }}>vs ${c.rpmGuarantee.toFixed(2)}</div>
                    </div>
                    {/* Commission */}
                    <div style={{ textAlign: 'right', minWidth: 64 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6' }}>{fmt(c.commission)}</div>
                      <div style={{ fontSize: 9, color: '#A0AEC0' }}>commission</div>
                    </div>
                    {/* Status badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, whiteSpace: 'nowrap',
                      background: c.status === 'active' ? '#F0FFF4' : '#FFFBEB',
                      color: c.status === 'active' ? '#276749' : '#B7791F',
                    }}>{c.status === 'active' ? '● In Transit' : '⏳ Idle'}</span>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-sm">💬</button>
                      {c.status === 'idle' && (
                        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('loads')}>Find Load</button>
                      )}
                      {c.status === 'active' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tracking')}>Track</button>
                      )}
                    </div>
                  </div>
                  {/* Active trip progress */}
                  {c.status === 'active' && c.load && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#718096' }}>{c.load}</span>
                        <span style={{ fontSize: 12, color: '#4BAED4', fontWeight: 600 }}>ETA {c.eta}</span>
                      </div>
                      <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${c.progress}%`, height: '100%', background: 'linear-gradient(90deg, #38C770, #4BAED4)', borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 3 }}>{c.progress}% complete · {c.loadsThisMonth} loads this month</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Week commission chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>💰 Week Commissions</h3>
              <button onClick={() => onNavigate('finance')} style={{ fontSize: 12, color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Full →</button>
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 80 }}>
              {WEEK_COMMISSION.map((d, i) => {
                const h = d.commission > 0 ? Math.max((d.commission / maxComm) * 68, 8) : 4
                const isToday = i === 3
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {d.commission > 0 && <div style={{ fontSize: 8, color: '#8B5CF6', fontWeight: 700 }}>{fmt(d.commission)}</div>}
                    <div style={{
                      width: '100%', height: h, borderRadius: '4px 4px 0 0',
                      background: d.commission > 0 ? (isToday ? '#8B5CF6' : 'rgba(139,92,246,.35)') : '#F0F4F8',
                      border: isToday ? '1.5px solid #8B5CF6' : 'none',
                    }} />
                    <div style={{ fontSize: 9, color: isToday ? '#8B5CF6' : '#A0AEC0', fontWeight: isToday ? 700 : 400 }}>{d.day}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid #F0F4F8' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#8B5CF6' }}>{fmt(weekCommission)}</div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>Week Commission</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4BAED4' }}>{fmt(weekGross)}</div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>Gross Handled</div>
              </div>
            </div>
          </div>

          {/* My profile card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>⭐ My Profile</h3>
              <button onClick={() => onNavigate('dispatcher-profile')} style={{ fontSize: 12, color: '#8B5CF6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Edit →</button>
            </div>
            {[
              { label: 'Rating',       value: '⭐ 4.98', sub: '312 reviews' },
              { label: 'Avg RPM',      value: `$${(CLIENTS.filter(c => c.rpm > 0).reduce((s, c) => s + c.rpm, 0) / CLIENTS.filter(c => c.rpm > 0).length).toFixed(2)}/mi`, sub: 'for active clients' },
              { label: 'Response',     value: '< 5 мин', sub: 'avg response time' },
              { label: 'Open Slots',   value: `${4 - CLIENTS.length} slot(s)`, sub: 'capacity' },
              { label: 'Availability', value: '🟢 Available', sub: 'taking new clients' },
            ].map(p => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F4F8' }}>
                <span style={{ fontSize: 12, color: '#718096' }}>{p.label}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.value}</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>{p.sub}</div>
                </div>
              </div>
            ))}
            <button className="btn btn-primary btn-full" style={{ marginTop: 12, background: '#8B5CF6' }} onClick={() => onNavigate('dispatcher-profile')}>
              📥 View Hire Requests ({HIRE_REQUESTS.length})
            </button>
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: 14 }}>
            <h3 className="section-title" style={{ marginBottom: 10 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { icon: '📦', label: 'Find Load',   page: 'loads'              },
                { icon: '🚛', label: 'My Clients',  page: 'clients'            },
                { icon: '💰', label: 'Earnings',    page: 'finance'            },
                { icon: '📃', label: 'Contracts',   page: 'contracts'          },
                { icon: '📉', label: 'Market Rates',page: 'rates'              },
                { icon: '🤖', label: 'AI Assistant',page: 'ai'                 },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.page)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px',
                  borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F7FAFC',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#2D3748',
                }}>
                  <span style={{ fontSize: 15 }}>{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
