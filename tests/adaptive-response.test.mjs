import assert from "node:assert/strict";
import {
  UX_BADGES,
  RESPONSE_MODES,
  parseUserModePreference,
  formatAdaptiveResponse
} from "../engines/ux/adaptive-response-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.8 (UX & MODO ADAPTATIVO) ===");

// 1. Detecção de preferência de modo
console.log("-> Teste 1: Detecção de comandos de modo");
assert.equal(parseUserModePreference("/modo compacto"), RESPONSE_MODES.COMPACTO);
assert.equal(parseUserModePreference("/modo detalhado"), RESPONSE_MODES.DETALHADO);
assert.equal(parseUserModePreference("/modo executivo"), RESPONSE_MODES.EXECUTIVO);
assert.equal(parseUserModePreference("outro texto"), null);

// 2. Renderização no Modo Compacto
console.log("-> Teste 2: Renderização no Modo Compacto (máx 3-4 bullets com badges)");
const compact = formatAdaptiveResponse({ mode: RESPONSE_MODES.COMPACTO });
assert.match(compact, /Modo Compacto/i);
assert.match(compact, /🏛️ \[OFICIAL: POBJ-PDF\]/i);
assert.match(compact, /🔢 \[CÁLCULO DETERMINÍSTICO\]/i);
assert.match(compact, /80,71 pts/i);

// 3. Renderização no Modo Detalhado
console.log("-> Teste 3: Renderização no Modo Detalhado (abertura de CNPJs e sócios)");
const detailed = formatAdaptiveResponse({ mode: RESPONSE_MODES.DETALHADO });
assert.match(detailed, /Relatório Analítico Detalhado/i);
assert.match(detailed, /01\.234\.567\/0001-89/i);
assert.match(detailed, /Dr\. Arnaldo Silveira/i);
assert.match(detailed, /Sr\. Cláudio Mendes/i);

// 4. Renderização no Modo Executivo Padrão
console.log("-> Teste 4: Renderização no Modo Executivo Padrão");
const exec = formatAdaptiveResponse({ mode: RESPONSE_MODES.EXECUTIVO });
assert.match(exec, /Posição Executiva 360/i);
assert.match(exec, /Gaps Críticos na Mesa/i);
assert.match(exec, /106\.680,00/i);

console.log("\nTODOS OS TESTES DO MARCO N2.2.8 (UX & MODO ADAPTATIVO) PASSARAM COM SUCESSO! 🟢");