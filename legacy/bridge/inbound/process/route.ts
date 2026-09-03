import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { handleClarificationReply, handleTelegramCommand } from '../../../../../lib/telegram-runtime';
import { sendTelegramText } from '../../../../../lib/telegram-messages';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';

export const runtime = 'edge';
export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 64 * 1024) as Record<string, unknown>;
    const eventId = boundedString(body.event_id, 180, /^[A-Za-z0-9._:-]+$/); const token = boundedString(body.claim_token, 80, /^[A-Za-z0-9-]+$/);
    if (!eventId || !token) return NextResponse.json({ ok: false, error: 'invalid_claim' }, { status: 400 });
    const event = await env.DB.prepare(`SELECT id, owner_id, chat_id, message_id, reply_to_message_id, event_kind, text, batch_id FROM telegram_inbound_events WHERE id = ? AND status = 'PROCESSING' AND lease_token = ? AND lease_expires_at >= ?`).bind(eventId, token, Date.now()).first<Record<string, unknown>>();
    if (!event) return NextResponse.json({ ok: false, error: 'claim_not_found' }, { status: 409 });
    const text = event.batch_id ? String((await env.DB.prepare(`SELECT combined_text FROM telegram_message_batches WHERE id = ?`).bind(event.batch_id).first<{ combined_text: string }>())?.combined_text ?? event.text ?? '') : String(event.text ?? '');
    const chatId = Number(event.chat_id); const messageId = Number(event.message_id); const ownerId = String(event.owner_id);
    const clarification = await handleClarificationReply(env.DB, env.TELEGRAM_BOT_TOKEN ?? '', chatId, ownerId, messageId, text, event.reply_to_message_id ? Number(event.reply_to_message_id) : undefined);
    const interaction = clarification ? { handled: true, kind: 'clarification' } : await handleTelegramCommand(env.DB, env.TELEGRAM_BOT_TOKEN ?? '', chatId, ownerId, text);
    if (!interaction.handled && env.TELEGRAM_BOT_TOKEN) await sendTelegramText(env.TELEGRAM_BOT_TOKEN, chatId, 'Envie um PDF, imagem ou planilha para análise, ou use /comandos.');
    await env.DB.batch([
      env.DB.prepare(`UPDATE telegram_inbound_events SET status = 'COMPLETED', completed_at = ?, lease_token = NULL, lease_expires_at = NULL WHERE batch_id = ? AND lease_token = ?`).bind(Date.now(), event.batch_id, token),
      env.DB.prepare(`UPDATE telegram_inbound_events SET status = 'COMPLETED', completed_at = ?, lease_token = NULL, lease_expires_at = NULL WHERE id = ? AND lease_token = ?`).bind(Date.now(), eventId, token),
      ...(event.batch_id ? [env.DB.prepare(`UPDATE telegram_message_batches SET status = 'COMPLETED', completed_at = ? WHERE id = ?`).bind(Date.now(), event.batch_id)] : []),
    ]);
    return NextResponse.json({ ok: true, status: 'COMPLETED', kind: interaction.kind ?? 'guidance' });
  } catch (error) { return requestErrorResponse(error); }
}
