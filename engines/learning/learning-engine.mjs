/**
 * engines/learning/learning-engine.mjs
 * Marco N2.3 — Learning Engine Determinístico de Autopromoção Controlada
 * 
 * Regra de Governança Estrita (Quarta Remediação):
 * - Modo AUTO NÃO aceita texto livre arbitrário; restrito estritamente a preferências estruturadas enumeradas.
 * - Categorias e preferências estruturadas: RESPONSE_LENGTH, TABLE_PREFERENCE, TONE, SECTION_ORDER.
 * - Texto de contexto gerado exclusivamente por templates versionados e auditáveis.
 * - OWNER_EXPLICIT exige evento soberano autenticado de Rafael (hash, event_id, owner_id).
 * - Qualquer menção a efeitos externos, credenciais, fórmulas, retenção ou alçadas é classificada como HIGH RISK (fail-closed).
 */

import { createHash } from 'node:crypto';

export const PROMOTION_POLICY_VERSION = 'v2.3.1-enumerated-preferences';

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

export const STRUCTURED_PREFERENCES = {
  RESPONSE_LENGTH: new Set(['COMPACT', 'BALANCED', 'DETAILED']),
  TABLE_PREFERENCE: new Set(['TABLE_FIRST', 'TEXT_FIRST']),
  TONE: new Set(['DIRECT', 'EXECUTIVE', 'EXPLANATORY']),
  SECTION_ORDER: new Set(['PERFORMANCE_FIRST', 'ACCOUNT_FIRST', 'GAPS_FIRST'])
};

export const PREFERENCE_TEMPLATES = {
  'RESPONSE_LENGTH:COMPACT': 'Apresentar respostas e pareceres em formato compacto e direto ao ponto.',
  'RESPONSE_LENGTH:BALANCED': 'Apresentar respostas em formato equilibrado com resumo executivo e métricas principais.',
  'RESPONSE_LENGTH:DETAILED': 'Apresentar respostas detalhadas com todas as evidências e tabelas completas.',
  'TABLE_PREFERENCE:TABLE_FIRST': 'Exibir dados quantitativos e tabelas antes de explicações textuais.',
  'TABLE_PREFERENCE:TEXT_FIRST': 'Exibir síntese executiva textual antes das tabelas de apoio.',
  'TONE:DIRECT': 'Utilizar tom executivo direto, claro e sem rodeios.',
  'TONE:EXECUTIVE': 'Utilizar tom formal executivo focado em decisões de gestão.',
  'TONE:EXPLANATORY': 'Utilizar tom didático e explicativo com fundamentação analítica.',
  'SECTION_ORDER:PERFORMANCE_FIRST': 'Organizar parecer destacando indicadores e metas de Performance primeiro.',
  'SECTION_ORDER:ACCOUNT_FIRST': 'Organizar parecer destacando contas e oportunidades prioritárias primeiro.',
  'SECTION_ORDER:GAPS_FIRST': 'Organizar parecer destacando lacunas críticas e pontos a recuperar primeiro.'
};

/**
 * Renderiza o texto formal a partir de uma preferência estruturada usando template versionado.
 */
export function renderStructuredPreferenceText(preferenceType, preferenceValue) {
  const key = `${preferenceType}:${preferenceValue}`;
  const template = PREFERENCE_TEMPLATES[key];
  if (!template) {
    throw new Error(`PREFERENCIA_ESTRUTURADA_INVALIDA: ${key} nao possui template versionado`);
  }
  return template;
}

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
  const frequencyWeight = Math.min(1.5, 0.7 + (Math.log2(Math.max(1, frequency)) * 0.3));
  const recencyWeight = Math.max(0.5, Math.exp(-0.015 * Math.max(0, recencyDays)));
  const outcomeWeight = Math.max(0.2, Math.min(1.0, observedOutcome));
  const feedbackWeight = Math.max(0.1, Math.min(2.5, explicitFeedback));

  let baseScore = confidence * frequencyWeight * recencyWeight * outcomeWeight * feedbackWeight;

  let penalties = 0;
  if (hasConflict) penalties += 0.40;
  if (sampleSize < 3) penalties += 0.20;
  if (layoutChanged) penalties += 0.25;
  if (scope === 'GLOBAL') penalties += 0.35;
  if (riskLevel === RISK_LEVELS.HIGH) penalties += 0.40;

  const finalScore = Math.max(0.000, Math.min(1.000, baseScore - penalties));
  return Number(finalScore.toFixed(3));
}

/**
 * Avalia a elegibilidade de uma regra para Autopromoção vs Revisão Manual.
 * Salvaguarda Estrita (Q4-N23-01): AUTO só aceita preferências estruturadas enumeradas.
 */
export function evaluateCandidateRule({
  rule,
  frequency = 1,
  recencyDays = 0,
  observedOutcome = 0.85,
  explicitFeedback = 1.0,
  hasConflict = false,
  sampleSize = 5,
  layoutChanged = false,
  ownerEvent = null
}) {
  const riskLevel = determineRiskLevel(rule);
  const scope = String(rule.scope || 'DOMAIN').toUpperCase().trim();
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

  // 1. Conflito material: SEMPRE requer MANUAL_REVIEW
  if (hasConflict) {
    return {
      eligible_for_auto: false,
      promotion_mode: PROMOTION_MODES.MANUAL_REVIEW,
      score,
      riskLevel: RISK_LEVELS.HIGH,
      reason: 'Conflito com outra diretriz ativa',
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 2. Feedback explícito de Rafael com evento soberano autenticado (Q4-N23-07)
  const isOwnerAuthenticated = Boolean(
    ownerEvent && 
    ownerEvent.owner_id === 'rafael' && 
    ownerEvent.source_event_id && 
    /^[0-9a-f]{64}$/i.test(ownerEvent.event_hash || '')
  );

  if (explicitFeedback >= 1.5 && isOwnerAuthenticated) {
    return {
      eligible_for_auto: true,
      promotion_mode: PROMOTION_MODES.OWNER_EXPLICIT,
      score,
      riskLevel,
      reason: 'Orientação explícita com evento soberano autenticado de Rafael',
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 3. Risco ALTO ou escopo GLOBAL sem aprovação de Rafael: NUNCA autopromove; requer MANUAL_REVIEW
  if (riskLevel === RISK_LEVELS.HIGH || scope === 'GLOBAL') {
    return {
      eligible_for_auto: false,
      promotion_mode: PROMOTION_MODES.MANUAL_REVIEW,
      score,
      riskLevel: RISK_LEVELS.HIGH,
      reason: scope === 'GLOBAL'
        ? 'Escopo global exige revisão manual obrigatória de Rafael'
        : 'Classificação de risco elevado ou termos proibidos para modo autônomo',
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 3. Autopromoção (AUTO) — EXCLUSIVA para preferências estruturadas enumeradas (Q4-N23-01)
  const prefType = rule.preference_type;
  const prefValue = rule.preference_value;
  const isStructuredPreference = prefType && 
    STRUCTURED_PREFERENCES[prefType] && 
    STRUCTURED_PREFERENCES[prefType].has(prefValue);

  if (!isStructuredPreference) {
    return {
      eligible_for_auto: false,
      promotion_mode: PROMOTION_MODES.MANUAL_REVIEW,
      score,
      riskLevel: RISK_LEVELS.HIGH,
      reason: 'Bypass semântico bloqueado: modo AUTO restrito estritamente a preferências estruturadas enumeradas. Texto livre requer autorização soberana de Rafael.',
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // Se for preferência estruturada válida de baixo risco com score alto e frequência >= 2:
  if (riskLevel === RISK_LEVELS.LOW && score >= 0.75 && frequency >= 2 && !layoutChanged) {
    const canonicalText = renderStructuredPreferenceText(prefType, prefValue);
    return {
      eligible_for_auto: true,
      promotion_mode: PROMOTION_MODES.AUTO,
      score,
      riskLevel: RISK_LEVELS.LOW,
      canonical_rule_text: canonicalText,
      reason: `Autopromoção contínua de preferência estruturada (score: ${score} >= 0.75, freq: ${frequency} >= 2)`,
      policy_version: PROMOTION_POLICY_VERSION
    };
  }

  // 4. Caso contrário: permanece CANDIDATE ou encaminha para revisão manual
  return {
    eligible_for_auto: false,
    promotion_mode: score >= 0.50 ? PROMOTION_MODES.MANUAL_REVIEW : 'REJECTED_LOW_SCORE',
    score,
    riskLevel,
    reason: score >= 0.50 
      ? 'Aguardando maior recorrência ou validação' 
      : 'Score insuficiente para promoção',
    policy_version: PROMOTION_POLICY_VERSION
  };
}

/**
 * Classifica o nível de risco de forma estrita e fail-closed.
 */
export function determineRiskLevel(rule) {
  const text = (rule.learned_rule || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const category = (rule.category || '').toUpperCase().trim();
  const scope = (rule.scope || '').toUpperCase().trim();

  // Padrões estritos de alto risco (fail-closed absoluto contra bypasses semânticos)
  const highRiskPatterns = [
    /credito/, /limite/, /taxa/, /juros/, /spread/, /desconto/, /margem/, /alvanc/,
    /compliance/, /legal/, /juridico/, /sigilo/, /privacidade/, /lgpd/,
    /retencao/, /nunca apague/, /guarde.*sempre/, /nao apagar/, /etern/,
    /formula/, /pobj/, /pontuacao/, /oficial/, /normativ/, /regra de ponto/, /mudar ponto/,
    /autorizacao/, /permissao/, /acesso/, /credencial/, /token/, /segredo/, /chave/, /api key/, /compartilhe.*chave/,
    /alcada/, /irrestrita/, /qualquer pessoa/, /sem autorizacao/,
    /efeito externo/, /mensagem.*cliente/, /envie.*automaticamente/, /sem me perguntar/, /whatsapp/, /disparo/,
    /dispensar/, /sem analise/, /bypass/
  ];

  for (const pattern of highRiskPatterns) {
    if (pattern.test(text) || pattern.test(category.toLowerCase())) {
      return RISK_LEVELS.HIGH;
    }
  }

  if (scope === 'GLOBAL') {
    return RISK_LEVELS.HIGH;
  }

  // Apenas preferências estruturadas reconhecidas podem ser LOW
  if (rule.preference_type && STRUCTURED_PREFERENCES[rule.preference_type]?.has(rule.preference_value)) {
    return RISK_LEVELS.LOW;
  }

  // Qualquer texto livre que não seja preferência estruturada é no mínimo MEDIUM ou HIGH
  return RISK_LEVELS.HIGH;
}

export function sha256Hex(data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return createHash('sha256').update(str, 'utf8').digest('hex');
}