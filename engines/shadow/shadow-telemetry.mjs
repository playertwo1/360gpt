export function aggregateShadowTelemetry(comparisons = []) {
  const total = comparisons.length;
  const completed = comparisons.filter((item) => item?.mode === 'SHADOW');
  const equivalent = completed.filter((item) => item.equivalent === true).length;
  const errors = comparisons.filter((item) => item?.status === 'ERROR').length;
  return {
    mode: 'SHADOW',
    total,
    completed: completed.length,
    errors,
    equivalenceRate: completed.length ? equivalent / completed.length : null,
    divergenceRate: completed.length ? (completed.length - equivalent) / completed.length : null,
    stateMutationCount: comparisons.filter((item) => item?.state_mutation_allowed === true).length,
    externalEffectCount: comparisons.filter((item) => item?.external_effects_allowed === true).length
  };
}
