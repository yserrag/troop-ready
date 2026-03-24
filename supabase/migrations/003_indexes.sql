CREATE INDEX idx_events_short_id ON events(short_id);
CREATE INDEX idx_events_unit_status ON events(unit_id, status);
CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);
CREATE INDEX idx_gear_event ON gear_items(event_id);
CREATE INDEX idx_duties_event ON duties(event_id);
CREATE INDEX idx_leader_invites_code ON leader_invites(invite_code);
CREATE INDEX idx_leader_invites_unit ON leader_invites(unit_id);
