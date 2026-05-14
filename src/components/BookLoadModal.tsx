import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type BookableClient = {
  id: string
  name: string
  equipment: string
  rpmGuarantee: number
  commissionPct: number
  preferredLanes?: string
}

type MockLoad = {
  id: string; from: string; to: string; broker: string
  rate: number; miles: number; rpm: number; equip: string; age: string
}

// ── Mock load data — filtered by equipment ────────────────────────────────────
const ALL_LOADS: MockLoad[] = [
  // Dry Van
  { id: 'DV1', from: 'Chicago, IL',    to: 'Dallas, TX',      broker: 'TQL',         rate: 2_786, miles: 1_201, rpm: 2.32, equip: 'Dry Van',  age: '2m'  },
  { id: 'DV2', from: 'Atlanta, GA',    to: 'Indianapolis, IN', broker: 'Worldwide',   rate: 2_100, miles: 720,   rpm: 2.92, equip: 'Dry Van',  age: '5m'  },
  { id: 'DV3', from: 'Memphis, TN',    to: 'Charlotte, NC',   broker: 'Echo Global', rate: 1_540, miles: 580,   rpm: 2.66, equip: 'Dry Van',  age: '8m'  },
  { id: 'DV4', from: 'Kansas City, MO', to: 'Nashville, TN',  broker: 'Coyote',      rate: 1_180, miles: 470,   rpm: 2.51, equip: 'Dry Van',  age: '14m' },
  { id: 'DV5', from: 'Denver, CO',     to: 'Phoenix, AZ',     broker: 'CH Robinson', rate: 1_650, miles: 600,   rpm: 2.75, equip: 'Dry Van',  age: '20m' },
  // Reefer
  { id: 'RF1', from: 'Miami, FL',      to: 'Atlanta, GA',     broker: 'Coyote',      rate: 1_960, miles: 800,   rpm: 2.45, equip: 'Reefer',   age: '3m'  },
  { id: 'RF2', from: 'Los Angeles, CA', to: 'Portland, OR',   broker: 'TQL',         rate: 3_100, miles: 1_100, rpm: 2.82, equip: 'Reefer',   age: '7m'  },
  { id: 'RF3', from: 'Chicago, IL',    to: 'Boston, MA',      broker: 'Echo Global', rate: 2_400, miles: 980,   rpm: 2.45, equip: 'Reefer',   age: '11m' },
  { id: 'RF4', from: 'Dallas, TX',     to: 'Detroit, MI',     broker: 'Worldwide',   rate: 2_950, miles: 1_200, rpm: 2.46, equip: 'Reefer',   age: '16m' },
  // Flatbed
  { id: 'FB1', from: 'Houston, TX',    to: 'Phoenix, AZ',     broker: 'TQL',         rate: 2_786, miles: 1_201, rpm: 2.32, equip: 'Flatbed',  age: '4m'  },
  { id: 'FB2', from: 'Dallas, TX',     to: 'Kansas City, MO', broker: 'Worldwide',   rate: 1_450, miles: 490,   rpm: 2.96, equip: 'Flatbed',  age: '9m'  },
  { id: 'FB3', from: 'Austin, TX',     to: 'El Paso, TX',     broker: 'Echo',        rate: 1_050, miles: 390,   rpm: 2.69, equip: 'Flatbed',  age: '12m' },
  { id: 'FB4', from: 'San Antonio, TX', to: 'Albuquerque, NM', broker: 'Coyote',     rate: 1_320, miles: 540,   rpm: 2.44, equip: 'Flatbed',  age: '18m' },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookLoadModal({
  client,
  onClose,
  onBooked,
}: {
  client: BookableClient
  onClose: () => void
  onBooked?: (loadId: string, clientId: string) => void
}) {
  const [step, setStep] = useState<'search' | 'confirm' | 'done'>('search')
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<'rpm' | 'rate' | 'miles'>('rpm')

  const allMatching = ALL_LOADS.filter(l =>
    l.equip === client.equipment &&
    (filter === '' ||
      l.from.toLowerCase().includes(filter.toLowerCase()) ||
      l.to.toLowerCase().includes(filter.toLowerCase()) ||
      l.broker.toLowerCase().includes(filter.toLowerCase()))
  )

  const sorted = [...allMatching].sort((a, b) =>
    sortBy === 'rpm'   ? b.rpm - a.rpm :
    sortBy === 'rate'  ? b.rate - a.rate :
    a.miles - b.miles
  )

  const meetsGuarantee = sorted.filter(l => l.rpm >= client.rpmGuarantee)
  const belowGuarantee = sorted.filter(l => l.rpm < client.rpmGuarantee)

  const selectedLoad = ALL_LOADS.find(l => l.id === selected)
  const commission   = selectedLoad ? selectedLoad.rate * (client.commissionPct / 100) : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,15,30,.55)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, width: '100%', maxWidth: 640,
        maxHeight: '92vh', overflow: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,.28)',
      }}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: '#fff', zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2535' }}>
              {step === 'search'  ? '🔍 Find Load for Client' :
               step === 'confirm' ? '📋 Confirm Booking'      : '✅ Load Booked!'}
            </div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
              {client.name} · {client.equipment} · Guarantee ${client.rpmGuarantee.toFixed(2)}/mi · {client.commissionPct}% commission
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A0AEC0', lineHeight: 1 }}>✕</button>
        </div>

        {/* ── STEP: search ──────────────────────────────────────────────── */}
        {step === 'search' && (
          <div style={{ padding: 24 }}>

            {/* Filter + sort bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                placeholder="Filter by city, broker..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{ flex: 1, minWidth: 180, padding: '9px 13px', borderRadius: 9, border: '1.5px solid #E2E8F0', fontSize: 13 }}
              />
              <div style={{ display: 'flex', background: '#F7FAFC', border: '1.5px solid #E2E8F0', borderRadius: 9, overflow: 'hidden' }}>
                {(['rpm', 'rate', 'miles'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    style={{
                      padding: '9px 13px', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      background: sortBy === s ? '#8B5CF6' : 'transparent',
                      color: sortBy === s ? '#fff' : '#718096',
                    }}
                  >
                    {s === 'rpm' ? 'Best RPM' : s === 'rate' ? 'Highest Rate' : 'Shortest'}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment + guarantee badge */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#EBF8FF', color: '#2D7A9A' }}>
                {client.equipment} only
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#F0FFF4', color: '#276749' }}>
                Guarantee ≥ ${client.rpmGuarantee.toFixed(2)}/mi
              </span>
              {client.preferredLanes && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: '#FAF5FF', color: '#6B46C1' }}>
                  Pref: {client.preferredLanes}
                </span>
              )}
            </div>

            {/* Loads meeting guarantee */}
            {meetsGuarantee.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#276749', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#38C770' }} />
                  Meets RPM guarantee ({meetsGuarantee.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {meetsGuarantee.map(load => <LoadCard key={load.id} load={load} client={client} selected={selected} onSelect={setSelected} />)}
                </div>
              </div>
            )}

            {/* Loads below guarantee */}
            {belowGuarantee.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#D97706', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ECC94B' }} />
                  Below guarantee — use with caution ({belowGuarantee.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {belowGuarantee.map(load => <LoadCard key={load.id} load={load} client={client} selected={selected} onSelect={setSelected} />)}
                </div>
              </div>
            )}

            {sorted.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#A0AEC0' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 13 }}>No {client.equipment} loads matching that filter.</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Try clearing the filter or check the full Load Board.</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button
                onClick={() => selected && setStep('confirm')}
                className="btn btn-primary"
                style={{ flex: 2, opacity: selected ? 1 : .45, transition: 'opacity .15s' }}
                disabled={!selected}
              >
                Confirm Selection →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: confirm ─────────────────────────────────────────────── */}
        {step === 'confirm' && selectedLoad && (
          <div style={{ padding: 24 }}>

            {/* Load summary */}
            <div style={{ background: 'linear-gradient(135deg, #F5F3FF, #EBF8FF)', borderRadius: 14, padding: 20, marginBottom: 20, border: '1.5px solid #C4B5FD' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#1A2535', marginBottom: 4 }}>{selectedLoad.from} → {selectedLoad.to}</div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 14 }}>{selectedLoad.broker} · {selectedLoad.miles.toLocaleString()} mi · {selectedLoad.equip} · Listed {selectedLoad.age} ago</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Carrier Rate',   value: fmt(selectedLoad.rate), color: '#4BAED4' },
                  { label: 'RPM',            value: `$${selectedLoad.rpm.toFixed(2)}/mi`, color: selectedLoad.rpm >= client.rpmGuarantee ? '#38C770' : '#E53E3E' },
                  { label: 'Your Commission', value: fmt(commission), color: '#8B5CF6' },
                ].map(f => (
                  <div key={f.label} style={{ background: '#fff', borderRadius: 10, padding: '12px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: f.color }}>{f.value}</div>
                    <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{f.label}</div>
                  </div>
                ))}
              </div>

              {/* RPM vs guarantee */}
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: '#fff', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096' }}>RPM vs client guarantee:</span>
                <strong style={{ color: selectedLoad.rpm >= client.rpmGuarantee ? '#38C770' : '#E53E3E' }}>
                  {selectedLoad.rpm >= client.rpmGuarantee
                    ? `+$${(selectedLoad.rpm - client.rpmGuarantee).toFixed(2)}/mi above ✓`
                    : `-$${(client.rpmGuarantee - selectedLoad.rpm).toFixed(2)}/mi below ⚠️`}
                </strong>
              </div>
            </div>

            {/* What happens next */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>What happens next</div>
              {[
                { icon: '📲', text: `${client.name} gets notified immediately with load details` },
                { icon: '📋', text: 'Load added to Dispatch Board — status: Booked' },
                { icon: '📄', text: 'ePOD packet auto-created, ready for driver signature' },
                { icon: '💰', text: `Invoice draft prepared: ${fmt(commission)} commission on delivery` },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #F0F4F8', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#2D3748' }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('search')} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
              <button
                onClick={() => { onBooked?.(selectedLoad.id, client.id); setStep('done') }}
                className="btn btn-primary"
                style={{ flex: 2, background: '#38C770', fontSize: 14, fontWeight: 800 }}
              >
                🎯 Book for {client.name.split(' ')[0]}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: done ────────────────────────────────────────────────── */}
        {step === 'done' && (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1A2535', marginBottom: 8 }}>Load Booked!</div>
            <div style={{ fontSize: 14, color: '#718096', marginBottom: 6 }}>
              {client.name} has been notified.
            </div>
            {selectedLoad && (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#2D3748', marginBottom: 4 }}>
                  {selectedLoad.from} → {selectedLoad.to}
                </div>
                <div style={{ fontSize: 14, color: '#8B5CF6', fontWeight: 700, marginBottom: 28 }}>
                  Your commission: {fmt(commission)}
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={onClose} className="btn btn-ghost">Close</button>
              <button onClick={onClose} className="btn btn-primary">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── LoadCard sub-component ────────────────────────────────────────────────────
function LoadCard({
  load, client, selected, onSelect,
}: {
  load: MockLoad; client: BookableClient; selected: string | null; onSelect: (id: string) => void
}) {
  const isSelected = selected === load.id
  const commission = load.rate * (client.commissionPct / 100)
  const diff = load.rpm - client.rpmGuarantee
  const ok = diff >= 0

  return (
    <div
      onClick={() => onSelect(load.id)}
      style={{
        border: `2px solid ${isSelected ? '#8B5CF6' : '#E2E8F0'}`,
        borderRadius: 11, padding: '13px 16px', cursor: 'pointer',
        background: isSelected ? '#F5F3FF' : '#FAFCFF',
        transition: 'all .12s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1A2535' }}>{load.from} → {load.to}</div>
          <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{load.broker} · {load.miles.toLocaleString()} mi · {load.age} ago</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#4BAED4' }}>{fmt(load.rate)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: ok ? '#38C770' : '#E53E3E' }}>
            ${load.rpm.toFixed(2)}/mi
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #EDF2F7', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: '#A0AEC0' }}>
          Commission: <strong style={{ color: '#8B5CF6' }}>{fmt(commission)}</strong>
        </span>
        <span style={{ fontSize: 11, color: '#A0AEC0' }}>
          vs guarantee: <strong style={{ color: ok ? '#38C770' : '#E53E3E' }}>
            {ok ? `+$${diff.toFixed(2)}` : `-$${Math.abs(diff).toFixed(2)}`}/mi
          </strong>
        </span>
        {isSelected && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', marginLeft: 'auto' }}>
            ✓ Selected
          </span>
        )}
      </div>
    </div>
  )
}
