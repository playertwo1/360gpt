import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';

export const runtime = 'edge';
export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 8 * 1024) as Record<string, unknown>;
    const workerId = boundedString(body.worker_id, 120, /^[A-Za-z0-9._:-]+$/); if (!workerId) return NextResponse.json({ ok: false, error: 'invalid_worker_id' }, { status: 400 });
    const now = Date.now(); const token = crypto.randomUUID(); const expiry = now + 10 * 60 * 1000;
    const selected = await env.DB.prepare(`SELECT id, batch_id FROM telegram_inbound_events WHERE status = 'QUEUED' AND available_at <= ? ORDER BY created_at LIMIT 1`).bind(now).first<{ id: string; batch_id: string | null }>();
    if (!selected) return NextResponse.json({ ok: true, empty: true });
    if (selected.batch_id) {
      await env.DB.batch([
        env.DB.prepare(`UPDATE telegram_inbound_events SET status = 'PROCESSING', lease_token = ?, lease_expires_at = ?, attempt_count = attempt_count + 1 WHERE batch_id = ? AND status = 'QUEUED'`).bind(token, expiry, selected.batch_id),
        env.DB.prepare(`UPDATE telegram_message_batches SET status = 'SEALED', sealed_at = ? WHERE id = ? AND status = 'OPEN'`).bind(now, selected.batch_id),
      ]);
      const batch = await env.DB.prepare(`SELECT id, owner_id, chat_id, combined_text FROM telegram_message_batches WHERE id = ? AND status = 'SEALED'`).bind(selected.batch_id).first<Record<string, unknown>>();
      const event = await env.DB.prepare(`SELECT id, update_id, message_id, reply_to_message_id FROM telegram_inbound_events WHERE batch_id = ? ORDER BY created_at LIMIT 1`).bind(selected.batch_id).first<Record<string, unknown>>();
      return NextResponse.json({ ok: true, worker_id: workerId, claim_token: token, lease_expires_at: new Date(expiry).toISOString(), event: { ...event, ...batch, event_kind: 'TEXT_BATCH' } });
    }
    await env.DB.prepare(`UPDATE telegram_inbound_events SET status = 'PROCESSING', lease_token = ?, lease_expires_at = ?, attempt_count = attempt_count + 1 WHERE id = ? AND status = 'QUEUED'`).bind(token, expiry, selected.id).run();
    const event = await env.DB.prepare(`SELECT id, update_id, owner_id, chat_id, message_id, reply_to_message_id, event_kind, text, payload_json FROM telegram_inbound_events WHERE id = ? AND lease_token = ?`).bind(selected.id, token).first<Record<string, unknown>>();
    return NextResponse.json({ ok: true, worker_id: workerId, claim_token: token, lease_expires_at: new Date(expiry).toISOString(), event });
  } catch (error) { return requestErrorResponse(error); }
}
