import { useState, useRef, useEffect } from 'react'
import type { UserRole } from '../types'

const PAGE_TITLES: Record<string, string> = {
  dashboard:             'Dashboard',
  loads:                 'Load Board',
  marketplace:           'Dispatcher Marketplace',
  route:                 'Route Planner',
  tracking:              'Live Tracking',
  finance:               'Finance & Earnings',
  docs:                  'Documents',
  settings:              'Settings',
  clients:               'My Clients',
  'post-load':           'Post New Load',
  shipments:             'My Shipments',
  fleet:                 'Fleet Management',
  drivers:               'Drivers',
  analytics:             'Analytics',
  compliance:            'Compliance',
  profile:               'My Profile',
  maintenance:           'Maintenance',
  invoices:              'Invoices',
  payroll:               'Payroll',
  'dispatch-board':      'Dispatch Board',
  fuel:                  'Fuel Log',
  reports:               'Reports',
  safety:                'Safety & Incidents',
  'my-dispatcher':       'My Dispatcher',
  'dispatcher-profile':  'My Profile Hub',
  contracts:             'Contracts',
  chat:                  'Messages & Notifications',
  ai:                    'AI Assistant',
  rates:                 'Market Rates',
  trips:                 'Trip Management (TMS)',
  'broker-crm':          'Broker CRM',
  customers:             'Customer Management',
  factoring:             'Quick Pay & Factoring',
  detention:             'Detention Timer',
  fmcsa:                 'FMCSA Lookup',
  integrations:          'Integration Hub',
  'driver-recruitment':  'Driver Recruitment',
  notifications:         'Notification Center',
  'public-tracker':      'Public Load Tracker',
  onboarding:            'Onboarding',
}

const ROLE_COLORS: Record<UserRole, string> = {
  'owner-op':  '#4BAED4',
  dispatcher:  '#8B5CF6',
  company:     '#059669',
  shipper:     '#D97706',
}

// ── Role-specific notifications ───────────────────────────────────────────────
const NOTIFS: Record<UserRole, { icon: string; text: string; sub: string; time: string; type: 'info'|'success'|'warning'|'urgent'; page?: string }[]> = {
  'owner-op': [
    { icon: '🧭', text: 'Alex Petrov принял ваш запрос на найм',       sub: 'Договор ожидает подписи',          time: '2 мин',   type: 'success',  page: 'contracts' },
    { icon: '📦', text: 'Новый груз: Chicago → Dallas · $1,854',       sub: 'AI Score 98% · Dry Van · 850 mi',  time: '8 мин',   type: 'info',     page: 'loads' },
    { icon: '💰', text: 'Invoice #1042 оплачен — $1,690',              sub: 'Echo Global Logistics',            time: '1 ч',     type: 'success',  page: 'invoices' },
    { icon: '⚠️', text: 'RPM ниже гарантии на этой неделе',            sub: '$2.38 vs $2.55 гарантии',          time: '3 ч',     type: 'warning',  page: 'my-dispatcher' },
    { icon: '🔧', text: 'Плановое ТО через 800 миль',                  sub: 'Truck IL-4829-XR',                 time: '1 д',     type: 'warning',  page: 'maintenance' },
  ],
  dispatcher: [
    { icon: '📥', text: 'Новый запрос: Marcus Johnson · 2 Dry Van',    sub: 'RPM offer $2.65 · TX–CA лейны',    time: '2 мин',   type: 'urgent',   page: 'dispatcher-profile' },
    { icon: '📥', text: 'Новый запрос: Elena Vasquez · 1 Reefer',      sub: 'RPM offer $2.80 · Midwest',        time: '5 мин',   type: 'urgent',   page: 'dispatcher-profile' },
    { icon: '✅', text: 'Рейс сдан: Tom Bradley CHI→DAL',              sub: '$2,786 · $2.32/mi',                time: '45 мин',  type: 'success',  page: 'clients' },
    { icon: '💰', text: 'Начислена комиссия $222.88',                  sub: '8% от $2,786 · Mike Rodriguez',   time: '2 ч',     type: 'success',  page: 'finance' },
    { icon: '📋', text: 'Контракт с Park Logistics на подписании',     sub: 'Ожидает подписи владельца',        time: '1 д',     type: 'info',     page: 'contracts' },
  ],
  company: [
    { icon: '🔴', text: 'Truck NY 5541-ZZ всё ещё в ремонте',          sub: 'День 3 · ETA выхода неизвестен',   time: '10 мин',  type: 'urgent',   page: 'maintenance' },
    { icon: '👤', text: 'Tom Bradley отметил HOS 10h отдых',           sub: 'Следующий рейс доступен в 18:00',  time: '30 мин',  type: 'info',     page: 'drivers' },
    { icon: '📦', text: '3 загрузки ждут назначения',                  sub: 'Dispatch Board · High priority',   time: '1 ч',     type: 'warning',  page: 'dispatch-board' },
    { icon: '💼', text: 'Расчёт зарплат готов к выплате',              sub: '4 водителя · $12,480 total',       time: '2 ч',     type: 'info',     page: 'payroll' },
    { icon: '📋', text: 'IFTA Q2 deadline через 12 дней',              sub: 'Не забудьте подать отчёт',         time: '1 д',     type: 'warning',  page: 'fuel' },
  ],
  shipper: [
    { icon: '🚛', text: 'Груз SHP-1041 в пути',                        sub: 'Chicago → Dallas · ETA Apr 23',    time: '5 мин',   type: 'info',     page: 'tracking' },
    { icon: '🎯', text: '7 предложений на POST-101',                    sub: 'Houston → Phoenix · лучшее $2,680', time: '20 мин', type: 'success',  page: 'shipments' },
    { icon: '✅', text: 'Доставка подтверждена: SHP-1040',              sub: 'Miami → Atlanta · оценить?',       time: '2 ч',     type: 'success',  page: 'shipments' },
    { icon: '💳', text: 'Invoice на $890 — оплата до May 10',          sub: 'Carrier: Anna Perez',              time: '1 д',     type: 'warning',  page: 'finance' },
  ],
}

const TYPE_COLORS = {
  info:    { bg: '#EBF8FF', border: '#4BAED4', dot: '#4BAED4' },
  success: { bg: '#F0FFF4', border: '#68D391', dot: '#48BB78' },
  warning: { bg: '#FFFFF0', border: '#ECC94B', dot: '#D69E2E' },
  urgent:  { bg: '#FFF5F5', border: '#FC8181', dot: '#E53E3E' },
}

interface Props {
  activePage: string
  role: UserRole
  userName: string
  notifCount?: number
  onNavigate?: (page: string) => void
  onNotifClick?: () => void
}

export default function Header({ activePage, role, userName, onNavigate }: Props) {
  const greeting = new Date().getHours() < 12 ? 'Доброе утро' : new Date().getHours() < 17 ? 'Добрый день' : 'Добрый вечер'
  const [showNotifs, setShowNotifs] = useState(false)
  const [readIds, setReadIds] = useState<Set<number>>(new Set())
  const dropRef = useRef<HTMLDivElement>(null)

  const notifs = NOTIFS[role]
  const unreadCount = notifs.length - readIds.size

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markAllRead() {
    setReadIds(new Set(notifs.map((_, i) => i)))
  }

  function handleNotifClick(i: number, page?: string) {
    setReadIds(prev => new Set([...prev, i]))
    if (page) onNavigate?.(page)
    setShowNotifs(false)
  }

  return (
    <header className="header">
      {/* Page title */}
      <div style={{ marginRight: 'auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2D3748', lineHeight: 1 }}>
          {PAGE_TITLES[activePage] ?? activePage}
        </h2>
        <p style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>
          {greeting}, {userName.split(' ')[0]} 👋
        </p>
      </div>

      {/* Search */}
      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input placeholder="Поиск грузов, диспетчеров, клиентов..." />
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Quick Add */}
        <button className="btn btn-primary btn-sm" style={{ gap: 4 }}
          onClick={() => {
            if (role === 'owner-op')   onNavigate?.('loads')
            if (role === 'dispatcher') onNavigate?.('loads')
            if (role === 'company')    onNavigate?.('fleet')
            if (role === 'shipper')    onNavigate?.('post-load')
          }}>
          <span>+</span>
          {role === 'owner-op'   && 'Найти груз'}
          {role === 'dispatcher' && 'Найти груз'}
          {role === 'company'    && 'Добавить трак'}
          {role === 'shipper'    && 'Разместить груз'}
        </button>

        {/* Notifications bell + dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifs(v => !v)}
            style={{ background: showNotifs ? '#EBF8FF' : undefined }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 380, background: '#fff',
              borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.14)',
              border: '1.5px solid #E2E8F0', zIndex: 500,
              overflow: 'hidden',
            }}>
              {/* Dropdown header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 18px', borderBottom: '1px solid #E2E8F0',
                background: '#F7FAFC',
              }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>
                  🔔 Уведомления
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: 8, background: '#E53E3E', color: '#fff',
                      borderRadius: '50%', width: 20, height: 20,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                    }}>{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{
                    fontSize: 12, color: '#4BAED4', background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 600,
                  }}>Прочитать все</button>
                )}
              </div>

              {/* Notification list */}
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifs.map((n, i) => {
                  const isRead = readIds.has(i)
                  const colors = TYPE_COLORS[n.type]
                  return (
                    <div
                      key={i}
                      onClick={() => handleNotifClick(i, n.page)}
                      style={{
                        display: 'flex', gap: 12, padding: '12px 18px',
                        borderBottom: '1px solid #F0F4F8',
                        background: isRead ? '#fff' : colors.bg,
                        cursor: 'pointer',
                        transition: 'background .15s',
                      }}
                    >
                      {/* Unread dot */}
                      <div style={{ paddingTop: 4, flexShrink: 0 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: isRead ? 'transparent' : colors.dot,
                          border: isRead ? '1.5px solid #E2E8F0' : 'none',
                        }} />
                      </div>
                      {/* Icon */}
                      <div style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</div>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: isRead ? 500 : 700,
                          color: '#1A2535', marginBottom: 2,
                        }}>{n.text}</div>
                        <div style={{ fontSize: 11, color: '#718096', marginBottom: 3 }}>{n.sub}</div>
                        <div style={{ fontSize: 10, color: '#A0AEC0' }}>{n.time} назад</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 18px', borderTop: '1px solid #E2E8F0',
                background: '#F7FAFC', textAlign: 'center',
              }}>
                <button onClick={() => { onNavigate?.('chat'); setShowNotifs(false) }} style={{
                  fontSize: 13, color: '#4BAED4', background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600,
                }}>Открыть все сообщения →</button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div
          onClick={() => onNavigate?.(role === 'dispatcher' ? 'dispatcher-profile' : 'settings')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: ROLE_COLORS[role],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: '#fff', cursor: 'pointer',
            flexShrink: 0,
          }}
          title={role === 'dispatcher' ? 'My Profile Hub' : 'Settings'}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
