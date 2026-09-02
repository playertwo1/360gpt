/**
 * engines/ux/adaptive-response-engine.mjs
 * Marco N2.2.8 — Experiência do Usuário, Badges Visuais e Modo Adaptativo
 */

export const UX_BADGES = {
  OFFICIAL: "🏛️ [OFICIAL: POBJ-PDF]",
  OWNER: "👤 [DECLARADO POR RAFAEL]",
  CALCULATED: "🔢 [CÁLCULO DETERMINÍSTICO]",
  ESTIMATED: "📈 [ESTIMATIVA / SIMULAÇÃO]",
  PENDING: "⏳ [PENDÊNCIA DE DADO]"
};

export const RESPONSE_MODES = {
  COMPACTO: "COMPACTO",
  EXECUTIVO: "EXECUTIVO",
  DETALHADO: "DETALHADO"
};

export function parseUserModePreference(text) {
  if (typeof text !== "string") return null;
  const lower = text.toLowerCase().trim();
  if (lower.includes("/modo compacto") || lower === "compacto") return RESPONSE_MODES.COMPACTO;
  if (lower.includes("/modo detalhado") || lower === "detalhado") return RESPONSE_MODES.DETALHADO;
  if (lower.includes("/modo executivo") || lower === "executivo") return RESPONSE_MODES.EXECUTIVO;
  return null;
}

export function formatAdaptiveResponse({
  title = "Posição Executiva 360",
  mode = RESPONSE_MODES.EXECUTIVO,
  metrics = {
    current_points: 70.71,
    accelerator_points: 10.0,
    total_points: 80.71,
    attainment_pct: 100.65
  },
  gaps = [
    { name: "Conquista Folha PJ", points: "0,0 de 4,0 pts", target: "Hospital São Lucas" },
    { name: "Faturamento Boleto + PIX", points: "0,0 de 4,0 pts", target: "Metalúrgica Forja Sul" },
    { name: "Vencidos Até 59 dias", points: "9,34 pts em risco", target: "Metalúrgica Forja Sul" }
  ],
  financialYield = "+R$ 106.680,00/ano adicionais"
}) {
  function fmt(n) { return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  if (mode === RESPONSE_MODES.COMPACTO) {
    return (
      `⚡ <b>${title} (Modo Compacto)</b>\n\n` +
      `• ${UX_BADGES.CALCULATED} <b>Pontuação:</b> ${fmt(metrics.total_points)} pts (${fmt(metrics.attainment_pct)}%)\n` +
      `• ${UX_BADGES.OFFICIAL} <b>Gaps:</b> Folha (0/4) no São Lucas e Cobrança (0/4) na Forja Sul.\n` +
      `• ${UX_BADGES.ESTIMATED} <b>Retorno:</b> ${financialYield}.\n\n` +
      `💡 <i>Use /modo executivo para ver a análise completa.</i>`
    );
  }

  if (mode === RESPONSE_MODES.DETALHADO) {
    return (
      `📑 <b>${title} — Relatório Analítico Detalhado</b>\n\n` +
      `• ${UX_BADGES.OFFICIAL} <b>Base POBJ Oficial:</b> 28/08/2026 (POBJ2608.pdf)\n` +
      `• ${UX_BADGES.CALCULATED} <b>Pontuação Normativa:</b> ${fmt(metrics.current_points)} pts + ${fmt(metrics.accelerator_points)} acel. = <b>${fmt(metrics.total_points)} pts</b>\n\n` +
      `🏢 <b>Detalhamento Cirúrgico por Entidade:</b>\n` +
      `1. <b>Hospital & Maternidade São Lucas S/A</b> (CNPJ: 01.234.567/0001-89)\n` +
      `   - Esteira: Folha de Pagamento (+4,0 pts)\n` +
      `   - Potencial: 280 vidas ativas (R$ 84.000,00/ano)\n` +
      `   - Contatos: Dr. Arnaldo Silveira (Dir. Financeiro) e Dra. Helena Ramos (RH)\n` +
      `2. <b>Metalúrgica Forja Sul Ltda</b> (CNPJ: 12.345.678/0001-90)\n` +
      `   - Esteira: Boleto + PIX (+4,0 pts) e Blindagem de Vencidos (9,34 pts)\n` +
      `   - Potencial: R$ 420 mil em boletos externos (R$ 22.680,00/ano)\n` +
      `   - Contatos: Sr. Cláudio Mendes (Sócio) e Sra. Renata Dias (Financeiro)\n\n` +
      `⚖️ <b>Governança:</b> Toda ação de contato depende de autorização explícita de Rafael.`
    );
  }

  // Padrão: EXECUTIVO
  return (
    `🏛️ <b>${title}</b>\n\n` +
    `• ${UX_BADGES.CALCULATED} <b>Desempenho:</b> <b>${fmt(metrics.total_points)} pts totais</b> (${fmt(metrics.attainment_pct)}% da meta).\n` +
    `• ${UX_BADGES.OFFICIAL} <b>Gaps Críticos na Mesa:</b>\n` +
    gaps.map(g => `  - ${g.name}: <b>${g.points}</b> → Alvo: <i>${g.target}</i>`).join("\n") + "\n\n" +
    `• ${UX_BADGES.ESTIMATED} <b>Impacto Financeiro Estimado:</b> ${financialYield}.\n\n` +
    `💡 <i>Alterne o tamanho da resposta usando /modo compacto ou /modo detalhado.</i>`
  );
}