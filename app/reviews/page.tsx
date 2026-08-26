'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Review = {
  review_request_id: string; reason_code: string; review_priority: string; status: string; owner_queue: string;
  assigned_to: string | null; escalation_level: number; problem_statement: string; impact: string; required_decision: string;
  suggested_checks: unknown[]; allowed_resolutions: unknown[]; due_at: string | null; sla_state: string;
};
type ReviewResponse = { ok: boolean; reviews?: Review[]; error?: string };

export default function ReviewConsole() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [rationales, setRationales] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews?tenant_id=tenant-demo&status=OPEN', { cache: 'no-store' });
      const body = await response.json() as ReviewResponse;
      if (!response.ok || !body.ok) throw new Error(body.error || 'review_list_failed');
      setReviews(body.reviews ?? []);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível carregar a fila.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void refresh(), 0); return () => window.clearTimeout(timer); }, [refresh]);

  async function transition(review: Review, action: string) {
    setWorking(review.review_request_id); setMessage('');
    try {
      const response = await fetch(`/api/reviews/${review.review_request_id}`, {
        method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action }),
      });
      const body = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) throw new Error(body.error || 'transition_failed');
      setMessage('Transição registrada com auditoria.'); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Transição não concluída.'); }
    finally { setWorking(null); }
  }

  async function resolve(review: Review) {
    const rationale = (rationales[review.review_request_id] ?? '').trim();
    if (rationale.length < 10) { setMessage('Registre uma justificativa humana com pelo menos 10 caracteres.'); return; }
    setWorking(review.review_request_id); setMessage('');
    try {
      const response = await fetch(`/api/reviews/${review.review_request_id}/resolve`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
          decision: 'RESOLVED_CONFIRMED', rationale, new_evidence_sources: [], next_action: 'NO_ACTION_REQUIRED',
        }),
      });
      const body = await response.json() as { ok?: boolean; error?: string; resolution_hash?: string };
      if (!response.ok || !body.ok) throw new Error(body.error || 'resolution_failed');
      setMessage(`Resolução imutável registrada: ${body.resolution_hash ?? 'hash confirmado'}`); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Resolução não concluída.'); }
    finally { setWorking(null); }
  }

  return (
    <main className="min-h-screen bg-[#f3f6f7] text-[#14212b]">
      <header className="border-b border-slate-200 bg-[#0d1c2b] px-5 py-6 text-white md:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#65e5c3]">Central de Revisão 360</p><h1 className="mt-2 text-2xl font-black tracking-tight">Mesa do revisor autorizado</h1><p className="mt-2 text-sm text-slate-400">Somente dados sintéticos · nenhuma execução externa permitida</p></div>
          <Link href="/" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold">Voltar ao Dashboard</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Fila determinística</p><h2 className="mt-1 text-xl font-black">Revisões abertas</h2></div><button onClick={() => void refresh()} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50">{loading ? 'Atualizando…' : 'Atualizar fila'}</button></div>
        {message ? <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">{message}</p> : null}
        <div className="mt-5 space-y-4">
          {reviews.map((review) => <article key={review.review_request_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">{review.review_priority}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{review.status}</span><span className="px-1 py-1 text-xs text-slate-400">{review.owner_queue}</span></div><h3 className="mt-3 text-lg font-black">{review.reason_code}</h3></div><div className="text-right text-xs text-slate-400"><p>SLA: {review.sla_state}</p><p className="mt-1">Escalonamento: {review.escalation_level}/3</p></div></div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{review.problem_statement}</p><p className="mt-2 text-sm leading-6 text-slate-500"><strong>Decisão necessária:</strong> {review.required_decision}</p><p className="mt-2 text-xs leading-5 text-slate-400"><strong>Impacto:</strong> {review.impact}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['PENDING_TRIAGE', 'ESCALATED', 'MORE_DATA_REQUIRED'].includes(review.status) ? <button disabled={working === review.review_request_id} onClick={() => void transition(review, 'ASSIGN_TO_ME')} className="rounded-xl bg-[#0d1c2b] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Assumir revisão</button> : null}
              {review.status === 'ASSIGNED' ? <button disabled={working === review.review_request_id} onClick={() => void transition(review, 'START_REVIEW')} className="rounded-xl bg-[#0d1c2b] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Iniciar análise</button> : null}
              {review.status !== 'IN_REVIEW' ? <button disabled={working === review.review_request_id || review.escalation_level >= 3} onClick={() => void transition(review, 'ESCALATE')} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50">Escalonar</button> : null}
            </div>
            {review.status === 'IN_REVIEW' ? <div className="mt-5 rounded-2xl bg-slate-50 p-4"><label className="text-sm font-black" htmlFor={`rationale-${review.review_request_id}`}>Justificativa humana</label><textarea id={`rationale-${review.review_request_id}`} value={rationales[review.review_request_id] ?? ''} onChange={(event) => setRationales((current) => ({ ...current, [review.review_request_id]: event.target.value }))} placeholder="Explique por que a finalidade sintética foi confirmada." className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#28d1a5]" /><button disabled={working === review.review_request_id} onClick={() => void resolve(review)} className="mt-3 rounded-xl bg-[#16856b] px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Registrar confirmação sintética</button><p className="mt-2 text-xs text-slate-400">A ação somente registra a decisão e o hash. Não reprocessa nem executa transações.</p></div> : null}
          </article>)}
          {!loading && reviews.length === 0 ? <p className="rounded-2xl bg-emerald-50 p-5 text-sm font-bold text-emerald-800">Nenhuma revisão aberta.</p> : null}
        </div>
      </section>
    </main>
  );
}
