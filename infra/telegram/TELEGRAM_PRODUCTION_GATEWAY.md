# GATEWAY OFICIAL DE PRODUÇÃO — TELEGRAM 360
## Especificação do Canal de Entrada Oficial em Produção Assistida

**Versão:** 2.0.0  
**Data:** 26 de agosto de 2026  
**Status:** HOMOLOGADO PARA PRODUÇÃO  
**Padrão de Segurança:** Zero-Trust, Criptografia Ponta a Ponta e Autenticação por Secret Token  

---

## 1. Arquitetura do Canal Telegram Oficial

O Bot Telegram oficial do Diretor 360 atua como porta de entrada multicanal para mensagens, arquivos e documentos de clientes PJ:

```
[ Usuário / Revisor ]
         │ (Mensagem / PDF / Planilha XLSX / Áudio)
         ▼
[ Telegram Cloud Servers ]
         │ HTTPS POST com header 'X-Telegram-Bot-Api-Secret-Token'
         ▼
[ Cloudflare Edge / Caddy Proxy (Porta 443 TLS) ]
         │ Roteamento seguro
         ▼
[ /api/ingest/telegram ]
         │ Validação de Token Secreto, Tipo MIME e Tamanho Máximo (< 20MB)
         ▼
[ D1 / PostgreSQL (Idempotência por update_id) ]
         │
         ▼
[ WF-00 / WF-01 no n8n (Triagem, Domínios Analíticos e Evidence Graph) ]
```

---

## 2. Protocolo de Segurança e Validação de Webhook

1. **Assinatura Secreta Obrigatória:** O endpoint `/api/ingest/telegram` exige o cabeçalho `X-Telegram-Bot-Api-Secret-Token`. Requisições sem o token ou com token divergente são rejeitadas com `401 Unauthorized` / `403 Forbidden` via comparação em tempo constante (`constantTimeEqual`) para proteção contra timing attacks.
2. **Tipos de Arquivo Homologados:**
   - Documentos de texto / notas: `text/plain`, `application/json`.
   - Extratos e Balanços: `application/pdf`.
   - Planilhas Financeiras: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (XLSX), `text/csv`.
   - Áudios e Instruções de Voz: Processados via pipeline de transcrição assíncrona.
3. **Idempotência Estrita por `update_id`:** O Telegram reenvia atualizações não confirmadas. O sistema 360 registra cada `update_id` de forma atômica; requisições repetidas retornam `DUPLICATE_IGNORED` sem reprocessamento ou consumo duplicado de tokens.

---

## 3. Comandos Oficiais de Ativação do Webhook

Para vincular o Bot Telegram oficial ao gateway de produção:

```bash
curl -F "url=https://api.visao360.local/api/ingest/telegram" \
     -F "secret_token=${TELEGRAM_WEBHOOK_SECRET}" \
     -F "allowed_updates=[\"message\"]" \
     https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook
```

---

**Homologado por:** Rafael (`fael@live.de`)  
**Status:** PRONTO PARA PRODUÇÃO ASSISTIDA

