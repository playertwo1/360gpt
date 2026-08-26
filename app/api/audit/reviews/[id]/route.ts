import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { bounded, isDenied, parseJsonObject, requireDashboardReader, type ReviewRequestRow } from '../../../reviews/shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ResolutionRow = { resolution_id: string; decision: string; reviewer_id: string; reviewer_role: string; rationale: string;
  next_action: string; resolution_hash: string; resolved_at: number; created_at: number };
type AuditRow = { id: string; actor: string; action: string; entity_type: string; entity_id: string; details_json: string; created_at: number };
type NodeRow = { node_id: string; node_type: string; entity_id: string; entity_version: number; content_hash: string; payload_json: string;
  valid_from: number | null; valid_to: number | null; observed_at: number | null; recorded_at: number; superseded_at: number | null; created_at: number };
type EdgeRow = { edge_id: string; relationship_type: string; from_node_id: string; to_node_id: string; content_hash: string; payload_json: string; created_at: number };

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireDashboardReader(); if (isDenied(access)) return access;
  const reviewId = bounded((await context.params).id, 36, UUID);
  const tenantId = bounded(new URL(request.url).searchParams.get('tenant_id') ?? 'tenant-demo', 120);
  if (!reviewId || !tenantId) return NextResponse.json({ ok: false, error: 'invalid_audit_query' }, { status: 400 });

  const review = await env.DB.prepare('SELECT * FROM manual_review_requests WHERE review_request_id = ? AND tenant_id = ?')
    .bind(reviewId, tenantId).first<ReviewRequestRow>();
  if (!review) return NextResponse.json({ ok: false, error: 'review_not_found' }, { status: 404 });
  const resolution = await env.DB.prepare(`SELECT resolution_id, decision, reviewer_id, reviewer_role, rationale, next_action, resolution_hash, resolved_at, created_at
    FROM manual_review_resolutions WHERE review_request_id = ? AND tenant_id = ?`).bind(reviewId, tenantId).first<ResolutionRow>();
  const audit = await env.DB.prepare(`SELECT id, actor, action, entity_type, entity_id, details_json, created_at FROM audit_log
    WHERE entity_id = ? ORDER BY created_at ASC LIMIT 100`).bind(reviewId).all<AuditRow>();
  const nodeResult = await env.DB.prepare(`WITH RECURSIVE connected(node_id, depth) AS (
      SELECT node_id, 0 FROM evidence_nodes WHERE tenant_id = ? AND entity_id = ?
      UNION ALL
      SELECT CASE WHEN edge.from_node_id = connected.node_id THEN edge.to_node_id ELSE edge.from_node_id END, connected.depth + 1
      FROM evidence_edges edge JOIN connected ON edge.from_node_id = connected.node_id OR edge.to_node_id = connected.node_id
      WHERE edge.tenant_id = ? AND connected.depth < 4
    )
    SELECT DISTINCT node.node_id, node.node_type, node.entity_id, node.entity_version, node.content_hash, node.payload_json,
      node.valid_from, node.valid_to, node.observed_at, node.recorded_at, node.superseded_at, node.created_at
    FROM evidence_nodes node JOIN connected ON connected.node_id = node.node_id WHERE node.tenant_id = ? LIMIT 200`)
    .bind(tenantId, reviewId, tenantId, tenantId).all<NodeRow>();
  const nodes = nodeResult.results ?? [];
  let edges: EdgeRow[] = [];
  if (nodes.length) {
    const placeholders = nodes.map(() => '?').join(','); const nodeIds = nodes.map((node) => node.node_id);
    const edgeResult = await env.DB.prepare(`SELECT edge_id, relationship_type, from_node_id, to_node_id, content_hash, payload_json, created_at
      FROM evidence_edges WHERE tenant_id = ? AND from_node_id IN (${placeholders}) AND to_node_id IN (${placeholders}) ORDER BY created_at ASC LIMIT 400`)
      .bind(tenantId, ...nodeIds, ...nodeIds).all<EdgeRow>();
    edges = edgeResult.results ?? [];
  }

  return NextResponse.json({
    ok: true, read_only: true, tenant_id: tenantId, review_request_id: reviewId,
    review: { status: review.status, reason_code: review.reason_code, state_id: review.state_id, state_version: review.state_version,
      owner_queue: review.owner_queue, created_at: iso(review.created_at), completed_at: iso(review.completed_at) },
    resolution: resolution ? { resolution_id: resolution.resolution_id, decision: resolution.decision, reviewer_id: resolution.reviewer_id,
      reviewer_role: resolution.reviewer_role, rationale: resolution.rationale, next_action: resolution.next_action,
      resolution_hash: resolution.resolution_hash, resolved_at: iso(resolution.resolved_at), created_at: iso(resolution.created_at) } : null,
    audit_events: (audit.results ?? []).map((event) => ({ id: event.id, actor: event.actor, action: event.action, entity_type: event.entity_type,
      entity_id: event.entity_id, details: parseJsonObject(event.details_json), created_at: iso(event.created_at) })),
    evidence_graph: { schema_version: '1.0.0', lineage_status: nodes.length ? 'COMPLETE' : 'ORPHAN_EVIDENCE', generated_at: new Date().toISOString(),
      nodes: nodes.map((node) => ({ node_id: node.node_id, node_type: node.node_type, entity_id: node.entity_id,
        entity_version: node.entity_version, content_hash: node.content_hash, payload: parseJsonObject(node.payload_json), valid_from: iso(node.valid_from),
        valid_to: iso(node.valid_to), observed_at: iso(node.observed_at), recorded_at: iso(node.recorded_at), superseded_at: iso(node.superseded_at), created_at: iso(node.created_at) })),
      edges: edges.map((edge) => ({ edge_id: edge.edge_id, relationship_type: edge.relationship_type, from_node_id: edge.from_node_id,
        to_node_id: edge.to_node_id, content_hash: edge.content_hash, payload: parseJsonObject(edge.payload_json), created_at: iso(edge.created_at) })) },
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

function iso(value: number | null) { return value ? new Date(value).toISOString() : null; }
