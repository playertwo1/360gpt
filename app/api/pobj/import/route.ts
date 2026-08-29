import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';
import { strFromU8, unzipSync } from 'fflate';
import { isDenied, requireDashboardReader } from '../../reviews/shared';
import { analyzeWithDirector } from '../../../../lib/director-ai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'application/vnd.ms-excel': ['xls'],
  'text/csv': ['csv'],
};

export async function GET() {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;
  const result = await env.DB.prepare(`SELECT id, original_name, mime_type, content_hash, raw_text, status, received_at
    FROM documents WHERE owner_id = ? AND source = 'pobj_mobile' ORDER BY received_at DESC LIMIT 10`)
    .bind(access.userId).all<ImportRow>();
  return NextResponse.json({ ok: true, imports: (result.results ?? []).map(toImport) }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const access = await requireDashboardReader();
  if (isDenied(access)) return access;
  if (!env.DB || !env.FILES) return NextResponse.json({ ok: false, error: 'storage_unavailable' }, { status: 503 });

  let form: FormData;
  try { form = await request.formData(); } catch { return invalid('invalid_form'); }
  const file = form.get('file');
  const competence = String(form.get('competence') ?? '').trim();
  const baseDate = String(form.get('baseDate') ?? '').trim();
  if (!(file instanceof File)) return invalid('file_required');
  if (competence && !/^\d{4}-(0[1-9]|1[0-2])$/.test(competence)) return invalid('invalid_competence');
  if (baseDate && (!/^\d{4}-\d{2}-\d{2}$/.test(baseDate) || Number.isNaN(Date.parse(`${baseDate}T00:00:00Z`)))) return invalid('invalid_base_date');
  if (!file.size || file.size > MAX_FILE_BYTES) return NextResponse.json({ ok: false, error: 'invalid_file_size' }, { status: 413 });

  const mime = file.type.toLowerCase();
  const extension = file.name.toLowerCase().split('.').pop() ?? '';
  if (!(ALLOWED_TYPES[mime] ?? []).includes(extension)) return NextResponse.json({ ok: false, error: 'file_type_not_allowed' }, { status: 415 });

  const bytes = await file.arrayBuffer();
  if (!contentMatches(bytes, mime)) return invalid('file_content_mismatch');
  // R0 safety gate: synchronous AI is legacy and remains disabled by default.
  const synchronousAiEnabled = env.DIRECTOR_SYNC_AI_ENABLED === 'true';
  const aiBytes = synchronousAiEnabled ? bytes.slice(0) : null;
  const hash = `sha256:${await sha256Hex(bytes)}`;
  const duplicate = await env.DB.prepare(`SELECT id, original_name, mime_type, content_hash, raw_text, status, received_at FROM documents WHERE owner_id = ? AND content_hash = ? AND source IN ('pobj_mobile','telegram') ORDER BY received_at DESC LIMIT 1`).bind(access.userId, hash).first<ImportRow>();
  const now = Date.now();
  const id = `pobj-${crypto.randomUUID()}`;
  const runId = `pobj-run-${crypto.randomUUID()}`;
  const storageKey = `pobj/${access.userId}/${new Date(now).toISOString().slice(0, 10)}/${id}.${extension}`;
  const extraction = await extractContent(bytes, mime);
  let aiStatus = 'queued_async_rebuild'; let aiAnalysis: Awaited<ReturnType<typeof analyzeWithDirector>> extends { analysis: infer T } ? T | undefined : never;
  if (synchronousAiEnabled && aiBytes) {
    const learningExamples = await loadLearningExamples(access.userId);
    try {
      const ai = await analyzeWithDirector({ bytes: aiBytes, mime, fileName: file.name, extractedText: extraction.modelText ?? extraction.previewLines.join('\n'), learningExamples });
      aiStatus = ai.status;
      if (ai.status === 'completed') aiAnalysis = ai.analysis;
    } catch (error) { aiStatus = error instanceof Error ? error.message.slice(0, 80) : 'director_ai_failed'; }
  }
  if (aiAnalysis) extraction.indicatorSuggestions = aiAnalysis.indicators.map((item) => ({ key:item.key, name:item.name, value:item.realizado, target:item.meta, unit:item.unit, confidence:item.confidence >= 0.8 ? 'high' : 'medium', sourceLine:item.evidence }));
  const inferred = inferPeriod(extraction.previewLines);
  const resolvedCompetence = competence || (aiAnalysis?.competence !== 'UNKNOWN' ? aiAnalysis?.competence : undefined) || inferred.competence || 'UNKNOWN';
  const resolvedBaseDate = baseDate || (aiAnalysis?.baseDate !== 'UNKNOWN' ? aiAnalysis?.baseDate : undefined) || inferred.baseDate || 'UNKNOWN';
  const safeExtraction = { extractionStatus: extraction.extractionStatus, totalPages: extraction.totalPages, previewLines: extraction.previewLines, candidateLines: extraction.candidateLines, indicatorSuggestions: extraction.indicatorSuggestions };
  const metadata = { competence: resolvedCompetence, baseDate: resolvedBaseDate, inferredPeriod: !competence || !baseDate, size: file.size, reviewRequired: true, official: false, aiStatus, aiAnalysis, ...safeExtraction };

  if (duplicate) {
    let previous: Record<string, unknown> = {}; try { previous = JSON.parse(duplicate.raw_text ?? '{}') as Record<string, unknown>; } catch { /* ignore invalid legacy metadata */ }
    const updated = JSON.stringify({ ...previous, ...metadata });
    const nextStatus = aiAnalysis && duplicate.status !== 'processed' ? 'ai_review_ready' : duplicate.status;
    await env.DB.prepare('UPDATE documents SET raw_text = ?, status = ? WHERE id = ? AND owner_id = ?').bind(updated, nextStatus, duplicate.id, access.userId).run();
    return NextResponse.json({ ok: true, duplicate: true, import: toImport({ ...duplicate, raw_text: updated, status: nextStatus }) }, { status: 200 });
  }

  await env.FILES.put(storageKey, bytes, {
    httpMetadata: { contentType: mime },
    customMetadata: { sha256: hash, competence: resolvedCompetence, baseDate: resolvedBaseDate, contentTrust: 'UNTRUSTED' },
  });
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO documents (id, owner_id, source, source_message_id, original_name, mime_type, storage_key, content_hash, raw_text, status, received_at)
        VALUES (?, ?, 'pobj_mobile', ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, access.userId, id, safeName(file.name), mime, storageKey, hash, JSON.stringify(metadata), aiAnalysis ? 'ai_review_ready' : 'received', now),
      env.DB.prepare(`INSERT INTO agent_runs (id, document_id, agent_role, status, input_summary, attempt_count, available_at)
        VALUES (?, ?, 'diretor', ?, ?, 0, ?)`).bind(runId, id, aiAnalysis ? 'SUCCEEDED' : 'QUEUED', aiAnalysis ? `Diretor IA analisou o POBJ e acionou: ${aiAnalysis.domains.join(', ')}.` : `Documento ${resolvedCompetence} recebido e preservado para processamento assíncrono.`, now),
      env.DB.prepare(`INSERT INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at)
        VALUES (?, ?, ?, 'ingested_and_enqueued', 'agent_run', ?, ?, ?)`).bind(`audit-${crypto.randomUUID()}`, access.userId, `chatgpt:${access.email}`, runId, JSON.stringify({ documentId:id, channel:'site', competence:resolvedCompetence, baseDate:resolvedBaseDate, hash, contentTrust:'UNTRUSTED', externalEffectsAllowed:false }), now),
    ]);
  } catch (error) {
    await env.FILES.delete(storageKey);
    throw error;
  }

  return NextResponse.json({ ok: true, queued: !aiAnalysis, jobId: runId, import: { id, name: safeName(file.name), mime, hash, competence: resolvedCompetence, baseDate: resolvedBaseDate, size: file.size, status: aiAnalysis ? 'ai_review_ready' : 'received', receivedAt: new Date(now).toISOString(), official: false, pipeline: aiAnalysis ? 'director_ai' : 'awaiting_ai', aiStatus, aiAnalysis, ...safeExtraction } }, { status: 202 });
}

type ImportRow = { id: string; original_name: string | null; mime_type: string | null; content_hash: string | null; raw_text: string | null; status: string; received_at: number };
function toImport(row: ImportRow) {
  let meta: Record<string, unknown> = {};
  try { meta = JSON.parse(row.raw_text ?? '{}') as Record<string, unknown>; } catch { /* metadata remains empty */ }
  return { id: row.id, name: row.original_name, mime: row.mime_type, hash: row.content_hash, status: row.status, receivedAt: new Date(row.received_at).toISOString(), competence: meta.competence, baseDate: meta.baseDate, size: meta.size, official: row.status === 'published', pipeline: row.status === 'processed' ? 'n8n_processed' : meta.aiStatus === 'completed' ? 'director_ai' : 'awaiting_ai', aiStatus: meta.aiStatus, aiAnalysis: meta.aiAnalysis, extractionStatus: meta.extractionStatus, totalPages: meta.totalPages, previewLines: meta.previewLines, candidateLines: meta.candidateLines, indicatorSuggestions: meta.indicatorSuggestions, approved: meta.approved ?? meta.localReview };
}
async function loadLearningExamples(ownerId: string) {
  const result = await env.DB.prepare(`SELECT raw_text FROM documents WHERE owner_id = ? AND source = 'pobj_mobile' AND status IN ('local_reviewed','processed') ORDER BY received_at DESC LIMIT 5`).bind(ownerId).all<{ raw_text: string | null }>();
  return (result.results ?? []).map((row) => { try { const data = JSON.parse(row.raw_text ?? '{}') as { localReview?: unknown }; return data.localReview ? JSON.stringify(data.localReview).slice(0, 4000) : ''; } catch { return ''; } }).filter(Boolean);
}
function invalid(error: string) { return NextResponse.json({ ok: false, error }, { status: 400 }); }
function safeName(value: string) { return value.normalize('NFKC').replace(/[\\/\u0000-\u001f]/g, '_').slice(0, 120); }
function contentMatches(value: ArrayBuffer, mime: string) {
  const bytes = new Uint8Array(value); const starts = (s: number[]) => s.every((b, i) => bytes[i] === b);
  if (mime === 'application/pdf') return starts([0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return starts([0x50, 0x4b, 0x03, 0x04]);
  if (mime === 'application/vnd.ms-excel') return starts([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  return mime === 'text/csv' && !bytes.slice(0, Math.min(bytes.length, 8192)).includes(0);
}
async function sha256Hex(value: ArrayBuffer) { const digest = await crypto.subtle.digest('SHA-256', value); return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join(''); }

type IndicatorSuggestion = { key: string; name: string; value: number | null; target?: number | null; unit: 'percent' | 'points' | 'currency' | 'count' | 'unknown'; confidence: 'high' | 'medium'; sourceLine: string };

async function extractContent(bytes: ArrayBuffer, mime: string): Promise<{ extractionStatus: string; totalPages?: number; previewLines: string[]; candidateLines?: string[]; indicatorSuggestions?: IndicatorSuggestion[]; modelText?: string }> {
  try {
    let content = ''; let totalPages: number | undefined;
    if (mime === 'application/pdf') {
      const pdf = await getDocumentProxy(new Uint8Array(bytes)); const result = await extractText(pdf, { mergePages: true });
      content = typeof result.text === 'string' ? result.text : result.text.join('\n'); totalPages = result.totalPages; await pdf.destroy();
    } else if (mime === 'text/csv') content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    else if (mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') content = extractXlsxText(new Uint8Array(bytes));
    else return { extractionStatus: 'awaiting_spreadsheet_parser', previewLines: [] };
    const previewLines = content.split(/\r?\n/).map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 60);
    const indicatorSuggestions = identifyIndicators(previewLines);
    const candidateLines = indicatorSuggestions.map((item) => item.sourceLine);
    const reviewLines = [...indicatorSuggestions.map((item) => `★ ${item.name}${item.value === null ? '' : ` · ${formatDetectedValue(item.value, item.unit)}`}: ${item.sourceLine}`), ...previewLines.filter((line) => !candidateLines.includes(line))].slice(0, 60);
    return { extractionStatus: previewLines.length ? 'extracted' : 'no_text_found', totalPages, previewLines: reviewLines, candidateLines, indicatorSuggestions, modelText: content };
  } catch { return { extractionStatus: 'extraction_failed', previewLines: [] }; }
}

function extractXlsxText(bytes: Uint8Array) {
  const files = unzipSync(bytes, { filter: (file) => file.name === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/.test(file.name) });
  const sharedXml = files['xl/sharedStrings.xml'] ? strFromU8(files['xl/sharedStrings.xml']) : '';
  const shared = [...sharedXml.matchAll(/<si[\s>][\s\S]*?<\/si>/g)].map((match) => [...match[0].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((part) => decodeXml(part[1])).join(''));
  const rows: string[] = [];
  for (const name of Object.keys(files).filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry)).sort().slice(0, 5)) {
    const xml = strFromU8(files[name]);
    for (const row of xml.matchAll(/<row[\s>][\s\S]*?<\/row>/g)) {
      const values: string[] = [];
      for (const cell of row[0].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
        const type = /\bt="([^"]+)"/.exec(cell[1])?.[1]; const body = cell[2]; const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/.exec(body)?.[1] ?? '';
        const value = type === 's' ? shared[Number(raw)] ?? '' : decodeXml(raw); if (value.trim()) values.push(value.trim());
      }
      if (values.length) rows.push(values.join(' | ')); if (rows.length >= 200) break;
    }
    if (rows.length >= 200) break;
  }
  return rows.join('\n');
}
function decodeXml(value: string) { return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }

const INDICATORS = [
  { key: 'contas', name: 'Crescimento líquido PJ', pattern: /(crescimento.*l[ií]quido.*pj|contas?.*(abert|ativ|l[ií]quid))/i },
  { key: 'cielo', name: 'Faturamento Cielo', pattern: /(cielo|faturamento.*cart[aã]o)/i },
  { key: 'rotativo', name: 'Limite rotativo', pattern: /(limite.*rotativo|rotativo)/i },
  { key: 'risco', name: 'Gestão de risco', pattern: /(gest[aã]o.*risco|qualidade.*cr[eé]dito)/i },
  { key: 'captacao', name: 'Captação líquida PJ', pattern: /(capta[cç][aã]o.*(l[ií]quid|pj)|saldo.*capta[cç][aã]o)/i },
  { key: 'vencidos', name: 'Vencidos', pattern: /(vencid|inadimpl|atraso)/i },
  { key: 'consorcio', name: 'Consórcio', pattern: /cons[oó]rc/i },
  { key: 'seguros', name: 'Seguros', pattern: /(seguro|prote[cç][aã]o)/i },
  { key: 'credito', name: 'Crédito', pattern: /(cr[eé]dito|capital.*giro|bndes)/i },
] as const;

function identifyIndicators(lines: string[]): IndicatorSuggestion[] {
  const found: IndicatorSuggestion[] = [];
  for (const line of lines) for (const indicator of INDICATORS) {
    if (!indicator.pattern.test(line) || found.some((item) => item.key === indicator.key)) continue;
    const detected = detectValue(line); found.push({ key: indicator.key, name: indicator.name, ...detected, confidence: detected.value === null ? 'medium' : 'high', sourceLine: line });
  }
  return found;
}
function detectValue(line: string): Pick<IndicatorSuggestion, 'value' | 'unit'> {
  const percent = /(-?\d{1,3}(?:[.,]\d+)?)\s*%/.exec(line); if (percent) return { value: parsePtNumber(percent[1]), unit: 'percent' };
  const points = /(-?\d+(?:[.,]\d+)?)\s*(?:pts?|pontos?)/i.exec(line); if (points) return { value: parsePtNumber(points[1]), unit: 'points' };
  const money = /R\$\s*([\d.]+(?:,\d+)?)/i.exec(line); if (money) return { value: parsePtNumber(money[1]), unit: 'currency' };
  const number = /(?:^|\s)(-?\d+(?:[.,]\d+)?)(?:\s|$)/.exec(line); return { value: number ? parsePtNumber(number[1]) : null, unit: number ? 'count' : 'unknown' };
}
function parsePtNumber(value: string) { const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value; const number = Number(normalized); return Number.isFinite(number) ? number : null; }
function formatDetectedValue(value: number, unit: IndicatorSuggestion['unit']) { if (unit === 'percent') return `${value}%`; if (unit === 'points') return `${value} pts`; if (unit === 'currency') return `R$ ${value.toLocaleString('pt-BR')}`; return String(value); }
function inferPeriod(lines: string[]) {
  const text = lines.join(' ');
  const month = /(janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)[\s\/]*(20\d{2})/i.exec(text);
  const months: Record<string,string> = {janeiro:'01',fevereiro:'02','marco':'03',abril:'04',maio:'05',junho:'06',julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
  const competence = month ? `${month[2]}-${months[month[1].toLowerCase()] ?? '00'}` : undefined;
  const date = /(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})/.exec(text);
  const baseDate = date ? `${date[3]}-${date[2].padStart(2,'0')}-${date[1].padStart(2,'0')}` : undefined;
  return { competence, baseDate };
}
