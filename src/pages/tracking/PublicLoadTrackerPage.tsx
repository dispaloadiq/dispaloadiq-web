import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ShipmentStatus = 'In Transit' | 'At Pickup' | 'Delivered' | 'Delayed';
type TabId = 'overview' | 'documents' | 'temperature' | 'delivery';
type UpdateType = 'pickup' | 'transit' | 'checkpoint' | 'delay' | 'delivery';
type StepState = 'done' | 'active' | 'pending';

interface TimelineStep {
  id: string;
  label: string;
  icon: string;
  timestamp: string | null;
  state: StepState;
}

interface UpdateEvent {
  id: string;
  time: string;
  location: string;
  type: UpdateType;
  message: string;
}

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

interface DocumentItem {
  id: string;
  name: string;
  icon: string;
  status: 'available' | 'pending' | 'not_available';
  size: string;
}

interface TempPoint {
  hour: string;
  setPoint: number;
  actual: number;
}

interface Shipment {
  trackingNumber: string;
  loadRef: string;
  shipper: string;
  carrier: string;
  driver: string;
  truck: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  weight: string;
  commodity: string;
  temp: string | null;
  poNumber: string;
  status: ShipmentStatus;
  progress: number;
  loadType: string;
  originCoords: { x: number; y: number };
  destinationCoords: { x: number; y: number };
  distanceRemaining: string;
  eta: string;
  timeline: TimelineStep[];
  updates: UpdateEvent[];
  shipper_contact: ContactInfo;
  broker_contact: ContactInfo;
  carrier_contact: ContactInfo;
  loadNotes: string;
  specialInstructions: string;
  documents: DocumentItem[];
  tempLog: TempPoint[] | null;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const SHIPMENTS: Record<string, Shipment> = {
  'TRK-2024-8821': {
    trackingNumber: 'TRK-2024-8821',
    loadRef: 'LD-88210',
    shipper: 'Midwest Grain Co.',
    carrier: 'FastHaul Logistics LLC',
    driver: 'Marcus Thompson',
    truck: 'IL-4872 / Trailer: TRL-9923',
    origin: 'Chicago, IL',
    destination: 'Dallas, TX',
    estimatedDelivery: 'May 13, 2026 — 14:00 CST',
    weight: '42,000 lbs',
    commodity: 'Packaged Dry Goods',
    temp: null,
    poNumber: 'PO-2024-55190',
    status: 'In Transit',
    progress: 67,
    loadType: 'Dry Van',
    originCoords: { x: 480, y: 145 },
    destinationCoords: { x: 360, y: 290 },
    distanceRemaining: '412 mi',
    eta: '~8h 20m',
    timeline: [
      { id: 'placed', label: 'Order Placed', icon: '📋', timestamp: 'May 11 — 08:00', state: 'done' },
      { id: 'dispatched', label: 'Dispatched', icon: '📡', timestamp: 'May 11 — 10:15', state: 'done' },
      { id: 'pickup', label: 'At Pickup', icon: '🏭', timestamp: 'May 11 — 14:30', state: 'done' },
      { id: 'transit', label: 'In Transit', icon: '🚛', timestamp: 'May 12 — 06:00', state: 'active' },
      { id: 'near', label: 'Near Destination', icon: '📍', timestamp: null, state: 'pending' },
      { id: 'delivered', label: 'Delivered', icon: '✅', timestamp: null, state: 'pending' },
    ],
    updates: [
      { id: 'u1', time: '11:48 AM', location: 'Oklahoma City, OK', type: 'checkpoint', message: 'Checkpoint passed — on schedule' },
      { id: 'u2', time: '09:22 AM', location: 'Joplin, MO', type: 'transit', message: 'Truck en route, highway I-44' },
      { id: 'u3', time: '07:05 AM', location: 'Springfield, MO', type: 'checkpoint', message: 'Fuel stop — 18 min delay, now back on route' },
      { id: 'u4', time: 'May 11 — 6:00 PM', location: 'St. Louis, MO', type: 'checkpoint', message: 'State border crossing — IL/MO' },
      { id: 'u5', time: 'May 11 — 3:10 PM', location: 'Chicago, IL', type: 'transit', message: 'Load secured, doors sealed, departed facility' },
      { id: 'u6', time: 'May 11 — 2:30 PM', location: 'Chicago, IL', type: 'pickup', message: 'Loading completed at shipper facility' },
      { id: 'u7', time: 'May 11 — 10:15 AM', location: 'Chicago, IL', type: 'pickup', message: 'Driver Marcus Thompson assigned and dispatched' },
      { id: 'u8', time: 'May 11 — 8:00 AM', location: 'System', type: 'checkpoint', message: 'Load order confirmed and entered into system' },
    ],
    shipper_contact: { name: 'James Rourke', phone: '(312) 555-0182', email: 'jrourke@midwestgrain.com' },
    broker_contact: { name: 'Sarah Chen', phone: '(800) 555-0042', email: 'schen@dispaloadiq.com' },
    carrier_contact: { name: 'Dispatch — FastHaul', phone: '(630) 555-0093', email: 'dispatch@fasthaul.com' },
    loadNotes: 'Deliver to Dock 7 only. Call consignee 1 hour before arrival. No lumper service provided.',
    specialInstructions: 'Hazmat placard not required. Keep dry — do not leave trailer doors open in rain.',
    documents: [
      { id: 'd1', name: 'Bill of Lading (BOL)', icon: '📄', status: 'available', size: '142 KB' },
      { id: 'd2', name: 'Rate Confirmation', icon: '📃', status: 'available', size: '89 KB' },
      { id: 'd3', name: 'Proof of Delivery (POD)', icon: '🖊️', status: 'not_available', size: '—' },
      { id: 'd4', name: 'Insurance Certificate', icon: '🛡️', status: 'available', size: '210 KB' },
    ],
    tempLog: null,
  },

  'TRK-2024-9034': {
    trackingNumber: 'TRK-2024-9034',
    loadRef: 'LD-90340',
    shipper: 'Southern Fresh Produce',
    carrier: 'CoolChain Transport Inc.',
    driver: 'DeShawn Williams',
    truck: 'GA-7741 / Trailer: REF-4401',
    origin: 'Atlanta, GA',
    destination: 'Miami, FL',
    estimatedDelivery: 'May 13, 2026 — 09:00 EST',
    weight: '38,000 lbs',
    commodity: 'Fresh Produce (Strawberries)',
    temp: '34°F (set: 34°F)',
    poNumber: 'PO-2024-61003',
    status: 'At Pickup',
    progress: 15,
    loadType: 'Reefer',
    originCoords: { x: 570, y: 255 },
    destinationCoords: { x: 590, y: 345 },
    distanceRemaining: '663 mi',
    eta: '~11h 40m',
    timeline: [
      { id: 'placed', label: 'Order Placed', icon: '📋', timestamp: 'May 12 — 06:00', state: 'done' },
      { id: 'dispatched', label: 'Dispatched', icon: '📡', timestamp: 'May 12 — 07:30', state: 'done' },
      { id: 'pickup', label: 'At Pickup', icon: '🏭', timestamp: 'May 12 — 09:15', state: 'active' },
      { id: 'transit', label: 'In Transit', icon: '🚛', timestamp: null, state: 'pending' },
      { id: 'near', label: 'Near Destination', icon: '📍', timestamp: null, state: 'pending' },
      { id: 'delivered', label: 'Delivered', icon: '✅', timestamp: null, state: 'pending' },
    ],
    updates: [
      { id: 'u1', time: '09:45 AM', location: 'Atlanta, GA', type: 'pickup', message: 'Loading in progress — 60% complete' },
      { id: 'u2', time: '09:15 AM', location: 'Atlanta, GA', type: 'pickup', message: 'Driver arrived at shipper facility, dock assignment received' },
      { id: 'u3', time: '07:30 AM', location: 'Atlanta, GA', type: 'transit', message: 'Driver DeShawn Williams dispatched to shipper' },
      { id: 'u4', time: '07:10 AM', location: 'Atlanta, GA', type: 'checkpoint', message: 'Reefer unit pre-cooled to 34°F — ready' },
      { id: 'u5', time: '06:00 AM', location: 'System', type: 'checkpoint', message: 'Load order TRK-2024-9034 created' },
      { id: 'u6', time: 'May 11 — 5:00 PM', location: 'System', type: 'checkpoint', message: 'Rate confirmed with CoolChain Transport' },
      { id: 'u7', time: 'May 11 — 3:45 PM', location: 'System', type: 'pickup', message: 'Carrier assigned: CoolChain Transport Inc.' },
      { id: 'u8', time: 'May 11 — 2:00 PM', location: 'System', type: 'checkpoint', message: 'Load posted and carrier search initiated' },
    ],
    shipper_contact: { name: 'Maria Gonzalez', phone: '(404) 555-0217', email: 'mgonzalez@southernfresh.com' },
    broker_contact: { name: 'Sarah Chen', phone: '(800) 555-0042', email: 'schen@dispaloadiq.com' },
    carrier_contact: { name: 'Dispatch — CoolChain', phone: '(770) 555-0134', email: 'ops@coolchaintransport.com' },
    loadNotes: 'Temperature must be maintained at 34°F throughout transit. No pallet exchange. Tailgate delivery.',
    specialInstructions: 'Receiver requires 2-hour call ahead. Dock hours: 6AM–4PM. No weekend deliveries.',
    documents: [
      { id: 'd1', name: 'Bill of Lading (BOL)', icon: '📄', status: 'available', size: '138 KB' },
      { id: 'd2', name: 'Rate Confirmation', icon: '📃', status: 'available', size: '92 KB' },
      { id: 'd3', name: 'Proof of Delivery (POD)', icon: '🖊️', status: 'not_available', size: '—' },
      { id: 'd4', name: 'Insurance Certificate', icon: '🛡️', status: 'available', size: '198 KB' },
    ],
    tempLog: [
      { hour: '12AM', setPoint: 34, actual: 34 },
      { hour: '2AM', setPoint: 34, actual: 34 },
      { hour: '4AM', setPoint: 34, actual: 33 },
      { hour: '6AM', setPoint: 34, actual: 34 },
      { hour: '8AM', setPoint: 34, actual: 35 },
      { hour: '10AM', setPoint: 34, actual: 34 },
      { hour: '11AM', setPoint: 34, actual: 34 },
    ],
  },

  'TRK-2024-7710': {
    trackingNumber: 'TRK-2024-7710',
    loadRef: 'LD-77100',
    shipper: 'Pacific Steel Works',
    carrier: 'West Coast Haulers LLC',
    driver: 'Carlos Mendez',
    truck: 'CA-3318 / Trailer: FLT-8812',
    origin: 'Los Angeles, CA',
    destination: 'Seattle, WA',
    estimatedDelivery: 'May 12, 2026 — 10:30 PST',
    weight: '44,000 lbs',
    commodity: 'Steel Coils',
    temp: null,
    poNumber: 'PO-2024-47820',
    status: 'Delivered',
    progress: 100,
    loadType: 'Flatbed',
    originCoords: { x: 80, y: 230 },
    destinationCoords: { x: 75, y: 80 },
    distanceRemaining: '0 mi',
    eta: 'Delivered',
    timeline: [
      { id: 'placed', label: 'Order Placed', icon: '📋', timestamp: 'May 9 — 09:00', state: 'done' },
      { id: 'dispatched', label: 'Dispatched', icon: '📡', timestamp: 'May 9 — 11:00', state: 'done' },
      { id: 'pickup', label: 'At Pickup', icon: '🏭', timestamp: 'May 9 — 15:00', state: 'done' },
      { id: 'transit', label: 'In Transit', icon: '🚛', timestamp: 'May 10 — 07:00', state: 'done' },
      { id: 'near', label: 'Near Destination', icon: '📍', timestamp: 'May 12 — 08:00', state: 'done' },
      { id: 'delivered', label: 'Delivered', icon: '✅', timestamp: 'May 12 — 10:27', state: 'done' },
    ],
    updates: [
      { id: 'u1', time: '10:27 AM', location: 'Seattle, WA', type: 'delivery', message: 'Delivery confirmed — receiver signed at 10:27 AM' },
      { id: 'u2', time: '08:05 AM', location: 'Tacoma, WA', type: 'checkpoint', message: 'Near destination — 35 miles out, ETA confirmed' },
      { id: 'u3', time: 'May 11 — 9:30 PM', location: 'Portland, OR', type: 'checkpoint', message: 'Overnight stop — Portland truck stop' },
      { id: 'u4', time: 'May 11 — 2:15 PM', location: 'Medford, OR', type: 'transit', message: 'Passed weigh station — all clear' },
      { id: 'u5', time: 'May 10 — 6:00 PM', location: 'Sacramento, CA', type: 'checkpoint', message: 'Fuel stop — continuing north on I-5' },
      { id: 'u6', time: 'May 10 — 7:00 AM', location: 'Los Angeles, CA', type: 'transit', message: 'Departed Los Angeles — heading north on I-5' },
      { id: 'u7', time: 'May 9 — 3:00 PM', location: 'Los Angeles, CA', type: 'pickup', message: 'Steel coils loaded and tarped — load secured' },
      { id: 'u8', time: 'May 9 — 11:00 AM', location: 'Los Angeles, CA', type: 'pickup', message: 'Driver Carlos Mendez dispatched to Pacific Steel Works' },
    ],
    shipper_contact: { name: 'Brian Nakamura', phone: '(213) 555-0076', email: 'bnakamura@pacificsteel.com' },
    broker_contact: { name: 'Tom Reyes', phone: '(800) 555-0042', email: 'treyes@dispaloadiq.com' },
    carrier_contact: { name: 'Dispatch — WCH', phone: '(503) 555-0228', email: 'dispatch@wchaulers.com' },
    loadNotes: 'Flatbed load — steel coils require tarping per shipper requirement. Secure with 6 chains minimum.',
    specialInstructions: 'Receiver at Seattle Metalworks requires approved carrier safety certificate on arrival.',
    documents: [
      { id: 'd1', name: 'Bill of Lading (BOL)', icon: '📄', status: 'available', size: '155 KB' },
      { id: 'd2', name: 'Rate Confirmation', icon: '📃', status: 'available', size: '101 KB' },
      { id: 'd3', name: 'Proof of Delivery (POD)', icon: '🖊️', status: 'available', size: '320 KB' },
      { id: 'd4', name: 'Insurance Certificate', icon: '🛡️', status: 'available', size: '198 KB' },
    ],
    tempLog: null,
  },
};

const DEMO_TRACKING_NUMBERS = ['TRK-2024-8821', 'TRK-2024-9034', 'TRK-2024-7710'];

// ─── Style helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ShipmentStatus, { bg: string; color: string }> = {
  'In Transit': { bg: '#EBF8FF', color: '#2B6CB0' },
  'At Pickup': { bg: '#FFFBEB', color: '#B7791F' },
  'Delivered': { bg: '#F0FFF4', color: '#276749' },
  'Delayed': { bg: '#FFF5F5', color: '#C53030' },
};

const UPDATE_TYPE_COLORS: Record<UpdateType, string> = {
  pickup: '#D97706',
  transit: '#2563EB',
  checkpoint: '#059669',
  delay: '#DC2626',
  delivery: '#7C3AED',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// CSS animation injected once at module level into a style tag
const PULSE_STYLE = `
@keyframes dliq-pulse-scale {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.6); opacity: 0.7; }
}
@keyframes dliq-glow-ring {
  0%, 100% { box-shadow: 0 0 0 3px rgba(75,174,212,0.35); }
  50% { box-shadow: 0 0 0 7px rgba(75,174,212,0.1); }
}
.dliq-pulse-dot { animation: dliq-pulse-scale 1s ease-in-out infinite; }
.dliq-step-active { animation: dliq-glow-ring 1.2s ease-in-out infinite; }
`;

function PulsingDot({ color }: { color: string }) {
  return (
    <span
      className="dliq-pulse-dot"
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 6,
      }}
    />
  );
}

function StepIndicator({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const circleColor =
    step.state === 'done'
      ? '#4BAED4'
      : step.state === 'active'
      ? '#4BAED4'
      : '#CBD5E0';

  const lineColor = step.state === 'done' ? '#4BAED4' : '#E2E8F0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 8 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: circleColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            flexShrink: 0,
            transition: 'background-color 0.4s ease',
            boxShadow: step.state === 'active' ? '0 0 0 4px rgba(75,174,212,0.25)' : 'none',
          }}
        >
          {step.icon}
        </div>
        {!isLast && (
          <div
            style={{
              flex: 1,
              height: 3,
              backgroundColor: lineColor,
              transition: 'background-color 0.4s ease',
            }}
          />
        )}
      </div>
      <div style={{ textAlign: 'center', paddingRight: isLast ? 0 : 4 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: step.state === 'active' ? 700 : 500,
            color: step.state === 'pending' ? '#A0AEC0' : '#1A2535',
          }}
        >
          {step.label}
        </div>
        {step.timestamp && (
          <div style={{ fontSize: 10, color: '#718096', marginTop: 2 }}>{step.timestamp}</div>
        )}
        {!step.timestamp && step.state === 'pending' && (
          <div style={{ fontSize: 10, color: '#CBD5E0', marginTop: 2 }}>Pending</div>
        )}
      </div>
    </div>
  );
}

function MapSVG({ shipment }: { shipment: Shipment }) {
  const { originCoords: oc, destinationCoords: dc } = shipment;

  // Truck position at ~progress% of the route
  const pct = shipment.progress / 100;
  const truckX = oc.x + (dc.x - oc.x) * pct;
  const truckY = oc.y + (dc.y - oc.y) * pct;

  // Mid-control point for a gentle curve
  const midX = (oc.x + dc.x) / 2 + 30;
  const midY = (oc.y + dc.y) / 2 - 20;

  const pathD = `M ${oc.x} ${oc.y} Q ${midX} ${midY} ${dc.x} ${dc.y}`;

  return (
    <div
      style={{
        position: 'relative',
        background: '#EBF4FB',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #BEE3F8',
      }}
    >
      <svg
        viewBox="0 0 700 400"
        width="100%"
        style={{ display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="700" height="400" fill="#EBF4FB" />

        {/* Rough US outline hint — simplified rectangle with rounded corners */}
        <rect x="30" y="40" width="640" height="320" rx="8" fill="#D6EAF5" stroke="#BEE3F8" strokeWidth="1.5" />

        {/* State grid lines — subtle */}
        {[160, 290, 420, 550].map((x) => (
          <line key={x} x1={x} y1="40" x2={x} y2="360" stroke="#C3DAE8" strokeWidth="0.5" strokeDasharray="4,4" />
        ))}
        {[130, 220, 310].map((y) => (
          <line key={y} x1="30" y1={y} x2="670" y2={y} stroke="#C3DAE8" strokeWidth="0.5" strokeDasharray="4,4" />
        ))}

        {/* State labels */}
        <text x="100" y="100" fontSize="11" fill="#94B8CA" fontWeight="500">WA</text>
        <text x="100" y="200" fontSize="11" fill="#94B8CA" fontWeight="500">OR</text>
        <text x="100" y="280" fontSize="11" fill="#94B8CA" fontWeight="500">CA</text>
        <text x="210" y="120" fontSize="11" fill="#94B8CA" fontWeight="500">MT</text>
        <text x="210" y="240" fontSize="11" fill="#94B8CA" fontWeight="500">NV</text>
        <text x="340" y="120" fontSize="11" fill="#94B8CA" fontWeight="500">ND</text>
        <text x="340" y="200" fontSize="11" fill="#94B8CA" fontWeight="500">SD</text>
        <text x="340" y="270" fontSize="11" fill="#94B8CA" fontWeight="500">CO</text>
        <text x="340" y="320" fontSize="11" fill="#94B8CA" fontWeight="500">NM</text>
        <text x="460" y="150" fontSize="11" fill="#94B8CA" fontWeight="500">MN</text>
        <text x="460" y="200" fontSize="11" fill="#94B8CA" fontWeight="500">IA</text>
        <text x="460" y="240" fontSize="11" fill="#94B8CA" fontWeight="500">MO</text>
        <text x="460" y="300" fontSize="11" fill="#94B8CA" fontWeight="500">TX</text>
        <text x="575" y="140" fontSize="11" fill="#94B8CA" fontWeight="500">WI</text>
        <text x="575" y="185" fontSize="11" fill="#94B8CA" fontWeight="500">IL</text>
        <text x="575" y="225" fontSize="11" fill="#94B8CA" fontWeight="500">KY</text>
        <text x="575" y="265" fontSize="11" fill="#94B8CA" fontWeight="500">TN</text>
        <text x="575" y="305" fontSize="11" fill="#94B8CA" fontWeight="500">MS</text>
        <text x="615" y="145" fontSize="11" fill="#94B8CA" fontWeight="500">MI</text>
        <text x="615" y="185" fontSize="11" fill="#94B8CA" fontWeight="500">IN</text>
        <text x="615" y="225" fontSize="11" fill="#94B8CA" fontWeight="500">OH</text>
        <text x="615" y="265" fontSize="11" fill="#94B8CA" fontWeight="500">GA</text>
        <text x="615" y="305" fontSize="11" fill="#94B8CA" fontWeight="500">FL</text>

        {/* Route path — dashed */}
        <path
          d={pathD}
          fill="none"
          stroke="#4BAED4"
          strokeWidth="2.5"
          strokeDasharray="8,5"
          opacity="0.7"
        />

        {/* Completed route — solid */}
        {shipment.progress > 0 && (
          <path
            d={`M ${oc.x} ${oc.y} Q ${midX} ${midY} ${truckX} ${truckY}`}
            fill="none"
            stroke="#4BAED4"
            strokeWidth="3"
          />
        )}

        {/* Origin dot */}
        <circle cx={oc.x} cy={oc.y} r="10" fill="#48BB78" stroke="#fff" strokeWidth="2" />
        <circle cx={oc.x} cy={oc.y} r="4" fill="#fff" />
        <text x={oc.x + 13} y={oc.y - 10} fontSize="11" fill="#276749" fontWeight="600">
          {shipment.origin}
        </text>

        {/* Destination dot */}
        <circle cx={dc.x} cy={dc.y} r="10" fill="#FC8181" stroke="#fff" strokeWidth="2" />
        <circle cx={dc.x} cy={dc.y} r="4" fill="#fff" />
        <text x={dc.x + 13} y={dc.y - 10} fontSize="11" fill="#C53030" fontWeight="600">
          {shipment.destination}
        </text>

        {/* Truck marker */}
        {shipment.progress > 0 && shipment.progress < 100 && (
          <>
            <circle cx={truckX} cy={truckY} r="16" fill="#1A2535" stroke="#4BAED4" strokeWidth="2.5" />
            <text x={truckX} y={truckY + 5} textAnchor="middle" fontSize="14">
              🚛
            </text>
          </>
        )}

        {/* Delivered marker */}
        {shipment.progress === 100 && (
          <>
            <circle cx={dc.x} cy={dc.y} r="16" fill="#276749" stroke="#fff" strokeWidth="2.5" />
            <text x={dc.x} y={dc.y + 5} textAnchor="middle" fontSize="14">
              ✅
            </text>
          </>
        )}
      </svg>

      {/* Overlaid badges */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 8,
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            background: '#1A2535',
            color: '#fff',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {shipment.distanceRemaining} remaining
        </div>
        <div
          style={{
            background: '#4BAED4',
            color: '#fff',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ETA: {shipment.eta}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '8px 12px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#4A5568' }}>Route Progress</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#1A2535' }}>{shipment.progress}%</span>
        </div>
        <div style={{ height: 6, background: '#BEE3F8', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${shipment.progress}%`,
              background: shipment.progress === 100 ? '#48BB78' : '#4BAED4',
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function TempChart({ data }: { data: TempPoint[] }) {
  const minTemp = 30;
  const maxTemp = 40;
  const chartH = 120;
  const chartW = 460;
  const padL = 36;
  const padR = 12;
  const padT = 10;
  const padB = 28;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const toX = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const toY = (val: number) => padT + innerH - ((val - minTemp) / (maxTemp - minTemp)) * innerH;

  const setPoints = data.map((d, i) => `${toX(i)},${toY(d.setPoint)}`).join(' ');
  const actuals = data.map((d, i) => `${toX(i)},${toY(d.actual)}`).join(' ');

  const temps = data.map((d) => d.actual);
  const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const hasAlert = data.some((d) => Math.abs(d.actual - d.setPoint) > 2);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            background: '#F0FFF4',
            border: '1px solid #C6F6D5',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 12,
          }}
        >
          <span style={{ color: '#718096' }}>Min: </span>
          <span style={{ fontWeight: 700, color: '#276749' }}>{min}°F</span>
        </div>
        <div
          style={{
            background: '#FFF5F5',
            border: '1px solid #FED7D7',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 12,
          }}
        >
          <span style={{ color: '#718096' }}>Max: </span>
          <span style={{ fontWeight: 700, color: '#C53030' }}>{max}°F</span>
        </div>
        <div
          style={{
            background: '#EBF8FF',
            border: '1px solid #BEE3F8',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 12,
          }}
        >
          <span style={{ color: '#718096' }}>Avg: </span>
          <span style={{ fontWeight: 700, color: '#2B6CB0' }}>{avg}°F</span>
        </div>
        {hasAlert && (
          <div
            style={{
              background: '#FFF5F5',
              border: '1px solid #FC8181',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              color: '#C53030',
              fontWeight: 600,
            }}
          >
            ⚠ Temperature excursion detected
          </div>
        )}
      </div>

      <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block', overflow: 'visible' }}>
        {/* Grid lines */}
        {[30, 32, 34, 36, 38, 40].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              y1={toY(t)}
              x2={chartW - padR}
              y2={toY(t)}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
            <text x={padL - 4} y={toY(t) + 4} fontSize="9" fill="#A0AEC0" textAnchor="end">
              {t}°
            </text>
          </g>
        ))}

        {/* Set point line */}
        <polyline
          points={setPoints}
          fill="none"
          stroke="#FC8181"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />

        {/* Actual temp line */}
        <polyline points={actuals} fill="none" stroke="#4BAED4" strokeWidth="2.5" />

        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={toX(i)} cy={toY(d.actual)} r="4" fill="#4BAED4" stroke="#fff" strokeWidth="1.5" />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text key={i} x={toX(i)} y={chartH - 4} fontSize="9" fill="#A0AEC0" textAnchor="middle">
            {d.hour}
          </text>
        ))}

        {/* Legend */}
        <line x1={padL} y1={chartH - 12} x2={padL + 18} y2={chartH - 12} stroke="#4BAED4" strokeWidth="2.5" />
        <text x={padL + 22} y={chartH - 8} fontSize="9" fill="#4A5568">Actual</text>
        <line x1={padL + 70} y1={chartH - 12} x2={padL + 88} y2={chartH - 12} stroke="#FC8181" strokeWidth="1.5" strokeDasharray="5,3" />
        <text x={padL + 92} y={chartH - 8} fontSize="9" fill="#4A5568">Set Point</text>
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PublicLoadTrackerPage() {
  const [searchInput, setSearchInput] = useState('TRK-2024-8821');
  const [activeTracking, setActiveTracking] = useState('TRK-2024-8821');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySms, setNotifySms] = useState('');
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [smsSubscribed, setSmsSubscribed] = useState(false);
  const [notifyEvents, setNotifyEvents] = useState({
    pickup: true,
    checkpoint: false,
    delay: true,
    delivered: true,
  });
  const [receiverName, setReceiverName] = useState('');
  const [receiverTime, setReceiverTime] = useState('');
  const [searchError, setSearchError] = useState('');

  const shipment = SHIPMENTS[activeTracking] ?? SHIPMENTS['TRK-2024-8821'];
  const statusColors = STATUS_COLORS[shipment.status];

  function handleSearch() {
    const trimmed = searchInput.trim().toUpperCase();
    if (SHIPMENTS[trimmed]) {
      setActiveTracking(trimmed);
      setSearchError('');
      setActiveTab('overview');
    } else {
      setSearchError(`No shipment found for "${searchInput}". Try one of the demo numbers below.`);
    }
  }

  function handleChipClick(num: string) {
    setSearchInput(num);
    setActiveTracking(num);
    setSearchError('');
    setActiveTab('overview');
  }

  function toggleNotifyEvent(key: keyof typeof notifyEvents) {
    setNotifyEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const docStatusStyle = (status: DocumentItem['status']) => {
    if (status === 'available') return { color: '#276749', fontWeight: 600 };
    if (status === 'pending') return { color: '#B7791F', fontWeight: 600 };
    return { color: '#A0AEC0', fontWeight: 500 };
  };

  const docStatusLabel = (status: DocumentItem['status']) => {
    if (status === 'available') return '✓ Available';
    if (status === 'pending') return '⏳ Pending';
    return '— Not yet available';
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{PULSE_STYLE}</style>
    <div
      style={{
        minHeight: '100vh',
        background: '#F7FAFC',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#1A2535',
      }}
    >
      {/* ── Top Banner */}
      <div
        style={{
          background: '#1A2535',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: 12,
          letterSpacing: '0.02em',
        }}
      >
        🔓 Public tracking page — no login required &nbsp;·&nbsp; Share this link with your customers
      </div>

      {/* ── Header */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #4BAED4 0%, #1A2535 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🚛
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1A2535', lineHeight: 1 }}>
                DispaLoadIQ
              </div>
              <div style={{ fontSize: 10, color: '#718096', letterSpacing: '0.05em' }}>
                POWERED BY DISPALOADIQ
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter BOL, tracking #, or PO number..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1.5px solid #CBD5E0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  color: '#1A2535',
                  background: '#F7FAFC',
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  padding: '10px 20px',
                  background: '#4BAED4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Track
              </button>
            </div>
            {searchError && (
              <div style={{ color: '#C53030', fontSize: 12, marginTop: 4 }}>{searchError}</div>
            )}
          </div>

          {/* Demo chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, color: '#A0AEC0', marginBottom: 2 }}>Demo tracking numbers:</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DEMO_TRACKING_NUMBERS.map((num) => (
                <button
                  key={num}
                  onClick={() => handleChipClick(num)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 16,
                    border: `1.5px solid ${activeTracking === num ? '#4BAED4' : '#CBD5E0'}`,
                    background: activeTracking === num ? '#EBF8FF' : '#fff',
                    color: activeTracking === num ? '#2B6CB0' : '#4A5568',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Shipment Header Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 2 }}>Tracking Number</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2535', letterSpacing: '-0.02em' }}>
                {shipment.trackingNumber}
              </div>
              <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
                Load Ref: <strong style={{ color: '#1A2535' }}>{shipment.loadRef}</strong>
                &nbsp;·&nbsp; PO: <strong style={{ color: '#1A2535' }}>{shipment.poNumber}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  background: statusColors.bg,
                  color: statusColors.color,
                  border: `1.5px solid ${statusColors.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {shipment.status === 'In Transit' && <PulsingDot color={statusColors.color} />}
                {shipment.status === 'At Pickup' && <PulsingDot color={statusColors.color} />}
                {shipment.status}
              </div>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: '#F0F4F8',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#4A5568',
                }}
              >
                {shipment.loadType}
              </div>
            </div>
          </div>

          {/* Fields grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px 24px',
            }}
          >
            {[
              { label: 'Shipper', value: shipment.shipper },
              { label: 'Carrier', value: shipment.carrier },
              { label: 'Driver', value: shipment.driver },
              { label: 'Truck / Trailer', value: shipment.truck },
              { label: 'Origin', value: shipment.origin },
              { label: 'Destination', value: shipment.destination },
              { label: 'Est. Delivery', value: shipment.estimatedDelivery },
              { label: 'Weight', value: shipment.weight },
              { label: 'Commodity', value: shipment.commodity },
              ...(shipment.temp ? [{ label: 'Temperature', value: shipment.temp }] : []),
            ].map((field) => (
              <div key={field.label}>
                <div style={{ fontSize: 10, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {field.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{field.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Shipment Timeline</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: 4 }}>
            {shipment.timeline.map((step, i) => (
              <StepIndicator key={step.id} step={step} isLast={i === shipment.timeline.length - 1} />
            ))}
          </div>
        </div>

        {/* ── Map + Updates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

          {/* Map */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              Live Route Map
            </div>
            <MapSVG shipment={shipment} />
          </div>

          {/* Updates Feed */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Real-Time Updates</div>
              <div
                style={{
                  fontSize: 10,
                  color: '#48BB78',
                  fontWeight: 600,
                  background: '#F0FFF4',
                  border: '1px solid #C6F6D5',
                  borderRadius: 12,
                  padding: '3px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#48BB78',
                    display: 'inline-block',
                  }}
                />
                Last updated 2 min ago
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shipment.updates.map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    paddingBottom: 10,
                    borderBottom: '1px solid #F0F4F8',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: UPDATE_TYPE_COLORS[event.type],
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2535', marginBottom: 1 }}>
                      {event.message}
                    </div>
                    <div style={{ fontSize: 11, color: '#718096' }}>
                      {event.location} &nbsp;·&nbsp; {event.time}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 10,
                      background: `${UPDATE_TYPE_COLORS[event.type]}18`,
                      color: UPDATE_TYPE_COLORS[event.type],
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      alignSelf: 'flex-start',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Detail Tabs */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              background: '#F7FAFC',
            }}
          >
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'documents', label: 'Documents' },
                { id: 'temperature', label: 'Temperature Log' },
                { id: 'delivery', label: 'Delivery Confirmation' },
              ] as { id: TabId; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '13px 22px',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #4BAED4' : '3px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 13,
                  color: activeTab === tab.id ? '#4BAED4' : '#718096',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
                {tab.id === 'temperature' && !shipment.tempLog && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 9,
                      color: '#A0AEC0',
                      fontWeight: 500,
                    }}
                  >
                    (N/A)
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '24px' }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Contacts */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#1A2535' }}>
                    Contacts
                  </div>
                  {(
                    [
                      { role: 'Shipper', contact: shipment.shipper_contact },
                      { role: 'Broker', contact: shipment.broker_contact },
                      { role: 'Carrier', contact: shipment.carrier_contact },
                    ]
                  ).map(({ role, contact }) => (
                    <div
                      key={role}
                      style={{
                        marginBottom: 14,
                        padding: '12px 14px',
                        background: '#F7FAFC',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ fontSize: 10, color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        {role}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{contact.name}</div>
                      <div style={{ fontSize: 12, color: '#4BAED4', marginBottom: 1 }}>{contact.phone}</div>
                      <div style={{ fontSize: 12, color: '#718096' }}>{contact.email}</div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#1A2535' }}>
                    Load Notes
                  </div>
                  <div
                    style={{
                      padding: '14px',
                      background: '#FFFBEB',
                      borderRadius: 8,
                      border: '1px solid #FDE68A',
                      fontSize: 13,
                      color: '#1A2535',
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    {shipment.loadNotes}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1A2535' }}>
                    Special Instructions
                  </div>
                  <div
                    style={{
                      padding: '14px',
                      background: '#FFF5F5',
                      borderRadius: 8,
                      border: '1px solid #FED7D7',
                      fontSize: 13,
                      color: '#1A2535',
                      lineHeight: 1.6,
                    }}
                  >
                    {shipment.specialInstructions}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Shipment Documents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {shipment.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '14px 16px',
                        background: '#F7FAFC',
                        borderRadius: 10,
                        border: `1px solid ${doc.status === 'available' ? '#BEE3F8' : '#E2E8F0'}`,
                        gap: 14,
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{doc.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>
                          {doc.status === 'available' ? doc.size : 'Not yet available'}
                        </div>
                      </div>
                      <div style={docStatusStyle(doc.status)}>{docStatusLabel(doc.status)}</div>
                      {doc.status === 'available' && (
                        <button
                          style={{
                            padding: '6px 14px',
                            background: '#4BAED4',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Temperature Log Tab */}
            {activeTab === 'temperature' && (
              <div>
                {shipment.tempLog ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
                      Temperature Log — Last 24 Hours
                    </div>
                    <TempChart data={shipment.tempLog} />
                  </>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#A0AEC0',
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🌡️</div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                      Temperature Monitoring Not Applicable
                    </div>
                    <div style={{ fontSize: 13 }}>
                      This shipment is a {shipment.loadType} load and does not require temperature monitoring.
                      Temperature logs are available for Reefer loads only.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery Confirmation Tab */}
            {activeTab === 'delivery' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                {/* Left: Signature + Form */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Delivery Confirmation</div>

                  {/* Signature placeholder */}
                  <div
                    style={{
                      border: '2px dashed #CBD5E0',
                      borderRadius: 10,
                      padding: '32px 20px',
                      textAlign: 'center',
                      background: '#F7FAFC',
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✍️</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#4A5568', marginBottom: 4 }}>
                      Signature Capture
                    </div>
                    <div style={{ fontSize: 12, color: '#A0AEC0' }}>
                      {shipment.status === 'Delivered'
                        ? 'Signature captured on delivery.'
                        : 'Signature will be captured at delivery by the driver.'}
                    </div>
                  </div>

                  {/* Receiver form */}
                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 4 }}
                    >
                      Receiver Name
                    </label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Full name of receiver..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid #CBD5E0',
                        borderRadius: 7,
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                        background: shipment.status === 'Delivered' ? '#F0FFF4' : '#fff',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 4 }}
                    >
                      Time of Receipt
                    </label>
                    <input
                      type="datetime-local"
                      value={receiverTime}
                      onChange={(e) => setReceiverTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1.5px solid #CBD5E0',
                        borderRadius: 7,
                        fontSize: 13,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Right: Photo upload slots */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Delivery Photos</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      'Cargo at dock',
                      'Seal number',
                      'Unloading confirmation',
                      'Receiver stamp',
                    ].map((label, i) => (
                      <div
                        key={i}
                        style={{
                          border: '2px dashed #CBD5E0',
                          borderRadius: 10,
                          padding: '24px 12px',
                          textAlign: 'center',
                          background: '#F7FAFC',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#4A5568', marginBottom: 2 }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 10, color: '#A0AEC0' }}>
                          {shipment.status === 'Delivered' ? 'Photo uploaded' : 'Tap to upload'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Notifications Subscribe Panel */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            Get Shipment Notifications
          </div>
          <div style={{ fontSize: 13, color: '#718096', marginBottom: 20 }}>
            Subscribe to receive real-time updates about this shipment via email or SMS.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, alignItems: 'start' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 6 }}>
                Email Notifications
              </label>
              {emailSubscribed ? (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#F0FFF4',
                    border: '1.5px solid #C6F6D5',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#276749',
                    fontWeight: 600,
                  }}
                >
                  ✓ Subscribed: {notifyEmail}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      border: '1.5px solid #CBD5E0',
                      borderRadius: 7,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => notifyEmail && setEmailSubscribed(true)}
                    style={{
                      padding: '9px 14px',
                      background: '#4BAED4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </div>

            {/* SMS */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', display: 'block', marginBottom: 6 }}>
                SMS Notifications
              </label>
              {smsSubscribed ? (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#F0FFF4',
                    border: '1.5px solid #C6F6D5',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#276749',
                    fontWeight: 600,
                  }}
                >
                  ✓ Subscribed: {notifySms}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="tel"
                    value={notifySms}
                    onChange={(e) => setNotifySms(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      border: '1.5px solid #CBD5E0',
                      borderRadius: 7,
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => notifySms && setSmsSubscribed(true)}
                    style={{
                      padding: '9px 14px',
                      background: '#4BAED4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </div>

            {/* Event checkboxes */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 8 }}>
                Notify me on:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(
                  [
                    { key: 'pickup', label: 'Pickup confirmed' },
                    { key: 'checkpoint', label: 'Each checkpoint passed' },
                    { key: 'delay', label: 'Delay alert' },
                    { key: 'delivered', label: 'Delivered' },
                  ] as { key: keyof typeof notifyEvents; label: string }[]
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}
                  >
                    <input
                      type="checkbox"
                      checked={notifyEvents[key]}
                      onChange={() => toggleNotifyEvent(key)}
                      style={{ width: 15, height: 15, accentColor: '#4BAED4', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#1A2535' }}>{label}</span>
                  </label>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 10 }}>
                You'll receive updates via your subscribed channels.
              </div>
            </div>
          </div>
        </div>

        {/* ── Other Demo Shipments */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Other Demo Shipments</div>
          <div style={{ fontSize: 13, color: '#718096', marginBottom: 16 }}>
            Click to switch between demo tracking numbers.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {Object.values(SHIPMENTS).map((s) => {
              const sc = STATUS_COLORS[s.status];
              const isActive = s.trackingNumber === activeTracking;
              return (
                <button
                  key={s.trackingNumber}
                  onClick={() => {
                    setActiveTracking(s.trackingNumber);
                    setSearchInput(s.trackingNumber);
                    setActiveTab('overview');
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: 10,
                    border: `2px solid ${isActive ? '#4BAED4' : '#E2E8F0'}`,
                    background: isActive ? '#EBF8FF' : '#F7FAFC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1A2535' }}>
                      {s.trackingNumber}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: sc.bg,
                        color: sc.color,
                        fontWeight: 600,
                      }}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#4A5568', marginBottom: 4 }}>
                    {s.origin} → {s.destination}
                  </div>
                  <div style={{ fontSize: 11, color: '#718096', marginBottom: 8 }}>
                    {s.loadType} · {s.weight}
                  </div>
                  <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${s.progress}%`,
                        background: s.progress === 100 ? '#48BB78' : '#4BAED4',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 4 }}>
                    {s.progress}% complete
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '20px 0 8px',
            borderTop: '1px solid #E2E8F0',
            color: '#A0AEC0',
            fontSize: 12,
          }}
        >
          <div style={{ marginBottom: 4 }}>
            Powered by{' '}
            <strong style={{ color: '#4BAED4' }}>DispaLoadIQ</strong> — Intelligent Dispatch &amp; Load Management
          </div>
          <div>© 2026 DispaLoadIQ. This is a public tracking page. No account required.</div>
        </footer>
      </main>
    </div>
    </>
  );
}
