/** Deterministic GDAD calculations. No inference or external effects. */
export function calculateGdadLine(line) {
  const budget = Number(line?.budget);
  const actual = Number(line?.actual);
  if (!Number.isFinite(budget) || !Number.isFinite(actual) || budget < 0 || actual < 0) {
    return { status: 'INVALID', reasonCode: 'INVALID_FINANCIAL_VALUE' };
  }
  const variance = actual - budget;
  const attainment = budget === 0 ? null : (actual / budget) * 100;
  return {
    status: 'CALCULATED',
    lineId: line.line_id,
    budget,
    actual,
    variance,
    attainmentPercent: attainment,
    attributionStatus: line.attribution_status ?? 'UNKNOWN',
    sourceRef: line.source_ref
  };
}

export function summarizeGdad(lines = []) {
  const calculated = lines.map(calculateGdadLine);
  const valid = calculated.filter((line) => line.status === 'CALCULATED');
  const totals = valid.reduce((acc, line) => ({
    budget: acc.budget + line.budget,
    actual: acc.actual + line.actual,
    variance: acc.variance + line.variance
  }), { budget: 0, actual: 0, variance: 0 });
  return {
    status: calculated.some((line) => line.status === 'INVALID') ? 'PARTIAL' : 'COMPLETE',
    lines: calculated,
    totals,
    attainmentPercent: totals.budget === 0 ? null : (totals.actual / totals.budget) * 100,
    attributionStatus: valid.every((line) => line.attributionStatus === 'CONFIRMED') ? 'CONFIRMED' : 'UNKNOWN'
  };
}
