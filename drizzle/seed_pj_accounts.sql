
    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-01-ind-metalurgica-regular', '12.345.678/0001-90', 'Metalúrgica Forja Sul Ltda', '25.39-0-01', 'Indústria Metalmecânica', 24000000.0,
        850, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-02-varejo-divergencia-erp-extrato', '23.456.789/0001-01', 'Supermercados Estrela do Vale Ltda', '47.11-3-02', 'Varejo Alimentício', 15000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-03-tech-saas-alta-margem', '34.567.890/0001-12', 'CloudMetrics Software S/A', '62.01-5-01', 'Tecnologia / SaaS B2B', 12000000.0,
        920, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-04-agro-cpr-garantia-safra', '45.678.901/0001-23', 'Cooperativa Agrícola Grãos do Planalto', '01.11-6-01', 'Agronegócio', 36000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-05-logistica-restricao-serasa-ativa', '56.789.012/0001-34', 'TransRápido Logística & Cargas Ltda', '49.30-2-02', 'Transporte Rodoviário', 18000000.0,
        700, 15, false, false, false,
        3, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-06-distribuidora-cnd-trabalhista-vencida', '67.890.123/0001-45', 'Distribuidora Nacional de Bebidas S/A', '46.35-4-02', 'Distribuição', 48000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-07-servicos-documento-ilegivel-ocr', '78.901.234/0001-56', 'InfoConsulting Assessoria em TI Ltda', '62.02-0-00', 'Serviços de Tecnologia', 6000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-08-franquia-faturamento-estatutario-gap', '89.012.345/0001-67', 'Franquias Café Gourmet Brasil S/A', '56.11-2-03', 'Alimentação / Franquias', 9600000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-09-comex-cambio-volatilidade', '90.123.456/0001-78', 'GlobalTech Importação de Componentes Ltda', '46.51-6-01', 'Comércio Exterior', 30000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-10-hospitalar-reciprocidade-folha', '01.234.567/0001-89', 'Hospital & Maternidade São Lucas S/A', '86.10-1-01', 'Saúde Hospitalar', 60000000.0,
        700, 280, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-11-educacao-sazonalidade-matriculas', '11.222.333/0001-44', 'Colégio & Faculdade Horizonte Educacional Ltda', '85.31-7-00', 'Educação Privada', 14400000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-12-construcao-civil-retencao-obra', '22.333.444/0001-55', 'Engenharia & Obras Estruturais S/A', '41.20-4-00', 'Construção Civil', 42000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-13-farmaceutica-anvisa-regularidade', '33.444.555/0001-66', 'Laboratórios FarmaVida Produtos Químicos S/A', '21.21-1-01', 'Indústria Farmacêutica', 72000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-14-holding-familiar-multiplos-socios', '44.555.666/0001-77', 'Petry & Filhos Participações S/A', '64.62-0-00', 'Holding Patrimonial', 21600000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-15-startup-churn-elevado', '55.666.777/0001-88', 'Edutech Cursos Online Ltda', '85.99-6-04', 'Edutech / Cursos Digitais', 7200000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-16-concessionaria-finame-estoque', '66.777.888/0001-99', 'Tratores & Máquinas Agrícolas do Oeste S/A', '45.11-1-04', 'Concessionária de Máquinas', 54000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-17-alimentos-prompt-injection-tentativa', '77.888.999/0001-00', 'Frigorífico Serra Dourada Alimentos Ltda', '10.11-2-01', 'Frigorífico / Alimentos', 38400000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-18-textil-divergencia-normativa-garantia', '88.999.000/0001-11', 'Fiação & Tecelagem Imperial S/A', '13.11-1-00', 'Indústria Têxtil', 25200000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-19-energia-solar-contrato-longo-prazo', '99.000.111/0001-22', 'Solaris Parque Gerador de Energia Renovável S/A', '35.11-5-01', 'Energia Renovável', 18000000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    

    INSERT INTO pj_accounts (
        id, cnpj, razao_social, cnae, segmento, months_revenue_12m,
        credit_score, employees_count, payroll_active, billing_active, pix_active,
        protests_count, tax_regularity, status_conta, rating
    ) VALUES (
        'case-20-ecommerce-cross-border-tributacao', '00.111.222/0001-33', 'MegaStore Comércio Digital de Eletrônicos Ltda', '47.51-2-01', 'E-commerce Multicanal', 33600000.0,
        700, 15, false, false, false,
        0, true, 'MADURA', 'A'
    ) ON CONFLICT (cnpj) DO UPDATE SET
        razao_social = EXCLUDED.razao_social,
        months_revenue_12m = EXCLUDED.months_revenue_12m,
        employees_count = EXCLUDED.employees_count,
        updated_at = now();
    