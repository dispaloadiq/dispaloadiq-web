import { useState, type CSSProperties } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type JobStatus = 'Active' | 'Paused' | 'Closed'
type ApplicantStage = 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Hired' | 'Rejected'

interface JobPosting {
  id: string
  title: string
  location: string
  payLabel: string
  postedDate: string
  applicants: number
  status: JobStatus
  requirements: string[]
  benefits: string[]
  description: string
}

interface Applicant {
  id: string
  name: string
  location: string
  cdlClass: string
  yearsExp: number
  endorsements: string[]
  appliedDate: string
  jobId: string
  stage: ApplicantStage
  rating: number
  phone: string
  email: string
  workHistory: { company: string; role: string; from: string; to: string }[]
  notes: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const JOBS: JobPosting[] = [
  {
    id: 'j1',
    title: 'CDL-A OTR Driver — Dry Van',
    location: 'Chicago, IL',
    payLabel: '$0.62/mi',
    postedDate: '2026-04-28',
    applicants: 14,
    status: 'Active',
    requirements: ['CDL-A', '2yr exp', 'Clean MVR', 'No SAP'],
    benefits: ['Health Insurance', '401k Match', 'Paid Vacation', 'Fuel Card'],
    description: 'Long-haul OTR position running dry van freight across the Midwest and Southeast. Drop-and-hook freight, no touch loads.',
  },
  {
    id: 'j2',
    title: 'CDL-A Team Driver — Reefer',
    location: 'Dallas, TX',
    payLabel: '$0.58/mi each',
    postedDate: '2026-05-01',
    applicants: 8,
    status: 'Active',
    requirements: ['CDL-A', '1yr exp', 'Team-friendly', 'Reefer exp'],
    benefits: ['Health Insurance', 'Home bi-weekly', 'Rider policy', 'Weekly pay'],
    description: 'Team driving position for temperature-controlled freight. Must have reefer experience and be comfortable with team driving environment.',
  },
  {
    id: 'j3',
    title: 'Local CDL-A Driver — Flatbed',
    location: 'Nashville, TN',
    payLabel: '$1,450/wk',
    postedDate: '2026-04-15',
    applicants: 22,
    status: 'Active',
    requirements: ['CDL-A', '3yr exp', 'Flatbed exp', 'Tarping skills', 'Steel-toe boots'],
    benefits: ['Health + Dental', '401k', 'Home daily', 'Overtime available', 'Safety bonus'],
    description: 'Local flatbed position — home every night. Hauling construction materials and industrial equipment across the Nashville metro area.',
  },
  {
    id: 'j4',
    title: 'CDL-A Hazmat/Tanker Driver',
    location: 'Houston, TX',
    payLabel: '$0.72/mi',
    postedDate: '2026-05-03',
    applicants: 6,
    status: 'Active',
    requirements: ['CDL-A', 'Hazmat endorsement', 'Tanker endorsement', '3yr exp', 'TWIC card'],
    benefits: ['Top-tier health', '401k 6% match', 'Hazmat pay premium', 'Sign-on $5,000'],
    description: 'Hazmat and tanker routes serving the petrochemical corridor. Premium pay for qualified drivers. Sign-on bonus for experienced candidates.',
  },
  {
    id: 'j5',
    title: 'CDL-B Local Delivery Driver',
    location: 'Atlanta, GA',
    payLabel: '$1,200/wk',
    postedDate: '2026-04-10',
    applicants: 31,
    status: 'Paused',
    requirements: ['CDL-B', '6mo exp', 'Clean record', 'Customer service'],
    benefits: ['Health Insurance', 'Paid holidays', 'Home daily', 'Uniform provided'],
    description: 'Local delivery driver for last-mile logistics. Friendly customer-facing role, consistent routes, home every day.',
  },
]

const APPLICANTS: Applicant[] = [
  {
    id: 'a1',
    name: 'Marcus Johnson',
    location: 'Indianapolis, IN',
    cdlClass: 'CDL-A',
    yearsExp: 7,
    endorsements: ['Hazmat', 'Tanker'],
    appliedDate: '2026-05-02',
    jobId: 'j1',
    stage: 'Interview',
    rating: 5,
    phone: '(317) 555-0142',
    email: 'marcus.j@email.com',
    workHistory: [
      { company: 'Werner Enterprises', role: 'OTR Driver', from: '2020', to: '2024' },
      { company: 'Schneider National', role: 'Regional Driver', from: '2019', to: '2020' },
    ],
    notes: 'Strong candidate. 7 years clean record. Available immediately.',
  },
  {
    id: 'a2',
    name: 'Sandra Lee',
    location: 'Memphis, TN',
    cdlClass: 'CDL-A',
    yearsExp: 4,
    endorsements: ['Reefer cert'],
    appliedDate: '2026-05-05',
    jobId: 'j3',
    stage: 'Phone Screen',
    rating: 4,
    phone: '(901) 555-0298',
    email: 'sandra.lee@email.com',
    workHistory: [
      { company: 'Swift Transportation', role: 'Flatbed Driver', from: '2022', to: '2026' },
    ],
    notes: 'Good flatbed background. Schedule phone screen for next week.',
  },
  {
    id: 'a3',
    name: 'Derek Thompson',
    location: 'Dallas, TX',
    cdlClass: 'CDL-A',
    yearsExp: 2,
    endorsements: [],
    appliedDate: '2026-05-06',
    jobId: 'j2',
    stage: 'Applied',
    rating: 3,
    phone: '(214) 555-0371',
    email: 'd.thompson@email.com',
    workHistory: [
      { company: 'Heartland Express', role: 'OTR Driver', from: '2024', to: '2026' },
    ],
    notes: 'New to team driving. Worth a call to assess adaptability.',
  },
  {
    id: 'a4',
    name: 'Keisha Williams',
    location: 'Atlanta, GA',
    cdlClass: 'CDL-B',
    yearsExp: 3,
    endorsements: ['Passenger'],
    appliedDate: '2026-04-18',
    jobId: 'j5',
    stage: 'Offer',
    rating: 5,
    phone: '(404) 555-0419',
    email: 'keisha.w@email.com',
    workHistory: [
      { company: 'FedEx Ground', role: 'Delivery Driver', from: '2023', to: '2026' },
    ],
    notes: 'Excellent customer service scores at FedEx. Offer extended at $1,250/wk.',
  },
  {
    id: 'a5',
    name: 'Robert Garcia',
    location: 'Houston, TX',
    cdlClass: 'CDL-A',
    yearsExp: 9,
    endorsements: ['Hazmat', 'Tanker', 'TWIC'],
    appliedDate: '2026-05-04',
    jobId: 'j4',
    stage: 'Interview',
    rating: 5,
    phone: '(713) 555-0567',
    email: 'r.garcia@email.com',
    workHistory: [
      { company: 'Quality Carriers', role: 'Tanker Driver', from: '2017', to: '2026' },
    ],
    notes: 'Top-tier candidate for hazmat role. 9 years tanker experience.',
  },
  {
    id: 'a6',
    name: 'Tyler Brooks',
    location: 'Chicago, IL',
    cdlClass: 'CDL-A',
    yearsExp: 5,
    endorsements: [],
    appliedDate: '2026-04-30',
    jobId: 'j1',
    stage: 'Hired',
    rating: 4,
    phone: '(312) 555-0623',
    email: 't.brooks@email.com',
    workHistory: [
      { company: 'CR England', role: 'OTR Driver', from: '2021', to: '2026' },
    ],
    notes: 'Hired! Start date: May 20. Onboarding scheduled.',
  },
  {
    id: 'a7',
    name: 'Patricia Nguyen',
    location: 'Nashville, TN',
    cdlClass: 'CDL-A',
    yearsExp: 6,
    endorsements: ['Flatbed cert'],
    appliedDate: '2026-04-20',
    jobId: 'j3',
    stage: 'Hired',
    rating: 5,
    phone: '(615) 555-0744',
    email: 'p.nguyen@email.com',
    workHistory: [
      { company: 'Landstar System', role: 'Flatbed Owner-Op', from: '2020', to: '2026' },
    ],
    notes: 'Excellent flatbed experience. Former owner-operator.',
  },
  {
    id: 'a8',
    name: 'James Carter',
    location: 'St. Louis, MO',
    cdlClass: 'CDL-A',
    yearsExp: 1,
    endorsements: [],
    appliedDate: '2026-05-07',
    jobId: 'j1',
    stage: 'Applied',
    rating: 2,
    phone: '(314) 555-0822',
    email: 'j.carter@email.com',
    workHistory: [
      { company: 'Prime Inc', role: 'OTR Driver (trainee)', from: '2025', to: '2026' },
    ],
    notes: 'Under minimum experience for OTR. May consider if training slot opens.',
  },
  {
    id: 'a9',
    name: 'Angela Morris',
    location: 'Columbus, OH',
    cdlClass: 'CDL-A',
    yearsExp: 8,
    endorsements: ['Doubles/Triples', 'Hazmat'],
    appliedDate: '2026-05-01',
    jobId: 'j4',
    stage: 'Phone Screen',
    rating: 4,
    phone: '(614) 555-0934',
    email: 'a.morris@email.com',
    workHistory: [
      { company: 'Ryder System', role: 'Regional Driver', from: '2018', to: '2026' },
    ],
    notes: 'Strong doubles/triples endorsement. Phone screen booked May 14.',
  },
  {
    id: 'a10',
    name: 'Kevin Patel',
    location: 'Louisville, KY',
    cdlClass: 'CDL-A',
    yearsExp: 3,
    endorsements: ['Reefer cert'],
    appliedDate: '2026-05-08',
    jobId: 'j2',
    stage: 'Applied',
    rating: 3,
    phone: '(502) 555-1023',
    email: 'k.patel@email.com',
    workHistory: [
      { company: 'USA Truck', role: 'OTR Driver', from: '2023', to: '2026' },
    ],
    notes: 'Interested in team driving. Reefer experience a plus.',
  },
  {
    id: 'a11',
    name: 'Donna Franklin',
    location: 'Birmingham, AL',
    cdlClass: 'CDL-B',
    yearsExp: 4,
    endorsements: [],
    appliedDate: '2026-04-22',
    jobId: 'j5',
    stage: 'Rejected',
    rating: 2,
    phone: '(205) 555-1145',
    email: 'd.franklin@email.com',
    workHistory: [
      { company: 'UPS', role: 'Delivery Driver', from: '2022', to: '2026' },
    ],
    notes: 'Failed background check. Position closed for this candidate.',
  },
  {
    id: 'a12',
    name: 'Samuel Rivera',
    location: 'Kansas City, MO',
    cdlClass: 'CDL-A',
    yearsExp: 11,
    endorsements: ['Hazmat', 'Tanker', 'TWIC', 'Doubles/Triples'],
    appliedDate: '2026-05-05',
    jobId: 'j4',
    stage: 'Offer',
    rating: 5,
    phone: '(816) 555-1267',
    email: 's.rivera@email.com',
    workHistory: [
      { company: 'Trimac Transportation', role: 'Tanker Specialist', from: '2015', to: '2026' },
    ],
    notes: 'Elite candidate. 11 years liquid tanker. Offer at $0.74/mi + $5k sign-on.',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const PRIMARY = '#4BAED4'
const DARK = '#1A2535'

const STATUS_COLORS: Record<JobStatus, { bg: string; color: string }> = {
  Active: { bg: '#F0FFF4', color: '#276749' },
  Paused: { bg: '#FEFCBF', color: '#B7791F' },
  Closed: { bg: '#FFF5F5', color: '#9B2C2C' },
}

const STAGE_COLORS: Record<ApplicantStage, { bg: string; color: string }> = {
  Applied:      { bg: '#EBF8FF', color: '#2C5282' },
  'Phone Screen': { bg: '#E9D8FD', color: '#553C9A' },
  Interview:    { bg: '#FEFCBF', color: '#B7791F' },
  Offer:        { bg: '#FED7AA', color: '#C05621' },
  Hired:        { bg: '#F0FFF4', color: '#276749' },
  Rejected:     { bg: '#FFF5F5', color: '#9B2C2C' },
}

const PIPELINE_STAGES: ApplicantStage[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired']

const PIPELINE_COLORS: Record<string, string> = {
  Applied: '#A0AEC0',
  'Phone Screen': '#8B5CF6',
  Interview: PRIMARY,
  Offer: '#ED8936',
  Hired: '#48BB78',
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => onChange?.(s)}
          style={{
            fontSize: 14,
            color: s <= rating ? '#F6AD55' : '#CBD5E0',
            cursor: onChange ? 'pointer' : 'default',
          }}
        >★</span>
      ))}
    </div>
  )
}

function Chip({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      background: color ? `${color}20` : '#EDF2F7',
      color: color || '#4A5568',
      border: `1px solid ${color ? `${color}40` : '#E2E8F0'}`,
    }}>
      {label}
    </span>
  )
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: bg,
      color,
      letterSpacing: '0.03em',
    }}>
      {label}
    </span>
  )
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 160,
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: DARK }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#4A5568', marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

// ── Shared button styles ──────────────────────────────────────────────────────

const btnPrimary: CSSProperties = {
  background: PRIMARY,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const btnSecondary: CSSProperties = {
  background: '#fff',
  color: '#4A5568',
  border: '1.5px solid #E2E8F0',
  borderRadius: 8,
  padding: '9px 18px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const btnSmall: CSSProperties = {
  background: '#fff',
  color: '#4A5568',
  border: '1.5px solid #E2E8F0',
  borderRadius: 6,
  padding: '5px 12px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#4A5568',
}

const inputStyle: CSSProperties = {
  border: '1.5px solid #E2E8F0',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  color: DARK,
  outline: 'none',
  background: '#fff',
  fontFamily: 'inherit',
}

// ── Post Job Modal ────────────────────────────────────────────────────────────

function PostJobModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: '',
    location: '',
    jobType: 'OTR',
    cdlRequired: 'CDL-A',
    minExp: '1',
    payType: 'per_mile',
    payRate: '',
    description: '',
    requirements: [] as string[],
    benefits: [] as string[],
    newReq: '',
    newBen: '',
  })

  const steps = ['Job Details', 'Requirements', 'Benefits & Pay', 'Publish']

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const addReq = () => {
    if (form.newReq.trim()) {
      setForm(f => ({ ...f, requirements: [...f.requirements, f.newReq.trim()], newReq: '' }))
    }
  }
  const addBen = () => {
    if (form.newBen.trim()) {
      setForm(f => ({ ...f, benefits: [...f.benefits, f.newBen.trim()], newBen: '' }))
    }
  }
  const removeReq = (i: number) => setForm(f => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }))
  const removeBen = (i: number) => setForm(f => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580,
        maxHeight: '90vh', overflow: 'auto', padding: 32,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: DARK }}>Post New Job</div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>Step {step + 1} of {steps.length}: {steps[step]}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: i <= step ? PRIMARY : '#E2E8F0',
                marginBottom: 6,
              }} />
              <div style={{ fontSize: 10, color: i <= step ? PRIMARY : '#A0AEC0', fontWeight: 600 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Step 0: Job Details */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={labelStyle}>
              Job Title *
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. CDL-A OTR Driver — Dry Van"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Location *
              <input
                value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Chicago, IL"
                style={inputStyle}
              />
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                Job Type
                <select value={form.jobType} onChange={e => set('jobType', e.target.value)} style={inputStyle}>
                  <option>OTR</option>
                  <option>Regional</option>
                  <option>Local</option>
                  <option>Team</option>
                  <option>Dedicated</option>
                </select>
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                CDL Required
                <select value={form.cdlRequired} onChange={e => set('cdlRequired', e.target.value)} style={inputStyle}>
                  <option>CDL-A</option>
                  <option>CDL-B</option>
                  <option>CDL-C</option>
                  <option>No CDL</option>
                </select>
              </label>
            </div>
            <label style={labelStyle}>
              Job Description
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the position, routes, freight type..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </label>
          </div>
        )}

        {/* Step 1: Requirements */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={labelStyle}>
              Minimum Experience (years)
              <select value={form.minExp} onChange={e => set('minExp', e.target.value)} style={inputStyle}>
                {['0', '1', '2', '3', '5'].map(y => <option key={y}>{y}</option>)}
              </select>
            </label>
            <label style={labelStyle}>
              Add Requirement
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={form.newReq}
                  onChange={e => set('newReq', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addReq()}
                  placeholder="e.g. Hazmat endorsement"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addReq} style={btnPrimary}>Add</button>
              </div>
            </label>
            {form.requirements.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.requirements.map((r, i) => (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#EBF8FF', color: '#2C5282',
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>
                    {r}
                    <button onClick={() => removeReq(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B2C2C', fontSize: 14, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
            {form.requirements.length === 0 && (
              <div style={{ fontSize: 13, color: '#A0AEC0', textAlign: 'center', padding: '16px 0' }}>
                No requirements added yet. Type above and press Add.
              </div>
            )}
          </div>
        )}

        {/* Step 2: Benefits & Pay */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                Pay Type
                <select value={form.payType} onChange={e => set('payType', e.target.value)} style={inputStyle}>
                  <option value="per_mile">Per Mile ($/mi)</option>
                  <option value="weekly">Weekly ($)</option>
                  <option value="hourly">Hourly ($/hr)</option>
                  <option value="salary">Annual Salary</option>
                </select>
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                Pay Rate
                <input
                  value={form.payRate}
                  onChange={e => set('payRate', e.target.value)}
                  placeholder={form.payType === 'per_mile' ? '0.62' : '1400'}
                  style={inputStyle}
                />
              </label>
            </div>
            <label style={labelStyle}>
              Add Benefit
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={form.newBen}
                  onChange={e => set('newBen', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addBen()}
                  placeholder="e.g. Health Insurance"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addBen} style={btnPrimary}>Add</button>
              </div>
            </label>
            {form.benefits.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.benefits.map((b, i) => (
                  <span key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: '#F0FFF4', color: '#276749',
                    padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>
                    {b}
                    <button onClick={() => removeBen(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B2C2C', fontSize: 14, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Publish */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 12 }}>Review Your Posting</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>Title:</span> <strong>{form.title || '(untitled)'}</strong></div>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>Location:</span> {form.location || '—'}</div>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>Type:</span> {form.jobType}</div>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>CDL:</span> {form.cdlRequired}</div>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>Pay:</span> {form.payRate ? `$${form.payRate}/${form.payType === 'per_mile' ? 'mi' : form.payType === 'weekly' ? 'wk' : 'hr'}` : '—'}</div>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>Requirements:</span> {form.requirements.length > 0 ? form.requirements.join(', ') : '—'}</div>
                <div><span style={{ color: '#718096', width: 100, display: 'inline-block' }}>Benefits:</span> {form.benefits.length > 0 ? form.benefits.join(', ') : '—'}</div>
              </div>
            </div>
            <div style={{ background: '#EBF8FF', borderRadius: 8, padding: 12, fontSize: 13, color: '#2C5282' }}>
              Your posting will go live immediately and be visible to qualified driver applicants on the platform.
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            style={{ ...btnSecondary }}
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onClose()}
            style={btnPrimary}
          >
            {step === steps.length - 1 ? 'Publish Job →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Applicant Detail Modal ────────────────────────────────────────────────────

function ApplicantDetailModal({
  applicant,
  jobTitle,
  onClose,
  onStageChange,
  onRatingChange,
}: {
  applicant: Applicant
  jobTitle: string
  onClose: () => void
  onStageChange: (id: string, stage: ApplicantStage) => void
  onRatingChange: (id: string, rating: number) => void
}) {
  const [notes, setNotes] = useState(applicant.notes)
  const stageConf = STAGE_COLORS[applicant.stage]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 660,
        maxHeight: '90vh', overflow: 'auto', padding: 32,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `${PRIMARY}20`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, fontWeight: 700, color: PRIMARY,
            }}>
              {applicant.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: DARK }}>{applicant.name}</div>
              <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{applicant.location} · {applicant.cdlClass} · {applicant.yearsExp}yr exp</div>
              <div style={{ marginTop: 6 }}>
                <Badge label={applicant.stage} bg={stageConf.bg} color={stageConf.color} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>

        {/* Contact info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 4 }}>PHONE</div>
            <div style={{ fontSize: 14, color: DARK, fontWeight: 600 }}>{applicant.phone}</div>
          </div>
          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 4 }}>EMAIL</div>
            <div style={{ fontSize: 14, color: DARK, fontWeight: 600 }}>{applicant.email}</div>
          </div>
          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 4 }}>APPLIED FOR</div>
            <div style={{ fontSize: 13, color: DARK }}>{jobTitle}</div>
          </div>
          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, marginBottom: 4 }}>APPLIED DATE</div>
            <div style={{ fontSize: 13, color: DARK }}>{applicant.appliedDate}</div>
          </div>
        </div>

        {/* CDL & Endorsements */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 10 }}>CDL Details & Endorsements</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={applicant.cdlClass} color={PRIMARY} />
            <Chip label={`${applicant.yearsExp} years exp`} color='#8B5CF6' />
            {applicant.endorsements.length > 0
              ? applicant.endorsements.map(e => <Chip key={e} label={e} color='#38C770' />)
              : <Chip label="No endorsements" />}
          </div>
        </div>

        {/* Work History */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 10 }}>Work History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {applicant.workHistory.map((w, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#F7FAFC', borderRadius: 8, padding: '10px 14px',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{w.company}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>{w.role}</div>
                </div>
                <div style={{ fontSize: 12, color: '#A0AEC0' }}>{w.from} – {w.to}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiter Rating */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>Recruiter Rating</div>
          <StarRating rating={applicant.rating} onChange={r => onRatingChange(applicant.id, r)} />
        </div>

        {/* Interview Notes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>Interview Notes</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Add interview notes, impressions, follow-up actions..."
            style={{
              ...inputStyle,
              resize: 'vertical',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Stage buttons */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 10 }}>Move to Stage</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(['Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired', 'Rejected'] as ApplicantStage[]).map(stage => (
              <button
                key={stage}
                onClick={() => onStageChange(applicant.id, stage)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: `2px solid ${applicant.stage === stage ? STAGE_COLORS[stage].color : '#E2E8F0'}`,
                  background: applicant.stage === stage ? STAGE_COLORS[stage].bg : '#fff',
                  color: applicant.stage === stage ? STAGE_COLORS[stage].color : '#718096',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
          <button style={btnPrimary}>Schedule Call</button>
          <button style={btnSecondary}>View Resume</button>
          <button style={{ ...btnSecondary, marginLeft: 'auto', color: '#E53E3E', borderColor: '#E53E3E' }}>Reject</button>
          <button onClick={onClose} style={btnSecondary}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Tab: Job Postings ─────────────────────────────────────────────────────────

function JobPostingsTab({
  onViewApplicants,
  onPostJob,
}: {
  onViewApplicants: (jobId: string) => void
  onPostJob: () => void
}) {
  const [jobs, setJobs] = useState<JobPosting[]>(JOBS)

  const togglePause = (id: string) => {
    setJobs(jbs => jbs.map(j =>
      j.id === id ? { ...j, status: j.status === 'Active' ? 'Paused' : 'Active' } : j
    ))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 15, color: '#718096' }}>
          Showing <strong style={{ color: DARK }}>{jobs.filter(j => j.status !== 'Closed').length}</strong> active postings
        </div>
        <button onClick={onPostJob} style={btnPrimary}>+ Post New Job</button>
      </div>

      {jobs.map(job => {
        const sc = STATUS_COLORS[job.status]
        return (
          <div key={job.id} style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            border: '1px solid #E2E8F0',
            opacity: job.status === 'Closed' ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: DARK }}>{job.title}</div>
                  <Badge label={job.status} bg={sc.bg} color={sc.color} />
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#718096', flexWrap: 'wrap', marginBottom: 10 }}>
                  <span>📍 {job.location}</span>
                  <span>💵 {job.payLabel}</span>
                  <span>📅 Posted {job.postedDate}</span>
                  <span style={{ fontWeight: 600, color: PRIMARY }}>👤 {job.applicants} applicants</span>
                </div>
                <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.5, marginBottom: 12 }}>
                  {job.description}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.05em', marginBottom: 6 }}>REQUIREMENTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {job.requirements.map(r => <Chip key={r} label={r} color={PRIMARY} />)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', letterSpacing: '0.05em', marginBottom: 6 }}>BENEFITS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {job.benefits.map(b => <Chip key={b} label={b} color='#48BB78' />)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #F0F4F8', flexWrap: 'wrap' }}>
              <button style={btnSmall}>✏️ Edit</button>
              <button onClick={() => togglePause(job.id)} style={btnSmall}>
                {job.status === 'Active' ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button
                onClick={() => onViewApplicants(job.id)}
                style={{ ...btnSmall, background: `${PRIMARY}15`, color: PRIMARY, borderColor: `${PRIMARY}40` }}
              >
                👥 View {job.applicants} Applicants
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Tab: Applicants ───────────────────────────────────────────────────────────

function ApplicantsTab({
  filterJobId,
  applicants,
  onRatingChange,
  onStageChange,
}: {
  filterJobId: string | null
  applicants: Applicant[]
  onRatingChange: (id: string, rating: number) => void
  onStageChange: (id: string, stage: ApplicantStage) => void
}) {
  const [search, setSearch] = useState('')
  const [jobFilter, setJobFilter] = useState(filterJobId || 'all')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)

  const filtered = applicants.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase())
    const matchJob = jobFilter === 'all' || a.jobId === jobFilter
    const matchStage = stageFilter === 'all' || a.stage === stageFilter
    return matchSearch && matchJob && matchStage
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search applicants..."
          style={{ ...inputStyle, minWidth: 220, flex: 1 }}
        />
        <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} style={{ ...inputStyle, minWidth: 200 }}>
          <option value="all">All Jobs</option>
          {JOBS.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ ...inputStyle, minWidth: 150 }}>
          <option value="all">All Stages</option>
          {(['Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired', 'Rejected'] as ApplicantStage[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div style={{ fontSize: 13, color: '#718096', whiteSpace: 'nowrap' }}>
          {filtered.length} applicant{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Applicant cards */}
      {filtered.map(app => {
        const job = JOBS.find(j => j.id === app.jobId)
        const sc = STAGE_COLORS[app.stage]
        return (
          <div key={app.id} style={{
            background: '#fff', borderRadius: 12, padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: `${PRIMARY}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: PRIMARY,
              }}>
                {app.name.split(' ').map(n => n[0]).join('')}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{app.name}</div>
                    <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{app.location}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <Badge label={app.stage} bg={sc.bg} color={sc.color} />
                    <StarRating rating={app.rating} onChange={r => onRatingChange(app.id, r)} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  <Chip label={app.cdlClass} color={PRIMARY} />
                  <Chip label={`${app.yearsExp}yr exp`} color='#8B5CF6' />
                  {app.endorsements.map(e => <Chip key={e} label={e} color='#38C770' />)}
                </div>

                <div style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>
                  Applied <strong>{app.appliedDate}</strong> for{' '}
                  <span style={{ color: PRIMARY, fontWeight: 600 }}>{job?.title || 'Unknown'}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedApplicant(app)} style={{ ...btnSmall, background: `${PRIMARY}15`, color: PRIMARY, borderColor: `${PRIMARY}40` }}>
                    View Profile
                  </button>
                  <button style={btnSmall}>📞 Schedule Call</button>
                  <button style={btnSmall}>📄 Resume</button>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {app.stage !== 'Hired' && app.stage !== 'Rejected' && (
                      <button
                        onClick={() => {
                          const stages: ApplicantStage[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Hired']
                          const idx = stages.indexOf(app.stage as ApplicantStage)
                          if (idx < stages.length - 1) onStageChange(app.id, stages[idx + 1])
                        }}
                        style={{ ...btnSmall, background: '#F0FFF4', color: '#276749', borderColor: '#9AE6B4' }}
                      >
                        Advance →
                      </button>
                    )}
                    {app.stage !== 'Rejected' && (
                      <button
                        onClick={() => onStageChange(app.id, 'Rejected')}
                        style={{ ...btnSmall, color: '#E53E3E', borderColor: '#FEB2B2' }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#A0AEC0', fontSize: 15 }}>
          No applicants match your filters.
        </div>
      )}

      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          jobTitle={JOBS.find(j => j.id === selectedApplicant.jobId)?.title || 'Unknown'}
          onClose={() => setSelectedApplicant(null)}
          onStageChange={(id, stage) => {
            onStageChange(id, stage)
            setSelectedApplicant(a => a ? { ...a, stage } : null)
          }}
          onRatingChange={(id, r) => {
            onRatingChange(id, r)
            setSelectedApplicant(a => a ? { ...a, rating: r } : null)
          }}
        />
      )}
    </div>
  )
}

// ── Tab: Pipeline (Kanban) ────────────────────────────────────────────────────

function PipelineTab({
  applicants,
  onStageChange,
}: {
  applicants: Applicant[]
  onStageChange: (id: string, stage: ApplicantStage) => void
}) {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)

  const colApplicants = (stage: ApplicantStage) => applicants.filter(a => a.stage === stage)

  return (
    <div>
      <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>
        Visual pipeline of all {applicants.length} candidates across hiring stages. Use Advance buttons to move applicants forward.
      </div>
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12,
        alignItems: 'flex-start',
      }}>
        {PIPELINE_STAGES.map(stage => {
          const col = colApplicants(stage)
          const colColor = PIPELINE_COLORS[stage]
          return (
            <div key={stage} style={{ minWidth: 220, flex: '0 0 220px' }}>
              {/* Column header */}
              <div style={{
                background: '#fff',
                borderRadius: '10px 10px 0 0',
                padding: '12px 14px',
                borderTop: `4px solid ${colColor}`,
                borderLeft: '1px solid #E2E8F0',
                borderRight: '1px solid #E2E8F0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{stage}</div>
                <div style={{
                  background: `${colColor}20`, color: colColor,
                  borderRadius: 20, padding: '2px 8px',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {col.length}
                </div>
              </div>

              {/* Column body */}
              <div style={{
                background: '#F7FAFC',
                borderLeft: '1px solid #E2E8F0',
                borderRight: '1px solid #E2E8F0',
                borderBottom: '1px solid #E2E8F0',
                borderRadius: '0 0 10px 10px',
                minHeight: 120,
                padding: 8,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {col.map(app => {
                  const job = JOBS.find(j => j.id === app.jobId)
                  const stageIdx = PIPELINE_STAGES.indexOf(stage)
                  const urgency = app.rating >= 4
                    ? { border: `1.5px solid ${colColor}60`, shadow: `0 0 0 2px ${colColor}20` }
                    : { border: '1.5px solid #E2E8F0', shadow: 'none' }

                  return (
                    <div key={app.id} style={{
                      background: '#fff',
                      borderRadius: 8,
                      padding: '10px 12px',
                      border: urgency.border,
                      boxShadow: urgency.shadow,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>{app.name}</div>
                        {app.rating >= 4 && (
                          <span style={{ fontSize: 12, color: '#F6AD55' }}>★ {app.rating}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>
                        {app.cdlClass} · {app.yearsExp}yr · {app.location.split(',')[1]?.trim() || app.location}
                      </div>
                      <div style={{ fontSize: 11, color: PRIMARY, fontWeight: 500, marginBottom: 8 }}>
                        {job?.title.replace('CDL-A ', '').replace('CDL-B ', '').substring(0, 28)}...
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setSelectedApplicant(app)}
                          style={{ ...btnSmall, fontSize: 10, padding: '3px 8px' }}
                        >
                          Profile
                        </button>
                        {stageIdx < PIPELINE_STAGES.length - 1 && (
                          <button
                            onClick={() => onStageChange(app.id, PIPELINE_STAGES[stageIdx + 1])}
                            style={{ ...btnSmall, fontSize: 10, padding: '3px 8px', background: '#F0FFF4', color: '#276749', borderColor: '#9AE6B4' }}
                          >
                            → {PIPELINE_STAGES[stageIdx + 1].split(' ')[0]}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {col.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 8px', fontSize: 12, color: '#CBD5E0' }}>
                    No candidates
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          jobTitle={JOBS.find(j => j.id === selectedApplicant.jobId)?.title || 'Unknown'}
          onClose={() => setSelectedApplicant(null)}
          onStageChange={(id, stage) => {
            onStageChange(id, stage)
            setSelectedApplicant(a => a ? { ...a, stage } : null)
          }}
          onRatingChange={() => {}}
        />
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DriverRecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'postings' | 'applicants' | 'pipeline'>('postings')
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [applicantJobFilter, setApplicantJobFilter] = useState<string | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>(APPLICANTS)

  const handleViewApplicants = (jobId: string) => {
    setApplicantJobFilter(jobId)
    setActiveTab('applicants')
  }

  const handleRatingChange = (id: string, rating: number) => {
    setApplicants(apps => apps.map(a => a.id === id ? { ...a, rating } : a))
  }

  const handleStageChange = (id: string, stage: ApplicantStage) => {
    setApplicants(apps => apps.map(a => a.id === id ? { ...a, stage } : a))
  }

  const totalApplicants = 81
  const activeOpenings = JOBS.filter(j => j.status === 'Active').length
  const interviewsThisWeek = applicants.filter(a => a.stage === 'Interview').length
  const hiredYTD = 12

  const tabs = [
    { key: 'postings' as const, label: '📋 Job Postings', count: activeOpenings },
    { key: 'applicants' as const, label: '👥 Applicants', count: applicants.length },
    { key: 'pipeline' as const, label: '📊 Pipeline', count: null },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F4F8',
      padding: '24px 28px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: DARK, marginBottom: 4 }}>
          Driver Recruitment Board
        </div>
        <div style={{ fontSize: 14, color: '#718096' }}>
          Post job openings, manage applications, and track your hiring pipeline.
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <KpiCard
          label="Active Openings"
          value={activeOpenings}
          sub="Accepting applications"
          accent={PRIMARY}
        />
        <KpiCard
          label="Total Applicants"
          value={totalApplicants}
          sub="Across all postings"
          accent='#8B5CF6'
        />
        <KpiCard
          label="Interviews This Week"
          value={interviewsThisWeek}
          sub="Scheduled or in progress"
          accent='#ED8936'
        />
        <KpiCard
          label="Hired YTD"
          value={hiredYTD}
          sub="Drivers onboarded in 2026"
          accent='#48BB78'
        />
      </div>

      {/* Market context banner */}
      <div style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #2C3E50 100%)`,
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 20 }}>🚛</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
            US Truck Driver Shortage: ~80,000 drivers needed industry-wide
          </div>
          <div style={{ fontSize: 12, color: '#A0AEC0' }}>
            Respond to applicants within 24h — top drivers receive 3–5 offers simultaneously. Speed wins in this market.
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: PRIMARY }}>~80K</div>
            <div style={{ fontSize: 10, color: '#A0AEC0' }}>Driver shortage</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#48BB78' }}>24h</div>
            <div style={{ fontSize: 10, color: '#A0AEC0' }}>Response target</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#ED8936' }}>3–5x</div>
            <div style={{ fontSize: 10, color: '#A0AEC0' }}>Competing offers</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '2px solid #E2E8F0',
        marginBottom: 24, gap: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? `3px solid ${PRIMARY}` : '3px solid transparent',
              marginBottom: -2,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? PRIMARY : '#718096',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <span style={{
                background: activeTab === tab.key ? PRIMARY : '#E2E8F0',
                color: activeTab === tab.key ? '#fff' : '#718096',
                borderRadius: 20,
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'postings' && (
        <JobPostingsTab
          onViewApplicants={handleViewApplicants}
          onPostJob={() => setShowPostJobModal(true)}
        />
      )}

      {activeTab === 'applicants' && (
        <ApplicantsTab
          filterJobId={applicantJobFilter}
          applicants={applicants}
          onRatingChange={handleRatingChange}
          onStageChange={handleStageChange}
        />
      )}

      {activeTab === 'pipeline' && (
        <PipelineTab
          applicants={applicants.filter(a => a.stage !== 'Rejected')}
          onStageChange={handleStageChange}
        />
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <PostJobModal onClose={() => setShowPostJobModal(false)} />
      )}
    </div>
  )
}
