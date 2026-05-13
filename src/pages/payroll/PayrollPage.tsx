import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type PayTab = 'current' | 'history' | 'ytd' | 'settings'

interface Driver {
  id: number
  name: string
  unit: string
  payType: 'per-mile' | 'percentage'
  rate: string
  rateNum: number
  loads: number
  miles: number
  gross: number
  fuelAdv: number
  escrow: number
  bonus: number
  other: number
  net: number
  status: 'pending' | 'paid' | 'processing'
  history: number[]      // last 6 periods net pay
  ytdMiles: number
  ytdLoads: number
  ytdGross: number
  ytdNet: number
}

interface HistoryRecord {
  period: string
  total: number
  drivers: number
  status: 'paid'
  date: string
  breakdown: { name: string; net: number }[]
}

// ── Data ──────────────────────────────────────────────────────────────────────
const PERIODS = [
  'Current (May 1–15, 2026)',
  'Apr 16–30, 2026',
  'Apr 1–15, 2026',
  'Mar 16–31, 2026',
  'Mar 1–15, 2026',
]

const DRIVERS: Driver[] = [
  {
    id: 1, name: 'James Carter',   unit: 'Unit 03', payType: 'per-mile',   rate: '$0.58/mi', rateNum: 0.58,
    loads: 4, miles: 2_840, gross: 1_647, fuelAdv: 200, escrow: 100, bonus: 150, other: 47, net: 1_450, status: 'pending',
    history: [1_100, 1_250, 1_180, 1_320, 1_400, 1_450],
    ytdMiles: 32_400, ytdLoads: 44, ytdGross: 18_792, ytdNet: 15_800,
  },
  {
    id: 2, name: 'Mike Rodriguez', unit: 'Unit 01', payType: 'per-mile',   rate: '$0.55/mi', rateNum: 0.55,
    loads: 3, miles: 2_120, gross: 1_166, fuelAdv: 150, escrow: 100, bonus: 0, other: 16, net: 900, status: 'pending',
    history: [820, 850, 900, 875, 910, 900],
    ytdMiles: 26_100, ytdLoads: 34, ytdGross: 14_355, ytdNet: 10_900,
  },
  {
    id: 3, name: 'Anna Perez',     unit: 'Unit 02', payType: 'percentage', rate: '28%', rateNum: 0.28,
    loads: 2, miles: 1_480, gross: 1_008, fuelAdv: 0, escrow: 100, bonus: 200, other: 8, net: 1_100, status: 'paid',
    history: [780, 820, 900, 950, 1_000, 1_100],
    ytdMiles: 18_200, ytdLoads: 22, ytdGross: 11_800, ytdNet: 9_600,
  },
  {
    id: 4, name: 'Tony Marshall',  unit: 'Unit 05', payType: 'per-mile',   rate: '$0.52/mi', rateNum: 0.52,
    loads: 1, miles: 640, gross: 333, fuelAdv: 0, escrow: 50, bonus: 0, other: 3, net: 280, status: 'processing',
    history: [260, 290, 270, 300, 285, 280],
    ytdMiles: 8_400, ytdLoads: 11, ytdGross: 4_368, ytdNet: 3_400,
  },
  {
    id: 5, name: 'Carlos Vega',    unit: 'Unit 07', payType: 'percentage', rate: '25%', rateNum: 0.25,
    loads: 3, miles: 2_200, gross: 1_320, fuelAdv: 100, escrow: 100, bonus: 0, other: 20, net: 1_100, status: 'pending',
    history: [900, 950, 1_000, 980, 1_050, 1_100],
    ytdMiles: 27_800, ytdLoads: 36, ytdGross: 16_600, ytdNet: 12_400,
  },
  {
    id: 6, name: 'Lisa Thompson',  unit: 'Unit 04', payType: 'per-mile',   rate: '$0.60/mi', rateNum: 0.60,
    loads: 5, miles: 3_100, gross: 1_860, fuelAdv: 0, escrow: 100, bonus: 300, other: 60, net: 2_000, status: 'paid',
    history: [1_400, 1_500, 1_600, 1_700, 1_850, 2_000],
    ytdMiles: 38_200, ytdLoads: 58, ytdGross: 22_920, ytdNet: 18_400,
  },
]

const HISTORY_DATA: HistoryRecord[] = [
  {
    period: 'Apr 16–30, 2026', total: 7_230, drivers: 6, status: 'paid', date: 'Apr 30, 2026',
    breakdown: [
      { name: 'James Carter', net: 1_400 }, { name: 'Mike Rodriguez', net: 910 },
      { name: 'Anna Perez', net: 1_000 }, { name: 'Tony Marshall', net: 285 },
      { name: 'Carlos Vega', net: 1_050 }, { name: 'Lisa Thompson', net: 1_585 },
    ],
  },
  {
    period: 'Apr 1–15, 2026', total: 6_950, drivers: 6, status: 'paid', date: 'Apr 15, 2026',
    breakdown: [
      { name: 'James Carter', net: 1_320 }, { name: 'Mike Rodriguez', net: 875 },
      { name: 'Anna Perez', net: 950 }, { name: 'Tony Marshall', net: 300 },
      { name: 'Carlos Vega', net: 980 }, { name: 'Lisa Thompson', net: 1_525 },
    ],
  },
  {
    period: 'Mar 16–31, 2026', total: 6_480, drivers: 6, status: 'paid', date: 'Mar 31, 2026',
    breakdown: [
      { name: 'James Carter', net: 1_180 }, { name: 'Mike Rodriguez', net: 900 },
      { name: 'Anna Perez', net: 900 }, { name: 'Tony Marshall', net: 270 },
      { name: 'Carlos Vega', net: 1_000 }, { name: 'Lisa Thompson', net: 1_230 },
    ],
  },
  {
    period: 'Mar 1–15, 2026', total: 5_620, drivers: 5, status: 'paid', date: 'Mar 15, 2026',
    breakdown: [
      { name: 'James Carter', net: 1_100 }, { name: 'Mike Rodriguez', net: 820 },
      { name: 'Anna Perez', net: 780 }, { name: 'Carlos Vega', net: 920 },
      { name: 'Lisa Thompson', net: 1_000 },
    ],
  },
]

const STATUS_CFG = {
  pending:    { label: 'Ожидает',   color: '#D97706', bg: '#FFFBEB' },
  paid:       { label: 'Выплачено', color: '#38C770', bg: '#F0FFF4' },
  processing: { label: 'В работе', color: '#4BAED4', bg: '#EBF8FF' },
}

const PERIOD_LABELS = ['P-5','P-4','P-3','P-2','P-1','Текущий']

// ── Mini sparkline ─────────────────────────────────────────────────────────────
function EarningsSparkline({ data }: { data: number[] }) {
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const w = 70, h = 24, p = 2
  const pts = data.map((v, i) => {
    const x = p + (i / (data.length - 1)) * (w - p * 2)
    const y = h - p - ((v - min) / range) * (h - p * 2)
    return `${x},${y}`
  }).join(' ')
  const isUp = data[data.length - 1] >= data[0]
  const color = isUp ? '#48BB78' : '#FC8181'
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = data[data.length - 1]
        const x = w - p
        const y = h - p - ((last - min) / range) * (h - p * 2)
        return <circle cx={x} cy={y} r={3} fill={color} />
      })()}
    </svg>
  )
}

// ── Pay period bar chart ──────────────────────────────────────────────────────
function DriverHistoryChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
        {data.map((v, i) => {
          const isLast = i === data.length - 1
          const h = Math.max(8, (v / max) * 75)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ fontSize: 9, color: isLast ? '#1A2535' : '#A0AEC0', fontWeight: 700 }}>${Math.round(v / 100) * 100 === v ? v : v}</div>
              <div style={{
                width: '100%', height: h,
                background: isLast ? '#4BAED4' : '#CBD5E0',
                borderRadius: '4px 4px 0 0',
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {PERIOD_LABELS.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: i === 5 ? '#4BAED4' : '#A0AEC0', fontWeight: i === 5 ? 700 : 400 }}>{l}</div>
        ))}
      </div>
    </div>
  )
}

// ── Driver detail panel ───────────────────────────────────────────────────────
function DriverDetailPanel({
  driver, period, onPayStub, onClose,
}: {
  driver: Driver; period: string
  onPayStub: () => void; onClose: () => void
}) {
  const [advAmt, setAdvAmt] = useState(200)
  const [showAdv, setShowAdv] = useState(false)
  const totalDeduct = driver.fuelAdv + driver.escrow + driver.other
  const effRpm = (driver.net / driver.miles).toFixed(2)
  const deductPct = (totalDeduct / driver.gross * 100).toFixed(0)

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', height: 'fit-content',
    }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#4BAED4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800, color: '#fff',
            }}>{driver.name.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>{driver.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
                {driver.unit} · {driver.payType === 'per-mile' ? driver.rate : `${driver.rate} of gross`}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, width: 32, height: 32, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#4BAED4' }}>${driver.net.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Net Pay</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#68D391' }}>${driver.gross.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Gross</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{driver.loads}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Loads</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>{driver.miles.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>Мили</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Pay breakdown bars */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#718096', marginBottom: 8 }}>РАСПРЕДЕЛЕНИЕ ВЫПЛАТ</div>
          {[
            { label: `Заработок (${driver.miles.toLocaleString()} mi)`, amount: driver.gross, pct: 100, color: '#48BB78' },
            { label: `Топливо аванс`, amount: driver.fuelAdv, pct: driver.fuelAdv / driver.gross * 100, color: '#FC8181' },
            { label: 'Эскроу', amount: driver.escrow, pct: driver.escrow / driver.gross * 100, color: '#F6AD55' },
            ...(driver.bonus > 0 ? [{ label: '🎯 Бонус', amount: driver.bonus, pct: driver.bonus / driver.gross * 100, color: '#9F7AEA' }] : []),
            ...(driver.other > 0 ? [{ label: 'Прочее', amount: driver.other, pct: driver.other / driver.gross * 100, color: '#CBD5E0' }] : []),
          ].map(r => (
            <div key={r.label} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#718096' }}>{r.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1A2535' }}>
                  {r.label.startsWith('Заработок') || r.label.startsWith('🎯') ? '+' : '-'}${r.amount.toLocaleString()}
                </span>
              </div>
              <div style={{ height: 6, background: '#F0F4F8', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${Math.min(100, r.pct)}%`, background: r.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 10, borderTop: '2px solid #1A2535' }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>Net Pay</span>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#4BAED4' }}>${driver.net.toLocaleString()}</span>
          </div>
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Effective RPM',  value: `$${effRpm}`, color: parseFloat(effRpm) >= 0.45 ? '#48BB78' : '#FC8181' },
            { label: 'Вычеты',         value: `${deductPct}%`, color: '#F6AD55' },
            { label: 'YTD Miles',      value: driver.ytdMiles.toLocaleString(), color: '#4BAED4' },
            { label: 'YTD Net',        value: `$${(driver.ytdNet / 1000).toFixed(1)}k`, color: '#9F7AEA' },
          ].map(s => (
            <div key={s.label} style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* History chart */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#718096', marginBottom: 8 }}>ИСТОРИЯ ВЫПЛАТ (6 периодов)</div>
          <DriverHistoryChart data={driver.history} />
        </div>

        {/* Fuel advance */}
        {showAdv && (
          <div style={{ background: '#FFFBEB', borderRadius: 10, padding: '14px 16px', border: '1px solid #F6E05E' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#D97706', marginBottom: 10 }}>⛽ Выдать аванс на топливо</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={advAmt} onChange={e => setAdvAmt(+e.target.value)}
                style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #F6E05E', borderRadius: 8, fontSize: 14 }} />
              <button style={{ background: '#D97706', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                Выдать ${advAmt}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onPayStub} style={{ padding: '10px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            📄 Просмотр Pay Stub
          </button>
          {driver.status === 'pending' && (
            <button style={{ padding: '10px', borderRadius: 10, background: '#38C770', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              ✓ Подтвердить и выплатить
            </button>
          )}
          <button onClick={() => setShowAdv(s => !s)} style={{ padding: '10px', borderRadius: 10, background: '#FFFBEB', color: '#D97706', border: '1px solid #F6E05E', fontWeight: 600, cursor: 'pointer' }}>
            ⛽ {showAdv ? 'Скрыть' : 'Аванс на топливо'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pay Stub Modal ────────────────────────────────────────────────────────────
function PayStubModal({ driver, period, onClose }: { driver: Driver; period: string; onClose: () => void }) {
  const totalDeduct = driver.fuelAdv + driver.escrow + driver.other

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>💼 Pay Stub</div>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>{period}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A0AEC0' }}>✕</button>
        </div>

        <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', borderRadius: 14, padding: '18px 22px', marginTop: 16, marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4BAED4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>{driver.name.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 16 }}>{driver.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{driver.unit} · {driver.payType === 'per-mile' ? driver.rate : `${driver.rate} of gross`}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Net Pay</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#4BAED4' }}>${driver.net.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Earnings</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F4F8', fontSize: 14 }}>
            <span style={{ color: '#2D3748' }}>
              {driver.payType === 'per-mile'
                ? `${driver.miles.toLocaleString()} miles × ${driver.rate}`
                : `${driver.rate} × $${(driver.gross / driver.rateNum).toFixed(0)} gross revenue`}
            </span>
            <span style={{ fontWeight: 700, color: '#38C770' }}>${driver.gross.toLocaleString()}</span>
          </div>
          {driver.bonus > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F4F8', fontSize: 14 }}>
              <span style={{ color: '#2D3748' }}>🎯 Performance Bonus</span>
              <span style={{ fontWeight: 700, color: '#9F7AEA' }}>+${driver.bonus}</span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Deductions</div>
          {[
            driver.fuelAdv > 0 && { label: 'Fuel Advance',      amt: driver.fuelAdv },
            { label: 'Escrow / Safety Fund',                      amt: driver.escrow },
            driver.other > 0 && { label: 'Other Deductions',     amt: driver.other },
          ].filter(Boolean).map((r: any, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F4F8', fontSize: 14 }}>
              <span style={{ color: '#2D3748' }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: '#EF4444' }}>-${r.amt.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid #1A2535', fontSize: 16, marginBottom: 20 }}>
          <span style={{ fontWeight: 800 }}>Net Pay</span>
          <span style={{ fontWeight: 900, color: '#4BAED4', fontSize: 22 }}>${driver.net.toLocaleString()}</span>
        </div>

        <div style={{ background: '#F7FAFC', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Loads', value: String(driver.loads) },
            { label: 'Miles', value: driver.miles.toLocaleString() },
            { label: 'Pay/Mile', value: `$${(driver.net / driver.miles).toFixed(2)}` },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1A2535' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#A0AEC0' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            📧 Email Pay Stub
          </button>
          <button style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#fff', color: '#718096', border: '1.5px solid #E2E8F0', fontWeight: 600, cursor: 'pointer' }}>
            📥 Скачать PDF
          </button>
        </div>
      </div>
    </div>
  )
}

// ── YTD Analytics ─────────────────────────────────────────────────────────────
function YTDTab() {
  const maxYtd = Math.max(...DRIVERS.map(d => d.ytdNet))
  const totalYtdNet   = DRIVERS.reduce((s, d) => s + d.ytdNet, 0)
  const totalYtdGross = DRIVERS.reduce((s, d) => s + d.ytdGross, 0)
  const totalYtdMiles = DRIVERS.reduce((s, d) => s + d.ytdMiles, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'YTD Payroll',   value: `$${(totalYtdNet / 1000).toFixed(0)}k`,   color: '#4BAED4', icon: '💰' },
          { label: 'YTD Gross Rev', value: `$${(totalYtdGross / 1000).toFixed(0)}k`, color: '#48BB78', icon: '📈' },
          { label: 'YTD Miles',     value: `${(totalYtdMiles / 1000).toFixed(0)}k`,  color: '#9F7AEA', icon: '🛣' },
          { label: 'Avg Net/Driver',value: `$${Math.round(totalYtdNet / DRIVERS.length / 1000)}k`, color: '#F6AD55', icon: '👤' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* YTD per-driver bar chart */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '20px 24px' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 18 }}>
          YTD Выплаты по водителям
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...DRIVERS].sort((a, b) => b.ytdNet - a.ytdNet).map((d, i) => {
            const pct = (d.ytdNet / maxYtd) * 100
            const colors = ['#4BAED4','#48BB78','#9F7AEA','#F6AD55','#FC8181','#68D391']
            return (
              <div key={d.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i] ? '#1A2535' : '#1A2535' }}>
                      {['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][i]}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{d.name}</span>
                    <span style={{ fontSize: 11, color: '#A0AEC0' }}>{d.unit}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>${d.ytdNet.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: '#A0AEC0', marginLeft: 8 }}>{d.ytdLoads} loads · {d.ytdMiles.toLocaleString()} mi</span>
                  </div>
                </div>
                <div style={{ height: 10, background: '#F0F4F8', borderRadius: 5 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 5, transition: 'width .4s' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* YTD detail table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC', fontWeight: 700, fontSize: 14, color: '#1A2535' }}>
          YTD Детализация
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFBFC' }}>
              {['Водитель','Юнит','YTD Miles','YTD Loads','YTD Gross','YTD Net','Маржа'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: h === 'Водитель' ? 'left' : 'right', color: '#718096', fontWeight: 700, fontSize: 11, borderBottom: '1px solid #E2E8F0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...DRIVERS].sort((a, b) => b.ytdNet - a.ytdNet).map((d, i) => {
              const margin = ((d.ytdNet / d.ytdGross) * 100).toFixed(0)
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid #F0F4F8', background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1A2535' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4BAED4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{d.name.charAt(0)}</div>
                      {d.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#718096' }}>{d.unit}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{d.ytdMiles.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{d.ytdLoads}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#48BB78' }}>${d.ytdGross.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#1A2535' }}>${d.ytdNet.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: +margin >= 75 ? '#48BB78' : '#F6AD55', background: +margin >= 75 ? '#F0FFF4' : '#FFFBEB', padding: '3px 8px', borderRadius: 6 }}>
                      {margin}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#F7FAFC', borderTop: '2px solid #1A2535' }}>
              <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 800, color: '#1A2535' }}>ИТОГО</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800 }}>{totalYtdMiles.toLocaleString()}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800 }}>{DRIVERS.reduce((s, d) => s + d.ytdLoads, 0)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#48BB78' }}>${totalYtdGross.toLocaleString()}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#4BAED4', fontSize: 15 }}>${totalYtdNet.toLocaleString()}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800 }}>
                {((totalYtdNet / totalYtdGross) * 100).toFixed(0)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const [tab,      setTab]      = useState<PayTab>('current')
  const [period,   setPeriod]   = useState(PERIODS[0])
  const [stubDrvr, setStub]     = useState<Driver | null>(null)
  const [selected, setSelected] = useState<Driver | null>(null)
  const [expandedHist, setExpandedHist] = useState<number | null>(null)

  const pendingDrivers = DRIVERS.filter(d => d.status === 'pending')
  const totalGross     = DRIVERS.reduce((s, d) => s + d.gross, 0)
  const totalNet       = DRIVERS.reduce((s, d) => s + d.net, 0)
  const totalDeduct    = totalGross - totalNet
  const totalBonus     = DRIVERS.reduce((s, d) => s + d.bonus, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>💼 Payroll & Settlements</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>Расчёты с водителями, pay stubs и история выплат</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '9px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 13, fontWeight: 600, background: '#fff' }}>
            {PERIODS.map(p => <option key={p}>{p}</option>)}
          </select>
          <button style={{ padding: '9px 20px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            ▶ Запустить Payroll
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
        {[
          { label: 'Total Net Pay',  value: `$${totalNet.toLocaleString()}`,    sub: `${DRIVERS.length} водителей`, color: '#4BAED4', icon: '💰' },
          { label: 'Gross Revenue',  value: `$${totalGross.toLocaleString()}`,  sub: 'до вычетов',                  color: '#48BB78', icon: '📈' },
          { label: 'Deductions',     value: `$${totalDeduct.toLocaleString()}`, sub: 'аванс, эскроу, прочее',       color: '#F6AD55', icon: '📋' },
          { label: 'Бонусы',         value: `$${totalBonus.toLocaleString()}`,  sub: 'за этот период',              color: '#9F7AEA', icon: '🎯' },
          { label: 'Ожидают выплаты',value: String(pendingDrivers.length),      sub: 'требуют подтверждения',       color: '#FC8181', icon: '⏳' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '16px 18px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 1 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 12, padding: 4, gap: 2 }}>
        {([
          ['current',  '📅 Текущий период'],
          ['history',  '📋 История выплат'],
          ['ytd',      '📊 YTD Аналитика'],
          ['settings', '⚙️ Настройки'],
        ] as [PayTab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13,
            background: tab === k ? '#fff' : 'transparent',
            color: tab === k ? '#4BAED4' : '#718096',
            boxShadow: tab === k ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {/* ── CURRENT TAB ── */}
      {tab === 'current' && (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>
                Driver Settlements — {period.replace('Current (', '').replace(')', '')}
              </div>
              {pendingDrivers.length > 0 && (
                <button style={{ padding: '7px 16px', background: '#48BB78', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  ✓ Подтвердить всех ({pendingDrivers.length})
                </button>
              )}
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 0.8fr 1fr 1fr 1.1fr 0.9fr 80px', padding: '9px 16px', fontSize: 11, fontWeight: 700, color: '#718096', background: '#FAFBFC', borderBottom: '1px solid #E2E8F0' }}>
              <div>ВОДИТЕЛЬ</div>
              <div>ТАРИФИКАЦИЯ</div>
              <div style={{ textAlign: 'right' }}>РЕЙСЫ</div>
              <div style={{ textAlign: 'right' }}>МИЛИ</div>
              <div style={{ textAlign: 'right' }}>GROSS</div>
              <div style={{ textAlign: 'right' }}>ВЫЧЕТЫ</div>
              <div style={{ textAlign: 'right' }}>NET PAY</div>
              <div style={{ textAlign: 'center' }}>ТРЕНД</div>
              <div style={{ textAlign: 'center' }}>СТАТУС</div>
            </div>

            {DRIVERS.map(d => {
              const isSel  = selected?.id === d.id
              const deduct = d.fuelAdv + d.escrow + d.other
              const scfg   = STATUS_CFG[d.status]
              return (
                <div key={d.id}
                  onClick={() => setSelected(isSel ? null : d)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 0.8fr 1fr 1fr 1.1fr 0.9fr 80px',
                    padding: '13px 16px', borderBottom: '1px solid #F0F4F8',
                    background: isSel ? '#EBF8FF' : '#fff',
                    alignItems: 'center', cursor: 'pointer', transition: 'background .1s',
                    borderLeft: isSel ? '3px solid #4BAED4' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4BAED4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>{d.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>{d.unit}</div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#F0F4F8', color: '#2D3748' }}>
                      {d.payType === 'per-mile' ? `$/mi · ${d.rate}` : `% · ${d.rate}`}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 600 }}>{d.loads}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 12 }}>{d.miles.toLocaleString()}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: '#48BB78' }}>${d.gross.toLocaleString()}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: '#FC8181', fontSize: 12 }}>-${deduct.toLocaleString()}</div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 15, color: '#1A2535' }}>${d.net.toLocaleString()}</div>
                    {d.bonus > 0 && <div style={{ fontSize: 10, color: '#9F7AEA', fontWeight: 700 }}>+${d.bonus} бонус</div>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <EarningsSparkline data={d.history} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: scfg.bg, color: scfg.color, whiteSpace: 'nowrap' }}>
                      {scfg.label}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Totals row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 0.8fr 1fr 1fr 1.1fr 0.9fr 80px', padding: '12px 16px', background: '#F7FAFC', borderTop: '2px solid #1A2535', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', gridColumn: 'span 3' }}>Итого</div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#718096', fontSize: 12 }}>{DRIVERS.reduce((s, d) => s + d.miles, 0).toLocaleString()}</div>
              <div style={{ textAlign: 'right', fontWeight: 800, color: '#48BB78', fontSize: 14 }}>${totalGross.toLocaleString()}</div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#FC8181' }}>-${totalDeduct.toLocaleString()}</div>
              <div style={{ textAlign: 'right', fontWeight: 900, color: '#4BAED4', fontSize: 16 }}>${totalNet.toLocaleString()}</div>
              <div /><div />
            </div>
          </div>

          {selected && (
            <DriverDetailPanel
              driver={selected}
              period={period}
              onPayStub={() => setStub(selected)}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {HISTORY_DATA.map((h, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedHist(expandedHist === i ? null : i)}
                style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedHist === i ? '#F7FAFC' : '#fff' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A2535' }}>{h.period}</div>
                  <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>
                    {h.drivers} водителей · оплачено {h.date}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#4BAED4' }}>${h.total.toLocaleString()}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#F0FFF4', color: '#38C770' }}>Выплачено</span>
                  </div>
                  <div style={{ fontSize: 18, color: '#CBD5E0' }}>{expandedHist === i ? '▲' : '▼'}</div>
                </div>
              </div>

              {expandedHist === i && (
                <div style={{ borderTop: '1px solid #E2E8F0' }}>
                  {h.breakdown.map((b, j) => {
                    const pct = (b.net / h.total) * 100
                    return (
                      <div key={j} style={{ padding: '10px 20px', borderBottom: '1px solid #F0F4F8', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1A2535', minWidth: 140 }}>{b.name}</div>
                        <div style={{ flex: 1, height: 8, background: '#F0F4F8', borderRadius: 4 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#4BAED4', borderRadius: 4 }} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535', minWidth: 70, textAlign: 'right' }}>
                          ${b.net.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: '#A0AEC0', minWidth: 40, textAlign: 'right' }}>
                          {pct.toFixed(0)}%
                        </div>
                      </div>
                    )
                  })}
                  <div style={{ padding: '12px 20px', background: '#F7FAFC', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button style={{ padding: '7px 16px', background: '#EBF8FF', color: '#4BAED4', border: '1px solid #BEE3F8', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      📄 Pay Stubs
                    </button>
                    <button style={{ padding: '7px 16px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                      📥 Экспорт CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── YTD TAB ── */}
      {tab === 'ytd' && <YTDTab />}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC', fontWeight: 700, fontSize: 14, color: '#1A2535' }}>
              Ставки водителей
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#FAFBFC' }}>
                  {['Водитель','Схема','Ставка','Эскроу/период','Аванс макс.','']. map(h => (
                    <th key={h} style={{ padding: '9px 16px', textAlign: h === 'Водитель' ? 'left' : 'right', color: '#718096', fontWeight: 700, fontSize: 11, borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DRIVERS.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #F0F4F8' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4BAED4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{d.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{d.name}</div>
                          <div style={{ fontSize: 10, color: '#A0AEC0' }}>{d.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#718096' }}>
                      {d.payType === 'per-mile' ? 'За милю' : '% от загрузки'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#4BAED4', fontSize: 15 }}>{d.rate}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#718096' }}>${d.escrow}/пер.</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#718096' }}>$500</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button style={{ padding: '5px 12px', background: '#EBF8FF', color: '#4BAED4', border: '1px solid #BEE3F8', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Изменить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '20px 22px' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 16 }}>⚙️ Pay Period настройки</div>
              {[
                { label: 'Pay Period', value: 'Semi-Monthly (1st & 15th)' },
                { label: 'Метод выплат', value: 'Direct Deposit' },
                { label: 'Политика эскроу', value: '$100/период, выплата через 6 мес.' },
                { label: 'Лимит аванса на топливо', value: '$500 / водитель / период' },
                { label: 'Deadline подтверждения', value: 'День периода + 2 бизнес-дня' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 0', borderBottom: '1px solid #F0F4F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#718096' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '20px 22px' }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535', marginBottom: 16 }}>🎯 Бонусные правила</div>
              {[
                { label: 'Безаварийный квартал', value: '+$300', color: '#48BB78' },
                { label: '5+ рейсов за период',  value: '+$200', color: '#48BB78' },
                { label: 'Топ-водитель месяца',   value: '+$500', color: '#9F7AEA' },
                { label: 'Реферал нового водителя', value: '+$250', color: '#4BAED4' },
                { label: 'Оценка безопасности ≥95', value: '+$150', color: '#48BB78' },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 0', borderBottom: '1px solid #F0F4F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#718096' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stubDrvr && <PayStubModal driver={stubDrvr} period={period} onClose={() => setStub(null)} />}
    </div>
  )
}
