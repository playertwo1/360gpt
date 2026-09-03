/**
 * engines/feedback/decision-utility-engine.mjs
 * Marco N2.3.3 — O Triângulo de Feedback e Matriz de Desfecho (Decision Utility Engine)
 * Rastreia a taxa de aceitação e utilidade das propostas da IA para o usuário.
 * 
 * Governança N23-10 / N23-11:
 * - O DUR (Decision Utility Rate) é uma métrica de experiência e preferência do usuário (UX/Relevância).
 * - DUR NUNCA altera a confiança factual de cálculos ou autorizações regulatórias (model_confidence).
 * - Conjuntos vazios ou inferiores à amostra mínima retornam NOT_ENOUGH_DATA e taxa null.
 */

import { createHash, randomUUID } from "node:crypto";

export const OUTCOME_TYPES = {
  ACEITO_INTEGRAL: "ACEITO_INTEGRAL",
  EDITADO_POR_RAFAEL: "EDITADO_POR_RAFAEL",
  RECUSADO_COM_MOTIVO: "RECUSADO_COM_MOTIVO"
};

export const MIN_OUTCOME_SAMPLE_SIZE = 5;

/**
 * Registra o desfecho de uma proposta e calcula o delta se houver edição.
 */
export function recordDecisionOutcome({
  tenant_id = "default",
  recommendation_id,
  domain = "RELACIONAMENTO",
  proposed_payload,
  proposed_text,
  outcome_type = OUTCOME_TYPES.ACEITO_INTEGRAL,
  final_payload = null,
  final_text = null,
  feedback_note = "",
  evidence_node_id = null
}) {
  if (!recommendation_id) {
    throw new Error("recommendation_id obrigatório");
  }

  const rawProp = proposed_payload !== undefined ? proposed_payload : (proposed_text || "");
  const rawFin = final_payload !== null ? final_payload : (final_text !== null ? final_text : rawProp);

  const propText = typeof rawProp === "string" ? rawProp : JSON.stringify(rawProp);
  const finText = typeof rawFin === "string" ? rawFin : JSON.stringify(rawFin);

  const delta = computeLexicalDelta(propText, finText, outcome_type);
  const id = randomUUID();
  const idempotency_key = `do:${tenant_id}:${recommendation_id}:${outcome_type}:${hashString(propText)}`;

  return {
    id,
    tenant_id,
    recommendation_id,
    domain,
    proposed_payload: typeof proposed_payload === "object" ? proposed_payload : { text: propText },
    outcome_type,
    final_payload: typeof final_payload === "object" ? final_payload : { text: finText },
    feedback_note: String(feedback_note || "").trim(),
    delta_analysis: delta,
    evidence_node_id,
    idempotency_key,
    created_at: new Date().toISOString()
  };
}

/**
 * Calcula a diferença léxica (Delta) entre o que a IA propôs e o que Rafael enviou (N23-11).
 */
export function computeLexicalDelta(proposed, final, outcomeType) {
  if (outcomeType === OUTCOME_TYPES.RECUSADO_COM_MOTIVO) {
    return {
      has_changes: true,
      edit_type: "TOTAL_REJECTION",
      summary: "Proposta rejeitada por decisão de Rafael."
    };
  }

  if (outcomeType === OUTCOME_TYPES.ACEITO_INTEGRAL || !final || proposed === final) {
    return {
      has_changes: false,
      edit_type: "NONE",
      summary: "Proposta aceita sem alterações."
    };
  }

  const pWords = String(proposed).split(/\s+/).filter(Boolean);
  const fWords = String(final).split(/\s+/).filter(Boolean);
  const lengthDiff = fWords.length - pWords.length;

  let edit_type = "MINOR_TWEAK";
  if (fWords.length <= Math.floor(pWords.length * 0.7)) {
    edit_type = "MADE_MORE_CONCISE";
  } else if (fWords.length >= Math.floor(pWords.length * 1.3)) {
    edit_type = "EXPANDED_DETAILS";
  } else if (Math.abs(lengthDiff) > 5) {
    edit_type = "SIGNIFICANT_RESTRUCTURING";
  }

  return {
    has_changes: true,
    edit_type,
    original_words_count: pWords.length,
    final_words_count: fWords.length,
    summary: `Texto ajustado por Rafael (${edit_type}).`
  };
}

/**
 * Calcula a métrica Decision Utility Rate (DUR).
 * Governança N23-11:
 * - Se outcomes estiver vazio ou for menor que a amostra mínima, retorna status 'NOT_ENOUGH_DATA'.
 * - Meta do Roadmap: >= 85%.
 */
export function calculateDecisionUtilityRate(outcomes = [], minSample = MIN_OUTCOME_SAMPLE_SIZE) {
  if (!Array.isArray(outcomes) || outcomes.length === 0) {
    return {
      status: "NOT_ENOUGH_DATA",
      total: 0,
      utility_rate_pct: null,
      dur_rate: 0,
      meets_target: false,
      reason: "Nenhum desfecho registrado",
      accepted_count: 0,
      edited_count: 0,
      rejected_count: 0,
      breakdown: { accepted: 0, edited: 0, rejected: 0 }
    };
  }

  const breakdown = countOutcomes(outcomes);

  if (outcomes.length < minSample) {
    return {
      status: "NOT_ENOUGH_DATA",
      total: outcomes.length,
      utility_rate_pct: null,
      dur_rate: 0,
      meets_target: false,
      reason: `Amostra insuficiente (${outcomes.length}/${minSample} mínimo)`,
      accepted_count: breakdown.accepted,
      edited_count: breakdown.edited,
      rejected_count: breakdown.rejected,
      breakdown
    };
  }

  const usefulCount = breakdown.accepted + breakdown.edited;
  const rate = (usefulCount / outcomes.length) * 100;

  return {
    status: "SUFFICIENT_SAMPLE",
    total: outcomes.length,
    utility_rate_pct: Number(rate.toFixed(2)),
    dur_rate: Number((rate / 100).toFixed(4)),
    meets_target: rate >= 85.0,
    accepted_count: breakdown.accepted,
    edited_count: breakdown.edited,
    rejected_count: breakdown.rejected,
    breakdown
  };
}

function countOutcomes(outcomes) {
  let accepted = 0;
  let edited = 0;
  let rejected = 0;

  for (const o of outcomes) {
    if (o.outcome_type === OUTCOME_TYPES.ACEITO_INTEGRAL) accepted++;
    else if (o.outcome_type === OUTCOME_TYPES.EDITADO_POR_RAFAEL) edited++;
    else if (o.outcome_type === OUTCOME_TYPES.RECUSADO_COM_MOTIVO) rejected++;
  }

  return { accepted, edited, rejected };
}

function hashString(str) {
  return createHash('sha256').update(String(str), 'utf8').digest('hex').slice(0, 16);
}

export const computeTextDelta = computeLexicalDelta;

export function calibrateConfidenceScore({ baseConfidence = 0.8, historicalOutcomes = [] } = {}) {
  // Calibração puramente de UX/utilidade para apresentação (nunca confiança de modelo/cálculo)
  const dur = calculateDecisionUtilityRate(historicalOutcomes, 1);
  if (dur.status === "NOT_ENOUGH_DATA" && (!historicalOutcomes || historicalOutcomes.length === 0)) return baseConfidence;
  const usefulCount = dur.breakdown.accepted + dur.breakdown.edited;
  const total = historicalOutcomes.length || 1;
  const rate = usefulCount / total;
  if (rate >= 0.85) return Math.min(1.0, Number((baseConfidence + 0.15).toFixed(2)));
  return Math.max(0.0, Number((baseConfidence - 0.25).toFixed(2)));
}