import { useState, useEffect, CSSProperties } from 'react'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C_PRIMARY = '#4BAED4'
const C_DARK = '#1A2535'
const C_BG = '#F0F4F8'
const C_CARD = '#FFFFFF'
const C_BORDER = '#DDE3EC'
const C_TEXT = '#1A2535'
const C_MUTED = '#6B7A99'
const C_SUCCESS = '#22C55E'
const C_WARN = '#F59E0B'
const C_ERR = '#EF4444'
const C_GREEN_BG = '#DCFCE7'
const C_RED_BG = '#FEE2E2'
const C_YELLOW_BG = '#FEF9C3'

// ── Types ─────────────────────────────────────────────────────────────────────
type Category =
  | 'all'
  | 'load_boards'
  | 'eld'
  | 'accounting'
  | 'factoring'
  | 'compliance'
  | 'fuel'
  | 'api'

type IntegStatus = 'connected' | 'disconnected' | 'active'

interface ActivityEntry {
  ts: string
  msg: string
  ok: 'ok' | 'warn' | 'err'
}

interface Integration {
  id: string
  name: string
  emoji: string
  category: Category
  status: IntegStatus
  tagline: string
  price?: string
  lastSync?: string
  stat1Label?: string
  stat1Val?: string
  stat2Label?: string
  stat2Val?: string
  apiKeyLabel?: string
  oauthLabel?: string
  webhookCount?: number
  apiCallsPerDay?: number
  dailyCalls?: number[] // 7 values for chart
  activity: ActivityEntry[]
}

// ── Data ──────────────────────────────────────────────────────────────────────
const INTEGRATIONS: Integration[] = [
  // Load Boards
  {
    id: 'dat',
    name: 'DAT One',
    emoji: '📦',
    category: 'load_boards',
    status: 'connected',
    tagline: 'Industry standard load board',
    price: '$49/mo',
    lastSync: '2 min ago',
    stat1Label: 'Loads synced',
    stat1Val: '847',
    stat2Label: 'Plan',
    stat2Val: '$49/mo',
    apiKeyLabel: 'DAT API Key',
    activity: [
      { ts: '10:42 AM', msg: 'Synced 14 new loads', ok: 'ok' },
      { ts: '10:27 AM', msg: 'Synced 22 new loads', ok: 'ok' },
      { ts: '10:12 AM', msg: 'Rate limit warning', ok: 'warn' },
      { ts: '9:57 AM', msg: 'Synced 9 new loads', ok: 'ok' },
      { ts: '9:42 AM', msg: 'Auth token refreshed', ok: 'ok' },
    ],
    dailyCalls: [820, 847, 790, 910, 855, 830, 847],
  },
  {
    id: 'truckstop',
    name: 'Truckstop.com',
    emoji: '🚛',
    category: 'load_boards',
    status: 'connected',
    tagline: 'Trusted carrier marketplace',
    price: '$39/mo',
    lastSync: '5 min ago',
    stat1Label: 'Loads synced',
    stat1Val: '612',
    stat2Label: 'Plan',
    stat2Val: '$39/mo',
    apiKeyLabel: 'Truckstop API Key',
    activity: [
      { ts: '10:38 AM', msg: 'Synced 11 new loads', ok: 'ok' },
      { ts: '10:23 AM', msg: 'Synced 18 new loads', ok: 'ok' },
      { ts: '10:08 AM', msg: 'Connection timeout, retried', ok: 'warn' },
      { ts: '9:53 AM', msg: 'Synced 7 new loads', ok: 'ok' },
      { ts: '9:38 AM', msg: 'Auth token refreshed', ok: 'ok' },
    ],
    dailyCalls: [580, 612, 600, 640, 590, 610, 612],
  },
  {
    id: '123lb',
    name: '123Loadboard',
    emoji: '📋',
    category: 'load_boards',
    status: 'disconnected',
    tagline: 'Free tier available',
    price: 'Free',
    activity: [
      { ts: '—', msg: 'Never connected', ok: 'err' },
    ],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'convoy',
    name: 'Convoy',
    emoji: '🔗',
    category: 'load_boards',
    status: 'connected',
    tagline: 'API-based digital freight',
    price: '$0 (Free)',
    lastSync: '8 min ago',
    stat1Label: 'Loads synced',
    stat1Val: '204',
    stat2Label: 'Cost',
    stat2Val: 'Free',
    apiKeyLabel: 'Convoy API Key',
    activity: [
      { ts: '10:35 AM', msg: 'Synced 6 new loads', ok: 'ok' },
      { ts: '10:20 AM', msg: 'Synced 12 new loads', ok: 'ok' },
      { ts: '10:05 AM', msg: 'Synced 4 new loads', ok: 'ok' },
      { ts: '9:50 AM', msg: 'Rate refreshed', ok: 'ok' },
      { ts: '9:35 AM', msg: 'Synced 8 new loads', ok: 'ok' },
    ],
    dailyCalls: [190, 204, 185, 210, 195, 200, 204],
  },
  // ELD / Telematics
  {
    id: 'samsara',
    name: 'Samsara',
    emoji: '📡',
    category: 'eld',
    status: 'connected',
    tagline: 'Fleet telematics & HOS',
    price: '$35/truck/mo',
    lastSync: '1 min ago',
    stat1Label: 'Trucks synced',
    stat1Val: '3',
    stat2Label: 'HOS data',
    stat2Val: 'Live',
    apiKeyLabel: 'Samsara API Token',
    activity: [
      { ts: '10:44 AM', msg: 'HOS updated for 3 trucks', ok: 'ok' },
      { ts: '10:29 AM', msg: 'Location data refreshed', ok: 'ok' },
      { ts: '10:14 AM', msg: 'HOS updated for 3 trucks', ok: 'ok' },
      { ts: '9:59 AM', msg: 'Sensor alert on TRK-002', ok: 'warn' },
      { ts: '9:44 AM', msg: 'HOS updated for 3 trucks', ok: 'ok' },
    ],
    dailyCalls: [1200, 1350, 1280, 1400, 1310, 1290, 1350],
  },
  {
    id: 'motive',
    name: 'Motive (KeepTruckin)',
    emoji: '🛣️',
    category: 'eld',
    status: 'connected',
    tagline: 'ELD & driver management',
    price: '$25/truck/mo',
    lastSync: '3 min ago',
    stat1Label: 'Trucks synced',
    stat1Val: '2',
    stat2Label: 'Plan',
    stat2Val: '$25/truck',
    apiKeyLabel: 'Motive API Key',
    activity: [
      { ts: '10:40 AM', msg: 'HOS updated for 2 trucks', ok: 'ok' },
      { ts: '10:25 AM', msg: 'Location data refreshed', ok: 'ok' },
      { ts: '10:10 AM', msg: 'HOS updated for 2 trucks', ok: 'ok' },
      { ts: '9:55 AM', msg: 'Driver login detected', ok: 'ok' },
      { ts: '9:40 AM', msg: 'HOS updated for 2 trucks', ok: 'ok' },
    ],
    dailyCalls: [800, 850, 820, 870, 840, 830, 850],
  },
  {
    id: 'peoplenet',
    name: 'PeopleNet',
    emoji: '🔌',
    category: 'eld',
    status: 'disconnected',
    tagline: 'Fleet intelligence platform',
    price: 'Contact sales',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'geotab',
    name: 'Geotab',
    emoji: '🗺️',
    category: 'eld',
    status: 'disconnected',
    tagline: 'Open telematics platform',
    price: 'From $25/mo',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'omnitracs',
    name: 'Omnitracs',
    emoji: '📟',
    category: 'eld',
    status: 'disconnected',
    tagline: 'Enterprise fleet management',
    price: 'Contact sales',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  // Accounting
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    emoji: '📊',
    category: 'accounting',
    status: 'connected',
    tagline: 'Invoicing & bookkeeping',
    price: '$30/mo',
    lastSync: '1 day ago',
    stat1Label: 'Transactions',
    stat1Val: '234',
    stat2Label: 'Last export',
    stat2Val: '1 day ago',
    oauthLabel: 'Connect with QuickBooks',
    activity: [
      { ts: 'Yesterday 5:00 PM', msg: '12 invoices exported', ok: 'ok' },
      { ts: 'Yesterday 9:00 AM', msg: 'Bank feed synced', ok: 'ok' },
      { ts: '2 days ago', msg: '8 invoices exported', ok: 'ok' },
      { ts: '3 days ago', msg: 'Chart of accounts updated', ok: 'ok' },
      { ts: '4 days ago', msg: 'Tax rate sync warning', ok: 'warn' },
    ],
    dailyCalls: [30, 28, 34, 25, 31, 29, 28],
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    emoji: '🧾',
    category: 'accounting',
    status: 'disconnected',
    tagline: 'Small business accounting',
    price: '$17/mo',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'xero',
    name: 'Xero',
    emoji: '💼',
    category: 'accounting',
    status: 'disconnected',
    tagline: 'Cloud accounting software',
    price: '$15/mo',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  // Factoring
  {
    id: 'otr',
    name: 'OTR Capital',
    emoji: '💰',
    category: 'factoring',
    status: 'connected',
    tagline: 'Freight factoring & fuel cards',
    price: '2.5% fee',
    lastSync: '6 hours ago',
    stat1Label: 'Outstanding',
    stat1Val: '$12,400',
    stat2Label: 'Fee',
    stat2Val: '2.5%',
    apiKeyLabel: 'OTR API Key',
    activity: [
      { ts: '4:00 AM', msg: 'Invoice #1082 factored', ok: 'ok' },
      { ts: 'Yesterday', msg: 'Invoice #1079 paid out', ok: 'ok' },
      { ts: 'Yesterday', msg: 'Invoice #1078 factored', ok: 'ok' },
      { ts: '2 days ago', msg: 'Invoice #1075 paid out', ok: 'ok' },
      { ts: '2 days ago', msg: 'Rate schedule updated', ok: 'warn' },
    ],
    dailyCalls: [4, 6, 3, 5, 7, 4, 6],
  },
  {
    id: 'rts',
    name: 'RTS Financial',
    emoji: '🏦',
    category: 'factoring',
    status: 'disconnected',
    tagline: 'Same-day funding factoring',
    price: '2-5% fee',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'triumph',
    name: 'Triumph Business Capital',
    emoji: '🏆',
    category: 'factoring',
    status: 'disconnected',
    tagline: 'Recourse & non-recourse factoring',
    price: '1.5-5% fee',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  // Compliance
  {
    id: 'fmcsa',
    name: 'FMCSA Portal',
    emoji: '🏛️',
    category: 'compliance',
    status: 'connected',
    tagline: 'Federal safety data sync',
    price: 'Free',
    lastSync: '12 hours ago',
    stat1Label: 'Safety rating',
    stat1Val: 'Satisfactory',
    stat2Label: 'DOT #',
    stat2Val: '•••••••',
    apiKeyLabel: 'DOT Number',
    activity: [
      { ts: 'Today 6:00 AM', msg: 'Safety rating synced', ok: 'ok' },
      { ts: 'Yesterday', msg: 'CSA scores updated', ok: 'ok' },
      { ts: '2 days ago', msg: 'Inspection data refreshed', ok: 'ok' },
      { ts: '3 days ago', msg: 'Out-of-service alert cleared', ok: 'warn' },
      { ts: '4 days ago', msg: 'Safety rating synced', ok: 'ok' },
    ],
    dailyCalls: [2, 2, 2, 2, 2, 2, 2],
  },
  {
    id: 'carrier411',
    name: 'Carrier411',
    emoji: '🔍',
    category: 'compliance',
    status: 'connected',
    tagline: 'Carrier monitoring & vetting',
    price: '$99/mo',
    lastSync: '30 min ago',
    stat1Label: 'Monitoring',
    stat1Val: 'Active',
    stat2Label: 'Alerts',
    stat2Val: '0 pending',
    apiKeyLabel: 'Carrier411 API Key',
    activity: [
      { ts: '10:15 AM', msg: 'All carriers cleared', ok: 'ok' },
      { ts: 'Yesterday', msg: 'New carrier vetted: MC-991234', ok: 'ok' },
      { ts: 'Yesterday', msg: 'Insurance expiry alert: MC-882111', ok: 'warn' },
      { ts: '2 days ago', msg: 'Monthly report generated', ok: 'ok' },
      { ts: '3 days ago', msg: 'All carriers cleared', ok: 'ok' },
    ],
    dailyCalls: [10, 12, 9, 14, 11, 10, 12],
  },
  // Fuel
  {
    id: 'comdata',
    name: 'Comdata',
    emoji: '⛽',
    category: 'fuel',
    status: 'connected',
    tagline: 'Fuel card & payment solutions',
    price: 'Per transaction',
    lastSync: '15 min ago',
    stat1Label: 'Gal tracked (mo)',
    stat1Val: '847 gal',
    stat2Label: 'Transactions',
    stat2Val: '142',
    apiKeyLabel: 'Comdata API Key',
    activity: [
      { ts: '10:30 AM', msg: '42 gal fueled — TRK-001', ok: 'ok' },
      { ts: '9:15 AM', msg: '38 gal fueled — TRK-003', ok: 'ok' },
      { ts: 'Yesterday', msg: '51 gal fueled — TRK-002', ok: 'ok' },
      { ts: 'Yesterday', msg: 'Monthly statement synced', ok: 'ok' },
      { ts: '2 days ago', msg: 'Card declined — TRK-001 (low balance)', ok: 'warn' },
    ],
    dailyCalls: [18, 22, 16, 25, 20, 19, 22],
  },
  {
    id: 'efs',
    name: 'EFS by WEX',
    emoji: '💳',
    category: 'fuel',
    status: 'disconnected',
    tagline: 'Fleet fuel & expense management',
    price: 'Per transaction',
    activity: [{ ts: '—', msg: 'Never connected', ok: 'err' }],
    dailyCalls: [0, 0, 0, 0, 0, 0, 0],
  },
  // API / Developer
  {
    id: 'restapi',
    name: 'REST API',
    emoji: '⚙️',
    category: 'api',
    status: 'active',
    tagline: 'Direct API access',
    price: 'Included',
    lastSync: 'Always on',
    stat1Label: 'Calls today',
    stat1Val: '1,240',
    stat2Label: 'Rate limit',
    stat2Val: '5,000/day',
    apiKeyLabel: 'API Key',
    activity: [
      { ts: '10:44 AM', msg: '128 calls in last 15 min', ok: 'ok' },
      { ts: '10:29 AM', msg: '115 calls in last 15 min', ok: 'ok' },
      { ts: '10:14 AM', msg: 'Rate limit 80% warning', ok: 'warn' },
      { ts: '9:59 AM', msg: '103 calls in last 15 min', ok: 'ok' },
      { ts: '9:44 AM', msg: 'New key generated', ok: 'ok' },
    ],
    dailyCalls: [980, 1100, 1050, 1200, 1150, 1180, 1240],
    apiCallsPerDay: 1240,
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    emoji: '🔔',
    category: 'api',
    status: 'active',
    tagline: 'Real-time event notifications',
    price: 'Included',
    lastSync: '4 min ago',
    stat1Label: 'Active webhooks',
    stat1Val: '3',
    stat2Label: 'Last triggered',
    stat2Val: '4 min ago',
    webhookCount: 3,
    activity: [
      { ts: '10:39 AM', msg: 'load.delivered fired → 200 OK', ok: 'ok' },
      { ts: '10:24 AM', msg: 'load.picked_up fired → 200 OK', ok: 'ok' },
      { ts: '10:09 AM', msg: 'invoice.created fired → 500 ERR', ok: 'err' },
      { ts: '9:54 AM', msg: 'load.delivered fired → 200 OK', ok: 'ok' },
      { ts: '9:39 AM', msg: 'driver.hos_alert fired → 200 OK', ok: 'ok' },
    ],
    dailyCalls: [85, 92, 78, 105, 88, 95, 92],
  },
]

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🔀' },
  { id: 'load_boards', label: 'Load Boards', emoji: '📦' },
  { id: 'eld', label: 'ELD / Telematics', emoji: '📡' },
  { id: 'accounting', label: 'Accounting', emoji: '📊' },
  { id: 'factoring', label: 'Factoring', emoji: '💰' },
  { id: 'compliance', label: 'Compliance', emoji: '🏛️' },
  { id: 'fuel', label: 'Fuel', emoji: '⛽' },
  { id: 'api', label: 'API / Dev', emoji: '⚙️' },
]

// ── Utility ───────────────────────────────────────────────────────────────────
const statusColor = (s: IntegStatus): string =>
  s === 'connected' ? C_SUCCESS : s === 'active' ? C_PRIMARY : C_MUTED

const statusBg = (s: IntegStatus): string =>
  s === 'connected' ? C_GREEN_BG : s === 'active' ? '#DBEAFE' : '#F1F5F9'

const statusLabel = (s: IntegStatus): string =>
  s === 'connected' ? '● Connected' : s === 'active' ? '● Active' : '○ Disconnected'

const actIcon = (ok: ActivityEntry['ok']) =>
  ok === 'ok' ? '✅' : ok === 'warn' ? '⚠️' : '❌'

const actColor = (ok: ActivityEntry['ok']) =>
  ok === 'ok' ? C_SUCCESS : ok === 'warn' ? C_WARN : C_ERR

// ── Mini SVG bar chart ────────────────────────────────────────────────────────
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  const W = 280
  const H = 60
  const barW = 28
  const gap = 12
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} style={{ width: '100%', height: 80 }}>
      {data.map((v, i) => {
        const x = i * (barW + gap)
        const barH = max > 0 ? Math.max(4, Math.round((v / max) * H)) : 4
        const y = H - barH
        const isLast = i === data.length - 1
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={isLast ? color : `${color}80`}
            />
            <text
              x={x + barW / 2}
              y={H + 14}
              textAnchor="middle"
              fontSize={9}
              fill={C_MUTED}
            >
              {days[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Connect Modal ─────────────────────────────────────────────────────────────
interface ConnectModalProps {
  name: string
  onDone: () => void
}

function ConnectModal({ name, onDone }: ConnectModalProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900)
    const t2 = setTimeout(() => setStep(2), 1900)
    const t3 = setTimeout(() => setStep(3), 3000)
    const t4 = setTimeout(() => onDone(), 3800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onDone])

  const steps = [
    `Connecting to ${name}…`,
    'Authenticating…',
    `✅ Connected! Syncing initial data…`,
  ]

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  }

  const boxStyle: CSSProperties = {
    background: C_CARD,
    borderRadius: 16,
    padding: '40px 48px',
    minWidth: 360,
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  }

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
        <h3 style={{ margin: '0 0 24px', color: C_DARK, fontSize: 18 }}>
          Setting Up Integration
        </h3>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              opacity: step >= i ? 1 : 0.3,
              transition: 'opacity 0.4s',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: step > i ? C_SUCCESS : step === i ? C_PRIMARY : C_BORDER,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                color: '#fff',
                flexShrink: 0,
                transition: 'background 0.4s',
              }}
            >
              {step > i ? '✓' : i + 1}
            </div>
            <span style={{ color: step >= i ? C_TEXT : C_MUTED, fontSize: 14 }}>
              {steps[i]}
            </span>
          </div>
        ))}
        {step === 3 && (
          <p style={{ color: C_SUCCESS, fontWeight: 600, marginTop: 16, fontSize: 14 }}>
            Integration ready!
          </p>
        )}
        <Spinner />
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  const [dot, setDot] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 400)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ marginTop: 12, letterSpacing: 4, color: C_MUTED, fontSize: 18 }}>
      {['•', '•', '•'].map((c, i) => (
        <span
          key={i}
          style={{
            opacity: i === dot ? 1 : 0.25,
            transition: 'opacity 0.2s',
          }}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
interface DetailPanelProps {
  integ: Integration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
}

function DetailPanel({ integ, onConnect, onDisconnect }: DetailPanelProps) {
  const [apiKey, setApiKey] = useState('sk_live_••••••••••••••••••••')
  const [showKey, setShowKey] = useState(false)
  const [testState, setTestState] = useState<'idle' | 'testing' | 'ok'>('idle')
  const [syncFreq, setSyncFreq] = useState('15min')
  const connected = integ.status === 'connected' || integ.status === 'active'

  const handleTest = () => {
    if (!connected) return
    setTestState('testing')
    setTimeout(() => setTestState('ok'), 2000)
    setTimeout(() => setTestState('idle'), 5000)
  }

  const panelStyle: CSSProperties = {
    background: C_CARD,
    borderLeft: `1px solid ${C_BORDER}`,
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  }

  const sectionStyle: CSSProperties = {
    padding: '20px 24px',
    borderBottom: `1px solid ${C_BORDER}`,
  }

  const labelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: C_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${C_BORDER}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: 'monospace',
    color: C_TEXT,
    background: '#F8FAFC',
    boxSizing: 'border-box',
  }

  const btnStyle = (
    bg: string,
    color: string = '#fff',
    small = false,
  ): CSSProperties => ({
    padding: small ? '6px 14px' : '9px 18px',
    borderRadius: 8,
    border: 'none',
    background: bg,
    color,
    fontWeight: 600,
    fontSize: small ? 12 : 13,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  })

  const statBoxStyle: CSSProperties = {
    background: '#F8FAFC',
    borderRadius: 10,
    padding: '12px 16px',
    flex: 1,
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ ...sectionStyle, background: C_DARK }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 36 }}>{integ.emoji}</span>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: 18 }}>{integ.name}</h2>
            <p style={{ margin: '2px 0 8px', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
              {integ.tagline}
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 20,
                background: statusBg(integ.status),
                color: statusColor(integ.status),
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {statusLabel(integ.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {connected && (
        <div style={sectionStyle}>
          <p style={labelStyle}>Overview</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {integ.lastSync && (
              <div style={statBoxStyle}>
                <div style={{ fontSize: 11, color: C_MUTED }}>Last Sync</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C_TEXT, marginTop: 2 }}>
                  {integ.lastSync}
                </div>
              </div>
            )}
            {integ.stat1Label && (
              <div style={statBoxStyle}>
                <div style={{ fontSize: 11, color: C_MUTED }}>{integ.stat1Label}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C_TEXT, marginTop: 2 }}>
                  {integ.stat1Val}
                </div>
              </div>
            )}
            {integ.stat2Label && (
              <div style={statBoxStyle}>
                <div style={{ fontSize: 11, color: C_MUTED }}>{integ.stat2Label}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: C_TEXT, marginTop: 2 }}>
                  {integ.stat2Val}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sync frequency */}
      {connected && (
        <div style={sectionStyle}>
          <p style={labelStyle}>Sync Frequency</p>
          <select
            value={syncFreq}
            onChange={(e) => setSyncFreq(e.target.value)}
            style={{
              ...inputStyle,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="realtime">Real-time</option>
            <option value="5min">Every 5 minutes</option>
            <option value="15min">Every 15 minutes</option>
            <option value="30min">Every 30 minutes</option>
            <option value="1hour">Every hour</option>
            <option value="daily">Daily</option>
          </select>
        </div>
      )}

      {/* Config */}
      <div style={sectionStyle}>
        <p style={labelStyle}>Configuration</p>
        {integ.apiKeyLabel && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: C_MUTED }}>
              {integ.apiKeyLabel}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                style={{
                  ...btnStyle('#F1F5F9', C_TEXT, true),
                  border: `1px solid ${C_BORDER}`,
                  flexShrink: 0,
                }}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}
        {integ.oauthLabel && !connected && (
          <button
            onClick={() => onConnect(integ.id)}
            style={{
              ...btnStyle(C_PRIMARY),
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            🔑 {integ.oauthLabel}
          </button>
        )}
        {!connected && !integ.oauthLabel && (
          <button
            onClick={() => onConnect(integ.id)}
            style={{ ...btnStyle(C_PRIMARY), width: '100%' }}
          >
            Connect {integ.name}
          </button>
        )}
        {connected && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleTest}
              disabled={testState === 'testing'}
              style={{
                ...btnStyle('#EFF6FF', C_PRIMARY),
                border: `1px solid ${C_PRIMARY}40`,
                flex: 1,
                opacity: testState === 'testing' ? 0.7 : 1,
              }}
            >
              {testState === 'idle' && '🔍 Test Connection'}
              {testState === 'testing' && '⏳ Testing…'}
              {testState === 'ok' && '✅ Connection OK'}
            </button>
            <button
              onClick={() => {}}
              style={{ ...btnStyle('#F0FDF4', C_SUCCESS), border: `1px solid ${C_SUCCESS}40`, flex: 1 }}
            >
              🔄 Sync Now
            </button>
          </div>
        )}
      </div>

      {/* Usage chart */}
      {connected && integ.dailyCalls && integ.dailyCalls.some((v) => v > 0) && (
        <div style={sectionStyle}>
          <p style={labelStyle}>API Calls — Last 7 Days</p>
          <MiniBarChart data={integ.dailyCalls} color={C_PRIMARY} />
        </div>
      )}

      {/* Activity log */}
      <div style={sectionStyle}>
        <p style={labelStyle}>Activity Log</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {integ.activity.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                background: '#F8FAFC',
                borderRadius: 8,
                borderLeft: `3px solid ${actColor(a.ok)}`,
              }}
            >
              <span style={{ fontSize: 14 }}>{actIcon(a.ok)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C_TEXT }}>{a.msg}</div>
                <div style={{ fontSize: 11, color: C_MUTED }}>{a.ts}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disconnect */}
      {connected && (
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, color: C_MUTED }}>Danger Zone</p>
          <button
            onClick={() => onDisconnect(integ.id)}
            style={{
              ...btnStyle('#FEF2F2', C_ERR),
              border: `1px solid ${C_ERR}30`,
              width: '100%',
            }}
          >
            🔌 Disconnect {integ.name}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Integration Card ──────────────────────────────────────────────────────────
interface CardProps {
  integ: Integration
  selected: boolean
  onSelect: () => void
  onConnect: () => void
  onDisconnect: () => void
}

function IntegCard({ integ, selected, onSelect, onConnect, onDisconnect }: CardProps) {
  const connected = integ.status === 'connected' || integ.status === 'active'

  const cardStyle: CSSProperties = {
    background: C_CARD,
    border: `2px solid ${selected ? C_PRIMARY : C_BORDER}`,
    borderRadius: 14,
    padding: '18px 20px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: selected ? `0 0 0 3px ${C_PRIMARY}20` : '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
  }

  return (
    <div style={cardStyle} onClick={onSelect}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 28,
              background: '#F0F4F8',
              width: 48,
              height: 48,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {integ.emoji}
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C_DARK, lineHeight: 1.2 }}>
              {integ.name}
            </div>
            <div style={{ fontSize: 12, color: C_MUTED, marginTop: 2 }}>{integ.tagline}</div>
          </div>
        </div>
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: statusBg(integ.status),
            color: statusColor(integ.status),
            whiteSpace: 'nowrap',
          }}
        >
          {integ.status === 'connected'
            ? '✓ On'
            : integ.status === 'active'
            ? '● Active'
            : 'Off'}
        </span>
      </div>

      {/* Stats row */}
      {connected && integ.stat1Label && (
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C_MUTED }}>{integ.stat1Label}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C_TEXT }}>{integ.stat1Val}</div>
          </div>
          {integ.stat2Label && (
            <div>
              <div style={{ fontSize: 11, color: C_MUTED }}>{integ.stat2Label}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: C_TEXT }}>{integ.stat2Val}</div>
            </div>
          )}
        </div>
      )}

      {/* Mini bar preview */}
      {connected && integ.dailyCalls && integ.dailyCalls.some((v) => v > 0) && (
        <div style={{ height: 28, overflow: 'hidden' }}>
          <MiniBarChart data={integ.dailyCalls} color={C_PRIMARY} />
        </div>
      )}

      {/* Bottom row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontSize: 12, color: C_MUTED }}>
          {integ.price || '—'}
          {connected && integ.lastSync && ` · Synced ${integ.lastSync}`}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            connected ? onDisconnect() : onConnect()
          }}
          style={{
            padding: '5px 14px',
            borderRadius: 8,
            border: connected ? `1px solid ${C_ERR}40` : `1px solid ${C_PRIMARY}`,
            background: connected ? '#FEF2F2' : C_PRIMARY,
            color: connected ? C_ERR : '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  )
}

// ── Summary Stats Bar ─────────────────────────────────────────────────────────
function SummaryBar({ integrations }: { integrations: Integration[] }) {
  const connected = integrations.filter(
    (i) => i.status === 'connected' || i.status === 'active',
  ).length
  const total = integrations.length

  const statStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 24px',
    borderRight: `1px solid ${C_BORDER}`,
  }

  return (
    <div
      style={{
        background: C_CARD,
        border: `1px solid ${C_BORDER}`,
        borderRadius: 14,
        padding: '16px 0',
        display: 'flex',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <div style={statStyle}>
        <span style={{ fontSize: 24, fontWeight: 800, color: C_SUCCESS }}>{connected}</span>
        <span style={{ fontSize: 12, color: C_MUTED }}>Connected</span>
      </div>
      <div style={statStyle}>
        <span style={{ fontSize: 24, fontWeight: 800, color: C_MUTED }}>
          {total - connected}
        </span>
        <span style={{ fontSize: 12, color: C_MUTED }}>Available</span>
      </div>
      <div style={statStyle}>
        <span style={{ fontSize: 24, fontWeight: 800, color: C_PRIMARY }}>
          {Math.round((connected / total) * 100)}%
        </span>
        <span style={{ fontSize: 12, color: C_MUTED }}>Coverage</span>
      </div>
      <div style={{ ...statStyle, borderRight: 'none' }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: C_DARK }}>
          2,087
        </span>
        <span style={{ fontSize: 12, color: C_MUTED }}>API calls today</span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function IntegrationHubPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>('dat')
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const filtered = integrations.filter((i) => {
    const matchCat = activeCategory === 'all' || i.category === activeCategory
    const matchSearch =
      search === '' ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.tagline.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const selectedInteg = integrations.find((i) => i.id === selectedId) ?? null

  const handleConnect = (id: string) => {
    setConnectingId(id)
  }

  const handleConnectDone = () => {
    if (!connectingId) return
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === connectingId
          ? {
              ...i,
              status: 'connected' as IntegStatus,
              lastSync: 'just now',
              stat1Label: i.stat1Label ?? 'Status',
              stat1Val: i.stat1Val ?? 'Synced',
            }
          : i,
      ),
    )
    setSelectedId(connectingId)
    setConnectingId(null)
  }

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'disconnected' as IntegStatus, lastSync: undefined }
          : i,
      ),
    )
  }

  const connectedCount = integrations.filter(
    (i) => i.status === 'connected' || i.status === 'active',
  ).length

  const pageStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: C_BG,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: C_TEXT,
  }

  const headerStyle: CSSProperties = {
    background: C_DARK,
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    flexShrink: 0,
  }

  const bodyStyle: CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  }

  const leftStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
  }

  const rightStyle: CSSProperties = {
    width: 380,
    flexShrink: 0,
    overflowY: 'auto',
  }

  const tabsStyle: CSSProperties = {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 20,
  }

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 16,
  }

  const searchStyle: CSSProperties = {
    padding: '10px 16px',
    border: `1px solid rgba(255,255,255,0.15)`,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    minWidth: 240,
  }

  return (
    <div style={pageStyle}>
      {/* Page Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: 22, fontWeight: 700 }}>
            🔌 Integration Hub
          </h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            {connectedCount} of {integrations.length} integrations active
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <input
            type="search"
            placeholder="Search integrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />
          <button
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: C_PRIMARY,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + Browse Marketplace
          </button>
        </div>
      </div>

      <div style={bodyStyle}>
        {/* Left panel */}
        <div style={leftStyle}>
          {/* Summary */}
          <SummaryBar integrations={integrations} />

          {/* Category tabs */}
          <div style={tabsStyle}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id
              const count =
                cat.id === 'all'
                  ? integrations.length
                  : integrations.filter((i) => i.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 20,
                    border: `1.5px solid ${isActive ? C_PRIMARY : C_BORDER}`,
                    background: isActive ? C_PRIMARY : C_CARD,
                    color: isActive ? '#fff' : C_MUTED,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#F0F4F8',
                      color: isActive ? '#fff' : C_MUTED,
                      borderRadius: 10,
                      padding: '1px 7px',
                      fontSize: 11,
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Section label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: C_TEXT }}>
              {filtered.length} integration{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: C_GREEN_BG,
                  color: C_SUCCESS,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ✓ {connectedCount} connected
              </span>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  background: '#F1F5F9',
                  color: C_MUTED,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ○ {integrations.length - connectedCount} available
              </span>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 0',
                color: C_MUTED,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No integrations found</p>
              <p style={{ fontSize: 13 }}>Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div style={gridStyle}>
              {filtered.map((integ) => (
                <IntegCard
                  key={integ.id}
                  integ={integ}
                  selected={selectedId === integ.id}
                  onSelect={() => setSelectedId(integ.id)}
                  onConnect={() => handleConnect(integ.id)}
                  onDisconnect={() => handleDisconnect(integ.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={rightStyle}>
          {selectedInteg ? (
            <DetailPanel
              integ={selectedInteg}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: 40,
                color: C_MUTED,
                textAlign: 'center',
                background: C_CARD,
                borderLeft: `1px solid ${C_BORDER}`,
              }}
            >
              <span style={{ fontSize: 48, marginBottom: 16 }}>🔌</span>
              <p style={{ fontWeight: 600, fontSize: 16, color: C_TEXT }}>
                Select an Integration
              </p>
              <p style={{ fontSize: 13 }}>
                Click any card to view details, configure credentials, and manage sync settings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {connectingId && (
        <ConnectModal
          name={integrations.find((i) => i.id === connectingId)?.name ?? ''}
          onDone={handleConnectDone}
        />
      )}
    </div>
  )
}
