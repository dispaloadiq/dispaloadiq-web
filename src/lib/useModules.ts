import { useState, useCallback } from 'react'
import type { UserRole } from '../types'

// ── Pages that are always visible — cannot be disabled ────────────────────────
export const CORE_PAGES = new Set(['dashboard', 'settings', 'notifications'])

// ── Default enabled pages for a brand new user ───────────────────────────────
export const DEFAULT_MODULES: Record<UserRole, string[]> = {
  'owner-op': [
    'dashboard', 'notifications',
    'loads',       // find loads is the core action
    'tracking',    // know where you are
    'finance',     // see earnings
    'settings',
  ],
  dispatcher: [
    'dashboard', 'notifications',
    'marketplace',        // browse clients
    'opportunities',      // incoming requests
    'dispatcher-profile', // set up your profile
    'settings',
  ],
  company: [
    'dashboard', 'notifications',
    'fleet',           // see your trucks
    'drivers',         // see your drivers
    'loads',           // dispatch loads
    'dispatch-board',  // kanban view
    'settings',
  ],
  shipper: [
    'dashboard', 'notifications',
    'post-load',  // post freight
    'shipments',  // track orders
    'settings',
  ],
}

// ── Full catalog of ALL available modules per role ────────────────────────────
export interface ModuleDef {
  page:     string
  icon:     string
  label:    string
  category: string
  desc:     string
}

export const ALL_MODULES: Record<UserRole, ModuleDef[]> = {
  'owner-op': [
    // LOADS
    { page: 'loads',         icon: '📦', label: 'Load Board',       category: 'Loads',       desc: 'Find and book freight loads' },
    { page: 'calendar',      icon: '📅', label: 'Load Calendar',    category: 'Loads',       desc: 'Calendar view of scheduled loads' },
    { page: 'find-dispatcher', icon: '🧭', label: 'Find Dispatcher', category: 'Loads',       desc: 'Hire a remote dispatcher' },
    { page: 'my-dispatcher', icon: '🤝', label: 'My Dispatcher',    category: 'Loads',       desc: 'Manage your dispatcher relationship' },
    { page: 'route',         icon: '🗺️', label: 'Route Planner',   category: 'Loads',       desc: 'Plan routes with HOS and fuel stops' },
    { page: 'deadhead',      icon: '🔄', label: 'Dead Head Opt.',   category: 'Loads',       desc: 'Minimize empty miles' },
    { page: 'rates',         icon: '📉', label: 'Market Rates',     category: 'Loads',       desc: 'Real-time rate intelligence' },
    // TRIPS & TRACKING
    { page: 'tracking',      icon: '📡', label: 'Live Tracking',    category: 'Trips',       desc: 'Real-time GPS tracking' },
    { page: 'trips',         icon: '🚚', label: 'My Trips (TMS)',   category: 'Trips',       desc: 'Trip management system' },
    { page: 'epod',          icon: '📲', label: 'ePOD',             category: 'Trips',       desc: 'Electronic proof of delivery' },
    { page: 'detention',     icon: '⏱️', label: 'Detention Timer',  category: 'Trips',       desc: 'Track detention time and charges' },
    // FINANCE
    { page: 'finance',       icon: '💰', label: 'Earnings',         category: 'Finance',     desc: 'Revenue and earnings overview' },
    { page: 'invoices',      icon: '📄', label: 'Invoices',         category: 'Finance',     desc: 'Invoice management' },
    { page: 'factoring',     icon: '💳', label: 'Quick Pay',        category: 'Finance',     desc: 'Invoice factoring and quick pay' },
    { page: 'cpm',           icon: '📐', label: 'CPM Calculator',   category: 'Finance',     desc: 'Cost per mile calculator' },
    { page: 'accessorial',   icon: '➕', label: 'Extra Charges',    category: 'Finance',     desc: 'Accessorial and detention billing' },
    { page: 'claims',        icon: '⚠️', label: 'Claims',           category: 'Finance',     desc: 'Damage and cargo claims' },
    { page: 'ifta',          icon: '🗂️', label: 'IFTA Filing',     category: 'Finance',     desc: 'IFTA fuel tax reports' },
    // TRUCK
    { page: 'fuel',          icon: '⛽', label: 'Fuel Log',         category: 'Truck',       desc: 'Track fuel purchases' },
    { page: 'fuel-optimizer', icon: '🗺️', label: 'Fuel Optimizer', category: 'Truck',       desc: 'Find cheapest diesel on route' },
    { page: 'maintenance',   icon: '🔧', label: 'Maintenance',      category: 'Truck',       desc: 'Maintenance schedules and logs' },
    { page: 'dvir',          icon: '🔍', label: 'DVIR Inspection',  category: 'Truck',       desc: 'Daily vehicle inspection reports' },
    // TOOLS
    { page: 'contracts',     icon: '📃', label: 'Contracts',        category: 'Tools',       desc: 'Contract management' },
    { page: 'docs',          icon: '📂', label: 'Documents',        category: 'Tools',       desc: 'Document storage and management' },
    { page: 'ai',            icon: '🤖', label: 'AI Assistant',     category: 'Tools',       desc: 'AI-powered dispatching assistant' },
    { page: 'broker-trust',  icon: '🛡️', label: 'Broker Trust',    category: 'Tools',       desc: 'Broker reputation network' },
    { page: 'lane-heatmap',  icon: '🌡️', label: 'Lane Heatmap',    category: 'Tools',       desc: 'Lane profitability heatmap' },
    { page: 'reports',       icon: '📈', label: 'Reports',          category: 'Tools',       desc: 'Business reports and analytics' },
    { page: 'fmcsa',         icon: '🔍', label: 'FMCSA Lookup',     category: 'Tools',       desc: 'Carrier and authority lookup' },
    { page: 'integrations',  icon: '🔗', label: 'Integrations',     category: 'Tools',       desc: 'Connect ELD, TMS, accounting tools' },
    { page: 'compliance',    icon: '📋', label: 'Compliance',       category: 'Tools',       desc: 'Hours of service and compliance' },
    { page: 'safety',        icon: '🛡️', label: 'Safety',          category: 'Tools',       desc: 'Incident reports and safety scores' },
    { page: 'dispatcher-scorecard', icon: '📊', label: 'Dispatcher Score', category: 'Tools', desc: 'Rate and compare dispatchers' },
  ],

  dispatcher: [
    // COMMAND CENTER
    { page: 'workspace',     icon: '⚡', label: 'Workspace',        category: 'Command',     desc: 'Unified daily workflow hub' },
    // MY CLIENTS
    { page: 'clients',       icon: '🚛', label: 'My Clients',       category: 'Clients',     desc: 'Manage your owner-op clients' },
    { page: 'marketplace',   icon: '👥', label: 'Marketplace',      category: 'Clients',     desc: 'Browse the dispatcher exchange' },
    { page: 'opportunities', icon: '🎯', label: 'Opportunities',    category: 'Clients',     desc: 'Incoming hire requests' },
    { page: 'dispatcher-profile', icon: '⭐', label: 'My Profile',  category: 'Clients',     desc: 'Your dispatcher profile' },
    { page: 'public-profile', icon: '🏅', label: 'Public Profile', category: 'Clients',     desc: 'Public-facing dispatcher profile' },
    { page: 'verification',  icon: '🛡️', label: 'Verification',   category: 'Clients',     desc: 'Get verified dispatcher badge' },
    { page: 'academy',       icon: '🎓', label: 'Academy',          category: 'Clients',     desc: 'Dispatcher training and courses' },
    { page: 'skills-test',   icon: '📋', label: 'Skills Test',      category: 'Clients',     desc: '30-question dispatcher assessment' },
    { page: 'contracts',     icon: '📃', label: 'Contracts',        category: 'Clients',     desc: 'Client contract management' },
    { page: 'smart-contract', icon: '✍️', label: 'Smart Contract', category: 'Clients',     desc: 'Auto-generated contract builder' },
    // AI & DEALS
    { page: 'proactive-dispatch', icon: '⏰', label: 'Proactive Dispatch', category: 'AI & Deals', desc: 'ETA alerts and pre-loaded backhauls' },
    { page: 'emergency-load', icon: '🚨', label: 'Emergency Load', category: 'AI & Deals',  desc: 'Find loads for empty drivers fast' },
    { page: 'ai-match',      icon: '🤖', label: 'AI Load Match',   category: 'AI & Deals',  desc: 'AI matches loads to your clients' },
    { page: 'rc-analyzer',   icon: '📄', label: 'RC Analyzer',     category: 'AI & Deals',  desc: 'Analyze rate confirmations' },
    { page: 'backhaul-finder', icon: '↩️', label: 'Backhaul Finder', category: 'AI & Deals', desc: 'Smart round-trip load planning' },
    // DOCUMENTS & RATES
    { page: 'doc-flow',      icon: '🗂️', label: 'Doc Flow',        category: 'Documents',   desc: 'RC→BOL→POD→Invoice pipeline' },
    { page: 'rate-intel',    icon: '📊', label: 'Rate Intel',       category: 'Documents',   desc: 'Lane rate vs market intelligence' },
    { page: 'deal-tracker',  icon: '📊', label: 'Deal Tracker',     category: 'Documents',   desc: 'CRM pipeline for load deals' },
    { page: 'driver-comms',  icon: '💬', label: 'Driver Comms',     category: 'Documents',   desc: 'Direct communication with drivers' },
    { page: 'dispatcher-pnl', icon: '📈', label: 'My P&L',         category: 'Documents',   desc: 'Dispatcher profit & loss analytics' },
    { page: 'load-negotiation', icon: '🤝', label: 'Negotiations', category: 'Documents',   desc: 'Track load negotiation status' },
    // OPERATIONS
    { page: 'loads',         icon: '📦', label: 'Active Loads',     category: 'Operations',  desc: 'Manage all active loads' },
    { page: 'load-status',   icon: '📡', label: 'Load Status',      category: 'Operations',  desc: 'Real-time load status protocol' },
    { page: 'dispatch-board', icon: '📋', label: 'Dispatch Board', category: 'Operations',  desc: 'Visual Kanban dispatch board' },
    { page: 'calendar',      icon: '📅', label: 'Load Calendar',    category: 'Operations',  desc: 'Calendar view of all loads' },
    { page: 'deadhead',      icon: '🔄', label: 'Dead Head Opt.',   category: 'Operations',  desc: 'Minimize empty miles for clients' },
    { page: 'epod',          icon: '📲', label: 'ePOD',             category: 'Operations',  desc: 'Electronic proof of delivery' },
    { page: 'detention',     icon: '⏱️', label: 'Detention Timer',  category: 'Operations',  desc: 'Track detention charges' },
    // FINANCE
    { page: 'finance',       icon: '💰', label: 'My Earnings',      category: 'Finance',     desc: 'Revenue and commission overview' },
    { page: 'quick-pay',     icon: '⚡', label: 'Quick Pay',        category: 'Finance',     desc: 'Invoice factoring for clients' },
    { page: 'payout-tracker', icon: '💸', label: 'Payout Tracker', category: 'Finance',     desc: 'Track client payments and payouts' },
    { page: 'invoices',      icon: '📄', label: 'Invoices',         category: 'Finance',     desc: 'Invoice management' },
    { page: 'accessorial',   icon: '➕', label: 'Extra Charges',    category: 'Finance',     desc: 'Accessorial and detention billing' },
    { page: 'claims',        icon: '⚠️', label: 'Claims',           category: 'Finance',     desc: 'Damage and cargo claims' },
    // BROKER NETWORK
    { page: 'broker-trust',  icon: '🛡️', label: 'Broker Trust',    category: 'Brokers',     desc: 'Community broker reputation network' },
    { page: 'broker-crm',    icon: '🤝', label: 'Broker CRM',       category: 'Brokers',     desc: 'Manage broker relationships' },
    { page: 'rates',         icon: '📉', label: 'Market Rates',     category: 'Brokers',     desc: 'Real-time lane rate intelligence' },
    { page: 'lane-heatmap',  icon: '🌡️', label: 'Lane Heatmap',    category: 'Brokers',     desc: 'Lane profitability heatmap' },
    { page: 'carrier-scorecard', icon: '🏅', label: 'Carrier Scores', category: 'Brokers', desc: 'Rate and compare carriers' },
    // GROWTH
    { page: 'earnings-calculator', icon: '🧮', label: 'Earnings Calc', category: 'Growth', desc: 'Estimate earnings before accepting a load' },
    { page: 'referral',      icon: '🎁', label: 'Referral Program',  category: 'Growth',     desc: 'Earn rewards for referrals' },
    { page: 'dispatcher-scorecard', icon: '📊', label: 'Scorecard', category: 'Growth',     desc: 'Your performance scorecard' },
    // TOOLS
    { page: 'ai',            icon: '🤖', label: 'AI Assistant',     category: 'Tools',       desc: 'AI-powered dispatching assistant' },
    { page: 'fmcsa',         icon: '🔍', label: 'FMCSA Lookup',     category: 'Tools',       desc: 'Carrier and authority lookup' },
    { page: 'integrations',  icon: '🔗', label: 'Integrations',     category: 'Tools',       desc: 'Connect ELD, TMS, accounting tools' },
    { page: 'analytics',     icon: '📊', label: 'Analytics',        category: 'Tools',       desc: 'Business analytics dashboard' },
    { page: 'chat',          icon: '💬', label: 'Chat',             category: 'Tools',       desc: 'In-platform messaging' },
  ],

  company: [
    // OPERATIONS
    { page: 'dispatch-board', icon: '📋', label: 'Dispatch Board', category: 'Operations',  desc: 'Visual Kanban dispatch board' },
    { page: 'loads',         icon: '📦', label: 'Loads',            category: 'Operations',  desc: 'Manage loads and bookings' },
    { page: 'trips',         icon: '🚚', label: 'Orders (TMS)',     category: 'Operations',  desc: 'Trip management system' },
    { page: 'calendar',      icon: '📅', label: 'Load Calendar',    category: 'Operations',  desc: 'Calendar view of all loads' },
    { page: 'deadhead',      icon: '🔄', label: 'Dead Head Opt.',   category: 'Operations',  desc: 'Minimize empty miles' },
    { page: 'tracking',      icon: '📡', label: 'Live Tracking',    category: 'Operations',  desc: 'Real-time fleet GPS tracking' },
    // FLEET
    { page: 'fleet',         icon: '🚛', label: 'Fleet',            category: 'Fleet',       desc: 'Fleet management and utilization' },
    { page: 'drivers',       icon: '👤', label: 'Drivers',          category: 'Fleet',       desc: 'Driver management and performance' },
    { page: 'epod',          icon: '📲', label: 'ePOD',             category: 'Fleet',       desc: 'Electronic proof of delivery' },
    { page: 'detention',     icon: '⏱️', label: 'Detention',        category: 'Fleet',       desc: 'Track detention charges' },
    { page: 'dvir',          icon: '🔍', label: 'DVIR Inspection',  category: 'Fleet',       desc: 'Daily vehicle inspection reports' },
    { page: 'driver-recruitment', icon: '🧑‍💼', label: 'Hire Drivers', category: 'Fleet', desc: 'Driver recruitment board' },
    // FINANCE
    { page: 'finance',       icon: '💰', label: 'Finance',          category: 'Finance',     desc: 'Revenue and profitability overview' },
    { page: 'invoices',      icon: '📄', label: 'Invoices',         category: 'Finance',     desc: 'Invoice management' },
    { page: 'factoring',     icon: '💳', label: 'Quick Pay',        category: 'Finance',     desc: 'Invoice factoring' },
    { page: 'payroll',       icon: '💼', label: 'Payroll',          category: 'Finance',     desc: 'Driver settlements and payroll' },
    { page: 'accessorial',   icon: '➕', label: 'Extra Charges',    category: 'Finance',     desc: 'Accessorial and detention billing' },
    { page: 'claims',        icon: '⚠️', label: 'Claims',           category: 'Finance',     desc: 'Damage and cargo claims' },
    { page: 'ifta',          icon: '🗂️', label: 'IFTA Filing',     category: 'Finance',     desc: 'IFTA fuel tax reports' },
    // TOOLS
    { page: 'ai',            icon: '🤖', label: 'AI Assistant',     category: 'Tools',       desc: 'AI-powered dispatching assistant' },
    { page: 'analytics',     icon: '📊', label: 'Analytics',        category: 'Tools',       desc: 'Business analytics dashboard' },
    { page: 'reports',       icon: '📈', label: 'Reports',          category: 'Tools',       desc: 'Business reports' },
    { page: 'compliance',    icon: '📋', label: 'Compliance',       category: 'Tools',       desc: 'HOS and compliance management' },
    { page: 'safety',        icon: '🛡️', label: 'Safety',          category: 'Tools',       desc: 'Incident reports and safety scores' },
    { page: 'fuel',          icon: '⛽', label: 'Fuel Log',         category: 'Tools',       desc: 'Track fuel purchases' },
    { page: 'maintenance',   icon: '🔧', label: 'Maintenance',      category: 'Tools',       desc: 'Maintenance schedules and logs' },
    { page: 'lane-heatmap',  icon: '🌡️', label: 'Lane Heatmap',    category: 'Tools',       desc: 'Lane profitability heatmap' },
    { page: 'rates',         icon: '📉', label: 'Market Rates',     category: 'Tools',       desc: 'Real-time lane rate intelligence' },
    { page: 'contracts',     icon: '📃', label: 'Contracts',        category: 'Tools',       desc: 'Contract management' },
    { page: 'customers',     icon: '👥', label: 'Customers',        category: 'Tools',       desc: 'Customer relationship management' },
    { page: 'fmcsa',         icon: '🔍', label: 'FMCSA Lookup',     category: 'Tools',       desc: 'Carrier and authority lookup' },
    { page: 'integrations',  icon: '🔗', label: 'Integrations',     category: 'Tools',       desc: 'Connect ELD, TMS, accounting tools' },
  ],

  shipper: [
    { page: 'post-load',     icon: '➕', label: 'Post Load',        category: 'Freight',     desc: 'Post a new load for carriers' },
    { page: 'shipments',     icon: '📦', label: 'My Shipments',     category: 'Freight',     desc: 'Track all your shipments' },
    { page: 'tracking',      icon: '📡', label: 'Track Orders',     category: 'Freight',     desc: 'Real-time order tracking' },
    { page: 'marketplace',   icon: '🚛', label: 'Find Carrier',     category: 'Freight',     desc: 'Browse the carrier marketplace' },
    { page: 'finance',       icon: '💳', label: 'Billing',          category: 'Finance',     desc: 'Payment and billing overview' },
    { page: 'claims',        icon: '⚠️', label: 'Claims',           category: 'Finance',     desc: 'Damage and cargo claims' },
    { page: 'carrier-scorecard', icon: '🏅', label: 'Carrier Scores', category: 'Tools',   desc: 'Rate and compare carriers' },
    { page: 'ai',            icon: '🤖', label: 'AI Assistant',     category: 'Tools',       desc: 'AI shipping assistant' },
    { page: 'docs',          icon: '📂', label: 'Documents',        category: 'Tools',       desc: 'Shipping documents' },
    { page: 'analytics',     icon: '📊', label: 'Analytics',        category: 'Tools',       desc: 'Freight spend analytics' },
    { page: 'integrations',  icon: '🔗', label: 'Integrations',     category: 'Tools',       desc: 'Connect WMS and ERP systems' },
  ],
}

// ── The hook ──────────────────────────────────────────────────────────────────
function storageKey(userId: string, role: UserRole) {
  return `dliq_modules_${userId || `demo_${role}`}`
}

export function useModules(userId: string, role: UserRole) {
  const key = storageKey(userId, role)

  const getInitial = (): string[] => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : DEFAULT_MODULES[role]
    } catch {
      return DEFAULT_MODULES[role]
    }
  }

  const [enabled, setEnabled] = useState<string[]>(getInitial)

  const toggle = useCallback((page: string) => {
    if (CORE_PAGES.has(page)) return // can't disable core pages
    setEnabled(prev => {
      const next = prev.includes(page)
        ? prev.filter(p => p !== page)
        : [...prev, page]
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])

  const isEnabled = useCallback(
    (page: string) => CORE_PAGES.has(page) || enabled.includes(page),
    [enabled]
  )

  const enableAll = useCallback(() => {
    const all = ALL_MODULES[role].map(m => m.page)
    const next = [...new Set([...DEFAULT_MODULES[role], ...all])]
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
    setEnabled(next)
  }, [key, role])

  const resetToDefault = useCallback(() => {
    const defaults = DEFAULT_MODULES[role]
    try { localStorage.setItem(key, JSON.stringify(defaults)) } catch {}
    setEnabled(defaults)
  }, [key, role])

  return { enabled, toggle, isEnabled, enableAll, resetToDefault }
}
