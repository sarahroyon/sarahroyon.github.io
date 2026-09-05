param([switch]$Check)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$jsonPath = Join-Path $repoRoot 'data\annales\questions-europeennes-2026.json'
$scriptPath = Join-Path $repoRoot 'data\annales\questions-europeennes-2026.js'
$json = [IO.File]::ReadAllText($jsonPath).Trim()
$null = $json | ConvertFrom-Json
# Keep the JSON as the only editable source; generate the file:// companion.
$json = $json.Replace("`r`n", "`n").Replace([string][char]0x2028, '\u2028').Replace([string][char]0x2029, '\u2029')
$output = "// Generated from questions-europeennes-2026.json. Do not edit directly.`n// Update with: powershell -ExecutionPolicy Bypass -File scripts/sync-annales.ps1`nwindow.QcmAnnales = $json;`n"

if ($Check) {
  if (!(Test-Path -LiteralPath $scriptPath) -or [IO.File]::ReadAllText($scriptPath).Replace("`r`n", "`n") -cne $output) {
    throw 'The local annales file is out of date. Run scripts/sync-annales.ps1.'
  }
  Write-Output 'Local annales match the JSON source.'
} else {
  [IO.File]::WriteAllText($scriptPath, $output, [Text.UTF8Encoding]::new($false))
  Write-Output 'Local annales updated from the JSON source.'
}
