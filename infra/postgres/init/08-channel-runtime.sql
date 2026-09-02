\connect visao360
SET ROLE visao360_app;

-- Estado operacional canônico dos canais. Sites e Telegram são adaptadores;
-- o PostgreSQL local é a fonte oficial de execução e histórico.
CREATE TABLE IF NOT EXISTS channel_adapters (
  adapter_id text PRIMARY KEY,
  channel text NOT NULL CHECK (channel IN ('TELEGRAM', 'SITES')),
  secret_hash text NOT NULL,
  status text NOT NULL DEFAULT 'DISABLED' CHECK (status IN ('DISABLED', 'SHADOW', 'ACTIVE', 'REVOKED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS owner_protocol_counters (
  owner_id text PRIMARY KEY,
  next_value bigint NOT NULL DEFAULT 1 CHECK (next_value > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS channel_updates (
  channel text NOT NULL CHECK (channel IN ('TELEGRAM', 'SITES')),
  external_update_id text NOT NULL,
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  chat_id text NOT NULL,
  message_id text,
  sender_is_bot boolean NOT NULL DEFAULT false,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  status text NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'QUEUED', 'PROCESSING', 'COMPLETED', 'IGNORED', 'FAILED')),
  received_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (channel, external_update_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_updates_claim
  ON channel_updates (status, received_at);

CREATE TABLE IF NOT EXISTS channel_inbound_events (
  inbound_event_id uuid PRIMARY KEY,
  channel text NOT NULL,
  external_update_id text NOT NULL,
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  chat_id text NOT NULL,
  event_kind text NOT NULL CHECK (event_kind IN ('COMMAND', 'TEXT', 'DOCUMENT', 'IMAGE', 'CALLBACK', 'OTHER')),
  text_content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_token uuid,
  lease_expires_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (channel, external_update_id),
  FOREIGN KEY (channel, external_update_id) REFERENCES channel_updates(channel, external_update_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_inbound_claim
  ON channel_inbound_events (status, available_at, lease_expires_at);

CREATE TABLE IF NOT EXISTS channel_documents (
  document_id uuid PRIMARY KEY,
  inbound_event_id uuid NOT NULL REFERENCES channel_inbound_events(inbound_event_id),
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  short_protocol bigint NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  content_hash text NOT NULL,
  storage_ref text NOT NULL,
  status text NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'QUEUED', 'PROCESSING', 'AWAITING_OWNER_INPUT', 'COMPLETED', 'FAILED', 'REVOKED')),
  received_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (owner_id, short_protocol)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_channel_documents_live_hash
  ON channel_documents (owner_id, content_hash)
  WHERE status <> 'REVOKED';

CREATE TABLE IF NOT EXISTS processing_jobs (
  job_id uuid PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES channel_documents(document_id),
  correlation_id uuid NOT NULL,
  current_stage text NOT NULL,
  progress_percent integer NOT NULL DEFAULT 10 CHECK (progress_percent BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'AWAITING_OWNER_INPUT', 'COMPLETED', 'FAILED_RETRYABLE', 'FAILED_FINAL', 'CANCELLED')),
  lease_token uuid,
  lease_expires_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  stage_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_claim
  ON processing_jobs (status, updated_at, lease_expires_at);

CREATE TABLE IF NOT EXISTS conversation_threads (
  thread_id uuid PRIMARY KEY,
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('TELEGRAM', 'SITES')),
  chat_id text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'REVOKED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, owner_id, channel, chat_id)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  conversation_message_id uuid PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES conversation_threads(thread_id),
  direction text NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND', 'INTERNAL')),
  actor_role text NOT NULL,
  external_message_id text,
  protocol bigint,
  content text NOT NULL,
  content_hash text NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, direction, external_message_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_thread
  ON conversation_messages (thread_id, created_at DESC);

CREATE TABLE IF NOT EXISTS clarification_requests_360 (
  clarification_id uuid PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES processing_jobs(job_id),
  thread_id uuid NOT NULL REFERENCES conversation_threads(thread_id),
  questions jsonb NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ANSWERED', 'RESOLVED', 'EXPIRED', 'REOPENED')),
  due_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS clarification_answers_360 (
  answer_id uuid PRIMARY KEY,
  clarification_id uuid NOT NULL REFERENCES clarification_requests_360(clarification_id),
  conversation_message_id uuid NOT NULL REFERENCES conversation_messages(conversation_message_id),
  answer_text text NOT NULL,
  interpretation jsonb,
  confidence_bps integer CHECK (confidence_bps BETWEEN 0 AND 10000),
  accepted boolean NOT NULL DEFAULT false,
  provided_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clarification_id, conversation_message_id)
);

CREATE TABLE IF NOT EXISTS learned_directives_360 (
  directive_id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  directive text NOT NULL,
  scope text NOT NULL,
  failure_type text NOT NULL,
  source_message_id uuid REFERENCES conversation_messages(conversation_message_id),
  content_hash text NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  status text NOT NULL DEFAULT 'CANDIDATE' CHECK (status IN ('CANDIDATE', 'ACTIVE', 'REJECTED', 'SUPERSEDED', 'REVOKED')),
  approved_by text,
  approved_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, content_hash, version)
);

CREATE TABLE IF NOT EXISTS directive_applications_360 (
  application_id uuid PRIMARY KEY,
  directive_id uuid NOT NULL REFERENCES learned_directives_360(directive_id),
  job_id uuid REFERENCES processing_jobs(job_id),
  run_id uuid,
  outcome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (directive_id, job_id, run_id)
);

CREATE TABLE IF NOT EXISTS channel_deliveries (
  delivery_id uuid PRIMARY KEY,
  channel text NOT NULL CHECK (channel IN ('TELEGRAM', 'SITES')),
  chat_id text NOT NULL,
  job_id uuid REFERENCES processing_jobs(job_id),
  state_id uuid,
  part_index integer NOT NULL CHECK (part_index > 0),
  part_count integer NOT NULL CHECK (part_count >= part_index),
  content text NOT NULL,
  content_hash text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'CANCELLED')),
  external_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  UNIQUE (channel, chat_id, job_id, state_id, part_index)
);

CREATE TABLE IF NOT EXISTS command_confirmations_360 (
  confirmation_id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  chat_id text NOT NULL,
  command text NOT NULL,
  target_protocol bigint,
  code_hash text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_confirmations_pending
  ON command_confirmations_360 (owner_id, chat_id, status, expires_at);

CREATE TABLE IF NOT EXISTS domain_handoffs_360 (
  handoff_id uuid PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES processing_jobs(job_id),
  source_agent text NOT NULL,
  target_agent text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('conta', 'performance', 'financeiro', 'relacionamento', 'director', 'motor')),
  schema_version text NOT NULL,
  input_hash text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED', 'MANUAL_REVIEW_REQUIRED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_domain_handoffs_job
  ON domain_handoffs_360 (job_id, domain, created_at);
