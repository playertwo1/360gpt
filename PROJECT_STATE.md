# PROJECT STATE

> ERRATA CODEX RESOLVIDA: WF-101 corrigido, publicado e ativo com activeVersionId no n8n 2.x e reconciliado após cold start. WF-104 permanece estritamente desligado (active: false), AUTO_PROMOTION_ENABLED=false em .env.n8n e Gate N7 BLOCKED aguardando parecer final do auditor independente ChatGPT Codex.

Version: 6.3.0-gates-a0-n2.3-quarta-remediacao
Current phase: Quarta remediação concluída — submetida para reauditoria independente
Current milestone: Q8 — sincronização de governança, dossiê formal e reauditoria Codex
Current task: Submeter dossiê `docs/audits/RESPOSTA_QUARTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md` para apreciação do auditor independente ChatGPT Codex
Status: REMEDIATION_COMPLETED_PENDING_AUDIT

## Host baseline

- AMD Ryzen 5 5600X, 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- PostgreSQL 17.6 e n8n 2.36.7 no Docker.

## Last completed

1. **Bloco Q0 (Contenção e Checkpoint):** WF-104 verificado inativo (`active = false`), `AUTO_PROMOTION_ENABLED=false`, Gate N7 `BLOCKED`. Backups duráveis `backup_visao360_q0.dump` e `backup_n8n_q0.dump` gerados com catálogo TOC legível.
2. **Bloco Q1 (Verdade dos Testes e Arquivos):** Regex de arquitetura corrigida, `exported_all.json` regenerado de forma limpa (14 workflows), `npm test` (35/35 suítes PASS), `npm run lint` (0 erros) e `npm run build` (sucesso).
3. **Bloco Q2 (Desduplicação e Reconciliação):** Arquivos redundantes arquivados com rastreabilidade em `n8n/workflows/archive/`. Workflows canônicos únicos e reconciliados.
4. **Bloco Q3 (Banco e Contratos):** Constraints de banco sincronizadas com JSON Schema Draft 2020-12.
5. **Bloco Q4 (Controlador Canônico WF-101 Completo e Publicado):** WF-101 publicado no n8n 2.x com `activeVersionId` idêntico a `versionId`. Nó 02 atualizado com claim e lease recovery automático de eventos expirados. Nó 04 atualizado com funções `SECURITY DEFINER`. Nó 05 com `/status` dinâmico consumindo `/health/system` (Docling 1.9ms, Worker 1.7ms, Adapter 0.1ms) e rota `DOCUMENT` completa com integração ao Docling TableFormer CPU. Nó 08 com envio autenticado via secret estático.
6. **Bloco Q5 (Governança PostgreSQL — Migration 12):** Migration `infra/postgres/init/12-flywheel-security-and-lifecycle.sql` aplicada. Revogado DML direto de `visao360_app` sobre `promoted_knowledge`. Criadas 5 funções `SECURITY DEFINER` com auditoria atômica transacional e constraints estritas `chk_no_auto_textual` e `chk_no_inferred_global_active`.
7. **Bloco Q6 (AUTO Seguro e Preferências Estruturadas):** `learning-engine.mjs` restringe modo `AUTO` a preferências estruturadas enumeradas em catálogo fechado (`RESPONSE_LENGTH`, `TABLE_PREFERENCE`, `TONE`, `SECTION_ORDER`). Templates versionados aplicados. Texto livre no modo `AUTO` 100% erradicado. Avaliação de risco fail-closed (`HIGH`) contra evasões semânticas e exigência de evento soberano autenticado de Rafael para `OWNER_EXPLICIT`.
8. **Bloco Q7 (Bateria E2E Proporcional):** Suíte adversarial com os 5 bypasses específicos do Codex 100% aprovada (`adversarial-corpus-quarta-remediacao.test.mjs`). 10/10 etapas de integração no PostgreSQL real aprovadas (`flywheel-learning-postgres-integration.test.mjs`). Teste de cold start com reinicialização do container `visao-360-n8n-1` ativando automaticamente WF-100 e WF-101 com `activeVersionId` intacto.
9. **Bloco Q8 (Dossiê Formal de Resposta e Sincronização):** Elaborado `docs/audits/RESPOSTA_QUARTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md` respondendo individualmente aos 20 achados e às 30 perguntas obrigatórias do Codex. Sincronizados `ROADMAP.md`, `PROJECT_STATE.md`, `CHANGELOG.md` e `AGENTS.md`.

## Last validation

Result: PASS

- `npm test`: PASS, exit 0 (35/35 suítes).
- `node tests/adversarial-corpus-quarta-remediacao.test.mjs`: PASS, exit 0 (100% bloqueio adversarial).
- `node tests/flywheel-learning-postgres-integration.test.mjs`: PASS, exit 0 (10/10 etapas no banco real).
- `npm run lint`: PASS, exit 0, 23 warnings, zero errors.
- `npm run build`: PASS, exit 0.
- Teste n8n canônico (`node scripts/test-n8n-canonical-architecture.mjs`): PASS, exit 0 (0 rotas bridge, 0 mocks, 26 workflows validados).
- Teste ponta a ponta: Inbound `ecd100c6` completado com sucesso e Delivery `d31a1c46` enviado via Telegram com latências reais dinâmicas.

Last commit: `HEAD` (a registrar pós-commit)
Last implementation checkpoint: Quarta Remediação dos Gates A0 e N2.3 concluída e validada no runtime real.

## Runtime observed

- `visao-360-n8n-1`: healthy; WF-100 e WF-101 ativados automaticamente após cold start.
- `visao-360-postgres-1`: healthy; PostgreSQL 17.6 local ativo.
- `visao-360-document-worker-1`: healthy; FastAPI respondendo em 1.7ms.
- `visao-360-docling-1`: healthy; Docling TableFormer CPU respondendo em 1.9ms.
- `visao-360-telegram-poller-1`: healthy; endpoint `/health/system` ativo com latências dinâmicas.
- WF-100: publicado e ativo (`activeVersionId = f7a6a439-50fa-40f4-bda8-54b9cf6d226a`).
- WF-101: publicado e ativo (`activeVersionId = d3725cb0-ccbd-4171-aa3b-fd4bfb07353f`).
- WF-103: importado como contingência de erro.
- WF-104: inativo (`active = false`, `activeVersionId = null`).

## Blockers

- Gate N7 permanece `BLOCKED` até aprovação formal da reauditoria independente do ChatGPT Codex e corte de produção.

## Decisions

- n8n é o controlador operacional exclusivo da jornada 360.
- Telegram e Sites são canais de transporte neutros.
- Modo `AUTO` de aprendizado aceita estritamente preferências estruturadas enumeradas (`STRUCTURED_PREFERENCE`).
- Texto livre em modo `AUTO` está permanentemente erradicado.
- Mutações de diretrizes ocorrem exclusivamente via funções `SECURITY DEFINER` com auditoria atômica append-only em nível de banco.
- Regras de escopo `GLOBAL` ou de risco alto exigem evento soberano autenticado de Rafael (`OWNER_EXPLICIT`).
- WF-104 e feature flag `AUTO_PROMOTION_ENABLED` permanecem rigorosamente inativos no operacional até deliberação soberana de Rafael.

## Evidence

- `docs/audits/RESPOSTA_QUARTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md` — dossiê formal de resposta aos 20 achados e 30 perguntas.
- `docs/audits/REAUDITORIA_E_GUIA_QUARTA_REMEDIACAO_A0_N2_3_COMMIT_D437A0C.md` — guia executado.
- `infra/postgres/init/12-flywheel-security-and-lifecycle.sql` — migration de segurança e lifecycle.
- `tests/adversarial-corpus-quarta-remediacao.test.mjs` — suíte de testes adversariais.
- `n8n/workflows/exported_all.json` — export limpo dos 14 workflows.
- `backups/durable/backup_visao360_q0.dump`
- `backups/durable/backup_n8n_q0.dump`
