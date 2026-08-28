[CmdletBinding()]
param(
  [string]$SourceContainer = 'visao-360-postgres-1',
  [string]$SourceDatabase = 'n8n',
  [string]$SourceUser = 'postgres',
  [string]$Image = 'postgres:17.6-alpine'
)

$ErrorActionPreference = 'Stop'
$target = "diretor360-restore-$([guid]::NewGuid().ToString('N').Substring(0, 12))"
$started = Get-Date

try {
  if (-not (docker ps --format '{{.Names}}' | Select-String -SimpleMatch $SourceContainer)) {
    throw "Source PostgreSQL container not running: $SourceContainer"
  }

  docker run -d --rm --name $target -e POSTGRES_HOST_AUTH_METHOD=trust $Image | Out-Null
  $ready = $false
  for ($attempt = 1; $attempt -le 30; $attempt++) {
    if ((docker exec $target pg_isready -U postgres 2>$null) -match 'accepting connections') { $ready = $true; break }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'Temporary restore database did not become ready.' }

  # The dump is streamed directly to the disposable container and never written to disk.
  docker exec $SourceContainer pg_dump -U $SourceUser -d $SourceDatabase --no-owner --no-privileges |
    docker exec -i $target psql -U postgres -d postgres -v ON_ERROR_STOP=1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Restore stream failed.' }

  $tableCount = (docker exec $target psql -U postgres -d postgres -Atc "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema')").Trim()
  if (-not $tableCount -or [int]$tableCount -lt 1) { throw 'Restored database has no application tables.' }

  $elapsed = [math]::Round(((Get-Date) - $started).TotalSeconds, 2)
  [pscustomobject]@{
    Source = $SourceContainer
    RestoredTables = [int]$tableCount
    DurationSeconds = $elapsed
    RtoTargetSeconds = 900
    Pass = ($elapsed -lt 900)
    DataPersistedToDisk = $false
  } | Format-List
  if ($elapsed -ge 900) { throw "RTO target exceeded: $elapsed seconds." }
  Write-Host 'ISOLATED_POSTGRES_RESTORE_PASS' -ForegroundColor Green
}
finally {
  docker rm -f $target 2>$null | Out-Null
}
