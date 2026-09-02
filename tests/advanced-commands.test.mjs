import assert from "node:assert/strict";
import { executeAdvancedCommand } from "../engines/orchestration/telegram-commands-catalog.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.6 (COMANDOS AVANÇADOS) ===");

// 1. Comando /indicador sem argumentos -> Ajuda
console.log("-> Teste 1: /indicador sem argumentos");
const helpRes = await executeAdvancedCommand({ command: "/indicador" });
assert.match(helpRes, /Consulta de Indicadores do POBJ/i);
assert.match(helpRes, /\/indicador folha/i);

// 2. Comando /indicador folha
console.log("-> Teste 2: /indicador folha");
const folhaRes = await executeAdvancedCommand({ command: "/indicador", args: ["folha"] });
assert.match(folhaRes, /Conquista Folha PJ/i);
assert.match(folhaRes, /ESTEIRA ZERADA/i);
assert.match(folhaRes, /Hospital & Maternidade São Lucas/i);
assert.match(folhaRes, /Dr\. Arnaldo Silveira/i);

// 3. Comando /indicador cobranca
console.log("-> Teste 3: /indicador cobranca");
const cobRes = await executeAdvancedCommand({ command: "/indicador", args: ["cobranca"] });
assert.match(cobRes, /Faturamento Boleto \+ PIX/i);
assert.match(cobRes, /Metalúrgica Forja Sul/i);

// 4. Comando /indicador credito
console.log("-> Teste 4: /indicador credito");
const credRes = await executeAdvancedCommand({ command: "/indicador", args: ["credito"] });
assert.match(credRes, /Produção de Crédito PJ/i);
assert.match(credRes, /TETO MÁXIMO ATINGIDO/i);

// 5. Comandos /fontes e /evidencias
console.log("-> Teste 5: /fontes e /evidencias");
const fontesRes = await executeAdvancedCommand({ command: "/fontes" });
assert.match(fontesRes, /Registro de Fontes Autorizadas/i);
assert.match(fontesRes, /POBJ2608\.pdf/i);

const evidRes = await executeAdvancedCommand({ command: "/evidencias" });
assert.match(evidRes, /Evidence Graph 360/i);
assert.match(evidRes, /SOURCE_ARTIFACT/i);

// 6. Novos Comandos: /briefing e /abordar
console.log("-> Teste 6: /briefing e /abordar");
const briefRes = await executeAdvancedCommand({ command: "/briefing" });
assert.match(briefRes, /Briefing Matinal 360/i);

const abordRes = await executeAdvancedCommand({ command: "/abordar", args: ["saolucas"] });
assert.match(abordRes, /Rascunho de Abordagem Comercial/i);
assert.match(abordRes, /Dr\. Arnaldo Silveira/i);

console.log("\nTODOS OS TESTES DO MARCO N2.2.6 (COMANDOS AVANÇADOS) PASSARAM COM SUCESSO! 🟢");