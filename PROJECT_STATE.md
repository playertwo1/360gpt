# PROJECT STATE

Version: 3.5.8-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: Validar o fluxo com mais 2 a 4 arquivos reais autorizados
Status: IN_PROGRESS

Last completed: Parecer do GG Performance ampliado e publicado no WF-13 v1.1.0 com visão geral, forças, riscos, cenários e ação recomendada
Next task: Enviar novo arquivo pelo Telegram e validar a utilidade do parecer detalhado no M5

Last validation: PASS — teste estrutural e runtime do WF-13; WF-11 e WF-13 ativos após publicação no n8n
Last commit: f07df66 (`docs(m4): close real Telegram response gate`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 17:45

Resume instruction:
Continue o ROADMAP no M5: envie novo arquivo e compare o parecer detalhado do WF-13 v1.1.0 com a leitura humana.
