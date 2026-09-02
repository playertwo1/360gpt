import assert from "node:assert/strict";
import {
  MEMORY_LAYERS,
  assembleAgentContext,
  queryKnowledgeAboutEntity
} from "../engines/orchestration/layered-memory-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N2.2.1 (MEMÓRIA EM CAMADAS) ===");

// 1. Montagem de contexto em 4 camadas com limitação de sessão (6 a 10 interações)
console.log("-> Teste 1: Montagem e separação estrita das 4 camadas de memória");
const sampleInteractions = [
  { id: 1, text: "msg 1" },
  { id: 2, text: "msg 2" },
  { id: 3, text: "msg 3" },
  { id: 4, text: "msg 4" },
  { id: 5, text: "msg 5" },
  { id: 6, text: "msg 6" },
  { id: 7, text: "msg 7" },
  { id: 8, text: "msg 8" },
  { id: 9, text: "msg 9" },
  { id: 10, text: "msg 10" },
  { id: 11, text: "msg 11" }
];

const ctx = assembleAgentContext({
  agentDomain: "relacionamento",
  entityRef: "01.234.567/0001-89",
  period: "2026-08",
  recentInteractions: sampleInteractions,
  accountData: {
    cnpj: "01.234.567/0001-89",
    razao_social: "Hospital & Maternidade São Lucas S/A",
    employees_count: 280,
    months_revenue_12m: 60000000,
    payroll_active: false,
    billing_active: true
  },
  ownerDirectives: [
    { id: "dir-01", title: "Priorizar esteiras zeradas de alta pontuação", scope_domain: "all" }
  ]
});

// Camada 1 tem no máximo 8 interações (limite de 6-10)
assert.equal(ctx.context_layers.layer_1_session_count, 8);
// Camada 2 tem fatos da entidade correta
assert.equal(ctx.context_layers.layer_2_entity_facts.length, 1);
assert.equal(ctx.context_layers.layer_2_entity_facts[0].employees, 280);
// Camada 3 tem diretivas do dono
assert.equal(ctx.context_layers.layer_3_owner_directives.length, 1);
// Camada 4 tem governança e decisão soberana
assert.equal(ctx.context_layers.layer_4_normative_policy.decision_authority, "RAFAEL");

// 2. Isolamento temporal e de entidade (não contaminação)
console.log("-> Teste 2: Isolamento temporal e entre entidades");
const otherEntityCtx = assembleAgentContext({
  agentDomain: "conta",
  entityRef: "12.345.678/0001-90", // Forja Sul
  accountData: {
    cnpj: "01.234.567/0001-89", // São Lucas
    razao_social: "Hospital & Maternidade São Lucas S/A"
  }
});
// Se o dado não pertence à entidade solicitada, não contamina
assert.equal(otherEntityCtx.context_layers.layer_2_entity_facts.length, 0);

// 3. Consulta estruturada de conhecimento ("o que você sabe sobre?")
console.log("-> Teste 3: Consulta de conhecimento com proveniência e evidência");
const queryRes = queryKnowledgeAboutEntity({
  entityRef: "01.234.567/0001-89",
  account: {
    cnpj: "01.234.567/0001-89",
    razao_social: "Hospital & Maternidade São Lucas S/A",
    employees_count: 280,
    months_revenue_12m: 60000000,
    payroll_active: false,
    billing_active: true
  },
  contacts: [
    {
      cnpj: "01.234.567/0001-89",
      contact_name: "Dr. Arnaldo Silveira",
      role: "Diretor Financeiro & Sócio",
      is_decision_maker: true,
      last_contact_at: "2026-08-15T14:30:00Z"
    }
  ]
});

assert.equal(queryRes.status, "CONFIRMED");
assert.equal(queryRes.key_contacts.length, 1);
assert.equal(queryRes.key_contacts[0].name, "Dr. Arnaldo Silveira");
assert.equal(queryRes.data_source, "POSTGRES_PJ_ACCOUNTS_AND_CONTACTS");

console.log("\nTODOS OS TESTES DO MARCO N2.2.1 (MEMÓRIA EM CAMADAS) PASSARAM COM SUCESSO! 🟢");