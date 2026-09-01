import { env } from 'cloudflare:workers';

export type ClarificationQuestion = { id: string; field: string; question: string; indicator?: string; evidence?: string };
export type ClarificationAnswer = { question_id: string; field: string; indicator: string | null; value: number | string | null; unit: string | null; answer: string; confidence: number };

const responseSchema = {
  type: 'object',
  properties: {
    resolved: { type: 'boolean' },
    answers: { type: 'array', items: { type: 'object', properties: {
      question_id: { type: 'string' }, field: { type: 'string' }, indicator: { type: 'string', nullable: true },
      value: { anyOf: [{ type: 'number' }, { type: 'string' }, { type: 'null' }] }, unit: { type: 'string', nullable: true },
      answer: { type: 'string' }, confidence: { type: 'number', minimum: 0, maximum: 1 },
    }, required: ['question_id','field','indicator','value','unit','answer','confidence'] } },
    follow_up: { type: 'array', items: { type: 'string' } },
  }, required: ['resolved','answers','follow_up'],
};

export async function interpretClarification(questions: ClarificationQuestion[], userAnswer: string) {
  if (isContextRequest(userAnswer)) {
    return { resolved: false, answers: [] as ClarificationAnswer[], follow_up: questions.map(formatQuestionWithContext), model: 'deterministic_context_request' };
  }
  // Primeiro tenta uma interpretação determinística para respostas numeradas ou
  // respostas diretas de valor. Isso evita loop quando Rafael responde apenas
  // parte da lista (por exemplo, “Total de pontos 51,04” e “2. 0”).
  const local = parseOwnerAnswerLocally(questions, userAnswer);
  if (local.answers.length) return local;
  if (!env.GEMINI_API_KEY) return { resolved: false, answers: [] as ClarificationAnswer[], follow_up: ['Não consegui interpretar automaticamente. Responda indicando o número de cada pergunta e o valor correto.'], model: 'not_configured' };
  const prompt = [
    'Você estrutura respostas de Rafael para perguntas do Diretor 360.',
    'Não invente valores, não complete silêncio e não use conhecimento externo.',
    'Só marque resolved=true quando todas as perguntas materiais estiverem respondidas com confiança >=0.80.',
    `Perguntas: ${JSON.stringify(questions)}`,
    `Resposta literal de Rafael: ${userAnswer}`,
  ].join('\n\n');
  const models = [...new Set([env.GEMINI_MODEL, 'gemini-3.7-flash', 'gemini-3.5-flash'].filter(Boolean) as string[])];
  for (const model of models) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: model.startsWith('gemini-3.7') ? { temperature: 0, responseFormat: { text: { mimeType: 'application/json', schema: responseSchema } } } : { temperature: 0, responseMimeType: 'application/json', responseSchema } }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) continue;
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
    try {
      const parsed = JSON.parse(raw) as { resolved: boolean; answers: ClarificationAnswer[]; follow_up: string[] };
      const complete = parsed.resolved && parsed.answers.length >= questions.length && parsed.answers.every((answer) => answer.confidence >= 0.8);
      return { ...parsed, resolved: complete, model };
    } catch { continue; }
  }
  return { resolved: false, answers: [] as ClarificationAnswer[], follow_up: ['Não consegui interpretar com segurança. Responda novamente, numerando cada resposta.'], model: 'unavailable' };
}

function parseOwnerAnswerLocally(questions: ClarificationQuestion[], text: string) {
  const answers: ClarificationAnswer[] = [];
  const lines = String(text ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const numbered = line.match(/^(\d+)\s*[.)\-:]\s*(.+)$/);
    let index = numbered ? Number(numbered[1]) - 1 : -1;
    const valueText = numbered?.[2] ?? line;
    if (index < 0 && /total\s+de\s+pontos?/i.test(line)) index = questions.findIndex((q) => /pontos?/i.test(`${q.field} ${q.question}`));
    if (index < 0 || index >= questions.length) continue;
    const question = questions[index];
    const numeric = valueText.replace(/\./g, '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    const expectsNumeric = /(valor|realizado|meta|pontos?|resultado|percentual|atingimento)/i.test(`${question.field} ${question.question}`);
    if (expectsNumeric && !numeric) continue;
    const value: number | string = numeric ? Number(numeric[0]) : valueText;
    if (answers.some((item) => item.question_id === question.id)) continue;
    answers.push({ question_id: question.id, field: question.field, indicator: question.indicator ?? null, value, unit: null, answer: valueText, confidence: 1 });
  }
  const answered = new Set(answers.map((item) => item.question_id));
  const follow_up = questions.filter((q) => !answered.has(q.id)).map(formatQuestionWithContext);
  return { resolved: answers.length === questions.length, answers, follow_up, model: 'deterministic_owner_parser' };
}

function isContextRequest(text: string) {
  const normalized = String(text ?? '').trim().toLowerCase();
  return normalized.includes('?') || /\b(qual|quais|quem|onde|como|não sei|nao sei|não entendi|nao entendi|cortad[oa]|errad[oa]|de novo|não respondeu|nao respondeu)\b/.test(normalized);
}

function formatQuestionWithContext(question: ClarificationQuestion) {
  const indicator = repairMojibake(question.indicator?.trim() ?? '');
  const field = repairMojibake(question.field?.trim() ?? '');
  const label = indicator ? `Indicador: ${indicator}` : field && field !== 'unknown' ? `Campo: ${field}` : 'Indicador não identificado no arquivo';
  const evidence = question.evidence ? ` | Evidência: ${repairMojibake(question.evidence)}` : '';
  return `${label} — ${repairMojibake(question.question)}${evidence}`;
}

export function repairMojibake(value: string) {
  const replacements: Record<string, string> = {
    '├á': 'à', '├í': 'á', '├ó': 'â', '├ú': 'ã', '├º': 'ç', '├®': 'é',
    '├¬': 'ê', '├¡': 'í', '├│': 'ó', '├┤': 'ô', '├Á': 'õ', '├║': 'ú',
    'Ã¡': 'á', 'Ã ': 'à', 'Ã¢': 'â', 'Ã£': 'ã', 'Ã§': 'ç', 'Ã©': 'é',
    'Ãª': 'ê', 'Ã­': 'í', 'Ã³': 'ó', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ãº': 'ú',
  };
  return Object.entries(replacements).reduce((text, [broken, corrected]) => text.split(broken).join(corrected), String(value ?? ''));
}
