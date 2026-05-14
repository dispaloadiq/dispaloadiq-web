import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface DispatcherCard {
  id: string
  name: string
  avatar: string
  title: string
  matchPct: number
  rating: number
  reviews: number
  successScore: number
  hourlyRate: number
  trucksPer: string
  specialization: string[]
  lanes: string[]
  experience: string
  badge: 'Top Rated' | 'Rising Talent' | 'Verified' | null
  available: boolean
  responseTime: string
  lastActive: string
  completedJobs: number
  bio: string
}

interface Proposal {
  id: string
  dispatcherName: string
  avatar: string
  rate: string
  matchPct: number
  rating: number
  coverNote: string
  submittedAt: string
  status: 'new' | 'viewed' | 'shortlisted' | 'hired' | 'declined'
}

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  'Top Rated': { bg: '#14532d', color: '#86efac' },
  'Rising Talent': { bg: '#4c1d95', color: '#ddd6fe' },
  'Verified': { bg: '#1e3a5f', color: '#93c5fd' },
}

const DISPATCHERS: DispatcherCard[] = [
  {
    id: 'd1',
    name: 'Maria Santos',
    avatar: '👩‍💼',
    title: 'Freight Dispatcher — Flatbed & Dry Van Expert',
    matchPct: 97,
    rating: 4.9,
    reviews: 84,
    successScore: 98,
    hourlyRate: 8,
    trucksPer: '$400–500/truck',
    specialization: ['Flatbed', 'Dry Van'],
    lanes: ['TX→FL', 'TX→CA', 'Midwest'],
    experience: '4 years',
    badge: 'Top Rated',
    available: true,
    responseTime: '< 1 hour',
    lastActive: 'Online now',
    completedJobs: 63,
    bio: 'Ex-operations manager at Swift. Specialize in flatbed and reefer. I know your lanes — TX↔FL is my bread and butter.',
  },
  {
    id: 'd2',
    name: 'Alex Petrov',
    avatar: '👨‍💼',
    title: 'Dispatcher — Reefer & Temperature Controlled',
    matchPct: 91,
    rating: 4.8,
    reviews: 47,
    successScore: 95,
    hourlyRate: 7,
    trucksPer: '$350–450/truck',
    specialization: ['Reefer', 'Dry Van'],
    lanes: ['SE US', 'Midwest', 'Northeast'],
    experience: '3 years',
    badge: 'Verified',
    available: true,
    responseTime: '< 2 hours',
    lastActive: '15 min ago',
    completedJobs: 41,
    bio: 'Reefer specialist, worked with Walmart and Sysco suppliers. Strong at detention management and keeping drivers moving.',
  },
  {
    id: 'd3',
    name: 'Dmitri Volkov',
    avatar: '🧑‍💼',
    title: 'New Dispatcher — OTR & Regional',
    matchPct: 78,
    rating: 0,
    reviews: 0,
    successScore: 0,
    hourlyRate: 5,
    trucksPer: '$250–350/truck',
    specialization: ['Dry Van', 'OTR'],
    lanes: ['Midwest', 'Southeast'],
    experience: '1 year',
    badge: 'Rising Talent',
    available: true,
    responseTime: '< 3 hours',
    lastActive: '2 hours ago',
    completedJobs: 4,
    bio: 'New to freelance but trained under a 50-truck operation. Hungry to prove myself — will work hard for your business.',
  },
  {
    id: 'd4',
    name: 'Sandra Kim',
    avatar: '👩‍💻',
    title: 'Senior Dispatcher — 5 Trucks Max, High Touch',
    matchPct: 85,
    rating: 5.0,
    reviews: 22,
    successScore: 100,
    hourlyRate: 10,
    trucksPer: '$500–600/truck',
    specialization: ['Flatbed', 'Oversize', 'Specialized'],
    lanes: ['Nationwide'],
    experience: '6 years',
    badge: 'Top Rated',
    available: false,
    responseTime: 'Same day',
    lastActive: '1 day ago',
    completedJobs: 19,
    bio: 'Premium service, max 5 trucks. If you want someone who will treat your truck like their own and get top rates — talk to me.',
  },
  {
    id: 'd5',
    name: 'James Walker',
    avatar: '👨‍💻',
    title: 'Dispatcher — Hotshot & Expedite',
    matchPct: 72,
    rating: 4.7,
    reviews: 31,
    successScore: 91,
    hourlyRate: 6,
    trucksPer: '$300–400/truck',
    specialization: ['Hotshot', 'Expedite', 'Dry Van'],
    lanes: ['TX', 'LA', 'OK', 'AR'],
    experience: '2 years',
    badge: 'Verified',
    available: true,
    responseTime: '< 2 hours',
    lastActive: '30 min ago',
    completedJobs: 28,
    bio: 'Hotshot expert in the Gulf region. Fast turnaround loads, oil field experience, know all the brokers in TX.',
  },
]

const PROPOSALS: Proposal[] = [
  {
    id: 'p1',
    dispatcherName: 'Maria Santos',
    avatar: '👩‍💼',
    rate: '$450/truck',
    matchPct: 97,
    rating: 4.9,
    coverNote: 'I specialize exactly in your TX→FL lane. In my last 3 months I averaged $2.85 RPM for this corridor. Happy to show you my rate history.',
    submittedAt: '2 hours ago',
    status: 'new',
  },
  {
    id: 'p2',
    dispatcherName: 'Alex Petrov',
    avatar: '👨‍💼',
    rate: '$400/truck',
    matchPct: 91,
    rating: 4.8,
    coverNote: 'I know the Southeast market well. Can start immediately and guarantee no idle days in your first week.',
    submittedAt: '4 hours ago',
    status: 'viewed',
  },
  {
    id: 'p3',
    dispatcherName: 'Dmitri Volkov',
    avatar: '🧑‍💼',
    rate: '$300/truck',
    matchPct: 78,
    rating: 0,
    coverNote: 'New to freelance but trained under a 50-truck operation. Will offer first month at reduced rate to prove my value.',
    submittedAt: '6 hours ago',
    status: 'new',
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#94a3b8'
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color,
      background: pct >= 90 ? 'rgba(34,197,94,.12)' : pct >= 75 ? 'rgba(245,158,11,.12)' : 'rgba(148,163,184,.12)',
      padding: '2px 7px', borderRadius: 20,
    }}>
      {pct}% match
    </span>
  )
}

function StarRating({ rating, reviews }: { rating: number; reviews: number }) {
  if (reviews === 0) return <span style={{ fontSize: 12, color: '#94a3b8' }}>No reviews yet</span>
  return (
    <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
      ★ <span style={{ fontWeight: 700 }}>{rating.toFixed(1)}</span>
      <span style={{ color: '#94a3b8' }}>({reviews} reviews)</span>
    </span>
  )
}

function DispatcherListCard({ d, onHire, onMessage }: { d: DispatcherCard; onHire: () => void; onMessage: () => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 18,
      marginBottom: 12, transition: 'box-shadow .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Avatar + available dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>{d.avatar}</div>
          {d.available && (
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 12, height: 12, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #fff',
            }} />
          )}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{d.name}</span>
            {d.badge && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                background: BADGE_STYLE[d.badge].bg, color: BADGE_STYLE[d.badge].color,
              }}>{d.badge}</span>
            )}
            <MatchBadge pct={d.matchPct} />
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{d.title}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <StarRating rating={d.rating} reviews={d.reviews} />
            {d.successScore > 0 && (
              <span style={{ fontSize: 12, color: '#475569' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>{d.successScore}%</span> Success Score
              </span>
            )}
            <span style={{ fontSize: 12, color: '#475569' }}>✅ {d.completedJobs} jobs</span>
            <span style={{ fontSize: 12, color: '#475569' }}>⏱ {d.responseTime}</span>
          </div>

          {/* Specialization tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {d.specialization.map(s => (
              <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }}>{s}</span>
            ))}
            {d.lanes.map(l => (
              <span key={l} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f0fdf4', color: '#15803d', fontWeight: 600 }}>📍 {l}</span>
            ))}
          </div>

          {/* Bio (collapsed) */}
          {expanded && (
            <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: 8, marginBottom: 10, lineHeight: 1.6 }}>
              "{d.bio}"
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onMessage} className="btn" style={{ fontSize: 12 }}>
                💬 Message
              </button>
              <button onClick={onHire} className="btn btn-primary" style={{ fontSize: 12 }}>
                🤝 Send Offer
              </button>
              <button onClick={() => setExpanded(!expanded)} className="btn" style={{ fontSize: 12 }}>
                {expanded ? '▲ Less' : '▼ More'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: d.available ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
              {d.available ? '🟢 Available Now' : '⚫ Unavailable'} · {d.lastActive}
            </div>
          </div>
        </div>

        {/* Rate */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{d.trucksPer}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>per truck/mo</div>
        </div>
      </div>
    </div>
  )
}

function ProposalCard({ p, onHire, onDecline }: { p: Proposal; onHire: () => void; onDecline: () => void }) {
  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    new: { bg: '#eff6ff', color: '#1d4ed8', label: '🆕 New' },
    viewed: { bg: '#f8fafc', color: '#475569', label: '👁 Viewed' },
    shortlisted: { bg: '#fef9c3', color: '#92400e', label: '⭐ Shortlisted' },
    hired: { bg: '#f0fdf4', color: '#15803d', label: '✅ Hired' },
    declined: { bg: '#fef2f2', color: '#991b1b', label: '✗ Declined' },
  }
  const s = STATUS_STYLE[p.status]
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
        }}>{p.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{p.dispatcherName}</span>
            <MatchBadge pct={p.matchPct} />
            {p.rating > 0 && <StarRating rating={p.rating} reviews={0} />}
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
            "{p.coverNote}"
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onHire} className="btn btn-primary" style={{ fontSize: 12 }}>✅ Accept & Hire</button>
              <button onClick={onDecline} className="btn" style={{ fontSize: 12, color: '#ef4444' }}>✗ Decline</button>
              <button className="btn" style={{ fontSize: 12 }}>💬 Message</button>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{p.rate} · {p.submittedAt}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Post a Job form ───────────────────────────────────────────────────────────
function PostJobForm({ onPost }: { onPost: () => void }) {
  const [form, setForm] = useState({
    trucks: '1', equipment: 'Dry Van', lanes: '', rpm: '', startDate: '', notes: '',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
    fontSize: 13, outline: 'none', color: '#1e293b', background: '#fff',
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' as const }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 24, maxWidth: 620 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>📋 Post Your Request</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
        Tell us about your truck — dispatchers matching your lanes will send proposals within hours.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Number of trucks</label>
          <select value={form.trucks} onChange={e => set('trucks', e.target.value)} style={inputStyle}>
            {['1','2','3','4','5+'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Equipment type</label>
          <select value={form.equipment} onChange={e => set('equipment', e.target.value)} style={inputStyle}>
            {['Dry Van','Flatbed','Reefer','Hotshot','Step Deck','Lowboy','Box Truck'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Primary lanes (e.g., TX → FL, Midwest, Nationwide)</label>
        <input
          value={form.lanes}
          onChange={e => set('lanes', e.target.value)}
          placeholder="e.g. TX→FL, TX→CA, Southeast"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Expected RPM (rate per mile)</label>
          <input
            value={form.rpm}
            onChange={e => set('rpm', e.target.value)}
            placeholder="e.g. $2.50–3.00"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Desired start date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Additional notes for dispatchers</label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="e.g. I run 48 states, prefer no NYC, need experienced flatbed dispatcher, ELD is KeepTruckin"
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
        />
      </div>

      <div style={{
        background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8,
        padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#1d4ed8', lineHeight: 1.5,
      }}>
        🚀 <strong>How it works:</strong> Your request goes live immediately. Matching dispatchers will submit proposals within 24h. You pick the best fit — no upfront cost.
      </div>

      <button onClick={onPost} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700 }}>
        🚀 Post Request — Get Proposals Free
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OwnerOpFindDispatcherPage() {
  const [tab, setTab] = useState<'browse' | 'post' | 'proposals' | 'active'>('post')
  const [search, setSearch] = useState('')
  const [filterEquip, setFilterEquip] = useState('All')
  const [filterAvail, setFilterAvail] = useState(false)
  const [hired, setHired] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>(PROPOSALS)
  const [postDone, setPostDone] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const TABS = [
    { key: 'post', label: '📋 Post a Request', badge: null },
    { key: 'proposals', label: '📨 Proposals', badge: proposals.filter(p => p.status === 'new').length || null },
    { key: 'browse', label: '🔍 Browse Dispatchers', badge: null },
    { key: 'active', label: '✅ My Dispatcher', badge: hired.length || null },
  ]

  const filtered = DISPATCHERS.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization.some(s => s.toLowerCase().includes(q)) || d.lanes.some(l => l.toLowerCase().includes(q))
    const matchEquip = filterEquip === 'All' || d.specialization.includes(filterEquip)
    const matchAvail = !filterAvail || d.available
    return matchSearch && matchEquip && matchAvail
  })

  return (
    <div style={{ padding: '24px 28px', maxWidth: 820, margin: '0 auto', position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, background: '#1e293b', color: '#fff',
          padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,.3)', animation: 'none',
        }}>{toast}</div>
      )}

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 24, color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Find Your Dispatcher</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>
            Post a request → get proposals → hire the best fit. Free to post, no hidden fees.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['47', 'Available Now'], ['4.8★', 'Avg Rating'], ['< 2h', 'Avg Response']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{val}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #e2e8f0', paddingBottom: 0 }}>
        {TABS.map(t => (
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

      {/* POST TAB */}
      {tab === 'post' && (
        postDone ? (
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14,
            padding: 32, textAlign: 'center', maxWidth: 500, margin: '0 auto',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d', marginBottom: 8 }}>Your request is live!</div>
            <div style={{ fontSize: 13, color: '#166534', marginBottom: 20 }}>
              Dispatchers matching your lanes are being notified. Expect proposals within 1–3 hours.
            </div>
            <button onClick={() => setTab('proposals')} className="btn btn-primary">
              📨 View Proposals
            </button>
          </div>
        ) : (
          <PostJobForm onPost={() => { setPostDone(true); showToast('✅ Request posted! Dispatchers are being notified.') }} />
        )
      )}

      {/* PROPOSALS TAB */}
      {tab === 'proposals' && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
            📨 Proposals for your request ({proposals.length})
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Dispatchers who responded to your TX→FL Dry Van request · Posted 6 hours ago
          </div>
          {proposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
              No proposals yet. Check back in a few hours.
            </div>
          ) : (
            proposals.map(p => (
              <ProposalCard
                key={p.id}
                p={p}
                onHire={() => {
                  setProposals(prev => prev.map(x => x.id === p.id ? { ...x, status: 'hired' } : x))
                  setHired(prev => [...prev, p.dispatcherName])
                  showToast(`🤝 ${p.dispatcherName} hired! Contract being prepared.`)
                  setTimeout(() => setTab('active'), 1200)
                }}
                onDecline={() => {
                  setProposals(prev => prev.map(x => x.id === p.id ? { ...x, status: 'declined' } : x))
                  showToast(`Proposal from ${p.dispatcherName} declined.`)
                }}
              />
            ))
          )}
        </div>
      )}

      {/* BROWSE TAB */}
      {tab === 'browse' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialization, lane..."
              style={{
                flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8,
                border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
              }}
            />
            <select
              value={filterEquip}
              onChange={e => setFilterEquip(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }}
            >
              {['All', 'Flatbed', 'Dry Van', 'Reefer', 'Hotshot', 'Oversize'].map(v => <option key={v}>{v}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterAvail} onChange={e => setFilterAvail(e.target.checked)} />
              Available Now only
            </label>
            <div style={{ fontSize: 12, color: '#64748b' }}>{filtered.length} dispatchers</div>
          </div>

          {/* Sort info */}
          <div style={{
            background: '#eff6ff', borderRadius: 8, padding: '8px 12px', marginBottom: 14,
            fontSize: 12, color: '#1d4ed8', fontWeight: 600,
          }}>
            🤖 Sorted by AI match score based on your truck profile: Dry Van · TX→FL
          </div>

          {filtered.map(d => (
            <DispatcherListCard
              key={d.id}
              d={d}
              onHire={() => {
                setHired(prev => [...prev, d.name])
                showToast(`🤝 Offer sent to ${d.name}!`)
              }}
              onMessage={() => showToast(`💬 Chat opened with ${d.name}`)}
            />
          ))}
        </div>
      )}

      {/* ACTIVE TAB */}
      {tab === 'active' && (
        <div>
          {hired.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 48, color: '#94a3b8', fontSize: 14,
              background: '#f8fafc', borderRadius: 12, border: '1.5px dashed #e2e8f0',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
              <div style={{ fontWeight: 700, color: '#475569', marginBottom: 8 }}>No active dispatcher yet</div>
              <div style={{ marginBottom: 16 }}>Post a request or browse to find your dispatcher</div>
              <button onClick={() => setTab('post')} className="btn btn-primary">Post a Request</button>
            </div>
          ) : (
            hired.map(name => {
              const d = DISPATCHERS.find(x => x.name === name) || DISPATCHERS[0]
              return (
                <div key={name} style={{
                  background: '#fff', border: '1.5px solid #86efac', borderRadius: 14, padding: 20,
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                    }}>{d.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>{d.name}</div>
                      <div style={{ fontSize: 13, color: '#475569' }}>{d.title}</div>
                      <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>✅ Active · Contract signed</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                      { label: 'Loads This Week', value: '4' },
                      { label: 'Avg RPM', value: '$2.84' },
                      { label: 'On-Time Rate', value: '100%' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" style={{ fontSize: 12 }}>💬 Message</button>
                    <button className="btn" style={{ fontSize: 12 }}>📊 Performance Report</button>
                    <button className="btn" style={{ fontSize: 12, color: '#f59e0b' }}>⭐ Leave Review</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
