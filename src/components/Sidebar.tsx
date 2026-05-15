import { useState } from 'react'
import type { UserRole } from '../types'
import { useModules, CORE_PAGES } from '../lib/useModules'

interface NavItem {
  icon: string
  label: string
  page: string
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

// ── Dispatcher grouped navigation ─────────────────────────────────────────────
const DISPATCHER_SECTIONS: NavSection[] = [
  {
    title: 'COMMAND CENTER',
    items: [
      { icon: '🏠', label: 'Dashboard',       page: 'dashboard' },
      { icon: '⚡', label: 'Workspace',       page: 'workspace', badge: 2 },
      { icon: '🔔', label: 'Notifications',   page: 'notifications', badge: 3 },
    ],
  },
  {
    title: 'MY CLIENTS',
    items: [
      { icon: '🚛', label: 'My Clients',      page: 'clients' },
      { icon: '🎯', label: 'Opportunities',   page: 'opportunities', badge: 5 },
      { icon: '👥', label: 'Marketplace',     page: 'marketplace' },
      { icon: '⭐', label: 'My Profile',      page: 'dispatcher-profile' },
      { icon: '🛡️', label: 'Verification',   page: 'verification' },
      { icon: '🎓', label: 'Academy',         page: 'academy' },
      { icon: '📃', label: 'Contracts',       page: 'contracts' },
      { icon: '✍️', label: 'Smart Contract',  page: 'smart-contract' },
    ],
  },
  {
    title: 'AI & DEALS',
    items: [
      { icon: '⏰', label: 'Proactive Dispatch', page: 'proactive-dispatch', badge: 2 },
      { icon: '🚨', label: 'Emergency Load',     page: 'emergency-load' },
      { icon: '🤖', label: 'AI Load Match',      page: 'ai-match',       badge: 5 },
      { icon: '📄', label: 'RC Analyzer',        page: 'rc-analyzer' },
      { icon: '↩️', label: 'Backhaul Finder',    page: 'backhaul-finder' },
    ],
  },
  {
    title: 'DOCUMENTS & RATES',
    items: [
      { icon: '🗂️', label: 'Doc Flow',        page: 'doc-flow',   badge: 3 },
      { icon: '📊', label: 'Rate Intel',       page: 'rate-intel' },
      { icon: '📊', label: 'Deal Tracker',     page: 'deal-tracker' },
      { icon: '💬', label: 'Driver Comms',     page: 'driver-comms', badge: 2 },
      { icon: '📈', label: 'My P&L',           page: 'dispatcher-pnl' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { icon: '📦', label: 'Active Loads',    page: 'loads',           badge: 2 },
      { icon: '📡', label: 'Load Status',     page: 'load-status',     badge: 1 },
      { icon: '📋', label: 'Dispatch Board',  page: 'dispatch-board',  badge: 1 },
      { icon: '🤝', label: 'Negotiations',    page: 'load-negotiation' },
      { icon: '📅', label: 'Load Calendar',   page: 'calendar' },
      { icon: '🔄', label: 'Dead Head Opt.',  page: 'deadhead' },
      { icon: '📲', label: 'ePOD',            page: 'epod' },
      { icon: '⏱️', label: 'Detention Timer', page: 'detention' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { icon: '💰', label: 'My Earnings',     page: 'finance' },
      { icon: '⚡', label: 'Quick Pay',       page: 'quick-pay',       badge: 2 },
      { icon: '💸', label: 'Payout Tracker',  page: 'payout-tracker' },
      { icon: '📄', label: 'Invoices',        page: 'invoices' },
      { icon: '➕', label: 'Extra Charges',   page: 'accessorial' },
      { icon: '⚠️', label: 'Claims',          page: 'claims' },
    ],
  },
  {
    title: 'BROKER NETWORK',
    items: [
      { icon: '🛡️', label: 'Broker Trust',     page: 'broker-trust', badge: 2 },
      { icon: '🤝', label: 'Broker CRM',      page: 'broker-crm' },
      { icon: '📉', label: 'Market Rates',    page: 'rates' },
      { icon: '🌡️', label: 'Lane Heatmap',   page: 'lane-heatmap' },
      { icon: '🏅', label: 'Carrier Scores',  page: 'carrier-scorecard' },
    ],
  },
  {
    title: 'GROWTH',
    items: [
      { icon: '🧮', label: 'Earnings Calc',    page: 'earnings-calculator' },
      { icon: '🎁', label: 'Referral Program', page: 'referral',  badge: 2 },
      { icon: '🏅', label: 'My Public Profile',page: 'public-profile' },
      { icon: '📊', label: 'Scorecard',        page: 'dispatcher-scorecard' },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { icon: '📊', label: 'Analytics',       page: 'analytics' },
      { icon: '🤖', label: 'AI Assistant',    page: 'ai' },
      { icon: '🔍', label: 'FMCSA Lookup',    page: 'fmcsa' },
      { icon: '🔗', label: 'Integrations',    page: 'integrations' },
      { icon: '⚙️', label: 'Settings',        page: 'settings' },
    ],
  },
]

// ── New-Dispatcher navigation (0 clients — focused onboarding) ───────────────
const DISPATCHER_NEW_SECTIONS: NavSection[] = [
  {
    title: 'GETTING STARTED',
    items: [
      { icon: '🏠', label: 'Dashboard',       page: 'dashboard' },
      { icon: '🔔', label: 'Notifications',   page: 'notifications' },
    ],
  },
  {
    title: '🛡️ GET VERIFIED',
    items: [
      { icon: '🪪', label: 'Get Verified',    page: 'verification',  badge: 1 },
      { icon: '📋', label: 'Skills Test',     page: 'skills-test' },
      { icon: '🎓', label: 'Academy',         page: 'academy',       badge: 1 },
    ],
  },
  {
    title: 'FIND YOUR FIRST CLIENT',
    items: [
      { icon: '🎯', label: 'Opportunities',   page: 'opportunities', badge: 5 },
      { icon: '📨', label: 'My Proposals',    page: 'opportunities' },
    ],
  },
  {
    title: 'MY PROFILE',
    items: [
      { icon: '⭐', label: 'My Profile',       page: 'dispatcher-profile' },
      { icon: '🏅', label: 'Public Profile',   page: 'public-profile' },
      { icon: '📃', label: 'Contracts',        page: 'contracts' },
    ],
  },
  {
    title: 'ПЛАН',
    items: [
      { icon: '🧮', label: 'Earnings Calc',    page: 'earnings-calculator' },
      { icon: '🎁', label: 'Referral Program', page: 'referral' },
    ],
  },
  {
    title: 'LOCKED — UNLOCKS WITH FIRST CLIENT',
    items: [
      { icon: '🔒', label: 'Active Loads',     page: 'loads' },
      { icon: '🔒', label: 'Deal Tracker',     page: 'deal-tracker' },
      { icon: '🔒', label: 'Driver Comms',     page: 'driver-comms' },
      { icon: '🔒', label: 'Doc Flow',         page: 'doc-flow' },
    ],
  },
]

// ── Owner-Operator grouped navigation ────────────────────────────────────────
const OO_SECTIONS: NavSection[] = [
  {
    title: 'HOME',
    items: [
      { icon: '🏠', label: 'Dashboard',       page: 'dashboard' },
      { icon: '🔔', label: 'Notifications',   page: 'notifications', badge: 3 },
    ],
  },
  {
    title: 'LOADS',
    items: [
      { icon: '📦', label: 'Find Loads',      page: 'loads',       badge: 12 },
      { icon: '📅', label: 'Load Calendar',  page: 'calendar' },
      { icon: '🧭', label: 'Find Dispatcher', page: 'find-dispatcher', badge: 3 },
      { icon: '🤝', label: 'My Dispatcher',  page: 'my-dispatcher' },
      { icon: '📊', label: 'Dispatcher Score', page: 'dispatcher-scorecard' },
      { icon: '🛡️', label: 'Broker Trust',   page: 'broker-trust' },
      { icon: '🗺️', label: 'Route Planner',  page: 'route' },
      { icon: '🔄', label: 'Dead Head Opt.', page: 'deadhead' },
    ],
  },
  {
    title: 'TRIPS & TRACKING',
    items: [
      { icon: '🚚', label: 'My Trips (TMS)', page: 'trips' },
      { icon: '📡', label: 'Live Tracking',  page: 'tracking' },
      { icon: '📲', label: 'ePOD',           page: 'epod' },
      { icon: '⏱️', label: 'Detention',      page: 'detention' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { icon: '💰', label: 'Earnings',        page: 'finance' },
      { icon: '📄', label: 'Invoices',        page: 'invoices' },
      { icon: '💳', label: 'Quick Pay',       page: 'factoring' },
      { icon: '📐', label: 'CPM Calculator',  page: 'cpm' },
      { icon: '➕', label: 'Extra Charges',   page: 'accessorial' },
      { icon: '⚠️', label: 'Claims',          page: 'claims' },
    ],
  },
  {
    title: 'TRUCK & SAFETY',
    items: [
      { icon: '⛽', label: 'Fuel Log',        page: 'fuel' },
      { icon: '🗺️', label: 'Fuel Optimizer', page: 'fuel-optimizer' },
      { icon: '🔧', label: 'Maintenance',     page: 'maintenance' },
      { icon: '🔍', label: 'DVIR Inspection', page: 'dvir' },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { icon: '📃', label: 'Contracts',      page: 'contracts' },
      { icon: '🤖', label: 'AI Assistant',    page: 'ai' },
      { icon: '📉', label: 'Market Rates',    page: 'rates' },
      { icon: '🌡️', label: 'Lane Heatmap',   page: 'lane-heatmap' },
      { icon: '📈', label: 'Reports',         page: 'reports' },
      { icon: '🗂️', label: 'IFTA Filing',    page: 'ifta' },
      { icon: '🔍', label: 'FMCSA Lookup',    page: 'fmcsa' },
      { icon: '🔗', label: 'Integrations',   page: 'integrations' },
      { icon: '⚙️', label: 'Settings',       page: 'settings' },
    ],
  },
]

// ── Company grouped navigation ────────────────────────────────────────────────
const COMPANY_SECTIONS: NavSection[] = [
  {
    title: 'HOME',
    items: [
      { icon: '🏠', label: 'Dashboard',       page: 'dashboard' },
      { icon: '🔔', label: 'Notifications',   page: 'notifications', badge: 3 },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { icon: '📋', label: 'Dispatch Board',  page: 'dispatch-board', badge: 1 },
      { icon: '📦', label: 'Loads',           page: 'loads' },
      { icon: '🚚', label: 'Orders (TMS)',    page: 'trips' },
      { icon: '📅', label: 'Load Calendar',   page: 'calendar' },
      { icon: '🔄', label: 'Dead Head Opt.',  page: 'deadhead' },
      { icon: '📡', label: 'Live Tracking',   page: 'tracking' },
    ],
  },
  {
    title: 'FLEET & DRIVERS',
    items: [
      { icon: '🚛', label: 'Fleet',           page: 'fleet',    badge: 3 },
      { icon: '👤', label: 'Drivers',         page: 'drivers' },
      { icon: '📲', label: 'ePOD',            page: 'epod' },
      { icon: '⏱️', label: 'Detention',       page: 'detention' },
      { icon: '🔍', label: 'DVIR Inspection', page: 'dvir' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { icon: '💰', label: 'Finance',         page: 'finance' },
      { icon: '📄', label: 'Invoices',        page: 'invoices' },
      { icon: '💳', label: 'Quick Pay',       page: 'factoring' },
      { icon: '💼', label: 'Payroll',         page: 'payroll' },
      { icon: '➕', label: 'Extra Charges',   page: 'accessorial' },
      { icon: '⚠️', label: 'Claims',          page: 'claims' },
    ],
  },
  {
    title: 'TOOLS & ADMIN',
    items: [
      { icon: '🤖', label: 'AI Assistant',     page: 'ai' },
      { icon: '📊', label: 'Analytics',        page: 'analytics' },
      { icon: '📈', label: 'Reports',          page: 'reports' },
      { icon: '🗂️', label: 'IFTA Filing',     page: 'ifta' },
      { icon: '📋', label: 'Compliance',       page: 'compliance' },
      { icon: '🛡️', label: 'Safety',          page: 'safety' },
      { icon: '⛽', label: 'Fuel Log',         page: 'fuel' },
      { icon: '🔧', label: 'Maintenance',      page: 'maintenance' },
      { icon: '🌡️', label: 'Lane Heatmap',    page: 'lane-heatmap' },
      { icon: '📉', label: 'Market Rates',     page: 'rates' },
      { icon: '📃', label: 'Contracts',        page: 'contracts' },
      { icon: '👥', label: 'Customers',        page: 'customers' },
      { icon: '🔍', label: 'FMCSA Lookup',     page: 'fmcsa' },
      { icon: '🔗', label: 'Integrations',     page: 'integrations' },
      { icon: '⚙️', label: 'Settings',         page: 'settings' },
    ],
  },
]

// ── Shipper grouped navigation ────────────────────────────────────────────────
const SHIPPER_SECTIONS: NavSection[] = [
  {
    title: 'HOME',
    items: [
      { icon: '🏠', label: 'Dashboard',     page: 'dashboard' },
      { icon: '🔔', label: 'Notifications', page: 'notifications' },
    ],
  },
  {
    title: 'FREIGHT',
    items: [
      { icon: '➕', label: 'Post Load',     page: 'post-load' },
      { icon: '📦', label: 'My Shipments',  page: 'shipments', badge: 4 },
      { icon: '📡', label: 'Track Orders',  page: 'tracking' },
      { icon: '🚛', label: 'Find Carrier',  page: 'marketplace' },
    ],
  },
  {
    title: 'FINANCE & TOOLS',
    items: [
      { icon: '💳', label: 'Billing',        page: 'finance' },
      { icon: '⚠️', label: 'Claims',         page: 'claims' },
      { icon: '🏅', label: 'Carrier Scores', page: 'carrier-scorecard' },
      { icon: '🤖', label: 'AI Assistant',   page: 'ai' },
      { icon: '⚙️', label: 'Settings',       page: 'settings' },
    ],
  },
]

// Legacy flat nav kept for type safety (not rendered directly anymore)
const NAV: Record<UserRole, NavItem[]> = {
  'owner-op':  OO_SECTIONS.flatMap(s => s.items),
  dispatcher:  DISPATCHER_SECTIONS.flatMap(s => s.items),
  company:     COMPANY_SECTIONS.flatMap(s => s.items),
  shipper:     SHIPPER_SECTIONS.flatMap(s => s.items),
}

const ROLE_SECTIONS: Record<UserRole, NavSection[]> = {
  'owner-op':  OO_SECTIONS,
  dispatcher:  DISPATCHER_SECTIONS,
  company:     COMPANY_SECTIONS,
  shipper:     SHIPPER_SECTIONS,
}

// Sections collapsed by default (secondary / advanced content)
const DEFAULT_COLLAPSED: Record<UserRole, string[]> = {
  'owner-op':  ['TRUCK & SAFETY', 'TOOLS'],
  dispatcher:  ['BROKER NETWORK', 'TOOLS'],
  company:     ['TOOLS & ADMIN'],
  shipper:     [],
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
  userId?: string
  onNavigate: (page: string) => void
  onLogout: () => void
  dispatcherIsNew?: boolean
}

export default function Sidebar({ role, activePage, userName, userId, onNavigate, onLogout, dispatcherIsNew }: Props) {
  const isDispatcher = role === 'dispatcher'
  const allSections = (isDispatcher && dispatcherIsNew) ? DISPATCHER_NEW_SECTIONS : ROLE_SECTIONS[role]
  const defaultCollapsed = (isDispatcher && dispatcherIsNew)
    ? ['LOCKED — UNLOCKS WITH FIRST CLIENT']
    : (DEFAULT_COLLAPSED[role] ?? [])
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(defaultCollapsed)
  )

  // Progressive modules — filter nav items to only enabled ones (or all for demo)
  const { isEnabled } = useModules(userId || `demo_${role}`, role)
  // When a real userId exists, filter; for demo mode show everything
  const filterItems = !!userId
  const sections = filterItems
    ? allSections
        .map(s => ({
          ...s,
          items: s.items.filter(item =>
            CORE_PAGES.has(item.page) || item.label.startsWith('🔒') || isEnabled(item.page)
          ),
        }))
        .filter(s => s.items.length > 0)
    : allSections

  function toggleSection(title: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(title)) { next.delete(title) } else { next.add(title) }
      return next
    })
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={isDispatcher ? { borderBottom: '1px solid rgba(139,92,246,.3)' } : undefined}>
        {isDispatcher ? (
          <>
            <div className="sidebar-logo-text" style={{ color: '#A78BFA' }}>🧭 Dispatch Suite</div>
            <div className="sidebar-logo-sub" style={{ color: 'rgba(167,139,250,.7)' }}>by DispaLoadIQ</div>
          </>
        ) : (
          <>
            <div className="sidebar-logo-text">🚛 DispaLoadIQ</div>
            <div className="sidebar-logo-sub">AI-Powered Platform</div>
          </>
        )}
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 20px 4px' }}>
        <div style={{
          background: isDispatcher ? 'rgba(139,92,246,.18)' : 'rgba(75,174,212,.15)',
          borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
          border: isDispatcher ? '1px solid rgba(139,92,246,.25)' : 'none',
        }}>
          <span style={{ fontSize: 18 }}>{ROLE_ICONS[role]}</span>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 1 }}>
              {isDispatcher ? 'Dispatcher' : 'Role'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isDispatcher ? '#C4B5FD' : '#fff' }}>
              {userName || ROLE_LABELS[role]}
            </div>
          </div>
          {isDispatcher && (
            <div style={{
              marginLeft: 'auto', background: '#22C55E', borderRadius: 99,
              padding: '2px 7px', fontSize: 9, fontWeight: 700, color: '#fff',
            }}>
              🟢 Online
            </div>
          )}
        </div>
      </div>

      {/* Navigation — sectioned for all roles */}
      <div style={{ flex: 1, overflowY: 'auto', marginTop: 8 }}>
        {sections.map(section => {
          const collapsed = collapsedSections.has(section.title)
          const hasActive = section.items.some(i => i.page === activePage)
          const accentColor = isDispatcher ? '#A78BFA' : '#4BAED4'
          const activeBg    = isDispatcher ? 'rgba(139,92,246,.15)' : 'rgba(75,174,212,.12)'
          const activeBorder = isDispatcher ? '#8B5CF6' : '#4BAED4'
          return (
            <div key={section.title} className="sidebar-section">
              <button
                onClick={() => toggleSection(section.title)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 20px 4px', margin: 0,
                }}
              >
                <div className="sidebar-section-label" style={{ margin: 0, color: hasActive ? accentColor : undefined }}>
                  {section.title}
                </div>
                <span style={{
                  fontSize: 9, color: 'rgba(255,255,255,.25)',
                  transition: 'transform .2s',
                  transform: collapsed ? 'rotate(-90deg)' : 'none',
                }}>▼</span>
              </button>
              {!collapsed && section.items.map(item => {
                const isLocked = item.label.startsWith('🔒')
                return (
                  <button
                    key={item.page}
                    className={`sidebar-item ${!isLocked && activePage === item.page ? 'active' : ''}`}
                    onClick={isLocked ? undefined : () => onNavigate(item.page)}
                    style={{
                      ...((!isLocked && activePage === item.page) ? { borderLeft: `3px solid ${activeBorder}`, background: activeBg } : undefined),
                      ...(isLocked ? { opacity: 0.4, cursor: 'not-allowed' } : undefined),
                    }}
                  >
                    <span className="icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{isLocked ? item.label.replace('🔒 ', '🔒 ') : item.label}</span>
                    {item.badge && !isLocked && <span className="badge-dot" style={isDispatcher ? { background: '#8B5CF6' } : undefined}>{item.badge}</span>}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Add Modules button */}
      <button
        onClick={() => onNavigate('modules')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 20px',
          background: 'none', border: 'none', cursor: 'pointer',
          borderTop: '1px solid rgba(255,255,255,.07)',
          color: isDispatcher ? 'rgba(167,139,250,.7)' : 'rgba(75,174,212,.7)',
          fontSize: 12, fontWeight: 700,
          transition: 'color .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = isDispatcher ? '#A78BFA' : '#4BAED4')}
        onMouseLeave={e => (e.currentTarget.style.color = isDispatcher ? 'rgba(167,139,250,.7)' : 'rgba(75,174,212,.7)')}
      >
        <span style={{ fontSize: 15 }}>＋</span>
        <span>Add Modules</span>
      </button>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Dispatcher upgrade banner */}
        {role === 'dispatcher' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,.9), rgba(109,40,217,.9))',
            borderRadius: 10, padding: '12px 14px', marginBottom: 10,
            border: '1px solid rgba(167,139,250,.3)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              ⚡ Dispatch Pro
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', marginBottom: 8 }}>
              AI negotiation · unlimited clients
            </div>
            <button style={{
              width: '100%', background: '#fff', color: '#7C3AED',
              border: 'none', borderRadius: 7, padding: '6px', fontSize: 11,
              fontWeight: 700, cursor: 'pointer',
            }}>
              $49/mo → Upgrade
            </button>
          </div>
        )}

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
