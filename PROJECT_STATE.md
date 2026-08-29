# PROJECT STATE

Version: 3.4.0-r0
Current phase: Reconstrução do MVP real assíncrono
Current milestone: R1 — Ingestão assíncrona única
Current task: Remover extração pesada da requisição e formalizar estados persistentes
Status: IN_PROGRESS

Last completed: R0 aprovado com backup verificável, restauração isolada do n8n, baseline honesto, conjunto de aceite e kill switch do caminho síncrono
Next task: Executar R1 sem pedir novo upload a Rafael

Last validation: PASS — backup SHA-256 conferido em duas cópias, restauração de 11 workflows, lint, build e H3_BRIDGE_AUDIT_PASS
Last commit: HEAD (checkpoint R0)

Blockers:
- none

Pending decisions:
- Nenhuma para R0–R5; efeitos externos continuam fora do escopo.

Last update: 2026-08-29 06:05

Resume instruction:
Continue `docs/ROADMAP_RECONSTRUCAO_MVP_REAL.md` em R1; retire a extração da requisição, formalize estados e valide localmente sem solicitar upload ao usuário.
