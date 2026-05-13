-- ============================================================================
-- DispaLoadIQ — Initial Database Schema
-- Run this in Supabase: Dashboard → SQL Editor → paste → Run
-- ============================================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('owner-op', 'dispatcher', 'company', 'shipper');
CREATE TYPE load_status AS ENUM ('posted', 'bidding', 'booked', 'dispatched', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE trip_status AS ENUM ('scheduled', 'in_transit', 'delivered', 'issue');
CREATE TYPE claim_status AS ENUM ('open', 'disputed', 'paid', 'denied');
CREATE TYPE claim_type AS ENUM ('damage', 'shortage', 'delay', 'theft', 'contamination');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'disputed');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_sign', 'active', 'expired', 'terminated');
CREATE TYPE fuel_type AS ENUM ('diesel', 'def', 'gasoline');
CREATE TYPE maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE contract_type AS ENUM ('dispatcher_agreement', 'carrier_agreement', 'broker_agreement', 'other');

-- ── USER PROFILES ──────────────────────────────────────────────────────────
-- Extends Supabase auth.users with trucking-specific fields

CREATE TABLE user_profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              user_role NOT NULL,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  company_name      TEXT,
  mc_number         TEXT,
  dot_number        TEXT,
  avatar_url        TEXT,
  state             TEXT,
  city              TEXT,
  home_base         TEXT,              -- "Dallas, TX"
  equipment_types   TEXT[] DEFAULT '{}',
  is_verified       BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  subscription_tier subscription_tier DEFAULT 'free',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, role, full_name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'owner-op'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── LOADS (LOAD BOARD) ─────────────────────────────────────────────────────

CREATE TABLE loads (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipper_id          UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  dispatcher_id       UUID REFERENCES user_profiles(id),
  carrier_id          UUID REFERENCES user_profiles(id),
  status              load_status NOT NULL DEFAULT 'posted',
  origin_city         TEXT NOT NULL,
  origin_state        TEXT NOT NULL,
  origin_zip          TEXT,
  destination_city    TEXT NOT NULL,
  destination_state   TEXT NOT NULL,
  destination_zip     TEXT,
  pickup_date         DATE NOT NULL,
  delivery_date       DATE,
  commodity           TEXT NOT NULL,
  weight_lbs          NUMERIC,
  length_ft           NUMERIC,
  equipment_type      TEXT NOT NULL DEFAULT 'Dry Van',
  load_type           TEXT NOT NULL DEFAULT 'FTL',    -- FTL / LTL / Partial
  rate                NUMERIC,
  rate_per_mile       NUMERIC,
  miles               NUMERIC,
  special_requirements TEXT,
  hazmat              BOOLEAN DEFAULT FALSE,
  team_required       BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  reference_number    TEXT,
  broker_name         TEXT,
  broker_mc           TEXT,
  bids_count          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_loads_updated_at
  BEFORE UPDATE ON loads FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── LOAD BIDS ─────────────────────────────────────────────────────────────

CREATE TABLE load_bids (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id    UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  bidder_id  UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount     NUMERIC NOT NULL,
  message    TEXT,
  status     bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (load_id, bidder_id)
);

-- Auto-increment bids_count
CREATE OR REPLACE FUNCTION increment_bids_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE loads SET bids_count = bids_count + 1 WHERE id = NEW.load_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE loads SET bids_count = GREATEST(bids_count - 1, 0) WHERE id = OLD.load_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bid_count
  AFTER INSERT OR DELETE ON load_bids
  FOR EACH ROW EXECUTE FUNCTION increment_bids_count();


-- ── FLEET ─────────────────────────────────────────────────────────────────

CREATE TABLE fleet (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id           UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  unit_number          TEXT NOT NULL,
  make                 TEXT NOT NULL,
  model                TEXT NOT NULL,
  year                 INTEGER,
  vin                  TEXT,
  plate                TEXT,
  plate_state          TEXT,
  equipment_type       TEXT NOT NULL DEFAULT 'Dry Van',
  status               TEXT NOT NULL DEFAULT 'active',
  mileage              NUMERIC,
  assigned_driver_id   UUID REFERENCES user_profiles(id),
  insurance_expiry     DATE,
  registration_expiry  DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);


-- ── TRIPS (TMS) ───────────────────────────────────────────────────────────

CREATE TABLE trips (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id          UUID REFERENCES loads(id),
  driver_id        UUID NOT NULL REFERENCES user_profiles(id),
  dispatcher_id    UUID REFERENCES user_profiles(id),
  company_id       UUID REFERENCES user_profiles(id),
  status           trip_status NOT NULL DEFAULT 'scheduled',
  origin           TEXT NOT NULL,
  destination      TEXT NOT NULL,
  pickup_date      TIMESTAMPTZ NOT NULL,
  delivery_date    TIMESTAMPTZ,
  actual_delivery  TIMESTAMPTZ,
  miles            NUMERIC,
  rate             NUMERIC NOT NULL DEFAULT 0,
  driver_pay       NUMERIC,
  fuel_cost        NUMERIC,
  tolls            NUMERIC,
  other_cost       NUMERIC,
  net_profit       NUMERIC GENERATED ALWAYS AS (
    rate - COALESCE(driver_pay,0) - COALESCE(fuel_cost,0)
        - COALESCE(tolls,0) - COALESCE(other_cost,0)
  ) STORED,
  truck_id         UUID REFERENCES fleet(id),
  commodity        TEXT,
  weight_lbs       NUMERIC,
  current_lat      NUMERIC,
  current_lng      NUMERIC,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── DISPATCHER-CARRIER RELATIONSHIPS ─────────────────────────────────────

CREATE TABLE dispatcher_clients (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispatcher_id    UUID NOT NULL REFERENCES user_profiles(id),
  carrier_id       UUID NOT NULL REFERENCES user_profiles(id),
  status           TEXT NOT NULL DEFAULT 'pending',
  contract_id      UUID,
  commission_type  TEXT NOT NULL DEFAULT 'percent',
  commission_value NUMERIC NOT NULL DEFAULT 10,
  started_at       DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (dispatcher_id, carrier_id)
);


-- ── CLAIMS & DAMAGE ───────────────────────────────────────────────────────

CREATE TABLE claims (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claimant_id      UUID NOT NULL REFERENCES user_profiles(id),
  load_id          UUID REFERENCES loads(id),
  trip_id          UUID REFERENCES trips(id),
  claim_type       claim_type NOT NULL,
  status           claim_status NOT NULL DEFAULT 'open',
  commodity        TEXT NOT NULL,
  origin           TEXT NOT NULL,
  destination      TEXT NOT NULL,
  incident_date    DATE NOT NULL,
  filed_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  resolved_date    DATE,
  damage_amount    NUMERIC NOT NULL,
  settled_amount   NUMERIC,
  deductible       NUMERIC DEFAULT 0,
  broker_name      TEXT,
  carrier_name     TEXT,
  insurance_company TEXT,
  policy_number    TEXT,
  description      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_claims_updated_at
  BEFORE UPDATE ON claims FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE claim_messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id      UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  sender_id     UUID REFERENCES user_profiles(id),
  sender_type   TEXT NOT NULL DEFAULT 'user',
  sender_name   TEXT NOT NULL,
  message       TEXT NOT NULL,
  attachment_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE claim_photos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id   UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  label      TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── INVOICES ──────────────────────────────────────────────────────────────

CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id       UUID NOT NULL REFERENCES user_profiles(id),
  trip_id        UUID REFERENCES trips(id),
  load_id        UUID REFERENCES loads(id),
  invoice_number TEXT NOT NULL,
  status         invoice_status NOT NULL DEFAULT 'draft',
  bill_to_name   TEXT NOT NULL,
  bill_to_email  TEXT,
  amount         NUMERIC NOT NULL,
  tax            NUMERIC DEFAULT 0,
  total          NUMERIC GENERATED ALWAYS AS (amount + COALESCE(tax, 0)) STORED,
  due_date       DATE NOT NULL,
  paid_date      DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── CONTRACTS ─────────────────────────────────────────────────────────────

CREATE TABLE contracts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id       UUID NOT NULL REFERENCES user_profiles(id),
  counterparty_id  UUID REFERENCES user_profiles(id),
  title            TEXT NOT NULL,
  status           contract_status NOT NULL DEFAULT 'draft',
  contract_type    contract_type NOT NULL DEFAULT 'dispatcher_agreement',
  start_date       DATE,
  end_date         DATE,
  value            NUMERIC,
  terms            TEXT,
  signed_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_contracts_updated_at
  BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── FUEL LOG ──────────────────────────────────────────────────────────────

CREATE TABLE fuel_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES user_profiles(id),
  trip_id           UUID REFERENCES trips(id),
  truck_id          UUID REFERENCES fleet(id),
  date              DATE NOT NULL,
  location          TEXT NOT NULL,
  state             TEXT NOT NULL,
  gallons           NUMERIC NOT NULL,
  price_per_gallon  NUMERIC NOT NULL,
  total_cost        NUMERIC GENERATED ALWAYS AS (gallons * price_per_gallon) STORED,
  odometer          NUMERIC,
  fuel_type         fuel_type NOT NULL DEFAULT 'diesel',
  card_used         TEXT,
  receipt_url       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ── MAINTENANCE ───────────────────────────────────────────────────────────

CREATE TABLE maintenance_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES user_profiles(id),
  truck_id       UUID REFERENCES fleet(id),
  unit_number    TEXT NOT NULL,
  service_type   TEXT NOT NULL,
  description    TEXT,
  status         maintenance_status NOT NULL DEFAULT 'scheduled',
  priority       maintenance_priority NOT NULL DEFAULT 'medium',
  service_date   DATE NOT NULL,
  completed_date DATE,
  odometer       NUMERIC,
  cost           NUMERIC,
  vendor         TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;


-- ── AI CHAT ───────────────────────────────────────────────────────────────

CREATE TABLE ai_conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conv_user ON ai_conversations(user_id, created_at DESC);


-- ── VIEWS ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW loads_with_shipper AS
SELECT
  l.*,
  p.full_name  AS shipper_name,
  p.mc_number  AS shipper_mc,
  p.company_name AS shipper_company
FROM loads l
JOIN user_profiles p ON p.id = l.shipper_id;


-- Lane stats function (for Heatmap)
CREATE OR REPLACE FUNCTION get_lane_stats(
  p_origin_state TEXT,
  p_destination_state TEXT
)
RETURNS TABLE(avg_rate NUMERIC, avg_rpm NUMERIC, trip_count BIGINT, avg_miles NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rate), 2),
    ROUND(AVG(rate / NULLIF(miles, 0)), 3),
    COUNT(*),
    ROUND(AVG(miles), 0)
  FROM loads
  WHERE
    origin_state = p_origin_state AND
    destination_state = p_destination_state AND
    status IN ('delivered', 'booked') AND
    rate IS NOT NULL AND
    miles IS NOT NULL;
END;
$$ LANGUAGE plpgsql;


-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────
-- Each user can only see/edit their own data. Loads are visible to all authenticated users.

ALTER TABLE user_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_bids              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatcher_clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_photos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices               ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations       ENABLE ROW LEVEL SECURITY;

-- user_profiles: own row only (read and update)
CREATE POLICY "Users can read own profile"   ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- loads: any authenticated user can read posted loads; shippers manage theirs
CREATE POLICY "Authenticated users can read loads" ON loads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Shippers can insert loads"          ON loads FOR INSERT WITH CHECK (auth.uid() = shipper_id);
CREATE POLICY "Shippers can update own loads"      ON loads FOR UPDATE USING (auth.uid() = shipper_id);
CREATE POLICY "Shippers can delete own loads"      ON loads FOR DELETE USING (auth.uid() = shipper_id);

-- load_bids: bidder or load shipper can see; bidder can insert/update own bids
CREATE POLICY "Bid participants can read bids" ON load_bids FOR SELECT
  USING (auth.uid() = bidder_id OR auth.uid() IN (SELECT shipper_id FROM loads WHERE id = load_id));
CREATE POLICY "Bidders can place bids"   ON load_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);
CREATE POLICY "Bidders can update bids"  ON load_bids FOR UPDATE USING (auth.uid() = bidder_id);

-- trips: driver, dispatcher, or company can read own trips
CREATE POLICY "Trip participants can view" ON trips FOR SELECT
  USING (auth.uid() IN (driver_id, dispatcher_id, company_id));
CREATE POLICY "Trip participants can insert" ON trips FOR INSERT
  WITH CHECK (auth.uid() IN (driver_id, dispatcher_id, company_id));
CREATE POLICY "Trip participants can update" ON trips FOR UPDATE
  USING (auth.uid() IN (driver_id, dispatcher_id, company_id));

-- fleet: company only
CREATE POLICY "Company owns fleet" ON fleet FOR ALL USING (auth.uid() = company_id);

-- claims: claimant only
CREATE POLICY "Claimant owns claims" ON claims FOR ALL USING (auth.uid() = claimant_id);
CREATE POLICY "Claim messages visible to claimant" ON claim_messages FOR SELECT
  USING (auth.uid() IN (SELECT claimant_id FROM claims WHERE id = claim_id));
CREATE POLICY "Claimant can add messages" ON claim_messages FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT claimant_id FROM claims WHERE id = claim_id));

-- invoices, contracts, fuel_logs, maintenance: owner only
CREATE POLICY "Owner invoices"      ON invoices            FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Creator contracts"   ON contracts           FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "User fuel logs"      ON fuel_logs           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Company maintenance" ON maintenance_records FOR ALL USING (auth.uid() = company_id);

-- notifications: user only
CREATE POLICY "User notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- AI chat: user only
CREATE POLICY "User AI history" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- dispatcher_clients: participants only
CREATE POLICY "DC participants" ON dispatcher_clients FOR SELECT
  USING (auth.uid() IN (dispatcher_id, carrier_id));
CREATE POLICY "Dispatchers create DC" ON dispatcher_clients FOR INSERT
  WITH CHECK (auth.uid() = dispatcher_id);


-- ── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable Realtime for tables that need live updates
-- In Supabase dashboard: Database → Replication → enable for these tables

-- Realtime publication (run separately if needed):
-- ALTER PUBLICATION supabase_realtime ADD TABLE loads;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE trips;
-- ALTER PUBLICATION supabase_realtime ADD TABLE load_bids;


-- ── STORAGE BUCKETS ──────────────────────────────────────────────────────────
-- Create these in Supabase Dashboard → Storage:
-- 1. "claim-photos"   (public: false, allowed: image/*)
-- 2. "epod-photos"    (public: false, allowed: image/*)
-- 3. "documents"      (public: false, allowed: application/pdf, image/*)
-- 4. "avatars"        (public: true,  allowed: image/*)


-- ── SEED DATA (optional — for testing) ───────────────────────────────────────
-- After running the schema, you can seed test loads via the app's PostLoad page
-- or insert manually for demo purposes.
