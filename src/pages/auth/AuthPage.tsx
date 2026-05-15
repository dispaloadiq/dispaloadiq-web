import { useState } from 'react'
import type { UserRole } from '../../types'
import { useAuth } from '../../lib/AuthContext'

interface Props { onLogin: (role: UserRole, name: string, isNew?: boolean) => void }

// ── Demo accounts — one click per role ───────────────────────────────────────
const DEMO_ACCOUNTS: {
  role: UserRole; name: string; email: string
  icon: string; label: string; tagline: string; color: string; features: string[]
  isNew?: boolean
}[] = [
  {
    role: 'owner-op', name: 'Mike Rodriguez', email: 'mike@demo.com',
    icon: '🚛', label: 'Owner-Operator', tagline: 'Solo driver · 1 truck',
    color: '#4BAED4',
    features: ['AI Load Board', 'Trip TMS', 'Broker CRM', 'IFTA Reports'],
  },
  {
    role: 'dispatcher', name: 'Alex Petrov', email: 'alex@demo.com',
    icon: '🧭', label: 'Dispatcher', tagline: 'Remote dispatcher · 4 clients',
    color: '#8B5CF6',
    features: ['Client Fleet Board', 'Commission Tracking', 'Hire Requests', 'Marketplace'],
  },
  {
    role: 'dispatcher', name: 'Alex (New)', email: 'new-dispatcher@demo.com',
    icon: '🆕', label: 'New Dispatcher', tagline: '0 clients · onboarding flow',
    color: '#7C3AED',
    features: ['Find Owner-Ops', 'Profile Builder', 'Proposal Flow', 'Locked Features'],
    isNew: true,
  },
  {
    role: 'company', name: 'Irina Transport LLC', email: 'irina@demo.com',
    icon: '🏢', label: 'Transport Company', tagline: '5-truck fleet · full ops',
    color: '#059669',
    features: ['Fleet TMS', 'Orders Pipeline', 'Customer CRM', 'Driver Payroll'],
  },
  {
    role: 'shipper', name: 'Sarah Mitchell', email: 'sarah@demo.com',
    icon: '📦', label: 'Shipper', tagline: 'Freight shipper · 3+ routes',
    color: '#D97706',
    features: ['Post Loads', 'Track Shipments', 'Find Carriers', 'Spend Analytics'],
  },
]

const PLATFORM_STATS = [
  { value: '12,400+', label: 'Active Users',        icon: '👤' },
  { value: '$2.4M',   label: 'Loads / Month',       icon: '📦' },
  { value: '98%',     label: 'On-Time Delivery',    icon: '✅' },
  { value: '4.9★',    label: 'App Rating',          icon: '⭐' },
]

const TESTIMONIALS = [
  { text: 'Found my dispatcher in 2 days. Revenue up 18% first month.', author: 'Mike R.', role: 'Owner-Operator · Dallas, TX' },
  { text: 'Trip P&L per load completely changed how I run my business.', author: 'Irina K.', role: 'Fleet Owner · Chicago, IL' },
  { text: 'Zero phone calls asking "where\'s my load?" — clients track everything themselves.', author: 'Alex P.', role: 'Dispatcher · Los Angeles, CA' },
]

type Tab = 'login' | 'register'

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8,
  border: '1.5px solid #E2E8F0', fontSize: 13,
  background: '#fff', boxSizing: 'border-box',
}

const submitBtnStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: 9, border: 'none',
  background: 'linear-gradient(135deg, #4BAED4, #2D7A9A)',
  color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(75,174,212,.35)',
}

export default function AuthPage({ onLogin }: Props) {
  const { signIn, signUp } = useAuth()

  const [tab, setTab]             = useState<Tab>('login')
  const [step, setStep]           = useState<'creds' | 'role'>('creds')
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tIdx, setTIdx]           = useState(0)
  const [hoveredDemo, setHoveredDemo] = useState<UserRole | null>(null)

  // ── Demo quick-login (bypasses Supabase for instant preview) ─────────────
  const handleDemoLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    onLogin(demo.role, demo.name, demo.isNew)
  }

  const handleCreds = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }

    if (tab === 'login') {
      // 1. Check demo accounts first (works without Supabase)
      const demo = DEMO_ACCOUNTS.find(d => d.email === email.toLowerCase())
      if (demo) { onLogin(demo.role, demo.name, demo.isNew); return }

      // 2. Real Supabase sign-in
      setSubmitting(true)
      let err: Error | null = null
      try {
        const timeout = new Promise<{ error: Error }>(resolve =>
          setTimeout(() => resolve({ error: new Error('Нет ответа от сервера (10 сек). Проверь что проект активен на supabase.com') }), 10000)
        )
        const result = await Promise.race([signIn(email, password), timeout])
        err = result.error
      } catch (e: unknown) {
        err = e instanceof Error ? e : new Error(String(e))
      }
      setSubmitting(false)
      if (err) {
        const msg = err.message || ''
        if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('email_not_confirmed')) {
          setError('Email не подтверждён. Проверь почту или отключи подтверждение в Supabase.')
        } else if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid_credentials')) {
          setError('Неверный email или пароль.')
        } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
          setError('Ошибка сети. Проверь интернет-соединение.')
        } else {
          setError(msg || 'Ошибка входа. Проверь данные.')
        }
        return
      }
      // onAuthStateChange in AuthContext will update profile → App re-renders
      onLogin('owner-op', email.split('@')[0]) // fallback; profile sets real role

    } else {
      // Register flow — step 1: validate creds
      if (!name.trim()) { setError('Please enter your full name'); return }
      setStep('role')
    }
  }

  const handleFinish = async () => {
    if (!selectedRole) { setError('Please select a role'); return }
    setSubmitting(true)
    setError('')

    const { error: err } = await signUp(email, password, selectedRole, name)
    setSubmitting(false)

    if (err) {
      // Common: email already registered
      if (err.message?.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.')
      } else {
        setError(err.message || 'Registration failed. Please try again.')
      }
      return
    }
    // Success — Supabase sends confirmation email (or auto-confirms in dev)
    onLogin(selectedRole, name)
  }

  const t = TESTIMONIALS[tIdx]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* ── LEFT: Branding ──────────────────────────────────────────────── */}
      <div style={{
        width: '50%', minWidth: 480,
        background: 'linear-gradient(160deg, #0F1C2E 0%, #1A2535 60%, #1a3a4a 100%)',
        display: 'flex', flexDirection: 'column', padding: '48px 52px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', marginBottom: 44 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
            🚛 <span style={{ color: '#4BAED4' }}>Dispa</span>LoadIQ
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>AI-Powered Trucking Platform</div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 14, letterSpacing: '-1px' }}>
            The Operating System<br />
            <span style={{ color: '#4BAED4' }}>for Truck Business</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, marginBottom: 28, maxWidth: 380 }}>
            Dispatcher marketplace, AI load board, fleet TMS, IFTA reporting, and real-time tracking — built for the trucking industry.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 32 }}>
            {['🧭 Dispatcher Exchange', '🤖 AI Load Matching', '💰 Trip P&L', '📡 Live Tracking', '🗺️ IFTA Reports', '📋 Fleet TMS'].map(f => (
              <span key={f} style={{
                fontSize: 11, padding: '5px 11px', borderRadius: 20, fontWeight: 600,
                background: 'rgba(75,174,212,.12)', color: '#4BAED4',
                border: '1px solid rgba(75,174,212,.25)',
              }}>{f}</span>
            ))}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 28 }}>
            {PLATFORM_STATS.map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '14px 16px',
                border: '1px solid rgba(255,255,255,.07)',
              }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{ background: 'rgba(255,255,255,.05)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(255,255,255,.07)', marginTop: 'auto' }}>
            <div style={{ fontSize: 22, color: '#4BAED4', lineHeight: 1, marginBottom: 8 }}>"</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', lineHeight: 1.6, marginBottom: 10 }}>{t.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.author}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{t.role}</div>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTIdx(i)} style={{
                    width: 6, height: 6, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
                    background: i === tIdx ? '#4BAED4' : 'rgba(255,255,255,.25)',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth panel ────────────────────────────────────────────── */}
      <div style={{
        flex: 1, background: '#F7FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* ── DEMO QUICK ACCESS ─────────────────────────────────────── */}
          <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '18px', marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1A2535' }}>⚡ Try a Demo — No Signup</div>
              <span style={{ fontSize: 10, background: '#EBF8FF', color: '#2C7A9A', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>INSTANT ACCESS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {DEMO_ACCOUNTS.map(d => (
                <button
                  key={d.role}
                  onClick={() => handleDemoLogin(d)}
                  onMouseEnter={() => setHoveredDemo(d.role)}
                  onMouseLeave={() => setHoveredDemo(null)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '11px 13px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${hoveredDemo === d.role ? d.color : '#E2E8F0'}`,
                    background: hoveredDemo === d.role ? d.color + '10' : '#F7FAFC',
                    transition: 'all .15s', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{d.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>{d.label}</div>
                  <div style={{ fontSize: 10, color: '#718096', marginTop: 1 }}>{d.tagline}</div>
                  {hoveredDemo === d.role && (
                    <div style={{ marginTop: 6 }}>
                      {d.features.slice(0, 3).map(f => (
                        <div key={f} style={{ fontSize: 9, color: d.color, fontWeight: 700 }}>✓ {f}</div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 600, whiteSpace: 'nowrap' }}>OR SIGN IN WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* ── CREDENTIALS STEP ──────────────────────────────────────── */}
          {step === 'creds' ? (
            <>
              {/* Tab toggle */}
              <div style={{ display: 'flex', background: '#EEF2F7', borderRadius: 10, padding: 4, marginBottom: 22 }}>
                {(['login', 'register'] as Tab[]).map(tv => (
                  <button key={tv} onClick={() => { setTab(tv); setError('') }} style={{
                    flex: 1, padding: '9px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 13,
                    background: tab === tv ? '#fff' : 'transparent',
                    color: tab === tv ? '#1A2535' : '#718096',
                    boxShadow: tab === tv ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                    transition: 'all .15s',
                  }}>
                    {tv === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A2535', marginBottom: 4 }}>
                {tab === 'login' ? 'Welcome back 👋' : 'Join DispaLoadIQ'}
              </h2>
              <p style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>
                {tab === 'login' ? 'Sign in to your account' : 'Free account · No credit card required'}
              </p>

              <form onSubmit={handleCreds} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {tab === 'register' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 5 }}>Full Name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      placeholder="Mike Rodriguez" style={inputStyle} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 5 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" style={inputStyle} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568' }}>Password</label>
                    {tab === 'login' && (
                      <button type="button" style={{ fontSize: 11, color: '#4BAED4', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" style={inputStyle} />
                </div>

                {error && (
                  <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C53030' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...submitBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {submitting ? (
                    <>
                      <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                      Signing in...
                    </>
                  ) : (
                    tab === 'login' ? 'Sign In →' : 'Continue →'
                  )}
                </button>
              </form>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

              {tab === 'login' && (
                <div style={{ marginTop: 14, padding: '11px 14px', background: '#F0FFF4', borderRadius: 10, border: '1px solid #C6F6D5' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#276749', marginBottom: 4 }}>💡 Demo credentials (any password)</div>
                  <div style={{ fontSize: 10, color: '#2F855A', lineHeight: 1.7 }}>
                    mike@demo.com · alex@demo.com · new-dispatcher@demo.com<br />irina@demo.com · sarah@demo.com
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ── ROLE SELECTION ───────────────────────────────────────── */
            <>
              <button onClick={() => setStep('creds')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#718096', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}>
                ← Back
              </button>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1A2535', marginBottom: 4 }}>What describes you?</h2>
              <p style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>Your role personalises the entire platform</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
                {DEMO_ACCOUNTS.map(d => (
                  <button key={d.role} onClick={() => setSelectedRole(d.role)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 12,
                    cursor: 'pointer', textAlign: 'left',
                    border: `2px solid ${selectedRole === d.role ? d.color : '#E2E8F0'}`,
                    background: selectedRole === d.role ? d.color + '10' : '#fff',
                    transition: 'all .15s',
                  }}>
                    <div style={{ fontSize: 26, flexShrink: 0 }}>{d.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{d.tagline}</div>
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                        {d.features.slice(0, 3).map(f => (
                          <span key={f} style={{ fontSize: 9, padding: '2px 6px', background: d.color + '18', color: d.color, borderRadius: 6, fontWeight: 700 }}>{f}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${selectedRole === d.role ? d.color : '#E2E8F0'}`,
                      background: selectedRole === d.role ? d.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedRole === d.role && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#C53030', marginBottom: 12 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleFinish}
                disabled={submitting || !selectedRole}
                style={{ ...submitBtnStyle, opacity: (selectedRole && !submitting) ? 1 : 0.55, cursor: (!selectedRole || submitting) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    Creating account...
                  </>
                ) : 'Create Account →'}
              </button>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 10, color: '#CBD5E0', marginTop: 18, lineHeight: 1.5 }}>
            By continuing you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
