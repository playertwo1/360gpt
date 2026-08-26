\connect visao360
SET ROLE visao360_app;

CREATE TABLE IF NOT EXISTS events (
  event_id uuid PRIMARY KEY,
  tenant_id text NOT NULL,
  correlation_id uuid NOT NULL,
  run_id uuid NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  source text NOT NULL,
  purpose text NOT NULL,
  data_classification text NOT NULL CHECK (data_classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
  status text NOT NULL CHECK (status IN ('PROCESSING', 'SUCCEEDED', 'FAILED_RETRYABLE', 'FAILED_FINAL')),
  payload_ref text,
  input_hash text NOT NULL,
  release_id text NOT NULL,
  received_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_tenant_received
  ON events (tenant_id, received_at DESC);

CREATE TABLE IF NOT EXISTS routing_decisions (
  routing_id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(event_id),
  routing_method text NOT NULL CHECK (routing_method IN ('DETERMINISTIC', 'MODEL_ASSISTED')),
  intent text NOT NULL,
  selected_domains jsonb NOT NULL,
  excluded_domains jsonb NOT NULL,
  dependencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  policy_version text NOT NULL,
  decision_status text NOT NULL CHECK (decision_status IN ('READY', 'MANUAL_REVIEW_REQUIRED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  agent_run_id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(event_id),
  parent_run_id uuid,
  agent_id text NOT NULL,
  agent_role text NOT NULL CHECK (agent_role IN ('DIRECTOR', 'GENERAL_MANAGER', 'SPECIALIST', 'MOTOR', 'ASSESSOR')),
  status text NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'TIMEOUT')),
  producer_version text NOT NULL,
  started_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS state_snapshots (
  state_id uuid NOT NULL,
  state_version bigint NOT NULL,
  tenant_id text NOT NULL,
  subject_ref text NOT NULL,
  previous_state_hash text,
  state_hash text NOT NULL UNIQUE,
  overall_status text NOT NULL CHECK (overall_status IN ('READY', 'MANUAL_REVIEW_REQUIRED')),
  snapshot jsonb NOT NULL,
  release_id text NOT NULL,
  generated_at timestamptz NOT NULL,
  PRIMARY KEY (state_id, state_version)
);

CREATE INDEX IF NOT EXISTS idx_state_subject_version
  ON state_snapshots (tenant_id, subject_ref, state_version DESC);

CREATE TABLE IF NOT EXISTS manual_review_requests (
  review_request_id uuid PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(event_id),
  tenant_id text NOT NULL,
  reason_code text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  review_priority text NOT NULL CHECK (review_priority IN ('P0', 'P1', 'P2', 'P3')),
  status text NOT NULL,
  problem_statement text NOT NULL,
  required_decision text NOT NULL,
  owner_queue text NOT NULL,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id bigserial PRIMARY KEY,
  tenant_id text NOT NULL,
  correlation_id uuid NOT NULL,
  actor text NOT NULL,
  actor_role text NOT NULL,
  action text NOT NULL,
  object_type text NOT NULL,
  object_id text NOT NULL,
  outcome text NOT NULL,
  release_id text NOT NULL,
  event_hash text NOT NULL,
  previous_event_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created
  ON audit_log (tenant_id, created_at DESC);

CREATE OR REPLACE FUNCTION prevent_audit_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$;

DROP TRIGGER IF EXISTS audit_log_append_only ON audit_log;
CREATE TRIGGER audit_log_append_only
BEFORE UPDATE OR DELETE ON audit_log
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM visao360_app;
