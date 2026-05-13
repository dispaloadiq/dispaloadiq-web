import { useState, useMemo } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type DocType   = 'BOL' | 'POD' | 'Invoice' | 'IFTA' | 'Rate Con' | 'Insurance' | 'Other'
type DocStatus = 'Signed' | 'Pending' | 'Overdue' | 'Uploaded' | 'Sent'
type MainTab   = 'all' | 'compliance' | 'bundles' | 'templates' | 'calendar'

interface Doc {
  id: string
  name: string
  type: DocType
  status: DocStatus
  loadRef?: string
  date: string
  size: string
  uploadedBy: string
  tags?: string[]
}

interface ComplianceDoc {
  id: string
  name: string
  category: string
  expiryDate: string
  daysLeft: number
  status: 'ok' | 'expiring' | 'expired'
  carrier?: string
  policyNum?: string
}

interface DocTemplate {
  id: string
  name: string
  type: DocType
  description: string
  fields: string[]
  popular: boolean
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const DOCUMENTS: Doc[] = [
  { id: 'd01', name: 'BOL_LD4821_Echo.pdf',            type: 'BOL',       status: 'Signed',   loadRef: 'LD-4821', date: 'May 10, 2026', size: '124 KB', uploadedBy: 'Echo Global Logistics', tags: ['echo','q2'] },
  { id: 'd02', name: 'RateCon_LD4821.pdf',             type: 'Rate Con',  status: 'Signed',   loadRef: 'LD-4821', date: 'May 9, 2026',  size: '88 KB',  uploadedBy: 'Echo Global Logistics' },
  { id: 'd03', name: 'POD_LD4815_TQL.pdf',             type: 'POD',       status: 'Signed',   loadRef: 'LD-4815', date: 'May 10, 2026', size: '210 KB', uploadedBy: 'James Carter' },
  { id: 'd04', name: 'Invoice_INV0091_TQL.pdf',        type: 'Invoice',   status: 'Signed',   loadRef: 'LD-4815', date: 'May 10, 2026', size: '56 KB',  uploadedBy: 'You' },
  { id: 'd05', name: 'BOL_LD4819_Coyote.pdf',          type: 'BOL',       status: 'Pending',  loadRef: 'LD-4819', date: 'May 10, 2026', size: '98 KB',  uploadedBy: 'Coyote Logistics', tags: ['coyote'] },
  { id: 'd06', name: 'Invoice_INV0090_Echo.pdf',       type: 'Invoice',   status: 'Sent',     loadRef: 'LD-4821', date: 'May 8, 2026',  size: '54 KB',  uploadedBy: 'You' },
  { id: 'd07', name: 'IFTA_Q2_2026_IL.pdf',            type: 'IFTA',      status: 'Uploaded', date: 'May 1, 2026',  size: '340 KB', uploadedBy: 'You', tags: ['q2','ifta'] },
  { id: 'd08', name: 'Insurance_Certificate_2026.pdf', type: 'Insurance', status: 'Uploaded', date: 'Jan 1, 2026', size: '180 KB',  uploadedBy: 'State Farm' },
  { id: 'd09', name: 'RateCon_LD4819_Coyote.pdf',     type: 'Rate Con',  status: 'Signed',   loadRef: 'LD-4819', date: 'May 9, 2026',  size: '76 KB',  uploadedBy: 'Coyote Logistics' },
  { id: 'd10', name: 'Invoice_INV0089_Coyote.pdf',     type: 'Invoice',   status: 'Overdue',  loadRef: 'LD-4798', date: 'Apr 28, 2026', size: '51 KB',  uploadedBy: 'You', tags: ['overdue'] },
  { id: 'd11', name: 'BOL_LD4798_Echo.pdf',            type: 'BOL',       status: 'Signed',   loadRef: 'LD-4798', date: 'Apr 28, 2026', size: '115 KB', uploadedBy: 'Echo Global Logistics' },
  { id: 'd12', name: 'POD_LD4798_Echo.pdf',            type: 'POD',       status: 'Signed',   loadRef: 'LD-4798', date: 'May 5, 2026',  size: '198 KB', uploadedBy: 'Mike Rodriguez' },
  { id: 'd13', name: 'BOL_LD4822_TQL.pdf',             type: 'BOL',       status: 'Pending',  loadRef: 'LD-4822', date: 'May 11, 2026', size: '102 KB', uploadedBy: 'TQL' },
  { id: 'd14', name: 'RateCon_LD4822_TQL.pdf',         type: 'Rate Con',  status: 'Signed',   loadRef: 'LD-4822', date: 'May 11, 2026', size: '81 KB',  uploadedBy: 'TQL' },
  { id: 'd15', name: 'IFTA_Q1_2026_IL.pdf',            type: 'IFTA',      status: 'Uploaded', date: 'Apr 1, 2026',  size: '328 KB', uploadedBy: 'You', tags: ['q1','ifta'] },
  // 8 new documents
  { id: 'd16', name: 'POD_LD4822_TQL.pdf',             type: 'POD',       status: 'Pending',  loadRef: 'LD-4822', date: 'May 12, 2026', size: '176 KB', uploadedBy: 'TQL' },
  { id: 'd17', name: 'Invoice_INV0092_CH_Robinson.pdf',type: 'Invoice',   status: 'Sent',     loadRef: 'LD-4830', date: 'May 12, 2026', size: '62 KB',  uploadedBy: 'You', tags: ['ch-robinson','q2'] },
  { id: 'd18', name: 'BOL_LD4830_CHRobinson.pdf',      type: 'BOL',       status: 'Signed',   loadRef: 'LD-4830', date: 'May 11, 2026', size: '131 KB', uploadedBy: 'C.H. Robinson' },
  { id: 'd19', name: 'RateCon_LD4830_CHRobinson.pdf',  type: 'Rate Con',  status: 'Signed',   loadRef: 'LD-4830', date: 'May 11, 2026', size: '93 KB',  uploadedBy: 'C.H. Robinson' },
  { id: 'd20', name: 'Insurance_CargoRider_2026.pdf',  type: 'Insurance', status: 'Uploaded', date: 'Feb 15, 2026', size: '220 KB', uploadedBy: 'Progressive', tags: ['insurance'] },
  { id: 'd21', name: 'IFTA_Q4_2025_IL.pdf',            type: 'IFTA',      status: 'Uploaded', date: 'Jan 15, 2026', size: '312 KB', uploadedBy: 'You', tags: ['q4','ifta','2025'] },
  { id: 'd22', name: 'POD_LD4819_Coyote.pdf',          type: 'POD',       status: 'Signed',   loadRef: 'LD-4819', date: 'May 12, 2026', size: '194 KB', uploadedBy: 'Anna Perez' },
  { id: 'd23', name: 'Invoice_INV0088_Echo_OLD.pdf',   type: 'Invoice',   status: 'Overdue',  loadRef: 'LD-4790', date: 'Apr 20, 2026', size: '48 KB',  uploadedBy: 'You', tags: ['overdue','echo'] },
]

const COMPLIANCE_DOCS: ComplianceDoc[] = [
  { id: 'c1', name: 'General Liability Insurance',  category: 'Insurance',   expiryDate: 'Dec 31, 2026', daysLeft: 234, status: 'ok',       carrier: 'State Farm',     policyNum: 'SFP-2026-84421' },
  { id: 'c2', name: 'Cargo Insurance',              category: 'Insurance',   expiryDate: 'Dec 31, 2026', daysLeft: 234, status: 'ok',       carrier: 'Progressive',    policyNum: 'PRG-2026-12890' },
  { id: 'c3', name: 'BOC-3 Filing',                 category: 'FMCSA',       expiryDate: 'N/A',          daysLeft: 9999, status: 'ok' },
  { id: 'c4', name: 'MC Authority (MC-#892441)',     category: 'FMCSA',       expiryDate: 'Active',       daysLeft: 9999, status: 'ok' },
  { id: 'c5', name: 'IRP Apportioned Plates',       category: 'Registration', expiryDate: 'Jun 30, 2026', daysLeft: 49,  status: 'expiring' },
  { id: 'c6', name: 'UCR Registration',             category: 'Registration', expiryDate: 'Jan 31, 2027', daysLeft: 265, status: 'ok' },
  { id: 'c7', name: 'Unit 01 Annual Inspection',    category: 'Inspection',   expiryDate: 'May 28, 2026', daysLeft: 16,  status: 'expiring' },
  { id: 'c8', name: 'Unit 02 Annual Inspection',    category: 'Inspection',   expiryDate: 'Jul 15, 2026', daysLeft: 64,  status: 'ok' },
  { id: 'c9', name: 'Unit 03 Annual Inspection',    category: 'Inspection',   expiryDate: 'May 5, 2026',  daysLeft: -7,  status: 'expired' },
  { id: 'c10', name: 'James Carter CDL-A',          category: 'Driver',       expiryDate: 'Mar 12, 2027', daysLeft: 305, status: 'ok' },
  { id: 'c11', name: 'Anna Perez CDL-A',            category: 'Driver',       expiryDate: 'Jun 5, 2026',  daysLeft: 24,  status: 'expiring' },
  { id: 'c12', name: 'IFTA License 2026',           category: 'Tax',          expiryDate: 'Dec 31, 2026', daysLeft: 234, status: 'ok' },
  { id: 'c13', name: 'HazMat Permit (Unit 03)',     category: 'Permit',       expiryDate: 'Apr 10, 2026', daysLeft: -32, status: 'expired' },
]

// Expiry dates mapped to calendar day numbers (May 2026)
const MAY_EXPIRY_DAYS: Record<number, { name: string; status: 'expiring' | 'expired' }[]> = {
  5:  [{ name: 'Unit 03 Inspection', status: 'expired' }],
  28: [{ name: 'Unit 01 Inspection', status: 'expiring' }],
}

const TEMPLATES: DocTemplate[] = [
  {
    id: 't1', name: 'Standard BOL', type: 'BOL', popular: true,
    description: 'Стандартный Bill of Lading для сухих грузов с полями для shipper, consignee, commodity.',
    fields: ['Shipper / Consignee', 'Pickup / Delivery', 'Commodity', 'PO Number', 'Driver signature'],
  },
  {
    id: 't2', name: 'Hazmat BOL', type: 'BOL', popular: false,
    description: 'BOL для опасных грузов с секцией UN номера, Emergency Contact и Placard.',
    fields: ['UN Number', 'Hazard Class', 'Placard info', 'Emergency Contact', 'Special instructions'],
  },
  {
    id: 't3', name: 'Rate Confirmation', type: 'Rate Con', popular: true,
    description: 'Стандартный Rate Con с полями ставки, маршрута, условий оплаты и штрафов.',
    fields: ['Lane & miles', 'All-in rate', 'Payment terms', 'Detention rate', 'Lumper policy'],
  },
  {
    id: 't4', name: 'Driver Invoice', type: 'Invoice', popular: true,
    description: 'Инвойс для прямого выставления брокеру с реквизитами, номером MC и banking.',
    fields: ['Invoice #', 'Load reference', 'Bank/ACH info', 'Factoring assignment', 'Tax ID'],
  },
  {
    id: 't5', name: 'Proof of Delivery', type: 'POD', popular: false,
    description: 'POD с полем подписи получателя, timestamp, примечаниями о повреждениях.',
    fields: ['Consignee signature', 'Date/time', 'Pieces count', 'Condition notes', 'Driver signature'],
  },
  {
    id: 't6', name: 'IFTA Mileage Log', type: 'IFTA', popular: false,
    description: 'Ежеквартальный лог пробега по штатам для IFTA отчётности.',
    fields: ['Unit number', 'Driver', 'Miles per state', 'Fuel purchased', 'Quarter totals'],
  },
]

// OCR field data per document type
const OCR_FIELDS: Record<DocType, { label: string; value: string; color: string }[]> = {
  BOL: [
    { label: 'Carrier',     value: 'SWIFT HAUL LOGISTICS LLC',  color: '#4BAED4' },
    { label: 'Load #',      value: 'LD-4821',                   color: '#8B5CF6' },
    { label: 'Ship Date',   value: 'May 10, 2026',              color: '#38C770' },
    { label: 'From',        value: 'Chicago, IL 60601',         color: '#F59E0B' },
    { label: 'To',          value: 'Columbus, OH 43215',        color: '#F59E0B' },
    { label: 'Commodity',   value: 'General Freight / Dry Van', color: '#718096' },
    { label: 'Weight',      value: '42,000 lbs',                color: '#EC4899' },
  ],
  POD: [
    { label: 'Carrier',     value: 'SWIFT HAUL LOGISTICS LLC',  color: '#4BAED4' },
    { label: 'Delivered',   value: 'May 10, 2026 14:32',        color: '#38C770' },
    { label: 'Consignee',   value: 'Midwest Distribution Co.',  color: '#8B5CF6' },
    { label: 'Load #',      value: 'LD-4815',                   color: '#8B5CF6' },
    { label: 'Pieces',      value: '48 pallets — No damage',    color: '#718096' },
    { label: 'Signed by',   value: 'R. Johnson (Receiver)',     color: '#F59E0B' },
  ],
  Invoice: [
    { label: 'Carrier',     value: 'SWIFT HAUL LOGISTICS LLC',  color: '#4BAED4' },
    { label: 'Invoice #',   value: 'INV-0091',                  color: '#8B5CF6' },
    { label: 'Invoice Date','value': 'May 10, 2026',            color: '#38C770' },
    { label: 'Load Ref',    value: 'LD-4815',                   color: '#8B5CF6' },
    { label: 'Amount',      value: '$2,850.00',                 color: '#EC4899' },
    { label: 'Due Date',    value: 'May 25, 2026',              color: '#F59E0B' },
    { label: 'MC #',        value: 'MC-892441',                 color: '#718096' },
  ],
  IFTA: [
    { label: 'Carrier',     value: 'SWIFT HAUL LOGISTICS LLC',  color: '#4BAED4' },
    { label: 'Quarter',     value: 'Q2 2026 (Apr–Jun)',         color: '#38C770' },
    { label: 'IL Miles',    value: '8,241 mi',                  color: '#F59E0B' },
    { label: 'IN Miles',    value: '2,104 mi',                  color: '#F59E0B' },
    { label: 'OH Miles',    value: '1,890 mi',                  color: '#F59E0B' },
    { label: 'Total Fuel',  value: '5,340 gal',                 color: '#8B5CF6' },
    { label: 'Tax Owed',    value: '$418.22',                   color: '#EC4899' },
  ],
  'Rate Con': [
    { label: 'Broker',      value: 'Echo Global Logistics',     color: '#4BAED4' },
    { label: 'Load #',      value: 'LD-4821',                   color: '#8B5CF6' },
    { label: 'Rate',        value: '$2,850.00 all-in',          color: '#EC4899' },
    { label: 'Pickup',      value: 'May 9, 2026 — Chicago, IL', color: '#38C770' },
    { label: 'Delivery',    value: 'May 10, 2026 — Columbus, OH', color: '#38C770' },
    { label: 'Payment',     value: 'Quick Pay 2% — Net 30',     color: '#F59E0B' },
  ],
  Insurance: [
    { label: 'Carrier',     value: 'SWIFT HAUL LOGISTICS LLC',  color: '#4BAED4' },
    { label: 'Insurer',     value: 'State Farm Insurance',      color: '#8B5CF6' },
    { label: 'Policy #',    value: 'SFP-2026-84421',            color: '#718096' },
    { label: 'Coverage',    value: '$1,000,000 General Liab.',  color: '#EC4899' },
    { label: 'Effective',   value: 'Jan 1, 2026',               color: '#38C770' },
    { label: 'Expiry',      value: 'Dec 31, 2026',              color: '#F59E0B' },
  ],
  Other: [
    { label: 'Document',    value: 'Miscellaneous',             color: '#A0AEC0' },
    { label: 'Date',        value: 'May 12, 2026',              color: '#38C770' },
  ],
}

// Load checklist requirements
const LOAD_CHECKLIST: Record<string, { type: DocType; label: string }[]> = {
  'LD-4821': [
    { type: 'BOL',      label: 'Bill of Lading' },
    { type: 'Rate Con', label: 'Rate Confirmation' },
    { type: 'Invoice',  label: 'Invoice' },
    { type: 'POD',      label: 'Proof of Delivery' },
  ],
  'LD-4815': [
    { type: 'BOL',      label: 'Bill of Lading' },
    { type: 'Rate Con', label: 'Rate Confirmation' },
    { type: 'POD',      label: 'Proof of Delivery' },
    { type: 'Invoice',  label: 'Invoice' },
  ],
  'LD-4819': [
    { type: 'BOL',      label: 'Bill of Lading' },
    { type: 'Rate Con', label: 'Rate Confirmation' },
    { type: 'POD',      label: 'Proof of Delivery' },
    { type: 'Invoice',  label: 'Invoice' },
  ],
  'LD-4798': [
    { type: 'BOL',      label: 'Bill of Lading' },
    { type: 'POD',      label: 'Proof of Delivery' },
    { type: 'Invoice',  label: 'Invoice' },
    { type: 'Rate Con', label: 'Rate Confirmation' },
  ],
  'LD-4822': [
    { type: 'BOL',      label: 'Bill of Lading' },
    { type: 'Rate Con', label: 'Rate Confirmation' },
    { type: 'POD',      label: 'Proof of Delivery' },
    { type: 'Invoice',  label: 'Invoice' },
  ],
  'LD-4830': [
    { type: 'BOL',      label: 'Bill of Lading' },
    { type: 'Rate Con', label: 'Rate Confirmation' },
    { type: 'POD',      label: 'Proof of Delivery' },
    { type: 'Invoice',  label: 'Invoice' },
  ],
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_ICONS: Record<DocType, string> = {
  BOL: '📋', POD: '✅', Invoice: '💵', IFTA: '⛽', 'Rate Con': '📄', Insurance: '🛡️', Other: '📎',
}

const TYPE_COLORS: Record<DocType, string> = {
  BOL: '#4BAED4', POD: '#38C770', Invoice: '#F59E0B', IFTA: '#8B5CF6', 'Rate Con': '#06B6D4', Insurance: '#EC4899', Other: '#A0AEC0',
}

const STATUS_CFG: Record<DocStatus, { label: string; color: string; bg: string }> = {
  Signed:   { label: 'Подписан',   color: '#276749', bg: '#F0FFF4' },
  Uploaded: { label: 'Загружен',   color: '#2B6CB0', bg: '#EBF8FF' },
  Sent:     { label: 'Отправлен',  color: '#2B6CB0', bg: '#EBF8FF' },
  Pending:  { label: 'Ожидает',    color: '#D97706', bg: '#FFFBEB' },
  Overdue:  { label: 'Просрочен',  color: '#C53030', bg: '#FFF5F5' },
}

// AI category detection mapping (filename keyword → type)
const AI_CATEGORY_RULES: { keyword: string; type: DocType }[] = [
  { keyword: 'bol',        type: 'BOL' },
  { keyword: 'pod',        type: 'POD' },
  { keyword: 'proof',      type: 'POD' },
  { keyword: 'invoice',    type: 'Invoice' },
  { keyword: 'inv',        type: 'Invoice' },
  { keyword: 'ifta',       type: 'IFTA' },
  { keyword: 'rate',       type: 'Rate Con' },
  { keyword: 'ratecon',    type: 'Rate Con' },
  { keyword: 'insurance',  type: 'Insurance' },
  { keyword: 'certificate',type: 'Insurance' },
]

function detectCategory(filename: string): DocType {
  const lower = filename.toLowerCase()
  for (const rule of AI_CATEGORY_RULES) {
    if (lower.includes(rule.keyword)) return rule.type
  }
  return 'Other'
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DocStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

function ExpiryBadge({ doc }: { doc: ComplianceDoc }) {
  if (doc.status === 'expired')  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: '#FFF5F5', color: '#C53030' }}>Истёк</span>
  if (doc.status === 'expiring') return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: '#FFFBEB', color: '#D97706' }}>Скоро</span>
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: '#F0FFF4', color: '#276749' }}>Действует</span>
}

// ── Email to Broker Modal ─────────────────────────────────────────────────────
function EmailBrokerModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  const [brokerEmail, setBrokerEmail] = useState('dispatch@echogl.com')
  const [subject,     setSubject]     = useState(`Документы по рейсу ${doc.loadRef ?? doc.id} — Swift Haul Logistics`)
  const [message,     setMessage]     = useState(`Здравствуйте,\n\nВо вложении направляю документы по рейсу ${doc.loadRef ?? ''}.\n\nSwift Haul Logistics LLC\nMC-892441`)
  const [attachThis,  setAttachThis]  = useState(true)
  const [attachPOD,   setAttachPOD]   = useState(false)
  const [attachBOL,   setAttachBOL]   = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: 540, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>Отправить брокеру</div>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>Email с вложением документов</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A0AEC0' }}>x</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Email брокера</label>
            <input value={brokerEmail} onChange={e => setBrokerEmail(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Тема письма</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Сообщение</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', marginBottom: 8 }}>Вложения</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { checked: attachThis,  onChange: setAttachThis,  label: doc.name,                    size: doc.size },
                { checked: attachPOD,   onChange: setAttachPOD,   label: 'POD_' + (doc.loadRef ?? 'unknown') + '.pdf', size: '~200 KB' },
                { checked: attachBOL,   onChange: setAttachBOL,   label: 'BOL_' + (doc.loadRef ?? 'unknown') + '.pdf', size: '~120 KB' },
              ].map((item, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: item.checked ? '#EBF8FF' : '#F7FAFC', borderRadius: 9, border: `1.5px solid ${item.checked ? '#4BAED4' : '#E2E8F0'}`, cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.checked} onChange={e => item.onChange(e.target.checked)} style={{ accentColor: '#4BAED4' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1A2535', flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: '#A0AEC0' }}>{item.size}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
          <button onClick={onClose} style={{ flex: 2, padding: '11px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Отправить</button>
        </div>
      </div>
    </div>
  )
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const [dragging,       setDragging]       = useState(false)
  const [docType,        setDocType]        = useState<DocType>('BOL')
  const [loadRef,        setLoadRef]        = useState('')
  const [note,           setNote]           = useState('')
  const [filename,       setFilename]       = useState('')
  const [aiSuggested,    setAiSuggested]    = useState<DocType | null>(null)
  const [aiConfirmed,    setAiConfirmed]    = useState(false)

  const handleFileDrop = (name: string) => {
    setFilename(name)
    const suggested = detectCategory(name)
    setAiSuggested(suggested)
    setDocType(suggested)
    setAiConfirmed(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: 520 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1A2535' }}>Загрузить документ</div>
            <div style={{ fontSize: 12, color: '#A0AEC0', marginTop: 2 }}>PDF, JPG, PNG — макс. 25 MB</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A0AEC0' }}>x</button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFileDrop(file.name)
          }}
          onClick={() => handleFileDrop('BOL_LD4999_Sample.pdf')}
          style={{
            border: `2px dashed ${dragging ? '#4BAED4' : '#CBD5E0'}`,
            borderRadius: 14, padding: '36px 24px', textAlign: 'center',
            background: dragging ? '#EBF8FF' : '#F7FAFC', transition: 'all .2s',
            marginBottom: 16, cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 10 }}>📁</div>
          {filename ? (
            <div style={{ fontWeight: 700, color: '#1A2535' }}>{filename}</div>
          ) : (
            <>
              <div style={{ fontWeight: 700, color: '#2D3748', marginBottom: 4 }}>Перетащите файл или нажмите для выбора</div>
              <div style={{ fontSize: 12, color: '#A0AEC0' }}>PDF, JPG, PNG — макс. 25 MB</div>
            </>
          )}
        </div>

        {/* AI Smart Categorization chip */}
        {aiSuggested && !aiConfirmed && (
          <div style={{ background: 'linear-gradient(135deg,#EBF8FF,#F0FFF4)', border: '1.5px solid #4BAED4', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 22 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#1A2535' }}>AI предлагает категорию</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: TYPE_COLORS[aiSuggested] + '25', color: TYPE_COLORS[aiSuggested], border: `1.5px solid ${TYPE_COLORS[aiSuggested]}50` }}>
                  {TYPE_ICONS[aiSuggested]} {aiSuggested}
                </span>
                <span style={{ fontSize: 11, color: '#718096' }}>— определено автоматически</span>
              </div>
            </div>
            <button onClick={() => setAiConfirmed(true)} style={{ padding: '5px 12px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Принять</button>
          </div>
        )}
        {aiSuggested && aiConfirmed && (
          <div style={{ background: '#F0FFF4', border: '1.5px solid #38C770', borderRadius: 12, padding: '10px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#276749' }}>Категория подтверждена: {aiSuggested}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Тип документа *</label>
            <select value={docType} onChange={e => setDocType(e.target.value as DocType)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13 }}>
              {(['BOL','POD','Invoice','IFTA','Rate Con','Insurance','Other'] as DocType[]).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Load Reference</label>
            <input value={loadRef} onChange={e => setLoadRef(e.target.value)} placeholder="LD-4821"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', display: 'block', marginBottom: 4 }}>Примечание</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Необязательный комментарий..."
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
          <button onClick={onClose} style={{ flex: 2, padding: '11px', borderRadius: 10, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Загрузить</button>
        </div>
      </div>
    </div>
  )
}

// ── OCR Preview Panel ─────────────────────────────────────────────────────────
function OcrPanel({ doc }: { doc: Doc }) {
  const fields = OCR_FIELDS[doc.type] ?? OCR_FIELDS['Other']
  return (
    <div style={{ background: '#FAFBFF', borderRadius: 12, border: '1.5px solid #E2E8F0', padding: '14px 16px', marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>🔍</span>
        <span style={{ fontWeight: 800, fontSize: 12, color: '#1A2535' }}>OCR — Извлечённые поля</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#EBF8FF', color: '#4BAED4', marginLeft: 'auto' }}>Симуляция</span>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 11, background: '#1A2535', borderRadius: 10, padding: '12px 14px', lineHeight: 1.9 }}>
        {fields.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 8 }}>
            <span style={{ color: '#718096', minWidth: 90 }}>{f.label}:</span>
            <span style={{ color: f.color, fontWeight: 700 }}>{f.value}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 8, textAlign: 'center' }}>
        Confidence: 97.4% · Powered by DispaLoadIQ OCR Engine
      </div>
    </div>
  )
}

// ── Document Preview Panel ────────────────────────────────────────────────────
function DocPreviewPanel({ doc, onClose }: { doc: Doc; onClose: () => void; onShare: () => void }) {
  const [showOcr,       setShowOcr]       = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const color = TYPE_COLORS[doc.type]
  const scfg  = STATUS_CFG[doc.status]

  return (
    <>
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden', alignSelf: 'flex-start' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '30', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {TYPE_ICONS[doc.type]}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', maxWidth: 200, wordBreak: 'break-word' }}>{doc.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{doc.type} · {doc.size}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, width: 30, height: 30, color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
          </div>
        </div>

        {/* Mock PDF preview */}
        <div style={{ margin: '16px 16px 0', background: '#F7FAFC', borderRadius: 10, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #CBD5E0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#718096' }}>{doc.name}</div>
          <div style={{ fontSize: 10, color: '#A0AEC0', marginTop: 4 }}>Предпросмотр доступен в production</div>
          <button onClick={() => setShowOcr(v => !v)} style={{ marginTop: 10, padding: '5px 14px', background: showOcr ? '#4BAED4' : '#EBF8FF', color: showOcr ? '#fff' : '#4BAED4', border: '1px solid #BEE3F8', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            {showOcr ? 'Скрыть OCR' : 'Показать OCR'}
          </button>
        </div>

        {/* OCR Panel */}
        <div style={{ padding: '0 16px' }}>
          {showOcr && <OcrPanel doc={doc} />}
        </div>

        {/* Metadata */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: '#A0AEC0', marginBottom: 10, textTransform: 'uppercase' }}>Информация</div>
          {[
            { label: 'Статус',    value: <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: scfg.bg, color: scfg.color }}>{scfg.label}</span> },
            { label: 'Тип',       value: <span style={{ fontSize: 11, fontWeight: 700, color: color }}>{doc.type}</span> },
            ...(doc.loadRef ? [{ label: 'Загрузка', value: doc.loadRef }] : []),
            { label: 'Загрузил',  value: doc.uploadedBy },
            { label: 'Дата',      value: doc.date },
            { label: 'Размер',    value: doc.size },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #F0F4F8', fontSize: 12 }}>
              <span style={{ color: '#718096' }}>{r.label}</span>
              <span style={{ fontWeight: 600, color: '#1A2535' }}>{r.value}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {doc.tags.map(t => (
                <span key={t} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#F0F4F8', color: '#718096' }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Version history */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ fontWeight: 700, fontSize: 11, color: '#A0AEC0', marginBottom: 8, textTransform: 'uppercase' }}>История версий</div>
          <div style={{ fontSize: 11, color: '#718096', background: '#F7FAFC', borderRadius: 8, padding: '10px 12px' }}>
            v1.0 — загружено {doc.date} · {doc.uploadedBy}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '9px', borderRadius: 9, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              Скачать
            </button>
            <button onClick={() => setShowEmailModal(true)} style={{ flex: 1, padding: '9px', borderRadius: 9, background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              Брокеру
            </button>
          </div>
          <button style={{ padding: '9px', borderRadius: 9, background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            Удалить
          </button>
        </div>
      </div>

      {showEmailModal && (
        <EmailBrokerModal doc={doc} onClose={() => setShowEmailModal(false)} />
      )}
    </>
  )
}

// ── Compliance Tab ────────────────────────────────────────────────────────────
function ComplianceTab() {
  const expired  = COMPLIANCE_DOCS.filter(d => d.status === 'expired')
  const expiring = COMPLIANCE_DOCS.filter(d => d.status === 'expiring')
  const ok       = COMPLIANCE_DOCS.filter(d => d.status === 'ok')

  const grouped: Record<string, ComplianceDoc[]> = {}
  COMPLIANCE_DOCS.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = []
    grouped[d.category].push(d)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Документы истекли', count: expired.length, color: '#C53030', bg: '#FFF5F5' },
          { label: 'Скоро истекают',    count: expiring.length, color: '#D97706', bg: '#FFFBEB' },
          { label: 'В порядке',          count: ok.length,      color: '#276749', bg: '#F0FFF4' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '18px 20px', border: `1.5px solid ${s.color}30` }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {(expired.length + expiring.length) > 0 && (
        <div style={{ background: '#FFF5F5', borderRadius: 14, padding: '16px 20px', border: '1.5px solid #FEB2B2' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#C53030', marginBottom: 12 }}>Требуют внимания</div>
          {[...expired, ...expiring].sort((a, b) => a.daysLeft - b.daysLeft).map(d => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #FED7D7' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#718096' }}>{d.category} · {d.expiryDate}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <ExpiryBadge doc={d} />
                <button style={{ padding: '5px 12px', background: '#fff', border: '1px solid #CBD5E0', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#4BAED4' }}>
                  Обновить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.entries(grouped).map(([cat, docs]) => (
        <div key={cat} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 13, color: '#1A2535' }}>
            {cat} <span style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 500 }}>({docs.length})</span>
          </div>
          {docs.map(d => {
            const daysText = d.daysLeft === 9999 ? 'Постоянный' : d.daysLeft < 0 ? `Истёк ${Math.abs(d.daysLeft)} дн. назад` : `${d.daysLeft} дн. осталось`
            return (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', padding: '12px 20px', borderBottom: '1px solid #F0F4F8', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2535' }}>{d.name}</div>
                  {d.policyNum && <div style={{ fontSize: 11, color: '#A0AEC0' }}>Полис: {d.policyNum}</div>}
                  {d.carrier   && <div style={{ fontSize: 11, color: '#A0AEC0' }}>Страховщик: {d.carrier}</div>}
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: '#718096' }}>
                  <div style={{ fontWeight: 700 }}>{d.expiryDate}</div>
                  <div style={{ fontSize: 10, color: d.daysLeft < 30 && d.daysLeft !== 9999 ? '#D97706' : '#A0AEC0' }}>{daysText}</div>
                </div>
                <ExpiryBadge doc={d} />
                <button style={{ padding: '5px 10px', background: '#EBF8FF', color: '#4BAED4', border: '1px solid #BEE3F8', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Загрузить
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Calendar Tab ──────────────────────────────────────────────────────────────
function CalendarTab() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  // May 2026: starts on Friday (day-of-week index 5)
  const startDow = 5 // Friday
  const daysInMonth = 31
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  const expiringThisMonth = COMPLIANCE_DOCS.filter(d => {
    if (d.daysLeft === 9999) return false
    return d.expiryDate.includes('May 2026') || d.expiryDate.startsWith('May')
  })

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Calendar */}
      <div style={{ flex: 1 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Май 2026</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Сроки истечения документов</div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {/* Day-of-week headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
              {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#A0AEC0', padding: '4px 0' }}>{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            {weeks.map((wk, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
                {wk.map((day, di) => {
                  const events = day ? (MAY_EXPIRY_DAYS[day] ?? []) : []
                  const isToday = day === 12
                  const isHovered = day === hoveredDay
                  return (
                    <div key={di}
                      onMouseEnter={() => day && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        minHeight: 52, borderRadius: 10, padding: '6px 8px',
                        background: isToday ? '#1A2535' : isHovered ? '#F0F4F8' : day ? '#fff' : 'transparent',
                        border: events.length > 0 ? '1.5px solid #FEB2B2' : isToday ? 'none' : '1px solid #F0F4F8',
                        cursor: day ? 'pointer' : 'default',
                        position: 'relative',
                        transition: 'background .15s',
                      }}>
                      {day && (
                        <>
                          <div style={{ fontSize: 13, fontWeight: isToday ? 900 : 600, color: isToday ? '#fff' : '#1A2535' }}>{day}</div>
                          <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap' }}>
                            {events.map((ev, ei) => (
                              <div key={ei} style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: ev.status === 'expired' ? '#C53030' : '#D97706',
                              }} title={ev.name} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F0F4F8', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C53030' }} />
              <span style={{ fontSize: 11, color: '#718096' }}>Истёк</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} />
              <span style={{ fontSize: 11, color: '#718096' }}>Скоро истекает</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: '#1A2535' }} />
              <span style={{ fontSize: 11, color: '#718096' }}>Сегодня</span>
            </div>
          </div>
        </div>

        {/* Tooltip for hovered day with events */}
        {hoveredDay !== null && MAY_EXPIRY_DAYS[hoveredDay] && (
          <div style={{ marginTop: 12, background: '#1A2535', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4BAED4', marginBottom: 8 }}>
              {hoveredDay} мая 2026
            </div>
            {MAY_EXPIRY_DAYS[hoveredDay].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#fff', marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.status === 'expired' ? '#C53030' : '#D97706', flexShrink: 0 }} />
                {ev.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar: expiring this month */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #FEB2B2', overflow: 'hidden' }}>
          <div style={{ background: '#FFF5F5', padding: '14px 18px', borderBottom: '1px solid #FEB2B2' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#C53030' }}>Истекают в мае</div>
            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{expiringThisMonth.length} документов</div>
          </div>
          {expiringThisMonth.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#A0AEC0', fontSize: 12 }}>
              Нет истекающих в этом месяце
            </div>
          ) : (
            expiringThisMonth.map(d => (
              <div key={d.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F0F4F8' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#1A2535' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{d.expiryDate}</div>
                <div style={{ marginTop: 6 }}>
                  <ExpiryBadge doc={d} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* All upcoming */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden', marginTop: 14 }}>
          <div style={{ padding: '12px 18px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 13, color: '#1A2535' }}>
            Следующие 60 дней
          </div>
          {COMPLIANCE_DOCS
            .filter(d => d.daysLeft > 0 && d.daysLeft < 60 && d.daysLeft !== 9999)
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .map(d => (
              <div key={d.id} style={{ padding: '10px 18px', borderBottom: '1px solid #F0F4F8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2535' }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>{d.category}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: d.daysLeft < 30 ? '#D97706' : '#276749' }}>{d.daysLeft}д</div>
                  <div style={{ fontSize: 10, color: '#A0AEC0' }}>{d.expiryDate}</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ── Load Checklist ────────────────────────────────────────────────────────────
function LoadChecklist({ loadRef, docs }: { loadRef: string; docs: Doc[] }) {
  const requirements = LOAD_CHECKLIST[loadRef] ?? [
    { type: 'BOL' as DocType,      label: 'Bill of Lading' },
    { type: 'Rate Con' as DocType, label: 'Rate Confirmation' },
    { type: 'POD' as DocType,      label: 'Proof of Delivery' },
    { type: 'Invoice' as DocType,  label: 'Invoice' },
  ]

  const presentTypes = new Set(docs.map(d => d.type))
  const completed = requirements.filter(r => presentTypes.has(r.type)).length
  const pct = Math.round((completed / requirements.length) * 100)

  return (
    <div style={{ padding: '12px 20px', background: '#F7FAFC', borderTop: '1px solid #E2E8F0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Чеклист документов</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 100, height: 6, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#38C770' : pct >= 50 ? '#4BAED4' : '#D97706', borderRadius: 99, transition: 'width .3s' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: pct === 100 ? '#276749' : '#D97706' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {requirements.map(r => {
          const has = presentTypes.has(r.type)
          return (
            <div key={r.type} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 10px', borderRadius: 8, background: has ? '#F0FFF4' : '#FFF5F5', border: `1px solid ${has ? '#C6F6D5' : '#FED7D7'}` }}>
              <span style={{ fontSize: 13 }}>{has ? '✓' : '✗'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: has ? '#276749' : '#C53030' }}>{r.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Bundles Tab ───────────────────────────────────────────────────────────────
function BundlesTab() {
  const [expanded,       setExpanded]       = useState<string | null>('LD-4821')
  const [emailBrokerRef, setEmailBrokerRef] = useState<string | null>(null)

  const withRef = DOCUMENTS.filter(d => d.loadRef)
  const bundles: Record<string, Doc[]> = {}
  withRef.forEach(d => {
    if (!bundles[d.loadRef!]) bundles[d.loadRef!] = []
    bundles[d.loadRef!].push(d)
  })

  const unlinked = DOCUMENTS.filter(d => !d.loadRef)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(bundles).sort(([a], [b]) => b.localeCompare(a)).map(([loadRef, docs]) => {
        const isExp      = expanded === loadRef
        const hasPending = docs.some(d => d.status === 'Pending')
        const hasOverdue = docs.some(d => d.status === 'Overdue')
        return (
          <div key={loadRef} style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${hasOverdue ? '#FED7D7' : hasPending ? '#FEF3C7' : '#E2E8F0'}`, overflow: 'hidden' }}>
            <div onClick={() => setExpanded(isExp ? null : loadRef)} style={{
              padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', background: isExp ? '#F7FAFC' : '#fff',
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EBF8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#4BAED4' }}>
                  {loadRef.split('-')[1]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1A2535' }}>{loadRef}</div>
                  <div style={{ fontSize: 11, color: '#A0AEC0', marginTop: 2 }}>{docs.length} документов</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {hasOverdue && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#FFF5F5', color: '#C53030' }}>Просрочен</span>}
                {hasPending && !hasOverdue && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#FFFBEB', color: '#D97706' }}>Ожидает</span>}
                <div style={{ fontSize: 16, color: '#CBD5E0' }}>{isExp ? '▲' : '▼'}</div>
              </div>
            </div>

            {isExp && (
              <div style={{ borderTop: '1px solid #E2E8F0' }}>
                {docs.map(d => {
                  const scfg = STATUS_CFG[d.status]
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #F0F4F8' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_COLORS[d.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {TYPE_ICONS[d.type]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: '#A0AEC0' }}>{d.uploadedBy} · {d.date} · {d.size}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: scfg.bg, color: scfg.color }}>{scfg.label}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ padding: '4px 10px', background: '#EBF8FF', color: '#4BAED4', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Скач
                        </button>
                      </div>
                    </div>
                  )
                })}
                {/* Document checklist per load */}
                <LoadChecklist loadRef={loadRef} docs={docs} />
                <div style={{ padding: '10px 20px', background: '#F7FAFC', display: 'flex', gap: 8 }}>
                  <button style={{ padding: '7px 14px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Скачать все ({docs.length})
                  </button>
                  <button onClick={() => setEmailBrokerRef(loadRef)} style={{ padding: '7px 14px', background: '#fff', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Отправить брокеру
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {unlinked.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: '#F7FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: 13, color: '#718096' }}>
            Без привязки к загрузке ({unlinked.length})
          </div>
          {unlinked.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #F0F4F8' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: TYPE_COLORS[d.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {TYPE_ICONS[d.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2535' }}>{d.name}</div>
                <div style={{ fontSize: 11, color: '#A0AEC0' }}>{d.uploadedBy} · {d.date}</div>
              </div>
              <button style={{ padding: '5px 12px', background: '#EBF8FF', color: '#4BAED4', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Скач</button>
            </div>
          ))}
        </div>
      )}

      {emailBrokerRef && (
        <EmailBrokerModal
          doc={{ id: 'bundle', name: `Пакет ${emailBrokerRef}`, type: 'BOL', status: 'Signed', loadRef: emailBrokerRef, date: '', size: '', uploadedBy: '' }}
          onClose={() => setEmailBrokerRef(null)}
        />
      )}
    </div>
  )
}

// ── Templates Tab ─────────────────────────────────────────────────────────────
function TemplatesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'linear-gradient(135deg,#1A2535,#2D4A6B)', borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#4BAED4', marginBottom: 6 }}>Библиотека шаблонов</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>
          Готовые шаблоны документов для мгновенного создания BOL, Rate Con, Invoice и других форм.
          Заполните поля и скачайте готовый PDF.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {TEMPLATES.map(t => (
          <div key={t.id} style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: TYPE_COLORS[t.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {TYPE_ICONS[t.type]}
              </div>
              {t.popular && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#FFFBEB', color: '#D97706' }}>
                  Популярный
                </span>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1A2535' }}>{t.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: TYPE_COLORS[t.type] + '20', color: TYPE_COLORS[t.type], marginTop: 4, display: 'inline-block' }}>
                {t.type}
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#718096', lineHeight: 1.5 }}>{t.description}</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#A0AEC0', marginBottom: 6 }}>ПОЛЯ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {t.fields.map((f, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#718096', display: 'flex', gap: 6 }}>
                    <span style={{ color: '#4BAED4' }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button style={{ flex: 1, padding: '9px', borderRadius: 9, background: '#4BAED4', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                Использовать
              </button>
              <button style={{ padding: '9px 12px', borderRadius: 9, background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', fontSize: 12, cursor: 'pointer' }}>
                Скач
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [mainTab,      setMainTab]      = useState<MainTab>('all')
  const [filterType,   setFilterType]   = useState<DocType | 'All'>('All')
  const [filterStatus, setFilterStatus] = useState<DocStatus | 'All'>('All')
  const [search,       setSearch]       = useState('')
  const [dateFrom,     setDateFrom]     = useState('')
  const [dateTo,       setDateTo]       = useState('')
  const [selectedDoc,  setSelectedDoc]  = useState<Doc | null>(null)
  const [showUpload,   setShowUpload]   = useState(false)
  const [viewMode,     setViewMode]     = useState<'grid' | 'list'>('list')
  const [selected,     setSelected]     = useState<Set<string>>(new Set())

  // Month abbreviation map for rudimentary date range filtering
  const MONTH_IDX: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }

  function parseDocDate(dateStr: string): Date | null {
    const parts = dateStr.match(/^(\w+)\s+(\d+),\s+(\d+)$/)
    if (!parts) return null
    const m = MONTH_IDX[parts[1]]
    if (m === undefined) return null
    return new Date(Number(parts[3]), m, Number(parts[2]))
  }

  const filtered = useMemo(() => {
    return DOCUMENTS.filter(d => {
      const matchType   = filterType === 'All' || d.type === filterType
      const matchStatus = filterStatus === 'All' || d.status === filterStatus
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.loadRef ?? '').toLowerCase().includes(search.toLowerCase()) ||
        d.uploadedBy.toLowerCase().includes(search.toLowerCase()) ||
        (d.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()))
      let matchDate = true
      if (dateFrom || dateTo) {
        const docDate = parseDocDate(d.date)
        if (docDate) {
          if (dateFrom) matchDate = matchDate && docDate >= new Date(dateFrom)
          if (dateTo)   matchDate = matchDate && docDate <= new Date(dateTo)
        }
      }
      return matchType && matchStatus && matchSearch && matchDate
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus, search, dateFrom, dateTo])

  const expiredCount  = COMPLIANCE_DOCS.filter(d => d.status === 'expired').length
  const expiringCount = COMPLIANCE_DOCS.filter(d => d.status === 'expiring').length

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1A2535' }}>Документы</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            {DOCUMENTS.length} файлов · {expiredCount + expiringCount} требуют внимания
          </p>
        </div>
        <button onClick={() => setShowUpload(true)} style={{ padding: '9px 20px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Загрузить
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Всего файлов',    value: String(DOCUMENTS.length),                                                      color: '#4BAED4' },
          { label: 'Истёкшие',        value: String(expiredCount),                                                           color: '#C53030' },
          { label: 'Скоро истекают',  value: String(expiringCount),                                                          color: '#D97706' },
          { label: 'Ожидают подписи', value: String(DOCUMENTS.filter(d => d.status === 'Pending').length),                   color: '#718096' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #E2E8F0', padding: '14px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Type filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('All')} style={{
          padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
          border: `1.5px solid ${filterType === 'All' ? '#4BAED4' : '#E2E8F0'}`,
          background: filterType === 'All' ? '#EBF8FF' : 'transparent',
          color: filterType === 'All' ? '#4BAED4' : '#718096', cursor: 'pointer',
        }}>
          Все ({DOCUMENTS.length})
        </button>
        {(['BOL','POD','Invoice','IFTA','Rate Con','Insurance','Other'] as DocType[]).map(type => {
          const count = DOCUMENTS.filter(d => d.type === type).length
          const active = filterType === type
          return (
            <button key={type} onClick={() => setFilterType(active ? 'All' : type)} style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${active ? TYPE_COLORS[type] : '#E2E8F0'}`,
              background: active ? TYPE_COLORS[type] + '18' : 'transparent',
              color: active ? TYPE_COLORS[type] : '#718096', cursor: 'pointer',
            }}>
              {TYPE_ICONS[type]} {type} ({count})
            </button>
          )
        })}
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', background: '#F0F4F8', borderRadius: 12, padding: 4, gap: 2 }}>
        {([
          ['all',        'Все документы'],
          ['compliance', `Compliance${expiredCount + expiringCount > 0 ? ` (${expiredCount + expiringCount})` : ''}`],
          ['bundles',    'По загрузкам'],
          ['templates',  'Шаблоны'],
          ['calendar',   'Календарь'],
        ] as [MainTab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setMainTab(k)} style={{
            flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 12,
            background: mainTab === k ? '#fff' : 'transparent',
            color: mainTab === k ? (k === 'compliance' && expiredCount > 0 ? '#C53030' : '#4BAED4') : '#718096',
            boxShadow: mainTab === k ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {/* ── ALL DOCS TAB ── */}
      {mainTab === 'all' && (
        <div>
          {/* Search + filters row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию, загрузке, тегу..."
              style={{ padding: '9px 14px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 13, width: 280 }} />
            {/* Date range */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#718096', fontWeight: 600 }}>С</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                style={{ padding: '7px 10px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 12, color: '#1A2535' }} />
              <span style={{ fontSize: 11, color: '#718096', fontWeight: 600 }}>По</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                style={{ padding: '7px 10px', border: '1.5px solid #E2E8F0', borderRadius: 9, fontSize: 12, color: '#1A2535' }} />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo('') }} style={{ padding: '5px 10px', background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7', borderRadius: 7, fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>
                  Сброс дат
                </button>
              )}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', background: '#F0F4F8', borderRadius: 8, padding: 3 }}>
              {(['list','grid'] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: viewMode === v ? '#fff' : 'transparent',
                  color: viewMode === v ? '#4BAED4' : '#718096',
                }}>{v === 'list' ? 'Список' : 'Сетка'}</button>
              ))}
            </div>
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {(['All','Signed','Uploaded','Sent','Pending','Overdue'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '5px 11px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                border: `1.5px solid ${filterStatus === s ? '#4BAED4' : '#E2E8F0'}`,
                background: filterStatus === s ? '#EBF8FF' : 'transparent',
                color: filterStatus === s ? '#4BAED4' : '#718096', cursor: 'pointer',
              }}>{s === 'All' ? 'Все статусы' : STATUS_CFG[s as DocStatus]?.label ?? s}</button>
            ))}
            <span style={{ fontSize: 11, color: '#A0AEC0', alignSelf: 'center', marginLeft: 8 }}>
              {filtered.length} из {DOCUMENTS.length}
            </span>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div style={{ background: '#1A2535', borderRadius: 10, padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Выбрано: {selected.size}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '6px 14px', background: '#4BAED4', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Скачать</button>
                <button style={{ padding: '6px 14px', background: '#F7FAFC', color: '#1A2535', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Отправить</button>
                <button onClick={() => setSelected(new Set())} style={{ padding: '6px 14px', background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#A0AEC0', background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                  <div style={{ fontWeight: 700, color: '#718096' }}>Документы не найдены</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Попробуйте изменить фильтры или сбросить поиск</div>
                </div>
              ) : viewMode === 'list' ? (
                <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 2fr 1fr 1fr 0.8fr 1fr 0.7fr 70px', padding: '9px 16px', fontSize: 11, fontWeight: 700, color: '#718096', background: '#FAFBFC', borderBottom: '1px solid #E2E8F0' }}>
                    <div />
                    <div>ДОКУМЕНТ</div>
                    <div>ТИП</div>
                    <div>ЗАГРУЗКА</div>
                    <div style={{ textAlign: 'center' }}>СТАТУС</div>
                    <div>ЗАГРУЗИЛ</div>
                    <div style={{ textAlign: 'right' }}>РАЗМЕР</div>
                    <div />
                  </div>
                  {filtered.map(doc => {
                    const isSel = selectedDoc?.id === doc.id
                    const isChk = selected.has(doc.id)
                    const scfg  = STATUS_CFG[doc.status]
                    return (
                      <div key={doc.id}
                        onClick={() => setSelectedDoc(isSel ? null : doc)}
                        style={{
                          display: 'grid', gridTemplateColumns: '32px 2fr 1fr 1fr 0.8fr 1fr 0.7fr 70px',
                          padding: '11px 16px', borderBottom: '1px solid #F0F4F8',
                          background: isSel ? '#EBF8FF' : isChk ? '#F0FFF4' : '#fff',
                          alignItems: 'center', cursor: 'pointer', transition: 'background .1s',
                          borderLeft: isSel ? '3px solid #4BAED4' : '3px solid transparent',
                        }}
                      >
                        <input type="checkbox" checked={isChk} onChange={() => toggleSelect(doc.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ cursor: 'pointer', accentColor: '#4BAED4' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: TYPE_COLORS[doc.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                            {TYPE_ICONS[doc.type]}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 12, color: '#1A2535' }}>{doc.name}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: TYPE_COLORS[doc.type] + '20', color: TYPE_COLORS[doc.type] }}>{doc.type}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#4BAED4' }}>{doc.loadRef ?? '—'}</span>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: scfg.bg, color: scfg.color }}>{scfg.label}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#718096' }}>{doc.uploadedBy}</span>
                        <span style={{ fontSize: 11, color: '#A0AEC0', textAlign: 'right' }}>{doc.size}</span>
                        <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                          <button onClick={e => { e.stopPropagation(); setSelectedDoc(doc) }} style={{ padding: '3px 8px', background: '#EBF8FF', color: '#4BAED4', border: 'none', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>
                            Откр
                          </button>
                          <button onClick={e => e.stopPropagation()} style={{ padding: '3px 8px', background: '#F7FAFC', color: '#718096', border: '1px solid #E2E8F0', borderRadius: 5, fontSize: 11, cursor: 'pointer' }}>
                            Скач
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
                  {filtered.map(doc => {
                    const isSel = selectedDoc?.id === doc.id
                    const scfg  = STATUS_CFG[doc.status]
                    return (
                      <div key={doc.id} onClick={() => setSelectedDoc(isSel ? null : doc)} style={{
                        border: `2px solid ${isSel ? TYPE_COLORS[doc.type] : '#E2E8F0'}`,
                        borderRadius: 14, padding: '16px', cursor: 'pointer',
                        background: isSel ? TYPE_COLORS[doc.type] + '08' : '#fff', transition: 'all .15s',
                      }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: TYPE_COLORS[doc.type] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12 }}>
                          {TYPE_ICONS[doc.type]}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 11, color: '#1A2535', marginBottom: 6, wordBreak: 'break-word' }}>{doc.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: scfg.bg, color: scfg.color }}>{scfg.label}</span>
                          <span style={{ fontSize: 9, color: '#A0AEC0' }}>{doc.size}</span>
                        </div>
                        {doc.loadRef && <div style={{ fontSize: 10, color: '#4BAED4', marginTop: 6, fontWeight: 700 }}>#{doc.loadRef}</div>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {selectedDoc && (
              <div style={{ width: 320, flexShrink: 0 }}>
                <DocPreviewPanel doc={selectedDoc} onClose={() => setSelectedDoc(null)} onShare={() => {}} />
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === 'compliance' && <ComplianceTab />}
      {mainTab === 'bundles'    && <BundlesTab />}
      {mainTab === 'templates'  && <TemplatesTab />}
      {mainTab === 'calendar'   && <CalendarTab />}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
