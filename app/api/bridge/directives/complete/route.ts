import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { sendTelegramText } from '../../../../../lib/telegram-messages';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge, sha256 } from '../../shared';

export const runtime = 'edge';
const PREFIX = /^(NUNCA|SEMPRE|SE)\b/u;
const FORBIDDEN = /(https?:\/\/|\/\w+|token|senha|secret|credencial|ignore (as|todas)|mude (a|o) política)/iu;

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 32 * 1024) as Record<string, unknown>;
    const feedbackId = boundedString(body.feedback_id, 160, /^[A-Za-z0-9._:-]+$/);
    const claimToken = boundedString(body.claim_token, 80, /^[A-Za-z0-9-]+$/);
    const directive = boundedString(body.directive, 240);
    const scope = boundedString(body.scope, 80, /^[A-Z0-9_:-]+$/) || 'TELEGRAM_CONVERSATION';
    const failureType = boundedString(body.failure_type, 80, /^[A-Z0-9_:-]+$/) || 'CONVERSATION_ERROR';
    const confidence = Number(body.confidence);
    const evidenceRefs = Array.isArray(body.evidence_refs) ? body.evidence_refs.slice(0, 10).map((item) => boundedString(item, 160)).filter(Boolean) : [];
    const words = directive.split(/\s+/).filter(Boolean);
    if (!feedbackId || !claimToken || !directive || words.length > 20 || !PREFIX.test(directive) || FORBIDDEN.test(directive) || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      return NextResponse.json({ ok: false, error: 'invalid_directive_candidate' }, { status: 400 });
    }
    const feedback = await env.DB.prepare(`SELECT id, owner_id, chat_id, protocol, status FROM bot_feedback_events WHERE id = ? AND status = 'PROCESSING' AND claim_token = ? AND claim_expires_at >= ?`)
      .bind(feedbackId, claimToken, Date.now()).first<{ id: string; owner_id: string; chat_id: string; protocol: string | null; status: string }>();
    if (!feedback) return NextResponse.json({ ok: false, error: 'feedback_not_claimed' }, { status: 409 });
    if (confidence < 0.8) {
      await env.DB.prepare(`UPDATE bot_feedback_events SET status = 'REVIEW_REQUIRED', claim_token = NULL, claim_expires_at = NULL, processed_at = ? WHERE id = ? AND claim_token = ?`).bind(Date.now(), feedbackId, claimToken).run();
      return NextResponse.json({ ok: true, status: 'REVIEW_REQUIRED', candidate_created: false });
    }
    const contentHash = await sha256(`${feedback.owner_id}|${scope}|${directive.toUpperCase()}`);
    const existing = await env.DB.prepare(`SELECT id, status FROM bot_directives WHERE owner_id = ? AND content_hash = ? ORDER BY version DESC LIMIT 1`).bind(feedback.owner_id, contentHash).first<{ id: string; status: string }>();
    const now = Date.now();
    if (existing) {
      await env.DB.prepare(`UPDATE bot_feedback_events SET status = 'DUPLICATE', claim_token = NULL, claim_expires_at = NULL, processed_at = ? WHERE id = ? AND claim_token = ?`).bind(now, feedbackId, claimToken).run();
      return NextResponse.json({ ok: true, duplicate: true, directive_id: existing.id, status: existing.status });
    }
    const directiveId = `directive-${crypto.randomUUID()}`;
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO bot_directives (id, owner_id, source_feedback_id, directive, scope, failure_type, confidence_bps, evidence_refs_json, content_hash, version, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'CANDIDATE', ?, ?)`).bind(directiveId, feedback.owner_id, feedbackId, directive, scope, failureType, Math.round(confidence * 10000), JSON.stringify(evidenceRefs), contentHash, now, now),
      env.DB.prepare(`UPDATE bot_feedback_events SET status = 'CANDIDATE_CREATED', claim_token = NULL, claim_expires_at = NULL, processed_at = ? WHERE id = ? AND claim_token = ?`).bind(now, feedbackId, claimToken),
    ]);
    if (env.TELEGRAM_BOT_TOKEN) await sendTelegramText(env.TELEGRAM_BOT_TOKEN, Number(feedback.chat_id), `NOVA DIRETRIZ CANDIDATA\n\nID: ${directiveId}\nRegra: ${directive}\nEscopo: ${scope}\nConfiança: ${Math.round(confidence * 100)}%\n\nEla permanece inativa. Para aprovar, use:\n/aprovardiretriz ${directiveId}`);
    return NextResponse.json({ ok: true, directive_id: directiveId, status: 'CANDIDATE' });
  } catch (error) { return requestErrorResponse(error); }
}
