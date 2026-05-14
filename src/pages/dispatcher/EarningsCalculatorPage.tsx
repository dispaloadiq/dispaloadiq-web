import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Preset = {
  label: string
  trucks: number
  rpm: number
  miles: number
  loadsPerWeek: number
  commission: number
  experienced: boolean
  highlight?: boolean
}

type TabId = 'scenarios' | 'growth' | 'expenses'

// ── Presets ───────────────────────────────────────────────────────────────────
const PRESETS: Preset[] = [
  {
    label: 'Начинающий',
    trucks: 2,
    rpm: 2.5,
    miles: 500,
    loadsPerWeek: 2,
    commission: 6,
    experienced: false,
  },
  {
    label: 'Стабильный',
    trucks: 5,
    rpm: 2.8,
    miles: 600,
    loadsPerWeek: 2,
    commission: 8,
    experienced: true,
  },
  {
    label: 'Профи',
    trucks: 10,
    rpm: 3.2,
    miles: 700,
    loadsPerWeek: 3,
    commission: 10,
    experienced: true,
  },
  {
    label: 'Топ-диспетчер',
    trucks: 18,
    rpm: 3.5,
    miles: 800,
    loadsPerWeek: 3,
    commission: 12,
    experienced: true,
    highlight: true,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

function calcIncome(
  trucks: number,
  rpm: number,
  miles: number,
  loadsPerWeek: number,
  commissionPct: number,
  experienced: boolean
) {
  const confidenceMultiplier = experienced ? 1.0 : 0.65
  const weekly_per_truck = rpm * miles * loadsPerWeek
  const monthly_per_truck = weekly_per_truck * 4.33
  const total_monthly_revenue = monthly_per_truck * trucks
  const gross_commission = total_monthly_revenue * (commissionPct / 100)
  const platform_fee = gross_commission * 0.08
  const net_income = (gross_commission - platform_fee - 49) * confidenceMultiplier
  const annual_income = net_income * 12
  return {
    weekly_per_truck,
    monthly_per_truck,
    total_monthly_revenue,
    gross_commission,
    platform_fee,
    net_income,
    annual_income,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SliderRow({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string
  value: number
  displayValue: string
  min: number
  max: number
  step: number
  minLabel: string
  maxLabel: string
  onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--c-dark)', fontWeight: 500 }}>{label}</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--c-accent)',
            background: 'rgba(99,102,241,0.1)',
            padding: '2px 10px',
            borderRadius: 12,
          }}
        >
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--c-accent)', cursor: 'pointer' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 2,
        }}
      >
        <span style={{ fontSize: 11, color: '#888' }}>{minLabel}</span>
        <span style={{ fontSize: 11, color: '#888' }}>{maxLabel}</span>
      </div>
    </div>
  )
}

function BreakdownRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: '1px solid var(--c-border)',
        background: highlight ? 'rgba(34,197,94,0.07)' : 'transparent',
        borderRadius: highlight ? 6 : 0,
        paddingLeft: highlight ? 8 : 0,
        paddingRight: highlight ? 8 : 0,
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: bold ? 'var(--c-dark)' : '#555',
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: bold ? 700 : 500,
          color: highlight ? '#22c55e' : 'var(--c-dark)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function ComparisonPill({
  label,
  benchmark,
  netIncome,
}: {
  label: string
  benchmark: number
  netIncome: number
}) {
  const beats = netIncome > benchmark
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 8,
        background: beats ? 'rgba(34,197,94,0.1)' : 'rgba(150,150,150,0.1)',
        border: `1px solid ${beats ? 'rgba(34,197,94,0.3)' : 'rgba(150,150,150,0.2)'}`,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: beats ? '#22c55e' : '#888',
          background: beats ? 'rgba(34,197,94,0.15)' : 'rgba(150,150,150,0.15)',
          padding: '2px 8px',
          borderRadius: 10,
        }}
      >
        {beats ? `+$${fmt(netIncome - benchmark)}/мес` : `−$${fmt(benchmark - netIncome)}/мес`}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EarningsCalculatorPage() {
  // Slider state
  const [trucks, setTrucks] = useState(5)
  const [rpm, setRpm] = useState(2.8)
  const [miles, setMiles] = useState(600)
  const [loadsPerWeek, setLoadsPerWeek] = useState(2)
  const [commissionPct, setCommissionPct] = useState(8)
  const [experienced, setExperienced] = useState(true)

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('scenarios')
  const [activePreset, setActivePreset] = useState<number | null>(1)

  // Apply preset
  function applyPreset(idx: number) {
    const p = PRESETS[idx]
    setTrucks(p.trucks)
    setRpm(p.rpm)
    setMiles(p.miles)
    setLoadsPerWeek(p.loadsPerWeek)
    setCommissionPct(p.commission)
    setExperienced(p.experienced)
    setActivePreset(idx)
  }

  // Computed
  const calc = calcIncome(trucks, rpm, miles, loadsPerWeek, commissionPct, experienced)

  // Growth chart data (6 points, 20% growth every 6 months)
  const growthPoints = [1, 3, 6, 12, 18, 24].map((month, i) => {
    const periodIndex = Math.floor(i / 2)
    const value = calc.net_income * Math.pow(1.2, periodIndex)
    return { label: `Мес ${month}`, value }
  })
  const maxGrowth = Math.max(...growthPoints.map((p) => p.value))

  const EXPENSES = [
    { label: 'Платформа DispaLoadIQ', value: 49 },
    { label: 'Интернет', value: 50 },
    { label: 'Телефон', value: 30 },
    { label: 'Инструменты / ПО', value: 20 },
  ]
  const totalExpenses = EXPENSES.reduce((a, b) => a + b.value, 0)
  const netAfterExpenses = calc.net_income - totalExpenses

  // Tab labels
  const TABS: { id: TabId; label: string }[] = [
    { id: 'scenarios', label: 'Сценарии' },
    { id: 'growth', label: 'График роста' },
    { id: 'expenses', label: 'Расходы' },
  ]

  return (
    <div style={{ background: 'var(--c-surface)', minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
          padding: '56px 32px 48px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.2)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: 20,
            padding: '4px 16px',
            fontSize: 12,
            color: '#a5b4fc',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Калькулятор доходов
        </div>
        <h1
          style={{
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}
        >
          Сколько ты можешь заработать
          <br />
          <span style={{ color: '#22c55e' }}>как диспетчер?</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: '#94a3b8',
            maxWidth: 560,
            margin: '0 auto 24px',
            lineHeight: 1.6,
          }}
        >
          Независимые диспетчеры зарабатывают от{' '}
          <strong style={{ color: '#fff' }}>$3,000</strong> до{' '}
          <strong style={{ color: '#22c55e' }}>$15,000 в месяц</strong> — без дальнобойной кабины и
          без босса. Рассчитай свой потенциал прямо сейчас.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {['Работай из дома', 'Свободный график', 'Неограниченный доход'].map((tag) => (
            <span
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 13,
                color: '#cbd5e1',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {/* ── LEFT: Inputs ── */}
          <div style={{ flex: '0 0 55%', minWidth: 300 }}>
            <div
              className="card"
              style={{ padding: 28, borderRadius: 16, marginBottom: 0 }}
            >
              <h2 className="section-title" style={{ marginBottom: 24, fontSize: 17 }}>
                Настройте параметры
              </h2>

              <SliderRow
                label="Кол-во грузовиков"
                value={trucks}
                displayValue={`${trucks} грузовиков`}
                min={1}
                max={20}
                step={1}
                minLabel="1"
                maxLabel="20"
                onChange={(v) => { setTrucks(v); setActivePreset(null) }}
              />

              <SliderRow
                label="Средний RPM ($/миля)"
                value={rpm}
                displayValue={`$${rpm.toFixed(2)}`}
                min={1.5}
                max={4.0}
                step={0.05}
                minLabel="$1.50"
                maxLabel="$4.00"
                onChange={(v) => { setRpm(v); setActivePreset(null) }}
              />

              <SliderRow
                label="Средний пробег груза (миль)"
                value={miles}
                displayValue={`${miles.toLocaleString()} mi`}
                min={200}
                max={2000}
                step={50}
                minLabel="200 mi"
                maxLabel="2,000 mi"
                onChange={(v) => { setMiles(v); setActivePreset(null) }}
              />

              <SliderRow
                label="Грузов в неделю (на 1 грузовик)"
                value={loadsPerWeek}
                displayValue={`${loadsPerWeek} грузов`}
                min={1}
                max={5}
                step={1}
                minLabel="1"
                maxLabel="5"
                onChange={(v) => { setLoadsPerWeek(v); setActivePreset(null) }}
              />

              <SliderRow
                label="Комиссия диспетчера (%)"
                value={commissionPct}
                displayValue={`${commissionPct}%`}
                min={5}
                max={15}
                step={0.5}
                minLabel="5%"
                maxLabel="15%"
                onChange={(v) => { setCommissionPct(v); setActivePreset(null) }}
              />

              {/* Experience toggle */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-dark)', marginBottom: 10 }}>
                  Уровень опыта
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  {[
                    { label: 'Начинающий', value: false, desc: '×0.65' },
                    { label: 'Опытный', value: true, desc: '×1.0' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className="btn"
                      onClick={() => { setExperienced(opt.value); setActivePreset(null) }}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        border: experienced === opt.value
                          ? '2px solid var(--c-accent)'
                          : '2px solid var(--c-border)',
                        borderRadius: 10,
                        background: experienced === opt.value
                          ? 'rgba(99,102,241,0.1)'
                          : 'transparent',
                        color: experienced === opt.value ? 'var(--c-accent)' : '#777',
                        fontWeight: experienced === opt.value ? 700 : 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginTop: 2,
                        }}
                      >
                        {opt.desc} к доходу
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div style={{ flex: '0 0 calc(45% - 24px)', minWidth: 280, position: 'sticky', top: 24 }}>
            <div
              className="card"
              style={{
                padding: 28,
                borderRadius: 16,
                border: '2px solid rgba(34,197,94,0.3)',
                background: 'linear-gradient(145deg, var(--c-surface) 0%, rgba(34,197,94,0.03) 100%)',
              }}
            >
              {/* Main income figure */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#888',
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Чистый доход в месяц
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: '#22c55e',
                    lineHeight: 1,
                    letterSpacing: '-1px',
                  }}
                >
                  ${fmt(Math.max(0, calc.net_income))}
                </div>
                <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                  {experienced ? 'опытный диспетчер' : 'начинающий диспетчер'}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--c-border)', margin: '16px 0' }} />

              {/* Breakdown */}
              <div>
                <BreakdownRow
                  label="Доход на 1 грузовик/нед"
                  value={`$${fmt(calc.weekly_per_truck)}`}
                />
                <BreakdownRow
                  label="Доход на 1 грузовик/мес"
                  value={`$${fmt(calc.monthly_per_truck)}`}
                />
                <BreakdownRow
                  label="Общий валовой доход"
                  value={`$${fmt(calc.total_monthly_revenue)}`}
                />
                <BreakdownRow
                  label={`Комиссия диспетчера (${commissionPct}%)`}
                  value={`$${fmt(calc.gross_commission)}`}
                  bold
                />
                <BreakdownRow
                  label="Комиссия платформы (8%)"
                  value={`−$${fmt(calc.platform_fee)}`}
                />
                <BreakdownRow
                  label="Чистый доход"
                  value={`$${fmt(Math.max(0, calc.net_income))}`}
                  bold
                  highlight
                />
                <BreakdownRow
                  label="Годовой доход"
                  value={`$${fmt(Math.max(0, calc.annual_income))}`}
                  bold
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--c-border)', margin: '16px 0' }} />

              {/* Comparison */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                Сравнение
              </div>
              <ComparisonPill
                label="vs. водитель-дальнобойщик ($5,200/мес)"
                benchmark={5200}
                netIncome={Math.max(0, calc.net_income)}
              />
              <ComparisonPill
                label="vs. средняя зарплата в США ($4,500/мес)"
                benchmark={4500}
                netIncome={Math.max(0, calc.net_income)}
              />
            </div>
          </div>
        </div>

        {/* ── Tabs section ── */}
        <div style={{ marginTop: 32 }}>
          {/* Tab bar */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              borderBottom: '2px solid var(--c-border)',
              marginBottom: 24,
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className="btn"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: activeTab === tab.id
                    ? '2px solid var(--c-accent)'
                    : '2px solid transparent',
                  background: 'transparent',
                  color: activeTab === tab.id ? 'var(--c-accent)' : '#888',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginBottom: -2,
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Scenarios */}
          {activeTab === 'scenarios' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {PRESETS.map((preset, idx) => {
                const presetCalc = calcIncome(
                  preset.trucks,
                  preset.rpm,
                  preset.miles,
                  preset.loadsPerWeek,
                  preset.commission,
                  preset.experienced
                )
                const isActive = activePreset === idx
                return (
                  <div
                    key={preset.label}
                    className="card"
                    onClick={() => applyPreset(idx)}
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      border: isActive
                        ? '2px solid var(--c-accent)'
                        : preset.highlight
                        ? '2px solid rgba(34,197,94,0.3)'
                        : '2px solid var(--c-border)',
                      cursor: 'pointer',
                      background: isActive
                        ? 'rgba(99,102,241,0.07)'
                        : preset.highlight
                        ? 'rgba(34,197,94,0.04)'
                        : 'var(--c-surface)',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    {preset.highlight && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -10,
                          right: 12,
                          background: '#22c55e',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 8,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Максимум
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: isActive ? 'var(--c-accent)' : 'var(--c-dark)',
                        marginBottom: 12,
                      }}
                    >
                      {preset.label}
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: '#22c55e',
                        marginBottom: 12,
                      }}
                    >
                      ${fmt(Math.max(0, presetCalc.net_income))}
                      <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>/мес</span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px 0',
                        fontSize: 12,
                        color: '#666',
                      }}
                    >
                      <span>Грузовиков:</span>
                      <span style={{ fontWeight: 600, color: 'var(--c-dark)' }}>{preset.trucks}</span>
                      <span>RPM:</span>
                      <span style={{ fontWeight: 600, color: 'var(--c-dark)' }}>${preset.rpm.toFixed(2)}</span>
                      <span>Пробег:</span>
                      <span style={{ fontWeight: 600, color: 'var(--c-dark)' }}>{preset.miles} mi</span>
                      <span>Комиссия:</span>
                      <span style={{ fontWeight: 600, color: 'var(--c-dark)' }}>{preset.commission}%</span>
                      <span>Уровень:</span>
                      <span style={{ fontWeight: 600, color: preset.experienced ? '#22c55e' : '#f59e0b' }}>
                        {preset.experienced ? 'Опытный' : 'Начинающий'}
                      </span>
                    </div>
                    {isActive && (
                      <div
                        style={{
                          marginTop: 12,
                          fontSize: 12,
                          color: 'var(--c-accent)',
                          fontWeight: 600,
                          textAlign: 'center',
                        }}
                      >
                        Применено
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab: Growth chart */}
          {activeTab === 'growth' && (
            <div className="card" style={{ padding: 28, borderRadius: 16 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--c-dark)',
                  marginBottom: 8,
                }}
              >
                Прогноз роста дохода
              </h3>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>
                Прогноз на 24 месяца при условии 20% роста каждые 6 месяцев. Начальный доход: $
                {fmt(Math.max(0, calc.net_income))}/мес
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 12,
                  height: 200,
                  padding: '0 8px',
                }}
              >
                {growthPoints.map((point) => {
                  const barHeight = maxGrowth > 0 ? (point.value / maxGrowth) * 160 : 10
                  return (
                    <div
                      key={point.label}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#22c55e',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ${fmt(point.value)}
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(barHeight, 8)}px`,
                          background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.4s ease',
                          boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                        }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: '#888',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {point.label}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                style={{
                  marginTop: 24,
                  padding: '14px 16px',
                  background: 'rgba(34,197,94,0.08)',
                  borderRadius: 10,
                  border: '1px solid rgba(34,197,94,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, color: '#555' }}>Через 2 года:</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>
                  ${fmt(Math.max(0, growthPoints[5].value))}/мес
                </span>
                <span style={{ fontSize: 13, color: '#888' }}>
                  = ${fmt(Math.max(0, growthPoints[5].value * 12))}/год
                </span>
              </div>
            </div>
          )}

          {/* Tab: Expenses */}
          {activeTab === 'expenses' && (
            <div className="card" style={{ padding: 28, borderRadius: 16 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--c-dark)',
                  marginBottom: 8,
                }}
              >
                Ежемесячные расходы диспетчера
              </h3>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
                Прозрачная разбивка всех затрат при работе через платформу DispaLoadIQ
              </p>

              <div style={{ maxWidth: 520 }}>
                {EXPENSES.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid var(--c-border)',
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#555' }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-dark)' }}>
                      ${item.value}/мес
                    </span>
                  </div>
                ))}

                {/* Total row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '2px solid var(--c-border)',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-dark)' }}>
                    Итого расходы
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>
                    −${totalExpenses}/мес
                  </span>
                </div>

                {/* Net result */}
                <div
                  style={{
                    marginTop: 20,
                    padding: '20px',
                    borderRadius: 12,
                    background: netAfterExpenses > 0
                      ? 'rgba(34,197,94,0.08)'
                      : 'rgba(239,68,68,0.08)',
                    border: `2px solid ${netAfterExpenses > 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                      Чистый доход после всех расходов
                    </div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      ${fmt(Math.max(0, calc.net_income))} − ${totalExpenses}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: netAfterExpenses > 0 ? '#22c55e' : '#ef4444',
                    }}
                  >
                    ${fmt(Math.max(0, netAfterExpenses))}/мес
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: '#aaa',
                    marginTop: 16,
                    lineHeight: 1.6,
                  }}
                >
                  * Расчёт является приблизительным. Фактические расходы могут варьироваться в зависимости
                  от вашего региона и выбранных инструментов. Комиссия платформы уже учтена в расчёте
                  чистого дохода выше.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── CTA ── */}
        <div
          style={{
            marginTop: 40,
            padding: '36px 32px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 12,
            }}
          >
            Готов зарабатывать{' '}
            <span style={{ color: '#22c55e' }}>${fmt(Math.max(0, calc.net_income))}/мес</span>?
          </h3>
          <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 24 }}>
            Начни диспетчерскую карьеру прямо сейчас — зарегистрируйся за 2 минуты
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 10,
              }}
            >
              Начать бесплатно
            </button>
            <button
              className="btn"
              style={{
                padding: '14px 24px',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#cbd5e1',
                background: 'transparent',
              }}
            >
              Посмотреть демо
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
