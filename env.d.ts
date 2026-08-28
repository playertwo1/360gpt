declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    DB: D1Database;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_WEBHOOK_SECRET?: string;
    TELEGRAM_ALLOWED_CHAT_IDS?: string;
    TELEGRAM_INGEST_ENABLED?: string;
    TELEGRAM_SEND_ACK_ENABLED?: string;
    VISAO360_N8N_URL?: string;
    SHADOW_TELEMETRY_SECRET?: string;
  }
}
