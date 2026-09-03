import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { bounded, hashCanonical, isDenied, NEXT_ACTIONS, parseJsonArray, parseJsonObject, readBoundedJson, requireReviewer, REVIEW_DECISIONS, type ReviewRequestRow } from '../../shared';
import { createEvidenceEdge, createEvidenceNode, prepareEvidenceEdgeInsert, prepareEvidenceNodeInsert } from '../../../evidence/shared';

export const runtime = 'edge';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireReviewer(); if (isDenied(user)) return user;
  const reviewId = bounded((await context.params).id, 36, UUID);
  const body = await readBoundedJson(request) as Record<string, unknown>;
  const decision = bounded(body.decision, 40, /^[A-Z_]+$/);
  const nextAction = bounded(body.next_action, 40, /^[A-Z_]+$/);
  const rationale = bounded(body.rationale, 2000);
  const evidenceInput = Array.isArray(body.new_evidence_sources) ? body.new_evidence_sources : [];
  const evidence = evidenceInput.map(normalizeEvidence);
  if (!reviewId || !(REVIEW_DECISIONS as readonly string[]).includes(decision) || !(NEXT_ACTIONS as readonly string[]).includes(nextAction) || rationale.length < 10) {
    return NextResponse.json({ ok: false, error: 'invalid_resolution' }, { status: 400 });
  }
  if (evidenceInput.length > 10 || evidence.some((item) => item === null)) {
    return NextResponse.json({ ok: false, error: 'invalid_evidence' }, { status: 400 });
  }
  const validEvidence = evidence.filter((item): item is NonNullable<typeof item> => item !== null);
  const row = await env.DB.prepare('SELECT * FROM manual_review_requests WHERE review_request_id = ?').bind(reviewId).first<ReviewRequestRow>();
  if (!row) return NextResponse.json({ ok: false, error: 'review_not_found' }, { status: 404 });
  if (row.status !== 'IN_REVIEW' || row.assigned_to !== user.userId) return NextResponse.json({ ok: false, error: 'active_assignment_required' }, { status: 409 });
  const allowed = parseJsonArray(row.allowed_resolutions_json).filter((item): item is string => typeof item === 'string');
  if (!allowed.includes(decision)) return NextResponse.json({ ok: false, error: 'resolution_not_allowed' }, { status: 409 });
  const now = Date.now(); const resolutionId = crypto.randomUUID();
  const resolution = { schema_version: '1.0.0', resolution_id: resolutionId, review_request_id: reviewId, tenant_id: row.tenant_id,
    decision, reviewer_id: user.userId, reviewer_role: row.reviewer_role, resolved_at: new Date(now).toISOString(), rationale,
    new_evidence_sources: validEvidence, affected_scope: parseJsonObject(row.affected_scope_json), next_action: nextAction };
  const resolutionHash = await hashCanonical(resolution);
  const finalStatus = decision === 'MORE_DATA_REQUIRED' ? 'MORE_DATA_REQUIRED' : decision.startsWith('CONFIRM_SOURCE_') ? 'RESOLVED_CONFIRMED' : decision;
  const reviewerActor = await createEvidenceNode({ tenantId: row.tenant_id, nodeType: 'ACTOR', entityId: user.userId,
    payload: { actor_kind: 'HUMAN_REVIEWER' }, recordedAt: now, createdAt: now });
  const resolutionNode = await createEvidenceNode({ tenantId: row.tenant_id, nodeType: 'REVIEW_RESOLUTION', entityId: resolutionId,
    nodeId: resolutionId, contentHash: resolutionHash, payload: { review_request_id: reviewId, decision, next_action: nextAction },
    observedAt: now, recordedAt: now, createdAt: now });
  const resolutionDerivedFrom = await createEvidenceEdge({ tenantId: row.tenant_id, relationshipType: 'DERIVED_FROM',
    fromNodeId: resolutionNode.nodeId, toNodeId: reviewId, payload: { review_request_id: reviewId }, createdAt: now });
  const resolutionAttributedTo = await createEvidenceEdge({ tenantId: row.tenant_id, relationshipType: 'ATTRIBUTED_TO',
    fromNodeId: resolutionNode.nodeId, toNodeId: reviewerActor.nodeId, payload: { reviewer_role: row.reviewer_role }, createdAt: now });
  let applied = false;
  try {
    const results = await env.DB.batch([
      env.DB.prepare(`INSERT INTO manual_review_resolutions (resolution_id, review_request_id, tenant_id, decision, reviewer_id, reviewer_role, rationale,
        affected_scope_json, new_evidence_sources_json, next_action, resolution_hash, resolved_at, created_at)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        WHERE EXISTS (SELECT 1 FROM manual_review_requests WHERE review_request_id = ? AND status = 'IN_REVIEW' AND assigned_to = ?)`)
        .bind(resolutionId, reviewId, row.tenant_id, decision, user.userId, row.reviewer_role, rationale, row.affected_scope_json, JSON.stringify(validEvidence), nextAction, resolutionHash, now, now, reviewId, user.userId),
      env.DB.prepare(`UPDATE manual_review_requests SET status = ?, completed_at = ? WHERE review_request_id = ? AND status = 'IN_REVIEW' AND assigned_to = ?`)
        .bind(finalStatus, decision === 'MORE_DATA_REQUIRED' ? null : now, reviewId, user.userId),
      env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
        SELECT ?, ?, ?, 'review_resolved', 'manual_review', ?, ?, ?
        FROM manual_review_resolutions WHERE resolution_id = ?`)
        .bind(crypto.randomUUID(), user.email.toLowerCase(), `reviewer:${user.userId}`, reviewId,
          JSON.stringify({ decision, status: finalStatus, next_action: nextAction, resolution_hash: resolutionHash }), now, resolutionId),
      prepareEvidenceNodeInsert(env.DB, reviewerActor),
      prepareEvidenceNodeInsert(env.DB, resolutionNode),
      prepareEvidenceEdgeInsert(env.DB, resolutionDerivedFrom),
      prepareEvidenceEdgeInsert(env.DB, resolutionAttributedTo),
    ]);
    applied = (results[0].meta?.changes ?? 0) === 1 && (results[1].meta?.changes ?? 0) === 1;
  } catch { return NextResponse.json({ ok: false, error: 'resolution_conflict' }, { status: 409 }); }
  if (!applied) return NextResponse.json({ ok: false, error: 'concurrent_resolution' }, { status: 409 });
  return NextResponse.json({ ok: true, review_request_id: reviewId, resolution_id: resolutionId, resolution_hash: resolutionHash, status: finalStatus, reprocess_requested: nextAction === 'TRIGGER_REPROCESS' });
}

function normalizeEvidence(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const sourceId = bounded(item.source_id, 160);
  const sourceType = bounded(item.source_type, 80, /^[A-Z0-9_.-]+$/i);
  const statement = bounded(item.statement, 1000);
  const observedAt = bounded(item.observed_at, 40);
  const locator = item.locator === undefined ? '' : bounded(item.locator, 500);
  if (!sourceId || !sourceType || !statement || !observedAt || Number.isNaN(Date.parse(observedAt)) || (item.locator !== undefined && !locator)) return null;
  return locator ? { source_id: sourceId, source_type: sourceType, statement, observed_at: observedAt, locator }
    : { source_id: sourceId, source_type: sourceType, statement, observed_at: observedAt };
}
