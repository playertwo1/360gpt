import { summarizeGdad } from './gdad-engine.mjs';

export function buildFinancialSpecialistResponse(request) {
  const summary = summarizeGdad(request.line_items);
  return {
    schema_version: '1.0.0',
    request_id: request.request_id,
    specialist_id: request.specialist_id,
    base_date: request.base_date,
    variance_analysis: summary.lines.map((line) => ({
      line_id: line.lineId,
      absolute_variance: line.variance,
      relative_variance: line.budget === 0 ? null : line.variance / line.budget,
      status: line.status !== 'CALCULATED' ? 'UNDETERMINED' : line.variance > 0 ? 'ABOVE_BUDGET' : line.variance < 0 ? 'BELOW_BUDGET' : 'ON_BUDGET'
    })),
    concentration_risks: [],
    attribution_status: summary.attributionStatus,
    recommendations: [],
    uncertainties: summary.status === 'PARTIAL' ? ['Uma ou mais linhas GDAD são inválidas ou incompletas.'] : [],
    decision_authority: 'RAFAEL'
  };
}
