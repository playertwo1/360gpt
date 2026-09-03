import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile('infra/postgres/init/13-n7-fifth-remediation-hardening.sql','utf8');
const compose = await readFile('compose.n8n.yaml','utf8');
const learning = await readFile('engines/learning/learning-engine.mjs','utf8');

// Banco deve ser a ultima barreira.
assert.match(migration,/REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public\.golden_exemplars FROM visao360_app/);
assert.match(migration,/REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public\.negative_memory FROM visao360_app/);
assert.match(migration,/REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public\.decision_outcomes FROM visao360_app/);
assert.match(migration,/REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public\.flywheel_audit_events FROM visao360_app/);
assert.match(migration,/REVOKE ALL ON FUNCTION public\.promote_safe_preference_auto[\s\S]*FROM PUBLIC/);
assert.match(migration,/REVOKE ALL ON FUNCTION public\.owner_promote_candidate[\s\S]*FROM PUBLIC/);
assert.match(migration,/chk_no_inferred_global_active/);

// AUTO deve consultar candidata e catalogo no DB e falhar fechado pela flag.
assert.match(migration,/runtime_feature_flags/);
assert.match(migration,/AUTO_PROMOTION_DISABLED/);
assert.match(migration,/SELECT \* INTO c FROM public\.promoted_knowledge/);
assert.match(migration,/SELECT \* INTO cat FROM public\.auto_preference_catalog/);
assert.match(migration,/c\.risk_level <> 'LOW'/);
assert.match(migration,/c\.scope = 'GLOBAL'/);
assert.match(migration,/c\.frequency < 2/);
assert.match(migration,/c\.learned_rule <> cat\.canonical_rule_text/);

// OWNER_EXPLICIT deve usar evento real, chat allowlisted, comando e consumo unico.
assert.match(migration,/owner_channel_allowlist/);
assert.match(migration,/owner_approval_consumptions/);
assert.match(migration,/OWNER_EVENT_ALREADY_USED/);
assert.match(migration,/OWNER_EVENT_NOT_APPROVAL_COMMAND/);
assert.match(migration,/OWNER_EVENT_HASH_MISMATCH/);
assert.match(migration,/channel_inbound_events/);
assert.match(migration,/channel_updates/);

// Hash deve incluir payload completo.
assert.match(migration,/audit_event_hash/);
assert.match(migration,/coalesce\(p_payload::text,'\{\}'\)/);

// Compose nao pode conter fallback hexadecimal de segredo.
assert.doesNotMatch(compose,/BRIDGE_SHARED_SECRET:-[0-9a-f]{32,}/i);
assert.doesNotMatch(compose,/DIRECTOR360_TRANSPORT_SECRET:\s*\$\{BRIDGE_SHARED_SECRET:-[0-9a-f]/i);

// JS nao pode declarar autenticacao apenas por formato de hash.
assert.doesNotMatch(learning,/ownerEvent\.owner_id === 'rafael'[\s\S]{0,300}\^\[0-9a-f\]\{64\}/i);

console.log('N7 fifth-remediation static security gates: PASS');
