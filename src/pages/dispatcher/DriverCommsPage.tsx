import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ContactStatus = 'online' | 'away' | 'offline'

type Contact = {
  id: string
  name: string
  initials: string
  color: string
  status: ContactStatus
  lastMessage: string
  lastTime: string
  truckId: string
}

type Message = {
  id: string
  contactId: string
  from: 'dispatcher' | 'driver'
  text: string
  time: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Mike R.',    initials: 'MR', color: '#F97316', status: 'online',  lastMessage: 'Въезжаю в Даллас',     lastTime: '2m ago',  truckId: 'TRK-4421' },
  { id: 'c2', name: 'Sergiy K.', initials: 'SK', color: '#0EA5E9', status: 'away',    lastMessage: 'Окей, принял',          lastTime: '15m ago', truckId: 'TRK-4418' },
  { id: 'c3', name: 'Tom B.',    initials: 'TB', color: '#F59E0B', status: 'offline', lastMessage: 'Буду в 18:00',          lastTime: '2h ago',  truckId: 'TRK-4400' },
  { id: 'c4', name: 'Anna P.',   initials: 'AP', color: '#8B5CF6', status: 'online',  lastMessage: 'Груз забрал',           lastTime: '5m ago',  truckId: 'TRK-4415' },
  { id: 'c5', name: 'James P.', initials: 'JP', color: '#10B981', status: 'away',    lastMessage: 'Жду документы',         lastTime: '1h ago',  truckId: 'TRK-4374' },
]

const STATUS_DOT: Record<ContactStatus, { color: string; label: string }> = {
  online:  { color: '#22C55E', label: 'Online' },
  away:    { color: '#F59E0B', label: 'Away' },
  offline: { color: '#64748B', label: 'Offline' },
}

const MOCK_MESSAGES: Message[] = [
  // Mike R. thread (c1)
  { id: 'm1',  contactId: 'c1', from: 'dispatcher', text: 'Майк, доброе утро! Подтверди загрузку в Чикаго.',          time: '07:42' },
  { id: 'm2',  contactId: 'c1', from: 'driver',     text: 'Доброе! На месте, загружаюсь.',                           time: '07:55' },
  { id: 'm3',  contactId: 'c1', from: 'dispatcher', text: 'Отлично. Пришли фото BOL как подпишешь.',                 time: '07:56' },
  { id: 'm4',  contactId: 'c1', from: 'driver',     text: '📷 [BOL_4421.jpg]',                                       time: '08:10' },
  { id: 'm5',  contactId: 'c1', from: 'dispatcher', text: 'Получил, спасибо. Доставка в Даллас до 17:00.',           time: '08:12' },
  { id: 'm6',  contactId: 'c1', from: 'driver',     text: 'Понял, выехал. Пробки на I-55, но успею.',                time: '08:20' },
  { id: 'm7',  contactId: 'c1', from: 'dispatcher', text: 'Хорошо. Когда будешь на загрузке следующей?',             time: '13:30' },
  { id: 'm8',  contactId: 'c1', from: 'driver',     text: 'Въезжаю в Даллас. Разгрузка ~30 мин.',                   time: '14:58' },
  { id: 'm9',  contactId: 'c1', from: 'dispatcher', text: 'Принял. Есть обратный груз Даллас → Чикаго, смотришь?',  time: '15:00' },
  { id: 'm10', contactId: 'c1', from: 'driver',     text: 'Да, скидывай детали.',                                    time: '15:02' },
  // Sergiy thread (c2)
  { id: 'm11', contactId: 'c2', from: 'dispatcher', text: 'Сергий, как дорога из Майами?',                           time: '09:00' },
  { id: 'm12', contactId: 'c2', from: 'driver',     text: 'Всё ок, I-95 чистая. Буду в Атланте к 16:00.',           time: '09:05' },
  { id: 'm13', contactId: 'c2', from: 'dispatcher', text: 'Подтверди получение груза когда выгрузишься.',            time: '09:06' },
  { id: 'm14', contactId: 'c2', from: 'driver',     text: 'Окей, принял.',                                           time: '09:45' },
  // Anna thread (c4)
  { id: 'm15', contactId: 'c4', from: 'dispatcher', text: 'Анна, доброе утро! Загрузка в LA готова?',                time: '06:30' },
  { id: 'm16', contactId: 'c4', from: 'driver',     text: 'Да, уже на складе.',                                      time: '06:35' },
  { id: 'm17', contactId: 'c4', from: 'dispatcher', text: 'Отправь BOL фото после подписания.',                      time: '06:36' },
  { id: 'm18', contactId: 'c4', from: 'driver',     text: '📷 [BOL_4415.jpg]',                                       time: '06:50' },
  { id: 'm19', contactId: 'c4', from: 'dispatcher', text: 'Принято! Доставка в Сакраменто, не торопись.',            time: '06:52' },
  { id: 'm20', contactId: 'c4', from: 'driver',     text: 'Груз забрал.',                                            time: '07:10' },
  // Tom thread (c3)
  { id: 'm21', contactId: 'c3', from: 'dispatcher', text: 'Том, позвони когда освободишься.',                        time: '11:00' },
  { id: 'm22', contactId: 'c3', from: 'driver',     text: 'Буду в 18:00.',                                           time: '11:30' },
  // James thread (c5)
  { id: 'm23', contactId: 'c5', from: 'dispatcher', text: 'Джеймс, документы отправил на email.',                    time: '10:00' },
  { id: 'm24', contactId: 'c5', from: 'driver',     text: 'Жду документы.',                                          time: '10:05' },
  { id: 'm25', contactId: 'c5', from: 'dispatcher', text: 'Уже должны прийти, проверь папку SPAM.',                  time: '10:07' },
]

const TEMPLATES = [
  { icon: '📍', text: 'Пришли геопозицию' },
  { icon: '📋', text: 'Отправь BOL фото' },
  { icon: '⏰', text: 'Когда будешь на загрузке?' },
  { icon: '✅', text: 'Подтверди получение груза' },
  { icon: '🔄', text: 'Есть обратный груз' },
  { icon: '📞', text: 'Позвони когда освободишься' },
]

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DriverCommsPage() {
  const [selectedId, setSelectedId]     = useState<string>('c1')
  const [messages,   setMessages]       = useState<Message[]>(MOCK_MESSAGES)
  const [inputText,  setInputText]      = useState('')
  const [templatesOpen, setTemplatesOpen] = useState(true)

  const selectedContact = CONTACTS.find(c => c.id === selectedId)!
  const threadMessages  = messages.filter(m => m.contactId === selectedId)

  function sendMessage() {
    const text = inputText.trim()
    if (!text) return
    const newMsg: Message = {
      id:        `msg-${Date.now()}`,
      contactId: selectedId,
      from:      'dispatcher',
      text,
      time:      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
    setMessages(prev => [...prev, newMsg])
    setInputText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      minHeight: 540,
      background: 'var(--c-dark, #111827)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid var(--c-border, #1F2937)',
      boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
    }}>

      {/* ── Left panel — Contacts ─────────────────────────────────────────────── */}
      <div style={{
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#0F172A',
        borderRight: '1px solid #1E293B',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid #1E293B',
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9', letterSpacing: 0.3 }}>
            💬 Driver Comms
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
            {CONTACTS.filter(c => c.status === 'online').length} online · {CONTACTS.length} contacts
          </div>
        </div>

        {/* Contact list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {CONTACTS.map(contact => {
            const dot     = STATUS_DOT[contact.status]
            const isSelected = contact.id === selectedId
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  background: isSelected ? '#1E293B' : 'transparent',
                  borderLeft: isSelected ? '3px solid #4BAED4' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#172033' }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                {/* Avatar with status dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: contact.color + '22',
                    border: `2px solid ${contact.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: contact.color,
                  }}>
                    {contact.initials}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 10, height: 10, borderRadius: '50%',
                    background: dot.color,
                    border: '2px solid #0F172A',
                  }} />
                </div>

                {/* Name + preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#F1F5F9' : '#CBD5E1' }}>
                      {contact.name}
                    </span>
                    <span style={{ fontSize: 10, color: '#475569', flexShrink: 0, marginLeft: 6 }}>
                      {contact.lastTime}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: '#64748B', marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {contact.lastMessage}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right panel — Chat window ─────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#111827',
        minWidth: 0,
      }}>

        {/* Chat header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid #1E293B',
          background: '#0F172A',
          flexShrink: 0,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: selectedContact.color + '22',
              border: `2px solid ${selectedContact.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: selectedContact.color,
            }}>
              {selectedContact.initials}
            </div>
            <div style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 9, height: 9, borderRadius: '50%',
              background: STATUS_DOT[selectedContact.status].color,
              border: '2px solid #0F172A',
            }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#F1F5F9' }}>
              {selectedContact.name}
            </div>
            <div style={{ fontSize: 11, color: '#64748B' }}>
              <span style={{ color: STATUS_DOT[selectedContact.status].color }}>●</span>{' '}
              {STATUS_DOT[selectedContact.status].label} · 🚛 {selectedContact.truckId}
            </div>
          </div>

          {/* Spacer + actions */}
          <div style={{ flex: 1 }} />
          <button
            style={{
              background: '#1E3A5F', border: '1px solid #2563EB44', color: '#60A5FA',
              borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            📞 Call
          </button>
          <button
            style={{
              background: '#1A2535', border: '1px solid #334155', color: '#94A3B8',
              borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}
          >
            📋 Load Info
          </button>
        </div>

        {/* Message bubbles */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {threadMessages.map(msg => {
            const isDispatcher = msg.from === 'dispatcher'
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isDispatcher ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {/* Avatar for driver messages */}
                {!isDispatcher && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: selectedContact.color + '22',
                    border: `1.5px solid ${selectedContact.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: selectedContact.color,
                  }}>
                    {selectedContact.initials}
                  </div>
                )}

                {/* Bubble */}
                <div style={{ maxWidth: '65%' }}>
                  <div style={{
                    padding: '9px 14px',
                    borderRadius: isDispatcher
                      ? '16px 4px 16px 16px'
                      : '4px 16px 16px 16px',
                    background: isDispatcher
                      ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                      : '#1E293B',
                    color: '#F1F5F9',
                    fontSize: 13,
                    lineHeight: 1.45,
                    boxShadow: isDispatcher
                      ? '0 2px 12px rgba(37,99,235,0.35)'
                      : '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize: 10, color: '#475569', marginTop: 3,
                    textAlign: isDispatcher ? 'right' : 'left',
                    paddingLeft: isDispatcher ? 0 : 4,
                    paddingRight: isDispatcher ? 4 : 0,
                  }}>
                    {msg.time}{isDispatcher ? ' · You' : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Quick Templates ────────────────────────────────────────────────── */}
        <div style={{
          borderTop: '1px solid #1E293B',
          background: '#0D1621',
          padding: '10px 16px',
          flexShrink: 0,
        }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: templatesOpen ? 8 : 0, cursor: 'pointer',
            }}
            onClick={() => setTemplatesOpen(v => !v)}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>
              QUICK TEMPLATES
            </span>
            <span style={{ fontSize: 10, color: '#334155', marginLeft: 2 }}>
              {templatesOpen ? '▲' : '▼'}
            </span>
          </div>
          {templatesOpen && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TEMPLATES.map(t => (
                <button
                  key={t.text}
                  onClick={() => setInputText(t.icon + ' ' + t.text)}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#94A3B8',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.background = '#253347'
                    btn.style.color = '#CBD5E1'
                  }}
                  onMouseLeave={e => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.background = '#1E293B'
                    btn.style.color = '#94A3B8'
                  }}
                >
                  {t.icon} {t.text}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Message input bar ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: '#0F172A',
          borderTop: '1px solid #1E293B',
          flexShrink: 0,
        }}>
          <input
            type="text"
            placeholder="Введи сообщение... (Enter to send)"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: 24,
              padding: '10px 18px',
              fontSize: 13,
              color: '#F1F5F9',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: inputText.trim() ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : '#1E293B',
              border: 'none',
              cursor: inputText.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              boxShadow: inputText.trim() ? '0 2px 12px rgba(37,99,235,0.4)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
