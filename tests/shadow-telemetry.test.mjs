import assert from 'node:assert/strict';
import { aggregateShadowTelemetry } from '../engines/shadow/shadow-telemetry.mjs';

const samples = Array.from({ length: 20 }, (_, index) => ({
  mode: 'SHADOW',
  equivalent: index < 18,
  state_mutation_allowed: false,
  external_effects_allowed: false
}));
samples.push({ status: 'ERROR' });
const telemetry = aggregateShadowTelemetry(samples);
assert.equal(telemetry.total, 21);
assert.equal(telemetry.completed, 20);
assert.equal(telemetry.errors, 1);
assert.equal(telemetry.equivalenceRate, 0.9);
assert.equal(telemetry.divergenceRate, 0.1);
assert.equal(telemetry.stateMutationCount, 0);
assert.equal(telemetry.externalEffectCount, 0);
assert.equal(aggregateShadowTelemetry().equivalenceRate, null);
console.log('shadow-telemetry: cobertura, equivalência, divergência e efeitos zero validados');
