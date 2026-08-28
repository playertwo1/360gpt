import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const execution = spawnSync(process.execPath, ['scripts/run-performance-canary-wave1.mjs', '--wave=2'], { encoding: 'utf8' });
assert.equal(execution.status, 0, execution.stderr || execution.stdout);
const report = JSON.parse(readFileSync('test-data/canary/performance-wave-2-latest.json', 'utf8'));
assert.equal(report.wave, 2);
assert.equal(report.total_cases, 5);
assert.equal(report.data_scope, 'SYNTHETIC_ONLY');
assert.equal(report.state_mutation_count, 0);
assert.equal(report.external_effect_count, 0);
assert.equal(report.status, 'PENDING_RAFAEL_REVIEW');
assert.ok(report.results.every((item) => item.rafael_decision === null && item.review_status === 'PENDING_RAFAEL_REVIEW'));
console.log('performance-canary-wave2: 5 casos sintéticos, zero efeitos e revisão humana pendente');
