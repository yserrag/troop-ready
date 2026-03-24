-- ============================================
-- 002_rls_policies.sql
-- ============================================

-- USERS: read own row, leaders read all in their unit
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Leaders can read all unit members"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'leader'
      AND u.unit_id = users.unit_id
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- EVENTS: anyone authenticated can read published events in their unit
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read published events in own unit"
  ON events FOR SELECT
  USING (
    status = 'published'
    AND unit_id = (SELECT unit_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Leaders can CRUD events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'leader'
      AND unit_id = events.unit_id
    )
  );

-- RSVPs: read all for events in unit, write own
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read RSVPs for unit events"
  ON rsvps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN users u ON u.unit_id = e.unit_id
      WHERE e.id = rsvps.event_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Manage own RSVPs"
  ON rsvps FOR ALL
  USING (user_id = auth.uid());

-- GEAR ITEMS: read all for unit events, leaders manage
ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read gear for unit events"
  ON gear_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN users u ON u.unit_id = e.unit_id
      WHERE e.id = gear_items.event_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Leaders manage gear"
  ON gear_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN users u ON u.unit_id = e.unit_id
      WHERE e.id = gear_items.event_id
      AND u.id = auth.uid()
      AND u.role = 'leader'
    )
  );

CREATE POLICY "Parents can claim and pack own gear"
  ON gear_items FOR UPDATE
  USING (assigned_to = auth.uid() OR assigned_to IS NULL)
  WITH CHECK (assigned_to = auth.uid());

-- DUTIES: same pattern as gear
ALTER TABLE duties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read duties for unit events"
  ON duties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN users u ON u.unit_id = e.unit_id
      WHERE e.id = duties.event_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Leaders manage duties"
  ON duties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events e
      JOIN users u ON u.unit_id = e.unit_id
      WHERE e.id = duties.event_id
      AND u.id = auth.uid()
      AND u.role = 'leader'
    )
  );

-- LEADER INVITES: only leaders can create, anyone can read (to claim)
ALTER TABLE leader_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaders can create invites"
  ON leader_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'leader'
      AND unit_id = leader_invites.unit_id
    )
  );

CREATE POLICY "Anyone can read invites to claim"
  ON leader_invites FOR SELECT
  USING (true);
