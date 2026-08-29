import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../registries/project-manifest.json", import.meta.url)));
const domains = Object.values(manifest.domains);
const specialists = domains.flatMap((domain) => domain.specialists);
const allIds = [manifest.director.id, ...domains.map((domain) => domain.manager.id), ...specialists.map((specialist) => specialist.id)];

assert.equal(manifest.schema_version, "1.0.0");
assert.equal(manifest.director.design_status, "APPROVED");
assert.equal(manifest.director.runtime_status, "INACTIVE");
assert.equal(domains.length, 4);
assert.deepEqual(Object.fromEntries(Object.entries(manifest.domains).map(([name, domain]) => [name, domain.specialists.length])), {
  conta: 6,
  performance: 5,
  financeiro: 5,
  relacionamento: 5
});
assert.equal(specialists.length, 21);
assert.ok(domains.every((domain) => domain.manager.design_status === "APPROVED"));
assert.ok(domains.every((domain) => domain.manager.runtime_status === "INACTIVE"));
assert.ok(specialists.every((specialist) => specialist.design_status === "APPROVED"));
const shadowSpecialists = specialists.filter((specialist) => specialist.runtime_status === "SHADOW");
assert.deepEqual(shadowSpecialists.map((specialist) => specialist.id).sort(), ["PERFORMANCE_EXECUTABILITY_PLAN", "PERFORMANCE_GAP_SCENARIOS", "PERFORMANCE_SCORING_STATE"]);
assert.ok(shadowSpecialists.every((specialist) => specialist.implementation_status === "IMPLEMENTED"));
assert.ok(specialists.every((specialist) => ["INACTIVE", "SHADOW"].includes(specialist.runtime_status)));
assert.ok(specialists.every((specialist) => specialist.runtime_status !== "ACTIVE"));
assert.equal(new Set(allIds).size, allIds.length, "Existem IDs duplicados");
assert.ok(!allIds.includes("GERENTE_GERAL_CONHECIMENTO"));
assert.equal(manifest.governance.maximum_active_specialists_per_domain, 4);
assert.equal(manifest.governance.approved_does_not_imply_active, true);
assert.equal(manifest.operating_mode.analysis_mode, "SHADOW");
assert.equal(manifest.operating_mode.real_data_authorization, "UNRESOLVED");
assert.equal(manifest.transversal_capabilities[0].id, "KNOWLEDGE_GOVERNANCE");
assert.equal(manifest.transversal_capabilities[0].runtime_status, "INACTIVE");

console.log("project-manifest: 4 dominios, 21 especialistas e lifecycles coerentes");
