import assert from "node:assert/strict";
import {
  SECTORS,
  OBJECTIVES,
  findBestGoldenExemplar,
  formatFewShotExemplarBlock
} from "../engines/knowledge/golden-exemplars-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.3.2 (EXEMPLARES DOURADOS DINÂMICOS) ===");

// 1. Match exato para Hospitalar + Folha
console.log("-> Teste 1: Match exato para Hospitalar + Folha");
const ex1 = findBestGoldenExemplar({
  sector: SECTORS.HOSPITALAR,
  objective: OBJECTIVES.FOLHA_PAGAMENTO,
  channel: "WHATSAPP"
});
assert.equal(ex1.client_name, "Hospital & Maternidade São Lucas S/A");
assert.equal(ex1.rating, 5);
assert.match(ex1.approved_text, /Dr\. Arnaldo/);

// 2. Match exato para Metalúrgica + Cobrança
console.log("-> Teste 2: Match exato para Metalmecânica + Cobrança");
const ex2 = findBestGoldenExemplar({
  sector: SECTORS.METALMECANICA,
  objective: OBJECTIVES.COBRANCA_PIX,
  channel: "WHATSAPP"
});
assert.equal(ex2.client_name, "Metalúrgica Forja Sul Ltda");
assert.match(ex2.approved_text, /Sr\. Cláudio/);

// 3. Fallback inteligente quando setor não mapeado
console.log("-> Teste 3: Fallback por objetivo quando setor é genérico");
const exFallback = findBestGoldenExemplar({
  sector: "COMERCIO_VAREJO",
  objective: OBJECTIVES.COBRANCA_PIX,
  channel: "WHATSAPP"
});
assert.equal(exFallback.objective, OBJECTIVES.COBRANCA_PIX);

// 4. Formatação de bloco Dynamic Few-Shot
console.log("-> Teste 4: Formatação de bloco Dynamic Few-Shot");
const block = formatFewShotExemplarBlock(ex1);
assert.match(block, /EXEMPLO DOURADO DE REFERÊNCIA/i);
assert.match(block, /Imite a objetividade/i);
assert.match(block, /Dr\. Arnaldo/i);

console.log("\nTODOS OS TESTES DO MARCO N2.3.2 PASSARAM COM SUCESSO! 🟢");