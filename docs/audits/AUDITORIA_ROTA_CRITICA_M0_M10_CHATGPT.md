# RELATÓRIO DE AUDITORIA EXECUTIVA — ROTA CRÍTICA M0 A M10 (MVP REAL)
**Auditor Externo Alvo:** ChatGPT / Auditor Independente
**Data de Início:** 02 de setembro de 2026
**Proprietário e Decisor Soberano:** Rafael
**Documento Regulador:** `ROADMAP.md` (Versão 4.4 — Seção A0.2)
**Princípio Central:** *Fontes governam. Motores calculam. Especialistas investigam. Gerentes Gerais interpretam. O Diretor integra e desafia. Rafael decide.*

---

## 1. Termo de Compromisso e Regras Inegociáveis da Execução
1. **Zero Drift:** Não serão criados novos fluxos paralelos, nem atalhos que fujam do `ROADMAP.md`.
2. **Autoridade Operacional Exclusiva:** O **n8n** e o **PostgreSQL local** (`visao360`) são o núcleo canônico exclusivo.
3. **Papéis Estritos:**
   - **Telegram e Sites:** Apenas transporte/caixas postais. Não decidem regras de negócio.
   - **Docling / Document Worker:** Apenas extração documental técnica (tabelas e texto). Não interpretam indicadores.
   - **PostgreSQL:** Memória transacional e durável (auditoria, leases, jobs, envelopes, Estado 360).
   - **GG Performance & Diretor 360:** Interpretação determinística e estratégica baseada nas regras de POBJ homologadas.
4. **Evidência Comprovada:** Toda etapa deve registrar comando, saída real do terminal e código de saída (exit code 0).

---

## 2. Diário de Bordo da Execução Passo a Passo (M0 a M10)

### [M0] — Reconciliar o rascunho e congelar a base
- **Status:** `CONCLUÍDO [x]`
- **Objetivo:** Garantir que o `WF-101` possua uma versão canônica única, recuperável, sem nós duplicados ou provisórios, importada no n8n com `active: false`.
- **Ações Executadas:**
  1. `git status` verificado. Alterações legítimas do usuário preservadas.
  2. Comparado o arquivo `n8n/workflows/wf-101-local-dispatcher.json` com o registro no banco `n8n` (workflow_entity).
  3. Reconciliado o workflow para a versão canônica oficial de 9 nós.
  4. Importado com sucesso no container `visao-360-n8n-1`:
     `docker exec -i visao-360-n8n-1 n8n import:workflow --input="/files/workflows/wf-101-local-dispatcher.json"`
     Saída: `Successfully imported 1 workflow.` (Exit Code: 0).
  5. Confirmado que tanto `WF-100` quanto `WF-101` estão estritamente com `active: false` no banco de dados n8n:
     - `WF-100`: `active = f` (atualizado de t para f conforme regra inegociável de construção do M0).
     - `WF-101`: `active = f` (node_count = 9).
- **Evidência de Consulta SQL (n8n DB):**
  ```
  SELECT id, name, json_array_length(nodes) as node_count, active FROM workflow_entity WHERE id LIKE '9eb8e86a-84b8-4aa9-97e4-36000000010%';
  --------------------------------------+-----------------------------------------------------+------------+--------
   9eb8e86a-84b8-4aa9-97e4-360000000100 | WF-100 — Telegram local intake (INATIVO ATE CUTOVER) |          4 | f
   9eb8e86a-84b8-4aa9-97e4-360000000101 | WF-101 — Dispatcher local n8n (INATIVO ATE CUTOVER) |          9 | f
  ```

---

### [M1] — Fechar a entrada do Telegram no WF-100
- **Status:** `EM EXECUÇÃO`
- **Objetivo:** Transformar o gateway hospedado numa caixa postal de transporte sem regra de negócio. O WF-100 valida, deduplica tecnicamente e persiste os updates no PostgreSQL local.