# PROJECT STATE

Version: 3.7.0-mvp-conhecimento-supervisionado
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — completar testes de aceite do Telegram conversacional
Status: IN_PROGRESS

Last completed: Persistência, API, site, comandos Telegram e contrato n8n do conhecimento POBJ implementados e publicados na versão hospedada 41; valores mensais excluídos da reutilização
Next task: confirmar a pré-condição OCR/worker/WF-11 e executar os casos restantes do gate M5.9; depois executar reutilização e conflito do M5.10

Last validation: PASS — Docker Engine 29.1.3 no Ubuntu/WSL2, GPU RTX 4060 Ti, PostgreSQL, n8n e document-worker saudáveis; 13 workflows e 2 credenciais restaurados
Last commit: 35a69da (`feat: migrate local runtime to WSL Docker Engine`)

Blockers:
- Docker Desktop foi abandonado em favor do Docker Engine nativo no Ubuntu/WSL2 para reduzir RAM; não tentar reparar ou iniciar o Desktop.
- Ubuntu 26.04 foi movido para `G:\Docker\Ubuntu`; Engine, imagens e volumes novos ficam no VHDX dessa distribuição.
- Dump PostgreSQL restaurado com 129 tabelas n8n e 8 tabelas visao360; 13 workflows e 2 credenciais confirmados.
- WF-12 e WF-13 estão publicados; WF-11 permanece deliberadamente inativo até MinerU e worker estarem integralmente saudáveis.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- A disponibilidade final do MinerU no novo Engine precisa ser confirmada antes do próximo ensaio real; o serviço deverá operar sob demanda, concorrência 1, sem ficar residente quando ocioso.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 13:31

Resume instruction:
Continue o `ROADMAP.md` pelo gate M5.9. Antes do ensaio real, confirme OCR/worker e WF-11; depois cubra os casos de aceite restantes e avance aos ensaios de reutilização e conflito do M5.10.
