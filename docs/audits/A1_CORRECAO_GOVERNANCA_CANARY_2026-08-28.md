# Correção de governança do canary sintético

**Data:** 2026-08-28  
**Motivo:** o simulador legado apresentava decisões e overrides como se fossem decisões humanas de Rafael.

## Correção aplicada

- O simulador passou a registrar somente fixtures sintéticas e `PENDING_RAFAEL_REVIEW`.
- Campos de decisão, hash de decisão, taxa de override e concordância ficam nulos até uma decisão humana real.
- A bateria geral agora identifica a Fase 7 como simulação sintética, não operação real.

## Validação

- `powershell -File scripts/test-phase7-canary-rollout.ps1`: aprovado.
- `powershell -File scripts/run-all-hybrid-tests.ps1`: 14/14 aprovados.
- `npm run lint`: aprovado.

## Limite preservado

Esta correção não promoveu agentes, não conectou a fonte POBJ, não modificou o Estado 360 e não produziu efeitos externos.
