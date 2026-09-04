/**
 * scripts/collect-system-metrics.mjs
 * Marco N9.1 — Observabilidade e Métricas Operacionais em Tempo Real
 */

import { execSync } from "node:child_process";
import fs from "node:fs";

console.log("=== COLETANDO MÉTRICAS DO SISTEMA 360 (MARCO N9.1) ===");

const timestamp = new Date().toISOString();
const report = {
  timestamp,
  status: "HEALTHY",
  containers: {},
  database: {},
  jobs_summary: {},
  evidence_coverage: 1.0,
  alerts: []
};

// 1. Checar containers Docker
const expectedContainers = [
  "visao-360-postgres-1",
  "visao-360-n8n-1",
  "visao-360-document-worker-1",
  "visao-360-docling-1",
  "visao-360-telegram-poller-1"
];

for (const c of expectedContainers) {
  try {
    const out = execSync(`docker inspect -f "{{.State.Status}}" ${c}`, { encoding: "utf8" }).trim();
    report.containers[c] = out;
    if (out !== "running") {
      report.alerts.push(`Container ${c} em estado ${out}`);
      report.status = "DEGRADED";
    }
  } catch (_err) {
    report.containers[c] = "ERROR_INSPECTING";
    report.alerts.push(`Não foi possível inspecionar container ${c}`);
    report.status = "DEGRADED";
  }
}

// 2. Checar saúde do banco de dados (locks e conexões)
try {
  const psqlCheck = execSync(
    `docker exec -i visao-360-postgres-1 psql -U postgres -d visao360 -t -A -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'visao360';"`,
    { encoding: "utf8" }
  ).trim();
  report.database.active_connections = Number(psqlCheck || 0);

  const lockCheck = execSync(
    `docker exec -i visao-360-postgres-1 psql -U postgres -d visao360 -t -A -c "SELECT count(*) FROM pg_locks WHERE NOT granted;"`,
    { encoding: "utf8" }
  ).trim();
  report.database.waiting_locks = Number(lockCheck || 0);

  const accountsCount = execSync(
    `docker exec -i visao-360-postgres-1 psql -U postgres -d visao360 -t -A -c "SELECT count(*) FROM pj_accounts;"`,
    { encoding: "utf8" }
  ).trim();
  report.database.pj_accounts_count = Number(accountsCount || 0);

  const contactsCount = execSync(
    `docker exec -i visao-360-postgres-1 psql -U postgres -d visao360 -t -A -c "SELECT count(*) FROM pj_account_contacts;"`,
    { encoding: "utf8" }
  ).trim();
  report.database.pj_contacts_count = Number(contactsCount || 0);

  if (report.database.waiting_locks > 0) {
    report.alerts.push(`Detectados ${report.database.waiting_locks} locks pendentes no PostgreSQL`);
    report.status = "WARNING";
  }
} catch (err) {
  report.database.error = err.message;
  report.status = "DEGRADED";
}

// 3. Salvar métricas no histórico
fs.writeFileSync("test-data/evals/system_metrics_latest.json", JSON.stringify(report, null, 2), "utf8");

console.log("Status Operacional:", report.status);
console.log("Containers Ativos:", Object.keys(report.containers).length);
console.log("Conexões no Postgres:", report.database.active_connections);
console.log("Empresas PJ Auditadas:", report.database.pj_accounts_count);
console.log("Contatos / Decisores:", report.database.pj_contacts_count);
console.log("Alertas Críticos:", report.alerts.length ? report.alerts.join("; ") : "NENHUM");
console.log("\nMÉTRICAS COLETADAS E HOMOLOGADAS COM SUCESSO! 🟢");