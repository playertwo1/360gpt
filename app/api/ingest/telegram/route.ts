import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

type TelegramDocument = { file_id: string; file_unique_id: string; file_name?: string; mime_type?: string; file_size?: number };
type TelegramUpdate = { update_id: number; message?: { message_id: number; date: number; text?: string; caption?: string; document?: TelegramDocument; chat: { id: number; type: string }; from?: { id: number; username?: string; first_name?: string } } };

export const runtime = 'edge';

export async function POST(request: Request) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  if (!env.TELEGRAM_WEBHOOK_SECRET || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true, ignored: true });

  const allowedChats = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!allowedChats.includes(String(message.chat.id))) {
    return NextResponse.json({ ok: false, error: 'chat_not_allowed' }, { status: 403 });
  }

  const documentId = crypto.randomUUID();
  const receivedAt = Date.now();
  const document = message.document;
  let storageKey: string | null = null;

  if (document) {
    if (!env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false, error: 'bot_not_configured' }, { status: 503 });
    if ((document.file_size ?? 0) > 20 * 1024 * 1024) {
      await sendTelegramMessage(message.chat.id, 'O arquivo excede o limite de 20 MB do bot. Envie uma versão menor.');
      return NextResponse.json({ ok: true, rejected: 'file_too_large' });
    }
    const infoResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ file_id: document.file_id }),
    });
    const info = await infoResponse.json() as { ok: boolean; result?: { file_path: string } };
    if (!info.ok || !info.result?.file_path) throw new Error('Telegram getFile failed');
    const fileResponse = await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${info.result.file_path}`);
    if (!fileResponse.ok) throw new Error('Telegram file download failed');
    storageKey = `telegram/${message.chat.id}/${documentId}/${safeFileName(document.file_name ?? 'documento')}`;
    await env.FILES.put(storageKey, fileResponse.body, {
      httpMetadata: { contentType: document.mime_type ?? 'application/octet-stream' }, customMetadata: { telegramFileUniqueId: document.file_unique_id },
    });
  }

  await env.DB.batch([
    env.DB.prepare(`INSERT INTO documents (id, owner_id, source, source_message_id, original_name, mime_type, storage_key, raw_text, status, received_at) VALUES (?, ?, 'telegram', ?, ?, ?, ?, ?, 'received', ?)`)
      .bind(documentId, String(message.chat.id), String(message.message_id), document?.file_name ?? null, document?.mime_type ?? null, storageKey, message.text ?? message.caption ?? null, receivedAt),
    env.DB.prepare(`INSERT INTO agent_runs (id, document_id, agent_role, status, input_summary) VALUES (?, ?, 'diretor', 'queued', ?)`)
      .bind(crypto.randomUUID(), documentId, message.text ?? message.caption ?? document?.file_name ?? 'Nova entrada'),
    env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'ingested', 'document', ?, ?, ?)`)
      .bind(crypto.randomUUID(), String(message.chat.id), `telegram:${message.from?.id ?? 'unknown'}`, documentId, JSON.stringify({ updateId: update.update_id }), receivedAt),
  ]);

  await sendTelegramMessage(message.chat.id, 'Recebido. O Diretor começou a organizar e analisar a informação.');
  return NextResponse.json({ ok: true, documentId, status: 'queued' }, { status: 202 });
}

async function sendTelegramMessage(chatId: number, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text }),
  });
}

function safeFileName(value: string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}
