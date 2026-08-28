import assert from 'node:assert/strict';
import { evaluateGapScenario } from '../engines/performance/gap-scenarios-engine.mjs';

assert.equal(evaluateGapScenario({ attainmentPercent: 65 }).decision_state, 'BELOW_FLOOR_NEAR');
assert.equal(evaluateGapScenario({ attainmentPercent: 40 }).decision_state, 'BELOW_FLOOR_FAR');
assert.equal(evaluateGapScenario({ attainmentPercent: 95 }).decision_state, 'NEAR_100');
assert.equal(evaluateGapScenario({ attainmentPercent: 120 }).decision_state, 'ABOVE_100_BELOW_CAP');
const capped = evaluateGapScenario({ attainmentPercent: 155 });
assert.equal(capped.decision_state, 'AT_OR_ABOVE_CAP');
assert.equal(capped.next_milestone_percent, null);
assert.equal(capped.state_mutation_count, 0);
assert.deepEqual(capped.external_effects, []);
assert.equal(evaluateGapScenario({ attainmentPercent: Number.NaN }).status, 'NOT_DETERMINABLE');
console.log('performance-gap-scenarios: estados, gaps e limites determinísticos aprovados');
