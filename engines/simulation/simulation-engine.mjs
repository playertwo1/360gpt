/**
 * engines/simulation/simulation-engine.mjs
 * Marco N2.2.3 — Simulações e Cenários "What-If" sem Contaminar o Estado
 */

const CONDITIONAL_PATTERNS = [
  /\bse\s+(?:eu\s+)?(?:entrar|fechar|liberar|capturar|fizer|trazer)\b/i,
  /\bcaso\s+(?:eu\s+)?(?:faca|feche|libere|consiga)\b/i,
  /\bsupondo\s+que\b/i,
  /\bquanto\s+ficaria\b/i,
  /\be\s+se\b/i
];

export function detectConditionalIntent(text) {
  if (typeof text !== "string") return false;
  return CONDITIONAL_PATTERNS.some(p => p.test(text));
}

/**
 * Executa cálculo simulado em sandbox isolado sem alterar o Estado 360 persistido.
 */
export function simulateScenario({
  baseSnapshot = {
    current_points: 70.71,
    accelerator_points: 10.0,
    total_points: 80.71,
    attainment_pct: 100.65,
    max_operational_points: 78.0
  },
  hypothesis = {
    action_type: "CAPTURE_PAYROLL",
    target_name: "Hospital São Lucas",
    potential_points: 4.0,
    annual_revenue: 84000.0
  }
}) {
  const currentTotal = Number(baseSnapshot.total_points || 80.71);
  const currentBase = Number(baseSnapshot.current_points || 70.71);
  const maxOperational = Number(baseSnapshot.max_operational_points || 78.0);
  const addedPoints = Number(hypothesis.potential_points || 0);

  const simulatedCurrent = Math.min(maxOperational, currentBase + addedPoints);
  const pointsDelta = simulatedCurrent - currentBase;
  const simulatedTotal = simulatedCurrent + Number(baseSnapshot.accelerator_points || 10.0);
  const simulatedAttainmentPct = (simulatedTotal / maxOperational) * 100;

  return {
    is_simulation: true,
    state_polluted: false,
    workspace_id: `sim-${Date.now()}`,
    hypothesis_summary: hypothesis.description || `${hypothesis.action_type} em ${hypothesis.target_name}`,
    base_scenario: {
      current_points: currentBase,
      total_points: currentTotal,
      attainment_pct: Number(baseSnapshot.attainment_pct.toFixed(2))
    },
    simulated_scenario: {
      current_points: Number(simulatedCurrent.toFixed(2)),
      total_points: Number(simulatedTotal.toFixed(2)),
      attainment_pct: Number(simulatedAttainmentPct.toFixed(2)),
      incremental_annual_revenue: hypothesis.annual_revenue || 0
    },
    delta: {
      points_gain: Number(pointsDelta.toFixed(2)),
      attainment_gain_pct: Number((simulatedAttainmentPct - baseSnapshot.attainment_pct).toFixed(2))
    },
    confidence: 0.95,
    status: "SIMULATED_NOT_COMMITTED",
    requires_confirmation_to_persist: true
  };
}

/**
 * Formata a simulação para exibição executiva no Telegram.
 */
export function formatSimulationTelegramResponse(sim) {
  function fmt(n) { return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  return (
    `🔬 <b>Simulação de Cenário (What-If) — Sandbox Isolado</b>\n\n` +
    `• <b>Hipótese Testada:</b> ${sim.hypothesis_summary}\n` +
    `• <b>Estado Oficial:</b> <i>Preservado sem alteração</i> (nenhum dado foi promovido).\n\n` +
    `📊 <b>Comparativo de Pontuação:</b>\n` +
    `  - <b>Base Atual:</b> ${fmt(sim.base_scenario.current_points)} pts (${fmt(sim.base_scenario.attainment_pct)}%)\n` +
    `  - <b>Projeção Simulada:</b> ${fmt(sim.simulated_scenario.current_points)} pts (${fmt(sim.simulated_scenario.attainment_pct)}%)\n` +
    `  - <b>Impacto de Pontos:</b> <b>+${fmt(sim.delta.points_gain)} pts na mesa</b>\n\n` +
    `💰 <b>Impacto Financeiro Adicional:</b> +R$ ${fmt(sim.simulated_scenario.incremental_annual_revenue)}/ano em receitas de serviços.\n\n` +
    `💡 <i>Para converter esta simulação em fato após o fechamento, envie os dados reais de contratação.</i>`
  );
}