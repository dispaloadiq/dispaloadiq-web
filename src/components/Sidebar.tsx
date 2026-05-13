import type { UserRole } from '../types'

interface NavItem {
  icon: string
  label: string
  page: string
  badge?: number
}

const NAV: Record<UserRole, NavItem[]> = {
  'owner-op': [
    { icon: '🏠', label: 'Dashboard',       page: 'dashboard' },
    { icon: '📦', label: 'Find Loads',      page: 'loads',       badge: 12 },
    { icon: '🧭', label: 'Hire Dispatcher', page: 'marketplace' },
    { icon: '🤝', label: 'My Dispatcher',  page: 'my-dispatcher' },
    { icon: '📃', label: 'Contracts',      page: 'contracts' },
    { icon: '🗺️', label: 'Route Planner',  page: 'route' },
    { icon: '🚚', label: 'My Trips (TMS)', page: 'trips' },
    { icon: '📅', label: 'Load Calendar',  page: 'calendar' },
    { icon: '🔄', label: 'Dead Head Opt.', page: 'deadhead' },
    { icon: '🤝', label: 'Broker CRM',     page: 'broker-crm' },
    { icon: '💳', label: 'Quick Pay',       page: 'factoring' },
    { icon: '📡', label: 'Live Tracking',   page: 'tracking' },
    { icon: '💰', label: 'Earnings',        page: 'finance' },
    { icon: '⛽', label: 'Fuel Log',        page: 'fuel' },
    { icon: '🗺️', label: 'Fuel Optimizer', page: 'fuel-optimizer' },
    { icon: '📐', label: 'CPM Calculator',  page: 'cpm' },
    { icon: '🔧', label: 'Maintenance',     page: 'maintenance' },
    { icon: '🔍', label: 'DVIR Inspection', page: 'dvir' },
    { icon: '⏱️', label: 'Detention Timer', page: 'detention' },
    { icon: '➕', label: 'Extra Charges',   page: 'accessorial' },
    { icon: '📄', label: 'Invoices',        page: 'invoices' },
    { icon: '📲', label: 'ePOD',            page: 'epod' },
    { icon: '⚠️', label: 'Claims',          page: 'claims' },
    { icon: '📈', label: 'Reports',         page: 'reports' },
    { icon: '🗂️', label: 'IFTA Filing',    page: 'ifta' },
    { icon: '📋', label: 'Documents',       page: 'docs' },
    { icon: '📉', label: 'Market Rates',    page: 'rates' },
    { icon: '🌡️', label: 'Lane Heatmap',   page: 'lane-heatmap' },
    { icon: '🔍', label: 'FMCSA Lookup',    page: 'fmcsa' },
    { icon: '🔗', label: 'Integrations',   page: 'integrations' },
    { icon: '🔔', label: 'Notifications',  page: 'notifications' },
    { icon: '🤖', label: 'AI Assistant',    page: 'ai' },
    { icon: '⚙️', label: 'Settings',       page: 'settings' },
  ],
  dispatcher: [
    { icon: '🏠', label: 'Dashboard',      page: 'dashboard' },
    { icon: '📋', label: 'Dispatch Board', page: 'dispatch-board', badge: 1 },
    { icon: '📅', label: 'Load Calendar',  page: 'calendar' },
    { icon: '🔄', label: 'Dead Head Opt.', page: 'deadhead' },
    { icon: '🚛', label: 'My Clients',     page: 'clients' },
    { icon: '📦', label: 'Active Loads',   page: 'loads',     badge: 2 },
    { icon: '👥', label: 'Find Clients',   page: 'marketplace' },
    { icon: '💰', label: 'My Earnings',    page: 'finance' },
    { icon: '📄', label: 'Invoices',       page: 'invoices' },
    { icon: '📲', label: 'ePOD',           page: 'epod' },
    { icon: '⚠️', label: 'Claims',         page: 'claims' },
    { icon: '⏱️', label: 'Detention Timer', page: 'detention' },
    { icon: '➕', label: 'Extra Charges',  page: 'accessorial' },
    { icon: '⭐', label: 'My Profile',     page: 'dispatcher-profile' },
    { icon: '📃', label: 'Contracts',      page: 'contracts' },
    { icon: '📊', label: 'Analytics',      page: 'analytics' },
    { icon: '🏅', label: 'Carrier Scores', page: 'carrier-scorecard' },
    { icon: '🔍', label: 'FMCSA Lookup',   page: 'fmcsa' },
    { icon: '🔗', label: 'Integrations',  page: 'integrations' },
    { icon: '🔔', label: 'Notifications', page: 'notifications' },
    { icon: '📉', label: 'Market Rates',   page: 'rates' },
    { icon: '🌡️', label: 'Lane Heatmap',  page: 'lane-heatmap' },
    { icon: '🤖', label: 'AI Assistant',   page: 'ai' },
    { icon: '⚙️', label: 'Settings',      page: 'settings' },
  ],
  company: [
    { icon: '🏠', label: 'Dashboard',       page: 'dashboard' },
    { icon: '📋', label: 'Dispatch Board',  page: 'dispatch-board', badge: 1 },
    { icon: '🚛', label: 'Fleet',           page: 'fleet',    badge: 3 },
    { icon: '👤', label: 'Drivers',         page: 'drivers' },
    { icon: '📦', label: 'Loads',           page: 'loads' },
    { icon: '🚚', label: 'Orders (TMS)',    page: 'trips' },
    { icon: '📅', label: 'Load Calendar',   page: 'calendar' },
    { icon: '🔄', label: 'Dead Head Opt.',  page: 'deadhead' },
    { icon: '👥', label: 'Customers',       page: 'customers' },
    { icon: '💳', label: 'Quick Pay',       page: 'factoring' },
    { icon: '🧭', label: 'Hire Dispatcher', page: 'marketplace' },
    { icon: '🤝', label: 'My Dispatcher',   page: 'my-dispatcher' },
    { icon: '📃', label: 'Contracts',       page: 'contracts' },
    { icon: '📡', label: 'Live Tracking',   page: 'tracking' },
    { icon: '💰', label: 'Finance',         page: 'finance' },
    { icon: '⛽', label: 'Fuel Log',        page: 'fuel' },
    { icon: '🗺️', label: 'Fuel Optimizer', page: 'fuel-optimizer' },
    { icon: '📐', label: 'CPM Calculator',  page: 'cpm' },
    { icon: '🔧', label: 'Maintenance',     page: 'maintenance' },
    { icon: '🔍', label: 'DVIR Inspection', page: 'dvir' },
    { icon: '⏱️', label: 'Detention Timer', page: 'detention' },
    { icon: '➕', label: 'Extra Charges',   page: 'accessorial' },
    { icon: '📄', label: 'Invoices',        page: 'invoices' },
    { icon: '📲', label: 'ePOD',            page: 'epod' },
    { icon: '⚠️', label: 'Claims',          page: 'claims' },
    { icon: '💼', label: 'Payroll',         page: 'payroll' },
    { icon: '🛡️', label: 'Safety',         page: 'safety' },
    { icon: '📊', label: 'Analytics',       page: 'analytics' },
    { icon: '📈', label: 'Reports',         page: 'reports' },
    { icon: '🗂️', label: 'IFTA Filing',    page: 'ifta' },
    { icon: '📋', label: 'Compliance',      page: 'compliance' },
    { icon: '👔', label: 'Driver Recruiting', page: 'driver-recruitment' },
    { icon: '🔍', label: 'FMCSA Lookup',     page: 'fmcsa' },
    { icon: '🔗', label: 'Integrations',     page: 'integrations' },
    { icon: '🔔', label: 'Notifications',    page: 'notifications' },
    { icon: '📉', label: 'Market Rates',     page: 'rates' },
    { icon: '🌡️', label: 'Lane Heatmap',    page: 'lane-heatmap' },
    { icon: '🤖', label: 'AI Assistant',     page: 'ai' },
    { icon: '⚙️', label: 'Settings',         page: 'settings' },
  ],
  shipper: [
    { icon: '🏠', label: 'Dashboard',     page: 'dashboard' },
    { icon: '➕', label: 'Post Load',     page: 'post-load' },
    { icon: '📦', label: 'My Shipments',  page: 'shipments', badge: 4 },
    { icon: '📡', label: 'Track Orders',  page: 'tracking' },
    { icon: '🚛', label: 'Find Carrier',  page: 'marketplace' },
    { icon: '💳', label: 'Billing',       page: 'finance' },
    { icon: '📊', label: 'Reports',       page: 'analytics' },
    { icon: '🏅', label: 'Carrier Scores', page: 'carrier-scorecard' },
    { icon: '⚠️', label: 'Claims',         page: 'claims' },
    { icon: '📡', label: 'Track Order',   page: 'public-tracker' },
    { icon: '🔔', label: 'Notifications', page: 'notifications' },
    { icon: '🤖', label: 'AI Assistant', page: 'ai' },
    { icon: '⚙️', label: 'Settings',     page: 'settings' },
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  'owner-op':  'Owner-Operator',
  dispatcher:  'Dispatcher',
  company:     'Transport Company',
  shipper:     'Shipper',
}

const ROLE_ICONS: Record<UserRole, string> = {
  'owner-op':  '🚛',
  dispatcher:  '🧭',
  company:     '🏢',
  shipper:     '📦',
}

interface Props {
  role: UserRole
  activePage: string
  userName: string
  onNavigate: (page: string) => void
  onLogout: () => void
}

export default function Sidebar({ role, activePage, userName, onNavigate, onLogout }: Props) {
  const items = NAV[role]

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">🚛 DispaLoadIQ</div>
        <div className="sidebar-logo-sub">AI-Powered Platform</div>
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 20px 4px' }}>
        <div style={{
          background: 'rgba(75,174,212,.15)', borderRadius: 8,
          padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>{ROLE_ICONS[role]}</span>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 1 }}>Role</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section" style={{ flex: 1, marginTop: 8 }}>
        <div className="sidebar-section-label">Navigation</div>
        {items.map(item => (
          <button
            key={item.page}
            className={`sidebar-item ${activePage === item.page ? 'active' : ''}`}
            onClick={() => onNavigate(item.page)}
          >
            <span className="icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && <span className="badge-dot">{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Upgrade banner */}
        {role === 'owner-op' && (
          <div style={{
            background: 'linear-gradient(135deg, #4BAED4, #2D7A9A)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              ⚡ Upgrade to Pro
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginBottom: 10 }}>
              AI Score, IFTA reports & more
            </div>
            <button style={{
              width: '100%', background: '#fff', color: '#2D7A9A',
              border: 'none', borderRadius: 7, padding: '7px', fontSize: 12,
              fontWeight: 700, cursor: 'pointer',
            }}>
              $29/mo → Upgrade
            </button>
          </div>
        )}

        {/* User */}
        <div className="sidebar-user" onClick={onLogout} title="Выйти">
          <div className="avatar" style={{ background: '#4BAED4', color: '#fff', fontSize: 14, fontWeight: 700 }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name truncate">{userName}</div>
            <div className="sidebar-user-role">← Выйти</div>
          </div>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,.3)' }}>↩</span>
        </div>
      </div>
    </aside>
  )
}
