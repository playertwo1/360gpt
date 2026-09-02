import assert from "node:assert/strict";
import fs from "node:fs";
import Ajv from "ajv";
import {
  assessCommitment,
  prepareAccountApproach,
  evaluateRelationshipPortfolio
} from "../engines/relationship/relationship-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MARCO N8.2 (GG RELACIONAMENTO) ===");

// 1. Validar contrato de schema JSON
const schema = JSON.parse(fs.readFileSync("contracts/relationship-specialist-response.schema.json", "utf8"));
assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");

const schemaForAjv = { ...schema };
delete schemaForAjv.$schema;
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schemaForAjv);

// 2. Teste do motor de compromissos (assessCommitment)
console.log("-> Teste 1: Motor determinístico de compromissos");
const now = new Date("2026-08-28T12:00:00Z");

const openComm = assessCommitment({
  due_at: "2026-09-05T18:00:00Z",
  responsible: "Rafael",
  evidence_ref: "whatsapp_conversa_hospital_01"
}, now);
assert.equal(openComm.status, "OPEN");

const overdueComm = assessCommitment({
  due_at: "2026-08-25T18:00:00Z",
  responsible: "Rafael",
  evidence_ref: "visita_presencial_forja_sul_02"
}, now);
assert.equal(overdueComm.status, "OVERDUE_OPEN");

const incompleteComm = assessCommitment({
  due_at: "invalid-date",
  responsible: "Rafael"
}, now);
assert.equal(incompleteComm.status, "INCOMPLETE");
assert.equal(incompleteComm.reasonCode, "COMMITMENT_DATA_INCOMPLETE");

const completedComm = assessCommitment({
  status: "COMPLETED",
  due_at: "2026-08-20T10:00:00Z",
  responsible: "Rafael",
  evidence_ref: "envio_proposta_pdf"
}, now);
assert.equal(completedComm.status, "COMPLETED");

// 3. Teste da abordagem do Hospital São Lucas (Folha de Pagamento)
console.log("-> Teste 2: Abordagem consultiva Hospital São Lucas (Folha)");
const hospAccount = {
  cnpj: "01.234.567/0001-89",
  razao_social: "Hospital & Maternidade São Lucas S/A",
  employees_count: 280,
  months_revenue_12m: 60000000,
  payroll_active: false
};
const hospContact = {
  contact_name: "Dr. Arnaldo Silveira",
  role: "Diretor Financeiro & Sócio",
  is_decision_maker: true,
  key_interests: ["Portabilidade de Folha", "Crédito Consignado Médico"],
  known_objections: ["Preocupação com retrabalho do RH na troca de banco"],
  last_contact_at: "2026-08-15T14:30:00Z"
};

const hospApproach = prepareAccountApproach({
  account: hospAccount,
  contact: hospContact,
  targetProduct: "FOLHA_DE_PAGAMENTO",
  commitments: [{
    due_at: "2026-09-04T12:00:00Z",
    responsible: "Rafael",
    evidence_ref: "reuniao_previa_agencia_6895"
  }]
});

assert.ok(validate(hospApproach), JSON.stringify(validate.errors));
assert.equal(hospApproach.decision_authority, "RAFAEL");
assert.equal(hospApproach.suggested_approach.requires_owner_approval, true);
assert.match(hospApproach.suggested_approach.objective, /280 vidas/i);
assert.match(hospApproach.suggested_approach.opening, /Dr\. Arnaldo Silveira/i);
assert.ok(hospApproach.suggested_approach.questions.length >= 2);
assert.ok(hospApproach.open_commitments.length >= 1);

// 4. Teste da abordagem da Metalúrgica Forja Sul (Cobrança e PIX)
console.log("-> Teste 3: Abordagem consultiva Metalúrgica Forja Sul (Boleto/PIX)");
const forjaAccount = {
  cnpj: "12.345.678/0001-90",
  razao_social: "Metalúrgica Forja Sul Ltda",
  employees_count: 15,
  months_revenue_12m: 24000000,
  billing_active: false,
  pix_active: false
};
const forjaContact = {
  contact_name: "Sr. Cláudio Mendes",
  role: "Sócio-Administrador",
  is_decision_maker: true,
  key_interests: ["Taxa de desconto de recebíveis", "Cobrança PIX com tarifa reduzida"],
  known_objections: ["Sistema ERP já homologado no banco concorrente"],
  last_contact_at: "2026-08-20T16:00:00Z"
};

const forjaApproach = prepareAccountApproach({
  account: forjaAccount,
  contact: forjaContact,
  targetProduct: "COBRANCA_PIX"
});

assert.ok(validate(forjaApproach), JSON.stringify(validate.errors));
assert.equal(forjaApproach.decision_authority, "RAFAEL");
assert.equal(forjaApproach.suggested_approach.requires_owner_approval, true);
assert.match(forjaApproach.suggested_approach.objective, /Cobrança Bancária e PIX/i);
assert.match(forjaApproach.suggested_approach.opening, /Sr\. Cláudio Mendes/i);

// 5. Teste da avaliação de carteira (evaluateRelationshipPortfolio)
console.log("-> Teste 4: Avaliação de carteira do GG Relacionamento");
const portfolioRes = evaluateRelationshipPortfolio({
  accounts: [hospAccount, forjaAccount],
  contacts: [hospContact, forjaContact]
});
assert.equal(portfolioRes.provided_by, "GERENTE_GERAL_RELACIONAMENTO");
assert.equal(portfolioRes.approaches_count, 2);
assert.equal(portfolioRes.decision_authority, "RAFAEL");

console.log("\nTODOS OS TESTES DO MARCO N8.2 (GG RELACIONAMENTO) PASSARAM COM SUCESSO! 🟢");