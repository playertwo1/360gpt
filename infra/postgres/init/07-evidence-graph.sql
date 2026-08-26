CREATE TABLE IF NOT EXISTS evidence_nodes (
  node_id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('SOURCE_ARTIFACT','OBSERVATION','TRANSFORMATION','FINDING','RECOMMENDATION','MANUAL_REVIEW_REQUEST','REVIEW_RESOLUTION','STATE_SNAPSHOT','ACTOR')),
  entity_id TEXT NOT NULL,
  entity_version INTEGER NOT NULL DEFAULT 1 CHECK (entity_version >= 1),
  content_hash TEXT NOT NULL CHECK (content_hash ~ '^sha256:[a-f0-9]{64}$'),
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  observed_at TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ NOT NULL,
  superseded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, node_type, entity_id, entity_version)
);

CREATE TABLE IF NOT EXISTS evidence_edges (
  edge_id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('DERIVED_FROM','GENERATED_BY','USED','ATTRIBUTED_TO','SUPPORTED_BY','CONTRADICTS','SUPERSEDES','INVALIDATES','INCLUDED_IN_STATE')),
  from_node_id UUID NOT NULL REFERENCES evidence_nodes(node_id),
  to_node_id UUID NOT NULL REFERENCES evidence_nodes(node_id),
  content_hash TEXT NOT NULL CHECK (content_hash ~ '^sha256:[a-f0-9]{64}$'),
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, relationship_type, from_node_id, to_node_id)
);

CREATE INDEX IF NOT EXISTS idx_evidence_nodes_tenant_type ON evidence_nodes (tenant_id, node_type);
CREATE INDEX IF NOT EXISTS idx_evidence_nodes_entity ON evidence_nodes (tenant_id, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_nodes_recorded ON evidence_nodes (tenant_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_evidence_edges_from ON evidence_edges (tenant_id, from_node_id);
CREATE INDEX IF NOT EXISTS idx_evidence_edges_to ON evidence_edges (tenant_id, to_node_id);

CREATE OR REPLACE FUNCTION reject_evidence_graph_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Evidence Graph 360 is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS evidence_nodes_no_update ON evidence_nodes;
CREATE TRIGGER evidence_nodes_no_update BEFORE UPDATE OR DELETE ON evidence_nodes FOR EACH ROW EXECUTE FUNCTION reject_evidence_graph_mutation();
DROP TRIGGER IF EXISTS evidence_edges_no_update ON evidence_edges;
CREATE TRIGGER evidence_edges_no_update BEFORE UPDATE OR DELETE ON evidence_edges FOR EACH ROW EXECUTE FUNCTION reject_evidence_graph_mutation();
