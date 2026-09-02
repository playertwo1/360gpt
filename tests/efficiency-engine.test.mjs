import assert from "node:assert/strict";
import {
  trimContextForIndicator,
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
  clearCache,
  calculateFinOpsMetrics
} from "../engines/optimization/efficiency-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.9 (EFICIÊNCIA & FINOPS) ===");

// 1. Context Trimming (redução de tokens)
console.log("-> Teste 1: Context Trimming para perguntas pontuais");
const mockFullPobj = {
  agency_code: "6895",
  competence: "2026-08",
  indicators: [
    { name: "CONQUISTA_FOLHA_PAGAMENTO", weight: 4.0, attainment: 12.5 },
    { name: "FATURAMENTO_BOLETO_PIX", weight: 4.0, attainment: 3.1 },
    { name: "PRODUCAO_CREDITO_PJ", weight: 15.0, attainment: 180.8 },
    { name: "VENCIDOS_ATE_59_DIAS", weight: 10.0, attainment: 78.3 },
    { name: "OUTRO_INDICADOR_1", weight: 2.0, attainment: 100 },
    { name: "OUTRO_INDICADOR_2", weight: 2.0, attainment: 100 },
    { name: "OUTRO_INDICADOR_3", weight: 2.0, attainment: 100 },
    { name: "OUTRO_INDICADOR_4", weight: 2.0, attainment: 100 },
    { name: "OUTRO_INDICADOR_5", weight: 2.0, attainment: 100 },
    { name: "OUTRO_INDICADOR_6", weight: 2.0, attainment: 100 }
  ]
};

const trimmed = trimContextForIndicator({ fullPobjReport: mockFullPobj, indicatorName: "folha" });
assert.equal(trimmed.trimmed, true);
assert.equal(trimmed.retained_lines, 1);
assert.equal(trimmed.total_original_lines, 10);
assert.equal(trimmed.token_reduction_pct, 90.0);

// 2. Cache Determinístico com Hash
console.log("-> Teste 2: Cache local determinístico por SHA-256");
clearCache();
const key = generateCacheKey({ stateHash: "sha256:abcd1234", queryText: "Como está meu POBJ?" });
assert.equal(getCachedResponse(key), null);

setCachedResponse(key, "Resposta instantânea em cache", { source: "deterministic_cache" });
const cached = getCachedResponse(key);
assert.equal(cached.response, "Resposta instantânea em cache");

// 3. FinOps: Métricas de Custo e Latência
console.log("-> Teste 3: FinOps para chamada regular vs Cache Hit");
const regularMetrics = calculateFinOpsMetrics({ promptTokens: 1200, completionTokens: 300, isCacheHit: false });
assert.equal(regularMetrics.is_cache_hit, false);
assert.ok(regularMetrics.cost_usd > 0);
assert.equal(regularMetrics.total_tokens, 1500);

const cacheMetrics = calculateFinOpsMetrics({ isCacheHit: true });
assert.equal(cacheMetrics.is_cache_hit, true);
assert.equal(cacheMetrics.total_tokens, 0);
assert.equal(cacheMetrics.cost_usd, 0.0);
assert.equal(cacheMetrics.saving_pct, 100);

console.log("\nTODOS OS TESTES DO MARCO N2.2.9 (EFICIÊNCIA & FINOPS) PASSARAM COM SUCESSO! 🟢");