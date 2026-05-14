// ── DispatcherMarketplace — updated with tabs for new-dispatcher UX ───────────
import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { useDispatcherSearch, type DispatcherSearchFilters } from '../../lib/hooks/useDispatcherProfiles'
import type { DispatcherProfileWithUser } from '../../lib/database.types'

// ─── Extended Dispatcher type ─────────────────────────────────────────────────
interface Review {
  author: string
  truckType: string
  duration: string
  rpm: number
  rating: number
  text: string
  date: string
  verified: boolean
}

interface DispatcherEx {
  id: string
  name: string
  avatar: string
  location: string
  rating: number
  reviewCount: number
  experience: number
  specializations: string[]
  regions: string[]
  languages: string[]
  pricing: { model: 'percent' | 'per_load' | 'flat'; value: number; label: string }
  avgRpm: number
  rpmGuarantee?: number
  activeClients: number
  loadsPerMonth: number
  loadsTotal: number
  responseTime: string
  responseScore: number   // 0-100, platform-measured
  onTimeRate: number      // platform-verified %
  completionRate: number  // % of accepted loads delivered
  availability: 'available' | 'limited' | 'busy'
  topPerformer: boolean
  trust: {
    dotVerified: boolean
    backgroundCheck: boolean
    referencesChecked: boolean
    platformVerified: boolean   // 50+ loads through DispaLoadIQ
  }
  bio: string
  trialAvailable: boolean
  trialDays: number
  minContractMonths: number
  reviews: Review[]
  performanceHistory: { month: string; rpm: number }[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const DISPATCHERS: DispatcherEx[] = [
  {
    id:'1', name:'Alex Petrov', avatar:'👨‍💼', location:'Chicago, IL',
    rating:4.98, reviewCount:312, experience:7,
    specializations:['OTR','Dry Van','Reefer'], regions:['Midwest','Northeast','Southeast'],
    languages:['English','Russian'],
    pricing:{ model:'percent', value:5, label:'5% of gross' },
    avgRpm:2.68, rpmGuarantee:2.45,
    activeClients:6, loadsPerMonth:48, loadsTotal:1840,
    responseTime:'< 5 min', responseScore:99, onTimeRate:97, completionRate:99,
    availability:'available', topPerformer:true,
    trust:{ dotVerified:true, backgroundCheck:true, referencesChecked:true, platformVerified:true },
    bio:'7 years in OTR dispatch. Former owner-operator — I know both sides. Consistent $2.60+ RPM across all lanes. I book loads 6 days a week, including nights when rates are better.',
    trialAvailable:true, trialDays:14, minContractMonths:1,
    performanceHistory:[
      {month:'Nov',rpm:2.61},{month:'Dec',rpm:2.58},{month:'Jan',rpm:2.64},
      {month:'Feb',rpm:2.69},{month:'Mar',rpm:2.71},{month:'Apr',rpm:2.68},
    ],
    reviews:[
      { author:'Sergiy K.', truckType:'Dry Van 53\'', duration:'14 months', rpm:2.74, rating:5, text:'Alex найшов мені в неділю вранці вантаж за $3,400 коли всі інші диспетчери мовчали. За 14 місяців жодного тижня нижче $2,600 RPM.', date:'Apr 2025', verified:true },
      { author:'Mike R.', truckType:'Reefer 53\'', duration:'8 months', rpm:2.71, rating:5, text:'Responds at any hour. Found me a $3,200 load on Sunday. Best dispatcher I\'ve had in 9 years of trucking.', date:'Mar 2025', verified:true },
      { author:'Tom B.', truckType:'Dry Van 53\'', duration:'3 months', rpm:2.52, rating:4, text:'Great rates overall. Sometimes slow during peak hours but never left me without a load.', date:'Jan 2025', verified:true },
    ],
  },
  {
    id:'2', name:'Maria Santos', avatar:'👩‍💼', location:'Miami, FL',
    rating:4.92, reviewCount:187, experience:5,
    specializations:['Flatbed','Heavy Haul','OTR'], regions:['Southeast','Southwest','Northeast'],
    languages:['English','Spanish','Portuguese'],
    pricing:{ model:'percent', value:6, label:'6% of gross' },
    avgRpm:2.54, rpmGuarantee:2.30,
    activeClients:4, loadsPerMonth:32, loadsTotal:960,
    responseTime:'< 15 min', responseScore:94, onTimeRate:95, completionRate:98,
    availability:'available', topPerformer:false,
    trust:{ dotVerified:true, backgroundCheck:true, referencesChecked:true, platformVerified:true },
    bio:'Flatbed & heavy haul specialist with strong broker relationships in FL/TX/GA. Bilingual dispatcher — I work FL and SE corridors better than anyone. OSHA certified for oversized loads.',
    trialAvailable:true, trialDays:7, minContractMonths:1,
    performanceHistory:[
      {month:'Nov',rpm:2.44},{month:'Dec',rpm:2.48},{month:'Jan',rpm:2.51},
      {month:'Feb',rpm:2.55},{month:'Mar',rpm:2.58},{month:'Apr',rpm:2.54},
    ],
    reviews:[
      { author:'Carlos M.', truckType:'Flatbed 48\'', duration:'11 months', rpm:2.58, rating:5, text:'Ella habla español y conoce el mercado de Florida perfectamente. $2.58 RPM promedio en 11 meses.', date:'Apr 2025', verified:true },
      { author:'João P.', truckType:'Flatbed 53\'', duration:'6 months', rpm:2.51, rating:5, text:'Portuguese speaking dispatcher in this industry is rare. She delivers consistently.', date:'Feb 2025', verified:true },
    ],
  },
  {
    id:'3', name:'James Williams', avatar:'👨‍✈️', location:'Dallas, TX',
    rating:4.85, reviewCount:94, experience:3,
    specializations:['Dry Van','Reefer','Regional'], regions:['Southwest','South'],
    languages:['English'],
    pricing:{ model:'per_load', value:150, label:'$150 / load' },
    avgRpm:2.31,
    activeClients:3, loadsPerMonth:28, loadsTotal:336,
    responseTime:'< 30 min', responseScore:88, onTimeRate:93, completionRate:97,
    availability:'limited', topPerformer:false,
    trust:{ dotVerified:true, backgroundCheck:false, referencesChecked:true, platformVerified:true },
    bio:'TX/OK/LA/AR regional specialist. Flat $150 per booked load — no percentage surprises. Strong in TX-East Coast lanes. 3 years dedicated to owner-operators, zero dead weeks on record.',
    trialAvailable:true, trialDays:14, minContractMonths:1,
    performanceHistory:[
      {month:'Nov',rpm:2.21},{month:'Dec',rpm:2.24},{month:'Jan',rpm:2.28},
      {month:'Feb',rpm:2.31},{month:'Mar',rpm:2.35},{month:'Apr',rpm:2.31},
    ],
    reviews:[
      { author:'Bobby D.', truckType:'Dry Van 53\'', duration:'5 months', rpm:2.34, rating:5, text:'Flat rate is genius. I know exactly my costs. James never missed a week without a full load.', date:'Mar 2025', verified:true },
    ],
  },
  {
    id:'4', name:'Olena Kovalenko', avatar:'👩‍🔧', location:'Los Angeles, CA',
    rating:4.96, reviewCount:241, experience:6,
    specializations:['Reefer','Produce','OTR','West Coast'], regions:['West','Midwest','Southwest'],
    languages:['English','Ukrainian'],
    pricing:{ model:'percent', value:5, label:'5% of gross' },
    avgRpm:2.72, rpmGuarantee:2.50,
    activeClients:5, loadsPerMonth:40, loadsTotal:1440,
    responseTime:'< 10 min', responseScore:97, onTimeRate:98, completionRate:99,
    availability:'available', topPerformer:true,
    trust:{ dotVerified:true, backgroundCheck:true, referencesChecked:true, platformVerified:true },
    bio:'West Coast reefer & produce expert. 6 years temperature-sensitive freight. Top-rated across all platforms. I specialize in CA↔Midwest lanes that most dispatchers avoid. Speaks Ukrainian.',
    trialAvailable:true, trialDays:14, minContractMonths:1,
    performanceHistory:[
      {month:'Nov',rpm:2.65},{month:'Dec',rpm:2.68},{month:'Jan',rpm:2.70},
      {month:'Feb',rpm:2.74},{month:'Mar',rpm:2.76},{month:'Apr',rpm:2.72},
    ],
    reviews:[
      { author:'Vasyl H.', truckType:'Reefer 53\'', duration:'18 months', rpm:2.78, rating:5, text:'Олена — найкращий диспетчер яких я знав. 18 місяців, $2.78 середній RPM. Говорить українською, завжди на зв\'язку.', date:'Apr 2025', verified:true },
      { author:'Ryan C.', truckType:'Reefer 53\'', duration:'9 months', rpm:2.71, rating:5, text:'She knows every produce lane in California. Never had a dead run west of Denver thanks to her backhauls.', date:'Feb 2025', verified:true },
    ],
  },
  {
    id:'5', name:'David Chen', avatar:'👨‍💻', location:'Atlanta, GA',
    rating:4.78, reviewCount:56, experience:2,
    specializations:['Dry Van','Partial','Regional'], regions:['Southeast'],
    languages:['English','Mandarin'],
    pricing:{ model:'flat', value:400, label:'$400 / week' },
    avgRpm:2.18,
    activeClients:2, loadsPerMonth:18, loadsTotal:144,
    responseTime:'< 1 hour', responseScore:81, onTimeRate:91, completionRate:95,
    availability:'available', topPerformer:false,
    trust:{ dotVerified:false, backgroundCheck:false, referencesChecked:false, platformVerified:false },
    bio:'Rising dispatcher focused on SE region. Flat $400/week — predictable costs. Great for newer owner-operators who want a dedicated dispatcher without percentage uncertainty.',
    trialAvailable:true, trialDays:7, minContractMonths:1,
    performanceHistory:[
      {month:'Nov',rpm:2.08},{month:'Dec',rpm:2.11},{month:'Jan',rpm:2.14},
      {month:'Feb',rpm:2.18},{month:'Mar',rpm:2.20},{month:'Apr',rpm:2.18},
    ],
    reviews:[
      { author:'Kevin L.', truckType:'Dry Van 53\'', duration:'3 months', rpm:2.22, rating:4, text:'Good for starting out. Flat rate helped me budget. RPM improved over time.', date:'Apr 2025', verified:true },
    ],
  },
  {
    id:'6', name:'Sofia Marchetti', avatar:'👩‍💼', location:'New York, NY',
    rating:4.89, reviewCount:143, experience:4,
    specializations:['Hotshot','Dry Van','Northeast'], regions:['Northeast','Midwest'],
    languages:['English','Italian'],
    pricing:{ model:'percent', value:7, label:'7% of gross' },
    avgRpm:2.41,
    activeClients:3, loadsPerMonth:24, loadsTotal:576,
    responseTime:'< 20 min', responseScore:91, onTimeRate:94, completionRate:97,
    availability:'limited', topPerformer:false,
    trust:{ dotVerified:true, backgroundCheck:true, referencesChecked:false, platformVerified:true },
    bio:'Northeast hotshot & dry van specialist. Strong connections in NY/NJ/CT/MA. I focus on high-value freight that others miss. 4 years in the NYC metro market.',
    trialAvailable:false, trialDays:0, minContractMonths:2,
    performanceHistory:[
      {month:'Nov',rpm:2.32},{month:'Dec',rpm:2.35},{month:'Jan',rpm:2.38},
      {month:'Feb',rpm:2.41},{month:'Mar',rpm:2.45},{month:'Apr',rpm:2.41},
    ],
    reviews:[
      { author:'Tony M.', truckType:'Hotshot', duration:'7 months', rpm:2.47, rating:5, text:'Sofia knows the NYC market like nobody else. Hotshot loads others can\'t find.', date:'Mar 2025', verified:true },
    ],
  },
]

const SPECIALIZATIONS  = ['All','OTR','Dry Van','Reefer','Flatbed','Hotshot','Heavy Haul','Produce','Regional','Partial']
const REGIONS_LIST     = ['All Regions','Midwest','Northeast','Southeast','Southwest','South','West','West Coast']
const LANGUAGES_LIST   = ['All Languages','English','Russian','Spanish','Ukrainian','Portuguese','Mandarin','Italian']
const SORT_OPTIONS     = ['Best Match','Top Rated','Best RPM','Price ↑','Price ↓','Most Experienced','Most Reviews']

const TRUST_ICONS: Record<string,string> = {
  dotVerified:'🏛️', backgroundCheck:'🔎', referencesChecked:'✅', platformVerified:'🏆',
}
const TRUST_LABELS: Record<string,string> = {
  dotVerified:'DOT Verified', backgroundCheck:'Background Check', referencesChecked:'References Checked', platformVerified:'Platform Verified (50+ loads)',
}

// ─── Applications mock data ───────────────────────────────────────────────────
type AppStatus = 'pending' | 'interested' | 'declined'

interface MyApplication {
  id: string
  ownerOp: string
  trucks: string
  lane: string
  appliedAgo: string
  status: AppStatus
}

const MY_APPLICATIONS: MyApplication[] = [
  { id:'a1', ownerOp:'Marcus Johnson', trucks:'2x Dry Van',  lane:'Midwest→S',  appliedAgo:'2h ago',  status:'pending'    },
  { id:'a2', ownerOp:'Elena Vasquez',  trucks:'1x Reefer',   lane:'SE→NE',      appliedAgo:'1d ago',  status:'interested' },
  { id:'a3', ownerOp:'Robert Torres',  trucks:'2x Flatbed',  lane:'TX→SW',      appliedAgo:'3d ago',  status:'declined'   },
]

const STATUS_META: Record<AppStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',                   color: '#D97706', bg: '#FEF3C7' },
  interested: { label: 'Interested — replied',      color: '#059669', bg: '#D1FAE5' },
  declined:   { label: 'Declined',                  color: '#DC2626', bg: '#FEE2E2' },
}

// ─── My Listing preview card ──────────────────────────────────────────────────
function MyListingPanel() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12,
        padding: '12px 16px', fontSize: 13, color: '#166534',
      }}>
        You are listed on the marketplace. Here's how your profile appears to owner-ops browsing for a dispatcher.
      </div>

      {/* Profile preview card */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '2px solid #E2E8F0',
        overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D7A9A)', padding: '20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
              background: '#22C55E', color: '#fff',
            }}>🟢 Available Now</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
            }}>👨‍💼</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Alex Petrov</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>📍 Chicago, IL · 3 years experience</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FCD34D' }}>★ 4.8</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>· New on platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#F4F6F9', borderBottom: '1px solid #E2E8F0' }}>
          {[
            { v: '$2.40+', l: 'RPM Guarantee', color: '#22C55E' },
            { v: '< 15 min', l: 'Response Time', color: '#8B5CF6' },
            { v: 'Midwest / SE', l: 'Lanes', color: '#4BAED4' },
            { v: 'Dry Van · Reefer', l: 'Equipment', color: '#F97316' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', padding: '12px 6px', borderRight: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: s.color }}>{s.v}</div>
              <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Bio area */}
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: 13, color: '#718096', lineHeight: 1.65, margin: '0 0 14px' }}>
            Dispatcher specializing in Midwest and Southeast lanes. Strong broker relationships with TQL, Coyote, and Echo Global.
            Available 6 days a week including evenings. Guaranteed $2.40+/mi minimum RPM.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {['OTR', 'Dry Van', 'Reefer', 'Midwest', 'Southeast'].map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: '3px 10px', background: '#EBF8FF', color: '#2C5282', borderRadius: 99, fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Disabled CTA — preview only */}
          <div style={{ position: 'relative' }}>
            <button
              disabled
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: '#4BAED4', color: '#fff',
                fontSize: 13, fontWeight: 800, cursor: 'not-allowed', opacity: 0.6,
              }}
            >
              Contact Dispatcher →
            </button>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,.7)', borderRadius: 10,
              fontSize: 11, fontWeight: 700, color: '#4A5568',
            }}>
              👁 This is what owner-ops see — preview only
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── My Applications Tab ──────────────────────────────────────────────────────
function MyApplicationsPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 14, color: '#718096' }}>
        <strong style={{ color: '#1A2535' }}>{MY_APPLICATIONS.length} proposals</strong> sent. Owner-ops with "Interested" status have replied — respond quickly!
      </div>

      <div style={{
        background: '#fff', borderRadius: 12, border: '1.5px solid #E2E8F0',
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 2fr 1fr',
          gap: 0, background: '#F7FAFC', padding: '10px 18px',
          borderBottom: '1px solid #E2E8F0',
          fontSize: 10, fontWeight: 800, color: '#718096', letterSpacing: 0.5,
        }}>
          <div>OWNER-OP</div>
          <div>TRUCKS</div>
          <div>LANE</div>
          <div>APPLIED</div>
          <div>STATUS</div>
          <div>ACTION</div>
        </div>

        {/* Table rows */}
        {MY_APPLICATIONS.map((app, i) => {
          const meta = STATUS_META[app.status]
          return (
            <div
              key={app.id}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 2fr 1fr',
                gap: 0, padding: '14px 18px',
                borderBottom: i < MY_APPLICATIONS.length - 1 ? '1px solid #F0F4F8' : 'none',
                alignItems: 'center',
                background: app.status === 'interested' ? '#F0FDF4' : '#fff',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{app.ownerOp}</div>
              <div style={{ fontSize: 12, color: '#4A5568' }}>{app.trucks}</div>
              <div style={{ fontSize: 12, color: '#4A5568' }}>{app.lane}</div>
              <div style={{ fontSize: 11, color: '#A0AEC0' }}>{app.appliedAgo}</div>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                  background: meta.bg, color: meta.color,
                }}>
                  {app.status === 'pending' ? '🟡' : app.status === 'interested' ? '🟢' : '🔴'} {meta.label}
                </span>
              </div>
              <div>
                <button style={{
                  padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  background: app.status === 'interested' ? '#22C55E' : app.status === 'declined' ? '#F3F4F6' : '#4BAED4',
                  color: app.status === 'declined' ? '#9CA3AF' : '#fff',
                }}>
                  {app.status === 'interested' ? 'Reply' : app.status === 'declined' ? 'Archive' : 'View'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {MY_APPLICATIONS.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#A0AEC0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📨</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#4A5568' }}>No proposals sent yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Browse owner-ops and send your first proposal</div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
type MarketplaceTab = 'find' | 'listings' | 'applications'

// ── Helper: convert a real Supabase dispatcher profile to the local DispatcherEx shape ──
function realToDispatcherEx(d: DispatcherProfileWithUser): DispatcherEx {
  const name = d.user_profiles?.full_name ?? 'Dispatcher'
  const city = d.user_profiles?.city ?? ''
  const state = d.user_profiles?.state ?? ''
  const location = city && state ? `${city}, ${state}` : city || state || 'USA'

  const availMap: Record<string, DispatcherEx['availability']> = {
    available: 'available', limited: 'limited', busy: 'busy',
  }

  const pricingModel: DispatcherEx['pricing']['model'] =
    d.commission_rate > 0 ? 'percent' : 'flat'

  return {
    id:         d.user_id,
    name,
    avatar:     '👨‍💼',
    location,
    rating:     d.trust_score / 20,   // trust_score 0-100 → rating 0-5
    reviewCount: 0,
    experience: 0,
    specializations: d.specialties,
    regions:    d.active_states,
    languages:  d.languages,
    pricing: {
      model: pricingModel,
      value: d.commission_rate,
      label: d.commission_rate > 0 ? `${d.commission_rate}% of gross` : 'Custom pricing',
    },
    avgRpm:         d.avg_rpm,
    rpmGuarantee:   d.min_rpm > 0 ? d.min_rpm : undefined,
    activeClients:  d.current_clients,
    loadsPerMonth:  Math.round(d.total_loads / 12),
    loadsTotal:     d.total_loads,
    responseTime:   `< ${d.response_time_min} min`,
    responseScore:  Math.min(100, Math.round(100 - d.response_time_min / 2)),
    onTimeRate:     Math.round(d.on_time_rate),
    completionRate: Math.round(d.client_retention),
    availability:   availMap[d.availability] ?? 'available',
    topPerformer:   d.trust_score >= 90,
    trust: {
      dotVerified:       d.identity_verified,
      backgroundCheck:   d.verification_status === 'verified' || d.verification_status === 'certified',
      referencesChecked: d.certifications.length > 0,
      platformVerified:  d.total_loads >= 50,
    },
    bio:              d.bio ?? '',
    trialAvailable:   false,
    trialDays:        0,
    minContractMonths: 1,
    reviews:          [],
    performanceHistory: d.portfolio_loads.slice(-6).map((pl, i) => ({
      month: ['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'][i % 12],
      rpm:   pl.rpm,
    })),
  }
}

export default function DispatcherMarketplace() {
  const { profile } = useAuth()
  const [activeTab,    setActiveTab]    = useState<MarketplaceTab>('find')
  const [search,       setSearch]       = useState('')
  const [spec,         setSpec]         = useState('All')
  const [region,       setRegion]       = useState('All Regions')
  const [language,     setLanguage]     = useState('All Languages')
  const [sortBy,       setSortBy]       = useState('Best Match')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [trialOnly,    setTrialOnly]    = useState(false)
  const [maxFee,       setMaxFee]       = useState('')
  const [minRpm,       setMinRpm]       = useState('')
  const [avail,        setAvail]        = useState<'all'|'available'|'limited'>('all')
  const [selected,     setSelected]     = useState<DispatcherEx | null>(null)
  const [hireModal,    setHireModal]    = useState<DispatcherEx | null>(null)
  const [hired,        setHired]        = useState<string[]>([])
  const [comparing,    setComparing]    = useState<string[]>([])
  const [showCompare,  setShowCompare]  = useState(false)
  const [showMatch,    setShowMatch]    = useState(false)
  const [matchResult,  setMatchResult]  = useState<DispatcherEx | null>(null)
  const [matchStep,    setMatchStep]    = useState(0)
  const [showFilters,  setShowFilters]  = useState(false)
  const [mode,         setMode]         = useState<'browse'|'post'>('browse')

  // ── Build Supabase filters from local UI state ──────────────────────────────
  const supabaseFilters: DispatcherSearchFilters = {
    search:       search || undefined,
    specialties:  spec !== 'All' ? [spec] : undefined,
    states:       region !== 'All Regions' ? [region] : undefined,
    verifiedOnly: verifiedOnly || undefined,
    minRpm:       minRpm ? parseFloat(minRpm) : undefined,
    maxCommission: maxFee ? parseFloat(maxFee) : undefined,
    availability: avail !== 'all' ? avail : undefined,
    pageSize: 50,
  }

  const { data: supabaseResult, isLoading: supabaseLoading } =
    useDispatcherSearch(supabaseFilters)

  // ── Decide data source: real DB when rows present, else demo mock ──────────
  const realDispatchers: DispatcherEx[] =
    (supabaseResult?.items ?? []).length > 0
      ? (supabaseResult!.items.map(realToDispatcherEx))
      : []

  const sourceDispatchers: DispatcherEx[] =
    realDispatchers.length > 0 ? realDispatchers : DISPATCHERS

  // suppress unused profile warning — used for future role-gating
  void profile

  const filtered = sourceDispatchers
    .filter(d => {
      const q = search.toLowerCase()
      if (q && !d.name.toLowerCase().includes(q) && !d.location.toLowerCase().includes(q) && !d.specializations.some(s=>s.toLowerCase().includes(q))) return false
      if (spec !== 'All' && !d.specializations.includes(spec)) return false
      if (region !== 'All Regions' && !d.regions.includes(region)) return false
      if (language !== 'All Languages' && !d.languages.includes(language)) return false
      if (verifiedOnly && !d.trust.platformVerified) return false
      if (trialOnly && !d.trialAvailable) return false
      if (maxFee && d.pricing.value > parseFloat(maxFee)) return false
      if (minRpm && d.avgRpm < parseFloat(minRpm)) return false
      if (avail !== 'all' && d.availability !== avail) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'Best Match')       return (b.trust.platformVerified?1:0) - (a.trust.platformVerified?1:0) || b.rating - a.rating
      if (sortBy === 'Top Rated')        return b.rating - a.rating
      if (sortBy === 'Best RPM')         return b.avgRpm - a.avgRpm
      if (sortBy === 'Price ↑')          return a.pricing.value - b.pricing.value
      if (sortBy === 'Price ↓')          return b.pricing.value - a.pricing.value
      if (sortBy === 'Most Experienced') return b.experience - a.experience
      if (sortBy === 'Most Reviews')     return b.reviewCount - a.reviewCount
      return 0
    })

  function toggleCompare(id: string) {
    setComparing(prev =>
      prev.includes(id) ? prev.filter(i=>i!==id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const compareDispatchers = sourceDispatchers.filter(d => comparing.includes(d.id))

  // Simulated AI match
  function runMatch() {
    setMatchStep(1)
    setTimeout(() => setMatchStep(2), 800)
    setTimeout(() => { setMatchResult(DISPATCHERS[0]); setMatchStep(3) }, 1600)
  }

  // Pending apps count for badge
  const pendingApps = MY_APPLICATIONS.filter(a => a.status === 'pending' || a.status === 'interested').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, height:'calc(100vh - 64px - 48px)', overflow:'hidden' }}>

      {/* ── Top Tab Switcher ── */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 16, flexShrink: 0,
        background: '#fff', borderRadius: 12, border: '1.5px solid #E2E8F0',
        padding: 5,
      }}>
        {(([
          { id: 'find' as MarketplaceTab,         label: '🔍 Find Owner-Ops',           count: undefined as number | undefined },
          { id: 'listings' as MarketplaceTab,     label: '📣 My Listings',              count: undefined as number | undefined },
          { id: 'applications' as MarketplaceTab, label: '📨 My Applications',          count: pendingApps as number | undefined },
        ])).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none',
              cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              background: activeTab === tab.id ? '#1A2535' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#718096',
              transition: 'all .15s',
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99,
                background: activeTab === tab.id ? 'rgba(255,255,255,.25)' : '#EBF8FF',
                color: activeTab === tab.id ? '#fff' : '#2C5282',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── My Applications tab ── */}
      {activeTab === 'applications' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <MyApplicationsPanel />
        </div>
      )}

      {/* ── My Listings tab ── */}
      {activeTab === 'listings' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <MyListingPanel />
        </div>
      )}

      {/* ── Find Owner-Ops tab content (existing) ── */}
      {activeTab === 'find' && (<>

      {/* ── Mode switcher + hero ── */}
      <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', borderRadius:16, padding:'20px 24px', marginBottom:16, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:4 }}>
              🧭 Dispatcher Exchange
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>
              Platform-verified dispatchers · Real performance data · Protected contracts
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ display:'flex', gap:6 }}>
              <button className={`btn btn-sm ${mode==='browse'?'':'btn-ghost'}`}
                style={{ background:mode==='browse'?'#fff':undefined, color:mode==='browse'?'#1A2535':undefined }}
                onClick={()=>setMode('browse')}>
                🔍 Find a Dispatcher
              </button>
              <button className={`btn btn-sm ${mode==='post'?'':'btn-ghost'}`}
                style={{ background:mode==='post'?'#fff':undefined, color:mode==='post'?'#1A2535':'rgba(255,255,255,.8)' } as React.CSSProperties}
                onClick={()=>setMode('post')}>
                📝 Post a Request
              </button>
            </div>
            <button className="btn btn-sm" style={{ background:'#38C770', color:'#fff', border:'none', fontWeight:700 }}
              onClick={()=>setShowMatch(true)}>
              🤖 AI Match Me
            </button>
          </div>
        </div>

        {/* Trust stats */}
        <div style={{ display:'flex', gap:20, marginTop:16, flexWrap:'wrap' }}>
          {[
            { v:'200+', l:'Verified Dispatchers' },
            { v:'$2.51', l:'Avg Platform RPM' },
            { v:'97%',  l:'On-Time Delivery Rate' },
            { v:'14d',  l:'Avg Trial Available' },
          ].map(s => (
            <div key={s.l} style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ fontWeight:800, color:'#38C770', fontSize:15 }}>{s.v}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.55)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── POST A REQUEST mode ── */}
      {mode === 'post' && (
        <div style={{ overflowY:'auto', flex:1 }}>
          <PostRequestPanel onSwitch={()=>setMode('browse')} />
        </div>
      )}

      {/* ── BROWSE mode ── */}
      {mode === 'browse' && (
        <div style={{ display:'flex', gap:20, flex:1, minHeight:0, overflow:'hidden' }}>

          {/* Left: list */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12, overflow:'hidden' }}>

            {/* Search + filter bar */}
            <div className="card" style={{ padding:'12px 16px', flexShrink:0 }}>
              <div style={{ display:'flex', gap:10, marginBottom: showFilters ? 14 : 0 }}>
                <input className="input" style={{ flex:1 }} placeholder="🔍  Name, city, specialty..."
                  value={search} onChange={e=>setSearch(e.target.value)} />
                <select className="input select" style={{ width:170 }} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(s=><option key={s}>{s}</option>)}
                </select>
                <button className={`btn btn-sm ${showFilters?'btn-primary':'btn-ghost'}`}
                  onClick={()=>setShowFilters(!showFilters)}>
                  ⚙️ Filters {showFilters?'▲':'▼'}
                </button>
              </div>

              {showFilters && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Specialty</label>
                    <select className="input select" value={spec} onChange={e=>setSpec(e.target.value)}>
                      {SPECIALIZATIONS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Region</label>
                    <select className="input select" value={region} onChange={e=>setRegion(e.target.value)}>
                      {REGIONS_LIST.map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Language</label>
                    <select className="input select" value={language} onChange={e=>setLanguage(e.target.value)}>
                      {LANGUAGES_LIST.map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Min Avg RPM ($)</label>
                    <input className="input" type="number" placeholder="e.g. 2.40" step="0.01"
                      value={minRpm} onChange={e=>setMinRpm(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Max Fee (%/$)</label>
                    <input className="input" type="number" placeholder="e.g. 6"
                      value={maxFee} onChange={e=>setMaxFee(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Availability</label>
                    <select className="input select" value={avail}
                      onChange={e=>setAvail(e.target.value as 'all'|'available'|'limited')}>
                      <option value="all">All</option>
                      <option value="available">Available Now</option>
                      <option value="limited">Limited Spots</option>
                    </select>
                  </div>
                  <div style={{ gridColumn:'1/-1', display:'flex', gap:12, alignItems:'center', paddingTop:4 }}>
                    <label style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:13 }}>
                      <input type="checkbox" checked={verifiedOnly} onChange={e=>setVerifiedOnly(e.target.checked)} />
                      <span>🏆 Platform Verified only</span>
                    </label>
                    <label style={{ display:'flex', gap:8, alignItems:'center', cursor:'pointer', fontSize:13 }}>
                      <input type="checkbox" checked={trialOnly} onChange={e=>setTrialOnly(e.target.checked)} />
                      <span>🆓 Trial period available</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Compare bar */}
            {comparing.length > 0 && (
              <div style={{ background:'#EBF8FF', border:'1px solid #90CDF4', borderRadius:10, padding:'10px 14px', flexShrink:0, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#2C5282' }}>
                  Comparing {comparing.length}/3:
                </span>
                <div style={{ display:'flex', gap:8, flex:1 }}>
                  {comparing.map(id => {
                    const d = sourceDispatchers.find(d=>d.id===id)!
                    if (!d) return null
                    return (
                      <span key={id} style={{ background:'#BEE3F8', color:'#2A4365', padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600 }}>
                        {d.name.split(' ')[0]} ✕
                      </span>
                    )
                  })}
                </div>
                <button className="btn btn-primary btn-sm" onClick={()=>setShowCompare(true)}>
                  Compare Side-by-Side →
                </button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setComparing([])}>Clear</button>
              </div>
            )}

            {/* Results count + live indicator */}
            <div style={{ fontSize:13, color:'#718096', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>
                <strong>{filtered.length}</strong> dispatchers found
                {realDispatchers.length > 0 && (
                  <span style={{ marginLeft:8, fontSize:11, color:'#38C770', fontWeight:700 }}>● Live</span>
                )}
                {supabaseLoading && (
                  <span style={{ marginLeft:8, fontSize:11, color:'#A0AEC0' }}>⏳ Loading…</span>
                )}
              </span>
              {filtered.length > 0 && <span style={{ color:'#A0AEC0' }}>Click any card to view full profile</span>}
            </div>

            {/* Dispatcher cards */}
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
              {filtered.map(d => (
                <DispatcherCard
                  key={d.id}
                  d={d}
                  selected={selected?.id === d.id}
                  hired={hired.includes(d.id)}
                  comparing={comparing.includes(d.id)}
                  onSelect={()=>setSelected(selected?.id===d.id ? null : d)}
                  onHire={()=>setHireModal(d)}
                  onToggleCompare={()=>toggleCompare(d.id)}
                />
              ))}

              {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:60, color:'#A0AEC0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
                  <div style={{ fontWeight:600, fontSize:15, color:'#4A5568' }}>No dispatchers match your filters</div>
                  <div style={{ fontSize:13, marginTop:6 }}>Try adjusting your search criteria</div>
                </div>
              )}

              {/* Supply-side CTA */}
              <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', borderRadius:16, padding:'20px 24px', marginTop:4 }}>
                <div style={{ fontWeight:800, fontSize:15, color:'#fff', marginBottom:4 }}>Are you a dispatcher?</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginBottom:14 }}>
                  Join 200+ professionals earning on DispaLoadIQ. Build your verified profile and get matched with owner-ops.
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <button className="btn" style={{ background:'#38C770', color:'#fff', fontWeight:700, border:'none' }}>
                    Create Dispatcher Profile →
                  </button>
                  <button className="btn btn-ghost" style={{ color:'rgba(255,255,255,.7)', border:'1px solid rgba(255,255,255,.2)' }}>
                    See how it works
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: detail panel */}
          {selected && (
            <div style={{ width:400, flexShrink:0, overflowY:'auto' }}>
              <DispatcherDetail
                d={selected}
                hired={hired.includes(selected.id)}
                onHire={()=>setHireModal(selected)}
                onClose={()=>setSelected(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── End Find Owner-Ops tab ── */}
      </>)}

      {/* ── Hire / Contract Modal ── */}
      {hireModal && (
        <HireModal
          d={hireModal}
          onClose={()=>setHireModal(null)}
          onConfirm={()=>{ setHired(h=>[...h, hireModal.id]); setHireModal(null) }}
        />
      )}

      {/* ── Compare Modal ── */}
      {showCompare && comparing.length >= 2 && (
        <div className="modal-overlay" onClick={()=>setShowCompare(false)}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px', maxWidth:900, width:'95%', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>Compare Dispatchers</h2>
              <button className="modal-close" onClick={()=>setShowCompare(false)}>✕</button>
            </div>
            <ComparePanel dispatchers={compareDispatchers} onHire={(d)=>{ setShowCompare(false); setHireModal(d) }} hired={hired} />
          </div>
        </div>
      )}

      {/* ── AI Match Modal ── */}
      {showMatch && (
        <AIMatchModal
          step={matchStep}
          result={matchResult}
          onRun={runMatch}
          onClose={()=>{ setShowMatch(false); setMatchStep(0); setMatchResult(null) }}
          onHire={(d)=>{ setShowMatch(false); setHireModal(d) }}
          onView={(d)=>{ setShowMatch(false); setSelected(d) }}
        />
      )}
    </div>
  )
}

// ─── Dispatcher Card ──────────────────────────────────────────────────────────
function DispatcherCard({ d, selected, hired, comparing, onSelect, onHire, onToggleCompare }:
  { d:DispatcherEx; selected:boolean; hired:boolean; comparing:boolean; onSelect:()=>void; onHire:()=>void; onToggleCompare:()=>void }) {

  const availColor = d.availability==='available'?'#38C770':d.availability==='limited'?'#D97706':'#E53E3E'
  const trustCount = Object.values(d.trust).filter(Boolean).length

  return (
    <div className="card" style={{
      cursor:'pointer', padding:'16px',
      boxShadow: selected ? '0 0 0 2px #4BAED4, 0 4px 20px rgba(75,174,212,.15)' : undefined,
      borderLeft: `4px solid ${d.topPerformer ? '#F59E0B' : '#E2E8F0'}`,
    }} onClick={onSelect}>

      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        {/* Avatar + verify badge */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{ width:60, height:60, background:'#E8F4FD', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:38 }}>
            {d.avatar}
          </div>
          {d.trust.platformVerified && (
            <div title="Platform Verified" style={{
              position:'absolute', bottom:-4, right:-4,
              background:'#38C770', borderRadius:'50%', width:20, height:20,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, color:'#fff', fontWeight:800, border:'2px solid #fff',
            }}>✓</div>
          )}
        </div>

        {/* Main info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:2 }}>
            <span style={{ fontWeight:800, fontSize:15, color:'#1A2535' }}>{d.name}</span>
            {d.topPerformer && <span className="badge" style={{ background:'#FEF3C7', color:'#D97706' }}>⭐ TOP</span>}
            {d.trialAvailable && <span className="badge" style={{ background:'#F0FFF4', color:'#276749' }}>🆓 Trial</span>}
            <span style={{ padding:'2px 8px', borderRadius:99, fontSize:11, fontWeight:600,
              background:availColor+'20', color:availColor }}>
              ● {d.availability === 'available' ? 'Available' : d.availability === 'limited' ? 'Limited Spots' : 'Busy'}
            </span>
          </div>

          <div style={{ fontSize:12, color:'#718096', marginBottom:6 }}>
            📍 {d.location} · {d.experience}yr exp · {d.loadsTotal.toLocaleString()} loads completed
          </div>

          {/* Key metrics */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:8 }}>
            <div>
              <span style={{ fontWeight:800, fontSize:14, color:'#38C770' }}>${d.avgRpm.toFixed(2)}</span>
              <span style={{ fontSize:11, color:'#A0AEC0' }}>/mi avg RPM</span>
            </div>
            {d.rpmGuarantee && (
              <div>
                <span style={{ fontWeight:700, fontSize:13, color:'#4BAED4' }}>${d.rpmGuarantee.toFixed(2)}+</span>
                <span style={{ fontSize:11, color:'#A0AEC0' }}> guaranteed</span>
              </div>
            )}
            <div>
              <span style={{ fontWeight:700, color:'#F59E0B' }}>★ {d.rating.toFixed(2)}</span>
              <span style={{ fontSize:11, color:'#A0AEC0' }}> ({d.reviewCount})</span>
            </div>
            <div>
              <span style={{ fontWeight:700, color:'#4BAED4' }}>{d.pricing.label}</span>
            </div>
            <div>
              <span style={{ fontWeight:700, color:'#718096', fontSize:12 }}>⚡ {d.responseTime}</span>
            </div>
          </div>

          {/* Trust bar */}
          <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
            {Object.entries(d.trust).map(([key, val]) => val ? (
              <span key={key} title={TRUST_LABELS[key]} style={{
                fontSize:11, padding:'2px 8px', borderRadius:99, cursor:'default',
                background:'#F0FFF4', color:'#276749', fontWeight:600,
              }}>
                {TRUST_ICONS[key]} {TRUST_LABELS[key]}
              </span>
            ) : null)}
            {trustCount === 0 && (
              <span style={{ fontSize:11, color:'#A0AEC0', fontStyle:'italic' }}>Not yet verified</span>
            )}
          </div>
        </div>

        {/* Right: response + clients */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'#A0AEC0' }}>On-time</div>
            <div style={{ fontWeight:700, color: d.onTimeRate>=95?'#38C770':d.onTimeRate>=85?'#F59E0B':'#E53E3E' }}>{d.onTimeRate}%</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'#A0AEC0' }}>Clients</div>
            <div style={{ fontWeight:700 }}>{d.activeClients} active</div>
          </div>
        </div>
      </div>

      {/* Specs tags */}
      <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap' }}>
        {d.specializations.map(s=>(
          <span key={s} className="chip" style={{ fontSize:11, padding:'2px 8px', height:'auto' }}>{s}</span>
        ))}
        {d.languages.map(l=>(
          <span key={l} className="chip" style={{ fontSize:11, padding:'2px 8px', height:'auto', background:'#F0FDF4', borderColor:'#86EFAC' }}>
            🌐 {l}
          </span>
        ))}
        {d.regions.slice(0,2).map(r=>(
          <span key={r} className="chip" style={{ fontSize:11, padding:'2px 8px', height:'auto', background:'#EBF8FF', borderColor:'#90CDF4' }}>
            📍 {r}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:12, paddingTop:12, borderTop:'1px solid #F0F4F8' }} onClick={e=>e.stopPropagation()}>
        <button className={`btn btn-sm ${comparing?'btn-primary':'btn-ghost'}`} onClick={onToggleCompare} title="Compare">
          {comparing ? '✓ Comparing' : '⚖️ Compare'}
        </button>
        <button className="btn btn-ghost btn-sm">💬 Message</button>
        <button className="btn btn-ghost btn-sm" onClick={onSelect}>View Profile</button>
        <button
          className={`btn btn-sm ${hired ? 'btn-ghost' : 'btn-primary'}`}
          style={{ marginLeft:'auto', minWidth:140 }}
          disabled={hired}
          onClick={onHire}
        >
          {hired ? '✓ Request Sent' : d.trialAvailable ? `🆓 Start ${d.trialDays}-day Trial` : 'Send Request →'}
        </button>
      </div>
    </div>
  )
}

// ─── Dispatcher Detail Panel ──────────────────────────────────────────────────
function DispatcherDetail({ d, hired, onHire, onClose }:
  { d:DispatcherEx; hired:boolean; onHire:()=>void; onClose:()=>void }) {
  const [tab, setTab] = useState<'overview'|'performance'|'reviews'|'pricing'>('overview')

  const rpmMin = Math.min(...d.performanceHistory.map(p=>p.rpm))
  const rpmMax = Math.max(...d.performanceHistory.map(p=>p.rpm))
  const rpmRange = rpmMax - rpmMin || 0.1

  return (
    <div className="card" style={{ borderRadius:20, overflow:'hidden', display:'flex', flexDirection:'column', padding:0 }}>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', padding:'20px', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:52, marginBottom:6 }}>{d.avatar}</div>
          <div style={{ fontWeight:800, fontSize:18, color:'#fff' }}>{d.name}</div>
          {d.topPerformer && <div style={{ fontSize:12, color:'#FCD34D', marginTop:2 }}>⭐ Top Performer on DispaLoadIQ</div>}
          <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', marginTop:4 }}>📍 {d.location} · {d.experience} years experience</div>
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginTop:8 }}>
            <span style={{ fontWeight:700, color:'#FCD34D' }}>★ {d.rating.toFixed(2)}</span>
            <span style={{ color:'rgba(255,255,255,.5)' }}>({d.reviewCount} reviews)</span>
            <span style={{ color:'#38C770', fontWeight:700 }}>● {d.availability==='available'?'Available Now':d.availability==='limited'?'Limited':'Busy'}</span>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, flexWrap:'wrap', marginTop:12 }}>
          {Object.entries(d.trust).map(([key, val]) => val ? (
            <span key={key} style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:'rgba(255,255,255,.15)', color:'#fff' }}>
              {TRUST_ICONS[key]} {key==='platformVerified'?'Platform Verified':key==='dotVerified'?'DOT Verified':key==='backgroundCheck'?'Background ✓':'References ✓'}
            </span>
          ) : null)}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'#F4F6F9', borderBottom:'1px solid #E2E8F0' }}>
        {[
          { v:`$${d.avgRpm.toFixed(2)}`, l:'Avg RPM', color:'#38C770' },
          { v:`${d.onTimeRate}%`,        l:'On-Time',  color: d.onTimeRate>=95?'#38C770':'#F59E0B' },
          { v:`${d.loadsPerMonth}/mo`,   l:'Loads',    color:'#4BAED4' },
          { v:d.responseTime,            l:'Response', color:'#8B5CF6' },
        ].map(s=>(
          <div key={s.l} style={{ textAlign:'center', padding:'12px 6px', borderRight:'1px solid #E2E8F0' }}>
            <div style={{ fontWeight:800, fontSize:14, color:s.color }}>{s.v}</div>
            <div style={{ fontSize:10, color:'#A0AEC0' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display:'flex', gap:10, padding:'12px 16px', borderBottom:'1px solid #E2E8F0' }}>
        <button className="btn btn-outline btn-sm" style={{ flex:1 }}>💬 Message</button>
        <button
          className={`btn btn-sm ${hired?'btn-ghost':'btn-primary'}`}
          style={{ flex:2 }}
          onClick={onHire}
          disabled={hired}
        >
          {hired ? '✓ Request Sent' : d.trialAvailable ? `🆓 Start ${d.trialDays}-day Trial` : 'Send Contract Request →'}
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ padding:'0 12px', marginBottom:0, flexShrink:0 }}>
        {(['overview','performance','reviews','pricing'] as const).map(t=>(
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)} style={{ fontSize:12 }}>
            {t==='overview'?'About':t==='performance'?'📊 Stats':t==='reviews'?'⭐ Reviews':'💰 Pricing'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>

        {tab === 'overview' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:13, color:'#718096', lineHeight:1.7, margin:0 }}>{d.bio}</p>

            <div>
              <div className="section-title" style={{ fontSize:12, marginBottom:8 }}>Specializations</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {d.specializations.map(s=>(
                  <span key={s} className="chip active" style={{ fontSize:12 }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="section-title" style={{ fontSize:12, marginBottom:8 }}>Coverage Regions</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {d.regions.map(r=>(
                  <span key={r} style={{ padding:'4px 12px', background:'#EBF8FF', color:'#2C5282', borderRadius:99, fontSize:12, fontWeight:600 }}>
                    📍 {r}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="section-title" style={{ fontSize:12, marginBottom:8 }}>Languages</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {d.languages.map(l=>(
                  <span key={l} style={{ padding:'4px 12px', background:'#F0FDF4', color:'#059669', borderRadius:99, fontSize:12, fontWeight:600 }}>
                    🌐 {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Contract terms */}
            <div style={{ background:'#F4F6F9', borderRadius:10, padding:'14px' }}>
              <div className="section-title" style={{ fontSize:12, marginBottom:10 }}>Contract Terms</div>
              {[
                { label:'Trial Period',      value: d.trialAvailable ? `${d.trialDays} days free trial` : 'No trial' },
                { label:'Min Contract',      value: `${d.minContractMonths} month(s)` },
                { label:'Notice Period',     value:'14 days' },
                { label:'RPM Guarantee',     value: d.rpmGuarantee ? `$${d.rpmGuarantee.toFixed(2)}/mi minimum` : 'None' },
                { label:'Loads Completed',   value: `${d.loadsTotal.toLocaleString()} total` },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #E2E8F0' }}>
                  <span style={{ fontSize:12, color:'#718096' }}>{r.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#2D3748' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'performance' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* RPM trend chart */}
            <div>
              <div className="section-title" style={{ fontSize:12, marginBottom:10 }}>
                RPM Trend (Platform-Verified)
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:90 }}>
                {d.performanceHistory.map(p => {
                  const h = Math.round(((p.rpm - rpmMin) / rpmRange) * 70) + 20
                  return (
                    <div key={p.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:'#38C770' }}>${p.rpm.toFixed(2)}</div>
                      <div style={{ width:'100%', borderRadius:'4px 4px 0 0', background:'linear-gradient(180deg,#38C770,#2FA85A)', height:h, minHeight:10 }} />
                      <div style={{ fontSize:10, color:'#A0AEC0' }}>{p.month}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Performance metrics */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { label:'Avg RPM',        value:`$${d.avgRpm.toFixed(2)}/mi`,       color:'#38C770', verified:true },
                { label:'On-Time Rate',   value:`${d.onTimeRate}%`,                color: d.onTimeRate>=95?'#38C770':'#F59E0B', verified:true },
                { label:'Completion Rate',value:`${d.completionRate}%`,            color:'#4BAED4', verified:true },
                { label:'Response Score', value:`${d.responseScore}/100`,          color:'#8B5CF6', verified:true },
                { label:'Active Clients', value:d.activeClients.toString(),        color:'#F59E0B', verified:false },
                { label:'Loads This Month',value:d.loadsPerMonth.toString(),       color:'#718096', verified:false },
              ].map(m=>(
                <div key={m.label} style={{ background:'#F4F6F9', borderRadius:10, padding:'12px' }}>
                  <div style={{ fontSize:20, fontWeight:900, color:m.color }}>{m.value}</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>{m.label}</div>
                  {m.verified && <div style={{ fontSize:10, color:'#38C770', marginTop:3 }}>✓ Platform verified</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:28, fontWeight:900, color:'#F59E0B' }}>{d.rating.toFixed(2)}</span>
              <div>
                <div style={{ color:'#F59E0B', fontSize:16 }}>{'★'.repeat(Math.round(d.rating))}</div>
                <div style={{ fontSize:12, color:'#A0AEC0' }}>{d.reviewCount} verified reviews</div>
              </div>
            </div>
            {d.reviews.map((r,i) => (
              <div key={i} style={{ background:'#F4F6F9', borderRadius:12, padding:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div>
                    <span style={{ fontWeight:700, fontSize:13 }}>{r.author}</span>
                    <span style={{ fontSize:11, color:'#A0AEC0', marginLeft:8 }}>{r.truckType} · {r.duration}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'#F59E0B', fontSize:13 }}>{'★'.repeat(r.rating)}</div>
                    <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.date}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#38C770', background:'#F0FFF4', padding:'2px 8px', borderRadius:99 }}>
                    ${r.rpm.toFixed(2)} RPM achieved
                  </span>
                  {r.verified && (
                    <span style={{ fontSize:11, color:'#276749', background:'#F0FFF4', padding:'2px 8px', borderRadius:99 }}>
                      ✓ Platform verified
                    </span>
                  )}
                </div>
                <p style={{ fontSize:13, color:'#718096', lineHeight:1.6, margin:0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'pricing' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', borderRadius:14, padding:'20px', textAlign:'center' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginBottom:4 }}>Fee Structure</div>
              <div style={{ fontSize:30, fontWeight:900, color:'#fff' }}>{d.pricing.label}</div>
              {d.rpmGuarantee && (
                <div style={{ fontSize:13, color:'#38C770', marginTop:6, fontWeight:600 }}>
                  ✓ Guaranteed minimum ${d.rpmGuarantee.toFixed(2)}/mi RPM
                </div>
              )}
            </div>

            {/* Cost calculator */}
            <div style={{ background:'#F4F6F9', borderRadius:12, padding:14 }}>
              <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>💡 Monthly Cost Estimate</div>
              <div style={{ fontSize:12, color:'#718096', marginBottom:12 }}>Based on 10,000 mi/mo @ {d.avgRpm.toFixed(2)} RPM avg</div>
              {[
                { label:'Monthly Gross Revenue', value:`~$${Math.round(10000 * d.avgRpm).toLocaleString()}`, color:'#38C770', bold:true },
                { label:'Dispatcher Fee',
                  value: d.pricing.model==='percent'
                    ? `~$${Math.round(10000 * d.avgRpm * d.pricing.value/100).toLocaleString()}/mo (${d.pricing.value}%)`
                    : d.pricing.model==='per_load'
                    ? `~$${(d.pricing.value * d.loadsPerMonth).toLocaleString()}/mo ($${d.pricing.value} × ${d.loadsPerMonth} loads)`
                    : `$${d.pricing.value}/mo flat`,
                  color:'#E53E3E', bold:false },
                { label:'You Keep (before expenses)',
                  value: `~$${Math.round(10000 * d.avgRpm * (d.pricing.model==='percent' ? (100-d.pricing.value)/100 : 1) - (d.pricing.model==='per_load'?d.pricing.value*d.loadsPerMonth:d.pricing.model==='flat'?d.pricing.value:0)).toLocaleString()}/mo`,
                  color:'#4BAED4', bold:true },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #E2E8F0' }}>
                  <span style={{ fontSize:13, color:'#718096', fontWeight:r.bold?700:400 }}>{r.label}</span>
                  <span style={{ fontSize:13, fontWeight:r.bold?800:600, color:r.color }}>{r.value}</span>
                </div>
              ))}
            </div>

            {d.trialAvailable && (
              <div style={{ background:'#F0FFF4', border:'1px solid #86EFAC', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                <div style={{ fontWeight:700, color:'#276749', marginBottom:4 }}>🆓 {d.trialDays}-Day Free Trial Available</div>
                <div style={{ fontSize:12, color:'#4A5568' }}>Try before you commit. No payment during trial period.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Hire / Contract Modal ────────────────────────────────────────────────────
function HireModal({ d, onClose, onConfirm }: { d:DispatcherEx; onClose:()=>void; onConfirm:()=>void }) {
  const [step, setStep]       = useState<1|2|3>(1)
  const [startType, setStart] = useState<'trial'|'direct'>( d.trialAvailable ? 'trial' : 'direct')
  const [truckType, setTruck] = useState('Dry Van 53\'')
  const [lanes, setLanes]     = useState('')
  const [message, setMessage] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:520 }} onClick={e=>e.stopPropagation()}>

        {/* Step indicator */}
        <div style={{ display:'flex', gap:0, marginBottom:20 }}>
          {(['Contract Setup','Your Truck Details','Send Request'] as const).map((label,i)=>(
            <div key={label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', fontWeight:700, fontSize:13,
                background: i+1<=step?'#4BAED4':'#E2E8F0',
                color:      i+1<=step?'#fff':'#A0AEC0',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {i+1 < step ? '✓' : i+1}
              </div>
              <div style={{ fontSize:10, color: i+1===step?'#2D3748':'#A0AEC0', fontWeight: i+1===step?700:400, textAlign:'center' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:42 }}>{d.avatar}</div>
              <div style={{ fontWeight:800, fontSize:18, marginTop:6 }}>{d.name}</div>
              <div style={{ fontSize:13, color:'#718096' }}>{d.pricing.label} · ★ {d.rating.toFixed(2)}</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
              <div className="section-title" style={{ fontSize:12 }}>How do you want to start?</div>
              {d.trialAvailable && (
                <div style={{ border:`2px solid ${startType==='trial'?'#4BAED4':'#E2E8F0'}`, borderRadius:12, padding:'14px', cursor:'pointer', background: startType==='trial'?'#EBF8FF':'#fff' }}
                  onClick={()=>setStart('trial')}>
                  <div style={{ fontWeight:700, color: startType==='trial'?'#2C5282':'#2D3748' }}>🆓 {d.trialDays}-Day Free Trial</div>
                  <div style={{ fontSize:12, color:'#718096', marginTop:2 }}>No payment. Full dispatcher service. Cancel anytime during trial.</div>
                </div>
              )}
              <div style={{ border:`2px solid ${startType==='direct'?'#4BAED4':'#E2E8F0'}`, borderRadius:12, padding:'14px', cursor:'pointer', background: startType==='direct'?'#EBF8FF':'#fff' }}
                onClick={()=>setStart('direct')}>
                <div style={{ fontWeight:700, color: startType==='direct'?'#2C5282':'#2D3748' }}>🚀 Direct Contract</div>
                <div style={{ fontSize:12, color:'#718096', marginTop:2 }}>Start immediately. Min {d.minContractMonths} month(s). 14-day notice to cancel.</div>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={()=>setStep(2)}>Continue →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="modal-header" style={{ padding:0, marginBottom:16 }}>
              <h3 className="modal-title">Your Truck Details</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Truck / Trailer Type</label>
                <select className="input select" value={truckType} onChange={e=>setTruck(e.target.value)}>
                  {["Dry Van 53'","Reefer 53'","Flatbed 48'","Flatbed 53'","Hotshot","Stepdeck","Box Truck"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Preferred Lanes / Regions</label>
                <input className="input" placeholder="e.g. Midwest, Southeast, OTR" value={lanes} onChange={e=>setLanes(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Message to Dispatcher (optional)</label>
                <textarea className="input" rows={3} placeholder="Tell them about your experience, home base, schedule preferences..." value={message} onChange={e=>setMessage(e.target.value)} style={{ resize:'vertical' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-full" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-primary btn-full" onClick={()=>setStep(3)}>Review Request →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="modal-header" style={{ padding:0, marginBottom:16 }}>
              <h3 className="modal-title">Review & Send</h3>
            </div>
            <div style={{ background:'#F4F6F9', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
              {[
                { label:'Dispatcher',   value:d.name },
                { label:'Start Type',   value: startType==='trial' ? `${d.trialDays}-day free trial` : 'Direct contract' },
                { label:'Rate',         value:d.pricing.label },
                { label:'Your Truck',   value:truckType },
                { label:'Regions',      value:lanes || 'Not specified' },
              ].map(r=>(
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #E2E8F0' }}>
                  <span style={{ fontSize:13, color:'#718096' }}>{r.label}</span>
                  <span style={{ fontSize:13, fontWeight:700 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'#F0FFF4', border:'1px solid #86EFAC', borderRadius:10, padding:'10px 12px', marginBottom:16, fontSize:12, color:'#276749' }}>
              ✓ {d.name} will receive your request and confirm within {d.responseTime}. You'll be notified immediately.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-full" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-full btn-lg" onClick={onConfirm}>
                🚀 {startType==='trial' ? 'Start Free Trial' : 'Send Contract Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Compare Panel ────────────────────────────────────────────────────────────
function ComparePanel({ dispatchers: ds, onHire, hired }:
  { dispatchers:DispatcherEx[]; onHire:(d:DispatcherEx)=>void; hired:string[] }) {

  const rows: { label:string; fn:(d:DispatcherEx)=>string; best?:(vals:string[])=>number }[] = [
    { label:'Rating',          fn:d=>`★ ${d.rating.toFixed(2)} (${d.reviewCount})` },
    { label:'Avg RPM',         fn:d=>`$${d.avgRpm.toFixed(2)}/mi` },
    { label:'RPM Guarantee',   fn:d=>d.rpmGuarantee?`$${d.rpmGuarantee.toFixed(2)}+`:'None' },
    { label:'Fee',             fn:d=>d.pricing.label },
    { label:'On-Time Rate',    fn:d=>`${d.onTimeRate}%` },
    { label:'Loads Completed', fn:d=>d.loadsTotal.toLocaleString() },
    { label:'Response Time',   fn:d=>d.responseTime },
    { label:'Trial Period',    fn:d=>d.trialAvailable?`${d.trialDays} days`:'No' },
    { label:'Languages',       fn:d=>d.languages.join(', ') },
    { label:'Specializations', fn:d=>d.specializations.join(', ') },
    { label:'Regions',         fn:d=>d.regions.join(', ') },
    { label:'DOT Verified',    fn:d=>d.trust.dotVerified?'✅ Yes':'❌ No' },
    { label:'Background Check',fn:d=>d.trust.backgroundCheck?'✅ Yes':'❌ No' },
    { label:'Platform Verified',fn:d=>d.trust.platformVerified?'✅ Yes':'❌ No' },
  ]

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'grid', gridTemplateColumns:`160px repeat(${ds.length},1fr)`, gap:0, marginBottom:16 }}>
        <div />
        {ds.map(d=>(
          <div key={d.id} style={{ textAlign:'center', padding:'0 12px' }}>
            <div style={{ fontSize:36, marginBottom:4 }}>{d.avatar}</div>
            <div style={{ fontWeight:800, fontSize:14 }}>{d.name}</div>
            <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:8 }}>{d.location}</div>
            <button
              className={`btn btn-sm ${hired.includes(d.id)?'btn-ghost':'btn-primary'}`}
              style={{ width:'100%' }}
              disabled={hired.includes(d.id)}
              onClick={()=>onHire(d)}
            >
              {hired.includes(d.id)?'✓ Sent': d.trialAvailable?`🆓 Trial`:'Hire →'}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison rows */}
      {rows.map((r,i)=>(
        <div key={r.label} style={{ display:'grid', gridTemplateColumns:`160px repeat(${ds.length},1fr)`, background:i%2===0?'#F4F6F9':'#fff', borderRadius:8, padding:'8px 12px', alignItems:'center' }}>
          <div style={{ fontSize:12, color:'#718096', fontWeight:600 }}>{r.label}</div>
          {ds.map(d=>(
            <div key={d.id} style={{ textAlign:'center', fontSize:13, fontWeight:600, color:'#2D3748', padding:'0 8px' }}>
              {r.fn(d)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── AI Match Modal ───────────────────────────────────────────────────────────
function AIMatchModal({ step, result, onRun, onClose, onHire, onView }:
  { step:number; result:DispatcherEx|null; onRun:()=>void; onClose:()=>void; onHire:(d:DispatcherEx)=>void; onView:(d:DispatcherEx)=>void }) {

  const [truckType, setTruck]   = useState("Dry Van 53'")
  const [lanes,     setLanes]   = useState('Midwest')
  const [budget,    setBudget]  = useState('5-6%')
  const [language,  setLang]    = useState('Any')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:500 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🤖 AI Dispatcher Match</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {step === 0 && (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
              <p style={{ fontSize:13, color:'#718096', margin:0, lineHeight:1.6 }}>
                Answer 4 quick questions and our AI will find your best dispatcher match based on real performance data.
              </p>
              {[
                { label:'Your Truck / Trailer', val:truckType, set:setTruck,
                  opts:["Dry Van 53'","Reefer 53'","Flatbed 48'","Hotshot","Box Truck"] },
                { label:'Primary Lanes / Region', val:lanes, set:setLanes,
                  opts:['Midwest','Southeast','Southwest','Northeast','West Coast','OTR (all)'] },
                { label:'Max Dispatcher Fee', val:budget, set:setBudget,
                  opts:['< 5%','5-6%','6-7%','Flat rate OK','Any'] },
                { label:'Preferred Language', val:language, set:setLang,
                  opts:['Any','English','Russian','Spanish','Ukrainian','Portuguese'] },
              ].map(f=>(
                <div key={f.label} className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">{f.label}</label>
                  <select className="input select" value={f.val} onChange={e=>f.set(e.target.value)}>
                    {f.opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={onRun}>
              🤖 Find My Best Match →
            </button>
          </>
        )}

        {step === 1 && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <div style={{ fontWeight:700, fontSize:15, color:'#2D3748' }}>Analyzing {DISPATCHERS.length} dispatcher profiles...</div>
            <div style={{ background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden', maxWidth:300, margin:'20px auto 0' }}>
              <div style={{ width:'40%', height:'100%', borderRadius:99, background:'#4BAED4' }} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📊</div>
            <div style={{ fontWeight:700, fontSize:15, color:'#2D3748' }}>Matching on RPM, region, language, reviews...</div>
            <div style={{ background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden', maxWidth:300, margin:'20px auto 0' }}>
              <div style={{ width:'80%', height:'100%', borderRadius:99, background:'#38C770' }} />
            </div>
          </div>
        )}

        {step === 3 && result && (
          <>
            <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', borderRadius:14, padding:'20px', textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', marginBottom:4 }}>🤖 AI Best Match</div>
              <div style={{ fontSize:44, marginBottom:8 }}>{result.avatar}</div>
              <div style={{ fontWeight:900, fontSize:18, color:'#fff' }}>{result.name}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.65)', marginTop:4 }}>📍 {result.location} · ★ {result.rating.toFixed(2)}</div>
              <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:12 }}>
                {[
                  { v:`$${result.avgRpm.toFixed(2)}`, l:'Avg RPM' },
                  { v:`${result.onTimeRate}%`,         l:'On-Time' },
                  { v:result.pricing.label,            l:'Rate' },
                ].map(s=>(
                  <div key={s.l} style={{ textAlign:'center' }}>
                    <div style={{ fontWeight:800, color:'#38C770', fontSize:15 }}>{s.v}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.55)' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'#F0FFF4', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:12, color:'#276749' }}>
              ✅ Match score: <strong>98% compatibility</strong> — RPM history, region coverage, and language all match your preferences.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-full" onClick={()=>onView(result)}>View Full Profile</button>
              <button className="btn btn-primary btn-full" onClick={()=>onHire(result)}>
                {result.trialAvailable ? `🆓 Start ${result.trialDays}-day Trial` : 'Send Request →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Post a Request Panel ─────────────────────────────────────────────────────
function PostRequestPanel({ onSwitch }: { onSwitch:()=>void }) {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) return (
    <div className="card" style={{ textAlign:'center', padding:'60px 40px', maxWidth:600, margin:'0 auto' }}>
      <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
      <div style={{ fontSize:20, fontWeight:800, color:'#1A2535', marginBottom:8 }}>Request Posted!</div>
      <div style={{ fontSize:14, color:'#718096', marginBottom:24 }}>
        Matching dispatchers will receive your request. Expect responses within 24 hours.
      </div>
      <button className="btn btn-primary" onClick={onSwitch}>Browse Dispatchers →</button>
    </div>
  )

  return (
    <div className="card" style={{ maxWidth:620, margin:'0 auto' }}>
      <h3 className="section-title" style={{ marginBottom:4 }}>📝 Post a Dispatcher Request</h3>
      <p style={{ fontSize:13, color:'#718096', marginBottom:20 }}>
        Describe what you need and let qualified dispatchers apply to work with you.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {[
          { label:"Truck / Trailer Type",     type:'select', opts:["Dry Van 53'","Reefer 53'","Flatbed 48'","Hotshot","Box Truck"] },
          { label:'Home Base City, State',    type:'text',   ph:'e.g. Chicago, IL' },
          { label:'Preferred Regions',        type:'select', opts:['OTR (all regions)','Midwest','Southeast','Southwest','Northeast','West Coast'] },
          { label:'Target RPM',               type:'select', opts:['Any','$2.00+','$2.25+','$2.50+','$2.75+'] },
          { label:'Budget (dispatcher fee)',  type:'select', opts:['Any','Up to 5%','5-6%','6-7%','Flat rate preferred'] },
          { label:'Preferred Language',       type:'select', opts:['Any','English only','English + Russian','English + Spanish','English + Ukrainian'] },
          { label:'Schedule',                 type:'select', opts:['OTR – 3+ weeks out','Regional – home weekly','Local – daily'] },
          { label:'Start Date',              type:'date',   ph:'' },
        ].map(f=>(
          <div key={f.label} className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">{f.label}</label>
            {f.type==='select'
              ? <select className="input select">{(f.opts??[]).map(o=><option key={o}>{o}</option>)}</select>
              : <input className="input" type={f.type} placeholder={f.ph} />
            }
          </div>
        ))}
        <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
          <label className="form-label">Additional Notes</label>
          <textarea className="input" rows={3} placeholder="Describe your experience, previous dispatchers, what's most important to you..." style={{ resize:'vertical' }} />
        </div>
        <div className="form-group" style={{ marginBottom:0, gridColumn:'1/-1' }}>
          <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', fontSize:13, color:'#4A5568' }}>
            <input type="checkbox" defaultChecked style={{ marginTop:2 }} />
            <span>Allow dispatchers to contact me directly. My contact details will only be shared after I approve their application.</span>
          </label>
        </div>
      </div>
      <div style={{ display:'flex', gap:10, marginTop:20 }}>
        <button className="btn btn-ghost btn-full" onClick={onSwitch}>Cancel</button>
        <button className="btn btn-primary btn-full btn-lg" onClick={()=>setSubmitted(true)}>
          📝 Post Request — Match me with dispatchers
        </button>
      </div>
    </div>
  )
}
