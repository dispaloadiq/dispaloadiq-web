-- ============================================================================
-- DispaLoadIQ — Marketplace Layer (SAFE RE-RUN VERSION)
-- Run this if 003_marketplace_layer.sql gave "relation already exists" errors.
-- Uses IF NOT EXISTS everywhere — safe to run multiple times.
-- ============================================================================

-- ── DISPATCHER PROFILES ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispatcher_profiles (
  user_id             UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  bio                 TEXT,
  trust_score         INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  verification_status TEXT DEFAULT 'unverified'
                      CHECK (verification_status IN ('unverified', 'pending', 'verified', 'certified')),
  languages           TEXT[] DEFAULT '{}',
  specialties         TEXT[] DEFAULT '{}',
  active_states       TEXT[] DEFAULT '{}',
  commission_rate     NUMERIC(4,2) DEFAULT 8.00,
  min_rpm             NUMERIC(4,2) DEFAULT 2.50,
  response_time_min   INTEGER DEFAULT 30,
  availability        TEXT DEFAULT 'available'
                      CHECK (availability IN ('available', 'busy', 'limited')),
  max_clients         INTEGER DEFAULT 5,
  current_clients     INTEGER DEFAULT 0,
  total_loads         INTEGER DEFAULT 0,
  avg_rpm             NUMERIC(4,2) DEFAULT 0,
  on_time_rate        NUMERIC(5,2) DEFAULT 0,
  client_retention    NUMERIC(5,2) DEFAULT 0,
  certifications      TEXT[] DEFAULT '{}',
  skills_score        INTEGER DEFAULT 0,
  english_score       INTEGER DEFAULT 0,
  identity_verified   BOOLEAN DEFAULT FALSE,
  portfolio_loads     JSONB DEFAULT '[]',
  stripe_account_id   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dispatcher_profiles_updated_at ON dispatcher_profiles;
CREATE TRIGGER trg_dispatcher_profiles_updated_at
  BEFORE UPDATE ON dispatcher_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_dispatcher_profiles_availability ON dispatcher_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_dispatcher_profiles_trust_score  ON dispatcher_profiles(trust_score DESC);
CREATE INDEX IF NOT EXISTS idx_dispatcher_profiles_specialties  ON dispatcher_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_dispatcher_profiles_active_states ON dispatcher_profiles USING GIN(active_states);


-- ── CONVERSATIONS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_a   UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_a        INTEGER DEFAULT 0,
  unread_b        INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_a ON conversations(participant_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_b ON conversations(participant_b, last_message_at DESC);


-- ── MESSAGES ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  message_type    TEXT DEFAULT 'text'
                  CHECK (message_type IN ('text', 'load_share', 'document', 'system')),
  metadata        JSONB,
  read            BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages(sender_id);

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_participant_a UUID;
  v_participant_b UUID;
BEGIN
  SELECT participant_a, participant_b
    INTO v_participant_a, v_participant_b
    FROM conversations
   WHERE id = NEW.conversation_id;

  IF NEW.sender_id = v_participant_a THEN
    UPDATE conversations SET
      last_message    = NEW.content,
      last_message_at = NEW.created_at,
      unread_b        = unread_b + 1
    WHERE id = NEW.conversation_id;
  ELSE
    UPDATE conversations SET
      last_message    = NEW.content,
      last_message_at = NEW.created_at,
      unread_a        = unread_a + 1
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_messages_update_conversation ON messages;
CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();


-- ── DISPATCHER RELATIONSHIPS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispatcher_relationships (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_op_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  dispatcher_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'paused', 'terminated')),
  commission_rate   NUMERIC(4,2) NOT NULL,
  min_rpm_guarantee NUMERIC(4,2),
  contract_id       UUID REFERENCES contracts(id),
  started_at        TIMESTAMPTZ,
  ended_at          TIMESTAMPTZ,
  total_loads       INTEGER DEFAULT 0,
  avg_rpm           NUMERIC(4,2) DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_op_id, dispatcher_id)
);

DROP TRIGGER IF EXISTS trg_dispatcher_relationships_updated_at ON dispatcher_relationships;
CREATE TRIGGER trg_dispatcher_relationships_updated_at
  BEFORE UPDATE ON dispatcher_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_dr_owner_op   ON dispatcher_relationships(owner_op_id, status);
CREATE INDEX IF NOT EXISTS idx_dr_dispatcher ON dispatcher_relationships(dispatcher_id, status);

CREATE OR REPLACE FUNCTION sync_dispatcher_client_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dispatcher_profiles
  SET current_clients = (
    SELECT COUNT(*)
      FROM dispatcher_relationships
     WHERE dispatcher_id = COALESCE(NEW.dispatcher_id, OLD.dispatcher_id)
       AND status = 'active'
  )
  WHERE user_id = COALESCE(NEW.dispatcher_id, OLD.dispatcher_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dr_sync_client_count ON dispatcher_relationships;
CREATE TRIGGER trg_dr_sync_client_count
  AFTER INSERT OR UPDATE OR DELETE ON dispatcher_relationships
  FOR EACH ROW EXECUTE FUNCTION sync_dispatcher_client_count();


-- ── DISPATCHER REVIEWS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispatcher_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispatcher_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewer_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  relationship_id  UUID REFERENCES dispatcher_relationships(id),
  rating           INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text             TEXT,
  loads_completed  INTEGER DEFAULT 0,
  avg_rpm_achieved NUMERIC(4,2),
  verified         BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispatcher_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_dispatcher ON dispatcher_reviews(dispatcher_id, created_at DESC);

CREATE OR REPLACE FUNCTION recalculate_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  v_dispatcher_id UUID;
  v_avg_rating    NUMERIC;
BEGIN
  v_dispatcher_id := COALESCE(NEW.dispatcher_id, OLD.dispatcher_id);

  SELECT AVG(rating) INTO v_avg_rating
    FROM dispatcher_reviews
   WHERE dispatcher_id = v_dispatcher_id AND verified = TRUE;

  UPDATE dispatcher_profiles
  SET trust_score = ROUND(COALESCE(v_avg_rating, 0) * 20)
  WHERE user_id = v_dispatcher_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reviews_recalc_trust ON dispatcher_reviews;
CREATE TRIGGER trg_reviews_recalc_trust
  AFTER INSERT OR UPDATE OR DELETE ON dispatcher_reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_trust_score();


-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────────

ALTER TABLE dispatcher_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatcher_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatcher_reviews       ENABLE ROW LEVEL SECURITY;

-- Policies (DROP IF EXISTS first so re-run is safe)
DROP POLICY IF EXISTS "Public can view dispatcher profiles"   ON dispatcher_profiles;
DROP POLICY IF EXISTS "Dispatcher can update own profile"     ON dispatcher_profiles;
DROP POLICY IF EXISTS "Dispatcher can insert own profile"     ON dispatcher_profiles;

CREATE POLICY "Public can view dispatcher profiles"
  ON dispatcher_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Dispatcher can update own profile"
  ON dispatcher_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Dispatcher can insert own profile"
  ON dispatcher_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants can view conversations"   ON conversations;
DROP POLICY IF EXISTS "Participants can insert conversations" ON conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT USING (auth.uid() IN (participant_a, participant_b));
CREATE POLICY "Participants can insert conversations"
  ON conversations FOR INSERT WITH CHECK (auth.uid() IN (participant_a, participant_b));
CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE USING (auth.uid() IN (participant_a, participant_b));

DROP POLICY IF EXISTS "Conversation participants can view messages" ON messages;
DROP POLICY IF EXISTS "Conversation participants can send messages" ON messages;

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT participant_a FROM conversations WHERE id = conversation_id
      UNION
      SELECT participant_b FROM conversations WHERE id = conversation_id
    )
  );
CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT participant_a FROM conversations WHERE id = conversation_id
      UNION
      SELECT participant_b FROM conversations WHERE id = conversation_id
    )
  );

DROP POLICY IF EXISTS "Relationship participants can view"    ON dispatcher_relationships;
DROP POLICY IF EXISTS "Owner-op can create relationships"     ON dispatcher_relationships;
DROP POLICY IF EXISTS "Owner-op can update relationships"     ON dispatcher_relationships;

CREATE POLICY "Relationship participants can view"
  ON dispatcher_relationships FOR SELECT USING (auth.uid() IN (owner_op_id, dispatcher_id));
CREATE POLICY "Owner-op can create relationships"
  ON dispatcher_relationships FOR INSERT WITH CHECK (auth.uid() = owner_op_id);
CREATE POLICY "Owner-op can update relationships"
  ON dispatcher_relationships FOR UPDATE USING (auth.uid() = owner_op_id);

DROP POLICY IF EXISTS "Authenticated users can view reviews" ON dispatcher_reviews;
DROP POLICY IF EXISTS "Reviewer can submit review"           ON dispatcher_reviews;

CREATE POLICY "Authenticated users can view reviews"
  ON dispatcher_reviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Reviewer can submit review"
  ON dispatcher_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);


-- ── REALTIME ──────────────────────────────────────────────────────────────────

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE dispatcher_profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
