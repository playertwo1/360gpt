const RELEASE_PATTERN = /^[a-z0-9][a-z0-9._-]{0,79}$/;

export function sanitizeShadowObservation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_SHADOW_OBSERVATION');
  const allowed = new Set(['schema_version', 'release_id', 'finished_at', 'duration_ms', 'telemetry', 'pause_required', 'data_scope']);
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error('UNEXPECTED_SHADOW_FIELD');
  if (value.schema_version !== '1.0.0' || value.data_scope !== 'SYNTHETIC_ONLY') throw new Error('INVALID_SHADOW_SCOPE');
  if (typeof value.release_id !== 'string' || !RELEASE_PATTERN.test(value.release_id)) throw new Error('INVALID_SHADOW_RELEASE');
  const observedAt = Date.parse(value.finished_at);
  if (!Number.isFinite(observedAt)) throw new Error('INVALID_SHADOW_TIME');
  const telemetry = value.telemetry;
  if (!telemetry || typeof telemetry !== 'object' || Array.isArray(telemetry)) throw new Error('INVALID_SHADOW_TELEMETRY');
  const integer = (entry, min = 0, max = 1_000_000) => Number.isSafeInteger(entry) && entry >= min && entry <= max ? entry : null;
  const total = integer(telemetry.total, 1, 10_000);
  const completed = integer(telemetry.completed, 0, 10_000);
  const errors = integer(telemetry.errors, 0, 10_000);
  const durationMs = integer(value.duration_ms, 0, 3_600_000);
  const rate = (entry) => typeof entry === 'number' && Number.isFinite(entry) && entry >= 0 && entry <= 1 ? Math.round(entry * 10_000) : null;
  const equivalenceRateBps = rate(telemetry.equivalenceRate);
  const divergenceRateBps = rate(telemetry.divergenceRate);
  const stateMutationCount = integer(telemetry.stateMutationCount, 0, 10_000);
  const externalEffectCount = integer(telemetry.externalEffectCount, 0, 10_000);
  if ([total, completed, errors, durationMs, equivalenceRateBps, divergenceRateBps, stateMutationCount, externalEffectCount].some((item) => item === null)) throw new Error('INVALID_SHADOW_METRIC');
  if (completed > total || errors > total || equivalenceRateBps + divergenceRateBps !== 10_000 || typeof value.pause_required !== 'boolean') throw new Error('INCONSISTENT_SHADOW_METRIC');
  return { releaseId: value.release_id, observedAt, durationMs, totalCases: total, completedCases: completed, errors, equivalenceRateBps, divergenceRateBps, stateMutationCount, externalEffectCount, pauseRequired: value.pause_required, dataScope: value.data_scope };
}

export function shadowUploadPayload(record) {
  return {
    schema_version: record.schema_version,
    release_id: record.release_id,
    finished_at: record.finished_at,
    duration_ms: record.duration_ms,
    telemetry: record.telemetry,
    pause_required: record.pause_required,
    data_scope: record.data_scope,
  };
}
