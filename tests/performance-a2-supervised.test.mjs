import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const policy = readFileSync(new URL('../policies/performance-a2-supervised.yaml', import.meta.url), 'utf8');
assert.match(policy, /^status: ACTIVE_SHADOW_ONLY$/m);
assert.match(policy, /^runtime_status: SHADOW$/m);
assert.match(policy, /^data_scope: SYNTHETIC_ONLY$/m);
assert.match(policy, /^  real_source_connected: false$/m);
assert.match(policy, /^allowed_fields: \[meta, realizado, periodo\]$/m);
assert.match(policy, /^external_effects: PROHIBITED$/m);
assert.match(policy, /^state_mutations: PROHIBITED$/m);
assert.match(policy, /^human_review_required: true$/m);
assert.match(policy, /^rollback: DISABLE_CAPABILITY$/m);
console.log('performance-a2-supervised: SHADOW sintético, somente leitura e sem efeitos externos');
