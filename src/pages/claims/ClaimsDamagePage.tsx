import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────
type ClaimStatus = 'open' | 'disputed' | 'paid' | 'denied'
type ClaimType   = 'damage' | 'shortage' | 'delay' | 'theft' | 'contamination'
type MsgSender   = 'me' | 'broker' | 'insurance' | 'system'

interface TimelineEvent {
  date: string
  title: string
  body: string
  icon: string
  type: 'filed' | 'update' | 'message' | 'document' | 'payment' | 'denial' | 'dispute'
}

interface Message {
  id: string
  sender: MsgSender
  senderName: string
  date: string
  text: string
  attachment?: string
}

interface ClaimPhoto {
  id: string
  label: string
  color: string   // placeholder colour for mock photo
  emoji: string
}

interface Claim {
  id: string
  loadId: string
  claimType: ClaimType
  status: ClaimStatus
  commodity: string
  origin: string
  destination: string
  incidentDate: string
  filedDate: string
  resolvedDate?: string
  damageAmount: number
  settledAmount?: number
  deductible: number
  broker: string
  carrier: string
  insurance: string
  policyNumber: string
  description: string
  photos: ClaimPhoto[]
  timeline: TimelineEvent[]
  messages: Message[]
  documents: string[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_CLAIMS: Claim[] = [
  {
    id: 'CLM-2024-001',
    loadId: 'LD-88231',
    claimType: 'damage',
    status: 'open',
    commodity: 'Electronics (TVs)',
    origin: 'Los Angeles, CA',
    destination: 'Dallas, TX',
    incidentDate: '2024-05-08',
    filedDate: '2024-05-10',
    damageAmount: 12400,
    deductible: 1000,
    broker: 'Echo Global Logistics',
    carrier: 'Swift Transportation',
    insurance: 'Canal Insurance',
    policyNumber: 'CNL-2024-88821',
    description: '14 units of Samsung 65" TVs arrived with cracked screens. Damage appears to have occurred during transit — improper securing of cargo on upper deck. Driver confirmed load shifted near Tucson, AZ.',
    photos: [
      { id: 'p1', label: 'Loading dock — before', color: '#4BAED4', emoji: '📦' },
      { id: 'p2', label: 'Damaged units at delivery', color: '#E53E3E', emoji: '🖥️' },
      { id: 'p3', label: 'Cracked screen close-up', color: '#C53030', emoji: '💥' },
      { id: 'p4', label: 'Truck interior — shifted load', color: '#DD6B20', emoji: '🚚' },
    ],
    timeline: [
      { date: '2024-05-08 14:22', title: 'Incident reported at delivery', body: 'Consignee noted 14 damaged TVs on delivery receipt. Driver signed exception.', icon: '⚠️', type: 'filed' },
      { date: '2024-05-09 09:15', title: 'Photos uploaded by driver', body: '4 photos of damage submitted via ePOD system.', icon: '📸', type: 'document' },
      { date: '2024-05-10 11:30', title: 'Claim filed with Canal Insurance', body: 'Policy CNL-2024-88821. Claim amount: $12,400.', icon: '📋', type: 'filed' },
      { date: '2024-05-11 08:00', title: 'Broker notified', body: 'Echo Global Logistics received claim notice via email.', icon: '📧', type: 'message' },
      { date: '2024-05-14 16:00', title: 'Adjuster assigned', body: 'Mike Torres, Canal Insurance. ETA for inspection: May 18.', icon: '👤', type: 'update' },
    ],
    messages: [
      { id: 'm1', sender: 'broker', senderName: 'Echo Global Logistics', date: '2024-05-11 10:14', text: 'We received your claim notice. Please send the original BOL and delivery receipt with exception noted. We will process within 10 business days.' },
      { id: 'm2', sender: 'me', senderName: 'You', date: '2024-05-11 14:32', text: 'Attached BOL #88231 and signed DR with consignee exception. Photos are in the ePOD system. Please advise next steps.', attachment: 'BOL_88231.pdf' },
      { id: 'm3', sender: 'insurance', senderName: 'Canal Insurance', date: '2024-05-14 09:00', text: 'Claim CNL-2024-88821 acknowledged. Adjuster Mike Torres will contact you for physical inspection by May 18. Please preserve all damaged units.', },
    ],
    documents: ['BOL_88231.pdf', 'Delivery_Receipt_Exception.pdf', 'Invoice_Samsung_TVs.pdf', 'Insurance_Policy_CNL-2024.pdf'],
  },
  {
    id: 'CLM-2024-002',
    loadId: 'LD-79914',
    claimType: 'shortage',
    status: 'disputed',
    commodity: 'Automotive Parts',
    origin: 'Detroit, MI',
    destination: 'Nashville, TN',
    incidentDate: '2024-04-22',
    filedDate: '2024-04-24',
    damageAmount: 5800,
    deductible: 500,
    broker: 'Coyote Logistics',
    carrier: 'Werner Enterprises',
    insurance: 'Old Republic',
    policyNumber: 'OR-2024-55100',
    description: '18 boxes of automotive parts (3.2% of total shipment) missing at delivery. Consignee count: 542 boxes. BOL count: 560 boxes. Driver disputes shortage, claims 560 delivered. Security camera footage being requested.',
    photos: [
      { id: 'p1', label: 'BOL with discrepancy noted', color: '#D69E2E', emoji: '📄' },
      { id: 'p2', label: 'Unloading — partial view', color: '#975A16', emoji: '🏭' },
    ],
    timeline: [
      { date: '2024-04-22 16:40', title: 'Shortage noted on delivery', body: '18 boxes short. Consignee refused to sign without exception.', icon: '⚠️', type: 'filed' },
      { date: '2024-04-23 08:00', title: 'Driver disputes count', body: 'Werner driver insists 560 boxes were delivered. Escalated to operations.', icon: '🔄', type: 'dispute' },
      { date: '2024-04-24 10:00', title: 'Claim filed', body: 'Shortage claim $5,800 submitted to Old Republic.', icon: '📋', type: 'filed' },
      { date: '2024-05-02 14:00', title: 'Security footage requested', body: 'Consignee warehouse requested to provide dock camera footage.', icon: '🎥', type: 'update' },
      { date: '2024-05-10 09:30', title: 'Footage obtained — dispute active', body: 'Camera angles inconclusive. Both parties maintaining position.', icon: '⚖️', type: 'dispute' },
    ],
    messages: [
      { id: 'm1', sender: 'broker', senderName: 'Coyote Logistics', date: '2024-04-25 09:00', text: 'We have contacted Werner about the shortage. They are disputing the count. We recommend obtaining independent evidence — dock cameras, forklift logs.' },
      { id: 'm2', sender: 'me', senderName: 'You', date: '2024-04-25 13:00', text: 'Consignee is pulling dock camera footage from April 22. Should have results by April 30.' },
      { id: 'm3', sender: 'insurance', senderName: 'Old Republic', date: '2024-05-02 10:00', text: 'Claim under investigation. Due to disputed facts, resolution may take 30–45 days. Please submit any camera footage or third-party evidence.' },
    ],
    documents: ['BOL_79914_Exception.pdf', 'Shortage_Count_Sheet.pdf', 'Werner_Driver_Statement.pdf'],
  },
  {
    id: 'CLM-2024-003',
    loadId: 'LD-71233',
    claimType: 'damage',
    status: 'paid',
    commodity: 'Food Products (Frozen)',
    origin: 'Chicago, IL',
    destination: 'Atlanta, GA',
    incidentDate: '2024-03-14',
    filedDate: '2024-03-16',
    resolvedDate: '2024-04-28',
    damageAmount: 8900,
    settledAmount: 7400,
    deductible: 1000,
    broker: 'CH Robinson',
    carrier: 'Heartland Express',
    insurance: 'Progressive Commercial',
    policyNumber: 'PC-2024-11044',
    description: 'Reefer unit failed during transit. Temperature excursion: rose to 38°F for 4+ hours. Entire load of frozen seafood ($8,900 replacement value) condemned by consignee. Reefer maintenance logs show unit was overdue for service.',
    photos: [
      { id: 'p1', label: 'Reefer temp log printout', color: '#3182CE', emoji: '🌡️' },
      { id: 'p2', label: 'Condemned product', color: '#C53030', emoji: '🐟' },
      { id: 'p3', label: 'Condemnation notice', color: '#744210', emoji: '📋' },
    ],
    timeline: [
      { date: '2024-03-14 22:15', title: 'Temp alarm triggered', body: 'Driver noticed reefer alarm. Unit reset but temp continued rising.', icon: '🌡️', type: 'filed' },
      { date: '2024-03-15 06:00', title: 'Delivery refused by consignee', body: 'Atlanta Seafood Dist. refused load. Health inspector condemned product.', icon: '🚫', type: 'update' },
      { date: '2024-03-16 09:00', title: 'Claim filed — $8,900', body: 'Progressive Commercial claim PC-2024-11044 opened.', icon: '📋', type: 'filed' },
      { date: '2024-03-22 14:00', title: 'Adjuster inspection', body: 'Reefer unit inspected — compressor fault confirmed. Maintenance gap noted.', icon: '🔧', type: 'update' },
      { date: '2024-04-05 10:00', title: 'Partial liability determined', body: 'Carrier 80% liable; claimant 20% (inadequate packaging insulation).', icon: '⚖️', type: 'update' },
      { date: '2024-04-28 15:30', title: 'Settlement paid — $7,400', body: 'Wire transfer received. Claim closed.', icon: '✅', type: 'payment' },
    ],
    messages: [
      { id: 'm1', sender: 'insurance', senderName: 'Progressive Commercial', date: '2024-03-20 09:00', text: 'Adjuster Gary Fields will inspect the reefer unit and review maintenance logs on March 22. Please have all documentation ready.' },
      { id: 'm2', sender: 'broker', senderName: 'CH Robinson', date: '2024-04-06 11:00', text: 'Heartland has accepted 80% liability. Settlement offer: $7,400. Given legal costs, we recommend accepting.' },
      { id: 'm3', sender: 'me', senderName: 'You', date: '2024-04-07 09:30', text: 'Accepted. Please proceed with settlement.' },
      { id: 'm4', sender: 'system', senderName: 'System', date: '2024-04-28 15:30', text: 'Payment of $7,400 confirmed. Claim CLM-2024-003 marked PAID.' },
    ],
    documents: ['Reefer_TempLog.pdf', 'Condemnation_Notice_ATL.pdf', 'Progressive_Settlement.pdf', 'BOL_71233.pdf'],
  },
  {
    id: 'CLM-2024-004',
    loadId: 'LD-65877',
    claimType: 'theft',
    status: 'open',
    commodity: 'Pharmaceuticals',
    origin: 'Newark, NJ',
    destination: 'Miami, FL',
    incidentDate: '2024-05-01',
    filedDate: '2024-05-02',
    damageAmount: 47000,
    deductible: 5000,
    broker: 'XPO Logistics',
    carrier: 'Prime Inc',
    insurance: 'Travelers Commercial',
    policyNumber: 'TRV-2024-99321',
    description: 'High-value pharmaceutical shipment stolen during driver rest stop near Savannah, GA. Driver parked at unsecured lot (non-approved). Trailer doors were cut. FBI and local police reports filed. $47,000 in controlled substances missing.',
    photos: [
      { id: 'p1', label: 'Trailer door cut lock', color: '#C53030', emoji: '🔓' },
      { id: 'p2', label: 'Police report photo', color: '#2D3748', emoji: '👮' },
      { id: 'p3', label: 'GPS track — truck path', color: '#3182CE', emoji: '🗺️' },
    ],
    timeline: [
      { date: '2024-05-01 03:30', title: 'Driver discovers theft', body: 'Driver woke to find trailer doors open. Items missing. Called 911.', icon: '🚨', type: 'filed' },
      { date: '2024-05-01 05:00', title: 'Police report filed', body: 'Savannah PD report #SV-2024-4421. FBI notified (controlled substances).', icon: '👮', type: 'document' },
      { date: '2024-05-02 09:00', title: 'Claim filed — $47,000', body: 'Travelers policy TRV-2024-99321. High-value cargo claim.', icon: '📋', type: 'filed' },
      { date: '2024-05-03 14:00', title: 'Coverage question raised', body: 'Driver used non-approved rest stop. Policy requires secured lots for pharma.', icon: '⚠️', type: 'dispute' },
      { date: '2024-05-09 10:00', title: 'Investigation ongoing', body: 'Travelers special investigations unit reviewing GPS data + driver compliance.', icon: '🔍', type: 'update' },
    ],
    messages: [
      { id: 'm1', sender: 'insurance', senderName: 'Travelers Commercial', date: '2024-05-03 09:00', text: 'We have received your claim. Per policy addendum §7.3, pharmaceutical loads require overnight parking at approved secure facilities only. Claim coverage is under review pending investigation.' },
      { id: 'm2', sender: 'me', senderName: 'You', date: '2024-05-03 15:00', text: 'Driver was unaware of the addendum requirement. GPS shows 3-hour stop. We are cooperating fully with the investigation and FBI.' },
      { id: 'm3', sender: 'broker', senderName: 'XPO Logistics', date: '2024-05-04 08:30', text: 'We are investigating our part in this. Consignee has been notified. Please advise if you need any additional documentation from our side.' },
    ],
    documents: ['Police_Report_SV4421.pdf', 'FBI_Case_Reference.pdf', 'GPS_Track_May1.pdf', 'TRV_Policy_Addendum.pdf'],
  },
  {
    id: 'CLM-2024-005',
    loadId: 'LD-61002',
    claimType: 'delay',
    status: 'denied',
    commodity: 'Perishable Produce',
    origin: 'Fresno, CA',
    destination: 'Seattle, WA',
    incidentDate: '2024-02-20',
    filedDate: '2024-02-22',
    resolvedDate: '2024-03-30',
    damageAmount: 3200,
    settledAmount: 0,
    deductible: 500,
    broker: 'Transplace',
    carrier: 'USA Truck',
    insurance: 'Canal Insurance',
    policyNumber: 'CNL-2024-31007',
    description: 'Produce delivery delayed by 28 hours due to truck breakdown in Redding, CA. Consignee claims spoilage of $3,200 in strawberries. However, Canal Insurance determined the consignee failed to mitigate losses by refusing to accept partial cooling at nearby facility.',
    photos: [
      { id: 'p1', label: 'Breakdown site — Redding', color: '#4A5568', emoji: '🔧' },
      { id: 'p2', label: 'Produce condition at arrival', color: '#C53030', emoji: '🍓' },
    ],
    timeline: [
      { date: '2024-02-20 11:00', title: 'Truck breakdown — Redding, CA', body: 'Engine failure. Towed to nearest shop. Repair ETA: 22 hours.', icon: '🔧', type: 'filed' },
      { date: '2024-02-21 09:30', title: 'Consignee offered temp cooling — refused', body: 'Broker offered temporary cooling at Sysco facility 12mi away. Consignee refused, wanted full delivery only.', icon: '❌', type: 'update' },
      { date: '2024-02-21 18:00', title: 'Delivery completed — 28hr late', body: 'Product arrived. Consignee accepted with exception.', icon: '🏭', type: 'update' },
      { date: '2024-02-22 10:00', title: 'Claim filed — $3,200', body: 'Canal Insurance claim CNL-2024-31007 opened.', icon: '📋', type: 'filed' },
      { date: '2024-03-30 14:00', title: 'Claim DENIED', body: 'Consignee failed duty to mitigate. Carrier not liable for damages consignee could have reduced.', icon: '🚫', type: 'denial' },
    ],
    messages: [
      { id: 'm1', sender: 'insurance', senderName: 'Canal Insurance', date: '2024-03-25 09:00', text: 'Investigation complete. Records show consignee refused available cooling option on Feb 21. Under UCC §2-715 and Carmack doctrine, claimant must mitigate foreseeable losses. Denial notice to follow.' },
      { id: 'm2', sender: 'me', senderName: 'You', date: '2024-03-25 16:00', text: 'Understood. Will inform consignee of denial rationale.' },
      { id: 'm3', sender: 'system', senderName: 'System', date: '2024-03-30 14:00', text: 'Claim CLM-2024-005 DENIED. No settlement. Case closed.' },
    ],
    documents: ['Breakdown_Service_Report.pdf', 'Sysco_Offer_Refusal_Email.pdf', 'Canal_Denial_Letter.pdf', 'BOL_61002.pdf'],
  },
  {
    id: 'CLM-2024-006',
    loadId: 'LD-55490',
    claimType: 'contamination',
    status: 'disputed',
    commodity: 'Food Ingredients (Flour)',
    origin: 'Kansas City, MO',
    destination: 'Phoenix, AZ',
    incidentDate: '2024-01-30',
    filedDate: '2024-02-01',
    damageAmount: 9600,
    deductible: 750,
    broker: 'Total Quality Logistics',
    carrier: 'Covenant Transport',
    insurance: 'Progressive Commercial',
    policyNumber: 'PC-2024-04891',
    description: '800 bags of specialty flour contaminated with diesel odor. Consignee reports 100% rejection of load ($9,600). Carrier claims trailer was properly cleaned. Broker alleges prior load residue (previous haul was motor oil). Currently awaiting independent lab analysis.',
    photos: [
      { id: 'p1', label: 'Rejected flour bags', color: '#F6E05E', emoji: '🌾' },
      { id: 'p2', label: 'Trailer interior — pre-load', color: '#4A5568', emoji: '🚛' },
      { id: 'p3', label: 'Lab sample collection', color: '#3182CE', emoji: '🧪' },
    ],
    timeline: [
      { date: '2024-01-30 13:00', title: 'Load rejected — contamination', body: 'Phoenix bakery refused load. Diesel odor detected in 100% of bags.', icon: '🚫', type: 'filed' },
      { date: '2024-02-01 09:00', title: 'Claim filed — $9,600', body: 'Progressive Commercial claim opened.', icon: '📋', type: 'filed' },
      { date: '2024-02-08 10:00', title: 'Trailer cleaning records requested', body: 'Covenant provided wash certificate. Prior load: motor oil (Feb 25, Jan).', icon: '📄', type: 'document' },
      { date: '2024-02-15 11:30', title: 'Lab analysis ordered', body: 'Independent lab (Intertek) sent flour samples for hydrocarbon testing.', icon: '🧪', type: 'update' },
      { date: '2024-03-01 09:00', title: 'Lab results pending', body: 'Results expected March 10–15. Both parties awaiting findings.', icon: '⏳', type: 'update' },
    ],
    messages: [
      { id: 'm1', sender: 'broker', senderName: 'Total Quality Logistics', date: '2024-02-05 09:00', text: 'We note that Covenant\'s prior load was motor oil on the same trailer just 4 days prior. Even with a wash cert, cross-contamination risk is documented in FMCSA guidelines for food-grade loads.' },
      { id: 'm2', sender: 'insurance', senderName: 'Progressive Commercial', date: '2024-02-10 10:00', text: 'Ordered Intertek lab analysis. Claim remains open pending results. Do not dispose of any contaminated product until testing is complete.' },
      { id: 'm3', sender: 'me', senderName: 'You', date: '2024-02-12 14:00', text: 'Confirmed — product preserved in consignee cold storage. Intertek sampling completed Feb 12. Results in 3–4 weeks.' },
    ],
    documents: ['Rejection_Notice_Phoenix.pdf', 'Covenant_Wash_Certificate.pdf', 'Prior_Load_Bill.pdf', 'Intertek_Order.pdf'],
  },
  {
    id: 'CLM-2023-091',
    loadId: 'LD-41100',
    claimType: 'damage',
    status: 'paid',
    commodity: 'Furniture (Sofas)',
    origin: 'High Point, NC',
    destination: 'Houston, TX',
    incidentDate: '2023-11-15',
    filedDate: '2023-11-18',
    resolvedDate: '2023-12-22',
    damageAmount: 4200,
    settledAmount: 3600,
    deductible: 500,
    broker: 'Landstar',
    carrier: 'J.B. Hunt',
    insurance: 'Old Republic',
    policyNumber: 'OR-2023-77240',
    description: '6 sectional sofas arrived with torn fabric and broken legs. Improper padding during loading. Consignee accepted with noted exception. Partial settlement reached.',
    photos: [
      { id: 'p1', label: 'Damaged sofa — torn fabric', color: '#B7791F', emoji: '🛋️' },
      { id: 'p2', label: 'Broken leg close-up', color: '#C53030', emoji: '💥' },
    ],
    timeline: [
      { date: '2023-11-15 14:00', title: 'Damage noted at delivery', body: '6 of 24 sofas damaged. Consignee signed with exception.', icon: '⚠️', type: 'filed' },
      { date: '2023-11-18 09:00', title: 'Claim filed — $4,200', body: 'Old Republic claim opened.', icon: '📋', type: 'filed' },
      { date: '2023-12-10 14:00', title: 'Partial settlement offered', body: 'J.B. Hunt accepted liability. Offered $3,600 (85.7%).', icon: '⚖️', type: 'update' },
      { date: '2023-12-22 10:00', title: 'Settlement accepted — $3,600', body: 'Payment received. Claim closed.', icon: '✅', type: 'payment' },
    ],
    messages: [
      { id: 'm1', sender: 'broker', senderName: 'Landstar', date: '2023-12-08 09:00', text: 'J.B. Hunt has reviewed the claim and accepted liability. They are offering $3,600 settlement due to shared liability (original packaging not double-boxed per contract).' },
      { id: 'm2', sender: 'me', senderName: 'You', date: '2023-12-10 11:00', text: 'Accepted. Please proceed with payment.' },
    ],
    documents: ['BOL_41100.pdf', 'Damage_Photos_Report.pdf', 'Settlement_OR2023.pdf'],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; bg: string; icon: string }> = {
  open:      { label: 'Open',      color: '#3182CE', bg: '#EBF8FF', icon: '🔵' },
  disputed:  { label: 'Disputed',  color: '#D69E2E', bg: '#FFFFF0', icon: '⚖️' },
  paid:      { label: 'Paid',      color: '#38A169', bg: '#F0FFF4', icon: '✅' },
  denied:    { label: 'Denied',    color: '#E53E3E', bg: '#FFF5F5', icon: '🚫' },
}

const TYPE_CONFIG: Record<ClaimType, { label: string; icon: string }> = {
  damage:        { label: 'Cargo Damage',    icon: '💥' },
  shortage:      { label: 'Shortage',        icon: '📦' },
  delay:         { label: 'Delay/Spoilage',  icon: '⏰' },
  theft:         { label: 'Theft',           icon: '🔓' },
  contamination: { label: 'Contamination',   icon: '🧪' },
}

const TIMELINE_COLORS: Record<TimelineEvent['type'], string> = {
  filed:    '#3182CE',
  update:   '#718096',
  message:  '#4BAED4',
  document: '#9F7AEA',
  payment:  '#38A169',
  denial:   '#E53E3E',
  dispute:  '#D69E2E',
}

function fmt$(v: number) { return '$' + v.toLocaleString() }
function fmtDate(s: string) {
  const d = new Date(s.replace(' ', 'T'))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDateTime(s: string) {
  const d = new Date(s.replace(' ', 'T'))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}33`,
      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 20px',
      border: '1px solid #E2E8F0', flex: 1,
    }}>
      <div style={{ fontSize: 12, color: '#718096', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function PhotoGrid({ photos }: { photos: ClaimPhoto[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
      {photos.map(p => (
        <div key={p.id} style={{
          borderRadius: 10, overflow: 'hidden',
          border: '1px solid #E2E8F0', cursor: 'pointer',
        }}>
          <div style={{
            height: 90, background: p.color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, borderBottom: '1px solid #E2E8F0',
          }}>
            {p.emoji}
          </div>
          <div style={{ padding: '6px 8px', fontSize: 11, color: '#4A5568', fontWeight: 500 }}>{p.label}</div>
        </div>
      ))}
    </div>
  )
}

function TimelineView({ events }: { events: TimelineEvent[] }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* vertical line */}
      <div style={{
        position: 'absolute', left: 18, top: 20, bottom: 20,
        width: 2, background: '#E2E8F0',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 20, position: 'relative' }}>
            {/* dot */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: TIMELINE_COLORS[ev.type] + '1A',
              border: `2px solid ${TIMELINE_COLORS[ev.type]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, zIndex: 1,
            }}>
              {ev.icon}
            </div>
            <div style={{ paddingTop: 4, flex: 1 }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 2 }}>{fmtDateTime(ev.date)}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D3748', marginBottom: 3 }}>{ev.title}</div>
              <div style={{ fontSize: 13, color: '#4A5568' }}>{ev.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MessagesView({ messages, claimId }: { messages: Message[]; claimId: string }) {
  const [draft, setDraft] = useState('')
  const SENDER_COLORS: Record<MsgSender, string> = {
    me:        '#4BAED4',
    broker:    '#9F7AEA',
    insurance: '#38A169',
    system:    '#718096',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {messages.map(msg => {
          const isMe = msg.sender === 'me'
          return (
            <div key={msg.id} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
                flexDirection: isMe ? 'row-reverse' : 'row',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: SENDER_COLORS[msg.sender] + '22',
                  border: `1px solid ${SENDER_COLORS[msg.sender]}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: SENDER_COLORS[msg.sender],
                }}>
                  {msg.senderName.charAt(0)}
                </div>
                <div style={{ fontSize: 12, color: '#718096' }}>
                  <span style={{ fontWeight: 600, color: '#4A5568' }}>{msg.senderName}</span>
                  {' · '}{fmtDateTime(msg.date)}
                </div>
              </div>
              <div style={{
                maxWidth: '80%',
                background: isMe ? '#4BAED4' : '#F7FAFC',
                color: isMe ? '#fff' : '#2D3748',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px', fontSize: 13,
                border: isMe ? 'none' : '1px solid #E2E8F0',
              }}>
                {msg.text}
                {msg.attachment && (
                  <div style={{
                    marginTop: 8, padding: '6px 10px',
                    background: isMe ? 'rgba(255,255,255,.15)' : '#EBF8FF',
                    borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    📎 {msg.attachment}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* Compose */}
      <div style={{
        border: '1px solid #E2E8F0', borderRadius: 12, padding: 12,
        background: '#F7FAFC',
      }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Write a message to broker or insurance..."
          rows={3}
          style={{
            width: '100%', border: 'none', background: 'transparent',
            resize: 'none', fontSize: 13, color: '#2D3748', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button style={{
            padding: '7px 14px', borderRadius: 8, border: '1px solid #E2E8F0',
            background: '#fff', fontSize: 12, cursor: 'pointer', color: '#718096',
          }}>
            📎 Attach
          </button>
          <button
            onClick={() => setDraft('')}
            style={{
              padding: '7px 18px', borderRadius: 8, border: 'none',
              background: draft.trim() ? '#4BAED4' : '#CBD5E0',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

function DocumentsView({ docs }: { docs: string[] }) {
  const icons: Record<string, string> = { '.pdf': '📄', '.jpg': '🖼️', '.png': '🖼️', '.xlsx': '📊' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {docs.map(doc => {
        const ext = doc.includes('.') ? '.' + doc.split('.').pop()! : ''
        const icon = icons[ext] || '📁'
        return (
          <div key={doc} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            background: '#F7FAFC', borderRadius: 10, border: '1px solid #E2E8F0',
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{doc}</div>
              <div style={{ fontSize: 11, color: '#A0AEC0' }}>Claim document</div>
            </div>
            <button style={{
              padding: '5px 12px', borderRadius: 7, border: '1px solid #4BAED4',
              background: '#EBF8FF', color: '#3182CE', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              View
            </button>
          </div>
        )
      })}
      <button style={{
        marginTop: 4, padding: '10px', borderRadius: 10,
        border: '2px dashed #CBD5E0', background: 'transparent',
        color: '#718096', fontSize: 13, cursor: 'pointer', fontWeight: 600,
      }}>
        + Upload Document
      </button>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function ClaimDetail({ claim }: { claim: Claim }) {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'messages' | 'documents'>('overview')
  const cfg = STATUS_CONFIG[claim.status]
  const typeCfg = TYPE_CONFIG[claim.claimType]
  const recovery = claim.settledAmount != null
    ? Math.round((claim.settledAmount / claim.damageAmount) * 100)
    : null

  const TABS: { key: typeof tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'timeline', label: 'Timeline', icon: '🕐' },
    { key: 'messages', label: 'Messages', icon: '💬' },
    { key: 'documents', label: 'Documents', icon: '📁' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{typeCfg.icon}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#2D3748' }}>{claim.id}</span>
              <StatusBadge status={claim.status} />
            </div>
            <div style={{ fontSize: 15, color: '#4A5568', fontWeight: 600 }}>{typeCfg.label} — {claim.commodity}</div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
              {claim.origin} → {claim.destination} · Load {claim.loadId}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color }}>{fmt$(claim.damageAmount)}</div>
            <div style={{ fontSize: 12, color: '#A0AEC0' }}>Claimed amount</div>
            {claim.settledAmount != null && (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#38A169', marginTop: 4 }}>
                {fmt$(claim.settledAmount)} settled ({recovery}%)
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.key ? '#4BAED4' : 'transparent',
              color: tab === t.key ? '#fff' : '#718096',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            }}>
              {t.icon} {t.label}
              {t.key === 'messages' && (
                <span style={{
                  marginLeft: 5, background: tab === t.key ? 'rgba(255,255,255,.3)' : '#E2E8F0',
                  color: tab === t.key ? '#fff' : '#4A5568',
                  borderRadius: 10, padding: '1px 6px', fontSize: 11,
                }}>{claim.messages.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Info grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            }}>
              {[
                { label: 'Incident Date', value: fmtDate(claim.incidentDate) },
                { label: 'Filed Date', value: fmtDate(claim.filedDate) },
                { label: 'Broker', value: claim.broker },
                { label: 'Carrier', value: claim.carrier },
                { label: 'Insurance', value: claim.insurance },
                { label: 'Policy #', value: claim.policyNumber },
                { label: 'Deductible', value: fmt$(claim.deductible) },
                { label: claim.resolvedDate ? 'Resolved' : 'Status', value: claim.resolvedDate ? fmtDate(claim.resolvedDate) : STATUS_CONFIG[claim.status].label },
              ].map(row => (
                <div key={row.label} style={{
                  background: '#F7FAFC', borderRadius: 10, padding: '10px 14px',
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 3 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{row.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: '#FFFAF0', borderRadius: 10, padding: '14px 16px', border: '1px solid #FEEBC8' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#744210', marginBottom: 6 }}>📝 Incident Description</div>
              <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.6 }}>{claim.description}</div>
            </div>

            {/* Photos */}
            {claim.photos.length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748', marginBottom: 10 }}>
                  📸 Evidence Photos ({claim.photos.length})
                </div>
                <PhotoGrid photos={claim.photos} />
              </div>
            )}
          </div>
        )}

        {tab === 'timeline' && <TimelineView events={claim.timeline} />}
        {tab === 'messages' && <MessagesView messages={claim.messages} claimId={claim.id} />}
        {tab === 'documents' && <DocumentsView docs={claim.documents} />}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
interface Props { role: UserRole }

export default function ClaimsDamagePage({ role }: Props) {
  const [selectedId, setSelectedId] = useState<string>(MOCK_CLAIMS[0].id)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ClaimType | 'all'>('all')
  const [showNewClaim, setShowNewClaim] = useState(false)

  const selected = MOCK_CLAIMS.find(c => c.id === selectedId)!

  const filtered = useMemo(() => {
    return MOCK_CLAIMS.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (typeFilter   !== 'all' && c.claimType !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return c.id.toLowerCase().includes(q) ||
          c.commodity.toLowerCase().includes(q) ||
          c.broker.toLowerCase().includes(q) ||
          c.carrier.toLowerCase().includes(q) ||
          c.loadId.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, statusFilter, typeFilter])

  // Summary stats
  const stats = useMemo(() => {
    const open     = MOCK_CLAIMS.filter(c => c.status === 'open').length
    const disputed = MOCK_CLAIMS.filter(c => c.status === 'disputed').length
    const paid     = MOCK_CLAIMS.filter(c => c.status === 'paid').length
    const denied   = MOCK_CLAIMS.filter(c => c.status === 'denied').length
    const totalClaimed  = MOCK_CLAIMS.reduce((a, c) => a + c.damageAmount, 0)
    const totalSettled  = MOCK_CLAIMS.reduce((a, c) => a + (c.settledAmount ?? 0), 0)
    const recoveryRate  = Math.round((totalSettled / MOCK_CLAIMS.filter(c => c.status === 'paid').reduce((a, c) => a + c.damageAmount, 0)) * 100)
    return { open, disputed, paid, denied, totalClaimed, totalSettled, recoveryRate }
  }, [])

  // Loss by type bar data
  const lossByType = useMemo(() => {
    const totals: Record<string, number> = {}
    MOCK_CLAIMS.forEach(c => {
      totals[c.claimType] = (totals[c.claimType] || 0) + c.damageAmount
    })
    const max = Math.max(...Object.values(totals))
    return Object.entries(totals).map(([type, amount]) => ({
      type: type as ClaimType,
      amount,
      pct: Math.round((amount / max) * 100),
    })).sort((a, b) => b.amount - a.amount)
  }, [])

  const _ = role // used for future role-gating

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 0 }}>
      {/* ── Top bar ── */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid #E2E8F0',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#2D3748' }}>
              ⚠️ Claims & Damage Management
            </h1>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
              Track cargo incidents, insurance claims, and recovery status
            </div>
          </div>
          <button
            onClick={() => setShowNewClaim(true)}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#4BAED4', color: '#fff', fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            + File New Claim
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatCard label="Open Claims"      value={stats.open}      color="#3182CE"  sub="Awaiting resolution" />
          <StatCard label="Disputed"          value={stats.disputed}  color="#D69E2E"  sub="Under investigation" />
          <StatCard label="Paid Out"          value={stats.paid}      color="#38A169"  sub="Claims resolved" />
          <StatCard label="Denied"            value={stats.denied}    color="#E53E3E"  sub="Claims rejected" />
          <StatCard label="Total Claimed"     value={fmt$(stats.totalClaimed)}  color="#2D3748" sub="All claims combined" />
          <StatCard label="Total Recovered"   value={fmt$(stats.totalSettled)}  color="#38A169" sub={`${stats.recoveryRate}% recovery rate`} />
        </div>
      </div>

      {/* ── Body: list + detail ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left: list */}
        <div style={{
          width: 360, flexShrink: 0, borderRight: '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column', background: '#F7FAFC',
        }}>
          {/* Filters */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search claims, loads, carriers..."
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 9,
                border: '1px solid #E2E8F0', fontSize: 13, color: '#2D3748',
                outline: 'none', marginBottom: 10, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'open', 'disputed', 'paid', 'denied'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '4px 11px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
                  background: statusFilter === s ? '#4BAED4' : '#EDF2F7',
                  color: statusFilter === s ? '#fff' : '#4A5568',
                  fontWeight: statusFilter === s ? 700 : 400,
                }}>
                  {s === 'all' ? 'All' : STATUS_CONFIG[s as ClaimStatus].label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {(['all', 'damage', 'shortage', 'delay', 'theft', 'contamination'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={{
                  padding: '4px 11px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11,
                  background: typeFilter === t ? '#2D7A9A' : '#EDF2F7',
                  color: typeFilter === t ? '#fff' : '#718096',
                  fontWeight: typeFilter === t ? 700 : 400,
                }}>
                  {t === 'all' ? 'All Types' : TYPE_CONFIG[t as ClaimType].label}
                </button>
              ))}
            </div>
          </div>

          {/* Loss by type mini chart */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Loss by Type
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {lossByType.map(row => (
                <div key={row.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, width: 18 }}>{TYPE_CONFIG[row.type].icon}</div>
                  <div style={{ flex: 1, height: 6, background: '#EDF2F7', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${row.pct}%`, height: '100%', background: '#4BAED4', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#4A5568', fontWeight: 700, minWidth: 52, textAlign: 'right' }}>
                    {fmt$(row.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Claim list */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#A0AEC0', fontSize: 13 }}>
                No claims match filters
              </div>
            ) : (
              filtered.map(c => {
                const cfg = STATUS_CONFIG[c.status]
                const tc = TYPE_CONFIG[c.claimType]
                const isActive = c.id === selectedId
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px',
                      border: 'none', borderBottom: '1px solid #E2E8F0',
                      background: isActive ? '#EBF8FF' : '#fff',
                      cursor: 'pointer', display: 'block',
                      borderLeft: isActive ? '3px solid #4BAED4' : '3px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{tc.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{c.id}</span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 3 }}>{c.commodity}</div>
                    <div style={{ fontSize: 11, color: '#718096', marginBottom: 6 }}>
                      {c.origin.split(',')[0]} → {c.destination.split(',')[0]} · {c.loadId}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: cfg.color }}>
                        {fmt$(c.damageAmount)}
                        {c.settledAmount != null && c.settledAmount > 0 && (
                          <span style={{ fontSize: 11, color: '#38A169', marginLeft: 6 }}>
                            → {fmt$(c.settledAmount)} settled
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>{fmtDate(c.filedDate)}</div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
          {selected ? (
            <ClaimDetail claim={selected} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#A0AEC0', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48 }}>⚠️</div>
              <div style={{ fontSize: 16 }}>Select a claim to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Claim Modal ── */}
      {showNewClaim && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}
          onClick={() => setShowNewClaim(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: '28px 32px',
              width: 500, boxShadow: '0 20px 60px rgba(0,0,0,.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: '#2D3748' }}>
              📋 File New Claim
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Load ID', placeholder: 'e.g. LD-99001' },
                { label: 'Commodity', placeholder: 'e.g. Electronics, Produce' },
                { label: 'Claim Amount ($)', placeholder: 'e.g. 5000' },
                { label: 'Incident Date', placeholder: 'YYYY-MM-DD' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 5 }}>{f.label}</div>
                  <input
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 9,
                      border: '1px solid #E2E8F0', fontSize: 13, color: '#2D3748',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 5 }}>Claim Type</div>
                <select style={{
                  width: '100%', padding: '9px 12px', borderRadius: 9,
                  border: '1px solid #E2E8F0', fontSize: 13, color: '#2D3748', outline: 'none',
                }}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 5 }}>Description</div>
                <textarea
                  rows={3}
                  placeholder="Describe the incident in detail..."
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 9,
                    border: '1px solid #E2E8F0', fontSize: 13, color: '#2D3748',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewClaim(false)}
                style={{
                  padding: '10px 20px', borderRadius: 9, border: '1px solid #E2E8F0',
                  background: '#fff', fontSize: 13, cursor: 'pointer', color: '#718096',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewClaim(false)}
                style={{
                  padding: '10px 24px', borderRadius: 9, border: 'none',
                  background: '#4BAED4', color: '#fff', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
