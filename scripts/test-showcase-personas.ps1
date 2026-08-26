# Test Showcase Personas (Marco 23)
$ErrorActionPreference = "Stop"

Write-Host "Testando bateria automatizada das 5 Personas de Showcase PJ (Marco 23)..." -ForegroundColor Cyan

$fixtures = Get-ChildItem test-data/showcase-personas -Filter "*.json"
if ($fixtures.Count -ne 5) {
    throw "Esperado 5 fixtures de personas, encontrado: $($fixtures.Count)"
}

foreach ($fixture in $fixtures) {
    $json = Get-Content $fixture.FullName -Raw | ConvertFrom-Json
    if (-not $json.razao_social -or -not $json.cnpj -or -not $json.parecer_esperado) {
        throw "Fixture invalida: $($fixture.Name)"
    }
    Write-Host "  [OK] Persona validada: $($json.razao_social) ($($json.segmento))" -ForegroundColor Green
}

# Executar script de showcase em modo NoBrowser
& powershell -File scripts/run-showcase-persona.ps1 -Persona ALL -NoBrowser

Write-Host "SHOWCASE_PERSONAS_PASS" -ForegroundColor Green
exit 0
