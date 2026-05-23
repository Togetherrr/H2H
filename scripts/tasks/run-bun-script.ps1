$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory = $true)]
  [string]$RepoRoot,

  [Parameter(Mandatory = $true)]
  [string]$BunArgs,

  [Parameter(Mandatory = $false)]
  [string]$LogName = "task"
)

if (-not (Test-Path -LiteralPath $RepoRoot)) {
  throw "RepoRoot not found: $RepoRoot"
}

$logDir = Join-Path $RepoRoot ".tmp\\task-logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir "$LogName-$ts.log"

Push-Location $RepoRoot
try {
  "=== $(Get-Date -Format o) ===" | Out-File -FilePath $logPath -Encoding utf8
  "PWD=$RepoRoot" | Out-File -FilePath $logPath -Encoding utf8 -Append
  "CMD=bun $BunArgs" | Out-File -FilePath $logPath -Encoding utf8 -Append
  "" | Out-File -FilePath $logPath -Encoding utf8 -Append

  $p = Start-Process -FilePath "bun" -ArgumentList $BunArgs -NoNewWindow -PassThru -Wait `
    -RedirectStandardOutput $logPath -RedirectStandardError $logPath

  exit $p.ExitCode
} finally {
  Pop-Location
}

