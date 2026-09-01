# PROJECT STATE

Version: 3.7.0-mvp-conhecimento-supervisionado
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — completar testes de aceite do Telegram conversacional
Status: IN_PROGRESS

Last completed: Pré-condição operacional restaurada — MinerU 3.4.5 com GPU saudável, worker aprovado, WF-11 publicado e primeira execução agendada concluída com sucesso
Next task: executar os casos restantes do gate M5.9; depois executar reutilização e conflito do M5.10

Last validation: PASS — MinerU 3.4.5, GPU RTX 4060 Ti, PostgreSQL, n8n, worker, WF-11/WF-12/WF-13 e duas extrações controladas sem falha
Last commit: 35a69da (`feat: migrate local runtime to WSL Docker Engine`)

Blockers:
- Docker Desktop foi abandonado em favor do Docker Engine nativo no Ubuntu/WSL2 para reduzir RAM; não tentar reparar ou iniciar o Desktop.
- Ubuntu 26.04 foi movido para `G:\Docker\Ubuntu`; Engine, imagens e volumes novos ficam no VHDX dessa distribuição.
- Dump PostgreSQL restaurado com 129 tabelas n8n e 8 tabelas visao360; 13 workflows e 2 credenciais confirmados.
- WF-11, WF-12 e WF-13 estão publicados e ativos; o agendamento do WF-11 consulta a fila a cada minuto.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- MinerU está disponível no novo Engine com concorrência 1; ainda falta automatizar/liberar sua memória quando ocioso sem prejudicar a fila ativa.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 14:02

Resume instruction:
Continue o `ROADMAP.md` pelos edge cases do gate M5.9 e, depois, pelos ensaios de reutilização e conflito do M5.10.
