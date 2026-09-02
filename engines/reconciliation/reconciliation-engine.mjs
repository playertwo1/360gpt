/**
 * engines/reconciliation/reconciliation-engine.mjs
 * Marco N2.2.7 — Reconciliação, Correção e Reprocessamento Cirúrgico
 */

export const DIVERGENCE_TYPES = {
  DIVERGENCIA_DE_DADOS: "DIVERGENCIA_DE_DADOS",       // Mesma competência, valores incompatíveis
  DIVERGENCIA_TEMPORAL: "DIVERGENCIA_TEMPORAL",       // Competências ou datas-base divergentes
  DIVERGENCIA_NORMATIVA: "DIVERGENCIA_NORMATIVA"      // Regras ou políticas concorrentes
};

/**
 * Detecta e estrutura uma divergência entre duas fontes ou declarações.
 */
export function detectDivergence({
  entityName,
  fieldName,
  sideA = { source: "DECLARADO_VERBALMENTE", value: null, period: "2026-08" },
  sideB = { source: "REGISTRO_OFICIAL", value: null, period: "2026-08" }
}) {
  if (sideA.value === sideB.value && sideA.period === sideB.period) {
    return { has_divergence: false };
  }

  let type = DIVERGENCE_TYPES.DIVERGENCIA_DE_DADOS;
  if (sideA.period !== sideB.period) {
    type = DIVERGENCE_TYPES.DIVERGENCIA_TEMPORAL;
  }

  const divergenceId = `div-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    has_divergence: true,
    divergence_id: divergenceId,
    type,
    entity_name: entityName,
    field_name: fieldName,
    status: "MANUAL_REVIEW_REQUIRED",
    side_a: sideA,
    side_b: sideB,
    impact_description: `Divergência afeta apuração de elegibilidade e cálculo de pontuação para ${entityName}`,
    decision_authority: "RAFAEL",
    detected_at: new Date().toISOString()
  };
}

/**
 * Resolve soberanamente uma divergência aplicando a escolha de Rafael.
 */
export function resolveDivergence({
  divergence,
  chosenSide, // "A" | "B" | "CUSTOM"
  customValue = null,
  resolvedBy = "RAFAEL",
  rationale = "Decisão soberana após validação com cliente"
}) {
  if (!divergence || !divergence.has_divergence) {
    throw new Error("INVALID_DIVERGENCE: Divergência inexistente ou já resolvida");
  }

  let winningValue = chosenSide === "A" ? divergence.side_a.value : divergence.side_b.value;
  let winningSource = chosenSide === "A" ? divergence.side_a.source : divergence.side_b.source;

  if (chosenSide === "CUSTOM") {
    winningValue = customValue;
    winningSource = "RAFAEL_CUSTOM_OVERRIDE";
  }

  return {
    ...divergence,
    status: "RESOLVED",
    resolved_at: new Date().toISOString(),
    resolved_by: resolvedBy,
    chosen_side: chosenSide,
    effective_value: winningValue,
    authoritative_source: winningSource,
    supersedes_link: `SUPERSEDES:${divergence.divergence_id}`,
    rationale,
    requires_recalculation: true,
    recalculation_scope: [divergence.field_name, divergence.entity_name]
  };
}

/**
 * Formata a divergência para apresentação objetiva no Telegram com botões de ação rápida.
 */
export function formatDivergenceTelegram(div) {
  function fmtVal(v) {
    if (typeof v === "number") return v.toLocaleString("pt-BR");
    return String(v);
  }

  return (
    `⚖️ <b>Divergência Identificada (${div.type})</b>\n\n` +
    `• <b>Empresa:</b> ${div.entity_name}\n` +
    `• <b>Campo:</b> <code>${div.field_name}</code>\n\n` +
    `📌 <b>Lado A (${div.side_a.source}):</b> ${fmtVal(div.side_a.value)} [Período: ${div.side_a.period}]\n` +
    `📌 <b>Lado B (${div.side_b.source}):</b> ${fmtVal(div.side_b.value)} [Período: ${div.side_b.period}]\n\n` +
    `⚠️ <b>Impacto:</b> ${div.impact_description}\n\n` +
    `👉 <b>Para decidir em 1 toque, envie:</b>\n` +
    `• <code>/resolver ${div.divergence_id} a</code> (Adotar Lado A)\n` +
    `• <code>/resolver ${div.divergence_id} b</code> (Adotar Lado B)`
  );
}