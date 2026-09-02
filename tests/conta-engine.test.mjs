import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateAccount, evaluatePortfolio } from "../engines/conta/conta-engine.mjs";

const schema = JSON.parse(fs.readFileSync("contracts/performance-conta-plan-response.schema.json", "utf8"));

// 1. Teste de conta hospitalar com folha
const hospCase = {
  cnpj: "01.234.567/0001-89",
  name: "Hospital & Maternidade São Lucas S/A",
  segmento: "Saúde Hospitalar",
  months_revenue_12m: 60000000,
  employees_count: 280,
  payroll_active: false,
  credit_score: 850,
  tax_regularity: true,
  protests_count: 0
};

const hospEval = evaluateAccount(hospCase, ["folha_pagamento"]);
assert.equal(hospEval.eligibility_status, "ELIGIBLE");
assert.ok(hospEval.opportunities.some(o => o.reason_code === "CROSS_SELL_FOLHA_PAGAMENTO"));
assert.equal(hospEval.opportunities.find(o => o.reason_code === "CROSS_SELL_FOLHA_PAGAMENTO").estimated_points_gain, 4.0);

// 2. Teste da Fase GOAL_LEVEL_INITIAL
const initResp = evaluatePortfolio([hospCase], ["folha_pagamento"], "req-001", "GOAL_LEVEL_INITIAL");
assert.equal(initResp.account_data_status, "NOT_AVAILABLE");
assert.deepEqual(initResp.account_candidates, []);
assert.equal(initResp.decision_authority, "RAFAEL");

// 3. Teste da Fase ACCOUNT_LEVEL_FUTURE
const futureResp = evaluatePortfolio([hospCase], ["folha_pagamento"], "req-002", "ACCOUNT_LEVEL_FUTURE");
assert.equal(futureResp.account_data_status, "AVAILABLE");
assert.equal(futureResp.account_candidates.length, 1);
assert.equal(futureResp.account_candidates[0].account_ref, "01.234.567/0001-89");
assert.equal(futureResp.decision_authority, "RAFAEL");

// 4. Verificação de Restrição
const protestCase = {
  cnpj: "99.999.999/0001-99",
  name: "Empresa com Apontamento",
  protests_count: 2,
  employees_count: 50
};
const protestEval = evaluateAccount(protestCase, ["folha_pagamento"]);
assert.equal(protestEval.eligibility_status, "UNDETERMINED");
assert.ok(protestEval.limitations.some(l => l.includes("RESTRICTION_RECURRENT")));

console.log("✅ conta-engine: testes unitários de elegibilidade e conformidade aprovados com sucesso!");