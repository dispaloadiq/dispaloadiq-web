import { useState } from 'react'

// ── Mock data ─────────────────────────────────────────────────────────────────
const FLEET = [
  { id: '1', plate: 'IL 4829-XR', type: 'Dry Van',  driver: 'Mike Rodriguez',   driverInit: 'M', status: 'active',      order: 'TRP-20041', route: 'Chicago → Dallas',   miles: 850,  progress: 64, eta: '4h 20m', rpm: 2.18, fuel: 72 },
  { id: '2', plate: 'FL 7731-KA', type: 'Reefer',   driver: 'Sergiy Kovalchuk', driverInit: 'S', status: 'active',      order: 'TRP-20043', route: 'Miami → Atlanta',    miles: 662,  progress: 48, eta: '6h 10m', rpm: 2.45, fuel: 58 },
  { id: '3', plate: 'TX 2201-BB', type: 'Flatbed',  driver: 'Tom Bradley',      driverInit: 'T', status: 'idle',        order: null,        route: null,                miles: 0,    progress: 0,  eta: null,     rpm: 0,    fuel: 90 },
  { id: '4', plate: 'CA 8812-PP', type: 'Dry Van',  driver: 'Anna Perez',       driverInit: 'A', status: 'active',      order: 'TRP-20044', route: 'LA → Sacramento',   miles: 400,  progress: 81, eta: '1h 45m', rpm: 2.22, fuel: 45 },
  { id: '5', plate: 'NY 5541-ZZ', type: 'Reefer',   driver: 'James Walsh',      driverInit: 'J', status: 'maintenance', order: null,        route: null,                miles: 0,    progress: 0,  eta: null,     rpm: 0,    fuel: 0 },
]

const STATUS_CONF: Record<string, { label: string; color: string; bg: string }> = {
  active:      { label: '● Active',      color: '#276749', bg: '#F0FFF4' },
  idle:        { label: '● Idle',        color: '#B7791F', bg: '#FEFCBF' },
  maintenance: { label: '● Maintenance', color: '#9B2C2C', bg: '#FFF5F5' },
}

const ORDERS_PIPELINE = [
  { status: 'confirmed',     count: 2, color: '#A0AEC0' },
  { status: 'enroute',       count: 1, color: '#4BAED4' },
  { status: 'in_transit',    count: 3, color: '#D97706' },
  { status: 'delivered',     count: 4, color: '#8B5CF6' },
  { status: 'invoiced',      count: 3, color: '#2C7A9A' },
  { status: 'paid',          count: 8, color: '#48BB78' },
]

const MONTH_REVENUE = [
  { week: 'W1',  rev: 14_200 },
  { week: 'W2',  rev: 18_800 },
  { week: 'W3',  rev: 16_400 },
  { week: 'W4*', rev: 13_000 },
]
const maxRev = Math.max(...MONTH_REVENUE.map(w => w.rev))

const TOP_CUSTOMERS = [
  { name: 'Amazon DC',     rev: 42_800, pct: 68, color: '#4BAED4' },
  { name: 'Target Stores', rev: 18_200, pct: 29, color: '#8B5CF6' },
  { name: 'PepsiCo Dist.', rev: 9_400,  pct: 15, color: '#38C770' },
  { name: 'Others',        rev: 4_200,  pct: 7,  color: '#A0AEC0' },
]

const ALERTS = [
  { icon: '🔴', text: 'Truck NY 5541-ZZ — in maintenance (Day 3)', level: 'error',   page: 'maintenance' },
  { icon: '⚠️', text: 'Tom Bradley — idle, no load assigned',      level: 'warning', page: 'dispatch-board' },
  { icon: '📋', text: '3 loads need driver assignment',             level: 'warning', page: 'dispatch-board' },
  { icon: '💼', text: 'Payroll ready: 4 drivers · $12,480',        level: 'info',    page: 'payroll' },
  { icon: '📅', text: 'IFTA Q2 due in 12 days',                    level: 'warning', page: 'fuel' },
  { icon: '✅', text: 'All CDL & insurance current',               level: 'success', page: 'compliance' },
]

const LEVEL_COLOR: Record<string, string> = {
  error: '#E53E3E', warning: '#D97706', info: '#4BAED4', success: '#38C770',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CompanyDashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [fleetView, setFleetView] = useState<'all' | 'active' | 'idle'>('all')

  const activeCount     = FLEET.filter(t => t.status === 'active').length
  const idleCount       = FLEET.filter(t => t.status === 'idle').length
  const maintenanceCount= FLEET.filter(t => t.status === 'maintenance').length
  const totalOrders     = ORDERS_PIPELINE.reduce((s, o) => s + o.count, 0)
  const paidOrders      = ORDERS_PIPELINE.find(o => o.status === 'paid')?.count ?? 0
  const monthRev        = MONTH_REVENUE.reduce((s, w) => s + w.rev, 0)

  const filteredFleet = FLEET.filter(t =>
    fleetView === 'all' ? true : fleetView === 'active' ? t.status === 'active' : t.status === 'idle'
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI strip */}
      <div className="stats-grid">
        {[
          { label: 'Active Trucks',    value: `${activeCount}/${FLEET.length}`,  change: `${maintenanceCount} in maintenance`,  up: maintenanceCount === 0, color: '#4BAED4', icon: '🚛' },
          { label: 'Month Revenue',    value: fmt(monthRev),                      change: '+18% vs March',                        up: true,                   color: '#38C770', icon: '💰' },
          { label: 'Fleet Avg RPM',    value: '$2.39/mi',                         change: '+$0.08 vs target',                     up: true,                   color: '#8B5CF6', icon: '📈' },
          { label: 'Open Orders',      value: totalOrders - paidOrders,           change: `${paidOrders} paid this month`,         up: true,                   color: '#D97706', icon: '📦' },
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

      {/* Main 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── LEFT ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Orders Pipeline */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📦 Orders Pipeline (TMS)</h3>
              <button onClick={() => onNavigate('trips')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Open TMS →</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {ORDERS_PIPELINE.map(o => (
                <div key={o.status} style={{ flex: o.count, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 36, borderRadius: 8, background: o.color + '25', border: `1.5px solid ${o.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: o.color }}>{o.count}</span>
                  </div>
                  <span style={{ fontSize: 9, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{o.status}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('trips')}>📋 View All Orders</button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('dispatch-board')}>🗂️ Dispatch Board</button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onNavigate('customers')}>👥 Customers</button>
            </div>
          </div>

          {/* Fleet board */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🚛 Fleet Board</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['all', 'active', 'idle'] as const).map(v => (
                  <button key={v} onClick={() => setFleetView(v)} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: fleetView === v ? '#059669' : '#E2E8F0',
                    background: fleetView === v ? '#F0FFF4' : '#fff',
                    color: fleetView === v ? '#276749' : '#718096',
                  }}>{v === 'all' ? `All (${FLEET.length})` : v === 'active' ? `Active (${activeCount})` : `Idle (${idleCount})`}</button>
                ))}
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('fleet')}>+ Add</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredFleet.map(t => {
                const sc = STATUS_CONF[t.status]
                return (
                  <div key={t.id} style={{ background: '#F7FAFC', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: t.status === 'active' ? 10 : 0 }}>
                      {/* Avatar */}
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#4BAED4', flexShrink: 0 }}>
                        {t.driverInit}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{t.plate}</span>
                          <span style={{ fontSize: 11, color: '#718096' }}>{t.type}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{t.driver}</div>
                      </div>
                      {/* Fuel */}
                      {t.fuel > 0 && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, color: '#A0AEC0' }}>⛽</span>
                            <div style={{ width: 48, height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${t.fuel}%`, height: '100%', background: t.fuel < 30 ? '#E53E3E' : t.fuel < 60 ? '#ECC94B' : '#48BB78', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, color: '#718096' }}>{t.fuel}%</span>
                          </div>
                        </div>
                      )}
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {t.status === 'active' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('tracking')}>Track</button>
                        )}
                        {t.status === 'idle' && (
                          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('dispatch-board')}>Assign</button>
                        )}
                        {t.status === 'maintenance' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('maintenance')}>View</button>
                        )}
                      </div>
                    </div>

                    {/* Active trip progress */}
                    {t.status === 'active' && t.route && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#718096' }}>{t.route}</span>
                          <span style={{ fontSize: 12, color: '#4BAED4', fontWeight: 700 }}>ETA {t.eta}</span>
                        </div>
                        <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${t.progress}%`, height: '100%', background: 'linear-gradient(90deg, #38C770, #4BAED4)', borderRadius: 3 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                          <span style={{ fontSize: 10, color: '#A0AEC0' }}>{t.order} · {t.miles} mi</span>
                          <span style={{ fontSize: 10, color: '#718096', fontWeight: 600 }}>{t.progress}% complete</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Month Revenue chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📊 May Revenue</h3>
              <button onClick={() => onNavigate('finance')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Full →</button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80, marginBottom: 8 }}>
              {MONTH_REVENUE.map(w => {
                const h = Math.max((w.rev / maxRev) * 68, 6)
                const isCurrentWeek = w.week.endsWith('*')
                return (
                  <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ fontSize: 9, color: '#059669', fontWeight: 700 }}>{fmt(w.rev)}</div>
                    <div style={{
                      width: '100%', height: h, borderRadius: '4px 4px 0 0',
                      background: isCurrentWeek ? 'rgba(5,150,105,.3)' : '#059669',
                      border: isCurrentWeek ? '1.5px dashed #059669' : 'none',
                    }} />
                    <div style={{ fontSize: 10, color: isCurrentWeek ? '#059669' : '#A0AEC0' }}>{w.week}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: '#F0FFF4', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{fmt(monthRev)}</div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>May Total (proj.)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#276749' }}>+18%</div>
                <div style={{ fontSize: 10, color: '#A0AEC0' }}>vs April</div>
              </div>
            </div>
          </div>

          {/* Top customers */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>👥 Top Customers</h3>
              <button onClick={() => onNavigate('customers')} style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Manage →</button>
            </div>
            {TOP_CUSTOMERS.map(c => (
              <div key={c.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#2D3748' }}>{c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{fmt(c.rev)}</span>
                </div>
                <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🔔 Alerts</h3>
              <span style={{ fontSize: 11, background: '#FFF5F5', color: '#E53E3E', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
                {ALERTS.filter(a => a.level === 'error' || a.level === 'warning').length} active
              </span>
            </div>
            {ALERTS.map((a, i) => (
              <div key={i} onClick={() => onNavigate(a.page)} style={{
                display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #F0F4F8',
                cursor: 'pointer', alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <span style={{ fontSize: 12, color: LEVEL_COLOR[a.level], lineHeight: 1.4, flex: 1 }}>{a.text}</span>
                <span style={{ fontSize: 12, color: '#A0AEC0', flexShrink: 0 }}>→</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: 14 }}>
            <h3 className="section-title" style={{ marginBottom: 10 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {[
                { icon: '🚚', label: 'Orders (TMS)',   page: 'trips' },
                { icon: '👥', label: 'Customers',      page: 'customers' },
                { icon: '🗂️', label: 'Dispatch Board', page: 'dispatch-board' },
                { icon: '👤', label: 'Drivers',        page: 'drivers' },
                { icon: '💼', label: 'Payroll',        page: 'payroll' },
                { icon: '🛡️', label: 'Safety',        page: 'safety' },
                { icon: '📊', label: 'Analytics',      page: 'analytics' },
                { icon: '📉', label: 'Market Rates',   page: 'rates' },
              ].map(a => (
                <button key={a.label} onClick={() => onNavigate(a.page)} style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px',
                  borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F7FAFC',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#2D3748',
                }}>
                  <span style={{ fontSize: 15 }}>{a.icon}</span>
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
