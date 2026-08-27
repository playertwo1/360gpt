import assert from "node:assert/strict";
import { assessIndicatorFreshness } from "../engines/performance/freshness-engine.mjs";
import { evaluateIndicator, rankIndicators } from "../engines/performance/pobj-engine.mjs";

const current = assessIndicatorFreshness({
  indicatorBaseDate: "2026-08-24",
  reportBaseDate: "2026-08-25",
  asOfDate: "2026-08-26",
  maxAcceptedLagDays: 2
});
assert.equal(current.freshnessStatus, "CURRENT");
assert.equal(current.lagDays, 2);
assert.equal(current.eligibleForAutomaticRanking, true);

const stale = assessIndicatorFreshness({
  indicatorBaseDate: "2026-08-21",
  reportBaseDate: "2026-08-25",
  asOfDate: "2026-08-26",
  maxAcceptedLagDays: 2
});
assert.equal(stale.freshnessStatus, "POSSIBLY_LAGGED");
assert.equal(stale.action, "RECONCILE_BEFORE_PRIORITIZING");

const pending = assessIndicatorFreshness({
  indicatorBaseDate: "2026-08-14",
  reportBaseDate: "2026-08-25",
  asOfDate: "2026-08-26",
  maxAcceptedLagDays: 2,
  pendingActual: 10,
  pendingEvidenceStatus: "DECLARED"
});
assert.equal(pending.freshnessStatus, "LAGGED_WITH_PENDING");
assert.equal(pending.projection.isOfficial, false);
assert.equal(pending.projection.usableAsOfficialScore, false);

const reconciledEvaluation = evaluateIndicator({
  indicatorId: "lagged-indicator",
  target: 100,
  officialActual: 65,
  pendingActual: 10,
  minimumPercent: 70,
  capPercent: 150,
  maximumPoints: 15,
  freshnessAssessment: pending,
  estimatedEffort: 1
});
assert.equal(reconciledEvaluation.updateLagStatus, "LAGGED_WITH_PENDING");
assert.equal(reconciledEvaluation.prioritization.eligibleForAutomaticRanking, false);
assert.equal(rankIndicators([reconciledEvaluation]).length, 0);

const missing = assessIndicatorFreshness({
  indicatorBaseDate: null,
  asOfDate: "2026-08-26",
  maxAcceptedLagDays: 2
});
assert.equal(missing.freshnessStatus, "UNKNOWN");
assert.equal(missing.eligibleForAutomaticRanking, false);

const future = assessIndicatorFreshness({
  indicatorBaseDate: "2026-08-27",
  reportBaseDate: "2026-08-25",
  asOfDate: "2026-08-26",
  maxAcceptedLagDays: 2
});
assert.equal(future.action, "MANUAL_REVIEW_REQUIRED");

assert.throws(() => assessIndicatorFreshness({
  indicatorBaseDate: "26/08/2026",
  asOfDate: "2026-08-26",
  maxAcceptedLagDays: 2
}), /YYYY-MM-DD/);

console.log("performance-freshness: DT.BASE individual, defasagem e pendencias validadas");
