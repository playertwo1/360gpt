import { canonicalize, hashCanonical } from '../reviews/shared';

export type EvidenceNodeType = 'SOURCE_ARTIFACT' | 'OBSERVATION' | 'TRANSFORMATION' | 'FINDING' | 'RECOMMENDATION' |
  'MANUAL_REVIEW_REQUEST' | 'REVIEW_RESOLUTION' | 'STATE_SNAPSHOT' | 'ACTOR';
export type EvidenceRelationship = 'DERIVED_FROM' | 'GENERATED_BY' | 'USED' | 'ATTRIBUTED_TO' | 'SUPPORTED_BY' |
  'CONTRADICTS' | 'SUPERSEDES' | 'INVALIDATES' | 'INCLUDED_IN_STATE';

export type EvidenceNodeRecord = {
  nodeId: string; tenantId: string; nodeType: EvidenceNodeType; entityId: string; entityVersion: number; contentHash: string;
  payloadJson: string; validFrom: number | null; validTo: number | null; observedAt: number | null; recordedAt: number;
  supersededAt: number | null; createdAt: number;
};
export type EvidenceEdgeRecord = {
  edgeId: string; tenantId: string; relationshipType: EvidenceRelationship; fromNodeId: string; toNodeId: string;
  contentHash: string; payloadJson: string; createdAt: number;
};

export async function createEvidenceNode(input: {
  tenantId: string; nodeType: EvidenceNodeType; entityId: string; entityVersion?: number; contentHash?: string;
  payload?: Record<string, unknown>; validFrom?: number | null; validTo?: number | null; observedAt?: number | null;
  recordedAt: number; supersededAt?: number | null; createdAt: number; nodeId?: string;
}): Promise<EvidenceNodeRecord> {
  const entityVersion = input.entityVersion ?? 1;
  const payload = canonicalize(input.payload ?? {}) as Record<string, unknown>;
  const identityHash = await hashCanonical({ tenant_id: input.tenantId, node_type: input.nodeType, entity_id: input.entityId, entity_version: entityVersion });
  const contentHash = input.contentHash ?? await hashCanonical({ node_type: input.nodeType, entity_id: input.entityId, entity_version: entityVersion, payload });
  return {
    nodeId: input.nodeId ?? uuidFromSha256(identityHash), tenantId: input.tenantId, nodeType: input.nodeType,
    entityId: input.entityId, entityVersion, contentHash, payloadJson: JSON.stringify(payload), validFrom: input.validFrom ?? null,
    validTo: input.validTo ?? null, observedAt: input.observedAt ?? null, recordedAt: input.recordedAt,
    supersededAt: input.supersededAt ?? null, createdAt: input.createdAt,
  };
}

export async function createEvidenceEdge(input: {
  tenantId: string; relationshipType: EvidenceRelationship; fromNodeId: string; toNodeId: string;
  payload?: Record<string, unknown>; createdAt: number;
}): Promise<EvidenceEdgeRecord> {
  const payload = canonicalize(input.payload ?? {}) as Record<string, unknown>;
  const contentHash = await hashCanonical({ relationship_type: input.relationshipType, from_node_id: input.fromNodeId, to_node_id: input.toNodeId, payload });
  return {
    edgeId: uuidFromSha256(contentHash), tenantId: input.tenantId, relationshipType: input.relationshipType,
    fromNodeId: input.fromNodeId, toNodeId: input.toNodeId, contentHash, payloadJson: JSON.stringify(payload), createdAt: input.createdAt,
  };
}

export function prepareEvidenceNodeInsert(db: D1Database, node: EvidenceNodeRecord) {
  return db.prepare(`INSERT OR IGNORE INTO evidence_nodes (node_id, tenant_id, node_type, entity_id, entity_version, content_hash, payload_json,
    valid_from, valid_to, observed_at, recorded_at, superseded_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(node.nodeId, node.tenantId, node.nodeType, node.entityId, node.entityVersion, node.contentHash, node.payloadJson,
      node.validFrom, node.validTo, node.observedAt, node.recordedAt, node.supersededAt, node.createdAt);
}

export function prepareEvidenceEdgeInsert(db: D1Database, edge: EvidenceEdgeRecord) {
  return db.prepare(`INSERT OR IGNORE INTO evidence_edges (edge_id, tenant_id, relationship_type, from_node_id, to_node_id, content_hash, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(edge.edgeId, edge.tenantId, edge.relationshipType, edge.fromNodeId, edge.toNodeId, edge.contentHash, edge.payloadJson, edge.createdAt);
}

export function uuidFromSha256(hash: string) {
  const hex = hash.replace(/^sha256:/, '').slice(0, 32).split('');
  if (hex.length !== 32 || hex.some((value) => !/^[a-f0-9]$/i.test(value))) throw new Error('invalid_sha256');
  hex[12] = '5'; hex[16] = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const value = hex.join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
