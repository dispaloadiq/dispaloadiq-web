import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────
type SafetyRating = 'Satisfactory' | 'Conditional' | 'Unsatisfactory' | 'Not Rated'
type AuthorityType = 'Common' | 'Contract' | 'Broker'
type TrendDir = 'up' | 'down' | 'flat'

interface MonthlySnapshot {
  month: string   // e.g. "Dec"
  onTime: number          // %
  damageRate: number      // per 100 loads
  responseMin: number     // avg minutes
  acceptRate: number      // %
}

interface Review {
  id: string
  author: string
  company: string
  date: string
  rating: number       // 1–5
  text: string
  loadType: string
  lane: string
  recommended: boolean
}

interface Carrier {
  id: string
  name: string
  mc: string
  dot: string
  city: string
  state: string
  authorityTypes: AuthorityType[]
  safetyRating: SafetyRating
  insuranceCoverage: number   // $ million
  yearsInBusiness: number
  tractors: number
  drivers: number
  equipment: string[]
  // Current metrics
  onTimePercent: number
  damageRate: number          // per 100 loads
  avgResponseMin: number
  acceptanceRate: number
  reviewScore: number         // 1–5
  reviewCount: number
  loadsLast90: number
  totalLoadsLifetime: number
  // Trends
  monthly: MonthlySnapshot[]
  reviews: Review[]
  // Badges
  badges: string[]
}

// ─── Score calculation ────────────────────────────────────────────────────────
function calcScore(c: Carrier): number {
  const onTimeScore   = c.onTimePercent                           // 0–100
  const damageScore   = Math.max(0, 100 - c.damageRate * 15)     // low damage = high score
  const responseScore = Math.max(0, 100 - (c.avgResponseMin / 60) * 20) // fast = high
  const acceptScore   = c.acceptanceRate                          // 0–100
  const reviewScore   = (c.reviewScore / 5) * 100                // 0–100
  return Math.round(
    onTimeScore * 0.32 +
    damageScore * 0.22 +
    responseScore * 0.16 +
    acceptScore * 0.18 +
    reviewScore * 0.12,
  )
}

function scoreGrade(score: number): { grade: string; color: string; bg: string } {
  if (score >= 90) return { grade: 'A+', color: '#276749', bg: '#F0FFF4' }
  if (score >= 82) return { grade: 'A',  color: '#276749', bg: '#F0FFF4' }
  if (score >= 74) return { grade: 'B+', color: '#7B4F1A', bg: '#FFFAF0' }
  if (score >= 66) return { grade: 'B',  color: '#7B4F1A', bg: '#FFFAF0' }
  if (score >= 58) return { grade: 'C',  color: '#7B4F1A', bg: '#FFFBEB' }
  return { grade: 'D', color: '#7B1A1A', bg: '#FFF5F5' }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
function mkMonthly(
  baseOnTime: number, baseDamage: number, baseResp: number, baseAccept: number,
  trend: 'improving' | 'declining' | 'stable',
): MonthlySnapshot[] {
  const months = ['Jan','Feb','Mar','Apr','May','Jun']
  return months.map((month, i) => {
    const t = trend === 'improving' ? i * 0.4 : trend === 'declining' ? -i * 0.4 : 0
    const jitter = () => (Math.random() - 0.5) * 2
    return {
      month,
      onTime:      Math.min(100, Math.max(60, baseOnTime    + t * 0.8 + jitter())),
      damageRate:  Math.max(0,              baseDamage     - t * 0.05 + jitter() * 0.1),
      responseMin: Math.max(5,              baseResp       - t * 2    + jitter() * 5),
      acceptRate:  Math.min(100, Math.max(40, baseAccept  + t * 0.5  + jitter())),
    }
  })
}

const CARRIERS: Carrier[] = [
  {
    id: 'swift',
    name: 'Swift Transportation',
    mc: 'MC-107949', dot: 'USDOT-2230512',
    city: 'Phoenix', state: 'AZ',
    authorityTypes: ['Common', 'Contract'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 2,
    yearsInBusiness: 37,
    tractors: 12400, drivers: 13200,
    equipment: ['Dry Van', 'Reefer', 'Flatbed'],
    onTimePercent: 91.4, damageRate: 0.42, avgResponseMin: 18, acceptanceRate: 87, reviewScore: 4.2, reviewCount: 1842, loadsLast90: 3240, totalLoadsLifetime: 890000,
    badges: ['⭐ Top Carrier', '🛡️ FMCSA Satisfactory', '📦 High Volume'],
    monthly: mkMonthly(91, 0.44, 19, 86, 'stable'),
    reviews: [
      { id:'r1', author:'Mark T.', company:'Echo Logistics', date:'2026-04-28', rating:4, text:'Consistent performance on our TX-CA lanes. Driver communication is excellent, always gets TA arrival notifications.', loadType:'Dry Van', lane:'Dallas → Los Angeles', recommended:true },
      { id:'r2', author:'Linda K.', company:'Coyote Logistics', date:'2026-04-10', rating:5, text:'Delivered 72hrs early on a critical retail load. Proactive updates throughout. Will book again.', loadType:'Reefer', lane:'Chicago → Atlanta', recommended:true },
      { id:'r3', author:'James R.', company:'TQL', date:'2026-03-22', rating:3, text:'Solid carrier but had a 4hr delay at pickup due to dock scheduling. No damage, just slow check-in.', loadType:'Dry Van', lane:'Memphis → Nashville', recommended:true },
      { id:'r4', author:'Sarah M.', company:'Uber Freight', date:'2026-03-05', rating:4, text:'Good responsiveness, picked up on time. Minor paperwork issue at delivery resolved quickly.', loadType:'Flatbed', lane:'Houston → Denver', recommended:true },
    ],
  },
  {
    id: 'jbhunt',
    name: 'J.B. Hunt Transport',
    mc: 'MC-150544', dot: 'USDOT-2432571',
    city: 'Lowell', state: 'AR',
    authorityTypes: ['Common', 'Contract', 'Broker'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 3,
    yearsInBusiness: 61,
    tractors: 12000, drivers: 22000,
    equipment: ['Dry Van', 'Intermodal', 'Dedicated'],
    onTimePercent: 93.8, damageRate: 0.29, avgResponseMin: 12, acceptanceRate: 91, reviewScore: 4.5, reviewCount: 2310, loadsLast90: 4180, totalLoadsLifetime: 1450000,
    badges: ['🏆 Preferred Carrier', '⭐ Top Carrier', '🛡️ FMCSA Satisfactory', '⚡ Fast Response'],
    monthly: mkMonthly(93, 0.30, 13, 90, 'improving'),
    reviews: [
      { id:'r5', author:'Patricia A.', company:'CH Robinson', date:'2026-05-01', rating:5, text:'Outstanding service. Real-time tracking through J.B. Hunt 360 is seamless. Zero claims in 18 months.', loadType:'Dry Van', lane:'Chicago → New York', recommended:true },
      { id:'r6', author:'David L.', company:'Total Quality Logistics', date:'2026-04-18', rating:5, text:'Best response time in the business. Agent picked up in 8min, load moved same day.', loadType:'Intermodal', lane:'LA → Chicago', recommended:true },
      { id:'r7', author:'Rachel G.', company:'Convoy', date:'2026-03-30', rating:4, text:'Reliable as always. Slight detention at shipper not handled perfectly but carrier communicated well.', loadType:'Dry Van', lane:'Atlanta → Miami', recommended:true },
      { id:'r8', author:'Tom B.', company:'Landstar', date:'2026-03-14', rating:4, text:'Great carrier, competitive pricing. Dedicated fleet option is a plus for recurring lanes.', loadType:'Dedicated', lane:'Dallas → Houston', recommended:true },
    ],
  },
  {
    id: 'heartland',
    name: 'Heartland Express',
    mc: 'MC-227545', dot: 'USDOT-3068793',
    city: 'North Liberty', state: 'IA',
    authorityTypes: ['Common'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 1,
    yearsInBusiness: 40,
    tractors: 2800, drivers: 3100,
    equipment: ['Dry Van', 'Temperature-Controlled'],
    onTimePercent: 94.1, damageRate: 0.31, avgResponseMin: 22, acceptanceRate: 83, reviewScore: 4.4, reviewCount: 687, loadsLast90: 890, totalLoadsLifetime: 210000,
    badges: ['⭐ Top Carrier', '🛡️ FMCSA Satisfactory', '🌡️ Temp Control Certified'],
    monthly: mkMonthly(94, 0.32, 23, 82, 'improving'),
    reviews: [
      { id:'r9',  author:'Carlos V.', company:'GlobalTranz', date:'2026-04-25', rating:5, text:'Consistently best on-time rate we track. Temperature logs always clean on reefer loads.', loadType:'Reefer', lane:'CA → TX', recommended:true },
      { id:'r10', author:'Nina P.', company:'MoLo Solutions', date:'2026-04-08', rating:4, text:'Great on the Midwest lanes. Slightly slower on booking confirmation but delivery is flawless.', loadType:'Dry Van', lane:'Chicago → Minneapolis', recommended:true },
      { id:'r11', author:'Greg F.', company:'Echo Global', date:'2026-03-20', rating:5, text:'Perfect load for perishables. Driver checked in proactively at each stop, zero temp excursions.', loadType:'Reefer', lane:'Florida → Northeast', recommended:true },
    ],
  },
  {
    id: 'werner',
    name: 'Werner Enterprises',
    mc: 'MC-148988', dot: 'USDOT-2294421',
    city: 'Omaha', state: 'NE',
    authorityTypes: ['Common', 'Contract'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 2,
    yearsInBusiness: 68,
    tractors: 8200, drivers: 10500,
    equipment: ['Dry Van', 'Flatbed', 'Temperature-Controlled'],
    onTimePercent: 89.7, damageRate: 0.55, avgResponseMin: 31, acceptanceRate: 79, reviewScore: 3.9, reviewCount: 1124, loadsLast90: 2100, totalLoadsLifetime: 620000,
    badges: ['📦 High Volume', '🌡️ Temp Control Certified'],
    monthly: mkMonthly(90, 0.56, 32, 78, 'stable'),
    reviews: [
      { id:'r12', author:'Steve H.', company:'Schneider', date:'2026-04-30', rating:4, text:'Reliable on the long-haul lanes, decent tracking. Response time can lag on weekends.', loadType:'Dry Van', lane:'NE → Southeast', recommended:true },
      { id:'r13', author:'Diana M.', company:'XPO', date:'2026-04-12', rating:3, text:'Had 2 late deliveries this quarter. Carrier was communicative but delays were avoidable.', loadType:'Flatbed', lane:'TX → CA', recommended:false },
      { id:'r14', author:'Frank L.', company:'Radiant Logistics', date:'2026-03-28', rating:4, text:'Solid carrier. Flat rates, no surprises. Better than average for flatbed loads.', loadType:'Flatbed', lane:'MN → OH', recommended:true },
    ],
  },
  {
    id: 'schneider',
    name: 'Schneider National',
    mc: 'MC-154511', dot: 'USDOT-2458743',
    city: 'Green Bay', state: 'WI',
    authorityTypes: ['Common', 'Contract', 'Broker'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 3,
    yearsInBusiness: 87,
    tractors: 10000, drivers: 11500,
    equipment: ['Dry Van', 'Intermodal', 'Bulk', 'Tanker'],
    onTimePercent: 88.2, damageRate: 0.68, avgResponseMin: 27, acceptanceRate: 82, reviewScore: 3.7, reviewCount: 1680, loadsLast90: 2860, totalLoadsLifetime: 980000,
    badges: ['📦 High Volume', '⚗️ Hazmat Certified', '🛡️ FMCSA Satisfactory'],
    monthly: mkMonthly(88, 0.70, 28, 81, 'declining'),
    reviews: [
      { id:'r15', author:'Amy C.', company:'C.H. Robinson', date:'2026-05-02', rating:3, text:'Volume carrier, gets the job done but not exceptional. Had 1 damage claim this year on a bulk load.', loadType:'Bulk', lane:'Midwest Corridor', recommended:true },
      { id:'r16', author:'Bob W.', company:'Arrive Logistics', date:'2026-04-20', rating:4, text:'Intermodal service is excellent. Truckload side is average. Good for high-volume shippers.', loadType:'Intermodal', lane:'CA → IL', recommended:true },
      { id:'r17', author:'Lisa T.', company:'3PL Dynamics', date:'2026-04-02', rating:3, text:'Decent performance overall. Acceptance rate has dropped recently which creates planning challenges.', loadType:'Dry Van', lane:'Southeast → NE', recommended:false },
    ],
  },
  {
    id: 'usatruck',
    name: 'USA Truck',
    mc: 'MC-230253', dot: 'USDOT-2671204',
    city: 'Van Buren', state: 'AR',
    authorityTypes: ['Common'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 1,
    yearsInBusiness: 43,
    tractors: 1800, drivers: 2000,
    equipment: ['Dry Van'],
    onTimePercent: 92.3, damageRate: 0.38, avgResponseMin: 15, acceptanceRate: 88, reviewScore: 4.3, reviewCount: 412, loadsLast90: 520, totalLoadsLifetime: 145000,
    badges: ['⭐ Top Carrier', '⚡ Fast Response', '🛡️ FMCSA Satisfactory'],
    monthly: mkMonthly(92, 0.39, 16, 87, 'improving'),
    reviews: [
      { id:'r18', author:'Kevin J.', company:'Echo Global', date:'2026-05-03', rating:5, text:'Fastest response on the load board. Booked in 9 minutes. Delivery was a day early.', loadType:'Dry Van', lane:'AR → IL', recommended:true },
      { id:'r19', author:'Maria S.', company:'Coyote', date:'2026-04-15', rating:4, text:'Great boutique carrier feel with big-carrier reliability. Recommend for Southeast lanes.', loadType:'Dry Van', lane:'TN → GA', recommended:true },
      { id:'r20', author:'Paul D.', company:'MoLo Solutions', date:'2026-03-28', rating:4, text:'Excellent communication. Driver called 2hrs before delivery as promised. Clean load.', loadType:'Dry Van', lane:'TX → OK', recommended:true },
    ],
  },
  {
    id: 'prime',
    name: 'Prime Inc.',
    mc: 'MC-208168', dot: 'USDOT-2427539',
    city: 'Springfield', state: 'MO',
    authorityTypes: ['Common', 'Contract'],
    safetyRating: 'Satisfactory',
    insuranceCoverage: 1.5,
    yearsInBusiness: 52,
    tractors: 7200, drivers: 7800,
    equipment: ['Reefer', 'Flatbed', 'Tanker'],
    onTimePercent: 90.8, damageRate: 0.47, avgResponseMin: 24, acceptanceRate: 85, reviewScore: 4.1, reviewCount: 934, loadsLast90: 1620, totalLoadsLifetime: 380000,
    badges: ['🌡️ Temp Control Certified', '📐 Flatbed Specialist', '🛡️ FMCSA Satisfactory'],
    monthly: mkMonthly(90, 0.48, 25, 84, 'stable'),
    reviews: [
      { id:'r21', author:'Olivia R.', company:'GlobalTranz', date:'2026-04-22', rating:4, text:'Our go-to reefer carrier. Consistent temps, good logging. Slightly higher cost but worth it.', loadType:'Reefer', lane:'CA → TX', recommended:true },
      { id:'r22', author:'Nathan F.', company:'Transplace', date:'2026-04-05', rating:4, text:'Flatbed capacity when we need it. Load securement is excellent on heavy equipment.', loadType:'Flatbed', lane:'TX → OH', recommended:true },
      { id:'r23', author:'Cathy M.', company:'Uber Freight', date:'2026-03-18', rating:4, text:'Reliable tanker carrier. Good HazMat documentation. Slightly slower response than peers.', loadType:'Tanker', lane:'LA → Southeast', recommended:true },
    ],
  },
  {
    id: 'covenant',
    name: 'Covenant Logistics',
    mc: 'MC-281173', dot: 'USDOT-3541827',
    city: 'Chattanooga', state: 'TN',
    authorityTypes: ['Common', 'Contract'],
    safetyRating: 'Conditional',
    insuranceCoverage: 1,
    yearsInBusiness: 34,
    tractors: 2200, drivers: 2400,
    equipment: ['Dry Van', 'Expedited'],
    onTimePercent: 87.1, damageRate: 0.82, avgResponseMin: 38, acceptanceRate: 74, reviewScore: 3.5, reviewCount: 318, loadsLast90: 440, totalLoadsLifetime: 112000,
    badges: ['⚡ Expedited Available'],
    monthly: mkMonthly(87, 0.84, 40, 73, 'declining'),
    reviews: [
      { id:'r24', author:'Henry K.', company:'Total Quality Logistics', date:'2026-04-28', rating:3, text:'Has been declining lately. Two no-shows this month on spot market loads. Expedited service is OK.', loadType:'Expedited', lane:'TN → OH', recommended:false },
      { id:'r25', author:'Joyce A.', company:'Echo Logistics', date:'2026-04-10', rating:4, text:'Good on Southeast lanes. Expedited capability useful for time-critical loads.', loadType:'Dry Van', lane:'GA → NC', recommended:true },
      { id:'r26', author:'Rick B.', company:'Worldwide Express', date:'2026-03-25', rating:3, text:'Conditional safety rating is a concern. Acceptable performance on lower-value loads.', loadType:'Dry Van', lane:'TN → AL', recommended:false },
    ],
  },
]

// ─── Mini SVG Trend Chart ─────────────────────────────────────────────────────
function TrendLine({
  data, color = '#4BAED4', width = 140, height = 40, showDots = true,
}: {
  data: number[]; color?: string; width?: number; height?: number; showDots?: boolean
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 4
  const w = width - pad * 2
  const h = height - pad * 2
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * w,
    y: pad + (1 - (v - min) / range) * h,
  }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const area = `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pad} ${height} Z`

  const last = data[data.length - 1]
  const first = data[0]
  const trendColor = last > first ? '#38C770' : last < first ? '#FC8181' : color

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`g-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace('#','')})`} />
      <path d={d} fill="none" stroke={trendColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={trendColor} />
      ))}
    </svg>
  )
}

// ─── Gauge (semicircle) ───────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 52, cx = 64, cy = 68
  const startAngle = Math.PI
  const endAngle = 0
  const angle = startAngle + (score / 100) * Math.PI
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(angle),      y2 = cy + r * Math.sin(angle)
  const xEnd = cx + r * Math.cos(endAngle), yEnd = cy + r * Math.sin(endAngle)
  const g = scoreGrade(score)
  const trackColor = '#E2E8F0'
  const fillColor = score >= 82 ? '#38C770' : score >= 66 ? '#F6AD55' : '#FC8181'

  return (
    <svg width={128} height={76} viewBox="0 0 128 76">
      {/* Track */}
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${xEnd} ${yEnd}`}
        fill="none" stroke={trackColor} strokeWidth="10" strokeLinecap="round" />
      {/* Fill */}
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none" stroke={fillColor} strokeWidth="10" strokeLinecap="round" />
      {/* Score number */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="900"
        fill={g.color} fontFamily="sans-serif">{score}</text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={g.color} fontFamily="sans-serif">{g.grade}</text>
    </svg>
  )
}

// ─── Metric Box ───────────────────────────────────────────────────────────────
function MetricBox({
  icon, label, value, sub, trend, trendData, good,
}: {
  icon: string; label: string; value: string; sub?: string
  trend?: TrendDir; trendData?: number[]; good?: boolean
}) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  const trendColor = (good === undefined)
    ? (trend === 'up' ? '#38C770' : trend === 'down' ? '#FC8181' : '#F6AD55')
    : (trend === (good ? 'up' : 'down') ? '#38C770' : trend === (good ? 'down' : 'up') ? '#FC8181' : '#F6AD55')

  return (
    <div style={{
      background: '#F7FAFC', borderRadius: 12, padding: '14px',
      border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>
            {icon} {label}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2535', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>{sub}</div>}
        </div>
        {trend && (
          <span style={{ fontSize: 16, fontWeight: 700, color: trendColor }}>{trendIcon}</span>
        )}
      </div>
      {trendData && trendData.length > 0 && (
        <TrendLine data={trendData} width={120} height={30} showDots={false} />
      )}
    </div>
  )
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          fontSize: size,
          color: i <= Math.round(rating) ? '#F6AD55' : '#E2E8F0',
        }}>★</span>
      ))}
    </span>
  )
}

// ─── Safety Rating Badge ──────────────────────────────────────────────────────
function SafetyBadge({ rating }: { rating: SafetyRating }) {
  const styles: Record<SafetyRating, { bg: string; color: string; border: string }> = {
    'Satisfactory':   { bg: '#F0FFF4', color: '#276749', border: '#9AE6B4' },
    'Conditional':    { bg: '#FFFBEB', color: '#7B4F1A', border: '#FBD38D' },
    'Unsatisfactory': { bg: '#FFF5F5', color: '#7B1A1A', border: '#FED7D7' },
    'Not Rated':      { bg: '#F7FAFC', color: '#718096', border: '#CBD5E0' },
  }
  const s = styles[rating]
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      🛡️ {rating}
    </span>
  )
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 10, marginBottom: 8,
      background: '#FAFBFC', border: '1px solid #E2E8F0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{review.author}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>{review.company} · {review.date}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <Stars rating={review.rating} />
          {review.recommended
            ? <span style={{ fontSize: 10, color: '#38A169', fontWeight: 600 }}>👍 Recommends</span>
            : <span style={{ fontSize: 10, color: '#E53E3E', fontWeight: 600 }}>👎 Not Recommended</span>}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.5, marginBottom: 6 }}>
        "{review.text}"
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 10,
          background: '#EBF8FF', color: '#2D7A9A', border: '1px solid #BEE3F8',
        }}>{review.loadType}</span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 10,
          background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0',
        }}>🗺️ {review.lane}</span>
      </div>
    </div>
  )
}

// ─── Full Scorecard ───────────────────────────────────────────────────────────
function CarrierScorecard({ carrier, compact = false }: { carrier: Carrier; compact?: boolean }) {
  const [tab, setTab] = useState<'overview' | 'trends' | 'reviews'>('overview')
  const score = calcScore(carrier)
  const g = scoreGrade(score)

  const onTimeArr     = carrier.monthly.map(m => m.onTime)
  const damageArr     = carrier.monthly.map(m => m.damageRate)
  const responseArr   = carrier.monthly.map(m => m.responseMin)
  const acceptArr     = carrier.monthly.map(m => m.acceptRate)

  const onTimeTrend:   TrendDir = onTimeArr[5]   > onTimeArr[0]   + 0.5 ? 'up'   : onTimeArr[5]   < onTimeArr[0]   - 0.5 ? 'down' : 'flat'
  const damageTrend:   TrendDir = damageArr[5]   < damageArr[0]   - 0.03 ? 'up'  : damageArr[5]   > damageArr[0]   + 0.03 ? 'down' : 'flat'
  const responseTrend: TrendDir = responseArr[5] < responseArr[0] - 2 ? 'up'     : responseArr[5] > responseArr[0] + 2 ? 'down'    : 'flat'
  const acceptTrend:   TrendDir = acceptArr[5]   > acceptArr[0]   + 0.5 ? 'up'   : acceptArr[5]   < acceptArr[0]   - 0.5 ? 'down' : 'flat'

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'trends',   label: '📈 6-Month Trends' },
    { id: 'reviews',  label: `⭐ Reviews (${carrier.reviewCount.toLocaleString()})` },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: compact ? '14px 16px 10px' : '18px 20px 14px',
        background: 'linear-gradient(135deg, #1A2535 0%, #2D3F55 100%)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
          {/* Score gauge */}
          <div style={{
            background: 'rgba(255,255,255,.08)', borderRadius: 12,
            padding: '6px 8px', flexShrink: 0,
          }}>
            <ScoreGauge score={score} />
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: compact ? 16 : 19, fontWeight: 800, color: '#fff', marginBottom: 3 }}>
              {carrier.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>
              {carrier.mc} · {carrier.dot} · {carrier.city}, {carrier.state}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <SafetyBadge rating={carrier.safetyRating} />
              {carrier.authorityTypes.map(a => (
                <span key={a} style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                  background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.85)',
                }}>{a}</span>
              ))}
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.85)',
              }}>💰 ${carrier.insuranceCoverage}M Ins.</span>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Tractors', value: carrier.tractors.toLocaleString() },
                { label: 'Drivers',  value: carrier.drivers.toLocaleString() },
                { label: 'Years',    value: String(carrier.yearsInBusiness) },
                { label: 'Loads/90d', value: carrier.loadsLast90.toLocaleString() },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#4BAED4' }}>{item.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: .5 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {carrier.badges.map(b => (
            <span key={b} style={{
              padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700,
              background: 'rgba(75,174,212,.25)', color: '#BEE3F8',
              border: '1px solid rgba(75,174,212,.35)',
            }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{
            flex: 1, padding: '10px 8px', background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #4BAED4' : '2px solid transparent',
            color: tab === t.id ? '#4BAED4' : '#718096',
            fontWeight: tab === t.id ? 700 : 400,
            fontSize: 12, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: compact ? '12px' : '16px 20px' }}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Score breakdown */}
            <div style={{
              padding: '12px 14px', background: g.bg,
              border: `1px solid ${g.color}33`, borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: g.color }}>{score}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: g.color }}>Overall Score — {g.grade}</div>
                <div style={{ fontSize: 11, color: g.color, opacity: .8 }}>
                  Based on on-time, damage, response, acceptance & reviews
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <MetricBox icon="⏱️" label="On-Time Delivery" value={`${carrier.onTimePercent.toFixed(1)}%`}
                sub={`${carrier.loadsLast90} loads last 90d`}
                trend={onTimeTrend} trendData={onTimeArr} good={true} />
              <MetricBox icon="📦" label="Damage Claims" value={`${carrier.damageRate.toFixed(2)}`}
                sub="per 100 loads"
                trend={damageTrend} trendData={damageArr} good={false} />
              <MetricBox icon="⚡" label="Avg Response Time" value={carrier.avgResponseMin >= 60
                ? `${(carrier.avgResponseMin/60).toFixed(1)}hr` : `${carrier.avgResponseMin}min`}
                sub="to load booking request"
                trend={responseTrend} trendData={responseArr} good={false} />
              <MetricBox icon="✅" label="Acceptance Rate" value={`${carrier.acceptanceRate}%`}
                sub="loads accepted / offered"
                trend={acceptTrend} trendData={acceptArr} good={true} />
            </div>

            {/* Review summary */}
            <div style={{
              padding: '12px 14px', background: '#FFFBEB',
              border: '1px solid #FBD38D', borderRadius: 12,
              display: 'flex', gap: 16, alignItems: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#7B4F1A' }}>
                  {carrier.reviewScore.toFixed(1)}
                </div>
                <Stars rating={carrier.reviewScore} size={16} />
                <div style={{ fontSize: 10, color: '#A0522D', marginTop: 2 }}>
                  {carrier.reviewCount.toLocaleString()} reviews
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[5,4,3,2,1].map(stars => {
                  const count = carrier.reviews.filter(r => Math.round(r.rating) === stars).length
                  const pct = carrier.reviews.length > 0 ? count / carrier.reviews.length * 100 : 0
                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: '#718096', width: 12, textAlign: 'right' }}>{stars}</span>
                      <span style={{ fontSize: 11, color: '#F6AD55' }}>★</span>
                      <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#F6AD55', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, color: '#718096', width: 24, textAlign: 'right' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 8 }}>Equipment Types</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {carrier.equipment.map(eq => (
                  <span key={eq} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: '#EBF8FF', color: '#2D7A9A', border: '1px solid #BEE3F8',
                  }}>🚛 {eq}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 6-Month Trends ── */}
        {tab === 'trends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'On-Time Delivery %', data: onTimeArr, unit: '%', color: '#4BAED4', good: true },
              { label: 'Damage Claims per 100 Loads', data: damageArr, unit: '', color: '#FC8181', good: false },
              { label: 'Avg Response Time (min)', data: responseArr, unit: 'min', color: '#F6AD55', good: false },
              { label: 'Load Acceptance Rate %', data: acceptArr, unit: '%', color: '#38C770', good: true },
            ].map(chart => {
              const first = chart.data[0], last = chart.data[chart.data.length - 1]
              const improved = chart.good ? last > first + 0.3 : last < first - 0.03
              const worsened = chart.good ? last < first - 0.3 : last > first + 0.03

              return (
                <div key={chart.label} style={{
                  background: '#F7FAFC', borderRadius: 12, padding: '14px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{chart.label}</div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                      background: improved ? '#F0FFF4' : worsened ? '#FFF5F5' : '#F7FAFC',
                      color: improved ? '#276749' : worsened ? '#7B1A1A' : '#718096',
                      border: `1px solid ${improved ? '#9AE6B4' : worsened ? '#FED7D7' : '#E2E8F0'}`,
                    }}>
                      {improved ? '↑ Improving' : worsened ? '↓ Declining' : '→ Stable'}
                    </span>
                  </div>
                  {/* Bar chart */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
                    {chart.data.map((v, i) => {
                      const min = Math.min(...chart.data)
                      const max = Math.max(...chart.data)
                      const pct = (v - min) / (max - min || 1)
                      const barH = 20 + pct * 55
                      const isLast = i === chart.data.length - 1
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <div style={{ fontSize: 9, color: '#718096', fontWeight: isLast ? 700 : 400 }}>
                            {chart.unit === '%' ? v.toFixed(1) : v.toFixed(2)}
                          </div>
                          <div style={{
                            width: '80%', height: barH,
                            background: isLast ? chart.color : `${chart.color}66`,
                            borderRadius: '3px 3px 0 0',
                            border: isLast ? `2px solid ${chart.color}` : 'none',
                          }} />
                          <div style={{ fontSize: 9, color: '#A0AEC0' }}>
                            {carrier.monthly[i].month}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#718096' }}>
                    <span>Jan: <strong>{chart.data[0].toFixed(chart.unit === '%' ? 1 : 2)}{chart.unit}</strong></span>
                    <span>Jun: <strong style={{ color: improved ? '#276749' : worsened ? '#E53E3E' : '#1A2535' }}>
                      {chart.data[5].toFixed(chart.unit === '%' ? 1 : 2)}{chart.unit}
                    </strong></span>
                    <span>Δ: <strong style={{ color: improved ? '#276749' : worsened ? '#E53E3E' : '#718096' }}>
                      {(chart.data[5] - chart.data[0] > 0 ? '+' : '')}{(chart.data[5] - chart.data[0]).toFixed(chart.unit === '%' ? 1 : 2)}{chart.unit}
                    </strong></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Reviews ── */}
        {tab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>
                Recent Reviews ({carrier.reviews.length} shown of {carrier.reviewCount.toLocaleString()})
              </div>
              <div style={{ fontSize: 12, color: '#718096' }}>
                {carrier.reviews.filter(r => r.recommended).length}/{carrier.reviews.length} recommend
              </div>
            </div>
            {carrier.reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            <div style={{
              textAlign: 'center', padding: '12px', fontSize: 12, color: '#4BAED4',
              cursor: 'pointer', fontWeight: 600,
            }}>
              Load more reviews ({(carrier.reviewCount - carrier.reviews.length).toLocaleString()} more) →
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Compare Delta Cell ───────────────────────────────────────────────────────
function DeltaCell({
  labelA, labelB, valueA, valueB, higherIsBetter, unit = '',
}: {
  labelA: string; labelB: string
  valueA: number; valueB: number
  higherIsBetter: boolean; unit?: string
}) {
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA
  const diff = Math.abs(valueA - valueB)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center', gap: 8,
      padding: '10px 14px', borderBottom: '1px solid #F0F4F8',
    }}>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontSize: 15, fontWeight: 800,
          color: aWins ? '#276749' : bWins ? '#718096' : '#1A2535',
        }}>
          {valueA.toFixed(unit === '%' ? 1 : 2)}{unit}
        </span>
        {aWins && <span style={{ fontSize: 10, color: '#276749', marginLeft: 4 }}>✓</span>}
      </div>
      <div style={{ textAlign: 'center', minWidth: 80 }}>
        <div style={{ fontSize: 10, color: '#A0AEC0', marginBottom: 2 }}>{labelA}</div>
        <div style={{
          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
          background: diff < 0.01 ? '#F7FAFC' : aWins ? '#F0FFF4' : '#FFF5F5',
          color: diff < 0.01 ? '#718096' : aWins ? '#276749' : '#7B1A1A',
        }}>
          {diff < 0.01 ? '=' : `Δ ${diff.toFixed(unit === '%' ? 1 : 2)}${unit}`}
        </div>
        <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{labelB}</div>
      </div>
      <div style={{ textAlign: 'left' }}>
        {bWins && <span style={{ fontSize: 10, color: '#276749', marginRight: 4 }}>✓</span>}
        <span style={{
          fontSize: 15, fontWeight: 800,
          color: bWins ? '#276749' : aWins ? '#718096' : '#1A2535',
        }}>
          {valueB.toFixed(unit === '%' ? 1 : 2)}{unit}
        </span>
      </div>
    </div>
  )
}

// ─── Compare Panel ────────────────────────────────────────────────────────────
function ComparePanel({ a, b }: { a: Carrier; b: Carrier }) {
  const scoreA = calcScore(a), scoreB = calcScore(b)

  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
      overflow: 'hidden', marginTop: 12,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', background: '#1A2535', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>⚖️</span>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Side-by-Side Comparison</span>
      </div>

      {/* Score row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        padding: '16px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0',
        alignItems: 'center', gap: 8,
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>{a.name}</div>
          <div style={{
            fontSize: 32, fontWeight: 900,
            color: scoreA >= scoreB ? '#276749' : '#718096',
          }}>{scoreA}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>{scoreGrade(scoreA).grade}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 20, color: '#CBD5E0', fontWeight: 700 }}>vs</div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: '#718096', marginBottom: 4 }}>{b.name}</div>
          <div style={{
            fontSize: 32, fontWeight: 900,
            color: scoreB >= scoreA ? '#276749' : '#718096',
          }}>{scoreB}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>{scoreGrade(scoreB).grade}</div>
        </div>
      </div>

      {/* Metric deltas */}
      <div style={{ padding: '8px 0' }}>
        <div style={{ padding: '6px 14px 8px', fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: .5 }}>
          Key Metrics
        </div>
        <DeltaCell labelA={a.name.split(' ')[0]} labelB={b.name.split(' ')[0]}
          valueA={a.onTimePercent} valueB={b.onTimePercent} higherIsBetter={true} unit="%" />
        <DeltaCell labelA={a.name.split(' ')[0]} labelB={b.name.split(' ')[0]}
          valueA={a.damageRate} valueB={b.damageRate} higherIsBetter={false} unit="" />
        <DeltaCell labelA={a.name.split(' ')[0]} labelB={b.name.split(' ')[0]}
          valueA={a.avgResponseMin} valueB={b.avgResponseMin} higherIsBetter={false} unit="min" />
        <DeltaCell labelA={a.name.split(' ')[0]} labelB={b.name.split(' ')[0]}
          valueA={a.acceptanceRate} valueB={b.acceptanceRate} higherIsBetter={true} unit="%" />
        <DeltaCell labelA={a.name.split(' ')[0]} labelB={b.name.split(' ')[0]}
          valueA={a.reviewScore} valueB={b.reviewScore} higherIsBetter={true} unit="" />
      </div>

      {/* Verdict */}
      <div style={{ padding: '12px 16px', background: '#F7FAFC', borderTop: '1px solid #E2E8F0' }}>
        {scoreA !== scoreB ? (
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: '#F0FFF4', border: '1px solid #9AE6B4',
          }}>
            <span style={{ fontWeight: 700, color: '#276749', fontSize: 13 }}>
              🏆 {scoreA > scoreB ? a.name : b.name} scores higher
            </span>
            <span style={{ fontSize: 12, color: '#38A169', marginLeft: 6 }}>
              by {Math.abs(scoreA - scoreB)} points overall
            </span>
          </div>
        ) : (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#EBF8FF', border: '1px solid #BEE3F8' }}>
            <span style={{ fontWeight: 700, color: '#2D7A9A', fontSize: 13 }}>⚖️ Carriers are evenly matched</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Carrier List Item ────────────────────────────────────────────────────────
function CarrierListItem({
  carrier, isSelected, isPrimary, isCompare, onSelect, onCompare,
}: {
  carrier: Carrier
  isSelected: boolean
  isPrimary: boolean
  isCompare: boolean
  onSelect: () => void
  onCompare: () => void
}) {
  const score = calcScore(carrier)
  const g = scoreGrade(score)

  return (
    <div style={{
      padding: '10px 12px', borderBottom: '1px solid #F0F4F8', cursor: 'pointer',
      background: isSelected ? '#EBF8FF' : '#fff',
      borderLeft: `3px solid ${isPrimary ? '#4BAED4' : isCompare ? '#F6AD55' : 'transparent'}`,
    }}
      onClick={onSelect}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
          {carrier.name}
        </div>
        <span style={{
          padding: '2px 7px', borderRadius: 10, fontSize: 11, fontWeight: 800,
          background: g.bg, color: g.color, flexShrink: 0,
        }}>{score} {g.grade}</span>
      </div>
      <div style={{ fontSize: 10, color: '#718096', marginBottom: 5 }}>
        {carrier.city}, {carrier.state} · {carrier.tractors.toLocaleString()} trucks
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#4A5568' }}>⏱ {carrier.onTimePercent.toFixed(0)}%</span>
        <span style={{ fontSize: 10, color: '#4A5568' }}>⚡ {carrier.avgResponseMin}min</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={e => { e.stopPropagation(); onCompare() }}
          style={{
            padding: '2px 8px', fontSize: 10, fontWeight: 600, cursor: 'pointer',
            background: isCompare ? '#FFFBEB' : '#F7FAFC',
            border: `1px solid ${isCompare ? '#F6AD55' : '#E2E8F0'}`,
            color: isCompare ? '#7B4F1A' : '#718096', borderRadius: 8,
          }}
        >
          {isCompare ? '⚖️ Compare' : '+ Compare'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CarrierScorecardPage({ role: _role }: { role: UserRole }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string>('jbhunt')
  const [compareId, setCompareId]   = useState<string | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [sortBy, setSortBy] = useState<'score' | 'ontime' | 'name'>('score')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let list = CARRIERS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.mc.toLowerCase().includes(q)
    )
    if (sortBy === 'score') list = list.sort((a, b) => calcScore(b) - calcScore(a))
    else if (sortBy === 'ontime') list = list.sort((a, b) => b.onTimePercent - a.onTimePercent)
    else list = list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [search, sortBy])

  const selected  = CARRIERS.find(c => c.id === selectedId)!
  const compareTo = CARRIERS.find(c => c.id === compareId)

  return (
    <div style={{ display: 'flex', height: '100%', background: '#F7FAFC', overflow: 'hidden' }}>

      {/* ── Left: carrier list ── */}
      <div style={{
        width: 270, flexShrink: 0, borderRight: '1px solid #E2E8F0',
        background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535', marginBottom: 8 }}>
            🏅 Carrier Directory
          </div>
          {/* Search */}
          <input
            placeholder="Search carrier, MC#, city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 10px',
              border: '1px solid #CBD5E0', borderRadius: 8, fontSize: 12,
              outline: 'none', fontFamily: 'inherit', marginBottom: 8,
            }}
          />
          {/* Sort */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['score', 'ontime', 'name'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                flex: 1, padding: '4px 4px', fontSize: 10, fontWeight: sortBy === s ? 700 : 400,
                background: sortBy === s ? '#4BAED4' : '#F7FAFC',
                border: `1px solid ${sortBy === s ? '#4BAED4' : '#E2E8F0'}`,
                color: sortBy === s ? '#fff' : '#718096', borderRadius: 6, cursor: 'pointer',
              }}>
                {s === 'score' ? '📊 Score' : s === 'ontime' ? '⏱ On-Time' : '🔤 Name'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(c => (
            <CarrierListItem
              key={c.id}
              carrier={c}
              isSelected={c.id === selectedId || c.id === compareId}
              isPrimary={c.id === selectedId}
              isCompare={c.id === compareId}
              onSelect={() => { setSelectedId(c.id); setShowCompare(false) }}
              onCompare={() => {
                if (c.id === selectedId) return
                if (compareId === c.id) { setCompareId(null); setShowCompare(false) }
                else { setCompareId(c.id); setShowCompare(true) }
              }}
            />
          ))}
        </div>

        {/* Compare CTA */}
        {compareId && (
          <div style={{ padding: '10px 12px', borderTop: '1px solid #E2E8F0', background: '#FFFBEB' }}>
            <button
              onClick={() => setShowCompare(!showCompare)}
              style={{
                width: '100%', padding: '9px', background: '#F6AD55',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: '#7B4F1A',
              }}
            >
              ⚖️ {showCompare ? 'Hide' : 'Show'} Comparison
            </button>
          </div>
        )}
      </div>

      {/* ── Main: scorecard(s) ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {showCompare && compareTo ? (
          /* Compare layout */
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Two scorecards */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', gap: 0 }}>
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid #E2E8F0' }}>
                <CarrierScorecard carrier={selected} compact={true} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <CarrierScorecard carrier={compareTo} compact={true} />
              </div>
            </div>
            {/* Compare delta panel */}
            <div style={{ borderTop: '1px solid #E2E8F0', padding: '0 16px 16px', overflowY: 'auto', maxHeight: 280, background: '#fff' }}>
              <ComparePanel a={selected} b={compareTo} />
            </div>
          </div>
        ) : (
          /* Single scorecard */
          <CarrierScorecard carrier={selected} />
        )}
      </div>
    </div>
  )
}
