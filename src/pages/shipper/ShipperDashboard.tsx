import { useState } from 'react'

// ── Mock data ─────────────────────────────────────────────────────────────────
const MONTH_SPEND = [
  { week: 'W1', spend: 2_840 },
  { week: 'W2', spend: 3_100 },
  { week: 'W3', spend: 1_690 },
  { week: 'W4*',spend:  790  },
]
const maxSpend = Math.max(...MONTH_SPEND.map(w => w.spend))

const ACTIVE_SHIPMENTS = [
  {
    id: 'SHP-1041', from: 'Chicago, IL', to: 'Dallas, TX',
    carrier: 'Mike Rodriguez', carrierInit: 'M', equipment: 'Dry Van 53\'',
    status: 'in_transit', progress: 72, eta: 'Apr 23, 14:00', value: 1_854,
    miles: 850, pickup: 'Apr 21, 08:00', weight: '42,000 lbs',
  },
  {
    id: 'SHP-1039', from: 'LA, CA',      to: 'Phoenix, AZ',
    carrier: 'Anna Perez',    carrierInit: 'A', equipment: 'Reefer',
    status: 'enroute_pickup', progress: 15, eta: 'Apr 22, 18:00', value: 890,
    miles: 372, pickup: 'Apr 22, 14:00', weight: '28,000 lbs',
  },
]

const POSTED_LOADS = [
  { id: 'POST-101', from: 'Houston, TX', to: 'Phoenix, AZ', equipment: 'Flatbed', offers: 7, budget: 2_200, bestOffer: 2_680, date: 'Apr 22', status: 'bidding' },
  { id: 'POST-100', from: 'NYC, NY',     to: 'Boston, MA',  equipment: 'Dry Van', offers: 3, budget: 650,   bestOffer: 620,   date: 'Apr 23', status: 'bidding' },
]

const COMPLETED_RECENT = [
  { id: 'SHP-1040', from: 'Miami, FL', to: 'Atlanta, GA', carrier: 'Sergiy K.', value: 1_240, date: 'Apr 20', onTime: true  },
  { id: 'SHP-1038', from: 'Dallas, TX',to: 'Denver, CO',  carrier: 'Tom B.',    value: 1_780, date: 'Apr 17', onTime: true  },
  { id: 'SHP-1037', from: 'Chicago, IL',to: 'Detroit, MI', carrier: 'Anna P.',  value: 980,   date: 'Apr 14', onTime: false },
]

const TRUSTED_CARRIERS = [
  { name: 'Mike Rodriguez', init: 'M', type: 'Dry Van', rating: 4.9, loads: 8,  onTimePct: 100 },
  { name: 'Sergiy K.',      init: 'S', type: 'Reefer',  rating: 4.8, loads: 5,  onTimePct: 96  },
  { name: 'Anna Perez',     init: 'A', type: 'Dry Van', rating: 4.95,loads: 6,  onTimePct: 98  },
]

const STATUS_CONF: Record<string, { label: string; color: string; bg: string }> = {
  in_transit:    { label: '🚛 In Transit',   color: '#2C7A9A', bg: '#EBF8FF' },
  enroute_pickup:{ label: '📍 En Route Pickup', color: '#D97706', bg: '#FFFBEB' },
  delivered:     { label: '✅ Delivered',    color: '#276749', bg: '#F0FFF4' },
  bidding:       { label: '💬 Getting Offers', color: '#553C9A', bg: '#FAF5FF' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const monthSpend = MONTH_SPEND.reduce((s, w) => s + w.spend, 0)

// ── Component ─────────────────────────────────────────────────────────────────
export default function ShipperDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [showSpendDetail, setShowSpendDetail] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPI strip */}
      <div className="stats-grid">
        {[
          { label: 'Active Shipments', value: ACTIVE_SHIPMENTS.length,         change: '2 in transit',      up: true,  color: '#4BAED4', icon: '📦' },
          { label: 'Month Spend',      value: fmt(monthSpend),                  change: '-12% vs last month', up: true,  color: '#D97706', icon: '💳' },
          { label: 'On-Time Rate',     value: '97%',                            change: '+2% vs avg',         up: true,  color: '#38C770', icon: '⏱️' },
          { label: 'Avg Cost / Mile',  value: '$2.24/mi',                       change: 'Market: $2.31',      up: true,  color: '#8B5CF6', icon: '📈' },
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

      {/* Post Load hero CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>📦 Need to ship freight?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>
            Get offers from verified carriers in minutes · {POSTED_LOADS.reduce((s, l) => s + l.offers, 0)} offers waiting on your open loads
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)', fontSize: 13 }}
            onClick={() => onNavigate('marketplace')}>Find Carrier</button>
          <button style={{ padding: '9px 20px', background: '#fff', color: '#2D7A9A', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
            onClick={() => onNavigate('post-load')}>➕ Post a Load</button>
        </div>
      </div>

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18 }}>

        {/* ── LEFT ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Active shipments */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🚛 Active Shipments</h3>
              <button onClick={() => onNavigate('shipments')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>All →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ACTIVE_SHIPMENTS.map(sh => {
                const sc = STATUS_CONF[sh.status]
                return (
                  <div key={sh.id} style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>{sh.from} → {sh.to}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>
                          {sh.id} · {sh.equipment} · {sh.miles} mi · {sh.weight}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#2D3748' }}>{fmt(sh.value)}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#718096', marginBottom: 5 }}>
                        <span>Pickup: {sh.pickup}</span>
                        <span>ETA: {sh.eta}</span>
                      </div>
                      <div style={{ height: 7, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${sh.progress}%`, height: '100%', background: 'linear-gradient(90deg, #4BAED4, #38C770)', borderRadius: 4 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#4BAED4' }}>{sh.carrierInit}</div>
                        <span style={{ fontSize: 12, color: '#718096' }}>{sh.carrier} · {sh.progress}% complete</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('tracking')}>📡 Track Live</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>📄 Documents</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>💬 Contact</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Posted loads */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📋 Posted Loads</h3>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('post-load')}>+ Post New</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {POSTED_LOADS.map(p => {
                const sc = STATUS_CONF[p.status]
                const savings = p.bestOffer < p.budget ? p.budget - p.bestOffer : 0
                return (
                  <div key={p.id} style={{ background: '#F7FAFC', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{p.from} → {p.to}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{p.id} · {p.equipment} · Budget: {fmt(p.budget)}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#8B5CF6' }}>{p.offers} offers</div>
                          <div style={{ fontSize: 10, color: '#A0AEC0' }}>received</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: savings > 0 ? '#48BB78' : '#E53E3E' }}>{fmt(p.bestOffer)}</div>
                          <div style={{ fontSize: 10, color: '#A0AEC0' }}>best offer</div>
                        </div>
                        {savings > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#48BB78' }}>-{fmt(savings)}</div>
                            <div style={{ fontSize: 10, color: '#A0AEC0' }}>vs budget</div>
                          </div>
                        )}
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => onNavigate('shipments')}>View Offers →</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent deliveries */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>✅ Recent Deliveries</h3>
              <button onClick={() => onNavigate('shipments')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>All →</button>
            </div>
            {COMPLETED_RECENT.map(sh => (
              <div key={sh.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid #F0F4F8' }}>
                <div style={{ fontSize: 18 }}>{sh.onTime ? '✅' : '⚠️'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{sh.from} → {sh.to}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{sh.id} · {sh.carrier} · {sh.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{fmt(sh.value)}</div>
                  <div style={{ fontSize: 10, color: sh.onTime ? '#48BB78' : '#E53E3E' }}>{sh.onTime ? 'On Time' : 'Delayed'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Spend chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📊 May Spend</h3>
              <button onClick={() => setShowSpendDetail(v => !v)} style={{ fontSize: 12, color: '#D97706', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                {showSpendDetail ? 'Hide' : 'Details'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 72, marginBottom: 10 }}>
              {MONTH_SPEND.map(w => {
                const h = Math.max((w.spend / maxSpend) * 58, 5)
                const isCurrent = w.week.endsWith('*')
                return (
                  <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ fontSize: 8, color: '#D97706', fontWeight: 700 }}>{fmt(w.spend)}</div>
                    <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: isCurrent ? 'rgba(217,119,6,.3)' : '#D97706', border: isCurrent ? '1.5px dashed #D97706' : 'none' }} />
                    <div style={{ fontSize: 9, color: isCurrent ? '#D97706' : '#A0AEC0' }}>{w.week}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#FFFBEB', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#D97706' }}>{fmt(monthSpend)}</div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>May Total (proj.)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#48BB78' }}>-12%</div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>vs April</div>
              </div>
            </div>
            {showSpendDetail && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { label: 'Dry Van',  pct: 58, color: '#4BAED4' },
                  { label: 'Reefer',   pct: 28, color: '#8B5CF6' },
                  { label: 'Flatbed',  pct: 14, color: '#D97706' },
                ].map(e => (
                  <div key={e.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: '#718096' }}>{e.label}</span>
                      <span style={{ fontWeight: 600, color: e.color }}>{e.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${e.pct}%`, height: '100%', background: e.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trusted carriers */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>⭐ Trusted Carriers</h3>
              <button onClick={() => onNavigate('marketplace')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Find More →</button>
            </div>
            {TRUSTED_CARRIERS.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #F0F4F8' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#4BAED4', flexShrink: 0 }}>
                  {c.init}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{c.type} · {c.loads} loads · {c.onTimePct}% on-time</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#F59E0B', fontWeight: 700 }}>★ {c.rating}</div>
                  <button onClick={() => onNavigate('shipments')} style={{ fontSize: 10, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Book →</button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: 14 }}>
            <h3 className="section-title" style={{ marginBottom: 10 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { icon: '➕', label: 'Post Load',     page: 'post-load'   },
                { icon: '📦', label: 'My Shipments',  page: 'shipments'   },
                { icon: '📡', label: 'Track Orders',  page: 'tracking'    },
                { icon: '🚛', label: 'Find Carrier',  page: 'marketplace' },
                { icon: '💳', label: 'Billing',       page: 'finance'     },
                { icon: '🤖', label: 'AI Assistant',  page: 'ai'          },
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
