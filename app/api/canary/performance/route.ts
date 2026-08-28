import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isDenied, requireDashboardReader } from '../../reviews/shared';
import { PERFORMANCE_CANARY_CASES, PERFORMANCE_CANARY_RUN_ID, PERFORMANCE_CANARY_TENANT_ID } from './shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type RunRow = { id: string; status: string; case_count: number; created_at: number; updated_at: number };
type DecisionRow = { decision: string; reviewer_email: string; rationale: string; created_at: number };

export async function GET() {
  const user = await requireDashboardReader();
  if (isDenied(user)) return user;
  if (!env.DB) return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });

  await ensureRun();
  const [run, decision] = await Promise.all([
    env.DB.prepare('SELECT id, status, case_count, created_at, updated_at FROM canary_review_runs WHERE id = ?')
      .bind(PERFORMANCE_CANARY_RUN_ID).first<RunRow>(),
    env.DB.prepare('SELECT decision, reviewer_email, rationale, created_at FROM canary_review_decisions WHERE run_id = ?')
      .bind(PERFORMANCE_CANARY_RUN_ID).first<DecisionRow>(),
  ]);
  return NextResponse.json({
    ok: true,
    run: run && { ...run, data_scope: 'SYNTHETIC_ONLY', capability: 'PERFORMANCE_SCORING_STATE' },
    cases: PERFORMANCE_CANARY_CASES,
    decision: decision && { ...decision, created_at: new Date(decision.created_at).toISOString() },
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function ensureRun() {
  const now = Date.now();
  await env.DB.prepare(`INSERT OR IGNORE INTO canary_review_runs
    (id, tenant_id, domain, capability, data_scope, case_count, status, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(PERFORMANCE_CANARY_RUN_ID, PERFORMANCE_CANARY_TENANT_ID, 'performance', 'PERFORMANCE_SCORING_STATE',
      'SYNTHETIC_ONLY', PERFORMANCE_CANARY_CASES.length, 'PENDING_REVIEW', JSON.stringify(PERFORMANCE_CANARY_CASES), now, now).run();
}
