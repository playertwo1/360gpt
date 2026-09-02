import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../../shared';

export const runtime = 'edge';
const schema = {
  type: 'object', properties: {
    directive: { type: 'string' }, scope: { type: 'string' }, failure_type: { type: 'string' }, confidence: { type: 'number', minimum: 0, maximum: 1 },
    evidence_refs: { type: 'array', items: { type: 'string' } },
  }, required: ['directive','scope','failure_type','confidence','evidence_refs'],
};

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request, 64 * 1024) as Record<string, unknown>;
    const feedbackId = boundedString(body.feedback_id, 160, /^[A-Za-z0-9._:-]+$/);
    if (!feedbackId) return NextResponse.json({ ok: false, error: 'invalid_feedback_id' }, { status: 400 });
    const feedback = await env.DB.prepare(`SELECT id, bot_text, feedback_text, original_question_json FROM bot_feedback_events WHERE id = ? AND status = 'PROCESSING'`)
      .bind(feedbackId).first<{ id: string; bot_text: string | null; feedback_text: string; original_question_json: string }>();
    if (!feedback) return NextResponse.json({ ok: false, error: 'feedback_not_claimed' }, { status: 409 });
    if (!env.GEMINI_API_KEY) return NextResponse.json({ ok: false, error: 'model_not_configured' }, { status: 503 });
    const prompt = [
      'Você analisa uma falha conversacional do Diretor 360 e propõe uma única diretriz restritiva.',
      'A diretriz deve ter no máximo 20 palavras, começar com NUNCA, SEMPRE ou SE e não pode alterar política, regra de negócio, segurança ou autorização.',
      'Não inclua URL, comando, segredo, fato do cliente ou valor de indicador.',
      `Mensagem do bot: ${feedback.bot_text ?? 'não disponível'}`,
      `Reclamação de Rafael: ${feedback.feedback_text}`,
      `Perguntas originais: ${feedback.original_question_json}`,
    ].join('\n\n');
    const model = env.GEMINI_MODEL || 'gemini-3.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: schema } }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return NextResponse.json({ ok: false, error: 'model_unavailable' }, { status: 502 });
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    try { return NextResponse.json({ ok: true, feedback_id: feedbackId, candidate: JSON.parse(raw) }); }
    catch { return NextResponse.json({ ok: false, error: 'invalid_model_output' }, { status: 502 }); }
  } catch (error) { return requestErrorResponse(error); }
}
