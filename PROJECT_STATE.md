# PROJECT STATE

Version: 3.5.1-n2
Current phase: Reconstrução do MVP real assíncrono
Current milestone: N1 — Controlador mestre no n8n
Current task: Validar o ciclo completo do WF-11 com `metas1708.pdf`
Status: IN_PROGRESS

Last completed: MinerU 3.4.5 integrado como parser local principal, fallback PyMuPDF/Tesseract comprovado e PDF/JPG/XLSX reais validados pelo worker
Next task: Executar um job controlado pelo WF-11 e provar claim, download, extração MinerU, validação e complete

Last validation: PASS — bateria geral 29/29, MinerU, fallback OCR, WF-11, H3, C1, lint, build e Docker Compose
Last commit: beab99b (`feat(ocr): integrate MinerU as internal document parser`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB e usa cerca de 5,7 GB de RAM no modo híbrido; concorrência limitada a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 01:15

Resume instruction:
Continue `docs/ROADMAP_N8N_MVP_REAL.md` em N1/N2; execute o `metas1708.pdf` pelo WF-11 completo e só depois avalie ativar seu agendamento.
