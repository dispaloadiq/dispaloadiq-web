import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────
type TripStatus =
  | 'confirmed'
  | 'enroute_pickup'
  | 'loaded'
  | 'in_transit'
  | 'delivered'
  | 'pod_submitted'
  | 'invoiced'
  | 'paid'
  | 'issue'

interface TripExpense {
  id: string
  category: 'fuel' | 'lumper' | 'toll' | 'scale' | 'detention' | 'other'
  desc: string
  amount: number
  reimbursable: boolean
}

interface TripDocument {
  name: string
  type: 'rc' | 'bol' | 'pod' | 'invoice' | 'other'
  status: 'pending' | 'uploaded' | 'verified'
}

interface TripEvent {
  time: string
  text: string
  icon: string
}

interface Trip {
  id: string
  status: TripStatus
  orderRef: string
  broker: string
  brokerMC: string
  brokerContact: string
  brokerPhone: string
  payTerms: string
  shipper: string
  shipperAddress: string
  consignee: string
  consigneeAddress: string
  pickupDate: string
  deliveryDate: string
  actualPickup?: string
  actualDelivery?: string
  commodity: string
  weight: number
  pieces: number
  hazmat: boolean
  tempControl?: string
  truckType: string
  miles: number
  deadheadMiles: number
  grossRate: number
  driverName?: string   // company only
  truckPlate?: string   // company only
  expenses: TripExpense[]
  documents: TripDocument[]
  timeline: TripEvent[]
  notes: string
  invoiceNum?: string
  invoiceSentDate?: string
  paidDate?: string
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_PIPE: TripStatus[] = [
  'confirmed', 'enroute_pickup', 'loaded',
  'in_transit', 'delivered', 'pod_submitted', 'invoiced', 'paid',
]

const STATUS_CONF: Record<TripStatus, { label: string; icon: string; color: string; bg: string }> = {
  confirmed:      { label: 'Подтверждён',  icon: '✅', color: '#276749', bg: '#F0FFF4' },
  enroute_pickup: { label: 'Едет на загр.', icon: '🚛', color: '#2B6CB0', bg: '#EBF8FF' },
  loaded:         { label: 'Загружен',      icon: '📦', color: '#553C9A', bg: '#FAF5FF' },
  in_transit:     { label: 'В пути',        icon: '🛣️', color: '#2C5282', bg: '#EBF8FF' },
  delivered:      { label: 'Доставлен',     icon: '🏁', color: '#276749', bg: '#F0FFF4' },
  pod_submitted:  { label: 'POD отправлен', icon: '📄', color: '#975A16', bg: '#FFFFF0' },
  invoiced:       { label: 'Инвойс выслан', icon: '🧾', color: '#702459', bg: '#FFF5F7' },
  paid:           { label: 'Оплачен',       icon: '💰', color: '#276749', bg: '#F0FFF4' },
  issue:          { label: 'Проблема',      icon: '⚠️', color: '#C53030', bg: '#FFF5F5' },
}

const DOC_TYPES: Record<string, { label: string; icon: string }> = {
  rc:      { label: 'Rate Confirmation', icon: '📑' },
  bol:     { label: 'Bill of Lading',    icon: '📋' },
  pod:     { label: 'Proof of Delivery', icon: '📄' },
  invoice: { label: 'Invoice',           icon: '🧾' },
  other:   { label: 'Прочее',            icon: '📎' },
}

const EXP_ICONS: Record<string, string> = {
  fuel: '⛽', lumper: '👷', toll: '🛣️', scale: '⚖️', detention: '⏱️', other: '💸',
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const TRIPS: Trip[] = [
  {
    id: 'TRP-20045',
    status: 'in_transit',
    orderRef: 'TQL-8847-221',
    broker: 'TQL',
    brokerMC: 'MC-449629',
    brokerContact: 'Sarah Mitchell',
    brokerPhone: '(513) 831-2600',
    payTerms: 'Quick Pay 2%',
    shipper: 'Walmart DC #6021',
    shipperAddress: '501 S Walton Blvd, Bentonville, AR 72716',
    consignee: 'Walmart Store #4412',
    consigneeAddress: '2701 E Mockingbird Ln, Dallas, TX 75214',
    pickupDate:  'May 10, 08:00',
    deliveryDate: 'May 11, 14:00',
    actualPickup: 'May 10, 09:22',
    commodity: 'General Merchandise',
    weight: 42000,
    pieces: 26,
    hazmat: false,
    truckType: 'Dry Van 53\'',
    miles: 619,
    deadheadMiles: 48,
    grossRate: 1514,
    driverName: 'Mike Rodriguez',
    truckPlate: 'IL 4829-XR',
    expenses: [
      { id: 'e1', category: 'fuel',     desc: 'Pilot Loves Park #412',  amount: 234.50, reimbursable: false },
      { id: 'e2', category: 'fuel',     desc: 'TA Joplin #201',         amount: 198.20, reimbursable: false },
      { id: 'e3', category: 'toll',     desc: 'I-44 Missouri',          amount: 12.80,  reimbursable: true  },
      { id: 'e4', category: 'scale',    desc: 'Weigh station AR',       amount: 0,      reimbursable: false },
    ],
    documents: [
      { name: 'Rate Confirmation.pdf',  type: 'rc',      status: 'verified' },
      { name: 'BOL-20045.pdf',          type: 'bol',     status: 'uploaded' },
      { name: 'POD.pdf',               type: 'pod',     status: 'pending' },
      { name: 'Invoice-20045.pdf',      type: 'invoice', status: 'pending' },
    ],
    timeline: [
      { time: 'May 10, 06:15', text: 'Рейс подтверждён. Rate Con получен от TQL.', icon: '✅' },
      { time: 'May 10, 07:40', text: 'Выезд на загрузку. Departure Bentonville.',  icon: '🚛' },
      { time: 'May 10, 09:22', text: 'Прибыл на погрузку. Check-in у двери #8.',  icon: '📍' },
      { time: 'May 10, 11:45', text: 'Загрузка завершена. 26 pallets / 42,000 lbs. BOL подписан.', icon: '📦' },
      { time: 'May 10, 12:01', text: 'Выезд с погрузки. В пути на Даллас.',        icon: '🛣️' },
    ],
    notes: 'Receiver требует appointment — записан на 14:00. Lumper оплачивается shipper-ом по BOL.',
  },
  {
    id: 'TRP-20044',
    status: 'invoiced',
    orderRef: 'ECHO-44129',
    broker: 'Echo Global Logistics',
    brokerMC: 'MC-517635',
    brokerContact: 'James Cooper',
    brokerPhone: '(800) 354-7993',
    payTerms: 'Net 30',
    shipper: 'Amazon Fulfillment ONT8',
    shipperAddress: '4245 Etiwanda Ave, Ontario, CA 91761',
    consignee: 'Amazon Sort Center PHX3',
    consigneeAddress: '2350 W Pinnacle Peak Rd, Phoenix, AZ 85027',
    pickupDate:  'May 8, 07:00',
    deliveryDate: 'May 8, 19:00',
    actualPickup: 'May 8, 07:15',
    actualDelivery: 'May 8, 18:42',
    commodity: 'Mixed Consumer Goods',
    weight: 39500,
    pieces: 34,
    hazmat: false,
    truckType: 'Dry Van 53\'',
    miles: 371,
    deadheadMiles: 22,
    grossRate: 1122,
    driverName: 'Anna Perez',
    truckPlate: 'CA 8812-PP',
    expenses: [
      { id: 'e1', category: 'fuel',  desc: 'Love\'s Fontana #88',   amount: 148.30, reimbursable: false },
      { id: 'e2', category: 'toll',  desc: 'I-10 AZ toll',          amount: 8.50,   reimbursable: false },
    ],
    documents: [
      { name: 'Rate Confirmation.pdf', type: 'rc',      status: 'verified' },
      { name: 'BOL-20044.pdf',         type: 'bol',     status: 'verified' },
      { name: 'POD-20044-signed.pdf',  type: 'pod',     status: 'verified' },
      { name: 'Invoice-20044.pdf',     type: 'invoice', status: 'uploaded' },
    ],
    timeline: [
      { time: 'May 8, 07:15',  text: 'Загрузка начата. Dock #14.',                   icon: '📦' },
      { time: 'May 8, 08:30',  text: 'Выезд. 34 pallets / 39,500 lbs.',             icon: '🚛' },
      { time: 'May 8, 18:42',  text: 'Доставка выполнена. POD подписан.',            icon: '🏁' },
      { time: 'May 9, 09:00',  text: 'POD загружен в систему.',                      icon: '📄' },
      { time: 'May 9, 09:15',  text: 'Инвойс #INV-20044 отправлен Echo Global.',     icon: '🧾' },
    ],
    invoiceNum: 'INV-20044',
    invoiceSentDate: 'May 9',
    notes: 'Net 30 — оплата ожидается до Jun 8.',
  },
  {
    id: 'TRP-20043',
    status: 'paid',
    orderRef: 'COYOTE-9901',
    broker: 'Coyote Logistics',
    brokerMC: 'MC-488819',
    brokerContact: 'Lisa Romano',
    brokerPhone: '(877) 626-9683',
    payTerms: 'Quick Pay 1.5%',
    shipper: 'Procter & Gamble DC',
    shipperAddress: '8700 Mason-Montgomery Rd, Mason, OH 45040',
    consignee: 'Target DC #0500',
    consigneeAddress: '3501 Algonquin Rd, Rolling Meadows, IL 60008',
    pickupDate:  'May 5, 06:00',
    deliveryDate: 'May 5, 18:00',
    actualPickup: 'May 5, 06:30',
    actualDelivery: 'May 5, 17:55',
    commodity: 'Household Products',
    weight: 44200,
    pieces: 28,
    hazmat: false,
    truckType: 'Dry Van 53\'',
    miles: 303,
    deadheadMiles: 15,
    grossRate: 878,
    driverName: 'Mike Rodriguez',
    truckPlate: 'IL 4829-XR',
    expenses: [
      { id: 'e1', category: 'fuel',      desc: 'TA Blue Ash #88',        amount: 112.40, reimbursable: false },
      { id: 'e2', category: 'toll',      desc: 'I-90 Illinois',          amount: 6.30,   reimbursable: false },
      { id: 'e3', category: 'lumper',    desc: 'Target DC unload',       amount: 75.00,  reimbursable: true  },
      { id: 'e4', category: 'detention', desc: '2ч detention на загрузке', amount: 100, reimbursable: true },
    ],
    documents: [
      { name: 'Rate Confirmation.pdf', type: 'rc',      status: 'verified' },
      { name: 'BOL-20043.pdf',         type: 'bol',     status: 'verified' },
      { name: 'POD-20043.pdf',         type: 'pod',     status: 'verified' },
      { name: 'Invoice-20043.pdf',     type: 'invoice', status: 'verified' },
    ],
    timeline: [
      { time: 'May 5, 06:30',  text: 'Прибыл на погрузку.',                icon: '📍' },
      { time: 'May 5, 08:45',  text: 'Загружен. 28 pallets.',               icon: '📦' },
      { time: 'May 5, 17:55',  text: 'Доставлен. POD получен.',             icon: '🏁' },
      { time: 'May 6, 09:00',  text: 'Инвойс отправлен.',                   icon: '🧾' },
      { time: 'May 8, 14:20',  text: 'Оплата получена — $864.82 (QP 1.5%)', icon: '💰' },
    ],
    invoiceNum: 'INV-20043',
    invoiceSentDate: 'May 6',
    paidDate: 'May 8',
    notes: 'Quick pay применён — скидка $13.17 (1.5%).',
  },
  {
    id: 'TRP-20046',
    status: 'confirmed',
    orderRef: 'WWX-662-A',
    broker: 'Worldwide Express',
    brokerMC: 'MC-529472',
    brokerContact: 'Tom Henderson',
    brokerPhone: '(800) 758-7447',
    payTerms: 'Net 21',
    shipper: 'Home Depot DC #7019',
    shipperAddress: '3800 W Sam Houston Pkwy N, Houston, TX 77043',
    consignee: 'Home Depot #0536',
    consigneeAddress: '4001 S Lamar Blvd, Austin, TX 78704',
    pickupDate:  'May 13, 07:00',
    deliveryDate: 'May 13, 14:00',
    commodity: 'Building Materials',
    weight: 38000,
    pieces: 22,
    hazmat: false,
    truckType: 'Dry Van 53\'',
    miles: 162,
    deadheadMiles: 35,
    grossRate: 545,
    driverName: 'Tom Bradley',
    truckPlate: 'TX 2201-BB',
    expenses: [],
    documents: [
      { name: 'Rate Confirmation.pdf', type: 'rc', status: 'verified' },
      { name: 'BOL',                   type: 'bol', status: 'pending' },
      { name: 'POD',                   type: 'pod', status: 'pending' },
      { name: 'Invoice',               type: 'invoice', status: 'pending' },
    ],
    timeline: [
      { time: 'May 11, 16:40', text: 'Рейс забронирован через Worldwide Express.', icon: '✅' },
      { time: 'May 11, 16:45', text: 'Rate Confirmation получен и подписан.',      icon: '📑' },
    ],
    notes: 'Pickup appointment 07:00 обязателен. Звонить Tom Bradley накануне.',
  },
  {
    id: 'TRP-20041',
    status: 'issue',
    orderRef: 'TQL-8801-19',
    broker: 'TQL',
    brokerMC: 'MC-449629',
    brokerContact: 'Sarah Mitchell',
    brokerPhone: '(513) 831-2600',
    payTerms: 'Quick Pay 2%',
    shipper: 'General Mills Dist.',
    shipperAddress: '1 General Mills Blvd, Minneapolis, MN 55426',
    consignee: 'Kroger DC #F-103',
    consigneeAddress: '6960 Professional Pkwy E, Cincinnati, OH 45069',
    pickupDate:  'May 7, 06:00',
    deliveryDate: 'May 8, 08:00',
    actualPickup: 'May 7, 07:15',
    commodity: 'Cereal / Dry Goods',
    weight: 41000,
    pieces: 30,
    hazmat: false,
    truckType: 'Dry Van 53\'',
    miles: 612,
    deadheadMiles: 88,
    grossRate: 1498,
    driverName: 'Sergiy Kovalchuk',
    truckPlate: 'FL 7731-KA',
    expenses: [
      { id: 'e1', category: 'fuel',      desc: 'Pilot Eau Claire',     amount: 201.80, reimbursable: false },
      { id: 'e2', category: 'detention', desc: 'Receiver — 4h detention', amount: 200, reimbursable: true  },
    ],
    documents: [
      { name: 'Rate Confirmation.pdf', type: 'rc',  status: 'verified' },
      { name: 'BOL-20041.pdf',         type: 'bol', status: 'uploaded' },
      { name: 'POD',                   type: 'pod', status: 'pending' },
    ],
    timeline: [
      { time: 'May 7, 07:15', text: 'Загрузка начата.',                                      icon: '📦' },
      { time: 'May 7, 09:00', text: 'В пути.',                                                icon: '🛣️' },
      { time: 'May 8, 07:30', text: 'Прибыл к получателю.',                                  icon: '📍' },
      { time: 'May 8, 11:30', text: '⚠️ Проблема: Kroger DC отказывается принять груз — расхождение в температурном журнале. Груз удерживается.', icon: '⚠️' },
    ],
    notes: '⚠️ Kroger отказался принять — ссылаются на несоответствие temp log. Нужно связаться с TQL и General Mills для разрешения ситуации.',
  },
]

// ── Add Expense Modal ─────────────────────────────────────────────────────────
function AddExpenseModal({ onSave, onClose }: {
  onSave: (e: TripExpense) => void
  onClose: () => void
}) {
  const [cat, setCat]   = useState<TripExpense['category']>('fuel')
  const [desc, setDesc] = useState('')
  const [amt, setAmt]   = useState(0)
  const [reimb, setReimb] = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 400, padding: 26 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#1A2535', marginBottom: 20 }}>➕ Добавить расход</div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>КАТЕГОРИЯ</label>
          <select value={cat} onChange={e => setCat(e.target.value as TripExpense['category'])}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}>
            {(['fuel','lumper','toll','scale','detention','other'] as const).map(c => (
              <option key={c} value={c}>{EXP_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>ОПИСАНИЕ</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Напр. TA Joplin #201"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>СУММА ($)</label>
          <input type="number" value={amt} onChange={e => setAmt(+e.target.value)} step="0.01"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" checked={reimb} onChange={e => setReimb(e.target.checked)} style={{ width: 16, height: 16 }} />
          Возмещаемый брокером / грузоотправителем
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onSave({ id: Date.now().toString(), category: cat, desc, amount: amt, reimbursable: reimb })}
            disabled={!desc || amt <= 0}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: desc && amt > 0 ? 'linear-gradient(135deg,#4BAED4,#2D7A9A)' : '#E2E8F0',
              color: desc && amt > 0 ? '#fff' : '#A0AEC0', fontWeight: 700,
            }}>Добавить</button>
          <button onClick={onClose} style={{
            padding: '11px 18px', borderRadius: 10, border: '1.5px solid #CBD5E0',
            background: '#fff', color: '#718096', cursor: 'pointer',
          }}>Отмена</button>
        </div>
      </div>
    </div>
  )
}

// ── Status Update Modal ────────────────────────────────────────────────────────
function UpdateStatusModal({ trip, onUpdate, onClose }: {
  trip: Trip
  onUpdate: (newStatus: TripStatus, note: string) => void
  onClose: () => void
}) {
  const currentIdx = STATUS_PIPE.indexOf(trip.status)
  const nextStatus = STATUS_PIPE[currentIdx + 1] as TripStatus | undefined
  const [note, setNote] = useState('')

  if (!nextStatus) return null

  const conf = STATUS_CONF[nextStatus]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 420, padding: 26 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#1A2535', marginBottom: 6 }}>
          Обновить статус
        </div>
        <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Рейс {trip.id}</div>

        <div style={{
          background: conf.bg, border: `1.5px solid ${conf.color}44`,
          borderRadius: 12, padding: 16, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 30 }}>{conf.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>НОВЫЙ СТАТУС</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: conf.color }}>{conf.label}</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 5 }}>
            ЗАМЕТКА (необязательно)
          </label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Добавьте комментарий к обновлению..."
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, resize: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onUpdate(nextStatus, note)} style={{
            flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', color: '#fff', fontWeight: 700,
          }}>{conf.icon} Обновить → {conf.label}</button>
          <button onClick={onClose} style={{
            padding: '11px 18px', borderRadius: 10, border: '1.5px solid #CBD5E0',
            background: '#fff', color: '#718096', cursor: 'pointer',
          }}>Отмена</button>
        </div>
      </div>
    </div>
  )
}

// ── Trip Detail ───────────────────────────────────────────────────────────────
function TripDetail({ trip, role, onAddExpense, onUpdateStatus }: {
  trip: Trip
  role: UserRole
  onAddExpense: (e: TripExpense) => void
  onUpdateStatus: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'cargo' | 'expenses' | 'pl' | 'docs' | 'timeline'>('overview')

  const sc = STATUS_CONF[trip.status]
  const totalExpenses = trip.expenses.reduce((s, e) => s + e.amount, 0)
  const reimbTotal    = trip.expenses.filter(e => e.reimbursable).reduce((s, e) => s + e.amount, 0)
  const netExpenses   = totalExpenses - reimbTotal
  const netProfit     = trip.grossRate + reimbTotal - totalExpenses
  const rpmGross      = trip.miles > 0 ? trip.grossRate / trip.miles : 0
  const rpmNet        = trip.miles > 0 ? netProfit / trip.miles : 0
  const cpm           = trip.miles > 0 ? netExpenses / trip.miles : 0
  const margin        = trip.grossRate > 0 ? (netProfit / trip.grossRate) * 100 : 0

  const TABS = [
    { key: 'overview',  label: '📍 Маршрут' },
    { key: 'cargo',     label: '📦 Груз' },
    { key: 'expenses',  label: `💸 Расходы${trip.expenses.length > 0 ? ` (${trip.expenses.length})` : ''}` },
    { key: 'pl',        label: '📊 P&L' },
    { key: 'docs',      label: '📄 Доки' },
    { key: 'timeline',  label: '🕐 История' },
  ] as const

  const isActive = ['confirmed','enroute_pickup','loaded','in_transit','delivered','pod_submitted'].includes(trip.status)
  const nextIdx = STATUS_PIPE.indexOf(trip.status as TripStatus)
  const hasNext = nextIdx >= 0 && nextIdx < STATUS_PIPE.length - 1 && trip.status !== 'issue'

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1A2535 0%,#2D4A6B 100%)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 700, letterSpacing: 1 }}>
              {trip.id} · {trip.orderRef}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '4px 0' }}>
              {trip.shipper.split(' ').slice(0, 2).join(' ')} → {trip.consignee.split(' ').slice(0, 2).join(' ')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
              {trip.broker} · {trip.miles} mi · {trip.truckType}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <span style={{
              background: sc.bg, color: sc.color,
              borderRadius: 8, padding: '4px 14px', fontSize: 13, fontWeight: 700,
            }}>{sc.icon} {sc.label}</span>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4BAED4' }}>
              ${trip.grossRate.toLocaleString()}
            </div>
          </div>
        </div>
        {/* Driver info (company) */}
        {trip.driverName && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>
            👤 {trip.driverName} · {trip.truckPlate}
          </div>
        )}
      </div>

      {/* Progress pipeline */}
      {trip.status !== 'issue' && (
        <div style={{ padding: '12px 24px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 520 }}>
            {STATUS_PIPE.map((s, i) => {
              const done = STATUS_PIPE.indexOf(trip.status as TripStatus) >= i
              const current = trip.status === s
              const conf = STATUS_CONF[s]
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_PIPE.length - 1 ? 1 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: done ? (current ? '#4BAED4' : conf.color) : '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, border: current ? '3px solid #fff' : 'none',
                      boxShadow: current ? '0 0 0 2px #4BAED4' : 'none',
                      color: done ? '#fff' : '#A0AEC0',
                      flexShrink: 0,
                    }}>{done ? (current ? conf.icon : '✓') : ''}</div>
                    <div style={{ fontSize: 9, color: current ? '#4BAED4' : done ? '#718096' : '#CBD5E0', fontWeight: current ? 700 : 500, whiteSpace: 'nowrap', maxWidth: 52, textAlign: 'center' }}>
                      {conf.label}
                    </div>
                  </div>
                  {i < STATUS_PIPE.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: '0 4px', marginBottom: 18,
                      background: STATUS_PIPE.indexOf(trip.status as TripStatus) > i ? '#4BAED4' : '#E2E8F0',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Issue banner */}
      {trip.status === 'issue' && (
        <div style={{
          background: '#FFF5F5', borderLeft: '4px solid #E53E3E',
          padding: '10px 24px', fontSize: 13, color: '#C53030', fontWeight: 600,
        }}>
          ⚠️ Требует внимания — {trip.notes}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #E2E8F0' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: tab === t.key ? '#fff' : '#F7FAFC',
            color: tab === t.key ? '#1A2535' : '#718096',
            fontWeight: tab === t.key ? 700 : 500, fontSize: 13,
            borderBottom: tab === t.key ? '2px solid #4BAED4' : '2px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 20, maxHeight: 420, overflowY: 'auto' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { title: '📍 Погрузка', name: trip.shipper, addr: trip.shipperAddress, date: trip.pickupDate, actual: trip.actualPickup },
                { title: '🏁 Доставка', name: trip.consignee, addr: trip.consigneeAddress, date: trip.deliveryDate, actual: trip.actualDelivery },
              ].map(loc => (
                <div key={loc.title} style={{ background: '#F7FAFC', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 6 }}>{loc.title}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2535', marginBottom: 3 }}>{loc.name}</div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 6, lineHeight: 1.4 }}>{loc.addr}</div>
                  <div style={{ fontSize: 12, color: '#4A5568' }}>
                    <div>План: <strong>{loc.date}</strong></div>
                    {loc.actual && <div style={{ color: '#48BB78' }}>Факт: {loc.actual}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>🤝 БРОКЕР</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 13 }}>
                <div><strong>{trip.broker}</strong> · {trip.brokerMC}</div>
                <div>📞 {trip.brokerPhone}</div>
                <div>👤 {trip.brokerContact}</div>
                <div style={{ fontWeight: 700, color: '#4BAED4' }}>Оплата: {trip.payTerms}</div>
              </div>
            </div>
            {trip.notes && (
              <div style={{ background: '#FFFFF0', border: '1px solid #ECC94B', borderRadius: 10, padding: 14, fontSize: 13, color: '#744210' }}>
                📌 {trip.notes}
              </div>
            )}
          </div>
        )}

        {/* CARGO */}
        {tab === 'cargo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Товар',        value: trip.commodity },
              { label: 'Вес',          value: `${trip.weight.toLocaleString()} lbs` },
              { label: 'Мест',         value: `${trip.pieces} pallets` },
              { label: 'Тип трака',    value: trip.truckType },
              { label: 'Мили загруж.', value: `${trip.miles} mi` },
              { label: 'Deadhead',     value: `${trip.deadheadMiles} mi` },
              { label: 'Hazmat',       value: trip.hazmat ? '⚠️ Да' : '✅ Нет' },
              { label: 'Темп. режим',  value: trip.tempControl ?? '—' },
            ].map(r => (
              <div key={r.label} style={{ background: '#F7FAFC', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#718096', marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2535' }}>{r.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* EXPENSES */}
        {tab === 'expenses' && (
          <div>
            {trip.expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#A0AEC0', fontSize: 14 }}>
                Нет расходов. Нажмите «+» чтобы добавить.
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {trip.expenses.map(e => (
                  <div key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0', borderBottom: '1px solid #F0F4F8', fontSize: 14,
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{EXP_ICONS[e.category]}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.desc}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>{e.category}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>${e.amount.toFixed(2)}</div>
                      {e.reimbursable && <div style={{ fontSize: 10, color: '#48BB78' }}>возмещается</div>}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: 15, borderTop: '2px solid #E2E8F0', marginTop: 8 }}>
                  <span>Итого расходов</span>
                  <span style={{ color: '#E53E3E' }}>-${totalExpenses.toFixed(2)}</span>
                </div>
                {reimbTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#48BB78' }}>
                    <span>Возмещаемых</span><span>+${reimbTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            {isActive && (
              <button onClick={() => onAddExpense({ id: '', category: 'fuel', desc: '', amount: 0, reimbursable: false })}
                style={{
                  width: '100%', padding: '10px', borderRadius: 10, border: '1.5px dashed #4BAED4',
                  background: '#EBF8FF', color: '#2B6CB0', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                }}>+ Добавить расход</button>
            )}
          </div>
        )}

        {/* P&L */}
        {tab === 'pl' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Gross Rate',  value: `$${trip.grossRate.toLocaleString()}`, color: '#48BB78', icon: '💵' },
                { label: 'Net Profit',  value: `$${netProfit.toFixed(0)}`,            color: netProfit >= 0 ? '#48BB78' : '#E53E3E', icon: '📈' },
                { label: 'Gross RPM',   value: `$${rpmGross.toFixed(2)}/mi`,          color: '#4BAED4', icon: '📊' },
                { label: 'Net RPM',     value: `$${rpmNet.toFixed(2)}/mi`,            color: rpmNet >= 1.5 ? '#48BB78' : '#FC8181', icon: '🎯' },
                { label: 'Cost/Mile',   value: `$${cpm.toFixed(2)}/mi`,              color: '#ED8936', icon: '⛽' },
                { label: 'Margin',      value: `${margin.toFixed(1)}%`,               color: margin >= 30 ? '#48BB78' : '#FC8181', icon: '💹' },
              ].map(k => (
                <div key={k.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: 14 }}>
              {[
                { label: 'Gross Rate',      value: `+$${trip.grossRate.toLocaleString()}`, color: '#48BB78' },
                { label: 'Возмещения',      value: `+$${reimbTotal.toFixed(2)}`,          color: '#48BB78', show: reimbTotal > 0 },
                { label: 'Расходы (gross)', value: `-$${totalExpenses.toFixed(2)}`,        color: '#E53E3E' },
                { label: 'Чистая прибыль',  value: `$${netProfit.toFixed(2)}`,             color: netProfit >= 0 ? '#276749' : '#C53030', bold: true },
              ].filter(r => r.show !== false).map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: r.bold ? '10px 0 0' : '7px 0',
                  borderTop: r.bold ? '2px solid #E2E8F0' : 'none',
                  fontSize: r.bold ? 16 : 13,
                  fontWeight: r.bold ? 800 : 500,
                }}>
                  <span style={{ color: r.bold ? '#1A2535' : '#718096' }}>{r.label}</span>
                  <span style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>

            {trip.invoiceNum && (
              <div style={{ marginTop: 14, background: trip.paidDate ? '#F0FFF4' : '#FFFFF0', borderRadius: 10, padding: 14, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                  {trip.paidDate ? '💰 Оплачен' : '🧾 Инвойс выслан'}
                </div>
                <div style={{ color: '#718096' }}>
                  {trip.invoiceNum} · Отправлен {trip.invoiceSentDate}
                  {trip.paidDate && ` · Оплачен ${trip.paidDate}`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DOCS */}
        {tab === 'docs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trip.documents.map((d, i) => {
              const conf = DOC_TYPES[d.type]
              const statusConf = {
                pending:  { color: '#A0AEC0', bg: '#F7FAFC', label: 'Ожидается' },
                uploaded: { color: '#D97706', bg: '#FFFFF0', label: 'Загружен' },
                verified: { color: '#276749', bg: '#F0FFF4', label: 'Проверен' },
              }[d.status]
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', background: statusConf.bg, borderRadius: 10,
                  border: `1.5px solid ${statusConf.color}44`,
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 22 }}>{conf.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{conf.label}</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{d.name}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: statusConf.color }}>
                      {statusConf.label}
                    </span>
                    {d.status !== 'pending' && (
                      <button style={{
                        padding: '5px 12px', borderRadius: 6, border: '1.5px solid #4BAED4',
                        background: '#fff', color: '#4BAED4', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      }}>↓ Скачать</button>
                    )}
                    {d.status === 'pending' && (
                      <button style={{
                        padding: '5px 12px', borderRadius: 6, border: 'none',
                        background: '#4BAED4', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      }}>↑ Загрузить</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TIMELINE */}
        {tab === 'timeline' && (
          <div>
            {trip.timeline.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{ev.icon}</div>
                  {i < trip.timeline.length - 1 && (
                    <div style={{ width: 2, height: 24, background: '#E2E8F0', marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 13, color: '#1A2535', lineHeight: 1.5 }}>{ev.text}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      {hasNext && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', background: '#F7FAFC', display: 'flex', gap: 10 }}>
          <button onClick={onUpdateStatus} style={{
            flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)', color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {STATUS_CONF[STATUS_PIPE[STATUS_PIPE.indexOf(trip.status as TripStatus) + 1]]?.icon} Следующий статус: {STATUS_CONF[STATUS_PIPE[STATUS_PIPE.indexOf(trip.status as TripStatus) + 1]]?.label}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TripManagementPage({ role }: { role: UserRole }) {
  const [trips, setTrips]     = useState<Trip[]>(TRIPS)
  const [selected, setSelected] = useState<Trip>(TRIPS[0])
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all')
  const [showAddExp, setShowAddExp] = useState(false)
  const [showUpdateStatus, setShowUpdateStatus] = useState(false)

  const filtered = trips.filter(t => statusFilter === 'all' || t.status === statusFilter)

  // Sync selected with trips state
  const currentSelected = trips.find(t => t.id === selected.id) ?? trips[0]

  const totalRevenue  = trips.filter(t => t.status === 'paid').reduce((s, t) => s + t.grossRate, 0)
  const totalMiles    = trips.reduce((s, t) => s + t.miles, 0)
  const activeCount   = trips.filter(t => ['enroute_pickup','loaded','in_transit'].includes(t.status)).length
  const pendingPay    = trips.filter(t => t.status === 'invoiced').reduce((s, t) => s + t.grossRate, 0)

  function handleAddExpense(exp: TripExpense) {
    if (!exp.desc || exp.amount <= 0) { setShowAddExp(true); return }
    setTrips(prev => prev.map(t =>
      t.id === currentSelected.id
        ? { ...t, expenses: [...t.expenses, { ...exp, id: Date.now().toString() }] }
        : t
    ))
    setShowAddExp(false)
  }

  function handleUpdateStatus(newStatus: TripStatus, note: string) {
    const now = new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    const conf = STATUS_CONF[newStatus]
    setTrips(prev => prev.map(t =>
      t.id === currentSelected.id
        ? {
            ...t,
            status: newStatus,
            timeline: [...t.timeline, {
              time: now,
              text: `Статус обновлён → ${conf.label}${note ? `. ${note}` : ''}`,
              icon: conf.icon,
            }],
          }
        : t
    ))
    setShowUpdateStatus(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'Активных рейсов',   value: activeCount,                    color: '#4BAED4', icon: '🛣️', sub: 'сейчас в пути' },
          { label: 'Оплачено (май)',     value: `$${totalRevenue.toLocaleString()}`, color: '#48BB78', icon: '💰', sub: `${trips.filter(t=>t.status==='paid').length} рейсов` },
          { label: 'Ожидает оплаты',    value: `$${pendingPay.toLocaleString()}`, color: '#ECC94B', icon: '🧾', sub: `${trips.filter(t=>t.status==='invoiced').length} инвойсов` },
          { label: 'Всего миль (май)',   value: totalMiles.toLocaleString(),    color: '#9F7AEA', icon: '🛤️', sub: `${trips.length} рейсов` },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1.5px solid #E2E8F0' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#718096' }}>{k.sub}</div>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 1 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setStatusFilter('all')} style={{
          padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
          background: statusFilter === 'all' ? '#1A2535' : '#F7FAFC',
          color: statusFilter === 'all' ? '#fff' : '#718096',
          fontWeight: statusFilter === 'all' ? 700 : 500,
        }}>Все ({trips.length})</button>
        {STATUS_PIPE.concat(['issue'] as TripStatus[]).map(s => {
          const count = trips.filter(t => t.status === s).length
          if (count === 0) return null
          const conf = STATUS_CONF[s]
          return (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
              background: statusFilter === s ? conf.color : conf.bg,
              color: statusFilter === s ? '#fff' : conf.color,
              fontWeight: 600,
            }}>{conf.icon} {conf.label} ({count})</button>
          )
        })}
      </div>

      {/* Split panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* List */}
        <div>
          {filtered.map(t => {
            const sc = STATUS_CONF[t.status]
            const expenses = t.expenses.reduce((s, e) => s + e.amount, 0)
            const net = t.grossRate - expenses + t.expenses.filter(e => e.reimbursable).reduce((s,e)=>s+e.amount,0)
            return (
              <div key={t.id} onClick={() => setSelected(t)} style={{
                background: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
                border: currentSelected.id === t.id ? '2px solid #4BAED4' : '1.5px solid #E2E8F0',
                cursor: 'pointer', transition: 'border .15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>{t.id}</div>
                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                    {sc.icon} {sc.label}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 2 }}>
                  {t.shipper.split(' ').slice(0,3).join(' ')}
                </div>
                <div style={{ fontSize: 12, color: '#718096', marginBottom: 8 }}>→ {t.consignee.split(' ').slice(0,3).join(' ')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#A0AEC0' }}>{t.miles} mi · {t.broker}</span>
                  <span style={{ fontWeight: 700, color: t.status === 'paid' ? '#48BB78' : '#1A2535' }}>
                    ${t.grossRate.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        <TripDetail
          trip={currentSelected}
          role={role}
          onAddExpense={() => setShowAddExp(true)}
          onUpdateStatus={() => setShowUpdateStatus(true)}
        />
      </div>

      {showAddExp && (
        <AddExpenseModal
          onSave={handleAddExpense}
          onClose={() => setShowAddExp(false)}
        />
      )}
      {showUpdateStatus && (
        <UpdateStatusModal
          trip={currentSelected}
          onUpdate={handleUpdateStatus}
          onClose={() => setShowUpdateStatus(false)}
        />
      )}
    </div>
  )
}
