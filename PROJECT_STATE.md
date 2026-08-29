# PROJECT STATE

Version: 3.5.0-n1
Current phase: Reconstrução do MVP real assíncrono
Current milestone: N1 — Controlador mestre no n8n
Current task: Validar execução manual do WF-11 com o document-worker
Status: IN_PROGRESS

Last completed: document-worker OCR criado e saudável na rede interna, com PDF nativo, PDF escaneado, JPG/PNG, XLSX/CSV e contrato estruturado
Next task: Executar o WF-11 manualmente com arquivo já autorizado e inspecionar a extração

Last validation: PASS — `scripts/test-document-worker.ps1`: saúde, acesso pelo n8n, endpoint multipart, OCR JPG e extração PDF nativa; lint e build
Last commit: 9e070c5ed5d62a92a5a93da29dadcb68d7c4f362

Blockers:
- none

Pending decisions:
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-29 06:34

Resume instruction:
Continue `docs/ROADMAP_N8N_MVP_REAL.md` em N1; valide manualmente o WF-11 com arquivo já autorizado e inspecione a extração do document-worker.
