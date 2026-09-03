import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

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

// 2. Verificação estrutural do Gateway de Transporte Telegram (Gate A0 - A0-01 e A0-R03)
const ingestRoute = await readFile(path.join(root, 'app/api/ingest/telegram/route.ts'), 'utf8');
assert.doesNotMatch(ingestRoute, /sendTelegramText/, 'ERRO A0-R03: route.ts não pode chamar sendTelegramText');
assert.doesNotMatch(ingestRoute, /downloadTelegramFile/, 'ERRO A0-R03: route.ts não pode baixar arquivos no edge');
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

// 5. Validação de integridade dos workflows n8n no repositório
for (const workflowFile of workflows) {
  const workflow = JSON.parse(await readFile(path.join(root, 'n8n/workflows', workflowFile), 'utf8'));
  assert.equal(typeof workflow.name, 'string', `${workflowFile}: nome ausente`);
  assert.ok(Array.isArray(workflow.nodes), `${workflowFile}: nodes ausentes`);
}

const wf101 = await readFile(path.join(root, 'n8n/workflows/wf-101-local-dispatcher.json'), 'utf8');
const wf102 = await readFile(path.join(root, 'n8n/workflows/archive/wf-102-telegram-delivery.json'), 'utf8');
const wf103 = await readFile(path.join(root, 'n8n/workflows/wf-103-contingencia-local.json'), 'utf8');
assert.match(wf101, /FOR UPDATE SKIP LOCKED/);
assert.match(wf101, /conversation_messages/);
assert.match(wf101, /Roteamento determinístico/);
assert.match(wf102, /telegram-poller:8790\/send/);
assert.match(wf102, /part_index/);
assert.match(wf103, /audit_log/);
assert.match(wf103, /NOT EXISTS/);

// 6. Verificação do estado REAL do banco n8n (zero rotas bridge ativas/publicadas, zero mocks operacionais e contenção estrita)
let activeBridgeCount = 0;
let activeMockCount = 0;
let wf104Active = false;
let legacyUnpublished = false;

try {
  const bridgeQuery = `@'
SELECT COUNT(*) FROM (
  SELECT we.id
  FROM workflow_entity we
  LEFT JOIN workflow_history wh ON wh."versionId" = we."activeVersionId"
  WHERE (we.active = true OR we."activeVersionId" IS NOT NULL)
    AND (we.nodes::text LIKE '%/api/bridge/%' OR (wh.nodes IS NOT NULL AND wh.nodes::text LIKE '%/api/bridge/%'))
) sub;
'@ | docker exec -i visao-360-postgres-1 psql -U n8n -d n8n -t -A`;

  const psqlCheck = execFileSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    bridgeQuery
  ], { encoding: 'utf8' }).trim();
  activeBridgeCount = Number(psqlCheck);
  assert.equal(activeBridgeCount, 0, 'ERRO A0-R02: Existem workflows ativos ou publicados referenciando /api/bridge/ no banco n8n');

  const mockQuery = `@'
SELECT COUNT(*) FROM (
  SELECT we.id
  FROM workflow_entity we
  LEFT JOIN workflow_history wh ON wh."versionId" = we."activeVersionId"
  WHERE (we.active = true OR we."activeVersionId" IS NOT NULL)
    AND (
      we.nodes::text ILIKE '%Hospital%Lucas%' 
      OR we.nodes::text ILIKE '%Forja Sul%'
      OR (wh.nodes IS NOT NULL AND (wh.nodes::text ILIKE '%Hospital%Lucas%' OR wh.nodes::text ILIKE '%Forja Sul%'))
    )
) sub;
'@ | docker exec -i visao-360-postgres-1 psql -U n8n -d n8n -t -A`;

  const mockCheck = execFileSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    mockQuery
  ], { encoding: 'utf8' }).trim();
  activeMockCount = Number(mockCheck);
  assert.equal(activeMockCount, 0, 'ERRO A0/N23-B11: Existem dados fictícios (Hospital/Forja Sul) em workflows ativos ou publicados');

  const legacyQuery = `@'
SELECT COUNT(*) FROM workflow_entity 
WHERE id IN ('9eb8e86a-84b8-4aa9-97e4-360000000011', 'NIMQv2jpUC2JDMhT', 'xkoDMhM2ZW1LDDS8', '9eb8e86a-84b8-4aa9-97e4-360000000102')
  AND (active = true OR "activeVersionId" IS NOT NULL);
'@ | docker exec -i visao-360-postgres-1 psql -U n8n -d n8n -t -A`;

  const legacyCheck = execFileSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    legacyQuery
  ], { encoding: 'utf8' }).trim();
  assert.equal(Number(legacyCheck), 0, 'ERRO T0: Workflows legados (WF-11, WF-97, WF-98, WF-102) continuam ativos ou publicados');
  legacyUnpublished = true;

  const wf104Query = `@'
SELECT COUNT(*) FROM workflow_entity 
WHERE id = '9eb8e86a-84b8-4aa9-97e4-360000000104'
  AND (active = true OR "activeVersionId" IS NOT NULL);
'@ | docker exec -i visao-360-postgres-1 psql -U n8n -d n8n -t -A`;

  const wf104Check = execFileSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    wf104Query
  ], { encoding: 'utf8' }).trim();
  assert.equal(Number(wf104Check), 0, 'WF-104 deve permanecer inativo no tenant operacional conforme instrução de contenção');
  wf104Active = false;
} catch (err) {
  throw new Error(`FALHA CRÍTICA DE VERIFICAÇÃO ARQUITETURAL NO POSTGRESQL/N8N: ${err.message}`);
}

// 7. Política canônica
assert.match(policy, /legacy_exceptions_count: 0/);

console.log(JSON.stringify({
  status: 'PASS',
  policy: 'director360.n8n-exclusive-runtime',
  structuralChecks: {
    ingestPureTransport: true,
    bridgeRoutesEliminatedFromBuild: true,
    pythonWorkerRetired: true,
    zeroActiveBridgeWorkflowsInN8nDB: activeBridgeCount === 0,
    activeBridgeCountInDB: activeBridgeCount,
    zeroActiveMockEntitiesInDB: activeMockCount === 0,
    legacyWorkflowsUnpublished: legacyUnpublished,
    wf104ContainedInOperationalTenant: !wf104Active,
    workflowsValidated: workflows.length
  },
  runtimeVerification: 'VERIFIED_ON_N8N_POSTGRES_RUNTIME'
}, null, 2));