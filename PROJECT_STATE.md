# PROJECT STATE

Version: 3.5.4-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M3 — GG Performance e especialistas
Current task: Decidir ativação da regra geral POBJ e obter regras dedicadas de Seguros e Cartões
Status: IN_PROGRESS

Last completed: WF-13 criado, conectado ao WF-12 e validado sobre os 106 indicadores extraídos do PDF real
Next task: Rafael autoriza ou rejeita promover `POBJ_SCORING_2026_H2` ao runtime; cadastrar regras oficiais de Seguros e Cartões quando disponíveis

Last validation: PASS — Consórcio 4,67 e Open Finance 7,00 reproduzidos sem divergência em shadow; valores da fonte não sobrescritos
Last commit: b3f83a0 (`feat(performance): validate explicit POBJ rules in shadow`)

Blockers:
- O retorno útil ao Telegram ainda depende do fechamento das regras específicas de M3 e da entrega de M4.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Autorizar ou rejeitar a promoção da regra geral `POBJ_SCORING_2026_H2`, hoje `APPROVED_SOURCE_NOT_RUNTIME_ACTIVE`.
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 14:32

Resume instruction:
Após decisão de Rafael sobre a política geral, fechar os cálculos elegíveis de M3; em paralelo, o M4 pode formatar somente valores reportados e validações explícitas.
