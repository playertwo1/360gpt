import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const execution = spawnSync(process.execPath, ['scripts/run-performance-canary-wave1.mjs', '--wave=3'], { encoding: 'utf8' });
assert.equal(execution.status, 0, execution.stderr || execution.stdout);
const report = JSON.parse(readFileSync('test-data/canary/performance-wave-3-latest.json', 'utf8'));
assert.equal(report.wave, 3);
assert.equal(report.total_cases, 10);
assert.equal(report.data_scope, 'SYNTHETIC_ONLY');
assert.equal(report.state_mutation_count, 0);
assert.equal(report.external_effect_count, 0);
assert.equal(report.model_calls, 0);
assert.equal(report.estimated_cost_usd, 0);
assert.equal(report.human_override_rate_percent, null);
assert.equal(report.status, 'PENDING_RAFAEL_REVIEW');
console.log('performance-canary-wave3: 10 casos sintéticos, custo zero, zero efeitos e revisão humana pendente');
