import assert from 'node:assert/strict';
import { summarizeObservations } from '../engines/shadow/observation-summary.mjs';

const record = (overrides = {}) => ({ schema_version: '1.0.0', telemetry: { total: 20, completed: 20, errors: 0, stateMutationCount: 0, externalEffectCount: 0, divergenceRate: 0, ...overrides } });
const healthy = summarizeObservations([record(), record()]);
assert.equal(healthy.observations, 2);
assert.equal(healthy.completionRate, 1);
assert.equal(healthy.pauseRequired, false);
assert.equal(summarizeObservations([record({ externalEffectCount: 1 })]).pauseRequired, true);
assert.equal(summarizeObservations([record({ completed: 19 })]).pauseRequired, true);
assert.equal(summarizeObservations([record({ divergenceRate: 0.15 })]).pauseRequired, true);
console.log('observation-summary: consolidação e limites de pausa validados');
