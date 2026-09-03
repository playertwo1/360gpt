import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const route = await readFile('app/api/ingest/telegram/route.ts', 'utf8');
const messages = await readFile('lib/telegram-messages.ts', 'utf8');
const compose = await readFile('compose.n8n.yaml', 'utf8');
const wf101 = await readFile('n8n/workflows/wf-101-local-dispatcher.json', 'utf8');
const wf103 = await readFile('n8n/workflows/wf-103-local-error-contingency.json', 'utf8');

// Hardening de segurança de entrada
assert.match(route, /is_bot/);
assert.doesNotMatch(route, /sendTelegramText/, 'sendTelegramText é proibido no gateway de transporte (Marco A0)');
assert.doesNotMatch(route, /parse_mode/);

// Gate A0: Proibição estrita de handlers de negócio no gateway de transporte
assert.doesNotMatch(route, /handleClarificationReply/);
assert.doesNotMatch(route, /handleTelegramCommand/);
assert.doesNotMatch(route, /handleConversationalText/);
assert.doesNotMatch(route, /downloadTelegramFile/);
assert.doesNotMatch(route, /allocateShortProtocol/);

// Limite de segurança Telegram
assert.match(messages, /TELEGRAM_SAFE_LIMIT = 3600/);

// Verificação do Docker Compose
assert.match(compose, /EXECUTIONS_DATA_MAX_AGE: 24/);
assert.match(compose, /EXECUTIONS_DATA_SAVE_ON_PROGRESS: "false"/);

// Verificação de orquestração exclusiva n8n
assert.match(wf101, /FOR UPDATE SKIP LOCKED/);
assert.match(wf101, /conversation_messages/);
assert.match(wf103, /audit_log/);

// Ausência de rotas de ponte legada compiladas
assert.equal(existsSync('app/api/bridge'), false, 'Rotas app/api/bridge não devem existir no build');

console.log('P0 Telegram hardening: PASS');