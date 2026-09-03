# PROJECT STATE

Version: 6.3.0-gates-a0-n2.3-remediation-v3
Current phase: Terceira remediação concluída — Pronta para homologação independente do Codex
Current milestone: Blocos T0 a T7 executados integralmente; 28 achados da auditoria 2e34b9ad solucionados com testes 100% PASS
Current task: Submeter commit com o dossiê formal de resposta para validação do ChatGPT Codex.
Status: READY_FOR_CODEX_FINAL_APPROVAL

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed:
1. Execução integral dos Blocos T0 a T7 conforme GUIA_ANTIGRAVITY_TERCEIRA_REMEDIACAO_A0_N2_3.md.
2. Contenção durável (T0): WF-11, WF-97, WF-98, WF-102 e WF-104 desativados (active=false, activeVersionId=null) no n8n; reinício a frio do n8n; zero execuções periódicas espúrias; dumps duráveis T0 gerados com SHA-256.
3. Gate A0 Canônico (T1, T2, T3): script test-n8n-canonical-architecture.mjs reforçado e aprovado; gateway Telegram purificado (sem loopback 127.0.0.1); WF-101 atualizado com recovery de leases expirados e tratamento completo de documentos e comandos.
4. Governança e Migrations (T4, T5): migration 09 purificada (CREATE IF NOT EXISTS); migration 11 com trigger statement-level anti-TRUNCATE, CANDIDATE em golden exemplars, status SUSPENDED e role visao360_app restrita a privilégios mínimos.
5. Learning Engine e Reflexion (T6): allowlist positiva restrita, fail-closed em termos sensíveis, isolamento estrito por tenant_id, DUR padronizado, WF-104 com UUID determinístico derivado de SHA-256.
6. Validação Completa (T7): 100% dos testes do repositório aprovados (35/35 suítes, zero falhas); integração real no PostgreSQL aprovada com a role visao360_app; documentação canônica sincronizada.
Next task: Submeter o commit ao ChatGPT Codex para emissão do parecer formal de aprovação dos Gates A0 e N2.3.

MVP text scope: cinco casos aprovados — pergunta simples, fato simples, fato+pergunta, correção simples e texto longo estruturado. Totalmente integrados aos 4 Gerentes Gerais, motores de simulação, reconciliação, context trimming e segurança DLP.

Post-MVP scope: N2.2 documenta memória em camadas, aprendizagem supervisionada, simulações, roteamento multidomínio, linguagem contextual, comandos ampliados, reconciliação, experiência, eficiência, segurança e observabilidade. 100% CONCLUÍDO E HOMOLOGADO.

Last validation: PASS_ON_REAL_RUNTIME — 100% dos testes unitários e de integração aprovados (35/35 PASS, total failures: 0).
Last implementation checkpoint: HEAD (Terceira remediação concluída)

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
