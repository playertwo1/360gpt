import assert from 'node:assert/strict';
import { runWithShadowFallback } from '../engines/shadow/shadow-fallback.mjs';

const ok = runWithShadowFallback({ baseline: () => ({ version: 'baseline' }), candidate: () => ({ version: 'candidate' }), input: {} });
assert.equal(ok.selected, 'CANDIDATE_SHADOW');
assert.equal(ok.state_mutation_allowed, false);
assert.equal(ok.external_effects_allowed, false);
const fallback = runWithShadowFallback({ baseline: () => ({ version: 'baseline' }), candidate: () => { throw new TypeError('synthetic failure'); }, input: {} });
assert.equal(fallback.selected, 'BASELINE');
assert.equal(fallback.fallback_reason, 'CANDIDATE_FAILURE');
assert.equal(fallback.error_type, 'TypeError');
assert.equal(fallback.state_mutation_allowed, false);
console.log('shadow-fallback: baseline, rollback e bloqueio de efeitos validados');
