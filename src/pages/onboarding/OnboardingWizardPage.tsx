import { useState } from 'react';
import { UserRole } from '../../types';
import { supabase } from '../../lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepDef {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface FormData {
  // Shared profile
  fullName: string;
  phone: string;
  email: string;
  yearsExperience: string;
  homeState: string;

  // Owner-op: DOT/MC Setup
  dotNumber: string;
  mcNumber: string;
  authorityType: string;
  effectiveDate: string;
  dotVerified: boolean;
  dotVerifying: boolean;
  dotVerifiedName: string;

  // Owner-op: Insurance
  insuranceCarrier: string;
  policyNumber: string;
  expiryDate: string;
  coverageAmount: string;
  cargoType: string;

  // Owner-op: Truck Profile
  truckYear: string;
  truckMake: string;
  truckModel: string;
  vin: string;
  plate: string;
  plateState: string;
  truckType: string;
  fuelType: string;
  maxPayload: string;
  mpg: string;

  // Owner-op: First Load Preferences
  preferredLanes: string;
  avoidStates: string;
  minRpm: string;
  preferredLoadTypes: string[];
  homeTimeFrequency: string;

  // Owner-op / dispatcher: Integrations
  emailNotif: boolean;
  smsNotif: boolean;
  pushNotif: boolean;
  eldChoice: string;
  datSubscription: boolean;
  truckstopSubscription: boolean;

  // Dispatcher: Business Info
  companyName: string;
  ein: string;
  yearsDispatching: string;
  specialties: string[];

  // Dispatcher: Rate Structure
  defaultPercent: string;
  minLoadSize: string;
  preferredTruckTypes: string[];
  laneFocus: string;

  // Dispatcher: Client Capacity
  maxClients: number;
  availabilityHours: string;
  responseSLA: string;

  // Company: Company Info
  companyDot: string;
  companyMc: string;
  fleetSize: string;
  hqState: string;
  safetyRating: string;

  // Company: Fleet Setup (simplified)
  fleetTrucks: { unit: string; type: string; year: string; driver: string }[];

  // Company: Driver Onboarding
  inviteEmails: string;

  // Company: TMS Preferences
  dispatchMethod: string;
  companyLaneFocus: string;
  brokerPreferences: string[];

  // Company: Integrations
  quickbooksConnected: boolean;
  companyEld: string;
  companyDat: boolean;

  // Shipper: Company Info
  industry: string;
  annualFreightVolume: string;
  typicalCommodity: string;

  // Shipper: Shipping Preferences
  originStates: string;
  destinationStates: string;
  shipFrequency: string;
  typicalLoadSize: string;
  insuranceRequirements: string;

  // Shipper: Payment Setup
  paymentTerms: string;
  billingCycle: string;
  factoringInterest: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIMARY = '#4BAED4';
const DARK = '#1A2535';
const STEPS_BY_ROLE: Record<UserRole, StepDef[]> = {
  'owner-op': [
    { id: 1, title: 'Welcome & Profile',        description: 'Tell us about yourself',          icon: '👤' },
    { id: 2, title: 'DOT / MC Setup',           description: 'Verify your authority',           icon: '🏛️' },
    { id: 3, title: 'Insurance',                description: 'Coverage details',                icon: '🛡️' },
    { id: 4, title: 'Truck Profile',            description: 'Your equipment',                  icon: '🚛' },
    { id: 5, title: 'First Load Preferences',   description: 'Where you want to run',           icon: '🗺️' },
    { id: 6, title: 'Notifications & ELD',      description: 'Stay connected',                  icon: '🔔' },
  ],
  dispatcher: [
    { id: 1, title: 'Welcome & Profile',        description: 'Tell us about yourself',          icon: '👤' },
    { id: 2, title: 'Business Info',            description: 'Your dispatching business',       icon: '🏢' },
    { id: 3, title: 'Rate Structure',           description: 'How you charge',                  icon: '💰' },
    { id: 4, title: 'Client Capacity',          description: 'How many drivers you handle',     icon: '👥' },
    { id: 5, title: 'Integrations',             description: 'Tools & notifications',           icon: '🔗' },
  ],
  company: [
    { id: 1, title: 'Welcome & Profile',        description: 'Tell us about yourself',          icon: '👤' },
    { id: 2, title: 'Company Info',             description: 'DOT, fleet size & safety',        icon: '🏢' },
    { id: 3, title: 'Fleet Setup',              description: 'Register your trucks',            icon: '🚛' },
    { id: 4, title: 'Driver Onboarding',        description: 'Invite your drivers',             icon: '👷' },
    { id: 5, title: 'TMS Preferences',          description: 'Dispatch & broker settings',      icon: '📋' },
    { id: 6, title: 'Integrations',             description: 'QuickBooks, ELD & DAT',           icon: '🔗' },
  ],
  shipper: [
    { id: 1, title: 'Welcome & Profile',        description: 'Tell us about yourself',          icon: '👤' },
    { id: 2, title: 'Company Info',             description: 'Industry & freight volume',       icon: '🏭' },
    { id: 3, title: 'Shipping Preferences',     description: 'Lanes & load details',            icon: '📦' },
    { id: 4, title: 'Payment Setup',            description: 'Terms & billing',                 icon: '💳' },
  ],
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const LOAD_TYPES = ['Dry Van','Reefer','Flatbed','Tanker','Step Deck','Lowboy','Box Truck','Power Only'];
const TRUCK_TYPES_OO = ['Dry Van 53\'','Reefer 53\'','Flatbed 48\'','Flatbed 53\'','Step Deck','Lowboy','Tanker','Box Truck'];
const ELD_OPTIONS = ['Samsara','KeepTruckin (Motive)','PeopleNet','Geotab','Omnitracs','None'];
const SPECIALTIES_LIST = ['Flatbed','Reefer','Hazmat','OTR','Regional','Local','Team Drivers','Owner-Operators'];
const TRUCK_TYPES_DISP = ['Dry Van','Reefer','Flatbed','Tanker','Step Deck','Any'];
const COMPANY_BROKER_PREFS = ['DAT','Truckstop','Echo Global','Coyote','Echo','Transplace','Any'];

const INITIAL_FORM: FormData = {
  fullName: '', phone: '', email: '', yearsExperience: '', homeState: '',
  dotNumber: '', mcNumber: '', authorityType: '', effectiveDate: '',
  dotVerified: false, dotVerifying: false, dotVerifiedName: '',
  insuranceCarrier: '', policyNumber: '', expiryDate: '', coverageAmount: '', cargoType: '',
  truckYear: '', truckMake: '', truckModel: '', vin: '', plate: '', plateState: '',
  truckType: '', fuelType: '', maxPayload: '', mpg: '',
  preferredLanes: '', avoidStates: '', minRpm: '', preferredLoadTypes: [], homeTimeFrequency: '',
  emailNotif: true, smsNotif: false, pushNotif: true, eldChoice: '', datSubscription: false, truckstopSubscription: false,
  companyName: '', ein: '', yearsDispatching: '', specialties: [],
  defaultPercent: '', minLoadSize: '', preferredTruckTypes: [], laneFocus: '',
  maxClients: 5, availabilityHours: '', responseSLA: '',
  companyDot: '', companyMc: '', fleetSize: '', hqState: '', safetyRating: '',
  fleetTrucks: [{ unit: '', type: '', year: '', driver: '' }],
  inviteEmails: '',
  dispatchMethod: '', companyLaneFocus: '', brokerPreferences: [],
  quickbooksConnected: false, companyEld: '', companyDat: false,
  industry: '', annualFreightVolume: '', typicalCommodity: '',
  originStates: '', destinationStates: '', shipFrequency: '', typicalLoadSize: '', insuranceRequirements: '',
  paymentTerms: '', billingCycle: '', factoringInterest: false,
};

// ─── Small shared UI helpers ──────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1.5px solid #D0D8E4',
  fontSize: 14,
  color: DARK,
  background: '#FAFBFD',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const fieldWrap: React.CSSProperties = { marginBottom: 18 };

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function Select({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      className="input"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function PillToggle({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 24,
        border: `2px solid ${checked ? PRIMARY : '#D0D8E4'}`,
        background: checked ? `${PRIMARY}18` : '#F5F7FA',
        color: checked ? PRIMARY : '#6B7280',
        fontWeight: 600, fontSize: 13, cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <span style={{
        width: 16, height: 16, borderRadius: '50%',
        background: checked ? PRIMARY : '#D0D8E4',
        display: 'inline-block', transition: 'background 0.15s',
      }} />
      {label}
    </button>
  );
}

function MultiPill({
  options, selected, onChange,
}: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(x => x !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          style={{
            padding: '7px 14px', borderRadius: 20,
            border: `1.5px solid ${selected.includes(opt) ? PRIMARY : '#D0D8E4'}`,
            background: selected.includes(opt) ? `${PRIMARY}20` : '#F5F7FA',
            color: selected.includes(opt) ? PRIMARY : '#6B7280',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: DARK }}>{title}</h2>
      <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>{desc}</p>
    </div>
  );
}

// ─── Step Content Components ──────────────────────────────────────────────────

function StepWelcomeProfile({
  form, set, role,
}: {
  form: FormData; set: (k: keyof FormData, v: unknown) => void; role: UserRole;
}) {
  const roleLabel = role === 'owner-op' ? 'Owner-Operator'
    : role === 'dispatcher' ? 'Dispatcher'
    : role === 'company' ? 'Company / Fleet'
    : 'Shipper';

  return (
    <div>
      <SectionHeader
        icon="👤"
        title="Welcome to DispaLoadIQ!"
        desc={`You're signing up as a ${roleLabel}. Let's get your profile set up.`}
      />
      <div style={rowStyle}>
        <Field label="Full Name">
          <Input value={form.fullName} onChange={v => set('fullName', v)} placeholder="John Smith" />
        </Field>
        <Field label="Phone Number">
          <Input value={form.phone} onChange={v => set('phone', v)} placeholder="+1 (555) 000-0000" type="tel" />
        </Field>
      </div>
      <Field label="Email Address">
        <Input value={form.email} onChange={v => set('email', v)} placeholder="you@example.com" type="email" />
      </Field>
      <div style={rowStyle}>
        <Field label="Years of Experience">
          <Select
            value={form.yearsExperience}
            onChange={v => set('yearsExperience', v)}
            options={['Less than 1','1-2','3-5','6-10','10-15','15+']}
            placeholder="Select..."
          />
        </Field>
        <Field label="Home State">
          <Select
            value={form.homeState}
            onChange={v => set('homeState', v)}
            options={US_STATES}
            placeholder="Select state..."
          />
        </Field>
      </div>
    </div>
  );
}

function StepDotMc({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const handleVerify = () => {
    if (!form.dotNumber) return;
    set('dotVerifying', true);
    set('dotVerified', false);
    setTimeout(() => {
      set('dotVerifying', false);
      set('dotVerified', true);
      set('dotVerifiedName', 'Smith Transport LLC');
    }, 2200);
  };

  return (
    <div>
      <SectionHeader
        icon="🏛️"
        title="DOT / MC Authority"
        desc="Verify your FMCSA operating authority to unlock full platform features."
      />
      <div style={rowStyle}>
        <Field label="DOT Number">
          <Input value={form.dotNumber} onChange={v => set('dotNumber', v)} placeholder="e.g. 12345678" />
        </Field>
        <Field label="MC Number">
          <Input value={form.mcNumber} onChange={v => set('mcNumber', v)} placeholder="e.g. 987654" />
        </Field>
      </div>
      <div style={{ marginBottom: 18 }}>
        <button
          type="button"
          onClick={handleVerify}
          disabled={form.dotVerifying || !form.dotNumber}
          style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: form.dotVerified ? '#16A34A' : PRIMARY,
            color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            opacity: (!form.dotNumber || form.dotVerifying) ? 0.6 : 1,
            transition: 'all 0.2s',
          }}
        >
          {form.dotVerifying ? '⏳ Checking FMCSA...' : form.dotVerified ? '✅ Verified' : '🔍 Verify DOT Number'}
        </button>
        {form.dotVerified && (
          <div style={{
            marginTop: 12, padding: '12px 16px', borderRadius: 8,
            background: '#F0FDF4', border: '1.5px solid #BBF7D0',
            color: '#15803D', fontSize: 14, fontWeight: 600,
          }}>
            ✅ DOT#{form.dotNumber} Active — {form.dotVerifiedName}
          </div>
        )}
      </div>
      <div style={rowStyle}>
        <Field label="Authority Type">
          <Select
            value={form.authorityType}
            onChange={v => set('authorityType', v)}
            options={['Motor Carrier','Broker','Freight Forwarder','Motor Carrier + Broker']}
            placeholder="Select..."
          />
        </Field>
        <Field label="Effective Date">
          <Input value={form.effectiveDate} onChange={v => set('effectiveDate', v)} type="date" />
        </Field>
      </div>
    </div>
  );
}

function StepInsurance({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <SectionHeader
        icon="🛡️"
        title="Insurance Details"
        desc="Your insurance information helps brokers and shippers trust you faster."
      />
      <div style={rowStyle}>
        <Field label="Insurance Carrier">
          <Input value={form.insuranceCarrier} onChange={v => set('insuranceCarrier', v)} placeholder="e.g. Progressive Commercial" />
        </Field>
        <Field label="Policy Number">
          <Input value={form.policyNumber} onChange={v => set('policyNumber', v)} placeholder="e.g. POL-123456" />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="Policy Expiry Date">
          <Input value={form.expiryDate} onChange={v => set('expiryDate', v)} type="date" />
        </Field>
        <Field label="Coverage Amount ($)">
          <Input value={form.coverageAmount} onChange={v => set('coverageAmount', v)} placeholder="e.g. 1000000" />
        </Field>
      </div>
      <Field label="Cargo Type Covered">
        <Select
          value={form.cargoType}
          onChange={v => set('cargoType', v)}
          options={['General Freight','Refrigerated','Household Goods','Hazmat','Auto Carrier','Livestock','Bulk','Other']}
          placeholder="Select cargo type..."
        />
      </Field>
      <Field label="Upload Insurance Certificate (COI)">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); }}
          style={{
            border: `2px dashed ${dragging ? PRIMARY : '#CBD5E1'}`,
            borderRadius: 12, padding: '32px 20px', textAlign: 'center',
            background: dragging ? `${PRIMARY}0D` : '#F8FAFC',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>
            Drag & drop your COI PDF here, or{' '}
            <span style={{ color: PRIMARY, fontWeight: 600, cursor: 'pointer' }}>browse files</span>
          </p>
          <p style={{ margin: '6px 0 0', color: '#9CA3AF', fontSize: 12 }}>PDF, PNG, JPG — max 10MB</p>
        </div>
      </Field>
    </div>
  );
}

function StepTruckProfile({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🚛"
        title="Truck Profile"
        desc="Tell us about your equipment so we can match you with the right loads."
      />
      <div style={rowStyle}>
        <Field label="Year">
          <Input value={form.truckYear} onChange={v => set('truckYear', v)} placeholder="e.g. 2020" />
        </Field>
        <Field label="Make">
          <Select
            value={form.truckMake}
            onChange={v => set('truckMake', v)}
            options={['Freightliner','Kenworth','Peterbilt','Volvo','International','Mack','Western Star','Other']}
            placeholder="Select make..."
          />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="Model">
          <Input value={form.truckModel} onChange={v => set('truckModel', v)} placeholder="e.g. Cascadia" />
        </Field>
        <Field label="VIN">
          <Input value={form.vin} onChange={v => set('vin', v)} placeholder="17-char VIN" />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="License Plate">
          <Input value={form.plate} onChange={v => set('plate', v)} placeholder="e.g. ABC1234" />
        </Field>
        <Field label="Plate State">
          <Select value={form.plateState} onChange={v => set('plateState', v)} options={US_STATES} placeholder="State..." />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="Truck / Trailer Type">
          <Select
            value={form.truckType}
            onChange={v => set('truckType', v)}
            options={TRUCK_TYPES_OO}
            placeholder="Select type..."
          />
        </Field>
        <Field label="Fuel Type">
          <Select
            value={form.fuelType}
            onChange={v => set('fuelType', v)}
            options={['Diesel','Natural Gas','Electric','Hybrid']}
            placeholder="Select..."
          />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="Max Payload (lbs)">
          <Input value={form.maxPayload} onChange={v => set('maxPayload', v)} placeholder="e.g. 44000" />
        </Field>
        <Field label="Average MPG">
          <Input value={form.mpg} onChange={v => set('mpg', v)} placeholder="e.g. 6.5" />
        </Field>
      </div>
    </div>
  );
}

function StepLoadPreferences({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🗺️"
        title="First Load Preferences"
        desc="Set your lane and load preferences — our AI will match you to the best opportunities."
      />
      <Field label="Preferred Lanes (e.g. TX → CA, Southeast)">
        <Input value={form.preferredLanes} onChange={v => set('preferredLanes', v)} placeholder="e.g. TX to CA, FL to NY" />
      </Field>
      <Field label="States to Avoid">
        <Input value={form.avoidStates} onChange={v => set('avoidStates', v)} placeholder="e.g. MT, WY, ND" />
      </Field>
      <Field label="Minimum RPM (Revenue Per Mile)">
        <Select
          value={form.minRpm}
          onChange={v => set('minRpm', v)}
          options={['$1.50','$1.75','$2.00','$2.25','$2.50','$2.75','$3.00','$3.50+']}
          placeholder="Select minimum..."
        />
      </Field>
      <Field label="Preferred Load Types">
        <MultiPill
          options={LOAD_TYPES}
          selected={form.preferredLoadTypes}
          onChange={v => set('preferredLoadTypes', v)}
        />
      </Field>
      <Field label="Home Time Frequency">
        <Select
          value={form.homeTimeFrequency}
          onChange={v => set('homeTimeFrequency', v)}
          options={['Every weekend','Every 2 weeks','Monthly','Flexible / OTR','Regional (home daily)']}
          placeholder="Select..."
        />
      </Field>
    </div>
  );
}

function StepNotificationsIntegrations({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🔔"
        title="Notifications & Integrations"
        desc="Choose how you want to be notified and connect your tools."
      />
      <Field label="Notification Channels">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <PillToggle label="Email" checked={form.emailNotif} onChange={v => set('emailNotif', v)} />
          <PillToggle label="SMS" checked={form.smsNotif} onChange={v => set('smsNotif', v)} />
          <PillToggle label="Push" checked={form.pushNotif} onChange={v => set('pushNotif', v)} />
        </div>
      </Field>
      <Field label="ELD Provider">
        <Select
          value={form.eldChoice}
          onChange={v => set('eldChoice', v)}
          options={ELD_OPTIONS}
          placeholder="Select your ELD..."
        />
      </Field>
      <Field label="Load Board Subscriptions">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <PillToggle label="DAT" checked={form.datSubscription} onChange={v => set('datSubscription', v)} />
          <PillToggle label="Truckstop.com" checked={form.truckstopSubscription} onChange={v => set('truckstopSubscription', v)} />
        </div>
      </Field>
    </div>
  );
}

function StepDispatcherBusinessInfo({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🏢"
        title="Business Info"
        desc="Tell us about your dispatching business so carriers can find and trust you."
      />
      <Field label="Business / Company Name">
        <Input value={form.companyName} onChange={v => set('companyName', v)} placeholder="e.g. Elite Dispatch LLC" />
      </Field>
      <div style={rowStyle}>
        <Field label="EIN (Tax ID)">
          <Input value={form.ein} onChange={v => set('ein', v)} placeholder="XX-XXXXXXX" />
        </Field>
        <Field label="Years Dispatching">
          <Select
            value={form.yearsDispatching}
            onChange={v => set('yearsDispatching', v)}
            options={['Less than 1','1-2','3-5','6-10','10+']}
            placeholder="Select..."
          />
        </Field>
      </div>
      <Field label="Specialties">
        <MultiPill
          options={SPECIALTIES_LIST}
          selected={form.specialties}
          onChange={v => set('specialties', v)}
        />
      </Field>
    </div>
  );
}

function StepRateStructure({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="💰"
        title="Rate Structure"
        desc="Set your standard pricing so carriers know what to expect."
      />
      <div style={rowStyle}>
        <Field label="Default Commission (%)">
          <Select
            value={form.defaultPercent}
            onChange={v => set('defaultPercent', v)}
            options={['5%','6%','7%','8%','9%','10%','12%','15%','Custom']}
            placeholder="Select..."
          />
        </Field>
        <Field label="Minimum Load Size ($)">
          <Select
            value={form.minLoadSize}
            onChange={v => set('minLoadSize', v)}
            options={['$500','$750','$1,000','$1,500','$2,000','$2,500','$3,000+']}
            placeholder="Select..."
          />
        </Field>
      </div>
      <Field label="Preferred Truck Types">
        <MultiPill
          options={TRUCK_TYPES_DISP}
          selected={form.preferredTruckTypes}
          onChange={v => set('preferredTruckTypes', v)}
        />
      </Field>
      <Field label="Lane Focus">
        <Select
          value={form.laneFocus}
          onChange={v => set('laneFocus', v)}
          options={['OTR (Nationwide)','Northeast','Southeast','Midwest','Southwest','West Coast','Texas Triangle','I-95 Corridor']}
          placeholder="Select primary lane..."
        />
      </Field>
    </div>
  );
}

function StepClientCapacity({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="👥"
        title="Client Capacity"
        desc="Set your availability so carriers know if you have bandwidth to take them on."
      />
      <Field label={`Maximum Clients: ${form.maxClients}`}>
        <input
          type="range"
          min={1}
          max={20}
          value={form.maxClients}
          onChange={e => set('maxClients', Number(e.target.value))}
          style={{ width: '100%', accentColor: PRIMARY }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
          <span>1</span><span>10</span><span>20</span>
        </div>
      </Field>
      <Field label="Availability Hours">
        <Select
          value={form.availabilityHours}
          onChange={v => set('availabilityHours', v)}
          options={['Mon-Fri 8am-5pm','Mon-Fri 6am-8pm','Mon-Sat 8am-6pm','24/7','Custom']}
          placeholder="Select availability..."
        />
      </Field>
      <Field label="Response Time SLA">
        <Select
          value={form.responseSLA}
          onChange={v => set('responseSLA', v)}
          options={['Within 15 minutes','Within 30 minutes','Within 1 hour','Within 2 hours','Within 4 hours']}
          placeholder="Select SLA..."
        />
      </Field>
    </div>
  );
}

function StepCompanyInfo({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🏢"
        title="Company Info"
        desc="Your fleet's FMCSA and safety information."
      />
      <div style={rowStyle}>
        <Field label="DOT Number">
          <Input value={form.companyDot} onChange={v => set('companyDot', v)} placeholder="e.g. 12345678" />
        </Field>
        <Field label="MC Number">
          <Input value={form.companyMc} onChange={v => set('companyMc', v)} placeholder="e.g. 987654" />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="Fleet Size (# of trucks)">
          <Select
            value={form.fleetSize}
            onChange={v => set('fleetSize', v)}
            options={['1-5','6-10','11-25','26-50','51-100','100+']}
            placeholder="Select..."
          />
        </Field>
        <Field label="HQ State">
          <Select value={form.hqState} onChange={v => set('hqState', v)} options={US_STATES} placeholder="State..." />
        </Field>
      </div>
      <Field label="USDOT Safety Rating">
        <Select
          value={form.safetyRating}
          onChange={v => set('safetyRating', v)}
          options={['Satisfactory','Conditional','Unsatisfactory','Not Rated']}
          placeholder="Select rating..."
        />
      </Field>
    </div>
  );
}

function StepFleetSetup({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const trucks = form.fleetTrucks;

  const updateTruck = (idx: number, field: keyof typeof trucks[0], value: string) => {
    const updated = trucks.map((t, i) => i === idx ? { ...t, [field]: value } : t);
    set('fleetTrucks', updated);
  };

  const addTruck = () => {
    if (trucks.length < 5) set('fleetTrucks', [...trucks, { unit: '', type: '', year: '', driver: '' }]);
  };

  return (
    <div>
      <SectionHeader
        icon="🚛"
        title="Fleet Setup"
        desc="Register up to 5 trucks to get started. You can add more later."
      />
      {trucks.map((truck, idx) => (
        <div key={idx} style={{
          border: '1.5px solid #E5E7EB', borderRadius: 12, padding: 16,
          marginBottom: 16, background: '#F9FAFB',
        }}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 12, fontSize: 14 }}>
            Truck #{idx + 1}
          </div>
          <div style={rowStyle}>
            <Field label="Unit #">
              <Input value={truck.unit} onChange={v => updateTruck(idx, 'unit', v)} placeholder="e.g. T-101" />
            </Field>
            <Field label="Type">
              <Select
                value={truck.type}
                onChange={v => updateTruck(idx, 'type', v)}
                options={TRUCK_TYPES_OO}
                placeholder="Type..."
              />
            </Field>
          </div>
          <div style={rowStyle}>
            <Field label="Year">
              <Input value={truck.year} onChange={v => updateTruck(idx, 'year', v)} placeholder="e.g. 2021" />
            </Field>
            <Field label="Assigned Driver (optional)">
              <Input value={truck.driver} onChange={v => updateTruck(idx, 'driver', v)} placeholder="Driver name or email" />
            </Field>
          </div>
        </div>
      ))}
      {trucks.length < 5 && (
        <button
          type="button"
          onClick={addTruck}
          style={{
            padding: '10px 20px', borderRadius: 8, border: `2px dashed ${PRIMARY}`,
            background: 'transparent', color: PRIMARY, fontWeight: 700,
            fontSize: 14, cursor: 'pointer',
          }}
        >
          + Add Another Truck
        </button>
      )}
    </div>
  );
}

function StepDriverOnboarding({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  const [pendingInvites] = useState(['mike.johnson@example.com', 'sarah.williams@example.com']);

  return (
    <div>
      <SectionHeader
        icon="👷"
        title="Driver Onboarding"
        desc="Invite your drivers by email — they'll get a link to create their profile."
      />
      <Field label="Invite Drivers (one email per line)">
        <textarea
          value={form.inviteEmails}
          onChange={e => set('inviteEmails', e.target.value)}
          placeholder={'driver1@example.com\ndriver2@example.com'}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </Field>
      <button
        type="button"
        style={{
          padding: '10px 24px', borderRadius: 8, border: 'none',
          background: PRIMARY, color: '#fff', fontWeight: 700,
          fontSize: 14, cursor: 'pointer', marginBottom: 24,
        }}
      >
        📨 Send Invites
      </button>
      {pendingInvites.length > 0 && (
        <div>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 10, fontSize: 14 }}>
            Pending Invites ({pendingInvites.length})
          </div>
          {pendingInvites.map(email => (
            <div key={email} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 8, background: '#FFF9E6',
              border: '1.5px solid #FCD34D', marginBottom: 8, fontSize: 13,
            }}>
              <span>📧 {email}</span>
              <span style={{ color: '#D97706', fontWeight: 600 }}>⏳ Pending</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepTMSPreferences({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="📋"
        title="TMS Preferences"
        desc="Configure how you dispatch loads and which brokers you prefer working with."
      />
      <Field label="Dispatch Method">
        <Select
          value={form.dispatchMethod}
          onChange={v => set('dispatchMethod', v)}
          options={['In-house dispatchers','Outsourced dispatchers','Mixed','Self-dispatch']}
          placeholder="Select..."
        />
      </Field>
      <Field label="Primary Lane Focus">
        <Select
          value={form.companyLaneFocus}
          onChange={v => set('companyLaneFocus', v)}
          options={['OTR Nationwide','Regional','Local','Dedicated Lanes']}
          placeholder="Select..."
        />
      </Field>
      <Field label="Preferred Broker Partners">
        <MultiPill
          options={COMPANY_BROKER_PREFS}
          selected={form.brokerPreferences}
          onChange={v => set('brokerPreferences', v)}
        />
      </Field>
    </div>
  );
}

function StepCompanyIntegrations({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🔗"
        title="Integrations"
        desc="Connect your existing tools to streamline your workflow."
      />
      <Field label="QuickBooks Integration">
        <PillToggle
          label="Connect QuickBooks"
          checked={form.quickbooksConnected}
          onChange={v => set('quickbooksConnected', v)}
        />
      </Field>
      <Field label="ELD Provider">
        <Select
          value={form.companyEld}
          onChange={v => set('companyEld', v)}
          options={ELD_OPTIONS}
          placeholder="Select your ELD..."
        />
      </Field>
      <Field label="DAT Load Board">
        <PillToggle
          label="Enable DAT Integration"
          checked={form.companyDat}
          onChange={v => set('companyDat', v)}
        />
      </Field>
      <Field label="Notification Channels">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
          <PillToggle label="Email" checked={form.emailNotif} onChange={v => set('emailNotif', v)} />
          <PillToggle label="SMS" checked={form.smsNotif} onChange={v => set('smsNotif', v)} />
          <PillToggle label="Push" checked={form.pushNotif} onChange={v => set('pushNotif', v)} />
        </div>
      </Field>
    </div>
  );
}

function StepShipperCompanyInfo({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="🏭"
        title="Company Info"
        desc="Tell us about your business so carriers can understand your freight needs."
      />
      <Field label="Industry">
        <Select
          value={form.industry}
          onChange={v => set('industry', v)}
          options={['Manufacturing','Retail / E-Commerce','Agriculture','Construction','Automotive','Food & Beverage','Chemicals','Healthcare','Other']}
          placeholder="Select industry..."
        />
      </Field>
      <Field label="Annual Freight Volume">
        <Select
          value={form.annualFreightVolume}
          onChange={v => set('annualFreightVolume', v)}
          options={['Less than $100K','$100K-$500K','$500K-$1M','$1M-$5M','$5M-$20M','$20M+']}
          placeholder="Select volume..."
        />
      </Field>
      <Field label="Typical Commodity / Product">
        <Input value={form.typicalCommodity} onChange={v => set('typicalCommodity', v)} placeholder="e.g. Auto parts, Frozen food, Steel coils" />
      </Field>
    </div>
  );
}

function StepShipperPreferences({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="📦"
        title="Shipping Preferences"
        desc="Help us match you with the right carriers for your lanes."
      />
      <div style={rowStyle}>
        <Field label="Primary Origin States">
          <Input value={form.originStates} onChange={v => set('originStates', v)} placeholder="e.g. TX, CA, IL" />
        </Field>
        <Field label="Primary Destination States">
          <Input value={form.destinationStates} onChange={v => set('destinationStates', v)} placeholder="e.g. NY, FL, GA" />
        </Field>
      </div>
      <div style={rowStyle}>
        <Field label="Shipping Frequency">
          <Select
            value={form.shipFrequency}
            onChange={v => set('shipFrequency', v)}
            options={['Daily','2-3x per week','Weekly','Bi-weekly','Monthly','Sporadic']}
            placeholder="Select..."
          />
        </Field>
        <Field label="Typical Load Size">
          <Select
            value={form.typicalLoadSize}
            onChange={v => set('typicalLoadSize', v)}
            options={['Full Truckload (FTL)','Less Than Truckload (LTL)','Both FTL & LTL','Partial']}
            placeholder="Select..."
          />
        </Field>
      </div>
      <Field label="Insurance Requirements">
        <Select
          value={form.insuranceRequirements}
          onChange={v => set('insuranceRequirements', v)}
          options={['$100K minimum','$500K minimum','$1M minimum','$2M minimum','Custom (specify in notes)']}
          placeholder="Select minimum coverage..."
        />
      </Field>
    </div>
  );
}

function StepPaymentSetup({ form, set }: { form: FormData; set: (k: keyof FormData, v: unknown) => void }) {
  return (
    <div>
      <SectionHeader
        icon="💳"
        title="Payment Setup"
        desc="Configure your payment terms to keep carriers happy and cashflow smooth."
      />
      <Field label="Payment Terms">
        <Select
          value={form.paymentTerms}
          onChange={v => set('paymentTerms', v)}
          options={['Quick Pay (2-3 days)','Net 7','Net 15','Net 30','Net 45','Net 60']}
          placeholder="Select terms..."
        />
      </Field>
      <Field label="Preferred Billing Cycle">
        <Select
          value={form.billingCycle}
          onChange={v => set('billingCycle', v)}
          options={['Per Load','Weekly','Bi-weekly','Monthly']}
          placeholder="Select cycle..."
        />
      </Field>
      <Field label="Factoring Interest">
        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
          <PillToggle
            label="I'm interested in freight factoring"
            checked={form.factoringInterest}
            onChange={v => set('factoringInterest', v)}
          />
        </div>
        {form.factoringInterest && (
          <div style={{
            marginTop: 12, padding: '12px 16px', borderRadius: 8,
            background: `${PRIMARY}0D`, border: `1.5px solid ${PRIMARY}40`,
            color: PRIMARY, fontSize: 13, fontWeight: 600,
          }}>
            💡 We'll connect you with our factoring partners after setup completes.
          </div>
        )}
      </Field>
    </div>
  );
}

// ─── Completion Screen ────────────────────────────────────────────────────────

function CompletionScreen({
  form, role, userName, onComplete,
}: {
  form: FormData; role: UserRole; userName: string; onComplete: () => void;
}) {
  const confetti = ['🎉','✨','🎊','🚀','⭐','🌟','💫','🎯','🏆','🎈'];
  const randomConfetti = Array.from({ length: 20 }, (_, i) => ({
    emoji: confetti[i % confetti.length],
    left: Math.floor(Math.random() * 90) + 5,
    top: Math.floor(Math.random() * 60) + 5,
    delay: (i * 0.1).toFixed(1),
    size: Math.floor(Math.random() * 16) + 16,
  }));

  const summaryItems: { label: string; value: string }[] = [];
  if (form.fullName) summaryItems.push({ label: 'Name', value: form.fullName });
  if (form.homeState) summaryItems.push({ label: 'Home State', value: form.homeState });
  if (role === 'owner-op') {
    if (form.dotNumber) summaryItems.push({ label: 'DOT #', value: form.dotNumber });
    if (form.truckType) summaryItems.push({ label: 'Truck Type', value: form.truckType });
    if (form.minRpm) summaryItems.push({ label: 'Min RPM', value: form.minRpm });
  }
  if (role === 'dispatcher') {
    if (form.companyName) summaryItems.push({ label: 'Company', value: form.companyName });
    if (form.defaultPercent) summaryItems.push({ label: 'Commission', value: form.defaultPercent });
    summaryItems.push({ label: 'Max Clients', value: String(form.maxClients) });
  }
  if (role === 'company') {
    if (form.companyDot) summaryItems.push({ label: 'DOT #', value: form.companyDot });
    if (form.fleetSize) summaryItems.push({ label: 'Fleet Size', value: form.fleetSize });
    if (form.hqState) summaryItems.push({ label: 'HQ State', value: form.hqState });
  }
  if (role === 'shipper') {
    if (form.industry) summaryItems.push({ label: 'Industry', value: form.industry });
    if (form.annualFreightVolume) summaryItems.push({ label: 'Annual Volume', value: form.annualFreightVolume });
    if (form.paymentTerms) summaryItems.push({ label: 'Payment Terms', value: form.paymentTerms });
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '40px 20px',
      minHeight: 500, position: 'relative', overflow: 'hidden',
    }}>
      {/* Confetti burst */}
      {randomConfetti.map((c, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${c.left}%`,
            top: `${c.top}%`,
            fontSize: c.size,
            opacity: 0.85,
            animation: `confetti-fade 1.5s ease-out ${c.delay}s both`,
            pointerEvents: 'none',
          }}
        >
          {c.emoji}
        </span>
      ))}

      <style>{`
        @keyframes confetti-fade {
          0% { transform: translateY(-20px) scale(0.5); opacity: 0; }
          40% { opacity: 1; transform: translateY(0) scale(1.2); }
          100% { transform: translateY(10px) scale(1); opacity: 0.7; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ fontSize: 72, marginBottom: 16, position: 'relative', zIndex: 1 }}>🎉</div>
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: DARK,
        margin: '0 0 8px', position: 'relative', zIndex: 1,
      }}>
        Setup Complete!
      </h1>
      <p style={{
        fontSize: 16, color: '#6B7280', margin: '0 0 32px',
        maxWidth: 400, position: 'relative', zIndex: 1,
      }}>
        Welcome aboard, {userName || form.fullName || 'there'}! Your DispaLoadIQ profile is ready to go.
      </p>

      {summaryItems.length > 0 && (
        <div style={{
          background: '#F8FAFC', border: '1.5px solid #E5E7EB',
          borderRadius: 16, padding: '20px 28px', marginBottom: 32,
          minWidth: 320, maxWidth: 420,
          textAlign: 'left', position: 'relative', zIndex: 1,
        }}>
          <div style={{ fontWeight: 700, color: DARK, marginBottom: 14, fontSize: 15 }}>
            📋 Your Setup Summary
          </div>
          {summaryItems.map(item => (
            <div key={item.label} style={{
              display: 'flex', justifyContent: 'space-between',
              borderBottom: '1px solid #F1F5F9', paddingBottom: 8, marginBottom: 8,
              fontSize: 14,
            }}>
              <span style={{ color: '#6B7280' }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: DARK }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onComplete}
        style={{
          padding: '14px 40px', borderRadius: 12, border: 'none',
          background: `linear-gradient(135deg, ${PRIMARY}, #2E86B5)`,
          color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
          boxShadow: `0 4px 20px ${PRIMARY}50`,
          position: 'relative', zIndex: 1,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
      >
        🚀 Go to Dashboard
      </button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function OnboardingWizardPage({
  role,
  userName,
  userId,
  userEmail,
  onComplete,
}: {
  role: UserRole;
  userName: string;
  userId?: string;
  userEmail?: string;
  onComplete: () => void;
}) {
  const steps = STEPS_BY_ROLE[role];
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    fullName: userName || '',
    email: userEmail || '',
  });
  const [autoSaved, setAutoSaved] = useState(false);

  const setField = (key: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setAutoSaved(true);
    setTimeout(() => setAutoSaved(false), 2000);
  };

  const progressPct = completed ? 100 : Math.round(((currentStep - 1) / totalSteps) * 100);

  const goNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(s => s + 1);
      return;
    }
    // Last step → save profile to Supabase if we have a userId
    if (userId) {
      setSaving(true);
      setSaveError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('user_profiles') as any).upsert({
          id: userId,
          role,
          full_name: form.fullName || userName || 'New User',
          email: userEmail || form.email || '',
          phone: form.phone || null,
          company_name: form.companyName || null,
          mc_number: form.mcNumber || form.companyMc || null,
          dot_number: form.dotNumber || form.companyDot || null,
          state: form.homeState || form.hqState || null,
          equipment_types: form.preferredLoadTypes.length > 0 ? form.preferredLoadTypes : [],
          is_verified: false,
          subscription_tier: 'free',
        });
        if (error) throw error;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setSaveError(msg);
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setCompleted(true);
  };
  const goBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };
  const skip = async () => { await goNext(); };

  // ── Step content renderer
  const renderStep = () => {
    if (role === 'owner-op') {
      switch (currentStep) {
        case 1: return <StepWelcomeProfile form={form} set={setField} role={role} />;
        case 2: return <StepDotMc form={form} set={setField} />;
        case 3: return <StepInsurance form={form} set={setField} />;
        case 4: return <StepTruckProfile form={form} set={setField} />;
        case 5: return <StepLoadPreferences form={form} set={setField} />;
        case 6: return <StepNotificationsIntegrations form={form} set={setField} />;
        default: return null;
      }
    }
    if (role === 'dispatcher') {
      switch (currentStep) {
        case 1: return <StepWelcomeProfile form={form} set={setField} role={role} />;
        case 2: return <StepDispatcherBusinessInfo form={form} set={setField} />;
        case 3: return <StepRateStructure form={form} set={setField} />;
        case 4: return <StepClientCapacity form={form} set={setField} />;
        case 5: return <StepNotificationsIntegrations form={form} set={setField} />;
        default: return null;
      }
    }
    if (role === 'company') {
      switch (currentStep) {
        case 1: return <StepWelcomeProfile form={form} set={setField} role={role} />;
        case 2: return <StepCompanyInfo form={form} set={setField} />;
        case 3: return <StepFleetSetup form={form} set={setField} />;
        case 4: return <StepDriverOnboarding form={form} set={setField} />;
        case 5: return <StepTMSPreferences form={form} set={setField} />;
        case 6: return <StepCompanyIntegrations form={form} set={setField} />;
        default: return null;
      }
    }
    if (role === 'shipper') {
      switch (currentStep) {
        case 1: return <StepWelcomeProfile form={form} set={setField} role={role} />;
        case 2: return <StepShipperCompanyInfo form={form} set={setField} />;
        case 3: return <StepShipperPreferences form={form} set={setField} />;
        case 4: return <StepPaymentSetup form={form} set={setField} />;
        default: return null;
      }
    }
    return null;
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#F0F4F9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* ─── Left Sidebar ─────────────────────────────────────── */}
      <div style={{
        width: 280, minHeight: '100vh',
        background: DARK, color: '#fff',
        padding: '32px 20px',
        flexShrink: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo area */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: PRIMARY, letterSpacing: '-0.5px' }}>
            DispaLoadIQ
          </div>
          <div style={{ fontSize: 12, color: '#8899AA', marginTop: 4 }}>
            Account Setup Wizard
          </div>
        </div>

        {/* Step list */}
        <div style={{ flex: 1 }}>
          {steps.map(step => {
            const isDone = completed || currentStep > step.id;
            const isActive = !completed && currentStep === step.id;
            const isPending = !completed && currentStep < step.id;

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '12px 10px', borderRadius: 10,
                  marginBottom: 4,
                  background: isActive ? `${PRIMARY}20` : 'transparent',
                  transition: 'background 0.2s',
                  cursor: isDone ? 'pointer' : 'default',
                }}
                onClick={() => isDone && setCurrentStep(step.id)}
              >
                {/* Step number / check */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  background: isDone ? '#16A34A'
                    : isActive ? PRIMARY
                    : '#2D3E50',
                  color: '#fff',
                  border: isActive ? `2px solid ${PRIMARY}` : '2px solid transparent',
                  boxShadow: isActive ? `0 0 0 3px ${PRIMARY}40` : 'none',
                  transition: 'all 0.2s',
                }}>
                  {isDone ? '✓' : step.id}
                </div>

                {/* Step info */}
                <div style={{ paddingTop: 2 }}>
                  <div style={{
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fff' : isDone ? '#A8C5D4' : '#6B7D8E',
                    transition: 'color 0.2s',
                  }}>
                    {step.icon} {step.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#506070', marginTop: 2 }}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar footer */}
        <div style={{
          borderTop: '1px solid #2D3E50', paddingTop: 16, marginTop: 16,
          fontSize: 12, color: '#506070',
        }}>
          {autoSaved
            ? <span style={{ color: '#22C55E', fontWeight: 600 }}>✅ Auto-saved</span>
            : <span>💾 Changes saved automatically</span>
          }
        </div>
      </div>

      {/* ─── Right Content Area ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Progress bar */}
        <div style={{
          height: 4, background: '#E5E7EB', position: 'relative',
          flexShrink: 0,
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${PRIMARY}, #2E86B5)`,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Header bar */}
        <div style={{
          padding: '16px 40px', background: '#fff',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 14, color: '#6B7280' }}>
            {completed
              ? '🎉 All steps complete!'
              : `Step ${currentStep} of ${totalSteps} — ${steps[currentStep - 1]?.title}`
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {autoSaved && (
              <span style={{
                fontSize: 12, color: '#22C55E', fontWeight: 600,
                background: '#F0FDF4', padding: '4px 10px', borderRadius: 20,
                border: '1px solid #BBF7D0',
              }}>
                ✅ Auto-saved
              </span>
            )}
            <div style={{
              fontSize: 13, fontWeight: 600, color: DARK,
              background: '#F0F4F9', padding: '6px 14px', borderRadius: 20,
            }}>
              {progressPct}% complete
            </div>
          </div>
        </div>

        {/* Step content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
          <div style={{
            maxWidth: 680, margin: '0 auto',
            background: '#fff', borderRadius: 16,
            padding: '36px 40px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          }}>
            {completed ? (
              <CompletionScreen
                form={form}
                role={role}
                userName={userName}
                onComplete={onComplete}
              />
            ) : (
              renderStep()
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        {!completed && (
          <div style={{
            padding: '20px 40px', background: '#fff',
            borderTop: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                style={{
                  padding: '10px 22px', borderRadius: 8,
                  border: '1.5px solid #D0D8E4',
                  background: '#fff', color: DARK,
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  opacity: currentStep === 1 ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={skip}
                style={{
                  padding: '10px 22px', borderRadius: 8,
                  border: '1.5px solid #D0D8E4',
                  background: '#F5F7FA', color: '#6B7280',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Skip
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {saveError && (
                <div style={{
                  fontSize: 12, color: '#DC2626', background: '#FEF2F2',
                  border: '1px solid #FECACA', borderRadius: 6, padding: '6px 12px',
                  maxWidth: 320, textAlign: 'right',
                }}>
                  ❌ {saveError}
                </div>
              )}
              <button
                type="button"
                onClick={goNext}
                disabled={saving}
                style={{
                  padding: '10px 32px', borderRadius: 8, border: 'none',
                  background: `linear-gradient(135deg, ${PRIMARY}, #2E86B5)`,
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: `0 2px 12px ${PRIMARY}50`,
                  opacity: saving ? 0.75 : 1,
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {saving ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,.4)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin .7s linear infinite',
                    }} />
                    Saving...
                  </>
                ) : currentStep === totalSteps ? '🎉 Finish Setup' : 'Next →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
