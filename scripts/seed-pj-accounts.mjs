import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres360@127.0.0.1:5432/visao360",
});

await client.connect();

const casesDir = "test-data/evals/cases";
const files = fs.readdirSync(casesDir).filter((f) => f.endsWith(".json"));

console.log(`Carregando ${files.length} casos de empresas PJ...`);

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(casesDir, file), "utf8"));
  const id = data.id;
  const cnpj = data.cnpj || `00.000.000/0001-${Math.floor(Math.random() * 90 + 10)}`;
  const razao = data.name;
  const cnae = data.cnae || "00.00-0-00";
  const segmento = data.segmento || "Geral PJ";
  const revenue = Number(data.expected_total_revenue || 1000000);
  const score = Number(data.credit_score || 700);
  const employees = Number(data.employees_count || (id.includes("hospitalar") ? 280 : 15));
  const protests = Number(data.protests || 0);
  const taxReg = data.tax_regularity !== false;
  const payroll = Boolean(data.payroll_active);
  const billing = Boolean(data.billing_active);
  const pix = Boolean(data.pix_active);

  const query = `
    INSERT INTO pj_accounts (
      id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
      credit_score, employees_count, payroll_active, billing_active, pix_active,
      protests_count, tax_regularity, status_conta, rating
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'MADURA', 'A')
    ON CONFLICT (cnpj) DO UPDATE SET
      razao_social = EXCLUDED.razao_social,
      months_revenue_12m = EXCLUDED.months_revenue_12m,
      employees_count = EXCLUDED.employees_count,
      updated_at = now();
  `;

  await client.query(query, [
    id, cnpj, razao, cnae, segmento, revenue,
    score, employees, payroll, billing, pix,
    protests, taxReg
  ]);
}

const countRes = await client.query("SELECT count(*) FROM pj_accounts;");
console.log(`Total de empresas na base pj_accounts: ${countRes.rows[0].count}`);

await client.end();