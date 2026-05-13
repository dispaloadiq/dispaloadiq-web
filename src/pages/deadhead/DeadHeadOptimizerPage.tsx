import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ── Data models ────────────────────────────────────────────────────────────────

interface TruckPosition {
  city: string
  state: string
  availableDate: string
  truckType: 'Dry Van' | 'Reefer' | 'Flatbed' | 'Hotshot'
  currentMiles: number
}

interface NearbyLoad {
  id: string
  pickupCity: string
  pickupState: string
  deliveryCity: string
  deliveryState: string
  deadheadMiles: number
  loadedMiles: number
  totalMiles: number
  deadheadRatio: number
  rate: number
  payout: number
  netPerMile: number
  broker: string
  brokerRating: number
  brokerPayDays: number
  brokerCredit: 'A+' | 'A' | 'B+' | 'B' | 'C'
  pickupDate: string
  hoursToPickup: number
  loadType: 'Dry Van' | 'Reefer' | 'Flatbed' | 'Hotshot'
  weight: string
  commodity: string
  aiScore: number
  efficiencyGrade: 'A+' | 'A' | 'B' | 'C' | 'D'
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const CURRENT_POSITION: TruckPosition = {
  city: 'Dallas',
  state: 'TX',
  availableDate: 'May 14, 2024 — 09:00',
  truckType: 'Dry Van',
  currentMiles: 8420,
}

const NEARBY_LOADS: NearbyLoad[] = [
  {
    id: 'L-4821', pickupCity: 'Dallas',       pickupState: 'TX', deliveryCity: 'Atlanta',       deliveryState: 'GA',
    deadheadMiles: 8,   loadedMiles: 781,  totalMiles: 789,  deadheadRatio: 1.0,
    rate: 2.24, payout: 1749, netPerMile: 2.22, broker: 'Echo Global',       brokerRating: 4.6, brokerPayDays: 28, brokerCredit: 'A+',
    pickupDate: 'May 14', hoursToPickup: 0.2, loadType: 'Dry Van',  weight: '40,000 lbs', commodity: 'General Freight', aiScore: 97, efficiencyGrade: 'A+',
  },
  {
    id: 'L-4892', pickupCity: 'Fort Worth',   pickupState: 'TX', deliveryCity: 'Nashville',     deliveryState: 'TN',
    deadheadMiles: 32,  loadedMiles: 660,  totalMiles: 692,  deadheadRatio: 4.8,
    rate: 2.31, payout: 1524, netPerMile: 2.20, broker: 'TQL',               brokerRating: 4.4, brokerPayDays: 35, brokerCredit: 'A',
    pickupDate: 'May 14', hoursToPickup: 0.5, loadType: 'Dry Van',  weight: '38,000 lbs', commodity: 'Auto Parts',      aiScore: 93, efficiencyGrade: 'A+',
  },
  {
    id: 'L-5011', pickupCity: 'Arlington',    pickupState: 'TX', deliveryCity: 'Kansas City',   deliveryState: 'MO',
    deadheadMiles: 22,  loadedMiles: 490,  totalMiles: 512,  deadheadRatio: 4.5,
    rate: 2.08, payout: 1019, netPerMile: 1.99, broker: 'Coyote Logistics',  brokerRating: 4.8, brokerPayDays: 21, brokerCredit: 'A+',
    pickupDate: 'May 14', hoursToPickup: 0.4, loadType: 'Dry Van',  weight: '35,000 lbs', commodity: 'Retail',          aiScore: 88, efficiencyGrade: 'A',
  },
  {
    id: 'L-4773', pickupCity: 'Mesquite',     pickupState: 'TX', deliveryCity: 'Chicago',       deliveryState: 'IL',
    deadheadMiles: 14,  loadedMiles: 920,  totalMiles: 934,  deadheadRatio: 1.5,
    rate: 2.30, payout: 2116, netPerMile: 2.26, broker: 'CH Robinson',       brokerRating: 4.9, brokerPayDays: 21, brokerCredit: 'A+',
    pickupDate: 'May 15', hoursToPickup: 0.3, loadType: 'Dry Van',  weight: '43,000 lbs', commodity: 'Electronics',     aiScore: 95, efficiencyGrade: 'A+',
  },
  {
    id: 'L-4901', pickupCity: 'Garland',      pickupState: 'TX', deliveryCity: 'Memphis',       deliveryState: 'TN',
    deadheadMiles: 18,  loadedMiles: 452,  totalMiles: 470,  deadheadRatio: 4.0,
    rate: 2.15, payout: 972,  netPerMile: 2.07, broker: 'Worldwide Express',  brokerRating: 4.3, brokerPayDays: 42, brokerCredit: 'B+',
    pickupDate: 'May 14', hoursToPickup: 0.3, loadType: 'Dry Van',  weight: '36,000 lbs', commodity: 'Consumer Goods',  aiScore: 82, efficiencyGrade: 'A',
  },
  {
    id: 'L-5102', pickupCity: 'Irving',       pickupState: 'TX', deliveryCity: 'Houston',       deliveryState: 'TX',
    deadheadMiles: 20,  loadedMiles: 240,  totalMiles: 260,  deadheadRatio: 8.3,
    rate: 2.45, payout: 588,  netPerMile: 2.26, broker: 'FreightWise',        brokerRating: 4.6, brokerPayDays: 21, brokerCredit: 'A',
    pickupDate: 'May 14', hoursToPickup: 0.3, loadType: 'Hotshot', weight: '9,500 lbs',  commodity: 'Medical Supplies', aiScore: 79, efficiencyGrade: 'B',
  },
  {
    id: 'L-4655', pickupCity: 'Waco',         pickupState: 'TX', deliveryCity: 'Denver',        deliveryState: 'CO',
    deadheadMiles: 95,  loadedMiles: 820,  totalMiles: 915,  deadheadRatio: 11.6,
    rate: 2.28, payout: 1870, netPerMile: 2.04, broker: 'Arrive Logistics',   brokerRating: 4.5, brokerPayDays: 28, brokerCredit: 'A',
    pickupDate: 'May 15', hoursToPickup: 1.5, loadType: 'Dry Van',  weight: '41,000 lbs', commodity: 'Manufacturing',   aiScore: 84, efficiencyGrade: 'A',
  },
  {
    id: 'L-4488', pickupCity: 'Denton',       pickupState: 'TX', deliveryCity: 'Oklahoma City', deliveryState: 'OK',
    deadheadMiles: 40,  loadedMiles: 200,  totalMiles: 240,  deadheadRatio: 20.0,
    rate: 2.55, payout: 510,  netPerMile: 2.13, broker: 'Transplace',         brokerRating: 4.6, brokerPayDays: 28, brokerCredit: 'A',
    pickupDate: 'May 14', hoursToPickup: 0.7, loadType: 'Dry Van',  weight: '32,000 lbs', commodity: 'Agriculture',     aiScore: 71, efficiencyGrade: 'B',
  },
  {
    id: 'L-5234', pickupCity: 'Corsicana',    pickupState: 'TX', deliveryCity: 'New Orleans',   deliveryState: 'LA',
    deadheadMiles: 58,  loadedMiles: 490,  totalMiles: 548,  deadheadRatio: 11.8,
    rate: 2.19, payout: 1073, netPerMile: 1.96, broker: 'Odyssey Logistics',  brokerRating: 4.2, brokerPayDays: 35, brokerCredit: 'B+',
    pickupDate: 'May 15', hoursToPickup: 1.0, loadType: 'Flatbed', weight: '44,000 lbs', commodity: 'Steel',           aiScore: 76, efficiencyGrade: 'B',
  },
  {
    id: 'L-4312', pickupCity: 'Sherman',      pickupState: 'TX', deliveryCity: 'St. Louis',     deliveryState: 'MO',
    deadheadMiles: 72,  loadedMiles: 630,  totalMiles: 702,  deadheadRatio: 11.4,
    rate: 2.22, payout: 1398, netPerMile: 1.99, broker: 'Redwood Logistics',  brokerRating: 4.5, brokerPayDays: 28, brokerCredit: 'A',
    pickupDate: 'May 15', hoursToPickup: 1.2, loadType: 'Reefer',  weight: '40,000 lbs', commodity: 'Frozen Foods',    aiScore: 80, efficiencyGrade: 'A',
  },
  {
    id: 'L-5388', pickupCity: 'Abilene',      pickupState: 'TX', deliveryCity: 'Phoenix',       deliveryState: 'AZ',
    deadheadMiles: 152, loadedMiles: 730,  totalMiles: 882,  deadheadRatio: 20.8,
    rate: 2.35, payout: 1716, netPerMile: 1.95, broker: 'XPO Logistics',     brokerRating: 4.7, brokerPayDays: 14, brokerCredit: 'A+',
    pickupDate: 'May 15', hoursToPickup: 2.4, loadType: 'Dry Van',  weight: '39,000 lbs', commodity: 'Consumer Goods',  aiScore: 72, efficiencyGrade: 'B',
  },
  {
    id: 'L-4199', pickupCity: 'Lubbock',      pickupState: 'TX', deliveryCity: 'Albuquerque',   deliveryState: 'NM',
    deadheadMiles: 198, loadedMiles: 320,  totalMiles: 518,  deadheadRatio: 61.9,
    rate: 2.68, payout: 858,  netPerMile: 1.66, broker: 'Echo Global',        brokerRating: 4.6, brokerPayDays: 28, brokerCredit: 'A+',
    pickupDate: 'May 16', hoursToPickup: 3.2, loadType: 'Dry Van',  weight: '28,000 lbs', commodity: 'Retail',          aiScore: 55, efficiencyGrade: 'C',
  },
  {
    id: 'L-4044', pickupCity: 'Wichita Falls', pickupState: 'TX', deliveryCity: 'Kansas City',  deliveryState: 'MO',
    deadheadMiles: 135, loadedMiles: 480,  totalMiles: 615,  deadheadRatio: 28.1,
    rate: 2.14, payout: 1027, netPerMile: 1.67, broker: 'Coyote Logistics',   brokerRating: 4.8, brokerPayDays: 21, brokerCredit: 'A+',
    pickupDate: 'May 15', hoursToPickup: 2.2, loadType: 'Flatbed', weight: '42,000 lbs', commodity: 'Construction',    aiScore: 63, efficiencyGrade: 'C',
  },
  {
    id: 'L-3901', pickupCity: 'Tyler',        pickupState: 'TX', deliveryCity: 'Charlotte',     deliveryState: 'NC',
    deadheadMiles: 89,  loadedMiles: 1100, totalMiles: 1189, deadheadRatio: 8.1,
    rate: 2.41, payout: 2651, netPerMile: 2.23, broker: 'CH Robinson',        brokerRating: 4.9, brokerPayDays: 21, brokerCredit: 'A+',
    pickupDate: 'May 15', hoursToPickup: 1.4, loadType: 'Dry Van',  weight: '44,000 lbs', commodity: 'Electronics',     aiScore: 91, efficiencyGrade: 'A+',
  },
]

// ── Weekly history data for the chart ─────────────────────────────────────────

interface WeekData {
  week: string
  loadedMiles: number
  deadheadMiles: number
  dhPct: number
}

const WEEKLY_HISTORY: WeekData[] = [
  { week: 'Wk 1',  loadedMiles: 2100, deadheadMiles: 310, dhPct: 14.8 },
  { week: 'Wk 2',  loadedMiles: 1850, deadheadMiles: 280, dhPct: 15.1 },
  { week: 'Wk 3',  loadedMiles: 2340, deadheadMiles: 220, dhPct: 9.4  },
  { week: 'Wk 4',  loadedMiles: 1980, deadheadMiles: 195, dhPct: 9.8  },
  { week: 'Wk 5',  loadedMiles: 2200, deadheadMiles: 310, dhPct: 14.1 },
  { week: 'Wk 6',  loadedMiles: 2450, deadheadMiles: 185, dhPct: 7.6  },
  { week: 'Wk 7',  loadedMiles: 2100, deadheadMiles: 145, dhPct: 6.9  },
  { week: 'Wk 8',  loadedMiles: 2310, deadheadMiles: 140, dhPct: 6.1  },
]

// ── Helper functions ───────────────────────────────────────────────────────────

function getDHColor(ratio: number): string {
  if (ratio < 10) return '#22C55E'
  if (ratio < 20) return '#14B8A6'
  if (ratio < 30) return '#F59E0B'
  return '#EF4444'
}

function getDHLabel(ratio: number): string {
  if (ratio < 10) return 'Excellent'
  if (ratio < 20) return 'Good'
  if (ratio < 30) return 'Average'
  return 'Poor'
}

function getGradeColor(grade: string): string {
  if (grade === 'A+') return '#22C55E'
  if (grade === 'A')  return '#14B8A6'
  if (grade === 'B')  return '#F59E0B'
  if (grade === 'C')  return '#EF4444'
  return '#9CA3AF'
}

function getAIScoreColor(score: number): string {
  if (score >= 90) return '#22C55E'
  if (score >= 75) return '#14B8A6'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} min`
  return `${h.toFixed(1)} hrs`
}

function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.3 ? 1 : 0
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function RouteBar({ deadheadMiles, loadedMiles, totalMiles, height = 20 }: {
  deadheadMiles: number; loadedMiles: number; totalMiles: number; height?: number
}) {
  const dhPct = (deadheadMiles / totalMiles) * 100
  const ldPct = (loadedMiles / totalMiles) * 100
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', height, borderRadius: 6, overflow: 'hidden', background: '#E2E8F0' }}>
        <div style={{ width: `${dhPct}%`, background: '#F97316', minWidth: deadheadMiles > 0 ? 4 : 0 }} />
        <div style={{ width: `${ldPct}%`, background: 'var(--c-primary)', minWidth: 4 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#6B7280' }}>
        <span style={{ color: '#F97316', fontWeight: 600 }}>{deadheadMiles} mi empty</span>
        <span style={{ color: 'var(--c-primary)', fontWeight: 600 }}>{loadedMiles} mi loaded</span>
      </div>
    </div>
  )
}

function AIScoreGauge({ score }: { score: number }) {
  const color = getAIScoreColor(score)
  const pct = score / 100
  // SVG semicircle gauge
  const r = 32
  const cx = 40
  const cy = 40
  const circumference = Math.PI * r
  const offset = circumference * (1 - pct)
  return (
    <svg width="80" height="50" viewBox="0 0 80 50">
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#9CA3AF">AI Score</text>
    </svg>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 20px',
      border: '1px solid var(--c-divider)', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color ?? 'var(--c-dark)', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Load card (list item) ──────────────────────────────────────────────────────

function LoadCard({ load, selected, onClick }: { load: NearbyLoad; selected: boolean; onClick: () => void }) {
  const dhColor = getDHColor(load.deadheadRatio)
  const gradeColor = getGradeColor(load.efficiencyGrade)
  const aiColor = getAIScoreColor(load.aiScore)

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: `2px solid ${selected ? 'var(--c-primary)' : 'var(--c-divider)'}`,
        borderRadius: 14,
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(75,174,212,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: 10,
      }}
    >
      {/* Row 1: badges + meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {/* Grade badge */}
        <span style={{
          background: gradeColor, color: '#fff', fontSize: 11, fontWeight: 800,
          borderRadius: 6, padding: '2px 8px', letterSpacing: '0.03em',
        }}>
          {load.efficiencyGrade}
        </span>
        {/* DH ratio badge */}
        <span style={{
          background: dhColor + '20', color: dhColor, fontSize: 11, fontWeight: 700,
          borderRadius: 6, padding: '2px 8px',
        }}>
          {load.deadheadRatio.toFixed(1)}% DH · {getDHLabel(load.deadheadRatio)}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⏱ {formatHours(load.hoursToPickup)} to pickup
        </span>
        {/* AI score circle */}
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: aiColor + '20', color: aiColor,
          fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${aiColor}`,
        }}>
          {load.aiScore}
        </span>
      </div>

      {/* Row 2: ID + type + broker */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark)' }}>{load.id}</span>
        <span style={{ fontSize: 12, color: '#6B7280' }}>{load.loadType} · {load.broker}</span>
      </div>

      {/* Row 3: Route */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)', marginBottom: 10 }}>
        {load.pickupCity}, {load.pickupState}
        <span style={{ color: 'var(--c-primary)', margin: '0 8px' }}>→</span>
        {load.deliveryCity}, {load.deliveryState}
      </div>

      {/* Route bar */}
      <RouteBar deadheadMiles={load.deadheadMiles} loadedMiles={load.loadedMiles} totalMiles={load.totalMiles} height={16} />

      {/* Row 4: financial */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>RATE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>${load.rate.toFixed(2)}/mi</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>PAYOUT</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>${load.payout.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>NET $/MI</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-primary)' }}>${load.netPerMile.toFixed(2)}</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>Pickup {load.pickupDate}</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            ★{load.brokerRating} ·{' '}
            <span style={{
              background: getGradeColor(load.brokerCredit) + '20',
              color: getGradeColor(load.brokerCredit),
              borderRadius: 4, padding: '1px 5px', fontSize: 10, fontWeight: 700,
            }}>
              {load.brokerCredit}
            </span>
            {' '}· {load.brokerPayDays}d pay
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Detail panel ───────────────────────────────────────────────────────────────

function DetailPanel({ load }: { load: NearbyLoad }) {
  const dhColor = getDHColor(load.deadheadRatio)
  const gradeColor = getGradeColor(load.efficiencyGrade)
  const dhCost = (load.deadheadMiles * 0.60).toFixed(2)
  const netAfterDH = (load.payout - load.deadheadMiles * 0.60).toFixed(2)
  const marketRate = 2.18
  const vsMarket = load.netPerMile - marketRate
  const isSlowPayer = load.brokerPayDays > 35

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--c-divider)', overflow: 'hidden', height: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--c-dark)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{load.id}</span>
              <span style={{
                background: gradeColor, color: '#fff',
                fontSize: 12, fontWeight: 800, borderRadius: 6, padding: '2px 8px',
              }}>
                {load.efficiencyGrade}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
              {load.pickupCity}, {load.pickupState}
              <span style={{ color: 'var(--c-primary)', margin: '0 10px' }}>→</span>
              {load.deliveryCity}, {load.deliveryState}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {load.loadType} · {load.commodity}
            </div>
          </div>
          <AIScoreGauge score={load.aiScore} />
        </div>
        {/* Route bar large */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 16px' }}>
          <RouteBar deadheadMiles={load.deadheadMiles} loadedMiles={load.loadedMiles} totalMiles={load.totalMiles} height={20} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}>

        {/* Financial breakdown */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Financial Breakdown
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--c-divider)', fontSize: 14 }}>
              <span style={{ color: '#6B7280' }}>Gross payout</span>
              <span style={{ fontWeight: 600, color: 'var(--c-dark)' }}>${load.payout.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--c-divider)', fontSize: 13 }}>
              <span style={{ color: '#9CA3AF' }}>÷ Loaded miles ({load.loadedMiles} mi)</span>
              <span style={{ color: '#6B7280' }}>${load.rate.toFixed(2)}/mi</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '2px solid var(--c-divider)', fontSize: 14, fontWeight: 700 }}>
              <span style={{ color: 'var(--c-dark)' }}>True net/mi (incl. deadhead)</span>
              <span style={{ color: 'var(--c-primary)', fontSize: 16 }}>${load.netPerMile.toFixed(2)}/mi</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--c-divider)', fontSize: 13 }}>
              <span style={{ color: '#9CA3AF' }}>Deadhead cost ({load.deadheadMiles} mi × $0.60)</span>
              <span style={{ color: '#EF4444' }}>−${dhCost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--c-divider)', fontSize: 13 }}>
              <span style={{ color: '#6B7280' }}>Net after deadhead</span>
              <span style={{ fontWeight: 700, color: '#22C55E' }}>${netAfterDH}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 }}>
              <span style={{ color: '#6B7280' }}>vs. avg market rate (${marketRate.toFixed(2)}/mi)</span>
              <span style={{ fontWeight: 700, color: vsMarket >= 0 ? '#22C55E' : '#EF4444' }}>
                {vsMarket >= 0 ? '+' : ''}{vsMarket.toFixed(2)} {vsMarket >= 0 ? '✓ above' : '✗ below'}
              </span>
            </div>
          </div>
        </div>

        {/* Deadhead ratio */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Deadhead Efficiency
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: dhColor + '12', borderRadius: 10, padding: '12px 16px',
            border: `1px solid ${dhColor}30`,
          }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: dhColor }}>{load.deadheadRatio.toFixed(1)}%</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: dhColor }}>{getDHLabel(load.deadheadRatio)}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {load.deadheadMiles} empty mi / {load.loadedMiles} loaded mi
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 11, color: '#9CA3AF' }}>
              <div>Industry avg: ~15%</div>
              <div style={{ color: load.deadheadRatio < 15 ? '#22C55E' : '#F59E0B' }}>
                {load.deadheadRatio < 15 ? 'You beat average!' : 'Above average'}
              </div>
            </div>
          </div>
        </div>

        {/* Broker info */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Broker Info
          </div>
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>{load.broker}</div>
                <div style={{ fontSize: 13, color: '#F59E0B' }}>{renderStars(load.brokerRating)} {load.brokerRating}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{
                  background: getGradeColor(load.brokerCredit) + '20',
                  color: getGradeColor(load.brokerCredit),
                  borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 800,
                }}>
                  Credit {load.brokerCredit}
                </span>
                <span style={{
                  background: isSlowPayer ? '#FEF2F2' : '#F0FDF4',
                  color: isSlowPayer ? '#EF4444' : '#22C55E',
                  borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                }}>
                  {isSlowPayer ? '⚠ Slow Payer' : '✓ Always Pays'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              Payment terms: Net {load.brokerPayDays} days
            </div>
          </div>
        </div>

        {/* Load details */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Load Details
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            {[
              { label: 'Weight', value: load.weight },
              { label: 'Commodity', value: load.commodity },
              { label: 'Pickup Date', value: load.pickupDate },
              { label: 'Hours to Pickup', value: formatHours(load.hoursToPickup) },
              { label: 'Load Type', value: load.loadType },
              { label: 'Loaded Miles', value: `${load.loadedMiles.toLocaleString()} mi` },
              { label: 'Pickup', value: `${load.pickupCity}, ${load.pickupState}` },
              { label: 'Delivery', value: `${load.deliveryCity}, ${load.deliveryState}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-dark)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison note */}
        <div style={{
          background: 'rgba(75,174,212,0.08)', borderRadius: 10,
          padding: '12px 16px', marginBottom: 20,
          border: '1px solid rgba(75,174,212,0.2)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-primary)', marginBottom: 4 }}>
            Position Analysis
          </div>
          <div style={{ fontSize: 12, color: '#4B5563' }}>
            Estimated pickup arrival: {load.hoursToPickup < 0.5 ? '09:12 AM' : load.hoursToPickup < 1.5 ? '10:30 AM' : '11:45 AM'}
          </div>
          <div style={{ fontSize: 12, color: '#4B5563', marginTop: 4 }}>
            {load.deadheadMiles < 50
              ? `Excellent positioning — only ${load.deadheadMiles} empty miles needed`
              : `You could save ${Math.round(load.deadheadMiles * 0.4)} miles vs market avg position`}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{
            width: '100%', padding: '12px', background: 'var(--c-primary)',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Book This Load
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              flex: 1, padding: '10px', background: 'transparent',
              color: 'var(--c-primary)', border: '1.5px solid var(--c-primary)',
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Call Broker
            </button>
            <button style={{
              flex: 1, padding: '10px', background: 'transparent',
              color: '#6B7280', border: '1.5px solid var(--c-divider)',
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Watchlist
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Historical bar chart ────────────────────────────────────────────────────────

function HistoryChart({ data }: { data: WeekData[] }) {
  const maxTotal = Math.max(...data.map(d => d.loadedMiles + d.deadheadMiles))
  const chartH = 120
  const barW = 48
  const gap = 16
  const chartW = data.length * (barW + gap) - gap + 60
  const maxDhPct = Math.max(...data.map(d => d.dhPct))

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={chartW} height={chartH + 60} viewBox={`0 0 ${chartW} ${chartH + 60}`} style={{ minWidth: chartW }}>
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <line
            key={pct}
            x1={40} y1={chartH * (1 - pct)} x2={chartW} y2={chartH * (1 - pct)}
            stroke="#F0F4F8" strokeWidth={1}
          />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const x = 40 + i * (barW + gap)
          const loadedH = (d.loadedMiles / maxTotal) * chartH
          const dhH = (d.deadheadMiles / maxTotal) * chartH
          const totalH = loadedH + dhH
          return (
            <g key={d.week}>
              {/* loaded bar */}
              <rect
                x={x} y={chartH - totalH} width={barW} height={loadedH}
                fill="var(--c-primary)" rx={3}
              />
              {/* deadhead bar on top */}
              <rect
                x={x} y={chartH - totalH} width={barW} height={dhH}
                fill="#F97316" rx={3}
              />
              {/* week label */}
              <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize="11" fill="#9CA3AF">{d.week}</text>
              <text x={x + barW / 2} y={chartH + 30} textAnchor="middle" fontSize="10" fill="#F97316" fontWeight="600">{d.dhPct}%</text>
            </g>
          )
        })}
        {/* Trend line for DH% */}
        <polyline
          points={data.map((d, i) => {
            const x = 40 + i * (barW + gap) + barW / 2
            const y = chartH - (d.dhPct / maxDhPct) * chartH * 0.8
            return `${x},${y}`
          }).join(' ')}
          fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2"
        />
        {/* Legend */}
        <rect x={40} y={chartH + 44} width={12} height={8} fill="var(--c-primary)" rx={2} />
        <text x={56} y={chartH + 52} fontSize="10" fill="#6B7280">Loaded miles</text>
        <rect x={140} y={chartH + 44} width={12} height={8} fill="#F97316" rx={2} />
        <text x={156} y={chartH + 52} fontSize="10" fill="#6B7280">Deadhead miles</text>
        <line x1={240} y1={chartH + 48} x2={252} y2={chartH + 48} stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" />
        <text x={256} y={chartH + 52} fontSize="10" fill="#6B7280">DH% trend</text>
      </svg>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function DeadHeadOptimizerPage({ role }: { role: UserRole }) {
  const [radius, setRadius] = useState<number>(150)
  const [sortBy, setSortBy] = useState<'aiScore' | 'deadheadMiles' | 'netPerMile' | 'payout'>('aiScore')
  const [selectedId, setSelectedId] = useState<string | null>('L-4821')

  // Filter by radius (deadheadMiles as proxy for distance from current position)
  const filteredLoads = useMemo(() => {
    return NEARBY_LOADS.filter(l => l.deadheadMiles <= radius)
  }, [radius])

  // Sort
  const sortedLoads = useMemo(() => {
    return [...filteredLoads].sort((a, b) => {
      if (sortBy === 'aiScore')       return b.aiScore - a.aiScore
      if (sortBy === 'deadheadMiles') return a.deadheadMiles - b.deadheadMiles
      if (sortBy === 'netPerMile')    return b.netPerMile - a.netPerMile
      if (sortBy === 'payout')        return b.payout - a.payout
      return 0
    })
  }, [filteredLoads, sortBy])

  const selectedLoad = useMemo(() => sortedLoads.find(l => l.id === selectedId) ?? sortedLoads[0] ?? null, [sortedLoads, selectedId])

  // KPIs
  const kpiBestNet  = useMemo(() => filteredLoads.length ? Math.max(...filteredLoads.map(l => l.netPerMile)) : 0, [filteredLoads])
  const kpiAvgDH    = useMemo(() => filteredLoads.length ? Math.round(filteredLoads.reduce((s, l) => s + l.deadheadMiles, 0) / filteredLoads.length) : 0, [filteredLoads])
  const kpiBestAI   = useMemo(() => filteredLoads.length ? Math.max(...filteredLoads.map(l => l.aiScore)) : 0, [filteredLoads])

  const RADIUS_OPTIONS = [50, 100, 150, 200]
  const SORT_OPTIONS: { key: typeof sortBy; label: string }[] = [
    { key: 'aiScore',       label: 'AI Score' },
    { key: 'deadheadMiles', label: 'Deadhead Miles' },
    { key: 'netPerMile',    label: 'Net $/mi' },
    { key: 'payout',        label: 'Payout' },
  ]

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-dark)', margin: 0, lineHeight: 1.2 }}>
          Dead Head Optimizer
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '6px 0 0' }}>
          Minimize empty miles after delivery — find the next load with the best efficiency score
        </p>
      </div>

      {/* ── Current Position Card ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--c-dark)', borderRadius: 16, padding: '20px 24px',
        marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
                {CURRENT_POSITION.city}, {CURRENT_POSITION.state}
              </span>
              <span style={{
                background: 'rgba(75,174,212,0.2)', color: 'var(--c-primary)',
                borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 600,
              }}>
                Just Delivered
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
              Available: {CURRENT_POSITION.availableDate}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Truck: <span style={{ color: '#fff', fontWeight: 600 }}>{CURRENT_POSITION.truckType}</span>
              <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
              Monthly miles: <span style={{ color: '#fff', fontWeight: 600 }}>{CURRENT_POSITION.currentMiles.toLocaleString()}</span>
            </div>
          </div>
          <button style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Change Position
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          {/* Radius */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>SEARCH RADIUS:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {RADIUS_OPTIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  style={{
                    padding: '5px 12px', fontSize: 12, fontWeight: 700,
                    borderRadius: 20, cursor: 'pointer', border: 'none',
                    background: radius === r ? 'var(--c-primary)' : 'rgba(255,255,255,0.1)',
                    color: radius === r ? '#fff' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.15s',
                  }}
                >
                  {r} mi
                </button>
              ))}
            </div>
          </div>
          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>SORT BY:</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.key}
                  onClick={() => setSortBy(o.key)}
                  style={{
                    padding: '5px 12px', fontSize: 12, fontWeight: 700,
                    borderRadius: 20, cursor: 'pointer', border: 'none',
                    background: sortBy === o.key ? '#22C55E' : 'rgba(255,255,255,0.1)',
                    color: sortBy === o.key ? '#fff' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.15s',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <KpiCard label="Loads Found" value={`${filteredLoads.length}`} sub={`within ${radius} mi radius`} />
        <KpiCard label="Best Net $/mi" value={`$${kpiBestNet.toFixed(2)}`} sub="true earnings incl. deadhead" color="#22C55E" />
        <KpiCard label="Avg Deadhead" value={`${kpiAvgDH} mi`} sub="average empty miles" color="#F97316" />
        <KpiCard label="Best AI Score" value={`${kpiBestAI}`} sub="composite efficiency score" color="var(--c-primary)" />
      </div>

      {/* ── Main Split Layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, alignItems: 'flex-start' }}>

        {/* Left: load list (60%) */}
        <div style={{ flex: '0 0 60%', minWidth: 0 }}>
          {sortedLoads.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 14, border: '1px solid var(--c-divider)',
              padding: '48px 32px', textAlign: 'center', color: '#9CA3AF',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>No loads in this radius</div>
              <div style={{ fontSize: 13 }}>Try expanding your search radius</div>
            </div>
          ) : (
            sortedLoads.map(load => (
              <LoadCard
                key={load.id}
                load={load}
                selected={load.id === (selectedLoad?.id ?? null)}
                onClick={() => setSelectedId(load.id)}
              />
            ))
          )}
        </div>

        {/* Right: detail panel (40%) */}
        <div style={{ flex: '0 0 40%', minWidth: 0, position: 'sticky', top: 24 }}>
          {selectedLoad ? (
            <DetailPanel load={selectedLoad} />
          ) : (
            <div style={{
              background: '#fff', borderRadius: 16, border: '1px solid var(--c-divider)',
              padding: '48px 32px', textAlign: 'center', color: '#9CA3AF',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#4B5563' }}>Select a load to see details</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom: Stats & History ───────────────────────────────────────── */}

      {/* My Dead Head Stats */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-dark)', margin: '0 0 16px' }}>
          My Dead Head Stats — Last 30 Days
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Avg Deadhead Ratio" value="12.4%" sub="industry avg: 15%" color="#14B8A6" />
          <KpiCard label="Total Empty Miles" value="1,240 mi" sub="past 30 days" color="#F97316" />
          <KpiCard label="Cost of Empty Miles" value="$744" sub="@ $0.60/mi CPM" color="#EF4444" />
          <KpiCard label="Efficiency Trend" value="↑ Improving" sub="-2.7% vs prior month" color="#22C55E" />
        </div>
      </div>

      {/* Historical chart */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid var(--c-divider)',
        padding: '24px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-dark)', margin: 0 }}>
            Weekly Miles Breakdown — Last 8 Weeks
          </h3>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>Orange % = deadhead ratio that week</div>
        </div>
        <HistoryChart data={WEEKLY_HISTORY} />
      </div>

      {/* Smart Tips */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-dark)', margin: '0 0 16px' }}>
          Smart Tips
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {[
            {
              icon: '📍',
              title: 'Best Positioning Lanes',
              text: 'Your most efficient lanes start in TX — consider positioning near Dallas or Houston after each load for minimal empty miles.',
              color: 'var(--c-primary)',
            },
            {
              icon: '📈',
              title: 'High-Value Destinations',
              text: 'Loads to IL, GA, and FL from TX have the best RPM and lowest deadhead in your history. These lanes average $2.28/mi net.',
              color: '#22C55E',
            },
            {
              icon: '⚠️',
              title: 'Missed Opportunity Alert',
              text: 'You drove 198 empty miles last Tuesday. The Tyler→Charlotte load (L-3901) was available with only 89 DH miles and $2.23 net.',
              color: '#F59E0B',
            },
          ].map(tip => (
            <div key={tip.title} style={{
              background: '#fff', borderRadius: 14, border: '1px solid var(--c-divider)',
              padding: '18px 20px', borderLeft: `4px solid ${tip.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{tip.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>{tip.title}</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lane Performance Table */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-dark)', margin: '0 0 16px' }}>
          Top Lane Performance — Your History
        </h2>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--c-divider)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Origin', 'Destination', 'Avg DH Miles', 'Avg Net $/mi', 'Trips', 'DH Ratio'].map(col => (
                  <th key={col} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--c-divider)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { origin: 'Dallas, TX',   dest: 'Chicago, IL',     dh: 14,  net: 2.26, trips: 8,  ratio: 1.5  },
                { origin: 'Dallas, TX',   dest: 'Atlanta, GA',     dh: 8,   net: 2.22, trips: 11, ratio: 1.0  },
                { origin: 'Dallas, TX',   dest: 'Charlotte, NC',   dh: 89,  net: 2.23, trips: 5,  ratio: 8.1  },
                { origin: 'Dallas, TX',   dest: 'Nashville, TN',   dh: 32,  net: 2.20, trips: 7,  ratio: 4.8  },
                { origin: 'Dallas, TX',   dest: 'Denver, CO',      dh: 95,  net: 2.04, trips: 4,  ratio: 11.6 },
                { origin: 'Houston, TX',  dest: 'Atlanta, GA',     dh: 22,  net: 2.31, trips: 6,  ratio: 2.8  },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--c-divider)', background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--c-dark)' }}>{row.origin}</td>
                  <td style={{ padding: '10px 14px', color: '#4B5563' }}>{row.dest}</td>
                  <td style={{ padding: '10px 14px', color: '#F97316', fontWeight: 600 }}>{row.dh} mi</td>
                  <td style={{ padding: '10px 14px', color: '#22C55E', fontWeight: 700 }}>${row.net.toFixed(2)}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{row.trips}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: getDHColor(row.ratio), fontWeight: 700 }}>{row.ratio.toFixed(1)}%</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 6 }}>{getDHLabel(row.ratio)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-specific footer note */}
      {role === 'dispatcher' && (
        <div style={{
          background: 'rgba(75,174,212,0.08)', borderRadius: 12,
          border: '1px solid rgba(75,174,212,0.2)', padding: '14px 20px', marginTop: 20,
        }}>
          <div style={{ fontSize: 13, color: 'var(--c-primary)', fontWeight: 600, marginBottom: 4 }}>
            Dispatcher Mode
          </div>
          <div style={{ fontSize: 12, color: '#4B5563' }}>
            You are viewing dead head optimization on behalf of a client. Share load recommendations directly via the client portal.
          </div>
        </div>
      )}

    </div>
  )
}
