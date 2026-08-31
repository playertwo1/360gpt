import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const documentId = boundedString(body.document_id, 180, /^[A-Za-z0-9._:-]+$/);
    if (!documentId) return NextResponse.json({ ok: false, error: 'invalid_document_id' }, { status: 400 });
    const now = Date.now();
    const result = await env.DB.prepare(`UPDATE agent_runs SET status = 'QUEUED', available_at = ?, completed_at = NULL, last_error_code = NULL,
      attempt_count = 0, lease_token = NULL, lease_expires_at = NULL
      WHERE document_id = ? AND status IN ('INCOMPLETE_OWNER_INPUT_TIMEOUT','FAILED_RETRYABLE','FAILED_FINAL','CANCELLED') RETURNING id`)
      .bind(now, documentId).first<{ id: string }>();
    if (!result) return NextResponse.json({ ok: false, error: 'not_reopenable' }, { status: 409 });
    await env.DB.prepare(`UPDATE documents SET status = 'ready_for_processing' WHERE id = ?`).bind(documentId).run();
    return NextResponse.json({ ok: true, job_id: result.id, status: 'QUEUED' });
  } catch (error) { return requestErrorResponse(error); }
}
