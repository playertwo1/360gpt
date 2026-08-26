import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

type TelegramDocument = { file_id: string; file_unique_id: string; file_name?: string; mime_type?: string; file_size?: number };
type TelegramUpdate = { update_id: number; message?: { message_id: number; date: number; text?: string; caption?: string; document?: TelegramDocument; chat: { id: number; type: string }; from?: { id: number; username?: string; first_name?: string } } };
type Reservation = { claimed: boolean; status: string };

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_WEBHOOK_BYTES = 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/json',
]);

export const runtime = 'edge';

export async function POST(request: Request) {
  if (env.TELEGRAM_INGEST_ENABLED !== 'true') {
    return NextResponse.json({ ok: false, error: 'ingest_disabled' }, { status: 503 });
  }
  if (!env.DB || !env.FILES) {
    return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });
  }

  const secret = request.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!env.TELEGRAM_WEBHOOK_SECRET || !(await constantTimeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (!contentType.includes('application/json') || contentLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 415 });
  }

  let update: TelegramUpdate;
  try { update = (await request.json()) as TelegramUpdate; }
  catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }

  if (!Number.isSafeInteger(update.update_id) || update.update_id < 0) {
    return NextResponse.json({ ok: false, error: 'invalid_update_id' }, { status: 400 });
  }
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true, ignored: true, reason: 'unsupported_update' });
  if (!Number.isSafeInteger(message.message_id) || !Number.isSafeInteger(message.chat?.id)) {
    return NextResponse.json({ ok: false, error: 'invalid_message' }, { status: 400 });
  }
  if (message.chat.type !== 'private') {
    return NextResponse.json({ ok: false, error: 'private_chat_required' }, { status: 403 });
  }

  const allowedChats = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!allowedChats.includes(String(message.chat.id))) {
    return NextResponse.json({ ok: false, error: 'chat_not_allowed' }, { status: 403 });
  }

  const text = String(message.text ?? message.caption ?? '').trim();
  const document = message.document;
  if (!text && !document) return NextResponse.json({ ok: true, ignored: true, reason: 'unsupported_message' });
  if (document) {
    const size = document.file_size;
    const mime = document.mime_type?.toLowerCase() ?? '';
    if (!Number.isSafeInteger(size) || !size || size < 1 || size > MAX_FILE_BYTES) {
      return NextResponse.json({ ok: true, rejected: 'invalid_file_size' });
    }
    if (!ALLOWED_MIME_TYPES.has(mime) || !allowedFileName(document.file_name ?? '', mime)) {
      return NextResponse.json({ ok: true, rejected: 'file_type_not_allowed' });
    }
  }

  const updateId = String(update.update_id);
  const chatId = String(message.chat.id);
  const documentId = `telegram-${chatId}-${updateId}`;
  const receivedAt = Date.now();
  const reservation = await reserveUpdate(updateId, chatId, String(message.message_id), documentId, receivedAt);
  if (!reservation.claimed) {
    return NextResponse.json({ ok: true, duplicate: true, updateId, status: reservation.status });
  }

  let storageKey: string | null = null;
  let contentHash: string | null = null;
  try {
    if (document) {
      if (!env.TELEGRAM_BOT_TOKEN) throw new IngestError('bot_not_configured');
      const file = await downloadTelegramFile(document);
      contentHash = `sha256:${await sha256Hex(file.bytes)}`;
      storageKey = `telegram/${chatId}/${updateId}/${safeFileName(document.file_name ?? 'documento')}`;
      await env.FILES.put(storageKey, file.bytes, {
        httpMetadata: { contentType: document.mime_type ?? 'application/octet-stream' },
        customMetadata: { telegramFileUniqueId: document.file_unique_id, sha256: contentHash, contentTrust: 'UNTRUSTED' },
      });
    }

    const runId = `telegram-run-${chatId}-${updateId}`;
    const auditId = `telegram-audit-${chatId}-${updateId}`;
    await env.DB.batch([
      env.DB.prepare(`INSERT OR IGNORE INTO documents (id, owner_id, source, source_message_id, original_name, mime_type, storage_key, content_hash, raw_text, status, received_at) VALUES (?, ?, 'telegram', ?, ?, ?, ?, ?, ?, 'received', ?)`)
        .bind(documentId, chatId, updateId, document?.file_name ?? null, document?.mime_type ?? null, storageKey, contentHash, text || null, receivedAt),
      env.DB.prepare(`INSERT OR IGNORE INTO agent_runs (id, document_id, agent_role, status, input_summary) VALUES (?, ?, 'diretor', 'queued', ?)`)
        .bind(runId, documentId, text || document?.file_name || 'Nova entrada'),
      env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'ingested', 'document', ?, ?, ?)`)
        .bind(auditId, chatId, `telegram:${message.from?.id ?? 'unknown'}`, documentId, JSON.stringify({ updateId: update.update_id, messageId: message.message_id, contentHash, contentTrust: 'UNTRUSTED', externalEffectsAllowed: false }), receivedAt),
      env.DB.prepare(`UPDATE telegram_updates SET status = 'SUCCEEDED', completed_at = ?, error_code = NULL WHERE update_id = ?`)
        .bind(Date.now(), updateId),
    ]);

    const ackSent = env.TELEGRAM_SEND_ACK_ENABLED === 'true' && Boolean(env.TELEGRAM_BOT_TOKEN);
    if (ackSent) await sendTelegramMessage(message.chat.id, `Recebido com segurança. Protocolo: ${documentId}`);
    return NextResponse.json({ ok: true, documentId, updateId, status: 'queued', ackSent }, { status: 202 });
  } catch (error) {
    const errorCode = error instanceof IngestError ? error.code : 'ingest_failed';
    await env.DB.prepare(`UPDATE telegram_updates SET status = 'FAILED_RETRYABLE', error_code = ? WHERE update_id = ?`).bind(errorCode, updateId).run();
    return NextResponse.json({ ok: false, error: errorCode, retryable: true }, { status: errorCode === 'bot_not_configured' ? 503 : 502 });
  }
}

async function reserveUpdate(updateId: string, chatId: string, messageId: string, documentId: string, receivedAt: number): Promise<Reservation> {
  const inserted = await env.DB.prepare(`INSERT INTO telegram_updates (update_id, chat_id, message_id, document_id, status, received_at) VALUES (?, ?, ?, ?, 'PROCESSING', ?) ON CONFLICT(update_id) DO NOTHING RETURNING update_id`)
    .bind(updateId, chatId, messageId, documentId, receivedAt).first<{ update_id: string }>();
  if (inserted) return { claimed: true, status: 'PROCESSING' };

  const reclaimed = await env.DB.prepare(`UPDATE telegram_updates SET status = 'PROCESSING', error_code = NULL WHERE update_id = ? AND status = 'FAILED_RETRYABLE' RETURNING update_id`)
    .bind(updateId).first<{ update_id: string }>();
  if (reclaimed) return { claimed: true, status: 'PROCESSING' };

  const current = await env.DB.prepare(`SELECT status FROM telegram_updates WHERE update_id = ?`).bind(updateId).first<{ status: string }>();
  return { claimed: false, status: current?.status ?? 'DUPLICATE_IGNORED' };
}

async function downloadTelegramFile(document: TelegramDocument) {
  const infoResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file_id: document.file_id }), signal: AbortSignal.timeout(10000),
  });
  const info = await infoResponse.json() as { ok: boolean; result?: { file_path: string; file_size?: number } };
  if (!infoResponse.ok || !info.ok || !info.result?.file_path) throw new IngestError('telegram_get_file_failed');
  if ((info.result.file_size ?? document.file_size ?? 0) > MAX_FILE_BYTES) throw new IngestError('file_too_large');

  const fileResponse = await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${info.result.file_path}`, { signal: AbortSignal.timeout(20000) });
  if (!fileResponse.ok) throw new IngestError('telegram_download_failed');
  const bytes = await fileResponse.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_FILE_BYTES) throw new IngestError('invalid_download_size');
  return { bytes };
}

async function sendTelegramMessage(chatId: number, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new IngestError('telegram_ack_failed');
}

function allowedFileName(name: string, mime: string) {
  const extension = name.toLowerCase().split('.').pop() ?? '';
  const expected: Record<string, string[]> = {
    'application/pdf': ['pdf'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.ms-excel': ['xls'], 'text/csv': ['csv'], 'application/json': ['json'],
  };
  return Boolean(name) && (expected[mime] ?? []).includes(extension);
}

function safeFileName(value: string) { return value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120); }

async function sha256Hex(value: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', value);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)), crypto.subtle.digest('SHA-256', new TextEncoder().encode(right))]);
  const leftBytes = new Uint8Array(leftHash); const rightBytes = new Uint8Array(rightHash); let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}

class IngestError extends Error { constructor(public readonly code: string) { super(code); } }
