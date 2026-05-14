import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PartiesForm {
  dispName: string
  dispCompany: string
  dispCountry: string
  dispEmail: string
  ooName: string
  ooMc: string
  ooTruckType: string
  ooHomeState: string
}

interface TermsForm {
  commissionPct: number
  rpmGuaranteeEnabled: boolean
  rpmMinimum: string
  paymentCycle: 'weekly' | 'biweekly' | 'per-load'
  trialDays: 30 | 60 | 90
  exclusivity: 'exclusive' | 'non-exclusive'
  noticeDays: 7 | 14 | 30
  maxTrucks: number
}

interface SLAForm {
  responseTime: '15min' | '30min' | '1h' | '2h'
  coverageHours: '24/7' | 'weekdays' | 'business'
  minLoadsEnabled: boolean
  minLoadsPerWeek: string
  updateFrequency: '2h' | '4h' | 'on-request'
  emergencyCoverage: boolean
  missedSlaProcess: string
}

interface MockContract {
  id: string
  dispatcherName: string
  ooName: string
  commissionPct: number
  status: 'active' | 'pending' | 'expired'
  signedDate?: string
  expiryDate?: string
  truckType: string
  rpmGuarantee?: number
}

// ── Constants ──────────────────────────────────────────────────────────────────

const COUNTRIES = [
  'USA', 'Ukraine', 'Uzbekistan', 'India', 'Mexico', 'Canada',
  'Poland', 'Romania', 'Bulgaria', 'Georgia', 'Armenia', 'Kazakhstan',
  'Moldova', 'Russia', 'Kyrgyzstan', 'Pakistan', 'Bangladesh', 'Other'
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
  'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY','DC'
]

const TRUCK_TYPES = [
  'Dry Van 53\'', 'Reefer 53\'', 'Flatbed', 'Step Deck', 'RGN',
  'Box Truck 26\'', 'Sprinter Van', 'Power Only', 'Tanker', 'Hotshot'
]

const MOCK_CONTRACTS: MockContract[] = [
  {
    id: 'C-1001',
    dispatcherName: 'Alex Petrov',
    ooName: 'Marcus Johnson',
    commissionPct: 8,
    status: 'active',
    signedDate: '2025-01-15',
    expiryDate: '2026-01-15',
    truckType: 'Dry Van 53\'',
    rpmGuarantee: 2.50,
  },
  {
    id: 'C-1002',
    dispatcherName: 'Alex Petrov',
    ooName: 'Roberto Sanchez',
    commissionPct: 10,
    status: 'pending',
    truckType: 'Reefer 53\'',
  },
  {
    id: 'C-1003',
    dispatcherName: 'Alex Petrov',
    ooName: 'James Whitfield',
    commissionPct: 7,
    status: 'expired',
    signedDate: '2024-02-01',
    expiryDate: '2024-05-01',
    truckType: 'Flatbed',
  },
]

interface Template {
  id: string
  name: string
  badge: string
  badgeColor: string
  description: string
  keyTerms: string[]
  recommended: boolean
}

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Basic Agreement',
    badge: 'Starter',
    badgeColor: '#6c757d',
    description: 'Simple, clear dispatcher-OO agreement. Great for new working relationships or trial periods.',
    keyTerms: ['8% commission', 'Non-exclusive', '30-day notice', '30-day trial', 'No RPM guarantee'],
    recommended: false,
  },
  {
    id: 't2',
    name: 'Pro with RPM Guarantee',
    badge: 'Most Popular',
    badgeColor: '#0d6efd',
    description: 'Professional contract with revenue-per-mile floor protection for the owner-operator.',
    keyTerms: ['7% commission', 'RPM guarantee $2.50/mi', 'Non-exclusive', '14-day notice', '60-day trial'],
    recommended: true,
  },
  {
    id: 't3',
    name: 'International Dispatcher',
    badge: 'International',
    badgeColor: '#198754',
    description: 'Built for dispatchers located outside the USA — includes timezone, currency, and jurisdiction clauses.',
    keyTerms: ['9% commission', 'USD payments', 'Non-exclusive', 'WhatsApp/email SLA', '30-day notice'],
    recommended: false,
  },
  {
    id: 't4',
    name: 'Enterprise Multi-Truck',
    badge: 'Enterprise',
    badgeColor: '#6f42c1',
    description: 'Covers fleets of 2–5 trucks under one dispatcher. Includes performance bonuses and escalation clauses.',
    keyTerms: ['6% commission (volume discount)', 'Per-truck SLA', 'Exclusive', 'Performance bonuses', '30-day notice'],
    recommended: false,
  },
]

// ── Defaults ───────────────────────────────────────────────────────────────────

const defaultParties: PartiesForm = {
  dispName: '', dispCompany: '', dispCountry: 'USA', dispEmail: '',
  ooName: '', ooMc: '', ooTruckType: 'Dry Van 53\'', ooHomeState: 'TX',
}

const defaultTerms: TermsForm = {
  commissionPct: 8,
  rpmGuaranteeEnabled: false,
  rpmMinimum: '2.50',
  paymentCycle: 'weekly',
  trialDays: 30,
  exclusivity: 'non-exclusive',
  noticeDays: 14,
  maxTrucks: 1,
}

const defaultSLA: SLAForm = {
  responseTime: '30min',
  coverageHours: '24/7',
  minLoadsEnabled: false,
  minLoadsPerWeek: '3',
  updateFrequency: '4h',
  emergencyCoverage: true,
  missedSlaProcess: 'Both parties agree to a 48-hour good-faith resolution window before escalating to DispaLoadIQ dispute center.',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateContractText(p: PartiesForm, t: TermsForm, s: SLAForm): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const commDollar = ((t.commissionPct / 100) * 2500).toFixed(0)

  return `DISPATCHER-OWNER OPERATOR SERVICE AGREEMENT

Effective Date: ${today}

PARTIES

This Dispatcher-Owner Operator Service Agreement ("Agreement") is entered into as of the Effective Date above, by and between:

DISPATCHER: ${p.dispName || '[Dispatcher Name]'}
Company: ${p.dispCompany || '[Company Name]'}
Country of Operation: ${p.dispCountry}
Email: ${p.dispEmail || '[Email Address]'}
Platform: DispaLoadIQ (Verified Account Required)

OWNER-OPERATOR: ${p.ooName || '[Owner-Operator Name]'}
${p.ooMc ? `MC Number: ${p.ooMc}` : 'MC Number: (Pending / Not Applicable)'}
Equipment: ${p.ooTruckType}
Home Base State: ${p.ooHomeState}
Platform: DispaLoadIQ (Verified Account Required)

1. SCOPE OF SERVICES

Dispatcher agrees to provide freight dispatch services on behalf of Owner-Operator, including but not limited to: load sourcing, rate negotiation, broker communication, documentation coordination, and load tracking support.

2. COMPENSATION

2.1 Commission Rate. Owner-Operator agrees to pay Dispatcher a commission of ${t.commissionPct}% of the gross load revenue for each successfully completed load. Based on an average load value of $2,500, this represents approximately $${commDollar} per load.

2.2 Payment Cycle. Compensation shall be remitted on a ${t.paymentCycle === 'weekly' ? 'weekly (every Friday)' : t.paymentCycle === 'biweekly' ? 'bi-weekly basis' : 'per-load basis, within 3 business days of delivery confirmation'} schedule.

${t.rpmGuaranteeEnabled ? `2.3 RPM Guarantee. Dispatcher commits to securing a minimum rate of $${t.rpmMinimum} per mile on loaded miles. If Dispatcher fails to meet this threshold in any given calendar week (minimum 3 loads), Owner-Operator may request a commission credit for the affected loads.` : ''}

3. EXCLUSIVITY & SCOPE

This Agreement is ${t.exclusivity === 'exclusive' ? 'EXCLUSIVE. Dispatcher agrees to dedicate dispatch services solely to this Owner-Operator and shall not simultaneously dispatch other owner-operators without written consent.' : 'NON-EXCLUSIVE. Dispatcher may provide services to other owner-operators simultaneously, provided service quality commitments in Section 5 are maintained.'} Dispatcher shall manage no more than ${t.maxTrucks} truck${t.maxTrucks > 1 ? 's' : ''} under this Agreement without written amendment.

4. TRIAL PERIOD & TERM

4.1 Trial Period. This Agreement commences with a ${t.trialDays}-day trial period. Either party may terminate without penalty during the trial period with 72 hours written notice via DispaLoadIQ platform.

4.2 Term. Following the trial period, this Agreement continues on a month-to-month basis unless terminated per Section 6.

5. SERVICE LEVEL COMMITMENTS (SLA)

5.1 Response Time. Dispatcher commits to responding to Owner-Operator communications within ${s.responseTime === '15min' ? '15 minutes' : s.responseTime === '30min' ? '30 minutes' : s.responseTime === '1h' ? '1 hour' : '2 hours'} during active coverage hours.

5.2 Coverage Hours. Dispatcher will be available for dispatch and communication: ${s.coverageHours === '24/7' ? '24 hours a day, 7 days a week' : s.coverageHours === 'weekdays' ? 'Monday through Friday, 6:00 AM – 10:00 PM (Owner-Operator\'s local time)' : 'Monday through Friday, 8:00 AM – 6:00 PM (Owner-Operator\'s local time)'}.

${s.minLoadsEnabled ? `5.3 Load Volume Guarantee. Dispatcher commits to sourcing a minimum of ${s.minLoadsPerWeek} loads per week for Owner-Operator during periods of truck availability.` : ''}

5.4 Status Updates. Dispatcher shall provide load status updates every ${s.updateFrequency === '2h' ? '2 hours' : s.updateFrequency === '4h' ? '4 hours' : 'time of request (within SLA response window)'} while Owner-Operator is on a load.

5.5 Emergency Coverage. ${s.emergencyCoverage ? 'Dispatcher agrees to provide emergency dispatch support for breakdowns, accidents, or broker escalations at any hour, with best-effort response within 1 hour.' : 'Emergency after-hours support is not included in this Agreement. Owner-Operator acknowledges responsibility for emergency situations outside coverage hours.'}

6. TERMINATION

6.1 Notice Period. Either party may terminate this Agreement following the trial period by providing ${t.noticeDays} days written notice via the DispaLoadIQ platform.

6.2 Immediate Termination. Either party may terminate immediately for cause, including: fraud, repeated SLA breach (3+ documented violations), non-payment exceeding 14 days, or violation of platform terms of service.

7. DISPUTE RESOLUTION

${s.missedSlaProcess}

All unresolved disputes shall be submitted to the DispaLoadIQ Dispute Center for mediated resolution before any legal action is pursued.

8. GOVERNING LAW & SIGNATURES

This Agreement shall be governed by the laws of the State of ${p.ooHomeState}, USA, without regard to conflict of law principles. Digital signatures collected through the DispaLoadIQ platform shall have the same legal effect as handwritten signatures under the Electronic Signatures in Global and National Commerce Act (E-SIGN).

By signing below, both parties acknowledge they have read, understood, and agree to the terms of this Agreement.

_________________________                    _________________________
${p.dispName || '[Dispatcher Name]'}                         ${p.ooName || '[Owner-Operator Name]'}
DISPATCHER                                   OWNER-OPERATOR
Date: _______________                        Date: _______________`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Parties', 'Terms', 'SLA', 'Review & Sign']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
      {labels.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: done ? '#198754' : active ? '#0d6efd' : '#e9ecef',
                color: done || active ? '#fff' : '#6c757d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, marginBottom: 6,
                border: active ? '2px solid #0d6efd' : 'none',
                boxShadow: active ? '0 0 0 4px rgba(13,110,253,0.15)' : 'none',
              }}>
                {done ? '✓' : step}
              </div>
              <span style={{ fontSize: 12, color: active ? '#0d6efd' : done ? '#198754' : '#6c757d', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 0, width: 40, height: 2, background: done ? '#198754' : '#e9ecef', marginTop: -18 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{children}</label>
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db',
        borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
        background: '#fff', color: '#111827',
      }}
    />
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[]
}) {
  const normalized = (options as (string | { value: string; label: string })[]).map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  )
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px', border: '1.5px solid #d1d5db',
        borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', color: '#111827',
      }}
    >
      {normalized.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? '#0d6efd' : '#d1d5db', position: 'relative', transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 22 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
      <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase',
      letterSpacing: '0.08em', marginBottom: 14, marginTop: 8, paddingBottom: 6,
      borderBottom: '1px solid #f0f0f0',
    }}>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>{children}</div>
}

function FieldGroup({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ marginBottom: 16, ...style }}>{children}</div>
}

// ── Step 1: Parties ────────────────────────────────────────────────────────────

function StepParties({ data, onChange }: { data: PartiesForm; onChange: (d: PartiesForm) => void }) {
  const set = (key: keyof PartiesForm) => (v: string) => onChange({ ...data, [key]: v })
  return (
    <div>
      <SectionHeading>Dispatcher Information</SectionHeading>
      <Row>
        <FieldGroup>
          <FieldLabel>Full Name *</FieldLabel>
          <Input value={data.dispName} onChange={set('dispName')} placeholder="e.g. Alex Petrov" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Company / Business Name</FieldLabel>
          <Input value={data.dispCompany} onChange={set('dispCompany')} placeholder="e.g. Petrov Dispatch LLC" />
        </FieldGroup>
      </Row>
      <Row>
        <FieldGroup>
          <FieldLabel>Country of Operation *</FieldLabel>
          <Select value={data.dispCountry} onChange={set('dispCountry')} options={COUNTRIES} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Email Address *</FieldLabel>
          <Input value={data.dispEmail} onChange={set('dispEmail')} type="email" placeholder="dispatcher@email.com" />
        </FieldGroup>
      </Row>

      <SectionHeading>Owner-Operator Information</SectionHeading>
      <Row>
        <FieldGroup>
          <FieldLabel>Owner-Operator Name *</FieldLabel>
          <Input value={data.ooName} onChange={set('ooName')} placeholder="e.g. Marcus Johnson" />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>MC Number (optional)</FieldLabel>
          <Input value={data.ooMc} onChange={set('ooMc')} placeholder="e.g. MC-1234567" />
        </FieldGroup>
      </Row>
      <Row>
        <FieldGroup>
          <FieldLabel>Equipment Type *</FieldLabel>
          <Select value={data.ooTruckType} onChange={set('ooTruckType')} options={TRUCK_TYPES} />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Home Base State *</FieldLabel>
          <Select value={data.ooHomeState} onChange={set('ooHomeState')} options={US_STATES} />
        </FieldGroup>
      </Row>

      <div style={{
        background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10,
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
      }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ fontSize: 13, color: '#856404' }}>
          Both parties must have verified DispaLoadIQ accounts to complete e-signature.
          Contract will be held in <strong>Draft</strong> status until both accounts are confirmed.
        </span>
      </div>
    </div>
  )
}

// ── Step 2: Terms ──────────────────────────────────────────────────────────────

function StepTerms({ data, onChange }: { data: TermsForm; onChange: (d: TermsForm) => void }) {
  const set = <K extends keyof TermsForm>(key: K) => (v: TermsForm[K]) => onChange({ ...data, [key]: v })
  const commDollar = ((data.commissionPct / 100) * 2500).toFixed(0)

  return (
    <div>
      <SectionHeading>Compensation</SectionHeading>

      <FieldGroup>
        <FieldLabel>Commission Percentage: {data.commissionPct}%</FieldLabel>
        <input
          type="range" min={5} max={15} step={0.5} value={data.commissionPct}
          onChange={e => set('commissionPct')(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#0d6efd', marginBottom: 8 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6c757d' }}>
          <span>5% (low)</span>
          <span style={{ color: '#0d6efd', fontWeight: 600 }}>
            ~${commDollar} per $2,500 avg load
          </span>
          <span>15% (premium)</span>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Toggle
          checked={data.rpmGuaranteeEnabled}
          onChange={set('rpmGuaranteeEnabled')}
          label="RPM Guarantee (minimum rate per loaded mile)"
        />
        {data.rpmGuaranteeEnabled && (
          <div style={{ marginTop: 12, maxWidth: 240 }}>
            <FieldLabel>Minimum RPM ($)</FieldLabel>
            <Input value={data.rpmMinimum} onChange={set('rpmMinimum')} placeholder="2.50" type="number" />
          </div>
        )}
      </FieldGroup>

      <SectionHeading>Payment & Schedule</SectionHeading>
      <Row>
        <FieldGroup>
          <FieldLabel>Payment Cycle</FieldLabel>
          <Select
            value={data.paymentCycle}
            onChange={v => set('paymentCycle')(v as TermsForm['paymentCycle'])}
            options={[
              { value: 'weekly', label: 'Weekly (every Friday)' },
              { value: 'biweekly', label: 'Bi-weekly' },
              { value: 'per-load', label: 'Per Load (within 3 days)' },
            ]}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Trial Period</FieldLabel>
          <Select
            value={String(data.trialDays)}
            onChange={v => set('trialDays')(parseInt(v) as 30 | 60 | 90)}
            options={[
              { value: '30', label: '30 Days' },
              { value: '60', label: '60 Days' },
              { value: '90', label: '90 Days' },
            ]}
          />
        </FieldGroup>
      </Row>

      <SectionHeading>Relationship Structure</SectionHeading>
      <Row>
        <FieldGroup>
          <FieldLabel>Exclusivity</FieldLabel>
          <Select
            value={data.exclusivity}
            onChange={v => set('exclusivity')(v as TermsForm['exclusivity'])}
            options={[
              { value: 'non-exclusive', label: 'Non-Exclusive (dispatcher can work with others)' },
              { value: 'exclusive', label: 'Exclusive (dedicated to this OO only)' },
            ]}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Termination Notice Period</FieldLabel>
          <Select
            value={String(data.noticeDays)}
            onChange={v => set('noticeDays')(parseInt(v) as 7 | 14 | 30)}
            options={[
              { value: '7', label: '7 Days' },
              { value: '14', label: '14 Days' },
              { value: '30', label: '30 Days' },
            ]}
          />
        </FieldGroup>
      </Row>

      <FieldGroup>
        <FieldLabel>Max Trucks Dispatcher Handles: {data.maxTrucks}</FieldLabel>
        <input
          type="range" min={1} max={5} step={1} value={data.maxTrucks}
          onChange={e => set('maxTrucks')(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: '#0d6efd', marginBottom: 6 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6c757d' }}>
          {[1,2,3,4,5].map(n => <span key={n}>{n} truck{n > 1 ? 's' : ''}</span>)}
        </div>
      </FieldGroup>

      {data.exclusivity === 'exclusive' && (
        <div style={{
          background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: 10,
          padding: '12px 16px', fontSize: 13, color: '#0f5132', marginTop: 8,
        }}>
          <strong>Exclusive agreement:</strong> Dispatcher commits full attention to this owner-operator.
          Typically commands a lower commission rate (6–8%) in exchange for dedication.
        </div>
      )}
    </div>
  )
}

// ── Step 3: SLA ────────────────────────────────────────────────────────────────

function StepSLA({ data, onChange }: { data: SLAForm; onChange: (d: SLAForm) => void }) {
  const set = <K extends keyof SLAForm>(key: K) => (v: SLAForm[K]) => onChange({ ...data, [key]: v })

  return (
    <div>
      <SectionHeading>Availability & Response</SectionHeading>
      <Row>
        <FieldGroup>
          <FieldLabel>Response Time Commitment</FieldLabel>
          <Select
            value={data.responseTime}
            onChange={v => set('responseTime')(v as SLAForm['responseTime'])}
            options={[
              { value: '15min', label: 'Within 15 minutes' },
              { value: '30min', label: 'Within 30 minutes' },
              { value: '1h', label: 'Within 1 hour' },
              { value: '2h', label: 'Within 2 hours' },
            ]}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Load Coverage Hours</FieldLabel>
          <Select
            value={data.coverageHours}
            onChange={v => set('coverageHours')(v as SLAForm['coverageHours'])}
            options={[
              { value: '24/7', label: '24/7 (all hours)' },
              { value: 'weekdays', label: 'Weekdays 6AM–10PM' },
              { value: 'business', label: 'Business Hours 8AM–6PM' },
            ]}
          />
        </FieldGroup>
      </Row>

      <SectionHeading>Load & Update Commitments</SectionHeading>
      <FieldGroup>
        <Toggle
          checked={data.minLoadsEnabled}
          onChange={set('minLoadsEnabled')}
          label="Minimum loads per week guarantee"
        />
        {data.minLoadsEnabled && (
          <div style={{ marginTop: 12, maxWidth: 200 }}>
            <FieldLabel>Minimum Loads Per Week</FieldLabel>
            <Input value={data.minLoadsPerWeek} onChange={set('minLoadsPerWeek')} type="number" placeholder="3" />
          </div>
        )}
      </FieldGroup>

      <Row>
        <FieldGroup>
          <FieldLabel>Status Update Frequency</FieldLabel>
          <Select
            value={data.updateFrequency}
            onChange={v => set('updateFrequency')(v as SLAForm['updateFrequency'])}
            options={[
              { value: '2h', label: 'Every 2 hours (on load)' },
              { value: '4h', label: 'Every 4 hours (on load)' },
              { value: 'on-request', label: 'On request (within SLA)' },
            ]}
          />
        </FieldGroup>
        <FieldGroup style={{ paddingTop: 24 }}>
          <Toggle
            checked={data.emergencyCoverage}
            onChange={set('emergencyCoverage')}
            label="Emergency coverage included"
          />
        </FieldGroup>
      </Row>

      <SectionHeading>Missed SLA Resolution Process</SectionHeading>
      <FieldGroup>
        <FieldLabel>What happens if dispatcher misses SLA commitments?</FieldLabel>
        <textarea
          value={data.missedSlaProcess}
          onChange={e => set('missedSlaProcess')(e.target.value)}
          rows={4}
          style={{
            width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
            borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical',
            boxSizing: 'border-box', fontFamily: 'inherit', color: '#374151',
          }}
        />
      </FieldGroup>

      <div style={{
        background: '#e7f3ff', border: '1px solid #b6d4fe', borderRadius: 10,
        padding: '12px 16px', fontSize: 13, color: '#084298',
      }}>
        <strong>DispaLoadIQ SLA Shield:</strong> All SLA commitments are logged on-platform.
        If 3 documented breaches occur within 30 days, Owner-Operator may escalate directly to
        DispaLoadIQ mediation without notice period.
      </div>
    </div>
  )
}

// ── Step 4: Review & Sign ──────────────────────────────────────────────────────

function StepReview({ parties, terms, sla }: { parties: PartiesForm; terms: TermsForm; sla: SLAForm }) {
  const [signed, setSigned] = useState(false)
  const [sent, setSent] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const contractText = generateContractText(parties, terms, sla)
  const commDollar = ((terms.commissionPct / 100) * 2500).toFixed(0)

  const callouts = [
    { label: 'Commission', value: `${terms.commissionPct}% (~$${commDollar}/load)`, color: '#0d6efd', bg: '#e7f3ff' },
    { label: 'Trial Period', value: `${terms.trialDays} days`, color: '#198754', bg: '#d1e7dd' },
    { label: 'Notice Period', value: `${terms.noticeDays} days`, color: '#fd7e14', bg: '#fff3cd' },
    { label: 'Response SLA', value: `Within ${terms.maxTrucks > 0 ? sla.responseTime.replace('min', ' min') : sla.responseTime}`, color: '#6f42c1', bg: '#f3e8ff' },
    ...(terms.rpmGuaranteeEnabled ? [{ label: 'RPM Guarantee', value: `$${terms.rpmMinimum}/mile`, color: '#d63384', bg: '#fce4f1' }] : []),
  ]

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {callouts.map(c => (
          <div key={c.label} style={{
            background: c.bg, border: `1.5px solid ${c.color}30`,
            borderRadius: 10, padding: '10px 16px', flex: '1 1 140px', minWidth: 120,
          }}>
            <div style={{ fontSize: 11, color: c.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 10,
        padding: 20, maxHeight: showFull ? 'none' : 280, overflow: 'hidden',
        position: 'relative', marginBottom: 8,
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: '"Courier New", monospace', fontSize: 12, color: '#212529', margin: 0, lineHeight: 1.7 }}>
          {contractText}
        </pre>
        {!showFull && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(transparent, #f8f9fa)',
          }} />
        )}
      </div>
      <button
        onClick={() => setShowFull(!showFull)}
        style={{ background: 'none', border: 'none', color: '#0d6efd', cursor: 'pointer', fontSize: 13, marginBottom: 24 }}
      >
        {showFull ? '▲ Collapse contract' : '▼ Show full contract text'}
      </button>

      <SectionHeading>Digital Signature</SectionHeading>

      {!signed ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            border: '2px dashed #d1d5db', borderRadius: 12, padding: 30,
            textAlign: 'center', marginBottom: 12, background: '#fafafa',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✍️</div>
            <p style={{ fontSize: 14, color: '#6c757d', margin: '0 0 16px' }}>
              Click below to apply your digital signature as <strong>{parties.dispName || 'Dispatcher'}</strong>
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setSigned(true)}
              style={{ padding: '10px 28px', fontSize: 15 }}
            >
              Sign Agreement
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#6c757d', textAlign: 'center' }}>
            By signing, you confirm your identity via DispaLoadIQ account and agree to all terms above.
            Legally binding under the E-SIGN Act.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: 12,
          padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: '#0f5132' }}>Signed by {parties.dispName || 'Dispatcher'}</div>
            <div style={{ fontSize: 12, color: '#198754' }}>
              {new Date().toLocaleString()} · DispaLoadIQ Digital Signature · Hash: {Math.random().toString(36).slice(2, 10).toUpperCase()}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          disabled={!signed || sent}
          onClick={() => setSent(true)}
          style={{ flex: 1, minWidth: 180, padding: '12px 20px', fontSize: 15, opacity: !signed ? 0.5 : 1 }}
        >
          {sent ? '✓ Sent for Signature' : '📤 Send for Signature'}
        </button>
        <button
          className="btn"
          style={{ flex: 1, minWidth: 180, padding: '12px 20px', fontSize: 15, border: '1.5px solid #d1d5db' }}
          onClick={() => {
            const blob = new Blob([contractText], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `DispaLoadIQ-Contract-${parties.dispName || 'Draft'}-${Date.now()}.txt`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          ⬇ Download Contract
        </button>
      </div>

      {sent && (
        <div style={{
          background: '#cff4fc', border: '1px solid #9eeaf9', borderRadius: 10,
          padding: '14px 18px', marginTop: 14, fontSize: 13, color: '#055160',
        }}>
          <strong>Contract sent!</strong> {parties.ooName || 'Owner-Operator'} will receive a notification via DispaLoadIQ
          to review and sign. You'll be notified once they complete their signature.
          Track status in <strong>My Contracts</strong>.
        </div>
      )}
    </div>
  )
}

// ── Tab: My Contracts ──────────────────────────────────────────────────────────

function statusBadge(status: MockContract['status']) {
  const map = {
    active: { color: '#0f5132', bg: '#d1e7dd', label: 'Active' },
    pending: { color: '#664d03', bg: '#fff3cd', label: 'Pending Signature' },
    expired: { color: '#842029', bg: '#f8d7da', label: 'Expired' },
  }
  const s = map[status]
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}40`,
      borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700,
    }}>
      {s.label}
    </span>
  )
}

function MyContracts() {
  const [selected, setSelected] = useState<string | null>(null)
  const [terminating, setTerminating] = useState<string | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>My Contracts</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6c757d' }}>{MOCK_CONTRACTS.length} total agreements</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MOCK_CONTRACTS.map(c => (
          <div key={c.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{c.dispatcherName}</span>
                  <span style={{ color: '#6c757d', fontSize: 14 }}>↔</span>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{c.ooName}</span>
                </div>
                <span style={{ fontSize: 12, color: '#6c757d' }}>Contract {c.id} · {c.truckType}</span>
              </div>
              {statusBadge(c.status)}
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { label: 'Commission', value: `${c.commissionPct}%` },
                ...(c.rpmGuarantee ? [{ label: 'RPM Floor', value: `$${c.rpmGuarantee}/mi` }] : []),
                ...(c.signedDate ? [{ label: 'Signed', value: c.signedDate }] : [{ label: 'Awaiting', value: 'OO Signature' }]),
                ...(c.expiryDate ? [{ label: 'Expires', value: c.expiryDate }] : []),
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: '#6c757d', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-primary" onClick={() => setSelected(selected === c.id ? null : c.id)}>
                {selected === c.id ? 'Close' : 'View Details'}
              </button>
              {c.status === 'active' && (
                <button className="btn btn-sm" style={{ border: '1.5px solid #198754', color: '#198754' }}>
                  Renew
                </button>
              )}
              {c.status === 'expired' && (
                <button className="btn btn-sm" style={{ border: '1.5px solid #0d6efd', color: '#0d6efd' }}>
                  Reactivate
                </button>
              )}
              {c.status === 'active' && (
                <button
                  className="btn btn-sm"
                  style={{ border: '1.5px solid #dc3545', color: '#dc3545' }}
                  onClick={() => setTerminating(c.id)}
                >
                  Terminate
                </button>
              )}
            </div>

            {selected === c.id && (
              <div style={{
                marginTop: 16, padding: 16, background: '#f8f9fa',
                borderRadius: 10, border: '1px solid #dee2e6', fontSize: 13,
              }}>
                <strong>Agreement Details</strong>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: '#374151', lineHeight: 2 }}>
                  <li>Commission: {c.commissionPct}% of gross load revenue</li>
                  {c.rpmGuarantee && <li>RPM Guarantee: ${c.rpmGuarantee}/mile minimum</li>}
                  <li>Payment cycle: Weekly</li>
                  <li>Equipment: {c.truckType}</li>
                  <li>Notice period: 14 days</li>
                  <li>SLA: 30-min response, 24/7 coverage</li>
                  {c.signedDate && <li>Both parties signed on: {c.signedDate}</li>}
                  {c.expiryDate && <li>Agreement expires: {c.expiryDate}</li>}
                </ul>
              </div>
            )}

            {terminating === c.id && (
              <div style={{
                marginTop: 16, padding: 16, background: '#fff5f5',
                borderRadius: 10, border: '1px solid #f5c2c7',
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#842029', margin: '0 0 12px' }}>
                  Confirm termination of contract with {c.ooName}?
                </p>
                <p style={{ fontSize: 13, color: '#6c757d', margin: '0 0 12px' }}>
                  This will begin the 14-day notice period. Owner-operator will be notified immediately.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" style={{ background: '#dc3545', color: '#fff', border: 'none' }}
                    onClick={() => setTerminating(null)}>
                    Confirm Termination
                  </button>
                  <button className="btn btn-sm" style={{ border: '1.5px solid #d1d5db' }}
                    onClick={() => setTerminating(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab: Templates ─────────────────────────────────────────────────────────────

function Templates({ onUseTemplate }: { onUseTemplate: () => void }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>Contract Templates</h2>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6c757d' }}>
        Start from a proven template and customize in the wizard
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} className="card" style={{ padding: 22, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {t.recommended && (
              <div style={{
                position: 'absolute', top: 14, right: 14,
                background: '#0d6efd', color: '#fff',
                fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 10px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Recommended
              </div>
            )}
            <div style={{
              display: 'inline-block', background: t.badgeColor + '18',
              color: t.badgeColor, border: `1px solid ${t.badgeColor}40`,
              borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700,
              marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {t.badge}
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>{t.name}</h3>
            <p style={{ fontSize: 13, color: '#6c757d', margin: '0 0 16px', lineHeight: 1.5 }}>{t.description}</p>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6c757d', textTransform: 'uppercase', marginBottom: 8 }}>Key Terms</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#374151', fontSize: 13, lineHeight: 1.9 }}>
                {t.keyTerms.map(k => <li key={k}>{k}</li>)}
              </ul>
            </div>
            <button
              className="btn btn-primary"
              onClick={onUseTemplate}
              style={{ marginTop: 20, padding: '10px 0', width: '100%' }}
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SmartContractBuilderPage() {
  const [activeTab, setActiveTab] = useState<'build' | 'my-contracts' | 'templates'>('build')
  const [step, setStep] = useState(1)
  const [parties, setParties] = useState<PartiesForm>(defaultParties)
  const [terms, setTerms] = useState<TermsForm>(defaultTerms)
  const [sla, setSLA] = useState<SLAForm>(defaultSLA)

  const totalSteps = 4

  const canNext = () => {
    if (step === 1) return parties.dispName.trim() !== '' && parties.ooName.trim() !== ''
    return true
  }

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'build', label: '✦ Build Contract' },
    { key: 'my-contracts', label: 'My Contracts' },
    { key: 'templates', label: 'Templates' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>📋</span>
          <h1 className="section-title" style={{ margin: 0, fontSize: 26 }}>Smart Contract Builder</h1>
          <span style={{
            background: '#0d6efd', color: '#fff', fontSize: 11, fontWeight: 700,
            borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            AI-Powered
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#6c757d' }}>
          Generate a legally-sound dispatcher-owner operator agreement in under 2 minutes.
          Both parties sign digitally — no lawyer required.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '2px solid #e9ecef', marginBottom: 28,
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 22px', fontSize: 14, fontWeight: activeTab === t.key ? 700 : 500,
              color: activeTab === t.key ? '#0d6efd' : '#6c757d',
              borderBottom: activeTab === t.key ? '2.5px solid #0d6efd' : '2.5px solid transparent',
              marginBottom: -2, transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'my-contracts' && <MyContracts />}
      {activeTab === 'templates' && (
        <Templates onUseTemplate={() => { setActiveTab('build'); setStep(1) }} />
      )}

      {activeTab === 'build' && (
        <div className="card" style={{ padding: 32 }}>
          <StepIndicator current={step} total={totalSteps} />

          {step === 1 && <StepParties data={parties} onChange={setParties} />}
          {step === 2 && <StepTerms data={terms} onChange={setTerms} />}
          {step === 3 && <StepSLA data={sla} onChange={setSLA} />}
          {step === 4 && <StepReview parties={parties} terms={terms} sla={sla} />}

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 32, paddingTop: 20, borderTop: '1px solid #f0f0f0',
          }}>
            <button
              className="btn"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              style={{
                padding: '10px 24px', border: '1.5px solid #d1d5db',
                opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>
            <span style={{ fontSize: 13, color: '#6c757d' }}>Step {step} of {totalSteps}</span>
            {step < totalSteps ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                disabled={!canNext()}
                style={{ padding: '10px 28px', opacity: !canNext() ? 0.5 : 1 }}
              >
                Next →
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => { setStep(1); setParties(defaultParties); setTerms(defaultTerms); setSLA(defaultSLA) }}
                style={{ padding: '10px 24px', border: '1.5px solid #198754', color: '#198754' }}
              >
                Start New
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
