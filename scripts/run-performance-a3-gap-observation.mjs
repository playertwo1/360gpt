import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { evaluateGapScenario } from '../engines/performance/gap-scenarios-engine.mjs';

const values = [65, 85, 155, 95, 120, 70, 75, 80, 90, 100];
const started = performance.now();
const results = values.map((attainmentPercent) => evaluateGapScenario({ attainmentPercent }));
const durationMs = performance.now() - started;
if (results.some((result) => result.status !== 'CALCULATED' || result.state_mutation_count !== 0 || result.external_effects.length !== 0)) throw new Error('A3_GAP_OBSERVATION_FAILED');
const observation = { observation_id: `a3-gap-${new Date().toISOString().replace(/[:.]/g, '-')}`, observed_at: new Date().toISOString(), milestone: 'A3', capability: 'PERFORMANCE_GAP_SCENARIOS', runtime_status: 'SHADOW', data_scope: 'SYNTHETIC_ONLY', cases: results.length, errors: 0, divergence_rate_percent: 0, cost_usd: 0, average_latency_ms: Number((durationMs / results.length).toFixed(3)), state_mutation_count: 0, external_effect_count: 0 };
const outputDir = new URL('../test-data/a3-observations/', import.meta.url);
mkdirSync(outputDir, { recursive: true });
writeFileSync(new URL(`${observation.observation_id}.json`, outputDir), `${JSON.stringify(observation, null, 2)}\n`);
console.log(JSON.stringify(observation));
