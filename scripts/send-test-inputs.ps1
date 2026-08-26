[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$endpoint = 'http://localhost:5678/webhook/visao-360/offline-test-input'
$headers = @{ 'X-Visao360-Test-Mode' = 'OFFLINE_EVAL' }
$pdfPath = Join-Path $projectRoot 'output\pdf\empresa-demo-relatorio.pdf'
$xlsxPath = Join-Path $projectRoot 'output\xlsx\empresa-demo-metricas.xlsx'
$jsonPath = Join-Path $projectRoot 'test-data\entrada-empresa-demo.json'

function Send-TestFile {
  param(
    [Parameter(Mandatory)] [string]$Path,
    [Parameter(Mandatory)] [string]$SourceEventId,
    [Parameter(Mandatory)] [string]$Text,
    [Parameter(Mandatory)] [string]$MimeType
  )

  $rawResponse = & curl.exe --silent --show-error --fail-with-body `
    -X POST $endpoint `
    -H 'X-Visao360-Test-Mode: OFFLINE_EVAL' `
    -F 'tenant_id=tenant-demo' `
    -F "source_event_id=$SourceEventId" `
    -F 'actor_id=rafael-demo' `
    -F 'subject_ref=cust-demo-001' `
    -F 'purpose=offline_evaluation' `
    -F 'data_classification=INTERNAL' `
    -F "text=$Text" `
    -F "file=@$Path;type=$MimeType"

  if ($LASTEXITCODE -ne 0) { throw "Falha ao enviar $Path" }
  return $rawResponse | ConvertFrom-Json
}

foreach ($path in @($pdfPath, $xlsxPath, $jsonPath)) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Arquivo de teste ausente: $path" }
}

$textBody = @{
  tenant_id = 'tenant-demo'
  source_event_id = 'text-demo-001'
  actor_id = 'rafael-demo'
  subject_ref = 'cust-demo-001'
  purpose = 'offline_evaluation'
  data_classification = 'INTERNAL'
  text = 'Preparar visão 360 da empresa demonstrativa com foco em meta, rentabilidade e compromisso de retorno.'
} | ConvertTo-Json

$textResponse = Invoke-RestMethod -Method Post -Uri $endpoint -Headers $headers -ContentType 'application/json' -Body $textBody
$pdfResponse = Send-TestFile -Path $pdfPath -SourceEventId 'pdf-demo-002' `
  -Text 'Analisar documento da empresa demonstrativa para visao 360 completa.' `
  -MimeType 'application/pdf'
$xlsxResponse = Send-TestFile -Path $xlsxPath -SourceEventId 'xlsx-demo-002' `
  -Text 'Analisar planilha de metricas demonstrativas para visao 360.' `
  -MimeType 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
$jsonResponse = Send-TestFile -Path $jsonPath -SourceEventId 'file-json-demo-002' `
  -Text 'Analisar arquivo estruturado de meta, rentabilidade e relacionamento.' `
  -MimeType 'application/json'

$expectedPdfHash = (Get-FileHash -LiteralPath $pdfPath -Algorithm SHA256).Hash.ToLowerInvariant()
$expectedXlsxHash = (Get-FileHash -LiteralPath $xlsxPath -Algorithm SHA256).Hash.ToLowerInvariant()
$expectedJsonHash = (Get-FileHash -LiteralPath $jsonPath -Algorithm SHA256).Hash.ToLowerInvariant()
if ($pdfResponse.input_summary.file_count -ne 1 -or $pdfResponse.input_summary.files[0].sha256 -ne $expectedPdfHash) {
  throw 'A validação de quantidade ou hash do PDF falhou.'
}
if ($xlsxResponse.input_summary.file_count -ne 1 -or $xlsxResponse.input_summary.files[0].sha256 -ne $expectedXlsxHash) {
  throw 'A validação de quantidade ou hash do XLSX falhou.'
}
if ($jsonResponse.input_summary.file_count -ne 1 -or $jsonResponse.input_summary.files[0].sha256 -ne $expectedJsonHash) {
  throw 'A validação de quantidade ou hash do JSON falhou.'
}

[pscustomobject]@{
  Test = 'texto'
  Accepted = $textResponse.accepted
  Status = $textResponse.execution_status
  Files = $textResponse.input_summary.file_count
  CorrelationId = $textResponse.correlation_id
  InputHash = $textResponse.input_hash
} | Format-List

[pscustomobject]@{
  Test = 'pdf'
  Accepted = $pdfResponse.accepted
  Status = $pdfResponse.execution_status
  Files = $pdfResponse.input_summary.file_count
  FileHash = $pdfResponse.input_summary.files[0].sha256
  CorrelationId = $pdfResponse.correlation_id
} | Format-List

[pscustomobject]@{
  Test = 'xlsx'
  Accepted = $xlsxResponse.accepted
  Status = $xlsxResponse.execution_status
  Files = $xlsxResponse.input_summary.file_count
  FileHash = $xlsxResponse.input_summary.files[0].sha256
  CorrelationId = $xlsxResponse.correlation_id
} | Format-List

[pscustomobject]@{
  Test = 'json'
  Accepted = $jsonResponse.accepted
  Status = $jsonResponse.execution_status
  Files = $jsonResponse.input_summary.file_count
  FileHash = $jsonResponse.input_summary.files[0].sha256
  CorrelationId = $jsonResponse.correlation_id
} | Format-List
