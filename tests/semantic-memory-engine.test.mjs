import assert from "node:assert/strict";
import {
  RULE_SCOPES,
  RULE_STATUS,
  createSemanticRule,
  promoteSemanticRule,
  getActiveRules,
  applyMemoryDecay,
  buildContextPacket
} from "../engines/knowledge/semantic-memory-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.3.1 (MEMÓRIA SEMÂNTICA DESACOPLADA) ===");

// 1. Criação de regra com vigência
console.log("-> Teste 1: Criação de regra semântica com valid_to");
const cand1 = createSemanticRule({
  category: "PREFERENCIA_CLIENTE",
  scope: RULE_SCOPES.ACCOUNT,
  target_ref: "12.345.678/0001-90",
  learned_rule: "Contatar Renata Dias após às 15h via WhatsApp",
  valid_days: 90
});

assert.equal(cand1.scope, "ACCOUNT");
assert.equal(cand1.status, "CANDIDATE");
assert.ok(new Date(cand1.valid_to) > new Date());

const r1 = promoteSemanticRule(cand1, { approved_by: "RAFAEL", promotion_mode: "OWNER_EXPLICIT" });
assert.equal(r1.status, "PROMOTED");

// 2. Regra global
console.log("-> Teste 2: Regra de escopo GLOBAL");
const candGlobal = createSemanticRule({
  category: "ESTILO_RESPOSTA",
  scope: RULE_SCOPES.GLOBAL,
  target_ref: "GLOBAL",
  learned_rule: "Priorizar respostas no formato compacto de 3 bullets"
});
const rGlobal = promoteSemanticRule(candGlobal, { approved_by: "RAFAEL", promotion_mode: "OWNER_EXPLICIT" });
assert.equal(rGlobal.status, "PROMOTED");

// 3. Recuperação filtrada (Matching de Escopo)
console.log("-> Teste 3: Recuperação por escopo e exclusão de escopo cruzado");
const allRules = [r1, rGlobal];
const activeForja = getActiveRules({
  rules: allRules,
  scope: RULE_SCOPES.ACCOUNT,
  target_ref: "12.345.678/0001-90"
});

assert.equal(activeForja.length, 2); // Global + Forja Sul

const activeSaoLucas = getActiveRules({
  rules: allRules,
  scope: RULE_SCOPES.ACCOUNT,
  target_ref: "01.234.567/0001-89"
});
assert.equal(activeSaoLucas.length, 1); // Somente a Global (Forja Sul não vaza)

// 4. Teste de Decaimento de Memória (Memory Decay / TTL)
console.log("-> Teste 4: Decaimento de regra vencida (Memory Decay)");
const candExp = createSemanticRule({
  category: "SITUACAO_TEMPORARIA",
  scope: RULE_SCOPES.ACCOUNT,
  target_ref: "01.234.567/0001-89",
  learned_rule: "Diretor em férias nesta semana",
  valid_days: 7
});
const rExpirada = promoteSemanticRule(candExp, { approved_by: "RAFAEL", promotion_mode: "OWNER_EXPLICIT" });

// Simular data 10 dias no futuro
const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
const decayed = applyMemoryDecay([rExpirada], futureDate);
assert.equal(decayed[0].status, "EXPIRED");

const activeFuture = getActiveRules({
  rules: [rExpirada],
  scope: RULE_SCOPES.ACCOUNT,
  target_ref: "01.234.567/0001-89",
  referenceDate: futureDate
});
assert.equal(activeFuture.length, 0); // Descartada automaticamente

// 5. Injeção Dinâmica de Pacote de Contexto (Context Packet)
console.log("-> Teste 5: Montagem do Bloco de Contexto Dinâmico (sem alterar System Prompt)");
const packet = buildContextPacket({
  accountCnpj: "12.345.678/0001-90",
  activeRules: allRules
});

assert.match(packet, /DIRETRIZES DE NEGÓCIO DE REFERÊNCIA/i);
assert.match(packet, /Contatar Renata Dias/i);
assert.match(packet, /formato compacto de 3 bullets/i);

console.log("\nTODOS OS TESTES DO MARCO N2.3.1 PASSARAM COM SUCESSO! 🟢");