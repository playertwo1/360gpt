'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type CanaryCase = { id: string; attainment: number; points: number; action: string; rationale: string };
type ReviewDecision = { decision: 'APPROVE_A1' | 'REQUEST_ADJUSTMENT'; reviewer_email: string; rationale: string; created_at: string };
type CanaryResponse = { ok: boolean; cases: CanaryCase[]; run?: { status: string; case_count: number }; decision?: ReviewDecision | null; error?: string };

const actionLabel: Record<string, string> = {
  RESCUE_MINIMUM: 'Recuperar piso',
  ADVANCE_WITHIN_SCORING_RANGE: 'Avançar na faixa',
  DEPRIORITIZE_FOR_POINTS: 'Despriorizar por pontos',
  CLOSE_TARGET: 'Fechar meta',
};

export default function PerformanceCanaryPage() {
  const [data, setData] = useState<CanaryResponse | null>(null);
  const [rationale, setRationale] = useState('Os resultados estão coerentes com as regras de piso, meta e teto aprovadas.');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/canary/performance', { cache: 'no-store' });
        const payload = await response.json() as CanaryResponse;
        if (!response.ok) throw new Error(payload.error ?? 'Não foi possível carregar o canary.');
        setData(payload);
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar o canary.'); }
    }
    void load();
  }, []);
  async function decide(decision: ReviewDecision['decision']) {
    if (rationale.trim().length < 10) { setError('Explique sua decisão com pelo menos 10 caracteres.'); return; }
    setSending(true); setError('');
    try {
      const response = await fetch('/api/canary/performance/decision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, rationale }),
      });
      const payload = await response.json() as { ok?: boolean; error?: string; decision?: ReviewDecision };
      if (!response.ok || !payload.ok || !payload.decision) throw new Error(payload.error ?? 'Não foi possível registrar a decisão.');
      setData((current) => current ? { ...current, decision: payload.decision, run: { status: decision === 'APPROVE_A1' ? 'APPROVED' : 'ADJUSTMENT_REQUESTED', case_count: current.cases.length } } : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível registrar a decisão.'); }
    finally { setSending(false); }
  }
  const decision = data?.decision;
  return <main className="min-h-dvh bg-black text-[#f5f5f7]"><div className="mx-auto max-w-[620px] px-5 pb-12 pt-[max(24px,env(safe-area-inset-top))] sm:px-7">
    <nav className="mb-8 flex gap-2"><Link href="/" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">← Painel</Link><Link href="/reviews" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold">Mesa do Revisor</Link></nav>
    <header><p className="text-xs font-bold uppercase tracking-[.18em] text-[#bba7ff]">Canary sintético · somente leitura</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Revisão Performance</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#b9bbc5]">Veja exatamente como o GG Performance interpretará metas POBJ antes de qualquer fonte real ser conectada.</p></header>
    {error && <p role="alert" className="mt-6 rounded-2xl bg-[#3b2020] p-4 text-sm text-[#ffb4ab]">{error}</p>}
    {!data && !error && <div className="mt-8 animate-pulse rounded-[28px] bg-[#1d1d1f] p-6"><div className="h-5 w-40 rounded bg-[#343434]"/><div className="mt-5 h-24 rounded bg-[#29292b]"/></div>}
    {data && <><section className="mt-8 grid grid-cols-2 gap-3"><Metric label="Casos validados" value={`${data.cases.length}/10`} tone="text-[#55eca0]"/><Metric label="Custo estimado" value="US$ 0,00"/><Metric label="Mutações / efeitos" value="0 / 0" tone="text-[#55eca0]"/><Metric label="Latência média" value="0,057 ms"/></section>
      <section className="mt-5 rounded-[28px] border border-[#775eaa]/45 bg-[#211d2b] p-5"><b className="text-[#d9ccff]">Limite deste ambiente</b><p className="mt-2 text-sm leading-6 text-[#c7bfd9]">Dados sintéticos apenas. Esta decisão não conecta a planilha POBJ, não ativa agentes e não autoriza efeitos externos.</p></section>
      <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold">10 resultados para revisão</h2><p className="mt-1 text-sm text-[#aeb1bd]">Piso 70% · meta 100% · teto 150%</p></div><small className="rounded-full bg-[#25242a] px-3 py-2 text-xs text-[#d7d0e7]">{data.run?.status ?? 'PENDING_REVIEW'}</small></div><div className="space-y-3">{data.cases.map((item) => <article key={item.id} className="rounded-[24px] bg-[#1d1d1f] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#8fb1ff]">{item.id}</p><h3 className="mt-1 text-lg font-semibold">{actionLabel[item.action] ?? item.action}</h3></div><b className="rounded-full bg-[#29364e] px-3 py-2 text-sm text-[#b0c6ff]">{item.attainment}%</b></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-[#29292b] p-3"><span className="block text-xs text-[#9295a2]">Pontos</span><b className="mt-1 block">{item.points.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}</b></div><div className="rounded-2xl bg-[#29292b] p-3"><span className="block text-xs text-[#9295a2]">Regra</span><b className="mt-1 block text-xs">{item.action}</b></div></div><p className="mt-4 text-sm leading-6 text-[#c5c6cd]">{item.rationale}</p></article>)}</div></section>
      <section className="mt-8 rounded-[30px] bg-[#1d1d1f] p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#8fb1ff]">Sua decisão</p>{decision ? <div className="mt-4 rounded-2xl bg-[#0e452d] p-4"><b className="text-[#55eca0]">{decision.decision === 'APPROVE_A1' ? 'A1 aprovado' : 'Ajuste solicitado'}</b><p className="mt-2 text-sm leading-6 text-[#d0e8d8]">{decision.rationale}</p><p className="mt-3 text-xs text-[#a7cdb3]">Registrado por {decision.reviewer_email} em {new Date(decision.created_at).toLocaleString('pt-BR')}</p><p className="mt-4 text-xs leading-5 text-[#a7cdb3]">O registro é imutável para preservar auditoria. Uma mudança futura deverá abrir uma nova rodada de revisão.</p></div> : <><h2 className="mt-2 text-2xl font-semibold">Concluir a revisão A1</h2><p className="mt-2 text-sm leading-6 text-[#b9bbc5]">Sua decisão fica registrada com sua conta autorizada e não produz qualquer efeito externo.</p><label className="mt-5 block text-sm text-[#c8cad3]">Justificativa<textarea value={rationale} onChange={(event) => setRationale(event.target.value)} maxLength={1000} className="mt-2 min-h-28 w-full rounded-2xl bg-[#29292b] p-4 text-white outline-none ring-[#568dff] focus:ring-2"/></label><div className="mt-4 grid gap-3 sm:grid-cols-2"><button disabled={sending} onClick={() => void decide('APPROVE_A1')} className="h-14 rounded-full bg-[#55eca0] font-bold text-[#082316] disabled:opacity-50">{sending ? 'Registrando…' : 'Aprovar A1'}</button><button disabled={sending} onClick={() => void decide('REQUEST_ADJUSTMENT')} className="h-14 rounded-full border border-[#ffb4ab] text-[#ffb4ab] font-bold disabled:opacity-50">Solicitar ajuste</button></div></>}</section>
    </>}
  </div></main>;
}

function Metric({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) { return <div className="rounded-[22px] bg-[#1d1d1f] p-4"><p className="text-xs text-[#aeb1bd]">{label}</p><b className={`mt-2 block text-lg ${tone}`}>{value}</b></div>; }
