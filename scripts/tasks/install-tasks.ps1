$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path
$tasksDir = Join-Path $repoRoot "scripts\\tasks"

Write-Host "RepoRoot=$repoRoot"

$defs = @(
  @{ Name = "H2H - Sync Wins"; Xml = Join-Path $tasksDir "H2H-SyncWins.xml" },
  @{ Name = "H2H - Sync Timeline"; Xml = Join-Path $tasksDir "H2H-SyncTimeline.xml" },
  @{ Name = "H2H - Realtime Poll"; Xml = Join-Path $tasksDir "H2H-RealtimePoll.xml" }
)

foreach ($d in $defs) {
  if (-not (Test-Path -LiteralPath $d.Xml)) {
    throw "Missing task XML: $($d.Xml)"
  }
}

foreach ($d in $defs) {
  Write-Host "Installing task: $($d.Name)"
  schtasks.exe /Create /F /TN $d.Name /XML $d.Xml | Out-Host
}

Write-Host "Done. Logs will be written to: $repoRoot\\.tmp\\task-logs"

