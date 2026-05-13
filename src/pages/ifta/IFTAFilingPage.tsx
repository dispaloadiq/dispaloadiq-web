import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface JurisdictionData {
  state: string
  stateName: string
  miles: number
  fuelPurchased: number
  taxRate: number
}

interface FuelStop {
  state: string
  gallons: number
  pricePerGallon: number
  total: number
  station: string
}

interface Trip {
  id: string
  date: string
  from: string
  fromState: string
  to: string
  toState: string
  totalMiles: number
  stateBreakdown: { state: string; miles: number }[]
  fuelStops: FuelStop[]
}

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
type SortKey = 'state' | 'miles' | 'fuelConsumed' | 'fuelPurchased' | 'taxRate' | 'taxOwed' | 'taxPaid' | 'net'
type SortDir = 'asc' | 'desc'

// ── Tax Rates (2024, $/gallon) ────────────────────────────────────────────────

const TAX_RATES: Record<string, number> = {
  IL: 0.455, MO: 0.195, AR: 0.285, TX: 0.200, LA: 0.200, MS: 0.188,
  AL: 0.290, GA: 0.330, FL: 0.362, SC: 0.280, NC: 0.401, VA: 0.302,
  MD: 0.470, DE: 0.230, NJ: 0.418, NY: 0.473, NM: 0.260, AZ: 0.190,
  CA: 0.798, OR: 0.380, WA: 0.494, CO: 0.220, KS: 0.240, KY: 0.246,
  IN: 0.540, TN: 0.270,
}

const STATE_NAMES: Record<string, string> = {
  IL: 'Illinois', MO: 'Missouri', AR: 'Arkansas', TX: 'Texas', LA: 'Louisiana',
  MS: 'Mississippi', AL: 'Alabama', GA: 'Georgia', FL: 'Florida', SC: 'South Carolina',
  NC: 'North Carolina', VA: 'Virginia', MD: 'Maryland', DE: 'Delaware', NJ: 'New Jersey',
  NY: 'New York', NM: 'New Mexico', AZ: 'Arizona', CA: 'California', OR: 'Oregon',
  WA: 'Washington', CO: 'Colorado', KS: 'Kansas', KY: 'Kentucky', IN: 'Indiana',
  TN: 'Tennessee',
}

// ── Mock Trip Data — Q1 2024 ──────────────────────────────────────────────────

const TRIPS_Q1: Trip[] = [
  {
    id: 'T001', date: '2024-01-08', from: 'Chicago', fromState: 'IL',
    to: 'Dallas', toState: 'TX', totalMiles: 850,
    stateBreakdown: [{ state: 'IL', miles: 120 }, { state: 'MO', miles: 200 }, { state: 'AR', miles: 180 }, { state: 'TX', miles: 350 }],
    fuelStops: [
      { state: 'IL', gallons: 50, pricePerGallon: 3.89, total: 194.50, station: 'Pilot Flying J — Joliet, IL' },
      { state: 'TX', gallons: 80, pricePerGallon: 3.75, total: 300.00, station: 'Love\'s — Dallas, TX' },
    ],
  },
  {
    id: 'T002', date: '2024-01-14', from: 'Dallas', fromState: 'TX',
    to: 'Atlanta', toState: 'GA', totalMiles: 780,
    stateBreakdown: [{ state: 'TX', miles: 200 }, { state: 'LA', miles: 120 }, { state: 'MS', miles: 100 }, { state: 'AL', miles: 120 }, { state: 'GA', miles: 240 }],
    fuelStops: [
      { state: 'TX', gallons: 40, pricePerGallon: 3.71, total: 148.40, station: 'Pilot Flying J — Texarkana, TX' },
      { state: 'GA', gallons: 70, pricePerGallon: 3.85, total: 269.50, station: 'TA Travel Center — Atlanta, GA' },
    ],
  },
  {
    id: 'T003', date: '2024-01-22', from: 'Atlanta', fromState: 'GA',
    to: 'Miami', toState: 'FL', totalMiles: 660,
    stateBreakdown: [{ state: 'GA', miles: 200 }, { state: 'FL', miles: 460 }],
    fuelStops: [
      { state: 'FL', gallons: 90, pricePerGallon: 3.92, total: 352.80, station: 'Pilot Flying J — Orlando, FL' },
    ],
  },
  {
    id: 'T004', date: '2024-01-30', from: 'Miami', fromState: 'FL',
    to: 'Charlotte', toState: 'NC', totalMiles: 650,
    stateBreakdown: [{ state: 'FL', miles: 200 }, { state: 'GA', miles: 180 }, { state: 'SC', miles: 100 }, { state: 'NC', miles: 170 }],
    fuelStops: [
      { state: 'GA', gallons: 60, pricePerGallon: 3.80, total: 228.00, station: 'Love\'s — Savannah, GA' },
      { state: 'NC', gallons: 55, pricePerGallon: 3.78, total: 207.90, station: 'Pilot Flying J — Charlotte, NC' },
    ],
  },
  {
    id: 'T005', date: '2024-02-05', from: 'Charlotte', fromState: 'NC',
    to: 'New York', toState: 'NY', totalMiles: 630,
    stateBreakdown: [{ state: 'NC', miles: 100 }, { state: 'VA', miles: 200 }, { state: 'MD', miles: 80 }, { state: 'DE', miles: 30 }, { state: 'NJ', miles: 80 }, { state: 'NY', miles: 140 }],
    fuelStops: [
      { state: 'VA', gallons: 80, pricePerGallon: 3.95, total: 316.00, station: 'TA Travel Center — Richmond, VA' },
      { state: 'NY', gallons: 60, pricePerGallon: 4.12, total: 247.20, station: 'Pilot Flying J — Woodbury, NY' },
    ],
  },
  {
    id: 'T006', date: '2024-02-12', from: 'Houston', fromState: 'TX',
    to: 'Phoenix', toState: 'AZ', totalMiles: 1200,
    stateBreakdown: [{ state: 'TX', miles: 300 }, { state: 'NM', miles: 400 }, { state: 'AZ', miles: 500 }],
    fuelStops: [
      { state: 'TX', gallons: 60, pricePerGallon: 3.68, total: 220.80, station: 'Pilot Flying J — San Antonio, TX' },
      { state: 'NM', gallons: 80, pricePerGallon: 3.75, total: 300.00, station: 'Love\'s — Albuquerque, NM' },
      { state: 'AZ', gallons: 70, pricePerGallon: 4.05, total: 283.50, station: 'TA Travel Center — Phoenix, AZ' },
    ],
  },
  {
    id: 'T007', date: '2024-02-19', from: 'Phoenix', fromState: 'AZ',
    to: 'Los Angeles', toState: 'CA', totalMiles: 370,
    stateBreakdown: [{ state: 'AZ', miles: 100 }, { state: 'CA', miles: 270 }],
    fuelStops: [
      { state: 'CA', gallons: 80, pricePerGallon: 4.65, total: 372.00, station: 'Pilot Flying J — Barstow, CA' },
    ],
  },
  {
    id: 'T008', date: '2024-02-25', from: 'Los Angeles', fromState: 'CA',
    to: 'Portland', toState: 'OR', totalMiles: 1085,
    stateBreakdown: [{ state: 'CA', miles: 600 }, { state: 'OR', miles: 485 }],
    fuelStops: [
      { state: 'CA', gallons: 100, pricePerGallon: 4.58, total: 458.00, station: 'Love\'s — Sacramento, CA' },
      { state: 'OR', gallons: 80, pricePerGallon: 3.95, total: 316.00, station: 'Pilot Flying J — Portland, OR' },
    ],
  },
  {
    id: 'T009', date: '2024-03-04', from: 'Portland', fromState: 'OR',
    to: 'Seattle', toState: 'WA', totalMiles: 175,
    stateBreakdown: [{ state: 'OR', miles: 100 }, { state: 'WA', miles: 75 }],
    fuelStops: [
      { state: 'WA', gallons: 40, pricePerGallon: 4.10, total: 164.00, station: 'TA Travel Center — Tacoma, WA' },
    ],
  },
  {
    id: 'T010', date: '2024-03-10', from: 'Denver', fromState: 'CO',
    to: 'Kansas City', toState: 'MO', totalMiles: 600,
    stateBreakdown: [{ state: 'CO', miles: 350 }, { state: 'KS', miles: 150 }, { state: 'MO', miles: 100 }],
    fuelStops: [
      { state: 'CO', gallons: 90, pricePerGallon: 3.85, total: 346.50, station: 'Pilot Flying J — Limon, CO' },
      { state: 'MO', gallons: 30, pricePerGallon: 3.72, total: 111.60, station: 'Love\'s — Kansas City, MO' },
    ],
  },
  {
    id: 'T011', date: '2024-03-17', from: 'Kansas City', fromState: 'MO',
    to: 'Nashville', toState: 'TN', totalMiles: 550,
    stateBreakdown: [{ state: 'MO', miles: 200 }, { state: 'TN', miles: 350 }],
    fuelStops: [
      { state: 'TN', gallons: 80, pricePerGallon: 3.69, total: 295.20, station: 'Pilot Flying J — Nashville, TN' },
    ],
  },
  {
    id: 'T012', date: '2024-03-24', from: 'Nashville', fromState: 'TN',
    to: 'Chicago', toState: 'IL', totalMiles: 470,
    stateBreakdown: [{ state: 'TN', miles: 100 }, { state: 'KY', miles: 120 }, { state: 'IN', miles: 100 }, { state: 'IL', miles: 150 }],
    fuelStops: [
      { state: 'KY', gallons: 60, pricePerGallon: 3.78, total: 226.80, station: 'Love\'s — Louisville, KY' },
      { state: 'IL', gallons: 50, pricePerGallon: 3.91, total: 195.50, station: 'TA Travel Center — Chicago, IL' },
    ],
  },
]

// ── State label positions for SVG map ────────────────────────────────────────

const STATE_POSITIONS: { state: string; x: number; y: number }[] = [
  { state: 'WA', x: 80,  y: 55  },
  { state: 'OR', x: 75,  y: 100 },
  { state: 'CA', x: 65,  y: 185 },
  { state: 'NV', x: 105, y: 155 },
  { state: 'AZ', x: 130, y: 220 },
  { state: 'CO', x: 185, y: 180 },
  { state: 'NM', x: 175, y: 230 },
  { state: 'ID', x: 120, y: 90  },
  { state: 'UT', x: 145, y: 160 },
  { state: 'WY', x: 175, y: 115 },
  { state: 'MT', x: 175, y: 65  },
  { state: 'ND', x: 255, y: 65  },
  { state: 'SD', x: 255, y: 100 },
  { state: 'NE', x: 260, y: 140 },
  { state: 'KS', x: 265, y: 175 },
  { state: 'TX', x: 255, y: 250 },
  { state: 'OK', x: 275, y: 215 },
  { state: 'MN', x: 320, y: 75  },
  { state: 'IA', x: 325, y: 130 },
  { state: 'MO', x: 330, y: 175 },
  { state: 'AR', x: 335, y: 215 },
  { state: 'LA', x: 340, y: 260 },
  { state: 'WI', x: 360, y: 100 },
  { state: 'IL', x: 370, y: 150 },
  { state: 'TN', x: 390, y: 210 },
  { state: 'MS', x: 375, y: 250 },
  { state: 'AL', x: 400, y: 250 },
  { state: 'GA', x: 430, y: 250 },
  { state: 'FL', x: 445, y: 300 },
  { state: 'SC', x: 460, y: 245 },
  { state: 'NC', x: 465, y: 220 },
  { state: 'VA', x: 490, y: 195 },
  { state: 'KY', x: 415, y: 195 },
  { state: 'IN', x: 390, y: 175 },
  { state: 'OH', x: 430, y: 155 },
  { state: 'MI', x: 420, y: 115 },
  { state: 'WV', x: 455, y: 170 },
  { state: 'MD', x: 500, y: 175 },
  { state: 'DE', x: 515, y: 165 },
  { state: 'NJ', x: 525, y: 150 },
  { state: 'NY', x: 520, y: 120 },
  { state: 'PA', x: 490, y: 145 },
  { state: 'CT', x: 540, y: 135 },
  { state: 'MA', x: 550, y: 120 },
  { state: 'VT', x: 540, y: 100 },
  { state: 'NH', x: 555, y: 105 },
  { state: 'ME', x: 565, y: 85  },
]

// ── Quarter configs ───────────────────────────────────────────────────────────

const QUARTERS: { q: Quarter; year: number; label: string; status: string; statusColor: string; deadline: string }[] = [
  { q: 'Q1', year: 2024, label: 'Q1 2024', status: 'Filed', statusColor: '#38A169', deadline: 'Apr 30, 2024' },
  { q: 'Q2', year: 2024, label: 'Q2 2024', status: 'Due Jul 31', statusColor: '#D69E2E', deadline: 'Jul 31, 2024' },
  { q: 'Q3', year: 2024, label: 'Q3 2024', status: 'Upcoming',   statusColor: '#A0AEC0', deadline: 'Oct 31, 2024' },
  { q: 'Q4', year: 2024, label: 'Q4 2024', status: 'Upcoming',   statusColor: '#A0AEC0', deadline: 'Jan 31, 2025' },
]

// ── Helper ────────────────────────────────────────────────────────────────────

function fmt$(n: number) { return '$' + Math.abs(n).toFixed(2) }
function fmtN(n: number, dec = 1) { return n.toFixed(dec) }

// ── Main Component ────────────────────────────────────────────────────────────

export default function IFTAFilingPage({ role }: { role: UserRole }) {
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q2')
  const [activeTab, setActiveTab] = useState<'summary' | 'states' | 'trips' | 'fuel' | 'worksheet'>('summary')
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('state')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showToast, setShowToast] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [certChecked, setCertChecked] = useState(false)
  const [carrierName, setCarrierName] = useState('Miller Trucking LLC')
  const [iftaLicense, setIftaLicense] = useState('IFTA-2024-IL-88412')
  const [fleetSize, setFleetSize] = useState('3')
  const [sigName, setSigName] = useState('James Miller')
  const [sigTitle, setSigTitle] = useState('Owner / Operator')
  const [sigPhone, setSigPhone] = useState('(312) 555-0192')

  const trips = selectedQuarter === 'Q1' ? TRIPS_Q1 : TRIPS_Q1 // Q2-Q4 show same demo data

  // ── Aggregate jurisdictions from trips ──────────────────────────────────────

  const jurisdictions = useMemo<JurisdictionData[]>(() => {
    const map: Record<string, { miles: number; fuelPurchased: number }> = {}

    for (const trip of trips) {
      for (const sb of trip.stateBreakdown) {
        if (!map[sb.state]) map[sb.state] = { miles: 0, fuelPurchased: 0 }
        map[sb.state].miles += sb.miles
      }
      for (const fs of trip.fuelStops) {
        if (!map[fs.state]) map[fs.state] = { miles: 0, fuelPurchased: 0 }
        map[fs.state].fuelPurchased += fs.gallons
      }
    }

    return Object.entries(map)
      .filter(([state]) => TAX_RATES[state] !== undefined)
      .map(([state, data]) => ({
        state,
        stateName: STATE_NAMES[state] ?? state,
        miles: data.miles,
        fuelPurchased: data.fuelPurchased,
        taxRate: TAX_RATES[state],
      }))
  }, [trips])

  // ── Totals & computed values ─────────────────────────────────────────────────

  const { totalMiles, totalGallons, mpg, rows, totalNet, totalTaxOwed, totalTaxPaid, totalFuelConsumed } = useMemo(() => {
    const totalMiles = jurisdictions.reduce((s, j) => s + j.miles, 0)
    const totalGallons = jurisdictions.reduce((s, j) => s + j.fuelPurchased, 0)
    const mpg = totalGallons > 0 ? totalMiles / totalGallons : 0

    const rows = jurisdictions.map(j => {
      const fuelConsumed = totalMiles > 0 ? (j.miles / totalMiles) * totalGallons : 0
      const taxOwed = fuelConsumed * j.taxRate
      const taxPaid = j.fuelPurchased * j.taxRate
      const net = taxOwed - taxPaid
      return { ...j, fuelConsumed, taxOwed, taxPaid, net }
    })

    const totalNet = rows.reduce((s, r) => s + r.net, 0)
    const totalTaxOwed = rows.reduce((s, r) => s + r.taxOwed, 0)
    const totalTaxPaid = rows.reduce((s, r) => s + r.taxPaid, 0)
    const totalFuelConsumed = rows.reduce((s, r) => s + r.fuelConsumed, 0)

    return { totalMiles, totalGallons, mpg, rows, totalNet, totalTaxOwed, totalTaxPaid, totalFuelConsumed }
  }, [jurisdictions])

  // ── Sorted rows ──────────────────────────────────────────────────────────────

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let av: string | number = 0
      let bv: string | number = 0
      if (sortKey === 'state') { av = a.state; bv = b.state }
      else if (sortKey === 'miles') { av = a.miles; bv = b.miles }
      else if (sortKey === 'fuelConsumed') { av = a.fuelConsumed; bv = b.fuelConsumed }
      else if (sortKey === 'fuelPurchased') { av = a.fuelPurchased; bv = b.fuelPurchased }
      else if (sortKey === 'taxRate') { av = a.taxRate; bv = b.taxRate }
      else if (sortKey === 'taxOwed') { av = a.taxOwed; bv = b.taxOwed }
      else if (sortKey === 'taxPaid') { av = a.taxPaid; bv = b.taxPaid }
      else if (sortKey === 'net') { av = a.net; bv = b.net }

      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
  }, [rows, sortKey, sortDir])

  // ── All fuel stops ───────────────────────────────────────────────────────────

  const allFuelStops = useMemo(() => {
    return trips.flatMap(t =>
      t.fuelStops.map(fs => ({ ...fs, date: t.date, tripId: t.id }))
    ).sort((a, b) => a.date.localeCompare(b.date))
  }, [trips])

  // ── By-state fuel subtotals ──────────────────────────────────────────────────

  const fuelByState = useMemo(() => {
    const map: Record<string, { gallons: number; total: number }> = {}
    for (const fs of allFuelStops) {
      if (!map[fs.state]) map[fs.state] = { gallons: 0, total: 0 }
      map[fs.state].gallons += fs.gallons
      map[fs.state].total += fs.total
    }
    return Object.entries(map).sort((a, b) => b[1].gallons - a[1].gallons)
  }, [allFuelStops])

  // ── State sets for map ───────────────────────────────────────────────────────

  const activeStates = useMemo(() => new Set(jurisdictions.map(j => j.state)), [jurisdictions])

  // ── Sort handler ─────────────────────────────────────────────────────────────

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  function sortArrow(key: SortKey) {
    if (sortKey !== key) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  // ── CSV export ───────────────────────────────────────────────────────────────

  function exportCSV() {
    const header = 'Jurisdiction,State,Miles,Fuel Consumed (gal),Fuel Purchased (gal),Tax Rate,Tax Owed,Tax Paid,Net\n'
    const body = sortedRows.map(r =>
      `${r.stateName},${r.state},${r.miles},${r.fuelConsumed.toFixed(2)},${r.fuelPurchased},${r.taxRate.toFixed(3)},${r.taxOwed.toFixed(2)},${r.taxPaid.toFixed(2)},${r.net.toFixed(2)}`
    ).join('\n')
    const blob = new Blob([header + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'IFTA_Q1_2024.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ── PDF Toast ────────────────────────────────────────────────────────────────

  function handlePDFDownload() {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // ── Shared styles ─────────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid var(--c-divider, #F0F4F8)',
    borderRadius: 12,
    padding: 20,
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 700,
    color: '#718096',
    background: '#F7FAFC',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    userSelect: 'none',
  }

  const tdStyle: React.CSSProperties = {
    padding: '10px 14px',
    fontSize: 13,
    color: '#2D3748',
    borderBottom: '1px solid #F0F4F8',
  }

  const tdTotals: React.CSSProperties = {
    ...tdStyle,
    fontWeight: 700,
    background: '#F7FAFC',
    borderBottom: 'none',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    background: active ? 'var(--c-primary, #4BAED4)' : 'transparent',
    color: active ? '#fff' : '#718096',
    transition: 'all 0.15s',
  })

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: '#2D3748',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const quarterConfig = QUARTERS.find(q => q.q === selectedQuarter) ?? QUARTERS[1]

  // ── RENDER ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1280, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* ── Toast ── */}
      {showToast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
          background: '#2D3748', color: '#fff', borderRadius: 12,
          padding: '14px 22px', fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeInUp 0.3s ease',
        }}>
          <span style={{ color: '#68D391', fontSize: 18 }}>✓</span>
          IFTA {selectedQuarter} 2024 Report downloaded — 8 pages
        </div>
      )}

      {/* ── Submit Modal ── */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', marginBottom: 8 }}>
              Submit IFTA {selectedQuarter} 2024 Filing
            </div>
            <div style={{ fontSize: 14, color: '#718096', marginBottom: 20, lineHeight: 1.6 }}>
              You are about to electronically submit your IFTA quarterly fuel tax return
              for <strong>{quarterConfig.label}</strong> to the base jurisdiction (Illinois).
              Net amount: <strong style={{ color: totalNet >= 0 ? '#E53E3E' : '#38A169' }}>
                {totalNet >= 0 ? `${fmt$(totalNet)} due` : `${fmt$(totalNet)} refund`}
              </strong>
            </div>
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#C53030' }}>
              This is a demo environment. In production, this would submit to your state\'s IFTA portal via API.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSubmitModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#718096' }}>
                Cancel
              </button>
              <button onClick={() => setShowSubmitModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--c-primary, #4BAED4)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--c-dark, #1A2535)' }}>
            🗂️ IFTA Filing
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#718096' }}>
            International Fuel Tax Agreement — Quarterly Fuel Use Tax Return
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, color: '#718096' }}>Carrier: <strong style={{ color: '#2D3748' }}>{carrierName}</strong></div>
          <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
          <div style={{ fontSize: 13, color: '#718096' }}>License: <strong style={{ color: '#2D3748' }}>{iftaLicense}</strong></div>
        </div>
      </div>

      {/* ── Quarter Selector ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {QUARTERS.map(qc => (
          <button
            key={qc.q}
            onClick={() => setSelectedQuarter(qc.q)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
              background: selectedQuarter === qc.q ? 'var(--c-dark, #1A2535)' : '#fff',
              color: selectedQuarter === qc.q ? '#fff' : '#2D3748',
              fontWeight: 600, fontSize: 13,
              boxShadow: selectedQuarter === qc.q ? '0 4px 12px rgba(26,37,53,0.25)' : 'none',
              border: selectedQuarter !== qc.q ? '1px solid #E2E8F0' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {qc.label}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: selectedQuarter === qc.q ? 'rgba(255,255,255,0.2)' : `${qc.statusColor}22`,
              color: selectedQuarter === qc.q ? '#fff' : qc.statusColor,
            }}>
              {qc.status}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filing Status Banner ── */}
      {selectedQuarter === 'Q1' ? (
        <div style={{
          ...card,
          background: 'linear-gradient(135deg, #F0FFF4, #C6F6D5)',
          border: '1px solid #9AE6B4',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 36 }}>✅</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#276749' }}>Q1 2024 Filing Complete</div>
            <div style={{ fontSize: 13, color: '#2F855A', marginTop: 2 }}>
              Filed on Apr 28, 2024 · Confirmation #IFTA-2024-IL-Q1-00841 · Net paid: $342.18
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={handlePDFDownload} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #276749', background: '#fff', color: '#276749', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              📄 Download Receipt
            </button>
          </div>
        </div>
      ) : selectedQuarter === 'Q2' ? (
        <div style={{
          ...card,
          background: 'linear-gradient(135deg, #FFFFF0, #FEFCBF)',
          border: '1px solid #F6E05E',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 36 }}>⏳</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#744210' }}>Q2 2024 — Filing in Progress</div>
            <div style={{ fontSize: 13, color: '#975A16', marginTop: 2 }}>
              Deadline: <strong>July 31, 2024</strong> · {totalNet >= 0 ? `Amount due: ${fmt$(totalNet)}` : `Refund expected: ${fmt$(totalNet)}`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => setActiveTab('worksheet')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--c-primary, #4BAED4)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Complete Filing →
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          ...card,
          background: '#F7FAFC',
          border: '1px solid #E2E8F0',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 36 }}>📅</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#4A5568' }}>
              {quarterConfig.label} — Upcoming
            </div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
              Filing deadline: <strong>{quarterConfig.deadline}</strong> · Data will populate as trips are logged.
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Miles', value: totalMiles.toLocaleString(), sub: 'across all states', icon: '🛣️', color: 'var(--c-primary, #4BAED4)' },
          { label: 'Total Gallons', value: totalGallons.toLocaleString(), sub: 'fuel purchased', icon: '⛽', color: '#805AD5' },
          { label: 'Overall MPG', value: fmtN(mpg), sub: 'fleet average', icon: '📊', color: '#DD6B20' },
          {
            label: 'Net Tax Position',
            value: totalNet >= 0 ? `+${fmt$(totalNet)}` : fmt$(totalNet),
            sub: totalNet >= 0 ? 'amount owed' : 'refund due',
            icon: totalNet >= 0 ? '🔴' : '🟢',
            color: totalNet >= 0 ? '#E53E3E' : '#38A169',
          },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 28, opacity: 0.18 }}>{kpi.icon}</div>
            <div style={{ fontSize: 12, color: '#718096', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F7FAFC', borderRadius: 10, padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
        {(['summary', 'states', 'trips', 'fuel', 'worksheet'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={tabStyle(activeTab === tab)}
          >
            {{ summary: '🗺️ Summary', states: '📋 By State', trips: '🚚 Trips', fuel: '⛽ Fuel Purchases', worksheet: '📝 Filing Worksheet' }[tab]}
          </button>
        ))}
      </div>

      {/* ═══════════════════════ TAB: SUMMARY ══════════════════════════════════ */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

          {/* Left: US Map SVG */}
          <div style={{ ...card }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748', marginBottom: 16 }}>States Operated — {quarterConfig.label}</div>
            <svg viewBox="0 0 620 380" width="100%" style={{ border: '1px solid #EDF2F7', borderRadius: 8, background: '#F8FAFF' }}>
              {/* Background regions */}
              <rect x="50" y="40" width="530" height="310" rx="8" fill="#EDF2F7" />

              {/* Render state labels */}
              {STATE_POSITIONS.map(({ state, x, y }) => {
                const isActive = activeStates.has(state)
                const row = rows.find(r => r.state === state)
                const net = row?.net ?? 0
                const bgColor = isActive
                  ? (net >= 0 ? '#4BAED4' : '#38A169')
                  : '#CBD5E0'
                return (
                  <g key={state}>
                    <rect
                      x={x - 14} y={y - 10} width={28} height={20} rx={4}
                      fill={bgColor}
                      opacity={isActive ? 0.9 : 0.4}
                    />
                    <text
                      x={x} y={y + 4}
                      textAnchor="middle"
                      fontSize={9}
                      fontWeight="700"
                      fill={isActive ? '#fff' : '#718096'}
                    >
                      {state}
                    </text>
                  </g>
                )
              })}

              {/* Legend */}
              <g transform="translate(60, 345)">
                <rect x={0} y={0} width={12} height={12} rx={2} fill="#4BAED4" />
                <text x={16} y={10} fontSize={9} fill="#4A5568">Owe tax</text>
                <rect x={70} y={0} width={12} height={12} rx={2} fill="#38A169" />
                <text x={86} y={10} fontSize={9} fill="#4A5568">Refund</text>
                <rect x={145} y={0} width={12} height={12} rx={2} fill="#CBD5E0" />
                <text x={161} y={10} fontSize={9} fill="#4A5568">Not operated</text>
              </g>
            </svg>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: '#718096' }}>
                <strong style={{ color: '#2D3748' }}>{rows.length}</strong> states operated
              </div>
              <div style={{ fontSize: 13, color: '#718096' }}>
                <strong style={{ color: '#E53E3E' }}>{rows.filter(r => r.net > 0).length}</strong> states owe
              </div>
              <div style={{ fontSize: 13, color: '#718096' }}>
                <strong style={{ color: '#38A169' }}>{rows.filter(r => r.net < 0).length}</strong> states refund
              </div>
            </div>
          </div>

          {/* Right: Summary Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Net position */}
            <div style={{
              ...card,
              background: totalNet >= 0
                ? 'linear-gradient(135deg, #FFF5F5, #FED7D7)'
                : 'linear-gradient(135deg, #F0FFF4, #C6F6D5)',
              border: `1px solid ${totalNet >= 0 ? '#FEB2B2' : '#9AE6B4'}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: totalNet >= 0 ? '#C53030' : '#276749', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Net Tax Position
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: totalNet >= 0 ? '#E53E3E' : '#38A169', lineHeight: 1 }}>
                {totalNet >= 0 ? fmt$(totalNet) : `(${fmt$(totalNet)})`}
              </div>
              <div style={{ fontSize: 13, color: totalNet >= 0 ? '#C53030' : '#276749', marginTop: 6 }}>
                {totalNet >= 0 ? 'Amount you owe' : 'Refund expected'}
              </div>
              <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 4 }}>Deadline: {quarterConfig.deadline}</div>
            </div>

            {/* States owe */}
            <div style={{ ...card }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E53E3E', marginBottom: 10 }}>
                States Where You Owe ({rows.filter(r => r.net > 0).length})
              </div>
              {rows.filter(r => r.net > 0).sort((a, b) => b.net - a.net).slice(0, 6).map(r => (
                <div key={r.state} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <span style={{ fontSize: 13, color: '#2D3748' }}>{r.stateName}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#E53E3E' }}>{fmt$(r.net)}</span>
                </div>
              ))}
            </div>

            {/* States refund */}
            <div style={{ ...card }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#38A169', marginBottom: 10 }}>
                States With Refund ({rows.filter(r => r.net < 0).length})
              </div>
              {rows.filter(r => r.net < 0).sort((a, b) => a.net - b.net).slice(0, 6).map(r => (
                <div key={r.state} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <span style={{ fontSize: 13, color: '#2D3748' }}>{r.stateName}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#38A169' }}>({fmt$(r.net)})</span>
                </div>
              ))}
            </div>

            {/* Start Filing button */}
            <button
              onClick={() => setActiveTab('worksheet')}
              style={{
                padding: '14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, var(--c-primary, #4BAED4), #2D7A9A)',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(75,174,212,0.4)',
              }}
            >
              Start Filing {quarterConfig.label} →
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: BY STATE ═════════════════════════════════ */}
      {activeTab === 'states' && (
        <div style={{ ...card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748' }}>
              Jurisdiction Detail — {quarterConfig.label}
            </div>
            <button
              onClick={exportCSV}
              style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--c-primary, #4BAED4)', background: '#fff', color: 'var(--c-primary, #4BAED4)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
            >
              ⬇ Export CSV
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {([
                    ['state', 'Jurisdiction'],
                    ['miles', 'Miles Driven'],
                    ['fuelConsumed', 'Fuel Consumed (gal)'],
                    ['fuelPurchased', 'Fuel Purchased (gal)'],
                    ['taxRate', 'Tax Rate'],
                    ['taxOwed', 'Tax Owed'],
                    ['taxPaid', 'Tax Paid'],
                    ['net', 'Net'],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} style={thStyle} onClick={() => handleSort(key)}>
                      {label}{sortArrow(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(r => (
                  <tr key={r.state} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{r.stateName}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>{r.state}</div>
                    </td>
                    <td style={tdStyle}>{r.miles.toLocaleString()}</td>
                    <td style={tdStyle}>{r.fuelConsumed.toFixed(1)}</td>
                    <td style={tdStyle}>{r.fuelPurchased.toLocaleString()}</td>
                    <td style={tdStyle}>{(r.taxRate * 100).toFixed(1)}¢</td>
                    <td style={tdStyle}>{fmt$(r.taxOwed)}</td>
                    <td style={tdStyle}>{fmt$(r.taxPaid)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: r.net >= 0 ? '#E53E3E' : '#38A169' }}>
                      {r.net >= 0 ? `+${fmt$(r.net)}` : `(${fmt$(r.net)})`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ ...tdTotals }}>TOTALS</td>
                  <td style={tdTotals}>{totalMiles.toLocaleString()}</td>
                  <td style={tdTotals}>{totalFuelConsumed.toFixed(1)}</td>
                  <td style={tdTotals}>{totalGallons.toLocaleString()}</td>
                  <td style={tdTotals}>—</td>
                  <td style={tdTotals}>{fmt$(totalTaxOwed)}</td>
                  <td style={tdTotals}>{fmt$(totalTaxPaid)}</td>
                  <td style={{ ...tdTotals, color: totalNet >= 0 ? '#E53E3E' : '#38A169' }}>
                    {totalNet >= 0 ? `+${fmt$(totalNet)}` : `(${fmt$(totalNet)})`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: TRIPS ════════════════════════════════════ */}
      {activeTab === 'trips' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748', marginBottom: 4 }}>
            {trips.length} trips recorded — {quarterConfig.label}
          </div>
          {trips.map(trip => {
            const isExpanded = expandedTrip === trip.id
            const totalTripGallons = trip.fuelStops.reduce((s, f) => s + f.gallons, 0)
            return (
              <div key={trip.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {/* Trip header */}
                <div
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
                  onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                >
                  <div style={{ fontSize: 13, color: '#718096', minWidth: 90 }}>{trip.date}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748', flex: 1, minWidth: 200 }}>
                    {trip.from}, {trip.fromState} → {trip.to}, {trip.toState}
                  </div>
                  <div style={{ fontSize: 13, color: '#4A5568', fontWeight: 600 }}>
                    {trip.totalMiles.toLocaleString()} mi
                  </div>
                  {/* State badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {trip.stateBreakdown.map(sb => (
                      <span key={sb.state} style={{ background: '#EBF8FF', color: '#2B6CB0', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>
                        {sb.state} {sb.miles}mi
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#718096' }}>
                    ⛽ {trip.fuelStops.length} stop{trip.fuelStops.length > 1 ? 's' : ''} · {totalTripGallons}gal
                  </div>
                  <div style={{ fontSize: 18, color: '#A0AEC0', marginLeft: 'auto' }}>{isExpanded ? '▲' : '▼'}</div>
                </div>

                {/* Trip detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #F0F4F8', padding: '16px 20px', background: '#FAFAFA', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* State breakdown table */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#4A5568', marginBottom: 10 }}>State Breakdown</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ ...thStyle, fontSize: 11 }}>State</th>
                            <th style={{ ...thStyle, fontSize: 11 }}>Miles</th>
                            <th style={{ ...thStyle, fontSize: 11 }}>% of Trip</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trip.stateBreakdown.map(sb => (
                            <tr key={sb.state}>
                              <td style={{ ...tdStyle, fontSize: 12 }}>{STATE_NAMES[sb.state] ?? sb.state}</td>
                              <td style={{ ...tdStyle, fontSize: 12 }}>{sb.miles}</td>
                              <td style={{ ...tdStyle, fontSize: 12 }}>{((sb.miles / trip.totalMiles) * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ ...tdTotals, fontSize: 12 }}>Total</td>
                            <td style={{ ...tdTotals, fontSize: 12 }}>{trip.totalMiles}</td>
                            <td style={{ ...tdTotals, fontSize: 12 }}>100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Fuel stops table */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#4A5568', marginBottom: 10 }}>Fuel Stops</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ ...thStyle, fontSize: 11 }}>Station</th>
                            <th style={{ ...thStyle, fontSize: 11 }}>Gal</th>
                            <th style={{ ...thStyle, fontSize: 11 }}>$/gal</th>
                            <th style={{ ...thStyle, fontSize: 11 }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trip.fuelStops.map((fs, i) => (
                            <tr key={i}>
                              <td style={{ ...tdStyle, fontSize: 12 }}>
                                <div style={{ fontWeight: 600 }}>{fs.state}</div>
                                <div style={{ fontSize: 10, color: '#A0AEC0' }}>{fs.station.split('—')[0].trim()}</div>
                              </td>
                              <td style={{ ...tdStyle, fontSize: 12 }}>{fs.gallons}</td>
                              <td style={{ ...tdStyle, fontSize: 12 }}>${fs.pricePerGallon.toFixed(2)}</td>
                              <td style={{ ...tdStyle, fontSize: 12, fontWeight: 600 }}>${fs.total.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr>
                            <td style={{ ...tdTotals, fontSize: 12 }}>Total</td>
                            <td style={{ ...tdTotals, fontSize: 12 }}>{totalTripGallons}</td>
                            <td style={{ ...tdTotals, fontSize: 12 }}>—</td>
                            <td style={{ ...tdTotals, fontSize: 12 }}>${trip.fuelStops.reduce((s, f) => s + f.total, 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════════════════════ TAB: FUEL PURCHASES ═══════════════════════════ */}
      {activeTab === 'fuel' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Main table */}
          <div style={{ ...card }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748', marginBottom: 16 }}>
              All Fuel Purchases — {quarterConfig.label}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>State</th>
                    <th style={thStyle}>Station</th>
                    <th style={thStyle}>Gallons</th>
                    <th style={thStyle}>Price/gal</th>
                    <th style={thStyle}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allFuelStops.map((fs, i) => (
                    <tr key={i}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F7FAFC')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={tdStyle}>{fs.date}</td>
                      <td style={tdStyle}>
                        <span style={{ background: '#EBF8FF', color: '#2B6CB0', borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 700 }}>
                          {fs.state}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fs.station}
                      </td>
                      <td style={tdStyle}>{fs.gallons}</td>
                      <td style={tdStyle}>${fs.pricePerGallon.toFixed(2)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>${fs.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={tdTotals}>TOTALS</td>
                    <td style={tdTotals}>{allFuelStops.reduce((s, f) => s + f.gallons, 0).toLocaleString()}</td>
                    <td style={tdTotals}>—</td>
                    <td style={tdTotals}>${allFuelStops.reduce((s, f) => s + f.total, 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* By-state subtotals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748', marginBottom: 14 }}>By-State Subtotals</div>
              {fuelByState.map(([state, data]) => (
                <div key={state} style={{ padding: '10px 0', borderBottom: '1px solid #F0F4F8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{STATE_NAMES[state] ?? state}</div>
                      <div style={{ fontSize: 11, color: '#A0AEC0' }}>{state}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{data.gallons} gal</div>
                      <div style={{ fontSize: 11, color: '#718096' }}>${data.total.toFixed(2)}</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 6, height: 4, background: '#EDF2F7', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--c-primary, #4BAED4)',
                      width: `${Math.min(100, (data.gallons / (fuelByState[0]?.[1].gallons ?? 1)) * 100)}%`,
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...card, background: '#F7FAFC' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2D3748', marginBottom: 10 }}>Summary</div>
              <div style={{ fontSize: 13, color: '#4A5568', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total stops</span>
                  <strong>{allFuelStops.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>States purchased</span>
                  <strong>{fuelByState.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total gallons</span>
                  <strong>{allFuelStops.reduce((s, f) => s + f.gallons, 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total spent</span>
                  <strong>${allFuelStops.reduce((s, f) => s + f.total, 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Avg price/gal</span>
                  <strong>
                    ${(allFuelStops.reduce((s, f) => s + f.total, 0) / Math.max(1, allFuelStops.reduce((s, f) => s + f.gallons, 0))).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════ TAB: FILING WORKSHEET ═════════════════════════ */}
      {activeTab === 'worksheet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Header Info Section ── */}
          <div style={{ ...card }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748', marginBottom: 16 }}>
              IFTA Quarterly Fuel Use Tax Return — {quarterConfig.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>CARRIER NAME</label>
                <input
                  value={carrierName}
                  onChange={e => setCarrierName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>IFTA LICENSE NUMBER</label>
                <input
                  value={iftaLicense}
                  onChange={e => setIftaLicense(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>FLEET SIZE (QUALIFIED VEHICLES)</label>
                <input
                  value={fleetSize}
                  onChange={e => setFleetSize(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>REPORTING PERIOD</label>
                <input
                  readOnly
                  value={`${selectedQuarter} 2024`}
                  style={{ ...inputStyle, background: '#F7FAFC', color: '#718096' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>BASE JURISDICTION</label>
                <input
                  readOnly
                  value="Illinois (IL)"
                  style={{ ...inputStyle, background: '#F7FAFC', color: '#718096' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>DUE DATE</label>
                <input
                  readOnly
                  value={quarterConfig.deadline}
                  style={{ ...inputStyle, background: '#F7FAFC', color: '#718096' }}
                />
              </div>
            </div>
          </div>

          {/* ── Worksheet Table ── */}
          <div style={{ ...card }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748', marginBottom: 4 }}>Schedule A — Jurisdiction Summary</div>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 16 }}>
              MPG = {fmtN(mpg)} · Total Miles = {totalMiles.toLocaleString()} · Total Gallons Purchased = {totalGallons.toLocaleString()}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--c-dark, #1A2535)' }}>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff', width: 36 }}>#</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Jurisdiction</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Total Miles</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Taxable Miles</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Taxable Gallons</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Tax-Paid Gallons</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Net Taxable Gal</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Tax Rate</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Tax Due</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Tax Credits</th>
                    <th style={{ ...thStyle, background: 'transparent', color: '#fff' }}>Net Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRows.map((r, idx) => {
                    const netTaxableGal = r.fuelConsumed - r.fuelPurchased
                    return (
                      <tr key={r.state}
                        style={{ background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EBF8FF')}
                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFAFA')}
                      >
                        <td style={{ ...tdStyle, fontSize: 12, color: '#A0AEC0', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.state}</div>
                          <div style={{ fontSize: 11, color: '#A0AEC0' }}>{r.stateName}</div>
                        </td>
                        <td style={tdStyle}>{r.miles.toLocaleString()}</td>
                        <td style={tdStyle}>{r.miles.toLocaleString()}</td>
                        <td style={tdStyle}>{r.fuelConsumed.toFixed(2)}</td>
                        <td style={tdStyle}>{r.fuelPurchased.toFixed(2)}</td>
                        <td style={{ ...tdStyle, color: netTaxableGal >= 0 ? '#E53E3E' : '#38A169', fontWeight: 600 }}>
                          {netTaxableGal.toFixed(2)}
                        </td>
                        <td style={tdStyle}>{(r.taxRate * 100).toFixed(1)}¢</td>
                        <td style={tdStyle}>{fmt$(r.taxOwed)}</td>
                        <td style={tdStyle}>{r.taxPaid > r.taxOwed ? fmt$(r.taxPaid - r.taxOwed) : '—'}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: r.net >= 0 ? '#E53E3E' : '#38A169' }}>
                          {r.net >= 0 ? `+${fmt$(r.net)}` : `(${fmt$(r.net)})`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--c-dark, #1A2535)' }}>
                    <td colSpan={2} style={{ ...tdTotals, background: 'transparent', color: '#fff', fontSize: 12 }}>TOTALS</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>{totalMiles.toLocaleString()}</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>{totalMiles.toLocaleString()}</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>{totalFuelConsumed.toFixed(2)}</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>{totalGallons.toFixed(2)}</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: totalNet >= 0 ? '#FC8181' : '#68D391' }}>
                      {(totalFuelConsumed - totalGallons).toFixed(2)}
                    </td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>—</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>{fmt$(totalTaxOwed)}</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: '#fff' }}>{fmt$(totalTaxPaid)}</td>
                    <td style={{ ...tdTotals, background: 'transparent', color: totalNet >= 0 ? '#FC8181' : '#68D391', fontSize: 14 }}>
                      {totalNet >= 0 ? `+${fmt$(totalNet)}` : `(${fmt$(totalNet)})`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Net summary box */}
            <div style={{ marginTop: 20, padding: 16, background: totalNet >= 0 ? '#FFF5F5' : '#F0FFF4', border: `1px solid ${totalNet >= 0 ? '#FEB2B2' : '#9AE6B4'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: totalNet >= 0 ? '#C53030' : '#276749', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {totalNet >= 0 ? 'Total Amount Due' : 'Total Credit/Refund'}
                </div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                  {totalNet >= 0 ? 'Payment due by ' + quarterConfig.deadline : 'Credit applied to next quarter or refunded within 30 days'}
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: totalNet >= 0 ? '#E53E3E' : '#38A169' }}>
                {totalNet >= 0 ? fmt$(totalNet) : `(${fmt$(totalNet)})`}
              </div>
            </div>
          </div>

          {/* ── Signature Section ── */}
          <div style={{ ...card }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#2D3748', marginBottom: 16 }}>Signature & Certification</div>

            <div style={{ background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontStyle: 'italic' }}>
              "Under penalties of perjury, I declare that I have examined this return and accompanying schedules and statements,
              and to the best of my knowledge and belief, they are true, correct and complete. Declaration of preparer
              (other than taxpayer) is based on all information of which preparer has any knowledge."
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>PRINTED NAME</label>
                <input value={sigName} onChange={e => setSigName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>TITLE</label>
                <input value={sigTitle} onChange={e => setSigTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>PHONE NUMBER</label>
                <input value={sigPhone} onChange={e => setSigPhone(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>DATE SIGNED</label>
                <input readOnly value={new Date().toLocaleDateString()} style={{ ...inputStyle, background: '#F7FAFC', color: '#718096' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 6 }}>EIN / FEIN</label>
                <input readOnly value="84-2210941" style={{ ...inputStyle, background: '#F7FAFC', color: '#718096' }} />
              </div>
            </div>

            {/* Certification checkbox */}
            <div
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: certChecked ? '#F0FFF4' : '#F7FAFC', border: `1px solid ${certChecked ? '#9AE6B4' : '#E2E8F0'}`, borderRadius: 8, cursor: 'pointer', marginBottom: 20, transition: 'all 0.2s' }}
              onClick={() => setCertChecked(v => !v)}
            >
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${certChecked ? '#38A169' : '#CBD5E0'}`, background: certChecked ? '#38A169' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
                {certChecked && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.5 }}>
                I certify that the information on this return is true, accurate, and complete to the best of my knowledge,
                and that I am authorized to submit this filing on behalf of <strong>{carrierName}</strong> (IFTA License: {iftaLicense}).
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={handlePDFDownload}
                style={{
                  padding: '12px 24px', borderRadius: 8, border: '1px solid #E2E8F0',
                  background: '#fff', color: '#2D3748', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => {
                  if (certChecked) setShowSubmitModal(true)
                  else alert('Please check the certification checkbox before submitting.')
                }}
                style={{
                  padding: '12px 28px', borderRadius: 8, border: 'none',
                  background: certChecked
                    ? 'linear-gradient(135deg, var(--c-primary, #4BAED4), #2D7A9A)'
                    : '#CBD5E0',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: certChecked ? 'pointer' : 'not-allowed',
                  boxShadow: certChecked ? '0 4px 12px rgba(75,174,212,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                🚀 Submit to State
              </button>
              <button
                onClick={() => { alert('Draft saved successfully.') }}
                style={{
                  padding: '12px 20px', borderRadius: 8, border: '1px solid #E2E8F0',
                  background: '#fff', color: '#718096', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                💾 Save Draft
              </button>
            </div>

            {/* Role note */}
            {role === 'dispatcher' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#EBF8FF', borderRadius: 8, fontSize: 12, color: '#2B6CB0' }}>
                <strong>Dispatcher note:</strong> This filing is prepared on behalf of your client. Ensure the carrier has reviewed and approved all data before submission.
              </div>
            )}
            {role === 'company' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#EBF8FF', borderRadius: 8, fontSize: 12, color: '#2B6CB0' }}>
                <strong>Fleet operator note:</strong> This filing covers all qualified vehicles in your fleet. Individual vehicle breakdowns are available in the Trips tab.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
