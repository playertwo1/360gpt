import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const policy = JSON.parse(readFileSync(new URL("../policies/pobj-scoring-rules.2026-h2.json", import.meta.url)));

assert.equal(policy.status, "APPROVED_SOURCE_NOT_RUNTIME_ACTIVE");
assert.equal(policy.source.authority, "OFFICIAL_MANUAL");
assert.match(policy.source.sha256, /^[a-f0-9]{64}$/);
assert.equal(policy.generalRule.minimumPercent, 70);
assert.equal(policy.generalRule.capPercent, 150);
assert.equal(policy.generalRule.displayRounding.status, "UNRESOLVED");
assert.equal(policy.exceptions.length, 7);
assert.ok(policy.exceptions.some(({ indicator, status }) => indicator === "Consorcio" && status === "DEDICATED_RULE_REQUIRED"));

console.log("pobj-policy: regra geral, proveniencia, excecoes e incertezas validadas");
