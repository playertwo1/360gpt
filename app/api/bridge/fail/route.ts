import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { BRIDGE_MAX_ATTEMPTS, boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../shared';

export const runtime = 'edge';
const ALLOWED_ERRORS = new Set(['LOCAL_WORKFLOW_UNAVAILABLE', 'LOCAL_WORKFLOW_FAILED', 'FILE_DOWNLOAD_FAILED', 'INVALID_WORKFLOW_RESULT', 'BRIDGE_TIMEOUT']);

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const jobId = boundedString(body.job_id, 160, /^[A-Za-z0-9._:-]+$/);
    const leaseToken = boundedString(body.lease_token, 80, /^[A-Za-z0-9-]+$/);
    const errorCode = boundedString(body.error_code, 80, /^[A-Z0-9_]+$/);
    if (!jobId || !leaseToken || !ALLOWED_ERRORS.has(errorCode)) return NextResponse.json({ ok: false, error: 'invalid_failure' }, { status: 400 });
    const row = await env.DB.prepare(`SELECT attempt_count FROM agent_runs WHERE id = ? AND status = 'PROCESSING' AND lease_token = ?`)
      .bind(jobId, leaseToken).first<{ attempt_count: number }>();
    if (!row) return NextResponse.json({ ok: false, error: 'lease_not_found' }, { status: 409 });
    const retryable = body.retryable !== false && row.attempt_count < BRIDGE_MAX_ATTEMPTS;
    const nextStatus = retryable ? 'FAILED_RETRYABLE' : 'FAILED_FINAL';
    const availableAt = retryable ? Date.now() + Math.min(row.attempt_count, 3) * 60_000 : null;
    await env.DB.prepare(`UPDATE agent_runs SET status = ?, last_error_code = ?, available_at = ?, lease_token = NULL, lease_expires_at = NULL, completed_at = ? WHERE id = ? AND lease_token = ?`)
      .bind(nextStatus, errorCode, availableAt, retryable ? null : Date.now(), jobId, leaseToken).run();
    return NextResponse.json({ ok: true, status: nextStatus, retryable });
  } catch (error) { return requestErrorResponse(error); }
}
