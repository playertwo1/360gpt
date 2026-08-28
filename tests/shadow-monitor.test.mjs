import assert from 'node:assert/strict';
import { monitorShadowWindow, renderShadowGateReport } from '../engines/shadow/shadow-monitor.mjs';

const start = Date.parse('2026-08-28T00:00:00Z');
const healthy = Array.from({ length: 24 }, (_, index) => ({ observed_at: new Date(start + index * 3_600_000).toISOString(), total_cases: 20, completed_cases: 20, errors: 0, divergence_rate: 0, state_mutation_count: 0, external_effect_count: 0, pause_required: false }));
const complete = monitorShadowWindow(healthy, start + 23 * 3_600_000 + 30_000);
assert.equal(complete.window_complete, true);
assert.equal(complete.healthy, true);
assert.equal(complete.remaining_observations, 0);
assert.match(renderShadowGateReport(complete), /APTO_PARA_REVISAO_DO_GATE/);

const gap = monitorShadowWindow([healthy[0], healthy[2]], start + 2 * 3_600_000);
assert.deepEqual(gap.alerts, ['HOURLY_MEASUREMENT_GAP']);
assert.equal(gap.pause_required, false);
const unsafe = monitorShadowWindow([{ ...healthy[0], external_effect_count: 1 }], start);
assert.equal(unsafe.pause_required, true);
assert.ok(unsafe.alerts.includes('PROHIBITED_EFFECT'));
console.log('shadow-monitor: janela, lacunas, alertas e relatório automático validados');
