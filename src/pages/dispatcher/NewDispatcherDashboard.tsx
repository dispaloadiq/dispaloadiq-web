// ── New Dispatcher Onboarding Dashboard ──────────────────────────────────────
// Shown to a dispatcher with 0 clients. Every element pushes toward first client.

const C = {
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  green:  '#22C55E',
  blue:   '#4BAED4',
  orange: '#F97316',
  yellow: '#EAB308',
  red:    '#EF4444',
  dark:   '#0D1B2A',
  slate:  '#1A2535',
}

// ── Owner-op mock data ────────────────────────────────────────────────────────
interface OwnerOp {
  id: string
  name: string
  initials: string
  location: string
  trucks: string
  lanes: string
  cities: string
  offering: string
  postedAgo: string
  applications: number
  badge?: 'match' | 'hot'
}

const OWNER_OPS: OwnerOp[] = [
  {
    id: 'oo1',
    name: 'Marcus Johnson',
    initials: 'MJ',
    location: 'Chicago, IL',
    trucks: '2x Dry Van · 53ft · IL plates',
    lanes: 'Midwest → South',
    cities: 'CHI, STL, MEM, DAL',
    offering: '$2.30/mi guaranteed · 8% commission · weekly pay',
    postedAgo: '2h ago',
    applications: 4,
  },
  {
    id: 'oo2',
    name: 'Elena Vasquez',
    initials: 'EV',
    location: 'Miami, FL',
    trucks: '1x Reefer · 48ft · FL plates',
    lanes: 'Southeast → Northeast',
    cities: 'MIA, JAX, ATL, NYC',
    offering: '$2.45/mi guaranteed · 7% commission · bi-weekly pay',
    postedAgo: '8h ago',
    applications: 1,
    badge: 'match',
  },
  {
    id: 'oo3',
    name: 'David Kim',
    initials: 'DK',
    location: 'Atlanta, GA',
    trucks: '1x Dry Van · 53ft · GA plates',
    lanes: 'SE → Midwest',
    cities: 'ATL, BHM, STL, IND',
    offering: '$2.25/mi guaranteed · 8% commission · weekly pay',
    postedAgo: '1d ago',
    applications: 2,
  },
  {
    id: 'oo4',
    name: 'Robert Torres',
    initials: 'RT',
    location: 'Houston, TX',
    trucks: '2x Flatbed · 48ft · TX plates',
    lanes: 'TX → Southwest',
    cities: 'HOU, DAL, PHX, LAS',
    offering: '$2.35/mi guaranteed · 8% commission · weekly pay',
    postedAgo: '3h ago',
    applications: 0,
    badge: 'hot',
  },
  {
    id: 'oo5',
    name: 'Linda Chen',
    initials: 'LC',
    location: 'Los Angeles, CA',
    trucks: '1x Reefer · 53ft · CA plates',
    lanes: 'West Coast',
    cities: 'LAX, SFO, SEA, PDX',
    offering: '$2.50/mi guaranteed · 7% commission · bi-weekly pay',
    postedAgo: '5h ago',
    applications: 1,
  },
  {
    id: 'oo6',
    name: 'James Wright',
    initials: 'JW',
    location: 'Dallas, TX',
    trucks: '3x Dry Van · 53ft · TX plates',
    lanes: 'National',
    cities: 'DAL, CHI, NYC, LAX, ATL',
    offering: '$2.20/mi guaranteed · 8% commission · weekly pay',
    postedAgo: '2d ago',
    applications: 6,
  },
]

const PROFILE_ITEMS = [
  { label: 'Basic info (name, phone, email)',       done: true  },
  { label: 'Experience (years, specialization)',    done: true  },
  { label: 'Preferred lanes (e.g. Midwest, Southeast)', done: true },
  { label: 'Equipment types (Dry Van, Reefer, Flatbed)', done: true },
  { label: 'Rate guarantee you offer (RPM min)',    done: false },
  { label: 'References (at least 1)',               done: false },
  { label: 'Profile photo',                         done: false },
  { label: 'MC authority verification',             done: false },
]

const COMPLETION = Math.round(
  (PROFILE_ITEMS.filter(i => i.done).length / PROFILE_ITEMS.length) * 100
)

const TESTIMONIALS = [
  { quote: 'Landed 2 clients in my first week', author: 'Sofia K.', detail: 'Dispatcher since Jan 2025' },
  { quote: 'Platform showed me owner-ops I couldn\'t find anywhere else', author: 'Mike D.', detail: 'Dispatcher since Mar 2025' },
  { quote: 'My profile got 12 views in the first day', author: 'Anna R.', detail: 'Dispatcher since Feb 2025' },
]

// ── OwnerOpCard ───────────────────────────────────────────────────────────────
function OwnerOpCard({ op, onProposal }: { op: OwnerOp; onProposal: (id: string) => void }) {
  const badgeStyle = op.badge === 'match'
    ? { background: '#EDE9FE', color: C.purple, border: `1px solid ${C.purple}40` }
    : { background: '#FFF7ED', color: C.orange, border: `1px solid ${C.orange}40` }

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${op.badge === 'match' ? C.purple + '50' : op.badge === 'hot' ? C.orange + '50' : '#E2E8F0'}`,
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      position: 'relative',
      boxShadow: op.badge ? `0 2px 12px ${op.badge === 'match' ? C.purple + '15' : C.orange + '15'}` : '0 1px 4px rgba(0,0,0,.06)',
    }}>
      {/* Badge */}
      {op.badge && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
          ...badgeStyle,
        }}>
          {op.badge === 'match' ? '⭐ Best Match' : '🔥 Hot — 0 apps'}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingRight: op.badge ? 90 : 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.blue}30, ${C.purple}30)`,
          border: `1.5px solid ${C.blue}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: C.slate,
        }}>
          {op.initials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>{op.name}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>📍 {op.location}</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, color: '#4A5568' }}>
          <span style={{ fontWeight: 700 }}>Trucks:</span> {op.trucks}
        </div>
        <div style={{ fontSize: 11, color: '#4A5568' }}>
          <span style={{ fontWeight: 700 }}>Lanes:</span> {op.lanes} ({op.cities})
        </div>
        <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>
          💰 {op.offering}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0F4F8', paddingTop: 8 }}>
        <div style={{ fontSize: 10, color: '#A0AEC0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Posted {op.postedAgo} · {op.applications} application{op.applications !== 1 ? 's' : ''}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: C.green, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
            Actively hiring
          </span>
        </div>
        <button
          onClick={() => onProposal(op.id)}
          style={{
            padding: '6px 14px', borderRadius: 7, border: 'none',
            background: op.badge === 'match' ? C.purple : C.blue,
            color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Send Proposal
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewDispatcherDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {

  const filledCount = PROFILE_ITEMS.filter(i => i.done).length

  const handleProposal = (_id: string) => {
    onNavigate('marketplace')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── ZONE 1: Welcome Hero ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #4BAED4 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,.07)',
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -60,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,.05)',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
            🧭 Welcome to DispaLoadIQ, Alex!
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', marginBottom: 20 }}>
            Your first client is 3 steps away. Let's get you earning.
          </div>

          {/* 3-step funnel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, maxWidth: 600 }}>
            {/* Step 1 */}
            <div style={{
              background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '10px 16px',
              border: '1.5px solid rgba(255,255,255,.3)', flex: 1,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700, marginBottom: 3 }}>STEP 1</div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>Profile {COMPLETION}%</div>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                {PROFILE_ITEMS.map((item, i) => (
                  <div key={i} style={{
                    flex: 1, height: 5, borderRadius: 3,
                    background: item.done ? '#fff' : 'rgba(255,255,255,.25)',
                  }} />
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,.5)', margin: '0 8px', flexShrink: 0 }}>→</div>

            {/* Step 2 */}
            <div style={{
              background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 16px',
              border: '1.5px solid rgba(255,255,255,.2)', flex: 1,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700, marginBottom: 3 }}>STEP 2</div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>Get Listed</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>47 owner-ops waiting</div>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,.5)', margin: '0 8px', flexShrink: 0 }}>→</div>

            {/* Step 3 */}
            <div style={{
              background: 'rgba(34,197,94,.2)', borderRadius: 10, padding: '10px 16px',
              border: '1.5px solid rgba(34,197,94,.4)', flex: 1,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', fontWeight: 700, marginBottom: 3 }}>STEP 3</div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>First Client 🎯</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Start earning</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ZONE 2: Two-column layout ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 18, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1 Card — Complete Profile */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: `2px solid ${C.purple}50`,
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${C.purple}15`,
          }}>
            {/* Progress bar header */}
            <div style={{
              background: `linear-gradient(135deg, ${C.purple}15, ${C.purple}08)`,
              padding: '14px 18px',
              borderBottom: `1px solid ${C.purple}20`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>
                  ① Complete Your Profile
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.purple }}>{COMPLETION}%</div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 8, background: '#E9D5FF', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${COMPLETION}%`, height: '100%',
                  background: `linear-gradient(90deg, ${C.purple}, ${C.purpleLight})`,
                  borderRadius: 4, transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Checklist */}
            <div style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                {PROFILE_ITEMS.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    opacity: item.done ? 1 : 0.75,
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      background: item.done ? C.green : '#fff',
                      border: `2px solid ${item.done ? C.green : '#CBD5E0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.done && <span style={{ fontSize: 10, color: '#fff', fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, color: item.done ? '#4A5568' : '#1A2535', fontWeight: item.done ? 400 : 600 }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                background: '#F5F3FF', borderRadius: 8, padding: '10px 12px',
                marginBottom: 12, fontSize: 11, color: '#5B21B6', lineHeight: 1.5,
              }}>
                Your profile is <strong>{COMPLETION}% complete</strong>. Dispatchers with 100% profiles get{' '}
                <strong>4x more responses</strong> from owner-ops.
              </div>

              <button
                onClick={() => onNavigate('dispatcher-profile')}
                style={{
                  width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                  background: C.purple, color: '#fff',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Complete Profile → ({PROFILE_ITEMS.length - filledCount} items left)
              </button>
            </div>
          </div>

          {/* Step 3 Card — Proposal tips */}
          <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1.5px solid #E2E8F0',
            padding: '16px 18px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535', marginBottom: 12 }}>
              ③ Your Proposal is Your Resume
            </div>
            <div style={{
              background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 8 }}>
                💡 What Gets Responses:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  'Mention their specific lanes: "I specialize in Midwest→South routes"',
                  'Show your best result: "My last client averaged $2.51/mi over 8 months"',
                  'Be specific about availability: "Available to start immediately"',
                  'Keep it under 150 words',
                ].map((tip, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#78350F', display: 'flex', gap: 7, lineHeight: 1.45 }}>
                    <span style={{ color: '#D97706', fontWeight: 800, flexShrink: 0 }}>•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Success stories */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '16px 18px' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', marginBottom: 12, letterSpacing: 0.3 }}>
              ⭐ DISPATCHER SUCCESS STORIES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{
                  background: '#F7FAFC', borderRadius: 10, padding: '10px 12px',
                  borderLeft: `3px solid ${C.purple}`,
                }}>
                  <div style={{ fontSize: 12, color: '#2D3748', lineHeight: 1.45, marginBottom: 4, fontStyle: 'italic' }}>
                    "{t.quote}"
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#718096' }}>
                    — {t.author}, <span style={{ fontWeight: 400 }}>{t.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Owner-Ops ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 2 header */}
          <div style={{
            background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0',
            padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>
                ② Owner-Ops Looking for a Dispatcher RIGHT NOW
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                background: '#F0FDF4', color: C.green, border: `1px solid ${C.green}40`,
              }}>
                47 available
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#718096' }}>
              These owner-operators are actively seeking a dispatcher. Send a proposal to get started.
            </div>
          </div>

          {/* Owner-op grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {OWNER_OPS.map(op => (
              <OwnerOpCard key={op.id} op={op} onProposal={handleProposal} />
            ))}
          </div>

          {/* View all link */}
          <button
            onClick={() => onNavigate('marketplace')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px', borderRadius: 10,
              background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
              color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: `0 4px 14px ${C.purple}30`,
            }}
          >
            View All 47 Owner-Ops → Browse Full Marketplace
          </button>

        </div>
      </div>
    </div>
  )
}
