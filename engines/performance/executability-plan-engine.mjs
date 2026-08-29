export function buildExecutablePlan(items, limit = 5) {
  if (!Array.isArray(items) || !Number.isInteger(limit) || limit < 1) return { status: 'NOT_DETERMINABLE', actions: [] };
  const actions = items.filter((item) => item && Number.isFinite(item.marginalPoints) && Number.isFinite(item.effort) && item.effort > 0 && item.executable !== false)
    .map((item) => ({ id: String(item.id), marginal_points: item.marginalPoints, effort: item.effort, efficiency: Number((item.marginalPoints / item.effort).toFixed(3)), requires_account_selection: true, external_effects: [] }))
    .sort((left, right) => right.marginal_points - left.marginal_points || left.effort - right.effort || left.id.localeCompare(right.id)).slice(0, limit);
  return { status: 'CALCULATED', actions, state_mutation_count: 0, external_effect_count: 0, decision: 'ADVISORY_ONLY' };
}
