# Guia — Túnel Cloudflare Nomeado (Item 7)
## Restabelecimento do Webhook Telegram → WF-100

**Estado atual:** `cloudflared` no compose usa `tunnel run --token` (token de One-Click via Dashboard),
o que é permanente — mas exige que o DNS route e o webhook estejam configurados.
Este guia confirma os passos necessários que **só você (Rafael) pode executar.**

---

## Por que não usar `--url` (quick tunnel)

O quick tunnel gera uma URL aleatória a cada reinício. O webhook do Telegram exige URL fixa.
Use o **Ingress configurado no Dashboard** ou um túnel nomeado via CLI. O compose já usa
`tunnel run --token`, que é a forma correta — basta garantir que o token tenha rota DNS configurada.

---

## Pré-requisitos

- Conta Cloudflare com domínio gerenciado (ex: `seudominio.com`)
- Docker em execução: `docker ps | grep cloudflared` deve mostrar `visao-360-cloudflared-1`
- Acesso ao terminal WSL2 Ubuntu

---

## Opção A — Token via Dashboard (mais simples, já configurado no compose)

### 1. Verificar se o container está rodando

```bash
# No WSL2
docker ps --filter name=cloudflared
docker logs visao-360-cloudflared-1 --tail 20
```

Se estiver conectado, verá algo como:
```
INF Connected to Cloudflare edge
```

Se não estiver no ar, ative o profile `tunnel`:
```bash
docker compose -f compose.n8n.yaml --profile tunnel up -d cloudflared
```

### 2. Configurar DNS Route no Dashboard

No [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com):
1. **Access → Tunnels** → clique no seu túnel
2. **Public Hostname → Add a public hostname**
   - Subdomain: `n8n`
   - Domain: `seudominio.com` → resulta em `n8n.seudominio.com`
   - Service: `HTTP` → `n8n:5678`
3. Salvar

### 3. Atualizar N8N_WEBHOOK_URL no compose

No arquivo `compose.n8n.yaml`, linha 47, altere:
```yaml
N8N_WEBHOOK_URL: http://localhost:5678
```
para:
```yaml
N8N_WEBHOOK_URL: https://n8n.seudominio.com
```

Reinicie o n8n:
```bash
docker compose -f compose.n8n.yaml restart n8n
```

---

## Opção B — Túnel nomeado via CLI (controle total, sem Dashboard)

### 1. Login e criação do túnel (execute no WSL2)

```bash
cloudflared tunnel login
# Abre o browser para autenticar — siga o link

cloudflared tunnel create diretor360-n8n
# Gera ~/.cloudflared/<TUNNEL_ID>.json e exibe o TUNNEL_ID
```

### 2. Configurar DNS

```bash
cloudflared tunnel route dns diretor360-n8n n8n.seudominio.com
```

### 3. Criar o config.yml

```bash
# Descubra o TUNNEL_ID
cloudflared tunnel list

# Crie o arquivo de configuração
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <TUNNEL_ID-aqui>
credentials-file: /root/.cloudflared/<TUNNEL_ID-aqui>.json

ingress:
  - hostname: n8n.seudominio.com
    service: http://n8n:5678
  - service: http_status:404
EOF
```

### 4. Gerar o token para o compose

```bash
cloudflared tunnel token diretor360-n8n
# Copie o token gerado
```

Adicione ao `.env.n8n`:
```bash
CLOUDFLARE_TUNNEL_TOKEN=<token-aqui>
```

### 5. Subir com o profile tunnel

```bash
docker compose -f compose.n8n.yaml --profile tunnel up -d cloudflared
docker logs visao-360-cloudflared-1 --tail 30
```

---

## Configurar o Webhook do Telegram

Após o túnel estar ativo e DNS propagado (pode levar 1-2 min):

```bash
# Substitua <SEU_TOKEN> e a URL pelo seu domínio
WEBHOOK_URL="https://n8n.seudominio.com/webhook/director-360/telegram/inbound"
WEBHOOK_SECRET="<BRIDGE_SHARED_SECRET>"  # mesma do .env.n8n

curl "https://api.telegram.org/bot<SEU_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\", \"secret_token\": \"${WEBHOOK_SECRET}\", \"allowed_updates\": [\"message\", \"callback_query\"]}"

# Verificar
curl "https://api.telegram.org/bot<SEU_TOKEN>/getWebhookInfo"
```

Esperado: `"url": "https://n8n.seudominio.com/webhook/..."` e `"pending_update_count": 0`.

---

## Verificação end-to-end

```bash
# 1. Telegram enviou algo?
docker logs visao-360-n8n-1 --tail 50 | grep -E "webhook|WF-100|inbound"

# 2. WF-100 executou?
docker exec -i visao-360-postgres-1 psql -U visao360_app -d visao360 \
  -c "SELECT id, status, created_at FROM channel_inbound_events ORDER BY created_at DESC LIMIT 3;"

# 3. Tunnel health
docker logs visao-360-cloudflared-1 --tail 20
```

---

## Nota sobre `TELEGRAM_POLLING_ENABLED`

O polling (`TELEGRAM_POLLING_ENABLED=true`) e o webhook Cloudflare são **mutuamente exclusivos**.
Deixe `TELEGRAM_POLLING_ENABLED=false` (padrão) quando o webhook estiver ativo.
O serviço `telegram-poller` usa o profile `telegram-local` — não ative esse profile junto com o webhook.
