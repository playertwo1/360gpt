# Deploy Cloud — Marco 24

Este roteiro coloca o n8n e o PostgreSQL em uma VPS Ubuntu 24.04, protegidos por Caddy/HTTPS, e conecta o frontend publicado ao webhook oficial do Telegram. Credenciais reais ficam apenas nos ambientes de produção.

## 1. Preparar DNS e VPS

Crie um registro DNS, por exemplo `n8n.seudominio.com.br`, apontando para o IP público da VPS. Garanta que as portas 22, 80 e 443 estejam liberadas no provedor.

Na VPS Ubuntu 24.04:

```bash
curl -fsSL https://raw.githubusercontent.com/playertwo1/360/main/scripts/provision-vps-server.sh -o /tmp/provision-vps-server.sh
sudo bash /tmp/provision-vps-server.sh
```

Na primeira execução, o instalador cria `/opt/diretor-360/infra/cloud/.env.prod` e encerra antes de iniciar containers. Preencha o arquivo, confirme que o DNS já propagou e execute o comando novamente. O script configura UFW, instala Docker, valida o Compose e aguarda o healthcheck do n8n.

## 2. Publicar o frontend

Use a configuração de `infra/cloud/cloudflare-pages.yaml` como referência das variáveis e bindings. No ambiente hospedado, configure os segredos `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` e `TELEGRAM_ALLOWED_CHAT_IDS`; mantenha `TELEGRAM_INGEST_ENABLED=false` até terminar os testes.

## 3. Testar a implantação

```powershell
powershell -File scripts/test-cloud-deployment.ps1 `
  -Live `
  -FrontendBaseUrl https://app.seudominio.com.br `
  -N8nBaseUrl https://n8n.seudominio.com.br
```

## 4. Ativar o Telegram

Após validar a URL e habilitar a ingestão no frontend:

```powershell
$env:TELEGRAM_BOT_TOKEN = '<token-do-bot>'
$env:TELEGRAM_WEBHOOK_SECRET = '<segredo-aleatorio>'
powershell -File scripts/activate-telegram-webhook.ps1 `
  -WebhookUrl https://app.seudominio.com.br/api/ingest/telegram `
  -WhatIf
powershell -File scripts/activate-telegram-webhook.ps1 `
  -WebhookUrl https://app.seudominio.com.br/api/ingest/telegram
```

O segredo é enviado ao Telegram como `secret_token`; o gateway exige o mesmo valor no cabeçalho `X-Telegram-Bot-Api-Secret-Token`. Não salve o token ou o segredo no Git, em capturas de tela ou em logs.

## 5. Critérios de go-live

- DNS e HTTPS válidos.
- PostgreSQL, n8n e Caddy saudáveis.
- Teste remoto com `-Live` aprovado.
- Webhook confirmado pelo `getWebhookInfo`, sem erro recente.
- Texto, PDF e XLSX sintéticos processados com idempotência.
- Plano de rollback disponível e backup verificado.
