import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { bounded, isDenied, OPEN_REVIEW_STATUSES, parseJsonArray, parseJsonObject, requireDashboardReader, slaState, type ReviewRequestRow } from './shared';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await requireDashboardReader(); if (isDenied(access)) return access;
  const url = new URL(request.url);
  const tenantId = bounded(url.searchParams.get('tenant_id') ?? 'tenant-demo', 120);
  const requestedStatus = bounded(url.searchParams.get('status') ?? 'OPEN', 40, /^[A-Z_]+$/);
  if (!tenantId || !requestedStatus) return NextResponse.json({ ok: false, error: 'invalid_filter' }, { status: 400 });
  const statuses = requestedStatus === 'OPEN' ? [...OPEN_REVIEW_STATUSES] : [requestedStatus];
  const placeholders = statuses.map(() => '?').join(',');
  const result = await env.DB.prepare(`SELECT * FROM manual_review_requests WHERE tenant_id = ? AND status IN (${placeholders})
    ORDER BY CASE review_priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END, due_at ASC, created_at ASC LIMIT 100`)
    .bind(tenantId, ...statuses).all<ReviewRequestRow>();
  const reviews = (result.results ?? []).map((row) => ({
    review_request_id: row.review_request_id, event_id: row.event_id, correlation_id: row.correlation_id,
    state_id: row.state_id, state_version: row.state_version, reason_code: row.reason_code, category: row.category,
    severity: row.severity, review_priority: row.review_priority, status: row.status, owner_queue: row.owner_queue,
    assigned_to: row.assigned_to, sla_policy_id: row.sla_policy_id, escalation_level: row.escalation_level,
    problem_statement: row.problem_statement, affected_scope: parseJsonObject(row.affected_scope_json), impact: row.impact,
    required_decision: row.required_decision, suggested_checks: parseJsonArray(row.suggested_checks_json),
    reviewer_role: row.reviewer_role, allowed_resolutions: parseJsonArray(row.allowed_resolutions_json),
    due_at: row.due_at ? new Date(row.due_at).toISOString() : null, created_at: new Date(row.created_at).toISOString(),
    completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null, sla_state: slaState(row.due_at, row.created_at),
  }));
  return NextResponse.json({ ok: true, read_only: true, tenant_id: tenantId, count: reviews.length, reviews }, { headers: { 'Cache-Control': 'private, no-store' } });
}
