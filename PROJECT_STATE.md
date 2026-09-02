# PROJECT STATE

Version: 6.0.0-gate-n2.3-flywheel-approved
Current phase: Piloto Operacional Ativo + Marco N2.3 Homologado (Flywheel de Aprendizado Contínuo em Contexto e Memória Desacoplada no PostgreSQL)
Current milestone: Gate N2.3 Aprovado (Memória Semântica, Exemplares Dourados Dinâmicos, Decision Utility Engine e WF-104 Ativo no Docker)
Current task: Operação diária do piloto de 7 dias com Briefing Matinal Proativo (WF-102), abordagem executiva e flywheel de aprendizagem.
Status: READY

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: 
1. Marco N2.3 (Flywheel de Aprendizado Contínuo): Fases N2.3.1 a N2.3.5 concluídas e Gate N2.3 homologado com DUR de 90.0%.
2. Camada de Memória Semântica (`promoted_knowledge`), Exemplares Dourados (`golden_exemplars`), Matriz de Desfecho (`decision_outcomes`), WF-104 no n8n Docker e Memória Negativa (`negative_memory`).
3. Marco A0 (Cutover Canônico): 0 exceções legadas e `CANONICAL_LOCAL_ACTIVE` validado.
4. Ativação do Briefing Matinal Proativo (`WF-102`) e Motor de Abordagem Comercial (`outreach-draft-engine.mjs`).
Next task: Operação em campo e conclusão do piloto de 7 dias com documentos reais (Gate N7).

MVP text scope: cinco casos aprovados — pergunta simples, fato simples, fato+pergunta, correção simples e texto longo estruturado. Totalmente integrados aos 4 Gerentes Gerais, motores de simulação, reconciliação, context trimming e segurança DLP.

Post-MVP scope: N2.2 documenta memória em camadas, aprendizagem supervisionada, simulações, roteamento multidomínio, linguagem contextual, comandos ampliados, reconciliação, experiência, eficiência, segurança e observabilidade. 100% CONCLUÍDO E HOMOLOGADO.

Last validation: 2026-09-02 20:10 — Bateria completa de 21 suítes aprovada com 100% PASS (`test:local-core` exibindo CANONICAL_LOCAL_ACTIVE, `test:p0`, build limpo).
Last implementation checkpoint: 362dc59 feat(pilot): activate proactive morning briefing WF-102 and outreach draft engine

Blockers:
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

Last update: 2026-09-02 16:37

Resume instruction:
1. Continuar `ROADMAP.md` 4.6 no Marco N2.1 e implementar os cinco casos simples dentro do WF-101.
2. Preservar alterações preexistentes em `test-data/` e `backup/` fora do commit P0.
3. Manter polling desligado; avançar WF-97/WF-101/WF-102 sem trocar o webhook.
4. Após o Gate A0, retomar N2 sem alterar o gate objetivo do Docling.

Evidence:
- `docs/audits/DOCLING_MIGRATION_2026-09-01.md`
- `docs/arquitetura-agentes-360/ADR-002-N8N-NUCLEO-LOCAL.md`
- Backup anterior: `C:\Users\fael\Desktop\backup-diretor360-pre-docling-20260901-141052.bundle`
