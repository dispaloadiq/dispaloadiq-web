import { useState, useRef, useEffect } from 'react'
import type { UserRole } from '../../types'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
  time: string
  cards?: InfoCard[]
  followUps?: string[]
  loading?: boolean
  liked?: boolean | null
  saved?: boolean
  thumbsUp?: number
  thumbsDown?: number
  category?: ConvCategory
}

interface InfoCard {
  icon: string
  label: string
  value: string
  sub?: string
  color?: string
}

interface Conversation {
  id: string
  title: string
  preview: string
  time: string
  saved: boolean
  pinned: boolean
  role: UserRole
  category: ConvCategory
}

interface MarketLane {
  from: string
  to: string
  equip: string
  rate: string
  change: number
  vol: string
}

interface PromptTemplate {
  id: string
  title: string
  prompt: string
  category: ConvCategory
  icon: string
  tags: string[]
}

type ConvCategory = 'all' | 'compliance' | 'finance' | 'routes' | 'market' | 'dispatch'

// ── Mock conversation history ─────────────────────────────────────────────────
const MOCK_HISTORY: Conversation[] = [
  { id: 'c1', title: 'Ставки CHI→DAL на этой неделе', preview: 'Spot rate $2.44/mi...', time: '10:24', saved: true,  pinned: true,  role: 'dispatcher', category: 'market'     },
  { id: 'c2', title: 'Расчёт IFTA за Q1',              preview: 'Ожидаемый возврат $124...', time: 'вчера', saved: false, pinned: true, role: 'owner-op',  category: 'compliance' },
  { id: 'c3', title: 'Оптимизация маршрута Dry Van',   preview: 'Треугольник CHI→DAL→PHX...', time: 'вчера', saved: true, pinned: false, role: 'owner-op', category: 'routes'    },
  { id: 'c4', title: 'Договор с owner-operator',       preview: '8% от gross, гарантия $2.55...', time: 'пн', saved: false, pinned: false, role: 'dispatcher', category: 'dispatch' },
  { id: 'c5', title: 'DOT требования для компании',    preview: 'Для 5+ траков обязательно...', time: 'пн', saved: false, pinned: false, role: 'company', category: 'compliance'  },
  { id: 'c6', title: 'Факторинг — как выбрать',        preview: 'Ключевые параметры: ставка, NOA...', time: 'вс', saved: true, pinned: false, role: 'owner-op', category: 'finance' },
  { id: 'c7', title: 'Страхование флота 5 траков',     preview: 'Минимальный пакет от $4,200/мес...', time: 'сб', saved: false, pinned: false, role: 'company', category: 'finance' },
  { id: 'c8', title: 'HOS правила для водителей',      preview: '11-часовое окно за рейс...', time: 'сб', saved: false, pinned: false, role: 'company', category: 'compliance'   },
]

// ── Market Pulse data ─────────────────────────────────────────────────────────
const MARKET_LANES: MarketLane[] = [
  { from: 'CHI', to: 'DAL', equip: 'DV', rate: '$2.44', change:  6.3, vol: '847' },
  { from: 'LAX', to: 'CHI', equip: 'DV', rate: '$2.61', change:  2.1, vol: '612' },
  { from: 'ATL', to: 'NYC', equip: 'RF', rate: '$2.91', change: -1.4, vol: '388' },
  { from: 'HOU', to: 'PHX', equip: 'DV', rate: '$2.40', change:  4.0, vol: '510' },
  { from: 'DAL', to: 'LAX', equip: 'FB', rate: '$2.68', change:  0.8, vol: '295' },
]

// ── Prompt template library ───────────────────────────────────────────────────
const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Compliance
  { id: 't1',  category: 'compliance', icon: '📋', title: 'IFTA Q2 расчёт',       tags: ['IFTA', 'tax'],       prompt: 'Помоги рассчитать IFTA за Q2 2026 — за три месяца пробег 18,400 miles по 9 штатам' },
  { id: 't2',  category: 'compliance', icon: '🔍', title: 'DOT audit чек-лист',   tags: ['DOT', 'audit'],      prompt: 'Составь чек-лист подготовки к DOT compliance review для компании с 5 траками' },
  { id: 't3',  category: 'compliance', icon: '📱', title: 'ELD нарушения — что грозит', tags: ['ELD', 'HOS'],  prompt: 'Какие штрафы за нарушения ELD и HOS в 2026 году и как их избежать?' },
  { id: 't4',  category: 'compliance', icon: '🛃', title: 'UCR регистрация',       tags: ['UCR', 'annual'],    prompt: 'Как и когда подавать UCR (Unified Carrier Registration) для транспортной компании?' },
  { id: 't5',  category: 'compliance', icon: '💊', title: 'Drug & Alcohol программа', tags: ['FMCSA', 'D&A'], prompt: 'Что включает обязательная Drug & Alcohol Testing программа по FMCSA Part 382?' },
  { id: 't6',  category: 'compliance', icon: '📁', title: 'Driver Qualification File', tags: ['DQF', 'driver'], prompt: 'Что должно быть в Driver Qualification File для каждого водителя согласно FMCSA?' },
  { id: 't7',  category: 'compliance', icon: '🔒', title: 'Clearinghouse запрос',  tags: ['FMCSA', 'CDL'],    prompt: 'Как провести запрос в FMCSA Drug & Alcohol Clearinghouse при найме нового водителя?' },
  { id: 't8',  category: 'compliance', icon: '⚠️', title: 'SMS Score — улучшить', tags: ['SMS', 'safety'],    prompt: 'Как улучшить SMS Safety Score на FMCSA — какие категории влияют сильнее всего?' },

  // Finance
  { id: 't9',  category: 'finance', icon: '💵', title: 'P&L рейс',              tags: ['P&L', 'profit'],    prompt: 'Составь P&L для рейса Чикаго→Даллас: ставка $2,100, дизель $3.89, 850 miles, $180 toll' },
  { id: 't10', category: 'finance', icon: '🏦', title: 'Факторинг vs банк',     tags: ['factoring', 'cash'], prompt: 'Сравни факторинг и бизнес-кредит для owner-operator — когда что выгоднее?' },
  { id: 't11', category: 'finance', icon: '📊', title: 'ROI на новый трак',     tags: ['ROI', 'truck'],     prompt: 'Рассчитай ROI на покупку нового Freightliner за $165K при ставках $2.45 RPM, 2,300 mi/нед' },
  { id: 't12', category: 'finance', icon: '💳', title: 'Fuel card сравнение',   tags: ['fuel', 'savings'],  prompt: 'Сравни топливные карты EFS, Comdata, Relay для owner-operator — скидки и условия' },
  { id: 't13', category: 'finance', icon: '📉', title: 'Break-even расчёт',     tags: ['costs', 'CPM'],     prompt: 'Рассчитай минимальную ставку RPM для безубыточности при GVWR 80K, CPM $1.85, цель $0.40 profit' },
  { id: 't14', category: 'finance', icon: '🧾', title: 'Налоговые вычеты OO',   tags: ['tax', 'deductions'], prompt: 'Какие налоговые вычеты доступны owner-operator при подаче Schedule C?' },
  { id: 't15', category: 'finance', icon: '💰', title: 'Зарплата водителя %',   tags: ['payroll', 'driver'], prompt: 'Что выгоднее для компании — платить водителю % от gross или CPM? Сравни на конкретных числах' },
  { id: 't16', category: 'finance', icon: '📈', title: 'Флот — рентабельность', tags: ['fleet', 'ROI'],     prompt: 'Анализ рентабельности флота 5 траков: Revenue $62K/мес, expenses $48K — где точки роста?' },

  // Routes
  { id: 't17', category: 'routes', icon: '🗺️', title: 'Треугольный маршрут',   tags: ['route', 'RPM'],     prompt: 'Построй оптимальный треугольный маршрут из Чикаго для dry van с max RPM на следующей неделе' },
  { id: 't18', category: 'routes', icon: '🏔️', title: 'Маршрут через горы',    tags: ['route', 'flatbed'], prompt: 'Flatbed рейс Денвер→Сиэтл — какие перевалы избегать зимой и оптимальный путь?' },
  { id: 't19', category: 'routes', icon: '⛽', title: 'Топливная оптимизация',  tags: ['fuel', 'stops'],    prompt: 'Где выгоднее всего заправляться на маршруте Чикаго→Лос-Анджелес — топ-5 точек' },
  { id: 't20', category: 'routes', icon: '🚫', title: 'Deadhead минимизация',   tags: ['deadhead', 'empty'], prompt: 'Как минимизировать deadhead miles при работе в коридоре Техас — Средний Запад?' },
  { id: 't21', category: 'routes', icon: '📅', title: 'Недельный план рейсов',  tags: ['weekly', 'plan'],   prompt: 'Составь недельный план рейсов для dry van из Атланты: цель $3,500 net после расходов' },
  { id: 't22', category: 'routes', icon: '🌧️', title: 'Погода и маршрут',       tags: ['weather', 'plan'],  prompt: 'Как планировать маршрут с учётом зимней погоды — инструменты и стратегия для OO' },
  { id: 't23', category: 'routes', icon: '🔄', title: 'Обратный рейс',          tags: ['backhaul', 'load'], prompt: 'Лучшие стратегии поиска обратных рейсов (backhaul) при работе Northeast←→Southeast' },
  { id: 't24', category: 'routes', icon: '⚡', title: 'HOS оптимизация рейса',  tags: ['HOS', 'hours'],     prompt: 'Как спланировать рейс Чикаго→Майами (1,370 miles) с учётом HOS 11ч вождения и остановками?' },

  // Market
  { id: 't25', category: 'market', icon: '📈', title: 'Спот vs контракт',       tags: ['spot', 'contract'], prompt: 'Когда выгоднее работать на споте, а когда брать контрактные ставки — анализ для dry van?' },
  { id: 't26', category: 'market', icon: '🌊', title: 'Сезонные тренды',        tags: ['seasonal', 'DAT'],  prompt: 'Какие сезонные тренды ставок для dry van в Q3 2026 — где рост, где падение?' },
  { id: 't27', category: 'market', icon: '🏙️', title: 'Горячие рынки сейчас',  tags: ['hot markets', 'loads'], prompt: 'Какие рынки сейчас самые горячие для dry van — топ-5 коридоров по объёму и RPM?' },
  { id: 't28', category: 'market', icon: '🥶', title: 'Reefer рынок анализ',    tags: ['reefer', 'temp'],   prompt: 'Анализ рынка reefer перевозок в июне 2026 — ставки, сезонность, топ коридоры' },
  { id: 't29', category: 'market', icon: '🔩', title: 'Flatbed ставки',         tags: ['flatbed', 'OD'],    prompt: 'Текущие flatbed ставки по ключевым коридорам — Средний Запад, Юг, Texas' },
  { id: 't30', category: 'market', icon: '📉', title: 'Когда ставки вырастут',  tags: ['forecast', 'rate'],  prompt: 'Прогноз рынка ставок на Q3 2026 — когда ожидать рост спотовых ставок dry van?' },
  { id: 't31', category: 'market', icon: '🤝', title: 'Лучшие брокеры 2026',   tags: ['brokers', 'TQL'],   prompt: 'Топ брокеров для dry van owner-operator в 2026 — TQL, Echo, CH Robinson — сравни условия' },
  { id: 't32', category: 'market', icon: '💹', title: 'DAT vs Truckstop',       tags: ['DAT', 'loadboard'], prompt: 'Что лучше для поиска загрузок: DAT или Truckstop — сравни цену, покрытие, функции' },

  // Dispatch
  { id: 't33', category: 'dispatch', icon: '📝', title: 'Договор диспетчер',    tags: ['contract', 'OO'],   prompt: 'Шаблон диспетчерского договора с owner-operator — 8% gross, гарантия $2.55 RPM, 14 дней уведомление' },
  { id: 't34', category: 'dispatch', icon: '🎯', title: 'Удержать клиента OO',  tags: ['retention', 'OO'],  prompt: 'Как диспетчеру удержать клиента owner-operator если он рассматривает другого диспетчера?' },
  { id: 't35', category: 'dispatch', icon: '📊', title: 'Отчёт для клиента',    tags: ['report', 'weekly'], prompt: 'Составь шаблон еженедельного отчёта о результатах для клиента OO — ключевые метрики' },
  { id: 't36', category: 'dispatch', icon: '📣', title: 'Привлечь новых OO',    tags: ['marketing', 'leads'], prompt: 'Как диспетчеру эффективно привлекать новых owner-operator клиентов в 2026 году?' },
  { id: 't37', category: 'dispatch', icon: '⭐', title: 'Профиль на платформе',  tags: ['profile', 'rating'], prompt: 'Как оптимизировать профиль диспетчера на DispaLoadIQ для получения больше клиентов?' },
  { id: 't38', category: 'dispatch', icon: '💬', title: 'Торговаться с брокером', tags: ['negotiation', 'rate'], prompt: 'Лучшие тактики переговоров с брокером для получения ставки выше первоначального оффера' },
  { id: 't39', category: 'dispatch', icon: '🚨', title: 'Проблемный рейс',       tags: ['issue', 'claim'],   prompt: 'Клиент застрял на погрузке 4 часа — как диспетчеру действовать и защитить detain charges?' },
  { id: 't40', category: 'dispatch', icon: '📈', title: 'Увеличить RPM клиента', tags: ['RPM', 'strategy'],  prompt: 'Клиент получает $2.30 RPM dry van в Техасе — пошаговый план как поднять до $2.55+' },
]

// ── Role-aware suggested prompts ──────────────────────────────────────────────
const SUGGESTIONS: Record<UserRole, { icon: string; text: string; prompt: string }[]> = {
  'owner-op': [
    { icon: '💰', text: 'Лучшие ставки сегодня',       prompt: 'Какие ставки RPM сегодня на основных лейнах из Чикаго?' },
    { icon: '🗺️', text: 'Оптимизировать маршрут',      prompt: 'Помоги оптимизировать маршрут для сухого вана из Чикаго на следующей неделе' },
    { icon: '🧭', text: 'Найти диспетчера',             prompt: 'Какие критерии важны при выборе диспетчера для dry van?' },
    { icon: '⛽', text: 'Расчёт топлива',               prompt: 'Рассчитай расходы на топливо для рейса Чикаго—Даллас 850 миль при $3.89/gal и 6 MPG' },
    { icon: '📋', text: 'Требования IFTA',              prompt: 'Объясни как работает IFTA для owner-operator с одним траком' },
    { icon: '💵', text: 'Факторинг — что выбрать',      prompt: 'Как работает факторинг для owner-operator и как выбрать хорошую компанию?' },
  ],
  dispatcher: [
    { icon: '📦', text: 'Найти грузы для клиента',      prompt: 'Найди лучшие загрузки для dry van из Техаса на этой неделе' },
    { icon: '💹', text: 'Анализ рынка ставок',          prompt: 'Как изменились ставки DAT на лейне Чикаго—Даллас за последний месяц?' },
    { icon: '📝', text: 'Составить договор',            prompt: 'Помоги составить шаблон договора с owner-operator — 8% от gross, гарантия $2.55 RPM' },
    { icon: '🎯', text: 'Улучшить RPM клиента',         prompt: 'Мой клиент получает $2.30 RPM на dry van в Техасе — как увеличить?' },
    { icon: '⭐', text: 'Привлечь клиентов',            prompt: 'Как эффективно находить новых owner-operators на DispaLoadIQ?' },
    { icon: '📊', text: 'Отчёт для клиента',            prompt: 'Помоги составить еженедельный отчёт о результатах для клиента' },
  ],
  company: [
    { icon: '🚛', text: 'Оптимизация флота',            prompt: 'Как оптимизировать загрузку флота из 5 траков для максимального дохода?' },
    { icon: '👥', text: 'Управление водителями',        prompt: 'Лучшие практики удержания водителей и снижения текучки кадров' },
    { icon: '💼', text: 'Расчёт зарплат водителей',     prompt: 'Помоги рассчитать оплату водителей — $0.52/mile + бонусы за безопасность' },
    { icon: '📋', text: 'DOT требования',               prompt: 'Какие ключевые DOT требования для транспортной компании с 5+ траками?' },
    { icon: '📈', text: 'Финансовый анализ',            prompt: 'Анализ рентабельности: Revenue $62K/мес, expenses $48K — что улучшить?' },
    { icon: '🛡️', text: 'Страхование флота',           prompt: 'Какое страхование необходимо для транспортной компании и сколько оно стоит?' },
  ],
  shipper: [
    { icon: '📦', text: 'Разместить груз выгодно',      prompt: 'Как разместить груз на платформе чтобы получить лучшие предложения от перевозчиков?' },
    { icon: '💰', text: 'Узнать рыночную ставку',       prompt: 'Какая рыночная ставка для перевозки 40,000 lbs из Хьюстона в Феникс?' },
    { icon: '✅', text: 'Проверить перевозчика',        prompt: 'Как проверить надёжность перевозчика перед заключением договора?' },
    { icon: '📄', text: 'Документы для отгрузки',       prompt: 'Какие документы нужны для отправки груза через брокера?' },
    { icon: '⏱️', text: 'Сроки доставки',              prompt: 'За сколько дней реально доставить груз из Нью-Йорка в Лос-Анджелес?' },
    { icon: '🔍', text: 'Найти надёжного перевозчика',  prompt: 'Как выбрать надёжного перевозчика для регулярных отгрузок?' },
  ],
}

// ── Context pills per role ────────────────────────────────────────────────────
const CONTEXT_PILLS: Record<UserRole, { label: string; icon: string }[]> = {
  'owner-op':  [{ label: 'Dry Van', icon: '🚛' }, { label: 'Chicago IL', icon: '📍' }, { label: 'Solo OO', icon: '👤' }, { label: 'MC# Active', icon: '✅' }],
  dispatcher:  [{ label: 'Dispatcher', icon: '📡' }, { label: '6 клиентов', icon: '👥' }, { label: 'Pro Plan', icon: '⭐' }, { label: 'Market Access', icon: '📊' }],
  company:     [{ label: '5 Trucks', icon: '🚛' }, { label: 'Illinois', icon: '📍' }, { label: 'Company MC', icon: '🏢' }, { label: 'ELD Connected', icon: '🔗' }],
  shipper:     [{ label: 'Shipper', icon: '📦' }, { label: 'FTL', icon: '🚚' }, { label: 'Regular', icon: '🔄' }, { label: 'Verified', icon: '✅' }],
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES: { id: ConvCategory; label: string; icon: string; color: string }[] = [
  { id: 'all',        label: 'Все',         icon: '🗂️',  color: '#718096' },
  { id: 'compliance', label: 'Compliance',  icon: '📋',  color: '#9F7AEA' },
  { id: 'finance',    label: 'Финансы',     icon: '💰',  color: '#48BB78' },
  { id: 'routes',     label: 'Маршруты',    icon: '🗺️',  color: '#4BAED4' },
  { id: 'market',     label: 'Рынок',       icon: '📈',  color: '#ED8936' },
  { id: 'dispatch',   label: 'Dispatch',    icon: '📡',  color: '#FC8181' },
]

// ── Mock AI responses ─────────────────────────────────────────────────────────
function getMockResponse(prompt: string): { text: string; cards?: InfoCard[]; followUps?: string[]; category?: ConvCategory } {
  const p = prompt.toLowerCase()

  if (p.includes('ставк') || p.includes('rpm') || p.includes('rate')) {
    return {
      category: 'market',
      text: `📊 **Текущие ставки DAT (реальное время):**\n\nЧикаго → Даллас — один из самых активных коридоров. Вот данные по рынку на сегодня:\n\n• Spot rate: **$2.38–2.51/mi** (dry van)\n• Неделю назад: $2.24/mi (+6.3% рост)\n• Объём предложений: высокий — 847 загрузок за 24 часа\n\n**Рекомендация:** сейчас хорошее время брать спотовые загрузки — рынок вырос. Для регулярных рейсов ищите контрактные ставки от $2.45+ с прямыми брокерами (TQL, Echo, Coyote).`,
      cards: [
        { icon: '📈', label: 'Spot Rate CHI→DAL', value: '$2.44/mi', sub: '+6% за неделю',    color: '#48BB78' },
        { icon: '📦', label: 'Загрузок сегодня',  value: '847',      sub: 'Dry Van',           color: '#4BAED4' },
        { icon: '⏱️', label: 'Лучшее время',      value: '06–10 утра', sub: 'Пик постинга',   color: '#9F7AEA' },
      ],
      followUps: ['Reefer ставки на этом же лейне?', 'Как торговаться с брокером?', 'Показать сезонный тренд CHI→DAL', 'Flatbed ставки Чикаго сейчас?'],
    }
  }

  if (p.includes('маршрут') || p.includes('route') || p.includes('оптимизи')) {
    return {
      category: 'routes',
      text: `🗺️ **Оптимальные маршруты из Чикаго (Dry Van):**\n\nДля максимального RPM советую строить треугольные маршруты, а не прямые туда-обратно:\n\n**Маршрут A — Треугольник ($2.55 avg RPM):**\nЧикаго → Даллас ($2.48) → Феникс ($2.61) → ЛА ($2.66) → назад пустой или загрузка домой\n\n**Маршрут B — Петля ($2.47 avg RPM):**\nЧикаго → Атланта ($2.52) → Майами ($2.38) → Шарлотт ($2.51) → обратно\n\n💡 **Ключевой совет:** Избегайте Northeast в пятницу — много отказов от получателей. Лучший день выхода — вторник или среда.`,
      cards: [
        { icon: '🔺', label: 'Маршрут A (треугольник)', value: '$2.55 RPM', sub: '~3,200 mi',  color: '#48BB78' },
        { icon: '🔄', label: 'Маршрут B (петля)',        value: '$2.47 RPM', sub: '~2,800 mi',  color: '#4BAED4' },
        { icon: '📅', label: 'Лучший выход',             value: 'Вт–Ср',     sub: 'min простоя', color: '#9F7AEA' },
      ],
      followUps: ['Рассчитать топливо для маршрута A', 'Deadhead из Феникса в Чикаго?', 'Какие брокеры работают по этому коридору?', 'HOS план для маршрута A'],
    }
  }

  if (p.includes('топлив') || p.includes('fuel') || p.includes('расход')) {
    return {
      category: 'routes',
      text: `⛽ **Расчёт топлива: Чикаго → Даллас**\n\n**Входные данные:**\n• Расстояние: 850 miles\n• Расход: 6.0 MPG\n• Цена: $3.89/gal\n\n**Результат:**\n• Галлонов: 850 ÷ 6 = **141.7 gal**\n• Стоимость топлива: 141.7 × $3.89 = **$551.20**\n• При ставке $2,100 (spot): чистая выручка после топлива = **$1,548.80**\n• Топливо = **26.3% от ставки**\n\n💡 Если ставка ниже $2,000 — маршрут нерентабелен с текущими ценами. Минимальная ставка для безубыточности (все расходы): ~$1,800.`,
      cards: [
        { icon: '⛽', label: 'Топливо',           value: '$551',   sub: '141.7 gal',         color: '#ED8936' },
        { icon: '💰', label: 'Net выручка',        value: '$1,549', sub: 'при ставке $2,100', color: '#48BB78' },
        { icon: '📊', label: 'Топливо от ставки',  value: '26.3%', sub: 'benchmark: 25%',    color: '#4BAED4' },
      ],
      followUps: ['Где заправляться дешевле на маршруте?', 'Учесть toll fees в расчёте', 'Полная P&L для рейса', 'Сравнить EFS vs Comdata карты'],
    }
  }

  if (p.includes('ifta')) {
    return {
      category: 'compliance',
      text: `📋 **IFTA для Owner-Operator — базовый гайд:**\n\nIFTA (International Fuel Tax Agreement) — соглашение между штатами для упрощения уплаты топливного налога.\n\n**Как работает:**\n1. Покупаете топливо и платите налог штата заправки\n2. Ежеквартально подаёте отчёт IFTA — сколько миль в каждом штате\n3. Платите разницу или получаете возврат по ставкам штатов\n\n**Дедлайны:** 30 апреля, 31 июля, 31 октября, 31 января\n\n**Требования:** GVW > 26,000 lbs ИЛИ 3+ оси\n\n⚡ DispaLoadIQ автоматически рассчитывает IFTA из Fuel Log → раздел **Fuel Log → IFTA**.`,
      cards: [
        { icon: '📅', label: 'Следующий дедлайн',    value: '31 июля 2026', sub: 'Q2 report',    color: '#ED8936' },
        { icon: '🗺️', label: 'Штатов задействовано', value: '12',           sub: 'за Q1 2026',   color: '#4BAED4' },
        { icon: '💰', label: 'Ожидаемый возврат',     value: '$124',         sub: 'по оценке',    color: '#48BB78' },
      ],
      followUps: ['Как вести Fuel Log правильно?', 'IFTA в Канаде — отличия?', 'Штрафы за просрочку IFTA', 'Автоматический расчёт IFTA в приложении'],
    }
  }

  if (p.includes('факторинг') || p.includes('factoring') || p.includes('invoice')) {
    return {
      category: 'finance',
      text: `💵 **Факторинг для Owner-Operator — полный разбор:**\n\nФакторинг = вы продаёте свои инвойсы компании (фактору) и получаете деньги немедленно вместо ожидания 30–45 дней.\n\n**Ключевые параметры при выборе:**\n• **Ставка:** 1.5–3.5% от инвойса (чем ниже, тем лучше)\n• **NOA (Notice of Assignment):** требует ли фактор уведомлять всех брокеров — это может осложнить смену факторинга\n• **Recourse vs Non-recourse:** при non-recourse фактор берёт риск неоплаты на себя (+0.5–1% к ставке)\n• **Срок контракта:** избегайте 12+ месяцев без пункта выхода\n\n**Топ факторы для TL:** OTR Solutions, RTS Financial, Triumph Financial, Apex Capital\n\n**Вывод:** для начинающего OO лучше OTR Solutions — низкий порог входа, без NOA на брокеров DAT/CH Robinson.`,
      cards: [
        { icon: '💸', label: 'Средняя ставка',   value: '2–3%',    sub: 'от инвойса',           color: '#ED8936' },
        { icon: '⚡', label: 'Скорость оплаты',  value: '24–48ч',  sub: 'vs 30–45 дней',        color: '#48BB78' },
        { icon: '🛡️', label: 'Non-recourse',     value: '+0.7%',   sub: 'защита от неоплаты',   color: '#4BAED4' },
      ],
      followUps: ['Что такое NOA и почему важно?', 'Сравнить OTR vs Triumph', 'Можно ли работать без факторинга?', 'Как выйти из факторинг-договора?'],
    }
  }

  if (p.includes('зарплат') || p.includes('payroll') || p.includes('водител') || p.includes('pay')) {
    return {
      category: 'finance',
      text: `💼 **Расчёт зарплаты водителя: $0.52/mile + бонусы**\n\n**Пример: водитель с 2,400 mi/нед:**\n• Базовая оплата: 2,400 × $0.52 = **$1,248/нед** ($5,408/мес)\n• Бонус безопасности (0 инцидентов): **$150/мес**\n• Бонус MPG (> 7.0 MPG): **$80/мес**\n• Gross monthly: **$5,638**\n\n**Обязательные удержания:**\n• Federal tax (22% bracket): −$1,240\n• SS/Medicare (7.65%): −$431\n• Health insurance: −$180\n• **Net take-home: ~$3,787/мес**\n\n**Бенчмарк рынка 2026:** $0.50–0.58/mi для опытного водителя dry van. Выше $0.55 снижает текучку на 40%.`,
      cards: [
        { icon: '💰', label: 'Gross monthly',     value: '$5,638', sub: '2,400 mi/нед',   color: '#48BB78' },
        { icon: '📊', label: 'Net take-home',      value: '$3,787', sub: 'после налогов',  color: '#4BAED4' },
        { icon: '🎯', label: 'Рыночный benchmark', value: '$0.52',  sub: '/mile, 2026',    color: '#9F7AEA' },
      ],
      followUps: ['Как начислить бонусы за безопасность?', 'Сравнить CPM vs % от gross', 'Формула расчёта YTD', 'Налоговые льготы для водителей'],
    }
  }

  if (p.includes('страхован') || p.includes('insurance') || p.includes('полис')) {
    return {
      category: 'finance',
      text: `🛡️ **Страхование транспортной компании (5 траков):**\n\n**Обязательные полисы:**\n\n1. **Auto Liability** — мин. $750K (interstate), рекомендуется $1M\n   Стоимость: $5,000–7,500/трак/год\n\n2. **Cargo Insurance** — мин. $100K\n   Стоимость: $1,200–2,000/трак/год\n\n3. **Physical Damage (Comp + Collision)**\n   Стоимость: 2–4% от стоимости трака/год\n\n4. **General Liability** — $1M/$2M aggregate\n   Стоимость: $1,500–3,000/год на компанию\n\n**Для 5 траков итого:** ~$4,200–6,500/мес\n\n💡 **Совет:** Progressive Commercial и Sentry предлагают fleet discounts при 5+ единицах. Запросите флотский полис — экономия 10–15%.`,
      cards: [
        { icon: '🛡️', label: 'Auto Liability',   value: '$1M',    sub: 'рекомендуется',    color: '#4BAED4' },
        { icon: '📦', label: 'Cargo min',          value: '$100K',  sub: 'на груз',          color: '#9F7AEA' },
        { icon: '💰', label: 'Fleet cost (5 tks)', value: '~$5,200', sub: '/мес avg',        color: '#ED8936' },
      ],
      followUps: ['Что покрывает cargo insurance?', 'Как снизить страховые взносы?', 'Нужна ли Umbrella policy?', 'Umbrella vs Excess Liability — разница?'],
    }
  }

  if (p.includes('dot') || p.includes('compliance') || p.includes('требовани')) {
    return {
      category: 'compliance',
      text: `📋 **DOT требования для компании 5+ траков:**\n\n**Обязательные элементы:**\n\n✅ **MC Authority** — активная Motor Carrier Authority (FMCSA)\n✅ **UCR (Unified Carrier Registration)** — ежегодно, до 31 декабря\n✅ **USDOT Number** — для interstate commerce\n✅ **BOC-3 Filing** — process agent во всех штатах\n✅ **ELD mandate** — для CMV с GVW > 10,001 lbs\n✅ **Drug & Alcohol Testing Program** (FMCSA Part 382)\n✅ **Driver Qualification Files** — для каждого водителя\n✅ **Biennial MCS-150 Update** — каждые 2 года\n\n**SMS (Safety Measurement System):** следите за своим баллом на ai.fmcsa.dot.gov\n\n⚠️ Roadside inspection: держите Inspection Reports 12 месяцев минимум.`,
      cards: [
        { icon: '📅', label: 'UCR дедлайн',      value: '31 дек',  sub: 'ежегодно',         color: '#ED8936' },
        { icon: '📱', label: 'ELD обязателен',    value: 'Да',      sub: '> 10,001 lbs',     color: '#4BAED4' },
        { icon: '🔍', label: 'SMS Score цель',    value: '< 65%',   sub: 'safety benchmark', color: '#48BB78' },
      ],
      followUps: ['Что такое Drug & Alcohol Clearinghouse?', 'Как читать SMS Score?', 'Чек-лист для roadside inspection', 'BOC-3 — как подать самостоятельно?'],
    }
  }

  if (p.includes('диспетчер') || p.includes('dispatcher') || p.includes('критери')) {
    return {
      category: 'dispatch',
      text: `🧭 **Как выбрать надёжного диспетчера:**\n\n**Обязательные критерии:**\n• ✅ **Platform Verified** — 50+ рейсов через DispaLoadIQ (верифицированный RPM)\n• ✅ Средний RPM > $2.40\n• ✅ Время ответа < 30 минут\n• ✅ Рейтинг ≥ 4.7 (не менее 10 отзывов)\n\n**Красные флаги:**\n• ❌ Только самооценка без верифицированных данных\n• ❌ Обещает > $3.00 RPM без подтверждения\n• ❌ Нет ни одного клиента на платформе\n• ❌ Не предлагает пробный период\n\n**Совет:** используйте **AI Match Me** в Dispatcher Marketplace — алгоритм подберёт диспетчеров под ваш тип трака и маршруты.`,
      cards: [
        { icon: '⭐', label: 'Мин. рейтинг',      value: '4.7+',     sub: '10+ отзывов',      color: '#ECC94B' },
        { icon: '📈', label: 'Мин. verified RPM',  value: '$2.40',    sub: 'platform-checked', color: '#48BB78' },
        { icon: '⏱️', label: 'Время ответа',       value: '< 30 мин', sub: 'benchmark',        color: '#4BAED4' },
      ],
      followUps: ['Как проверить диспетчера на платформе?', 'Средняя комиссия диспетчера в 2026?', 'Пробный период — как договориться?', 'AI Match Me — как работает?'],
    }
  }

  if (p.includes('договор') || p.includes('контракт') || p.includes('шаблон')) {
    return {
      category: 'dispatch',
      text: `📝 **Шаблон договора с Owner-Operator:**\n\n---\n**ДОГОВОР НА ДИСПЕТЧЕРСКИЕ УСЛУГИ**\n\nДиспетчер: [ФИО], [компания]\nВладелец: [ФИО], MC# [номер]\n\n**Условия:**\n• Ставка диспетчера: **8% от валового дохода** с каждого рейса\n• Гарантия RPM: **$2.55/mi** (если ниже — диспетчер снижает комиссию)\n• Типы груза: Dry Van · Маршруты: National\n• Время ответа: максимум 4 часа в рабочее время\n• Уведомление о расторжении: **14 дней** от любой стороны\n\n**Период:** от [дата] — бессрочный с правом расторжения\n\n---\n💡 Подпишите через **DispaLoadIQ Contracts** — обе стороны получат цифровые подписи и неизменяемую копию.`,
      cards: [
        { icon: '💰', label: 'Ставка',         value: '8%',       sub: 'от gross',        color: '#4BAED4' },
        { icon: '🎯', label: 'Гарантия RPM',   value: '$2.55',    sub: 'минимум',         color: '#48BB78' },
        { icon: '📅', label: 'Уведомление',    value: '14 дней',  sub: 'при расторжении', color: '#9F7AEA' },
      ],
      followUps: ['Добавить пункт об эксклюзивности?', 'Что ещё включить в договор?', 'Открыть шаблон в Contracts', 'Цифровая подпись — как работает?'],
    }
  }

  if (p.includes('рынок') || p.includes('рыночн') || p.includes('market') || p.includes('хьюстон') || p.includes('феникс')) {
    return {
      category: 'market',
      text: `💹 **Рыночная ставка Хьюстон → Феникс:**\n\nДистанция: ~1,178 miles\n\n**Текущие данные DAT:**\n• Dry Van spot: **$2.32–2.48/mi** ($2,730–$2,920 total)\n• Reefer spot: **$2.61–2.79/mi**\n• Flatbed: **$2.55–2.71/mi**\n\n**Тренд:** ставка выросла на 4% за 2 недели (строительный сезон в Аризоне).\n\n**Рекомендация для шиппера:** предлагайте $2,800–2,900 — получите 5–7 предложений от проверенных перевозчиков в течение 2 часов.`,
      cards: [
        { icon: '🚛', label: 'Dry Van spot',   value: '$2.40/mi', sub: '+4% vs 2 wks',       color: '#48BB78' },
        { icon: '❄️', label: 'Reefer spot',    value: '$2.70/mi', sub: 'Сезонный рост',       color: '#4BAED4' },
        { icon: '⏱️', label: 'Время на оферы', value: '< 2 часа', sub: 'при правильной цене', color: '#9F7AEA' },
      ],
      followUps: ['Flatbed ставки HOU→PHX?', 'Liftgate surcharge включён?', 'Показать топ перевозчиков на этом лейне', 'Сезонный прогноз Q3 для этого коридора'],
    }
  }

  if (p.includes('флот') || p.includes('оптимизац') || p.includes('загрузк')) {
    return {
      category: 'dispatch',
      text: `🚛 **Оптимизация флота — 5 траков:**\n\n**Каждый idle-день = $400–600 потерянной выручки.**\n\n**Стратегия максимальной загрузки:**\n1. **Dispatch Board** — Kanban для визуального контроля каждого трака\n2. **DAT + Truckstop** — мониторьте за 48h вперёд, не ждите на 0h\n3. **Прямые брокеры** — для 2–3 траков контракты с постоянными брокерами\n4. **Spot market** — для 2+ траков держите в споте для max RPM\n5. **Deadhead оптимизация** — не гоните пустым > 150 miles\n\n**Цель:** deadhead < 12% от общего пробега`,
      cards: [
        { icon: '📊', label: 'Текущая загрузка',  value: '80%',      sub: '4 из 5 траков',    color: '#4BAED4' },
        { icon: '💰', label: 'Потенциал',          value: '+$8K/мес', sub: 'при 95% утилиз.',  color: '#48BB78' },
        { icon: '🎯', label: 'Цель deadhead',      value: '< 12%',    sub: 'benchmark',        color: '#9F7AEA' },
      ],
      followUps: ['Как настроить Dispatch Board?', 'Какие брокеры дают контрактные ставки?', 'Автоматические уведомления о простоях', 'KPI отчёт для флота — шаблон'],
    }
  }

  if (p.includes('перевозчик') || p.includes('carrier') || p.includes('надёжн') || p.includes('проверить')) {
    return {
      category: 'compliance',
      text: `✅ **Как проверить перевозчика перед отправкой:**\n\n**1. FMCSA Lookup (fmcsa.dot.gov)**\n• Authority Status: **Active** ✓\n• Safety Rating: **Satisfactory** ✓\n• Insurance на файле: действующий ✓\n\n**2. Страхование (обязательно до загрузки)**\n• Auto Liability ≥ $750K\n• Cargo Insurance ≥ $100K\n• Certificate of Insurance → просите до загрузки\n\n**3. На платформе DispaLoadIQ**\n• Значок «✓ Verified» = проверенные DOT, страховка, лицензия\n• Реальные отзывы с фактическими данными\n• On-time rate и история доставок\n\n⚠️ **Красные флаги:** MC# < 1 года, нет cargo coverage, отказ от документов.`,
      cards: [
        { icon: '🛡️', label: 'Мин. страховка',  value: '$750K',      sub: 'auto liability',  color: '#4BAED4' },
        { icon: '✅', label: 'FMCSA статус',      value: 'Active',     sub: 'обязательно',     color: '#48BB78' },
        { icon: '📋', label: 'DOT Safety',        value: 'Satisfactory', sub: 'минимум',       color: '#9F7AEA' },
      ],
      followUps: ['Ещё раз про Insurance Certificate', 'Что значит "Conditional" Safety Rating?', 'Как читать SMS баллы перевозчика?', 'Верификация на DispaLoadIQ — как работает?'],
    }
  }

  if (p.includes('hos') || p.includes('hours of service') || p.includes('часов')) {
    return {
      category: 'compliance',
      text: `⏰ **HOS (Hours of Service) — правила для CMV водителей:**\n\n**Основные лимиты (Property Carrier):**\n• **11-hour driving limit** — максимум 11 часов за смену\n• **14-hour window** — не выезжать за пределы 14-часового окна с начала смены\n• **30-minute break** — обязателен после 8 часов без 30-минутного перерыва\n• **60/70-hour limit** — 60ч за 7 дней или 70ч за 8 дней\n• **34-hour restart** — после 34ч непрерывного отдыха можно начать цикл заново\n\n**Sleeper Berth исключение:**\nМожно разделить отдых 8+2 или 7+3 (но не 6+4)\n\n⚠️ ELD фиксирует всё автоматически — нарушения видны сразу на инспекции.`,
      cards: [
        { icon: '🕐', label: 'Вождение/день',    value: '11 часов',  sub: 'максимум',           color: '#4BAED4' },
        { icon: '📅', label: 'Рабочее окно',      value: '14 часов',  sub: 'с начала смены',     color: '#ED8936' },
        { icon: '😴', label: '34-hr restart',     value: '34 часа',   sub: 'непрерывный отдых',  color: '#48BB78' },
      ],
      followUps: ['Sleeper berth split — как правильно?', 'Что записывать в ELD?', 'Штрафы за HOS нарушения 2026', 'HOS исключение для short-haul'],
    }
  }

  if (p.includes('детейшн') || p.includes('detention') || p.includes('простой') || p.includes('detain')) {
    return {
      category: 'dispatch',
      text: `🚨 **Detention Pay — как получить оплату за простой:**\n\n**Стандарт отрасли:**\n• Первые **2 часа** на погрузке/выгрузке — бесплатно\n• С 3-го часа: **$75–150/час** detention fee\n\n**Как правильно оформить:**\n1. Сразу по прибытии зафиксируйте время в приложении (timestamp)\n2. Сообщите диспетчеру/брокеру — они обязаны уведомить шиппера\n3. Получите подпись или email-подтверждение от склада\n4. После 2 часов — отправьте официальный запрос брокеру\n\n**Формула инвойса:**\nDetention: [часы сверх 2] × $100/hr = сумма\n\n⚡ DispaLoadIQ автоматически засекает detention timer при check-in на локации.`,
      cards: [
        { icon: '⏱️', label: 'Бесплатно',         value: '2 часа',    sub: 'grace period',      color: '#718096' },
        { icon: '💰', label: 'Detention rate',     value: '$100/hr',   sub: 'рыночный стандарт', color: '#48BB78' },
        { icon: '📱', label: 'DispaLoadIQ timer',  value: 'Auto',      sub: 'при check-in',      color: '#4BAED4' },
      ],
      followUps: ['Брокер отказывает в detention — что делать?', 'Как добавить detention в инвойс?', 'Layover pay — другое?', 'TONU — как оформить?'],
    }
  }

  if (p.includes('roi') || p.includes('трак') || p.includes('покупк') || p.includes('leasing') || p.includes('лизинг')) {
    return {
      category: 'finance',
      text: `📊 **ROI на покупку трака Freightliner Cascadia 2024:**\n\n**Параметры:**\n• Цена: $165,000 (used 2022, 450K miles)\n• Down payment 20%: $33,000\n• Кредит на 5 лет: $132,000 @ 7.5% → **$2,640/мес**\n\n**Расчёт доходности при 2,300 mi/нед:**\n• Gross revenue: 2,300 × $2.45 × 4.3 = **$24,200/мес**\n• Топливо (6 MPG, $3.89): **−$5,720**\n• Платёж: **−$2,640**\n• Страховка + прочее: **−$2,800**\n• **Net profit: ~$13,040/мес**\n\n**ROI:** инвестиция окупится за **~2.5 года** при стабильных ставках.\n\n⚠️ Лизинг (lease-to-own) часто дороже на 20–30% — считайте full cost.`,
      cards: [
        { icon: '💰', label: 'Net profit/мес',    value: '$13,040', sub: 'при $2.45 RPM',      color: '#48BB78' },
        { icon: '📅', label: 'Срок окупаемости',  value: '2.5 года', sub: 'при 2,300 mi/нед',  color: '#4BAED4' },
        { icon: '📊', label: 'Margin',             value: '53.8%',   sub: 'после всех расходов', color: '#9F7AEA' },
      ],
      followUps: ['Lease vs buy — полный разбор', 'Какой трак выбрать — Peterbilt vs Freightliner?', 'Как получить кредит для OO?', 'Depreciation расчёт для налогов'],
    }
  }

  if (p.includes('сезон') || p.includes('q3') || p.includes('тренд') || p.includes('прогноз')) {
    return {
      category: 'market',
      text: `🌊 **Сезонные тренды ставок Dry Van — Q3 2026:**\n\n**Ожидаемая динамика по месяцам:**\n\n**Июнь:**\n• Produce season пик — reefer +12–15%\n• Dry Van стабильно на $2.45–2.55/mi\n• Горячие коридоры: Florida→Northeast, CA→Midwest\n\n**Июль:**\n• Traditionally slow start — ставки −5–8% от пика\n• Летний slack period для dry van\n• Возможности: строительные грузы Sunbelt\n\n**Август:**\n• Back-to-school retail surge — ставки начинают расти\n• Target, Walmart, Amazon warehouses активны\n• Ожидаем рост до $2.58–2.68/mi к концу августа\n\n**Прогноз Q3 avg:** $2.48–2.55/mi dry van national`,
      cards: [
        { icon: '📅', label: 'Q3 прогноз avg',    value: '$2.51/mi',  sub: 'dry van national',  color: '#4BAED4' },
        { icon: '🔥', label: 'Пик Q3',             value: 'Авг 25–',   sub: 'retail surge',      color: '#ED8936' },
        { icon: '📉', label: 'Тихий период',       value: 'Июль 1–15', sub: 'slack season',      color: '#FC8181' },
      ],
      followUps: ['Reefer прогноз Q3 2026?', 'Как использовать slack season выгодно?', 'Q4 Halloween/Christmas surge прогноз', 'Инструменты для слежения за трендами'],
    }
  }

  if (p.includes('удерж') || p.includes('retention') || p.includes('текучк')) {
    return {
      category: 'dispatch',
      text: `👥 **Удержание водителей — практическое руководство:**\n\n**Причины ухода #1–5 (опросы ATRI 2025):**\n1. Низкая оплата / нестабильные миляжи\n2. Долгие простои без связи с диспетчером\n3. Плохие домашние сроки (home time)\n4. Оборудование в плохом состоянии\n5. Отсутствие уважения / прозрачности\n\n**Что работает:**\n• Гарантированный минимум миль/нед — **2,000 mi min** снижает текучку на 35%\n• Предсказуемый home time — 2 ночи дома каждые 10 дней\n• Бонус retention: $500 за каждые 6 месяцев без нарушений\n• Weekly P&L sharing — водитель видит свою доходность\n\n**Benchmark:** средний cost-of-turnover = **$8,000–12,000** на одного водителя.`,
      cards: [
        { icon: '💰', label: 'Cost of turnover',  value: '$10,000',   sub: 'на 1 водителя',     color: '#FC8181' },
        { icon: '📊', label: 'Снижение текучки',  value: '−35%',      sub: 'при гарантии миль', color: '#48BB78' },
        { icon: '🏠', label: 'Home time норма',   value: '2 ночи',    sub: 'каждые 10 дней',    color: '#4BAED4' },
      ],
      followUps: ['Шаблон retention bonus программы', 'Как рассчитать home time schedule?', 'Что такое guaranteed miles contract?', 'Сравнить CPM vs % для удержания'],
    }
  }

  // Default response
  return {
    category: 'all',
    text: `Понял вас! Как AI-ассистент DispaLoadIQ, я специализируюсь на:\n\n• 📊 **Анализ ставок** — DAT, Truckstop, спот vs контракт\n• 🗺️ **Маршрутная оптимизация** — треугольники, петли, deadhead\n• 📋 **Compliance** — IFTA, DOT, HOS, FMCSA\n• 💵 **Факторинг** — выбор компании, NOA, recourse vs non-recourse\n• 💼 **Payroll** — расчёт оплаты водителей, CPM vs %\n• 📝 **Договоры** — шаблоны, диспетчерские соглашения\n• 🛡️ **Страхование** — fleet packages, cargo, liability\n\nУточните вопрос или выберите быструю подсказку ниже 👇`,
    followUps: ['Ставки DAT на сегодня', 'Как работает IFTA?', 'Факторинг — с чего начать?', 'HOS правила — кратко'],
  }
}

// ── PromptTemplatePanel ───────────────────────────────────────────────────────
function PromptTemplatePanel({
  onUse,
}: {
  onUse: (prompt: string) => void
}) {
  const [activeCategory, setActiveCategory] = useState<ConvCategory>('compliance')
  const [search, setSearch] = useState('')

  const filtered = PROMPT_TEMPLATES.filter(t =>
    (activeCategory === 'all' || t.category === activeCategory) &&
    (search === '' || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  )

  const catConfig = CATEGORIES.filter(c => c.id !== 'all')

  return (
    <div style={{
      width: 224, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '13px 13px 10px',
        background: 'linear-gradient(135deg,#553C9A,#7C3AED)',
        borderBottom: '1px solid rgba(255,255,255,.1)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 8 }}>📚 Шаблоны</div>
        <input
          placeholder="Поиск шаблонов..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '5px 9px',
            borderRadius: 7, border: '1px solid rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.12)', color: '#fff',
            fontSize: 11, outline: 'none',
          }}
        />
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px',
        borderBottom: '1px solid #F0F4F8',
      }}>
        {catConfig.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '3px 7px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10,
              background: activeCategory === cat.id ? cat.color + '22' : 'transparent',
              color: activeCategory === cat.id ? cat.color : '#718096',
              fontWeight: activeCategory === cat.id ? 700 : 400,
              borderBottom: activeCategory === cat.id ? `2px solid ${cat.color}` : '2px solid transparent',
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Templates list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(t => {
          const catColor = CATEGORIES.find(c => c.id === t.category)?.color ?? '#4BAED4'
          return (
            <div
              key={t.id}
              style={{
                padding: '9px 12px', borderBottom: '1px solid #F7FAFC',
                cursor: 'pointer', transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F7FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#1A2535',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>{t.title}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                    {t.tags.slice(0, 2).map(tag => (
                      <span key={tag} style={{
                        fontSize: 9, padding: '1px 5px', borderRadius: 4,
                        background: catColor + '18', color: catColor, fontWeight: 600,
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => onUse(t.prompt)}
                style={{
                  width: '100%', padding: '4px 0', borderRadius: 6, border: 'none',
                  background: catColor + '18', color: catColor,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}
              >Использовать →</button>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#A0AEC0', fontSize: 12 }}>
            Шаблоны не найдены
          </div>
        )}
      </div>
    </div>
  )
}

// ── ConvSidebar ───────────────────────────────────────────────────────────────
function ConvSidebar({
  conversations, activeId, onSelect, onNewChat, activeCategory, onCategoryChange,
}: {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  activeCategory: ConvCategory
  onCategoryChange: (cat: ConvCategory) => void
}) {
  const [search, setSearch] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  const pinned = conversations.filter(c => c.pinned)
  const unpinned = conversations.filter(c =>
    !c.pinned &&
    (!showSaved || c.saved) &&
    (activeCategory === 'all' || c.category === activeCategory) &&
    (search === '' || c.title.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{
      width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 14px 10px', borderBottom: '1px solid #F0F4F8',
        background: 'linear-gradient(135deg,#1A2535,#2D4A6B)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>💬 История</div>
          <button onClick={onNewChat} style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,.3)',
            background: 'rgba(75,174,212,.25)', color: '#7DD3F0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>+ Новый</button>
        </div>
        <input
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '6px 10px',
            borderRadius: 7, border: '1px solid rgba(255,255,255,.15)',
            background: 'rgba(255,255,255,.1)', color: '#fff',
            fontSize: 12, outline: 'none',
          }}
        />
      </div>

      {/* Category filter */}
      <div style={{
        padding: '7px 8px', borderBottom: '1px solid #F0F4F8',
        display: 'flex', flexWrap: 'wrap', gap: 4,
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            style={{
              padding: '3px 6px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10,
              background: activeCategory === cat.id ? cat.color + '20' : 'transparent',
              color: activeCategory === cat.id ? cat.color : '#A0AEC0',
              fontWeight: activeCategory === cat.id ? 700 : 400,
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Saved filter */}
      <div style={{ display: 'flex', padding: '6px 10px', gap: 6, borderBottom: '1px solid #F0F4F8' }}>
        {(['Все', 'Сохранённые'] as const).map(label => {
          const active = label === 'Сохранённые' ? showSaved : !showSaved
          return (
            <button key={label} onClick={() => setShowSaved(label === 'Сохранённые')} style={{
              flex: 1, padding: '4px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: active ? '#EBF8FF' : 'transparent',
              color: active ? '#2B6CB0' : '#718096', fontSize: 11, fontWeight: active ? 700 : 400,
            }}>{label}</button>
          )
        })}
      </div>

      {/* Pinned section */}
      {pinned.length > 0 && (
        <div>
          <div style={{
            padding: '6px 14px 4px', fontSize: 10, fontWeight: 700,
            color: '#A0AEC0', letterSpacing: 0.5, textTransform: 'uppercase',
            background: '#FFFBEB', borderBottom: '1px solid #FEF3C7',
          }}>
            📌 Закреплённые
          </div>
          {pinned.map(c => (
            <button key={c.id} onClick={() => onSelect(c.id)} style={{
              width: '100%', textAlign: 'left', padding: '9px 14px',
              background: c.id === activeId ? '#EBF8FF' : '#FFFBEB',
              border: 'none', borderBottom: '1px solid #FEF3C7',
              cursor: 'pointer', display: 'block',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: c.id === activeId ? '#2B6CB0' : '#2D3748',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 140,
                }}>{c.title}</div>
                <span style={{ fontSize: 10 }}>📌</span>
              </div>
              <div style={{ fontSize: 10, color: '#718096', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{c.preview}</div>
              <div style={{ fontSize: 9, color: '#A0AEC0', marginTop: 1 }}>{c.time}</div>
            </button>
          ))}
        </div>
      )}

      {/* Recent list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {unpinned.length > 0 && (
          <div style={{
            padding: '6px 14px 4px', fontSize: 10, fontWeight: 700,
            color: '#A0AEC0', letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            Недавние
          </div>
        )}
        {unpinned.map(c => {
          const catColor = CATEGORIES.find(cat => cat.id === c.category)?.color ?? '#718096'
          return (
            <button key={c.id} onClick={() => onSelect(c.id)} style={{
              width: '100%', textAlign: 'left', padding: '9px 14px',
              background: c.id === activeId ? '#EBF8FF' : 'transparent',
              border: 'none', borderBottom: '1px solid #F7FAFC',
              cursor: 'pointer', display: 'block',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700,
                  color: c.id === activeId ? '#2B6CB0' : '#2D3748',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 150,
                }}>{c.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {c.saved && <span style={{ fontSize: 9 }}>⭐</span>}
                  <span style={{
                    fontSize: 8, padding: '1px 4px', borderRadius: 3,
                    background: catColor + '18', color: catColor, fontWeight: 700,
                  }}>{c.category}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#718096', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{c.preview}</div>
              <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 2 }}>{c.time}</div>
            </button>
          )
        })}
        {unpinned.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#A0AEC0', fontSize: 12 }}>
            Ничего не найдено
          </div>
        )}
      </div>
    </div>
  )
}

// ── MarketPulsePanel ──────────────────────────────────────────────────────────
function MarketPulsePanel() {
  const ltr = (c: number) => c >= 0 ? `+${c.toFixed(1)}%` : `${c.toFixed(1)}%`
  const ltrColor = (c: number) => c >= 0 ? '#48BB78' : '#FC8181'

  return (
    <div style={{
      width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Market pulse card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{
          padding: '12px 14px', background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>📡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Market Pulse</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>Обновлено: только что</div>
          </div>
        </div>
        <div>
          {MARKET_LANES.map((lane, i) => (
            <div key={i} style={{
              padding: '9px 14px', borderBottom: '1px solid #F0F4F8',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2535' }}>
                  {lane.from}→{lane.to}
                  <span style={{ marginLeft: 4, fontSize: 10, color: '#A0AEC0', fontWeight: 400 }}>{lane.equip}</span>
                </div>
                <div style={{ fontSize: 10, color: '#718096' }}>{lane.vol} loads</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1A2535' }}>{lane.rate}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: ltrColor(lane.change) }}>{ltr(lane.change)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI tips card */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>💡 AI СОВЕТЫ</div>
        {[
          { tip: 'Ставки в CHI коридоре пиковые — берите спот сейчас', color: '#48BB78' },
          { tip: 'Reefer ATL→NYC упала — избегайте следующие 3 дня', color: '#FC8181' },
          { tip: 'Новые контракты доступны на DAL→LAX Flatbed', color: '#4BAED4' },
        ].map((t, i) => (
          <div key={i} style={{
            fontSize: 11, color: '#4A5568', padding: '7px 10px', borderRadius: 8, marginBottom: 6,
            background: t.color + '15', borderLeft: `3px solid ${t.color}`, lineHeight: 1.4,
          }}>{t.tip}</div>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', marginBottom: 10 }}>📊 РЫНОК СЕЙЧАС</div>
        {[
          { label: 'Load-to-truck ratio', value: '4.2:1', up: true },
          { label: 'Avg DV spot (US)', value: '$2.46/mi', up: true },
          { label: 'Diesel avg (US)', value: '$3.91/gal', up: false },
          { label: 'Active loads DAT', value: '248K+', up: true },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 0', borderBottom: i < 3 ? '1px solid #F0F4F8' : 'none',
          }}>
            <div style={{ fontSize: 11, color: '#718096' }}>{s.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.up ? '#48BB78' : '#FC8181' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AIAssistantPage({ role }: { role: UserRole }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0, role: 'assistant', time: '',
      text: `Привет! Я AI-ассистент DispaLoadIQ 🤖\n\nЗнаю всё о грузоперевозках — ставки, маршруты, IFTA, факторинг, страхование, зарплаты водителей и договоры. Спросите что угодно или выберите быстрый вопрос ниже.`,
      followUps: ['Ставки на этой неделе?', 'Как работает IFTA?', 'Факторинг — с чего начать?', 'HOS правила кратко'],
      thumbsUp: 0, thumbsDown: 0,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeConvId, setActiveConvId] = useState('current')
  const [conversations] = useState<Conversation[]>(MOCK_HISTORY)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMarket, setShowMarket] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [convCategory, setConvCategory] = useState<ConvCategory>('all')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastText, setToastText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const suggestions = SUGGESTIONS[role]
  const contextPills = CONTEXT_PILLS[role]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function showToast(text: string) {
    setToastText(text)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text, time: now }
    const loadingMsg: ChatMessage = { id: Date.now() + 1, role: 'assistant', text: '', time: now, loading: true }
    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const response = getMockResponse(text)
      setMessages(prev => prev.map(m =>
        m.loading ? {
          ...m,
          text: response.text,
          cards: response.cards,
          followUps: response.followUps,
          category: response.category,
          loading: false,
          liked: null,
          saved: false,
          thumbsUp: 0,
          thumbsDown: 0,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        } : m
      ))
      setLoading(false)
    }, 800 + Math.random() * 700)
  }

  function toggleLike(id: number, val: boolean) {
    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m
      const wasLiked = m.liked === val
      const newLiked = wasLiked ? null : val
      const thumbsUp = (m.thumbsUp ?? 0) + (val && !wasLiked ? 1 : val && wasLiked ? -1 : 0)
      const thumbsDown = (m.thumbsDown ?? 0) + (!val && !wasLiked ? 1 : !val && wasLiked ? -1 : 0)
      return { ...m, liked: newLiked, thumbsUp, thumbsDown }
    }))
  }

  function toggleSaved(id: number) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, saved: !m.saved } : m))
  }

  function copyMessage(text: string) {
    navigator.clipboard.writeText(text).catch(() => { /* ignore */ })
    showToast('✅ Скопировано в буфер обмена')
  }

  function exportChat() {
    const lines = messages
      .filter(m => !m.loading && m.text)
      .map(m => `[${m.role === 'user' ? 'Вы' : 'AI'} ${m.time}]\n${m.text}`)
      .join('\n\n---\n\n')
    navigator.clipboard.writeText(lines).catch(() => { /* ignore */ })
    showToast('📋 Чат скопирован в буфер обмена')
  }

  function startNewChat() {
    setMessages([{
      id: Date.now(), role: 'assistant', time: '',
      text: `Новый чат начат! Чем могу помочь?`,
      followUps: ['Ставки DAT сегодня', 'Рассчитать топливо', 'Вопрос по IFTA', 'Оптимизировать маршрут'],
      thumbsUp: 0, thumbsDown: 0,
    }])
    setActiveConvId('new-' + Date.now())
  }

  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <div key={i} style={{ marginBottom: line === '' ? 6 : 0 }}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
          )}
        </div>
      )
    })
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', gap: 14, position: 'relative' }}>

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: '#1A2535', color: '#fff', padding: '10px 22px',
          borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,.25)',
          animation: 'fadeInUp .25s ease',
        }}>
          <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          {toastText}
        </div>
      )}

      {/* ── Template library panel ─────────────────────────────────────────── */}
      {showTemplates && (
        <PromptTemplatePanel onUse={prompt => { sendMessage(prompt); setShowTemplates(false) }} />
      )}

      {/* ── Conversation sidebar ───────────────────────────────────────────── */}
      {showSidebar && (
        <ConvSidebar
          conversations={conversations}
          activeId={activeConvId}
          onSelect={setActiveConvId}
          onNewChat={startNewChat}
          activeCategory={convCategory}
          onCategoryChange={setConvCategory}
        />
      )}

      {/* ── Main chat ─────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, minWidth: 0, background: '#fff', borderRadius: 14,
        border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 18px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', gap: 10, background: '#F7FAFC', flexShrink: 0,
        }}>
          {/* Toggle sidebar */}
          <button onClick={() => setShowSidebar(v => !v)} title="История чатов" style={{
            width: 30, height: 30, borderRadius: 7, border: '1.5px solid #E2E8F0',
            background: showSidebar ? '#EBF8FF' : '#fff', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A5568',
          }}>☰</button>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
          }}>🤖</div>

          {/* Title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535' }}>DispaLoadIQ AI</div>
            <div style={{ fontSize: 11, color: '#48BB78' }}>● Онлайн · отвечает мгновенно</div>
          </div>

          {/* Context pills */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {contextPills.map(pill => (
              <div key={pill.label} style={{
                padding: '3px 8px', borderRadius: 20, border: '1.5px solid #E2E8F0',
                fontSize: 11, color: '#4A5568', background: '#F7FAFC',
                display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
              }}>
                <span>{pill.icon}</span><span>{pill.label}</span>
              </div>
            ))}
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            <button onClick={startNewChat} title="Новый чат" style={{
              padding: '5px 10px', borderRadius: 7, border: '1.5px solid #4BAED4',
              background: '#EBF8FF', color: '#2B6CB0', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>+ Чат</button>
            <button onClick={() => setShowTemplates(v => !v)} title="Шаблоны" style={{
              padding: '5px 10px', borderRadius: 7, border: '1.5px solid #E2E8F0',
              background: showTemplates ? '#F3E8FF' : '#fff',
              color: showTemplates ? '#7C3AED' : '#4A5568',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>📚 Шаблоны</button>
            <button onClick={exportChat} title="Экспортировать чат" style={{
              padding: '5px 10px', borderRadius: 7, border: '1.5px solid #E2E8F0',
              background: '#fff', color: '#4A5568', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>📤 Экспорт</button>
            <button onClick={() => setShowMarket(v => !v)} title="Market Pulse" style={{
              width: 30, height: 30, borderRadius: 7, border: '1.5px solid #E2E8F0',
              background: showMarket ? '#EBF8FF' : '#fff', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A5568',
            }}>📡</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '18px 20px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 10, alignItems: 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#4BAED4,#2D7A9A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, marginTop: 2,
                }}>🤖</div>
              )}

              <div style={{ maxWidth: '74%' }}>
                {/* Bubble */}
                <div style={{
                  padding: '11px 15px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,#4BAED4,#2D7A9A)'
                    : '#F7FAFC',
                  color: msg.role === 'user' ? '#fff' : '#2D3748',
                  border: msg.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                  fontSize: 13.5, lineHeight: 1.6,
                }}>
                  {msg.loading ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 8, height: 8, borderRadius: '50%', background: '#4BAED4',
                          animation: `dotPulse${i} ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                        }} />
                      ))}
                      <style>{`
                        @keyframes dotPulse0 { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
                        @keyframes dotPulse1 { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
                        @keyframes dotPulse2 { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
                      `}</style>
                    </div>
                  ) : renderText(msg.text)}
                </div>

                {/* Info cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                    {msg.cards.map((card, i) => (
                      <div key={i} style={{
                        background: '#fff', border: '1.5px solid #E2E8F0',
                        borderRadius: 10, padding: '8px 12px', minWidth: 100,
                      }}>
                        <div style={{ fontSize: 16, marginBottom: 2 }}>{card.icon}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: card.color ?? '#1A2535' }}>{card.value}</div>
                        <div style={{ fontSize: 10, color: '#718096', marginTop: 1 }}>{card.label}</div>
                        {card.sub && <div style={{ fontSize: 10, color: '#A0AEC0' }}>{card.sub}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Message actions (assistant only, not loading) */}
                {msg.role === 'assistant' && !msg.loading && msg.id !== 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Thumbs up with count */}
                    <button
                      onClick={() => toggleLike(msg.id, true)}
                      title="Полезно"
                      style={{
                        border: 'none',
                        background: msg.liked === true ? '#C6F6D5' : 'transparent',
                        borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, color: '#4A5568',
                      }}
                    >
                      👍 {(msg.thumbsUp ?? 0) > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#48BB78' }}>{msg.thumbsUp}</span>}
                    </button>
                    {/* Thumbs down with count */}
                    <button
                      onClick={() => toggleLike(msg.id, false)}
                      title="Не полезно"
                      style={{
                        border: 'none',
                        background: msg.liked === false ? '#FED7D7' : 'transparent',
                        borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
                        fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, color: '#4A5568',
                      }}
                    >
                      👎 {(msg.thumbsDown ?? 0) > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#FC8181' }}>{msg.thumbsDown}</span>}
                    </button>
                    <button onClick={() => toggleSaved(msg.id)} title="Сохранить" style={{
                      border: 'none', background: msg.saved ? '#FEFCBF' : 'transparent',
                      borderRadius: 6, padding: '3px 6px', cursor: 'pointer', fontSize: 13,
                    }}>{msg.saved ? '⭐' : '☆'}</button>
                    <button onClick={() => copyMessage(msg.text)} title="Копировать" style={{
                      border: 'none', background: 'transparent',
                      borderRadius: 6, padding: '3px 6px', cursor: 'pointer', fontSize: 13,
                    }}>📋</button>
                    {msg.category && msg.category !== 'all' && (() => {
                      const catConf = CATEGORIES.find(c => c.id === msg.category)
                      return catConf ? (
                        <span style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 4,
                          background: catConf.color + '18', color: catConf.color, fontWeight: 700,
                        }}>{catConf.icon} {catConf.label}</span>
                      ) : null
                    })()}
                    {msg.time && (
                      <span style={{ fontSize: 10, color: '#A0AEC0', marginLeft: 2 }}>{msg.time}</span>
                    )}
                  </div>
                )}

                {/* Follow-up chips */}
                {msg.role === 'assistant' && !msg.loading && msg.followUps && msg.followUps.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {msg.followUps.map((fu, i) => (
                      <button key={i} onClick={() => sendMessage(fu)} disabled={loading} style={{
                        padding: '5px 10px', borderRadius: 20,
                        border: '1.5px solid #BEE3F8', background: '#EBF8FF',
                        color: '#2B6CB0', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        opacity: loading ? 0.5 : 1,
                      }}>{fu}</button>
                    ))}
                  </div>
                )}

                {msg.role === 'user' && msg.time && (
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 3, textAlign: 'right' }}>{msg.time}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        <div style={{
          padding: '8px 18px 0', borderTop: '1px solid #F0F4F8',
          display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s.prompt)} disabled={loading} style={{
              padding: '5px 10px', borderRadius: 20, whiteSpace: 'nowrap',
              border: '1.5px solid #E2E8F0', background: '#F7FAFC',
              color: '#4A5568', fontSize: 11, cursor: 'pointer', flexShrink: 0,
              opacity: loading ? 0.5 : 1,
            }}>{s.icon} {s.text}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 18px', borderTop: '1px solid #E2E8F0',
          display: 'flex', gap: 10, alignItems: 'flex-end', background: '#F7FAFC', flexShrink: 0,
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Задайте вопрос... (Enter — отправить, Shift+Enter — перенос)"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: '1.5px solid #E2E8F0', fontSize: 13.5, resize: 'none',
              background: '#fff', maxHeight: 100, lineHeight: 1.5,
              boxSizing: 'border-box', outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: input.trim() && !loading ? 'linear-gradient(135deg,#4BAED4,#2D7A9A)' : '#E2E8F0',
              color: input.trim() && !loading ? '#fff' : '#A0AEC0',
              fontWeight: 700, fontSize: 13, flexShrink: 0, transition: 'all .2s',
            }}
          >{loading ? '⏳' : 'Отправить ↑'}</button>
        </div>
      </div>

      {/* ── Market Pulse panel ─────────────────────────────────────────────── */}
      {showMarket && <MarketPulsePanel />}
    </div>
  )
}
