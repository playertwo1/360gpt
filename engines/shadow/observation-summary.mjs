export function summarizeObservations(records = []) {
  const valid = records.filter((item) => item?.schema_version === '1.0.0' && item?.telemetry);
  const totals = valid.reduce((acc, item) => ({
    cases: acc.cases + item.telemetry.total,
    completed: acc.completed + item.telemetry.completed,
    errors: acc.errors + item.telemetry.errors,
    mutations: acc.mutations + item.telemetry.stateMutationCount,
    externalEffects: acc.externalEffects + item.telemetry.externalEffectCount,
    divergences: acc.divergences + Math.round(item.telemetry.divergenceRate * item.telemetry.completed)
  }), { cases: 0, completed: 0, errors: 0, mutations: 0, externalEffects: 0, divergences: 0 });
  const completionRate = totals.cases ? totals.completed / totals.cases : null;
  const divergenceRate = totals.completed ? totals.divergences / totals.completed : null;
  const pauseRequired = totals.mutations > 0 || totals.externalEffects > 0 || (completionRate !== null && completionRate < 0.99) || (divergenceRate !== null && divergenceRate > 0.1);
  return { observations: valid.length, ...totals, completionRate, divergenceRate, pauseRequired };
}
