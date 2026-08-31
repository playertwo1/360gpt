# PROJECT STATE

Version: 3.5.6-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M4 — Resposta final no Telegram
Current task: Executar ensaio ponta a ponta do M4 com novo arquivo Telegram
Status: IN_PROGRESS

Last completed: M4 implementado: snapshot com hash, parecer executivo e payload idempotente conectados à ponte
Next task: Rafael enviar novo PDF/arquivo pelo Telegram e executar WF-11 para confirmar resposta no mesmo chat

Last validation: PASS — WF-11/WF-13 estruturais, política 13/13 + explícitas 2/2, payload de conclusão e hash validados
Last commit: c583cff (`feat(performance): activate authorized POBJ runtime policy`)

Blockers:
- O retorno útil ao Telegram depende do ensaio real; nenhum arquivo novo foi processado após a conexão do payload M4.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 16:42

Resume instruction:
Continue o ROADMAP no ensaio M4: Rafael envia um novo arquivo pelo Telegram; execute o WF-11 e verifique `telegram_reply_sent: true`.
