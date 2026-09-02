# PROJECT STATE

Version: 3.14.0-gate-n2-approved
Current phase: Transição Pós-Gate N2 para N8.2 (GG Relacionamento) e Testes E2E
Current milestone: Gate N2 — Leitor Docling CPU TableFormer Homologado por Rafael
Current task: Gate N2 formalmente homologado por Rafael ("Sim"); campos críticos do POBJ validados com precisão de 100%.
Status: GATE_N2_APPROVED

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: Gate N2 homologado formalmente por Rafael em 02/09/2026 após conferência dos campos críticos do POBJ2608 (Crédito PJ 180,77%, Encanta BRA 104,17%, Open Finance 125,00%, Vencidos 64,86%), com extração pelo Docling CPU TableFormer em 122.4s.
Next task: Avançar para a Fase N8.2 (GG Relacionamento — Inteligência de Contatos, Objeções e Abordagem PJ) e testes ponta a ponta.

Last validation: 2026-09-02 16:30 — Homologação formal de Rafael no Gate N2 (PASS); benchmark tabular 100% preciso; warnings geométricos emitidos sem alucinação.
Last implementation checkpoint: 6ac408f test(n2): benchmark Docling CPU TableFormer on real POBJ2608.pdf with 3 tables and 111 rows

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
