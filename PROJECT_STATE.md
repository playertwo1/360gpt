# PROJECT STATE

Version: 6.1.0-gates-a0-n2.3-remediated (submetido para reauditoria independente Codex)
Current phase: Remediação da auditoria independente dos Gates A0 e N2.3
Current milestone: Blocos 0 a 7 executados integralmente; pronto para reauditoria pelo ChatGPT Codex
Current task: Submeter novo commit e relatório formal para reauditoria independente do ChatGPT Codex.
Status: AUDIT_REMEDIATED_PENDING_REAUDIT

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed:
1. Execução integral dos Blocos 0 a 7 de remediação exigidos pelo ChatGPT Codex.
2. Cutover canônico A0 real: `app/api/ingest/telegram/route.ts` reduzido a transporte técnico puro; rotas `app/api/bridge/*` arquivadas em `legacy/bridge/` e excluídas do build (`npm run build` com 0 rotas bridge).
3. Migration versionada `infra/postgres/init/09-flywheel-learning.sql` aplicada no PostgreSQL `visao360` com constraints estritas de integridade.
4. Refatoração dos 5 motores N2.3 (CANDIDATE padrão, promoção soberana, Few-Shot dinâmico sem fallback cego, DUR desacoplado de model_confidence, memória negativa com Evidence Graph).
5. WF-104 reimplementado no n8n Docker com nós PostgreSQL reais consultando `decision_outcomes` e reimportado inativo.
6. Bateria E2E real contra PostgreSQL `visao360` (`tests/flywheel-learning-postgres-integration.test.mjs`) 10/10 PASS sem nenhum mock em memória.
7. Criado `security/THREAT_MODEL.md` e `docs/audits/RESPOSTA_REMEDIACAO_CODEX_GATES_A0_N2_3.md` respondendo às 20 perguntas obrigatórias e aos 27 achados.
Next task: Enviar relatório formal e commit para reauditoria independente do ChatGPT Codex.

MVP text scope: cinco casos aprovados — pergunta simples, fato simples, fato+pergunta, correção simples e texto longo estruturado. Totalmente integrados aos 4 Gerentes Gerais, motores de simulação, reconciliação, context trimming e segurança DLP.

Post-MVP scope: N2.2 documenta memória em camadas, aprendizagem supervisionada, simulações, roteamento multidomínio, linguagem contextual, comandos ampliados, reconciliação, experiência, eficiência, segurança e observabilidade. 100% CONCLUÍDO E HOMOLOGADO.

Last validation: PASS (AUDIT REMEDIATION) — `npm test` aprovado com 10/10 no PostgreSQL real, `npm run build` limpo sem pontes e `test-n8n-canonical-architecture.mjs` validado com inspeção estrutural de código.
Last implementation checkpoint: remediating commit (post-audit Codex)

Blockers:
- Nenhum bloqueador técnico pendente; aguardando parecer e carimbo final de reauditoria independente do ChatGPT Codex.
- Shadow sintético: última medição 20/20 aprovada, porém janela horária está incompleta (`HOURLY_MEASUREMENT_GAP`); manter restrito e não promover.
- Docling processou os três PDFs em menos de cinco minutos, porém uniu/deslocou células em tabelas complexas (reconciliação mitigada pela Fase 6).

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
- Nenhuma decisão pendente para N2.1: Rafael aprovou entrada textual direta com roteamento pelo Diretor.

Last update: 2026-09-02 — auditoria independente Codex do commit `940c38b`

Resume instruction:
1. Ler integralmente `docs/audits/AUDITORIA_CODEX_GATE_A0_N2_3_COMMIT_940C38B.md`.
2. Responder às 20 perguntas obrigatórias e executar os Blocos 0–7 na ordem segura.
3. Não avançar Gate N7 enquanto A0 e N2.3 permanecerem reabertos.
4. Após as correções, fornecer commit, migrations, exports do n8n e evidências de E2E real para nova auditoria Codex.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- `docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
