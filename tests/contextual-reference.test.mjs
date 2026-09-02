import assert from "node:assert/strict";
import { resolveContextualReference } from "../engines/orchestration/contextual-reference-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.5 (REFERÊNCIAS CONTEXTUAIS) ===");

// 1. Resolução de "essa empresa" com histórico existente
console.log("-> Teste 1: Resolução de entidade a partir de histórico");
const history1 = [
  { text: "Avaliamos a proposta de folha para o Hospital São Lucas" }
];
const r1 = resolveContextualReference({
  currentText: "Qual o telefone do financeiro dessa empresa?",
  conversationHistory: history1
});
assert.equal(r1.resolved, true);
assert.equal(r1.resolved_entity.name, "Hospital & Maternidade São Lucas S/A");
assert.match(r1.enriched_text, /Hospital & Maternidade São Lucas/i);

// 2. Sem antecedente inequívoco -> Exigir esclarecimento (não adivinhar)
console.log("-> Teste 2: Sem antecedente -> Pergunta de esclarecimento");
const r2 = resolveContextualReference({
  currentText: "Qual a dívida dessa empresa?",
  conversationHistory: [] // histórico vazio
});
assert.equal(r2.resolved, false);
assert.equal(r2.requires_clarification, true);
assert.match(r2.clarification_question, /A qual empresa da carteira/i);

// 3. Resolução de "essa linha" (indicador)
console.log("-> Teste 3: Resolução de esteira/linha de indicador");
const history2 = [
  { text: "Analisamos a esteira de cobrança bancária da Forja Sul" }
];
const r3 = resolveContextualReference({
  currentText: "Quantos pontos faltam para bater essa linha?",
  conversationHistory: history2
});
assert.equal(r3.resolved, true);
assert.equal(r3.resolved_indicator, "FATURAMENTO_BOLETO_PIX");

// 4. Incremento contextual ("e se forem mais duas?")
console.log("-> Teste 4: Incremento condicional ('e se forem mais 2?')");
const r4 = resolveContextualReference({
  currentText: "E se forem mais 2?",
  conversationHistory: [{ text: "Abri 2 contas PJ hoje" }]
});
assert.equal(r4.resolved, true);
assert.equal(r4.incremental_quantity, 2);
assert.equal(r4.is_incremental_simulation, true);

console.log("\nTODOS OS TESTES DO MARCO N2.2.5 (REFERÊNCIAS CONTEXTUAIS) PASSARAM COM SUCESSO! 🟢");