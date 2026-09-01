# PROJECT STATE

Version: 3.8.0-docling-only
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: N2/M1 — homologação objetiva do leitor documental
Current task: corrigir desalinhamentos de células Docling nos layouts POBJ reais
Status: IN_PROGRESS

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1` e `visao-360-n8n-1`; Docling/worker são serviços de processamento sob demanda.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: planejamento e checklist consolidados no `ROADMAP.md`; nove documentos concorrentes removidos e referências ativas atualizadas
Next task: reconstruir corretamente as tabelas de POBJ2608, POBJ2708 e POBJ2808 e repetir o benchmark objetivo

Last validation: inventário documental e referências do roadmap PASS; validação técnica anterior: Compose, Docling, worker, lint e build PASS; POBJ2608 em 142,6 s preservou 12 posições, mas manteve células unidas
Last commit: 86139cf (`feat: consolidate Docling-only document pipeline`)

Blockers:
- WF-11 permanece despublicado preventivamente até o gate funcional Docling.
- Docling processou os três PDFs em menos de cinco minutos, porém uniu/deslocou células em tabelas complexas.
- Não republicar o Telegram automático enquanto META, REALIZADO, % ATG, pontos e período não estiverem 100% associados.

Decisions:
- Docling Serve 1.30.0 em CPU é o único OCR.
- PyMuPDF pode extrair somente texto digital nativo; XLSX/CSV permanecem nativos.
- MinerU e Tesseract não possuem fallback, container, imagem, scripts ou dependências.
- Falha do Docling em imagem/PDF escaneado gera retry e posterior revisão humana.

Pending decisions:
- Fornecer/confirmar regras oficiais dedicadas de Seguros e Cartões; até lá permanecem valores reportados pela fonte.

Last update: 2026-09-01 18:45

Resume instruction:
1. Ler somente `ROADMAP.md` como planejamento/checklist e retomar N2.
2. Evoluir a reconstrução de células POBJ sem dividir conteúdo por suposição.
3. Repetir POBJ2708/2808 e acrescentar dois documentos reais quando disponíveis.
4. Executar regressão WF-11/WF-13 após fechar a regra estrutural.
5. Somente após passar o gate, publicar WF-11 e avançar N3–N7.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
