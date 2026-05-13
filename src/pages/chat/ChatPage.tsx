import { useState, useRef, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ContactType = 'driver' | 'dispatcher' | 'broker' | 'carrier' | 'system' | 'group'
type NotifType = 'load' | 'payment' | 'offer' | 'system' | 'alert' | 'compliance' | 'eta'
type MessageType = 'text' | 'load' | 'system' | 'doc' | 'invoice' | 'route'

interface Contact {
  id: string
  name: string
  type: ContactType
  lastMessage: string
  lastTime: string
  unread: number
  online: boolean
  loadRef?: string
  members?: string[]
  avatar?: string
  phone?: string
}

interface Message {
  id: number
  from: 'me' | 'them'
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
  type?: MessageType
  loadData?: { id: string; from: string; to: string; rate: string; status: string }
  docName?: string
  docSize?: string
  invoiceData?: { id: string; amount: string; status: string }
  routeData?: { stop: string; eta: string; status: 'arrived' | 'en_route' | 'delayed' }
  pinned?: boolean
  reactions?: string[]
}

interface Notification {
  id: number
  icon: string
  title: string
  body: string
  time: string
  read: boolean
  type: NotifType
  actions?: string[]
}

interface QuickReply {
  label: string
  text: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const CONTACTS: Contact[] = [
  {
    id: 'c1', name: 'Mike Rodriguez', type: 'driver', online: true,
    lastMessage: 'Got it, heading to dock 4 now',
    lastTime: '2:15 PM', unread: 0, loadRef: 'LD-4821', phone: '+1 (312) 555-0101',
  },
  {
    id: 'c2', name: 'Echo Global Logistics', type: 'broker', online: true,
    lastMessage: 'Rate confirmed $2,180. BOL attached.',
    lastTime: '1:42 PM', unread: 2, loadRef: 'LD-4821',
  },
  {
    id: 'c3', name: 'Sergiy Kovalenko', type: 'dispatcher', online: false,
    lastMessage: 'I have 3 open loads in your lane this week',
    lastTime: '11:30 AM', unread: 1,
  },
  {
    id: 'c4', name: 'Anna Perez', type: 'driver', online: true,
    lastMessage: 'Still loading, should be out by 4pm',
    lastTime: '10:05 AM', unread: 0, loadRef: 'LD-4819', phone: '+1 (312) 555-0202',
  },
  {
    id: 'c5', name: 'TQL Freight', type: 'broker', online: false,
    lastMessage: 'Invoice #INV-0091 has been paid — $890',
    lastTime: 'Yesterday', unread: 0, loadRef: 'LD-4815',
  },
  {
    id: 'c6', name: 'Coyote Logistics', type: 'broker', online: true,
    lastMessage: 'Need POD for shipment SHP-1040',
    lastTime: 'Yesterday', unread: 0,
  },
  {
    id: 'c7', name: 'James Carter', type: 'driver', online: false,
    lastMessage: 'Delivered and POD signed. All clear.',
    lastTime: 'Yesterday', unread: 0, loadRef: 'LD-4815', phone: '+1 (773) 555-0303',
  },
  {
    id: 'c8', name: 'Heartland Carriers', type: 'carrier', online: true,
    lastMessage: 'We have capacity on the CHI→DAL lane next week',
    lastTime: '2 days ago', unread: 0,
  },
  {
    id: 'c9', name: '🚛 All Drivers', type: 'group', online: true,
    lastMessage: 'New rate policy effective Monday',
    lastTime: '3 days ago', unread: 3,
    members: ['Mike Rodriguez', 'Anna Perez', 'James Carter'],
  },
  {
    id: 'c10', name: 'C.H. Robinson', type: 'broker', online: false,
    lastMessage: 'Confirming load pickup for Tuesday 8am',
    lastTime: '3 days ago', unread: 0, loadRef: 'LD-4810',
  },
]

const QUICK_REPLIES: QuickReply[] = [
  { label: '👍 Copy that', text: 'Copy that, understood.' },
  { label: '📍 On my way', text: 'On my way now, ETA ~30 min.' },
  { label: '✅ Delivered', text: 'Load delivered and POD signed.' },
  { label: '⏳ Running late', text: 'Running about 1 hour behind schedule.' },
  { label: '📄 Docs sent', text: 'Documents have been sent to your email.' },
  { label: '💰 Invoice sent', text: 'Invoice has been emailed. Please confirm receipt.' },
]

const MESSAGES_BY_CONTACT: Record<string, Message[]> = {
  c1: [
    { id: 1, from: 'them', text: 'Loaded up, leaving Chicago now. ETA Dallas tomorrow by 5pm.', time: '6:35 AM', status: 'read' },
    { id: 2, from: 'me',   text: 'Perfect. Broker confirmed $2,180. Make sure to get the BOL signed at pickup.', time: '6:40 AM' },
    { id: 3, from: 'them', text: 'Already got it, no issues at shipper.', time: '6:42 AM', status: 'read' },
    { id: 4, from: 'me',   text: 'Great. Check in every 4 hours please.', time: '9:10 AM' },
    {
      id: 5, from: 'them', text: '', time: '9:12 AM', type: 'route',
      routeData: { stop: 'St. Louis, MO', eta: '11:30 AM', status: 'arrived' },
    },
    { id: 6, from: 'them', text: 'In St. Louis now. Everything good, right on schedule.', time: '11:40 AM', status: 'read' },
    { id: 7, from: 'me',   text: 'Broker says delivery is Dock 4 at the warehouse.', time: '2:10 PM' },
    { id: 8, from: 'them', text: 'Got it, heading to dock 4 now', time: '2:15 PM', status: 'read' },
  ],
  c2: [
    { id: 1, from: 'them', text: 'Hi, calling about load LD-4821. Can you confirm your carrier is in transit?', time: '9:00 AM', status: 'read' },
    { id: 2, from: 'me',   text: 'Yes, driver departed Chicago at 6:30 AM. Currently passing St. Louis area.', time: '9:05 AM' },
    {
      id: 3, from: 'them', text: '', time: '1:30 PM', type: 'load',
      loadData: { id: 'LD-4821', from: 'Chicago, IL', to: 'Dallas, TX', rate: '$2,180', status: 'In Transit' },
    },
    { id: 4, from: 'them', text: 'Rate confirmed $2,180. BOL attached.', time: '1:42 PM', status: 'delivered' },
    { id: 5, from: 'them', text: '', time: '1:42 PM', type: 'doc', docName: 'BOL_LD4821_Echo.pdf', docSize: '142 KB' },
  ],
  c3: [
    { id: 1, from: 'them', text: 'Hey! Looking to partner on Chicago→Texas lanes. I dispatch 12 trucks, mostly dry van.', time: '10:00 AM', status: 'read' },
    { id: 2, from: 'me',   text: "What's your RPM average and what do you charge?", time: '10:15 AM' },
    { id: 3, from: 'them', text: 'Average $2.45 RPM last quarter. I charge 5% of gross, no hidden fees.', time: '10:20 AM', status: 'read' },
    { id: 4, from: 'them', text: 'I have 3 open loads in your lane this week', time: '11:30 AM', status: 'delivered' },
  ],
  c4: [
    { id: 1, from: 'me',   text: 'Anna, have you arrived at the Miami shipper yet?', time: '12:30 PM' },
    { id: 2, from: 'them', text: "Just arrived, they're loading me now. About 2 hours they said.", time: '1:45 PM', status: 'read' },
    { id: 3, from: 'me',   text: "Copy that. What's your estimated departure?", time: '2:00 PM' },
    { id: 4, from: 'them', text: 'Still loading, should be out by 4pm', time: '10:05 AM', status: 'delivered' },
  ],
  c5: [
    { id: 1, from: 'them', text: 'Load LD-4815 has been delivered. POD confirmed at 2:12 PM.', time: 'Yesterday 2:20 PM', status: 'read' },
    { id: 2, from: 'me',   text: 'Great, thank you. Invoice sent.', time: 'Yesterday 3:00 PM' },
    {
      id: 3, from: 'them', text: '', time: 'Yesterday 4:15 PM', type: 'invoice',
      invoiceData: { id: 'INV-0091', amount: '$890.00', status: 'Paid' },
    },
    { id: 4, from: 'them', text: 'Invoice #INV-0091 has been paid — $890', time: 'Yesterday 4:15 PM', status: 'read' },
  ],
  c6: [
    { id: 1, from: 'them', text: 'Need POD for shipment SHP-1040', time: 'Yesterday 3:00 PM', status: 'read' },
    { id: 2, from: 'me',   text: 'Uploading now.', time: 'Yesterday 3:10 PM' },
    { id: 3, from: 'me',   text: '', time: 'Yesterday 3:11 PM', type: 'doc', docName: 'POD_SHP1040.pdf', docSize: '88 KB' },
  ],
  c7: [
    { id: 1, from: 'them', text: 'Arrived at receiver in Phoenix. Starting unload.', time: 'Yesterday 12:00 PM', status: 'read' },
    { id: 2, from: 'me',   text: 'Copy that. Get the POD once unloaded.', time: 'Yesterday 12:05 PM' },
    { id: 3, from: 'them', text: 'Delivered and POD signed. All clear.', time: 'Yesterday 2:30 PM', status: 'read', pinned: true },
  ],
  c8: [
    { id: 1, from: 'them', text: 'Hello, Heartland Carriers here. We run the CHI→DAL lane regularly.', time: '2 days ago', status: 'read' },
    { id: 2, from: 'me',   text: 'Good to know. What rates are you running currently?', time: '2 days ago' },
    { id: 3, from: 'them', text: 'We have capacity on the CHI→DAL lane next week', time: '2 days ago', status: 'read' },
  ],
  c9: [
    {
      id: 1, from: 'me', text: '📢 Group broadcast: All Drivers', time: '3 days ago', type: 'system',
    },
    { id: 2, from: 'me',   text: 'Team, new rate policy effective Monday: quick pay premium is now 2%. Update your invoicing.', time: '3 days ago' },
    { id: 3, from: 'them', text: 'Got it, Mike', time: '3 days ago', status: 'read' },
    { id: 4, from: 'them', text: 'Understood, Anna', time: '3 days ago', status: 'read' },
    { id: 5, from: 'me',   text: 'New rate policy effective Monday', time: '3 days ago' },
  ],
  c10: [
    { id: 1, from: 'them', text: 'Hi, confirming load LD-4810 for Tuesday pickup. Your carrier confirmed?', time: '3 days ago', status: 'read' },
    { id: 2, from: 'me',   text: "Yes, James Carter is assigned. He'll be there at 8am.", time: '3 days ago' },
    { id: 3, from: 'them', text: 'Confirming load pickup for Tuesday 8am', time: '3 days ago', status: 'read' },
  ],
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1, icon: '💰', type: 'payment',
    title: 'Payment received',
    body: 'TQL Freight paid invoice #INV-0091 — $890.00',
    time: '2h ago', read: false,
    actions: ['View Invoice'],
  },
  {
    id: 2, icon: '📦', type: 'load',
    title: 'New load match',
    body: 'AI found 3 loads matching your Peterbilt on the Chicago→Dallas lane, avg $2.31/mi',
    time: '3h ago', read: false,
    actions: ['View Loads', 'Dismiss'],
  },
  {
    id: 3, icon: '🤝', type: 'offer',
    title: 'New dispatcher offer',
    body: 'Sergiy Kovalenko sent you an offer: 3 loads, Chicago→TX, $2.45 RPM',
    time: '4h ago', read: false,
    actions: ['Accept', 'Decline', 'View Profile'],
  },
  {
    id: 4, icon: '📡', type: 'eta',
    title: 'ETA update',
    body: 'LD-4821: Mike Rodriguez is on schedule, arriving Dallas by 4:45 PM',
    time: '5h ago', read: false,
    actions: ['View Load'],
  },
  {
    id: 5, icon: '📄', type: 'load',
    title: 'BOL received',
    body: 'Echo Global Logistics sent BOL for load LD-4821',
    time: '6h ago', read: true,
    actions: ['Download BOL'],
  },
  {
    id: 6, icon: '⚠️', type: 'alert',
    title: 'Rate alert',
    body: 'DAT spot rates on Chicago→Dallas lane up 8% today — $2.38/mi',
    time: '8h ago', read: true,
  },
  {
    id: 7, icon: '🛡️', type: 'compliance',
    title: 'Document expiring soon',
    body: "Mike Rodriguez's CDL expires in 14 days. Please renew to avoid compliance issues.",
    time: '10h ago', read: true,
    actions: ['View Docs'],
  },
  {
    id: 8, icon: '💬', type: 'system',
    title: 'New message from Coyote Logistics',
    body: 'Need POD for shipment SHP-1040 urgently',
    time: 'Yesterday', read: true,
  },
  {
    id: 9, icon: '✅', type: 'load',
    title: 'Load delivered',
    body: 'LD-4815 (LA → Phoenix) delivered by James Carter. POD signed.',
    time: 'Yesterday', read: true,
    actions: ['Send Invoice'],
  },
  {
    id: 10, icon: '🔔', type: 'system',
    title: 'Weekly summary ready',
    body: '3 loads delivered · $6,120 earned · 2 loads in transit this week',
    time: '2 days ago', read: true,
    actions: ['View Report'],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function typeColor(type: ContactType): string {
  const map: Record<ContactType, string> = {
    driver: '#4BAED4', dispatcher: '#8B5CF6', broker: '#F59E0B',
    carrier: '#38C770', system: '#A0AEC0', group: '#EF4444',
  }
  return map[type]
}

function notifColor(type: NotifType): string {
  const map: Record<NotifType, string> = {
    load: '#4BAED4', payment: '#38C770', offer: '#8B5CF6',
    system: '#A0AEC0', alert: '#F59E0B', compliance: '#EF4444', eta: '#06B6D4',
  }
  return map[type]
}

function ContactTag({ type }: { type: ContactType }) {
  const labels: Record<ContactType, string> = {
    driver: 'Driver', dispatcher: 'Dispatcher', broker: 'Broker',
    carrier: 'Carrier', system: 'System', group: 'Group',
  }
  const color = typeColor(type)
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color,
      background: color + '18', padding: '2px 7px', borderRadius: 99,
    }}>{labels[type]}</span>
  )
}

// ── Compose Modal ─────────────────────────────────────────────────────────────
function ComposeModal({ onClose }: { onClose: () => void }) {
  const [to, setTo] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="card" style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#1A2535' }}>✉️ New Message</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>To</label>
          <input className="input" placeholder="Search contacts..."
            value={to} onChange={e => setTo(e.target.value)} />
          {to && (
            <div style={{ background: '#F7FAFC', borderRadius: 8, overflow: 'hidden' }}>
              {CONTACTS.filter(c => c.name.toLowerCase().includes(to.toLowerCase())).slice(0, 4).map(c => (
                <div key={c.id} style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                  onClick={onClose}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{c.name.charAt(0)}</div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <ContactTag type={c.type} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4A5568' }}>Message</label>
          <textarea className="input" rows={4} placeholder="Type your message..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onClose}>Send Message ↑</button>
        </div>
      </div>
    </div>
  )
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg, contact, onPin }: {
  msg: Message; contact: Contact; onPin: (id: number) => void
}) {
  const isMe = msg.from === 'me'

  if (msg.type === 'doc') {
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
        <div style={{
          background: isMe ? '#4BAED4' : '#F7FAFC',
          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '10px 14px', maxWidth: '60%',
          display: 'flex', alignItems: 'center', gap: 10,
          border: isMe ? 'none' : '1px solid #E2E8F0', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 22 }}>📄</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: isMe ? '#fff' : '#2D3748' }}>{msg.docName}</div>
            <div style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,.7)' : '#A0AEC0' }}>
              PDF · {msg.docSize} · Click to view
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (msg.type === 'load' && msg.loadData) {
    const d = msg.loadData
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A2535 0%, #2D7A9A 100%)',
          borderRadius: 14, padding: '14px 16px', maxWidth: '70%', color: '#fff',
          border: '1px solid #2D7A9A',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, opacity: .7, marginBottom: 4 }}>LOAD DETAILS</div>
          <div style={{ fontWeight: 900, fontSize: 15 }}>#{d.id}</div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{d.from} → {d.to}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 18 }}>{d.rate}</span>
            <span style={{
              background: 'rgba(255,255,255,.15)', padding: '3px 10px',
              borderRadius: 99, fontSize: 11,
            }}>{d.status}</span>
          </div>
        </div>
      </div>
    )
  }

  if (msg.type === 'invoice' && msg.invoiceData) {
    const d = msg.invoiceData
    const isPaid = d.status === 'Paid'
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
        <div style={{
          background: isPaid ? '#F0FDF4' : '#FFFBEB',
          borderRadius: 14, padding: '12px 16px', maxWidth: '60%',
          border: `1px solid ${isPaid ? '#BBF7D0' : '#FDE68A'}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>🧾</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>{d.id}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: isPaid ? '#38C770' : '#F59E0B' }}>{d.amount}</div>
            <div style={{ fontSize: 11, color: isPaid ? '#166534' : '#92400E', fontWeight: 700 }}>
              {isPaid ? '✓ Paid' : '⏳ Pending'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (msg.type === 'route' && msg.routeData) {
    const d = msg.routeData
    const statusColor = d.status === 'arrived' ? '#38C770' : d.status === 'en_route' ? '#4BAED4' : '#F59E0B'
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: statusColor + '10', border: `1px solid ${statusColor}30`,
          borderRadius: 99, padding: '5px 14px', fontSize: 12, color: statusColor, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>📍</span>
          <span>{d.status === 'arrived' ? 'Arrived at' : 'En route to'} {d.stop}</span>
          <span style={{ opacity: .7 }}>ETA: {d.eta}</span>
        </div>
      </div>
    )
  }

  if (msg.type === 'system') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: '#F0F4F8', borderRadius: 99, padding: '4px 14px',
          fontSize: 12, color: '#718096',
        }}>{msg.text}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8 }}>
      {!isMe && (
        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0, alignSelf: 'flex-end' }}>
          {contact.name.charAt(0)}
        </div>
      )}
      <div style={{ maxWidth: '65%' }}>
        <div style={{ position: 'relative' }}>
          {msg.pinned && (
            <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, marginBottom: 3, textAlign: isMe ? 'right' : 'left' }}>
              📌 Pinned
            </div>
          )}
          <div
            style={{
              background: isMe ? '#4BAED4' : '#F7FAFC',
              color: isMe ? '#fff' : '#2D3748',
              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 14px', fontSize: 14, lineHeight: 1.5,
              border: isMe ? 'none' : '1px solid #E2E8F0',
            }}
          >
            {msg.text}
            {(msg.reactions ?? []).length > 0 && (
              <div style={{ marginTop: 4, fontSize: 16 }}>{(msg.reactions ?? []).join(' ')}</div>
            )}
          </div>
        </div>
        <div style={{
          fontSize: 10, color: '#A0AEC0', marginTop: 3,
          textAlign: isMe ? 'right' : 'left',
          display: 'flex', gap: 4, justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'center',
        }}>
          <span>{msg.time}</span>
          {isMe && msg.status && (
            <span style={{ color: msg.status === 'read' ? '#4BAED4' : '#A0AEC0' }}>
              {msg.status === 'sent' ? '✓' : '✓✓'}
            </span>
          )}
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E0', fontSize: 10, padding: '0 2px' }}
            onClick={() => onPin(msg.id)}
            title="Pin message"
          >📌</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'notifications'>('chat')
  const [selectedContactId, setSelectedContactId] = useState<string>(CONTACTS[0].id)
  const [messages, setMessages] = useState<Record<string, Message[]>>(MESSAGES_BY_CONTACT)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [msgSearch, setMsgSearch] = useState('')
  const [showMsgSearch, setShowMsgSearch] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS)
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | NotifType>('all')
  const [showCompose, setShowCompose] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [filterType, setFilterType] = useState<ContactType | 'all'>('all')
  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedContact = CONTACTS.find(c => c.id === selectedContactId)!
  const currentMessages = messages[selectedContactId] ?? []

  const filteredContacts = CONTACTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.loadRef ?? '').toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || c.type === filterType
    return matchSearch && matchType
  })

  const displayedMessages = showMsgSearch && msgSearch
    ? currentMessages.filter(m => m.text?.toLowerCase().includes(msgSearch.toLowerCase()))
    : currentMessages

  const unreadNotifCount = notifications.filter(n => !n.read).length
  const totalUnread = CONTACTS.reduce((s, c) => s + c.unread, 0)

  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.read
    if (notifFilter === 'all') return true
    return n.type === notifFilter
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages.length, selectedContactId])

  function sendMessage(text?: string) {
    const msg = text ?? draft
    if (!msg.trim()) return
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const newMsg: Message = {
      id: Date.now(), from: 'me', text: msg, time, status: 'sent', type: 'text',
    }
    setMessages(prev => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] ?? []), newMsg],
    }))
    setDraft('')
    setShowQuickReplies(false)
  }

  function pinMessage(id: number) {
    setMessages(prev => ({
      ...prev,
      [selectedContactId]: prev[selectedContactId].map(m =>
        m.id === id ? { ...m, pinned: !m.pinned } : m
      ),
    }))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const pinnedMessages = currentMessages.filter(m => m.pinned)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: 0 }}>
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}

      {/* Tab bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['chat', 'notifications'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px', borderRadius: 10, fontWeight: 700,
                fontSize: 14, border: 'none', cursor: 'pointer',
                background: activeTab === tab ? '#4BAED4' : 'transparent',
                color: activeTab === tab ? '#fff' : '#718096',
                position: 'relative',
              }}>
              {tab === 'chat' ? '💬 Messages' : '🔔 Notifications'}
              {tab === 'chat' && totalUnread > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 6,
                  background: '#EF4444', color: '#fff', fontSize: 9,
                  fontWeight: 800, borderRadius: 99, padding: '1px 5px',
                }}>{totalUnread}</span>
              )}
              {tab === 'notifications' && unreadNotifCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 6,
                  background: '#EF4444', color: '#fff', fontSize: 9,
                  fontWeight: 800, borderRadius: 99, padding: '1px 5px',
                }}>{unreadNotifCount}</span>
              )}
            </button>
          ))}
        </div>
        {activeTab === 'chat' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowCompose(true)}>
            ✏️ New Message
          </button>
        )}
      </div>

      {/* ── CHAT VIEW ── */}
      {activeTab === 'chat' && (
        <div style={{ display: 'flex', gap: 14, flex: 1, overflow: 'hidden' }}>

          {/* Contact list */}
          <div className="card" style={{
            width: 290, flexShrink: 0, padding: 0,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Search + filter */}
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #F0F4F8', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="🔍 Search..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
                {(['all', 'driver', 'broker', 'dispatcher', 'group'] as const).map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    style={{
                      padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                      background: filterType === t ? '#4BAED4' : '#F0F4F8',
                      color: filterType === t ? '#fff' : '#718096',
                    }}>
                    {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}s
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredContacts.map(contact => (
                <div key={contact.id}
                  onClick={() => setSelectedContactId(contact.id)}
                  style={{
                    padding: '11px 14px', cursor: 'pointer',
                    background: selectedContactId === contact.id ? '#EBF8FF' : 'transparent',
                    borderLeft: selectedContactId === contact.id ? '3px solid #4BAED4' : '3px solid transparent',
                    borderBottom: '1px solid #F0F4F8',
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div className="avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                        {contact.type === 'group' ? '👥' : contact.name.charAt(0)}
                      </div>
                      {contact.online && (
                        <div style={{
                          position: 'absolute', bottom: 0, right: 0,
                          width: 9, height: 9, borderRadius: '50%',
                          background: '#38C770', border: '2px solid #fff',
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#2D3748' }}>{contact.name}</span>
                        <span style={{ fontSize: 10, color: '#A0AEC0', flexShrink: 0 }}>{contact.lastTime}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }}>
                        <span style={{
                          fontSize: 11, color: '#718096',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                        }}>{contact.lastMessage}</span>
                        {contact.unread > 0 && (
                          <span style={{
                            background: '#4BAED4', color: '#fff', fontSize: 9, fontWeight: 800,
                            borderRadius: 99, padding: '1px 6px', flexShrink: 0,
                          }}>{contact.unread}</span>
                        )}
                      </div>
                      <div style={{ marginTop: 4, display: 'flex', gap: 5 }}>
                        <ContactTag type={contact.type} />
                        {contact.loadRef && <span style={{ fontSize: 10, color: '#A0AEC0' }}>#{contact.loadRef}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message thread */}
          <div className="card" style={{
            flex: 1, padding: 0, display: 'flex',
            flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Thread header */}
            <div style={{
              padding: '12px 18px', borderBottom: '1px solid #F0F4F8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <div className="avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                    {selectedContact.type === 'group' ? '👥' : selectedContact.name.charAt(0)}
                  </div>
                  {selectedContact.online && (
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 10, height: 10, borderRadius: '50%',
                      background: '#38C770', border: '2px solid #fff',
                    }} />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>{selectedContact.name}</div>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 2 }}>
                    <ContactTag type={selectedContact.type} />
                    <span style={{ fontSize: 11, color: selectedContact.online ? '#38C770' : '#A0AEC0' }}>
                      {selectedContact.online ? '● Online' : '○ Offline'}
                    </span>
                    {selectedContact.loadRef && (
                      <span style={{ fontSize: 11, color: '#A0AEC0' }}>Load: {selectedContact.loadRef}</span>
                    )}
                    {selectedContact.type === 'group' && selectedContact.members && (
                      <span style={{ fontSize: 11, color: '#A0AEC0' }}>{selectedContact.members.length} members</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {selectedContact.phone && (
                  <button className="btn btn-ghost btn-sm">📞 Call</button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setShowMsgSearch(s => !s)}>🔍</button>
                <button className="btn btn-ghost btn-sm">📎</button>
                <button className="btn btn-ghost btn-sm">⋯</button>
              </div>
            </div>

            {/* Message search bar */}
            {showMsgSearch && (
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #F0F4F8', background: '#F7FAFC' }}>
                <input className="input" placeholder="🔍 Search in conversation..."
                  value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', fontSize: 13 }} />
                {msgSearch && (
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 4 }}>
                    {displayedMessages.length} result(s)
                  </div>
                )}
              </div>
            )}

            {/* Pinned messages */}
            {pinnedMessages.length > 0 && !msgSearch && (
              <div style={{
                padding: '8px 16px', background: '#FFFBEB',
                borderBottom: '1px solid #FDE68A',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 14 }}>📌</span>
                <span style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                  {pinnedMessages.length} pinned message(s):
                </span>
                <span style={{ fontSize: 12, color: '#78350F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  "{pinnedMessages[pinnedMessages.length - 1].text}"
                </span>
              </div>
            )}

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 18px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {displayedMessages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} contact={selectedContact} onPin={pinMessage} />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {showQuickReplies && (
              <div style={{
                padding: '8px 14px', borderTop: '1px solid #F0F4F8',
                display: 'flex', gap: 6, flexWrap: 'wrap', background: '#F7FAFC',
              }}>
                {QUICK_REPLIES.map(qr => (
                  <button key={qr.label} className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11 }}
                    onClick={() => sendMessage(qr.text)}>
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div style={{
              padding: '10px 14px', borderTop: '1px solid #F0F4F8',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <button className="btn btn-ghost btn-sm" title="Quick replies"
                onClick={() => setShowQuickReplies(s => !s)}
                style={{ background: showQuickReplies ? '#EBF8FF' : 'transparent' }}>
                ⚡
              </button>
              <button className="btn btn-ghost btn-sm" title="Attach file">📎</button>
              <textarea className="input" rows={1}
                placeholder="Type a message..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                }}
                style={{ flex: 1, resize: 'none', maxHeight: 100, lineHeight: 1.5, boxSizing: 'border-box' }}
              />
              <button className="btn btn-primary btn-sm" onClick={() => sendMessage()}
                disabled={!draft.trim()} style={{ flexShrink: 0 }}>
                Send ↑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS VIEW ── */}
      {activeTab === 'notifications' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A2535' }}>Notifications</h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#718096' }}>
                {unreadNotifCount} unread · {notifications.length} total
              </p>
            </div>
            {unreadNotifCount > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={markAllRead}>✓ Mark all read</button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {([
              ['all', 'All'],
              ['unread', `Unread (${unreadNotifCount})`],
              ['load', '📦 Loads'],
              ['payment', '💰 Payments'],
              ['offer', '🤝 Offers'],
              ['eta', '📡 ETA'],
              ['compliance', '🛡️ Compliance'],
              ['alert', '⚠️ Alerts'],
            ] as const).map(([val, label]) => (
              <button key={val} onClick={() => setNotifFilter(val)}
                className={`btn btn-sm ${notifFilter === val ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: 11 }}>
                {label}
              </button>
            ))}
          </div>

          <div className="card" style={{ overflow: 'auto', flex: 1, padding: 0 }}>
            {filteredNotifs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#A0AEC0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <div style={{ fontSize: 14 }}>No notifications in this category</div>
              </div>
            ) : filteredNotifs.map((notif, idx) => (
              <div key={notif.id}
                onClick={() => setNotifications(prev =>
                  prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                )}
                style={{
                  padding: '14px 18px',
                  borderBottom: idx < filteredNotifs.length - 1 ? '1px solid #F0F4F8' : 'none',
                  background: notif.read ? '#fff' : '#F0F9FF',
                  cursor: 'pointer',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  transition: 'background .2s',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: notifColor(notif.type) + '20',
                  border: `2px solid ${notifColor(notif.type)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {notif.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: notif.read ? 600 : 800, fontSize: 14, color: '#1A2535', marginBottom: 3 }}>
                      {notif.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <span style={{ fontSize: 11, color: '#A0AEC0' }}>{notif.time}</span>
                      {!notif.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4BAED4' }} />}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#718096', lineHeight: 1.5 }}>{notif.body}</div>
                  {notif.actions && notif.actions.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {notif.actions.map((action, i) => (
                        <button key={action}
                          className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}
                          style={{ fontSize: 11 }}
                          onClick={e => e.stopPropagation()}>
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
