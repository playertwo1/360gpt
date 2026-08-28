import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { evaluateIndicator } from '../engines/performance/pobj-engine.mjs';

const policyPath = new URL('../policies/pobj-scoring-rules.2026-h2.json', import.meta.url);
const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
const now = new Date().toISOString();
const waveArgument = process.argv.find((argument) => argument.startsWith('--wave='));
const wave = Number(waveArgument?.slice('--wave='.length) ?? '1');
if (![1, 2].includes(wave)) throw new Error('CANARY_WAVE_MUST_BE_1_OR_2');
const cases = [
  { case_id: 'performance-canary-synthetic-01', target: 100, officialActual: 65, minimumPercent: 70, capPercent: 150, maximumPoints: 15, weight: 10, estimatedEffort: 1 },
  { case_id: 'performance-canary-synthetic-02', target: 100, officialActual: 85, minimumPercent: 70, capPercent: 150, maximumPoints: 15, weight: 10, estimatedEffort: 2 },
  { case_id: 'performance-canary-synthetic-03', target: 100, officialActual: 155, minimumPercent: 70, capPercent: 150, maximumPoints: 15, weight: 10, estimatedEffort: 1 },
  { case_id: 'performance-canary-synthetic-04', target: 100, officialActual: 95, minimumPercent: 70, capPercent: 150, maximumPoints: 15, weight: 10, estimatedEffort: 2 },
  { case_id: 'performance-canary-synthetic-05', target: 100, officialActual: 120, minimumPercent: 70, capPercent: 150, maximumPoints: 15, weight: 10, estimatedEffort: 1 }
];

const waveSize = wave === 1 ? 3 : 5;
const results = cases.slice(0, waveSize).map((input) => {
  const result = evaluateIndicator({ ...input, indicatorId: input.case_id, scoringRule: policy.generalRule, updateLagStatus: 'CURRENT' });
  return {
    case_id: input.case_id,
    source: 'SYNTHETIC_CANARY_FIXTURE',
    policy_id: policy.policyId,
    policy_version: policy.version,
    result,
    review_status: 'PENDING_RAFAEL_REVIEW',
    rafael_decision: null,
    external_effects: []
  };
});

const valid = results.every(({ result }) => result.official.points.status === 'CALCULATED_FROM_OFFICIAL_RULE');
const report = {
  schema_version: '1.0.0',
  run_id: `performance-canary-wave${wave}-${now.replace(/[:.-]/g, '')}`,
  generated_at: now,
  domain: 'performance',
  capability: 'PERFORMANCE_SCORING_STATE',
  runtime_mode: 'CANARY_SYNTHETIC_SUPERVISED',
  data_scope: 'SYNTHETIC_ONLY',
  wave,
  total_cases: results.length,
  state_mutation_count: 0,
  external_effect_count: 0,
  schema_errors: 0,
  calculations_valid: valid,
  status: valid ? 'PENDING_RAFAEL_REVIEW' : 'FAILED',
  results
};

const outputDir = new URL('../test-data/canary/', import.meta.url);
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
const outputPath = new URL(`performance-wave-${wave}-latest.json`, outputDir);
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output: fileURLToPath(outputPath), ...report }));
if (!valid || report.external_effect_count !== 0 || report.state_mutation_count !== 0) process.exitCode = 2;
