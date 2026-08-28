import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { executeShadowPair } from '../engines/orchestration/shadow-envelope.mjs';
import { aggregateShadowTelemetry } from '../engines/shadow/shadow-telemetry.mjs';

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
console.log(JSON.stringify({ output: output.pathname, ...record }));
if (pauseRequired) process.exitCode = 2;
