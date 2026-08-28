# Status do Projeto Diretor 360 & Guia Mestre de Continuidade

**Data do status:** 28 de agosto de 2026  
**Versão Atual da Release:** `v3.2.19`  
**Estrutura de Roteiro:** Roadmap de Evolução Orientada à Confiança (Fases 0 a 8)  
**Modo de Execução:** canal Telegram real ativo; análise interna mantida em `OFFLINE_EVAL`  
**Saúde do Projeto:** 🟢 **VERDE OPERACIONAL (14/14 testes verdes; Telegram validado ponta a ponta)**  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Propriedade e responsabilidade técnica:** projeto privado de Rafael; não há migração ou transferência planejada para ambiente institucional. Regras institucionais, quando aplicáveis a uma fonte de dados, limitam apenas o uso dessa fonte.  
**Autorização institucional para dados reais:** `AUTORIZADO`, dentro do escopo institucional vigente; cada uso operacional exige finalidade, escopo, minimização, rastreabilidade, revisão humana e gate específico. Nenhuma fonte real está conectada.
**Repositório Oficial:** `https://github.com/playertwo1/360.git` (Branch `main`)  
**Site Hospedado na Nuvem:** `https://visao-360-diretor.fael360092.chatgpt.site`  

> **Princípio Central:**  
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*  
> **Premissa de segurança:** a autorização institucional existe, mas cada uso operacional de dados reais depende do gate correspondente; a janela Shadow atual permanece exclusivamente sintética.

**Último marco concluído:** A1 Onda 3 do GG Performance: 10/10 cálculos sintéticos válidos, custo zero, zero mutações e zero efeitos externos; revisão humana pendente.  
**Correção de governança recente:** o simulador Canary não fabrica mais decisões ou overrides atribuídos a Rafael; bateria geral 14/14 e lint aprovados.  
**Relatório da auditoria:** `docs/audits/AUDITORIA_RETROSPECTIVA_FASES_0_A_7_2026-08-26.md`  
**Próximo passo exato:** Rafael revisar a Onda 3 em `docs/audits/A1_ONDA3_PERFORMANCE_2026-08-28.md` e aprovar ou solicitar ajuste em A1; C1 permanece necessário somente antes de dados reais.

---

## 1. Painel de Controle Executivo por Fase do Roadmap

| Fase | Escopo / Objetivo | Progresso | Status | Evidência / Próximo Passo |
|:---:|---|:---:|:---:|---|
| **Fase 0** | **Baseline & Definition of Done** | **100%** | 🟢 HOMOLOGADA | Schemas Draft 2020-12, `AGENTS.md` v1.11, Manifesto de Release |
| **Fase 1** | **Reliability Foundation (H1–H10)** | **100%** | 🟢 HOMOLOGADA | Webhook Telegram, Intake Gateway, Fila DLQ, 1-Clique, Backup RTO/RPO |
| **Fase 2** | **Observability & Evals (L1–L4)** | **100%** | 🟢 HOMOLOGADA | 20 Casos Sintéticos, L1 Math 100%, L2 F1 1.00, L3 Cov 100%, L4 Agree 100% |
| **Fase 3** | **Radar Comercial & Entity Resolution** | **—** | ⏸️ ADIADA | Postergada para o futuro por decisão de Rafael |
| **Fase 4** | **Decision Intelligence & Laudos PDF** | **100%** | 🟢 HOMOLOGADA | Decision Record Draft 2020-12, Laudo PDF 3 págs (`core/pdf_report_generator.py`) |
| **Fase 5** | **LLMOps & FinOps (Model Router)** | **100%** | 🟢 HOMOLOGADA | Model Router 5 tiers, Economia FinOps de 79.1% comprovada (`core/model_router.py`) |
| **Fase 6** | **Security, LGPD & Readiness** | **100%** | 🟢 HOMOLOGADA | Red Teaming (5/5 bloqueados), DLP/LGPD ativo, PRR Checklist 10/10 gates aprovados |
| **Fase 7** | **Simulação Canary Supervisionada** | **100%** | 🟡 SIMULAÇÃO HOMOLOGADA | 10 casos sintéticos; não constitui operação real (`core/canary_monitor.py`) |
| **Fase 8** | **Escala & Alta Disponibilidade** | **M8.1 concluído** | 🟡 PREPARADO SOB DEMANDA | Script VPS pronto (`provision-vps-server.sh`), Caddy HTTPS; ativação 24h M8.2 permanece planejada |


---

## 2. Status dos 10 Workflows n8n

| Workflow | Finalidade | Estado |
|---|---|:---:|
| `WF-00` | Triagem offline da entrada do Diretor | ✅ Concluído |
| `WF-01` | Entrada local de texto e arquivos | ✅ Concluído |
| `WF-02` | Registro persistente e idempotência do evento | ✅ Concluído |
| `WF-03` | Registro idempotente da decisão de roteamento | ✅ Concluído |
| `WF-04` | Orquestração dos Gerentes Gerais analíticos | ✅ Concluído |
| `WF-05` | Gerente Geral determinístico analítico (v2.0.0) | ✅ Concluído |
| `WF-06` | Motor de Consolidação e publicação do Estado 360 | ✅ Concluído |
| `WF-07` | Assessor Executivo ancorado no Estado 360 persistido | ✅ Concluído |
| `WF-08` | Consulta somente leitura do último Estado 360 | ✅ Concluído |
| `WF-09` | Ponte autenticada: reservar, processar e publicar Estado 360 | ✅ Concluído & Homologado |

---

## 3. Instruções Rápidas de Operação

### Inicialização e Parada em 1-Clique
```powershell
# Iniciar Docker, PostgreSQL, n8n, Next.js e abrir navegador
.\iniciar-diretor-360.bat

# Encerrar com seguranca sem perder dados
.\parar-diretor-360.bat
```

### URLs Principais
- **Dashboard 360:** `http://localhost:3000`
- **Mesa do Revisor:** `http://localhost:3000/reviews`
- **Site na Nuvem:** `https://visao-360-diretor.fael360092.chatgpt.site`
- **Telemetria FinOps:** `http://localhost:3000/api/metrics/finops`
- **Painel n8n:** `http://localhost:5678`

### Bateria Geral de Testes (Homologação Contínua)
```powershell
powershell -File scripts/run-all-hybrid-tests.ps1
```

---

## 4. Próxima Ação Imediata Recomendada

Concluir a **observação Shadow sintética**:
1. Publicar a tabela append-only de observações agregadas no D1.
2. Configurar o segredo compartilhado do coletor sem versioná-lo.
3. Persistir as medições horárias restantes e acompanhar o painel.
4. Consolidar as 24 medições e submeter o resultado ao gate; manter agentes fora de `ACTIVE`.

Melhorias de governança permanecem no backlog:
1. Separar entrada bruta, predição e gabarito nos Evals L2/L3/L4.
2. Implementar restauração temporária real para medir RTO/RPO.
3. Remover `child_process`/filesystem efêmero das rotas hospedadas.
4. Corrigir métricas estáticas e o drill-down de evidências do Dashboard.
5. Registrar, por operação, finalidade, escopo e evidência da autorização institucional já existente antes de processar dados reais.

### Atualização 28/08/2026 — Bateria geral após correção do Dashboard
- Suíte `scripts/run-all-hybrid-tests.ps1` executada com sucesso: 14/14 testes aprovados.
- Teste visual `scripts/test-dashboard-ui-polish.ps1` alinhado à interface atual e aprovado (`DASHBOARD_UI_POLISH_PASS`).
- Validação agora cobre o link `/shadow` no Dashboard, sem confundir a rota da aba com uma API inexistente na tela inicial.
- Correção versionada no commit `c5ba3e8` e enviada ao branch `main`.
- Arquivos locais gerados não versionados permanecem preservados.

### Atualização 28/08/2026 — Ciclo POBJ/ponte sintético
- Teste `scripts/test-hosted-bridge-cycle.mjs` executado com sucesso.
- Fluxo `enqueue → claim → complete → persistência` concluído; conclusão duplicada ignorada corretamente.
- Job: `synthetic-run-h3-cycle-1787914140294-8627`.
- Estado sintético: `state-d879b167-bab5-48f2-a5eb-d19d3a27fd6c`, versão 2.
- Efeitos externos permanecem proibidos (`external_effects_allowed: false`).

### Atualização 28/08/2026 — Publicação da Mesa do Revisor
- Origem do Sites sincronizada no repositório hospedado até o commit `e8a6529`.
- Versão 28 salva e publicada com sucesso.
- URL pública: `https://visao-360-diretor.fael360092.chatgpt.site`.
- Correção de erros de carregamento da linhagem agora está disponível na Mesa do Revisor.

### Atualização 28/08/2026 — Integridade da resolução publicada
- Versão 29 salva e publicada após sincronização da origem hospedada.
- Mesa do Revisor agora apresenta integridade da linhagem, resolução, revisor e justificativa.
- Deploy concluído com sucesso em `https://visao-360-diretor.fael360092.chatgpt.site`.

### Atualização 28/08/2026 — Readiness operacional
- Gate de release executado e certificado como `PASS`.
- Contratos, políticas, carga, concorrência, ingestão multimodal e adaptador Telegram validados.
- Sistema declarado pronto para produção assistida, permanecendo sujeito ao Gate Shadow e à ativação gradual.

### Atualização 28/08/2026 — Medição Shadow 11:10 UTC
- Observação `shadow-observation-20260828T111012Z` registrada com 20/20 casos concluídos.
- Janela acumulada: 10/24 observações; 200/200 casos; conclusão 100%; divergência 0%.
- Mutações de Estado 360: 0; efeitos externos: 0; `pause_required: false`.
- Restam 14 medições para fechar a janela; Shadow permanece `SYNTHETIC_ONLY`.

### Atualização 28/08/2026 — Gate POBJ antes da ponte
- Corrigido o claim da ponte WF-09: documentos pobj_mobile só podem ser processados após local_reviewed.
- Teste H3 ampliado para validar essa proteção de aprovação humana.
- Bateria executada: 14/14 testes aprovados.
- Próximo passo: publicar esta correção e executar um teste POBJ sintético ponta a ponta (upload → revisão → claim → complete → painel).

### Atualização 28/08/2026 — Medição Shadow 03:35 UTC
- Medição `shadow-e1-synthetic` concluída: 20/20 casos, conclusão 100%, divergência 0%.
- Mutações de Estado 360: 0; efeitos externos: 0; `pause_required: false`.
- Janela acumulada: 2/24 observações; 40/40 casos concluídos; janela ainda não consolidada.
- Shadow permanece restrito a dados sintéticos e nenhum agente foi promovido para `ACTIVE`.

### Atualização 28/08/2026 — Plano de avanço operacional
- Gate de aprovação POBJ implementado e homologado: a ponte não reserva POBJ antes de `local_reviewed`.
- Teste sintético de segurança da ponte executado; teste autenticado ponta a ponta permanece aguardando o `BRIDGE_SECRET` configurado no ambiente.
- Bateria geral permanece em 14/14 testes aprovados.
- Próximas frentes: executar o teste autenticado POBJ, melhorar o painel de fila/evidências, revisar contratos dos quatro Gerentes Gerais e fechar o checklist de ativação gradual.

### Atualização 28/08/2026 — Documentação dos Gerentes Gerais
- Cabeçalho do GG Conta padronizado com versão aprovada e `runtime: INACTIVE`.
- Criado `docs/CHECKLIST_ATIVACAO_GERENTES_GERAIS.md` com pré-requisitos, limites e promoção gradual de Conta, Performance, Financeiro e Relacionamento.
- Nenhum gerente foi promovido para `ACTIVE`; rollback disponível no backup `backup/pre-gg-documentation-20260828-004612`.

### Atualização 28/08/2026 — Ponte hospedada autenticada
- Teste `scripts/test-hybrid-bridge.ps1` aprovado com segredo compartilhado configurado.
- Chamada sem autenticação rejeitada com HTTP 401.
- Evento sintético criado com HTTP 201 e deduplicação confirmada.
- `external_effects_allowed: false`; nenhum efeito externo foi autorizado.
- Job sintético de evidência: `synthetic-run-h3-1787909382-2402`.

### Atualização 28/08/2026 — Ciclo completo da ponte
- Fluxo sintético `enqueue → claim → complete → persistência` aprovado no ambiente hospedado.
- Job: `synthetic-run-h3-cycle-1787909631037-4268`.
- Conclusão idempotente confirmada; repetição retornou `duplicate: true`.
- Estado 360 persistido: `state-4663c691-6806-4b49-94e3-d7b70faed2f1`, versão 1, status `READY`.
- Persistência confirmada diretamente no D1; `external_effects_allowed: false`.
- Adicionado `scripts/test-hosted-bridge-cycle.mjs`, restrito a jobs de origem sintética.

### Atualização 28/08/2026 — Estado 360 no painel
- Adicionado cartão na tela inicial para consultar o Estado 360 sintético persistido.
- O cartão mostra disponibilidade, status, versão, horário, resumo e identificador do estado.
- Build de produção aprovado e lint sem erros; permanecem três avisos legados não bloqueantes.
- Publicação hospedada concluída na versão 24 após confirmação explícita; cartão do Estado 360 disponível no site público existente.

### Atualização 28/08/2026 — Drill-down do Estado 360
- Criada a rota `/state`, acessível pelo cartão da tela inicial.
- Tela apresenta status, versão, horários, identificador, hash, Evidence Graph e trilha de auditoria em modo somente leitura.
- Build aprovado e lint sem erros; drill-down publicado no site na versão 25 após confirmação explícita.
- Correção de navegação publicada na versão 26: cartão usa carregamento direto e o clique foi validado até `/state` no ambiente publicado.
- Correção da API de auditoria publicada na versão 27: removido filtro por coluna inexistente em `audit_log`; tela validada com Estado `READY`, linhagem `COMPLETE` e evento `state_published`.
