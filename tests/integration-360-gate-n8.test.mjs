import assert from "node:assert/strict";
import { processConversationInput } from "../engines/orchestration/conversation-intent-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N8.4 (GATE N8 — INTEGRAÇÃO 360) ===");

// 1. Validar ativação simultânea dos 4 Gerentes Gerais
console.log("-> Teste 1: Orquestração Simultânea dos 4 Gerentes Gerais (Mesa Completa)");
const situacaoTexto = `SITUAÇÃO
Posição consolidada da carteira PJ Negócios na competência Agosto/2026 com base em 28/08/2026.
O desempenho atingiu 70,71 pontos em 78 possíveis (90,65% de atingimento) mais 10,00 pontos de aceleradores, totalizando 100,65% de atingimento final e 7 indicadores batidos de 22.
PONTUAÇÃO
* Atual: 70,71 pontos (atingidos) + 10,00 pontos (aceleradores) = 80,71 pontos totais ponderados
METAS CRÍTICAS E RISCOS
* Conquista Folha zerada (0/4)
* Boleto + PIX zerado (0/4)
* Vencidos até 59 dias em risco de mora`;

const res = processConversationInput({ text: situacaoTexto });

assert.equal(res.intent, "NEW_INPUT");
assert.equal(res.behavior_type, "OWNER_ANALYSIS");
assert.ok(res.consulted_domains.includes("performance"));
assert.ok(res.consulted_domains.includes("conta"));
assert.ok(res.consulted_domains.includes("relacionamento"));
assert.ok(res.consulted_domains.includes("financeiro"));

// 2. Conferir que cada domínio contribui sem misturar responsabilidades
console.log("-> Teste 2: Segregação de Funções e Conteúdo dos 4 Domínios");
assert.match(res.safe_response, /GG Performance/i);
assert.match(res.safe_response, /GG Conta/i);
assert.match(res.safe_response, /GG Relacionamento/i);
assert.match(res.safe_response, /GG Financeiro/i);

// Performance: Pontos e metas
assert.match(res.safe_response, /70,71 pts atingidos/i);
assert.match(res.safe_response, /7 de 22/i);

// Conta: Contas elegíveis
assert.match(res.safe_response, /Hospital São Lucas/i);
assert.match(res.safe_response, /Metalúrgica Forja Sul/i);

// Relacionamento: Decisores e abordagem consultiva
assert.match(res.safe_response, /Dr\. Arnaldo Silveira/i);
assert.match(res.safe_response, /Sr\. Cláudio Mendes/i);

// Financeiro: Projeção de receita estimada
assert.match(res.safe_response, /84\.000,00/i);
assert.match(res.safe_response, /22\.680,00/i);
assert.match(res.safe_response, /106\.680,00/i);

// Soberania do Dono
assert.match(res.safe_response, /autorização expressa de Rafael/i);

console.log("\nGATE N8 (INTEGRAÇÃO 360 DOS 4 GERENTES) HOMOLOGADO COM SUCESSO! 🟢");