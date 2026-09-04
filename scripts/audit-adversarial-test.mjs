#!/usr/bin/env node
/**
 * scripts/audit-adversarial-test.mjs
 * Validação de Defesa em Profundidade: Executado como 'visao360_app'
 * Garante que atalhos e ataques de injeção/bypass falhem fechados.
 *
 * Utiliza o container PostgreSQL visao360 via docker exec como role visao360_app.
 */

import { execSync } from 'node:child_process';

let passedAttacksBlocked = 0;
const totalAttacks = 7;

function runSql(sql, { user = 'visao360_app' } = {}) {
  const cmd = `docker exec -i visao-360-postgres-1 psql -U ${user} -d visao360 -v ON_ERROR_STOP=1 -t -A`;
  try {
    const out = execSync(cmd, { input: sql, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, output: out.trim(), error: null, code: '00000' };
  } catch (err) {
    const stderr = (err.stderr || err.stdout || String(err)).trim();
    // Extrai código de erro se presente (ex: 42501, 23514, P0001)
    let code = 'ERROR';
    if (/permission denied/i.test(stderr)) code = '42501';
    else if (/violates check constraint|chk_no_inferred_global_active/i.test(stderr)) code = '23514';
    else if (/desabilitada|flag|BLOCKED|PAIR_NOT_ALLOWED|não existe|diverge/i.test(stderr)) code = 'P0001';
    return { ok: false, output: null, error: stderr, code };
  }
}

async function assertAttackBlocked(testName, action, expectedErrorCodes) {
  try {
    const res = await action();
    if (res.ok) {
      console.error(`\x1b[31m[VULNERÁVEL]\x1b[0m ${testName} -> O banco aceitou a operação indevida!`);
      throw new Error(`Segurança comprometida: ${testName}`);
    }

    const matched = expectedErrorCodes.includes(res.code) ||
      expectedErrorCodes.some(c => res.error.includes(c)) ||
      /permission denied|constraint|violates|desabilitada|flag|não existe|diverge|PAIR_NOT_ALLOWED/i.test(res.error);

    if (matched) {
      console.log(`\x1b[32m[DEFESA CONFIRMADA]\x1b[0m ${testName} (Bloqueado com erro: ${res.code} - ${res.error.split('\n')[0]})`);
      passedAttacksBlocked++;
    } else {
      console.error(`\x1b[33m[ERRO INESPERADO]\x1b[0m ${testName} falhou com código ${res.code}: ${res.error}`);
      throw new Error(res.error);
    }
  } catch (error) {
    if (error.message.includes('Segurança comprometida')) throw error;
    throw error;
  }
}

async function runAdversarialSuite() {
  console.log('\x1b[34m[AUDITORIA INTERNA]\x1b[0m Iniciando testes ofensivos como role restrita: visao360_app...\n');

  try {
    // =========================================================================
    // ATAQUE 1: Inserção Direta em Tabelas de Lifecycle (Bypass de DML)
    // =========================================================================
    await assertAttackBlocked(
      'Ataque 1: Inserção direta de Golden Exemplar sem validação',
      async () => runSql(`INSERT INTO golden_exemplars DEFAULT VALUES;`, { user: 'visao360_app' }),
      ['42501']
    );

    await assertAttackBlocked(
      'Ataque 1.1: Modificação direta de Decision Outcomes (Alterar histórico)',
      async () => runSql(`UPDATE decision_outcomes SET outcome_type = 'ACEITO_INTEGRAL' WHERE id = '00000000-0000-0000-0000-000000000000';`, { user: 'visao360_app' }),
      ['42501']
    );

    // =========================================================================
    // ATAQUE 2: Violação de Constraint - Memória Inferida Global Ativa
    // =========================================================================
    await assertAttackBlocked(
      'Ataque 2: Criação de Memória Inferida Global Ativa (chk_no_inferred_global_active)',
      async () => runSql(`
        INSERT INTO structured_memory
          (tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
        VALUES ('test-audit', 'outro-owner', 'FACT', 'GLOBAL', 'GLOBAL_REF', 'INFERRED_INTERACTION',
                '{"ignore": "privacy"}', 0.90, 'ACTIVE');
      `, { user: 'postgres' }), // Usa postgres para verificar a constraint, não permissão de DML
      ['23514', 'chk_no_inferred_global_active']
    );

    // =========================================================================
    // ATAQUE 3: Autopromoção Forçada com Risco HIGH
    // =========================================================================
    await assertAttackBlocked(
      'Ataque 3: Tentar autopromover regra de risco HIGH via função protegida',
      async () => {
        // Insere candidata com valor não autorizado
        const insertRes = runSql(`
          INSERT INTO structured_memory
            (tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
          VALUES ('test-audit', 'rafael', 'PREFERENCE', 'DOMAIN', 'CONTA', 'INFERRED_INTERACTION',
                  '{"fact_text": "bypass_compliance"}', 0.99, 'CANDIDATE')
          RETURNING id;
        `, { user: 'postgres' });
        const candidateId = insertRes.output.split('\n')[0].trim();

        const res = runSql(`
          SELECT promote_safe_preference_auto(
            '${candidateId}'::uuid,
            'test-audit'::varchar,
            'TONE'::varchar,
            'bypass_compliance'::varchar,
            'v2.3.2-db-authoritative'::varchar,
            0.99::numeric
          );
        `, { user: 'visao360_app' });

        runSql(`DELETE FROM structured_memory WHERE tenant_id = 'test-audit';`, { user: 'postgres' });
        return res;
      },
      ['P0001', 'PAIR_NOT_ALLOWED']
    );

    // =========================================================================
    // ATAQUE 4: Falsa Aprovação de Rafael (Hash inventado / Evento inexistente)
    // =========================================================================
    await assertAttackBlocked(
      'Ataque 4: Falsificação de aprovação de Rafael com 64 "a"s e sem evento real',
      async () => {
        const fakeHash = 'a'.repeat(64);
        return runSql(`
          SELECT validate_rafael_approval_event(
            '00000000-0000-0000-0000-000000000001'::text,
            'rafael'::text,
            'test-audit'::text,
            '/aprovardiretriz'::text,
            '${fakeHash}'::text
          );
        `, { user: 'visao360_app' });
      },
      ['P0001', 'não existe']
    );

    // =========================================================================
    // ATAQUE 5: Kill-Switch / Flag de Desligamento Efetiva
    // =========================================================================
    await assertAttackBlocked(
      'Ataque 5: Tentar autopromoção com Kill-Switch ativado (AUTO_PROMOTION_ENABLED=false)',
      async () => {
        runSql(`UPDATE system_flags SET value = false WHERE key = 'AUTO_PROMOTION_ENABLED';`, { user: 'postgres' });

        const insertRes = runSql(`
          INSERT INTO structured_memory
            (tenant_id, owner_id, memory_type, scope, target_ref, origin, data, confidence_score, status)
          VALUES ('test-audit', 'rafael', 'PREFERENCE', 'DOMAIN', 'CONTA', 'INFERRED_INTERACTION',
                  '{"tone": "formal"}', 0.95, 'CANDIDATE')
          RETURNING id;
        `, { user: 'postgres' });
        const candidateId = insertRes.output.split('\n')[0].trim();

        const res = runSql(`
          SELECT promote_safe_preference_auto(
            '${candidateId}'::uuid,
            'test-audit'::varchar,
            'RESPONSE_LENGTH'::varchar,
            'CONCISE'::varchar,
            'v2.3.2-db-authoritative'::varchar,
            0.95::numeric
          );
        `, { user: 'visao360_app' });

        runSql(`DELETE FROM structured_memory WHERE tenant_id = 'test-audit';`, { user: 'postgres' });
        return res;
      },
      ['P0001', 'desabilitada']
    );

    // =========================================================================
    // ATAQUE 6: Injeção de Evento Falso no Flywheel Audit
    // =========================================================================
    await assertAttackBlocked(
      'Ataque 6: Inserção manual de auditoria em flywheel_audit_events (DML bloqueado)',
      async () => runSql(`
        INSERT INTO flywheel_audit_events DEFAULT VALUES;
      `, { user: 'visao360_app' }),
      ['42501']
    );

    console.log(`\n\x1b[32m✔ SUCESSO ABSOLUTO: ${passedAttacksBlocked}/${totalAttacks} ataques foram contidos pelo banco!\x1b[0m`);
    process.exit(0);
  } catch (err) {
    console.error('\n\x1b[31m✘ FALHA CRÍTICA NO TESTE OFENSIVO:\x1b[0m', err);
    process.exit(1);
  }
}

runAdversarialSuite();
