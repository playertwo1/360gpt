# Quinta Remediação N7 — Progresso Auditável

**Versão:** 6.4.0-gates-a0-n2.3-remediation-v5  
**Baseline congelado:** `ccc742ff1da8ababd564dabbcbce5e10913bb272`  
**Branch:** `fix/n7-fifth-remediation-20260903`  
**Gate N7:** `BLOCKED`  
**WF-104:** INATIVO  
**AUTO_PROMOTION_ENABLED:** `false`

## Lote S1 — Segurança do aprendizado

Implementado na migration 13 e nos testes de regressão:

- DML direto removido das tabelas de lifecycle do Flywheel.
- `SECURITY DEFINER` removido de `PUBLIC` e concedido explicitamente somente à role operacional necessária.
- catálogo fechado de preferências AUTO no PostgreSQL;
- feature flag autoritativa fail-closed no PostgreSQL;
- `structured_memory` bloqueia `GLOBAL + ACTIVE + INFERRED_INTERACTION`;
- aprovação OWNER_EXPLICIT depende de evento Telegram persistido, tenant/owner/chat autorizado, comando correto, hash persistido e consumo único;
- hash de auditoria cobre payload completo;
- segredo de transporte não possui mais fallback literal no Compose.

## Lote S2 — Jornada documental e falso COMPLETED

Implementado na migration 14:

1. `begin_document_job(...)`
   - exige inbound real DOCUMENT/IMAGE;
   - cria/resolve `channel_documents`;
   - cria `processing_jobs`;
   - cria protocolo e correlação;
   - cria evidência `SOURCE_ARTIFACT`;
   - nunca declara conclusão.

2. `persist_validated_extraction(...)`
   - aceita somente `schema_version = 1.1.0`;
   - exige envelope JSON com objeto `extraction`;
   - persiste `document_extractions`;
   - cria `document_field_evidence` e nós `OBSERVATION` por campo de primeiro nível;
   - cria handoffs `director` e `performance` em estado `QUEUED`;
   - mantém job em PROCESSING/SCHEMA_VALIDATED.

3. `fail_document_job(...)`
   - únicos estados de falha aceitos: `FAILED_RETRYABLE`, `FAILED_FINAL`, `AWAITING_OWNER_INPUT`;
   - propaga estado coerente para documento e inbound;
   - não transforma falha de OCR em sucesso.

4. `complete_document_job(...)`
   - é a única porta proposta para conclusão documental;
   - recusa `COMPLETED` sem extração VALIDATED;
   - recusa `COMPLETED` sem handoff Diretor `SUCCESS`;
   - recusa `COMPLETED` sem handoff GG Performance `SUCCESS`;
   - recusa `COMPLETED` sem `state_snapshots` persistido;
   - recusa `COMPLETED` sem parecer final;
   - recusa `COMPLETED` sem evidência de campos;
   - somente após todos os guards atualiza job, documento, inbound e update para `COMPLETED`.

5. Teste `tests/document-lifecycle-completion-gate.test.mjs` incluído em `npm test`.

## Pendências abertas antes de reauditar

- aplicar migrations 13 e 14 no PostgreSQL real e executar ataques pela role `visao360_app`;
- refatorar/publicar WF-101 para chamar `begin_document_job`, `persist_validated_extraction`, handoffs e `complete_document_job`;
- remover do WF-101 o segredo literal remanescente e configurar credencial protegida do n8n;
- remover POBJ/competência/respostas fixas e consultar `state_snapshots`;
- fazer texto simples criar fato/evidência/snapshot reais antes de responder “registrado”;
- impedir nó final do WF-101 de marcar documento `COMPLETED` apenas porque a mensagem Telegram foi enviada;
- implementar consumo real dos handoffs Diretor e GG Performance;
- publicar WF-103 com `activeVersionId` válido e provar cold start;
- fechar Telegram externo -> HTTPS -> WF-100 -> WF-101 -> resposta;
- rotacionar segredo exposto e purgar/invalidar histórico conforme política escolhida;
- regenerar exports, hashes, backups e documentação final a partir de commit congelado.

## Critério de continuidade

Nenhum item acima pode ser declarado concluído apenas por presença de código. Itens de runtime exigem evidência reproduzível no PostgreSQL/n8n/Docker real. Até lá, N7 permanece bloqueado.
