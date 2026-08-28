import assert from 'node:assert/strict';
import { executeShadowPair } from '../engines/orchestration/shadow-envelope.mjs';

const result = executeShadowPair({
  request: { purpose: 'meta POBJ', text: 'avaliar pontuação', cnpj: '00.000.000/0001-00' },
  baseline: (input) => ({ domain: input.routing.selected_domains[0].domain, score: 10 }),
  candidate: (input) => ({ domain: input.routing.selected_domains[0].domain, score: 11 }),
  releaseId: 'release-shadow-d2'
});
assert.equal(result.status, 'COMPLETED');
assert.equal(result.comparison.mode, 'SHADOW');
assert.equal(result.comparison.state_mutation_allowed, false);
assert.equal(result.comparison.input.cnpj, '[REDACTED]');
assert.deepEqual(result.comparison.divergences, ['OUTPUT_DIFFERENCE']);
assert.equal(executeShadowPair({ request: { text: 'sem finalidade' }, baseline: () => ({}), candidate: () => ({}), releaseId: 'r' }).status, 'MANUAL_REVIEW_REQUIRED');
console.log('shadow-envelope: execução paralela, roteamento e isolamento validados');
