import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const telemetryPath = path.join(process.cwd(), 'test-data', 'canary_telemetry_latest.json');
    
    // Se o arquivo não existir, rodar o monitor
    if (!fs.existsSync(telemetryPath)) {
      const scriptPath = path.join(process.cwd(), 'core', 'canary_monitor.py');
      await execFileAsync('python', [scriptPath]);
    }
    
    if (fs.existsSync(telemetryPath)) {
      const data = JSON.parse(fs.readFileSync(telemetryPath, 'utf-8'));
      return NextResponse.json(data);
    }
    
    return NextResponse.json({
      status: 'INITIALIZING',
      message: 'Métricas da esteira Canary em processo de consolidação'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao carregar telemetria Canary', message: error?.message },
      { status: 500 }
    );
  }
}
