import assert from "node:assert/strict";
import { executeAdvancedCommand } from "../engines/orchestration/telegram-commands-catalog.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.6 (COMANDOS AVANÇADOS) ===");

// 1. Comando /indicador sem argumentos -> Ajuda
console.log("-> Teste 1: /indicador sem argumentos");
const helpRes = await executeAdvancedCommand({ command: "/indicador" });
assert.match(helpRes, /Consulta de Indicadores do POBJ/i);
assert.match(helpRes, /\/indicador folha/i);

// 2. Comando /indicador folha (sem snapshot importado -> NOT_AVAILABLE seguro)
console.log("-> Teste 2: /indicador folha sem snapshot");
const folhaRes = await executeAdvancedCommand({ command: "/indicador", args: ["folha"] });
assert.match(folhaRes, /Dados não disponíveis para a competência atual/i);
assert.match(folhaRes, /aguardando envio do POBJ/i);

// 3. Comando /indicador cobranca
console.log("-> Teste 3: /indicador cobranca");
const cobRes = await executeAdvancedCommand({ command: "/indicador", args: ["cobranca"] });
assert.match(cobRes, /Dados não disponíveis para a competência atual/i);

// 4. Comandos de governança de diretrizes (/diretrizes, /aprovardiretriz, /revogardiretriz)
console.log("-> Teste 4: Governança de diretrizes");
const dirRes = await executeAdvancedCommand({ command: "/diretrizes" });
assert.match(dirRes, /Painel de Diretrizes e Aprendizado 360/i);
assert.match(dirRes, /\/aprovardiretriz/i);

const aprRes = await executeAdvancedCommand({ command: "/aprovardiretriz", args: ["9eb8e86a-0001"] });
assert.match(aprRes, /Diretriz Aprovada por Rafael/i);
assert.match(aprRes, /OWNER_EXPLICIT/i);

const revRes = await executeAdvancedCommand({ command: "/revogardiretriz", args: ["9eb8e86a-0001"] });
assert.match(revRes, /Diretriz Revogada por Rafael/i);
assert.match(revRes, /REVOKED/i);

// 5. Comandos /fontes e /evidencias
console.log("-> Teste 5: /fontes e /evidencias");
const fontesRes = await executeAdvancedCommand({ command: "/fontes" });
assert.match(fontesRes, /Registro de Fontes Autorizadas/i);
assert.match(fontesRes, /Relatório POBJ Oficial/i);

const evidRes = await executeAdvancedCommand({ command: "/evidencias" });
assert.match(evidRes, /Evidence Graph 360/i);
assert.match(evidRes, /SHA-256/i);

// 6. Novos Comandos: /briefing e /abordar
console.log("-> Teste 6: /briefing e /abordar");
const briefRes = await executeAdvancedCommand({ command: "/briefing" });
assert.match(briefRes, /Briefing Matinal 360/i);

const abordRes = await executeAdvancedCommand({ command: "/abordar", args: ["saolucas"] });
assert.match(abordRes, /Rascunho de Abordagem Comercial/i);
assert.match(abordRes, /Dr\. Arnaldo Silveira/i);

console.log("\nTODOS OS TESTES DO MARCO N2.2.6 (COMANDOS AVANÇADOS) PASSARAM COM SUCESSO! 🟢");