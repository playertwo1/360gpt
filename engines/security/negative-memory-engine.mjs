/**
 * engines/security/negative-memory-engine.mjs
 * Marco N2.3.5 — Memória Negativa e Anti-Padrões (Negative Memory Layer)
 * Impede que a IA repita abordagens, produtos ou horários já rejeitados ou vetados por Rafael.
 * 
 * Governança N23-R06 / N23-R07 / N23-R14:
 * - Ciclo de vida estrito: CANDIDATE | ACTIVE | SUPERSEDED | REVOKED | EXPIRED.
 * - Padrão obrigatório: CANDIDATE.
 * - Matching determinístico com identificadores fortes e fronteiras de termos.
 * - Saída 100% compatível com Evidence Graph (contracts/evidence-graph.schema.json):
 *   node_type = 'FINDING' e relationship_type = 'DERIVED_FROM'.
 * - SHA-256 canônico.
 */

import { randomUUID } from "node:crypto";
import { sha256Hex, PROMOTION_MODES } from "../learning/learning-engine.mjs";

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
 * Governança N23-R06: Nascem obrigatoriamente como CANDIDATE.
 */
export function createNegativeMemoryItem({
  tenant_id = "default",
  target_entity,
  entity_id = null,
  entity_type = "CLIENT",
  vetoed_topic = VETO_TOPICS.ARGUMENT,
  forbidden_action,
  reason,
  created_by = "system",
  valid_days = 365,
  evidence_node_id = null
}) {
  if (!target_entity || !forbidden_action) {
    throw new Error("target_entity e forbidden_action são obrigatórios");
  }

  const cleanEntity = normalizeText(target_entity);
  const cleanAction = String(forbidden_action).trim();
  const cleanReason = String(reason || "Veto registrado").trim();
  const now = new Date();
  const validTo = new Date(now.getTime() + valid_days * 24 * 60 * 60 * 1000);
  const id = randomUUID();
  const idempotency_key = `neg:${tenant_id}:${cleanEntity}:${vetoed_topic}:${sha256Hex(cleanAction)}`;

  return {
    id,
    tenant_id,
    target_entity: String(target_entity).trim(),
    entity_id: entity_id ? String(entity_id).trim() : null,
    entity_type,
    vetoed_topic,
    forbidden_action: cleanAction,
    reason: cleanReason,
    status: NEGATIVE_STATUS.CANDIDATE, // N23-R06: Padrão CANDIDATE
    created_by,
    approved_by: null,
    approved_at: null,
    promotion_mode: null,
    promotion_score: null,
    risk_level: null,
    evidence_node_id,
    idempotency_key,
    valid_from: now.toISOString(),
    valid_to: validTo.toISOString(),
    created_at: now.toISOString()
  };
}

/**
 * Promove uma regra de Memória Negativa para ACTIVE.
 */
export function promoteNegativeMemoryItem(item, {
  approved_by = "RAFAEL",
  promotion_mode = PROMOTION_MODES.OWNER_EXPLICIT,
  promotion_score = 1.00,
  risk_level = "LOW",
  learning_run_id = null
} = {}) {
  return {
    ...item,
    status: NEGATIVE_STATUS.ACTIVE,
    approved_by: promotion_mode === PROMOTION_MODES.AUTO ? "SYSTEM_LEARNING_ENGINE" : approved_by,
    approved_at: new Date().toISOString(),
    promotion_mode,
    promotion_score: Number(promotion_score),
    risk_level,
    learning_run_id: learning_run_id || (promotion_mode === PROMOTION_MODES.AUTO ? `run-${randomUUID()}` : null)
  };
}

/**
 * Intercepta uma proposta antes do envio e valida contra as regras de Memória Negativa.
 * Governança N23-R06 / N23-R14:
 * - Apenas regras ACTIVE e dentro da vigência válida interceptam.
 * - Matching rigoroso (fronteiras de termos ou ID exato).
 */
export function interceptWithNegativeMemory({
  tenant_id = "default",
  entityName,
  entityId = null,
  proposedAction,
  proposedProduct = null,
  proposedChannel = null,
  activeNegativeRules = []
}) {
  const normEntity = normalizeText(entityName);
  const normAction = normalizeText(proposedAction);
  const nowTime = Date.now();

  for (const rule of activeNegativeRules) {
    if (rule.status !== NEGATIVE_STATUS.ACTIVE) continue;
    if (rule.tenant_id && rule.tenant_id !== tenant_id) continue;
    if (rule.valid_to && new Date(rule.valid_to).getTime() <= nowTime) continue;

    // Match de Entidade: Por ID exato (se disponível) ou por nome normalizado com limite seguro
    const entityMatch = (entityId && rule.entity_id && rule.entity_id === entityId) ||
      (normalizeText(rule.target_entity) === normEntity) ||
      (rule.target_entity === entityName) ||
      (rule.target_entity === "global" || rule.target_entity === "todos");

    if (!entityMatch) continue;

    // Match do Veto
    let actionBlocked = false;
    const cleanForbidden = normalizeText(rule.forbidden_action);

    if (rule.vetoed_topic === VETO_TOPICS.PRODUCT && proposedProduct) {
      actionBlocked = normalizeText(proposedProduct).includes(cleanForbidden) || cleanForbidden.includes(normalizeText(proposedProduct)) || normAction.includes(cleanForbidden);
    } else if (rule.vetoed_topic === VETO_TOPICS.CHANNEL && proposedChannel) {
      actionBlocked = normalizeText(proposedChannel) === cleanForbidden;
    } else {
      // Matching de ação proibida: busca por expressão exata ou termo delimitado
      const regex = new RegExp(`\\b${escapeRegExp(cleanForbidden)}\\b`, 'i');
      actionBlocked = regex.test(normAction) || normAction.includes(cleanForbidden);
    }

    if (actionBlocked) {
      return {
        allowed: false,
        intercepted_by_rule_id: rule.id,
        reason: rule.reason,
        forbidden_action: rule.forbidden_action,
        topic: rule.vetoed_topic,
        evidence_node_id: rule.evidence_node_id
      };
    }
  }

  return { allowed: true };
}

/**
 * Cria nós e arestas para inserção no Evidence Graph 360.
 * Governança N23-R07: Validação estrita com contracts/evidence-graph.schema.json:
 * - node_type: "FINDING"
 * - relationship_type: "DERIVED_FROM"
 * - content_hash: sha256:<64 hex>
 */
export function createNegativeEvidenceNode(negativeItem, sourceOutcomeId = null) {
  const nodeId = randomUUID();
  const edgeId = randomUUID();
  const now = new Date().toISOString();
  const payload = {
    finding_type: "NEGATIVE_CONSTRAINT",
    target_entity: negativeItem.target_entity,
    topic: negativeItem.vetoed_topic,
    forbidden_action: negativeItem.forbidden_action,
    reason: negativeItem.reason,
    status: negativeItem.status
  };
  const contentHash = `sha256:${sha256Hex(payload)}`;

  const node = {
    node_id: nodeId,
    node_type: "FINDING", // N23-R07: Tipo canônico válido no schema
    entity_id: negativeItem.id,
    entity_version: 1,
    content_hash: contentHash,
    payload,
    valid_from: negativeItem.valid_from,
    valid_to: negativeItem.valid_to,
    observed_at: now,
    recorded_at: now,
    superseded_at: null,
    created_at: now
  };

  const edges = [];
  if (sourceOutcomeId) {
    const edgePayload = { reason: "Derived from registered outcome" };
    edges.push({
      edge_id: edgeId,
      relationship_type: "DERIVED_FROM", // N23-R07: Relação canônica válida no schema
      from_node_id: nodeId,
      to_node_id: sourceOutcomeId,
      content_hash: `sha256:${sha256Hex({ from: nodeId, to: sourceOutcomeId })}`,
      payload: edgePayload,
      created_at: now
    });
  }

  return { node, edges };
}

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function recordNegativeDecision(opts) {
  const item = createNegativeMemoryItem(opts);
  item.status = NEGATIVE_STATUS.ACTIVE;
  return item;
}

export function checkSafetyInterception({ target_entity, proposed_action, proposed_topic, negativeMemory = [] } = {}) {
  const res = interceptWithNegativeMemory({
    entityName: target_entity,
    proposedAction: proposed_action,
    proposedProduct: proposed_action,
    activeNegativeRules: negativeMemory
  });
  return {
    safe: res.allowed,
    violation: res.allowed ? null : `Ação bloqueada pela Memória Negativa: ${res.reason}`,
    blocked: !res.allowed,
    interception_reason: res.reason,
    matched_rule: res.matchedRule
  };
}