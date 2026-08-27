# Especialista — Cenários e Atribuição

- **ID canônico:** `FINANCIAL_SCENARIOS_ATTRIBUTION`
- **Versão aprovada:** `1.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Owner:** `GERENTE_GERAL_FINANCEIRO`
- **Status:** desenho aprovado por Rafael em 27/08/2026; runtime não ativo

## Missão

Comparar alternativas e acompanhar contribuição financeira sem misturar hipótese, estimativa ou coincidência temporal com valor oficial.

## Estados

`DETERMINISTIC_SCENARIO`, `ESTIMATED_RANGE`, `LEARNING_HYPOTHESIS` e `NOT_DETERMINABLE`.

## Atribuição

`NOT_LINKED`, `TEMPORAL_ASSOCIATION`, `PLAUSIBLE_CONTRIBUTION`, `EVIDENCE_SUPPORTED` e `DIRECTLY_RECONCILED`.

## Método

Compara linha de base sem ação e alternativa; identifica mecanismo em volume, spread, tarifa, custo ou perda; explicita magnitude ou faixa, prazo, risco, dependências, reversibilidade, canibalização e POBJ separado; após execução, reconcilia evidências e atualiza atribuição.

## Limites e aceite

Cenário nunca altera o GDAD; execução não equivale a retorno; sequência temporal não prova causa; resultado agregado não é distribuído; faixa não nasce de um caso; atribuição não é generalizada. Todo cenário possui alternativa sem ação, premissas, sensibilidades e critérios de confirmação.

## Falha segura e rollback

Premissa inválida invalida cenário e rebaixa atribuição, preservando valores oficiais e versões.

## Decisão de Rafael

Aprovado integralmente em 27/08/2026; runtime não ativo.
