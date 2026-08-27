import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isDenied, requireDashboardReader } from '../../../reviews/shared';

export const runtime = 'edge'; export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireDashboardReader(); if (isDenied(access)) return access; const { id } = await context.params;
  const row = await env.DB.prepare(`SELECT raw_text, status FROM documents WHERE id = ? AND owner_id = ? AND source = 'pobj_mobile'`).bind(id, access.userId).first<{ raw_text: string | null; status: string }>();
  if (!row) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  if (row.status === 'published') return NextResponse.json({ ok: false, error: 'already_published' }, { status: 409 });
  let body: { currentPoints?: unknown; targetPoints?: unknown; note?: unknown; indicators?: unknown }; try { body = await request.json() as typeof body; } catch { return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 }); }
  const currentPoints = numberInRange(body.currentPoints, 0, 100000); const targetPoints = numberInRange(body.targetPoints, 1, 100000);
  if (currentPoints === null || targetPoints === null || currentPoints > targetPoints * 2) return NextResponse.json({ ok: false, error: 'invalid_points' }, { status: 400 });
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''; const indicators = validateIndicators(body.indicators); if (indicators === null) return NextResponse.json({ ok: false, error: 'invalid_indicators' }, { status: 400 }); let meta: Record<string, unknown> = {}; try { meta = JSON.parse(row.raw_text ?? '{}') as Record<string, unknown>; } catch { /* keep empty */ }
  const approvedAt = new Date().toISOString(); const approved = { currentPoints, targetPoints, note, indicators, performanceAnalysis: analyzeIndicators(indicators), approvedAt, approvedBy: access.email };
  await env.DB.batch([
    env.DB.prepare(`UPDATE documents SET raw_text = ?, status = 'published' WHERE id = ? AND owner_id = ?`).bind(JSON.stringify({ ...meta, official: true, approved }), id, access.userId),
    env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'pobj_published', 'document', ?, ?, ?)`).bind(`audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, id, JSON.stringify(approved), Date.now()),
  ]);
  return NextResponse.json({ ok: true, id, status: 'published', official: true, approved });
}
function numberInRange(value: unknown, min: number, max: number) { const number = typeof value === 'number' ? value : Number(value); return Number.isFinite(number) && number >= min && number <= max ? number : null; }
type ApprovedIndicator = { key: string; name: string; value: number; unit: 'percent'|'points'|'currency'|'count'; target: number | null };
function validateIndicators(value: unknown): ApprovedIndicator[] | null {
  if (value === undefined) return []; if (!Array.isArray(value) || value.length > 30) return null; const result: ApprovedIndicator[] = [];
  for (const item of value) { if (!item || typeof item !== 'object') return null; const row = item as Record<string, unknown>; const key = String(row.key??'').trim().slice(0,40); const name = String(row.name??'').trim().slice(0,80); const unit = String(row.unit??''); const numeric = numberInRange(row.value,-1_000_000_000,1_000_000_000); const target = row.target === null || row.target === '' || row.target === undefined ? null : numberInRange(row.target,0,1_000_000_000); if (!key || !name || numeric===null || !['percent','points','currency','count'].includes(unit) || target===null && row.target!==null && row.target!=='' && row.target!==undefined) return null; result.push({key,name,value:numeric,unit:unit as ApprovedIndicator['unit'],target}); }
  return result;
}
function analyzeIndicators(items: ApprovedIndicator[]) { return items.map((item) => { if (item.target === null || item.target === 0) return { key:item.key,status:'MONITORAR',message:'Meta não informada; acompanhar evolução.' }; const ratio=item.value/item.target; const inverse=item.key==='vencidos'; const good=inverse?item.value<=item.target:ratio>=1; const attention=inverse?item.value<=item.target*1.3:ratio>=0.7; return {key:item.key,status:good?'ATINGIDO':attention?'ATENCAO':'CRITICO',message:good?'Meta atingida ou dentro do limite.':attention?'Próximo da meta; exige plano de fechamento.':'Distante da meta; priorizar ação.'}; }); }
