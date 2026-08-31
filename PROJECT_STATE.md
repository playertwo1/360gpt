# PROJECT STATE

Version: 3.5.3-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M3 — GG Performance e especialistas
Current task: Criar WF-13 para analisar o handoff JSON validado do WF-12
Status: IN_PROGRESS

Last completed: PDF real do Telegram atravessou OCR MinerU e WF-12, foi roteado exclusivamente ao GG Performance e teve Estado mínimo persistido
Next task: Implementar WF-13 Performance com análise verificável, sem receber PDF bruto

Last validation: PASS — PDF real processado em 3 páginas; 9 sinais de POBJ; confiança alta; roteamento exclusivo ao GG Performance; zero efeitos externos
Last commit: 91bd7f0 (`feat(n8n): route OCR output to Performance director`)

Blockers:
- O retorno útil ao Telegram ainda depende da análise especializada de M3 e da entrega de M4.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 13:48

Resume instruction:
Continue o ROADMAP no M3 criando o WF-13 Performance sobre o JSON validado; não envie PDF bruto aos agentes.
