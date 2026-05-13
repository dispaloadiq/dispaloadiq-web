import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FixedCost {
  id: string
  label: string
  icon: string
  value: number
}

interface SavedProfile {
  id: string
  label: string
  truckType: TruckType
  milesPerMonth: number
  fuelPrice: number
  mpg: number
  loadDays: number
  fixedCosts: FixedCost[]
  def: number
  tires: number
  oil: number
  repairs: number
  tolls: number
  lumper: number
  otherVariable: number
}

type TruckType = 'Dry Van' | 'Reefer' | 'Flatbed' | 'Hotshot'

// ── Default fixed costs ───────────────────────────────────────────────────────

const DEFAULT_FIXED: FixedCost[] = [
  { id: 'truck',      icon: '🚛', label: 'Truck payment / lease',    value: 2200 },
  { id: 'ins-liab',  icon: '🛡️', label: 'Insurance (liability)',     value: 950  },
  { id: 'ins-cargo', icon: '📦', label: 'Insurance (cargo)',         value: 180  },
  { id: 'eld',       icon: '📡', label: 'ELD / dispatch software',   value: 85   },
  { id: 'phone',     icon: '📱', label: 'Phone & communication',     value: 120  },
  { id: 'permits',   icon: '📃', label: 'Permits & authorities',     value: 65   },
  { id: 'accounting',icon: '🧾', label: 'Accounting / bookkeeping',  value: 75   },
  { id: 'other-fix', icon: '➕', label: 'Other fixed',               value: 0    },
]

// ── Saved profiles ────────────────────────────────────────────────────────────

const SAVED_PROFILES: SavedProfile[] = [
  {
    id: 'peterbilt',
    label: 'My Peterbilt 389',
    truckType: 'Dry Van',
    milesPerMonth: 10000,
    fuelPrice: 3.89,
    mpg: 6.5,
    loadDays: 4,
    fixedCosts: DEFAULT_FIXED,
    def: 0.05, tires: 0.08, oil: 0.03, repairs: 0.12, tolls: 0.06, lumper: 0.04, otherVariable: 0,
  },
  {
    id: 'reefer',
    label: 'Reefer Season Config',
    truckType: 'Reefer',
    milesPerMonth: 9500,
    fuelPrice: 4.10,
    mpg: 5.9,
    loadDays: 5,
    fixedCosts: DEFAULT_FIXED.map(f =>
      f.id === 'ins-liab' ? { ...f, value: 1200 }
      : f.id === 'ins-cargo' ? { ...f, value: 320 }
      : f
    ),
    def: 0.06, tires: 0.09, oil: 0.04, repairs: 0.15, tolls: 0.07, lumper: 0.05, otherVariable: 0.02,
  },
  {
    id: 'hotshot',
    label: 'Hotshot Setup',
    truckType: 'Hotshot',
    milesPerMonth: 8000,
    fuelPrice: 3.75,
    mpg: 12,
    loadDays: 3,
    fixedCosts: DEFAULT_FIXED.map(f =>
      f.id === 'truck' ? { ...f, value: 1400 }
      : f.id === 'ins-liab' ? { ...f, value: 700 }
      : f
    ),
    def: 0.03, tires: 0.06, oil: 0.02, repairs: 0.09, tolls: 0.04, lumper: 0.02, otherVariable: 0,
  },
]

// ── Helper styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  border: '1px solid var(--c-divider)',
  padding: '20px 24px',
  marginBottom: 16,
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--c-dark)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 14,
  paddingBottom: 8,
  borderBottom: '2px solid var(--c-divider)',
}

const inputRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 10,
}

const labelStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 13,
  color: '#4A5568',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const numInput: React.CSSProperties = {
  width: 100,
  padding: '6px 10px',
  border: '1px solid #CBD5E0',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--c-dark)',
  textAlign: 'right',
  outline: 'none',
}

const resultLabel: React.CSSProperties = {
  fontSize: 13,
  color: '#718096',
  flex: 1,
}

const resultValue: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--c-dark)',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CostPerMilePage({ role }: { role: UserRole }) {
  // ── Truck profile state ───────────────────────────────────────────────────
  const [truckType, setTruckType] = useState<TruckType>('Dry Van')
  const [milesPerMonth, setMilesPerMonth] = useState(10000)
  const [fuelPrice, setFuelPrice] = useState(3.89)
  const [mpg, setMpg] = useState(6.5)
  const [loadDays, setLoadDays] = useState(4)

  // ── Fixed costs state ─────────────────────────────────────────────────────
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(DEFAULT_FIXED)
  const [customIdCounter, setCustomIdCounter] = useState(0)

  // ── Variable costs state ──────────────────────────────────────────────────
  const [def, setDef] = useState(0.05)
  const [tires, setTires] = useState(0.08)
  const [oil, setOil] = useState(0.03)
  const [repairs, setRepairs] = useState(0.12)
  const [tolls, setTolls] = useState(0.06)
  const [lumper, setLumper] = useState(0.04)
  const [otherVariable, setOtherVariable] = useState(0.0)

  // ── Trip calculator state ─────────────────────────────────────────────────
  const [routeMiles, setRouteMiles] = useState(850)
  const [ratePerMile, setRatePerMile] = useState(2.45)
  const [emptyMiles, setEmptyMiles] = useState(120)
  const [extraStops, setExtraStops] = useState(0)
  const [detentionHours, setDetentionHours] = useState(0)

  // ── Active profile highlight ──────────────────────────────────────────────
  const [savedProfileToast, setSavedProfileToast] = useState(false)

  // ── Core calculations (useMemo) ───────────────────────────────────────────
  const calc = useMemo(() => {
    const fuelCostPerMile = fuelPrice / mpg
    const totalVariableCPM =
      fuelCostPerMile + def + tires + oil + repairs + tolls + lumper + otherVariable

    const totalFixedMonthly = fixedCosts.reduce((sum, c) => sum + c.value, 0)
    const effectiveMiles = milesPerMonth > 0 ? milesPerMonth : 1
    const fixedCPM = totalFixedMonthly / effectiveMiles
    const totalCPM = fixedCPM + totalVariableCPM
    const breakEvenRPM = totalCPM

    // Trip P&L
    const loadedMiles = routeMiles
    const totalMiles = routeMiles + emptyMiles
    const grossRevenue = ratePerMile * loadedMiles
    const extraStopRevenue = extraStops * 25
    const detentionRevenue = detentionHours * 75
    const fixedCostOnTrip = fixedCPM * totalMiles
    const variableCostOnTrip = totalVariableCPM * totalMiles
    const deadheadCost = totalCPM * emptyMiles
    const tripNet =
      grossRevenue + extraStopRevenue + detentionRevenue - fixedCostOnTrip - variableCostOnTrip
    const profitMargin =
      grossRevenue + extraStopRevenue + detentionRevenue > 0
        ? (tripNet / (grossRevenue + extraStopRevenue + detentionRevenue)) * 100
        : 0
    const afterTax = tripNet * 0.75

    // Monthly projection
    const monthlyRevenue = ratePerMile * milesPerMonth
    const monthlyTotalCost = totalCPM * milesPerMonth
    const monthlyNet = monthlyRevenue - monthlyTotalCost
    const annualNet = monthlyNet * 12
    const annualTax = annualNet * 0.25
    const takehome = annualNet * 0.75

    // Cost breakdown for chart
    const fuelTotal = fuelCostPerMile
    const fixedTotal = fixedCPM
    const tiresMaint = tires + repairs + oil
    const otherVar = def + tolls + lumper + otherVariable
    const chartTotal = fuelTotal + fixedTotal + tiresMaint + otherVar
    const safeChart = chartTotal > 0 ? chartTotal : 1

    const chartData = [
      { label: 'Fuel', value: fuelTotal, pct: (fuelTotal / safeChart) * 100, color: '#4BAED4' },
      { label: 'Fixed expenses', value: fixedTotal, pct: (fixedTotal / safeChart) * 100, color: '#1A2535' },
      { label: 'Tires + maintenance', value: tiresMaint, pct: (tiresMaint / safeChart) * 100, color: '#F6AD55' },
      { label: 'Other variable', value: otherVar, pct: (otherVar / safeChart) * 100, color: '#68D391' },
    ]

    return {
      fuelCostPerMile,
      totalVariableCPM,
      totalFixedMonthly,
      fixedCPM,
      totalCPM,
      breakEvenRPM,
      loadedMiles,
      totalMiles,
      grossRevenue,
      extraStopRevenue,
      detentionRevenue,
      fixedCostOnTrip,
      variableCostOnTrip,
      deadheadCost,
      tripNet,
      profitMargin,
      afterTax,
      monthlyRevenue,
      monthlyTotalCost,
      monthlyNet,
      annualNet,
      annualTax,
      takehome,
      chartData,
    }
  }, [
    fuelPrice, mpg, def, tires, oil, repairs, tolls, lumper, otherVariable,
    fixedCosts, milesPerMonth, routeMiles, ratePerMile, emptyMiles,
    extraStops, detentionHours,
  ])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (n: number, digits = 2) => n.toFixed(digits)
  const fmtDollar = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const cpmColor = (cpm: number) =>
    cpm <= 1.2 ? '#38A169' : cpm <= 1.6 ? '#D69E2E' : '#E53E3E'

  const marginColor = (n: number) => (n >= 0 ? '#38A169' : '#E53E3E')

  const updateFixed = (id: string, val: number) => {
    setFixedCosts(prev => prev.map(c => (c.id === id ? { ...c, value: val } : c)))
  }

  const addCustomFixed = () => {
    const newId = `custom-${customIdCounter}`
    setCustomIdCounter(p => p + 1)
    setFixedCosts(prev => [
      ...prev,
      { id: newId, icon: '➕', label: 'Custom expense', value: 0 },
    ])
  }

  const loadProfile = (p: SavedProfile) => {
    setTruckType(p.truckType)
    setMilesPerMonth(p.milesPerMonth)
    setFuelPrice(p.fuelPrice)
    setMpg(p.mpg)
    setLoadDays(p.loadDays)
    setFixedCosts(p.fixedCosts)
    setDef(p.def)
    setTires(p.tires)
    setOil(p.oil)
    setRepairs(p.repairs)
    setTolls(p.tolls)
    setLumper(p.lumper)
    setOtherVariable(p.otherVariable)
  }

  const handleSaveProfile = () => {
    setSavedProfileToast(true)
    setTimeout(() => setSavedProfileToast(false), 2500)
  }

  // ── Rate scenarios ────────────────────────────────────────────────────────
  const SCENARIO_RATES = [1.80, 2.00, 2.20, 2.45, 2.60, 2.80, 3.00]
  const scenarios = SCENARIO_RATES.map(r => {
    const margin = r - calc.totalCPM
    const tripNetS = r * routeMiles - calc.fixedCostOnTrip - calc.variableCostOnTrip
    const monthlyNetS = r * milesPerMonth - calc.monthlyTotalCost
    return { rate: r, margin, tripNet: tripNetS, monthlyNet: monthlyNetS }
  })

  const scenarioRowColor = (margin: number) => {
    if (margin < 0) return '#FFF5F5'
    if (margin < 0.3) return '#FFFFF0'
    return '#F0FFF4'
  }

  const scenarioTextColor = (margin: number) => {
    if (margin < 0) return '#E53E3E'
    if (margin < 0.3) return '#D69E2E'
    return '#38A169'
  }

  // ── Truck type selector ───────────────────────────────────────────────────
  const TRUCK_TYPES: TruckType[] = ['Dry Van', 'Reefer', 'Flatbed', 'Hotshot']

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', gap: 20, padding: '24px', minHeight: '100vh', background: '#F7FAFC', alignItems: 'flex-start' }}>

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL — Inputs (55%)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: '0 0 55%', maxWidth: '55%', display: 'flex', flexDirection: 'column', gap: 0 }}>

        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-dark)', margin: 0, marginBottom: 4 }}>
            📐 Cost Per Mile Calculator
          </h1>
          <p style={{ fontSize: 14, color: '#718096', margin: 0 }}>
            Know your exact break-even before accepting any load. All fields update results live.
          </p>
        </div>

        {/* Saved Profiles */}
        <div style={card}>
          <div style={sectionTitle}>Saved Truck Profiles</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            {SAVED_PROFILES.map(p => (
              <button
                key={p.id}
                onClick={() => loadProfile(p)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1.5px solid var(--c-primary)',
                  background: '#EBF8FF',
                  color: 'var(--c-primary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSaveProfile}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: savedProfileToast ? '#38A169' : 'var(--c-dark)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.3s',
            }}
          >
            {savedProfileToast ? '✓ Saved!' : '💾 Save current as profile'}
          </button>
        </div>

        {/* Section A — Truck Profile */}
        <div style={card}>
          <div style={sectionTitle}>A — Truck Profile</div>

          {/* Truck type buttons */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 8, fontWeight: 600 }}>Truck Type</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {TRUCK_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTruckType(t)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: '1.5px solid',
                    borderColor: truckType === t ? 'var(--c-primary)' : '#CBD5E0',
                    background: truckType === t ? 'var(--c-primary)' : '#fff',
                    color: truckType === t ? '#fff' : '#4A5568',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>🛣️ Miles per month</span>
            <input
              type="number"
              style={numInput}
              value={milesPerMonth}
              min={1}
              onChange={e => setMilesPerMonth(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>mi</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>⛽ Fuel price per gallon</span>
            <input
              type="number"
              style={numInput}
              value={fuelPrice}
              step={0.01}
              min={0}
              onChange={e => setFuelPrice(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>$/gal</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>🔧 MPG</span>
            <input
              type="number"
              style={numInput}
              value={mpg}
              step={0.1}
              min={0.1}
              onChange={e => setMpg(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>mpg</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>📅 Load/unload days per month</span>
            <input
              type="number"
              style={numInput}
              value={loadDays}
              min={0}
              onChange={e => setLoadDays(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>days</span>
          </div>
        </div>

        {/* Section B — Fixed Costs */}
        <div style={card}>
          <div style={sectionTitle}>B — Fixed Costs (per month)</div>

          {fixedCosts.map(fc => (
            <div key={fc.id} style={inputRow}>
              <span style={labelStyle}>
                <span style={{ width: 18 }}>{fc.icon}</span>
                {fc.label}
              </span>
              <span style={{ fontSize: 12, color: '#A0AEC0', marginRight: 2 }}>$</span>
              <input
                type="number"
                style={numInput}
                value={fc.value}
                min={0}
                onChange={e => updateFixed(fc.id, Number(e.target.value))}
              />
            </div>
          ))}

          {/* Total row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--c-divider)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark)' }}>Total fixed / month</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-primary)' }}>
              {fmtDollar(calc.totalFixedMonthly)}
            </span>
          </div>

          <button
            onClick={addCustomFixed}
            style={{
              marginTop: 12,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1.5px dashed #CBD5E0',
              background: 'transparent',
              color: '#718096',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            ➕ Add custom fixed cost
          </button>
        </div>

        {/* Section C — Variable Costs */}
        <div style={card}>
          <div style={sectionTitle}>C — Variable Costs (per mile)</div>

          {/* Fuel — auto-calculated */}
          <div style={{
            background: '#EBF8FF',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 12,
            border: '1px solid #BEE3F8',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#2C5282', fontWeight: 600 }}>
                ⛽ Fuel (auto-calculated)
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-primary)' }}>
                ${fmt(calc.fuelCostPerMile, 3)}/mi
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#4A90C4', marginTop: 4 }}>
              Formula: ${fmt(fuelPrice, 2)} ÷ {fmt(mpg, 1)} MPG = ${fmt(calc.fuelCostPerMile, 3)}/mi
            </div>
          </div>

          {[
            { label: 'DEF fluid',               icon: '🧪', val: def,          set: setDef },
            { label: 'Tires (amortized)',         icon: '⚙️', val: tires,        set: setTires },
            { label: 'Oil & filters',            icon: '🛢️', val: oil,          set: setOil },
            { label: 'Repairs / maint. reserve', icon: '🔧', val: repairs,      set: setRepairs },
            { label: 'Tolls (avg)',              icon: '🚧', val: tolls,        set: setTolls },
            { label: 'Lumper / unloading fees',  icon: '📦', val: lumper,       set: setLumper },
            { label: 'Other variable',           icon: '➕', val: otherVariable, set: setOtherVariable },
          ].map(({ label, icon, val, set }) => (
            <div key={label} style={inputRow}>
              <span style={labelStyle}>
                <span style={{ width: 18 }}>{icon}</span>
                {label}
              </span>
              <span style={{ fontSize: 12, color: '#A0AEC0', marginRight: 2 }}>$</span>
              <input
                type="number"
                style={numInput}
                value={val}
                step={0.01}
                min={0}
                onChange={e => set(Number(e.target.value))}
              />
              <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>/mi</span>
            </div>
          ))}

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 12, paddingTop: 12, borderTop: '2px solid var(--c-divider)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-dark)' }}>Total variable CPM</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#E53E3E' }}>
              ${fmt(calc.totalVariableCPM)}/mi
            </span>
          </div>
        </div>

        {/* Section D — Trip Calculator */}
        <div style={card}>
          <div style={sectionTitle}>D — Trip Calculator</div>

          <div style={inputRow}>
            <span style={labelStyle}>🗺️ Route miles (loaded)</span>
            <input
              type="number"
              style={numInput}
              value={routeMiles}
              min={1}
              onChange={e => setRouteMiles(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>mi</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>💵 Your rate</span>
            <span style={{ fontSize: 12, color: '#A0AEC0', marginRight: 2 }}>$</span>
            <input
              type="number"
              style={numInput}
              value={ratePerMile}
              step={0.01}
              min={0}
              onChange={e => setRatePerMile(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>/mi</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>🔄 Empty miles (deadhead)</span>
            <input
              type="number"
              style={numInput}
              value={emptyMiles}
              min={0}
              onChange={e => setEmptyMiles(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>mi</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>📍 Extra stops (+$25/stop)</span>
            <input
              type="number"
              style={numInput}
              value={extraStops}
              min={0}
              onChange={e => setExtraStops(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>stops</span>
          </div>

          <div style={inputRow}>
            <span style={labelStyle}>⏱️ Detention hours (+$75/hr)</span>
            <input
              type="number"
              style={numInput}
              value={detentionHours}
              min={0}
              step={0.5}
              onChange={e => setDetentionHours(Number(e.target.value))}
            />
            <span style={{ fontSize: 12, color: '#A0AEC0', width: 30 }}>hrs</span>
          </div>

          {/* Quick trip summary */}
          <div style={{
            background: '#F7FAFC',
            borderRadius: 8,
            padding: '12px 14px',
            marginTop: 12,
            border: '1px solid var(--c-divider)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#718096' }}>Total miles (loaded + empty)</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-dark)' }}>
                {calc.totalMiles.toLocaleString()} mi
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#718096' }}>Gross revenue</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38A169' }}>
                {fmtDollar(calc.grossRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Results (45%)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: '0 0 45%', maxWidth: '45%', display: 'flex', flexDirection: 'column', gap: 0, position: 'sticky', top: 24 }}>

        {/* ── 1. CPM Summary Card ─────────────────────────────────────────── */}
        <div style={{ ...card, border: `2px solid ${cpmColor(calc.totalCPM)}` }}>
          <div style={sectionTitle}>CPM Summary</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={resultLabel}>Fixed CPM</span>
            <span style={resultValue}>${fmt(calc.fixedCPM)}/mi</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={resultLabel}>Variable CPM</span>
            <span style={resultValue}>${fmt(calc.totalVariableCPM)}/mi</span>
          </div>

          <div style={{ borderTop: '2px solid var(--c-divider)', paddingTop: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-dark)' }}>Total CPM</span>
              <span style={{
                fontSize: 28, fontWeight: 900,
                color: cpmColor(calc.totalCPM),
              }}>
                ${fmt(calc.totalCPM)}/mi
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>
              {calc.totalCPM <= 1.2
                ? '✅ Efficient — below average'
                : calc.totalCPM <= 1.6
                ? '⚠️ Average — room to optimize'
                : '🔴 High cost — review expenses'}
            </div>
          </div>

          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>Break-even RPM</span>
              <span style={{ ...resultValue, color: '#E53E3E' }}>${fmt(calc.breakEvenRPM)}/mi</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>Your rate</span>
              <span style={{ ...resultValue, color: 'var(--c-primary)' }}>${fmt(ratePerMile)}/mi</span>
            </div>
            <div style={{ borderTop: '1px solid var(--c-divider)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>Margin / mile</span>
              <span style={{
                fontSize: 20, fontWeight: 900,
                color: marginColor(ratePerMile - calc.totalCPM),
              }}>
                {ratePerMile - calc.totalCPM >= 0 ? '+' : ''}${fmt(ratePerMile - calc.totalCPM)}/mi
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. Trip P&L Card ────────────────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Trip P&L — {routeMiles} loaded mi</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={resultLabel}>Gross revenue ({routeMiles} mi @ ${fmt(ratePerMile)})</span>
            <span style={{ ...resultValue, color: '#38A169' }}>{fmtDollar(calc.grossRevenue)}</span>
          </div>
          {calc.extraStopRevenue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>Extra stops ({extraStops} × $25)</span>
              <span style={{ ...resultValue, color: '#38A169' }}>+{fmtDollar(calc.extraStopRevenue)}</span>
            </div>
          )}
          {calc.detentionRevenue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>Detention ({detentionHours} hrs × $75)</span>
              <span style={{ ...resultValue, color: '#38A169' }}>+{fmtDollar(calc.detentionRevenue)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={resultLabel}>− Fixed costs (CPM × total mi)</span>
            <span style={{ ...resultValue, color: '#E53E3E' }}>−{fmtDollar(calc.fixedCostOnTrip)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={resultLabel}>− Variable costs (CPM × total mi)</span>
            <span style={{ ...resultValue, color: '#E53E3E' }}>−{fmtDollar(calc.variableCostOnTrip)}</span>
          </div>
          {emptyMiles > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>− Deadhead ({emptyMiles} mi)</span>
              <span style={{ ...resultValue, color: '#E53E3E' }}>−{fmtDollar(calc.deadheadCost)}</span>
            </div>
          )}

          <div style={{ borderTop: '2px solid var(--c-divider)', paddingTop: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-dark)' }}>Net Profit</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: marginColor(calc.tripNet) }}>
                {fmtDollar(calc.tripNet)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={resultLabel}>Profit margin</span>
              <span style={{ ...resultValue, color: marginColor(calc.profitMargin) }}>
                {fmt(calc.profitMargin, 1)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={resultLabel}>After-tax est. (~75% of net)</span>
              <span style={{ ...resultValue, color: '#718096' }}>{fmtDollar(calc.afterTax)}</span>
            </div>
          </div>
        </div>

        {/* ── 3. Cost Breakdown Chart (SVG horizontal bars) ───────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Cost Breakdown by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {calc.chartData.map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--c-dark)', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: '#718096' }}>
                    {fmt(item.pct, 1)}% · ${fmt(item.value, 3)}/mi
                  </span>
                </div>
                <div style={{ background: '#EDF2F7', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(item.pct, 1)}%`,
                    height: '100%',
                    background: item.color,
                    borderRadius: 6,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* SVG legend donut */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {(() => {
                const cx = 100, cy = 100, r = 70, innerR = 44
                let startAngle = -Math.PI / 2
                const total = calc.chartData.reduce((s, d) => s + d.pct, 0)
                const safeTotal = total > 0 ? total : 1
                return calc.chartData.map(item => {
                  const angle = (item.pct / safeTotal) * 2 * Math.PI
                  const endAngle = startAngle + angle
                  const x1 = cx + r * Math.cos(startAngle)
                  const y1 = cy + r * Math.sin(startAngle)
                  const x2 = cx + r * Math.cos(endAngle)
                  const y2 = cy + r * Math.sin(endAngle)
                  const ix1 = cx + innerR * Math.cos(startAngle)
                  const iy1 = cy + innerR * Math.sin(startAngle)
                  const ix2 = cx + innerR * Math.cos(endAngle)
                  const iy2 = cy + innerR * Math.sin(endAngle)
                  const largeArc = angle > Math.PI ? 1 : 0
                  const d = [
                    `M ${x1} ${y1}`,
                    `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
                    `L ${ix2} ${iy2}`,
                    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
                    'Z',
                  ].join(' ')
                  const path = <path key={item.label} d={d} fill={item.color} opacity={0.9} />
                  startAngle = endAngle
                  return path
                })
              })()}
              <text x="100" y="96" textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: 'var(--c-dark)' }}>
                CPM
              </text>
              <text x="100" y="114" textAnchor="middle" style={{ fontSize: 15, fontWeight: 900, fill: 'var(--c-dark)' }}>
                ${fmt(calc.totalCPM)}
              </text>
            </svg>
          </div>
        </div>

        {/* ── 4. Monthly P&L Projection Card ──────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Monthly P&L Projection — {milesPerMonth.toLocaleString()} mi/mo</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={resultLabel}>Revenue ({milesPerMonth.toLocaleString()} mi @ ${fmt(ratePerMile)})</span>
            <span style={{ ...resultValue, color: '#38A169' }}>{fmtDollar(calc.monthlyRevenue)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={resultLabel}>Total costs (CPM × miles)</span>
            <span style={{ ...resultValue, color: '#E53E3E' }}>−{fmtDollar(calc.monthlyTotalCost)}</span>
          </div>

          <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '14px', border: '1px solid var(--c-divider)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>Monthly net</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: marginColor(calc.monthlyNet) }}>
                {fmtDollar(calc.monthlyNet)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>Annual net (est.)</span>
              <span style={{ ...resultValue, color: marginColor(calc.annualNet) }}>{fmtDollar(calc.annualNet)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={resultLabel}>Self-employed tax (~25%)</span>
              <span style={{ ...resultValue, color: '#E53E3E' }}>−{fmtDollar(calc.annualTax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--c-divider)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>Take-home (annual)</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#38A169' }}>
                {fmtDollar(calc.takehome)}
              </span>
            </div>
          </div>
        </div>

        {/* ── 5. Rate Scenarios Table ──────────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Rate Scenarios</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--c-divider)' }}>
                  {['Rate $/mi', 'Margin/mi', 'Trip Net', 'Monthly Net'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'right', color: '#718096', fontWeight: 700, fontSize: 12 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => {
                  const isCurrent = Math.abs(s.rate - ratePerMile) < 0.001
                  return (
                    <tr
                      key={s.rate}
                      style={{
                        background: isCurrent ? '#EBF8FF' : scenarioRowColor(s.margin),
                        borderBottom: '1px solid var(--c-divider)',
                        fontWeight: isCurrent ? 700 : 400,
                        outline: isCurrent ? '2px solid var(--c-primary)' : undefined,
                      }}
                    >
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--c-dark)' }}>
                        ${fmt(s.rate)}
                        {isCurrent && (
                          <span style={{ marginLeft: 4, fontSize: 10, background: 'var(--c-primary)', color: '#fff', borderRadius: 4, padding: '1px 5px' }}>
                            current
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: scenarioTextColor(s.margin), fontWeight: 700 }}>
                        {s.margin >= 0 ? '+' : ''}${fmt(s.margin)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: scenarioTextColor(s.margin) }}>
                        {fmtDollar(s.tripNet)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: scenarioTextColor(s.margin) }}>
                        {fmtDollar(s.monthlyNet)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. Benchmarks Card ──────────────────────────────────────────── */}
        <div style={card}>
          <div style={sectionTitle}>Industry Benchmarks</div>

          {[
            { label: 'Avg CPM owner-operator', value: 1.28, note: 'national avg 2024' },
            { label: 'Avg CPM reefer', value: 1.42, note: 'higher insurance & fuel' },
            { label: 'Avg CPM flatbed', value: 1.35, note: 'tarps, equipment' },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--c-dark)', fontWeight: 600 }}>{b.label}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>{b.note}</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#718096' }}>${fmt(b.value)}/mi</span>
            </div>
          ))}

          <div style={{ borderTop: '2px solid var(--c-divider)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--c-dark)', fontWeight: 700 }}>Your CPM ({truckType})</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>calculated from your inputs</div>
              </div>
              <span style={{ fontSize: 20, fontWeight: 900, color: cpmColor(calc.totalCPM) }}>
                ${fmt(calc.totalCPM)}/mi
              </span>
            </div>

            <div style={{
              background: calc.totalCPM <= 1.2 ? '#F0FFF4' : calc.totalCPM <= 1.6 ? '#FFFFF0' : '#FFF5F5',
              borderRadius: 8,
              padding: '12px 14px',
              border: `1px solid ${cpmColor(calc.totalCPM)}20`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: cpmColor(calc.totalCPM), marginBottom: 4 }}>
                💡 Recommendation
              </div>
              <div style={{ fontSize: 12, color: '#4A5568', lineHeight: 1.6 }}>
                {calc.totalCPM <= 1.2
                  ? `Your CPM of $${fmt(calc.totalCPM)} is below the national average — great efficiency! Consider setting your minimum RPM to $${fmt(calc.totalCPM + 0.35)} to ensure a healthy margin on every load.`
                  : calc.totalCPM <= 1.6
                  ? `Your CPM of $${fmt(calc.totalCPM)} is near the industry average. Review your top 2 fixed costs and consider raising your minimum RPM to $${fmt(calc.totalCPM + 0.40)}.`
                  : `Your CPM of $${fmt(calc.totalCPM)} is above average. Fuel, insurance, and truck payment are likely the biggest drivers. Aim for $${fmt(calc.totalCPM + 0.45)}+ RPM minimum to stay profitable.`
                }
              </div>
            </div>
          </div>
        </div>

        {/* ── Role notice ──────────────────────────────────────────────────── */}
        {(role === 'dispatcher' || role === 'company') && (
          <div style={{
            ...card,
            background: '#EBF8FF',
            border: '1px solid #BEE3F8',
          }}>
            <div style={{ fontSize: 13, color: '#2C5282', fontWeight: 600, marginBottom: 4 }}>
              📋 For Dispatchers & Fleet Managers
            </div>
            <div style={{ fontSize: 12, color: '#4A90C4', lineHeight: 1.6 }}>
              Use these CPM figures when evaluating loads for your drivers. A driver&apos;s break-even RPM of
              <strong> ${fmt(calc.breakEvenRPM)}/mi</strong> means you should never book loads below this rate.
              Share this calculator with owner-ops you dispatch to help them set profitable minimums.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
