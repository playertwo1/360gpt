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
| `TELEGRAM_RATE_LIMIT_PER_MINUTE` | `10` durante o piloto |
| `BRIDGE_SHARED_SECRET` | segredo exclusivo compartilhado com a credencial local do WF-09 |
| `BRIDGE_ENABLED` | `false` durante configuração; ativação separada do Telegram |
| `DASHBOARD_ALLOWED_EMAILS` | lista privada das contas autorizadas no Dashboard |

## Fronteira pública e superfície privada

O projeto usa uma única aplicação HTTPS com separação de autorização por rota:

- `/api/ingest/telegram` aceita chamadas externas sem login do ChatGPT, mas exige kill switch ativo, segredo do webhook e chat privado na allowlist;
- `/` exige login do ChatGPT e e-mail presente em `DASHBOARD_ALLOWED_EMAILS`;
- `/api/state/latest` exige o mesmo login e a mesma allowlist do Dashboard;
- nenhuma outra rota recebe autorização por ser chamada pelo Telegram.

A ponte usa `/api/bridge/claim`, `/api/bridge/file`, `/api/bridge/complete` e `/api/bridge/fail`. Todas exigem `BRIDGE_ENABLED=true` e autenticação Bearer com segredo exclusivo. O WF-09 reserva um trabalho por dez minutos, processa no n8n local e publica o snapshot imutável no D1. O Dashboard lê somente esse read model hospedado.

Manter a aplicação em acesso público no provedor não torna o Dashboard público: a autorização do Dashboard é aplicada novamente no servidor. Ausência da allowlist deve falhar fechada.

## Ordem de ativação

1. Confirmar que o Dashboard redireciona visitante anônimo para o login e bloqueia conta fora de `DASHBOARD_ALLOWED_EMAILS`.
2. Aplicar a migração D1 mais recente.
3. Cadastrar as variáveis hospedadas mantendo o kill switch desligado.
4. Confirmar que `/api/state/latest` rejeita visitante sem login e que `/api/ingest/telegram` retorna `ingest_disabled`.
5. Validar o script sem efeitos: `./scripts/configure-telegram-webhook.ps1 -WebhookUrl "https://DOMINIO/api/ingest/telegram"`.
6. Habilitar `BRIDGE_ENABLED=true`, publicar o WF-09 e confirmar uma consulta de fila vazia.
7. Habilitar `TELEGRAM_INGEST_ENABLED=true`.
8. Cadastrar o webhook executando o mesmo script com `-Apply`.
9. Enviar primeiro uma mensagem sintética; depois um PDF e uma planilha sintéticos.
10. Conferir idempotência, hash canônico, auditoria e Dashboard.
11. Ao terminar, voltar `TELEGRAM_INGEST_ENABLED=false`, despublicar o WF-09 e voltar `BRIDGE_ENABLED=false`.

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
2. Despublicar o WF-09 e definir `BRIDGE_ENABLED=false`.
3. Remover o webhook usando `setWebhook` com URL vazia.
4. Revogar o token no BotFather se houver suspeita de exposição.
5. Preservar auditoria e evidências do incidente.
6. Só reativar após nova validação de segredo, allowlist e integridade.
