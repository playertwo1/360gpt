import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { sendTelegramText } from '../../../../../lib/telegram-messages';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge, sha256 } from '../../shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 32 * 1024) as Record<string, unknown>;
    const workflowId = boundedString(body.workflow_id, 160, /^[A-Za-z0-9._:-]+$/);
    const executionId = boundedString(body.execution_id, 160, /^[A-Za-z0-9._:-]+$/) || null;
    const jobId = boundedString(body.job_id, 160, /^[A-Za-z0-9._:-]+$/) || null;
    const protocol = boundedString(body.protocol, 180, /^[A-Za-z0-9._:-]+$/) || null;
    const chatId = boundedString(String(body.chat_id ?? ''), 20, /^-?[0-9]{1,20}$/) || null;
    const errorClass = boundedString(body.error_class, 80, /^[A-Z0-9_]+$/);
    const retryable = body.retryable === true;
    if (!workflowId || !errorClass) return NextResponse.json({ ok: false, error: 'invalid_error_report' }, { status: 400 });
    const id = `execution-error-${await sha256(`${workflowId}|${executionId ?? jobId ?? protocol ?? 'unknown'}`)}`;
    const safeDetails = sanitizeDetails(body.details);
    const now = Date.now();
    const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO execution_error_audits (id, owner_id, workflow_id, execution_id, job_id, protocol, chat_id, error_class, retryable, sanitized_details_json, notification_status, created_at)
      VALUES (?, 'tenant-owner', ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?) RETURNING id`).bind(id, workflowId, executionId, jobId, protocol, chatId, errorClass, retryable ? 1 : 0, JSON.stringify(safeDetails), now).first<{ id: string }>();
    if (!inserted) return NextResponse.json({ ok: true, duplicate: true });
    let notificationStatus = 'NOT_REQUIRED';
    if (chatId && env.TELEGRAM_BOT_TOKEN && (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((v) => v.trim()).includes(chatId)) {
      const message = retryable
        ? `Tive uma oscilação no protocolo ${protocol ?? jobId ?? 'atual'}, mas ele será tentado novamente automaticamente.`
        : `Não consegui concluir o protocolo ${protocol ?? jobId ?? 'atual'}. Use /tentar novamente ${protocol ?? jobId ?? ''}`.trim();
      try { await sendTelegramText(env.TELEGRAM_BOT_TOKEN, Number(chatId), message); notificationStatus = 'SENT'; }
      catch { notificationStatus = 'FAILED'; }
    }
    await env.DB.prepare(`UPDATE execution_error_audits SET notification_status = ? WHERE id = ?`).bind(notificationStatus, id).run();
    return NextResponse.json({ ok: true, notification_status: notificationStatus });
  } catch (error) { return requestErrorResponse(error); }
}

function sanitizeDetails(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>; const result: Record<string, string | number | boolean | null> = {};
  for (const key of ['node', 'status_code', 'attempt', 'message_code', 'occurred_at']) {
    const item = source[key]; if (['string','number','boolean'].includes(typeof item) || item === null) result[key] = typeof item === 'string' ? item.slice(0, 300) : item as number | boolean | null;
  }
  return result;
}
