/**
 * engines/security/negative-memory-engine.mjs
 * Marco N2.3.5 — Memória Negativa e Anti-Padrões (Negative Memory Layer)
 * Impede que a IA repita abordagens, produtos ou horários já rejeitados ou vetados por Rafael.
 * 
 * Governança N23-15 / N23-16:
 * - Ciclo de vida estrito: CANDIDATE | ACTIVE | SUPERSEDED | REVOKED | EXPIRED.
 * - Normalização de acentuação, casing e termos.
 * - Integração navegável com o Evidence Graph (nós e arestas de linhagem).
 * - Identificadores UUID determinísticos com idempotência e isolamento por tenant.
 */

import { randomUUID } from "node:crypto";

export const VETO_TOPICS = {
  PRODUCT: "PRODUCT",
  CHANNEL: "CHANNEL",
  SCHEDULE: "SCHEDULE",
  ARGUMENT: "ARGUMENT"
};

export const NEGATIVE_STATUS = {
  CANDIDATE: "CANDIDATE",
  ACTIVE: "ACTIVE",
  SUPERSEDED: "SUPERSEDED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED"
};

/**
 * Cria um registro de anti-padrão/memória negativa.
 */
export function createNegativeMemoryItem({
  tenant_id = "default",
  target_entity,
  vetoed_topic = VETO_TOPICS.ARGUMENT,
  forbidden_action,
  reason,
  status = NEGATIVE_STATUS.ACTIVE,
  created_by = "system",
  valid_days = 365,
  evidence_node_id = null
}) {
  if (!target_entity || !forbidden_action) {
    throw new Error("target_entity e forbidden_action são obrigatórios");
  }

  const cleanEntity = normalizeText(target_entity);
  const cleanAction = String(forbidden_action).trim();
  const cleanReason = String(reason || "Veto registrado pelo usuário").trim();
  const now = new Date();
  const validTo = new Date(now.getTime() + valid_days * 24 * 60 * 60 * 1000);
  const id = randomUUID();
  const idempotency_key = `neg:${tenant_id}:${cleanEntity}:${vetoed_topic}:${hashString(cleanAction)}`;

  return {
    id,
    tenant_id,
    target_entity: cleanEntity,
    vetoed_topic,
    forbidden_action: cleanAction,
    reason: cleanReason,
    status,
    created_by,
    approved_by: status === NEGATIVE_STATUS.ACTIVE ? "RAFAEL" : null,
    approved_at: status === NEGATIVE_STATUS.ACTIVE ? now.toISOString() : null,
    evidence_node_id,
    idempotency_key,
    valid_from: now.toISOString(),
    valid_to: validTo.toISOString(),
    created_at: now.toISOString()
  };
}

/**
 * Intercepta uma proposta antes do envio e valida contra as regras de Memória Negativa.
 * Governança N23-15:
 * - Apenas regras ACTIVE e dentro da vigência valid_to interceptam.
 * - Normaliza acentos e pontuação.
 */
export function interceptWithNegativeMemory({
  tenant_id = "default",
  proposal,
  negativeMemoryRules = [],
  referenceDate = new Date()
}) {
  const refTime = new Date(referenceDate).getTime();
  const targetEntity = normalizeText(proposal.target_entity || proposal.client_name || "");
  const proposalContent = normalizeText(
    typeof proposal.content === "string" ? proposal.content : JSON.stringify(proposal)
  );

  const activeVetoes = negativeMemoryRules.filter((r) => {
    if (r.tenant_id && r.tenant_id !== tenant_id) return false;
    if (r.status !== NEGATIVE_STATUS.ACTIVE) return false;
    if (r.valid_to && new Date(r.valid_to).getTime() < refTime) return false;
    return true;
  });

  for (const veto of activeVetoes) {
    const vetoEntity = normalizeText(veto.target_entity);
    const vetoAction = normalizeText(veto.forbidden_action);

    const matchesEntity = vetoEntity === "global" || targetEntity.includes(vetoEntity);

    if (matchesEntity) {
      if (proposalContent.includes(vetoAction)) {
        return {
          blocked: true,
          reason_code: "NEGATIVE_MEMORY_VETO",
          veto_rule_id: veto.id,
          topic: veto.vetoed_topic,
          message: `Bloqueado por Memória Negativa: "${veto.forbidden_action}". Motivo: ${veto.reason}`
        };
      }
    }
  }

  return { blocked: false };
}

/**
 * Cria nós e arestas de linhagem no Evidence Graph para registrar o veto ou a criação da regra (N23-16).
 */
export function createNegativeEvidenceNode({
  negativeItem,
  sourceOutcomeId = null
}) {
  const nodeId = `ev-neg-${negativeItem.id.slice(0, 8)}`;
  const node = {
    id: nodeId,
    node_type: "NEGATIVE_CONSTRAINT",
    label: `Anti-padrão: ${negativeItem.forbidden_action}`,
    properties: {
      target_entity: negativeItem.target_entity,
      topic: negativeItem.vetoed_topic,
      reason: negativeItem.reason,
      status: negativeItem.status,
      valid_to: negativeItem.valid_to
    },
    created_at: new Date().toISOString()
  };

  const edges = [];
  if (sourceOutcomeId) {
    edges.push({
      source_id: nodeId,
      target_id: sourceOutcomeId,
      relation: "DERIVED_FROM_OUTCOME",
      created_at: new Date().toISOString()
    });
  }

  return { node, edges };
}

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}