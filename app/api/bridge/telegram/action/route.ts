import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge, sha256 } from '../../shared';

export const runtime = 'edge';
const ALLOWED_ACTIONS = new Set(['typing']);

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 16 * 1024) as Record<string, unknown>;
    const jobId = boundedString(body.job_id, 160, /^[A-Za-z0-9._:-]+$/);
    const chatId = boundedString(String(body.chat_id ?? ''), 20, /^-?[0-9]{1,20}$/);
    const action = boundedString(body.action, 40, /^[a-z_]+$/);
    const idempotencyKey = boundedString(body.idempotency_key, 220, /^[A-Za-z0-9._:-]+$/);
    if (!jobId || !chatId || !ALLOWED_ACTIONS.has(action) || !idempotencyKey) {
      return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });
    }
    const allowedChats = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((value) => value.trim()).filter(Boolean);
    if (!allowedChats.includes(chatId)) return NextResponse.json({ ok: false, error: 'chat_not_allowed' }, { status: 403 });
    if (!env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false, error: 'telegram_unavailable' }, { status: 503 });

    const auditId = `telegram-action-${await sha256(idempotencyKey)}`;
    const existing = await env.DB.prepare(`SELECT id FROM audit_log WHERE id = ?`).bind(auditId).first<{ id: string }>();
    if (existing) return NextResponse.json({ ok: true, duplicate: true });

    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendChatAction`, {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ chat_id: chatId, action }), signal: AbortSignal.timeout(3000),
    });
    const result = await response.json().catch(() => ({})) as { ok?: boolean };
    if (!response.ok || !result.ok) return NextResponse.json({ ok: false, error: 'telegram_action_failed' }, { status: 502 });

    await env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, 'bridge:telegram-action', 'telegram_chat_action_sent', 'agent_run', ?, ?, ?)`)
      .bind(auditId, chatId, jobId, JSON.stringify({ action, idempotencyKey }), Date.now()).run();
    return NextResponse.json({ ok: true });
  } catch (error) { return requestErrorResponse(error); }
}
