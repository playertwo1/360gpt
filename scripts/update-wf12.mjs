import fs from "node:fs";

const wfPath = "n8n/workflows/wf-12-diretor-roteamento-performance-mvp.json";
const wf12 = JSON.parse(fs.readFileSync(wfPath, "utf8"));

const nodeConta = {
  parameters: {
    source: "database",
    workflowId: {
      __rl: true,
      value: "9eb8e86a-84b8-4aa9-97e4-360000000020",
      mode: "list",
      cachedResultName: "WF-20 — GG Conta — Análise de Carteira e Elegibilidade"
    },
    mode: "once",
    options: {
      waitForSubWorkflow: true
    }
  },
  id: "conta-analysis",
  name: "04 Acionar GG Conta",
  type: "n8n-nodes-base.executeWorkflow",
  typeVersion: 1.3,
  position: [480, 80]
};

const nodeIntegracao = {
  parameters: {
    mode: "runOnceForAllItems",
    language: "javaScript",
    jsCode: `
const perfResult = $('03 Acionar GG Performance').first()?.json ?? {};
const contaResult = $input.first()?.json ?? {};

const summaryConta = contaResult.summary ?? {};
const oppFolha = (summaryConta.opp_folha_prioritaria ?? [])[0];
const oppCobranca = (summaryConta.opp_cobranca_prioritaria ?? [])[0];
const oppVencidos = (summaryConta.opp_blindagem_vencidos ?? [])[0];

let textToAdd = '\\n\\n🏢 *OPORTUNIDADES DE CARTEIRA PJ (GG Conta):*\\n';
if (oppFolha) textToAdd += '• *Folha de Pagamento (+4,0 pts):* ' + oppFolha.razao_social + ' (Alvo de cross-sell)\\n';
if (oppCobranca) textToAdd += '• *Cobrança & PIX (+4,0 pts):* ' + oppCobranca.razao_social + ' (Ativar esteira)\\n';
if (oppVencidos) textToAdd += '• *Blindagem de Vencidos (9,34 pts):* ' + oppVencidos.razao_social + ' (Monitoramento preventivo)\\n';

let baseText = String(perfResult.result?.telegram_text || perfResult.telegram_text || '');
if (baseText) {
  baseText += textToAdd;
  if (perfResult.result) perfResult.result.telegram_text = baseText;
  else perfResult.telegram_text = baseText;
}

return [{
  json: {
    ...perfResult,
    conta_domain: contaResult,
    consolidated_360: {
      performance_status: perfResult.result?.status || 'READY',
      conta_status: contaResult.operating_phase || 'AVAILABLE',
      target_companies_identified: (summaryConta.opp_folha_prioritaria?.length || 0) + (summaryConta.opp_cobranca_prioritaria?.length || 0),
      decision_authority: 'RAFAEL'
    }
  }
}];
`
  },
  id: "integrate-360",
  name: "05 Integrar Parecer 360",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [740, 80]
};

// Remover nós se já existirem
wf12.nodes = wf12.nodes.filter(n => n.name !== "04 Acionar GG Conta" && n.name !== "05 Integrar Parecer 360");
wf12.nodes.push(nodeConta);
wf12.nodes.push(nodeIntegracao);

wf12.connections["03 Acionar GG Performance"] = {
  main: [[{ node: "04 Acionar GG Conta", type: "main", index: 0 }]]
};

wf12.connections["04 Acionar GG Conta"] = {
  main: [[{ node: "05 Integrar Parecer 360", type: "main", index: 0 }]]
};

fs.writeFileSync(wfPath, JSON.stringify(wf12, null, 2), "utf8");
console.log("WF-12 atualizado com sucesso no disco!");