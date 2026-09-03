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

export const AUTO_PROMOTION_ALLOWED_CATEGORIES = new Set([
  'STYLE_FORMATTING',
  'COMMUNICATION_CADENCE',
  'CONVERSATIONAL_PREFERENCE',
  'PRESENTATION_ORDER',
  'EXECUTIVE_SUMMARY_STYLE'
]);

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
  const scope = String(rule.scope || 'DOMAIN').toUpperCase().trim();
  const category = String(rule.category || '').toUpperCase().trim();
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

  // 1. Risco ALTO, conflito material ou escopo GLOBAL: NUNCA autopromove; SEMPRE requer MANUAL_REVIEW
  if (riskLevel === RISK_LEVELS.HIGH || hasConflict || scope === 'GLOBAL') {
    return {
      eligible_for_auto: false,
      promotion_mode: PROMOTION_MODES.MANUAL_REVIEW,
      score,
      riskLevel: riskLevel === RISK_LEVELS.LOW && scope === 'GLOBAL' ? RISK_LEVELS.HIGH : riskLevel,
      reason: hasConflict 
        ? 'Conflito com outra diretriz ativa' 
        : scope === 'GLOBAL'
          ? 'Escopo global exige revisão manual obrigatória de Rafael'
          : 'Classificação de risco elevado (exige validação de Rafael)',
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

  // 3. Regra de baixo risco com categoria na allowlist estrita, score alto e recorrência comprovada (>= 2): AUTOPROMOVE
  const isCategoryAllowedForAuto = AUTO_PROMOTION_ALLOWED_CATEGORIES.has(category);
  if (riskLevel === RISK_LEVELS.LOW && isCategoryAllowedForAuto && score >= 0.75 && frequency >= 2 && !layoutChanged) {
    return {
      eligible_for_auto: true,
      promotion_mode: PROMOTION_MODES.AUTO,
      score,
      riskLevel,
      reason: `Autopromoção contínua (score: ${score} >= 0.75, freq: ${frequency} >= 2, categoria ${category} em allowlist)`,
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 4. Caso contrário: permanece CANDIDATE ou encaminha para revisão manual
  return {
    eligible_for_auto: false,
    promotion_mode: score >= 0.50 ? PROMOTION_MODES.MANUAL_REVIEW : 'REJECTED_LOW_SCORE',
    score,
    riskLevel,
    reason: !isCategoryAllowedForAuto
      ? `Categoria ${category || 'N/A'} fora da allowlist de autopromoção (requer revisão manual)`
      : score >= 0.50 
        ? 'Aguardando maior recorrência ou validação' 
        : 'Score insuficiente para promoção',
    policy_version: PROMOTION_POLICY_VERSION
  };
}

export function determineRiskLevel(rule) {
  const text = (rule.learned_rule || '').toLowerCase();
  const category = (rule.category || '').toUpperCase().trim();
  const scope = (rule.scope || '').toUpperCase().trim();

  // 1. Termos e tópicos sensíveis de alto risco (fail-closed absoluto)
  const highRiskPatterns = [
    /cr[eé]dito/, /limite/, /taxa/, /juros/, /spread/, /desconto/, /margem/,
    /compliance/, /legal/, /jur[ií]dico/, /sigilo/, /privacidade/, /lgpd/, /reten[cç][aã]o/,
    /f[oó]rmula/, /pobj/, /pontua[cç][aã]o/, /oficial/, /normativ[ao]/,
    /autoriza[cç][aã]o/, /permiss[aã]o/, /acesso/, /credencial/, /token/, /segredo/,
    /efeito externo/, /terceir[ao]s?/, /dispensar/, /sem an[aá]lise/, /bypass/
  ];

  for (const pattern of highRiskPatterns) {
    if (pattern.test(text) || pattern.test(category.toLowerCase())) {
      return RISK_LEVELS.HIGH;
    }
  }

  // 2. Escopo GLOBAL é de alto impacto sistêmico
  if (scope === 'GLOBAL') {
    return RISK_LEVELS.HIGH;
  }

  // 3. Allowlist estrita de categorias positivas para LOW
  if (AUTO_PROMOTION_ALLOWED_CATEGORIES.has(category)) {
    return RISK_LEVELS.LOW;
  }

  // 4. Categorias fora da allowlist positiva não são elegíveis para LOW (fail-closed)
  return RISK_LEVELS.MEDIUM;
}

export function sha256Hex(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return createHash('sha256').update(str, 'utf8').digest('hex');
}