/**
 * scripts/run-golden-dataset-replay.mjs
 * Marco N2.2.11 & Gate N7 — Bateria Golden Dataset de Replay (10 Cenários Canônicos)
 */

import fs from "node:fs";
import path from "node:path";
import { processConversationInput } from "../engines/orchestration/conversation-intent-engine.mjs";
import { simulateScenario, formatSimulationTelegramResponse } from "../engines/simulation/simulation-engine.mjs";
import { resolveContextualReference } from "../engines/orchestration/contextual-reference-engine.mjs";
import { executeAdvancedCommand } from "../engines/orchestration/telegram-commands-catalog.mjs";
import { detectDivergence, resolveDivergence } from "../engines/reconciliation/reconciliation-engine.mjs";
import { formatAdaptiveResponse, RESPONSE_MODES } from "../engines/ux/adaptive-response-engine.mjs";

export const GOLDEN_SCENARIOS = [
  {
    id: "SCENARIO-01",
    name: "Consulta geral da situação do POBJ",
    input: "Qual a situação e pontuação do meu POBJ?",
    expectedChecks: ["80,71 pts", "100,65%", "Conquista Folha"]
  },
  {
    id: "SCENARIO-02",
    name: "Drill-down específico de Folha de Pagamento",
    input: "/indicador folha",
    expectedChecks: ["0,00 de 4,00 pts", "Hospital & Maternidade São Lucas", "Dr. Arnaldo"]
  },
  {
    id: "SCENARIO-03",
    name: "Drill-down específico de Cobrança e Boleto/PIX",
    input: "/indicador cobranca",
    expectedChecks: ["Metalúrgica Forja Sul", "R$ 420 mil", "Sr. Cláudio Mendes"]
  },
  {
    id: "SCENARIO-04",
    name: "Alerta de Crédito PJ no teto de 150%",
    input: "Liberei R$ 50 mil de giro no rotativo, bato a meta?",
    expectedChecks: ["180,8%", "150%", "não adiciona novos pontos"]
  },
  {
    id: "SCENARIO-05",
    name: "Detecção e blindagem de risco de Vencidos Até 59 dias",
    input: "/indicador vencidos",
    expectedChecks: ["78.3%", "9,34 pontos", "alerta de mora"]
  },
  {
    id: "SCENARIO-06",
    name: "Registro de abertura de novas contas PJ",
    input: "Abri 2 contas PJ hoje na agência",
    expectedChecks: ["OWNER_PROVIDED", "+2", "Crescimento Líquido PJ"]
  },
  {
    id: "SCENARIO-07",
    name: "Simulação condicional What-If em sandbox",
    input: "E se eu fechar a folha do hospital?",
    expectedChecks: ["Simulação de Cenário", "Sandbox Isolado", "+4,00 pts na mesa"]
  },
  {
    id: "SCENARIO-08",
    name: "Resolução contextual de anáfora ('dessa empresa')",
    input: "Qual o telefone dessa empresa?",
    history: [{ text: "Estudamos a proposta de folha do Hospital São Lucas" }],
    expectedChecks: ["Hospital & Maternidade São Lucas"]
  },
  {
    id: "SCENARIO-09",
    name: "Reconciliação cirúrgica de divergência em 1 toque",
    input: "Reconciliação 280 vidas vs 180 vidas",
    expectedChecks: ["SUPERSEDES", "RESOLVED"]
  },
  {
    id: "SCENARIO-10",
    name: "Formatação adaptativa no modo compacto com badges",
    input: "/modo compacto",
    expectedChecks: ["[OFICIAL: POBJ-PDF]", "[CÁLCULO DETERMINÍSTICO]", "80,71 pts"]
  }
];

export async function runGoldenDatasetReplay() {
  const startTime = Date.now();
  const results = [];

  for (const sc of GOLDEN_SCENARIOS) {
    let outputText = "";
    let passed = false;

    if (sc.id === "SCENARIO-01" || sc.id === "SCENARIO-04" || sc.id === "SCENARIO-06") {
      const res = processConversationInput({ text: sc.input });
      outputText = res.safe_response || "";
    } else if (sc.id === "SCENARIO-02" || sc.id === "SCENARIO-03" || sc.id === "SCENARIO-05") {
      const parts = sc.input.split(" ");
      outputText = (await executeAdvancedCommand({ command: parts[0], args: [parts[1]] })) || "";
    } else if (sc.id === "SCENARIO-07") {
      const sim = simulateScenario({
        baseSnapshot: { current_points: 70.71, accelerator_points: 10.0, total_points: 80.71, attainment_pct: 100.65, max_operational_points: 78.0 },
        hypothesis: { potential_points: 4.0, annual_revenue: 84000.0, description: "Portabilidade de Folha (Hospital São Lucas)" }
      });
      outputText = formatSimulationTelegramResponse(sim);
    } else if (sc.id === "SCENARIO-08") {
      const ctx = resolveContextualReference({ currentText: sc.input, conversationHistory: sc.history || [] });
      outputText = ctx.enriched_text || "";
    } else if (sc.id === "SCENARIO-09") {
      const div = detectDivergence({
        entityName: "Hospital São Lucas",
        fieldName: "vidas_folha",
        sideA: { source: "CLIENTE", value: 280, period: "2026-08" },
        sideB: { source: "CADASTRO", value: 180, period: "2026-08" }
      });
      const resolved = resolveDivergence({ divergence: div, chosenSide: "A" });
      outputText = `${resolved.status} com vínculo ${resolved.supersedes_link}`;
    } else if (sc.id === "SCENARIO-10") {
      outputText = formatAdaptiveResponse({ mode: RESPONSE_MODES.COMPACTO });
    }

    const matchedAll = sc.expectedChecks.every(check => outputText.includes(check));
    passed = matchedAll;

    results.push({
      scenario_id: sc.id,
      name: sc.name,
      passed,
      checked_terms: sc.expectedChecks
    });
  }

  const allPassed = results.every(r => r.passed);
  const totalDuration = Date.now() - startTime;

  const report = {
    report_title: "Golden Dataset Replay — Agência 6895 (VJ-SAO FIDELIS)",
    execution_timestamp: new Date().toISOString(),
    overall_status: allPassed ? "PILOT_READY" : "FAILED",
    total_scenarios: results.length,
    scenarios_passed: results.filter(r => r.passed).length,
    scenarios_failed: results.filter(r => !r.passed).length,
    duration_ms: totalDuration,
    results
  };

  const outDir = path.resolve("test-data/evals");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "golden_dataset_replay_latest.json"), JSON.stringify(report, null, 2), "utf8");

  return report;
}

if (process.argv[1]?.includes("run-golden-dataset-replay.mjs")) {
  runGoldenDatasetReplay().then(rep => {
    console.log(`\n=== RELATÓRIO DO GOLDEN DATASET: ${rep.overall_status} ===`);
    console.log(`Cenários executados: ${rep.total_scenarios} | Aprovados: ${rep.scenarios_passed}/${rep.total_scenarios}`);
    console.log(`Duração: ${rep.duration_ms}ms`);
  });
}