import assert from "node:assert/strict";
import {
  OUTREACH_CHANNELS,
  generateOutreachDraft,
  formatOutreachTelegram
} from "../engines/relationship/outreach-draft-engine.mjs";

console.log("=== INICIANDO BATERIA DE TESTES DO MOTOR DE ABORDAGEM COMERCIAL ===");

// 1. Rascunho WhatsApp Hospital São Lucas (Folha)
console.log("-> Teste 1: Rascunho WhatsApp Hospital São Lucas (Folha)");
const draft1 = generateOutreachDraft({
  accountKey: "hospital-sao-lucas",
  channel: OUTREACH_CHANNELS.WHATSAPP
});

assert.equal(draft1.target_account, "Hospital & Maternidade São Lucas S/A");
assert.equal(draft1.contact_name, "Dr. Arnaldo Silveira");
assert.equal(draft1.requires_owner_approval, true);
assert.equal(draft1.decision_authority, "RAFAEL");
assert.match(draft1.draft_content, /280 colaboradores/);
assert.match(draft1.draft_content, /Dra\. Helena Ramos/);

// 2. Rascunho WhatsApp Metalúrgica Forja Sul (Boleto/PIX & Vencidos)
console.log("-> Teste 2: Rascunho WhatsApp Forja Sul (Boleto/PIX e Vencidos)");
const draft2 = generateOutreachDraft({
  accountKey: "forja-sul",
  channel: OUTREACH_CHANNELS.WHATSAPP
});

assert.equal(draft2.target_account, "Metalúrgica Forja Sul Ltda");
assert.equal(draft2.contact_name, "Sr. Cláudio Mendes");
assert.match(draft2.draft_content, /R\$ 420 mil/);
assert.match(draft2.draft_content, /D\+0/);
assert.match(draft2.draft_content, /regularização dos títulos/);

// 3. Rascunho E-mail
console.log("-> Teste 3: Rascunho de E-mail corporativo");
const draft3 = generateOutreachDraft({
  accountKey: "hospital-sao-lucas",
  channel: OUTREACH_CHANNELS.EMAIL
});
assert.match(draft3.subject, /Parceria de Folha de Pagamento/);
assert.match(draft3.draft_content, /Prezado Dr\. Arnaldo/);

// 4. Formatação Telegram
console.log("-> Teste 4: Formatação para Telegram");
const msg = formatOutreachTelegram(draft1);
assert.match(msg, /Rascunho de Abordagem Comercial/i);
assert.match(msg, /Texto Pronto para Copiar e Enviar/i);

console.log("\nTODOS OS TESTES DO MOTOR DE ABORDAGEM COMERCIAL PASSARAM COM SUCESSO! 🟢");