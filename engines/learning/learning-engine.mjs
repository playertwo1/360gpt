/**
 * Learning Engine deterministico — quinta remediacao.
 * O JS classifica candidatos, mas NAO autentica Rafael e NAO e a autoridade final de promocao.
 * OWNER_EXPLICIT so pode ser concluido pela funcao PostgreSQL owner_promote_candidate,
 * que consulta o evento Telegram imutavel, allowlist, tenant, comando, hash e consumo unico.
 */
import { createHash } from 'node:crypto';

export const PROMOTION_POLICY_VERSION = 'v2.3.2-db-authoritative';
export const RISK_LEVELS = { LOW:'LOW', MEDIUM:'MEDIUM', HIGH:'HIGH' };
export const PROMOTION_MODES = { AUTO:'AUTO', OWNER_EXPLICIT:'OWNER_EXPLICIT', MANUAL_REVIEW:'MANUAL_REVIEW' };

export const STRUCTURED_PREFERENCES = {
  RESPONSE_LENGTH: new Set(['COMPACT','BALANCED','DETAILED']),
  TABLE_PREFERENCE: new Set(['TABLE_FIRST','TEXT_FIRST']),
  TONE: new Set(['DIRECT','EXECUTIVE','EXPLANATORY']),
  SECTION_ORDER: new Set(['PERFORMANCE_FIRST','ACCOUNT_FIRST','GAPS_FIRST'])
};

export const PREFERENCE_TEMPLATES = {
  'RESPONSE_LENGTH:COMPACT':'Apresentar respostas e pareceres em formato compacto e direto ao ponto.',
  'RESPONSE_LENGTH:BALANCED':'Apresentar respostas em formato equilibrado com resumo executivo e métricas principais.',
  'RESPONSE_LENGTH:DETAILED':'Apresentar respostas detalhadas com todas as evidências e tabelas completas.',
  'TABLE_PREFERENCE:TABLE_FIRST':'Exibir dados quantitativos e tabelas antes de explicações textuais.',
  'TABLE_PREFERENCE:TEXT_FIRST':'Exibir síntese executiva textual antes das tabelas de apoio.',
  'TONE:DIRECT':'Utilizar tom executivo direto, claro e sem rodeios.',
  'TONE:EXECUTIVE':'Utilizar tom formal executivo focado em decisões de gestão.',
  'TONE:EXPLANATORY':'Utilizar tom didático e explicativo com fundamentação analítica.',
  'SECTION_ORDER:PERFORMANCE_FIRST':'Organizar parecer destacando indicadores e metas de Performance primeiro.',
  'SECTION_ORDER:ACCOUNT_FIRST':'Organizar parecer destacando contas e oportunidades prioritárias primeiro.',
  'SECTION_ORDER:GAPS_FIRST':'Organizar parecer destacando lacunas críticas e pontos a recuperar primeiro.'
};

export function renderStructuredPreferenceText(type,value){
  const text=PREFERENCE_TEMPLATES[`${type}:${value}`];
  if(!text) throw new Error(`PREFERENCIA_ESTRUTURADA_INVALIDA: ${type}:${value}`);
  return text;
}

export function calculateLearningScore({confidence=.85,frequency=1,recencyDays=0,observedOutcome=.8,explicitFeedback=1,hasConflict=false,sampleSize=5,layoutChanged=false,scope='DOMAIN',riskLevel=RISK_LEVELS.LOW}){
  const frequencyWeight=Math.min(1.5,.7+(Math.log2(Math.max(1,frequency))*.3));
  const recencyWeight=Math.max(.5,Math.exp(-.015*Math.max(0,recencyDays)));
  const outcomeWeight=Math.max(.2,Math.min(1,observedOutcome));
  const feedbackWeight=Math.max(.1,Math.min(2.5,explicitFeedback));
  let score=confidence*frequencyWeight*recencyWeight*outcomeWeight*feedbackWeight;
  if(hasConflict) score-=.40;
  if(sampleSize<3) score-=.20;
  if(layoutChanged) score-=.25;
  if(scope==='GLOBAL') score-=.35;
  if(riskLevel===RISK_LEVELS.HIGH) score-=.40;
  return Number(Math.max(0,Math.min(1,score)).toFixed(3));
}

export function evaluateCandidateRule({rule,frequency=1,recencyDays=0,observedOutcome=.85,explicitFeedback=1,hasConflict=false,sampleSize=5,layoutChanged=false,ownerEvent=null}){
  const riskLevel=determineRiskLevel(rule);
  const scope=String(rule.scope||'DOMAIN').toUpperCase().trim();
  const score=calculateLearningScore({confidence:Number(rule.confidence_score||.85),frequency,recencyDays,observedOutcome,explicitFeedback,hasConflict,sampleSize,layoutChanged,scope,riskLevel});

  if(hasConflict) return decision(false,PROMOTION_MODES.MANUAL_REVIEW,score,RISK_LEVELS.HIGH,'Conflito com outra diretriz ativa');

  // Importante: ownerEvent vindo do processo nao e prova de autenticacao.
  // Mesmo feedback explicito deve ser encaminhado ao PostgreSQL para verificacao soberana.
  if(explicitFeedback>=1.5 && ownerEvent?.source_event_id){
    return {
      ...decision(false,PROMOTION_MODES.OWNER_EXPLICIT,score,riskLevel,'Aguardando verificacao PostgreSQL do evento soberano real'),
      requires_db_owner_verification:true,
      source_event_id:String(ownerEvent.source_event_id)
    };
  }

  if(riskLevel===RISK_LEVELS.HIGH || scope==='GLOBAL')
    return decision(false,PROMOTION_MODES.MANUAL_REVIEW,score,RISK_LEVELS.HIGH,scope==='GLOBAL'?'Escopo global exige aprovacao soberana verificavel':'Risco elevado exige revisao manual');

  const type=rule.preference_type,value=rule.preference_value;
  const structured=Boolean(type&&STRUCTURED_PREFERENCES[type]?.has(value));
  if(!structured) return decision(false,PROMOTION_MODES.MANUAL_REVIEW,score,RISK_LEVELS.HIGH,'AUTO aceita somente preferencia estruturada enumerada');

  if(riskLevel===RISK_LEVELS.LOW && score>=.75 && frequency>=2 && !layoutChanged){
    return {...decision(true,PROMOTION_MODES.AUTO,score,RISK_LEVELS.LOW,'Candidato elegivel; PostgreSQL deve revalidar todos os invariantes'),canonical_rule_text:renderStructuredPreferenceText(type,value),requires_db_revalidation:true};
  }
  return decision(false,score>=.50?PROMOTION_MODES.MANUAL_REVIEW:'REJECTED_LOW_SCORE',score,riskLevel,score>=.50?'Aguardando recorrencia ou validacao':'Score insuficiente');
}

function decision(eligible,promotion_mode,score,riskLevel,reason){return {eligible_for_auto:eligible,promotion_mode,score,riskLevel,reason,policy_version:PROMOTION_POLICY_VERSION};}

export function determineRiskLevel(rule){
  const text=String(rule.learned_rule||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const category=String(rule.category||'').toLowerCase();
  const scope=String(rule.scope||'').toUpperCase().trim();
  const patterns=[/credito/,/limite/,/taxa/,/juros/,/spread/,/desconto/,/margem/,/alvanc/,/compliance/,/legal/,/juridico/,/sigilo/,/privacidade/,/lgpd/,/retencao/,/nunca apague/,/guarde.*sempre/,/nao apagar/,/etern/,/formula/,/pobj/,/pontuacao/,/oficial/,/normativ/,/autorizacao/,/permissao/,/acesso/,/credencial/,/token/,/segredo/,/chave/,/api key/,/alcada/,/irrestrita/,/qualquer pessoa/,/sem autorizacao/,/efeito externo/,/mensagem.*cliente/,/envie.*automaticamente/,/sem me perguntar/,/whatsapp/,/disparo/,/dispensar/,/sem analise/,/bypass/];
  if(patterns.some(p=>p.test(text)||p.test(category))||scope==='GLOBAL') return RISK_LEVELS.HIGH;
  if(rule.preference_type&&STRUCTURED_PREFERENCES[rule.preference_type]?.has(rule.preference_value)) return RISK_LEVELS.LOW;
  return RISK_LEVELS.HIGH;
}

export function sha256Hex(data){return createHash('sha256').update(typeof data==='string'?data:JSON.stringify(data),'utf8').digest('hex');}

/**
 * Validação delegada ao PostgreSQL (validate_rafael_approval_event).
 * O JS nunca decide sozinho o que é autenticado.
 */
export async function isAuthenticatedRafaelApproval(db, { eventId, ownerId = 'rafael', tenantId, rawPayload = null }) {
  if (!db || !eventId) return false;
  try {
    const result = await db.query(
      `SELECT validate_rafael_approval_event($1::text, $2::text, $3::text, '/aprovardiretriz', $4::text) AS ok`,
      [String(eventId), String(ownerId), String(tenantId), rawPayload ? String(rawPayload) : null]
    );
    return result.rows?.[0]?.ok === true;
  } catch (_err) {
    return false;
  }
}
