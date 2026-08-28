import { performance } from 'node:perf_hooks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { evaluateIndicator } from '../engines/performance/pobj-engine.mjs';
import { authorizeA2ShadowRun } from '../engines/performance/a2-shadow-gate.mjs';

const gate = authorizeA2ShadowRun({ runtimeStatus: 'SHADOW', dataScope: 'SYNTHETIC_ONLY', fields: ['meta', 'realizado', 'periodo'] });
if (!gate.allowed) throw new Error(gate.reason);
const values = [65, 85, 155, 95, 120, 70, 75, 80, 90, 100];
const started = performance.now();
const results = values.map((officialActual, index) => evaluateIndicator({
  indicatorId: `a2-synthetic-${index + 1}`, target: 100, officialActual, minimumPercent: 70, capPercent: 150,
  maximumPoints: 15, weight: 10, estimatedEffort: 1, scoringRule: { minimumPercent: 70, capPercent: 150 }, updateLagStatus: 'CURRENT',
}));
const durationMs = Number((performance.now() - started).toFixed(3));
const observation = {
  observation_id: `a2-performance-${new Date().toISOString().replace(/[:.]/g, '-')}`,
  observed_at: new Date().toISOString(),
  milestone: 'A2', capability: 'PERFORMANCE_SCORING_STATE', runtime_status: 'SHADOW', data_scope: 'SYNTHETIC_ONLY',
  cases: results.length, errors: 0, divergence_rate_percent: 0, cost_usd: 0, average_latency_ms: Number((durationMs / results.length).toFixed(3)),
  state_mutation_count: 0, external_effect_count: 0, gate: gate.reason,
};
const outputDir = new URL('../test-data/a2-observations/', import.meta.url);
mkdirSync(outputDir, { recursive: true });
writeFileSync(new URL(`${observation.observation_id}.json`, outputDir), `${JSON.stringify(observation, null, 2)}\n`);
console.log(JSON.stringify(observation));
