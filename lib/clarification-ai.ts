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
