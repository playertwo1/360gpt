\connect visao360
SET ROLE visao360_app;

CREATE SEQUENCE IF NOT EXISTS state_snapshot_version_seq;

ALTER TABLE state_snapshots
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES events(event_id),
  ADD COLUMN IF NOT EXISTS correlation_id uuid;

ALTER TABLE state_snapshots
  ALTER COLUMN state_version SET DEFAULT nextval('state_snapshot_version_seq');

CREATE UNIQUE INDEX IF NOT EXISTS uq_state_snapshots_event
  ON state_snapshots (event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_state_correlation
  ON state_snapshots (correlation_id);
