import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { requireDashboardReader, isDenied } from '../../reviews/shared';
import { sanitizeShadowObservation } from '../../../../engines/shadow/telemetry-record.mjs';
import { monitorShadowWindow } from '../../../../engines/shadow/shadow-monitor.mjs';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const reader = await requireDashboardReader();
  if (isDenied(reader)) return reader;
  if (!env.DB) return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });
  const rows = await env.DB.prepare(`SELECT release_id, observed_at, duration_ms, total_cases, completed_cases, errors,
    equivalence_rate_bps, divergence_rate_bps, state_mutation_count, external_effect_count, pause_required, data_scope
    FROM shadow_observations ORDER BY observed_at DESC LIMIT 24`).all<Record<string, number | string>>();
  const observations = rows.results.map((row) => ({
    release_id: row.release_id, observed_at: new Date(Number(row.observed_at)).toISOString(), duration_ms: row.duration_ms,
    total_cases: row.total_cases, completed_cases: row.completed_cases, errors: row.errors,
    equivalence_rate: Number(row.equivalence_rate_bps) / 10_000, divergence_rate: Number(row.divergence_rate_bps) / 10_000,
    state_mutation_count: row.state_mutation_count, external_effect_count: row.external_effect_count,
    pause_required: Boolean(row.pause_required), data_scope: row.data_scope,
  }));
  return NextResponse.json({ ok: true, read_only: true, count: observations.length, monitor: monitorShadowWindow(observations), observations }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  if (!env.DB || !env.SHADOW_TELEMETRY_SECRET) return NextResponse.json({ ok: false, error: 'telemetry_unavailable' }, { status: 503 });
  const supplied = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!supplied || !(await constantTimeEqual(supplied, env.SHADOW_TELEMETRY_SECRET))) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  try {
    const bytes = await request.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 16_384) return NextResponse.json({ ok: false, error: 'invalid_request_size' }, { status: 413 });
    const observation = sanitizeShadowObservation(JSON.parse(new TextDecoder().decode(bytes)));
    const id = `shadow:${observation.releaseId}:${observation.observedAt}`;
    const result = await env.DB.prepare(`INSERT OR IGNORE INTO shadow_observations
      (id, release_id, observed_at, duration_ms, total_cases, completed_cases, errors, equivalence_rate_bps, divergence_rate_bps,
       state_mutation_count, external_effect_count, pause_required, data_scope, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, observation.releaseId, observation.observedAt, observation.durationMs, observation.totalCases, observation.completedCases,
        observation.errors, observation.equivalenceRateBps, observation.divergenceRateBps, observation.stateMutationCount,
        observation.externalEffectCount, observation.pauseRequired ? 1 : 0, observation.dataScope, Date.now()).run();
    const recent = await env.DB.prepare(`SELECT observed_at, total_cases, completed_cases, errors, divergence_rate_bps,
      state_mutation_count, external_effect_count, pause_required FROM shadow_observations ORDER BY observed_at DESC LIMIT 24`).all<Record<string, number>>();
    const monitor = monitorShadowWindow(recent.results.map((row) => ({ ...row, observed_at: new Date(row.observed_at).toISOString(), divergence_rate: row.divergence_rate_bps / 10_000 })));
    return NextResponse.json({ ok: true, inserted: (result.meta.changes ?? 0) === 1, observation_id: id, monitor }, { status: (result.meta.changes ?? 0) === 1 ? 201 : 200 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'invalid_shadow_observation';
    return NextResponse.json({ ok: false, error: code.toLowerCase() }, { status: 400 });
  }
}

async function constantTimeEqual(left: string, right: string) {
  const [a, b] = await Promise.all([left, right].map((value) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
  const aa = new Uint8Array(a); const bb = new Uint8Array(b); let difference = 0;
  for (let index = 0; index < aa.length; index += 1) difference |= aa[index] ^ bb[index];
  return difference === 0;
}
