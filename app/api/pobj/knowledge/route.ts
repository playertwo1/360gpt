import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { assertReusableKnowledge, contentHash, layoutSignature, normalizeIndicatorKey, parseDocumentMeta } from '../../../../lib/pobj-knowledge';
import { isDenied, requireDashboardReader } from '../../reviews/shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type Indicator = { key: string; name: string; unit: string };
type CandidateInput = { indicatorKey: string; indicatorName: string; layoutSignature: string; knowledgeType: string; content: unknown };

export async function GET() {
  const access = await requireDashboardReader(); if (isDenied(access)) return access;
  const result = await env.DB.prepare(`SELECT id, indicator_key, indicator_name, layout_signature, knowledge_type, version, status,
    content_json, source_document_id, approved_by, approved_at, created_at, revoked_at
    FROM pobj_knowledge_items WHERE owner_id = ? ORDER BY created_at DESC LIMIT 100`).bind(access.userId).all();
  return NextResponse.json({ ok: true, items: result.results ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const access = await requireDashboardReader(); if (isDenied(access)) return access;
  const body = await request.json().catch(() => null) as { documentId?: string; indicatorKeys?: string[]; candidates?: Array<{ indicatorKey: string; indicatorName: string; layoutSignature: string; knowledgeType: string; content: unknown }> } | null;
  if (!body) return invalid('invalid_json');
  if (body.candidates) return createCandidates(body.candidates, access.userId, access.email);
  if (!body.documentId || !Array.isArray(body.indicatorKeys) || !body.indicatorKeys.length) return invalid('document_and_indicator_keys_required');
  const document = await env.DB.prepare(`SELECT id, raw_text FROM documents WHERE id = ? AND owner_id = ?`).bind(body.documentId, access.userId).first<{ id: string; raw_text: string | null }>();
  if (!document) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  const meta = parseDocumentMeta(document.raw_text);
  const review = (meta.localReview ?? meta.approved) as { indicators?: Indicator[] } | undefined;
  const indicators = (review?.indicators ?? []).filter((item) => body.indicatorKeys!.map(normalizeIndicatorKey).includes(normalizeIndicatorKey(item.key)));
  if (!indicators.length) return invalid('no_selected_indicators');
  const signature = layoutSignature(review?.indicators ?? indicators);
  const now = Date.now(); const ids: string[] = [];
  for (const indicator of indicators) {
    const key = normalizeIndicatorKey(indicator.key); const content = { canonical_key: key, label: indicator.name, unit: indicator.unit, aliases: [indicator.name] };
    assertReusableKnowledge(content); const hash = await contentHash(content); const id = `knowledge-${crypto.randomUUID()}`;
    const previous = await env.DB.prepare(`SELECT id, version, content_hash FROM pobj_knowledge_items WHERE owner_id = ? AND indicator_key = ? AND layout_signature = ? AND knowledge_type = 'FIELD_MAPPING' AND status = 'ACTIVE' ORDER BY version DESC LIMIT 1`).bind(access.userId, key, signature).first<{ id: string; version: number; content_hash: string }>();
    if (previous?.content_hash === hash) { ids.push(previous.id); continue; }
    const version = (previous?.version ?? 0) + 1;
    await env.DB.batch([
      ...(previous ? [env.DB.prepare(`UPDATE pobj_knowledge_items SET status = 'SUPERSEDED', superseded_by = ?, updated_at = ? WHERE id = ? AND owner_id = ?`).bind(id, now, previous.id, access.userId)] : []),
      env.DB.prepare(`INSERT INTO pobj_knowledge_items (id, owner_id, indicator_key, indicator_name, layout_signature, knowledge_type, version, status, content_json, content_hash, source_document_id, source_evidence_json, approved_by, approved_at, valid_from, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'FIELD_MAPPING', ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, access.userId, key, indicator.name.slice(0, 120), signature, version, JSON.stringify(content), hash, document.id, JSON.stringify([{ type: 'OWNER_REVIEW', document_id: document.id }]), access.email, now, now, now, now),
      env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'pobj_knowledge_approved', 'pobj_knowledge', ?, ?, ?)`).bind(`audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, id, JSON.stringify({ documentId: document.id, indicatorKey: key, layoutSignature: signature, version }), now),
    ]);
    ids.push(id);
  }
  return NextResponse.json({ ok: true, approved: ids, layoutSignature: signature });
}

export async function PATCH(request: Request) {
  const access = await requireDashboardReader(); if (isDenied(access)) return access;
  const body = await request.json().catch(() => null) as { id?: string; action?: string } | null;
  if (!body?.id || body.action !== 'revoke') return invalid('invalid_action');
  const now = Date.now();
  const result = await env.DB.prepare(`UPDATE pobj_knowledge_items SET status = 'REVOKED', revoked_at = ?, updated_at = ? WHERE id = ? AND owner_id = ? AND status IN ('ACTIVE','CANDIDATE','CONTESTED')`).bind(now, now, body.id, access.userId).run();
  if (!result.meta.changes) return NextResponse.json({ ok: false, error: 'not_found_or_inactive' }, { status: 404 });
  await env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'pobj_knowledge_revoked', 'pobj_knowledge', ?, '{}', ?)`).bind(`audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, body.id, now).run();
  return NextResponse.json({ ok: true, id: body.id, status: 'REVOKED' });
}

async function createCandidates(candidates: CandidateInput[], ownerId: string, actor: string) {
  if (!Array.isArray(candidates) || !candidates.length || candidates.length > 50) return invalid('invalid_candidates');
  const now = Date.now(); const ids: string[] = [];
  for (const candidate of candidates) {
    if (!['FIELD_MAPPING', 'SCORING_RULE'].includes(candidate.knowledgeType) || !candidate.layoutSignature) return invalid('invalid_candidate');
    try { assertReusableKnowledge(candidate.content); } catch { return invalid('monthly_values_not_reusable'); }
    const key = normalizeIndicatorKey(candidate.indicatorKey); if (!key) return invalid('invalid_indicator');
    const hash = await contentHash(candidate.content); const id = `knowledge-${crypto.randomUUID()}`;
    const latest = await env.DB.prepare(`SELECT MAX(version) AS version FROM pobj_knowledge_items WHERE owner_id = ? AND indicator_key = ? AND layout_signature = ? AND knowledge_type = ?`).bind(ownerId, key, candidate.layoutSignature, candidate.knowledgeType).first<{ version: number | null }>();
    const version = (latest?.version ?? 0) + 1;
    await env.DB.prepare(`INSERT INTO pobj_knowledge_items (id, owner_id, indicator_key, indicator_name, layout_signature, knowledge_type, version, status, content_json, content_hash, source_evidence_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'CANDIDATE', ?, ?, '[]', ?, ?)`)
      .bind(id, ownerId, key, String(candidate.indicatorName).slice(0, 120), candidate.layoutSignature.slice(0, 500), candidate.knowledgeType, version, JSON.stringify(candidate.content), hash, now, now).run();
    ids.push(id);
  }
  await env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'pobj_knowledge_candidates_created', 'pobj_knowledge_batch', ?, ?, ?)`).bind(`audit-${crypto.randomUUID()}`, ownerId, `chatgpt:${actor}`, ids[0], JSON.stringify({ ids }), now).run();
  return NextResponse.json({ ok: true, candidates: ids }, { status: 201 });
}

function invalid(error: string) { return NextResponse.json({ ok: false, error }, { status: 400 }); }
