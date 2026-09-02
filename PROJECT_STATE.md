# PROJECT STATE

Version: 4.0.0-gate-n8-and-n9-completed
Current phase: Pós-Gate N8, N9 e N2.2.1 — Mesa dos 4 Gerentes Ativa, Operação Assistida e Memória em Camadas
Current milestone: Marcos N8.3, N8.4 (Gate N8), N9.1, N9.2, N9.3 e N2.2.1 Concluídos com Êxito
Current task: Sistema 360 operando em produção local com os 4 Gerentes Gerais (Performance, Conta, Relacionamento e Financeiro), observabilidade contínua, backup automatizado e memória em 4 camadas.
Status: READY

Host baseline:
- AMD Ryzen 5 5600X (6C/12T), 16 GB RAM, RTX 4060 Ti, Windows 11 23H2.
- WSL limitado a 6 GB via `.wslconfig`, preservando mais de 10 GB para o Windows.
- Docker Engine nativo no WSL2 Ubuntu 24.04, sem Docker Desktop.
- Lazydocker 0.25.2 pelo atalho `lazydocker.bat` na Área de Trabalho.
- Base persistente: `visao-360-postgres-1`, `visao-360-n8n-1`, `visao-360-document-worker-1`, `visao-360-docling-1` e `visao-360-telegram-poller-1`.
- Espaço informado: G: 763 GB livres; C: 233 GB livres; mais de 451 GB recuperados.

Last completed: Conclusão integral dos 6 passos canônicos do Roadmap: N8.3 (GG Financeiro WF-40 ativo no n8n), N8.4 (Gate N8 — Mesa Completa dos 4 Gerentes Gerais), N9.1 (Observabilidade e Métricas reportadas com status HEALTHY), N9.2 (Hardening de Segurança e Prompt Guard), N9.3 (Backup verificável com SHA-256 e atalho BAT) e N2.2.1 (Memória Operacional em 4 Camadas).
Next task: Operação assistida e expansão de novos relatórios.

MVP text scope: cinco casos aprovados — pergunta simples, fato simples, fato+pergunta, correção simples e texto longo estruturado. Totalmente integrados aos 4 Gerentes Gerais.

Post-MVP scope: N2.2 documenta memória em camadas, aprendizagem supervisionada, simulações, roteamento multidomínio, linguagem contextual, comandos ampliados, reconciliação, experiência, eficiência, segurança e observabilidade.

Last validation: 2026-09-02 18:10 — Bateria completa aprovada com 100% PASS (financial-engine, integration-360-gate-n8, relationship-engine, conversation-intent, security-killswitches, layered-memory, conta-engine, conta-contracts, test:p0, test:local-core e build).
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
