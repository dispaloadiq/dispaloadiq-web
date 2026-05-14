import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type RiskLevel = 'safe' | 'caution' | 'danger' | 'blacklisted'
type ReportType = 'unpaid' | 'double_broker' | 'late_pay' | 'ghost' | 'fake_mc' | 'lowball' | 'positive'

interface BrokerReview {
  id: string
  author: string
  flag: string
  date: string
  rating: number   // 1–5
  type: ReportType
  text: string
  loadAmount: number
  daysToPayActual: number
  verified: boolean
  helpful: number
}

interface Broker {
  id: string
  name: string
  mc: string
  dot?: string
  city: string
  state: string
  risk: RiskLevel
  trustScore: number   // 0–100
  avgPayDays: number
  onTimePayPct: number
  totalReviews: number
  reports: number      // negative reports
  verifiedLoads: number
  creditScore: number  // DAT-style 0–100
  bond: number         // $ thousands
  bondSufficient: boolean
  inBusiness: number   // years
  reviews: BrokerReview[]
  tags: string[]
  lastActivity: string
  recentAlert?: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const BROKERS: Broker[] = [
  {
    id: 'b1',
    name: 'Echo Global Logistics',
    mc: 'MC-338341',
    dot: 'DOT-1234567',
    city: 'Chicago', state: 'IL',
    risk: 'safe',
    trustScore: 94,
    avgPayDays: 21,
    onTimePayPct: 97,
    totalReviews: 847,
    reports: 3,
    verifiedLoads: 2341,
    creditScore: 89,
    bond: 75,
    bondSufficient: true,
    inBusiness: 18,
    tags: ['Fast Pay', 'Responsive', 'Fair Rates', 'Top Broker'],
    lastActivity: '2h ago',
    reviews: [
      { id: 'r1', author: 'Maria S.', flag: '🇺🇦', date: 'May 8 2025', rating: 5, type: 'positive', text: 'Paid in 18 days exactly as promised. RC was clean, no surprises. Would book again.', loadAmount: 2800, daysToPayActual: 18, verified: true, helpful: 34 },
      { id: 'r2', author: 'Alex P.', flag: '🇺🇦', date: 'Apr 21 2025', rating: 4, type: 'positive', text: 'Good broker, slight delay once but communicated immediately. Overall solid.', loadAmount: 3200, daysToPayActual: 24, verified: true, helpful: 12 },
      { id: 'r3', author: 'James W.', flag: '🇺🇸', date: 'Mar 15 2025', rating: 5, type: 'positive', text: 'Preferred carrier status after 5 loads. They actually reward loyalty.', loadAmount: 4100, daysToPayActual: 21, verified: true, helpful: 28 },
    ],
  },
  {
    id: 'b2',
    name: 'Coyote Logistics',
    mc: 'MC-556150',
    city: 'Chicago', state: 'IL',
    risk: 'safe',
    trustScore: 88,
    avgPayDays: 28,
    onTimePayPct: 91,
    totalReviews: 1203,
    reports: 14,
    verifiedLoads: 4820,
    creditScore: 82,
    bond: 75,
    bondSufficient: true,
    inBusiness: 17,
    tags: ['Large Volume', 'Net 30', 'Reliable'],
    lastActivity: '45min ago',
    reviews: [
      { id: 'r4', author: 'Sandra K.', flag: '🇺🇸', date: 'May 10 2025', rating: 4, type: 'late_pay', text: 'Solid broker but consistently 28-32 days, not the 21 they advertise. Plan for Net 30.', loadAmount: 2400, daysToPayActual: 31, verified: true, helpful: 67 },
    ],
  },
  {
    id: 'b3',
    name: 'Loadmaster Freight LLC',
    mc: 'MC-892341',
    city: 'Dallas', state: 'TX',
    risk: 'caution',
    trustScore: 44,
    avgPayDays: 47,
    onTimePayPct: 58,
    totalReviews: 93,
    reports: 21,
    verifiedLoads: 142,
    creditScore: 38,
    bond: 75,
    bondSufficient: false,
    inBusiness: 1,
    tags: ['Slow Pay', 'Low Rates', 'New Company'],
    lastActivity: '3 days ago',
    recentAlert: '⚠️ 3 unpaid reports in last 30 days',
    reviews: [
      { id: 'r5', author: 'Dima V.', flag: '🇺🇿', date: 'May 2 2025', rating: 2, type: 'late_pay', text: 'Finally paid on day 54. Took 6 emails. Would not book again without escrow.', loadAmount: 1900, daysToPayActual: 54, verified: true, helpful: 45 },
      { id: 'r6', author: 'Olena T.', flag: '🇺🇦', date: 'Apr 8 2025', rating: 1, type: 'unpaid', text: 'Never paid. Filed FMCSA complaint. Bond claim in process. Stay away.', loadAmount: 2200, daysToPayActual: 0, verified: true, helpful: 89 },
    ],
  },
  {
    id: 'b4',
    name: 'FastFreight Solutions',
    mc: 'MC-778234',
    city: 'Cheyenne', state: 'WY',
    risk: 'blacklisted',
    trustScore: 4,
    avgPayDays: 0,
    onTimePayPct: 0,
    totalReviews: 34,
    reports: 31,
    verifiedLoads: 0,
    creditScore: 8,
    bond: 75,
    bondSufficient: false,
    inBusiness: 0,
    tags: ['BLACKLISTED', 'Double Broker', 'Ghost', 'Fake MC'],
    lastActivity: '12 days ago',
    recentAlert: '🚨 MC# reported as fraudulent — do NOT haul',
    reviews: [
      { id: 'r7', author: 'Robert H.', flag: '🇺🇸', date: 'Apr 28 2025', rating: 1, type: 'double_broker', text: 'Got double brokered. Picked up load, delivered, broker vanished. Lost $3,200. MC# was stolen from a legit broker.', loadAmount: 3200, daysToPayActual: 0, verified: true, helpful: 112 },
      { id: 'r8', author: 'Carlos M.', flag: '🇺🇸', date: 'Apr 14 2025', rating: 1, type: 'fake_mc', text: 'Called the actual broker with this MC — they had never heard of this load. Hung up immediately. Virtual office in Wyoming.', loadAmount: 2700, daysToPayActual: 0, verified: true, helpful: 98 },
    ],
  },
  {
    id: 'b5',
    name: 'TQL — Total Quality Logistics',
    mc: 'MC-193571',
    city: 'Cincinnati', state: 'OH',
    risk: 'safe',
    trustScore: 91,
    avgPayDays: 24,
    onTimePayPct: 94,
    totalReviews: 2841,
    reports: 28,
    verifiedLoads: 9102,
    creditScore: 87,
    bond: 75,
    bondSufficient: true,
    inBusiness: 27,
    tags: ['Top Broker', 'Fast Pay', 'High Volume', 'EDI Available'],
    lastActivity: '1h ago',
    reviews: [
      { id: 'r9', author: 'Ivan B.', flag: '🇺🇦', date: 'May 11 2025', rating: 5, type: 'positive', text: 'One of the best. Consistent, communicative, fair. Pays in 24 days every time.', loadAmount: 3800, daysToPayActual: 24, verified: true, helpful: 56 },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const RISK_CONFIG: Record<RiskLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
  safe:        { label: 'Safe', bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97', dot: '#639922' },
  caution:     { label: 'Caution', bg: '#FAEEDA', text: '#633806', border: '#FAC775', dot: '#BA7517' },
  danger:      { label: 'Danger', bg: '#FCEBEB', text: '#791F1F', border: '#F7C1C1', dot: '#E24B4A' },
  blacklisted: { label: 'BLACKLISTED', bg: '#1A202C', text: '#FC8181', border: '#E24B4A', dot: '#E24B4A' },
}

const REPORT_LABELS: Record<ReportType, string> = {
  unpaid:       '🚫 Not Paid',
  double_broker:'🔄 Double Broker',
  late_pay:     '⏰ Late Payment',
  ghost:        '👻 Ghosted',
  fake_mc:      '⚠️ Fake MC#',
  lowball:      '📉 Lowball',
  positive:     '✅ Positive',
}

function ScoreMeter({ score, size = 60 }: { score: number; size?: number }) {
  const color = score >= 80 ? '#639922' : score >= 50 ? '#BA7517' : '#E24B4A'
  const stroke = 3.5
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const pct = circ * (1 - score / 100)
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={pct}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={color}>{score}</text>
    </svg>
  )
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size, color: '#F59E0B' }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ opacity: i <= rating ? 1 : 0.25 }}>★</span>)}
    </span>
  )
}

function PayBadge({ days }: { days: number }) {
  const color = days === 0 ? '#E24B4A' : days <= 21 ? '#639922' : days <= 30 ? '#BA7517' : '#E24B4A'
  const bg    = days === 0 ? '#FCEBEB' : days <= 21 ? '#EAF3DE' : days <= 30 ? '#FAEEDA' : '#FCEBEB'
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color }}>
      {days === 0 ? 'NEVER PAID' : `Avg ${days} days`}
    </span>
  )
}

// ── Report Modal ──────────────────────────────────────────────────────────────
function ReportModal({ broker, onClose, onSubmit }: { broker: Broker; onClose: () => void; onSubmit: () => void }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState<ReportType | ''>('')
  const [amount, setAmount] = useState('')
  const [days, setDays] = useState('')
  const [text, setText] = useState('')
  const [rc, setRc] = useState(false)

  const types: { t: ReportType; label: string; desc: string }[] = [
    { t: 'unpaid',       label: '🚫 Not Paid',      desc: 'Broker never paid for completed delivery' },
    { t: 'double_broker',label: '🔄 Double Broker', desc: 'Broker sub-contracted without permission' },
    { t: 'fake_mc',      label: '⚠️ Fake MC#',      desc: 'MC number belongs to different company' },
    { t: 'ghost',        label: '👻 Ghosted',        desc: 'Broker went silent after delivery' },
    { t: 'late_pay',     label: '⏰ Late Payment',  desc: 'Paid significantly later than RC states' },
    { t: 'positive',     label: '✅ Positive',       desc: 'Paid on time, professional, recommend' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 460, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A202C' }}>Report {broker.name}</div>
            <div style={{ fontSize: 12, color: '#718096' }}>Step {step} of 3</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? '#6366F1' : '#E2E8F0' }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 12 }}>What happened?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {types.map(t => (
                <div key={t.t}
                  onClick={() => setType(t.t)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: `1px solid ${type === t.t ? '#6366F1' : '#E2E8F0'}`,
                    background: type === t.t ? '#EEF2FF' : '#fff', cursor: 'pointer',
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A202C' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: '#718096' }}>{t.desc}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
              onClick={() => type && setStep(2)} disabled={!type}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 16 }}>Load details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 4 }}>Load amount ($)</label>
                <input type="number" placeholder="e.g. 2400" value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
              </div>
              {type !== 'positive' && (
                <div>
                  <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 4 }}>Days until paid (0 = never paid)</label>
                  <input type="number" placeholder="e.g. 54" value={days} onChange={e => setDays(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 4 }}>Describe what happened</label>
                <textarea rows={3} placeholder="Be specific — other dispatchers rely on this..." value={text} onChange={e => setText(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, resize: 'vertical' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4A5568', cursor: 'pointer' }}>
                <input type="checkbox" checked={rc} onChange={e => setRc(e.target.checked)} />
                I have the Rate Confirmation to upload (adds Verified badge)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={() => text.length > 10 && setStep(3)} disabled={text.length <= 10}>
                Review Report →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 16 }}>Review & submit</div>
            <div style={{ background: '#F7FAFC', borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: '#718096' }}>Broker</span>
                <span style={{ fontWeight: 600, color: '#1A202C' }}>{broker.name} · {broker.mc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: '#718096' }}>Report type</span>
                <span style={{ fontWeight: 600, color: '#1A202C' }}>{type ? REPORT_LABELS[type] : ''}</span>
              </div>
              {amount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                  <span style={{ color: '#718096' }}>Load amount</span>
                  <span style={{ fontWeight: 600, color: '#1A202C' }}>${Number(amount).toLocaleString()}</span>
                </div>
              )}
              <div style={{ fontSize: 12, color: '#4A5568', borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 8, lineHeight: 1.5 }}>{text}</div>
            </div>
            <div style={{ background: '#EEF2FF', borderRadius: 8, padding: 10, fontSize: 12, color: '#4338CA', marginBottom: 16 }}>
              ℹ️ Your report is anonymous to other users, but your account is verified. False reports may result in account suspension.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 2, background: '#EF4444', borderColor: '#EF4444' }}
                onClick={() => { onSubmit(); onClose() }}>
                Submit Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Broker Detail Panel ───────────────────────────────────────────────────────
function BrokerDetail({ broker, onClose, onReport }: { broker: Broker; onClose: () => void; onReport: () => void }) {
  const r = RISK_CONFIG[broker.risk]
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
      {/* Alert banner */}
      {broker.recentAlert && (
        <div style={{ background: broker.risk === 'blacklisted' ? '#1A202C' : '#FEF3C7', padding: '10px 20px', fontSize: 13, fontWeight: 600, color: broker.risk === 'blacklisted' ? '#FC8181' : '#92400E' }}>
          {broker.recentAlert}
        </div>
      )}

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#1A202C' }}>{broker.name}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: r.bg, color: r.text }}>
                {r.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#718096' }}>{broker.mc} · {broker.city}, {broker.state} · {broker.inBusiness}y in business</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ScoreMeter score={broker.trustScore} size={52} />
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#718096' }}>✕</button>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Trust Score', value: `${broker.trustScore}/100`, color: broker.trustScore >= 80 ? '#639922' : broker.trustScore >= 50 ? '#BA7517' : '#E24B4A' },
            { label: 'On-time Pay', value: `${broker.onTimePayPct}%`, color: broker.onTimePayPct >= 90 ? '#639922' : '#BA7517' },
            { label: 'Credit Score', value: `${broker.creditScore}/100`, color: broker.creditScore >= 75 ? '#639922' : '#BA7517' },
            { label: 'Reports', value: `${broker.reports}`, color: broker.reports > 20 ? '#E24B4A' : broker.reports > 5 ? '#BA7517' : '#639922' },
          ].map(s => (
            <div key={s.label} style={{ background: '#F7FAFC', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#718096' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pay timeline */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: '#718096' }}>Average pay timeline</span>
            <PayBadge days={broker.avgPayDays} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#A0AEC0' }}>
            <span>Day 0</span>
            <div style={{ flex: 1, height: 8, background: '#EDF2F7', borderRadius: 4, position: 'relative', overflow: 'visible' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: broker.avgPayDays === 0 ? '100%' : `${Math.min(100, (broker.avgPayDays / 60) * 100)}%`, background: broker.avgPayDays === 0 ? '#E24B4A' : broker.avgPayDays <= 21 ? '#639922' : broker.avgPayDays <= 35 ? '#BA7517' : '#E24B4A', borderRadius: 4 }} />
            </div>
            <span>Day 60</span>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {broker.tags.map(t => (
            <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: t === 'BLACKLISTED' ? '#1A202C' : '#EDF2F7', color: t === 'BLACKLISTED' ? '#FC8181' : '#718096', fontWeight: 600 }}>
              {t}
            </span>
          ))}
        </div>

        {/* Bond warning */}
        {!broker.bondSufficient && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400E', marginBottom: 16 }}>
            ⚠️ <strong>Bond Warning:</strong> Bond may be insufficient to cover losses if multiple carriers file claims simultaneously. $75K shared among all claims.
          </div>
        )}
      </div>

      {/* Reviews */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A202C' }}>Community Reviews ({broker.totalReviews})</div>
          {broker.risk !== 'blacklisted' && (
            <button className="btn btn-sm" style={{ background: '#FEF2F2', color: '#E24B4A', border: '1px solid #FECACA', fontSize: 12 }}
              onClick={onReport}>
              + Report Issue
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {broker.reviews.map(rev => (
            <div key={rev.id} style={{ background: '#F7FAFC', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#718096' }}>
                    {rev.author.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1A202C' }}>{rev.flag} {rev.author}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>{rev.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {rev.verified && <span style={{ fontSize: 10, background: '#EAF3DE', color: '#3B6D11', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>✓ Verified</span>}
                  <Stars rating={rev.rating} size={12} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: rev.type === 'positive' ? '#EAF3DE' : '#FCEBEB', color: rev.type === 'positive' ? '#3B6D11' : '#A32D2D', fontWeight: 600 }}>
                  {REPORT_LABELS[rev.type]}
                </span>
                <span style={{ fontSize: 10, color: '#718096' }}>${rev.loadAmount.toLocaleString()} load</span>
                {rev.daysToPayActual > 0 && <span style={{ fontSize: 10, color: '#718096' }}>Paid in {rev.daysToPayActual} days</span>}
                {rev.daysToPayActual === 0 && rev.type !== 'positive' && <span style={{ fontSize: 10, color: '#E24B4A', fontWeight: 600 }}>NEVER PAID</span>}
              </div>
              <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5 }}>{rev.text}</div>
              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 8 }}>👍 {rev.helpful} found this helpful</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Broker Card ───────────────────────────────────────────────────────────────
function BrokerCard({ broker, onSelect }: { broker: Broker; onSelect: () => void }) {
  const r = RISK_CONFIG[broker.risk]
  return (
    <div
      onClick={onSelect}
      style={{
        background: broker.risk === 'blacklisted' ? '#1A202C' : '#fff',
        border: `1px solid ${broker.risk === 'blacklisted' ? '#E24B4A' : '#E2E8F0'}`,
        borderLeft: `4px solid ${r.dot}`,
        borderRadius: 12,
        padding: 16,
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
    >
      {broker.recentAlert && (
        <div style={{ fontSize: 11, color: broker.risk === 'blacklisted' ? '#FC8181' : '#92400E', background: broker.risk === 'blacklisted' ? 'rgba(255,0,0,0.1)' : '#FEF3C7', padding: '4px 8px', borderRadius: 6, marginBottom: 10, fontWeight: 600 }}>
          {broker.recentAlert}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: broker.risk === 'blacklisted' ? '#FED7D7' : '#1A202C', marginBottom: 2 }}>{broker.name}</div>
          <div style={{ fontSize: 11, color: broker.risk === 'blacklisted' ? '#FC8181' : '#718096' }}>{broker.mc} · {broker.city}, {broker.state}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ScoreMeter score={broker.trustScore} size={44} />
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 20, background: r.bg, color: r.text }}>
            {r.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: broker.risk === 'blacklisted' ? '#A0AEC0' : '#718096', marginBottom: 10 }}>
        <span>💰 <PayBadge days={broker.avgPayDays} /></span>
        <span>⭐ {broker.totalReviews} reviews</span>
        <span>📋 {broker.reports} reports</span>
      </div>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {broker.tags.slice(0, 3).map(t => (
          <span key={t} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: t === 'BLACKLISTED' ? '#500' : '#F7FAFC', color: t === 'BLACKLISTED' ? '#FC8181' : '#718096', fontWeight: 600 }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
type TabId = 'search' | 'blacklist' | 'alerts' | 'submit'
type RiskFilter = 'all' | RiskLevel

export default function BrokerTrustNetworkPage() {
  const [tab, setTab]               = useState<TabId>('search')
  const [search, setSearch]         = useState('')
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all')
  const [selected, setSelected]     = useState<Broker | null>(null)
  const [reporting, setReporting]   = useState<Broker | null>(null)
  const [toast, setToast]           = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const filtered = BROKERS.filter(b => {
    const matchSearch = search === '' ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.mc.toLowerCase().includes(search.toLowerCase())
    const matchRisk = riskFilter === 'all' || b.risk === riskFilter
    return matchSearch && matchRisk
  })

  const blacklisted = BROKERS.filter(b => b.risk === 'blacklisted')
  const caution     = BROKERS.filter(b => b.risk === 'caution')
  const recentAlerts = BROKERS.filter(b => b.recentAlert)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#1A202C', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      {/* Report Modal */}
      {reporting && (
        <ReportModal
          broker={reporting}
          onClose={() => setReporting(null)}
          onSubmit={() => showToast('✅ Report submitted — thank you for protecting the community!')}
        />
      )}

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 60%, #1A202C 100%)', borderRadius: 16, padding: 28, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(239,68,68,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 100, width: 100, height: 100, borderRadius: '50%', background: 'rgba(239,68,68,0.04)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.15)', borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#FC8181', fontWeight: 700, letterSpacing: 1 }}>🛡️ BROKER TRUST NETWORK</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
              Know Before You Haul
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6, maxWidth: 480 }}>
              Community-powered broker reputation network. $455M in fraud losses in 2024 — we're ending that. Check any broker before you commit.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" style={{ background: '#E24B4A', color: '#fff', border: 'none', fontWeight: 700 }}
                onClick={() => showToast('🚨 Checking MC database...')}>
                Check MC Number
              </button>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => setTab('submit')}>
                + Report Broker
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            {[
              { label: 'Brokers tracked', value: '48,200', color: '#FC8181' },
              { label: 'Reports this month', value: '1,847', color: '#FBD38D' },
              { label: 'Fraud prevented', value: '$2.1M', color: '#9AE6B4' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px', textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Alert ribbon ── */}
      {recentAlerts.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Active alerts: </span>
            {recentAlerts.map((b, i) => (
              <span key={b.id} style={{ fontSize: 12, color: '#B45309' }}>
                {b.name} — {b.recentAlert}{i < recentAlerts.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
          <button className="btn btn-sm" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', fontSize: 11 }}
            onClick={() => setTab('alerts')}>
            View All Alerts
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F7FAFC', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {([
          { id: 'search',    label: '🔍 Search Brokers' },
          { id: 'blacklist', label: `🚫 Blacklist (${blacklisted.length})` },
          { id: 'alerts',    label: `⚠️ Active Alerts (${recentAlerts.length + caution.length})` },
          { id: 'submit',    label: '+ Report Broker' },
        ] as { id: TabId; label: string }[]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? '#1A202C' : '#718096',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Search Tab ── */}
      {tab === 'search' && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
          <div>
            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                type="text"
                placeholder="Search broker name or MC number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13 }}
              />
              <select value={riskFilter} onChange={e => setRiskFilter(e.target.value as RiskFilter)}
                style={{ padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12, color: '#4A5568' }}>
                <option value="all">All Risk Levels</option>
                <option value="safe">Safe</option>
                <option value="caution">Caution</option>
                <option value="danger">Danger</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(b => (
                <BrokerCard key={b.id} broker={b} onSelect={() => setSelected(b)} />
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A0AEC0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#718096' }}>No brokers found</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Try a different name or MC number</div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }}
                    onClick={() => { setTab('submit'); showToast('Add this broker to our database') }}>
                    Add This Broker →
                  </button>
                </div>
              )}
            </div>
          </div>
          {selected && (
            <div>
              <BrokerDetail
                broker={selected}
                onClose={() => setSelected(null)}
                onReport={() => { setReporting(selected); setSelected(null) }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Blacklist Tab ── */}
      {tab === 'blacklist' && (
        <div>
          <div style={{ background: '#1A202C', border: '1px solid #E24B4A', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#FC8181', marginBottom: 4 }}>🚨 Community Blacklist</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>These brokers have been flagged by multiple verified dispatchers. Do NOT haul for these companies without payment protection.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BROKERS.filter(b => b.risk === 'blacklisted' || b.risk === 'danger').map(b => (
              <BrokerCard key={b.id} broker={b} onSelect={() => { setSelected(b); setTab('search') }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Alerts Tab ── */}
      {tab === 'alerts' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentAlerts.concat(caution).map(b => {
              const r = RISK_CONFIG[b.risk]
              return (
                <div key={b.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.dot, marginTop: 4, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C' }}>{b.name} · {b.mc}</div>
                        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{b.recentAlert || `⚠️ ${b.reports} negative reports — exercise caution`}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>Last activity: {b.lastActivity}</div>
                      </div>
                    </div>
                    <button className="btn btn-sm"
                      style={{ background: r.bg, color: r.text, border: `1px solid ${r.border}`, fontSize: 11 }}
                      onClick={() => { setSelected(b); setTab('search') }}>
                      View Details →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Submit Tab ── */}
      {tab === 'submit' && (
        <div style={{ maxWidth: 560 }}>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A202C', marginBottom: 6 }}>Report a Broker</div>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 20, lineHeight: 1.6 }}>
              Your report protects thousands of dispatchers. Reports are anonymous, but your account is verified — false reports result in suspension.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 4 }}>Broker Name or MC#</label>
                <input type="text" placeholder="e.g. FastFreight LLC or MC-778234"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#718096', display: 'block', marginBottom: 8 }}>What happened?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['unpaid','double_broker','fake_mc','ghost','late_pay','positive'] as ReportType[]).map(t => (
                    <button key={t} className="btn btn-sm"
                      style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, background: '#F7FAFC', border: '1px solid #E2E8F0', color: '#4A5568' }}
                      onClick={() => { setReporting(BROKERS[0]); showToast('Select a specific broker first') }}>
                      {REPORT_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#4338CA', lineHeight: 1.6 }}>
            💡 <strong>Tip:</strong> Upload your Rate Confirmation to get a "Verified" badge on your report. Verified reports have 3x more impact on the broker's Trust Score.
          </div>
        </div>
      )}
    </div>
  )
}
