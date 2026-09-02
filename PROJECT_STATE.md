# PROJECT STATE

Version: 3.9.0-telegram-hardening
Current phase: MVP Telegram resiliente
Current milestone: P0 — blindagem conversacional, estabilidade e aprendizado supervisionado
Current task: N2.1 — reprocessar e validar associação de células críticas nos POBJ autorizados
Status: IN_PROGRESS

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1` e `visao-360-n8n-1`; Docling/worker são serviços de processamento sob demanda.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: correção da exclusão por cadeia de hash, protocolo curto operacional e migrações Drizzle oficiais
Next task: reprocessar POBJ2608/2708/2808 e validar META, REALIZADO, % ATG, pontos e período antes do Gate N2

Last validation: 2026-09-02 — `npm run test:p0` PASS; `npm run lint` PASS; `npm run build` PASS; migrações 0011–0013 geradas pelo Drizzle.
Last commit: pendente — correção de exclusão por hash e protocolo curto

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

Last update: 2026-09-02 01:18

Resume instruction:
1. Continuar `ROADMAP.md` na fila executável de N2: validar extração Docling e campos críticos.
2. Preservar alterações preexistentes em `test-data/` e `backup/` fora do commit P0.
3. Reconectar/autorizar a conta proprietária `fael@live.de` no conector Sites/Codex; depois publicar exatamente o commit validado.
4. Após P0, retomar N2 sem alterar o gate objetivo do Docling.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
