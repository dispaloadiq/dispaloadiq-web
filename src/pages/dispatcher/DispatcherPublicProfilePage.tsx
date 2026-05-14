import { useState } from 'react'

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_DISPATCHER = {
  id: 'disp-001',
  name: 'Maria Kovalenko',
  avatar: 'MK',
  location: 'Kyiv, Ukraine 🇺🇦',
  memberSince: 'January 2024',
  lastActive: '2 hours ago',
  trustScore: 91,
  verified: true,
  certified: true,
  responseTime: '< 15 min',
  availability: 'available' as 'available' | 'busy' | 'limited',
  rate: 8,
  minRPM: 2.60,
  languages: ['English (Fluent)', 'Ukrainian', 'Russian'],
  specialties: ['Flatbed', 'Dry Van', 'Reefer', 'Hazmat'],
  states: ['TX', 'FL', 'CA', 'IL', 'OH', 'GA', 'NC', 'TN'],
  currentClients: 4,
  maxClients: 6,
  totalLoads: 1247,
  avgRPM: 2.91,
  onTimeRate: 97,
  clientRetention: 94,
  incidentRate: 0.8,
  bio: 'Experienced dispatcher with 3+ years in US trucking. Specialized in flatbed and reefer freight. I work with owner-ops and small fleets to maximize RPM and minimize deadhead. Available 6am–10pm CST, 7 days a week. Fast response, real communication.',
  certifications: ['DispaLoadIQ Certified Pro', 'Flatbed Specialist', 'English Proficiency A2+'],
  portfolioLoads: [
    { id: 'L-001', route: 'Houston TX → Miami FL', miles: 1180, rpm: 3.12, equipment: 'Flatbed', date: 'May 8, 2025' },
    { id: 'L-002', route: 'Chicago IL → Dallas TX', miles: 920, rpm: 2.87, equipment: 'Dry Van', date: 'May 5, 2025' },
    { id: 'L-003', route: 'Atlanta GA → Nashville TN', miles: 248, rpm: 3.45, equipment: 'Reefer', date: 'May 2, 2025' },
    { id: 'L-004', route: 'Los Angeles CA → Phoenix AZ', miles: 370, rpm: 2.75, equipment: 'Dry Van', date: 'Apr 28, 2025' },
    { id: 'L-005', route: 'Dallas TX → Kansas City MO', miles: 490, rpm: 2.93, equipment: 'Flatbed', date: 'Apr 22, 2025' },
  ],
  reviews: [
    { author: 'Dmytro K.', avatar: 'DK', rating: 5, date: 'May 10, 2025', text: 'Maria is absolutely the best dispatcher I have worked with. She found me loads above $3 RPM consistently for 4 months straight. Never misses a check call.', verified: true },
    { author: 'Ahmad R.', avatar: 'AR', rating: 5, date: 'Apr 15, 2025', text: 'Professional, responsive, and knows the lanes. I went from $2.50 average to $2.95 in 6 weeks. Highly recommend.', verified: true },
    { author: 'Oleksandr B.', avatar: 'OB', rating: 4, date: 'Mar 22, 2025', text: 'Good communication. Sometimes I have to wait for response on weekends but she always delivers quality loads.', verified: true },
    { author: 'Carlos M.', avatar: 'CM', rating: 5, date: 'Feb 14, 2025', text: 'Been with Maria for 8 months. She helped me get out of low-RPM lanes in the midwest and now I am running Southeast consistently.', verified: true },
  ],
}

// ── Sub-components ────────────────────────────────────────────────────────────
function TrustRing({ score }: { score: number }) {
  const r = 36, cx = 44, cy = 44
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  return (
    <svg width="88" height="88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth="8"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700" fill="#22c55e">{score}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" fill="#9CA3AF">TRUST</text>
    </svg>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? '#FBBF24' : '#E5E7EB' }}>★</span>
      ))}
    </span>
  )
}

const SPECIALTY_ICONS: Record<string, string> = {
  Flatbed: '🚛',
  'Dry Van': '📦',
  Reefer: '❄️',
  Hazmat: '⚠️',
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DispatcherPublicProfilePage() {
  const d = MOCK_DISPATCHER

  const [showHireModal, setShowHireModal] = useState(false)
  const [saved, setSaved] = useState(false)

  // Hire form state
  const [mcDot, setMcDot] = useState('')
  const [equipment, setEquipment] = useState('')
  const [truckCount, setTruckCount] = useState('')
  const [lanes, setLanes] = useState('')
  const [currentRpm, setCurrentRpm] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const availabilityLabel =
    d.availability === 'available' ? 'Available Now' :
    d.availability === 'limited' ? 'Limited Slots' : 'Fully Booked'

  const availabilityColor =
    d.availability === 'available' ? '#22c55e' :
    d.availability === 'limited' ? '#f59e0b' : '#ef4444'

  const capacityPct = (d.currentClients / d.maxClients) * 100
  const slotsLeft = d.maxClients - d.currentClients

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ background: 'var(--c-dark)', minHeight: '100vh', padding: '24px', position: 'relative' }}>

      {/* ── Hire Modal Overlay ─────────────────────────────────────────────── */}
      {showHireModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.72)', zIndex: 100,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '48px',
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '520px', padding: '28px',
            animation: 'slideDown 0.22s ease',
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e', marginBottom: '8px' }}>
                  Request Sent!
                </div>
                <div style={{ color: '#9CA3AF', marginBottom: '24px' }}>
                  Maria typically responds in {d.responseTime}. You'll get a notification when she replies.
                </div>
                <button className="btn btn-primary" onClick={() => { setShowHireModal(false); setSubmitted(false) }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>Hire {d.name}</div>
                  <button onClick={() => setShowHireModal(false)} style={{
                    background: 'none', border: 'none', color: '#9CA3AF',
                    fontSize: '20px', cursor: 'pointer', padding: '0 4px',
                  }}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                      Your MC# / DOT#
                    </label>
                    <input
                      type="text"
                      value={mcDot}
                      onChange={e => setMcDot(e.target.value)}
                      placeholder="MC-123456 or DOT-7890123"
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--c-dark)', border: '1px solid var(--c-border)',
                        borderRadius: '8px', padding: '10px 12px',
                        color: '#fff', fontSize: '14px', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                      Equipment Type
                    </label>
                    <select
                      value={equipment}
                      onChange={e => setEquipment(e.target.value)}
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--c-dark)', border: '1px solid var(--c-border)',
                        borderRadius: '8px', padding: '10px 12px',
                        color: equipment ? '#fff' : '#6B7280', fontSize: '14px', outline: 'none',
                      }}
                    >
                      <option value="" disabled>Select equipment...</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="Dry Van">Dry Van</option>
                      <option value="Reefer">Reefer</option>
                      <option value="Hazmat">Hazmat</option>
                      <option value="Step Deck">Step Deck</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                      How many trucks?
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={truckCount}
                      onChange={e => setTruckCount(e.target.value)}
                      placeholder="e.g. 1"
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--c-dark)', border: '1px solid var(--c-border)',
                        borderRadius: '8px', padding: '10px 12px',
                        color: '#fff', fontSize: '14px', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                      What lanes are you running?
                    </label>
                    <textarea
                      value={lanes}
                      onChange={e => setLanes(e.target.value)}
                      placeholder="e.g. TX → Southeast, Midwest loops..."
                      rows={2}
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--c-dark)', border: '1px solid var(--c-border)',
                        borderRadius: '8px', padding: '10px 12px',
                        color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                      What RPM are you currently averaging?
                    </label>
                    <input
                      type="text"
                      value={currentRpm}
                      onChange={e => setCurrentRpm(e.target.value)}
                      placeholder="e.g. $2.45"
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--c-dark)', border: '1px solid var(--c-border)',
                        borderRadius: '8px', padding: '10px 12px',
                        color: '#fff', fontSize: '14px', outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '6px' }}>
                      Message to dispatcher
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell Maria what you're looking for..."
                      rows={3}
                      required
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'var(--c-dark)', border: '1px solid var(--c-border)',
                        borderRadius: '8px', padding: '10px 12px',
                        color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      Send Hire Request
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setShowHireModal(false)}
                      style={{ flex: '0 0 auto', padding: '10px 20px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Section 1: Profile Header Card ────────────────────────────────────── */}
      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

          {/* Left: Avatar + Identity */}
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flex: '1 1 240px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {d.avatar}
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.1, marginBottom: '4px' }}>
                {d.name}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '2px' }}>
                📍 {d.location}
              </div>
              <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '2px' }}>
                Member since {d.memberSince}
              </div>
              <div style={{ color: '#6B7280', fontSize: '12px' }}>
                Last active {d.lastActive}
              </div>
            </div>
          </div>

          {/* Center: Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 180px' }}>
            {/* Availability */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: `${availabilityColor}18`, border: `1px solid ${availabilityColor}40`,
              borderRadius: '20px', padding: '5px 14px',
              color: availabilityColor, fontSize: '13px', fontWeight: 600,
              width: 'fit-content',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: availabilityColor, display: 'inline-block' }} />
              {availabilityLabel}
            </div>
            {/* Response time */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#1e293b', border: '1px solid var(--c-border)',
              borderRadius: '20px', padding: '5px 14px',
              color: '#94a3b8', fontSize: '12px',
              width: 'fit-content',
            }}>
              ⚡ Response: {d.responseTime}
            </div>
            {/* Verified */}
            {d.verified && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                color: '#38bdf8', fontSize: '12px', fontWeight: 600,
                width: 'fit-content',
              }}>
                ✓ Verified Dispatcher
              </div>
            )}
            {/* Certified */}
            {d.certified && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                color: '#FBBF24', fontSize: '12px', fontWeight: 600,
                width: 'fit-content',
              }}>
                ⭐ DispaLoadIQ Certified
              </div>
            )}
          </div>

          {/* Right: Rate + Trust Ring + Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flex: '0 0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <TrustRing score={d.trustScore} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--c-accent)' }}>
                  {d.rate}%
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.3 }}>commission<br />min {d.minRPM.toFixed(2)} RPM</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn"
                onClick={() => setSaved(s => !s)}
                style={{ padding: '9px 16px', fontSize: '13px' }}
              >
                {saved ? '♥ Saved' : '♡ Save Profile'}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowHireModal(true)}
                style={{ padding: '9px 20px', fontSize: '13px', fontWeight: 700 }}
              >
                Hire Maria
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Two-column Layout ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left Column — 60% */}
        <div style={{ flex: '3 1 340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* About */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>About</div>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, fontSize: '14px' }}>{d.bio}</p>
          </div>

          {/* Languages */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Languages</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {d.languages.map(lang => (
                <span key={lang} style={{
                  background: '#1e293b', border: '1px solid var(--c-border)',
                  borderRadius: '20px', padding: '4px 14px',
                  fontSize: '13px', color: '#cbd5e1',
                }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Equipment Specialties</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {d.specialties.map(spec => (
                <span key={spec} style={{
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '20px', padding: '5px 14px',
                  fontSize: '13px', color: '#a5b4fc', fontWeight: 500,
                }}>
                  {SPECIALTY_ICONS[spec] || '🚚'} {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Active States */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Active States ({d.states.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {d.states.map(st => (
                <span key={st} style={{
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: '6px', padding: '3px 10px',
                  fontSize: '12px', color: '#4ade80', fontWeight: 700, letterSpacing: '0.05em',
                }}>
                  {st}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Certifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {d.certifications.map(cert => (
                <div key={cert} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '15px' }}>✓</span>
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — 40% */}
        <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Stats KPI Card */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '16px' }}>Performance Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Total Loads', value: '1,247', icon: '📦', color: '#6366f1' },
                { label: 'Avg RPM', value: `$${d.avgRPM.toFixed(2)}`, icon: '💰', color: '#22c55e' },
                { label: 'On-Time Rate', value: `${d.onTimeRate}%`, icon: '⏱', color: '#38bdf8' },
                { label: 'Client Retention', value: `${d.clientRetention}%`, icon: '🔁', color: '#f59e0b' },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  background: '#0f172a', borderRadius: '10px', padding: '14px',
                  border: '1px solid var(--c-border)',
                }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{kpi.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity Card */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '14px' }}>Capacity</div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Managing</span>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>
                  {d.currentClients}
                  <span style={{ color: '#6B7280', fontSize: '13px', fontWeight: 400 }}>/{d.maxClients} trucks</span>
                </span>
              </div>
              {/* Capacity bar */}
              <div style={{ background: '#1e293b', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${capacityPct}%`, height: '100%', borderRadius: '99px',
                  background: capacityPct >= 100 ? '#ef4444' : capacityPct >= 66 ? '#f59e0b' : '#22c55e',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>
                {slotsLeft > 0
                  ? `${slotsLeft} slot${slotsLeft > 1 ? 's' : ''} available`
                  : 'No slots — waitlist only'}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#0f172a', borderRadius: '8px', padding: '10px 12px',
              border: '1px solid var(--c-border)', marginTop: '6px',
            }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {d.currentClients} active clients
              </span>
            </div>
          </div>

          {/* Incident Rate */}
          <div className="card" style={{ padding: '22px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>Quality Indicators</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Incident Rate</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>
                  {d.incidentRate}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Min Guaranteed RPM</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a5b4fc' }}>
                  ${d.minRPM.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Response Time</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8' }}>
                  {d.responseTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Load Portfolio ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: '22px', marginBottom: '20px' }}>
        <div className="section-title" style={{ marginBottom: '16px' }}>Recent Load Portfolio</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Route', 'Miles', 'RPM', 'Equipment', 'Date'].map(col => (
                  <th key={col} style={{
                    textAlign: 'left', padding: '8px 12px',
                    borderBottom: '1px solid var(--c-border)',
                    color: '#6B7280', fontWeight: 600, fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.portfolioLoads.map((load, i) => (
                <tr key={load.id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '11px 12px', color: '#e2e8f0' }}>{load.route}</td>
                  <td style={{ padding: '11px 12px', color: '#94a3b8' }}>{load.miles.toLocaleString()}</td>
                  <td style={{ padding: '11px 12px', fontWeight: 700, color: load.rpm >= 3.0 ? '#22c55e' : '#94a3b8' }}>
                    ${load.rpm.toFixed(2)}
                    {load.rpm >= 3.0 && <span style={{ fontSize: '10px', marginLeft: '4px' }}>▲</span>}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#94a3b8' }}>
                    {SPECIALTY_ICONS[load.equipment] || '🚚'} {load.equipment}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#6B7280' }}>{load.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Reviews ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div className="section-title" style={{ marginBottom: '16px' }}>
          Client Reviews ({d.reviews.length})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {d.reviews.map((review, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {/* Reviewer avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {review.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.author}</span>
                    {review.verified && (
                      <span style={{
                        fontSize: '10px', color: '#38bdf8', background: 'rgba(56,189,248,0.1)',
                        border: '1px solid rgba(56,189,248,0.25)', borderRadius: '4px', padding: '1px 6px',
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stars rating={review.rating} />
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>{review.date}</span>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.65 }}>
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ────────────────────────────────────────────────────────── */}
      <div className="card" style={{
        padding: '28px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.2)',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          Ready to work with {d.name}?
        </div>
        <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
          {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} remaining · Responds in {d.responseTime} · {d.trustScore}/100 Trust Score
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowHireModal(true)}
          style={{ fontSize: '15px', padding: '12px 36px', fontWeight: 700 }}
        >
          Send Hire Request
        </button>
      </div>

    </div>
  )
}
