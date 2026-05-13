import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Load {
  id: string
  from: string; fromState: string
  to: string;   toState: string
  miles: number
  rate: number
  payout: number
  type: string
  weight: string
  pickup: string
  deliveryDate: string
  broker: string
  brokerRating: number
  brokerCredit: 'A+' | 'A' | 'B+' | 'B' | 'C'
  brokerPayDays: number
  aiScore: number
  dho: number
  status: 'Available' | 'Booked' | 'Hot'
  age: string
  ref: string
  commodity: string
  rateHistory: number[]   // last 5 weeks same lane avg $/mi
  notes?: string
  hazmat?: boolean
  teamRequired?: boolean
}

interface LaneRate {
  lane: string
  fromState: string
  toState: string
  avgRate: number
  weekChange: number
  volume: number
  trend: 'up' | 'down' | 'flat'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const LOADS: Load[] = [
  { id:'1',  from:'Chicago',     fromState:'IL', to:'Dallas',        toState:'TX', miles:850,  rate:2.18, payout:1854,  type:'Dry Van',  weight:'42,000 lbs', pickup:'May 14', deliveryDate:'May 15', broker:'Echo Global',       brokerRating:4.6, brokerCredit:'A+', brokerPayDays:28, aiScore:98, dho:12,  status:'Hot',       age:'4 min',  ref:'EG-920441', commodity:'General Freight',   rateHistory:[2.05,2.10,2.12,2.15,2.18] },
  { id:'2',  from:'Atlanta',     fromState:'GA', to:'Miami',         toState:'FL', miles:662,  rate:2.45, payout:1622,  type:'Reefer',   weight:'38,500 lbs', pickup:'May 14', deliveryDate:'May 15', broker:'Coyote Logistics',  brokerRating:4.8, brokerCredit:'A+', brokerPayDays:21, aiScore:94, dho:8,   status:'Available', age:'18 min', ref:'CL-773201', commodity:'Perishables',        rateHistory:[2.38,2.40,2.41,2.43,2.45] },
  { id:'3',  from:'Houston',     fromState:'TX', to:'Phoenix',       toState:'AZ', miles:1201, rate:2.32, payout:2786,  type:'Flatbed',  weight:'44,000 lbs', pickup:'May 15', deliveryDate:'May 17', broker:'TQL',               brokerRating:4.4, brokerCredit:'A',  brokerPayDays:35, aiScore:91, dho:35,  status:'Available', age:'32 min', ref:'TQ-554832', commodity:'Steel Coil',         rateHistory:[2.20,2.24,2.28,2.30,2.32] },
  { id:'4',  from:'Los Angeles', fromState:'CA', to:'Seattle',       toState:'WA', miles:1140, rate:2.71, payout:3090,  type:'Reefer',   weight:'40,000 lbs', pickup:'May 15', deliveryDate:'May 17', broker:'XPO Logistics',     brokerRating:4.7, brokerCredit:'A+', brokerPayDays:14, aiScore:89, dho:22,  status:'Available', age:'1 hr',   ref:'XP-211098', commodity:'Frozen Foods',        rateHistory:[2.60,2.63,2.66,2.68,2.71] },
  { id:'5',  from:'Nashville',   fromState:'TN', to:'Charlotte',     toState:'NC', miles:408,  rate:1.95, payout:796,   type:'Dry Van',  weight:'35,000 lbs', pickup:'May 15', deliveryDate:'May 15', broker:'Arrive Logistics',  brokerRating:4.5, brokerCredit:'A',  brokerPayDays:28, aiScore:82, dho:45,  status:'Available', age:'2 hrs',  ref:'AL-887723', commodity:'Auto Parts',          rateHistory:[1.88,1.90,1.91,1.93,1.95] },
  { id:'6',  from:'Denver',      fromState:'CO', to:'Salt Lake City',toState:'UT', miles:525,  rate:2.10, payout:1103,  type:'Dry Van',  weight:'39,000 lbs', pickup:'May 16', deliveryDate:'May 16', broker:'Worldwide Express', brokerRating:4.3, brokerCredit:'B+', brokerPayDays:42, aiScore:79, dho:60,  status:'Available', age:'3 hrs',  ref:'WE-334561', commodity:'Consumer Goods',      rateHistory:[2.05,2.06,2.07,2.09,2.10] },
  { id:'7',  from:'Miami',       fromState:'FL', to:'New York',      toState:'NY', miles:1281, rate:2.55, payout:3267,  type:'Hotshot',  weight:'9,800 lbs',  pickup:'May 14', deliveryDate:'May 16', broker:'CH Robinson',       brokerRating:4.9, brokerCredit:'A+', brokerPayDays:21, aiScore:96, dho:5,   status:'Hot',       age:'8 min',  ref:'CH-990012', commodity:'Medical Supplies',    rateHistory:[2.45,2.48,2.50,2.52,2.55], hazmat:false },
  { id:'8',  from:'Portland',    fromState:'OR', to:'San Francisco', toState:'CA', miles:636,  rate:2.38, payout:1514,  type:'Flatbed',  weight:'41,500 lbs', pickup:'May 16', deliveryDate:'May 17', broker:'Transplace',        brokerRating:4.6, brokerCredit:'A',  brokerPayDays:28, aiScore:85, dho:18,  status:'Available', age:'5 hrs',  ref:'TP-667214', commodity:'Construction',         rateHistory:[2.30,2.32,2.34,2.36,2.38] },
  { id:'9',  from:'Dallas',      fromState:'TX', to:'Atlanta',       toState:'GA', miles:781,  rate:2.24, payout:1749,  type:'Dry Van',  weight:'40,000 lbs', pickup:'May 15', deliveryDate:'May 16', broker:'Echo Global',       brokerRating:4.6, brokerCredit:'A+', brokerPayDays:28, aiScore:88, dho:20,  status:'Available', age:'45 min', ref:'EG-884211', commodity:'General Freight',     rateHistory:[2.15,2.18,2.20,2.22,2.24] },
  { id:'10', from:'Kansas City', fromState:'MO', to:'Memphis',       toState:'TN', miles:451,  rate:2.04, payout:921,   type:'Dry Van',  weight:'36,000 lbs', pickup:'May 16', deliveryDate:'May 16', broker:'Odyssey Logistics',  brokerRating:4.2, brokerCredit:'B+', brokerPayDays:35, aiScore:74, dho:55,  status:'Available', age:'6 hrs',  ref:'OD-441109', commodity:'Retail',              rateHistory:[1.95,1.98,2.00,2.02,2.04] },
  { id:'11', from:'Denver',      fromState:'CO', to:'Chicago',       toState:'IL', miles:920,  rate:2.30, payout:2116,  type:'Reefer',   weight:'43,000 lbs', pickup:'May 17', deliveryDate:'May 19', broker:'Redwood Logistics',  brokerRating:4.5, brokerCredit:'A',  brokerPayDays:28, aiScore:87, dho:30,  status:'Available', age:'2 hrs',  ref:'RX-774211', commodity:'Dairy Products',      rateHistory:[2.20,2.23,2.25,2.27,2.30], teamRequired:true },
  { id:'12', from:'Boston',      fromState:'MA', to:'Atlanta',       toState:'GA', miles:1103, rate:2.30, payout:2537,  type:'Dry Van',  weight:'40,000 lbs', pickup:'May 17', deliveryDate:'May 19', broker:'FreightWise',        brokerRating:4.6, brokerCredit:'A',  brokerPayDays:21, aiScore:90, dho:14,  status:'Available', age:'1 hr',   ref:'FW-228890', commodity:'Electronics',         rateHistory:[2.22,2.24,2.26,2.28,2.30] },
]

const LANE_RATES: LaneRate[] = [
  { lane:'IL → TX', fromState:'IL', toState:'TX', avgRate:2.20, weekChange:+0.04, volume:312, trend:'up'   },
  { lane:'GA → FL', fromState:'GA', toState:'FL', avgRate:2.41, weekChange:+0.02, volume:198, trend:'up'   },
  { lane:'TX → AZ', fromState:'TX', toState:'AZ', avgRate:2.28, weekChange:-0.03, volume:145, trend:'down' },
  { lane:'CA → WA', fromState:'CA', toState:'WA', avgRate:2.68, weekChange:+0.06, volume:220, trend:'up'   },
  { lane:'FL → NY', fromState:'FL', toState:'NY', avgRate:2.52, weekChange:-0.01, volume:178, trend:'flat' },
  { lane:'OR → CA', fromState:'OR', toState:'CA', avgRate:2.35, weekChange:+0.03, volume:164, trend:'up'   },
  { lane:'CO → IL', fromState:'CO', toState:'IL', avgRate:2.27, weekChange:-0.02, volume:190, trend:'down' },
  { lane:'MA → GA', fromState:'MA', toState:'GA', avgRate:2.28, weekChange:+0.01, volume:132, trend:'up'   },
]

// ─── Auction Types ────────────────────────────────────────────────────────────
interface AuctionLoad {
  id: string
  from: string; fromState: string
  to: string; toState: string
  miles: number
  type: string
  weight: string
  commodity: string
  pickup: string
  shipper: string
  reservePrice: number
  currentBid: number
  currentBidder: string
  myBid?: number
  bidCount: number
  endsAt: string
  secondsLeft: number
  status: 'live' | 'ending' | 'closed' | 'won'
}

interface BidHistoryEntry {
  time: string
  bidder: string
  amount: number
  delta: number
}

// ─── Auction Mock Data ────────────────────────────────────────────────────────
const AUCTION_BID_HISTORY: Record<string, BidHistoryEntry[]> = {
  'a1': [
    { time:'12:04 PM', bidder:'Driver ***441', amount:2.55, delta:+0.15 },
    { time:'11:58 AM', bidder:'Fleet ***872', amount:2.50, delta:+0.10 },
    { time:'11:45 AM', bidder:'Driver ***221', amount:2.45, delta:+0.05 },
    { time:'11:30 AM', bidder:'Driver ***119', amount:2.40, delta:+0.10 },
    { time:'11:10 AM', bidder:'Fleet ***007', amount:2.30, delta:+0.05 },
  ],
  'a2': [
    { time:'12:10 PM', bidder:'Me (Active)', amount:2.38, delta:+0.03 },
    { time:'12:05 PM', bidder:'Driver ***554', amount:2.35, delta:+0.05 },
    { time:'11:55 AM', bidder:'Fleet ***312', amount:2.30, delta:+0.10 },
    { time:'11:40 AM', bidder:'Driver ***221', amount:2.20, delta:+0.05 },
  ],
  'a3': [
    { time:'12:12 PM', bidder:'Fleet ***990', amount:2.72, delta:+0.02 },
    { time:'12:08 PM', bidder:'Me (Active)', amount:2.70, delta:+0.05 },
    { time:'11:59 AM', bidder:'Driver ***441', amount:2.65, delta:+0.05 },
    { time:'11:44 AM', bidder:'Fleet ***105', amount:2.60, delta:+0.10 },
    { time:'11:20 AM', bidder:'Driver ***778', amount:2.50, delta:+0.10 },
  ],
  'a4': [
    { time:'12:01 PM', bidder:'Me (Active)', amount:2.18, delta:+0.03 },
    { time:'11:48 AM', bidder:'Driver ***663', amount:2.15, delta:+0.05 },
    { time:'11:30 AM', bidder:'Fleet ***220', amount:2.10, delta:+0.05 },
  ],
  'a5': [
    { time:'11:05 AM', bidder:'Driver ***441', amount:2.44, delta:+0.04 },
    { time:'10:50 AM', bidder:'Fleet ***192', amount:2.40, delta:+0.10 },
    { time:'10:35 AM', bidder:'Driver ***007', amount:2.30, delta:+0.05 },
  ],
  'a6': [
    { time:'9:30 AM', bidder:'Fleet ***312', amount:2.62, delta:+0.02 },
    { time:'9:15 AM', bidder:'Driver ***441', amount:2.60, delta:+0.05 },
    { time:'9:00 AM', bidder:'Fleet ***872', amount:2.55, delta:+0.10 },
  ],
  'a7': [
    { time:'Yesterday', bidder:'Me (Won)', amount:2.33, delta:+0.03 },
    { time:'Yesterday', bidder:'Driver ***119', amount:2.30, delta:+0.05 },
    { time:'Yesterday', bidder:'Fleet ***441', amount:2.25, delta:+0.05 },
    { time:'Yesterday', bidder:'Driver ***221', amount:2.20, delta:+0.10 },
  ],
  'a8': [
    { time:'12:09 PM', bidder:'Driver ***554', amount:2.48, delta:+0.03 },
    { time:'12:01 PM', bidder:'Fleet ***007', amount:2.45, delta:+0.05 },
    { time:'11:52 AM', bidder:'Driver ***663', amount:2.40, delta:+0.10 },
    { time:'11:38 AM', bidder:'Fleet ***872', amount:2.30, delta:+0.05 },
  ],
}

const INITIAL_AUCTIONS: AuctionLoad[] = [
  {
    id:'a1', from:'Chicago', fromState:'IL', to:'Dallas', toState:'TX',
    miles:850, type:'Dry Van', weight:'42,000 lbs', commodity:'General Freight',
    pickup:'May 14', shipper:'Walmart Distribution',
    reservePrice:2.40, currentBid:2.55, currentBidder:'Driver ***441',
    bidCount:5, endsAt:'2026-05-12T14:30:00', secondsLeft:3600,
    status:'live',
  },
  {
    id:'a2', from:'Atlanta', fromState:'GA', to:'Miami', toState:'FL',
    miles:662, type:'Reefer', weight:'38,500 lbs', commodity:'Perishables',
    pickup:'May 14', shipper:'Sysco Foods',
    reservePrice:2.20, currentBid:2.38, currentBidder:'Me (Active)',
    myBid:2.38, bidCount:4, endsAt:'2026-05-12T13:54:00', secondsLeft:220,
    status:'ending',
  },
  {
    id:'a3', from:'Los Angeles', fromState:'CA', to:'Seattle', toState:'WA',
    miles:1140, type:'Reefer', weight:'40,000 lbs', commodity:'Frozen Foods',
    pickup:'May 15', shipper:'Kroger Supply',
    reservePrice:2.60, currentBid:2.72, currentBidder:'Fleet ***990',
    myBid:2.70, bidCount:5, endsAt:'2026-05-12T15:00:00', secondsLeft:5400,
    status:'live',
  },
  {
    id:'a4', from:'Houston', fromState:'TX', to:'Phoenix', toState:'AZ',
    miles:1201, type:'Flatbed', weight:'44,000 lbs', commodity:'Steel Coil',
    pickup:'May 15', shipper:'Nucor Steel',
    reservePrice:2.10, currentBid:2.18, currentBidder:'Me (Active)',
    myBid:2.18, bidCount:3, endsAt:'2026-05-12T13:58:00', secondsLeft:260,
    status:'ending',
  },
  {
    id:'a5', from:'Nashville', fromState:'TN', to:'Charlotte', toState:'NC',
    miles:408, type:'Dry Van', weight:'35,000 lbs', commodity:'Auto Parts',
    pickup:'May 15', shipper:'Toyota Logistics',
    reservePrice:2.30, currentBid:2.44, currentBidder:'Driver ***441',
    bidCount:3, endsAt:'2026-05-12T16:30:00', secondsLeft:8400,
    status:'live',
  },
  {
    id:'a6', from:'Denver', fromState:'CO', to:'Salt Lake City', toState:'UT',
    miles:525, type:'Flatbed', weight:'39,000 lbs', commodity:'Construction Materials',
    pickup:'May 16', shipper:'Home Depot',
    reservePrice:2.40, currentBid:2.62, currentBidder:'Fleet ***312',
    bidCount:3, endsAt:'2026-05-12T17:15:00', secondsLeft:12600,
    status:'live',
  },
  {
    id:'a7', from:'Portland', fromState:'OR', to:'San Francisco', toState:'CA',
    miles:636, type:'Dry Van', weight:'41,500 lbs', commodity:'Consumer Electronics',
    pickup:'May 12', shipper:'Best Buy Logistics',
    reservePrice:2.20, currentBid:2.33, currentBidder:'Me (Won)',
    myBid:2.33, bidCount:4, endsAt:'2026-05-11T15:00:00', secondsLeft:0,
    status:'won',
  },
  {
    id:'a8', from:'Boston', fromState:'MA', to:'Atlanta', toState:'GA',
    miles:1103, type:'Reefer', weight:'40,000 lbs', commodity:'Seafood',
    pickup:'May 13', shipper:'US Foods',
    reservePrice:2.35, currentBid:2.48, currentBidder:'Driver ***554',
    bidCount:4, endsAt:'2026-05-12T12:00:00', secondsLeft:0,
    status:'closed',
  },
]

const TRUCK_TYPES   = ['All Types', 'Dry Van', 'Reefer', 'Flatbed', 'Hotshot', 'Box Truck', 'Partial']
const SORT_OPTIONS  = ['AI Score ↓', 'Rate ↑', 'Rate ↓', 'Payout ↓', 'Miles ↑', 'Miles ↓', 'Posted ↓']
const BROKER_NAMES  = ['All Brokers', 'Echo Global', 'Coyote Logistics', 'TQL', 'CH Robinson', 'XPO Logistics']

// ─── Component ───────────────────────────────────────────────────────────────
export default function LoadBoardPage() {
  const [search,       setSearch]       = useState('')
  const [truckType,    setTruckType]    = useState('All Types')
  const [sortBy,       setSortBy]       = useState('AI Score ↓')
  const [broker,       setBroker]       = useState('All Brokers')
  const [minRate,      setMinRate]      = useState('')
  const [maxDho,       setMaxDho]       = useState('')
  const [selected,     setSelected]     = useState<Load | null>(null)
  const [booked,       setBooked]       = useState<Set<string>>(new Set())
  const [watchlist,    setWatchlist]    = useState<Set<string>>(new Set())
  const [tab,          setTab]          = useState<'board' | 'watchlist' | 'market' | 'history' | 'auction'>('board')
  const [showFilters,  setShowFilters]  = useState(false)
  const [negotiateLoad, setNegotiateLoad] = useState<Load | null>(null)

  const filtered = LOADS
    .filter(l => {
      if (truckType !== 'All Types' && l.type   !== truckType) return false
      if (broker    !== 'All Brokers' && l.broker !== broker)  return false
      if (minRate   && l.rate < parseFloat(minRate))           return false
      if (maxDho    && l.dho  > parseFloat(maxDho))            return false
      const q = search.toLowerCase()
      if (q && !l.from.toLowerCase().includes(q) && !l.to.toLowerCase().includes(q)
            && !l.broker.toLowerCase().includes(q) && !l.commodity.toLowerCase().includes(q)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'AI Score ↓') return b.aiScore - a.aiScore
      if (sortBy === 'Rate ↑')     return a.rate - b.rate
      if (sortBy === 'Rate ↓')     return b.rate - a.rate
      if (sortBy === 'Payout ↓')   return b.payout - a.payout
      if (sortBy === 'Miles ↑')    return a.miles - b.miles
      if (sortBy === 'Miles ↓')    return b.miles - a.miles
      return 0
    })

  const avgRate   = filtered.length ? (filtered.reduce((s,l) => s+l.rate, 0) / filtered.length).toFixed(2) : '—'
  const avgPayout = filtered.length ? Math.round(filtered.reduce((s,l) => s+l.payout, 0) / filtered.length) : 0
  const hotCount  = filtered.filter(l => l.status==='Hot').length

  const watchedLoads = LOADS.filter(l => watchlist.has(l.id))

  function toggleWatch(id: string) {
    setWatchlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function bookLoad(id: string) {
    setBooked(prev => new Set([...prev, id]))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:0 }}>
        <button className={`tab-btn ${tab==='board'?'active':''}`}     onClick={()=>setTab('board')}>📦 Load Board</button>
        <button className={`tab-btn ${tab==='watchlist'?'active':''}`} onClick={()=>setTab('watchlist')}>
          ⭐ Watchlist
          {watchlist.size > 0 && <span className="badge-dot" style={{ marginLeft:6 }}>{watchlist.size}</span>}
        </button>
        <button className={`tab-btn ${tab==='market'?'active':''}`}    onClick={()=>setTab('market')}>📊 Market Rates</button>
        <button className={`tab-btn ${tab==='history'?'active':''}`}   onClick={()=>setTab('history')}>📋 My History</button>
        <button className={`tab-btn ${tab==='auction'?'active':''}`}   onClick={()=>setTab('auction')}>🔨 Auction</button>
      </div>

      {/* ── LOAD BOARD TAB ── */}
      {tab === 'board' && (
        <>
          {/* Search + Controls */}
          <div className="card" style={{ padding:'14px 16px' }}>
            <div style={{ display:'flex', gap:10, marginBottom: showFilters ? 14 : 0 }}>
              <input className="input" style={{ flex:1 }}
                placeholder="🔍  Origin, destination, broker, commodity..."
                value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="input select" style={{ width:160 }} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                {SORT_OPTIONS.map(s=><option key={s}>{s}</option>)}
              </select>
              <button className={`btn ${showFilters?'btn-primary':'btn-ghost'}`}
                onClick={()=>setShowFilters(!showFilters)}>
                ⚙️ Filters {showFilters?'▲':'▼'}
              </button>
            </div>

            {showFilters && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Truck Type</label>
                  <select className="input select" value={truckType} onChange={e=>setTruckType(e.target.value)}>
                    {TRUCK_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Broker</label>
                  <select className="input select" value={broker} onChange={e=>setBroker(e.target.value)}>
                    {BROKER_NAMES.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Min Rate ($/mi)</label>
                  <input className="input" type="number" placeholder="e.g. 2.00"
                    value={minRate} onChange={e=>setMinRate(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label">Max Deadhead (mi)</label>
                  <input className="input" type="number" placeholder="e.g. 50"
                    value={maxDho} onChange={e=>setMaxDho(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {/* Summary bar */}
          <div style={{ display:'flex', gap:20, padding:'4px 4px', flexWrap:'wrap', alignItems:'center' }}>
            {[
              { label:'Loads Found', value:`${filtered.length}`,                    color:'#4BAED4' },
              { label:'Avg Rate',    value:`$${avgRate}/mi`,                         color:'#38C770' },
              { label:'Avg Payout',  value: avgPayout ? `$${avgPayout.toLocaleString()}` : '—', color:'#8B5CF6' },
              { label:'Hot Loads',   value:`${hotCount}`,                            color:'#E53E3E' },
              { label:'Watched',     value:`${watchlist.size}`,                      color:'#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />
                <span style={{ fontWeight:700, color:s.color, fontSize:13 }}>{s.value}</span>
                <span style={{ color:'#A0AEC0', fontSize:12 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Main: list + detail */}
          <div style={{ display:'flex', gap:20 }}>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map(load => (
                <LoadCard
                  key={load.id}
                  load={load}
                  selected={selected?.id === load.id}
                  booked={booked.has(load.id)}
                  watched={watchlist.has(load.id)}
                  onClick={() => setSelected(selected?.id===load.id ? null : load)}
                  onBook={() => bookLoad(load.id)}
                  onWatch={() => toggleWatch(load.id)}
                  onNegotiate={() => setNegotiateLoad(load)}
                />
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:60, color:'#A0AEC0' }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
                  <div style={{ fontSize:16, fontWeight:600 }}>No loads match your filters</div>
                  <div style={{ fontSize:13, marginTop:6 }}>Try adjusting your search or filters</div>
                </div>
              )}
            </div>

            {selected && (
              <div style={{ width:400, flexShrink:0 }}>
                <LoadDetail
                  load={selected}
                  booked={booked.has(selected.id)}
                  watched={watchlist.has(selected.id)}
                  onBook={() => bookLoad(selected.id)}
                  onWatch={() => toggleWatch(selected.id)}
                  onClose={() => setSelected(null)}
                  onNegotiate={() => setNegotiateLoad(selected)}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── WATCHLIST TAB ── */}
      {tab === 'watchlist' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {watchedLoads.length === 0 ? (
            <div style={{ textAlign:'center', padding:80, color:'#A0AEC0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>⭐</div>
              <div style={{ fontWeight:600, fontSize:16 }}>No loads saved to watchlist</div>
              <div style={{ fontSize:13, marginTop:6 }}>Click ⭐ on any load to save it here</div>
            </div>
          ) : (
            watchedLoads.map(load => (
              <LoadCard
                key={load.id}
                load={load}
                selected={false}
                booked={booked.has(load.id)}
                watched={true}
                onClick={() => { setTab('board'); setSelected(load) }}
                onBook={() => bookLoad(load.id)}
                onWatch={() => toggleWatch(load.id)}
                onNegotiate={() => setNegotiateLoad(load)}
              />
            ))
          )}
        </div>
      )}

      {/* ── MARKET RATES TAB ── */}
      {tab === 'market' && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {[
              { label:'Natl Avg Dry Van', value:'$2.14/mi', change:'+$0.03', up:true  },
              { label:'Natl Avg Reefer',  value:'$2.58/mi', change:'+$0.05', up:true  },
              { label:'Natl Avg Flatbed', value:'$2.41/mi', change:'-$0.02', up:false },
              { label:'Diesel Avg',       value:'$3.82/gal',change:'-$0.04', up:false },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor: s.up?'#38C770':'#E53E3E' }}>
                <div className="stat-value" style={{ color:'#2D3748', fontSize:18 }}>{s.value}</div>
                <div style={{ fontSize:12, color: s.up?'#38C770':'#E53E3E', fontWeight:600, marginBottom:4 }}>
                  {s.up?'▲':'▼'} {s.change} week
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="section-title">Hot Lane Rates — This Week</h3>
            <div style={{ fontSize:11, color:'#A0AEC0', marginBottom:12 }}>
              Avg $/mile across your active lanes. Updated daily from DAT & Truckstop.
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F4F6F9' }}>
                  {['Lane','Avg Rate','Wk Change','Load Volume','Trend'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'#718096' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LANE_RATES.map(l => (
                  <tr key={l.lane} style={{ borderBottom:'1px solid var(--c-divider)' }}>
                    <td style={{ padding:'10px 12px', fontWeight:700, fontSize:13 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:6, height:6, borderRadius:3, background:'#4BAED4' }} />
                        {l.lane}
                      </div>
                    </td>
                    <td style={{ padding:'10px 12px', fontWeight:700, fontSize:14, color:'#2D3748' }}>
                      ${l.avgRate.toFixed(2)}
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13, fontWeight:700,
                      color: l.weekChange > 0 ? '#38C770' : l.weekChange < 0 ? '#E53E3E' : '#718096' }}>
                      {l.weekChange > 0 ? '▲' : l.weekChange < 0 ? '▼' : '—'} ${Math.abs(l.weekChange).toFixed(2)}
                    </td>
                    <td style={{ padding:'10px 12px', fontSize:13, color:'#718096' }}>{l.volume} loads</td>
                    <td style={{ padding:'10px 12px' }}>
                      <span style={{ fontSize:12, fontWeight:700, padding:'2px 10px', borderRadius:99,
                        background: l.trend==='up'?'#F0FFF4':l.trend==='down'?'#FFF5F5':'#F4F6F9',
                        color: l.trend==='up'?'#276749':l.trend==='down'?'#C53030':'#718096' }}>
                        {l.trend==='up'?'📈 Rising':l.trend==='down'?'📉 Falling':'➡️ Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 className="section-title">Rate vs. Market — Your Recent Loads</h3>
            <RateVsMarketChart />
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && <HistoryTab booked={booked} loads={LOADS} />}

      {/* ── AUCTION TAB ── */}
      {tab === 'auction' && <AuctionTab />}

      {/* Negotiate Modal */}
      {negotiateLoad && (
        <NegotiateModal load={negotiateLoad} onClose={()=>setNegotiateLoad(null)} />
      )}
    </div>
  )
}

// ─── Load Card ────────────────────────────────────────────────────────────────
function LoadCard({ load: l, selected, booked, watched, onClick, onBook, onWatch, onNegotiate }:
  { load:Load; selected:boolean; booked:boolean; watched:boolean; onClick:()=>void;
    onBook:()=>void; onWatch:()=>void; onNegotiate:()=>void }) {

  const scoreColor = l.aiScore >= 90 ? '#38C770' : l.aiScore >= 75 ? '#F6C90E' : '#E53E3E'
  const rateVsAvg  = l.rateHistory.length ? l.rate - l.rateHistory[l.rateHistory.length-2] : 0

  return (
    <div className="card" style={{
      cursor:'pointer', padding:'14px 16px',
      boxShadow: selected ? '0 0 0 2px #4BAED4, 0 4px 16px rgba(75,174,212,.15)' : undefined,
      borderLeft:`4px solid ${l.status==='Hot'?'#E53E3E':booked?'#38C770':'#E2E8F0'}`,
      opacity: booked ? 0.7 : 1,
    }} onClick={onClick}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
            {l.status==='Hot' && <span className="badge badge-error">🔥 HOT</span>}
            {booked && <span className="badge badge-success">✓ BOOKED</span>}
            {l.hazmat && <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:3, background:'#FFF5F5', color:'#C53030' }}>HAZMAT</span>}
            {l.teamRequired && <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:3, background:'#FAF5FF', color:'#553C9A' }}>TEAM</span>}
            <span style={{ fontSize:11, color:'#A0AEC0' }}>#{l.ref} · {l.age} ago · {l.commodity}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:15 }}>{l.from}, {l.fromState}</div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>Pickup {l.pickup}</div>
            </div>
            <div style={{ fontSize:22, color:'#A0AEC0' }}>→</div>
            <div>
              <div style={{ fontWeight:800, fontSize:15 }}>{l.to}, {l.toState}</div>
              <div style={{ fontSize:11, color:'#A0AEC0' }}>Del. {l.deliveryDate}</div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', border:`3px solid ${scoreColor}`,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:15, fontWeight:900, color:scoreColor, lineHeight:1 }}>{l.aiScore}</div>
            <div style={{ fontSize:8, color:'#A0AEC0' }}>AI</div>
          </div>
          <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, lineHeight:1, padding:0 }}
            onClick={e=>{ e.stopPropagation(); onWatch() }}>
            {watched ? '⭐' : '☆'}
          </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:12 }}>
        {[
          { icon:'💵', value:`$${l.rate.toFixed(2)}/mi`, label:'Rate', highlight: rateVsAvg > 0 },
          { icon:'💰', value:`$${l.payout.toLocaleString()}`, label:'Payout', highlight:false },
          { icon:'📏', value:`${l.miles.toLocaleString()} mi`, label:'Miles', highlight:false },
          { icon:'🚛', value:l.type, label:'Type', highlight:false },
          { icon:'🔢', value:`${l.dho} mi`, label:'Deadhead', highlight:false },
          { icon:'⚖️', value:l.weight, label:'Weight', highlight:false },
        ].map(s => (
          <div key={s.label} style={{ display:'flex', gap:5, alignItems:'center' }}>
            <span style={{ fontSize:13 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color: s.highlight?'#38C770':'#2D3748', lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:10, color:'#A0AEC0', lineHeight:1.2 }}>{s.label}</div>
            </div>
          </div>
        ))}
        {rateVsAvg !== 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
              background: rateVsAvg>0?'#F0FFF4':'#FFF5F5',
              color: rateVsAvg>0?'#276749':'#C53030' }}>
              {rateVsAvg>0?'▲':'▼'} ${Math.abs(rateVsAvg).toFixed(2)} vs last wk
            </span>
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div className="avatar" style={{ width:28, height:28, fontSize:11, background:'#F4F6F9', color:'#4A5568' }}>
            {l.broker.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:600 }}>{l.broker}</div>
            <div style={{ fontSize:10, color:'#718096' }}>★{l.brokerRating} · {l.brokerCredit} credit · {l.brokerPayDays}d pay</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }} onClick={onNegotiate}>💬 Negotiate</button>
          <button className={`btn btn-sm ${booked?'btn-ghost':'btn-primary'}`} style={{ fontSize:11 }}
            disabled={booked} onClick={e=>{ e.stopPropagation(); onBook() }}>
            {booked ? '✓ Booked' : 'Book →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Load Detail Panel ────────────────────────────────────────────────────────
function LoadDetail({ load: l, booked, watched, onBook, onWatch, onClose, onNegotiate }:
  { load:Load; booked:boolean; watched:boolean; onBook:()=>void; onWatch:()=>void;
    onClose:()=>void; onNegotiate:()=>void }) {

  const scoreColor = l.aiScore >= 90 ? '#38C770' : l.aiScore >= 75 ? '#F6C90E' : '#E53E3E'
  const [subTab, setSubTab] = useState<'details'|'estimator'|'history'>('details')

  const [fuelPrice, setFuelPrice] = useState('3.82')
  const [mpg,       setMpg]       = useState('6.5')
  const [tolls,     setTolls]     = useState('0')
  const [dispFee,   setDispFee]   = useState('5')
  const [otherExp,  setOtherExp]  = useState('0')
  const [dhMiles,   setDhMiles]   = useState(String(l.dho))

  const gross     = l.payout
  const totalMi   = l.miles + parseFloat(dhMiles||'0')
  const fuelCost  = Math.round((totalMi / Math.max(parseFloat(mpg||'6.5'),0.1)) * parseFloat(fuelPrice||'3.82'))
  const tollCost  = Math.round(parseFloat(tolls||'0'))
  const dispCost  = Math.round(gross * (parseFloat(dispFee||'0') / 100))
  const otherCost = Math.round(parseFloat(otherExp||'0'))
  const totalExp  = fuelCost + tollCost + dispCost + otherCost
  const netProfit = gross - totalExp
  const netRpm    = l.miles > 0 ? (netProfit / l.miles).toFixed(2) : '0'
  const cpm       = l.miles > 0 ? (totalExp / l.miles).toFixed(2) : '0'
  const profitColor = netProfit >= 0 ? '#38C770' : '#E53E3E'
  const profitPct   = gross > 0 ? Math.round((netProfit / gross) * 100) : 0

  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.5)' }}>#{l.ref}</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onWatch} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18 }}>
              {watched ? '⭐' : '☆'}
            </button>
            <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ fontSize:18, fontWeight:900, color:'#fff', marginTop:4 }}>
          {l.from}, {l.fromState} → {l.to}, {l.toState}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:12 }}>
          <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'6px 12px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:900, color:'#fff' }}>${l.rate.toFixed(2)}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>per mile</div>
          </div>
          <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'6px 12px', textAlign:'center' }}>
            <div style={{ fontSize:20, fontWeight:900, color:'#38C770' }}>${l.payout.toLocaleString()}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>total payout</div>
          </div>
          <div style={{ width:50, height:50, borderRadius:'50%', border:`3px solid ${scoreColor}`,
            background:'rgba(255,255,255,.05)', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', marginLeft:'auto' }}>
            <div style={{ fontSize:16, fontWeight:900, color:scoreColor, lineHeight:1 }}>{l.aiScore}</div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,.5)' }}>AI</div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--c-divider)' }}>
        {(['details','estimator','history'] as const).map(t => (
          <button key={t} onClick={()=>setSubTab(t)}
            style={{ flex:1, padding:'10px 4px', fontSize:11, fontWeight:600, background:'none', border:'none',
              cursor:'pointer', color:subTab===t?'#4BAED4':'#A0AEC0',
              borderBottom:`2px solid ${subTab===t?'#4BAED4':'transparent'}` }}>
            {t==='details'?'📋 Details':t==='estimator'?'🧮 Estimator':'📈 Lane History'}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px 20px', overflowY:'auto', maxHeight:480 }}>
        {subTab === 'details' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div className="section-title" style={{ fontSize:12, marginBottom:8 }}>Load Details</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { label:'Equipment',  value:l.type },
                  { label:'Commodity',  value:l.commodity },
                  { label:'Weight',     value:l.weight },
                  { label:'Distance',   value:`${l.miles.toLocaleString()} miles` },
                  { label:'Deadhead',   value:`${l.dho} mi to origin` },
                  { label:'Pickup',     value:l.pickup },
                  { label:'Delivery',   value:l.deliveryDate },
                  { label:'Notes',      value:l.notes ?? 'None' },
                ].map(r => (
                  <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
                    <div style={{ fontWeight:700, fontSize:12, color:'#2D3748', marginTop:1 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-title" style={{ fontSize:12, marginBottom:8 }}>Broker</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, background:'#F4F6F9', borderRadius:10, padding:'12px 14px' }}>
                <div className="avatar" style={{ background:'#4BAED4', color:'#fff', fontWeight:700 }}>
                  {l.broker.charAt(0)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{l.broker}</div>
                  <div style={{ fontSize:12, color:'#718096' }}>★ {l.brokerRating} · Pay: {l.brokerPayDays} days</div>
                  <div style={{ display:'flex', gap:8, marginTop:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                      background: l.brokerCredit==='A+'?'#F0FFF4':l.brokerCredit==='A'?'#EBF8FF':'#FFFBF0',
                      color: l.brokerCredit==='A+'?'#276749':l.brokerCredit==='A'?'#2B6CB0':'#744210' }}>
                      {l.brokerCredit} Credit
                    </span>
                    {l.brokerPayDays <= 21 && (
                      <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                        background:'#F0FFF4', color:'#276749' }}>⚡ Fast Pay</span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }}>📞</button>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize:11 }}>💬</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {subTab === 'estimator' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {([
                { label:'Fuel Price ($/gal)', val:fuelPrice, set:setFuelPrice, ph:'3.82' },
                { label:'Truck MPG',          val:mpg,       set:setMpg,       ph:'6.5'  },
                { label:'Tolls ($)',          val:tolls,     set:setTolls,     ph:'0'    },
                { label:'Dispatch Fee (%)',   val:dispFee,   set:setDispFee,   ph:'5'    },
                { label:'Deadhead Miles',     val:dhMiles,   set:setDhMiles,   ph:'0'    },
                { label:'Other Expenses ($)', val:otherExp,  set:setOtherExp,  ph:'0'    },
              ] as {label:string;val:string;set:(v:string)=>void;ph:string}[]).map(f => (
                <div key={f.label} className="form-group" style={{ marginBottom:0 }}>
                  <label className="form-label" style={{ fontSize:10 }}>{f.label}</label>
                  <input className="input" type="number" step="0.01" placeholder={f.ph}
                    value={f.val} onChange={e => f.set(e.target.value)}
                    style={{ fontSize:12, padding:'5px 8px' }} />
                </div>
              ))}
            </div>

            <div style={{ background:'#F4F6F9', borderRadius:10, padding:'12px 14px' }}>
              {[
                { label:'Gross Revenue', value:`$${gross.toLocaleString()}`,    color:'#2D3748', bold:true  },
                { label:'Fuel Cost',     value:`−$${fuelCost.toLocaleString()}`, color:'#E53E3E', bold:false },
                ...(tollCost  ? [{ label:'Tolls',         value:`−$${tollCost.toLocaleString()}`,  color:'#E53E3E', bold:false }] : []),
                ...(dispCost  ? [{ label:'Dispatch Fee',  value:`−$${dispCost.toLocaleString()}`,  color:'#718096', bold:false }] : []),
                ...(otherCost ? [{ label:'Other',         value:`−$${otherCost.toLocaleString()}`, color:'#718096', bold:false }] : []),
              ].map(r => (
                <div key={r.label} style={{ display:'flex', justifyContent:'space-between',
                  padding:'5px 0', borderBottom:'1px solid #E2E8F0' }}>
                  <span style={{ fontSize:12, color:'#718096' }}>{r.label}</span>
                  <span style={{ fontWeight:r.bold?800:600, color:r.color, fontSize:12 }}>{r.value}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', paddingTop:10 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:'#2D3748' }}>Net Profit</div>
                  <div style={{ fontSize:11, color:'#A0AEC0', marginTop:2 }}>
                    Net RPM: <strong style={{ color:profitColor }}>${netRpm}</strong>
                    &nbsp;·&nbsp;CPM: ${cpm}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:900, fontSize:22, color:profitColor, lineHeight:1 }}>
                    ${netProfit.toLocaleString()}
                  </div>
                  <div style={{ fontSize:11, marginTop:3, color:profitColor, fontWeight:600 }}>
                    {netProfit>=0 ? `✅ ${profitPct}% margin` : `⚠️ ${Math.abs(profitPct)}% loss`}
                  </div>
                </div>
              </div>
              <div style={{ marginTop:8, background:'#E2E8F0', borderRadius:99, height:6, overflow:'hidden' }}>
                <div style={{ width:`${Math.min(Math.max(profitPct,0),100)}%`, height:'100%', borderRadius:99,
                  background: netProfit>=0?'linear-gradient(90deg,#38C770,#2FA85A)':'#E53E3E', transition:'width .4s' }} />
              </div>
            </div>
          </div>
        )}

        {subTab === 'history' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#718096', marginBottom:8 }}>
                {l.fromState} → {l.toState} — Rate Trend (last 5 weeks)
              </div>
              <RateHistoryChart data={l.rateHistory} currentRate={l.rate} />
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'#718096', marginBottom:8 }}>Historical Context</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { label:'4-Wk Avg',    value:`$${(l.rateHistory.reduce((s,v)=>s+v,0)/l.rateHistory.length).toFixed(2)}/mi` },
                  { label:'4-Wk High',   value:`$${Math.max(...l.rateHistory).toFixed(2)}/mi` },
                  { label:'4-Wk Low',    value:`$${Math.min(...l.rateHistory).toFixed(2)}/mi` },
                  { label:'Current',     value:`$${l.rate.toFixed(2)}/mi` },
                ].map(r => (
                  <div key={r.label} style={{ background:'#F4F6F9', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:10, color:'#A0AEC0' }}>{r.label}</div>
                    <div style={{ fontWeight:700, fontSize:13, color:'#2D3748', marginTop:1 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:'12px 20px 20px', borderTop:'1px solid var(--c-divider)', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost btn-full btn-sm" onClick={onNegotiate}>💬 Negotiate Rate</button>
          <button className={`btn btn-full btn-sm ${booked?'btn-ghost':'btn-primary'}`}
            onClick={onBook} disabled={booked}>
            {booked ? '✓ Booked' : '🚀 Book Load'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function RateHistoryChart({ data, currentRate }: { data:number[]; currentRate:number }) {
  const all   = [...data, currentRate]
  const minV  = Math.min(...all) - 0.05
  const maxV  = Math.max(...all) + 0.05
  const w = 280, h = 70
  const labels = ['5wk','4wk','3wk','2wk','1wk','Now']
  const pts = all.map((v,i) => {
    const x = (i/(all.length-1))*(w-20)+10
    const y = h - ((v-minV)/(maxV-minV))*(h-10)-5
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h+24}`} style={{ width:'100%' }}>
      <defs>
        <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4BAED4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4BAED4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#rateGrad)" points={`10,${h} ${pts} ${w-10},${h}`} />
      <polyline fill="none" stroke="#4BAED4" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {all.map((v,i) => {
        const x = (i/(all.length-1))*(w-20)+10
        const y = h - ((v-minV)/(maxV-minV))*(h-10)-5
        const isLast = i===all.length-1
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={isLast?4:3}
              fill={isLast?'#4BAED4':'#fff'} stroke="#4BAED4" strokeWidth="2" />
            <text x={x} y={h+14} textAnchor="middle" fontSize="9" fill="#A0AEC0">{labels[i]}</text>
            {isLast && (
              <text x={x} y={y-8} textAnchor="middle" fontSize="10" fill="#4BAED4" fontWeight="bold">
                ${v.toFixed(2)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function RateVsMarketChart() {
  const data = [
    { label:'EG-920441', actual:2.18, market:2.10 },
    { label:'CH-990012', actual:2.55, market:2.52 },
    { label:'CL-773201', actual:2.45, market:2.41 },
    { label:'TP-667214', actual:2.38, market:2.35 },
    { label:'TQ-554832', actual:2.32, market:2.28 },
  ]
  const max = 2.7
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {data.map(d => (
        <div key={d.label}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
            <span style={{ fontWeight:600 }}>{d.label}</span>
            <div style={{ display:'flex', gap:12 }}>
              <span style={{ color:'#4BAED4' }}>Booked: ${d.actual.toFixed(2)}</span>
              <span style={{ color:'#A0AEC0' }}>Market: ${d.market.toFixed(2)}</span>
              <span style={{ fontWeight:700, color: d.actual>d.market?'#38C770':'#E53E3E' }}>
                {d.actual>d.market?'+':''}${(d.actual-d.market).toFixed(2)}
              </span>
            </div>
          </div>
          <div style={{ position:'relative', height:12 }}>
            <div style={{ position:'absolute', top:3, left:0, width:`${(d.market/max)*100}%`,
              height:6, background:'#E2E8F0', borderRadius:99 }} />
            <div style={{ position:'absolute', top:3, left:0, width:`${(d.actual/max)*100}%`,
              height:6, background: d.actual>d.market?'#38C770':'#E53E3E', borderRadius:99, opacity:0.7 }} />
          </div>
        </div>
      ))}
      <div style={{ display:'flex', gap:16, marginTop:4, fontSize:11 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <div style={{ width:12, height:6, borderRadius:3, background:'#38C770' }} />
          <span style={{ color:'#718096' }}>Your rate (above market)</span>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <div style={{ width:12, height:6, borderRadius:3, background:'#E2E8F0' }} />
          <span style={{ color:'#718096' }}>Market avg</span>
        </div>
      </div>
    </div>
  )
}

// ─── Negotiate Modal ──────────────────────────────────────────────────────────
function NegotiateModal({ load: l, onClose }: { load:Load; onClose:()=>void }) {
  const [offerRate, setOfferRate] = useState((l.rate * 1.08).toFixed(2))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width:460 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">💬 Negotiate Rate — #{l.ref}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14, paddingBottom:8 }}>
          <div style={{ background:'#F4F6F9', borderRadius:10, padding:'12px 16px' }}>
            <div style={{ fontWeight:700, fontSize:14 }}>{l.from}, {l.fromState} → {l.to}, {l.toState}</div>
            <div style={{ fontSize:12, color:'#718096', marginTop:4 }}>
              {l.miles.toLocaleString()} mi · {l.type} · Posted rate: <strong>${l.rate.toFixed(2)}/mi (${l.payout.toLocaleString()})</strong>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Your Counter Offer ($/mi)</label>
            <input className="input" type="number" step="0.01"
              value={offerRate} onChange={e=>setOfferRate(e.target.value)} />
            <div style={{ fontSize:11, color:'#A0AEC0', marginTop:4 }}>
              Total: ${(l.miles * parseFloat(offerRate||'0')).toLocaleString('en-US',{maximumFractionDigits:0})}
              &nbsp;·&nbsp;
              {parseFloat(offerRate) > l.rate
                ? `${((parseFloat(offerRate)-l.rate)/l.rate*100).toFixed(1)}% above asking`
                : `${((l.rate-parseFloat(offerRate))/l.rate*100).toFixed(1)}% below asking`
              }
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Message to Broker</label>
            <textarea className="input" rows={3}
              defaultValue={`Hi, I'm interested in load #${l.ref}. I can do $${offerRate}/mi. My truck is available and I have a clean safety record. Please let me know if this works.`}
              style={{ resize:'vertical' }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:10, paddingTop:8 }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={onClose}>📤 Send Offer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Auction Tab ──────────────────────────────────────────────────────────────
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0:00'
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2,'0')}`
}

function countdownColor(seconds: number): string {
  if (seconds <= 0)   return '#A0AEC0'
  if (seconds < 60)   return '#E53E3E'
  if (seconds < 300)  return '#F59E0B'
  return '#38C770'
}

function AuctionTab() {
  const [auctions, setAuctions] = useState<AuctionLoad[]>(INITIAL_AUCTIONS)
  const [selectedAuction, setSelectedAuction] = useState<AuctionLoad | null>(null)
  const [typeFilter,   setTypeFilter]   = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortMode,     setSortMode]     = useState('Ending Soonest')
  const [bidInput,     setBidInput]     = useState('')
  const [autoBid,      setAutoBid]      = useState(false)
  const [autoBidMax,   setAutoBidMax]   = useState('')
  const [toast,        setToast]        = useState('')

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAuctions(prev => prev.map(a => {
        if (a.status === 'closed' || a.status === 'won') return a
        const newSecs = Math.max(0, a.secondsLeft - 1)
        const newStatus: AuctionLoad['status'] = newSecs <= 0 ? 'closed' : newSecs < 300 ? 'ending' : 'live'
        return { ...a, secondsLeft: newSecs, status: newStatus }
      }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync selected auction when auctions update
  useEffect(() => {
    if (selectedAuction) {
      const updated = auctions.find(a => a.id === selectedAuction.id)
      if (updated) setSelectedAuction(updated)
    }
  }, [auctions]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function placeBid(auctionId: string, amount: number) {
    setAuctions(prev => prev.map(a => {
      if (a.id !== auctionId) return a
      return {
        ...a,
        myBid: amount,
        currentBid: amount,
        currentBidder: 'Me (Active)',
        bidCount: a.bidCount + 1,
      }
    }))
    setBidInput('')
    showToast('Bid placed! You are the current leader.')
  }

  const filtered = auctions
    .filter(a => {
      if (typeFilter !== 'All' && a.type !== typeFilter) return false
      if (statusFilter === 'Live' && a.status !== 'live') return false
      if (statusFilter === 'Ending Soon' && a.status !== 'ending') return false
      if (statusFilter === 'Won' && a.status !== 'won') return false
      return true
    })
    .sort((a, b) => {
      if (sortMode === 'Ending Soonest') {
        if (a.status === 'won' || a.status === 'closed') return 1
        if (b.status === 'won' || b.status === 'closed') return -1
        return a.secondsLeft - b.secondsLeft
      }
      if (sortMode === 'Highest Bid') return b.currentBid - a.currentBid
      if (sortMode === 'Most Bids')   return b.bidCount - a.bidCount
      return 0
    })

  const wonAuction   = auctions.find(a => a.status === 'won')
  const activeCount  = auctions.filter(a => a.status === 'live' || a.status === 'ending').length
  const myBidCount   = auctions.filter(a => a.myBid !== undefined && (a.status === 'live' || a.status === 'ending')).length
  const wonCount     = auctions.filter(a => a.status === 'won').length
  const avgWinBid    = 2.41

  const auctionTypes = ['All', 'Dry Van', 'Reefer', 'Flatbed']
  const auctionStatusOpts = ['All', 'Live', 'Ending Soon', 'Won']
  const sortOpts     = ['Ending Soonest', 'Highest Bid', 'Most Bids']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:32, right:32, zIndex:9999,
          background:'#38C770', color:'#fff', fontWeight:700, fontSize:14,
          padding:'12px 20px', borderRadius:10,
          boxShadow:'0 4px 20px rgba(56,199,112,.4)',
          animation:'fadeIn .2s ease',
        }}>
          ✅ {toast}
        </div>
      )}

      {/* Stats Bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Active Auctions',   value:`${activeCount}`,        color:'#4BAED4', icon:'🔨' },
          { label:'Avg Winning Bid',   value:`$${avgWinBid}/mi`,       color:'#38C770', icon:'💵' },
          { label:'My Active Bids',    value:`${myBidCount}`,          color:'#8B5CF6', icon:'🏷️' },
          { label:'Auctions Won (30d)',value:`${wonCount}`,            color:'#F59E0B', icon:'🏆' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
            <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color, fontSize:22 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'12px 16px' }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontSize:12, fontWeight:600, color:'#718096', marginRight:4 }}>Filters:</div>
          {auctionTypes.map(t => (
            <button key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:600,
                cursor:'pointer', border:'none',
                background: typeFilter===t ? '#4BAED4' : '#F4F6F9',
                color: typeFilter===t ? '#fff' : '#718096',
              }}>
              {t}
            </button>
          ))}
          <div style={{ width:1, height:20, background:'#E2E8F0', margin:'0 6px' }} />
          {auctionStatusOpts.map(s => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:600,
                cursor:'pointer', border:'none',
                background: statusFilter===s ? '#1A2535' : '#F4F6F9',
                color: statusFilter===s ? '#fff' : '#718096',
              }}>
              {s}
            </button>
          ))}
          <div style={{ marginLeft:'auto' }}>
            <select
              value={sortMode} onChange={e => setSortMode(e.target.value)}
              className="input select" style={{ fontSize:12, padding:'5px 10px' }}>
              {sortOpts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Won Auction Banner */}
      {wonAuction && (
        <div style={{
          background:'linear-gradient(135deg,#1A2535,#276749)',
          borderRadius:12, padding:'16px 20px',
          display:'flex', alignItems:'center', gap:16,
          boxShadow:'0 4px 20px rgba(56,199,112,.2)',
        }}>
          <div style={{ fontSize:32 }}>🏆</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#38C770', fontWeight:800, fontSize:14, marginBottom:2 }}>
              Auction Won — {wonAuction.from}, {wonAuction.fromState} → {wonAuction.to}, {wonAuction.toState}
            </div>
            <div style={{ color:'rgba(255,255,255,.7)', fontSize:12 }}>
              {wonAuction.miles.toLocaleString()} mi · {wonAuction.type} · Final bid: ${wonAuction.currentBid.toFixed(2)}/mi
              &nbsp;·&nbsp;Total payout: <strong style={{ color:'#fff' }}>${(wonAuction.miles * wonAuction.currentBid).toLocaleString('en-US',{maximumFractionDigits:0})}</strong>
              &nbsp;·&nbsp;Saved vs. avg: <strong style={{ color:'#38C770' }}>+${((avgWinBid - wonAuction.currentBid) * wonAuction.miles).toLocaleString('en-US',{maximumFractionDigits:0})}</strong>
            </div>
          </div>
          <button className="btn" style={{
            background:'#38C770', color:'#fff', fontWeight:700, fontSize:12,
            border:'none', padding:'8px 18px', borderRadius:8, cursor:'pointer',
          }}>
            📋 Confirm Booking →
          </button>
        </div>
      )}

      {/* Main layout: list + detail */}
      <div style={{ display:'flex', gap:20 }}>
        {/* Auction List */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:60, color:'#A0AEC0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔨</div>
              <div style={{ fontSize:16, fontWeight:600 }}>No auctions match your filters</div>
            </div>
          )}
          {filtered.map(auction => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              selected={selectedAuction?.id === auction.id}
              onClick={() => {
                setSelectedAuction(selectedAuction?.id === auction.id ? null : auction)
                setBidInput('')
              }}
            />
          ))}
        </div>

        {/* Auction Detail */}
        {selectedAuction && (
          <div style={{ width:420, flexShrink:0 }}>
            <AuctionDetail
              auction={selectedAuction}
              bidInput={bidInput}
              setBidInput={setBidInput}
              autoBid={autoBid}
              setAutoBid={setAutoBid}
              autoBidMax={autoBidMax}
              setAutoBidMax={setAutoBidMax}
              onClose={() => setSelectedAuction(null)}
              onPlaceBid={placeBid}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Auction Card ─────────────────────────────────────────────────────────────
function AuctionCard({ auction: a, selected, onClick }:
  { auction:AuctionLoad; selected:boolean; onClick:()=>void }) {

  const isActive   = a.status === 'live' || a.status === 'ending'
  const amWinning  = a.myBid !== undefined && a.currentBidder.startsWith('Me')
  const outbid     = a.myBid !== undefined && !a.currentBidder.startsWith('Me')
  const timerColor = countdownColor(a.secondsLeft)
  const payout     = Math.round(a.currentBid * a.miles)

  const statusBadge = () => {
    if (a.status === 'won')    return { label:'🏆 WON',       bg:'#F0FFF4', color:'#276749' }
    if (a.status === 'closed') return { label:'🔒 CLOSED',    bg:'#F4F6F9', color:'#718096' }
    if (a.status === 'ending') return { label:'⚡ ENDING',    bg:'#FFFBEB', color:'#92400E' }
    return                            { label:'🟢 LIVE',       bg:'#F0FFF4', color:'#276749' }
  }
  const sb = statusBadge()

  return (
    <div className="card" style={{
      cursor:'pointer', padding:'14px 16px',
      boxShadow: selected ? '0 0 0 2px #4BAED4, 0 4px 16px rgba(75,174,212,.15)' : undefined,
      borderLeft:`4px solid ${a.status==='won'?'#38C770':a.status==='ending'?'#F59E0B':a.status==='closed'?'#E2E8F0':'#4BAED4'}`,
      opacity: (a.status === 'closed') ? 0.7 : 1,
    }} onClick={onClick}>

      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
              background:sb.bg, color:sb.color }}>{sb.label}</span>
            {amWinning && (
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                background:'#F0FFF4', color:'#276749' }}>✓ Winning</span>
            )}
            {outbid && (
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:99,
                background:'#FFF5F5', color:'#C53030' }}>⚠ Outbid</span>
            )}
            <span style={{ fontSize:10, color:'#A0AEC0' }}>{a.type} · {a.commodity}</span>
          </div>
          <div style={{ fontWeight:800, fontSize:15 }}>
            {a.from}, {a.fromState} → {a.to}, {a.toState}
          </div>
          <div style={{ fontSize:11, color:'#718096', marginTop:2 }}>
            {a.miles.toLocaleString()} mi · {a.weight} · Pickup {a.pickup} · {a.shipper}
          </div>
        </div>

        {/* Timer */}
        {isActive && (
          <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
            <div style={{ fontWeight:800, fontSize:18, color:timerColor, lineHeight:1 }}>
              {formatCountdown(a.secondsLeft)}
            </div>
            <div style={{ fontSize:10, color:'#A0AEC0', marginTop:2 }}>remaining</div>
          </div>
        )}
      </div>

      {/* Bid info */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:10, color:'#A0AEC0' }}>Current Bid</div>
          <div style={{ fontWeight:800, fontSize:16, color:'#2D3748' }}>${a.currentBid.toFixed(2)}/mi</div>
          <div style={{ fontSize:11, color:'#718096' }}>${payout.toLocaleString()} total</div>
        </div>
        {a.myBid && (
          <div>
            <div style={{ fontSize:10, color:'#A0AEC0' }}>My Bid</div>
            <div style={{ fontWeight:700, fontSize:14, color: amWinning?'#38C770':'#E53E3E' }}>
              ${a.myBid.toFixed(2)}/mi
            </div>
          </div>
        )}
        <div>
          <div style={{ fontSize:10, color:'#A0AEC0' }}>Reserve</div>
          <div style={{ fontSize:12, fontWeight:600, color: a.currentBid >= a.reservePrice ? '#38C770':'#F59E0B' }}>
            {a.currentBid >= a.reservePrice ? '✓ Met' : `$${a.reservePrice.toFixed(2)}/mi`}
          </div>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <div style={{ fontSize:10, color:'#A0AEC0' }}>Bids</div>
          <div style={{ fontWeight:700, fontSize:14, color:'#4BAED4' }}>{a.bidCount}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, color:'#A0AEC0' }}>Leader</div>
          <div style={{ fontSize:11, fontWeight:600, color:'#2D3748' }}>{a.currentBidder}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Auction Detail Panel ─────────────────────────────────────────────────────
function AuctionDetail({
  auction: a, bidInput, setBidInput,
  autoBid, setAutoBid, autoBidMax, setAutoBidMax,
  onClose, onPlaceBid,
}: {
  auction:AuctionLoad
  bidInput:string; setBidInput:(v:string)=>void
  autoBid:boolean; setAutoBid:(v:boolean)=>void
  autoBidMax:string; setAutoBidMax:(v:string)=>void
  onClose:()=>void
  onPlaceBid:(id:string, amount:number)=>void
}) {
  const timerColor  = countdownColor(a.secondsLeft)
  const amWinning   = a.currentBidder.startsWith('Me')
  const outbid      = a.myBid !== undefined && !amWinning
  const isActive    = a.status === 'live' || a.status === 'ending'
  const bidVal      = parseFloat(bidInput || '0')
  const bidValid    = bidVal > a.currentBid
  const bidHistory  = AUCTION_BID_HISTORY[a.id] ?? []
  const payout      = Math.round(a.currentBid * a.miles)

  return (
    <div className="card" style={{ padding:0, overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1A2535,#2D7A9A)', padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginBottom:4 }}>
              🔨 AUCTION · {a.type} · {a.commodity}
            </div>
            <div style={{ fontWeight:900, fontSize:16, color:'#fff' }}>
              {a.from}, {a.fromState} → {a.to}, {a.toState}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>
              {a.miles.toLocaleString()} mi · {a.weight} · Pickup {a.pickup}
            </div>
          </div>
          <button onClick={onClose}
            style={{ background:'none', border:'none', color:'rgba(255,255,255,.5)', fontSize:18, cursor:'pointer' }}>
            ✕
          </button>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:14 }}>
          <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'8px 14px', textAlign:'center', flex:1 }}>
            <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>${a.currentBid.toFixed(2)}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>current bid/mi</div>
          </div>
          <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'8px 14px', textAlign:'center', flex:1 }}>
            <div style={{ fontSize:22, fontWeight:900, color:'#38C770' }}>${payout.toLocaleString()}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,.5)' }}>total payout</div>
          </div>
          {isActive && (
            <div style={{ background:'rgba(255,255,255,.08)', borderRadius:8, padding:'8px 14px', textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:900, color:timerColor, lineHeight:1 }}>
                {formatCountdown(a.secondsLeft)}
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,.5)', marginTop:4 }}>remaining</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ overflowY:'auto', maxHeight:560 }}>

        {/* My Bid Status */}
        {a.myBid !== undefined && (
          <div style={{
            margin:'14px 16px 0',
            padding:'10px 14px', borderRadius:10,
            background: amWinning ? '#F0FFF4' : '#FFF5F5',
            border: `1px solid ${amWinning?'#9AE6B4':'#FEB2B2'}`,
          }}>
            <div style={{ fontWeight:700, fontSize:13, color: amWinning?'#276749':'#C53030' }}>
              {amWinning ? '✅ You are currently winning!' : '⚠️ You\'ve been outbid!'}
            </div>
            <div style={{ fontSize:12, color:'#718096', marginTop:2 }}>
              Your bid: <strong>${a.myBid.toFixed(2)}/mi</strong>
              {!amWinning && <> · Current leader: <strong>${a.currentBid.toFixed(2)}/mi</strong> by {a.currentBidder}</>}
            </div>
          </div>
        )}

        {/* Bid History */}
        <div style={{ padding:'14px 16px 0' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#718096', marginBottom:8 }}>
            Bid History ({bidHistory.length} bids)
          </div>
          <div style={{ background:'#F4F6F9', borderRadius:10, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
              <thead>
                <tr style={{ background:'#EDF2F7' }}>
                  {['Time','Bidder','$/mi','vs Reserve'].map(h => (
                    <th key={h} style={{ padding:'6px 10px', textAlign:'left', fontWeight:700, color:'#718096', fontSize:10 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bidHistory.map((b, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #E2E8F0' }}>
                    <td style={{ padding:'7px 10px', color:'#A0AEC0' }}>{b.time}</td>
                    <td style={{ padding:'7px 10px', fontWeight:600, color: b.bidder.startsWith('Me')?'#4BAED4':'#2D3748' }}>{b.bidder}</td>
                    <td style={{ padding:'7px 10px', fontWeight:700, color:'#2D3748' }}>${b.amount.toFixed(2)}</td>
                    <td style={{ padding:'7px 10px', fontWeight:600,
                      color: b.amount >= a.reservePrice ? '#38C770' : '#F59E0B' }}>
                      {b.amount >= a.reservePrice ? '✓ Met' : `−$${(a.reservePrice - b.amount).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reserve hint */}
        <div style={{ padding:'10px 16px 0' }}>
          <div style={{ fontSize:12, padding:'8px 12px', borderRadius:8,
            background: a.currentBid >= a.reservePrice ? '#F0FFF4' : '#FFFBEB',
            color: a.currentBid >= a.reservePrice ? '#276749' : '#92400E',
            fontWeight:600,
          }}>
            {a.currentBid >= a.reservePrice
              ? `✅ Reserve met — shipper will accept current bid`
              : `⚠️ Reserve not yet met — min $${a.reservePrice.toFixed(2)}/mi required`
            }
          </div>
        </div>

        {/* Place Bid */}
        {isActive && (
          <div style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#718096', marginBottom:10 }}>Place Your Bid</div>

            {/* Quick bump buttons */}
            <div style={{ display:'flex', gap:6, marginBottom:8 }}>
              {[0.05, 0.10, 0.25].map(bump => (
                <button key={bump}
                  onClick={() => setBidInput((a.currentBid + bump).toFixed(2))}
                  style={{
                    padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:700,
                    background:'#EBF8FF', color:'#2B6CB0', border:'none', cursor:'pointer',
                  }}>
                  +${bump.toFixed(2)}
                </button>
              ))}
              <span style={{ fontSize:11, color:'#A0AEC0', alignSelf:'center', marginLeft:4 }}>
                vs current ${a.currentBid.toFixed(2)}
              </span>
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder={`> $${a.currentBid.toFixed(2)}/mi`}
                value={bidInput}
                onChange={e => setBidInput(e.target.value)}
                style={{ flex:1, fontSize:13 }}
              />
              <button
                disabled={!bidValid}
                onClick={() => bidValid && onPlaceBid(a.id, bidVal)}
                style={{
                  padding:'8px 18px', borderRadius:8, fontWeight:700, fontSize:13,
                  background: bidValid ? '#4BAED4' : '#E2E8F0',
                  color: bidValid ? '#fff' : '#A0AEC0',
                  border:'none', cursor: bidValid ? 'pointer' : 'not-allowed',
                }}>
                Submit Bid
              </button>
            </div>

            {bidInput && !bidValid && (
              <div style={{ fontSize:11, color:'#E53E3E', marginBottom:6 }}>
                Bid must be greater than current bid of ${a.currentBid.toFixed(2)}/mi
              </div>
            )}

            {bidInput && bidValid && (
              <div style={{ fontSize:11, color:'#718096', marginBottom:6 }}>
                Total payout at this rate: <strong>${Math.round(bidVal * a.miles).toLocaleString()}</strong>
              </div>
            )}

            {/* Autobid */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10,
              padding:'10px 12px', background:'#F4F6F9', borderRadius:8 }}>
              <input
                type="checkbox"
                id="autobid"
                checked={autoBid}
                onChange={e => setAutoBid(e.target.checked)}
                style={{ cursor:'pointer' }}
              />
              <label htmlFor="autobid" style={{ fontSize:12, fontWeight:600, color:'#2D3748', cursor:'pointer', flex:1 }}>
                Auto-bid up to
              </label>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="max $/mi"
                value={autoBidMax}
                onChange={e => setAutoBidMax(e.target.value)}
                disabled={!autoBid}
                style={{ width:90, fontSize:12, padding:'4px 8px', opacity: autoBid ? 1 : 0.4 }}
              />
              <span style={{ fontSize:12, color:'#718096' }}>/mi</span>
            </div>
          </div>
        )}

        {/* Closed / Won state */}
        {(a.status === 'closed' || a.status === 'won') && (
          <div style={{ padding:'14px 16px' }}>
            <div style={{
              padding:'14px 16px', borderRadius:10, textAlign:'center',
              background: a.status==='won' ? '#F0FFF4' : '#F4F6F9',
              border: a.status==='won' ? '1px solid #9AE6B4' : '1px solid #E2E8F0',
            }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{a.status==='won'?'🏆':'🔒'}</div>
              <div style={{ fontWeight:800, fontSize:15,
                color: a.status==='won'?'#276749':'#718096' }}>
                {a.status==='won' ? 'You won this auction!' : 'Auction Closed'}
              </div>
              <div style={{ fontSize:12, color:'#718096', marginTop:4 }}>
                Final price: <strong>${a.currentBid.toFixed(2)}/mi</strong>
                &nbsp;·&nbsp;Payout: <strong>${payout.toLocaleString()}</strong>
              </div>
              {a.status === 'won' && (
                <button className="btn btn-primary" style={{ marginTop:12, width:'100%', fontSize:13 }}>
                  📋 View Booking Details →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ booked, loads }: { booked:Set<string>; loads:Load[] }) {
  const bookedLoads = loads.filter(l => booked.has(l.id))
  const HISTORY = [
    { id:'h1', from:'Memphis, TN',  to:'Nashville, TN', payout:1120, rpm:2.24, date:'May 10', status:'Delivered', broker:'Echo Global'  },
    { id:'h2', from:'Houston, TX',  to:'Dallas, TX',    payout:890,  rpm:2.11, date:'May 8',  status:'Delivered', broker:'Coyote'       },
    { id:'h3', from:'Atlanta, GA',  to:'Miami, FL',     payout:1690, rpm:2.45, date:'May 5',  status:'Delivered', broker:'TQL'          },
    { id:'h4', from:'Chicago, IL',  to:'Detroit, MI',   payout:720,  rpm:2.00, date:'May 2',  status:'Delivered', broker:'CH Robinson'  },
    { id:'h5', from:'Dallas, TX',   to:'Phoenix, AZ',   payout:2250, rpm:2.18, date:'Apr 28', status:'Delivered', broker:'Transplace'   },
  ]
  const allHistory = [
    ...bookedLoads.map(l => ({ id:l.id, from:l.from+', '+l.fromState, to:l.to+', '+l.toState, payout:l.payout, rpm:l.rate, date:l.pickup, status:'Booked', broker:l.broker })),
    ...HISTORY,
  ]
  const totalEarnings = allHistory.reduce((s,l) => s+l.payout, 0)
  const avgRpm = allHistory.length ? (allHistory.reduce((s,l) => s+l.rpm, 0)/allHistory.length).toFixed(2) : '0'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total Loads',    value:`${allHistory.length}`,               color:'#4BAED4' },
          { label:'Total Earnings', value:`$${totalEarnings.toLocaleString()}`,  color:'#38C770' },
          { label:'Avg RPM',        value:`$${avgRpm}`,                          color:'#8B5CF6' },
          { label:'This Month',     value:`$${allHistory.filter(l=>l.date.startsWith('May')).reduce((s,l)=>s+l.payout,0).toLocaleString()}`, color:'#F59E0B' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTopColor:s.color }}>
            <div className="stat-value" style={{ color:s.color, fontSize:20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 className="section-title">Load History</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Route</th><th>Date</th><th>Broker</th><th>RPM</th><th>Payout</th><th>Status</th></tr>
            </thead>
            <tbody>
              {allHistory.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:600, fontSize:12 }}>{l.from} → {l.to}</td>
                  <td style={{ color:'#718096', fontSize:12 }}>{l.date}</td>
                  <td style={{ color:'#718096', fontSize:12 }}>{l.broker}</td>
                  <td style={{ color:'#38C770', fontWeight:700, fontSize:12 }}>${l.rpm.toFixed(2)}</td>
                  <td style={{ fontWeight:700, fontSize:12 }}>${l.payout.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${l.status==='Delivered'?'badge-success':'badge-primary'}`}>
                      ● {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
