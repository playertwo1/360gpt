import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const domains = ["performance", "financial", "relationship"];

for (const domain of domains) {
  const request = JSON.parse(fs.readFileSync(path.join(root, "contracts", domain + "-specialist-request.schema.json")));
  const response = JSON.parse(fs.readFileSync(path.join(root, "contracts", domain + "-specialist-response.schema.json")));
  assert.equal(request.properties.schema_version.const, "1.0.0");
  assert.equal(request.properties.specialist_id.enum.length, 5);
  assert.equal(response.properties.schema_version.const, "1.0.0");
  assert.equal(response.properties.decision_authority.const, "RAFAEL");
  assert.ok(response.required.includes("uncertainties"));
}

const performance = JSON.parse(fs.readFileSync(path.join(root, "contracts/performance-specialist-request.schema.json")));
assert.ok(performance.required.includes("base_date"));
assert.ok(performance.$defs.indicator.required.includes("minimum_percent"));
assert.ok(performance.$defs.indicator.required.includes("maximum_percent"));
assert.ok(performance.$defs.indicator.required.includes("update_lag_status"));

const financial = JSON.parse(fs.readFileSync(path.join(root, "contracts/financial-specialist-request.schema.json")));
assert.ok(financial.required.includes("line_items"));
assert.ok(financial.properties.line_items.items.required.includes("budget"));
assert.ok(financial.properties.line_items.items.required.includes("actual"));

const relationship = JSON.parse(fs.readFileSync(path.join(root, "contracts/relationship-specialist-request.schema.json")));
assert.ok(relationship.required.includes("consent_basis"));
assert.ok(relationship.required.includes("timeline"));

console.log("domain-contracts: 3 dominios e 6 contratos direcionais validados");
