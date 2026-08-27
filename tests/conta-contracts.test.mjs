import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const specialists = [
  ["CONTA_IDENTIDADE_QUALIDADE", "IDENTIDADE_CADASTRO_QUALIDADE.md"],
  ["CONTA_PROSPECCAO_OXIGENACAO", "PROSPECCAO_ABERTURA_OXIGENACAO.md"],
  ["CONTA_CICLO_VIDA_SAUDE", "CICLO_VIDA_SAUDE_CARTEIRA.md"],
  ["CONTA_ATIVIDADE_CENTRALIZACAO", "ATIVIDADE_CENTRALIZACAO_PRODUTOS_LIMITES.md"],
  ["CONTA_RISCO_ELEGIBILIDADE", "RISCO_RESTRICOES_ELEGIBILIDADE.md"],
  ["CONTA_CREDITO_APRENDIZADO", "CREDITO_APRENDIZADO_ANALITICO.md"],
];

const registry = readFileSync("policies/capability-registry.yaml", "utf8");
const reasonCatalog = readFileSync("policies/reason-codes.yaml", "utf8");
const manager = readFileSync("domains/conta/GERENTE_GERAL_CONTA.md", "utf8");
const requestSchema = JSON.parse(
  readFileSync("contracts/conta-specialist-request.schema.json", "utf8"),
);

assert.match(manager, /Versão:\*\* 4\.38\.0/);
assert.match(manager, /no máximo quatro são acionadas/i);
assert.equal(requestSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
assert.equal(requestSchema.properties.manager_id.const, "GERENTE_GERAL_CONTA");

for (const [id, filename] of specialists) {
  const path = `domains/conta/especialistas/${filename}`;
  assert.ok(existsSync(path), `arquivo ausente: ${path}`);
  assert.ok(readFileSync(path, "utf8").includes(id), `ID ausente em ${path}`);
  assert.match(registry, new RegExp(`primary_implementation: ${id}\\n[\\s\\S]{0,180}state: PROPOSED`));
  assert.ok(requestSchema.properties.specialist_id.enum.includes(id));
}

const reasonCodes = [...reasonCatalog.matchAll(/^  ([A-Z][A-Z0-9_]+):$/gm)].map(
  (match) => match[1],
);
assert.ok(reasonCodes.length >= 150, "catálogo de reason codes incompleto");
assert.equal(new Set(reasonCodes).size, reasonCodes.length, "reason codes duplicados");

for (const required of [
  "RESTRICTION_NEW",
  "RESTRICTION_CLEARED",
  "RESTRICTION_RECURRENT",
  "SALE_IMPROVED",
  "SALE_WORSENED",
  "RATING_IMPROVED",
  "RATING_WORSENED",
]) {
  assert.ok(reasonCodes.includes(required), `reason code ausente: ${required}`);
}

console.log("Conta: contratos, especialistas e catálogo validados.");
