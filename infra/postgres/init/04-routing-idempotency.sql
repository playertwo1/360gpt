\connect visao360
SET ROLE visao360_app;

CREATE UNIQUE INDEX IF NOT EXISTS uq_routing_decisions_event
  ON routing_decisions (event_id);

CREATE INDEX IF NOT EXISTS idx_routing_decisions_created
  ON routing_decisions (created_at DESC);
