# P7 — Preparação do canary individual

**Data:** 28 de agosto de 2026  
**Shadow:** não alterado e não executado.

## Resultado

`P7 — PREPARADO; EXECUÇÃO AGUARDA GATE SHADOW`

- Protocolo de ondas 1–3, 5 e 10 disponível em `docs/PROTOCOLO_CANARY_SUPERVISIONADO.md`.
- Pacote específico do GG Performance disponível em `docs/CANARY_GG_PERFORMANCE.md`.
- Métricas, limites de pausa, rollback para `INACTIVE` e efeitos externos proibidos documentados.
- A simulação sintética da Fase 7 já foi homologada pela bateria geral.
- Primeiro candidato recomendado: GG Performance; capacidade deve ser escolhida por Rafael.

## Validação

- `powershell -File scripts/test-phase7-canary-rollout.ps1` — PASS (simulação sintética).

## Regra de execução

Nenhum canary será executado ou promovido antes da conclusão das 24 medições, aprovação do Gate Shadow e autorização explícita de Rafael.
