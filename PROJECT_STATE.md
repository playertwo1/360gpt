# PROJECT STATE

Version: 3.5.4-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M3 — GG Performance e especialistas
Current task: Homologar regras específicas e cálculos do parecer produzido pelo WF-13
Status: IN_PROGRESS

Last completed: WF-13 criado, conectado ao WF-12 e validado sobre os 106 indicadores extraídos do PDF real
Next task: Conferir e homologar meta, realizado, piso, teto, pontos e direção dos indicadores prioritários antes de fechar M3

Last validation: PASS — 106 indicadores; AGOSTO/2026; base 28/08/2026; 100,65 pontos finais preservados; ranking exclui direção desconhecida e métricas de redução
Last commit: 973778e (`fix(n8n): validate live Telegram Performance routing`)

Blockers:
- O retorno útil ao Telegram ainda depende do fechamento das regras específicas de M3 e da entrega de M4.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 14:18

Resume instruction:
Continue o ROADMAP no M3 homologando as regras dos indicadores prioritários e validando os cálculos do WF-13 contra o PDF real.
