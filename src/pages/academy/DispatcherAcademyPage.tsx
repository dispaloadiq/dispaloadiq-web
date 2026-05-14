import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Course {
  id: string
  title: string
  subtitle: string
  category: 'foundation' | 'rates' | 'compliance' | 'business' | 'advanced'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string   // e.g. "2h 15m"
  lessons: number
  instructor: string
  rating: number
  enrolled: number
  progress: number   // 0–100
  locked: boolean
  badge?: string
  tags: string[]
  icon: string
}

interface CertPath {
  id: string
  title: string
  icon: string
  color: string
  description: string
  courses: string[]  // course ids
  totalHours: string
  completed: boolean
  progress: number
}

interface Lesson {
  id: string
  title: string
  duration: string
  type: 'video' | 'quiz' | 'exercise' | 'download'
  completed: boolean
  locked: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Dispatcher Fundamentals',
    subtitle: 'Everything you need to start dispatching from day one',
    category: 'foundation',
    level: 'beginner',
    duration: '3h 40m',
    lessons: 14,
    instructor: 'Marcus Johnson',
    rating: 4.9,
    enrolled: 3842,
    progress: 78,
    locked: false,
    badge: '🏅 Most Popular',
    tags: ['RC', 'BOL', 'Load Board', 'Broker Calls'],
    icon: '🚛',
  },
  {
    id: 'c2',
    title: 'Rate Negotiation Mastery',
    subtitle: 'How to consistently get $0.30–0.50/mile above posted rate',
    category: 'rates',
    level: 'intermediate',
    duration: '2h 15m',
    lessons: 9,
    instructor: 'Sandra Kim',
    rating: 4.8,
    enrolled: 2109,
    progress: 40,
    locked: false,
    badge: '🔥 Hot',
    tags: ['DAT Rates', 'Negotiation Scripts', 'Market Intel'],
    icon: '💰',
  },
  {
    id: 'c3',
    title: 'Reading Rate Confirmations Like a Pro',
    subtitle: 'Spot red flags, protect your carriers from bad actors',
    category: 'foundation',
    level: 'beginner',
    duration: '1h 50m',
    lessons: 7,
    instructor: 'Marcus Johnson',
    rating: 4.7,
    enrolled: 1874,
    progress: 100,
    locked: false,
    tags: ['RC Analysis', 'Fraud Prevention', 'Carrier Protection'],
    icon: '📄',
  },
  {
    id: 'c4',
    title: 'HOS Rules & ELD Deep Dive',
    subtitle: 'Keep your drivers compliant, avoid costly violations',
    category: 'compliance',
    level: 'intermediate',
    duration: '2h 30m',
    lessons: 10,
    instructor: 'Robert Torres',
    rating: 4.6,
    enrolled: 1562,
    progress: 0,
    locked: false,
    tags: ['HOS', 'ELD', 'DOT', 'Driver Safety'],
    icon: '⏱️',
  },
  {
    id: 'c5',
    title: 'Building Your Dispatcher Business',
    subtitle: 'Contracts, pricing, acquiring your first 5 clients',
    category: 'business',
    level: 'intermediate',
    duration: '4h 10m',
    lessons: 16,
    instructor: 'Elena Vasquez',
    rating: 4.9,
    enrolled: 2341,
    progress: 15,
    locked: false,
    badge: '⭐ Editor\'s Pick',
    tags: ['Contracts', 'Pricing', 'Client Acquisition', 'LLC Setup'],
    icon: '🏢',
  },
  {
    id: 'c6',
    title: 'Advanced Load Board Strategies',
    subtitle: 'DAT, Truckstop, 123Loadboard — power user tactics',
    category: 'advanced',
    level: 'advanced',
    duration: '1h 55m',
    lessons: 8,
    instructor: 'Sandra Kim',
    rating: 4.7,
    enrolled: 987,
    progress: 0,
    locked: false,
    tags: ['DAT', 'Load Boards', 'Backhaul', 'Lane Analysis'],
    icon: '📊',
  },
  {
    id: 'c7',
    title: 'Broker Relationship Mastery',
    subtitle: 'Turn one-time loads into preferred carrier status',
    category: 'advanced',
    level: 'advanced',
    duration: '2h 05m',
    lessons: 8,
    instructor: 'Elena Vasquez',
    rating: 4.8,
    enrolled: 741,
    progress: 0,
    locked: true,
    tags: ['Broker Relations', 'Preferred Carrier', 'Long-term Contracts'],
    icon: '🤝',
  },
  {
    id: 'c8',
    title: 'Factoring & Cash Flow for Dispatchers',
    subtitle: 'Help your carriers get paid fast — and get paid yourself',
    category: 'business',
    level: 'intermediate',
    duration: '1h 35m',
    lessons: 6,
    instructor: 'Robert Torres',
    rating: 4.5,
    enrolled: 892,
    progress: 0,
    locked: true,
    tags: ['Factoring', 'Invoicing', 'Quick Pay', 'Cash Flow'],
    icon: '⚡',
  },
]

const CERT_PATHS: CertPath[] = [
  {
    id: 'cert-1',
    title: 'Certified Dispatcher',
    icon: '🏆',
    color: '#6366F1',
    description: 'The foundational credential. Proves you can handle RCs, broker calls, HOS, and carrier relations.',
    courses: ['c1', 'c3', 'c4'],
    totalHours: '8h',
    completed: false,
    progress: 59,
  },
  {
    id: 'cert-2',
    title: 'Rate Negotiation Pro',
    icon: '💎',
    color: '#10B981',
    description: 'Specialist certification. Proves you consistently secure above-market rates for your carriers.',
    courses: ['c1', 'c2', 'c6'],
    totalHours: '7h 50m',
    completed: false,
    progress: 39,
  },
  {
    id: 'cert-3',
    title: 'Dispatcher Business Owner',
    icon: '👑',
    color: '#F59E0B',
    description: 'The premium credential. Shows you can run a full dispatching business — not just find loads.',
    courses: ['c1', 'c2', 'c5', 'c7', 'c8'],
    totalHours: '14h',
    completed: false,
    progress: 22,
  },
]

const SAMPLE_LESSONS: Lesson[] = [
  { id: 'l1', title: 'What is a Dispatcher? (Industry Overview)', duration: '12:30', type: 'video', completed: true, locked: false },
  { id: 'l2', title: 'Your Daily Workflow: From Morning to Night', duration: '18:45', type: 'video', completed: true, locked: false },
  { id: 'l3', title: 'The 3 Load Boards You Must Know', duration: '22:10', type: 'video', completed: true, locked: false },
  { id: 'l4', title: 'Making Your First Broker Call (Live Demo)', duration: '31:00', type: 'video', completed: true, locked: false },
  { id: 'l5', title: 'Reading a Rate Confirmation — Line by Line', duration: '25:20', type: 'video', completed: false, locked: false },
  { id: 'l6', title: 'Quiz: RC Red Flags', duration: '10 questions', type: 'quiz', completed: false, locked: false },
  { id: 'l7', title: 'Handling TONU & Detention', duration: '19:55', type: 'video', completed: false, locked: false },
  { id: 'l8', title: 'Template: Carrier Agreement', duration: 'Download', type: 'download', completed: false, locked: false },
  { id: 'l9', title: 'Carrier Vetting — Insurance & Authority Check', duration: '16:40', type: 'video', completed: false, locked: true },
  { id: 'l10', title: 'Practice: Build Your Load Tracking Sheet', duration: '~45 min', type: 'exercise', completed: false, locked: true },
]

const CAT_COLORS: Record<Course['category'], string> = {
  foundation: '#6366F1',
  rates:       '#10B981',
  compliance:  '#F59E0B',
  business:    '#8B5CF6',
  advanced:    '#EF4444',
}
const CAT_LABELS: Record<Course['category'], string> = {
  foundation: 'Foundation',
  rates:      'Rate Mastery',
  compliance: 'Compliance',
  business:   'Business',
  advanced:   'Advanced',
}
const LEVEL_COLORS: Record<Course['level'], string> = {
  beginner:     '#10B981',
  intermediate: '#F59E0B',
  advanced:     '#EF4444',
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: 12 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: '#718096', marginLeft: 4 }}>{rating}</span>
    </span>
  )
}

function ProgressBar({ value, color = '#6366F1', height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div style={{ background: '#EDF2F7', borderRadius: height, height, overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`, height: '100%', borderRadius: height,
        background: value === 100
          ? 'linear-gradient(90deg, #10B981, #059669)'
          : `linear-gradient(90deg, ${color}, ${color}cc)`,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

function CourseCard({ course, onOpen }: { course: Course; onOpen: (c: Course) => void }) {
  const catColor = CAT_COLORS[course.category]
  return (
    <div
      onClick={() => !course.locked && onOpen(course)}
      style={{
        background: '#fff',
        border: `1px solid ${course.locked ? '#E2E8F0' : '#E2E8F0'}`,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: course.locked ? 'not-allowed' : 'pointer',
        opacity: course.locked ? 0.6 : 1,
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!course.locked) {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
      }}
    >
      {/* Color bar top */}
      <div style={{ height: 4, background: catColor }} />

      <div style={{ padding: '16px 16px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontSize: 28 }}>{course.icon}</div>
          <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
            {course.badge && (
              <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 6, fontWeight: 600 }}>
                {course.badge}
              </span>
            )}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 6,
              background: `${LEVEL_COLORS[course.level]}20`,
              color: LEVEL_COLORS[course.level],
            }}>
              {course.level.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4, lineHeight: 1.3 }}>
          {course.title}
        </div>
        <div style={{ fontSize: 11, color: '#718096', marginBottom: 10, lineHeight: 1.4 }}>
          {course.subtitle}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {course.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              fontSize: 9, padding: '2px 5px', borderRadius: 4,
              background: `${catColor}15`, color: catColor, fontWeight: 600,
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#718096', marginBottom: 10 }}>
          <span>📹 {course.lessons} lessons</span>
          <span>⏱ {course.duration}</span>
          <span>👤 {(course.enrolled / 1000).toFixed(1)}K</span>
        </div>

        <Stars rating={course.rating} />

        {/* Progress */}
        {course.progress > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#718096', marginBottom: 4 }}>
              <span>Progress</span>
              <span style={{ fontWeight: 600, color: course.progress === 100 ? '#10B981' : '#6366F1' }}>
                {course.progress === 100 ? '✓ Complete' : `${course.progress}%`}
              </span>
            </div>
            <ProgressBar value={course.progress} color={catColor} />
          </div>
        )}

        {/* Action */}
        <div style={{ marginTop: 12 }}>
          {course.locked ? (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#A0AEC0' }}>🔒 Complete prerequisites first</div>
          ) : course.progress === 100 ? (
            <button className="btn btn-sm" style={{ width: '100%', background: '#F0FDF4', color: '#10B981', border: '1px solid #10B981', fontWeight: 600 }}>
              ✓ Review Course
            </button>
          ) : course.progress > 0 ? (
            <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Continue →
            </button>
          ) : (
            <button className="btn btn-sm" style={{ width: '100%', background: '#EEF2FF', color: '#6366F1', border: '1px solid #C7D2FE', fontWeight: 600 }}>
              Start Course
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CertCard({ cert }: { cert: CertPath }) {
  const courses = COURSES.filter(c => cert.courses.includes(c.id))
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${cert.color}30`,
      borderRadius: 14,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: `${cert.color}10`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: `${cert.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          {cert.icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#1A202C' }}>{cert.title}</div>
          <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{cert.totalHours} · {cert.courses.length} courses</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 14, lineHeight: 1.5 }}>
        {cert.description}
      </div>

      {/* Course list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {courses.map(c => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              background: c.progress === 100 ? '#10B981' : c.progress > 0 ? '#6366F1' : '#E2E8F0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: c.progress >= 0 ? '#fff' : '#A0AEC0', fontSize: 10,
            }}>
              {c.progress === 100 ? '✓' : c.progress > 0 ? '▶' : '·'}
            </span>
            <span style={{ color: '#4A5568' }}>{c.title}</span>
            {c.progress === 100 && <span style={{ fontSize: 10, color: '#10B981', marginLeft: 'auto' }}>Done</span>}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
          <span style={{ color: '#718096' }}>Path progress</span>
          <span style={{ fontWeight: 700, color: cert.color }}>{cert.progress}%</span>
        </div>
        <ProgressBar value={cert.progress} color={cert.color} height={8} />
      </div>

      <button className="btn btn-primary btn-sm" style={{
        width: '100%',
        background: `linear-gradient(135deg, ${cert.color}, ${cert.color}cc)`,
        border: 'none',
      }}>
        Continue Path →
      </button>
    </div>
  )
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  const typeIcon = { video: '▶️', quiz: '📝', exercise: '💪', download: '📥' }[lesson.type]
  const typeColor = { video: '#6366F1', quiz: '#F59E0B', exercise: '#10B981', download: '#8B5CF6' }[lesson.type]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid #F7FAFC',
      opacity: lesson.locked ? 0.5 : 1,
      cursor: lesson.locked ? 'not-allowed' : 'pointer',
      borderRadius: 8,
      background: lesson.completed ? '#F0FDF4' : '#fff',
    }}
    onMouseEnter={e => { if (!lesson.locked) (e.currentTarget as HTMLDivElement).style.background = lesson.completed ? '#DCFCE7' : '#F7FAFC' }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = lesson.completed ? '#F0FDF4' : '#fff' }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: lesson.completed ? '#10B981' : lesson.locked ? '#E2E8F0' : `${typeColor}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}>
        {lesson.locked ? '🔒' : lesson.completed ? '✓' : typeIcon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: lesson.completed ? 500 : 600, color: lesson.completed ? '#718096' : '#2D3748' }}>
          {lesson.title}
        </div>
        <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>
          <span style={{ color: typeColor, fontWeight: 600 }}>{lesson.type.toUpperCase()}</span>
          {' · '}{lesson.duration}
        </div>
      </div>
      {lesson.completed && <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>✓ Done</span>}
      {!lesson.completed && !lesson.locked && (
        <button className="btn btn-sm" style={{ background: `${typeColor}15`, color: typeColor, border: 'none', fontSize: 11 }}>
          {lesson.type === 'download' ? 'Download' : 'Start'}
        </button>
      )}
    </div>
  )
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
const LEADERBOARD = [
  { rank: 1, name: 'Maria S.',  flag: '🇺🇦', pts: 2840, badge: '👑 Elite',       avatar: 'MS' },
  { rank: 2, name: 'Alex P.',   flag: '🇺🇦', pts: 2610, badge: '🏆 Top Rated',   avatar: 'AP' },
  { rank: 3, name: 'Sandra K.', flag: '🇺🇸', pts: 2290, badge: '🏆 Top Rated',   avatar: 'SK' },
  { rank: 4, name: 'You',       flag: '🌍', pts: 1840, badge: '⭐ Certified',    avatar: 'YO', isMe: true },
  { rank: 5, name: 'Dima V.',   flag: '🇺🇿', pts: 1720, badge: '✅ Verified',    avatar: 'DV' },
]

// ── Main Component ────────────────────────────────────────────────────────────
type Tab = 'overview' | 'courses' | 'paths' | 'leaderboard'
type CatFilter = 'all' | Course['category']

export default function DispatcherAcademyPage() {
  const [tab, setTab]             = useState<Tab>('overview')
  const [catFilter, setCatFilter] = useState<CatFilter>('all')
  const [openCourse, setOpenCourse] = useState<Course | null>(null)
  const [toast, setToast]           = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Stats
  const totalCompleted = COURSES.filter(c => c.progress === 100).length
  const totalInProgress = COURSES.filter(c => c.progress > 0 && c.progress < 100).length
  const totalHoursLearned = 6 // mock
  const certProgress = Math.round(CERT_PATHS[0].progress)

  const filteredCourses = catFilter === 'all'
    ? COURSES
    : COURSES.filter(c => c.category === catFilter)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0 60px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: '#1A202C', color: '#fff', padding: '10px 18px',
          borderRadius: 10, fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        borderRadius: 16,
        padding: '32px 32px 0',
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 120, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
          <div style={{ maxWidth: 560, paddingBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>🎓</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: 1 }}>DISPATCHER ACADEMY</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
              Become a<br />
              <span style={{ color: '#A5B4FC' }}>DispaLoadIQ Certified</span><br />
              Dispatcher
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
              The only dispatcher certification that brokers and owner-ops actually recognize.
              Learn from real dispatchers who book $50K+ loads monthly.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ background: '#A5B4FC', color: '#1E1B4B', fontWeight: 700, border: 'none' }}
                onClick={() => { setTab('paths'); showToast('🎓 Starting certification path!') }}>
                Start Certification Path
              </button>
              <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => setTab('courses')}>
                Browse Courses
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 28 }}>
            {[
              { label: 'Courses', value: '8', sub: '+ new monthly' },
              { label: 'Certified', value: '1,247', sub: 'dispatchers' },
              { label: 'Avg Rating', value: '4.8★', sub: 'from students' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 10,
                padding: '10px 18px', textAlign: 'center', minWidth: 110,
              }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My progress bar */}
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '14px 20px',
          margin: '0 -32px',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>YOUR PROGRESS</span>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${certProgress}%`, height: '100%', background: 'linear-gradient(90deg, #A5B4FC, #818CF8)', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: '#A5B4FC', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {certProgress}% to Certified Dispatcher
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F7FAFC', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {([
          { id: 'overview',     label: '🏠 Overview' },
          { id: 'courses',      label: '📚 All Courses' },
          { id: 'paths',        label: '🏆 Cert Paths' },
          { id: 'leaderboard',  label: '🥇 Leaderboard' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? '#1A202C' : '#718096',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div>
          {/* My stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { icon: '✅', label: 'Completed', value: `${totalCompleted} courses`, color: '#10B981' },
              { icon: '▶️', label: 'In Progress', value: `${totalInProgress} courses`, color: '#6366F1' },
              { icon: '⏱️', label: 'Hours Learned', value: `${totalHoursLearned}h 20m`, color: '#F59E0B' },
              { icon: '🏅', label: 'Trust Points', value: '+43 pts earned', color: '#8B5CF6' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '16px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Continue section */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Continue Where You Left Off</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {COURSES.filter(c => c.progress > 0 && c.progress < 100).map(c => (
                <div key={c.id} className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>{c.title}</div>
                    <ProgressBar value={c.progress} color={CAT_COLORS[c.category]} height={6} />
                    <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{c.progress}% complete · {c.duration} total</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => showToast(`▶️ Resuming ${c.title}`)}>
                    Resume →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Course preview — opened course OR first featured */}
          <div className="section-title" style={{ marginBottom: 14 }}>
            {openCourse ? `📖 ${openCourse.title}` : '📖 Dispatcher Fundamentals — Course Preview'}
          </div>
          <div className="card" style={{ marginBottom: 28, overflow: 'hidden' }}>
            {/* Fake video player */}
            <div style={{
              background: 'linear-gradient(135deg, #1A202C, #2D3748)',
              height: 180,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 10, cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => showToast('▶️ Video player coming soon — streaming integration in progress')}>
              <div style={{ fontSize: 52 }}>{openCourse?.icon || '🚛'}</div>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'absolute',
              }}>
                <div style={{ fontSize: 20, color: '#fff', marginLeft: 4 }}>▶</div>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 4 }}>
                Lesson 5 of {openCourse?.lessons || 14}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div className="section-title" style={{ marginBottom: 10, fontSize: 13 }}>Course Curriculum</div>
              {SAMPLE_LESSONS.map(l => <LessonRow key={l.id} lesson={l} />)}
            </div>
          </div>

          {/* Recommended next */}
          <div className="section-title" style={{ marginBottom: 14 }}>Recommended Next</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {COURSES.filter(c => c.progress === 0 && !c.locked).slice(0, 3).map(c => (
              <CourseCard key={c.id} course={c} onOpen={c2 => { setOpenCourse(c2); setTab('overview') }} />
            ))}
          </div>
        </div>
      )}

      {/* ── All Courses Tab ── */}
      {tab === 'courses' && (
        <div>
          {/* Filter row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {(['all', 'foundation', 'rates', 'compliance', 'business', 'advanced'] as CatFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setCatFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: catFilter === f ? 700 : 500,
                  background: catFilter === f
                    ? (f === 'all' ? '#1A202C' : CAT_COLORS[f as Course['category']])
                    : '#EDF2F7',
                  color: catFilter === f ? '#fff' : '#718096',
                  transition: 'all 0.15s',
                }}>
                {f === 'all' ? 'All Courses' : CAT_LABELS[f as Course['category']]}
                {f !== 'all' && (
                  <span style={{ marginLeft: 5, opacity: 0.7 }}>
                    ({COURSES.filter(c => c.category === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filteredCourses.map(c => (
              <CourseCard key={c.id} course={c} onOpen={c2 => { setOpenCourse(c2); setTab('overview') }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Cert Paths Tab ── */}
      {tab === 'paths' && (
        <div>
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400E' }}>
            🏆 <strong>DispaLoadIQ Certified</strong> badge appears on your marketplace profile — owner-ops can see it when browsing dispatchers. <strong>Certified dispatchers earn 40% more per client on average.</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {CERT_PATHS.map(cert => <CertCard key={cert.id} cert={cert} />)}
          </div>

          {/* What you get */}
          <div className="section-title" style={{ marginBottom: 14 }}>What Certification Gets You</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {[
              { icon: '🛡️', title: 'Verified Profile Badge', desc: 'Gold "DispaLoadIQ Certified" badge shows on your marketplace profile. Instant trust signal to owner-ops.' },
              { icon: '📈', title: 'Trust Score Boost', desc: '+25 Trust Points added to your profile. Moves you from Verified to Certified tier automatically.' },
              { icon: '🎯', title: 'Priority in Job Feed', desc: 'Certified dispatchers appear higher in owner-op search results. More visibility = more opportunities.' },
              { icon: '💼', title: 'Downloadable Certificate', desc: 'PDF certificate you can share with clients, post on LinkedIn, or include in your dispatcher proposal.' },
              { icon: '🌐', title: 'Global Recognition', desc: 'Works whether you\'re in Ukraine, Uzbekistan, India, or the US. No MC# or US address required.' },
              { icon: '🤝', title: 'Broker Trust Network', desc: 'Access to our verified broker contact list — 200+ brokers who accept DispaLoadIQ Certified dispatchers.' },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14 }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A202C', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Leaderboard Tab ── */}
      {tab === 'leaderboard' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Leaderboard */}
            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>🥇 Top Dispatchers This Month</div>
              <div className="card" style={{ overflow: 'hidden' }}>
                {LEADERBOARD.map((entry, i) => (
                  <div
                    key={entry.rank}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px',
                      borderBottom: i < LEADERBOARD.length - 1 ? '1px solid #F7FAFC' : 'none',
                      background: (entry as any).isMe ? '#EEF2FF' : '#fff',
                    }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : i === 2 ? '#FEE2E2' : '#F7FAFC',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: i === 0 ? '#D97706' : i === 1 ? '#6B7280' : i === 2 ? '#DC2626' : '#A0AEC0',
                    }}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : entry.rank}
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: (entry as any).isMe ? '#6366F1' : '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      color: (entry as any).isMe ? '#fff' : '#718096',
                    }}>
                      {entry.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: (entry as any).isMe ? 800 : 600, color: '#1A202C' }}>
                        {entry.flag} {entry.name} {(entry as any).isMe && '(You)'}
                      </div>
                      <div style={{ fontSize: 11, color: '#718096' }}>{entry.badge}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#6366F1' }}>{entry.pts.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#A0AEC0' }}>trust pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How points work */}
            <div>
              <div className="section-title" style={{ marginBottom: 14 }}>📊 How Trust Points Work</div>
              <div className="card" style={{ padding: 18 }}>
                {[
                  { action: 'Complete a course', pts: '+5–15 pts', icon: '📚' },
                  { action: 'Pass Skills Test (Expert)', pts: '+25 pts', icon: '🧠' },
                  { action: 'Pass Skills Test (Certified)', pts: '+18 pts', icon: '📋' },
                  { action: 'Get verified identity', pts: '+25 pts', icon: '🪪' },
                  { action: 'English test — Grade A', pts: '+20 pts', icon: '🗣️' },
                  { action: 'Upload portfolio RCs', pts: '+15 pts', icon: '📁' },
                  { action: 'Client leaves 5★ review', pts: '+10 pts', icon: '⭐' },
                  { action: 'Complete first dispatch', pts: '+20 pts', icon: '🚛' },
                  { action: 'Earn certification', pts: '+50 pts', icon: '🏆' },
                ].map(item => (
                  <div key={item.action} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid #F7FAFC',
                  }}>
                    <div style={{ fontSize: 13, color: '#4A5568' }}>{item.icon} {item.action}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6366F1' }}>{item.pts}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: 14, padding: 18, background: 'linear-gradient(135deg, #1E1B4B, #312E81)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#A5B4FC', marginBottom: 8 }}>🌍 Global, Borderless</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  Dispatchers from Ukraine, Uzbekistan, India — your Trust Points are the same as US-based dispatchers. The certification is based on skill, not location.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
