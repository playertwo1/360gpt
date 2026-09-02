import assert from "node:assert/strict";
import {
  OUTCOME_TYPES,
  recordDecisionOutcome,
  computeTextDelta,
  calculateDecisionUtilityRate,
  calibrateConfidenceScore
} from "../engines/feedback/decision-utility-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.3.3 (DECISION UTILITY & FEEDBACK) ===");

// 1. Registro de desfecho com aceitação integral
console.log("-> Teste 1: Proposta aceita integralmente");
const o1 = recordDecisionOutcome({
  recommendation_id: "rec-001",
  domain: "RELACIONAMENTO",
  proposed_text: "Olá Dr. Arnaldo, podemos tomar um café?",
  outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL
});

assert.equal(o1.outcome_type, OUTCOME_TYPES.ACEITO_INTEGRAL);
assert.equal(o1.delta_analysis.has_changes, false);

// 2. Registro com edição (Delta Analysis)
console.log("-> Teste 2: Proposta editada por Rafael (Delta de concisão)");
const proposedLong = "Olá Dr. Arnaldo Silveira, gostaria de agendar uma reunião na agência para falar sobre folha de pagamento na próxima semana.";
const finalShort = "Dr. Arnaldo, café amanhã às 15h sobre a folha?";

const o2 = recordDecisionOutcome({
  recommendation_id: "rec-002",
  domain: "RELACIONAMENTO",
  proposed_text: proposedLong,
  outcome_type: OUTCOME_TYPES.EDITADO_POR_RAFAEL,
  final_text: finalShort,
  feedback_note: "Preferiu encurtar a abordagem"
});

assert.equal(o2.outcome_type, OUTCOME_TYPES.EDITADO_POR_RAFAEL);
assert.equal(o2.delta_analysis.has_changes, true);
assert.equal(o2.delta_analysis.edit_type, "MADE_MORE_CONCISE");

// 3. Proposta recusada
console.log("-> Teste 3: Proposta recusada com motivo");
const o3 = recordDecisionOutcome({
  recommendation_id: "rec-003",
  domain: "PERFORMANCE",
  proposed_text: "Ofertar consórcio para Forja Sul",
  outcome_type: OUTCOME_TYPES.RECUSADO_COM_MOTIVO,
  feedback_note: "Cliente não tem interesse em consórcio"
});
assert.equal(o3.delta_analysis.edit_type, "TOTAL_REJECTION");

// 4. Métrica Decision Utility Rate (DUR)
console.log("-> Teste 4: Cálculo da Taxa de Utilidade Decisória (DUR)");
// 2 aceitas/editadas de 3 propostas = 66.67% (abaixo da meta de 85%)
const dur1 = calculateDecisionUtilityRate([o1, o2, o3]);
assert.equal(dur1.utility_rate_pct, 66.67);
assert.equal(dur1.meets_target, false);

// Adicionar mais 7 aceitações (9 de 10 = 90.0% -> meets_target: true)
const highOutcomes = [o1, o2, o3];
for (let i = 0; i < 7; i++) {
  highOutcomes.push(
    recordDecisionOutcome({
      recommendation_id: `rec-high-${i}`,
      proposed_text: "Texto aprovado",
      outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL
    })
  );
}
const dur2 = calculateDecisionUtilityRate(highOutcomes);
assert.equal(dur2.utility_rate_pct, 90.0);
assert.equal(dur2.meets_target, true);

// 5. Calibração dinâmica de confiança
console.log("-> Teste 5: Calibração de confidence_score");
const confAlta = calibrateConfidenceScore({
  baseConfidence: 0.80,
  historicalOutcomes: highOutcomes
});
assert.equal(confAlta, 0.95); // 0.80 + 0.15 = 0.95

const confBaixa = calibrateConfidenceScore({
  baseConfidence: 0.80,
  historicalOutcomes: [o3, o3, o3]
});
assert.equal(confBaixa, 0.55); // 0.80 - 0.25 = 0.55

console.log("\nTODOS OS TESTES DO MARCO N2.3.3 PASSARAM COM SUCESSO! 🟢");