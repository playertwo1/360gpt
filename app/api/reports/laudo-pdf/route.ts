import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('case_id') || 'case-01-ind-metalurgica-regular';
    
    // Validar caseId sanitizado contra path traversal
    const safeCaseId = caseId.replace(/[^a-zA-Z0-9_-]/g, '');
    const casePath = path.join(process.cwd(), 'test-data', 'evals', 'cases', `${safeCaseId}.json`);
    
    if (!fs.existsSync(casePath)) {
      return NextResponse.json(
        { error: 'Caso PJ não encontrado', caseId: safeCaseId },
        { status: 404 }
      );
    }
    
    const tempPdfPath = path.join(process.cwd(), 'test-data', `laudo_${safeCaseId}.pdf`);
    const scriptPath = path.join(process.cwd(), 'core', 'pdf_report_generator.py');
    
    // Executar gerador determinístico em Python
    await execFileAsync('python', [scriptPath, casePath, tempPdfPath]);
    
    if (!fs.existsSync(tempPdfPath)) {
      return NextResponse.json(
        { error: 'Falha na geração do arquivo PDF' },
        { status: 500 }
      );
    }
    
    const fileBuffer = fs.readFileSync(tempPdfPath);
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laudo_executivo_360_${safeCaseId}.pdf"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno ao emitir laudo PDF', message: error?.message },
      { status: 500 }
    );
  }
}
