# PROJECT STATE

Version: 3.7.0-mvp-conhecimento-supervisionado
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.11 — estabilizar runtime Docker em G: antes do ensaio M5.10
Status: IN_PROGRESS

Last completed: Persistência, API, site, comandos Telegram e contrato n8n do conhecimento POBJ implementados e publicados na versão hospedada 41; valores mensais excluídos da reutilização
Next task: Reiniciar o Windows para liberar o reparse point do Docker; depois validar a ligação C: → G: antes de iniciar os contêineres

Last validation: BLOCKED — Docker Desktop não inicia porque o reparse point local do VHDX em G: ficou desconectado após o WSL shutdown
Last commit: eb3665e (`docs: checkpoint Docker storage migration`)

Blockers:
- HARD BLOCKER: `C:\Users\fael\AppData\Local\Docker\wsl` resolve para um ponto de montagem desconectado. Docker Desktop falha ao consultar o VHDX, e Windows recusou a correção inclusive elevada; reiniciar o Windows é necessário e depende de autorização de Rafael.
- Migração do Docker para `G:\Docker` concluída e Engine operacional; build pesado do MinerU ainda estava ativo no último checkpoint.
- Volume operacional foi recriado vazio com o novo VHDX. Os 13 workflows e as 2 credenciais locais já foram reconstruídos; não há histórico anterior de execuções nesse banco novo.
- WF-12 e WF-13 estão publicados; WF-11 permanece deliberadamente inativo até MinerU e worker estarem integralmente saudáveis.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 11:46

Resume instruction:
Reinicie o Windows. Depois confirme que `C:\Users\fael\AppData\Local\Docker\wsl\disk\docker_data.vhdx` resolve para o arquivo preservado em `G:\Docker\wsl\disk`; abra Docker Desktop e continue `ROADMAP.md` no bloco de reinicialização do M5.11.
