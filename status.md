# Status do Projeto Diretor 360

**Data do status:** 26 de agosto de 2026  
**Versão da Release:** 1.0.0-assisted-prod (Fase 1 Homologada — 100%)  
**Modo de execução:** PRODUÇÃO ASSISTIDA (Human-in-the-Loop na Mesa do Revisor 360)  
**Saúde do Projeto:** 🟢 **VERDE (100% Homologado / Pronto para Operação Assistida)**  

> Projeto pessoal, executado inteiramente fora do ambiente Bradesco, com dados sintéticos (OFFLINE_EVAL).

---

## 1. Painel de Controle Executivo (KPIs & Saúde)

| Indicador | Valor / Estado | Meta / Referência | Status |
|---|---|---|:---:|
| **Status Geral** | Pronto para Produção Assistida | Sem impedimentos | 🟢 |
| **Fase 1 (Fundação & Homologação)** | **15 de 15 marcos concluídos (100%)** | Release v1.0.0 Certificada | 🟢 |
| **Fase 2 (Operação & Produção Assistida)** | **5 marcos planejados (Marcos 16 a 20)** | Boas práticas de mercado (inspiração, não certificação) | ⏳ |
| **Domínios Analíticos Ativos** | 4 (Conta, Performance, Financeiro, Relacionamento) | 4 domínios v2.0.0 | 🟢 |
| **Evidence Graph & Auditoria** | Append-Only ativo / Linhagem PROV completa | Inspirado em W3C PROV / OpenLineage | 🟢 |
| **Central de Revisão Manual** | Mesa autenticada com Quatro Olhos e hash SHA-256 | Fila estruturada | 🟢 |
| **Testes de Carga & Concorrência** | 100% de sucesso em rajadas simultâneas | Backpressure e Idempotência | 🟢 |
| **Build & Linter** | 0 erros (
pm run lint / 
pm run build) | Código limpo | 🟢 |
| **Readiness Gate** | **PASS (Certificado)** | Critérios de release | 🟢 |

---

## 2. Visão do Roadmap Integrado de Marcos

### Fase 1: Fundação, Arquitetura e Homologação (100% Concluída)

| Marco | Descrição | Estado |
|:---:|---|:---:|
| **1 a 8** | Infraestrutura base, n8n, PostgreSQL, idempotência, triagem e consolidação local | ✅ Concluído |
| **9 e 10A**| Aplicação HTTPS, Cloudflare D1/R2, autenticação ChatGPT + Allowlist restrita | ✅ Concluído |
| **10B** | Ponte autenticada (WF-09), leases de 10 min, 3 retries e hash canônico JSON | ✅ Concluído |
| **10C** | Piloto Telegram homologado (Texto, PDF e Planilha XLSX sintéticos) e reversão de segurança | ✅ Concluído |
| **11** | Evolução dos 4 Gerentes Gerais e Especialistas analíticos de domínio (v2.0.0) | ✅ Concluído |
| **12A** | Fundação da Central: contratos, fila, SLA, deduplicação, APIs e read model | ✅ Concluído |
| **12B** | Implantação hospedada e homologação autenticada das transições humanas | ✅ Concluído |
| **13A** | Fundação do Evidence Graph 360: contratos, persistência append-only e auditoria | ✅ Concluído |
| **13B** | Painel visual de auditoria e navegação da linhagem PROV/OpenLineage | ✅ Concluído |
| **14** | Testes de carga, concorrência distribuída e backpressure de modelos | ✅ Concluído |
| **15** | Homologação final para release de produção assistida (Readiness Gate PASS) | ✅ Concluído |

---

### Fase 2: Produção Assistida, Operação, Nuvem e Expansão

> A ordem abaixo prioriza rodar casos reais **antes** de formalizar o manual — o playbook deve nascer de evidência coletada em operação, não de suposição a priori.

| Marco | Descrição | Inspiração de Mercado | Estado |
|:---:|---|---|:---:|
| **16** | **Sessão Prática de Operação Assistida com Casos Complexos** — Simulação ponta a ponta: divergência ERP vs. Extratos, restrições cadastrais parciais e esteira de aprovação assistida | Inspirado em Shadow Piloting / Assisted Production | ✅ Concluído |
| **17** | **Manual e Playbook Operacional do Revisor 360** — Diretrizes de decisão humana, matriz de reason codes, critérios de desempate e auditoria de linhagem, consolidados a partir dos casos reais do Marco 16 | Inspirado em ISO/IEC 42001 & NIST AI RMF | ✅ **Concluído** |
| **18** | **Alertas Proativos de SLA e Telemetria FinOps** — Notificações automáticas no Telegram/E-mail ao atingir 80% do SLA e monitoramento de custos/tokens de IA | Inspirado em Google SRE & FinOps Foundation | ⏳ **Próximo** |
| **19** | **Infraestrutura Cloud & Deploy em Produção Hospedada** — Deploy do Frontend Next.js/Vite no Cloudflare Pages/Workers + D1 e subida do n8n/PostgreSQL em VPS com HTTPS/TLS, incluindo plano de rollback documentado (reversão de DNS, restore de banco, rollback de contêiner) antes da virada | Inspirado em 12-Factor App & CIS Benchmarks | 📋 Planejado |
| **20** | **Ativação dos Canais Oficiais de Produção** — Conexão do Bot Telegram oficial com webhooks autenticados, processamento de áudio/PDF/planilhas em tempo real e entrega contínua | Inspirado em Enterprise API Gateway & Zero-Trust | 📋 Planejado |

---

## 3. Último Marco Concluído: Marco 17

**Manual e Playbook Operacional do Revisor 360 concluído e homologado:**
- Documento executivo formal `docs/PLAYBOOK_REVISOR_360.md` elaborado, detalhando os procedimentos padrão operacionais (SOP) para a Mesa do Revisor.
- Codificação do rito de triagem determinística (`PENDING_TRIAGE → ASSIGNED → IN_REVIEW → RESOLVED`), leases de lock de 10 minutos e regras de desempate por autoridade de fontes.
- Matriz definitiva de reason codes alinhada com `policies/reason-codes.yaml` (incluindo `ELEGIBILIDADE_CONDICIONAL` e `RECIPROCIDADE_PENDENTE`).
- Roteiro de inspeção de linhagem PROV no Evidence Graph e protocolo de assinatura digital SHA-256 para despachos humanos imutáveis.
- Script automatizado de validação de governança `scripts/test-playbook-governance.ps1` executado e aprovado com código 0 (`PLAYBOOK_GOVERNANCE_PASS`).

---

## 4. Próximo Passo Exato

**Marco 18 — Alertas Proativos de SLA e Telemetria FinOps:**
Implementar o módulo de disparo automático de alertas e monitoramento de capacidade da Central de Revisão:
1. Notificação proativa no Telegram/E-mail quando um ticket na fila atingir **80% do tempo de SLA** (`policies/review-sla.yaml`).
2. Telemetria de consumo de tokens de IA, latência por domínio analítico e estimativa de custo por execução (*Unit Economics*).
3. Script automatizado de validação de alertas e métricas de capacidade.



---

## 5. Matriz de Workflows n8n

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

---

## 6. Postura de Segurança & Conformidade (Zero-Trust)

- **Zero-Trust:** Nenhuma credencial ou token privado exposto no Git ou na documentação.
- **Controle de Acesso:** Dashboard protegido por login do ChatGPT + Allowlist restrita (ael@live.de, 
afa.pedrosa1@gmail.com).
- **Defesa contra Injeção de Prompt:** Vetores maliciosos em documentos PDF e XLSX tratados estritamente como dados brutos não confiáveis.
- **Idempotência Garantida:** Reexecuções e updates repetidos retornam DUPLICATE_IGNORED sem duplicar eventos.
- **Segregação de Funções:** Separação estrita entre propor, validar, decidir, executar e auditar.
- **Isolamento de Dados:** Modo OFFLINE_EVAL com dados estritamente sintéticos, sem conexões externas ativas e sem qualquer dado real do Bradesco.
- **Kill switches reconciliados:** TELEGRAM_INGEST_ENABLED=false, BRIDGE_ENABLED=false, confirmação externa desligada e WF-09 despublicado.
- **Quatro olhos:** escrita na Central exige allowlist separada de revisores; usuários do Dashboard recebem apenas leitura.
- **Evidence Graph Append-Only:** Triggers no PostgreSQL e D1 rejeitam qualquer tentativa de UPDATE ou DELETE em nós e arestas de auditoria.

---

## 7. Registro de Riscos & Mitigações (Risk Register)

| Risco Identificado | Impacto | Probabilidade | Plano de Mitigação |
|---|---|---|---|
| **Conexão acidental com fontes reais** | Alto | Baixa | Bloqueio em código (OFFLINE_EVAL obrigatório) e ausência intencional de credenciais bancárias. |
| **Operação contínua indevida da ponte** | Médio | Baixa | Kill switches ativos por padrão (BRIDGE_ENABLED=false e TELEGRAM_INGEST_ENABLED=false). |
| **Decisão humana sem evidência suficiente** | Alto | Baixa | Coleta de evidência real no Marco 16 antes de consolidar o Playbook (Marco 17); inspeção obrigatória do Evidence Graph antes de emitir resolução. |
| **Estouro de SLA em revisões críticas** | Médio | Baixa | Alertas proativos aos 80% do tempo limite (Marco 18) e escalonamento automático de prioridade. |
| **Deploy em nuvem sem via de reversão** | Médio | Média | Plano de rollback (DNS, banco, contêiner) documentado e testado antes da virada de produção no Marco 19. |
