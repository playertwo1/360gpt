# PROJECT STATE

Version: 3.6.1-mvp-conversacional
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — recuperação da fila real e piloto curto com 3–5 arquivos
Status: IN_PROGRESS

Last completed: Correção local do ciclo de lease/retry: terceira tentativa expirada termina em FAILED_FINAL e reabertura reinicia o orçamento de tentativas
Next task: Publicar a correção, iniciar Docker/n8n, reclassificar os sete jobs órfãos e reprocessar um arquivo real controlado

Last validation: PARTIAL — lint, build e teste conversacional PASS; bateria geral interrompida porque o Docker Desktop não iniciou
Last commit: f317575 (`docs(release): record conversational deployment v39`)

Blockers:
- Docker Desktop recusou inicialização automática em 2026-08-31; n8n, document-worker e MinerU estão indisponíveis até o runtime local voltar.
- Sete jobs reais estão órfãos em PROCESSING/terceira tentativa na versão hospedada 39; a versão 3.6.1 corrige a transição, mas ainda precisa ser publicada.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-08-31 20:21

Resume instruction:
Publique a correção 3.6.1, confirme Docker/n8n saudável, acione um claim para reclassificar leases expirados e use `/tentar novamente <protocolo>` em um único arquivo real antes de liberar os demais.
