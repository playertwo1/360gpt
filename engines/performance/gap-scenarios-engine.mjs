function round(value) { return Number(value.toFixed(3)); }

export function evaluateGapScenario({ attainmentPercent, minimumPercent = 70, capPercent = 150, points = 0 }) {
  if (![attainmentPercent, minimumPercent, capPercent, points].every(Number.isFinite) || minimumPercent < 0 || capPercent < 100 || minimumPercent > 100) {
    return { status: 'NOT_DETERMINABLE', reason: 'INVALID_OR_INCOMPLETE_INPUT' };
  }
  const nextMilestone = attainmentPercent < minimumPercent ? minimumPercent : attainmentPercent < 100 ? 100 : attainmentPercent < capPercent ? capPercent : null;
  const decisionState = attainmentPercent < minimumPercent
    ? (minimumPercent - attainmentPercent <= 10 ? 'BELOW_FLOOR_NEAR' : 'BELOW_FLOOR_FAR')
    : attainmentPercent < 95 ? 'SCORING_RANGE'
    : attainmentPercent < 100 ? 'NEAR_100'
    : attainmentPercent < capPercent ? 'ABOVE_100_BELOW_CAP'
    : 'AT_OR_ABOVE_CAP';
  return {
    status: 'CALCULATED', decision_state: decisionState, attainment_percent: round(attainmentPercent), points,
    next_milestone_percent: nextMilestone,
    effort_to_next_milestone_percent: nextMilestone === null ? 0 : round(Math.max(0, nextMilestone - attainmentPercent)),
    gaps: { to_minimum_percent: round(Math.max(0, minimumPercent - attainmentPercent)), to_target_percent: round(Math.max(0, 100 - attainmentPercent)), to_cap_percent: round(Math.max(0, capPercent - attainmentPercent)) },
    urgency: 'DATE_NOT_DETERMINABLE', external_effects: [], state_mutation_count: 0,
  };
}
