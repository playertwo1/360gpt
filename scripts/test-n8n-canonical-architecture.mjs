import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
const roadmap = await readFile(path.join(root, 'ROADMAP.md'), 'utf8');
const adr = await readFile(path.join(root, 'docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md'), 'utf8');
const policy = await readFile(path.join(root, 'policies/n8n-canonical-architecture.yaml'), 'utf8');
const workflows = (await readdir(path.join(root, 'n8n/workflows'))).filter((name) => name.endsWith('.json'));

assert.match(agents, /Regra canônica de execução n8n/);
assert.match(adr, /autoridade operacional exclusiva/);
assert.match(policy, /new_exceptions_allowed: false/);
assert.match(policy, /done_requires_zero_runtime_violations: true/);
assert.match(roadmap, /n8n (?:é|como) a autoridade operacional exclusiva/i);
assert.ok(workflows.length >= 19, 'catálogo n8n inesperadamente incompleto');

for (const workflowFile of workflows) {
  const workflow = JSON.parse(await readFile(path.join(root, 'n8n/workflows', workflowFile), 'utf8'));
  assert.equal(typeof workflow.name, 'string', `${workflowFile}: nome ausente`);
  assert.ok(Array.isArray(workflow.nodes), `${workflowFile}: nodes ausentes`);
}

const wf101 = await readFile(path.join(root, 'n8n/workflows/wf-101-local-dispatcher.json'), 'utf8');
const wf102 = await readFile(path.join(root, 'n8n/workflows/wf-102-telegram-delivery.json'), 'utf8');
const wf103 = await readFile(path.join(root, 'n8n/workflows/wf-103-local-error-contingency.json'), 'utf8');
assert.match(wf101, /FOR UPDATE SKIP LOCKED/);
assert.match(wf101, /conversation_messages/);
assert.match(wf101, /Roteamento determinístico/);
assert.match(wf102, /telegram-poller:8790\/send/);
assert.match(wf102, /part_index/);
assert.match(wf103, /audit_log/);
assert.match(wf103, /NOT EXISTS/);

console.log(JSON.stringify({
  status: 'PASS',
  policy: 'director360.n8n-exclusive-runtime',
  workflowsValidated: workflows.length,
  legacyExceptions: 4,
  runtimeGate: 'BLOCKED_UNTIL_LEGACY_MIGRATION',
}, null, 2));
