import assert from 'node:assert/strict';
import { compareShadow, sanitizeForShadow } from '../engines/shadow/shadow-runner.mjs';

const input = { cnpj: '00.000.000/0001-00', purpose: 'performance', nested: { telefone: '5511999999999' } };
const clean = sanitizeForShadow(input);
assert.equal(clean.cnpj, '[REDACTED]');
assert.equal(clean.nested.telefone, '[REDACTED]');
const equal = compareShadow({ input, baseline: { score: 10 }, candidate: { score: 10 }, releaseId: 'shadow-c2b-1' });
assert.equal(equal.mode, 'SHADOW');
assert.equal(equal.equivalent, true);
assert.equal(equal.state_mutation_allowed, false);
assert.equal(equal.external_effects_allowed, false);
const different = compareShadow({ input, baseline: { score: 10 }, candidate: { score: 11 }, releaseId: 'shadow-c2b-1' });
assert.deepEqual(different.divergences, ['OUTPUT_DIFFERENCE']);
assert.throws(() => compareShadow({ input, baseline: {}, candidate: {} }), /SHADOW_RELEASE_ID_REQUIRED/);
console.log('shadow-runner: sanitização, comparação e bloqueio de efeitos validados');
