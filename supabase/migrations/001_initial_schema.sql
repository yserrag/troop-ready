-- ============================================
-- USERS (Parents & Leaders)
-- Populated automatically on first OTP verification
-- ============================================
-- YPT SAFEGUARDING NOTE:
-- account_type blocks youth self-registration (MVP: adult only).
-- parent_user_id will link youth accounts to parents in Phase 2.
-- role='leader' can ONLY be granted via a leader_invites code,
-- ensuring chain-of-trust from the unit's founding leader.
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           TEXT UNIQUE,                    -- primary identifier for parents
  email           TEXT UNIQUE,                    -- primary identifier for leaders
  display_name    TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'parent'
                  CHECK (role IN ('leader', 'parent')),
  account_type    TEXT NOT NULL DEFAULT 'adult'
                  CHECK (account_type IN ('adult', 'youth')),
  parent_user_id  UUID REFERENCES users(id),      -- required when account_type='youth'
  unit_id         TEXT NOT NULL DEFAULT 'troop-17', -- FK to units table in Phase 2
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  -- YPT: youth accounts MUST have a parent link
  CONSTRAINT youth_requires_parent
    CHECK (account_type = 'adult' OR parent_user_id IS NOT NULL)
);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id      TEXT UNIQUE NOT NULL,           -- 8-char nanoid for URLs
  title         TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  itinerary     JSONB DEFAULT '[]',             -- array of {time, activity, notes}
  created_by    UUID REFERENCES users(id),
  unit_id       TEXT NOT NULL DEFAULT 'troop-17',
  status        TEXT NOT NULL DEFAULT 'published'
                CHECK (status IN ('draft', 'published', 'cancelled')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RSVPs
-- ============================================
CREATE TABLE rsvps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES users(id) NOT NULL,
  status        TEXT NOT NULL
                CHECK (status IN ('going', 'not_going', 'maybe')),
  head_count    INT NOT NULL DEFAULT 1,         -- "I'm bringing 2 cubs"
  note          TEXT CHECK (length(note) <= 200), -- YPT: capped, broadcast-only, no reply mechanism
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  synced_at     TIMESTAMPTZ,                    -- NULL = queued offline
  UNIQUE(event_id, user_id)
);

-- ============================================
-- GEAR LISTS (dynamic, per-event)
-- ============================================
CREATE TABLE gear_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  item_name     TEXT NOT NULL,
  quantity      INT DEFAULT 1,
  category      TEXT DEFAULT 'general'
                CHECK (category IN ('general', 'cooking', 'shelter',
                       'safety', 'personal', 'activity')),
  is_shared     BOOLEAN DEFAULT false,          -- troop-level vs personal
  assigned_to   UUID REFERENCES users(id),      -- NULL = unassigned
  is_packed     BOOLEAN DEFAULT false,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DUTY ROSTER (per-event role assignments)
-- ============================================
CREATE TABLE duties (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,                  -- "Firewood", "Cooking Sat AM"
  description   TEXT,
  time_slot     TEXT,                           -- "Saturday 7:00 AM"
  assigned_to   UUID REFERENCES users(id),      -- NULL = open slot
  assigned_by   UUID REFERENCES users(id),      -- YPT: who made this assignment
  assigned_at   TIMESTAMPTZ,                    -- YPT: when assignment was made
  is_complete   BOOLEAN DEFAULT false,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- LEADER INVITES (YPT: chain-of-trust for role elevation)
-- Leader role can ONLY be granted via invite from existing leader.
-- Prevents arbitrary self-promotion to leader role.
-- ============================================
CREATE TABLE leader_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id       TEXT NOT NULL,
  invite_code   TEXT UNIQUE NOT NULL,           -- 6-char alphanumeric
  invited_by    UUID REFERENCES users(id) NOT NULL,
  claimed_by    UUID REFERENCES users(id),
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);
