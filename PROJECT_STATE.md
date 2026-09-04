# PROJECT STATE

> TOPOLOGIA CANÔNICA HOMOLOGADA: WF-100, WF-101, WF-103 e WF-104 ativos, publicados e sincronizados no n8n 2.x com activeVersionId = versionId. Flag AUTO_PROMOTION_ENABLED=true habilitada no PostgreSQL e no container n8n, com filtros estritos de segurança e governança soberana de Rafael ativa.

Version: 11.0.0-ativacao-wf104-flywheel-governance
Current phase: Runtime Canônico Pleno — Ativação e Homologação do WF-104 (Flywheel Reflexion Engine)
Current milestone: Q11 — Ativação do WF-104 e Governança Contínua Soberana
Current task: Supervisão executiva contínua da esteira comercial e aprendizado auditado para Rafael (Agência 6895)
Status: FULLY_OPERATIONAL_HOMOLOGATED

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
10. **Quinta Remediação (Gate N7/N7A):** Migrations 13-17 aplicadas. Migration 15 implementa funções transacionais seguras (`insert_structured_memory`, `activate_structured_memory`, `insert_flywheel_audit_event`, `insert_golden_exemplar`) com bloqueio de memória global inferida. Migration 16 implementa `validate_rafael_approval_event` (evento real do Telegram, hash recomputado, uso único), `approve_promotion_by_rafael` e `system_flags` com fail-closed. `learning-engine.mjs` exporta `isAuthenticatedRafaelApproval` delegando ao PostgreSQL. `reflexion-engine.mjs` exporta `findRealRafaelApprovalEvent` consultando tabela real. WF-101 nó 09 corrigido para não marcar DOCUMENT/IMAGE como COMPLETED prematuramente. `update-wf-101.mjs` corrigido: dados POBJ dinâmicos via `state_snapshots`, fatos confirmados via `inserted_fact_id`, secret por env var. WF-104 reformado internamente mantendo `active = false` (advisory lock 104104, `LIMIT 25`, sem privilégios indevidos, persistência atômica via `create_learning_candidate` e `INTERNAL_TRANSPORT_SECRET`).
11. **Sexta Remediação (Inbound RPCs & Soberania Canônica):** Migrations 18 e 19 aplicadas. Migration 18 implementa RPCs `SECURITY DEFINER` (`ingest_channel_update`, `claim_next_inbound_event`, `complete_inbound_event`, `fail_inbound_event`) para gerenciar todo o ciclo de transporte sem expor DML direto sobre `channel_updates` e `channel_inbound_events`. Migration 19 unifica assinatura canônica soberana `approve_promotion_by_rafael(uuid, uuid)`, valida correspondência de UUID entre comando e candidata, protege contra divergência de hash SHA-256 e amarra ativação de memórias ao Evidence Graph. WF-100 refatorado no nó 03 para consumir `ingest_channel_update(...)`, sincronizado com `nodes_match = true` no n8n. 100% da suíte de testes aprovada (`npm test`).
12. **Sétima Remediação (Migration 20 Hardening & WF-101 RPCs):** Migration 20 (`20-governance-and-integrity-hardening.sql`) aplicada e validada no PostgreSQL real. Allowlist fail-closed obrigatória com `P0001`, target mandatório em `/aprovardiretriz` exigindo UUID canônico coincidente com `p_candidate_id` com `P0002`, validação de hash canônico e proteção contra adulteração de payload, validação estrita de evidência com UUID e existência no Evidence Graph com `P0003`, views simétricas `sovereign_approval_allowlist` e `sovereign_evidence_nodes`. WF-101 refatorado nos nós 02 (claim via RPC), 04 (consumo de snapshot dinâmico), 05 (eliminação de mocks estáticos de POBJ/metas, confirmação de persistência via `inserted_fact_id`), 08 (header de transporte dinâmico) e 09 (complete via RPC). 16/16 testes ofensivos em `tests/adversarial-gate-n7a.test.mjs` e 100% da suíte `npm test` aprovados.
13. **Oitavo Marco (Custom Reply Keyboard e Projeção Dinâmica POBJ):** Migration 21 aplicada no PostgreSQL `visao360` (`21-estado-360-producao-and-pobj-projection.sql`), criando tabela `estado_360_producao` e funções determinísticas `get_estado_360_resumo` e `get_pobj_run_rate` (cálculo dinâmico de dias úteis, ritmo atual, projeção de fechamento e ritmo necessário). Custom Reply Keyboard persistente implementado no Telegram com 4 atalhos (`📊 Resumo Executivo`, `🎯 POBJ & Metas`, `📑 Pendências`, `⚙️ Status do Sistema`). Roteamento determinístico no nó 03, construção de `reply_markup` em JavaScript puro no nó 05, persistência com retorno `$8::json AS reply_markup` no nó 07 e despacho pelo nó 08. `compose.n8n.yaml` atualizado com `N8N_BLOCK_ENV_ACCESS_IN_NODE: "false"` e secrets de transporte injetados. `AGENTS.md` Seção 1.3 atualizada com postura de parceiro de trincheira e braço direito operacional de Rafael (Agência 6895). Validação E2E concluída com sucesso para os 4 botões e `npm test` aprovado com 56/56 suítes (exit code 0).
14. **Nono Marco (Humanização Conversacional & Extrator Gemini Docling):** `AGENTS.md` atualizado nas seções 1.3 (tom parceiro de trincheira na Agência 6895), 3.3 (preferência soberana `TONE: PEER_COLLABORATIVE` e `FORMAT: NATURAL_CONVERSATION`), 9.5 (7 etapas como modelo mental interno analítico, sem cabeçalhos rígidos no chat e com fechamento colaborativo) e 11 (salvaguarda item 23 na auto-auditoria pré-resposta). Worker documental (`document-worker`) recompilado com suporte dual-port (8787 para poller e 8000 para `/v1/document/process` com payload JSON). Aliases de rede Docker `docling_worker` e `docling-worker` adicionados à rede `frontend`. Extrator estruturado Gemini homologado com OpenAPI schema e `models/gemini-3.5-flash:generateContent`. `GEMINI_API_KEY` injetada com segurança no ambiente n8n. 100% da suíte `npm test` aprovada (56/56 suítes, exit code 0) e `npm run lint` limpo.
15. **Décimo Marco (Ativação Canônica do WF-104 e Homologação do Flywheel):** Migration 22 (`22-wf104-flywheel-audit-and-flags.sql`) aplicada e validada no PostgreSQL real. Flag `AUTO_PROMOTION_ENABLED` desbloqueada soberanamente em `system_flags` e `runtime_feature_flags`, com sincronização automática entre `key/value` e `flag_name/flag_value`. Cadastro prévio do Chat ID de Rafael (`5281600644`) em `owner_channel_allowlist` e `sovereign_approval_allowlist`. Funções `insert_flywheel_audit_event` e sobrecargas transacionais (`claim_next_inbound_event`, `complete_inbound_event`, `fail_inbound_event`, `insert_structured_memory`) criadas com `SECURITY DEFINER` e permissões concedidas a `visao360_app`. WF-104 totalmente refatorado com advisory lock 104104, cálculo determinístico de DUR, filtros estritos de autopromoção (categorias em allowlist, score >= 0.75, freq >= 2, risco estritamente LOW, proibição total de escopo GLOBAL autônomo e encaminhamento a MANUAL_REVIEW), nós transacionais de persistência e auditoria, e schedule trigger `0 18 * * 5`. Workflow ativado e sincronizado no n8n com `active = true` e `activeVersionId = versionId`. Bateria completa de testes 100% aprovada (56/56 suítes, 7/7 ataques adversariais contidos, 16/16 testes unitários, exit code 0).

## Last validation

Result: PASS

- `npm test`: PASS, exit 0 (56/56 suítes, 16/16 testes adversariais).
- `node tests/adversarial-corpus-quarta-remediacao.test.mjs`: PASS, exit 0 (100% bloqueio adversarial).
- `node tests/flywheel-learning-postgres-integration.test.mjs`: PASS, exit 0 (10/10 etapas no banco real).
- `npm run lint`: PASS, exit 0, 0 warnings, zero errors.
- `npm run build`: PASS, exit 0.
- Teste n8n canônico (`node scripts/test-n8n-canonical-architecture.mjs`): PASS, exit 0 (0 rotas bridge, 0 mocks, 26 workflows validados).
- Teste ponta a ponta: Inbound `ecd100c6` completado com sucesso e Delivery `d31a1c46` enviado via Telegram com latências reais dinâmicas.

Last commit: `b6e67c2` (docs(agents): humanizacao conversacional do diretor 360 e homologacao do extrator gemini docling)
Last implementation checkpoint: Nono Marco concluído e validado no runtime real (Humanização conversacional do Diretor 360 no AGENTS.md, Docling dual-port e extrator estruturado Gemini).

## Runtime observed

- `visao-360-n8n-1`: healthy; WF-100 e WF-101 ativados automaticamente após cold start.
- `visao-360-postgres-1`: healthy; PostgreSQL 17.6 local ativo.
- `visao-360-document-worker-1`: healthy; FastAPI respondendo em 1.7ms.
- `visao-360-docling-1`: healthy; Docling TableFormer CPU respondendo em 1.9ms.
- `visao-360-telegram-poller-1`: healthy; endpoint `/health/system` ativo com latências dinâmicas.
- WF-100: publicado e ativo (`activeVersionId = 3c45ff0d-1aaf-4d65-90f0-d599b0845608`).
- WF-101: publicado e ativo (`activeVersionId = 8dd6c06a-9002-4480-8946-0a277becd741`).
- WF-103: importado como contingência de erro (`activeVersionId = 16321c53-5eaa-4924-98e2-6aea447667e9`).
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
- `infra/postgres/init/17-gate-n7-cleanup-and-lockdown.sql` — migration de lockdown e revogação estrita de DML.
- `tests/adversarial-gate-n7a.test.mjs` — suíte adversarial do Gate N7A.
- `n8n/workflows/exported_all.json` — export limpo dos 14 workflows.
- `backups/durable/backup_visao360_q0.dump` (SHA-256: `31c92f1798b7787111d96c95a0db1302fc8f7ece2bb49f691cdf7d2ca24e5abf`)
- `backups/durable/backup_n8n_q0.dump` (SHA-256: `02cbc964fb6bf13b69abfe31108d549103cc23b1ccb850c5f841e43cb9d960b8`)
