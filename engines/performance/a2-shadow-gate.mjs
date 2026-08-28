const REQUIRED_FIELDS = ['meta', 'realizado', 'periodo'];

export function authorizeA2ShadowRun({ runtimeStatus, dataScope, fields, externalEffectsAllowed = false, stateMutationsAllowed = false }) {
  if (runtimeStatus !== 'SHADOW') return { allowed: false, reason: 'CAPABILITY_INACTIVE' };
  if (dataScope !== 'SYNTHETIC_ONLY') return { allowed: false, reason: 'UNAUTHORIZED_SOURCE' };
  if (externalEffectsAllowed || stateMutationsAllowed) return { allowed: false, reason: 'UNAUTHORIZED_EFFECT' };
  if (!Array.isArray(fields) || fields.some((field) => !REQUIRED_FIELDS.includes(field)) || REQUIRED_FIELDS.some((field) => !fields.includes(field))) {
    return { allowed: false, reason: 'UNAUTHORIZED_FIELD' };
  }
  return { allowed: true, reason: 'A2_SHADOW_ALLOWED' };
}

export const A2_REQUIRED_FIELDS = REQUIRED_FIELDS;
