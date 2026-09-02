import assert from "node:assert/strict";
import { runGoldenDatasetReplay } from "../scripts/run-golden-dataset-replay.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.11 & GATE N7 (GOLDEN DATASET) ===");

const report = await runGoldenDatasetReplay();

console.log(`-> Status do Replay: ${report.overall_status}`);
console.log(`-> Cenários: ${report.scenarios_passed}/${report.total_scenarios} aprovados em ${report.duration_ms}ms`);

assert.equal(report.overall_status, "PILOT_READY");
assert.equal(report.scenarios_passed, 10);
assert.equal(report.scenarios_failed, 0);

console.log("\nTODOS OS 10 CENÁRIOS DO GOLDEN DATASET PASSARAM COM 100% DE ÊXITO! 🟢");