# P3 — Contratos e limites dos quatro Gerentes Gerais

**Data:** 28 de agosto de 2026  
**Shadow:** não alterado e não executado nesta validação.

## Resultado

`P3 — APROVADO`

- Manifesto, registro de capacidades e roteamento reconciliados.
- Lifecycle confirma que `APPROVED` não implica `ACTIVE`.
- Os quatro Gerentes Gerais permanecem `runtime: INACTIVE`.
- Catálogos e especialistas permanecem fechados e compatíveis com o manifesto.
- Limite de quatro especialistas por domínio confirmado.
- Dependências e mediação Conta–Performance confirmadas; chamadas laterais não são permitidas.
- Contratos de domínio e handoffs Draft 2020-12 presentes e validados.
- Efeitos externos permanecem proibidos para especialistas e gerentes.

## Validações executadas

- `node tests/domain-contracts.test.mjs` — PASS.
- `node tests/director-router.test.mjs` — PASS.
- `node tests/performance-conta-contract.test.mjs` — PASS.
- `node tests/conta-contracts.test.mjs` — PASS.
- `python tests/policy-lifecycle.test.py` — PASS.

Foi adicionada a dependência `PyYAML==6.0.3` em `requirements-dev.txt` para tornar o teste Python reproduzível.

## Critério de saída

P3 concluído sem promover nenhum gerente. O próximo trabalho seguro é P4: validar a jornada completa de orquestração, contexto, conflitos e publicação do Estado 360 com dados sintéticos.
