\connect visao360
SET ROLE visao360_app;

CREATE TABLE IF NOT EXISTS event_artifacts (
  artifact_id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(event_id),
  tenant_id text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  content_hash text NOT NULL,
  content_trust text NOT NULL CHECK (content_trust IN ('TRUSTED', 'UNTRUSTED', 'QUARANTINED')),
  source_ref text,
  received_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_event_artifacts_tenant_received
  ON event_artifacts (tenant_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_artifacts_hash
  ON event_artifacts (content_hash);
