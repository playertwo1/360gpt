# PROJECT STATE

Version: 3.5.5-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M4 — Resposta final no Telegram
Current task: Criar mensagem curta do parecer e entrega idempotente ao chat original
Status: IN_PROGRESS

Last completed: M3 fechado com política geral ativa e 15/15 validações elegíveis sem divergência
Next task: Implementar WF-14/etapa M4 para formatar e entregar a análise no Telegram

Last validation: PASS — regra geral 13/13 e regras explícitas 2/2; divergência zero; valores da fonte não sobrescritos
Last commit: c583cff (`feat(performance): activate authorized POBJ runtime policy`)

Blockers:
- O retorno útil ao Telegram ainda depende da entrega de M4.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 16:08

Resume instruction:
Continue o ROADMAP no M4 criando a resposta móvel a partir de `performance_analysis`, com envio idempotente ao chat original.
