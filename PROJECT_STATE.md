# PROJECT STATE

Version: 3.7.0-mvp-conhecimento-supervisionado
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.10 — ensaio real de reutilização do conhecimento POBJ homologado
Status: IN_PROGRESS

Last completed: Persistência, API, site, comandos Telegram e contrato n8n do conhecimento POBJ implementados e publicados na versão hospedada 41; valores mensais excluídos da reutilização
Next task: Homologar seletivamente um indicador no site, enviar novo arquivo do mesmo layout e comprovar a aplicação registrada

Last validation: PASS — lint, build e teste estrutural dedicado; ensaio real permanece dependente do Docker/MinerU
Last commit: 072bc65 (`feat(pobj): add owner-approved reusable knowledge`)

Blockers:
- Docker Desktop/WSL foi reiniciado em 2026-09-01, mas o pipe `dockerDesktopLinuxEngine` não foi criado; n8n, document-worker e MinerU permanecem indisponíveis até o Docker concluir a inicialização pela interface.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 06:30

Resume instruction:
Após o Docker mostrar “Engine running”, homologue um mapeamento pelo site, reprocesse um arquivo do mesmo layout e valide a reutilização e o cenário de conflito do M5.10.
