# PROJECT STATE

Version: 3.7.0-mvp-conhecimento-supervisionado
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.11 — estabilizar runtime Docker em G: antes do ensaio M5.10
Status: IN_PROGRESS

Last completed: Persistência, API, site, comandos Telegram e contrato n8n do conhecimento POBJ implementados e publicados na versão hospedada 41; valores mensais excluídos da reutilização
Next task: Aguardar o build OCR em curso, recuperar a saúde do n8n sem recriar volumes e validar o pipeline Docker completo

Last validation: PARTIAL — Docker em G: e PostgreSQL saudáveis; n8n ainda unhealthy e build do OCR em andamento
Last commit: 072bc65 (`feat(pobj): add owner-approved reusable knowledge`)

Blockers:
- Migração do Docker para `G:\Docker` concluída e Engine operacional; o build de `document-worker`/MinerU ainda estava ativo no último checkpoint.
- n8n está em execução, mas `unhealthy`: o processo Node ficou bloqueado em I/O durante o build e a porta interna 5678 ainda recusava conexão. Diagnosticar após o build e reiniciar somente o serviço n8n se necessário.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 07:22

Resume instruction:
Continue `ROADMAP.md` em M5.11: confirme o término do build único, estabilize n8n preservando `visao-360_n8n_data`, valide PostgreSQL/worker/MinerU e o fluxo Telegram ponta a ponta; somente depois retome os dois ensaios de M5.10.
