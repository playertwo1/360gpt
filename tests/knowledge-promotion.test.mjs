import assert from "node:assert/strict";
import {
  KNOWLEDGE_STATUS,
  proposeLearningCandidate,
  validateCandidate,
  reviewCandidateByOwner,
  formatLearningPromptForTelegram
} from "../engines/knowledge/knowledge-promotion-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.2 (PROMOÇÃO DE CONHECIMENTO) ===");

// 1. Ciclo de Proposta e Validação
console.log("-> Teste 1: Criação e validação de candidato a aprendizado");
const candidate = proposeLearningCandidate({
  title: "Layout de Boleto + PIX Híbrido",
  description: "Tratar títulos híbridos como pontuando tanto em Cobrança quanto em Ativação PIX",
  scopeDomain: "performance",
  sourceEvidenceRef: "pobj_agosto_2026_secao_3"
});

assert.equal(candidate.status, KNOWLEDGE_STATUS.LEARNING_CANDIDATE);
assert.equal(candidate.can_apply_in_production, false);

const validated = validateCandidate(candidate);
assert.equal(validated.status, KNOWLEDGE_STATUS.VALIDATED);
assert.equal(validated.validation_status, "PASSED");

// 2. Proteção: Impedir concessão automática de efeitos externos
console.log("-> Teste 2: Proteção contra concessão automática de efeitos externos");
const badCandidate = proposeLearningCandidate({
  title: "Envio automático de propostas",
  description: "Enviar proposta sem aprovação humana",
  rulePayload: { grants_external_effects: true },
  sourceEvidenceRef: "teste"
});
const valBad = validateCandidate(badCandidate);
assert.equal(valBad.valid, false);

// 3. Aprovação Soberana de Rafael (PROMOTED)
console.log("-> Teste 3: Promoção com aprovação explícita de Rafael");
const promoted = reviewCandidateByOwner({
  candidate: validated,
  decision: "APPROVE",
  ownerId: "RAFAEL",
  rationale: "Homologado conforme regra de reciprocidade comercial"
});

assert.equal(promoted.status, KNOWLEDGE_STATUS.PROMOTED);
assert.equal(promoted.approved_by, "RAFAEL");
assert.equal(promoted.can_apply_in_production, true);

// 4. Rejeição e Revogação
console.log("-> Teste 4: Rejeição e Revogação de Conhecimento");
const rejected = reviewCandidateByOwner({ candidate: validated, decision: "REJECT" });
assert.equal(rejected.status, KNOWLEDGE_STATUS.REJECTED);
assert.equal(rejected.can_apply_in_production, false);

const revoked = reviewCandidateByOwner({ candidate: promoted, decision: "REVOKE" });
assert.equal(revoked.status, KNOWLEDGE_STATUS.REVOKED);
assert.equal(revoked.can_apply_in_production, false);

// 5. Formatação para o Telegram
console.log("-> Teste 5: Formatação executiva do Telegram");
const msg = formatLearningPromptForTelegram(candidate);
assert.match(msg, /Proposta de Aprendizado Supervisionado/i);
assert.match(msg, /\/aprovar/i);

console.log("\nTODOS OS TESTES DO MARCO N2.2.2 (PROMOÇÃO DE CONHECIMENTO) PASSARAM COM SUCESSO! 🟢");