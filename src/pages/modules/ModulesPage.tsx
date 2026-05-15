import { useState } from 'react'
import type { UserRole } from '../../types'
import { useModules, ALL_MODULES, DEFAULT_MODULES, CORE_PAGES, type ModuleDef } from '../../lib/useModules'

const PRIMARY = '#4BAED4'
const DARK = '#1A2535'

interface Props {
  role: UserRole
  userId: string
}

export default function ModulesPage({ role, userId }: Props) {
  const { enabled, toggle, enableAll, resetToDefault } = useModules(userId, role)
  const modules = ALL_MODULES[role]
  const defaults = new Set(DEFAULT_MODULES[role])

  // Group by category
  const categories = [...new Set(modules.map(m => m.category))]

  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  const filtered = search
    ? modules.filter(m =>
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        m.desc.toLowerCase().includes(search.toLowerCase()) ||
        m.category.toLowerCase().includes(search.toLowerCase())
      )
    : null

  const handleToggle = (page: string) => {
    toggle(page)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const enabledCount = modules.filter(m => enabled.includes(m.page)).length

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: DARK, margin: 0 }}>
              🧩 My Modules
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
              Choose which features appear in your sidebar. Start simple — add more as you need them.
            </p>
          </div>
          {saved && (
            <div style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0',
              color: '#16A34A', fontSize: 12, fontWeight: 700,
              padding: '6px 14px', borderRadius: 20,
              animation: 'fadeIn .2s ease',
            }}>
              ✅ Saved
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'center',
          background: '#F8FAFC', border: '1px solid #E5E7EB',
          borderRadius: 12, padding: '12px 16px', marginTop: 16,
        }}>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            <span style={{ fontWeight: 700, color: DARK }}>{enabledCount}</span> of <span style={{ fontWeight: 700, color: DARK }}>{modules.length}</span> modules enabled
          </div>
          <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${(enabledCount / modules.length) * 100}%`,
              background: `linear-gradient(90deg, ${PRIMARY}, #2E86B5)`,
              transition: 'width .3s ease',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={enableAll}
              style={{
                padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${PRIMARY}`,
                background: 'transparent', color: PRIMARY, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Enable All
            </button>
            <button
              onClick={resetToDefault}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1.5px solid #D1D5DB',
                background: 'transparent', color: '#6B7280', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginTop: 14, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search modules..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              borderRadius: 9, border: '1.5px solid #E5E7EB',
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
              background: '#fff',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
      `}</style>

      {/* Core pages info */}
      <div style={{
        background: '#EFF6FF', border: '1px solid #BFDBFE',
        borderRadius: 10, padding: '10px 14px', marginBottom: 24,
        fontSize: 12, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>ℹ️</span>
        <span>
          <strong>Dashboard, Notifications, and Settings</strong> are always visible and cannot be disabled.
        </span>
      </div>

      {/* Module grid */}
      {filtered ? (
        <ModuleGrid
          modules={filtered}
          enabled={enabled}
          defaults={defaults}
          onToggle={handleToggle}
        />
      ) : (
        categories.map(cat => {
          const catModules = modules.filter(m => m.category === cat)
          return (
            <div key={cat} style={{ marginBottom: 32 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: '#9CA3AF',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: 12, paddingBottom: 8,
                borderBottom: '1px solid #F1F5F9',
              }}>
                {cat}
              </div>
              <ModuleGrid
                modules={catModules}
                enabled={enabled}
                defaults={defaults}
                onToggle={handleToggle}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

function ModuleGrid({
  modules,
  enabled,
  defaults,
  onToggle,
}: {
  modules: ModuleDef[]
  enabled: string[]
  defaults: Set<string>
  onToggle: (page: string) => void
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 10,
    }}>
      {modules.map(m => {
        const isOn = CORE_PAGES.has(m.page) || enabled.includes(m.page)
        const isCore = CORE_PAGES.has(m.page)
        const isDefault = defaults.has(m.page)

        return (
          <button
            key={m.page}
            onClick={() => !isCore && onToggle(m.page)}
            disabled={isCore}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '13px 14px', borderRadius: 12, textAlign: 'left',
              border: `2px solid ${isOn ? PRIMARY : '#E5E7EB'}`,
              background: isOn ? `${PRIMARY}08` : '#FAFAFA',
              cursor: isCore ? 'default' : 'pointer',
              transition: 'all .15s',
              position: 'relative',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: isOn ? `${PRIMARY}20` : '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'background .15s',
            }}>
              {m.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: isOn ? DARK : '#9CA3AF',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {m.label}
                {isDefault && !isCore && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: '#FEF3C7', color: '#92400E',
                    padding: '1px 5px', borderRadius: 4,
                  }}>DEFAULT</span>
                )}
                {isCore && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: '#DBEAFE', color: '#1E40AF',
                    padding: '1px 5px', borderRadius: 4,
                  }}>CORE</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, lineHeight: 1.4 }}>
                {m.desc}
              </div>
            </div>

            {/* Toggle */}
            {!isCore && (
              <div style={{
                width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                background: isOn ? PRIMARY : '#D1D5DB',
                position: 'relative', transition: 'background .2s',
                alignSelf: 'center',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: isOn ? 18 : 4,
                  transition: 'left .2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }} />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
