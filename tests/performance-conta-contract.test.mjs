import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative)));
const request = read("test-data/contracts/performance-conta-request.synthetic.json");
const response = read("test-data/contracts/performance-conta-response.synthetic.json");
const requestSchema = read("contracts/performance-conta-plan-request.schema.json");
const responseSchema = read("contracts/performance-conta-plan-response.schema.json");

assert.equal(request.requested_by, "GERENTE_GERAL_PERFORMANCE");
assert.equal(request.provider, "GERENTE_GERAL_CONTA");
assert.equal(request.mediated_by, "MOTOR_CONSOLIDACAO_360");
assert.equal(response.mediated_by, "MOTOR_CONSOLIDACAO_360");
assert.equal(request.operating_phase, "GOAL_LEVEL_INITIAL");
assert.equal(request.account_data_status, "NOT_AVAILABLE");
assert.equal(response.account_data_status, "NOT_AVAILABLE");
assert.deepEqual(response.account_candidates, []);
assert.equal(response.decision_authority, "RAFAEL");
assert.equal(requestSchema.allOf[0].then.properties.account_data_status.const, "NOT_AVAILABLE");
assert.equal(responseSchema.allOf[0].then.properties.account_candidates.maxItems, 0);

const forbiddenKeys = new Set(["company", "empresa", "company_id", "origin", "origem"]);
const visit = (value) => {
  if (Array.isArray(value)) return value.forEach(visit);
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!forbiddenKeys.has(key.toLowerCase()), "Campo proibido na fase inicial: " + key);
      visit(child);
    }
  }
};
visit(request);
visit(response);

console.log("performance-conta-contract: mediacao e fase inicial sem empresas validadas");
