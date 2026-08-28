# A2 — Performance em leitura supervisionada

**Data:** 2026-08-28
**Autorização:** Rafael autorizou o início de A2 nesta conversa.
**Capacidade única:** `PERFORMANCE_SCORING_STATE`.
**Runtime:** `SHADOW`; o Gerente Geral de Performance e todas as demais capacidades permanecem `INACTIVE`.

## Escopo efetivo

| Controle | Estado |
|---|---|
| Dados | `SYNTHETIC_ONLY` |
| Fonte real POBJ | desconectada |
| Campos permitidos | `meta`, `realizado`, `periodo` |
| Revisão humana | obrigatória |
| Efeitos externos | proibidos |
| Mutação de estado de negócio | proibida |
| Rollback | `DISABLE_CAPABILITY` |

## Validação de entrada

- Manifesto e registro de capacidades reconciliados: somente `PERFORMANCE_SCORING_STATE` está em `SHADOW`.
- Política A2 rejeita fontes reais, documentos Telegram e conectores externos.
- Testes de manifesto, lifecycle e política A2 aprovados; bateria geral anterior permaneceu 14/14 aprovada.

## Saída de A2

A2 só poderá ser encerrada após janela supervisionada estável, métricas de erro, divergência, custo e latência registradas, revisão humana preservada e teste de rollback. Nenhuma condição deste documento autoriza A3, dados reais ou efeitos externos.
