import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface OOJobPosting {
  id: string
  ownerName: string
  avatar: string
  company?: string
  trucks: string
  equipment: string
  lanes: string[]
  rpmOffered: string
  startDate: string
  postedAt: string
  applicants: number
  matchPct: number
  matchReasons: string[]
  notes: string
  status: 'open' | 'filled' | 'urgent'
  rating?: number
  reviewCount?: number
  verified: boolean
  budget: string
}

interface MyApplication {
  id: string
  ownerName: string
  avatar: string
  equipment: string
  lanes: string[]
  matchPct: number
  submittedAt: string
  status: 'pending' | 'viewed' | 'interested' | 'hired' | 'declined'
  proposedRate: string
}

const POSTINGS: OOJobPosting[] = [
  {
    id: 'j1',
    ownerName: 'Elena Vasquez',
    avatar: '👩‍🚚',
    company: 'Vasquez Trucking LLC',
    trucks: '1 truck',
    equipment: 'Dry Van',
    lanes: ['TX → FL', 'TX → SE'],
    rpmOffered: '$2.50–3.00',
    startDate: 'ASAP',
    postedAt: '1 hour ago',
    applicants: 3,
    matchPct: 96,
    matchReasons: ['Your TX→FL lane expertise', 'Dry Van specialization', 'High success score 98%', 'Available now'],
    notes: 'Run mostly TX to Southeast. Need someone who knows the markets well. ELD is KeepTruckin. No NYC.',
    status: 'urgent',
    rating: undefined,
    reviewCount: 0,
    verified: true,
    budget: '$400–500/mo',
  },
  {
    id: 'j2',
    ownerName: 'Robert Torres',
    avatar: '👨‍🚚',
    company: 'RT Freight Services',
    trucks: '2 trucks',
    equipment: 'Flatbed',
    lanes: ['Midwest', 'SE US'],
    rpmOffered: '$2.80–3.40',
    startDate: 'Next week',
    postedAt: '3 hours ago',
    applicants: 0,
    matchPct: 88,
    matchReasons: ['Flatbed experience', 'Midwest lane match', 'Multi-truck management'],
    notes: 'Have 2 flatbeds running Midwest and Southeast. Looking for dispatcher who can handle both trucks and maximize loads.',
    status: 'open',
    rating: undefined,
    reviewCount: 0,
    verified: true,
    budget: '$800–1000/mo',
  },
  {
    id: 'j3',
    ownerName: 'Mike Johnson',
    avatar: '🧔‍♂️',
    company: undefined,
    trucks: '1 truck',
    equipment: 'Reefer',
    lanes: ['California', 'West Coast'],
    rpmOffered: '$3.00–4.00',
    startDate: 'In 2 weeks',
    postedAt: '5 hours ago',
    applicants: 7,
    matchPct: 74,
    matchReasons: ['Reefer in your skill set', 'CA market knowledge'],
    notes: 'West Coast reefer. Mostly produce and grocery runs. High RPM but competitive market — need experienced hands.',
    status: 'open',
    rating: 4.6,
    reviewCount: 2,
    verified: false,
    budget: '$500–700/mo',
  },
  {
    id: 'j4',
    ownerName: 'Diana Chen',
    avatar: '👩‍💼',
    company: 'Chen Logistics Inc',
    trucks: '3 trucks',
    equipment: 'Dry Van',
    lanes: ['Nationwide', 'No restrictions'],
    rpmOffered: '$2.40–2.80',
    startDate: 'ASAP',
    postedAt: '8 hours ago',
    applicants: 12,
    matchPct: 82,
    matchReasons: ['Nationwide experience', 'Multi-truck capacity', 'Dry Van primary'],
    notes: '3 dry van trucks running nationwide. Owner hands-off — need dispatcher who can operate independently. Top performance earns bonus.',
    status: 'open',
    rating: undefined,
    reviewCount: 0,
    verified: true,
    budget: '$1200–1500/mo',
  },
  {
    id: 'j5',
    ownerName: 'Carlos Rivera',
    avatar: '👨‍🚛',
    company: undefined,
    trucks: '1 truck',
    equipment: 'Hotshot',
    lanes: ['TX', 'OK', 'LA'],
    rpmOffered: '$1.80–2.50',
    startDate: 'This weekend',
    postedAt: '1 day ago',
    applicants: 5,
    matchPct: 61,
    matchReasons: ['TX market knowledge'],
    notes: 'Hotshot CDL-A. Oil field and construction loads preferred. Need someone who knows load boards well.',
    status: 'open',
    rating: undefined,
    reviewCount: 0,
    verified: false,
    budget: '$250–350/mo',
  },
]

const MY_APPLICATIONS: MyApplication[] = [
  {
    id: 'a1',
    ownerName: 'Elena Vasquez',
    avatar: '👩‍🚚',
    equipment: 'Dry Van',
    lanes: ['TX → FL'],
    matchPct: 96,
    submittedAt: '2 hours ago',
    status: 'viewed',
    proposedRate: '$450/mo',
  },
  {
    id: 'a2',
    ownerName: 'Previous Owner 1',
    avatar: '👨‍🚚',
    equipment: 'Flatbed',
    lanes: ['Midwest'],
    matchPct: 85,
    submittedAt: '2 days ago',
    status: 'declined',
    proposedRate: '$400/mo',
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function MatchReasons({ reasons }: { reasons: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
      {reasons.map(r => (
        <span key={r} style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 20,
          background: 'rgba(34,197,94,.1)', color: '#15803d', fontWeight: 600,
        }}>✓ {r}</span>
      ))}
    </div>
  )
}

function MatchMeter({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#94a3b8'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 60 }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: `conic-gradient(${color} ${pct * 3.6}deg, #e2e8f0 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 12px ${color}40`,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color,
        }}>{pct}%</div>
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>match</div>
    </div>
  )
}

function JobCard({ job, onApply }: { job: OOJobPosting; onApply: () => void }) {
  const [showProposal, setShowProposal] = useState(false)
  const [rate, setRate] = useState('')
  const [note, setNote] = useState('')

  const STATUS_COLORS = {
    urgent: { bg: '#fef2f2', border: '#fca5a5', label: '🔴 Urgent', color: '#991b1b' },
    open: { bg: '#fff', border: '#e2e8f0', label: '🟢 Open', color: '#15803d' },
    filled: { bg: '#f8fafc', border: '#e2e8f0', label: '⚫ Filled', color: '#475569' },
  }
  const sc = STATUS_COLORS[job.status]

  return (
    <div style={{
      background: sc.bg, border: `1.5px solid ${sc.border}`, borderRadius: 14,
      padding: 18, marginBottom: 12,
      ...(job.matchPct >= 90 ? { boxShadow: '0 0 14px rgba(34,197,94,.1)' } : {}),
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <MatchMeter pct={job.matchPct} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 26 }}>{job.avatar}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                    {job.ownerName} {job.company && <span style={{ fontWeight: 400, color: '#64748b' }}>· {job.company}</span>}
                    {job.verified && <span style={{ marginLeft: 6, fontSize: 11, color: '#1d4ed8', fontWeight: 700 }}>✓ Verified MC</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{job.trucks} · {job.equipment}</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{job.budget}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>per month</div>
            </div>
          </div>

          {/* Lanes + RPM */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {job.lanes.map(l => (
              <span key={l} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>📍 {l}</span>
            ))}
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f0fdf4', color: '#15803d', fontWeight: 600 }}>💰 {job.rpmOffered} RPM</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#fefce8', color: '#854d0e', fontWeight: 600 }}>🗓 {job.startDate}</span>
          </div>

          {/* Match reasons */}
          <MatchReasons reasons={job.matchReasons} />

          {/* Notes */}
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
            "{job.notes}"
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {job.status !== 'filled' && (
                <button
                  onClick={() => setShowProposal(!showProposal)}
                  className="btn btn-primary"
                  style={{ fontSize: 12 }}
                >
                  {showProposal ? '▲ Close' : '📤 Send Proposal'}
                </button>
              )}
              <button className="btn" style={{ fontSize: 12 }}>💬 Ask a Question</button>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {job.applicants > 0 ? `${job.applicants} proposals sent · ` : 'Be first to apply · '}{job.postedAt}
            </div>
          </div>

          {/* Inline proposal form */}
          {showProposal && (
            <div style={{
              marginTop: 14, background: '#f8fafc', border: '1.5px solid #e2e8f0',
              borderRadius: 10, padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                ✍️ Your Proposal to {job.ownerName}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Your monthly rate</div>
                  <input
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    placeholder="e.g. $450/truck"
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 7,
                      border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>
                <div style={{ background: '#eff6ff', borderRadius: 7, padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1d4ed8', marginBottom: 2 }}>🤖 AI Rate Suggestion</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>$420–480/truck</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Based on TX→FL market rates</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Cover note (why you're the right fit)</div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. I've been dispatching TX→FL dry van for 2 years, averaged $2.85 RPM for clients in this corridor. I know the brokers, the markets, and I'll keep your truck loaded..."
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 7,
                    border: '1.5px solid #e2e8f0', fontSize: 13, minHeight: 80,
                    outline: 'none', resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onApply(); setShowProposal(false) }}
                  className="btn btn-primary"
                  style={{ fontSize: 12 }}
                >
                  🚀 Submit Proposal
                </button>
                <button onClick={() => setShowProposal(false)} className="btn" style={{ fontSize: 12 }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Available Now Toggle ──────────────────────────────────────────────────────
function AvailableToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        background: on ? 'rgba(34,197,94,.1)' : '#f1f5f9', border: `1.5px solid ${on ? '#86efac' : '#e2e8f0'}`,
        borderRadius: 10, padding: '10px 16px', transition: 'all .2s', userSelect: 'none',
      }}
    >
      <div style={{
        width: 38, height: 22, borderRadius: 11,
        background: on ? '#22c55e' : '#cbd5e1', transition: 'background .2s',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 19 : 3,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: on ? '#15803d' : '#475569' }}>
          {on ? '🟢 Available Now' : '⚫ Not Available'}
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          {on ? 'Owner-ops can see and contact you' : 'Hidden from owner-op searches'}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DispatcherOpportunitiesPage() {
  const [tab, setTab] = useState<'feed' | 'applied'>('feed')
  const [available, setAvailable] = useState(true)
  const [filterEquip, setFilterEquip] = useState('All')
  const [filterMin, setFilterMin] = useState(0)
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [applications, setApplications] = useState<MyApplication[]>(MY_APPLICATIONS)
  const [toast, setToast] = useState<string | null>(null)
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    if (!available) return
    const t = setInterval(() => setPulseKey(k => k + 1), 4000)
    return () => clearInterval(t)
  }, [available])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleApply = (job: OOJobPosting) => {
    setAppliedIds(prev => [...prev, job.id])
    setApplications(prev => [{
      id: `app_${job.id}`,
      ownerName: job.ownerName,
      avatar: job.avatar,
      equipment: job.equipment,
      lanes: job.lanes,
      matchPct: job.matchPct,
      submittedAt: 'Just now',
      status: 'pending',
      proposedRate: '',
    }, ...prev])
    showToast(`✅ Proposal sent to ${job.ownerName}!`)
  }

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: '#eff6ff', color: '#1d4ed8', label: '⏳ Pending' },
    viewed: { bg: '#fefce8', color: '#92400e', label: '👁 Viewed' },
    interested: { bg: '#f0fdf4', color: '#15803d', label: '⭐ Interested!' },
    hired: { bg: '#f0fdf4', color: '#15803d', label: '🎉 Hired!' },
    declined: { bg: '#fef2f2', color: '#991b1b', label: '✗ Declined' },
  }

  const filtered = POSTINGS.filter(j => {
    const matchEquip = filterEquip === 'All' || j.equipment === filterEquip
    const matchMin = j.matchPct >= filterMin
    const notApplied = true
    return matchEquip && matchMin && notApplied
  }).sort((a, b) => b.matchPct - a.matchPct)

  const newProposals = applications.filter(a => a.status === 'pending').length

  return (
    <div style={{ padding: '24px 28px', maxWidth: 820, margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, background: '#1e293b', color: '#fff',
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,.3)',
        }}>{toast}</div>
      )}

      {/* Header with Available Now */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🚛 Owner-Op Opportunities</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            AI-matched job feed — sorted by your lane & equipment compatibility
          </div>
        </div>
        <AvailableToggle on={available} onChange={v => {
          setAvailable(v)
          showToast(v ? '🟢 You are now visible to owner-ops' : '⚫ You are hidden from searches')
        }} />
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20,
      }}>
        {[
          { label: 'New Postings', value: filtered.filter(j => j.postedAt.includes('hour')).length, icon: '🆕', color: '#1d4ed8' },
          { label: 'Best Match', value: `${filtered[0]?.matchPct ?? 0}%`, icon: '🎯', color: '#22c55e' },
          { label: 'My Proposals', value: applications.length, icon: '📤', color: '#8b5cf6' },
          { label: 'Urgent Openings', value: filtered.filter(j => j.status === 'urgent').length, icon: '🔥', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.icon} {s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
        {[
          { key: 'feed', label: `📋 Job Feed (${filtered.length})` },
          { key: 'applied', label: `📨 My Proposals`, badge: newProposals },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none', color: tab === t.key ? '#1d4ed8' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #1d4ed8' : '2px solid transparent',
              marginBottom: -2, position: 'relative',
            }}
          >
            {t.label}
            {t.badge ? (
              <span style={{
                marginLeft: 6, background: '#ef4444', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
              }}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* FEED TAB */}
      {tab === 'feed' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filterEquip}
              onChange={e => setFilterEquip(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }}
            >
              {['All', 'Dry Van', 'Flatbed', 'Reefer', 'Hotshot'].map(v => <option key={v}>{v}</option>)}
            </select>
            <select
              value={filterMin}
              onChange={e => setFilterMin(Number(e.target.value))}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }}
            >
              <option value={0}>All match %</option>
              <option value={80}>80%+ match</option>
              <option value={90}>90%+ match</option>
            </select>
            <div style={{
              fontSize: 12, color: '#22c55e', fontWeight: 600,
              background: 'rgba(34,197,94,.08)', padding: '6px 12px', borderRadius: 6,
            }}>
              🤖 AI-ranked by your profile: TX→FL · Dry Van · 98% Success Score
            </div>
          </div>

          {!available && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 10,
              padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#991b1b', fontWeight: 600,
            }}>
              ⚫ You are currently hidden — owner-ops cannot find you. Turn on "Available Now" to appear in searches.
            </div>
          )}

          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={{ ...job, applicants: job.applicants + (appliedIds.includes(job.id) ? 1 : 0) }}
              onApply={() => handleApply(job)}
            />
          ))}
        </>
      )}

      {/* APPLIED TAB */}
      {tab === 'applied' && (
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Your proposal history · {applications.length} total
          </div>
          {applications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
              No proposals sent yet. Browse the job feed and apply!
            </div>
          ) : (
            applications.map(app => {
              const s = STATUS_STYLE[app.status]
              return (
                <div key={app.id} style={{
                  background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12,
                  padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center',
                }}>
                  <div style={{ fontSize: 28 }}>{app.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{app.ownerName}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20,
                        background: s.bg, color: s.color, fontWeight: 700,
                      }}>{s.label}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>· {app.submittedAt}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, color: '#475569' }}>{app.equipment}</span>
                      {app.lanes.map(l => <span key={l} style={{ fontSize: 11, padding: '2px 6px', background: '#eff6ff', borderRadius: 4, color: '#1d4ed8' }}>📍 {l}</span>)}
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{app.matchPct}% match</span>
                    </div>
                  </div>
                  {app.status === 'interested' && (
                    <button className="btn btn-primary" style={{ fontSize: 12 }}>🎉 Accept</button>
                  )}
                  {app.status === 'pending' && (
                    <button className="btn" style={{ fontSize: 12, color: '#ef4444' }}>Withdraw</button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
