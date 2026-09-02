import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 8 * 1024) as Record<string, unknown>;
    const workerId = boundedString(body.worker_id, 120, /^[A-Za-z0-9._:-]+$/);
    if (!workerId) return NextResponse.json({ ok: false, error: 'invalid_worker_id' }, { status: 400 });
    const now = Date.now(); const claimToken = crypto.randomUUID(); const claimExpiresAt = now + 10 * 60 * 1000;
    const [, selected] = await env.DB.batch([
      env.DB.prepare(`UPDATE bot_feedback_events SET status = 'PROCESSING', claim_token = ?, claim_expires_at = ?, processed_at = ? WHERE id = (
        SELECT id FROM bot_feedback_events WHERE status = 'QUEUED' OR (status = 'PROCESSING' AND COALESCE(claim_expires_at, 0) < ?)
        ORDER BY created_at LIMIT 1)`).bind(claimToken, claimExpiresAt, now, now),
      env.DB.prepare(`SELECT id, owner_id, chat_id, protocol, user_message_id, bot_message_id, bot_text, feedback_text, original_question_json, failure_type, content_hash, claim_token, claim_expires_at
        FROM bot_feedback_events WHERE status = 'PROCESSING' AND claim_token = ?`).bind(claimToken),
    ]);
    const event = selected.results?.[0] as Record<string, unknown> | undefined;
    return NextResponse.json(event ? { ok: true, worker_id: workerId, claim_token: claimToken, feedback: { ...event, original_questions: safeJson(String(event.original_question_json ?? '[]')), original_question_json: undefined } } : { ok: true, empty: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return requestErrorResponse(error); }
}

function safeJson(value: string) { try { return JSON.parse(value) as unknown; } catch { return []; } }
