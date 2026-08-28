declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_WEBHOOK_SECRET?: string;
    TELEGRAM_ALLOWED_CHAT_IDS?: string;
    DASHBOARD_ALLOWED_EMAILS?: string;
    REVIEWER_ALLOWED_EMAILS?: string;
    TELEGRAM_INGEST_ENABLED?: string;
    TELEGRAM_SEND_ACK_ENABLED?: string;
    TELEGRAM_RATE_LIMIT_PER_MINUTE?: string;
    BRIDGE_ENABLED?: string;
    BRIDGE_SHARED_SECRET?: string;
    SHADOW_TELEMETRY_SECRET?: string;
  }
}
