import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge, sha256 } from '../shared';

export const runtime = 'edge';

type StateSnapshot = {
  schema_version: string; tenant_id: string; subject_ref: string; event_id: string; correlation_id: string;
  generated_at: string; overall_status: string; domain_status: unknown[]; findings: unknown[]; data_gaps: unknown[];
  gates: unknown[]; recommended_actions: unknown[]; manual_review: unknown;
};

export async function POST(request: Request) {
  const denied = await requireBridge(request); if (denied) return denied;
  try {
    const body = await readBoundedJson(request) as Record<string, unknown>;
    const jobId = boundedString(body.job_id, 160, /^[A-Za-z0-9._:-]+$/);
    const leaseToken = boundedString(body.lease_token, 80, /^[A-Za-z0-9-]+$/);
    const result = body.result as Record<string, unknown> | undefined;
    const persisted = result?.persisted_state as Record<string, unknown> | undefined;
    const snapshot = persisted?.snapshot as StateSnapshot | undefined;
    if (!jobId || !leaseToken || !validSnapshot(snapshot)) return NextResponse.json({ ok: false, error: 'invalid_completion' }, { status: 400 });

    const snapshotJson = JSON.stringify(snapshot);
    const computedHash = `sha256:${await sha256(JSON.stringify(canonicalize(snapshot)))}`;
    const suppliedHash = boundedString(persisted?.state_hash, 80, /^sha256:[0-9a-f]{64}$/);
    if (!suppliedHash || suppliedHash !== computedHash) return NextResponse.json({ ok: false, error: 'state_hash_mismatch' }, { status: 409 });
    const job = await env.DB.prepare(`SELECT status, output_json FROM agent_runs WHERE id = ? AND ((status = 'PROCESSING' AND lease_token = ? AND lease_expires_at >= ?) OR status = 'SUCCEEDED')`)
      .bind(jobId, leaseToken, Date.now()).first<{ status: string; output_json: string | null }>();
    if (!job) return NextResponse.json({ ok: false, error: 'lease_not_found' }, { status: 409 });
    if (job.status === 'SUCCEEDED') {
      const previous = job.output_json ? JSON.parse(job.output_json) as { state_id?: string; state_hash?: string } : {};
      if (previous.state_hash !== suppliedHash) return NextResponse.json({ ok: false, error: 'state_conflict' }, { status: 409 });
      return NextResponse.json({ ok: true, duplicate: true, state_id: previous.state_id, state_hash: previous.state_hash });
    }
    const existing = await env.DB.prepare(`SELECT state_hash FROM state_snapshots WHERE event_id = ?`).bind(snapshot.event_id).first<{ state_hash: string }>();
    if (existing && existing.state_hash !== suppliedHash) return NextResponse.json({ ok: false, error: 'state_conflict' }, { status: 409 });

    const now = Date.now(); const generatedAt = Date.parse(snapshot.generated_at); const stateId = boundedString(persisted?.state_id, 160) || `state-${snapshot.event_id}`;
    const requestedVersion = Number(persisted?.state_version);
    const currentVersion = await env.DB.prepare(`SELECT COALESCE(MAX(state_version), 0) AS version FROM state_snapshots WHERE tenant_id = ? AND subject_ref = ?`)
      .bind(snapshot.tenant_id, snapshot.subject_ref).first<{ version: number }>();
    const stateVersion = Number.isSafeInteger(requestedVersion) && requestedVersion > (currentVersion?.version ?? 0) ? requestedVersion : (currentVersion?.version ?? 0) + 1;
    const executiveJson = result?.executive_assessment ? JSON.stringify(result.executive_assessment) : null;
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO state_snapshots (state_id, tenant_id, subject_ref, state_version, event_id, correlation_id, state_hash, overall_status, snapshot_json, executive_assessment_json, generated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(event_id) DO NOTHING`)
        .bind(stateId, snapshot.tenant_id, snapshot.subject_ref, stateVersion, snapshot.event_id, snapshot.correlation_id, suppliedHash, snapshot.overall_status, snapshotJson, executiveJson, generatedAt, now),
      env.DB.prepare(`UPDATE agent_runs SET status = 'SUCCEEDED', output_json = ?, completed_at = ?, lease_token = NULL, lease_expires_at = NULL WHERE id = ? AND lease_token = ?`)
        .bind(JSON.stringify({ state_id: stateId, state_hash: suppliedHash }), now, jobId, leaseToken),
      env.DB.prepare(`UPDATE documents SET status = 'processed' WHERE id = (SELECT document_id FROM agent_runs WHERE id = ?)`).bind(jobId),
      env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
        SELECT ?, d.owner_id, 'bridge:n8n-local', 'state_published', 'state_snapshot', ?, ?, ? FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE ar.id = ?`)
        .bind(`bridge-complete-${jobId}`, stateId, JSON.stringify({ stateHash: suppliedHash, eventId: snapshot.event_id, externalEffectsAllowed: false }), now, jobId),
    ]);
    return NextResponse.json({ ok: true, duplicate: Boolean(existing), state_id: stateId, state_version: stateVersion, state_hash: suppliedHash });
  } catch (error) { return requestErrorResponse(error); }
}

function validSnapshot(value: StateSnapshot | undefined): value is StateSnapshot {
  if (!value || value.schema_version !== '1.0.0') return false;
  if (!boundedString(value.tenant_id, 120) || !boundedString(value.subject_ref, 160)) return false;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!boundedString(value.event_id, 36, uuid) || !boundedString(value.correlation_id, 36, uuid) || !Number.isFinite(Date.parse(value.generated_at))) return false;
  if (!['READY', 'MANUAL_REVIEW_REQUIRED'].includes(value.overall_status)) return false;
  return ['domain_status', 'findings', 'data_gaps', 'gates', 'recommended_actions'].every((key) => Array.isArray(value[key as keyof StateSnapshot]));
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
}
