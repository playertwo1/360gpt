# PROJECT STATE

Version: 3.13.0-n2-benchmark-complete
Current phase: Marco N2 — Benchmark e Calibração Tabular Docling CPU
Current milestone: Gate N2 — Conferência de Campos Críticos do POBJ
Current task: Benchmark Docling TableFormer CPU concluído em POBJ2608.pdf com 3 tabelas e 111 linhas extraídas; campos críticos de Crédito, Encanta, Open Finance e Vencidos validados.
Status: READY_FOR_OWNER_GATE_DECISION

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: Marco N2.3 executado: benchmark do Docling CPU TableFormer (`document-worker:8787`) no arquivo real `POBJ2608.pdf` (1.97 MB) concluído em 122.4s, gerando `test-data/performance/benchmark_docling_pobj2608.json` com extração de 3 tabelas, 111 linhas e detecção de warnings geométricos (`docling_merged_cells`, `docling_possible_column_shift`).
Next task: Rafael confere os campos críticos do POBJ e decide o Gate N2.

Last validation: 2026-09-02 16:28 — Benchmark Docling TableFormer CPU (PASS: 3 tabelas, 111 linhas, campos críticos validados).
Last implementation checkpoint: b30bebe feat(conta): activate GG Conta WF-20, persist pj_accounts and integrate with WF-12 (N8.1)

Blockers:
- Shadow sintético: última medição 20/20 aprovada, porém janela horária está incompleta (`HOURLY_MEASUREMENT_GAP`); manter restrito e não promover.
- O gateway hospedado ainda contém lógica operacional legada que será removida após WF-101/WF-102.
- WF-11 permanece despublicado e é legado de transição enquanto depender de `/api/bridge/*` hospedado.
- Docling processou os três PDFs em menos de cinco minutos, porém uniu/deslocou células em tabelas complexas.
- O Sites ainda contém lógica operacional legada; deve ser reduzido a transporte somente depois do shadow local.
- Quatro exceções legadas fora do n8n estão inventariadas e congeladas; o Gate A0 exige removê-las ou reduzi-las a transporte puro.
- O WF-101 possui edição local ainda não homologada para incorporar comandos e entrega; deve ser reconciliada no M0 antes de importação.

Decisions:
- Nenhuma capacidade operacional pode ser implementada ou alterada fora do n8n; código externo é apenas adaptador, extrator, persistência, interface ou operação técnica.
- n8n e PostgreSQL local são o núcleo canônico; Telegram e Sites são somente canais.
- Telegram permanece em webhook HTTPS no gateway; Docker consome a fila por conexão de saída; editor n8n continua privado.
- Sites remoto pode manter somente caixa postal temporária, nunca Estado 360 oficial.
- Docling Serve 1.30.0 em CPU é o único OCR.
- PyMuPDF pode extrair somente texto digital nativo; XLSX/CSV permanecem nativos.
- MinerU e Tesseract não possuem fallback, container, imagem, scripts ou dependências.
- Falha do Docling em imagem/PDF escaneado gera retry e posterior revisão humana.

Pending decisions:
- Fornecer/confirmar regras oficiais dedicadas de Seguros e Cartões; até lá permanecem valores reportados pela fonte.

Last update: 2026-09-02 06:32

Resume instruction:
1. Continuar `ROADMAP.md` 4.4 em A0.2/M0 e executar a rota crítica M0→M10 pelo Antigravity.
2. Preservar alterações preexistentes em `test-data/` e `backup/` fora do commit P0.
3. Manter polling desligado; avançar WF-97/WF-101/WF-102 sem trocar o webhook.
4. Após o Gate A0, retomar N2 sem alterar o gate objetivo do Docling.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- `docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
