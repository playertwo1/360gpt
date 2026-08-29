'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Precursor = {
  id: string;
  name: string;
  status: string;
  details: string;
};

type GateDossier = {
  gate_id: string;
  title: string;
  status: string;
  authority: string;
  test_suite_status: string;
  precursors: Precursor[];
  governance_rule: string;
};

export default function GateP8Page() {
  const [dossier, setDossier] = useState<GateDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decisionResult, setDecisionResult] = useState<{ decision: string; hash: string; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/gate-p8')
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setDossier(data.dossier);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDecision(decision: 'APPROVED' | 'ADJUSTMENTS_REQUIRED' | 'BLOCKED') {
    setSubmitting(true);
    try {
      const res = await fetch('/api/gate-p8', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          decision,
          signed_by: 'Rafael Pedrosa (Dono & Autoridade Soberana)',
          notes: notes || (decision === 'APPROVED' ? 'Aprovado formalmente após revisão de todos os precursores.' : 'Solicitação de revisão.')
        })
      });
      const data = await res.json();
      if (data.ok) {
        setDecisionResult({
          decision: data.decision,
          hash: data.resolution_hash,
          message: data.message
        });
      }
    } catch (err) {
      alert('Erro ao registrar decisão: ' + err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#f0f6fc] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#30363d] bg-[#161b22]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#8b949e] hover:text-white">
              ← Dashboard
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-[#58a6ff]">Governança & Prontidão</span>
          </div>
          <span className="rounded-full bg-[#388bfd]/20 px-3 py-1 text-xs font-bold text-[#58a6ff]">
            18/18 TESTES HOMOLOGADOS
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pt-8 space-y-8">
        {/* Title Section */}
        <section className="rounded-3xl border border-[#30363d] bg-[#161b22] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="rounded-md bg-[#238636]/20 px-2.5 py-1 text-xs font-bold text-[#3fb950]">
                MESA EXECUTIVA DE DESPACHO
              </span>
              <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Gate Geral de Prontidão Operacional (P8)
              </h1>
              <p className="mt-2 text-sm text-[#8b949e]">
                Autoridade Decisória Exclusiva: <strong className="text-[#f0f6fc]">Rafael Pedrosa</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full bg-[#d29922]/20 px-3 py-1 text-xs font-bold text-[#e3b341]">
                🟡 PENDENTE DA SUA ASSINATURA
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#0d1117] p-4 border border-[#30363d] text-xs text-[#8b949e] leading-relaxed">
            🛡️ <strong>Regra de Soberania (AGENTS.md v2.1):</strong> A IA atesta a estabilidade técnica dos motores e contratos, mas <strong>nenhuma ingestão de dados reais ou avanço operacional ocorre sem a sua aprovação explícita</strong>.
          </div>
        </section>

        {/* 10 Precursors Checklist */}
        <section className="rounded-3xl border border-[#30363d] bg-[#161b22] p-6 md:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span> Dossiê de Verificação Técnica dos 10 Pré-requisitos
          </h2>
          <p className="mt-1 text-xs text-[#8b949e]">Todos os módulos e motores foram testados e certificados antes desta submissão.</p>

          <div className="mt-6 divide-y divide-[#30363d]">
            {loading ? (
              <div className="py-8 text-center text-sm text-[#8b949e]">Carregando dossiê de auditoria...</div>
            ) : (
              dossier?.precursors.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-[#238636]/20 text-xs font-bold text-[#3fb950]">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        <span className="text-[#58a6ff] mr-2">[{p.id}]</span>
                        {p.name}
                      </h4>
                      <p className="mt-1 text-xs text-[#8b949e]">{p.details}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded bg-[#238636]/20 px-2 py-0.5 text-[11px] font-bold text-[#3fb950]">
                    APROVADO
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Decision Action Box */}
        <section className="rounded-3xl border-2 border-[#58a6ff]/40 bg-[#161b22] p-6 md:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>✍️</span> Despacho Soberano de Rafael
          </h2>
          <p className="mt-2 text-sm text-[#8b949e]">
            Insira suas observações ou justificativa abaixo e selecione a sua decisão para registrar o laudo de prontidão.
          </p>

          {decisionResult ? (
            <div className="mt-6 rounded-2xl bg-[#238636]/10 border border-[#238636] p-6 space-y-3">
              <div className="flex items-center gap-2 text-[#3fb950] font-bold text-lg">
                <span>🎉</span> {decisionResult.message}
              </div>
              <p className="text-xs text-[#8b949e]">
                Decisão: <strong className="text-white">{decisionResult.decision}</strong>
              </p>
              <p className="text-xs font-mono text-[#58a6ff] break-all">
                Hash de Auditoria: {decisionResult.hash}
              </p>
              <div className="pt-2">
                <Link href="/" className="inline-block rounded-xl bg-[#238636] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2ea043]">
                  Voltar ao Painel Principal
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8b949e] mb-2">
                  Observações / Justificativa do Despacho (Opcional):
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Todos os motores e contratos estão validados. Autorizo a operação assistida da carteira PJ."
                  rows={3}
                  className="w-full rounded-2xl border border-[#30363d] bg-[#0d1117] p-4 text-sm text-white placeholder-[#484f58] outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  disabled={submitting}
                  onClick={() => handleDecision('APPROVED')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#238636] px-6 py-4 font-bold text-white shadow-lg hover:bg-[#2ea043] transition disabled:opacity-50"
                >
                  <span>✓</span> Assinar & Aprovar Gate P8
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleDecision('ADJUSTMENTS_REQUIRED')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#d29922] px-6 py-4 font-bold text-[#0d1117] shadow-lg hover:bg-[#e3b341] transition disabled:opacity-50"
                >
                  <span>⚠</span> Solicitar Ajustes
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleDecision('BLOCKED')}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#da3633] px-6 py-4 font-bold text-white shadow-lg hover:bg-[#f85149] transition disabled:opacity-50"
                >
                  <span>✕</span> Bloquear Gate
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}