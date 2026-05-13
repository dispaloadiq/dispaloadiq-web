import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type EquipType = 'Dry Van' | 'Reefer' | 'Flatbed' | 'Step Deck'
type MainTab   = 'rates' | 'seasonal' | 'alerts'

interface LaneRate {
  id: string
  from: string
  to: string
  spot: number
  contract: number
  change: number
  volume: 'low' | 'medium' | 'high' | 'very high'
  trend: number[]
  miles: number
  transitDays: number
  seasonal: number[]   // 12-month avg $/mi (Jan–Dec)
  tips: string[]
}

interface FuelPrice { state: string; price: number; change: number }

interface RateAlert {
  id: string
  laneId: string
  from: string
  to: string
  threshold: number
  direction: 'above' | 'below'
  equip: EquipType
  active: boolean
  triggered: boolean
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const LANES: Record<EquipType, LaneRate[]> = {
  'Dry Van': [
    {
      id: 'chi-dal', from: 'Chicago, IL', to: 'Dallas, TX',
      spot: 2.44, contract: 2.21, change: +6.1, volume: 'very high', miles: 921,
      transitDays: 2, trend: [2.18,2.22,2.30,2.28,2.35,2.39,2.41,2.44],
      seasonal: [2.10,2.18,2.31,2.42,2.39,2.28,2.25,2.30,2.38,2.44,2.40,2.22],
      tips: ['Пик нагрузки: вт–ср', 'Книгировать за 2 дня', 'Back-haul слабый — торговаться жёстко на возврат'],
    },
    {
      id: 'la-chi', from: 'Los Angeles, CA', to: 'Chicago, IL',
      spot: 2.61, contract: 2.38, change: +3.2, volume: 'high', miles: 2016,
      transitDays: 3, trend: [2.48,2.50,2.53,2.51,2.55,2.58,2.59,2.61],
      seasonal: [2.40,2.45,2.55,2.60,2.58,2.50,2.48,2.52,2.60,2.62,2.58,2.48],
      tips: ['Long-haul — выгодно под Хэзмат', 'Пик: Q4 ритейл', 'Объём стабильный весь год'],
    },
    {
      id: 'atl-mia', from: 'Atlanta, GA', to: 'Miami, FL',
      spot: 2.38, contract: 2.14, change: -1.2, volume: 'medium', miles: 662,
      transitDays: 1, trend: [2.45,2.42,2.40,2.41,2.38,2.39,2.38,2.38],
      seasonal: [2.50,2.48,2.42,2.36,2.30,2.28,2.30,2.35,2.38,2.40,2.44,2.52],
      tips: ['Зима/весна — высокий спрос (туризм)', 'Лето слабее', 'Обратный маршрут Miami→ATL часто дефицит'],
    },
    {
      id: 'dal-phx', from: 'Dallas, TX', to: 'Phoenix, AZ',
      spot: 2.32, contract: 2.09, change: +0.8, volume: 'medium', miles: 1066,
      transitDays: 2, trend: [2.26,2.28,2.29,2.28,2.30,2.31,2.32,2.32],
      seasonal: [2.20,2.25,2.30,2.35,2.38,2.36,2.30,2.28,2.32,2.35,2.32,2.25],
      tips: ['Стабильный коридор', 'Весна — строительный сезон даёт +10%', 'Торговаться на fuel surcharge'],
    },
    {
      id: 'hou-atl', from: 'Houston, TX', to: 'Atlanta, GA',
      spot: 2.51, contract: 2.27, change: +4.6, volume: 'high', miles: 790,
      transitDays: 1, trend: [2.32,2.36,2.40,2.38,2.44,2.47,2.49,2.51],
      seasonal: [2.30,2.35,2.42,2.50,2.52,2.48,2.44,2.46,2.51,2.55,2.50,2.38],
      tips: ['Нефтехимия из Хьюстона даёт объём', 'Q2–Q3 пик', 'Хорошо для Hazmat CDL'],
    },
    {
      id: 'nyc-chi', from: 'New York, NY', to: 'Chicago, IL',
      spot: 2.29, contract: 2.07, change: -0.4, volume: 'high', miles: 790,
      transitDays: 2, trend: [2.31,2.30,2.31,2.29,2.28,2.29,2.30,2.29],
      seasonal: [2.32,2.30,2.28,2.25,2.22,2.20,2.22,2.26,2.29,2.31,2.34,2.38],
      tips: ['Зимний пик (Q4/Q1)', 'Congestion в NY — закладывать +4ч', 'Объём есть, но конкуренция высокая'],
    },
    {
      id: 'chi-atl', from: 'Chicago, IL', to: 'Atlanta, GA',
      spot: 2.55, contract: 2.31, change: +5.4, volume: 'very high', miles: 718,
      transitDays: 1, trend: [2.38,2.40,2.44,2.46,2.48,2.51,2.53,2.55],
      seasonal: [2.35,2.40,2.45,2.52,2.55,2.50,2.48,2.50,2.55,2.58,2.52,2.40],
      tips: ['Один из лучших коридоров 2024–2025', 'Высокий объём круглый год', 'Пик: апрель–октябрь'],
    },
    {
      id: 'sea-la', from: 'Seattle, WA', to: 'Los Angeles, CA',
      spot: 2.18, contract: 1.98, change: -2.1, volume: 'medium', miles: 1135,
      transitDays: 2, trend: [2.25,2.23,2.21,2.20,2.19,2.18,2.19,2.18],
      seasonal: [2.10,2.12,2.18,2.20,2.22,2.25,2.30,2.28,2.22,2.18,2.14,2.10],
      tips: ['Лето пик (туризм + с/х)', 'Зима слабее', 'Торговаться выше при пиковом спросе'],
    },
  ],
  'Reefer': [
    {
      id: 'fre-chi', from: 'Fresno, CA', to: 'Chicago, IL',
      spot: 2.89, contract: 2.61, change: +7.8, volume: 'very high', miles: 2108,
      transitDays: 3, trend: [2.62,2.67,2.72,2.75,2.79,2.82,2.86,2.89],
      seasonal: [2.55,2.60,2.70,2.80,2.88,2.95,3.00,2.95,2.89,2.82,2.72,2.60],
      tips: ['Лето — сезон сбора урожая, ставки +15%', 'Нужна Reefer сертификация', 'Advance booking за 3–4 дня'],
    },
    {
      id: 'chi-dal-r', from: 'Chicago, IL', to: 'Dallas, TX',
      spot: 2.75, contract: 2.48, change: +4.2, volume: 'high', miles: 921,
      transitDays: 2, trend: [2.58,2.61,2.65,2.67,2.69,2.71,2.73,2.75],
      seasonal: [2.60,2.65,2.70,2.74,2.72,2.68,2.70,2.75,2.78,2.75,2.70,2.65],
      tips: ['Стабильный поток продуктов питания', 'Зимой чуть ниже конкуренция'],
    },
    {
      id: 'atl-nyc', from: 'Atlanta, GA', to: 'New York, NY',
      spot: 2.93, contract: 2.65, change: +2.1, volume: 'high', miles: 870,
      transitDays: 2, trend: [2.84,2.86,2.88,2.89,2.90,2.91,2.92,2.93],
      seasonal: [2.88,2.90,2.92,2.94,2.93,2.88,2.85,2.87,2.93,2.95,2.92,2.90],
      tips: ['Стабильный коридор для продуктов', 'NYC получение — планировать Bronx Hunts Point'],
    },
    {
      id: 'mia-chi', from: 'Miami, FL', to: 'Chicago, IL',
      spot: 2.68, contract: 2.41, change: -0.7, volume: 'medium', miles: 1378,
      transitDays: 2, trend: [2.73,2.71,2.70,2.69,2.69,2.68,2.68,2.68],
      seasonal: [2.78,2.80,2.75,2.70,2.65,2.60,2.62,2.65,2.68,2.72,2.76,2.80],
      tips: ['Зима высокий спрос (юг Флориды)', 'Лето слабее из-за конкуренции'],
    },
    {
      id: 'la-dal-r', from: 'Los Angeles, CA', to: 'Dallas, TX',
      spot: 2.81, contract: 2.54, change: +5.2, volume: 'high', miles: 1434,
      transitDays: 2, trend: [2.61,2.65,2.70,2.72,2.74,2.77,2.79,2.81],
      seasonal: [2.62,2.65,2.72,2.78,2.82,2.85,2.88,2.84,2.80,2.78,2.72,2.65],
      tips: ['Калифорнийский с/х сезон: апрель–сентябрь', 'Ставки существенно выше летом'],
    },
  ],
  'Flatbed': [
    {
      id: 'chi-hou', from: 'Chicago, IL', to: 'Houston, TX',
      spot: 2.62, contract: 2.38, change: +3.4, volume: 'high', miles: 1090,
      transitDays: 2, trend: [2.48,2.51,2.54,2.55,2.57,2.58,2.60,2.62],
      seasonal: [2.40,2.45,2.55,2.62,2.65,2.58,2.52,2.55,2.62,2.64,2.58,2.48],
      tips: ['Строительный сезон: март–октябрь +12%', 'Нефтегаз Хьюстон — постоянный поток'],
    },
    {
      id: 'hou-phx', from: 'Houston, TX', to: 'Phoenix, AZ',
      spot: 2.55, contract: 2.31, change: +1.2, volume: 'medium', miles: 1174,
      transitDays: 2, trend: [2.48,2.50,2.51,2.52,2.53,2.53,2.54,2.55],
      seasonal: [2.42,2.48,2.55,2.60,2.62,2.58,2.54,2.52,2.55,2.58,2.52,2.45],
      tips: ['Строительство Аризоны растёт', 'Пик: весна-лето'],
    },
    {
      id: 'det-dal', from: 'Detroit, MI', to: 'Dallas, TX',
      spot: 2.74, contract: 2.49, change: +8.2, volume: 'very high', miles: 1143,
      transitDays: 2, trend: [2.48,2.52,2.58,2.61,2.64,2.68,2.71,2.74],
      seasonal: [2.48,2.52,2.62,2.72,2.78,2.74,2.68,2.70,2.74,2.76,2.68,2.55],
      tips: ['Автопром Детройта + EV manufacturing', 'Резкий рост Q2 2025', 'Торговаться выше на негабарит'],
    },
    {
      id: 'pit-atl', from: 'Pittsburgh, PA', to: 'Atlanta, GA',
      spot: 2.48, contract: 2.25, change: +2.8, volume: 'medium', miles: 732,
      transitDays: 1, trend: [2.39,2.41,2.43,2.44,2.45,2.46,2.47,2.48],
      seasonal: [2.35,2.38,2.44,2.50,2.52,2.48,2.45,2.46,2.48,2.50,2.46,2.38],
      tips: ['Стабильный рост', 'Индустрия Питтсбурга даёт постоянный поток'],
    },
  ],
  'Step Deck': [
    {
      id: 'chi-dal-sd', from: 'Chicago, IL', to: 'Dallas, TX',
      spot: 2.71, contract: 2.45, change: +4.6, volume: 'medium', miles: 921,
      transitDays: 2, trend: [2.52,2.55,2.58,2.60,2.63,2.65,2.68,2.71],
      seasonal: [2.48,2.52,2.60,2.68,2.72,2.70,2.65,2.68,2.72,2.74,2.68,2.55],
      tips: ['Строительная техника — пик весна', 'Permit нужен для негабарита >13.6 ft'],
    },
    {
      id: 'hou-la-sd', from: 'Houston, TX', to: 'Los Angeles, CA',
      spot: 2.84, contract: 2.57, change: +6.1, volume: 'high', miles: 1553,
      transitDays: 3, trend: [2.60,2.64,2.68,2.71,2.74,2.78,2.81,2.84],
      seasonal: [2.58,2.62,2.70,2.78,2.85,2.90,2.88,2.84,2.82,2.80,2.72,2.62],
      tips: ['Нефтегаз оборудование из Хьюстона', 'Лето пик для CA строительства'],
    },
    {
      id: 'atl-chi-sd', from: 'Atlanta, GA', to: 'Chicago, IL',
      spot: 2.58, contract: 2.33, change: +1.8, volume: 'medium', miles: 718,
      transitDays: 1, trend: [2.49,2.51,2.53,2.54,2.55,2.56,2.57,2.58],
      seasonal: [2.45,2.48,2.54,2.60,2.62,2.58,2.55,2.56,2.58,2.60,2.55,2.48],
      tips: ['Стабильный промышленный коридор', 'Зима немного слабее'],
    },
  ],
}

const FUEL_PRICES: FuelPrice[] = [
  { state: 'CA', price: 4.82, change: +0.08 },
  { state: 'TX', price: 3.51, change: -0.03 },
  { state: 'IL', price: 3.89, change: +0.04 },
  { state: 'FL', price: 3.64, change: +0.01 },
  { state: 'NY', price: 4.21, change: +0.06 },
  { state: 'GA', price: 3.57, change: -0.02 },
  { state: 'AZ', price: 3.71, change: +0.02 },
  { state: 'WA', price: 4.44, change: +0.05 },
]

const NATIONAL_AVG_DIESEL = 3.89

const HOT_MARKETS = [
  { city: 'Chicago, IL',     loads: 2841, trend: 'up',   pct: +18 },
  { city: 'Dallas, TX',      loads: 2214, trend: 'up',   pct: +12 },
  { city: 'Los Angeles, CA', loads: 1987, trend: 'up',   pct: +8  },
  { city: 'Atlanta, GA',     loads: 1756, trend: 'up',   pct: +15 },
  { city: 'Houston, TX',     loads: 1542, trend: 'down', pct: -4  },
  { city: 'Detroit, MI',     loads: 1320, trend: 'up',   pct: +22 },
]

const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']

const VOLUME_COLORS = {
  low:         { bg: '#F7FAFC', color: '#A0AEC0' },
  medium:      { bg: '#EBF8FF', color: '#2B6CB0' },
  high:        { bg: '#F0FFF4', color: '#276749' },
  'very high': { bg: '#FFF5F5', color: '#C53030' },
}

const VOLUME_LABELS = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий', 'very high': '🔥 Очень высокий',
}

// ── Mini sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 0.01
  const w = 80, h = 28, pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const color = positive ? '#48BB78' : '#FC8181'

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = data[data.length - 1]
        const x = w - pad
        const y = h - pad - ((last - min) / range) * (h - pad * 2)
        return <circle cx={x} cy={y} r={3} fill={color} />
      })()}
    </svg>
  )
}

// ── Large 8-week bar chart ─────────────────────────────────────────────────────
function TrendBarChart({ data }: { data: number[] }) {
  const min = Math.min(...data) * 0.98
  const max = Math.max(...data) * 1.01
  const range = max - min || 0.01
  const weeks = ['W-7','W-6','W-5','W-4','W-3','W-2','W-1','Сейчас']
  const peak = Math.max(...data)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
        {data.map((v, i) => {
          const heightPct = ((v - min) / range) * 85 + 15
          const isLast = i === data.length - 1
          const isPeak = v === peak
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontSize: 9, color: '#A0AEC0', fontWeight: 700 }}>
                {v === peak ? '⬆' : ''}
              </div>
              <div style={{
                width: '100%', height: `${heightPct}%`,
                background: isLast ? '#4BAED4' : isPeak ? '#9F7AEA' : '#CBD5E0',
                borderRadius: '4px 4px 0 0',
                transition: 'height .3s',
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === 7 ? '#4BAED4' : '#A0AEC0', fontWeight: i === 7 ? 700 : 400 }}>
            {w}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === 7 ? '#1A2535' : '#A0AEC0', fontWeight: i === 7 ? 800 : 500 }}>
            ${v.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Seasonal 12-month chart ────────────────────────────────────────────────────
function SeasonalChart({ data, color = '#4BAED4' }: { data: number[]; color?: string }) {
  const min = Math.min(...data) * 0.97
  const max = Math.max(...data) * 1.02
  const range = max - min || 0.01
  const w = 340, h = 80, padX = 4, padY = 8

  const pts = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2)
    const y = h - padY - ((v - min) / range) * (h - padY * 2)
    return `${x},${y}`
  })

  const polyline = pts.join(' ')
  const area = `${pts[0].split(',')[0]},${h} ${polyline} ${pts[pts.length - 1].split(',')[0]},${h}`
  const now = new Date().getMonth()

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="sgr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#sgr)" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = padX + (i / (data.length - 1)) * (w - padX * 2)
          const y = h - padY - ((v - min) / range) * (h - padY * 2)
          return i === now
            ? <circle key={i} cx={x} cy={y} r={5} fill={color} stroke="#fff" strokeWidth={2} />
            : <circle key={i} cx={x} cy={y} r={2.5} fill={color} opacity={0.5} />
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {MONTHS_SHORT.map((m, i) => (
          <div key={i} style={{
            fontSize: 9, color: i === now ? color : '#A0AEC0',
            fontWeight: i === now ? 800 : 400, textAlign: 'center',
          }}>{m}</div>
        ))}
      </div>
    </div>
  )
}

// ── Lane Detail Panel ─────────────────────────────────────────────────────────
function LaneDetailPanel({
  lane, equip, saved, onSave, onClose,
}: {
  lane: LaneRate; equip: EquipType; saved: boolean
  onSave: () => void; onClose: () => void
}) {
  const [tab, setTab] = useState<'overview' | 'seasonal' | 'tips'>('overview')
  const isUp = lane.change >= 0
  const profitPerLoad = (lane.spot * lane.miles * 0.82).toFixed(0)
  const weekHigh = Math.max(...lane.trend).toFixed(2)
  const weekLow  = Math.min(...lane.trend).toFixed(2)

  return (
    <div style={{
      width: 380, background: '#fff', borderLeft: '1.5px solid #E2E8F0',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1A2535,#2D4A6B)',
        padding: '18px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>
              {equip} · {lane.miles.toLocaleString()} mi · {lane.transitDays} дня
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{lane.from}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: '2px 0' }}>↓</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{lane.to}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onSave} style={{
              background: saved ? '#F6E05E' : 'rgba(255,255,255,.15)',
              border: 'none', borderRadius: 8, width: 36, height: 36,
              cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title={saved ? 'Убрать из избранного' : 'Добавить в избранное'}>
              {saved ? '★' : '☆'}
            </button>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8,
              width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#4BAED4' }}>${lane.spot.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Spot /mi</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>${lane.contract.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Контракт /mi</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: isUp ? '#68D391' : '#FC8181' }}>
              {isUp ? '+' : ''}{lane.change.toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Нед. изм.</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F6E05E' }}>${profitPerLoad}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Расч. профит</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
        {(['overview', 'seasonal', 'tips'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '11px 0', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            background: tab === t ? '#fff' : '#F7FAFC',
            color: tab === t ? '#1A2535' : '#718096',
            borderBottom: tab === t ? '2px solid #4BAED4' : '2px solid transparent',
          }}>
            {t === 'overview' ? 'Тренд' : t === 'seasonal' ? 'Сезонность' : '💡 Советы'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535', marginBottom: 10 }}>
                8-недельный тренд ставок
              </div>
              <TrendBarChart data={lane.trend} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: '8-нед. максимум', value: `$${weekHigh}`, color: '#48BB78' },
                { label: '8-нед. минимум',  value: `$${weekLow}`,  color: '#FC8181' },
                { label: 'Спред (S–C)',      value: `$${(lane.spot - lane.contract).toFixed(2)}`, color: '#4BAED4' },
              ].map(s => (
                <div key={s.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535', marginBottom: 8 }}>
                Объём и конкуренция
              </div>
              <div style={{
                background: VOLUME_COLORS[lane.volume].bg, borderRadius: 10,
                padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>Загруженность коридора</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: VOLUME_COLORS[lane.volume].color }}>
                  {VOLUME_LABELS[lane.volume]}
                </span>
              </div>
            </div>
          </div>
        )}

        {tab === 'seasonal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535', marginBottom: 4 }}>
                Сезонные ставки (12 мес.)
              </div>
              <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 12 }}>
                Синяя точка = текущий месяц
              </div>
              <SeasonalChart data={lane.seasonal} />
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#718096', marginBottom: 8 }}>
                Помесячные ставки
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {lane.seasonal.map((v, i) => {
                  const isNow = i === new Date().getMonth()
                  const isPeak = v === Math.max(...lane.seasonal)
                  return (
                    <div key={i} style={{
                      background: isNow ? '#EBF8FF' : isPeak ? '#F0FFF4' : '#F7FAFC',
                      borderRadius: 8, padding: '8px 6px', textAlign: 'center',
                      border: isNow ? '1.5px solid #4BAED4' : '1px solid transparent',
                    }}>
                      <div style={{ fontSize: 9, color: '#A0AEC0', fontWeight: 700 }}>{MONTHS_SHORT[i]}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isPeak ? '#276749' : '#1A2535', marginTop: 2 }}>
                        ${v.toFixed(2)}
                      </div>
                      {isPeak && <div style={{ fontSize: 8, color: '#48BB78' }}>Пик</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {(() => {
              const peakIdx = lane.seasonal.indexOf(Math.max(...lane.seasonal))
              const lowIdx  = lane.seasonal.indexOf(Math.min(...lane.seasonal))
              const diff = ((Math.max(...lane.seasonal) - Math.min(...lane.seasonal)) / Math.min(...lane.seasonal) * 100).toFixed(1)
              return (
                <div style={{ background: '#F0FFF4', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#276749', marginBottom: 6 }}>📊 Сезонный анализ</div>
                  <div style={{ fontSize: 12, color: '#1A2535', lineHeight: 1.6 }}>
                    Пик: <strong>{MONTHS_SHORT[peakIdx]}</strong> (${lane.seasonal[peakIdx].toFixed(2)}/mi)<br />
                    Минимум: <strong>{MONTHS_SHORT[lowIdx]}</strong> (${lane.seasonal[lowIdx].toFixed(2)}/mi)<br />
                    Сезонный разброс: <strong style={{ color: '#276749' }}>+{diff}%</strong>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {tab === 'tips' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>
              💡 Советы по коридору
            </div>
            {lane.tips.map((t, i) => (
              <div key={i} style={{
                background: '#F7FAFC', borderRadius: 10, padding: '14px 16px',
                borderLeft: '3px solid #4BAED4',
              }}>
                <div style={{ fontSize: 13, color: '#1A2535', lineHeight: 1.5 }}>{t}</div>
              </div>
            ))}

            <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '14px 16px', marginTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#D97706', marginBottom: 6 }}>
                🤝 Стратегия переговоров
              </div>
              <div style={{ fontSize: 12, color: '#1A2535', lineHeight: 1.6 }}>
                Spot ${lane.spot.toFixed(2)} vs Contract ${lane.contract.toFixed(2)} — спред ${(lane.spot - lane.contract).toFixed(2)}/mi.<br />
                {lane.spot - lane.contract > 0.25
                  ? 'Spot рынок выгоднее контракта — рекомендуется работать по spot.'
                  : 'Спред небольшой — рассмотрите контракт для стабильности объёма.'}
              </div>
            </div>

            <div style={{ background: '#EBF8FF', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#2B6CB0', marginBottom: 6 }}>
                📋 Расчёт доходности
              </div>
              <div style={{ fontSize: 12, color: '#1A2535', lineHeight: 1.8 }}>
                Расстояние: <strong>{lane.miles.toLocaleString()} mi</strong><br />
                Валовая (spot): <strong>${(lane.spot * lane.miles).toFixed(0)}</strong><br />
                ~Профит (82%): <strong style={{ color: '#276749' }}>${profitPerLoad}</strong><br />
                Контракт вариант: <strong>${(lane.contract * lane.miles).toFixed(0)}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Rate Calculator ────────────────────────────────────────────────────────────
function RateCalculator() {
  const [miles, setMiles] = useState(850)
  const [rpm,   setRpm]   = useState(2.44)
  const [fuel,  setFuel]  = useState(3.89)
  const [mpg,   setMpg]   = useState(6.5)
  const [dh,    setDh]    = useState(80)
  const [disp,  setDisp]  = useState(8)

  const grossRevenue = miles * rpm
  const fuelCost     = ((miles + dh) / mpg) * fuel
  const dispFee      = grossRevenue * (disp / 100)
  const otherCosts   = miles * 0.18
  const netProfit    = grossRevenue - fuelCost - dispFee - otherCosts
  const netRpm       = netProfit / miles
  const margin       = (netProfit / grossRevenue) * 100

  const row = (label: string, value: string, color?: string) => (
    <div key={label} style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '7px 0', borderBottom: '1px solid #F0F4F8', fontSize: 13,
    }}>
      <span style={{ color: '#718096' }}>{label}</span>
      <span style={{ fontWeight: 700, color: color ?? '#1A2535' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: 22 }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: '#1A2535', marginBottom: 18 }}>
        🧮 Калькулятор рейса
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Миль (загруж.)', value: miles, set: setMiles, step: 10    },
          { label: 'RPM ($)',         value: rpm,   set: setRpm,   step: 0.01  },
          { label: 'Топливо ($/gal)', value: fuel,  set: setFuel,  step: 0.01  },
          { label: 'MPG',             value: mpg,   set: setMpg,   step: 0.1   },
          { label: 'Deadhead (mi)',   value: dh,    set: setDh,    step: 5     },
          { label: 'Диспетчер (%)',   value: disp,  set: setDisp,  step: 1     },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>
              {f.label}
            </label>
            <input
              type="number" value={f.value} step={f.step}
              onChange={e => f.set(+e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>
      <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '14px 16px' }}>
        {row('Валовая выручка',   `$${grossRevenue.toFixed(0)}`)}
        {row('Топливо',           `-$${fuelCost.toFixed(0)}`,    '#E53E3E')}
        {row(`Диспетчер (${disp}%)`, `-$${dispFee.toFixed(0)}`, '#D97706')}
        {row('Прочее (~$0.18/mi)', `-$${otherCosts.toFixed(0)}`, '#718096')}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: 16, fontWeight: 800 }}>
          <span style={{ color: '#1A2535' }}>Чистая прибыль</span>
          <span style={{ color: netProfit >= 0 ? '#48BB78' : '#E53E3E' }}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(0)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid #E2E8F0', fontSize: 12, color: '#718096' }}>
          <span>Net RPM: <strong style={{ color: netRpm >= 1.5 ? '#48BB78' : '#FC8181' }}>${netRpm.toFixed(2)}</strong></span>
          <span>Маржа: <strong style={{ color: margin >= 30 ? '#48BB78' : '#FC8181' }}>{margin.toFixed(1)}%</strong></span>
        </div>
      </div>
    </div>
  )
}

// ── Seasonal Trends Tab ───────────────────────────────────────────────────────
function SeasonalTrendsTab({ equip }: { equip: EquipType }) {
  const lanes = LANES[equip]

  // Average seasonal across all lanes for this equip type
  const avgSeasonal = MONTHS_SHORT.map((_, m) => {
    const vals = lanes.map(l => l.seasonal[m])
    return vals.reduce((a, b) => a + b, 0) / vals.length
  })

  const peakMonth = avgSeasonal.indexOf(Math.max(...avgSeasonal))
  const lowMonth  = avgSeasonal.indexOf(Math.min(...avgSeasonal))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Aggregate chart */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '20px 24px' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 4 }}>
          Средние ставки {equip} по месяцам
        </div>
        <div style={{ fontSize: 12, color: '#A0AEC0', marginBottom: 16 }}>
          Среднее по {lanes.length} основным коридорам · Синяя точка = текущий месяц
        </div>
        <SeasonalChart data={avgSeasonal} color="#4BAED4" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 18 }}>
          {[
            { label: 'Пик сезон',     value: MONTHS_SHORT[peakMonth],  sub: `$${avgSeasonal[peakMonth].toFixed(2)}/mi`, color: '#48BB78' },
            { label: 'Низкий сезон',  value: MONTHS_SHORT[lowMonth],   sub: `$${avgSeasonal[lowMonth].toFixed(2)}/mi`,  color: '#FC8181' },
            { label: 'Текущий месяц', value: MONTHS_SHORT[new Date().getMonth()], sub: `$${avgSeasonal[new Date().getMonth()].toFixed(2)}/mi`, color: '#4BAED4' },
          ].map(s => (
            <div key={s.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginTop: 2 }}>{s.sub}</div>
              <div style={{ fontSize: 10, color: '#A0AEC0' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-lane seasonal table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>
            Сезонность по коридорам · {equip}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#FAFBFC' }}>
                <th style={{ padding: '8px 16px', textAlign: 'left', color: '#718096', fontWeight: 700, borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                  Коридор
                </th>
                {MONTHS_SHORT.map(m => (
                  <th key={m} style={{ padding: '8px 6px', color: '#718096', fontWeight: 700, borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lanes.map(lane => {
                const max = Math.max(...lane.seasonal)
                const min = Math.min(...lane.seasonal)
                return (
                  <tr key={lane.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1A2535', whiteSpace: 'nowrap' }}>
                      {lane.from.split(',')[0]} → {lane.to.split(',')[0]}
                    </td>
                    {lane.seasonal.map((v, i) => {
                      const isPeak = v === max
                      const isLow  = v === min
                      const isNow  = i === new Date().getMonth()
                      return (
                        <td key={i} style={{
                          padding: '6px 4px', textAlign: 'center', fontWeight: 700,
                          background: isNow ? '#EBF8FF' : isPeak ? '#F0FFF4' : isLow ? '#FFF5F5' : 'transparent',
                          color: isPeak ? '#276749' : isLow ? '#C53030' : isNow ? '#2B6CB0' : '#1A2535',
                        }}>
                          ${v.toFixed(2)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', background: '#F7FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 16, fontSize: 11, color: '#718096' }}>
          <span style={{ color: '#276749', fontWeight: 700 }}>■ Пик</span>
          <span style={{ color: '#C53030', fontWeight: 700 }}>■ Минимум</span>
          <span style={{ color: '#2B6CB0', fontWeight: 700 }}>■ Текущий месяц</span>
        </div>
      </div>
    </div>
  )
}

// ── Alerts Tab ────────────────────────────────────────────────────────────────
function AlertsTab({
  alerts, onAdd, onDelete, onToggle,
}: {
  alerts: RateAlert[]
  onAdd: (a: Omit<RateAlert, 'id' | 'triggered'>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    from: '', to: '', threshold: 2.5, direction: 'above' as 'above' | 'below', equip: 'Dry Van' as EquipType,
  })

  const handleAdd = () => {
    if (!form.from || !form.to) return
    onAdd({ laneId: `${form.from}-${form.to}`, from: form.from, to: form.to, threshold: form.threshold, direction: form.direction, equip: form.equip, active: true })
    setShowForm(false)
    setForm({ from: '', to: '', threshold: 2.5, direction: 'above', equip: 'Dry Van' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1A2535' }}>🔔 Алерты по ставкам</div>
          <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>
            Уведомление когда spot-ставка выходит за порог
          </div>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 10,
          padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
        }}>
          + Новый алерт
        </button>
      </div>

      {/* New alert form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, border: '2px solid #4BAED4', padding: '20px 22px' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535', marginBottom: 16 }}>Создать алерт</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {([
              { label: 'Откуда', key: 'from', type: 'text', placeholder: 'Chicago, IL' },
              { label: 'Куда',   key: 'to',   type: 'text', placeholder: 'Dallas, TX'  },
            ] as const).map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input
                  type="text" value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Тип оборудования</label>
              <select value={form.equip} onChange={e => setForm(p => ({ ...p, equip: e.target.value as EquipType }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }}>
                {(['Dry Van','Reefer','Flatbed','Step Deck'] as EquipType[]).map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Условие</label>
              <select value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value as 'above' | 'below' }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }}>
                <option value="above">Выше порога</option>
                <option value="below">Ниже порога</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>
                Порог ($/mi): <strong style={{ color: '#1A2535' }}>${form.threshold.toFixed(2)}</strong>
              </label>
              <input type="range" min={1.5} max={4.0} step={0.05} value={form.threshold}
                onChange={e => setForm(p => ({ ...p, threshold: +e.target.value }))}
                style={{ width: '100%', accentColor: '#4BAED4' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A0AEC0' }}>
                <span>$1.50</span><span>$4.00</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={handleAdd} style={{
              background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>Создать</button>
            <button onClick={() => setShowForm(false)} style={{
              background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 9, padding: '10px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>Отмена</button>
          </div>
        </div>
      )}

      {/* Alerts list */}
      {alerts.length === 0 && !showForm && (
        <div style={{ background: '#F7FAFC', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2535', marginBottom: 6 }}>Нет алертов</div>
          <div style={{ fontSize: 13, color: '#A0AEC0' }}>Создайте алерт чтобы получать уведомления при изменении ставок</div>
        </div>
      )}

      {alerts.map(a => (
        <div key={a.id} style={{
          background: a.triggered ? '#FFFBEB' : '#fff',
          borderRadius: 12, border: `1.5px solid ${a.triggered ? '#FEFCBF' : '#E2E8F0'}`,
          padding: '16px 18px',
        } as React.CSSProperties}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                {a.triggered && (
                  <span style={{ background: '#F6AD55', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                    ⚡ СРАБОТАЛ
                  </span>
                )}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#EBF8FF', color: '#2B6CB0', fontWeight: 700 }}>
                  {a.equip}
                </span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                  background: a.active ? '#F0FFF4' : '#F7FAFC',
                  color: a.active ? '#276749' : '#A0AEC0',
                }}>
                  {a.active ? '● Активен' : '○ Выкл'}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2535' }}>
                {a.from} → {a.to}
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
                Уведомить когда ставка {a.direction === 'above' ? 'поднимется выше' : 'опустится ниже'}{' '}
                <strong style={{ color: '#1A2535' }}>${a.threshold.toFixed(2)}/mi</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onToggle(a.id)} style={{
                background: a.active ? '#F7FAFC' : '#EBF8FF', border: '1px solid #E2E8F0',
                borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                color: a.active ? '#718096' : '#2B6CB0', cursor: 'pointer',
              }}>
                {a.active ? 'Выкл' : 'Вкл'}
              </button>
              <button onClick={() => onDelete(a.id)} style={{
                background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8,
                padding: '7px 12px', fontSize: 12, fontWeight: 700, color: '#C53030', cursor: 'pointer',
              }}>🗑</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RatesPage() {
  const [equip,        setEquip]       = useState<EquipType>('Dry Van')
  const [sortBy,       setSortBy]      = useState<'spot' | 'change' | 'volume'>('spot')
  const [mainTab,      setMainTab]     = useState<MainTab>('rates')
  const [selectedLane, setSelectedLane] = useState<LaneRate | null>(null)
  const [savedLanes,   setSavedLanes]  = useState<Set<string>>(new Set(['chi-dal', 'det-dal']))
  const [hoveredRow,   setHoveredRow]  = useState<string | null>(null)
  const [alerts,       setAlerts]      = useState<RateAlert[]>([
    { id: 'a1', laneId: 'chi-dal', from: 'Chicago, IL', to: 'Dallas, TX', threshold: 2.50, direction: 'above', equip: 'Dry Van', active: true, triggered: true },
    { id: 'a2', laneId: 'det-dal', from: 'Detroit, MI', to: 'Dallas, TX', threshold: 2.70, direction: 'above', equip: 'Flatbed', active: true, triggered: false },
  ])

  const toggleSave = (id: string) => {
    setSavedLanes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const lanes = [...LANES[equip]].sort((a, b) => {
    if (sortBy === 'spot')   return b.spot - a.spot
    if (sortBy === 'change') return b.change - a.change
    const vol = { low: 0, medium: 1, high: 2, 'very high': 3 }
    return vol[b.volume] - vol[a.volume]
  })

  const avgSpot     = lanes.reduce((s, l) => s + l.spot, 0) / lanes.length
  const savedList   = Object.values(LANES).flat().filter(l => savedLanes.has(l.id))
  const activeAlerts = alerts.filter(a => a.triggered && a.active).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ── Market summary header ───────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1A2535 0%,#2D4A6B 100%)',
        borderRadius: 16, padding: '22px 28px',
        display: 'flex', gap: 0, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>
            DAT РЫНОЧНЫЕ ДАННЫЕ · {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            Рыночные Ставки
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
            Spot rates, тренды и аналитика по основным коридорам США
          </div>
          {activeAlerts > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
              background: 'rgba(246,173,85,.2)', borderRadius: 8, padding: '5px 12px',
              cursor: 'pointer',
            }} onClick={() => setMainTab('alerts')}>
              <span style={{ fontSize: 14 }}>🔔</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F6AD55' }}>
                {activeAlerts} алерт{activeAlerts > 1 ? 'а' : ''} сработал
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { label: 'Нац. Avg Diesel', value: `$${NATIONAL_AVG_DIESEL}/gal`, sub: '+2% за неделю',  color: '#ED8936' },
            { label: `${equip} Avg`,    value: `$${avgSpot.toFixed(2)}/mi`,   sub: '+4.2% за нед.',  color: '#48BB78' },
            { label: 'Загрузок DAT',    value: '18,400+',                     sub: 'за 24 часа',     color: '#4BAED4' },
            { label: 'Load-to-Truck',   value: '4.2 : 1',                     sub: 'Рынок перевозч.',color: '#9F7AEA' },
          ].map(k => (
            <div key={k.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{k.sub}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Watchlist (if any saved) ───────────────────────── */}
      {savedList.length > 0 && mainTab === 'rates' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 22px' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            ★ Избранные коридоры
            <span style={{ fontSize: 12, fontWeight: 500, color: '#A0AEC0' }}>({savedList.length})</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {savedList.map(l => {
              const isUp = l.change >= 0
              return (
                <div key={l.id}
                  onClick={() => { setEquip(Object.keys(LANES).find(k => LANES[k as EquipType].some(x => x.id === l.id)) as EquipType); setSelectedLane(l); setMainTab('rates') }}
                  style={{
                    background: '#F7FAFC', borderRadius: 12, padding: '12px 16px',
                    cursor: 'pointer', border: '1.5px solid #E2E8F0',
                    transition: 'border-color .15s',
                    minWidth: 180,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#4BAED4')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                >
                  <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>
                    {l.from.split(',')[0]} → {l.to.split(',')[0]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#1A2535' }}>${l.spot.toFixed(2)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isUp ? '#48BB78' : '#FC8181' }}>
                      {isUp ? '▲' : '▼'}{Math.abs(l.change).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Sparkline data={l.trend} positive={isUp} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Main tabs ─────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, background: '#F7FAFC', borderRadius: 12, padding: 5 }}>
        {([
          { key: 'rates',    label: '📊 Ставки' },
          { key: 'seasonal', label: '📅 Сезонность' },
          { key: 'alerts',   label: `🔔 Алерты${activeAlerts > 0 ? ` (${activeAlerts})` : ''}` },
        ] as { key: MainTab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)} style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', borderRadius: 9,
            background: mainTab === t.key ? '#fff' : 'transparent',
            color: mainTab === t.key ? '#1A2535' : '#718096',
            fontWeight: mainTab === t.key ? 700 : 500, fontSize: 14,
            boxShadow: mainTab === t.key ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            transition: 'all .15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Rates tab ─────────────────────────────────────── */}
      {mainTab === 'rates' && (
        <div style={{ display: 'flex', gap: 0, background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>

          {/* Left: lanes table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Equipment selector + sort */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['Dry Van', 'Reefer', 'Flatbed', 'Step Deck'] as EquipType[]).map(e => (
                  <button key={e} onClick={() => { setEquip(e); setSelectedLane(null) }} style={{
                    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: equip === e ? '#1A2535' : '#E2E8F0',
                    color: equip === e ? '#fff' : '#718096',
                    fontWeight: equip === e ? 700 : 500, fontSize: 12, transition: 'all .15s',
                  }}>{e}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                <span style={{ color: '#718096', lineHeight: '28px' }}>Сорт:</span>
                {(['spot', 'change', 'volume'] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)} style={{
                    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
                    background: sortBy === s ? '#4BAED4' : '#E2E8F0',
                    color: sortBy === s ? '#fff' : '#718096',
                    fontWeight: sortBy === s ? 700 : 500,
                  }}>
                    {s === 'spot' ? 'Spot' : s === 'change' ? 'Тренд' : 'Объём'}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '24px 2fr 2fr 1fr 1fr 1fr 80px',
              padding: '9px 16px', fontSize: 11, fontWeight: 700, color: '#718096',
              background: '#FAFBFC', borderBottom: '1px solid #E2E8F0',
            }}>
              <div />
              <div>ОТКУДА</div>
              <div>КУДА</div>
              <div style={{ textAlign: 'right' }}>SPOT</div>
              <div style={{ textAlign: 'right' }}>КОНТРАКТ</div>
              <div style={{ textAlign: 'center' }}>ТРЕНД</div>
              <div style={{ textAlign: 'center' }}>ОБЪЁМ</div>
            </div>

            {/* Lane rows */}
            {lanes.map(l => {
              const volConf = VOLUME_COLORS[l.volume]
              const isUp    = l.change >= 0
              const isSel   = selectedLane?.id === l.id
              const isHov   = hoveredRow === l.id
              return (
                <div key={l.id}
                  onClick={() => setSelectedLane(isSel ? null : l)}
                  onMouseEnter={() => setHoveredRow(l.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'grid', gridTemplateColumns: '24px 2fr 2fr 1fr 1fr 1fr 80px',
                    padding: '12px 16px', borderBottom: '1px solid #F0F4F8',
                    background: isSel ? '#EBF8FF' : isHov ? '#F7FAFC' : '#fff',
                    alignItems: 'center', cursor: 'pointer', transition: 'background .1s',
                    borderLeft: isSel ? '3px solid #4BAED4' : '3px solid transparent',
                  }}
                >
                  <button
                    onClick={e => { e.stopPropagation(); toggleSave(l.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 0, color: savedLanes.has(l.id) ? '#F6AD55' : '#CBD5E0' }}
                    title="Избранное"
                  >
                    {savedLanes.has(l.id) ? '★' : '☆'}
                  </button>

                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A2535' }}>{l.from}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A2535' }}>
                    {l.to}
                    <span style={{ fontSize: 10, color: '#A0AEC0', marginLeft: 6 }}>{l.miles.toLocaleString()} mi</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#1A2535' }}>${l.spot.toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>per mile</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#718096' }}>${l.contract.toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0' }}>per mile</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <Sparkline data={l.trend} positive={isUp} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: isUp ? '#48BB78' : '#FC8181' }}>
                      {isUp ? '▲' : '▼'} {Math.abs(l.change).toFixed(1)}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                      background: volConf.bg, color: volConf.color,
                      borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
                    }}>
                      {VOLUME_LABELS[l.volume]}
                    </span>
                  </div>
                </div>
              )
            })}

            <div style={{ padding: '10px 16px', background: '#F7FAFC', borderTop: '1px solid #E2E8F0', fontSize: 11, color: '#A0AEC0' }}>
              Нажмите на строку для детального анализа · ★ добавить в избранное
            </div>
          </div>

          {/* Right: Detail Panel OR sidebar widgets */}
          {selectedLane ? (
            <LaneDetailPanel
              lane={selectedLane}
              equip={equip}
              saved={savedLanes.has(selectedLane.id)}
              onSave={() => toggleSave(selectedLane.id)}
              onClose={() => setSelectedLane(null)}
            />
          ) : (
            <div style={{ width: 320, borderLeft: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>Инструменты</div>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                <RateCalculator />

                {/* Hot markets */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 20px' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 14 }}>🔥 Горячие рынки</div>
                  {HOT_MARKETS.map(m => (
                    <div key={m.city} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F0F4F8' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{m.city}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{m.loads.toLocaleString()} загрузок</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.trend === 'up' ? '#48BB78' : '#FC8181' }}>
                        {m.trend === 'up' ? '▲' : '▼'} {Math.abs(m.pct)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fuel prices */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>⛽ Дизель по штатам</div>
                    <div style={{ fontSize: 11, color: '#A0AEC0' }}>Avg: <strong>${NATIONAL_AVG_DIESEL}</strong></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {FUEL_PRICES.map(f => (
                      <div key={f.state} style={{ background: '#F7FAFC', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#718096' }}>{f.state}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>${f.price.toFixed(2)}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: f.change > 0 ? '#FC8181' : '#48BB78' }}>
                            {f.change > 0 ? '▲' : '▼'} ${Math.abs(f.change).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI signal */}
                <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4BAED4', marginBottom: 8 }}>🤖 AI АНАЛИЗ РЫНКА</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', lineHeight: 1.6 }}>
                    Рынок сейчас в пользу перевозчиков — Load-to-Truck 4.2:1.
                    Лучшие возможности: <strong style={{ color: '#4BAED4' }}>CHI→DAL (+6.1%)</strong> и <strong style={{ color: '#4BAED4' }}>DET→DAL (+8.2% Flatbed)</strong>.
                    Советую брать загрузки во вторник–среду.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Seasonal tab ──────────────────────────────────── */}
      {mainTab === 'seasonal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          <SeasonalTrendsTab equip={equip} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535', marginBottom: 4 }}>Тип оборудования</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {(['Dry Van','Reefer','Flatbed','Step Deck'] as EquipType[]).map(e => (
                  <button key={e} onClick={() => setEquip(e)} style={{
                    padding: '10px 14px', borderRadius: 9, border: '1.5px solid',
                    borderColor: equip === e ? '#4BAED4' : '#E2E8F0',
                    background: equip === e ? '#EBF8FF' : '#F7FAFC',
                    color: equip === e ? '#2B6CB0' : '#718096',
                    fontWeight: equip === e ? 700 : 500, fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  }}>{e}</button>
                ))}
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4BAED4', marginBottom: 8 }}>📅 СЕЗОННЫЙ СОВЕТ</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', lineHeight: 1.6 }}>
                Для {equip} лучший период — конец Q2 / начало Q3.
                Планируйте контракты заранее, чтобы зафиксировать объём до сезонного пика.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Alerts tab ────────────────────────────────────── */}
      {mainTab === 'alerts' && (
        <AlertsTab
          alerts={alerts}
          onAdd={a => setAlerts(prev => [...prev, { ...a, id: `a${Date.now()}`, triggered: false }])}
          onDelete={id => setAlerts(prev => prev.filter(a => a.id !== id))}
          onToggle={id => setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))}
        />
      )}
    </div>
  )
}
