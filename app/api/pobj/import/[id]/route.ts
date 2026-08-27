import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isDenied, requireDashboardReader } from '../../../reviews/shared';

export const runtime = 'edge'; export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireDashboardReader(); if (isDenied(access)) return access; const { id } = await context.params;
  const row = await env.DB.prepare(`SELECT raw_text, status FROM documents WHERE id = ? AND owner_id = ? AND source = 'pobj_mobile'`).bind(id, access.userId).first<{ raw_text: string | null; status: string }>();
  if (!row) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  if (row.status === 'published') return NextResponse.json({ ok: false, error: 'already_published' }, { status: 409 });
  let body: { currentPoints?: unknown; targetPoints?: unknown; note?: unknown }; try { body = await request.json() as typeof body; } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }
  const currentPoints = numberInRange(body.currentPoints, 0, 100000); const targetPoints = numberInRange(body.targetPoints, 1, 100000);
  if (currentPoints === null || targetPoints === null || currentPoints > targetPoints * 2) return NextResponse.json({ ok: false, error: 'invalid_points' }, { status: 400 });
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''; let meta: Record<string, unknown> = {}; try { meta = JSON.parse(row.raw_text ?? '{}') as Record<string, unknown>; } catch { /* keep empty */ }
  const approvedAt = new Date().toISOString(); const approved = { currentPoints, targetPoints, note, approvedAt, approvedBy: access.email };
  await env.DB.batch([
    env.DB.prepare(`UPDATE documents SET raw_text = ?, status = 'published' WHERE id = ? AND owner_id = ?`).bind(JSON.stringify({ ...meta, official: true, approved }), id, access.userId),
    env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'pobj_published', 'document', ?, ?, ?)`).bind(`audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, id, JSON.stringify(approved), Date.now()),
  ]);
  return NextResponse.json({ ok: true, id, status: 'published', official: true, approved });
}
function numberInRange(value: unknown, min: number, max: number) { const number = typeof value === 'number' ? value : Number(value); return Number.isFinite(number) && number >= min && number <= max ? number : null; }
