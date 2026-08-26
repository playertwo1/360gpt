\connect visao360
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET ROLE visao360_app;

ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS correlation_id uuid;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS state_id uuid;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS state_version bigint;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS assigned_to text;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS sla_policy_id text;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS escalation_level integer DEFAULT 0;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS dedupe_key text;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS duplicate_of uuid REFERENCES manual_review_requests(review_request_id);
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS affected_scope jsonb;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS impact text;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS suggested_checks jsonb DEFAULT '[]'::jsonb;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS reviewer_role text;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS allowed_resolutions jsonb DEFAULT '[]'::jsonb;
ALTER TABLE manual_review_requests ADD COLUMN IF NOT EXISTS completed_at timestamptz;

UPDATE manual_review_requests AS review
SET correlation_id = COALESCE(review.correlation_id, event.correlation_id),
    state_id = COALESCE(review.state_id, review.review_request_id),
    state_version = COALESCE(review.state_version, 1),
    category = COALESCE(review.category, 'AMBIGUOUS_INPUT'),
    sla_policy_id = COALESCE(review.sla_policy_id, 'manual-review.medium.v1'),
    escalation_level = COALESCE(review.escalation_level, 0),
    dedupe_key = COALESCE(review.dedupe_key, 'sha256:' || encode(digest(review.review_request_id::text, 'sha256'), 'hex')),
    affected_scope = COALESCE(review.affected_scope, jsonb_build_object('type', 'CLIENT', 'ids', jsonb_build_array('legacy-unknown'))),
    impact = COALESCE(review.impact, review.problem_statement),
    suggested_checks = COALESCE(review.suggested_checks, jsonb_build_array('Revalidar evidências autorizadas.')),
    reviewer_role = COALESCE(review.reviewer_role, 'GESTOR_AUTORIZADO'),
    allowed_resolutions = COALESCE(review.allowed_resolutions, '["RESOLVED_CONFIRMED","RESOLVED_CORRECTED","RESOLVED_DISMISSED","MORE_DATA_REQUIRED"]'::jsonb)
FROM events AS event
WHERE event.event_id = review.event_id;

ALTER TABLE manual_review_requests ALTER COLUMN correlation_id SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN state_id SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN state_version SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN category SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN sla_policy_id SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN escalation_level SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN dedupe_key SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN affected_scope SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN impact SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN suggested_checks SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN reviewer_role SET NOT NULL;
ALTER TABLE manual_review_requests ALTER COLUMN allowed_resolutions SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_manual_review_dedupe ON manual_review_requests (dedupe_key);
CREATE INDEX IF NOT EXISTS idx_manual_review_tenant_status ON manual_review_requests (tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_manual_review_queue_priority ON manual_review_requests (owner_queue, review_priority, created_at);
CREATE INDEX IF NOT EXISTS idx_manual_review_due_at ON manual_review_requests (due_at) WHERE completed_at IS NULL;

CREATE TABLE IF NOT EXISTS manual_review_resolutions (
  resolution_id uuid PRIMARY KEY,
  review_request_id uuid NOT NULL UNIQUE REFERENCES manual_review_requests(review_request_id),
  tenant_id text NOT NULL,
  decision text NOT NULL,
  reviewer_id text NOT NULL,
  reviewer_role text NOT NULL,
  rationale text NOT NULL,
  affected_scope jsonb NOT NULL,
  new_evidence_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_action text NOT NULL,
  resolution_hash text NOT NULL UNIQUE,
  resolved_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_resolutions_request
  ON manual_review_resolutions (review_request_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_tenant_date
  ON manual_review_resolutions (tenant_id, resolved_at DESC);
