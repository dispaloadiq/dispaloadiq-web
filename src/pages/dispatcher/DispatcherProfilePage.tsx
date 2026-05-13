import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type RequestStatus = 'pending' | 'accepted' | 'declined' | 'trial'
type ClientStatus  = 'active' | 'paused' | 'ended'

interface HireRequest {
  id: string
  ownerName: string
  company: string
  trucks: number
  truckType: string
  lanes: string
  rpmOffered: number
  message: string
  receivedAt: string
  status: RequestStatus
}

interface ActiveClient {
  id: string
  ownerName: string
  company: string
  trucks: number
  truckType: string
  contractSince: string
  monthlyRevenue: number
  loadsThisMonth: number
  avgRpm: number
  status: ClientStatus
  lastLoad: string
}

interface EarningsEntry {
  week: string
  revenue: number
  loads: number
  clients: number
}

interface ProfileData {
  displayName: string
  title: string
  bio: string
  specialties: string[]
  truckTypes: string[]
  languages: string[]
  yearsExp: number
  ratePercent: number
  rateFlat: number
  minTrucks: number
  maxTrucks: number
  rpmGuarantee: number
  trialAvailable: boolean
  trialDays: number
  responseTime: string
  timezone: string
  availableSlots: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const REQUESTS: HireRequest[] = [
  {
    id: 'r1',
    ownerName: 'Marcus Johnson',
    company: 'MJ Freight LLC',
    trucks: 2,
    truckType: 'Dry Van',
    lanes: 'TX–CA, TX–FL',
    rpmOffered: 2.65,
    message: 'Looking for experienced dispatcher for 2 vans on southern lanes. Need someone who responds fast and knows DAT well.',
    receivedAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'r2',
    ownerName: 'Elena Vasquez',
    company: 'Vasquez Transport',
    trucks: 1,
    truckType: 'Reefer',
    lanes: 'Midwest loop',
    rpmOffered: 2.80,
    message: 'Single reefer truck, mostly produce lanes. Need temp-monitoring experience.',
    receivedAt: '5 hours ago',
    status: 'pending',
  },
  {
    id: 'r3',
    ownerName: 'David Park',
    company: 'Park Logistics',
    trucks: 3,
    truckType: 'Flatbed',
    lanes: 'National',
    rpmOffered: 2.55,
    message: 'Three flatbeds — steel and heavy equipment. Oversize experience preferred.',
    receivedAt: '1 day ago',
    status: 'trial',
  },
  {
    id: 'r4',
    ownerName: 'Tanya Moore',
    company: 'Moore Moving',
    trucks: 1,
    truckType: 'Dry Van',
    lanes: 'NE corridor',
    rpmOffered: 2.45,
    message: 'New O/O, 1 truck, need mentor-style dispatcher.',
    receivedAt: '2 days ago',
    status: 'declined',
  },
]

const CLIENTS: ActiveClient[] = [
  {
    id: 'c1',
    ownerName: 'James Rivera',
    company: 'Rivera Trucking',
    trucks: 3,
    truckType: 'Dry Van',
    contractSince: 'Jan 2024',
    monthlyRevenue: 1240,
    loadsThisMonth: 18,
    avgRpm: 2.71,
    status: 'active',
    lastLoad: 'Today, 09:14',
  },
  {
    id: 'c2',
    ownerName: 'Sarah Kim',
    company: 'SK Express',
    trucks: 2,
    truckType: 'Reefer',
    contractSince: 'Mar 2024',
    monthlyRevenue: 870,
    loadsThisMonth: 11,
    avgRpm: 2.83,
    status: 'active',
    lastLoad: 'Yesterday',
  },
  {
    id: 'c3',
    ownerName: 'Tom Bridges',
    company: 'Bridges Freight',
    trucks: 1,
    truckType: 'Flatbed',
    contractSince: 'Apr 2024',
    monthlyRevenue: 390,
    loadsThisMonth: 6,
    avgRpm: 2.58,
    status: 'active',
    lastLoad: '2 days ago',
  },
  {
    id: 'c4',
    ownerName: 'Nina Okafor',
    company: 'NoKa Dispatch Co.',
    trucks: 4,
    truckType: 'Dry Van',
    contractSince: 'Nov 2023',
    monthlyRevenue: 0,
    loadsThisMonth: 0,
    avgRpm: 2.64,
    status: 'paused',
    lastLoad: '3 weeks ago',
  },
]

const EARNINGS: EarningsEntry[] = [
  { week: 'Wk 18', revenue: 2380, loads: 29, clients: 4 },
  { week: 'Wk 19', revenue: 2610, loads: 33, clients: 4 },
  { week: 'Wk 20', revenue: 2200, loads: 27, clients: 3 },
  { week: 'Wk 21', revenue: 2790, loads: 35, clients: 4 },
  { week: 'Wk 22', revenue: 2500, loads: 31, clients: 4 },
]

const INIT_PROFILE: ProfileData = {
  displayName: 'Alex Petrov',
  title: 'Senior Freight Dispatcher · 7 yrs',
  bio: 'Specialized in dry van and reefer loads across continental US. DAT, Truckstop.com, and direct broker relationships. I treat your truck like my own business.',
  specialties: ['DAT Expert', 'Rate Negotiation', 'Broker Relations', 'IFTA Reports'],
  truckTypes: ['Dry Van', 'Reefer', 'Step Deck'],
  languages: ['English', 'Russian'],
  yearsExp: 7,
  ratePercent: 8,
  rateFlat: 0,
  minTrucks: 1,
  maxTrucks: 6,
  rpmGuarantee: 2.55,
  trialAvailable: true,
  trialDays: 7,
  responseTime: '< 30 min',
  timezone: 'EST',
  availableSlots: 2,
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending:  '#ECC94B',
  accepted: '#48BB78',
  trial:    '#4BAED4',
  declined: '#FC8181',
}
const STATUS_LABELS: Record<RequestStatus, string> = {
  pending:  'Ожидает',
  accepted: 'Принят',
  trial:    'Пробный',
  declined: 'Отклонён',
}

const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  active: '#48BB78',
  paused: '#ECC94B',
  ended:  '#A0AEC0',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RequestCard({
  req,
  onAccept,
  onDecline,
  onMessage,
}: {
  req: HireRequest
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onMessage: (req: HireRequest) => void
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 20,
      border: req.status === 'pending' ? '2px solid #4BAED4' : '1.5px solid #E2E8F0',
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1A2535' }}>{req.ownerName}</div>
          <div style={{ fontSize: 13, color: '#718096' }}>{req.company} · {req.trucks} truck{req.trucks > 1 ? 's' : ''} · {req.truckType}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{
            background: STATUS_COLORS[req.status] + '22',
            color: STATUS_COLORS[req.status],
            borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700,
          }}>{STATUS_LABELS[req.status]}</span>
          <span style={{ fontSize: 11, color: '#A0AEC0' }}>{req.receivedAt}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 10, fontSize: 13 }}>
        <div><span style={{ color: '#718096' }}>Маршруты: </span><strong>{req.lanes}</strong></div>
        <div><span style={{ color: '#718096' }}>RPM: </span><strong style={{ color: '#48BB78' }}>${req.rpmOffered.toFixed(2)}</strong></div>
      </div>

      <div style={{
        background: '#F7FAFC', borderRadius: 8, padding: '10px 12px',
        fontSize: 13, color: '#4A5568', fontStyle: 'italic', marginBottom: 12,
      }}>
        "{req.message}"
      </div>

      {req.status === 'pending' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onAccept(req.id)} style={{
            flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#48BB78', color: '#fff', fontWeight: 700, fontSize: 13,
          }}>✓ Принять</button>
          <button onClick={() => onDecline(req.id)} style={{
            flex: 1, padding: '8px', borderRadius: 8,
            border: '1.5px solid #FC8181', cursor: 'pointer',
            background: '#fff', color: '#FC8181', fontWeight: 700, fontSize: 13,
          }}>✕ Отклонить</button>
          <button onClick={() => onMessage(req)} style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1.5px solid #CBD5E0', cursor: 'pointer',
            background: '#fff', color: '#4A5568', fontSize: 13,
          }}>💬</button>
        </div>
      )}
      {req.status === 'trial' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onAccept(req.id)} style={{
            flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#4BAED4', color: '#fff', fontWeight: 700, fontSize: 13,
          }}>✓ Принять в клиенты</button>
          <button onClick={() => onMessage(req)} style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1.5px solid #CBD5E0', cursor: 'pointer',
            background: '#fff', color: '#4A5568', fontSize: 13,
          }}>💬 Написать</button>
        </div>
      )}
      {(req.status === 'accepted' || req.status === 'declined') && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onMessage(req)} style={{
            padding: '8px 14px', borderRadius: 8,
            border: '1.5px solid #CBD5E0', cursor: 'pointer',
            background: '#fff', color: '#4A5568', fontSize: 13,
          }}>💬 Написать</button>
        </div>
      )}
    </div>
  )
}

function ClientCard({ client }: { client: ActiveClient }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 18,
      border: '1.5px solid #E2E8F0', marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2535' }}>{client.ownerName}</div>
          <div style={{ fontSize: 12, color: '#718096' }}>{client.company} · с {client.contractSince}</div>
        </div>
        <span style={{
          background: CLIENT_STATUS_COLORS[client.status] + '22',
          color: CLIENT_STATUS_COLORS[client.status],
          borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700,
        }}>
          {client.status === 'active' ? 'Активен' : client.status === 'paused' ? 'Пауза' : 'Завершён'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, marginBottom: 10 }}>
        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '6px 12px' }}>
          <div style={{ color: '#718096', fontSize: 11, marginBottom: 2 }}>Грузовики</div>
          <div style={{ fontWeight: 700, color: '#1A2535' }}>{client.trucks} × {client.truckType}</div>
        </div>
        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '6px 12px' }}>
          <div style={{ color: '#718096', fontSize: 11, marginBottom: 2 }}>Доход / мес</div>
          <div style={{ fontWeight: 700, color: '#48BB78' }}>${client.monthlyRevenue.toLocaleString()}</div>
        </div>
        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '6px 12px' }}>
          <div style={{ color: '#718096', fontSize: 11, marginBottom: 2 }}>Рейсов / мес</div>
          <div style={{ fontWeight: 700, color: '#1A2535' }}>{client.loadsThisMonth}</div>
        </div>
        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '6px 12px' }}>
          <div style={{ color: '#718096', fontSize: 11, marginBottom: 2 }}>Avg RPM</div>
          <div style={{ fontWeight: 700, color: '#4BAED4' }}>${client.avgRpm.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#A0AEC0' }}>Последний рейс: {client.lastLoad}</div>
    </div>
  )
}

function EditProfileModal({ profile, onSave, onClose }: {
  profile: ProfileData
  onSave: (p: ProfileData) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<ProfileData>({ ...profile })
  const [specialtyInput, setSpecialtyInput] = useState('')

  const set = (key: keyof ProfileData, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      set('specialties', [...form.specialties, specialtyInput.trim()])
      setSpecialtyInput('')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflow: 'auto', padding: 28,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2535' }}>✏️ Редактировать профиль</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>

        {/* Basic info */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>ИМЯ / ПСЕВДОНИМ</label>
          <input value={form.displayName} onChange={e => set('displayName', e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>ЗАГОЛОВОК ПРОФИЛЯ</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>О СЕБЕ</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={4}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        {/* Rate */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>СТАВКА (%)</label>
            <input type="number" value={form.ratePercent} onChange={e => set('ratePercent', +e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>ГАРАНТИЯ RPM ($)</label>
            <input type="number" step="0.01" value={form.rpmGuarantee} onChange={e => set('rpmGuarantee', +e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Availability */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>СВОБОДНЫХ СЛОТОВ</label>
            <input type="number" min={0} max={20} value={form.availableSlots} onChange={e => set('availableSlots', +e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>МАКС. ГРУЗОВИКОВ</label>
            <input type="number" value={form.maxTrucks} onChange={e => set('maxTrucks', +e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Trial */}
        <div style={{
          background: '#F7FAFC', borderRadius: 10, padding: 16, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#1A2535' }}>
            <input type="checkbox" checked={form.trialAvailable} onChange={e => set('trialAvailable', e.target.checked)}
              style={{ width: 16, height: 16 }} />
            Пробный период доступен
          </label>
          {form.trialAvailable && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" value={form.trialDays} onChange={e => set('trialDays', +e.target.value)} min={1} max={30}
                style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, textAlign: 'center' }} />
              <span style={{ fontSize: 13, color: '#718096' }}>дней</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 8 }}>СПЕЦИАЛИЗАЦИИ</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {form.specialties.map((s, i) => (
              <span key={i} style={{
                background: '#EBF8FF', color: '#2B6CB0', borderRadius: 6, padding: '4px 10px', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {s}
                <button onClick={() => set('specialties', form.specialties.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FC8181', fontWeight: 700, padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSpecialty()}
              placeholder="Добавить специализацию..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }} />
            <button onClick={addSpecialty} style={{
              padding: '8px 14px', borderRadius: 8, background: '#4BAED4', color: '#fff',
              border: 'none', cursor: 'pointer', fontWeight: 700,
            }}>+</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={() => onSave(form)} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', color: '#fff', fontWeight: 700, fontSize: 15,
          }}>💾 Сохранить профиль</button>
          <button onClick={onClose} style={{
            padding: '12px 20px', borderRadius: 10, border: '1.5px solid #CBD5E0',
            background: '#fff', color: '#718096', cursor: 'pointer', fontWeight: 600, fontSize: 15,
          }}>Отмена</button>
        </div>
      </div>
    </div>
  )
}

function MessageModal({ name, onClose }: { name: string; onClose: () => void }) {
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (msg.trim()) { setSent(true); setTimeout(onClose, 1400) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1A2535' }}>💬 Написать {name}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 16, color: '#48BB78', fontWeight: 700 }}>
            ✓ Сообщение отправлено!
          </div>
        ) : (
          <>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Введите сообщение..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, resize: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
            <button onClick={send} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', color: '#fff', fontWeight: 700, fontSize: 15,
            }}>Отправить</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DispatcherProfilePage() {
  const [tab, setTab] = useState<'requests' | 'clients' | 'earnings' | 'profile'>('requests')
  const [requests, setRequests] = useState<HireRequest[]>(REQUESTS)
  const [available, setAvailable] = useState(true)
  const [profile, setProfile] = useState<ProfileData>(INIT_PROFILE)
  const [showEditModal, setShowEditModal] = useState(false)
  const [msgTarget, setMsgTarget] = useState<{ name: string } | null>(null)

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const activeClients = CLIENTS.filter(c => c.status === 'active')
  const totalMonthlyRevenue = activeClients.reduce((s, c) => s + c.monthlyRevenue, 0)
  const maxEarning = Math.max(...EARNINGS.map(e => e.revenue))

  const handleAccept = (id: string) =>
    setRequests(r => r.map(x => x.id === id ? { ...x, status: 'accepted' } : x))
  const handleDecline = (id: string) =>
    setRequests(r => r.map(x => x.id === id ? { ...x, status: 'declined' } : x))

  const TABS: { key: typeof tab; label: string; badge?: number }[] = [
    { key: 'requests', label: '📥 Запросы', badge: pendingCount },
    { key: 'clients',  label: '🚛 Клиенты' },
    { key: 'earnings', label: '💰 Заработок' },
    { key: 'profile',  label: '⭐ Мой профиль' },
  ]

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>

      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1A2535 0%,#2D4A6B 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0,
          border: '3px solid rgba(255,255,255,.2)',
        }}>
          {profile.displayName.charAt(0)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{profile.displayName}</span>
            <span style={{
              background: 'rgba(75,174,212,.25)', color: '#4BAED4',
              borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700,
            }}>✓ Platform Verified</span>
            <span style={{
              background: available ? 'rgba(72,187,120,.25)' : 'rgba(160,174,192,.2)',
              color: available ? '#48BB78' : '#A0AEC0',
              borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700,
            }}>{available ? '🟢 Доступен' : '⛔ Занят'}</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>{profile.title}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
            <span>⭐ 4.9 рейтинг</span>
            <span>📦 312 рейсов</span>
            <span>👥 {activeClients.length} активных клиентов</span>
            <span>💰 ${profile.rpmGuarantee.toFixed(2)} RPM гарантия</span>
          </div>
        </div>

        {/* Availability toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <button onClick={() => setAvailable(v => !v)} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: available ? '#48BB78' : '#718096',
            color: '#fff', fontWeight: 700, fontSize: 13,
            transition: 'background .2s',
          }}>
            {available ? '🟢 Принимаю клиентов' : '⛔ Не принимаю'}
          </button>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textAlign: 'right' }}>
            {profile.availableSlots} свободных слота
          </div>
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Запросов', value: pendingCount, sub: 'ожидают ответа', color: pendingCount > 0 ? '#ECC94B' : '#A0AEC0', icon: '📥' },
          { label: 'Активных клиентов', value: activeClients.length, sub: `из ${CLIENTS.length} всего`, color: '#48BB78', icon: '🚛' },
          { label: 'Доход / месяц', value: `$${totalMonthlyRevenue.toLocaleString()}`, sub: `${activeClients.reduce((s, c) => s + c.loadsThisMonth, 0)} рейсов`, color: '#4BAED4', icon: '💰' },
          { label: 'Avg RPM', value: `$${(activeClients.reduce((s, c) => s + c.avgRpm, 0) / (activeClients.length || 1)).toFixed(2)}`, sub: 'по всем клиентам', color: '#9F7AEA', icon: '📈' },
        ].map(k => (
          <div key={k.label} style={{
            background: '#fff', borderRadius: 12, padding: '16px 18px',
            border: '1.5px solid #E2E8F0',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{k.sub}</div>
            <div style={{ fontSize: 12, color: '#A0AEC0' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#F7FAFC', borderRadius: 12, padding: 6 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#fff' : 'transparent',
            color: tab === t.key ? '#1A2535' : '#718096',
            fontWeight: tab === t.key ? 700 : 500, fontSize: 13,
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all .15s',
          }}>
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span style={{
                background: '#E53E3E', color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, lineHeight: 1,
              }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}

      {/* REQUESTS */}
      {tab === 'requests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1A2535' }}>
              Входящие запросы
              {pendingCount > 0 && (
                <span style={{
                  marginLeft: 10, background: '#FED7D7', color: '#E53E3E',
                  borderRadius: 6, padding: '2px 10px', fontSize: 13, fontWeight: 700,
                }}>{pendingCount} новых</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#A0AEC0' }}>{requests.length} всего</div>
          </div>

          {requests.filter(r => r.status === 'pending' || r.status === 'trial').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#A0AEC0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Нет новых запросов</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Когда клиенты найдут ваш профиль, запросы появятся здесь</div>
            </div>
          ) : (
            requests
              .filter(r => r.status === 'pending' || r.status === 'trial')
              .map(r => (
                <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline}
                  onMessage={req => setMsgTarget({ name: req.ownerName })} />
              ))
          )}

          {requests.filter(r => r.status === 'declined' || r.status === 'accepted').length > 0 && (
            <>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#A0AEC0', margin: '20px 0 12px' }}>Архив</div>
              {requests.filter(r => r.status === 'declined' || r.status === 'accepted').map(r => (
                <RequestCard key={r.id} req={r} onAccept={handleAccept} onDecline={handleDecline}
                  onMessage={req => setMsgTarget({ name: req.ownerName })} />
              ))}
            </>
          )}
        </div>
      )}

      {/* CLIENTS */}
      {tab === 'clients' && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1A2535', marginBottom: 16 }}>
            Мои клиенты
            <span style={{ marginLeft: 10, fontSize: 14, color: '#718096', fontWeight: 400 }}>
              {activeClients.length} активных
            </span>
          </div>
          {CLIENTS.map(c => <ClientCard key={c.id} client={c} />)}
        </div>
      )}

      {/* EARNINGS */}
      {tab === 'earnings' && (
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#1A2535', marginBottom: 20 }}>Заработок</div>

          {/* Weekly bar chart */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 20,
            border: '1.5px solid #E2E8F0',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2535', marginBottom: 16 }}>Доход по неделям ($)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 140 }}>
              {EARNINGS.map(e => (
                <div key={e.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4BAED4' }}>${e.revenue.toLocaleString()}</div>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: 'linear-gradient(180deg,#4BAED4,#2D7A9A)',
                    height: `${(e.revenue / maxEarning) * 100}px`,
                    minHeight: 4,
                    transition: 'height .3s',
                  }} />
                  <div style={{ fontSize: 12, color: '#718096' }}>{e.week}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown table */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 14, color: '#1A2535' }}>
              Разбивка по неделям
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F7FAFC' }}>
                  {['Неделя', 'Доход', 'Рейсов', 'Клиентов', 'Avg/рейс'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: '#718096', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EARNINGS.map((e, i) => (
                  <tr key={e.week} style={{ borderTop: '1px solid #E2E8F0', background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600 }}>{e.week}</td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: '#48BB78' }}>${e.revenue.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px' }}>{e.loads}</td>
                    <td style={{ padding: '10px 16px' }}>{e.clients}</td>
                    <td style={{ padding: '10px 16px', color: '#4BAED4', fontWeight: 600 }}>
                      ${(e.revenue / e.loads).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary card */}
          <div style={{
            background: 'linear-gradient(135deg,#1A2535,#2D4A6B)',
            borderRadius: 14, padding: '20px 24px', color: '#fff',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'rgba(255,255,255,.7)' }}>МАЙ 2026 — ИТОГ</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Общий доход', value: `$${EARNINGS.reduce((s, e) => s + e.revenue, 0).toLocaleString()}` },
                { label: 'Всего рейсов', value: EARNINGS.reduce((s, e) => s + e.loads, 0) },
                { label: 'Avg доход/нед', value: `$${Math.round(EARNINGS.reduce((s, e) => s + e.revenue, 0) / EARNINGS.length).toLocaleString()}` },
              ].map(k => (
                <div key={k.label}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#4BAED4' }}>{k.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE */}
      {tab === 'profile' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#1A2535' }}>Мой публичный профиль</div>
            <button onClick={() => setShowEditModal(true)} style={{
              padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', color: '#fff', fontWeight: 700, fontSize: 13,
            }}>✏️ Редактировать</button>
          </div>

          {/* Preview card */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg,#1A2535,#2D4A6B)',
              padding: '20px 24px',
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{profile.displayName}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{profile.title}</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.6, marginBottom: 20 }}>{profile.bio}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 8 }}>УСЛОВИЯ РАБОТЫ</div>
                  {[
                    { label: 'Ставка', value: `${profile.ratePercent}%` },
                    { label: 'RPM гарантия', value: `$${profile.rpmGuarantee.toFixed(2)}` },
                    { label: 'Грузовики', value: `${profile.minTrucks}–${profile.maxTrucks} шт` },
                    { label: 'Пробный период', value: profile.trialAvailable ? `${profile.trialDays} дней` : 'Нет' },
                    { label: 'Время ответа', value: profile.responseTime },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0F4F8', fontSize: 13 }}>
                      <span style={{ color: '#718096' }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: '#1A2535' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 8 }}>СПЕЦИАЛИЗАЦИИ</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.specialties.map(s => (
                      <span key={s} style={{
                        background: '#EBF8FF', color: '#2B6CB0', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                      }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', margin: '16px 0 8px' }}>ТИПЫ ТРАНСПОРТА</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {profile.truckTypes.map(t => (
                      <span key={t} style={{
                        background: '#F0FFF4', color: '#276749', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                      }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', margin: '16px 0 8px' }}>ЯЗЫКИ</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {profile.languages.map(l => (
                      <span key={l} style={{
                        background: '#FAF5FF', color: '#553C9A', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                      }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                background: '#F7FAFC', borderRadius: 10, padding: '12px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 13,
              }}>
                <span style={{ color: '#718096' }}>👁 Видимость профиля</span>
                <span style={{ fontWeight: 700, color: '#48BB78' }}>
                  {available ? `✅ Открыт — ${profile.availableSlots} слота` : '⛔ Скрыт'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onSave={p => { setProfile(p); setShowEditModal(false) }}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {msgTarget && (
        <MessageModal name={msgTarget.name} onClose={() => setMsgTarget(null)} />
      )}
    </div>
  )
}
