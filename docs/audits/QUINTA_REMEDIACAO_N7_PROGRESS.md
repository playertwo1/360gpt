# Quinta Remediação N7 — Progresso Auditável

**Versão:** 6.5.0-gates-a0-n2.3-remediation-v5-applied  
**Baseline:** `merge PR #1 + Migrations 13/14 + WF-101/WF-103 Runtime Sync`  
**Gate N7:** `READY_FOR_AUDIT` (Runtime validado no PostgreSQL real e n8n)  
**WF-104:** INATIVO (Fail-closed)  
**AUTO_PROMOTION_ENABLED:** `false` (Fail-closed no banco)

---

## 1. Lote S1 — Segurança do aprendizado (APLICADO E VALIDADO NO RUNTIME)

- **Migration 13 executada com sucesso no PostgreSQL `visao360`:**
  - DML direto (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`) revogado de `visao360_app` em `golden_exemplars`, `negative_memory`, `decision_outcomes`, `flywheel_audit_events`.
  - Todas as funções de lifecycle protegidas por `SECURITY DEFINER` com `search_path` seguro (`pg_catalog`).
  - Catálogo fechado de preferências `auto_preference_catalog` ativo.
  - Feature flag `AUTO_PROMOTION_ENABLED` fixada em `false` na tabela `system_feature_flags`.
  - `structured_memory` bloqueia `GLOBAL + ACTIVE + INFERRED_INTERACTION` via triggers de invariantes.
  - Aprovação `OWNER_EXPLICIT` via stored procedure `owner_promote_candidate` vinculada estritamente ao evento Telegram persistido, conferência de hash SHA-256 e consumo único.
  - Prova de negação de privilégios validada em testes unitários e de integração real no banco.

---

## 2. Lote S2 — Jornada documental e gate de completude (APLICADO E VALIDADO NO RUNTIME)

- **Migration 14 executada com sucesso no PostgreSQL `visao360`:**
  - `begin_document_job(...)`: Registra documento em `channel_documents`, cria `processing_jobs`, atribui protocolo sequencial e nó de evidência `SOURCE_ARTIFACT`.
  - `persist_validated_extraction(...)`: Exige schema `1.1.0`, persiste `document_extractions`, gera evidências de campos em `document_field_evidence` e nós `OBSERVATION` no Evidence Graph, enfileirando handoffs do Diretor e GG Performance.
  - `fail_document_job(...)`: Propaga falhas legítimas sem mascarar erros.
  - `complete_document_job(...)`: Único ponto de conclusão no banco; bloqueia qualquer tentativa de falso `COMPLETED` sem extração `VALIDATED`, aprovação de Diretor, aprovação de GG Performance, snapshot persistido e parecer final.

---

## 3. Lote S3 — Configurações de Infraestrutura e Workflows

- **Item 7 (Túnel Telegram Cloudflare):**
  - Serviço `cloudflared` configurado no `compose.n8n.yaml` com rede compartilhada com o adaptador Telegram e n8n.
- **Item 8 (Publicação do WF-103 no n8n):**
  - Publicado e ativado no n8n com `activeVersionId = versionId`.
  - Cold start verificado nos logs do Docker do container `visao-360-n8n-1`:
    - `Activated workflow "WF-101 — Dispatcher local n8n (INATIVO ATE CUTOVER)"`
    - `Activated workflow "WF-100 — Telegram local intake (INATIVO ATE CUTOVER)"`
    - `Activated workflow "WF-103 — Contingência local (INATIVO ATE CUTOVER)"`
- **WF-101 Refatorado e Reimportado no n8n:**
  - `/pobj` e `/metas`: Consultam dinamicamente a view/tabela `state_snapshots` do banco `visao360`. O valor fixo de 76,70 pontos foi completamente eliminado do código.
  - Mensagens com fatos textuais: Inserem registros reais na tabela `structured_memory` com proveniência `OWNER_PROVIDED` e `confidence_score = 1.00`.
  - Rota de documentos: Registra job real com `begin_document_job`, repassando protocolo auditável de `owner_protocol_counters`.
  - Segredo de transporte em texto claro removido.

---

## 4. Bateria de Testes de Homologação

- `npm test`: **PASS**
  - `test:n7-security`: PASS
  - `test:p0`: PASS
  - `test:local-core`: PASS
  - `test:flywheel`: PASS (10/10 no PostgreSQL real)
- Suíte geral de testes unitários: **56 de 56 arquivos aprovados (100% de cobertura nos gates)**.
