import assert from 'node:assert/strict';
import { authorizeA2ShadowRun } from '../engines/performance/a2-shadow-gate.mjs';

const baseline = { runtimeStatus: 'SHADOW', dataScope: 'SYNTHETIC_ONLY', fields: ['meta', 'realizado', 'periodo'] };
assert.deepEqual(authorizeA2ShadowRun(baseline), { allowed: true, reason: 'A2_SHADOW_ALLOWED' });
assert.deepEqual(authorizeA2ShadowRun({ ...baseline, runtimeStatus: 'INACTIVE' }), { allowed: false, reason: 'CAPABILITY_INACTIVE' });
assert.deepEqual(authorizeA2ShadowRun({ ...baseline, dataScope: 'REAL_POBJ_SPREADSHEET' }), { allowed: false, reason: 'UNAUTHORIZED_SOURCE' });
assert.deepEqual(authorizeA2ShadowRun({ ...baseline, fields: ['meta', 'realizado', 'periodo', 'cpf'] }), { allowed: false, reason: 'UNAUTHORIZED_FIELD' });
assert.deepEqual(authorizeA2ShadowRun({ ...baseline, externalEffectsAllowed: true }), { allowed: false, reason: 'UNAUTHORIZED_EFFECT' });
console.log('performance-a2-rollback: kill switch e bloqueios de fonte/campo/efeito aprovados');
