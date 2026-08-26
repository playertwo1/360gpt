# 🚀 GUIA MESTRE DE TRANSIÇÃO & HANDOFF — CHATGPT CODEX
## Diretor 360: Plataforma Multiagente de Inteligência e Governança PJ

**Data do Handoff:** 26 de agosto de 2026  
**Versão Atual da Release:** `v3.1.0-confianca` (Fases 0 e 1 100% Homologadas — Fases 2 e 3 Prontas para Início)  
**Autoridade Decisória do Projeto:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório GitHub Oficial:** `https://github.com/playertwo1/360.git` (Branch `main`)  
**Workspace Local Primário:** `C:\Users\fael\Documents\Codex\2026-08-24\vamos-criar-um-progama-360-de`  
**Workspace de Sincronização:** `c:\Users\fael\Downloads\A`  
**Pastas de Backup no Google Drive:** `C:\Users\fael\Google Drive\360` e `C:\Users\fael\Meu Drive\360`  
**Site Hospedado na Nuvem:** `https://visao-360-diretor.fael360092.chatgpt.site`  

**Documentos Canônicos de Trabalho:**
- **Estado Instantâneo da Máquina:** `SESSION_STATE.json` (Lido em 1 segundo por IA).
- **Roadmap Oficial:** `ROADMAP.md` (Evolução Orientada à Confiança — Fases 0 a 8).
- **Checklist Compartilhado (Codex & Antigravity):** `checklist.md`.
- **Status Executivo:** `status.md`.
- **Guia de Alternância com Prompts Prontos:** `docs/GUIA_ALTERNANCIA_AI.md`.
- **Script de Troca em 1-Clique:** `trocar-de-agente.bat`.

---

## 📌 1. Princípio Fundamental & Regra Áurea de Governança
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*  
> **Rafael decide.** Nenhum componente de IA aprova crédito, altera cadastros ou movimenta valores sem despacho humano de Rafael na Mesa do Revisor (`/reviews`).  
> Há autorização institucional vigente para uso de dados reais em escopo autorizado, com governança estrita e Human-in-the-Loop.

---

## 🔄 2. Kit de Suporte e Alternância entre ChatGPT Codex & Antigravity

Para trabalhar de forma 100% integrada entre o **ChatGPT Codex (OpenAI)** e o **Antigravity (Google)**, siga este fluxo:

### 📖 Ordem de Leitura Obrigatória ao Iniciar no Codex:
1. **`SESSION_STATE.json`** $ightarrow$ Informa em qual fase, marco, commit e backup o projeto está.
2. **`checklist.md`** $ightarrow$ Mostra exatamente as tarefas já concluídas (`[x]`) e as pendentes (`[ ]`).
3. **`status.md`** $ightarrow$ Visão geral de saúde, KPIs e matriz de workflows n8n.
4. **`ROADMAP.md`** $ightarrow$ Arquitetura e regras da fase atual (Fase 2 — Observability & Evals).

### 🛠️ Ao Concluir Qualquer Tarefa no Codex:
1. Rodar os testes: `powershell -File scripts/run-all-hybrid-tests.ps1`.
2. Atualizar o `checklist.md` (marcando `[x]` no item concluído) e o `SESSION_STATE.json`.
3. Executar o script de handoff automático: `.\trocar-de-agente.bat` (ou `powershell -File scripts/handoff-sync.ps1`).

---

## 📊 3. Mapa de Dados: O Que Existe vs. O Que Não Existe (Auditável)

### ✅ DADOS E COMPONENTES QUE EXISTEM E ESTÃO 100% HOMOLOGADOS:
1. **Workflows n8n (10 workflows ativos):** `wf-00` a `wf-09` em `n8n/workflows/*.json`.
2. **Schemas JSON Draft 2020-12:** `contracts/state-360.schema.json`, `evidence-graph.schema.json`, `bridge-job.schema.json`, `manual-review.schema.json`, etc.
3. **Frontend & Dashboard Moderno:** Next.js / Vinext / React em `app/` com rotas `app/page.tsx` e `app/reviews/page.tsx`.
4. **Rotas de API Edge:** `app/api/bridge/claim/route.ts`, `app/api/bridge/complete/route.ts`, `app/api/ingest/telegram/route.ts`, `app/api/reviews/`, `app/api/metrics/finops/`.
5. **Fixtures Multimodais Sintéticas:** `test-data/multimodal/` (Balanço PDF, Faturamento CSV 12 meses, PDF com Prompt Injection e PDF vazio 0 bytes).
6. **Banco de Casos PJ (5 Personas):** `test-data/personas-showcase/` (Metalúrgica, Varejo, SaaS, Agro, Logística).
7. **Scripts Executivos de 1-Clique:** `iniciar-diretor-360.bat`/`.ps1`, `parar-diretor-360.bat`/`.ps1` e `trocar-de-agente.bat`.
8. **Bateria Geral de Testes Automatizados:** `scripts/run-all-hybrid-tests.ps1` (executa H3 a H10 com código de saída 0).

### ⚠️ O QUE NÃO EXISTE / NÃO É USADO / ADIADO INTENCIONALMENTE:
1. **Bancos de Dados Bancários Reais:** Não existem por design de segurança. O sistema opera estritamente no modo `OFFLINE_EVAL` com dados sintéticos até transição em Canary.
2. **Servidor VPS 24h na Nuvem:** A VPS foi adiada por decisão de Rafael. O site e a fila permanecem na nuvem (Cloudflare) e o processamento roda localmente no Docker.
3. **Credenciais SMTP de E-mail Reais no `.env`:** O servidor local não envia TLS sem configuração; todos os relatórios são salvos permanentemente em `docs/email-reports/`.
4. **Bot Token Real do Telegram no Git:** Tokens reais nunca são versionados. O teste utiliza segredos sintéticos locais e validação perimetral.

---

## 🔍 4. Auditoria Detalhada Fase a Fase (H3 ao H10)

### 🔹 Fase H3 — Ponte Site ↔ Computador (WF-09)
- **Objetivo:** Polling na fila hospedada, reserva com lease lock de 10 min e publicação do Estado 360.
- **Arquivos:** `n8n/workflows/wf-09-ponte-hospedada.json`, `contracts/bridge-job.schema.json`, `app/api/bridge/claim/route.ts` e `app/api/bridge/complete/route.ts`.
- **Teste:** `powershell -File scripts/test-h3-bridge-audit.ps1` (Código 0).

### 🔹 Fase H4 — Inicialização com 1-Clique
- **Objetivo:** Iniciar todos os serviços locais (Docker, Postgres, n8n, Next.js) e abrir navegador sem comandos.
- **Arquivos:** `iniciar-diretor-360.bat` / `.ps1`, `parar-diretor-360.bat` / `.ps1`.
- **Teste:** `powershell -File scripts/test-h4-launcher.ps1` (Código 0).

### 🔹 Fase H5 — Telegram Hospedado: Texto
- **Objetivo:** Webhook com secret token, allowlist do `chat_id` de Rafael e enfileiramento D1 deduplicado.
- **Arquivos:** `app/api/ingest/telegram/route.ts`, `scripts/activate-telegram-webhook.ps1`.
- **Teste:** `powershell -File scripts/test-h5-telegram-text.ps1` (Código 0).

### 🔹 Fase H6 — Telegram Multimodal: PDF e Excel
- **Objetivo:** Ingestão de documentos (20 MB), rejeição de 0 bytes e defesa contra Prompt Injection.
- **Arquivos:** `test-data/multimodal/*`, `app/api/ingest/telegram/route.ts`.
- **Teste:** `powershell -File scripts/test-h6-telegram-multimodal.ps1` (Código 0).

### 🔹 Fase H7 — Visão Executiva 360 Completa
- **Objetivo:** Consolidação dos 4 Gerentes Gerais, linhagem W3C PROV e síntese do Assessor Executivo.
- **Arquivos:** `docs/arquitetura-agentes-360/`, `contracts/state-360.schema.json`, `wf-07-assessor-executivo.json`.
- **Teste:** `powershell -File scripts/test-h7-executive-view.ps1` (Código 0).

### 🔹 Fase H8 — Segurança e Privacidade do Piloto
- **Objetivo:** Postura Zero-Trust, zero secrets no Git, kill switches e isolamento `OFFLINE_EVAL`.
- **Arquivos:** `.gitignore`, `policies/backpressure.yaml`, `policies/capability-registry.yaml`.
- **Teste:** `powershell -File scripts/test-h8-security-privacy.ps1` (Código 0).

### 🔹 Fase H9 — Backup e Recuperação
- **Objetivo:** Dumps do PostgreSQL, 10 workflows do n8n e RTO 3m12s / RPO 0s.
- **Arquivos:** `scripts/backup-database.ps1`, `n8n/workflows/*.json`, `docs/ROLLBACK_PLAN_PRODUCAO.md`.
- **Teste:** `powershell -File scripts/test-h9-backup-recovery.ps1` (Código 0).

### 🔹 Fase H10 — Rotina Diária e Aceite de Rafael
- **Objetivo:** Operação fluida sem terminal com Guia Operacional Executivo.
- **Arquivos:** `docs/GUIA_OPERACIONAL_PILOTO_HIBRIDO.md`, rotas `app/page.tsx` e `app/reviews/page.tsx`.
- **Teste:** `powershell -File scripts/test-h10-daily-routine-acceptance.ps1` (Código 0).

---

## 🧪 5. Como Executar a Bateria Completa de Homologação (1 Comando)

```powershell
powershell -File scripts/run-all-hybrid-tests.ps1
```

---

## 📋 6. Protocolo Obrigatório a Cada Modificação no Codex

1. **Executar a Bateria de Testes:** `powershell -File scripts/run-all-hybrid-tests.ps1`.
2. **Executar o Handoff de 1-Clique:** `.\trocar-de-agente.bat` (faz backup no Google Drive, commit, tag SemVer e push).
3. **Atualizar `status.md`, `ROADMAP.md`, `checklist.md` e `SESSION_STATE.json`.**

---
*Guia Mestre de Transição atualizado e 100% auditável.*
