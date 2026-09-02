/**
 * engines/orchestration/reflexion-engine.mjs
 * Marco N2.3.4 — Workflow Semanal de Reflexão e Síntese (WF-104 — Reflexion Engine)
 * Roda de forma assíncrona (sextas às 18h) para resumir lições da semana sem ruído operacional.
 */

import { OUTCOME_TYPES, calculateDecisionUtilityRate } from "../feedback/decision-utility-engine.mjs";

/**
 * Executa a reflexão semanal sobre os desfechos e correções de Rafael.
 */
export function runWeeklyReflection({
  outcomes = [],
  minRecurrence = 2,
  weekLabel = "Semana Atual"
}) {
  const { utility_rate_pct, total, breakdown } = calculateDecisionUtilityRate(outcomes);

  // Agrupar motivos de recusa ou edição para extrair lições recorrentes
  const lessons = [];
  const feedbackCounts = {};

  for (const o of outcomes) {
    if (o.feedback_note && o.feedback_note.trim()) {
      const note = o.feedback_note.trim();
      feedbackCounts[note] = (feedbackCounts[note] || 0) + 1;
    }
  }

  // Identificar lições com recorrência >= minRecurrence ou lição explícita
  let lessonId = 1;
  for (const [note, count] of Object.entries(feedbackCounts)) {
    if (count >= minRecurrence || note.toLowerCase().includes("preferir") || note.toLowerCase().includes("não")) {
      lessons.push({
        id: `lesson-${lessonId++}`,
        topic: note,
        recurrence: count,
        recommended_action: "PROMOVER_A_DIRETRIZ_PERMANENTE",
        confidence: count >= 2 ? 0.95 : 0.85
      });
    }
  }

  return {
    week: weekLabel,
    total_proposals: total,
    utility_rate_pct,
    breakdown,
    meets_target: utility_rate_pct >= 85.0,
    candidate_lessons: lessons,
    created_at: new Date().toISOString()
  };
}

/**
 * Formata o Card de Reflexão Semanal para o Telegram de Rafael.
 */
export function formatWeeklyReflexionTelegram(reflection) {
  let lessonsBlock = "• <i>Nenhum padrão crítico de correção identificado nesta semana.</i>";

  if (reflection.candidate_lessons.length > 0) {
    lessonsBlock = reflection.candidate_lessons
      .map(
        (l, i) =>
          `${i + 1}. <b>${l.topic}</b> (Observado ${l.recurrence}x) — <code>/aprovardiretriz ${l.id}</code>`
      )
      .join("\n");
  }

  return (
    `🧠 <b>Balanço Semanal de Aprendizado 360 (WF-104)</b>\n` +
    `📅 <i>${reflection.week}</i>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📊 <b>Métricas de Assertividade da IA:</b>\n` +
    `• <b>Propostas Apresentadas:</b> ${reflection.total_proposals}\n` +
    `• <b>Aceitas / Úteis:</b> ${reflection.breakdown.accepted + reflection.breakdown.edited} (${reflection.utility_rate_pct}% de utilidade)\n` +
    `• <b>Ajustadas por Você:</b> ${reflection.breakdown.edited}\n` +
    `• <b>Recusadas:</b> ${reflection.breakdown.rejected}\n` +
    `• <b>Status da Meta (DUR ≥ 85%):</b> ${reflection.meets_target ? "🟢 <b>META BATIDA</b>" : "⚠️ <b>ABAIXO DA META</b>"}\n\n` +
    `💡 <b>Lições Candidatas a Promoção:</b>\n` +
    `${lessonsBlock}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👉 <i>Para promover todas as lições acima como regras ativas, envie:</i> <code>/aprovar_todas</code>`
  );
}