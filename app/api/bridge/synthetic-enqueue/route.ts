import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge } from '../shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  const denied = await requireBridge(request);
  if (denied) return denied;

  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const testId = boundedString(body.test_id, 64, /^[a-z0-9-]+$/);
    if (!testId || !testId.startsWith('h3-')) {
      return NextResponse.json({ ok: false, error: 'invalid_synthetic_test_id' }, { status: 400 });
    }

    const documentId = `synthetic-${testId}`;
    const jobId = `synthetic-run-${testId}`;
    const now = Date.now();
    const existing = await env.DB.prepare('SELECT status FROM agent_runs WHERE id = ?').bind(jobId).first<{ status: string }>();

    if (!existing) {
      await env.DB.batch([
        env.DB.prepare(`INSERT INTO documents
          (id, owner_id, source, source_message_id, raw_text, status, received_at)
          VALUES (?, 'h3-synthetic', 'bridge_synthetic_test', ?, ?, 'received', ?)`)
          .bind(documentId, testId, 'TESTE SINTÉTICO H3 — validar a ponte híbrida sem executar qualquer ação externa.', now),
        env.DB.prepare(`INSERT INTO agent_runs
          (id, document_id, agent_role, status, input_summary, attempt_count, available_at)
          VALUES (?, ?, 'diretor', 'QUEUED', ?, 0, ?)`)
          .bind(jobId, documentId, 'Teste sintético controlado da ponte híbrida H3.', now),
        env.DB.prepare(`INSERT OR IGNORE INTO audit_log
          (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
          VALUES (?, 'h3-synthetic', 'bridge:h3-test', 'synthetic_job_enqueued', 'agent_run', ?, ?, ?)`)
          .bind(`audit-${testId}`, jobId, JSON.stringify({ externalEffectsAllowed: false, dataClassification: 'SYNTHETIC' }), now),
      ]);
    }

    return NextResponse.json({
      ok: true,
      duplicate: Boolean(existing),
      job_id: jobId,
      status: existing?.status ?? 'QUEUED',
      security: { data_classification: 'SYNTHETIC', external_effects_allowed: false },
    }, { status: existing ? 200 : 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return requestErrorResponse(error);
  }
}
