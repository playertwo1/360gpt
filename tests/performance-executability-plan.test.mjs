import assert from 'node:assert/strict';
import { buildExecutablePlan } from '../engines/performance/executability-plan-engine.mjs';
const plan = buildExecutablePlan([{ id: 'B', marginalPoints: 4, effort: 1 }, { id: 'A', marginalPoints: 4, effort: 2 }, { id: 'C', marginalPoints: 10, effort: 5 }, { id: 'X', marginalPoints: 99, effort: 1, executable: false }]);
assert.equal(plan.status, 'CALCULATED');
assert.deepEqual(plan.actions.map((item) => item.id), ['C', 'B', 'A']);
assert.ok(plan.actions.every((item) => item.requires_account_selection && item.external_effects.length === 0));
assert.equal(plan.state_mutation_count, 0);
assert.equal(plan.external_effect_count, 0);
console.log('performance-executability-plan: ranking consultivo e sem efeitos aprovado');
