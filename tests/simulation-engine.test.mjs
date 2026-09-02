import assert from "node:assert/strict";
import {
  detectConditionalIntent,
  simulateScenario,
  formatSimulationTelegramResponse
} from "../engines/simulation/simulation-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.3 (SIMULAÇÕES WHAT-IF) ===");

// 1. Detecção de intenção condicional
console.log("-> Teste 1: Reconhecimento de linguagem condicional");
assert.equal(detectConditionalIntent("E se eu fechar a folha do hospital?"), true);
assert.equal(detectConditionalIntent("Caso eu libere R$ 50 mil, bato a meta?"), true);
assert.equal(detectConditionalIntent("Supondo que a mora suba 2%"), true);
assert.equal(detectConditionalIntent("Quanto ficaria se entrar mais uma conta?"), true);
assert.equal(detectConditionalIntent("Como está meu POBJ?"), false);
assert.equal(detectConditionalIntent("Abri 2 contas hoje"), false);

// 2. Cálculo do cenário simulado em sandbox
console.log("-> Teste 2: Cálculo em sandbox sem contaminação do estado");
const sim = simulateScenario({
  baseSnapshot: {
    current_points: 70.71,
    accelerator_points: 10.0,
    total_points: 80.71,
    attainment_pct: 100.65,
    max_operational_points: 78.0
  },
  hypothesis: {
    action_type: "CAPTURE_PAYROLL",
    target_name: "Hospital São Lucas",
    potential_points: 4.0,
    annual_revenue: 84000.0,
    description: "Portabilidade de Folha (280 vidas)"
  }
});

assert.equal(sim.is_simulation, true);
assert.equal(sim.state_polluted, false);
assert.equal(sim.delta.points_gain, 4.0);
assert.equal(sim.simulated_scenario.current_points, 74.71);
assert.equal(sim.simulated_scenario.total_points, 84.71);
assert.equal(sim.simulated_scenario.incremental_annual_revenue, 84000.0);
assert.equal(sim.status, "SIMULATED_NOT_COMMITTED");

// 3. Formatação no Telegram
console.log("-> Teste 3: Formatação executiva de simulação");
const response = formatSimulationTelegramResponse(sim);
assert.match(response, /Simulação de Cenário/i);
assert.match(response, /Preservado sem alteração/i);
assert.match(response, /\+4,00 pts na mesa/i);
assert.match(response, /84\.000,00/i);

console.log("\nTODOS OS TESTES DO MARCO N2.2.3 (SIMULAÇÕES WHAT-IF) PASSARAM COM SUCESSO! 🟢");