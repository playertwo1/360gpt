# PROJECT STATE

Version: 3.6.0-mvp-conversacional
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.8 — homologar conversa supervisionada em ensaio real controlado
Status: IN_PROGRESS

Last completed: M5.1–M5.7 implementados; bateria geral 32/32, build e lint aprovados
Next task: Processar um arquivo real com lacuna material, responder no Telegram e validar retomada do mesmo protocolo

Last validation: PASS — bateria geral 32/32; WF-11/WF-13; Telegram conversacional; build e lint
Last commit: 3bfe9c5 (`feat(telegram): add supervised conversational MVP`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 22:45

Resume instruction:
Continue o ROADMAP em M5.8: executar ensaio real controlado do ciclo arquivo → pergunta → resposta → parecer; não expandir para outros Gerentes.
