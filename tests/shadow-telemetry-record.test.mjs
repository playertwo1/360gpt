import assert from 'node:assert/strict';
import { sanitizeShadowObservation, shadowUploadPayload } from '../engines/shadow/telemetry-record.mjs';

const source = { schema_version: '1.0.0', release_id: 'shadow-e1-synthetic', started_at: '2026-08-27T00:00:00Z', finished_at: '2026-08-27T00:00:01Z', duration_ms: 1000, telemetry: { total: 20, completed: 20, errors: 0, equivalenceRate: 1, divergenceRate: 0, stateMutationCount: 0, externalEffectCount: 0 }, pause_required: false, data_scope: 'SYNTHETIC_ONLY', external_effects_allowed: false };
const payload = shadowUploadPayload(source);
assert.deepEqual(Object.keys(payload).sort(), ['data_scope', 'duration_ms', 'finished_at', 'pause_required', 'release_id', 'schema_version', 'telemetry']);
const sanitized = sanitizeShadowObservation(payload);
assert.equal(sanitized.equivalenceRateBps, 10_000);
assert.equal(sanitized.dataScope, 'SYNTHETIC_ONLY');
assert.throws(() => sanitizeShadowObservation({ ...payload, cnpj: '00000000000000' }), /UNEXPECTED_SHADOW_FIELD/);
assert.throws(() => sanitizeShadowObservation({ ...payload, data_scope: 'REAL_DATA' }), /INVALID_SHADOW_SCOPE/);
assert.throws(() => sanitizeShadowObservation({ ...payload, telemetry: { ...payload.telemetry, stateMutationCount: -1 } }), /INVALID_SHADOW_METRIC/);
console.log('shadow-telemetry-record: saneamento, escopo sintético e métricas validados');
