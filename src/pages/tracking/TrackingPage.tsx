import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActiveLoad {
  id: string
  from: string
  to: string
  driver: string
  truck: string
  broker: string
  status: 'Picking Up' | 'In Transit' | 'Delivered' | 'Delayed'
  eta: string
  etaDate: string
  progress: number
  miles: number
  milesLeft: number
  currentCity: string
  rate: string
  hosRemaining: number      // hours of service remaining
  speed: number             // mph
  rpm: number
  engineTemp: number        // °F
  fuelLevel: number         // %
  lastPing: string
  delayAlert?: string
  weatherAlert?: string
}

interface CheckIn {
  id: number
  time: string
  city: string
  state: string
  event: string
  type: 'pickup' | 'dropoff' | 'checkin' | 'fuel' | 'rest' | 'delay'
  note?: string
}

interface MapDot {
  x: number
  y: number
  label: string
  type: 'origin' | 'current' | 'destination' | 'waypoint'
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const ACTIVE_LOADS: ActiveLoad[] = [
  {
    id: 'LD-4821',
    from: 'Chicago, IL',
    to: 'Dallas, TX',
    driver: 'Mike Rodriguez',
    truck: 'Peterbilt 579 · IL-MTR-2291',
    broker: 'Echo Global Logistics',
    status: 'In Transit',
    eta: '2h 40min',
    etaDate: 'Today, 4:45 PM',
    progress: 68,
    miles: 917,
    milesLeft: 293,
    currentCity: 'Springfield, MO',
    rate: '$2,180',
    hosRemaining: 5.5,
    speed: 63,
    rpm: 1480,
    engineTemp: 195,
    fuelLevel: 54,
    lastPing: '2 min ago',
  },
  {
    id: 'LD-4819',
    from: 'Miami, FL',
    to: 'Atlanta, GA',
    driver: 'Anna Perez',
    truck: 'Kenworth T680 · FL-KW-8843',
    broker: 'Coyote Logistics',
    status: 'Picking Up',
    eta: '5h 20min',
    etaDate: 'Today, 7:20 PM',
    progress: 12,
    miles: 662,
    milesLeft: 583,
    currentCity: 'Fort Lauderdale, FL',
    rate: '$1,540',
    hosRemaining: 9.0,
    speed: 0,
    rpm: 0,
    engineTemp: 82,
    fuelLevel: 88,
    lastPing: '5 min ago',
  },
  {
    id: 'LD-4823',
    from: 'Houston, TX',
    to: 'Kansas City, MO',
    driver: 'Carlos Vega',
    truck: 'Freightliner Cascadia · TX-FLC-7734',
    broker: 'TQL',
    status: 'Delayed',
    eta: '+1h 15min',
    etaDate: 'Today, 6:00 PM',
    progress: 44,
    miles: 744,
    milesLeft: 417,
    currentCity: 'Oklahoma City, OK',
    rate: '$1,920',
    hosRemaining: 3.2,
    speed: 0,
    rpm: 800,
    engineTemp: 201,
    fuelLevel: 31,
    lastPing: '8 min ago',
    delayAlert: 'Heavy traffic on I-35 N · Est. +75 min delay',
    weatherAlert: 'Thunderstorm advisory: I-35 through OKC',
  },
  {
    id: 'LD-4820',
    from: 'Seattle, WA',
    to: 'Portland, OR',
    driver: 'Linda Kim',
    truck: 'Volvo VNL · WA-VNL-4412',
    broker: 'Landstar',
    status: 'In Transit',
    eta: '55min',
    etaDate: 'Today, 3:10 PM',
    progress: 81,
    miles: 174,
    milesLeft: 33,
    currentCity: 'Olympia, WA',
    rate: '$680',
    hosRemaining: 7.8,
    speed: 58,
    rpm: 1350,
    engineTemp: 189,
    fuelLevel: 72,
    lastPing: '1 min ago',
  },
  {
    id: 'LD-4818',
    from: 'Nashville, TN',
    to: 'Charlotte, NC',
    driver: 'Brian Scott',
    truck: 'Peterbilt 389 · TN-PTB-9910',
    broker: 'XPO Logistics',
    status: 'In Transit',
    eta: '1h 50min',
    etaDate: 'Today, 5:00 PM',
    progress: 57,
    miles: 409,
    milesLeft: 176,
    currentCity: 'Asheville, NC',
    rate: '$1,150',
    hosRemaining: 6.1,
    speed: 61,
    rpm: 1410,
    engineTemp: 192,
    fuelLevel: 45,
    lastPing: '3 min ago',
  },
  {
    id: 'LD-4815',
    from: 'Los Angeles, CA',
    to: 'Phoenix, AZ',
    driver: 'James Carter',
    truck: 'Freightliner Cascadia · CA-FLC-5511',
    broker: 'TQL',
    status: 'Delivered',
    eta: '—',
    etaDate: 'Delivered May 10, 2:12 PM',
    progress: 100,
    miles: 372,
    milesLeft: 0,
    currentCity: 'Phoenix, AZ',
    rate: '$890',
    hosRemaining: 11,
    speed: 0,
    rpm: 0,
    engineTemp: 75,
    fuelLevel: 62,
    lastPing: '2 hrs ago',
  },
]

const CHECK_INS_BY_LOAD: Record<string, CheckIn[]> = {
  'LD-4821': [
    { id: 1, time: '6:30 AM', city: 'Chicago', state: 'IL', event: 'Picked up load at shipper', type: 'pickup' },
    { id: 2, time: '9:15 AM', city: 'Joliet', state: 'IL', event: 'Check-in: all good, on schedule', type: 'checkin' },
    { id: 3, time: '11:40 AM', city: 'St. Louis', state: 'MO', event: 'Fuel stop — 150 gal diesel', type: 'fuel', note: '$0.549/mi current IFTA rate' },
    { id: 4, time: '1:20 PM', city: 'Springfield', state: 'MO', event: '30-min mandatory rest break', type: 'rest' },
    { id: 5, time: '2:05 PM', city: 'Springfield', state: 'MO', event: 'Back on road — ETA 4:45 PM Dallas', type: 'checkin' },
  ],
  'LD-4819': [
    { id: 1, time: '12:00 PM', city: 'Miami', state: 'FL', event: 'Dispatched to shipper', type: 'checkin' },
    { id: 2, time: '1:45 PM', city: 'Fort Lauderdale', state: 'FL', event: 'Arrived at shipper — loading in progress', type: 'pickup' },
  ],
  'LD-4823': [
    { id: 1, time: '7:00 AM', city: 'Houston', state: 'TX', event: 'Picked up load at terminal', type: 'pickup' },
    { id: 2, time: '10:30 AM', city: 'Dallas', state: 'TX', event: 'Check-in: on schedule, clear skies', type: 'checkin' },
    { id: 3, time: '12:15 PM', city: 'Oklahoma City', state: 'OK', event: '⚠️ Traffic delay — I-35 northbound backup', type: 'delay', note: 'Est. 75 min delay. Notified broker TQL.' },
    { id: 4, time: '1:00 PM', city: 'Oklahoma City', state: 'OK', event: 'Fuel stop + driver waiting out traffic', type: 'fuel' },
  ],
  'LD-4820': [
    { id: 1, time: '10:00 AM', city: 'Seattle', state: 'WA', event: 'Load picked up at SeaTac warehouse', type: 'pickup' },
    { id: 2, time: '11:20 AM', city: 'Tacoma', state: 'WA', event: 'Check-in: I-5 S clear, making good time', type: 'checkin' },
    { id: 3, time: '2:00 PM', city: 'Olympia', state: 'WA', event: 'Check-in: 33 miles to destination', type: 'checkin' },
  ],
  'LD-4818': [
    { id: 1, time: '8:30 AM', city: 'Nashville', state: 'TN', event: 'Departed shipper facility', type: 'pickup' },
    { id: 2, time: '11:00 AM', city: 'Knoxville', state: 'TN', event: 'Check-in: good progress on I-40', type: 'checkin' },
    { id: 3, time: '12:30 PM', city: 'Asheville', state: 'NC', event: 'Quick fuel stop, continuing east', type: 'fuel' },
  ],
  'LD-4815': [
    { id: 1, time: '7:00 AM', city: 'Los Angeles', state: 'CA', event: 'Picked up load', type: 'pickup' },
    { id: 2, time: '9:30 AM', city: 'San Bernardino', state: 'CA', event: 'Check-in: highway 10 eastbound, clear', type: 'checkin' },
    { id: 3, time: '11:45 AM', city: 'Blythe', state: 'CA', event: 'State line check — CA→AZ', type: 'checkin' },
    { id: 4, time: '2:12 PM', city: 'Phoenix', state: 'AZ', event: 'Load delivered — POD signed ✓', type: 'dropoff' },
  ],
}

const MAP_ROUTES: Record<string, MapDot[]> = {
  'LD-4821': [
    { x: 62, y: 28, label: 'Chicago, IL',   type: 'origin' },
    { x: 54, y: 33, label: 'St. Louis, MO', type: 'waypoint' },
    { x: 49, y: 38, label: 'Springfield, MO', type: 'current' },
    { x: 45, y: 55, label: 'Dallas, TX',    type: 'destination' },
  ],
  'LD-4819': [
    { x: 72, y: 72, label: 'Miami, FL',         type: 'origin' },
    { x: 71, y: 68, label: 'Fort Lauderdale, FL', type: 'current' },
    { x: 66, y: 55, label: 'Atlanta, GA',       type: 'destination' },
  ],
  'LD-4823': [
    { x: 40, y: 60, label: 'Houston, TX',       type: 'origin' },
    { x: 40, y: 47, label: 'Oklahoma City, OK', type: 'current' },
    { x: 45, y: 36, label: 'Kansas City, MO',   type: 'destination' },
  ],
  'LD-4820': [
    { x: 7,  y: 8,  label: 'Seattle, WA',  type: 'origin' },
    { x: 7,  y: 12, label: 'Olympia, WA',  type: 'current' },
    { x: 5,  y: 18, label: 'Portland, OR', type: 'destination' },
  ],
  'LD-4818': [
    { x: 63, y: 44, label: 'Nashville, TN',  type: 'origin' },
    { x: 68, y: 46, label: 'Asheville, NC',  type: 'current' },
    { x: 72, y: 46, label: 'Charlotte, NC',  type: 'destination' },
  ],
  'LD-4815': [
    { x: 8,  y: 45, label: 'Los Angeles, CA', type: 'origin' },
    { x: 14, y: 48, label: 'Phoenix, AZ',     type: 'destination' },
  ],
}

const STATE_ABBRS = [
  { label: 'WA', x: 6, y: 8 }, { label: 'OR', x: 5, y: 18 }, { label: 'CA', x: 4, y: 38 },
  { label: 'NV', x: 10, y: 32 }, { label: 'ID', x: 12, y: 17 }, { label: 'MT', x: 18, y: 10 },
  { label: 'WY', x: 20, y: 22 }, { label: 'UT', x: 15, y: 33 }, { label: 'AZ', x: 14, y: 48 },
  { label: 'CO', x: 23, y: 35 }, { label: 'NM', x: 22, y: 50 }, { label: 'TX', x: 33, y: 58 },
  { label: 'ND', x: 35, y: 10 }, { label: 'SD', x: 37, y: 18 }, { label: 'NE', x: 38, y: 27 },
  { label: 'KS', x: 39, y: 36 }, { label: 'OK', x: 40, y: 47 }, { label: 'MN', x: 48, y: 14 },
  { label: 'IA', x: 50, y: 26 }, { label: 'MO', x: 51, y: 35 }, { label: 'AR', x: 52, y: 47 },
  { label: 'LA', x: 52, y: 60 }, { label: 'WI', x: 55, y: 18 }, { label: 'IL', x: 57, y: 28 },
  { label: 'MI', x: 63, y: 18 }, { label: 'IN', x: 61, y: 28 }, { label: 'OH', x: 66, y: 26 },
  { label: 'KY', x: 63, y: 36 }, { label: 'TN', x: 62, y: 44 }, { label: 'MS', x: 58, y: 54 },
  { label: 'AL', x: 63, y: 56 }, { label: 'GA', x: 67, y: 56 }, { label: 'FL', x: 69, y: 68 },
  { label: 'SC', x: 72, y: 48 }, { label: 'NC', x: 71, y: 42 }, { label: 'VA', x: 73, y: 36 },
  { label: 'WV', x: 69, y: 33 }, { label: 'PA', x: 72, y: 26 }, { label: 'NY', x: 77, y: 20 },
  { label: 'VT', x: 81, y: 14 }, { label: 'ME', x: 85, y: 11 }, { label: 'NH', x: 83, y: 16 },
  { label: 'MA', x: 83, y: 22 }, { label: 'CT', x: 82, y: 25 }, { label: 'NJ', x: 79, y: 28 },
  { label: 'DE', x: 78, y: 32 }, { label: 'MD', x: 76, y: 33 },
]

// ── Sub-components ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ActiveLoad['status'] }) {
  const map: Record<ActiveLoad['status'], string> = {
    'Picking Up': 'badge-warning',
    'In Transit': 'badge-primary',
    'Delivered':  'badge-success',
    'Delayed':    'badge-danger',
  }
  return <span className={`badge ${map[status]}`}>● {status}</span>
}

function EventIcon({ type }: { type: CheckIn['type'] }) {
  const map: Record<CheckIn['type'], { icon: string; color: string }> = {
    pickup:  { icon: '📦', color: '#4BAED4' },
    dropoff: { icon: '✅', color: '#38C770' },
    checkin: { icon: '📍', color: '#8B5CF6' },
    fuel:    { icon: '⛽', color: '#F59E0B' },
    rest:    { icon: '🛏️', color: '#A0AEC0' },
    delay:   { icon: '⚠️', color: '#EF4444' },
  }
  const { icon, color } = map[type]
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: color + '20', border: `2px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, flexShrink: 0,
    }}>{icon}</div>
  )
}

// ── Gauge component ────────────────────────────────────────────────────────────
function Gauge({ value, max, label, unit, color }: { value: number; max: number; label: string; unit: string; color: string }) {
  const pct = Math.min(value / max, 1)
  const angle = -135 + pct * 270
  const r = 30
  const cx = 40, cy = 44
  // arc path
  function polarToXY(deg: number) {
    const rad = (deg - 90) * Math.PI / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const start = polarToXY(-135)
  const end   = polarToXY(-135 + pct * 270)
  const large = pct * 270 > 180 ? 1 : 0

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 80 60" style={{ width: 80, height: 60 }}>
        <path
          d={`M ${polarToXY(-135).x} ${polarToXY(-135).y} A ${r} ${r} 0 1 1 ${polarToXY(135).x} ${polarToXY(135).y}`}
          fill="none" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round"
        />
        {pct > 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`}
            fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          />
        )}
        {/* needle */}
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 8) * Math.cos((angle - 90) * Math.PI / 180)}
          y2={cy + (r - 8) * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="#1A2535" strokeWidth="1.5" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill="#1A2535" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>{value}</text>
        <text x={cx} y={cy - 0} textAnchor="middle" fontSize="6" fill="#A0AEC0">{unit}</text>
      </svg>
      <div style={{ fontSize: 10, color: '#718096', marginTop: -4 }}>{label}</div>
    </div>
  )
}

// ── HOS Bar ────────────────────────────────────────────────────────────────────
function HOSBar({ hours }: { hours: number }) {
  const pct = (hours / 11) * 100
  const color = hours < 2 ? '#EF4444' : hours < 4 ? '#F59E0B' : '#38C770'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: '#718096', fontWeight: 600 }}>⏱ HOS Remaining</span>
        <span style={{ fontWeight: 800, color }}>{hours}h</span>
      </div>
      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 3 }}>
        {hours < 2 ? '⚠️ Mandatory rest soon' : hours < 4 ? '⚡ Low — plan rest stop' : 'of 11-hr drive limit'}
      </div>
    </div>
  )
}

// ── USA Map ────────────────────────────────────────────────────────────────────
function USAMap({ loadId, progress }: { loadId: string; progress: number }) {
  const dots = MAP_ROUTES[loadId] ?? []
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 900)
    return () => clearInterval(id)
  }, [])

  const pathPoints = dots.map(d => `${d.x},${d.y}`).join(' ')

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#EBF4F8', borderRadius: 12, overflow: 'hidden' }}>
      <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
        {[10,20,30,40,50,60,70,80,90].map(x => (
          <line key={`vg${x}`} x1={x} y1={0} x2={x} y2={80} stroke="#D4E8F0" strokeWidth="0.2" />
        ))}
        {[10,20,30,40,50,60,70].map(y => (
          <line key={`hg${y}`} x1={0} y1={y} x2={100} y2={y} stroke="#D4E8F0" strokeWidth="0.2" />
        ))}
        {STATE_ABBRS.map(s => (
          <text key={s.label} x={s.x} y={s.y} fontSize="2.2" fill="#B0C8D4" fontFamily="sans-serif" fontWeight="600">{s.label}</text>
        ))}
        {dots.length > 1 && (
          <polyline points={pathPoints} fill="none" stroke="#B0C8D4" strokeWidth="0.6" strokeDasharray="1.5 1" />
        )}
        {dots.length > 1 && progress > 0 && (
          <polyline points={pathPoints} fill="none" stroke="#4BAED4" strokeWidth="0.8" strokeDasharray={`${progress * 0.4} 999`} />
        )}
        {dots.map((d, i) => (
          <g key={i}>
            {d.type === 'origin' && (
              <>
                <circle cx={d.x} cy={d.y} r="1.6" fill="#38C770" stroke="#fff" strokeWidth="0.5" />
                <text x={d.x + 2} y={d.y + 0.8} fontSize="2" fill="#2D3748" fontFamily="sans-serif" fontWeight="700">{d.label}</text>
              </>
            )}
            {d.type === 'destination' && (
              <>
                <polygon points={`${d.x},${d.y - 2.5} ${d.x - 1.5},${d.y} ${d.x + 1.5},${d.y}`} fill="#EF4444" />
                <text x={d.x + 2} y={d.y + 0.8} fontSize="2" fill="#2D3748" fontFamily="sans-serif" fontWeight="700">{d.label}</text>
              </>
            )}
            {d.type === 'waypoint' && (
              <circle cx={d.x} cy={d.y} r="0.8" fill="#A0AEC0" />
            )}
            {d.type === 'current' && (
              <>
                <circle cx={d.x} cy={d.y} r={pulse ? '3.5' : '2.5'} fill="none" stroke="#4BAED4" strokeWidth="0.4" opacity={pulse ? 0.3 : 0.6}
                  style={{ transition: 'r 0.9s ease, opacity 0.9s ease' }} />
                <circle cx={d.x} cy={d.y} r="1.8" fill="#4BAED4" stroke="#fff" strokeWidth="0.6" />
                <text x={d.x - 0.5} y={d.y + 0.6} fontSize="1.8" fill="#fff" textAnchor="middle">🚛</text>
                <text x={d.x + 2.5} y={d.y + 0.8} fontSize="2" fill="#1A2535" fontFamily="sans-serif" fontWeight="700">{d.label}</text>
              </>
            )}
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 12, fontSize: 11, color: '#718096' }}>
        <span>🟢 Origin</span>
        <span>🚛 Current</span>
        <span>🔺 Destination</span>
      </div>
    </div>
  )
}

// ── Share ETA Modal ────────────────────────────────────────────────────────────
function ShareETAModal({ load, onClose }: { load: ActiveLoad; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const link = `https://track.dispaloadiq.com/${load.id}?token=demo`
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div className="card" style={{ width: 440, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>📤 Share Tracking Link</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>Live tracking page for your shipper / customer</div>
          <div style={{ fontWeight: 700, color: '#4BAED4', fontSize: 13, wordBreak: 'break-all' }}>{link}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Load</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{load.id}</div>
          </div>
          <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>ETA</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#38C770' }}>{load.etaDate}</div>
          </div>
          <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Current Location</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{load.currentCity}</div>
          </div>
          <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Progress</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#4BAED4' }}>{load.progress}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const [selectedId, setSelectedId]           = useState(ACTIVE_LOADS[0].id)
  const [detailTab, setDetailTab]             = useState<'overview' | 'map' | 'timeline' | 'telemetry'>('overview')
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showShareModal, setShowShareModal]   = useState(false)
  const [checkInNote, setCheckInNote]         = useState('')
  const [localCheckIns, setLocalCheckIns]     = useState<Record<string, CheckIn[]>>(CHECK_INS_BY_LOAD)

  const selected  = ACTIVE_LOADS.find(l => l.id === selectedId)!
  const checkIns  = localCheckIns[selectedId] ?? []
  const activeCount = ACTIVE_LOADS.filter(l => l.status !== 'Delivered').length
  const delayedCount = ACTIVE_LOADS.filter(l => l.status === 'Delayed').length

  function handleCheckIn() {
    if (!checkInNote.trim()) return
    const now  = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const newCI: CheckIn = {
      id: Date.now(),
      time,
      city: selected.currentCity.split(',')[0],
      state: selected.currentCity.split(',')[1]?.trim() ?? '',
      event: checkInNote,
      type: 'checkin',
    }
    setLocalCheckIns(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), newCI] }))
    setCheckInNote('')
    setShowCheckInModal(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>📡 Live Tracking</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            {activeCount} loads in transit · {delayedCount > 0 ? <span style={{ color: '#EF4444', fontWeight: 600 }}>⚠️ {delayedCount} delayed</span> : 'all on schedule'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowCheckInModal(true)} disabled={selected.status === 'Delivered'}>
            📍 Add Check-in
          </button>
          <button className="btn btn-secondary" onClick={() => setShowShareModal(true)} disabled={selected.status === 'Delivered'}>
            📤 Share ETA
          </button>
          <button className="btn btn-primary">🔔 Set Alert</button>
        </div>
      </div>

      {/* Alerts banner */}
      {ACTIVE_LOADS.filter(l => l.delayAlert || l.weatherAlert).map(l => (
        <div key={l.id} style={{
          background: l.status === 'Delayed' ? '#FFF5F5' : '#FFFBEB',
          border: `1.5px solid ${l.status === 'Delayed' ? '#FED7D7' : '#FEF3C7'}`,
          borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 18 }}>{l.status === 'Delayed' ? '⚠️' : '🌩️'}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{l.id} · {l.driver}</span>
            <span style={{ fontSize: 13, color: '#718096', marginLeft: 8 }}>
              {l.delayAlert ?? l.weatherAlert}
            </span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedId(l.id)}>View →</button>
        </div>
      ))}

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { icon: '🚛', label: 'Active Loads',    value: activeCount,                                       color: '#4BAED4' },
          { icon: '✅', label: 'Delivered Today', value: ACTIVE_LOADS.filter(l => l.status === 'Delivered').length, color: '#38C770' },
          { icon: '⚠️', label: 'Delayed',         value: delayedCount,                                      color: '#EF4444' },
          { icon: '💰', label: 'Revenue Today',   value: '$6,530',                                          color: '#8B5CF6' },
          { icon: '🛣️', label: 'Miles Today',     value: '2,718',                                           color: '#F59E0B' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{k.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 1 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Load selector cards */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {ACTIVE_LOADS.map(load => (
          <div
            key={load.id}
            onClick={() => { setSelectedId(load.id); setDetailTab('overview') }}
            style={{
              cursor: 'pointer', padding: '10px 16px', borderRadius: 12, flex: 1, minWidth: 170,
              border: `2px solid ${selectedId === load.id ? '#4BAED4' : load.status === 'Delayed' ? '#FED7D7' : '#E2E8F0'}`,
              background: selectedId === load.id ? '#EBF8FF' : load.status === 'Delayed' ? '#FFF5F5' : '#fff',
              transition: 'all .2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{load.id}</span>
              <StatusBadge status={load.status} />
            </div>
            <div style={{ fontSize: 12, color: '#4A5568', fontWeight: 600 }}>
              {load.from.split(',')[0]} → {load.to.split(',')[0]}
            </div>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{load.driver}</div>
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${load.progress}%`, height: '100%', background: load.progress === 100 ? '#38C770' : load.status === 'Delayed' ? '#EF4444' : '#4BAED4' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail area */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #E2E8F0', padding: '0 20px', background: '#FAFBFC' }}>
          {(['overview', 'map', 'timeline', 'telemetry'] as const).map(t => (
            <button key={t} onClick={() => setDetailTab(t)} style={{
              padding: '12px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              border: 'none', background: 'none',
              borderBottom: detailTab === t ? '2.5px solid #4BAED4' : '2.5px solid transparent',
              color: detailTab === t ? '#4BAED4' : '#718096',
            }}>
              {t === 'overview' ? '📊 Overview' : t === 'map' ? '🗺️ Map' : t === 'timeline' ? '📋 Timeline' : '⚙️ Telemetry'}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingRight: 8, gap: 6 }}>
            <span style={{ fontSize: 11, color: '#A0AEC0' }}>Last ping: {selected.lastPing}</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.status === 'Delivered' ? '#A0AEC0' : '#38C770', display: 'inline-block' }} />
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {detailTab === 'overview' && (
          <div style={{ padding: 20, display: 'flex', gap: 20 }}>
            {/* Left info */}
            <div style={{ flex: 1 }}>
              {/* Route header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2535' }}>
                    {selected.from} → {selected.to}
                  </div>
                  <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
                    {selected.id} · {selected.truck} · {selected.broker}
                  </div>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A0AEC0', marginBottom: 6 }}>
                  <span>{selected.from}</span>
                  <span style={{ color: '#4BAED4', fontWeight: 700 }}>
                    {selected.milesLeft > 0 ? `${selected.milesLeft} mi remaining` : 'Delivered ✓'}
                  </span>
                  <span>{selected.to}</span>
                </div>
                <div className="progress-wrap" style={{ height: 10, borderRadius: 6 }}>
                  <div className="progress-bar" style={{
                    width: `${selected.progress}%`,
                    background: selected.progress === 100 ? '#38C770'
                      : selected.status === 'Delayed' ? 'linear-gradient(90deg,#EF4444,#F59E0B)'
                      : 'linear-gradient(90deg,#4BAED4,#38C770)',
                    transition: 'width .8s ease', borderRadius: 6,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#718096', marginTop: 4 }}>
                  <span>📍 {selected.currentCity}</span>
                  <span>{selected.progress}% complete · {selected.miles} total mi</span>
                </div>
              </div>

              {/* Delay/Weather alerts */}
              {selected.delayAlert && (
                <div style={{ background: '#FFF5F5', border: '1.5px solid #FED7D7', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                  ⚠️ <strong>Delay:</strong> {selected.delayAlert}
                </div>
              )}
              {selected.weatherAlert && (
                <div style={{ background: '#FFFBEB', border: '1.5px solid #FEF3C7', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                  🌩️ <strong>Weather:</strong> {selected.weatherAlert}
                </div>
              )}

              {/* Key info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Driver',   value: selected.driver,  icon: '👤' },
                  { label: 'Rate',     value: selected.rate,    icon: '💰' },
                  { label: 'ETA',      value: selected.eta || '—', icon: '⏱' },
                  { label: 'Miles Left', value: `${selected.milesLeft} mi`, icon: '🛣️' },
                  { label: 'Broker',   value: selected.broker.split(' ').slice(0,2).join(' '), icon: '🤝' },
                  { label: 'Truck',    value: selected.truck.split('·')[0].trim(), icon: '🚛' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 16, marginBottom: 3 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, color: '#A0AEC0' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: ETA card + HOS */}
            <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: selected.status === 'Delivered'
                  ? 'linear-gradient(135deg,#1A2535,#276749)'
                  : selected.status === 'Delayed'
                  ? 'linear-gradient(135deg,#7B1D1D,#B7791F)'
                  : 'linear-gradient(135deg,#1A2535,#2D7A9A)',
                color: '#fff', borderRadius: 14, padding: '18px 20px',
              }}>
                <div style={{ fontSize: 11, opacity: .7, marginBottom: 4 }}>
                  {selected.status === 'Delivered' ? '✅ DELIVERED' : selected.status === 'Delayed' ? '⚠️ DELAYED' : '⏱ ETA'}
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
                  {selected.status === 'Delivered' ? '✓ Done' : selected.eta}
                </div>
                <div style={{ fontSize: 13, opacity: .85 }}>{selected.etaDate}</div>
                {selected.status !== 'Delivered' && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)', fontSize: 12 }}
                      onClick={() => setShowShareModal(true)}>
                      📤 Share Tracking Link
                    </button>
                    <button className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)', fontSize: 12 }}>
                      📞 Call {selected.driver.split(' ')[0]}
                    </button>
                  </div>
                )}
              </div>

              {/* HOS card */}
              <div className="card" style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#2D3748', marginBottom: 10 }}>🧑‍✈️ Driver Status</div>
                <HOSBar hours={selected.hosRemaining} />
                <div style={{ marginTop: 10, fontSize: 11, color: '#718096' }}>
                  <div>Driver: <strong style={{ color: '#2D3748' }}>{selected.driver}</strong></div>
                  <div style={{ marginTop: 3 }}>Truck: <strong style={{ color: '#2D3748' }}>{selected.truck.split('·')[0].trim()}</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MAP TAB ── */}
        {detailTab === 'map' && (
          <div style={{ padding: 20 }}>
            <div style={{ height: 420 }}>
              <USAMap loadId={selectedId} progress={selected.progress} />
            </div>
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'From',     value: selected.from },
                { label: 'To',       value: selected.to },
                { label: 'Current',  value: selected.currentCity },
                { label: 'Miles Left', value: `${selected.milesLeft} mi` },
              ].map(item => (
                <div key={item.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {detailTab === 'timeline' && (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1A2535' }}>Activity Timeline</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#A0AEC0' }}>{checkIns.length} events</span>
                {selected.status !== 'Delivered' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowCheckInModal(true)}>+ Check-in</button>
                )}
              </div>
            </div>
            <div style={{ maxHeight: 440, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[...checkIns].reverse().map((ci, idx) => (
                <div key={ci.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 16, position: 'relative' }}>
                  {idx < checkIns.length - 1 && (
                    <div style={{ position: 'absolute', left: 15, top: 34, width: 2, bottom: 0, background: '#E2E8F0' }} />
                  )}
                  <EventIcon type={ci.type} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{ci.event}</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{ci.time} · {ci.city}, {ci.state}</div>
                    {ci.note && (
                      <div style={{ fontSize: 11, color: '#718096', marginTop: 4, background: '#F7FAFC', padding: '4px 8px', borderRadius: 6, borderLeft: '3px solid #E2E8F0' }}>
                        {ci.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TELEMETRY TAB ── */}
        {detailTab === 'telemetry' && (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1A2535' }}>⚙️ Live Telemetry</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#718096' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: selected.speed > 0 ? '#38C770' : '#A0AEC0', display: 'inline-block' }} />
                {selected.speed > 0 ? 'Engine Running' : 'Engine Idle/Off'} · {selected.lastPing}
              </div>
            </div>

            {/* Gauges row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
              <Gauge value={selected.speed}      max={80}   label="Speed"       unit="mph" color="#4BAED4" />
              <Gauge value={selected.rpm}        max={2000} label="Engine RPM"  unit="rpm" color="#8B5CF6" />
              <Gauge value={selected.engineTemp} max={250}  label="Engine Temp" unit="°F"  color={selected.engineTemp > 220 ? '#EF4444' : '#F59E0B'} />
              <Gauge value={selected.fuelLevel}  max={100}  label="Fuel Level"  unit="%"   color={selected.fuelLevel < 25 ? '#EF4444' : '#38C770'} />
            </div>

            {/* Telemetry cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {[
                { label: 'Current Speed',    value: `${selected.speed} mph`,     icon: '🏎️', alert: selected.speed > 70 ? 'Speed limit warning' : undefined },
                { label: 'Engine RPM',       value: selected.rpm.toLocaleString(), icon: '⚙️', alert: undefined },
                { label: 'Engine Temp',      value: `${selected.engineTemp}°F`,  icon: '🌡️', alert: selected.engineTemp > 220 ? 'High temp warning' : undefined },
                { label: 'Fuel Level',       value: `${selected.fuelLevel}%`,    icon: '⛽', alert: selected.fuelLevel < 25 ? 'Low fuel — plan stop' : undefined },
                { label: 'HOS Remaining',    value: `${selected.hosRemaining}h`, icon: '⏱', alert: selected.hosRemaining < 2 ? 'Mandatory rest required' : undefined },
                { label: 'Last GPS Ping',    value: selected.lastPing,           icon: '📡', alert: undefined },
              ].map(item => (
                <div key={item.label} style={{
                  background: item.alert ? '#FFF5F5' : '#F7FAFC',
                  border: `1.5px solid ${item.alert ? '#FED7D7' : '#E2E8F0'}`,
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{item.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.alert ? '#EF4444' : '#2D3748', marginTop: 2 }}>{item.value}</div>
                  {item.alert && (
                    <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4, fontWeight: 600 }}>⚠️ {item.alert}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Fuel efficiency */}
            <div style={{ marginTop: 16, background: '#F7FAFC', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#2D3748', marginBottom: 10 }}>⛽ Fuel Efficiency Trend</div>
              <div style={{ display: 'flex', gap: 20 }}>
                {[
                  { label: 'Current MPG', value: '6.8' },
                  { label: 'Trip Avg MPG', value: '7.1' },
                  { label: 'Fuel Used', value: `${Math.round(selected.miles * (1 - selected.milesLeft / selected.miles) / 7)} gal` },
                  { label: 'Fuel Cost Est.', value: `$${Math.round(selected.miles * (1 - selected.milesLeft / selected.miles) / 7 * 3.89)}` },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', flex: 1, background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2D3748' }}>{item.value}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Loads table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 className="section-title" style={{ margin: 0 }}>All Loads — Today</h3>
          <span style={{ fontSize: 12, color: '#A0AEC0' }}>{ACTIVE_LOADS.length} total</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Load ID</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Progress</th>
              <th>HOS Left</th>
              <th>ETA</th>
              <th>Rate</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ACTIVE_LOADS.map(load => (
              <tr key={load.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedId(load.id); setDetailTab('overview') }}>
                <td><span style={{ fontWeight: 700, color: '#4BAED4' }}>{load.id}</span></td>
                <td>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{load.from.split(',')[0]} → {load.to.split(',')[0]}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0' }}>{load.miles} mi</div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{load.driver.charAt(0)}</div>
                    <span style={{ fontSize: 13 }}>{load.driver}</span>
                  </div>
                </td>
                <td><StatusBadge status={load.status} /></td>
                <td style={{ width: 130 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-wrap" style={{ flex: 1, height: 6 }}>
                      <div className="progress-bar" style={{
                        width: `${load.progress}%`,
                        background: load.progress === 100 ? '#38C770' : load.status === 'Delayed' ? '#EF4444' : '#4BAED4',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#718096', flexShrink: 0 }}>{load.progress}%</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 12, fontWeight: 700, color: load.hosRemaining < 2 ? '#EF4444' : load.hosRemaining < 4 ? '#F59E0B' : '#38C770' }}>
                    {load.hosRemaining}h
                  </span>
                </td>
                <td style={{ fontSize: 13, color: load.status === 'Delivered' ? '#38C770' : load.status === 'Delayed' ? '#EF4444' : '#2D3748' }}>
                  {load.etaDate}
                </td>
                <td style={{ fontWeight: 700, color: '#38C770' }}>{load.rate}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedId(load.id); setDetailTab('overview') }}>
                    Track →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowCheckInModal(false)}>
          <div className="card" style={{ width: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>📍 Add Check-in</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCheckInModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 5 }}>Load</label>
              <div style={{ padding: '8px 12px', background: '#F7FAFC', borderRadius: 8, fontSize: 13 }}>
                {selected.id} · {selected.from} → {selected.to}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 5 }}>Current Location</label>
              <div style={{ padding: '8px 12px', background: '#F7FAFC', borderRadius: 8, fontSize: 13 }}>📍 {selected.currentCity}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 5 }}>Note *</label>
              <textarea className="input" rows={3}
                placeholder="e.g. All good, on schedule. Traffic clear on I-44..."
                value={checkInNote} onChange={e => setCheckInNote(e.target.value)}
                style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCheckInModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCheckIn} disabled={!checkInNote.trim()}>
                ✓ Submit Check-in
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && <ShareETAModal load={selected} onClose={() => setShowShareModal(false)} />}
    </div>
  )
}
