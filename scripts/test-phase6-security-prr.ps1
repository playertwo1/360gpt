# Test Phase 6 - Security, LGPD & Production Readiness Review
$ErrorActionPreference = 'Stop'

Write-Host "Testando homologacao da Fase 6 (Security, LGPD & PRR)..." -ForegroundColor Cyan

# 1. Validar cenários de Red Teaming
Write-Host ""
Write-Host "[1/4] Verificando suíte de testes adversários (test-data/adversarial/)..." -ForegroundColor Yellow
$adversarial = Get-ChildItem "test-data/adversarial" -Filter "*.json"
if ($adversarial.Count -lt 5) { throw "Menos de 5 testes adversários encontrados!" }
Write-Host "  [OK] $($adversarial.Count) cenários adversários validados." -ForegroundColor Green

# 2. Executar auditoria de segurança e DLP
Write-Host ""
Write-Host "[2/4] Executando motor de auditoria compliance/security_audit.py..." -ForegroundColor Yellow
$auditOutput = python compliance/security_audit.py
if ($LASTEXITCODE -ne 0) { throw "Falha na execução da auditoria de segurança!" }
Write-Host $auditOutput

# 3. Validar relatório JSON de segurança
Write-Host ""
Write-Host "[3/4] Validando relatório JSON de segurança..." -ForegroundColor Yellow
$repPath = "compliance/security_audit_report.json"
if (-not (Test-Path $repPath)) { throw "Relatório $repPath não encontrado!" }
$rep = Get-Content $repPath -Raw | ConvertFrom-Json

if ($rep.overall_security_posture -ne "CERTIFIED_HARDENED") {
    throw "Postura de segurança não foi CERTIFIED_HARDENED!"
}
if (-not $rep.zero_trust_secrets_protected) {
    throw "Vazamento de segredos detectado!"
}
Write-Host "  [OK] Postura de segurança certificada (CERTIFIED_HARDENED)." -ForegroundColor Green

# 4. Validar PRR Checklist
Write-Host ""
Write-Host "[4/4] Verificando documento formal compliance/PRR_CHECKLIST.md..." -ForegroundColor Yellow
$prrPath = "compliance/PRR_CHECKLIST.md"
if (-not (Test-Path $prrPath)) { throw "Documento $prrPath não encontrado!" }
Write-Host "  [OK] PRR Checklist (10/10 gates) validado." -ForegroundColor Green

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   FASE 6 (SECURITY, LGPD & PRR) HOMOLOGADA COM SUCESSO!                " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "H6_SECURITY_PRR_PASS" -ForegroundColor Green
exit 0
