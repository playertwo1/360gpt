import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, "test-data/contracts", name)));

const performanceRequest = read("performance-request.synthetic.json");
const performanceResponse = read("performance-response.synthetic.json");
const capped = performanceRequest.indicators.find((item) => item.indicator_id === "produto_acima_teto");
assert.ok(capped.actual / capped.target * 100 >= capped.maximum_percent);
assert.ok(!performanceResponse.ranked_actions.some((item) => item.indicator_id === capped.indicator_id));
assert.equal(performanceResponse.ranked_actions[0].threshold_position, "NEAR_MINIMUM");
assert.ok(performanceResponse.ranked_actions.length <= 5);
assert.ok(performanceResponse.uncertainties.some((item) => item.includes("defasado")));

const financialRequest = read("financial-request.synthetic.json");
const financialResponse = read("financial-response.synthetic.json");
assert.equal(financialRequest.source_status, "OFFICIAL_PARTIAL");
assert.notEqual(financialResponse.attribution_status, "CONFIRMED");
assert.ok(financialResponse.recommendations.every((item) => item.requires_owner_approval));
assert.ok(financialResponse.uncertainties.length > 0);

const relationshipRequest = read("relationship-request.synthetic.json");
const relationshipResponse = read("relationship-response.synthetic.json");
assert.equal(relationshipRequest.consent_basis, "SYNTHETIC");
assert.ok(relationshipResponse.open_commitments.length > 0);
assert.ok(relationshipResponse.alternative_view.length > 0);
assert.equal(relationshipResponse.suggested_approach.requires_owner_approval, true);

for (const response of [performanceResponse, financialResponse, relationshipResponse]) {
  assert.equal(response.decision_authority, "RAFAEL");
}

console.log("domain-behavior: pisos, tetos, atribuicao e compromissos validados");
