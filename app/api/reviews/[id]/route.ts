import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { bounded, isDenied, OPEN_REVIEW_STATUSES, requireReviewer, type ReviewRequestRow } from '../shared';
import { readBoundedJson } from '../../bridge/shared';

export const runtime = 'edge';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireReviewer(); if (isDenied(user)) return user;
  const reviewId = bounded((await context.params).id, 36, UUID);
  const body = await readBoundedJson(request) as Record<string, unknown>;
  const action = bounded(body.action, 32, /^[A-Z_]+$/);
  if (!reviewId || !['ASSIGN_TO_ME', 'START_REVIEW', 'ESCALATE'].includes(action)) return NextResponse.json({ ok: false, error: 'invalid_transition' }, { status: 400 });
  const row = await env.DB.prepare('SELECT * FROM manual_review_requests WHERE review_request_id = ?').bind(reviewId).first<ReviewRequestRow>();
  if (!row) return NextResponse.json({ ok: false, error: 'review_not_found' }, { status: 404 });
  if (!(OPEN_REVIEW_STATUSES as readonly string[]).includes(row.status)) return NextResponse.json({ ok: false, error: 'review_closed' }, { status: 409 });

  let nextStatus = row.status; let assignedTo = row.assigned_to; let escalation = row.escalation_level;
  if (action === 'ASSIGN_TO_ME') { if (!['PENDING_TRIAGE', 'ESCALATED', 'MORE_DATA_REQUIRED'].includes(row.status)) return NextResponse.json({ ok: false, error: 'transition_not_allowed' }, { status: 409 }); nextStatus = 'ASSIGNED'; assignedTo = user.userId; }
  if (action === 'START_REVIEW') { if (row.status !== 'ASSIGNED' || row.assigned_to !== user.userId) return NextResponse.json({ ok: false, error: 'assignment_required' }, { status: 409 }); nextStatus = 'IN_REVIEW'; }
  if (action === 'ESCALATE') { if (row.escalation_level >= 3) return NextResponse.json({ ok: false, error: 'max_escalation_reached' }, { status: 409 }); nextStatus = 'ESCALATED'; escalation += 1; assignedTo = null; }
  const now = Date.now();
  const results = await env.DB.batch([
    env.DB.prepare(`UPDATE manual_review_requests SET status = ?, assigned_to = ?, escalation_level = ? WHERE review_request_id = ? AND status = ?`)
      .bind(nextStatus, assignedTo, escalation, reviewId, row.status),
    env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
      SELECT ?, ?, ?, ?, 'manual_review', ?, ?, ? WHERE changes() = 1`)
      .bind(crypto.randomUUID(), user.email.toLowerCase(), `reviewer:${user.userId}`, `review_${action.toLowerCase()}`, reviewId,
        JSON.stringify({ previous_status: row.status, status: nextStatus, escalation_level: escalation }), now),
  ]);
  if ((results[0].meta?.changes ?? 0) !== 1) return NextResponse.json({ ok: false, error: 'concurrent_transition' }, { status: 409 });
  return NextResponse.json({ ok: true, review_request_id: reviewId, status: nextStatus, assigned_to: assignedTo, escalation_level: escalation });
}
