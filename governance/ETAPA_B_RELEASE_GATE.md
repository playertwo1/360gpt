# Gate de saída — Etapa B

**Versão:** 1.0.0  
**Estado:** HOMOLOGATED  
**Autoridade de aprovação:** Rafael

## Objetivo

Comprovar que os contratos dos novos agentes são coerentes, seguros e testáveis antes da implementação dos motores determinísticos.

## Critérios obrigatórios

| Critério | Estado | Evidência |
|---|---|---|
| Manifesto contém quatro Gerentes e 21 especialistas | PASS | tests/project-manifest.test.mjs |
| Aprovação não implica runtime ativo | PASS | tests/policy-lifecycle.test.py |
| Performance possui entrada e resposta específicas | PASS | contracts/performance-specialist-*.schema.json |
| Financeiro possui entrada e resposta específicas | PASS | contracts/financial-specialist-*.schema.json |
| Relacionamento possui entrada e resposta específicas | PASS | contracts/relationship-specialist-*.schema.json |
| Exemplos canônicos cobrem os seis contratos | PASS | test-data/contracts |
| Piso, teto, defasagem e limite de cinco ações estão testados | PASS | tests/domain-behavior.test.mjs |
| Fonte financeira parcial não produz atribuição confirmada | PASS | tests/domain-behavior.test.mjs |
| Compromisso vencido preserva leitura alternativa | PASS | tests/domain-behavior.test.mjs |
| Integração Performance–Conta é mediada pelo Motor 360 | PASS | tests/performance-conta-contract.test.mjs |
| Fase inicial não contém empresa, conta ou origem por ação | PASS | tests/performance-conta-contract.test.mjs |
| Aprovação formal de Rafael | PASS | Aprovação registrada em 27/08/2026 |

## Condição de saída

A Etapa B somente muda de VALIDATING para HOMOLOGATED quando todos os critérios estiverem em PASS e Rafael aprovar explicitamente este gate.

Homologar a Etapa B não ativa gerentes, especialistas, ferramentas ou dados reais. A próxima etapa será a implementação isolada dos motores determinísticos.

## Rollback

Qualquer regressão reabre o gate, altera o estado para VALIDATING e bloqueia a promoção da Etapa C.
