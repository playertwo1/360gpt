import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { boundedString, readBoundedJson, requestErrorResponse, requireBridge, sha256 } from '../shared';
import { hashCanonical } from '../../reviews/shared';
import { createEvidenceEdge, createEvidenceNode, prepareEvidenceEdgeInsert, prepareEvidenceNodeInsert, uuidFromSha256 } from '../../evidence/shared';

export const runtime = 'edge';

type StateSnapshot = {
  schema_version: string; tenant_id: string; subject_ref: string; event_id: string; correlation_id: string;
  generated_at: string; overall_status: string; domain_status: unknown[]; findings: unknown[]; data_gaps: unknown[];
  gates: unknown[]; recommended_actions: unknown[]; manual_review: unknown;
};

type CompletedJob = {
  status: string;
  output_json: string | null;
  source: string;
  owner_id: string;
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
    const job = await env.DB.prepare(`SELECT ar.status, ar.output_json, d.source, d.owner_id
      FROM agent_runs ar JOIN documents d ON d.id = ar.document_id
      WHERE ar.id = ? AND ((ar.status = 'PROCESSING' AND ar.lease_token = ? AND ar.lease_expires_at >= ?) OR ar.status = 'SUCCEEDED')`)
      .bind(jobId, leaseToken, Date.now()).first<CompletedJob>();
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
    const statements = [
      env.DB.prepare(`INSERT INTO state_snapshots (state_id, tenant_id, subject_ref, state_version, event_id, correlation_id, state_hash, overall_status, snapshot_json, executive_assessment_json, generated_at, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(event_id) DO NOTHING`)
        .bind(stateId, snapshot.tenant_id, snapshot.subject_ref, stateVersion, snapshot.event_id, snapshot.correlation_id, suppliedHash, snapshot.overall_status, snapshotJson, executiveJson, generatedAt, now),
      env.DB.prepare(`UPDATE agent_runs SET status = 'SUCCEEDED', output_json = ?, completed_at = ?, lease_token = NULL, lease_expires_at = NULL WHERE id = ? AND lease_token = ?`)
        .bind(JSON.stringify({ state_id: stateId, state_hash: suppliedHash }), now, jobId, leaseToken),
      env.DB.prepare(`UPDATE documents SET status = 'processed' WHERE id = (SELECT document_id FROM agent_runs WHERE id = ?)`).bind(jobId),
      env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
        SELECT ?, d.owner_id, 'bridge:n8n-local', 'state_published', 'state_snapshot', ?, ?, ? FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE ar.id = ?`)
        .bind(`bridge-complete-${jobId}`, stateId, JSON.stringify({ stateHash: suppliedHash, eventId: snapshot.event_id, externalEffectsAllowed: false }), now, jobId),
    ];
    const review = snapshot.overall_status === 'MANUAL_REVIEW_REQUIRED'
      ? await buildReviewRequest(snapshot, stateId, stateVersion, now)
      : null;
    const stateNode = await createEvidenceNode({ tenantId: snapshot.tenant_id, nodeType: 'STATE_SNAPSHOT', entityId: stateId,
      entityVersion: stateVersion, contentHash: suppliedHash, payload: { overall_status: snapshot.overall_status, event_id: snapshot.event_id },
      observedAt: generatedAt, recordedAt: now, createdAt: now });
    const bridgeActor = await createEvidenceNode({ tenantId: snapshot.tenant_id, nodeType: 'ACTOR', entityId: 'bridge:n8n-local',
      payload: { actor_kind: 'SERVICE', external_effects_allowed: false }, recordedAt: now, createdAt: now });
    const stateGeneratedBy = await createEvidenceEdge({ tenantId: snapshot.tenant_id, relationshipType: 'GENERATED_BY',
      fromNodeId: stateNode.nodeId, toNodeId: bridgeActor.nodeId, payload: { workflow: 'WF-09' }, createdAt: now });
    statements.push(prepareEvidenceNodeInsert(env.DB, stateNode), prepareEvidenceNodeInsert(env.DB, bridgeActor), prepareEvidenceEdgeInsert(env.DB, stateGeneratedBy));
    if (review) {
      const reviewNode = await createEvidenceNode({ tenantId: snapshot.tenant_id, nodeType: 'MANUAL_REVIEW_REQUEST', entityId: review.reviewRequestId,
        nodeId: review.reviewRequestId, contentHash: await hashCanonical({ reason_code: review.reasonCode, priority: review.priority, owner_queue: review.ownerQueue,
          problem_statement: review.problemStatement, impact: review.impact, required_decision: review.requiredDecision }),
        payload: { reason_code: review.reasonCode, priority: review.priority, owner_queue: review.ownerQueue, status: 'PENDING_TRIAGE' },
        recordedAt: now, createdAt: now });
      const reviewActor = await createEvidenceNode({ tenantId: snapshot.tenant_id, nodeType: 'ACTOR', entityId: 'central-review:deterministic',
        payload: { actor_kind: 'SERVICE', autonomous_decision: false }, recordedAt: now, createdAt: now });
      const reviewDerivedFrom = await createEvidenceEdge({ tenantId: snapshot.tenant_id, relationshipType: 'DERIVED_FROM',
        fromNodeId: reviewNode.nodeId, toNodeId: stateNode.nodeId, payload: { reason_code: review.reasonCode }, createdAt: now });
      const reviewGeneratedBy = await createEvidenceEdge({ tenantId: snapshot.tenant_id, relationshipType: 'GENERATED_BY',
        fromNodeId: reviewNode.nodeId, toNodeId: reviewActor.nodeId, payload: { method: 'DETERMINISTIC_RULE' }, createdAt: now });
      statements.push(
        env.DB.prepare(`INSERT OR IGNORE INTO manual_review_requests (review_request_id, event_id, tenant_id, correlation_id, state_id, state_version,
          reason_code, category, severity, review_priority, status, owner_queue, assigned_to, sla_policy_id, escalation_level, dedupe_key, duplicate_of,
          problem_statement, affected_scope_json, impact, required_decision, suggested_checks_json, reviewer_role, allowed_resolutions_json, due_at, created_at, completed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_TRIAGE', ?, NULL, ?, 0, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`)
          .bind(review.reviewRequestId, snapshot.event_id, snapshot.tenant_id, snapshot.correlation_id, stateId, stateVersion, review.reasonCode,
            review.category, review.severity, review.priority, review.ownerQueue, review.slaPolicyId, review.dedupeKey, review.problemStatement,
            JSON.stringify({ type: 'CLIENT', ids: [snapshot.subject_ref] }), review.impact, review.requiredDecision,
            JSON.stringify(review.suggestedChecks), review.reviewerRole, JSON.stringify(review.allowedResolutions), review.dueAt, now),
        env.DB.prepare(`INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
          SELECT ?, d.owner_id, 'central-review:deterministic', 'review_enqueued', 'manual_review', ?, ?, ?
          FROM agent_runs ar JOIN documents d ON d.id = ar.document_id WHERE ar.id = ?`)
          .bind(`review-enqueued-${jobId}`, review.reviewRequestId, JSON.stringify({ reasonCode: review.reasonCode, priority: review.priority, dueAt: review.dueAt }), now, jobId),
        prepareEvidenceNodeInsert(env.DB, reviewNode),
        prepareEvidenceNodeInsert(env.DB, reviewActor),
        prepareEvidenceEdgeInsert(env.DB, reviewDerivedFrom),
        prepareEvidenceEdgeInsert(env.DB, reviewGeneratedBy),
      );
    }
    await env.DB.batch(statements);
    const telegramReplySent = await maybeSendTelegramResult(job, jobId, snapshot, result, stateId, now);
    return NextResponse.json({ ok: true, duplicate: Boolean(existing), state_id: stateId, state_version: stateVersion, state_hash: suppliedHash, telegram_reply_sent: telegramReplySent });
  } catch (error) { return requestErrorResponse(error); }
}

async function maybeSendTelegramResult(
  job: CompletedJob,
  jobId: string,
  snapshot: StateSnapshot,
  result: Record<string, unknown>,
  stateId: string,
  now: number,
) {
  if (job.source !== 'telegram' || env.TELEGRAM_SEND_RESULTS_ENABLED !== 'true' || !env.TELEGRAM_BOT_TOKEN) return false;
  if (!/^-?[0-9]{1,20}$/.test(job.owner_id)) return false;

  const auditId = `telegram-result-${jobId}`;
  const previous = await env.DB.prepare('SELECT action FROM audit_log WHERE id = ?').bind(auditId).first<{ action: string }>();
  if (previous?.action === 'telegram_reply_sent') return true;
  if (previous) {
    await env.DB.prepare(`UPDATE audit_log SET action = 'telegram_reply_pending', details_json = ?, created_at = ? WHERE id = ?`)
      .bind(JSON.stringify({ stateId, retry: true }), now, auditId).run();
  } else {
    await env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
      VALUES (?, ?, 'bridge:telegram-reply', 'telegram_reply_pending', 'state_snapshot', ?, ?, ?)`)
      .bind(auditId, job.owner_id, stateId, JSON.stringify({ stateId }), now).run();
  }

  try {
    await sendTelegramResult(Number(job.owner_id), buildTelegramResultText(snapshot, result, stateId));
    await env.DB.prepare(`UPDATE audit_log SET action = 'telegram_reply_sent', details_json = ? WHERE id = ?`)
      .bind(JSON.stringify({ stateId, sentAt: Date.now() }), auditId).run();
    return true;
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : 'telegram_result_failed';
    await env.DB.prepare(`UPDATE audit_log SET action = 'telegram_reply_failed', details_json = ? WHERE id = ?`)
      .bind(JSON.stringify({ stateId, errorCode }), auditId).run();
    return false;
  }
}

function buildTelegramResultText(snapshot: StateSnapshot, result: Record<string, unknown>, stateId: string) {
  const assessment = result.executive_assessment && typeof result.executive_assessment === 'object'
    ? result.executive_assessment as Record<string, unknown>
    : {};
  const summary = boundedString(assessment.summary, 1500) || boundedString(assessment.executive_summary, 1500);
  const statusLabel = snapshot.overall_status === 'READY' ? 'Pronto para análise' : 'Revisão humana necessária';
  const lines = [
    'Diretor 360 concluiu o processamento.',
    `Status: ${statusLabel}`,
    `Achados: ${snapshot.findings.length}`,
    `Ações recomendadas: ${snapshot.recommended_actions.length}`,
    `Lacunas de dados: ${snapshot.data_gaps.length}`,
  ];
  if (summary) lines.push('', summary);
  lines.push('', `Protocolo: ${stateId}`);
  return lines.join('\n').slice(0, 3900);
}

async function sendTelegramResult(chatId: number, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`telegram_send_${response.status}`);
}

async function buildReviewRequest(snapshot: StateSnapshot, stateId: string, stateVersion: number, now: number) {
  const input = snapshot.manual_review && typeof snapshot.manual_review === 'object' ? snapshot.manual_review as Record<string, unknown> : {};
  const reasonCode = boundedString(input.reason_code, 64, /^[A-Z0-9_]+$/) || 'DOMAIN_REVIEW_REQUIRED';
  const category = reviewCategory(reasonCode);
  const high = ['NORMATIVE_CONFLICT', 'COMPLIANCE_HOLD', 'IDENTITY_UNCERTAIN'].includes(category);
  const severity = high ? 'HIGH' : 'MEDIUM'; const priority = high ? 'P1' : 'P2'; const duration = high ? 4 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const requestedQueue = boundedString(input.owner_queue, 80, /^[A-Z0-9_]+$/);
  const allowedQueues = ['REVISAO_GESTOR_AUTORIZADO', 'REVISAO_COMPLIANCE', 'REVISAO_CADASTRO', 'REVISAO_COMERCIAL'];
  const ownerQueue = allowedQueues.includes(requestedQueue) ? requestedQueue : category === 'NORMATIVE_CONFLICT' || category === 'COMPLIANCE_HOLD' || category === 'IDENTITY_UNCERTAIN'
    ? 'REVISAO_COMPLIANCE' : 'REVISAO_GESTOR_AUTORIZADO';
  const reviewerRole = ownerQueue === 'REVISAO_COMPLIANCE' ? 'GESTOR_COMPLIANCE' : 'GESTOR_AUTORIZADO';
  const requiredDecision = boundedString(input.required_decision, 1000) || 'Confirmar, corrigir, rejeitar ou solicitar dados adicionais para o item.';
  const problemStatement = boundedString(input.problem_statement, 1000) || `O Estado 360 ${stateId} requer revisão humana pelo motivo ${reasonCode}.`;
  const impact = boundedString(input.impact, 1000) || 'O item dependente não pode avançar para READY enquanto a revisão estiver aberta.';
  const dedupeKey = await hashCanonical({ tenant_id: snapshot.tenant_id, state_id: stateId, state_version: stateVersion, reason_code: reasonCode });
  return { reviewRequestId: uuidFromSha256(dedupeKey), reasonCode, category, severity, priority, ownerQueue,
    slaPolicyId: high ? 'manual-review.high.v1' : 'manual-review.medium.v1', dedupeKey, problemStatement, impact, requiredDecision,
    suggestedChecks: ['Revalidar identidade, vigência e autoridade das evidências.', 'Registrar a justificativa humana estruturada.'], reviewerRole,
    allowedResolutions: ['RESOLVED_CONFIRMED', 'RESOLVED_CORRECTED', 'RESOLVED_DISMISSED', 'MORE_DATA_REQUIRED'], dueAt: now + duration };
}

function reviewCategory(reasonCode: string) {
  if (reasonCode === 'DIVERGENCIA_NORMATIVA') return 'NORMATIVE_CONFLICT';
  if (reasonCode === 'DIVERGENCIA_DE_DADOS' || reasonCode === 'DIVERGENCIA_INTERNA') return 'DATA_CONFLICT';
  if (reasonCode === 'CAPABILITY_GAP') return 'INSUFFICIENT_EVIDENCE';
  if (reasonCode === 'ORPHAN_EVIDENCE') return 'ORPHAN_EVIDENCE';
  if (reasonCode === 'UNVERIFIABLE_EVIDENCE') return 'UNVERIFIABLE_EVIDENCE';
  if (reasonCode.includes('IDENTIDADE')) return 'IDENTITY_UNCERTAIN';
  if (reasonCode.includes('GATE')) return 'GATE_FAILED';
  if (reasonCode.includes('BUDGET')) return 'BUDGET_EXCEEDED';
  return 'AMBIGUOUS_INPUT';
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
