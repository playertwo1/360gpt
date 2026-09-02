import assert from "node:assert/strict";
import {
  DIVERGENCE_TYPES,
  detectDivergence,
  resolveDivergence,
  formatDivergenceTelegram
} from "../engines/reconciliation/reconciliation-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.7 (RECONCILIAÇÃO CIRÚRGICA) ===");

// 1. Detecção de divergência de dados
console.log("-> Teste 1: Detecção de divergência de dados na mesma competência");
const div1 = detectDivergence({
  entityName: "Hospital & Maternidade São Lucas S/A",
  fieldName: "numero_vidas_folha",
  sideA: { source: "DECLARADO_PELO_CLIENTE", value: 280, period: "2026-08" },
  sideB: { source: "CADASTRO_INICIAL", value: 180, period: "2026-08" }
});

assert.equal(div1.has_divergence, true);
assert.equal(div1.type, DIVERGENCE_TYPES.DIVERGENCIA_DE_DADOS);
assert.equal(div1.status, "MANUAL_REVIEW_REQUIRED");

// 2. Detecção de divergência temporal
console.log("-> Teste 2: Detecção de divergência temporal (datas-base diferentes)");
const div2 = detectDivergence({
  entityName: "Metalúrgica Forja Sul Ltda",
  fieldName: "faturamento_anual",
  sideA: { source: "BALANCO_ANTERIOR", value: 3800000, period: "2025-12" },
  sideB: { source: "PROJECAO_ATUAL", value: 4200000, period: "2026-08" }
});

assert.equal(div2.has_divergence, true);
assert.equal(div2.type, DIVERGENCE_TYPES.DIVERGENCIA_TEMPORAL);

// 3. Resolução da divergência por Rafael com vínculo SUPERSEDES
console.log("-> Teste 3: Resolução soberana por Rafael");
const resolved = resolveDivergence({
  divergence: div1,
  chosenSide: "A",
  resolvedBy: "RAFAEL",
  rationale: "Confirmado número atualizado de 280 vidas com o Dr. Arnaldo"
});

assert.equal(resolved.status, "RESOLVED");
assert.equal(resolved.effective_value, 280);
assert.equal(resolved.resolved_by, "RAFAEL");
assert.match(resolved.supersedes_link, /^SUPERSEDES:div-/);
assert.deepEqual(resolved.recalculation_scope, ["numero_vidas_folha", "Hospital & Maternidade São Lucas S/A"]);

// 4. Formatação no Telegram
console.log("-> Teste 4: Formatação executiva do Telegram");
const msg = formatDivergenceTelegram(div1);
assert.match(msg, /Divergência Identificada/i);
assert.match(msg, /\/resolver/i);
assert.match(msg, /Hospital & Maternidade São Lucas/i);

console.log("\nTODOS OS TESTES DO MARCO N2.2.7 (RECONCILIAÇÃO CIRÚRGICA) PASSARAM COM SUCESSO! 🟢");