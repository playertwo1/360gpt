const SENSITIVE_KEYS = new Set(['cpf', 'cnpj', 'phone', 'telefone', 'email', 'address', 'endereco']);

export function sanitizeForShadow(value) {
  if (Array.isArray(value)) return value.map(sanitizeForShadow);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [
    key,
    SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : sanitizeForShadow(child)
  ]));
}

export function compareShadow({ input, baseline, candidate, releaseId, observedAt = new Date().toISOString() }) {
  if (!releaseId) throw new Error('SHADOW_RELEASE_ID_REQUIRED');
  const baselineJson = JSON.stringify(baseline);
  const candidateJson = JSON.stringify(candidate);
  return {
    mode: 'SHADOW',
    release_id: releaseId,
    observed_at: observedAt,
    input: sanitizeForShadow(input),
    baseline_hash: hash(baselineJson),
    candidate_hash: hash(candidateJson),
    equivalent: baselineJson === candidateJson,
    divergences: baselineJson === candidateJson ? [] : ['OUTPUT_DIFFERENCE'],
    state_mutation_allowed: false,
    external_effects_allowed: false
  };
}

function hash(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return `fnv1a:${(h >>> 0).toString(16).padStart(8, '0')}`;
}
