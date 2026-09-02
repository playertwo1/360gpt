import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import {
  calculateProductFinancials,
  evaluateFinancialState
} from "../engines/financeiro/financial-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N8.3 (GG FINANCEIRO) ===");

// 1. Validar contrato de schema JSON
const schema = JSON.parse(fs.readFileSync("contracts/financial-specialist-response.schema.json", "utf8"));
assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");

const schemaForAjv = { ...schema };
delete schemaForAjv.$schema;
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaForAjv);

// 2. Teste do cálculo de Folha de Pagamento
console.log("-> Teste 1: Cálculo de retorno da Folha (Hospital São Lucas)");
const payrollFin = calculateProductFinancials({
  product: "FOLHA_DE_PAGAMENTO",
  headcount: 280
});
assert.equal(payrollFin.status, "ESTIMATED");
assert.equal(payrollFin.monthly_revenue, 7000.0);
assert.equal(payrollFin.annual_revenue, 84000.0);
assert.equal(payrollFin.unit, "BRL");

// 3. Teste do cálculo de Cobrança e PIX
console.log("-> Teste 2: Cálculo de retorno de Cobrança/PIX (Metalúrgica Forja Sul)");
const cobrancaFin = calculateProductFinancials({
  product: "COBRANCA_PIX",
  volume: 5040000.0 // R$ 420k/mês * 12
});
assert.equal(cobrancaFin.status, "ESTIMATED");
assert.equal(Math.round(cobrancaFin.annual_revenue), 22680);
assert.equal(cobrancaFin.unit, "BRL");

// 4. Teste de ausência de dado (NOT_AVAILABLE)
console.log("-> Teste 3: Tratamento estrito de ausência de dados");
const missingHeadcount = calculateProductFinancials({ product: "FOLHA_DE_PAGAMENTO", headcount: 0 });
assert.equal(missingHeadcount.status, "NOT_AVAILABLE");
assert.equal(missingHeadcount.reason_code, "HEADCOUNT_MISSING");

const missingVolume = calculateProductFinancials({ product: "COBRANCA_PIX", volume: 0 });
assert.equal(missingVolume.status, "NOT_AVAILABLE");
assert.equal(missingVolume.reason_code, "VOLUME_MISSING");

// 5. Teste da avaliação de estado e variância orçamentária
console.log("-> Teste 4: Avaliação orçamentária e conformidade de contrato");
const finState = evaluateFinancialState({ baseDate: "2026-08-28" });

assert.ok(validate(finState), JSON.stringify(validate.errors));
assert.equal(finState.decision_authority, "RAFAEL");
assert.equal(finState.attribution_status, "ESTIMATED");
assert.ok(finState.variance_analysis.length >= 3);
assert.ok(finState.concentration_risks.length >= 1);
assert.ok(finState.recommendations.length >= 2);
for (const rec of finState.recommendations) {
  assert.equal(rec.requires_owner_approval, true);
}

console.log("\nTODOS OS TESTES DO MARCO N8.3 (GG FINANCEIRO) PASSARAM COM SUCESSO! 🟢");