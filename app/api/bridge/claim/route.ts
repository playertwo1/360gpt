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
    const [, selected] = await env.DB.batch([
      env.DB.prepare(`UPDATE agent_runs SET status = 'PROCESSING', started_at = ?, lease_token = ?, lease_expires_at = ?, attempt_count = attempt_count + 1, last_error_code = NULL
        WHERE id = (SELECT ar.id FROM agent_runs ar JOIN documents d ON d.id = ar.document_id
          WHERE ar.agent_role = 'diretor' AND ar.attempt_count < ? AND (
            (ar.status IN ('QUEUED','FAILED_RETRYABLE') AND COALESCE(ar.available_at, 0) <= ?) OR
            (ar.status = 'PROCESSING' AND COALESCE(ar.lease_expires_at, 0) < ?)
          ) ORDER BY d.received_at, ar.id LIMIT 1)`)
        .bind(now, leaseToken, leaseExpiresAt, BRIDGE_MAX_ATTEMPTS, now, now),
      env.DB.prepare(`SELECT ar.id, ar.document_id, ar.attempt_count, ar.lease_token, ar.lease_expires_at,
          d.owner_id, d.source, d.source_message_id, d.original_name, d.mime_type, d.storage_key, d.content_hash, d.raw_text
        FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE ar.lease_token = ? AND ar.status = 'PROCESSING'`)
        .bind(leaseToken),
    ]);
    const job = (selected.results?.[0] ?? null) as ClaimedJob | null;
    if (!job) return NextResponse.json({ ok: true, empty: true }, { headers: { 'Cache-Control': 'no-store' } });

    return NextResponse.json({
      ok: true, schema_version: '1.0.0', worker_id: workerId, job_id: job.id, document_id: job.document_id,
      lease_token: job.lease_token, lease_expires_at: new Date(job.lease_expires_at).toISOString(), attempt: job.attempt_count,
      source_event_id: `${job.source}-${job.source_message_id ?? job.document_id}`, tenant_id: 'tenant-demo', subject_ref: job.source === 'pobj_mobile' ? 'pobj-performance' : 'cust-demo-001',
      actor_id: `${job.source}:${job.owner_id}`, purpose: job.source === 'pobj_mobile' ? 'pobj_performance_analysis' : 'offline_evaluation', data_classification: 'INTERNAL', text: job.raw_text ?? '',
      document: job.storage_key ? { file_name: job.original_name, mime_type: job.mime_type, content_hash: job.content_hash, download_path: `/api/bridge/file?job_id=${encodeURIComponent(job.id)}` } : null,
      security: { content_trust: 'UNTRUSTED', external_effects_allowed: false },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return requestErrorResponse(error); }
}
