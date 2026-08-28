import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isDenied, requireReviewer } from '../../../reviews/shared';
import { ensureRun } from '../route';
import { isPerformanceCanaryDecision, PERFORMANCE_CANARY_RUN_ID, PERFORMANCE_CANARY_TENANT_ID } from '../shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type ExistingDecision = { decision: string; reviewer_email: string; rationale: string; created_at: number };

export async function POST(request: Request) {
  const user = await requireReviewer();
  if (isDenied(user)) return user;
  if (!env.DB) return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });
  let body: { decision?: unknown; rationale?: unknown };
  try { body = await request.json() as { decision?: unknown; rationale?: unknown }; } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }
  const rationale = typeof body.rationale === 'string' ? body.rationale.trim() : '';
  if (!isPerformanceCanaryDecision(body.decision)) return NextResponse.json({ ok: false, error: 'invalid_decision' }, { status: 400 });
  if (rationale.length < 10 || rationale.length > 1_000) return NextResponse.json({ ok: false, error: 'invalid_rationale' }, { status: 400 });

  await ensureRun();
  const existing = await env.DB.prepare('SELECT decision, reviewer_email, rationale, created_at FROM canary_review_decisions WHERE run_id = ?')
    .bind(PERFORMANCE_CANARY_RUN_ID).first<ExistingDecision>();
  if (existing) return NextResponse.json({ ok: true, already_recorded: true, decision: serialize(existing) });

  const now = Date.now();
  const id = crypto.randomUUID();
  const status = body.decision === 'APPROVE_A1' ? 'APPROVED' : 'ADJUSTMENT_REQUESTED';
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO canary_review_decisions
      (id, run_id, tenant_id, decision, reviewer_id, reviewer_email, rationale, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, PERFORMANCE_CANARY_RUN_ID, PERFORMANCE_CANARY_TENANT_ID, body.decision, user.userId, user.email, rationale, now),
    env.DB.prepare('UPDATE canary_review_runs SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, now, PERFORMANCE_CANARY_RUN_ID),
    env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), user.userId, user.email, 'CANARY_A1_REVIEW_RECORDED', 'canary_review_run', PERFORMANCE_CANARY_RUN_ID,
        JSON.stringify({ decision: body.decision, data_scope: 'SYNTHETIC_ONLY', external_effects: 'PROHIBITED' }), now),
  ]);
  return NextResponse.json({ ok: true, decision: serialize({ decision: body.decision, reviewer_email: user.email, rationale, created_at: now }) }, { status: 201 });
}

function serialize(decision: ExistingDecision) {
  return { ...decision, created_at: new Date(decision.created_at).toISOString() };
}
