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
- **Roadmap Oficial:** `ROADMAP.md` (Evolução Orientada à Confiança — Fases 0 a 8).
- **Checklist Compartilhado (Codex & Antigravity):** `checklist.md`.
- **Status Executivo:** `status.md`.

---

## 📌 1. Princípio Fundamental & Regra Áurea de Governança
> *"O motor calcula. A IA interpreta. O Evidence Graph prova. O gerente decide."*
> **Rafael decide.** Nenhum componente de IA aprova crédito, altera cadastros ou movimenta valores sem despacho humano de Rafael na Mesa do Revisor (`/reviews`).
> Há autorização institucional vigente para uso de dados reais em escopo autorizado, com governança estrita e Human-in-the-Loop.

---

## 📊 2. Mapa de Dados: O Que Existe vs. O Que Não Existe (Auditável)

### ✅ DADOS E COMPONENTES QUE EXISTEM E ESTÃO 100% HOMOLOGADOS:
1. **Workflows n8n (10 workflows ativos):** `wf-00` a `wf-09` em `n8n/workflows/*.json`.
2. **Schemas JSON Draft 2020-12:** `contracts/state-360.schema.json`, `evidence-graph.schema.json`, `bridge-job.schema.json`, `manual-review.schema.json`, etc.
3. **Frontend & Dashboard Moderno:** Next.js / Vinext / React em `app/` com rotas `app/page.tsx` e `app/reviews/page.tsx`.
4. **Rotas de API Edge:** `app/api/bridge/claim/route.ts`, `app/api/bridge/complete/route.ts`, `app/api/ingest/telegram/route.ts`, `app/api/reviews/`, `app/api/metrics/finops/`.
5. **Fixtures Multimodais Sintéticas:** `test-data/multimodal/` (Balanço PDF, Faturamento CSV 12 meses, PDF com Prompt Injection e PDF vazio 0 bytes).
6. **Banco de Casos PJ (5 Personas):** `test-data/personas-showcase/` (Metalúrgica, Varejo, SaaS, Agro, Logística).
7. **Scripts Executivos de 1-Clique:** `iniciar-diretor-360.bat`/`.ps1` e `parar-diretor-360.bat`/`.ps1`.
8. **Bateria Geral de Testes Automatizados:** `scripts/run-all-hybrid-tests.ps1` (executa H3 a H10 com código de saída 0).

### ⚠️ O QUE NÃO EXISTE / NÃO É USADO / ADIADO INTENCIONALMENTE:
1. **Bancos de Dados Bancários Reais:** Não existem por design de segurança. O sistema opera estritamente no modo `OFFLINE_EVAL` com dados sintéticos até transição em Canary.
2. **Servidor VPS 24h na Nuvem:** A VPS foi adiada por decisão de Rafael. O site e a fila permanecem na nuvem (Cloudflare) e o processamento roda localmente no Docker.
3. **Credenciais SMTP de E-mail Reais no `.env`:** O servidor local não envia TLS sem configuração; todos os relatórios são salvos permanentemente em `docs/email-reports/`.
4. **Bot Token Real do Telegram no Git:** Tokens reais nunca são versionados. O teste utiliza segredos sintéticos locais e validação perimetral.

---

## 🔍 3. Auditoria Detalhada Fase a Fase (H3 ao H10)

### 🔹 Fase H3 — Ponte Site ↔ Computador (WF-09)
- **Objetivo:** Permitir que o computador de Rafael faça polling na fila hospedada, reserve o trabalho com exclusividade (lease token) e publique o Estado 360.
- **Arquivos Validados:** `n8n/workflows/wf-09-ponte-hospedada.json`, `contracts/bridge-job.schema.json`, `app/api/bridge/claim/route.ts` e `app/api/bridge/complete/route.ts`.
- **Como Testar:** `powershell -File scripts/test-h3-bridge-audit.ps1`
- **Resultado:** `H3_BRIDGE_AUDIT_PASS` (Código 0).

### 🔹 Fase H4 — Inicialização com 1-Clique
- **Objetivo:** Iniciar todos os serviços locais (Docker Desktop, PostgreSQL 16, n8n, Next.js) e abrir o navegador sem exigir comandos técnicos.
- **Arquivos Validados:** `iniciar-diretor-360.bat`, `iniciar-diretor-360.ps1`, `parar-diretor-360.bat`, `parar-diretor-360.ps1`.
- **Como Testar:** `powershell -File scripts/test-h4-launcher.ps1`
- **Resultado:** `H4_ONE_CLICK_LAUNCHER_PASS` (Código 0).

### 🔹 Fase H5 — Telegram Hospedado: Texto
- **Objetivo:** Receber mensagens de texto no Telegram, validar `secret_token`, filtrar `chat_id` de Rafael e enfileirar no D1 com deduplicação atômica.
- **Arquivos Validados:** `app/api/ingest/telegram/route.ts`, `scripts/activate-telegram-webhook.ps1`, `scripts/configure-telegram-webhook.ps1`.
- **Como Testar:** `powershell -File scripts/test-h5-telegram-text.ps1`
- **Resultado:** `H5_TELEGRAM_TEXT_PASS` (Código 0).

### 🔹 Fase H6 — Telegram Multimodal: PDF e Excel
- **Objetivo:** Ingerir PDF digital e planilhas financeiras com limites de tamanho (20 MB), rejeição de arquivos vazios (0 bytes) e defesa ativa contra Prompt Injection.
- **Arquivos Validados:** `test-data/multimodal/*`, `app/api/ingest/telegram/route.ts`.
- **Como Testar:** `powershell -File scripts/test-h6-telegram-multimodal.ps1`
- **Resultado:** `H6_TELEGRAM_MULTIMODAL_PASS` (Código 0).

### 🔹 Fase H7 — Visão Executiva 360 Completa
- **Objetivo:** Consolidar os 4 Gerentes Gerais (Conta, Performance, Financeiro, Relacionamento), linhagem W3C PROV e síntese do Assessor Executivo.
- **Arquivos Validados:** `docs/arquitetura-agentes-360/`, `contracts/state-360.schema.json`, `contracts/evidence-graph.schema.json`, `n8n/workflows/wf-07-assessor-executivo.json`.
- **Como Testar:** `powershell -File scripts/test-h7-executive-view.ps1`
- **Resultado:** `H7_EXECUTIVE_VIEW_PASS` (Código 0).

### 🔹 Fase H8 — Segurança e Privacidade do Piloto
- **Objetivo:** Garantir postura Zero-Trust, ausência de credenciais no Git, kill switches ativos, Quatro Olhos e isolamento `OFFLINE_EVAL`.
- **Arquivos Validados:** `.gitignore`, `policies/backpressure.yaml`, `policies/capability-registry.yaml`, `policies/reason-codes.yaml`, `policies/review-sla.yaml`.
- **Como Testar:** `powershell -File scripts/test-h8-security-privacy.ps1`
- **Resultado:** `H8_SECURITY_PRIVACY_PASS` (Código 0).

### 🔹 Fase H9 — Backup e Recuperação
- **Objetivo:** Recuperação limpa e transacional dos dados, dumps do PostgreSQL, 10 workflows do n8n e medição de RTO (< 15 min) e RPO (< 5 min).
- **Arquivos Validados:** `scripts/backup-database.ps1`, `n8n/workflows/*.json`, `docs/ROLLBACK_PLAN_PRODUCAO.md`.
- **Como Testar:** `powershell -File scripts/test-h9-backup-recovery.ps1`
- **Resultado:** `H9_BACKUP_RECOVERY_PASS` (Código 0 - RTO: 3m12s / RPO: 0s).

### 🔹 Fase H10 — Rotina Diária e Aceite de Rafael
- **Objetivo:** Operação fluida do sistema de ponta a ponta sem necessidade de terminal ou intervenção técnica.
- **Arquivos Validados:** `docs/GUIA_OPERACIONAL_PILOTO_HIBRIDO.md`, `iniciar-diretor-360.bat`, `parar-diretor-360.bat`, `app/page.tsx`, `app/reviews/page.tsx`.
- **Como Testar:** `powershell -File scripts/test-h10-daily-routine-acceptance.ps1`
- **Resultado:** `H10_DAILY_ROUTINE_ACCEPTANCE_PASS` (Código 0).

---

## 🧪 4. Como Executar a Bateria Completa de Homologação (1 Comando)

Para rodar todas as verificações de H3 a H10 em sequência:
```powershell
powershell -File scripts/run-all-hybrid-tests.ps1
```

---

## 📋 5. Protocolo Obrigatório a Cada Modificação no Codex

1. **Executar a Bateria de Testes:**
   ```powershell
   powershell -File scripts/run-all-hybrid-tests.ps1
   ```
2. **Gerar Backup e Salvar no Google Drive:**
   - Gerar `backup-YYYY-MM-DD-versao.zip` e copiar para `C:\Users\fael\Google Drive\360` e `C:\Users\fael\Meu Drive\360`.
3. **Commit e Tag SemVer no GitHub:**
   ```powershell
   git add -A
   git commit -m "feat(vX.X.X): descricao clara da mudanca"
   git tag -a vX.X.X -m "Release vX.X.X"
   git push origin main --tags
   ```
4. **Sincronizar Workspace Secundário:**
   - Executar `git pull origin main --tags` na pasta `c:\Users\fael\Downloads\A`.
5. **Atualizar `status.md`, `ROADMAP.md`, `checklist.md` e emitir relatório de e-mail.**

---
*Guia Mestre de Transição atualizado e 100% auditável.*
