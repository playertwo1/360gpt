import assert from "node:assert/strict";
import {
  VETO_TOPICS,
  recordNegativeDecision,
  checkSafetyInterception
} from "../engines/security/negative-memory-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.3.5 (MEMÓRIA NEGATIVA & ANTI-PADRÕES) ===");

// 1. Registro de veto de produto para entidade específica
console.log("-> Teste 1: Registro de veto de produto específico para cliente");
const veto1 = recordNegativeDecision({
  target_entity: "12.345.678/0001-90", // Forja Sul
  vetoed_topic: VETO_TOPICS.PRODUCT,
  forbidden_action: "consorcio",
  reason: "Empresa opera com galpões alugados e não tem apetite para consórcio imobiliário"
});

assert.equal(veto1.target_entity, "12.345.678/0001-90");
assert.equal(veto1.vetoed_topic, "PRODUCT");
assert.equal(veto1.forbidden_action, "consorcio");

// 2. Registro de veto de horário de canal
console.log("-> Teste 2: Registro de veto de horário");
const veto2 = recordNegativeDecision({
  target_entity: "12.345.678/0001-90",
  vetoed_topic: VETO_TOPICS.SCHEDULE,
  forbidden_action: "ligar pela manha",
  reason: "Sócio atende somente após as 15h"
});

const negativeMemory = [veto1, veto2];

// 3. Interceptação preventiva com bloqueio
console.log("-> Teste 3: Interceptação preventiva bloqueando sugestão de consórcio");
const check1 = checkSafetyInterception({
  target_entity: "12.345.678/0001-90",
  proposed_action: "Ofertar cota de consórcio de R$ 500 mil",
  proposed_topic: VETO_TOPICS.PRODUCT,
  negativeMemory
});

assert.equal(check1.safe, false);
assert.match(check1.violation, /Ação bloqueada pela Memória Negativa/i);
assert.match(check1.violation, /galpões alugados/i);

// 4. Proposta legítima passa livremente
console.log("-> Teste 4: Proposta legítima (Cobrança Híbrida) passa sem bloqueio");
const check2 = checkSafetyInterception({
  target_entity: "12.345.678/0001-90",
  proposed_action: "Apresentar esteira de Cobrança Boleto com PIX D+0",
  proposed_topic: VETO_TOPICS.PRODUCT,
  negativeMemory
});

assert.equal(check2.safe, true);
assert.equal(check2.violation, null);

// 5. Outra empresa (Hospital São Lucas) não é bloqueada pelo veto da Forja Sul
console.log("-> Teste 5: Isolamento de entidade (Hospital São Lucas não sofre veto da Forja Sul)");
const check3 = checkSafetyInterception({
  target_entity: "01.234.567/0001-89", // São Lucas
  proposed_action: "Ofertar cota de consórcio de ambulâncias",
  proposed_topic: VETO_TOPICS.PRODUCT,
  negativeMemory
});

assert.equal(check3.safe, true);

console.log("\nTODOS OS TESTES DO MARCO N2.3.5 PASSARAM COM SUCESSO! 🟢");