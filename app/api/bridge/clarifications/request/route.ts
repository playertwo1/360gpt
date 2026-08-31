import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';
import { sendTelegramText } from '../../../../../lib/telegram-messages';

export const runtime = 'edge';

type Question = { id: string; field: string; question: string; indicator?: string; evidence?: string };

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const jobId = boundedString(body.job_id, 160, /^[A-Za-z0-9._:-]+$/);
    const leaseToken = boundedString(body.lease_token, 80, /^[A-Za-z0-9-]+$/);
    const rawQuestions = Array.isArray(body.questions) ? body.questions : [];
    const questions = rawQuestions.slice(0, 8).map((item, index) => {
      const value = item as Record<string, unknown>;
      return {
        id: boundedString(value.id, 80) || `q${index + 1}`,
        field: boundedString(value.field, 160) || 'unknown',
        indicator: boundedString(value.indicator, 200) || undefined,
        question: boundedString(value.question, 700) || '',
        evidence: boundedString(value.evidence, 700) || undefined,
      } satisfies Question;
    }).filter((item) => item.question);
    if (!jobId || !leaseToken || !questions.length) return NextResponse.json({ ok: false, error: 'invalid_clarification' }, { status: 400 });

    const job = await env.DB.prepare(`SELECT ar.id, ar.document_id, d.owner_id, d.source
      FROM agent_runs ar JOIN documents d ON d.id = ar.document_id
      WHERE ar.id = ? AND ar.status = 'PROCESSING' AND ar.lease_token = ? AND ar.lease_expires_at >= ?`)
      .bind(jobId, leaseToken, Date.now()).first<{ id: string; document_id: string; owner_id: string; source: string }>();
    if (!job) return NextResponse.json({ ok: false, error: 'lease_not_found' }, { status: 409 });
    if (job.source !== 'telegram' || !env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ ok: false, error: 'telegram_required' }, { status: 409 });
    const configuredChats = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? '').split(',').map((value) => value.trim()).filter((value) => /^-?[0-9]{1,20}$/.test(value));
    const chatId = /^-?[0-9]{1,20}$/.test(job.owner_id) ? job.owner_id : configuredChats.length === 1 ? configuredChats[0] : null;
    if (!chatId) return NextResponse.json({ ok: false, error: 'chat_not_resolved' }, { status: 409 });

    const existing = await env.DB.prepare(`SELECT id, telegram_message_id FROM clarification_requests WHERE job_id = ? AND status IN ('PENDING','NEEDS_FOLLOW_UP') ORDER BY created_at DESC LIMIT 1`)
      .bind(jobId).first<{ id: string; telegram_message_id: string | null }>();
    if (existing) return NextResponse.json({ ok: true, duplicate: true, clarification_id: existing.id, telegram_message_id: existing.telegram_message_id });

    const clarificationId = `clar-${crypto.randomUUID()}`;
    const dueAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const questionText = [
      'PRECISO DA SUA CONFIRMAÇÃO',
      '',
      'O arquivo não será concluído enquanto estas dúvidas materiais não forem esclarecidas:',
      ...questions.map((item, index) => `${index + 1}. ${item.question}${item.evidence ? `\n   Evidência: ${item.evidence}` : ''}`),
      '',
      'Responda diretamente a esta mensagem em linguagem natural. Se houver mais de um arquivo pendente, use sempre o botão Responder.',
      `Protocolo: ${job.document_id}`,
      'Prazo: 7 dias.',
    ].join('\n');
    const telegramMessageId = await sendTelegramText(env.TELEGRAM_BOT_TOKEN, Number(chatId), questionText);
    const now = Date.now();
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO clarification_requests (id, job_id, document_id, owner_id, chat_id, telegram_message_id, status, questions_json, evidence_json, due_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)`)
        .bind(clarificationId, jobId, job.document_id, job.owner_id, chatId, telegramMessageId, JSON.stringify(questions), JSON.stringify(questions.map((item) => item.evidence).filter(Boolean)), dueAt, now),
      env.DB.prepare(`UPDATE agent_runs SET status = 'AWAITING_OWNER_INPUT', output_json = ?, lease_token = NULL, lease_expires_at = NULL WHERE id = ? AND lease_token = ?`)
        .bind(JSON.stringify({ clarification_id: clarificationId, questions }), jobId, leaseToken),
      env.DB.prepare(`UPDATE documents SET status = 'awaiting_owner_input' WHERE id = ?`).bind(job.document_id),
      env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, 'bridge:clarification', 'clarification_requested', 'agent_run', ?, ?, ?)`)
        .bind(`audit-${clarificationId}`, job.owner_id, jobId, JSON.stringify({ clarificationId, questionCount: questions.length, dueAt }), now),
    ]);
    return NextResponse.json({ ok: true, clarification_id: clarificationId, status: 'AWAITING_OWNER_INPUT', telegram_message_id: telegramMessageId, due_at: new Date(dueAt).toISOString() });
  } catch (error) { return requestErrorResponse(error); }
}
