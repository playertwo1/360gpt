import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import { classifyIntent, processConversationInput } from "../engines/orchestration/conversation-intent-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.1 (CONVERSA TELEGRAM) ===");

const schema = JSON.parse(fs.readFileSync("contracts/telegram-intent.schema.json", "utf8"));
assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");

const schemaForAjv = { ...schema };
delete schemaForAjv.$schema;

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaForAjv);

// 1. Caso 1: Pergunta simples
console.log("-> Teste 1: Pergunta simples");
const qText = "Como está meu POBJ?";
assert.equal(classifyIntent(qText), "QUESTION");
const qRes = processConversationInput({ text: qText });
assert.ok(validate(qRes.telegram_intent), JSON.stringify(validate.errors));
assert.equal(qRes.intent, "QUESTION");
assert.equal(qRes.behavior_type, "QUESTION");
assert.match(qRes.safe_response, /Posição Consolidada POBJ/i);
assert.match(qRes.safe_response, /80,71 pts totais/i);
assert.match(qRes.safe_response, /Conquista Folha PJ/i);

// 2. Caso 2: Fato simples
console.log("-> Teste 2: Fato simples");
const fText = "Abri 2 contas hoje.";
assert.equal(classifyIntent(fText), "OWNER_FACT");
const fRes = processConversationInput({ text: fText });
assert.ok(validate(fRes.telegram_intent), JSON.stringify(validate.errors));
assert.equal(fRes.intent, "NEW_INPUT");
assert.equal(fRes.behavior_type, "OWNER_FACT");
assert.equal(fRes.extracted_facts[0].indicator, "CRESCIMENTO_LIQUIDO_PJ");
assert.equal(fRes.extracted_facts[0].value, 2);
assert.equal(fRes.extracted_facts[0].provenance, "OWNER_PROVIDED");
assert.match(fRes.safe_response, /Abertura de \+2 conta\(s\) PJ/i);

// 3. Caso 3: Fato + Pergunta
console.log("-> Teste 3: Fato + Pergunta");
const qfText = "Liberei R$ 30 mil de rotativo hoje. Com isso consigo bater essa linha?";
assert.equal(classifyIntent(qfText), "QUESTION_AND_FACT");
const qfRes = processConversationInput({ text: qfText });
assert.ok(validate(qfRes.telegram_intent), JSON.stringify(validate.errors));
assert.equal(qfRes.intent, "NEW_INPUT");
assert.equal(qfRes.behavior_type, "QUESTION_AND_FACT");
assert.equal(qfRes.extracted_facts[0].indicator, "CREDITO_ROTATIVO");
assert.equal(qfRes.extracted_facts[0].value, 30000);
assert.match(qfRes.safe_response, /180,8% de atingimento/i);
assert.match(qfRes.safe_response, /não adiciona novos pontos/i);

// 4. Caso 4: Correção simples
console.log("-> Teste 4: Correção simples");
const cText = "O realizado correto é 51,04.";
assert.equal(classifyIntent(cText), "OWNER_CORRECTION");
const cRes = processConversationInput({ text: cText });
assert.ok(validate(cRes.telegram_intent), JSON.stringify(validate.errors));
assert.equal(cRes.intent, "NEW_INPUT");
assert.equal(cRes.behavior_type, "OWNER_CORRECTION");
assert.equal(cRes.extracted_facts[0].relation, "SUPERSEDES");
assert.equal(cRes.extracted_facts[0].value, 51.04);
assert.match(cRes.safe_response, /Correção Registrada com Sucesso/i);

// 5. Caso 5: Parecer longo estruturado de 28/08
console.log("-> Teste 5: Parecer longo estruturado");
const longText = `SITUAÇÃO
Posição consolidada da carteira PJ Negócios na competência Agosto/2026 com base em 28/08/2026.
O desempenho atingiu 70,71 pontos em 78 possíveis (90,65% de atingimento) mais 10,00 pontos de aceleradores, totalizando 100,65% de atingimento final e 7 indicadores batidos de 22.
PONTUAÇÃO
* Atual: 70,71 pontos (atingidos) + 10,00 pontos (aceleradores) = 80,71 pontos totais ponderados
* Máxima operacional: 78,00 pontos normativos + teto de aceleradores
METAS CRÍTICAS E RISCOS
* Conquista Folha zerada (0/4)
* Boleto + PIX zerado (0/4)
* Vencidos até 59 dias em risco de mora`;

assert.equal(classifyIntent(longText), "OWNER_ANALYSIS");
const lRes = processConversationInput({ text: longText });
assert.ok(validate(lRes.telegram_intent), JSON.stringify(validate.errors));
assert.equal(lRes.intent, "NEW_INPUT");
assert.equal(lRes.behavior_type, "OWNER_ANALYSIS");
assert.match(lRes.safe_response, /Parecer Executivo 360/i);
assert.match(lRes.safe_response, /Hospital São Lucas/i);
assert.match(lRes.safe_response, /Metalúrgica Forja Sul/i);

console.log("\nTODOS OS 5 COMPORTAMENTOS DO MARCO N2.1 PASSARAM COM SUCESSO! 🟢");