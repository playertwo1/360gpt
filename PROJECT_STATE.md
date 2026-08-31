# PROJECT STATE

Version: 3.6.0-mvp-conversacional
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — piloto curto com 3–5 arquivos reais
Status: IN_PROGRESS

Last completed: Versão hospedada 39 e WF-11/WF-13 conversacionais publicados; endpoint autenticado de pendências validado
Next task: Processar 3–5 arquivos reais autorizados e comparar extração, cálculos e análise com a leitura humana

Last validation: PASS — build; deploy v39; n8n saudável; WF-11/WF-13 contêm `AWAITING_OWNER_INPUT`; endpoint de pendências autenticado
Last commit: fa0a529 (`fix(hosting): preserve append-only evidence history`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 23:35

Resume instruction:
Continue o ROADMAP em M5.9: processar 3–5 arquivos reais, registrar divergências e corrigir somente problemas observados; não expandir para outros Gerentes.
