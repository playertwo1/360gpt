# PROJECT STATE

Version: 3.9.0-telegram-hardening
Current phase: MVP Telegram resiliente
Current milestone: P0 — blindagem conversacional, estabilidade e aprendizado supervisionado
Current task: P0.4/P0.10 — preparar execução controlada dos workflows no canário
Status: IN_PROGRESS

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1` e `visao-360-n8n-1`; Docling/worker são serviços de processamento sob demanda.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: fila, lotes de debounce, endpoints inbound, persistência de diretrizes, endpoint typing, WF-97/WF-98/WF-99, retenção n8n e remoção de dados demo da interface validados localmente
Next task: autorizar e executar uma rodada controlada do WF-97/WF-98 com ponte sintética; manter workflows inativos até essa rodada

Last validation: 2026-09-02 — `npm run test:p0` PASS; npm lint PASS; Docker Compose saudável (PostgreSQL, n8n, Docling e document-worker); workflows WF-97/98/99 importados e inativos. Execução ponta a ponta ainda não disparada para evitar efeito externo na ponte hospedada.
Last commit: 83a266c feat: prepare local p0 canary and remove demo data

Blockers:
- Shadow sintético: última medição 20/20 aprovada, porém janela horária está incompleta (`HOURLY_MEASUREMENT_GAP`); manter restrito e não promover.
- WF-11 permanece despublicado preventivamente até o gate funcional Docling.
- Docling processou os três PDFs em menos de cinco minutos, porém uniu/deslocou células em tabelas complexas.
- Não republicar o Telegram automático enquanto META, REALIZADO, % ATG, pontos e período não estiverem 100% associados.
- Verificação final do deploy Sites v42 exige reconectar a conta proprietária `fael@live.de`; a sessão atual retorna `project_not_found` e não lista Sites.
- Publicação autorizada em 2026-09-01, mas bloqueada: o conector Sites retornou `project_not_found` para `appgprj_6a8cd5d2678c8191b45be663fbb2a6fc` e não listou nenhum site. Login no Firefox não altera a sessão do conector.

Decisions:
- Docling Serve 1.30.0 em CPU é o único OCR.
- PyMuPDF pode extrair somente texto digital nativo; XLSX/CSV permanecem nativos.
- MinerU e Tesseract não possuem fallback, container, imagem, scripts ou dependências.
- Falha do Docling em imagem/PDF escaneado gera retry e posterior revisão humana.

Pending decisions:
- Fornecer/confirmar regras oficiais dedicadas de Seguros e Cartões; até lá permanecem valores reportados pela fonte.

Last update: 2026-09-02 01:20

Resume instruction:
1. Continuar `ROADMAP.md` a partir de P0.4 e formalizar o contrato de intenção estruturada.
2. Preservar alterações preexistentes em `test-data/` e `backup/` fora do commit P0.
3. Reconectar/autorizar a conta proprietária `fael@live.de` no conector Sites/Codex; depois publicar exatamente o commit validado.
4. Após P0, retomar N2 sem alterar o gate objetivo do Docling.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
