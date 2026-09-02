import pg from "pg";

const { Client } = pg;
const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/visao360"
});

await client.connect();

const contacts = [
  {
    id: "cnt-01",
    cnpj: "01.234.567/0001-89",
    contact_name: "Dr. Arnaldo Silveira",
    role: "Diretor Financeiro & Sócio",
    phone: "(22) 99876-1001",
    email: "arnaldo.silveira@saolucas.com.br",
    is_decision_maker: true,
    key_interests: ["Portabilidade de Folha", "Crédito Consignado Médico", "Isenção de Tarifas PIX"],
    known_objections: ["Preocupação com retrabalho do RH na troca de banco"],
    last_contact_at: "2026-08-15T14:30:00Z"
  },
  {
    id: "cnt-01b",
    cnpj: "01.234.567/0001-89",
    contact_name: "Dra. Helena Ramos",
    role: "Superintendente de RH",
    phone: "(22) 99876-1002",
    email: "helena.ramos@saolucas.com.br",
    is_decision_maker: false,
    key_interests: ["Processamento automatizado de folha", "Atendimento presencial na contratação"],
    known_objections: ["Insegurança quanto a prazos de abertura de conta dos colaboradores"],
    last_contact_at: "2026-08-18T10:00:00Z"
  },
  {
    id: "cnt-02",
    cnpj: "12.345.678/0001-90",
    contact_name: "Sr. Cláudio Mendes",
    role: "Sócio-Administrador",
    phone: "(22) 99876-2001",
    email: "claudio.mendes@forjasul.com.br",
    is_decision_maker: true,
    key_interests: ["Taxa de desconto de recebíveis", "Cobrança PIX com tarifa reduzida", "Alongamento de dívida"],
    known_objections: ["Sistema ERP já homologado no banco concorrente"],
    last_contact_at: "2026-08-20T16:00:00Z"
  },
  {
    id: "cnt-02b",
    cnpj: "12.345.678/0001-90",
    contact_name: "Sra. Renata Dias",
    role: "Gerente Financeira",
    phone: "(22) 99876-2002",
    email: "renata.dias@forjasul.com.br",
    is_decision_maker: false,
    key_interests: ["Reconciliação automática CNAB", "Liquidação D+0 de boletos"],
    known_objections: ["Tempo para testes de homologação do arquivo de remessa"],
    last_contact_at: "2026-08-22T11:15:00Z"
  },
  {
    id: "cnt-03",
    cnpj: "56.789.012/0001-34",
    contact_name: "Sr. Marcos Valério",
    role: "Diretor Operacional & Sócio",
    phone: "(22) 99876-3001",
    email: "marcos@transrapido.com.br",
    is_decision_maker: true,
    key_interests: ["Capital de Giro", "Cartão Combustível Frotista", "Cobrança de Fretes"],
    known_objections: ["Taxa de juros de mercado considerada elevada"],
    last_contact_at: "2026-08-10T09:00:00Z"
  },
  {
    id: "cnt-04",
    cnpj: "67.890.123/0001-45",
    contact_name: "Sr. Carlos Alberto Fonseca",
    role: "CFO",
    phone: "(22) 99876-4001",
    email: "carlos.fonseca@distribuidorabebidas.com.br",
    is_decision_maker: true,
    key_interests: ["Cash Management", "Aplicações CDB com liquidez diária", "Cobrança Eletrônica"],
    known_objections: ["Exige reciprocidade de reciprocidade de limite pré-aprovado"],
    last_contact_at: "2026-08-05T15:45:00Z"
  },
  {
    id: "cnt-05",
    cnpj: "45.678.901/0001-23",
    contact_name: "Sr. Antônio Carlos Ribeiro",
    role: "Presidente",
    phone: "(22) 99876-5001",
    email: "presidente@graosplanalto.coop.br",
    is_decision_maker: true,
    key_interests: ["Custeio Agrícola", "CPR Financeira", "Seguro Agrícola"],
    known_objections: ["Cronograma de safra define a janela de contratação"],
    last_contact_at: "2026-08-12T14:00:00Z"
  }
];

for (const c of contacts) {
  await client.query(`
    INSERT INTO pj_account_contacts
      (id, cnpj, contact_name, role, phone, email, is_decision_maker, key_interests, known_objections, last_contact_at)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      contact_name = EXCLUDED.contact_name,
      role = EXCLUDED.role,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      is_decision_maker = EXCLUDED.is_decision_maker,
      key_interests = EXCLUDED.key_interests,
      known_objections = EXCLUDED.known_objections,
      last_contact_at = EXCLUDED.last_contact_at;
  `, [
    c.id, c.cnpj, c.contact_name, c.role, c.phone, c.email,
    c.is_decision_maker, c.key_interests, c.known_objections, c.last_contact_at
  ]);
}

const countRes = await client.query("SELECT count(*) FROM pj_account_contacts;");
console.log(`Contatos cadastrados com sucesso: ${countRes.rows[0].count} registros.`);

await client.end();