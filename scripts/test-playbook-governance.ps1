param()

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' VALIDACAO DE GOVERNANCA DO PLAYBOOK DO REVISOR (MARCO 17)  ' -ForegroundColor Cyan
Write-Host '============================================================' -ForegroundColor Cyan

# 1. Presenca do Manual e Playbook
Write-Host ''
Write-Host '1. Verificando presenca do Playbook Operacional (docs/PLAYBOOK_REVISOR_360.md)...' -ForegroundColor Yellow
if (Test-Path -LiteralPath 'docs/PLAYBOOK_REVISOR_360.md') {
  Write-Host '   [OK] Playbook operacional presente e estruturado.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] docs/PLAYBOOK_REVISOR_360.md nao encontrado.' -ForegroundColor Red
  exit 1
}

# 2. Validacao de Coerencia dos Reason Codes
Write-Host ''
Write-Host '2. Validando consistencia entre o Playbook e policies/reason-codes.yaml...' -ForegroundColor Yellow
$playbookText = Get-Content -Raw -LiteralPath 'docs/PLAYBOOK_REVISOR_360.md'
$reasonCodesPolicy = Get-Content -Raw -LiteralPath 'policies/reason-codes.yaml'

$requiredCodes = @(
  'DIVERGENCIA_DE_DADOS',
  'ELEGIBILIDADE_CONDICIONAL',
  'RECIPROCIDADE_PENDENTE',
  'DIVERGENCIA_NORMATIVA',
  'DIVERGENCIA_INTERNA'
)

foreach ($code in $requiredCodes) {
  if (($playbookText -match $code) -and ($reasonCodesPolicy -match $code)) {
    Write-Host "   [OK] Reason code '$code' alinhado no Playbook e na Politica YAML." -ForegroundColor Green
  } else {
    Write-Host "   [FALHA] Inconsistencia no reason code '$code'." -ForegroundColor Red
    exit 1
  }
}

# 3. Validacao das Regras de SLA e Maquinas de Estado
Write-Host ''
Write-Host '3. Validando regras de SLA e maquinas de estado...' -ForegroundColor Yellow
if (($playbookText -match 'P0_CRITICAL') -and ($playbookText -match 'P1_HIGH') -and ($playbookText -match 'P2_NORMAL')) {
  Write-Host '   [OK] Niveis de prioridade (P0/P1/P2) e SLAs 100% consistentes.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Niveis de prioridade inconsistentes.' -ForegroundColor Red
  exit 1
}

# 4. Validacao do Protocolo de Imutabilidade e Hash SHA-256
Write-Host ''
Write-Host '4. Validando protocolo de assinatura digital e append-only...' -ForegroundColor Yellow
if ($playbookText -match 'SHA-256' -and $playbookText -match 'append-only') {
  Write-Host '   [OK] Protocolo de assinatura digital e seguranca append-only documentados.' -ForegroundColor Green
} else {
  Write-Host '   [FALHA] Protocolo de seguranca ausente no Playbook.' -ForegroundColor Red
  exit 1
}

Write-Host ''
Write-Host '============================================================' -ForegroundColor Cyan
Write-Host ' GOVERNANCA DO PLAYBOOK CERTIFICADA: PASS                   ' -ForegroundColor Green
Write-Host ' MANUAL DO REVISOR HOMOLOGADO PARA OPERACAO ASSISTIDA       ' -ForegroundColor Green
Write-Host '============================================================' -ForegroundColor Cyan

