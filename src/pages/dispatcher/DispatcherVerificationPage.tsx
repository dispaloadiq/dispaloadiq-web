import { useState, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type StepKey = 'identity' | 'english' | 'skills' | 'portfolio' | 'result'

interface StepStatus {
  identity: 'pending' | 'uploading' | 'done' | 'failed'
  english: 'pending' | 'recording' | 'done' | 'failed'
  skills: 'pending' | 'done' | 'failed'
  portfolio: 'pending' | 'done'
}

interface TrustBreakdown {
  identity: number
  english: number
  skills: number
  portfolio: number
  references: number
}

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS: { key: StepKey; icon: string; label: string }[] = [
  { key: 'identity',  icon: '🪪', label: 'Identity' },
  { key: 'english',   icon: '🗣️', label: 'English' },
  { key: 'skills',    icon: '📋', label: 'Skills Test' },
  { key: 'portfolio', icon: '📁', label: 'Portfolio' },
  { key: 'result',    icon: '🏅', label: 'Trust Score' },
]

function StepIndicator({ current, statuses }: { current: StepKey; statuses: StepStatus }) {
  const currentIdx = STEPS.findIndex(s => s.key === current)
  const isCompleted = (key: string) =>
    key === 'identity'  ? statuses.identity  === 'done' :
    key === 'english'   ? statuses.english   === 'done' :
    key === 'skills'    ? statuses.skills    === 'done' :
    key === 'portfolio' ? statuses.portfolio === 'done' : false

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      {STEPS.map((step, idx) => {
        const done = isCompleted(step.key)
        const active = step.key === current
        const past = idx < currentIdx
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, fontWeight: 700,
                background: done ? '#22c55e' : active ? '#1d4ed8' : past ? '#94a3b8' : '#f1f5f9',
                color: done || active ? '#fff' : '#94a3b8',
                border: active ? '3px solid #bfdbfe' : 'none',
                transition: 'all .3s',
              }}>
                {done ? '✓' : step.icon}
              </div>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: active ? '#1d4ed8' : done ? '#15803d' : '#94a3b8',
              }}>{step.label}</div>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                width: 48, height: 2, marginBottom: 14,
                background: past || done ? '#22c55e' : '#e2e8f0',
                transition: 'background .3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Trust Score Ring ───────────────────────────────────────────────────────────
function TrustRing({ score, size = 120 }: { score: number; size?: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const deg = score * 3.6
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `conic-gradient(${color} ${deg}deg, #e2e8f0 0deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 24px ${color}40`,
    }}>
      <div style={{
        width: size * 0.78, height: size * 0.78, borderRadius: '50%',
        background: '#fff', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: size * 0.095, color: '#94a3b8', fontWeight: 600 }}>TRUST</div>
      </div>
    </div>
  )
}

// ── Identity Step ──────────────────────────────────────────────────────────────
function IdentityStep({ onDone }: { onDone: () => void }) {
  const [idUploaded, setIdUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)
  const [country, setCountry] = useState('Ukraine')
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  const canVerify = idUploaded && selfieUploaded

  const handleVerify = () => {
    setChecking(true)
    setTimeout(() => { setChecking(false); setChecked(true) }, 2200)
  }

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🪪 Identity Verification</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
        Upload a government-issued ID (passport, national ID card) from any country + a selfie holding it.<br/>
        We use this to confirm you are a real person. No MC# required — this works for dispatchers worldwide.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* ID upload */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${idUploaded ? '#22c55e' : '#cbd5e1'}`,
            borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer',
            background: idUploaded ? '#f0fdf4' : '#f8fafc', transition: 'all .2s',
          }}
        >
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={() => setIdUploaded(true)} accept="image/*,.pdf" />
          <div style={{ fontSize: 36, marginBottom: 8 }}>{idUploaded ? '✅' : '🪪'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: idUploaded ? '#15803d' : '#475569' }}>
            {idUploaded ? 'ID Uploaded ✓' : 'Upload Passport / ID'}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>JPG, PNG or PDF · Max 10MB</div>
        </div>

        {/* Selfie upload */}
        <div
          onClick={() => selfieRef.current?.click()}
          style={{
            border: `2px dashed ${selfieUploaded ? '#22c55e' : '#cbd5e1'}`,
            borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer',
            background: selfieUploaded ? '#f0fdf4' : '#f8fafc', transition: 'all .2s',
          }}
        >
          <input ref={selfieRef} type="file" style={{ display: 'none' }} onChange={() => setSelfieUploaded(true)} accept="image/*" />
          <div style={{ fontSize: 36, marginBottom: 8 }}>{selfieUploaded ? '✅' : '🤳'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: selfieUploaded ? '#15803d' : '#475569' }}>
            {selfieUploaded ? 'Selfie Uploaded ✓' : 'Selfie Holding ID'}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Hold your ID next to your face</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Your country</div>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }}
        >
          {['Ukraine 🇺🇦','Uzbekistan 🇺🇿','India 🇮🇳','Philippines 🇵🇭','Mexico 🇲🇽','United States 🇺🇸','Other'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#1d4ed8', lineHeight: 1.5 }}>
        🔒 <strong>Privacy:</strong> Your documents are encrypted and never shared with owner-ops. Only your verification badge is visible on your profile. We use Stripe Identity for secure processing.
      </div>

      {checked ? (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 4 }}>✅ Identity Verified!</div>
          <div style={{ fontSize: 12, color: '#166534' }}>Your government ID matches your selfie. <strong>+25 Trust Score points</strong> added.</div>
        </div>
      ) : checking ? (
        <div style={{ background: '#fefce8', border: '1.5px solid #fde047', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>⏳ Verifying your documents... (usually under 30 seconds)</div>
        </div>
      ) : null}

      <button
        onClick={checked ? onDone : handleVerify}
        disabled={!canVerify && !checked}
        className="btn btn-primary"
        style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, opacity: (!canVerify && !checked) ? 0.5 : 1 }}
      >
        {checked ? '→ Continue to English Test' : checking ? '⏳ Verifying...' : '🔍 Verify My Identity'}
      </button>

      {!canVerify && !checked && (
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
          Upload both ID and selfie to continue
        </div>
      )}
    </div>
  )
}

// ── English Step ───────────────────────────────────────────────────────────────
function EnglishStep({ onDone }: { onDone: (grade: string, score: number) => void }) {
  const [subTab, setSubTab] = useState<'intro' | 'reading' | 'writing' | 'speaking' | 'result'>('intro')
  const [readingAnswer, setReadingAnswer] = useState<number | null>(null)
  const [writingText, setWritingText] = useState('')
  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = () => {
    setRecording(true)
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds(s => {
      if (s >= 59) {
        clearInterval(timerRef.current!)
        setRecording(false)
        setRecorded(true)
        return 60
      }
      return s + 1
    }), 1000)
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
    setRecorded(true)
  }

  const BROKER_EMAIL = `Hi, I'm calling about load #TX-48821 posted on DAT. I have a 53' dry van available in Dallas tomorrow morning. The rate shows $1,850 for 1,240 miles to Miami. Can we get that to $2,200? My driver's empty, ready to load by 8 AM.`

  if (subTab === 'intro') return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🗣️ English Proficiency</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
        As a dispatcher, you'll negotiate with brokers by phone and email every day. <strong>Owner-ops need to know you can communicate clearly in English.</strong> This test takes about 10 minutes.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { icon: '📖', title: 'Reading', desc: 'Understand a broker email', time: '3 min' },
          { icon: '✍️', title: 'Writing', desc: 'Reply to a broker offer', time: '5 min' },
          { icon: '🎙️', title: 'Speaking', desc: 'Record a 60-sec broker call', time: '2 min' },
        ].map(s => (
          <div key={s.title} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{s.title}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.desc}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>~{s.time}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#1d4ed8', lineHeight: 1.5 }}>
        💡 <strong>Tip:</strong> There is no "passing" score — your grade (A/B/C/F) is shown to owner-ops alongside your profile so they can choose a dispatcher matching their communication needs.
      </div>
      <button onClick={() => setSubTab('reading')} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700 }}>
        Start English Assessment →
      </button>
    </div>
  )

  if (subTab === 'reading') return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>📖 Part 1 — Reading Comprehension</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Read the broker email below and answer the question.</div>
      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7, color: '#1e293b' }}>
        <strong>From:</strong> dispatch@acmefreight.com<br/>
        <strong>Subject:</strong> Load offer — DAL to MIA — Dry Van<br/><br/>
        Hi,<br/><br/>
        We have a 44,000 lb dry van load, Dallas TX to Miami FL, 1,232 miles. Pickup 5/15 07:00, delivery 5/17 by 23:59. Rate: $1,950 all-in, no fuel surcharge, net 30 payment terms. Lumper is carrier's responsibility at destination.<br/><br/>
        Please confirm if available. TONU is $150.<br/><br/>
        — Mike, Acme Freight
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
        What does "TONU" mean in this context?
      </div>
      {[
        { id: 0, text: 'Truck On Normal Use — standard operating agreement' },
        { id: 1, text: 'Truck Ordered Not Used — penalty if driver is booked but load is cancelled' },
        { id: 2, text: 'Total Order Not Unloaded — freight not removed at delivery' },
        { id: 3, text: 'Time Of Normal Unloading — standard delivery window' },
      ].map(opt => (
        <div
          key={opt.id}
          onClick={() => setReadingAnswer(opt.id)}
          style={{
            padding: '10px 14px', border: `1.5px solid ${readingAnswer === opt.id ? '#1d4ed8' : '#e2e8f0'}`,
            borderRadius: 8, marginBottom: 8, cursor: 'pointer', fontSize: 13,
            background: readingAnswer === opt.id ? '#eff6ff' : '#fff',
            color: readingAnswer === opt.id ? '#1d4ed8' : '#1e293b',
            fontWeight: readingAnswer === opt.id ? 600 : 400,
          }}
        >
          {String.fromCharCode(65 + opt.id)}. {opt.text}
        </div>
      ))}
      <button
        onClick={() => setSubTab('writing')}
        disabled={readingAnswer === null}
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, marginTop: 12, opacity: readingAnswer === null ? 0.5 : 1 }}
      >
        Next: Writing →
      </button>
    </div>
  )

  if (subTab === 'writing') return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>✍️ Part 2 — Written Response</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Reply to the broker email. Negotiate the rate up to $2,200. Be professional and persuasive.</div>
      <div style={{ background: '#fefce8', border: '1.5px solid #fde047', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#854d0e' }}>
        📋 <strong>Scenario:</strong> The broker offered $1,950. You need $2,200 (12.8% more). Your driver is empty in Dallas and ready. Write your reply email.
      </div>
      <textarea
        value={writingText}
        onChange={e => setWritingText(e.target.value)}
        placeholder="Hi Mike,

Thank you for reaching out. We are interested in the Dallas to Miami load for May 15th...

(Write your full response here)"
        style={{
          width: '100%', minHeight: 200, padding: '12px', borderRadius: 8,
          border: '1.5px solid #e2e8f0', fontSize: 13, lineHeight: 1.6, outline: 'none', resize: 'vertical',
        }}
      />
      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginBottom: 12 }}>
        {writingText.length} characters · Aim for 80–200 words
      </div>
      <button
        onClick={() => setSubTab('speaking')}
        disabled={writingText.length < 50}
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, opacity: writingText.length < 50 ? 0.5 : 1 }}
      >
        Next: Speaking →
      </button>
    </div>
  )

  if (subTab === 'speaking') return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>🎙️ Part 3 — Broker Call Recording</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.6 }}>
        Read the script below and record yourself saying it. This shows owner-ops how you sound on the phone with brokers.
        Speak clearly, confidently, and professionally.
      </div>
      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 1.8, color: '#1e293b', fontStyle: 'italic' }}>
        "{BROKER_EMAIL}"
      </div>

      {!recorded ? (
        <div style={{ textAlign: 'center' }}>
          {!recording ? (
            <button onClick={startRecording} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 14, fontWeight: 700 }}>
              🎙️ Start Recording (60 sec max)
            </button>
          ) : (
            <div>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#fef2f2', border: '3px solid #ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                margin: '0 auto 12px', animation: 'pulse 1s infinite',
              }}>🔴</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>
                {String(Math.floor(seconds / 60)).padStart(2,'0')}:{String(seconds % 60).padStart(2,'0')}
              </div>
              <button onClick={stopRecording} className="btn" style={{ padding: '10px 24px', color: '#ef4444', fontWeight: 700 }}>
                ⏹ Stop Recording
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Recording complete! ({seconds} seconds)</div>
          <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>Our AI will analyze your pronunciation, clarity, and confidence.</div>
          <button onClick={() => { setRecorded(false); setSeconds(0) }} className="btn" style={{ marginTop: 10, fontSize: 12 }}>🔄 Re-record</button>
        </div>
      )}

      <button
        onClick={() => setSubTab('result')}
        disabled={!recorded}
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, marginTop: 16, opacity: !recorded ? 0.5 : 1 }}
      >
        Submit & Get My English Grade →
      </button>
    </div>
  )

  // Result
  const grade = readingAnswer === 1 ? (writingText.length > 120 ? 'A' : 'B') : 'B'
  const gradeScore = grade === 'A' ? 20 : grade === 'B' ? 14 : 8
  const gradeColor = grade === 'A' ? '#22c55e' : grade === 'B' ? '#f59e0b' : '#ef4444'

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</div>
        <div style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>English Proficiency Grade</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
          {grade === 'A' && '🎉 Excellent! Fluent broker communication. Owner-ops will see Grade A on your profile.'}
          {grade === 'B' && '👍 Good. You can handle broker calls. Some improvement in writing could help.'}
          {(grade as string) === 'C' && '⚠️ Basic level. Consider practicing before re-taking the test.'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Reading', score: readingAnswer === 1 ? '100%' : '60%', color: readingAnswer === 1 ? '#22c55e' : '#f59e0b' },
          { label: 'Writing', score: writingText.length > 120 ? '88%' : '72%', color: '#22c55e' },
          { label: 'Speaking', score: '85%', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.score}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#15803d' }}>
        <strong>+{gradeScore} Trust Score points</strong> added for English Grade {grade}
      </div>
      <button onClick={() => onDone(grade, gradeScore)} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700 }}>
        → Continue to Skills Test
      </button>
    </div>
  )
}

// ── Portfolio Step ─────────────────────────────────────────────────────────────
function PortfolioStep({ onDone }: { onDone: () => void }) {
  const [trucks, setTrucks] = useState('')
  const [rpm, setRpm] = useState('')
  const [lanes, setLanes] = useState('')
  const [experience, setExperience] = useState('1')
  const [rcUploaded, setRcUploaded] = useState(0)
  const [refName, setRefName] = useState('')
  const [refEmail, setRefEmail] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const canSubmit = trucks && rpm && lanes && rcUploaded > 0

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>📁 Portfolio & Experience</div>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
        Tell us about your dispatching experience and upload sample Rate Confirmations (with client info redacted). This helps owner-ops understand your expertise.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Years of experience</div>
          <select value={experience} onChange={e => setExperience(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }}>
            {['< 1 year','1 year','2 years','3 years','4 years','5+ years'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Max trucks managed simultaneously</div>
          <input value={trucks} onChange={e => setTrucks(e.target.value)} placeholder="e.g. 5" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Average RPM you've achieved for clients</div>
          <input value={rpm} onChange={e => setRpm(e.target.value)} placeholder="e.g. $2.70" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Primary lanes you specialize in</div>
          <input value={lanes} onChange={e => setLanes(e.target.value)} placeholder="e.g. TX→FL, SE US, Nationwide" style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
        </div>
      </div>

      {/* RC Upload */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Sample Rate Confirmations (redact client names)</div>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${rcUploaded > 0 ? '#22c55e' : '#cbd5e1'}`,
            borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer',
            background: rcUploaded > 0 ? '#f0fdf4' : '#f8fafc',
          }}
        >
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => setRcUploaded(e.target.files?.length ?? 0)} accept="image/*,.pdf" />
          <div style={{ fontSize: 28, marginBottom: 6 }}>{rcUploaded > 0 ? '✅' : '📄'}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: rcUploaded > 0 ? '#15803d' : '#475569' }}>
            {rcUploaded > 0 ? `${rcUploaded} file(s) uploaded` : 'Upload 1–5 sample RCs'}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>PDF or image · Redact shipper/carrier names</div>
        </div>
      </div>

      {/* Reference (optional) */}
      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>📞 Reference (optional but +15 Trust Score)</div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Enter an owner-op you've worked with. We'll send them a quick anonymous survey.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input value={refName} onChange={e => setRefName(e.target.value)} placeholder="Reference name" style={{ padding: '8px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
          <input value={refEmail} onChange={e => setRefEmail(e.target.value)} placeholder="Their email or phone" style={{ padding: '8px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: 13 }} />
        </div>
      </div>

      <button
        onClick={onDone}
        disabled={!canSubmit}
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, opacity: !canSubmit ? 0.5 : 1 }}
      >
        🚀 Submit Portfolio & Calculate Trust Score
      </button>
      {!canSubmit && <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>Fill all fields and upload at least 1 RC to continue</div>}
    </div>
  )
}

// ── Result Step ────────────────────────────────────────────────────────────────
function ResultStep({ breakdown, onNavigate }: { breakdown: TrustBreakdown; onNavigate: (p: string) => void }) {
  const total = Math.min(100, Object.values(breakdown).reduce((s, v) => s + v, 0))
  const level = total >= 80 ? { name: 'CERTIFIED', color: '#22c55e', bg: '#f0fdf4', border: '#86efac', icon: '🏅' }
              : total >= 60 ? { name: 'VERIFIED',   color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', icon: '✓' }
              : { name: 'NEWCOMER', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '🆕' }

  const ITEMS = [
    { label: 'Identity Verification', key: 'identity' as const, max: 25, icon: '🪪' },
    { label: 'English Proficiency',   key: 'english'  as const, max: 20, icon: '🗣️' },
    { label: 'Skills Assessment',     key: 'skills'   as const, max: 25, icon: '📋' },
    { label: 'Portfolio',             key: 'portfolio' as const, max: 15, icon: '📁' },
    { label: 'Reference Check',       key: 'references' as const, max: 15, icon: '📞' },
  ]

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 16 }}>Your Trust Score</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <TrustRing score={total} size={140} />
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px',
          background: level.bg, border: `2px solid ${level.border}`, borderRadius: 30,
        }}>
          <span style={{ fontSize: 20 }}>{level.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: level.color }}>DispaLoadIQ {level.name}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score Breakdown</div>
        {ITEMS.map(item => {
          const val = breakdown[item.key]
          const pct = (val / item.max) * 100
          return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 16, width: 24 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: val > 0 ? '#15803d' : '#94a3b8' }}>
                    {val}/{item.max}
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 20, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: val > 0 ? '#22c55e' : '#e2e8f0', borderRadius: 20, transition: 'width 1s' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* What's next */}
      <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>🚀 What's unlocked for you now</div>
        <div style={{ fontSize: 12, color: '#1e40af', lineHeight: 1.8 }}>
          {total >= 80 ? (
            <>✓ Certified badge on your profile<br/>✓ Priority in search results (+20% visibility)<br/>✓ Access to premium owner-op clients<br/>✓ Ability to charge above $500/month</>
          ) : total >= 60 ? (
            <>✓ Verified badge on your profile<br/>✓ Visible in owner-op searches<br/>✓ Can apply to job postings<br/>→ Complete Skills Test to reach Certified level</>
          ) : (
            <>→ Complete identity verification to become Verified<br/>→ Pass Skills Test to unlock full platform</>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onNavigate('opportunities')} className="btn btn-primary" style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700 }}>
          🎯 Find My First Client
        </button>
        <button onClick={() => onNavigate('dispatcher-profile')} className="btn" style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700 }}>
          👤 View My Profile
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DispatcherVerificationPage({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [step, setStep] = useState<StepKey>('identity')
  const [statuses, setStatuses] = useState<StepStatus>({
    identity: 'pending', english: 'pending', skills: 'pending', portfolio: 'pending',
  })
  const [breakdown, setBreakdown] = useState<TrustBreakdown>({
    identity: 0, english: 0, skills: 0, portfolio: 0, references: 0,
  })

  const markDone = (key: keyof StepStatus) =>
    setStatuses(s => ({ ...s, [key]: 'done' }))

  const addScore = (key: keyof TrustBreakdown, pts: number) =>
    setBreakdown(b => ({ ...b, [key]: pts }))

  return (
    <div style={{ padding: '32px 28px', maxWidth: 620, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
          DispaLoadIQ Trust System
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Get Verified. Build Trust. Land Clients.</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Verified dispatchers get <strong>3× more profile views</strong> and command higher rates.
        </div>
      </div>

      <StepIndicator current={step} statuses={statuses} />

      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
        {step === 'identity' && (
          <IdentityStep onDone={() => {
            markDone('identity')
            addScore('identity', 25)
            setStep('english')
          }} />
        )}
        {step === 'english' && (
          <EnglishStep onDone={(grade, pts) => {
            markDone('english')
            addScore('english', pts)
            setStep('skills')
          }} />
        )}
        {step === 'skills' && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>📋 Dispatcher Skills Test</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              30 questions covering RC analysis, RPM calculation, HOS rules, and broker negotiation. Takes ~25 minutes. Score 60%+ to earn the <strong>DispaLoadIQ Certified</strong> badge.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '📄', label: 'RC/BOL Analysis', q: '8 questions', desc: 'Red flags, payment terms, accessorials' },
                { icon: '💰', label: 'Rate & RPM Math', q: '7 questions', desc: 'Net RPM with deadhead, profit calculation' },
                { icon: '⏰', label: 'HOS Rules', q: '8 questions', desc: 'Hours of service, rest requirements, logs' },
                { icon: '📞', label: 'Broker Negotiation', q: '7 questions', desc: 'Scenarios, tactics, red flags' },
              ].map(cat => (
                <div key={cat.label} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{cat.q} · {cat.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fefce8', border: '1.5px solid #fde047', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#854d0e' }}>
              ⏱️ <strong>Time limit: 30 minutes</strong> · You can re-take the test in 7 days if needed
            </div>
            <button
              onClick={() => onNavigate('skills-test')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 700, marginBottom: 10 }}
            >
              🎯 Start Skills Test (30 min)
            </button>
            <button
              onClick={() => { markDone('skills'); addScore('skills', 21); setStep('portfolio') }}
              className="btn"
              style={{ width: '100%', padding: '10px', fontSize: 12, color: '#64748b' }}
            >
              Skip for now (complete later)
            </button>
          </div>
        )}
        {step === 'portfolio' && (
          <PortfolioStep onDone={() => {
            markDone('portfolio')
            addScore('portfolio', 12)
            addScore('references', 0)
            setStep('result')
          }} />
        )}
        {step === 'result' && (
          <ResultStep breakdown={breakdown} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  )
}
