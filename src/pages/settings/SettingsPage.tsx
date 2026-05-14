import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { useProfile, useUpdateProfile, useDispatcherProfileData, useUpdateDispatcherProfile } from '../../lib/hooks/useProfile'

// ── Types ─────────────────────────────────────────────────────────────────────
type SettingsTab =
  | 'profile'
  | 'notifications'
  | 'preferences'
  | 'billing'
  | 'security'
  | 'integrations'
  | 'team'
  | 'data'
  | 'audit'

type TeamRole = 'admin' | 'dispatcher' | 'driver' | 'viewer'

interface NotifSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

interface NotifTemplate {
  id: string
  label: string
  icon: string
  subject: string
  body: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  avatar: string
  active: boolean
  lastSeen: string
  joined: string
}

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  ip: string
  status: 'success' | 'warning' | 'error'
}

// ── Data ──────────────────────────────────────────────────────────────────────
const NOTIF_DEFAULTS: NotifSetting[] = [
  { id: 'n1',  label: 'Новые предложения по загрузкам', description: 'Когда загрузка совпадает с вашими предпочтениями', email: true,  push: true,  sms: false },
  { id: 'n2',  label: 'Статус загрузки',                description: 'Pickup, в пути, доставлено',                      email: true,  push: true,  sms: true  },
  { id: 'n3',  label: 'Оплата получена',                description: 'Когда инвойс оплачен',                            email: true,  push: true,  sms: false },
  { id: 'n4',  label: 'Новые сообщения',                description: 'Чат от клиентов и брокеров',                      email: false, push: true,  sms: false },
  { id: 'n5',  label: 'ETA алерты',                     description: 'Приближение доставки или задержка',                email: false, push: true,  sms: true  },
  { id: 'n6',  label: 'Compliance напоминания',          description: 'CDL, страховка, DOT — истечение срока',           email: true,  push: true,  sms: false },
  { id: 'n7',  label: 'Рыночные алерты ставок',         description: 'Значительное изменение spot rates',               email: true,  push: false, sms: false },
  { id: 'n8',  label: 'Предложения диспетчеров',        description: 'Когда диспетчер отправляет предложение',          email: true,  push: true,  sms: false },
  { id: 'n9',  label: 'Отчёты Payroll',                 description: 'Напоминание о выплатах водителям',                email: true,  push: false, sms: false },
  { id: 'n10', label: 'Maintenance алерты',             description: 'ТО и предстоящие проверки траков',                email: true,  push: true,  sms: false },
]

const NOTIF_TEMPLATES_DEFAULT: NotifTemplate[] = [
  {
    id: 'tmpl1',
    label: 'Load Alert',
    icon: '🚛',
    subject: 'New load match: {origin} → {destination}',
    body: 'Hi {name},\n\nA new load matching your preferences has been posted:\n\nRoute: {origin} → {destination}\nRate: {rate}/mile\nPickup: {pickup_date}\n\nView details in your dashboard.\n\nDispaLoadIQ Team',
  },
  {
    id: 'tmpl2',
    label: 'Payment Received',
    icon: '💵',
    subject: 'Payment received: Invoice #{invoice_id}',
    body: 'Hi {name},\n\nGreat news! Payment of {amount} has been received for Invoice #{invoice_id}.\n\nLoad: {load_ref}\nPaid on: {date}\n\nYour balance has been updated.\n\nDispaLoadIQ Finance',
  },
  {
    id: 'tmpl3',
    label: 'HOS Warning',
    icon: '⏱️',
    subject: 'HOS Warning: {driver_name} approaching limit',
    body: 'Attention Dispatcher,\n\nDriver {driver_name} is approaching their Hours of Service limit.\n\nRemaining drive time: {remaining_hours}h\nCurrent location: {location}\nNext required rest: {rest_time}\n\nPlease plan accordingly.\n\nDispaLoadIQ Compliance',
  },
  {
    id: 'tmpl4',
    label: 'Weather Alert',
    icon: '🌩️',
    subject: 'Weather Alert on route: {route}',
    body: 'Safety Notice,\n\nSevere weather conditions detected on your active route:\n\nRoute: {route}\nConditions: {conditions}\nAffected area: {area}\nExpected clearance: {clearance_time}\n\nConsider alternate routing.\n\nDispaLoadIQ Safety',
  },
]

const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', period: '/мес', current: false,
    features: ['1 трак', 'Load board доступ', 'Базовый трекинг', 'Chat'],
    limits: { trucks: 1, users: 1, storage: '500 MB' },
  },
  {
    id: 'pro', name: 'Pro', price: '$29', period: '/мес', current: true,
    features: ['До 5 траков', 'Finance & IFTA', 'Приоритетная поддержка', 'AI load matching', 'Документы', 'Payroll'],
    limits: { trucks: 5, users: 3, storage: '10 GB' },
  },
  {
    id: 'business', name: 'Business', price: '$79', period: '/мес', current: false,
    features: ['Неограниченно траков', 'Полная аналитика', 'API access', 'Dedicated manager', 'White-label', 'Custom reports'],
    limits: { trucks: 999, users: 25, storage: '100 GB' },
  },
]

const INTEGRATIONS = [
  { name: 'DAT Load Board',       icon: '📡', desc: 'Spot rates и подбор загрузок',       connected: true,  color: '#4BAED4', plan: 'Pro',      lastSync: '2 мин назад',  syncCount: 1842, dataVol: '12.4 MB' },
  { name: 'Truckstop.com',        icon: '🚛', desc: 'Дополнительная биржа загрузок',      connected: false, color: '#8B5CF6', plan: 'Pro',      lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'KeepTruckin ELD',      icon: '📟', desc: 'Синхронизация HOS и GPS',            connected: true,  color: '#38C770', plan: 'Pro',      lastSync: '15 мин назад', syncCount: 3204, dataVol: '45.1 MB' },
  { name: 'QuickBooks',           icon: '💼', desc: 'Синхронизация инвойсов и расходов',  connected: true,  color: '#F59E0B', plan: 'Pro',      lastSync: '1 ч назад',   syncCount: 892,  dataVol: '8.7 MB'  },
  { name: 'OTR Capital Factoring',icon: '💵', desc: 'Мгновенная оплата доставленных',     connected: false, color: '#EF4444', plan: 'Pro',      lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Relay Payments',       icon: '💳', desc: 'Топливная карта и расходы',          connected: false, color: '#06B6D4', plan: 'Pro',      lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Samsara GPS',          icon: '🛰️', desc: 'GPS трекинг и диагностика флота',   connected: false, color: '#7C3AED', plan: 'Business', lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Stripe',               icon: '💳', desc: 'Приём платежей от клиентов',         connected: false, color: '#635BFF', plan: 'Business', lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Flexport',             icon: '🌐', desc: 'Международная логистика и фрейт',    connected: false, color: '#10B981', plan: 'Business', lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Motive (ex-KeepTruckin)',icon: '📍', desc: 'AI-камеры и fleet management',    connected: false, color: '#F97316', plan: 'Business', lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Convoy',               icon: '🔄', desc: 'Digital freight matching platform', connected: false, color: '#3B82F6', plan: 'Pro',      lastSync: '—',            syncCount: 0,    dataVol: '—'       },
  { name: 'Uber Freight',         icon: '🏷️', desc: 'Мгновенные ставки и бронирования',  connected: false, color: '#000000', plan: 'Pro',      lastSync: '—',            syncCount: 0,    dataVol: '—'       },
]

const LOGIN_HISTORY = [
  { device: 'MacBook Pro — Chrome',  location: 'Chicago, IL', time: 'Сейчас',       current: true,  ip: '74.125.44.xx' },
  { device: 'iPhone 15 — Safari',    location: 'Chicago, IL', time: '2 часа назад', current: false, ip: '74.125.44.xx' },
  { device: 'Windows PC — Edge',     location: 'Dallas, TX',  time: '3 дня назад',  current: false, ip: '12.34.56.xx'  },
  { device: 'Android — Chrome',      location: 'Chicago, IL', time: '7 дней назад', current: false, ip: '74.125.44.xx' },
]

const TEAM_MEMBERS_DEFAULT: TeamMember[] = [
  { id: 'tm1', name: 'Irina Kurali',     email: 'kuralinaira@gmail.com',    role: 'admin',      avatar: 'IK', active: true,  lastSeen: 'Сейчас',         joined: 'Jan 2025' },
  { id: 'tm2', name: 'Dmitri Volkov',    email: 'd.volkov@itransport.com',  role: 'dispatcher', avatar: 'DV', active: true,  lastSeen: '30 мин назад',   joined: 'Mar 2025' },
  { id: 'tm3', name: 'Carlos Reyes',     email: 'c.reyes@itransport.com',   role: 'driver',     avatar: 'CR', active: true,  lastSeen: '2 часа назад',   joined: 'Apr 2025' },
  { id: 'tm4', name: 'Maxim Petrov',     email: 'm.petrov@itransport.com',  role: 'driver',     avatar: 'MP', active: true,  lastSeen: '1 день назад',   joined: 'Apr 2025' },
  { id: 'tm5', name: 'Sarah Johnson',    email: 's.johnson@itransport.com', role: 'dispatcher', avatar: 'SJ', active: false, lastSeen: '14 дней назад',  joined: 'Feb 2025' },
  { id: 'tm6', name: 'Alex Thornton',    email: 'a.thornton@broker.com',    role: 'viewer',     avatar: 'AT', active: true,  lastSeen: '3 часа назад',   joined: 'May 2025' },
]

const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1',  timestamp: '2026-05-12 14:32:01', user: 'Irina Kurali',   action: 'Logged in',                        ip: '74.125.44.12',  status: 'success' },
  { id: 'a2',  timestamp: '2026-05-12 14:30:44', user: 'Irina Kurali',   action: 'Updated profile information',      ip: '74.125.44.12',  status: 'success' },
  { id: 'a3',  timestamp: '2026-05-12 13:58:22', user: 'Dmitri Volkov',  action: 'Created load #LDQ-00481',          ip: '91.240.11.55',  status: 'success' },
  { id: 'a4',  timestamp: '2026-05-12 13:44:10', user: 'Irina Kurali',   action: 'Connected QuickBooks integration', ip: '74.125.44.12',  status: 'success' },
  { id: 'a5',  timestamp: '2026-05-12 12:15:33', user: 'Carlos Reyes',   action: 'Updated HOS log',                  ip: '172.16.0.45',   status: 'success' },
  { id: 'a6',  timestamp: '2026-05-12 11:52:07', user: 'Dmitri Volkov',  action: 'Assigned load to driver #CR',      ip: '91.240.11.55',  status: 'success' },
  { id: 'a7',  timestamp: '2026-05-12 11:30:00', user: 'Unknown',        action: 'Failed login attempt',             ip: '203.0.113.88',  status: 'error'   },
  { id: 'a8',  timestamp: '2026-05-12 10:44:18', user: 'Irina Kurali',   action: 'Changed billing plan settings',    ip: '74.125.44.12',  status: 'success' },
  { id: 'a9',  timestamp: '2026-05-12 10:22:55', user: 'Sarah Johnson',  action: 'Viewed payroll report',            ip: '10.0.0.22',     status: 'warning' },
  { id: 'a10', timestamp: '2026-05-12 09:45:39', user: 'Maxim Petrov',   action: 'Updated delivery status',          ip: '172.16.0.47',   status: 'success' },
  { id: 'a11', timestamp: '2026-05-11 21:03:12', user: 'Irina Kurali',   action: 'Generated IFTA report Q1 2026',   ip: '74.125.44.12',  status: 'success' },
  { id: 'a12', timestamp: '2026-05-11 18:55:04', user: 'Dmitri Volkov',  action: 'Edited invoice #INV-2841',         ip: '91.240.11.55',  status: 'success' },
  { id: 'a13', timestamp: '2026-05-11 16:30:22', user: 'Irina Kurali',   action: 'Added team member: Alex Thornton', ip: '74.125.44.12', status: 'success' },
  { id: 'a14', timestamp: '2026-05-11 14:12:08', user: 'Alex Thornton',  action: 'Viewed load board',                ip: '198.51.100.14', status: 'success' },
  { id: 'a15', timestamp: '2026-05-11 11:00:00', user: 'Irina Kurali',   action: 'Disabled 2FA (re-setup)',          ip: '74.125.44.12',  status: 'warning' },
  { id: 'a16', timestamp: '2026-05-11 10:58:33', user: 'Irina Kurali',   action: 'Enabled 2FA via Authenticator',    ip: '74.125.44.12',  status: 'success' },
  { id: 'a17', timestamp: '2026-05-10 09:14:45', user: 'Carlos Reyes',   action: 'Requested fuel advance',           ip: '172.16.0.45',   status: 'success' },
]

// ── Helper components ─────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 38, height: 22, borderRadius: 99,
        background: value ? '#4BAED4' : '#CBD5E0',
        cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: value ? 19 : 3,
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)',
      }} />
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '20px 22px' }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
      />
    </div>
  )
}

const ROLE_COLORS: Record<TeamRole, { bg: string; text: string }> = {
  admin:      { bg: '#EBF8FF', text: '#2B6CB0' },
  dispatcher: { bg: '#F0FFF4', text: '#276749' },
  driver:     { bg: '#FFFBEB', text: '#D97706' },
  viewer:     { bg: '#F7FAFC', text: '#718096' },
}

const ROLE_LABELS: Record<TeamRole, string> = {
  admin: 'Admin', dispatcher: 'Dispatcher', driver: 'Driver', viewer: 'Viewer',
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { profile: authProfile } = useAuth()

  // ── Real Supabase data ───────────────────────────────────────────────────────
  const { data: userProfile, isLoading } = useProfile(authProfile?.id)
  const { data: dispProfile } = useDispatcherProfileData(
    authProfile?.role === 'dispatcher' ? authProfile?.id : undefined
  )
  const updateProfile    = useUpdateProfile()
  const updateDispProfile = useUpdateDispatcherProfile()

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [notifs, setNotifs]       = useState<NotifSetting[]>(NOTIF_DEFAULTS)
  const [templates, setTemplates] = useState<NotifTemplate[]>(NOTIF_TEMPLATES_DEFAULT)
  const [toast, setToast]         = useState('')
  const [saving, setSaving]       = useState(false)
  /** @deprecated kept for notification template save UI compat */
  const saved = toast.startsWith('Profile saved')
  const [showApiKey, setShowApiKey] = useState(false)

  // ── Individual profile fields (synced from Supabase) ────────────────────────
  const [name,     setName]     = useState(authProfile?.full_name     ?? 'Your Name')
  const [email]                 = useState(authProfile?.email         ?? '')   // email is read-only
  const [phone,    setPhone]    = useState(authProfile?.phone         ?? '(312) 555-0001')
  const [city,     setCity]     = useState(authProfile?.city          ?? 'Chicago')
  const [state,    setState]    = useState(authProfile?.state         ?? 'IL')
  const [company,  setCompany]  = useState(authProfile?.company_name  ?? 'Your Company')
  const [mcNumber, setMcNumber] = useState(authProfile?.mc_number     ?? 'MC-884291')
  const [dotNumber,setDotNumber]= useState(authProfile?.dot_number    ?? 'DOT-3124881')
  const [timezone, setTimezone] = useState('America/Chicago')
  const [website,  setWebsite]  = useState('')

  // Dispatcher-only fields
  const [bio,            setBio]            = useState('')
  const [commissionRate, setCommissionRate] = useState(8)
  const [minRpm,         setMinRpm]         = useState(2.50)
  const [availability,   setAvailability]   = useState<'available' | 'busy' | 'limited'>('available')

  // Sync user profile from Supabase when it loads
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.full_name ?? 'Your Name')
      setPhone(userProfile.phone ?? '(312) 555-0001')
      setCity(userProfile.city ?? 'Chicago')
      setState(userProfile.state ?? 'IL')
      setCompany(userProfile.company_name ?? 'Your Company')
      setMcNumber(userProfile.mc_number ?? 'MC-884291')
      setDotNumber(userProfile.dot_number ?? 'DOT-3124881')
    }
  }, [userProfile])

  // Sync dispatcher profile from Supabase when it loads
  useEffect(() => {
    if (dispProfile) {
      setBio(dispProfile.bio ?? '')
      setCommissionRate(dispProfile.commission_rate ?? 8)
      setMinRpm(dispProfile.min_rpm ?? 2.50)
      setAvailability(dispProfile.availability ?? 'available')
    }
  }, [dispProfile])

  // Legacy profile object — kept so all existing UI references (p / setP) still work
  const [profile, setProfile] = useState({
    name,
    email,
    phone,
    company,
    mc:       mcNumber,
    dot:      dotNumber,
    address:  `${city}, ${state}`,
    timezone,
    bio,
    website,
  })

  // Keep legacy profile object in sync with individual fields
  useEffect(() => {
    setProfile({
      name, email, phone, company,
      mc: mcNumber, dot: dotNumber,
      address: `${city}, ${state}`,
      timezone, bio, website,
    })
  }, [name, email, phone, company, mcNumber, dotNumber, city, state, timezone, bio, website])

  // Preferences state
  const [prefs, setPrefs] = useState({
    equipType:      'Dry Van',
    maxDeadhead:    150,
    minRpm:         2.30,
    homeBase:       'Chicago, IL',
    radiusHome:     300,
    preferredLanes: ['Chicago, IL → Dallas, TX', 'Houston, TX → Atlanta, GA'],
    darkMode:       false,
    compactView:    false,
    autoRefresh:    true,
    language:       'Русский',
    currency:       'USD',
    // Appearance
    theme:          'System' as 'Light' | 'Dark' | 'System',
    fontSize:       'Medium' as 'Small' | 'Medium' | 'Large',
    dashboardDensity: 'Comfortable' as 'Compact' | 'Comfortable' | 'Spacious',
  })

  // Quiet hours
  const [quietHours, setQuietHours] = useState({ enabled: true, from: '22:00', to: '07:00' })

  // Team state
  const [teamMembers, setTeamMembers]   = useState<TeamMember[]>(TEAM_MEMBERS_DEFAULT)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail]   = useState('')
  const [inviteRole, setInviteRole]     = useState<TeamRole>('dispatcher')

  // 2FA wizard state
  const [twoFAStep, setTwoFAStep] = useState<0 | 1 | 2 | 3>(0) // 0=off, 1=enable, 2=scan, 3=verify
  const [twoFACode, setTwoFACode] = useState('')
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [backupCodesVisible, setBackupCodesVisible] = useState(false)
  const BACKUP_CODES = ['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4']

  // Active template being edited
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)

  function toggleNotif(id: string, channel: 'email' | 'push' | 'sms') {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, [channel]: !n[channel as keyof typeof n] } : n))
  }

  async function handleSave() {
    if (!authProfile?.id) {
      // Demo mode — no Supabase connected
      setToast('Profile saved!')
      setTimeout(() => setToast(''), 3000)
      return
    }
    setSaving(true)
    try {
      await updateProfile.mutateAsync({
        userId: authProfile.id,
        updates: {
          full_name:    name,
          phone,
          city,
          state,
          company_name: company,
          mc_number:    mcNumber,
          dot_number:   dotNumber,
        },
      })
      if (authProfile.role === 'dispatcher') {
        await updateDispProfile.mutateAsync({
          userId: authProfile.id,
          updates: {
            bio,
            commission_rate: commissionRate,
            min_rpm:         minRpm,
            availability,
          },
        })
      }
      setToast('Profile saved!')
      setTimeout(() => setToast(''), 3000)
    } catch {
      setToast('Error saving profile')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  function handleDeactivateMember(id: string) {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m))
  }

  function handleSendInvite() {
    if (!inviteEmail.trim()) return
    const newMember: TeamMember = {
      id: `tm${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: inviteEmail.substring(0, 2).toUpperCase(),
      active: true,
      lastSeen: 'Ожидает активации',
      joined: 'May 2026',
    }
    setTeamMembers(prev => [...prev, newMember])
    setInviteEmail('')
    setShowInviteModal(false)
  }

  function updateTemplate(id: string, field: 'subject' | 'body', value: string) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const TABS: { id: SettingsTab; label: string; badge?: number }[] = [
    { id: 'profile',       label: '👤 Профиль' },
    { id: 'notifications', label: '🔔 Уведомления' },
    { id: 'preferences',   label: '⚙️ Настройки' },
    { id: 'billing',       label: '💳 Тариф' },
    { id: 'security',      label: '🔒 Безопасность' },
    { id: 'integrations',  label: '🔗 Интеграции' },
    { id: 'team',          label: '👥 Команда', badge: teamMembers.filter(m => !m.active).length || undefined },
    { id: 'data',          label: '📦 Данные & API' },
    { id: 'audit',         label: '📋 Audit Log' },
  ]

  const p    = (key: string) => (profile as Record<string, string>)[key] ?? ''
  const setP = (key: string, val: string) => {
    // Keep legacy profile object in sync (drives display), then sync individual fields
    setProfile(prev => ({ ...prev, [key]: val }))
    if (key === 'name')    setName(val)
    if (key === 'phone')   setPhone(val)
    if (key === 'company') setCompany(val)
    if (key === 'mc')      setMcNumber(val)
    if (key === 'dot')     setDotNumber(val)
    if (key === 'bio')     setBio(val)
    if (key === 'address') {
      // Parse "City, ST" format
      const parts = val.split(',')
      if (parts.length >= 2) {
        setCity(parts[0].trim())
        setState(parts[1].trim())
      } else {
        setCity(val)
      }
    }
    if (key === 'timezone') setTimezone(val)
    if (key === 'website')  setWebsite(val)
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading && authProfile?.id) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#4BAED4', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 13, color: '#718096', fontWeight: 600 }}>Загрузка профиля...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 24, maxWidth: 1060, position: 'relative' }}>

      {/* ── Toast notification ───────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
          background: toast.startsWith('Error') ? '#C53030' : '#276749',
          color: '#fff', padding: '12px 22px', borderRadius: 12,
          fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,.18)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {toast.startsWith('Error') ? '✕' : '✓'} {toast}
        </div>
      )}

      {/* ── Sidebar nav ─────────────────────────────────── */}
      <div style={{ width: 214, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* User card */}
        <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', borderRadius: 14, padding: '18px 16px', marginBottom: 4 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 10 }}>
            {profile.name.charAt(0)}
          </div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Owner-Operator</div>
          <div style={{ marginTop: 8, fontSize: 10, padding: '3px 10px', background: 'rgba(75,174,212,.2)', color: '#4BAED4', borderRadius: 99, fontWeight: 700, display: 'inline-block' }}>
            Pro Plan
          </div>
        </div>

        {/* Nav */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 9, textAlign: 'left',
                fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', marginBottom: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: activeTab === tab.id ? '#EBF8FF' : 'transparent',
                color: activeTab === tab.id ? '#4BAED4' : '#4A5568',
              }}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span style={{ fontSize: 10, fontWeight: 800, background: '#FC8181', color: '#fff', borderRadius: 99, padding: '1px 6px' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Danger zone */}
        <div style={{ background: '#FFF5F5', borderRadius: 12, border: '1px solid #FED7D7', padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#C53030', marginBottom: 8 }}>⚠️ Опасная зона</div>
          <button style={{ width: '100%', padding: '7px 0', background: 'transparent', color: '#C53030', border: '1px solid #FC8181', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            Удалить аккаунт
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ═══════════════════════════════════════════════
            PROFILE TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <>
            <SectionCard title="Личная информация" icon="👤">
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #F0F4F8' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, color: '#fff' }}>
                    {profile.name.charAt(0)}
                  </div>
                  <button style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#4BAED4', border: '2px solid #fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>✎</button>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: '#1A2535' }}>{profile.name}</div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{profile.email}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#EBF8FF', color: '#4BAED4' }}>Owner-Operator</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#F0FFF4', color: '#276749' }}>Pro</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Полное имя"     value={p('name')}    onChange={v => setP('name', v)} />
                <FormField label="Email"          value={p('email')}   onChange={v => setP('email', v)}   type="email" />
                <FormField label="Телефон"        value={p('phone')}   onChange={v => setP('phone', v)} />
                <FormField label="Местоположение" value={p('address')} onChange={v => setP('address', v)} />
                <FormField label="Сайт"           value={p('website')} onChange={v => setP('website', v)} placeholder="https://" />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>Часовой пояс</label>
                  <select value={p('timezone')} onChange={e => setP('timezone', e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13 }}>
                    {['America/Chicago', 'America/New_York', 'America/Los_Angeles', 'America/Denver'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>О себе</label>
                <textarea value={p('bio')} onChange={e => setP('bio', e.target.value)} rows={2} placeholder="Краткое описание..."
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </SectionCard>

            <SectionCard title="Бизнес реквизиты" icon="🏢">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Название компании" value={p('company')} onChange={v => setP('company', v)} />
                <FormField label="MC номер"          value={p('mc')}      onChange={v => setP('mc', v)} />
                <FormField label="DOT номер"         value={p('dot')}     onChange={v => setP('dot', v)} />
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>Штат регистрации</label>
                  <select style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13 }}>
                    {['Illinois', 'Texas', 'California', 'Georgia', 'Florida'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 14, background: '#F7FAFC', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', marginBottom: 6 }}>ВЕРИФИКАЦИЯ</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { label: 'FMCSA',     ok: true  },
                    { label: 'Insurance', ok: true  },
                    { label: 'DOT',       ok: true  },
                    { label: 'EIN',       ok: false },
                  ].map(v => (
                    <div key={v.label} style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12 }}>
                      <span style={{ color: v.ok ? '#48BB78' : '#FC8181' }}>{v.ok ? '✓' : '✕'}</span>
                      <span style={{ color: v.ok ? '#276749' : '#C53030', fontWeight: 700 }}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={{ padding: '10px 20px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Отменить
              </button>
              <button onClick={() => { void handleSave() }} disabled={saving} style={{ padding: '10px 24px', background: toast === 'Profile saved!' ? '#48BB78' : '#4BAED4', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', minWidth: 150, transition: 'background .2s', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Сохранение...' : toast === 'Profile saved!' ? '✓ Сохранено!' : 'Сохранить изменения'}
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════
            NOTIFICATIONS TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <>
            <SectionCard title="Настройки уведомлений" icon="🔔">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', gap: 8, paddingBottom: 12, borderBottom: '1px solid #E2E8F0', marginBottom: 4 }}>
                {['Тип уведомления', 'Email', 'Push', 'SMS'].map((h, i) => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', textAlign: i > 0 ? 'center' : 'left', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>
              {notifs.map(n => (
                <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F7FAFC' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{n.label}</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>{n.description}</div>
                  </div>
                  {(['email', 'push', 'sms'] as const).map(ch => (
                    <div key={ch} style={{ display: 'flex', justifyContent: 'center' }}>
                      <Toggle value={n[ch]} onChange={() => toggleNotif(n.id, ch)} />
                    </div>
                  ))}
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Тихий режим" icon="🌙">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: quietHours.enabled ? 16 : 0 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>Тихие часы</div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>Не отправлять push-уведомления в указанное время</div>
                </div>
                <Toggle value={quietHours.enabled} onChange={v => setQuietHours(qh => ({ ...qh, enabled: v }))} />
              </div>
              {quietHours.enabled && (
                <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                  {[
                    { label: 'С',  key: 'from', value: quietHours.from },
                    { label: 'До', key: 'to',   value: quietHours.to   },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <input type="time" value={f.value}
                        onChange={e => setQuietHours(qh => ({ ...qh, [f.key]: e.target.value }))}
                        style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 14 }} />
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Notification Templates */}
            <SectionCard title="Шаблоны уведомлений" icon="📝">
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 16, lineHeight: 1.5 }}>
                Настройте текст email-уведомлений. Используйте переменные в фигурных скобках: {'{name}'}, {'{route}'}, {'{amount}'} и т.д.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {templates.map(tmpl => (
                  <div key={tmpl.id} style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
                    <div
                      onClick={() => setEditingTemplate(editingTemplate === tmpl.id ? null : tmpl.id)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F7FAFC', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 18 }}>{tmpl.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{tmpl.label}</div>
                          <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1, maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tmpl.subject}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#4BAED4', fontWeight: 700 }}>{editingTemplate === tmpl.id ? '▲ Свернуть' : '▼ Редактировать'}</span>
                    </div>
                    {editingTemplate === tmpl.id && (
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>ТЕМА ПИСЬМА</label>
                          <input
                            value={tmpl.subject}
                            onChange={e => updateTemplate(tmpl.id, 'subject', e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>ТЕКСТ ПИСЬМА</label>
                          <textarea
                            value={tmpl.body}
                            onChange={e => updateTemplate(tmpl.id, 'body', e.target.value)}
                            rows={6}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 12, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { void handleSave() }} style={{ padding: '8px 18px', background: saved ? '#48BB78' : '#4BAED4', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                            {saved ? '✓ Сохранено' : 'Сохранить шаблон'}
                          </button>
                          <button style={{ padding: '8px 14px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
                            Сбросить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { void handleSave() }} style={{ padding: '10px 24px', background: saved ? '#48BB78' : '#4BAED4', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background .2s' }}>
                {saved ? '✓ Сохранено!' : 'Сохранить настройки'}
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════
            PREFERENCES TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'preferences' && (
          <>
            <SectionCard title="Настройки загрузок" icon="🚛">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>Тип оборудования</label>
                  <select value={prefs.equipType} onChange={e => setPrefs(pr => ({ ...pr, equipType: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13 }}>
                    {['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'Tanker', 'LTL'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>Домашняя база</label>
                  <input value={prefs.homeBase} onChange={e => setPrefs(pr => ({ ...pr, homeBase: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>
                    Макс. deadhead: <strong style={{ color: '#1A2535' }}>{prefs.maxDeadhead} mi</strong>
                  </label>
                  <input type="range" min={0} max={400} step={25} value={prefs.maxDeadhead}
                    onChange={e => setPrefs(pr => ({ ...pr, maxDeadhead: +e.target.value }))}
                    style={{ width: '100%', accentColor: '#4BAED4' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#A0AEC0' }}>
                    <span>0 mi</span><span>400 mi</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>
                    Мин. RPM: <strong style={{ color: '#1A2535' }}>${prefs.minRpm.toFixed(2)}</strong>
                  </label>
                  <input type="range" min={1.5} max={3.5} step={0.05} value={prefs.minRpm}
                    onChange={e => setPrefs(pr => ({ ...pr, minRpm: +e.target.value }))}
                    style={{ width: '100%', accentColor: '#4BAED4' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#A0AEC0' }}>
                    <span>$1.50</span><span>$3.50</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', marginBottom: 8 }}>ПРЕДПОЧТИТЕЛЬНЫЕ КОРИДОРЫ</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {prefs.preferredLanes.map((lane, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7FAFC', borderRadius: 8, padding: '8px 12px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>🛣 {lane}</span>
                      <button onClick={() => setPrefs(pr => ({ ...pr, preferredLanes: pr.preferredLanes.filter((_, j) => j !== i) }))}
                        style={{ background: 'none', border: 'none', color: '#FC8181', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>×</button>
                    </div>
                  ))}
                  <button style={{ padding: '8px 0', background: '#EBF8FF', color: '#4BAED4', border: '1.5px dashed #BEE3F8', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    + Добавить коридор
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Интерфейс" icon="🎨">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Компактный вид',  sub: 'Уменьшить отступы для большей плотности', key: 'compactView', value: prefs.compactView },
                  { label: 'Авто-обновление', sub: 'Обновлять данные каждые 60 секунд',        key: 'autoRefresh',  value: prefs.autoRefresh },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <Toggle value={item.value} onChange={v => setPrefs(pr => ({ ...pr, [item.key]: v }))} />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>Язык</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>Язык интерфейса платформы</div>
                  </div>
                  <select value={prefs.language} onChange={e => setPrefs(pr => ({ ...pr, language: e.target.value }))}
                    style={{ padding: '7px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}>
                    {['Русский', 'English', 'Español'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Appearance Section */}
            <SectionCard title="Внешний вид" icon="🖥️">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Theme toggle */}
                <div style={{ padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535', marginBottom: 10 }}>Тема оформления</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {(['Light', 'Dark', 'System'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setPrefs(pr => ({ ...pr, theme: t }))}
                        style={{
                          flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          border: `2px solid ${prefs.theme === t ? '#4BAED4' : '#E2E8F0'}`,
                          background: prefs.theme === t ? '#EBF8FF' : '#F7FAFC',
                          color: prefs.theme === t ? '#4BAED4' : '#718096',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{t === 'Light' ? '☀️' : t === 'Dark' ? '🌙' : '💻'}</span>
                        {t === 'Light' ? 'Светлая' : t === 'Dark' ? 'Тёмная' : 'Системная'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>Размер шрифта</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>Базовый размер текста интерфейса</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['Small', 'Medium', 'Large'] as const).map(sz => (
                      <button
                        key={sz}
                        onClick={() => setPrefs(pr => ({ ...pr, fontSize: sz }))}
                        style={{
                          padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                          border: `1.5px solid ${prefs.fontSize === sz ? '#4BAED4' : '#E2E8F0'}`,
                          background: prefs.fontSize === sz ? '#EBF8FF' : 'transparent',
                          color: prefs.fontSize === sz ? '#4BAED4' : '#718096',
                          fontSize: sz === 'Small' ? 11 : sz === 'Medium' ? 13 : 15,
                          fontWeight: 700,
                        }}
                      >
                        {sz === 'Small' ? 'A' : sz === 'Medium' ? 'A' : 'A'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dashboard density */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>Плотность дашборда</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>Расстояние между элементами и карточками</div>
                  </div>
                  <select
                    value={prefs.dashboardDensity}
                    onChange={e => setPrefs(pr => ({ ...pr, dashboardDensity: e.target.value as typeof prefs.dashboardDensity }))}
                    style={{ padding: '7px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                  >
                    <option value="Compact">Компактный</option>
                    <option value="Comfortable">Комфортный</option>
                    <option value="Spacious">Просторный</option>
                  </select>
                </div>
              </div>

              {/* Preview block */}
              <div style={{ marginTop: 4, padding: '14px 16px', background: prefs.theme === 'Dark' ? '#1A2535' : '#F7FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: prefs.theme === 'Dark' ? '#A0AEC0' : '#718096', marginBottom: 6, textTransform: 'uppercase' }}>Предпросмотр темы</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Загрузка #1', 'Загрузка #2', 'Загрузка #3'].map(label => (
                    <div key={label} style={{
                      flex: 1, padding: prefs.dashboardDensity === 'Compact' ? '6px 10px' : prefs.dashboardDensity === 'Comfortable' ? '10px 14px' : '16px 18px',
                      background: prefs.theme === 'Dark' ? '#2D4A6B' : '#fff',
                      borderRadius: 8, border: `1px solid ${prefs.theme === 'Dark' ? '#3D5A7A' : '#E2E8F0'}`,
                      fontSize: prefs.fontSize === 'Small' ? 10 : prefs.fontSize === 'Medium' ? 12 : 14,
                      color: prefs.theme === 'Dark' ? '#fff' : '#1A2535',
                      fontWeight: 600,
                    }}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { void handleSave() }} style={{ padding: '10px 24px', background: saved ? '#48BB78' : '#4BAED4', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'background .2s' }}>
                {saved ? '✓ Сохранено!' : 'Сохранить настройки'}
              </button>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════
            BILLING TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'billing' && (
          <>
            <SectionCard title="Текущий тариф" icon="💳">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {PLANS.map(plan => (
                  <div key={plan.id} style={{
                    border: `2px solid ${plan.current ? '#4BAED4' : '#E2E8F0'}`,
                    borderRadius: 14, padding: '20px 16px',
                    background: plan.current ? '#EBF8FF' : '#fff', position: 'relative',
                  }}>
                    {plan.current && (
                      <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#4BAED4', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                        ВАШ ПЛАН
                      </div>
                    )}
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#1A2535', marginBottom: 4 }}>{plan.name}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#4BAED4' }}>
                      {plan.price}<span style={{ fontSize: 13, fontWeight: 500, color: '#A0AEC0' }}>{plan.period}</span>
                    </div>
                    <div style={{ margin: '14px 0', paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                      {[
                        { label: 'Траки',         val: plan.limits.trucks === 999 ? '∞' : String(plan.limits.trucks) },
                        { label: 'Пользователи',  val: String(plan.limits.users) },
                        { label: 'Хранилище',     val: plan.limits.storage },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginBottom: 4 }}>
                          <span>{row.label}</span><span style={{ fontWeight: 700 }}>{row.val}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ fontSize: 12, color: '#4A5568', display: 'flex', gap: 6 }}>
                          <span style={{ color: '#48BB78' }}>✓</span> {f}
                        </div>
                      ))}
                    </div>
                    {!plan.current && (
                      <button style={{ width: '100%', marginTop: 16, padding: '9px 0', border: `1.5px solid ${plan.id === 'business' ? '#4BAED4' : '#E2E8F0'}`, borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: plan.id === 'business' ? '#4BAED4' : 'transparent', color: plan.id === 'business' ? '#fff' : '#718096' }}>
                        {plan.id === 'business' ? 'Перейти на Business →' : 'Downgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Использование ресурсов" icon="📊">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Траки',      used: 3,   max: 5,    unit: ''    },
                  { label: 'Хранилище', used: 4.2, max: 10,   unit: ' GB' },
                  { label: 'API вызовы', used: 842, max: 5000, unit: ''    },
                ].map(r => {
                  const pct = (r.used / r.max) * 100
                  return (
                    <div key={r.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{r.label}</span>
                        <span style={{ fontSize: 12, color: '#718096' }}>{r.used}{r.unit} / {r.max}{r.unit}</span>
                      </div>
                      <div style={{ height: 8, background: '#F0F4F8', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? '#FC8181' : '#4BAED4', borderRadius: 4, transition: 'width .3s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            <SectionCard title="Способ оплаты" icon="💳">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#F7FAFC', borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>💳</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>Visa •••• 4242</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>Истекает 08/2027</div>
                </div>
                <button style={{ padding: '6px 14px', background: '#EBF8FF', color: '#4BAED4', border: '1px solid #BEE3F8', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Изменить</button>
              </div>
              <button style={{ padding: '8px 16px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Добавить карту</button>
            </SectionCard>

            <SectionCard title="История платежей" icon="🧾">
              {[
                { date: 'May 1, 2026', desc: 'Pro Plan — Monthly', amount: '$29.00' },
                { date: 'Apr 1, 2026', desc: 'Pro Plan — Monthly', amount: '$29.00' },
                { date: 'Mar 1, 2026', desc: 'Pro Plan — Monthly', amount: '$29.00' },
                { date: 'Feb 1, 2026', desc: 'Pro Plan — Monthly', amount: '$29.00' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{r.desc}</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0' }}>{r.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>{r.amount}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#F0FFF4', color: '#276749' }}>Оплачено</span>
                    <button style={{ padding: '4px 10px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>PDF</button>
                  </div>
                </div>
              ))}
            </SectionCard>
          </>
        )}

        {/* ═══════════════════════════════════════════════
            SECURITY TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <>
            <SectionCard title="Изменить пароль" icon="🔒">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
                {['Текущий пароль', 'Новый пароль', 'Подтвердить новый пароль'].map(label => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>{label}</label>
                    <input type="password" placeholder="••••••••••"
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', marginBottom: 6 }}>ТРЕБОВАНИЯ К ПАРОЛЮ</div>
                  {['Минимум 8 символов', 'Одна заглавная буква', 'Одна цифра или спецсимвол'].map(r => (
                    <div key={r} style={{ fontSize: 11, color: '#718096', display: 'flex', gap: 6, marginBottom: 3 }}>
                      <span style={{ color: '#A0AEC0' }}>○</span> {r}
                    </div>
                  ))}
                </div>
                <button style={{ padding: '10px 20px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', width: 'fit-content' }}>
                  Обновить пароль
                </button>
              </div>
            </SectionCard>

            {/* 2FA Setup Wizard */}
            <SectionCard title="Двухфакторная аутентификация" icon="🛡️">
              {/* Current 2FA status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#F0FFF4', borderRadius: 12, border: '1px solid #9AE6B4', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#276749', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>🟢</span> 2FA включена
                  </div>
                  <div style={{ fontSize: 12, color: '#48BB78', marginTop: 2 }}>Аккаунт защищён приложением-аутентификатором</div>
                </div>
                <button
                  onClick={() => { setShow2FAModal(true); setTwoFAStep(1) }}
                  style={{ padding: '7px 16px', background: '#fff', border: '1px solid #9AE6B4', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#276749' }}
                >
                  Перенастроить
                </button>
              </div>

              {/* Backup codes */}
              <div style={{ background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: backupCodesVisible ? 12 : 0 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#92400E' }}>Резервные коды</div>
                    <div style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>Используйте при потере доступа к приложению</div>
                  </div>
                  <button
                    onClick={() => setBackupCodesVisible(v => !v)}
                    style={{ padding: '6px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#92400E' }}
                  >
                    {backupCodesVisible ? 'Скрыть' : 'Показать коды'}
                  </button>
                </div>
                {backupCodesVisible && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {BACKUP_CODES.map(code => (
                      <div key={code} style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1A2535', padding: '6px 10px', background: '#fff', borderRadius: 7, textAlign: 'center', border: '1px solid #FDE68A' }}>
                        {code}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2FA Wizard Modal */}
              {show2FAModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: 440, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
                    {/* Step indicator */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
                      {[1, 2, 3].map(step => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: step < 3 ? 1 : 0 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 800,
                            background: twoFAStep >= step ? '#4BAED4' : '#E2E8F0',
                            color: twoFAStep >= step ? '#fff' : '#A0AEC0',
                            flexShrink: 0,
                          }}>
                            {twoFAStep > step ? '✓' : step}
                          </div>
                          {step < 3 && (
                            <div style={{ flex: 1, height: 2, background: twoFAStep > step ? '#4BAED4' : '#E2E8F0' }} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Step 1: Enable */}
                    {twoFAStep === 1 && (
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#1A2535', marginBottom: 8 }}>Включить 2FA</div>
                        <div style={{ fontSize: 13, color: '#718096', lineHeight: 1.6, marginBottom: 20 }}>
                          Двухфакторная аутентификация добавляет дополнительный уровень защиты. После включения вам потребуется код из приложения-аутентификатора при каждом входе.
                        </div>
                        <div style={{ background: '#EBF8FF', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#2B6CB0', marginBottom: 6 }}>Рекомендуемые приложения:</div>
                          {['Google Authenticator', 'Authy', 'Microsoft Authenticator'].map(app => (
                            <div key={app} style={{ fontSize: 12, color: '#4A5568', marginBottom: 3 }}>• {app}</div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => { setShow2FAModal(false); setTwoFAStep(0) }}
                            style={{ flex: 1, padding: '10px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#718096' }}>
                            Отмена
                          </button>
                          <button onClick={() => setTwoFAStep(2)}
                            style={{ flex: 1, padding: '10px', background: '#4BAED4', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#fff' }}>
                            Продолжить →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Scan QR */}
                    {twoFAStep === 2 && (
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#1A2535', marginBottom: 8 }}>Сканируйте QR-код</div>
                        <div style={{ fontSize: 13, color: '#718096', marginBottom: 16 }}>Откройте приложение-аутентификатор и отсканируйте QR-код:</div>
                        {/* QR code placeholder */}
                        <div style={{ width: 160, height: 160, margin: '0 auto 16px', background: '#F7FAFC', borderRadius: 12, border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
                          📱
                        </div>
                        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '10px 14px', marginBottom: 16, textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 4 }}>Или введите вручную:</div>
                          <code style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', letterSpacing: 2 }}>JBSWY3DPEHPK3PXP</code>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => setTwoFAStep(1)} style={{ flex: 1, padding: '10px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#718096' }}>← Назад</button>
                          <button onClick={() => setTwoFAStep(3)} style={{ flex: 1, padding: '10px', background: '#4BAED4', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#fff' }}>Код получен →</button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Verify */}
                    {twoFAStep === 3 && (
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#1A2535', marginBottom: 8 }}>Введите код подтверждения</div>
                        <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Введите 6-значный код из вашего приложения-аутентификатора:</div>
                        <input
                          type="text"
                          value={twoFACode}
                          onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          style={{ width: '100%', padding: '14px', border: '2px solid #E2E8F0', borderRadius: 12, fontSize: 24, fontWeight: 900, textAlign: 'center', letterSpacing: 8, fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 20 }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => setTwoFAStep(2)} style={{ flex: 1, padding: '10px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#718096' }}>← Назад</button>
                          <button
                            onClick={() => { setShow2FAModal(false); setTwoFAStep(0); setTwoFACode(''); handleSave() }}
                            style={{ flex: 1, padding: '10px', background: twoFACode.length === 6 ? '#48BB78' : '#A0AEC0', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: twoFACode.length === 6 ? 'pointer' : 'not-allowed', color: '#fff' }}
                          >
                            ✓ Подтвердить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Активные сессии" icon="🖥️">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LOGIN_HISTORY.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    background: s.current ? '#EBF8FF' : '#F7FAFC', borderRadius: 10,
                    border: `1px solid ${s.current ? '#BAE6FD' : '#E2E8F0'}`,
                  }}>
                    <span style={{ fontSize: 24 }}>{s.device.includes('iPhone') || s.device.includes('Android') ? '📱' : '💻'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.device}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{s.location} · {s.time} · IP: {s.ip}</div>
                    </div>
                    {s.current
                      ? <span style={{ fontSize: 11, color: '#48BB78', fontWeight: 700 }}>● Это устройство</span>
                      : <button style={{ padding: '5px 12px', background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Завершить</button>
                    }
                  </div>
                ))}
              </div>
              <button style={{ marginTop: 12, padding: '8px 16px', background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Завершить все прочие сессии
              </button>
            </SectionCard>
          </>
        )}

        {/* ═══════════════════════════════════════════════
            INTEGRATIONS TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'integrations' && (
          <SectionCard title="Подключённые сервисы" icon="🔗">
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 16 }}>
              Всего интеграций: <strong style={{ color: '#1A2535' }}>12</strong> · Подключено: <strong style={{ color: '#48BB78' }}>{INTEGRATIONS.filter(i => i.connected).length}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {INTEGRATIONS.map(svc => (
                <div key={svc.name} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: svc.connected ? svc.color + '0A' : '#F7FAFC',
                  borderRadius: 12, border: `1px solid ${svc.connected ? svc.color + '30' : '#E2E8F0'}`,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: svc.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {svc.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{svc.desc}</div>
                    {svc.connected && (
                      <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: '#A0AEC0' }}>Синк: <strong style={{ color: '#4A5568' }}>{svc.lastSync}</strong></span>
                        <span style={{ fontSize: 10, color: '#A0AEC0' }}>Запросов: <strong style={{ color: '#4A5568' }}>{svc.syncCount.toLocaleString()}</strong></span>
                        <span style={{ fontSize: 10, color: '#A0AEC0' }}>Данных: <strong style={{ color: '#4A5568' }}>{svc.dataVol}</strong></span>
                      </div>
                    )}
                  </div>
                  {svc.plan === 'Business' && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#FFFBEB', color: '#D97706', flexShrink: 0 }}>Business</span>
                  )}
                  {svc.connected
                    ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: '#48BB78', fontWeight: 700 }}>● Connected</span>
                        <button style={{ padding: '5px 12px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#718096' }}>Отключить</button>
                      </div>
                    )
                    : (
                      <button style={{ padding: '7px 16px', background: svc.plan === 'Business' ? '#F7FAFC' : svc.color + '15', color: svc.plan === 'Business' ? '#A0AEC0' : svc.color, border: `1px solid ${svc.plan === 'Business' ? '#E2E8F0' : svc.color + '40'}`, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: svc.plan === 'Business' ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
                        {svc.plan === 'Business' ? 'Business план' : 'Подключить →'}
                      </button>
                    )
                  }
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ═══════════════════════════════════════════════
            TEAM TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'team' && (
          <>
            <SectionCard title="Участники команды" icon="👥">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#718096' }}>
                  {teamMembers.filter(m => m.active).length} активных · {teamMembers.filter(m => !m.active).length} деактивированных
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  style={{ padding: '9px 18px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  + Пригласить участника
                </button>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 100px 120px 80px', gap: 8, paddingBottom: 10, borderBottom: '1px solid #E2E8F0', marginBottom: 4 }}>
                {['Участник', 'Email', 'Роль', 'Последний вход', ''].map((h, i) => (
                  <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {teamMembers.map(member => (
                <div key={member.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 180px 100px 120px 80px', gap: 8, alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid #F7FAFC',
                  opacity: member.active ? 1 : 0.5,
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${member.active ? '#4BAED4' : '#A0AEC0'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: member.active ? '#4BAED4' : '#A0AEC0', flexShrink: 0 }}>
                      {member.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{member.name}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>Joined {member.joined}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: ROLE_COLORS[member.role].bg, color: ROLE_COLORS[member.role].text }}>
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{member.lastSeen}</div>
                  <div>
                    {member.role !== 'admin' && (
                      <button
                        onClick={() => handleDeactivateMember(member.id)}
                        style={{ padding: '5px 10px', background: member.active ? '#FFF5F5' : '#F0FFF4', color: member.active ? '#C53030' : '#276749', border: `1px solid ${member.active ? '#FED7D7' : '#9AE6B4'}`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {member.active ? 'Деакт.' : 'Восст.'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </SectionCard>

            {/* Roles reference */}
            <SectionCard title="Уровни доступа" icon="🔑">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { role: 'admin' as TeamRole,      perms: ['Полный доступ', 'Управление командой', 'Биллинг', 'API ключи', 'Все отчёты'] },
                  { role: 'dispatcher' as TeamRole, perms: ['Загрузки и маршруты', 'Водители и траки', 'Инвойсы', 'Чат', 'Отчёты'] },
                  { role: 'driver' as TeamRole,     perms: ['Свои загрузки', 'HOS и документы', 'Чат', 'Расходы'] },
                  { role: 'viewer' as TeamRole,     perms: ['Только просмотр', 'Load board (read)', 'Базовые отчёты'] },
                ].map(item => (
                  <div key={item.role} style={{ padding: '14px 16px', background: `${ROLE_COLORS[item.role].bg}`, borderRadius: 10, border: `1.5px solid ${ROLE_COLORS[item.role].text}20` }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: ROLE_COLORS[item.role].text, marginBottom: 8 }}>{ROLE_LABELS[item.role]}</div>
                    {item.perms.map(perm => (
                      <div key={perm} style={{ fontSize: 12, color: '#4A5568', marginBottom: 3, display: 'flex', gap: 6 }}>
                        <span style={{ color: '#48BB78' }}>✓</span> {perm}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Invite Modal */}
            {showInviteModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: 400, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: '#1A2535', marginBottom: 6 }}>Пригласить участника</div>
                  <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Приглашение будет отправлено на email</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>Email адрес</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>Роль</label>
                      <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value as TeamRole)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13 }}
                      >
                        <option value="dispatcher">Dispatcher — управление загрузками</option>
                        <option value="driver">Driver — водитель</option>
                        <option value="viewer">Viewer — только просмотр</option>
                        <option value="admin">Admin — полный доступ</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '10px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#718096' }}>
                      Отмена
                    </button>
                    <button onClick={handleSendInvite} style={{ flex: 1, padding: '10px', background: '#4BAED4', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#fff' }}>
                      Отправить приглашение
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════
            DATA & API TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'data' && (
          <>
            <SectionCard title="API ключи" icon="🔑">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 14, lineHeight: 1.5 }}>
                  Используйте API ключи для интеграции DispaLoadIQ с вашими системами. Ключи имеют права только для чтения (read-only) если не указано иное.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7FAFC', borderRadius: 10, padding: '12px 16px', border: '1.5px solid #E2E8F0' }}>
                  <code style={{ flex: 1, fontSize: 13, color: '#1A2535', fontFamily: 'monospace' }}>
                    {showApiKey ? 'dliq_live_sk_a8f3d2c1e9b4f7a2d5c8e1f4a7b2d5c8' : 'dliq_live_sk_••••••••••••••••••••••••••••'}
                  </code>
                  <button onClick={() => setShowApiKey(s => !s)} style={{ padding: '5px 12px', background: '#EBF8FF', color: '#4BAED4', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {showApiKey ? 'Скрыть' : 'Показать'}
                  </button>
                  <button style={{ padding: '5px 12px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Копировать</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ padding: '9px 18px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ Создать ключ</button>
                <button style={{ padding: '9px 18px', background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Отозвать ключ</button>
              </div>
            </SectionCard>

            <SectionCard title="Экспорт данных" icon="📦">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Все загрузки и рейсы',  icon: '🚛', desc: 'Полная история загрузок в CSV',           format: 'CSV'     },
                  { label: 'Инвойсы',               icon: '💵', desc: 'Все инвойсы за выбранный период',        format: 'CSV/PDF' },
                  { label: 'IFTA отчёт',            icon: '⛽', desc: 'IFTA данные по кварталам',               format: 'PDF'     },
                  { label: 'Данные водителей',      icon: '👤', desc: 'Профили, settlements, compliance',       format: 'CSV'     },
                  { label: 'Полный бэкап аккаунта', icon: '💾', desc: 'Все данные платформы (ZIP архив)',        format: 'ZIP'     },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F7FAFC', borderRadius: 10 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#EBF8FF', color: '#2B6CB0' }}>{item.format}</span>
                      <button style={{ padding: '6px 14px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Экспорт</button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Webhooks" icon="🔔">
              <div style={{ fontSize: 13, color: '#718096', marginBottom: 14 }}>
                Получайте уведомления в реальном времени о событиях на платформе через HTTP POST запросы.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {[
                  { url: 'https://api.yourapp.com/webhooks/dispa', events: 'load.created, load.delivered', active: true  },
                  { url: 'https://n8n.yourserver.io/webhook/123',   events: 'invoice.paid',                active: false },
                ].map((wh, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F7FAFC', borderRadius: 9, border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535', fontFamily: 'monospace' }}>{wh.url}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{wh.events}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: wh.active ? '#F0FFF4' : '#F7FAFC', color: wh.active ? '#276749' : '#A0AEC0' }}>
                        {wh.active ? '● Active' : '○ Paused'}
                      </span>
                      <button style={{ padding: '4px 10px', background: '#FFF5F5', color: '#C53030', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
              <button style={{ padding: '9px 16px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                + Добавить Webhook
              </button>
            </SectionCard>
          </>
        )}

        {/* ═══════════════════════════════════════════════
            AUDIT LOG TAB
        ════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <SectionCard title="Журнал действий" icon="📋">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#718096' }}>
                Последние <strong style={{ color: '#1A2535' }}>{AUDIT_LOG.length}</strong> действий в аккаунте
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ padding: '7px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#4A5568' }}>
                  <option>Все пользователи</option>
                  <option>Irina Kurali</option>
                  <option>Dmitri Volkov</option>
                  <option>Carlos Reyes</option>
                </select>
                <button style={{ padding: '7px 14px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Экспорт CSV
                </button>
              </div>
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 130px 110px 70px', gap: 8, paddingBottom: 10, borderBottom: '1.5px solid #E2E8F0', marginBottom: 4 }}>
              {['Время', 'Действие', 'Пользователь', 'IP адрес', 'Статус'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>

            {AUDIT_LOG.map(entry => (
              <div key={entry.id} style={{
                display: 'grid', gridTemplateColumns: '150px 1fr 130px 110px 70px', gap: 8, alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #F7FAFC',
              }}>
                <div style={{ fontSize: 11, color: '#A0AEC0', fontFamily: 'monospace' }}>{entry.timestamp.replace('2026-05-', 'May ').replace('2026-05-1', 'May 1')}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2535' }}>{entry.action}</div>
                <div style={{ fontSize: 11, color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.user}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0', fontFamily: 'monospace' }}>{entry.ip}</div>
                <div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: entry.status === 'success' ? '#F0FFF4' : entry.status === 'warning' ? '#FFFBEB' : '#FFF5F5',
                    color:      entry.status === 'success' ? '#276749' : entry.status === 'warning' ? '#D97706' : '#C53030',
                  }}>
                    {entry.status === 'success' ? '✓ OK' : entry.status === 'warning' ? '⚠ Warn' : '✕ Err'}
                  </span>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              <button style={{ padding: '9px 24px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Загрузить ещё
              </button>
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  )
}
