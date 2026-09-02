-- Migration 0012: Schema relacional do Gerente Geral de Conta (Carteira PJ & Oportunidades)

CREATE TABLE IF NOT EXISTS pj_accounts (
    id VARCHAR(80) PRIMARY KEY,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnae VARCHAR(20),
    segmento VARCHAR(100),
    months_revenue_12m NUMERIC(15, 2) DEFAULT 0,
    credit_score INTEGER DEFAULT 0,
    employees_count INTEGER DEFAULT 0,
    payroll_active BOOLEAN DEFAULT false,
    billing_active BOOLEAN DEFAULT false,
    pix_active BOOLEAN DEFAULT false,
    credit_active BOOLEAN DEFAULT false,
    consortium_active BOOLEAN DEFAULT false,
    status_conta VARCHAR(50) DEFAULT 'MADURA',
    rating VARCHAR(10) DEFAULT 'A',
    tax_regularity BOOLEAN DEFAULT true,
    protests_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pj_account_opportunities (
    id VARCHAR(80) PRIMARY KEY,
    account_id VARCHAR(80) REFERENCES pj_accounts(id) ON DELETE CASCADE,
    indicator_key VARCHAR(100) NOT NULL,
    target_product VARCHAR(100) NOT NULL,
    estimated_points_gain NUMERIC(6, 2) DEFAULT 0,
    reason_code VARCHAR(100) NOT NULL,
    rationale TEXT NOT NULL,
    confidence NUMERIC(4, 2) DEFAULT 1.00,
    status VARCHAR(50) DEFAULT 'ELEGIVEL',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pj_accounts_cnpj ON pj_accounts(cnpj);
CREATE INDEX IF NOT EXISTS idx_pj_accounts_segmento ON pj_accounts(segmento);
CREATE INDEX IF NOT EXISTS idx_pj_opps_indicator ON pj_account_opportunities(indicator_key);