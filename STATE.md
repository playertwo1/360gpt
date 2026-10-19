# STATE — ponto de retomada

Qualquer agente deve conseguir retomar só com este arquivo + a seção ativa do `ROADMAP.md`, sem a conversa anterior. Curto: o que não for estado atual sai daqui.

**Atualizado:** 2026-10-19 · **Marco ativo:** OP1 — Operação assistida real · **Estado:** TODO

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

- 2026-10-19 — reestruturação documental (branch `docs/reestruturacao-agents-roadmap`): `AGENTS.md` reduzido a contrato curto; §1–§17 movidas verbatim para `docs/arquitetura-agentes-360/CONTRATO_DIRETOR_360.md`; ROADMAP v11 arquivado em `docs/arquivo/ROADMAP_v11_2026-09-04.md`; novo `ROADMAP.md` com Q12 entregue e marco ativo OP1; `CHANGELOG.md` versionado de 3.8.0 a 12.0.0. Só documentação; `npm test` NOT_RUN.

## Próxima ação
- OP1-01 — POBJ real pelo celular (`ROADMAP.md` → Marco ativo OP1); antes, Rafael decide se OP1-03 (reconciliar estado AUTO) deve vir primeiro.

## Bloqueios e aprovações humanas
- `ROADMAP.md` registra o bloqueio de observabilidade Shadow (`HOURLY_MEASUREMENT_GAP`, 2026-09-02): nenhuma promoção/ampliação autorizada até recompor a janela.
- `ROADMAP.md` §4.2: Docling ainda une células do POBJ; gate de extração (≥ 98%) pendente.
- `AGENTS.md` foi enxugado (2068 → ~100 linhas) em 2026-10-19; o contrato completo está em `/files/agents/CONTRATO_DIRETOR_360.md` no container. **Não verificado:** se algum workflow guardado no banco do n8n lê `/files/contracts/AGENTS.md` esperando o contrato completo (nenhum JSON em `n8n/workflows/` referencia esse caminho). Conferir no n8n real antes do próximo deploy.

## Divergências entre roadmap e implementação
- Estados conflitantes: `PROJECT_STATE.md` diz `12.0.0` / `FULLY_OPERATIONAL_HOMOLOGATED` (2026-09-04); `SESSION_STATE.json` diz `7.0.0` / pendente de auditoria; `status.md` e `CODEX_HANDOFF.md` param em 2026-09-03 (quarta remediação). Prevalece `PROJECT_STATE.md` (mais recente).
- ~~`ROADMAP.md` marca como "MARCO ATUAL" A0.2, N2 e Q12 ao mesmo tempo~~ — resolvido em 2026-10-19 (novo ROADMAP: entregues; marco ativo único OP1).
- AUTO: o ROADMAP v11 (regra do topo e Q0) diz que `AUTO_PROMOTION_ENABLED` fica desligado; `PROJECT_STATE.md` (12.0.0) registra `AUTO_PROMOTION_ENABLED=true` no PostgreSQL e no container n8n. Valor real não verificado; tratado em OP1-03.
- Shadow: o `HOURLY_MEASUREMENT_GAP` e o bloqueio da janela Shadow de 2026-09-02 não têm resolução registrada em nenhum arquivo; continua valendo "nenhuma promoção ou ampliação". Tratado em OP1-02.
- `SESSION_STATE.json` está parado em `7.0.0-gate-n7a-quinta-remediacao` / `QUINTA_REMEDIACAO_COMPLETED_PENDING_AUDIT`, enquanto `PROJECT_STATE.md` está em `12.0.0`.
- N1 e N3–N7: os status no ROADMAP v11 ("REVALIDAÇÃO PENDENTE", "PAUSED_BY_GATE", "PARCIAL", "PENDENTE") são anteriores às entregas 4.0.0–12.0.0 e estão desatualizados; não foram reavaliados.
- CHANGELOG: duas versões `6.3.0` no histórico do `PROJECT_STATE.md` (terceira e quarta remediação) foram agrupadas sob um único `## 6.3.0`.
- `README.md` antigo manda abrir o Docker Desktop; desde 3.5.0 (2026-09-01) o ambiente usa Docker Engine nativo no WSL2.
- `CHANGELOG.md`: entradas de 3.8.0 a 12.0.0 versionadas em 2026-10-19 (as duas `3.9.0` viraram 3.9.0 e 3.9.1); entradas antigas `## AAAA-MM-DD — …` (GG Conta 4.x, marcos C/D/E) e `## Não publicado` continuam sem versão do projeto.
