import assert from "node:assert/strict";
import {
  runWeeklyReflection,
  formatWeeklyReflexionTelegram
} from "../engines/orchestration/reflexion-engine.mjs";
import { OUTCOME_TYPES } from "../engines/feedback/decision-utility-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.3.4 (REFLEXION ENGINE) ===");

// 1. Simular histórico de 10 desfechos da semana
const testOutcomes = [
  { outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL, feedback_note: "" },
  { outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL, feedback_note: "" },
  { outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL, feedback_note: "" },
  { outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL, feedback_note: "" },
  { outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL, feedback_note: "" },
  { outcome_type: OUTCOME_TYPES.ACEITO_INTEGRAL, feedback_note: "" },
  { outcome_type: OUTCOME_TYPES.EDITADO_POR_RAFAEL, feedback_note: "Priorizar WhatsApp da Renata após 15h" },
  { outcome_type: OUTCOME_TYPES.EDITADO_POR_RAFAEL, feedback_note: "Priorizar WhatsApp da Renata após 15h" },
  { outcome_type: OUTCOME_TYPES.EDITADO_POR_RAFAEL, feedback_note: "Dr. Arnaldo prefere reunião presencial às terças" },
  { outcome_type: OUTCOME_TYPES.RECUSADO_COM_MOTIVO, feedback_note: "Não ofertar consórcio para empresas de logística" }
];

console.log("-> Teste 1: Execução da reflexão semanal com extração de lições recorrentes");
const reflection = runWeeklyReflection({
  outcomes: testOutcomes,
  minRecurrence: 2,
  weekLabel: "Semana 35/2026"
});

assert.equal(reflection.total_proposals, 10);
assert.equal(reflection.utility_rate_pct, 90.0);
assert.equal(reflection.meets_target, true);
assert.ok(reflection.candidate_lessons.length >= 2);

const renataLesson = reflection.candidate_lessons.find((l) => l.topic.includes("Renata"));
assert.ok(renataLesson);
assert.equal(renataLesson.recurrence, 2);

console.log("-> Teste 2: Formatação executiva para o Telegram");
const msg = formatWeeklyReflexionTelegram(reflection);
assert.match(msg, /Balanço Semanal de Aprendizado 360/i);
assert.match(msg, /META BATIDA/i);
assert.match(msg, /Priorizar WhatsApp da Renata/i);
assert.match(msg, /\/aprovar_todas/i);

console.log("\nTODOS OS TESTES DO MARCO N2.3.4 PASSARAM COM SUCESSO! 🟢");