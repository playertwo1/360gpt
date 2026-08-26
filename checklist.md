# 📋 CHECKLIST OPERACIONAL DIRETOR 360 — ANTIGRAVITY & CODEX

**Versão:** 3.1.0  
**Data:** 26 de agosto de 2026  
**Documento Canônico de Execução Compartilhada:** Antigravity (Google) $\leftrightarrow$ ChatGPT Codex (OpenAI)  
**Autoridade Decisória:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  

---

## 📌 Como Trabalhar Entre Antigravity e ChatGPT Codex

1. **Status dos Itens:**
   - `[ ]` **PLANNED / A FAZER:** Item planejado, ainda não iniciado.
   - `[~]` **IN_PROGRESS / EM ANDAMENTO:** Item sendo desenvolvido no momento.
   - `[v]` **VALIDATING / EM VALIDAÇÃO:** Código pronto, passando por testes automatizados.
   - `[x]` **HOMOLOGATED / CONCLUÍDO:** Testes passaram com código 0 e evidência registrada.
2. **Protocolo de Troca de Agente (Handoff):**
   - Antes de começar: Ler `AGENTS.md` → `status.md` → `checklist.md` → `CODEX_HANDOFF.md`.
   - Ao terminar uma sessão:
     1. Executar a bateria de testes (`powershell -File scripts/run-all-hybrid-tests.ps1`).
     2. Atualizar este `checklist.md`, o `status.md` e o `CODEX_HANDOFF.md`.
     3. Criar backup compactado `.zip` e copiar para `C:\Users\fael\Google Drive\360\` e `Meu Drive\360\`.
     4. Realizar commit semântico com tag SemVer e push no GitHub (`origin main --tags`).
     5. Sincronizar workspace `c:\Users\fael\Downloads\A` via `git pull origin main --tags`.
     6. Despachar notificação de e-mail via `scripts/send-notification-email.py`.

---

## 🏗️ FASE 0: Baseline, Governança & Definition of Done

- [x] **M0.1 — Contratos JSON Schema Draft 2020-12**  
  *Evidência:* `contracts/state-360.schema.json`, `evidence-graph.schema.json`, `bridge-job.schema.json`, `manual-review.schema.json`.  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M0.2 — Protocolo de Governança de Release e Imutabilidade**  
  *Evidência:* `release/RELEASE_MANIFEST_v1.0.0.json`, `contracts/release-manifest.schema.json`.  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M0.3 — Matriz de Responsabilidades & Segregação de Funções**  
  *Evidência:* `AGENTS.md` v1.11 (Diretor, Gerentes Gerais, Especialistas, Motor, Assessor, Rafael).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

---

## 🛡️ FASE 1: Reliability Foundation (Fundação de Confiabilidade)

- [x] **M1.1 — Secure Channel Gateway (Telegram & Allowlist)**  
  *Evidência:* `app/api/ingest/telegram/route.ts` com secret token e restrição ao chat_id de Rafael.  
  *Teste:* `powershell -File scripts/test-h5-telegram-text.ps1` (PASS).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M1.2 — Document Intake Gateway (PDF, CSV, Excel & Injeção)**  
  *Evidência:* Limite de 20 MB, rejeição de 0 bytes, parser de 12 meses e defesa `UNTRUSTED_CONTENT`.  
  *Teste:* `powershell -File scripts/test-h6-telegram-multimodal.ps1` (PASS).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M1.3 — Durable Processing & Fila de Dead Letter (DLQ)**  
  *Evidência:* Tabela `agent_runs` com lease lock de 10 min, max 3 tentativas e encaminhamento para `/reviews`.  
  *Teste:* `powershell -File scripts/test-h3-bridge-audit.ps1` (PASS).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M1.4 — Iniciador de 1-Clique e Parada Segura**  
  *Evidência:* `iniciar-diretor-360.bat` / `.ps1` e `parar-diretor-360.bat` / `.ps1`.  
  *Teste:* `powershell -File scripts/test-h4-launcher.ps1` (PASS).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M1.5 — Backup Transacional & Recuperação RTO/RPO**  
  *Evidência:* `scripts/backup-database.ps1`, 10 workflows n8n, backups no Google Drive, RTO 3m12s / RPO 0s.  
  *Teste:* `powershell -File scripts/test-h9-backup-recovery.ps1` (PASS).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

---

## 📊 FASE 2: Observability & Evals (Avaliação Contínua)

- [x] **M2.1 — Suíte Canônica de 20 Casos Sintéticos (`test-data/evals/cases/`)**  
  *Evidência:* 20 fixtures sintéticas cobrindo os 4 domínios analíticos, conflitos, gaps e injeções adversárias.  
  *Homologado por:* Antigravity | *Data:* 26/08/2026

- [x] **M2.2 — Pipeline de Evals L1 (Determinístico) & L2 (Extração)**  
  *Evidência:* `evals/eval_engine.py` com 100% de exatidão matemática L1 e F1-Score L2 = 1.0000 (Meta > 0.95).  
  *Teste:* `powershell -File scripts/test-phase2-evals.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026

- [x] **M2.3 — Pipeline de Evals L3 (Raciocínio) & L4 (Decisão)**  
  *Evidência:* 100% de Evidence Coverage L3 e 100% de Decision Agreement Rate L4 (Meta >= 90%).  
  *Teste:* `powershell -File scripts/test-phase2-evals.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026


---

## 📡 FASE 3: Radar Comercial & Entity Resolution
> *Status:* ⏸️ **ADIADA / POSTERGADA PARA O FUTURO POR DECISÃO DE RAFAEL**

- [ ] **M3.1 — Conector Público de CNPJ / ReceitaWS / Serpro**  
  *Escopo:* Consulta automatizada com cache local, TTL e rate-limiting (QSA, capital, CNAE, situação).  
  *Responsável:* Codex / Antigravity | *Status:* `POSTPONED`

- [ ] **M3.2 — Grafo de Entity Resolution & Deduplicação de Leads**  
  *Escopo:* Resolução de Matriz/Filiais, sócios comuns e prevenção de leads repetidos.  
  *Responsável:* Codex / Antigravity | *Status:* `POSTPONED`

---

## 💡 FASE 4: Decision Intelligence & Laudo Executivo

- [x] **M4.1 — Contrato e Persistência do Decision Record**  
  *Evidência:* `contracts/decision-record.schema.json` validado em JSON Schema Draft 2020-12.  
  *Teste:* `powershell -File scripts/test-phase4-decision-pdf.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026

- [x] **M4.2 — Gerador de Laudos Executivos 360 em PDF Diagramado**  
  *Evidência:* `core/pdf_report_generator.py` e rota `app/api/reports/laudo-pdf/route.ts` (Laudo 3 págs com 4 GGs e Evidence Graph).  
  *Teste:* `powershell -File scripts/test-phase4-decision-pdf.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026


---

## ⚡ FASE 5: LLMOps & FinOps

- [x] **M5.1 — Model Router Hierárquico (`policies/model-router.yaml` & `core/model_router.py`)**  
  *Evidência:* Roteamento em 5 níveis (Determinístico, Flash Lite, Flash, Pro, Humano) com redução de custo de 79.1%.  
  *Teste:* `powershell -File scripts/test-phase5-finops-router.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026

- [x] **M5.2 — Dashboard de Unit Economics & Alertas de SLA em Tempo Real**  
  *Evidência:* Endpoint `app/api/metrics/finops/route.ts` e telemetria `test-data/finops_telemetry_latest.json`.  
  *Teste:* `powershell -File scripts/test-phase5-finops-router.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026

---


## 🔒 FASE 6: Security, LGPD & Production Readiness Review

- [x] **M6.1 — Postura Zero-Trust, Isolamento e Kill-Switches**  
  *Evidência:* `.gitignore` rigoroso, `.env` isolado, `policies/backpressure.yaml` e Quatro Olhos.  
  *Teste:* `powershell -File scripts/test-h8-security-privacy.ps1` (PASS).  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [x] **M6.2 — Bateria Automatizada de Testes Adversários de Segurança & LGPD**  
  *Evidência:* Suíte de Red Teaming em `test-data/adversarial/`, motor DLP em `compliance/security_audit.py` e PRR Checklist (10/10 gates aprovados).  
  *Teste:* `powershell -File scripts/test-phase6-security-prr.ps1` (PASS).  
  *Homologado por:* Antigravity | *Data:* 26/08/2026

---


## 🚀 FASE 7: Operação Real Supervisionada & Canary Rollout

- [ ] **M7.1 — Canary 1-3 Casos Reais Autorizados**  
  *Escopo:* Ingestão assistida de 1 a 3 casos reais sob escopo autorizado e validação de Rafael.  
  *Responsável:* Rafael & Diretor 360 | *Status:* `PLANNED`

- [ ] **M7.2 — Expansão para 5 a 10 Casos com Monitoramento de Overrides**  
  *Escopo:* Acompanhamento da taxa de aceitação e medição do Decision Utility Rate.  
  *Responsável:* Rafael & Diretor 360 | *Status:* `PLANNED`

---

## ☁️ FASE 8: Escala & Alta Disponibilidade

- [x] **M8.1 — Provisionamento Automatizado de VPS Linux (Ubuntu 24.04)**  
  *Evidência:* `scripts/provision-vps-server.sh`, `compose.prod.yaml` e configuração Caddy HTTPS.  
  *Homologado por:* Antigravity / Codex | *Data:* 26/08/2026

- [ ] **M8.2 — Ativação de VPS 24h na Nuvem (Sob Demanda Operacional)**  
  *Escopo:* Migração para VPS gerenciada quando Rafael desejar operação 24h sem computador local.  
  *Responsável:* Rafael | *Status:* `PLANNED` (Adiado por decisão de conveniência)

---

## 🧪 Bateria Geral de Homologação (Executar Sempre)

```powershell
powershell -File scripts/run-all-hybrid-tests.ps1
```
*Garante 100% de sucesso nos testes fundamentais de H3 a H10.*
