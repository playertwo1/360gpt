# PROJECT STATE

Version: 6.2.0-gates-a0-n2.3-remediated-v2
Current phase: Segunda remediação concluída — aguardando nova reauditoria independente do Codex
Current milestone: Blocos R0 a R6 executados; 28 achados e 25 perguntas respondidos no dossiê de resposta
Current task: Submeter commit e evidências para nova reauditoria independente pelo ChatGPT Codex.
Status: READY_FOR_CODEX_REAUDIT

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed:
1. Execução integral dos Blocos R0 a R6 do dossiê de reauditoria.
2. Contenção e backups duráveis: WF-11, WF-97, WF-98 e WF-104 desativados no n8n; dumps físicos em backups/durable/ com SHA-256 e restauração validada em banco isolado.
3. Gate A0 Canônico: gateway app/api/ingest/telegram purificado (HTTP 202 puro), lib/telegram-runtime.ts como adaptador neutro de tipos/mojibake, WF-101 purgado de empresas estáticas e zero rotas bridge ativas no banco n8n.
4. Gate N2.3 Flywheel: migration incremental 10 sem DROP; Learning Engine determinístico com autopromoção de baixo risco e MANUAL_REVIEW de alto risco; regras nascem CANDIDATE; constraints de promoção; trigger append-only de auditoria; Evidence Graph estrito (FINDING / DERIVED_FROM); SHA-256 canônico.
5. Teste 10/10 no PostgreSQL real (tests/flywheel-learning-postgres-integration.test.mjs); npm test PASS; npm run lint PASS; npm run build PASS.
6. Criação do dossiê docs/audits/RESPOSTA_SEGUNDA_REMEDIACAO_CODEX_GATES_A0_N2_3.md com 28 achados e 25 perguntas integralmente preenchidos.
Next task: Submeter o commit ao Codex para realização da reauditoria independente.

MVP text scope: cinco casos aprovados — pergunta simples, fato simples, fato+pergunta, correção simples e texto longo estruturado. Totalmente integrados aos 4 Gerentes Gerais, motores de simulação, reconciliação, context trimming e segurança DLP.

Post-MVP scope: N2.2 documenta memória em camadas, aprendizagem supervisionada, simulações, roteamento multidomínio, linguagem contextual, comandos ampliados, reconciliação, experiência, eficiência, segurança e observabilidade. 100% CONCLUÍDO E HOMOLOGADO.

Last validation: PASS_ON_REAL_RUNTIME — npm test aprovado (test:p0, test:local-core, test:flywheel 10/10 no PostgreSQL real), lint aprovado, build aprovado.
Last implementation checkpoint: HEAD (Segunda remediação concluída)

Blockers:
- Gates A0 e N2.3 permanecem formalmente em estado de homologação pendente até a nova auditoria independente do ChatGPT Codex.
- WF-104 mantido inativo (active = false) no tenant operacional por governança.
- Gate N7 permanece bloqueado até o parecer favorável do auditor independente.
- Shadow sintético: última medição 20/20 aprovada, porém janela horária está incompleta (`HOURLY_MEASUREMENT_GAP`); manter restrito e não promover.
- Docling processou os três PDFs em menos de cinco minutos, porém uniu/deslocou células em tabelas complexas (reconciliação mitigada pela Fase 6).

Decisions:
- Rafael decidiu que aprendizados de baixo risco podem ser promovidos automaticamente sem aprovação formal individual, desde que um Learning Engine versionado use confiança, frequência, recência, resultado, feedback explícito, risco, escopo e evidências.
- Revisão manual permanece para mudanças de AGENTS/System Prompt/política/contrato, fórmulas oficiais, autorização/acesso/retenção, efeitos externos, conflitos materiais e regras globais de alto impacto.
- Feedback explícito de Rafael recebe peso superior a inferências; Rafael pode consultar, corrigir e revogar qualquer aprendizado.
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

Last update: 2026-09-02 — reauditoria independente Codex do commit `2f9e876`

Resume instruction:
1. Ler integralmente `docs/audits/REAUDITORIA_CODEX_GATES_A0_N2_3_COMMIT_2F9E876.md`.
2. Executar os Blocos R0–R6 e responder aos 28 achados e às 25 perguntas obrigatórias.
3. Não avançar Gate N7 e não ativar WF-104 enquanto A0 e N2.3 permanecerem reabertos.
4. Fornecer novo commit, migrations incrementais, export/runtime n8n reconciliado, backup restaurável e E2E operacional para nova auditoria Codex.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- `docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
