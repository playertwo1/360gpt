/**
 * engines/learning/learning-engine.mjs
 * Marco N2.3 — Learning Engine Determinístico de Autopromoção Controlada
 * 
 * Regra de Governança de Rafael:
 * - Regras aprendidas nascem obrigatoriamente como CANDIDATE.
 * - Aprendizado reversível e de baixo risco com score elevado é promovido automaticamente (promotion_mode = 'AUTO').
 * - Casos ambíguos, conflitantes, com amostra pequena ou de alto risco exigem revisão (promotion_mode = 'MANUAL_REVIEW').
 * - Feedback explícito de Rafael recebe peso superior a inferências silenciosas.
 * - Score: confidence * frequency_weight * recency_weight * outcome_weight * feedback_weight - penalties.
 */

import { createHash } from 'node:crypto';

export const PROMOTION_POLICY_VERSION = 'v2.3.0-controlled-autopromote';

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export const PROMOTION_MODES = {
  AUTO: 'AUTO',
  OWNER_EXPLICIT: 'OWNER_EXPLICIT',
  MANUAL_REVIEW: 'MANUAL_REVIEW'
};

/**
 * Calcula o score de aprendizado determinístico considerando a fórmula oficial:
 * score = confidence * frequency * recency * observed_outcome * explicit_feedback - penalties
 */
export function calculateLearningScore({
  confidence = 0.85,
  frequency = 1,
  recencyDays = 0,
  observedOutcome = 0.8,
  explicitFeedback = 1.0,
  hasConflict = false,
  sampleSize = 5,
  layoutChanged = false,
  scope = 'DOMAIN',
  riskLevel = RISK_LEVELS.LOW
}) {
  // 1. Fator de Frequência: saturação logarítmica suave (mínimo 1 ocorrência)
  const frequencyWeight = Math.min(1.5, 0.7 + (Math.log2(Math.max(1, frequency)) * 0.3));

  // 2. Fator de Recência: decaimento suave para eventos mais antigos que 30 dias
  const recencyWeight = Math.max(0.5, Math.exp(-0.015 * Math.max(0, recencyDays)));

  // 3. Fator de Desfecho Observado (0.0 a 1.0)
  const outcomeWeight = Math.max(0.2, Math.min(1.0, observedOutcome));

  // 4. Feedback Explícito de Rafael: peso de alavancagem superior
  const feedbackWeight = Math.max(0.1, Math.min(2.5, explicitFeedback));

  // Produto base
  let baseScore = confidence * frequencyWeight * recencyWeight * outcomeWeight * feedbackWeight;

  // Penalidades determinísticas
  let penalties = 0;
  if (hasConflict) penalties += 0.40;
  if (sampleSize < 3) penalties += 0.20;
  if (layoutChanged) penalties += 0.25;
  if (scope === 'GLOBAL' && frequency < 3 && explicitFeedback < 1.5) penalties += 0.25;
  if (riskLevel === RISK_LEVELS.HIGH) penalties += 0.35;

  const finalScore = Math.max(0.000, Math.min(1.000, baseScore - penalties));
  return Number(finalScore.toFixed(3));
}

/**
 * Avalia a elegibilidade de uma regra para Autopromoção vs Revisão Manual.
 */
export function evaluateCandidateRule({
  rule,
  frequency = 1,
  recencyDays = 0,
  observedOutcome = 0.85,
  explicitFeedback = 1.0,
  hasConflict = false,
  sampleSize = 5,
  layoutChanged = false
}) {
  const riskLevel = determineRiskLevel(rule);
  const scope = rule.scope || 'DOMAIN';
  const confidence = Number(rule.confidence_score || 0.85);

  const score = calculateLearningScore({
    confidence,
    frequency,
    recencyDays,
    observedOutcome,
    explicitFeedback,
    hasConflict,
    sampleSize,
    layoutChanged,
    scope,
    riskLevel
  });

  // 1. Risco ALTO ou conflito material: NUNCA autopromove; SEMPRE requer MANUAL_REVIEW
  if (riskLevel === RISK_LEVELS.HIGH || hasConflict) {
    return {
      eligible_for_auto: false,
      promotion_mode: PROMOTION_MODES.MANUAL_REVIEW,
      score,
      riskLevel,
      reason: hasConflict ? 'Conflito com outra diretriz ativa' : 'Classificação de risco elevado (exige validação de Rafael)',
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 2. Feedback explícito de aprovação de Rafael: elegível direto para OWNER_EXPLICIT
  if (explicitFeedback >= 1.5) {
    return {
      eligible_for_auto: true,
      promotion_mode: PROMOTION_MODES.OWNER_EXPLICIT,
      score,
      riskLevel,
      reason: 'Orientação explícita de Rafael validada',
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 3. Regra de baixo risco com score alto e recorrência comprovada (>= 2): AUTOPROMOVE
  if (riskLevel === RISK_LEVELS.LOW && score >= 0.75 && frequency >= 2 && !layoutChanged) {
    return {
      eligible_for_auto: true,
      promotion_mode: PROMOTION_MODES.AUTO,
      score,
      riskLevel,
      reason: `Autopromoção contínua (score: ${score} >= 0.75, freq: ${frequency} >= 2, risco baixo)`,
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 4. Caso contrário: permanece CANDIDATE ou encaminha para revisão
  return {
    eligible_for_auto: false,
    promotion_mode: score >= 0.50 ? PROMOTION_MODES.MANUAL_REVIEW : 'REJECTED_LOW_SCORE',
    score,
    riskLevel,
    reason: score >= 0.50 ? 'Aguardando maior recorrência ou validação' : 'Score insuficiente para promoção',
    policy_version: PROMOTION_POLICY_VERSION
  };
}

function determineRiskLevel(rule) {
  const text = (rule.learned_rule || '').toLowerCase();
  const category = (rule.category || '').toUpperCase();

  if (
    category.includes('CREDITO') ||
    category.includes('COMPLIANCE') ||
    category.includes('LEGAL') ||
    text.includes('limite') ||
    text.includes('taxa') ||
    text.includes('juridico') ||
    text.includes('aprovado sem analise') ||
    text.includes('dispensar comprovante')
  ) {
    return RISK_LEVELS.HIGH;
  }

  if (
    category.includes('FINANCEIRO') ||
    text.includes('telefone') ||
    text.includes('desconto')
  ) {
    return RISK_LEVELS.MEDIUM;
  }

  return RISK_LEVELS.LOW;
}

export function sha256Hex(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return createHash('sha256').update(str, 'utf8').digest('hex');
}