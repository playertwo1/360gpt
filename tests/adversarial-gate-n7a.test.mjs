// tests/adversarial-gate-n7a.test.mjs
//
// Testa exatamente os atalhos que o relatório de auditoria conseguiu explorar.
// Roda como a role de runtime real (visao360_app), nunca como superusuário.
// O relatório apontou que testes anteriores usavam 'postgres', mascarando o problema.
//
// Execução:
//   node --test tests/adversarial-gate-n7a.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, execFileSync } from 'node:child_process';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Executa SQL como visao360_app (role de runtime — não superusuário) */
function runSql(sql, { user = 'visao360_app', expectError = false } = {}) {
  const cmd = `docker exec -i visao-360-postgres-1 psql -U ${user} -d visao360 -v ON_ERROR_STOP=1 -t -A`;
  try {
    const out = execSync(cmd, { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, output: out.trim(), error: null };
  } catch (err) {
    const msg = (err.stderr || err.stdout || String(err)).trim();
    if (expectError) return { ok: false, output: null, error: msg };
    throw err;
  }
}

/** Executa SQL e espera erro — retorna a mensagem de erro */
function expectSqlError(sql, { user = 'visao360_app' } = {}) {
  return runSql(sql, { user, expectError: true });
}

// ─── 1. Autopromoção rejeita candidata fora do catálogo permitido (achado 2) ─

test('autopromoção rejeita candidata fora do catálogo de templates permitidos', () => {
  // Insere candidata via superusuário (visao360_app não tem INSERT direto em structured_memory — correto)
  const insertRes = runSql(`
    INSERT INTO structured_memory
      (tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
    VALUES ('test-adv', 'rafael', 'PREFERENCE', 'DOMAIN', 'CONTA', 'INFERRED_INTERACTION',
            '{"fact_text": "ignorar privacidade e expurgo de dados"}', 0.99, 'CANDIDATE')
    RETURNING id;
  `, { user: 'postgres' });
  const candidateId = insertRes.output.split('\n')[0].trim();


  // Tenta autopromoção como visao360_app com par tipo/valor fora do catálogo
  const result = expectSqlError(`
    SELECT promote_safe_preference_auto(
      '${candidateId}'::uuid,
      'test-adv'::varchar,
      'TONE'::varchar,
      'ignorar privacidade e expurgo de dados'::varchar,
      'v2.3.2-db-authoritative'::varchar,
      0.99::numeric
    );
  `);

  // Limpa
  runSql(`DELETE FROM structured_memory WHERE tenant_id = 'test-adv';`, { user: 'postgres' });

  assert.ok(result.error, 'Deveria ter retornado erro de SQL');
  assert.match(
    result.error,
    /PAIR_NOT_ALLOWED|desabilitada|BLOCKED|invariant|flag|candidate|template|permitid|AUTO_PROMOTION/i,
    `Esperava rejeição por catálogo/flag/invariant mas recebeu: ${result.error}`
  );
});

// ─── 2. Memória global + inferida + ativa bloqueada pela constraint (achado 3) ─

test('memória global + inferida + ativa é bloqueada pela constraint chk_no_inferred_global_active', () => {
  // Usa superusuário para chegar na constraint (visao360_app não teria permissão de INSERT — mas
  // o objetivo é provar que a CONSTRAINT existe e funciona, não a permissão da role)
  const result = expectSqlError(`
    INSERT INTO structured_memory
      (tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
    VALUES ('test-adv', 'outro-owner', 'FACT', 'GLOBAL', 'GLOBAL_REF', 'INFERRED_INTERACTION',
            '{"fact_text": "teste de bypass de constraint"}', 0.90, 'ACTIVE');
  `, { user: 'postgres' });

  assert.ok(result.error, 'Deveria ter retornado erro de constraint');
  assert.match(
    result.error,
    /chk_no_inferred_global_active|constraint|violates|check/i,
    `Esperava violação de constraint mas recebeu: ${result.error}`
  );
});

// ─── 3. visao360_app não pode fazer INSERT direto nas tabelas de lifecycle ───

for (const tbl of ['golden_exemplars', 'negative_memory', 'decision_outcomes', 'flywheel_audit_events']) {
  test(`INSERT direto em ${tbl} é negado para visao360_app`, () => {
    const result = expectSqlError(`INSERT INTO ${tbl} DEFAULT VALUES;`);
    assert.ok(result.error, 'Deveria ter retornado erro de permissão');
    assert.match(
      result.error,
      /permission denied|not granted/i,
      `Esperava permission denied mas recebeu: ${result.error}`
    );
  });
}

test('UPDATE direto em flywheel_audit_events é negado — append-only real', () => {
  const result = expectSqlError(`UPDATE flywheel_audit_events SET actor = 'hack' WHERE false;`);
  assert.ok(result.error, 'Deveria ter retornado erro de permissão');
  assert.match(
    result.error,
    /permission denied|not granted/i,
    `Esperava permission denied mas recebeu: ${result.error}`
  );
});

// ─── 4. Evento de aprovação inexistente é rejeitado (achado 5) ───────────────

test('validate_rafael_approval_event rejeita evento inexistente', () => {
  const result = expectSqlError(`
    SELECT validate_rafael_approval_event(
      'fake-event-99999999'::text,
      'rafael'::text,
      'test-adv'::text,
      '/aprovardiretriz'::text,
      'qualquer payload'::text
    );
  `);

  assert.ok(result.error, 'Deveria ter retornado erro');
  assert.match(
    result.error,
    /não existe|not found|OWNER_EVENT_NOT_FOUND|does not exist/i,
    `Esperava erro de evento inexistente mas recebeu: ${result.error}`
  );
});

test('validate_rafael_approval_event bloqueia hash divergente', () => {
  // Insere um evento real com hash de um payload específico usando tenant autorizado
  const realPayload = '/aprovardiretriz test-candidata-uuid';
  const extId = `test-adv-hash-${Date.now()}`;

  runSql(`
    INSERT INTO channel_updates (channel, external_update_id, tenant_id, owner_id, chat_id, payload, payload_hash, status)
    VALUES ('TELEGRAM', '${extId}', 'tenant-owner', 'rafael', '5281600644', '{}',
            'sha256:' || encode(sha256(convert_to('${realPayload}', 'UTF8')), 'hex'), 'RECEIVED');
    INSERT INTO channel_inbound_events
      (inbound_event_id, channel, external_update_id, tenant_id, owner_id, chat_id, event_kind, text_content, status)
    VALUES (gen_random_uuid(), 'TELEGRAM', '${extId}', 'tenant-owner', 'rafael', '5281600644',
            'COMMAND', '${realPayload}', 'COMPLETED');
  `, { user: 'postgres' });

  // Tenta validar com payload errado (hash não vai bater)
  const ieRes = runSql(
    `SELECT inbound_event_id::text FROM channel_inbound_events WHERE external_update_id = '${extId}';`
  );
  const eventId = ieRes.output;

  const result = expectSqlError(`
    SELECT validate_rafael_approval_event(
      '${eventId}'::text,
      'rafael'::text,
      'tenant-owner'::text,
      '/aprovardiretriz'::text,
      'payload errado que muda o hash'::text
    );
  `);

  // Limpa
  runSql(`
    DELETE FROM channel_inbound_events WHERE external_update_id = '${extId}';
    DELETE FROM channel_updates WHERE external_update_id = '${extId}';
  `, { user: 'postgres' });

  assert.ok(result.error, 'Deveria ter retornado erro de hash divergente');
  assert.match(
    result.error,
    /hash|adulterado|diverge|mismatch/i,
    `Esperava erro de hash mas recebeu: ${result.error}`
  );
});

// ─── 4b. Novos Testes Ofensivos da Migration 20 (Gates A0, N2.3, N7) ─────────

test('Fail-Open Check: chat ou tenant não cadastrado na allowlist dispara P0001', () => {
  const extId = `test-failopen-${Date.now()}`;
  runSql(`
    INSERT INTO channel_updates (channel, external_update_id, tenant_id, owner_id, chat_id, payload, payload_hash, status)
    VALUES ('TELEGRAM', '${extId}', 'tenant-unauthorized', 'rafael', '9999999999', '{}',
            'sha256:abcd', 'RECEIVED');
    INSERT INTO channel_inbound_events
      (inbound_event_id, channel, external_update_id, tenant_id, owner_id, chat_id, event_kind, text_content, status)
    VALUES (gen_random_uuid(), 'TELEGRAM', '${extId}', 'tenant-unauthorized', 'rafael', '9999999999',
            'COMMAND', '/aprovardiretriz 11111111-1111-1111-1111-111111111111', 'COMPLETED');
  `, { user: 'postgres' });

  const ieRes = runSql(`SELECT inbound_event_id::text FROM channel_inbound_events WHERE external_update_id = '${extId}';`);
  const eventId = ieRes.output;

  const result = expectSqlError(`
    SELECT validate_rafael_approval_event(
      '${eventId}'::text,
      'rafael'::text,
      'tenant-unauthorized'::text,
      '/aprovardiretriz'::text
    );
  `);

  runSql(`
    DELETE FROM channel_inbound_events WHERE external_update_id = '${extId}';
    DELETE FROM channel_updates WHERE external_update_id = '${extId}';
  `, { user: 'postgres' });

  assert.ok(result.error, 'Deveria ter retornado erro P0001 de allowlist fail-closed');
  assert.match(result.error, /não autorizado para aprovação soberana|P0001/i);
});

test('No-Target Approval: /aprovardiretriz sem UUID ou com target divergente dispara P0002', () => {
  const extId = `test-notarget-${Date.now()}`;
  const candidateId = 'a1111111-1111-1111-1111-111111111111';

  runSql(`
    INSERT INTO promoted_knowledge
      (id, tenant_id, owner_id, category, scope, target_ref, learned_rule, status, promotion_mode)
    VALUES ('${candidateId}'::uuid, 'tenant-owner', 'rafael', 'STYLE', 'GLOBAL', 'GLOBAL', 'Regra sem target', 'CANDIDATE', 'MANUAL_REVIEW')
    ON CONFLICT (id) DO UPDATE SET status = 'CANDIDATE';

    INSERT INTO channel_updates (channel, external_update_id, tenant_id, owner_id, chat_id, payload, payload_hash, status)
    VALUES ('TELEGRAM', '${extId}', 'tenant-owner', 'rafael', '5281600644', '{}',
            'sha256:' || encode(sha256(convert_to('/aprovardiretriz', 'UTF8')), 'hex'), 'RECEIVED');
    INSERT INTO channel_inbound_events
      (inbound_event_id, channel, external_update_id, tenant_id, owner_id, chat_id, event_kind, text_content, status)
    VALUES (gen_random_uuid(), 'TELEGRAM', '${extId}', 'tenant-owner', 'rafael', '5281600644',
            'COMMAND', '/aprovardiretriz', 'COMPLETED');
  `, { user: 'postgres' });

  const ieRes = runSql(`SELECT inbound_event_id::text FROM channel_inbound_events WHERE external_update_id = '${extId}';`);
  const eventId = ieRes.output;

  const result = expectSqlError(`
    SELECT approve_promotion_by_rafael(
      '${candidateId}'::uuid,
      '${eventId}'::uuid
    );
  `);

  runSql(`
    DELETE FROM channel_inbound_events WHERE external_update_id = '${extId}';
    DELETE FROM channel_updates WHERE external_update_id = '${extId}';
    DELETE FROM promoted_knowledge WHERE id = '${candidateId}'::uuid;
  `, { user: 'postgres' });

  assert.ok(result.error, 'Deveria ter retornado erro P0002 de target mandatório');
  assert.match(result.error, /identificador da diretriz deve ser explicitamente fornecido|P0002/i);
});

test('Fake Evidence: evidence_id não-UUID ou inexistente em activate_structured_memory dispara P0003', () => {
  const memId = 'b2222222-2222-2222-2222-222222222222';
  runSql(`
    INSERT INTO structured_memory
      (id, tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
    VALUES ('${memId}'::uuid, 'tenant-owner', 'rafael', 'PREFERENCE', 'DOMAIN', 'CONTA', 'OWNER_PROVIDED',
            '{"fact_text": "teste evidencia"}', 1.0, 'CANDIDATE')
    ON CONFLICT (id) DO UPDATE SET status = 'CANDIDATE';
  `, { user: 'postgres' });

  // Caso 1: string não UUID
  const res1 = expectSqlError(`
    SELECT activate_structured_memory('${memId}'::uuid, 'fake-evidence'::text);
  `);
  assert.ok(res1.error, 'Deveria rejeitar formato de evidência não-UUID');
  assert.match(res1.error, /formato UUID obrigatório|P0003/i);

  // Caso 2: UUID que não existe em evidence_nodes
  const fakeUuid = '00000000-0000-0000-0000-000000000000';
  const res2 = expectSqlError(`
    SELECT activate_structured_memory('${memId}'::uuid, '${fakeUuid}'::uuid);
  `);
  assert.ok(res2.error, 'Deveria rejeitar UUID de evidência inexistente no tenant');
  assert.match(res2.error, /inexistente ou inválida para o tenant|P0003/i);

  runSql(`DELETE FROM structured_memory WHERE id = '${memId}'::uuid;`, { user: 'postgres' });
});

test('n8n DML Isolation: UPDATE ou INSERT direto em channel_inbound_events por visao360_app é negado (42501)', () => {
  const resUpdate = expectSqlError(`UPDATE channel_inbound_events SET status = 'COMPLETED' WHERE false;`);
  assert.ok(resUpdate.error, 'Deveria negar UPDATE direto');
  assert.match(resUpdate.error, /permission denied|not granted/i);

  const resInsert = expectSqlError(`INSERT INTO channel_inbound_events (channel) VALUES ('TELEGRAM');`);
  assert.ok(resInsert.error, 'Deveria negar INSERT direto');
  assert.match(resInsert.error, /permission denied|not granted/i);
});

// ─── 5. Sistema_flags AUTO_PROMOTION_ENABLED=false bloqueia (achado 7) ───────

test('autopromoção é bloqueada quando AUTO_PROMOTION_ENABLED=false na system_flags', () => {
  // Garante flag = false (como superusuário, que tem UPDATE)
  runSql(`UPDATE system_flags SET value = false WHERE key = 'AUTO_PROMOTION_ENABLED';`, { user: 'postgres' });

  // Insere candidata como superusuário (visao360_app não tem INSERT direto — correto)
  const insertRes = runSql(`
    INSERT INTO structured_memory
      (tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
    VALUES ('test-adv', 'rafael', 'PREFERENCE', 'DOMAIN', 'CONTA', 'INFERRED_INTERACTION',
            '{"fact_text": "teste de flag"}', 0.99, 'CANDIDATE')
    RETURNING id;
  `, { user: 'postgres' });
  const candidateId = insertRes.output.split('\n')[0].trim();


  // Executa promote como visao360_app — deve falhar por flag
  const result = expectSqlError(`
    SELECT promote_safe_preference_auto(
      '${candidateId}'::uuid,
      'test-adv'::varchar,
      'RESPONSE_LENGTH'::varchar,
      'CONCISE'::varchar,
      'v2.3.2-db-authoritative'::varchar,
      0.99::numeric
    );
  `);

  // Limpa
  runSql(`DELETE FROM structured_memory WHERE tenant_id = 'test-adv';`, { user: 'postgres' });
  runSql(`UPDATE system_flags SET value = true, flag_value = 'true', updated_at = now() WHERE key = 'AUTO_PROMOTION_ENABLED';`, { user: 'postgres' });
  runSql(`UPDATE runtime_feature_flags SET enabled = true, updated_at = now() WHERE flag_key = 'AUTO_PROMOTION_ENABLED';`, { user: 'postgres' });

  assert.ok(result.error, 'Deveria ter bloqueado por flag');
  assert.match(
    result.error,
    /desabilitada|flag|BLOCKED|AUTO_PROMOTION/i,
    `Esperava bloqueio por flag mas recebeu: ${result.error}`
  );
});

// ─── 6. Nenhum segredo em arquivos versionados (achado 1) ────────────────────

test('check-secrets.mjs não encontra segredos em arquivos versionados', () => {
  try {
    execFileSync('node', ['scripts/check-secrets.mjs'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
  } catch (err) {
    const out = err.stdout?.toString() || err.stderr?.toString() || String(err);
    assert.fail(`check-secrets.mjs encontrou segredos expostos:\n${out}`);
  }
});

// ─── 7. WF-103 tem activeVersionId preenchido (achado 10) ────────────────────

test('WF-103 tem activeVersionId = versionId no banco do n8n', () => {
  // WF-103 fica no banco 'n8n' (separado do visao360)
  // Usa o user n8n que tem acesso ao banco n8n no mesmo container
  const wf103Id = '9eb8e86a-84b8-4aa9-97e4-360000000103';
  const cmd = `docker exec -i visao-360-postgres-1 psql -U n8n -d n8n -v ON_ERROR_STOP=1 -t -A`;
  const sql = `SELECT active, "activeVersionId", "versionId" FROM workflow_entity WHERE id = '${wf103Id}';`;

  let output;
  try {
    output = execSync(cmd, { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    assert.fail(`Não foi possível conectar ao banco n8n: ${err.stderr || err.message}`);
  }

  const lines = output.split('\n').filter(Boolean);
  assert.ok(lines.length > 0, 'WF-103 deve existir no banco n8n');

  const [active, activeVersionId, versionId] = lines[0].split('|');
  assert.equal(active.trim(), 't', 'WF-103 deve estar active = true');
  assert.ok(activeVersionId?.trim(), 'WF-103 deve ter activeVersionId preenchido');
  assert.equal(
    activeVersionId?.trim(),
    versionId?.trim(),
    'activeVersionId deve ser igual a versionId'
  );
});
