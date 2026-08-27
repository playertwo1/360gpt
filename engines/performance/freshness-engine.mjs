const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(name, value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string" || !ISO_DATE.test(value)) throw new TypeError(`${name} deve usar YYYY-MM-DD`);
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError(`${name} deve ser uma data valida`);
  }
  return date;
}

const daysBetween = (earlier, later) => Math.floor((later - earlier) / 86400000);

export function assessIndicatorFreshness({
  indicatorBaseDate,
  reportBaseDate = null,
  asOfDate,
  maxAcceptedLagDays,
  pendingActual = 0,
  pendingEvidenceStatus = "NONE"
}) {
  if (!Number.isInteger(maxAcceptedLagDays) || maxAcceptedLagDays < 0) {
    throw new RangeError("maxAcceptedLagDays deve ser inteiro nao negativo e vir de politica versionada");
  }
  if (!Number.isFinite(pendingActual)) throw new TypeError("pendingActual deve ser numerico e finito");

  const asOf = parseDateOnly("asOfDate", asOfDate);
  const indicatorBase = parseDateOnly("indicatorBaseDate", indicatorBaseDate);
  const reportBase = parseDateOnly("reportBaseDate", reportBaseDate);
  if (!asOf) throw new TypeError("asOfDate e obrigatoria");

  if (!indicatorBase) {
    return {
      freshnessStatus: "UNKNOWN",
      lagDays: null,
      action: "RECONCILE_BEFORE_PRIORITIZING",
      eligibleForAutomaticRanking: false,
      officialMustRemainUnchanged: true,
      reasonCodes: ["INDICATOR_BASE_DATE_MISSING"]
    };
  }

  const reasonCodes = [];
  if (indicatorBase > asOf || (reportBase && indicatorBase > reportBase)) {
    reasonCodes.push("BASE_DATE_IN_FUTURE");
    return {
      freshnessStatus: "INVALID_FUTURE_DATE",
      lagDays: daysBetween(indicatorBase, asOf),
      action: "MANUAL_REVIEW_REQUIRED",
      eligibleForAutomaticRanking: false,
      officialMustRemainUnchanged: true,
      reasonCodes
    };
  }

  const lagDays = daysBetween(indicatorBase, asOf);
  if (reportBase && reportBase < asOf) reasonCodes.push("REPORT_BASE_PRECEDES_AS_OF_DATE");
  if (indicatorBase < (reportBase ?? asOf)) reasonCodes.push("INDICATOR_BASE_PRECEDES_REPORT_BASE");

  if (lagDays <= maxAcceptedLagDays) {
    return {
      freshnessStatus: "CURRENT",
      lagDays,
      action: "USE_OFFICIAL_FOR_PRIORITIZATION",
      eligibleForAutomaticRanking: true,
      officialMustRemainUnchanged: true,
      reasonCodes
    };
  }

  const hasPending = pendingActual !== 0;
  reasonCodes.push("INDICATOR_EXCEEDS_ACCEPTED_LAG");
  if (hasPending) reasonCodes.push("PRODUCTION_PENDING_RECOGNITION");
  if (hasPending && !["CONFIRMED", "DECLARED", "ESTIMATED"].includes(pendingEvidenceStatus)) {
    reasonCodes.push("PENDING_EVIDENCE_STATUS_REQUIRED");
  }

  return {
    freshnessStatus: hasPending ? "LAGGED_WITH_PENDING" : "POSSIBLY_LAGGED",
    lagDays,
    action: "RECONCILE_BEFORE_PRIORITIZING",
    eligibleForAutomaticRanking: false,
    officialMustRemainUnchanged: true,
    projection: hasPending ? {
      pendingActual,
      evidenceStatus: pendingEvidenceStatus,
      isOfficial: false,
      usableAsOfficialScore: false
    } : null,
    reasonCodes
  };
}

