# Status do Projeto Diretor 360 & Guia Mestre de Continuidade

**Data do status:** 26 de agosto de 2026  
**Versão Atual da Release:** `v3.1.0-confianca`  
**Estrutura de Roteiro:** Roadmap de Evolução Orientada à Confiança (Fases 0 a 8)  
**Modo de Execução:** `PRODUÇÃO ASSISTIDA & PILOTO HÍBRIDO HOMOLOGADO` (Dados sintéticos em `OFFLINE_EVAL` + transição autorizada)  
**Saúde do Projeto:** 🟢 **VERDE (Fases 0 e 1 Homologadas — Fases 2 e 3 Prontas para Início)**  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório Oficial:** `https://github.com/playertwo1/360.git` (Branch `main`)  
**Site Hospedado na Nuvem:** `https://visao-360-diretor.fael360092.chatgpt.site`  

> **Princípio Central:**  
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*  
> **Premissa Institucional:** Autorização vigente para dados reais em escopo autorizado sob Human-in-the-Loop.

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
| **Fase 7** | **Operação Real & Canary Rollout** | **0%** | 🟡 PRONTA P/ INÍCIO | Progressão 1–3 → 5 → 10 casos reais no escopo autorizado por Rafael |

| **Fase 8** | **Escala & Alta Disponibilidade** | **50%** | 🟢 PRONTO P/ ATIVAR | Script VPS pronto (`provision-vps-server.sh`); ativação sob demanda |

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

Avançar para a **Fase 2 (Observability & Evals)** do Roadmap:
1. Estruturar a pasta `test-data/evals/` com 20 casos sintéticos representativos.
2. Criar o runner de avaliação automatizada das 4 camadas (L1 Determinístico, L2 Extração, L3 Raciocínio, L4 Decisão).
