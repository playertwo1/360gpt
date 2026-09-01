import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';
import { normalizeIndicatorKey } from '../../../../../lib/pobj-knowledge';

export const runtime = 'edge';

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const jobId = boundedString(body.job_id, 160); const documentId = boundedString(body.document_id, 160);
    const layout = boundedString(body.layout_signature, 500); const ownerId = boundedString(body.owner_id, 160);
    const keys = Array.isArray(body.indicator_keys) ? body.indicator_keys.map(normalizeIndicatorKey).filter(Boolean).slice(0, 100) : [];
    if (!jobId || !documentId || !layout || !ownerId || !keys.length) return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    const owns = await env.DB.prepare(`SELECT 1 AS ok FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE ar.id = ? AND d.id = ? AND d.owner_id = ?`).bind(jobId, documentId, ownerId).first();
    if (!owns) return NextResponse.json({ ok: false, error: 'scope_mismatch' }, { status: 403 });
    const placeholders = keys.map(() => '?').join(',');
    const matched = await env.DB.prepare(`SELECT id, indicator_key, indicator_name, layout_signature, knowledge_type, version, content_json, content_hash FROM pobj_knowledge_items WHERE owner_id = ? AND status = 'ACTIVE' AND layout_signature = ? AND indicator_key IN (${placeholders})`).bind(ownerId, layout, ...keys).all<Record<string, unknown>>();
    const now = Date.now();
    for (const item of matched.results ?? []) {
      await env.DB.prepare(`INSERT OR IGNORE INTO pobj_knowledge_applications (id, knowledge_id, knowledge_version, owner_id, document_id, job_id, result, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, 'APPLIED', ?, ?)`)
        .bind(`knowledge-application-${crypto.randomUUID()}`, item.id, item.version, ownerId, documentId, jobId, JSON.stringify({ layoutSignature: layout, indicatorKey: item.indicator_key }), now).run();
    }
    return NextResponse.json({ ok: true, exactMatch: true, knowledge: (matched.results ?? []).map((item) => ({ ...item, content: JSON.parse(String(item.content_json ?? '{}')), content_json: undefined })) });
  } catch (error) { return requestErrorResponse(error); }
}
