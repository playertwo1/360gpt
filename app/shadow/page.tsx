'use client';

import { useCallback, useEffect, useState } from 'react';

type Observation = { release_id: string; observed_at: string; total_cases: number; completed_cases: number; equivalence_rate: number; pause_required: boolean };
type Monitor = { target_observations: number; observations: number; remaining_observations: number; window_complete: boolean; latest_observed_at: string | null; next_measurement_due_at: string | null; stale: boolean; gaps: { after: string; before: string; interval_minutes: number }[]; completion_rate: number | null; divergence_rate: number | null; pause_required: boolean; healthy: boolean; alerts: string[]; totals: { cases: number; completed: number; errors: number; mutations: number; externalEffects: number } };
type Response = { ok: boolean; observations?: Observation[]; monitor?: Monitor; error?: string };

export default function ShadowMetricsPage() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await (await fetch('/api/metrics/shadow', { cache: 'no-store' })).json() as Response); }
    catch { setData({ ok: false, error: 'Não foi possível consultar a telemetria.' }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);
  const monitor = data?.monitor;
  const latest = data?.observations?.[0];
  return <main className="min-h-screen bg-[#f1f5f9] text-[#0f172a]">
    <header className="border-b border-slate-200 bg-[#0b1727] px-6 py-5 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-300">Diretor 360</p><h1 className="mt-1 text-2xl font-black">Métricas Shadow</h1></div>
        <nav className="flex gap-2"><a href="/" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">Visão Executiva</a><a href="/reviews" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">Mesa do Revisor</a></nav>
      </div>
    </header>
    <section className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet-500">Janela sintética de 24 horas</p><h2 className="mt-1 text-2xl font-black">Observação da versão candidata</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">Esta aba concentra a telemetria operacional. Ela não altera o Estado 360, respostas ou ações externas.</p></div><Status monitor={monitor} loading={loading} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Medições" value={`${monitor?.observations ?? 0} / ${monitor?.target_observations ?? 24}`} detail={`${monitor?.remaining_observations ?? 24} restantes`} />
        <Card label="Conclusão agregada" value={percent(monitor?.completion_rate)} detail={`${monitor?.totals.completed ?? 0}/${monitor?.totals.cases ?? 0} casos`} />
        <Card label="Divergência" value={percent(monitor?.divergence_rate)} detail="Pausa acima de 10%" />
        <Card label="Efeitos proibidos" value={String((monitor?.totals.mutations ?? 0) + (monitor?.totals.externalEffects ?? 0))} detail="Estado + efeitos externos" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-black">Coleta</h3><dl className="mt-4 space-y-3 text-sm"><Row label="Última medição" value={date(monitor?.latest_observed_at)} /><Row label="Próxima prevista" value={date(monitor?.next_measurement_due_at)} /><Row label="Lacunas horárias" value={String(monitor?.gaps.length ?? 0)} /><Row label="Release" value={latest?.release_id ?? '—'} /></dl></section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-black">Alertas automáticos</h3>{monitor?.alerts.length ? <ul className="mt-4 space-y-2">{monitor.alerts.map((alert) => <li key={alert} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">{alert}</li>)}</ul> : <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">Nenhum alerta ativo.</p>}</section>
      </div>
      <button onClick={() => void refresh()} disabled={loading} className="rounded-xl bg-[#0b1727] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{loading ? 'Atualizando…' : 'Atualizar métricas'}</button>
    </section>
  </main>;
}

function Card({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-3xl font-black text-violet-900">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{detail}</p></article>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-slate-100 pb-3"><dt className="text-slate-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>; }
function Status({ monitor, loading }: { monitor?: Monitor; loading: boolean }) { const unsafe = monitor?.pause_required; return <span className={`rounded-full border px-3 py-1 text-xs font-black ${unsafe ? 'border-rose-300 bg-rose-100 text-rose-800' : monitor ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-300 bg-slate-100 text-slate-600'}`}>{loading ? 'ATUALIZANDO' : unsafe ? 'PAUSA OBRIGATÓRIA' : monitor?.healthy ? 'SAUDÁVEL' : 'EM OBSERVAÇÃO'}</span>; }
function percent(value?: number | null) { return value === null || value === undefined ? '—' : `${(value * 100).toFixed(1)}%`; }
function date(value?: string | null) { return value ? new Date(value).toLocaleString('pt-BR') : '—'; }
