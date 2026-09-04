-- ============================================================================
-- Migration 21: Tabela estado_360_producao e Funções de Consolidação e Projeção POBJ
-- Implementa:
--   1. Tabela estado_360_producao para métricas dinâmicas sem valores fixos
--   2. Função get_estado_360_resumo(p_tenant_id text)
--   3. Função get_pobj_run_rate(p_tenant_id text)
-- ============================================================================
\connect visao360;

BEGIN;

-- 1. Tabela estado_360_producao
CREATE TABLE IF NOT EXISTS public.estado_360_producao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL DEFAULT 'rafael-360',
    owner_id VARCHAR(100) NOT NULL DEFAULT 'rafael',
    indicador_codigo VARCHAR(50),
    indicador_nome VARCHAR(150),
    categoria VARCHAR(50) DEFAULT 'POBJ',
    valor_produzido NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    valor_meta NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'em_andamento', 'cancelado')),
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    competencia VARCHAR(20) NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
    metadados JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_estado_360_producao_lookup 
ON public.estado_360_producao (tenant_id, data_referencia, status);

CREATE INDEX IF NOT EXISTS idx_estado_360_producao_month
ON public.estado_360_producao (tenant_id, data_referencia);

-- 2. Query de Consolidação Dinâmica do Estado 360
CREATE OR REPLACE FUNCTION public.get_estado_360_resumo(p_tenant_id text DEFAULT 'rafael-360')
RETURNS TABLE (
    total_produzido NUMERIC,
    total_meta NUMERIC,
    percentual_atingido NUMERIC,
    total_pendencias BIGINT,
    total_concluidos BIGINT,
    timestamp_consulta TEXT
)
LANGUAGE sql
STABLE
AS $$
WITH metricas_consolidadas AS (
    SELECT 
        COALESCE(SUM(valor_produzido), 0) AS total_produzido,
        COALESCE(SUM(valor_meta), 0) AS total_meta,
        COUNT(id) FILTER (WHERE status = 'pendente') AS total_pendencias,
        COUNT(id) FILTER (WHERE status = 'concluido') AS total_concluidos
    FROM public.estado_360_producao
    WHERE (tenant_id = p_tenant_id OR tenant_id = 'rafael-360' OR tenant_id = 'tenant-owner')
      AND data_referencia = CURRENT_DATE
)
SELECT 
    total_produzido,
    total_meta,
    CASE 
        WHEN total_meta > 0 THEN ROUND((total_produzido / total_meta) * 100, 2)
        ELSE 0.00 
    END AS percentual_atingido,
    total_pendencias,
    total_concluidos,
    TO_CHAR(CURRENT_TIMESTAMP, 'DD/MM/YYYY HH24:MI') AS timestamp_consulta
FROM metricas_consolidadas;
$$;

-- 3. Query de Run-Rate e Projeção Mensal POBJ
CREATE OR REPLACE FUNCTION public.get_pobj_run_rate(p_tenant_id text DEFAULT 'rafael-360')
RETURNS TABLE (
    total_realizado NUMERIC,
    total_meta NUMERIC,
    atingimento_atual_pct NUMERIC,
    total_dias_uteis BIGINT,
    dias_uteis_decorridos BIGINT,
    dias_uteis_restantes BIGINT,
    ritmo_diario_atual NUMERIC,
    projecao_fechamento NUMERIC,
    ritmo_diario_necessario NUMERIC
)
LANGUAGE sql
STABLE
AS $$
WITH dias_uteis_mes AS (
    SELECT 
        d::date AS dia,
        EXTRACT(ISODOW FROM d) AS dia_semana
    FROM generate_series(
        date_trunc('month', CURRENT_DATE),
        (date_trunc('month', CURRENT_DATE) + interval '1 month - 1 day')::date,
        interval '1 day'
    ) AS d
    WHERE EXTRACT(ISODOW FROM d) < 6 -- Considera segunda a sexta-feira
),
contagem_dias AS (
    SELECT
        COUNT(*) AS total_dias_uteis,
        COUNT(*) FILTER (WHERE dia <= CURRENT_DATE) AS dias_uteis_decorridos,
        COUNT(*) FILTER (WHERE dia > CURRENT_DATE) AS dias_uteis_restantes
    FROM dias_uteis_mes
),
dados_producao AS (
    SELECT
        COALESCE(SUM(valor_produzido), 0) AS total_realizado,
        COALESCE(SUM(valor_meta), 0) AS total_meta
    FROM public.estado_360_producao
    WHERE (tenant_id = p_tenant_id OR tenant_id = 'rafael-360' OR tenant_id = 'tenant-owner')
      AND date_trunc('month', data_referencia) = date_trunc('month', CURRENT_DATE)
)
SELECT
    p.total_realizado,
    p.total_meta,
    ROUND((p.total_realizado / NULLIF(p.total_meta, 0)) * 100, 2) AS atingimento_atual_pct,
    d.total_dias_uteis,
    d.dias_uteis_decorridos,
    d.dias_uteis_restantes,
    ROUND(p.total_realizado / NULLIF(d.dias_uteis_decorridos, 0), 2) AS ritmo_diario_atual,
    ROUND((p.total_realizado / NULLIF(d.dias_uteis_decorridos, 0)) * d.total_dias_uteis, 2) AS projecao_fechamento,
    CASE 
        WHEN (p.total_meta - p.total_realizado) <= 0 THEN 0.00
        ELSE ROUND((p.total_meta - p.total_realizado) / NULLIF(d.dias_uteis_restantes, 0), 2)
    END AS ritmo_diario_necessario
FROM dados_producao p
CROSS JOIN contagem_dias d;
$$;

-- 4. Permissões para visao360_app
GRANT SELECT, INSERT, UPDATE ON public.estado_360_producao TO visao360_app;
GRANT EXECUTE ON FUNCTION public.get_estado_360_resumo(text) TO visao360_app;
GRANT EXECUTE ON FUNCTION public.get_pobj_run_rate(text) TO visao360_app;

COMMIT;
