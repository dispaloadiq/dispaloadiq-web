import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ReferralTier = 'bronze' | 'silver' | 'gold' | 'platinum';

type Referral = {
  id: string;
  name: string;
  role: 'dispatcher' | 'owner-op';
  joinedDate: string;
  status: 'active' | 'pending' | 'inactive';
  earned: number;
  loadsCompleted?: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MY_STATS = {
  totalEarned: 875,
  pendingEarned: 150,
  referralCode: 'MARIA-K-2024',
  totalReferrals: 11,
  activeReferrals: 8,
  tier: 'silver' as ReferralTier,
  nextTierAt: 15,
  monthlyBonus: 25,
};

const MY_REFERRALS: Referral[] = [
  { id: 'r1', name: 'Oleksiy V.', role: 'dispatcher', joinedDate: 'Apr 15, 2025', status: 'active', earned: 125, loadsCompleted: 43 },
  { id: 'r2', name: 'Ahmed K.', role: 'owner-op', joinedDate: 'Apr 8, 2025', status: 'active', earned: 50 },
  { id: 'r3', name: 'Bohdan S.', role: 'dispatcher', joinedDate: 'Mar 22, 2025', status: 'active', earned: 125, loadsCompleted: 67 },
  { id: 'r4', name: 'Priya R.', role: 'dispatcher', joinedDate: 'Mar 10, 2025', status: 'active', earned: 125, loadsCompleted: 89 },
  { id: 'r5', name: 'Vasyl M.', role: 'owner-op', joinedDate: 'Feb 28, 2025', status: 'active', earned: 50 },
  { id: 'r6', name: 'Carlos F.', role: 'owner-op', joinedDate: 'Feb 14, 2025', status: 'active', earned: 50 },
  { id: 'r7', name: 'Natalia P.', role: 'dispatcher', joinedDate: 'Jan 30, 2025', status: 'inactive', earned: 0, loadsCompleted: 2 },
  { id: 'r8', name: 'Dmytro H.', role: 'dispatcher', joinedDate: 'Jan 15, 2025', status: 'active', earned: 125, loadsCompleted: 134 },
  { id: 'r9', name: 'Taras B.', role: 'owner-op', joinedDate: 'Dec 20, 2024', status: 'active', earned: 50 },
  { id: 'r10', name: 'Iryna S.', role: 'dispatcher', joinedDate: 'Dec 5, 2024', status: 'pending', earned: 0, loadsCompleted: 0 },
  { id: 'r11', name: 'Juan M.', role: 'owner-op', joinedDate: 'Nov 28, 2024', status: 'active', earned: 50 },
];

const LEADERBOARD = [
  { rank: 1, name: 'Andrii K.', country: '🇺🇦', referrals: 47, earned: 4250, tier: 'platinum' as ReferralTier },
  { rank: 2, name: 'Dilnoza T.', country: '🇺🇿', referrals: 38, earned: 3300, tier: 'platinum' as ReferralTier },
  { rank: 3, name: 'Sofia B.', country: '🇵🇱', referrals: 29, earned: 2475, tier: 'gold' as ReferralTier },
  { rank: 4, name: 'Ramesh P.', country: '🇮🇳', referrals: 22, earned: 1850, tier: 'gold' as ReferralTier },
  { rank: 5, name: 'Maria K.', country: '🇺🇦', referrals: 11, earned: 875, tier: 'silver' as ReferralTier },
  { rank: 6, name: 'David L.', country: '🇬🇪', referrals: 9, earned: 700, tier: 'silver' as ReferralTier },
  { rank: 7, name: 'Artem V.', country: '🇺🇦', referrals: 7, earned: 525, tier: 'bronze' as ReferralTier },
  { rank: 8, name: 'Zara M.', country: '🇵🇰', referrals: 5, earned: 375, tier: 'bronze' as ReferralTier },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<ReferralTier, string> = {
  bronze: '#92400E',
  silver: '#6B7280',
  gold: '#F59E0B',
  platinum: '#8B5CF6',
};

const TIER_BG: Record<ReferralTier, string> = {
  bronze: '#FEF3C7',
  silver: '#F3F4F6',
  gold: '#FFFBEB',
  platinum: '#F5F3FF',
};

const TIER_LABEL: Record<ReferralTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#D1FAE5', text: '#065F46' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  inactive: { bg: '#F3F4F6', text: '#6B7280' },
};

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  dispatcher: { bg: '#DBEAFE', text: '#1E40AF' },
  'owner-op': { bg: '#CCFBF1', text: '#0F766E' },
};

const REFERRAL_LINK = `https://dispaloadiq.com/join?ref=${MY_STATS.referralCode}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="card"
      style={{ flex: 1, minWidth: 140, padding: '18px 20px' }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-dark)' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function TierBadge({ tier }: { tier: ReferralTier }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: TIER_BG[tier],
        color: TIER_COLORS[tier],
        border: `1px solid ${TIER_COLORS[tier]}44`,
      }}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.inactive;
  const labels: Record<string, string> = { active: 'Active', pending: 'Pending', inactive: 'Inactive' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: s.bg,
        color: s.text,
      }}
    >
      {labels[status] || status}
    </span>
  );
}

function RolePill({ role }: { role: string }) {
  const r = ROLE_COLORS[role] || ROLE_COLORS.dispatcher;
  const labels: Record<string, string> = { dispatcher: 'Dispatcher', 'owner-op': 'Owner-Op' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: r.bg,
        color: r.text,
      }}
    >
      {labels[role] || role}
    </span>
  );
}

// ─── Tier Progress ────────────────────────────────────────────────────────────

function TierProgress() {
  const tiers: { tier: ReferralTier; label: string; min: number; max: number | null }[] = [
    { tier: 'bronze', label: 'Bronze', min: 1, max: 4 },
    { tier: 'silver', label: 'Silver', min: 5, max: 14 },
    { tier: 'gold', label: 'Gold', min: 15, max: 29 },
    { tier: 'platinum', label: 'Platinum', min: 30, max: null },
  ];

  const currentTierIndex = tiers.findIndex((t) => t.tier === MY_STATS.tier);
  const toNext = MY_STATS.nextTierAt - MY_STATS.totalReferrals;
  const nextTier = tiers[currentTierIndex + 1];

  const tierBenefits: { tier: ReferralTier; disp: string; ownerOp: string; monthly: string }[] = [
    { tier: 'bronze', disp: '$50/ref', ownerOp: '$25/ref', monthly: '—' },
    { tier: 'silver', disp: '$75/ref', ownerOp: '$35/ref', monthly: '$25' },
    { tier: 'gold', disp: '$100/ref', ownerOp: '$50/ref', monthly: '$75' },
    { tier: 'platinum', disp: '$125/ref', ownerOp: '$75/ref', monthly: '$200' },
  ];

  return (
    <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
      <div className="section-title" style={{ marginBottom: 18 }}>Прогресс по уровням</div>

      {/* Tier track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
        {tiers.map((t, i) => {
          const isPast = i < currentTierIndex;
          const isCurrent = i === currentTierIndex;
          const isLast = i === tiers.length - 1;
          return (
            <div key={t.tier} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
              {/* Dot */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: isCurrent ? 28 : 20,
                    height: isCurrent ? 28 : 20,
                    borderRadius: '50%',
                    background: isPast || isCurrent ? TIER_COLORS[t.tier] : '#E5E7EB',
                    border: isCurrent ? `3px solid ${TIER_COLORS[t.tier]}` : '2px solid transparent',
                    boxShadow: isCurrent ? `0 0 0 4px ${TIER_COLORS[t.tier]}33` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {(isPast || isCurrent) && (
                    <span style={{ color: '#fff', fontSize: isCurrent ? 13 : 11, fontWeight: 700 }}>
                      {isCurrent ? '★' : '✓'}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: isCurrent ? 34 : 28,
                    fontSize: 11,
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? TIER_COLORS[t.tier] : '#6B7280',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: isCurrent ? 46 : 40,
                    fontSize: 10,
                    color: '#9CA3AF',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.max ? `${t.min}–${t.max}` : `${t.min}+`}
                </div>
              </div>
              {/* Line segment */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: isPast ? TIER_COLORS[t.tier] : '#E5E7EB',
                    borderRadius: 2,
                    margin: '0 2px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer for labels */}
      <div style={{ height: 48 }} />

      {/* Next tier message */}
      {nextTier && (
        <div
          style={{
            background: `${TIER_COLORS[nextTier.tier]}11`,
            border: `1px solid ${TIER_COLORS[nextTier.tier]}33`,
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 13,
            color: TIER_COLORS[nextTier.tier],
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Ещё {toNext} реферал{toNext === 1 ? '' : toNext < 5 ? 'а' : 'ов'} до уровня {TIER_LABEL[nextTier.tier]}
        </div>
      )}

      {/* Benefits table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--c-surface)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid var(--c-border)' }}>Уровень</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid var(--c-border)' }}>Бонус за диспетчера</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid var(--c-border)' }}>Бонус за owner-op</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid var(--c-border)' }}>Месячный бонус</th>
            </tr>
          </thead>
          <tbody>
            {tierBenefits.map((b, idx) => {
              const isCurrent = b.tier === MY_STATS.tier;
              return (
                <tr
                  key={b.tier}
                  style={{
                    background: isCurrent ? `${TIER_COLORS[b.tier]}0D` : idx % 2 === 0 ? '#fff' : 'var(--c-surface)',
                    outline: isCurrent ? `2px solid ${TIER_COLORS[b.tier]}44` : 'none',
                  }}
                >
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--c-border)' }}>
                    <TierBadge tier={b.tier} />
                    {isCurrent && <span style={{ marginLeft: 6, fontSize: 11, color: TIER_COLORS[b.tier] }}>← вы здесь</span>}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--c-border)', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? TIER_COLORS[b.tier] : 'var(--c-dark)' }}>{b.disp}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--c-border)', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? TIER_COLORS[b.tier] : 'var(--c-dark)' }}>{b.ownerOp}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--c-border)', fontWeight: isCurrent ? 700 : 400, color: isCurrent ? TIER_COLORS[b.tier] : 'var(--c-dark)' }}>{b.monthly}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Referral Link Card ───────────────────────────────────────────────────────

function ReferralLinkCard() {
  const [copyDone, setCopyDone] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(REFERRAL_LINK).catch(() => {});
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  }

  return (
    <div className="card" style={{ padding: '24px 28px', marginBottom: 20 }}>
      <div className="section-title" style={{ marginBottom: 16 }}>Ваша реферальная ссылка</div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Link box */}
        <div
          style={{
            flex: 1,
            minWidth: 240,
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 8,
            padding: '10px 14px',
            fontFamily: 'monospace',
            fontSize: 13,
            color: 'var(--c-accent)',
            wordBreak: 'break-all',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {REFERRAL_LINK}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCopy}
          style={{
            minWidth: 110,
            padding: '10px 20px',
            fontWeight: 600,
            fontSize: 14,
            transition: 'background 0.2s',
          }}
        >
          {copyDone ? 'Скопировано!' : 'Копировать'}
        </button>
      </div>

      {/* Share buttons row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <a
          href={`whatsapp://send?text=Присоединяйся к DispaLoadIQ! ${encodeURIComponent(REFERRAL_LINK)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#25D366',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span>📱</span> WhatsApp
        </a>
        <a
          href={`tg://msg?text=${encodeURIComponent('Присоединяйся к DispaLoadIQ! ' + REFERRAL_LINK)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#229ED9',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span>✈️</span> Telegram
        </a>
        <a
          href={`mailto:?subject=Приглашение в DispaLoadIQ&body=${encodeURIComponent('Привет! Присоединяйся к DispaLoadIQ — платформе для диспетчеров и owner-op.\n\n' + REFERRAL_LINK)}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#6B7280',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span>✉️</span> Email Invite
        </a>
      </div>

      {/* QR Placeholder */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        <div
          style={{
            width: 100,
            height: 100,
            background: '#F3F4F6',
            border: '1px solid var(--c-border)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 28 }}>▦</span>
          <span style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>QR Code</span>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', paddingTop: 8 }}>
          Отсканируй QR-код для быстрого доступа к вашей реферальной странице. Поделись им с коллегами на мероприятиях или в печатных материалах.
        </div>
      </div>
    </div>
  );
}

// ─── Tab: My Referrals ────────────────────────────────────────────────────────

function MyReferralsTab() {
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  const counts = {
    all: MY_REFERRALS.length,
    active: MY_REFERRALS.filter((r) => r.status === 'active').length,
    pending: MY_REFERRALS.filter((r) => r.status === 'pending').length,
    inactive: MY_REFERRALS.filter((r) => r.status === 'inactive').length,
  };

  const filtered = filter === 'all' ? MY_REFERRALS : MY_REFERRALS.filter((r) => r.status === filter);

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'inactive', label: 'Inactive' },
  ];

  return (
    <div>
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            className="btn btn-sm"
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 13,
              border: filter === f.key ? '2px solid var(--c-accent)' : '1px solid var(--c-border)',
              background: filter === f.key ? 'var(--c-accent)' : '#fff',
              color: filter === f.key ? '#fff' : '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {f.label}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: filter === f.key ? 'rgba(255,255,255,0.3)' : '#E5E7EB',
                color: filter === f.key ? '#fff' : '#374151',
                fontSize: 11,
                fontWeight: 700,
                padding: '0 4px',
              }}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--c-surface)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Имя</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Роль</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Дата</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Статус</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Заработано</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr
                key={r.id}
                style={{
                  background: idx % 2 === 0 ? '#fff' : 'var(--c-surface)',
                  transition: 'background 0.15s',
                }}
              >
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--c-border)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--c-dark)' }}>{r.name}</div>
                  {r.loadsCompleted !== undefined && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{r.loadsCompleted} loads</div>
                  )}
                </td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--c-border)' }}>
                  <RolePill role={r.role} />
                </td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--c-border)', color: '#374151' }}>{r.joinedDate}</td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--c-border)' }}>
                  <StatusPill status={r.status} />
                </td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--c-border)', textAlign: 'right', fontWeight: 700, color: r.earned > 0 ? '#065F46' : '#9CA3AF' }}>
                  {r.earned > 0 ? `$${r.earned}` : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>
                  Нет рефералов в этой категории
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Leaderboard ─────────────────────────────────────────────────────────

function LeaderboardTab() {
  const rankMedals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--c-surface)' }}>
            <th style={{ padding: '10px 14px', textAlign: 'center', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)', width: 50 }}>#</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Имя</th>
            <th style={{ padding: '10px 14px', textAlign: 'center', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Страна</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Рефералы</th>
            <th style={{ padding: '10px 14px', textAlign: 'right', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Заработано</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '2px solid var(--c-border)' }}>Уровень</th>
          </tr>
        </thead>
        <tbody>
          {LEADERBOARD.map((row) => {
            const isTopTwo = row.rank <= 2;
            const isCurrentUser = row.rank === 5;
            let rowBg = row.rank % 2 === 0 ? 'var(--c-surface)' : '#fff';
            if (isTopTwo) rowBg = '#FAEEDA';
            if (isCurrentUser) rowBg = '#EFF6FF';

            return (
              <tr
                key={row.rank}
                style={{
                  background: rowBg,
                  outline: isCurrentUser ? '2px solid #BFDBFE' : 'none',
                  outlineOffset: isCurrentUser ? '-2px' : '0',
                }}
              >
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)', textAlign: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    {rankMedals[row.rank] || row.rank}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)' }}>
                  <span style={{ fontWeight: isCurrentUser ? 700 : 500, color: isCurrentUser ? '#1D4ED8' : 'var(--c-dark)' }}>
                    {row.name}
                  </span>
                  {isCurrentUser && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#1D4ED8', background: '#DBEAFE', borderRadius: 10, padding: '1px 7px', fontWeight: 700 }}>
                      вы
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)', textAlign: 'center', fontSize: 18 }}>
                  {row.country}
                </td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)', textAlign: 'right', fontWeight: 700, color: 'var(--c-dark)' }}>
                  {row.referrals}
                </td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)', textAlign: 'right', fontWeight: 700, color: '#065F46' }}>
                  ${row.earned.toLocaleString()}
                </td>
                <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--c-border)' }}>
                  <TierBadge tier={row.tier} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: How It Works ────────────────────────────────────────────────────────

function HowItWorksTab() {
  const steps = [
    {
      num: '1',
      icon: '🔗',
      title: 'Скопируй реферальную ссылку',
      desc: 'Скопируй свою уникальную реферальную ссылку или QR-код и поделись ею в своей сети — в чатах, соцсетях, лично.',
    },
    {
      num: '2',
      icon: '📋',
      title: 'Друг регистрируется',
      desc: 'Ваш друг переходит по ссылке, создаёт аккаунт и проходит верификацию профиля на платформе DispaLoadIQ.',
    },
    {
      num: '3',
      icon: '💰',
      title: 'Ты получаешь бонус',
      desc: 'После того как реферал-диспетчер завершит первый груз (или owner-op оплатит первый месяц), вы получите выплату в течение 24 часов.',
    },
  ];

  const faqs: { q: string; a: string }[] = [
    {
      q: 'Когда я получу выплату?',
      a: 'Для диспетчеров — после того, как ваш реферал завершит свой первый груз. Для owner-op — после первого оплаченного биллингового месяца. Выплата производится в течение 24 часов после выполнения условия.',
    },
    {
      q: 'Есть ли лимит рефералов?',
      a: 'Нет никакого лимита! Вы можете приглашать неограниченное количество людей и зарабатывать бонусы с каждого реферала. Чем больше активных рефералов — тем выше ваш уровень.',
    },
    {
      q: 'Как долго действует реферальный бонус?',
      a: 'Разовый бонус за приглашение выплачивается однократно. На уровне Platinum дополнительно действует ежемесячный бонус за каждого активного реферала — он продолжается всё время, пока реферал активен на платформе.',
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {steps.map((s) => (
          <div
            key={s.num}
            className="card"
            style={{ flex: 1, minWidth: 200, padding: '20px', position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                fontSize: 64,
                fontWeight: 900,
                color: 'var(--c-border)',
                lineHeight: 1,
                opacity: 0.5,
                userSelect: 'none',
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-dark)', marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.55 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-dark)', marginBottom: 12 }}>Часто задаваемые вопросы</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              style={{
                border: '1px solid var(--c-border)',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: 14,
                  color: 'var(--c-dark)',
                  gap: 12,
                }}
              >
                <span>{faq.q}</span>
                <span
                  style={{
                    fontSize: 18,
                    color: '#9CA3AF',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: '0 18px 16px',
                    fontSize: 13,
                    color: '#6B7280',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--c-border)',
                    paddingTop: 12,
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GrowthReferralPage() {
  const [activeTab, setActiveTab] = useState<'referrals' | 'leaderboard' | 'howto'>('referrals');

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'referrals', label: 'Мои рефералы' },
    { key: 'leaderboard', label: 'Лидерборд' },
    { key: 'howto', label: 'Как это работает' },
  ];

  const tierColor = TIER_COLORS[MY_STATS.tier];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-dark)', margin: 0 }}>
          Реферальная программа
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 0 }}>
          Приглашайте коллег на платформу и зарабатывайте бонусы за каждого активного пользователя
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Всего заработано" value={`$${MY_STATS.totalEarned}`} sub="за всё время" />
        <StatCard label="Ожидает выплаты" value={`$${MY_STATS.pendingEarned}`} sub="обработка 1–3 дня" />
        <StatCard label="Активных рефералов" value={String(MY_STATS.activeReferrals)} sub={`из ${MY_STATS.totalReferrals} всего`} />
        <div
          className="card"
          style={{ flex: 1, minWidth: 140, padding: '18px 20px', borderTop: `4px solid ${tierColor}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <TierBadge tier={MY_STATS.tier} />
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Ваш уровень</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>+${MY_STATS.monthlyBonus} бонус этого месяца</div>
        </div>
      </div>

      {/* Tier Progress */}
      <TierProgress />

      {/* Referral Link */}
      <ReferralLinkCard />

      {/* Tabs */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--c-border)', background: 'var(--c-surface)' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 22px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  color: isActive ? 'var(--c-accent)' : '#6B7280',
                  borderBottom: isActive ? '2px solid var(--c-accent)' : '2px solid transparent',
                  marginBottom: -2,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '24px 28px' }}>
          {activeTab === 'referrals' && <MyReferralsTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'howto' && <HowItWorksTab />}
        </div>
      </div>
    </div>
  );
}
