export function runWithShadowFallback({ baseline, candidate, input }) {
  try {
    const candidateOutput = candidate(input);
    return { selected: 'CANDIDATE_SHADOW', output: candidateOutput, state_mutation_allowed: false, external_effects_allowed: false };
  } catch (error) {
    return { selected: 'BASELINE', output: baseline(input), fallback_reason: 'CANDIDATE_FAILURE', error_type: error?.name ?? 'Error', state_mutation_allowed: false, external_effects_allowed: false };
  }
}
