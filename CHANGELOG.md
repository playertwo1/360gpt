# Changelog

## 2026-08-26 — Auditoria retrospectiva Fases 0–7

- Bateria híbrida executada com 13/13 testes aprovados.
- Auditoria retrospectiva registrada em `docs/audits/AUDITORIA_RETROSPECTIVA_FASES_0_A_7_2026-08-26.md`.
- Contratos JSON corrigidos para declarar `$schema` Draft 2020-12 e `$id` válido.
- Endpoints de canário, FinOps e laudo PDF protegidos por autenticação e autorização do usuário do Dashboard.
- Erros de lint nos endpoints corrigidos; build e compilação Python validados.
- Registradas limitações que permanecem: avaliações L2–L4 com risco de leakage, canário e recuperação ainda simulados, rotas com dependência de runtime Node, métricas do Dashboard estáticas e necessidade de evidência formal para dados reais.
- Ambiente mantido em `OFFLINE_EVAL`; nenhuma integração externa ou dado real foi ativado.

