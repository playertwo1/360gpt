import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluateIndicator, rankIndicators, scoreGeneralRule } from "../engines/performance/pobj-engine.mjs";

const policy = JSON.parse(readFileSync(new URL("../policies/pobj-scoring-rules.2026-h2.json", import.meta.url)));
const generalRule = policy.generalRule;

assert.equal(scoreGeneralRule({ attainment: 65, weight: 10, rule: generalRule }).points, 0);
assert.equal(scoreGeneralRule({ attainment: 75, weight: 10, rule: generalRule }).points, 3.75);
assert.equal(scoreGeneralRule({ attainment: 85, weight: 10, rule: generalRule }).rawPoints, 6.375);
assert.equal(scoreGeneralRule({ attainment: 150, weight: 10, rule: generalRule }).points, 15);
assert.equal(scoreGeneralRule({ attainment: 180, weight: 10, rule: generalRule }).points, 15);
assert.equal(scoreGeneralRule({ attainment: -20, weight: 10, rule: generalRule }).points, 0);

const officialGeneral = evaluateIndicator({
  indicatorId: "official-general-rule",
  target: 100,
  officialActual: 85,
  minimumPercent: 70,
  capPercent: 150,
  maximumPoints: 15,
  weight: 10,
  scoringRule: generalRule,
  updateLagStatus: "CURRENT",
  estimatedEffort: 2
});
assert.equal(officialGeneral.official.points.status, "CALCULATED_FROM_OFFICIAL_RULE");
assert.equal(officialGeneral.official.points.points, 6.375);

const nearMinimum = evaluateIndicator({
  indicatorId: "near-minimum",
  target: 100,
  officialActual: 48,
  minimumPercent: 50,
  capPercent: 100,
  maximumPoints: 20,
  updateLagStatus: "CURRENT",
  estimatedEffort: 2
});
assert.equal(nearMinimum.official.thresholdPosition, "NEAR_MINIMUM");
assert.equal(nearMinimum.official.points.points, 0);
assert.equal(nearMinimum.prioritization.actionClass, "RESCUE_MINIMUM");

const aboveCap = evaluateIndicator({
  indicatorId: "above-cap",
  target: 100,
  officialActual: 155,
  minimumPercent: 70,
  capPercent: 150,
  maximumPoints: 15,
  updateLagStatus: "CURRENT",
  estimatedEffort: 1
});
assert.equal(aboveCap.official.points.points, 15);
assert.equal(aboveCap.prioritization.actionClass, "DEPRIORITIZE_FOR_POINTS");

const noCurve = evaluateIndicator({
  indicatorId: "no-curve",
  target: 100,
  officialActual: 80,
  minimumPercent: 50,
  capPercent: 120,
  maximumPoints: 20,
  updateLagStatus: "CURRENT",
  estimatedEffort: 3
});
assert.equal(noCurve.official.points.status, "UNDETERMINED");
assert.equal(noCurve.official.points.points, null);

const withPending = evaluateIndicator({
  indicatorId: "pending",
  target: 100,
  officialActual: 65,
  pendingActual: 10,
  minimumPercent: 70,
  capPercent: 100,
  maximumPoints: 10,
  updateLagStatus: "POSSIBLY_LAGGED",
  estimatedEffort: 1
});
assert.equal(withPending.official.attainmentPercent, 65);
assert.equal(withPending.projection.attainmentPercent, 75);
assert.equal(withPending.projection.isOfficial, false);
assert.equal(withPending.prioritization.actionClass, "RECONCILE_BEFORE_PRIORITIZING");

const ranked = rankIndicators([aboveCap, noCurve, withPending, nearMinimum]);
assert.equal(ranked[0].indicatorId, "near-minimum");
assert.ok(!ranked.some((item) => item.indicatorId === "above-cap"));
assert.ok(ranked.length <= 5);

const zeroTarget = evaluateIndicator({
  indicatorId: "invalid",
  target: 0,
  officialActual: 1,
  minimumPercent: 50,
  capPercent: 100,
  maximumPoints: 1
});
assert.equal(zeroTarget.official.points.status, "EXCLUDED_FROM_DENOMINATOR");
assert.equal(zeroTarget.prioritization.eligibleForAutomaticRanking, false);

console.log("pobj-engine: pisos, tetos, curvas, pendencias e ranking validados");
