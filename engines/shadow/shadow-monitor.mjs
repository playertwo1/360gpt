const HOUR_MS = 60 * 60 * 1000;

export function monitorShadowWindow(observations = [], now = Date.now(), target = 24) {
  const valid = observations.map(normalize).filter(Boolean).sort((left, right) => left.observedAt - right.observedAt).slice(-target);
  const totals = valid.reduce((acc, item) => ({
    cases: acc.cases + item.totalCases,
    completed: acc.completed + item.completedCases,
    errors: acc.errors + item.errors,
    divergences: acc.divergences + Math.round(item.divergenceRate * item.completedCases),
    mutations: acc.mutations + item.stateMutationCount,
    externalEffects: acc.externalEffects + item.externalEffectCount,
  }), { cases: 0, completed: 0, errors: 0, divergences: 0, mutations: 0, externalEffects: 0 });
  const completionRate = totals.cases ? totals.completed / totals.cases : null;
  const divergenceRate = totals.completed ? totals.divergences / totals.completed : null;
  const alerts = [];
  if (totals.mutations > 0 || totals.externalEffects > 0) alerts.push('PROHIBITED_EFFECT');
  if (divergenceRate !== null && divergenceRate > 0.1) alerts.push('DIVERGENCE_LIMIT_EXCEEDED');
  if (completionRate !== null && completionRate < 0.99) alerts.push('COMPLETION_SLO_BREACHED');
  if (valid.some((item) => item.pauseRequired)) alerts.push('PAUSE_SIGNAL_RECEIVED');
  const gaps = [];
  for (let index = 1; index < valid.length; index += 1) {
    const intervalMs = valid[index].observedAt - valid[index - 1].observedAt;
    if (intervalMs > 1.5 * HOUR_MS) gaps.push({ after: new Date(valid[index - 1].observedAt).toISOString(), before: new Date(valid[index].observedAt).toISOString(), interval_minutes: Math.round(intervalMs / 60_000) });
  }
  if (gaps.length) alerts.push('HOURLY_MEASUREMENT_GAP');
  const latestAt = valid.at(-1)?.observedAt ?? null;
  const stale = latestAt !== null && now - latestAt > 1.5 * HOUR_MS;
  if (stale) alerts.push('OBSERVATION_STALE');
  const uniqueAlerts = [...new Set(alerts)];
  return {
    target_observations: target, observations: valid.length, remaining_observations: Math.max(0, target - valid.length),
    window_complete: valid.length >= target, latest_observed_at: latestAt ? new Date(latestAt).toISOString() : null,
    next_measurement_due_at: latestAt ? new Date(latestAt + HOUR_MS).toISOString() : null,
    stale, gaps, totals, completion_rate: completionRate, divergence_rate: divergenceRate,
    pause_required: uniqueAlerts.some((code) => code !== 'OBSERVATION_STALE' && code !== 'HOURLY_MEASUREMENT_GAP'),
    healthy: uniqueAlerts.length === 0, alerts: uniqueAlerts,
  };
}

function normalize(item) {
  const observedAt = Date.parse(item?.observed_at ?? item?.finished_at ?? '');
  const totalCases = number(item?.total_cases ?? item?.telemetry?.total);
  const completedCases = number(item?.completed_cases ?? item?.telemetry?.completed);
  if (!Number.isFinite(observedAt) || totalCases === null || completedCases === null) return null;
  return {
    observedAt, totalCases, completedCases, errors: number(item?.errors ?? item?.telemetry?.errors) ?? 0,
    divergenceRate: rate(item?.divergence_rate ?? item?.telemetry?.divergenceRate) ?? 0,
    stateMutationCount: number(item?.state_mutation_count ?? item?.telemetry?.stateMutationCount) ?? 0,
    externalEffectCount: number(item?.external_effect_count ?? item?.telemetry?.externalEffectCount) ?? 0,
    pauseRequired: item?.pause_required === true || item?.pause_required === 1,
  };
}

function number(value) { return Number.isSafeInteger(value) && value >= 0 ? value : null; }
function rate(value) { return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null; }

export function renderShadowGateReport(monitor, generatedAt = new Date().toISOString()) {
  const decision = monitor.pause_required ? 'PAUSAR_E_REVISAR' : monitor.window_complete && monitor.healthy ? 'APTO_PARA_REVISAO_DO_GATE' : 'OBSERVACAO_EM_ANDAMENTO';
  return `# Relatório automático da janela Shadow\n\n**Gerado em:** ${generatedAt}  \n**Decisão automática:** ${decision}  \n**Medições:** ${monitor.observations}/${monitor.target_observations}  \n**Conclusão dos casos:** ${percent(monitor.completion_rate)}  \n**Divergência:** ${percent(monitor.divergence_rate)}  \n**Mutações de Estado:** ${monitor.totals.mutations}  \n**Efeitos externos:** ${monitor.totals.externalEffects}  \n**Lacunas horárias:** ${monitor.gaps.length}  \n**Alertas:** ${monitor.alerts.length ? monitor.alerts.join(', ') : 'nenhum'}\n\n> Este relatório não promove o runtime. A decisão final do gate pertence a Rafael.\n`;
}

function percent(value) { return value === null ? 'não disponível' : `${(value * 100).toFixed(2)}%`; }
