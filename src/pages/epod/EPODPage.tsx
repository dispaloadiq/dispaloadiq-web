import { useState, useRef, useEffect, useCallback } from 'react'
import type { UserRole } from '../../types'

// ─── Types ────────────────────────────────────────────────────────────────────
type DeliveryStatus = 'picked_up' | 'in_transit' | 'arrived' | 'delivering' | 'delivered' | 'exception'

interface DeliveryPhoto {
  id: string
  label: string
  takenAt: string
  color: string // placeholder color for mock
}

interface Delivery {
  id: string
  loadId: string
  broker: string
  brokerEmail: string
  origin: string
  destination: string
  driver: string
  truck: string
  trailer: string
  recipient: string
  recipientPhone: string
  recipientEmail: string
  commodity: string
  weight: string
  pieces: number
  scheduledDelivery: string
  status: DeliveryStatus
  statusUpdatedAt: string
  location: string
  lat: number
  lng: number
  photos: DeliveryPhoto[]
  signed: boolean
  signatureDataUrl?: string
  sentToBroker: boolean
  sentAt?: string
  bolNumber: string
  proNumber: string
  notes: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_DELIVERIES: Delivery[] = [
  {
    id: 'd1',
    loadId: 'LD-2847',
    broker: 'Echo Global Logistics',
    brokerEmail: 'dispatch@echo.com',
    origin: 'Chicago, IL',
    destination: 'Indianapolis, IN',
    driver: 'Mike Johnson',
    truck: 'TRK-047',
    trailer: 'TRL-112',
    recipient: 'Amazon Fulfillment Center',
    recipientPhone: '(317) 555-0182',
    recipientEmail: 'receiving.ind@amazon.com',
    commodity: 'Consumer Electronics',
    weight: '42,500 lbs',
    pieces: 24,
    scheduledDelivery: '2026-05-12 10:00',
    status: 'arrived',
    statusUpdatedAt: '2026-05-12 09:47',
    location: 'Indianapolis, IN',
    lat: 39.7684,
    lng: -86.1581,
    photos: [
      { id: 'p1', label: 'Trailer seal intact', takenAt: '09:48', color: '#4BAED4' },
      { id: 'p2', label: 'Cargo secured', takenAt: '09:49', color: '#38C770' },
    ],
    signed: false,
    sentToBroker: false,
    bolNumber: 'BOL-2026-04891',
    proNumber: 'PRO-774821',
    notes: '',
  },
  {
    id: 'd2',
    loadId: 'LD-2851',
    broker: 'Coyote Logistics',
    brokerEmail: 'ops@coyote.com',
    origin: 'Detroit, MI',
    destination: 'Columbus, OH',
    driver: 'Sarah Williams',
    truck: 'TRK-031',
    trailer: 'TRL-088',
    recipient: 'Walmart DC #6094',
    recipientPhone: '(614) 555-0241',
    recipientEmail: 'dc6094.receiving@walmart.com',
    commodity: 'Dry Goods / Grocery',
    weight: '38,200 lbs',
    pieces: 36,
    scheduledDelivery: '2026-05-12 14:00',
    status: 'in_transit',
    statusUpdatedAt: '2026-05-12 11:30',
    location: 'Toledo, OH',
    lat: 41.6639,
    lng: -83.5552,
    photos: [],
    signed: false,
    sentToBroker: false,
    bolNumber: 'BOL-2026-04897',
    proNumber: 'PRO-774829',
    notes: '',
  },
  {
    id: 'd3',
    loadId: 'LD-2839',
    broker: 'TQL',
    brokerEmail: 'tracking@tql.com',
    origin: 'Nashville, TN',
    destination: 'Atlanta, GA',
    driver: 'Carlos Rivera',
    truck: 'TRK-019',
    trailer: 'TRL-055',
    recipient: 'Home Depot RDC Atlanta',
    recipientPhone: '(404) 555-0374',
    recipientEmail: 'atlanta.rdc@homedepot.com',
    commodity: 'Hardware / Tools',
    weight: '44,100 lbs',
    pieces: 18,
    scheduledDelivery: '2026-05-11 16:00',
    status: 'delivered',
    statusUpdatedAt: '2026-05-11 15:42',
    location: 'Atlanta, GA',
    lat: 33.749,
    lng: -84.388,
    photos: [
      { id: 'p3', label: 'Unloading complete', takenAt: '15:35', color: '#F6AD55' },
      { id: 'p4', label: 'Empty trailer check', takenAt: '15:40', color: '#68D391' },
      { id: 'p5', label: 'Dock area clear', takenAt: '15:41', color: '#76E4F7' },
    ],
    signed: true,
    signatureDataUrl: 'mock',
    sentToBroker: true,
    sentAt: '2026-05-11 15:55',
    bolNumber: 'BOL-2026-04822',
    proNumber: 'PRO-774763',
    notes: 'Delivery completed on time. Receiver: J. Martinez',
  },
  {
    id: 'd4',
    loadId: 'LD-2854',
    broker: 'Uber Freight',
    brokerEmail: 'support@uberfreight.com',
    origin: 'Dallas, TX',
    destination: 'Houston, TX',
    driver: 'Tom Bradley',
    truck: 'TRK-062',
    trailer: 'TRL-134',
    recipient: 'Shell Chemical Plant',
    recipientPhone: '(713) 555-0519',
    recipientEmail: 'logistics@shell.com',
    commodity: 'Industrial Chemicals',
    weight: '39,800 lbs',
    pieces: 4,
    scheduledDelivery: '2026-05-12 08:00',
    status: 'exception',
    statusUpdatedAt: '2026-05-12 07:55',
    location: 'Houston, TX',
    lat: 29.7604,
    lng: -95.3698,
    photos: [
      { id: 'p6', label: 'Gate access denied', takenAt: '07:55', color: '#FC8181' },
    ],
    signed: false,
    sentToBroker: false,
    bolNumber: 'BOL-2026-04901',
    proNumber: 'PRO-774835',
    notes: 'Gate security requires updated HAZMAT paperwork. Awaiting broker resolution.',
  },
]

const HISTORY_DELIVERIES: Delivery[] = [
  {
    id: 'h1', loadId: 'LD-2801', broker: 'CH Robinson', brokerEmail: 'ops@chrobinson.com',
    origin: 'Memphis, TN', destination: 'St. Louis, MO',
    driver: 'Mike Johnson', truck: 'TRK-047', trailer: 'TRL-112',
    recipient: 'Target Distribution', recipientPhone: '(314) 555-0100',
    recipientEmail: 'receiving@target.com', commodity: 'General Merchandise',
    weight: '41,000 lbs', pieces: 30,
    scheduledDelivery: '2026-05-10 09:00', status: 'delivered',
    statusUpdatedAt: '2026-05-10 08:52', location: 'St. Louis, MO', lat: 38.627, lng: -90.198,
    photos: [
      { id: 'ph1', label: 'Delivery confirmed', takenAt: '08:48', color: '#4BAED4' },
    ],
    signed: true, signatureDataUrl: 'mock', sentToBroker: true, sentAt: '2026-05-10 09:05',
    bolNumber: 'BOL-2026-04751', proNumber: 'PRO-774690', notes: 'No issues.',
  },
  {
    id: 'h2', loadId: 'LD-2788', broker: 'XPO Logistics', brokerEmail: 'dispatch@xpo.com',
    origin: 'Kansas City, MO', destination: 'Denver, CO',
    driver: 'Sarah Williams', truck: 'TRK-031', trailer: 'TRL-088',
    recipient: 'King Soopers Warehouse', recipientPhone: '(720) 555-0228',
    recipientEmail: 'wh.denver@kingsoopers.com', commodity: 'Frozen Food',
    weight: '36,500 lbs', pieces: 44,
    scheduledDelivery: '2026-05-09 13:00', status: 'delivered',
    statusUpdatedAt: '2026-05-09 13:18', location: 'Denver, CO', lat: 39.739, lng: -104.984,
    photos: [], signed: true, signatureDataUrl: 'mock', sentToBroker: true, sentAt: '2026-05-09 13:30',
    bolNumber: 'BOL-2026-04702', proNumber: 'PRO-774631', notes: '',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_META: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: string }> = {
  picked_up:  { label: 'Picked Up',   color: '#2D7A9A', bg: '#EBF8FF', icon: '📦' },
  in_transit: { label: 'In Transit',  color: '#7B4F1A', bg: '#FFFAF0', icon: '🚛' },
  arrived:    { label: 'Arrived',     color: '#1A6B8A', bg: '#E0F7FA', icon: '📍' },
  delivering: { label: 'Delivering',  color: '#5A4A1A', bg: '#FFF9E6', icon: '🔄' },
  delivered:  { label: 'Delivered',   color: '#1A6B40', bg: '#F0FFF4', icon: '✅' },
  exception:  { label: 'Exception',   color: '#7B1A1A', bg: '#FFF0F0', icon: '⚠️' },
}

const TIMELINE_STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: 'picked_up',  label: 'Picked Up' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'arrived',    label: 'Arrived' },
  { status: 'delivering', label: 'Delivering' },
  { status: 'delivered',  label: 'Delivered' },
]

const STATUS_ORDER: Record<DeliveryStatus, number> = {
  picked_up: 0, in_transit: 1, arrived: 2, delivering: 3, delivered: 4, exception: 5,
}

function statusStep(status: DeliveryStatus): number {
  return STATUS_ORDER[status] ?? 0
}

// ─── QR Code SVG Generator ────────────────────────────────────────────────────
function generateQRMatrix(seed: string): boolean[][] {
  // Deterministic pseudo-random matrix from seed
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const size = 25
  const matrix: boolean[][] = []
  for (let r = 0; r < size; r++) {
    matrix[r] = []
    for (let c = 0; c < size; c++) {
      const v = ((hash ^ (r * 31 + c * 17 + r * c)) * 1664525 + 1013904223) | 0
      matrix[r][c] = (v & 1) === 1
    }
  }
  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        matrix[row + r][col + c] = edge || inner
      }
    }
  }
  drawFinder(0, 0)
  drawFinder(0, size - 7)
  drawFinder(size - 7, 0)
  return matrix
}

function QRCodeSVG({ value, size = 160 }: { value: string; size?: number }) {
  const matrix = generateQRMatrix(value)
  const n = matrix.length
  const cell = size / n

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ borderRadius: 8, background: '#fff', display: 'block' }}>
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell} y={r * cell}
              width={cell} height={cell}
              fill="#1A2535"
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ─── Signature Pad ────────────────────────────────────────────────────────────
function SignaturePad({ onSave, onClear, hasSignature }: {
  onSave: (dataUrl: string) => void
  onClear: () => void
  hasSignature: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const t = e.touches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawing.current = true
    lastPos.current = getPos(e, canvas)
  }, [])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e, canvas)
    if (lastPos.current) {
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#1A2535'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    }
    lastPos.current = pos
  }, [])

  const endDraw = useCallback(() => {
    drawing.current = false
    lastPos.current = null
  }, [])

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL())
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    onClear()
  }

  return (
    <div>
      <div style={{
        border: '2px dashed #CBD5E0', borderRadius: 10, overflow: 'hidden',
        background: '#FAFBFC', cursor: 'crosshair',
      }}>
        <canvas
          ref={canvasRef}
          width={440} height={140}
          style={{ display: 'block', width: '100%', height: 140, touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={handleClear} style={{
          flex: 1, padding: '8px', background: '#F7FAFC', border: '1px solid #E2E8F0',
          borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#4A5568',
        }}>
          ✕ Clear
        </button>
        <button onClick={handleSave} style={{
          flex: 2, padding: '8px', background: '#4BAED4', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff',
        }}>
          ✓ Save Signature
        </button>
      </div>
      {hasSignature && (
        <div style={{
          marginTop: 6, padding: '6px 10px', background: '#F0FFF4',
          border: '1px solid #9AE6B4', borderRadius: 8, fontSize: 12, color: '#276749',
        }}>
          ✅ Signature captured
        </div>
      )}
    </div>
  )
}

// ─── Mini Map Placeholder ──────────────────────────────────────────────────────
function MiniMap({ lat, lng, location }: { lat: number; lng: number; location: string }) {
  return (
    <div style={{
      width: '100%', height: 120, background: 'linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 100%)',
      borderRadius: 10, border: '1px solid #BEE3F8', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid lines */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: `${(i + 1) * 20}%`,
          borderTop: '1px solid rgba(74,174,212,.2)',
        }} />
      ))}
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, bottom: 0, left: `${(i + 1) * 14.3}%`,
          borderLeft: '1px solid rgba(74,174,212,.2)',
        }} />
      ))}
      <div style={{ fontSize: 28, zIndex: 1 }}>📍</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#2D7A9A', zIndex: 1 }}>{location}</div>
      <div style={{ fontSize: 10, color: '#4A90A4', zIndex: 1 }}>
        {lat.toFixed(4)}°N, {Math.abs(lng).toFixed(4)}°W
      </div>
    </div>
  )
}

// ─── Send Documents Modal ──────────────────────────────────────────────────────
function SendDocsModal({ delivery, onClose, onSent }: {
  delivery: Delivery
  onClose: () => void
  onSent: () => void
}) {
  const [sendBOL, setSendBOL] = useState(true)
  const [sendPOD, setSendPOD] = useState(true)
  const [sendPhotos, setSendPhotos] = useState(true)
  const [toEmails, setToEmails] = useState(`${delivery.brokerEmail}, ${delivery.recipientEmail}`)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1400))
    setSending(false)
    setSent(true)
    setTimeout(() => {
      onSent()
      onClose()
    }, 1000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}
      onClick={onClose}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
      }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2535' }}>📧 Send Documents</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#718096' }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: '#4A5568', marginBottom: 16 }}>
          Load <strong>{delivery.loadId}</strong> · BOL {delivery.bolNumber}
        </div>

        {/* Recipients */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 4 }}>
            To (comma-separated)
          </label>
          <textarea
            value={toEmails}
            onChange={e => setToEmails(e.target.value)}
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 10px',
              border: '1px solid #CBD5E0', borderRadius: 8, fontSize: 13,
              fontFamily: 'inherit', resize: 'none', outline: 'none',
            }}
          />
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 8 }}>Attachments</div>
          {[
            { id: 'bol', label: `📄 Bill of Lading — ${delivery.bolNumber}`, val: sendBOL, set: setSendBOL },
            { id: 'pod', label: `✅ Proof of Delivery — ${delivery.proNumber}`, val: sendPOD, set: setSendPOD },
            { id: 'photos', label: `📸 Delivery Photos (${delivery.photos.length})`, val: sendPhotos, set: setSendPhotos, disabled: delivery.photos.length === 0 },
          ].map(item => (
            <label key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
              background: '#F7FAFC', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
              opacity: item.disabled ? 0.5 : 1,
            }}>
              <input
                type="checkbox"
                checked={item.val}
                disabled={item.disabled}
                onChange={e => item.set(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, color: '#2D3748' }}>{item.label}</span>
            </label>
          ))}
        </div>

        {sent ? (
          <div style={{
            padding: '12px', background: '#F0FFF4', border: '1px solid #9AE6B4',
            borderRadius: 10, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#276749',
          }}>
            ✅ Documents sent successfully!
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={sending || (!sendBOL && !sendPOD && !sendPhotos)}
            style={{
              width: '100%', padding: '12px', background: sending ? '#A0AEC0' : '#4BAED4',
              border: 'none', borderRadius: 10, color: '#fff', fontSize: 14,
              fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? '⏳ Sending…' : '📤 Send Documents'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Delivery Detail Panel ────────────────────────────────────────────────────
function DeliveryDetail({ delivery: initial, onUpdate }: {
  delivery: Delivery
  onUpdate: (d: Delivery) => void
}) {
  const [delivery, setDelivery] = useState(initial)
  const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'photos' | 'sign'>('overview')
  const [showSendModal, setShowSendModal] = useState(false)
  const [notes, setNotes] = useState(delivery.notes)

  useEffect(() => {
    setDelivery(initial)
    setNotes(initial.notes)
    setActiveTab('overview')
  }, [initial.id])

  const update = (patch: Partial<Delivery>) => {
    const updated = { ...delivery, ...patch }
    setDelivery(updated)
    onUpdate(updated)
  }

  const sm = STATUS_META[delivery.status]
  const step = statusStep(delivery.status)
  const isException = delivery.status === 'exception'

  const TABS = [
    { id: 'overview', label: '📋 Overview' },
    { id: 'qr',       label: '🔲 QR Code' },
    { id: 'photos',   label: `📸 Photos${delivery.photos.length > 0 ? ` (${delivery.photos.length})` : ''}` },
    { id: 'sign',     label: delivery.signed ? '✅ Signed' : '✍️ Sign' },
  ] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid #E2E8F0',
        background: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1A2535' }}>{delivery.loadId}</div>
            <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{delivery.broker} · PRO: {delivery.proNumber}</div>
          </div>
          <div style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: sm.bg, color: sm.color,
          }}>
            {sm.icon} {sm.label}
          </div>
        </div>

        {/* Route */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F7FAFC', borderRadius: 10, padding: '10px 14px', marginBottom: 12,
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: .5 }}>Origin</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{delivery.origin}</div>
          </div>
          <div style={{ color: '#4BAED4', fontSize: 18 }}>→</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: .5 }}>Destination</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2D3748' }}>{delivery.destination}</div>
          </div>
        </div>

        {/* Timeline */}
        {!isException && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 4 }}>
            {TIMELINE_STEPS.map((s, idx) => {
              const done = step >= STATUS_ORDER[s.status]
              const active = step === STATUS_ORDER[s.status]
              return (
                <div key={s.status} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 10,
                      background: done ? '#4BAED4' : '#E2E8F0',
                      color: done ? '#fff' : '#A0AEC0',
                      fontWeight: 700,
                      boxShadow: active ? '0 0 0 3px rgba(75,174,212,.25)' : 'none',
                    }}>
                      {done ? '✓' : idx + 1}
                    </div>
                    <div style={{ fontSize: 9, color: done ? '#2D7A9A' : '#A0AEC0', whiteSpace: 'nowrap', fontWeight: done ? 600 : 400 }}>
                      {s.label}
                    </div>
                  </div>
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, margin: '0 2px', marginBottom: 14,
                      background: step > STATUS_ORDER[s.status] ? '#4BAED4' : '#E2E8F0',
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
        {isException && (
          <div style={{
            padding: '8px 12px', background: '#FFF0F0', border: '1px solid #FC8181',
            borderRadius: 8, fontSize: 12, color: '#7B1A1A',
          }}>
            ⚠️ Exception — {delivery.notes}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} style={{
            flex: 1, padding: '10px 4px', background: 'none',
            border: 'none', borderBottom: activeTab === t.id ? '2px solid #4BAED4' : '2px solid transparent',
            color: activeTab === t.id ? '#4BAED4' : '#718096',
            fontWeight: activeTab === t.id ? 700 : 400,
            fontSize: 12, cursor: 'pointer',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Recipient', value: delivery.recipient },
                { label: 'Phone', value: delivery.recipientPhone },
                { label: 'Commodity', value: delivery.commodity },
                { label: 'Weight', value: delivery.weight },
                { label: 'Pieces', value: String(delivery.pieces) },
                { label: 'Scheduled', value: delivery.scheduledDelivery },
                { label: 'Driver', value: delivery.driver },
                { label: 'Truck / Trailer', value: `${delivery.truck} / ${delivery.trailer}` },
                { label: 'BOL #', value: delivery.bolNumber },
                { label: 'PRO #', value: delivery.proNumber },
              ].map(item => (
                <div key={item.label} style={{ background: '#F7FAFC', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2D3748' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Location */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 8 }}>📍 Current Location</div>
              <MiniMap lat={delivery.lat} lng={delivery.lng} location={delivery.location} />
              <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>
                Last updated: {delivery.statusUpdatedAt}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 6 }}>📝 Notes</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={() => update({ notes })}
                placeholder="Add delivery notes…"
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                  border: '1px solid #CBD5E0', borderRadius: 8, fontSize: 13,
                  fontFamily: 'inherit', resize: 'none', outline: 'none',
                  background: '#FAFBFC',
                }}
              />
            </div>

            {/* Send status */}
            {delivery.sentToBroker ? (
              <div style={{
                padding: '12px 16px', background: '#F0FFF4',
                border: '1px solid #9AE6B4', borderRadius: 10,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>📧</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#276749' }}>Documents Sent</div>
                  <div style={{ fontSize: 11, color: '#38A169' }}>
                    Sent to broker & recipient at {delivery.sentAt}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSendModal(true)}
                disabled={!delivery.signed}
                style={{
                  width: '100%', padding: '12px',
                  background: delivery.signed ? '#4BAED4' : '#E2E8F0',
                  border: 'none', borderRadius: 10, color: delivery.signed ? '#fff' : '#A0AEC0',
                  fontSize: 14, fontWeight: 700, cursor: delivery.signed ? 'pointer' : 'not-allowed',
                }}
              >
                📤 Send BOL + POD to Broker
                {!delivery.signed && <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2 }}>Requires signature first</div>}
              </button>
            )}
          </div>
        )}

        {/* ── QR Code ── */}
        {activeTab === 'qr' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{
              background: '#F7FAFC', borderRadius: 16, padding: 24,
              border: '1px solid #E2E8F0', width: '100%', textAlign: 'center',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#4A5568', marginBottom: 16 }}>
                📲 Show QR to Recipient
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ padding: 12, background: '#fff', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
                  <QRCodeSVG value={`epod:${delivery.loadId}:${delivery.bolNumber}`} size={180} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>
                Load ID: <strong>{delivery.loadId}</strong>
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>
                BOL: <strong>{delivery.bolNumber}</strong>
              </div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 16 }}>
                Recipient: <strong>{delivery.recipient}</strong>
              </div>
              <div style={{
                padding: '8px 12px', background: '#EBF8FF', border: '1px solid #BEE3F8',
                borderRadius: 8, fontSize: 11, color: '#2D7A9A',
              }}>
                Scan to sign delivery · Timestamp auto-recorded
              </div>
            </div>

            {/* Deep link */}
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Delivery Link</div>
              <div style={{
                display: 'flex', gap: 8, padding: '10px 12px',
                background: '#F7FAFC', border: '1px solid #CBD5E0', borderRadius: 8,
                alignItems: 'center',
              }}>
                <code style={{ flex: 1, fontSize: 11, color: '#2D7A9A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  https://epod.dispaloadiq.com/d/{delivery.id}?bol={delivery.bolNumber}
                </code>
                <button style={{
                  padding: '5px 10px', background: '#4BAED4', border: 'none',
                  borderRadius: 6, color: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                }}>
                  Copy
                </button>
              </div>
            </div>

            {/* SMS link */}
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 6 }}>Send to Recipient via SMS</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, padding: '10px 12px', background: '#F7FAFC',
                  border: '1px solid #CBD5E0', borderRadius: 8, fontSize: 13, color: '#2D3748',
                }}>
                  {delivery.recipientPhone}
                </div>
                <button style={{
                  padding: '10px 14px', background: '#38C770', border: 'none',
                  borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 700,
                }}>
                  📱 Send
                </button>
              </div>
            </div>

            {/* Timestamp */}
            <div style={{
              width: '100%', padding: '12px 16px',
              background: '#FFFAF0', border: '1px solid #FBBF24', borderRadius: 10,
              fontSize: 12, color: '#7B4F1A',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>⏱️ Timestamp</div>
              <div>QR generated: {new Date().toLocaleString()}</div>
              <div>GPS: {delivery.lat.toFixed(4)}°N, {Math.abs(delivery.lng).toFixed(4)}°W</div>
              <div>Location: {delivery.location}</div>
            </div>
          </div>
        )}

        {/* ── Photos ── */}
        {activeTab === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 13, color: '#4A5568' }}>
              Capture photos of cargo at delivery for documentation.
            </div>

            {/* Photo grid */}
            {delivery.photos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {delivery.photos.map(photo => (
                  <div key={photo.id} style={{
                    borderRadius: 10, overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                  }}>
                    <div style={{
                      height: 100, background: photo.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                    }}>📸</div>
                    <div style={{ padding: '8px 10px', background: '#F7FAFC' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2D3748' }}>{photo.label}</div>
                      <div style={{ fontSize: 10, color: '#718096' }}>Today {photo.takenAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '32px', textAlign: 'center',
                background: '#F7FAFC', borderRadius: 12, border: '2px dashed #CBD5E0',
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                <div style={{ fontSize: 13, color: '#718096' }}>No photos yet</div>
              </div>
            )}

            {/* Add photo buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                '📦 Cargo condition', '🔒 Seal / security',
                '📋 BOL signature', '🚪 Dock / facility',
              ].map(label => (
                <button key={label} onClick={() => {
                  const newPhoto: DeliveryPhoto = {
                    id: `p${Date.now()}`,
                    label: label.slice(3),
                    takenAt: new Date().toTimeString().slice(0, 5),
                    color: ['#4BAED4', '#68D391', '#F6AD55', '#FC8181', '#B794F4'][Math.floor(Math.random() * 5)],
                  }
                  update({ photos: [...delivery.photos, newPhoto] })
                }} style={{
                  padding: '10px 8px', background: '#F7FAFC', border: '1px dashed #CBD5E0',
                  borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#4A5568',
                  textAlign: 'center',
                }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ fontSize: 11, color: '#718096', textAlign: 'center' }}>
              In the mobile app, photos are captured via camera with GPS metadata embedded.
            </div>
          </div>
        )}

        {/* ── Sign ── */}
        {activeTab === 'sign' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: '12px 16px', background: '#EBF8FF',
              border: '1px solid #BEE3F8', borderRadius: 10,
              fontSize: 13, color: '#2D7A9A',
            }}>
              <strong>📜 {delivery.bolNumber}</strong><br />
              {delivery.recipient} · {delivery.commodity} · {delivery.weight}
            </div>

            {delivery.signed ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#276749', marginBottom: 4 }}>Delivery Signed</div>
                <div style={{ fontSize: 13, color: '#38A169' }}>
                  Signed by recipient at {delivery.statusUpdatedAt}
                </div>
                <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
                  {delivery.location} · {delivery.lat.toFixed(4)}°N, {Math.abs(delivery.lng).toFixed(4)}°W
                </div>
                <button
                  onClick={() => update({ signed: false, signatureDataUrl: undefined })}
                  style={{
                    marginTop: 16, padding: '8px 16px', background: 'none',
                    border: '1px solid #CBD5E0', borderRadius: 8, fontSize: 12,
                    cursor: 'pointer', color: '#718096',
                  }}
                >
                  Clear Signature
                </button>
              </div>
            ) : (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4A5568', marginBottom: 8 }}>
                    ✍️ Recipient Signature
                  </div>
                  <SignaturePad
                    hasSignature={delivery.signed}
                    onSave={(dataUrl) => {
                      update({
                        signed: true,
                        signatureDataUrl: dataUrl,
                        statusUpdatedAt: new Date().toLocaleString(),
                      })
                    }}
                    onClear={() => update({ signed: false, signatureDataUrl: undefined })}
                  />
                </div>

                <div style={{
                  padding: '12px', background: '#FFFAF0',
                  border: '1px solid #FBBF24', borderRadius: 10, fontSize: 12, color: '#7B4F1A',
                }}>
                  By signing, recipient confirms receipt of <strong>{delivery.pieces} pieces</strong> in described condition.
                  Timestamp and GPS location will be embedded automatically.
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Send modal */}
      {showSendModal && (
        <SendDocsModal
          delivery={delivery}
          onClose={() => setShowSendModal(false)}
          onSent={() => {
            update({ sentToBroker: true, sentAt: new Date().toLocaleTimeString() })
          }}
        />
      )}
    </div>
  )
}

// ─── Delivery List Item ────────────────────────────────────────────────────────
function DeliveryItem({ delivery, active, onClick }: {
  delivery: Delivery
  active: boolean
  onClick: () => void
}) {
  const sm = STATUS_META[delivery.status]
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', padding: '14px 16px',
      background: active ? '#EBF8FF' : '#fff',
      border: 'none', borderBottom: '1px solid #F0F4F8',
      borderLeft: active ? '3px solid #4BAED4' : '3px solid transparent',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2535' }}>{delivery.loadId}</div>
        <span style={{
          padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
          background: sm.bg, color: sm.color,
        }}>
          {sm.icon} {sm.label}
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 2 }}>
        {delivery.origin} → {delivery.destination}
      </div>
      <div style={{ fontSize: 11, color: '#718096' }}>{delivery.broker} · {delivery.scheduledDelivery}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        {delivery.photos.length > 0 && (
          <span style={{ fontSize: 10, padding: '2px 6px', background: '#F0FFF4', color: '#276749', borderRadius: 6 }}>
            📸 {delivery.photos.length}
          </span>
        )}
        {delivery.signed && (
          <span style={{ fontSize: 10, padding: '2px 6px', background: '#F0FFF4', color: '#276749', borderRadius: 6 }}>
            ✍️ Signed
          </span>
        )}
        {delivery.sentToBroker && (
          <span style={{ fontSize: 10, padding: '2px 6px', background: '#EBF8FF', color: '#2D7A9A', borderRadius: 6 }}>
            📧 Sent
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EPODPage({ role }: { role: UserRole }) {
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [activeDeliveries, setActiveDeliveries] = useState(MOCK_DELIVERIES)
  const [selected, setSelected] = useState<Delivery>(MOCK_DELIVERIES[0])

  const list = tab === 'active' ? activeDeliveries : HISTORY_DELIVERIES
  const currentSelected = tab === 'active'
    ? activeDeliveries.find(d => d.id === selected.id) ?? activeDeliveries[0]
    : HISTORY_DELIVERIES.find(d => d.id === selected.id) ?? HISTORY_DELIVERIES[0]

  const handleUpdate = (updated: Delivery) => {
    setActiveDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d))
    setSelected(updated)
  }

  // Stats
  const delivered = activeDeliveries.filter(d => d.status === 'delivered').length
  const exceptions = activeDeliveries.filter(d => d.status === 'exception').length
  const signed = activeDeliveries.filter(d => d.signed).length
  const sent = activeDeliveries.filter(d => d.sentToBroker).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F7FAFC' }}>
      {/* Top stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        padding: '16px 20px 0',
      }}>
        {[
          { label: 'Active',    value: activeDeliveries.filter(d => d.status !== 'delivered').length, icon: '🚛', color: '#2D7A9A', bg: '#EBF8FF' },
          { label: 'Delivered', value: delivered,   icon: '✅', color: '#276749', bg: '#F0FFF4' },
          { label: 'Signed',    value: signed,       icon: '✍️', color: '#5A4A1A', bg: '#FFFAF0' },
          { label: 'Exceptions',value: exceptions,   icon: '⚠️', color: '#7B1A1A', bg: '#FFF0F0' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.color}22`,
            borderRadius: 12, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, gap: 16, padding: '16px 20px', minHeight: 0 }}>
        {/* Left: list */}
        <div style={{
          width: 280, flexShrink: 0, background: '#fff',
          borderRadius: 14, border: '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
            {(['active', 'history'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setSelected(t === 'active' ? activeDeliveries[0] : HISTORY_DELIVERIES[0]) }} style={{
                flex: 1, padding: '12px 8px', background: 'none', border: 'none',
                borderBottom: tab === t ? '2px solid #4BAED4' : '2px solid transparent',
                color: tab === t ? '#4BAED4' : '#718096',
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13, cursor: 'pointer',
              }}>
                {t === 'active' ? `🚛 Active (${activeDeliveries.filter(d=>d.status!=='delivered').length})` : `📜 History`}
              </button>
            ))}
          </div>
          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {list.map(d => (
              <DeliveryItem
                key={d.id}
                delivery={d}
                active={currentSelected.id === d.id}
                onClick={() => setSelected(d)}
              />
            ))}
          </div>
        </div>

        {/* Right: detail */}
        <div style={{
          flex: 1, background: '#fff', borderRadius: 14,
          border: '1px solid #E2E8F0', overflow: 'hidden', minWidth: 0,
        }}>
          <DeliveryDetail
            key={currentSelected.id}
            delivery={currentSelected}
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  )
}
