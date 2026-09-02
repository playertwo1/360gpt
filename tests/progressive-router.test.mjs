import assert from "node:assert/strict";
import {
  ALL_DOMAINS,
  routeRequestProgressively
} from "../engines/orchestration/progressive-router.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.4 (ROTEAMENTO PROGRESSIVO) ===");

// 1. Pergunta focada somente em pontos -> Apenas Performance
console.log("-> Teste 1: Roteamento isolado de Performance");
const r1 = routeRequestProgressively({ text: "Como está meu POBJ?" });
assert.deepEqual(r1.selected_domains, ["performance"]);
assert.equal(r1.domain_decisions.performance.status, "INCLUDED");
assert.equal(r1.domain_decisions.conta.status, "EXCLUDED");
assert.equal(r1.domain_decisions.relacionamento.status, "EXCLUDED");
assert.equal(r1.domain_decisions.financeiro.status, "EXCLUDED");

// 2. Consulta de abordagem com cliente -> Performance + Conta + Relacionamento
console.log("-> Teste 2: Roteamento de Conta e Relacionamento");
const r2 = routeRequestProgressively({
  text: "Como devo conduzir a abordagem de folha no Hospital São Lucas?",
  hasEntityMention: true,
  hasStrategyRequest: true
});
assert.ok(r2.selected_domains.includes("conta"));
assert.ok(r2.selected_domains.includes("relacionamento"));
assert.equal(r2.domain_decisions.relacionamento.status, "INCLUDED");

// 3. Consulta de impacto financeiro -> Inclui Financeiro
console.log("-> Teste 3: Inclusão do Domínio Financeiro sob demanda de receita");
const r3 = routeRequestProgressively({
  text: "Quanto rende a cobrança da Forja Sul na margem da agência?",
  hasEntityMention: true,
  hasFinancialQuery: true
});
assert.ok(r3.selected_domains.includes("financeiro"));
assert.equal(r3.domain_decisions.financeiro.status, "INCLUDED");

// 4. Verificação de Governança
console.log("-> Teste 4: Governança sem chamadas laterais");
assert.equal(r1.allow_side_calls, false);
assert.equal(r2.allow_side_calls, false);
assert.equal(r3.allow_side_calls, false);

console.log("\nTODOS OS TESTES DO MARCO N2.2.4 (ROTEAMENTO PROGRESSIVO) PASSARAM COM SUCESSO! 🟢");