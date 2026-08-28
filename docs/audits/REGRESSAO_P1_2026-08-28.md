# Regressão P1 — Base técnica e bateria geral

**Data:** 28 de agosto de 2026  
**Escopo:** regressão da base técnica, contratos, segurança, persistência e build.  
**Shadow:** não executado nem alterado; permanece isolado na janela sintética em andamento.

## Resultado

`P1 — APROVADO`

- Bateria geral `scripts/run-all-hybrid-tests.ps1`: **14/14 aprovados** (`ALL_HYBRID_TESTS_PASS`).
- Contratos Draft 2020-12: aprovados pela bateria geral.
- Ponte, idempotência, fila, lease, retries e DLQ: aprovados pela bateria geral.
- Intake multimodal, segurança, LGPD e canary sintético: aprovados pela bateria geral.
- Backup e recuperação: aprovados pela bateria geral; restauração PostgreSQL isolada previamente aprovada.
- Evidence Graph: teste local aprovado em `pwsh -File scripts/test-evidence-graph.ps1`, com linhagem, append-only e acesso anônimo bloqueado.
- `npm run lint`: aprovado sem erros ou avisos.
- `npm run build`: aprovado; todas as rotas foram compiladas.

## Observação de integridade

O teste da bateria atualiza o fixture local `test-data/laudo_executivo_360_sample.pdf`. Esse arquivo já estava fora do escopo documental e permanece preservado, sem ser incluído no checkpoint P1. Também permanecem preservados `.codex-remote-attachments/` e `test-data/release-readiness-latest.log`.

## Critério de saída

P1 pode avançar para P2: a base técnica está validada; os próximos trabalhos são exclusivamente os motores determinísticos ainda pendentes, sem promoção de agentes e sem dados reais.
