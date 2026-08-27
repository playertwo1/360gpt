import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { getChatGPTUser, isDashboardUserAllowed } from '../../chatgpt-auth';

const execFileAsync = promisify(execFile);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    if (!isDashboardUserAllowed(user)) return NextResponse.json({ error: 'access_denied' }, { status: 403 });

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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Erro ao carregar telemetria Canary', message: error instanceof Error ? error.message : 'unknown_error' },
      { status: 500 }
    );
  }
}
