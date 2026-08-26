# 🚀 GUIA MESTRE DE TRANSIÇÃO & HANDOFF — CHATGPT CODEX
## Diretor 360: Plataforma Multiagente de Inteligência e Governança PJ

**Data do Handoff:** 26 de agosto de 2026  
**Versão Atual da Release:** `v2.4.0-final-phase3` (24 de 24 Marcos implementados; go-live remoto pendente)
**Autoridade Decisória do Projeto:** Rafael (`fael@live.de` / `rafa.pedrosa1@gmail.com`)  
**Repositório GitHub:** `https://github.com/playertwo1/360.git` (Branch `main`)  
**Workspace Local Primário:** `C:\Users\fael\Documents\Codex\2026-08-24\vamos-criar-um-progama-360-de`  
**Workspace de Sincronização:** `c:\Users\fael\Downloads\A`  
**Pasta de Backup no Google Drive:** `C:\Users\fael\Google Drive\360` e `C:\Users\fael\Meu Drive\360`  

---

## 📌 1. Princípio Fundamental & Regra Áurea de Governança
> *"Fontes governam. Motores calculam e consolidam. Especialistas analisam. Gerentes Gerais coordenam. O Assessor sintetiza. O Diretor governa. **Rafael decide.**"*  
> Nenhum componente de IA aprova crédito, altera cadastros ou movimenta valores sem despacho humano de Rafael na Mesa do Revisor (`/reviews`).

---

## 📊 2. Onde Paramos (Estado Exato do Projeto)

Concluímos a implementação dos **24 marcos originais**. A fase atual é a homologação operacional híbrida, acompanhada em `ROADMAP_HIBRIDO.md`.

### ✅ O Que Já Está Pronto e Homologado:
1. **Infraestrutura Local & Workflows n8n:** PostgreSQL 16 + n8n (10 workflows ativos `WF-00` a `WF-09`).
2. **Frontend & Dashboard Moderno:** Next.js / Vinext / React rodando em `http://localhost:3000`.
3. **Cards dos 4 Gerentes Gerais (v2.0.0):** Conta (R$ 1.2M), Performance (92.4%), Financeiro (R$ 14.2M) e Relacionamento (6 Anos).
4. **Mesa do Revisor Human-in-the-Loop (`http://localhost:3000/reviews`):** Fila estruturada com Quatro Olhos, lock de 10 min e assinatura SHA-256.
5. **Evidence Graph 360 (W3C PROV):** Linhagem de auditoria ponta a ponta com visualizador em modal interativo.
6. **Telemetria FinOps & Guardião de SLA:** Rota `/api/metrics/finops` com Unit Economics (R$ 0,08/análise) e alerta proativo aos 80% do SLA.
7. **Banco de Casos PJ (5 Personas):** Indústria Metalúrgica, Rede de Varejo, Tech/SaaS, Agronegócio (CPR) e Logística/Frota. Executáveis via `powershell -File scripts/run-showcase-persona.ps1`.
8. **Guia Quickstart & Demonstração:** `QUICKSTART.md` e `scripts/demo-live-showcase.ps1`.

---

## 🎯 3. Marco 24 implementado — arquitetura operacional revisada

### 🌐 **Marco 24 — Automação de Deploy em Nuvem Real (Cloudflare Pages + VPS + Bot Telegram Live)**
* **Objetivo alcançado:** scripts finais de automação, validação e ativação segura foram implementados.
* **Entregáveis a serem implementados no Marco 24:**
  1. `scripts/provision-vps-server.sh`: Script bash para VPS Linux (Ubuntu 24.04) que configura UFW (portas 22, 80, 443), Docker e sobe o `infra/cloud/docker-compose.prod.yaml` com Caddy Server (HTTPS automático via Let's Encrypt).
  2. `scripts/activate-telegram-webhook.ps1`: Script PowerShell que cadastra o webhook oficial do Telegram com `secret_token` (`X-Telegram-Bot-Api-Secret-Token`).
  3. `scripts/test-cloud-deployment.ps1`: Script que roda testes remotos contra o endpoint de produção.
  4. Release de código `v2.4.0-final-phase3` preparada. A homologação externa final exige domínio, VPS e credenciais reais.

Rafael decidiu adiar a VPS. O site, a fila e o último Estado 360 permanecem hospedados; Docker, PostgreSQL, n8n e agentes processam localmente. H1 e H2 foram concluídas: as duas contas acessaram o site privado e o snapshot sintético `cust-demo-001` versão 37 permaneceu disponível com n8n/PostgreSQL locais desligados, conservando o mesmo hash. Os serviços foram religados saudáveis. A fase atual é H3 — homologar um novo caso sintético pela ponte site ↔ computador. Os scripts de VPS permanecem preservados para uma migração futura opcional.

### Ordem obrigatória para Codex e Antigravity

1. Ler `AGENTS.md`.
2. Ler `status.md`.
3. Ler `ROADMAP_HIBRIDO.md`.
4. Ler este `CODEX_HANDOFF.md`.
5. Verificar `git status` e preservar mudanças existentes.
6. Executar a primeira fase híbrida não concluída e registrar evidências antes de marcar `[x]`.

---

## 📋 4. Protocolo Obrigatório de Entrega de Rafael (Seguir Sempre!)

A cada marco concluído no Codex, execute rigorosamente este protocolo de 5 passos:

1. **Testes Automatizados & Build:**
   ```powershell
   npm run build
   powershell -File scripts/test-*.ps1
   ```
2. **Criar Backup .ZIP e Copiar para o Google Drive:**
   - Criar `backup-2026-08-26-marcoXX.zip` contendo código, schemas, docs e scripts.
   - Copiar para `C:\Users\fael\Google Drive\360\` e `C:\Users\fael\Meu Drive\360\`.
3. **Commit, Tag SemVer e Push no GitHub:**
   ```powershell
   git add -A
   git commit -m "feat(vX.X.X): descricao da entrega"
   git tag -a vX.X.X -m "Release vX.X.X"
   git push origin main --tags
   ```
4. **Sincronizar Workspace Local Alternativo:**
   - Rodar `git pull origin main --tags` na pasta `c:\Users\fael\Downloads\A`.
5. **Atualizar `status.md` e `walkthrough.md`** e emitir o changelog formatado por e-mail para `fael@live.de`.

---

## 🛠️ 5. Comandos de Inicialização e Testes

```powershell
# Iniciar backend localmente
docker compose -f compose.n8n.yaml --env-file .env.n8n up -d

# Iniciar frontend web
npm run dev

# Rodar demonstracao executiva ao vivo
powershell -File scripts/demo-live-showcase.ps1

# Rodar banco de casos de 5 personas PJ
powershell -File scripts/run-showcase-persona.ps1

# Testes gerais de homologacao
powershell -File scripts/test-release-readiness.ps1
powershell -File scripts/test-dashboard-ui-polish.ps1
powershell -File scripts/test-showcase-personas.ps1
```

---

**Estado atual:** código-base estruturado e Marco 24 concluído; piloto híbrido H1–H10 em homologação, começando pelo acesso ao site.
