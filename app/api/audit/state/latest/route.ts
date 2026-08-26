import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { bounded, isDenied, parseJsonObject, requireDashboardReader } from '../../../reviews/shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type StateRow = { state_id: string; state_version: number; tenant_id: string; subject_ref: string; state_hash: string;
  overall_status: string; generated_at: number; published_at: number };
type AuditRow = { id: string; actor: string; action: string; entity_type: string; entity_id: string; details_json: string; created_at: number };
type NodeRow = { node_id: string; node_type: string; entity_id: string; entity_version: number; content_hash: string; payload_json: string;
  valid_from: number | null; valid_to: number | null; observed_at: number | null; recorded_at: number; superseded_at: number | null; created_at: number };
type EdgeRow = { edge_id: string; relationship_type: string; from_node_id: string; to_node_id: string; content_hash: string; payload_json: string; created_at: number };

export async function GET(request: Request) {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;

  const url = new URL(request.url);
  const tenantId = bounded(url.searchParams.get('tenant_id') ?? 'tenant-demo', 120);
  const subjectRef = bounded(url.searchParams.get('subject_ref') ?? 'cust-demo-001', 120);
  if (!tenantId || !subjectRef) return NextResponse.json({ ok: false, error: 'invalid_query' }, { status: 400 });

  const latestState = await env.DB.prepare(`
    SELECT state_id, state_version, tenant_id, subject_ref, state_hash, overall_status, generated_at, published_at
    FROM state_snapshots
    WHERE tenant_id = ? AND subject_ref = ?
    ORDER BY state_version DESC
    LIMIT 1
  `).bind(tenantId, subjectRef).first<StateRow>();

  if (!latestState) {
    return NextResponse.json({ ok: false, error: 'state_not_found' }, { status: 404 });
  }

  const audit = await env.DB.prepare(`
    SELECT id, actor, action, entity_type, entity_id, details_json, created_at
    FROM audit_log
    WHERE tenant_id = ? AND (entity_id = ? OR details_json LIKE ?)
    ORDER BY created_at ASC
    LIMIT 100
  `).bind(tenantId, latestState.state_id, `%${latestState.state_id}%`).all<AuditRow>();

  const nodeResult = await env.DB.prepare(`
    WITH RECURSIVE connected(node_id, depth) AS (
      SELECT node_id, 0 FROM evidence_nodes WHERE tenant_id = ? AND (entity_id = ? OR payload_json LIKE ?)
      UNION ALL
      SELECT CASE WHEN edge.from_node_id = connected.node_id THEN edge.to_node_id ELSE edge.from_node_id END, connected.depth + 1
      FROM evidence_edges edge JOIN connected ON edge.from_node_id = connected.node_id OR edge.to_node_id = connected.node_id
      WHERE edge.tenant_id = ? AND connected.depth < 4
    )
    SELECT DISTINCT node.node_id, node.node_type, node.entity_id, node.entity_version, node.content_hash, node.payload_json,
      node.valid_from, node.valid_to, node.observed_at, node.recorded_at, node.superseded_at, node.created_at
    FROM evidence_nodes node JOIN connected ON connected.node_id = node.node_id
    WHERE node.tenant_id = ?
    LIMIT 200
  `).bind(tenantId, latestState.state_id, `%${latestState.state_id}%`, tenantId, tenantId).all<NodeRow>();

  const nodes = nodeResult.results ?? [];
  let edges: EdgeRow[] = [];
  if (nodes.length) {
    const placeholders = nodes.map(() => '?').join(',');
    const nodeIds = nodes.map((node) => node.node_id);
    const edgeResult = await env.DB.prepare(`
      SELECT edge_id, relationship_type, from_node_id, to_node_id, content_hash, payload_json, created_at
      FROM evidence_edges
      WHERE tenant_id = ? AND from_node_id IN (${placeholders}) AND to_node_id IN (${placeholders})
      ORDER BY created_at ASC
      LIMIT 400
    `).bind(tenantId, ...nodeIds, ...nodeIds).all<EdgeRow>();
    edges = edgeResult.results ?? [];
  }

  return NextResponse.json({
    ok: true,
    read_only: true,
    tenant_id: tenantId,
    subject_ref: subjectRef,
    state: {
      state_id: latestState.state_id,
      state_version: latestState.state_version,
      state_hash: latestState.state_hash,
      overall_status: latestState.overall_status,
      generated_at: iso(latestState.generated_at),
      published_at: iso(latestState.published_at)
    },
    audit_events: (audit.results ?? []).map((event) => ({
      id: event.id,
      actor: event.actor,
      action: event.action,
      entity_type: event.entity_type,
      entity_id: event.entity_id,
      details: parseJsonObject(event.details_json),
      created_at: iso(event.created_at)
    })),
    evidence_graph: {
      schema_version: '1.0.0',
      lineage_status: nodes.length ? 'COMPLETE' : 'ORPHAN_EVIDENCE',
      prov_mapping: {
        entities: nodes.filter((n) => !['ACTOR'].includes(n.node_type)).length,
        activities: edges.length,
        agents: nodes.filter((n) => n.node_type === 'ACTOR').length
      },
      generated_at: new Date().toISOString(),
      nodes: nodes.map((node) => ({
        node_id: node.node_id,
        node_type: node.node_type,
        entity_id: node.entity_id,
        entity_version: node.entity_version,
        content_hash: node.content_hash,
        payload: parseJsonObject(node.payload_json),
        valid_from: iso(node.valid_from),
        valid_to: iso(node.valid_to),
        observed_at: iso(node.observed_at),
        recorded_at: iso(node.recorded_at),
        superseded_at: iso(node.superseded_at),
        created_at: iso(node.created_at)
      })),
      edges: edges.map((edge) => ({
        edge_id: edge.edge_id,
        relationship_type: edge.relationship_type,
        from_node_id: edge.from_node_id,
        to_node_id: edge.to_node_id,
        content_hash: edge.content_hash,
        payload: parseJsonObject(edge.payload_json),
        created_at: iso(edge.created_at)
      }))
    }
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

function iso(value: number | null) {
  return value ? new Date(value).toISOString() : null;
}
