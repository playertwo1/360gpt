# PROJECT STATE

Version: 3.5.7-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: Validar o fluxo com mais 2 a 4 arquivos reais autorizados
Status: IN_PROGRESS

Last completed: Gate M4 aprovado tecnicamente em execução real com `telegram_reply_sent: true`
Next task: Comparar as próximas respostas com a leitura humana e registrar correções observadas

Last validation: PASS — execução 7774 concluiu OCR, WF-12, WF-13, persistência e retorno Telegram
Last commit: 7735884 (`docs: record sites version 37 deployment`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 17:31

Resume instruction:
Continue o ROADMAP no M5: processe mais 2 a 4 arquivos reais autorizados e compare extração, cálculos e utilidade da resposta com a leitura humana.
