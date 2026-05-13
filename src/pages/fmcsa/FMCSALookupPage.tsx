import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SafetyRating = 'Satisfactory' | 'Conditional' | 'Unsatisfactory' | 'Not Rated';
type RiskLevel = 'Low' | 'Medium' | 'High';
type AuthorityStatus = 'Active' | 'Inactive';
type InsuranceStatus = 'On File' | 'Not On File' | 'Expired';
type TabKey = 'overview' | 'safety' | 'insurance' | 'inspections' | 'history';

interface InsurancePolicy {
  type: string;
  insurer: string;
  policyNumber: string;
  coverage: string;
  effective: string;
  expiry: string;
  status: InsuranceStatus;
}

interface Inspection {
  date: string;
  state: string;
  level: string;
  result: string;
  oos: boolean;
}

interface BasicScore {
  category: string;
  score: number;
  threshold: number;
  trend: 'up' | 'down' | 'flat';
}

interface AuthorityEvent {
  date: string;
  event: string;
  detail: string;
}

interface CarrierData {
  mcNumber: string;
  dotNumber: string;
  companyName: string;
  dbaName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  authorityStatus: AuthorityStatus;
  safetyRating: SafetyRating;
  issScore: number;
  ratingDate: string;
  operatingStatus: string;
  entityType: string;
  totalDrivers: number;
  totalTrucks: number;
  totalTrailers: number;
  insurance: {
    onFile: boolean;
    amount: string;
    insurer: string;
    expiry: string;
    status: InsuranceStatus;
  };
  cargoInsurance: {
    amount: string;
    insurer: string;
    status: InsuranceStatus;
  };
  bond: {
    amount: string;
    surety: string;
  };
  outOfService: {
    vehicles: number;
    drivers: number;
    hazmat: number;
  };
  inspections: {
    total: number;
    violations: number;
    oosRate: number;
    records: Inspection[];
  };
  basicScores: BasicScore[];
  policies: InsurancePolicy[];
  authorityHistory: AuthorityEvent[];
  riskLevel: RiskLevel;
  riskFactors: string[];
  recommendation: 'Yes' | 'Proceed with Caution' | 'No';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CARRIERS: Record<string, CarrierData> = {
  'MC-441892': {
    mcNumber: 'MC-441892',
    dotNumber: 'DOT-2181843',
    companyName: 'Swift Transportation Co.',
    dbaName: 'Swift Transport',
    address: '2200 S 75th Ave',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85043',
    phone: '(602) 269-9700',
    authorityStatus: 'Active',
    safetyRating: 'Satisfactory',
    issScore: 22,
    ratingDate: '2024-08-15',
    operatingStatus: 'Authorized For Property',
    entityType: 'Carrier',
    totalDrivers: 18500,
    totalTrucks: 22000,
    totalTrailers: 62000,
    insurance: { onFile: true, amount: '$1,000,000', insurer: 'Great West Casualty Co.', expiry: '2026-01-01', status: 'On File' },
    cargoInsurance: { amount: '$100,000', insurer: 'Great West Casualty Co.', status: 'On File' },
    bond: { amount: '$75,000', surety: 'Travelers Casualty & Surety' },
    outOfService: { vehicles: 4.2, drivers: 1.8, hazmat: 0.5 },
    inspections: {
      total: 847,
      violations: 163,
      oosRate: 8.7,
      records: [
        { date: '2025-11-14', state: 'AZ', level: 'Level I', result: 'Pass', oos: false },
        { date: '2025-10-29', state: 'TX', level: 'Level II', result: 'Pass', oos: false },
        { date: '2025-10-03', state: 'NM', level: 'Level I', result: 'Violation', oos: false },
        { date: '2025-09-17', state: 'CA', level: 'Level III', result: 'Pass', oos: false },
        { date: '2025-08-22', state: 'NV', level: 'Level I', result: 'Pass', oos: false },
        { date: '2025-07-11', state: 'UT', level: 'Level II', result: 'Pass', oos: false },
        { date: '2025-06-05', state: 'CO', level: 'Level I', result: 'Violation', oos: false },
        { date: '2025-05-19', state: 'KS', level: 'Level III', result: 'Pass', oos: false },
        { date: '2025-04-08', state: 'MO', level: 'Level I', result: 'Pass', oos: false },
        { date: '2025-03-22', state: 'IL', level: 'Level II', result: 'OOS', oos: true },
      ],
    },
    basicScores: [
      { category: 'Unsafe Driving', score: 14, threshold: 65, trend: 'down' },
      { category: 'HOS Compliance', score: 22, threshold: 65, trend: 'flat' },
      { category: 'Driver Fitness', score: 8, threshold: 80, trend: 'down' },
      { category: 'Controlled Substances', score: 3, threshold: 80, trend: 'flat' },
      { category: 'Vehicle Maintenance', score: 31, threshold: 80, trend: 'up' },
      { category: 'Hazardous Materials', score: 5, threshold: 80, trend: 'down' },
      { category: 'Crash Indicator', score: 19, threshold: 65, trend: 'flat' },
    ],
    policies: [
      { type: 'Liability', insurer: 'Great West Casualty Co.', policyNumber: 'GW-2024-441892-L', coverage: '$1,000,000', effective: '2025-01-01', expiry: '2026-01-01', status: 'On File' },
      { type: 'Cargo', insurer: 'Great West Casualty Co.', policyNumber: 'GW-2024-441892-C', coverage: '$100,000', effective: '2025-01-01', expiry: '2026-01-01', status: 'On File' },
      { type: 'Bond (BMC-84)', insurer: 'Travelers Casualty & Surety', policyNumber: 'TC-441892-B', coverage: '$75,000', effective: '2024-06-01', expiry: '2026-06-01', status: 'On File' },
    ],
    authorityHistory: [
      { date: '2001-03-12', event: 'Authority Granted', detail: 'Common Carrier Authority granted' },
      { date: '2008-07-18', event: 'Authority Expanded', detail: 'Contract Carrier Authority added' },
      { date: '2014-02-05', event: 'Name Change', detail: 'DBA updated to Swift Transport' },
      { date: '2019-11-22', event: 'Address Change', detail: 'HQ relocated to 2200 S 75th Ave, Phoenix AZ' },
    ],
    riskLevel: 'Low',
    riskFactors: [
      'Satisfactory safety rating from FMCSA — highest possible rating',
      'ISS Score of 22 indicates low inspection priority (green zone)',
      'Full insurance coverage on file with no gaps detected',
      'Out-of-service rates below national averages for all categories',
      'Minor uptick in Vehicle Maintenance BASIC — monitor quarterly',
    ],
    recommendation: 'Yes',
  },

  'DOT-2891044': {
    mcNumber: 'MC-332211',
    dotNumber: 'DOT-2891044',
    companyName: 'Mid-America Freight LLC',
    dbaName: 'MidAm Freight',
    address: '4810 Industrial Blvd',
    city: 'Memphis',
    state: 'TN',
    zip: '38118',
    phone: '(901) 555-0194',
    authorityStatus: 'Active',
    safetyRating: 'Conditional',
    issScore: 67,
    ratingDate: '2025-02-08',
    operatingStatus: 'Authorized For Property',
    entityType: 'Carrier',
    totalDrivers: 142,
    totalTrucks: 168,
    totalTrailers: 320,
    insurance: { onFile: true, amount: '$750,000', insurer: 'Canal Insurance Co.', expiry: '2025-09-30', status: 'On File' },
    cargoInsurance: { amount: '$50,000', insurer: 'Canal Insurance Co.', status: 'On File' },
    bond: { amount: '$75,000', surety: 'Western Surety Company' },
    outOfService: { vehicles: 18.4, drivers: 9.1, hazmat: 6.2 },
    inspections: {
      total: 214,
      violations: 98,
      oosRate: 24.3,
      records: [
        { date: '2025-11-01', state: 'TN', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-10-14', state: 'AR', level: 'Level II', result: 'Violation', oos: false },
        { date: '2025-09-28', state: 'MS', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-09-03', state: 'AL', level: 'Level III', result: 'Violation', oos: false },
        { date: '2025-08-11', state: 'TN', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-07-22', state: 'KY', level: 'Level II', result: 'Pass', oos: false },
        { date: '2025-06-30', state: 'MO', level: 'Level I', result: 'Violation', oos: false },
        { date: '2025-05-15', state: 'TN', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-04-02', state: 'LA', level: 'Level II', result: 'Violation', oos: false },
        { date: '2025-03-18', state: 'TX', level: 'Level I', result: 'OOS', oos: true },
      ],
    },
    basicScores: [
      { category: 'Unsafe Driving', score: 72, threshold: 65, trend: 'up' },
      { category: 'HOS Compliance', score: 58, threshold: 65, trend: 'up' },
      { category: 'Driver Fitness', score: 44, threshold: 80, trend: 'flat' },
      { category: 'Controlled Substances', score: 12, threshold: 80, trend: 'flat' },
      { category: 'Vehicle Maintenance', score: 81, threshold: 80, trend: 'up' },
      { category: 'Hazardous Materials', score: 22, threshold: 80, trend: 'down' },
      { category: 'Crash Indicator', score: 69, threshold: 65, trend: 'up' },
    ],
    policies: [
      { type: 'Liability', insurer: 'Canal Insurance Co.', policyNumber: 'CI-332211-L', coverage: '$750,000', effective: '2024-10-01', expiry: '2025-09-30', status: 'On File' },
      { type: 'Cargo', insurer: 'Canal Insurance Co.', policyNumber: 'CI-332211-C', coverage: '$50,000', effective: '2024-10-01', expiry: '2025-09-30', status: 'On File' },
      { type: 'Bond (BMC-84)', insurer: 'Western Surety Company', policyNumber: 'WS-332211-B', coverage: '$75,000', effective: '2023-04-01', expiry: '2025-04-01', status: 'Expired' },
    ],
    authorityHistory: [
      { date: '2011-06-30', event: 'Authority Granted', detail: 'Common Carrier Authority granted' },
      { date: '2020-03-14', event: 'Conditional Rating', detail: 'FMCSA issued Conditional safety rating' },
      { date: '2023-08-19', event: 'Bond Lapsed', detail: 'BMC-84 bond expired — renewed 45 days late' },
      { date: '2025-02-08', event: 'Conditional Reaffirmed', detail: 'Safety rating review — Conditional retained' },
    ],
    riskLevel: 'High',
    riskFactors: [
      'Conditional safety rating — carrier is under FMCSA scrutiny',
      'ISS Score of 67 puts carrier in yellow/red inspection zone',
      'OOS rate of 24.3% is nearly 3x the national average of ~8%',
      'Unsafe Driving BASIC (72) exceeds the 65-point intervention threshold',
      'Vehicle Maintenance BASIC (81) exceeds threshold — equipment concerns',
      'Surety bond previously lapsed — coverage continuity risk',
    ],
    recommendation: 'No',
  },

  'MC-776231': {
    mcNumber: 'MC-776231',
    dotNumber: 'DOT-1998821',
    companyName: 'Pacific Rim Transport Inc.',
    dbaName: 'Pacific Rim Transport',
    address: '7701 Harbor Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90040',
    phone: '(213) 555-0382',
    authorityStatus: 'Active',
    safetyRating: 'Not Rated',
    issScore: 12,
    ratingDate: 'N/A',
    operatingStatus: 'Authorized For Property',
    entityType: 'Carrier',
    totalDrivers: 14,
    totalTrucks: 16,
    totalTrailers: 28,
    insurance: { onFile: true, amount: '$1,000,000', insurer: 'Progressive Commercial', expiry: '2026-03-15', status: 'On File' },
    cargoInsurance: { amount: '$100,000', insurer: 'Progressive Commercial', status: 'On File' },
    bond: { amount: '$75,000', surety: 'Harco National Insurance' },
    outOfService: { vehicles: 2.1, drivers: 0.0, hazmat: 0.0 },
    inspections: {
      total: 22,
      violations: 3,
      oosRate: 4.5,
      records: [
        { date: '2025-10-30', state: 'CA', level: 'Level II', result: 'Pass', oos: false },
        { date: '2025-09-14', state: 'NV', level: 'Level I', result: 'Pass', oos: false },
        { date: '2025-08-22', state: 'AZ', level: 'Level III', result: 'Pass', oos: false },
        { date: '2025-07-07', state: 'CA', level: 'Level I', result: 'Violation', oos: false },
        { date: '2025-06-01', state: 'OR', level: 'Level II', result: 'Pass', oos: false },
        { date: '2025-05-19', state: 'WA', level: 'Level I', result: 'Pass', oos: false },
        { date: '2025-04-10', state: 'CA', level: 'Level III', result: 'Pass', oos: false },
        { date: '2025-03-05', state: 'NV', level: 'Level I', result: 'Pass', oos: false },
        { date: '2025-02-14', state: 'CA', level: 'Level II', result: 'Violation', oos: false },
        { date: '2025-01-22', state: 'CA', level: 'Level I', result: 'Pass', oos: false },
      ],
    },
    basicScores: [
      { category: 'Unsafe Driving', score: 5, threshold: 65, trend: 'flat' },
      { category: 'HOS Compliance', score: 11, threshold: 65, trend: 'down' },
      { category: 'Driver Fitness', score: 0, threshold: 80, trend: 'flat' },
      { category: 'Controlled Substances', score: 0, threshold: 80, trend: 'flat' },
      { category: 'Vehicle Maintenance', score: 18, threshold: 80, trend: 'flat' },
      { category: 'Hazardous Materials', score: 0, threshold: 80, trend: 'flat' },
      { category: 'Crash Indicator', score: 8, threshold: 65, trend: 'flat' },
    ],
    policies: [
      { type: 'Liability', insurer: 'Progressive Commercial', policyNumber: 'PC-776231-L', coverage: '$1,000,000', effective: '2025-03-15', expiry: '2026-03-15', status: 'On File' },
      { type: 'Cargo', insurer: 'Progressive Commercial', policyNumber: 'PC-776231-C', coverage: '$100,000', effective: '2025-03-15', expiry: '2026-03-15', status: 'On File' },
      { type: 'Bond (BMC-84)', insurer: 'Harco National Insurance', policyNumber: 'HN-776231-B', coverage: '$75,000', effective: '2024-11-01', expiry: '2026-11-01', status: 'On File' },
    ],
    authorityHistory: [
      { date: '2023-10-05', event: 'Authority Granted', detail: 'New Entrant authority granted — probationary period' },
      { date: '2024-10-10', event: 'New Entrant Cleared', detail: 'New entrant safety audit passed — full authority' },
      { date: '2024-11-15', event: 'Insurance Added', detail: 'BMC-91 liability and BMC-34 cargo filed' },
    ],
    riskLevel: 'Low',
    riskFactors: [
      'ISS Score of 12 — lowest inspection priority, strong safety metrics',
      'No driver OOS violations or HazMat incidents on record',
      'Full insurance coverage on file — liability and cargo current',
      'Newer carrier (2023) — limited inspection history, "Not Rated" is expected',
      'All BASIC scores well below intervention thresholds',
    ],
    recommendation: 'Yes',
  },

  'DOT-3312088': {
    mcNumber: 'MC-991002',
    dotNumber: 'DOT-3312088',
    companyName: 'Delta Express Trucking LLC',
    dbaName: 'Delta Express',
    address: '332 Commerce Dr',
    city: 'Atlanta',
    state: 'GA',
    zip: '30336',
    phone: '(404) 555-0217',
    authorityStatus: 'Active',
    safetyRating: 'Unsatisfactory',
    issScore: 88,
    ratingDate: '2025-04-22',
    operatingStatus: 'Authorized For Property',
    entityType: 'Carrier',
    totalDrivers: 38,
    totalTrucks: 44,
    totalTrailers: 91,
    insurance: { onFile: false, amount: '$750,000', insurer: 'Kingsway Financial', expiry: '2024-12-31', status: 'Expired' },
    cargoInsurance: { amount: '$50,000', insurer: 'Kingsway Financial', status: 'Expired' },
    bond: { amount: '$75,000', surety: 'Granite Re Inc.' },
    outOfService: { vehicles: 31.7, drivers: 14.8, hazmat: 12.3 },
    inspections: {
      total: 187,
      violations: 142,
      oosRate: 38.5,
      records: [
        { date: '2025-11-10', state: 'GA', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-10-25', state: 'FL', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-10-08', state: 'SC', level: 'Level II', result: 'OOS', oos: true },
        { date: '2025-09-19', state: 'GA', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-08-30', state: 'AL', level: 'Level I', result: 'Violation', oos: false },
        { date: '2025-08-06', state: 'TN', level: 'Level III', result: 'OOS', oos: true },
        { date: '2025-07-14', state: 'GA', level: 'Level II', result: 'OOS', oos: true },
        { date: '2025-06-28', state: 'FL', level: 'Level I', result: 'Violation', oos: false },
        { date: '2025-05-31', state: 'GA', level: 'Level I', result: 'OOS', oos: true },
        { date: '2025-04-22', state: 'NC', level: 'Level I', result: 'OOS', oos: true },
      ],
    },
    basicScores: [
      { category: 'Unsafe Driving', score: 91, threshold: 65, trend: 'up' },
      { category: 'HOS Compliance', score: 84, threshold: 65, trend: 'up' },
      { category: 'Driver Fitness', score: 76, threshold: 80, trend: 'up' },
      { category: 'Controlled Substances', score: 44, threshold: 80, trend: 'flat' },
      { category: 'Vehicle Maintenance', score: 93, threshold: 80, trend: 'up' },
      { category: 'Hazardous Materials', score: 51, threshold: 80, trend: 'up' },
      { category: 'Crash Indicator', score: 88, threshold: 65, trend: 'up' },
    ],
    policies: [
      { type: 'Liability', insurer: 'Kingsway Financial', policyNumber: 'KF-991002-L', coverage: '$750,000', effective: '2024-01-01', expiry: '2024-12-31', status: 'Expired' },
      { type: 'Cargo', insurer: 'Kingsway Financial', policyNumber: 'KF-991002-C', coverage: '$50,000', effective: '2024-01-01', expiry: '2024-12-31', status: 'Expired' },
      { type: 'Bond (BMC-84)', insurer: 'Granite Re Inc.', policyNumber: 'GR-991002-B', coverage: '$75,000', effective: '2023-07-01', expiry: '2025-07-01', status: 'On File' },
    ],
    authorityHistory: [
      { date: '2017-04-18', event: 'Authority Granted', detail: 'Common Carrier Authority granted' },
      { date: '2022-09-11', event: 'Safety Audit', detail: 'FMCSA compliance review initiated' },
      { date: '2023-06-03', event: 'Conditional Rating', detail: 'Safety rating downgraded to Conditional' },
      { date: '2025-04-22', event: 'Unsatisfactory Rating', detail: 'Safety rating downgraded to Unsatisfactory — remediation required' },
      { date: '2025-01-15', event: 'Insurance Lapsed', detail: 'Liability and cargo insurance expired — not renewed as of filing date' },
    ],
    riskLevel: 'High',
    riskFactors: [
      'Unsatisfactory safety rating — highest risk level, potential revocation pending',
      'ISS Score of 88 — maximum inspection priority, carrier flagged for enhanced enforcement',
      'Liability insurance EXPIRED as of 2024-12-31 — using this carrier creates direct legal exposure',
      'OOS rate of 38.5% is nearly 5x the national average',
      'Unsafe Driving (91) and Vehicle Maintenance (93) BASICs both in critical range',
      'Crash Indicator (88) well above threshold — documented accident history',
    ],
    recommendation: 'No',
  },
};

// Build alias index so DOT numbers also resolve
const CARRIER_LOOKUP: Record<string, CarrierData> = {};
Object.values(MOCK_CARRIERS).forEach((c) => {
  CARRIER_LOOKUP[c.mcNumber.toUpperCase()] = c;
  CARRIER_LOOKUP[c.dotNumber.toUpperCase()] = c;
});

// ─── ISS Gauge SVG ────────────────────────────────────────────────────────────

function ISSGauge({ score }: { score: number }) {
  const color = score < 30 ? '#22c55e' : score < 60 ? '#f59e0b' : '#ef4444';
  const label = score < 30 ? 'Low Risk' : score < 60 ? 'Moderate' : 'High Risk';

  // Arc math: semicircle from 180° to 0° (left to right)
  const cx = 80;
  const cy = 80;
  const r = 60;
  const startAngle = Math.PI; // 180°
  const endAngle = 0;         // 0°
  const scoreAngle = Math.PI - (score / 100) * Math.PI; // maps 0→π, 100→0

  const polarToXY = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  const start = polarToXY(startAngle);
  const end = polarToXY(endAngle);
  const needle = polarToXY(scoreAngle);

  const bgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;

  // Filled arc from start to score position
  // largeArc is always 0: the gauge is a semicircle (max span = 180°),
  // so we always want the short arc, never the "long way around".
  const scorePt = polarToXY(scoreAngle);
  const fillPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${scorePt.x} ${scorePt.y}`;

  return (
    <svg viewBox="0 0 160 100" width="160" height="100">
      {/* Track */}
      <path d={bgPath} fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
      {/* Fill */}
      <path d={fillPath} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
      {/* Zone markers */}
      {[0, 30, 60, 100].map((pct) => {
        const ang = Math.PI - (pct / 100) * Math.PI;
        const inner = polarToXY(ang);
        const outerR = r + 6;
        const outer = { x: cx + outerR * Math.cos(ang), y: cy - outerR * Math.sin(ang) };
        return <line key={pct} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth="1.5" />;
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={4} fill="#374151" />
      {/* Score text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#6b7280">{label}</text>
      {/* Min/Max labels */}
      <text x="12" y="92" fontSize="8" fill="#9ca3af">0</text>
      <text x="140" y="92" fontSize="8" fill="#9ca3af">100</text>
    </svg>
  );
}

// ─── Small Helpers ────────────────────────────────────────────────────────────

function safetyRatingBadge(rating: SafetyRating): { bg: string; color: string } {
  switch (rating) {
    case 'Satisfactory': return { bg: '#dcfce7', color: '#166534' };
    case 'Conditional':  return { bg: '#fef9c3', color: '#92400e' };
    case 'Unsatisfactory': return { bg: '#fee2e2', color: '#991b1b' };
    default: return { bg: '#f3f4f6', color: '#374151' };
  }
}

function riskBadge(risk: RiskLevel): { bg: string; color: string; icon: string } {
  switch (risk) {
    case 'Low':    return { bg: '#dcfce7', color: '#166534', icon: '✓' };
    case 'Medium': return { bg: '#fef9c3', color: '#92400e', icon: '⚠' };
    case 'High':   return { bg: '#fee2e2', color: '#991b1b', icon: '✗' };
  }
}

function recBadge(rec: CarrierData['recommendation']): { bg: string; color: string } {
  switch (rec) {
    case 'Yes':                    return { bg: '#dcfce7', color: '#166534' };
    case 'Proceed with Caution':   return { bg: '#fef9c3', color: '#92400e' };
    case 'No':                     return { bg: '#fee2e2', color: '#991b1b' };
  }
}

function basicScoreColor(score: number, threshold: number): string {
  if (score >= threshold) return '#ef4444';
  if (score >= threshold * 0.8) return '#f59e0b';
  return '#22c55e';
}

function trendArrow(trend: 'up' | 'down' | 'flat'): { char: string; color: string } {
  switch (trend) {
    case 'up':   return { char: '▲', color: '#ef4444' };
    case 'down': return { char: '▼', color: '#22c55e' };
    case 'flat': return { char: '●', color: '#9ca3af' };
  }
}

function insuranceStatusBadge(s: InsuranceStatus): { bg: string; color: string } {
  switch (s) {
    case 'On File':     return { bg: '#dcfce7', color: '#166534' };
    case 'Not On File': return { bg: '#fee2e2', color: '#991b1b' };
    case 'Expired':     return { bg: '#fee2e2', color: '#991b1b' };
  }
}

// ─── Inspections Pie SVG ──────────────────────────────────────────────────────

function InspectionPie({ pass, oos }: { pass: number; oos: number }) {
  const total = pass + oos;
  if (total === 0) return null;
  const passFraction = pass / total;
  const oosFraction  = oos / total;
  const r = 48;
  const cx = 60;
  const cy = 60;

  const slice = (fraction: number, startAngle: number, color: string) => {
    if (fraction === 0) return null;
    if (fraction === 1) {
      return <circle cx={cx} cy={cy} r={r} fill={color} />;
    }
    const endAngle = startAngle + fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = fraction > 0.5 ? 1 : 0;
    return (
      <path
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={color}
      />
    );
  };

  const passStart = -Math.PI / 2;
  const oosStart  = passStart + passFraction * 2 * Math.PI;

  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      {slice(passFraction, passStart, '#22c55e')}
      {slice(oosFraction, oosStart, '#ef4444')}
      <circle cx={cx} cy={cy} r={26} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="#374151">{Math.round(passFraction * 100)}%</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="8" fill="#6b7280">Pass</text>
    </svg>
  );
}

// ─── Saved Lookup Types ───────────────────────────────────────────────────────

interface SavedLookup {
  query: string;
  timestamp: string;
  carrier: CarrierData;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FMCSALookupPage() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CarrierData | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [savedLookups, setSavedLookups] = useState<SavedLookup[]>([]);
  const [mainTab, setMainTab] = useState<'lookup' | 'bulk'>('lookup');
  const [bulkInput, setBulkInput] = useState<string>('');
  const [bulkResults, setBulkResults] = useState<CarrierData[]>([]);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  const QUICK_CHIPS = ['MC-441892', 'DOT-2891044', 'MC-776231', 'DOT-3312088'];

  const doSearch = (query: string) => {
    const normalized = query.trim().toUpperCase().replace(/\s+/g, '');
    if (!normalized) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    setTimeout(() => {
      const found = CARRIER_LOOKUP[normalized] ?? null;
      setResult(found);
      setNotFound(!found);
      setLoading(false);
      if (found) {
        setActiveTab('overview');
        setSavedLookups((prev) => {
          const entry: SavedLookup = {
            query: normalized,
            timestamp: new Date().toLocaleString(),
            carrier: found,
          };
          const filtered = prev.filter((p) => p.query !== normalized);
          return [entry, ...filtered].slice(0, 5);
        });
      }
    }, 1500);
  };

  const doBulkSearch = () => {
    const lines = bulkInput.split('\n').map((l) => l.trim().toUpperCase().replace(/\s+/g, '')).filter(Boolean);
    if (!lines.length) return;
    setBulkLoading(true);
    setBulkResults([]);
    setTimeout(() => {
      const results = lines
        .map((q) => CARRIER_LOOKUP[q])
        .filter((c): c is CarrierData => c !== undefined);
      setBulkResults(results);
      setBulkLoading(false);
    }, 1500);
  };

  const exportCSV = () => {
    const header = 'MC#,Name,Safety Rating,ISS Score,Insurance Status,Risk Level\n';
    const rows = bulkResults
      .map((c) => `${c.mcNumber},"${c.companyName}",${c.safetyRating},${c.issScore},${c.insurance.status},${c.riskLevel}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fmcsa_bulk_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'var(--c-divider, #F0F4F8)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: 'var(--c-dark, #1A2535)',
  };

  const heroStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, var(--c-dark, #1A2535) 0%, #243447 100%)',
    padding: '48px 24px 40px',
    textAlign: 'center',
  };

  const heroTitleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 8px',
  };

  const heroSubStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 28px',
  };

  const searchBarWrapStyle: React.CSSProperties = {
    display: 'flex',
    maxWidth: '640px',
    margin: '0 auto',
    gap: 0,
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px 20px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
    backgroundColor: '#fff',
    color: '#1A2535',
  };

  const searchBtnStyle: React.CSSProperties = {
    padding: '16px 28px',
    backgroundColor: 'var(--c-primary, #4BAED4)',
    color: '#fff',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    opacity: loading ? 0.7 : 1,
    transition: 'background 0.2s',
  };

  const chipsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '18px',
    flexWrap: 'wrap',
  };

  const chipStyle: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#e2e8f0',
    fontSize: '13px',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'background 0.15s',
  };

  const poweredBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '16px',
    padding: '4px 12px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#94a3b8',
    fontSize: '11px',
  };

  const contentWrapStyle: React.CSSProperties = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '28px 20px',
  };

  const tabRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '28px',
  };

  const mainTabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '15px',
    fontWeight: active ? 700 : 500,
    color: active ? 'var(--c-primary, #4BAED4)' : '#64748b',
    border: 'none',
    borderBottom: active ? '2px solid var(--c-primary, #4BAED4)' : '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    background: 'none',
    transition: 'color 0.15s',
  });

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#94a3b8',
    marginBottom: '4px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#1A2535',
    fontWeight: 500,
  };

  const badge = (text: string, bg: string, color: string): React.ReactNode => (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', backgroundColor: bg, color, fontSize: '12px', fontWeight: 600 }}>
      {text}
    </span>
  );

  const smsTabRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
  };

  const smsTabStyle = (t: TabKey): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: activeTab === t ? 700 : 500,
    color: activeTab === t ? 'var(--c-primary, #4BAED4)' : '#64748b',
    border: 'none',
    borderBottom: activeTab === t ? '2px solid var(--c-primary, #4BAED4)' : '2px solid transparent',
    marginBottom: '-1px',
    cursor: 'pointer',
    background: 'none',
    whiteSpace: 'nowrap',
  });

  const progressBar = (value: number, max: number, color: string): React.ReactNode => (
    <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.4s' }} />
    </div>
  );

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    textAlign: 'left',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
    color: '#475569',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#374151',
  };

  // ── Render helpers ───────────────────────────────────────────────────────────

  const renderOverviewTab = (c: CarrierData) => (
    <div>
      <div style={gridStyle}>
        {[
          { label: 'Company Name', value: c.companyName },
          { label: 'DBA Name', value: c.dbaName },
          { label: 'MC Number', value: c.mcNumber },
          { label: 'DOT Number', value: c.dotNumber },
          { label: 'Entity Type', value: c.entityType },
          { label: 'Operating Status', value: c.operatingStatus },
          { label: 'Address', value: `${c.address}, ${c.city}, ${c.state} ${c.zip}` },
          { label: 'Phone', value: c.phone },
          { label: 'Total Drivers', value: c.totalDrivers.toLocaleString() },
          { label: 'Total Trucks', value: c.totalTrucks.toLocaleString() },
          { label: 'Total Trailers', value: c.totalTrailers.toLocaleString() },
          { label: 'Safety Rating Date', value: c.ratingDate },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={labelStyle}>{label}</div>
            <div style={valueStyle}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '28px' }}>
        <div style={{ ...labelStyle, marginBottom: '12px', fontSize: '13px' }}>Authority History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {c.authorityHistory.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--c-primary, #4BAED4)', marginTop: '4px' }} />
                {i < c.authorityHistory.length - 1 && (
                  <div style={{ width: '2px', flex: 1, backgroundColor: '#e2e8f0', minHeight: '20px' }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '2px' }}>{ev.date}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A2535' }}>{ev.event}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{ev.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSafetyTab = (c: CarrierData) => (
    <div>
      <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '20px' }}>
        SMS BASIC scores below their intervention thresholds are shown in green. Scores approaching or exceeding thresholds may trigger FMCSA enforcement action.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {c.basicScores.map((bs) => {
          const color = basicScoreColor(bs.score, bs.threshold);
          const arrow = trendArrow(bs.trend);
          return (
            <div key={bs.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{bs.category}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Threshold: {bs.threshold}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color }}>{bs.score}</span>
                  <span style={{ fontSize: '12px', color: arrow.color }}>{arrow.char}</span>
                </div>
              </div>
              {progressBar(bs.score, 100, color)}
              {bs.score >= bs.threshold && (
                <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px' }}>⚠ Exceeds intervention threshold</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderInsuranceTab = (c: CarrierData) => {
    const hasExpired = c.policies.some((p) => p.status === 'Expired');
    const hasNotOnFile = c.policies.some((p) => p.status === 'Not On File');
    const hasCoverageGap = hasExpired || hasNotOnFile;
    return (
      <div>
        {hasCoverageGap && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px' }}>⚠</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>Coverage Gap Detected</div>
              <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '2px' }}>
                One or more insurance policies are expired or not on file. Booking this carrier creates direct financial and legal liability exposure.
              </div>
            </div>
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {['Type', 'Insurer', 'Policy #', 'Coverage', 'Effective', 'Expiry', 'Status'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.policies.map((p, i) => {
                const sb = insuranceStatusBadge(p.status);
                return (
                  <tr key={i} style={{ backgroundColor: p.status !== 'On File' ? '#fff5f5' : 'transparent' }}>
                    <td style={tdStyle}>{p.type}</td>
                    <td style={tdStyle}>{p.insurer}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{p.policyNumber}</td>
                    <td style={tdStyle}>{p.coverage}</td>
                    <td style={tdStyle}>{p.effective}</td>
                    <td style={tdStyle}>{p.expiry}</td>
                    <td style={tdStyle}>{badge(p.status, sb.bg, sb.color)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInspectionsTab = (c: CarrierData) => {
    const passCount = c.inspections.records.filter((r) => !r.oos).length;
    const oosCount  = c.inspections.records.filter((r) => r.oos).length;
    return (
      <div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, minWidth: '160px' }}>
            <InspectionPie pass={passCount} oos={oosCount} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#374151' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#22c55e' }} /> Pass
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#374151' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }} /> OOS
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Total Inspections (24 mo)', value: c.inspections.total.toLocaleString() },
              { label: 'Total Violations', value: c.inspections.violations.toLocaleString() },
              { label: 'OOS Rate', value: `${c.inspections.oosRate}%` },
              { label: 'National Avg OOS Rate', value: '~8.0%' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={labelStyle}>{label}</div>
                <div style={{ ...valueStyle, fontSize: '16px' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {['Date', 'State', 'Level', 'Result', 'OOS'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.inspections.records.map((insp, i) => (
                <tr key={i} style={{ backgroundColor: insp.oos ? '#fff5f5' : 'transparent' }}>
                  <td style={tdStyle}>{insp.date}</td>
                  <td style={tdStyle}>{insp.state}</td>
                  <td style={tdStyle}>{insp.level}</td>
                  <td style={tdStyle}>{insp.result}</td>
                  <td style={tdStyle}>{insp.oos ? badge('OOS', '#fee2e2', '#991b1b') : badge('No', '#f0fdf4', '#166534')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderHistoryTab = (c: CarrierData) => (
    <div>
      <div style={{ ...labelStyle, fontSize: '13px', marginBottom: '16px' }}>Full Authority & Event History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {[...c.authorityHistory].reverse().map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--c-primary, #4BAED4)', border: '2px solid #fff', boxShadow: '0 0 0 2px var(--c-primary, #4BAED4)', marginTop: '3px' }} />
              {i < c.authorityHistory.length - 1 && (
                <div style={{ width: '2px', flex: 1, backgroundColor: '#e2e8f0', minHeight: '24px' }} />
              )}
            </div>
            <div style={{ ...cardStyle, padding: '12px 16px', marginBottom: 0, flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>{ev.date}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A2535', marginBottom: '4px' }}>{ev.event}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{ev.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActiveTab = (c: CarrierData) => {
    switch (activeTab) {
      case 'overview':    return renderOverviewTab(c);
      case 'safety':      return renderSafetyTab(c);
      case 'insurance':   return renderInsuranceTab(c);
      case 'inspections': return renderInspectionsTab(c);
      case 'history':     return renderHistoryTab(c);
    }
  };

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <div style={heroStyle}>
        <h1 style={heroTitleStyle}>FMCSA Carrier Lookup</h1>
        <p style={heroSubStyle}>Verify carrier safety, authority, and insurance status before you book</p>

        <div style={searchBarWrapStyle}>
          <input
            style={searchInputStyle}
            type="text"
            placeholder="Enter MC# or DOT# (e.g. MC-123456)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch(searchInput)}
          />
          <button
            style={searchBtnStyle}
            onClick={() => doSearch(searchInput)}
            disabled={loading}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        <div style={chipsRowStyle}>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              style={chipStyle}
              onClick={() => { setSearchInput(chip); doSearch(chip); }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
            >
              {chip}
            </button>
          ))}
        </div>

        <div style={poweredBadgeStyle}>
          <span>🛡</span>
          <span>Powered by FMCSA SaferWeb</span>
        </div>
      </div>

      {/* Content */}
      <div style={contentWrapStyle}>

        {/* Main tabs */}
        <div style={tabRowStyle}>
          <button style={mainTabStyle(mainTab === 'lookup')} onClick={() => setMainTab('lookup')}>Carrier Lookup</button>
          <button style={mainTabStyle(mainTab === 'bulk')} onClick={() => setMainTab('bulk')}>Bulk Lookup</button>
        </div>

        {mainTab === 'lookup' && (
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 300px' : '1fr', gap: '24px', alignItems: 'start' }}>

            {/* Left column */}
            <div>
              {/* Loading state */}
              {loading && (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                  <div style={{ fontSize: '15px', color: '#64748b' }}>Querying FMCSA SaferWeb database…</div>
                </div>
              )}

              {/* Not found */}
              {notFound && !loading && (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No Carrier Found</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    No FMCSA record matches that MC# or DOT#. Try the demo lookups: MC-441892, DOT-2891044, MC-776231, DOT-3312088
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <>
                  {/* Carrier Profile Card */}
                  <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                      <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>{result.companyName}</h2>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>DBA: {result.dbaName}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{result.mcNumber} · {result.dotNumber}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{result.address}, {result.city}, {result.state} {result.zip}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        {badge(
                          result.authorityStatus === 'Active' ? '● Active Authority' : '○ Inactive Authority',
                          result.authorityStatus === 'Active' ? '#dcfce7' : '#fee2e2',
                          result.authorityStatus === 'Active' ? '#166534' : '#991b1b',
                        )}
                        {(() => {
                          const sb = safetyRatingBadge(result.safetyRating);
                          return badge(`Safety: ${result.safetyRating}`, sb.bg, sb.color);
                        })()}
                        {badge(
                          result.insurance.status === 'On File' ? '✓ Insurance On File' : '✗ Insurance Issue',
                          result.insurance.status === 'On File' ? '#dcfce7' : '#fee2e2',
                          result.insurance.status === 'On File' ? '#166534' : '#991b1b',
                        )}
                      </div>
                    </div>

                    {/* ISS + Key metrics row */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '20px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <ISSGauge score={result.issScore} />
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>ISS Score (lower = better)</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', flex: 1 }}>
                        <div>
                          <div style={labelStyle}>Insurance Amount</div>
                          <div style={valueStyle}>{result.insurance.amount}</div>
                        </div>
                        <div>
                          <div style={labelStyle}>Insurer</div>
                          <div style={valueStyle}>{result.insurance.insurer}</div>
                        </div>
                        <div>
                          <div style={labelStyle}>Insurance Expiry</div>
                          <div style={valueStyle}>{result.insurance.expiry}</div>
                        </div>
                        <div>
                          <div style={labelStyle}>Cargo Insurance</div>
                          <div style={valueStyle}>{result.cargoInsurance.amount}</div>
                        </div>
                        <div>
                          <div style={labelStyle}>Cargo Insurer</div>
                          <div style={valueStyle}>{result.cargoInsurance.insurer}</div>
                        </div>
                        <div>
                          <div style={labelStyle}>Surety Bond</div>
                          <div style={valueStyle}>{result.bond.amount} — {result.bond.surety}</div>
                        </div>
                      </div>
                    </div>

                    {/* OOS progress bars */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Out of Service Rates</div>
                      {[
                        { label: 'Vehicles', value: result.outOfService.vehicles },
                        { label: 'Drivers', value: result.outOfService.drivers },
                        { label: 'HazMat', value: result.outOfService.hazmat },
                      ].map(({ label, value }) => {
                        const color = value > 20 ? '#ef4444' : value > 10 ? '#f59e0b' : '#22c55e';
                        return (
                          <div key={label} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
                              <span style={{ fontSize: '12px', fontWeight: 600, color }}>{value}%</span>
                            </div>
                            {progressBar(value, 50, color)}
                          </div>
                        );
                      })}
                    </div>

                    {/* Inspections summary */}
                    <div style={{ display: 'flex', gap: '16px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                      {[
                        { label: 'Total Inspections', value: result.inspections.total.toLocaleString() },
                        { label: 'Violations', value: result.inspections.violations.toLocaleString() },
                        { label: 'OOS Rate', value: `${result.inspections.oosRate}%` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A2535' }}>{value}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SMS Detailed Tabs */}
                  <div style={cardStyle}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Detailed SMS Data</div>
                      <div style={smsTabRowStyle}>
                        {(['overview', 'safety', 'insurance', 'inspections', 'history'] as TabKey[]).map((t) => (
                          <button key={t} style={smsTabStyle(t)} onClick={() => setActiveTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                            {t === 'safety' ? ' Scores' : t === 'inspections' ? ' Records' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                    {renderActiveTab(result)}
                  </div>

                  {/* Risk Assessment */}
                  <div style={{ ...cardStyle, border: `1px solid ${riskBadge(result.riskLevel).bg}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '22px' }}>{riskBadge(result.riskLevel).icon === '✓' ? '🟢' : riskBadge(result.riskLevel).icon === '⚠' ? '🟡' : '🔴'}</span>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700 }}>AI Risk Assessment</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Based on FMCSA safety data, insurance status, and inspection history</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        {badge(`Overall Risk: ${result.riskLevel}`, riskBadge(result.riskLevel).bg, riskBadge(result.riskLevel).color)}
                      </div>
                    </div>
                    <ul style={{ margin: '0 0 16px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {result.riskFactors.map((f, i) => (
                        <li key={i} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{f}</li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Would you book this carrier?</span>
                      {badge(result.recommendation, recBadge(result.recommendation).bg, recBadge(result.recommendation).color)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right column — Recent Lookups */}
            <div>
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>Recent Lookups</div>
                  {savedLookups.length > 0 && (
                    <button
                      style={{ fontSize: '11px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px' }}
                      onClick={() => setSavedLookups([])}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {savedLookups.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                    No recent lookups yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {savedLookups.map((s, i) => {
                      const sb = safetyRatingBadge(s.carrier.safetyRating);
                      return (
                        <div
                          key={i}
                          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.15s' }}
                          onClick={() => { setResult(s.carrier); setActiveTab('overview'); setMainTab('lookup'); }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafc'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A2535' }}>{s.carrier.companyName}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '5px' }}>{s.carrier.mcNumber} · {s.timestamp}</div>
                          {badge(s.carrier.safetyRating, sb.bg, sb.color)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick stats if result */}
              {result && (
                <div style={cardStyle}>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Quick Stats</div>
                  {[
                    { label: 'Fleet Size', value: `${result.totalTrucks.toLocaleString()} trucks` },
                    { label: 'Drivers', value: result.totalDrivers.toLocaleString() },
                    { label: 'Trailers', value: result.totalTrailers.toLocaleString() },
                    { label: 'Bond Amount', value: result.bond.amount },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                      <span style={{ color: '#64748b' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#1A2535' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bulk Lookup */}
        {mainTab === 'bulk' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700 }}>Bulk Carrier Lookup</h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                Paste MC# or DOT# numbers below, one per line. The tool will look up each carrier and return a summary table you can export to CSV.
              </p>
              <textarea
                style={{ width: '100%', minHeight: '140px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'monospace', color: '#1A2535', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                placeholder={'MC-441892\nDOT-2891044\nMC-776231\nDOT-3312088'}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  style={{ ...searchBtnStyle, borderRadius: '8px' }}
                  onClick={doBulkSearch}
                  disabled={bulkLoading}
                >
                  {bulkLoading ? 'Running Batch…' : 'Run Batch Lookup'}
                </button>
                {bulkResults.length > 0 && (
                  <button
                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--c-primary, #4BAED4)', color: 'var(--c-primary, #4BAED4)', background: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    onClick={exportCSV}
                  >
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            {bulkResults.length > 0 && (
              <div style={cardStyle}>
                <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>
                  Results — {bulkResults.length} carrier{bulkResults.length !== 1 ? 's' : ''} found
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        {['MC#', 'DOT#', 'Name', 'Safety Rating', 'ISS Score', 'Insurance', 'Risk Level', 'Recommendation'].map((h) => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bulkResults.map((c, i) => {
                        const sb = safetyRatingBadge(c.safetyRating);
                        const rb = riskBadge(c.riskLevel);
                        const ib = insuranceStatusBadge(c.insurance.status);
                        const recb = recBadge(c.recommendation);
                        return (
                          <tr key={i}>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{c.mcNumber}</td>
                            <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{c.dotNumber}</td>
                            <td style={tdStyle}>
                              <div style={{ fontWeight: 500 }}>{c.companyName}</div>
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.city}, {c.state}</div>
                            </td>
                            <td style={tdStyle}>{badge(c.safetyRating, sb.bg, sb.color)}</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: c.issScore < 30 ? '#22c55e' : c.issScore < 60 ? '#f59e0b' : '#ef4444' }}>{c.issScore}</td>
                            <td style={tdStyle}>{badge(c.insurance.status, ib.bg, ib.color)}</td>
                            <td style={tdStyle}>{badge(c.riskLevel, rb.bg, rb.color)}</td>
                            <td style={tdStyle}>{badge(c.recommendation, recb.bg, recb.color)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
