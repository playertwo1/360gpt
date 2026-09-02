import assert from "node:assert/strict";
import {
  RULE_SCOPES,
  RULE_STATUS,
  createSemanticRule,
  getActiveRules,
  buildContextPacket
} from "../engines/knowledge/semantic-memory-engine.mjs";
import {
  SECTORS,
  OBJECTIVES,
  findBestGoldenExemplar,
  formatFewShotExemplarBlock
} from "../engines/knowledge/golden-exemplars-engine.mjs";
import {
  OUTCOME_TYPES,
  recordDecisionOutcome,
  calculateDecisionUtilityRate,
  calibrateConfidenceScore
} from "../engines/feedback/decision-utility-engine.mjs";
import { runWeeklyReflection } from "../engines/orchestration/reflexion-engine.mjs";
import {
  VETO_TOPICS,
  recordNegativeDecision,
  checkSafetyInterception
} from "../engines/security/negative-memory-engine.mjs";

console.log("================================================================================");
console.log("=== BATERIA DO GATE N2.3 — HOMOLOGAÇÃO DO FLYWHEEL DE APRENDIZADO CONTÍNUO ===");
console.log("================================================================================");

const FORJA_CNPJ = "12.345.678/0001-90";
const negativeDb = [];
const semanticDb = [];
const outcomesDb = [];

// ============================================================================
// CICLO 1: Interceptação, Correção de Rafael e Registro de Delta / Veto
// ============================================================================
console.log("\n-> [CICLO 1] Proposta errada, recusa de Rafael e registro de lição");

// 1.1 Proposta inicial errada: Consórcio para Forja Sul
const propErrada = "Ofertar consórcio imobiliário de R$ 600 mil";
const o1 = recordDecisionOutcome({
  recommendation_id: "rec-c1-01",
  domain: "PERFORMANCE",
  proposed_text: propErrada,
  outcome_type: OUTCOME_TYPES.RECUSADO_COM_MOTIVO,
  feedback_note: "Não ofertar consórcio. Empresa é locatária e foca em giro e cobrança"
});
outcomesDb.push(o1);

// 1.2 Gravar veto na Memória Negativa
const vetoConsorcio = recordNegativeDecision({
  target_entity: FORJA_CNPJ,
  vetoed_topic: VETO_TOPICS.PRODUCT,
  forbidden_action: "consorcio",
  reason: "Empresa locatária sem apetite para aquisição de imóveis"
});
negativeDb.push(vetoConsorcio);

// 1.3 Adicionar 9 propostas aceitas/editadas na semana para simular operação real
for (let i = 0; i < 9; i++) {
  outcomesDb.push(
    recordDecisionOutcome({
      recommendation_id: `rec-ok-${i}`,
      proposed_text: "Abordagem aprovada",
      outcome_type: i < 2 ? OUTCOME_TYPES.EDITADO_POR_RAFAEL : OUTCOME_TYPES.ACEITO_INTEGRAL,
      feedback_note: i < 2 ? "Priorizar WhatsApp da Renata após 15h" : ""
    })
  );
}

assert.equal(outcomesDb.length, 10);

// ============================================================================
// CICLO 2: Reflexão Semanal (WF-104) e Promoção para Memória Semântica
// ============================================================================
console.log("\n-> [CICLO 2] Reflexão semanal e consolidação de diretrizes ativas");

const reflection = runWeeklyReflection({
  outcomes: outcomesDb,
  minRecurrence: 2,
  weekLabel: "Semana Piloto 1"
});

assert.equal(reflection.total_proposals, 10);
assert.equal(reflection.utility_rate_pct, 90.0); // 9 de 10 úteis
assert.equal(reflection.meets_target, true); // >= 85%

// Promover a lição sobre a Renata identificada na reflexão
const renataRule = createSemanticRule({
  category: "PREFERENCIA_CLIENTE",
  scope: RULE_SCOPES.ACCOUNT,
  target_ref: FORJA_CNPJ,
  learned_rule: "Priorizar WhatsApp da Renata Dias após 15h",
  confidence_score: 0.95
});
semanticDb.push(renataRule);

assert.equal(semanticDb.length, 1);
assert.equal(semanticDb[0].status, RULE_STATUS.PROMOTED);

// ============================================================================
// CICLO 3: Próxima Geração — Protegida por Memória Negativa e Enriquecida por Few-Shot
// ============================================================================
console.log("\n-> [CICLO 3] Nova proposta para Forja Sul com barreira e exemplar dourado");

// 3.1 Testar se a IA tentaria oferecer consórcio de novo -> DEVE SER BLOQUEADA!
const tentativaErro = checkSafetyInterception({
  target_entity: FORJA_CNPJ,
  proposed_action: "Sugerir consórcio imobiliário para ampliar fábrica",
  proposed_topic: VETO_TOPICS.PRODUCT,
  negativeMemory: negativeDb
});
assert.equal(tentativaErro.safe, false);
console.log("   [OK] Tentativa de reofertar consórcio foi interceptada com sucesso!");

// 3.2 Montar pacote de contexto seguro (Context Packet)
const contextPacket = buildContextPacket({
  accountCnpj: FORJA_CNPJ,
  activeRules: getActiveRules({ rules: semanticDb, scope: RULE_SCOPES.ACCOUNT, target_ref: FORJA_CNPJ })
});
assert.match(contextPacket, /Priorizar WhatsApp da Renata Dias após 15h/);
console.log("   [OK] Diretriz da Renata Dias injetada no contexto sem alterar System Prompt!");

// 3.3 Recuperar Exemplar Dourado para Metalmecânica + Cobrança
const exemplar = findBestGoldenExemplar({
  sector: SECTORS.METALMECANICA,
  objective: OBJECTIVES.COBRANCA_PIX,
  channel: "WHATSAPP"
});
assert.equal(exemplar.client_name, "Metalúrgica Forja Sul Ltda");
const fewShotBlock = formatFewShotExemplarBlock(exemplar);
assert.match(fewShotBlock, /R\$ 420 mil/);
console.log("   [OK] Exemplar dourado com nota 5/5 recuperado para imitação de estilo!");

// 3.4 Verificar calibração final de confiança
const confFinal = calibrateConfidenceScore({
  baseConfidence: 0.80,
  historicalOutcomes: outcomesDb
});
assert.equal(confFinal, 0.95);
console.log(`   [OK] Confiança calibrada dinamicamente: 0.80 -> ${confFinal} (Alta utilidade)`);

console.log("\n================================================================================");
console.log("🏆 GATE N2.3 HOMOLOGADO COM SUCESSO ABSOLUTO! (DUR = 90.0% >= 85%) 🟢");
console.log("================================================================================");