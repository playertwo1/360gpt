# PROJECT STATE

Version: 3.5.2-mvp-performance
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M2 — Orquestrador mínimo no n8n
Current task: Fazer um job real do Telegram chegar como handoff estruturado ao GG Performance
Status: IN_PROGRESS

Last completed: roadmap do MVP mínimo congelado e leitor MinerU otimizado com pipeline econômico, escalada híbrida e janela 1
Next task: Executar WF-11 com job real, validar extração e criar o roteamento mínimo exclusivo para Performance

Last validation: PASS — roteamento MinerU, OCR/fallback, reinício de memória, Docker Compose, lint e build; PDF simples em 2,4 GB e POBJ híbrido com quatro marcadores críticos
Last commit: beab99b (`feat(ocr): integrate MinerU as internal document parser`)

Blockers:
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 07:20

Resume instruction:
Continue `docs/ROADMAP_N8N_MVP_REAL.md` em M2; entregue primeiro Telegram → OCR → Orquestrador → GG Performance → Telegram e não expanda para outros Gerentes antes do Gate M4.
