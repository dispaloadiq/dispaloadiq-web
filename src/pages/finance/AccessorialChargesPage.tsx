import { useState } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────

type ChargeType =
  | 'detention'
  | 'layover'
  | 'tonu'
  | 'lumper'
  | 'fuel_surcharge'
  | 'overweight'
  | 'hazmat'
  | 'redelivery'
  | 'other'

type ChargeStatus =
  | 'pending'
  | 'submitted'
  | 'disputed'
  | 'paid'
  | 'denied'
  | 'waived'

interface AccessorialCharge {
  id: string
  type: ChargeType
  loadId: string
  broker: string
  location: string
  date: string
  amount: number
  status: ChargeStatus
  invoiceNumber: string
  submittedDate?: string
  paidDate?: string
  daysOutstanding: number
  notes: string
  supportingDocs: string[]
  brokerContact: string
  brokerEmail: string
  arrivalTime?: string
  departureTime?: string
  freeTimeHours?: number
  billableHours?: number
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_CHARGES: AccessorialCharge[] = [
  {
    id: 'TONU-001',
    type: 'tonu',
    loadId: 'LOAD-8821',
    broker: 'Echo Global',
    location: 'Chicago, IL',
    date: 'May 2, 2024',
    amount: 875,
    status: 'paid',
    invoiceNumber: 'INV-2024-041',
    submittedDate: 'May 3, 2024',
    paidDate: 'May 9, 2024',
    daysOutstanding: 0,
    notes: 'Shipper canceled load after truck was en route. TONU applied per rate con.',
    supportingDocs: ['Rate Confirmation', 'Truck Location Screenshot', 'Email Correspondence'],
    brokerContact: 'Marcus Webb',
    brokerEmail: 'mwebb@echoglobal.com',
  },
  {
    id: 'DET-002',
    type: 'detention',
    loadId: 'LOAD-8834',
    broker: 'TQL',
    location: 'Dallas, TX',
    date: 'May 3, 2024',
    amount: 337.5,
    status: 'paid',
    invoiceNumber: 'INV-2024-042',
    submittedDate: 'May 4, 2024',
    paidDate: 'May 11, 2024',
    daysOutstanding: 0,
    notes: 'Delayed at shipper due to dock congestion. 4.5 billable hours after 2hr free time.',
    supportingDocs: ['BOL signed', 'Detention receipt', 'Photos x3'],
    brokerContact: 'Sandra Kim',
    brokerEmail: 'skim@tql.com',
    arrivalTime: '08:00',
    departureTime: '14:30',
    freeTimeHours: 2,
    billableHours: 4.5,
  },
  {
    id: 'LUM-003',
    type: 'lumper',
    loadId: 'LOAD-8851',
    broker: 'CH Robinson',
    location: 'Atlanta, GA',
    date: 'May 5, 2024',
    amount: 225,
    status: 'pending',
    invoiceNumber: 'INV-2024-043',
    daysOutstanding: 7,
    notes: 'Lumper required by receiver. Cash paid at door. Receipt attached.',
    supportingDocs: ['Lumper receipt', 'BOL signed'],
    brokerContact: 'Derek Okafor',
    brokerEmail: 'dokafor@chrobinson.com',
  },
  {
    id: 'LAY-004',
    type: 'layover',
    loadId: 'LOAD-8862',
    broker: 'Coyote Logistics',
    location: 'Memphis, TN',
    date: 'May 6, 2024',
    amount: 450,
    status: 'submitted',
    invoiceNumber: 'INV-2024-044',
    submittedDate: 'May 7, 2024',
    daysOutstanding: 5,
    notes: 'Consignee closed unexpectedly. Had to layover overnight. Per policy $450/night.',
    supportingDocs: ['Rate Confirmation', 'Hotel receipt', 'Dispatch emails'],
    brokerContact: 'Vanessa Torres',
    brokerEmail: 'vtorres@coyotelogistics.com',
  },
  {
    id: 'FSC-005',
    type: 'fuel_surcharge',
    loadId: 'LOAD-8878',
    broker: 'Echo Global',
    location: 'Nashville, TN',
    date: 'May 7, 2024',
    amount: 184,
    status: 'paid',
    invoiceNumber: 'INV-2024-045',
    submittedDate: 'May 8, 2024',
    paidDate: 'May 14, 2024',
    daysOutstanding: 0,
    notes: 'Fuel surcharge per contract FSC table. DOE diesel index week of May 7.',
    supportingDocs: ['Rate Confirmation', 'FSC Table'],
    brokerContact: 'Marcus Webb',
    brokerEmail: 'mwebb@echoglobal.com',
  },
  {
    id: 'OVW-006',
    type: 'overweight',
    loadId: 'LOAD-8890',
    broker: 'XPO Logistics',
    location: 'Phoenix, AZ',
    date: 'May 8, 2024',
    amount: 650,
    status: 'disputed',
    invoiceNumber: 'INV-2024-046',
    submittedDate: 'May 9, 2024',
    daysOutstanding: 4,
    notes: 'Broker claims load was within legal weight. Scale ticket shows 82,400 lbs. Dispute ongoing.',
    supportingDocs: ['Scale ticket', 'Overweight permit', 'Rate Confirmation'],
    brokerContact: 'Phil Nguyen',
    brokerEmail: 'pnguyen@xpo.com',
  },
  {
    id: 'DET-007',
    type: 'detention',
    loadId: 'LOAD-8901',
    broker: 'TQL',
    location: 'Houston, TX',
    date: 'May 9, 2024',
    amount: 150,
    status: 'waived',
    invoiceNumber: 'INV-2024-047',
    daysOutstanding: 0,
    notes: 'Driver waited 2hrs 15min. Within 15min of grace cutoff. Broker requested waiver — agreed to maintain relationship.',
    supportingDocs: ['BOL signed'],
    brokerContact: 'Sandra Kim',
    brokerEmail: 'skim@tql.com',
    arrivalTime: '10:00',
    departureTime: '12:15',
    freeTimeHours: 2,
    billableHours: 2.0,
  },
  {
    id: 'HZM-008',
    type: 'hazmat',
    loadId: 'LOAD-8912',
    broker: 'Arrive Logistics',
    location: 'Denver, CO',
    date: 'May 10, 2024',
    amount: 320,
    status: 'submitted',
    invoiceNumber: 'INV-2024-048',
    submittedDate: 'May 11, 2024',
    daysOutstanding: 1,
    notes: 'Hazmat endorsement required. Additional stop for placard verification.',
    supportingDocs: ['Hazmat manifest', 'Placard photos', 'Driver cert'],
    brokerContact: 'Amanda Chen',
    brokerEmail: 'achen@arrivelogistics.com',
  },
  {
    id: 'RDL-009',
    type: 'redelivery',
    loadId: 'LOAD-8923',
    broker: 'Transplace',
    location: 'Seattle, WA',
    date: 'May 10, 2024',
    amount: 275,
    status: 'disputed',
    invoiceNumber: 'INV-2024-049',
    submittedDate: 'May 11, 2024',
    daysOutstanding: 1,
    notes: 'Receiver refused first delivery — wrong PO on paperwork. Second attempt made same day.',
    supportingDocs: ['BOL signed', 'Refusal notice', 'Redelivery receipt'],
    brokerContact: 'James Howell',
    brokerEmail: 'jhowell@transplace.com',
  },
  {
    id: 'DET-010',
    type: 'detention',
    loadId: 'LOAD-8934',
    broker: 'FreightWise',
    location: 'Portland, OR',
    date: 'May 11, 2024',
    amount: 262.5,
    status: 'pending',
    invoiceNumber: 'INV-2024-050',
    daysOutstanding: 1,
    notes: 'Shipper dock was backed up. 3.5 billable hours at $75/hr.',
    supportingDocs: ['BOL signed', 'Detention receipt'],
    brokerContact: 'Lisa Grant',
    brokerEmail: 'lgrant@freightwise.com',
    arrivalTime: '07:00',
    departureTime: '12:30',
    freeTimeHours: 2,
    billableHours: 3.5,
  },
  {
    id: 'LUM-011',
    type: 'lumper',
    loadId: 'LOAD-8945',
    broker: 'CH Robinson',
    location: 'Miami, FL',
    date: 'May 11, 2024',
    amount: 175,
    status: 'paid',
    invoiceNumber: 'INV-2024-051',
    submittedDate: 'May 12, 2024',
    paidDate: 'May 13, 2024',
    daysOutstanding: 0,
    notes: 'Grocery warehouse lumper required. COMCHEK issued same day.',
    supportingDocs: ['Lumper receipt', 'COMCHEK confirmation'],
    brokerContact: 'Derek Okafor',
    brokerEmail: 'dokafor@chrobinson.com',
  },
  {
    id: 'TONU-012',
    type: 'tonu',
    loadId: 'LOAD-8956',
    broker: 'Worldwide Express',
    location: 'Kansas City, MO',
    date: 'May 12, 2024',
    amount: 750,
    status: 'pending',
    invoiceNumber: 'INV-2024-052',
    daysOutstanding: 0,
    notes: 'Load canceled morning of pickup. Driver already at facility.',
    supportingDocs: ['Rate Confirmation', 'Cancellation email'],
    brokerContact: 'Brian Salazar',
    brokerEmail: 'bsalazar@wwex.com',
  },
  {
    id: 'FSC-013',
    type: 'fuel_surcharge',
    loadId: 'LOAD-8967',
    broker: 'Odyssey Logistics',
    location: 'St. Louis, MO',
    date: 'May 12, 2024',
    amount: 156,
    status: 'submitted',
    invoiceNumber: 'INV-2024-053',
    submittedDate: 'May 12, 2024',
    daysOutstanding: 0,
    notes: 'Standard FSC per contract. Calculated at 14.2% of linehaul.',
    supportingDocs: ['Rate Confirmation', 'FSC Calculation'],
    brokerContact: 'Rachel Moon',
    brokerEmail: 'rmoon@odysseylogistics.com',
  },
  {
    id: 'DET-014',
    type: 'detention',
    loadId: 'LOAD-8978',
    broker: 'Redwood Logistics',
    location: 'Charlotte, NC',
    date: 'May 13, 2024',
    amount: 487.5,
    status: 'submitted',
    invoiceNumber: 'INV-2024-054',
    submittedDate: 'May 13, 2024',
    daysOutstanding: 0,
    notes: 'Long wait at receiver. 6.5 billable hours. Signed detention receipt obtained.',
    supportingDocs: ['BOL signed', 'Detention receipt', 'Timestamped photos'],
    brokerContact: 'Tom Ferreira',
    brokerEmail: 'tferreira@redwoodlogistics.com',
    arrivalTime: '06:00',
    departureTime: '14:30',
    freeTimeHours: 2,
    billableHours: 6.5,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ChargeType, string> = {
  detention:     'DET',
  layover:       'LAY',
  tonu:          'TONU',
  lumper:        'LUM',
  fuel_surcharge:'FSC',
  overweight:    'OVW',
  hazmat:        'HZM',
  redelivery:    'RDL',
  other:         'OTH',
}

const TYPE_FULL: Record<ChargeType, string> = {
  detention:     'Detention',
  layover:       'Layover',
  tonu:          'Truck Order Not Used',
  lumper:        'Lumper',
  fuel_surcharge:'Fuel Surcharge',
  overweight:    'Overweight Permit',
  hazmat:        'Hazmat',
  redelivery:    'Redelivery',
  other:         'Other',
}

const TYPE_ICONS: Record<ChargeType, string> = {
  detention:     '⏱️',
  layover:       '🌙',
  tonu:          '🚫',
  lumper:        '📦',
  fuel_surcharge:'⛽',
  overweight:    '⚖️',
  hazmat:        '☢️',
  redelivery:    '🔄',
  other:         '📋',
}

const TYPE_COLORS: Record<ChargeType, string> = {
  detention:     '#F97316',
  layover:       '#8B5CF6',
  tonu:          '#EF4444',
  lumper:        '#3B82F6',
  fuel_surcharge:'#14B8A6',
  overweight:    '#F59E0B',
  hazmat:        '#7C2D12',
  redelivery:    '#EC4899',
  other:         '#6B7280',
}

const STATUS_COLORS: Record<ChargeStatus, { bg: string; text: string }> = {
  pending:   { bg: '#FEF9C3', text: '#854D0E' },
  submitted: { bg: '#DBEAFE', text: '#1E40AF' },
  disputed:  { bg: '#FEE2E2', text: '#991B1B' },
  paid:      { bg: '#DCFCE7', text: '#166534' },
  denied:    { bg: '#F3F4F6', text: '#374151' },
  waived:    { bg: '#F5F3FF', text: '#5B21B6' },
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── New Charge Modal ──────────────────────────────────────────────────────────

interface NewChargeModalProps {
  onClose: () => void
  onSave: (charge: AccessorialCharge) => void
}

function NewChargeModal({ onClose, onSave }: NewChargeModalProps) {
  const [step, setStep] = useState(1)
  const [chargeType, setChargeType] = useState<ChargeType>('detention')
  const [loadId, setLoadId] = useState('')
  const [broker, setBroker] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [arrival, setArrival] = useState('')
  const [departure, setDeparture] = useState('')
  const [freeTime, setFreeTime] = useState('2')
  const [notes, setNotes] = useState('')
  const [docs, setDocs] = useState<string[]>([])

  const DOC_OPTIONS = ['BOL', 'Rate Confirmation', 'Detention Receipt', 'Photos', 'Scale Ticket']

  const calcBillable = () => {
    if (!arrival || !departure) return 0
    const [ah, am] = arrival.split(':').map(Number)
    const [dh, dm] = departure.split(':').map(Number)
    const totalHrs = (dh * 60 + dm - (ah * 60 + am)) / 60
    const billable = Math.max(0, totalHrs - parseFloat(freeTime || '0'))
    return Math.round(billable * 4) / 4
  }

  const calcAmount = () => {
    if (chargeType === 'detention') return calcBillable() * 75
    return parseFloat(amount) || 0
  }

  const toggleDoc = (doc: string) => {
    setDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc])
  }

  const handleSave = (submit: boolean) => {
    const newCharge: AccessorialCharge = {
      id: `${TYPE_LABELS[chargeType]}-${Date.now()}`,
      type: chargeType,
      loadId: loadId || 'LOAD-NEW',
      broker: broker || 'Unknown Broker',
      location: location || 'Unknown',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: chargeType === 'detention' ? calcAmount() : (parseFloat(amount) || 0),
      status: submit ? 'submitted' : 'pending',
      invoiceNumber: `INV-${Date.now()}`,
      daysOutstanding: 0,
      notes,
      supportingDocs: docs,
      brokerContact: 'TBD',
      brokerEmail: 'tbd@broker.com',
      arrivalTime: chargeType === 'detention' ? arrival : undefined,
      departureTime: chargeType === 'detention' ? departure : undefined,
      freeTimeHours: chargeType === 'detention' ? parseFloat(freeTime) : undefined,
      billableHours: chargeType === 'detention' ? calcBillable() : undefined,
    }
    onSave(newCharge)
    onClose()
  }

  const TYPE_OPTIONS: ChargeType[] = ['detention', 'layover', 'tonu', 'lumper', 'fuel_surcharge', 'overweight', 'hazmat', 'redelivery']

  return (
    <div style={{
      background: '#fff',
      border: '2px solid var(--c-primary, #4BAED4)',
      borderRadius: 16,
      padding: 28,
      marginBottom: 24,
      boxShadow: '0 8px 32px rgba(75,174,212,.18)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>Add Accessorial Charge</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Step {step} of 3</div>
        </div>
        <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#374151' }}>
          Cancel
        </button>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: s <= step ? 'var(--c-primary, #4BAED4)' : '#E5E7EB',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Charge Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {TYPE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => setChargeType(t)}
                style={{
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: `2px solid ${chargeType === t ? TYPE_COLORS[t] : '#E5E7EB'}`,
                  background: chargeType === t ? `${TYPE_COLORS[t]}15` : '#F9FAFB',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}
              >
                <span style={{ fontSize: 20 }}>{TYPE_ICONS[t]}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: chargeType === t ? TYPE_COLORS[t] : '#6B7280' }}>{TYPE_LABELS[t]}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Load ID</label>
              <input
                value={loadId}
                onChange={e => setLoadId(e.target.value)}
                placeholder="LOAD-XXXX"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Broker</label>
              <input
                value={broker}
                onChange={e => setBroker(e.target.value)}
                placeholder="Broker name"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Location</label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, State"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          {chargeType === 'detention' ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Detention Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Arrival Time</label>
                  <input type="time" value={arrival} onChange={e => setArrival(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Departure Time</label>
                  <input type="time" value={departure} onChange={e => setDeparture(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Free Time (hrs)</label>
                  <input type="number" value={freeTime} onChange={e => setFreeTime(e.target.value)} min="0" step="0.5"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#0369A1', fontWeight: 600 }}>Auto-calculation</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0C4A6E', marginTop: 4 }}>
                  {calcBillable()} hrs × $75/hr = {fmt(calcBillable() * 75)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 15, boxSizing: 'border-box' }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Supporting Documents</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DOC_OPTIONS.map(doc => (
                <button
                  key={doc}
                  onClick={() => toggleDoc(doc)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                    border: `1.5px solid ${docs.includes(doc) ? '#4BAED4' : '#D1D5DB'}`,
                    background: docs.includes(doc) ? '#EFF9FF' : '#F9FAFB',
                    color: docs.includes(doc) ? '#0369A1' : '#6B7280',
                    fontWeight: docs.includes(doc) ? 700 : 400,
                  }}
                >
                  {docs.includes(doc) ? '✓ ' : ''}{doc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add details about this charge..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Preview &amp; Confirm</div>
          <div style={{
            background: '#F9FAFB', borderRadius: 12, padding: 20, marginBottom: 16,
            border: `2px solid ${TYPE_COLORS[chargeType]}30`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                background: TYPE_COLORS[chargeType],
                color: '#fff', fontWeight: 800, fontSize: 13,
                padding: '4px 10px', borderRadius: 6,
              }}>
                {TYPE_LABELS[chargeType]}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>{TYPE_FULL[chargeType]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Load ID', loadId || 'LOAD-NEW'],
                ['Broker', broker || '—'],
                ['Location', location || '—'],
                ['Date', date || 'Today'],
                ['Amount', fmt(chargeType === 'detention' ? calcAmount() : parseFloat(amount) || 0)],
                ['Documents', docs.length ? `${docs.length} attached` : 'None'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
            {notes && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, color: '#4B5563' }}>{notes}</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleSave(false)}
              style={{ flex: 1, padding: '11px', borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#F9FAFB', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              style={{ flex: 2, padding: '11px', borderRadius: 8, border: 'none', background: 'var(--c-primary, #4BAED4)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Save &amp; Submit Invoice
            </button>
          </div>
        </div>
      )}

      {/* Step navigation */}
      {step < 3 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            onClick={() => setStep(s => s + 1)}
            style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: 'var(--c-primary, #4BAED4)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Next →
          </button>
        </div>
      )}
      {step > 1 && (
        <button
          onClick={() => setStep(s => s - 1)}
          style={{ marginTop: 8, background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
      )}
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  charge: AccessorialCharge
  onStatusChange: (id: string, status: ChargeStatus) => void
  onNotesChange: (id: string, notes: string) => void
}

function DetailPanel({ charge, onStatusChange, onNotesChange }: DetailPanelProps) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState(charge.notes)
  const tc = TYPE_COLORS[charge.type]
  const sc = STATUS_COLORS[charge.status]

  const TIMELINE: { date: string; label: string; desc: string }[] = [
    { date: charge.date, label: 'Charge Created', desc: `${TYPE_FULL[charge.type]} occurred at ${charge.location}` },
    ...(charge.submittedDate ? [{ date: charge.submittedDate, label: 'Invoice Submitted', desc: `${charge.invoiceNumber} sent to ${charge.broker}` }] : []),
    ...(charge.status === 'disputed' ? [{ date: charge.submittedDate || charge.date, label: 'Broker Disputed', desc: 'Broker challenged the charge — documentation review pending' }] : []),
    ...(charge.paidDate ? [{ date: charge.paidDate, label: 'Payment Received', desc: `${fmt(charge.amount)} collected` }] : []),
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-divider, #F0F4F8)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${tc}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            {TYPE_ICONS[charge.type]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>{TYPE_FULL[charge.type]}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{charge.invoiceNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: charge.status === 'paid' ? '#16A34A' : charge.status === 'disputed' ? '#DC2626' : 'var(--c-dark, #1A2535)' }}>
              {fmt(charge.amount)}
            </div>
            <div style={{ display: 'inline-block', background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>
              {charge.status}
            </div>
          </div>
        </div>

        {/* Status change */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>Change Status</label>
          <select
            value={charge.status}
            onChange={e => onStatusChange(charge.id, e.target.value as ChargeStatus)}
            style={{ padding: '7px 10px', borderRadius: 7, border: '1.5px solid #D1D5DB', fontSize: 13, background: '#F9FAFB', color: '#374151', cursor: 'pointer' }}
          >
            {(['pending', 'submitted', 'disputed', 'paid', 'denied', 'waived'] as ChargeStatus[]).map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-divider, #F0F4F8)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
          {[
            ['Load ID', charge.loadId],
            ['Broker', charge.broker],
            ['Location', charge.location],
            ['Date', charge.date],
            ['Contact', charge.brokerContact],
            ['Days Outstanding', charge.daysOutstanding > 0 ? `${charge.daysOutstanding} days` : 'Settled'],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2 }}>{val}</div>
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Broker Email</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4BAED4', marginTop: 2 }}>{charge.brokerEmail}</div>
          </div>
          {charge.submittedDate && (
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2 }}>{charge.submittedDate}</div>
            </div>
          )}
          {charge.paidDate && (
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Date</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', marginTop: 2 }}>{charge.paidDate}</div>
            </div>
          )}
        </div>
      </div>

      {/* Detention breakdown */}
      {charge.type === 'detention' && charge.billableHours !== undefined && (
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-divider, #F0F4F8)', background: '#FFF7ED' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>Detention Calculation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {[
              ['Arrival', charge.arrivalTime || '—'],
              ['Departure', charge.departureTime || '—'],
              ['Free Time (grace)', `${charge.freeTimeHours ?? 2} hrs`],
              ['Billable Hours', `${charge.billableHours} hrs`],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#78350F', marginTop: 2 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#FDE68A', borderRadius: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#78350F' }}>
              {charge.billableHours} hrs × $75/hr = {fmt(charge.billableHours * 75)}
            </span>
          </div>
        </div>
      )}

      {/* Supporting docs */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-divider, #F0F4F8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>Supporting Documents</div>
          <button style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Document</button>
        </div>
        {charge.supportingDocs.length === 0 ? (
          <div style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>No documents attached</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {charge.supportingDocs.map(doc => (
              <div key={doc} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#F9FAFB', borderRadius: 7, border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 14 }}>📄</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{doc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-divider, #F0F4F8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>Notes</div>
          <button
            onClick={() => {
              if (editingNotes) onNotesChange(charge.id, notesValue)
              setEditingNotes(!editingNotes)
            }}
            style={{ fontSize: 12, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            {editingNotes ? 'Save' : 'Edit'}
          </button>
        </div>
        {editingNotes ? (
          <textarea
            value={notesValue}
            onChange={e => setNotesValue(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #4BAED4', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
          />
        ) : (
          <div style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>{notesValue || '—'}</div>
        )}
      </div>

      {/* Timeline */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-divider, #F0F4F8)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark, #1A2535)', marginBottom: 12 }}>Timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TIMELINE.map((event, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === TIMELINE.length - 1 ? '#4BAED4' : '#D1D5DB', flexShrink: 0, marginTop: 3 }} />
                {i < TIMELINE.length - 1 && <div style={{ width: 2, flex: 1, background: '#E5E7EB', minHeight: 20, margin: '2px 0' }} />}
              </div>
              <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 12 : 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{event.label}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{event.date}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{event.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {charge.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange(charge.id, 'submitted')}
                style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#4BAED4', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Submit Invoice
              </button>
              <button
                onClick={() => onStatusChange(charge.id, 'waived')}
                style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Waive Charge
              </button>
            </>
          )}
          {charge.status === 'submitted' && (
            <>
              <button style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#FBBF24', color: '#78350F', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Send Reminder
              </button>
              <button
                onClick={() => onStatusChange(charge.id, 'disputed')}
                style={{ padding: '10px 16px', borderRadius: 8, border: '2px solid #EF4444', background: '#fff', color: '#EF4444', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Mark as Disputed
              </button>
            </>
          )}
          {charge.status === 'disputed' && (
            <>
              <button style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Escalate to Legal
              </button>
              <button
                onClick={() => onStatusChange(charge.id, 'paid')}
                style={{ padding: '10px 16px', borderRadius: 8, border: '1.5px solid #D1D5DB', background: '#F9FAFB', color: '#6B7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Accept Settlement
              </button>
            </>
          )}
          {charge.status === 'paid' && (
            <button style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#16A34A', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Download Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AccessorialChargesPage({ role }: { role: UserRole }) {
  const [charges, setCharges] = useState<AccessorialCharge[]>(MOCK_CHARGES)
  const [selectedId, setSelectedId] = useState<string | null>('DET-010')
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ChargeType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ChargeStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'days'>('date')

  // Suppress unused role warning — kept for future role-based gating
  void role

  // KPIs
  const totalCharged = charges.reduce((s, c) => s + c.amount, 0)
  const collected = charges.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const inFlight = charges.filter(c => c.status === 'pending' || c.status === 'submitted').reduce((s, c) => s + c.amount, 0)
  const disputed = charges.filter(c => c.status === 'disputed').reduce((s, c) => s + c.amount, 0)

  // Filtered + sorted
  const filtered = charges
    .filter(c => {
      if (search) {
        const q = search.toLowerCase()
        if (!c.loadId.toLowerCase().includes(q) && !c.broker.toLowerCase().includes(q)) return false
      }
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount
      if (sortBy === 'days') return b.daysOutstanding - a.daysOutstanding
      return 0 // date order = original
    })

  const selected = charges.find(c => c.id === selectedId) ?? null

  const handleStatusChange = (id: string, status: ChargeStatus) => {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const handleNotesChange = (id: string, notes: string) => {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, notes } : c))
  }

  const handleAddCharge = (charge: AccessorialCharge) => {
    setCharges(prev => [charge, ...prev])
    setSelectedId(charge.id)
  }

  // Monthly breakdown data (hardcoded for display)
  const MONTHLY = [
    { month: 'Dec 2023', detention: 225, tonu: 0, lumper: 175, other: 184, total: 584, collected: 584 },
    { month: 'Jan 2024', detention: 337, tonu: 875, lumper: 225, other: 320, total: 1757, collected: 1320 },
    { month: 'Feb 2024', detention: 150, tonu: 0, lumper: 0, other: 156, total: 306, collected: 306 },
    { month: 'Mar 2024', detention: 487, tonu: 750, lumper: 0, other: 650, total: 1887, collected: 487 },
    { month: 'Apr 2024', detention: 262, tonu: 0, lumper: 175, other: 275, total: 712, collected: 437 },
    { month: 'May 2024', detention: 1237, tonu: 1625, lumper: 400, other: 605, total: 3867, collected: 1397 },
  ]

  const BROKER_LEADERBOARD = [
    { broker: 'TQL', charges: 3, outstanding: 750 },
    { broker: 'CH Robinson', charges: 2, outstanding: 225 },
    { broker: 'Worldwide Express', charges: 1, outstanding: 750 },
    { broker: 'Echo Global', charges: 2, outstanding: 0 },
    { broker: 'XPO Logistics', charges: 1, outstanding: 650 },
    { broker: 'Transplace', charges: 1, outstanding: 275 },
  ].sort((a, b) => b.outstanding - a.outstanding)

  const TYPE_FILTER_OPTIONS: { value: ChargeType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'detention', label: 'Detention' },
    { value: 'layover', label: 'Layover' },
    { value: 'tonu', label: 'TONU' },
    { value: 'lumper', label: 'Lumper' },
    { value: 'fuel_surcharge', label: 'Fuel Sur.' },
    { value: 'overweight', label: 'Overweight' },
    { value: 'redelivery', label: 'Redelivery' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--c-dark, #1A2535)' }}>
          Accessorial Charges
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>
          Track, manage, and collect extra fees — detention, TONU, lumper, and more.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Charged (YTD)', value: fmt(totalCharged), sub: `${charges.length} charges`, color: 'var(--c-dark, #1A2535)', icon: '💵' },
          { label: 'Collected', value: fmt(collected), sub: `${charges.filter(c => c.status === 'paid').length} paid`, color: '#16A34A', icon: '✅' },
          { label: 'Pending / In-Flight', value: fmt(inFlight), sub: `${charges.filter(c => c.status === 'pending' || c.status === 'submitted').length} charges`, color: '#2563EB', icon: '⏳' },
          { label: 'Disputed / At Risk', value: fmt(disputed), sub: `${charges.filter(c => c.status === 'disputed').length} charges`, color: '#DC2626', icon: '⚠️' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: '#fff', borderRadius: 14, padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid var(--c-divider, #F0F4F8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{kpi.icon}</span>
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* New Charge Modal */}
      {showModal && <NewChargeModal onClose={() => setShowModal(false)} onSave={handleAddCharge} />}

      {/* Main area */}
      <div style={{ display: 'grid', gridTemplateColumns: '58% 42%', gap: 20, marginBottom: 24 }}>
        {/* LEFT: List */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid var(--c-divider, #F0F4F8)', display: 'flex', flexDirection: 'column' }}>
          {/* Filter bar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-divider, #F0F4F8)' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search load ID or broker..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 13 }}
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'date' | 'amount' | 'days')}
                style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid #D1D5DB', fontSize: 12, color: '#374151', background: '#F9FAFB' }}
              >
                <option value="date">Date ↓</option>
                <option value="amount">Amount ↓</option>
                <option value="days">Days ↓</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {TYPE_FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${typeFilter === opt.value ? '#4BAED4' : '#E5E7EB'}`,
                    background: typeFilter === opt.value ? '#EFF9FF' : '#F9FAFB',
                    color: typeFilter === opt.value ? '#0369A1' : '#6B7280',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'pending', 'submitted', 'disputed', 'paid', 'denied', 'waived'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${statusFilter === s ? '#4BAED4' : '#E5E7EB'}`,
                    background: statusFilter === s ? '#EFF9FF' : '#F9FAFB',
                    color: statusFilter === s ? '#0369A1' : '#6B7280',
                  }}
                >
                  {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 600 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                No charges match your filters.
              </div>
            ) : (
              filtered.map(charge => {
                const tc2 = TYPE_COLORS[charge.type]
                const sc2 = STATUS_COLORS[charge.status]
                const isSelected = selectedId === charge.id
                return (
                  <div
                    key={charge.id}
                    onClick={() => setSelectedId(charge.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--c-divider, #F0F4F8)',
                      cursor: 'pointer',
                      background: isSelected ? '#F0F9FF' : '#fff',
                      borderLeft: `3px solid ${isSelected ? '#4BAED4' : 'transparent'}`,
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Type badge */}
                      <div style={{
                        background: tc2, color: '#fff', fontWeight: 800, fontSize: 10,
                        padding: '3px 7px', borderRadius: 5, flexShrink: 0,
                      }}>
                        {TYPE_LABELS[charge.type]}
                      </div>

                      {/* Main info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark, #1A2535)' }}>
                            {charge.loadId} · {charge.broker}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-dark, #1A2535)', marginLeft: 8 }}>
                            {fmt(charge.amount)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>
                            {charge.location} · {charge.date}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {charge.daysOutstanding > 30 && (
                              <span style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
                                {charge.daysOutstanding}d
                              </span>
                            )}
                            <span style={{ background: sc2.bg, color: sc2.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>
                              {charge.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Add charge button */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--c-divider, #F0F4F8)' }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: '100%', padding: '11px', borderRadius: 10, border: '2px dashed #4BAED4',
                background: showModal ? '#EFF9FF' : '#fff', color: '#4BAED4',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              + Add Charge
            </button>
          </div>
        </div>

        {/* RIGHT: Detail panel */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid var(--c-divider, #F0F4F8)', overflowY: 'auto', maxHeight: 720 }}>
          {selected ? (
            <DetailPanel
              charge={selected}
              onStatusChange={handleStatusChange}
              onNotesChange={handleNotesChange}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Select a charge to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Monthly breakdown */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid var(--c-divider, #F0F4F8)', padding: '20px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-dark, #1A2535)', marginBottom: 16 }}>Monthly Breakdown</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Month', 'Detention', 'TONU', 'Lumper', 'Other', 'Total', 'Collected'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Month' ? 'left' : 'right', fontWeight: 700, color: '#374151', borderBottom: '2px solid #E5E7EB', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHLY.map((row, i) => (
                  <tr key={row.month} style={{ background: i % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #F0F4F8' }}>{row.month}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#374151', borderBottom: '1px solid #F0F4F8' }}>{row.detention ? fmt(row.detention) : '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#374151', borderBottom: '1px solid #F0F4F8' }}>{row.tonu ? fmt(row.tonu) : '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#374151', borderBottom: '1px solid #F0F4F8' }}>{row.lumper ? fmt(row.lumper) : '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#374151', borderBottom: '1px solid #F0F4F8' }}>{row.other ? fmt(row.other) : '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--c-dark, #1A2535)', borderBottom: '1px solid #F0F4F8' }}>{fmt(row.total)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#16A34A', borderBottom: '1px solid #F0F4F8' }}>{fmt(row.collected)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#F0F9FF' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--c-dark, #1A2535)' }}>Total</td>
                  {(['detention', 'tonu', 'lumper', 'other', 'total', 'collected'] as const).map(key => (
                    <td key={key} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: key === 'collected' ? '#16A34A' : 'var(--c-dark, #1A2535)' }}>
                      {fmt(MONTHLY.reduce((s, r) => s + r[key], 0))}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Top offending brokers */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1px solid var(--c-divider, #F0F4F8)', padding: '20px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-dark, #1A2535)', marginBottom: 4 }}>Top Offending Brokers</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Ranked by outstanding balance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BROKER_LEADERBOARD.map((b, i) => {
              const maxOutstanding = BROKER_LEADERBOARD[0].outstanding || 1
              const pct = maxOutstanding > 0 ? (b.outstanding / maxOutstanding) * 100 : 0
              return (
                <div key={b.broker}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: i === 0 ? '#EF4444' : i === 1 ? '#F97316' : i === 2 ? '#FBBF24' : '#E5E7EB',
                        color: i < 3 ? '#fff' : '#9CA3AF',
                        fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{b.broker}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{b.charges} charge{b.charges !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: b.outstanding > 0 ? '#DC2626' : '#16A34A' }}>
                      {b.outstanding > 0 ? fmt(b.outstanding) : 'All paid'}
                    </div>
                  </div>
                  <div style={{ height: 4, background: '#F3F4F6', borderRadius: 4 }}>
                    <div style={{
                      height: 4, borderRadius: 4,
                      background: b.outstanding > 0 ? (i === 0 ? '#EF4444' : '#F97316') : '#16A34A',
                      width: `${pct}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#FFF7ED', borderRadius: 8, border: '1px solid #FED7AA' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Total Outstanding</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#C2410C', marginTop: 2 }}>
              {fmt(BROKER_LEADERBOARD.reduce((s, b) => s + b.outstanding, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
