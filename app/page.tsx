'use client';

import { useMemo, useState } from 'react';

const priorities = [
  { title: 'Renovar limite da Horizonte Logística', detail: 'Vencimento em 6 dias · documentos recebidos', tag: 'Decisão hoje', tone: 'amber' },
  { title: 'Queda de recebíveis na Aurora Foods', detail: '−18% em 30 dias · investigar concentração', tag: 'Risco', tone: 'red' },
  { title: 'Oportunidade de câmbio em 4 empresas', detail: 'Potencial estimado de R$ 84 mil/ano', tag: 'Oportunidade', tone: 'green' },
];

const pipeline = [
  { label: 'Recebidos', value: 12, color: 'bg-sky-500' },
  { label: 'Em análise', value: 7, color: 'bg-violet-500' },
  { label: 'Aguardando você', value: 3, color: 'bg-amber-500' },
  { label: 'Concluídos', value: 28, color: 'bg-emerald-500' },
];

const companies = [
  { name: 'Horizonte Logística', status: 'Atenção', score: 72, trend: '−4' },
  { name: 'Aurora Foods', status: 'Crítico', score: 58, trend: '−11' },
  { name: 'Norte Solar', status: 'Saudável', score: 91, trend: '+6' },
  { name: 'Grupo Vértice', status: 'Saudável', score: 87, trend: '+2' },
];

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-sm text-slate-300">{children}</span>;
}

export default function Home() {
  const [filter, setFilter] = useState<'all' | 'alerts'>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const visibleCompanies = useMemo(() => companies.filter((company) => {
    const matchesFilter = filter === 'all' || company.status !== 'Saudável';
    return matchesFilter && company.name.toLowerCase().includes(query.toLowerCase());
  }), [filter, query]);

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#17202a]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[236px] flex-col bg-[#101b2b] px-4 py-6 text-slate-300 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#28d1a5] font-black text-[#0c2430]">V</div>
          <div><p className="font-semibold tracking-tight text-white">Visão 360</p><p className="text-[11px] text-slate-500">Diretor de carteira</p></div>
        </div>
        <nav className="mt-9 space-y-1 text-sm">
          <a className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 font-medium text-white" href="#"><Mark>◫</Mark> Visão executiva</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5" href="#prioridades"><Mark>⌁</Mark> Prioridades</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5" href="#carteira"><Mark>◎</Mark> Minha carteira</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5" href="#agentes"><Mark>✦</Mark> Central de agentes</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5" href="#documentos"><Mark>▤</Mark> Documentos</a>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#61e3c0]"><span className="h-2 w-2 rounded-full bg-[#28d1a5]" /> Sistema protegido</div>
          <p className="text-xs leading-5 text-slate-400">Acesso privado e ações registradas para auditoria.</p>
        </div>
      </aside>

      <section className="lg:pl-[236px]">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#101b2b] font-bold text-[#28d1a5] lg:hidden">V</div>
            <div><p className="text-xs font-medium uppercase tracking-[0.13em] text-slate-400">Segunda, 24 de agosto</p><h1 className="font-semibold tracking-tight">Bom dia, Rafael</h1></div>
          </div>
          <div className="flex items-center gap-3">
            {searchOpen ? <input autoFocus aria-label="Buscar empresa" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome da empresa..." className="hidden w-52 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-400 sm:block" /> : null}
            <button onClick={() => setSearchOpen((value) => !value)} className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm sm:block">⌕ {searchOpen ? 'Fechar busca' : 'Buscar empresa'}</button>
            <button aria-label="Notificações" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white">●</button>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#dcefe9] text-sm font-bold text-[#176c58]">RF</div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] p-5 md:p-8">
          <section className="relative overflow-hidden rounded-[26px] bg-[#101b2b] p-6 text-white shadow-[0_20px_50px_-32px_#101b2b] md:p-8">
            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[46px] border-[#28d1a5]/10" />
            <div className="relative grid gap-7 xl:grid-cols-[1.45fr_1fr] xl:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#28d1a5]/12 px-3 py-1.5 text-xs font-semibold text-[#61e3c0]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#28d1a5]" /> Diretor analisando sua carteira</div>
                <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.03em] md:text-[34px]">Você tem 3 decisões importantes e uma oportunidade que pode estar passando despercebida.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Cruzei os documentos recebidos, movimentações recentes e compromissos da semana.</p>
              </div>
              <div className="flex flex-wrap gap-3 xl:justify-end">
                <button onClick={() => setBriefingOpen(true)} className="rounded-xl bg-[#28d1a5] px-5 py-3 text-sm font-bold text-[#0d2631] shadow-lg shadow-emerald-950/20">Ver briefing completo</button>
                <button onClick={() => setChatOpen(true)} className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Perguntar ao Diretor</button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Empresas na carteira', '48', '+2 este mês'],
              ['Volume sob gestão', 'R$ 126,4 mi', '+4,8% no trimestre'],
              ['Alertas relevantes', '7', '3 pedem sua decisão'],
              ['Potencial mapeado', 'R$ 312 mil', 'receita anual estimada'],
            ].map(([label, value, note], index) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_-24px_#0f172a]">
                <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${index === 2 ? 'bg-amber-400' : 'bg-emerald-400'}`} /></div>
                <p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p>
              </article>
            ))}
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.32fr_.88fr]">
            <section id="prioridades" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Agora</p><h2 className="mt-1 text-lg font-bold tracking-tight">Prioridades recomendadas</h2></div><button className="text-sm font-semibold text-[#147b65]">Ver todas →</button></div>
              <div className="mt-5 divide-y divide-slate-100">
                {priorities.map((item, index) => (
                  <article key={item.title} className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[42px_1fr_auto] sm:items-center">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl font-bold ${item.tone === 'red' ? 'bg-red-50 text-red-600' : item.tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{index + 1}</div>
                    <div><h3 className="text-sm font-bold text-slate-800">{item.title}</h3><p className="mt-1 text-xs text-slate-400">{item.detail}</p></div>
                    <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${item.tone === 'red' ? 'bg-red-50 text-red-600' : item.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.tag}</span>
                  </article>
                ))}
              </div>
            </section>

            <section id="agentes" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Operação</p><h2 className="mt-1 text-lg font-bold tracking-tight">Central de agentes</h2></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">8 ativos</span></div>
              <div className="mt-5 space-y-4">
                {pipeline.map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-500">{item.label}</span><span className="font-bold text-slate-800">{item.value}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max(18, item.value * 3)}%` }} /></div></div>)}
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><strong className="text-slate-700">Última entrada:</strong> planilha “Carteira_Agosto.xlsx” recebida pelo Telegram há 4 min.</div>
            </section>
          </div>

          <section id="carteira" className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 md:px-6"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Radar</p><h2 className="mt-1 text-lg font-bold tracking-tight">Saúde da carteira</h2></div><div className="flex gap-2 text-xs"><button onClick={() => setFilter('all')} className={`rounded-lg px-3 py-2 font-semibold ${filter === 'all' ? 'bg-[#101b2b] text-white' : 'bg-slate-100 text-slate-500'}`}>Todos</button><button onClick={() => setFilter('alerts')} className={`rounded-lg px-3 py-2 font-semibold ${filter === 'alerts' ? 'bg-[#101b2b] text-white' : 'bg-slate-100 text-slate-500'}`}>Com alertas</button></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3 font-semibold">Empresa</th><th className="px-4 py-3 font-semibold">Situação</th><th className="px-4 py-3 font-semibold">Score 360</th><th className="px-4 py-3 font-semibold">Variação</th><th className="px-6 py-3 text-right font-semibold">Ação</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visibleCompanies.map((company) => <tr key={company.name} className="hover:bg-slate-50/70"><td className="px-6 py-4 font-bold text-slate-800">{company.name}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${company.status === 'Crítico' ? 'bg-red-50 text-red-600' : company.status === 'Atenção' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{company.status}</span></td><td className="px-4 py-4"><div className="flex items-center gap-2"><span className="font-bold">{company.score}</span><div className="h-1.5 w-20 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#28d1a5]" style={{ width: `${company.score}%` }} /></div></div></td><td className={`px-4 py-4 font-bold ${company.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{company.trend}</td><td className="px-6 py-4 text-right"><button onClick={() => setBriefingOpen(true)} className="font-semibold text-[#147b65]">Abrir visão →</button></td></tr>)}
              </tbody>
            </table></div>
          </section>
        </div>
      </section>

      {briefingOpen ? <div role="dialog" aria-modal="true" aria-label="Briefing executivo" className="fixed inset-0 z-50 grid place-items-center bg-[#08111e]/65 p-4 backdrop-blur-sm">
        <section className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-emerald-600">Briefing do Diretor</p><h2 className="mt-2 text-2xl font-bold tracking-tight">O que merece sua atenção hoje</h2></div><button aria-label="Fechar" onClick={() => setBriefingOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-lg">×</button></div>
          <div className="mt-6 space-y-4">
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-bold text-amber-900">1. Proteja a exposição em Aurora Foods</h3><p className="mt-2 text-sm leading-6 text-amber-800">A queda de recebíveis e a concentração sugerem revisar o fluxo antes de qualquer aumento de limite. Confiança: 86%.</p><p className="mt-3 text-xs font-semibold text-amber-700">Evidências: planilha de movimentação · relatório mensal · histórico de limite</p></article>
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="font-bold text-emerald-900">2. Antecipe a conversa de câmbio</h3><p className="mt-2 text-sm leading-6 text-emerald-800">Quatro empresas apresentam fluxo internacional recorrente sem solução consolidada. Priorize Norte Solar e Grupo Vértice.</p></article>
            <article className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-slate-800">3. Feche a renovação da Horizonte</h3><p className="mt-2 text-sm leading-6 text-slate-600">Os documentos essenciais chegaram. Falta confirmar projeção de caixa e registrar sua justificativa para decisão.</p></article>
          </div>
          <p className="mt-5 rounded-xl bg-slate-100 p-3 text-xs leading-5 text-slate-500">Recomendação assistiva: valide os fatos nas fontes originais e siga as políticas internas antes de qualquer decisão bancária.</p>
        </section>
      </div> : null}

      {chatOpen ? <section role="dialog" aria-label="Conversa com o Diretor" className="fixed bottom-4 right-4 z-40 w-[min(390px,calc(100%-32px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-[#101b2b] p-4 text-white"><div><p className="font-bold">Diretor</p><p className="text-xs text-slate-400">Pronto para cruzar as evidências</p></div><button aria-label="Fechar conversa" onClick={() => setChatOpen(false)} className="grid h-8 w-8 place-items-center rounded-full bg-white/10">×</button></header>
        <div className="p-4"><div className="rounded-2xl rounded-tl-sm bg-slate-100 p-3 text-sm leading-6 text-slate-600">Posso explicar um alerta, comparar empresas ou preparar sua próxima conversa. O que você quer enxergar melhor?</div><div className="mt-4 flex gap-2"><input aria-label="Mensagem para o Diretor" placeholder="Digite sua pergunta..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" /><button className="rounded-xl bg-[#28d1a5] px-4 text-sm font-bold text-[#10242c]">Enviar</button></div><p className="mt-2 text-[10px] text-slate-400">Demonstração — a IA será ativada após aprovação de segurança.</p></div>
      </section> : null}
    </main>
  );
}
