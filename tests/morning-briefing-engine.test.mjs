import assert from "node:assert/strict";
import { generateMorningBriefing } from "../engines/orchestration/morning-briefing-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO BRIEFING MATINAL PROATIVO ===");

const briefing = generateMorningBriefing({});

console.log("-> Teste 1: Estrutura executiva do Briefing Matinal");
assert.match(briefing, /Briefing Matinal 360/i);
assert.match(briefing, /Agência 6895 - VJ-SAO FIDELIS/i);
assert.match(briefing, /80,71 pts/i);
assert.match(briefing, /100,65%/i);

console.log("-> Teste 2: Prioridades e comandos de abordagem presentes");
assert.match(briefing, /Hospital & Maternidade São Lucas/i);
assert.match(briefing, /Metalúrgica Forja Sul/i);
assert.match(briefing, /\/abordar saolucas/i);
assert.match(briefing, /\/abordar forjasul/i);

console.log("\nTODOS OS TESTES DO BRIEFING MATINAL PROATIVO PASSARAM COM SUCESSO! 🟢");