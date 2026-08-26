# Status do Projeto Diretor 360

**Data do status:** 26 de agosto de 2026  
**Versão da Release:** `v2.1.0-marco12a`
**Modo de execução:** `OFFLINE_EVAL` (dados 100% sintéticos e isolados)  
**Saúde do Projeto:** 🟢 **VERDE (Saudável / Sem Bloqueios)**  

---

## 1. Painel de Controle Executivo (KPIs & Saúde)

| Indicador | Valor / Estado | Meta / Referência | Status |
|---|---|---|:---:|
| **Status Geral** | Em conformidade | Sem impedimentos | 🟢 |
| **Marcos Concluídos** | 11 marcos + fundação 12A | Roadmap de Produção | 🟢 |
| **Domínios Analíticos Ativos** | 4 (Conta, Performance, Financeiro, Relacionamento) | 4 domínios | 🟢 |
| **Cobertura de Testes de Regressão** | 100% (Texto, PDF, XLSX, JSON) | Multi-formato aprovado | 🟢 |
| **Build & Linter** | 0 erros (`npm run lint` / `npm run build`) | Código limpo | 🟢 |
| **Vulnerabilidades / Vazamento** | 0 credenciais expostas / Kill switch ativo | Política Zero-Trust | 🟢 |

---

## 2. Visão do Roadmap de Marcos

| Marco | Descrição | Estado |
|:---:|---|:---:|
| **1 a 8** | Infraestrutura base, n8n, PostgreSQL, idempotência, triagem e consolidação local | ✅ Concluído |
| **9 e 10A**| Aplicação HTTPS, Cloudflare D1/R2, autenticação ChatGPT + Allowlist restrita | ✅ Concluído |
| **10B** | Ponte autenticada (WF-09), leases de 10 min, 3 retries e hash canônico JSON | ✅ Concluído |
| **10C** | Piloto Telegram homologado (Texto, PDF e Planilha XLSX sintéticos) e reversão de segurança | ✅ Concluído |
| **11** | **Evolução dos 4 Gerentes Gerais e Especialistas analíticos de domínio (v2.0.0)** | ✅ **Concluído** |
| **12A** | Fundação da Central: contratos, fila, SLA, deduplicação, APIs e read model | ✅ **Concluído** |
| **12B** | Implantação hospedada e homologação autenticada das transições humanas | ⏳ **Próximo** |
| **13** | Painel de auditoria e Evidence Graph 360 (linhagem PROV/OpenLineage) | 📋 Planejado |
| **14** | Testes de carga, concorrência distribuída e backpressure de modelos | 📋 Planejado |
| **15** | Homologação final para release de produção assistida | 📋 Planejado |

---

## 3. Último Marco Concluído: Marco 12A

**Fundação funcional da Central de Revisão Manual 360:**
- Contratos Draft 2020-12 de pedido e resolução corrigidos e alinhados em UUID.
- Fila determinística gerada a partir de snapshots `MANUAL_REVIEW_REQUIRED`, com SHA-256 de deduplicação, prioridade, SLA e fila proprietária.
- Ciclo de atribuição, início de revisão, escalonamento em até três níveis e resolução humana estruturada implementado.
- Resolução imutável com hash canônico e auditoria integrada, sem executar reprocessamento ou qualquer efeito externo.
- Dashboard ampliado com visão somente leitura das revisões abertas e estado do SLA.
- Migrações equivalentes criadas para D1 hospedado e PostgreSQL local.

---

## 4. Matriz de Workflows n8n

| Workflow | Finalidade | Estado |
|---|---|---|
| WF-00 | Triagem offline da entrada do Diretor | Concluído |
| WF-01 | Entrada local de texto e arquivos | Concluído |
| WF-02 | Registro persistente e idempotência do evento | Concluído |
| WF-03 | Registro idempotente da decisão de roteamento | Concluído |
| WF-04 | Orquestração dos Gerentes Gerais analíticos | Concluído |
| WF-05 | Gerente Geral determinístico analítico (v2.0.0) | Concluído |
| WF-06 | Motor de Consolidação e publicação do Estado 360 | Concluído |
| WF-07 | Assessor Executivo ancorado no Estado 360 persistido | Concluído |
| WF-08 | Consulta somente leitura do último Estado 360 | Concluído |
| WF-09 | Ponte autenticada: reservar, processar no n8n e publicar Estado 360 hospedado | Criado e homologado; mantido despublicado fora das janelas controladas |

As APIs da Central são componentes determinísticos da aplicação hospedada e não adicionam autonomia ao n8n. O Dashboard permanece somente leitura.

---

## 5. Postura de Segurança & Conformidade

- [x] **Zero-Trust**: Nenhuma credencial ou token privado exposto no Git ou na documentação.
- [x] **Controle de Acesso**: Dashboard protegido por login do ChatGPT + Allowlist restrita (`fael@live.de`, `rafa.pedrosa1@gmail.com`).
- [x] **Defesa contra Injeção de Prompt**: Vetores maliciosos em documentos PDF e XLSX tratados estritamente como dados brutos não confiáveis.
- [x] **Idempotência Garantida**: Reexecuções e updates repetidos retornam `DUPLICATE_IGNORED` sem duplicar eventos.
- [x] **Segregação de Funções**: Separação estrita entre propor, validar, decidir, executar e auditar.
- [x] **Isolamento de Dados**: Modo `OFFLINE_EVAL` com dados estritamente sintéticos, sem conexões externas ativas.
- [x] **Kill switches reconciliados**: `TELEGRAM_INGEST_ENABLED=false`, `BRIDGE_ENABLED=false`, confirmação externa desligada e WF-09 despublicado.
- [x] **Quatro olhos**: escrita na Central exige allowlist separada de revisores; usuários do Dashboard recebem apenas leitura.

### Testes do Marco 12A

- Pedido sintético `ROUTING_AMBIGUOUS` persistido como `PENDING_TRIAGE`, prioridade `P2`, fila autorizada e SLA definido.
- Deduplicação SHA-256 e UUID determinístico validados.
- Consulta e resolução sem identidade rejeitadas com `401`.
- Migração PostgreSQL reaplicada de forma idempotente e índices de fila/resolução confirmados.
- Regressão de texto, PDF, XLSX e JSON aprovada; idempotência e adaptador Telegram permaneceram íntegros.
- `npm run lint` e `npm run build` aprovados com as rotas `/api/reviews`, `/api/reviews/:id` e `/api/reviews/:id/resolve`.

---

## 6. Registro de Riscos & Mitigações (Risk Register)

| Risco Identificado | Impacto | Probabilidade | Plano de Mitigação |
|---|:---:|:---:|---|
| **Conexão acidental com fontes reais** | Alto | Baixa | Bloqueio em código (`OFFLINE_EVAL` obrigatório) e ausência intencional de credenciais bancárias. |
| **Operação contínua indevida da ponte** | Médio | Baixa | Kill switches ativos por padrão (`BRIDGE_ENABLED=false` e `TELEGRAM_INGEST_ENABLED=false`). |
| **Aviso de task runner Python no n8n** | Baixo | Baixa | Todos os workflows utilizam runtime nativo JavaScript (Node.js), eliminando dependência do runner Python. |
| **Revisor não configurado na hospedagem** | Médio | Controlada | Escrita falha fechada até `REVIEWER_ALLOWED_EMAILS` ser definido e homologado no Marco 12B. |

---

## 7. Próximo Passo Exato

**Marco 12B — Implantação e homologação da Central de Revisão Manual 360:**
Publicar a versão com a migração D1, configurar uma allowlist separada de revisores humanos e homologar `ASSIGN_TO_ME → START_REVIEW → resolução` com um pedido exclusivamente sintético. Confirmar auditoria, hash da resolução, bloqueio de usuário não autorizado e permanência dos kill switches de Telegram e ponte em `false`.
