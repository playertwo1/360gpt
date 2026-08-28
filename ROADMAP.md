# ROADMAP DIRETOR 360 — EVOLUÇÃO ORIENTADA À CONFIANÇA

**Base:** Consolidação e Governança do Diretor 360  
**Versão:** 3.1.0-confianca  
**Data:** 26 de agosto de 2026  
**Objetivo:** Evoluir o Diretor 360 de um conjunto de funcionalidades para uma plataforma decisória confiável, testável, observável, auditável e segura.  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório Oficial:** `https://github.com/playertwo1/360.git` (Branch `main`)  

> **Princípio Central:**  
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*

> **Premissa de Segurança Vigente:**  
> Existe autorização institucional para dados reais, mas cada uso operacional depende de finalidade, escopo, minimização, auditoria e gate específico. Nenhuma fonte real está conectada; os novos agentes permanecem sem runtime e a homologação continua em `OFFLINE_EVAL`.

---

## Painel atual — Arquitetura dos Agentes

**Atualizado em:** 27 de agosto de 2026  
**Estado desta trilha:** Etapas A e B concluídas; Etapa C em andamento.  
**Escopo atual:** Diretor, Gerentes Gerais, especialistas, contratos, roteamento, testes e governança. O site está fora desta trilha.

| Etapa | Entrega | Estado | Critério para avançar |
|---|---|---|---|
| A | Reconciliar arquitetura e lifecycles | CONCLUÍDA | Manifesto, 4 gerentes, 21 especialistas, registro e roteamento coerentes |
| B | Contratos, exemplos e testes por domínio | CONCLUÍDA | Gate homologado por Rafael em 27/08/2026 |
| C | Motores determinísticos | EM ANDAMENTO | POBJ, GDAD, estados e datas calculados sem depender de LLM |
| D | Orquestração Diretor–Gerentes | PLANEJADA | Abas, handoffs, memória governada, agenda e no máximo 4 especialistas por domínio |
| E | Homologação sintética e shadow | BLOQUEADA POR B–D | Evals aprovados, evidência completa, telemetria e rollback testado |
| F | Ativação controlada | BLOQUEADA | Autorização de dados resolvida, revisão humana e promoção explícita de lifecycle |
| G | Evolução do site | ADIADA | Decisão futura de Rafael |

### Baseline confirmado

- Diretor Geral 360 v2.0: desenho aprovado, implementação apenas documental, runtime inativo.
- Gerente Geral de Conta v4.38.0: seis especialistas aprovados, runtime inativo.
- Gerente Geral de Performance v5.3: cinco especialistas aprovados, runtime inativo.
- Gerente Geral Financeiro v2.0: cinco especialistas aprovados, runtime inativo.
- Gerente Geral de Relacionamento v2.0: cinco especialistas aprovados, runtime inativo.
- Conhecimento: capacidade transversal; o antigo quinto gerente permanece aposentado.
- Runtime existente: somente oito fluxos legados com dados sintéticos.

### Entregas concluídas na Etapa A

- `registries/project-manifest.json` como fonte central da arquitetura aprovada.
- `contracts/project-manifest.schema.json` para validar a estrutura.
- `policies/capability-registry.yaml` com separação entre desenho e execução.
- `policies/routing.yaml` com falha segura e bloqueio de agentes apenas aprovados.
- Testes de manifesto e lifecycle.

### Escopo da Etapa B

- [x] Contratos de entrada e resposta para Performance.
- [x] Contratos de entrada e resposta para Financeiro.
- [x] Contratos de entrada e resposta para Relacionamento.
- [x] Exemplos canônicos válidos para os seis contratos.
- [x] Casos de borda: piso próximo, teto superado, fonte financeira parcial e compromisso vencido.
- [x] Testes iniciais de comportamento e falha segura.
- [x] Contrato do plano diário integrado Performance–Conta, sem empresa por ação na fase inicial.
- [x] Gate de saída documentado.
- [x] Gate de saída aprovado por Rafael.

### Escopo inicial da Etapa C

- [x] Motor POBJ v1: posição em piso, meta e teto.
- [x] Separação entre oficial, pendente de reconhecimento e projeção.
- [x] Pontuação zerada abaixo do piso e limitada no teto.
- [x] Abstenção de pontuação intermediária sem curva oficial.
- [x] Ranking inicial limitado a cinco indicadores.
- [x] Regra geral oficial POBJ 2026 versionada com proveniência, piso de 70%, teto de 150% e multiplicadores.
- [x] Exceções registradas separadamente, sem herdar silenciosamente a regra geral.
- [ ] Curvas dedicadas das exceções implementadas somente onde houver evidência normativa completa.
- [x] Motor inicial de reconciliação de `DT.BASE` por indicador e produção ainda não reconhecida.
- [x] Criar política inicial de calibração por indicador/fonte, ainda proibida para ativação.
- [x] Adicionar comparação preferencial com watermark esperado da fonte.
- [ ] Observar ao menos um mês completo, validar OCR e homologar perfis de cadência com Rafael.
- [x] Motor GDAD inicial para orçamento, realizado, variação e atribuição desconhecida; concentração permanece no adaptador financeiro.
- [x] Motor inicial de compromissos, datas e vencimentos, mantendo vencido como aberto.
- [ ] Curvas oficiais de pontos versionadas a partir do manual vigente.
- [ ] Motor determinístico do GDAD.
- [ ] Motor de datas, compromissos e ausência de contato.

### Regra de leitura do roadmap

Uma entrega documental `APPROVED` não está implementada nem ativa. Os estados válidos são acompanhados separadamente:

`design_status` → `implementation_status` → `runtime_status`

Somente uma promoção explícita, testada e registrada pode mudar o runtime para `SHADOW` ou `ACTIVE`.

---

## 1. Princípio de Evolução Orientada à Confiança

A evolução da plataforma segue a hierarquia obrigatória:

$$\text{Confiabilidade} \longrightarrow \text{Qualidade} \longrightarrow \text{Valor} \longrightarrow \text{Governança} \longrightarrow \text{Produção Controlada} \longrightarrow \text{Escala}$$

### Regra de Sequenciamento
$$\text{Implementar} \longrightarrow \text{Homologar com Dados Sintéticos} \longrightarrow \text{Medir Evals} \longrightarrow \text{Corrigir} \longrightarrow \text{Liberar Dados Reais Autorizados Gradualmente}$$

---

# Fase 0 — Baseline, Governança de Entrega e Definition of Done

## Objetivo
Estabelecer critérios únicos e rigorosos para determinar quando um marco está realmente concluído e auditável.

## Definition of Done (DoD)
Todo marco, entrega ou funcionalidade deve possuir obrigatoriamente:
1. **Código versionado** no Git com commit semântico e tag SemVer.
2. **Testes automatizados aplicáveis** (com asserções reais sobre arquivos, schemas e execuções).
3. **Telemetria** e métricas de execução registradas (latência, tokens, custo).
4. **Evidência de homologação** verificável no Evidence Graph ou log de execução.
5. **Tratamento de falhas** e caminhos explícitos de erro (sem fail-open).
6. **Procedimento de rollback** transacional e documentado.
7. **Documentação técnica e operacional** atualizada.
8. **Changelog** versionado.
9. **Versão identificável** nos contratos e schemas JSON.

## Ciclo de Vida dos Marcos
$$\text{PLANNED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{VALIDATING} \longrightarrow \text{HOMOLOGATED} \longrightarrow \text{RELEASED} \longrightarrow \text{MONITORED}$$

*Regra de Ouro:* Um marco **nunca** é considerado concluído apenas porque funcionou uma vez manualmente.

---

# Fase 1 — Reliability Foundation (Fundação de Confiabilidade)

## Objetivo
Garantir que toda entrada seja processada de forma confiável, idempotente e recuperável.
Toda entrada deve:
1. Ser processada exatamente uma vez do ponto de vista lógico; ou
2. Terminar em um estado de erro conhecido, rastreável e recuperável.

## 1.1 — Secure Channel Gateway
- **Telegram Oficial:** Webhook protegido por header `x-telegram-bot-api-secret-token`.
- **Allowlist Estrita:** Restrição ao `chat_id` autorizado de Rafael (`app/api/ingest/telegram/route.ts`).
- **SMTP Dedicado:** Canal para resumos executivos e alertas preventivos.
- **Postura Zero-Trust:** Secrets fora do Git, configurados exclusivamente via `.env`.
- **Resiliência:** Rate limiting, timeout, retry com exponential backoff e sanitização de logs.
- **Rastreabilidade:** Todo evento possui `request_id`, `correlation_id`, timestamp, origem e status.
- *Regra Arquitetural:* Telegram e e-mail são **canais de trânsito**, não fontes de verdade. O estado interno e o Evidence Graph permanecem como fonte única da verdade.

## 1.2 — Document Intake Gateway
Fluxo obrigatório em pipeline:
$$\text{Arquivo Original} \longrightarrow \text{Validação} \longrightarrow \text{Extração} \longrightarrow \text{Normalização} \longrightarrow \text{Validação Humana} \longrightarrow \text{Análise}$$

*(Proibido: Injeção direta de `Arquivo Original → LLM` sem validação e normalização prévia).*

### Metadados Contratuais Obrigatórios
- `document_id`, `sha256`, `mime_type`, `size`, `received_at`, `parser_version`, `extraction_version`, `confidence`, `warnings[]`, `source`, `raw_preserved`, `normalized_payload`.

### Requisitos Funcionais
- Preservação do arquivo binário original imutável.
- Identificação de PDF digital vs. digitalizado com OCR controlado.
- Parser de planilhas XLSX/CSV com múltiplas abas, períodos e conciliação de faturamento.
- Rejeição atômica de arquivos corrompidos ou vazios (`0 bytes` -> `invalid_file_size`).
- Defesa ativa contra **Prompt Injection** em documentos (`UNTRUSTED_CONTENT` -> `MANUAL_REVIEW_REQUIRED`).

## 1.3 — Durable Processing & DLQ (Fila Persistente)
Toda entrada recebe uma `idempotency_key` única.

### Máquina de Estados Finita
$$\text{RECEIVED} \rightarrow \text{VALIDATED} \rightarrow \text{QUEUED} \rightarrow \text{PROCESSING} \rightarrow \text{COMPLETED}$$
$$\text{PROCESSING} \rightarrow \text{FAILED\_RETRYABLE} \rightarrow \text{FAILED\_FINAL} \rightarrow \text{MANUAL\_REVIEW}$$

### Dead Letter Queue (DLQ)
Após 3 tentativas de retry com lease lock expirado, a entrada nunca é descartada silenciosamente. Ela é automaticamente encaminhada para `MANUAL_REVIEW` com:
- Código do erro, contagem de tentativas, última execução, contexto técnico e ação recomendada de saneamento.

## Gate de Saída da Fase 1
- **Status:** ✅ **HOMOLOGADO (Fases H1 a H10 / Marcos 1 a 15)**
- 5 jornadas sintéticas completas sem perda, sem duplicidade lógica e com persistência verificada após reinicialização de containers.

---

# Fase 2 — Observability & Evals (Avaliação Contínua de Qualidade)

## Objetivo
Comprovar matematicamente que o Diretor 360 interpreta corretamente os dados antes de aumentar a quantidade de informações processadas.

## Suíte Canônica de Evals (20 Casos Sintéticos)
Criar e manter uma suíte versionada em `test-data/evals/` cobrindo:
1. Conta (Identidade, Cadastro, Apontamentos, Restrições e Elegibilidade).
2. Performance (Metas, Pontos, Produção, Esteiras e Prazos).
3. Financeiro (DRE, Faturamento, Margem, Rentabilidade e Tarifas).
4. Relacionamento (Histórico, Compromissos e Abordagem).
5. Casos de borda: Conflitos de fontes, dados ausentes, certidões vencidas e ambiguidades.

## Evals em Quatro Camadas

```text
┌──────────────────────────────────────────────────────────────────┐
│ L4 — Decisão: Decision Agreement Rate (Aceita / Ajuste / Rejeita)│
├──────────────────────────────────────────────────────────────────┤
│ L3 — Raciocínio: 100% de afirmações ancoradas no Evidence Graph  │
├──────────────────────────────────────────────────────────────────┤
│ L2 — Extração: Precision, Recall, F1-Score e Cobertura de Dados  │
├──────────────────────────────────────────────────────────────────┤
│ L1 — Determinístico: Cálculos, deduplicação, estados e regras    │
└──────────────────────────────────────────────────────────────────┘
```

### Metas por Camada
- **L1 (Determinístico):** 100% de precisão em cálculos financeiros, deduplicação e transições de estado.
- **L2 (Extração):** $F_1 > 0.95$ na extração de faturamento, sócios e débitos.
- **L3 (Raciocínio):** 100% das afirmações materiais com nó rastreável no Evidence Graph.
- **L4 (Decisão):** $\text{Decision Agreement Rate} \ge 90\%$ com revisores humanos.

*Regra de Bloqueio:* Qualquer regressão material na suíte de Evals impede o release em produção.

---

# Fase 3 — Radar Comercial e Entity Resolution

## Objetivo
Transformar dados públicos em oportunidades comerciais qualificadas sem introduzir dados bancários sigilosos.

$$\text{Source Adapter} \longrightarrow \text{Raw Data} \longrightarrow \text{Normalização} \longrightarrow \text{Entity Resolution} \longrightarrow \text{Qualificação} \longrightarrow \text{NBA}$$

## Conectores Públicos Autorizados
- Consulta automatizada via APIs públicas/autorizadas (ReceitaWS, Serpro, Sintegra):
  - CNPJ, Razão Social, Nome Fantasia, CNAE Primário/Secundários, Endereço, Município, Capital Social, Data de Abertura, Situação Cadastral e QSA (Quadro de Sócios e Administradores).
- Implementação com cache local, TTL configurável, circuit breaker e rate-limiting.

## Entity Resolution & Deduplicação
O grafo de entidades deve resolver e vincular:
- Matriz $\leftrightarrow$ Filiais.
- Sócios comuns em diferentes empresas (Grupo Econômico de Fato).
- Cliente existente $\leftrightarrow$ Prospect $\leftrightarrow$ Lead inativo.
- *Regra:* Uma empresa já analisada não pode retornar ciclicamente como "novo lead" sem fato novo material.

---

# Fase 4 — Decision Intelligence & Laudo Executivo

## Objetivo
Transformar informações consolidadas em decisões assistidas, explicáveis e auditáveis.

## Segregação Ontológica Obrigatória
O sistema separa explicitamente:
$$\mathbf{FATO} \longrightarrow \mathbf{INFER\hat{E}NCIA} \longrightarrow \mathbf{RECOMENDA\c{C}\tilde{A}O} \longrightarrow \mathbf{DECIS\tilde{A}O}$$
- Nenhuma inferência estatística pode ser apresentada como fato consumado.
- Nenhuma recomendação do agente pode ser apresentada como decisão executada.

## Decision Record Contratual (`contracts/decision-record.schema.json`)
Toda recomendação material gera um registro imutável:
- `decision_id`, `company_id`, `timestamp`, `facts[]`, `inferences[]`, `recommendation`, `evidence_ids[]`, `confidence`, `model_id`, `prompt_version`, `rule_version`, `human_decision`, `human_reason_code`.

## Laudo Executivo 360 em PDF Diagramado
- Geração com 1 clique de relatório PDF de 3 páginas para diretoria e comitês de crédito.
- Ancoragem 100% rastreável ao Evidence Graph, com hash SHA-256 e carimbo temporal bitemporal.

---

# Fase 5 — LLMOps & FinOps

## Objetivo
Otimizar simultaneamente qualidade, custo e latência, operando sob o **Princípio da Menor Autonomia e Capacidade Suficiente**.

## Model Router Hierárquico (`policies/model-router.yaml`)
```text
Regra Determinística (Cálculos, CNAE, Elegibilidade)
        ↓
Modelo Econômico (Gemini Flash Lite — Triagem, OCR, Classificação Simples)
        ↓
Modelo Intermediário (Gemini 2.5 Flash — Extração e Raciocínio de Domínio)
        ↓
Modelo Avançado (Gemini 2.5 Pro / Claude 3.5 Sonnet — Síntese e Casos Complexos)
        ↓
Revisão Humana Obrigatória (Mesa do Revisor / Despacho de Rafael)
```

## Telemetria & Unit Economics
- Registro contínuo em `/api/metrics/finops` de tokens, custo por análise ($< \text{R\$ } 0,15$), latência ($P_{95} < 30\text{s}$) e taxa de assertividade.

---

# Fase 6 — Security, LGPD & Production Readiness Review

## Objetivo
Manter e comprovar continuamente a aderência do Diretor 360 à autorização institucional já concedida para uso de dados reais, garantindo segurança, LGPD, rastreabilidade e controles de produção.

## Requisitos de Conformidade
- Relatório de Impacto à Proteção de Dados (DPIA / RIPD).
- Princípios da LGPD aplicados: Finalidade, Adequação, Necessidade (minimização), Livre Acesso, Qualidade dos Dados, Transparência, Segurança, Prevenção, Não Discriminação e Responsabilização.
- Gestão estrita de segredos (Secrets Management).
- Data Loss Prevention (DLP) com mascaramento e redação prévia de PII sensível em logs e dashboards.

## Bateria de Testes de Segurança Obrigatórios
1. **Prompt Injection Test:** Injeção de instruções adversárias em mensagens e documentos.
2. **Data Exfiltration Test:** Tentativa de forçar saída de dados não autorizados fora do tenant.
3. **Privilege Boundary Test:** Tentativa de um especialista de domínio atuar fora de seu escopo.
4. **Kill-Switch Test:** Desligamento granular e atômico de canais (Telegram, SMTP, LLM, Conectores) sem indisponibilizar a base.

## Gate de Autorização Contínua
- Estados da autorização: `AUTORIZADO | AUTORIZADO_COM_RESTRICOES | AJUSTES_NECESSARIOS | SUSPENSO`.
- Se o status for `SUSPENSO`, o processamento de dados reais afetado é interrompido imediatamente, preservando trilhas de auditoria.

---

# Fase 7 — Operação Real Supervisionada & Canary Rollout

## Objetivo
Expandir o uso dos dados reais já autorizados de maneira progressiva, mensurável e reversível, validando o comportamento do sistema em produção assistida.

### Progressão em Canary
$$\text{1 a 3 Casos Reais} \longrightarrow \text{5 Casos} \longrightarrow \text{10 Casos} \longrightarrow \text{Amostra Ampliada}$$

## Human-in-the-Loop Mandatório
- Nenhuma recomendação do Diretor 360 produz efeito transacional ou decisão final sem despacho humano explícito na Mesa do Revisor (`/reviews`).

## Critérios Automáticos de Rollback
- Incidente de segurança ou exfiltração $\rightarrow$ **ROLLBACK IMEDIATO**.
- Evidence Coverage $< 100\%$ em campos materiais $\rightarrow$ **PAUSAR OPERAÇÃO**.
- Taxa de erro de extração $> 5\%$ $\rightarrow$ **PAUSAR & INVESTIGAR**.

---

# Fase 8 — Escala e Alta Disponibilidade

## Objetivo
Migrar para infraestrutura 24/7 gerenciada somente quando existir necessidade operacional comprovada.

- O modelo híbrido (Docker local + Site Cloudflare) permanece como padrão oficial de baixo custo e alta segurança.
- Provisionamento automatizado de VPS Linux (Ubuntu 24.04 / Hetzner) via `scripts/provision-vps-server.sh` pronto para ativação sob demanda.

---

# KPIs Executivos & Métricas de Sucesso

| KPI | Fórmula / Critério | Meta |
|---|---|:---:|
| **Decision Utility Rate** | $(\text{Aceitas} + \text{Aceitas com Ajustes}) / \text{Total Recomendações}$ | $\ge 85\%$ |
| **Override Rate** | $\text{Recomendações Rejeitadas} / \text{Total Recomendações}$ | $\le 15\%$ |
| **Evidence Coverage** | $\text{Afirmações com Linhagem PROV} / \text{Total Afirmações}$ | **100%** |
| **False Critical Alert Rate** | $\text{Alertas Falsos} / \text{Total de Alertas Críticos}$ | $< 5\%$ |
| **Time-to-Decision** | Tempo entre entrada da informação e despacho de Rafael | $< 15\text{ min}$ |
| **Cost-per-Useful-Decision** | Custo total de LLM / Decisões Úteis | $< \text{R\$ } 0,20$ |
| **Reliability** | Entradas processadas sem perda ou duplicidade | **100%** |
| **Security Incident Rate** | Incidentes materiais de segurança ou vazamento | **0** |

---

# 12 Regras Arquiteturais Permanentes

1. **Motor determinístico primeiro:** Cálculos e regras conhecidas nunca dependem desnecessariamente de LLM.
2. **Evidence First:** Nenhuma afirmação material existe sem evidência verificável no Evidence Graph.
3. **Human-in-the-Loop:** Decisões materiais permanecem sob responsabilidade humana exclusiva.
4. **Fail-Safe & Safe Defaults:** Erro desconhecido gera `MANUAL_REVIEW_REQUIRED`, nunca decisão automática.
5. **Idempotência Absoluta:** O reenvio do mesmo payload nunca duplica efeitos ou tarefas.
6. **Imutabilidade da Origem:** O artefato original recebido nunca é alterado ou sobrescrito.
7. **Observabilidade Total:** Nenhuma automação crítica opera como caixa-preta.
8. **Versionamento Semântico:** Modelos, prompts, regras, parsers e contratos são identificáveis por versão.
9. **Least Privilege:** Cada agente e conector acessa estritamente os dados necessários para sua tarefa.
10. **Progressive Delivery:** Novas capacidades são liberadas gradualmente em fases controladas.
11. **Rollback Transacional:** Todo componente crítico possui procedimento de retorno rápido e seguro.
12. **Dados Reais no Escopo Autorizado:** Toda operação real segue estritamente a autorização institucional vigente.

---

# Plano operacional de preparação e ativação

**Aprovado por Rafael em:** 28 de agosto de 2026
**Regra de separação:** a Trilha S é exclusivamente observacional. As trilhas P e A não podem modificar scripts, casos, métricas, critérios, registros ou configuração do Shadow enquanto a janela estiver aberta.

---

## TRILHA S — Shadow sintético isolado

### S1 — Observação automática — CONCLUÍDO

- [x] Completar 24 medições horárias no monitor remoto: 24/24.
- [x] Manter 20 casos sintéticos por medição.
- [x] Manter escopo `SYNTHETIC_ONLY` e efeitos externos proibidos.
- [x] Aguardar as medições restantes sem executar medições adicionais manualmente.

**Ocorrência registrada em 2026-08-28 18:53 BRT:** a medição local agendada concluiu 20/20 casos com métricas saudáveis, porém o upload ao monitor remoto falhou com `status: 0`. Diagnóstico de conectividade posterior confirmou que o endpoint HTTPS está alcançável e responde `401` sem credencial, comportamento esperado. Aguardar a próxima medição automática para recuperar a persistência; não executar replay manual, nem alterar escopo, scripts, fixtures, métricas ou critérios do Shadow.

### S2 — Consolidação somente após 24/24 — CONCLUÍDO

- [x] Consolidar `test-data/shadow/observations/`.
- [x] Verificar lacunas e intervalos horários.
- [x] Confirmar conclusão mínima de 99%.
- [x] Confirmar divergência máxima de 10%.
- [x] Confirmar zero mutações de Estado 360.
- [x] Confirmar zero efeitos externos.
- [x] Gerar o parecer técnico do Gate Shadow em `docs/audits/S2_GATE_SHADOW_2026-08-28.md`.
- [x] Submeter o Gate Shadow à aprovação de Rafael em 2026-08-28.

### Proibições durante a janela

- Não modificar scripts, fixtures, métricas ou critérios do Shadow.
- Não antecipar, repetir ou preencher artificialmente medições.
- Não promover agentes com base em resultado parcial.
- Não ativar dados reais ou efeitos externos.

---

## TRILHA P — Preparação independente para ativação

Tudo nesta trilha deve usar dados sintéticos, ambientes locais ou documentação. Nenhuma tarefa depende de alterar o Shadow.

### P0 — Reconciliar roadmap, checklist e estado real — CONCLUÍDO

- [x] Comparar cada item do `checklist.md` com código, testes e evidências.
- [x] Confirmar quais itens estão realmente homologados.
- [x] Corrigir itens marcados como concluídos sem evidência suficiente.
- [x] Fechar no roadmap tarefas já comprovadamente concluídas.
- [x] Unificar nomenclatura de fases, marcos, lifecycles e versões.
- [x] Definir `ROADMAP.md` como planejamento oficial e `checklist.md` como aceite operacional.
- [x] Sincronizar `PROJECT_STATE.md`, `status.md`, `checklist.md` e `CHANGELOG.md` com o resultado da reconciliação.

**Evidência:** `docs/audits/RECONCILIACAO_P0_2026-08-28.md`.

**Gate P0:** todos os documentos representam o mesmo estado comprovado por código, testes e Git.

### P1 — Base técnica e bateria de regressão — CONCLUÍDO

- [x] Executar os 14 testes gerais.
- [x] Executar lint e build de produção.
- [x] Validar contratos JSON Schema Draft 2020-12.
- [x] Validar ponte autenticada, idempotência, fila, retries, lease e DLQ.
- [x] Validar Estado 360 persistido e Evidence Graph append-only.
- [x] Validar Central de Revisão.
- [x] Validar backup e restauração isolada.
- [x] Criar relatório único de regressão.

**Evidência:** `docs/audits/REGRESSAO_P1_2026-08-28.md`.

**Gate P1:** todas as validações aplicáveis aprovadas com dados sintéticos e zero efeitos externos.

### P2 — Fechar motores determinísticos — EM ANDAMENTO

#### P2.1 — Performance

- [x] Inventariar indicadores POBJ suportados.
- [x] Confirmar piso, teto, peso, multiplicadores e versões de política.
- [ ] Versionar as curvas oficiais disponíveis após receber evidência normativa.
- [ ] Manter exceções sem norma completa como `UNDETERMINED`.
- [x] Validar produção oficial, pendente e projetada.
- [x] Testar ranking, gaps e prioridades reproduzíveis.
- [x] Impedir escolha de empresa sem participação do GG Conta.

#### P2.2 — Financeiro

- [x] Concluir o motor determinístico do GDAD.
- [x] Separar orçamento, realizado, cenário e projeção.
- [x] Registrar moeda, período, escala e arredondamento.
- [x] Representar ausência como `NOT_AVAILABLE`.
- [x] Impedir fabricação de retorno financeiro.

#### P2.3 — Relacionamento

- [x] Concluir o motor de compromissos e datas.
- [x] Definir estados aberto, vencido, concluído e cancelado.
- [ ] Calcular ausência de contato conforme regra versionada.
- [x] Exigir evidência textual para compromissos.
- [x] Manter hipóteses separadas de fatos.

#### P2.4 — Conta

- [x] Validar resolução por identificadores fortes.
- [x] Validar elegibilidade específica por ação, produto ou operação.
- [x] Testar divergências cadastrais e revisão manual.
- [x] Garantir que restrição não produza veto genérico.
- [x] Impedir promessa baseada em pré-aprovação.

**Evidência:** `docs/audits/P2_MOTORES_DETERMINISTICOS_2026-08-28.md`.

**Gate P2:** cálculos reproduzíveis e testes sintéticos aprovados por domínio.

### P3 — Contratos dos quatro Gerentes Gerais — CONCLUÍDO

- [x] Validar entradas e respostas de Conta, Performance, Financeiro e Relacionamento.
- [x] Confirmar máximo de quatro especialistas por domínio.
- [x] Validar dependências entre gerentes e proibição de chamadas laterais.
- [x] Confirmar que especialistas não produzem efeitos externos.
- [x] Validar o parecer executivo padronizado.
- [x] Confirmar versão, escopo, fontes, limites, rollback e `runtime: INACTIVE` de cada gerente.

**Evidência:** `docs/audits/P3_CONTRATOS_GERENTES_2026-08-28.md`.

**Gate P3:** cada gerente possui contrato e evidência de teste sem promoção de runtime.

### P4 — Orquestração Diretor → Gerentes → Motor 360 — CONCLUÍDO

- [x] Testar roteamento por intenção e capacidade.
- [x] Acionar somente domínios necessários e registrar inclusões e exclusões.
- [x] Testar a parceria Conta–Performance.
- [x] Validar pacotes de contexto e dependências entre abas.
- [x] Validar conflitos entre domínios sem decisão automática.
- [x] Confirmar que o Diretor recomenda, mas não executa.
- [x] Validar publicação de snapshot imutável no Estado 360.
- [x] Validar respostas do Assessor ancoradas no mesmo snapshot.

**Evidência:** `docs/audits/P4_ORQUESTRACAO_2026-08-28.md`.

**Gate P4:** jornada sintética completa, determinística nas regras conhecidas e auditável.

### P5 — Segurança, LGPD e autorização operacional documental — CONCLUÍDO

- [x] Registrar finalidade e escopo permitido — finalidade Performance/POBJ, acesso por e-mail/convite e planilha POBJ limitada a meta, realizado e período registrados; CPF e campos pessoais desnecessários proibidos. Rafael aprova individualmente qualquer fonte, campo ou ampliação de retenção.
- [x] Identificar responsável de negócio e responsável técnico — Rafael é proprietário, responsável de negócio e responsável técnico permanente; qualquer delegação futura será opcional e registrada, sem transferência de propriedade.
- [x] Definir retenção, descarte e mascaramento — detalhados por 24 meses, backups por até 90 dias e agregados não identificáveis por prazo indeterminado.
- [x] Validar isolamento por usuário e tenant.
- [x] Validar allowlists e gestão de segredos.
- [x] Executar testes de prompt injection, exfiltração e fronteira de privilégios.
- [x] Testar kill switches.
- [x] Criar modelo de registro de autorização por operação.

**Decisão humana concluída:** Rafael confirmou finalidade, acessos, responsáveis, escopo e retenção em 28/08/2026. Esta fase não conecta nenhuma fonte real; a fonte concreta ainda exige cadastro, validação e gate técnico.

**Evidência:** `docs/audits/P5_SEGURANCA_LGPD_2026-08-28.md` e `docs/REGISTRO_AUTORIZACAO_DADOS_REAIS.md`.

### P6 — Preparação operacional para ativação — CONCLUÍDO

- [x] Criar checklists de inicialização e encerramento seguro.
- [x] Definir monitoramento, SLOs, orçamento e critérios de pausa.
- [x] Definir e testar rollback por capacidade, gerente e sistema.
- [x] Revalidar restauração do PostgreSQL, n8n, site e ponte.
- [x] Preparar pacote de release, manifesto com versões e hashes e backup pré-ativação.

**Evidência:** `docs/audits/P6_PRONTIDAO_OPERACIONAL_2026-08-28.md`.

**Gate P6:** operação observável, recuperável e pronta para uma liberação limitada.

### P7 — Preparar canary individual — CONCLUÍDO (EXECUÇÃO BLOQUEADA PELO GATE)

- [x] Recomendar o GG Performance como primeiro gerente candidato; seleção final permanece com Rafael.
- [x] Preparar seleção de uma única capacidade.
- [x] Preparar lotes de 1–3, 5 e 10 casos sintéticos.
- [x] Definir concordância, override, custo, latência e cobertura de evidências.
- [x] Definir pausa automática e rollback para `INACTIVE`.
- [x] Confirmar efeitos externos bloqueados.

**Evidência:** `docs/audits/P7_CANARY_PREPARACAO_2026-08-28.md`.

**Gate P7:** canary pronto, mas não executado antes do Gate geral.

### P8 — Gate geral de prontidão — PARCIALMENTE APROVADO; AGUARDA DECISÕES HUMANAS REMANESCENTES

- [ ] Gates P0–P7 concluídos.
- [ ] Bateria, build, lint, contratos, segurança, backup e restauração aprovados.
- [x] Registro de autorização operacional preenchido.
- [x] Gate Shadow aprovado por Rafael em 2026-08-28.
- [ ] Primeiro canary autorizado por Rafael.

**Resultados permitidos:** `READY_FOR_CANARY | ADJUSTMENTS_REQUIRED | BLOCKED`.

**Pré-verificação:** `docs/audits/P8_PRE_GATE_READINESS_2026-08-28.md` — estado atual `NOT_READY` por dependências legítimas, não por falha técnica.

---

## TRILHA A — Ativação gradual do projeto

Esta trilha só começa após `READY_FOR_CANARY` e aprovação explícita de Rafael.

### A1 — Canary sintético individual

- [x] Executar 1–3 casos e revisar todos manualmente — Onda 1 aprovada por Rafael; 3/3 cálculos válidos. Evidência: `docs/audits/A1_ONDA1_PERFORMANCE_2026-08-28.md`.
- [x] Corrigir divergências antes da expansão — nenhuma divergência identificada nas três ondas sintéticas.
- [x] Executar 5 casos e medir overrides, custo e latência — Onda 2 aprovada por Rafael; 5/5 cálculos válidos, zero efeitos externos. Evidência: `docs/audits/A1_ONDA2_PERFORMANCE_2026-08-28.md`.
- [x] Executar 10 casos e confirmar SLOs e evidências — Onda 3 aprovada por Rafael pela aba `/canary`; 10/10 cálculos válidos, custo zero, zero mutações e zero efeitos externos. Evidência: `docs/audits/A1_ONDA3_PERFORMANCE_2026-08-28.md` e registro D1 imutável.
- [x] Disponibilizar revisão A1 no site sem alterar o painel existente — rota `/canary` publicada, dados exclusivamente sintéticos e decisão auditável imutável registrada por Rafael.
- [x] Registrar decisão de retorno ou avanço — A1 aprovado para encerrar a homologação sintética; A2 continua exigindo autorização explícita e não promoveu nenhuma capacidade.

### A2 — Ativação somente leitura supervisionada

- [ ] Promover uma única capacidade de um gerente.
- [ ] Liberar somente fontes e campos autorizados.
- [ ] Aplicar minimização, segregação e auditoria de toda leitura.
- [ ] Manter revisão humana e efeitos externos bloqueados.
- [ ] Monitorar erros, divergências, custo e latência.
- [ ] Voltar para `INACTIVE` diante de violação de gate.

### A3 — Expansão por gerente

**Ordem recomendada:** Performance → Conta → Relacionamento → Financeiro.

- [ ] Expandir uma capacidade por vez.
- [ ] Exigir janela supervisionada estável e evidência completa.
- [ ] Confirmar ausência de incidente material e rollback testado.
- [ ] Exigir aprovação explícita de Rafael para cada expansão.

### A4 — Projeto ativo em leitura assistida

- [ ] Quatro gerentes autorizados e estáveis no escopo aprovado.
- [ ] Diretor integrando pareceres sem substituir Rafael.
- [ ] Estado 360, Evidence Graph e Dashboard consistentes.
- [ ] Telegram operando com revisão humana.
- [ ] Backup, recuperação e auditoria comprovados.
- [ ] Dados reais limitados à autorização aplicável.
- [ ] Nenhuma recomendação produz efeito automático.

**Estado-alvo inicial:** `ACTIVE_READ_ONLY_SUPERVISED`.

### A5 — Efeitos externos: etapa futura e separada

- [ ] Criar catálogo fechado de ações e canais permitidos.
- [ ] Exigir autorização específica por ação, alvo, canal e validade.
- [ ] Testar idempotência, retry, auditoria e rollback.
- [ ] Começar por ação interna reversível.
- [ ] Expandir somente mediante novo gate e aprovação explícita.

## Ordem de execução vigente

Enquanto o Shadow permanece isolado: `P0 → P1 → P2 → P3 → P4 → P5 documental → P6 → P7`.

Após 24/24: `S2 → aprovação do Gate Shadow → P8 → A1 → A2 → A3 → A4`.

Nenhum gerente entra em `ACTIVE`, nenhuma fonte real é conectada e nenhum efeito externo é liberado antes dos respectivos gates e da aprovação explícita de Rafael.
