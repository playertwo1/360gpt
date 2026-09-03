import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const compose = await readFile(path.join(root, 'compose.n8n.yaml'), 'utf8');
const migration = await readFile(path.join(root, 'infra/postgres/init/08-channel-runtime.sql'), 'utf8');
const workflow = JSON.parse(await readFile(path.join(root, 'n8n/workflows/wf-100-telegram-local-intake.json'), 'utf8'));
const poller = await readFile(path.join(root, 'services/telegram-poller/app.py'), 'utf8');

assert.match(compose, /telegram-poller:/);
assert.match(compose, /TELEGRAM_POLLING_ENABLED: \$\{TELEGRAM_POLLING_ENABLED:-false\}/);
assert.match(compose, /127\.0\.0\.1:5678:5678/);
assert.doesNotMatch(compose, /^\s*-\s*["']?5678:5678/m, 'n8n não deve ganhar bind público');
assert.match(poller, /getUpdates/);
assert.match(poller, /write_offset\(offset\)/);
assert.match(poller, /if not result\.get\("accepted"\)/);
assert.equal(workflow.active, false);
assert.ok(workflow.nodes.some((node) => node.type === 'n8n-nodes-base.webhook'));
assert.ok(workflow.nodes.some((node) => node.type === 'n8n-nodes-base.postgres'));
assert.match(JSON.stringify(workflow), /channel_updates/);

for (const table of [
  'channel_adapters', 'channel_updates', 'channel_inbound_events', 'channel_documents',
  'processing_jobs', 'conversation_threads', 'conversation_messages',
  'clarification_requests_360', 'learned_directives_360', 'channel_deliveries',
  'domain_handoffs_360',
]) {
  assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
}

const flywheelMigration = await readFile(path.join(root, 'infra/postgres/init/09-flywheel-learning.sql'), 'utf8');
for (const table of [
  'promoted_knowledge', 'golden_exemplars', 'decision_outcomes', 'negative_memory', 'flywheel_audit_events'
]) {
  assert.match(flywheelMigration, new RegExp(`CREATE TABLE ${table}`));
}

const workflowFiles = (await readdir(path.join(root, 'n8n/workflows'))).filter((name) => name.endsWith('.json'));
for (const file of workflowFiles) {
  JSON.parse(await readFile(path.join(root, 'n8n/workflows', file), 'utf8'));
}

console.log(JSON.stringify({
  status: 'PASS',
  architecture: 'N8N_LOCAL_CORE',
  workflow: workflow.name,
  pollingDefault: false,
  workflowCount: workflowFiles.length,
}, null, 2));
