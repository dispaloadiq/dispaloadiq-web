import { useState, useMemo } from 'react'
import type { UserRole } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────
type Chain = 'Pilot' | 'Flying J' | "Love's" | 'TA' | 'Petro' | 'Shell' | 'BP' | 'Sunoco'

interface FuelStop {
  id: string
  chain: Chain
  name: string
  city: string
  state: string
  exit: string
  mileMark: number
  dieselPrice: number   // $/gal regular
  defPrice: number      // DEF $/gal
  cardDiscount: number  // $/gal fleet card discount
  amenities: string[]
  truckParking: number  // spaces
  showers: boolean
  scales: boolean
  waitMinutes: number
}

interface RouteData {
  id: string
  label: string
  origin: string
  destination: string
  totalMiles: number
  highway: string
  stops: FuelStop[]
}

// ─── Fleet Card Config ────────────────────────────────────────────────────────
const CHAIN_COLORS: Record<Chain, { bg: string; text: string; border: string }> = {
  'Pilot':     { bg: '#EBF8FF', text: '#1A4F72', border: '#BEE3F8' },
  'Flying J':  { bg: '#EBF8FF', text: '#1A4F72', border: '#BEE3F8' }, // same brand
  "Love's":    { bg: '#FFF5F5', text: '#7B1A1A', border: '#FED7D7' },
  'TA':        { bg: '#F0FFF4', text: '#1A6B40', border: '#9AE6B4' },
  'Petro':     { bg: '#F0FFF4', text: '#1A6B40', border: '#9AE6B4' }, // same brand
  'Shell':     { bg: '#FFFBEB', text: '#7B4F1A', border: '#FBD38D' },
  'BP':        { bg: '#EBF8FF', text: '#1A4F72', border: '#BEE3F8' },
  'Sunoco':    { bg: '#FFF5F5', text: '#7B1A1A', border: '#FED7D7' },
}

const CHAIN_LOGO: Record<Chain, string> = {
  'Pilot': '✈️', 'Flying J': '✈️', "Love's": '❤️',
  'TA': '🛣️', 'Petro': '🛣️', 'Shell': '🐚', 'BP': '💧', 'Sunoco': '☀️',
}

// ─── Mock Route Data ──────────────────────────────────────────────────────────
const ROUTES: RouteData[] = [
  {
    id: 'chi-dal',
    label: 'Chicago → Dallas',
    origin: 'Chicago, IL',
    destination: 'Dallas, TX',
    totalMiles: 920,
    highway: 'I-55 / I-44 / US-69',
    stops: [
      { id: 's1', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Joliet', state: 'IL', exit: 'I-55 Exit 257', mileMark: 48, dieselPrice: 3.789, defPrice: 2.599, cardDiscount: 0.06, amenities: ['Subway', 'Cinnabon', 'WiFi'], truckParking: 120, showers: true, scales: true, waitMinutes: 0 },
      { id: 's2', chain: "Love's", name: "Love's Travel Stop", city: 'Pontiac', state: 'IL', exit: 'I-55 Exit 197', mileMark: 98, dieselPrice: 3.749, defPrice: 2.499, cardDiscount: 0.05, amenities: ['Chester\'s Chicken', 'WiFi', 'Laundry'], truckParking: 85, showers: true, scales: false, waitMinutes: 5 },
      { id: 's3', chain: 'TA', name: 'TA Travel Center', city: 'Bloomington', state: 'IL', exit: 'I-55 Exit 160', mileMark: 155, dieselPrice: 3.809, defPrice: 2.649, cardDiscount: 0.08, amenities: ['Iron Skillet', 'Burger King', 'WiFi', 'Gym'], truckParking: 200, showers: true, scales: true, waitMinutes: 10 },
      { id: 's4', chain: 'Flying J', name: 'Flying J Travel Center', city: 'Springfield', state: 'IL', exit: 'I-55 Exit 92', mileMark: 215, dieselPrice: 3.729, defPrice: 2.549, cardDiscount: 0.06, amenities: ['Denny\'s', 'Cinnabon', 'WiFi'], truckParking: 150, showers: true, scales: true, waitMinutes: 0 },
      { id: 's5', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Mt Vernon', state: 'IL', exit: 'I-57 Exit 95', mileMark: 290, dieselPrice: 3.769, defPrice: 2.599, cardDiscount: 0.06, amenities: ['Subway', 'Wendy\'s', 'WiFi'], truckParking: 95, showers: true, scales: false, waitMinutes: 0 },
      { id: 's6', chain: "Love's", name: "Love's Travel Stop", city: 'Sikeston', state: 'MO', exit: 'I-55 Exit 66', mileMark: 355, dieselPrice: 3.699, defPrice: 2.469, cardDiscount: 0.05, amenities: ['Hardee\'s', 'WiFi'], truckParking: 110, showers: true, scales: false, waitMinutes: 0 },
      { id: 's7', chain: 'TA', name: 'Petro Stopping Center', city: 'Joplin', state: 'MO', exit: 'I-44 Exit 6', mileMark: 460, dieselPrice: 3.679, defPrice: 2.449, cardDiscount: 0.08, amenities: ['Iron Skillet', 'WiFi', 'Tire Shop'], truckParking: 280, showers: true, scales: true, waitMinutes: 15 },
      { id: 's8', chain: 'Pilot', name: 'Pilot Flying J', city: 'Miami', state: 'OK', exit: 'I-44 Exit 302', mileMark: 520, dieselPrice: 3.659, defPrice: 2.449, cardDiscount: 0.06, amenities: ['Subway', 'Starbucks', 'WiFi'], truckParking: 130, showers: true, scales: true, waitMinutes: 5 },
      { id: 's9', chain: 'Flying J', name: 'Flying J Travel Center', city: 'Tulsa', state: 'OK', exit: 'I-244 Exit 4', mileMark: 578, dieselPrice: 3.649, defPrice: 2.429, cardDiscount: 0.06, amenities: ['Denny\'s', 'WiFi', 'CAT Scale'], truckParking: 175, showers: true, scales: true, waitMinutes: 0 },
      { id: 's10', chain: "Love's", name: "Love's Travel Stop", city: 'Ardmore', state: 'OK', exit: 'I-35 Exit 31', mileMark: 648, dieselPrice: 3.669, defPrice: 2.459, cardDiscount: 0.05, amenities: ['Arby\'s', 'WiFi'], truckParking: 90, showers: true, scales: false, waitMinutes: 0 },
      { id: 's11', chain: 'TA', name: 'TA Express', city: 'Sherman', state: 'TX', exit: 'US-75 Exit 67', mileMark: 768, dieselPrice: 3.699, defPrice: 2.499, cardDiscount: 0.08, amenities: ['McDonald\'s', 'WiFi'], truckParking: 70, showers: false, scales: false, waitMinutes: 0 },
      { id: 's12', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Denton', state: 'TX', exit: 'I-35W Exit 469', mileMark: 845, dieselPrice: 3.729, defPrice: 2.529, cardDiscount: 0.06, amenities: ['Subway', 'Taco Bell', 'WiFi'], truckParking: 140, showers: true, scales: true, waitMinutes: 5 },
      { id: 's13', chain: "Love's", name: "Love's Travel Stop", city: 'Irving', state: 'TX', exit: 'I-35E Exit 444', mileMark: 895, dieselPrice: 3.749, defPrice: 2.559, cardDiscount: 0.05, amenities: ['Subway', 'WiFi'], truckParking: 65, showers: true, scales: false, waitMinutes: 10 },
    ],
  },
  {
    id: 'la-phx',
    label: 'Los Angeles → Phoenix',
    origin: 'Los Angeles, CA',
    destination: 'Phoenix, AZ',
    totalMiles: 370,
    highway: 'I-10 East',
    stops: [
      { id: 'p1', chain: 'Pilot', name: 'Pilot Flying J', city: 'Pomona', state: 'CA', exit: 'I-10 Exit 44', mileMark: 44, dieselPrice: 4.899, defPrice: 3.199, cardDiscount: 0.10, amenities: ['McDonald\'s', 'WiFi', 'Scale'], truckParking: 80, showers: true, scales: true, waitMinutes: 5 },
      { id: 'p2', chain: "Love's", name: "Love's Travel Stop", city: 'Beaumont', state: 'CA', exit: 'I-10 Exit 97', mileMark: 97, dieselPrice: 4.849, defPrice: 3.149, cardDiscount: 0.08, amenities: ['Subway', 'WiFi'], truckParking: 60, showers: true, scales: false, waitMinutes: 0 },
      { id: 'p3', chain: 'TA', name: 'TA Travel Center', city: 'Banning', state: 'CA', exit: 'I-10 Exit 103', mileMark: 140, dieselPrice: 4.799, defPrice: 3.099, cardDiscount: 0.10, amenities: ['Iron Skillet', 'WiFi', 'Tire Shop'], truckParking: 120, showers: true, scales: true, waitMinutes: 0 },
      { id: 'p4', chain: 'Flying J', name: 'Flying J Travel Center', city: 'Palm Springs', state: 'CA', exit: 'I-10 Exit 117', mileMark: 185, dieselPrice: 4.749, defPrice: 3.049, cardDiscount: 0.08, amenities: ['Denny\'s', 'WiFi'], truckParking: 95, showers: true, scales: true, waitMinutes: 0 },
      { id: 'p5', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Indio', state: 'CA', exit: 'I-10 Exit 139', mileMark: 235, dieselPrice: 4.699, defPrice: 2.999, cardDiscount: 0.10, amenities: ['Subway', 'Cinnabon', 'WiFi'], truckParking: 110, showers: true, scales: true, waitMinutes: 5 },
      { id: 'p6', chain: "Love's", name: "Love's Travel Stop", city: 'Blythe', state: 'CA', exit: 'I-10 Exit 1', mileMark: 278, dieselPrice: 3.899, defPrice: 2.649, cardDiscount: 0.08, amenities: ['Hardee\'s', 'WiFi'], truckParking: 75, showers: true, scales: false, waitMinutes: 0 },
      { id: 'p7', chain: 'TA', name: 'Petro Stopping Center', city: 'Quartzsite', state: 'AZ', exit: 'I-10 Exit 17', mileMark: 324, dieselPrice: 3.849, defPrice: 2.599, cardDiscount: 0.10, amenities: ['Iron Skillet', 'WiFi', 'CAT Scale'], truckParking: 180, showers: true, scales: true, waitMinutes: 10 },
      { id: 'p8', chain: 'Pilot', name: 'Pilot Flying J', city: 'Goodyear', state: 'AZ', exit: 'I-10 Exit 128', mileMark: 370, dieselPrice: 3.799, defPrice: 2.549, cardDiscount: 0.10, amenities: ['Subway', 'Starbucks', 'WiFi', 'Tire Shop'], truckParking: 150, showers: true, scales: true, waitMinutes: 0 },
    ],
  },
  {
    id: 'atl-mia',
    label: 'Atlanta → Miami',
    origin: 'Atlanta, GA',
    destination: 'Miami, FL',
    totalMiles: 660,
    highway: 'I-75 South / Florida Turnpike',
    stops: [
      { id: 'a1', chain: "Love's", name: "Love's Travel Stop", city: 'Macon', state: 'GA', exit: 'I-75 Exit 157', mileMark: 55, dieselPrice: 3.559, defPrice: 2.399, cardDiscount: 0.05, amenities: ['Hardee\'s', 'WiFi'], truckParking: 90, showers: true, scales: false, waitMinutes: 0 },
      { id: 'a2', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Valdosta', state: 'GA', exit: 'I-75 Exit 22', mileMark: 122, dieselPrice: 3.529, defPrice: 2.369, cardDiscount: 0.06, amenities: ['Subway', 'Wendy\'s', 'WiFi', 'CAT Scale'], truckParking: 130, showers: true, scales: true, waitMinutes: 0 },
      { id: 'a3', chain: 'Flying J', name: 'Flying J Travel Center', city: 'Lake City', state: 'FL', exit: 'I-75 Exit 427', mileMark: 180, dieselPrice: 3.499, defPrice: 2.349, cardDiscount: 0.06, amenities: ['Denny\'s', 'WiFi', 'Truck Wash'], truckParking: 165, showers: true, scales: true, waitMinutes: 5 },
      { id: 'a4', chain: 'TA', name: 'TA Travel Center', city: 'Gainesville', state: 'FL', exit: 'I-75 Exit 387', mileMark: 235, dieselPrice: 3.519, defPrice: 2.369, cardDiscount: 0.08, amenities: ['Iron Skillet', 'WiFi', 'Gym'], truckParking: 140, showers: true, scales: true, waitMinutes: 5 },
      { id: 'a5', chain: 'Pilot', name: 'Pilot Flying J', city: 'Ocala', state: 'FL', exit: 'I-75 Exit 354', mileMark: 295, dieselPrice: 3.509, defPrice: 2.359, cardDiscount: 0.06, amenities: ['Subway', 'Cinnabon', 'WiFi'], truckParking: 110, showers: true, scales: true, waitMinutes: 0 },
      { id: 'a6', chain: "Love's", name: "Love's Travel Stop", city: 'Tampa', state: 'FL', exit: 'I-75 Exit 261', mileMark: 352, dieselPrice: 3.549, defPrice: 2.399, cardDiscount: 0.05, amenities: ['McDonald\'s', 'WiFi', 'Laundry'], truckParking: 85, showers: true, scales: false, waitMinutes: 10 },
      { id: 'a7', chain: 'Flying J', name: 'Pilot Flying J', city: 'Sarasota', state: 'FL', exit: 'I-75 Exit 210', mileMark: 422, dieselPrice: 3.579, defPrice: 2.429, cardDiscount: 0.06, amenities: ['Denny\'s', 'WiFi'], truckParking: 95, showers: true, scales: false, waitMinutes: 0 },
      { id: 'a8', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Fort Myers', state: 'FL', exit: 'I-75 Exit 138', mileMark: 495, dieselPrice: 3.599, defPrice: 2.449, cardDiscount: 0.06, amenities: ['Subway', 'WiFi', 'CAT Scale'], truckParking: 120, showers: true, scales: true, waitMinutes: 0 },
      { id: 'a9', chain: 'TA', name: 'TA Express', city: 'Naples', state: 'FL', exit: 'I-75 Exit 101', mileMark: 555, dieselPrice: 3.619, defPrice: 2.469, cardDiscount: 0.08, amenities: ['Burger King', 'WiFi'], truckParking: 65, showers: false, scales: false, waitMinutes: 0 },
      { id: 'a10', chain: 'Flying J', name: 'Flying J Travel Center', city: 'Homestead', state: 'FL', exit: 'FL-821 Exit 2', mileMark: 622, dieselPrice: 3.649, defPrice: 2.499, cardDiscount: 0.06, amenities: ['Denny\'s', 'WiFi', 'Tire Shop'], truckParking: 80, showers: true, scales: true, waitMinutes: 5 },
    ],
  },
  {
    id: 'dal-den',
    label: 'Dallas → Denver',
    origin: 'Dallas, TX',
    destination: 'Denver, CO',
    totalMiles: 860,
    highway: 'I-35W / I-25 North',
    stops: [
      { id: 'd1', chain: 'Pilot', name: 'Pilot Flying J', city: 'Fort Worth', state: 'TX', exit: 'I-35W Exit 59', mileMark: 35, dieselPrice: 3.749, defPrice: 2.549, cardDiscount: 0.06, amenities: ['Subway', 'Wendy\'s', 'WiFi', 'Scale'], truckParking: 95, showers: true, scales: true, waitMinutes: 5 },
      { id: 'd2', chain: "Love's", name: "Love's Travel Stop", city: 'Wichita Falls', state: 'TX', exit: 'US-287 Exit 1', mileMark: 122, dieselPrice: 3.719, defPrice: 2.499, cardDiscount: 0.05, amenities: ['Hardee\'s', 'WiFi'], truckParking: 80, showers: true, scales: false, waitMinutes: 0 },
      { id: 'd3', chain: 'TA', name: 'TA Travel Center', city: 'Amarillo', state: 'TX', exit: 'I-40 Exit 76', mileMark: 258, dieselPrice: 3.679, defPrice: 2.469, cardDiscount: 0.08, amenities: ['Iron Skillet', 'WiFi', 'Truck Wash', 'CAT Scale'], truckParking: 220, showers: true, scales: true, waitMinutes: 10 },
      { id: 'd4', chain: 'Pilot', name: 'Pilot Travel Center', city: 'Raton', state: 'NM', exit: 'I-25 Exit 454', mileMark: 380, dieselPrice: 3.699, defPrice: 2.499, cardDiscount: 0.06, amenities: ['Subway', 'WiFi'], truckParking: 70, showers: true, scales: false, waitMinutes: 0 },
      { id: 'd5', chain: 'Flying J', name: 'Flying J Travel Center', city: 'Trinidad', state: 'CO', exit: 'I-25 Exit 14', mileMark: 430, dieselPrice: 3.729, defPrice: 2.529, cardDiscount: 0.06, amenities: ['Denny\'s', 'WiFi', 'Scale'], truckParking: 110, showers: true, scales: true, waitMinutes: 0 },
      { id: 'd6', chain: "Love's", name: "Love's Travel Stop", city: 'Pueblo', state: 'CO', exit: 'I-25 Exit 108', mileMark: 548, dieselPrice: 3.759, defPrice: 2.559, cardDiscount: 0.05, amenities: ['McDonald\'s', 'WiFi', 'Laundry'], truckParking: 100, showers: true, scales: false, waitMinutes: 5 },
      { id: 'd7', chain: 'TA', name: 'Petro Stopping Center', city: 'Colorado Springs', state: 'CO', exit: 'I-25 Exit 149', mileMark: 628, dieselPrice: 3.789, defPrice: 2.589, cardDiscount: 0.08, amenities: ['Iron Skillet', 'WiFi', 'Gym', 'CAT Scale'], truckParking: 190, showers: true, scales: true, waitMinutes: 15 },
      { id: 'd8', chain: 'Pilot', name: 'Pilot Flying J', city: 'Castle Rock', state: 'CO', exit: 'I-25 Exit 184', mileMark: 718, dieselPrice: 3.819, defPrice: 2.619, cardDiscount: 0.06, amenities: ['Subway', 'WiFi', 'Scale'], truckParking: 80, showers: true, scales: true, waitMinutes: 0 },
      { id: 'd9', chain: "Love's", name: "Love's Travel Stop", city: 'Englewood', state: 'CO', exit: 'I-25 Exit 194', mileMark: 808, dieselPrice: 3.849, defPrice: 2.649, cardDiscount: 0.05, amenities: ['Arby\'s', 'WiFi'], truckParking: 55, showers: false, scales: false, waitMinutes: 10 },
    ],
  },
]

// ─── Optimization Engine ──────────────────────────────────────────────────────
interface TruckSettings {
  tankSize: number      // gallons
  mpg: number
  startFuel: number     // gallons
  safetyBuffer: number  // fraction of tank (e.g. 0.15)
}

interface CardSettings {
  pilotFj: boolean
  loves: boolean
  ta: boolean
}

interface OptimizationResult {
  stopId: string
  gallons: number
  totalCost: number
  netCost: number       // after card discount
}

function optimizeStops(
  route: RouteData,
  truck: TruckSettings,
  cards: CardSettings,
): { results: OptimizationResult[]; naiveCost: number; optimizedCost: number; savedGallons: number } {
  const stops = route.stops
  const safeReserve = truck.tankSize * truck.safetyBuffer
  let fuel = truck.startFuel
  let position = 0
  const results: OptimizationResult[] = []

  const hasCard = (chain: Chain): boolean => {
    if (chain === 'Pilot' || chain === 'Flying J') return cards.pilotFj
    if (chain === "Love's") return cards.loves
    if (chain === 'TA' || chain === 'Petro') return cards.ta
    return false
  }

  const netPrice = (stop: FuelStop): number =>
    stop.dieselPrice - (hasCard(stop.chain) ? stop.cardDiscount : 0)

  // Forward pass: determine which stops are reachable + must-stop
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const miles = stop.mileMark - position
    const used = miles / truck.mpg
    fuel -= used

    const remainingRoute = route.totalMiles - stop.mileMark
    const fuelNeeded = remainingRoute / truck.mpg
    const maxFill = truck.tankSize - fuel

    // Find next stops within range
    const rangeLeft = (fuel - safeReserve) * truck.mpg
    const mustStop = fuel <= safeReserve + 5 // critically low
    const upcomingInRange = stops.slice(i + 1).filter(
      s => s.mileMark - stop.mileMark <= rangeLeft
    )

    // Price is attractive if it's cheaper than 70% of upcoming stops
    const upcomingPrices = upcomingInRange.slice(0, 4).map(s => netPrice(s))
    const avgUpcoming = upcomingPrices.length > 0
      ? upcomingPrices.reduce((a, b) => a + b, 0) / upcomingPrices.length
      : Infinity
    const myPrice = netPrice(stop)
    const priceIsGood = myPrice < avgUpcoming - 0.015

    // Check if skipping this stop means we can't reach the next cheap one
    const nextCheaper = upcomingInRange.find(s => netPrice(s) < myPrice - 0.02)
    const canReachCheaper = nextCheaper !== undefined
    const lastStop = i === stops.length - 1

    // Decision
    const shouldStop = mustStop || lastStop || priceIsGood || !canReachCheaper

    if (shouldStop && maxFill > 1) {
      // Fill to full if price is great; fill just enough to reach next cheaper stop if not
      let fillGals: number
      if (priceIsGood || mustStop || lastStop) {
        fillGals = Math.min(maxFill, truck.tankSize - fuel)
      } else {
        // Fill just enough to reach next cheaper stop + buffer
        const milesToNext = nextCheaper
          ? nextCheaper.mileMark - stop.mileMark
          : remainingRoute
        const needed = milesToNext / truck.mpg + safeReserve - fuel
        fillGals = Math.max(0, Math.min(maxFill, needed + 10))
      }

      if (fillGals > 0.5) {
        const gross = fillGals * stop.dieselPrice
        const disc = hasCard(stop.chain) ? fillGals * stop.cardDiscount : 0
        results.push({
          stopId: stop.id,
          gallons: Math.round(fillGals * 10) / 10,
          totalCost: Math.round(gross * 100) / 100,
          netCost: Math.round((gross - disc) * 100) / 100,
        })
        fuel += fillGals
      }
    }

    position = stop.mileMark
  }

  // Naive cost: fill to full at EVERY stop
  const totalGallons = route.totalMiles / truck.mpg
  const avgPrice = stops.reduce((a, s) => a + s.dieselPrice, 0) / stops.length
  const maxPrice = Math.max(...stops.map(s => s.dieselPrice))
  const naiveCost = totalGallons * maxPrice
  const optimizedCost = results.reduce((a, r) => a + r.netCost, 0)
  const savedGallons = results.reduce((a, r) => a + (r.totalCost - r.netCost), 0)

  return { results, naiveCost: Math.round(naiveCost * 100) / 100, optimizedCost: Math.round(optimizedCost * 100) / 100, savedGallons: Math.round(savedGallons * 100) / 100 }
}

// ─── Price Badge ──────────────────────────────────────────────────────────────
function PriceBadge({ price, min, max }: { price: number; min: number; max: number }) {
  const t = (price - min) / (max - min || 0.01)
  const bg = t < 0.33 ? '#F0FFF4' : t < 0.66 ? '#FFFBEB' : '#FFF5F5'
  const color = t < 0.33 ? '#276749' : t < 0.66 ? '#7B4F1A' : '#7B1A1A'
  const border = t < 0.33 ? '#9AE6B4' : t < 0.66 ? '#FBD38D' : '#FED7D7'
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 10, fontSize: 13, fontWeight: 800,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      ${price.toFixed(3)}
    </span>
  )
}

// ─── Route Timeline SVG ────────────────────────────────────────────────────────
function RouteTimeline({
  route,
  optMap,
  selectedStop,
  onSelectStop,
  truck,
}: {
  route: RouteData
  optMap: Map<string, OptimizationResult>
  selectedStop: string | null
  onSelectStop: (id: string) => void
  truck: TruckSettings
}) {
  const W = 880
  const H = 130
  const PAD = 40
  const lineY = 68
  const usable = W - PAD * 2

  const toX = (miles: number) => PAD + (miles / route.totalMiles) * usable

  // Simulate fuel level along route
  const fuelTrack: { x: number; level: number }[] = [{ x: PAD, level: truck.startFuel }]
  let fuel = truck.startFuel
  let pos = 0
  for (const stop of route.stops) {
    const used = (stop.mileMark - pos) / truck.mpg
    fuel = Math.max(0, fuel - used)
    const opt = optMap.get(stop.id)
    if (opt) fuel = Math.min(truck.tankSize, fuel + opt.gallons)
    fuelTrack.push({ x: toX(stop.mileMark), level: fuel })
    pos = stop.mileMark
  }

  const minPx = Math.min(...route.stops.map(s => s.dieselPrice))
  const maxPx = Math.max(...route.stops.map(s => s.dieselPrice))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      {/* Road */}
      <rect x={PAD - 10} y={lineY - 4} width={usable + 20} height={8} rx="4" fill="#E2E8F0" />
      <rect x={PAD - 10} y={lineY - 1} width={usable + 20} height={2} fill="#CBD5E0" strokeDasharray="8 6" />

      {/* Origin/Dest labels */}
      <text x={PAD - 12} y={lineY - 12} textAnchor="middle" fontSize="9" fill="#4BAED4" fontWeight="700" fontFamily="sans-serif">START</text>
      <text x={W - PAD + 12} y={lineY - 12} textAnchor="middle" fontSize="9" fill="#38C770" fontWeight="700" fontFamily="sans-serif">END</text>
      <circle cx={PAD} cy={lineY} r="6" fill="#4BAED4" />
      <circle cx={W - PAD} cy={lineY} r="6" fill="#38C770" />

      {/* Mile markers every ~100 miles */}
      {[100, 200, 300, 400, 500, 600, 700, 800].filter(m => m < route.totalMiles).map(m => (
        <g key={m}>
          <line x1={toX(m)} y1={lineY + 4} x2={toX(m)} y2={lineY + 10} stroke="#CBD5E0" strokeWidth="1" />
          <text x={toX(m)} y={lineY + 18} textAnchor="middle" fontSize="7.5" fill="#A0AEC0" fontFamily="sans-serif">{m}mi</text>
        </g>
      ))}

      {/* Fuel stops */}
      {route.stops.map(stop => {
        const x = toX(stop.mileMark)
        const isOpt = optMap.has(stop.id)
        const isSel = selectedStop === stop.id
        const t = (stop.dieselPrice - minPx) / (maxPx - minPx || 0.01)
        const dotColor = t < 0.33 ? '#38C770' : t < 0.66 ? '#F6AD55' : '#FC8181'

        return (
          <g key={stop.id} style={{ cursor: 'pointer' }} onClick={() => onSelectStop(stop.id)}>
            {/* Stem */}
            <line x1={x} y1={lineY - 4} x2={x} y2={isOpt ? lineY - 32 : lineY - 20}
              stroke={isOpt ? '#4BAED4' : '#CBD5E0'} strokeWidth={isOpt ? 1.5 : 1} />
            {/* Dot */}
            <circle cx={x} cy={isOpt ? lineY - 38 : lineY - 26} r={isOpt ? 10 : 7}
              fill={isOpt ? '#4BAED4' : dotColor}
              stroke={isSel ? '#1A2535' : isOpt ? '#2D7A9A' : 'rgba(0,0,0,.1)'}
              strokeWidth={isSel ? 2.5 : 1.5} />
            {/* Price */}
            <text x={x} y={(isOpt ? lineY - 38 : lineY - 26) + 3.5}
              textAnchor="middle" fontSize="6" fontWeight="800"
              fill={isOpt ? '#fff' : 'rgba(0,0,0,.7)'} fontFamily="sans-serif">
              {stop.dieselPrice.toFixed(2)}
            </text>
            {/* Optimal fill label */}
            {isOpt && (
              <text x={x} y={lineY - 52} textAnchor="middle" fontSize="7" fill="#2D7A9A" fontWeight="700" fontFamily="sans-serif">
                +{optMap.get(stop.id)!.gallons}gal
              </text>
            )}
          </g>
        )
      })}

      {/* Legend */}
      <circle cx={12} cy={H - 10} r={5} fill="#38C770" />
      <text x={20} y={H - 6} fontSize="8" fill="#718096" fontFamily="sans-serif">Cheap</text>
      <circle cx={58} cy={H - 10} r={5} fill="#F6AD55" />
      <text x={66} y={H - 6} fontSize="8" fill="#718096" fontFamily="sans-serif">Mid</text>
      <circle cx={96} cy={H - 10} r={5} fill="#FC8181" />
      <text x={104} y={H - 6} fontSize="8" fill="#718096" fontFamily="sans-serif">Expensive</text>
      <circle cx={152} cy={H - 10} r={7} fill="#4BAED4" />
      <text x={162} y={H - 6} fontSize="8" fill="#4BAED4" fontWeight="700" fontFamily="sans-serif">Optimal stop</text>
    </svg>
  )
}

// ─── Fuel Stop Card ───────────────────────────────────────────────────────────
function StopCard({
  stop, opt, isSelected, hasCard, netPrice, minPrice, maxPrice, onClick,
}: {
  stop: FuelStop
  opt: OptimizationResult | undefined
  isSelected: boolean
  hasCard: boolean
  netPrice: number
  minPrice: number
  maxPrice: number
  onClick: () => void
}) {
  const c = CHAIN_COLORS[stop.chain]
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${isSelected ? '#4BAED4' : opt ? '#BEE3F8' : '#E2E8F0'}`,
        borderRadius: 12,
        padding: '12px 14px',
        background: isSelected ? '#EBF8FF' : opt ? '#F7FCFF' : '#fff',
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'border-color .15s, background .15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        {/* Left: chain + location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
              background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            }}>
              {CHAIN_LOGO[stop.chain]} {stop.chain}
            </span>
            {opt && (
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                background: '#4BAED4', color: '#fff',
              }}>
                ⛽ Optimal
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#2D3748', fontWeight: 600 }}>{stop.name}</div>
          <div style={{ fontSize: 11, color: '#718096' }}>{stop.city}, {stop.state} · {stop.exit} · mi {stop.mileMark}</div>
        </div>

        {/* Right: price */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <PriceBadge price={stop.dieselPrice} min={minPrice} max={maxPrice} />
          {hasCard && (
            <div style={{ fontSize: 11, color: '#276749', marginTop: 2, fontWeight: 600 }}>
              Net: ${netPrice.toFixed(3)}/gal
            </div>
          )}
          {opt && (
            <div style={{ fontSize: 11, color: '#2D7A9A', marginTop: 4, fontWeight: 700 }}>
              Fill {opt.gallons} gal
            </div>
          )}
          {opt && (
            <div style={{ fontSize: 10, color: '#4A90A4' }}>
              ${opt.netCost.toFixed(2)} total
            </div>
          )}
        </div>
      </div>

      {/* Amenities + stats row */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#718096' }}>🅿️ {stop.truckParking}</span>
        {stop.showers && <span style={{ fontSize: 10, color: '#718096' }}>🚿 Showers</span>}
        {stop.scales && <span style={{ fontSize: 10, color: '#718096' }}>⚖️ CAT Scale</span>}
        {stop.waitMinutes > 0 && <span style={{ fontSize: 10, color: '#F6AD55' }}>⏱ {stop.waitMinutes}min wait</span>}
        {stop.amenities.slice(0, 2).map(a => (
          <span key={a} style={{
            fontSize: 10, padding: '1px 6px',
            background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8,
            color: '#718096',
          }}>{a}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FuelOptimizerPage({ role: _role }: { role: UserRole }) {
  const [routeId, setRouteId] = useState('chi-dal')
  const [selectedStop, setSelectedStop] = useState<string | null>(null)
  const [filterOptimal, setFilterOptimal] = useState(false)

  // Truck settings
  const [tankSize, setTankSize] = useState(150)
  const [mpg, setMpg] = useState(6.5)
  const [startFuel, setStartFuel] = useState(80)
  const [safetyBuf, setSafetyBuf] = useState(0.15)

  // Card settings
  const [hasPilot, setHasPilot] = useState(true)
  const [hasLoves, setHasLoves] = useState(false)
  const [hasTA, setHasTA] = useState(true)

  const route = ROUTES.find(r => r.id === routeId)!

  const truck: TruckSettings = { tankSize, mpg, startFuel, safetyBuffer: safetyBuf }
  const cards: CardSettings = { pilotFj: hasPilot, loves: hasLoves, ta: hasTA }

  const { results, naiveCost, optimizedCost, savedGallons } = useMemo(
    () => optimizeStops(route, truck, cards),
    [route, truck.tankSize, truck.mpg, truck.startFuel, truck.safetyBuffer, cards.pilotFj, cards.loves, cards.ta]
  )

  const optMap = useMemo(() => {
    const m = new Map<string, OptimizationResult>()
    results.forEach(r => m.set(r.stopId, r))
    return m
  }, [results])

  const minPrice = Math.min(...route.stops.map(s => s.dieselPrice))
  const maxPrice = Math.max(...route.stops.map(s => s.dieselPrice))
  const totalGallons = route.totalMiles / mpg
  const savings = naiveCost - optimizedCost
  const cardSavings = savedGallons
  const totalSaved = savings

  const hasCard = (chain: Chain): boolean => {
    if (chain === 'Pilot' || chain === 'Flying J') return hasPilot
    if (chain === "Love's") return hasLoves
    if (chain === 'TA' || chain === 'Petro') return hasTA
    return false
  }
  const netP = (stop: FuelStop) => stop.dieselPrice - (hasCard(stop.chain) ? stop.cardDiscount : 0)

  const displayedStops = filterOptimal
    ? route.stops.filter(s => optMap.has(s.id))
    : route.stops

  const selectedStopData = route.stops.find(s => s.id === selectedStop)

  return (
    <div style={{ display: 'flex', height: '100%', background: '#F7FAFC', overflow: 'hidden' }}>

      {/* ── Left Settings Panel ── */}
      <div style={{
        width: 260, flexShrink: 0, borderRight: '1px solid #E2E8F0',
        background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1A2535', marginBottom: 2 }}>
            ⛽ Fuel Optimizer
          </div>
          <div style={{ fontSize: 11, color: '#718096' }}>Pick cheapest stops by route</div>
        </div>

        {/* Route selector */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 8, textTransform: 'uppercase', letterSpacing: .5 }}>
            Route
          </div>
          {ROUTES.map(r => (
            <button key={r.id} onClick={() => { setRouteId(r.id); setSelectedStop(null) }} style={{
              width: '100%', textAlign: 'left', padding: '9px 11px', borderRadius: 8, marginBottom: 4,
              background: routeId === r.id ? '#EBF8FF' : '#F7FAFC',
              border: `1px solid ${routeId === r.id ? '#4BAED4' : '#E2E8F0'}`,
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 12, fontWeight: routeId === r.id ? 700 : 400, color: routeId === r.id ? '#2D7A9A' : '#2D3748' }}>
                {r.label}
              </div>
              <div style={{ fontSize: 10, color: '#718096' }}>{r.totalMiles} mi · {r.highway}</div>
            </button>
          ))}
        </div>

        {/* Truck settings */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>
            🚛 Truck Settings
          </div>
          {[
            { label: 'Tank Size (gal)', value: tankSize, set: setTankSize, min: 50, max: 300, step: 10 },
            { label: 'Fuel Economy (MPG)', value: mpg, set: setMpg, min: 4, max: 12, step: 0.5 },
            { label: 'Current Fuel (gal)', value: startFuel, set: setStartFuel, min: 0, max: tankSize, step: 5 },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#4A5568' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{item.value}</span>
              </div>
              <input type="range" min={item.min} max={item.max} step={item.step} value={item.value}
                onChange={e => item.set(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4BAED4' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#A0AEC0' }}>
                <span>{item.min}</span><span>{item.max}</span>
              </div>
            </div>
          ))}
          {/* Safety buffer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#4A5568' }}>Safety Reserve</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2D3748' }}>{Math.round(safetyBuf * 100)}%</span>
            </div>
            <input type="range" min={0.05} max={0.30} step={0.05} value={safetyBuf}
              onChange={e => setSafetyBuf(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#4BAED4' }} />
            <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 2 }}>
              Keep ≥ {Math.round(safetyBuf * tankSize)}gal in tank at all times
            </div>
          </div>
        </div>

        {/* Fleet card settings */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>
            💳 Fleet Cards
          </div>
          {[
            { label: 'Pilot / Flying J', sub: 'myRewards+, Comdata', val: hasPilot, set: setHasPilot, discount: '¢6–10/gal', color: '#2D7A9A' },
            { label: "Love's", sub: 'Love\'s Connect, WEX', val: hasLoves, set: setHasLoves, discount: '¢5–8/gal', color: '#7B1A1A' },
            { label: 'TA / Petro', sub: 'UltraONE, WEX', val: hasTA, set: setHasTA, discount: '¢8–10/gal', color: '#1A6B40' },
          ].map(item => (
            <label key={item.label} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer',
              padding: '8px 10px', borderRadius: 8,
              background: item.val ? '#F7FAFC' : 'transparent',
              border: `1px solid ${item.val ? '#E2E8F0' : 'transparent'}`,
            }}>
              <input type="checkbox" checked={item.val} onChange={e => item.set(e.target.checked)}
                style={{ marginTop: 2, width: 14, height: 14, accentColor: '#4BAED4' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
                <div style={{ fontSize: 10, color: '#718096' }}>{item.sub}</div>
                <div style={{ fontSize: 10, color: '#38A169', fontWeight: 600 }}>Save {item.discount}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 10, textTransform: 'uppercase', letterSpacing: .5 }}>
            Trip Estimate
          </div>
          {[
            { label: 'Trip Distance', value: `${route.totalMiles} miles` },
            { label: 'Est. Fuel Needed', value: `${totalGallons.toFixed(0)} gal` },
            { label: 'Range from Current', value: `${(startFuel * mpg).toFixed(0)} mi` },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#718096' }}>{item.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#2D3748' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Savings banner */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid #E2E8F0', background: '#fff',
        }}>
          {[
            { icon: '⛽', label: 'Optimal Stops', value: String(results.length), sub: `of ${route.stops.length} on route`, color: '#2D7A9A', bg: '#EBF8FF' },
            { icon: '💰', label: 'Optimized Cost', value: `$${optimizedCost.toFixed(2)}`, sub: 'with your fleet cards', color: '#276749', bg: '#F0FFF4' },
            { icon: '🏷️', label: 'You Save', value: `$${Math.max(0, totalSaved).toFixed(2)}`, sub: 'vs worst-price fill-ups', color: '#7B4F1A', bg: '#FFFBEB' },
            { icon: '💳', label: 'Card Savings', value: `$${cardSavings.toFixed(2)}`, sub: 'fleet card discount total', color: '#6B46C1', bg: '#FAF5FF' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '12px 16px', background: stat.bg,
              borderRight: '1px solid rgba(0,0,0,.06)',
            }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: stat.color }}>{stat.label}</div>
              <div style={{ fontSize: 10, color: '#718096', marginTop: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Route timeline */}
        <div style={{
          padding: '12px 20px 8px', background: '#fff',
          borderBottom: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2535' }}>
              📍 {route.origin} → {route.destination}
              <span style={{ fontSize: 11, fontWeight: 400, color: '#718096', marginLeft: 8 }}>
                {route.totalMiles} mi via {route.highway}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#718096' }}>
                Price range: ${minPrice.toFixed(3)} – ${maxPrice.toFixed(3)}/gal
              </span>
            </div>
          </div>
          <RouteTimeline
            route={route}
            optMap={optMap}
            selectedStop={selectedStop}
            onSelectStop={(id) => setSelectedStop(id === selectedStop ? null : id)}
            truck={truck}
          />
        </div>

        {/* Stop list */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* List header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 20px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>
              Fuel Stops ({displayedStops.length})
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#4A5568' }}>
                <input type="checkbox" checked={filterOptimal} onChange={e => setFilterOptimal(e.target.checked)}
                  style={{ accentColor: '#4BAED4' }} />
                Show optimal only
              </label>
              <div style={{ fontSize: 11, color: '#718096' }}>
                Sort: mile order
              </div>
            </div>
          </div>

          {/* Two-column layout: list + detail */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            {/* Stop cards */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {displayedStops.map(stop => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  opt={optMap.get(stop.id)}
                  isSelected={selectedStop === stop.id}
                  hasCard={hasCard(stop.chain)}
                  netPrice={netP(stop)}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onClick={() => setSelectedStop(stop.id === selectedStop ? null : stop.id)}
                />
              ))}
            </div>

            {/* Stop detail sidebar */}
            {selectedStopData && (
              <div style={{
                width: 280, flexShrink: 0, borderLeft: '1px solid #E2E8F0',
                background: '#fff', overflowY: 'auto', padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>Stop Details</div>
                  <button onClick={() => setSelectedStop(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#718096',
                  }}>✕</button>
                </div>

                {/* Chain badge */}
                <div style={{
                  padding: '10px 12px', borderRadius: 10, marginBottom: 12,
                  background: CHAIN_COLORS[selectedStopData.chain].bg,
                  border: `1px solid ${CHAIN_COLORS[selectedStopData.chain].border}`,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: CHAIN_COLORS[selectedStopData.chain].text }}>
                    {CHAIN_LOGO[selectedStopData.chain]} {selectedStopData.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
                    {selectedStopData.city}, {selectedStopData.state}
                  </div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{selectedStopData.exit} · Mile {selectedStopData.mileMark}</div>
                </div>

                {/* Prices */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 8 }}>Fuel Prices</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>🚛 Diesel</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2535' }}>${selectedStopData.dieselPrice.toFixed(3)}</div>
                    </div>
                    <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>🧪 DEF</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#2D7A9A' }}>${selectedStopData.defPrice.toFixed(3)}</div>
                    </div>
                  </div>
                  {hasCard(selectedStopData.chain) && (
                    <div style={{
                      marginTop: 8, padding: '8px 10px',
                      background: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: 8,
                      display: 'flex', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 12, color: '#276749', fontWeight: 600 }}>💳 Net (with card)</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#276749' }}>
                        ${netP(selectedStopData).toFixed(3)}/gal
                      </span>
                    </div>
                  )}
                  {hasCard(selectedStopData.chain) && (
                    <div style={{ fontSize: 11, color: '#38A169', marginTop: 4, textAlign: 'center' }}>
                      Save ${selectedStopData.cardDiscount.toFixed(2)}/gal with {selectedStopData.chain} card
                    </div>
                  )}
                </div>

                {/* Optimal recommendation */}
                {optMap.has(selectedStopData.id) && (
                  <div style={{
                    padding: '10px 12px', background: '#EBF8FF',
                    border: '1px solid #4BAED4', borderRadius: 10, marginBottom: 14,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2D7A9A', marginBottom: 4 }}>
                      ⛽ AI Recommendation
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1A4F72' }}>
                      Fill {optMap.get(selectedStopData.id)!.gallons} gallons
                    </div>
                    <div style={{ fontSize: 11, color: '#4A90A4', marginTop: 2 }}>
                      Cost: ${optMap.get(selectedStopData.id)!.netCost.toFixed(2)}
                      {hasCard(selectedStopData.chain) && ' (after card discount)'}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 8 }}>Facilities</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { icon: '🅿️', label: `${selectedStopData.truckParking} spaces`, ok: true },
                      { icon: '🚿', label: 'Showers', ok: selectedStopData.showers },
                      { icon: '⚖️', label: 'CAT Scale', ok: selectedStopData.scales },
                      { icon: '⏱', label: selectedStopData.waitMinutes > 0 ? `${selectedStopData.waitMinutes}min wait` : 'No wait', ok: selectedStopData.waitMinutes === 0 },
                    ].map(f => (
                      <div key={f.label} style={{
                        padding: '6px 8px', borderRadius: 6,
                        background: f.ok ? '#F0FFF4' : '#FFF5F5',
                        border: `1px solid ${f.ok ? '#9AE6B4' : '#FED7D7'}`,
                        fontSize: 11, color: f.ok ? '#276749' : '#7B1A1A',
                      }}>
                        {f.icon} {f.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>Food & Services</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {selectedStopData.amenities.map(a => (
                      <span key={a} style={{
                        padding: '3px 8px', background: '#F7FAFC',
                        border: '1px solid #E2E8F0', borderRadius: 12,
                        fontSize: 11, color: '#4A5568',
                      }}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
