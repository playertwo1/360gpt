/**
 * engines/knowledge/knowledge-promotion-engine.mjs
 * Marco N2.2.2 — Promoção Supervisionada de Conhecimento
 * Ciclo de Vida: OBSERVED -> LEARNING_CANDIDATE -> VALIDATED -> OWNER_APPROVED -> PROMOTED
 */

export const KNOWLEDGE_STATUS = {
  OBSERVED: "OBSERVED",
  LEARNING_CANDIDATE: "LEARNING_CANDIDATE",
  VALIDATED: "VALIDATED",
  OWNER_APPROVED: "OWNER_APPROVED",
  PROMOTED: "PROMOTED",
  REJECTED: "REJECTED",
  REVOKED: "REVOKED"
};

/**
 * Cria uma proposta de aprendizado a partir de uma observação.
 */
export function proposeLearningCandidate({
  title,
  description,
  ruleType = "EQUIVALENCE_OR_LAYOUT",
  rulePayload = {},
  scopeDomain = "all",
  sourceEvidenceRef
}) {
  if (!title || !description || !sourceEvidenceRef) {
    throw new Error("INVALID_LEARNING_PROPOSAL: title, description and sourceEvidenceRef are required");
  }

  const candidateId = `learn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    candidate_id: candidateId,
    status: KNOWLEDGE_STATUS.LEARNING_CANDIDATE,
    title,
    description,
    rule_type: ruleType,
    rule_payload: rulePayload,
    scope_domain: scopeDomain,
    source_evidence_ref: sourceEvidenceRef,
    created_at: new Date().toISOString(),
    valid_until: null,
    approved_by: null,
    validation_status: "PENDING",
    can_apply_in_production: false
  };
}

/**
 * Valida o candidato quanto a consistência lógica e conformidade com AGENTS.md.
 */
export function validateCandidate(candidate) {
  if (candidate.status !== KNOWLEDGE_STATUS.LEARNING_CANDIDATE) {
    return { valid: false, reason: "Candidate is not in LEARNING_CANDIDATE status" };
  }

  // Regra soberana: nenhuma regra de aprendizado pode violar a autoridade de Rafael
  if (candidate.rule_payload?.grants_external_effects === true) {
    return { valid: false, reason: "VIOLATION: Knowledge candidates cannot auto-grant external effects" };
  }

  return {
    ...candidate,
    status: KNOWLEDGE_STATUS.VALIDATED,
    validation_status: "PASSED",
    validated_at: new Date().toISOString()
  };
}

/**
 * Aplica a decisão soberana de Rafael sobre o candidato.
 */
export function reviewCandidateByOwner({
  candidate,
  decision, // "APPROVE" | "REJECT" | "REVOKE"
  ownerId = "RAFAEL",
  rationale = "Aprovado para uso nas próximas competências",
  validUntil = "2027-12-31T23:59:59Z"
}) {
  if (decision === "APPROVE") {
    return {
      ...candidate,
      status: KNOWLEDGE_STATUS.PROMOTED,
      approved_by: ownerId,
      approved_at: new Date().toISOString(),
      promoted_at: new Date().toISOString(),
      valid_until: validUntil,
      rationale,
      can_apply_in_production: true
    };
  } else if (decision === "REJECT") {
    return {
      ...candidate,
      status: KNOWLEDGE_STATUS.REJECTED,
      rejected_by: ownerId,
      rejected_at: new Date().toISOString(),
      rationale,
      can_apply_in_production: false
    };
  } else if (decision === "REVOKE") {
    return {
      ...candidate,
      status: KNOWLEDGE_STATUS.REVOKED,
      revoked_by: ownerId,
      revoked_at: new Date().toISOString(),
      rationale,
      can_apply_in_production: false
    };
  }

  throw new Error(`UNKNOWN_OWNER_DECISION: ${decision}`);
}

/**
 * Formata mensagem explicativa para o Telegram solicitando revisão de Rafael.
 */
export function formatLearningPromptForTelegram(candidate) {
  return (
    `🎓 <b>Proposta de Aprendizado Supervisionado (${candidate.candidate_id})</b>\n\n` +
    `• <b>Título:</b> ${candidate.title}\n` +
    `• <b>Descrição:</b> ${candidate.description}\n` +
    `• <b>Domínio Afetado:</b> <code>${candidate.scope_domain}</code>\n` +
    `• <b>Evidência de Origem:</b> <code>${candidate.source_evidence_ref}</code>\n` +
    `• <b>Status Atual:</b> <code>${candidate.status}</code>\n\n` +
    `⚖️ <b>Decisão de Rafael:</b> Envie <code>/aprovar ${candidate.candidate_id}</code> ou <code>/rejeitar ${candidate.candidate_id}</code>.`
  );
}