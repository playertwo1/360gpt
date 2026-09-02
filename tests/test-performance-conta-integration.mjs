import fs from "node:fs";
import { evaluateAccount, evaluatePortfolio } from "../engines/conta/conta-engine.mjs";

console.log("=== TESTE DE INTEGRAÇÃO CONTA x PERFORMANCE ===");

// 1. Simulação dos dados reais da agência 6895 cadastrados no banco
const sampleAccounts = [
  {
    cnpj: "01.234.567/0001-89",
    razao_social: "Hospital & Maternidade São Lucas S/A",
    segmento: "Saúde Hospitalar",
    months_revenue_12m: 60000000,
    employees_count: 280,
    payroll_active: false,
    credit_score: 850,
    tax_regularity: true,
    protests_count: 0
  },
  {
    cnpj: "12.345.678/0001-90",
    razao_social: "Metalúrgica Forja Sul Ltda",
    segmento: "Indústria Metalmecânica",
    months_revenue_12m: 24000000,
    employees_count: 45,
    billing_active: false,
    pix_active: false,
    credit_score: 720,
    tax_regularity: true,
    protests_count: 0
  }
];

// 2. Gaps vindos do POBJ de Agosto/2026
const targetGaps = ["folha_pagamento", "boleto_pix", "gestao_vencidos"];

// 3. Execução do Motor de Conta
const contaResponse = evaluatePortfolio(sampleAccounts, targetGaps, "int-test-20260902", "ACCOUNT_LEVEL_FUTURE");

console.log("Status da Resposta de Conta:", contaResponse.account_data_status);
console.log("Candidatos Elegíveis:", contaResponse.account_candidates.length);
console.log("Autoridade Decisória:", contaResponse.decision_authority);

for (const cand of contaResponse.evaluated_details) {
  console.log(`\nEmpresa: ${cand.razao_social} (${cand.account_ref})`);
  console.log(`Status de Elegibilidade: ${cand.eligibility_status}`);
  for (const opp of cand.opportunities) {
    console.log(`  -> Oportunidade: ${opp.target_product} | Ganho: +${opp.estimated_points_gain} pts | Rationale: ${opp.rationale}`);
  }
}

if (contaResponse.account_data_status === "AVAILABLE" && contaResponse.decision_authority === "RAFAEL") {
  console.log("\n✅ Integração 360 validada: GG Performance gerou os gaps e GG Conta nomeou as empresas com autoridade final de Rafael!");
} else {
  throw new Error("Falha na validação de conformidade da integração.");
}
