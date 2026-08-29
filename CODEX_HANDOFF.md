# 🤝 TERMO DE AUDITORIA E HANDOFF PARA O CHATGPT CODEX

**Data:** 28 de agosto de 2026  
**Auditor Designado por Rafael:** ChatGPT Codex (OpenAI)  
**Autoridade Soberana:** Rafael (`fael@live.de`)  
**Repositório Oficial:** `https://github.com/playertwo1/360gpt.git` (Branch `main`)  
**Último Commit de Sessão:** `HEAD`

---

## 📌 Missão do ChatGPT Codex nesta Sessão:
Rafael determinou que você (**Codex**) atue como **auditor independente e rigoroso** de todas as alterações feitas no projeto pelo Antigravity na sessão de 28/08/2026.

Você deve inspecionar cada item, rodar os testes, validar a aderência estrita aos contratos e corrigir as falhas de comunicação e deploy.

---

## 🔍 Dossiê Forense de Todas as Alterações (28/08/2026):

### 1. Governança e Paralisação:
- **Gerente de Conhecimento:** Paralisação formal documentada em `AGENTS.md`, `domains/GERENTES_GERAIS_BASE.md` e `policies/capability-registry.yaml`.

### 2. Novos Motores Criados em `core/`:
- `core/director_360_runtime.py`: Runtime da Fase A4 com 8 nós do Evidence Graph e invariante `requires_human_dispatch: true`.
- `core/external_effects_executor.py`: Executor da Fase A5 com catálogo fechado (`policies/external-effects-catalog.yaml`) e schema Draft 2020-12 (`contracts/external-action-request.schema.json`).
- `core/carteira_pj_engine.py`: Motor da carteira PJ, matriz de restrições (1-7) e aging.
- `core/daily_action_plan_engine.py`: Cruzamento de gaps do POBJ com empresas elegíveis da carteira.
- `core/performance_engine.py`: Curvas oficiais POBJ 2026 (Piso 70%, Meta 100%, Teto 150%), Run-rate e Nec Dia.
- `core/financeiro_engine.py`: GDAD Orçado vs. Realizado, apuração de margem e rentabilidade por cliente.
- `core/relacionamento_engine.py`: Aging de contatos (0-30d, 31-60d, 61-90d, >90d) e ciclo de compromissos.
- `core/conta_engine.py`: Matriz de Restrições 1 a 7 e Ciclo de Vida D0 a D120.

### 3. Testes Automatizados em `scripts/`:
- `scripts/test-phase-a4-read-only.ps1` (Fase A4)
- `scripts/test-phase-a5-external-effects.ps1` (Fase A5)
- `scripts/test-phase-c1-daily-plan.ps1` (Fase C1)
- `scripts/test-phase-p2-engines.ps1` (Fase P2)
- `scripts/run-all-hybrid-tests.ps1` (Executa a bateria atual de 23 testes automatizados)

---

## ⚠️ Falhas que o Codex Deve Auditar e Resolver com Prioridade:

1. **Deploy no `https://visao-360-diretor.fael360092.chatgpt.site/`:**
   - O código do site está em `app/` (`app/page.tsx`, `app/gate-p8/page.tsx`, `app/api/gate-p8/route.ts`), mas a publicação oficial no domínio `.chatgpt.site` depende do build e deploy executado dentro do ambiente do Codex. O Codex deve rodar a compilação/deploy oficial no seu ambiente para que Rafael veja o site online atualizado.
2. **Status do Gate P8:**
   - O Gate P8 está **`SUBMETIDO PARA AVALIAÇÃO DE RAFAEL`** e NÃO pode ser tratado como aprovado até que Rafael assine formalmente. O laudo está em `docs/audits/P8_GATE_READINESS_2026-08-28.md`.

---

## 🛠️ Comandos de Entrada para o Codex Iniciar a Auditoria:
```powershell
# 1. Puxar as últimas alterações
git pull origin main

# 2. Executar a bateria completa de 23 testes
powershell -File scripts/run-all-hybrid-tests.ps1

# 3. Compilar e publicar o site
npm run build
```
