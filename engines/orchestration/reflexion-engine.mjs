/**
 * engines/orchestration/reflexion-engine.mjs
 * Marco N2.3.4 — Reflexion Engine e Ciclo de Aprendizado Semanal (WF-104)
 * Governança N23-12, N23-13, N23-14:
 * - O ciclo gera EXCLUSIVAMENTE candidatas (status: CANDIDATE).
 * - Exige recorrência mínima (>= 2) ou correção explícita de Rafael.
 * - Produz card no Telegram contendo os IDs reais das candidatas para aprovação expressa de Rafael.
 * - Amostra insuficiente não gera diretrizes artificiais.
 */

import { randomUUID } from "node:crypto";
import { calculateDecisionUtilityRate, MIN_OUTCOME_SAMPLE_SIZE } from "../feedback/decision-utility-engine.mjs";
import { createSemanticRule, RULE_STATUS, RULE_SCOPES } from "../knowledge/semantic-memory-engine.mjs";

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
  const durReport = calculateDecisionUtilityRate(outcomes, minSample);

  // Se a amostra for insuficiente, encerra com aviso limpo
  if (durReport.status === "NOT_ENOUGH_DATA") {
    return {
      success: true,
      insufficient_sample: true,
      week_reference: weekReference,
      total_analyzed: outcomes.length,
      dur_report: durReport,
      candidates_proposed: [],
      telegram_card: formatInsufficientSampleTelegramCard(outcomes.length, minSample, weekReference)
    };
  }

  // Agrupa edições e rejeições para identificar padrões recorrentes (N23-13)
  const patternMap = new Map();

  for (const item of outcomes) {
    if (item.outcome_type === "EDITADO_POR_RAFAEL" || item.outcome_type === "RECUSADO_COM_MOTIVO") {
      const editType = item.delta_analysis?.edit_type || "UNKNOWN";
      const domain = item.domain || "GERAL";
      const key = `${domain}:${editType}`;

      const existing = patternMap.get(key) || {
        domain,
        editType,
        count: 0,
        examples: [],
        feedbackNotes: []
      };

      existing.count++;
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

  const candidateRules = [];

  // Critério de Recorrência Estrita: >= 2 ocorrências ou nota explícita de Rafael (N23-13)
  for (const [, pattern] of patternMap.entries()) {
    if (pattern.count >= 2 || pattern.feedbackNotes.length > 0) {
      const ruleText = deriveRuleText(pattern);
      if (ruleText) {
        const candidate = createSemanticRule({
          tenant_id,
          owner_id,
          category: `APRENDIZADO_${pattern.domain}`,
          scope: RULE_SCOPES.GLOBAL,
          target_ref: "GLOBAL",
          learned_rule: ruleText,
          source_observation: `Detectada recorrência de ajuste (${pattern.count}x no domínio ${pattern.domain}) na semana ${weekReference}`,
          confidence_score: Math.min(0.95, 0.75 + pattern.count * 0.05),
          status: RULE_STATUS.CANDIDATE // NUNCA PROMOTED
        });

        candidateRules.push(candidate);
      }
    }
  }

  const telegramCard = formatWeeklyTelegramCard({
    durReport,
    candidates: candidateRules,
    weekReference
  });

  return {
    success: true,
    insufficient_sample: false,
    week_reference: weekReference,
    total_analyzed: outcomes.length,
    dur_report: durReport,
    candidates_proposed: candidateRules,
    telegram_card: telegramCard
  };
}

function deriveRuleText(pattern) {
  if (pattern.feedbackNotes.length > 0) {
    return `Orientação explícita de Rafael: ${pattern.feedbackNotes[0]}`;
  }
  if (pattern.editType === "MADE_MORE_CONCISE") {
    return `Para o domínio ${pattern.domain}, gerar textos mais objetivos e curtos (Rafael reduziu o tamanho das propostas).`;
  }
  if (pattern.editType === "EXPANDED_DETAILS") {
    return `Para o domínio ${pattern.domain}, incluir maior detalhamento operacional da proposta.`;
  }
  if (pattern.editType === "TOTAL_REJECTION") {
    return `Revisar estratégia de abordagem em ${pattern.domain}, evitando argumentos recusados.`;
  }
  return `Ajustar tom e especificidade no domínio ${pattern.domain} conforme padrão de edições de Rafael.`;
}

function formatInsufficientSampleTelegramCard(count, minSample, week) {
  return (
    `🧠 *Balanço Semanal de Aprendizado 360 (WF-104)*\n` +
    `📅 *Semana:* ${week}\n\n` +
    `• *Amostra insuficiente na semana:* ${count} registros observados (Mínimo: ${minSample}).\n` +
    `• Nenhuma diretriz foi inferida automaticamente para preservar a integridade das decisões.\n` +
    `• O motor continuará acumulando desfechos para o próximo ciclo.`
  );
}

function formatWeeklyTelegramCard({ durReport, candidates, weekReference }) {
  const durLine = durReport.utility_rate_pct !== null
    ? `• *Taxa de Utilidade Decisória (DUR):* ${durReport.utility_rate_pct}% (${durReport.breakdown.accepted} aceitos, ${durReport.breakdown.edited} editados, ${durReport.breakdown.rejected} recusados)`
    : `• *DUR:* Sem dados suficientes`;

  let candidatesText = "";
  if (candidates.length === 0) {
    candidatesText = `• Nenhuma divergência recorrente detectada. Comportamento estável!\n`;
  } else {
    candidatesText = `• *Diretrizes Candidatas para sua Avaliação:*\n\n`;
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      candidatesText += `  ${i + 1}. \`${c.id.slice(0, 8)}\` — ${c.learned_rule}\n`;
      candidatesText += `     ↳ Para aprovar: \`/aprovardiretriz ${c.id.slice(0, 8)}\`\n\n`;
    }
    candidatesText += `💡 Para aprovar todas as candidatas: \`/aprovar_todas\`\n`;
  }

  return (
    `🧠 *Balanço Semanal de Aprendizado 360 (WF-104)*\n` +
    `📅 *Semana:* ${weekReference}\n\n` +
    `${durLine}\n\n` +
    `${candidatesText}` +
    `_Nenhuma diretriz opera sem sua aprovação explícita (Governança N2.3)._`
  );
}