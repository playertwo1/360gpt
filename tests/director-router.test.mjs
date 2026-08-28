import assert from 'node:assert/strict';
import { routeDirector } from '../engines/orchestration/director-router.mjs';

const performance = routeDirector({ purpose: 'meta POBJ', text: 'pontuação e produção' });
assert.deepEqual(performance.selected_domains.map((item) => item.domain), ['performance']);
assert.equal(performance.specialist_runtime, 'INACTIVE');
assert.ok(performance.excluded_domains.some((item) => item.reason_code === 'NOT_REQUIRED_FOR_INTENT'));
const full = routeDirector({ text: 'visão 360 completa', requestedDomains: ['conta', 'performance', 'financeiro', 'relacionamento'] });
assert.equal(full.selected_domains.length, 4);
assert.equal(routeDirector({ text: 'assunto sem classificação' }).decision_status, 'MANUAL_REVIEW_REQUIRED');
console.log('director-router: seleção determinística, exclusões e limite de quatro domínios validados');
