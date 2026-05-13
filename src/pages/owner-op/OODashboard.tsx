import { useState } from 'react'

// ── Mock data ─────────────────────────────────────────────────────────────────
const WEEK_EARNINGS = [
  { day: 'Mon', gross: 1_854, miles: 850  },
  { day: 'Tue', gross: 0,     miles: 0    },
  { day: 'Wed', gross: 2_786, miles: 1201 },
  { day: 'Thu', gross: 1_690, miles: 690  },
  { day: 'Fri', gross: 0,     miles: 0    },
  { day: 'Sat', gross: 1_420, miles: 620  },
  { day: 'Sun', gross: 0,     miles: 0    },
]

const ACTIVE_TRIP = {
  id: 'TRP-20045',
  status: 'in_transit',
  from: 'Memphis, TN',
  to: 'Nashville, TN',
  broker: 'Echo Global Logistics',
  brokerContact: 'Kevin Morris',
  grossRate: 1_420,
  miles: 212,
  progress: 72,
  eta: '2ч 15мин',
  pickup: '08:00 Apr 21',
  delivery: '14:00 Apr 21',
  rpm: 2.38,
  cargo: 'General Freight · 42,000 lbs · Dry Van',
}

const RECENT_TRIPS = [
  { id: 'TRP-20044', from: 'Chicago, IL', to: 'Dallas, TX',    gross: 1_854, rpm: 2.18, status: 'paid',      date: 'Apr 19' },
  { id: 'TRP-20043', from: 'Atlanta, GA', to: 'Miami, FL',     gross: 1_690, rpm: 2.45, status: 'invoiced',  date: 'Apr 17' },
  { id: 'TRP-20042', from: 'Houston, TX', to: 'Phoenix, AZ',   gross: 2_786, rpm: 2.32, status: 'paid',      date: 'Apr 14' },
]

const HOT_LOADS = [
  { from: 'Nashville, TN', to: 'Chicago, IL',  gross: '$1,680', rpm: '$2.58', aiScore: 97, type: 'Dry Van', pickup: 'Today 15:00' },
  { from: 'Memphis, TN',   to: 'Atlanta, GA',  gross: '$1,340', rpm: '$2.44', aiScore: 93, type: 'Dry Van', pickup: 'Today 17:00' },
  { from: 'Nashville, TN', to: 'Detroit, MI',  gross: '$2,100', rpm: '$2.61', aiScore: 91, type: 'Reefer',  pickup: 'Tomorrow'   },
]

const maxEarning = Math.max(...WEEK_EARNINGS.map(d => d.gross), 1)
const weekGross  = WEEK_EARNINGS.reduce((s, d) => s + d.gross, 0)
const weekMiles  = WEEK_EARNINGS.reduce((s, d) => s + d.miles, 0)
const weekRPM    = weekMiles > 0 ? (weekGross / weekMiles).toFixed(2) : '—'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const TRIP_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  paid:       { label: '💚 Paid',       color: '#276749', bg: '#F0FFF4' },
  invoiced:   { label: '📄 Invoiced',   color: '#2C7A9A', bg: '#EBF8FF' },
  delivered:  { label: '✅ Delivered',  color: '#553C9A', bg: '#FAF5FF' },
  in_transit: { label: '🚛 In Transit', color: '#D97706', bg: '#FFFBEB' },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OODashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [aiTipVisible, setAiTipVisible] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* AI Insight banner */}
      {aiTipVisible && (
        <div style={{
          background: 'linear-gradient(135deg, #EBF8FF, #E6FFFA)',
          border: '1.5px solid #4BAED4', borderRadius: 14,
          padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <span style={{ fontSize: 26 }}>🤖</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#2C7A9A', marginBottom: 3, fontSize: 13 }}>AI Market Insight</div>
            <div style={{ fontSize: 13, color: '#2D3748', lineHeight: 1.5 }}>
              Ставки из Nashville на Chicago выросли на <strong>14% за неделю</strong> — сейчас лучшее время забрать груз обратно. Рекомендуемый следующий рейс: Nashville → Chicago, $2.58/mi, AI Score 97%.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => onNavigate('loads')} style={{ padding: '7px 14px', borderRadius: 8, background: '#4BAED4', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View Load →
            </button>
            <button onClick={() => setAiTipVisible(false)} style={{ color: '#A0AEC0', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="stats-grid">
        {[
          { label: "Week Gross",       value: fmt(weekGross),          change: '+8% vs прошлая', up: true,  color: '#4BAED4', icon: '💰' },
          { label: 'Week Miles',       value: weekMiles.toLocaleString(), change: '+210 mi',      up: true,  color: '#38C770', icon: '🛣️' },
          { label: 'Avg Rate / Mile',  value: `$${weekRPM}`,           change: '+$0.12 vs avg',  up: true,  color: '#8B5CF6', icon: '📈' },
          { label: 'Loads This Week',  value: WEEK_EARNINGS.filter(d => d.gross > 0).length, change: '1 active now', up: true, color: '#D97706', icon: '📦' },
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

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

        {/* ── LEFT column ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Active Trip card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🚛 Active Trip</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#FFFBEB', color: '#D97706', border: '1px solid #F6E05E' }}>● IN TRANSIT</span>
                <button onClick={() => onNavigate('trips')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Open TMS →</button>
              </div>
            </div>

            {/* Route */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 110 }}>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>PICKUP</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>{ACTIVE_TRIP.from}</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{ACTIVE_TRIP.pickup}</div>
              </div>
              <div style={{ flex: 1, position: 'relative', textAlign: 'center' }}>
                <div style={{ height: 2, background: '#E2E8F0', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                <div style={{ height: 2, background: '#38C770', position: 'absolute', top: '50%', left: 0, width: `${ACTIVE_TRIP.progress}%` }} />
                <span style={{ position: 'relative', background: '#fff', padding: '0 8px', fontSize: 12, color: '#4BAED4', fontWeight: 700 }}>
                  {ACTIVE_TRIP.progress}% · {ACTIVE_TRIP.miles} mi
                </span>
              </div>
              <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 110 }}>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>DELIVERY</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>{ACTIVE_TRIP.to}</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{ACTIVE_TRIP.delivery}</div>
              </div>
            </div>

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Gross Rate',  value: fmt(ACTIVE_TRIP.grossRate),              color: '#38C770' },
                { label: 'Rate/Mile',   value: `$${ACTIVE_TRIP.rpm}/mi`,                color: '#4BAED4' },
                { label: 'ETA',         value: ACTIVE_TRIP.eta,                          color: '#D97706' },
                { label: 'Broker',      value: ACTIVE_TRIP.brokerContact,               color: '#8B5CF6' },
              ].map(m => (
                <div key={m.label} style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 12 }}>📦 {ACTIVE_TRIP.cargo} · {ACTIVE_TRIP.id}</div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>📄 View BOL</button>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>💬 Call Broker</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('tracking')}>📡 Track Live</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, background: '#8B5CF6' }} onClick={() => onNavigate('trips')}>📋 Full TMS</button>
            </div>
          </div>

          {/* Weekly earnings chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📊 Week Earnings</h3>
              <button onClick={() => onNavigate('finance')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Full Report →</button>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100 }}>
              {WEEK_EARNINGS.map((d, i) => {
                const h = d.gross > 0 ? Math.max((d.gross / maxEarning) * 84, 8) : 4
                const isToday = i === 3
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {d.gross > 0 && (
                      <div style={{ fontSize: 9, color: '#4BAED4', fontWeight: 700 }}>{fmt(d.gross)}</div>
                    )}
                    <div style={{
                      width: '100%', height: h, borderRadius: '4px 4px 0 0',
                      background: d.gross > 0
                        ? (isToday ? '#4BAED4' : 'rgba(75,174,212,.35)')
                        : '#F0F4F8',
                      border: isToday ? '1.5px solid #4BAED4' : 'none',
                    }} />
                    <div style={{ fontSize: 10, color: isToday ? '#4BAED4' : '#A0AEC0', fontWeight: isToday ? 700 : 400 }}>{d.day}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0F4F8' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#38C770' }}>{fmt(weekGross)}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Week Gross</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#4BAED4' }}>${weekRPM}/mi</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Avg RPM</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#8B5CF6' }}>{weekMiles.toLocaleString()} mi</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Total Miles</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#D97706' }}>{fmt(weekGross * 0.08)}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>Dispatcher Fee</div>
              </div>
            </div>
          </div>

          {/* Recent trips */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📋 Recent Trips</h3>
              <button onClick={() => onNavigate('trips')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>All Trips →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {RECENT_TRIPS.map(t => {
                const sc = TRIP_STATUS[t.status]
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F0F4F8' }}>
                    <div style={{ fontSize: 11, color: '#A0AEC0', minWidth: 72, fontWeight: 600 }}>{t.id}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{t.from} → {t.to}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>{t.date} · ${t.rpm}/mi</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#2D3748' }}>{fmt(t.gross)}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: sc.bg, color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT column ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* My Dispatcher */}
          <div className="card">
            <h3 className="section-title">🧭 My Dispatcher</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, background: '#EBF8FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👨‍💼</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>Alex Petrov</div>
                <div style={{ color: '#718096', fontSize: 12 }}>Chicago, IL · 5% gross</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                  <span className="badge badge-success">● Online</span>
                  <span className="badge badge-primary">★ 4.98</span>
                  <span style={{ fontSize: 11, background: '#F7FAFC', color: '#718096', padding: '2px 6px', borderRadius: 6 }}>⚡ &lt;5 мин</span>
                </div>
              </div>
            </div>
            {/* RPM guarantee */}
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#718096' }}>RPM Guarantee</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>$2.38 / $2.55 goal</span>
              </div>
              <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '93%', height: '100%', background: 'linear-gradient(90deg, #38C770, #4BAED4)', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>93% of weekly guarantee</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('chat')}>💬 Chat</button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('my-dispatcher')}>Details →</button>
            </div>
          </div>

          {/* Hot Loads */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🔥 Loads Near You</h3>
              <button onClick={() => onNavigate('loads')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>See all →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {HOT_LOADS.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F7FAFC', borderRadius: 10, cursor: 'pointer' }}
                  onClick={() => onNavigate('loads')}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: '#EBF8FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: '#4BAED4', flexShrink: 0,
                  }}>AI{l.aiScore}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }} className="truncate">{l.from} → {l.to}</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0' }}>{l.type} · {l.pickup}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#4BAED4' }}>{l.gross}</div>
                    <div style={{ fontSize: 11, color: '#718096' }}>{l.rpm}/mi</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={() => onNavigate('loads')}>
              🤖 AI-Optimize My Next Load
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: 14 }}>
            <h3 className="section-title" style={{ marginBottom: 10 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '🚚', label: 'My Trips',      page: 'trips',        color: '#4BAED4' },
                { icon: '🤝', label: 'Broker CRM',    page: 'broker-crm',   color: '#8B5CF6' },
                { icon: '📦', label: 'Find Load',     page: 'loads',        color: '#38C770' },
                { icon: '🗺️', label: 'Plan Route',   page: 'route',        color: '#D97706' },
                { icon: '💰', label: 'Earnings',      page: 'finance',      color: '#E53E3E' },
                { icon: '📄', label: 'Invoices',      page: 'invoices',     color: '#718096' },
                { icon: '🔧', label: 'Maintenance',   page: 'maintenance',  color: '#D97706' },
                { icon: '📉', label: 'Market Rates',  page: 'rates',        color: '#4BAED4' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.page)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0',
                  background: '#F7FAFC', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2D3748',
                }}>
                  <span style={{ fontSize: 16 }}>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
