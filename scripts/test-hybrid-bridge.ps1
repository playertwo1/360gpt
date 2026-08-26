[CmdletBinding()]
param(
  [Parameter(Mandatory)] [string]$BridgeSecret,
  [string]$BaseUrl = 'https://visao-360-diretor.fael360092.chatgpt.site'
)

$ErrorActionPreference = 'Stop'
if ($BaseUrl -ne 'https://visao-360-diretor.fael360092.chatgpt.site') { throw 'Teste restrito ao site controlado do Diretor 360.' }
if ($BridgeSecret -notmatch '^[0-9a-f]{64}$') { throw 'Segredo da ponte fora do padrão esperado.' }

$testId = "h3-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())-$((Get-Random -Minimum 1000 -Maximum 9999))"
$uri = "$BaseUrl/api/bridge/synthetic-enqueue"
$body = @{ test_id = $testId } | ConvertTo-Json -Compress
$unauthorized = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri $uri -ContentType 'application/json' -Body $body
if ($unauthorized.StatusCode -ne 401) { throw 'Entrada sintética não rejeitou chamada sem segredo.' }

$headers = @{ Authorization = "Bearer $BridgeSecret" }
$created = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri $uri -Headers $headers -ContentType 'application/json' -Body $body
$duplicate = Invoke-WebRequest -SkipHttpErrorCheck -Method Post -Uri $uri -Headers $headers -ContentType 'application/json' -Body $body
$createdBody = $created.Content | ConvertFrom-Json
$duplicateBody = $duplicate.Content | ConvertFrom-Json
if ($created.StatusCode -ne 201 -or $createdBody.duplicate -ne $false) { throw "Falha ao enfileirar caso H3: $($created.Content)" }
if ($duplicate.StatusCode -ne 200 -or $duplicateBody.duplicate -ne $true) { throw 'Entrada sintética repetida não foi deduplicada.' }
if ($createdBody.security.external_effects_allowed -ne $false) { throw 'Contrato de segurança do caso sintético inválido.' }

[pscustomobject]@{
  TestId = $testId
  JobId = $createdBody.job_id
  Unauthorized = $unauthorized.StatusCode
  Created = $created.StatusCode
  DuplicateIgnored = $duplicateBody.duplicate
  ExternalEffectsAllowed = $createdBody.security.external_effects_allowed
} | Format-List
