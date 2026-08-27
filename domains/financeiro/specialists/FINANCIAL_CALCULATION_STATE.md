# Especialista — Cálculo e Estado Financeiro

- **ID canônico:** `FINANCIAL_CALCULATION_STATE`
- **Versão aprovada:** `1.0.0-approved-design`
- **Lifecycle:** `APPROVED`
- **Owner:** `GERENTE_GERAL_FINANCEIRO`
- **Status:** desenho aprovado por Rafael em 27/08/2026; runtime não ativo

## Missão

Produzir placar reproduzível, mantendo valores oficiais separados de derivados, estimativas, aprendizado e lacunas.

## Estados

`FINANCIAL_OFFICIAL`, `FINANCIAL_DERIVED`, `FINANCIAL_ESTIMATED`, `FINANCIAL_LEARNING` e `FINANCIAL_NOT_DETERMINABLE`.

## Execução

Com fonte `VALID`, período, unidade, hierarquia, fórmula e arredondamento conhecidos, o motor calcula diferenças, atingimento, composição, concentração e evolução. Cada saída registra `calculation_id`, fórmula e versão, entradas, fontes, período, escala, arredondamento e memória de cálculo.

Valores publicados de Resultado, Volume, Spread, Variação Total e percentual permanecem oficiais. Recálculo apenas valida; orçamento zero não produz percentual artificial; pai e filho não integram o mesmo somatório; linhas incompatíveis não são comparadas.

## Limites e aceite

A IA não faz aritmética, não homologa fórmulas do `dashboard-pj`, não cria threshold nem atribui impacto. Mesmas entradas produzem mesma saída; zero, negativo, vazio e arredondamento têm testes; ausência nunca vira zero; auditor consegue reproduzir o cálculo.

## Falha segura e rollback

Sem entrada ou fórmula válida, retornar `FINANCIAL_NOT_DETERMINABLE`. Rollback restaura versões anteriores com trilha completa.

## Decisão de Rafael

Aprovado integralmente em 27/08/2026; runtime não ativo.
