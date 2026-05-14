import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Question {
  id: number
  category: 'rc' | 'rate' | 'hos' | 'broker'
  question: string
  context?: string
  options: string[]
  correct: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const CAT_META = {
  rc:     { label: 'RC/BOL Analysis',    icon: '📄', color: '#1d4ed8', bg: '#eff6ff' },
  rate:   { label: 'Rate & RPM Math',    icon: '💰', color: '#15803d', bg: '#f0fdf4' },
  hos:    { label: 'HOS Rules',          icon: '⏰', color: '#9a3412', bg: '#fff7ed' },
  broker: { label: 'Broker Negotiation', icon: '📞', color: '#5b21b6', bg: '#f5f3ff' },
}

// ── Question Bank (30 questions) ──────────────────────────────────────────────
const QUESTIONS: Question[] = [
  // ── RC / BOL ──────────────────────────────────────────────────────────────
  {
    id: 1, category: 'rc', difficulty: 'easy',
    question: 'A Rate Confirmation shows "Net 30" payment terms. What does this mean?',
    options: [
      'Payment is due within 30 minutes of delivery',
      'Payment is due 30 days after the invoice is received',
      'The broker pays 30% upfront and 70% on delivery',
      'The load must be delivered within 30 hours',
    ],
    correct: 1,
    explanation: 'Net 30 means payment is due 30 days after the invoice date. Always check payment terms — some brokers are Net 45 or even Net 60.',
  },
  {
    id: 2, category: 'rc', difficulty: 'medium',
    question: 'You receive an RC with these terms: "TONU $150 / Layover $250/day / Detention $50/hr after 2hrs free." A driver arrives on time but is detained 4 hours at shipper. What do you invoice for detention?',
    options: ['$100 (2 hrs × $50)', '$150 (3 hrs × $50)', '$200 (4 hrs × $50)', '$0 — detention only applies at delivery'],
    correct: 0,
    explanation: 'First 2 hours are free. Hours 3 and 4 are billable: 2 hrs × $50 = $100. Always document detention start/end times with timestamps.',
  },
  {
    id: 3, category: 'rc', difficulty: 'hard',
    question: 'An RC says "Carrier to provide cargo insurance $100,000." Your owner-op only has $50,000 cargo coverage. What should you do?',
    options: [
      'Book the load — brokers rarely check insurance amounts',
      'Book the load and hope nothing goes wrong',
      'Do NOT book the load — notify the broker and decline',
      'Book the load and inform the shipper directly',
    ],
    correct: 2,
    explanation: 'Never book a load if carrier coverage is below RC requirements. If cargo is damaged, the carrier is liable and insurance won\'t cover the full amount. Always verify COI before confirming.',
  },
  {
    id: 4, category: 'rc', difficulty: 'easy',
    question: 'What does "FSC" stand for on a Rate Confirmation?',
    options: [
      'Freight Service Charge — standard processing fee',
      'Fuel Surcharge — additional fee tied to fuel prices',
      'Final Settlement Cost — total amount owed',
      'Federal Shipping Code — regulatory identifier',
    ],
    correct: 1,
    explanation: 'FSC = Fuel Surcharge. Some RCs include it in the all-in rate; others list it separately. Always clarify whether the rate is "all-in" or if FSC is added on top.',
  },
  {
    id: 5, category: 'rc', difficulty: 'medium',
    question: 'An RC says "Carrier responsible for lumper fees at destination." The driver arrives and lumper service costs $180. Who pays?',
    context: 'The broker did not mention lumper in the original negotiation call.',
    options: [
      'The broker — they booked the load so it\'s their responsibility',
      'The shipper — they arranged the facility',
      'The carrier (owner-op) — it\'s in the RC they signed',
      'Split 50/50 between carrier and broker',
    ],
    correct: 2,
    explanation: 'If the RC states carrier responsibility for lumper, the carrier pays — regardless of what was said verbally. Always read the RC carefully BEFORE the driver heads to the facility. You can try to negotiate lumper reimbursement before accepting the load.',
  },
  {
    id: 6, category: 'rc', difficulty: 'hard',
    question: 'You see an RC from a broker with MC# 987654. You check DAT and the broker has a credit score of 58/100 with 12 days average to pay. What do you do?',
    options: [
      'Book immediately — the rate is great',
      'Ask for quick pay or factoring company, verify carrier packet is complete, then decide',
      'Book the load but double the detention rate',
      'Decline automatically — any score below 60 is a scam',
    ],
    correct: 1,
    explanation: 'Low credit score + slow payment = risk. Mitigation: use factoring for quick pay, ensure carrier packet is signed before loading, and document everything. 58/100 isn\'t an auto-decline but needs protection.',
  },
  {
    id: 7, category: 'rc', difficulty: 'medium',
    question: 'What is "double brokering" and why is it a major red flag?',
    options: [
      'When a broker books two loads at the same time — totally normal practice',
      'When a carrier hauls two separate loads on the same trailer',
      'When a broker re-brokers your load to another broker without the carrier\'s knowledge — illegal and creates fraud risk',
      'When a dispatcher represents two different carriers simultaneously',
    ],
    correct: 2,
    explanation: 'Double brokering is illegal (FMCSA rules) and extremely common in fraud schemes. The original carrier often doesn\'t get paid. Red flags: broker asks for your MC# to "add to their system," unusually high rates, requests to re-sign a different RC.',
  },
  {
    id: 8, category: 'rc', difficulty: 'easy',
    question: 'A shipper calls saying the truck is 2 hours late. The RC requires "carrier to notify broker of any delays." Who should make that call?',
    options: [
      'The driver — it\'s their truck',
      'The dispatcher — immediately contact the broker with ETA update',
      'Wait until arrival — small delays don\'t need reporting',
      'The owner-op — they own the business',
    ],
    correct: 1,
    explanation: 'The dispatcher is responsible for broker communication. Proactive updates prevent claim filings and protect the carrier\'s relationship with the broker. Call before the broker calls you.',
  },

  // ── RATE / RPM ────────────────────────────────────────────────────────────
  {
    id: 9, category: 'rate', difficulty: 'easy',
    question: 'A load pays $2,400 for 850 loaded miles. What is the RPM (rate per mile)?',
    options: ['$2.59', '$2.76', '$2.82', '$3.10'],
    correct: 2,
    explanation: '$2,400 ÷ 850 miles = $2.82 RPM. Always calculate RPM to compare loads fairly, regardless of total payout.',
  },
  {
    id: 10, category: 'rate', difficulty: 'medium',
    question: 'Load A: $1,800 for 600 miles. Load B: $2,400 for 900 miles. Deadhead to Load A is 0 miles. Deadhead to Load B is 150 miles. Which is more profitable?',
    options: [
      'Load A — higher RPM on loaded miles',
      'Load B — higher total payout',
      'Load A — $3.00 RPM all-in vs Load B $2.29 RPM all-in (including deadhead)',
      'They are equal',
    ],
    correct: 2,
    explanation: 'Load A: $1,800 ÷ (600+0) = $3.00 total RPM. Load B: $2,400 ÷ (900+150) = $2.29 total RPM. Always calculate RPM on TOTAL miles including deadhead, not just loaded miles.',
  },
  {
    id: 11, category: 'rate', difficulty: 'medium',
    question: 'Your owner-op charges 8% commission. A load pays $3,200. Driver fuel cost for this load is approximately $480. What is the net to the owner-op after your commission?',
    options: ['$2,464', '$2,656', '$2,720', '$2,944'],
    correct: 0,
    explanation: 'Commission: $3,200 × 8% = $256. After commission: $3,200 - $256 = $2,944. After fuel: $2,944 - $480 = $2,464. Always help your client understand net earnings, not just gross rate.',
  },
  {
    id: 12, category: 'rate', difficulty: 'hard',
    question: 'DAT shows the Dallas→Miami lane averages $2.45 RPM. A broker offers $1,900 for 1,240 miles ($1.53 RPM). What is your negotiation target?',
    options: [
      '$2,000 — small bump, likely to be accepted',
      '$2,800–$3,000 — market rate or slightly above, firm negotiation',
      '$3,500 — always ask for maximum',
      'Accept $1,900 — the load board data might be wrong',
    ],
    correct: 1,
    explanation: 'Market rate: 1,240 mi × $2.45 = $3,038. Target $2,800–$3,000 and be willing to walk at $2,400. Never accept 60% of market rate without pushback. Use specific data: "DAT shows this lane averaging $2.45 — I need at least $2.80."',
  },
  {
    id: 13, category: 'rate', difficulty: 'easy',
    question: 'A driver runs 11,000 miles per month. Truck costs (fuel, insurance, truck payment, maintenance) total $8,500/month. What is the Cost Per Mile (CPM)?',
    options: ['$0.63', '$0.77', '$0.85', '$0.92'],
    correct: 1,
    explanation: '$8,500 ÷ 11,000 miles = $0.77 CPM. Knowing your owner-op\'s CPM is critical — you need to ensure every load covers costs AND generates profit.',
  },
  {
    id: 14, category: 'rate', difficulty: 'medium',
    question: 'A load pays $2.10 RPM for 800 miles. The driver\'s CPM (all costs) is $1.65. What is the profit margin per mile on this load?',
    options: ['$0.35/mile — thin but acceptable', '$0.45/mile — solid margin', '$0.65/mile — very strong', '$0.55/mile'],
    correct: 1,
    explanation: '$2.10 - $1.65 = $0.45 profit per mile. $0.45 × 800 miles = $360 profit on this load. Whether this is "good" depends on alternatives and deadhead cost to reach the next load.',
  },
  {
    id: 15, category: 'rate', difficulty: 'hard',
    question: 'A driver is empty in Atlanta. Option A: $1,600 load to Chicago (740 mi), then position for $3,000 Chicago→LA load next day. Option B: $2,800 load directly Atlanta→Phoenix (1,600 mi). What is the better choice over 48 hours?',
    options: [
      'Option A ($4,600 total, 2 loads, 2 days)',
      'Option B ($2,800 total, 1 load, direct)',
      'Depends on deadhead and timing — you need more info',
      'They\'re equal',
    ],
    correct: 0,
    explanation: 'Option A gross: $1,600 + $3,000 = $4,600. Option B: $2,800. However, you must check: deadhead from Chicago to pick up the LA load, and timing (can driver make the LA load on time after Chicago delivery?). Option A wins IF the Chicago→LA load is confirmed and timing works.',
  },

  // ── HOS ──────────────────────────────────────────────────────────────────
  {
    id: 16, category: 'hos', difficulty: 'easy',
    question: 'Under FMCSA HOS rules, how many hours can a property-carrying CMV driver drive in a single day (11-hour rule)?',
    options: ['8 hours maximum', '10 hours maximum', '11 hours after 10 hours off', '12 hours in a 14-hour window'],
    correct: 2,
    explanation: 'CDL drivers can drive up to 11 hours after coming off 10 consecutive hours off duty. This is the 11-hour driving limit rule.',
  },
  {
    id: 17, category: 'hos', difficulty: 'medium',
    question: 'A driver started their day at 6:00 AM. It\'s now 4:00 PM and they\'ve driven 9 hours. The delivery appointment is at 10:00 PM, 180 miles away (3 hours driving). Can they make it legally?',
    options: [
      'Yes — they have 2 hours of driving left and the 14-hour window extends to 8:00 PM',
      'No — they only have 2 hours driving left but the 14-hour clock runs out at 8:00 PM (before 10 PM delivery)',
      'Yes — they can use the sleeper berth to extend the window',
      'No — after 10 hours driving they must stop regardless',
    ],
    correct: 1,
    explanation: '14-hour window started at 6 AM, ends at 8 PM. They have 2 hours driving left. But delivery is at 10 PM = 4 hours away from now. They cannot legally make it — the 14-hour clock runs out at 8 PM. Need to alert the broker/shipper immediately and renegotiate appointment.',
  },
  {
    id: 18, category: 'hos', difficulty: 'easy',
    question: 'What is the 30-minute break rule for CDL drivers?',
    options: [
      'Drivers must take a 30-minute break after every 4 hours of driving',
      'Drivers must take a 30-minute break after 8 cumulative hours of driving since the last off-duty or sleeper berth period',
      'Drivers must stop for 30 minutes at every state border crossing',
      'There is no mandatory break rule for property-carrying drivers',
    ],
    correct: 1,
    explanation: 'Per FMCSA, drivers must take a 30-minute non-driving break after 8 hours of driving. This applies to drivers not using the short-haul exemption.',
  },
  {
    id: 19, category: 'hos', difficulty: 'medium',
    question: 'A driver is on a 70-hour/8-day rule. They\'ve used 68 hours this week. A broker offers a load requiring 4 hours of driving. What should you do?',
    options: [
      'Book it — 68 + 4 = 72, only 2 over the limit, small violation',
      'Do not book it. The driver has only 2 hours left. Advise them to take a 34-hour reset.',
      'Book it and split the load over two days',
      'Book it — HOS rules only apply if you get pulled over',
    ],
    correct: 1,
    explanation: 'The 70-hour limit is absolute. At 68 hours, the driver has 2 hours remaining — not enough for this load. Never advise violating HOS. A DOT violation costs the driver their CDL and could cost you clients. Recommend a 34-hour restart to reset the 70-hour clock.',
  },
  {
    id: 20, category: 'hos', difficulty: 'hard',
    question: 'A driver claims they can use the short-haul exemption (150 air-mile radius) and skip ELD logging. You are dispatching them on a run from Dallas, TX to Austin, TX (190 miles). Is this correct?',
    options: [
      'Yes — both cities are in Texas so it qualifies as short-haul',
      'No — the short-haul exemption is 150 air miles radius from the home terminal. Dallas to Austin is approximately 182 air miles, which exceeds the limit.',
      'Yes — 190 road miles is within 150 air miles',
      'The ELD exemption applies regardless of distance for single-day operations',
    ],
    correct: 1,
    explanation: 'The short-haul exemption is based on air miles (straight line), not road miles. Dallas→Austin is ~182 air miles, exceeding the 150-mile limit. The driver must use their ELD for this run. Many dispatchers miss this distinction.',
  },
  {
    id: 21, category: 'hos', difficulty: 'medium',
    question: 'A driver texts you: "Broker says I need to deliver by 6 AM but I just hit my 11 hours. I\'ll just keep going." What do you do?',
    options: [
      'Tell them it\'s their choice — you\'re just the dispatcher',
      'Advise them to stop immediately. Notify the broker of the delay and renegotiate. Document everything.',
      'Tell them to go slowly and they probably won\'t be stopped',
      'Contact the broker and say the driver is "almost there"',
    ],
    correct: 1,
    explanation: 'A good dispatcher protects the driver and carrier from HOS violations. Stop the driver, contact the broker immediately, renegotiate the appointment. Driving beyond HOS limits risks the driver\'s CDL, enormous fines, and your client relationship. Always document your advice in writing.',
  },
  {
    id: 22, category: 'hos', difficulty: 'easy',
    question: 'What is the "sleeper berth provision" and when is it useful for a dispatcher to know about?',
    options: [
      'A rule allowing drivers to drive extra hours if they sleep in the truck',
      'A rule allowing drivers to split their required 10-hour rest period (minimum 8+2) using the sleeper berth, which can help extend a trip across multiple days',
      'A DOT regulation requiring all trucks to have sleeping quarters',
      'An exemption allowing drivers to skip the 30-minute break',
    ],
    correct: 1,
    explanation: 'The sleeper berth provision (8+2 or 7+3 split) lets drivers split their rest period. Useful when planning multi-day long-haul routes — you can schedule pickups and deliveries more flexibly. As a dispatcher, knowing this helps you optimize your driver\'s schedule legally.',
  },

  // ── BROKER NEGOTIATION ────────────────────────────────────────────────────
  {
    id: 23, category: 'broker', difficulty: 'easy',
    question: 'A broker says "That\'s the best I can do — $2,000 firm, take it or leave it." What is the best response?',
    options: [
      'Accept immediately — they said "firm"',
      '"I understand. Let me check with my driver and call you back in 5 minutes."',
      '"Fine. But I want double detention after 2 hours."',
      'Hang up and call back later pretending to be a different dispatcher',
    ],
    correct: 1,
    explanation: '"Take it or leave it" is a negotiation tactic, not a final offer. Stepping away creates urgency. Calling back 5 minutes later with a counter ($2,200) often works. Never accept the first "firm" offer without at least one counter.',
  },
  {
    id: 24, category: 'broker', difficulty: 'medium',
    question: 'You\'re negotiating a $2,400 offer on a lane that DAT shows averaging $2.85 RPM (1,100 miles = $3,135 market). What is the best opening line to a broker?',
    options: [
      '"My driver needs at least $3,500 for this run."',
      '"DAT is showing this lane at $2.85 average this week. I can do $3,100 all-in and get loaded today."',
      '"Can you do a little better? Maybe $2,500?"',
      '"That rate is terrible. Goodbye."',
    ],
    correct: 1,
    explanation: 'Use data, be specific, create urgency with "loaded today." Asking for "a little better" signals you don\'t know your numbers. Going to $3,500 with no data sounds made up. $3,100 with market data justification = professional negotiation.',
  },
  {
    id: 25, category: 'broker', difficulty: 'medium',
    question: 'A broker you\'ve never worked with asks you to send a "carrier packet" before they\'ll book the load. The packet should include:',
    options: [
      'MC#, DOT#, Certificate of Insurance, W-9, and signed carrier agreement',
      'Just the driver\'s CDL number',
      'MC# and a phone number',
      'Carrier packets are not required — this is a scam attempt',
    ],
    correct: 0,
    explanation: 'Carrier packets are standard and required. They include MC#, DOT#, COI (naming the broker as certificate holder), W-9, and the broker\'s carrier agreement. Always have these documents ready as a dispatcher. Missing paperwork = missed loads.',
  },
  {
    id: 26, category: 'broker', difficulty: 'hard',
    question: 'During a negotiation call, the broker says "I\'ll need your driver\'s cell phone number directly so I can coordinate." What do you do?',
    options: [
      'Give it — the broker needs to communicate with the driver',
      'Politely decline. You are the communication point. All updates go through you.',
      'Give a fake number',
      'Give the number but tell the driver not to answer',
    ],
    correct: 1,
    explanation: 'Never give the driver\'s direct number to a broker. When brokers bypass the dispatcher, they can book loads directly at lower rates, cutting you out. You are the professional communication layer. Say: "All communication goes through me. I\'ll relay any updates immediately."',
  },
  {
    id: 27, category: 'broker', difficulty: 'hard',
    question: 'A broker offers an unusually high rate ($4.50 RPM) for a load, but their MC# lookup shows only 3 months in business and no credit rating. Red flags include:',
    options: [
      'No red flags — high rate is always good',
      'New broker + no credit rating + high rate = possible double-brokering or payment fraud. Verify thoroughly before accepting.',
      'New brokers always pay more to attract carriers',
      'Check the rate and if it looks real, book it',
    ],
    correct: 1,
    explanation: 'High rates from unknown brokers = red flag. This is a classic double-brokering or non-payment scam. Actions: (1) Verify MC# on FMCSA, (2) check broker reviews on DAT/Truckstop, (3) require COD or factor the invoice, (4) never load until carrier agreement is signed.',
  },
  {
    id: 28, category: 'broker', difficulty: 'medium',
    question: 'Your driver is stuck in traffic and will miss the delivery appointment by 2 hours. When do you call the broker?',
    options: [
      'After the driver misses the appointment — no point calling early',
      'Immediately when you know the driver will be late — before the appointment time',
      'Only if the broker calls you first',
      'Wait until the driver arrives and see if the receiver complains',
    ],
    correct: 1,
    explanation: 'Proactive communication is the mark of a professional dispatcher. Call the broker the MOMENT you know there\'s a delay. This gives them time to notify the receiver, adjust appointments, and demonstrates professionalism. Surprises damage relationships; early warnings preserve them.',
  },
  {
    id: 29, category: 'broker', difficulty: 'easy',
    question: 'What does "all-in rate" mean on a Rate Confirmation?',
    options: [
      'The rate includes all stops plus fuel surcharge — no additional charges will be paid by the broker',
      'The rate is negotiable and can include add-ons',
      'All drivers must be included in the load',
      'The rate covers all-inclusive insurance and liability',
    ],
    correct: 0,
    explanation: '"All-in" means the total rate covers everything — no additional FSC, no accessorials, no lumper reimbursements. When a rate is "all-in," negotiate to exclude detention and layover from the "all-in" restriction, since those are exception charges.',
  },
  {
    id: 30, category: 'broker', difficulty: 'hard',
    question: 'A broker sends an RC with different terms than what was agreed verbally on the phone — lower rate and different delivery address. What do you do?',
    options: [
      'Sign it — you already committed verbally',
      'Do NOT sign. Call the broker immediately, reference your call notes, and demand the RC match verbal agreement. If they refuse, decline the load.',
      'Sign and note the discrepancy internally',
      'Have the driver sign since it\'s their truck',
    ],
    correct: 1,
    explanation: 'The signed RC is the legally binding document — not the phone call. If you sign an RC with lower rates, you get the lower rate. Always compare the RC to your call notes before signing. "We agreed on $2,800 and Dallas delivery — this RC shows $2,400 and Fort Worth. Please correct and resend."',
  },
]

// ── Timer Component ────────────────────────────────────────────────────────────
function Timer({ seconds, totalSeconds }: { seconds: number; totalSeconds: number }) {
  const pct = (seconds / totalSeconds) * 100
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ background: '#f1f5f9', borderRadius: 30, height: 8, flex: 1, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 30, transition: 'width 1s, background .5s' }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color, minWidth: 44 }}>
        {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
      </div>
    </div>
  )
}

// ── Category Filter ───────────────────────────────────────────────────────────
type CatFilter = 'all' | 'rc' | 'rate' | 'hos' | 'broker'

// ── Main Test Page ─────────────────────────────────────────────────────────────
export default function DispatcherSkillsTestPage({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [phase, setPhase] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(30).fill(null))
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes
  const [catFilter, setCatFilter] = useState<CatFilter>('all')
  const [reviewMode, setReviewMode] = useState(false)

  const TOTAL_TIME = 30 * 60

  const startTest = useCallback(() => {
    setPhase('test')
    setCurrentQ(0)
    setAnswers(Array(30).fill(null))
    setSelected(null)
    setRevealed(false)
    setTimeLeft(TOTAL_TIME)
  }, [])

  useEffect(() => {
    if (phase !== 'test') return
    if (timeLeft <= 0) { setPhase('result'); return }
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase, timeLeft])

  const q = QUESTIONS[currentQ]
  const catMeta = CAT_META[q?.category]

  const submitAnswer = () => {
    if (selected === null) return
    const newAnswers = [...answers]
    newAnswers[currentQ] = selected
    setAnswers(newAnswers)
    setRevealed(true)
  }

  const next = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      setPhase('result')
    }
  }

  // ── INTRO ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{ padding: '32px 28px', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🏅</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>DispaLoadIQ Skills Assessment</div>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
          30 professional questions · 30 minute time limit<br/>
          Score <strong>60%+</strong> to earn the <strong>DispaLoadIQ Certified</strong> badge
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(CAT_META).map(([key, m]) => {
          const count = QUESTIONS.filter(q => q.category === key).length
          return (
            <div key={key} style={{ background: m.bg, border: `1.5px solid`, borderColor: m.color + '44', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{count} questions</div>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
        {[
          ['⏱️', 'Time limit: 30 minutes'],
          ['📝', '30 questions, 4 answer choices each'],
          ['🏅', 'Score 60%+ = Certified · 80%+ = Expert'],
          ['🔄', 'Re-take allowed after 7 days if needed'],
          ['💡', 'Read each question carefully — real dispatching scenarios'],
        ].map(([icon, text]) => (
          <div key={String(text)} style={{ display: 'flex', gap: 10, fontSize: 12, color: '#475569', marginBottom: 6 }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>

      <button onClick={startTest} className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 700 }}>
        Start Test → (30 min timer begins now)
      </button>
    </div>
  )

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correct = answers.filter((a, i) => a === QUESTIONS[i].correct).length
    const total = answers.filter(a => a !== null).length
    const pct = Math.round((correct / QUESTIONS.length) * 100)
    const level = pct >= 80 ? 'Expert' : pct >= 60 ? 'Certified' : 'Not Passed'
    const levelColor = pct >= 80 ? '#22c55e' : pct >= 60 ? '#1d4ed8' : '#ef4444'
    const trustPts = pct >= 80 ? 25 : pct >= 60 ? 18 : 5

    const catScores = (['rc','rate','hos','broker'] as const).map(cat => {
      const qs = QUESTIONS.filter(q => q.category === cat)
      const c = qs.filter(q => answers[q.id - 1] === q.correct).length
      return { cat, correct: c, total: qs.length, pct: Math.round((c / qs.length) * 100) }
    })

    const filtered = reviewMode
      ? QUESTIONS.filter(q => catFilter === 'all' || q.category === catFilter)
      : []

    return (
      <div style={{ padding: '28px', maxWidth: 640, margin: '0 auto' }}>
        {/* Score Hero */}
        <div style={{ textAlign: 'center', marginBottom: 24, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: levelColor, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>{correct}/{QUESTIONS.length} correct · {total} answered</div>
          <div style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 30,
            background: pct >= 60 ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${pct >= 60 ? '#86efac' : '#fca5a5'}`,
            fontSize: 14, fontWeight: 800, color: levelColor, marginBottom: 12,
          }}>
            {pct >= 80 ? '🏆 DispaLoadIQ Expert' : pct >= 60 ? '🏅 DispaLoadIQ Certified' : '❌ Not Passed — Retry in 7 days'}
          </div>
          <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
            +{trustPts} Trust Score points added to your profile
          </div>
        </div>

        {/* Category breakdown */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Category Breakdown</div>
          {catScores.map(cs => {
            const m = CAT_META[cs.cat]
            return (
              <div key={cs.cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 18, width: 24 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cs.pct >= 60 ? '#15803d' : '#ef4444' }}>{cs.correct}/{cs.total}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 20, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${cs.pct}%`, height: '100%', background: cs.pct >= 60 ? '#22c55e' : '#ef4444', borderRadius: 20 }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: cs.pct >= 60 ? '#15803d' : '#ef4444', width: 34, textAlign: 'right' }}>{cs.pct}%</div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={() => setReviewMode(!reviewMode)} className="btn" style={{ flex: 1, fontSize: 13 }}>
            {reviewMode ? '▲ Hide Review' : '📖 Review Answers'}
          </button>
          {pct >= 60 && onNavigate && (
            <button onClick={() => onNavigate('opportunities')} className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
              🎯 Find Clients →
            </button>
          )}
          {pct < 60 && (
            <button onClick={startTest} className="btn btn-primary" style={{ flex: 1, fontSize: 13 }}>
              🔄 Retry (available in 7d)
            </button>
          )}
        </div>

        {/* Review section */}
        {reviewMode && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['all','rc','rate','hos','broker'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setCatFilter(f)}
                  style={{
                    padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 20, cursor: 'pointer',
                    background: catFilter === f ? '#1d4ed8' : '#f1f5f9',
                    color: catFilter === f ? '#fff' : '#64748b',
                    border: '1.5px solid transparent',
                  }}
                >
                  {f === 'all' ? 'All' : CAT_META[f].icon + ' ' + CAT_META[f].label}
                </button>
              ))}
            </div>
            {filtered.map(q => {
              const userAns = answers[q.id - 1]
              const isCorrect = userAns === q.correct
              return (
                <div key={q.id} style={{
                  background: '#fff', border: `1.5px solid ${isCorrect ? '#86efac' : '#fca5a5'}`,
                  borderRadius: 12, padding: 16, marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{isCorrect ? '✅' : '❌'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: CAT_META[q.category].color, marginBottom: 4 }}>
                        Q{q.id} · {CAT_META[q.category].label} · {q.difficulty}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>{q.question}</div>
                      {q.context && <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', marginBottom: 8 }}>{q.context}</div>}
                      {q.options.map((opt, i) => (
                        <div key={i} style={{
                          fontSize: 12, padding: '6px 10px', borderRadius: 6, marginBottom: 4,
                          background: i === q.correct ? '#f0fdf4' : i === userAns && !isCorrect ? '#fef2f2' : '#f8fafc',
                          color: i === q.correct ? '#15803d' : i === userAns && !isCorrect ? '#991b1b' : '#475569',
                          fontWeight: i === q.correct || i === userAns ? 600 : 400,
                        }}>
                          {String.fromCharCode(65+i)}. {opt} {i === q.correct ? '✓' : i === userAns && !isCorrect ? '✗' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── TEST ──────────────────────────────────────────────────────────────────
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100

  return (
    <div style={{ padding: '20px 24px', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
          Question {currentQ + 1} of {QUESTIONS.length}
        </div>
        <div style={{ flex: 1, margin: '0 16px' }}>
          <Timer seconds={timeLeft} totalSeconds={TOTAL_TIME} />
        </div>
        <div style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: catMeta.bg, color: catMeta.color,
        }}>
          {catMeta.icon} {catMeta.label}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#f1f5f9', borderRadius: 20, height: 6, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#1d4ed8', borderRadius: 20, transition: 'width .3s' }} />
      </div>

      {/* Question card */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            background: q.difficulty === 'easy' ? '#f0fdf4' : q.difficulty === 'medium' ? '#fefce8' : '#fef2f2',
            color: q.difficulty === 'easy' ? '#15803d' : q.difficulty === 'medium' ? '#854d0e' : '#991b1b',
          }}>{q.difficulty.toUpperCase()}</span>
        </div>

        {q.context && (
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#475569', lineHeight: 1.5, fontStyle: 'italic' }}>
            📋 Context: {q.context}
          </div>
        )}

        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.6, marginBottom: 20 }}>
          {q.question}
        </div>

        {q.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = i === q.correct
          const isWrong = revealed && isSelected && !isCorrect

          let bg = '#f8fafc', border = '#e2e8f0', color = '#1e293b'
          if (!revealed && isSelected) { bg = '#eff6ff'; border = '#1d4ed8'; color = '#1d4ed8' }
          if (revealed && isCorrect) { bg = '#f0fdf4'; border = '#22c55e'; color = '#15803d' }
          if (isWrong) { bg = '#fef2f2'; border = '#ef4444'; color = '#991b1b' }

          return (
            <div
              key={i}
              onClick={() => { if (!revealed) setSelected(i) }}
              style={{
                padding: '12px 14px', border: `1.5px solid ${border}`, borderRadius: 10,
                marginBottom: 8, cursor: revealed ? 'default' : 'pointer',
                background: bg, color, fontWeight: isSelected || (revealed && isCorrect) ? 600 : 400,
                fontSize: 13, lineHeight: 1.5, transition: 'all .15s',
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65+i)}.</span>{opt}
              {revealed && isCorrect && <span style={{ marginLeft: 8 }}>✓</span>}
              {isWrong && <span style={{ marginLeft: 8 }}>✗</span>}
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{
          background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#15803d', lineHeight: 1.6,
        }}>
          💡 <strong>Explanation:</strong> {q.explanation}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!revealed ? (
          <button
            onClick={submitAnswer}
            disabled={selected === null}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 700, opacity: selected === null ? 0.5 : 1 }}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={next}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: 14, fontWeight: 700 }}
          >
            {currentQ < QUESTIONS.length - 1 ? 'Next Question →' : '📊 See My Results'}
          </button>
        )}
        {!revealed && (
          <button
            onClick={() => { const a = [...answers]; a[currentQ] = -1; setAnswers(a); next() }}
            className="btn"
            style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8' }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Mini progress dots */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 16, justifyContent: 'center' }}>
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === currentQ ? '#1d4ed8'
                : answers[i] === QUESTIONS[i].correct ? '#22c55e'
                : answers[i] !== null ? '#ef4444'
                : '#e2e8f0',
            }}
          />
        ))}
      </div>
    </div>
  )
}
