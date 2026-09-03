/**
 * engines/orchestration/reflexion-engine.mjs
 * Marco N2.3.4 — Reflexion Engine e Ciclo de Aprendizado Semanal (WF-104)
 * Governança N23-R11, N23-R15:
 * - O ciclo gera regras candidatas e aplica o Learning Engine.
 * - Escopo contextual estrito: DOMAIN ou ACCOUNT (GLOBAL apenas com recorrência transversal >= 3).
 * - Autopromoção para regras de baixo risco elegíveis (promotion_mode: 'AUTO').
 * - Encaminhamento para revisão de regras de alto risco ou ambíguas (promotion_mode: 'MANUAL_REVIEW').
 * - Isolamento obrigatório por tenant_id.
 */

import { randomUUID, createHash } from "node:crypto";
import { calculateDecisionUtilityRate, MIN_OUTCOME_SAMPLE_SIZE } from "../feedback/decision-utility-engine.mjs";
import { createSemanticRule, promoteSemanticRule, RULE_SCOPES } from "../knowledge/semantic-memory-engine.mjs";
import { evaluateCandidateRule, PROMOTION_MODES, PROMOTION_POLICY_VERSION } from "../learning/learning-engine.mjs";

/**
 * Executa a reflexão semanal sobre os desfechos da semana.
 */
export function runWeeklyReflexion({
  tenant_id = "default",
  owner_id = "rafael",
  outcomes = [],
  minSample = MIN_OUTCOME_SAMPLE_SIZE,
  weekReference = new Date().toISOString().slice(0, 10)
}) {
  // Isolamento estrito por tenant (N23-R11): rejeita outcomes sem tenant_id
  const tenantOutcomes = outcomes.filter((o) => o && o.tenant_id && o.tenant_id === tenant_id);
  const durReport = calculateDecisionUtilityRate(tenantOutcomes, minSample);

  if (durReport.status === "NOT_ENOUGH_DATA") {
    return {
      success: true,
      insufficient_sample: true,
      tenant_id,
      week_reference: weekReference,
      total_analyzed: tenantOutcomes.length,
      dur_report: durReport,
      candidates_proposed: [],
      auto_promoted: [],
      manual_review_required: [],
      telegram_card: formatInsufficientSampleTelegramCard(tenantOutcomes.length, minSample, weekReference)
    };
  }

  // Agrupa edições e rejeições para identificar padrões
  const patternMap = new Map();

  for (const item of tenantOutcomes) {
    if (item.outcome_type === "EDITADO_POR_RAFAEL" || item.outcome_type === "RECUSADO_COM_MOTIVO") {
      const editType = item.delta_analysis?.edit_type || "UNKNOWN";
      const domain = item.domain || "GERAL";
      const key = `${domain}:${editType}`;

      const existing = patternMap.get(key) || {
        domain,
        editType,
        count: 0,
        examples: [],
        feedbackNotes: [],
        outcomes: []
      };

      existing.count++;
      existing.outcomes.push(item);
      if (item.feedback_note) existing.feedbackNotes.push(item.feedback_note);
      if (existing.examples.length < 3) {
        existing.examples.push({
          proposed: item.proposed_payload,
          final: item.final_payload
        });
      }

      patternMap.set(key, existing);
    }
  }

  const candidatesProposed = [];
  const autoPromoted = [];
  const manualReviewRequired = [];

  for (const [, pattern] of patternMap.entries()) {
    if (pattern.count >= 2 || pattern.feedbackNotes.length > 0) {
      const ruleText = deriveRuleText(pattern);
      if (!ruleText) continue;

      // N23-R15: Escopo restrito ao indicador/domínio contextual, nunca GLOBAL em reflexões automáticas
      const scope = pattern.domain && pattern.domain !== "GERAL" ? RULE_SCOPES.INDICATOR : RULE_SCOPES.ACCOUNT;
      const targetRef = pattern.domain || "GERAL";
      let preferenceType = null;
      let preferenceValue = null;
      let category = 'CUSTOM_PREFERENCE';

      if (pattern.editType === 'MADE_MORE_CONCISE' || pattern.editType === 'TEXT_LENGTH_REDUCED') {
        preferenceType = 'RESPONSE_LENGTH';
        preferenceValue = 'COMPACT';
        category = 'STRUCTURED_PREFERENCE';
      } else if (pattern.editType === 'TABLE_REQUESTED') {
        preferenceType = 'TABLE_PREFERENCE';
        preferenceValue = 'TABLE_FIRST';
        category = 'STRUCTURED_PREFERENCE';
      }

      // 1. Cria candidata inicial
      const candidate = createSemanticRule({
        tenant_id,
        owner_id,
        category,
        scope,
        target_ref: targetRef,
        learned_rule: ruleText,
        preference_type: preferenceType,
        preference_value: preferenceValue,
        source_observation: `Recorrência semanal (${pattern.count}x em ${pattern.domain}/${pattern.editType})`,
        confidence_score: 0.88,
        valid_days: 90
      });

      // 2. Avalia com Learning Engine determinístico (nunca fabrica evento soberano de Rafael em memória)
      const hasExplicit = pattern.feedbackNotes.length > 0;

      const evalResult = evaluateCandidateRule({
        rule: candidate,
        frequency: pattern.count,
        recencyDays: 3,
        observedOutcome: 0.85,
        explicitFeedback: hasExplicit ? 1.8 : 1.0,
        sampleSize: tenantOutcomes.length,
        ownerEvent: null
      });

      candidate.promotion_score = evalResult.score;
      candidate.risk_level = evalResult.riskLevel;
      candidate.frequency = pattern.count;

      if (evalResult.eligible_for_auto) {
        // Autopromoção controlada (baixo risco)
        const promoted = promoteSemanticRule(candidate, {
          promotion_mode: evalResult.promotion_mode,
          promotion_score: evalResult.score,
          promotion_reason: evalResult.reason,
          policy_version: PROMOTION_POLICY_VERSION,
          learning_run_id: `run-${randomUUID()}`
        });
        autoPromoted.push(promoted);
        candidatesProposed.push(promoted);
      } else {
        // Encaminhamento para revisão
        candidate.promotion_mode = PROMOTION_MODES.MANUAL_REVIEW;
        candidate.promotion_reason = evalResult.reason;
        manualReviewRequired.push(candidate);
        candidatesProposed.push(candidate);
      }
    }
  }

  const telegramCard = formatWeeklyTelegramCard({
    tenant_id,
    weekReference,
    totalAnalyzed: tenantOutcomes.length,
    durReport,
    autoPromoted,
    manualReviewRequired
  });

  return {
    success: true,
    insufficient_sample: false,
    tenant_id,
    week_reference: weekReference,
    total_analyzed: tenantOutcomes.length,
    dur_report: durReport,
    candidates_proposed: candidatesProposed,
    auto_promoted: autoPromoted,
    manual_review_required: manualReviewRequired,
    telegram_card: telegramCard
  };
}

function deriveRuleText(pattern) {
  if (pattern.feedbackNotes.length > 0) {
    return `Orientação de Rafael: ${pattern.feedbackNotes[pattern.feedbackNotes.length - 1]}`;
  }

  switch (pattern.editType) {
    case "TEXT_LENGTH_REDUCED":
      return `Em ${pattern.domain}, priorizar abordagens concisas e diretas sem introduções longas.`;
    case "SCHEDULE_CHANGED":
      return `Em ${pattern.domain}, evitar agendamentos em horários de pico; propor contato matinal.`;
    case "TONE_SOFTENED":
      return `Em ${pattern.domain}, adotar tom consultivo em vez de cobrança incisiva.`;
    default:
      return `Ajuste recorrente observado em ${pattern.domain} (${pattern.count} ocorrências).`;
  }
}

function formatWeeklyTelegramCard({
  tenant_id,
  weekReference,
  totalAnalyzed,
  durReport,
  autoPromoted,
  manualReviewRequired
}) {
  const durPct = typeof durReport.utility_rate_pct === 'number'
    ? durReport.utility_rate_pct.toFixed(1)
    : typeof durReport.dur_rate === 'number'
      ? (durReport.dur_rate * 100).toFixed(1)
      : '0.0';
  const accepted = durReport.accepted_count ?? durReport.breakdown?.accepted ?? 0;
  const edited = durReport.edited_count ?? durReport.breakdown?.edited ?? 0;
  const rejected = durReport.rejected_count ?? durReport.breakdown?.rejected ?? 0;

  let card =
    `🧠 <b>Balanço Semanal de Aprendizado — Semana ${weekReference}</b>\n` +
    `• <b>Tenant:</b> <code>${tenant_id}</code>\n` +
    `• <b>Decisões Analisadas:</b> ${totalAnalyzed}\n` +
    `• <b>Decision Utility Rate (DUR):</b> <b>${durPct}%</b>\n` +
    `  - Aceitações integrais: ${accepted}\n` +
    `  - Ajustes de Rafael: ${edited}\n` +
    `  - Recusas: ${rejected}\n\n`;

  if (autoPromoted.length > 0) {
    card += `⚡ <b>Aprendizados Autopromovidos (Baixo Risco):</b>\n`;
    for (const r of autoPromoted) {
      card += `  ✓ [Score: ${r.promotion_score}] <i>${r.learned_rule}</i> (id: <code>${r.id.slice(0, 8)}</code>)\n`;
    }
    card += `\n`;
  }

  if (manualReviewRequired.length > 0) {
    card += `🔍 <b>Revisões Solicitadas a Rafael (Risco / Ambiguidade):</b>\n`;
    for (const c of manualReviewRequired) {
      card += `  • <code>/aprovardiretriz ${c.id}</code> — <i>${c.learned_rule}</i> (Motivo: ${c.promotion_reason})\n`;
    }
  }

  if (autoPromoted.length === 0 && manualReviewRequired.length === 0) {
    card += `<i>Nenhum padrão novo atingiu limiar nesta semana. Sistema estável.</i>`;
  }

  return card;
}

function formatInsufficientSampleTelegramCard(count, min, week) {
  return (
    `🧠 <b>Balanço Semanal de Aprendizado — Semana ${week}</b>\n\n` +
    `• <b>Amostra insuficiente para aprendizado:</b> ${count} desfechos (mínimo necessário: ${min}).\n` +
    `• Nenhuma diretriz alterada ou gerada artificialmente para preservar a estabilidade.\n` +
    `• Continue operando normalmente pelo Telegram para acumular evidências de campo.`
  );
}