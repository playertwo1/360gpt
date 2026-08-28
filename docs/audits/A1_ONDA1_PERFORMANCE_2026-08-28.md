# A1 — Onda 1 do canary sintético do GG Performance

**Data:** 2026-08-28  
**Autorização:** Rafael autorizou o início do canary sintético supervisionado.  
**Escopo:** `PERFORMANCE_SCORING_STATE`, três fixtures sintéticas, sem integração externa.

## Resultado técnico

| Critério | Resultado |
|---|---|
| Casos | 3/3 |
| Fonte | `SYNTHETIC_CANARY_FIXTURE` |
| Política | `POBJ_SCORING_2026_H2` v1.0.0 |
| Cálculos válidos | 3/3 |
| Erros de schema | 0 |
| Mutações de estado | 0 |
| Efeitos externos | 0 |
| Decisão humana | pendente em todos os casos |

## Leituras produzidas

1. 65% de atingimento: 0 ponto, classe `RESCUE_MINIMUM`.
2. 85% de atingimento: 6,375 pontos, classe `ADVANCE_WITHIN_SCORING_RANGE`.
3. 155% de atingimento: teto de 15 pontos, classe `DEPRIORITIZE_FOR_POINTS`.

## Decisão pendente

Rafael deve revisar os três resultados e informar se aprova a progressão para a Onda 2 (cinco casos sintéticos). Nenhuma decisão foi simulada ou gravada em seu nome.
