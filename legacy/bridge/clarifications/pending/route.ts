import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requestErrorResponse, requireBridge } from '../../shared';

export const runtime = 'edge';

export async function GET(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(`UPDATE clarification_requests SET status = 'EXPIRED' WHERE status IN ('PENDING','NEEDS_FOLLOW_UP') AND due_at < ?`).bind(now),
      env.DB.prepare(`UPDATE agent_runs SET status = 'INCOMPLETE_OWNER_INPUT_TIMEOUT', completed_at = ? WHERE status = 'AWAITING_OWNER_INPUT' AND id IN (SELECT job_id FROM clarification_requests WHERE status = 'EXPIRED')`).bind(now),
    ]);
    const rows = await env.DB.prepare(`SELECT id, job_id, document_id, chat_id, questions_json, status, due_at, created_at FROM clarification_requests WHERE status IN ('PENDING','NEEDS_FOLLOW_UP') ORDER BY created_at`).all();
    return NextResponse.json({ ok: true, pending: rows.results ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return requestErrorResponse(error); }
}
