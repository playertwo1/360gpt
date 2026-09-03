import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const agents = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
const roadmap = await readFile(path.join(root, 'ROADMAP.md'), 'utf8');
const adr = await readFile(path.join(root, 'docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md'), 'utf8');
const policy = await readFile(path.join(root, 'policies/n8n-canonical-architecture.yaml'), 'utf8');
const workflows = (await readdir(path.join(root, 'n8n/workflows'))).filter((name) => name.endsWith('.json') && !name.startsWith('exported_') && !name.includes('export-before'));

// 1. Verificação de princípios canônicos nos documentos mestres
assert.match(agents, /Regra canônica de execução n8n/);
assert.match(adr, /autoridade operacional exclusiva/);
assert.match(policy, /new_exceptions_allowed: false/);
assert.match(policy, /done_requires_zero_runtime_violations: true/);
assert.match(roadmap, /n8n (?:é|como) a autoridade operacional exclusiva/i);
assert.ok(workflows.length >= 19, 'catálogo n8n inesperadamente incompleto');

// 2. Verificação estrutural do Gateway de Transporte Telegram (Gate A0 - A0-01)
const ingestRoute = await readFile(path.join(root, 'app/api/ingest/telegram/route.ts'), 'utf8');
assert.doesNotMatch(ingestRoute, /handleClarificationReply/, 'ERRO A0-01: route.ts não pode chamar handleClarificationReply diretamente');
assert.doesNotMatch(ingestRoute, /handleTelegramCommand/, 'ERRO A0-01: route.ts não pode chamar handleTelegramCommand diretamente');
assert.doesNotMatch(ingestRoute, /handleConversationalText/, 'ERRO A0-01: route.ts não pode chamar handleConversationalText diretamente');
assert.match(ingestRoute, /telegram_inbound_events/, 'route.ts deve enfileirar mensagens técnicas para consumo exclusivo do n8n');

// 3. Verificação estrutural de Ausência de Rotas Bridge no Build (Gate A0 - A0-03)
assert.equal(
  existsSync(path.join(root, 'app/api/bridge')),
  false,
  'ERRO A0-03: app/api/bridge deve ser arquivado e não pode existir no build da aplicação'
);

// 4. Verificação de Aposentadoria de Worker Python Legado (Gate A0 - A0-06)
const pythonWorker = await readFile(path.join(root, 'core/telegram_bot_worker.py'), 'utf8');
assert.match(pythonWorker, /RETIRED/, 'core/telegram_bot_worker.py deve ser um stub aposentado');
assert.doesNotMatch(pythonWorker, /updater\.start_polling/, 'core/telegram_bot_worker.py não pode executar polling');

// 5. Validação de integridade dos workflows n8n
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

// 6. Política canônica
assert.match(policy, /legacy_exceptions_count: 0/);
assert.match(policy, /CANONICAL_LOCAL_ACTIVE/);

console.log(JSON.stringify({
  status: 'PASS',
  policy: 'director360.n8n-exclusive-runtime',
  structuralChecks: {
    ingestPureTransport: true,
    bridgeRoutesEliminatedFromBuild: true,
    pythonWorkerRetired: true,
    workflowsValidated: workflows.length
  },
  legacyExceptions: 0,
  runtimeGate: 'CANONICAL_LOCAL_ACTIVE',
}, null, 2));

