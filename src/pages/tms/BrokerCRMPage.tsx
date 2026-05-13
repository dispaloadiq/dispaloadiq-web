import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type PaySpeed = 'fast' | 'normal' | 'slow' | 'unknown'
type BrokerStatus = 'active' | 'preferred' | 'blocked' | 'prospect'

interface LaneRecord {
  from: string
  to: string
  lastRate: number
  avgRate: number
  loads: number
  lastDate: string
}

interface CallRecord {
  id: string
  date: string
  duration: string
  type: 'inbound' | 'outbound'
  notes: string
  outcome: 'booked' | 'negotiated' | 'no-answer' | 'info' | 'dispute'
}

interface EmailRecord {
  id: string
  date: string
  subject: string
  direction: 'sent' | 'received'
  preview: string
}

interface RateNegotiation {
  date: string
  lane: string
  offered: number
  counter: number
  final: number
  won: boolean
}

interface OutreachReminder {
  date: string
  note: string
  priority: 'high' | 'normal' | 'low'
}

interface BrokerContact {
  id: string
  name: string
  company: string
  mc: string
  phone: string
  email: string
  status: BrokerStatus
  paySpeed: PaySpeed
  avgDaysToPayment: number
  creditScore: number
  totalLoads: number
  totalRevenue: number
  onTimePaymentPct: number
  lanes: LaneRecord[]
  negotiations: RateNegotiation[]
  callLog: CallRecord[]
  emailHistory: EmailRecord[]
  reminder: OutreachReminder | null
  notes: string
  tags: string[]
  addedDate: string
  lastContact: string
}

interface AddBrokerForm {
  name: string
  company: string
  mc: string
  phone: string
  email: string
  notes: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const BROKERS: BrokerContact[] = [
  {
    id: 'B-001',
    name: 'Kevin Morris',
    company: 'Echo Global Logistics',
    mc: 'MC-193042',
    phone: '(312) 555-0147',
    email: 'k.morris@echo.com',
    status: 'preferred',
    paySpeed: 'fast',
    avgDaysToPayment: 18,
    creditScore: 94,
    totalLoads: 47,
    totalRevenue: 89_420,
    onTimePaymentPct: 98,
    tags: ['quick-pay', 'dry-van', 'midwest'],
    addedDate: '2024-03-10',
    lastContact: '2 days ago',
    notes: 'Excellent partner. Clear RCs, payments always on time. Specializes in Midwest–Southeast corridor.',
    reminder: { date: 'May 20, 2026', note: 'Follow up on Chicago–Atlanta lane rate increase', priority: 'high' },
    lanes: [
      { from: 'Chicago, IL',   to: 'Dallas, TX',    lastRate: 1_854, avgRate: 1_790, loads: 14, lastDate: '2026-05-06' },
      { from: 'Chicago, IL',   to: 'Atlanta, GA',   lastRate: 2_100, avgRate: 2_050, loads: 10, lastDate: '2026-04-28' },
      { from: 'Indianapolis',  to: 'Nashville, TN', lastRate: 1_200, avgRate: 1_150, loads: 8,  lastDate: '2026-04-15' },
      { from: 'St. Louis, MO', to: 'Memphis, TN',   lastRate: 980,   avgRate: 920,   loads: 7,  lastDate: '2026-03-30' },
      { from: 'Detroit, MI',   to: 'Charlotte, NC', lastRate: 1_680, avgRate: 1_620, loads: 8,  lastDate: '2026-05-01' },
    ],
    negotiations: [
      { date: '2026-04-28', lane: 'Chicago → Atlanta',     offered: 1_950, counter: 2_200, final: 2_100, won: true  },
      { date: '2026-04-10', lane: 'Indianapolis → Nashville', offered: 1_050, counter: 1_300, final: 1_200, won: true },
      { date: '2026-03-15', lane: 'Chicago → Dallas',       offered: 1_700, counter: 1_950, final: 1_800, won: true  },
    ],
    callLog: [
      { id:'C1', date:'May 8, 2026',  duration:'12 min', type:'outbound', notes:'Discussed Chicago–Atlanta rate bump. Kevin agreed to $2,100.', outcome:'negotiated' },
      { id:'C2', date:'May 2, 2026',  duration:'5 min',  type:'inbound',  notes:'Kevin called with 2 available loads for next week.', outcome:'booked' },
      { id:'C3', date:'Apr 25, 2026', duration:'8 min',  type:'outbound', notes:'Rate confirmation for upcoming loads. All good.', outcome:'info' },
    ],
    emailHistory: [
      { id:'E1', date:'May 9, 2026',  direction:'received', subject:'RC Confirmation — EG-920441',       preview:'Attached rate confirmation for Chicago to Dallas load...' },
      { id:'E2', date:'May 7, 2026',  direction:'sent',     subject:'Re: Rate Increase Request',         preview:'Hi Kevin, I wanted to follow up on the Atlanta lane...' },
      { id:'E3', date:'Apr 29, 2026', direction:'received', subject:'Load Availability — May 5–10',      preview:'Hey, we have 3 loads available for your area next week...' },
    ],
  },
  {
    id: 'B-002',
    name: 'Sandra Liu',
    company: 'Coyote Logistics',
    mc: 'MC-284711',
    phone: '(773) 555-0291',
    email: 's.liu@coyote.com',
    status: 'active',
    paySpeed: 'normal',
    avgDaysToPayment: 28,
    creditScore: 81,
    totalLoads: 31,
    totalRevenue: 56_700,
    onTimePaymentPct: 89,
    tags: ['dry-van', 'reefer', 'national'],
    addedDate: '2024-06-20',
    lastContact: '5 days ago',
    notes: 'Good rates to the West. RC sometimes delayed by 1–2 days. Always clarify lumper responsibility.',
    reminder: { date: 'May 22, 2026', note: 'Ask about summer reefer lanes', priority: 'normal' },
    lanes: [
      { from: 'Chicago, IL',  to: 'Los Angeles, CA', lastRate: 3_200, avgRate: 3_100, loads: 9,  lastDate: '2026-05-03' },
      { from: 'Memphis, TN',  to: 'Phoenix, AZ',     lastRate: 2_450, avgRate: 2_380, loads: 8,  lastDate: '2026-04-20' },
      { from: 'Dallas, TX',   to: 'Denver, CO',      lastRate: 1_750, avgRate: 1_700, loads: 7,  lastDate: '2026-04-10' },
      { from: 'Atlanta, GA',  to: 'Miami, FL',       lastRate: 950,   avgRate: 900,   loads: 7,  lastDate: '2026-03-25' },
    ],
    negotiations: [
      { date: '2026-05-03', lane: 'Chicago → LA',      offered: 2_950, counter: 3_400, final: 3_200, won: true  },
      { date: '2026-04-05', lane: 'Dallas → Denver',   offered: 1_600, counter: 1_850, final: 1_750, won: true  },
      { date: '2026-03-10', lane: 'Atlanta → Miami',   offered: 820,   counter: 1_000, final: 950,   won: true  },
    ],
    callLog: [
      { id:'C1', date:'May 7, 2026',  duration:'9 min',  type:'outbound', notes:'Called about upcoming LA loads. Sandra confirmed rate.', outcome:'booked' },
      { id:'C2', date:'Apr 28, 2026', duration:'4 min',  type:'inbound',  notes:'Quick check-in on delivery ETA.', outcome:'info' },
    ],
    emailHistory: [
      { id:'E1', date:'May 6, 2026',  direction:'received', subject:'RC — CL-773201',                   preview:'Rate confirmation attached for Memphis to Phoenix...' },
      { id:'E2', date:'Apr 30, 2026', direction:'sent',     subject:'Invoice Submission INV-2042',       preview:'Hi Sandra, please find attached invoice for load...' },
    ],
  },
  {
    id: 'B-003',
    name: 'Derek Shaw',
    company: 'XPO Logistics',
    mc: 'MC-091827',
    phone: '(860) 555-0382',
    email: 'd.shaw@xpo.com',
    status: 'active',
    paySpeed: 'normal',
    avgDaysToPayment: 32,
    creditScore: 77,
    totalLoads: 19,
    totalRevenue: 34_100,
    onTimePaymentPct: 84,
    tags: ['flatbed', 'oversize', 'northeast'],
    addedDate: '2024-09-05',
    lastContact: '1 week ago',
    notes: 'Flatbed specialist. Above-market rates. Documentation sometimes incomplete — always request BOL before dispatch.',
    reminder: null,
    lanes: [
      { from: 'New York, NY',  to: 'Chicago, IL',    lastRate: 2_800, avgRate: 2_700, loads: 7,  lastDate: '2026-04-25' },
      { from: 'Boston, MA',    to: 'Atlanta, GA',    lastRate: 2_200, avgRate: 2_150, loads: 6,  lastDate: '2026-04-12' },
      { from: 'Philadelphia',  to: 'Nashville, TN',  lastRate: 1_950, avgRate: 1_900, loads: 6,  lastDate: '2026-03-28' },
    ],
    negotiations: [
      { date: '2026-04-22', lane: 'NY → Chicago',    offered: 2_500, counter: 2_900, final: 2_800, won: true  },
      { date: '2026-03-28', lane: 'Philadelphia → Nashville', offered: 1_800, counter: 2_000, final: 1_950, won: true },
    ],
    callLog: [
      { id:'C1', date:'May 5, 2026',  duration:'15 min', type:'outbound', notes:'Negotiated NY–Chicago flatbed rate. Derek agreed to $2,800.', outcome:'negotiated' },
      { id:'C2', date:'Apr 22, 2026', duration:'6 min',  type:'inbound',  notes:'Derek called about oversize load possibility.', outcome:'info' },
    ],
    emailHistory: [
      { id:'E1', date:'May 3, 2026',  direction:'received', subject:'Flatbed Load — XP-211098',          preview:'Hi, we have an oversized flatbed load from NJ...' },
      { id:'E2', date:'Apr 20, 2026', direction:'sent',     subject:'Invoice XP-April Loads',            preview:'Attached are invoices for the 4 loads completed...' },
    ],
  },
  {
    id: 'B-004',
    name: 'Maria Gonzalez',
    company: 'TQL (Total Quality Logistics)',
    mc: 'MC-372901',
    phone: '(513) 555-0544',
    email: 'm.gonzalez@tql.com',
    status: 'prospect',
    paySpeed: 'unknown',
    avgDaysToPayment: 0,
    creditScore: 88,
    totalLoads: 0,
    totalRevenue: 0,
    onTimePaymentPct: 0,
    tags: ['dry-van', 'nationwide'],
    addedDate: '2026-04-30',
    lastContact: '3 days ago',
    notes: 'Met at conference. Offered steady Chicago–Texas loads. Waiting for first test run.',
    reminder: { date: 'May 18, 2026', note: 'Send W-9 and carrier packet to Maria', priority: 'high' },
    lanes: [],
    negotiations: [],
    callLog: [
      { id:'C1', date:'May 9, 2026',  duration:'20 min', type:'inbound',  notes:'Maria introduced her freight needs. Chicago–Texas primary lane.', outcome:'info' },
    ],
    emailHistory: [
      { id:'E1', date:'May 8, 2026',  direction:'received', subject:'Carrier Packet Request',             preview:'Hi, per our conversation please send your carrier...' },
      { id:'E2', date:'May 9, 2026',  direction:'sent',     subject:'Carrier Packet — [Your Company]',   preview:'Hi Maria, attached is our carrier packet with insurance...' },
    ],
  },
  {
    id: 'B-005',
    name: 'James Park',
    company: 'Transplace',
    mc: 'MC-481623',
    phone: '(972) 555-0673',
    email: 'j.park@transplace.com',
    status: 'blocked',
    paySpeed: 'slow',
    avgDaysToPayment: 62,
    creditScore: 41,
    totalLoads: 8,
    totalRevenue: 12_400,
    onTimePaymentPct: 37,
    tags: ['slow-pay', 'disputed'],
    addedDate: '2024-01-15',
    lastContact: '2 months ago',
    notes: '⚠️ BLOCKED. Payment delays 60+ days, two invoice disputes. Do not accept loads without prepayment.',
    reminder: null,
    lanes: [
      { from: 'Houston, TX', to: 'Chicago, IL', lastRate: 1_900, avgRate: 1_850, loads: 8, lastDate: '2025-12-10' },
    ],
    negotiations: [],
    callLog: [
      { id:'C1', date:'Dec 12, 2025', duration:'22 min', type:'outbound', notes:'Called to dispute unpaid invoice INV-1840. James claimed they did not receive BOL.', outcome:'dispute' },
      { id:'C2', date:'Nov 28, 2025', duration:'8 min',  type:'outbound', notes:'Third call about overdue payment.', outcome:'dispute' },
    ],
    emailHistory: [
      { id:'E1', date:'Jan 5, 2026',  direction:'sent',     subject:'Final Notice — Invoice INV-1840',   preview:'This is our final notice regarding unpaid invoice...' },
      { id:'E2', date:'Dec 15, 2025', direction:'received', subject:'Re: Invoice Dispute',               preview:'We are reviewing the documentation you submitted...' },
    ],
  },
  {
    id: 'B-006',
    name: 'Rachel Kim',
    company: 'Amazon Freight',
    mc: 'MC-601284',
    phone: '(206) 555-0811',
    email: 'r.kim@amazonfreight.com',
    status: 'preferred',
    paySpeed: 'fast',
    avgDaysToPayment: 14,
    creditScore: 97,
    totalLoads: 34,
    totalRevenue: 72_800,
    onTimePaymentPct: 100,
    tags: ['quick-pay', 'national', 'high-volume'],
    addedDate: '2025-01-20',
    lastContact: 'Yesterday',
    notes: 'Top-tier partner. Amazon pays in 14 days, zero disputes. High-volume national lanes, mostly dry van.',
    reminder: { date: 'May 16, 2026', note: 'Request Q3 lane projections from Rachel', priority: 'normal' },
    lanes: [
      { from: 'Chicago, IL',    to: 'Seattle, WA',   lastRate: 4_100, avgRate: 3_900, loads: 12, lastDate: '2026-05-08' },
      { from: 'Dallas, TX',     to: 'Los Angeles, CA', lastRate: 2_800, avgRate: 2_700, loads: 10, lastDate: '2026-05-01' },
      { from: 'Atlanta, GA',    to: 'New York, NY',  lastRate: 2_400, avgRate: 2_300, loads: 8,  lastDate: '2026-04-22' },
      { from: 'Phoenix, AZ',    to: 'Denver, CO',    lastRate: 1_580, avgRate: 1_480, loads: 4,  lastDate: '2026-04-10' },
    ],
    negotiations: [
      { date: '2026-05-01', lane: 'Chicago → Seattle',  offered: 3_800, counter: 4_300, final: 4_100, won: true  },
      { date: '2026-04-15', lane: 'Dallas → LA',        offered: 2_500, counter: 3_000, final: 2_800, won: true  },
      { date: '2026-04-02', lane: 'Atlanta → New York', offered: 2_200, counter: 2_500, final: 2_400, won: true  },
    ],
    callLog: [
      { id:'C1', date:'May 9, 2026',  duration:'18 min', type:'outbound', notes:'Confirmed Q2 Seattle lane. Rachel offered 3 loads/month guaranteed.', outcome:'booked'     },
      { id:'C2', date:'May 1, 2026',  duration:'11 min', type:'inbound',  notes:'Rachel called about coverage for Dallas–LA next week.', outcome:'booked'     },
      { id:'C3', date:'Apr 20, 2026', duration:'7 min',  type:'outbound', notes:'Rate negotiation for Chicago–Seattle. Agreed on $4,100.', outcome:'negotiated' },
    ],
    emailHistory: [
      { id:'E1', date:'May 9, 2026',  direction:'received', subject:'Amazon Freight — May Lane Confirmations', preview:'Hi, confirming the following loads for May...' },
      { id:'E2', date:'May 5, 2026',  direction:'sent',     subject:'Invoice Submission — April Loads',       preview:'Hi Rachel, attaching April invoices...' },
      { id:'E3', date:'Apr 28, 2026', direction:'received', subject:'Payment Processed — Loads Apr 1–15',     preview:'Payment of $34,200 has been processed via ACH...' },
    ],
  },
  {
    id: 'B-007',
    name: 'Tom Bradley',
    company: 'Uber Freight',
    mc: 'MC-722849',
    phone: '(415) 555-0938',
    email: 't.bradley@uberfreight.com',
    status: 'active',
    paySpeed: 'fast',
    avgDaysToPayment: 21,
    creditScore: 85,
    totalLoads: 22,
    totalRevenue: 38_200,
    onTimePaymentPct: 91,
    tags: ['quick-pay', 'app-based', 'dry-van'],
    addedDate: '2025-03-08',
    lastContact: '4 days ago',
    notes: 'Tech-forward platform. All booking via app. Rates slightly below market but very reliable payment.',
    reminder: null,
    lanes: [
      { from: 'Chicago, IL',  to: 'Dallas, TX',  lastRate: 1_720, avgRate: 1_680, loads: 10, lastDate: '2026-05-04' },
      { from: 'Dallas, TX',   to: 'Houston, TX', lastRate: 680,   avgRate: 640,   loads: 7,  lastDate: '2026-04-18' },
      { from: 'Detroit, MI',  to: 'Chicago, IL', lastRate: 820,   avgRate: 780,   loads: 5,  lastDate: '2026-03-30' },
    ],
    negotiations: [
      { date: '2026-05-04', lane: 'Chicago → Dallas', offered: 1_600, counter: 1_800, final: 1_720, won: true  },
      { date: '2026-02-14', lane: 'Detroit → Chicago', offered: 720,  counter: 900,  final: 820,  won: true  },
    ],
    callLog: [
      { id:'C1', date:'May 6, 2026',  duration:'8 min',  type:'outbound', notes:'Rate discussion for Chicago–Dallas. Tom agreed to $1,720.', outcome:'negotiated' },
      { id:'C2', date:'Apr 25, 2026', duration:'5 min',  type:'inbound',  notes:'Tom confirmed 2 loads available via the app.', outcome:'booked' },
    ],
    emailHistory: [
      { id:'E1', date:'May 7, 2026',  direction:'received', subject:'Uber Freight — Rate Confirmation',       preview:'Your rate of $1,720 has been confirmed for load UF-881...' },
      { id:'E2', date:'Apr 20, 2026', direction:'sent',     subject:'Invoice UF-April-Batch',                 preview:'Attaching April invoices for 6 loads completed...' },
    ],
  },
  {
    id: 'B-008',
    name: 'Lisa Chen',
    company: 'Loadsmart',
    mc: 'MC-848120',
    phone: '(312) 555-1028',
    email: 'l.chen@loadsmart.com',
    status: 'prospect',
    paySpeed: 'unknown',
    avgDaysToPayment: 0,
    creditScore: 82,
    totalLoads: 0,
    totalRevenue: 0,
    onTimePaymentPct: 0,
    tags: ['digital', 'instant-booking'],
    addedDate: '2026-05-01',
    lastContact: '1 week ago',
    notes: 'Digital-first platform. Offered instant-booking loads for Midwest. Credit check pending.',
    reminder: { date: 'May 25, 2026', note: 'Complete credit check before booking first load', priority: 'normal' },
    lanes: [],
    negotiations: [],
    callLog: [
      { id:'C1', date:'May 3, 2026', duration:'14 min', type:'inbound', notes:'Lisa introduced Loadsmart platform. Interested in regular Midwest coverage.', outcome:'info' },
    ],
    emailHistory: [
      { id:'E1', date:'May 4, 2026', direction:'received', subject:'Welcome to Loadsmart Carrier Network', preview:'Hi, we are excited to have you in our carrier network...' },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONF: Record<BrokerStatus, { label: string; color: string; bg: string }> = {
  preferred: { label: '⭐ Preferred', color: '#B7791F', bg: '#FEFCBF' },
  active:    { label: '✅ Active',    color: '#276749', bg: '#F0FFF4' },
  prospect:  { label: '🔍 Prospect', color: '#2C7A7B', bg: '#E6FFFA' },
  blocked:   { label: '🚫 Blocked',  color: '#9B2C2C', bg: '#FFF5F5' },
}

const PAY_CONF: Record<PaySpeed, { label: string; color: string }> = {
  fast:    { label: '⚡ Fast (<21d)',  color: '#48BB78' },
  normal:  { label: '🕐 Normal',       color: '#ECC94B' },
  slow:    { label: '🐢 Slow (45d+)',  color: '#E53E3E' },
  unknown: { label: '❓ Unknown',      color: '#A0AEC0' },
}

const OUTCOME_CONF: Record<string, { label: string; color: string; bg: string }> = {
  booked:     { label: '📋 Booked',     color: '#276749', bg: '#F0FFF4' },
  negotiated: { label: '💬 Negotiated', color: '#2C7A9A', bg: '#EBF8FF' },
  'no-answer':{ label: '📵 No Answer',  color: '#718096', bg: '#F4F6F9' },
  info:       { label: 'ℹ️ Info',       color: '#553C9A', bg: '#FAF5FF' },
  dispute:    { label: '⚠️ Dispute',    color: '#9B2C2C', bg: '#FFF5F5' },
}

function creditColor(score: number) {
  if (score >= 85) return '#48BB78'
  if (score >= 65) return '#ECC94B'
  return '#E53E3E'
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Components ────────────────────────────────────────────────────────────────
function CreditRing({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const pct = score / 100
  return (
    <svg width={68} height={68} viewBox="0 0 68 68">
      <circle cx={34} cy={34} r={r} fill="none" stroke="#E2E8F0" strokeWidth={6} />
      <circle
        cx={34} cy={34} r={r} fill="none"
        stroke={creditColor(score)} strokeWidth={6}
        strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      <text x={34} y={34} textAnchor="middle" dominantBaseline="central"
        fontSize={15} fontWeight={800} fill={creditColor(score)}>{score}</text>
    </svg>
  )
}

interface AddBrokerModalProps {
  onClose: () => void
  onSave: (f: AddBrokerForm) => void
}
function AddBrokerModal({ onClose, onSave }: AddBrokerModalProps) {
  const [form, setForm] = useState<AddBrokerForm>({ name: '', company: '', mc: '', phone: '', email: '', notes: '' })
  const set = (k: keyof AddBrokerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxWidth: '95vw', boxShadow: '0 16px 48px rgba(0,0,0,.2)' }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>➕ Add Broker / Agent</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {([['name', 'Contact Name *'], ['company', 'Company *'], ['mc', 'MC Number'], ['phone', 'Phone'], ['email', 'Email']] as [keyof AddBrokerForm, string][]).map(([k, lbl]) => (
            <div key={k} style={{ gridColumn: k === 'email' ? '1/-1' : undefined }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>{lbl}</label>
              <input
                value={form[k]} onChange={set(k)}
                style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' }}
                placeholder={lbl.replace(' *', '')}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea
              value={form.notes} onChange={set('notes')}
              rows={3}
              style={{ width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="First impressions, specialties, referral source..."
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button
            onClick={() => { if (form.name && form.company) { onSave(form); onClose() } }}
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#4BAED4', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
          >Save Broker</button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BrokerCRMPage() {
  const [brokers, setBrokers] = useState<BrokerContact[]>(BROKERS)
  const [selected, setSelected] = useState<BrokerContact>(BROKERS[0])
  const [filterStatus, setFilterStatus] = useState<BrokerStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [laneSort, setLaneSort] = useState<'lastRate' | 'loads'>('lastRate')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'lanes' | 'notes' | 'activity'>('overview')

  const filtered = brokers.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) &&
        !b.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sortedLanes = [...(selected.lanes)].sort((a, b) =>
    laneSort === 'lastRate' ? b.lastRate - a.lastRate : b.loads - a.loads
  )

  function handleAddBroker(f: AddBrokerForm) {
    const newB: BrokerContact = {
      id: `B-00${brokers.length + 1}`,
      name: f.name, company: f.company, mc: f.mc, phone: f.phone, email: f.email,
      status: 'prospect', paySpeed: 'unknown', avgDaysToPayment: 0,
      creditScore: 70, totalLoads: 0, totalRevenue: 0, onTimePaymentPct: 0,
      lanes: [], negotiations: [], callLog: [], emailHistory: [],
      notes: f.notes, tags: [], reminder: null,
      addedDate: new Date().toISOString().split('T')[0],
      lastContact: 'Just now',
    }
    setBrokers(p => [...p, newB])
    setSelected(newB)
  }

  // KPIs
  const totalRev    = brokers.reduce((s, b) => s + b.totalRevenue, 0)
  const activeCount = brokers.filter(b => b.status === 'active' || b.status === 'preferred').length
  const avgPay      = brokers.filter(b => b.avgDaysToPayment > 0).reduce((s, b) => s + b.avgDaysToPayment, 0)
                      / (brokers.filter(b => b.avgDaysToPayment > 0).length || 1)
  const reminders   = brokers.filter(b => b.reminder !== null).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 18 }}>
        {[
          { label: 'Total Brokers',     value: brokers.length,           sub: `${activeCount} active`,                    icon: '🤝', color: '#4BAED4' },
          { label: 'Total Revenue',     value: fmt(totalRev),            sub: 'all time',                                  icon: '💰', color: '#48BB78' },
          { label: 'Avg. Payment Days', value: `${avgPay.toFixed(0)}d`,  sub: 'across active brokers',                     icon: '📅', color: '#ECC94B' },
          { label: 'Blocked / At Risk', value: brokers.filter(b => b.status === 'blocked').length,
                                         sub: `${brokers.filter(b => b.paySpeed === 'slow').length} slow-pay`, icon: '🚫', color: '#E53E3E' },
          { label: 'Open Reminders',    value: reminders,                sub: 'follow-up tasks',                           icon: '🔔', color: '#8B5CF6' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{k.label}</div>
            <div style={{ fontSize: 11, color: '#718096' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

        {/* ── Left: broker list ──────────────────────────────────────────── */}
        <div style={{ width: 300, flexShrink: 0, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search + add */}
          <div style={{ padding: 12, borderBottom: '1px solid #F0F4F8', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍  Search brokers..."
                style={{ flex: 1, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 10px', fontSize: 12 }}
              />
              <button
                onClick={() => setShowAddModal(true)}
                style={{ padding: '7px 12px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >+ Add</button>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(['all', 'preferred', 'active', 'prospect', 'blocked'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '3px 8px', borderRadius: 20, border: '1.5px solid',
                    borderColor: filterStatus === s ? '#4BAED4' : '#E2E8F0',
                    background: filterStatus === s ? '#EBF8FF' : '#fff',
                    color: filterStatus === s ? '#2C7A9A' : '#718096',
                    fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  }}
                >{s === 'all' ? 'All' : STATUS_CONF[s].label}</button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(b => {
              const sc = STATUS_CONF[b.status]
              const pc = PAY_CONF[b.paySpeed]
              return (
                <div
                  key={b.id}
                  onClick={() => { setSelected(b); setActiveTab('overview') }}
                  style={{
                    padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid #F0F4F8',
                    background: selected.id === b.id ? '#EBF8FF' : 'transparent',
                    borderLeft: selected.id === b.id ? '3px solid #4BAED4' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{b.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>{b.company}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: pc.color, fontWeight: 600 }}>{pc.label}</span>
                    {b.totalLoads > 0 && (
                      <span style={{ fontSize: 11, color: '#A0AEC0' }}>{b.totalLoads} loads · {fmt(b.totalRevenue)}</span>
                    )}
                  </div>
                  {b.reminder && (
                    <div style={{ marginTop: 5, fontSize: 10, color: '#8B5CF6', fontWeight: 600 }}>🔔 {b.reminder.date}</div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>No brokers found</div>
            )}
          </div>
        </div>

        {/* ── Right: detail panel ────────────────────────────────────────── */}
        <div style={{ flex: 1, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 22px', borderBottom: '1.5px solid #F0F4F8', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#EBF8FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#4BAED4', flexShrink: 0,
            }}>{selected.name.charAt(0)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2535' }}>{selected.name}</div>
              <div style={{ fontSize: 13, color: '#718096' }}>{selected.company} · {selected.mc || 'MC N/A'}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                {selected.tags.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: '2px 7px', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8, color: '#718096' }}>#{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`tel:${selected.phone}`} style={{
                padding: '8px 14px', borderRadius: 8, background: '#F0FFF4', color: '#276749',
                border: '1.5px solid #C6F6D5', fontSize: 12, fontWeight: 700, textDecoration: 'none',
              }}>📞 Call</a>
              <a href={`mailto:${selected.email}`} style={{
                padding: '8px 14px', borderRadius: 8, background: '#EBF8FF', color: '#2C7A9A',
                border: '1.5px solid #BEE3F8', fontSize: 12, fontWeight: 700, textDecoration: 'none',
              }}>✉️ Email</a>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid #E2E8F0', padding: '0 22px' }}>
            {(['overview', 'lanes', 'activity', 'notes'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                border: 'none', background: 'none',
                borderBottom: activeTab === t ? '2.5px solid #4BAED4' : '2.5px solid transparent',
                color: activeTab === t ? '#4BAED4' : '#718096',
              }}>
                {t === 'overview' ? '📊 Overview'
                  : t === 'lanes' ? '🗺️ Lanes'
                  : t === 'activity' ? `📞 Activity ${selected.callLog.length > 0 ? `(${selected.callLog.length})` : ''}`
                  : '📝 Notes'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>

            {/* ── OVERVIEW tab ────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Score + metrics row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
                  <div style={{ background: '#F7FAFC', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                    <CreditRing score={selected.creditScore} />
                    <div style={{ fontSize: 11, color: '#718096', marginTop: 6 }}>Credit Score</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: creditColor(selected.creditScore) }}>
                      {selected.creditScore >= 85 ? 'Excellent' : selected.creditScore >= 65 ? 'Good' : 'Poor'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Total Loads',   value: selected.totalLoads || '—' },
                      { label: 'Total Revenue', value: selected.totalRevenue > 0 ? fmt(selected.totalRevenue) : '—' },
                      { label: 'On-Time Pay',   value: selected.onTimePaymentPct > 0 ? `${selected.onTimePaymentPct}%` : '—' },
                      { label: 'Avg Pay Days',  value: selected.avgDaysToPayment > 0 ? `${selected.avgDaysToPayment}d` : '—' },
                      { label: 'Pay Speed',     value: PAY_CONF[selected.paySpeed].label },
                      { label: 'Last Contact',  value: selected.lastContact },
                    ].map(m => (
                      <div key={m.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 3 }}>{m.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact details */}
                <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#2D3748' }}>📋 Contact Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: '📞 Phone', value: selected.phone || '—' },
                      { label: '✉️ Email', value: selected.email || '—' },
                      { label: '🆔 MC Number', value: selected.mc || '—' },
                      { label: '📅 Added', value: selected.addedDate },
                    ].map(c => (
                      <div key={c.label}>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{c.label}</div>
                        <div style={{ fontSize: 13, color: '#2D3748', fontWeight: 500 }}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outreach reminder */}
                {selected.reminder && (
                  <div style={{ background: '#FAF5FF', border: '1.5px solid #E9D8FD', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 20 }}>🔔</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#553C9A' }}>Outreach Reminder</div>
                          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{selected.reminder.note}</div>
                          <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>Due: {selected.reminder.date}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                        background: selected.reminder.priority === 'high' ? '#FFF5F5' : '#F0FFF4',
                        color: selected.reminder.priority === 'high' ? '#C53030' : '#276749' }}>
                        {selected.reminder.priority === 'high' ? '🔴 High' : '🟢 Normal'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Status selector */}
                <div style={{ background: '#F7FAFC', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#2D3748' }}>🏷️ Status</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(['preferred', 'active', 'prospect', 'blocked'] as const).map(s => {
                      const sc = STATUS_CONF[s]
                      return (
                        <button
                          key={s}
                          onClick={() => {
                            const updated = { ...selected, status: s }
                            setBrokers(p => p.map(b => b.id === selected.id ? updated : b))
                            setSelected(updated)
                          }}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: '1.5px solid',
                            borderColor: selected.status === s ? sc.color : '#E2E8F0',
                            background: selected.status === s ? sc.bg : '#fff',
                            color: selected.status === s ? sc.color : '#718096',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >{sc.label}</button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── LANES tab ───────────────────────────────────────────── */}
            {activeTab === 'lanes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748' }}>
                    Lane Rate History · {selected.lanes.length} routes
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['lastRate', 'loads'] as const).map(s => (
                      <button key={s} onClick={() => setLaneSort(s)} style={{
                        padding: '5px 10px', borderRadius: 7, border: '1.5px solid',
                        borderColor: laneSort === s ? '#4BAED4' : '#E2E8F0',
                        background: laneSort === s ? '#EBF8FF' : '#fff',
                        color: laneSort === s ? '#2C7A9A' : '#718096',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}>{s === 'lastRate' ? 'By Rate' : 'By Volume'}</button>
                    ))}
                  </div>
                </div>

                {selected.lanes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#A0AEC0' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
                    <div style={{ fontSize: 14 }}>No lane history yet</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Complete a trip to start tracking lanes</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sortedLanes.map((l, i) => {
                      const diff = l.lastRate - l.avgRate
                      const pct = ((diff / l.avgRate) * 100).toFixed(1)
                      const up = diff >= 0
                      return (
                        <div key={i} style={{ background: '#F7FAFC', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>
                              {l.from} → {l.to}
                            </div>
                            <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>
                              {l.loads} loads · Last: {l.lastDate}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#2D3748' }}>{fmt(l.lastRate)}</div>
                            <div style={{ fontSize: 11, color: up ? '#48BB78' : '#E53E3E', fontWeight: 600 }}>
                              {up ? '▲' : '▼'} {Math.abs(diff).toLocaleString()} ({up ? '+' : ''}{pct}%) vs avg
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: 64 }}>
                            <div style={{ fontSize: 11, color: '#A0AEC0' }}>Avg rate</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#718096' }}>{fmt(l.avgRate)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Rate Negotiation History */}
                {selected.negotiations.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748', marginBottom: 10 }}>💬 Rate Negotiation History</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.negotiations.map((neg, i) => {
                        const gain = neg.final - neg.offered
                        return (
                          <div key={i} style={{ padding: '12px 16px', borderRadius: 12, background: neg.won ? '#F0FFF4' : '#FFF5F5', border: `1.5px solid ${neg.won ? '#C6F6D5' : '#FEB2B2'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>📍 {neg.lane}</div>
                                <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{neg.date}</div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                                background: neg.won ? '#C6F6D5' : '#FEB2B2', color: neg.won ? '#276749' : '#9B2C2C' }}>
                                {neg.won ? '✓ Won' : '✗ Lost'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 10, color: '#A0AEC0' }}>Their Offer</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#718096' }}>{fmt(neg.offered)}</div>
                              </div>
                              <div style={{ fontSize: 16, color: '#A0AEC0' }}>→</div>
                              <div>
                                <div style={{ fontSize: 10, color: '#A0AEC0' }}>My Counter</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#4BAED4' }}>{fmt(neg.counter)}</div>
                              </div>
                              <div style={{ fontSize: 16, color: '#A0AEC0' }}>→</div>
                              <div>
                                <div style={{ fontSize: 10, color: '#A0AEC0' }}>Final Rate</div>
                                <div style={{ fontSize: 14, fontWeight: 900, color: '#38C770' }}>{fmt(neg.final)}</div>
                              </div>
                              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <div style={{ fontSize: 10, color: '#A0AEC0' }}>Gained</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: gain > 0 ? '#38C770' : '#E53E3E' }}>
                                  {gain > 0 ? '+' : ''}{fmt(gain)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ACTIVITY tab ────────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Call Log */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748' }}>📞 Call Log ({selected.callLog.length})</div>
                    <button style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#4BAED4' }}>
                      + Log Call
                    </button>
                  </div>

                  {selected.callLog.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#A0AEC0', fontSize: 13 }}>No calls logged yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.callLog.map(c => {
                        const oc = OUTCOME_CONF[c.outcome] ?? OUTCOME_CONF['info']
                        return (
                          <div key={c.id} style={{ padding: '12px 16px', borderRadius: 12, background: '#F7FAFC', border: '1.5px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 18 }}>{c.type === 'inbound' ? '📲' : '📱'}</span>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.type === 'inbound' ? 'Inbound Call' : 'Outbound Call'}</div>
                                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{c.date} · {c.duration}</div>
                                </div>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: oc.bg, color: oc.color }}>
                                {oc.label}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>{c.notes}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Email History */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748' }}>✉️ Email History ({selected.emailHistory.length})</div>
                    <a href={`mailto:${selected.email}`} style={{
                      padding: '5px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#4BAED4', textDecoration: 'none',
                    }}>
                      + Compose
                    </a>
                  </div>

                  {selected.emailHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#A0AEC0', fontSize: 13 }}>No emails logged yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selected.emailHistory.map(e => (
                        <div key={e.id} style={{ padding: '12px 16px', borderRadius: 12, background: e.direction === 'received' ? '#F7FAFC' : '#EBF8FF', border: '1.5px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 16 }}>{e.direction === 'received' ? '📨' : '📤'}</span>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{e.subject}</div>
                                <div style={{ fontSize: 11, color: '#A0AEC0' }}>{e.date} · {e.direction === 'received' ? `From ${selected.name}` : 'Sent by you'}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                              background: e.direction === 'received' ? '#F0FFF4' : '#EBF8FF',
                              color: e.direction === 'received' ? '#276749' : '#2C7A9A' }}>
                              {e.direction === 'received' ? 'Received' : 'Sent'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: '#718096', paddingLeft: 24 }}>{e.preview}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── NOTES tab ───────────────────────────────────────────── */}
            {activeTab === 'notes' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748', marginBottom: 12 }}>📝 Notes & Memos</div>

                {/* Quick tips */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {['Add payment note', 'Mark slow-pay', 'Document dispute', 'Add lane preference'].map(tip => (
                    <button key={tip} style={{ padding: '4px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F7FAFC', fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#4BAED4' }}>
                      + {tip}
                    </button>
                  ))}
                </div>

                <NoteEditor
                  key={selected.id}
                  initialNote={selected.notes}
                  onSave={(note) => {
                    const updated = { ...selected, notes: note }
                    setBrokers(p => p.map(b => b.id === selected.id ? updated : b))
                    setSelected(updated)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && <AddBrokerModal onClose={() => setShowAddModal(false)} onSave={handleAddBroker} />}
    </div>
  )
}

// ── Note editor ───────────────────────────────────────────────────────────────
function NoteEditor({ initialNote, onSave }: { initialNote: string; onSave: (n: string) => void }) {
  const [note, setNote] = useState(initialNote)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    onSave(note)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={10}
        style={{
          width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10,
          padding: '12px 14px', fontSize: 13, lineHeight: 1.6, resize: 'vertical',
          fontFamily: 'inherit', boxSizing: 'border-box',
        }}
        placeholder="Add notes about this broker, payment behavior, contact preferences, special instructions..."
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{note.length} characters</div>
        <button onClick={handleSave} style={{
          padding: '8px 18px', borderRadius: 8, border: 'none',
          background: saved ? '#48BB78' : '#4BAED4', color: '#fff',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>{saved ? '✓ Saved!' : 'Save Notes'}</button>
      </div>
    </div>
  )
}
