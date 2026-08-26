# Runbook do piloto privado no Telegram

## Estado de prontidão

O fluxo local está pronto para receber texto, PDF, XLS/XLSX, CSV e JSON sintéticos. A rota hospedável `/api/ingest/telegram` permanece bloqueada por padrão com `TELEGRAM_INGEST_ENABLED=false`.

## Informações que Rafael deverá fornecer

1. Token de um bot exclusivo de teste, criado no BotFather.
2. ID do chat privado que ficará na allowlist.
3. Confirmação da URL HTTPS que será usada no piloto.
4. Autorização explícita para habilitar o recebimento.
5. Escolha sobre o envio de confirmação: manter `TELEGRAM_SEND_ACK_ENABLED=false` ou autorizar somente a mensagem de protocolo.

Os valores secretos nunca devem ser enviados para o Git, arquivos de documentação ou mensagens de teste.

## Variáveis hospedadas

| Variável | Valor inicial |
|---|---|
| `TELEGRAM_BOT_TOKEN` | segredo do bot de teste |
| `TELEGRAM_WEBHOOK_SECRET` | segredo aleatório compatível com o Telegram |
| `TELEGRAM_ALLOWED_CHAT_IDS` | ID fechado do chat privado |
| `TELEGRAM_INGEST_ENABLED` | `false` durante configuração; `true` apenas no início do teste |
| `TELEGRAM_SEND_ACK_ENABLED` | `false` por padrão |

## Ordem de ativação

1. Confirmar que o site está privado e acessível apenas ao proprietário.
2. Aplicar a migração D1 mais recente.
3. Cadastrar as variáveis hospedadas mantendo o kill switch desligado.
4. Testar que a rota retorna `ingest_disabled`.
5. Validar o script sem efeitos: `./scripts/configure-telegram-webhook.ps1 -WebhookUrl "https://DOMINIO/api/ingest/telegram"`.
6. Habilitar `TELEGRAM_INGEST_ENABLED=true`.
7. Cadastrar o webhook executando o mesmo script com `-Apply`.
8. Enviar primeiro uma mensagem sintética; depois um PDF e uma planilha sintéticos.
9. Conferir idempotência, hash, auditoria e Dashboard.
10. Ao terminar, voltar `TELEGRAM_INGEST_ENABLED=false`.

## Critérios de aprovação

- segredo incorreto retorna `401`;
- chat fora da allowlist retorna `403`;
- grupo ou canal retorna `403`;
- arquivo fora da allowlist é rejeitado antes do download;
- arquivo acima de 20 MB é rejeitado;
- o mesmo `update_id` não cria novo documento ou nova execução;
- arquivos são marcados como `UNTRUSTED` e recebem SHA-256;
- a confirmação externa fica desligada sem autorização específica;
- o kill switch interrompe novas entradas;
- nenhum dado real de cliente é usado.

## Reversão

1. Definir `TELEGRAM_INGEST_ENABLED=false`.
2. Remover o webhook usando `setWebhook` com URL vazia.
3. Revogar o token no BotFather se houver suspeita de exposição.
4. Preservar auditoria e evidências do incidente.
5. Só reativar após nova validação de segredo, allowlist e integridade.
