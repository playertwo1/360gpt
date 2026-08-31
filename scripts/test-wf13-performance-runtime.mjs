import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const workflow = JSON.parse(fs.readFileSync(new URL('../n8n/workflows/wf-13-gg-performance-mvp.json', import.meta.url), 'utf8'));
const codeNodes = workflow.nodes.filter((node) => node.type === 'n8n-nodes-base.code');
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const html = `MENSAL - AGOSTO/2026 Base 28/08/2026 PONTOS possíveis atingidos % ating. acelora % final 78,00 70,71 90,65 10,00 100,65
<table><tr><td>PRODUTO</td><td>PESO</td><td>MÉTRICA</td><td>DT.BASE</td><td>META</td><td>REALIZADO</td><td>% ATG.</td><td>% REF.</td><td>% PROJ.FINAL</td><td>NEC DIA</td><td>PTS</td></tr>
<tr><td>Captação Líquida PJ</td><td>3,0</td><td>PROD</td><td>25/08/2026</td><td>139.312,03</td><td>-29.181,94</td><td>-20,95</td><td>81,00</td><td>-25,88</td><td>42.123,49</td><td>0,00</td></tr>
<tr><td>Consórcio (Expert)</td><td>5,0</td><td>PERC</td><td>26/08/2026</td><td>100,00</td><td>93,31</td><td>93,31</td><td>86,00</td><td>93,31</td><td>2,23</td><td>4,67</td></tr>
<tr><td>Open Finance PJ</td><td>7,0</td><td>QTD</td><td>27/08/2026</td><td>4,00</td><td>5,00</td><td>125,00</td><td>90,00</td><td>138,16</td><td>0,00</td><td>7,00</td></tr></table>`;

let current = {
  performance_handoff: {
    handoff_target: 'GERENTE_GERAL_PERFORMANCE',
    extracted_text: html,
    capabilities: ['PERFORMANCE_SOURCES_RECONCILIATION', 'PERFORMANCE_SCORING_STATE', 'PERFORMANCE_GAP_SCENARIOS'],
    source: { mime_type: 'application/pdf', content_hash: 'sha256:test', extraction_method: 'MINERU_HYBRID' },
    evidence: [{ locator: 'page://1' }],
    security: { external_effects_allowed: false },
  },
};

for (const node of codeNodes) {
  const execute = new AsyncFunction('$input', 'require', node.parameters.jsCode);
  const output = await execute({ first: () => ({ json: current }) }, require);
  assert.equal(Array.isArray(output), true, `${node.name} não retornou itens`);
  current = output[0].json;
}

assert.equal(current.performance_reconciliation.indicator_count, 3);
assert.equal(current.performance_observations.summary.final_points, 100.65);
assert.equal(current.performance_analysis.indicators[0].target, 139312.03);
assert.equal(current.performance_analysis.indicators[0].achieved, -29181.94);
assert.equal(current.performance_analysis.priority_candidates[0].name, 'Captação Líquida PJ');
assert.equal(current.performance_analysis.strengths[0].name, 'Open Finance PJ');
assert.equal(current.performance_analysis.ranking_policy.unknown_direction_excluded, true);
assert.equal(current.performance_analysis.rule_validation.matched, 2);
assert.equal(current.performance_analysis.rule_validation.review_required, 0);
assert.equal(current.performance_analysis.rule_validation.source_values_overwritten, false);
assert.equal(current.performance_analysis.calculation_policy.recalculated_points, false);
assert.equal(current.performance_analysis.security.external_effects_allowed, false);

console.log('WF13_PERFORMANCE_RUNTIME_PASS');
