/**
 * engines/security/negative-memory-engine.mjs
 * Marco N2.3.5 — Memória de Decisões Negativas e Anti-Padrões (Negative Memory)
 * Impede que a IA repita gafes comerciais ou volte a sugerir produtos/canais já vetados.
 */

export const VETO_TOPICS = {
  PRODUCT: "PRODUCT",
  CHANNEL: "CHANNEL",
  SCHEDULE: "SCHEDULE",
  ARGUMENT: "ARGUMENT"
};

/**
 * Registra uma decisão negativa / anti-padrão no grafo.
 */
export function recordNegativeDecision({
  target_entity = "GLOBAL",
  vetoed_topic = VETO_TOPICS.PRODUCT,
  forbidden_action,
  reason,
  evidence_node_id = null
}) {
  if (!forbidden_action || !reason) {
    throw new Error("forbidden_action e reason são obrigatórios");
  }

  return {
    id: `neg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    target_entity: String(target_entity).trim(),
    vetoed_topic,
    forbidden_action: forbidden_action.trim(),
    reason: reason.trim(),
    evidence_node_id: evidence_node_id || `ev-veto-${Date.now()}`,
    created_at: new Date().toISOString()
  };
}

/**
 * Intercepta preventivamente uma proposta comercial cruzando com as decisões negativas ativas.
 * Retorna { safe: boolean, violation: string | null }
 */
export function checkSafetyInterception({
  target_entity,
  proposed_action,
  proposed_topic = VETO_TOPICS.PRODUCT,
  negativeMemory = []
}) {
  const clean = (str) =>
    String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const normAction = clean(proposed_action);
  const normEntity = clean(target_entity);

  for (const item of negativeMemory) {
    const itemEntity = clean(item.target_entity);
    const entityMatches = itemEntity === "global" || itemEntity === normEntity;

    if (entityMatches && item.vetoed_topic === proposed_topic) {
      const forbiddenWord = clean(item.forbidden_action);

      if (normAction.includes(forbiddenWord)) {
        return {
          safe: false,
          veto_id: item.id,
          violation: `Ação bloqueada pela Memória Negativa: "${item.forbidden_action}" foi vetado para esta entidade. Motivo: ${item.reason}`,
          reason: item.reason
        };
      }
    }
  }

  return {
    safe: true,
    veto_id: null,
    violation: null
  };
}