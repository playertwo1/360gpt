import assert from "node:assert/strict";
import {
  runWeeklyReflexion
} from "../engines/orchestration/reflexion-engine.mjs";
import { OUTCOME_TYPES, recordDecisionOutcome } from "../engines/feedback/decision-utility-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.3.4 (REFLEXION ENGINE) ===");

const testTenant = "test_reflexion_unit";

// 1. Simular histórico de 10 desfechos da semana com tenant_id obrigatório
const rawOutcomes = [
  { type: OUTCOME_TYPES.ACEITO_INTEGRAL, domain: "RELACIONAMENTO", prop: "Texto 1", fin: "Texto 1", note: "" },
  { type: OUTCOME_TYPES.ACEITO_INTEGRAL, domain: "RELACIONAMENTO", prop: "Texto 2", fin: "Texto 2", note: "" },
  { type: OUTCOME_TYPES.ACEITO_INTEGRAL, domain: "CONTA", prop: "Texto 3", fin: "Texto 3", note: "" },
  { type: OUTCOME_TYPES.ACEITO_INTEGRAL, domain: "PERFORMANCE", prop: "Texto 4", fin: "Texto 4", note: "" },
  { type: OUTCOME_TYPES.ACEITO_INTEGRAL, domain: "FINANCEIRO", prop: "Texto 5", fin: "Texto 5", note: "" },
  { type: OUTCOME_TYPES.ACEITO_INTEGRAL, domain: "RELACIONAMENTO", prop: "Texto 6", fin: "Texto 6", note: "" },
  { type: OUTCOME_TYPES.EDITADO_POR_RAFAEL, domain: "RELACIONAMENTO", prop: "Texto longo detalhado para WhatsApp", fin: "Oi, segue proposta", note: "Ficou muito longo" },
  { type: OUTCOME_TYPES.EDITADO_POR_RAFAEL, domain: "RELACIONAMENTO", prop: "Texto longo e prolixo para reunião", fin: "Vamos agendar?", note: "Reduzir texto" },
  { type: OUTCOME_TYPES.EDITADO_POR_RAFAEL, domain: "RELACIONAMENTO", prop: "Proposta extensa", fin: "Resumo da proposta", note: "Texto direto" },
  { type: OUTCOME_TYPES.RECUSADO_COM_MOTIVO, domain: "PERFORMANCE", prop: "Meta não aderente", fin: null, note: "Cliente não tem perfil" }
];

const testOutcomes = rawOutcomes.map((o, idx) => recordDecisionOutcome({
  tenant_id: testTenant,
  recommendation_id: `rec_test_${idx}`,
  domain: o.domain,
  proposed_payload: { text: o.prop },
  outcome_type: o.type,
  final_payload: o.fin ? { text: o.fin } : null,
  feedback_note: o.note
}));

console.log("-> Teste 1: Execução da reflexão semanal com extração de lições recorrentes");
const reflection = runWeeklyReflexion({
  tenant_id: testTenant,
  owner_id: "rafael",
  outcomes: testOutcomes,
  minSample: 5,
  weekReference: "Semana 35/2026"
});

assert.equal(reflection.success, true);
assert.equal(reflection.total_analyzed, 10);
assert.equal(reflection.dur_report.utility_rate_pct, 90.0);
assert.equal(reflection.dur_report.meets_target, true);
assert.ok(reflection.candidates_proposed.length >= 1);

console.log("-> Teste 2: Formatação executiva do telegram_card sem NaN ou undefined");
const msg = reflection.telegram_card;
assert.match(msg, /Balanço Semanal de Aprendizado/i);
assert.match(msg, /Decision Utility Rate \(DUR\):/i);
assert.doesNotMatch(msg, /NaN/);
assert.doesNotMatch(msg, /undefined/);

console.log("\nTODOS OS TESTES DO MARCO N2.3.4 PASSARAM COM SUCESSO! 🟢");