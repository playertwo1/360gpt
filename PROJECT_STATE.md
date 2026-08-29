# PROJECT STATE

Version: 3.5.0-n1
Current phase: Reconstrução do MVP real assíncrono
Current milestone: N1 — Controlador mestre no n8n
Current task: Publicar a liberação de claim e validar execução manual do WF-11 com o document-worker
Status: IN_PROGRESS

Last completed: document-worker OCR criado e saudável na rede interna, com PDF nativo, PDF escaneado, JPG/PNG, XLSX/CSV e contrato estruturado
Next task: Preparar versão hospedada com claim e intake de imagens, publicar mediante autorização e executar o WF-11 manualmente

Last validation: PASS — `scripts/test-document-worker.ps1`: saúde, acesso pelo n8n, endpoint multipart, OCR JPG e extração PDF nativa; lint e build
Last commit: 33d5738561b04e6fd2df9a569d3add7886d852ba

Blockers:
- none

Pending decisions:
- Publicar a próxima versão hospedada será necessário para liberar claim de documentos POBJ recebidos; publicação pública exige autorização específica.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-29 06:38

Resume instruction:
Continue `docs/ROADMAP_N8N_MVP_REAL.md` em N1; salve a próxima versão hospedada, obtenha autorização de publicação e valide o WF-11 com arquivo já autorizado.
