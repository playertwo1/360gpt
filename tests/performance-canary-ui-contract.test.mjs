import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../app/api/canary/performance/shared.ts', import.meta.url), 'utf8');
const caseCount = (source.match(/id: 'PERF-\d+'/g) ?? []).length;
assert.equal(caseCount, 10, 'a revisão A1 deve expor exatamente dez casos');
assert.match(source, /\['APPROVE_A1', 'REQUEST_ADJUSTMENT'\]/);
assert.doesNotMatch(source, /cpf|cnpj|email|nome/i, 'canary não pode carregar PII');
console.log('performance-canary-ui-contract: PASS');
