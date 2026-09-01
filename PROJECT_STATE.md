# PROJECT STATE

Version: 3.6.2-mvp-conversacional
Current phase: MVP mínimo Telegram → Performance → Telegram
Current milestone: M5 — Piloto curto e correção de rota
Current task: M5.9 — recuperação da fila real e piloto curto com 3–5 arquivos
Status: IN_PROGRESS

Last completed: Auditoria e saneamento do lote Antigravity; comandos de progresso e recuperação corrigidos e 26 comandos registrados no Telegram
Next task: Publicar a versão 40, iniciar Docker/n8n, reclassificar os sete jobs órfãos e reprocessar um arquivo real controlado

Last validation: PASS parcial — teste conversacional, lint, build, varredura de segredos e registro Telegram 26/26; integração Docker/MinerU indisponível
Last commit: 3283cd4 (`fix(queue): recover exhausted processing leases`)

Blockers:
- Docker Desktop recusou inicialização automática em 2026-08-31; n8n, document-worker e MinerU estão indisponíveis até o runtime local voltar.
- Sete jobs reais permanecem órfãos em PROCESSING/terceira tentativa na versão hospedada 39; a correção e os comandos seguros ainda precisam ser publicados.
- Imagem MinerU ocupa aproximadamente 13 GB; usa cerca de 2,4 GB após pipeline e 5,8 GB após híbrido; concorrência e janela limitadas a 1.
- Imagem oficial herdada apresenta conflitos não bloqueantes de `pip check` entre o runtime VLLM e dependências fixadas pelo MinerU.

Pending decisions:
- Fornecer/confirmar as regras dedicadas oficiais de Seguros e Cartões; até lá, permanecem somente como valores reportados pela fonte.
- Efeitos externos continuam fora do escopo.

Last update: 2026-09-01 05:26

Resume instruction:
Publique a versão 3.6.2, confirme Docker/n8n saudável, use `/destravar` com confirmação e reprocese um único arquivo real antes de liberar os demais.
