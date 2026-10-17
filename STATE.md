# STATE — ponto de retomada

Qualquer agente deve conseguir retomar só com este arquivo + a seção ativa do `ROADMAP.md`, sem a conversa anterior. Curto: o que não for estado atual sai daqui.

**Atualizado:** 2026-10-17 · **Marco ativo:** Q12 — Camada Conversacional Contextual, Multi-Turno e Resiliente · **Estado:** REVIEW

> Unifica `PROJECT_STATE.md`, `SESSION_STATE.json`, `CODEX_HANDOFF.md` e `status.md`. Esses quatro arquivos continuam na raiz porque são lidos/empacotados por `scripts/handoff-sync.ps1`, `scripts/generate-quarta-resposta.mjs` e `scripts/scheduled-retrospective-audit-prompt.txt`; servem de histórico detalhado. Estado atual: aqui.

## O que funciona hoje (confirmado no código)
- Núcleo local: `compose.n8n.yaml` com n8n, PostgreSQL, document-worker e Docling; workflows em `n8n/workflows/` (WF-100, WF-101, WF-103, WF-104).
- Migrações PostgreSQL em `infra/postgres/init/` até a 24 (conversa multi-turno, `record_operational_fact`).
- Camada conversacional do Telegram com Gemini e suíte dos 10 casos (`tests/conversational-core-ten-cases.test.mjs`).
- Testes agregados em `npm test` (segurança N7, P0 Telegram, núcleo local, flywheel, adversarial, conversacional); `npm run lint` e `npm run build`.
- Dashboard web (Next/vinext) em `app/`.

## Última atividade
- ID / commit: `3398e92` (2026-09-04) — camada conversacional natural com Gemini e 10 casos homologados.
- Resultado real: Décimo Primeiro Marco registrado como concluído em `PROJECT_STATE.md`.
- Testes executados: `npm test`, `npm run lint`, `npm run build` → PASS segundo `PROJECT_STATE.md` (2026-09-04); NOT_RUN nesta sessão de padronização (2026-10-17, só documentação; `npm test` depende do PostgreSQL local).
- Evidência: `PROJECT_STATE.md` (Last validation), `CHANGELOG.md`.

## Próxima ação
- Q12 — revisar e reconciliar o `ROADMAP.md` (vários marcos marcados "MARCO ATUAL") com a próxima entrega real; começar por `ROADMAP.md` §4 e §7; depende de decisão de Rafael.

## Bloqueios e aprovações humanas
- `ROADMAP.md` registra o bloqueio de observabilidade Shadow (`HOURLY_MEASUREMENT_GAP`, 2026-09-02): nenhuma promoção/ampliação autorizada até recompor a janela.
- `ROADMAP.md` §4.2: Docling ainda une células do POBJ; gate de extração (≥ 98%) pendente.
- Enxugar o `AGENTS.md` (2068 linhas) é decisão de produto: ele é montado no container n8n (`compose.n8n.yaml`, `/files/contracts/AGENTS.md`), verificado por `scripts/test-n8n-canonical-architecture.mjs` e define a persona do Diretor.

## Divergências entre roadmap e implementação
- Estados conflitantes: `PROJECT_STATE.md` diz `12.0.0` / `FULLY_OPERATIONAL_HOMOLOGATED` (2026-09-04); `SESSION_STATE.json` diz `7.0.0` / pendente de auditoria; `status.md` e `CODEX_HANDOFF.md` param em 2026-09-03 (quarta remediação). Prevalece `PROJECT_STATE.md` (mais recente).
- `ROADMAP.md` marca como "MARCO ATUAL" A0.2, N2 e Q12 ao mesmo tempo.
- `README.md` antigo manda abrir o Docker Desktop; desde 3.5.0 (2026-09-01) o ambiente usa Docker Engine nativo no WSL2.
- `CHANGELOG.md`: entradas posteriores a 3.5.0 e várias `## AAAA-MM-DD — …` não têm número de versão; há duas seções `3.9.0` no fim do arquivo, fora de ordem.
