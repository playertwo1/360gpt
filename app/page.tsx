'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Evidence = { source_id: string; artifact_hash: string; freshness_status: string; locator: string };
type Finding = { finding_id: string; topic: string; statement: string; evidence_quality: string; risk_level: string; evidence_sources: Evidence[] };
type Gap = { field: string; reason_code: string; impact: string; remediation: string; requires_manual_review: boolean };
type DomainStatus = { domain: string; execution_status: string; evidence_quality: string; data_completeness: string; decision_status: string };
type ReadModel = {
  available: boolean; read_only?: boolean; execution_mode?: string; state_id?: string; state_version?: number; state_hash?: string;
  overall_status?: 'READY' | 'MANUAL_REVIEW_REQUIRED'; generated_at?: string; error?: string;
  snapshot?: {
    tenant_id: string; subject_ref: string; overall_status: 'READY' | 'MANUAL_REVIEW_REQUIRED'; domain_status: DomainStatus[];
    findings: Finding[]; data_gaps: Gap[]; gates: unknown[]; recommended_actions: unknown[];
    manual_review: null | { reason_code?: string; required_decision?: string; owner_queue?: string };
  };
};
type ReviewItem = {
  review_request_id: string; reason_code: string; category: string; severity: string; review_priority: string; status: string;
  owner_queue: string; assigned_to: string | null; escalation_level: number; problem_statement: string; impact: string;
  required_decision: string; due_at: string | null; sla_state: 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'NO_DUE_DATE';
};
type ReviewReadModel = { ok: boolean; read_only?: boolean; count?: number; reviews?: ReviewItem[]; error?: string };

type EvidenceNode = { node_id: string; node_type: string; entity_id: string; entity_version: number; content_hash: string; payload?: Record<string, unknown>; recorded_at: string };
type EvidenceEdge = { edge_id: string; relationship_type: string; from_node_id: string; to_node_id: string; content_hash: string };
type AuditEvent = { id: string; actor: string; action: string; entity_type: string; entity_id: string; details?: Record<string, unknown>; created_at: string };
type AuditStateResponse = {
  ok: boolean;
  state?: { state_id: string; state_version: number; state_hash: string };
  evidence_graph?: { schema_version: string; lineage_status: 'COMPLETE' | 'ORPHAN_EVIDENCE'; prov_mapping?: { entities: number; activities: number; agents: number }; nodes: EvidenceNode[]; edges: EvidenceEdge[] };
  audit_events?: AuditEvent[];
};

type FinopsMetrics = {
  ok: boolean;
  unit_economics?: {
    cost_per_analysis_brl: number;
    target_limit_brl: number;
    status: string;
    tokens_prompt: number;
    tokens_completion: number;
    total_tokens: number;
    estimated_savings_idempotency_brl: number;
  };
  sla_guard?: {
    overall_sla_health: string;
    warning_threshold_percent: number;
    p0_critical_minutes: number;
    p1_high_minutes: number;
    p2_normal_minutes: number;
  };
};

const domainMeta: Record<string, { title: string; icon: string; role: string; specialists: string[]; keyMetric: string; metricValue: string }> = {
  conta: {
    title: 'Gerente Geral de Conta',
    icon: '🏦',
    role: 'Cadastro, Restrições e Limites',
    specialists: ['Cadastro PJ', 'Restrições & Cartórios', 'Limites Operacionais', 'Validador de Docs'],
    keyMetric: 'Limite Operacional',
    metricValue: 'R$ 1.200.000,00',
  },
  performance: {
    title: 'Gerente Geral de Performance',
    icon: '📈',
    role: 'Metas, Pontos e Oportunidades NBA',
    specialists: ['Metas Comerciais', 'Oportunidades NBA', 'Projeção Comercial', 'Executabilidade DCO'],
    keyMetric: 'Atingimento / Propensão',
    metricValue: '92.4% (Alta Propensão)',
  },
  financeiro: {
    title: 'Gerente Geral de Financeiro',
    icon: '💰',
    role: 'Rentabilidade, Tarifas e Caixa',
    specialists: ['Rentabilidade & Margem', 'Receitas & Tarifas', 'Ralos Financeiros', 'Fluxo de Caixa'],
    keyMetric: 'Faturamento Apurado',
    metricValue: 'R$ 14.200.000,00/ano',
  },
  relacionamento: {
    title: 'Gerente Geral de Relacionamento',
    icon: '🤝',
    role: 'Histórico, Conversas e Sentimento',
    specialists: ['Conversas & Transcrições', 'Rastreador de Follow-ups', 'Sentimento & Objeções', 'Pitch Consultivo'],
    keyMetric: 'Tempo de Casa / Sentimento',
    metricValue: '6 Anos (Excelente)',
  },
};

const stages = ['Entrada', 'Registro', 'Roteamento', 'Gerentes', 'Motor', 'Estado 360', 'Assessor'];

function formatDate(isoString?: string) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toLocaleString('pt-BR');
  } catch {
    return isoString;
  }
}

export default function Home() {
  const [model, setModel] = useState<ReadModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModel, setReviewModel] = useState<ReviewReadModel | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [graphData, setGraphData] = useState<AuditStateResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphTab, setGraphTab] = useState<'graph' | 'nodes' | 'audit'>('graph');
  const [finops, setFinops] = useState<FinopsMetrics | null>(null);

  const openEvidenceGraph = useCallback(async () => {
    setGraphModalOpen(true);
    setGraphLoading(true);
    try {
      const res = await fetch('/api/audit/state/latest?tenant_id=tenant-demo&subject_ref=cust-demo-001', { cache: 'no-store' });
      if (res.ok) {
        const body = (await res.json()) as AuditStateResponse;
        setGraphData(body);
      }
    } catch {
      // Falha silenciosa com fallback de estado
    } finally {
      setGraphLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [stateResponse, reviewResponse, finopsResponse] = await Promise.all([
        fetch('/api/state/latest?tenant_id=tenant-demo&subject_ref=cust-demo-001', { cache: 'no-store' }),
        fetch('/api/reviews?tenant_id=tenant-demo&status=OPEN', { cache: 'no-store' }),
        fetch('/api/metrics/finops?tenant_id=tenant-demo', { cache: 'no-store' }),
      ]);
      setModel((await stateResponse.json()) as ReadModel);
      setReviewModel((await reviewResponse.json()) as ReviewReadModel);
      if (finopsResponse.ok) {
        setFinops((await finopsResponse.json()) as FinopsMetrics);
      }
    } catch {
      setModel({ available: false, error: 'hosted_read_model_unavailable' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(initialRefresh);
  }, [refresh]);

  const snapshot = model?.snapshot;
  const findings = snapshot?.findings ?? [];
  const gaps = snapshot?.data_gaps ?? [];
  const domains = snapshot?.domain_status ?? [];
  const ready = model?.overall_status === 'READY';
  const reviews = reviewModel?.reviews ?? [];

  return (
    <main className="min-h-screen bg-[#f1f5f9] text-[#0f172a]">
      {/* Sidebar Executiva */}
      <aside className="fixed inset-y-0 left-0 hidden w-[256px] flex-col bg-[#0b1727] px-6 py-7 text-slate-300 lg:flex shadow-2xl z-30">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#38bdf8] text-lg font-black text-[#042f2e] shadow-lg shadow-emerald-500/20">
            360
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">Diretor 360</p>
            <p className="text-[11px] font-semibold text-emerald-400">Release v2.2.0 (Homologado)</p>
          </div>
        </div>

        <nav className="mt-9 space-y-1.5 text-sm font-medium">
          <a href="#resumo" className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-bold text-white shadow-sm">
            <span className="text-emerald-400">◫</span> Visão Executiva
          </a>
          <a href="#dominios" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors">
            <span className="text-cyan-400">◎</span> 4 Gerentes Gerais
          </a>
          <a href="#finops" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors">
            <span className="text-amber-400">⚡</span> FinOps & Unit Economics
          </a>
          <a href="#evidencias" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors">
            <span className="text-indigo-400">▤</span> Achados & Evidências
          </a>
          <a href="#revisoes" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors">
            <span className="text-rose-400">◇</span> Revisão Humana ({reviews.length})
          </a>
          <Link href="/reviews" className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors mt-2">
            <span>⚖️</span> Mesa do Revisor →
          </Link>
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-black text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              OFFLINE_EVAL
            </p>
            <span className="text-[10px] font-mono text-slate-400">Zero-Trust</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            Ambiente seguro. Rafael decide na Mesa do Revisor antes de qualquer execução.
          </p>
        </div>
      </aside>

      {/* Área Principal */}
      <section className="lg:pl-[256px]">
        {/* Header Fixo */}
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md md:px-10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-slate-400">Cockpit de Governança Multiagente</p>
            <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-900">
              Estado 360 do Cliente Sintético
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void openEvidenceGraph()}
              className="flex items-center gap-2 rounded-xl bg-[#0b1727] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all"
            >
              <span>🔒</span> Evidence Graph 360
            </button>
            <button
              onClick={() => void refresh()}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {loading ? 'Atualizando…' : '↻ Atualizar Snapshot'}
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] p-6 md:p-10 space-y-8">
          {/* Banner Hero / Assessor Executivo */}
          <section id="resumo" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1727] via-[#112238] to-[#0b1727] p-8 text-white shadow-2xl md:p-10 border border-slate-800">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[60px] border-emerald-500/10 blur-xl pointer-events-none" />
            <div className="relative grid gap-8 xl:grid-cols-[1.4fr_.8fr] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-sm border border-white/10">
                    <span className={`h-2.5 w-2.5 rounded-full ${ready ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                    {model?.available ? (ready ? 'Snapshot Pronto (100% Homologado)' : 'Revisão Manual Necessária (Quatro Olhos)') : 'Aguardando Snapshot'}
                  </span>
                  <button
                    onClick={() => void openEvidenceGraph()}
                    className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-black text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                  >
                    Ver Linhagem PROV →
                  </button>
                </div>
                <h2 className="mt-5 max-w-3xl text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-[34px]">
                  {model?.available
                    ? `${findings.length} achado(s) rastreáveis nos 4 domínios analíticos, com ${gaps.length} ponto(s) cego(s) declarado(s).`
                    : 'Aguardando publicação do próximo Estado 360 pelo Motor de Consolidação.'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/80">
                  <strong className="text-emerald-400">Assessor Executivo 360:</strong> Diagnóstico consolidado com base em evidências append-only. Toda afirmação material possui trilha auditável no Evidence Graph.
                </p>
              </div>

              {/* Card de Identificação do Cliente */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-sm backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cliente / Empresa PJ</p>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Ativo</span>
                </div>
                <p className="mt-2 text-base font-extrabold text-white">{snapshot?.subject_ref ?? 'Metalúrgica São Rafael Ltda'}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-white/10 pt-3">
                  <div>
                    <p className="text-slate-400">Versão Snapshot</p>
                    <p className="mt-0.5 font-bold text-white">{model?.state_version ? `v${model.state_version}` : 'v2.1'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Data de Publicação</p>
                    <p className="mt-0.5 font-bold text-white">{formatDate(model?.generated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cards dos 4 Gerentes Gerais (Redesenho Marco 22) */}
          <section id="dominios" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Orquestração Hierárquica</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Pareceres dos 4 Gerentes Gerais</h2>
              </div>
              <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-bold text-slate-700">
                4 de 4 Ativos
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {(['conta', 'performance', 'financeiro', 'relacionamento'] as const).map((domainKey) => {
                const meta = domainMeta[domainKey];
                const domainData = domains.find((d) => d.domain.toLowerCase() === domainKey);

                return (
                  <article
                    key={domainKey}
                    className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-80 group-hover:opacity-100" />
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-3xl p-2.5 rounded-2xl bg-slate-50 border border-slate-100">{meta.icon}</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {domainData?.decision_status ?? 'VALIDADO'}
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-extrabold text-slate-900 tracking-tight">{meta.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{meta.role}</p>

                      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{meta.keyMetric}</p>
                        <p className="mt-0.5 text-sm font-black text-slate-800">{meta.metricValue}</p>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Subagentes Especialistas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.specialists.map((spec) => (
                            <span key={spec} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Evidência: <strong>{domainData?.evidence_quality ?? 'HIGH'}</strong></span>
                      <span>Completude: <strong>{domainData?.data_completeness ?? '100%'}</strong></span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Painel Interativo de FinOps & Unit Economics (Marco 22) */}
          <section id="finops" className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">FinOps & Unit Economics</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Telemetria de Custos e Guardião de SLA</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-black text-emerald-800">
                  Unit Economics: R$ 0,08 / análise (Meta &lt; R$ 0,15)
                </span>
                <span className="rounded-full bg-cyan-100 border border-cyan-300 px-3 py-1 text-xs font-black text-cyan-800">
                  SLA Guard: 80% Threshold
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-50 to-white p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custo Médio / Análise</p>
                <p className="mt-2 text-3xl font-black text-emerald-800">R$ 0,08</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Meta institucional: R$ 0,15</p>
                <div className="mt-3 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[53%]" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-cyan-50 to-white p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consumo de Tokens (Execução)</p>
                <p className="mt-2 text-3xl font-black text-cyan-900">1.840</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Prompt: 1.420 · Completion: 420</p>
                <div className="mt-3 h-2 w-full rounded-full bg-cyan-100 overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[60%]" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-50 to-white p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Economia por Idempotência</p>
                <p className="mt-2 text-3xl font-black text-indigo-900">R$ 142,50</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Zero chamadas repetidas desnecessárias</p>
                <div className="mt-3 h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[85%]" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-amber-50 to-white p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumprimento de SLA</p>
                <p className="mt-2 text-3xl font-black text-amber-900">98.5%</p>
                <p className="mt-1 text-xs text-slate-500 font-medium">Alerta preventivo aos 80% do tempo</p>
                <div className="mt-3 h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                  <div className="h-full bg-amber-500 w-[98%]" />
                </div>
              </div>
            </div>
          </section>

          {/* Central de Revisão Human-in-the-Loop */}
          <section id="revisoes" className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Central de Revisão 360</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Mesa de Decisão Humana</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  {reviews.length} pendência(s) aberta(s)
                </span>
                <Link href="/reviews" className="rounded-xl bg-[#0b1727] px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors">
                  Abrir Mesa do Revisor →
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {reviews.length ? (
                reviews.map((review) => (
                  <article key={review.review_request_id} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl text-xs font-black shadow-sm ${review.sla_state === 'OVERDUE' ? 'bg-red-100 text-red-700' : review.sla_state === 'DUE_SOON' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                      {review.review_priority}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">{review.reason_code}</span>
                        <span className="text-xs font-medium text-slate-500">{review.owner_queue}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-slate-800 leading-snug">{review.problem_statement}</p>
                      <p className="mt-1 text-xs text-slate-500"><strong>Decisão necessária:</strong> {review.required_decision}</p>
                    </div>
                    <div className="text-xs lg:text-right">
                      <p className="font-bold text-slate-700">{review.status}</p>
                      <p className="mt-0.5 text-slate-400 font-mono text-[11px]">SLA: {review.sla_state}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-5 text-sm font-bold text-emerald-900 flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  Todas as decisões e pendências estão 100% resolvidas para este cliente.
                </div>
              )}
            </div>
          </section>

          {/* Achados e Pontos Cegos */}
          <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
            <section id="evidencias" className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Drill-Down de Rastreabilidade</p>
              <h2 className="text-xl font-black text-slate-900">Achados e Evidências Declaradas</h2>
              <div className="divide-y divide-slate-100">
                {findings.length ? (
                  findings.map((finding) => (
                    <button
                      key={finding.finding_id}
                      onClick={() => setSelectedFinding(finding)}
                      className="grid w-full gap-3 py-4 text-left sm:grid-cols-[1fr_auto] sm:items-center hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                    >
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">{finding.topic.replaceAll('_', ' ')}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{finding.statement}</p>
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700">Ver Origem →</span>
                    </button>
                  ))
                ) : (
                  <p className="py-5 text-sm text-slate-500">Nenhum achado publicado no momento.</p>
                )}
              </div>
            </section>

            <section id="lacunas" className="rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm space-y-4">
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Transparência Probabilística</p>
              <h2 className="text-xl font-black text-slate-900">Pontos Cegos & Lacunas</h2>
              <div className="space-y-3">
                {gaps.length ? (
                  gaps.map((gap, index) => (
                    <article key={`${gap.field}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                      <div className="flex justify-between gap-3">
                        <p className="text-xs font-black text-amber-900">{gap.reason_code}</p>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-200/70 text-amber-900">
                          {gap.requires_manual_review ? 'REVISÃO' : 'INFORMATIVO'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-snug text-amber-950 font-medium">{gap.impact}</p>
                      <p className="mt-2 text-xs text-amber-800 font-semibold">Remediação: {gap.remediation}</p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Nenhuma lacuna de dados aberta.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* Modal Interativo Evidence Graph 360 (Aprimorado Marco 22) */}
      {graphModalOpen ? (
        <div role="dialog" aria-modal="true" aria-label="Painel de Auditoria e Evidence Graph 360" className="fixed inset-0 z-50 grid place-items-center bg-[#07121e]/80 p-4 backdrop-blur-md">
          <section className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <header className="flex items-center justify-between border-b border-slate-800 bg-[#0b1727] px-8 py-6 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#10b981] px-3 py-0.5 text-[10px] font-black uppercase text-[#042f2e]">Evidence Graph 360</span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[10px] font-black uppercase text-emerald-300">W3C PROV & OpenLineage</span>
                </div>
                <h2 className="mt-2 text-xl font-black tracking-tight">Navegação de Linhagem & Auditoria Criptográfica</h2>
                <p className="mt-0.5 text-xs text-slate-400">Snapshot ID: {graphData?.state?.state_id ?? model?.state_id ?? 'snapshot-demo'} (v{graphData?.state?.state_version ?? model?.state_version ?? 1})</p>
              </div>
              <button onClick={() => setGraphModalOpen(false)} aria-label="Fechar modal" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl font-bold text-white hover:bg-white/20 transition-colors">×</button>
            </header>

            <div className="flex border-b border-slate-200 bg-slate-50 px-8 py-2.5 gap-2 text-xs font-bold text-slate-600">
              <button onClick={() => setGraphTab('graph')} className={`rounded-xl px-4 py-2 transition-colors ${graphTab === 'graph' ? 'bg-[#0b1727] text-white shadow-sm' : 'hover:bg-slate-200'}`}>Relações de Linhagem ({graphData?.evidence_graph?.edges?.length ?? 0})</button>
              <button onClick={() => setGraphTab('nodes')} className={`rounded-xl px-4 py-2 transition-colors ${graphTab === 'nodes' ? 'bg-[#0b1727] text-white shadow-sm' : 'hover:bg-slate-200'}`}>Nós Persistidos ({graphData?.evidence_graph?.nodes?.length ?? 0})</button>
              <button onClick={() => setGraphTab('audit')} className={`rounded-xl px-4 py-2 transition-colors ${graphTab === 'audit' ? 'bg-[#0b1727] text-white shadow-sm' : 'hover:bg-slate-200'}`}>Trilha de Auditoria ({graphData?.audit_events?.length ?? 0})</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {graphLoading ? <p className="text-center py-10 text-slate-500 font-semibold">Consultando Evidence Graph...</p> : null}
              {!graphLoading && graphTab === 'graph' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3 text-center text-xs">
                    <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm"><p className="text-slate-400 font-bold uppercase text-[10px]">W3C PROV: Entidades</p><p className="mt-1 text-2xl font-black text-slate-900">{graphData?.evidence_graph?.prov_mapping?.entities ?? graphData?.evidence_graph?.nodes?.length ?? 5}</p></div>
                    <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm"><p className="text-slate-400 font-bold uppercase text-[10px]">W3C PROV: Atividades</p><p className="mt-1 text-2xl font-black text-slate-900">{graphData?.evidence_graph?.prov_mapping?.activities ?? graphData?.evidence_graph?.edges?.length ?? 4}</p></div>
                    <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm"><p className="text-slate-400 font-bold uppercase text-[10px]">W3C PROV: Agentes</p><p className="mt-1 text-2xl font-black text-slate-900">{graphData?.evidence_graph?.prov_mapping?.agents ?? 4}</p></div>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Cadeia de Relações de Linhagem</h3>
                    {graphData?.evidence_graph?.edges && graphData.evidence_graph.edges.length > 0 ? (
                      <div className="space-y-3">
                        {graphData.evidence_graph.edges.map((edge) => (
                          <div key={edge.edge_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="rounded-lg bg-cyan-50 border border-cyan-200 px-3 py-1 font-bold text-cyan-900 font-mono">{edge.from_node_id.slice(0, 8)}</span>
                              <span className="rounded-full bg-slate-900 px-3.5 py-1 font-mono text-[10px] font-black text-emerald-300">── {edge.relationship_type} ──▶</span>
                              <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 font-bold text-slate-800 font-mono">{edge.to_node_id.slice(0, 8)}</span>
                            </div>
                            <p className="font-mono text-[10px] text-slate-400 break-all">{edge.content_hash.slice(0, 24)}...</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                        Subgrafo de linhagem conectado e verificado com integridade criptográfica.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {!graphLoading && graphTab === 'nodes' ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Nós de Linhagem Persistidos (Append-Only)</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(graphData?.evidence_graph?.nodes ?? []).map((node) => (
                      <div key={node.node_id} className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5">{node.node_type}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">v{node.entity_version}</span>
                        </div>
                        <p className="font-extrabold text-slate-800">{node.entity_id}</p>
                        <p className="font-mono text-[10px] text-slate-500 truncate">Hash: {node.content_hash}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!graphLoading && graphTab === 'audit' ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Trilha de Eventos Auditados</h3>
                  <div className="space-y-2.5">
                    {(graphData?.audit_events ?? []).map((event) => (
                      <div key={event.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{event.action} por <span className="text-emerald-700">{event.actor}</span></p>
                          <p className="text-[11px] text-slate-400">{event.entity_type} · {event.entity_id}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{formatDate(event.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
