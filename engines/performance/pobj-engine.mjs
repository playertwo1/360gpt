const round = (value, decimals = 4) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const requireFinite = (name, value) => {
  if (!Number.isFinite(value)) throw new TypeError(name + " deve ser numerico e finito");
};

export function attainmentPercent(actual, target) {
  requireFinite("actual", actual);
  requireFinite("target", target);
  if (target <= 0) throw new RangeError("target deve ser maior que zero");
  return round(actual / target * 100);
}

export function thresholdPosition({ attainment, minimumPercent, capPercent }) {
  requireFinite("attainment", attainment);
  requireFinite("capPercent", capPercent);
  if (minimumPercent !== null) requireFinite("minimumPercent", minimumPercent);
  if (capPercent < 100) throw new RangeError("capPercent nao pode ser menor que 100");

  if (attainment >= capPercent) return "AT_OR_ABOVE_CAP";
  if (minimumPercent !== null && attainment < minimumPercent) {
    const nearWindow = Math.max(5, minimumPercent * 0.1);
    return minimumPercent - attainment <= nearWindow ? "NEAR_MINIMUM" : "BELOW_MINIMUM";
  }
  if (attainment < 100) return 100 - attainment <= 5 ? "NEAR_TARGET" : "BETWEEN_MINIMUM_AND_TARGET";
  return "BETWEEN_TARGET_AND_CAP";
}

function pointsFromCurve(attainment, pointCurve, mode) {
  if (!Array.isArray(pointCurve) || pointCurve.length === 0) {
    return { status: "UNDETERMINED", points: null, reason: "OFFICIAL_POINT_CURVE_REQUIRED" };
  }

  const curve = [...pointCurve].sort((a, b) => a.percent - b.percent);
  for (const point of curve) {
    requireFinite("pointCurve.percent", point.percent);
    requireFinite("pointCurve.points", point.points);
  }

  if (mode === "STEP") {
    const reached = curve.filter((point) => attainment >= point.percent).at(-1);
    return {
      status: "CALCULATED_FROM_OFFICIAL_CURVE",
      points: reached ? reached.points : 0,
      reason: "OFFICIAL_STEP_CURVE"
    };
  }

  if (mode !== "LINEAR") throw new RangeError("pointCurveMode deve ser STEP ou LINEAR");
  if (attainment <= curve[0].percent) {
    return { status: "CALCULATED_FROM_OFFICIAL_CURVE", points: curve[0].points, reason: "OFFICIAL_LINEAR_CURVE" };
  }
  const last = curve.at(-1);
  if (attainment >= last.percent) {
    return { status: "CALCULATED_FROM_OFFICIAL_CURVE", points: last.points, reason: "OFFICIAL_LINEAR_CURVE" };
  }
  const upperIndex = curve.findIndex((point) => point.percent >= attainment);
  const lower = curve[upperIndex - 1];
  const upper = curve[upperIndex];
  const ratio = (attainment - lower.percent) / (upper.percent - lower.percent);
  return {
    status: "CALCULATED_FROM_OFFICIAL_CURVE",
    points: round(lower.points + ratio * (upper.points - lower.points)),
    reason: "OFFICIAL_LINEAR_CURVE"
  };
}

export function evaluateIndicator(input) {
  const {
    indicatorId,
    target,
    officialActual,
    pendingActual = 0,
    minimumPercent = null,
    capPercent,
    maximumPoints,
    pointCurve = null,
    pointCurveMode = null,
    updateLagStatus = "UNKNOWN",
    estimatedEffort = null
  } = input;

  requireFinite("officialActual", officialActual);
  requireFinite("pendingActual", pendingActual);
  requireFinite("maximumPoints", maximumPoints);
  if (officialActual < 0 || pendingActual < 0 || maximumPoints < 0) {
    throw new RangeError("producao e pontos nao podem ser negativos");
  }

  const officialAttainment = attainmentPercent(officialActual, target);
  const projectedAttainment = attainmentPercent(officialActual + pendingActual, target);
  const position = thresholdPosition({ attainment: officialAttainment, minimumPercent, capPercent });
  const projectedPosition = thresholdPosition({ attainment: projectedAttainment, minimumPercent, capPercent });

  let officialPoints;
  if (minimumPercent !== null && officialAttainment < minimumPercent) {
    officialPoints = { status: "CONFIRMED_BY_FLOOR_RULE", points: 0, reason: "BELOW_MINIMUM_ZEROES_POINTS" };
  } else if (officialAttainment >= capPercent) {
    officialPoints = { status: "CONFIRMED_BY_CAP_RULE", points: maximumPoints, reason: "AT_OR_ABOVE_CAP" };
  } else {
    officialPoints = pointsFromCurve(officialAttainment, pointCurve, pointCurveMode);
  }

  const gapToMinimum = minimumPercent === null ? null : round(Math.max(0, minimumPercent - officialAttainment));
  const gapToTarget = round(Math.max(0, 100 - officialAttainment));
  const gapToCap = round(Math.max(0, capPercent - officialAttainment));

  let actionClass;
  if (updateLagStatus !== "CURRENT") actionClass = "RECONCILE_BEFORE_PRIORITIZING";
  else if (position === "AT_OR_ABOVE_CAP") actionClass = "DEPRIORITIZE_FOR_POINTS";
  else if (position === "NEAR_MINIMUM") actionClass = "RESCUE_MINIMUM";
  else if (position === "NEAR_TARGET") actionClass = "CLOSE_TARGET";
  else if (position === "BELOW_MINIMUM") actionClass = "CHALLENGE_FEASIBILITY";
  else actionClass = "ADVANCE_WITHIN_SCORING_RANGE";

  const effort = estimatedEffort === null ? null : Number(estimatedEffort);
  if (effort !== null) {
    requireFinite("estimatedEffort", effort);
    if (effort <= 0) throw new RangeError("estimatedEffort deve ser maior que zero");
  }

  return {
    indicatorId,
    official: {
      actual: officialActual,
      attainmentPercent: officialAttainment,
      thresholdPosition: position,
      points: officialPoints
    },
    pending: {
      actual: pendingActual,
      recognitionStatus: pendingActual > 0 ? "PENDING_RECOGNITION" : "NONE"
    },
    projection: {
      actualAfterRecognition: round(officialActual + pendingActual),
      attainmentPercent: projectedAttainment,
      thresholdPosition: projectedPosition,
      isOfficial: false
    },
    gaps: { toMinimumPercent: gapToMinimum, toTargetPercent: gapToTarget, toCapPercent: gapToCap },
    prioritization: {
      actionClass,
      estimatedEffort: effort,
      eligibleForAutomaticRanking: updateLagStatus === "CURRENT" && effort !== null
    },
    updateLagStatus
  };
}

export function rankIndicators(evaluations) {
  const priority = {
    RESCUE_MINIMUM: 5,
    CLOSE_TARGET: 4,
    ADVANCE_WITHIN_SCORING_RANGE: 3,
    CHALLENGE_FEASIBILITY: 2,
    RECONCILE_BEFORE_PRIORITIZING: 1,
    DEPRIORITIZE_FOR_POINTS: 0
  };

  return [...evaluations]
    .filter((item) => item.prioritization.actionClass !== "DEPRIORITIZE_FOR_POINTS")
    .sort((a, b) => {
      const classDifference = priority[b.prioritization.actionClass] - priority[a.prioritization.actionClass];
      if (classDifference !== 0) return classDifference;
      const effortA = a.prioritization.estimatedEffort ?? Number.POSITIVE_INFINITY;
      const effortB = b.prioritization.estimatedEffort ?? Number.POSITIVE_INFINITY;
      return effortA - effortB;
    })
    .slice(0, 5)
    .map((item, index) => ({ rank: index + 1, ...item }));
}
