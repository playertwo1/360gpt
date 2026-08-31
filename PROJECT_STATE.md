# PROJECT STATE

Version: 3.5.2-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M2 — Orquestrador mínimo no n8n
Current task: Aguardar novo arquivo POBJ no Telegram e executar o WF-11
Status: BLOCKED_BY_INPUT

Last completed: WF-12 criado, testado, importado e conectado ao WF-11 para rotear extração POBJ exclusivamente ao GG Performance
Next task: Rafael envia um arquivo POBJ pelo Telegram; executar imediatamente o WF-11 e inspecionar o handoff produzido

Last validation: PASS — WF-11 e WF-12 estruturais; importação n8n; execução manual concluída com fila vazia (`empty: true`)
Last commit: 8733369 (`feat(mvp): focus Telegram Performance flow and reduce OCR memory`)

Blockers:
- Fila da ponte vazia; é necessário Rafael enviar um novo arquivo pelo bot do Telegram para concluir o gate real M1/M2.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 13:08

Resume instruction:
Após Rafael enviar um POBJ pelo Telegram, execute o WF-11 manualmente, valide a extração MinerU e confirme que o WF-12 produziu somente `GERENTE_GERAL_PERFORMANCE`.
