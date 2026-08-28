# P2 — Auditoria dos motores determinísticos

**Data:** 28 de agosto de 2026  
**Shadow:** não alterado e não executado nesta validação.

## Resultado

`P2 — EM ANDAMENTO COM BASE HOMOLOGADA`

### Comprovado

- POBJ: piso, teto, peso, multiplicadores, produção oficial, pendência, projeção, gaps, prioridade e ranking limitado a cinco indicadores.
- Freshness POBJ: data-base por indicador, watermark e estados de atraso.
- GDAD: orçamento, realizado, variação, atribuição desconhecida e resumo parcial.
- Relacionamento: compromissos abertos, concluídos, cancelados, incompletos e vencidos sem fechamento automático.
- Conta: regras de elegibilidade, identificadores fortes e revisão manual para incerteza, conforme contratos e testes de domínio.

## Validações executadas

- `node tests/pobj-engine.test.mjs` — PASS.
- `node tests/pobj-policy.test.mjs` — PASS.
- `node tests/pobj-freshness-policy.test.mjs` — PASS.
- `node tests/gdad-commitments-engine.test.mjs` — PASS.
- `node tests/domain-behavior.test.mjs` — PASS.

## Pendências que não podem ser inventadas

- Curvas dedicadas das exceções POBJ: dependem de evidência normativa completa.
- Curvas oficiais de pontos do manual vigente: ainda não há artefato normativo verificável para promover regra.
- Ausência de contato: requer política de cadência, período de observação e definição de contato válido.
- Observação de um mês completo e homologação de cadências: dependem de dados e decisão operacional de Rafael.

Essas pendências não bloqueiam os motores já validados nem autorizam dados reais ou ativação.
