import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type AvailStatus = 'available' | 'soon' | 'in_transit'

type Client = {
  id: string
  name: string
  init: string
  truckId: string | null
  lane: string
  location: string
  availability: string
  status: AvailStatus
  color: string
}

type MatchedLoad = {
  id: string
  score: number
  origin: string
  destination: string
  rate: number
  miles: number
  equipment: string
  pickupDate: string
  broker: string
  reason: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Mike R.',
    init: 'MR',
    truckId: 'CG-4421',
    lane: 'Chicago, IL → Dallas, TX',
    location: 'Chicago, IL',
    availability: 'Empty in 2 days',
    status: 'soon',
    color: '#F97316',
  },
  {
    id: 'c2',
    name: 'Sergiy K.',
    init: 'SK',
    truckId: 'CG-4418',
    lane: 'Miami, FL → Atlanta, GA',
    location: 'Miami, FL',
    availability: 'Available now',
    status: 'available',
    color: '#0EA5E9',
  },
  {
    id: 'c3',
    name: 'Tom B.',
    init: 'TB',
    truckId: null,
    lane: 'Houston, TX',
    location: 'Houston, TX',
    availability: 'Available now',
    status: 'available',
    color: '#F59E0B',
  },
  {
    id: 'c4',
    name: 'Anna P.',
    init: 'AP',
    truckId: 'CG-4415',
    lane: 'Los Angeles → Sacramento',
    location: 'Los Angeles, CA',
    availability: 'Empty in 1 day',
    status: 'soon',
    color: '#8B5CF6',
  },
]

const MATCHES: Record<string, MatchedLoad[]> = {
  c1: [
    {
      id: 'LD-8812',
      score: 97,
      origin: 'Chicago, IL',
      destination: 'Dallas, TX',
      rate: 2840,
      miles: 1420,
      equipment: 'Dry Van',
      pickupDate: 'May 15',
      broker: 'TQL',
      reason: '🎯 Идеально под маршрут Chicago→Dallas · RPM выше гарантии · Прямой рейс',
    },
    {
      id: 'LD-8801',
      score: 91,
      origin: 'Chicago, IL',
      destination: 'Memphis, TN',
      rate: 1560,
      miles: 536,
      equipment: 'Dry Van',
      pickupDate: 'May 15',
      broker: 'Coyote',
      reason: '📍 Близко к текущей позиции · Надёжный брокер · Хорошая RPM',
    },
    {
      id: 'LD-8799',
      score: 84,
      origin: 'Joliet, IL',
      destination: 'Houston, TX',
      rate: 3100,
      miles: 1090,
      equipment: 'Reefer',
      pickupDate: 'May 16',
      broker: 'Echo Global',
      reason: '💰 Высокая ставка · Попутный маршрут · 23 мили до точки погрузки',
    },
    {
      id: 'LD-8790',
      score: 78,
      origin: 'Gary, IN',
      destination: 'Nashville, TN',
      rate: 1200,
      miles: 480,
      equipment: 'Dry Van',
      pickupDate: 'May 14',
      broker: 'Worldwide Express',
      reason: '⚡ Срочная погрузка · Оплата в тот же день · Близко к позиции',
    },
    {
      id: 'LD-8785',
      score: 71,
      origin: 'Chicago, IL',
      destination: 'St. Louis, MO',
      rate: 880,
      miles: 300,
      equipment: 'Flatbed',
      pickupDate: 'May 16',
      broker: 'Loadsmith',
      reason: '🔄 Короткий рейс для заполнения графика · Знакомый брокер',
    },
  ],
  c2: [
    {
      id: 'LD-8820',
      score: 95,
      origin: 'Miami, FL',
      destination: 'Atlanta, GA',
      rate: 1960,
      miles: 662,
      equipment: 'Reefer',
      pickupDate: 'May 13',
      broker: 'Coyote',
      reason: '🎯 Точное совпадение с маршрутом · Reefer в приоритете · Немедленный старт',
    },
    {
      id: 'LD-8815',
      score: 88,
      origin: 'Fort Lauderdale, FL',
      destination: 'Charlotte, NC',
      rate: 2250,
      miles: 890,
      equipment: 'Reefer',
      pickupDate: 'May 13',
      broker: 'TQL',
      reason: '💰 RPM $2.53 · Рефрижератор · Погрузка через 40 минут',
    },
    {
      id: 'LD-8808',
      score: 82,
      origin: 'Miami, FL',
      destination: 'Nashville, TN',
      rate: 2680,
      miles: 1120,
      equipment: 'Dry Van',
      pickupDate: 'May 14',
      broker: 'Echo Global',
      reason: '📈 Хорошая дальность · Возврат в нужный регион · Проверенный брокер',
    },
    {
      id: 'LD-8802',
      score: 74,
      origin: 'Hialeah, FL',
      destination: 'Birmingham, AL',
      rate: 1380,
      miles: 660,
      equipment: 'Dry Van',
      pickupDate: 'May 14',
      broker: 'Loadsmith',
      reason: '⚡ Быстрая погрузка · Надёжный получатель · 18 миль до точки',
    },
    {
      id: 'LD-8797',
      score: 68,
      origin: 'Orlando, FL',
      destination: 'Atlanta, GA',
      rate: 1140,
      miles: 440,
      equipment: 'Dry Van',
      pickupDate: 'May 15',
      broker: 'Worldwide Express',
      reason: '🔄 Запасной вариант · Попутный маршрут · Оплата Net-7',
    },
  ],
  c3: [
    {
      id: 'LD-8830',
      score: 98,
      origin: 'Houston, TX',
      destination: 'Dallas, TX',
      rate: 920,
      miles: 243,
      equipment: 'Flatbed',
      pickupDate: 'May 13',
      broker: 'Loadsmith',
      reason: '⚡ Грузовик простаивает — срочный подбор · Рядом с базой · Высокий RPM $3.78',
    },
    {
      id: 'LD-8825',
      score: 92,
      origin: 'Houston, TX',
      destination: 'San Antonio, TX',
      rate: 680,
      miles: 197,
      equipment: 'Dry Van',
      pickupDate: 'May 13',
      broker: 'TQL',
      reason: '📍 Локальный рейс · Быстрый оборот · Погрузка через 1 час',
    },
    {
      id: 'LD-8818',
      score: 85,
      origin: 'Pasadena, TX',
      destination: 'Phoenix, AZ',
      rate: 2560,
      miles: 1157,
      equipment: 'Dry Van',
      pickupDate: 'May 14',
      broker: 'Coyote',
      reason: '💰 Дальний рейс · Хорошая ставка · Возврат на West Coast',
    },
    {
      id: 'LD-8811',
      score: 76,
      origin: 'Houston, TX',
      destination: 'Austin, TX',
      rate: 486,
      miles: 162,
      equipment: 'Dry Van',
      pickupDate: 'May 13',
      broker: 'Echo Global',
      reason: '🔄 Короткий рейс · Лёгкая загрузка · Возможность взять 2 рейса за день',
    },
    {
      id: 'LD-8804',
      score: 69,
      origin: 'Baytown, TX',
      destination: 'Oklahoma City, OK',
      rate: 1340,
      miles: 500,
      equipment: 'Flatbed',
      pickupDate: 'May 14',
      broker: 'Worldwide Express',
      reason: '🏗️ Flatbed в приоритете · Надёжный брокер · Pickup в пределах 10 миль',
    },
  ],
  c4: [
    {
      id: 'LD-8840',
      score: 94,
      origin: 'Los Angeles, CA',
      destination: 'Sacramento, CA',
      rate: 1100,
      miles: 382,
      equipment: 'Reefer',
      pickupDate: 'May 14',
      broker: 'Echo Global',
      reason: '🎯 Точный маршрут LA→Sacramento · Reefer по тарифу · Прямой рейс',
    },
    {
      id: 'LD-8836',
      score: 89,
      origin: 'Los Angeles, CA',
      destination: 'Las Vegas, NV',
      rate: 840,
      miles: 280,
      equipment: 'Dry Van',
      pickupDate: 'May 14',
      broker: 'TQL',
      reason: '⚡ Быстрая погрузка · RPM $3.00 · Высокий спрос на маршруте',
    },
    {
      id: 'LD-8829',
      score: 81,
      origin: 'Long Beach, CA',
      destination: 'Phoenix, AZ',
      rate: 1540,
      miles: 370,
      equipment: 'Dry Van',
      pickupDate: 'May 15',
      broker: 'Coyote',
      reason: '💰 Выше рынка на 12% · Портовый груз · Pickup 15 миль от позиции',
    },
    {
      id: 'LD-8821',
      score: 75,
      origin: 'Burbank, CA',
      destination: 'Fresno, CA',
      rate: 760,
      miles: 220,
      equipment: 'Reefer',
      pickupDate: 'May 14',
      broker: 'Loadsmith',
      reason: '🔄 Попутный маршрут · Reefer-груз · Быстрый оборот',
    },
    {
      id: 'LD-8810',
      score: 66,
      origin: 'Anaheim, CA',
      destination: 'San Francisco, CA',
      rate: 1280,
      miles: 420,
      equipment: 'Dry Van',
      pickupDate: 'May 15',
      broker: 'Worldwide Express',
      reason: '📈 Попутный рейс · Небольшое отклонение от маршрута · Известный брокер',
    },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META: Record<AvailStatus, { label: string; color: string; bg: string }> = {
  available:  { label: 'Available now',  color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  soon:       { label: 'Soon',           color: '#D97706', bg: 'rgba(217,119,6,0.12)' },
  in_transit: { label: 'In transit',     color: '#64748B', bg: 'rgba(100,116,139,0.12)' },
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function scoreColor(score: number): { color: string; bg: string } {
  if (score >= 90) return { color: '#22C55E', bg: 'rgba(34,197,94,0.14)' }
  if (score >= 75) return { color: '#D97706', bg: 'rgba(217,119,6,0.14)' }
  return { color: '#64748B', bg: 'rgba(100,116,139,0.14)' }
}

const EQUIPMENT_ICON: Record<string, string> = {
  'Dry Van': '📦',
  'Reefer': '❄️',
  'Flatbed': '🏗️',
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIMatchPage() {
  const [selectedClientId, setSelectedClientId] = useState<string>('c1')

  const selectedClient = CLIENTS.find(c => c.id === selectedClientId)!
  const matches = MATCHES[selectedClientId] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-dark)', margin: 0, lineHeight: 1.2 }}>
            🤖 AI Load Matching
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--c-text-muted)' }}>
            Автоматический подбор грузов под каждого клиента
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 10,
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
        }}>
          <span style={{ fontSize: 12, color: '#8B5CF6', fontWeight: 700 }}>
            ✨ AI Engine Active
          </span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
            boxShadow: '0 0 6px #22C55E',
          }} />
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT: Client list ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 2px',
          }}>
            Clients ({CLIENTS.length})
          </div>

          {CLIENTS.map(client => {
            const st = STATUS_META[client.status]
            const isSelected = client.id === selectedClientId
            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: isSelected
                    ? `2px solid ${client.color}`
                    : '2px solid var(--c-border)',
                  background: isSelected
                    ? `${client.color}0d`
                    : 'var(--c-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
                    background: client.color, borderRadius: '3px 0 0 3px',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: `${client.color}22`, border: `2px solid ${client.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: client.color,
                  }}>
                    {client.init}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-dark)', lineHeight: 1.2 }}>
                      {client.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 1 }}>
                      {client.truckId ?? 'No active load'}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 6,
                    background: st.bg, color: st.color, whiteSpace: 'nowrap',
                  }}>
                    {client.status === 'available' ? '🟢' : client.status === 'soon' ? '🟡' : '⚫'} {st.label}
                  </span>
                </div>

                {/* Lane */}
                <div style={{
                  fontSize: 11, color: 'var(--c-text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span>📍</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.lane}
                  </span>
                </div>

                {/* Availability */}
                <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: st.color }}>
                  ⏰ {client.availability}
                </div>

                {/* AI match count hint */}
                {isSelected && (
                  <div style={{
                    marginTop: 8, fontSize: 10, color: '#8B5CF6', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span>🤖</span>
                    <span>{MATCHES[client.id]?.length ?? 0} грузов подобрано AI</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── RIGHT: AI Match results ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* AI explanation banner */}
          <div style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(14,165,233,0.06))',
            border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🧠</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#8B5CF6', marginBottom: 2 }}>
                AI анализирует:
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                маршрут · RPM vs гарантия · предпочтения по оборудованию · расстояние от текущей позиции · история брокеров
              </div>
            </div>
          </div>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-dark)' }}>
                Лучшие грузы для{' '}
                <span style={{ color: selectedClient.color }}>{selectedClient.name}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>
                📍 {selectedClient.location} · {selectedClient.availability}
              </div>
            </div>
            <div style={{
              fontSize: 11, color: 'var(--c-text-muted)', fontWeight: 600,
              background: 'var(--c-surface)', border: '1px solid var(--c-border)',
              padding: '5px 10px', borderRadius: 8,
            }}>
              {matches.length} результатов
            </div>
          </div>

          {/* Load cards */}
          {matches.map((load, i) => {
            const sc = scoreColor(load.score)
            const rpm = (load.rate / load.miles).toFixed(2)
            return (
              <div
                key={load.id}
                style={{
                  padding: '16px 18px',
                  borderRadius: 14,
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  position: 'relative',
                  boxShadow: i === 0 ? '0 2px 16px rgba(139,92,246,0.10)' : undefined,
                }}
              >
                {/* Top row: score + load ID + route */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Score badge */}
                  <div style={{
                    flexShrink: 0, minWidth: 72,
                    padding: '6px 10px', borderRadius: 10,
                    background: sc.bg,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${sc.color}33`,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: sc.color }}>{load.score}%</span>
                    <span style={{ fontSize: 9, color: sc.color, fontWeight: 700 }}>match</span>
                  </div>

                  {/* Route info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#4BAED4' }}>{load.id}</span>
                      <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>·</span>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 700,
                        background: 'rgba(100,116,139,0.1)', color: '#64748B',
                      }}>
                        {EQUIPMENT_ICON[load.equipment] ?? '🚛'} {load.equipment}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-dark)', lineHeight: 1.2 }}>
                      {load.origin}{' '}
                      <span style={{ color: '#8B5CF6' }}>→</span>{' '}
                      {load.destination}
                    </div>
                  </div>

                  {/* Rate block */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#22C55E' }}>{fmt(load.rate)}</div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>
                      {load.miles.toLocaleString()} mi · ${rpm}/mi
                    </div>
                  </div>
                </div>

                {/* Details row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  fontSize: 11, color: 'var(--c-text-muted)',
                  padding: '8px 10px', borderRadius: 8,
                  background: 'rgba(100,116,139,0.05)',
                }}>
                  <span>📅 Pickup: <strong style={{ color: 'var(--c-dark)' }}>{load.pickupDate}</strong></span>
                  <span style={{ color: 'var(--c-border)' }}>|</span>
                  <span>🏢 Broker: <strong style={{ color: 'var(--c-dark)' }}>{load.broker}</strong></span>
                </div>

                {/* AI reasoning */}
                <div style={{
                  fontSize: 11, color: '#8B5CF6', fontWeight: 600,
                  padding: '7px 12px', borderRadius: 8,
                  background: 'rgba(139,92,246,0.07)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  lineHeight: 1.5,
                }}>
                  {load.reason}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{
                      flex: 1, padding: '9px 14px', borderRadius: 9,
                      border: '1.5px solid var(--c-border)',
                      background: 'var(--c-surface)', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, color: 'var(--c-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}
                    onClick={() => {}}
                  >
                    📞 Call Broker
                  </button>
                  <button
                    style={{
                      flex: 1, padding: '9px 14px', borderRadius: 9,
                      border: 'none',
                      background: i === 0
                        ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                        : 'linear-gradient(135deg, #22C55E, #16A34A)',
                      cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      boxShadow: i === 0 ? '0 3px 10px rgba(139,92,246,0.35)' : '0 3px 10px rgba(34,197,94,0.25)',
                    }}
                    onClick={() => {}}
                  >
                    ✅ Book Load
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
