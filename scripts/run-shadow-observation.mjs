import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { executeShadowPair } from '../engines/orchestration/shadow-envelope.mjs';
import { aggregateShadowTelemetry } from '../engines/shadow/shadow-telemetry.mjs';
import { shadowUploadPayload } from '../engines/shadow/telemetry-record.mjs';
import { renderShadowGateReport } from '../engines/shadow/shadow-monitor.mjs';

const localEnv = new URL('../.env.local', import.meta.url);
if (existsSync(localEnv)) process.loadEnvFile(fileURLToPath(localEnv));

const casesDir = new URL('../test-data/evals/cases/', import.meta.url);
const outputDir = new URL('../test-data/shadow/observations/', import.meta.url);
mkdirSync(outputDir, { recursive: true });
const files = readdirSync(casesDir).filter((file) => file.endsWith('.json')).sort();
if (files.length !== 20) throw new Error(`SHADOW_EXPECTED_20_CASES_FOUND_${files.length}`);

const startedAt = new Date();
const comparisons = files.map((file) => {
  const source = JSON.parse(readFileSync(new URL(file, casesDir), 'utf8'));
  const request = { purpose: 'visao 360 sintetica', text: `${source.name} ${source.segmento} metas performance financeiro relacionamento`, cnpj: source.cnpj };
  const run = executeShadowPair({
    request,
    baseline: (input) => ({ domains: input.routing.selected_domains.map((item) => item.domain) }),
    candidate: (input) => ({ domains: input.routing.selected_domains.map((item) => item.domain) }),
    releaseId: 'shadow-e1-synthetic'
  });
  return run.comparison ?? { status: 'ERROR' };
});
const telemetry = aggregateShadowTelemetry(comparisons);
const finishedAt = new Date();
const pauseRequired = telemetry.stateMutationCount > 0 || telemetry.externalEffectCount > 0 || telemetry.divergenceRate > 0.1 || telemetry.completed / telemetry.total < 0.99;
const record = {
  schema_version: '1.0.0', release_id: 'shadow-e1-synthetic',
  started_at: startedAt.toISOString(), finished_at: finishedAt.toISOString(),
  duration_ms: finishedAt.getTime() - startedAt.getTime(), telemetry,
  pause_required: pauseRequired, data_scope: 'SYNTHETIC_ONLY', external_effects_allowed: false
};
const stamp = finishedAt.toISOString().replaceAll(':', '').replaceAll('-', '').replace(/\.\d{3}Z$/, 'Z');
const output = new URL(`shadow-observation-${stamp}.json`, outputDir);
writeFileSync(output, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
const upload = await uploadSanitizedTelemetry(record);
if (upload.monitor?.window_complete || upload.monitor?.pause_required) writeAutomaticReport(upload.monitor);
console.log(JSON.stringify({ output: output.pathname, upload, ...record }));
if (pauseRequired || (upload.attempted && !upload.ok) || upload.monitor?.pause_required) process.exitCode = 2;

async function uploadSanitizedTelemetry(observation) {
  const endpoint = process.env.SHADOW_TELEMETRY_URL?.trim();
  const secret = process.env.SHADOW_TELEMETRY_SECRET?.trim();
  if (!endpoint || !secret) return { attempted: false, reason: 'not_configured' };
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' }, body: JSON.stringify(shadowUploadPayload(observation)), signal: AbortSignal.timeout(15_000) });
    const body = await response.json().catch(() => ({}));
    return { attempted: true, ok: response.ok, status: response.status, inserted: body.inserted === true, monitor: body.monitor };
  } catch {
    return { attempted: true, ok: false, status: 0 };
  }
}

function writeAutomaticReport(monitor) {
  const reportDir = new URL('../test-data/shadow/reports/', import.meta.url);
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(new URL('shadow-gate-latest.md', reportDir), renderShadowGateReport(monitor), 'utf8');
}
