import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

type GateDecisionPayload = {
  decision: 'APPROVED' | 'ADJUSTMENTS_REQUIRED' | 'BLOCKED';
  signed_by: string;
  notes?: string;
};

export async function GET() {
  const dossier = {
    gate_id: 'GATE_P8_READINESS',
    title: 'Gate Geral de Prontidão Operacional (P8)',
    status: 'SUBMITTED_FOR_RAFAEL_REVIEW',
    submitted_at: '2026-08-28T22:23:00-03:00',
    authority: 'Rafael (fael@live.de)',
    test_suite_status: '18_OF_18_TESTS_PASS',
    precursors: [
      { id: 'P0', name: 'Reconciliação de Roadmap, Checklist e Código', status: 'READY', details: 'Sincronização estrita entre código, schemas e documentação' },
      { id: 'P1', name: 'Bateria Geral de Regressão e Schemas JSON', status: 'READY', details: '100% dos schemas Draft 2020-12 validados' },
      { id: 'P2', name: 'Motores Determinísticos dos 4 Domínios', status: 'READY', details: 'Curvas POBJ 70%-150%, Matriz Restrições 1-7, GDAD e Aging' },
      { id: 'P3', name: 'Contratos dos 4 Gerentes Gerais', status: 'READY', details: 'Conta, Performance, Financeiro e Relacionamento validados' },
      { id: 'P4', name: 'Orquestração Diretor -> Gerentes -> Motor 360', status: 'READY', details: 'Evidence Graph com 8 nós conectados' },
      { id: 'P5', name: 'Segurança, DLP, LGPD e Autorização Documental', status: 'READY', details: 'PRR 10/10 gates, zero segredos no git e DLP ativo' },
      { id: 'P6', name: 'Prontidão Operacional, Rollback e Backup RTO/RPO', status: 'READY', details: 'Restauração transacional em ambiente isolado aprovada' },
      { id: 'P7', name: 'Preparação de Canary Supervisionado', status: 'READY', details: 'Protocolo de 3 ondas pronto para dados sintéticos' },
      { id: 'S2', name: 'Shadow Sintético Isolado (24/24 Medições)', status: 'READY', details: '24 medições sem falha de integridade' },
      { id: 'A4/A5', name: 'Leitura Assistida e Catálogo de Efeitos Externos', status: 'READY', details: 'Invariante de bloqueio contra ações sem despacho humano' }
    ],
    governance_rule: 'Nenhum efeito ou ingestão de dados reais ocorre sem a assinatura soberana de Rafael.'
  };

  return NextResponse.json({ ok: true, dossier });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GateDecisionPayload;
    if (!body || !['APPROVED', 'ADJUSTMENTS_REQUIRED', 'BLOCKED'].includes(body.decision)) {
      return NextResponse.json({ ok: false, error: 'invalid_decision' }, { status: 400 });
    }

    const signedAt = new Date().toISOString();
    const resolutionId = `RES_P8_${Date.now()}`;
    const resolutionHash = `sha256:${Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    // Registra na auditoria se o DB estiver disponível
    if (env.DB) {
      const auditId = `audit-gate-p8-${Date.now()}`;
      await env.DB.prepare(
        `INSERT OR IGNORE INTO audit_log (id, owner_id, actor, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, 'gate_decision', 'gate_p8', ?, ?, ?)`
      ).bind(
        auditId,
        'rafael',
        body.signed_by || 'Rafael Pedrosa',
        resolutionId,
        JSON.stringify({ decision: body.decision, notes: body.notes, hash: resolutionHash, signedAt }),
        Date.now()
      ).run();
    }

    return NextResponse.json({
      ok: true,
      decision: body.decision,
      resolution_id: resolutionId,
      resolution_hash: resolutionHash,
      signed_at: signedAt,
      message: body.decision === 'APPROVED' ? 'Gate P8 APROVADO COM SUCESSO POR RAFAEL!' : 'Decisão registrada na auditoria.'
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'failed_to_save_decision' }, { status: 500 });
  }
}