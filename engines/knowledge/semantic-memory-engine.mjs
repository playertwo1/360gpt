/**
 * engines/knowledge/semantic-memory-engine.mjs
 * Marco N2.3.1 — Camada de Memória Semântica Desacoplada
 * Regra Arquitetural: System Prompts são imutáveis no Git. O aprendizado é injetado como dado estruturado.
 */

export const RULE_SCOPES = {
  GLOBAL: "GLOBAL",
  ACCOUNT: "ACCOUNT",
  INDICATOR: "INDICATOR"
};

export const RULE_STATUS = {
  CANDIDATE: "CANDIDATE",
  PROMOTED: "PROMOTED",
  SUPERSEDED: "SUPERSEDED",
  EXPIRED: "EXPIRED"
};

/**
 * Cria um objeto de regra semântica com validade temporal e escopo restrito.
 */
export function createSemanticRule({
  category = "REGRA_CARTEIRA",
  scope = RULE_SCOPES.GLOBAL,
  target_ref = "GLOBAL",
  learned_rule,
  source_observation = "Informado pelo proprietário Rafael",
  confidence_score = 1.00,
  valid_days = 180,
  status = RULE_STATUS.PROMOTED
}) {
  if (!learned_rule || typeof learned_rule !== "string" || !learned_rule.trim()) {
    throw new Error("learned_rule obrigatória e não-vazia");
  }

  const now = new Date();
  const validTo = new Date(now.getTime() + valid_days * 24 * 60 * 60 * 1000);

  return {
    id: `rule-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    category,
    scope,
    target_ref: String(target_ref).trim(),
    learned_rule: learned_rule.trim(),
    source_observation,
    confidence_score: Number(confidence_score),
    status,
    valid_from: now.toISOString(),
    valid_to: validTo.toISOString(),
    created_at: now.toISOString()
  };
}

/**
 * Filtra e retorna apenas regras ativas para uma dada entidade e data de referência,
 * descartando regras expiradas (Memory Decay).
 */
export function getActiveRules({
  rules = [],
  scope = RULE_SCOPES.ACCOUNT,
  target_ref = "GLOBAL",
  referenceDate = new Date()
}) {
  const refTime = new Date(referenceDate).getTime();

  return rules.filter((rule) => {
    if (rule.status !== RULE_STATUS.PROMOTED) return false;

    // Verificar expiração (TTL / Memory Decay)
    if (rule.valid_to && new Date(rule.valid_to).getTime() < refTime) {
      return false;
    }

    // Compatibilidade de escopo: regras globais sempre aplicam, ou match de entidade
    if (rule.scope === RULE_SCOPES.GLOBAL) return true;
    if (rule.scope === scope && rule.target_ref === target_ref) return true;

    return false;
  });
}

/**
 * Aplica decaimento (Memory Decay) e marca como EXPIRED regras que ultrapassaram a data limite.
 */
export function applyMemoryDecay(rules, referenceDate = new Date()) {
  const refTime = new Date(referenceDate).getTime();

  return rules.map((r) => {
    if (r.status === RULE_STATUS.PROMOTED && r.valid_to && new Date(r.valid_to).getTime() < refTime) {
      return { ...r, status: RULE_STATUS.EXPIRED, expired_at: new Date(referenceDate).toISOString() };
    }
    return r;
  });
}

/**
 * Monta o Bloco de Injeção de Contexto para os Subagentes (Context Packet).
 * IMPORTANTE: Não altera o System Prompt; entrega um payload estruturado para compor a mensagem.
 */
export function buildContextPacket({
  accountCnpj = null,
  indicatorName = null,
  activeRules = []
}) {
  const relevant = activeRules.filter((r) => {
    if (r.scope === RULE_SCOPES.GLOBAL) return true;
    if (accountCnpj && r.scope === RULE_SCOPES.ACCOUNT && r.target_ref === accountCnpj) return true;
    if (indicatorName && r.scope === RULE_SCOPES.INDICATOR && r.target_ref.toLowerCase() === indicatorName.toLowerCase()) return true;
    return false;
  });

  if (relevant.length === 0) {
    return "";
  }

  const lines = relevant.map((r) => `• [${r.scope}:${r.target_ref}] ${r.learned_rule}`);

  return (
    `\n### DIRETRIZES E HEURÍSTICAS APRENDIDAS COM RAFAEL (PRIORIDADE MÁXIMA):\n` +
    lines.join("\n") +
    `\n`
  );
}