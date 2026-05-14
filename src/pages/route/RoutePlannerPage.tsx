import { useState, useEffect } from 'react'
import MapView, { type RouteWaypoint as MapRouteWaypoint } from '../../components/MapView'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Waypoint {
  id: string
  city: string
  state: string
  type: 'origin' | 'stop' | 'destination'
  reason?: string
}

interface RouteResult {
  miles: number
  drivingHours: number
  fuelGallons: number
  fuelCost: number
  tollCost: number
  totalCost: number
  revenue: number
  netProfit: number
  rpm: number
  segments: Segment[]
  fuelStops: FuelStop[]
  riskScore: number
  optimizationTips: string[]
}

interface Segment {
  from: string
  to: string
  miles: number
  hours: number
  state: string
}

interface FuelStop {
  name: string
  city: string
  state: string
  price: number
  miles: number
  amenities: string[]
}

interface SavedRoute {
  id: string
  name: string
  from: string
  to: string
  miles: number
  lastUsed: string
  usageCount: number
  avgRpm: number
  avgProfit: number
  tags: string[]
}

interface TruckProfile {
  id: string
  name: string
  truckId: string
  mpg: number
  fuelCapacity: number
  emptyWeight: number
  maxPayload: number
  notes: string
}

interface DriverProfile {
  id: string
  name: string
  licenseClass: string
  hosAvailable: number
  onDutyAvailable: number
  cycleHours: number
  endorsements: string[]
}

// ── HOS & weather types ───────────────────────────────────────────────────────
interface HOSStatus {
  drivingAvailable: number
  onDutyAvailable: number
  breakNeededAt: number
  overnightRequired: boolean
  overnightAt: number
  totalDays: number
  legs: { label: string; miles: number; hours: number; note: string; type: 'drive' | 'break' | 'rest' }[]
}

interface WeatherAlert {
  state: string
  condition: string
  icon: string
  severity: 'clear' | 'caution' | 'warning'
}

interface RiskFactor {
  category: string
  label: string
  severity: 'low' | 'medium' | 'high'
  detail: string
}

function calcHOS(miles: number, drivingHours: number, hosAvailable: number): HOSStatus {
  const mph = 55
  const maxDrivePerDay = Math.min(hosAvailable, 11)
  const maxMilesPerDay = maxDrivePerDay * mph
  const needBreak = drivingHours > 8
  const breakAt = needBreak ? Math.round(8 * mph) : miles + 1
  const overnightRequired = miles > maxMilesPerDay

  const legs: HOSStatus['legs'] = []
  let remaining = miles

  if (overnightRequired) {
    const day1Miles = Math.round(maxMilesPerDay)
    legs.push({ label: 'Day 1 Drive', miles: day1Miles, hours: maxDrivePerDay, note: `Start → ${day1Miles} mi`, type: 'drive' })
    if (needBreak && breakAt < day1Miles) {
      legs.splice(1, 0, { label: '30-min Break', miles: 0, hours: 0.5, note: 'Required after 8h drive', type: 'break' })
    }
    legs.push({ label: '10h Rest', miles: 0, hours: 10, note: 'Mandatory sleeper berth', type: 'rest' })
    remaining -= day1Miles
    if (remaining > 0) {
      legs.push({ label: 'Day 2 Drive', miles: remaining, hours: Math.round(remaining / mph * 10) / 10, note: 'Continue → destination', type: 'drive' })
    }
  } else {
    if (needBreak) {
      legs.push({ label: 'Drive to Break', miles: breakAt, hours: 8, note: 'First leg', type: 'drive' })
      legs.push({ label: '30-min Break', miles: 0, hours: 0.5, note: 'Required by FMCSA', type: 'break' })
      legs.push({ label: 'Continue Drive', miles: miles - breakAt, hours: Math.round((miles - breakAt) / mph * 10) / 10, note: 'Final leg', type: 'drive' })
    } else {
      legs.push({ label: 'Drive', miles, hours: drivingHours, note: 'Non-stop within HOS', type: 'drive' })
    }
  }

  return {
    drivingAvailable: maxDrivePerDay,
    onDutyAvailable: Math.min(hosAvailable + 3, 14),
    breakNeededAt: breakAt,
    overnightRequired,
    overnightAt: Math.round(maxMilesPerDay),
    totalDays: overnightRequired ? 2 : 1,
    legs,
  }
}

function getWeatherAlerts(waypoints: Waypoint[]): WeatherAlert[] {
  const WEATHER: Record<string, WeatherAlert> = {
    IL: { state: 'IL', condition: 'Partly Cloudy · 54°F',    icon: '⛅',  severity: 'clear' },
    MO: { state: 'MO', condition: 'Light Rain · 48°F',       icon: '🌧️', severity: 'caution' },
    OK: { state: 'OK', condition: 'Wind 28 mph · 61°F',      icon: '💨',  severity: 'caution' },
    TX: { state: 'TX', condition: 'Clear · 74°F',            icon: '☀️',  severity: 'clear' },
    TN: { state: 'TN', condition: 'Fog advisory · 44°F',     icon: '🌫️', severity: 'warning' },
    GA: { state: 'GA', condition: 'Thunderstorm risk',       icon: '⛈️',  severity: 'warning' },
    FL: { state: 'FL', condition: 'Clear · 82°F',            icon: '☀️',  severity: 'clear' },
    AZ: { state: 'AZ', condition: 'Clear · 88°F',            icon: '☀️',  severity: 'clear' },
    CA: { state: 'CA', condition: 'Clear · 68°F',            icon: '☀️',  severity: 'clear' },
    OH: { state: 'OH', condition: 'Overcast · 46°F',         icon: '☁️',  severity: 'clear' },
    PA: { state: 'PA', condition: 'Snow flurries · 32°F',    icon: '🌨️', severity: 'warning' },
    NY: { state: 'NY', condition: 'Cold · 29°F',             icon: '❄️',  severity: 'caution' },
    NC: { state: 'NC', condition: 'Clear · 58°F',            icon: '☀️',  severity: 'clear' },
    VA: { state: 'VA', condition: 'Drizzle · 50°F',          icon: '🌦️', severity: 'caution' },
    KY: { state: 'KY', condition: 'Partly Cloudy · 52°F',   icon: '⛅',  severity: 'clear' },
  }
  return waypoints.map(w => WEATHER[w.state] ?? { state: w.state, condition: 'Clear · 65°F', icon: '☀️', severity: 'clear' as const })
    .filter((a, i, arr) => arr.findIndex(x => x.state === a.state) === i)
}

function getRiskFactors(waypoints: Waypoint[], weather: WeatherAlert[], hos: HOSStatus | null): RiskFactor[] {
  const factors: RiskFactor[] = []
  const warnings = weather.filter(w => w.severity === 'warning')
  const cautions = weather.filter(w => w.severity === 'caution')

  if (warnings.length > 0) {
    factors.push({ category: 'Weather', label: 'Severe Weather', severity: 'high', detail: `${warnings.map(w => w.state).join(', ')}: ${warnings[0].condition}` })
  } else if (cautions.length > 0) {
    factors.push({ category: 'Weather', label: 'Weather Advisory', severity: 'medium', detail: `Caution in ${cautions.map(w => w.state).join(', ')}` })
  } else {
    factors.push({ category: 'Weather', label: 'Clear Conditions', severity: 'low', detail: 'No alerts on this route' })
  }

  if (hos) {
    if (hos.overnightRequired) {
      factors.push({ category: 'HOS', label: 'Multi-Day Trip', severity: 'medium', detail: `Overnight rest required at mile ${hos.overnightAt}` })
    } else if (hos.drivingAvailable < 6) {
      factors.push({ category: 'HOS', label: 'Low HOS Buffer', severity: 'high', detail: `Only ${hos.drivingAvailable}h driving available — tight window` })
    } else {
      factors.push({ category: 'HOS', label: 'HOS Compliant', severity: 'low', detail: 'Adequate hours for this run' })
    }
  }

  const hasConstructionStates = waypoints.some(w => ['OH', 'PA', 'NY', 'NJ'].includes(w.state))
  if (hasConstructionStates) {
    factors.push({ category: 'Traffic', label: 'Construction Zones', severity: 'medium', detail: 'Active construction reported on I-80 corridor' })
  } else {
    factors.push({ category: 'Traffic', label: 'Traffic Normal', severity: 'low', detail: 'No significant delays expected' })
  }

  const crossesMountains = waypoints.some(w => ['CO', 'WY', 'MT', 'WA', 'OR', 'ID', 'UT'].includes(w.state))
  if (crossesMountains) {
    factors.push({ category: 'Terrain', label: 'Mountain Passes', severity: 'medium', detail: 'Check chain requirements and grade restrictions' })
  } else {
    factors.push({ category: 'Terrain', label: 'Flat Terrain', severity: 'low', detail: 'No significant elevation changes' })
  }

  return factors
}

// ── Mock calculations ─────────────────────────────────────────────────────────
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const SAVED_ROUTES: SavedRoute[] = [
  { id: 'r1', name: 'Chi → Dal', from: 'Chicago, IL', to: 'Dallas, TX', miles: 917, lastUsed: '2 days ago', usageCount: 24, avgRpm: 2.41, avgProfit: 1240, tags: ['Reefer', 'High Volume'] },
  { id: 'r2', name: 'Chi → ATL', from: 'Chicago, IL', to: 'Atlanta, GA', miles: 716, lastUsed: '1 week ago', usageCount: 18, avgRpm: 2.28, avgProfit: 980, tags: ['Dry Van'] },
  { id: 'r3', name: 'LA → PHX', from: 'Los Angeles, CA', to: 'Phoenix, AZ', miles: 372, lastUsed: '3 days ago', usageCount: 31, avgRpm: 2.65, avgProfit: 540, tags: ['Short Haul', 'High RPM'] },
  { id: 'r4', name: 'MIA → ATL', from: 'Miami, FL', to: 'Atlanta, GA', miles: 662, lastUsed: 'Yesterday', usageCount: 12, avgRpm: 2.18, avgProfit: 870, tags: ['Produce'] },
  { id: 'r5', name: 'NYC → CHI', from: 'New York, NY', to: 'Chicago, IL', miles: 790, lastUsed: '4 days ago', usageCount: 9, avgRpm: 2.55, avgProfit: 1180, tags: ['High Value', 'E-Commerce'] },
  { id: 'r6', name: 'DAL → HOU', from: 'Dallas, TX', to: 'Houston, TX', miles: 239, lastUsed: '5 days ago', usageCount: 44, avgRpm: 2.82, avgProfit: 420, tags: ['Short Haul', 'Tanker'] },
  { id: 'r7', name: 'SEA → LAX', from: 'Seattle, WA', to: 'Los Angeles, CA', miles: 1135, lastUsed: '10 days ago', usageCount: 7, avgRpm: 2.19, avgProfit: 1560, tags: ['Long Haul', 'Flatbed'] },
  { id: 'r8', name: 'DEN → KC', from: 'Denver, CO', to: 'Kansas City, MO', miles: 601, lastUsed: '6 days ago', usageCount: 15, avgRpm: 2.34, avgProfit: 810, tags: ['Dry Van', 'Regular'] },
]

const TRUCK_PROFILES: TruckProfile[] = [
  { id: 'tp1', name: 'Truck 1 — Freightliner', truckId: 'TRK-001', mpg: 6.8, fuelCapacity: 300, emptyWeight: 35000, maxPayload: 45000, notes: 'Best fuel efficiency' },
  { id: 'tp2', name: 'Truck 2 — Kenworth T680', truckId: 'TRK-002', mpg: 6.2, fuelCapacity: 280, emptyWeight: 36500, maxPayload: 44000, notes: 'Reefer unit' },
  { id: 'tp3', name: 'Truck 3 — Peterbilt 389', truckId: 'TRK-003', mpg: 5.9, fuelCapacity: 260, emptyWeight: 37000, maxPayload: 43500, notes: 'Heavy haul' },
  { id: 'tp4', name: 'Truck 4 — Volvo VNL', truckId: 'TRK-004', mpg: 7.1, fuelCapacity: 300, emptyWeight: 34000, maxPayload: 46000, notes: 'Newest fleet' },
]

const DRIVER_PROFILES: DriverProfile[] = [
  { id: 'dp1', name: 'Mike Johnson', licenseClass: 'CDL-A', hosAvailable: 11, onDutyAvailable: 14, cycleHours: 70, endorsements: ['Hazmat', 'Tanker'] },
  { id: 'dp2', name: 'Sarah Chen', licenseClass: 'CDL-A', hosAvailable: 8.5, onDutyAvailable: 11, cycleHours: 65, endorsements: ['Reefer', 'Doubles'] },
  { id: 'dp3', name: 'Carlos Vega', licenseClass: 'CDL-A', hosAvailable: 11, onDutyAvailable: 14, cycleHours: 70, endorsements: ['Flatbed'] },
  { id: 'dp4', name: 'Linda Kim', licenseClass: 'CDL-A', hosAvailable: 5.5, onDutyAvailable: 8, cycleHours: 58, endorsements: ['Hazmat'] },
]

function calcRoute(waypoints: Waypoint[], rate: string, mpg: string, fuelPrice: string): RouteResult {
  const key = `${waypoints[0]?.city} ${waypoints[0]?.state}→${waypoints[waypoints.length-1]?.city} ${waypoints[waypoints.length-1]?.state}`
  const known: Record<string, number> = {
    'Chicago IL→Dallas TX': 917,
    'Chicago IL→Atlanta GA': 716,
    'Los Angeles CA→Phoenix AZ': 372,
    'Miami FL→Atlanta GA': 662,
    'New York NY→Chicago IL': 790,
    'Dallas TX→Houston TX': 239,
    'Seattle WA→Los Angeles CA': 1135,
    'Denver CO→Kansas City MO': 601,
  }
  const miles = known[key] ?? Math.round(400 + Math.random() * 600)
  const mph = 55
  const drivingHours = Math.round((miles / mph) * 10) / 10
  const gallons = Math.round(miles / parseFloat(mpg || '6.5'))
  const fuelCost = Math.round(gallons * parseFloat(fuelPrice || '3.85'))
  const tollCost = Math.round(miles * 0.04)
  const revenue = Math.round(miles * parseFloat(rate || '2.35'))
  const totalCost = fuelCost + tollCost + Math.round(miles * 0.15)
  const netProfit = revenue - totalCost
  const rpm = Math.round((revenue / miles) * 100) / 100

  const segments: Segment[] = waypoints.length >= 2
    ? waypoints.slice(0, -1).map((wp, i) => ({
        from: `${wp.city}, ${wp.state}`,
        to: `${waypoints[i+1].city}, ${waypoints[i+1].state}`,
        miles: Math.round(miles / (waypoints.length - 1)),
        hours: Math.round((miles / (waypoints.length - 1) / mph) * 10) / 10,
        state: wp.state,
      }))
    : []

  const fuelStops: FuelStop[] = [
    { name: 'Pilot Travel Center', city: 'Springfield', state: 'MO', price: 3.82, miles: Math.round(miles * 0.4), amenities: ['Shower', 'Restaurant', 'Scale'] },
    { name: "Love's Travel Stop", city: 'Joplin', state: 'MO', price: 3.79, miles: Math.round(miles * 0.65), amenities: ['Shower', 'WiFi', 'Tire Service'] },
    { name: 'TA Travel Center', city: 'Oklahoma City', state: 'OK', price: 3.84, miles: Math.round(miles * 0.8), amenities: ['Restaurant', 'Scale', 'Laundry'] },
  ]

  const riskScore = miles > 800 ? 65 : miles > 500 ? 42 : 28

  const optimizationTips: string[] = []
  if (parseFloat(rate) < 2.0) optimizationTips.push('Rate is below market average ($2.20–2.50/mi). Consider negotiating.')
  if (parseFloat(mpg) < 6.0) optimizationTips.push('Low MPG detected. Check tire pressure and reduce idle time.')
  if (miles > 900) optimizationTips.push('Long haul: consider team driving to reduce transit time by 40%.')
  if (netProfit < 500) optimizationTips.push('Low margin run. Look for backhaul opportunity from destination.')
  if (fuelStops[0].price > 3.90) optimizationTips.push('Fuel prices above average. Pre-purchase with fleet card for savings.')
  if (optimizationTips.length === 0) optimizationTips.push('Route looks good! RPM and margin are within healthy range.')

  return { miles, drivingHours, fuelGallons: gallons, fuelCost, tollCost, totalCost, revenue, netProfit, rpm, segments, fuelStops, riskScore, optimizationTips }
}

// ── SVG Map ───────────────────────────────────────────────────────────────────
const STATE_POS: Record<string, [number, number]> = {
  WA:[6,8],OR:[5,18],CA:[4,38],NV:[10,32],ID:[12,17],MT:[18,10],WY:[20,22],UT:[15,33],AZ:[14,48],
  CO:[23,35],NM:[22,50],TX:[33,58],ND:[35,10],SD:[37,18],NE:[38,27],KS:[39,36],OK:[40,47],
  MN:[48,14],IA:[50,26],MO:[51,35],AR:[52,47],LA:[52,60],WI:[55,18],IL:[57,28],MI:[63,18],
  IN:[61,28],OH:[66,26],KY:[63,36],TN:[62,44],MS:[58,54],AL:[63,56],GA:[67,56],FL:[69,68],
  SC:[72,48],NC:[71,42],VA:[73,36],WV:[69,33],PA:[72,26],NY:[77,20],VT:[81,14],ME:[85,11],
  NH:[83,16],MA:[83,22],CT:[82,25],NJ:[79,28],DE:[78,32],MD:[76,33],
}

// ── City → lat/lng lookup for Google Maps ─────────────────────────────────────
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Major hubs
  'Chicago IL':        { lat: 41.878, lng: -87.630 },
  'Dallas TX':         { lat: 32.776, lng: -96.797 },
  'Atlanta GA':        { lat: 33.749, lng: -84.388 },
  'Los Angeles CA':    { lat: 34.052, lng: -118.244 },
  'Phoenix AZ':        { lat: 33.448, lng: -112.074 },
  'Miami FL':          { lat: 25.761, lng: -80.192 },
  'New York NY':       { lat: 40.713, lng: -74.006 },
  'Houston TX':        { lat: 29.760, lng: -95.369 },
  'Seattle WA':        { lat: 47.608, lng: -122.335 },
  'Denver CO':         { lat: 39.739, lng: -104.984 },
  'Kansas City MO':    { lat: 39.099, lng: -94.579 },
  'Memphis TN':        { lat: 35.150, lng: -90.048 },
  'Nashville TN':      { lat: 36.174, lng: -86.767 },
  'Charlotte NC':      { lat: 35.227, lng: -80.843 },
  'Indianapolis IN':   { lat: 39.768, lng: -86.158 },
  'Columbus OH':       { lat: 39.961, lng: -82.999 },
  'Louisville KY':     { lat: 38.252, lng: -85.758 },
  'St. Louis MO':      { lat: 38.627, lng: -90.197 },
  'Minneapolis MN':    { lat: 44.980, lng: -93.265 },
  'Detroit MI':        { lat: 42.331, lng: -83.046 },
  'Philadelphia PA':   { lat: 39.952, lng: -75.164 },
  'San Antonio TX':    { lat: 29.424, lng: -98.494 },
  'San Diego CA':      { lat: 32.716, lng: -117.161 },
  'San Francisco CA':  { lat: 37.774, lng: -122.419 },
  'Portland OR':       { lat: 45.523, lng: -122.676 },
  'Salt Lake City UT': { lat: 40.760, lng: -111.891 },
  'Albuquerque NM':    { lat: 35.085, lng: -106.650 },
  'El Paso TX':        { lat: 31.758, lng: -106.488 },
  'Omaha NE':          { lat: 41.257, lng: -95.938 },
  'Oklahoma City OK':  { lat: 35.468, lng: -97.516 },
  'Jacksonville FL':   { lat: 30.332, lng: -81.656 },
  'Tampa FL':          { lat: 27.948, lng: -82.459 },
  'Baltimore MD':      { lat: 39.290, lng: -76.612 },
  'Las Vegas NV':      { lat: 36.175, lng: -115.136 },
  'Tucson AZ':         { lat: 32.222, lng: -110.975 },
  'Fresno CA':         { lat: 36.740, lng: -119.785 },
  'Sacramento CA':     { lat: 38.581, lng: -121.494 },
  'Boston MA':         { lat: 42.360, lng: -71.059 },
  'Pittsburgh PA':     { lat: 40.440, lng: -79.996 },
  'Cincinnati OH':     { lat: 39.103, lng: -84.512 },
  'Cleveland OH':      { lat: 41.500, lng: -81.695 },
  'Milwaukee WI':      { lat: 43.039, lng: -87.907 },
  'Raleigh NC':        { lat: 35.779, lng: -78.638 },
  'Richmond VA':       { lat: 37.541, lng: -77.434 },
  'Baton Rouge LA':    { lat: 30.451, lng: -91.154 },
  'New Orleans LA':    { lat: 29.951, lng: -90.072 },
  'Tulsa OK':          { lat: 36.154, lng: -95.993 },
  'Wichita KS':        { lat: 37.688, lng: -97.336 },
  'Des Moines IA':     { lat: 41.600, lng: -93.609 },
  'Little Rock AR':    { lat: 34.746, lng: -92.289 },
  'Birmingham AL':     { lat: 33.521, lng: -86.803 },
  'Jackson MS':        { lat: 32.298, lng: -90.184 },
  'Shreveport LA':     { lat: 32.525, lng: -93.750 },
}

function toMapWaypoints(wps: Waypoint[]): MapRouteWaypoint[] {
  return wps
    .filter(wp => wp.city && wp.state)
    .map(wp => {
      const key = `${wp.city} ${wp.state}`
      const coords = CITY_COORDS[key] ?? null
      if (!coords) return null
      return { lat: coords.lat, lng: coords.lng, label: `${wp.city}, ${wp.state}`, type: wp.type } as MapRouteWaypoint
    })
    .filter((w): w is MapRouteWaypoint => w !== null)
}

function getMapCenter(wps: MapRouteWaypoint[]): { lat: number; lng: number } {
  if (wps.length === 0) return { lat: 39.5, lng: -98.35 }
  const lat = wps.reduce((s, w) => s + w.lat, 0) / wps.length
  const lng = wps.reduce((s, w) => s + w.lng, 0) / wps.length
  return { lat, lng }
}

function RouteMap({ waypoints, compareWaypoints }: { waypoints: Waypoint[]; compareWaypoints?: Waypoint[] }) {
  const [pulse, setPulse] = useState(false)
  useEffect(() => { const id = setInterval(() => setPulse(p => !p), 900); return () => clearInterval(id) }, [])

  const validWps = waypoints.filter(wp => wp.state && STATE_POS[wp.state])
  const pathPoints = validWps.map(wp => {
    const [x, y] = STATE_POS[wp.state] ?? [50, 40]
    return `${x},${y}`
  }).join(' ')

  const validCompare = (compareWaypoints ?? []).filter(wp => wp.state && STATE_POS[wp.state])
  const comparePath = validCompare.map(wp => {
    const [x, y] = STATE_POS[wp.state] ?? [50, 40]
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ background: '#EBF4F8', borderRadius: 12, overflow: 'hidden', height: '100%', position: 'relative' }}>
      <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
        {[10,20,30,40,50,60,70,80,90].map(x => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={80} stroke="#D4E8F0" strokeWidth="0.2" />)}
        {[10,20,30,40,50,60,70].map(y => <line key={`h${y}`} x1={0} y1={y} x2={100} y2={y} stroke="#D4E8F0" strokeWidth="0.2" />)}
        {Object.entries(STATE_POS).map(([abbr, [x, y]]) => (
          <text key={abbr} x={x} y={y} fontSize="2.2" fill="#B0C8D4" fontFamily="sans-serif" fontWeight="600">{abbr}</text>
        ))}

        {/* Compare route line */}
        {validCompare.length > 1 && (
          <polyline points={comparePath} fill="none" stroke="#F59E0B" strokeWidth="1.2"
            strokeDasharray="1.5 1" opacity={0.7} />
        )}

        {/* Primary route line */}
        {validWps.length > 1 && (
          <polyline points={pathPoints} fill="none" stroke="#4BAED4" strokeWidth="1.2"
            strokeDasharray="2 1" opacity={0.8} />
        )}

        {/* Waypoint dots */}
        {validWps.map((wp, i) => {
          const [x, y] = STATE_POS[wp.state] ?? [50, 40]
          const isFirst = i === 0
          const isLast  = i === validWps.length - 1
          const isMid   = !isFirst && !isLast
          return (
            <g key={wp.id}>
              {isMid && <circle cx={x} cy={y} r="1.4" fill="#F59E0B" stroke="#fff" strokeWidth="0.5" />}
              {isFirst && (
                <>
                  <circle cx={x} cy={y} r={pulse ? '3' : '2'} fill="none" stroke="#38C770" strokeWidth="0.4" opacity={pulse ? 0.3 : 0.6} style={{ transition: 'r .9s' }} />
                  <circle cx={x} cy={y} r="1.8" fill="#38C770" stroke="#fff" strokeWidth="0.5" />
                  <text x={x+2.2} y={y+0.8} fontSize="2" fill="#1A2535" fontFamily="sans-serif" fontWeight="700">{wp.city}</text>
                </>
              )}
              {isLast && (
                <>
                  <polygon points={`${x},${y-2.5} ${x-1.5},${y} ${x+1.5},${y}`} fill="#EF4444" />
                  <text x={x+2.2} y={y+0.8} fontSize="2" fill="#1A2535" fontFamily="sans-serif" fontWeight="700">{wp.city}</text>
                </>
              )}
            </g>
          )
        })}
      </svg>
      <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 14, fontSize: 11, color: '#718096' }}>
        <span>🟢 Origin</span><span>🟡 Stop</span><span>🔺 Destination</span>
        {validCompare.length > 0 && <span style={{ color: '#F59E0B', fontWeight: 700 }}>🟠 Alt Route</span>}
      </div>
    </div>
  )
}

// ── Risk Gauge ────────────────────────────────────────────────────────────────
function RiskGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#38C770'
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Moderate' : 'Low Risk'
  const pct = score / 100
  const W = 120, H = 70, cx = 60, cy = 65, r = 48
  const startAngle = Math.PI
  const endAngle = Math.PI + pct * Math.PI
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle)
  const large = pct > 0.5 ? 1 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="18" fontWeight="900" fill={color} fontFamily="sans-serif">{score}</text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize="9" fill="#718096" fontFamily="sans-serif">{label}</text>
      </svg>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RoutePlannerPage() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 'w1', city: 'Chicago',  state: 'IL', type: 'origin' },
    { id: 'w2', city: 'Dallas',   state: 'TX', type: 'destination' },
  ])
  const [rate,           setRate]           = useState('2.35')
  const [mpg,            setMpg]            = useState('6.5')
  const [fuelPrice,      setFuelPrice]      = useState('3.85')
  const [hosAvailable,   setHosAvailable]   = useState('11')
  const [result,         setResult]         = useState<RouteResult | null>(null)
  const [hos,            setHos]            = useState<HOSStatus | null>(null)
  const [weather,        setWeather]        = useState<WeatherAlert[]>([])
  const [riskFactors,    setRiskFactors]    = useState<RiskFactor[]>([])
  const [activeTab,      setActiveTab]      = useState<'planner' | 'saved' | 'compare' | 'drivers'>('planner')
  const [resultTab,      setResultTab]      = useState<'summary' | 'hos' | 'weather' | 'risk' | 'tips'>('summary')
  const [calculated,     setCalculated]     = useState(false)
  const [selectedTruck,  setSelectedTruck]  = useState<TruckProfile>(TRUCK_PROFILES[0])
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile>(DRIVER_PROFILES[0])
  const [showTruckPanel, setShowTruckPanel] = useState(false)
  const [showDriverPanel,setShowDriverPanel]= useState(false)
  const [savedRouteFilter, setSavedRouteFilter] = useState<string>('all')

  // Compare mode
  const [compareWaypoints, setCompareWaypoints] = useState<Waypoint[]>([
    { id: 'cw1', city: 'Chicago',  state: 'IL', type: 'origin' },
    { id: 'cw2', city: 'Memphis', state: 'TN', type: 'destination' },
  ])
  const [compareRate,  setCompareRate]  = useState('2.20')
  const [compareResult, setCompareResult] = useState<RouteResult | null>(null)

  function addStop() {
    const stop: Waypoint = { id: `w${Date.now()}`, city: '', state: 'MO', type: 'stop' }
    setWaypoints(prev => { const arr = [...prev]; arr.splice(arr.length - 1, 0, stop); return arr })
  }

  function removeWaypoint(id: string) {
    setWaypoints(prev => prev.filter(w => w.id !== id))
  }

  function updateWaypoint(id: string, field: 'city' | 'state' | 'reason', value: string) {
    setWaypoints(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w))
  }

  function updateCompareWaypoint(id: string, field: 'city' | 'state', value: string) {
    setCompareWaypoints(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w))
  }

  function calculate() {
    if (!waypoints[0]?.city || !waypoints[waypoints.length-1]?.city) return
    const effectiveMpg = selectedTruck ? String(selectedTruck.mpg) : mpg
    const effectiveHos = selectedDriver ? String(selectedDriver.hosAvailable) : hosAvailable
    const r = calcRoute(waypoints, rate, effectiveMpg, fuelPrice)
    setResult(r)
    setHos(calcHOS(r.miles, r.drivingHours, parseFloat(effectiveHos)))
    const w = getWeatherAlerts(waypoints)
    setWeather(w)
    const hosStatus = calcHOS(r.miles, r.drivingHours, parseFloat(effectiveHos))
    setRiskFactors(getRiskFactors(waypoints, w, hosStatus))
    setCalculated(true)
    setResultTab('summary')
  }

  function calculateCompare() {
    if (!compareWaypoints[0]?.city || !compareWaypoints[compareWaypoints.length-1]?.city) return
    const r = calcRoute(compareWaypoints, compareRate, mpg, fuelPrice)
    setCompareResult(r)
  }

  function loadSaved(route: SavedRoute) {
    const [fromCity, fromState] = route.from.split(', ')
    const [toCity, toState]     = route.to.split(', ')
    setWaypoints([
      { id: 'w1', city: fromCity, state: fromState, type: 'origin' },
      { id: 'w2', city: toCity,   state: toState,   type: 'destination' },
    ])
    setResult(null)
    setCalculated(false)
    setActiveTab('planner')
  }

  function applyTruckProfile(tp: TruckProfile) {
    setSelectedTruck(tp)
    setMpg(String(tp.mpg))
    setShowTruckPanel(false)
  }

  function applyDriverProfile(dp: DriverProfile) {
    setSelectedDriver(dp)
    setHosAvailable(String(dp.hosAvailable))
    setShowDriverPanel(false)
  }

  const profitColor = result && result.netProfit > 0 ? '#38C770' : '#EF4444'

  const allTags = Array.from(new Set(SAVED_ROUTES.flatMap(r => r.tags)))
  const filteredSavedRoutes = savedRouteFilter === 'all'
    ? SAVED_ROUTES
    : SAVED_ROUTES.filter(r => r.tags.includes(savedRouteFilter))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>🗺️ Route Planner</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Plan routes, compare lanes, estimate cost and profitability
          </p>
        </div>
        <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 10, padding: 3 }}>
          {([
            { key: 'planner',  label: '🗺️ Plan' },
            { key: 'saved',    label: '📋 Saved' },
            { key: 'compare',  label: '⚖️ Compare' },
            { key: 'drivers',  label: '👤 Drivers' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12,
              border: 'none', cursor: 'pointer',
              background: activeTab === t.key ? '#fff' : 'transparent',
              color: activeTab === t.key ? '#4BAED4' : '#718096',
              boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SAVED ROUTES ── */}
      {activeTab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['all', ...allTags].map(tag => (
              <button key={tag} onClick={() => setSavedRouteFilter(tag)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: savedRouteFilter === tag ? '#4BAED4' : '#F0F4F8',
                color: savedRouteFilter === tag ? '#fff' : '#718096',
              }}>
                {tag === 'all' ? 'All Routes' : tag}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {filteredSavedRoutes.map(route => (
              <div key={route.id} style={{
                border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px',
                background: '#fff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>{route.name}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {route.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: '#EBF8FF', color: '#2B6CB0' }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#718096', marginBottom: 2 }}>📍 {route.from}</div>
                <div style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>🔺 {route.to}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center', padding: '6px', background: '#F7FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>{route.miles}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>miles</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px', background: '#F7FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#4BAED4' }}>${route.avgRpm}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>avg RPM</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px', background: '#F7FAFC', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#38C770' }}>${route.avgProfit}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>avg profit</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#A0AEC0' }}>Used {route.usageCount}× · {route.lastUsed}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      setCompareWaypoints([
                        { id: 'cw1', city: route.from.split(', ')[0], state: route.from.split(', ')[1], type: 'origin' },
                        { id: 'cw2', city: route.to.split(', ')[0], state: route.to.split(', ')[1], type: 'destination' },
                      ])
                      setActiveTab('compare')
                    }} style={{ fontSize: 11 }}>⚖️</button>
                    <button className="btn btn-primary btn-sm" onClick={() => loadSaved(route)}>Load →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DRIVERS ── */}
      {activeTab === 'drivers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {DRIVER_PROFILES.map(dp => {
            const hosColor = dp.hosAvailable >= 9 ? '#38C770' : dp.hosAvailable >= 6 ? '#ECC94B' : '#EF4444'
            const cycleColor = dp.cycleHours >= 60 ? '#38C770' : dp.cycleHours >= 40 ? '#ECC94B' : '#EF4444'
            const isSelected = selectedDriver.id === dp.id
            return (
              <div key={dp.id} onClick={() => applyDriverProfile(dp)} style={{
                border: `2px solid ${isSelected ? '#4BAED4' : '#E2E8F0'}`,
                borderRadius: 14, padding: '16px 18px', background: isSelected ? '#EBF8FF' : '#fff',
                cursor: 'pointer', transition: 'all .2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>{dp.name}</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{dp.licenseClass}</div>
                  </div>
                  {isSelected && <span style={{ fontSize: 11, fontWeight: 700, color: '#4BAED4', background: '#EBF8FF', padding: '3px 8px', borderRadius: 8 }}>✓ Selected</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginBottom: 4 }}>
                      <span>HOS Available</span>
                      <span style={{ fontWeight: 700, color: hosColor }}>{dp.hosAvailable}h</span>
                    </div>
                    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(dp.hosAvailable / 11) * 100}%`, height: '100%', background: hosColor, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginBottom: 4 }}>
                      <span>70-hr Cycle</span>
                      <span style={{ fontWeight: 700, color: cycleColor }}>{dp.cycleHours}h left</span>
                    </div>
                    <div style={{ height: 6, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(dp.cycleHours / 70) * 100}%`, height: '100%', background: cycleColor, borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                  {dp.endorsements.map(e => (
                    <span key={e} style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: '#F0FFF4', color: '#276749' }}>{e}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── COMPARE ── */}
      {activeTab === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Route A */}
            <div className="card" style={{ borderTop: '3px solid #4BAED4' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#4BAED4' }}>🔵 Route A (Primary)</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Origin</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="input" placeholder="City" value={waypoints[0]?.city ?? ''} onChange={e => updateWaypoint('w1', 'city', e.target.value)} style={{ flex: 1, fontSize: 12 }} />
                    <select className="input" style={{ width: 66, fontSize: 12 }} value={waypoints[0]?.state ?? 'IL'} onChange={e => updateWaypoint('w1', 'state', e.target.value)}>
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Destination</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="input" placeholder="City" value={waypoints[waypoints.length - 1]?.city ?? ''} onChange={e => updateWaypoint('w2', 'city', e.target.value)} style={{ flex: 1, fontSize: 12 }} />
                    <select className="input" style={{ width: 66, fontSize: 12 }} value={waypoints[waypoints.length - 1]?.state ?? 'TX'} onChange={e => updateWaypoint('w2', 'state', e.target.value)}>
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Rate $/mi</label>
                  <input className="input" type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} style={{ fontSize: 12 }} />
                </div>
              </div>
              {result && (
                <div style={{ background: '#EBF8FF', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Miles', value: `${result.miles} mi` },
                      { label: 'Revenue', value: `$${result.revenue.toLocaleString()}` },
                      { label: 'Cost', value: `$${result.totalCost.toLocaleString()}` },
                      { label: 'Profit', value: `$${result.netProfit.toLocaleString()}`, color: profitColor },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: (item as any).color ?? '#1A2535' }}>{item.value}</div>
                        <div style={{ fontSize: 10, color: '#718096' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, fontWeight: 700, color: '#4BAED4' }}>RPM: ${result.rpm.toFixed(2)}</div>
                </div>
              )}
            </div>

            {/* Route B */}
            <div className="card" style={{ borderTop: '3px solid #F59E0B' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#D97706' }}>🟠 Route B (Alternative)</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Origin</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="input" placeholder="City" value={compareWaypoints[0]?.city ?? ''} onChange={e => updateCompareWaypoint('cw1', 'city', e.target.value)} style={{ flex: 1, fontSize: 12 }} />
                    <select className="input" style={{ width: 66, fontSize: 12 }} value={compareWaypoints[0]?.state ?? 'IL'} onChange={e => updateCompareWaypoint('cw1', 'state', e.target.value)}>
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Destination</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="input" placeholder="City" value={compareWaypoints[compareWaypoints.length - 1]?.city ?? ''} onChange={e => updateCompareWaypoint('cw2', 'city', e.target.value)} style={{ flex: 1, fontSize: 12 }} />
                    <select className="input" style={{ width: 66, fontSize: 12 }} value={compareWaypoints[compareWaypoints.length - 1]?.state ?? 'TN'} onChange={e => updateCompareWaypoint('cw2', 'state', e.target.value)}>
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 4 }}>Rate $/mi</label>
                  <input className="input" type="number" step="0.01" value={compareRate} onChange={e => setCompareRate(e.target.value)} style={{ fontSize: 12 }} />
                </div>
              </div>
              {compareResult && (
                <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Miles', value: `${compareResult.miles} mi` },
                      { label: 'Revenue', value: `$${compareResult.revenue.toLocaleString()}` },
                      { label: 'Cost', value: `$${compareResult.totalCost.toLocaleString()}` },
                      { label: 'Profit', value: `$${compareResult.netProfit.toLocaleString()}`, color: compareResult.netProfit > 0 ? '#38C770' : '#EF4444' },
                    ].map(item => (
                      <div key={item.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: (item as any).color ?? '#1A2535' }}>{item.value}</div>
                        <div style={{ fontSize: 10, color: '#718096' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, fontWeight: 700, color: '#D97706' }}>RPM: ${compareResult.rpm.toFixed(2)}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: '12px', fontWeight: 800 }}
              onClick={() => { calculate(); calculateCompare() }}>
              ⚖️ Compare Both Routes
            </button>
          </div>

          {result && compareResult && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #1A2535 0%, #2D3748 100%)', color: '#fff' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: '#fff' }}>📊 Comparison Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Miles Diff', value: `${Math.abs(result.miles - compareResult.miles)} mi`, winner: result.miles < compareResult.miles ? 'A' : 'B' },
                  { label: 'Revenue Diff', value: `$${Math.abs(result.revenue - compareResult.revenue).toLocaleString()}`, winner: result.revenue > compareResult.revenue ? 'A' : 'B' },
                  { label: 'Profit Diff', value: `$${Math.abs(result.netProfit - compareResult.netProfit).toLocaleString()}`, winner: result.netProfit > compareResult.netProfit ? 'A' : 'B' },
                  { label: 'Better RPM', value: `$${Math.max(result.rpm, compareResult.rpm).toFixed(2)}`, winner: result.rpm > compareResult.rpm ? 'A' : 'B' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '12px' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: item.winner === 'A' ? '#4BAED4' : '#F59E0B' }}>{item.value}</div>
                    <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 10, marginTop: 4, fontWeight: 700, color: item.winner === 'A' ? '#4BAED4' : '#F59E0B' }}>Winner: Route {item.winner}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,.08)', borderRadius: 10, fontSize: 13 }}>
                <strong>Recommendation:</strong> {result.netProfit > compareResult.netProfit
                  ? `Route A (${waypoints[0]?.city} → ${waypoints[waypoints.length-1]?.city}) is more profitable by $${(result.netProfit - compareResult.netProfit).toLocaleString()}.`
                  : `Route B (${compareWaypoints[0]?.city} → ${compareWaypoints[compareWaypoints.length-1]?.city}) is more profitable by $${(compareResult.netProfit - result.netProfit).toLocaleString()}.`}
              </div>
            </div>
          )}

          {/* Map showing both routes */}
          <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            {(() => {
              const mapWpsA = toMapWaypoints(waypoints)
              const mapWpsB = toMapWaypoints(compareWaypoints)
              const allWps = [...mapWpsA, ...mapWpsB]
              return (
                <MapView
                  height={300}
                  center={getMapCenter(allWps.length ? allWps : mapWpsA)}
                  zoom={4}
                  waypoints={mapWpsA}
                  useDirections={mapWpsA.length >= 2}
                  dark={false}
                />
              )
            })()}
          </div>
        </div>
      )}

      {/* ── PLANNER ── */}
      {activeTab === 'planner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20 }}>

          {/* LEFT: Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Quick profile selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setShowTruckPanel(!showTruckPanel)} style={{
                padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 700, marginBottom: 2 }}>🚛 TRUCK</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>{selectedTruck.truckId}</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{selectedTruck.mpg} mpg</div>
              </button>
              <button onClick={() => setShowDriverPanel(!showDriverPanel)} style={{
                padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontSize: 10, color: '#A0AEC0', fontWeight: 700, marginBottom: 2 }}>👤 DRIVER</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>{selectedDriver.name.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: selectedDriver.hosAvailable >= 8 ? '#38C770' : selectedDriver.hosAvailable >= 5 ? '#ECC94B' : '#EF4444' }}>{selectedDriver.hosAvailable}h HOS</div>
              </button>
            </div>

            {showTruckPanel && (
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', marginBottom: 10 }}>Select Truck Profile</div>
                {TRUCK_PROFILES.map(tp => (
                  <div key={tp.id} onClick={() => applyTruckProfile(tp)} style={{
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                    background: selectedTruck.id === tp.id ? '#EBF8FF' : '#F7FAFC',
                    border: `1px solid ${selectedTruck.id === tp.id ? '#4BAED4' : '#E2E8F0'}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{tp.name}</div>
                    <div style={{ fontSize: 11, color: '#718096' }}>{tp.mpg} mpg · Cap {tp.fuelCapacity}gal · {tp.notes}</div>
                  </div>
                ))}
              </div>
            )}

            {showDriverPanel && (
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535', marginBottom: 10 }}>Select Driver</div>
                {DRIVER_PROFILES.map(dp => {
                  const hosColor = dp.hosAvailable >= 9 ? '#38C770' : dp.hosAvailable >= 6 ? '#ECC94B' : '#EF4444'
                  return (
                    <div key={dp.id} onClick={() => applyDriverProfile(dp)} style={{
                      padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 6,
                      background: selectedDriver.id === dp.id ? '#EBF8FF' : '#F7FAFC',
                      border: `1px solid ${selectedDriver.id === dp.id ? '#4BAED4' : '#E2E8F0'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>{dp.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: hosColor }}>{dp.hosAvailable}h</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{dp.licenseClass} · {dp.endorsements.join(', ')}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Waypoints */}
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 16 }}>Route</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {waypoints.map((wp) => (
                  <div key={wp.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                      background: wp.type === 'origin' ? '#38C77020' : wp.type === 'destination' ? '#EF444420' : '#F59E0B20',
                      border: `2px solid ${wp.type === 'origin' ? '#38C770' : wp.type === 'destination' ? '#EF4444' : '#F59E0B'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                    }}>
                      {wp.type === 'origin' ? '🟢' : wp.type === 'destination' ? '🔺' : '🟡'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: wp.type === 'stop' ? 6 : 0 }}>
                        <input className="input" placeholder="City"
                          value={wp.city}
                          onChange={e => updateWaypoint(wp.id, 'city', e.target.value)}
                          style={{ flex: 1 }} />
                        <select className="input" style={{ width: 70 }}
                          value={wp.state}
                          onChange={e => updateWaypoint(wp.id, 'state', e.target.value)}>
                          {US_STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      {wp.type === 'stop' && (
                        <input className="input" placeholder="Reason (e.g. Fuel stop, delivery)"
                          value={wp.reason ?? ''}
                          onChange={e => updateWaypoint(wp.id, 'reason', e.target.value)}
                          style={{ fontSize: 12 }} />
                      )}
                    </div>
                    {wp.type === 'stop' && (
                      <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444', marginTop: 6 }}
                        onClick={() => removeWaypoint(wp.id)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn btn-outline btn-full" style={{ marginTop: 14, fontSize: 13 }} onClick={addStop}>
                + Add Stop / Waypoint
              </button>
            </div>

            {/* Settings */}
            <div className="card">
              <h3 className="section-title" style={{ marginBottom: 14 }}>Rate & Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Rate ($/mi)',         key: 'rate', value: rate,         set: setRate,         prefix: '$' },
                  { label: 'MPG',                 key: 'mpg',  value: mpg,          set: setMpg,          prefix: '' },
                  { label: 'Fuel Price ($/gal)',   key: 'fuel', value: fuelPrice,    set: setFuelPrice,    prefix: '$' },
                  { label: 'HOS Available (hours)',key: 'hos',  value: hosAvailable, set: setHosAvailable, prefix: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', display: 'block', marginBottom: 5 }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      {f.prefix && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }}>{f.prefix}</span>}
                      <input className="input" type="number" step="0.01"
                        style={{ paddingLeft: f.prefix ? 22 : 12 }}
                        value={f.value} onChange={e => f.set(e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ padding: '14px', fontSize: 15, fontWeight: 800 }}
              onClick={calculate}
              disabled={!waypoints[0]?.city || !waypoints[waypoints.length-1]?.city}>
              🗺️ Calculate Route
            </button>
          </div>

          {/* RIGHT: Map + Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Map */}
            <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
              {(() => {
                const mapWps = toMapWaypoints(waypoints)
                return (
                  <MapView
                    height={300}
                    center={getMapCenter(mapWps)}
                    zoom={mapWps.length >= 2 ? 5 : 4}
                    waypoints={mapWps}
                    useDirections={calculated && mapWps.length >= 2}
                    dark={false}
                  />
                )
              })()}
              {!calculated && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'rgba(235,244,248,.65)',
                  borderRadius: 12,
                }}>
                  <div style={{ textAlign: 'center', color: '#718096' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🗺️</div>
                    <div style={{ fontWeight: 700 }}>Enter route and click Calculate</div>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <>
                {/* P&L Summary banner */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)',
                  borderRadius: 16, padding: '20px 24px', color: '#fff',
                }}>
                  <div style={{ fontSize: 12, opacity: .7, marginBottom: 8 }}>ROUTE SUMMARY — {waypoints[0]?.city} → {waypoints[waypoints.length-1]?.city}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                    {[
                      { label: 'Miles',       value: `${result.miles.toLocaleString()} mi` },
                      { label: 'Drive Time',  value: `${result.drivingHours}h` },
                      { label: 'Revenue',     value: `$${result.revenue.toLocaleString()}` },
                      { label: 'Net Profit',  value: `$${result.netProfit.toLocaleString()}`, color: profitColor },
                      { label: 'RPM',         value: `$${result.rpm.toFixed(2)}`, color: result.rpm >= 2.2 ? '#38C770' : '#ECC94B' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: (s as any).color ?? '#fff' }}>{s.value}</div>
                        <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Result tabs */}
                <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 10, padding: 3, gap: 2 }}>
                  {([
                    { key: 'summary', label: '💸 Costs' },
                    { key: 'hos',     label: '⏱️ HOS' },
                    { key: 'weather', label: '🌤️ Weather' },
                    { key: 'risk',    label: '⚠️ Risk' },
                    { key: 'tips',    label: '💡 Tips' },
                  ] as const).map(t => (
                    <button key={t.key} onClick={() => setResultTab(t.key)} style={{
                      flex: 1, padding: '7px 8px', borderRadius: 8, fontWeight: 700, fontSize: 12,
                      border: 'none', cursor: 'pointer',
                      background: resultTab === t.key ? '#fff' : 'transparent',
                      color: resultTab === t.key ? '#4BAED4' : '#718096',
                      boxShadow: resultTab === t.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Summary tab */}
                {resultTab === 'summary' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="card">
                      <h3 className="section-title" style={{ marginBottom: 12 }}>💸 Cost Breakdown</h3>
                      {[
                        { label: 'Fuel',           value: `$${result.fuelCost.toLocaleString()}`,    note: `${result.fuelGallons} gal × $${fuelPrice}` },
                        { label: 'Tolls',           value: `$${result.tollCost.toLocaleString()}`,    note: 'Estimated' },
                        { label: 'Operating',       value: `$${(result.totalCost - result.fuelCost - result.tollCost).toLocaleString()}`, note: '~$0.15/mi' },
                        { label: 'Total Expenses',  value: `$${result.totalCost.toLocaleString()}`,   bold: true },
                      ].map(row => (
                        <div key={row.label} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 0', borderBottom: '1px solid #F7FAFC',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: (row as any).bold ? 800 : 600, color: '#2D3748' }}>{row.label}</div>
                            {(row as any).note && <div style={{ fontSize: 11, color: '#A0AEC0' }}>{(row as any).note}</div>}
                          </div>
                          <span style={{ fontWeight: 700, color: (row as any).bold ? '#EF4444' : '#718096' }}>{row.value}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, padding: '10px 12px', background: '#F0FDF4', borderRadius: 10 }}>
                        <div style={{ fontSize: 12, color: '#166534' }}>Net Profit</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: profitColor }}>${result.netProfit.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{result.rpm.toFixed(2)} $/mi · {Math.round((result.netProfit / result.revenue) * 100)}% margin</div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="section-title" style={{ marginBottom: 12 }}>⛽ Fuel Stops</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                        {result.fuelStops.map((stop, i) => (
                          <div key={i} style={{ padding: '10px 12px', background: '#F7FAFC', borderRadius: 10 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{stop.name}</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>📍 {stop.city}, {stop.state}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12 }}>
                              <span style={{ color: '#4BAED4' }}>At mile {stop.miles}</span>
                              <span style={{ fontWeight: 700, color: '#F59E0B' }}>${stop.price}/gal</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                              {stop.amenities.map(a => (
                                <span key={a} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 6, background: '#EBF8FF', color: '#2B6CB0', fontWeight: 700 }}>{a}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <h3 className="section-title" style={{ marginBottom: 10 }}>🛣️ Segments</h3>
                      {result.segments.map((seg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F7FAFC', fontSize: 12 }}>
                          <span style={{ color: '#4A5568' }}>{seg.from.split(',')[0]} → {seg.to.split(',')[0]}</span>
                          <span style={{ color: '#718096' }}>{seg.miles} mi · {seg.hours}h</span>
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button className="btn btn-primary" style={{ flex: 1, fontSize: 12 }}>📤 Export Route</button>
                        <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12 }}>💾 Save Route</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* HOS tab */}
                {resultTab === 'hos' && hos && (
                  <div className="card" style={{ borderTop: `3px solid ${hos.overnightRequired ? '#E53E3E' : '#38C770'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 className="section-title" style={{ margin: 0 }}>⏱️ HOS Compliance — {selectedDriver.name}</h3>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                        background: hos.overnightRequired ? '#FFF5F5' : '#F0FFF4',
                        color: hos.overnightRequired ? '#9B2C2C' : '#276749',
                      }}>
                        {hos.overnightRequired ? `⚠️ ${hos.totalDays}-day trip` : '✅ Single day'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#718096', marginBottom: 5 }}>
                          <span>Driving Available</span>
                          <span style={{ fontWeight: 700 }}>{hos.drivingAvailable}h / 11h</span>
                        </div>
                        <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${(hos.drivingAvailable / 11) * 100}%`, height: '100%', background: hos.drivingAvailable >= 8 ? '#38C770' : hos.drivingAvailable >= 4 ? '#ECC94B' : '#E53E3E', borderRadius: 4 }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#718096', marginBottom: 5 }}>
                          <span>On-Duty Available</span>
                          <span style={{ fontWeight: 700 }}>{hos.onDutyAvailable}h / 14h</span>
                        </div>
                        <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${(hos.onDutyAvailable / 14) * 100}%`, height: '100%', background: '#4BAED4', borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {hos.legs.map((leg, i) => {
                        const legColor = leg.type === 'drive' ? '#4BAED4' : leg.type === 'break' ? '#ECC94B' : '#8B5CF6'
                        return (
                          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: '#F7FAFC', borderRadius: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: legColor, marginTop: 3, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{leg.label}</div>
                              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                                {leg.miles > 0 ? `${leg.miles} mi · ` : ''}{leg.hours}h{leg.hours < 1 ? ' (30 min)' : ''} — {leg.note}
                              </div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: legColor + '20', color: legColor }}>
                              {leg.type.toUpperCase()}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {hos.overnightRequired && (
                      <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFF5F5', borderRadius: 10, fontSize: 12, color: '#9B2C2C' }}>
                        🛑 Overnight rest required at mile {hos.overnightAt}. Plan a truck stop or rest area ahead of time.
                        Consider <strong>TA Travel Center</strong> or <strong>Pilot Flying J</strong> for safe parking.
                      </div>
                    )}
                  </div>
                )}

                {/* Weather tab */}
                {resultTab === 'weather' && weather.length > 0 && (
                  <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>🌤️ Route Weather Conditions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                      {weather.map(w => (
                        <div key={w.state} style={{
                          padding: '12px 14px', borderRadius: 12,
                          background: w.severity === 'warning' ? '#FFF5F5' : w.severity === 'caution' ? '#FFFBEB' : '#F7FAFC',
                          border: `1px solid ${w.severity === 'warning' ? '#FED7D7' : w.severity === 'caution' ? '#FEEBC8' : '#E2E8F0'}`,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div style={{ fontSize: 22 }}>{w.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535' }}>{w.state}</div>
                          </div>
                          <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 6 }}>{w.condition}</div>
                          {w.severity !== 'clear' && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                              background: w.severity === 'warning' ? '#E53E3E' : '#D97706', color: '#fff',
                            }}>{w.severity.toUpperCase()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {weather.some(w => w.severity === 'warning') && (
                      <div style={{ marginTop: 14, padding: '10px 14px', background: '#FFF5F5', borderRadius: 10, fontSize: 12, color: '#9B2C2C' }}>
                        ⚠️ Severe weather alerts on your route. Check FMCSA weather updates before departure.
                        Consider delaying departure by 24–48 hours or rerouting.
                      </div>
                    )}
                  </div>
                )}

                {/* Risk tab */}
                {resultTab === 'risk' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#718096', marginBottom: 8 }}>RISK SCORE</div>
                      <RiskGauge score={result.riskScore} />
                      <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 8, textAlign: 'center' }}>
                        Based on weather, HOS, traffic, and terrain
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="section-title" style={{ marginBottom: 12 }}>⚠️ Risk Assessment</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {riskFactors.map((rf, i) => {
                          const color = rf.severity === 'high' ? '#EF4444' : rf.severity === 'medium' ? '#F59E0B' : '#38C770'
                          return (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: '#F7FAFC', borderRadius: 10 }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginTop: 3, flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{rf.label}</div>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#718096' }}>{rf.category}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#718096' }}>{rf.detail}</div>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: color + '20', color, flexShrink: 0 }}>
                                {rf.severity.toUpperCase()}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips tab */}
                {resultTab === 'tips' && (
                  <div className="card">
                    <h3 className="section-title" style={{ marginBottom: 14 }}>💡 Optimization Recommendations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.optimizationTips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FEEBC8' }}>
                          <div style={{ fontSize: 18, flexShrink: 0 }}>💡</div>
                          <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.5 }}>{tip}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#4A5568' }}>📈 Route Performance vs. Fleet Average</h4>
                      {[
                        { label: 'Your RPM',           value: result.rpm.toFixed(2),      benchmark: '2.28', unit: '$/mi' },
                        { label: 'Fuel Efficiency',    value: String(selectedTruck.mpg),  benchmark: '6.4',  unit: 'mpg' },
                        { label: 'Margin',             value: String(Math.round((result.netProfit / result.revenue) * 100)), benchmark: '22', unit: '%' },
                      ].map(item => {
                        const val = parseFloat(item.value)
                        const bench = parseFloat(item.benchmark)
                        const good = val >= bench
                        return (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F7FAFC' }}>
                            <span style={{ fontSize: 13, color: '#4A5568' }}>{item.label}</span>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: '#A0AEC0' }}>Fleet avg: {item.benchmark} {item.unit}</span>
                              <span style={{ fontWeight: 800, color: good ? '#38C770' : '#EF4444' }}>{item.value} {item.unit} {good ? '↑' : '↓'}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
