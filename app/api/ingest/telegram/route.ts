import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

type TelegramDocument = { file_id: string; file_unique_id: string; file_name?: string; mime_type?: string; file_size?: number };
type TelegramUpdate = {
  update_id: number;
  message?: {
    message_id: number;
    date: number;
    text?: string;
    caption?: string;
    document?: TelegramDocument;
    photo?: Array<{ file_id: string; file_size?: number }>;
    reply_to_message?: { message_id: number };
    chat: { id: number; type: string };
    from?: { id: number; username?: string; first_name?: string; is_bot?: boolean };
  };
  callback_query?: {
    id: string;
    from: { id: number; username?: string; first_name?: string; is_bot?: boolean };
    message?: { message_id: number; chat: { id: number; type: string } };
    data?: string;
  };
};

const MAX_WEBHOOK_BYTES = 1024 * 1024;

export const runtime = 'edge';

export async function POST(request: Request) {
  if (env.TELEGRAM_INGEST_ENABLED !== 'true') {
    return NextResponse.json({ ok: false, error: 'ingest_disabled' }, { status: 503 });
  }

  const secret = request.headers.get('x-telegram-bot-api-secret-token') ?? '';
  if (!env.TELEGRAM_WEBHOOK_SECRET || !(await constantTimeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 415 });
  }
  if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ ok: false, error: 'request_too_large' }, { status: 413 });
  }

  let update: TelegramUpdate;
  try {
    const bytes = await request.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_WEBHOOK_BYTES) {
      return NextResponse.json({ ok: false, error: 'invalid_request_size' }, { status: bytes.byteLength > MAX_WEBHOOK_BYTES ? 413 : 400 });
    }
    update = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (!Number.isSafeInteger(update.update_id) || update.update_id < 0) {
    return NextResponse.json({ ok: false, error: 'invalid_update_id' }, { status: 400 });
  }

  const message = update.message ?? update.callback_query?.message;
  const from = update.message?.from ?? update.callback_query?.from;
  if (!message) return NextResponse.json({ ok: true, ignored: true, reason: 'unsupported_update' });
  if (from?.is_bot === true) return NextResponse.json({ ok: true, ignored: true, reason: 'bot_message' });

  if (!Number.isSafeInteger(message.message_id) || !Number.isSafeInteger(message.chat?.id)) {
    return NextResponse.json({ ok: false, error: 'invalid_message' }, { status: 400 });
  }
  if (message.chat.type !== 'private') {
    return NextResponse.json({ ok: false, error: 'private_chat_required' }, { status: 403 });
  }

  const allowedChats = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  if (allowedChats.length > 0 && !allowedChats.includes(String(message.chat.id))) {
    return NextResponse.json({ ok: false, error: 'chat_not_allowed' }, { status: 403 });
  }

  if (env.DB && !(await consumeRateLimit(String(message.chat.id)))) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  const updateId = String(update.update_id);
  const chatId = String(message.chat.id);
  const ownerId = env.TELEGRAM_OWNER_ACCOUNT_USER_ID?.trim() || chatId;
  const receivedAt = Date.now();

  // Encaminhamento ao webhook interno do n8n (WF-100)
  const ingressUrl = env.N8N_TELEGRAM_INGRESS_URL || 'http://127.0.0.1:5678/webhook/director-360/telegram/inbound';
  const transportSecret = env.DIRECTOR360_TRANSPORT_SECRET || env.BRIDGE_SHARED_SECRET || '';
  let deliveredToN8n = false;

  try {
    const n8nResp = await fetch(ingressUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-director360-transport': transportSecret,
      },
      body: JSON.stringify(update),
      signal: AbortSignal.timeout(4000),
    });
    if (n8nResp.ok) {
      deliveredToN8n = true;
    }
  } catch {
    // Modo edge/nativo
  }

  // Persistência na caixa postal técnica de transporte para consumo assíncrono (D1 se disponível)
  if (env.DB) {
    const text = String(update.message?.text ?? update.message?.caption ?? update.callback_query?.data ?? '').trim();
    const eventKind = update.callback_query ? 'CALLBACK' : update.message?.document ? 'DOCUMENT' : update.message?.photo ? 'IMAGE' : text.startsWith('/') ? 'COMMAND' : 'TEXT';
    const eventId = `telegram-event-${updateId}`;

    await env.DB.prepare(`INSERT OR IGNORE INTO telegram_inbound_events
      (id, update_id, owner_id, chat_id, message_id, reply_to_message_id, event_kind, text, payload_json, status, available_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        eventId,
        updateId,
        ownerId,
        chatId,
        String(message.message_id),
        update.message?.reply_to_message?.message_id ? String(update.message.reply_to_message.message_id) : null,
        eventKind,
        text,
        JSON.stringify(update),
        deliveredToN8n ? 'FORWARDED_TO_N8N' : 'QUEUED',
        receivedAt,
        receivedAt
      ).run();
  }

  // Retorno técnico puro: Zero decisões de negócio, zero mutação de documentos, zero envio Telegram direto
  return NextResponse.json({
    ok: true,
    queued: true,
    deliveredToN8n,
    updateId,
    status: deliveredToN8n ? 'FORWARDED_TO_N8N' : 'QUEUED'
  }, { status: 202 });
}

async function consumeRateLimit(chatId: string) {
  if (!env.DB) return true;
  const configured = Number(env.TELEGRAM_RATE_LIMIT_PER_MINUTE ?? 10);
  const limit = Number.isSafeInteger(configured) && configured >= 1 && configured <= 60 ? configured : 10;
  const windowStartedAt = Math.floor(Date.now() / 60_000) * 60_000;
  const bucketKey = `${chatId}:${windowStartedAt}`;
  const row = await env.DB.prepare(`INSERT INTO telegram_rate_limits (bucket_key, chat_id, window_started_at, request_count) VALUES (?, ?, ?, 1)
    ON CONFLICT(bucket_key) DO UPDATE SET request_count = request_count + 1 RETURNING request_count`)
    .bind(bucketKey, chatId, windowStartedAt).first<{ request_count: number }>();
  return Boolean(row && row.request_count <= limit);
}

async function constantTimeEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(left)),
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(right))
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) difference |= leftBytes[index] ^ rightBytes[index];
  return difference === 0;
}