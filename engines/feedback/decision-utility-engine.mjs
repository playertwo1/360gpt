/**
 * engines/feedback/decision-utility-engine.mjs
 * Marco N2.3.3 — O Triângulo de Feedback e Matriz de Desfecho (Decision Utility Engine)
 * Rastreia a taxa de aceitação real das propostas da IA e calibra a confiança.
 */

export const OUTCOME_TYPES = {
  ACEITO_INTEGRAL: "ACEITO_INTEGRAL",
  EDITADO_POR_RAFAEL: "EDITADO_POR_RAFAEL",
  RECUSADO_COM_MOTIVO: "RECUSADO_COM_MOTIVO"
};

/**
 * Registra o desfecho de uma proposta e calcula o delta se houver edição.
 */
export function recordDecisionOutcome({
  recommendation_id,
  domain = "RELACIONAMENTO",
  proposed_text,
  outcome_type = OUTCOME_TYPES.ACEITO_INTEGRAL,
  final_text = null,
  feedback_note = ""
}) {
  const delta = computeTextDelta(proposed_text, final_text, outcome_type);

  return {
    id: `outcome-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recommendation_id,
    domain,
    proposed_text,
    outcome_type,
    final_text: final_text || proposed_text,
    feedback_note,
    delta_analysis: delta,
    created_at: new Date().toISOString()
  };
}

/**
 * Calcula a diferença (Delta) entre o que a IA propôs e o que Rafael enviou.
 */
export function computeTextDelta(proposed, final, outcomeType) {
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

  const pWords = proposed.split(/\s+/);
  const fWords = final.split(/\s+/);
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
 * Meta do Roadmap: >= 85%.
 */
export function calculateDecisionUtilityRate(outcomes = []) {
  if (outcomes.length === 0) {
    return {
      total: 0,
      utility_rate_pct: 100.0,
      meets_target: true,
      breakdown: { accepted: 0, edited: 0, rejected: 0 }
    };
  }

  let accepted = 0;
  let edited = 0;
  let rejected = 0;

  for (const o of outcomes) {
    if (o.outcome_type === OUTCOME_TYPES.ACEITO_INTEGRAL) accepted++;
    else if (o.outcome_type === OUTCOME_TYPES.EDITADO_POR_RAFAEL) edited++;
    else if (o.outcome_type === OUTCOME_TYPES.RECUSADO_COM_MOTIVO) rejected++;
  }

  const usefulCount = accepted + edited;
  const rate = (usefulCount / outcomes.length) * 100;

  return {
    total: outcomes.length,
    utility_rate_pct: Number(rate.toFixed(2)),
    meets_target: rate >= 85.0,
    breakdown: { accepted, edited, rejected }
  };
}

/**
 * Calibra a confiança (confidence_score) com base no histórico de aceitação.
 */
export function calibrateConfidenceScore({
  baseConfidence = 0.80,
  historicalOutcomes = []
}) {
  if (historicalOutcomes.length === 0) return baseConfidence;

  const { utility_rate_pct, total } = calculateDecisionUtilityRate(historicalOutcomes);

  if (total < 3) return baseConfidence;

  if (utility_rate_pct >= 90.0) {
    return Math.min(1.0, Number((baseConfidence + 0.15).toFixed(2)));
  } else if (utility_rate_pct < 70.0) {
    return Math.max(0.40, Number((baseConfidence - 0.25).toFixed(2)));
  }

  return baseConfidence;
}