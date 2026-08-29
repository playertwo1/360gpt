# PROJECT STATE

Version: 3.4.0-r1
Current phase: Reconstrução do MVP real assíncrono
Current milestone: R2 — Ponte local e worker durável
Current task: Permitir reserva e download protegido de documentos pendentes pelo worker local
Status: IN_PROGRESS

Last completed: R1 aprovado localmente com intake rápido no site/Telegram, protocolo, deduplicação entre canais, estados formais e polling de cinco segundos
Next task: Executar R2 usando arquivos já autorizados, sem pedir novo upload a Rafael

Last validation: PASS — `scripts/test-r1-async-intake.ps1`, lint e build
Last commit: 34fb0340d9a7ba243862f4c10f8f0fad96e65e78

Blockers:
- none

Pending decisions:
- Publicação da versão hospedada 35 do R1 exige autorização explícita porque o site tem acesso público; isso não bloqueia R2.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-29 07:05

Resume instruction:
Continue `docs/ROADMAP_RECONSTRUCAO_MVP_REAL.md` em R2; ajuste claim/file/lease e implemente o worker local durável sem solicitar upload ao usuário.
