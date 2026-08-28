import { createHash, randomUUID } from 'node:crypto';

process.loadEnvFile('.env.n8n');

const baseUrl = 'https://visao-360-diretor.fael360092.chatgpt.site';
const secret = process.env.BRIDGE_SHARED_SECRET;
if (!/^[0-9a-f]{64}$/.test(secret ?? '')) throw new Error('BRIDGE_SHARED_SECRET ausente ou inválido em .env.n8n');

const headers = { authorization: `Bearer ${secret}`, 'content-type': 'application/json' };
const testId = `h3-cycle-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
const enqueueResponse = await fetch(`${baseUrl}/api/bridge/synthetic-enqueue`, {
  method: 'POST', headers, body: JSON.stringify({ test_id: testId }),
});
if (enqueueResponse.status !== 201) throw new Error(`enqueue_http_${enqueueResponse.status}`);
const enqueued = await enqueueResponse.json();
const claimResponse = await fetch(`${baseUrl}/api/bridge/claim`, {
  method: 'POST', headers, body: JSON.stringify({ worker_id: 'hosted-cycle-synthetic-test' }),
});
if (!claimResponse.ok) throw new Error(`claim_http_${claimResponse.status}`);
const claim = await claimResponse.json();
if (claim.empty) throw new Error('synthetic_queue_empty');
if (!String(claim.source_event_id ?? '').startsWith('bridge_synthetic_test-h3-')) {
  throw new Error(`non_synthetic_job_refused:${claim.job_id}`);
}
if (claim.job_id !== enqueued.job_id) throw new Error(`unexpected_synthetic_job:${claim.job_id}`);

const snapshot = {
  schema_version: '1.0.0', tenant_id: 'tenant-demo', subject_ref: 'bridge-cycle-synthetic',
  event_id: randomUUID(), correlation_id: randomUUID(), input_hash: `sha256:${'d'.repeat(64)}`,
  generated_at: new Date().toISOString(), overall_status: 'READY', domain_status: [], findings: [],
  data_gaps: [], gates: [], recommended_actions: [], manual_review: null,
};
const canonicalize = (value) => Array.isArray(value)
  ? value.map(canonicalize)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonicalize(entry)]))
    : value;
const stateHash = `sha256:${createHash('sha256').update(JSON.stringify(canonicalize(snapshot))).digest('hex')}`;
const body = {
  job_id: claim.job_id, lease_token: claim.lease_token,
  result: {
    persisted_state: { state_id: `state-${snapshot.event_id}`, state_version: 1, state_hash: stateHash, snapshot },
    executive_assessment: { summary: 'Estado 360 sintético publicado pelo teste autenticado da ponte.' },
  },
};
const complete = async () => {
  const response = await fetch(`${baseUrl}/api/bridge/complete`, { method: 'POST', headers, body: JSON.stringify(body) });
  const payload = await response.json();
  if (!response.ok) throw new Error(`complete_http_${response.status}:${payload.error ?? 'unknown'}`);
  return payload;
};
const first = await complete();
const duplicate = await complete();
if (first.duplicate !== false || duplicate.duplicate !== true) throw new Error('completion_idempotency_failed');

console.log(JSON.stringify({
  ok: true, job_id: claim.job_id, source_event_id: claim.source_event_id,
  state_id: first.state_id, state_version: first.state_version,
  completed: true, duplicate_completion: duplicate.duplicate,
  external_effects_allowed: claim.security?.external_effects_allowed,
}, null, 2));
