# PROJECT STATE

Version: 3.6.2-mvp-conversacional
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — recuperação da fila real e piloto curto com 3–5 arquivos
Status: IN_PROGRESS

Last completed: Versão hospedada 40 publicada; 26 comandos registrados e `/progresso` validado no webhook real com HTTP 200/SUCCEEDED
Next task: Iniciar Docker/n8n, executar `/destravar` com confirmação e reprocessar um arquivo real controlado

Last validation: PASS parcial — teste conversacional, lint, build, varredura de segredos, menu 26/26, deploy v40 e webhook `/progresso`; integração Docker/MinerU indisponível
Last commit: 13d0acd (`fix(telegram): secure recovery and progress commands`)

Blockers:
- Docker Desktop recusou inicialização automática em 2026-08-31; n8n, document-worker e MinerU estão indisponíveis até o runtime local voltar.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa; a versão 40 pode recuperá-los, mas o Docker/n8n precisa estar operacional antes de executar `/destravar`.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 05:26

Resume instruction:
Confirme Docker/n8n saudável, use `/destravar` com confirmação e reprocese um único arquivo real antes de liberar os demais.
