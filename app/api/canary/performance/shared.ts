export const PERFORMANCE_CANARY_RUN_ID = 'performance-synthetic-wave-3-v1';
export const PERFORMANCE_CANARY_TENANT_ID = 'tenant-demo';
export const PERFORMANCE_CANARY_DECISIONS = ['APPROVE_A1', 'REQUEST_ADJUSTMENT'] as const;

export type PerformanceCanaryDecision = typeof PERFORMANCE_CANARY_DECISIONS[number];

export const PERFORMANCE_CANARY_CASES = [
  { id: 'PERF-01', attainment: 65, points: 0, action: 'RESCUE_MINIMUM', rationale: 'Abaixo do piso de 70%; não pontua.' },
  { id: 'PERF-02', attainment: 85, points: 6.375, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'Entre piso e meta; pontuação proporcional.' },
  { id: 'PERF-03', attainment: 155, points: 15, action: 'DEPRIORITIZE_FOR_POINTS', rationale: 'Acima do teto de 150%; pontos limitados.' },
  { id: 'PERF-04', attainment: 95, points: 9.5, action: 'CLOSE_TARGET', rationale: 'Próximo da meta; priorizar fechamento.' },
  { id: 'PERF-05', attainment: 120, points: 12, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'Acima da meta, dentro do teto.' },
  { id: 'PERF-06', attainment: 70, points: 3.5, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'No piso oficial de pontuação.' },
  { id: 'PERF-07', attainment: 75, points: 3.75, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'Faixa proporcional validada.' },
  { id: 'PERF-08', attainment: 80, points: 6, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'Faixa proporcional validada.' },
  { id: 'PERF-09', attainment: 90, points: 9, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'Faixa proporcional validada.' },
  { id: 'PERF-10', attainment: 100, points: 10, action: 'ADVANCE_WITHIN_SCORING_RANGE', rationale: 'Meta atingida.' },
] as const;

export function isPerformanceCanaryDecision(value: unknown): value is PerformanceCanaryDecision {
  return typeof value === 'string' && PERFORMANCE_CANARY_DECISIONS.includes(value as PerformanceCanaryDecision);
}
