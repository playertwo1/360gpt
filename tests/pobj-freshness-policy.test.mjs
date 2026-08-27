import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const policy = JSON.parse(readFileSync(new URL("../policies/pobj-freshness-calibration.2026-08.json", import.meta.url)));
assert.equal(policy.status, "CALIBRATING");
assert.equal(policy.activationAllowed, false);
assert.equal(policy.sampleSize, 5);
assert.equal(policy.productionModeRecommendation, "SOURCE_WATERMARK");
assert.equal(policy.sources.length, 5);
assert.ok(policy.sources.every(({ sha256 }) => /^[a-f0-9]{64}$/.test(sha256)));
assert.ok(policy.promotionRequirements.includes("OWNER_APPROVAL"));
assert.ok(policy.observations.some(({ candidateProfile }) => candidateProfile === "BATCH_OR_IRREGULAR_UPDATE"));

console.log("pobj-freshness-policy: calibracao pequena, watermark e bloqueio de ativacao validados");
