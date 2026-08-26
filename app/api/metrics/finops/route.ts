import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const telemetryPath = path.join(process.cwd(), 'test-data', 'finops_telemetry_latest.json');
    
    // Se o arquivo não existir ou estiver desatualizado, rodar o router
    if (!fs.existsSync(telemetryPath)) {
      const scriptPath = path.join(process.cwd(), 'core', 'model_router.py');
      await execFileAsync('python', [scriptPath]);
    }
    
    if (fs.existsSync(telemetryPath)) {
      const data = JSON.parse(fs.readFileSync(telemetryPath, 'utf-8'));
      return NextResponse.json(data);
    }
    
    return NextResponse.json({
      status: 'INITIALIZING',
      message: 'Métricas FinOps em processo de consolidação'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao carregar métricas FinOps', message: error?.message },
      { status: 500 }
    );
  }
}
