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

const domainLabels: Record<string, string> = { conta: 'Conta', performance: 'Performance', financeiro: 'Financeiro', relacionamento: 'Relacionamento' };
const stages = ['Entrada', 'Registro', 'Roteamento', 'Gerentes', 'Motor', 'Estado 360', 'Assessor'];

export default function Home() {
  const [model, setModel] = useState<ReadModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModel, setReviewModel] = useState<ReviewReadModel | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [stateResponse, reviewResponse] = await Promise.all([
        fetch('/api/state/latest?tenant_id=tenant-demo&subject_ref=cust-demo-001', { cache: 'no-store' }),
        fetch('/api/reviews?tenant_id=tenant-demo&status=OPEN', { cache: 'no-store' }),
      ]);
      setModel((await stateResponse.json()) as ReadModel);
      setReviewModel((await reviewResponse.json()) as ReviewReadModel);
    } catch {
      setModel({ available: false, error: 'hosted_read_model_unavailable' });
    } finally { setLoading(false); }
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
    <main className="min-h-screen bg-[#f3f6f7] text-[#14212b]">
      <aside className="fixed inset-y-0 left-0 hidden w-[244px] flex-col bg-[#0d1c2b] px-5 py-7 text-slate-300 lg:flex">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#39d6ac] text-lg font-black text-[#0b2730]">V</div><div><p className="font-bold text-white">Visão 360</p><p className="text-[11px] text-slate-500">Diretor de carteira</p></div></div>
        <nav className="mt-10 space-y-2 text-sm">
          <a href="#resumo" className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-semibold text-white"><span>◫</span> Visão executiva</a>
          <a href="#dominios" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5"><span>◎</span> Domínios</a>
          <a href="#evidencias" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5"><span>▤</span> Evidências</a>
          <a href="#lacunas" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5"><span>△</span> Pontos cegos</a>
          <a href="#revisoes" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5"><span>◇</span> Revisões</a>
          <Link href="/reviews" className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5"><span>✓</span> Mesa do revisor</Link>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><p className="flex items-center gap-2 text-xs font-bold text-[#65e5c3]"><span className="h-2 w-2 rounded-full bg-[#39d6ac]" /> OFFLINE_EVAL</p><p className="mt-2 text-xs leading-5 text-slate-400">Somente dados sintéticos. Nenhuma ação externa autorizada.</p></div>
      </aside>

      <section className="lg:pl-[244px]">
        <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">
          <div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-400">Cockpit privado</p><h1 className="mt-1 font-bold tracking-tight">Estado 360 do cliente sintético</h1></div>
          <button onClick={() => void refresh()} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm disabled:opacity-50">{loading ? 'Atualizando…' : 'Atualizar snapshot'}</button>
        </header>

        <div className="mx-auto max-w-[1420px] p-5 md:p-8">
          <section id="resumo" className="relative overflow-hidden rounded-[28px] bg-[#0d1c2b] p-6 text-white shadow-[0_24px_60px_-36px_#0d1c2b] md:p-8">
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[52px] border-[#39d6ac]/10" />
            <div className="relative grid gap-8 xl:grid-cols-[1.4fr_.8fr] xl:items-end"><div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-[#65e5c3]"><span className={`h-2 w-2 rounded-full ${ready ? 'bg-[#39d6ac]' : 'bg-amber-400'}`} /> {model?.available ? (ready ? 'Snapshot pronto' : 'Revisão manual necessária') : 'Aguardando snapshot hospedado'}</div>
              <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight tracking-[-.035em] md:text-[36px]">{model?.available ? `${findings.length} achado(s) rastreáveis em ${domains.length} domínio(s), com ${gaps.length} lacuna(s) declarada(s).` : 'A ponte segura publicará aqui o próximo Estado 360 processado pelo n8n.'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Esta tela não calcula nem altera resultados. Ela lê exclusivamente o último snapshot persistido pelo Motor de Consolidação 360.</p>
            </div><div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-slate-500">Cliente</p><p className="mt-1 font-bold">{snapshot?.subject_ref ?? 'cust-demo-001'}</p><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><p className="text-slate-500">Versão</p><p className="mt-1 font-semibold">{model?.state_version ?? '—'}</p></div><div><p className="text-slate-500">Publicado</p><p className="mt-1 font-semibold">{formatDate(model?.generated_at)}</p></div></div></div></div>
          </section>

          {model?.error ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">O Estado 360 hospedado não respondeu. A entrada permanece preservada para nova tentativa segura.</div> : null}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
            ['Domínios concluídos', String(domains.length), 'máximo autorizado: 4'], ['Achados', String(findings.length), 'todos com evidência declarada'],
            ['Lacunas', String(gaps.length), gaps.some((gap) => gap.requires_manual_review) ? 'há revisão obrigatória' : 'sem impedimento automático'],
            ['Estado decisório', model?.overall_status ?? 'SEM SNAPSHOT', 'derivado do snapshot persistido'],
          ].map(([label, value, note]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 break-words text-2xl font-black tracking-[-.04em] text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>)}</section>

          <section id="dominios" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Orquestração mínima</p><h2 className="mt-1 text-xl font-black tracking-tight">Pareceres por domínio</h2></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{domains.length ? domains.map((domain) => <article key={domain.domain} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><h3 className="font-black">{domainLabels[domain.domain] ?? domain.domain}</h3><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><dl className="mt-4 space-y-2 text-xs"><Row label="Execução" value={domain.execution_status} /><Row label="Evidência" value={domain.evidence_quality} /><Row label="Completude" value={domain.data_completeness} /><Row label="Decisão" value={domain.decision_status} /></dl></article>) : <p className="text-sm text-slate-500">Nenhum domínio foi acionado no snapshot atual.</p>}</div></section>

          <section id="revisoes" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Central de Revisão 360</p><h2 className="mt-1 text-xl font-black tracking-tight">Fila humana estruturada</h2></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">Somente leitura · {reviews.length} aberta(s)</span><Link href="/reviews" className="rounded-xl bg-[#0d1c2b] px-4 py-2 text-xs font-black text-white">Abrir mesa do revisor</Link></div></div><div className="mt-5 grid gap-3">{reviews.length ? reviews.map((review) => <article key={review.review_request_id} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center"><div className={`grid h-11 w-11 place-items-center rounded-xl text-xs font-black ${review.sla_state === 'OVERDUE' ? 'bg-red-100 text-red-700' : review.sla_state === 'DUE_SOON' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>{review.review_priority}</div><div><div className="flex flex-wrap gap-2"><span className="text-xs font-black text-slate-900">{review.reason_code}</span><span className="text-xs text-slate-400">{review.owner_queue}</span></div><p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{review.problem_statement}</p><p className="mt-1 text-xs leading-5 text-slate-500">Decisão necessária: {review.required_decision}</p></div><div className="text-xs lg:text-right"><p className="font-black text-slate-700">{review.status}</p><p className="mt-1 text-slate-400">SLA: {review.sla_state}</p><p className="mt-1 text-slate-400">Até {formatDate(review.due_at ?? undefined)}</p></div></article>) : <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Nenhuma revisão manual aberta para o tenant demonstrativo.</p>}</div></section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
            <section id="evidencias" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Drill-down</p><h2 className="mt-1 text-xl font-black tracking-tight">Achados e evidências</h2><div className="mt-5 divide-y divide-slate-100">{findings.length ? findings.map((finding) => <button key={finding.finding_id} onClick={() => setSelectedFinding(finding)} className="grid w-full gap-3 py-4 text-left sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-xs font-bold uppercase tracking-wider text-[#16856b]">{finding.topic.replaceAll('_', ' ')}</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{finding.statement}</p></div><span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">Ver origem →</span></button>) : <p className="py-5 text-sm text-slate-500">Nenhum achado material publicado.</p>}</div></section>
            <section id="lacunas" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">O que não enxergamos</p><h2 className="mt-1 text-xl font-black tracking-tight">Pontos cegos declarados</h2><div className="mt-5 space-y-3">{gaps.length ? gaps.map((gap, index) => <article key={`${gap.field}-${index}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex justify-between gap-3"><p className="text-xs font-black text-amber-900">{gap.reason_code}</p><span className="text-[10px] font-bold text-amber-700">{gap.requires_manual_review ? 'REVISÃO' : 'INFORMATIVO'}</span></div><p className="mt-2 text-sm leading-6 text-amber-900">{gap.impact}</p><p className="mt-2 text-xs leading-5 text-amber-700">Próximo passo: {gap.remediation}</p></article>) : <p className="text-sm text-slate-500">Nenhuma lacuna declarada.</p>}</div></section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Rastreabilidade ponta a ponta</p><div className="mt-4 grid gap-2 sm:grid-cols-4 xl:grid-cols-7">{stages.map((stage, index) => <div key={stage} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-[10px] font-bold text-slate-400">{String(index + 1).padStart(2, '0')}</p><p className="mt-1 text-xs font-black text-slate-700">{stage}</p></div>)}</div><p className="mt-4 break-all text-[11px] text-slate-400">Hash do snapshot: {model?.state_hash ?? 'indisponível'}</p></section>
        </div>
      </section>

      {selectedFinding ? <div role="dialog" aria-modal="true" aria-label="Evidência do achado" className="fixed inset-0 z-50 grid place-items-center bg-[#07121e]/70 p-4 backdrop-blur-sm"><section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-[#16856b]">Evidência verificável</p><h2 className="mt-2 text-xl font-black">{selectedFinding.topic.replaceAll('_', ' ')}</h2></div><button aria-label="Fechar" onClick={() => setSelectedFinding(null)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl">×</button></div><p className="mt-4 text-sm leading-6 text-slate-700">{selectedFinding.statement}</p><div className="mt-5 space-y-3">{selectedFinding.evidence_sources.map((evidence) => <article key={evidence.artifact_hash} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs"><dl className="space-y-2"><Row label="Fonte" value={evidence.source_id} /><Row label="Atualidade" value={evidence.freshness_status} /><Row label="Localizador" value={evidence.locator} /></dl><p className="mt-3 break-all text-slate-400">{evidence.artifact_hash}</p></article>)}</div><p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Dados sintéticos de homologação. Este achado não sustenta decisão bancária real.</p></section></div> : null}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-3"><dt className="text-slate-400">{label}</dt><dd className="text-right font-bold text-slate-700">{value}</dd></div>; }
function formatDate(value?: string) { if (!value) return '—'; return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
