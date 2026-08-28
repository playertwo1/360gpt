import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { executeShadowPair } from '../engines/orchestration/shadow-envelope.mjs';
import { aggregateShadowTelemetry } from '../engines/shadow/shadow-telemetry.mjs';

const casesDir = new URL('../test-data/evals/cases/', import.meta.url);
const files = readdirSync(casesDir).filter((file) => file.endsWith('.json')).sort();
assert.equal(files.length, 20);
const comparisons = files.map((file) => {
  const source = JSON.parse(readFileSync(new URL(file, casesDir), 'utf8'));
  const request = { purpose: 'visao 360 sintetica', text: `${source.name} ${source.segmento} metas performance financeiro relacionamento`, cnpj: source.cnpj };
  const run = executeShadowPair({
    request,
    baseline: (input) => ({ domains: input.routing.selected_domains.map((item) => item.domain) }),
    candidate: (input) => ({ domains: input.routing.selected_domains.map((item) => item.domain) }),
    releaseId: 'shadow-e1-synthetic'
  });
  assert.equal(run.status, 'COMPLETED');
  assert.equal(run.comparison.state_mutation_allowed, false);
  assert.equal(run.comparison.external_effects_allowed, false);
  return run.comparison;
});
const telemetry = aggregateShadowTelemetry(comparisons);
assert.equal(telemetry.total, 20);
assert.equal(telemetry.completed, 20);
assert.equal(telemetry.equivalenceRate, 1);
assert.equal(telemetry.stateMutationCount, 0);
assert.equal(telemetry.externalEffectCount, 0);
console.log('shadow-synthetic-suite: 20 casos, cobertura completa e efeitos zero validados');
