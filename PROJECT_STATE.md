# PROJECT STATE

Version: 3.6.0-mvp-conversacional
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — piloto curto com 3–5 arquivos reais
Status: IN_PROGRESS

Last completed: M5.8 — ensaio real arquivo → pergunta → resposta → parecer aceito por Rafael
Next task: Processar 3–5 arquivos reais autorizados e comparar extração, cálculos e análise com a leitura humana

Last validation: PASS — bateria geral 32/32; ensaio real M5.8 aceito; acompanhamento `/protocolo`; build e lint
Last commit: 3bfe9c5 (`feat(telegram): add supervised conversational MVP`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 23:20

Resume instruction:
Continue o ROADMAP em M5.9: processar 3–5 arquivos reais, registrar divergências e corrigir somente problemas observados; não expandir para outros Gerentes.
