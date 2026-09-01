# PROJECT STATE

Version: 3.7.0-mvp-conhecimento-supervisionado
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.11 — estabilizar runtime Docker em G: antes do ensaio M5.10
Status: IN_PROGRESS

Last completed: Persistência, API, site, comandos Telegram e contrato n8n do conhecimento POBJ implementados e publicados na versão hospedada 41; valores mensais excluídos da reutilização
Next task: Aguardar o build do MinerU, validar sua saúde e só então publicar WF-11 e testar o pipeline Telegram completo

Last validation: PARTIAL PASS — n8n, PostgreSQL e document-worker saudáveis; 13 workflows e 2 credenciais restaurados; MinerU ainda em build
Last commit: eb3665e (`docs: checkpoint Docker storage migration`)

Blockers:
- Migração do Docker para `G:\Docker` concluída e Engine operacional; build pesado do MinerU ainda estava ativo no último checkpoint.
- Volume operacional foi recriado vazio com o novo VHDX. Os 13 workflows e as 2 credenciais locais já foram reconstruídos; não há histórico anterior de execuções nesse banco novo.
- WF-12 e WF-13 estão publicados; WF-11 permanece deliberadamente inativo até MinerU e worker estarem integralmente saudáveis.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 07:37

Resume instruction:
Continue `ROADMAP.md` em M5.11: confirme o término do build único e a existência da imagem `diretor360/mineru:3.4.5`; valide MinerU e sua integração com o worker, publique WF-11 e execute o fluxo Telegram ponta a ponta; somente depois retome os ensaios M5.10.
