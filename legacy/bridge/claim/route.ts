import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { BRIDGE_LEASE_MS, BRIDGE_MAX_ATTEMPTS, boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../shared';

export const runtime = 'edge';

type ClaimedJob = {
  id: string; document_id: string; attempt_count: number; lease_token: string; lease_expires_at: number;
  owner_id: string; source: string; source_message_id: string | null; original_name: string | null; mime_type: string | null;
  storage_key: string | null; content_hash: string | null; raw_text: string | null;
};

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const workerId = boundedString(body.worker_id, 120, /^[A-Za-z0-9._:-]+$/);
    if (!workerId) return NextResponse.json({ ok: false, error: 'invalid_worker_id' }, { status: 400 });

    const now = Date.now(); const leaseToken = crypto.randomUUID(); const leaseExpiresAt = now + BRIDGE_LEASE_MS;
    const [, , selected] = await env.DB.batch([
      env.DB.prepare(`UPDATE agent_runs SET status = 'FAILED_FINAL', last_error_code = 'BRIDGE_TIMEOUT', completed_at = ?, lease_token = NULL, lease_expires_at = NULL
        WHERE status = 'PROCESSING' AND attempt_count >= ? AND COALESCE(lease_expires_at, 0) < ?`)
        .bind(now, BRIDGE_MAX_ATTEMPTS, now),
      env.DB.prepare(`UPDATE agent_runs SET status = 'PROCESSING', started_at = ?, lease_token = ?, lease_expires_at = ?, attempt_count = attempt_count + 1, last_error_code = NULL
        WHERE id = (SELECT ar.id FROM agent_runs ar JOIN documents d ON d.id = ar.document_id
          WHERE ar.agent_role = 'diretor' AND ar.attempt_count < ? AND (
            (ar.status IN ('QUEUED','FAILED_RETRYABLE') AND COALESCE(ar.available_at, 0) <= ?) OR
            (ar.status = 'PROCESSING' AND COALESCE(ar.lease_expires_at, 0) < ?)
          ) AND d.status IN ('received', 'ready_for_processing', 'processing', 'local_reviewed')
            AND (d.source <> 'pobj_mobile' OR d.status = 'local_reviewed')
          ORDER BY d.received_at, ar.id LIMIT 1)`)
        .bind(now, leaseToken, leaseExpiresAt, BRIDGE_MAX_ATTEMPTS, now, now),
      env.DB.prepare(`SELECT ar.id, ar.document_id, ar.attempt_count, ar.lease_token, ar.lease_expires_at,
          d.owner_id, d.source, d.source_message_id, d.original_name, d.mime_type, d.storage_key, d.content_hash, d.raw_text
        FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE ar.lease_token = ? AND ar.status = 'PROCESSING'`)
        .bind(leaseToken),
    ]);
    const job = (selected.results?.[0] ?? null) as ClaimedJob | null;
    if (!job) return NextResponse.json({ ok: true, empty: true }, { headers: { 'Cache-Control': 'no-store' } });
    const clarification = await env.DB.prepare(`SELECT id, answer_text, interpretation_json FROM clarification_requests
      WHERE job_id = ? AND status = 'RESOLVED' ORDER BY resolved_at DESC LIMIT 1`).bind(job.id)
      .first<{ id: string; answer_text: string | null; interpretation_json: string | null }>();
    const ownerContext = clarification ? {
      clarification_id: clarification.id,
      answer_text: clarification.answer_text,
      interpretation: clarification.interpretation_json ? JSON.parse(clarification.interpretation_json) : null,
      evidence_type: 'OWNER_PROVIDED',
    } : null;
    const approvedKnowledge = await env.DB.prepare(`SELECT id, indicator_key, indicator_name, layout_signature, knowledge_type, version, content_json, content_hash
      FROM pobj_knowledge_items WHERE owner_id = ? AND status = 'ACTIVE' ORDER BY indicator_key, version DESC LIMIT 100`).bind(job.owner_id).all();
    const directiveRows = await env.DB.prepare(`SELECT id, directive, scope, failure_type, version, content_hash FROM bot_directives
      WHERE owner_id = ? AND status = 'ACTIVE' ORDER BY updated_at DESC LIMIT 15`).bind(job.owner_id).all<Record<string, unknown>>();
    const activeDirectives: Array<Record<string, unknown>> = [];
    let directiveChars = 0;
    for (const item of directiveRows.results ?? []) {
      const directive = String(item.directive ?? '');
      if (!directive || directiveChars + directive.length > 2000) continue;
      directiveChars += directive.length;
      activeDirectives.push({ id: item.id, directive, scope: item.scope, failure_type: item.failure_type, version: item.version, content_hash: item.content_hash });
    }
    if (activeDirectives.length) {
      await env.DB.batch(activeDirectives.map((item) => env.DB.prepare(`INSERT OR IGNORE INTO bot_directive_applications
        (id, directive_id, directive_version, owner_id, execution_ref, protocol, outcome, created_at) VALUES (?, ?, ?, ?, ?, ?, 'APPLIED', ?)`)
        .bind(`directive-app-${job.id}-${item.id}`, item.id, item.version, job.owner_id, job.id, job.document_id, now)));
    }
    const subjectRef = job.source === 'telegram' || job.source === 'pobj_mobile' ? 'performance-owner' : 'subject-not-resolved';
    const purpose = job.source === 'telegram' || job.source === 'pobj_mobile' ? 'pobj_performance_analysis' : 'document_classification';

    return NextResponse.json({
      ok: true, schema_version: '1.0.0', worker_id: workerId, job_id: job.id, document_id: job.document_id,
      lease_token: job.lease_token, lease_expires_at: new Date(job.lease_expires_at).toISOString(), attempt: job.attempt_count,
      source_event_id: `${job.source}-${job.source_message_id ?? job.document_id}`, tenant_id: 'tenant-owner', subject_ref: subjectRef,
      actor_id: `${job.source}:${job.owner_id}`, purpose, data_classification: 'INTERNAL', text: job.raw_text ?? '', owner_context: ownerContext,
      approved_knowledge: (approvedKnowledge.results ?? []).map((item) => ({ ...item, content: safeJson(String(item.content_json ?? '{}')), content_json: undefined, applicability: 'REQUIRE_EXACT_INDICATOR_AND_LAYOUT_SIGNATURE' })),
      active_conversation_directives: activeDirectives,
      document: job.storage_key ? { file_name: job.original_name, mime_type: job.mime_type, content_hash: job.content_hash, download_path: `/api/bridge/file?job_id=${encodeURIComponent(job.id)}` } : null,
      security: { content_trust: 'UNTRUSTED', external_effects_allowed: false },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return requestErrorResponse(error); }
}

function safeJson(value: string) { try { return JSON.parse(value) as unknown; } catch { return {}; } }
