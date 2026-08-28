[CmdletBinding()]
param(
  [Parameter(Mandatory)] [string]$BridgeSecret,
  [string]$BaseUrl = 'https://visao-360-diretor.fael360092.chatgpt.site'
)

$ErrorActionPreference = 'Stop'
if ($BaseUrl -ne 'https://visao-360-diretor.fael360092.chatgpt.site') { throw 'Teste restrito ao site controlado do Diretor 360.' }
if ($BridgeSecret -notmatch '^[0-9a-f]{64}$') { throw 'Segredo da ponte fora do padrão esperado.' }

function Invoke-CompatibleWebRequest {
  param(
    [Parameter(Mandatory)] [string]$Uri,
    [hashtable]$Headers = @{},
    [Parameter(Mandatory)] [string]$Body
  )

  try {
    return Invoke-WebRequest -UseBasicParsing -Method Post -Uri $Uri -Headers $Headers `
      -ContentType 'application/json' -Body $Body -ErrorAction Stop
  } catch {
    $response = $_.Exception.Response
    if ($null -eq $response) { throw }
    return [pscustomobject]@{
      StatusCode = [int]$response.StatusCode
      Content = ''
    }
  }
}

$testId = "h3-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())-$((Get-Random -Minimum 1000 -Maximum 9999))"
$uri = "$BaseUrl/api/bridge/synthetic-enqueue"
$body = @{ test_id = $testId } | ConvertTo-Json -Compress
$unauthorized = Invoke-CompatibleWebRequest -Uri $uri -Body $body
if ($unauthorized.StatusCode -ne 401) { throw 'Entrada sintética não rejeitou chamada sem segredo.' }

$headers = @{ Authorization = "Bearer $BridgeSecret" }
$created = Invoke-CompatibleWebRequest -Uri $uri -Headers $headers -Body $body
$duplicate = Invoke-CompatibleWebRequest -Uri $uri -Headers $headers -Body $body
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
