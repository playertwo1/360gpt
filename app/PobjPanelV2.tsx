"use client";
import { FormEvent, useEffect, useRef, useState } from "react";

type Suggestion = {
  key: string;
  name: string;
  value: number | null;
  target?: number | null;
  unit: "percent" | "points" | "currency" | "count" | "unknown";
  confidence: string;
  sourceLine: string;
};
type Approved = {
  currentPoints: number;
  targetPoints: number;
  indicators?: Indicator[];
  performanceAnalysis?: Analysis[];
};
type Item = {
  id: string;
  name: string;
  status: string;
  competence: string;
  baseDate: string;
  official: boolean;
  extractionStatus?: string;
  totalPages?: number;
  indicatorSuggestions?: Suggestion[];
  aiStatus?: string;
  aiAnalysis?: { summary?: string; currentPoints?: number | null; targetPoints?: number | null; domains?: string[]; managerBriefs?: Array<{domain:string;diagnosis:string;recommendation:string}>; warnings?: string[] };
  approved?: Approved;
};
type Indicator = {
  key: string;
  name: string;
  value: number;
  unit: "percent" | "points" | "currency" | "count";
  target: number | null;
};
type Analysis = {
  key: string;
  status: "ATINGIDO" | "ATENCAO" | "CRITICO" | "MONITORAR";
  message: string;
};

export default function PobjPanelV2() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<Item | null>(null);
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("1000");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  useEffect(() => {
    reload();
  }, []);
  function reload() {
    fetch("/api/pobj/import")
      .then((r) => r.json())
      .then((data) => setItems(data.imports ?? []))
      .catch(() => setError("Não foi possível carregar os envios."));
  }
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/pobj/import", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setItems((list) => [data.import, ...list]);
      if (data.import.aiAnalysis) openReview(data.import);
      else if (data.import.aiStatus === "queued_async_rebuild") setError("Arquivo recebido e preservado. O processamento assíncrono está em reconstrução; não reenvie o arquivo.");
      else setError("O Diretor IA não concluiu a leitura. O arquivo foi preservado; não é necessário reenviá-lo.");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha no envio");
    } finally {
      setBusy(false);
    }
  }
  function openReview(item: Item) {
    setReview(item);
    setCurrent(String(item.approved?.currentPoints ?? item.aiAnalysis?.currentPoints ?? ""));
    setTarget(String(item.approved?.targetPoints ?? item.aiAnalysis?.targetPoints ?? 1000));
    setIndicators(
      item.approved?.indicators ??
        (item.indicatorSuggestions ?? [])
          .filter((s) => s.value !== null)
          .map((s) => ({
            key: s.key,
            name: s.name,
            value: s.value!,
            unit: s.unit === "unknown" ? "count" : s.unit,
            target: s.target ?? null,
          })),
    );
  }
  async function publish() {
    if (!review) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/pobj/import/${review.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          currentPoints: Number(current),
          targetPoints: Number(target),
          indicators,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setReview(null);
      reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao salvar a pré-revisão");
    } finally {
      setBusy(false);
    }
  }
  const latest = items.find((item) => item.approved?.performanceAnalysis);
  return (
    <div className="space-y-5 px-6">
      <section className="rounded-[30px] bg-[#1d1d1f] p-6">
        <small className="font-bold uppercase tracking-wider text-[#8fb1ff]">
          Gerente de Performance
        </small>
        <h2 className="mt-2 text-2xl font-semibold">Atualizar POBJ</h2>
        <p className="mt-2 text-sm text-[#b9bbc5]">
          Apenas envie o arquivo. O Diretor IA identifica período, indicadores e Gerentes Gerais envolvidos para sua revisão.
        </p>
        <form onSubmit={upload} className="mt-5 space-y-3">
          <input
            ref={fileRef}
            id="pobj-v2-file"
            className="sr-only"
            type="file"
            accept=".pdf,.csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <label
            htmlFor="pobj-v2-file"
            className="flex min-h-20 cursor-pointer items-center rounded-[20px] border border-dashed border-[#62646d] bg-[#272729] p-4"
          >
            <span>
              <b className="block">{file?.name ?? "Escolher POBJ"}</b>
              <small className="text-[#aeb1bd]">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "PDF, CSV, XLSX ou XLS"}
              </small>
            </span>
          </label>
          {error && <p className="text-sm text-[#ffb4ab]">{error}</p>}
          <button
            disabled={!file || busy}
            className="h-14 w-full rounded-full bg-[#568dff] font-bold text-[#071d48] disabled:opacity-40"
          >
            {busy ? "Processando…" : "Enviar e analisar"}
          </button>
        </form>
      </section>
      {latest && (
        <section className="rounded-[28px] bg-[#1d1d1f] p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">Prévia do Performance</h3><small className="rounded-full bg-[#29364e] px-2 py-1 text-[#a9c3ff]">NÃO OFICIAL</small></div>
          <p className="mt-1 text-xs text-[#aeb1bd]">
            Revisão aprovada: {latest.competence} · processada pelo Diretor IA
          </p>
          <div className="mt-4 space-y-2">
            {latest.approved!.performanceAnalysis!.map((result) => {
              const indicator = latest.approved!.indicators?.find(
                (i) => i.key === result.key,
              );
              return (
                <div
                  key={result.key}
                  className="rounded-[18px] bg-[#28282a] p-4"
                >
                  <div className="flex justify-between gap-3">
                    <b>{indicator?.name ?? result.key}</b>
                    <Status value={result.status} />
                  </div>
                  <p className="mt-2 text-xs text-[#b9bbc5]">
                    {result.message}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {items.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-semibold">Envios</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => item.aiAnalysis || item.approved ? openReview(item) : setError("Este envio está preservado e ainda aguarda o processador assíncrono. Não reenvie o arquivo.")}
                className="flex w-full items-center justify-between rounded-[20px] bg-[#1d1d1f] p-4 text-left"
              >
                <span className="min-w-0">
                  <b className="block truncate">{item.name}</b>
                  <small className="text-[#aeb1bd]">
                    {item.competence}
                    {item.totalPages ? ` · ${item.totalPages} pág.` : ""}
                  </small>
                </span>
                <small
                  className={
                    item.official ? "text-[#55eca0]" : "text-[#ffd983]"
                  }
                >
                  {item.status === "processed" ? "CONCLUÍDO" : item.status === "local_reviewed" ? "REVISADO" : item.aiStatus === "completed" || item.status === "ai_review_ready" ? "IA PRONTA" : item.aiStatus === "queued_async_rebuild" ? "RECEBIDO" : item.aiStatus?.startsWith("director_ai_") ? "FALHA IA" : "AGUARDANDO IA"}
                </small>
              </button>
            ))}
          </div>
        </section>
      )}
      {review && (
        <div className="fixed inset-0 z-50 bg-black/80">
          <section className="absolute inset-x-0 bottom-0 mx-auto max-h-[90dvh] max-w-[520px] overflow-y-auto rounded-t-[34px] bg-[#1d1d1f] p-6 pb-10">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#555]" />
            <small className="font-bold uppercase tracking-wider text-[#8fb1ff]">
              Revisão individual
            </small>
            <h2 className="mt-2 text-2xl font-semibold">
              {review.indicatorSuggestions?.length ?? 0} indicadores encontrados
            </h2>
            {review.aiAnalysis?.summary && <div className="mt-4 rounded-[18px] bg-[#202b3d] p-4"><small className="font-bold uppercase text-[#8fb1ff]">Leitura do Diretor IA</small><p className="mt-2 text-sm leading-5 text-[#d5dded]">{review.aiAnalysis.summary}</p>{review.aiAnalysis.domains?.length ? <p className="mt-2 text-xs text-[#9db7ed]">Gerentes acionados: {review.aiAnalysis.domains.join(', ')}</p> : null}</div>}
            {review.aiAnalysis?.managerBriefs?.length ? <div className="mt-3 space-y-2">{review.aiAnalysis.managerBriefs.map((brief) => <article key={brief.domain} className="rounded-[18px] bg-[#28282a] p-4"><small className="font-bold uppercase text-[#a9c3ff]">Gerente {brief.domain}</small><p className="mt-2 text-sm text-[#e5e7ee]">{brief.diagnosis}</p><p className="mt-2 text-xs text-[#b9bbc5]">Recomendação: {brief.recommendation}</p></article>)}</div> : null}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="Pontos atuais">
                <input
                  inputMode="decimal"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Meta total">
                <input
                  inputMode="decimal"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="field"
                />
              </Field>
            </div>
            <div className="mt-5 space-y-3">
              {indicators.map((item, index) => (
                <article
                  key={`${item.key}-${index}`}
                  className="rounded-[20px] bg-[#28282a] p-4"
                >
                  <input
                    aria-label="Nome do indicador"
                    value={item.name}
                    onChange={(e) =>
                      setIndicators((list) =>
                        list.map((v, i) =>
                          i === index ? { ...v, name: e.target.value } : v,
                        ),
                      )
                    }
                    className="w-full bg-transparent font-semibold outline-none"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Valor">
                      <input
                        inputMode="decimal"
                        value={item.value}
                        onChange={(e) =>
                          setIndicators((list) =>
                            list.map((v, i) =>
                              i === index
                                ? { ...v, value: Number(e.target.value) }
                                : v,
                            ),
                          )
                        }
                        className="field"
                      />
                    </Field>
                    <Field label="Meta/limite">
                      <input
                        inputMode="decimal"
                        value={item.target ?? ""}
                        placeholder="Opcional"
                        onChange={(e) =>
                          setIndicators((list) =>
                            list.map((v, i) =>
                              i === index
                                ? {
                                    ...v,
                                    target:
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value),
                                  }
                                : v,
                            ),
                          )
                        }
                        className="field"
                      />
                    </Field>
                  </div>
                  <p className="mt-2 text-[11px] uppercase text-[#9ca0ad]">
                    Unidade: {unitLabel(item.unit)}
                  </p>
                </article>
              ))}
            </div>
            {review.indicatorSuggestions?.length === 0 && (
              <p className="mt-5 rounded-[18px] bg-[#31291a] p-4 text-sm text-[#ffd983]">
                Nenhum indicador foi reconhecido com valor. Você ainda pode
                aprovar apenas a pontuação total.
              </p>
            )}
            {error && <p className="mt-3 text-sm text-[#ffb4ab]">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setReview(null)}
                className="h-14 flex-1 rounded-full bg-[#343436] font-bold"
              >
                Voltar
              </button>
              {!review.official && (
                <button
                  disabled={!current || !target || busy}
                  onClick={publish}
                  className="h-14 flex-[1.5] rounded-full bg-[#568dff] font-bold text-[#071d48] disabled:opacity-40"
                >
                  Salvar pré-revisão
                </button>
              )}
            </div>
          </section>
        </div>
      )}
      <style jsx>{`
        .field {
          margin-top: 8px;
          height: 48px;
          width: 100%;
          border-radius: 16px;
          background: #2a2a2c;
          padding: 0 12px;
          color: white;
          outline: none;
        }
      `}</style>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs text-[#b9bbc5]">
      {label}
      {children}
    </label>
  );
}
function Status({ value }: { value: Analysis["status"] }) {
  const style =
    value === "ATINGIDO"
      ? "bg-[#0e452d] text-[#55eca0]"
      : value === "CRITICO"
        ? "bg-[#4b1f24] text-[#ffb4ab]"
        : value === "ATENCAO"
          ? "bg-[#493a15] text-[#ffd983]"
          : "bg-[#29364e] text-[#a9c3ff]";
  return (
    <small className={`shrink-0 rounded-full px-2 py-1 ${style}`}>
      {value}
    </small>
  );
}
function unitLabel(unit: Indicator["unit"]) {
  return {
    percent: "percentual",
    points: "pontos",
    currency: "reais",
    count: "quantidade",
  }[unit];
}
