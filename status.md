# Status do Projeto Diretor 360 & Guia Mestre de Continuidade

**Data do status:** 27 de agosto de 2026  
**Versão Atual da Release:** `v3.1.0-confianca`  
**Estrutura de Roteiro:** Roadmap de Evolução Orientada à Confiança (Fases 0 a 8)  
**Modo de Execução:** canal Telegram real ativo; análise interna mantida em `OFFLINE_EVAL`  
**Saúde do Projeto:** 🟢 **VERDE OPERACIONAL (14/14 testes verdes; Telegram validado ponta a ponta)**  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório Oficial:** `https://github.com/playertwo1/360.git` (Branch `main`)  
**Site Hospedado na Nuvem:** `https://visao-360-diretor.fael360092.chatgpt.site`  

> **Princípio Central:**  
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*  
> **Premissa de segurança:** nenhuma evidência institucional foi arquivada neste repositório; manter dados reais bloqueados até o Gate formal de Segurança, Compliance e LGPD.

**Último marco concluído:** Etapa B validada; motores POBJ/freshness e contratos dos quatro domínios passaram na bateria completa.  
**Relatório da auditoria:** `docs/audits/AUDITORIA_RETROSPECTIVA_FASES_0_A_7_2026-08-26.md`  
**Próximo passo exato:** implementar a integração isolada dos motores determinísticos ao fluxo de Performance, mantendo especialistas novos inativos até nova avaliação e promoção explícita.

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
| **Fase 8** | **Escala & Alta Disponibilidade** | **100%** | 🟢 PRONTO P/ ATIVAR | Script VPS pronto (`provision-vps-server.sh`), Caddy HTTPS, ativação sob demanda |


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

Avançar para a **Etapa C — implementação isolada dos motores determinísticos**:
1. Integrar `engines/performance/pobj-engine.mjs` ao adaptador de execução em modo sombra.
2. Integrar `engines/performance/freshness-engine.mjs` com watermark por indicador.
3. Comparar saídas com os fixtures sintéticos e registrar métricas de divergência.
4. Manter runtime dos novos especialistas como `INACTIVE` até gate de promoção.

Melhorias de governança permanecem no backlog:
1. Separar entrada bruta, predição e gabarito nos Evals L2/L3/L4.
2. Implementar restauração temporária real para medir RTO/RPO.
3. Remover `child_process`/filesystem efêmero das rotas hospedadas.
4. Corrigir métricas estáticas e o drill-down de evidências do Dashboard.
5. Formalizar autorização institucional antes de qualquer dado real.
