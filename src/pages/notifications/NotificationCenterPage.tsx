import { useState } from 'react';
import { UserRole } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifCategory = 'Load' | 'Finance' | 'Compliance' | 'System';
type NotifPriority = 'urgent' | 'warning' | 'info' | 'success';
type FilterTab = 'All' | 'Unread' | 'Load' | 'Finance' | 'Compliance' | 'System';
type Channel = 'inApp' | 'email' | 'sms' | 'push';
type RightPanelTab = 'detail' | 'settings';

interface Notification {
  id: string;
  category: NotifCategory;
  priority: NotifPriority;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  icon: string;
  actionRequired: boolean;
  actions: { label: string; variant: 'primary' | 'secondary' | 'danger' }[];
  relatedLinks: { label: string; href: string }[];
  source: string;
  metadata: Record<string, string>;
}

interface NotifSettingRow {
  id: string;
  event: string;
  category: NotifCategory;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: Notification[] = [
  // Load notifications
  {
    id: 'n1',
    category: 'Load',
    priority: 'success',
    title: 'Load #EG-920441 Delivered',
    body: 'Chicago → Dallas. POD uploaded successfully. Final payout $2,104.',
    timestamp: '2026-05-12T08:15:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View Load', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #EG-920441', href: '#' }, { label: 'POD Document', href: '#' }],
    source: 'Echo Global Logistics',
    metadata: { Route: 'Chicago → Dallas', Distance: '925 mi', Payout: '$2,104', Driver: 'Mike Rodriguez' },
  },
  {
    id: 'n2',
    category: 'Load',
    priority: 'urgent',
    title: 'New Load Offer: TQL — Houston → Phoenix',
    body: '$2,786 · 1,198 mi · Reefer 48ft. Offer expires in 2 hours. Rate/mi: $2.33.',
    timestamp: '2026-05-12T09:45:00Z',
    read: false,
    icon: '🔴',
    actionRequired: true,
    actions: [{ label: 'Accept Offer', variant: 'primary' }, { label: 'Counter', variant: 'secondary' }, { label: 'Decline', variant: 'danger' }],
    relatedLinks: [{ label: 'TQL Profile', href: '#' }, { label: 'Route Map', href: '#' }],
    source: 'Total Quality Logistics',
    metadata: { Rate: '$2,786', Distance: '1,198 mi', Equipment: 'Reefer 48ft', 'Expires': '2h 00m' },
  },
  {
    id: 'n3',
    category: 'Load',
    priority: 'warning',
    title: 'BOL Needed — Load #CL-773201',
    body: 'Broker Coyote Logistics needs BOL for Load #CL-773201 by 5pm today. Missing document will delay payment.',
    timestamp: '2026-05-12T10:00:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'Upload BOL', variant: 'primary' }, { label: 'Contact Broker', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #CL-773201', href: '#' }, { label: 'Documents', href: '#' }],
    source: 'Coyote Logistics',
    metadata: { Deadline: '5:00 PM CT', 'Load ID': '#CL-773201', Broker: 'Coyote Logistics', Status: 'Pending Document' },
  },
  {
    id: 'n4',
    category: 'Load',
    priority: 'warning',
    title: 'Load #AL-887723 Delayed — Weather',
    body: 'Weather conditions on I-24 through Tennessee. New ETA adjusted by +3 hours. Shipper has been notified.',
    timestamp: '2026-05-12T07:30:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: false,
    actions: [{ label: 'View Route', variant: 'secondary' }, { label: 'Notify Broker', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #AL-887723', href: '#' }, { label: 'Weather Map', href: '#' }],
    source: 'System — Route Monitor',
    metadata: { Delay: '+3 hours', Cause: 'Severe weather I-24 TN', 'New ETA': '6:45 PM CT', Driver: 'Carlos Mendez' },
  },
  {
    id: 'n5',
    category: 'Load',
    priority: 'info',
    title: 'Rate Confirmation — Load #XP-112034',
    body: 'Rate confirmation received from XPO Logistics. Review and sign required before pickup at 2pm tomorrow.',
    timestamp: '2026-05-12T06:20:00Z',
    read: false,
    icon: '⏳',
    actionRequired: true,
    actions: [{ label: 'Review & Sign', variant: 'primary' }, { label: 'Request Changes', variant: 'secondary' }],
    relatedLinks: [{ label: 'Rate Confirmation PDF', href: '#' }, { label: 'Load #XP-112034', href: '#' }],
    source: 'XPO Logistics',
    metadata: { Rate: '$3,120', Pickup: 'Tomorrow 2:00 PM', Origin: 'Memphis, TN', Destination: 'Atlanta, GA' },
  },
  {
    id: 'n6',
    category: 'Load',
    priority: 'success',
    title: 'Load #EG-902110 Picked Up',
    body: 'Mike Rodriguez checked in at shipper. Load is en route. ETA: tomorrow 3:00 PM CT.',
    timestamp: '2026-05-12T05:10:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'Track Load', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #EG-902110', href: '#' }, { label: 'Driver Tracking', href: '#' }],
    source: 'ELD System',
    metadata: { Driver: 'Mike Rodriguez', Pickup: '5:10 AM CT', ETA: 'Tomorrow 3:00 PM', Origin: 'Dallas, TX' },
  },
  {
    id: 'n7',
    category: 'Load',
    priority: 'info',
    title: 'Market Alert: TX→CA Spot Rates +8%',
    body: 'Texas to California dry van spot rates increased 8% this week. 12 open loads available in your lane.',
    timestamp: '2026-05-11T20:00:00Z',
    read: true,
    icon: '📈',
    actionRequired: false,
    actions: [{ label: 'View Open Loads', variant: 'primary' }, { label: 'Rate Analytics', variant: 'secondary' }],
    relatedLinks: [{ label: 'Market Dashboard', href: '#' }, { label: 'TX→CA Loads', href: '#' }],
    source: 'Market Intelligence',
    metadata: { Lane: 'TX → CA', Change: '+8%', 'Open Loads': '12', 'Avg Rate': '$3.41/mi' },
  },
  {
    id: 'n8',
    category: 'Load',
    priority: 'warning',
    title: 'Detention Exceeded — Load #TQ-554832',
    body: '3 hours 22 minutes detention at shipper facility. Detention rate of $75/hr applies. Total: $252 billable.',
    timestamp: '2026-05-11T18:45:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'File Detention Claim', variant: 'primary' }, { label: 'Contact Broker', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #TQ-554832', href: '#' }, { label: 'Detention Policy', href: '#' }],
    source: 'ELD System',
    metadata: { Duration: '3h 22min', Rate: '$75/hr', Total: '$252', Facility: 'Memphis Distribution Center' },
  },
  // Finance notifications
  {
    id: 'n9',
    category: 'Finance',
    priority: 'success',
    title: 'Invoice INV-1042 Paid',
    body: 'Echo Global Logistics paid $1,854 for Load #EG-920441. Funds will be deposited in 1-2 business days.',
    timestamp: '2026-05-12T11:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View Invoice', variant: 'secondary' }, { label: 'Download Receipt', variant: 'secondary' }],
    relatedLinks: [{ label: 'INV-1042', href: '#' }, { label: 'Echo Global Profile', href: '#' }],
    source: 'Billing System',
    metadata: { Amount: '$1,854', Broker: 'Echo Global Logistics', 'Load ID': '#EG-920441', 'Deposit ETA': '1-2 business days' },
  },
  {
    id: 'n10',
    category: 'Finance',
    priority: 'urgent',
    title: 'Invoice INV-1039 OVERDUE',
    body: '$796 from Arrive Logistics is 2 days overdue. Please follow up immediately to avoid cash flow impact.',
    timestamp: '2026-05-12T08:00:00Z',
    read: false,
    icon: '🔴',
    actionRequired: true,
    actions: [{ label: 'Send Reminder', variant: 'primary' }, { label: 'View Invoice', variant: 'secondary' }, { label: 'Escalate', variant: 'danger' }],
    relatedLinks: [{ label: 'INV-1039', href: '#' }, { label: 'Arrive Logistics', href: '#' }],
    source: 'Billing System',
    metadata: { Amount: '$796', Broker: 'Arrive Logistics', 'Days Overdue': '2', 'Due Date': 'May 10, 2026' },
  },
  {
    id: 'n11',
    category: 'Finance',
    priority: 'warning',
    title: 'IFTA Q2 Filing Deadline — 14 Days',
    body: 'Q2 IFTA filing due in 14 days. Estimated refund: $57 based on current mileage data.',
    timestamp: '2026-05-12T07:00:00Z',
    read: false,
    icon: '📋',
    actionRequired: true,
    actions: [{ label: 'Prepare Filing', variant: 'primary' }, { label: 'View Mileage Report', variant: 'secondary' }],
    relatedLinks: [{ label: 'IFTA Report', href: '#' }, { label: 'Compliance Dashboard', href: '#' }],
    source: 'Compliance System',
    metadata: { Quarter: 'Q2 2026', Deadline: 'May 26, 2026', 'Est. Refund': '$57', States: '6 jurisdictions' },
  },
  {
    id: 'n12',
    category: 'Finance',
    priority: 'success',
    title: 'QuickBooks Sync Complete',
    body: '14 transactions exported to QuickBooks Online. All invoices, expenses, and payroll entries synced successfully.',
    timestamp: '2026-05-11T23:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View in QuickBooks', variant: 'secondary' }],
    relatedLinks: [{ label: 'QuickBooks Integration', href: '#' }, { label: 'Transaction Log', href: '#' }],
    source: 'QuickBooks Integration',
    metadata: { Transactions: '14', Invoices: '6', Expenses: '5', 'Payroll Entries': '3' },
  },
  {
    id: 'n13',
    category: 'Finance',
    priority: 'warning',
    title: 'Fuel Card Limit Exceeded — TA Memphis',
    body: '$312 transaction at TA Travel Center Memphis is above your daily fuel card limit of $250. Review required.',
    timestamp: '2026-05-11T15:30:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'Approve Transaction', variant: 'primary' }, { label: 'Flag for Review', variant: 'secondary' }],
    relatedLinks: [{ label: 'Fuel Card Transactions', href: '#' }, { label: 'Expense Policy', href: '#' }],
    source: 'Comdata Fuel Card',
    metadata: { Amount: '$312', Location: 'TA Memphis, TN', 'Daily Limit': '$250', Driver: 'Carlos Mendez' },
  },
  {
    id: 'n14',
    category: 'Finance',
    priority: 'success',
    title: 'Commission Payment Received — $2,272',
    body: 'April commission payment of $2,272 has been deposited. Covers 8 loads dispatched this month.',
    timestamp: '2026-05-11T10:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View Statement', variant: 'secondary' }],
    relatedLinks: [{ label: 'Commission Report', href: '#' }, { label: 'April Loads', href: '#' }],
    source: 'Billing System',
    metadata: { Amount: '$2,272', Period: 'April 2026', Loads: '8', 'Avg per Load': '$284' },
  },
  // Compliance notifications
  {
    id: 'n15',
    category: 'Compliance',
    priority: 'warning',
    title: 'Insurance Renewal — 30 Days',
    body: 'Progressive Commercial auto policy expires in 30 days. Renewal quote: $4,800/yr. Action needed to avoid lapse.',
    timestamp: '2026-05-12T09:00:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'Renew Policy', variant: 'primary' }, { label: 'Get Quotes', variant: 'secondary' }],
    relatedLinks: [{ label: 'Policy Details', href: '#' }, { label: 'Insurance Documents', href: '#' }],
    source: 'Compliance System',
    metadata: { Provider: 'Progressive Commercial', 'Expiry Date': 'Jun 11, 2026', 'Renewal Quote': '$4,800/yr', Coverage: 'Cargo + Liability' },
  },
  {
    id: 'n16',
    category: 'Compliance',
    priority: 'warning',
    title: 'CDL Renewal — Mike Rodriguez (45 days)',
    body: "Driver Mike Rodriguez's CDL expires in 45 days. Schedule renewal appointment to maintain compliance.",
    timestamp: '2026-05-12T08:30:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'Schedule Appointment', variant: 'primary' }, { label: 'View Driver File', variant: 'secondary' }],
    relatedLinks: [{ label: 'Mike Rodriguez Profile', href: '#' }, { label: 'CDL Requirements', href: '#' }],
    source: 'Compliance System',
    metadata: { Driver: 'Mike Rodriguez', 'CDL Expiry': 'Jun 26, 2026', State: 'Texas', 'License Class': 'Class A CDL' },
  },
  {
    id: 'n17',
    category: 'Compliance',
    priority: 'urgent',
    title: 'Annual Inspection Due — Truck TRK-001',
    body: 'Truck TRK-001 annual DOT inspection is due in 7 days. Schedule immediately to avoid out-of-service order.',
    timestamp: '2026-05-12T07:45:00Z',
    read: false,
    icon: '🔴',
    actionRequired: true,
    actions: [{ label: 'Schedule Inspection', variant: 'primary' }, { label: 'View Truck Details', variant: 'secondary' }],
    relatedLinks: [{ label: 'Truck TRK-001', href: '#' }, { label: 'DOT Inspection Requirements', href: '#' }],
    source: 'Fleet Management',
    metadata: { Truck: 'TRK-001', 'Due Date': 'May 19, 2026', 'Last Inspection': 'May 19, 2025', VIN: '1XKWD49X8EJ398271' },
  },
  {
    id: 'n18',
    category: 'Compliance',
    priority: 'success',
    title: 'ELD Compliance Check Passed',
    body: 'Monthly ELD mandate compliance check completed. All 3 trucks passed. No HOS violations detected.',
    timestamp: '2026-05-11T12:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View ELD Report', variant: 'secondary' }],
    relatedLinks: [{ label: 'ELD Compliance Report', href: '#' }, { label: 'HOS Logs', href: '#' }],
    source: 'ELD System',
    metadata: { Trucks: '3', Drivers: '2', 'Check Date': 'May 11, 2026', Violations: 'None' },
  },
  {
    id: 'n19',
    category: 'Compliance',
    priority: 'warning',
    title: 'FMCSA Safety Audit — May 28',
    body: 'FMCSA safety audit scheduled for May 28. Ensure all driver files, maintenance records, and HOS logs are current.',
    timestamp: '2026-05-11T09:00:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'Prepare Documents', variant: 'primary' }, { label: 'Audit Checklist', variant: 'secondary' }],
    relatedLinks: [{ label: 'Audit Checklist', href: '#' }, { label: 'Driver Files', href: '#' }],
    source: 'FMCSA',
    metadata: { 'Audit Date': 'May 28, 2026', Type: 'Safety Compliance Review', Location: 'Your Terminal', 'Days Away': '16' },
  },
  // System notifications
  {
    id: 'n20',
    category: 'System',
    priority: 'info',
    title: 'New Feature: Route Planner Comparison Mode',
    body: 'Route Planner now supports side-by-side route comparison. Compare up to 3 routes on fuel cost, time, and tolls.',
    timestamp: '2026-05-12T08:00:00Z',
    read: true,
    icon: '🆕',
    actionRequired: false,
    actions: [{ label: 'Try It Now', variant: 'primary' }, { label: 'Learn More', variant: 'secondary' }],
    relatedLinks: [{ label: 'Route Planner', href: '#' }, { label: 'Feature Notes', href: '#' }],
    source: 'DispaLoadIQ Platform',
    metadata: { Feature: 'Route Comparison', Version: 'v2.4.0', Released: 'May 12, 2026', Status: 'Available' },
  },
  {
    id: 'n21',
    category: 'System',
    priority: 'warning',
    title: 'Scheduled Maintenance — May 15, 2-4am CT',
    body: 'Platform maintenance window May 15 from 2:00–4:00 AM CT. Expect brief downtime. ELD and tracking unaffected.',
    timestamp: '2026-05-11T16:00:00Z',
    read: true,
    icon: '🔧',
    actionRequired: false,
    actions: [{ label: 'Add to Calendar', variant: 'secondary' }],
    relatedLinks: [{ label: 'Status Page', href: '#' }],
    source: 'System Administration',
    metadata: { Date: 'May 15, 2026', Window: '2:00–4:00 AM CT', Impact: 'Web platform only', ELD: 'Unaffected' },
  },
  {
    id: 'n22',
    category: 'System',
    priority: 'success',
    title: 'Password Changed Successfully',
    body: 'Your account password was changed on May 12. If you did not make this change, contact support immediately.',
    timestamp: '2026-05-12T10:30:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'Security Settings', variant: 'secondary' }],
    relatedLinks: [{ label: 'Account Security', href: '#' }],
    source: 'Account Security',
    metadata: { Date: 'May 12, 2026', Time: '10:30 AM CT', IP: '192.168.1.1', Browser: 'Chrome on macOS' },
  },
  {
    id: 'n23',
    category: 'System',
    priority: 'info',
    title: 'DispaLoadIQ Pro Renewal — 7 Days',
    body: 'Your Pro subscription renews in 7 days at $29/month. Payment method: Visa •••• 4242.',
    timestamp: '2026-05-12T06:00:00Z',
    read: false,
    icon: '💳',
    actionRequired: false,
    actions: [{ label: 'Manage Subscription', variant: 'secondary' }, { label: 'Update Payment', variant: 'secondary' }],
    relatedLinks: [{ label: 'Subscription Settings', href: '#' }],
    source: 'Billing System',
    metadata: { Plan: 'Pro', 'Renewal Date': 'May 19, 2026', Amount: '$29/month', Payment: 'Visa •••• 4242' },
  },
  // Additional notifications (shown after "Load more")
  {
    id: 'n24',
    category: 'Load',
    priority: 'info',
    title: 'Load #BN-441029 — Broker Confirmation',
    body: 'BlueGrace Logistics confirmed Load #BN-441029. Pickup window confirmed: tomorrow 8-10am.',
    timestamp: '2026-05-11T14:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View Load', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #BN-441029', href: '#' }],
    source: 'BlueGrace Logistics',
    metadata: { Route: 'Nashville → Charlotte', Rate: '$1,920', Pickup: 'Tomorrow 8-10 AM', Miles: '640' },
  },
  {
    id: 'n25',
    category: 'Finance',
    priority: 'info',
    title: 'Factoring Application Approved',
    body: 'Your OTR Capital factoring application was approved. Advance rate: 90%. Funding available immediately.',
    timestamp: '2026-05-11T11:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'Setup Factoring', variant: 'primary' }, { label: 'View Terms', variant: 'secondary' }],
    relatedLinks: [{ label: 'Factoring Dashboard', href: '#' }],
    source: 'OTR Capital',
    metadata: { Provider: 'OTR Capital', 'Advance Rate': '90%', Fee: '2.5%', Status: 'Approved' },
  },
  {
    id: 'n26',
    category: 'Compliance',
    priority: 'info',
    title: 'Drug Test Scheduled — Carlos Mendez',
    body: 'Random drug test scheduled for Carlos Mendez at NextStep Labs, Memphis. Date: May 16.',
    timestamp: '2026-05-11T08:00:00Z',
    read: true,
    icon: '📋',
    actionRequired: false,
    actions: [{ label: 'View Details', variant: 'secondary' }],
    relatedLinks: [{ label: 'Carlos Mendez Profile', href: '#' }],
    source: 'Compliance System',
    metadata: { Driver: 'Carlos Mendez', Date: 'May 16, 2026', Location: 'NextStep Labs Memphis', Type: 'Random' },
  },
  {
    id: 'n27',
    category: 'System',
    priority: 'info',
    title: 'Mobile App Update Available',
    body: 'DispaLoadIQ Mobile v3.2.1 is available with improved ELD sync and offline mode enhancements.',
    timestamp: '2026-05-10T18:00:00Z',
    read: true,
    icon: '🆕',
    actionRequired: false,
    actions: [{ label: 'View Release Notes', variant: 'secondary' }],
    relatedLinks: [{ label: 'App Store', href: '#' }, { label: 'Release Notes', href: '#' }],
    source: 'DispaLoadIQ Platform',
    metadata: { Version: 'v3.2.1', Platform: 'iOS & Android', Released: 'May 10, 2026', Size: '48 MB' },
  },
  {
    id: 'n28',
    category: 'Load',
    priority: 'info',
    title: 'Load #TR-998822 — Rate Negotiation Update',
    body: 'Transplace countered your $3,400 offer with $3,150. You have 1 hour to respond.',
    timestamp: '2026-05-10T15:00:00Z',
    read: true,
    icon: '⏳',
    actionRequired: false,
    actions: [{ label: 'Accept $3,150', variant: 'primary' }, { label: 'Counter Offer', variant: 'secondary' }],
    relatedLinks: [{ label: 'Load #TR-998822', href: '#' }],
    source: 'Transplace',
    metadata: { Route: 'Detroit → Nashville', 'Your Offer': '$3,400', 'Their Counter': '$3,150', Deadline: '1h remaining' },
  },
  {
    id: 'n29',
    category: 'Finance',
    priority: 'info',
    title: 'Payroll Processed — $1,640',
    body: 'Weekly payroll for Carlos Mendez ($980) and fuel reimbursements ($660) processed successfully.',
    timestamp: '2026-05-10T12:00:00Z',
    read: true,
    icon: '✅',
    actionRequired: false,
    actions: [{ label: 'View Payroll Report', variant: 'secondary' }],
    relatedLinks: [{ label: 'Payroll Dashboard', href: '#' }],
    source: 'Payroll System',
    metadata: { Total: '$1,640', 'Carlos Mendez': '$980', Reimbursements: '$660', Period: 'May 4–10, 2026' },
  },
  {
    id: 'n30',
    category: 'Compliance',
    priority: 'warning',
    title: 'Registration Expiry — Trailer TR-205',
    body: 'Trailer TR-205 registration expires in 21 days. Renew to avoid roadside violation.',
    timestamp: '2026-05-10T09:00:00Z',
    read: false,
    icon: '⚠️',
    actionRequired: true,
    actions: [{ label: 'Renew Registration', variant: 'primary' }, { label: 'View Trailer', variant: 'secondary' }],
    relatedLinks: [{ label: 'Trailer TR-205', href: '#' }],
    source: 'Compliance System',
    metadata: { Trailer: 'TR-205', 'Expiry Date': 'Jun 2, 2026', State: 'Tennessee', Fee: '$185' },
  },
];

const DEFAULT_SETTINGS: NotifSettingRow[] = [
  { id: 's1', event: 'New load offer', category: 'Load', inApp: true, email: true, sms: true, push: true },
  { id: 's2', event: 'Load delivered', category: 'Load', inApp: true, email: true, sms: false, push: true },
  { id: 's3', event: 'Invoice paid', category: 'Finance', inApp: true, email: true, sms: false, push: false },
  { id: 's4', event: 'Invoice overdue', category: 'Finance', inApp: true, email: true, sms: true, push: true },
  { id: 's5', event: 'Rate confirmation needed', category: 'Load', inApp: true, email: true, sms: true, push: true },
  { id: 's6', event: 'Market rate alert', category: 'Load', inApp: true, email: false, sms: false, push: false },
  { id: 's7', event: 'Weather / delay alert', category: 'Load', inApp: true, email: true, sms: true, push: true },
  { id: 's8', event: 'Document expiring', category: 'Compliance', inApp: true, email: true, sms: false, push: true },
  { id: 's9', event: 'Compliance deadline', category: 'Compliance', inApp: true, email: true, sms: true, push: true },
  { id: 's10', event: 'Driver HOS alert', category: 'Compliance', inApp: true, email: false, sms: true, push: true },
  { id: 's11', event: 'New message', category: 'System', inApp: true, email: false, sms: false, push: true },
  { id: 's12', event: 'System maintenance', category: 'System', inApp: true, email: true, sms: false, push: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

// ─── Style constants ──────────────────────────────────────────────────────────

const C_PRIMARY = '#4BAED4';
const C_DARK = '#1A2535';
const C_BG = '#F4F7FA';
const C_CARD = '#FFFFFF';
const C_BORDER = '#E2E8F0';
const C_TEXT = '#2D3748';
const C_MUTED = '#718096';
const C_URGENT = '#E53E3E';
const C_WARNING = '#DD6B20';
const C_SUCCESS = '#38A169';
const C_INFO = '#3182CE';

const priorityColor: Record<NotifPriority, string> = {
  urgent: C_URGENT,
  warning: C_WARNING,
  success: C_SUCCESS,
  info: C_INFO,
};

const categoryColor: Record<NotifCategory, string> = {
  Load: '#553C9A',
  Finance: '#276749',
  Compliance: '#C05621',
  System: '#2C5282',
};

const categoryBg: Record<NotifCategory, string> = {
  Load: '#FAF5FF',
  Finance: '#F0FFF4',
  Compliance: '#FFFAF0',
  System: '#EBF8FF',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{
      background: C_CARD,
      border: `1px solid ${C_BORDER}`,
      borderRadius: 10,
      padding: '16px 20px',
      flex: 1,
      minWidth: 140,
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C_DARK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C_MUTED, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function CategoryBadge({ category }: { category: NotifCategory }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: categoryColor[category],
      background: categoryBg[category],
      border: `1px solid ${categoryColor[category]}30`,
    }}>
      {category}
    </span>
  );
}

function ActionButton({
  label,
  variant,
  onClick,
  small,
}: {
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  small?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: C_PRIMARY, color: '#fff', border: `1px solid ${C_PRIMARY}` },
    secondary: { background: '#fff', color: C_TEXT, border: `1px solid ${C_BORDER}` },
    danger: { background: '#FFF5F5', color: C_URGENT, border: `1px solid ${C_URGENT}40` },
  };
  return (
    <button
      onClick={onClick}
      style={{
        ...styles[variant],
        padding: small ? '4px 10px' : '7px 14px',
        borderRadius: 6,
        fontSize: small ? 11 : 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 40,
        height: 22,
        borderRadius: 11,
        background: checked ? C_PRIMARY : '#CBD5E0',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
        padding: 0,
        flexShrink: 0,
      }}
      aria-checked={checked}
      role="switch"
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: checked ? 21 : 3,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  selected,
  onSelect,
  onMarkRead,
  onDismiss,
}: {
  notif: Notification;
  selected: boolean;
  onSelect: () => void;
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? `${C_PRIMARY}0D` : hovered ? '#F7FAFC' : C_CARD,
        border: `1px solid ${selected ? C_PRIMARY : C_BORDER}`,
        borderLeft: `4px solid ${selected ? C_PRIMARY : priorityColor[notif.priority]}`,
        borderRadius: 8,
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: C_PRIMARY,
          flexShrink: 0,
        }} />
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{notif.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{
              fontSize: 13,
              fontWeight: notif.read ? 500 : 700,
              color: C_DARK,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 220,
            }}>
              {notif.title}
            </span>
          </div>
          <p style={{
            margin: '0 0 6px',
            fontSize: 12,
            color: C_MUTED,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {notif.body}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <CategoryBadge category={notif.category} />
            {notif.actionRequired && (
              <span style={{ fontSize: 10, color: C_URGENT, fontWeight: 700, textTransform: 'uppercase' }}>Action Required</span>
            )}
            <span style={{ fontSize: 11, color: C_MUTED, marginLeft: 'auto' }}>{relativeTime(notif.timestamp)}</span>
          </div>
          {/* Quick actions on hover */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginTop: 8,
            opacity: hovered || selected ? 1 : 0,
            transition: 'opacity 0.15s',
          }}>
            {!notif.read && (
              <ActionButton label="Mark Read" variant="secondary" small onClick={e => { e.stopPropagation(); onMarkRead(); }} />
            )}
            <ActionButton label="Dismiss" variant="secondary" small onClick={e => { e.stopPropagation(); onDismiss(); }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notification Detail Panel ────────────────────────────────────────────────

function NotifDetail({ notif, onMarkRead }: { notif: Notification; onMarkRead: () => void }) {
  const borderColor = priorityColor[notif.priority];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        background: C_CARD,
        border: `1px solid ${C_BORDER}`,
        borderTop: `4px solid ${borderColor}`,
        borderRadius: 10,
        padding: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 28, lineHeight: 1 }}>{notif.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <CategoryBadge category={notif.category} />
              <span style={{
                padding: '2px 8px',
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: borderColor,
                background: `${borderColor}15`,
                border: `1px solid ${borderColor}30`,
              }}>
                {notif.priority}
              </span>
              {!notif.read && (
                <span style={{ fontSize: 11, color: C_PRIMARY, fontWeight: 600 }}>• Unread</span>
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C_DARK, lineHeight: 1.3 }}>{notif.title}</h2>
          </div>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: 14, color: C_TEXT, lineHeight: 1.6 }}>{notif.body}</p>

        {/* Metadata grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
          padding: 14,
          background: C_BG,
          borderRadius: 8,
          marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C_MUTED, textTransform: 'uppercase', marginBottom: 2 }}>Received</div>
            <div style={{ fontSize: 12, color: C_TEXT, fontWeight: 500 }}>{formatTimestamp(notif.timestamp)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C_MUTED, textTransform: 'uppercase', marginBottom: 2 }}>Source</div>
            <div style={{ fontSize: 12, color: C_TEXT, fontWeight: 500 }}>{notif.source}</div>
          </div>
          {Object.entries(notif.metadata).map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C_MUTED, textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
              <div style={{ fontSize: 12, color: C_TEXT, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {notif.actions.map((a, i) => (
            <ActionButton key={i} label={a.label} variant={a.variant} />
          ))}
          {!notif.read && (
            <button
              onClick={onMarkRead}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: C_PRIMARY,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Mark as read
            </button>
          )}
        </div>
      </div>

      {/* Related links */}
      {notif.relatedLinks.length > 0 && (
        <div style={{
          background: C_CARD,
          border: `1px solid ${C_BORDER}`,
          borderRadius: 10,
          padding: 16,
        }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: C_DARK }}>Related Items</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {notif.relatedLinks.map((l, i) => (
              <a
                key={i}
                href={l.href}
                onClick={e => e.preventDefault()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  background: C_BG,
                  border: `1px solid ${C_BORDER}`,
                  borderRadius: 6,
                  fontSize: 12,
                  color: C_PRIMARY,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                🔗 {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notification Settings Panel ──────────────────────────────────────────────

function NotifSettings({
  settings,
  onToggle,
  quietFrom,
  quietTo,
  timezone,
  digestMode,
  urgentOnly,
  onQuietFrom,
  onQuietTo,
  onTimezone,
  onDigest,
  onUrgentOnly,
}: {
  settings: NotifSettingRow[];
  onToggle: (id: string, channel: Channel) => void;
  quietFrom: string;
  quietTo: string;
  timezone: string;
  digestMode: boolean;
  urgentOnly: boolean;
  onQuietFrom: (v: string) => void;
  onQuietTo: (v: string) => void;
  onTimezone: (v: string) => void;
  onDigest: (v: boolean) => void;
  onUrgentOnly: (v: boolean) => void;
}) {
  const categories: NotifCategory[] = ['Load', 'Finance', 'Compliance', 'System'];
  const channels: { key: Channel; label: string; icon: string }[] = [
    { key: 'inApp', label: 'In-App', icon: '🔔' },
    { key: 'email', label: 'Email', icon: '📧' },
    { key: 'sms', label: 'SMS', icon: '💬' },
    { key: 'push', label: 'Push', icon: '📱' },
  ];
  const timezones = ['CT (Chicago)', 'ET (New York)', 'MT (Denver)', 'PT (Los Angeles)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Per-event table */}
      <div style={{ background: C_CARD, border: `1px solid ${C_BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C_BORDER}`, background: C_BG }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C_DARK }}>Notification Channels</h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: C_MUTED }}>Choose how you receive each event type</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: C_MUTED, fontSize: 11, textTransform: 'uppercase', borderBottom: `1px solid ${C_BORDER}`, width: '45%' }}>Event</th>
                {channels.map(c => (
                  <th key={c.key} style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: C_MUTED, fontSize: 11, textTransform: 'uppercase', borderBottom: `1px solid ${C_BORDER}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const rows = settings.filter(s => s.category === cat);
                return (
                  <>
                    <tr key={`cat-${cat}`}>
                      <td
                        colSpan={5}
                        style={{
                          padding: '6px 16px',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: categoryColor[cat],
                          background: categoryBg[cat],
                          borderBottom: `1px solid ${C_BORDER}`,
                        }}
                      >
                        {cat}
                      </td>
                    </tr>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        style={{ background: idx % 2 === 0 ? '#fff' : '#FAFBFC', borderBottom: `1px solid ${C_BORDER}` }}
                      >
                        <td style={{ padding: '10px 16px', color: C_TEXT, fontWeight: 500 }}>{row.event}</td>
                        {channels.map(c => (
                          <td key={c.key} style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <Toggle
                                checked={row[c.key]}
                                onChange={() => onToggle(row.id, c.key)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiet Hours */}
      <div style={{ background: C_CARD, border: `1px solid ${C_BORDER}`, borderRadius: 10, padding: 20 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C_DARK }}>🌙 Quiet Hours</h3>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: C_MUTED }}>Suppress non-urgent notifications during these hours</p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C_MUTED, marginBottom: 4 }}>From</label>
            <input
              type="time"
              value={quietFrom}
              onChange={e => onQuietFrom(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${C_BORDER}`,
                borderRadius: 6,
                fontSize: 14,
                color: C_TEXT,
                background: C_CARD,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C_MUTED, marginBottom: 4 }}>To</label>
            <input
              type="time"
              value={quietTo}
              onChange={e => onQuietTo(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${C_BORDER}`,
                borderRadius: 6,
                fontSize: 14,
                color: C_TEXT,
                background: C_CARD,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C_MUTED, marginBottom: 4 }}>Timezone</label>
            <select
              value={timezone}
              onChange={e => onTimezone(e.target.value)}
              style={{
                padding: '8px 12px',
                border: `1px solid ${C_BORDER}`,
                borderRadius: 6,
                fontSize: 14,
                color: C_TEXT,
                background: C_CARD,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advanced options */}
      <div style={{ background: C_CARD, border: `1px solid ${C_BORDER}`, borderRadius: 10, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: C_DARK }}>⚙️ Advanced Settings</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Digest mode */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C_TEXT, marginBottom: 2 }}>Daily Digest Email</div>
              <div style={{ fontSize: 12, color: C_MUTED }}>Receive a summary email at 8:00 AM instead of individual notifications</div>
            </div>
            <Toggle checked={digestMode} onChange={onDigest} />
          </div>

          <div style={{ height: 1, background: C_BORDER }} />

          {/* Urgent only mode */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C_TEXT, marginBottom: 2 }}>
                Urgent Only Mode
                <span style={{
                  marginLeft: 8,
                  display: 'inline-block',
                  padding: '1px 7px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: C_URGENT,
                  background: '#FFF5F5',
                  border: `1px solid ${C_URGENT}30`,
                }}>
                  Bypass Quiet Hours
                </span>
              </div>
              <div style={{ fontSize: 12, color: C_MUTED }}>Urgent alerts (new load offers, overdue invoices, inspections due) always notify regardless of quiet hours</div>
            </div>
            <Toggle checked={urgentOnly} onChange={onUrgentOnly} />
          </div>

          <div style={{ height: 1, background: C_BORDER }} />

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <ActionButton label="Reset Defaults" variant="secondary" />
            <ActionButton label="Save Settings" variant="primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationCenterPage({ role }: { role: UserRole }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterTab>('All');
  const [selectedId, setSelectedId] = useState<string | null>('n2');
  const [rightTab, setRightTab] = useState<RightPanelTab>('detail');
  const [showAll, setShowAll] = useState(false);
  const [settings, setSettings] = useState<NotifSettingRow[]>(DEFAULT_SETTINGS);
  const [quietFrom, setQuietFrom] = useState('22:00');
  const [quietTo, setQuietTo] = useState('07:00');
  const [timezone, setTimezone] = useState('CT (Chicago)');
  const [digestMode, setDigestMode] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(true);

  // KPI counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const loadAlerts = notifications.filter(n => n.category === 'Load' && !n.read).length;
  const financeAlerts = notifications.filter(n => n.category === 'Finance' && !n.read).length;
  const actionRequired = notifications.filter(n => n.actionRequired && !n.read).length;

  // Filtered list
  const filtered = notifications.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    return n.category === filter;
  });

  const unreadInFilter = filtered.filter(n => !n.read).length;

  const visible = showAll ? filtered : filtered.slice(0, 13);
  const selectedNotif = notifications.find(n => n.id === selectedId) ?? null;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const toggleSetting = (id: string, channel: Channel) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s));
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'All', label: 'All' },
    { key: 'Unread', label: `Unread (${unreadCount})` },
    { key: 'Load', label: 'Load' },
    { key: 'Finance', label: 'Finance' },
    { key: 'Compliance', label: 'Compliance' },
    { key: 'System', label: 'System' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: C_BG,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: C_TEXT,
    }}>
      {/* Page header */}
      <div style={{
        background: C_DARK,
        padding: '20px 28px',
        borderBottom: `1px solid ${C_BORDER}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>
              🔔 Notification Center
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              Manage alerts, settings, and preferences — {role} view
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={markAllRead}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 7,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✓ Mark All Read
            </button>
            <button
              onClick={() => { setRightTab('settings'); setSelectedId(null); }}
              style={{
                padding: '8px 16px',
                background: rightTab === 'settings' ? C_PRIMARY : 'rgba(255,255,255,0.1)',
                border: `1px solid ${rightTab === 'settings' ? C_PRIMARY : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 7,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 28px', maxWidth: 1400, margin: '0 auto' }}>
        {/* KPI cards */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          <KPICard label="Unread Notifications" value={unreadCount} color={C_PRIMARY} icon="🔔" />
          <KPICard label="Load Alerts" value={loadAlerts} color="#553C9A" icon="🚛" />
          <KPICard label="Finance Alerts" value={financeAlerts} color={C_URGENT} icon="💰" />
          <KPICard label="Action Required" value={actionRequired} color={C_WARNING} icon="⚡" />
        </div>

        {/* Two-panel layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ─── Left Panel ─── */}
          <div style={{
            background: C_CARD,
            border: `1px solid ${C_BORDER}`,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'sticky',
            top: 20,
          }}>
            {/* Filter tabs */}
            <div style={{
              padding: '14px 16px 0',
              borderBottom: `1px solid ${C_BORDER}`,
              background: '#FAFBFC',
            }}>
              <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 0 }}>
                {filterTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '6px 6px 0 0',
                      border: 'none',
                      background: filter === tab.key ? C_CARD : 'transparent',
                      color: filter === tab.key ? C_PRIMARY : C_MUTED,
                      fontSize: 12,
                      fontWeight: filter === tab.key ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      borderBottom: filter === tab.key ? `2px solid ${C_PRIMARY}` : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top controls bar */}
            <div style={{
              padding: '10px 16px',
              borderBottom: `1px solid ${C_BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 12, color: C_MUTED }}>
                {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                {unreadInFilter > 0 && ` · ${unreadInFilter} unread`}
              </span>
              {unreadInFilter > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: C_PRIMARY, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div style={{
              maxHeight: 620,
              overflowY: 'auto',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              {visible.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: C_MUTED }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>All caught up!</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>No notifications in this category</div>
                </div>
              ) : (
                visible.map(n => (
                  <NotifCard
                    key={n.id}
                    notif={n}
                    selected={selectedId === n.id}
                    onSelect={() => { setSelectedId(n.id); setRightTab('detail'); }}
                    onMarkRead={() => markRead(n.id)}
                    onDismiss={() => dismiss(n.id)}
                  />
                ))
              )}

              {!showAll && filtered.length > 13 && (
                <button
                  onClick={() => setShowAll(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: C_BG,
                    border: `1px dashed ${C_BORDER}`,
                    borderRadius: 8,
                    color: C_PRIMARY,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: 4,
                  }}
                >
                  Load more ({filtered.length - 13} remaining)
                </button>
              )}
            </div>
          </div>

          {/* ─── Right Panel ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Right panel tab bar */}
            <div style={{
              display: 'flex',
              gap: 8,
              background: C_CARD,
              border: `1px solid ${C_BORDER}`,
              borderRadius: 10,
              padding: 6,
            }}>
              <button
                onClick={() => setRightTab('detail')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: 7,
                  border: 'none',
                  background: rightTab === 'detail' ? C_PRIMARY : 'transparent',
                  color: rightTab === 'detail' ? '#fff' : C_MUTED,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                📋 Notification Detail
              </button>
              <button
                onClick={() => setRightTab('settings')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: 7,
                  border: 'none',
                  background: rightTab === 'settings' ? C_PRIMARY : 'transparent',
                  color: rightTab === 'settings' ? '#fff' : C_MUTED,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ⚙️ Notification Settings
              </button>
            </div>

            {rightTab === 'detail' ? (
              selectedNotif ? (
                <NotifDetail
                  notif={selectedNotif}
                  onMarkRead={() => markRead(selectedNotif.id)}
                />
              ) : (
                <div style={{
                  background: C_CARD,
                  border: `1px solid ${C_BORDER}`,
                  borderRadius: 10,
                  padding: 60,
                  textAlign: 'center',
                  color: C_MUTED,
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C_DARK, marginBottom: 6 }}>Select a notification</div>
                  <div style={{ fontSize: 13 }}>Click any notification in the left panel to view details and take action.</div>
                </div>
              )
            ) : (
              <NotifSettings
                settings={settings}
                onToggle={toggleSetting}
                quietFrom={quietFrom}
                quietTo={quietTo}
                timezone={timezone}
                digestMode={digestMode}
                urgentOnly={urgentOnly}
                onQuietFrom={setQuietFrom}
                onQuietTo={setQuietTo}
                onTimezone={setTimezone}
                onDigest={setDigestMode}
                onUrgentOnly={setUrgentOnly}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
