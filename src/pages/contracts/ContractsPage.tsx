import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────
type ContractStatus = 'active' | 'trial' | 'pending' | 'completed' | 'terminated' | 'disputed'
type ContractType   = 'percentage' | 'flat' | 'hybrid'

interface ContractParty {
  name: string
  company: string
  role: 'dispatcher' | 'owner-op'
  rating: number
  verified: boolean
}

interface ContractMilestone {
  label: string
  date: string
  done: boolean
}

interface ContractVersion {
  version: string
  date: string
  author: string
  changes: string
}

interface Contract {
  id: string
  status: ContractStatus
  type: ContractType
  dispatcher: ContractParty
  ownerOp: ContractParty
  startDate: string
  endDate?: string
  trialDays?: number
  ratePercent?: number
  rateFlat?: number
  rpmGuarantee: number
  trucks: number
  truckType: string
  lanes: string
  noticeDays: number
  totalRevenue: number
  totalLoads: number
  avgRpm: number
  currentStatus: string
  milestones: ContractMilestone[]
  disputes: number
  nextReviewDate?: string
  renewalDays?: number
  signedByDispatcher: boolean
  signedByOwner: boolean
  platformFee: number
  versions: ContractVersion[]
  notes: string
}

interface ContractTemplate {
  id: string
  name: string
  type: ContractType
  description: string
  defaultRate: string
  defaultRpm: number
  defaultNotice: number
  usageCount: number
  category: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CONTRACTS: Contract[] = [
  {
    id: 'CTR-2024-001',
    status: 'active',
    type: 'percentage',
    dispatcher: { name: 'Alex Petrov',    company: 'Petrov Dispatch LLC',  role: 'dispatcher', rating: 4.9, verified: true },
    ownerOp:    { name: 'Marcus Johnson', company: 'MJ Freight LLC',       role: 'owner-op',   rating: 4.7, verified: true },
    startDate: 'Jan 15, 2024',
    ratePercent: 8,
    rpmGuarantee: 2.55,
    trucks: 2,
    truckType: 'Dry Van',
    lanes: 'TX–CA, TX–FL, Midwest',
    noticeDays: 14,
    totalRevenue: 52400,
    totalLoads: 38,
    avgRpm: 2.71,
    currentStatus: 'In transit — Chicago → Dallas',
    renewalDays: 25,
    milestones: [
      { label: 'Contract signed',      date: 'Jan 15',  done: true },
      { label: 'First load booked',    date: 'Jan 16',  done: true },
      { label: '30-day review',        date: 'Feb 15',  done: true },
      { label: '90-day performance',   date: 'Apr 15',  done: false },
    ],
    disputes: 0,
    nextReviewDate: 'Jul 15, 2024',
    signedByDispatcher: true,
    signedByOwner: true,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'Jan 15, 2024', author: 'Alex Petrov', changes: 'Initial contract. 8% rate, $2.55 RPM guarantee.' },
      { version: 'v1.1', date: 'Feb 20, 2024', author: 'Marcus Johnson', changes: 'Added TX–FL lane. Approved by both parties.' },
    ],
    notes: 'Priority client. Marcus runs clean with consistent delivery times.',
  },
  {
    id: 'CTR-2024-002',
    status: 'trial',
    type: 'percentage',
    dispatcher: { name: 'Maria Santos',  company: 'Santos Freight Mgmt',   role: 'dispatcher', rating: 4.8, verified: true },
    ownerOp:    { name: 'David Park',    company: 'Park Logistics',         role: 'owner-op',   rating: 4.6, verified: false },
    startDate: 'May 1, 2024',
    trialDays: 7,
    ratePercent: 9,
    rpmGuarantee: 2.60,
    trucks: 1,
    truckType: 'Reefer',
    lanes: 'Midwest loop',
    noticeDays: 7,
    totalRevenue: 1840,
    totalLoads: 6,
    avgRpm: 2.68,
    currentStatus: 'Trial — Day 3 of 7',
    milestones: [
      { label: 'Trial started',        date: 'May 1',   done: true },
      { label: 'Day 3 check-in',       date: 'May 4',   done: false },
      { label: 'Trial complete',       date: 'May 8',   done: false },
      { label: 'Contract decision',    date: 'May 9',   done: false },
    ],
    disputes: 0,
    signedByDispatcher: true,
    signedByOwner: true,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'May 1, 2024', author: 'Maria Santos', changes: 'Trial agreement. 7-day probationary period.' },
    ],
    notes: 'David is new to the platform. Reefer experience confirmed.',
  },
  {
    id: 'CTR-2024-003',
    status: 'pending',
    type: 'flat',
    dispatcher: { name: 'John Weber',    company: 'Weber Dispatch',         role: 'dispatcher', rating: 4.5, verified: true },
    ownerOp:    { name: 'Elena Vasquez', company: 'Vasquez Transport',      role: 'owner-op',   rating: 4.8, verified: true },
    startDate: 'Pending signature',
    rateFlat: 350,
    rpmGuarantee: 2.50,
    trucks: 3,
    truckType: 'Flatbed',
    lanes: 'National',
    noticeDays: 14,
    totalRevenue: 0,
    totalLoads: 0,
    avgRpm: 0,
    currentStatus: 'Awaiting owner signature',
    milestones: [
      { label: 'Contract drafted',     date: 'May 10',  done: true },
      { label: 'Dispatcher signed',    date: 'May 10',  done: true },
      { label: 'Owner signed',         date: 'Pending', done: false },
      { label: 'Contract live',        date: 'TBD',     done: false },
    ],
    disputes: 0,
    signedByDispatcher: true,
    signedByOwner: false,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'May 8, 2024',  author: 'John Weber', changes: 'Initial draft. Flat $350/wk per truck.' },
      { version: 'v1.1', date: 'May 10, 2024', author: 'John Weber', changes: 'Revised rate to $350 after negotiation. Lanes expanded to National.' },
    ],
    notes: 'Elena requested national lanes coverage. Agreed to flat fee model.',
  },
  {
    id: 'CTR-2024-004',
    status: 'disputed',
    type: 'percentage',
    dispatcher: { name: 'Ray Morrison',   company: 'Morrison Logistics',    role: 'dispatcher', rating: 3.9, verified: true },
    ownerOp:    { name: 'Steve Okafor',   company: 'Okafor Trucking',       role: 'owner-op',   rating: 4.4, verified: true },
    startDate: 'Mar 1, 2024',
    ratePercent: 10,
    rpmGuarantee: 2.70,
    trucks: 1,
    truckType: 'Dry Van',
    lanes: 'Southeast',
    noticeDays: 14,
    totalRevenue: 14200,
    totalLoads: 19,
    avgRpm: 2.38,
    currentStatus: 'Dispute open — RPM below guarantee',
    milestones: [
      { label: 'Contract signed',      date: 'Mar 1',   done: true },
      { label: 'First load',           date: 'Mar 2',   done: true },
      { label: 'RPM dispute filed',    date: 'Apr 20',  done: true },
      { label: 'Mediation scheduled',  date: 'May 15',  done: false },
    ],
    disputes: 1,
    signedByDispatcher: true,
    signedByOwner: true,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'Mar 1, 2024', author: 'Ray Morrison', changes: 'Initial contract. 10% rate, $2.70 RPM guarantee.' },
    ],
    notes: 'Steve filed RPM dispute on Apr 20. Avg RPM $2.38 vs $2.70 guarantee. Mediation pending.',
  },
  {
    id: 'CTR-2024-005',
    status: 'active',
    type: 'hybrid',
    dispatcher: { name: 'Lisa Chen',      company: 'Chen Freight Solutions', role: 'dispatcher', rating: 4.9, verified: true },
    ownerOp:    { name: 'Carlos Reyes',   company: 'Reyes Express LLC',      role: 'owner-op',   rating: 4.8, verified: true },
    startDate: 'Feb 1, 2024',
    ratePercent: 7,
    rateFlat: 200,
    rpmGuarantee: 2.65,
    trucks: 4,
    truckType: 'Reefer',
    lanes: 'CA–WA–OR, West Coast',
    noticeDays: 21,
    totalRevenue: 88600,
    totalLoads: 72,
    avgRpm: 2.81,
    currentStatus: 'In transit — Seattle → Portland',
    renewalDays: 62,
    milestones: [
      { label: 'Contract signed',      date: 'Feb 1',   done: true },
      { label: 'Fleet onboarded',      date: 'Feb 5',   done: true },
      { label: '60-day review',        date: 'Apr 1',   done: true },
      { label: '6-month review',       date: 'Aug 1',   done: false },
    ],
    disputes: 0,
    nextReviewDate: 'Aug 1, 2024',
    signedByDispatcher: true,
    signedByOwner: true,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'Jan 28, 2024', author: 'Lisa Chen', changes: 'Initial hybrid: 7% + $200/mo base.' },
      { version: 'v1.1', date: 'Feb 15, 2024', author: 'Carlos Reyes', changes: 'Added OR coverage. Base increased to $200.' },
      { version: 'v1.2', date: 'Apr 2, 2024',  author: 'Lisa Chen', changes: 'Extended term to 12 months after positive 60-day review.' },
    ],
    notes: 'Top performer. West Coast reefer specialist. Considering expanding to 6 trucks.',
  },
  {
    id: 'CTR-2024-006',
    status: 'active',
    type: 'percentage',
    dispatcher: { name: 'Alex Petrov',    company: 'Petrov Dispatch LLC',  role: 'dispatcher', rating: 4.9, verified: true },
    ownerOp:    { name: 'Brian Scott',    company: 'Scott Transport Inc.',  role: 'owner-op',   rating: 4.5, verified: true },
    startDate: 'Apr 1, 2024',
    ratePercent: 8,
    rpmGuarantee: 2.45,
    trucks: 1,
    truckType: 'Dry Van',
    lanes: 'Midwest, Southeast',
    noticeDays: 14,
    totalRevenue: 19800,
    totalLoads: 21,
    avgRpm: 2.52,
    currentStatus: 'Available — Nashville hub',
    renewalDays: 41,
    milestones: [
      { label: 'Contract signed',      date: 'Apr 1',   done: true },
      { label: 'First load',           date: 'Apr 2',   done: true },
      { label: '30-day review',        date: 'May 1',   done: true },
      { label: '90-day review',        date: 'Jul 1',   done: false },
    ],
    disputes: 0,
    nextReviewDate: 'Jul 1, 2024',
    signedByDispatcher: true,
    signedByOwner: true,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'Apr 1, 2024', author: 'Alex Petrov', changes: 'Standard 8% dry van contract.' },
    ],
    notes: 'Brian has good home-time requirements. Runs TN-KY-GA corridor primarily.',
  },
  {
    id: 'CTR-2023-018',
    status: 'completed',
    type: 'percentage',
    dispatcher: { name: 'Alex Petrov',    company: 'Petrov Dispatch LLC',  role: 'dispatcher', rating: 4.9, verified: true },
    ownerOp:    { name: 'Tom Bridges',    company: 'Bridges Freight',       role: 'owner-op',   rating: 4.5, verified: true },
    startDate: 'Aug 1, 2023',
    endDate:   'Nov 30, 2023',
    ratePercent: 8,
    rpmGuarantee: 2.40,
    trucks: 1,
    truckType: 'Dry Van',
    lanes: 'Southeast',
    noticeDays: 14,
    totalRevenue: 41200,
    totalLoads: 61,
    avgRpm: 2.62,
    currentStatus: 'Contract completed',
    milestones: [
      { label: 'Contract signed',      date: 'Aug 1',   done: true },
      { label: 'First load booked',    date: 'Aug 2',   done: true },
      { label: '90-day review',        date: 'Nov 1',   done: true },
      { label: 'Contract completed',   date: 'Nov 30',  done: true },
    ],
    disputes: 0,
    signedByDispatcher: true,
    signedByOwner: true,
    platformFee: 0.5,
    versions: [
      { version: 'v1.0', date: 'Aug 1, 2023', author: 'Alex Petrov', changes: 'Standard 4-month dry van contract.' },
    ],
    notes: 'Tom relocated to Texas. Contract ended amicably.',
  },
]

const CONTRACT_TEMPLATES: ContractTemplate[] = [
  { id: 'tpl1', name: 'Standard Dry Van — 8%', type: 'percentage', description: 'Standard percentage contract for dry van operations. Industry-standard 8% rate with $2.40 RPM guarantee.', defaultRate: '8%', defaultRpm: 2.40, defaultNotice: 14, usageCount: 24, category: 'Dry Van' },
  { id: 'tpl2', name: 'Reefer Premium — 9%', type: 'percentage', description: 'Reefer-specific contract with temperature compliance clauses and higher RPM guarantee.', defaultRate: '9%', defaultRpm: 2.60, defaultNotice: 14, usageCount: 11, category: 'Reefer' },
  { id: 'tpl3', name: 'Flatbed Monthly Flat', type: 'flat', description: 'Fixed monthly fee for flatbed operators. Includes oversize load management clauses.', defaultRate: '$350/mo', defaultRpm: 2.50, defaultNotice: 21, usageCount: 7, category: 'Flatbed' },
  { id: 'tpl4', name: 'Hybrid Multi-Truck — 7%', type: 'hybrid', description: 'Hybrid model for fleets of 3+ trucks. Base retainer + percentage. Best for high-volume operations.', defaultRate: '7% + $200 base', defaultRpm: 2.55, defaultNotice: 21, usageCount: 5, category: 'Fleet' },
  { id: 'tpl5', name: 'Trial Agreement — 7 Days', type: 'percentage', description: 'Short-term trial for new owner-operator relationships. No obligation, automatic expiry after 7 days.', defaultRate: '9%', defaultRpm: 2.45, defaultNotice: 3, usageCount: 18, category: 'Trial' },
  { id: 'tpl6', name: 'Hazmat Specialist — 10%', type: 'percentage', description: 'Hazmat-certified driver contract with compliance checklists, emergency protocols, and higher premium.', defaultRate: '10%', defaultRpm: 2.80, defaultNotice: 30, usageCount: 3, category: 'Hazmat' },
]

const STATUS_CONF: Record<ContractStatus, { color: string; bg: string; label: string; icon: string }> = {
  active:     { color: '#276749', bg: '#F0FFF4', label: 'Активен',    icon: '🟢' },
  trial:      { color: '#2B6CB0', bg: '#EBF8FF', label: 'Пробный',    icon: '🔵' },
  pending:    { color: '#975A16', bg: '#FFFFF0', label: 'Подпись',    icon: '⏳' },
  completed:  { color: '#553C9A', bg: '#FAF5FF', label: 'Завершён',   icon: '✅' },
  terminated: { color: '#742A2A', bg: '#FFF5F5', label: 'Расторгнут', icon: '❌' },
  disputed:   { color: '#C53030', bg: '#FFF5F5', label: 'Спор',       icon: '⚠️' },
}

// ── Dispute Modal ─────────────────────────────────────────────────────────────
function DisputeModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submit = () => { if (reason && details.length > 20) setSubmitted(true) }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#C53030' }}>⚠️ Открыть спор</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2535', marginBottom: 8 }}>Спор зарегистрирован</div>
            <div style={{ fontSize: 14, color: '#718096' }}>Команда DispaLoadIQ рассмотрит ваш спор в течение 24 часов и свяжется с обеими сторонами.</div>
            <button onClick={onClose} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>OK</button>
          </div>
        ) : (
          <>
            <div style={{ background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#C53030' }}>
              Контракт: <strong>{contract.id}</strong> · {contract.dispatcher.name} / {contract.ownerOp.name}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>ПРИЧИНА СПОРА</label>
              <select value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}>
                <option value="">Выберите причину...</option>
                <option value="rpm">RPM ниже гарантированного</option>
                <option value="noload">Нет загрузок несколько дней</option>
                <option value="comm">Проблемы с коммуникацией</option>
                <option value="invoice">Спор по оплате</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>ДЕТАЛИ (минимум 20 символов)</label>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={4}
                placeholder="Опишите проблему подробно..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, resize: 'none', boxSizing: 'border-box' }} />
              <div style={{ fontSize: 11, color: details.length < 20 ? '#FC8181' : '#48BB78', marginTop: 4 }}>{details.length} / 20 символов минимум</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={submit} disabled={!reason || details.length < 20} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: reason && details.length >= 20 ? '#C53030' : '#E2E8F0',
                color: reason && details.length >= 20 ? '#fff' : '#A0AEC0', fontWeight: 700, fontSize: 14,
              }}>Подать спор</button>
              <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #CBD5E0', background: '#fff', color: '#718096', cursor: 'pointer' }}>Отмена</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Terminate Modal ───────────────────────────────────────────────────────────
function TerminateModal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [confirmed, setConfirmed] = useState(false)
  const [done, setDone] = useState(false)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#742A2A' }}>🔚 Расторгнуть контракт</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📬</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2535', marginBottom: 8 }}>Уведомление отправлено</div>
            <div style={{ fontSize: 13, color: '#718096' }}>
              {contract.noticeDays}-дневное уведомление о расторжении отправлено. Контракт завершится через {contract.noticeDays} дней.
            </div>
            <button onClick={onClose} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Закрыть</button>
          </div>
        ) : (
          <>
            <div style={{ background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14, color: '#742A2A' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ Требуется уведомление за {contract.noticeDays} дней</div>
              <div>По условиям контракта, расторжение вступает в силу через <strong>{contract.noticeDays} дней</strong>. В этот период обе стороны обязаны выполнять обязательства.</div>
            </div>
            <div style={{ marginBottom: 20, fontSize: 14, color: '#4A5568', lineHeight: 1.6 }}>
              <strong>Контракт:</strong> {contract.id}<br />
              <strong>Всего рейсов:</strong> {contract.totalLoads} · <strong>Доход:</strong> ${contract.totalRevenue.toLocaleString()}
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20, fontSize: 13 }}>
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ color: '#4A5568' }}>Я понимаю условия {contract.noticeDays}-дневного уведомления и хочу начать процесс расторжения.</span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDone(true)} disabled={!confirmed} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none', cursor: confirmed ? 'pointer' : 'not-allowed',
                background: confirmed ? '#742A2A' : '#E2E8F0', color: confirmed ? '#fff' : '#A0AEC0', fontWeight: 700, fontSize: 14,
              }}>Отправить уведомление</button>
              <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #CBD5E0', background: '#fff', color: '#718096', cursor: 'pointer' }}>Отмена</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── New Contract Modal ────────────────────────────────────────────────────────
function NewContractModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)
  const [ownerName, setOwnerName] = useState('')
  const [ownerCompany, setOwnerCompany] = useState('')
  const [trucks, setTrucks] = useState('1')
  const [lanes, setLanes] = useState('')
  const [done, setDone] = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1A2535' }}>📝 Новый контракт</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13,
                background: step >= s ? '#4BAED4' : '#E2E8F0',
                color: step >= s ? '#fff' : '#A0AEC0',
              }}>{s}</div>
              <div style={{ fontSize: 12, color: step >= s ? '#1A2535' : '#A0AEC0', fontWeight: step === s ? 700 : 400 }}>
                {s === 1 ? 'Шаблон' : s === 2 ? 'Детали' : 'Подпись'}
              </div>
              {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? '#4BAED4' : '#E2E8F0' }} />}
            </div>
          ))}
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2535', marginBottom: 8 }}>Контракт создан!</div>
            <div style={{ fontSize: 14, color: '#718096', marginBottom: 20 }}>Приглашение отправлено на email владельца. После подписи контракт станет активным.</div>
            <button onClick={onClose} style={{ padding: '12px 28px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>Отлично!</button>
          </div>
        ) : step === 1 ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4A5568', marginBottom: 12 }}>Выберите шаблон контракта:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {CONTRACT_TEMPLATES.map(tpl => (
                <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} style={{
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `2px solid ${selectedTemplate?.id === tpl.id ? '#4BAED4' : '#E2E8F0'}`,
                  background: selectedTemplate?.id === tpl.id ? '#EBF8FF' : '#F7FAFC',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>{tpl.name}</div>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: '#EBF8FF', color: '#2B6CB0', fontWeight: 700 }}>{tpl.category}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>{tpl.description}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span style={{ color: '#4BAED4' }}>Ставка: {tpl.defaultRate}</span>
                    <span style={{ color: '#38C770' }}>Гарантия RPM: ${tpl.defaultRpm}</span>
                    <span style={{ color: '#A0AEC0' }}>Использований: {tpl.usageCount}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '13px', fontWeight: 800 }}
              disabled={!selectedTemplate} onClick={() => setStep(2)}>
              Далее →
            </button>
          </>
        ) : step === 2 ? (
          <>
            <div style={{ background: '#EBF8FF', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#2B6CB0' }}>
              Шаблон: <strong>{selectedTemplate?.name}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Имя владельца (Owner-Operator)', value: ownerName, set: setOwnerName, placeholder: 'Иван Петров' },
                { label: 'Название компании', value: ownerCompany, set: setOwnerCompany, placeholder: 'Петров Freight LLC' },
                { label: 'Количество грузовиков', value: trucks, set: setTrucks, placeholder: '1' },
                { label: 'Маршруты / регионы', value: lanes, set: setLanes, placeholder: 'TX–CA, Midwest loop' },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input className="input" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setStep(1)} style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #CBD5E0', background: '#fff', color: '#718096', cursor: 'pointer' }}>← Назад</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 800 }}
                disabled={!ownerName || !ownerCompany || !lanes} onClick={() => setStep(3)}>
                Далее →
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535', marginBottom: 12 }}>Подтвердите детали контракта</div>
              {[
                { label: 'Шаблон',      value: selectedTemplate?.name ?? '' },
                { label: 'Владелец',    value: `${ownerName} · ${ownerCompany}` },
                { label: 'Грузовики',   value: trucks },
                { label: 'Маршруты',    value: lanes },
                { label: 'Ставка',      value: selectedTemplate?.defaultRate ?? '' },
                { label: 'Гарантия',    value: `$${selectedTemplate?.defaultRpm}/mi` },
                { label: 'Уведомление', value: `${selectedTemplate?.defaultNotice} дней` },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #E2E8F0', fontSize: 13 }}>
                  <span style={{ color: '#718096' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: '#1A2535' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', background: '#FFFBEB', borderRadius: 10, fontSize: 12, color: '#975A16', marginBottom: 18 }}>
              💡 После создания контракта владелец получит email с ссылкой для подписи. Контракт станет активным после подписи обеих сторон.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 20px', borderRadius: 10, border: '1.5px solid #CBD5E0', background: '#fff', color: '#718096', cursor: 'pointer' }}>← Назад</button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 800 }} onClick={() => setDone(true)}>
                ✍️ Подписать и отправить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Contract Detail Panel ─────────────────────────────────────────────────────
function ContractDetail({ contract, role, onDispute, onTerminate }: {
  contract: Contract; role: UserRole; onDispute: () => void; onTerminate: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'terms' | 'milestones' | 'history' | 'notes'>('overview')
  const sc = STATUS_CONF[contract.status]
  const dispatcherFee = contract.type === 'percentage'
    ? `${contract.ratePercent}% от валового`
    : contract.type === 'flat'
    ? `$${contract.rateFlat}/мес. фиксировано`
    : `${contract.ratePercent}% + $${contract.rateFlat} база/мес.`

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden', height: 'fit-content' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A2535 0%,#2D4A6B 100%)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 600, letterSpacing: 1 }}>{contract.id}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {contract.renewalDays !== undefined && (
              <span style={{ background: '#FEEBC8', color: '#975A16', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                🔔 {contract.renewalDays}д до обновления
              </span>
            )}
            <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
              {sc.icon} {sc.label}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>ДИСПЕТЧЕР</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{contract.dispatcher.name}</div>
            {contract.dispatcher.verified && <div style={{ fontSize: 10, color: '#4BAED4', marginTop: 2 }}>✓ Верифицирован</div>}
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,.3)' }}>⇄</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>ВЛАДЕЛЕЦ</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>{contract.ownerOp.name}</div>
            {contract.ownerOp.verified && <div style={{ fontSize: 10, color: '#4BAED4', marginTop: 2 }}>✓ Верифицирован</div>}
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
          🚛 {contract.trucks} × {contract.truckType} · {contract.lanes}
        </div>
      </div>

      {/* Status bar */}
      <div style={{ padding: '10px 24px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>📍</span>
        <span style={{ color: '#4A5568' }}>{contract.currentStatus}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
        {([
          { key: 'overview',   label: '📊 Обзор' },
          { key: 'terms',      label: '📝 Условия' },
          { key: 'milestones', label: '🗓 Этапы' },
          { key: 'history',    label: '🕐 История' },
          { key: 'notes',      label: '📌 Заметки' },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: '0 0 auto', padding: '11px 14px', border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#fff' : '#F7FAFC',
            color: tab === t.key ? '#1A2535' : '#718096',
            fontWeight: tab === t.key ? 700 : 500, fontSize: 12,
            borderBottom: tab === t.key ? '2px solid #4BAED4' : '2px solid transparent',
            whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 20 }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              {[
                { label: 'Доход (total)', value: `$${contract.totalRevenue.toLocaleString()}`, color: '#48BB78', icon: '💰' },
                { label: 'Всего рейсов', value: String(contract.totalLoads), color: '#4BAED4', icon: '📦' },
                { label: 'Avg RPM', value: contract.avgRpm > 0 ? `$${contract.avgRpm.toFixed(2)}` : '—', color: contract.avgRpm >= contract.rpmGuarantee ? '#48BB78' : '#FC8181', icon: '📈' },
                { label: 'Гарантия RPM', value: `$${contract.rpmGuarantee.toFixed(2)}`, color: '#9F7AEA', icon: '🎯' },
              ].map(k => (
                <div key={k.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{k.label}</div>
                </div>
              ))}
            </div>

            {contract.totalLoads > 0 && (
              <div style={{
                padding: 14, borderRadius: 10, marginBottom: 16,
                background: contract.avgRpm >= contract.rpmGuarantee ? '#F0FFF4' : '#FFF5F5',
                border: `1px solid ${contract.avgRpm >= contract.rpmGuarantee ? '#68D391' : '#FC8181'}`,
                fontSize: 13,
                color: contract.avgRpm >= contract.rpmGuarantee ? '#276749' : '#742A2A',
              }}>
                {contract.avgRpm >= contract.rpmGuarantee
                  ? `✅ RPM выполнен: $${contract.avgRpm.toFixed(2)} ≥ $${contract.rpmGuarantee.toFixed(2)} (+$${(contract.avgRpm - contract.rpmGuarantee).toFixed(2)}/mi сверх)`
                  : `⚠️ RPM ниже гарантии: $${contract.avgRpm.toFixed(2)} < $${contract.rpmGuarantee.toFixed(2)} (-$${(contract.rpmGuarantee - contract.avgRpm).toFixed(2)}/mi)`}
              </div>
            )}

            {contract.disputes > 0 && (
              <div style={{ padding: '10px 14px', background: '#FFF5F5', borderRadius: 10, marginBottom: 14, fontSize: 13, color: '#C53030', border: '1px solid #FC8181' }}>
                ⚠️ Открытых споров: <strong>{contract.disputes}</strong>. Медиация назначена — ожидайте уведомления от DispaLoadIQ.
              </div>
            )}

            {/* Signatures */}
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: 14, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>ЦИФРОВЫЕ ПОДПИСИ</div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { label: contract.dispatcher.name, signed: contract.signedByDispatcher },
                  { label: contract.ownerOp.name,    signed: contract.signedByOwner },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: s.signed ? '#F0FFF4' : '#FFF5F5',
                      border: `2px solid ${s.signed ? '#68D391' : '#FC8181'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>{s.signed ? '✓' : '!'}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: s.signed ? '#276749' : '#C53030' }}>{s.signed ? 'Подписано' : 'Ожидается'}</div>
                    </div>
                  </div>
                ))}
              </div>
              {!contract.signedByOwner && role === 'owner-op' && (
                <button style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 8, background: '#4BAED4', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  ✍️ Подписать контракт
                </button>
              )}
            </div>
          </>
        )}

        {/* TERMS */}
        {tab === 'terms' && (
          <div style={{ fontSize: 14 }}>
            {[
              { label: 'Дата начала',              value: contract.startDate },
              { label: 'Дата окончания',            value: contract.endDate ?? 'Бессрочный' },
              { label: 'Тип контракта',             value: contract.type === 'percentage' ? 'Процент от выручки' : contract.type === 'flat' ? 'Фиксированная ставка' : 'Гибридный' },
              { label: 'Ставка диспетчера',         value: dispatcherFee },
              { label: 'Гарантия RPM',              value: `$${contract.rpmGuarantee.toFixed(2)}/mi` },
              { label: 'Грузовики',                 value: `${contract.trucks} × ${contract.truckType}` },
              { label: 'Маршруты',                  value: contract.lanes },
              { label: 'Уведомление о расторжении', value: `${contract.noticeDays} дней` },
              { label: 'Пробный период',            value: contract.trialDays ? `${contract.trialDays} дней` : 'Нет' },
              { label: 'Комиссия платформы',        value: `${contract.platformFee}%` },
              { label: 'Следующий обзор',           value: contract.nextReviewDate ?? 'Не назначен' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F0F4F8' }}>
                <span style={{ color: '#718096' }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: '#1A2535', textAlign: 'right', maxWidth: '55%' }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* MILESTONES */}
        {tab === 'milestones' && (
          <div>
            {contract.milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: m.done ? 'linear-gradient(135deg,#4BAED4,#2D7A9A)' : '#E2E8F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: m.done ? '#fff' : '#A0AEC0', fontSize: 14, flexShrink: 0,
                  }}>{m.done ? '✓' : i + 1}</div>
                  {i < contract.milestones.length - 1 && (
                    <div style={{ width: 2, height: 24, background: m.done ? '#4BAED4' : '#E2E8F0', marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontWeight: m.done ? 700 : 500, fontSize: 14, color: m.done ? '#1A2535' : '#718096' }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HISTORY / VERSIONS */}
        {tab === 'history' && (
          <div>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 16 }}>История изменений контракта</div>
            {contract.versions.map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#2B6CB0' }}>
                    {v.version}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#F7FAFC', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{v.author}</span>
                    <span style={{ fontSize: 11, color: '#A0AEC0' }}>{v.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>{v.changes}</div>
                </div>
              </div>
            ))}
            <button style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1.5px dashed #CBD5E0', background: '#F7FAFC', color: '#718096', cursor: 'pointer', fontSize: 13 }}>
              + Добавить изменение
            </button>
          </div>
        )}

        {/* NOTES */}
        {tab === 'notes' && (
          <div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FEEBC8', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#975A16', marginBottom: 8 }}>📌 Внутренние заметки</div>
              <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6 }}>{contract.notes || 'Заметок нет.'}</div>
            </div>
            <textarea
              rows={4}
              placeholder="Добавить заметку..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, resize: 'none', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <button className="btn btn-primary" style={{ width: '100%', fontWeight: 700 }}>💾 Сохранить заметку</button>
          </div>
        )}

        {/* Action buttons */}
        {(contract.status === 'active' || contract.status === 'trial') && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, marginTop: 16, display: 'flex', gap: 10 }}>
            <button onClick={onDispute} style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: '1.5px solid #FC8181', background: '#fff',
              color: '#C53030', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}>⚠️ Спор</button>
            <button onClick={onTerminate} style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: '1.5px solid #CBD5E0', background: '#fff',
              color: '#718096', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}>🔚 Расторгнуть</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ContractsPage({ role }: { role: UserRole }) {
  const [selected, setSelected] = useState<Contract>(CONTRACTS[0])
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all')
  const [showDispute, setShowDispute] = useState(false)
  const [showTerminate, setShowTerminate] = useState(false)
  const [showNewContract, setShowNewContract] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState<'contracts' | 'templates'>('contracts')
  const [search, setSearch] = useState('')

  const filtered = CONTRACTS.filter(c =>
    (statusFilter === 'all' || c.status === statusFilter) &&
    (search === '' ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.dispatcher.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ownerOp.name.toLowerCase().includes(search.toLowerCase()) ||
      c.truckType.toLowerCase().includes(search.toLowerCase()))
  )

  const activeCount    = CONTRACTS.filter(c => c.status === 'active').length
  const trialCount     = CONTRACTS.filter(c => c.status === 'trial').length
  const pendingCount   = CONTRACTS.filter(c => c.status === 'pending').length
  const completedCount = CONTRACTS.filter(c => c.status === 'completed').length
  const disputedCount  = CONTRACTS.filter(c => c.status === 'disputed').length
  const renewalSoonCount = CONTRACTS.filter(c => c.renewalDays !== undefined && c.renewalDays <= 45).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2535' }}>📃 Контракты</div>
          <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
            {role === 'dispatcher'
              ? 'Все контракты с клиентами — активные, пробные и завершённые'
              : 'Ваши контракты с диспетчерами'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 10, padding: 3 }}>
            {(['contracts', 'templates'] as const).map(t => (
              <button key={t} onClick={() => setActiveMainTab(t)} style={{
                padding: '7px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                background: activeMainTab === t ? '#fff' : 'transparent',
                color: activeMainTab === t ? '#4BAED4' : '#718096',
                boxShadow: activeMainTab === t ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
              }}>
                {t === 'contracts' ? '📋 Контракты' : '📄 Шаблоны'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNewContract(true)} className="btn btn-primary">
            + Новый контракт
          </button>
        </div>
      </div>

      {/* Renewal alerts */}
      {renewalSoonCount > 0 && activeMainTab === 'contracts' && (
        <div style={{ padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FEEBC8', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            <strong style={{ color: '#975A16' }}>Приближается обновление контрактов:</strong>{' '}
            <span style={{ color: '#4A5568' }}>
              {CONTRACTS.filter(c => c.renewalDays !== undefined && c.renewalDays <= 45).map(c => `${c.id} (через ${c.renewalDays} дн.)`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Disputed alerts */}
      {disputedCount > 0 && activeMainTab === 'contracts' && (
        <div style={{ padding: '12px 16px', background: '#FFF5F5', border: '1px solid #FC8181', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <strong style={{ color: '#C53030' }}>Открытые споры:</strong>{' '}
            <span style={{ color: '#4A5568' }}>
              {CONTRACTS.filter(c => c.status === 'disputed').map(c => c.id).join(', ')} — медиация ожидается
            </span>
          </div>
        </div>
      )}

      {/* Templates view */}
      {activeMainTab === 'templates' && (
        <div>
          <div style={{ fontSize: 14, color: '#718096', marginBottom: 16 }}>Готовые шаблоны контрактов для быстрого создания. Нажмите «Использовать», чтобы начать.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {CONTRACT_TEMPLATES.map(tpl => (
              <div key={tpl.id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 20px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>{tpl.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: '#EBF8FF', color: '#2B6CB0' }}>{tpl.category}</span>
                </div>
                <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.5, marginBottom: 14 }}>{tpl.description}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#4BAED4' }}>{tpl.defaultRate}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>Ставка</div>
                  </div>
                  <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#38C770' }}>${tpl.defaultRpm}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>RPM гарантия</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#A0AEC0' }}>Использований: {tpl.usageCount}</span>
                  <button onClick={() => { setShowNewContract(true); setActiveMainTab('contracts') }} className="btn btn-primary btn-sm">
                    Использовать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts view */}
      {activeMainTab === 'contracts' && (
        <>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { label: 'Активных',  value: activeCount,    color: '#276749', bg: '#F0FFF4', icon: '🟢', filter: 'active' as const },
              { label: 'Пробных',   value: trialCount,     color: '#2B6CB0', bg: '#EBF8FF', icon: '🔵', filter: 'trial' as const },
              { label: 'Ожидают',   value: pendingCount,   color: '#975A16', bg: '#FFFFF0', icon: '⏳', filter: 'pending' as const },
              { label: 'Завершены', value: completedCount, color: '#553C9A', bg: '#FAF5FF', icon: '✅', filter: 'completed' as const },
              { label: 'В споре',   value: disputedCount,  color: '#C53030', bg: '#FFF5F5', icon: '⚠️', filter: 'disputed' as const },
            ].map(k => (
              <div key={k.label} style={{
                background: k.bg, borderRadius: 12, padding: '12px 14px',
                border: `1.5px solid ${k.color}33`, cursor: 'pointer',
              }} onClick={() => setStatusFilter(statusFilter === k.filter ? 'all' : k.filter)}>
                <div style={{ fontSize: 18 }}>{k.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color, marginTop: 4 }}>{k.value}</div>
                <div style={{ fontSize: 11, color: k.color + 'cc' }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Filter + Search */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" placeholder="🔍 Поиск по контракту, имени, типу..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 320 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'active', 'trial', 'pending', 'completed', 'terminated', 'disputed'] as const).map(f => (
                <button key={f} onClick={() => setStatusFilter(f)} style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                  background: statusFilter === f ? '#1A2535' : '#F7FAFC',
                  color: statusFilter === f ? '#fff' : '#718096',
                  fontWeight: statusFilter === f ? 700 : 500,
                }}>
                  {f === 'all' ? 'Все' : STATUS_CONF[f]?.label ?? f}
                </button>
              ))}
            </div>
          </div>

          {/* Split panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
            <div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#A0AEC0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                  <div>Нет контрактов</div>
                </div>
              ) : (
                filtered.map(c => {
                  const sc = STATUS_CONF[c.status]
                  const isSelected = selected.id === c.id
                  return (
                    <div key={c.id} onClick={() => setSelected(c)} style={{
                      background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
                      border: isSelected ? '2px solid #4BAED4' : '1.5px solid #E2E8F0',
                      cursor: 'pointer', transition: 'border .15s',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600 }}>{c.id}</div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {c.renewalDays !== undefined && c.renewalDays <= 45 && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 5, background: '#FEEBC8', color: '#975A16' }}>🔔 {c.renewalDays}д</span>
                          )}
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{sc.icon} {sc.label}</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 2 }}>
                        {role === 'dispatcher' ? c.ownerOp.name : c.dispatcher.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#718096', marginBottom: 8 }}>{c.trucks} × {c.truckType} · {c.lanes}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#A0AEC0' }}>{c.startDate}</span>
                        {c.totalLoads > 0 && (
                          <span style={{ color: '#48BB78', fontWeight: 700 }}>${c.totalRevenue.toLocaleString()} · {c.totalLoads} рейсов</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <ContractDetail contract={selected} role={role} onDispute={() => setShowDispute(true)} onTerminate={() => setShowTerminate(true)} />
          </div>
        </>
      )}

      {showDispute    && <DisputeModal   contract={selected} onClose={() => setShowDispute(false)} />}
      {showTerminate  && <TerminateModal contract={selected} onClose={() => setShowTerminate(false)} />}
      {showNewContract && <NewContractModal onClose={() => setShowNewContract(false)} />}
    </div>
  )
}
