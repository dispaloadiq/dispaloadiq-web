import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type InputTab = 'paste' | 'upload'
type AnalysisStatus = 'idle' | 'analyzing' | 'done'

type ExtractedField = {
  field: string
  value: string
  status: 'ok' | 'warn' | 'info'
  note: string
}

type RedFlag = {
  severity: 'warn' | 'danger'
  text: string
}

type GreenFlag = {
  text: string
}

type RCHistoryItem = {
  date: string
  broker: string
  route: string
  rate: string
  rpm: string
  status: 'clean' | 'warning' | 'danger'
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const SAMPLE_RC = `RATE CONFIRMATION
Broker: Echo Global Logistics | MC#: 494826
Load #: EGL-2024-88341
Carrier: Mike Robertson | MC#: 998234
Origin: Houston, TX 77002 — Pickup: 05/14/2024 14:00
Destination: Dallas, TX 75201 — Delivery: 05/14/2024 22:00
Commodity: General Freight | Weight: 42,000 lbs
Equipment: 53' Dry Van
Rate: $680.00 ALL IN
Payment Terms: QuickPay available 2% fee / Net 30
Detention: $25/hr after 2 free hours
Lumper: Not Authorized
Special Instructions: Driver must have E-Logs. No touch freight.`

const EXTRACTED_FIELDS: ExtractedField[] = [
  { field: 'Broker',       value: 'Echo Global Logistics',   status: 'ok',   note: 'Known broker' },
  { field: 'Broker MC#',   value: 'MC#494826',               status: 'ok',   note: 'Active (FMCSA)' },
  { field: 'Load #',       value: 'EGL-2024-88341',          status: 'ok',   note: '' },
  { field: 'Rate',         value: '$680.00 ALL IN',          status: 'warn', note: 'Below market' },
  { field: 'Payment',      value: 'Net 30',                  status: 'ok',   note: 'Standard' },
  { field: 'QuickPay',     value: '2% fee',                  status: 'info', note: 'Optional' },
  { field: 'Detention',    value: '$25/hr (2hr free)',        status: 'warn', note: 'Low rate' },
  { field: 'Equipment',    value: "53' Dry Van",             status: 'ok',   note: '' },
  { field: 'Distance',     value: 'Houston → Dallas ~239 mi', status: 'ok',  note: '' },
]

const RED_FLAGS: RedFlag[] = [
  { severity: 'warn', text: 'Detention rate $25/hr is below industry standard ($50–75/hr). Consider calling to negotiate.' },
  { severity: 'warn', text: 'Lumper not authorized — confirm with shipper before accepting if lumper service is needed.' },
]

const GREEN_FLAGS: GreenFlag[] = [
  { text: 'Echo Global Logistics is a known, reputable broker (Top 10 US freight broker)' },
  { text: 'MC# 494826 is active with FMCSA' },
  { text: 'Payment Net 30 is standard; QuickPay at 2% is reasonable' },
  { text: '"No touch freight" reduces driver workload' },
]

const RC_HISTORY: RCHistoryItem[] = [
  { date: 'May 13', broker: 'TQL',               route: 'Chicago → Dallas',      rate: '$2,786', rpm: '$2.32', status: 'clean' },
  { date: 'May 12', broker: 'Coyote Logistics',  route: 'Miami → Atlanta',       rate: '$1,960', rpm: '$2.45', status: 'warning' },
  { date: 'May 11', broker: 'Echo Global',        route: 'Houston → Dallas',      rate: '$680',   rpm: '$2.85', status: 'warning' },
  { date: 'May 10', broker: 'Worldwide Express',  route: 'Atlanta → Charlotte',   rate: '$622',   rpm: '$2.50', status: 'clean' },
  { date: 'May 9',  broker: 'Unknown Broker LLC', route: 'LA → Las Vegas',        rate: '$840',   rpm: '$3.00', status: 'danger' },
]

const STATUS_META = {
  ok:   { icon: '✅', color: '#22C55E', bg: '#F0FFF4' },
  warn: { icon: '⚠️', color: '#D97706', bg: '#FFFBEB' },
  info: { icon: 'ℹ️', color: '#4BAED4', bg: '#EFF6FF' },
}

const HISTORY_META = {
  clean:   { label: 'Clean',   color: '#22C55E', bg: '#F0FFF4',  icon: '✅' },
  warning: { label: 'Warning', color: '#D97706', bg: '#FFFBEB',  icon: '⚠️' },
  danger:  { label: 'Danger',  color: '#DC2626', bg: '#FEF2F2',  icon: '🚩' },
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RCAnalyzerPage() {
  const [inputTab,        setInputTab]        = useState<InputTab>('paste')
  const [rcText,          setRcText]          = useState('')
  const [analysisStatus,  setAnalysisStatus]  = useState<AnalysisStatus>('idle')
  const [redFlagsOpen,    setRedFlagsOpen]    = useState(true)
  const [copyFeedback,    setCopyFeedback]    = useState(false)

  function loadSample() {
    setRcText(SAMPLE_RC)
    setAnalysisStatus('idle')
  }

  function analyzeRC() {
    if (!rcText.trim()) return
    setAnalysisStatus('analyzing')
    setTimeout(() => setAnalysisStatus('done'), 1200)
  }

  function reset() {
    setRcText('')
    setAnalysisStatus('idle')
    setRedFlagsOpen(true)
  }

  function copySummary() {
    const summary = [
      '✅ LOAD LOOKS CLEAN — 2 items to review',
      '',
      'Broker: Echo Global Logistics (MC#494826) — Active FMCSA',
      'Load #: EGL-2024-88341',
      'Rate: $680.00 ALL IN | RPM: $2.85/mi',
      'Route: Houston, TX → Dallas, TX (~239 mi)',
      'Payment: Net 30 | QuickPay: 2% fee',
      'Detention: $25/hr after 2 free hrs',
      '',
      'Red flags: Detention below standard · Lumper not authorized',
    ].join('\n')
    navigator.clipboard.writeText(summary).then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT: Input Panel ────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--c-border)' }}>
            {[
              { key: 'paste',  label: '📋 Paste Text' },
              { key: 'upload', label: '📁 Upload PDF' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setInputTab(tab.key as InputTab)}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  color: inputTab === tab.key ? '#4BAED4' : '#718096',
                  borderBottom: inputTab === tab.key ? '2px solid #4BAED4' : '2px solid transparent',
                  transition: 'color 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 18 }}>
            {inputTab === 'paste' && (
              <>
                <textarea
                  value={rcText}
                  onChange={e => { setRcText(e.target.value); setAnalysisStatus('idle') }}
                  placeholder={`Paste your Rate Confirmation here...\n\nExample:\nRATE CONFIRMATION\nBroker: Echo Global Logistics | MC#: 494826\nLoad #: EGL-2024-88341\nRate: $680.00 ALL IN\nPayment Terms: Net 30\nDetention: $25/hr after 2 free hours\n...`}
                  style={{
                    width: '100%', height: 320, resize: 'vertical',
                    border: '2px solid var(--c-border)', borderRadius: 10,
                    padding: '12px 14px', fontSize: 12, fontFamily: 'monospace',
                    lineHeight: 1.6, color: 'var(--c-dark)',
                    background: 'var(--c-surface)',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4BAED4' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--c-border)' }}
                />

                {/* Load Sample button */}
                <button
                  onClick={loadSample}
                  style={{
                    marginTop: 10, width: '100%', padding: '8px 16px',
                    border: '1.5px dashed #CBD5E0', borderRadius: 8,
                    background: 'transparent', color: '#718096',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget
                    t.style.borderColor = '#4BAED4'
                    t.style.color = '#4BAED4'
                    t.style.background = '#EFF6FF'
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget
                    t.style.borderColor = '#CBD5E0'
                    t.style.color = '#718096'
                    t.style.background = 'transparent'
                  }}
                >
                  📄 Load Sample RC
                </button>

                {/* Analyze button */}
                <button
                  onClick={analyzeRC}
                  disabled={!rcText.trim() || analysisStatus === 'analyzing'}
                  style={{
                    marginTop: 10, width: '100%', padding: '12px 16px',
                    border: 'none', borderRadius: 10, cursor: rcText.trim() ? 'pointer' : 'not-allowed',
                    background: rcText.trim() ? 'linear-gradient(135deg, #4BAED4, #0EA5E9)' : '#E2E8F0',
                    color: rcText.trim() ? '#fff' : '#A0AEC0',
                    fontSize: 14, fontWeight: 800,
                    boxShadow: rcText.trim() ? '0 4px 14px rgba(75,174,212,0.4)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {analysisStatus === 'analyzing' ? '⏳ Analyzing...' : '🔍 Analyze RC'}
                </button>
              </>
            )}

            {inputTab === 'upload' && (
              <div style={{
                height: 360, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
                border: '2px dashed var(--c-border)', borderRadius: 12,
                background: '#F7FAFC',
              }}>
                <div style={{ fontSize: 40 }}>📁</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#4A5568' }}>PDF Upload</div>
                <div style={{
                  padding: '6px 16px', borderRadius: 20,
                  background: '#E2E8F0', color: '#718096',
                  fontSize: 12, fontWeight: 700,
                }}>
                  Coming Soon
                </div>
                <div style={{ fontSize: 12, color: '#A0AEC0', textAlign: 'center', maxWidth: 220 }}>
                  Direct PDF parsing is in development. Use the Paste Text tab in the meantime.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Analysis Results ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Empty state */}
          {analysisStatus === 'idle' && (
            <div className="card" style={{
              minHeight: 320, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
              border: '2px dashed var(--c-border)', background: '#F7FAFC',
            }}>
              <div style={{ fontSize: 40 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#718096' }}>
                Paste a Rate Confirmation to analyze →
              </div>
              <div style={{ fontSize: 12, color: '#A0AEC0', textAlign: 'center', maxWidth: 280 }}>
                The analyzer will extract key fields, verify broker credentials, calculate RPM, and flag potential issues.
              </div>
            </div>
          )}

          {/* Analyzing spinner */}
          {analysisStatus === 'analyzing' && (
            <div className="card" style={{
              minHeight: 320, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 36 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4BAED4' }}>Analyzing Rate Confirmation...</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Extracting fields', 'Verifying MC#', 'Calculating RPM', 'Checking flags'].map((step, i) => (
                  <div key={step} style={{
                    padding: '4px 10px', borderRadius: 20,
                    background: '#EFF6FF', color: '#4BAED4',
                    fontSize: 10, fontWeight: 600,
                    animation: `pulse ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis results */}
          {analysisStatus === 'done' && (
            <>
              {/* Summary card */}
              <div className="card" style={{
                border: '2px solid #22C55E',
                background: 'linear-gradient(135deg, #F0FFF4, #DCFCE7)',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                      ✅ LOAD LOOKS CLEAN — 2 items to review
                    </div>
                    <div style={{ fontSize: 11, color: '#4ADE80', marginTop: 4 }}>
                      Echo Global Logistics · Load EGL-2024-88341 · Houston → Dallas
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: '#22C55E', color: '#fff',
                    fontSize: 11, fontWeight: 800,
                  }}>
                    LOW RISK
                  </div>
                </div>
              </div>

              {/* Extracted Fields table */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--c-border)' }}>
                  <h3 className="section-title" style={{ margin: 0 }}>Extracted Fields</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EXTRACTED_FIELDS.map(row => {
                        const m = STATUS_META[row.status]
                        return (
                          <tr key={row.field}>
                            <td style={{ fontWeight: 700, fontSize: 12, color: '#4A5568' }}>{row.field}</td>
                            <td style={{ fontSize: 12, fontFamily: row.field === 'Broker MC#' || row.field === 'Load #' ? 'monospace' : 'inherit' }}>
                              {row.value}
                            </td>
                            <td>
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                                background: m.bg, color: m.color, whiteSpace: 'nowrap',
                              }}>
                                {m.icon} {row.note || 'OK'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RPM Analysis */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                border: '1.5px solid #BFDBFE',
              }}>
                <h3 className="section-title" style={{ marginBottom: 12 }}>📊 RPM Analysis</h3>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Your Rate</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#1E40AF' }}>$2.85<span style={{ fontSize: 13, fontWeight: 600 }}>/mi</span></div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>$680 ÷ 239 mi</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Market Range (DAT)</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#4A5568' }}>$2.70 – $3.10<span style={{ fontSize: 12, fontWeight: 600 }}>/mi</span></div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>HOU → DAL avg</div>
                  </div>
                  <div style={{
                    flex: 1, minWidth: 140, padding: '10px 14px', borderRadius: 10,
                    background: '#22C55E22', border: '1.5px solid #22C55E55',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16 }}>✅</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#166534' }}>Within market range</div>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748B', marginBottom: 4 }}>
                    <span>$2.70 min</span>
                    <span style={{ color: '#1E40AF', fontWeight: 700 }}>Your rate: $2.85</span>
                    <span>$3.10 max</span>
                  </div>
                  <div style={{ height: 8, background: '#BFDBFE', borderRadius: 4, position: 'relative' }}>
                    {/* Market range highlight */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0,
                      left: '0%', right: '0%',
                      background: '#93C5FD', borderRadius: 4,
                    }} />
                    {/* Rate marker: (2.85-2.70)/(3.10-2.70) = 0.15/0.40 = 37.5% */}
                    <div style={{
                      position: 'absolute', top: -3, bottom: -3,
                      left: 'calc(37.5% - 5px)', width: 10,
                      background: '#1E40AF', borderRadius: 3,
                    }} />
                  </div>
                </div>
              </div>

              {/* Red Flags — collapsible */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid #FEF3C7' }}>
                <button
                  onClick={() => setRedFlagsOpen(o => !o)}
                  style={{
                    width: '100%', padding: '12px 18px', border: 'none',
                    background: '#FFFBEB', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                    🚩 Red Flags ({RED_FLAGS.length})
                  </span>
                  <span style={{ fontSize: 12, color: '#D97706', fontWeight: 700 }}>
                    {redFlagsOpen ? '▲ Collapse' : '▼ Expand'}
                  </span>
                </button>
                {redFlagsOpen && (
                  <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {RED_FLAGS.map((f, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8,
                        background: '#FFFBEB', border: '1px solid #FDE68A',
                      }}>
                        <span style={{ flexShrink: 0, fontSize: 14 }}>⚠️</span>
                        <span style={{ fontSize: 12, color: '#78350F', lineHeight: 1.5 }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Green Flags */}
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid #BBF7D0' }}>
                <div style={{
                  padding: '12px 18px', background: '#F0FFF4',
                  borderBottom: '1px solid #BBF7D0',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>
                    ✅ Green Flags ({GREEN_FLAGS.length})
                  </span>
                </div>
                <div style={{ padding: '10px 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {GREEN_FLAGS.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, padding: '8px 12px', borderRadius: 8,
                      background: '#F0FFF4',
                    }}>
                      <span style={{ flexShrink: 0, fontSize: 13 }}>✅</span>
                      <span style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  style={{
                    flex: 2, padding: '11px 14px', border: 'none', borderRadius: 10, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    color: '#fff', fontSize: 13, fontWeight: 800,
                    boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
                  }}
                >
                  ✅ Accept & Save to Load Board
                </button>
                <button
                  onClick={copySummary}
                  style={{
                    flex: 1, padding: '11px 14px', border: '1.5px solid var(--c-border)', borderRadius: 10, cursor: 'pointer',
                    background: copyFeedback ? '#F0FFF4' : 'var(--c-surface)',
                    color: copyFeedback ? '#22C55E' : '#4A5568',
                    fontSize: 13, fontWeight: 700,
                    transition: 'all 0.2s',
                  }}
                >
                  {copyFeedback ? '✅ Copied!' : '📋 Copy Summary'}
                </button>
                <button
                  onClick={reset}
                  style={{
                    flex: 1, padding: '11px 14px', border: '1.5px solid var(--c-border)', borderRadius: 10, cursor: 'pointer',
                    background: 'var(--c-surface)', color: '#4A5568',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  🔄 Analyze Another
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent RC History ───────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '12px 18px', borderBottom: '1px solid var(--c-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 className="section-title" style={{ margin: 0 }}>Recent RC History</h3>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: '#EFF6FF', color: '#4BAED4',
          }}>
            Last 5 analyzed
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Broker</th>
                <th>Route</th>
                <th style={{ textAlign: 'right' }}>Rate</th>
                <th style={{ textAlign: 'right' }}>RPM</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RC_HISTORY.map((r, i) => {
                const m = HISTORY_META[r.status]
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 12, color: '#718096' }}>{r.date}</td>
                    <td style={{ fontWeight: 700, fontSize: 12, color: '#2D3748' }}>{r.broker}</td>
                    <td style={{ fontSize: 12, color: '#4A5568' }}>{r.route}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#4BAED4' }}>{r.rate}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1E40AF' }}>{r.rpm}</td>
                    <td>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
                        background: m.bg, color: m.color,
                      }}>
                        {m.icon} {m.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
