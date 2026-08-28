import assert from 'node:assert/strict';
import { calculateGdadLine, summarizeGdad } from '../engines/finance/gdad-engine.mjs';
import { assessCommitment } from '../engines/relationship/commitments-engine.mjs';

const line = calculateGdadLine({ line_id: 'servicos', budget: 100, actual: 80, source_ref: 'g dada:1' });
assert.equal(line.variance, -20);
assert.equal(line.attainmentPercent, 80);
assert.equal(line.attributionStatus, 'UNKNOWN');

const summary = summarizeGdad([
  { line_id: 'a', budget: 100, actual: 120, source_ref: 'g:1', attribution_status: 'CONFIRMED' },
  { line_id: 'b', budget: 50, actual: 25, source_ref: 'g:2', attribution_status: 'UNKNOWN' }
]);
assert.equal(summary.totals.budget, 150);
assert.equal(summary.totals.actual, 145);
assert.equal(summary.attributionStatus, 'UNKNOWN');
assert.equal(summarizeGdad([{ line_id: 'bad', budget: -1, actual: 2 }]).status, 'PARTIAL');

const overdue = assessCommitment({ due_at: '2026-08-01T00:00:00Z', responsible: 'RAFAEL', evidence_ref: 'msg:1' }, new Date('2026-08-27T00:00:00Z'));
assert.equal(overdue.status, 'OVERDUE_OPEN');
assert.equal(assessCommitment({ due_at: '2026-08-01', responsible: 'RAFAEL' }).status, 'INCOMPLETE');
assert.equal(assessCommitment({ due_at: '2026-08-01', responsible: 'RAFAEL', evidence_ref: 'msg:2', status: 'COMPLETED' }).status, 'COMPLETED');
console.log('gdad-commitments-engine: totais, atribuição e vencimento seguro validados');
